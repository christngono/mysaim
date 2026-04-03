const db = require('./db/database');

console.log('🎯 Ajout du quiz Module 2...');

// ─── Récupérer le module 2 ────────────────────────────────────────────────────
const mod2 = db.prepare('SELECT id FROM modules WHERE order_index = 2').get();
if (!mod2) {
  console.error('❌ Module 2 introuvable. Lancez seed.js d\'abord.');
  process.exit(1);
}

// ─── Vérifier si le quiz existe déjà ─────────────────────────────────────────
const existing = db.prepare('SELECT id FROM quizzes WHERE module_id = ?').get(mod2.id);
if (existing) {
  console.log('⚠️  Un quiz existe déjà pour le Module 2 (id=' + existing.id + '). Suppression...');
  db.prepare('DELETE FROM quizzes WHERE id = ?').run(existing.id);
}

// ─── Créer le quiz ────────────────────────────────────────────────────────────
const quizRes = db.prepare(`
  INSERT INTO quizzes (module_id, title_fr, title_en, passing_score, is_published)
  VALUES (?, ?, ?, ?, 1)
`).run(
  mod2.id,
  "Quiz — Module 2 : Optimiser sa productivité avec l'IA",
  "Quiz — Module 2: Optimizing Productivity with AI",
  7
);
const quizId = quizRes.lastInsertRowid;
console.log('  ✅ Quiz créé (id=' + quizId + ')');

// ─── Helper ───────────────────────────────────────────────────────────────────
function addQuestion(orderIndex, qFr, qEn, explFr, explEn, choices) {
  const qRes = db.prepare(`
    INSERT INTO quiz_questions (quiz_id, question_fr, question_en, explanation_fr, explanation_en, order_index)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(quizId, qFr, qEn, explFr, explEn, orderIndex);
  const qId = qRes.lastInsertRowid;
  choices.forEach((c, i) => {
    db.prepare(`
      INSERT INTO quiz_choices (question_id, text_fr, text_en, is_correct, order_index)
      VALUES (?, ?, ?, ?, ?)
    `).run(qId, c.fr, c.en, c.correct ? 1 : 0, i);
  });
  console.log('  ✅ Q' + orderIndex + ' ajoutée');
}

// ─── Questions ────────────────────────────────────────────────────────────────

addQuestion(
  1,
  "Comment les modèles d'IA Générative produisent-ils leurs résultats ?",
  "How do Generative AI models produce their results?",
  "L'IA ne crée pas à partir de rien. Elle réorganise des données existantes de façon nouvelle. C'est ce qu'on appelle la \"créativité statistique\". L'étincelle originale vient toujours de votre prompt !",
  "AI does not create from nothing. It reorganizes existing data in new ways. This is called \"statistical creativity\". The original spark always comes from your prompt!",
  [
    { fr: "Ils inventent des idées totalement nouvelles comme un artiste humain", en: "They invent entirely new ideas like a human artist", correct: false },
    { fr: "Ils copient directement des textes existants sur Internet", en: "They directly copy existing texts from the Internet", correct: false },
    { fr: "Ils combinent et réarrangent des informations rencontrées des millions de fois durant leur entraînement", en: "They combine and rearrange information encountered millions of times during training", correct: true },
    { fr: "Ils demandent l'avis d'un humain avant chaque réponse", en: "They ask a human's opinion before each response", correct: false },
  ]
);

addQuestion(
  2,
  "Selon le cours SAIM, d'où vient l'étincelle originale dans une interaction avec l'IA Générative ?",
  "According to the SAIM course, where does the original spark come from in a Generative AI interaction?",
  "L'IA est un outil puissant pour briser la page blanche, mais c'est toujours votre instruction (le prompt) qui guide et déclenche la création.",
  "AI is a powerful tool for breaking writer's block, but it is always your instruction (the prompt) that guides and triggers creation.",
  [
    { fr: "De la puissance des serveurs qui hébergent l'IA", en: "From the power of the servers hosting the AI", correct: false },
    { fr: "De la quantité de données sur Internet", en: "From the amount of data on the Internet", correct: false },
    { fr: "De la marque de l'outil utilisé (ChatGPT, Gemini...)", en: "From the brand of tool used (ChatGPT, Gemini...)", correct: false },
    { fr: "De votre instruction, c'est-à-dire le prompt que vous rédigez", en: "From your instruction, meaning the prompt you write", correct: true },
  ]
);

addQuestion(
  3,
  "Pourquoi dit-on que l'IA n'a pas de \"bon sens\" inné ?",
  "Why is it said that AI has no innate \"common sense\"?",
  "Même avec accès à tout le savoir humain, l'IA peut se tromper avec beaucoup d'assurance. Elle n'a ni conscience ni bon sens inné, elle suit des patterns statistiques.",
  "Even with access to all human knowledge, AI can be wrong with great confidence. It has neither consciousness nor innate common sense — it follows statistical patterns.",
  [
    { fr: "Parce qu'elle n'a pas accès à Internet", en: "Because it has no access to the Internet", correct: false },
    { fr: "Parce qu'elle est trop lente pour analyser les situations", en: "Because it is too slow to analyze situations", correct: false },
    { fr: "Parce que son comportement vient de patrons appris dans les données, pas d'une conscience ou d'un raisonnement logique", en: "Because its behavior comes from patterns learned in data, not from consciousness or logical reasoning", correct: true },
    { fr: "Parce qu'elle ne comprend pas les langues africaines", en: "Because it does not understand African languages", correct: false },
  ]
);

addQuestion(
  4,
  "Quel est le principal avantage de l'IA Générative en entreprise selon le module 2 ?",
  "What is the main advantage of Generative AI in business according to module 2?",
  "En déléguant à l'IA les tâches répétitives et chronophages, vous gagnez un temps précieux pour vous concentrer sur ce qui compte vraiment : la stratégie et les relations humaines.",
  "By delegating repetitive and time-consuming tasks to AI, you gain precious time to focus on what really matters: strategy and human relationships.",
  [
    { fr: "Elle remplace totalement les employés humains", en: "It completely replaces human employees", correct: false },
    { fr: "Elle garantit des résultats parfaits sans vérification", en: "It guarantees perfect results without verification", correct: false },
    { fr: "Elle fonctionne sans connexion Internet ni électricité", en: "It works without Internet connection or electricity", correct: false },
    { fr: "Elle produit des contenus de niveau humain à une vitesse fulgurante, libérant du temps pour la stratégie et l'humain", en: "It produces human-level content at lightning speed, freeing time for strategy and human relations", correct: true },
  ]
);

addQuestion(
  5,
  "Dans le domaine de l'administration, comment l'IA peut-elle booster votre productivité ?",
  "In the field of administration, how can AI boost your productivity?",
  "L'IA excelle dans la synthèse de documents longs et la génération de rapports, ce qui fait gagner un temps considérable en administration.",
  "AI excels at summarizing long documents and generating reports, saving considerable time in administration.",
  [
    { fr: "En remplaçant le directeur général lors des réunions importantes", en: "By replacing the general manager during important meetings", correct: false },
    { fr: "En achetant automatiquement les fournitures de bureau", en: "By automatically purchasing office supplies", correct: false },
    { fr: "En synthétisant des documents de 50 pages en 5 points clés ou en générant un projet de rapport", en: "By summarizing 50-page documents into 5 key points or generating a report draft", correct: true },
    { fr: "En gérant les congés et absences des employés", en: "By managing employee leave and absences", correct: false },
  ]
);

addQuestion(
  6,
  "Qu'est-ce qu'une \"hallucination\" dans le contexte de l'IA ?",
  "What is a \"hallucination\" in the context of AI?",
  "Les hallucinations sont le piège numéro 1 ! L'IA peut affirmer des fausses informations avec beaucoup d'assurance. C'est pourquoi vous devez toujours vérifier les informations factuelles.",
  "Hallucinations are the number one trap! AI can assert false information with great confidence. That is why you must always verify factual information.",
  [
    { fr: "Une panne technique qui fait bugger le logiciel", en: "A technical failure that causes the software to crash", correct: false },
    { fr: "Une image floue générée par un modèle text-to-image", en: "A blurry image generated by a text-to-image model", correct: false },
    { fr: "Quand l'IA invente des faits, des dates ou des lois qui n'existent pas, tout en restant très convaincante", en: "When AI invents facts, dates or laws that don't exist while remaining very convincing", correct: true },
    { fr: "Un message d'erreur qui s'affiche quand l'IA ne comprend pas la question", en: "An error message displayed when AI doesn't understand the question", correct: false },
  ]
);

addQuestion(
  7,
  "D'où viennent les biais présents dans les modèles d'IA Générative ?",
  "Where do the biases in Generative AI models come from?",
  "L'IA apprend sur Internet. Si ces données sont biaisées ou représentent principalement l'Occident, l'IA reproduira ces biais et pourra involontairement renforcer des stéréotypes.",
  "AI learns from the Internet. If this data is biased or primarily represents the Western world, AI will reproduce these biases and may inadvertently reinforce stereotypes.",
  [
    { fr: "Des erreurs de programmation volontaires des développeurs", en: "From intentional programming errors by developers", correct: false },
    { fr: "Du manque de puissance des ordinateurs qui hébergent l'IA", en: "From the lack of computing power of the servers hosting AI", correct: false },
    { fr: "Des données d'entraînement biaisées sur Internet, qui représentent souvent une partie du monde seulement", en: "From biased training data on the Internet, which often represents only part of the world", correct: true },
    { fr: "Du nombre insuffisant d'utilisateurs qui testent l'IA", en: "From the insufficient number of users testing the AI", correct: false },
  ]
);

addQuestion(
  8,
  "Vous devez créer une présentation visuelle et des visuels marketing pour votre entreprise. Quels outils d'IA utiliseriez-vous ?",
  "You need to create a visual presentation and marketing visuals for your company. Which AI tools would you use?",
  "Midjourney, DALL-E 3 et Canva Magic Design sont des outils de création visuelle spécialisés dans la génération d'images, logos et présentations illustrées.",
  "Midjourney, DALL-E 3 and Canva Magic Design are visual creation tools specialized in generating images, logos and illustrated presentations.",
  [
    { fr: "Otter.ai et Fireflies", en: "Otter.ai and Fireflies", correct: false },
    { fr: "Zapier et Make", en: "Zapier and Make", correct: false },
    { fr: "ChatGPT et Claude", en: "ChatGPT and Claude", correct: false },
    { fr: "Midjourney, DALL-E 3 ou Canva Magic Design", en: "Midjourney, DALL-E 3 or Canva Magic Design", correct: true },
  ]
);

addQuestion(
  9,
  "Vous souhaitez connecter vos outils professionnels pour envoyer automatiquement un résumé d'email vers votre logiciel de gestion. Quel type d'outil utiliseriez-vous ?",
  "You want to connect your professional tools to automatically send an email summary to your management software. Which type of tool would you use?",
  "Zapier et Make sont des outils d'automatisation qui permettent de connecter vos applications entre elles et de créer des flux de travail automatiques.",
  "Zapier and Make are automation tools that allow you to connect your applications together and create automated workflows.",
  [
    { fr: "Microsoft Copilot ou Google Workspace AI", en: "Microsoft Copilot or Google Workspace AI", correct: false },
    { fr: "Midjourney ou DALL-E 3", en: "Midjourney or DALL-E 3", correct: false },
    { fr: "Zapier ou Make", en: "Zapier or Make", correct: true },
    { fr: "Otter.ai ou Fireflies", en: "Otter.ai or Fireflies", correct: false },
  ]
);

addQuestion(
  10,
  "Selon SAIM, comment devez-vous considérer l'IA dans votre travail quotidien ?",
  "According to SAIM, how should you consider AI in your daily work?",
  "Le conseil SAIM est clair : l'IA est un levier de croissance puissant, mais elle demande supervision. Ne prenez jamais un résultat de l'IA comme une vérité absolue. Restez critique !",
  "SAIM's advice is clear: AI is a powerful growth lever, but it requires supervision. Never take an AI result as an absolute truth. Stay critical!",
  [
    { fr: "Comme une vérité absolue à suivre sans questionner", en: "As an absolute truth to follow without questioning", correct: false },
    { fr: "Comme un outil dangereux à éviter dans le monde professionnel", en: "As a dangerous tool to avoid in the professional world", correct: false },
    { fr: "Comme un remplacement total de votre expertise et jugement", en: "As a total replacement for your expertise and judgment", correct: false },
    { fr: "Comme un stagiaire très rapide mais à superviser : relire, corriger et garder son esprit critique", en: "Like a very fast intern to supervise: re-read, correct and keep your critical thinking", correct: true },
  ]
);

console.log('\n✅ Quiz Module 2 ajouté avec succès ! (' + 10 + ' questions, score de passage : 7/10)');
