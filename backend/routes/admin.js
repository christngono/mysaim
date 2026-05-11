const express = require('express');
const bcrypt  = require('bcryptjs');
const db      = require('../db/database');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ─── USERS ────────────────────────────────────────────────────────────────────
router.get('/users', requireAdmin, (req, res) => {
  const users = db.prepare(`
    SELECT id, email, first_name, last_name, phone, role, post, ai_level,
           activity_sector, is_active, created_at, last_seen
    FROM users ORDER BY created_at DESC
  `).all();

  const enrollments = db.prepare(`
    SELECT e.user_id, e.status, e.enrolled_at, e.paid_at,
           f.id as formation_id, f.title_fr, f.color, f.icon
    FROM enrollments e JOIN formations f ON f.id = e.formation_id
  `).all();

  const now = Date.now();
  const result = users.map(u => ({
    ...u,
    is_online: u.last_seen
      ? (now - new Date(u.last_seen + 'Z').getTime()) < 5 * 60 * 1000
      : false,
    enrollments: enrollments.filter(e => e.user_id === u.id),
  }));

  res.json(result);
});

router.post('/users', requireAdmin, (req, res) => {
  const { first_name, last_name, email, password, role, post, ai_level, phone } = req.body;
  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(`
    INSERT INTO users (first_name, last_name, email, password_hash, role, post, ai_level, phone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(first_name, last_name, email, hash, role || 'user', post || null, ai_level || null, phone || null);

  res.status(201).json({ id: result.lastInsertRowid });
});

router.get('/users/:id', requireAdmin, (req, res) => {
  const user = db.prepare('SELECT id, email, first_name, last_name, phone, role, post, ai_level, learning_objectives, activity_sector, learning_days, is_active, created_at, last_seen FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.put('/users/:id', requireAdmin, (req, res) => {
  const { first_name, last_name, phone, role, post, ai_level, activity_sector, is_active } = req.body;
  db.prepare(`
    UPDATE users SET first_name=?, last_name=?, phone=?, role=?, post=?, ai_level=?,
    activity_sector=?, is_active=?, updated_at=datetime('now') WHERE id=?
  `).run(first_name, last_name, phone, role, post, ai_level, activity_sector, is_active ? 1 : 0, req.params.id);
  res.json({ success: true });
});

router.delete('/users/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ─── FORMATIONS ───────────────────────────────────────────────────────────────
router.get('/formations', requireAdmin, (req, res) => {
  const formations = db.prepare(`
    SELECT f.*,
      (SELECT COUNT(*) FROM enrollments e WHERE e.formation_id = f.id) as enrolled_count,
      (SELECT COUNT(*) FROM modules m WHERE m.formation_id = f.id) as module_count
    FROM formations f ORDER BY f.order_index
  `).all();
  res.json(formations);
});

router.post('/formations', requireAdmin, (req, res) => {
  const {
    title_fr, title_en, description_fr, description_en, price, is_published, order_index,
    learning_objectives, prerequisites, level, duration_hours, teaser_url, target_audience, color, icon, image_url, programme, why_fr,
  } = req.body;
  if (!title_fr) return res.status(400).json({ error: 'title_fr requis' });
  const lo  = Array.isArray(learning_objectives) ? JSON.stringify(learning_objectives) : (learning_objectives || null);
  const ta  = Array.isArray(target_audience)     ? JSON.stringify(target_audience)     : (target_audience || null);
  const prg = Array.isArray(programme)           ? JSON.stringify(programme)           : (programme || null);
  const key = title_fr.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  const result = db.prepare(`
    INSERT INTO formations (key, title_fr, title_en, description_fr, description_en, price, is_published, order_index,
      learning_objectives, prerequisites, level, duration_hours, teaser_url, target_audience, color, icon, image_url, programme, why_fr)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(key, title_fr, title_en || title_fr, description_fr || null, description_en || null,
         price || 25500, is_published ? 1 : 0, order_index || 0,
         lo, prerequisites || null, level || 'débutant', duration_hours || 2,
         teaser_url || null, ta, color || 'blue', icon || '🤖', image_url || null, prg, why_fr || null);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/formations/:id', requireAdmin, (req, res) => {
  const {
    title_fr, title_en, description_fr, description_en, price, is_published, order_index,
    learning_objectives, prerequisites, level, duration_hours, teaser_url, target_audience, color, icon, image_url, programme, why_fr,
  } = req.body;
  const lo  = Array.isArray(learning_objectives) ? JSON.stringify(learning_objectives) : (learning_objectives || null);
  const ta  = Array.isArray(target_audience)     ? JSON.stringify(target_audience)     : (target_audience || null);
  const prg = Array.isArray(programme)           ? JSON.stringify(programme)           : (programme || null);
  db.prepare(`
    UPDATE formations SET title_fr=?, title_en=?, description_fr=?, description_en=?, price=?,
    is_published=?, order_index=?, learning_objectives=?, prerequisites=?, level=?,
    duration_hours=?, teaser_url=?, target_audience=?, color=?, icon=?, image_url=?, programme=?, why_fr=?, updated_at=datetime('now')
    WHERE id=?
  `).run(
    title_fr, title_en, description_fr || null, description_en || null, price || 25500,
    is_published ? 1 : 0, order_index || 0, lo, prerequisites || null, level || 'débutant',
    duration_hours || 0, teaser_url || null, ta, color || 'blue', icon || '🤖', image_url || null, prg, why_fr || null,
    req.params.id
  );
  res.json({ success: true });
});

// ─── WAITLIST ─────────────────────────────────────────────────────────────────
router.get('/waitlist', requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT w.id, w.joined_at, w.formation_id,
           u.id as user_id, u.first_name, u.last_name, u.email, u.phone,
           f.title_fr as formation_title, f.color, f.icon
    FROM formation_waitlist w
    JOIN users u ON u.id = w.user_id
    JOIN formations f ON f.id = w.formation_id
    ORDER BY f.order_index, w.joined_at
  `).all();
  res.json(rows);
});

// ─── MODULES ──────────────────────────────────────────────────────────────────
router.get('/modules', requireAdmin, (req, res) => {
  const formationId = req.query.formation_id ? parseInt(req.query.formation_id) : null;
  const modules = formationId
    ? db.prepare('SELECT * FROM modules WHERE formation_id = ? ORDER BY order_index').all(formationId)
    : db.prepare('SELECT * FROM modules ORDER BY formation_id, order_index').all();
  res.json(modules);
});

router.post('/modules', requireAdmin, (req, res) => {
  const { title_fr, title_en, description_fr, description_en, order_index, formation_id } = req.body;
  const result = db.prepare(`
    INSERT INTO modules (title_fr, title_en, description_fr, description_en, order_index, formation_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(title_fr, title_en, description_fr || null, description_en || null, order_index || 0, formation_id || null);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/modules/:id', requireAdmin, (req, res) => {
  const { title_fr, title_en, description_fr, description_en, order_index, is_published, formation_id } = req.body;
  db.prepare(`
    UPDATE modules SET title_fr=?, title_en=?, description_fr=?, description_en=?,
    order_index=?, is_published=?, formation_id=?, updated_at=datetime('now') WHERE id=?
  `).run(title_fr, title_en, description_fr, description_en, order_index, is_published ? 1 : 0, formation_id || null, req.params.id);
  res.json({ success: true });
});

router.delete('/modules/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM modules WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ─── LESSONS ──────────────────────────────────────────────────────────────────
router.get('/modules/:moduleId/lessons', requireAdmin, (req, res) => {
  const lessons = db.prepare('SELECT * FROM lessons WHERE module_id = ? ORDER BY order_index').all(req.params.moduleId);
  res.json(lessons);
});

router.post('/modules/:moduleId/lessons', requireAdmin, (req, res) => {
  const { title_fr, title_en, content_fr, content_en, order_index } = req.body;
  const contentFrStr = typeof content_fr === 'object' ? JSON.stringify(content_fr) : content_fr;
  const contentEnStr = typeof content_en === 'object' ? JSON.stringify(content_en) : content_en;
  const result = db.prepare(`
    INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_en, order_index)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.params.moduleId, title_fr, title_en, contentFrStr, contentEnStr, order_index || 0);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/lessons/:id', requireAdmin, (req, res) => {
  const { title_fr, title_en, content_fr, content_en, order_index, is_published } = req.body;
  const cfr = typeof content_fr === 'object' ? JSON.stringify(content_fr) : content_fr;
  const cen = typeof content_en === 'object' ? JSON.stringify(content_en) : content_en;
  db.prepare(`
    UPDATE lessons SET title_fr=?, title_en=?, content_fr=?, content_en=?,
    order_index=?, is_published=?, updated_at=datetime('now') WHERE id=?
  `).run(title_fr, title_en, cfr, cen, order_index, is_published ? 1 : 0, req.params.id);
  res.json({ success: true });
});

router.delete('/lessons/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM lessons WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ─── STATS ────────────────────────────────────────────────────────────────────
router.get('/stats', requireAdmin, (req, res) => {
  const stats = {
    total_users:   db.prepare("SELECT COUNT(*) as c FROM users WHERE role='user'").get().c,
    active_users:  db.prepare("SELECT COUNT(*) as c FROM users WHERE role='user' AND is_active=1").get().c,
    total_modules: db.prepare('SELECT COUNT(*) as c FROM modules').get().c,
    total_lessons: db.prepare('SELECT COUNT(*) as c FROM lessons').get().c,
    completions:   db.prepare('SELECT COUNT(*) as c FROM user_progress WHERE completed=1').get().c,
  };
  res.json(stats);
});

// ─── TIME STATS ───────────────────────────────────────────────────────────────
router.get('/time-stats', requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT
      st.user_id,
      u.first_name,
      u.last_name,
      st.section_type,
      st.module_id,
      COALESCE(m.title_fr, 'Module inconnu') AS module_title,
      SUM(st.duration_seconds) AS total_seconds
    FROM section_time st
    JOIN users u ON u.id = st.user_id
    LEFT JOIN modules m ON m.id = st.module_id
    GROUP BY st.user_id, st.section_type, st.module_id
    ORDER BY st.user_id, st.module_id, st.section_type
  `).all();
  res.json(rows);
});

// ─── PROGRESS ─────────────────────────────────────────────────────────────────
router.get('/progress', requireAdmin, (req, res) => {
  const users = db.prepare(`
    SELECT id, first_name, last_name, email, last_seen FROM users WHERE role = 'user' ORDER BY first_name
  `).all();

  const modules  = db.prepare(`
    SELECT m.*, f.title_fr as formation_title, f.color as formation_color, f.icon as formation_icon
    FROM modules m LEFT JOIN formations f ON f.id = m.formation_id ORDER BY m.formation_id, m.order_index
  `).all();
  const formations = db.prepare('SELECT id, title_fr, color, icon FROM formations ORDER BY order_index').all();
  const enrollments = db.prepare(`
    SELECT e.user_id, e.status, e.formation_id, f.title_fr, f.color, f.icon
    FROM enrollments e JOIN formations f ON f.id = e.formation_id
  `).all();
  const lessons  = db.prepare('SELECT * FROM lessons ORDER BY module_id, order_index').all();
  const progress = db.prepare('SELECT user_id, lesson_id, completed, completed_at, started_at FROM user_progress').all();
  const attempts = db.prepare('SELECT user_id, quiz_id, score, total, passed FROM quiz_attempts').all();
  const quizzes  = db.prepare('SELECT * FROM quizzes').all();

  const now = Date.now();

  const result = users.map(u => {
    const userProgress  = progress.filter(p => p.user_id === u.id);
    const userAttempts  = attempts.filter(a => a.user_id === u.id);
    const userEnrollments = enrollments.filter(e => e.user_id === u.id);

    const completedCount = userProgress.filter(p => p.completed).length;
    const totalLessons   = lessons.length;

    const modulesData = modules.map(m => {
      const moduleLessons = lessons.filter(l => l.module_id === m.id);
      const completedInModule = moduleLessons.filter(l =>
        userProgress.find(p => p.lesson_id === l.id && p.completed)
      ).length;
      const quiz = quizzes.find(q => q.module_id === m.id);
      const attempt = quiz ? userAttempts.filter(a => a.quiz_id === quiz.id).sort((a, b) => b.score - a.score)[0] : null;

      return {
        module_id:        m.id,
        module_title:     m.title_fr,
        formation_id:     m.formation_id,
        formation_title:  m.formation_title,
        formation_color:  m.formation_color,
        formation_icon:   m.formation_icon,
        total_lessons:    moduleLessons.length,
        completed:        completedInModule,
        quiz_score:       attempt ? attempt.score : null,
        quiz_total:       attempt ? attempt.total : null,
        quiz_passed:      attempt ? attempt.passed === 1 : false,
        lessons: moduleLessons.map(l => {
          const p = userProgress.find(pr => pr.lesson_id === l.id);
          return {
            lesson_id:    l.id,
            title_fr:     l.title_fr,
            completed:    p ? p.completed === 1 : false,
            completed_at: p ? p.completed_at : null,
            started_at:   p ? p.started_at : null,
          };
        }),
      };
    });

    const lastActivity = userProgress
      .map(p => p.completed_at || p.started_at)
      .filter(Boolean)
      .sort()
      .pop() || null;

    return {
      id:            u.id,
      first_name:    u.first_name,
      last_name:     u.last_name,
      email:         u.email,
      is_online:     u.last_seen
        ? (now - new Date(u.last_seen + 'Z').getTime()) < 5 * 60 * 1000
        : false,
      completed_lessons: completedCount,
      total_lessons:     totalLessons,
      percent:           totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
      last_activity:     lastActivity,
      enrollments:       userEnrollments,
      modules:           modulesData,
    };
  });

  res.json(result);
});

// ─── KPI ──────────────────────────────────────────────────────────────────────
router.get('/kpi', requireAdmin, (req, res) => {
  const total_users  = db.prepare("SELECT COUNT(*) as c FROM users WHERE role='user'").get().c;
  const paid_users   = db.prepare("SELECT COUNT(DISTINCT user_id) as c FROM enrollments WHERE status='paid'").get().c;
  const trial_users  = db.prepare(`
    SELECT COUNT(DISTINCT user_id) as c FROM enrollments WHERE status='trial'
    AND user_id NOT IN (SELECT DISTINCT user_id FROM enrollments WHERE status='paid')
  `).get().c;
  const total_revenue = db.prepare("SELECT COALESCE(SUM(amount),0) as c FROM payments WHERE status='confirmed'").get().c;

  const monthly_revenue = db.prepare(`
    SELECT strftime('%Y-%m', confirmed_at) as month,
           SUM(amount) as total, COUNT(*) as count
    FROM payments WHERE status='confirmed' AND confirmed_at IS NOT NULL
    GROUP BY month ORDER BY month DESC LIMIT 12
  `).all();

  const daily_visits = db.prepare(`
    SELECT strftime('%Y-%m-%d', visited_at) as day,
           COUNT(*) as visits, COUNT(DISTINCT user_id) as unique_users
    FROM site_visits WHERE visited_at >= datetime('now', '-30 days')
    GROUP BY day ORDER BY day DESC
  `).all();

  const monthly_visits = db.prepare(`
    SELECT strftime('%Y-%m', visited_at) as month,
           COUNT(*) as visits, COUNT(DISTINCT user_id) as unique_users
    FROM site_visits WHERE visited_at >= datetime('now', '-12 months')
    GROUP BY month ORDER BY month DESC
  `).all();

  const paid_visit_freq = db.prepare(`
    SELECT u.id, u.first_name, u.last_name,
           COUNT(sv.id) as visit_count,
           MIN(sv.visited_at) as first_visit,
           MAX(sv.visited_at) as last_visit
    FROM users u
    JOIN enrollments e ON e.user_id = u.id AND e.status = 'paid'
    LEFT JOIN site_visits sv ON sv.user_id = u.id
    GROUP BY u.id ORDER BY visit_count DESC
  `).all();

  const formation_stats = db.prepare(`
    SELECT f.id, f.title_fr, f.color, f.icon,
           SUM(CASE WHEN e.status='paid'  THEN 1 ELSE 0 END) as paid_count,
           SUM(CASE WHEN e.status='trial' THEN 1 ELSE 0 END) as trial_count,
           COUNT(e.id) as total_enrolled
    FROM formations f
    LEFT JOIN enrollments e ON e.formation_id = f.id
    GROUP BY f.id ORDER BY f.order_index
  `).all();

  res.json({
    total_users, paid_users, trial_users, total_revenue,
    monthly_revenue, daily_visits, monthly_visits, paid_visit_freq,
    formation_stats,
  });
});

// ─── QUOTES ───────────────────────────────────────────────────────────────────
router.get('/quotes', requireAdmin, (req, res) => {
  const quotes = db.prepare('SELECT * FROM quote_requests ORDER BY created_at DESC').all();
  res.json(quotes);
});

router.delete('/quotes/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM quote_requests WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ─── QUIZZES ──────────────────────────────────────────────────────────────────
router.get('/quizzes', requireAdmin, (req, res) => {
  const quizzes = db.prepare(`
    SELECT q.*, m.title_fr AS module_title,
           (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) AS question_count
    FROM quizzes q
    JOIN modules m ON m.id = q.module_id
    ORDER BY m.order_index, q.id
  `).all();
  res.json(quizzes);
});

router.post('/quizzes', requireAdmin, (req, res) => {
  const { module_id, title_fr, title_en, passing_score } = req.body;
  const result = db.prepare(`
    INSERT INTO quizzes (module_id, title_fr, title_en, passing_score)
    VALUES (?, ?, ?, ?)
  `).run(module_id, title_fr, title_en, passing_score || 7);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/quizzes/:id', requireAdmin, (req, res) => {
  const { title_fr, title_en, passing_score, is_published } = req.body;
  db.prepare(`
    UPDATE quizzes SET title_fr=?, title_en=?, passing_score=?, is_published=? WHERE id=?
  `).run(title_fr, title_en, passing_score, is_published ? 1 : 0, req.params.id);
  res.json({ success: true });
});

router.delete('/quizzes/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM quizzes WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.get('/quizzes/:id/questions', requireAdmin, (req, res) => {
  const questions = db.prepare('SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index').all(req.params.id);
  const result = questions.map(q => ({
    ...q,
    choices: db.prepare('SELECT * FROM quiz_choices WHERE question_id = ? ORDER BY order_index').all(q.id),
  }));
  res.json(result);
});

router.post('/quizzes/:id/questions', requireAdmin, (req, res) => {
  const { question_fr, question_en, explanation_fr, explanation_en, choices } = req.body;
  const qResult = db.prepare(`
    INSERT INTO quiz_questions (quiz_id, question_fr, question_en, explanation_fr, explanation_en)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.params.id, question_fr, question_en, explanation_fr || '', explanation_en || '');

  const questionId = qResult.lastInsertRowid;
  if (Array.isArray(choices)) {
    choices.forEach((c, i) => {
      db.prepare(`
        INSERT INTO quiz_choices (question_id, text_fr, text_en, is_correct, order_index)
        VALUES (?, ?, ?, ?, ?)
      `).run(questionId, c.text_fr, c.text_en, c.is_correct ? 1 : 0, i);
    });
  }

  res.status(201).json({ id: questionId });
});

router.delete('/questions/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM quiz_questions WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ─── Q&A ADMIN ────────────────────────────────────────────────────────────────

// GET /api/admin/questions — all questions with user info and module title
router.get('/questions', requireAdmin, (req, res) => {
  const questions = db.prepare(`
    SELECT mq.*,
           u.first_name || ' ' || u.last_name AS user_name,
           u.email AS user_email,
           m.title_fr AS module_title_fr,
           m.title_en AS module_title_en
    FROM module_questions mq
    JOIN users u ON u.id = mq.user_id
    JOIN modules m ON m.id = mq.module_id
    ORDER BY mq.created_at DESC
  `).all();
  res.json(questions);
});

// PUT /api/admin/questions/:id/answer
router.put('/questions/:id/answer', requireAdmin, (req, res) => {
  const { answer } = req.body;
  if (!answer) return res.status(400).json({ error: 'answer required' });

  const question = db.prepare('SELECT * FROM module_questions WHERE id = ?').get(req.params.id);
  if (!question) return res.status(404).json({ error: 'Question not found' });

  db.prepare(`
    UPDATE module_questions
    SET answer = ?, answered_by = ?, answered_at = datetime('now')
    WHERE id = ?
  `).run(answer, req.user.id, req.params.id);

  // Create notification for user
  db.prepare(`
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (?, 'qa_answer', 'Réponse à votre question', ?, ?)
  `).run(
    question.user_id,
    `Un formateur a répondu à votre question sur le module.`,
    JSON.stringify({ question_id: question.id, module_id: question.module_id })
  );

  res.json({ success: true });
});

// DELETE /api/admin/questions/:id
router.delete('/questions/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM module_questions WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ─── EXERCISES ADMIN ──────────────────────────────────────────────────────────

// GET /api/admin/exercises
router.get('/exercises', requireAdmin, (req, res) => {
  const exercises = db.prepare(`
    SELECT e.*, m.title_fr AS module_title_fr,
           (SELECT COUNT(*) FROM exercise_questions WHERE exercise_id = e.id) AS question_count
    FROM exercises e
    JOIN modules m ON m.id = e.module_id
    ORDER BY m.order_index, e.id
  `).all();
  res.json(exercises);
});

// POST /api/admin/exercises
router.post('/exercises', requireAdmin, (req, res) => {
  const { module_id, title_fr, title_en, instructions_fr, instructions_en } = req.body;
  if (!module_id || !title_fr || !title_en) return res.status(400).json({ error: 'Missing required fields' });

  const result = db.prepare(`
    INSERT INTO exercises (module_id, title_fr, title_en, instructions_fr, instructions_en)
    VALUES (?, ?, ?, ?, ?)
  `).run(module_id, title_fr, title_en, instructions_fr || null, instructions_en || null);

  res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /api/admin/exercises/:id
router.put('/exercises/:id', requireAdmin, (req, res) => {
  const { module_id, title_fr, title_en, instructions_fr, instructions_en, is_published } = req.body;
  db.prepare(`
    UPDATE exercises SET module_id=?, title_fr=?, title_en=?, instructions_fr=?, instructions_en=?, is_published=?
    WHERE id=?
  `).run(module_id, title_fr, title_en, instructions_fr || null, instructions_en || null, is_published ? 1 : 0, req.params.id);
  res.json({ success: true });
});

// DELETE /api/admin/exercises/:id
router.delete('/exercises/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM exercises WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// POST /api/admin/exercises/:id/questions
router.post('/exercises/:id/questions', requireAdmin, (req, res) => {
  const { question_fr, question_en, order_index } = req.body;
  if (!question_fr || !question_en) return res.status(400).json({ error: 'question_fr and question_en required' });

  const result = db.prepare(`
    INSERT INTO exercise_questions (exercise_id, question_fr, question_en, order_index)
    VALUES (?, ?, ?, ?)
  `).run(req.params.id, question_fr, question_en, order_index || 0);

  res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /api/admin/exercise-questions/:id
router.put('/exercise-questions/:id', requireAdmin, (req, res) => {
  const { question_fr, question_en, order_index } = req.body;
  db.prepare(`
    UPDATE exercise_questions SET question_fr=?, question_en=?, order_index=?
    WHERE id=?
  `).run(question_fr, question_en, order_index ?? 0, req.params.id);
  res.json({ success: true });
});

// DELETE /api/admin/exercise-questions/:id
router.delete('/exercise-questions/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM exercise_questions WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// GET /api/admin/exercises/:id/submissions
router.get('/exercises/:id/submissions', requireAdmin, (req, res) => {
  const submissions = db.prepare(`
    SELECT es.*,
           u.first_name || ' ' || u.last_name AS user_name,
           u.email AS user_email
    FROM exercise_submissions es
    JOIN users u ON u.id = es.user_id
    WHERE es.exercise_id = ?
    ORDER BY es.submitted_at DESC
  `).all(req.params.id);

  const result = submissions.map(s => {
    try { s.answers = JSON.parse(s.answers); } catch {}
    return s;
  });

  res.json(result);
});

// PUT /api/admin/submissions/:id/grade
router.put('/submissions/:id/grade', requireAdmin, (req, res) => {
  const { grade, feedback } = req.body;

  const submission = db.prepare(`
    SELECT es.*, e.title_fr AS exercise_title
    FROM exercise_submissions es
    JOIN exercises e ON e.id = es.exercise_id
    WHERE es.id = ?
  `).get(req.params.id);

  if (!submission) return res.status(404).json({ error: 'Submission not found' });

  db.prepare(`
    UPDATE exercise_submissions
    SET grade=?, feedback=?, graded_at=datetime('now')
    WHERE id=?
  `).run(grade || null, feedback || null, req.params.id);

  // Create notification for user
  db.prepare(`
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (?, 'exercise_graded', 'Exercice évalué', ?, ?)
  `).run(
    submission.user_id,
    `Votre exercice "${submission.exercise_title}" a été évalué${grade ? ` — Note : ${grade}` : ''}.`,
    JSON.stringify({ submission_id: submission.id, exercise_id: submission.exercise_id })
  );

  res.json({ success: true });
});

// ─── CERTIFICATES ADMIN ───────────────────────────────────────────────────────

// POST /api/admin/users/:userId/certificate
router.post('/users/:userId/certificate', requireAdmin, (req, res) => {
  const { file_url } = req.body;
  if (!file_url) return res.status(400).json({ error: 'file_url required' });

  const user = db.prepare('SELECT id, first_name, last_name FROM users WHERE id = ?').get(req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const result = db.prepare(`
    INSERT INTO certificates (user_id, file_url) VALUES (?, ?)
  `).run(req.params.userId, file_url);

  // Create notification for user
  db.prepare(`
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (?, 'certificate', 'Certificat disponible', ?, ?)
  `).run(
    req.params.userId,
    'Votre certificat de formation SAIM est disponible en téléchargement.',
    JSON.stringify({ certificate_id: result.lastInsertRowid, file_url })
  );

  res.status(201).json({ id: result.lastInsertRowid });
});

// GET /api/admin/users/:userId/certificates
router.get('/users/:userId/certificates', requireAdmin, (req, res) => {
  const certs = db.prepare(`
    SELECT * FROM certificates WHERE user_id = ? ORDER BY issued_at DESC
  `).all(req.params.userId);
  res.json(certs);
});

// ─── GET questions of an exercise (admin view, includes all details) ───────────
router.get('/exercises/:id/questions', requireAdmin, (req, res) => {
  const questions = db.prepare(
    'SELECT * FROM exercise_questions WHERE exercise_id = ? ORDER BY order_index'
  ).all(req.params.id);
  res.json(questions);
});

// ─── MARK LESSON COMPLETE FOR USER ───────────────────────────────────────────
router.post('/users/:userId/progress/complete', requireAdmin, (req, res) => {
  const { lesson_id } = req.body;
  if (!lesson_id) return res.status(400).json({ error: 'Missing lesson_id' });
  db.prepare(`
    INSERT INTO user_progress (user_id, lesson_id, completed, completed_at, started_at)
    VALUES (?, ?, 1, datetime('now'), datetime('now'))
    ON CONFLICT(user_id, lesson_id) DO UPDATE
    SET completed = 1, completed_at = COALESCE(completed_at, datetime('now'))
  `).run(req.params.userId, lesson_id);
  res.json({ success: true });
});

// ─── RESET USER PROGRESS ──────────────────────────────────────────────────────
// DELETE /api/admin/users/:userId/progress
// Body: { scope: 'all' }  OR  { scope: 'module', module_id: N }
router.delete('/users/:userId/progress', requireAdmin, (req, res) => {
  const userId = req.params.userId;
  const { scope, module_id } = req.body;

  if (scope === 'all') {
    // Erase all lesson progress
    db.prepare('DELETE FROM user_progress WHERE user_id = ?').run(userId);
    // Erase all quiz attempts
    db.prepare('DELETE FROM quiz_attempts WHERE user_id = ?').run(userId);
    // Erase all exercise submissions
    db.prepare('DELETE FROM exercise_submissions WHERE user_id = ?').run(userId);

    return res.json({ success: true, scope: 'all' });
  }

  if (scope === 'module' && module_id) {
    // Lesson progress for lessons in this module
    db.prepare(`
      DELETE FROM user_progress
      WHERE user_id = ? AND lesson_id IN (
        SELECT id FROM lessons WHERE module_id = ?
      )
    `).run(userId, module_id);

    // Quiz attempts for this module's quiz
    db.prepare(`
      DELETE FROM quiz_attempts
      WHERE user_id = ? AND quiz_id IN (
        SELECT id FROM quizzes WHERE module_id = ?
      )
    `).run(userId, module_id);

    // Exercise submissions for this module's exercise
    db.prepare(`
      DELETE FROM exercise_submissions
      WHERE user_id = ? AND exercise_id IN (
        SELECT id FROM exercises WHERE module_id = ?
      )
    `).run(userId, module_id);

    return res.json({ success: true, scope: 'module', module_id });
  }

  return res.status(400).json({ error: 'scope must be "all" or "module" with module_id' });
});

// ─── GET /admin/codes ─────────────────────────────────────────────────────────
router.get('/codes', requireAdmin, (req, res) => {
  const codes = db.prepare(`
    SELECT ac.*, f.title_fr as formation_title,
           u.email as used_by_email, u.first_name as used_by_first
    FROM activation_codes ac
    JOIN formations f ON ac.formation_id = f.id
    LEFT JOIN users u ON ac.used_by = u.id
    ORDER BY ac.created_at DESC
  `).all();
  res.json(codes);
});

// ─── POST /admin/codes ────────────────────────────────────────────────────────
router.post('/codes', requireAdmin, (req, res) => {
  const { formation_id, count = 1 } = req.body;
  if (!formation_id) return res.status(400).json({ error: 'formation_id requis' });
  const n = Math.min(parseInt(count) || 1, 50);

  function makeCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = 'SAIM-';
    for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
    s += '-';
    for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  }

  const codes = [];
  for (let i = 0; i < n; i++) {
    let code, tries = 0;
    do { code = makeCode(); tries++; } while (
      db.prepare('SELECT 1 FROM activation_codes WHERE code = ?').get(code) && tries < 20
    );
    db.prepare('INSERT INTO activation_codes (code, formation_id, created_by) VALUES (?, ?, ?)')
      .run(code, formation_id, req.user.id);
    codes.push(code);
  }
  res.json({ codes });
});

// ─── DELETE /admin/codes/:id ──────────────────────────────────────────────────
router.delete('/codes/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM activation_codes WHERE id = ? AND used_by IS NULL').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
