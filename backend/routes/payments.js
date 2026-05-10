const express = require('express');
const crypto = require('crypto');
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const CAMPAY_BASE_URL = process.env.CAMPAY_BASE_URL || 'https://app.campay.net/api';

async function getCampayToken() {
  const res = await fetch(`${CAMPAY_BASE_URL}/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: process.env.CAMPAY_APP_USERNAME,
      password: process.env.CAMPAY_APP_PASSWORD,
    }),
  });
  if (!res.ok) throw new Error('CampPay auth failed');
  const data = await res.json();
  return data.token;
}

// ─── POST /payments/initiate ──────────────────────────────────────────────────
router.post('/initiate', requireAuth, async (req, res) => {
  const { formation_id, phone, operator } = req.body;

  if (!formation_id || !phone || !operator) {
    return res.status(400).json({ error: 'formation_id, phone et operator sont requis' });
  }
  if (!['MTN', 'ORANGE'].includes(operator)) {
    return res.status(400).json({ error: 'Opérateur invalide' });
  }

  const formation = db.prepare('SELECT id, price, title_fr FROM formations WHERE id = ? AND is_published = 1').get(formation_id);
  if (!formation) return res.status(404).json({ error: 'Formation introuvable' });

  // Vérifier si déjà payé
  const existing = db.prepare('SELECT status FROM enrollments WHERE user_id = ? AND formation_id = ?').get(req.user.id, formation_id);
  if (existing?.status === 'paid') {
    return res.status(400).json({ error: 'Vous avez déjà accès à cette formation' });
  }

  // Montant toujours validé côté serveur
  const amount = formation.price || 25500;
  const reference = `SAIM-${Date.now()}-${req.user.id}-${formation_id}`;

  try {
    const token = await getCampayToken();
    const campayRes = await fetch(`${CAMPAY_BASE_URL}/collect/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({
        amount: String(amount),
        currency: 'XAF',
        from: phone,
        description: `Accès ${formation.title_fr} - SAIM Course`,
        external_reference: reference,
      }),
    });

    const campayData = await campayRes.json();
    if (!campayRes.ok) {
      return res.status(400).json({ error: campayData.message || 'Échec de l\'initiation du paiement' });
    }

    // Sauvegarder le paiement en base
    db.prepare(`
      INSERT OR IGNORE INTO payments (user_id, formation_id, reference, operator, phone, amount, status, campay_ref)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(req.user.id, formation_id, reference, operator, phone, amount, campayData.reference || reference);

    // Créer un enrollment trial si pas encore inscrit
    db.prepare(`
      INSERT OR IGNORE INTO enrollments (user_id, formation_id, status)
      VALUES (?, ?, 'trial')
    `).run(req.user.id, formation_id);

    res.json({ reference, ussd_code: campayData.ussd_code });
  } catch (err) {
    console.error('CampPay initiate error:', err);
    res.status(500).json({ error: 'Erreur serveur lors du paiement' });
  }
});

// ─── GET /payments/status/:reference ─────────────────────────────────────────
router.get('/status/:reference', requireAuth, async (req, res) => {
  const payment = db.prepare(
    'SELECT * FROM payments WHERE reference = ? AND user_id = ?'
  ).get(req.params.reference, req.user.id);

  if (!payment) return res.status(404).json({ error: 'Paiement introuvable' });

  if (payment.status === 'confirmed') {
    return res.json({ status: 'confirmed' });
  }
  if (payment.status === 'failed') {
    return res.json({ status: 'failed' });
  }

  // Interroger CampPay pour le statut en temps réel
  try {
    const token = await getCampayToken();
    const campayRes = await fetch(`${CAMPAY_BASE_URL}/transaction/${payment.campay_ref}/`, {
      headers: { 'Authorization': `Token ${token}` },
    });
    const campayData = await campayRes.json();

    if (campayData.status === 'SUCCESSFUL') {
      // Activer l'accès
      db.prepare(`
        UPDATE payments SET status = 'confirmed', confirmed_at = datetime('now') WHERE reference = ?
      `).run(payment.reference);
      db.prepare(`
        INSERT INTO enrollments (user_id, formation_id, status, paid_at)
        VALUES (?, ?, 'paid', datetime('now'))
        ON CONFLICT(user_id, formation_id) DO UPDATE SET status = 'paid', paid_at = datetime('now')
      `).run(payment.user_id, payment.formation_id);
      return res.json({ status: 'confirmed' });
    }

    if (campayData.status === 'FAILED') {
      db.prepare(`UPDATE payments SET status = 'failed' WHERE reference = ?`).run(payment.reference);
      return res.json({ status: 'failed' });
    }

    res.json({ status: 'pending' });
  } catch (err) {
    console.error('CampPay status error:', err);
    res.json({ status: 'pending' });
  }
});

// ─── POST /payments/webhook ───────────────────────────────────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const secret = process.env.CAMPAY_WEBHOOK_SECRET;
  if (secret) {
    const signature = req.headers['x-campay-signature'] || '';
    const expected = crypto.createHmac('sha256', secret).update(req.body).digest('hex');
    if (signature !== expected) {
      return res.status(401).json({ error: 'Signature invalide' });
    }
  }

  let payload;
  try {
    payload = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).json({ error: 'Payload invalide' });
  }

  if (payload.status === 'SUCCESSFUL') {
    const payment = db.prepare(
      'SELECT * FROM payments WHERE campay_ref = ? OR reference = ?'
    ).get(payload.reference, payload.external_reference);

    if (payment && payment.status !== 'confirmed') {
      db.prepare(`
        UPDATE payments SET status = 'confirmed', confirmed_at = datetime('now')
        WHERE id = ?
      `).run(payment.id);
      db.prepare(`
        INSERT INTO enrollments (user_id, formation_id, status, paid_at)
        VALUES (?, ?, 'paid', datetime('now'))
        ON CONFLICT(user_id, formation_id) DO UPDATE SET status = 'paid', paid_at = datetime('now')
      `).run(payment.user_id, payment.formation_id);
    }
  }

  res.json({ ok: true });
});

module.exports = router;
