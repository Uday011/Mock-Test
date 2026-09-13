import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'superadmin') {
    return NextResponse.json({ error: 'Unauthorized: Super Administrator access required' }, { status: 403 });
  }

  const db = getDb();
  try {
    const usersStmt = db.prepare(`
      SELECT 
        u.id, u.name, u.email, u.role, u.status, u.institute_name, u.created_at,
        COUNT(DISTINCT t.id) as tests_created,
        COUNT(DISTINCT a.id) as attempts_made
      FROM users u
      LEFT JOIN tests t ON t.user_id = u.id
      LEFT JOIN test_attempts a ON a.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    const users = usersStmt.all() as any[];

    return NextResponse.json({ users });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch users' }, { status: 500 });
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
    const { userId, role, status, name, email, password, institute_name } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (role) {
      const updateRole = db.prepare('UPDATE users SET role = ? WHERE id = ?');
      updateRole.run(role, userId);
    }

    if (status) {
      const updateStatus = db.prepare('UPDATE users SET status = ? WHERE id = ?');
      updateStatus.run(status, userId);
    }

    if (name) {
      const updateName = db.prepare('UPDATE users SET name = ? WHERE id = ?');
      updateName.run(name.trim(), userId);
    }

    if (email) {
      const updateEmail = db.prepare('UPDATE users SET email = ? WHERE id = ?');
      updateEmail.run(email.toLowerCase().trim(), userId);
    }

    if (institute_name !== undefined) {
      const updateInst = db.prepare('UPDATE users SET institute_name = ? WHERE id = ?');
      updateInst.run(institute_name || null, userId);
    }

    if (password) {
      const hashed = hashPassword(password);
      const updatePass = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?');
      updatePass.run(hashed, userId);
    }

    return NextResponse.json({ success: true, message: 'User updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update user' }, { status: 500 });
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
    const userId = url.searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'id query parameter required' }, { status: 400 });
    }

    // Prevent deleting self
    if (userId === user.id) {
      return NextResponse.json({ error: 'Cannot delete your own super administrator account' }, { status: 400 });
    }

    const deleteStmt = db.prepare('DELETE FROM users WHERE id = ?');
    deleteStmt.run(userId);

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete user' }, { status: 500 });
  }
}
