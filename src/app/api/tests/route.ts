import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedInitialData } from '@/lib/db/seed';
import { getCurrentUser, getOrCreateDemoUser } from '@/lib/auth';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    seedInitialData();

    let user = await getCurrentUser();
    if (!user) {
      user = getOrCreateDemoUser();
    }
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
      // Admin sees their own tests (including drafts), plus published official tests
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
        WHERE t.user_id = ? OR (t.status = 'published' AND (t.visibility = 'public' OR t.visibility IS NULL))
        GROUP BY t.id
        ORDER BY t.created_at DESC
      `;
      params = [user.id];
    } else {
      // Student sees their own self-created practice tests (including their own drafts) + official mocks created by admins/superadmins that are published
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
        WHERE (t.user_id = ?) OR (u.role IN ('admin', 'superadmin') AND (t.status = 'published' OR t.status IS NULL))
        GROUP BY t.id
        ORDER BY t.created_at DESC
      `;
      params = [user.id, user.id, user.id];
    }

    const { searchParams } = new URL(req.url);
    const filterExamId = searchParams.get('exam_id');
    const filterSubjectId = searchParams.get('subject_id');
    const filterTestType = searchParams.get('test_type');
    const filterDifficulty = searchParams.get('difficulty');
    const filterDuration = searchParams.get('duration');
    const filterIsPaid = searchParams.get('is_paid');
    const filterStatus = searchParams.get('status');
    const filterSource = searchParams.get('source');
    const searchQuery = searchParams.get('q') || searchParams.get('search');

    const testsStmt = db.prepare(testsQuery);
    let tests = testsStmt.all(...params) as any[];

    // Apply multifaceted filters in memory
    if (filterExamId && filterExamId !== 'all') {
      tests = tests.filter(t => t.exam_id === filterExamId || !t.exam_id);
    }
    if (filterSubjectId && filterSubjectId !== 'all') {
      tests = tests.filter(t => t.subject_id === filterSubjectId);
    }
    if (filterTestType && filterTestType !== 'all') {
      tests = tests.filter(t => t.test_type === filterTestType);
    }
    if (filterDifficulty && filterDifficulty !== 'all') {
      tests = tests.filter(t => (t.difficulty || 'medium') === filterDifficulty);
    }
    if (filterDuration && filterDuration !== 'all') {
      if (filterDuration === 'short') tests = tests.filter(t => t.duration_seconds > 0 && t.duration_seconds <= 1800);
      else if (filterDuration === 'medium') tests = tests.filter(t => t.duration_seconds > 1800 && t.duration_seconds <= 3600);
      else if (filterDuration === 'long') tests = tests.filter(t => t.duration_seconds > 3600);
    }
    if (filterIsPaid !== null && filterIsPaid !== undefined && filterIsPaid !== 'all') {
      const isPaidVal = filterIsPaid === '1' || filterIsPaid === 'true' ? 1 : 0;
      tests = tests.filter(t => Boolean(t.is_paid) === Boolean(isPaidVal));
    }
    if (filterStatus && filterStatus !== 'all') {
      tests = tests.filter(t => (t.status || 'published') === filterStatus);
    }
    if (filterSource && filterSource !== 'all') {
      tests = tests.filter(t => (t.source || 'Nalanda Official').toLowerCase().includes(filterSource.toLowerCase()));
    }
    if (searchQuery) {
      const qLower = searchQuery.toLowerCase();
      tests = tests.filter(t =>
        t.title.toLowerCase().includes(qLower) ||
        (t.description && t.description.toLowerCase().includes(qLower)) ||
        (t.subject && t.subject.toLowerCase().includes(qLower))
      );
    }

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
      const latestAttempt = attempts[0] || null;

      let parsedTags: string[] = [];
      try {
        parsedTags = typeof test.tags_json === 'string' ? JSON.parse(test.tags_json || '[]') : [];
      } catch {
        parsedTags = [];
      }

      return {
        ...test,
        difficulty: test.difficulty || 'medium',
        source: test.source || 'Nalanda Official',
        test_type: test.test_type || 'full_mock',
        status: test.status || 'published',
        instructions: test.instructions || '',
        result_availability: test.result_availability || 'immediate',
        tags: parsedTags,
        shuffle_questions: Boolean(test.shuffle_questions),
        shuffle_options: Boolean(test.shuffle_options),
        allow_navigation: Boolean(test.allow_navigation),
        show_palette: Boolean(test.show_palette),
        allow_review_marking: Boolean(test.allow_review_marking),
        show_immediate_results: Boolean(test.show_immediate_results),
        attempts,
        last_attempt_status: latestAttempt?.status || null,
        last_attempt_id: latestAttempt?.id || null,
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
  try {
    const db = getDb();
    seedInitialData();

    let user = await getCurrentUser();
    if (!user) {
      user = getOrCreateDemoUser();
    }
    const body = await req.json();
    const {
      title,
      description = '',
      subject = 'General',
      section_id = null,
      exam_id = null,
      subject_id = null,
      topic_id = null,
      subtopic_id = null,
      test_type = 'topic_test',
      difficulty = 'medium',
      source = 'User Created',
      status = 'published',
      visibility = 'public',
      instructions = '',
      result_availability = 'immediate',
      tags = [],
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
      save_to_question_bank = false,
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
    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);

    const insertTest = db.prepare(`
      INSERT INTO tests (
        id, user_id, title, description, subject, section_id, duration_seconds,
        marking_scheme_type, default_correct_marks, default_negative_marks, default_unanswered_marks,
        shuffle_questions, shuffle_options, allow_navigation, show_palette, allow_review_marking, show_immediate_results,
        test_type, difficulty, source, status, instructions, result_availability, tags_json,
        exam_id, subject_id, topic_id, subtopic_id, visibility,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      test_type,
      difficulty,
      source,
      status,
      instructions,
      result_availability,
      tagsJson,
      exam_id || null,
      subject_id || null,
      topic_id || null,
      subtopic_id || null,
      visibility,
      now,
      now
    );

    const insertQ = db.prepare(`
      INSERT INTO questions (
        id, test_id, question_number, question_text, question_image_url, question_type,
        options_json, correct_answer, correct_marks, negative_marks, unanswered_marks,
        explanation, parsing_confidence, subject_id, section_id, topic_id, subtopic_id, difficulty, source,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertQB = save_to_question_bank ? db.prepare(`
      INSERT INTO question_bank (
        id, creator_id, topic_id, subject_id, exam_id, subtopic_id,
        question_text, question_type, options_json, correct_answer, explanation,
        difficulty, source_reference, tags_json, usage_count, status,
        marks, negative_marks, estimated_seconds, used_in_tests_json, correctness_status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `) : null;

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
        q.subject_id || subject_id || null,
        section_id || null,
        q.topic_id || topic_id || null,
        q.subtopic_id || subtopic_id || null,
        q.difficulty || difficulty || 'medium',
        q.source || source || 'Test Studio',
        now,
        now
      );

      if (insertQB) {
        const qbId = crypto.randomUUID();
        const qbTags = Array.isArray(q.tags) ? q.tags : (Array.isArray(tags) ? tags : []);
        insertQB.run(
          qbId,
          user.id,
          q.topic_id || topic_id || null,
          q.subject_id || subject_id || null,
          exam_id || null,
          q.subtopic_id || subtopic_id || null,
          q.question_text || `Question ${qNum}`,
          q.question_type || 'single',
          JSON.stringify(opts),
          correct,
          q.explanation || null,
          q.difficulty || difficulty || 'medium',
          source || 'Test Studio',
          JSON.stringify(qbTags),
          1,
          'active',
          correctMarks,
          negativeMarks,
          q.estimated_seconds || 60,
          JSON.stringify([title.trim()]),
          'verified',
          now
        );
      }
    }

    return NextResponse.json({
      success: true,
      testId,
      status,
      message: status === 'draft' ? 'Draft saved successfully' : 'Test published successfully',
    });
  } catch (err: any) {
    console.error('Error creating test:', err);
    return NextResponse.json({ error: err?.message || 'Failed to create test' }, { status: 500 });
  }
}
