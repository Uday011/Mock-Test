import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, getOrCreateDemoUser } from '@/lib/auth';
import crypto from 'crypto';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  let user = await getCurrentUser();
  if (!user) user = getOrCreateDemoUser();

  try {
    const testStmt = db.prepare(`
      SELECT 
        t.*,
        u.name as creator_name,
        u.role as creator_role,
        ep.headline as creator_headline,
        ep.institute_name as creator_institute,
        ep.verification_status as creator_verification,
        ep.followers_count as creator_followers_count,
        CASE WHEN st.id IS NOT NULL THEN 1 ELSE 0 END as is_bookmarked,
        (SELECT COUNT(*) FROM test_attempts WHERE test_id = t.id AND status = 'completed') as total_attempts_count
      FROM tests t
      LEFT JOIN users u ON u.id = t.user_id
      LEFT JOIN educator_profiles ep ON ep.user_id = t.user_id
      LEFT JOIN saved_tests st ON st.test_id = t.id AND st.user_id = ?
      WHERE t.id = ?
    `);
    const test = testStmt.get(user.id, id) as any;

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    const questionsStmt = db.prepare('SELECT * FROM questions WHERE test_id = ? ORDER BY question_number ASC');
    const questionsRaw = questionsStmt.all(id) as any[];

    const questions = questionsRaw.map(q => ({
      ...q,
      options: JSON.parse(q.options_json || '[]'),
    }));

    const attemptsStmt = db.prepare(`
      SELECT * FROM test_attempts 
      WHERE test_id = ? 
      ORDER BY created_at DESC
    `);
    const attempts = attemptsStmt.all(id) as any[];
    const isOwner = user.id === test.user_id;
    const isFree = !test.is_paid || Number(test.price_inr) === 0;
    let hasAccess = isOwner || isFree;

    if (!hasAccess) {
      // Check direct purchases
      const directPurchase = db.prepare(`
        SELECT id FROM purchases WHERE user_id = ? AND item_id = ? AND access_status = 'active'
      `).get(user.id, id);

      if (directPurchase) {
        hasAccess = true;
      } else {
        // Check if covered by an active test series enrollment or free preview item
        const seriesCheck = db.prepare(`
          SELECT tsi.id
          FROM test_series_items tsi
          LEFT JOIN user_series_enrollments use ON use.series_id = tsi.series_id AND use.user_id = ?
          WHERE tsi.test_id = ? AND (use.access_tier IN ('paid', 'granted') OR tsi.is_free_preview = 1)
        `).get(user.id, id);
        if (seriesCheck) {
          hasAccess = true;
        }
      }
    }

    return NextResponse.json({
      test: {
        ...test,
        has_access: hasAccess,
        is_bookmarked: Boolean(test.is_bookmarked),
        is_paid: Boolean(test.is_paid),
        trust_label: test.trust_label || 'Community Created',
        rating: test.rating || 4.8,
        total_attempts_count: test.total_attempts_count || 0,
        shuffle_questions: Boolean(test.shuffle_questions),
        shuffle_options: Boolean(test.shuffle_options),
        allow_navigation: Boolean(test.allow_navigation),
        show_palette: Boolean(test.show_palette),
        allow_review_marking: Boolean(test.allow_review_marking),
        show_immediate_results: Boolean(test.show_immediate_results),
        questions,
        attempts,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch test' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  let user = await getCurrentUser();
  if (!user) user = getOrCreateDemoUser();

  try {
    const body = await req.json();
    const testStmt = db.prepare('SELECT * FROM tests WHERE id = ?');
    const existingTest = testStmt.get(id) as any;

    if (!existingTest) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    const now = new Date().toISOString();

    // Handle Rename or Configuration Update
    const title = body.title !== undefined ? body.title.trim() : existingTest.title;
    const description = body.description !== undefined ? body.description.trim() : existingTest.description;
    const subject = body.subject !== undefined ? body.subject.trim() : existingTest.subject;
    const duration_seconds = body.duration_seconds !== undefined ? Number(body.duration_seconds) : existingTest.duration_seconds;
    const default_correct_marks = body.default_correct_marks !== undefined ? Number(body.default_correct_marks) : existingTest.default_correct_marks;
    const default_negative_marks = body.default_negative_marks !== undefined ? Number(body.default_negative_marks) : existingTest.default_negative_marks;
    const default_unanswered_marks = body.default_unanswered_marks !== undefined ? Number(body.default_unanswered_marks) : existingTest.default_unanswered_marks;
    const marking_scheme_type = body.marking_scheme_type !== undefined ? body.marking_scheme_type : existingTest.marking_scheme_type;

    const shuffle_questions = body.shuffle_questions !== undefined ? (body.shuffle_questions ? 1 : 0) : existingTest.shuffle_questions;
    const shuffle_options = body.shuffle_options !== undefined ? (body.shuffle_options ? 1 : 0) : existingTest.shuffle_options;
    const allow_navigation = body.allow_navigation !== undefined ? (body.allow_navigation ? 1 : 0) : existingTest.allow_navigation;
    const show_palette = body.show_palette !== undefined ? (body.show_palette ? 1 : 0) : existingTest.show_palette;
    const allow_review_marking = body.allow_review_marking !== undefined ? (body.allow_review_marking ? 1 : 0) : existingTest.allow_review_marking;
    const show_immediate_results = body.show_immediate_results !== undefined ? (body.show_immediate_results ? 1 : 0) : existingTest.show_immediate_results;

    const updateTest = db.prepare(`
      UPDATE tests SET
        title = ?,
        description = ?,
        subject = ?,
        duration_seconds = ?,
        marking_scheme_type = ?,
        default_correct_marks = ?,
        default_negative_marks = ?,
        default_unanswered_marks = ?,
        shuffle_questions = ?,
        shuffle_options = ?,
        allow_navigation = ?,
        show_palette = ?,
        allow_review_marking = ?,
        show_immediate_results = ?,
        updated_at = ?
      WHERE id = ?
    `);

    updateTest.run(
      title,
      description,
      subject,
      duration_seconds,
      marking_scheme_type,
      default_correct_marks,
      default_negative_marks,
      default_unanswered_marks,
      shuffle_questions,
      shuffle_options,
      allow_navigation,
      show_palette,
      allow_review_marking,
      show_immediate_results,
      now,
      id
    );

    // If questions were also provided for update
    if (Array.isArray(body.questions) && body.questions.length > 0) {
      // Delete existing questions and replace with updated set
      const deleteOld = db.prepare('DELETE FROM questions WHERE test_id = ?');
      deleteOld.run(id);

      const insertQ = db.prepare(`
        INSERT INTO questions (
          id, test_id, question_number, question_text, question_image_url, question_type,
          options_json, correct_answer, correct_marks, negative_marks, unanswered_marks,
          explanation, parsing_confidence, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (let i = 0; i < body.questions.length; i++) {
        const q = body.questions[i];
        const qId = q.id || crypto.randomUUID();
        const qNum = q.question_number || i + 1;
        const opts = Array.isArray(q.options) ? q.options : [];
        const correct = (q.correct_answer || 'A').toUpperCase().trim();

        const correctMarks = marking_scheme_type === 'custom' && q.correct_marks != null
          ? Number(q.correct_marks)
          : default_correct_marks;

        const negativeMarks = marking_scheme_type === 'custom' && q.negative_marks != null
          ? Number(q.negative_marks)
          : default_negative_marks;

        insertQ.run(
          qId,
          id,
          qNum,
          q.question_text || `Question ${qNum}`,
          q.question_image_url || null,
          q.question_type || 'single',
          JSON.stringify(opts),
          correct,
          correctMarks,
          negativeMarks,
          default_unanswered_marks,
          q.explanation || null,
          q.confidence || 1.0,
          now,
          now
        );
      }
    }

    return NextResponse.json({ success: true, message: 'Test updated successfully' });
  } catch (err: any) {
    console.error('Error updating test:', err);
    return NextResponse.json({ error: err?.message || 'Failed to update test' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  try {
    const deleteStmt = db.prepare('DELETE FROM tests WHERE id = ?');
    deleteStmt.run(id);
    return NextResponse.json({ success: true, message: 'Test deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete test' }, { status: 500 });
  }
}
