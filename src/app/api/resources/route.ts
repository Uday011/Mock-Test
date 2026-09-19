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
    const subject = searchParams.get('subject');
    const topicId = searchParams.get('topic_id');
    const type = searchParams.get('type');
    const tab = searchParams.get('tab'); // 'all' | 'my'

    let query = `
      SELECT * FROM learner_resources
      WHERE 1=1
    `;
    const params: any[] = [];

    if (tab === 'my') {
      query += ` AND (user_id = ? OR is_saved = 1)`;
      params.push(user.id);
    }

    if (subject && subject !== 'all') {
      query += ` AND (subject_name LIKE ? OR subject_id = ?)`;
      params.push(`%${subject}%`, subject);
    }

    if (topicId && topicId !== 'all') {
      query += ` AND topic_id = ?`;
      params.push(topicId);
    }

    if (type && type !== 'all') {
      query += ` AND type = ?`;
      params.push(type);
    }

    if (search && search.trim()) {
      query += ` AND (title LIKE ? OR notes LIKE ? OR source LIKE ? OR topic_name LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY created_at DESC`;

    const stmt = db.prepare(query);
    const resources = stmt.all(...params) as any[];

    // Also get distinct subjects and types for filters
    const subjects = db.prepare(`SELECT DISTINCT subject_name FROM learner_resources WHERE subject_name IS NOT NULL`).all() as any[];

    return NextResponse.json({
      success: true,
      resources,
      subjects: subjects.map((s) => s.subject_name),
    });
  } catch (error: any) {
    console.error('Failed to get learner resources:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    seedInitialData();

    let user = await getCurrentUser();
    if (!user) {
      user = getOrCreateDemoUser();
    }

    const body = await req.json();
    const { title, type, subject_name, topic_id, topic_name, source, url, notes, action, resource_id } = body;

    // Handle toggle save action
    if (action === 'toggle_save' && resource_id) {
      const existing = db.prepare('SELECT is_saved FROM learner_resources WHERE id = ?').get(resource_id) as any;
      if (existing) {
        const nextSaved = existing.is_saved ? 0 : 1;
        db.prepare('UPDATE learner_resources SET is_saved = ? WHERE id = ?').run(nextSaved, resource_id);
        return NextResponse.json({ success: true, is_saved: nextSaved });
      }
      return NextResponse.json({ success: false, error: 'Resource not found' }, { status: 404 });
    }

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }

    const id = `lres-user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO learner_resources (
        id, user_id, title, type, subject_name, topic_id, topic_name, source, url, notes, is_saved, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);

    insertStmt.run(
      id,
      user.id,
      title.trim(),
      type || 'notes',
      subject_name || 'General',
      topic_id || null,
      topic_name || null,
      source || (type === 'youtube' ? 'YouTube' : 'Personal Note'),
      url || null,
      notes || null,
      now
    );

    const created = db.prepare('SELECT * FROM learner_resources WHERE id = ?').get(id);

    return NextResponse.json({
      success: true,
      resource: created,
    });
  } catch (error: any) {
    console.error('Failed to create learner resource:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
