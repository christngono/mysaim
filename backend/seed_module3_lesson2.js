const db = require('./db/database');

console.log('📚 Seed Module 3 — Leçon 2 + Quiz');

const mod3 = db.prepare('SELECT id FROM modules WHERE order_index = 3').get();
if (!mod3) { console.error('❌ Module 3 introuvable.'); process.exit(1); }
const modId = mod3.id;

// ─── Leçon 2 ─────────────────────────────────────────────────────────────────
const existing = db.prepare('SELECT id FROM lessons WHERE module_id = ? AND order_index = 2').get(modId);
if (existing) { db.prepare('DELETE FROM lessons WHERE id = ?').run(existing.id); console.log('  🗑️  Leçon 2 existante supprimée'); }

const contentFr = JSON.stringify({
  intro: "Dans la leçon précédente, tu as découvert le cadre T.C.R.É.I. Maintenant, soyons honnêtes : même avec ce cadre, il t'arrivera parfois d'obtenir une réponse qui ne te convient pas. Et c'est tout à fait normal ! C'est comme rédiger un rapport pour ta direction — le premier jet est rarement le bon. Avec l'IA, ce processus d'affinage s'appelle l'itération. Aujourd'hui, on va apprendre à le faire comme un pro.",
  sections: [
    {
      type: 'retenir',
      title: 'Rappel : le I de T.C.R.É.I.',
      text: "Le I signifie Itération — affiner ton prompt jusqu'à obtenir exactement ce que tu veux. Dans cette leçon, on va voir 4 méthodes concrètes pour itérer intelligemment.\n\n💡 Règle d'or : Reste toujours dans le même fil de discussion ! L'IA mémorise tout ce que tu lui as dit dans la conversation en cours. Si tu ouvres une nouvelle conversation, elle repart de zéro."
    },
    {
      type: 'infobox',
      icon: '🔧',
      title: 'Méthode 1 — Revois ton cadre T.C.R.É.I.',
      text: "Quand la réponse est décevante, pose-toi la question : « Est-ce que j'ai bien rempli toutes les cases du cadre ? »\n\n✅ Ma Tâche est-elle claire ? Ai-je donné un rôle et un format ?\n✅ Mon Contexte est-il suffisamment précis ?\n✅ Ai-je fourni des Références utiles ?\n\n❌ Prompt faible : « Rédige une offre d'emploi pour un Responsable Paie. »\n\n✅ Prompt complet : « Tu es un Responsable RH senior avec 10 ans d'expérience dans une entreprise industrielle au Cameroun. Rédige une offre d'emploi pour un poste de Responsable Paie. L'entreprise est basée à Douala, compte 300 employés et utilise le logiciel Sage Paie. Le candidat doit maîtriser la législation sociale camerounaise. Format : titre accrocheur, missions, profil recherché, conditions. Ton professionnel mais accessible. »"
    },
    {
      type: 'infobox',
      icon: '✂️',
      title: 'Méthode 2 — Découpe ta demande en petites étapes',
      text: "Quand ta tâche est complexe, ne mets pas tout dans un seul prompt. Procède par phases !\n\nExemple — Rapport de clôture de projet :\n\nPrompt 1 : « Liste les éléments clés d'un bon rapport de clôture selon les standards du PMI. »\nPrompt 2 : « Parmi ces éléments, lesquels sont les plus importants pour une direction générale ? »\nPrompt 3 : « Sur cette base, rédige la structure d'un rapport de clôture pour un projet de déploiement d'un logiciel RH dans une entreprise de 500 personnes à Yaoundé, budget 25 millions FCFA, durée 8 mois. »\n\nChaque réponse construit sur la précédente. Le résultat final sera structuré et pertinent."
    },
    {
      type: 'infobox',
      icon: '🔄',
      title: 'Méthode 3 — Change ta formulation ou aborde le problème autrement',
      text: "Parfois la réponse est correcte... mais trop générique. Elle pourrait s'appliquer à n'importe quelle entreprise. Dans ce cas, change d'angle et replace l'IA dans ta réalité professionnelle.\n\n❌ Trop général : « Comment communiquer sur une restructuration en entreprise ? »\n\n✅ Ancré dans le réel : « Tu es Directrice de la Communication interne dans une entreprise de télécommunications à Douala, avec 800 employés. Ton DG vient de valider un plan de restructuration qui touche 3 départements. Propose un plan de communication interne en 3 phases pour annoncer cette nouvelle de façon transparente et limiter les rumeurs. »\n\nDonner un rôle précis, un secteur concret et un problème réel force l'IA à entrer dans ton quotidien professionnel."
    },
    {
      type: 'infobox',
      icon: '🚧',
      title: 'Méthode 4 — Ajoute des contraintes',
      text: "Paradoxalement, limiter l'IA l'aide à être plus précise et utile. En posant des limites claires — format, longueur, ton, cible — tu obtiens des résultats directement exploitables.\n\n❌ Sans contrainte : « Rédige un post LinkedIn sur notre entreprise. »\n\n✅ Avec contraintes : « Rédige un post LinkedIn pour valoriser la marque employeur de notre entreprise. Contraintes : maximum 150 mots, ton chaleureux et professionnel, inclure un appel à l'action pour attirer des candidats, mentionner que nous sommes basés à Yaoundé et que nous offrons des opportunités de formation continue. Terminer par 3 hashtags pertinents. »\n\nRésultat : un post prêt à publier, sans retouche majeure."
    },
    {
      type: 'retenir',
      title: 'À retenir — Les 4 méthodes',
      text: "🔧 Revoir le cadre T.C.R.É.I. → La réponse est vague ou hors sujet\n✂️ Découper en étapes → Ta tâche est complexe, avec plusieurs dimensions\n🔄 Changer la formulation → La réponse est correcte mais trop générique\n🚧 Ajouter des contraintes → Tu veux un livrable directement utilisable\n\n💡 Le réflexe du pro : Avant d'ouvrir une nouvelle conversation, demande-toi : « Est-ce que j'ai bien utilisé mes 4 méthodes d'itération ? » La plupart du temps, la solution est dans l'affinement, pas dans le recommencement."
    }
  ],
  keywords: ['itération', 'T.C.R.É.I.', 'contrainte', 'formulation', 'étapes', 'prompt avancé']
});

const contentEn = JSON.stringify({
  intro: "In the previous lesson, you discovered the T.C.R.E.I. framework. Now, let's be honest: even with this framework, you'll sometimes get a response that doesn't suit you. And that's completely normal! It's like writing a report for management — the first draft is rarely the best. With AI, this refinement process is called iteration. Today, we'll learn to do it like a pro.",
  sections: [
    {
      type: 'retenir',
      title: 'Reminder: the I in T.C.R.E.I.',
      text: "The I stands for Iteration — refining your prompt until you get exactly what you want. In this lesson, we'll see 4 concrete methods to iterate intelligently.\n\n💡 Golden rule: Always stay in the same conversation thread! The AI remembers everything you've said in the current conversation. If you open a new conversation, it starts from scratch."
    },
    {
      type: 'infobox',
      icon: '🔧',
      title: 'Method 1 — Review your T.C.R.E.I. framework',
      text: "When the response is disappointing, ask yourself: 'Have I properly filled in all the framework boxes?'\n\n✅ Is my Task clear? Did I give a role and a format?\n✅ Is my Context precise enough?\n✅ Did I provide useful References?\n\n❌ Weak prompt: 'Write a job posting for a Payroll Manager.'\n\n✅ Complete prompt: 'You are a senior HR Manager with 10 years of experience in an industrial company in Cameroon. Write a job posting for a Payroll Manager position. The company is based in Douala, has 300 employees and uses Sage Payroll software. The candidate must master Cameroonian labor law. Format: catchy title, missions, required profile, conditions. Professional but accessible tone.'"
    },
    {
      type: 'infobox',
      icon: '✂️',
      title: 'Method 2 — Break your request into small steps',
      text: "When your task is complex, don't put everything in one prompt. Work in phases!\n\nExample — Project closure report:\n\nPrompt 1: 'List the key elements of a good project closure report according to PMI standards.'\nPrompt 2: 'Among these elements, which are most important to highlight for executive management?'\nPrompt 3: 'Based on this, write the structure of a closure report for an HR software deployment project in a 500-person company in Yaoundé, budget 25 million FCFA, duration 8 months.'\n\nEach response builds on the previous one."
    },
    {
      type: 'infobox',
      icon: '🔄',
      title: 'Method 3 — Change your wording or approach the problem differently',
      text: "Sometimes the response is correct... but too generic. It could apply to any company. In that case, change the angle and place the AI in your professional reality.\n\n❌ Too general: 'How to communicate about a restructuring?'\n\n✅ Grounded in reality: 'You are the Internal Communications Director at a telecommunications company in Douala with 800 employees. Your CEO just approved a restructuring plan affecting 3 departments. Propose a 3-phase internal communication plan to announce this news transparently and limit hallway rumors.'\n\nGiving a precise role, concrete sector and real problem forces AI to enter your daily professional life."
    },
    {
      type: 'infobox',
      icon: '🚧',
      title: 'Method 4 — Add constraints',
      text: "Paradoxically, limiting the AI helps it be more precise and useful. By setting clear limits — format, length, tone, target — you get directly usable results.\n\n❌ Without constraint: 'Write a LinkedIn post about our company.'\n\n✅ With constraints: 'Write a LinkedIn post to promote our employer brand. Constraints: maximum 150 words, warm and professional tone, include a call to action to attract candidates, mention we are based in Yaoundé and offer continuous training opportunities. End with 3 relevant hashtags.'\n\nResult: a post ready to publish, without major rewriting."
    },
    {
      type: 'retenir',
      title: 'Key takeaway — The 4 methods',
      text: "🔧 Review T.C.R.E.I. framework → Response is vague or off-topic\n✂️ Break into steps → Task is complex with multiple dimensions\n🔄 Change wording → Response is correct but too generic\n🚧 Add constraints → You want a directly usable deliverable\n\n💡 The pro reflex: Before opening a new conversation, ask yourself: 'Have I properly used my 4 iteration methods?' Most of the time, the solution is in refinement, not restarting."
    }
  ],
  keywords: ['iteration', 'T.C.R.E.I.', 'constraint', 'wording', 'steps', 'advanced prompt']
});

db.prepare(`
  INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_en, order_index, is_published)
  VALUES (?, ?, ?, ?, ?, 2, 1)
`).run(modId, 'Leçon 2 : Les méthodes avancées du Prompt', 'Lesson 2: Advanced Prompting Methods', contentFr, contentEn);
console.log('  ✅ Leçon 2 créée');

// ─── QUIZ Leçon 2 ─────────────────────────────────────────────────────────────
// Le quiz du module 3 existe déjà (leçon 1). On crée un quiz séparé lié au module
// via un champ lesson_order pour distinguer les deux quizzes du module 3.
// Pour simplifier : on met à jour le quiz existant du module 3 en ajoutant 10 nouvelles questions,
// OU on crée un quiz dédié à la leçon 2 avec un titre distinct.

// Vérifier si un quiz "Leçon 2" existe déjà
const existingQ2 = db.prepare("SELECT id FROM quizzes WHERE module_id = ? AND title_fr LIKE '%Leçon 2%'").get(modId);
if (existingQ2) { db.prepare('DELETE FROM quizzes WHERE id = ?').run(existingQ2.id); console.log('  🗑️  Quiz Leçon 2 existant supprimé'); }

const quizRes = db.prepare(`
  INSERT INTO quizzes (module_id, title_fr, title_en, passing_score, is_published)
  VALUES (?, ?, ?, ?, 1)
`).run(
  modId,
  "Quiz — Module 3, Leçon 2 : Les méthodes avancées du Prompt",
  "Quiz — Module 3, Lesson 2: Advanced Prompting Methods",
  7
);
const quizId = quizRes.lastInsertRowid;
console.log('  ✅ Quiz Leçon 2 créé (id=' + quizId + ')');

function addQ(order, qFr, qEn, explFr, explEn, choices) {
  const qRes = db.prepare(`
    INSERT INTO quiz_questions (quiz_id, question_fr, question_en, explanation_fr, explanation_en, order_index)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(quizId, qFr, qEn, explFr, explEn, order);
  const qId = qRes.lastInsertRowid;
  choices.forEach((c, i) => {
    db.prepare(`INSERT INTO quiz_choices (question_id, text_fr, text_en, is_correct, order_index) VALUES (?, ?, ?, ?, ?)`)
      .run(qId, c.fr, c.en, c.correct ? 1 : 0, i);
  });
  console.log('  ✅ Q' + order + ' ajoutée');
}

addQ(1,
  "Tu envoies un prompt à l'IA et la réponse est complètement vague et hors sujet. Quelle est la première chose à faire ?",
  "You send a prompt to the AI and the response is completely vague and off-topic. What is the first thing to do?",
  "Avant tout, vérifie si ta Tâche, ton Contexte et tes Références sont bien renseignés. C'est souvent là que le problème se cache !",
  "First, check if your Task, Context and References are properly filled in. That's usually where the problem lies!",
  [
    { fr: "Ouvrir une nouvelle conversation et recommencer", en: "Open a new conversation and start over", correct: false },
    { fr: "Revoir ton cadre T.C.R.É.I. et vérifier si tous les éléments sont présents", en: "Review your T.C.R.E.I. framework and check if all elements are present", correct: true },
    { fr: "Changer d'outil IA", en: "Switch to a different AI tool", correct: false },
    { fr: "Accepter la réponse et faire avec", en: "Accept the response and work with it", correct: false }
  ]
);

addQ(2,
  "Pourquoi est-il important de rester dans le même fil de discussion quand on itère avec l'IA ?",
  "Why is it important to stay in the same conversation thread when iterating with AI?",
  "Dans un même fil, l'IA mémorise tout ce qui a été dit avant. Elle peut donc construire des réponses de plus en plus précises et adaptées à ton contexte.",
  "In the same thread, the AI remembers everything said before. It can therefore build increasingly precise and context-adapted responses.",
  [
    { fr: "Pour ne pas payer plus cher", en: "To avoid paying more", correct: false },
    { fr: "Pour que l'IA conserve le contexte et s'appuie sur les échanges précédents", en: "So the AI retains context and builds on previous exchanges", correct: true },
    { fr: "Parce que l'IA fonctionne mieux la nuit", en: "Because AI works better at night", correct: false },
    { fr: "Pour éviter les bugs techniques", en: "To avoid technical bugs", correct: false }
  ]
);

addQ(3,
  "Marie est Responsable RH. Elle demande : « Rédige une offre d'emploi. » La réponse est trop générique. Quelle méthode doit-elle appliquer en priorité ?",
  "Marie is an HR Manager. She asks: 'Write a job posting.' The response is too generic. Which method should she apply first?",
  "Sa demande manque de contexte et de précision. En enrichissant son prompt avec les bons éléments du cadre T.C.R.É.I., elle obtiendra une offre directement exploitable.",
  "Her request lacks context and precision. By enriching her prompt with the right T.C.R.E.I. elements, she'll get a directly usable job posting.",
  [
    { fr: "Découper sa demande en petites étapes", en: "Break her request into small steps", correct: false },
    { fr: "Ajouter des contraintes de longueur", en: "Add length constraints", correct: false },
    { fr: "Revoir son cadre T.C.R.É.I. en ajoutant le poste, l'entreprise, la localisation et le format", en: "Review her T.C.R.E.I. framework adding the position, company, location and format", correct: true },
    { fr: "Changer d'outil IA", en: "Switch to a different AI tool", correct: false }
  ]
);

addQ(4,
  "Paul est Chef de projet. Il doit préparer un rapport de clôture complet. Quelle méthode est la plus adaptée ?",
  "Paul is a Project Manager. He needs to prepare a complete closure report. Which method is most appropriate?",
  "Une tâche complexe comme un rapport de clôture se traite mieux étape par étape. Chaque réponse enrichit la suivante et le résultat final est beaucoup plus solide.",
  "A complex task like a closure report is best handled step by step. Each response enriches the next and the final result is much more solid.",
  [
    { fr: "Envoyer un seul prompt très long avec toutes les informations", en: "Send one very long prompt with all the information", correct: false },
    { fr: "Découper sa demande en plusieurs prompts progressifs", en: "Break his request into several progressive prompts", correct: true },
    { fr: "Ajouter des contraintes de format uniquement", en: "Add format constraints only", correct: false },
    { fr: "Changer sa formulation en posant une question similaire", en: "Change his wording by asking a similar question", correct: false }
  ]
);

addQ(5,
  "Qu'est-ce qu'une contrainte dans un prompt ?",
  "What is a constraint in a prompt?",
  "Une contrainte, c'est une limite volontaire qu'on impose à l'IA : maximum 150 mots, ton formel, cibler les cadres... Ces limites rendent la réponse plus précise et directement utilisable.",
  "A constraint is a voluntary limit imposed on the AI: maximum 150 words, formal tone, targeting managers... These limits make the response more precise and directly usable.",
  [
    { fr: "Une erreur dans la formulation de la demande", en: "An error in the request formulation", correct: false },
    { fr: "Une limite imposée à l'IA sur le format, la longueur, le ton ou la cible", en: "A limit imposed on the AI regarding format, length, tone or target", correct: true },
    { fr: "Une question posée à l'IA pour évaluer sa performance", en: "A question asked to the AI to evaluate its performance", correct: false },
    { fr: "Un document de référence joint au prompt", en: "A reference document attached to the prompt", correct: false }
  ]
);

addQ(6,
  "Sophie demande : « Comment communiquer sur une restructuration ? » La réponse est correcte mais trop générale. Que doit-elle faire ?",
  "Sophie asks: 'How to communicate about a restructuring?' The response is correct but too general. What should she do?",
  "La réponse est correcte mais générique. En changeant la formulation — avec un rôle, un secteur, une situation concrète — l'IA sort des réponses standards pour entrer dans sa réalité.",
  "The response is correct but generic. By changing the wording — with a role, a sector, a concrete situation — the AI moves beyond standard responses into her reality.",
  [
    { fr: "Ajouter des contraintes de longueur", en: "Add length constraints", correct: false },
    { fr: "Découper sa demande en 3 prompts distincts", en: "Break her request into 3 distinct prompts", correct: false },
    { fr: "Reformuler en donnant un rôle précis et en ancrant la situation dans son contexte réel", en: "Reformulate by giving a precise role and anchoring the situation in her real context", correct: true },
    { fr: "Recommencer dans une nouvelle conversation", en: "Start over in a new conversation", correct: false }
  ]
);

addQ(7,
  "Lequel de ces prompts est le mieux formulé pour un Responsable Communication ?",
  "Which of these prompts is best formulated for a Communications Manager?",
  "Ce prompt intègre des contraintes claires : longueur, ton, objectif, localisation et format. Le résultat sera directement publiable sans réécriture majeure.",
  "This prompt includes clear constraints: length, tone, objective, location and format. The result will be directly publishable without major rewriting.",
  [
    { fr: "« Rédige un post LinkedIn pour mon entreprise. »", en: "'Write a LinkedIn post for my company.'", correct: false },
    { fr: "« Écris quelque chose pour LinkedIn. »", en: "'Write something for LinkedIn.'", correct: false },
    { fr: "« Rédige un post LinkedIn de 150 mots max, ton professionnel et chaleureux, pour valoriser notre marque employeur à Yaoundé, avec un appel à l'action et 3 hashtags. »", en: "'Write a LinkedIn post of max 150 words, professional and warm tone, to promote our employer brand in Yaoundé, with a call to action and 3 hashtags.'", correct: true },
    { fr: "« Fais un post LinkedIn sympa. »", en: "'Make a nice LinkedIn post.'", correct: false }
  ]
);

addQ(8,
  "Combien de méthodes d'itération avancées avons-nous vues dans cette leçon ?",
  "How many advanced iteration methods did we see in this lesson?",
  "Les 4 méthodes sont : Revoir le cadre T.C.R.É.I., Découper en étapes, Changer la formulation, et Ajouter des contraintes.",
  "The 4 methods are: Review the T.C.R.E.I. framework, Break into steps, Change the wording, and Add constraints.",
  [
    { fr: "2", en: "2", correct: false },
    { fr: "3", en: "3", correct: false },
    { fr: "5", en: "5", correct: false },
    { fr: "4", en: "4", correct: true }
  ]
);

addQ(9,
  "Jean a déjà obtenu une bonne liste de tendances via l'IA. Il veut maintenant construire un plan d'action sur cette base. Que doit-il faire ?",
  "Jean already got a good list of trends from the AI. He now wants to build an action plan on this basis. What should he do?",
  "C'est exactement l'avantage du même fil de discussion. L'IA se souvient des tendances et peut directement construire le plan d'action en cohérence avec ce travail déjà fait.",
  "This is exactly the advantage of the same conversation thread. The AI remembers the trends and can directly build the action plan in line with the work already done.",
  [
    { fr: "Ouvrir une nouvelle conversation et tout recommencer", en: "Open a new conversation and start over", correct: false },
    { fr: "Continuer dans le même fil et demander à l'IA de construire le plan sur ce qu'elle a déjà fourni", en: "Continue in the same thread and ask the AI to build the plan on what it already provided", correct: true },
    { fr: "Copier-coller la réponse dans un nouveau prompt", en: "Copy-paste the response into a new prompt", correct: false },
    { fr: "Changer d'outil IA pour cette nouvelle étape", en: "Switch to a different AI tool for this new step", correct: false }
  ]
);

addQ(10,
  "Quel est le vrai avantage d'ajouter des contraintes à un prompt ?",
  "What is the real advantage of adding constraints to a prompt?",
  "Paradoxalement, limiter l'IA la rend plus créative et pertinente. Des contraintes bien posées produisent des livrables qu'on peut utiliser directement dans un contexte professionnel.",
  "Paradoxically, limiting the AI makes it more creative and relevant. Well-placed constraints produce deliverables that can be used directly in a professional context.",
  [
    { fr: "Cela ralentit l'IA et lui donne plus de temps pour réfléchir", en: "It slows the AI down and gives it more time to think", correct: false },
    { fr: "Cela réduit le coût d'utilisation de l'outil", en: "It reduces the cost of using the tool", correct: false },
    { fr: "Cela oriente l'IA vers un résultat plus précis, ciblé et directement utilisable, sans réécriture", en: "It guides the AI toward a more precise, targeted and directly usable result, without rewriting", correct: true },
    { fr: "Cela empêche l'IA de faire des erreurs de langue", en: "It prevents the AI from making language errors", correct: false }
  ]
);

console.log('\n✅ Module 3 — Leçon 2 + Quiz (10 Q) ajoutés avec succès !');
