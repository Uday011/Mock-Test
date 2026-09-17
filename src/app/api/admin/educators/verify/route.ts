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

    const educatorsStmt = db.prepare(`
      SELECT 
        u.id as user_id,
        u.name,
        u.email,
        u.role,
        COALESCE(ep.institute_name, u.institute_name, 'Academic Faculty') as institute_name,
        COALESCE(ep.headline, 'Educator') as headline,
        COALESCE(ep.verification_status, 'verified') as verification_status,
        COALESCE(ep.publication_status, 'active') as publication_status,
        COALESCE(ep.total_students, 0) as total_students,
        COALESCE(ep.average_rating, 5.0) as average_rating,
        COUNT(DISTINCT t.id) as authored_tests_count,
        COUNT(DISTINCT ts.id) as series_count
      FROM users u
      LEFT JOIN educator_profiles ep ON ep.user_id = u.id
      LEFT JOIN tests t ON t.user_id = u.id
      LEFT JOIN test_series ts ON ts.creator_id = u.id
      WHERE u.role IN ('admin', 'superadmin') OR u.roles_json LIKE '%educator%' OR u.roles_json LIKE '%creator%' OR ep.user_id IS NOT NULL
      GROUP BY u.id
      ORDER BY authored_tests_count DESC, u.created_at DESC
    `);
    const educators = educatorsStmt.all() as any[];

    return NextResponse.json({
      success: true,
      educators: educators.map((e) => ({
        user_id: e.user_id,
        name: e.name,
        email: e.email,
        role: e.role,
        institute_name: e.institute_name,
        headline: e.headline,
        verification_status: e.verification_status,
        publication_status: e.publication_status,
        total_students: Number(e.total_students || 0),
        average_rating: Number(e.average_rating || 5.0),
        authored_tests_count: Number(e.authored_tests_count || 0),
        series_count: Number(e.series_count || 0),
      })),
    });
  } catch (err: any) {
    console.error('Error fetching educators:', err);
    return NextResponse.json({ error: err?.message || 'Failed to fetch educators' }, { status: 500 });
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
    const { user_id, verification_status } = body;

    if (!user_id || !verification_status) {
      return NextResponse.json({ error: 'user_id and verification_status are required' }, { status: 400 });
    }

    if (!['unverified', 'pending', 'verified'].includes(verification_status)) {
      return NextResponse.json({ error: 'Invalid verification status' }, { status: 400 });
    }

    // Check if educator profile exists
    const existing = db.prepare('SELECT user_id FROM educator_profiles WHERE user_id = ?').get(user_id);

    if (existing) {
      db.prepare('UPDATE educator_profiles SET verification_status = ? WHERE user_id = ?').run(
        verification_status,
        user_id
      );
    } else {
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO educator_profiles (
          user_id, headline, bio, institute_name, verification_status, publication_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        user_id,
        'Academic Faculty Member',
        'Verified educator on Nalanda platform.',
        'Academic Institution',
        verification_status,
        'active',
        now
      );
    }

    return NextResponse.json({
      success: true,
      message: `Educator verification status updated to ${verification_status}`,
      user_id,
      verification_status,
    });
  } catch (err: any) {
    console.error('Error updating educator verification:', err);
    return NextResponse.json({ error: err?.message || 'Failed to update verification' }, { status: 500 });
  }
}
