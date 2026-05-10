const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dns = require('dns').promises;
const { body, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const db = require('../db/database');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

function strongPassword(value) {
  if (value.length < 8)        throw new Error('8 caractères minimum');
  if (!/[A-Z]/.test(value))   throw new Error('Au moins une majuscule');
  if (!/[a-z]/.test(value))   throw new Error('Au moins une minuscule');
  if (!/[0-9]/.test(value))   throw new Error('Au moins un chiffre');
  return true;
}

// ─── POST /auth/register ──────────────────────────────────────────────────────
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('first_name').trim().notEmpty(),
  body('last_name').trim().notEmpty(),
  body('password').custom(strongPassword),
  body('ai_level').optional().isInt({ min: 1, max: 5 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, first_name, last_name, phone, password, post, ai_level, activity_sector } = req.body;

  // Verify the email domain has MX records (basic existence check)
  const domain = email.split('@')[1];
  try {
    const mx = await dns.resolveMx(domain);
    if (!mx || mx.length === 0) throw new Error('no MX');
  } catch {
    return res.status(400).json({ error: 'Adresse email invalide ou domaine inexistant' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Cet email est déjà utilisé' });

  const password_hash = bcrypt.hashSync(password, 10);

  const result = db.prepare(`
    INSERT INTO users (email, first_name, last_name, phone, password_hash, post, ai_level, activity_sector)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(email, first_name, last_name, phone || null, password_hash,
         post || null, ai_level || null, activity_sector || null);

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
  if (!user) return res.status(401).json({ error: 'Identifiants incorrects' });

  // Google-only accounts can't login with password
  if (user.password_hash === 'GOOGLE_OAUTH') {
    return res.status(401).json({ error: 'Ce compte utilise la connexion Google' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Identifiants incorrects' });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password_hash, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// ─── POST /auth/google ────────────────────────────────────────────────────────
router.post('/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'Credential manquant' });

  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId, email, given_name, family_name } = ticket.getPayload();

    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      const result = db.prepare(`
        INSERT INTO users (email, first_name, last_name, password_hash, google_id)
        VALUES (?, ?, ?, 'GOOGLE_OAUTH', ?)
      `).run(email, given_name || email.split('@')[0], family_name || '', googleId);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    } else if (!user.google_id) {
      db.prepare('UPDATE users SET google_id = ? WHERE id = ?').run(googleId, user.id);
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error('Google OAuth error:', err.message);
    res.status(401).json({ error: 'Authentification Google échouée' });
  }
});

// ─── GET /auth/me ─────────────────────────────────────────────────────────────
router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare(
    'SELECT id, email, first_name, last_name, phone, role, post, ai_level, activity_sector, created_at FROM users WHERE id = ?'
  ).get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const enrollments = db.prepare(
    'SELECT formation_id, status, enrolled_at, paid_at FROM enrollments WHERE user_id = ?'
  ).all(req.user.id);

  if (!enrollments.find(e => e.formation_id === 1)) {
    db.prepare(`INSERT OR IGNORE INTO enrollments (user_id, formation_id, status) VALUES (?, 1, 'trial')`).run(req.user.id);
    enrollments.push({ formation_id: 1, status: 'trial', enrolled_at: new Date().toISOString(), paid_at: null });
  }

  res.json({ ...user, enrollments });
});

module.exports = router;
