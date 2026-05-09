const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../db/database');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// ─── POST /auth/register ──────────────────────────────────────────────────────
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('first_name').trim().notEmpty(),
  body('last_name').trim().notEmpty(),
  body('password').isLength({ min: 6 }),
  body('ai_level').optional().isInt({ min: 1, max: 5 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const {
    email, first_name, last_name, phone, password,
    post, ai_level, learning_objectives, activity_sector, learning_days
  } = req.body;

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const password_hash = bcrypt.hashSync(password, 10);
  const days = Array.isArray(learning_days) ? JSON.stringify(learning_days) : (learning_days || null);

  const result = db.prepare(`
    INSERT INTO users
      (email, first_name, last_name, phone, password_hash, post, ai_level,
       learning_objectives, activity_sector, learning_days)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(email, first_name, last_name, phone || null, password_hash,
         post || null, ai_level || null, learning_objectives || null,
         activity_sector || null, days);

  const user = db.prepare('SELECT id, email, first_name, last_name, role FROM users WHERE id = ?')
                 .get(result.lastInsertRowid);

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user });
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').get(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password_hash, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// ─── GET /auth/me ─────────────────────────────────────────────────────────────
router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare(
    'SELECT id, email, first_name, last_name, phone, role, post, ai_level, learning_objectives, activity_sector, learning_days, created_at FROM users WHERE id = ?'
  ).get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const enrollments = db.prepare(
    'SELECT formation_id, status, enrolled_at, paid_at FROM enrollments WHERE user_id = ?'
  ).all(req.user.id);

  // Auto-enroll new users in formation 1 (trial) if not yet enrolled
  if (!enrollments.find(e => e.formation_id === 1)) {
    db.prepare(`INSERT OR IGNORE INTO enrollments (user_id, formation_id, status) VALUES (?, 1, 'trial')`).run(req.user.id);
    enrollments.push({ formation_id: 1, status: 'trial', enrolled_at: new Date().toISOString(), paid_at: null });
  }

  res.json({ ...user, enrollments });
});

// ─── POST /auth/register  (override to auto-enroll on formation 1) ────────────
// Already handled above via /auth/me hydration — new users get trial on first /me call

module.exports = router;