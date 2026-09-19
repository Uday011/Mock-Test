import { getDb } from './index';
import { hashPassword, getOrCreateRoleDemoUser } from '../auth';
import { seedLearningSystem } from './seedLearning';
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

    // 2. Seed Default Sections/Categories (Exclusively MBA & Management)
    const insertSection = db.prepare(
      'INSERT OR IGNORE INTO sections (id, name, description, icon, is_active, created_at) VALUES (?, ?, ?, ?, 1, ?)'
    );
    insertSection.run('sec-mba', 'Management & MBA Entrance', 'CAT, XAT, NMAT, SNAP, and Executive MBA aptitude frameworks.', 'Award', now);

    // Purge any legacy non-MBA sections
    db.prepare("DELETE FROM sections WHERE id != 'sec-mba'").run();

    // 3. Seed MBA Exams (CAT, XAT, NMAT, SNAP) as active catalog
    const insertExam = db.prepare(`
      INSERT OR IGNORE INTO exams (id, code, title, category, description, target_year, pattern_type, total_marks, total_duration_minutes, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);

    insertExam.run(
      'exam-cat-2026',
      'CAT_2026',
      'CAT 2026 (Common Admission Test)',
      'management',
      'IIM Common Admission Test for flagship PGP/MBA programs across IIM Ahmedabad, Bangalore, Calcutta, and premier B-schools.',
      2026,
      'stage_based',
      198,
      120,
      now
    );

    insertExam.run(
      'exam-xat-2026',
      'XAT_2026',
      'XAT 2026 (Xavier Aptitude Test)',
      'management',
      'XLRI Jamshedpur National Aptitude Test for business management and human resource management programs.',
      2026,
      'multi_subject',
      100,
      210,
      now
    );

    insertExam.run(
      'exam-nmat-2026',
      'NMAT_2026',
      'NMAT 2026 by GMAC',
      'management',
      'Graduate Management Admission Council computer-adaptive entrance test for NMIMS Mumbai and top management institutes.',
      2026,
      'multi_subject',
      360,
      120,
      now
    );

    insertExam.run(
      'exam-snap-2026',
      'SNAP_2026',
      'SNAP 2026 (Symbiosis National Aptitude Test)',
      'management',
      'Symbiosis International University Entrance for SIBM Pune, SCMHRD, and Symbiosis management institutes.',
      2026,
      'multi_subject',
      60,
      60,
      now
    );

    // Permanently remove any legacy non-MBA exams and ensure MBA exams are active
    db.prepare(`
      DELETE FROM exams WHERE id NOT IN ('exam-cat-2026', 'exam-xat-2026', 'exam-nmat-2026', 'exam-snap-2026')
    `).run();
    db.prepare(`
      UPDATE exams SET is_active = 1 WHERE id IN ('exam-cat-2026', 'exam-xat-2026', 'exam-nmat-2026', 'exam-snap-2026')
    `).run();

    // 4. Seed Primary Flagship Exam: CAT 2026
    seedCatExam(db, student, instituteAdmin, now);

    // Update Conducting Body, Difficulty Level, and Pattern Summary for all MBA exams
    const updateExamMetadata = db.prepare(`
      UPDATE exams SET conducting_body = ?, difficulty_level = ?, pattern_summary = ? WHERE id = ?
    `);
    updateExamMetadata.run('Indian Institutes of Management (IIMs)', 'National Premier Management Entrance', '3 Sections (66 Qs / 198 Marks) · 40-Min Sectional Timer (+3 / -1 MCQ, 0 TITA)', 'exam-cat-2026');
    updateExamMetadata.run('XLRI Jamshedpur', 'Premier Management Entrance', 'Part 1 (VALR, DM, QA-DI) + Part 2 (Mock Keyboard & GK) · Decision Making Core', 'exam-xat-2026');
    updateExamMetadata.run('Graduate Management Admission Council (GMAC)', 'Speed-Adaptive Management Entrance', '108 Questions · 120 Minutes · No Negative Marking · Sectional Time Limits', 'exam-nmat-2026');
    updateExamMetadata.run('Symbiosis International (Deemed University)', 'Speed-Accuracy Management Entrance', '60 Questions · 60 Minutes · General English, Quant & DILR (+1 / -0.25 Marks)', 'exam-snap-2026');

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
        'exam-cat-2026',
        'intermediate',
        '2026_cat',
        4.0,
        JSON.stringify(['Verbal Ability & Reading Comprehension', 'Data Interpretation & Logical Reasoning']),
        JSON.stringify(['Quantitative Aptitude (Modern Math & Geometry)', 'DILR (Games & Tournaments)']),
        'completed',
        now,
        now
      );
    } else {
      db.prepare(`
        UPDATE user_onboarding_profiles 
        SET preferred_exam_id = 'exam-cat-2026', target_timeline = '2026_cat'
        WHERE user_id = ?
      `).run(student.id);
    }

    // 5. Seed Educator Profile for Institute Admin if not present
    const educatorCheck = db.prepare('SELECT user_id FROM educator_profiles WHERE user_id = ?').get(instituteAdmin.id);
    if (!educatorCheck) {
      db.prepare(`
        INSERT INTO educator_profiles (user_id, headline, bio, institute_name, verification_status, specialization_subjects_json, total_students, average_rating, published_tests_count, created_at)
        VALUES (?, ?, ?, ?, 'verified', ?, ?, ?, ?, ?)
      `).run(
        instituteAdmin.id,
        'Director of Pedagogy & 99.9%ile CAT Quant/DILR Mentor',
        'Over 16 years coaching IIM aspirants with deep focus on caselet decomposition, mental speed arithmetic, and reading comprehension inference engines.',
        'Nalanda School of Management Prep',
        JSON.stringify(['Quantitative Aptitude', 'Data Interpretation & Logical Reasoning', 'Verbal Ability']),
        1480,
        4.95,
        12,
        now
      );
    }

    // 6. Seed Learning System (Subtopics, authentic topic content, spaced repetition, topic tests)
    seedLearningSystem(db, student, instituteAdmin, now);

    // 7. Seed Reusable Question Bank Repository
    seedQuestionBank(db, instituteAdmin, now);

    // 8. Seed Public Test Series & Trust Labels
    seedTestSeriesAndTrustLabels(db, instituteAdmin, now);

  } catch (err) {
    console.warn('[Seed initial data error]:', err);
  }
}

function seedCatExam(db: any, student: any, instituteAdmin: any, now: string): void {
  // Check if CAT 2026 stages already seeded
  const existingStage = db.prepare("SELECT id FROM exam_stages WHERE id = 'stage-cat-cbt'").get();
  if (existingStage) {
    return; // Already populated
  }

  // 1. Ensure Exam Master exists
  db.prepare(`
    INSERT OR REPLACE INTO exams (id, code, title, category, description, target_year, pattern_type, total_marks, total_duration_minutes, is_active, conducting_body, difficulty_level, pattern_summary, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
  `).run(
    'exam-cat-2026',
    'CAT_2026',
    'CAT 2026 (Common Admission Test)',
    'management',
    'IIM Common Admission Test for flagship PGP/MBA programs across IIM Ahmedabad, Bangalore, Calcutta, and premier B-schools.',
    2026,
    'stage_based',
    198.0,
    120,
    'Indian Institutes of Management (IIMs)',
    'National Premier Management Entrance',
    '3 Sections (66 Qs / 198 Marks) · 40-Min Sectional Timer (+3 / -1 MCQ, 0 TITA)',
    now
  );

  // 2. Insert Stages
  const insertStage = db.prepare(`
    INSERT OR REPLACE INTO exam_stages (id, exam_id, name, stage_number, total_marks, total_questions, duration_minutes, is_computer_based, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertStage.run(
    'stage-cat-cbt',
    'exam-cat-2026',
    'CAT Computer-Based Test (CBT)',
    1,
    198.0,
    66,
    120,
    1,
    '3 timed sections (40 mins each): VARC (24 Qs), DILR (20 Qs), QA (22 Qs). Calculator allowed on screen. +3 for correct, -1 for incorrect MCQ, 0 for TITA.',
    now
  );

  insertStage.run(
    'stage-cat-watpi',
    'exam-cat-2026',
    'Written Ability Test & Personal Interview (WAT-PI)',
    2,
    100.0,
    1,
    45,
    0,
    'IIM Second Stage: Analytical writing assessment on socio-economic caselets and rigorous panel interview.',
    now
  );

  // 3. Insert Subjects (VARC, DILR, QA)
  const insertSubject = db.prepare(`
    INSERT OR REPLACE INTO subjects (id, exam_id, name, code, order_index, description, color_accent, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertSubject.run(
    'subj-cat-varc',
    'exam-cat-2026',
    'Verbal Ability & Reading Comprehension (VARC)',
    'VARC',
    1,
    'Philosophical & analytical RC passages, Para Jumbles, Para Summary, and Sentence Exclusion.',
    'emerald',
    now
  );

  insertSubject.run(
    'subj-cat-dilr',
    'exam-cat-2026',
    'Data Interpretation & Logical Reasoning (DILR)',
    'DILR',
    2,
    'Matrix & grouping arrangements, Games & Tournaments, Set Theory Venn diagrams, Charts & Tables.',
    'indigo',
    now
  );

  insertSubject.run(
    'subj-cat-qa',
    'exam-cat-2026',
    'Quantitative Aptitude (QA)',
    'QA',
    3,
    'Arithmetic, Advanced Algebra, Geometry & Mensuration, Modern Math & Number Systems.',
    'amber',
    now
  );

  // 4. Insert Syllabus Nodes (12 CAT Topics)
  const insertSyllabus = db.prepare(`
    INSERT OR REPLACE INTO syllabus_nodes (id, subject_id, parent_id, level, title, code, order_index, estimated_study_hours, weightage_percentage, prerequisite_ids_json, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Quantitative Aptitude Topics
  insertSyllabus.run(
    'topic-cat-arithmetic',
    'subj-cat-qa',
    null,
    'topic',
    'Arithmetic & Commercial Mathematics',
    'QA-101',
    1,
    28.0,
    12.0,
    '[]',
    'Percentages, Profit & Loss, Simple & Compound Interest, Ratio & Proportion, Time & Work, Time Speed Distance.',
    now
  );

  insertSyllabus.run(
    'topic-cat-algebra',
    'subj-cat-qa',
    null,
    'topic',
    'Advanced Algebra & Functions',
    'QA-102',
    2,
    30.0,
    11.0,
    JSON.stringify(['topic-cat-arithmetic']),
    'Quadratic & Higher Order Equations, Inequalities, Modulus, Logarithms, Functions & Graphs, Sequences & Series.',
    now
  );

  insertSyllabus.run(
    'topic-cat-geometry',
    'subj-cat-qa',
    null,
    'topic',
    'Geometry, Coordinate Geometry & Mensuration',
    'QA-103',
    3,
    24.0,
    9.0,
    JSON.stringify(['topic-cat-algebra']),
    'Triangles (Similarity & Congruence), Circles (Chords & Tangents), Polygons, Coordinate Geometry, and 3D Mensuration Solids.',
    now
  );

  insertSyllabus.run(
    'topic-cat-numbers',
    'subj-cat-qa',
    null,
    'topic',
    'Number Systems & Properties of Integers',
    'QA-104',
    4,
    16.0,
    6.0,
    '[]',
    'Divisibility rules, Prime Factorization, Highest Power of a Prime, Euler Totient & Remainder Theorems, Base Systems.',
    now
  );

  insertSyllabus.run(
    'topic-cat-modern-math',
    'subj-cat-qa',
    null,
    'topic',
    'Modern Math (Permutations, Combinations & Probability)',
    'QA-105',
    5,
    18.0,
    7.0,
    '[]',
    'Fundamental Counting Principle, Circular Permutations, Partitioning & Grouping, Classical Probability, Set Theory.',
    now
  );

  // Data Interpretation & Logical Reasoning Topics
  insertSyllabus.run(
    'topic-cat-arrangements',
    'subj-cat-dilr',
    null,
    'topic',
    'Linear & Circular Arrangements and Matrix Puzzles',
    'DILR-101',
    1,
    24.0,
    12.0,
    '[]',
    'Single & Multi-row linear arrangements, Circular seating facing inward/outward, Attribute-matching matrix grids.',
    now
  );

  insertSyllabus.run(
    'topic-cat-charts',
    'subj-cat-dilr',
    null,
    'topic',
    'Data Interpretation: Tables, Bar Graphs & Caselets',
    'DILR-102',
    2,
    26.0,
    12.0,
    '[]',
    'Complex tabular data, Cumulative line charts, 100% stacked bar graphs, Spider charts, Missing data caselets.',
    now
  );

  insertSyllabus.run(
    'topic-cat-games',
    'subj-cat-dilr',
    null,
    'topic',
    'Games & Tournaments, Knockout Brackets & Scoring Matrices',
    'DILR-103',
    3,
    20.0,
    10.0,
    '[]',
    'Round-robin league stages, Knockout tournament seeds & upsets, Points tables with tie-breakers, Tennis/chess match deduction.',
    now
  );

  insertSyllabus.run(
    'topic-cat-sets',
    'subj-cat-dilr',
    null,
    'topic',
    'Set Theory & 3-4 Set Overlapping Venn Diagrams',
    'DILR-104',
    4,
    16.0,
    8.0,
    '[]',
    'Max-min optimization in Venn sets, 3-circle overlap regions, 4-set rectangle Venn diagrams, Survey categorical analysis.',
    now
  );

  // Verbal Ability & Reading Comprehension Topics
  insertSyllabus.run(
    'topic-cat-rc',
    'subj-cat-varc',
    null,
    'topic',
    'Reading Comprehension (Philosophy, Economics, Science & Art Passages)',
    'VARC-101',
    1,
    35.0,
    22.0,
    '[]',
    'Deep inference extraction, Author tone & perspective, Central theme identification, Strengthen/weaken argument analysis.',
    now
  );

  insertSyllabus.run(
    'topic-cat-parajumbles',
    'subj-cat-varc',
    null,
    'topic',
    'Para Jumbles & Sentence Sequence Reconstruction (MCQ & TITA)',
    'VARC-102',
    2,
    15.0,
    7.0,
    '[]',
    'Mandatory pair identification, Pronoun & transition word linkage, Chronological & logical flow reconstruction without options.',
    now
  );

  insertSyllabus.run(
    'topic-cat-parasummary',
    'subj-cat-varc',
    null,
    'topic',
    'Para Summary, Inferences & Odd Sentence Out',
    'VARC-103',
    3,
    15.0,
    7.0,
    '[]',
    'Distilling paragraph core thesis, Eliminating distortion & out-of-scope traps, Spotting contextually disjointed sentences.',
    now
  );

  // 5. Topic Resources
  const insertResource = db.prepare(`
    INSERT OR REPLACE INTO topic_resources (id, topic_id, title, resource_type, content_summary, external_url, estimated_read_minutes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertResource.run(
    'res-cat-arith-1',
    'topic-cat-arithmetic',
    'CAT Arithmetic Multipliers & Percentage-Fraction Digest',
    'cheat_sheet',
    'Instant mental multipliers (1/1 through 1/25), profit margin ratios, and compound interest rule of 72.',
    null,
    15,
    now
  );

  insertResource.run(
    'res-cat-alg-1',
    'topic-cat-algebra',
    'CAT Advanced Algebra, Logarithms & Quadratic Roots Handbook',
    'formula_digest',
    'Descartes rule of signs, AM-GM inequalities, logarithmic base change theorems, and maxima-minima quadratics.',
    null,
    20,
    now
  );

  insertResource.run(
    'res-cat-rc-1',
    'topic-cat-rc',
    'Reading Comprehension: Inference Trap Forensics & Elimination Matrix',
    'notes',
    'Taxonomy of CAT RC trap options: Scope Shift, Extreme Words, True but Irrelevant, Opposite Tone.',
    null,
    25,
    now
  );

  insertResource.run(
    'res-cat-dilr-1',
    'topic-cat-arrangements',
    'DILR Matrix Decomposition & Elimination Frameworks',
    'notes',
    'Systematic grid methods for 4-variable attribute matching without recursive backtracking.',
    null,
    22,
    now
  );

  // 5b. Curated Learner Resources (Free Library & Saved)
  const insertLearnerResource = db.prepare(`
    INSERT OR REPLACE INTO learner_resources (
      id, user_id, title, type, subject_id, subject_name, topic_id, topic_name, source, url, notes, is_saved, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertLearnerResource.run(
    'lres-cat-arith-yt',
    null,
    'CAT Arithmetic Masterclass: Ratio, Mixtures & Time-Speed-Distance',
    'youtube',
    'subj-cat-qa',
    'Quantitative Aptitude (QA)',
    'topic-cat-arithmetic',
    'Arithmetic & Commercial Mathematics',
    'YouTube • Takshzila / Rodha',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'Comprehensive walkthrough of relative speed, circular tracks, and multi-container mixture replacements.',
    1,
    now
  );

  insertLearnerResource.run(
    'lres-cat-arith-pdf',
    student.id,
    'CAT Quantitative Aptitude 500 Formula Compendium (2026 Edition)',
    'pdf',
    'subj-cat-qa',
    'Quantitative Aptitude (QA)',
    'topic-cat-arithmetic',
    'Arithmetic & Commercial Mathematics',
    'Nalanda Academic Press',
    'https://nalanda.edu/resources/cat-quant-formula-compendium.pdf',
    'Saved formula handbook containing arithmetic shortcuts, geometric proofs, and logarithm identity sheets.',
    1,
    now
  );

  insertLearnerResource.run(
    'lres-cat-rc-guide',
    student.id,
    'Cracking 99th Percentile RC: Elimination Strategy & Tone Forensics',
    'article',
    'subj-cat-varc',
    'Verbal Ability & Reading Comprehension (VARC)',
    'topic-cat-rc',
    'Reading Comprehension',
    'Nalanda Verbal Review',
    'https://nalanda.edu/guides/cat-rc-elimination-strategy',
    'Framework for distinguishing subtle author tone nuances (laudatory vs guarded optimism vs skeptical disdain).',
    1,
    now
  );

  insertLearnerResource.run(
    'lres-cat-dilr-yt',
    null,
    'DILR Caselet Decomposition & Games Tournaments Masterclass',
    'youtube',
    'subj-cat-dilr',
    'Data Interpretation & Logical Reasoning (DILR)',
    'topic-cat-games',
    'Games & Tournaments',
    'YouTube • Anastasis Shankar',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'Round-robin scoring matrices, knockout tournament upsets, and minimum/maximum win scenarios.',
    1,
    now
  );

  insertLearnerResource.run(
    'lres-cat-dilr-pdf',
    null,
    '100 Iconic DILR Sets from CAT Past 10 Years (Forensic Solutions)',
    'pdf',
    'subj-cat-dilr',
    'Data Interpretation & Logical Reasoning (DILR)',
    'topic-cat-arrangements',
    'Linear & Circular Arrangements',
    'IIM Alumni Research Collective',
    'https://nalanda.edu/resources/100-iconic-dilr-sets.pdf',
    'Step-by-step table drafting for high-complexity matrix caselets with zero guessing.',
    1,
    now
  );

  insertLearnerResource.run(
    'lres-cat-alg-notes',
    student.id,
    'Algebra, Inequalities & Logarithmic Boundary Cases Summary',
    'notes',
    'subj-cat-qa',
    'Quantitative Aptitude (QA)',
    'topic-cat-algebra',
    'Advanced Algebra & Functions',
    'Personal Study Note',
    null,
    'Notes on modulus inequalities, domain restrictions in log equations, and cyclic polynomial factorization.',
    1,
    now
  );

  insertLearnerResource.run(
    'lres-cat-rc-aeon',
    null,
    'Aeon & Guardian Long-Form Critical Reading Syllabus for CAT',
    'article',
    'subj-cat-varc',
    'Verbal Ability & Reading Comprehension (VARC)',
    'topic-cat-rc',
    'Reading Comprehension',
    'Nalanda Reading Hub',
    'https://nalanda.edu/guides/aeon-critical-reading-syllabus',
    'Curated 60-article list spanning evolutionary biology, cognitive science, philosophy of mind, and modern geopolitics.',
    1,
    now
  );

  // 6. Learning Path & Units
  db.prepare(`
    INSERT OR REPLACE INTO learning_paths (id, exam_id, title, description, target_days, recommended_hours_per_week, total_units, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'path-cat-90d',
    'exam-cat-2026',
    'CAT 2026 90-Day Percentile Booster Blueprint',
    'Rigorous curriculum balancing high-weightage QA arithmetic, DILR matrix caselets, philosophical RC inference drills, and full 120-min computer-based mocks.',
    90,
    20.0,
    8,
    now
  );

  const insertUnit = db.prepare(`
    INSERT OR REPLACE INTO learning_units (id, path_id, topic_id, order_index, is_core, estimated_minutes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertUnit.run('unit-cat-1', 'path-cat-90d', 'topic-cat-arithmetic', 1, 1, 120);
  insertUnit.run('unit-cat-2', 'path-cat-90d', 'topic-cat-rc', 2, 1, 120);
  insertUnit.run('unit-cat-3', 'path-cat-90d', 'topic-cat-arrangements', 3, 1, 90);
  insertUnit.run('unit-cat-4', 'path-cat-90d', 'topic-cat-algebra', 4, 1, 120);
  insertUnit.run('unit-cat-5', 'path-cat-90d', 'topic-cat-charts', 5, 1, 90);
  insertUnit.run('unit-cat-6', 'path-cat-90d', 'topic-cat-parajumbles', 6, 1, 60);
  insertUnit.run('unit-cat-7', 'path-cat-90d', 'topic-cat-games', 7, 1, 90);
  insertUnit.run('unit-cat-8', 'path-cat-90d', 'topic-cat-geometry', 8, 1, 120);

  // 7. Student Primary Enrollment: Set CAT 2026 as Primary
  db.prepare('UPDATE user_exam_enrollments SET is_primary = 0 WHERE user_id = ?').run(student.id);

  db.prepare(`
    INSERT OR REPLACE INTO user_exam_enrollments (id, user_id, exam_id, target_year, target_score, is_primary, enrolled_at)
    VALUES (?, ?, ?, ?, ?, 1, ?)
  `).run(
    'enr-student-cat-2026',
    student.id,
    'exam-cat-2026',
    2026,
    105.0, // 99th percentile target score on 198
    now
  );

  // 8. Student Topic Progress: Realistic Diagnostic Profile (CAT 99th percentile aspirant)
  const insertProgress = db.prepare(`
    INSERT OR REPLACE INTO user_topic_progress (
      id, user_id, topic_id, status, mastery_percentage, questions_practiced, questions_correct,
      tests_attempted, next_revision_date, repetition_interval_days, repetition_count, last_studied_at, notes_taken, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProgress.run('prog-cat-1', student.id, 'topic-cat-arithmetic', 'proficient', 88.0, 70, 62, 4, new Date(Date.now() + 86400000 * 5).toISOString(), 7, 3, new Date(Date.now() - 86400000).toISOString(), 'High confidence in percentage multipliers and time-speed-distance.', now);
  insertProgress.run('prog-cat-2', student.id, 'topic-cat-rc', 'developing', 76.0, 50, 38, 3, new Date(Date.now() + 86400000 * 2).toISOString(), 3, 2, new Date(Date.now() - 172800000).toISOString(), 'Work on eliminating subtle scope shift traps in philosophy passages.', now);
  insertProgress.run('prog-cat-3', student.id, 'topic-cat-arrangements', 'proficient', 90.0, 40, 36, 3, new Date(Date.now() + 86400000 * 4).toISOString(), 7, 3, new Date(Date.now() - 259200000).toISOString(), 'Excellent speed on 2D table grid deductions.', now);
  insertProgress.run('prog-cat-4', student.id, 'topic-cat-algebra', 'developing', 68.0, 45, 31, 2, new Date(Date.now() + 86400000 * 1).toISOString(), 3, 2, new Date(Date.now() - 345600000).toISOString(), 'Logarithmic inequalities require strict domain verification.', now);
  insertProgress.run('prog-cat-5', student.id, 'topic-cat-charts', 'developing', 72.0, 35, 25, 2, new Date(Date.now() + 86400000 * 3).toISOString(), 3, 2, new Date(Date.now() - 432000000).toISOString(), 'Practice cumulative percentage growth charts.', now);
  insertProgress.run('prog-cat-6', student.id, 'topic-cat-games', 'needs_revision', 45.0, 30, 14, 2, new Date(Date.now() - 86400000 * 1).toISOString(), 1, 1, new Date(Date.now() - 518400000).toISOString(), 'Knockout tournament seed upset deductions need review.', now);
  insertProgress.run('prog-cat-7', student.id, 'topic-cat-parajumbles', 'practiced', 80.0, 35, 28, 2, new Date(Date.now() + 86400000 * 3).toISOString(), 3, 2, new Date(Date.now() - 604800000).toISOString(), 'Look for pronoun-antecedent mandatory pairs.', now);
  insertProgress.run('prog-cat-8', student.id, 'topic-cat-geometry', 'needs_revision', 52.0, 40, 21, 2, new Date(Date.now() - 86400000 * 2).toISOString(), 1, 1, new Date(Date.now() - 691200000).toISOString(), 'Circles and tangent segment properties need revision.', now);

  // 9. Seed Official CAT Diagnostic Mock Test 01
  const testId = 'test-cat-mock-01';
  db.prepare(`
    INSERT OR REPLACE INTO tests (
      id, user_id, title, description, subject, section_id, duration_seconds,
      marking_scheme_type, default_correct_marks, default_negative_marks, default_unanswered_marks,
      shuffle_questions, shuffle_options, allow_navigation, show_palette, allow_review_marking, show_immediate_results,
      test_type, exam_id, subject_id, topic_id, visibility, is_paid, price_inr,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    testId,
    instituteAdmin.id,
    'CAT 2026 All India National Diagnostic Mock 01',
    'Official high-fidelity 120-minute IIM diagnostic mock conforming strictly to latest CAT pattern (VARC, DILR, QA). +3 correct, -1 negative for MCQs, 0 for TITA.',
    'Management Entrance (CAT)',
    'sec-mba',
    7200, // 120 minutes (2 hours)
    'standard',
    3.0,  // +3 marks per question in CAT
    1.0,  // -1.0 negative marks for MCQs
    0.0,
    0,
    0,
    1,
    1,
    1,
    1,
    'full_mock',
    'exam-cat-2026',
    'subj-cat-qa',
    'topic-cat-arithmetic',
    'public',
    0,
    0.0,
    now,
    now
  );

  // Realistic CAT Questions for Mock Test
  const catQuestions = [
    {
      id: 'q-cat-1',
      num: 1,
      subjectId: 'subj-cat-varc',
      topicId: 'topic-cat-rc',
      text: 'According to Karl Popper, a theory is scientific if and only if it is falsifiable. In the context of economic forecasting models that incorporate subjective human expectations, which of the following statements, if true, represents the strongest Popperian critique?',
      options: [
        { label: 'A', text: 'Economic models frequently succeed in predicting historical trends but fail to account for unprecedented external supply shocks.' },
        { label: 'B', text: 'Whenever an economic prediction fails, practitioners modify assumptions about consumer psychology ad-hoc rather than rejecting the core model.' },
        { label: 'C', text: 'Human behavioral patterns are inherently non-deterministic and therefore incapable of being formulated into mathematical equations.' },
        { label: 'D', text: 'Macroeconomic variables cannot be tested in double-blind laboratory experiments, invalidating inductive generalization.' }
      ],
      correct: 'B',
      correct_marks: 3.0,
      negative_marks: 1.0,
      explanation: 'Popper defined falsifiability as the demarcation between empirical science and pseudo-science. If practitioners continually introduce ad-hoc immunizing stratagems (modifying auxiliary psychological hypotheses post-facto to protect the core model from contradiction), the theory becomes unfalsifiable.'
    },
    {
      id: 'q-cat-2',
      num: 2,
      subjectId: 'subj-cat-varc',
      topicId: 'topic-cat-rc',
      text: 'Which of the following best describes the primary rhetorical function of comparing financial market volatility to hydrodynamic turbulence in complex systems literature?',
      options: [
        { label: 'A', text: 'To dismiss quantitative econometric models as mathematically rudimentary and obsolete.' },
        { label: 'B', text: 'To illustrate that deterministic equations can generate unpredictable macroscopic behavior via non-linear feedback loops.' },
        { label: 'C', text: 'To prove that financial crashes are strictly natural phenomena immune to institutional regulatory intervention.' },
        { label: 'D', text: 'To argue that liquidity cascades in equity markets can be calculated with laminar flow fluid dynamics equations.' }
      ],
      correct: 'B',
      correct_marks: 3.0,
      negative_marks: 1.0,
      explanation: 'In complexity theory, turbulence is the canonical archetype of non-linear deterministic chaos—where simple recursive rules produce bounded yet unpredictable emergent states, precisely analogous to feedback-driven market selloffs.'
    },
    {
      id: 'q-cat-3',
      num: 3,
      subjectId: 'subj-cat-dilr',
      topicId: 'topic-cat-arrangements',
      text: 'Six venture partners—A, B, C, D, E, and F—evaluate four AI startups (P, Q, R, S). Exactly two partners evaluate each startup, and each partner evaluates at least one startup. (1) Neither A nor F evaluates startup P. (2) B evaluates Q if and only if D evaluates R. (3) Exactly one of C or E evaluates S. If C evaluates both P and R, which startup must partner A evaluate?',
      options: [
        { label: 'A', text: 'Startup Q' },
        { label: 'B', text: 'Startup R' },
        { label: 'C', text: 'Startup S' },
        { label: 'D', text: 'Cannot be uniquely determined' }
      ],
      correct: 'A',
      correct_marks: 3.0,
      negative_marks: 1.0,
      explanation: 'Since C evaluates P and R, and neither A nor F evaluates P, the two partners evaluating P must be chosen from {B, D, E}. If C and D evaluate R, by condition (2) B evaluates Q. Deductive matrix elimination shows that A must evaluate Q.'
    },
    {
      id: 'q-cat-4',
      num: 4,
      subjectId: 'subj-cat-dilr',
      topicId: 'topic-cat-games',
      text: 'In a single round-robin tournament of 6 teams, each team plays every other team once. A win awards 3 points, a draw 1 point, and a loss 0 points. If the tournament finishes with no draws, and every team scores a distinct number of points, what is the maximum possible score of the team that finished in 4th place?',
      options: [
        { label: 'A', text: '6 points' },
        { label: 'B', text: '9 points' },
        { label: 'C', text: '12 points' },
        { label: 'D', text: '3 points' }
      ],
      correct: 'A',
      correct_marks: 3.0,
      negative_marks: 1.0,
      explanation: 'Total matches = 6 × 5 / 2 = 15 matches. With no draws, total points awarded = 15 × 3 = 45 points. Each win is 3 points, so points are multiples of 3: {15, 12, 9, 6, 3, 0}. Since all scores are distinct multiples of 3, the unique score sequence is 15, 12, 9, 6, 3, 0. Thus the 4th place team must score 6 points (2 wins, 3 losses).'
    },
    {
      id: 'q-cat-5',
      num: 5,
      subjectId: 'subj-cat-qa',
      topicId: 'topic-cat-arithmetic',
      text: 'An executive travels from City X to City Y at an average speed of 60 km/h, and returns along the same route at 40 km/h. If the total round-trip journey took 5 hours, what is the one-way distance between City X and City Y?',
      options: [
        { label: 'A', text: '100 km' },
        { label: 'B', text: '120 km' },
        { label: 'C', text: '125 km' },
        { label: 'D', text: '140 km' }
      ],
      correct: 'B',
      correct_marks: 3.0,
      negative_marks: 1.0,
      explanation: 'Harmonic mean average speed = 2 × 60 × 40 / (60 + 40) = 4800 / 100 = 48 km/h. Total round trip distance = 48 km/h × 5 h = 240 km. Hence one-way distance = 240 / 2 = 120 km. Alternatively: d/60 + d/40 = 5 => (2d + 3d)/120 = 5 => 5d/120 = 5 => d = 120 km.'
    },
    {
      id: 'q-cat-6',
      num: 6,
      subjectId: 'subj-cat-qa',
      topicId: 'topic-cat-arithmetic',
      text: 'A container contains 80 litres of pure ethanol. 20 litres are drawn out and replaced with water. This process of drawing out 20 litres of the mixture and replacing with water is repeated two more times (total 3 operations). What is the final volume of ethanol remaining in the container?',
      options: [
        { label: 'A', text: '33.75 litres' },
        { label: 'B', text: '35.50 litres' },
        { label: 'C', text: '42.25 litres' },
        { label: 'D', text: '28.125 litres' }
      ],
      correct: 'A',
      correct_marks: 3.0,
      negative_marks: 1.0,
      explanation: 'Fraction of liquid remaining after each withdrawal = 1 - 20/80 = 1 - 1/4 = 3/4. After 3 identical cycles, remaining ethanol = Initial × (1 - x/V)^n = 80 × (3/4)^3 = 80 × 27/64 = 5 × 27 / 4 = 135 / 4 = 33.75 litres.'
    },
    {
      id: 'q-cat-7',
      num: 7,
      subjectId: 'subj-cat-qa',
      topicId: 'topic-cat-algebra',
      text: 'Find the number of integral values of x that satisfy the inequality: log_2(x^2 - 5x + 6) < 1.',
      options: [
        { label: 'A', text: '0' },
        { label: 'B', text: '1' },
        { label: 'C', text: '2' },
        { label: 'D', text: '3' }
      ],
      correct: 'A',
      correct_marks: 3.0,
      negative_marks: 1.0,
      explanation: 'Domain condition: x^2 - 5x + 6 > 0 => (x - 2)(x - 3) > 0 => x < 2 or x > 3. Inequality condition: x^2 - 5x + 6 < 2^1 = 2 => x^2 - 5x + 4 < 0 => (x - 1)(x - 4) < 0 => 1 < x < 4. Intersecting with domain: x in (1, 2) U (3, 4). The set of integers in (1, 2) U (3, 4) is completely empty! Thus exactly 0 integers satisfy the condition.'
    },
    {
      id: 'q-cat-8',
      num: 8,
      subjectId: 'subj-cat-qa',
      topicId: 'topic-cat-geometry',
      text: 'A right-angled triangle has legs of length 15 cm and 20 cm. What is the radius of the circle inscribed inside this triangle?',
      options: [
        { label: 'A', text: '4 cm' },
        { label: 'B', text: '5 cm' },
        { label: 'C', text: '6 cm' },
        { label: 'D', text: '7.5 cm' }
      ],
      correct: 'B',
      correct_marks: 3.0,
      negative_marks: 1.0,
      explanation: 'Hypotenuse c = sqrt(15^2 + 20^2) = sqrt(225 + 400) = sqrt(625) = 25 cm. For a right-angled triangle, inradius r = (a + b - c) / 2 = (15 + 20 - 25) / 2 = 10 / 2 = 5 cm. (Or Area = r × s => 150 = r × 30 => r = 5 cm).'
    }
  ];

  const insertQ = db.prepare(`
    INSERT OR REPLACE INTO questions (
      id, test_id, question_number, question_text, question_type,
      options_json, correct_answer, correct_marks, negative_marks, unanswered_marks,
      explanation, parsing_confidence, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const q of catQuestions) {
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
  const attemptId = 'attempt-student-cat-mock1';
  db.prepare(`
    INSERT OR REPLACE INTO test_attempts (
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
    'CAT 2026 All India National Diagnostic Mock 01',
    7200,
    new Date(Date.now() - 3600000 * 24).toISOString(),
    new Date(Date.now() - 3600000 * 22).toISOString(),
    6840, // 114 minutes
    'completed',
    8,
    8,
    6,
    2,
    0,
    18.0, // 6 * 3.0
    2.0,  // 2 * 1.0
    16.0, // 16.0 on 24 marks (Scaled to 107.0/198 on full 66 Qs, ~99.1 percentile)
    24.0,
    66.67,
    75.0,
    new Date(Date.now() - 3600000 * 22).toISOString()
  );

  // 11. Seed High-Fidelity Mistake Records for Student across Multiple Categories
  const insertMistake = db.prepare(`
    INSERT OR REPLACE INTO mistake_records (
      id, user_id, test_id, question_id, exam_id, subject_id, topic_id,
      question_text, options_json, selected_answer, correct_answer, explanation,
      error_category, user_notes, is_resolved, attempt_count, is_bookmarked, last_attempted_at, retry_history_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertMistake.run(
    'mistake-cat-1',
    student.id,
    testId,
    'q-cat-1',
    'exam-cat-2026',
    'subj-cat-varc',
    'topic-cat-rc',
    catQuestions[0].text,
    JSON.stringify(catQuestions[0].options),
    'A', // selected A
    'B', // correct B
    catQuestions[0].explanation,
    'conceptual_gap',
    'Selected Option A focusing on predictive failure rather than the methodological immunizing maneuvers (ad-hoc modifications) central to Popperian falsification.',
    0,
    1,
    1, // bookmarked for revision
    new Date(Date.now() - 3600000 * 24).toISOString(),
    '[]',
    new Date(Date.now() - 3600000 * 24).toISOString()
  );

  insertMistake.run(
    'mistake-cat-2',
    student.id,
    testId,
    'q-cat-4',
    'exam-cat-2026',
    'subj-cat-dilr',
    'topic-cat-games',
    catQuestions[3].text,
    JSON.stringify(catQuestions[3].options),
    'B', // selected B (9 points)
    'A', // correct A (6 points)
    catQuestions[3].explanation,
    'trap_option',
    'Assumed 4th place could achieve 9 points without verifying if {15, 12, 10, 9...} was possible under strict 3-point no-draw constraints where every score must be a distinct multiple of 3.',
    0,
    2, // repeated mistake!
    1, // bookmarked
    new Date(Date.now() - 3600000 * 12).toISOString(),
    JSON.stringify([{ attempt: 1, selected: 'B', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() }]),
    new Date(Date.now() - 3600000 * 24).toISOString()
  );

  insertMistake.run(
    'mistake-cat-3',
    student.id,
    testId,
    'q-cat-5',
    'exam-cat-2026',
    'subj-cat-qa',
    'topic-cat-arithmetic',
    catQuestions[4].text,
    JSON.stringify(catQuestions[4].options),
    'A', // selected A (100 km)
    'B', // correct B (120 km)
    catQuestions[4].explanation,
    'calculation_error',
    'Used arithmetic mean (50 km/h) instead of harmonic mean (48 km/h) for round trip average speed when distances are equal.',
    1, // resolved
    2,
    0,
    new Date(Date.now() - 3600000 * 4).toISOString(),
    JSON.stringify([
      { attempt: 1, selected: 'A', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
      { attempt: 2, selected: 'B', timestamp: new Date(Date.now() - 3600000 * 4).toISOString() }
    ]),
    new Date(Date.now() - 3600000 * 24).toISOString()
  );

  insertMistake.run(
    'mistake-cat-4',
    student.id,
    testId,
    'q-cat-7',
    'exam-cat-2026',
    'subj-cat-qa',
    'topic-cat-algebra',
    catQuestions[6].text,
    JSON.stringify(catQuestions[6].options),
    'C', // selected C (2)
    'A', // correct A (0)
    catQuestions[6].explanation,
    'time_rush',
    'Found interval (1, 4) and hurriedly counted integers 2 and 3 without checking the initial logarithmic domain requirement x^2 - 5x + 6 > 0.',
    0,
    1,
    0,
    new Date(Date.now() - 3600000 * 24).toISOString(),
    '[]',
    new Date(Date.now() - 3600000 * 24).toISOString()
  );
}

function seedQuestionBank(db: any, instituteAdmin: any, now: string): void {
  const qbCountStmt = db.prepare('SELECT COUNT(*) as count FROM question_bank');
  const qbCount = (qbCountStmt.get() as any)?.count || 0;
  if (qbCount > 0) return;

  const insertQB = db.prepare(`
    INSERT OR REPLACE INTO question_bank (
      id, creator_id, topic_id, subject_id, exam_id, question_text, question_type,
      options_json, correct_answer, explanation, difficulty, source_reference, tags_json,
      usage_count, status, marks, negative_marks, estimated_seconds, subtopic_id,
      used_in_tests_json, correctness_status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const qbItems = [
    {
      id: 'qb-cat-1',
      topicId: 'topic-cat-arithmetic',
      subjectId: 'subj-cat-qa',
      text: 'A merchant marks his merchandise 40% above the cost price and allows a cash discount of 25% on the marked price. If his net profit is Rs. 140, what was the original cost price?',
      options: [
        { label: 'A', text: 'Rs. 2,400' },
        { label: 'B', text: 'Rs. 2,800' },
        { label: 'C', text: 'Rs. 3,000' },
        { label: 'D', text: 'Rs. 3,500' }
      ],
      correct: 'B',
      explanation: 'Let CP = 100x. MP = 140x. SP = 140x × 0.75 = 105x. Net Profit = 5x = 140 => x = 28. Hence CP = Rs. 2,800.',
      difficulty: 'medium',
      source: 'CAT Arithmetic Benchmark Series',
      tags: ['Percentages', 'Profit-Loss', 'Discount', 'IIM Standard'],
      usage_count: 2,
      used_in: ['CAT 2026 All India National Diagnostic Mock 01'],
    },
    {
      id: 'qb-cat-2',
      topicId: 'topic-cat-geometry',
      subjectId: 'subj-cat-qa',
      text: 'A right-angled triangle has legs of length 15 cm and 20 cm. What is the radius of the circle inscribed inside this triangle?',
      options: [
        { label: 'A', text: '4 cm' },
        { label: 'B', text: '5 cm' },
        { label: 'C', text: '6 cm' },
        { label: 'D', text: '7.5 cm' }
      ],
      correct: 'B',
      explanation: 'Hypotenuse c = sqrt(15^2 + 20^2) = 25 cm. Inradius r = (a + b - c) / 2 = (15 + 20 - 25) / 2 = 5 cm.',
      difficulty: 'hard',
      source: 'Nalanda Geometry Question Series',
      tags: ['Geometry', 'Circles', 'Inradius', 'Triangles'],
      usage_count: 2,
      used_in: ['CAT 2026 All India National Diagnostic Mock 01'],
    },
    {
      id: 'qb-cat-3',
      topicId: 'topic-cat-algebra',
      subjectId: 'subj-cat-qa',
      text: 'Find the number of integral values of x that satisfy the inequality: log_2(x^2 - 5x + 6) < 1.',
      options: [
        { label: 'A', text: '0' },
        { label: 'B', text: '1' },
        { label: 'C', text: '2' },
        { label: 'D', text: '3' }
      ],
      correct: 'A',
      explanation: 'Domain: x^2 - 5x + 6 > 0 => x < 2 or x > 3. Inequality: x^2 - 5x + 6 < 2 => 1 < x < 4. Intersecting with domain gives (1, 2) U (3, 4), which contains 0 integers.',
      difficulty: 'medium',
      source: 'CAT Advanced Algebra Archive',
      tags: ['Algebra', 'Logarithms', 'Inequalities', 'Domain'],
      usage_count: 1,
      used_in: ['CAT 2026 All India National Diagnostic Mock 01'],
    },
    {
      id: 'qb-cat-4',
      topicId: 'topic-cat-numbers',
      subjectId: 'subj-cat-qa',
      text: 'Find the remainder when 3^102 is divided by the prime modulus 17.',
      options: [
        { label: 'A', text: '1' },
        { label: 'B', text: '9' },
        { label: 'C', text: '13' },
        { label: 'D', text: '15' }
      ],
      correct: 'D',
      explanation: 'By Fermat\'s Little Theorem: 3^16 ≡ 1 (mod 17). 102 = 16 × 6 + 6 => 3^102 ≡ 3^6 ≡ 729 ≡ 15 (mod 17).',
      difficulty: 'hard',
      source: 'Number Theory Specialist Drill',
      tags: ['Number Systems', 'Fermat Theorem', 'Modular Arithmetic'],
      usage_count: 1,
      used_in: [],
    },
    {
      id: 'qb-cat-5',
      topicId: 'topic-cat-arrangements',
      subjectId: 'subj-cat-dilr',
      text: 'Six venture partners—A, B, C, D, E, and F—evaluate four AI startups (P, Q, R, S). Exactly two partners evaluate each startup, and each partner evaluates at least one startup. (1) Neither A nor F evaluates startup P. (2) B evaluates Q if and only if D evaluates R. (3) Exactly one of C or E evaluates S. If C evaluates both P and R, which startup must partner A evaluate?',
      options: [
        { label: 'A', text: 'Startup Q' },
        { label: 'B', text: 'Startup R' },
        { label: 'C', text: 'Startup S' },
        { label: 'D', text: 'Cannot be uniquely determined' }
      ],
      correct: 'A',
      explanation: 'Using deductive matrix constraints, partner A evaluates Startup Q.',
      difficulty: 'hard',
      source: 'CAT DILR Matrix Vault',
      tags: ['DILR', 'Matrix Deduction', 'Arrangements'],
      usage_count: 2,
      used_in: ['CAT 2026 All India National Diagnostic Mock 01'],
    },
    {
      id: 'qb-cat-6',
      topicId: 'topic-cat-games',
      subjectId: 'subj-cat-dilr',
      text: 'In a single round-robin tournament of 6 teams, each team plays every other team once. A win awards 3 points, a draw 1 point, and a loss 0 points. If the tournament finishes with no draws, and every team scores a distinct number of points, what is the maximum possible score of the team that finished in 4th place?',
      options: [
        { label: 'A', text: '6 points' },
        { label: 'B', text: '9 points' },
        { label: 'C', text: '12 points' },
        { label: 'D', text: '3 points' }
      ],
      correct: 'A',
      explanation: 'Total matches = 15 => 45 points. Scores must be {15, 12, 9, 6, 3, 0}. The 4th team scores 6 points.',
      difficulty: 'hard',
      source: 'CAT Games & Tournaments Compendium',
      tags: ['Games & Tournaments', 'DILR', 'Round Robin'],
      usage_count: 2,
      used_in: ['CAT 2026 All India National Diagnostic Mock 01'],
    },
    {
      id: 'qb-cat-7',
      topicId: 'topic-cat-rc',
      subjectId: 'subj-cat-varc',
      text: 'According to Karl Popper, a theory is scientific if and only if it is falsifiable. In the context of economic forecasting models that incorporate subjective human expectations, which of the following statements, if true, represents the strongest Popperian critique?',
      options: [
        { label: 'A', text: 'Economic models frequently succeed in predicting historical trends but fail to account for unprecedented external supply shocks.' },
        { label: 'B', text: 'Whenever an economic prediction fails, practitioners modify assumptions about consumer psychology ad-hoc rather than rejecting the core model.' },
        { label: 'C', text: 'Human behavioral patterns are inherently non-deterministic and therefore incapable of being formulated into mathematical equations.' },
        { label: 'D', text: 'Macroeconomic variables cannot be tested in double-blind laboratory experiments, invalidating inductive generalization.' }
      ],
      correct: 'B',
      explanation: 'Popper defined falsifiability as the demarcation between empirical science and pseudo-science. Post-hoc ad-hoc modifications shield theories from falsification.',
      difficulty: 'medium',
      source: 'CAT VARC Philosophy Inferences',
      tags: ['RC', 'Philosophy', 'Falsifiability', 'Critical Reasoning'],
      usage_count: 2,
      used_in: ['CAT 2026 All India National Diagnostic Mock 01'],
    },
    {
      id: 'qb-cat-8',
      topicId: 'topic-cat-rc',
      subjectId: 'subj-cat-varc',
      text: 'Which of the following best describes the primary rhetorical function of comparing financial market volatility to hydrodynamic turbulence in complex systems literature?',
      options: [
        { label: 'A', text: 'To dismiss quantitative econometric models as mathematically rudimentary and obsolete.' },
        { label: 'B', text: 'To illustrate that deterministic equations can generate unpredictable macroscopic behavior via non-linear feedback loops.' },
        { label: 'C', text: 'To prove that financial crashes are strictly natural phenomena immune to institutional regulatory intervention.' },
        { label: 'D', text: 'To argue that liquidity cascades in equity markets can be calculated with laminar flow fluid dynamics equations.' }
      ],
      correct: 'B',
      explanation: 'In complexity theory, turbulence is the canonical archetype of non-linear deterministic chaos where simple rules create unpredictable macroscopic states.',
      difficulty: 'medium',
      source: 'CAT VARC Science & Economics Series',
      tags: ['RC', 'Rhetorical Function', 'Tone Analysis'],
      usage_count: 2,
      used_in: ['CAT 2026 All India National Diagnostic Mock 01'],
    }
  ];

  for (const item of qbItems) {
    insertQB.run(
      item.id,
      instituteAdmin.id,
      item.topicId,
      item.subjectId,
      'exam-cat-2026',
      item.text,
      'single',
      JSON.stringify(item.options),
      item.correct,
      item.explanation,
      item.difficulty,
      item.source,
      JSON.stringify(item.tags),
      item.usage_count,
      'active',
      3.0,
      1.0,
      120,
      null,
      JSON.stringify(item.used_in),
      'verified',
      now
    );
  }
}

function seedTestSeriesAndTrustLabels(db: any, instituteAdmin: any, now: string): void {
  // 1. Update official trust labels and ratings for admin created tests
  try {
    db.prepare(`
      UPDATE tests 
      SET trust_label = 'Nalanda Official', rating = 4.9, ratings_count = 142
      WHERE user_id IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin'))
        AND (trust_label IS NULL OR trust_label = 'Community Created')
    `).run();
  } catch (err) {
    console.warn('Trust label update notice:', err);
  }

  // 2. Seed Test Series if empty
  const tsCountStmt = db.prepare('SELECT COUNT(*) as count FROM test_series');
  const tsCount = (tsCountStmt.get() as any)?.count || 0;
  if (tsCount > 0) return;

  const insertTS = db.prepare(`
    INSERT INTO test_series (
      id, creator_id, exam_id, title, description, target_year, total_tests,
      is_paid, price_inr, rating, enrolled_count, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const series = [
    {
      id: 'ts-1',
      creator_id: instituteAdmin.id,
      exam_id: 'exam-cat-2026',
      title: 'CAT 2026 All India Master Mock Series',
      description: 'Ten full-length computer-based diagnostic mock exams adhering strictly to official IIM CAT 120-minute pattern with sectional timers (VARC, DILR, QA).',
      target_year: 2026,
      total_tests: 10,
      is_paid: 0,
      price_inr: 0.0,
      rating: 4.96,
      enrolled_count: 3480,
    },
    {
      id: 'ts-2',
      creator_id: instituteAdmin.id,
      exam_id: 'exam-cat-2026',
      title: 'CAT 2026 Quantitative Aptitude & Algebra Sprint Pack',
      description: 'Topic-specific high-density speed drills targeting Advanced Algebra, Logarithmic Inequalities, Cyclic Polynomials, and Modern Math.',
      target_year: 2026,
      total_tests: 6,
      is_paid: 0,
      price_inr: 0.0,
      rating: 4.93,
      enrolled_count: 1820,
    },
    {
      id: 'ts-3',
      creator_id: instituteAdmin.id,
      exam_id: 'exam-xat-2026',
      title: 'XAT 2026 Decision Making & VALR Intensive Series',
      description: 'Systematic analytical caselets and managerial dilemma questions covering XLRI Decision Making and Verbal & Logical Ability.',
      target_year: 2026,
      total_tests: 8,
      is_paid: 0,
      price_inr: 0.0,
      rating: 4.91,
      enrolled_count: 1450,
    },
    {
      id: 'ts-4',
      creator_id: instituteAdmin.id,
      exam_id: 'exam-snap-2026',
      title: 'SNAP 2026 Speed & Accuracy 60-Minute Mocks',
      description: 'High-speed 60-question mock drills balancing English, Quantitative Aptitude, and Analytical Reasoning for Symbiosis institutes.',
      target_year: 2026,
      total_tests: 8,
      is_paid: 0,
      price_inr: 0.0,
      rating: 4.88,
      enrolled_count: 1120,
    },
  ];

  for (const s of series) {
    insertTS.run(
      s.id,
      s.creator_id,
      s.exam_id,
      s.title,
      s.description,
      s.target_year,
      s.total_tests,
      s.is_paid,
      s.price_inr,
      s.rating,
      s.enrolled_count,
      'published',
      now
    );
  }

  // 3. Seed Dedicated Educator User & Profile (Prof. Vikramaditya Sen)
  const educator = getOrCreateRoleDemoUser('educator');
  db.prepare(`
    INSERT OR REPLACE INTO educator_profiles (
      user_id, headline, bio, institute_name, verification_status,
      specialization_subjects_json, total_students, average_rating,
      published_tests_count, followers_count, profile_image_url, publication_status, created_at
    ) VALUES (?, ?, ?, ?, 'verified', ?, ?, ?, ?, ?, NULL, 'active', ?)
  `).run(
    educator.id,
    'Senior Faculty & Quantitative Aptitude Chair',
    'Former IIM Selection Panelist specializing in high-speed algebra proofs, DILR caselet decomposition, and percentile optimization models.',
    'Nalanda School of Management Prep',
    JSON.stringify(['Quantitative Aptitude', 'Data Interpretation & Logical Reasoning', 'Verbal Ability']),
    2840,
    4.96,
    8,
    620,
    now
  );

  // 4. Seed Premium / Paid Test Series
  const insertPaidSeries = db.prepare(`
    INSERT OR IGNORE INTO test_series (
      id, creator_id, exam_id, title, description, target_year, total_tests,
      is_paid, price_inr, rating, enrolled_count, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPaidSeries.run(
    'ts-paid-1',
    educator.id,
    'exam-cat-2026',
    'CAT 2026 99th Percentile Advanced Caselet & Quant Super Pack',
    'Curated 15-mock intensive curriculum with forensic video explanations, step-by-step IIM scoring algorithms, and All-India live percentile analytics.',
    2026,
    15,
    1,
    499.0,
    4.98,
    1250,
    'published',
    now
  );

  insertPaidSeries.run(
    'ts-paid-2',
    educator.id,
    'exam-nmat-2026',
    'NMAT 2026 Adaptive Strategy & Speed Mastery Pack',
    'High-yield computer-adaptive drills with section-wise time-pacing strategies and GMAC score forecasting.',
    2026,
    10,
    1,
    399.0,
    4.94,
    780,
    'published',
    now
  );

  // 5. Seed Test Series Items (Mapping tests to series with sequence & free preview flags)
  const insertSeriesItem = db.prepare(`
    INSERT OR IGNORE INTO test_series_items (id, series_id, test_id, sequence_order, is_free_preview, unlock_rule, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Items for ts-1 (Free All India Series)
  insertSeriesItem.run('tsi-1', 'ts-1', 'test-cat-mock-01', 1, 1, 'immediate', now);
  insertSeriesItem.run('tsi-2', 'ts-1', 'test-topic-cat-arithmetic', 2, 1, 'immediate', now);
  insertSeriesItem.run('tsi-3', 'ts-1', 'test-topic-cat-rc', 3, 0, 'immediate', now);

  // Items for ts-paid-1 (Paid Super Pack: test 1 free preview, test 2 & 3 locked)
  insertSeriesItem.run('tsi-p1', 'ts-paid-1', 'test-cat-mock-01', 1, 1, 'immediate', now);
  insertSeriesItem.run('tsi-p2', 'ts-paid-1', 'test-topic-cat-arithmetic', 2, 0, 'immediate', now);
  insertSeriesItem.run('tsi-p3', 'ts-paid-1', 'test-topic-cat-rc', 3, 0, 'immediate', now);

  // 6. Seed Learner Series Enrollment for Demo Student
  const student = getOrCreateRoleDemoUser('student');
  db.prepare(`
    INSERT OR IGNORE INTO user_series_enrollments (
      id, user_id, series_id, access_tier, progress_percentage, completed_tests_count, enrolled_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('use-1', student.id, 'ts-1', 'free_preview', 33.3, 1, now);

  // 7. Seed Sample Test under review for Admin Moderation Queue
  db.prepare(`
    INSERT OR IGNORE INTO tests (
      id, user_id, title, description, subject, section_id, duration_seconds,
      marking_scheme_type, default_correct_marks, default_negative_marks,
      visibility, is_paid, price_inr, status, test_type, exam_id, difficulty,
      source, trust_label, rating, ratings_count, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'test-under-review-1',
    educator.id,
    'CAT 2026 Advanced Quantitative Aptitude & Inequality Sprint',
    'Faculty authored specialized drill targeting cyclic expressions, symmetric roots, and logarithmic constraints for 99th percentile candidates.',
    'Quantitative Aptitude',
    'sec-mba',
    2400, // 40 mins
    'standard',
    3.0,
    1.0,
    'public',
    1,
    99.0,
    'under_review',
    'sectional_test',
    'exam-cat-2026',
    'hard',
    'Prof. Vikramaditya Sen Faculty Team',
    'Educator Published',
    4.9,
    18,
    now,
    now
  );

  // Seed Questions for the Under-Review test
  const insertRevQ = db.prepare(`
    INSERT OR IGNORE INTO questions (
      id, test_id, question_number, question_text, question_type, options_json,
      correct_answer, correct_marks, negative_marks, explanation, subject_id, difficulty, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertRevQ.run(
    'q-rev-1',
    'test-under-review-1',
    1,
    'If $x + \\frac{1}{x} = \\sqrt{7}$, what is the exact value of $x^5 + \\frac{1}{x^5}$?',
    'single',
    JSON.stringify([
      { label: 'A', text: '$11\\sqrt{7}$' },
      { label: 'B', text: '$13\\sqrt{7}$' },
      { label: 'C', text: '$14\\sqrt{7}$' },
      { label: 'D', text: '$16\\sqrt{7}$' },
    ]),
    'A',
    3.0,
    1.0,
    'Using formula: $(x^2 + 1/x^2)(x^3 + 1/x^3) - (x + 1/x)$. Here $x^2 + 1/x^2 = 7 - 2 = 5$. And $x^3 + 1/x^3 = (\\sqrt{7})^3 - 3\\sqrt{7} = 4\\sqrt{7}$. Multiplying: $5 \\times 4\\sqrt{7} - \\sqrt{7} = 19\\sqrt{7}$... yielding $11\\sqrt{7}$.',
    'Quantitative Aptitude',
    'hard',
    now
  );

  // 8. Seed Sample Sandbox Orders & Purchases
  db.prepare(`
    INSERT OR IGNORE INTO orders (
      id, user_id, item_type, item_id, amount_inr, platform_fee_inr,
      creator_earnings_inr, tax_inr, currency, payment_status, payment_method,
      receipt_number, created_at, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'INR', 'completed', 'upi', ?, ?, ?)
  `).run(
    'ord-demo-101',
    student.id,
    'test_series',
    'ts-paid-1',
    499.0,
    74.85,
    424.15,
    76.11,
    'NAL-REC-2026-0489',
    now,
    now
  );

  db.prepare(`
    INSERT OR IGNORE INTO purchases (
      id, order_id, user_id, item_type, item_id, access_status, granted_at
    ) VALUES (?, ?, ?, ?, ?, 'active', ?)
  `).run('pur-demo-101', 'ord-demo-101', student.id, 'test_series', 'ts-paid-1', now);
}


