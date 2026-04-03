const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'saim.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDB() {
  db.exec(`
    -- ===================== USERS =====================
    CREATE TABLE IF NOT EXISTS users (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      email           TEXT    NOT NULL UNIQUE,
      first_name      TEXT    NOT NULL,
      last_name       TEXT    NOT NULL,
      phone           TEXT,
      password_hash   TEXT    NOT NULL,
      role            TEXT    NOT NULL DEFAULT 'user',   -- 'user' | 'admin'
      post            TEXT,
      ai_level        INTEGER CHECK(ai_level BETWEEN 1 AND 5),
      learning_objectives TEXT,
      activity_sector TEXT,
      learning_days   TEXT,                              -- JSON array e.g. ["Lundi","Mercredi"]
      is_active       INTEGER NOT NULL DEFAULT 1,
      created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ===================== MODULES =====================
    CREATE TABLE IF NOT EXISTS modules (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title_fr    TEXT NOT NULL,
      title_en    TEXT NOT NULL,
      description_fr TEXT,
      description_en TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ===================== LESSONS =====================
    CREATE TABLE IF NOT EXISTS lessons (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id   INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      title_fr    TEXT NOT NULL,
      title_en    TEXT NOT NULL,
      content_fr  TEXT NOT NULL,
      content_en  TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ===================== USER PROGRESS =====================
    CREATE TABLE IF NOT EXISTS user_progress (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lesson_id   INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      completed   INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      UNIQUE(user_id, lesson_id)
    );

    -- ===================== QUIZZES =====================
    CREATE TABLE IF NOT EXISTS quizzes (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id     INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      title_fr      TEXT NOT NULL,
      title_en      TEXT NOT NULL,
      passing_score INTEGER NOT NULL DEFAULT 7,
      is_published  INTEGER NOT NULL DEFAULT 1,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ===================== QUIZ QUESTIONS =====================
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id     INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      question_fr TEXT NOT NULL,
      question_en TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0
    );

    -- ===================== QUIZ CHOICES =====================
    CREATE TABLE IF NOT EXISTS quiz_choices (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
      text_fr     TEXT NOT NULL,
      text_en     TEXT NOT NULL,
      is_correct  INTEGER NOT NULL DEFAULT 0,
      order_index INTEGER NOT NULL DEFAULT 0
    );

    -- ===================== QUIZ ATTEMPTS =====================
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      quiz_id      INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      score        INTEGER NOT NULL DEFAULT 0,
      total        INTEGER NOT NULL DEFAULT 10,
      passed       INTEGER NOT NULL DEFAULT 0,
      answers      TEXT    NOT NULL DEFAULT '{}',
      completed_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ===================== INDEXES =====================
    CREATE INDEX IF NOT EXISTS idx_users_email         ON users(email);
    CREATE INDEX IF NOT EXISTS idx_lessons_module      ON lessons(module_id);
    CREATE INDEX IF NOT EXISTS idx_progress_user       ON user_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_progress_lesson     ON user_progress(lesson_id);
    CREATE INDEX IF NOT EXISTS idx_quiz_module         ON quizzes(module_id);
    CREATE INDEX IF NOT EXISTS idx_attempts_user       ON quiz_attempts(user_id);
    CREATE INDEX IF NOT EXISTS idx_attempts_quiz       ON quiz_attempts(quiz_id);
  `);

  // ─── Migrations (add columns if not exist) ──────────────────────────────────
  try { db.exec('ALTER TABLE quiz_questions ADD COLUMN explanation_fr TEXT NOT NULL DEFAULT ""'); } catch {}
  try { db.exec('ALTER TABLE quiz_questions ADD COLUMN explanation_en TEXT NOT NULL DEFAULT ""'); } catch {}
  try { db.exec('ALTER TABLE users ADD COLUMN last_seen TEXT'); } catch {}
  try { db.exec('ALTER TABLE user_progress ADD COLUMN started_at TEXT'); } catch {}

  db.exec(`
    CREATE TABLE IF NOT EXISTS quote_requests (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL,
      message    TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ─── Q&A tables ─────────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS module_questions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      module_id   INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      question    TEXT NOT NULL,
      answer      TEXT,
      answered_by INTEGER REFERENCES users(id),
      answered_at TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type       TEXT NOT NULL,
      title      TEXT NOT NULL,
      message    TEXT NOT NULL,
      data       TEXT DEFAULT '{}',
      is_read    INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ─── Exercise tables ─────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS exercises (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id        INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      title_fr         TEXT NOT NULL,
      title_en         TEXT NOT NULL,
      instructions_fr  TEXT,
      instructions_en  TEXT,
      is_published     INTEGER NOT NULL DEFAULT 1,
      created_at       TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS exercise_questions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
      question_fr TEXT NOT NULL,
      question_en TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS exercise_submissions (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      exercise_id  INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
      answers      TEXT NOT NULL DEFAULT '{}',
      feedback     TEXT,
      grade        TEXT,
      graded_at    TEXT,
      submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, exercise_id)
    );
  `);

  // ─── Certificate table ────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS certificates (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      file_url  TEXT NOT NULL,
      issued_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  console.log('✅ Database initialized');
}

initDB();
module.exports = db;