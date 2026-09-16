import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, getOrCreateDemoUser } from '@/lib/auth';
import crypto from 'crypto';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: testId } = await params;
  const db = getDb();

  let user = await getCurrentUser();
  if (!user) user = getOrCreateDemoUser();

  try {
    const row = db.prepare('SELECT id FROM saved_tests WHERE user_id = ? AND test_id = ?').get(user.id, testId);
    return NextResponse.json({
      success: true,
      bookmarked: Boolean(row),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to check bookmark status' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: testId } = await params;
  const db = getDb();

  let user = await getCurrentUser();
  if (!user) user = getOrCreateDemoUser();

  try {
    // Check if test exists
    const test = db.prepare('SELECT id, title FROM tests WHERE id = ?').get(testId) as any;
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    const existing = db.prepare('SELECT id FROM saved_tests WHERE user_id = ? AND test_id = ?').get(user.id, testId) as any;

    if (existing) {
      db.prepare('DELETE FROM saved_tests WHERE user_id = ? AND test_id = ?').run(user.id, testId);
      return NextResponse.json({
        success: true,
        bookmarked: false,
        message: `Removed "${test.title}" from saved library`,
      });
    } else {
      const now = new Date().toISOString();
      const savedId = crypto.randomUUID();
      db.prepare('INSERT INTO saved_tests (id, user_id, test_id, created_at) VALUES (?, ?, ?, ?)').run(
        savedId,
        user.id,
        testId,
        now
      );
      return NextResponse.json({
        success: true,
        bookmarked: true,
        message: `Saved "${test.title}" to your library`,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update bookmark status' }, { status: 500 });
  }
}
