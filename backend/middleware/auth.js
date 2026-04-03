const jwt = require('jsonwebtoken');
const db  = require('../db/database');
const JWT_SECRET = process.env.JWT_SECRET || 'saim_jwt_secret_2025';

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    db.prepare("UPDATE users SET last_seen = datetime('now') WHERE id = ?").run(req.user.id);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}

module.exports = { requireAuth, requireAdmin, JWT_SECRET };
