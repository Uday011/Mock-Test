import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, getOrCreateDemoUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: creatorId } = await params;
  const db = getDb();

  let viewer = await getCurrentUser();
  if (!viewer) viewer = getOrCreateDemoUser();

  try {
    // 1. Fetch User & Educator Profile
    const profileStmt = db.prepare(`
      SELECT 
        u.id,
        u.name,
        u.role,
        COALESCE(ep.institute_name, u.institute_name, 'Nalanda Academic Faculty') as institute_name,
        COALESCE(ep.headline, 'Faculty & Academic Assessment Chair') as headline,
        COALESCE(ep.bio, 'Academic faculty member dedicated to standardized test preparation, rigorous error-free question design, and cognitive forensics.') as bio,
        COALESCE(ep.verification_status, 'verified') as verification_status,
        COALESCE(ep.specialization_subjects_json, '["Quantitative Aptitude", "General Intelligence", "Exam Pedagogy"]') as specialization_subjects_json,
        COALESCE(ep.total_students, 1250) as total_students,
        COALESCE(ep.average_rating, 4.9) as average_rating,
        COALESCE(ep.published_tests_count, 12) as published_tests_count,
        COALESCE(ep.followers_count, 0) as followers_count
      FROM users u
      LEFT JOIN educator_profiles ep ON ep.user_id = u.id
      WHERE u.id = ?
    `);
    const creator = profileStmt.get(creatorId) as any;

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    // 2. Check follow status
    const followCheck = db.prepare(
      'SELECT id FROM creator_follows WHERE follower_id = ? AND creator_id = ?'
    ).get(viewer.id, creatorId);

    // 3. Fetch published public tests
    const testsStmt = db.prepare(`
      SELECT 
        t.id,
        t.title,
        t.description,
        t.subject,
        t.duration_seconds,
        t.difficulty,
        t.test_type,
        t.trust_label,
        t.rating,
        t.ratings_count,
        t.is_paid,
        t.created_at,
        COUNT(DISTINCT q.id) as question_count,
        COUNT(DISTINCT a.id) as attempts_count,
        CASE WHEN st.id IS NOT NULL THEN 1 ELSE 0 END as is_bookmarked
      FROM tests t
      LEFT JOIN questions q ON q.test_id = t.id
      LEFT JOIN test_attempts a ON a.test_id = t.id AND a.status = 'completed'
      LEFT JOIN saved_tests st ON st.test_id = t.id AND st.user_id = ?
      WHERE t.user_id = ?
        AND (t.status = 'published' OR t.status IS NULL)
        AND (t.visibility = 'public' OR t.visibility IS NULL)
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);
    const tests = testsStmt.all(viewer.id, creatorId) as any[];

    // 4. Fetch test series
    const seriesStmt = db.prepare(`
      SELECT 
        ts.*,
        e.title as exam_title
      FROM test_series ts
      LEFT JOIN exams e ON e.id = ts.exam_id
      WHERE ts.creator_id = ? AND ts.status = 'published'
      ORDER BY ts.created_at DESC
    `);
    const testSeries = seriesStmt.all(creatorId) as any[];

    let specializations = [];
    try {
      specializations = JSON.parse(creator.specialization_subjects_json || '[]');
    } catch {
      specializations = ['Quantitative Aptitude', 'General Intelligence'];
    }

    return NextResponse.json({
      success: true,
      creator: {
        id: creator.id,
        name: creator.name,
        role: creator.role,
        institute_name: creator.institute_name,
        headline: creator.headline,
        bio: creator.bio,
        verification_status: creator.verification_status,
        specializations,
        total_students: creator.total_students,
        average_rating: creator.average_rating,
        published_tests_count: tests.length || creator.published_tests_count,
        followers_count: creator.followers_count,
        is_following: Boolean(followCheck),
      },
      tests: tests.map((t) => ({
        ...t,
        is_bookmarked: Boolean(t.is_bookmarked),
        is_paid: Boolean(t.is_paid),
        trust_label: t.trust_label || 'Community Created',
        rating: t.rating || 4.8,
      })),
      test_series: testSeries,
    });
  } catch (err: any) {
    console.error('Error fetching creator profile:', err);
    return NextResponse.json({ error: err?.message || 'Failed to fetch creator profile' }, { status: 500 });
  }
}
