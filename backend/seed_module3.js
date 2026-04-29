const db = require('./db/database');

console.log('📚 Seed Module 3 — Leçon 1, Quiz, Exercice interactif');

// ─── Récupérer Module 3 ───────────────────────────────────────────────────────
let mod3 = db.prepare('SELECT id FROM modules WHERE order_index = 3').get();
if (!mod3) {
  console.error('❌ Module 3 introuvable. Lancez seed.js d\'abord.');
  process.exit(1);
}
const modId = mod3.id;

// Publier le module 3
db.prepare('UPDATE modules SET is_published = 1 WHERE id = ?').run(modId);
console.log('  ✅ Module 3 publié');

// ─── Supprimer les leçons existantes du module 3 ──────────────────────────────
db.prepare('DELETE FROM lessons WHERE module_id = ?').run(modId);
console.log('  🗑️  Leçons existantes supprimées');

// ─── Leçon 1 ─────────────────────────────────────────────────────────────────
const contentFr = JSON.stringify({
  intro: "Bienvenue dans le Module 3 ! Vous avez découvert ce qu'est l'IA, comment elle fonctionne et ses limites. Maintenant, nous allons apprendre à lui parler, à la guider pour qu'elle devienne votre meilleure alliée. C'est ce qu'on appelle l'Art du Prompting.",
  sections: [
    {
      type: 'infobox',
      icon: '💬',
      title: "C'est quoi un prompt ?",
      text: "Imaginez que l'IA est un génie très puissant, mais qui ne comprend que ce que vous lui dites. Le prompt, c'est l'instruction, la question ou la commande que vous donnez à l'IA. C'est votre façon de lui indiquer ce que vous attendez d'elle."
    },
    {
      type: 'retenir',
      title: 'À retenir',
      text: "La qualité de la réponse de l'IA dépend directement de la qualité de votre prompt. Un bon prompt, c'est la clé pour obtenir des résultats précis et efficaces. Un prompt vague donnera une réponse vague !"
    },
    {
      type: 'infobox',
      icon: '🏗️',
      title: 'Le cadre T.C.R.É.I.',
      text: "Un bon prompt suit un cadre simple en 5 étapes : Tâche, Contexte, Références, Évaluation et Itération.\n\nSi vous oubliez une étape, retenez ceci : « Toujours Créer des Requêtes Excellentes et Inspirées »."
    },
    {
      type: 'infobox',
      icon: '1️⃣',
      title: '1. La Tâche',
      text: "Décrivez clairement la tâche pour laquelle l'IA doit vous aider. Incluez :\n• Un rôle : quelle expertise l'IA doit-elle adopter ? (ex : « rédacteur de discours » ou « responsable marketing avec 15 ans d'expérience »)\n• Un format : quelle forme voulez-vous ? (liste à puces, phrases courtes, tableau…)"
    },
    {
      type: 'infobox',
      icon: '2️⃣',
      title: '2. Le Contexte',
      text: "Ajoutez les détails qui aident l'IA à comprendre ce dont vous avez besoin.\n\n❌ Vague : « Trouve des idées pour un cadeau d'anniversaire à moins de 30 dollars »\n\n✅ Précis : « Donne-moi cinq idées pour un cadeau. Budget : 30$. Personne de 29 ans qui aime les sports d'hiver, récemment passée du snowboard au ski. »"
    },
    {
      type: 'infobox',
      icon: '3️⃣',
      title: '3. La Référence',
      text: "Parfois, vous pouvez fournir des exemples ou des documents que l'IA utilisera pour créer son résultat. Si vous avez déjà offert un cadeau précis, dites-le : l'IA s'en inspirera pour mieux vous correspondre.\n\nNote : il n'y aura pas toujours de références disponibles, surtout pour des idées abstraites."
    },
    {
      type: 'infobox',
      icon: '4️⃣',
      title: '4. L\'Évaluation',
      text: "Une fois le résultat obtenu, évaluez-le. Demandez-vous : les informations fournies correspondent-elles à ce que vous attendiez ? Est-ce le bon ton, le bon format, la bonne profondeur ?"
    },
    {
      type: 'infobox',
      icon: '5️⃣',
      title: '5. L\'Itération',
      text: "Si le résultat ne répond pas à vos besoins, recommencez en ajoutant des informations ou en modifiant votre prompt. L'itération est la clé d'un prompting efficace : pensez-y comme une conversation, pas comme une question unique."
    },
    {
      type: 'retenir',
      title: 'Résumé du cadre T.C.R.É.I.',
      text: "L'ordre des étapes importe moins que leur substance. Tentez toujours de créer des Requêtes Excellentes et Inspirées :\n\n• T — Tâche (avec rôle + format)\n• C — Contexte (détails précis)\n• R — Référence (exemples, documents)\n• É — Évaluation (analyser le résultat)\n• I — Itération (affiner jusqu'à satisfaction)"
    }
  ],
  keywords: ['prompt', 'TCREI', 'tâche', 'contexte', 'référence', 'évaluation', 'itération', 'prompting']
});

const contentEn = JSON.stringify({
  intro: "Welcome to Module 3! You've discovered what AI is, how it works and its limits. Now we'll learn how to talk to it, guide it so it becomes your best ally. This is called the Art of Prompting.",
  sections: [
    {
      type: 'infobox',
      icon: '💬',
      title: "What is a prompt?",
      text: "Imagine AI is a very powerful genie, but it only understands what you tell it. A prompt is the instruction, question or command you give to the AI. It's your way of telling it what you expect."
    },
    {
      type: 'retenir',
      title: 'Key takeaway',
      text: "The quality of the AI's response directly depends on the quality of your prompt. A good prompt is the key to getting precise and effective results. A vague prompt will give a vague answer!"
    },
    {
      type: 'infobox',
      icon: '🏗️',
      title: 'The T.C.R.E.I. framework',
      text: "A good prompt follows a simple 5-step framework: Task, Context, References, Evaluation and Iteration.\n\nIf you forget a step, remember: 'Always Create Remarkable and Inspiring Requests'."
    },
    {
      type: 'infobox',
      icon: '1️⃣',
      title: '1. The Task',
      text: "Clearly describe the task for which you need AI's help. Include:\n• A role: what expertise should the AI adopt? (e.g. 'speechwriter' or 'marketing manager with 15 years of experience')\n• A format: what shape do you want? (bullet list, short sentences, table…)"
    },
    {
      type: 'infobox',
      icon: '2️⃣',
      title: '2. The Context',
      text: "Add details that help the AI understand what you need.\n\n❌ Vague: 'Find gift ideas for a birthday under $30'\n\n✅ Precise: 'Give me five gift ideas. Budget: $30. Person aged 29 who loves winter sports, recently switched from snowboarding to skiing.'"
    },
    {
      type: 'infobox',
      icon: '3️⃣',
      title: '3. The Reference',
      text: "Sometimes you can provide examples or documents the AI will use to create its output. If you previously gave a specific gift, mention it: the AI will use it to better match your style.\n\nNote: references aren't always available, especially for abstract ideas."
    },
    {
      type: 'infobox',
      icon: '4️⃣',
      title: '4. The Evaluation',
      text: "Once you have the result, evaluate it. Ask yourself: did the information provided match what you expected? Is it the right tone, format, depth?"
    },
    {
      type: 'infobox',
      icon: '5️⃣',
      title: '5. The Iteration',
      text: "If the result doesn't meet your needs, try again by adding information or modifying your prompt. Iteration is the key to effective prompting: think of it as a conversation, not a single question."
    },
    {
      type: 'retenir',
      title: 'T.C.R.E.I. Framework Summary',
      text: "The order of the steps matters less than their substance. Always try to create Remarkable and Inspiring Requests:\n\n• T — Task (with role + format)\n• C — Context (precise details)\n• R — Reference (examples, documents)\n• E — Evaluation (analyze the result)\n• I — Iteration (refine until satisfied)"
    }
  ],
  keywords: ['prompt', 'TCREI', 'task', 'context', 'reference', 'evaluation', 'iteration', 'prompting']
});

db.prepare(`
  INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_en, order_index, is_published)
  VALUES (?, ?, ?, ?, ?, 1, 1)
`).run(
  modId,
  'Leçon 1 : Formuler un prompt clair',
  'Lesson 1: How to Write a Clear Prompt',
  contentFr,
  contentEn
);
console.log('  ✅ Leçon 1 créée');

// ─── QUIZ ─────────────────────────────────────────────────────────────────────
const existingQuiz = db.prepare('SELECT id FROM quizzes WHERE module_id = ?').get(modId);
if (existingQuiz) {
  db.prepare('DELETE FROM quizzes WHERE id = ?').run(existingQuiz.id);
  console.log('  🗑️  Quiz existant supprimé');
}

const quizRes = db.prepare(`
  INSERT INTO quizzes (module_id, title_fr, title_en, passing_score, is_published)
  VALUES (?, ?, ?, ?, 1)
`).run(
  modId,
  "Quiz — Module 3 : L'Art du Prompting",
  "Quiz — Module 3: The Art of Prompting",
  7
);
const quizId = quizRes.lastInsertRowid;
console.log('  ✅ Quiz créé (id=' + quizId + ')');

function addQ(order, qFr, qEn, explFr, explEn, choices) {
  const qRes = db.prepare(`
    INSERT INTO quiz_questions (quiz_id, question_fr, question_en, explanation_fr, explanation_en, order_index)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(quizId, qFr, qEn, explFr, explEn, order);
  const qId = qRes.lastInsertRowid;
  choices.forEach((c, i) => {
    db.prepare(`
      INSERT INTO quiz_choices (question_id, text_fr, text_en, is_correct, order_index)
      VALUES (?, ?, ?, ?, ?)
    `).run(qId, c.fr, c.en, c.correct ? 1 : 0, i);
  });
  console.log('  ✅ Q' + order + ' ajoutée');
}

addQ(1,
  "Qu'est-ce qu'un prompt ?",
  "What is a prompt?",
  "Un prompt est l'instruction que vous donnez à l'IA. C'est votre commande, votre guide pour lui indiquer ce que vous attendez d'elle.",
  "A prompt is the instruction you give to the AI. It's your command, your guide to tell it what you expect from it.",
  [
    { fr: "Un type de logiciel.", en: "A type of software.", correct: false },
    { fr: "Une instruction ou commande donnée à l'IA.", en: "An instruction or command given to AI.", correct: true },
    { fr: "Un message d'erreur.", en: "An error message.", correct: false }
  ]
);

addQ(2,
  "De quoi dépend la qualité de la réponse de l'IA ?",
  "What does the quality of the AI's response depend on?",
  "La qualité de la réponse dépend directement de la qualité du prompt. Un prompt précis donne une réponse précise, un prompt vague donne une réponse vague.",
  "The quality of the response directly depends on the quality of the prompt. A precise prompt gives a precise answer, a vague prompt gives a vague answer.",
  [
    { fr: "De la vitesse d'internet.", en: "The internet speed.", correct: false },
    { fr: "Directement de la qualité du prompt.", en: "Directly on the quality of the prompt.", correct: true },
    { fr: "De l'heure de la journée.", en: "The time of day.", correct: false }
  ]
);

addQ(3,
  'Dans le cadre proposé, que signifie "le rôle" ?',
  'In the proposed framework, what does "the role" mean?',
  "Le rôle correspond à l'expertise ou la personnalité que vous attribuez à l'IA : rédacteur, expert marketing, coach... Cela oriente son ton et sa façon de répondre.",
  "The role corresponds to the expertise or personality you assign to the AI: writer, marketing expert, coach... This guides its tone and way of answering.",
  [
    { fr: "Le nom de l'utilisateur.", en: "The user's name.", correct: false },
    { fr: "L'expertise ou la personnalité que l'IA doit adopter.", en: "The expertise or personality the AI should adopt.", correct: true },
    { fr: "La marque de l'ordinateur.", en: "The computer brand.", correct: false }
  ]
);

addQ(4,
  "Lequel de ces éléments fait partie du cadre T.C.R.É.I. ?",
  "Which of these elements is part of the T.C.R.E.I. framework?",
  "Le cadre T.C.R.É.I. comprend : Tâche, Contexte, Référence, Évaluation et Itération. Le contexte est fondamental pour que l'IA comprenne précisément votre besoin.",
  "The T.C.R.E.I. framework includes: Task, Context, Reference, Evaluation and Iteration. Context is fundamental for AI to precisely understand your need.",
  [
    { fr: "La météo.", en: "The weather.", correct: false },
    { fr: "Le contexte.", en: "The context.", correct: true },
    { fr: "Le prix de l'IA.", en: "The price of AI.", correct: false }
  ]
);

addQ(5,
  "Donner un exemple de cadeau déjà offert correspond à quelle étape ?",
  "Giving an example of a previously given gift corresponds to which step?",
  "Fournir des exemples passés est une référence. Cela aide l'IA à mieux calibrer sa réponse selon votre goût et votre contexte personnel.",
  "Providing past examples is a reference. This helps AI better calibrate its response according to your taste and personal context.",
  [
    { fr: "La tâche.", en: "The task.", correct: false },
    { fr: "L'évaluation.", en: "The evaluation.", correct: false },
    { fr: "La référence.", en: "The reference.", correct: true }
  ]
);

addQ(6,
  "Quel format peut-on demander à l'IA ?",
  "What format can you ask the AI for?",
  "Le format désigne la forme souhaitée pour la réponse : liste à puces, tableau, email, résumé court... Préciser le format améliore toujours la lisibilité du résultat.",
  "The format is the desired shape for the response: bullet list, table, email, short summary... Specifying the format always improves the readability of the result.",
  [
    { fr: "Une couleur uniquement.", en: "A color only.", correct: false },
    { fr: "Une température.", en: "A temperature.", correct: false },
    { fr: "Un tableau ou une liste à puces.", en: "A table or a bullet list.", correct: true }
  ]
);

addQ(7,
  "Qu'est-ce que l'itération ?",
  "What is iteration?",
  "L'itération consiste à affiner et modifier son prompt pour améliorer progressivement le résultat. C'est une conversation avec l'IA, pas une question unique.",
  "Iteration consists of refining and modifying your prompt to progressively improve the result. It's a conversation with the AI, not a single question.",
  [
    { fr: "Modifier et affiner le prompt pour améliorer le résultat.", en: "Modifying and refining the prompt to improve the result.", correct: true },
    { fr: "Supprimer la réponse de l'IA.", en: "Deleting the AI's response.", correct: false },
    { fr: "Attendre que l'IA réponde.", en: "Waiting for the AI to respond.", correct: false }
  ]
);

addQ(8,
  "L'ordre des étapes dans un prompt est-il plus important que sa substance ?",
  "Is the order of steps in a prompt more important than its substance?",
  "L'ordre compte moins que la substance. Ce qui fait la différence, c'est la richesse des détails que vous fournissez : contexte précis, rôle clair, exemples concrets.",
  "Order matters less than substance. What makes the difference is the richness of the details you provide: precise context, clear role, concrete examples.",
  [
    { fr: "Oui, c'est primordial.", en: "Yes, it is essential.", correct: false },
    { fr: "Non, la substance et les détails comptent plus.", en: "No, substance and details matter more.", correct: true }
  ]
);

addQ(9,
  'Pourquoi ajouter un contexte comme "le budget est de 30 dollars" ?',
  'Why add context like "the budget is 30 dollars"?',
  "Le contexte précis permet à l'IA de filtrer ses suggestions et de les adapter à votre réalité concrète. Sans contexte, l'IA reste générique.",
  "Precise context allows AI to filter its suggestions and adapt them to your concrete reality. Without context, AI remains generic.",
  [
    { fr: "Pour limiter la puissance de l'IA.", en: "To limit the power of AI.", correct: false },
    { fr: "Pour aider l'IA à être plus précise et utile.", en: "To help the AI be more precise and useful.", correct: true },
    { fr: "Pour tester l'IA.", en: "To test the AI.", correct: false }
  ]
);

addQ(10,
  "L'acronyme pour se souvenir du cadre est :",
  "The acronym to remember the framework is:",
  "T.C.R.É.I. signifie : Tâche, Contexte, Référence, Évaluation, Itération. C'est votre boussole pour créer des prompts toujours plus efficaces.",
  "T.C.R.E.I. stands for: Task, Context, Reference, Evaluation, Iteration. It's your compass for creating increasingly effective prompts.",
  [
    { fr: "I.A. S.A.I.M.", en: "A.I. S.A.I.M.", correct: false },
    { fr: "T.C.R.É.I.", en: "T.C.R.E.I.", correct: true },
    { fr: "P.R.O.M.P.T.", en: "P.R.O.M.P.T.", correct: false }
  ]
);

// ─── EXERCICE INTERACTIF ──────────────────────────────────────────────────────
const existingEx = db.prepare('SELECT id FROM exercises WHERE module_id = ?').get(modId);
if (existingEx) {
  db.prepare('DELETE FROM exercises WHERE id = ?').run(existingEx.id);
  console.log('  🗑️  Exercice existant supprimé');
}

const instrFr = `[ATELIER_TCREI]
🎓 Atelier pratique : Maîtrisez le Prompting T.C.R.É.I. avec Gemini

OBJECTIF : Comparer un prompt vague à un prompt structuré T.C.R.É.I. pour mesurer l'impact réel sur la qualité des réponses de l'IA.

──────────────────────────────────────────
📌 ÉTAPE 1 — Choisissez votre sujet
Sélectionnez l'un des 3 sujets proposés ci-dessous. Ce sujet sera la base de tout votre exercice.

📌 ÉTAPE 2 — Connectez-vous sur Gemini
Gemini est l'assistant IA de Google. Il est gratuit et accessible depuis votre navigateur.
1. Ouvrez Chrome ou tout autre navigateur
2. Allez sur : gemini.google.com
3. Cliquez sur « Se connecter » en haut à droite
4. Utilisez votre compte Google (Gmail) pour vous connecter
5. Vous arrivez sur l'interface de Gemini — vous êtes prêt !

📌 ÉTAPE 3 — Testez le Prompt Vague (Phase 1)
Sur Gemini, tapez UNIQUEMENT l'intitulé du sujet choisi, sans aucun détail supplémentaire.
Exemple pour le Sujet B : « Donne-moi des idées de team-building virtuel »
→ Lisez attentivement la réponse. Est-elle précise ? Adaptée ? Ou trop générique ?
→ Notez mentalement votre impression.

📌 ÉTAPE 4 — Construisez le Prompt T.C.R.É.I. étape par étape (Phase 2)
Dans la MÊME conversation Gemini, ajoutez les éléments un par un et observez les changements :

🎯 TÂCHE + RÔLE — Relancez en ajoutant un rôle :
« Agis en tant qu'expert en [votre domaine]. Ta mission est de [votre objectif]. »
→ Observez : le ton change-t-il ? La réponse est-elle plus professionnelle ?

📍 CONTEXTE — Ajoutez des détails précis :
Précisez le budget, le nombre de personnes, les contraintes, le ton souhaité, le délai...
→ Observez : la réponse devient-elle plus concrète et adaptée à votre situation ?

📎 RÉFÉRENCE — Donnez un exemple passé :
« L'année dernière nous avons fait [exemple], propose quelque chose de différent. »
→ Observez : l'IA tient-elle compte de cet exemple ? Comment cela personalise-t-il la réponse ?

🔁 ITÉRATION — Affinez par des demandes successives :
« Rends la réponse plus courte », « Ajoute une option végétarienne », « Utilise un ton plus formel »...
→ Observez : combien d'échanges sont nécessaires pour atteindre le résultat souhaité ?

📌 ÉTAPE 5 — Revenez ici et répondez aux questions
Une fois votre session Gemini terminée, revenez sur cette page.
Cliquez sur « Commencer l'analyse », répondez aux 5 questions guidées, puis soumettez votre atelier.
──────────────────────────────────────────`;

const instrEn = `[ATELIER_TCREI]
🎓 Practical Workshop: Master T.C.R.E.I. Prompting with Gemini

OBJECTIVE: Compare a vague prompt to a structured T.C.R.E.I. prompt to measure the real impact on AI response quality.

──────────────────────────────────────────
📌 STEP 1 — Choose your topic
Select one of the 3 topics below. This topic will be the basis of your entire exercise.

📌 STEP 2 — Connect to Gemini
Gemini is Google's AI assistant. It's free and accessible from your browser.
1. Open Chrome or any other browser
2. Go to: gemini.google.com
3. Click "Sign in" at the top right
4. Use your Google account (Gmail) to sign in
5. You arrive on Gemini's interface — you're ready!

📌 STEP 3 — Test the Vague Prompt (Phase 1)
On Gemini, type ONLY the title of your chosen topic, with no extra details.
Example for Topic B: "Give me virtual team-building ideas"
→ Read the response carefully. Is it precise? Relevant? Or too generic?
→ Note your impression mentally.

📌 STEP 4 — Build the T.C.R.E.I. Prompt step by step (Phase 2)
In the SAME Gemini conversation, add elements one by one and observe the changes:

🎯 TASK + ROLE — Relaunch with a role:
"Act as an expert in [your field]. Your mission is to [your goal]."
→ Observe: does the tone change? Is the response more professional?

📍 CONTEXT — Add specific details:
Specify budget, number of people, constraints, desired tone, deadline...
→ Observe: does the response become more concrete and suited to your situation?

📎 REFERENCE — Give a past example:
"Last year we did [example], suggest something different."
→ Observe: does the AI take this example into account? How does it personalize the response?

🔁 ITERATION — Refine with follow-up requests:
"Make it shorter", "Add a vegetarian option", "Use a more formal tone"...
→ Observe: how many exchanges are needed to reach the desired result?

📌 STEP 5 — Come back here and answer the questions
Once your Gemini session is done, return to this page.
Click "Start analysis", answer the 5 guided questions, then submit your workshop.
──────────────────────────────────────────`;

const exRes = db.prepare(`
  INSERT INTO exercises (module_id, title_fr, title_en, instructions_fr, instructions_en, is_published)
  VALUES (?, ?, ?, ?, ?, 1)
`).run(
  modId,
  "Atelier du Prompting — T.C.R.É.I.",
  "Prompting Workshop — T.C.R.E.I.",
  instrFr,
  instrEn
);
const exId = exRes.lastInsertRowid;
console.log('  ✅ Exercice interactif créé (id=' + exId + ')');

const exQuestions = [
  {
    fr: "Quel sujet avez-vous choisi (A, B ou C) et quel rôle (Persona) avez-vous attribué à l'IA dans votre prompt Expert ? Comment ce rôle a-t-il modifié le ton de la réponse par rapport à votre premier essai ?",
    en: "Which topic did you choose (A, B or C) and what role (Persona) did you assign to the AI in your Expert prompt? How did this role change the tone of the response compared to your first attempt?"
  },
  {
    fr: "Citez au moins deux détails spécifiques que vous avez ajoutés dans votre prompt Expert (contexte). En quoi ces détails ont-ils rendu la réponse moins générique ?",
    en: "List at least two specific details you added in your Expert prompt (context). How did these details make the response less generic?"
  },
  {
    fr: "Avez-vous utilisé une référence (exemple ou document) dans votre prompt Expert ? Si oui, quel impact cela a-t-il eu ? Si non, quelle référence auriez-vous pu ajouter ?",
    en: "Did you use a reference (example or document) in your Expert prompt? If yes, what impact did it have? If no, what reference could you have added?"
  },
  {
    fr: "Avez-vous dû itérer (modifier) votre prompt après la première réponse de l'IA ? Décrivez ce que vous avez changé. Pourquoi l'itération est-elle une conversation plutôt qu'une simple question ?",
    en: "Did you have to iterate (modify) your prompt after the AI's first response? Describe what you changed. Why is iteration a conversation rather than a single question?"
  },
  {
    fr: "Notez la pertinence du prompt vague (1-10) et du prompt T.C.R.É.I. (1-10). Quel élément du cadre (T, C, R, É ou I) a eu le plus d'impact sur la qualité finale ? Justifiez votre réponse.",
    en: "Rate the relevance of the vague prompt (1-10) and the T.C.R.E.I. prompt (1-10). Which element of the framework (T, C, R, E or I) had the most impact on the final quality? Justify your answer."
  }
];

exQuestions.forEach((q, i) => {
  db.prepare(`
    INSERT INTO exercise_questions (exercise_id, question_fr, question_en, order_index)
    VALUES (?, ?, ?, ?)
  `).run(exId, q.fr, q.en, i + 1);
  console.log('  ✅ Question exercice ' + (i + 1) + ' ajoutée');
});

console.log('\n✅ Module 3 entièrement seeded ! Leçon 1 + Quiz (10 Q) + Exercice interactif (5 Q)');
