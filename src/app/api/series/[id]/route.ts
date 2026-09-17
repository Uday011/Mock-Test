import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, getOrCreateDemoUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    let user = await getCurrentUser();
    if (!user) user = getOrCreateDemoUser();

    // 1. Fetch Series Details
    const seriesStmt = db.prepare(`
      SELECT ts.*,
             e.title as exam_title,
             u.name as creator_name,
             ep.headline as creator_headline,
             ep.bio as creator_bio,
             ep.institute_name as creator_institute,
             ep.verification_status as creator_verification
      FROM test_series ts
      LEFT JOIN exams e ON ts.exam_id = e.id
      LEFT JOIN users u ON ts.creator_id = u.id
      LEFT JOIN educator_profiles ep ON ts.creator_id = ep.user_id
      WHERE ts.id = ?
    `);
    const series = seriesStmt.get(id) as any;

    if (!series) {
      return NextResponse.json({ error: 'Test series not found' }, { status: 404 });
    }

    // 2. Check User's Enrollment / Access Status
    const isCreator = user.id === series.creator_id;
    const isFreeSeries = !series.is_paid || series.price_inr === 0;

    let hasSeriesAccess = isCreator || isFreeSeries;

    // Check purchases table
    const purchaseCheck = db.prepare(`
      SELECT id FROM purchases
      WHERE user_id = ? AND item_id = ? AND access_status = 'active'
    `).get(user.id, id);

    if (purchaseCheck) {
      hasSeriesAccess = true;
    }

    // Fetch user enrollment
    const enrollStmt = db.prepare(`
      SELECT * FROM user_series_enrollments
      WHERE user_id = ? AND series_id = ?
    `);
    const enrollment = enrollStmt.get(user.id, id) as any;

    if (enrollment?.access_tier === 'paid' || enrollment?.access_tier === 'granted') {
      hasSeriesAccess = true;
    }

    // 3. Fetch Ordered Test Items in this Series
    const itemsStmt = db.prepare(`
      SELECT tsi.id as series_item_id,
             tsi.sequence_order,
             tsi.is_free_preview,
             tsi.unlock_rule,
             t.id as test_id,
             t.title as test_title,
             t.description as test_description,
             t.duration_seconds,
             t.difficulty,
             t.test_type,
             (SELECT COUNT(*) FROM questions q WHERE q.test_id = t.id) as question_count,
             (SELECT COUNT(*) FROM test_attempts ta WHERE ta.test_id = t.id AND ta.user_id = ? AND ta.status = 'completed') as user_attempt_count,
             (SELECT MAX(final_score) FROM test_attempts ta WHERE ta.test_id = t.id AND ta.user_id = ?) as best_score
      FROM test_series_items tsi
      JOIN tests t ON tsi.test_id = t.id
      WHERE tsi.series_id = ?
      ORDER BY tsi.sequence_order ASC
    `);

    const rawItems = itemsStmt.all(user.id, user.id, id) as any[];

    let completedCount = 0;
    const items = rawItems.map((item) => {
      const isAttempted = Number(item.user_attempt_count || 0) > 0;
      if (isAttempted) completedCount++;

      const itemHasAccess = hasSeriesAccess || Boolean(item.is_free_preview);

      return {
        id: item.series_item_id,
        test_id: item.test_id,
        sequence_order: item.sequence_order,
        is_free_preview: Boolean(item.is_free_preview),
        unlock_rule: item.unlock_rule,
        test_title: item.test_title,
        test_description: item.test_description,
        duration_seconds: item.duration_seconds,
        difficulty: item.difficulty,
        test_type: item.test_type,
        question_count: item.question_count || 25,
        is_attempted: isAttempted,
        best_score: item.best_score,
        has_access: itemHasAccess,
      };
    });

    const totalTests = items.length;
    const progressPct = totalTests > 0 ? Math.round((completedCount / totalTests) * 100) : 0;

    return NextResponse.json({
      success: true,
      series: {
        ...series,
        is_paid: Boolean(series.is_paid),
        has_access: hasSeriesAccess,
        is_enrolled: Boolean(enrollment),
        items,
        user_progress: {
          completed_tests_count: completedCount,
          total_tests: totalTests,
          progress_percentage: progressPct,
          access_tier: enrollment?.access_tier || (hasSeriesAccess ? 'paid' : 'free_preview'),
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch series details' }, { status: 500 });
  }
}
