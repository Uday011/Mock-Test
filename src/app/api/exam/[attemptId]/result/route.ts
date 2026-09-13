import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;
  const db = getDb();

  try {
    const attemptStmt = db.prepare(`
      SELECT a.*, 
             COALESCE(a.duration_seconds, t.duration_seconds, 1800) as duration_seconds,
             t.title as current_test_title, t.subject, t.description
      FROM test_attempts a
      JOIN tests t ON t.id = a.test_id
      WHERE a.id = ?
    `);
    const attempt = attemptStmt.get(attemptId) as any;

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    // Retrieve original question snapshot
    let questions: any[] = [];
    if (attempt.questions_snapshot_json) {
      try {
        questions = JSON.parse(attempt.questions_snapshot_json);
      } catch (e) {
        console.warn('Failed to parse questions snapshot:', e);
      }
    }

    if (questions.length === 0) {
      const qStmt = db.prepare('SELECT * FROM questions WHERE test_id = ? ORDER BY question_number ASC');
      questions = qStmt.all(attempt.test_id) as any[];
    }

    // Fetch user answers
    const answersStmt = db.prepare('SELECT * FROM user_answers WHERE attempt_id = ? ORDER BY question_number ASC');
    const answers = answersStmt.all(attemptId) as any[];
    const answerMap = new Map<string, any>();
    answers.forEach(a => answerMap.set(a.question_id, a));

    // Combine questions with answers
    const reviewedQuestions = questions.map(q => {
      const ans = answerMap.get(q.id);
      const options = typeof q.options_json === 'string' ? JSON.parse(q.options_json || '[]') : (q.options || []);

      return {
        id: q.id,
        question_number: q.question_number,
        question_text: q.question_text,
        question_image_url: q.question_image_url,
        question_type: q.question_type,
        options,
        correct_answer: q.correct_answer,
        correct_marks: q.correct_marks,
        negative_marks: q.negative_marks,
        explanation: q.explanation,
        // User's answer info
        user_answer: ans?.selected_answer || null,
        is_correct: ans?.is_correct != null ? Boolean(ans.is_correct) : false,
        is_attempted: Boolean(ans?.selected_answer),
        marks_awarded: ans?.marks_awarded || 0,
        negative_marks_deducted: ans?.negative_marks_deducted || 0,
        is_marked_for_review: Boolean(ans?.is_marked_for_review),
      };
    });

    let aiInsights = null;
    if (attempt.ai_insights_json) {
      try {
        aiInsights = JSON.parse(attempt.ai_insights_json);
      } catch (e) {}
    }

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        test_id: attempt.test_id,
        test_title: attempt.test_title_snapshot || attempt.current_test_title,
        subject: attempt.subject,
        started_at: attempt.started_at,
        submitted_at: attempt.submitted_at,
        time_taken_seconds: attempt.time_taken_seconds,
        duration_seconds: attempt.duration_seconds,
        status: attempt.status,
        total_questions: attempt.total_questions,
        attempted_questions: attempt.attempted_questions,
        correct_answers: attempt.correct_answers,
        incorrect_answers: attempt.incorrect_answers,
        unanswered_questions: attempt.unanswered_questions,
        positive_marks: attempt.positive_marks,
        negative_marks: attempt.negative_marks,
        final_score: attempt.final_score,
        maximum_marks: attempt.maximum_marks,
        percentage: attempt.percentage,
        accuracy: attempt.accuracy,
        ai_insights: aiInsights,
      },
      questions: reviewedQuestions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch results' }, { status: 500 });
  }
}
