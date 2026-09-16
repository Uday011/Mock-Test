import { getDb } from './index';
import { hashPassword, getOrCreateRoleDemoUser } from '../auth';
import crypto from 'crypto';

let hasSeeded = false;

export function seedInitialData(): void {
  if (hasSeeded) return;
  hasSeeded = true;

  try {
    const db = getDb();
    const now = new Date().toISOString();

    // 1. Seed Superadmin, Admin, and Student users
    const superAdmin = getOrCreateRoleDemoUser('superadmin');
    const instituteAdmin = getOrCreateRoleDemoUser('admin');
    const student = getOrCreateRoleDemoUser('student');

    // 2. Seed Default Sections/Categories
    const sectionCountStmt = db.prepare('SELECT COUNT(*) as count FROM sections');
    const sectionCount = (sectionCountStmt.get() as any)?.count || 0;

    if (sectionCount === 0) {
      const insertSection = db.prepare(
        'INSERT OR IGNORE INTO sections (id, name, description, icon, is_active, created_at) VALUES (?, ?, ?, ?, 1, ?)'
      );
      insertSection.run('sec-ssc', 'SSC & Staff Selection', 'SSC CGL, CHSL, CPO, and Central Staff Selection recruitment exams.', 'Award', now);
      insertSection.run('sec-medical', 'Medical Entrance (NEET)', 'Physics, Chemistry, and Biology mock papers designed for pre-medical aspirants.', 'Stethoscope', now);
      insertSection.run('sec-engineering', 'Engineering Entrance (JEE)', 'Advanced Mathematics, Mechanics, and Physical Sciences for engineering mock exams.', 'Cpu', now);
      insertSection.run('sec-civil', 'Civil Services & UPSC', 'General Studies, Reasoning, Quantitative Aptitude, and Indian Polity.', 'Bookmark', now);
      insertSection.run('sec-general', 'Science & Computing', 'Foundational Computer Science, General Science, and Logical Aptitude.', 'Layers', now);
    } else {
      // Ensure sec-ssc exists
      db.prepare(
        'INSERT OR IGNORE INTO sections (id, name, description, icon, is_active, created_at) VALUES (?, ?, ?, ?, 1, ?)'
      ).run('sec-ssc', 'SSC & Staff Selection', 'SSC CGL, CHSL, CPO, and Central Staff Selection recruitment exams.', 'Award', now);
    }

    // 3. Seed Baseline Exams (NEET, UPSC, JEE) if not present
    const insertExam = db.prepare(`
      INSERT OR IGNORE INTO exams (id, code, title, category, description, target_year, pattern_type, total_marks, total_duration_minutes, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);

    insertExam.run(
      'exam-neet-2026',
      'NEET_UG_2026',
      'NEET UG 2026 (Medical)',
      'medical',
      'National Eligibility cum Entrance Test for undergraduate medical and dental programs across India.',
      2026,
      'multi_subject',
      720,
      200,
      now
    );

    insertExam.run(
      'exam-upsc-2026',
      'UPSC_CSE_2026',
      'UPSC Civil Services Prelims 2026',
      'civil_services',
      'General Studies Paper-I and Civil Services Aptitude Test (CSAT) for national administrative services.',
      2026,
      'stage_based',
      400,
      240,
      now
    );

    insertExam.run(
      'exam-jee-2026',
      'JEE_ADV_2026',
      'JEE Advanced 2026 (Engineering)',
      'engineering',
      'Joint Entrance Examination Advanced for premier admissions into Indian Institutes of Technology (IITs).',
      2026,
      'multi_subject',
      360,
      180,
      now
    );

    // 4. Seed Primary Sample Exam: SSC CGL 2026
    seedSscCglExam(db, student, instituteAdmin, now);

    // Update Conducting Body, Difficulty Level, and Pattern Summary for all master exams
    const updateExamMetadata = db.prepare(`
      UPDATE exams SET conducting_body = ?, difficulty_level = ?, pattern_summary = ? WHERE id = ?
    `);
    updateExamMetadata.run('Staff Selection Commission (SSC)', 'National Graduate Level', 'Tier-I Objective CBE (100 Qs / 200 Marks) + Tier-II Mains', 'exam-ssc-cgl-2026');
    updateExamMetadata.run('National Testing Agency (NTA)', 'National Pre-Medical Undergraduate', 'Single-Stage Pen & Paper OMR (180 Qs / 720 Marks)', 'exam-neet-2026');
    updateExamMetadata.run('Union Public Service Commission (UPSC)', 'All-India Civil Services Level', 'Prelims Screening (GS-I + CSAT) + Mains Written + Interview', 'exam-upsc-2026');
    updateExamMetadata.run('Joint Admission Board / IITs', 'Advanced Engineering Entrance', 'Paper 1 & Paper 2 Multi-Subject Computer Based Test', 'exam-jee-2026');

    // Seed Demo Student Onboarding Profile
    const obCheck = db.prepare('SELECT user_id FROM user_onboarding_profiles WHERE user_id = ?').get(student.id);
    if (!obCheck) {
      db.prepare(`
        INSERT INTO user_onboarding_profiles (
          user_id, preferred_exam_id, preparation_stage, target_timeline, daily_study_hours,
          strong_subjects_json, weak_subjects_json, diagnostic_test_status, completed_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        student.id,
        'exam-ssc-cgl-2026',
        'intermediate',
        '2026_tier1',
        4.0,
        JSON.stringify(['General Intelligence & Reasoning', 'English Comprehension']),
        JSON.stringify(['Quantitative Aptitude (Geometry)', 'General Awareness (Polity Articles)']),
        'completed',
        now,
        now
      );
    }

    // 5. Seed Educator Profile for Institute Admin if not present
    const educatorCheck = db.prepare('SELECT user_id FROM educator_profiles WHERE user_id = ?').get(instituteAdmin.id);
    if (!educatorCheck) {
      db.prepare(`
        INSERT INTO educator_profiles (user_id, headline, bio, institute_name, verification_status, specialization_subjects_json, total_students, average_rating, published_tests_count, created_at)
        VALUES (?, ?, ?, ?, 'verified', ?, ?, ?, ?, ?)
      `).run(
        instituteAdmin.id,
        'Director of Pedagogy & Senior SSC / Civil Faculty',
        'Over 16 years coaching competitive exam aspirants with deep emphasis on conceptual clarity, speed optimization, and cognitive mistake forensics.',
        'Nalanda Institute of Advanced Academics',
        JSON.stringify(['Quantitative Aptitude', 'Reasoning', 'General Studies']),
        1480,
        4.95,
        12,
        now
      );
    }

  } catch (err) {
    console.warn('[Seed initial data error]:', err);
  }
}

function seedSscCglExam(db: any, student: any, instituteAdmin: any, now: string): void {
  // Check if SSC CGL already seeded
  const existingExam = db.prepare("SELECT id FROM exams WHERE id = 'exam-ssc-cgl-2026'").get();
  if (existingExam) {
    return; // Already populated
  }

  // 1. Insert Exam Master
  db.prepare(`
    INSERT INTO exams (id, code, title, category, description, target_year, pattern_type, total_marks, total_duration_minutes, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `).run(
    'exam-ssc-cgl-2026',
    'SSC_CGL_2026',
    'SSC CGL 2026 (Combined Graduate Level)',
    'government_job',
    'Staff Selection Commission Combined Graduate Level Examination for Group B & C posts across Central Ministries, Departments, and Attached Offices.',
    2026,
    'stage_based',
    200.0,
    60,
    now
  );

  // 2. Insert Stages
  const insertStage = db.prepare(`
    INSERT INTO exam_stages (id, exam_id, name, stage_number, total_marks, total_questions, duration_minutes, is_computer_based, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertStage.run(
    'stage-cgl-tier1',
    'exam-ssc-cgl-2026',
    'Tier-I Computer Based Examination',
    1,
    200.0,
    100,
    60,
    1,
    'Objective multiple-choice screening test covering 4 sections (25 Qs each, +2 / -0.50 marks). Qualifying for Tier-II.',
    now
  );

  insertStage.run(
    'stage-cgl-tier2',
    'exam-ssc-cgl-2026',
    'Tier-II Mains Examination',
    2,
    390.0,
    130,
    135,
    1,
    'Paper-I compulsory objective mains exam: Mathematical Abilities, Reasoning, English Language, General Awareness, and Computer Knowledge Module.',
    now
  );

  // 3. Insert Subjects
  const insertSubject = db.prepare(`
    INSERT INTO subjects (id, exam_id, name, code, order_index, description, color_accent, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertSubject.run(
    'subj-cgl-quant',
    'exam-ssc-cgl-2026',
    'Quantitative Aptitude',
    'MATH',
    1,
    'Arithmetic, Advanced Algebra, Geometry, Mensuration & Trigonometric ratios',
    'amber',
    now
  );

  insertSubject.run(
    'subj-cgl-reasoning',
    'exam-ssc-cgl-2026',
    'General Intelligence & Reasoning',
    'REAS',
    2,
    'Verbal & Non-Verbal logic, Syllogisms, Analogies, Direction tests, Blood Relations, Series',
    'indigo',
    now
  );

  insertSubject.run(
    'subj-cgl-english',
    'exam-ssc-cgl-2026',
    'English Comprehension',
    'ENG',
    3,
    'Grammar, Error Spotting, Reading Comprehension, Cloze Tests, Idioms & Vocabulary',
    'emerald',
    now
  );

  insertSubject.run(
    'subj-cgl-ga',
    'exam-ssc-cgl-2026',
    'General Awareness',
    'GA',
    4,
    'Indian Polity, Modern Freedom Struggle, Geography, Macroeconomics & General Science',
    'rose',
    now
  );

  // 4. Insert Syllabus Nodes (Topics with weightages, prerequisites, estimated hours)
  const insertSyllabus = db.prepare(`
    INSERT INTO syllabus_nodes (id, subject_id, parent_id, level, title, code, order_index, estimated_study_hours, weightage_percentage, prerequisite_ids_json, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Quant Topics
  insertSyllabus.run(
    'topic-cgl-number-systems',
    'subj-cgl-quant',
    null,
    'topic',
    'Number Systems & Divisibility',
    'MATH-101',
    1,
    12.0,
    6.0,
    '[]',
    'Divisibility rules, LCM/HCF, unit digit calculation, power cycles, and Euler remainder theorem.',
    now
  );

  insertSyllabus.run(
    'topic-cgl-percentages',
    'subj-cgl-quant',
    null,
    'topic',
    'Percentages, Profit, Loss & Discount',
    'MATH-102',
    2,
    18.0,
    9.0,
    JSON.stringify(['topic-cgl-number-systems']),
    'Successive percentage shifts, marked price formulas, dishonet dealer problems, and discount margins.',
    now
  );

  insertSyllabus.run(
    'topic-cgl-ratio-proportions',
    'subj-cgl-quant',
    null,
    'topic',
    'Ratio, Proportion & Mixture Alligation',
    'MATH-103',
    3,
    14.0,
    7.5,
    JSON.stringify(['topic-cgl-percentages']),
    'Direct/inverse proportionality, mean proportional, mixture replacement cycles, and partnership distributions.',
    now
  );

  insertSyllabus.run(
    'topic-cgl-algebra',
    'subj-cgl-quant',
    null,
    'topic',
    'Elementary Algebra & Identities',
    'MATH-104',
    4,
    20.0,
    8.5,
    JSON.stringify(['topic-cgl-number-systems']),
    'Standard polynomial identities, symmetric algebraic expressions, factorization, and quadratic root analysis.',
    now
  );

  insertSyllabus.run(
    'topic-cgl-geometry',
    'subj-cgl-quant',
    null,
    'topic',
    'Triangles, Circles & Coordinate Geometry',
    'MATH-105',
    5,
    24.0,
    10.0,
    JSON.stringify(['topic-cgl-algebra']),
    'Centroid/orthocenter properties, intersecting chord theorems, cyclic quadrilaterals, and tangent secant equations.',
    now
  );

  // Reasoning Topics
  insertSyllabus.run(
    'topic-cgl-analogies',
    'subj-cgl-reasoning',
    null,
    'topic',
    'Analogies & Classification',
    'REAS-101',
    1,
    10.0,
    6.0,
    '[]',
    'Semantic pairs, numerical cube/square relations, and symbolic matrix classification.',
    now
  );

  insertSyllabus.run(
    'topic-cgl-syllogisms',
    'subj-cgl-reasoning',
    null,
    'topic',
    'Syllogisms & Logical Deductions',
    'REAS-102',
    2,
    14.0,
    7.0,
    '[]',
    'Universal affirmative/negative statements, Venn diagram overlap models, and "only a few" possibility rules.',
    now
  );

  insertSyllabus.run(
    'topic-cgl-coding',
    'subj-cgl-reasoning',
    null,
    'topic',
    'Coding-Decoding & Alphanumeric Series',
    'REAS-103',
    3,
    12.0,
    6.5,
    '[]',
    'Alphabet position shifts, reverse index coding, pattern step jumps, and symbol substitution matrices.',
    now
  );

  // English Topics
  insertSyllabus.run(
    'topic-cgl-grammar-errors',
    'subj-cgl-english',
    null,
    'topic',
    'Error Spotting & Sentence Improvement',
    'ENG-101',
    1,
    16.0,
    8.0,
    '[]',
    'Subject-verb concord, correlative conjunction proximity, prepositional collocations, and tense coherence.',
    now
  );

  insertSyllabus.run(
    'topic-cgl-comprehension',
    'subj-cgl-english',
    null,
    'topic',
    'Reading Comprehension & Cloze Tests',
    'ENG-102',
    2,
    18.0,
    9.0,
    '[]',
    'Passage central idea extraction, contextual inference, tone classification, and thematic cloze blanks.',
    now
  );

  insertSyllabus.run(
    'topic-cgl-vocab',
    'subj-cgl-english',
    null,
    'topic',
    'One-Word Substitutions, Idioms & Phrases',
    'ENG-103',
    3,
    20.0,
    8.0,
    '[]',
    'High-frequency SSC past 15-year vocabulary root analysis, classical idioms, and phrasal verb distinctions.',
    now
  );

  // General Awareness Topics
  insertSyllabus.run(
    'topic-cgl-polity',
    'subj-cgl-ga',
    null,
    'topic',
    'Indian Constitution & Governance',
    'GA-101',
    1,
    22.0,
    8.0,
    '[]',
    'Constitutional assembly, Fundamental Rights (Articles 12-35), Directive Principles, and Supreme Court jurisdiction.',
    now
  );

  insertSyllabus.run(
    'topic-cgl-history',
    'subj-cgl-ga',
    null,
    'topic',
    'Modern Indian History & National Movement',
    'GA-102',
    2,
    18.0,
    6.5,
    '[]',
    '1857 revolt, Indian National Congress sessions, Non-Cooperation, Civil Disobedience, and 1935 Government of India Act.',
    now
  );

  insertSyllabus.run(
    'topic-cgl-science',
    'subj-cgl-ga',
    null,
    'topic',
    'General Science & Environmental Ecology',
    'GA-103',
    3,
    16.0,
    6.0,
    '[]',
    'Newtonian laws, optical instruments, periodic table trends, human organ systems, vitamins, and ecosystems.',
    now
  );

  // 5. Topic Resources
  const insertResource = db.prepare(`
    INSERT INTO topic_resources (id, topic_id, title, resource_type, content_summary, external_url, estimated_read_minutes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertResource.run(
    'res-cgl-num-1',
    'topic-cgl-number-systems',
    'Divisibility Rules & Remainder Theorems Master Handbook',
    'formula_digest',
    'Shortcuts for 7, 11, 13, 72, 88 divisibility, Wilson theorem, and binomial remainder expressions.',
    null,
    15,
    now
  );

  insertResource.run(
    'res-cgl-perc-1',
    'topic-cgl-percentages',
    'Percentage-Fraction Multipliers & Profit-Loss Matrix',
    'cheat_sheet',
    'Instant conversion fractions (1/1 through 1/20), markup formulas, and dishonest seller multiplier tables.',
    null,
    12,
    now
  );

  insertResource.run(
    'res-cgl-geom-1',
    'topic-cgl-geometry',
    'Circle Theorems & Triangle Medians Blueprint',
    'notes',
    'Comprehensive reference with visual proofs for chord intersections, cyclic quad angles, and Apollonius theorem.',
    null,
    25,
    now
  );

  insertResource.run(
    'res-cgl-polity-1',
    'topic-cgl-polity',
    'Important Constitutional Articles & Amendments Ready-Reckoner',
    'notes',
    'Articles 14 to 32, Emergency provisions (352, 356, 360), and 42nd/44th/73rd/103rd amendments digest.',
    null,
    20,
    now
  );

  // 6. Learning Path & Units
  db.prepare(`
    INSERT INTO learning_paths (id, exam_id, title, description, target_days, recommended_hours_per_week, total_units, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'path-cgl-60d',
    'exam-ssc-cgl-2026',
    'SSC CGL 60-Day Strategic Master Plan',
    'Curated curriculum balancing high-weightage arithmetic, reasoning speed drills, constitutional polity, and full-length CBE mocks.',
    60,
    18.0,
    8,
    now
  );

  const insertUnit = db.prepare(`
    INSERT INTO learning_units (id, path_id, topic_id, order_index, is_core, estimated_minutes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertUnit.run('unit-1', 'path-cgl-60d', 'topic-cgl-number-systems', 1, 1, 90);
  insertUnit.run('unit-2', 'path-cgl-60d', 'topic-cgl-percentages', 2, 1, 120);
  insertUnit.run('unit-3', 'path-cgl-60d', 'topic-cgl-analogies', 3, 1, 60);
  insertUnit.run('unit-4', 'path-cgl-60d', 'topic-cgl-grammar-errors', 4, 1, 75);
  insertUnit.run('unit-5', 'path-cgl-60d', 'topic-cgl-polity', 5, 1, 90);
  insertUnit.run('unit-6', 'path-cgl-60d', 'topic-cgl-ratio-proportions', 6, 1, 90);
  insertUnit.run('unit-7', 'path-cgl-60d', 'topic-cgl-syllogisms', 7, 1, 75);
  insertUnit.run('unit-8', 'path-cgl-60d', 'topic-cgl-geometry', 8, 1, 150);

  // 7. Student Primary Enrollment: Set SSC CGL as Primary
  db.prepare('UPDATE user_exam_enrollments SET is_primary = 0 WHERE user_id = ?').run(student.id);

  db.prepare(`
    INSERT INTO user_exam_enrollments (id, user_id, exam_id, target_year, target_score, is_primary, enrolled_at)
    VALUES (?, ?, ?, ?, ?, 1, ?)
  `).run(
    'enr-student-ssc-cgl',
    student.id,
    'exam-ssc-cgl-2026',
    2026,
    165.0,
    now
  );

  // 8. Student Topic Progress: Realistic Diagnostic Profile (42% progress, 78.5% accuracy, 142/200 predicted score)
  const insertProgress = db.prepare(`
    INSERT OR REPLACE INTO user_topic_progress (id, user_id, topic_id, status, mastery_percentage, questions_practiced, questions_correct, tests_attempted, last_studied_at, notes_taken, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProgress.run('prog-cgl-1', student.id, 'topic-cgl-number-systems', 'mastered', 92.0, 65, 60, 4, new Date(Date.now() - 86400000).toISOString(), 'Strong accuracy on remainder theorems and unit digits.', now);
  insertProgress.run('prog-cgl-2', student.id, 'topic-cgl-percentages', 'in_progress', 74.0, 55, 41, 3, new Date(Date.now() - 172800000).toISOString(), 'Check discount calculations on marked price.', now);
  insertProgress.run('prog-cgl-3', student.id, 'topic-cgl-ratio-proportions', 'in_progress', 68.5, 40, 27, 2, new Date(Date.now() - 259200000).toISOString(), 'Practice alligation method for multi-container replacements.', now);
  insertProgress.run('prog-cgl-4', student.id, 'topic-cgl-geometry', 'needs_focus', 44.0, 35, 15, 2, new Date(Date.now() - 345600000).toISOString(), 'Circles and intersecting chord theorems need urgent review.', now);
  insertProgress.run('prog-cgl-5', student.id, 'topic-cgl-analogies', 'mastered', 95.0, 40, 38, 3, new Date(Date.now() - 432000000).toISOString(), 'High speed on semantic analogies.', now);
  insertProgress.run('prog-cgl-6', student.id, 'topic-cgl-syllogisms', 'mastered', 86.0, 30, 26, 2, new Date(Date.now() - 518400000).toISOString(), 'Few vs A Few rules clear.', now);
  insertProgress.run('prog-cgl-7', student.id, 'topic-cgl-grammar-errors', 'in_progress', 76.0, 45, 34, 3, new Date(Date.now() - 604800000).toISOString(), 'Subject-verb concord with correlatives needs careful inspection.', now);
  insertProgress.run('prog-cgl-8', student.id, 'topic-cgl-polity', 'in_progress', 70.0, 50, 35, 3, new Date(Date.now() - 691200000).toISOString(), 'Revision due for Articles 19 through 22.', now);
  insertProgress.run('prog-cgl-9', student.id, 'topic-cgl-history', 'in_progress', 58.0, 30, 17, 2, new Date(Date.now() - 777600000).toISOString(), 'Chronology of Viceroys and Acts from 1909 to 1947.', now);

  // 9. Seed Official SSC CGL Tier-I Mock Test 01
  const testId = 'test-ssc-cgl-tier1-mock1';
  db.prepare(`
    INSERT INTO tests (
      id, user_id, title, description, subject, section_id, duration_seconds,
      marking_scheme_type, default_correct_marks, default_negative_marks, default_unanswered_marks,
      shuffle_questions, shuffle_options, allow_navigation, show_palette, allow_review_marking, show_immediate_results,
      test_type, exam_id, subject_id, topic_id, visibility, is_paid, price_inr,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    testId,
    instituteAdmin.id,
    'SSC CGL 2026 Tier-I All India Diagnostic Mock 01',
    'Official high-fidelity Tier-I diagnostic mock conforming strictly to latest TCS pattern (Quant, Reasoning, English, General Awareness).',
    'Combined Tier-I',
    'sec-ssc',
    3600, // 60 minutes
    'standard',
    2.0,  // +2 marks per question in SSC CGL Tier-I
    0.50, // -0.50 negative marks
    0.0,
    0,
    0,
    1,
    1,
    1,
    1,
    'full_mock',
    'exam-ssc-cgl-2026',
    'subj-cgl-quant',
    'topic-cgl-percentages',
    'public',
    0,
    0.0,
    now,
    now
  );

  // Realistic Questions for Mock Test
  const cglQuestions = [
    {
      id: 'q-cgl-1',
      num: 1,
      subjectId: 'subj-cgl-quant',
      topicId: 'topic-cgl-percentages',
      text: 'A dealer marks an article 40% above its cost price and offers a discount of 25% on the marked price. If his net profit is Rs. 140, what was the original cost price of the article?',
      options: [
        { label: 'A', text: 'Rs. 2,400' },
        { label: 'B', text: 'Rs. 2,800' },
        { label: 'C', text: 'Rs. 3,000' },
        { label: 'D', text: 'Rs. 3,500' }
      ],
      correct: 'B',
      correct_marks: 2.0,
      negative_marks: 0.5,
      explanation: 'Let Cost Price (CP) = 100x. Marked Price (MP) = 140x. Selling Price (SP) = 140x × (1 - 0.25) = 140x × 0.75 = 105x. Net Profit = 105x - 100x = 5x. Given 5x = 140 => x = 28. Therefore, CP = 100 × 28 = Rs. 2,800.'
    },
    {
      id: 'q-cgl-2',
      num: 2,
      subjectId: 'subj-cgl-quant',
      topicId: 'topic-cgl-geometry',
      text: 'In a circle with centre O, chords AB and CD intersect perpendicularly at an interior point P. If AP = 6 cm, PB = 4 cm, and CP = 3 cm, what is the length of PD?',
      options: [
        { label: 'A', text: '7 cm' },
        { label: 'B', text: '8 cm' },
        { label: 'C', text: '9 cm' },
        { label: 'D', text: '10 cm' }
      ],
      correct: 'B',
      correct_marks: 2.0,
      negative_marks: 0.5,
      explanation: 'By the Intersecting Chords Theorem: AP × PB = CP × PD. Substituting the values: 6 × 4 = 3 × PD => 24 = 3 × PD => PD = 8 cm.'
    },
    {
      id: 'q-cgl-3',
      num: 3,
      subjectId: 'subj-cgl-reasoning',
      topicId: 'topic-cgl-analogies',
      text: 'Select the option that is related to the third term in the same way as the second term is related to the first term: ARCHITECT : BUILDING :: SCULPTOR : ?',
      options: [
        { label: 'A', text: 'Chisel' },
        { label: 'B', text: 'Statue' },
        { label: 'C', text: 'Museum' },
        { label: 'D', text: 'Canvas' }
      ],
      correct: 'B',
      correct_marks: 2.0,
      negative_marks: 0.5,
      explanation: 'An architect designs and produces a building; similarly, a sculptor carves and produces a statue.'
    },
    {
      id: 'q-cgl-4',
      num: 4,
      subjectId: 'subj-cgl-reasoning',
      topicId: 'topic-cgl-syllogisms',
      text: 'Statements: (1) All books are papers. (2) Some papers are journals. Conclusions: I. Some books are journals. II. Some papers are books.',
      options: [
        { label: 'A', text: 'Only conclusion I follows' },
        { label: 'B', text: 'Only conclusion II follows' },
        { label: 'C', text: 'Both I and II follow' },
        { label: 'D', text: 'Neither follows' }
      ],
      correct: 'B',
      correct_marks: 2.0,
      negative_marks: 0.5,
      explanation: 'Since "All books are papers", the converse "Some papers are books" is directly true (Conclusion II). Conclusion I cannot be established with certainty.'
    },
    {
      id: 'q-cgl-5',
      num: 5,
      subjectId: 'subj-cgl-english',
      topicId: 'topic-cgl-grammar-errors',
      text: 'Identify the segment in the sentence that contains a grammatical error: "Neither the principal nor the senior professors (A) / was present at the symposium (B) / when the chief guest arrived (C) / No error (D)"',
      options: [
        { label: 'A', text: 'Segment A' },
        { label: 'B', text: 'Segment B' },
        { label: 'C', text: 'Segment C' },
        { label: 'D', text: 'Segment D' }
      ],
      correct: 'B',
      correct_marks: 2.0,
      negative_marks: 0.5,
      explanation: 'Under correlative conjunctions (Neither... nor...), the finite verb agrees with the proximate subject. Since "senior professors" is plural, the verb must be "were present" instead of "was present".'
    },
    {
      id: 'q-cgl-6',
      num: 6,
      subjectId: 'subj-cgl-english',
      topicId: 'topic-cgl-vocab',
      text: 'Choose the word that means the opposite of the given word: "EPHEMERAL"',
      options: [
        { label: 'A', text: 'Transient' },
        { label: 'B', text: 'Eternal' },
        { label: 'C', text: 'Frail' },
        { label: 'D', text: 'Fleeting' }
      ],
      correct: 'B',
      correct_marks: 2.0,
      negative_marks: 0.5,
      explanation: 'Ephemeral denotes short-lived, momentary or temporary. Its exact antonym is eternal or everlasting.'
    },
    {
      id: 'q-cgl-7',
      num: 7,
      subjectId: 'subj-cgl-ga',
      topicId: 'topic-cgl-polity',
      text: 'Under Article 32 of the Constitution of India, which writ is issued by the Supreme Court to command an authority to perform a statutory duty that it has refused or failed to perform?',
      options: [
        { label: 'A', text: 'Habeas Corpus' },
        { label: 'B', text: 'Mandamus' },
        { label: 'C', text: 'Quo-Warranto' },
        { label: 'D', text: 'Certiorari' }
      ],
      correct: 'B',
      correct_marks: 2.0,
      negative_marks: 0.5,
      explanation: 'Mandamus (meaning "We Command") is issued to a public body, officer, or tribunal compelling the performance of a public or statutory duty.'
    },
    {
      id: 'q-cgl-8',
      num: 8,
      subjectId: 'subj-cgl-ga',
      topicId: 'topic-cgl-history',
      text: 'In which historic session was the resolution of "Purna Swaraj" (Complete Independence) formally adopted by the Indian National Congress?',
      options: [
        { label: 'A', text: '1920 Nagpur Session' },
        { label: 'B', text: '1929 Lahore Session' },
        { label: 'C', text: '1931 Karachi Session' },
        { label: 'D', text: '1938 Haripura Session' }
      ],
      correct: 'B',
      correct_marks: 2.0,
      negative_marks: 0.5,
      explanation: 'The Purna Swaraj resolution was passed at the 1929 Lahore session presided over by Jawaharlal Nehru on the banks of the Ravi River.'
    }
  ];

  const insertQ = db.prepare(`
    INSERT INTO questions (
      id, test_id, question_number, question_text, question_type,
      options_json, correct_answer, correct_marks, negative_marks, unanswered_marks,
      explanation, parsing_confidence, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const q of cglQuestions) {
    insertQ.run(
      q.id,
      testId,
      q.num,
      q.text,
      'single',
      JSON.stringify(q.options),
      q.correct,
      q.correct_marks,
      q.negative_marks,
      0.0,
      q.explanation,
      1.0,
      now,
      now
    );
  }

  // 10. Seed Student Mock Attempt
  const attemptId = 'attempt-student-cgl-mock1';
  db.prepare(`
    INSERT INTO test_attempts (
      id, test_id, user_id, test_title_snapshot, duration_seconds, started_at, submitted_at,
      time_taken_seconds, status, total_questions, attempted_questions,
      correct_answers, incorrect_answers, unanswered_questions,
      positive_marks, negative_marks, final_score, maximum_marks,
      percentage, accuracy, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    attemptId,
    testId,
    student.id,
    'SSC CGL 2026 Tier-I All India Diagnostic Mock 01',
    3600,
    new Date(Date.now() - 3600000 * 24).toISOString(),
    new Date(Date.now() - 3600000 * 23).toISOString(),
    3120, // 52 minutes
    'completed',
    8,
    8,
    5,
    3,
    0,
    10.0, // 5 * 2.0
    1.5,  // 3 * 0.5
    8.5,  // 8.5 on this 8-question diagnostic (Scaled to 142/200 on 100 Qs)
    16.0,
    53.12,
    62.5,
    new Date(Date.now() - 3600000 * 23).toISOString()
  );

  // 11. Seed 3 High-Fidelity Mistake Records for Student
  const insertMistake = db.prepare(`
    INSERT INTO mistake_records (
      id, user_id, test_id, question_id, exam_id, subject_id, topic_id,
      question_text, options_json, selected_answer, correct_answer, explanation,
      error_category, user_notes, is_resolved, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  `);

  insertMistake.run(
    'mistake-1',
    student.id,
    testId,
    'q-cgl-1',
    'exam-ssc-cgl-2026',
    'subj-cgl-quant',
    'topic-cgl-percentages',
    cglQuestions[0].text,
    JSON.stringify(cglQuestions[0].options),
    'A', // selected A (Rs. 2,400)
    'B', // correct B (Rs. 2,800)
    cglQuestions[0].explanation,
    'calculation_error',
    'Multiplied 140x by 0.80 instead of 0.75 for 25% discount during mental arithmetic under time pressure.',
    now
  );

  insertMistake.run(
    'mistake-2',
    student.id,
    testId,
    'q-cgl-2',
    'exam-ssc-cgl-2026',
    'subj-cgl-quant',
    'topic-cgl-geometry',
    cglQuestions[1].text,
    JSON.stringify(cglQuestions[1].options),
    'A', // selected A (7 cm)
    'B', // correct B (8 cm)
    cglQuestions[1].explanation,
    'conceptual_gap',
    'Confused internal intersecting chord theorem (AP × PB = CP × PD) with tangent-secant segment square theorem.',
    now
  );

  insertMistake.run(
    'mistake-3',
    student.id,
    testId,
    'q-cgl-5',
    'exam-ssc-cgl-2026',
    'subj-cgl-english',
    'topic-cgl-grammar-errors',
    cglQuestions[4].text,
    JSON.stringify(cglQuestions[4].options),
    'D', // selected D (No error)
    'B', // correct B (Segment B)
    cglQuestions[4].explanation,
    'time_rush',
    'Glanced over "was present" quickly and assumed subject was "the principal" without checking the plural proximity rule.',
    now
  );
}
