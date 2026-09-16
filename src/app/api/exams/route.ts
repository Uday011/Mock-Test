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

    // 1. Fetch all active exams with subject and topic counts
    const examsStmt = db.prepare(`
      SELECT 
        e.*,
        (SELECT COUNT(*) FROM subjects s WHERE s.exam_id = e.id) as subjects_count,
        (SELECT COUNT(*) FROM syllabus_nodes sn JOIN subjects sub ON sn.subject_id = sub.id WHERE sub.exam_id = e.id) as topics_count,
        (SELECT COUNT(*) FROM tests t WHERE t.exam_id = e.id) as tests_count
      FROM exams e
      WHERE e.is_active = 1
      ORDER BY e.created_at ASC
    `);
    const exams = examsStmt.all() as any[];

    // Fetch subjects for each exam
    const subjectsStmt = db.prepare('SELECT id, exam_id, name, code, color_accent FROM subjects ORDER BY order_index ASC');
    const allSubjects = subjectsStmt.all() as any[];

    const enrichedExams = exams.map((ex) => {
      const subjects = allSubjects.filter((s) => s.exam_id === ex.id);
      return { ...ex, subjects };
    });

    // 2. Fetch primary user enrollment if logged in
    let primaryEnrollment = null;
    let allUserEnrollments: any[] = [];
    if (userId) {
      const enrStmt = db.prepare(`
        SELECT ue.*, e.title as exam_title, e.code as exam_code
        FROM user_exam_enrollments ue
        JOIN exams e ON e.id = ue.exam_id
        WHERE ue.user_id = ? AND ue.is_primary = 1
        LIMIT 1
      `);
      primaryEnrollment = enrStmt.get(userId) || null;

      const allEnrStmt = db.prepare('SELECT * FROM user_exam_enrollments WHERE user_id = ?');
      allUserEnrollments = allEnrStmt.all(userId) as any[];
    }

    return NextResponse.json({
      success: true,
      exams: enrichedExams,
      primaryEnrollment,
      userEnrollments: allUserEnrollments,
    });
  } catch (error: any) {
    console.error('Error fetching exams:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve exams catalog', details: error.message },
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
    const { exam_id } = body;

    if (!exam_id) {
      return NextResponse.json({ error: 'exam_id required' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Clear existing primary
    db.prepare('UPDATE user_exam_enrollments SET is_primary = 0 WHERE user_id = ?').run(userId);

    // Set or insert primary
    const existing = db.prepare('SELECT id FROM user_exam_enrollments WHERE user_id = ? AND exam_id = ?').get(userId, exam_id) as any;
    if (existing) {
      db.prepare('UPDATE user_exam_enrollments SET is_primary = 1 WHERE id = ?').run(existing.id);
    } else {
      db.prepare(`
        INSERT INTO user_exam_enrollments (id, user_id, exam_id, target_year, target_score, is_primary, enrolled_at)
        VALUES (?, ?, ?, 2026, 165.0, 1, ?)
      `).run(
        `enr-${userId}-${exam_id}`,
        userId,
        exam_id,
        now
      );
    }

    // Also update preferred exam in onboarding profile if exists
    try {
      db.prepare('UPDATE user_onboarding_profiles SET preferred_exam_id = ? WHERE user_id = ?').run(exam_id, userId);
    } catch {}

    return NextResponse.json({ success: true, exam_id });
  } catch (error: any) {
    console.error('Error setting primary exam:', error);
    return NextResponse.json(
      { error: 'Failed to set primary exam', details: error.message },
      { status: 500 }
    );
  }
}
