const db = require('./db/database');

console.log('📝 Ajout de l\'exercice Module 2...');

// ─── Récupérer le module 2 ────────────────────────────────────────────────────
const mod2 = db.prepare('SELECT id FROM modules WHERE order_index = 2').get();
if (!mod2) {
  console.error('❌ Module 2 introuvable. Lancez seed.js d\'abord.');
  process.exit(1);
}

// ─── Supprimer l'exercice existant si besoin ──────────────────────────────────
const existing = db.prepare('SELECT id FROM exercises WHERE module_id = ?').get(mod2.id);
if (existing) {
  console.log('⚠️  Un exercice existe déjà pour le Module 2 (id=' + existing.id + '). Suppression...');
  db.prepare('DELETE FROM exercises WHERE id = ?').run(existing.id);
}

// ─── Scénario (instructions) ──────────────────────────────────────────────────
const instructionsFr = `Scénario :

Marc est responsable RH à Yaoundé. Il demande à une IA de l'aider à rédiger un contrat de travail. L'IA lui répond ceci :

« Selon la loi camerounaise n°2024-156 du 15 mars 2024 sur le travail, tout employé doit obligatoirement bénéficier de 45 jours de congés payés par an et d'une prime de transport fixée à 75 000 FCFA par mois. »

Marc est impressionné par la précision de la réponse et veut l'utiliser directement dans le contrat.

---

En vous basant sur ce que vous avez appris dans le module 2, répondez aux trois questions ci-dessous.`;

const instructionsEn = `Scenario:

Marc is an HR manager in Yaoundé. He asks an AI to help him draft an employment contract. The AI responds:

"According to Cameroonian law n°2024-156 of March 15, 2024 on labor, every employee must compulsorily benefit from 45 days of paid leave per year and a transportation allowance fixed at 75,000 FCFA per month."

Marc is impressed by the precision of the answer and wants to use it directly in the contract.

---

Based on what you learned in module 2, answer the three questions below.`;

// ─── Créer l'exercice ─────────────────────────────────────────────────────────
const exRes = db.prepare(`
  INSERT INTO exercises (module_id, title_fr, title_en, instructions_fr, instructions_en, is_published)
  VALUES (?, ?, ?, ?, ?, 1)
`).run(
  mod2.id,
  "Exercice 2 — Détectez l'hallucination",
  "Exercise 2 — Detect the Hallucination",
  instructionsFr,
  instructionsEn
);
const exerciseId = exRes.lastInsertRowid;
console.log('  ✅ Exercice créé (id=' + exerciseId + ')');

// ─── Ajouter les questions ────────────────────────────────────────────────────
const questions = [
  {
    fr: "Quel risque court Marc s'il utilise cette réponse sans vérification ?",
    en: "What risk does Marc take if he uses this answer without verification?",
  },
  {
    fr: "Comment appelle-t-on ce phénomène dans le cours ?",
    en: "What is this phenomenon called in the course?",
  },
  {
    fr: "Que devrait faire Marc avant d'utiliser cette information dans le contrat ?",
    en: "What should Marc do before using this information in the contract?",
  },
];

questions.forEach((q, i) => {
  db.prepare(`
    INSERT INTO exercise_questions (exercise_id, question_fr, question_en, order_index)
    VALUES (?, ?, ?, ?)
  `).run(exerciseId, q.fr, q.en, i + 1);
  console.log('  ✅ Question ' + (i + 1) + ' ajoutée');
});

console.log('\n✅ Exercice Module 2 ajouté avec succès ! (3 questions ouvertes)');
