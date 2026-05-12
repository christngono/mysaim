const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'saim.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDB() {
  db.exec(`
    -- ===================== USERS =====================
    CREATE TABLE IF NOT EXISTS users (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      email           TEXT    NOT NULL UNIQUE,
      first_name      TEXT    NOT NULL,
      last_name       TEXT    NOT NULL,
      phone           TEXT,
      password_hash   TEXT    NOT NULL,
      role            TEXT    NOT NULL DEFAULT 'user',   -- 'user' | 'admin'
      post            TEXT,
      ai_level        INTEGER CHECK(ai_level BETWEEN 1 AND 5),
      learning_objectives TEXT,
      activity_sector TEXT,
      learning_days   TEXT,                              -- JSON array e.g. ["Lundi","Mercredi"]
      is_active       INTEGER NOT NULL DEFAULT 1,
      created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ===================== MODULES =====================
    CREATE TABLE IF NOT EXISTS modules (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title_fr    TEXT NOT NULL,
      title_en    TEXT NOT NULL,
      description_fr TEXT,
      description_en TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ===================== LESSONS =====================
    CREATE TABLE IF NOT EXISTS lessons (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id   INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      title_fr    TEXT NOT NULL,
      title_en    TEXT NOT NULL,
      content_fr  TEXT NOT NULL,
      content_en  TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ===================== USER PROGRESS =====================
    CREATE TABLE IF NOT EXISTS user_progress (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lesson_id   INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      completed   INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      UNIQUE(user_id, lesson_id)
    );

    -- ===================== QUIZZES =====================
    CREATE TABLE IF NOT EXISTS quizzes (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id     INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      title_fr      TEXT NOT NULL,
      title_en      TEXT NOT NULL,
      passing_score INTEGER NOT NULL DEFAULT 7,
      is_published  INTEGER NOT NULL DEFAULT 1,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ===================== QUIZ QUESTIONS =====================
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id     INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      question_fr TEXT NOT NULL,
      question_en TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0
    );

    -- ===================== QUIZ CHOICES =====================
    CREATE TABLE IF NOT EXISTS quiz_choices (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
      text_fr     TEXT NOT NULL,
      text_en     TEXT NOT NULL,
      is_correct  INTEGER NOT NULL DEFAULT 0,
      order_index INTEGER NOT NULL DEFAULT 0
    );

    -- ===================== QUIZ ATTEMPTS =====================
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      quiz_id      INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      score        INTEGER NOT NULL DEFAULT 0,
      total        INTEGER NOT NULL DEFAULT 10,
      passed       INTEGER NOT NULL DEFAULT 0,
      answers      TEXT    NOT NULL DEFAULT '{}',
      completed_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ===================== INDEXES =====================
    CREATE INDEX IF NOT EXISTS idx_users_email         ON users(email);
    CREATE INDEX IF NOT EXISTS idx_lessons_module      ON lessons(module_id);
    CREATE INDEX IF NOT EXISTS idx_progress_user       ON user_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_progress_lesson     ON user_progress(lesson_id);
    CREATE INDEX IF NOT EXISTS idx_quiz_module         ON quizzes(module_id);
    CREATE INDEX IF NOT EXISTS idx_attempts_user       ON quiz_attempts(user_id);
    CREATE INDEX IF NOT EXISTS idx_attempts_quiz       ON quiz_attempts(quiz_id);
  `);

  // ─── Formations / Enrollments / Payments (créés EN PREMIER car référencés partout) ───
  db.exec(`
    CREATE TABLE IF NOT EXISTS formations (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      key            TEXT    NOT NULL UNIQUE,
      title_fr       TEXT    NOT NULL,
      title_en       TEXT    NOT NULL,
      description_fr TEXT,
      description_en TEXT,
      image_url      TEXT,
      price          INTEGER NOT NULL DEFAULT 25500,
      is_published   INTEGER NOT NULL DEFAULT 1,
      order_index    INTEGER NOT NULL DEFAULT 0,
      created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      formation_id  INTEGER NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
      status        TEXT    NOT NULL DEFAULT 'trial' CHECK(status IN ('trial','paid')),
      enrolled_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      paid_at       TEXT,
      UNIQUE(user_id, formation_id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      formation_id INTEGER NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
      reference    TEXT    NOT NULL UNIQUE,
      operator     TEXT    NOT NULL CHECK(operator IN ('MTN','ORANGE')),
      phone        TEXT    NOT NULL,
      amount       INTEGER NOT NULL DEFAULT 25500,
      status       TEXT    NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','failed')),
      campay_ref   TEXT,
      created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      confirmed_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_enrollments_user      ON enrollments(user_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_formation ON enrollments(formation_id);
    CREATE INDEX IF NOT EXISTS idx_payments_user         ON payments(user_id);
    CREATE INDEX IF NOT EXISTS idx_payments_reference    ON payments(reference);
  `);

  // ─── Seed formations (idempotent) ────────────────────────────────────────────
  db.exec(`
    INSERT OR IGNORE INTO formations (id, key, title_fr, title_en, description_fr, description_en, price, is_published, order_index)
    VALUES
      (1, 'maitrise-ia',
       'Maîtriser l''IA pour la Productivité Professionnelle',
       'Mastering AI for Professional Productivity',
       'Apprenez à utiliser l''intelligence artificielle dans votre vie professionnelle et personnelle.',
       'Learn to use artificial intelligence in your professional and personal life.',
       25500, 1, 0),
      (2, 'ia-marketing',
       'Utiliser l''IA dans le Marketing',
       'Using AI in Marketing',
       'Découvrez comment l''IA transforme le marketing digital et les stratégies de croissance.',
       'Discover how AI is transforming digital marketing and growth strategies.',
       25500, 0, 1),
      (3, 'montage-video-ia',
       'Montage Vidéo avec les Outils IA',
       'Video Editing with AI Tools',
       'Maîtrisez les outils IA pour créer des vidéos professionnelles rapidement.',
       'Master AI tools to create professional videos quickly.',
       25500, 0, 2),
      (4, 'specialisation-ia-pros',
       'Spécialisation des Modèles IA pour les Professionnels',
       'AI Model Specialization for Professionals',
       'Apprenez à fine-tuner et spécialiser les modèles IA pour vos besoins métier.',
       'Learn to fine-tune and specialize AI models for your business needs.',
       25500, 0, 3);
  `);

  // ─── Seed image_url (idempotent: seulement si NULL) ──────────────────────────
  const seedImg = db.prepare('UPDATE formations SET image_url=? WHERE id=? AND image_url IS NULL');
  seedImg.run('/uploads/apropos/image_apropos.png',     1);
  seedImg.run('/uploads/apropos/formation_marketing.png', 2);
  seedImg.run('/uploads/apropos/image_videoai.png',     3);
  seedImg.run('/uploads/apropos/facebook_pub3.png',     4);

  // ─── Migrations (add columns if not exist) ──────────────────────────────────
  try { db.exec('ALTER TABLE quiz_questions ADD COLUMN explanation_fr TEXT NOT NULL DEFAULT ""'); } catch {}
  try { db.exec('ALTER TABLE quiz_questions ADD COLUMN explanation_en TEXT NOT NULL DEFAULT ""'); } catch {}
  try { db.exec('ALTER TABLE users ADD COLUMN last_seen TEXT'); } catch {}
  try { db.exec('ALTER TABLE users ADD COLUMN google_id TEXT'); } catch {}

  // ─── Activation codes ─────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS activation_codes (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      code         TEXT NOT NULL UNIQUE,
      formation_id INTEGER NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
      created_by   INTEGER REFERENCES users(id),
      used_by      INTEGER REFERENCES users(id),
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      used_at      TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_codes_formation ON activation_codes(formation_id);
    CREATE INDEX IF NOT EXISTS idx_codes_used_by ON activation_codes(used_by);
  `);
  try { db.exec('ALTER TABLE user_progress ADD COLUMN started_at TEXT'); } catch {}
  try { db.exec('ALTER TABLE modules ADD COLUMN formation_id INTEGER REFERENCES formations(id) ON DELETE SET NULL'); } catch {}
  try { db.exec('ALTER TABLE formations ADD COLUMN learning_objectives TEXT'); } catch {}
  try { db.exec('ALTER TABLE formations ADD COLUMN prerequisites TEXT'); } catch {}
  try { db.exec('ALTER TABLE formations ADD COLUMN level TEXT'); } catch {}
  try { db.exec('ALTER TABLE formations ADD COLUMN duration_hours INTEGER'); } catch {}
  try { db.exec('ALTER TABLE formations ADD COLUMN teaser_url TEXT'); } catch {}
  try { db.exec('ALTER TABLE formations ADD COLUMN target_audience TEXT'); } catch {}
  try { db.exec('ALTER TABLE formations ADD COLUMN color TEXT'); } catch {}
  try { db.exec('ALTER TABLE formations ADD COLUMN icon TEXT'); } catch {}
  try { db.exec(`
    CREATE TABLE IF NOT EXISTS site_visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      visited_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_site_visits_user ON site_visits(user_id);
    CREATE INDEX IF NOT EXISTS idx_site_visits_date ON site_visits(visited_at);
  `); } catch {}
  try { db.exec('ALTER TABLE formations ADD COLUMN programme TEXT'); } catch {}
  try { db.exec('ALTER TABLE formations ADD COLUMN why_fr TEXT'); } catch {}
  try { db.exec('ALTER TABLE formations ADD COLUMN learning_objectives_en TEXT'); } catch {}
  try { db.exec('ALTER TABLE formations ADD COLUMN prerequisites_en TEXT'); } catch {}
  try { db.exec('ALTER TABLE formations ADD COLUMN programme_en TEXT'); } catch {}
  try { db.exec('ALTER TABLE formations ADD COLUMN why_en TEXT'); } catch {}
  try { db.exec(`
    CREATE TABLE IF NOT EXISTS formation_waitlist (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      formation_id INTEGER NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
      joined_at    TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, formation_id)
    );
    CREATE INDEX IF NOT EXISTS idx_waitlist_formation ON formation_waitlist(formation_id);
    CREATE INDEX IF NOT EXISTS idx_waitlist_user ON formation_waitlist(user_id);
  `); } catch {}

  // ─── Seed programme content (idempotent: only where programme IS NULL) ────────
  const seedProgramme = db.prepare('UPDATE formations SET programme=? WHERE id=? AND programme IS NULL');
  seedProgramme.run(JSON.stringify([
    { module: "Introduction à l'IA et à l'IA Générative", items: ["Comprendre l'intelligence artificielle", "L'IA générative : ChatGPT, Claude, Gemini", "Comment l'IA transforme votre quotidien professionnel"] },
    { module: "Optimiser sa productivité avec l'IA", items: ["Rédiger emails et rapports en minutes", "Automatiser les tâches répétitives", "Outils IA pour la gestion du temps"] },
    { module: "L'art du Prompting", items: ["Techniques de prompting efficaces", "Prompts avancés par secteur d'activité", "Exercices pratiques de rédaction de prompts"] },
    { module: "Découvrir les requêtes multimodales", items: ["Analyser images et documents avec l'IA", "Génération et édition d'images", "Traitement audio et génération de contenu"] },
    { module: "Utilisation des Outils d'Intelligence Artificielle", items: ["Tour d'horizon des outils IA essentiels", "Intégration dans votre flux de travail", "Projet final : automatiser un processus métier"] },
  ]), 1);
  seedProgramme.run(JSON.stringify([
    { module: "Fondamentaux de l'IA Marketing", items: ["Panorama des outils IA pour le marketing", "Analyse de données et segmentation automatique", "Personnalisation des campagnes par IA"] },
    { module: "Création de Contenu avec l'IA", items: ["Rédiger des copies publicitaires percutantes", "Générer des visuels et images de marque", "Stratégies de contenu SEO assistées par IA"] },
    { module: "Automatisation des Campagnes", items: ["Planifier et programmer avec l'IA", "Email marketing et automation", "Gestion des réseaux sociaux par IA"] },
    { module: "Analyse & Optimisation", items: ["Tableaux de bord IA et indicateurs clés", "A/B testing intelligent", "Prédiction des performances de campagne"] },
    { module: "Stratégies de Croissance", items: ["Growth hacking avec l'IA", "Publicité Facebook & Google optimisée par IA", "Projet final : Campagne marketing complète"] },
  ]), 2);
  seedProgramme.run(JSON.stringify([
    { module: "Introduction aux Outils Vidéo IA", items: ["Panorama : Runway, Pika, Sora, HeyGen", "Choisir le bon outil selon son projet", "Bases du montage vidéo avec l'IA"] },
    { module: "Génération de Vidéos", items: ["Créer des vidéos depuis un prompt texte", "Avatars IA et présentateurs virtuels", "Animation et motion graphics automatiques"] },
    { module: "Post-production Intelligente", items: ["Sous-titres automatiques et traduction", "Color grading et effets spéciaux IA", "Amélioration audio et suppression du bruit"] },
    { module: "Contenus Courts & Réseaux Sociaux", items: ["Optimiser pour Reels, TikTok et Shorts", "Repurposing de contenu automatique", "Templates et identité visuelle cohérente"] },
    { module: "Publication & Stratégie", items: ["Optimisation SEO pour la vidéo", "Calendrier de publication IA", "Projet final : Série vidéo de A à Z"] },
  ]), 3);
  seedProgramme.run(JSON.stringify([
    { module: "Fondamentaux des Modèles de Langage", items: ["Architecture Transformer et mécanisme d'attention", "Comprendre les paramètres et hyperparamètres", "Évaluation et benchmarks de modèles"] },
    { module: "Fine-tuning & Adaptation", items: ["Préparer et nettoyer ses datasets", "Techniques LoRA et QLoRA", "Entraînement sur cas d'usage métier"] },
    { module: "RAG & Bases de Connaissances", items: ["Retrieval-Augmented Generation (RAG)", "Embeddings et bases vectorielles", "Intégrer des documents d'entreprise"] },
    { module: "Déploiement & Production", items: ["APIs et intégration dans les workflows", "Optimisation des coûts et performances", "Monitoring et maintenance des modèles"] },
    { module: "Projets Avancés", items: ["Chatbot métier personnalisé", "Automatisation de processus complexes", "Projet final : Modèle IA spécialisé pour son secteur"] },
  ]), 4);

  // ─── Seed English objectives/prerequisites/programme (idempotent) ─────────────
  const seedEN = db.prepare('UPDATE formations SET learning_objectives_en=?, prerequisites_en=?, programme_en=? WHERE id=? AND learning_objectives_en IS NULL');
  seedEN.run(
    JSON.stringify(["Use ChatGPT and other AI tools to write professional emails in minutes","Automate report, presentation and summary creation with AI","Create effective prompts to get precise and relevant results","Save time on your daily tasks through AI automation","Integrate AI into your meetings, notes and schedules"]),
    "No technical prerequisites. A computer and motivation are sufficient.",
    JSON.stringify([
      { module: "Introduction to AI and Generative AI", items: ["Understanding artificial intelligence", "Generative AI: ChatGPT, Claude, Gemini", "How AI transforms your professional daily life"] },
      { module: "Optimize productivity with AI", items: ["Write emails and reports in minutes", "Automate repetitive tasks", "AI tools for time management"] },
      { module: "The art of Prompting", items: ["Effective prompting techniques", "Advanced prompts by industry", "Practical prompt writing exercises"] },
      { module: "Discover multimodal queries", items: ["Analyze images and documents with AI", "Image generation and editing", "Audio processing and content generation"] },
      { module: "Using AI Tools", items: ["Overview of essential AI tools", "Integration into your workflow", "Final project: automate a business process"] },
    ]),
    1
  );
  seedEN.run(
    JSON.stringify(["Create impactful visuals, slogans and advertising content with AI","Automate scheduling and publishing on social media","Generate personalized email campaigns at scale","Analyze marketing performance and optimize your strategies with AI","Write AI-optimized video scripts and SEO articles"]),
    "Basic knowledge of digital marketing recommended.",
    JSON.stringify([
      { module: "AI Marketing Fundamentals", items: ["Overview of AI tools for marketing", "Automatic data analysis and segmentation", "AI-powered campaign personalization"] },
      { module: "Content Creation with AI", items: ["Write compelling ad copy", "Generate brand visuals and images", "AI-assisted SEO content strategies"] },
      { module: "Campaign Automation", items: ["Plan and schedule with AI", "Email marketing and automation", "Social media management with AI"] },
      { module: "Analysis & Optimization", items: ["AI dashboards and KPIs", "Smart A/B testing", "Campaign performance prediction"] },
      { module: "Growth Strategies", items: ["Growth hacking with AI", "AI-optimized Facebook & Google ads", "Final project: complete marketing campaign"] },
    ]),
    2
  );
  seedEN.run(
    JSON.stringify(["Generate short videos and animations from a simple text prompt","Use AI for automatic subtitling and video translation","Remove backgrounds and retouch videos with AI tools","Create realistic voiceovers and background music with AI","Automate editing of advertising videos and reels for social media"]),
    "Basic video editing skills appreciated.",
    JSON.stringify([
      { module: "Introduction to AI Video Tools", items: ["Overview: Runway, Pika, Sora, HeyGen", "Choosing the right tool for your project", "Video editing basics with AI"] },
      { module: "Video Generation", items: ["Create videos from a text prompt", "AI avatars and virtual presenters", "Automatic animation and motion graphics"] },
      { module: "Intelligent Post-production", items: ["Automatic subtitles and translation", "AI color grading and special effects", "Audio enhancement and noise removal"] },
      { module: "Short-form & Social Media Content", items: ["Optimize for Reels, TikTok and Shorts", "Automatic content repurposing", "Templates and consistent visual identity"] },
      { module: "Publishing & Strategy", items: ["Video SEO optimization", "AI publication calendar", "Final project: video series from A to Z"] },
    ]),
    3
  );
  seedEN.run(
    JSON.stringify(["Understand and apply language model fine-tuning techniques (LLM)","Build a RAG (Retrieval Augmented Generation) system on your own data","Deploy your AI models in production via API or web interface","Optimize performance and reduce costs of your AI models","Build autonomous AI agents for advanced business tasks"]),
    "Python and Machine Learning concepts required.",
    JSON.stringify([
      { module: "Language Model Fundamentals", items: ["Transformer architecture and attention mechanism", "Understanding parameters and hyperparameters", "Model evaluation and benchmarks"] },
      { module: "Fine-tuning & Adaptation", items: ["Preparing and cleaning datasets", "LoRA and QLoRA techniques", "Training on business use cases"] },
      { module: "RAG & Knowledge Bases", items: ["Retrieval-Augmented Generation (RAG)", "Embeddings and vector databases", "Integrating company documents"] },
      { module: "Deployment & Production", items: ["APIs and workflow integration", "Cost and performance optimization", "Model monitoring and maintenance"] },
      { module: "Advanced Projects", items: ["Custom business chatbot", "Complex process automation", "Final project: specialized AI model for your industry"] },
    ]),
    4
  );

  db.exec(`
    CREATE TABLE IF NOT EXISTS quote_requests (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL,
      message    TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ─── Q&A tables ─────────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS module_questions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      module_id   INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      question    TEXT NOT NULL,
      answer      TEXT,
      answered_by INTEGER REFERENCES users(id),
      answered_at TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type       TEXT NOT NULL,
      title      TEXT NOT NULL,
      message    TEXT NOT NULL,
      data       TEXT DEFAULT '{}',
      is_read    INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ─── Exercise tables ─────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS exercises (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id        INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      title_fr         TEXT NOT NULL,
      title_en         TEXT NOT NULL,
      instructions_fr  TEXT,
      instructions_en  TEXT,
      is_published     INTEGER NOT NULL DEFAULT 1,
      created_at       TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS exercise_questions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
      question_fr TEXT NOT NULL,
      question_en TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS exercise_submissions (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      exercise_id  INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
      answers      TEXT NOT NULL DEFAULT '{}',
      feedback     TEXT,
      grade        TEXT,
      graded_at    TEXT,
      submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, exercise_id)
    );
  `);

  // ─── Certificate table ────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS certificates (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      file_url  TEXT NOT NULL,
      issued_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ─── Section time tracking ────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS section_time (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      section_type     TEXT    NOT NULL,
      section_id       INTEGER NOT NULL,
      module_id        INTEGER REFERENCES modules(id) ON DELETE SET NULL,
      duration_seconds INTEGER NOT NULL DEFAULT 0,
      recorded_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_time_user   ON section_time(user_id);
    CREATE INDEX IF NOT EXISTS idx_time_module ON section_time(module_id);
  `);

  // ─── Seed formation metadata (idempotent: only when color IS NULL = fresh install) ─
  const seedMeta = db.prepare(`
    UPDATE formations SET
      title_fr=?, title_en=?, description_fr=?, description_en=?,
      learning_objectives=?, prerequisites=?, level=?, duration_hours=?,
      is_published=?, target_audience=?, color=?, icon=?
    WHERE id=? AND color IS NULL
  `);
  const metaSeed = [
    {
      id: 1,
      title_fr: "Maîtriser l'IA pour la Productivité Professionnelle",
      title_en: "Mastering AI for Professional Productivity",
      desc_fr: "Intégrez l'intelligence artificielle dans votre quotidien professionnel pour travailler mieux, plus vite et plus intelligemment.",
      desc_en: "Integrate artificial intelligence into your professional daily life to work better, faster and smarter.",
      objectives: JSON.stringify(["Utiliser ChatGPT et d'autres outils IA pour rédiger des emails professionnels en minutes","Automatiser la création de rapports, présentations et synthèses avec l'IA","Créer des prompts efficaces pour obtenir des résultats précis et pertinents","Gagner du temps sur vos tâches quotidiennes grâce à l'automatisation IA","Intégrer l'IA dans vos réunions, notes et plannings"]),
      prerequisites: "Aucun prérequis technique. Un ordinateur et de la motivation suffisent.",
      level: "débutant", hours: 2, published: 1, audience: JSON.stringify(["Cadres","Managers"]), color: "blue", icon: "⚡",
    },
    {
      id: 2,
      title_fr: "Utiliser l'IA dans le Marketing",
      title_en: "Using AI in Marketing",
      desc_fr: "Créez du contenu percutant, automatisez vos campagnes et amplifiez votre impact commercial grâce aux outils IA.",
      desc_en: "Create impactful content, automate your campaigns and amplify your commercial impact with AI tools.",
      objectives: JSON.stringify(["Créer des visuels, slogans et contenus publicitaires percutants avec l'IA","Automatiser la planification et la publication sur les réseaux sociaux","Générer des campagnes email personnalisées à grande échelle","Analyser les performances marketing et optimiser vos stratégies avec l'IA","Rédiger des scripts vidéo et des articles SEO optimisés grâce aux outils IA"]),
      prerequisites: "Notions de marketing digital recommandées.",
      level: "intermédiaire", hours: 2, published: 1, audience: JSON.stringify(["Marketeurs","Communicants"]), color: "orange", icon: "📢",
    },
    {
      id: 3,
      title_fr: "Montage Vidéo avec les Outils IA",
      title_en: "Video Editing with AI Tools",
      desc_fr: "Produisez des vidéos publicitaires, films et animations de qualité professionnelle rapidement grâce à l'IA.",
      desc_en: "Produce advertising videos, films and animations of professional quality quickly thanks to AI.",
      objectives: JSON.stringify(["Générer des vidéos courtes et des animations à partir d'un simple texte","Utiliser l'IA pour le sous-titrage automatique et la traduction vidéo","Supprimer les arrière-plans et retoucher les vidéos avec des outils IA","Créer des voix off réalistes et de la musique de fond avec l'IA","Automatiser le montage de vidéos publicitaires et de réels pour les réseaux sociaux"]),
      prerequisites: "Bases en montage vidéo appréciées.",
      level: "intermédiaire", hours: 2, published: 1, audience: JSON.stringify(["Créateurs de contenu","Agences com"]), color: "purple", icon: "🎬",
    },
    {
      id: 4,
      title_fr: "Spécialisation des Modèles IA pour les Professionnels",
      title_en: "AI Model Specialization for Professionals",
      desc_fr: "Maîtrisez le fine-tuning, le RAG et le déploiement de modèles d'IA sur mesure pour des cas d'usage avancés.",
      desc_en: "Master fine-tuning, RAG and custom AI model deployment for advanced use cases.",
      objectives: JSON.stringify(["Comprendre et appliquer les techniques de fine-tuning des modèles de langage (LLM)","Créer un système RAG (Retrieval Augmented Generation) sur vos propres données","Déployer vos modèles IA en production via API ou interface web","Optimiser les performances et réduire les coûts de vos modèles IA","Construire des agents IA autonomes pour des tâches métier avancées"]),
      prerequisites: "Python et notions de Machine Learning requises.",
      level: "avancé", hours: 2, published: 1, audience: JSON.stringify(["Data scientists","Ingénieurs"]), color: "green", icon: "🔧",
    },
  ];
  for (const m of metaSeed) {
    seedMeta.run(m.title_fr, m.title_en, m.desc_fr, m.desc_en, m.objectives, m.prerequisites, m.level, m.hours, m.published, m.audience, m.color, m.icon, m.id);
  }

  // ─── Rattacher les modules existants à la formation 1 ────────────────────────
  db.prepare(`UPDATE modules SET formation_id = 1 WHERE formation_id IS NULL`).run();

  // ─── Migrer les utilisateurs existants → enrolled paid sur formation 1 ───────
  const existingUsers = db.prepare(`SELECT id FROM users WHERE role = 'user'`).all();
  const insertEnrollment = db.prepare(`
    INSERT OR IGNORE INTO enrollments (user_id, formation_id, status, paid_at)
    VALUES (?, 1, 'paid', datetime('now'))
  `);
  for (const u of existingUsers) {
    insertEnrollment.run(u.id);
  }

  console.log('✅ Database initialized');
}

initDB();
module.exports = db;