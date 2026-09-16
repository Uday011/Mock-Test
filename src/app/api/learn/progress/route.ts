import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    let user = await getCurrentUser();
    let userId = user?.id;

    if (!userId) {
      const demoStudent = db.prepare("SELECT id FROM users WHERE role = 'student' LIMIT 1").get() as any;
      if (demoStudent) userId = demoStudent.id;
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { topic_id, status } = body;

    if (!topic_id) {
      return NextResponse.json({ success: false, error: 'topic_id is required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const existing = db.prepare('SELECT * FROM user_topic_progress WHERE user_id = ? AND topic_id = ?').get(userId, topic_id) as any;

    let targetStatus = status || 'studied';
    // If user has already mastered, don't downgrade to studied unless explicitly requested
    if (existing?.status === 'mastered' && targetStatus === 'studied') {
      targetStatus = 'mastered';
    }

    let targetMastery = existing?.mastery_percentage || 50.0;
    if (targetStatus === 'studied' && targetMastery < 60.0) {
      targetMastery = 60.0;
    }

    if (existing) {
      db.prepare(`
        UPDATE user_topic_progress
        SET status = ?, mastery_percentage = ?, last_studied_at = ?, updated_at = ?
        WHERE id = ?
      `).run(targetStatus, targetMastery, now, now, existing.id);
    } else {
      const progId = `prog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      db.prepare(`
        INSERT INTO user_topic_progress (
          id, user_id, topic_id, status, mastery_percentage, questions_practiced, questions_correct,
          tests_attempted, last_studied_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 0, 0, 0, ?, ?)
      `).run(progId, userId, topic_id, targetStatus, targetMastery, now, now);
    }

    return NextResponse.json({
      success: true,
      status: targetStatus,
      mastery_percentage: targetMastery,
      last_studied_at: now,
    });
  } catch (error: any) {
    console.error('API /api/learn/progress error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}
