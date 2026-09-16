import { getDb } from './index';
import { hashPassword, getOrCreateRoleDemoUser } from '../auth';
import crypto from 'crypto';

let hasSeeded = false;

export function seedInitialData(): void {
  if (hasSeeded) return;
  hasSeeded = true;

  try {
    const db = getDb();

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
      const now = new Date().toISOString();
      insertSection.run('sec-medical', 'Medical Entrance (NEET)', 'Physics, Chemistry, and Biology mock papers designed for pre-medical aspirants.', 'Stethoscope', now);
      insertSection.run('sec-engineering', 'Engineering Entrance (JEE)', 'Advanced Mathematics, Mechanics, and Physical Sciences for engineering mock exams.', 'Cpu', now);
      insertSection.run('sec-civil', 'Civil Services & UPSC', 'General Studies, Reasoning, Quantitative Aptitude, and Indian Polity.', 'Award', now);
      insertSection.run('sec-general', 'Science & Computing', 'Foundational Computer Science, General Science, and Logical Aptitude.', 'Layers', now);
    }

    // 2b. Seed Nalanda Master Exams, Syllabus Hierarchy & Learning Paths
    const examCountStmt = db.prepare('SELECT COUNT(*) as count FROM exams');
    const examCount = (examCountStmt.get() as any)?.count || 0;

    if (examCount === 0) {
      const now = new Date().toISOString();
      const insertExam = db.prepare(`
        INSERT INTO exams (id, code, title, category, description, target_year, pattern_type, total_marks, total_duration_minutes, is_active, created_at)
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

      // Seed Subjects for NEET UG
      const insertSubject = db.prepare(`
        INSERT INTO subjects (id, exam_id, name, code, order_index, description, color_accent, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertSubject.run('subj-neet-physics', 'exam-neet-2026', 'Physics', 'PHY', 1, 'Classical Mechanics, Electromagnetism, Optics, and Modern Physics', 'blue', now);
      insertSubject.run('subj-neet-chemistry', 'exam-neet-2026', 'Chemistry', 'CHEM', 2, 'Physical, Organic, and Inorganic Chemistry Principles', 'emerald', now);
      insertSubject.run('subj-neet-biology', 'exam-neet-2026', 'Biology & Life Sciences', 'BIO', 3, 'Cellular Biology, Human Physiology, Genetics, and Plant Ecology', 'amber', now);

      // Seed Subjects for UPSC CSE
      insertSubject.run('subj-upsc-polity', 'exam-upsc-2026', 'Indian Polity & Governance', 'POL', 1, 'Constitutional framework, Fundamental Rights, Parliament, and Public Policy', 'indigo', now);
      insertSubject.run('subj-upsc-economy', 'exam-upsc-2026', 'Economic & Social Development', 'ECO', 2, 'Macroeconomics, Fiscal Policy, Banking, and Sustainable Development', 'emerald', now);

      // Seed Syllabus Nodes (Structured Topics with Prerequisites & Study Hours)
      const insertSyllabus = db.prepare(`
        INSERT INTO syllabus_nodes (id, subject_id, parent_id, level, title, code, order_index, estimated_study_hours, weightage_percentage, prerequisite_ids_json, description, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // Physics Topics
      insertSyllabus.run('topic-phy-kinematics', 'subj-neet-physics', null, 'topic', 'Kinematics & Vector Motion', 'PHY-101', 1, 14.0, 6.5, '[]', 'Scalars, vectors, 1D/2D projectile motion, and relative velocity calculus.', now);
      insertSyllabus.run('topic-phy-newton', 'subj-neet-physics', null, 'topic', 'Laws of Motion & Friction', 'PHY-102', 2, 16.0, 7.0, JSON.stringify(['topic-phy-kinematics']), 'Newtonian dynamics, free-body diagrams, circular dynamics, and static/kinetic friction.', now);
      insertSyllabus.run('topic-phy-workenergy', 'subj-neet-physics', null, 'topic', 'Work, Energy & Conservative Forces', 'PHY-103', 3, 12.0, 5.5, JSON.stringify(['topic-phy-newton']), 'Work-energy theorem, potential energy curves, spring oscillations, and elastic collisions.', now);
      insertSyllabus.run('topic-phy-thermo', 'subj-neet-physics', null, 'topic', 'Thermodynamics & Kinetic Theory', 'PHY-104', 4, 18.0, 8.0, JSON.stringify(['topic-phy-workenergy']), 'Zeroth, first and second laws, Carnot heat engines, entropy, and ideal gas state equations.', now);

      // Biology Topics
      insertSyllabus.run('topic-bio-cell', 'subj-neet-biology', null, 'topic', 'Cell: The Unit of Life & Cell Cycle', 'BIO-101', 1, 15.0, 9.0, '[]', 'Prokaryotic vs eukaryotic membranes, organelles, mitosis, meiosis, and chromosomal segregation.', now);
      insertSyllabus.run('topic-bio-genetics', 'subj-neet-biology', null, 'topic', 'Genetics & Molecular Inheritance', 'BIO-102', 2, 24.0, 12.0, JSON.stringify(['topic-bio-cell']), 'Mendelian inheritance patterns, DNA replication, transcription, genetic code, and translation.', now);
      insertSyllabus.run('topic-bio-physio', 'subj-neet-biology', null, 'topic', 'Human Organ Systems & Physiology', 'BIO-103', 3, 28.0, 14.0, JSON.stringify(['topic-bio-cell']), 'Circulatory dynamics, neuro-endocrine signaling, renal regulation, and gaseous exchange.', now);

      // Topic Resources
      const insertResource = db.prepare(`
        INSERT INTO topic_resources (id, topic_id, title, resource_type, content_summary, external_url, estimated_read_minutes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertResource.run('res-kin-1', 'topic-phy-kinematics', 'Kinematics Core Formula Handbook', 'formula_digest', 'Summary of all 1D/2D displacement, acceleration calculus, and trajectory peak equations.', null, 12, now);
      insertResource.run('res-kin-2', 'topic-phy-kinematics', 'Relative Motion & River-Boat Problems Guide', 'notes', 'Comprehensive mental models for perpendicular drift, upstream-downstream velocity vectors.', null, 20, now);
      insertResource.run('res-cell-1', 'topic-bio-cell', 'Cell Organelles High-Yield Digest', 'cheat_sheet', 'Comparative breakdown of mitochondrial ATP synthesis, ER protein sorting, and Golgi vesicles.', null, 15, now);
      insertResource.run('res-gen-1', 'topic-bio-genetics', 'Molecular Genetics & Pedigree Analysis Blueprint', 'notes', 'Step-by-step logic for solving autosomal vs sex-linked inheritance traits and Lac Operon regulation.', null, 25, now);

      // Seed Student Primary Enrollment
      const insertEnrollment = db.prepare(`
        INSERT INTO user_exam_enrollments (id, user_id, exam_id, target_year, target_score, is_primary, enrolled_at)
        VALUES (?, ?, ?, ?, ?, 1, ?)
      `);
      insertEnrollment.run('enr-student-neet', student.id, 'exam-neet-2026', 2026, 680.0, now);

      // Seed Student Topic Progress
      const insertProgress = db.prepare(`
        INSERT INTO user_topic_progress (id, user_id, topic_id, status, mastery_percentage, questions_practiced, questions_correct, tests_attempted, last_studied_at, notes_taken, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertProgress.run('prog-1', student.id, 'topic-phy-kinematics', 'mastered', 88.5, 45, 40, 3, new Date(Date.now() - 86400000).toISOString(), 'Vectors and trajectory peaks well understood.', now);
      insertProgress.run('prog-2', student.id, 'topic-bio-cell', 'mastered', 92.0, 50, 46, 4, new Date(Date.now() - 172800000).toISOString(), 'Organelle division stages memorized thoroughly.', now);
      insertProgress.run('prog-3', student.id, 'topic-phy-newton', 'in_progress', 62.0, 30, 19, 2, new Date(Date.now() - 259200000).toISOString(), 'Need to practice inclined plane friction problems.', now);
      insertProgress.run('prog-4', student.id, 'topic-bio-genetics', 'revision_due', 48.0, 25, 12, 1, new Date(Date.now() - 604800000).toISOString(), 'Review dihybrid cross calculations and pedigree trees.', now);

      // Seed Educator Profile for Institute Admin
      const insertEducator = db.prepare(`
        INSERT OR REPLACE INTO educator_profiles (user_id, headline, bio, institute_name, verification_status, specialization_subjects_json, total_students, average_rating, published_tests_count, created_at)
        VALUES (?, ?, ?, ?, 'verified', ?, ?, ?, ?, ?)
      `);
      insertEducator.run(
        instituteAdmin.id,
        'Senior Academic Chair & Physics Faculty',
        'Over 16 years coaching pre-medical and engineering aspirants with deep emphasis on conceptual mechanics, cognitive diagnostic testing, and exam temperament.',
        'Apex Pre-Medical & Civil Academy',
        JSON.stringify(['Physics', 'Physical Sciences', 'Exam Strategy']),
        1240,
        4.94,
        8,
        now
      );
    }

    // 3. Check if tests already exist for the institute admin or demo user
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM tests WHERE user_id = ?');
    const result = countStmt.get(instituteAdmin.id) as { count: number };

    if (result && result.count > 0) {
      return; // Already seeded
    }

  const now = new Date().toISOString();
  const test1Id = crypto.randomUUID();

  // Insert Official Test 1 created by Institute Admin
  const insertTest = db.prepare(`
    INSERT INTO tests (
      id, user_id, title, description, subject, section_id, duration_seconds,
      marking_scheme_type, default_correct_marks, default_negative_marks, default_unanswered_marks,
      shuffle_questions, shuffle_options, allow_navigation, show_palette, allow_review_marking, show_immediate_results,
      test_type, exam_id, subject_id, topic_id, visibility, is_paid, price_inr,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertTest.run(
    test1Id,
    instituteAdmin.id,
    'National Science & Medical Mock Test 2026',
    'Official Academy Mock Test covering Mechanics, Optics, Cell Biology, and Thermodynamics.',
    'Physics & Life Sciences',
    'sec-medical',
    3600, // 60 minutes
    'standard',
    4.0,
    1.0,
    0.0,
    0, // shuffle_questions
    0, // shuffle_options
    1, // allow_navigation
    1, // show_palette
    1, // allow_review_marking
    1, // show_immediate_results
    'full_mock',
    'exam-neet-2026',
    'subj-neet-physics',
    'topic-phy-kinematics',
    'public',
    0,
    0.0,
    now,
    now
  );

  const sampleQuestions = [
    {
      num: 1,
      text: 'A ball is thrown vertically upward with a speed of 20 m/s from the ground. Taking g = 10 m/s², what is the maximum height reached by the ball?',
      options: [
        { label: 'A', text: '15 m' },
        { label: 'B', text: '20 m' },
        { label: 'C', text: '25 m' },
        { label: 'D', text: '30 m' }
      ],
      correct: 'B',
      correct_marks: 4,
      negative_marks: 1,
      explanation: 'Using equation v² = u² - 2gh at peak v=0: 0 = 20² - 2(10)h => 20h = 400 => h = 20 meters.'
    },
    {
      num: 2,
      text: 'Which organelle is universally known as the powerhouse of the eukaryotic cell because it produces ATP?',
      options: [
        { label: 'A', text: 'Endoplasmic Reticulum' },
        { label: 'B', text: 'Golgi Apparatus' },
        { label: 'C', text: 'Mitochondria' },
        { label: 'D', text: 'Ribosome' }
      ],
      correct: 'C',
      correct_marks: 4,
      negative_marks: 1,
      explanation: 'Mitochondria generate most of the chemical energy needed to power the cell’s biochemical reactions in the form of ATP.'
    },
    {
      num: 3,
      text: 'According to Snell\'s Law of refraction, the ratio of the sine of the angle of incidence to the sine of the angle of refraction is equal to:',
      options: [
        { label: 'A', text: 'The ratio of refractive indices (n2 / n1)' },
        { label: 'B', text: 'The sum of refractive indices (n1 + n2)' },
        { label: 'C', text: 'Constant zero' },
        { label: 'D', text: 'The product of refractive indices (n1 × n2)' }
      ],
      correct: 'A',
      correct_marks: 4,
      negative_marks: 1,
      explanation: 'Snell’s Law states n1 sin(θ1) = n2 sin(θ2), hence sin(θ1) / sin(θ2) = n2 / n1.'
    },
    {
      num: 4,
      text: 'What is the SI unit of electric capacitance?',
      options: [
        { label: 'A', text: 'Henry' },
        { label: 'B', text: 'Weber' },
        { label: 'C', text: 'Farad' },
        { label: 'D', text: 'Tesla' }
      ],
      correct: 'C',
      correct_marks: 4,
      negative_marks: 1,
      explanation: 'The SI unit of electrical capacitance is the Farad (F), named after Michael Faraday.'
    },
    {
      num: 5,
      text: 'In mendelian genetics, crossing two heterozygous individuals (Aa × Aa) results in what expected phenotypic ratio for complete dominance?',
      options: [
        { label: 'A', text: '1:2:1' },
        { label: 'B', text: '3:1' },
        { label: 'C', text: '9:3:3:1' },
        { label: 'D', text: '1:1' }
      ],
      correct: 'B',
      correct_marks: 4,
      negative_marks: 1,
      explanation: 'The genotypic ratio is 1 AA : 2 Aa : 1 aa, giving a phenotypic ratio of 3 dominant to 1 recessive (3:1).'
    },
    {
      num: 6,
      text: 'In thermodynamics, an isothermal process is one where which variable remains constant throughout?',
      options: [
        { label: 'A', text: 'Pressure' },
        { label: 'B', text: 'Volume' },
        { label: 'C', text: 'Temperature' },
        { label: 'D', text: 'Entropy' }
      ],
      correct: 'C',
      correct_marks: 4,
      negative_marks: 1,
      explanation: 'Iso = same, thermal = heat/temperature. An isothermal process occurs at constant temperature (ΔT = 0).'
    },
    {
      num: 7,
      text: 'Which blood group is recognized as the universal donor for red blood cell transfusions?',
      options: [
        { label: 'A', text: 'AB positive' },
        { label: 'B', text: 'A negative' },
        { label: 'C', text: 'O negative' },
        { label: 'D', text: 'B positive' }
      ],
      correct: 'C',
      correct_marks: 4,
      negative_marks: 1,
      explanation: 'O negative red blood cells lack A, B, and Rh antigens, meaning they can be transfused to patients of any blood group in emergencies.'
    },
    {
      num: 8,
      text: 'What is the acceleration due to gravity at the center of the Earth (assuming a spherical planet of uniform density)?',
      options: [
        { label: 'A', text: '9.8 m/s²' },
        { label: 'B', text: 'Infinite' },
        { label: 'C', text: '0 m/s²' },
        { label: 'D', text: '4.9 m/s²' }
      ],
      correct: 'C',
      correct_marks: 4,
      negative_marks: 1,
      explanation: 'By shell theorem, gravitational forces from the surrounding mass cancel out symmetrically at the center of the Earth, resulting in g = 0.'
    }
  ];

  const insertQ = db.prepare(`
    INSERT INTO questions (
      id, test_id, question_number, question_text, question_type,
      options_json, correct_answer, correct_marks, negative_marks, unanswered_marks,
      explanation, parsing_confidence, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const q of sampleQuestions) {
    insertQ.run(
      crypto.randomUUID(),
      test1Id,
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

  // Seed historical attempt for student
  const attemptId = crypto.randomUUID();
  const insertAttempt = db.prepare(`
    INSERT INTO test_attempts (
      id, test_id, user_id, test_title_snapshot, duration_seconds, started_at, submitted_at,
      time_taken_seconds, status, total_questions, attempted_questions,
      correct_answers, incorrect_answers, unanswered_questions,
      positive_marks, negative_marks, final_score, maximum_marks,
      percentage, accuracy, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAttempt.run(
    attemptId,
    test1Id,
    student.id,
    'National Science & Medical Mock Test 2026',
    3600,
    new Date(Date.now() - 3600000).toISOString(),
    new Date(Date.now() - 2400000).toISOString(),
    1200,
    'completed',
    8,
    7,
    6,
    1,
    1,
    24.0, // 6 * 4
    1.0,  // 1 * 1
    23.0, // 24 - 1
    32.0, // 8 * 4
    71.88,
    85.71,
    new Date(Date.now() - 2400000).toISOString()
  );
  } catch (err) {
    console.warn('[Seed initial data error]:', err);
  }
}
