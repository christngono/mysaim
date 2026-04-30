const db = require('./db/database');

// ─── Déplacer l'ancien Module 4 en Module 5 ───────────────────────────────────
console.log('🔄 Déplacement Module 4 → Module 5...');
db.prepare('UPDATE modules SET order_index = 5 WHERE order_index = 4').run();
console.log('  ✅ Ancien Module 4 déplacé en Module 5');

// ─── Créer le nouveau Module 4 ────────────────────────────────────────────────
console.log('📦 Création du Module 4 — Découvrir les requêtes multimodales...');
const mod4 = db.prepare(`
  INSERT INTO modules (title_fr, title_en, description_fr, description_en, order_index, is_published)
  VALUES (?, ?, ?, ?, 4, 1)
`).run(
  'Découvrir les requêtes multimodales',
  'Discovering Multimodal Requests',
  "Apprenez à combiner texte, images, audio et vidéo dans vos requêtes IA pour des résultats encore plus puissants.",
  "Learn to combine text, images, audio and video in your AI requests for even more powerful results."
);
const module4Id = mod4.lastInsertRowid;
console.log('  ✅ Module 4 créé (id=' + module4Id + ')');

// ─── LEÇON 1 : Créer des images avec l'IA générative ─────────────────────────
console.log('📖 Création Leçon 1...');

const lesson1Fr = {
  intro: "Jusqu'ici, vous avez appris à parler à l'IA avec des mots. Mais saviez-vous que l'IA peut aussi voir, dessiner et créer ? Bienvenue dans le monde des <strong>requêtes multimodales</strong> — là où votre texte se transforme en image en quelques secondes.<br><br>Que vous soyez en communication, en RH ou en gestion de projet, créer un visuel professionnel ne nécessite plus ni logiciel complexe, ni designer sous la main. Juste une bonne description... et de la pratique !",
  sections: [
    // ── Section 1 ──────────────────────────────────────────────────────────────
    { type: 'heading', title: "Section 1 — C'est quoi une image générée par l'IA ?" },
    { type: 'paragraph', text: "Souvenez-vous du Module 1 : l'IA apprend en analysant des millions d'exemples. Pour les images, c'est pareil. Les modèles de génération d'images ont analysé des centaines de millions de photos, illustrations et œuvres graphiques disponibles sur Internet.<br><br>Résultat ? Quand vous lui décrivez ce que vous voulez, elle reconstruit une image originale à partir de tout ce qu'elle a appris. Ce n'est pas du copier-coller — c'est une création nouvelle, chaque fois." },
    { type: 'retenir', title: 'À retenir', text: "On parle de modèles <strong>\"text-to-image\"</strong> — vous entrez du texte, vous obtenez une image. C'est ça, le multimodal : combiner plusieurs types de données (texte + image)." },

    // ── Section 2 ──────────────────────────────────────────────────────────────
    { type: 'heading', title: 'Section 2 — Les outils que vous allez utiliser' },
    { type: 'paragraph', text: "Pas besoin de sortir la carte bancaire ! Ces outils sont accessibles depuis votre navigateur." },

    { type: 'infobox', icon: '🔵', title: "Outil 1 — Gemini (Google) : l'outil principal", text: "Accès : <strong>gemini.google.com</strong> | Compte requis : Compte Google (Gmail suffit) | Gratuit : Oui\n\nGemini est l'assistant IA de Google. Il intègre un générateur d'images directement dans la conversation. Vous décrivez ce que vous voulez, il génère l'image, vous pouvez affiner en continuant à discuter.\n\n✅ <strong>Point fort :</strong> Vous pouvez décrire une image, la recevoir, poser des questions dessus et demander des variantes — tout dans la même conversation.\n🎯 <strong>Idéal pour :</strong> Illustrations rapides, visuels pour présentations, images contextualisées." },
    { type: 'image', src: '/images/module4/lesson1/gemini-homepage.png', caption: "Page d'accueil de gemini.google.com" },

    { type: 'infobox', icon: '🟦', title: "Outil 2 — Microsoft Copilot : l'outil complémentaire", text: "Accès : <strong>copilot.microsoft.com</strong> | Compte requis : Aucun (optionnel) | Gratuit : Oui\n\nCopilot intègre le moteur DALL-E de Microsoft. Interface simple, résultats de haute qualité, accessible sans inscription.\n\n✅ <strong>Point fort :</strong> Accessible immédiatement sans compte. Génère 4 variantes de votre image en même temps.\n🎯 <strong>Idéal pour :</strong> Visuels corporate, bannières, illustrations pour rapports, images réalistes." },
    { type: 'image', src: '/images/module4/lesson1/copilot-homepage.png', caption: "Page d'accueil de copilot.microsoft.com" },

    { type: 'infobox', icon: '🔤', title: 'Outil 3 — Ideogram : spécialiste du texte dans les images', text: "Accès : <strong>ideogram.ai</strong> | Compte requis : Compte gratuit | Gratuit : Oui (avec limites)\n\nIdeogram excelle là où les autres outils échouent : intégrer du texte lisible dans une image. Logos, affiches, bannières avec du texte — c'est son point fort.\n\n⚠️ <strong>Attention :</strong> Sur le plan gratuit, vos créations sont publiques. À éviter pour les contenus sensibles ou confidentiels de votre entreprise.\n🎯 <strong>Idéal pour :</strong> Affiches d'événements, bannières avec slogan, visuels avec texte intégré." },

    { type: 'infobox', icon: '🎨', title: 'Outil 4 — Canva AI (Magic Media)', text: "Accès : <strong>canva.com</strong>\n\nCanva intègre un générateur d'images dans son éditeur. Mentionné ici car vous le connaissez peut-être déjà — il permet de générer et finaliser un visuel au même endroit. Idéal pour la retouche et la mise en page finale." },

    {
      type: 'table',
      title: 'Comparatif rapide des outils',
      headers: ['Outil', 'Compte requis', 'Génère du texte', 'Meilleur pour'],
      rows: [
        ['Gemini', 'Compte Google', 'Moyen', 'Illustrations créatives'],
        ['Copilot', 'Non (optionnel)', 'Moyen', 'Rendus réalistes'],
        ['Ideogram', 'Oui (gratuit)', 'Excellent', 'Affiches avec texte'],
        ['Canva AI', 'Oui (gratuit)', 'Oui (Canva)', 'Retouche et mise en page'],
      ]
    },

    // ── Section 3 ──────────────────────────────────────────────────────────────
    { type: 'heading', title: 'Section 3 — Accéder à Gemini pas à pas' },
    { type: 'image', src: '/images/module4/lesson1/gemini-connexion.png', caption: "Écran de connexion Google pour Gemini" },
    {
      type: 'steps',
      items: [
        { title: 'Ouvrir le navigateur', text: "Ouvrez Google Chrome ou tout autre navigateur sur votre ordinateur ou téléphone." },
        { title: 'Aller sur Gemini', text: "Tapez <strong>gemini.google.com</strong> dans la barre d'adresse et appuyez sur Entrée." },
        { title: 'Se connecter avec votre compte Google', text: "Cliquez sur <em>\"Se connecter\"</em> en haut à droite. Entrez votre adresse Gmail et votre mot de passe. Si vous n'avez pas de compte Google, cliquez sur <em>\"Créer un compte\"</em> — c'est gratuit et prend moins de 2 minutes." },
        { title: "Accéder à l'interface de conversation", text: "Une fois connecté, vous arrivez sur l'interface de Gemini. Vous verrez une grande zone de texte en bas de l'écran avec le message <em>\"Demandez quelque chose à Gemini\"</em>." },
        { title: "Activer la génération d'images", text: "Deux façons :<br>• <strong>Façon A</strong> : Tapez directement <em>\"Génère une image de...\"</em> suivi de votre description.<br>• <strong>Façon B</strong> : Cherchez l'icône image dans la barre d'outils de la zone de texte." },
      ]
    },
    { type: 'image', src: '/images/module4/lesson1/gemini-interface.png', caption: "Interface Gemini avec la zone de texte et les icônes" },
    { type: 'retenir', title: 'Note importante', text: "La génération d'images dans Gemini peut varier selon votre région. Si l'option n'est pas disponible chez vous, passez directement à Microsoft Copilot (Section 4)." },

    // ── Section 4 ──────────────────────────────────────────────────────────────
    { type: 'heading', title: 'Section 4 — Accéder à Microsoft Copilot pas à pas' },
    { type: 'image', src: '/images/module4/lesson1/copilot-interface.png', caption: "Interface Copilot sans connexion avec la zone de texte visible" },
    {
      type: 'steps',
      items: [
        { title: 'Ouvrir le navigateur', text: "Ouvrez votre navigateur (Chrome, Edge ou Firefox)." },
        { title: 'Aller sur Copilot', text: "Tapez <strong>copilot.microsoft.com</strong> dans la barre d'adresse et appuyez sur Entrée." },
        { title: 'Commencer sans compte', text: "Vous arrivez directement sur l'interface de Copilot. Vous pouvez commencer immédiatement sans vous connecter. Cliquez simplement sur la zone de texte en bas de l'écran." },
        { title: "Générer une image", text: "Deux options :<br>• <strong>Option A</strong> : Tapez <em>\"Génère une image de...\"</em> suivi de votre description et appuyez sur Entrée.<br>• <strong>Option B</strong> : Si vous voyez un onglet <em>\"Image Creator\"</em> dans le menu, cliquez dessus.<br><br>Copilot génère automatiquement <strong>4 variantes</strong> de votre image." },
        { title: 'Télécharger votre image', text: "Cliquez sur l'image qui vous convient pour l'agrandir. Cliquez sur le bouton <em>\"Télécharger\"</em> ou faites un clic droit → <em>\"Enregistrer l'image sous\"</em>." },
        { title: 'Se connecter pour plus de générations (optionnel)', text: "Sans compte, vos générations sont limitées. Pour plus de créations, connectez-vous avec un compte Microsoft gratuit en cliquant sur <em>\"Se connecter\"</em> en haut à droite." },
      ]
    },
    { type: 'image', src: '/images/module4/lesson1/copilot-4-variants.png', caption: "Les 4 variantes générées automatiquement par Copilot" },

    // ── Section 5 ──────────────────────────────────────────────────────────────
    { type: 'heading', title: "Section 5 — Comment décrire ce que vous voulez : l'art du prompt visuel" },
    { type: 'paragraph', text: "Créer une image avec l'IA, c'est comme briefer un graphiste. Plus votre brief est précis, meilleur sera le résultat.<br><br><strong>Un prompt visuel efficace contient 4 ingrédients :</strong>" },
    {
      type: 'steps',
      items: [
        { title: 'Le sujet', text: "Qui ou quoi est au centre de l'image ?<br>Exemple : <em>\"Une femme en tenue professionnelle africaine...\"</em>" },
        { title: 'Le contexte et le décor', text: "Où se passe la scène ?<br>Exemple : <em>\"...assise dans une salle de réunion moderne à Douala...\"</em>" },
        { title: 'Le style visuel', text: "Quel rendu souhaitez-vous ?<br>Exemple : <em>\"...style illustration professionnelle, couleurs chaleureuses...\"</em>" },
        { title: 'Les détails techniques', text: "Format, ambiance, lumière ?<br>Exemple : <em>\"...fond clair, lumière naturelle, format horizontal.\"</em>" },
      ]
    },
    { type: 'retenir', title: 'Prompt complet résultant', text: "\"Une femme en tenue professionnelle africaine assise dans une salle de réunion moderne à Douala, présentant devant un écran. Style illustration professionnelle, couleurs chaleureuses, fond clair, lumière naturelle, format horizontal.\"" },
    { type: 'image', src: '/images/module4/lesson1/prompt-ingredients-schema.png', caption: "Schéma des 4 ingrédients du prompt visuel" },

    // ── Section 6 ──────────────────────────────────────────────────────────────
    { type: 'heading', title: 'Section 6 — Exemples concrets par métier' },

    { type: 'infobox', icon: '👥', title: 'Exemple 1 — Ressources Humaines', text: "<strong>Besoin :</strong> Visuel pour une campagne de recrutement LinkedIn\n\n❌ <strong>Prompt faible :</strong> \"Une photo de recrutement.\"\n\n✅ <strong>Prompt professionnel :</strong> \"Une illustration moderne montrant un groupe diversifié de jeunes professionnels camerounais souriants lors d'un entretien d'embauche dans un bureau lumineux. Style corporate chaleureux, palette de couleurs bleu et doré, format carré.\"\n\n<strong>Comment tester sur Gemini :</strong>\n1. Ouvrez gemini.google.com et connectez-vous\n2. Écrivez votre prompt et appuyez sur Entrée (attendre 10 à 20 secondes)\n3. Affinez si besoin : \"Essaie avec des visages plus expressifs et plus de luminosité\"\n4. Téléchargez l'image finale (clic droit → enregistrer)" },
    { type: 'image', src: '/images/module4/lesson1/example-rh-gemini.png', caption: "Exemple de résultat Gemini — campagne de recrutement RH" },

    { type: 'infobox', icon: '📢', title: 'Exemple 2 — Communication', text: "<strong>Besoin :</strong> Bannière pour annoncer un événement d'entreprise\n\n❌ <strong>Prompt faible :</strong> \"Une bannière pour une conférence.\"\n\n✅ <strong>Prompt professionnel :</strong> \"Une bannière professionnelle pour une conférence sur la transformation digitale en Afrique. Design épuré avec des éléments graphiques technologiques, couleurs bleu nuit et orange, espace vide en haut pour ajouter du texte, format horizontal 1200x628.\"\n\n<strong>Comment tester sur Copilot :</strong>\n1. Ouvrez copilot.microsoft.com dans votre navigateur\n2. Sans vous connecter, cliquez sur la zone de texte\n3. Écrivez votre prompt et appuyez sur Entrée\n4. Copilot génère 4 variantes — choisissez la meilleure\n5. Téléchargez, puis ouvrez dans Canva pour ajouter votre texte et logo" },
    { type: 'image', src: '/images/module4/lesson1/example-comm-copilot.png', caption: "Les 4 variantes Copilot — bannière événement entreprise" },

    { type: 'infobox', icon: '📊', title: 'Exemple 3 — Gestion de Projet', text: "<strong>Besoin :</strong> Illustration pour la couverture d'un rapport trimestriel\n\n❌ <strong>Prompt faible :</strong> \"Un graphique de performance.\"\n\n✅ <strong>Prompt professionnel :</strong> \"Une illustration infographique minimaliste montrant une flèche de croissance ascendante avec des icônes représentant une équipe projet, des jalons et des résultats atteints. Style flat design, couleurs vert et bleu corporate, fond blanc, format vertical.\"\n\n<strong>Comment tester sur Gemini :</strong>\n1. Ouvrez gemini.google.com et connectez-vous\n2. Écrivez votre prompt et appuyez sur Entrée\n3. Si les couleurs ne correspondent pas : \"Utilise plutôt du bleu marine et du doré\"\n4. Téléchargez et insérez dans Word ou PowerPoint" },
    { type: 'image', src: '/images/module4/lesson1/example-project-gemini.png', caption: "Résultat Gemini — illustration couverture rapport trimestriel" },

    // ── Section 7 ──────────────────────────────────────────────────────────────
    { type: 'heading', title: 'Section 7 — Comparer les deux outils : même prompt, résultats différents' },
    { type: 'paragraph', text: "<strong>Exercice pratique :</strong> Envoyez ce même prompt dans Gemini puis dans Copilot et comparez les résultats.<br><br>📝 <strong>Prompt de test :</strong> \"Un groupe de professionnels camerounais réunis autour d'une table de réunion, discutant d'un projet avec des ordinateurs portables. Ambiance dynamique et collaborative, lumière naturelle, style illustration corporate.\"" },
    {
      type: 'list',
      title: 'Ce que vous observerez',
      items: [
        "🎨 <strong>Gemini</strong> : image plus illustrative, style graphique, touche créative",
        "📷 <strong>Copilot</strong> : image plus réaliste, proche d'une photo, détails fins",
      ]
    },
    { type: 'retenir', title: 'Conclusion pratique', text: "Il n'y a pas un meilleur outil — il y a l'outil le plus adapté à votre besoin du moment. Testez les deux et choisissez selon le résultat !" },
    { type: 'image', src: '/images/module4/lesson1/gemini-vs-copilot.png', caption: "Même prompt, résultats différents — Gemini (gauche) vs Copilot (droite)" },

    // ── Section 8 ──────────────────────────────────────────────────────────────
    { type: 'heading', title: 'Section 8 — Les bonnes pratiques pour des images professionnelles' },
    {
      type: 'list',
      title: "✅ Ce qu'il faut faire",
      items: [
        "Précisez toujours le style : <em>\"style photo réaliste\"</em>, <em>\"style illustration vectorielle\"</em>, <em>\"style flat design\"</em>",
        "Mentionnez le format : <em>\"format carré\"</em>, <em>\"format 16:9\"</em>, <em>\"format affiche verticale\"</em>",
        "Décrivez l'ambiance : <em>\"lumière chaude\"</em>, <em>\"atmosphère professionnelle\"</em>, <em>\"tons sobres et élégants\"</em>",
        "Ancrez dans le contexte local : <em>\"contexte camerounais\"</em>, <em>\"tenue africaine moderne\"</em>, <em>\"bureau à Yaoundé\"</em>",
        "Restez dans la même conversation pour affiner : si le résultat ne convient pas, continuez à discuter sans repartir de zéro",
      ]
    },
    {
      type: 'list',
      title: "❌ Ce qu'il faut éviter",
      items: [
        "Les descriptions trop vagues : <em>\"une belle image\"</em> ne dit rien à l'IA sur ce que vous attendez",
        "Demander des visages de personnes réelles nommées — c'est interdit sur tous ces outils",
        "Négliger le contexte culturel : sans précision, l'IA produit des environnements occidentaux par défaut",
        "Partager des informations confidentielles de votre entreprise dans le prompt",
      ]
    },

    // ── Section 9 ──────────────────────────────────────────────────────────────
    { type: 'heading', title: 'Section 9 — Les limites à connaître' },
    { type: 'infobox', icon: '⚠️', title: 'Limite 1 — Le texte dans les images', text: "Gemini et Copilot peinent souvent à intégrer du texte lisible dans une image (slogans, titres, chiffres).<br><strong>Solution :</strong> Utilisez Ideogram pour la génération, puis Canva pour ajouter et finaliser votre texte." },
    { type: 'infobox', icon: '🌍', title: 'Limite 2 — La représentation africaine', text: "Les deux outils ont été formés majoritairement sur des données occidentales. Soyez très explicite : <em>\"contexte africain subsaharien\"</em>, <em>\"tenue traditionnelle bamiléké\"</em>, <em>\"marché de Douala\"</em>, <em>\"bureau à Yaoundé\"</em> — plus vous précisez, plus le résultat sera représentatif de votre réalité." },
    { type: 'infobox', icon: '⚖️', title: "Limite 3 — Les droits d'utilisation", text: "Les images générées sont généralement libres pour un usage professionnel interne. Pour une utilisation commerciale ou publique importante, vérifiez les conditions générales de l'outil utilisé avant de publier." },

    // ── Section 10 ─────────────────────────────────────────────────────────────
    { type: 'heading', title: "Section 10 — Workflow pratique : de l'idée à l'image en 5 étapes" },
    {
      type: 'steps',
      items: [
        { title: 'Définir le besoin', text: "Répondez à ces questions : <em>Pour quoi ? Pour qui ? Sur quel support ?</em><br>Exemple : \"Pour une publication LinkedIn RH, pour attirer des candidats à Douala, format carré.\"" },
        { title: "Choisir l'outil adapté", text: "• <strong>Gemini</strong> : pour une illustration créative et contextualisée<br>• <strong>Copilot</strong> : pour un rendu réaliste et détaillé, sans compte requis<br>• <strong>Ideogram</strong> : si votre image doit contenir du texte lisible" },
        { title: 'Rédiger le prompt visuel', text: "Appliquez la formule : <strong>Sujet + Contexte + Style + Format</strong><br>Exemple : \"Jeunes professionnels camerounais [sujet] dans un bureau moderne à Douala [contexte], style illustration corporate chaleureuse [style], format carré [format].\"" },
        { title: 'Générer et évaluer', text: "Lancez la génération et posez-vous ces questions :<br>• Est-ce utilisable directement ?<br>• Est-ce que ça représente bien mon contexte professionnel et culturel ?<br>• Le format correspond-il à mon support de destination ?" },
        { title: 'Itérer ou finaliser', text: "• <strong>Si le résultat ne convient pas</strong> : restez dans la même conversation et affinez votre description.<br>• <strong>Si le résultat convient</strong> : téléchargez l'image et intégrez-la dans votre support (Word, PowerPoint, Canva, etc.)." },
      ]
    },
    { type: 'image', src: '/images/module4/lesson1/workflow-5-etapes.png', caption: "Schéma du workflow en 5 étapes — de l'idée à l'image" },

    // ── À retenir ───────────────────────────────────────────────────────────────
    { type: 'retenir', title: 'À retenir — Résumé de la leçon', text: "La génération d'images par IA n'est pas réservée aux graphistes. C'est un outil professionnel que vous pouvez utiliser dès aujourd'hui pour gagner du temps et produire des visuels adaptés à votre réalité camerounaise.<br><br><strong>La clé : un prompt visuel précis = une image professionnelle utilisable.</strong>" },
    {
      type: 'table',
      title: 'Tableau récapitulatif',
      headers: ['Besoin', 'Outil recommandé', "Ce qu'il faut préciser"],
      rows: [
        ['Visuel créatif et rapide', 'Gemini', 'Style + contexte africain + format'],
        ['Rendu réaliste et détaillé', 'Copilot', 'Style réaliste + couleurs + format'],
        ['Image avec texte intégré', 'Ideogram', 'Texte exact + style + contexte'],
        ['Retouche, ajout logo ou texte', 'Canva', 'Pas de génération — retouche uniquement'],
      ]
    },
    { type: 'retenir', title: '💡 Le réflexe pro', text: "Avant de chercher une photo sur Google Images pendant une heure, prenez 5 minutes pour décrire ce que vous voulez à Gemini ou Copilot. Vous obtiendrez une image sur mesure, adaptée à votre contexte africain, sans droits d'auteur à gérer." },
  ],
  keywords: ['multimodal', 'text-to-image', 'prompt visuel', 'Gemini', 'Copilot', 'Ideogram', "génération d'images", 'style visuel', 'illustration']
};

const lesson1En = {
  intro: "Until now, you've learned to talk to AI with words. But did you know that AI can also see, draw and create? Welcome to the world of <strong>multimodal requests</strong> — where your text transforms into an image in just seconds.<br><br>Whether you work in communications, HR or project management, creating a professional visual no longer requires complex software or a designer on hand. Just a good description... and practice!",
  sections: [
    { type: 'heading', title: 'Section 1 — What is an AI-generated image?' },
    { type: 'paragraph', text: "Remember Module 1: AI learns by analyzing millions of examples. For images, it's the same. Image generation models have analyzed hundreds of millions of photos, illustrations and graphic works available on the internet.<br><br>The result? When you describe what you want, it reconstructs an original image from everything it has learned. It's not copy-paste — it's a new creation, every time." },
    { type: 'retenir', title: 'Key takeaway', text: 'These are called <strong>"text-to-image"</strong> models — you enter text, you get an image. That\'s multimodal: combining multiple types of data (text + image).' },

    { type: 'heading', title: 'Section 2 — The tools you will use' },
    { type: 'paragraph', text: "No need to get your credit card out! These tools are accessible from your browser." },

    { type: 'infobox', icon: '🔵', title: 'Tool 1 — Gemini (Google): the main tool', text: "Access: <strong>gemini.google.com</strong> | Account required: Google Account (Gmail works) | Free: Yes\n\nGemini is Google's AI assistant. It integrates an image generator directly into the conversation. You describe what you want, it generates the image, you can refine by continuing to chat.\n\n✅ <strong>Strength:</strong> You can describe an image, receive it, ask questions about it and request variations — all in the same conversation.\n🎯 <strong>Best for:</strong> Quick illustrations, visuals for presentations, contextualized images." },
    { type: 'image', src: '/images/module4/lesson1/gemini-homepage.png', caption: 'Homepage of gemini.google.com' },

    { type: 'infobox', icon: '🟦', title: 'Tool 2 — Microsoft Copilot: the complementary tool', text: "Access: <strong>copilot.microsoft.com</strong> | Account required: None (optional) | Free: Yes\n\nCopilot integrates Microsoft's DALL-E engine. Simple interface, high-quality results, accessible without registration.\n\n✅ <strong>Strength:</strong> Immediately accessible without an account. Generates 4 variations of your image at the same time.\n🎯 <strong>Best for:</strong> Corporate visuals, banners, report illustrations, realistic images." },
    { type: 'image', src: '/images/module4/lesson1/copilot-homepage.png', caption: 'Homepage of copilot.microsoft.com' },

    { type: 'infobox', icon: '🔤', title: 'Tool 3 — Ideogram: specialist in text within images', text: "Access: <strong>ideogram.ai</strong> | Account required: Free account | Free: Yes (with limits)\n\nIdeogram excels where other tools fail: integrating readable text into an image. Logos, posters, banners with text — that's its strength.\n\n⚠️ <strong>Warning:</strong> On the free plan, your creations are public. Avoid for sensitive or confidential company content.\n🎯 <strong>Best for:</strong> Event posters, banners with slogans, visuals with integrated text." },

    { type: 'infobox', icon: '🎨', title: 'Tool 4 — Canva AI (Magic Media)', text: "Access: <strong>canva.com</strong>\n\nCanva integrates an image generator in its editor. Mentioned here as you may already know it — it lets you generate and finalize a visual in the same place. Ideal for retouching and final layout." },

    {
      type: 'table',
      title: 'Quick tool comparison',
      headers: ['Tool', 'Account required', 'Generates text', 'Best for'],
      rows: [
        ['Gemini', 'Google Account', 'Average', 'Creative illustrations'],
        ['Copilot', 'No (optional)', 'Average', 'Realistic renders'],
        ['Ideogram', 'Yes (free)', 'Excellent', 'Posters with text'],
        ['Canva AI', 'Yes (free)', 'Yes (Canva)', 'Retouching and layout'],
      ]
    },

    { type: 'heading', title: 'Section 3 — Accessing Gemini step by step' },
    { type: 'image', src: '/images/module4/lesson1/gemini-connexion.png', caption: 'Google sign-in screen for Gemini' },
    {
      type: 'steps',
      items: [
        { title: 'Open your browser', text: 'Open Google Chrome or any other browser on your computer or phone.' },
        { title: 'Go to Gemini', text: 'Type <strong>gemini.google.com</strong> in the address bar and press Enter.' },
        { title: 'Sign in with your Google account', text: 'Click <em>"Sign in"</em> in the top right corner. Enter your Gmail address and password. If you don\'t have a Google account, click <em>"Create account"</em> — it\'s free and takes less than 2 minutes.' },
        { title: 'Access the chat interface', text: 'Once signed in, you arrive at the Gemini interface. You\'ll see a large text box at the bottom of the screen.' },
        { title: 'Activate image generation', text: 'Two ways:<br>• <strong>Way A</strong>: Type directly <em>"Generate an image of..."</em> followed by your description.<br>• <strong>Way B</strong>: Look for the image icon in the text box toolbar.' },
      ]
    },
    { type: 'image', src: '/images/module4/lesson1/gemini-interface.png', caption: 'Gemini interface with text box and toolbar icons' },
    { type: 'retenir', title: 'Important note', text: "Image generation in Gemini may vary by region. If the option is not available in your area, go directly to Microsoft Copilot (Section 4)." },

    { type: 'heading', title: 'Section 4 — Accessing Microsoft Copilot step by step' },
    { type: 'image', src: '/images/module4/lesson1/copilot-interface.png', caption: 'Copilot interface without login showing the text box' },
    {
      type: 'steps',
      items: [
        { title: 'Open your browser', text: 'Open your browser (Chrome, Edge or Firefox).' },
        { title: 'Go to Copilot', text: 'Type <strong>copilot.microsoft.com</strong> in the address bar and press Enter.' },
        { title: 'Start without an account', text: "You arrive directly at the Copilot interface. You can start immediately without logging in. Simply click on the text box at the bottom of the screen." },
        { title: 'Generate an image', text: 'Two options:<br>• <strong>Option A</strong>: Type <em>"Generate an image of..."</em> followed by your description and press Enter.<br>• <strong>Option B</strong>: If you see an <em>"Image Creator"</em> tab in the menu, click it.<br><br>Copilot automatically generates <strong>4 variations</strong> of your image.' },
        { title: 'Download your image', text: 'Click on the image you like to enlarge it. Click the <em>"Download"</em> button or right-click → <em>"Save image as"</em>.' },
        { title: 'Sign in for more generations (optional)', text: 'Without an account, your generations are limited. For more creations, sign in with a free Microsoft account by clicking <em>"Sign in"</em> in the top right.' },
      ]
    },
    { type: 'image', src: '/images/module4/lesson1/copilot-4-variants.png', caption: 'Example of 4 variations automatically generated by Copilot' },

    { type: 'heading', title: 'Section 5 — How to describe what you want: the art of the visual prompt' },
    { type: 'paragraph', text: "Creating an image with AI is like briefing a graphic designer. The more precise your brief, the better the result.<br><br><strong>An effective visual prompt contains 4 ingredients:</strong>" },
    {
      type: 'steps',
      items: [
        { title: 'The subject', text: 'Who or what is at the center of the image?<br>Example: <em>"A woman in African professional attire..."</em>' },
        { title: 'The context and setting', text: 'Where does the scene take place?<br>Example: <em>"...sitting in a modern meeting room in Douala..."</em>' },
        { title: 'The visual style', text: 'What rendering do you want?<br>Example: <em>"...professional illustration style, warm colors..."</em>' },
        { title: 'Technical details', text: 'Format, mood, lighting?<br>Example: <em>"...light background, natural lighting, horizontal format."</em>' },
      ]
    },
    { type: 'retenir', title: 'Complete resulting prompt', text: '"A woman in African professional attire sitting in a modern meeting room in Douala, presenting in front of a screen. Professional illustration style, warm colors, light background, natural lighting, horizontal format."' },
    { type: 'image', src: '/images/module4/lesson1/prompt-ingredients-schema.png', caption: 'Diagram of the 4 visual prompt ingredients' },

    { type: 'heading', title: 'Section 6 — Concrete examples by profession' },

    { type: 'infobox', icon: '👥', title: 'Example 1 — Human Resources', text: "<strong>Need:</strong> Visual for a LinkedIn recruitment campaign\n\n❌ <strong>Weak prompt:</strong> \"A recruitment photo.\"\n\n✅ <strong>Professional prompt:</strong> \"A modern illustration showing a diverse group of smiling young Cameroonian professionals during a job interview in a bright office. Warm corporate style, blue and gold color palette, square format.\"\n\n<strong>How to test on Gemini:</strong>\n1. Open gemini.google.com and sign in\n2. Write your prompt and press Enter (wait 10–20 seconds)\n3. Refine if needed: \"Try with more expressive faces and more brightness\"\n4. Download the final image (right-click → save)" },
    { type: 'image', src: '/images/module4/lesson1/example-rh-gemini.png', caption: 'Gemini result example — HR recruitment campaign' },

    { type: 'infobox', icon: '📢', title: 'Example 2 — Communications', text: "<strong>Need:</strong> Banner to announce a company event\n\n❌ <strong>Weak prompt:</strong> \"A banner for a conference.\"\n\n✅ <strong>Professional prompt:</strong> \"A professional banner for a conference on digital transformation in Africa. Clean design with technological graphic elements, midnight blue and orange colors, empty space at the top to add text, horizontal 1200x628 format.\"\n\n<strong>How to test on Copilot:</strong>\n1. Open copilot.microsoft.com in your browser\n2. Without logging in, click on the text box\n3. Write your prompt and press Enter\n4. Copilot generates 4 variations — choose the best one\n5. Download, then open in Canva to add your text and logo" },
    { type: 'image', src: '/images/module4/lesson1/example-comm-copilot.png', caption: 'Copilot 4 variations — company event banner' },

    { type: 'infobox', icon: '📊', title: 'Example 3 — Project Management', text: "<strong>Need:</strong> Illustration for the cover of a quarterly report\n\n❌ <strong>Weak prompt:</strong> \"A performance chart.\"\n\n✅ <strong>Professional prompt:</strong> \"A minimalist infographic illustration showing an upward growth arrow with icons representing a project team, milestones and achieved results. Flat design style, green and corporate blue colors, white background, vertical format.\"\n\n<strong>How to test on Gemini:</strong>\n1. Open gemini.google.com and sign in\n2. Write your prompt and press Enter\n3. If colors don't match: \"Use navy blue and gold instead\"\n4. Download and insert into Word or PowerPoint" },
    { type: 'image', src: '/images/module4/lesson1/example-project-gemini.png', caption: 'Gemini result — quarterly report cover illustration' },

    { type: 'heading', title: 'Section 7 — Comparing the two tools: same prompt, different results' },
    { type: 'paragraph', text: "<strong>Practical exercise:</strong> Send this same prompt to Gemini and then to Copilot and compare the results.<br><br>📝 <strong>Test prompt:</strong> \"A group of Cameroonian professionals gathered around a meeting table, discussing a project with laptops. Dynamic and collaborative atmosphere, natural light, corporate illustration style.\"" },
    {
      type: 'list',
      title: 'What you will observe',
      items: [
        "🎨 <strong>Gemini</strong>: more illustrative image, graphic style, creative touch",
        "📷 <strong>Copilot</strong>: more realistic image, close to a photograph, fine details",
      ]
    },
    { type: 'retenir', title: 'Practical conclusion', text: "There is no better tool — there is the most appropriate tool for your current need. Test both and choose based on the result!" },
    { type: 'image', src: '/images/module4/lesson1/gemini-vs-copilot.png', caption: 'Same prompt, different results — Gemini (left) vs Copilot (right)' },

    { type: 'heading', title: 'Section 8 — Best practices for professional images' },
    {
      type: 'list',
      title: '✅ What you should do',
      items: [
        'Always specify the style: <em>"realistic photo style"</em>, <em>"vector illustration style"</em>, <em>"flat design style"</em>',
        'Mention the format: <em>"square format"</em>, <em>"16:9 format"</em>, <em>"vertical poster format"</em>',
        'Describe the mood: <em>"warm light"</em>, <em>"professional atmosphere"</em>, <em>"sober and elegant tones"</em>',
        'Anchor in local context: <em>"Cameroonian context"</em>, <em>"modern African attire"</em>, <em>"office in Yaoundé"</em>',
        "Stay in the same conversation to refine: if the result isn't right, keep chatting with the AI without starting over",
      ]
    },
    {
      type: 'list',
      title: '❌ What you should avoid',
      items: [
        "Descriptions that are too vague: <em>\"a beautiful image\"</em> tells the AI nothing about what you expect",
        "Asking for faces of named real people — this is prohibited on all these tools",
        "Neglecting cultural context: without specification, AI produces Western environments by default",
        "Sharing confidential company information in the prompt",
      ]
    },

    { type: 'heading', title: 'Section 9 — Limitations to know' },
    { type: 'infobox', icon: '⚠️', title: 'Limitation 1 — Text in images', text: "Gemini and Copilot often struggle to integrate readable text into an image (slogans, titles, numbers).<br><strong>Solution:</strong> Use Ideogram for generation, then Canva to add and finalize your text." },
    { type: 'infobox', icon: '🌍', title: 'Limitation 2 — African representation', text: "Both tools were trained mostly on Western data. Be very explicit in your descriptions: <em>\"sub-Saharan African context\"</em>, <em>\"traditional Bamileke attire\"</em>, <em>\"Douala market\"</em>, <em>\"office in Yaoundé\"</em> — the more you specify, the more representative the result will be." },
    { type: 'infobox', icon: '⚖️', title: 'Limitation 3 — Usage rights', text: "Generated images are generally free for internal professional use. For significant commercial or public use, check the tool's terms of service before publishing." },

    { type: 'heading', title: 'Section 10 — Practical workflow: from idea to image in 5 steps' },
    {
      type: 'steps',
      items: [
        { title: 'Define the need', text: "Answer these questions: <em>For what? For whom? On what medium?</em><br>Example: \"For an HR LinkedIn post, to attract candidates in Douala, square format.\"" },
        { title: 'Choose the right tool', text: "• <strong>Gemini</strong>: for creative, contextualized illustrations<br>• <strong>Copilot</strong>: for realistic, detailed renders, no account required<br>• <strong>Ideogram</strong>: if your image needs to contain readable text" },
        { title: 'Write the visual prompt', text: "Apply the formula: <strong>Subject + Context + Style + Format</strong><br>Example: \"Young Cameroonian professionals [subject] in a modern Douala office [context], warm corporate illustration style [style], square format [format].\"" },
        { title: 'Generate and evaluate', text: "Launch the generation and ask yourself:<br>• Is it directly usable?<br>• Does it represent my professional and cultural context well?<br>• Does the format match my destination medium?" },
        { title: 'Iterate or finalize', text: "• <strong>If the result isn't right</strong>: stay in the same conversation and refine your description.<br>• <strong>If the result is good</strong>: download the image and integrate it into your document (Word, PowerPoint, Canva, etc.)." },
      ]
    },
    { type: 'image', src: '/images/module4/lesson1/workflow-5-etapes.png', caption: '5-step workflow — from idea to image' },

    { type: 'retenir', title: 'Key takeaway — Lesson summary', text: "AI image generation is not reserved for graphic designers. It's a professional tool you can use today to save time and produce visuals adapted to your Cameroonian reality.<br><br><strong>The key: a precise visual prompt = a usable professional image.</strong>" },
    {
      type: 'table',
      title: 'Summary table',
      headers: ['Need', 'Recommended tool', 'What to specify'],
      rows: [
        ['Quick creative visual', 'Gemini', 'Style + African context + format'],
        ['Realistic detailed render', 'Copilot', 'Realistic style + colors + format'],
        ['Image with integrated text', 'Ideogram', 'Exact text + style + context'],
        ['Retouching, adding logo or text', 'Canva', 'No generation — retouching only'],
      ]
    },
    { type: 'retenir', title: '💡 The pro reflex', text: "Before spending an hour searching for a photo on Google Images, take 5 minutes to describe what you want to Gemini or Copilot. You'll get a custom image, adapted to your African context, with no copyright to manage." },
  ],
  keywords: ['multimodal', 'text-to-image', 'visual prompt', 'Gemini', 'Copilot', 'Ideogram', 'image generation', 'visual style', 'illustration']
};

const lesson1 = db.prepare(`
  INSERT INTO lessons (module_id, order_index, title_fr, title_en, content_fr, content_en, is_published)
  VALUES (?, 1, ?, ?, ?, ?, 1)
`).run(
  module4Id,
  "Leçon 1 : Créer des images avec l'IA générative",
  "Lesson 1: Creating Images with Generative AI",
  JSON.stringify(lesson1Fr),
  JSON.stringify(lesson1En)
);
console.log('  ✅ Leçon 1 créée (id=' + lesson1.lastInsertRowid + ')');

console.log('\n✅ Module 4 — Leçon 1 créée avec succès !');
console.log('   12 emplacements images à remplir dans : /images/module4/lesson1/');
console.log('   Dossier à créer : frontend/public/images/module4/lesson1/');
console.log('\n⏳ Leçons 2 et 3, Quiz et Exercices à ajouter dans les prochains scripts.');
