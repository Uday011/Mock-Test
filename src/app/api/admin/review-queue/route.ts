import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, getOrCreateRoleDemoUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    let user = await getCurrentUser();
    if (!user) {
      user = getOrCreateRoleDemoUser('superadmin');
    }

    const queueStmt = db.prepare(`
      SELECT 
        t.id,
        t.title,
        t.description,
        t.subject,
        t.duration_seconds,
        t.difficulty,
        t.test_type,
        t.status,
        t.visibility,
        t.is_paid,
        t.price_inr,
        t.review_notes,
        t.created_at,
        u.id as creator_id,
        u.name as creator_name,
        u.email as creator_email,
        u.role as creator_role,
        COALESCE(ep.institute_name, u.institute_name, 'Independent Educator') as creator_institute,
        ep.verification_status as creator_verification_status,
        COUNT(DISTINCT q.id) as question_count
      FROM tests t
      JOIN users u ON u.id = t.user_id
      LEFT JOIN educator_profiles ep ON ep.user_id = u.id
      LEFT JOIN questions q ON q.test_id = t.id
      WHERE t.status IN ('under_review', 'revisions_requested') OR t.status IS NULL OR t.status = 'published'
      GROUP BY t.id
      ORDER BY 
        CASE 
          WHEN t.status = 'under_review' THEN 1
          WHEN t.status = 'revisions_requested' THEN 2
          ELSE 3
        END,
        t.created_at DESC
      LIMIT 50
    `);
    const items = queueStmt.all() as any[];

    return NextResponse.json({
      success: true,
      items: items.map((item) => ({
        id: item.id,
        item_type: 'test',
        item_id: item.id,
        title: item.title,
        description: item.description,
        subject: item.subject,
        duration_seconds: item.duration_seconds,
        difficulty: item.difficulty,
        question_count: Number(item.question_count || 0),
        is_paid: Boolean(item.is_paid),
        price_inr: Number(item.price_inr || 0),
        status: item.status || 'published',
        visibility: item.visibility || 'public',
        review_notes: item.review_notes,
        created_at: item.created_at,
        creator: {
          id: item.creator_id,
          name: item.creator_name,
          email: item.creator_email,
          institute: item.creator_institute,
          verification_status: item.creator_verification_status || 'verified',
        },
      })),
    });
  } catch (err: any) {
    console.error('Error fetching review queue:', err);
    return NextResponse.json({ error: err?.message || 'Failed to fetch review queue' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    let user = await getCurrentUser();
    if (!user) {
      user = getOrCreateRoleDemoUser('superadmin');
    }

    const body = await req.json();
    const { test_id, action, review_notes } = body;

    if (!test_id || !action) {
      return NextResponse.json({ error: 'test_id and action are required' }, { status: 400 });
    }

    let newStatus: string;
    let newVisibility = 'public';

    if (action === 'approve') {
      newStatus = 'published';
      newVisibility = 'public';
    } else if (action === 'revisions_requested') {
      newStatus = 'revisions_requested';
    } else if (action === 'reject') {
      newStatus = 'draft';
      newVisibility = 'private';
    } else {
      return NextResponse.json({ error: 'Invalid action. Use approve, revisions_requested, or reject' }, { status: 400 });
    }

    db.prepare(`
      UPDATE tests
      SET 
        status = ?,
        visibility = COALESCE(?, visibility),
        review_notes = ?
      WHERE id = ?
    `).run(newStatus, newVisibility, review_notes || null, test_id);

    return NextResponse.json({
      success: true,
      message: `Test status updated to ${newStatus}`,
      test_id,
      status: newStatus,
    });
  } catch (err: any) {
    console.error('Error reviewing test:', err);
    return NextResponse.json({ error: err?.message || 'Failed to process review' }, { status: 500 });
  }
}
