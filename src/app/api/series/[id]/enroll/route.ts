import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, getOrCreateDemoUser } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    let user = await getCurrentUser();
    if (!user) user = getOrCreateDemoUser();

    const series = db.prepare('SELECT id, is_paid, price_inr FROM test_series WHERE id = ?').get(id) as any;
    if (!series) {
      return NextResponse.json({ error: 'Test series not found' }, { status: 404 });
    }

    if (series.is_paid && series.price_inr > 0) {
      return NextResponse.json(
        { error: 'This is a premium series. Please unlock it via checkout.', is_paid: true },
        { status: 402 }
      );
    }

    const now = new Date().toISOString();
    const enrollId = `enr-${crypto.randomUUID().slice(0, 8)}`;

    db.prepare(`
      INSERT INTO user_series_enrollments (
        id, user_id, series_id, access_tier, progress_percentage, completed_tests_count, enrolled_at
      ) VALUES (?, ?, ?, 'granted', 0.0, 0, ?)
      ON CONFLICT(user_id, series_id) DO NOTHING
    `).run(enrollId, user.id, id, now);

    db.prepare('UPDATE test_series SET enrolled_count = enrolled_count + 1 WHERE id = ?').run(id);

    return NextResponse.json({
      success: true,
      message: 'Enrolled in test series successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to enroll in test series' }, { status: 500 });
  }
}
