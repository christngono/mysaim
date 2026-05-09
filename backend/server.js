const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 5001;
const isProd = process.env.NODE_ENV === 'production';

// ─── CORS ─────────────────────────────────────────────────────────────────────
const corsOrigin = isProd
  ? (process.env.FRONTEND_URL || false)
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174', 'http://localhost:5174'];

app.use(cors({ origin: corsOrigin, credentials: true }));

app.use(express.json());

// ─── Serve images & uploads ───────────────────────────────────────────────────
app.use('/images',  express.static(path.join(__dirname, '..', 'images')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/courses',       require('./routes/courses'));
app.use('/api/quiz',          require('./routes/quiz'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/contact',       require('./routes/contact'));
app.use('/api/admin/upload',  require('./routes/upload'));
app.use('/api/questions',     require('./routes/questions'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/exercises',     require('./routes/exercises'));
app.use('/api/payments',      require('./routes/payments'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'SAIM API' }));

// ─── Serve React frontend (production) ────────────────────────────────────────
if (isProd) {
  const distPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(distPath));
  // All non-API routes → React app (SPA fallback)
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 SAIM Backend running on port ${PORT} [${isProd ? 'PRODUCTION' : 'development'}]`);
  console.log(`   API:    http://localhost:${PORT}/api`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});