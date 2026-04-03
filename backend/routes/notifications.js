const express = require('express');
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications — user gets their notifications
router.get('/', requireAuth, (req, res) => {
  const notifications = db.prepare(`
    SELECT * FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `).all(req.user.id);

  res.json(notifications);
});

// GET /api/notifications/count — unread count
router.get('/count', requireAuth, (req, res) => {
  const row = db.prepare(`
    SELECT COUNT(*) as count FROM notifications
    WHERE user_id = ? AND is_read = 0
  `).get(req.user.id);

  res.json({ count: row.count });
});

// PUT /api/notifications/:id/read — mark as read
router.put('/:id/read', requireAuth, (req, res) => {
  db.prepare(`
    UPDATE notifications SET is_read = 1
    WHERE id = ? AND user_id = ?
  `).run(req.params.id, req.user.id);

  res.json({ success: true });
});

// PUT /api/notifications/read-all — mark all as read
router.put('/read-all', requireAuth, (req, res) => {
  db.prepare(`
    UPDATE notifications SET is_read = 1
    WHERE user_id = ?
  `).run(req.user.id);

  res.json({ success: true });
});

module.exports = router;
