const express = require('express');
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/exercises/module/:moduleId — get published exercise for module
router.get('/module/:moduleId', requireAuth, (req, res) => {
  const exercise = db.prepare(`
    SELECT * FROM exercises
    WHERE module_id = ? AND is_published = 1
    LIMIT 1
  `).get(req.params.moduleId);

  if (!exercise) return res.status(404).json({ error: 'No exercise for this module' });

  const questions = db.prepare(`
    SELECT * FROM exercise_questions
    WHERE exercise_id = ?
    ORDER BY order_index
  `).all(exercise.id);

  const submission = db.prepare(`
    SELECT * FROM exercise_submissions
    WHERE user_id = ? AND exercise_id = ?
  `).get(req.user.id, exercise.id);

  res.json({
    ...exercise,
    questions,
    submission: submission || null,
  });
});

// POST /api/exercises/:exerciseId/submit — submit answers
router.post('/:exerciseId/submit', requireAuth, (req, res) => {
  const { answers } = req.body;
  if (!answers) return res.status(400).json({ error: 'answers required' });

  const exercise = db.prepare('SELECT id FROM exercises WHERE id = ?').get(req.params.exerciseId);
  if (!exercise) return res.status(404).json({ error: 'Exercise not found' });

  const existing = db.prepare(`
    SELECT id FROM exercise_submissions WHERE user_id = ? AND exercise_id = ?
  `).get(req.user.id, req.params.exerciseId);

  if (existing) {
    return res.status(409).json({ error: 'Already submitted' });
  }

  const result = db.prepare(`
    INSERT INTO exercise_submissions (user_id, exercise_id, answers)
    VALUES (?, ?, ?)
  `).run(req.user.id, req.params.exerciseId, JSON.stringify(answers));

  res.status(201).json({ id: result.lastInsertRowid });
});

// GET /api/exercises/:exerciseId/my-submission — get user's submission + feedback
router.get('/:exerciseId/my-submission', requireAuth, (req, res) => {
  const submission = db.prepare(`
    SELECT * FROM exercise_submissions
    WHERE user_id = ? AND exercise_id = ?
  `).get(req.user.id, req.params.exerciseId);

  if (!submission) return res.status(404).json({ error: 'No submission found' });

  try {
    submission.answers = JSON.parse(submission.answers);
  } catch {}

  res.json(submission);
});

module.exports = router;
