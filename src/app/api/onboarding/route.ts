import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedInitialData } from '@/lib/db/seed';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    seedInitialData();

    const user = await getCurrentUser();
    let userId = user?.id;

    if (!userId) {
      const demoStudent = db.prepare("SELECT id FROM users WHERE role = 'student' LIMIT 1").get() as any;
      if (demoStudent) userId = demoStudent.id;
    }

    const safeUserId = userId || '';

    // Fetch existing profile
    const profileStmt = db.prepare('SELECT * FROM user_onboarding_profiles WHERE user_id = ?');
    const profile = profileStmt.get(safeUserId) as any;

    // Fetch available master exams with their subjects
    const examsStmt = db.prepare(`
      SELECT e.*, 
        (SELECT COUNT(*) FROM subjects s WHERE s.exam_id = e.id) as subjects_count
      FROM exams e 
      WHERE e.is_active = 1
      ORDER BY e.created_at ASC
    `);
    const exams = examsStmt.all() as any[];

    // Fetch subjects by exam
    const subjectsStmt = db.prepare('SELECT * FROM subjects ORDER BY order_index ASC');
    const allSubjects = subjectsStmt.all() as any[];

    return NextResponse.json({
      success: true,
      profile: profile || null,
      exams,
      subjects: allSubjects,
    });
  } catch (error: any) {
    console.error('[Onboarding GET Error]:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve onboarding data', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    seedInitialData();

    const user = await getCurrentUser();
    let userId = user?.id;

    if (!userId) {
      const demoStudent = db.prepare("SELECT id FROM users WHERE role = 'student' LIMIT 1").get() as any;
      if (demoStudent) userId = demoStudent.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      preferred_exam_id = 'exam-ssc-cgl-2026',
      preparation_stage = 'beginner',
      target_timeline = '2026_tier1',
      daily_study_hours = 3.0,
      strong_subjects = [],
      weak_subjects = [],
      diagnostic_test_status = 'skipped',
    } = body;

    const now = new Date().toISOString();

    // 1. Upsert user_onboarding_profiles
    db.prepare(`
      INSERT OR REPLACE INTO user_onboarding_profiles (
        user_id, preferred_exam_id, preparation_stage, target_timeline, daily_study_hours,
        strong_subjects_json, weak_subjects_json, diagnostic_test_status, completed_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      preferred_exam_id,
      preparation_stage,
      target_timeline,
      Number(daily_study_hours),
      JSON.stringify(strong_subjects),
      JSON.stringify(weak_subjects),
      diagnostic_test_status,
      now,
      now
    );

    // 2. Set this exam as the user's primary enrollment
    db.prepare('UPDATE user_exam_enrollments SET is_primary = 0 WHERE user_id = ?').run(userId);

    const checkEnrollment = db.prepare('SELECT id FROM user_exam_enrollments WHERE user_id = ? AND exam_id = ?').get(userId, preferred_exam_id) as any;
    if (checkEnrollment) {
      db.prepare('UPDATE user_exam_enrollments SET is_primary = 1 WHERE id = ?').run(checkEnrollment.id);
    } else {
      db.prepare(`
        INSERT INTO user_exam_enrollments (id, user_id, exam_id, target_year, target_score, is_primary, enrolled_at)
        VALUES (?, ?, ?, 2026, 165.0, 1, ?)
      `).run(
        `enr-${userId}-${preferred_exam_id}`,
        userId,
        preferred_exam_id,
        now
      );
    }

    return NextResponse.json({ success: true, preferred_exam_id });
  } catch (error: any) {
    console.error('[Onboarding POST Error]:', error);
    return NextResponse.json(
      { error: 'Failed to save onboarding profile', details: error.message },
      { status: 500 }
    );
  }
}
