import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

// Maintain a singleton database connection across Next.js API calls
let dbInstance: DatabaseSync | null = null;

function resolveDataDirectory(): string {
  const customDir = process.env.DB_DIR;
  const preferred = customDir || path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(preferred)) {
      fs.mkdirSync(preferred, { recursive: true });
    }
    const testFile = path.join(preferred, `.write-probe-${Date.now()}`);
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    return preferred;
  } catch (err) {
    console.warn(`[Database] Directory ${preferred} not writable (${err}), using /tmp/data fallback.`);
    const fallback = path.join('/tmp', 'examcraft-data');
    if (!fs.existsSync(fallback)) {
      fs.mkdirSync(fallback, { recursive: true });
    }
    return fallback;
  }
}

export function getDb(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  const dataDir = resolveDataDirectory();
  const dbPath = path.join(dataDir, 'mocktest.db');
  const db = new DatabaseSync(dbPath);

  // Enable WAL and foreign keys
  try {
    db.exec('PRAGMA journal_mode = WAL;');
  } catch (e) {
    console.warn('[Database] WAL mode setting warning:', e);
  }
  try {
    db.exec('PRAGMA foreign_keys = ON;');
  } catch (e) {
    console.warn('[Database] Foreign keys setting warning:', e);
  }

  // Initialize schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      status TEXT NOT NULL DEFAULT 'active',
      institute_name TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      subject TEXT,
      section_id TEXT,
      duration_seconds INTEGER NOT NULL DEFAULT 1800,
      marking_scheme_type TEXT NOT NULL DEFAULT 'standard',
      default_correct_marks REAL NOT NULL DEFAULT 4.0,
      default_negative_marks REAL NOT NULL DEFAULT 1.0,
      default_unanswered_marks REAL NOT NULL DEFAULT 0.0,
      shuffle_questions INTEGER NOT NULL DEFAULT 0,
      shuffle_options INTEGER NOT NULL DEFAULT 0,
      allow_navigation INTEGER NOT NULL DEFAULT 1,
      show_palette INTEGER NOT NULL DEFAULT 1,
      allow_review_marking INTEGER NOT NULL DEFAULT 1,
      show_immediate_results INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      test_id TEXT NOT NULL,
      question_number INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      question_image_url TEXT,
      question_type TEXT NOT NULL DEFAULT 'single',
      options_json TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      correct_marks REAL NOT NULL DEFAULT 4.0,
      negative_marks REAL NOT NULL DEFAULT 1.0,
      unanswered_marks REAL NOT NULL DEFAULT 0.0,
      explanation TEXT,
      parsing_confidence REAL DEFAULT 1.0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS test_attempts (
      id TEXT PRIMARY KEY,
      test_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      test_title_snapshot TEXT NOT NULL,
      duration_seconds INTEGER NOT NULL DEFAULT 1800,
      started_at TEXT NOT NULL,
      submitted_at TEXT,
      time_taken_seconds INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'in_progress',
      total_questions INTEGER NOT NULL DEFAULT 0,
      attempted_questions INTEGER NOT NULL DEFAULT 0,
      correct_answers INTEGER NOT NULL DEFAULT 0,
      incorrect_answers INTEGER NOT NULL DEFAULT 0,
      unanswered_questions INTEGER NOT NULL DEFAULT 0,
      positive_marks REAL NOT NULL DEFAULT 0.0,
      negative_marks REAL NOT NULL DEFAULT 0.0,
      final_score REAL NOT NULL DEFAULT 0.0,
      maximum_marks REAL NOT NULL DEFAULT 0.0,
      percentage REAL NOT NULL DEFAULT 0.0,
      accuracy REAL NOT NULL DEFAULT 0.0,
      questions_snapshot_json TEXT,
      ai_insights_json TEXT,
      section_performance_json TEXT,
      topic_performance_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_answers (
      id TEXT PRIMARY KEY,
      attempt_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      question_number INTEGER NOT NULL,
      selected_answer TEXT,
      is_correct INTEGER,
      marks_awarded REAL NOT NULL DEFAULT 0.0,
      negative_marks_deducted REAL NOT NULL DEFAULT 0.0,
      is_marked_for_review INTEGER NOT NULL DEFAULT 0,
      answered_at TEXT,
      FOREIGN KEY (attempt_id) REFERENCES test_attempts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS exams (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      target_year INTEGER NOT NULL DEFAULT 2026,
      pattern_type TEXT NOT NULL DEFAULT 'multi_subject',
      total_marks REAL NOT NULL DEFAULT 720.0,
      total_duration_minutes INTEGER NOT NULL DEFAULT 200,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      exam_id TEXT NOT NULL,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0,
      description TEXT,
      color_accent TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS syllabus_nodes (
      id TEXT PRIMARY KEY,
      subject_id TEXT NOT NULL,
      parent_id TEXT,
      level TEXT NOT NULL DEFAULT 'topic',
      title TEXT NOT NULL,
      code TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      estimated_study_hours REAL NOT NULL DEFAULT 10.0,
      weightage_percentage REAL NOT NULL DEFAULT 5.0,
      prerequisite_ids_json TEXT NOT NULL DEFAULT '[]',
      description TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS topic_resources (
      id TEXT PRIMARY KEY,
      topic_id TEXT NOT NULL,
      title TEXT NOT NULL,
      resource_type TEXT NOT NULL DEFAULT 'notes',
      content_summary TEXT NOT NULL,
      external_url TEXT,
      estimated_read_minutes INTEGER NOT NULL DEFAULT 15,
      created_at TEXT NOT NULL,
      FOREIGN KEY (topic_id) REFERENCES syllabus_nodes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_exam_enrollments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      exam_id TEXT NOT NULL,
      target_year INTEGER NOT NULL DEFAULT 2026,
      target_score REAL,
      is_primary INTEGER NOT NULL DEFAULT 1,
      enrolled_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_topic_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'not_started',
      mastery_percentage REAL NOT NULL DEFAULT 0.0,
      questions_practiced INTEGER NOT NULL DEFAULT 0,
      questions_correct INTEGER NOT NULL DEFAULT 0,
      tests_attempted INTEGER NOT NULL DEFAULT 0,
      last_studied_at TEXT,
      notes_taken TEXT,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (topic_id) REFERENCES syllabus_nodes(id) ON DELETE CASCADE,
      UNIQUE (user_id, topic_id)
    );

    CREATE TABLE IF NOT EXISTS question_bank (
      id TEXT PRIMARY KEY,
      creator_id TEXT NOT NULL,
      topic_id TEXT,
      subject_id TEXT,
      exam_id TEXT,
      question_text TEXT NOT NULL,
      question_type TEXT NOT NULL DEFAULT 'single',
      options_json TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      difficulty TEXT NOT NULL DEFAULT 'medium',
      source_reference TEXT,
      tags_json TEXT NOT NULL DEFAULT '[]',
      usage_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      marks REAL NOT NULL DEFAULT 2.0,
      negative_marks REAL NOT NULL DEFAULT 0.5,
      estimated_seconds INTEGER NOT NULL DEFAULT 60,
      subtopic_id TEXT,
      used_in_tests_json TEXT NOT NULL DEFAULT '[]',
      correctness_status TEXT NOT NULL DEFAULT 'verified',
      created_at TEXT NOT NULL,
      FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS educator_profiles (
      user_id TEXT PRIMARY KEY,
      headline TEXT NOT NULL,
      bio TEXT NOT NULL,
      institute_name TEXT,
      verification_status TEXT NOT NULL DEFAULT 'verified',
      specialization_subjects_json TEXT NOT NULL DEFAULT '[]',
      total_students INTEGER NOT NULL DEFAULT 0,
      average_rating REAL NOT NULL DEFAULT 4.9,
      published_tests_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS exam_stages (
      id TEXT PRIMARY KEY,
      exam_id TEXT NOT NULL,
      name TEXT NOT NULL,
      stage_number INTEGER NOT NULL DEFAULT 1,
      total_marks REAL NOT NULL DEFAULT 200.0,
      total_questions INTEGER NOT NULL DEFAULT 100,
      duration_minutes INTEGER NOT NULL DEFAULT 60,
      is_computer_based INTEGER NOT NULL DEFAULT 1,
      description TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS mistake_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      test_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      exam_id TEXT,
      subject_id TEXT,
      topic_id TEXT,
      question_text TEXT NOT NULL,
      options_json TEXT NOT NULL,
      selected_answer TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      error_category TEXT NOT NULL DEFAULT 'conceptual_gap',
      user_notes TEXT,
      is_resolved INTEGER NOT NULL DEFAULT 0,
      resolved_at TEXT,
      attempt_count INTEGER NOT NULL DEFAULT 1,
      is_bookmarked INTEGER NOT NULL DEFAULT 0,
      last_attempted_at TEXT,
      retry_history_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS learning_paths (
      id TEXT PRIMARY KEY,
      exam_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      target_days INTEGER NOT NULL DEFAULT 60,
      recommended_hours_per_week REAL NOT NULL DEFAULT 15.0,
      total_units INTEGER NOT NULL DEFAULT 24,
      created_at TEXT NOT NULL,
      FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS learning_units (
      id TEXT PRIMARY KEY,
      path_id TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0,
      is_core INTEGER NOT NULL DEFAULT 1,
      estimated_minutes INTEGER NOT NULL DEFAULT 45,
      FOREIGN KEY (path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
      FOREIGN KEY (topic_id) REFERENCES syllabus_nodes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS test_series (
      id TEXT PRIMARY KEY,
      creator_id TEXT NOT NULL,
      exam_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      target_year INTEGER NOT NULL DEFAULT 2026,
      total_tests INTEGER NOT NULL DEFAULT 10,
      is_paid INTEGER NOT NULL DEFAULT 0,
      price_inr REAL NOT NULL DEFAULT 0.0,
      rating REAL NOT NULL DEFAULT 4.9,
      enrolled_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'published',
      created_at TEXT NOT NULL,
      FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_onboarding_profiles (
      user_id TEXT PRIMARY KEY,
      preferred_exam_id TEXT NOT NULL DEFAULT 'exam-ssc-cgl-2026',
      preparation_stage TEXT NOT NULL DEFAULT 'beginner',
      target_timeline TEXT NOT NULL DEFAULT '2026_tier1',
      daily_study_hours REAL NOT NULL DEFAULT 3.0,
      strong_subjects_json TEXT NOT NULL DEFAULT '[]',
      weak_subjects_json TEXT NOT NULL DEFAULT '[]',
      diagnostic_test_status TEXT NOT NULL DEFAULT 'skipped',
      completed_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (preferred_exam_id) REFERENCES exams(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS topic_contents (
      topic_id TEXT PRIMARY KEY,
      content_json TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (topic_id) REFERENCES syllabus_nodes(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_tests_user_id ON tests(user_id);
    CREATE INDEX IF NOT EXISTS idx_questions_test_id ON questions(test_id);
    CREATE INDEX IF NOT EXISTS idx_test_attempts_test_id ON test_attempts(test_id);
    CREATE INDEX IF NOT EXISTS idx_test_attempts_user_id ON test_attempts(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_answers_attempt_id ON user_answers(attempt_id);
    CREATE INDEX IF NOT EXISTS idx_subjects_exam_id ON subjects(exam_id);
    CREATE INDEX IF NOT EXISTS idx_syllabus_subject_id ON syllabus_nodes(subject_id);
    CREATE INDEX IF NOT EXISTS idx_syllabus_parent_id ON syllabus_nodes(parent_id);
    CREATE INDEX IF NOT EXISTS idx_topic_progress_user ON user_topic_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_user ON user_exam_enrollments(user_id);
    CREATE INDEX IF NOT EXISTS idx_mistakes_user ON mistake_records(user_id);
    CREATE INDEX IF NOT EXISTS idx_exam_stages_exam ON exam_stages(exam_id);
  `);

  // Safe schema migrations for existing database files
  try { db.exec('ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT "active";'); } catch {}
  try { db.exec('ALTER TABLE users ADD COLUMN institute_name TEXT;'); } catch {}
  try { db.exec('ALTER TABLE tests ADD COLUMN section_id TEXT;'); } catch {}
  try { db.exec('ALTER TABLE tests ADD COLUMN test_type TEXT NOT NULL DEFAULT "custom_practice";'); } catch {}
  try { db.exec('ALTER TABLE tests ADD COLUMN exam_id TEXT;'); } catch {}
  try { db.exec('ALTER TABLE tests ADD COLUMN subject_id TEXT;'); } catch {}
  try { db.exec('ALTER TABLE tests ADD COLUMN topic_id TEXT;'); } catch {}
  try { db.exec('ALTER TABLE tests ADD COLUMN visibility TEXT NOT NULL DEFAULT "public";'); } catch {}
  try { db.exec('ALTER TABLE tests ADD COLUMN is_paid INTEGER NOT NULL DEFAULT 0;'); } catch {}
  try { db.exec('ALTER TABLE tests ADD COLUMN price_inr REAL NOT NULL DEFAULT 0.0;'); } catch {}
  try { db.exec('ALTER TABLE test_attempts ADD COLUMN duration_seconds INTEGER NOT NULL DEFAULT 1800;'); } catch {}
  try { db.exec('ALTER TABLE test_attempts ADD COLUMN ai_insights_json TEXT;'); } catch {}
  try { db.exec('ALTER TABLE exams ADD COLUMN conducting_body TEXT;'); } catch {}
  try { db.exec('ALTER TABLE exams ADD COLUMN difficulty_level TEXT;'); } catch {}
  try { db.exec('ALTER TABLE exams ADD COLUMN pattern_summary TEXT;'); } catch {}
  try { db.exec('ALTER TABLE syllabus_nodes ADD COLUMN difficulty TEXT DEFAULT "medium";'); } catch {}
  try { db.exec('ALTER TABLE user_topic_progress ADD COLUMN next_revision_date TEXT;'); } catch {}
  try { db.exec('ALTER TABLE user_topic_progress ADD COLUMN repetition_interval_days INTEGER DEFAULT 3;'); } catch {}
  try { db.exec('ALTER TABLE user_topic_progress ADD COLUMN repetition_count INTEGER DEFAULT 0;'); } catch {}
  try { db.exec('ALTER TABLE user_topic_progress ADD COLUMN is_bookmarked INTEGER DEFAULT 0;'); } catch {}
  try { db.exec('ALTER TABLE tests ADD COLUMN difficulty TEXT DEFAULT "medium";'); } catch {}
  try { db.exec('ALTER TABLE tests ADD COLUMN source TEXT DEFAULT "Nalanda Official";'); } catch {}
  try { db.exec('ALTER TABLE tests ADD COLUMN subtopic_id TEXT;'); } catch {}
  try { db.exec('ALTER TABLE questions ADD COLUMN subject_id TEXT;'); } catch {}
  try { db.exec('ALTER TABLE questions ADD COLUMN section_id TEXT;'); } catch {}
  try { db.exec('ALTER TABLE questions ADD COLUMN topic_id TEXT;'); } catch {}
  try { db.exec('ALTER TABLE questions ADD COLUMN subtopic_id TEXT;'); } catch {}
  try { db.exec('ALTER TABLE questions ADD COLUMN difficulty TEXT DEFAULT "medium";'); } catch {}
  try { db.exec('ALTER TABLE questions ADD COLUMN source TEXT;'); } catch {}
  try { db.exec('ALTER TABLE test_attempts ADD COLUMN section_performance_json TEXT;'); } catch {}
  try { db.exec('ALTER TABLE test_attempts ADD COLUMN topic_performance_json TEXT;'); } catch {}
  try { db.exec('ALTER TABLE mistake_records ADD COLUMN attempt_count INTEGER NOT NULL DEFAULT 1;'); } catch {}
  try { db.exec('ALTER TABLE mistake_records ADD COLUMN is_bookmarked INTEGER NOT NULL DEFAULT 0;'); } catch {}
  try { db.exec('ALTER TABLE mistake_records ADD COLUMN last_attempted_at TEXT;'); } catch {}
  try { db.exec('ALTER TABLE mistake_records ADD COLUMN retry_history_json TEXT NOT NULL DEFAULT "[]";'); } catch {}
  try { db.exec('ALTER TABLE user_topic_progress ADD COLUMN decay_days_threshold INTEGER DEFAULT 14;'); } catch {}
  try { db.exec('ALTER TABLE user_topic_progress ADD COLUMN last_quiz_score REAL;'); } catch {}
  try { db.exec('ALTER TABLE tests ADD COLUMN status TEXT NOT NULL DEFAULT "published";'); } catch {}
  try { db.exec('ALTER TABLE tests ADD COLUMN instructions TEXT;'); } catch {}
  try { db.exec('ALTER TABLE tests ADD COLUMN result_availability TEXT NOT NULL DEFAULT "immediate";'); } catch {}
  try { db.exec('ALTER TABLE tests ADD COLUMN tags_json TEXT NOT NULL DEFAULT "[]";'); } catch {}
  try { db.exec('ALTER TABLE question_bank ADD COLUMN status TEXT NOT NULL DEFAULT "active";'); } catch {}
  try { db.exec('ALTER TABLE question_bank ADD COLUMN marks REAL NOT NULL DEFAULT 2.0;'); } catch {}
  try { db.exec('ALTER TABLE question_bank ADD COLUMN negative_marks REAL NOT NULL DEFAULT 0.5;'); } catch {}
  try { db.exec('ALTER TABLE question_bank ADD COLUMN estimated_seconds INTEGER NOT NULL DEFAULT 60;'); } catch {}
  try { db.exec('ALTER TABLE question_bank ADD COLUMN subtopic_id TEXT;'); } catch {}
  try { db.exec('ALTER TABLE question_bank ADD COLUMN used_in_tests_json TEXT NOT NULL DEFAULT "[]";'); } catch {}
  try { db.exec('ALTER TABLE question_bank ADD COLUMN correctness_status TEXT NOT NULL DEFAULT "verified";'); } catch {}

  dbInstance = db;
  return dbInstance;
}
