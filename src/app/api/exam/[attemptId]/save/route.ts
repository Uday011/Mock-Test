import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import crypto from 'crypto';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;
  const db = getDb();

  try {
    const attemptStmt = db.prepare('SELECT status FROM test_attempts WHERE id = ?');
    const attempt = attemptStmt.get(attemptId) as any;

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt session not found' }, { status: 404 });
    }

    if (attempt.status !== 'in_progress') {
      return NextResponse.json({ error: 'Exam attempt has already been submitted or locked' }, { status: 400 });
    }

    const body = await req.json();
    const { question_id, question_number, selected_answer, is_marked_for_review } = body;

    if (!question_id) {
      return NextResponse.json({ error: 'question_id is required' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Check if an answer already exists for this question in this attempt
    const existingStmt = db.prepare('SELECT id FROM user_answers WHERE attempt_id = ? AND question_id = ?');
    const existing = existingStmt.get(attemptId, question_id) as any;

    if (existing) {
      const updateStmt = db.prepare(`
        UPDATE user_answers SET
          selected_answer = ?,
          is_marked_for_review = ?,
          answered_at = ?
        WHERE id = ?
      `);
      updateStmt.run(
        selected_answer || null,
        is_marked_for_review ? 1 : 0,
        now,
        existing.id
      );
    } else {
      const insertStmt = db.prepare(`
        INSERT INTO user_answers (
          id, attempt_id, question_id, question_number, selected_answer,
          is_marked_for_review, answered_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertStmt.run(
        crypto.randomUUID(),
        attemptId,
        question_id,
        question_number || 1,
        selected_answer || null,
        is_marked_for_review ? 1 : 0,
        now
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to save answer' }, { status: 500 });
  }
}
