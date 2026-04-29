const express = require('express');
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ─── GET /courses/modules  (all modules + lessons + quiz info) ────────────────
router.get('/modules', requireAuth, (req, res) => {
  const modules = db.prepare('SELECT * FROM modules ORDER BY order_index').all();

  const lessons = db.prepare(
    'SELECT * FROM lessons WHERE is_published = 1 ORDER BY module_id, order_index'
  ).all();

  const progress = db.prepare(
    'SELECT lesson_id, completed FROM user_progress WHERE user_id = ?'
  ).all(req.user.id);

  const progressMap = {};
  progress.forEach(p => { progressMap[p.lesson_id] = p.completed; });

  const result = modules.map(m => {
    const locked = m.is_published === 0;

    const quiz = db.prepare('SELECT id, passing_score FROM quizzes WHERE module_id = ? AND is_published = 1').get(m.id);
    let quizInfo = null;
    if (quiz) {
      const best = db.prepare(
        'SELECT score, total, passed FROM quiz_attempts WHERE user_id = ? AND quiz_id = ? ORDER BY score DESC LIMIT 1'
      ).get(req.user.id, quiz.id);
      quizInfo = {
        id:            quiz.id,
        passing_score: quiz.passing_score,
        passed:        best?.passed === 1,
        best_score:    best?.score ?? null,
        total:         best?.total ?? 10,
      };
    }

    // Exercise info
    const exercise = db.prepare('SELECT id, title_fr, title_en FROM exercises WHERE module_id = ? AND is_published = 1 LIMIT 1').get(m.id);
    let exerciseInfo = null;
    if (exercise) {
      const sub = db.prepare('SELECT id FROM exercise_submissions WHERE user_id = ? AND exercise_id = ?').get(req.user.id, exercise.id);
      exerciseInfo = {
        id: exercise.id,
        title_fr: exercise.title_fr,
        title_en: exercise.title_en,
        submitted: !!sub,
      };
    }

    return {
      ...m,
      locked,
      quiz: quizInfo,
      exercise: exerciseInfo,
      lessons: locked ? [] : lessons
        .filter(l => l.module_id === m.id)
        .map(l => ({
          id: l.id,
          module_id: l.module_id,
          title_fr: l.title_fr,
          title_en: l.title_en,
          order_index: l.order_index,
          completed: progressMap[l.id] === 1
        }))
    };
  });

  res.json(result);
});

// ─── GET /courses/lessons/:id  (full lesson content) ─────────────────────────
router.get('/lessons/:id', requireAuth, (req, res) => {
  const lesson = db.prepare('SELECT * FROM lessons WHERE id = ? AND is_published = 1').get(req.params.id);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

  const progress = db.prepare(
    'SELECT completed FROM user_progress WHERE user_id = ? AND lesson_id = ?'
  ).get(req.user.id, lesson.id);

  // Track started_at
  db.prepare(`
    INSERT INTO user_progress (user_id, lesson_id, started_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(user_id, lesson_id) DO UPDATE
    SET started_at = COALESCE(started_at, datetime('now'))
  `).run(req.user.id, lesson.id);

  try {
    lesson.content_fr = JSON.parse(lesson.content_fr);
    lesson.content_en = JSON.parse(lesson.content_en);
  } catch {}

  res.json({ ...lesson, completed: progress?.completed === 1 });
});

// ─── POST /courses/lessons/:id/complete ──────────────────────────────────────
router.post('/lessons/:id/complete', requireAuth, (req, res) => {
  const lesson = db.prepare('SELECT id FROM lessons WHERE id = ?').get(req.params.id);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

  db.prepare(`
    INSERT INTO user_progress (user_id, lesson_id, completed, completed_at)
    VALUES (?, ?, 1, datetime('now'))
    ON CONFLICT(user_id, lesson_id) DO UPDATE SET completed = 1, completed_at = datetime('now')
  `).run(req.user.id, lesson.id);

  res.json({ success: true });
});

// ─── POST /courses/track-time ────────────────────────────────────────────────
router.post('/track-time', requireAuth, (req, res) => {
  const { section_type, section_id, module_id, duration_seconds } = req.body;
  if (!section_type || !section_id || !duration_seconds || duration_seconds < 5) {
    return res.json({ ok: true });
  }
  db.prepare(`
    INSERT INTO section_time (user_id, section_type, section_id, module_id, duration_seconds)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.user.id, section_type, section_id, module_id || null, Math.min(duration_seconds, 86400));
  res.json({ ok: true });
});

// ─── GET /courses/progress  (overall user progress) ──────────────────────────
router.get('/progress', requireAuth, (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as cnt FROM lessons WHERE is_published = 1').get().cnt;
  const done  = db.prepare(
    'SELECT COUNT(*) as cnt FROM user_progress WHERE user_id = ? AND completed = 1'
  ).get(req.user.id).cnt;

  res.json({ total, completed: done, percent: total > 0 ? Math.round((done / total) * 100) : 0 });
});

module.exports = router;