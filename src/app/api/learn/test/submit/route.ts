import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    let user = await getCurrentUser();
    let userId = user?.id;

    if (!userId) {
      const demoStudent = db.prepare("SELECT id FROM users WHERE role = 'student' LIMIT 1").get() as any;
      if (demoStudent) userId = demoStudent.id;
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { topic_id, test_id, answers, time_taken_seconds } = body;

    if (!topic_id || !test_id) {
      return NextResponse.json({ success: false, error: 'topic_id and test_id are required' }, { status: 400 });
    }

    // 1. Fetch Test and Questions
    const test = db.prepare('SELECT * FROM tests WHERE id = ?').get(test_id) as any;
    if (!test) {
      return NextResponse.json({ success: false, error: 'Test not found' }, { status: 404 });
    }

    const questions = db.prepare('SELECT * FROM questions WHERE test_id = ? ORDER BY question_number ASC').all(test_id) as any[];
    if (questions.length === 0) {
      return NextResponse.json({ success: false, error: 'No questions found for test' }, { status: 400 });
    }

    const attemptId = `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    let positiveMarks = 0;
    let negativeMarks = 0;
    const userAnswersList: any[] = [];
    const mistakesToLog: any[] = [];

    for (const q of questions) {
      const selected = answers ? answers[q.id] : null;
      let isCorrect = false;
      let awarded = 0;
      let deducted = 0;

      if (!selected) {
        unansweredCount++;
      } else if (selected.trim().toUpperCase() === q.correct_answer.trim().toUpperCase()) {
        isCorrect = true;
        correctCount++;
        awarded = q.correct_marks || 2.0;
        positiveMarks += awarded;
      } else {
        incorrectCount++;
        deducted = q.negative_marks || 0.5;
        negativeMarks += deducted;

        mistakesToLog.push({
          id: `mistake-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          question_id: q.id,
          question_text: q.question_text,
          options_json: q.options_json,
          selected_answer: selected,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
        });
      }

      userAnswersList.push({
        id: `ans-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        attempt_id: attemptId,
        question_id: q.id,
        question_number: q.question_number,
        selected_answer: selected,
        is_correct: isCorrect ? 1 : 0,
        marks_awarded: awarded,
        negative_marks_deducted: deducted,
      });
    }

    const totalQuestions = questions.length;
    const finalScore = Math.max(0, positiveMarks - negativeMarks);
    const maximumMarks = questions.reduce((acc, q) => acc + (q.correct_marks || 2.0), 0);
    const percentage = maximumMarks > 0 ? Math.round((finalScore / maximumMarks) * 1000) / 10 : 0;
    const accuracy = (correctCount + incorrectCount) > 0 ? Math.round((correctCount / (correctCount + incorrectCount)) * 1000) / 10 : 0;

    // 2. Insert Test Attempt
    db.prepare(`
      INSERT INTO test_attempts (
        id, test_id, user_id, test_title_snapshot, duration_seconds, started_at, submitted_at,
        time_taken_seconds, status, total_questions, attempted_questions, correct_answers,
        incorrect_answers, unanswered_questions, positive_marks, negative_marks, final_score,
        maximum_marks, percentage, accuracy, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      attemptId,
      test.id,
      userId,
      test.title,
      test.duration_seconds,
      now,
      now,
      time_taken_seconds || 300,
      totalQuestions,
      correctCount + incorrectCount,
      correctCount,
      incorrectCount,
      unansweredCount,
      positiveMarks,
      negativeMarks,
      finalScore,
      maximumMarks,
      percentage,
      accuracy,
      now
    );

    // 3. Insert User Answers
    const insertAnswer = db.prepare(`
      INSERT INTO user_answers (
        id, attempt_id, question_id, question_number, selected_answer, is_correct,
        marks_awarded, negative_marks_deducted, is_marked_for_review, answered_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `);
    for (const ans of userAnswersList) {
      insertAnswer.run(
        ans.id,
        ans.attempt_id,
        ans.question_id,
        ans.question_number,
        ans.selected_answer,
        ans.is_correct,
        ans.marks_awarded,
        ans.negative_marks_deducted,
        now
      );
    }

    // 4. Log Mistakes if any
    const insertMistake = db.prepare(`
      INSERT OR IGNORE INTO mistake_records (
        id, user_id, test_id, question_id, exam_id, subject_id, topic_id,
        question_text, options_json, selected_answer, correct_answer, explanation,
        error_category, user_notes, is_resolved, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'conceptual_gap', 'Logged automatically during topic mastery assessment.', 0, ?)
    `);
    for (const m of mistakesToLog) {
      insertMistake.run(
        m.id,
        userId,
        test.id,
        m.question_id,
        test.exam_id,
        test.subject_id,
        topic_id,
        m.question_text,
        m.options_json,
        m.selected_answer,
        m.correct_answer,
        m.explanation,
        now
      );
    }

    // 5. Update Topic Mastery & Spaced Repetition Schedule
    let targetStatus = 'practiced';
    let nextIntervalDays = 3;

    if (percentage >= 75.0) {
      targetStatus = 'proficient';
      nextIntervalDays = 7;
    } else if (percentage >= 50.0) {
      targetStatus = 'developing';
      nextIntervalDays = 3;
    } else {
      targetStatus = 'needs_revision';
      nextIntervalDays = 1;
    }

    const nextRevisionDate = new Date(Date.now() + nextIntervalDays * 86400000).toISOString();

    const existingProg = db.prepare('SELECT id, repetition_count, tests_attempted FROM user_topic_progress WHERE user_id = ? AND topic_id = ?').get(userId, topic_id) as any;

    if (existingProg) {
      const repCount = (existingProg.repetition_count || 0) + 1;
      const testsAttempted = (existingProg.tests_attempted || 0) + 1;
      db.prepare(`
        UPDATE user_topic_progress
        SET status = ?, mastery_percentage = ?, tests_attempted = ?,
            questions_practiced = questions_practiced + ?,
            questions_correct = questions_correct + ?,
            next_revision_date = ?, repetition_interval_days = ?, repetition_count = ?,
            last_studied_at = ?, updated_at = ?
        WHERE id = ?
      `).run(
        targetStatus,
        percentage,
        testsAttempted,
        totalQuestions,
        correctCount,
        nextRevisionDate,
        nextIntervalDays,
        repCount,
        now,
        now,
        existingProg.id
      );
    } else {
      const progId = `prog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      db.prepare(`
        INSERT INTO user_topic_progress (
          id, user_id, topic_id, status, mastery_percentage, questions_practiced,
          questions_correct, tests_attempted, next_revision_date, repetition_interval_days,
          repetition_count, last_studied_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, 1, ?, ?)
      `).run(
        progId,
        userId,
        topic_id,
        targetStatus,
        percentage,
        totalQuestions,
        correctCount,
        nextRevisionDate,
        nextIntervalDays,
        now,
        now
      );
    }

    // 6. Check if siblings in subject are completed to recommend a sectional test
    const topicNode = db.prepare('SELECT subject_id FROM syllabus_nodes WHERE id = ?').get(topic_id) as any;
    let recommendSectionalTest = null;

    if (topicNode?.subject_id) {
      const subjectTopics = db.prepare("SELECT id FROM syllabus_nodes WHERE subject_id = ? AND level = 'topic'").all(topicNode.subject_id) as any[];
      const completedCount = db.prepare(`
        SELECT COUNT(*) as count FROM user_topic_progress
        WHERE user_id = ? AND topic_id IN (${subjectTopics.map(() => '?').join(',')}) AND status IN ('studied', 'mastered')
      `).get(userId, ...subjectTopics.map((t) => t.id)) as any;

      if (completedCount?.count >= Math.min(3, subjectTopics.length)) {
        // Recommend Sectional test
        const sectionalTest = db.prepare(`
          SELECT id, title, duration_seconds FROM tests
          WHERE subject_id = ? OR exam_id = (SELECT exam_id FROM subjects WHERE id = ?)
          LIMIT 1
        `).get(topicNode.subject_id, topicNode.subject_id) as any;

        if (sectionalTest) {
          recommendSectionalTest = sectionalTest;
        }
      }
    }

    return NextResponse.json({
      success: true,
      attempt_id: attemptId,
      score: finalScore,
      maximum_marks: maximumMarks,
      percentage,
      accuracy,
      correct_count: correctCount,
      incorrect_count: incorrectCount,
      unanswered_count: unansweredCount,
      is_mastered: targetStatus === 'proficient',
      new_status: targetStatus,
      next_revision_date: nextRevisionDate,
      recommend_sectional_test: recommendSectionalTest,
      logged_mistakes_count: mistakesToLog.length,
    });
  } catch (error: any) {
    console.error('API /api/learn/test/submit error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}
