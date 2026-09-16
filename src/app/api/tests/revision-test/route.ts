import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, getOrCreateDemoUser } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const db = getDb();
  let user = await getCurrentUser();
  if (!user) user = getOrCreateDemoUser();

  try {
    const body = await req.json().catch(() => ({}));
    const { attemptId, topicId, subjectId, examId, count = 10 } = body;

    let targetQuestions: any[] = [];
    let drillTitle = 'Adaptive Revision Drill';

    // 1. If generated from a specific test attempt, pull questions user answered incorrectly
    if (attemptId) {
      const attemptStmt = db.prepare(`
        SELECT a.test_id, t.title as test_title, t.subject, t.exam_id, t.subject_id
        FROM test_attempts a
        JOIN tests t ON t.id = a.test_id
        WHERE a.id = ?
      `);
      const attempt = attemptStmt.get(attemptId) as any;

      if (attempt) {
        drillTitle = `Revision Drill: ${attempt.test_title.slice(0, 35)}`;
        
        // Find question IDs missed in this attempt
        const missedStmt = db.prepare(`
          SELECT q.* 
          FROM user_answers ua
          JOIN questions q ON q.id = ua.question_id
          WHERE ua.attempt_id = ? AND ua.is_correct = 0 AND ua.selected_answer IS NOT NULL
          LIMIT ?
        `);
        targetQuestions = missedStmt.all(attemptId, count) as any[];
      }
    }

    // 2. If questions still needed and topicId provided
    if (targetQuestions.length < 5 && topicId) {
      const topicNode = db.prepare('SELECT title FROM syllabus_nodes WHERE id = ?').get(topicId) as any;
      if (topicNode) drillTitle = `Revision Drill: ${topicNode.title}`;

      const topicQStmt = db.prepare(`
        SELECT * FROM questions 
        WHERE topic_id = ? 
        ORDER BY RANDOM() 
        LIMIT ?
      `);
      const topicQs = topicQStmt.all(topicId, count - targetQuestions.length) as any[];
      targetQuestions = [...targetQuestions, ...topicQs];
    }

    // 3. If questions still needed, pull from unresolved mistake_records
    if (targetQuestions.length < count) {
      const mistakesStmt = db.prepare(`
        SELECT m.question_id, m.question_text, m.options_json, m.correct_answer, m.explanation, m.subject_id, m.topic_id
        FROM mistake_records m
        WHERE m.user_id = ? AND m.is_resolved = 0
        ORDER BY m.created_at DESC
        LIMIT ?
      `);
      const mistakes = mistakesStmt.all(user.id, count - targetQuestions.length) as any[];

      for (const m of mistakes) {
        // If question exists in questions table, fetch full record
        if (m.question_id) {
          const q = db.prepare('SELECT * FROM questions WHERE id = ?').get(m.question_id) as any;
          if (q && !targetQuestions.some(tq => tq.id === q.id)) {
            targetQuestions.push(q);
            continue;
          }
        }
        // Otherwise reconstruct from mistake record
        if (m.question_text && !targetQuestions.some(tq => tq.question_text === m.question_text)) {
          targetQuestions.push({
            id: `rev-q-${crypto.randomUUID()}`,
            question_text: m.question_text,
            options_json: m.options_json,
            correct_answer: m.correct_answer,
            explanation: m.explanation,
            correct_marks: 2.0,
            negative_marks: 0.5,
            subject_id: m.subject_id,
            topic_id: m.topic_id,
            question_type: 'single',
          });
        }
      }
    }

    // 4. Fallback if user has no mistakes: take random high-yield questions
    if (targetQuestions.length === 0) {
      const fallbackStmt = db.prepare(`
        SELECT * FROM questions 
        WHERE question_text IS NOT NULL AND question_text != ''
        ORDER BY RANDOM() 
        LIMIT ?
      `);
      targetQuestions = fallbackStmt.all(count) as any[];
      drillTitle = 'Targeted Practice Sprint';
    }

    if (targetQuestions.length === 0) {
      return NextResponse.json({ error: 'No questions available to generate revision drill' }, { status: 400 });
    }

    // Deduplicate questions
    const seenTexts = new Set<string>();
    targetQuestions = targetQuestions.filter(q => {
      if (seenTexts.has(q.question_text)) return false;
      seenTexts.add(q.question_text);
      return true;
    });

    const newTestId = `test-rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();
    const durationSeconds = Math.max(300, targetQuestions.length * 72); // 72s per question

    // Insert new Test
    db.prepare(`
      INSERT INTO tests (
        id, user_id, title, description, subject, test_type, exam_id,
        duration_seconds, default_correct_marks, default_negative_marks, default_unanswered_marks,
        difficulty, source, visibility, is_paid, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'mixed_revision_test', ?, ?, 2.0, 0.5, 0.0, 'medium', 'Nalanda Adaptive Engine', 'private', 0, ?, ?)
    `).run(
      newTestId,
      user.id,
      drillTitle,
      `Personalized adaptive revision test compiled from your mistake notebook and recent test performance.`,
      targetQuestions[0]?.subject || 'Mixed Revision',
      examId || 'exam-ssc-cgl',
      durationSeconds,
      now,
      now
    );

    // Insert questions for this test
    const insertQ = db.prepare(`
      INSERT INTO questions (
        id, test_id, question_number, question_text, question_image_url, question_type,
        options_json, correct_answer, correct_marks, negative_marks, unanswered_marks,
        explanation, subject_id, topic_id, difficulty, source, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.0, ?, ?, ?, ?, 'Adaptive Engine', ?, ?)
    `);

    const clonedQuestionsForSnapshot: any[] = [];

    for (let i = 0; i < targetQuestions.length; i++) {
      const q = targetQuestions[i];
      const qId = crypto.randomUUID();
      const optionsJson = typeof q.options_json === 'string' ? q.options_json : JSON.stringify(q.options || []);

      insertQ.run(
        qId,
        newTestId,
        i + 1,
        q.question_text,
        q.question_image_url || null,
        q.question_type || 'single',
        optionsJson,
        (q.correct_answer || 'A').toUpperCase(),
        Number(q.correct_marks) || 2.0,
        Number(q.negative_marks) || 0.5,
        q.explanation || null,
        q.subject_id || null,
        q.topic_id || null,
        q.difficulty || 'medium',
        now,
        now
      );

      clonedQuestionsForSnapshot.push({
        id: qId,
        question_number: i + 1,
        question_text: q.question_text,
        question_image_url: q.question_image_url || null,
        question_type: q.question_type || 'single',
        options_json: optionsJson,
        correct_answer: (q.correct_answer || 'A').toUpperCase(),
        correct_marks: Number(q.correct_marks) || 2.0,
        negative_marks: Number(q.negative_marks) || 0.5,
        explanation: q.explanation,
        subject_id: q.subject_id,
        topic_id: q.topic_id,
      });
    }

    // Auto-create attempt session so the user can start immediately
    const newAttemptId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO test_attempts (
        id, test_id, user_id, test_title_snapshot, duration_seconds, started_at,
        time_taken_seconds, status, total_questions, questions_snapshot_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, 'in_progress', ?, ?, ?)
    `).run(
      newAttemptId,
      newTestId,
      user.id,
      drillTitle,
      durationSeconds,
      now,
      clonedQuestionsForSnapshot.length,
      JSON.stringify(clonedQuestionsForSnapshot),
      now
    );

    return NextResponse.json({
      success: true,
      testId: newTestId,
      attemptId: newAttemptId,
      title: drillTitle,
      questionCount: clonedQuestionsForSnapshot.length,
      durationSeconds,
    });
  } catch (err: any) {
    console.error('Failed to create revision test:', err);
    return NextResponse.json({ error: err?.message || 'Failed to generate revision test' }, { status: 500 });
  }
}
