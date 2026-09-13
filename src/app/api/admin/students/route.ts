import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
  }

  const db = getDb();
  try {
    const studentsStmt = db.prepare(`
      SELECT 
        u.id, u.name, u.email, u.role, u.status, u.institute_name, u.created_at,
        COUNT(DISTINCT a.id) as total_attempts,
        ROUND(AVG(a.percentage), 1) as avg_score,
        MAX(a.percentage) as best_score,
        MAX(a.created_at) as last_active_at
      FROM users u
      LEFT JOIN test_attempts a ON a.user_id = u.id AND a.status = 'completed'
      WHERE u.role = 'student'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    const students = studentsStmt.all() as any[];

    return NextResponse.json({ students });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
  }

  const db = getDb();
  try {
    const body = await req.json();
    const { name, email, password, institute_name } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password required' }, { status: 400 });
    }

    const checkStmt = db.prepare('SELECT id FROM users WHERE email = ?');
    if (checkStmt.get(email.toLowerCase().trim())) {
      return NextResponse.json({ error: 'Student with this email already exists' }, { status: 409 });
    }

    const newId = crypto.randomUUID();
    const hashed = hashPassword(password);
    const now = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, status, institute_name, created_at)
      VALUES (?, ?, ?, ?, 'student', 'active', ?, ?)
    `);
    insertStmt.run(newId, name.trim(), email.toLowerCase().trim(), hashed, institute_name || user.institute_name || null, now);

    return NextResponse.json({ success: true, message: 'Student created successfully', studentId: newId });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create student' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
  }

  const db = getDb();
  try {
    const body = await req.json();
    const { studentId, status, name, password } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'studentId is required' }, { status: 400 });
    }

    if (status) {
      const updateStatus = db.prepare('UPDATE users SET status = ? WHERE id = ?');
      updateStatus.run(status, studentId);
    }

    if (name) {
      const updateName = db.prepare('UPDATE users SET name = ? WHERE id = ?');
      updateName.run(name.trim(), studentId);
    }

    if (password) {
      const hashed = hashPassword(password);
      const updatePass = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?');
      updatePass.run(hashed, studentId);
    }

    return NextResponse.json({ success: true, message: 'Student updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update student' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
  }

  const db = getDb();
  try {
    const url = new URL(req.url);
    const studentId = url.searchParams.get('id');

    if (!studentId) {
      return NextResponse.json({ error: 'id query param required' }, { status: 400 });
    }

    const deleteStmt = db.prepare('DELETE FROM users WHERE id = ? AND role = "student"');
    deleteStmt.run(studentId);

    return NextResponse.json({ success: true, message: 'Student account deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete student' }, { status: 500 });
  }
}
