import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, getOrCreateDemoUser } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const db = getDb();
  let user = await getCurrentUser();
  if (!user) user = getOrCreateDemoUser();

  try {
    const body = await req.json();
    const { testId } = body;

    if (!testId) {
      return NextResponse.json({ error: 'testId is required' }, { status: 400 });
    }

    const testStmt = db.prepare('SELECT * FROM tests WHERE id = ?');
    const test = testStmt.get(testId) as any;

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    const questionsStmt = db.prepare('SELECT * FROM questions WHERE test_id = ? ORDER BY question_number ASC');
    const rawQuestions = questionsStmt.all(testId) as any[];

    if (rawQuestions.length === 0) {
      return NextResponse.json({ error: 'Test has no questions configured' }, { status: 400 });
    }

    // Parse options_json
    let questions = rawQuestions.map(q => ({
      ...q,
      options: JSON.parse(q.options_json || '[]'),
    }));

    // Apply shuffling if configured
    if (test.shuffle_questions) {
      questions = [...questions].sort(() => Math.random() - 0.5);
    }
    if (test.shuffle_options) {
      questions = questions.map(q => ({
        ...q,
        options: [...q.options].sort(() => Math.random() - 0.5),
      }));
    }

    const attemptId = crypto.randomUUID();
    const now = new Date().toISOString();
    const testDuration = Number(test.duration_seconds) >= 0 ? Number(test.duration_seconds) : 1800;

    // Store snapshot of full questions & configured duration directly in test_attempts
    const insertAttempt = db.prepare(`
      INSERT INTO test_attempts (
        id, test_id, user_id, test_title_snapshot, duration_seconds, started_at,
        time_taken_seconds, status, total_questions,
        questions_snapshot_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAttempt.run(
      attemptId,
      testId,
      user.id,
      test.title,
      testDuration,
      now,
      0,
      'in_progress',
      questions.length,
      JSON.stringify(rawQuestions), // full snapshot
      now
    );

    // Sanitize questions for client delivery (HIDE correct_answer and explanation until submission!)
    const clientQuestions = questions.map((q, idx) => ({
      id: q.id,
      question_number: idx + 1,
      original_question_number: q.question_number,
      question_text: q.question_text,
      question_image_url: q.question_image_url,
      question_type: q.question_type,
      options: q.options,
      correct_marks: q.correct_marks,
      negative_marks: q.negative_marks,
    }));

    return NextResponse.json({
      success: true,
      attemptId,
      test: {
        id: test.id,
        title: test.title,
        description: test.description,
        subject: test.subject,
        duration_seconds: testDuration,
        allow_navigation: Boolean(test.allow_navigation),
        show_palette: Boolean(test.show_palette),
        allow_review_marking: Boolean(test.allow_review_marking),
        show_immediate_results: Boolean(test.show_immediate_results),
      },
      started_at: now,
      questions: clientQuestions,
    });
  } catch (err: any) {
    console.error('Failed to start exam:', err);
    return NextResponse.json({ error: err?.message || 'Failed to start exam' }, { status: 500 });
  }
}
