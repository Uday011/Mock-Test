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
    const now = new Date();
    const nowIso = now.toISOString();

    // 1. Overdue Topics for Spaced Repetition
    // Topics where next_revision_date <= now OR status = 'needs_revision'
    const overdueTopicsStmt = db.prepare(`
      SELECT utp.*, sn.title as topic_title, sn.code as topic_code, sn.weightage_percentage,
             s.name as subject_name, s.code as subject_code
      FROM user_topic_progress utp
      JOIN syllabus_nodes sn ON sn.id = utp.topic_id
      JOIN subjects s ON s.id = sn.subject_id
      WHERE utp.user_id = ? AND (utp.next_revision_date <= ? OR utp.status = 'needs_revision')
      ORDER BY sn.weightage_percentage DESC, utp.next_revision_date ASC
    `);
    const overdueTopics = overdueTopicsStmt.all(safeUserId, nowIso) as any[];

    // 2. Upcoming Topics for Revision (next 7 days)
    const futureDate = new Date(Date.now() + 7 * 86400000).toISOString();
    const upcomingTopicsStmt = db.prepare(`
      SELECT utp.*, sn.title as topic_title, sn.code as topic_code, sn.weightage_percentage,
             s.name as subject_name, s.code as subject_code
      FROM user_topic_progress utp
      JOIN syllabus_nodes sn ON sn.id = utp.topic_id
      JOIN subjects s ON s.id = sn.subject_id
      WHERE utp.user_id = ? AND utp.next_revision_date > ? AND utp.next_revision_date <= ?
      ORDER BY utp.next_revision_date ASC
    `);
    const upcomingTopics = upcomingTopicsStmt.all(safeUserId, nowIso, futureDate) as any[];

    // 3. Questions Due for Retry (unresolved mistakes)
    const retryQuestionsStmt = db.prepare(`
      SELECT mr.*, sn.title as topic_title, s.name as subject_name
      FROM mistake_records mr
      LEFT JOIN syllabus_nodes sn ON sn.id = mr.topic_id
      LEFT JOIN subjects s ON s.id = mr.subject_id
      WHERE mr.user_id = ? AND mr.is_resolved = 0
      ORDER BY mr.attempt_count DESC, mr.created_at DESC
      LIMIT 10
    `);
    const retryQuestions = retryQuestionsStmt.all(safeUserId) as any[];

    // 4. Repeated Mistakes (attempted > 1 time and still open)
    const repeatedMistakesStmt = db.prepare(`
      SELECT mr.*, sn.title as topic_title, s.name as subject_name
      FROM mistake_records mr
      LEFT JOIN syllabus_nodes sn ON sn.id = mr.topic_id
      LEFT JOIN subjects s ON s.id = mr.subject_id
      WHERE mr.user_id = ? AND mr.attempt_count > 1 AND mr.is_resolved = 0
      ORDER BY mr.attempt_count DESC
    `);
    const repeatedMistakes = repeatedMistakesStmt.all(safeUserId) as any[];

    // 5. Recently Learned Topics (studied in past 7 days)
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const recentTopicsStmt = db.prepare(`
      SELECT utp.*, sn.title as topic_title, sn.code as topic_code, s.name as subject_name
      FROM user_topic_progress utp
      JOIN syllabus_nodes sn ON sn.id = utp.topic_id
      JOIN subjects s ON s.id = sn.subject_id
      WHERE utp.user_id = ? AND utp.last_studied_at >= ?
      ORDER BY utp.last_studied_at DESC
    `);
    const recentTopics = recentTopicsStmt.all(safeUserId, weekAgo) as any[];

    // 6. Weak Areas (mastery < 60%)
    const weakAreasStmt = db.prepare(`
      SELECT utp.*, sn.title as topic_title, sn.code as topic_code, sn.weightage_percentage,
             s.name as subject_name
      FROM user_topic_progress utp
      JOIN syllabus_nodes sn ON sn.id = utp.topic_id
      JOIN subjects s ON s.id = sn.subject_id
      WHERE utp.user_id = ? AND utp.mastery_percentage < 60.0
      ORDER BY sn.weightage_percentage DESC
    `);
    const weakAreas = weakAreasStmt.all(safeUserId) as any[];

    // 7. Curated Recommended Revision Sessions
    const sessions = [
      {
        id: 'session-speed-drill',
        title: '15-Min Precision Calculation Sprint',
        subject: 'Quantitative Aptitude',
        duration_minutes: 15,
        question_count: 10,
        focus: 'Eliminating calculation errors and marked price discounts under 45s timer.',
        category: 'calculation_error',
        urgency: 'high',
      },
      {
        id: 'session-geom-remedial',
        title: 'Geometry & Chord Theorem Derivation',
        subject: 'Quantitative Aptitude',
        duration_minutes: 20,
        question_count: 8,
        focus: 'Tangent-secant power of a point and cyclic quadrilateral proofs.',
        category: 'conceptual_gap',
        urgency: 'critical',
      },
      {
        id: 'session-polity-flash',
        title: 'Constitutional Writs & Fundamental Rights Flash Review',
        subject: 'General Awareness',
        duration_minutes: 10,
        question_count: 12,
        focus: 'Articles 14 to 32 quick distinction matrices.',
        category: 'formula_recall',
        urgency: 'medium',
      },
    ];

    return NextResponse.json({
      success: true,
      overdueTopics,
      upcomingTopics,
      retryQuestions,
      repeatedMistakes,
      recentTopics,
      weakAreas,
      sessions,
      summary: {
        overdue_topics_count: overdueTopics.length,
        upcoming_topics_count: upcomingTopics.length,
        unresolved_mistakes_count: retryQuestions.length,
        repeated_mistakes_count: repeatedMistakes.length,
        weak_topics_count: weakAreas.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching revision queue:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve revision queue', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
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
    const { topic_id, action = 'complete_revision' } = body;

    if (!topic_id) {
      return NextResponse.json({ error: 'topic_id is required' }, { status: 400 });
    }

    const prog = db.prepare('SELECT * FROM user_topic_progress WHERE user_id = ? AND topic_id = ?').get(userId, topic_id) as any;
    if (!prog) {
      return NextResponse.json({ error: 'Topic progress record not found' }, { status: 404 });
    }

    const currentInterval = prog.repetition_interval_days || 1;
    const currentRepetition = prog.repetition_count || 0;

    // Spaced repetition progression: 1 -> 3 -> 7 -> 14 -> 30 days
    let nextInterval = 3;
    if (currentInterval <= 1) nextInterval = 3;
    else if (currentInterval <= 3) nextInterval = 7;
    else if (currentInterval <= 7) nextInterval = 14;
    else nextInterval = 30;

    const nextDate = new Date(Date.now() + nextInterval * 86400000).toISOString();
    const now = new Date().toISOString();

    const newStatus = (prog.mastery_percentage || 0) >= 75.0 ? 'proficient' : 'practiced';

    db.prepare(`
      UPDATE user_topic_progress SET
        status = ?,
        repetition_count = ?,
        repetition_interval_days = ?,
        next_revision_date = ?,
        last_studied_at = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      newStatus,
      currentRepetition + 1,
      nextInterval,
      nextDate,
      now,
      now,
      prog.id
    );

    return NextResponse.json({
      success: true,
      topic_id,
      repetition_count: currentRepetition + 1,
      next_interval_days: nextInterval,
      next_revision_date: nextDate,
      new_status: newStatus,
    });
  } catch (error: any) {
    console.error('Error updating revision schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update revision schedule', details: error.message },
      { status: 500 }
    );
  }
}
