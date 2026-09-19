export interface ReadinessFactor {
  name: string;
  score: number;
  weight: string;
  status: 'Strong' | 'Optimal' | 'Competitive' | 'Moderate' | 'Active' | 'Backlog' | 'Focus Needed' | 'Balanced' | 'Needs Balance' | 'Consistent' | 'Building';
}

export interface ReadinessResult {
  readinessIndex: number;
  qualitativeBand: 'Exam Ready' | 'Competitive' | 'Developing' | 'Emerging' | 'Foundational';
  predictedScore: number;
  maxScore: number;
  syllabusCoverage: number;
  topicMasteryRate: number;
  recentAccuracy: number;
  resolvedRate: number;
  sectionalBalance: number;
  mockEndurance: number;
  paceScore: number;
  consistencyScore: number;
  mistakeControlScore: number;
  contributingFactors: ReadinessFactor[];
}

export function calculateReadinessIndex(
  db: any,
  userId: string,
  examId: string
): ReadinessResult {
  // 1. Fetch Exam
  const exam = db.prepare('SELECT * FROM exams WHERE id = ?').get(examId) as any || {
    title: 'CAT 2026',
    total_marks: 198,
    total_duration_minutes: 120,
  };
  const maxScore = exam.total_marks || 198;

  // 2. Fetch User Attempts
  const attemptsStmt = db.prepare(`
    SELECT ta.*, t.title as test_title, t.test_type, t.subject as test_subject
    FROM test_attempts ta
    JOIN tests t ON t.id = ta.test_id
    WHERE ta.user_id = ? AND ta.status = 'completed'
    ORDER BY ta.created_at ASC
  `);
  const attempts = userId ? (attemptsStmt.all(userId) as any[]) : [];

  // 3. Fetch Subjects & Topics
  const subjectsStmt = db.prepare(`
    SELECT s.*,
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
  const subjectsRaw = userId ? (subjectsStmt.all(userId, userId, examId) as any[]) : [];
  const subjects = subjectsRaw.map((sub) => {
    const practiced = sub.total_practiced || 0;
    const correct = sub.total_correct || 0;
    const accuracy = practiced > 0 ? Math.round((correct / practiced) * 1000) / 10 : 75.0;
    return { ...sub, accuracy };
  });

  const allTopicsStmt = db.prepare(`
    SELECT sn.id, sn.title, sn.subject_id, sn.weightage_percentage,
           COALESCE(utp.status, 'not_started') as status,
           COALESCE(utp.mastery_percentage, 0) as mastery_percentage,
           COALESCE(utp.questions_practiced, 0) as questions_practiced,
           COALESCE(utp.questions_correct, 0) as questions_correct,
           utp.next_revision_date
    FROM syllabus_nodes sn
    JOIN subjects s ON s.id = sn.subject_id
    LEFT JOIN user_topic_progress utp ON utp.topic_id = sn.id AND utp.user_id = ?
    WHERE s.exam_id = ?
  `);
  const allTopics = userId ? (allTopicsStmt.all(userId, examId) as any[]) : [];

  // Mastery Distribution
  const totalTopicsCount = allTopics.length || 1;
  const coveredTopicsCount = allTopics.filter((t) => t.status !== 'not_started').length;
  const syllabusCoverage = Math.min(100, Math.round((coveredTopicsCount / totalTopicsCount) * 100));

  const proficientTopicsCount = allTopics.filter(
    (t) => t.status === 'proficient' || t.status === 'mastered'
  ).length;
  const topicMasteryRate = Math.min(100, Math.round((proficientTopicsCount / totalTopicsCount) * 100));

  // 4. Mistake Metrics
  const mistakesStmt = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN is_resolved = 1 THEN 1 ELSE 0 END) as resolved_count,
      SUM(CASE WHEN is_resolved = 0 THEN 1 ELSE 0 END) as unresolved_count,
      SUM(CASE WHEN attempt_count > 1 AND is_resolved = 0 THEN 1 ELSE 0 END) as repeated_count
    FROM mistake_records
    WHERE user_id = ?
  `);
  const mistakeMetrics = userId ? (mistakesStmt.get(userId) as any) : null;
  const totalMistakes = mistakeMetrics?.total || 0;
  const resolvedMistakes = mistakeMetrics?.resolved_count || 0;
  const repeatedMistakes = mistakeMetrics?.repeated_count || 0;

  // 5. Compute Component Scores
  const latestAttempt = attempts[attempts.length - 1];
  const recentAccuracy = latestAttempt ? Math.round(latestAttempt.accuracy) : 78;

  const resolvedRate = totalMistakes > 0 ? Math.round((resolvedMistakes / totalMistakes) * 100) : 80;

  const subjectAccuracies = subjects.map((s) => s.accuracy);
  const minAcc = Math.min(...(subjectAccuracies.length ? subjectAccuracies : [70]));
  const maxAcc = Math.max(...(subjectAccuracies.length ? subjectAccuracies : [85]));
  const spread = Math.max(0, maxAcc - minAcc);
  const sectionalBalance = Math.max(40, 100 - spread * 2);

  const fullMocks = attempts.filter((a) => a.test_type === 'full_mock');
  const mockEndurance = fullMocks.length > 0
    ? Math.min(100, Math.round(fullMocks[fullMocks.length - 1].percentage || 70))
    : 65;

  const avgPace = latestAttempt && latestAttempt.total_questions > 0
    ? Math.round(latestAttempt.time_taken_seconds / latestAttempt.total_questions)
    : 52;
  const paceScore = Math.max(50, Math.min(100, 100 - Math.abs(52 - avgPace) * 2));

  const consistencyScore = 82;

  const repeatedPenalty = repeatedMistakes * 12;
  const mistakeControlScore = Math.max(30, 100 - repeatedPenalty);

  // 6. Weighted Readiness Index (0 - 100)
  const readinessIndex = Math.round(
    syllabusCoverage * 0.15 +
    topicMasteryRate * 0.20 +
    recentAccuracy * 0.15 +
    resolvedRate * 0.10 +
    sectionalBalance * 0.10 +
    mockEndurance * 0.10 +
    paceScore * 0.10 +
    consistencyScore * 0.05 +
    mistakeControlScore * 0.05
  );

  let qualitativeBand: 'Exam Ready' | 'Competitive' | 'Developing' | 'Emerging' | 'Foundational' = 'Competitive';
  if (readinessIndex >= 88) qualitativeBand = 'Exam Ready';
  else if (readinessIndex >= 72) qualitativeBand = 'Competitive';
  else if (readinessIndex >= 60) qualitativeBand = 'Developing';
  else if (readinessIndex >= 45) qualitativeBand = 'Emerging';
  else qualitativeBand = 'Foundational';

  // Predicted Score: Weighted between recent attempts average score and baseline readiness percentage
  let predictedScore: number;
  if (attempts.length > 0) {
    const recentScores = attempts.slice(-3).map((a) => a.final_score);
    const avgRecent = recentScores.reduce((acc, s) => acc + s, 0) / recentScores.length;
    predictedScore = Math.round(avgRecent * 10) / 10;
  } else {
    // If no attempts yet, project from readiness index & maxScore
    predictedScore = Math.round((readinessIndex / 100) * maxScore * 10) / 10;
  }

  const contributingFactors: ReadinessFactor[] = [
    { name: 'Syllabus Coverage', score: syllabusCoverage, weight: '15%', status: syllabusCoverage >= 70 ? 'Strong' : 'Moderate' },
    { name: 'Topic Mastery', score: topicMasteryRate, weight: '20%', status: topicMasteryRate >= 65 ? 'Strong' : 'Focus Needed' },
    { name: 'Recent Test Accuracy', score: recentAccuracy, weight: '15%', status: recentAccuracy >= 80 ? 'Optimal' : 'Competitive' },
    { name: 'Retention & Revision', score: resolvedRate, weight: '10%', status: resolvedRate >= 70 ? 'Active' : 'Backlog' },
    { name: 'Sectional Balance', score: sectionalBalance, weight: '10%', status: spread <= 15 ? 'Balanced' : 'Needs Balance' },
    { name: 'Mock Endurance', score: mockEndurance, weight: '10%', status: mockEndurance >= 70 ? 'Optimal' : 'Building' },
    { name: 'Time Management', score: paceScore, weight: '10%', status: Math.abs(52 - avgPace) <= 8 ? 'Optimal' : 'Needs Balance' },
    { name: 'Study Consistency', score: consistencyScore, weight: '5%', status: 'Consistent' },
    { name: 'Mistake Recurrence Control', score: mistakeControlScore, weight: '5%', status: repeatedMistakes === 0 ? 'Strong' : 'Focus Needed' },
  ];

  return {
    readinessIndex,
    qualitativeBand,
    predictedScore,
    maxScore,
    syllabusCoverage,
    topicMasteryRate,
    recentAccuracy,
    resolvedRate,
    sectionalBalance,
    mockEndurance,
    paceScore,
    consistencyScore,
    mistakeControlScore,
    contributingFactors,
  };
}
