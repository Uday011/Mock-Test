import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedInitialData } from '@/lib/db/seed';
import { getCurrentUser, getOrCreateDemoUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    seedInitialData();

    let user = await getCurrentUser();
    if (!user) {
      user = getOrCreateDemoUser();
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || searchParams.get('search');
    const examId = searchParams.get('exam_id');
    const subjectId = searchParams.get('subject_id');
    const topicId = searchParams.get('topic_id');
    const testType = searchParams.get('test_type');
    const difficulty = searchParams.get('difficulty');
    const duration = searchParams.get('duration');
    const isPaid = searchParams.get('is_paid');
    const trustLabel = searchParams.get('trust_label');
    const sort = searchParams.get('sort') || 'recently_published';

    // 1. Fetch Public Tests
    let query = `
      SELECT 
        t.*,
        u.name as created_by_name,
        u.role as created_by_role,
        ep.headline as creator_headline,
        ep.institute_name as creator_institute,
        ep.verification_status as creator_verification,
        COUNT(DISTINCT q.id) as question_count,
        COUNT(DISTINCT a.id) as attempts_count,
        AVG(a.final_score) as avg_score,
        CASE WHEN st.id IS NOT NULL THEN 1 ELSE 0 END as is_bookmarked
      FROM tests t
      LEFT JOIN users u ON u.id = t.user_id
      LEFT JOIN educator_profiles ep ON ep.user_id = t.user_id
      LEFT JOIN questions q ON q.test_id = t.id
      LEFT JOIN test_attempts a ON a.test_id = t.id AND a.status = 'completed'
      LEFT JOIN saved_tests st ON st.test_id = t.id AND st.user_id = ?
      WHERE (t.status = 'published' OR t.status IS NULL)
        AND (t.visibility = 'public' OR t.visibility IS NULL)
    `;
    const params: any[] = [user.id];

    if (examId && examId !== 'all') {
      query += ' AND (t.exam_id = ? OR t.exam_id IS NULL)';
      params.push(examId);
    }
    if (subjectId && subjectId !== 'all') {
      query += ' AND (t.subject_id = ? OR t.subject LIKE ?)';
      params.push(subjectId, `%${subjectId}%`);
    }
    if (topicId && topicId !== 'all') {
      query += ' AND t.topic_id = ?';
      params.push(topicId);
    }
    if (testType && testType !== 'all') {
      query += ' AND t.test_type = ?';
      params.push(testType);
    }
    if (difficulty && difficulty !== 'all') {
      query += ' AND t.difficulty = ?';
      params.push(difficulty);
    }
    if (trustLabel && trustLabel !== 'all') {
      query += ' AND t.trust_label = ?';
      params.push(trustLabel);
    }
    if (isPaid !== null && isPaid !== undefined && isPaid !== 'all') {
      const isPaidNum = isPaid === '1' || isPaid === 'true' ? 1 : 0;
      query += ' AND t.is_paid = ?';
      params.push(isPaidNum);
    }
    if (search && search.trim()) {
      query += ' AND (t.title LIKE ? OR t.description LIKE ? OR t.subject LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ' GROUP BY t.id';

    // Sorting
    if (sort === 'most_attempted') {
      query += ' ORDER BY attempts_count DESC, t.created_at DESC';
    } else if (sort === 'highest_rated') {
      query += ' ORDER BY t.rating DESC, t.created_at DESC';
    } else {
      // Default: recently_published
      query += ' ORDER BY t.created_at DESC';
    }

    const testsStmt = db.prepare(query);
    let tests = testsStmt.all(...params) as any[];

    // In-memory duration filtering
    if (duration && duration !== 'all') {
      if (duration === 'short') tests = tests.filter((t) => t.duration_seconds > 0 && t.duration_seconds <= 1800);
      else if (duration === 'medium') tests = tests.filter((t) => t.duration_seconds > 1800 && t.duration_seconds <= 3600);
      else if (duration === 'long') tests = tests.filter((t) => t.duration_seconds > 3600);
    }

    const enrichedTests = tests.map((t) => ({
      ...t,
      is_bookmarked: Boolean(t.is_bookmarked),
      is_paid: Boolean(t.is_paid),
      rating: t.rating || 4.8,
      trust_label: t.trust_label || 'Community Created',
      tags: (() => {
        try {
          return JSON.parse(t.tags_json || '[]');
        } catch {
          return [];
        }
      })(),
    }));

    // 2. Fetch Public Test Series
    const tsQuery = `
      SELECT 
        ts.*,
        u.name as creator_name,
        ep.headline as creator_headline,
        ep.institute_name as creator_institute,
        ep.verification_status as creator_verification,
        e.title as exam_title
      FROM test_series ts
      LEFT JOIN users u ON u.id = ts.creator_id
      LEFT JOIN educator_profiles ep ON ep.user_id = ts.creator_id
      LEFT JOIN exams e ON e.id = ts.exam_id
      WHERE ts.status = 'published'
      ORDER BY ts.enrolled_count DESC, ts.created_at DESC
    `;
    const testSeries = db.prepare(tsQuery).all() as any[];

    // 3. Fetch Featured Educators
    const creatorsQuery = `
      SELECT 
        u.id,
        u.name,
        u.role,
        ep.headline,
        ep.bio,
        ep.institute_name,
        ep.verification_status,
        ep.specialization_subjects_json,
        ep.total_students,
        ep.average_rating,
        ep.published_tests_count,
        ep.followers_count,
        CASE WHEN cf.id IS NOT NULL THEN 1 ELSE 0 END as is_following
      FROM educator_profiles ep
      JOIN users u ON u.id = ep.user_id
      LEFT JOIN creator_follows cf ON cf.creator_id = u.id AND cf.follower_id = ?
      ORDER BY ep.total_students DESC, ep.average_rating DESC
      LIMIT 10
    `;
    const creatorsRaw = db.prepare(creatorsQuery).all(user.id) as any[];
    const creators = creatorsRaw.map((c) => ({
      ...c,
      is_following: Boolean(c.is_following),
      specializations: (() => {
        try {
          return JSON.parse(c.specialization_subjects_json || '[]');
        } catch {
          return [];
        }
      })(),
    }));

    return NextResponse.json({
      success: true,
      tests: enrichedTests,
      test_series: testSeries,
      creators,
      stats: {
        totalPublicTests: enrichedTests.length,
        totalTestSeries: testSeries.length,
        totalEducators: creators.length,
      },
    });
  } catch (err: any) {
    console.error('Error fetching public library:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch public library' },
      { status: 500 }
    );
  }
}
