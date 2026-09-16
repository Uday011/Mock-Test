import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const user = await getCurrentUser();
    let userId = user?.id;

    if (!userId) {
      const demoStudent = db.prepare("SELECT id FROM users WHERE role = 'student' LIMIT 1").get() as any;
      if (demoStudent) userId = demoStudent.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { mistake_id, selected_answer } = body;

    if (!mistake_id || !selected_answer) {
      return NextResponse.json(
        { error: 'mistake_id and selected_answer are required' },
        { status: 400 }
      );
    }

    const mistake = db.prepare('SELECT * FROM mistake_records WHERE id = ? AND user_id = ?').get(mistake_id, userId) as any;
    if (!mistake) {
      return NextResponse.json({ error: 'Mistake record not found' }, { status: 404 });
    }

    const isCorrect = selected_answer.trim().toUpperCase() === mistake.correct_answer.trim().toUpperCase();
    const now = new Date().toISOString();

    let history: any[] = [];
    try {
      history = JSON.parse(mistake.retry_history_json || '[]');
    } catch {
      history = [];
    }

    history.push({
      attempt_number: (mistake.attempt_count || 1) + 1,
      selected_answer,
      is_correct: isCorrect,
      attempted_at: now,
    });

    const newAttemptCount = (mistake.attempt_count || 1) + 1;

    if (isCorrect) {
      db.prepare(`
        UPDATE mistake_records SET
          attempt_count = ?,
          last_attempted_at = ?,
          retry_history_json = ?,
          is_resolved = 1,
          resolved_at = ?
        WHERE id = ?
      `).run(newAttemptCount, now, JSON.stringify(history), now, mistake_id);
    } else {
      db.prepare(`
        UPDATE mistake_records SET
          attempt_count = ?,
          last_attempted_at = ?,
          retry_history_json = ?,
          is_resolved = 0
        WHERE id = ?
      `).run(newAttemptCount, now, JSON.stringify(history), mistake_id);
    }

    const updatedMistake = db.prepare('SELECT * FROM mistake_records WHERE id = ?').get(mistake_id);

    return NextResponse.json({
      success: true,
      is_correct: isCorrect,
      correct_answer: mistake.correct_answer,
      explanation: mistake.explanation,
      mistake: updatedMistake,
    });
  } catch (error: any) {
    console.error('Error in retry attempt:', error);
    return NextResponse.json(
      { error: 'Failed to process retry attempt', details: error.message },
      { status: 500 }
    );
  }
}
