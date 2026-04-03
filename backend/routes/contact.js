const express = require('express');
const db      = require('../db/database');
const router  = express.Router();

router.post('/', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  db.prepare('INSERT INTO quote_requests (name, email, message) VALUES (?, ?, ?)').run(name, email, message);
  res.json({ success: true });
});

module.exports = router;
