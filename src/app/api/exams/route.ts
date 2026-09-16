import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedInitialData } from '@/lib/db/seed';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    seedInitialData();

    const user = await getCurrentUser();

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

    // 2. Fetch primary user enrollment if logged in
    let primaryEnrollment = null;
    if (user) {
      const enrStmt = db.prepare(`
        SELECT ue.*, e.title as exam_title, e.code as exam_code
        FROM user_exam_enrollments ue
        JOIN exams e ON e.id = ue.exam_id
        WHERE ue.user_id = ? AND ue.is_primary = 1
        LIMIT 1
      `);
      primaryEnrollment = enrStmt.get(user.id) || null;
    }

    return NextResponse.json({
      success: true,
      exams,
      primaryEnrollment,
    });
  } catch (error: any) {
    console.error('Error fetching exams:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve exams catalog', details: error.message },
      { status: 500 }
    );
  }
}
