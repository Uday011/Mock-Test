import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedInitialData } from '@/lib/db/seed';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    seedInitialData();

    let user = await getCurrentUser();
    let userId = user?.id;

    if (!userId) {
      const demoStudent = db.prepare("SELECT id FROM users WHERE role = 'student' LIMIT 1").get() as any;
      if (demoStudent) userId = demoStudent.id;
    }

    const { searchParams } = new URL(req.url);
    let examId = searchParams.get('exam_id');

    if (!examId && userId) {
      const enr = db.prepare('SELECT exam_id FROM user_exam_enrollments WHERE user_id = ? AND is_primary = 1 LIMIT 1').get(userId) as any;
      examId = enr?.exam_id;
    }

    if (!examId) {
      examId = 'exam-ssc-cgl-2026';
    }

    // 1. Fetch Exam Details
    const exam = db.prepare('SELECT * FROM exams WHERE id = ?').get(examId) as any;
    if (!exam) {
      return NextResponse.json({ success: false, error: 'Exam not found' }, { status: 404 });
    }

    // 2. Fetch Subjects for this Exam
    const subjects = db.prepare('SELECT * FROM subjects WHERE exam_id = ? ORDER BY order_index ASC').all(examId) as any[];

    // 3. Fetch all syllabus nodes for this exam's subjects
    const subjectIds = subjects.map((s) => s.id);
    let allNodes: any[] = [];
    if (subjectIds.length > 0) {
      const placeholders = subjectIds.map(() => '?').join(',');
      allNodes = db.prepare(`SELECT * FROM syllabus_nodes WHERE subject_id IN (${placeholders}) ORDER BY order_index ASC`).all(...subjectIds) as any[];
    }

    // 4. Fetch User Progress for these topics
    const progressMap = new Map<string, any>();
    if (userId) {
      const progressList = db.prepare('SELECT * FROM user_topic_progress WHERE user_id = ?').all(userId) as any[];
      for (const p of progressList) {
        progressMap.set(p.topic_id, p);
      }
    }

    // 5. Fetch Topic Tests
    const tests = db.prepare("SELECT id, title, topic_id, duration_seconds FROM tests WHERE test_type = 'topic_test'").all() as any[];
    const testMap = new Map<string, any>();
    for (const t of tests) {
      if (t.topic_id) testMap.set(t.topic_id, t);
    }

    // 6. Fetch Resources count
    const resCountList = db.prepare('SELECT topic_id, COUNT(*) as count FROM topic_resources GROUP BY topic_id').all() as any[];
    const resCountMap = new Map<string, number>();
    for (const r of resCountList) {
      resCountMap.set(r.topic_id, r.count);
    }

    // Map all nodes by id for prerequisite resolving
    const nodeMap = new Map<string, any>();
    for (const n of allNodes) {
      nodeMap.set(n.id, n);
    }

    const nowIso = new Date().toISOString();
    let totalTopics = 0;
    let completedTopics = 0;
    let masteredTopics = 0;
    let revisionDueTopics = 0;

    // Build hierarchical tree: Subject -> Topics -> Subtopics
    const enrichedSubjects = subjects.map((subj) => {
      const subjNodes = allNodes.filter((n) => n.subject_id === subj.id);
      const rootTopics = subjNodes.filter((n) => !n.parent_id || n.level === 'topic');

      const enrichedTopics = rootTopics.map((topic) => {
        totalTopics++;
        const prog = progressMap.get(topic.id);
        const subtopicsRaw = subjNodes.filter((n) => n.parent_id === topic.id);

        let status = prog?.status || 'not_started';
        const mastery = prog?.mastery_percentage || 0;
        const nextRev = prog?.next_revision_date;

        let revisionStatus: 'due' | 'up_to_date' | 'scheduled' = 'scheduled';
        if (nextRev) {
          if (nextRev <= nowIso) {
            revisionStatus = 'due';
            revisionDueTopics++;
          } else {
            const diffDays = (new Date(nextRev).getTime() - Date.now()) / (1000 * 3600 * 24);
            if (diffDays > 3) revisionStatus = 'up_to_date';
          }
        }

        if (status === 'mastered') {
          masteredTopics++;
          completedTopics++;
        } else if (status === 'studied') {
          completedTopics++;
        }

        // Parse prerequisite names
        let prereqIds: string[] = [];
        try {
          prereqIds = JSON.parse(topic.prerequisite_ids_json || '[]');
        } catch {}

        const prereqNodes = prereqIds.map((pId) => {
          const pNode = nodeMap.get(pId);
          const pProg = progressMap.get(pId);
          return {
            id: pId,
            title: pNode?.title || pId,
            status: pProg?.status || 'not_started',
          };
        });

        // Enrich subtopics
        const subtopics = subtopicsRaw.map((sub) => {
          const subProg = progressMap.get(sub.id);
          return {
            ...sub,
            user_status: subProg?.status || 'not_started',
            user_mastery: subProg?.mastery_percentage || 0,
          };
        });

        return {
          id: topic.id,
          subject_id: topic.subject_id,
          parent_id: topic.parent_id,
          level: topic.level,
          title: topic.title,
          code: topic.code,
          order_index: topic.order_index,
          estimated_study_hours: topic.estimated_study_hours,
          weightage_percentage: topic.weightage_percentage,
          difficulty: topic.difficulty || 'medium',
          description: topic.description,
          resources_count: resCountMap.get(topic.id) || 0,
          user_status: status,
          user_mastery: mastery,
          revision_status: revisionStatus,
          next_revision_date: nextRev,
          is_bookmarked: Boolean(prog?.is_bookmarked),
          notes_taken: prog?.notes_taken || null,
          prerequisite_nodes: prereqNodes,
          subtopics,
          topic_test: testMap.get(topic.id) || null,
        };
      });

      return {
        id: subj.id,
        name: subj.name,
        code: subj.code,
        color_accent: subj.color_accent,
        topics: enrichedTopics,
      };
    });

    return NextResponse.json({
      success: true,
      exam: {
        id: exam.id,
        title: exam.title,
        code: exam.code,
        conducting_body: exam.conducting_body,
        pattern_summary: exam.pattern_summary,
      },
      stats: {
        total_topics: totalTopics,
        completed_topics: completedTopics,
        mastered_topics: masteredTopics,
        revision_due_count: revisionDueTopics,
        completion_percentage: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
      },
      subjects: enrichedSubjects,
    });
  } catch (error: any) {
    console.error('API /api/learn/tree error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}
