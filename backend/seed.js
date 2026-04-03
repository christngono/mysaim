const db = require('./db/database');
const bcrypt = require('bcryptjs');

console.log('🌱 Seeding database...');

// ─── Admin user ───────────────────────────────────────────────────────────────
const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@saim.cm');
if (!adminExists) {
  const hash = bcrypt.hashSync('Admin@2025!', 10);
  db.prepare(`
    INSERT INTO users (email, first_name, last_name, phone, password_hash, role, post, ai_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('admin@saim.cm', 'Admin', 'SAIM', '+237600000000', hash, 'admin', 'Administrateur', 5);
  console.log('  ✅ Admin created  (admin@saim.cm / Admin@2025!)');
}

// ─── Module 1 ─────────────────────────────────────────────────────────────────
let mod1 = db.prepare('SELECT id FROM modules WHERE order_index = 1').get();
if (!mod1) {
  const r = db.prepare(`
    INSERT INTO modules (title_fr, title_en, description_fr, description_en, order_index)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    'Introduction à l\'IA et à l\'IA Générative',
    'Introduction to AI and Generative AI',
    'Comprendre les bases de l\'Intelligence Artificielle, du Machine Learning et de la GenAI',
    'Understand the basics of Artificial Intelligence, Machine Learning and GenAI',
    1
  );
  mod1 = { id: r.lastInsertRowid };
  console.log('  ✅ Module 1 created');
}

// ─── Module 2 ─────────────────────────────────────────────────────────────────
let mod2 = db.prepare('SELECT id FROM modules WHERE order_index = 2').get();
if (!mod2) {
  const r = db.prepare(`
    INSERT INTO modules (title_fr, title_en, description_fr, description_en, order_index)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    'Optimiser sa productivité avec l\'IA',
    'Optimizing productivity with AI',
    'Apprendre à utiliser les outils IA dans votre travail quotidien',
    'Learn to use AI tools in your daily work',
    2
  );
  mod2 = { id: r.lastInsertRowid };
  console.log('  ✅ Module 2 created');
}

// ─── Module 3 ─────────────────────────────────────────────────────────────────
let mod3 = db.prepare('SELECT id FROM modules WHERE order_index = 3').get();
if (!mod3) {
  const r = db.prepare(`
    INSERT INTO modules (title_fr, title_en, description_fr, description_en, order_index)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    'L\'art du Prompting',
    'The Art of Prompting',
    'Maîtriser la rédaction de prompts performants pour obtenir les meilleurs résultats',
    'Master the writing of effective prompts to get the best results',
    3
  );
  mod3 = { id: r.lastInsertRowid };
  console.log('  ✅ Module 3 created');
}

// ─── Lessons for Module 1 ─────────────────────────────────────────────────────
const lessonsM1 = [
  {
    title_fr: 'Définition : C\'est quoi l\'IA ?',
    title_en: 'Definition: What is AI?',
    content_fr: JSON.stringify({
      intro: "L'IA est déjà tout autour de nous. Vous en entendez parler partout : ChatGPT, Gemini, des robots ou des drones intelligents... On dit même souvent que le pays qui maîtrisera l'IA contrôlera le monde. Mais de quoi s'agit-il vraiment ?",
      sections: [
        {
          type: 'infobox',
          icon: '📱',
          title: 'Réseaux sociaux (Facebook, TikTok)',
          text: "Votre fil d'actualité est unique. Il est construit spécialement pour vous selon vos goûts, vos \"likes\" et vos intérêts. Ce n'est pas de la magie, c'est de l'IA qui travaille pour vous proposer le contenu le plus pertinent."
        },
        {
          type: 'infobox',
          icon: '📧',
          title: 'Vos emails',
          text: "Quand vous répondez à un collègue et que votre boîte mail vous suggère la suite de la phrase en gris clair (ex: \"J'espère que vous allez bien\"), c'est encore l'IA !"
        },
        {
          type: 'retenir',
          title: 'En résumé',
          text: "L'IA est une technologie informatique qui permet de résoudre des problèmes complexes qu'on pensait réservés aux humains (comme comprendre une image ou raisonner). Ce n'est pas un cerveau humain, c'est un outil super puissant."
        }
      ],
      keywords: ['IA', 'ChatGPT', 'Gemini']
    }),
    content_en: JSON.stringify({
      intro: "AI is already all around us. You hear about it everywhere: ChatGPT, Gemini, intelligent robots and drones... People even say that the country that masters AI will control the world. But what exactly is it?",
      sections: [
        {
          type: 'infobox',
          icon: '📱',
          title: 'Social media (Facebook, TikTok)',
          text: "Your news feed is unique. It's built specifically for you based on your tastes, likes and interests. It's not magic — it's AI working to show you the most relevant content."
        },
        {
          type: 'infobox',
          icon: '📧',
          title: 'Your emails',
          text: "When you reply to a colleague and your email client suggests the next part of your sentence in light gray (e.g. \"I hope you are doing well\"), that's AI again!"
        },
        {
          type: 'retenir',
          title: 'In summary',
          text: "AI is a computer technology that solves complex problems once thought to be exclusive to humans (like understanding an image or reasoning). It's not a human brain — it's a super powerful tool."
        }
      ],
      keywords: ['AI', 'ChatGPT', 'Gemini']
    }),
    order_index: 1
  },
  {
    title_fr: 'Comment ça fonctionne ?',
    title_en: 'How does it work?',
    content_fr: JSON.stringify({
      intro: "L'IA ne fonctionne pas à l'eau (je rigole !), elle fonctionne avec de la Data (des données). Pour qu'une IA devienne intelligente, on doit lui donner énormément de données pour l'entraîner.",
      sections: [
        {
          type: 'infobox',
          icon: '💡',
          title: 'L\'exemple pour bien comprendre',
          text: "Pour qu'une IA reconnaisse la différence entre un homme et une femme, on lui montre des milliers de photos. Elle apprend les traits caractéristiques. À la fin, si vous lui montrez une photo qu'elle n'a jamais vue, elle saura répondre. C'est ce qu'on appelle le Machine Learning (l'apprentissage automatique)."
        },
        {
          type: 'retenir',
          title: 'À retenir',
          text: "Une IA, c'est un ensemble de technologies informatiques qui, pour fonctionner, a besoin de Data (données). On doit entraîner son Modèle d'IA avec ces données pour qu'il apprenne à résoudre des problèmes. Une fois suffisamment entraînée, elle devient capable de résoudre des problèmes de manière autonome."
        }
      ],
      keywords: ['Data', 'Machine Learning', "Modèle d'IA"]
    }),
    content_en: JSON.stringify({
      intro: "AI doesn't run on water (just kidding!), it runs on Data. For AI to become intelligent, it must be given enormous amounts of data to train on.",
      sections: [
        {
          type: 'infobox',
          icon: '💡',
          title: 'A concrete example',
          text: "To teach AI to recognize the difference between a man and a woman, it is shown thousands of photos labeled 'man' or 'woman'. It learns the distinguishing features. Shown a new photo, it can identify correctly. This is called Machine Learning."
        },
        {
          type: 'retenir',
          title: 'Key takeaway',
          text: "AI is a set of computer technologies that need Data to work. You must train its AI Model with data so it learns to solve problems. Once sufficiently trained, it can solve problems autonomously."
        }
      ],
      keywords: ['Data', 'Machine Learning', 'AI Model']
    }),
    order_index: 2
  },
  {
    title_fr: 'Où se cache l\'IA ? Les Serveurs',
    title_en: 'Where does AI live? Servers',
    content_fr: JSON.stringify({
      intro: "Les Modèles d'IA et les données sont stockés dans des serveurs. Imaginez de gros ordinateurs (des unités centrales géantes) qui tournent 24h/24 dans de grandes salles climatisées.",
      sections: [
        {
          type: 'image',
          src: '/images/server.jpg',
          alt: 'Salle de serveurs'
        },
        {
          type: 'paragraph',
          text: "Ces serveurs sont connectés à Internet et c'est ce qui vous permet d'accéder aux outils IA depuis votre téléphone ou votre ordinateur, n'importe où dans le monde."
        }
      ],
      keywords: ["Modèles d'IA", 'serveurs']
    }),
    content_en: JSON.stringify({
      intro: "AI Models and data are stored in servers. Think of large computers (giant processing units) running 24/7 in large air-conditioned rooms.",
      sections: [
        {
          type: 'image',
          src: '/images/server.jpg',
          alt: 'Server room'
        },
        {
          type: 'paragraph',
          text: "These servers are connected to the Internet, which is what lets you access AI tools from your phone or computer, anywhere in the world."
        }
      ],
      keywords: ['AI Models', 'servers']
    }),
    order_index: 3
  },
  {
    title_fr: 'L\'IA Générative (GenAI)',
    title_en: 'Generative AI (GenAI)',
    content_fr: JSON.stringify({
      intro: "C'est l'IA dont tout le monde parle en ce moment : ChatGPT, Gemini, Claude, Grok... L'IA Générative (GenAI) est une branche de l'IA qui se concentre sur la création de contenu : textes, images, vidéos et audio.",
      sections: [
        {
          type: 'tools',
          items: ['ChatGPT', 'Gemini', 'Claude', 'Grok']
        },
        {
          type: 'paragraph',
          text: "Pour les modèles qui génèrent du texte, ils regardent d'énormes quantités de textes afin d'apprendre à produire eux-mêmes de nouveaux textes au style humain."
        }
      ],
      keywords: ['GenAI', 'IA Générative', 'ChatGPT', 'Gemini', 'Claude', 'Grok']
    }),
    content_en: JSON.stringify({
      intro: "This is the AI everyone is talking about right now: ChatGPT, Gemini, Claude, Grok... Generative AI (GenAI) is a branch of AI focused on content creation: text, images, videos and audio.",
      sections: [
        {
          type: 'tools',
          items: ['ChatGPT', 'Gemini', 'Claude', 'Grok']
        },
        {
          type: 'paragraph',
          text: "Text models are trained on enormous amounts of text to learn how to produce new human-style text."
        }
      ],
      keywords: ['GenAI', 'Generative AI', 'ChatGPT', 'Gemini', 'Claude', 'Grok']
    }),
    order_index: 4
  },
  {
    title_fr: 'Applications de la GenAI : Email & Images',
    title_en: 'GenAI Applications: Email & Images',
    content_fr: JSON.stringify({
      intro: "La GenAI peut gérer un large éventail de tâches utiles. Voici deux exemples concrets avec Alice.",
      sections: [
        {
          type: 'example',
          tag: 'Exemple A',
          icon: '✉️',
          color: 'blue',
          title: "Aide à l'écriture — Rédiger un email difficile avec l'IA",
          story: "Alice doit envoyer un e-mail à sa cheffe au sujet d'une situation injuste : un collègue s'est attribué son travail lors de la dernière réunion. Le message est délicat — elle veut exprimer sa frustration sans paraître accusatrice.",
          description: "La GenAI peut rédiger un message formel, professionnel et équilibré à partir d'une simple instruction — qu'on appelle un prompt.",
          image: '/images/capture_generation_email.jpeg',
          caption: "Capture : ChatGPT générant un email professionnel et calme pour Alice"
        },
        {
          type: 'example',
          tag: 'Exemple B',
          icon: '🎨',
          color: 'purple',
          title: "Génération d'images — Dessiner une carte avec l'IA",
          story: "Cette fois, Alice veut créer une carte d'anniversaire pour son ami Bob. Elle imagine une illustration façon dessin animé avec des ballons et l'animal préféré de Bob : un raton laveur.",
          description: "Les modèles de GenAI peuvent transformer des descriptions textuelles en images — on parle de modèles text-to-image.",
          image: '/images/capture_generation_Image.jpeg',
          caption: "Capture : Une image générée à partir d'une description textuelle dans ChatGPT"
        }
      ],
      keywords: ['GenAI', 'prompt', 'text-to-image']
    }),
    content_en: JSON.stringify({
      intro: "GenAI can handle a wide range of useful tasks. Here are two concrete examples with Alice.",
      sections: [
        {
          type: 'example',
          tag: 'Example A',
          icon: '✉️',
          color: 'blue',
          title: "Writing assistant — Drafting a difficult email with AI",
          story: "Alice needs to send an email to her manager about an unfair situation: a colleague took credit for her work. The message is delicate — she wants to express her frustration without sounding accusatory.",
          description: "GenAI can write a formal, professional and balanced message from a simple instruction — what we call a prompt.",
          image: '/images/capture_generation_email.jpeg',
          caption: "Screenshot: ChatGPT drafting a professional and calm email for Alice"
        },
        {
          type: 'example',
          tag: 'Example B',
          icon: '🎨',
          color: 'purple',
          title: "Image generation — Drawing a card with AI",
          story: "This time, Alice wants to create a birthday card for her friend Bob. She envisions a cartoon-style illustration with balloons and Bob's favorite animal: a raccoon.",
          description: "GenAI models can turn text descriptions into images — these are called text-to-image models.",
          image: '/images/capture_generation_Image.jpeg',
          caption: "Screenshot: An image generated from a text description in ChatGPT"
        }
      ],
      keywords: ['GenAI', 'prompt', 'text-to-image']
    }),
    order_index: 5
  }
];

const existingLessons = db.prepare('SELECT id FROM lessons WHERE module_id = ?').all(mod1.id);
if (existingLessons.length === 0) {
  const insertLesson = db.prepare(`
    INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_en, order_index)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  lessonsM1.forEach(l => {
    insertLesson.run(mod1.id, l.title_fr, l.title_en, l.content_fr, l.content_en, l.order_index);
  });
  console.log(`  ✅ ${lessonsM1.length} lessons created for Module 1`);
}

// ─── Modules 3 & 4 (locked) ──────────────────────────────────────────────────
{
  let m3 = db.prepare('SELECT id FROM modules WHERE order_index = 3').get();
  if (!m3) {
    db.prepare(`INSERT INTO modules (title_fr, title_en, description_fr, description_en, order_index, is_published) VALUES (?, ?, ?, ?, ?, ?)`)
      .run("L'art du Prompting", 'The Art of Prompting', 'Maîtriser la rédaction de prompts performants', 'Master effective prompt writing', 3, 0);
    console.log('  ✅ Module 3 created (locked)');
  } else {
    db.prepare('UPDATE modules SET is_published = 0 WHERE order_index = 3').run();
    console.log('  ✅ Module 3 locked');
  }
}
{
  let m4 = db.prepare('SELECT id FROM modules WHERE order_index = 4').get();
  if (!m4) {
    db.prepare(`INSERT INTO modules (title_fr, title_en, description_fr, description_en, order_index, is_published) VALUES (?, ?, ?, ?, ?, ?)`)
      .run("Utilisation des Outils d'Intelligence Artificielle", 'Using Artificial Intelligence Tools', 'Découvrir et utiliser les principaux outils IA professionnels', 'Discover and use the main professional AI tools', 4, 0);
    console.log('  ✅ Module 4 created (locked)');
  } else {
    db.prepare('UPDATE modules SET is_published = 0 WHERE order_index = 4').run();
    console.log('  ✅ Module 4 locked');
  }
}

// ─── Lessons for Module 2 ─────────────────────────────────────────────────────
const existingLessonsM2 = db.prepare('SELECT id FROM lessons WHERE module_id = ?').all(mod2.id);
if (existingLessonsM2.length === 0) {
  const lessonsM2 = [
    {
      title_fr: "La créativité de l'IA, ses forces et ses limites",
      title_en: 'AI creativity, strengths and limitations',
      content_fr: JSON.stringify({
        intro: "Dans cette deuxième partie, nous allons plonger plus profondément dans le fonctionnement de l'IA générative. Vous allez découvrir que ces outils ne sont pas seulement \"intelligents\", ils sont capables de créer !",
        sections: [
          { type: 'infobox', icon: '🎨', title: 'La "créativité" des modèles de GenAI', text: "Les modèles d'IA générative produisent des résultats qui ressemblent de très près à ce qu'un humain pourrait créer. Techniquement, ces modèles ne \"créent\" pas à partir de rien. Ils combinent et réarrangent des morceaux d'informations rencontrés des millions de fois durant leur entraînement." },
          { type: 'retenir', title: 'À retenir', text: "On peut y voir une forme de \"créativité statistique\". L'IA échantillonne et réorganise des données réelles de façon nouvelle. C'est un outil puissant pour briser la page blanche, mais l'étincelle originale vient toujours de votre instruction (le prompt)." },
          { type: 'infobox', icon: '🤔', title: "L'IA peut-elle prendre des décisions ?", text: "Soyons clairs : l'IA n'est pas infaillible. Elle peut se tromper, et parfois avec beaucoup d'assurance ! Son comportement découle de patrons appris dans les données, et non d'une conscience ou d'un raisonnement logique pur. Elle n'a pas de \"bon sens\" inné." },
          { type: 'infobox', icon: '⚡', title: 'Les Forces : Puissance et Vitesse', text: "La GenAI produit des contenus de niveau humain à une vitesse fulgurante. En lui déléguant les tâches répétitives, on gagne du temps pour se concentrer sur la stratégie et l'humain." },
          { type: 'infobox', icon: '🎓', title: 'Exemple — Éducation', text: "Créer des exercices personnalisés pour chaque élève en un clic." },
          { type: 'infobox', icon: '🏥', title: 'Exemple — Santé', text: "Traduire un rapport médical complexe en mots simples pour un patient." },
          { type: 'infobox', icon: '📋', title: 'Exemple — Administration', text: "Synthétiser des documents de 50 pages en 5 points clés ou générer un projet de rapport." },
          { type: 'infobox', icon: '⚠️', title: 'Les Limites : Restez vigilants !', text: "• Consommation d'énergie : faire tourner ces modèles demande une puissance de calcul énorme.\n• Hallucinations : l'IA peut inventer des faits convaincants. Vérifiez toujours !\n• Biais : l'IA apprend sur Internet. Si les données sont biaisées, l'IA peut renforcer des stéréotypes." },
          { type: 'retenir', title: "Les biais de l'IA", text: "L'IA apprend sur Internet. Si les données ne représentent qu'une partie du monde (souvent l'Occident), l'IA fera de même. Gardez toujours votre esprit critique !" }
        ],
        keywords: ['créativité statistique', 'hallucinations', 'biais', 'prompt', 'GenAI']
      }),
      content_en: JSON.stringify({
        intro: "In this second part, we dive deeper into how generative AI works. You will discover that these tools are not just 'intelligent' — they can create!",
        sections: [
          { type: 'infobox', icon: '🎨', title: 'GenAI model "creativity"', text: "Generative AI models produce results that closely resemble what a human might create. Technically, they don't create from nothing. They combine and rearrange information encountered millions of times during training." },
          { type: 'retenir', title: 'Key takeaway', text: "Think of it as 'statistical creativity'. AI samples and reorganizes real data in new ways. It's a powerful tool for breaking writer's block, but the original spark always comes from your instruction (the prompt)." },
          { type: 'infobox', icon: '🤔', title: 'Can AI make decisions?', text: "To be clear: AI is not infallible. It can be wrong, sometimes with great confidence! Its behavior stems from patterns in data, not from consciousness or logic. It has no innate 'common sense'." },
          { type: 'infobox', icon: '⚡', title: 'Strengths: Power and Speed', text: "GenAI produces human-level content at lightning speed. By delegating repetitive tasks to AI, you free up time to focus on strategy and people." },
          { type: 'infobox', icon: '🎓', title: 'Example — Education', text: "Create personalized exercises for each student in one click." },
          { type: 'infobox', icon: '🏥', title: 'Example — Healthcare', text: "Translate a complex medical report into simple words for a patient." },
          { type: 'infobox', icon: '📋', title: 'Example — Administration', text: "Summarize 50-page documents into 5 key points or generate a report draft." },
          { type: 'infobox', icon: '⚠️', title: 'Limitations: Stay vigilant!', text: "• Energy consumption: running these models requires enormous computing power.\n• Hallucinations: AI can invent convincing facts. Always verify!\n• Bias: AI learns from the internet. If data is biased, AI may reinforce stereotypes." },
          { type: 'retenir', title: 'AI Bias', text: "AI learns from the internet. If data only represents part of the world (often the West), AI does the same. Always keep your critical mind!" }
        ],
        keywords: ['statistical creativity', 'hallucinations', 'bias', 'prompt', 'GenAI']
      }),
      order_index: 1
    },
    {
      title_fr: "Les outils d'IA en entreprise",
      title_en: 'AI tools in business',
      content_fr: JSON.stringify({
        intro: "Aujourd'hui, l'IA n'est plus un gadget, c'est un collaborateur. Voici les outils que vous retrouverez le plus souvent dans le monde professionnel.",
        sections: [
          { type: 'infobox', icon: '💬', title: 'Assistants Textuels', text: "Rédaction d'emails, rapports, traduction, analyse de documents." },
          { type: 'tools', items: ['ChatGPT (OpenAI)', 'Claude (Anthropic)', 'Gemini (Google)'] },
          { type: 'infobox', icon: '📊', title: 'Productivité Bureau', text: "Intégration directe dans Word, Excel ou PowerPoint pour créer des présentations ou analyser des tableaux." },
          { type: 'tools', items: ['Microsoft Copilot', 'Google Workspace AI'] },
          { type: 'infobox', icon: '🎨', title: 'Création Visuelle', text: "Création de visuels marketing, logos, présentations illustrées." },
          { type: 'tools', items: ['Midjourney', 'DALL-E 3', 'Canva Magic Design'] },
          { type: 'infobox', icon: '⚙️', title: 'Automatisation', text: "Connecter vos outils (ex: envoyer automatiquement un résumé d'email IA vers votre logiciel de gestion)." },
          { type: 'tools', items: ['Zapier', 'Make'] },
          { type: 'infobox', icon: '🎙️', title: 'Réunions & Audio', text: "Prise de notes automatique en réunion et résumé des décisions prises." },
          { type: 'tools', items: ['Otter.ai', 'Fireflies'] },
          { type: 'retenir', title: 'Le conseil SAIM', text: "Considérez l'IA comme un stagiaire très rapide mais qui a parfois trop d'imagination. Relisez-le, corrigez-le, et surtout, gardez toujours votre esprit critique. C'est ainsi que vous deviendrez réellement productif !" }
        ],
        keywords: ['ChatGPT', 'Claude', 'Gemini', 'Copilot', 'Midjourney', 'Zapier', 'Otter.ai']
      }),
      content_en: JSON.stringify({
        intro: "Today, AI is no longer a gadget — it's a collaborator. Here are the tools you'll encounter most often in the professional world.",
        sections: [
          { type: 'infobox', icon: '💬', title: 'Text Assistants', text: "Email drafting, reports, translation, document analysis." },
          { type: 'tools', items: ['ChatGPT (OpenAI)', 'Claude (Anthropic)', 'Gemini (Google)'] },
          { type: 'infobox', icon: '📊', title: 'Office Productivity', text: "Direct integration into Word, Excel or PowerPoint to create presentations or analyze spreadsheets." },
          { type: 'tools', items: ['Microsoft Copilot', 'Google Workspace AI'] },
          { type: 'infobox', icon: '🎨', title: 'Visual Creation', text: "Creating marketing visuals, logos, illustrated presentations." },
          { type: 'tools', items: ['Midjourney', 'DALL-E 3', 'Canva Magic Design'] },
          { type: 'infobox', icon: '⚙️', title: 'Automation', text: "Connect your tools (e.g. automatically send an AI email summary to your management software)." },
          { type: 'tools', items: ['Zapier', 'Make'] },
          { type: 'infobox', icon: '🎙️', title: 'Meetings & Audio', text: "Automatic note-taking in meetings and summary of decisions made." },
          { type: 'tools', items: ['Otter.ai', 'Fireflies'] },
          { type: 'retenir', title: 'SAIM advice', text: "Think of AI as a very fast intern who sometimes has too much imagination. Proofread it, correct it, and always keep your critical mind. That's how you'll become truly productive!" }
        ],
        keywords: ['ChatGPT', 'Claude', 'Gemini', 'Copilot', 'Midjourney', 'Zapier', 'Otter.ai']
      }),
      order_index: 2
    }
  ];

  const insertLesson2 = db.prepare(`INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_en, order_index) VALUES (?, ?, ?, ?, ?, ?)`);
  lessonsM2.forEach(l => insertLesson2.run(mod2.id, l.title_fr, l.title_en, l.content_fr, l.content_en, l.order_index));
  console.log(`  ✅ ${lessonsM2.length} lessons created for Module 2`);
}

// ─── Quiz Module 1 (reset + insert official content) ─────────────────────────
{
  const old = db.prepare('SELECT id FROM quizzes WHERE module_id = ?').get(mod1.id);
  if (old) {
    db.prepare('DELETE FROM quizzes WHERE id = ?').run(old.id); // cascades to questions, choices, attempts
    console.log('  🔄 Quiz Module 1 reset');
  }
}
{
  const existingQuizM1 = db.prepare('SELECT id FROM quizzes WHERE module_id = ?').get(mod1.id);
  if (!existingQuizM1) {
    const quizR = db.prepare(`INSERT INTO quizzes (module_id, title_fr, title_en, passing_score) VALUES (?, ?, ?, ?)`)
      .run(mod1.id, "Quiz — Introduction à l'IA et à l'IA Générative", 'Quiz — Introduction to AI and Generative AI', 7);
    const quizId = quizR.lastInsertRowid;

    const insertQ = db.prepare(`INSERT INTO quiz_questions (quiz_id, question_fr, question_en, explanation_fr, explanation_en, order_index) VALUES (?, ?, ?, ?, ?, ?)`);
    const insertC = db.prepare(`INSERT INTO quiz_choices (question_id, text_fr, text_en, is_correct, order_index) VALUES (?, ?, ?, ?, ?)`);

    const questions = [
      {
        fr: "Qu'est-ce que l'Intelligence Artificielle (IA) ?",
        en: "What is Artificial Intelligence (AI)?",
        xfr: "L'IA est un outil technologique très puissant, mais ce n'est pas un cerveau humain. Elle résout des problèmes complexes comme comprendre une image ou raisonner.",
        xen: "AI is a very powerful technological tool, but it's not a human brain. It solves complex problems like understanding an image or reasoning.",
        choices: [
          { fr: "Un cerveau humain numérique capable de ressentir des émotions", en: "A digital human brain capable of feeling emotions", ok: 0 },
          { fr: "Une technologie informatique qui permet de résoudre des problèmes complexes qu'on pensait réservés aux humains", en: "A computer technology that solves complex problems once thought reserved for humans", ok: 1 },
          { fr: "Un simple logiciel de calcul mathématique", en: "A simple mathematical calculation software", ok: 0 },
          { fr: "Un robot physique capable de marcher et parler", en: "A physical robot capable of walking and talking", ok: 0 }
        ]
      },
      {
        fr: "Lequel de ces exemples illustre l'utilisation de l'IA dans votre vie quotidienne ?",
        en: "Which of these examples illustrates the use of AI in your daily life?",
        xfr: "Les réseaux sociaux utilisent l'IA pour analyser vos comportements et vous proposer un contenu personnalisé unique.",
        xen: "Social networks use AI to analyze your behaviors and offer you unique personalized content.",
        choices: [
          { fr: "Écrire un message à la main sur du papier", en: "Writing a message by hand on paper", ok: 0 },
          { fr: "Allumer la lumière avec un interrupteur", en: "Turning on the light with a switch", ok: 0 },
          { fr: "Votre fil d'actualité Facebook ou TikTok qui affiche du contenu selon vos goûts", en: "Your Facebook or TikTok feed showing content based on your tastes", ok: 1 },
          { fr: "Imprimer un document sur une imprimante classique", en: "Printing a document on a classic printer", ok: 0 }
        ]
      },
      {
        fr: "De quoi l'IA a-t-elle absolument besoin pour fonctionner et devenir intelligente ?",
        en: "What does AI absolutely need to function and become intelligent?",
        xfr: "Sans données, une IA ne peut pas apprendre. La Data (images, textes, vidéos, sons) est le carburant essentiel de l'IA.",
        xen: "Without data, an AI cannot learn. Data (images, texts, videos, sounds) is the essential fuel of AI.",
        choices: [
          { fr: "D'électricité solaire uniquement", en: "Solar electricity only", ok: 0 },
          { fr: "D'une connexion Internet très rapide", en: "A very fast Internet connection", ok: 0 },
          { fr: "D'un programmeur qui lui donne les réponses à chaque fois", en: "A programmer who gives it answers each time", ok: 0 },
          { fr: "De Data (données) en grande quantité pour s'entraîner", en: "Large amounts of Data to train on", ok: 1 }
        ]
      },
      {
        fr: "Parmi ces éléments, lesquels font partie de ce qu'on appelle la « Data » utilisée par l'IA ?",
        en: "Among these elements, which ones are part of what we call 'Data' used by AI?",
        xfr: "La Data regroupe tout ce que nous produisons et partageons numériquement : photos, textes, vidéos, fichiers audio et documents.",
        xen: "Data encompasses everything we produce and share digitally: photos, texts, videos, audio files and documents.",
        choices: [
          { fr: "Les câbles électriques et les prises de courant", en: "Electrical cables and power outlets", ok: 0 },
          { fr: "Les claviers et les écrans d'ordinateurs", en: "Keyboards and computer screens", ok: 0 },
          { fr: "Les images, textes, vidéos, sons et documents partagés sur Internet", en: "Images, texts, videos, sounds and documents shared on the Internet", ok: 1 },
          { fr: "Les boîtiers WiFi et les routeurs réseau", en: "WiFi boxes and network routers", ok: 0 }
        ]
      },
      {
        fr: "Comment fonctionne le Machine Learning (apprentissage automatique) ?",
        en: "How does Machine Learning work?",
        xfr: "Dans le cours, on montre des milliers de photos à l'IA en disant \"c'est un homme\" ou \"c'est une femme\". Elle apprend les caractéristiques et peut ensuite reconnaître seule une nouvelle photo.",
        xen: "In the course, we show the AI thousands of photos saying 'it's a man' or 'it's a woman'. It learns the features and can then recognize a new photo on its own.",
        choices: [
          { fr: "Un humain programme manuellement toutes les réponses possibles dans l'IA", en: "A human manually programs all possible answers into the AI", ok: 0 },
          { fr: "L'IA invente elle-même ses propres données sans aide extérieure", en: "AI invents its own data without outside help", ok: 0 },
          { fr: "On montre à l'IA des milliers d'exemples avec les bonnes réponses pour qu'elle apprenne à reconnaître des patterns", en: "We show the AI thousands of examples with correct answers so it learns to recognize patterns", ok: 1 },
          { fr: "L'IA copie directement le cerveau humain neurone par neurone", en: "AI directly copies the human brain neuron by neuron", ok: 0 }
        ]
      },
      {
        fr: "Qu'est-ce qu'un « Modèle d'IA » ?",
        en: "What is an 'AI Model'?",
        xfr: "Le modèle d'IA, c'est le \"cerveau entraîné\" de la machine. Une fois l'entraînement terminé, il peut résoudre des problèmes sans qu'on lui donne la solution à chaque fois.",
        xen: "The AI model is the 'trained brain' of the machine. Once training is complete, it can solve problems without being given the solution each time.",
        choices: [
          { fr: "Une maquette physique d'un robot exposée dans un musée", en: "A physical mockup of a robot exhibited in a museum", ok: 0 },
          { fr: "Un simple fichier Excel contenant des données", en: "A simple Excel file containing data", ok: 0 },
          { fr: "Le résultat final de l'entraînement d'une IA, capable d'effectuer une tâche précise de manière autonome", en: "The final result of AI training, capable of performing a specific task autonomously", ok: 1 },
          { fr: "Le nom du programmeur qui a créé l'IA", en: "The name of the programmer who created the AI", ok: 0 }
        ]
      },
      {
        fr: "Où sont stockés les modèles d'IA et leurs données ?",
        en: "Where are AI models and their data stored?",
        xfr: "Les modèles d'IA nécessitent une puissance de calcul énorme, stockée dans des centres de données (datacenters) avec des milliers de serveurs.",
        xen: "AI models require enormous computing power, stored in data centers with thousands of servers.",
        choices: [
          { fr: "Dans des clés USB distribuées aux utilisateurs", en: "In USB keys distributed to users", ok: 0 },
          { fr: "Uniquement dans les téléphones mobiles", en: "Only in mobile phones", ok: 0 },
          { fr: "Dans des livres numériques téléchargeables", en: "In downloadable digital books", ok: 0 },
          { fr: "Dans des serveurs : de puissants ordinateurs qui tournent 24h/24 dans des salles climatisées", en: "In servers: powerful computers running 24/7 in air-conditioned rooms", ok: 1 }
        ]
      },
      {
        fr: "Quelle est la principale caractéristique de l'IA Générative (GenAI) ?",
        en: "What is the main characteristic of Generative AI (GenAI)?",
        xfr: "L'IA Générative se concentre sur la CRÉATION de contenu. C'est pour ça que ChatGPT peut écrire un texte et Midjourney peut créer une image à partir d'une description.",
        xen: "Generative AI focuses on CREATING content. That's why ChatGPT can write text and Midjourney can create an image from a description.",
        choices: [
          { fr: "Elle détruit du contenu existant pour faire de la place", en: "It destroys existing content to make room", ok: 0 },
          { fr: "Elle analyse uniquement des chiffres et des statistiques", en: "It only analyzes numbers and statistics", ok: 0 },
          { fr: "Elle crée du nouveau contenu : textes, images, vidéos et audio", en: "It creates new content: texts, images, videos and audio", ok: 1 },
          { fr: "Elle remplace uniquement les traducteurs humains", en: "It only replaces human translators", ok: 0 }
        ]
      },
      {
        fr: "Parmi ces outils, lesquels sont des exemples d'IA Générative mentionnés dans le cours ?",
        en: "Among these tools, which ones are examples of Generative AI mentioned in the course?",
        xfr: "ChatGPT, Gemini, Claude et Grok sont tous des modèles d'IA Générative capables de créer du texte, des images ou d'autres types de contenu.",
        xen: "ChatGPT, Gemini, Claude and Grok are all Generative AI models capable of creating text, images or other types of content.",
        choices: [
          { fr: "Microsoft Word, Excel et PowerPoint", en: "Microsoft Word, Excel and PowerPoint", ok: 0 },
          { fr: "Google Chrome, Firefox et Safari", en: "Google Chrome, Firefox and Safari", ok: 0 },
          { fr: "ChatGPT, Gemini, Claude et Grok", en: "ChatGPT, Gemini, Claude and Grok", ok: 1 },
          { fr: "Photoshop, Illustrator et InDesign", en: "Photoshop, Illustrator and InDesign", ok: 0 }
        ]
      },
      {
        fr: "Dans le cours, Alice utilise l'IA Générative pour deux tâches. Lesquelles ?",
        en: "In the course, Alice uses Generative AI for two tasks. Which ones?",
        xfr: "Alice utilise la GenAI pour affiner un email difficile à écrire (aide à l'écriture) et pour générer une illustration cartoon pour l'anniversaire de Bob (génération d'images).",
        xen: "Alice uses GenAI to refine a difficult email (writing assistance) and to generate a cartoon illustration for Bob's birthday (image generation).",
        choices: [
          { fr: "Calculer ses impôts et gérer son budget mensuel", en: "Calculate her taxes and manage her monthly budget", ok: 0 },
          { fr: "Traduire un livre entier et créer un site web", en: "Translate an entire book and create a website", ok: 0 },
          { fr: "Commander des courses en ligne et réserver un billet d'avion", en: "Order groceries online and book a plane ticket", ok: 0 },
          { fr: "Rédiger un email professionnel délicat et créer une illustration pour une carte d'anniversaire", en: "Write a delicate professional email and create an illustration for a birthday card", ok: 1 }
        ]
      }
    ];

    questions.forEach((q, qi) => {
      const qR = insertQ.run(quizId, q.fr, q.en, q.xfr, q.xen, qi + 1);
      q.choices.forEach((c, ci) => insertC.run(qR.lastInsertRowid, c.fr, c.en, c.ok, ci + 1));
    });
    console.log('  ✅ Quiz Module 1 créé (10 questions officielles, seuil 7/10)');
  }
}

console.log('🎉 Seeding complete!');
process.exit(0);