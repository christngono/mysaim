const express = require('express');
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ─── GET /courses/public  (no auth, for landing/catalog) ─────────────────────
router.get('/public', (req, res) => {
  const formations = db.prepare('SELECT * FROM formations WHERE is_published = 1 ORDER BY order_index').all();
  const result = formations.map(f => {
    const moduleCount = db.prepare('SELECT COUNT(*) as cnt FROM modules WHERE formation_id = ? AND is_published = 1').get(f.id)?.cnt ?? 0;
    let lo = [], ta = [], prg = [];
    try { lo = JSON.parse(f.learning_objectives || '[]') } catch {}
    try { ta = JSON.parse(f.target_audience     || '[]') } catch {}
    try { prg = JSON.parse(f.programme          || '[]') } catch {}
    return { ...f, module_count: moduleCount, learning_objectives: lo, target_audience: ta, programme: prg };
  });
  res.json(result);
});

function getEnrollment(userId, formationId) {
  return db.prepare('SELECT status, enrolled_at, paid_at FROM enrollments WHERE user_id = ? AND formation_id = ?').get(userId, formationId);
}

// Module 0 (premier module, order_index = 0) est gratuit pour les inscrits (trial ou paid)
// Modules suivants nécessitent status = 'paid'
function canAccessModule(userId, module) {
  const enrollment = getEnrollment(userId, module.formation_id);
  if (!enrollment) return false;
  if (enrollment.status === 'paid') return true;
  return module.order_index === 0; // trial = module 1 seulement
}

// ─── GET /courses/formations ──────────────────────────────────────────────────
router.get('/formations', requireAuth, (req, res) => {
  const formations = db.prepare('SELECT * FROM formations ORDER BY order_index').all();

  const result = formations.map(f => {
    const enrollment = getEnrollment(req.user.id, f.id);
    const moduleCount = db.prepare('SELECT COUNT(*) as cnt FROM modules WHERE formation_id = ? AND is_published = 1').get(f.id)?.cnt ?? 0;
    const lessonCount = db.prepare(
      'SELECT COUNT(*) as cnt FROM lessons l JOIN modules m ON l.module_id = m.id WHERE m.formation_id = ? AND l.is_published = 1'
    ).get(f.id)?.cnt ?? 0;
    const completedCount = enrollment ? (db.prepare(`
      SELECT COUNT(*) as cnt FROM user_progress up
      JOIN lessons l ON up.lesson_id = l.id
      JOIN modules m ON l.module_id = m.id
      WHERE up.user_id = ? AND up.completed = 1 AND m.formation_id = ?
    `).get(req.user.id, f.id)?.cnt ?? 0) : 0;
    return {
      ...f,
      enrollment_status: enrollment?.status ?? null,
      enrolled_at: enrollment?.enrolled_at ?? null,
      paid_at: enrollment?.paid_at ?? null,
      module_count: moduleCount,
      lesson_count: lessonCount,
      completed_lessons: completedCount,
      progress_percent: lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0,
    };
  });

  res.json(result);
});

// ─── POST /courses/enroll ─────────────────────────────────────────────────────
// Inscription gratuite (trial) à une formation
router.post('/enroll', requireAuth, (req, res) => {
  const { formation_id } = req.body;
  if (!formation_id) return res.status(400).json({ error: 'formation_id requis' });

  const formation = db.prepare('SELECT id FROM formations WHERE id = ? AND is_published = 1').get(formation_id);
  if (!formation) return res.status(404).json({ error: 'Formation introuvable' });

  db.prepare(`
    INSERT OR IGNORE INTO enrollments (user_id, formation_id, status)
    VALUES (?, ?, 'trial')
  `).run(req.user.id, formation_id);

  res.json({ success: true });
});

// ─── GET /courses/modules  (all modules + lessons + quiz info) ────────────────
router.get('/modules', requireAuth, (req, res) => {
  const formationId = req.query.formation_id ? parseInt(req.query.formation_id) : 1;

  const modules = db.prepare(
    'SELECT * FROM modules WHERE formation_id = ? ORDER BY order_index'
  ).all(formationId);

  const lessons = db.prepare(
    'SELECT * FROM lessons WHERE is_published = 1 ORDER BY module_id, order_index'
  ).all();

  const progress = db.prepare(
    'SELECT lesson_id, completed FROM user_progress WHERE user_id = ?'
  ).all(req.user.id);

  const progressMap = {};
  progress.forEach(p => { progressMap[p.lesson_id] = p.completed; });

  const result = modules.map(m => {
    const accessible = canAccessModule(req.user.id, m);
    const locked = !accessible || m.is_published === 0;
    const needsPayment = !accessible && m.is_published === 1 && m.order_index > 0;

    const quiz = db.prepare('SELECT id, passing_score FROM quizzes WHERE module_id = ? AND is_published = 1').get(m.id);
    let quizInfo = null;
    if (quiz) {
      const best = db.prepare(
        'SELECT score, total, passed FROM quiz_attempts WHERE user_id = ? AND quiz_id = ? ORDER BY score DESC LIMIT 1'
      ).get(req.user.id, quiz.id);
      quizInfo = {
        id: quiz.id,
        passing_score: quiz.passing_score,
        passed: best?.passed === 1,
        best_score: best?.score ?? null,
        total: best?.total ?? 10,
      };
    }

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
      needs_payment: needsPayment,
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

  const module = db.prepare('SELECT * FROM modules WHERE id = ?').get(lesson.module_id);
  if (!module || !canAccessModule(req.user.id, module)) {
    return res.status(403).json({ error: 'Accès refusé', needs_payment: true });
  }

  const progress = db.prepare(
    'SELECT completed FROM user_progress WHERE user_id = ? AND lesson_id = ?'
  ).get(req.user.id, lesson.id);

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

// ─── POST /courses/track-visit ───────────────────────────────────────────────
router.post('/track-visit', requireAuth, (req, res) => {
  db.prepare('INSERT INTO site_visits (user_id) VALUES (?)').run(req.user.id);
  res.json({ ok: true });
});

// ─── POST /courses/waitlist ───────────────────────────────────────────────────
router.post('/waitlist', requireAuth, (req, res) => {
  const { formation_id } = req.body;
  if (!formation_id) return res.status(400).json({ error: 'formation_id requis' });
  db.prepare('INSERT OR IGNORE INTO formation_waitlist (user_id, formation_id) VALUES (?, ?)').run(req.user.id, formation_id);
  res.json({ success: true, message: "Vous êtes bien inscrit(e) sur la liste d'attente. Nous vous contacterons dès que la formation sera disponible." });
});

// ─── GET /courses/waitlist ────────────────────────────────────────────────────
router.get('/waitlist', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT formation_id FROM formation_waitlist WHERE user_id = ?').all(req.user.id);
  res.json(rows.map(r => r.formation_id));
});

// ─── GET /courses/progress  (overall user progress) ──────────────────────────
router.get('/progress', requireAuth, (req, res) => {
  const formationId = req.query.formation_id ? parseInt(req.query.formation_id) : 1;

  const total = db.prepare(`
    SELECT COUNT(*) as cnt FROM lessons l
    JOIN modules m ON l.module_id = m.id
    WHERE m.formation_id = ? AND l.is_published = 1
  `).get(formationId).cnt;

  const done = db.prepare(`
    SELECT COUNT(*) as cnt FROM user_progress up
    JOIN lessons l ON up.lesson_id = l.id
    JOIN modules m ON l.module_id = m.id
    WHERE up.user_id = ? AND up.completed = 1 AND m.formation_id = ?
  `).get(req.user.id, formationId).cnt;

  res.json({ total, completed: done, percent: total > 0 ? Math.round((done / total) * 100) : 0 });
});

module.exports = router;
