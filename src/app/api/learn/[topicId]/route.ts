import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedInitialData } from '@/lib/db/seed';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ topicId: string }> }) {
  try {
    const db = getDb();
    seedInitialData();

    const { topicId } = await params;
    if (!topicId) {
      return NextResponse.json({ success: false, error: 'Topic ID is required' }, { status: 400 });
    }

    let user = await getCurrentUser();
    let userId = user?.id;
    if (!userId) {
      const demoStudent = db.prepare("SELECT id FROM users WHERE role = 'student' LIMIT 1").get() as any;
      if (demoStudent) userId = demoStudent.id;
    }

    // 1. Fetch Topic Node
    const topicNode = db.prepare(`
      SELECT n.*, s.name as subject_name, s.exam_id, e.title as exam_title
      FROM syllabus_nodes n
      JOIN subjects s ON s.id = n.subject_id
      JOIN exams e ON e.id = s.exam_id
      WHERE n.id = ?
    `).get(topicId) as any;

    if (!topicNode) {
      return NextResponse.json({ success: false, error: 'Topic not found' }, { status: 404 });
    }

    // 2. Fetch Rich Content from topic_contents table
    const contentRow = db.prepare('SELECT content_json FROM topic_contents WHERE topic_id = ?').get(topicId) as any;
    let content = null;
    if (contentRow?.content_json) {
      try {
        content = JSON.parse(contentRow.content_json);
      } catch {}
    }

    // If specific topic content is not seeded in DB, generate structured fallback
    if (!content) {
      content = {
        topic_id: topicNode.id,
        topic_title: topicNode.title,
        subject_name: topicNode.subject_name,
        estimated_read_minutes: Math.round((topicNode.estimated_study_hours || 5) * 6),
        learning_objectives: [
          `Master core definitions, principles, and axioms of ${topicNode.title}.`,
          `Analyze previous 5 years examination trends for ${topicNode.subject_name}.`,
          'Identify and circumvent classic cognitive traps and misread errors.',
          'Pass the end-of-topic mastery assessment with 75%+ accuracy.'
        ],
        prerequisites: [],
        overview: topicNode.description || `Comprehensive study and practice framework for ${topicNode.title} aligned with latest examination pattern.`,
        key_concepts: [
          {
            id: 'c-gen-1',
            title: `Foundations of ${topicNode.title}`,
            definition: `Core theoretical axiom governing ${topicNode.title} in competitive examinations.`,
            importance: 'core'
          }
        ],
        worked_examples: [],
        common_mistakes: [
          {
            id: 'm-gen-1',
            mistake_title: 'Premature Assumption Trap',
            error_trap: 'Proceeding with calculations before fully reading the constraints or units.',
            correct_approach: 'Highlight given conditions and question requirements before applying formulas.',
            prevention_rule: 'Always verify units and negative marking implications.'
          }
        ],
        pyq_references: [
          {
            id: 'pyq-gen-1',
            exam: 'SSC CGL',
            year: 2023,
            tier_or_stage: 'Tier-I',
            frequency_rating: 'high',
            question_summary: `Direct application question on ${topicNode.title}.`
          }
        ],
        active_recall_checks: [],
        recap_points: [
          `Review all formulas and properties of ${topicNode.title}.`,
          'Attempt the topic test below to validate your mastery.'
        ]
      };
    }

    // 3. Fetch User Progress on this topic
    let progress = null;
    if (userId) {
      progress = db.prepare('SELECT * FROM user_topic_progress WHERE user_id = ? AND topic_id = ?').get(userId, topicId) as any;
    }

    // 4. Fetch Subtopics
    const subtopics = db.prepare('SELECT * FROM syllabus_nodes WHERE parent_id = ? ORDER BY order_index ASC').all(topicId) as any[];

    // 5. Fetch Topic Test & its questions
    const topicTest = db.prepare(`
      SELECT id, title, description, duration_seconds, default_correct_marks, default_negative_marks
      FROM tests
      WHERE test_type = 'topic_test' AND topic_id = ?
      LIMIT 1
    `).get(topicId) as any;

    let testQuestions: any[] = [];
    if (topicTest) {
      const qRows = db.prepare(`
        SELECT id, question_number, question_text, options_json, correct_answer, explanation, correct_marks, negative_marks
        FROM questions
        WHERE test_id = ?
        ORDER BY question_number ASC
      `).all(topicTest.id) as any[];

      testQuestions = qRows.map((q) => {
        let opts = [];
        try {
          opts = JSON.parse(q.options_json);
        } catch {}
        return {
          ...q,
          options: opts,
        };
      });
    }

    // 6. Fetch Next Recommended Topic in Subject
    const nextTopic = db.prepare(`
      SELECT id, title, code FROM syllabus_nodes
      WHERE subject_id = ? AND level = 'topic' AND order_index > ?
      ORDER BY order_index ASC
      LIMIT 1
    `).get(topicNode.subject_id, topicNode.order_index) as any;

    return NextResponse.json({
      success: true,
      topic: {
        id: topicNode.id,
        title: topicNode.title,
        code: topicNode.code,
        subject_id: topicNode.subject_id,
        subject_name: topicNode.subject_name,
        exam_id: topicNode.exam_id,
        exam_title: topicNode.exam_title,
        estimated_study_hours: topicNode.estimated_study_hours,
        weightage_percentage: topicNode.weightage_percentage,
        difficulty: topicNode.difficulty || 'medium',
        description: topicNode.description,
      },
      content,
      subtopics,
      progress: {
        status: progress?.status || 'not_started',
        mastery_percentage: progress?.mastery_percentage || 0,
        questions_practiced: progress?.questions_practiced || 0,
        questions_correct: progress?.questions_correct || 0,
        tests_attempted: progress?.tests_attempted || 0,
        last_studied_at: progress?.last_studied_at || null,
        notes_taken: progress?.notes_taken || '',
        next_revision_date: progress?.next_revision_date || null,
        is_bookmarked: Boolean(progress?.is_bookmarked),
      },
      topic_test: topicTest
        ? {
            ...topicTest,
            questions: testQuestions,
          }
        : null,
      next_topic: nextTopic || null,
    });
  } catch (error: any) {
    console.error('API /api/learn/[topicId] error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}
