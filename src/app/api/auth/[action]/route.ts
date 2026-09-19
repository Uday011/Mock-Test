import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedInitialData } from '@/lib/db/seed';
import {
  hashPassword,
  verifyPassword,
  createToken,
  getOrCreateRoleDemoUser,
  COOKIE_NAME,
  getCurrentUser,
  AuthSessionUser,
} from '@/lib/auth';
import { UserRole } from '@/lib/types';
import crypto from 'crypto';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;
    const db = getDb();
    seedInitialData();
    if (action === 'demo' || action === 'demo-switch') {
      const url = new URL(req.url);
      let queryRole = url.searchParams.get('role');
      if (!queryRole) {
        try {
          const body = await req.json();
          queryRole = body?.role;
        } catch {}
      }
      
      let validRole: UserRole = 'student';
      if (['superadmin', 'admin', 'educator', 'creator', 'student', 'learner'].includes(queryRole || '')) {
        validRole = queryRole as UserRole;
      }

      const demoUser = getOrCreateRoleDemoUser(validRole);
      const token = createToken(demoUser);

      const res = NextResponse.json({ success: true, user: demoUser });
      res.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      });
      return res;
    }

    if (action === 'login') {
      const body = await req.json();
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
      }

      const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      const user = stmt.get(email.toLowerCase().trim()) as any;

      if (!user || !verifyPassword(password, user.password_hash)) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      if (user.status === 'suspended') {
        return NextResponse.json({ error: 'Your account has been suspended by an administrator.' }, { status: 403 });
      }

      const sessionUser: AuthSessionUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
        institute_name: user.institute_name,
      };

      const token = createToken(sessionUser);
      const res = NextResponse.json({ success: true, user: sessionUser });
      res.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      });
      return res;
    }

    if (action === 'register') {
      const body = await req.json();
      const { name, email, password, role, institute_name } = body;

      if (!name || !email || !password) {
        return NextResponse.json({ error: 'Name, email, and password required' }, { status: 400 });
      }

      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }

      const cleanEmail = email.toLowerCase().trim();
      const existingStmt = db.prepare('SELECT id FROM users WHERE email = ?');
      const existing = existingStmt.get(cleanEmail);
      if (existing) {
        return NextResponse.json({ error: 'An account with this email already exists. Please sign in.' }, { status: 409 });
      }

      const newId = crypto.randomUUID();
      const hashed = hashPassword(password);
      const now = new Date().toISOString();
      // All candidate registrations are candidate / aspirant accounts
      const userRole: UserRole = 'student';

      const insertStmt = db.prepare(
        'INSERT INTO users (id, name, email, password_hash, role, status, institute_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      );
      insertStmt.run(newId, name.trim(), cleanEmail, hashed, userRole, 'active', institute_name || null, now);

      // Auto-enroll new students into CAT 2026 and initialize onboarding profile
      if (userRole === 'student') {
        try {
          db.prepare(`
            INSERT OR IGNORE INTO user_exam_enrollments (id, user_id, exam_id, target_year, target_score, is_primary, enrolled_at)
            VALUES (?, ?, 'exam-cat-2026', 2026, 105, 1, ?)
          `).run(`enr-${newId}`, newId, now);

          db.prepare(`
            INSERT OR IGNORE INTO user_onboarding_profiles (
              user_id, preferred_exam_id, preparation_stage, target_timeline, daily_study_hours,
              strong_subjects_json, weak_subjects_json, diagnostic_test_status, completed_at, created_at
            ) VALUES (?, 'exam-cat-2026', 'intermediate', '2026_cat', 4.0, '[]', '[]', 'pending', null, ?)
          `).run(newId, now);
        } catch (initErr) {
          console.warn('[Register] Profile auto-init warning:', initErr);
        }
      }

      const sessionUser: AuthSessionUser = {
        id: newId,
        name: name.trim(),
        email: cleanEmail,
        role: userRole,
        institute_name: institute_name || null,
      };

      const token = createToken(sessionUser);
      const res = NextResponse.json({ success: true, user: sessionUser });
      res.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      });
      return res;
    }

    if (action === 'logout') {
      const res = NextResponse.json({ success: true });
      res.cookies.delete(COOKIE_NAME);
      return res;
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;
    seedInitialData();

    if (action === 'me') {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ user: null });
      }
      return NextResponse.json({ user });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (err: any) {
    console.error('[Auth GET Error]:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
