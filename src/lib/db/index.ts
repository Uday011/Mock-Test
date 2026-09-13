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

    CREATE INDEX IF NOT EXISTS idx_tests_user_id ON tests(user_id);
    CREATE INDEX IF NOT EXISTS idx_questions_test_id ON questions(test_id);
    CREATE INDEX IF NOT EXISTS idx_test_attempts_test_id ON test_attempts(test_id);
    CREATE INDEX IF NOT EXISTS idx_test_attempts_user_id ON test_attempts(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_answers_attempt_id ON user_answers(attempt_id);
  `);

  // Safe schema migrations for existing database files
  try { db.exec('ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT "active";'); } catch {}
  try { db.exec('ALTER TABLE users ADD COLUMN institute_name TEXT;'); } catch {}
  try { db.exec('ALTER TABLE tests ADD COLUMN section_id TEXT;'); } catch {}
  try { db.exec('ALTER TABLE test_attempts ADD COLUMN duration_seconds INTEGER NOT NULL DEFAULT 1800;'); } catch {}
  try { db.exec('ALTER TABLE test_attempts ADD COLUMN ai_insights_json TEXT;'); } catch {}

  dbInstance = db;
  return dbInstance;
}
