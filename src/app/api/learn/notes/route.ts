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
    const { topic_id, notes, is_bookmarked } = body;

    if (!topic_id) {
      return NextResponse.json({ success: false, error: 'topic_id is required' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Check if progress record exists
    const existing = db.prepare('SELECT id, notes_taken, is_bookmarked FROM user_topic_progress WHERE user_id = ? AND topic_id = ?').get(userId, topic_id) as any;

    if (existing) {
      const newNotes = notes !== undefined ? notes : existing.notes_taken;
      const newBookmark = is_bookmarked !== undefined ? (is_bookmarked ? 1 : 0) : existing.is_bookmarked;

      db.prepare(`
        UPDATE user_topic_progress
        SET notes_taken = ?, is_bookmarked = ?, updated_at = ?
        WHERE id = ?
      `).run(newNotes, newBookmark, now, existing.id);
    } else {
      const progId = `prog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      db.prepare(`
        INSERT INTO user_topic_progress (
          id, user_id, topic_id, status, mastery_percentage, questions_practiced, questions_correct,
          tests_attempted, notes_taken, is_bookmarked, updated_at
        ) VALUES (?, ?, ?, 'in_progress', 10.0, 0, 0, 0, ?, ?, ?)
      `).run(progId, userId, topic_id, notes || '', is_bookmarked ? 1 : 0, now);
    }

    return NextResponse.json({ success: true, message: 'Notes/Bookmark saved successfully' });
  } catch (error: any) {
    console.error('API /api/learn/notes error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}
