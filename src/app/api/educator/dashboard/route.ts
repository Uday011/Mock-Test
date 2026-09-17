import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, getOrCreateRoleDemoUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    let user = await getCurrentUser();
    if (!user) {
      user = getOrCreateRoleDemoUser('educator');
    }

    const educatorId = user.id;

    // 1. Fetch Educator Profile
    let profile = db.prepare('SELECT * FROM educator_profiles WHERE user_id = ?').get(educatorId) as any;
    if (!profile) {
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO educator_profiles (
          user_id, headline, bio, institute_name, verification_status,
          specialization_subjects_json, total_students, average_rating,
          published_tests_count, followers_count, publication_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        educatorId,
        'Faculty & Academic Assessment Chair',
        'Academic educator committed to rigorous, standard-aligned test crafting and cognitive diagnostic analytics.',
        user.institute_name || 'Nalanda Academic Faculty',
        'verified',
        JSON.stringify(['Quantitative Aptitude', 'General Studies', 'Reasoning']),
        1250,
        4.9,
        0,
        42,
        'active',
        now
      );
      profile = db.prepare('SELECT * FROM educator_profiles WHERE user_id = ?').get(educatorId);
    }

    // 2. Fetch all tests authored by this educator
    const testsStmt = db.prepare(`
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
        t.series_id,
        t.review_notes,
        t.created_at,
        COUNT(DISTINCT q.id) as question_count,
        COUNT(DISTINCT a.id) as attempts_count,
        AVG(CASE WHEN a.status = 'completed' THEN a.final_score ELSE NULL END) as avg_score,
        AVG(CASE WHEN a.status = 'completed' THEN a.accuracy ELSE NULL END) as avg_accuracy
      FROM tests t
      LEFT JOIN questions q ON q.test_id = t.id
      LEFT JOIN test_attempts a ON a.test_id = t.id
      WHERE t.user_id = ?
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);
    const tests = testsStmt.all(educatorId) as any[];

    // 3. Test Series authored by this educator
    const seriesStmt = db.prepare(`
      SELECT 
        ts.*,
        e.title as exam_title,
        (SELECT COUNT(*) FROM test_series_items tsi WHERE tsi.series_id = ts.id) as total_tests_in_series,
        (SELECT COUNT(*) FROM user_series_enrollments use WHERE use.series_id = ts.id) as active_enrolled_count
      FROM test_series ts
      LEFT JOIN exams e ON e.id = ts.exam_id
      WHERE ts.creator_id = ?
      ORDER BY ts.created_at DESC
    `);
    const testSeries = seriesStmt.all(educatorId) as any[];

    // 4. Metric counts
    const totalPublished = tests.filter((t) => t.status === 'published' || !t.status).length;
    const totalDrafts = tests.filter((t) => t.status === 'draft').length;
    const totalUnderReview = tests.filter((t) => t.status === 'under_review' || t.status === 'revisions_requested').length;
    const totalAttempts = tests.reduce((acc, t) => acc + (Number(t.attempts_count) || 0), 0);
    const paidTestsCount = tests.filter((t) => Boolean(t.is_paid)).length;
    const freeTestsCount = tests.filter((t) => !t.is_paid).length;

    // 5. Learner Engagement / Recent attempts on this educator's tests
    const engagementStmt = db.prepare(`
      SELECT 
        a.id as attempt_id,
        a.test_id,
        t.title as test_title,
        u.id as learner_id,
        u.name as learner_name,
        u.email as learner_email,
        a.final_score,
        a.maximum_marks,
        a.accuracy,
        a.time_taken_seconds,
        a.submitted_at,
        a.created_at
      FROM test_attempts a
      JOIN tests t ON t.id = a.test_id
      JOIN users u ON u.id = a.user_id
      WHERE t.user_id = ? AND a.status = 'completed'
      ORDER BY a.created_at DESC
      LIMIT 10
    `);
    const recentActivity = engagementStmt.all(educatorId) as any[];

    // 6. Monetization & Orders Ledger (Sandbox Simulated)
    // Query orders where item_id matches any of educator's tests or series
    const educatorItemIds = [
      ...tests.map((t) => t.id),
      ...testSeries.map((s) => s.id)
    ];

    let orders: any[] = [];
    if (educatorItemIds.length > 0) {
      const placeholders = educatorItemIds.map(() => '?').join(',');
      const ordersStmt = db.prepare(`
        SELECT 
          o.*,
          u.name as buyer_name,
          u.email as buyer_email
        FROM orders o
        LEFT JOIN users u ON u.id = o.user_id
        WHERE o.item_id IN (${placeholders})
        ORDER BY o.created_at DESC
        LIMIT 25
      `);
      orders = ordersStmt.all(...educatorItemIds) as any[];
    }

    // Compute gross sales, platform fee (15%), net creator payout (85%)
    const completedOrders = orders.filter((o) => o.payment_status === 'completed');
    const grossSalesInr = completedOrders.reduce((sum, o) => sum + Number(o.amount_inr || 0), 0);
    const platformFeeInr = completedOrders.reduce((sum, o) => sum + Number(o.platform_fee_inr || (o.amount_inr * 0.15)), 0);
    const netPayoutInr = grossSalesInr - platformFeeInr;

    // Pending review queue items
    const pendingReviews = tests.filter((t) => t.status === 'under_review' || t.status === 'revisions_requested');

    let specializations = [];
    try {
      specializations = JSON.parse(profile.specialization_subjects_json || '[]');
    } catch {
      specializations = ['Quantitative Aptitude', 'General Studies'];
    }

    return NextResponse.json({
      success: true,
      educator: {
        id: educatorId,
        name: user.name,
        email: user.email,
        role: user.role,
        headline: profile.headline,
        bio: profile.bio,
        institute_name: profile.institute_name,
        verification_status: profile.verification_status,
        publication_status: profile.publication_status || 'active',
        profile_image_url: profile.profile_image_url,
        specializations,
        total_students: profile.total_students || 1250,
        average_rating: profile.average_rating || 4.9,
        followers_count: profile.followers_count || 42,
      },
      stats: {
        total_published: totalPublished,
        total_drafts: totalDrafts,
        total_under_review: totalUnderReview,
        total_series: testSeries.length,
        total_attempts: totalAttempts,
        paid_tests_count: paidTestsCount,
        free_tests_count: freeTestsCount,
      },
      monetization: {
        is_mock_sandbox: true,
        currency: 'INR',
        gross_sales_inr: Math.round(grossSalesInr),
        platform_fee_inr: Math.round(platformFeeInr),
        net_payout_inr: Math.round(netPayoutInr),
        total_orders_count: completedOrders.length,
        ledger: orders.map((o) => ({
          id: o.id,
          receipt_number: o.receipt_number,
          item_type: o.item_type,
          item_id: o.item_id,
          amount_inr: o.amount_inr,
          platform_fee_inr: o.platform_fee_inr,
          creator_earnings_inr: o.creator_earnings_inr,
          payment_status: o.payment_status,
          payment_method: o.payment_method,
          buyer_name: o.buyer_name || 'Anonymous Learner',
          buyer_email: o.buyer_email || '',
          created_at: o.created_at,
        })),
      },
      tests: tests.map((t) => ({
        ...t,
        is_paid: Boolean(t.is_paid),
        price_inr: Number(t.price_inr || 0),
        attempts_count: Number(t.attempts_count || 0),
        avg_score: t.avg_score ? Number(Number(t.avg_score).toFixed(1)) : null,
        avg_accuracy: t.avg_accuracy ? Number(Number(t.avg_accuracy).toFixed(1)) : null,
      })),
      test_series: testSeries.map((s) => ({
        ...s,
        is_paid: Boolean(s.is_paid),
        price_inr: Number(s.price_inr || 0),
        total_tests: s.total_tests_in_series || s.total_tests || 0,
        enrolled_count: s.active_enrolled_count || s.enrolled_count || 0,
      })),
      recent_activity: recentActivity,
      pending_reviews: pendingReviews,
    });
  } catch (err: any) {
    console.error('Error fetching educator dashboard:', err);
    return NextResponse.json({ error: err?.message || 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
