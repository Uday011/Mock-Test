import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, getOrCreateDemoUser } from '@/lib/auth';
import crypto from 'crypto';

const VALID_CATEGORIES = [
  'incorrect_answer',
  'incorrect_explanation',
  'ambiguous_question',
  'wrong_topic',
  'duplicate_content',
  'copyright_concern',
  'offensive_content',
  'formatting_issue',
];

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    let user = await getCurrentUser();
    if (!user) user = getOrCreateDemoUser();

    const body = await req.json();
    const { test_id, question_id, question_number, category, description } = body;
    const resolvedQuestionId = question_id || (question_number != null ? String(question_number) : null);

    if (!test_id) {
      return NextResponse.json({ error: 'Test ID is required' }, { status: 400 });
    }

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!description || description.trim().length < 5) {
      return NextResponse.json(
        { error: 'Please provide a descriptive explanation (minimum 5 characters).' },
        { status: 400 }
      );
    }

    // Verify test exists
    const test = db.prepare('SELECT id, title FROM tests WHERE id = ?').get(test_id) as any;
    if (!test) {
      return NextResponse.json({ error: 'Referenced test was not found' }, { status: 404 });
    }

    const reportId = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO test_reports (
        id, test_id, user_id, question_id, category, description, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(
      reportId,
      test_id,
      user.id,
      resolvedQuestionId,
      category,
      description.trim(),
      now
    );

    return NextResponse.json({
      success: true,
      reportId,
      message: 'Your report has been submitted for academic and moderation review.',
    });
  } catch (err: any) {
    console.error('Error submitting report:', err);
    return NextResponse.json({ error: err?.message || 'Failed to submit report' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const testId = searchParams.get('test_id');
    const status = searchParams.get('status');

    let query = `
      SELECT 
        tr.*,
        t.title as test_title,
        u.name as reporter_name,
        u.email as reporter_email
      FROM test_reports tr
      LEFT JOIN tests t ON t.id = tr.test_id
      LEFT JOIN users u ON u.id = tr.user_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (testId) {
      query += ' AND tr.test_id = ?';
      params.push(testId);
    }
    if (status && status !== 'all') {
      query += ' AND tr.status = ?';
      params.push(status);
    }

    query += ' ORDER BY tr.created_at DESC';

    const reports = db.prepare(query).all(...params);

    return NextResponse.json({
      success: true,
      reports,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const db = getDb();
    let user = await getCurrentUser();
    if (!user) user = getOrCreateDemoUser();

    const body = await req.json();
    const { id, status, admin_notes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Report ID and new status are required' }, { status: 400 });
    }

    const validStatuses = ['pending', 'under_review', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Status must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    db.prepare(`
      UPDATE test_reports 
      SET status = ?, admin_notes = COALESCE(?, admin_notes)
      WHERE id = ?
    `).run(status, admin_notes || null, id);

    return NextResponse.json({
      success: true,
      message: `Report status updated to ${status}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update report' }, { status: 500 });
  }
}
