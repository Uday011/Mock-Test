import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import crypto from 'crypto';

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

    const body = await req.json().catch(() => ({}));
    const { mistake_ids, category, count = 5 } = body;

    let selectedMistakes: any[] = [];

    if (Array.isArray(mistake_ids) && mistake_ids.length > 0) {
      const placeholders = mistake_ids.map(() => '?').join(',');
      const stmt = db.prepare(`SELECT * FROM mistake_records WHERE id IN (${placeholders}) AND user_id = ?`);
      selectedMistakes = stmt.all(...mistake_ids, userId) as any[];
    } else {
      let query = 'SELECT * FROM mistake_records WHERE user_id = ? AND is_resolved = 0';
      const params: any[] = [userId];

      if (category && category !== 'all') {
        query += ' AND error_category = ?';
        params.push(category);
      }

      query += ' ORDER BY created_at DESC LIMIT ?';
      params.push(Number(count) || 5);

      selectedMistakes = db.prepare(query).all(...params) as any[];
    }

    if (selectedMistakes.length === 0) {
      // Fallback: pick any mistakes for this user
      selectedMistakes = db.prepare('SELECT * FROM mistake_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 5').all(userId) as any[];
    }

    if (selectedMistakes.length === 0) {
      return NextResponse.json({ error: 'No mistake records available to assemble a test' }, { status: 400 });
    }

    const newTestId = `test-remedial-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();
    const durationSeconds = Math.max(300, selectedMistakes.length * 90);

    const firstMistake = selectedMistakes[0];
    const categoryLabel = category && category !== 'all' ? ` (${category.replace('_', ' ')})` : '';

    // Insert new test into tests table
    db.prepare(`
      INSERT INTO tests (
        id, user_id, title, description, subject, section_id, duration_seconds,
        marking_scheme_type, default_correct_marks, default_negative_marks, default_unanswered_marks,
        shuffle_questions, shuffle_options, allow_navigation, show_palette, allow_review_marking, show_immediate_results,
        test_type, exam_id, subject_id, visibility, is_paid, price_inr, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 1, 1, 1, 1, 'mixed_revision_test', ?, ?, 'private', 0, 0, ?, ?)
    `).run(
      newTestId,
      userId,
      `Remedial Revision Sprint${categoryLabel} [${selectedMistakes.length} Qs]`,
      `Targeted remedial drill generated from your forensic mistake notebook to eliminate error patterns and cement problem-solving mechanics.`,
      'Forensic Error Revision',
      'sec-ssc',
      durationSeconds,
      'standard',
      2.0,
      0.5,
      0.0,
      firstMistake?.exam_id || 'exam-ssc-cgl-2026',
      firstMistake?.subject_id || 'subj-cgl-quant',
      now,
      now
    );

    // Insert questions
    const insertQ = db.prepare(`
      INSERT INTO questions (
        id, test_id, question_number, question_text, question_type, options_json,
        correct_answer, correct_marks, negative_marks, unanswered_marks, explanation,
        parsing_confidence, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'single', ?, ?, 2.0, 0.5, 0.0, ?, 1.0, ?, ?)
    `);

    selectedMistakes.forEach((m, idx) => {
      const qId = `q-rem-${Date.now()}-${idx + 1}`;
      insertQ.run(
        qId,
        newTestId,
        idx + 1,
        m.question_text,
        m.options_json,
        m.correct_answer,
        m.explanation || '',
        now,
        now
      );
    });

    return NextResponse.json({
      success: true,
      test_id: newTestId,
      question_count: selectedMistakes.length,
      duration_seconds: durationSeconds,
    });
  } catch (error: any) {
    console.error('Error creating remedial test from mistakes:', error);
    return NextResponse.json(
      { error: 'Failed to create remedial test', details: error.message },
      { status: 500 }
    );
  }
}
