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
      SELECT a.*, t.duration_seconds, t.title as current_test_title, t.exam_id, t.subject_id, t.subject
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

    // ==========================================
    // LEARNING INTEGRATION & FORENSICS
    // ==========================================
    const userId = attempt.user_id;

    // Map question metadata (topic_id, subject_id)
    const qMetaMap = new Map<string, any>();
    for (const q of fullQuestions) {
      qMetaMap.set(q.id, q);
    }

    // 1. Group by Topic for Learning Progress & Mastery
    const topicGroups = new Map<string, { total: number; correct: number; incorrect: number }>();
    const sectionGroups = new Map<string, { total: number; attempted: number; correct: number; incorrect: number; positive: number; negative: number }>();

    for (const ans of evalResult.detailed_answers) {
      const q = qMetaMap.get(ans.question_id);
      const topicId = q?.topic_id;
      const subjectName = q?.subject || attempt.subject || 'General';

      // Section group
      if (!sectionGroups.has(subjectName)) {
        sectionGroups.set(subjectName, { total: 0, attempted: 0, correct: 0, incorrect: 0, positive: 0, negative: 0 });
      }
      const sGroup = sectionGroups.get(subjectName)!;
      sGroup.total++;
      if (ans.selected_answer) {
        sGroup.attempted++;
        if (ans.is_correct) {
          sGroup.correct++;
          sGroup.positive += ans.marks_awarded;
        } else {
          sGroup.incorrect++;
          sGroup.negative += ans.negative_marks_deducted;
        }
      }

      // Topic group
      if (topicId) {
        if (!topicGroups.has(topicId)) {
          topicGroups.set(topicId, { total: 0, correct: 0, incorrect: 0 });
        }
        const tGroup = topicGroups.get(topicId)!;
        tGroup.total++;
        if (ans.is_correct) {
          tGroup.correct++;
        } else if (ans.selected_answer) {
          tGroup.incorrect++;
        }
      }

      // Auto-log mistake if answered incorrectly
      if (ans.selected_answer && !ans.is_correct) {
        try {
          const insertMistake = db.prepare(`
            INSERT OR IGNORE INTO mistake_records (
              id, user_id, test_id, question_id, exam_id, subject_id, topic_id,
              question_text, options_json, selected_answer, correct_answer, explanation,
              error_category, user_notes, is_resolved, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'calculation_error', 'Logged from CBT test submission.', 0, ?)
          `);
          insertMistake.run(
            `mistake-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            userId,
            attempt.test_id,
            ans.question_id,
            attempt.exam_id || 'exam-ssc-cgl',
            q?.subject_id || attempt.subject_id,
            topicId,
            q?.question_text || '',
            JSON.stringify(q?.options || []),
            ans.selected_answer,
            ans.correct_answer || '',
            q?.explanation || '',
            now.toISOString()
          );
        } catch (mErr) {
          console.warn('Mistake auto-log notice:', mErr);
        }
      }
    }

    // 2. Update user_topic_progress in database
    const topicPerformanceList: any[] = [];
    for (const [tId, tStats] of topicGroups.entries()) {
      const topicAcc = tStats.total > 0 ? Math.round((tStats.correct / tStats.total) * 100) : 0;
      const isTopicMastered = topicAcc >= 75.0;
      const targetStatus = isTopicMastered ? 'mastered' : 'studied';
      const nextIntervalDays = isTopicMastered ? 3 : 1;
      const nextRevisionDate = new Date(Date.now() + nextIntervalDays * 86400000).toISOString();

      const existingProg = db.prepare('SELECT id, repetition_count, tests_attempted, mastery_percentage FROM user_topic_progress WHERE user_id = ? AND topic_id = ?').get(userId, tId) as any;

      if (existingProg) {
        const newMastery = Math.max(existingProg.mastery_percentage || 0, topicAcc);
        db.prepare(`
          UPDATE user_topic_progress
          SET status = ?, mastery_percentage = ?, tests_attempted = tests_attempted + 1,
              questions_practiced = questions_practiced + ?,
              questions_correct = questions_correct + ?,
              next_revision_date = ?, repetition_interval_days = ?, repetition_count = repetition_count + 1,
              last_studied_at = ?, updated_at = ?
          WHERE id = ?
        `).run(
          targetStatus,
          newMastery,
          tStats.total,
          tStats.correct,
          nextRevisionDate,
          nextIntervalDays,
          now.toISOString(),
          now.toISOString(),
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
          tId,
          targetStatus,
          topicAcc,
          tStats.total,
          tStats.correct,
          nextRevisionDate,
          nextIntervalDays,
          now.toISOString(),
          now.toISOString()
        );
      }

      // Fetch topic title
      const tNode = db.prepare('SELECT title FROM syllabus_nodes WHERE id = ?').get(tId) as any;
      topicPerformanceList.push({
        topic_id: tId,
        topic_title: tNode?.title || tId,
        total_questions: tStats.total,
        correct: tStats.correct,
        incorrect: tStats.incorrect,
        accuracy: topicAcc,
        is_mastered: isTopicMastered,
        status_updated_to: targetStatus,
      });
    }

    // Format section performance
    const sectionPerformanceList: any[] = [];
    for (const [secName, sStats] of sectionGroups.entries()) {
      const score = Math.max(0, sStats.positive - sStats.negative);
      const acc = sStats.attempted > 0 ? Math.round((sStats.correct / sStats.attempted) * 100) : 0;
      sectionPerformanceList.push({
        section_name: secName,
        total_questions: sStats.total,
        attempted: sStats.attempted,
        correct: sStats.correct,
        incorrect: sStats.incorrect,
        unanswered: sStats.total - sStats.attempted,
        score,
        accuracy: acc,
      });
    }

    // Persist section and topic performance breakdowns
    try {
      db.prepare(`
        UPDATE test_attempts SET
          section_performance_json = ?,
          topic_performance_json = ?
        WHERE id = ?
      `).run(
        JSON.stringify(sectionPerformanceList),
        JSON.stringify(topicPerformanceList),
        attemptId
      );
    } catch (saveErr) {
      console.warn('Could not save section/topic performance to attempt record:', saveErr);
    }

    return NextResponse.json({
      success: true,
      attemptId,
      result: {
        ...evalResult,
        section_performance: sectionPerformanceList,
        topic_performance: topicPerformanceList,
      },
      timeTaken,
    });
  } catch (err: any) {
    console.error('Error submitting exam:', err);
    return NextResponse.json({ error: err?.message || 'Failed to evaluate exam' }, { status: 500 });
  }
}
