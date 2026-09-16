import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedInitialData } from '@/lib/db/seed';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    seedInitialData();

    const user = await getCurrentUser();
    const userId = user?.id;

    // 1. Fetch Exam
    const examStmt = db.prepare('SELECT * FROM exams WHERE id = ?');
    const exam = examStmt.get(id) as any;

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // 2. Fetch Stages
    const stagesStmt = db.prepare('SELECT * FROM exam_stages WHERE exam_id = ? ORDER BY stage_number ASC');
    const stages = stagesStmt.all(id) as any[];

    // 3. Fetch Subjects
    const subjectsStmt = db.prepare('SELECT * FROM subjects WHERE exam_id = ? ORDER BY order_index ASC');
    const subjects = subjectsStmt.all(id) as any[];

    // 4. Fetch Syllabus Nodes with User Progress
    const nodesStmt = db.prepare(`
      SELECT 
        sn.*,
        s.name as subject_name,
        s.code as subject_code,
        s.color_accent,
        utp.status as user_status,
        utp.mastery_percentage,
        utp.questions_practiced,
        utp.questions_correct
      FROM syllabus_nodes sn
      JOIN subjects s ON s.id = sn.subject_id
      LEFT JOIN user_topic_progress utp ON utp.topic_id = sn.id AND utp.user_id = ?
      WHERE s.exam_id = ?
      ORDER BY s.order_index ASC, sn.order_index ASC
    `);
    const syllabusNodes = nodesStmt.all(userId || 'student-demo', id) as any[];

    // 5. Fetch Topic Resources
    const resourcesStmt = db.prepare(`
      SELECT tr.*, sn.title as topic_title
      FROM topic_resources tr
      JOIN syllabus_nodes sn ON sn.id = tr.topic_id
      JOIN subjects s ON s.id = sn.subject_id
      WHERE s.exam_id = ?
    `);
    const resources = resourcesStmt.all(id) as any[];

    // 6. Check if user is enrolled
    let enrollment = null;
    if (userId) {
      const enrStmt = db.prepare('SELECT * FROM user_exam_enrollments WHERE user_id = ? AND exam_id = ?');
      enrollment = enrStmt.get(userId, id);
    }

    return NextResponse.json({
      success: true,
      exam,
      stages,
      subjects,
      syllabusNodes,
      resources,
      enrollment,
    });
  } catch (error: any) {
    console.error('Error fetching exam details:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve exam details', details: error.message },
      { status: 500 }
    );
  }
}
