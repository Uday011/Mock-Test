import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, getOrCreateDemoUser } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  let user = await getCurrentUser();
  if (!user) user = getOrCreateDemoUser();

  try {
    const testStmt = db.prepare('SELECT * FROM tests WHERE id = ?');
    const sourceTest = testStmt.get(id) as any;

    if (!sourceTest) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    const newTestId = crypto.randomUUID();
    const now = new Date().toISOString();
    const newTitle = `${sourceTest.title} (Copy)`;

    const insertTest = db.prepare(`
      INSERT INTO tests (
        id, user_id, title, description, subject, duration_seconds,
        marking_scheme_type, default_correct_marks, default_negative_marks, default_unanswered_marks,
        shuffle_questions, shuffle_options, allow_navigation, show_palette, allow_review_marking, show_immediate_results,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertTest.run(
      newTestId,
      user.id,
      newTitle,
      sourceTest.description,
      sourceTest.subject,
      sourceTest.duration_seconds,
      sourceTest.marking_scheme_type,
      sourceTest.default_correct_marks,
      sourceTest.default_negative_marks,
      sourceTest.default_unanswered_marks,
      sourceTest.shuffle_questions,
      sourceTest.shuffle_options,
      sourceTest.allow_navigation,
      sourceTest.show_palette,
      sourceTest.allow_review_marking,
      sourceTest.show_immediate_results,
      now,
      now
    );

    const questionsStmt = db.prepare('SELECT * FROM questions WHERE test_id = ? ORDER BY question_number ASC');
    const sourceQuestions = questionsStmt.all(id) as any[];

    const insertQ = db.prepare(`
      INSERT INTO questions (
        id, test_id, question_number, question_text, question_image_url, question_type,
        options_json, correct_answer, correct_marks, negative_marks, unanswered_marks,
        explanation, parsing_confidence, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const q of sourceQuestions) {
      insertQ.run(
        crypto.randomUUID(),
        newTestId,
        q.question_number,
        q.question_text,
        q.question_image_url,
        q.question_type,
        q.options_json,
        q.correct_answer,
        q.correct_marks,
        q.negative_marks,
        q.unanswered_marks,
        q.explanation,
        q.parsing_confidence,
        now,
        now
      );
    }

    return NextResponse.json({
      success: true,
      newTestId,
      message: 'Test duplicated successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to duplicate test' }, { status: 500 });
  }
}
