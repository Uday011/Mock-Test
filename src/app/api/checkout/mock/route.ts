import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, getOrCreateDemoUser } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    let user = await getCurrentUser();
    if (!user) user = getOrCreateDemoUser();

    const body = await req.json();
    const { item_type, item_id, amount_inr, payment_method } = body;

    if (!item_type || !item_id) {
      return NextResponse.json({ error: 'Item type and ID are required' }, { status: 400 });
    }

    let title = 'Assessment Package';
    let creatorId = '';
    const numericAmount = Number(amount_inr) || 0;

    if (item_type === 'test') {
      const test = db.prepare('SELECT id, title, user_id, price_inr FROM tests WHERE id = ?').get(item_id) as any;
      if (!test) {
        return NextResponse.json({ error: 'Test not found' }, { status: 404 });
      }
      title = test.title;
      creatorId = test.user_id;
    } else if (item_type === 'test_series') {
      const series = db.prepare('SELECT id, title, creator_id, price_inr FROM test_series WHERE id = ?').get(item_id) as any;
      if (!series) {
        return NextResponse.json({ error: 'Test series not found' }, { status: 404 });
      }
      title = series.title;
      creatorId = series.creator_id;
    }

    const orderId = `ord-${crypto.randomUUID().slice(0, 8)}`;
    const receiptNumber = `NAL-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    // Commission logic: 15% platform fee, 85% creator payout
    const platformFee = Math.round(numericAmount * 0.15 * 100) / 100;
    const creatorEarnings = Math.round((numericAmount - platformFee) * 100) / 100;
    const simulatedTax = Math.round(numericAmount * 0.18 * 100) / 100;

    // 1. Record Order in Ledger
    db.prepare(`
      INSERT INTO orders (
        id, user_id, item_type, item_id, amount_inr, platform_fee_inr,
        creator_earnings_inr, tax_inr, currency, payment_status, payment_method,
        gateway_transaction_id, receipt_number, created_at, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'INR', 'completed', ?, ?, ?, ?, ?)
    `).run(
      orderId,
      user.id,
      item_type,
      item_id,
      numericAmount,
      platformFee,
      creatorEarnings,
      simulatedTax,
      payment_method || 'mock_gateway',
      `sim-tx-${crypto.randomUUID().slice(0, 10)}`,
      receiptNumber,
      now,
      now
    );

    // 2. Record Active Purchase Entitlement
    const purchaseId = `pur-${crypto.randomUUID().slice(0, 8)}`;
    db.prepare(`
      INSERT OR REPLACE INTO purchases (
        id, order_id, user_id, item_type, item_id, access_status, granted_at
      ) VALUES (?, ?, ?, ?, ?, 'active', ?)
    `).run(purchaseId, orderId, user.id, item_type, item_id, now);

    // 3. If test series, register / upgrade enrollment
    if (item_type === 'test_series') {
      const enrollId = `enr-${crypto.randomUUID().slice(0, 8)}`;
      db.prepare(`
        INSERT INTO user_series_enrollments (
          id, user_id, series_id, access_tier, payment_order_id, progress_percentage, completed_tests_count, enrolled_at
        ) VALUES (?, ?, ?, 'paid', ?, 0.0, 0, ?)
        ON CONFLICT(user_id, series_id) DO UPDATE SET
          access_tier = 'paid',
          payment_order_id = excluded.payment_order_id
      `).run(enrollId, user.id, item_id, orderId, now);

      // Increment enrolled_count on series
      db.prepare('UPDATE test_series SET enrolled_count = enrolled_count + 1 WHERE id = ?').run(item_id);
    }

    const orderData = {
      id: orderId,
      receipt_number: receiptNumber,
      item_type,
      item_id,
      item_title: title,
      amount_inr: numericAmount,
      platform_fee_inr: platformFee,
      creator_earnings_inr: creatorEarnings,
      payment_status: 'completed',
      payment_method,
      completed_at: now,
    };

    return NextResponse.json({
      success: true,
      message: 'Sandbox payment successfully authorized',
      is_sandbox: true,
      receipt_number: receiptNumber,
      order: orderData,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Sandbox checkout failed' }, { status: 500 });
  }
}
