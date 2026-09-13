import { getDb } from './index';
import { hashPassword, getOrCreateRoleDemoUser } from '../auth';
import crypto from 'crypto';

export function seedInitialData(): void {
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
      'INSERT INTO sections (id, name, description, icon, is_active, created_at) VALUES (?, ?, ?, ?, 1, ?)'
    );
    const now = new Date().toISOString();
    insertSection.run('sec-medical', 'Medical Entrance (NEET)', 'Physics, Chemistry, and Biology mock papers designed for pre-medical aspirants.', 'Stethoscope', now);
    insertSection.run('sec-engineering', 'Engineering Entrance (JEE)', 'Advanced Mathematics, Mechanics, and Physical Sciences for engineering mock exams.', 'Cpu', now);
    insertSection.run('sec-civil', 'Civil Services & UPSC', 'General Studies, Reasoning, Quantitative Aptitude, and Indian Polity.', 'Award', now);
    insertSection.run('sec-general', 'Science & Computing', 'Foundational Computer Science, General Science, and Logical Aptitude.', 'Layers', now);
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
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
}
