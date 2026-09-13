import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedInitialData } from '@/lib/db/seed';
import { getCurrentUser, getOrCreateDemoUser } from '@/lib/auth';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const db = getDb();
  seedInitialData();

  let user = await getCurrentUser();
  if (!user) {
    user = getOrCreateDemoUser();
  }

  try {
    let testsQuery = '';
    let params: any[] = [];

    if (user.role === 'superadmin') {
      // Superadmin sees all tests across the platform with creator details
      testsQuery = `
        SELECT 
          t.*,
          u.name as created_by_name,
          u.role as created_by_role,
          COUNT(DISTINCT q.id) as question_count,
          COUNT(DISTINCT a.id) as attempts_count,
          MAX(a.final_score) as best_score,
          MAX(a.created_at) as last_attempted_at
        FROM tests t
        LEFT JOIN users u ON u.id = t.user_id
        LEFT JOIN questions q ON q.test_id = t.id
        LEFT JOIN test_attempts a ON a.test_id = t.id AND a.status = 'completed'
        GROUP BY t.id
        ORDER BY t.created_at DESC
      `;
    } else if (user.role === 'admin') {
      // Admin sees their own tests, plus attempts made by students
      testsQuery = `
        SELECT 
          t.*,
          u.name as created_by_name,
          u.role as created_by_role,
          COUNT(DISTINCT q.id) as question_count,
          COUNT(DISTINCT a.id) as attempts_count,
          MAX(a.final_score) as best_score,
          MAX(a.created_at) as last_attempted_at
        FROM tests t
        LEFT JOIN users u ON u.id = t.user_id
        LEFT JOIN questions q ON q.test_id = t.id
        LEFT JOIN test_attempts a ON a.test_id = t.id AND a.status = 'completed'
        WHERE t.user_id = ?
        GROUP BY t.id
        ORDER BY t.created_at DESC
      `;
      params = [user.id];
    } else {
      // Student sees their own self-created practice tests + official mocks created by admins/superadmins
      testsQuery = `
        SELECT 
          t.*,
          u.name as created_by_name,
          u.role as created_by_role,
          COUNT(DISTINCT q.id) as question_count,
          COUNT(DISTINCT a.id) as attempts_count,
          MAX(CASE WHEN a.user_id = ? THEN a.final_score ELSE NULL END) as best_score,
          MAX(CASE WHEN a.user_id = ? THEN a.created_at ELSE NULL END) as last_attempted_at
        FROM tests t
        LEFT JOIN users u ON u.id = t.user_id
        LEFT JOIN questions q ON q.test_id = t.id
        LEFT JOIN test_attempts a ON a.test_id = t.id AND a.status = 'completed'
        WHERE t.user_id = ? OR u.role IN ('admin', 'superadmin')
        GROUP BY t.id
        ORDER BY t.created_at DESC
      `;
      params = [user.id, user.id, user.id];
    }

    const testsStmt = db.prepare(testsQuery);
    const tests = testsStmt.all(...params) as any[];

    // For each test, get attempts (filtered by user if student, or all student attempts if admin/superadmin)
    let attemptsQuery = `
      SELECT a.id, a.test_id, a.user_id, u.name as student_name, a.started_at, a.submitted_at, 
             a.time_taken_seconds, a.final_score, a.maximum_marks, a.percentage, a.accuracy, a.status, a.created_at
      FROM test_attempts a
      LEFT JOIN users u ON u.id = a.user_id
      WHERE a.test_id = ? ${user.role === 'student' ? 'AND a.user_id = ?' : ''}
      ORDER BY a.created_at DESC
      LIMIT 10
    `;
    const attemptsStmt = db.prepare(attemptsQuery);

    const enrichedTests = tests.map(test => {
      const attParams = user.role === 'student' ? [test.id, user.id] : [test.id];
      const attempts = attemptsStmt.all(...attParams) as any[];
      return {
        ...test,
        shuffle_questions: Boolean(test.shuffle_questions),
        shuffle_options: Boolean(test.shuffle_options),
        allow_navigation: Boolean(test.allow_navigation),
        show_palette: Boolean(test.show_palette),
        allow_review_marking: Boolean(test.allow_review_marking),
        show_immediate_results: Boolean(test.show_immediate_results),
        attempts,
      };
    });

    // Compute overall user dashboard stats
    let statsQuery = '';
    let statsParams: any[] = [];
    if (user.role === 'superadmin') {
      statsQuery = `
        SELECT 
          COUNT(*) as total_attempts,
          AVG(percentage) as avg_score,
          MAX(percentage) as best_pct,
          SUM(time_taken_seconds) as total_time_spent
        FROM test_attempts
        WHERE status = 'completed'
      `;
    } else if (user.role === 'admin') {
      statsQuery = `
        SELECT 
          COUNT(DISTINCT a.id) as total_attempts,
          AVG(a.percentage) as avg_score,
          MAX(a.percentage) as best_pct,
          SUM(a.time_taken_seconds) as total_time_spent
        FROM test_attempts a
        JOIN tests t ON t.id = a.test_id
        WHERE t.user_id = ? AND a.status = 'completed'
      `;
      statsParams = [user.id];
    } else {
      statsQuery = `
        SELECT 
          COUNT(*) as total_attempts,
          AVG(percentage) as avg_score,
          MAX(percentage) as best_pct,
          SUM(time_taken_seconds) as total_time_spent
        FROM test_attempts
        WHERE user_id = ? AND status = 'completed'
      `;
      statsParams = [user.id];
    }

    const totalAttemptsStmt = db.prepare(statsQuery);
    const stats = totalAttemptsStmt.get(...statsParams) as any;

    return NextResponse.json({
      tests: enrichedTests,
      stats: {
        totalTests: enrichedTests.length,
        totalAttempts: stats?.total_attempts || 0,
        averageScore: Math.round((stats?.avg_score || 0) * 10) / 10,
        bestScore: Math.round((stats?.best_pct || 0) * 10) / 10,
        totalTimeSpent: stats?.total_time_spent || 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch tests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const db = getDb();
  seedInitialData();

  let user = await getCurrentUser();
  if (!user) {
    user = getOrCreateDemoUser();
  }

  try {
    const body = await req.json();
    const {
      title,
      description = '',
      subject = 'General',
      section_id = null,
      duration_seconds = 1800,
      marking_scheme_type = 'standard',
      default_correct_marks = 4.0,
      default_negative_marks = 1.0,
      default_unanswered_marks = 0.0,
      shuffle_questions = false,
      shuffle_options = false,
      allow_navigation = true,
      show_palette = true,
      allow_review_marking = true,
      show_immediate_results = true,
      questions = [],
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Test title is required' }, { status: 400 });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'At least 1 question is required' }, { status: 400 });
    }

    const testId = crypto.randomUUID();
    const now = new Date().toISOString();

    const insertTest = db.prepare(`
      INSERT INTO tests (
        id, user_id, title, description, subject, section_id, duration_seconds,
        marking_scheme_type, default_correct_marks, default_negative_marks, default_unanswered_marks,
        shuffle_questions, shuffle_options, allow_navigation, show_palette, allow_review_marking, show_immediate_results,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertTest.run(
      testId,
      user.id,
      title.trim(),
      description.trim(),
      subject.trim(),
      section_id || null,
      Number(duration_seconds),
      marking_scheme_type,
      Number(default_correct_marks),
      Number(default_negative_marks),
      Number(default_unanswered_marks),
      shuffle_questions ? 1 : 0,
      shuffle_options ? 1 : 0,
      allow_navigation ? 1 : 0,
      show_palette ? 1 : 0,
      allow_review_marking ? 1 : 0,
      show_immediate_results ? 1 : 0,
      now,
      now
    );

    const insertQ = db.prepare(`
      INSERT INTO questions (
        id, test_id, question_number, question_text, question_image_url, question_type,
        options_json, correct_answer, correct_marks, negative_marks, unanswered_marks,
        explanation, parsing_confidence, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qId = crypto.randomUUID();
      const qNum = q.question_number || i + 1;
      const opts = Array.isArray(q.options) ? q.options : [];
      const correct = (q.correct_answer || 'A').toUpperCase().trim();

      const correctMarks = marking_scheme_type === 'custom' && q.correct_marks != null
        ? Number(q.correct_marks)
        : Number(default_correct_marks);

      const negativeMarks = marking_scheme_type === 'custom' && q.negative_marks != null
        ? Number(q.negative_marks)
        : Number(default_negative_marks);

      insertQ.run(
        qId,
        testId,
        qNum,
        q.question_text || `Question ${qNum}`,
        q.question_image_url || null,
        q.question_type || 'single',
        JSON.stringify(opts),
        correct,
        correctMarks,
        negativeMarks,
        Number(default_unanswered_marks),
        q.explanation || null,
        q.confidence || 1.0,
        now,
        now
      );
    }

    return NextResponse.json({
      success: true,
      testId,
      message: 'Test created successfully',
    });
  } catch (err: any) {
    console.error('Error creating test:', err);
    return NextResponse.json({ error: err?.message || 'Failed to create test' }, { status: 500 });
  }
}
