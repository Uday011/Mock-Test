import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const db = getDb();
  try {
    const sectionsStmt = db.prepare(`
      SELECT 
        s.*,
        COUNT(DISTINCT t.id) as test_count
      FROM sections s
      LEFT JOIN tests t ON t.section_id = s.id
      GROUP BY s.id
      ORDER BY s.name ASC
    `);
    const sections = sectionsStmt.all() as any[];
    return NextResponse.json({ sections });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch sections' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'superadmin') {
    return NextResponse.json({ error: 'Unauthorized: Super Administrator access required' }, { status: 403 });
  }

  const db = getDb();
  try {
    const body = await req.json();
    const { name, description, icon } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Section name is required' }, { status: 400 });
    }

    const newId = 'sec-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20) + '-' + crypto.randomBytes(3).toString('hex');
    const now = new Date().toISOString();

    const insertStmt = db.prepare(
      'INSERT INTO sections (id, name, description, icon, is_active, created_at) VALUES (?, ?, ?, ?, 1, ?)'
    );
    insertStmt.run(newId, name.trim(), description?.trim() || '', icon || 'Layers', now);

    return NextResponse.json({ success: true, message: 'Section created successfully', sectionId: newId });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create section' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'superadmin') {
    return NextResponse.json({ error: 'Unauthorized: Super Administrator access required' }, { status: 403 });
  }

  const db = getDb();
  try {
    const body = await req.json();
    const { sectionId, name, description, is_active } = body;

    if (!sectionId) {
      return NextResponse.json({ error: 'sectionId is required' }, { status: 400 });
    }

    if (name) {
      const updateName = db.prepare('UPDATE sections SET name = ? WHERE id = ?');
      updateName.run(name.trim(), sectionId);
    }
    if (description !== undefined) {
      const updateDesc = db.prepare('UPDATE sections SET description = ? WHERE id = ?');
      updateDesc.run(description.trim(), sectionId);
    }
    if (is_active !== undefined) {
      const updateActive = db.prepare('UPDATE sections SET is_active = ? WHERE id = ?');
      updateActive.run(is_active ? 1 : 0, sectionId);
    }

    return NextResponse.json({ success: true, message: 'Section updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update section' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'superadmin') {
    return NextResponse.json({ error: 'Unauthorized: Super Administrator access required' }, { status: 403 });
  }

  const db = getDb();
  try {
    const url = new URL(req.url);
    const sectionId = url.searchParams.get('id');

    if (!sectionId) {
      return NextResponse.json({ error: 'id query parameter required' }, { status: 400 });
    }

    const deleteStmt = db.prepare('DELETE FROM sections WHERE id = ?');
    deleteStmt.run(sectionId);

    return NextResponse.json({ success: true, message: 'Section deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete section' }, { status: 500 });
  }
}
