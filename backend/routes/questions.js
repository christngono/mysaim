const express = require('express');
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/questions — user posts a question
router.post('/', requireAuth, (req, res) => {
  const { module_id, question } = req.body;
  if (!module_id || !question) {
    return res.status(400).json({ error: 'module_id and question are required' });
  }
  const mod = db.prepare('SELECT id FROM modules WHERE id = ?').get(module_id);
  if (!mod) return res.status(404).json({ error: 'Module not found' });

  const result = db.prepare(`
    INSERT INTO module_questions (user_id, module_id, question)
    VALUES (?, ?, ?)
  `).run(req.user.id, module_id, question);

  res.status(201).json({ id: result.lastInsertRowid });
});

// GET /api/questions/my — user gets their own questions (with answers)
router.get('/my', requireAuth, (req, res) => {
  const questions = db.prepare(`
    SELECT mq.*, m.title_fr AS module_title_fr, m.title_en AS module_title_en
    FROM module_questions mq
    JOIN modules m ON m.id = mq.module_id
    WHERE mq.user_id = ?
    ORDER BY mq.created_at DESC
  `).all(req.user.id);

  res.json(questions);
});

module.exports = router;
