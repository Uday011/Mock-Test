import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { evaluateExam } from '@/lib/scoring';
import crypto from 'crypto';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;
  const db = getDb();

  try {
    const attemptStmt = db.prepare(`
      SELECT a.*, t.duration_seconds, t.title as current_test_title 
      FROM test_attempts a
      JOIN tests t ON t.id = a.test_id
      WHERE a.id = ?
    `);
    const attempt = attemptStmt.get(attemptId) as any;

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt session not found' }, { status: 404 });
    }

    if (attempt.status === 'completed') {
      return NextResponse.json({
        message: 'Exam already submitted',
        attemptId,
        alreadySubmitted: true,
      });
    }

    const body = await req.json().catch(() => ({}));
    const answersPayload = Array.isArray(body.answers) ? body.answers : [];

    const now = new Date();
    const startTime = new Date(attempt.started_at);
    let timeTaken = Math.max(1, Math.round((now.getTime() - startTime.getTime()) / 1000));

    // Cap time taken to configured test duration if exceeded
    if (attempt.duration_seconds > 0 && timeTaken > attempt.duration_seconds + 30) {
      timeTaken = attempt.duration_seconds;
    }

    // Retrieve original question snapshot
    let snapshotQuestions: any[] = [];
    if (attempt.questions_snapshot_json) {
      try {
        snapshotQuestions = JSON.parse(attempt.questions_snapshot_json);
      } catch (e) {
        console.warn('Failed to parse questions snapshot:', e);
      }
    }

    if (snapshotQuestions.length === 0) {
      const qStmt = db.prepare('SELECT * FROM questions WHERE test_id = ? ORDER BY question_number ASC');
      snapshotQuestions = qStmt.all(attempt.test_id) as any[];
    }

    // Parse options_json for each question
    const fullQuestions = snapshotQuestions.map(q => ({
      ...q,
      options: typeof q.options_json === 'string' ? JSON.parse(q.options_json || '[]') : (q.options || []),
    }));

    // If answers payload wasn't sent in submit body, read from user_answers table
    let userResponses = answersPayload;
    if (userResponses.length === 0) {
      const existingAnswersStmt = db.prepare('SELECT * FROM user_answers WHERE attempt_id = ?');
      const storedAnswers = existingAnswersStmt.all(attemptId) as any[];
      userResponses = storedAnswers.map(a => ({
        question_id: a.question_id,
        selected_answer: a.selected_answer,
        is_marked_for_review: Boolean(a.is_marked_for_review),
      }));
    }

    // Run Server-Side Scoring Engine
    const evalResult = evaluateExam({
      questions: fullQuestions,
      userResponses,
    });

    // Update test_attempts in database
    const updateAttempt = db.prepare(`
      UPDATE test_attempts SET
        submitted_at = ?,
        time_taken_seconds = ?,
        status = 'completed',
        total_questions = ?,
        attempted_questions = ?,
        correct_answers = ?,
        incorrect_answers = ?,
        unanswered_questions = ?,
        positive_marks = ?,
        negative_marks = ?,
        final_score = ?,
        maximum_marks = ?,
        percentage = ?,
        accuracy = ?
      WHERE id = ?
    `);

    updateAttempt.run(
      now.toISOString(),
      timeTaken,
      evalResult.total_questions,
      evalResult.attempted_questions,
      evalResult.correct_answers,
      evalResult.incorrect_answers,
      evalResult.unanswered_questions,
      evalResult.positive_marks,
      evalResult.negative_marks,
      evalResult.final_score,
      evalResult.maximum_marks,
      evalResult.percentage,
      evalResult.accuracy,
      attemptId
    );

    // Save/update detailed user answers with awarded marks and correctness
    const deleteOldAnswers = db.prepare('DELETE FROM user_answers WHERE attempt_id = ?');
    deleteOldAnswers.run(attemptId);

    const insertAns = db.prepare(`
      INSERT INTO user_answers (
        id, attempt_id, question_id, question_number, selected_answer,
        is_correct, marks_awarded, negative_marks_deducted, is_marked_for_review, answered_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const ans of evalResult.detailed_answers) {
      insertAns.run(
        crypto.randomUUID(),
        attemptId,
        ans.question_id,
        ans.question_number,
        ans.selected_answer,
        ans.is_correct ? 1 : 0,
        ans.marks_awarded,
        ans.negative_marks_deducted,
        ans.is_marked_for_review ? 1 : 0,
        now.toISOString()
      );
    }

    return NextResponse.json({
      success: true,
      attemptId,
      result: evalResult,
      timeTaken,
    });
  } catch (err: any) {
    console.error('Error submitting exam:', err);
    return NextResponse.json({ error: err?.message || 'Failed to evaluate exam' }, { status: 500 });
  }
}
