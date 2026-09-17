import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, getOrCreateDemoUser, createToken, COOKIE_NAME } from '@/lib/auth';
import { UserRole } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    let user = await getCurrentUser();
    if (!user) user = getOrCreateDemoUser();

    const stmt = db.prepare('SELECT id, name, email, role, roles_json, institute_name FROM users WHERE id = ?');
    const dbUser = stmt.get(user.id) as any;

    let roles: UserRole[] = ['learner'];
    if (dbUser?.roles_json) {
      try {
        roles = JSON.parse(dbUser.roles_json);
      } catch {
        roles = [dbUser.role as UserRole];
      }
    } else if (dbUser?.role) {
      roles = [dbUser.role === 'student' ? 'learner' : (dbUser.role as UserRole)];
    }

    // Include active role
    const activeRole = user.active_role || (roles.includes('educator') ? 'educator' : roles[0] || 'learner');

    // Check if educator profile exists
    const profStmt = db.prepare('SELECT * FROM educator_profiles WHERE user_id = ?');
    const profile = profStmt.get(user.id);

    return NextResponse.json({
      success: true,
      roles,
      active_role: activeRole,
      has_educator_profile: Boolean(profile),
      available_roles: ['learner', 'creator', 'educator', 'admin'],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch user roles' }, { status: 500 });
  }
}

// Upgrade role (e.g. Learner adds Creator or Educator role without creating a new account)
export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    let user = await getCurrentUser();
    if (!user) user = getOrCreateDemoUser();

    const body = await req.json();
    const { role } = body;

    const allowedUpgrades = ['creator', 'educator'];
    if (!role || !allowedUpgrades.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role upgrade. Permitted roles: ${allowedUpgrades.join(', ')}` },
        { status: 400 }
      );
    }

    const stmt = db.prepare('SELECT id, name, email, role, roles_json, institute_name FROM users WHERE id = ?');
    const dbUser = stmt.get(user.id) as any;

    let existingRoles: UserRole[] = ['learner'];
    if (dbUser?.roles_json) {
      try {
        existingRoles = JSON.parse(dbUser.roles_json);
      } catch {}
    } else if (dbUser?.role) {
      existingRoles = [dbUser.role === 'student' ? 'learner' : (dbUser.role as UserRole)];
    }

    if (!existingRoles.includes(role as UserRole)) {
      existingRoles.push(role as UserRole);
    }

    // Save updated roles
    db.prepare('UPDATE users SET roles_json = ? WHERE id = ?').run(
      JSON.stringify(existingRoles),
      user.id
    );

    // If upgrading to creator or educator, initialize educator profile if not already present
    const checkProf = db.prepare('SELECT user_id FROM educator_profiles WHERE user_id = ?').get(user.id);
    if (!checkProf) {
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO educator_profiles (
          user_id, headline, bio, institute_name, verification_status,
          specialization_subjects_json, total_students, average_rating,
          published_tests_count, followers_count, profile_image_url, publication_status, created_at
        ) VALUES (?, ?, ?, ?, 'verified', ?, 0, 5.0, 0, 0, NULL, 'active', ?)
      `).run(
        user.id,
        role === 'educator' ? 'Senior Faculty & Academic Creator' : 'Curator & Concept Specialist',
        'Dedicated to conceptual clarity, rigorous derivation steps, and systematic exam readiness.',
        user.institute_name || 'Nalanda Academic Collective',
        JSON.stringify(['Quantitative Aptitude', 'General Intelligence & Reasoning']),
        now
      );
    }

    // Create updated session token with new active role
    const updatedUser = {
      ...user,
      roles: existingRoles,
      active_role: role as UserRole,
    };

    const token = createToken(updatedUser);
    const response = NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${role} role!`,
      user: updatedUser,
      roles: existingRoles,
      active_role: role,
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to upgrade role' }, { status: 500 });
  }
}

// Switch active workspace role (e.g. from Learner to Educator or vice versa)
export async function PATCH(req: NextRequest) {
  try {
    const db = getDb();
    let user = await getCurrentUser();
    if (!user) user = getOrCreateDemoUser();

    const body = await req.json();
    const { role } = body;

    const stmt = db.prepare('SELECT id, name, email, role, roles_json, institute_name FROM users WHERE id = ?');
    const dbUser = stmt.get(user.id) as any;

    let existingRoles: UserRole[] = ['learner'];
    if (dbUser?.roles_json) {
      try {
        existingRoles = JSON.parse(dbUser.roles_json);
      } catch {}
    } else if (dbUser?.role) {
      existingRoles = [dbUser.role === 'student' ? 'learner' : (dbUser.role as UserRole)];
    }

    // If user is superadmin/admin, allow switching to any role
    const isPrivileged = existingRoles.includes('admin') || existingRoles.includes('superadmin');
    if (!isPrivileged && !existingRoles.includes(role as UserRole)) {
      return NextResponse.json(
        { error: `You do not have access to the ${role} role yet. Please upgrade first.` },
        { status: 403 }
      );
    }

    const updatedUser = {
      ...user,
      roles: existingRoles,
      active_role: role as UserRole,
    };

    const token = createToken(updatedUser);
    const response = NextResponse.json({
      success: true,
      message: `Active workspace switched to ${role}`,
      user: updatedUser,
      active_role: role,
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to switch role' }, { status: 500 });
  }
}
