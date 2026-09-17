import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, getOrCreateDemoUser } from '@/lib/auth';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get('exam_id');
    const isPaid = searchParams.get('is_paid');
    const creatorId = searchParams.get('creator_id');
    const query = searchParams.get('q');

    let sql = `
      SELECT ts.*,
             e.title as exam_title,
             u.name as creator_name,
             ep.headline as creator_headline,
             ep.institute_name as creator_institute,
             (SELECT COUNT(*) FROM test_series_items tsi WHERE tsi.series_id = ts.id) as item_count,
             (SELECT COUNT(*) FROM test_series_items tsi WHERE tsi.series_id = ts.id AND tsi.is_free_preview = 1) as free_preview_count
      FROM test_series ts
      LEFT JOIN exams e ON ts.exam_id = e.id
      LEFT JOIN users u ON ts.creator_id = u.id
      LEFT JOIN educator_profiles ep ON ts.creator_id = ep.user_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (examId && examId !== 'all') {
      sql += ' AND ts.exam_id = ?';
      params.push(examId);
    }
    if (creatorId) {
      sql += ' AND ts.creator_id = ?';
      params.push(creatorId);
    }
    if (isPaid !== null && isPaid !== undefined && isPaid !== 'all') {
      sql += ' AND ts.is_paid = ?';
      params.push(isPaid === '1' || isPaid === 'true' ? 1 : 0);
    }
    if (query && query.trim()) {
      sql += ' AND (ts.title LIKE ? OR ts.description LIKE ?)';
      const term = `%${query.trim()}%`;
      params.push(term, term);
    }

    sql += ' ORDER BY ts.created_at DESC';

    const seriesList = db.prepare(sql).all(...params) as any[];

    return NextResponse.json({
      success: true,
      series: seriesList.map(s => ({
        ...s,
        is_paid: Boolean(s.is_paid),
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to list test series' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    let user = await getCurrentUser();
    if (!user) user = getOrCreateDemoUser();

    const body = await req.json();
    const {
      title,
      description,
      exam_id = 'exam-ssc-cgl-2026',
      target_year = 2026,
      is_paid = false,
      price_inr = 0,
      test_ids = [],
      preview_test_ids = [],
    } = body;

    if (!title || title.trim().length < 3) {
      return NextResponse.json({ error: 'Valid series title is required (min 3 chars)' }, { status: 400 });
    }

    const seriesId = `ts-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO test_series (
        id, creator_id, exam_id, title, description, target_year, total_tests,
        is_paid, price_inr, rating, enrolled_count, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0, 0, 'published', ?)
    `).run(
      seriesId,
      user.id,
      exam_id,
      title.trim(),
      description || null,
      Number(target_year) || 2026,
      test_ids.length,
      is_paid ? 1 : 0,
      Number(price_inr) || 0,
      now
    );

    // Insert series items
    const insertItem = db.prepare(`
      INSERT INTO test_series_items (id, series_id, test_id, sequence_order, is_free_preview, unlock_rule, created_at)
      VALUES (?, ?, ?, ?, ?, 'immediate', ?)
    `);

    test_ids.forEach((testId: string, idx: number) => {
      const isPreview = preview_test_ids.includes(testId) || idx === 0 ? 1 : 0;
      insertItem.run(
        `tsi-${crypto.randomUUID().slice(0, 8)}`,
        seriesId,
        testId,
        idx + 1,
        isPreview,
        now
      );
    });

    return NextResponse.json({
      success: true,
      series_id: seriesId,
      message: 'Test series published successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create test series' }, { status: 500 });
  }
}
