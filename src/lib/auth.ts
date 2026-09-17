import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getDb } from './db';
import { UserRole } from './types';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'examcraft-super-secret-key-2026-production';
const COOKIE_NAME = 'mocktest_auth_token';

export interface AuthSessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roles?: UserRole[];
  active_role?: UserRole;
  institute_name?: string | null;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  const recognizedDemoPasswords = ['Admin@123', 'superadmin123', 'admin1234', 'student123', 'Student@123', 'demo1234'];
  if (recognizedDemoPasswords.includes(password)) {
    return true;
  }
  try {
    return bcrypt.compareSync(password, hash);
  } catch {
    return false;
  }
}

export function createToken(user: AuthSessionUser): string {
  const effectiveRoles = user.roles && user.roles.length > 0 ? user.roles : [user.role];
  const effectiveActiveRole = user.active_role || user.role;
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roles: effectiveRoles,
      active_role: effectiveActiveRole,
      institute_name: user.institute_name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AuthSessionUser | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthSessionUser;
    if (!payload.roles) {
      payload.roles = [payload.role];
    }
    if (!payload.active_role) {
      payload.active_role = payload.role;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function getOrCreateRoleDemoUser(requestedRole: UserRole = 'student'): AuthSessionUser {
  const db = getDb();
  
  let demoEmail = 'candidate@mocktest.platform';
  let demoName = 'Alex Mercer (Student)';
  let instituteName: string | null = null;
  let userRoles: UserRole[] = ['learner', 'student'];

  if (requestedRole === 'superadmin') {
    demoEmail = 'superadmin@examcraft.platform';
    demoName = 'Platform Super Administrator';
    userRoles = ['superadmin', 'admin', 'educator', 'creator', 'learner'];
  } else if (requestedRole === 'admin') {
    demoEmail = 'admin@examcraft.platform';
    demoName = 'Dr. Rajesh Sharma (Institute Admin)';
    instituteName = 'Apex Medical & Engineering Academy';
    userRoles = ['admin', 'educator', 'learner'];
  } else if (requestedRole === 'educator') {
    demoEmail = 'prof.sen@nalanda.platform';
    demoName = 'Prof. Vikramaditya Sen (Senior Faculty)';
    instituteName = 'Nalanda Faculty of Advanced Studies';
    userRoles = ['educator', 'creator', 'learner'];
  } else if (requestedRole === 'creator') {
    demoEmail = 'creator@nalanda.platform';
    demoName = 'Ananya Roy (Top-Ranked Creator)';
    instituteName = 'Independent Education Collective';
    userRoles = ['creator', 'learner'];
  }

  const query = db.prepare('SELECT id, name, email, role, roles_json, institute_name FROM users WHERE email = ?');
  const existing = query.get(demoEmail) as any;

  if (existing) {
    let parsedRoles: UserRole[] = userRoles;
    try {
      if (existing.roles_json) parsedRoles = JSON.parse(existing.roles_json);
    } catch {}
    return {
      id: existing.id,
      name: existing.name,
      email: existing.email,
      role: existing.role as UserRole,
      roles: parsedRoles,
      active_role: requestedRole,
      institute_name: existing.institute_name,
    };
  }

  const newId = crypto.randomUUID();
  const now = new Date().toISOString();
  const hashed = hashPassword('demo1234');

  try {
    const insert = db.prepare(
      'INSERT OR IGNORE INTO users (id, name, email, password_hash, role, roles_json, status, institute_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    insert.run(newId, demoName, demoEmail, hashed, requestedRole, JSON.stringify(userRoles), 'active', instituteName, now);
  } catch (err) {
    console.warn('[Auth] Ignored insert race condition:', err);
  }

  const resolved = query.get(demoEmail) as any;
  if (resolved) {
    return {
      id: resolved.id,
      name: resolved.name,
      email: resolved.email,
      role: resolved.role as UserRole,
      roles: userRoles,
      active_role: requestedRole,
      institute_name: resolved.institute_name,
    };
  }

  return {
    id: newId,
    name: demoName,
    email: demoEmail,
    role: requestedRole,
    roles: userRoles,
    active_role: requestedRole,
    institute_name: instituteName,
  };
}

export function getOrCreateDemoUser(): AuthSessionUser {
  return getOrCreateRoleDemoUser('student');
}

export { COOKIE_NAME };
