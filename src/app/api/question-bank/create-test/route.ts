import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    let user = await getCurrentUser();
    let userId = user?.id;

    if (!userId) {
      const demoAdmin = db.prepare("SELECT id FROM users WHERE role IN ('admin', 'superadmin', 'student') LIMIT 1").get() as any;
      if (demoAdmin) userId = demoAdmin.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      question_ids = [],
      title = 'Custom Practice Test from Question Bank',
      description = '',
      test_type = 'custom_test',
      duration_seconds = 1800,
      visibility = 'public',
      status = 'published',
      exam_id = 'exam-ssc-cgl-2026',
      subject_id = null,
    } = body;

    if (!Array.isArray(question_ids) || question_ids.length === 0) {
      return NextResponse.json({ error: 'Please select at least 1 question' }, { status: 400 });
    }

    const placeholders = question_ids.map(() => '?').join(',');
    const qbRows = db.prepare(`SELECT * FROM question_bank WHERE id IN (${placeholders})`).all(...question_ids) as any[];

    if (qbRows.length === 0) {
      return NextResponse.json({ error: 'Selected questions not found in Question Bank' }, { status: 404 });
    }

    const newTestId = `test-qb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    // 1. Insert Test
    db.prepare(`
      INSERT INTO tests (
        id, user_id, title, description, subject, section_id, duration_seconds,
        marking_scheme_type, default_correct_marks, default_negative_marks, default_unanswered_marks,
        shuffle_questions, shuffle_options, allow_navigation, show_palette, allow_review_marking, show_immediate_results,
        test_type, exam_id, subject_id, visibility, status, is_paid, price_inr, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'sec-ssc', ?, 'standard', 2.0, 0.5, 0.0, 1, 1, 1, 1, 1, 1, ?, ?, ?, ?, ?, 0, 0.0, ?, ?)
    `).run(
      newTestId,
      userId,
      title.trim(),
      description.trim() || `Assembled from ${qbRows.length} repository questions.`,
      'Question Bank Composite',
      Number(duration_seconds),
      test_type,
      exam_id,
      subject_id || qbRows[0]?.subject_id || null,
      visibility,
      status,
      now,
      now
    );

    // 2. Insert Questions
    const insertQ = db.prepare(`
      INSERT INTO questions (
        id, test_id, question_number, question_text, question_type, options_json,
        correct_answer, correct_marks, negative_marks, unanswered_marks, explanation,
        parsing_confidence, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0.0, ?, 1.0, ?, ?)
    `);

    qbRows.forEach((q, idx) => {
      const qId = crypto.randomUUID();
      insertQ.run(
        qId,
        newTestId,
        idx + 1,
        q.question_text,
        q.question_type || 'single',
        q.options_json,
        q.correct_answer,
        q.marks || 2.0,
        q.negative_marks || 0.5,
        q.explanation || '',
        now,
        now
      );

      // Update usage_count & used_in_tests_json in question_bank
      try {
        let usedIn: string[] = [];
        try { usedIn = JSON.parse(q.used_in_tests_json || '[]'); } catch {}
        if (!usedIn.includes(title.trim())) {
          usedIn.push(title.trim());
        }
        db.prepare('UPDATE question_bank SET usage_count = usage_count + 1, used_in_tests_json = ? WHERE id = ?').run(JSON.stringify(usedIn), q.id);
      } catch (uErr) {
        console.warn('Usage update notice:', uErr);
      }
    });

    return NextResponse.json({
      success: true,
      test_id: newTestId,
      testId: newTestId,
      question_count: qbRows.length,
      title: title.trim(),
    });
  } catch (error: any) {
    console.error('Error creating test from question bank:', error);
    return NextResponse.json(
      { error: 'Failed to assemble test from question bank', details: error.message },
      { status: 500 }
    );
  }
}
