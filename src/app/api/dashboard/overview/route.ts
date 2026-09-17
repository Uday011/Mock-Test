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

    // If unauthenticated, default to the demo student for seamless preview
    if (!userId) {
      const demoStudent = db.prepare("SELECT id, name, email, role FROM users WHERE role = 'student' LIMIT 1").get() as any;
      if (demoStudent) {
        userId = demoStudent.id;
        user = demoStudent;
      }
    }

    const safeUserId = userId || '';

    // 1. Fetch Primary Exam Enrollment
    let primaryEnrollment = null;
    if (safeUserId) {
      const enrStmt = db.prepare(`
        SELECT ue.*, e.title as exam_title, e.code as exam_code, e.total_marks, e.total_duration_minutes, e.pattern_type, e.conducting_body, e.difficulty_level, e.pattern_summary
        FROM user_exam_enrollments ue
        JOIN exams e ON e.id = ue.exam_id
        WHERE ue.user_id = ? AND ue.is_primary = 1
        LIMIT 1
      `);
      primaryEnrollment = enrStmt.get(safeUserId) as any;
    }

    // Fallback to SSC CGL 2026 if no enrollment found
    const examId = primaryEnrollment?.exam_id || 'exam-ssc-cgl-2026';
    const examStmt = db.prepare('SELECT * FROM exams WHERE id = ?');
    const activeExam = examStmt.get(examId) as any;

    // 2. Fetch User Onboarding Profile
    const obStmt = db.prepare('SELECT * FROM user_onboarding_profiles WHERE user_id = ?');
    const onboardingProfile = obStmt.get(safeUserId) as any;

    let declaredWeakSubjects: string[] = [];
    let declaredStrongSubjects: string[] = [];
    if (onboardingProfile) {
      try { declaredWeakSubjects = JSON.parse(onboardingProfile.weak_subjects_json || '[]'); } catch {}
      try { declaredStrongSubjects = JSON.parse(onboardingProfile.strong_subjects_json || '[]'); } catch {}
    }

    // 3. Fetch Exam Stages
    const stagesStmt = db.prepare('SELECT * FROM exam_stages WHERE exam_id = ? ORDER BY stage_number ASC');
    const stages = stagesStmt.all(examId) as any[];

    // 4. Fetch Subjects and Topic Progress for this exam
    const subjectsStmt = db.prepare(`
      SELECT 
        s.*,
        (SELECT COUNT(*) FROM syllabus_nodes sn WHERE sn.subject_id = s.id) as total_topics,
        (SELECT COUNT(*) FROM syllabus_nodes sn 
         JOIN user_topic_progress utp ON utp.topic_id = sn.id 
         WHERE sn.subject_id = s.id AND utp.user_id = ? AND utp.status = 'mastered') as mastered_topics,
        (SELECT AVG(utp.mastery_percentage) FROM syllabus_nodes sn 
         JOIN user_topic_progress utp ON utp.topic_id = sn.id 
         WHERE sn.subject_id = s.id AND utp.user_id = ?) as avg_mastery,
        (SELECT SUM(utp.questions_practiced) FROM syllabus_nodes sn 
         JOIN user_topic_progress utp ON utp.topic_id = sn.id 
         WHERE sn.subject_id = s.id AND utp.user_id = ?) as total_practiced,
        (SELECT SUM(utp.questions_correct) FROM syllabus_nodes sn 
         JOIN user_topic_progress utp ON utp.topic_id = sn.id 
         WHERE sn.subject_id = s.id AND utp.user_id = ?) as total_correct
      FROM subjects s
      WHERE s.exam_id = ?
      ORDER BY s.order_index ASC
    `);
    const subjects = subjectsStmt.all(safeUserId, safeUserId, safeUserId, safeUserId, examId) as any[];

    // 5. Fetch Mistake Records
    const mistakesStmt = db.prepare(`
      SELECT mr.*, sn.title as topic_title, s.name as subject_name
      FROM mistake_records mr
      LEFT JOIN syllabus_nodes sn ON sn.id = mr.topic_id
      LEFT JOIN subjects s ON s.id = mr.subject_id
      WHERE mr.user_id = ?
      ORDER BY mr.created_at DESC
      LIMIT 10
    `);
    const mistakes = mistakesStmt.all(safeUserId) as any[];

    // 6. Fetch Recent Attempts
    const attemptsStmt = db.prepare(`
      SELECT ta.*, t.title as test_title, t.subject as test_subject
      FROM test_attempts ta
      JOIN tests t ON t.id = ta.test_id
      WHERE ta.user_id = ?
      ORDER BY ta.created_at DESC
      LIMIT 5
    `);
    const attempts = attemptsStmt.all(safeUserId) as any[];

    // 7. Fetch Available / Upcoming Tests for this exam
    const testsStmt = db.prepare(`
      SELECT t.*,
        (SELECT COUNT(*) FROM questions q WHERE q.test_id = t.id) as questions_count
      FROM tests t
      WHERE t.exam_id = ? OR t.section_id = 'sec-ssc'
      ORDER BY t.created_at DESC
      LIMIT 4
    `);
    const availableTests = testsStmt.all(examId) as any[];

    // 7b. Fetch Enrolled Test Series
    const enrolledSeriesStmt = db.prepare(`
      SELECT 
        use.id as enrollment_id,
        use.access_tier,
        use.progress_percentage,
        use.completed_tests_count,
        use.enrolled_at,
        ts.id as series_id,
        ts.title as series_title,
        ts.description as series_description,
        ts.total_tests,
        ts.is_paid,
        ts.price_inr,
        e.title as exam_title,
        u.name as creator_name
      FROM user_series_enrollments use
      JOIN test_series ts ON ts.id = use.series_id
      LEFT JOIN exams e ON e.id = ts.exam_id
      LEFT JOIN users u ON u.id = ts.creator_id
      WHERE use.user_id = ?
      ORDER BY use.enrolled_at DESC
    `);
    const enrolledSeries = safeUserId ? (enrolledSeriesStmt.all(safeUserId) as any[]) : [];

    // 8. Fetch Learning Path & Units
    const pathStmt = db.prepare(`
      SELECT * FROM learning_paths WHERE exam_id = ? ORDER BY created_at DESC LIMIT 1
    `);
    const learningPath = pathStmt.get(examId) as any;

    let units: any[] = [];
    if (learningPath) {
      const unitsStmt = db.prepare(`
        SELECT lu.*, sn.title as topic_title, sn.code as topic_code, sn.weightage_percentage, s.name as subject_name, s.color_accent
        FROM learning_units lu
        JOIN syllabus_nodes sn ON sn.id = lu.topic_id
        JOIN subjects s ON s.id = sn.subject_id
        WHERE lu.path_id = ?
        ORDER BY lu.order_index ASC
      `);
      units = unitsStmt.all(learningPath.id) as any[];
    }

    // 9. Calculate aggregate learner metrics
    let totalPracticed = 0;
    let totalCorrect = 0;
    let totalTopics = 0;
    let masteredTopics = 0;

    for (const sub of subjects) {
      totalPracticed += sub.total_practiced || 0;
      totalCorrect += sub.total_correct || 0;
      totalTopics += sub.total_topics || 0;
      masteredTopics += sub.mastered_topics || 0;
    }

    const accuracyRate = totalPracticed > 0 ? (totalCorrect / totalPracticed) * 100 : 78.5;
    const syllabusProgress = totalTopics > 0 ? (masteredTopics / totalTopics) * 100 : 42.0;

    const targetScore = primaryEnrollment?.target_score || 165.0;
    const predictedScore = 142.0;

    // 10. Weak Topics & Recommended Next Action
    const weakTopicStmt = db.prepare(`
      SELECT sn.*, s.name as subject_name, utp.mastery_percentage
      FROM syllabus_nodes sn
      JOIN subjects s ON s.id = sn.subject_id
      LEFT JOIN user_topic_progress utp ON utp.topic_id = sn.id AND utp.user_id = ?
      WHERE s.exam_id = ? AND (utp.status = 'needs_focus' OR utp.mastery_percentage < 50)
      ORDER BY sn.weightage_percentage DESC
      LIMIT 3
    `);
    const weakTopics = weakTopicStmt.all(safeUserId, examId) as any[];

    const weakestTopic = weakTopics[0] || {
      id: 'topic-cgl-geometry',
      title: 'Triangles, Circles & Coordinate Geometry',
      subject_name: 'Quantitative Aptitude',
      mastery_percentage: 44.0,
      weightage_percentage: 10.0,
      code: 'MATH-105',
    };

    return NextResponse.json({
      success: true,
      activeExam,
      stages,
      primaryEnrollment,
      onboardingProfile: onboardingProfile
        ? {
            ...onboardingProfile,
            declaredWeakSubjects,
            declaredStrongSubjects,
          }
        : null,
      stats: {
        predictedScore,
        maxScore: activeExam?.total_marks || 200,
        targetScore,
        accuracyRate: Number(accuracyRate.toFixed(1)),
        syllabusProgress: Number(syllabusProgress.toFixed(1)),
        totalPracticed,
        totalCorrect,
        readinessIndex: 71, // Benchmark readiness %
        cutoffBar: 138.0,
        pendingRevisionCount: mistakes.filter(m => !m.is_resolved).length,
      },
      recommendedAction: {
        topicId: weakestTopic.id || 'topic-cgl-geometry',
        topicTitle: weakestTopic.title,
        subjectName: weakestTopic.subject_name,
        code: weakestTopic.code,
        currentMastery: weakestTopic.mastery_percentage || 44.0,
        weightage: weakestTopic.weightage_percentage || 10.0,
        urgency: 'high',
        headline: `Focus Drill: ${weakestTopic.title}`,
        reason: `Your accuracy in ${weakestTopic.title} is currently ${weakestTopic.mastery_percentage || 44}%. Raising this high-weightage topic will boost your predicted score by +8 to +10 marks.`,
        estimatedMinutes: 15,
      },
      weakAreas: {
        declaredWeakSubjects,
        flaggedTopics: weakTopics.length > 0 ? weakTopics : [
          {
            id: 'topic-cgl-geometry',
            title: 'Triangles, Circles & Coordinate Geometry',
            subject_name: 'Quantitative Aptitude',
            mastery_percentage: 44.0,
            weightage_percentage: 10.0,
            code: 'MATH-105',
          },
          {
            id: 'topic-cgl-history',
            title: 'Modern Indian History & Freedom Movement',
            subject_name: 'General Awareness',
            mastery_percentage: 58.0,
            weightage_percentage: 6.5,
            code: 'GA-102',
          },
        ],
      },
      subjects,
      mistakes,
      attempts,
      availableTests,
      enrolled_series: enrolledSeries,
      learningPath: learningPath ? { ...learningPath, units } : null,
    });
  } catch (error: any) {
    console.error('[Dashboard Overview API Error]:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve dashboard overview', details: error.message },
      { status: 500 }
    );
  }
}
