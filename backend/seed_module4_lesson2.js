const db = require('./db/database');

console.log('📚 Seed Module 4 — Leçon 2 + contenu');

const mod4 = db.prepare('SELECT id FROM modules WHERE order_index = 4').get();
if (!mod4) { console.error('❌ Module 4 introuvable.'); process.exit(1); }

// Supprimer si déjà existant
const existing = db.prepare('SELECT id FROM lessons WHERE module_id = ? AND order_index = 2').get(mod4.id);
if (existing) {
  db.prepare('DELETE FROM lessons WHERE id = ?').run(existing.id);
  console.log('  ⚠️  Leçon 2 existante supprimée, recréation...');
}

// ─── Contenu FR ───────────────────────────────────────────────────────────────
const contentFr = {
  intro: "Dans la leçon précédente, vous avez appris à créer des images à partir de texte. Maintenant, on inverse la logique : et si c'était votre image ou votre document qui devenait le point de départ de votre requête ?<br><br>C'est ça, la puissance réelle du multimodal. Vous ne parlez plus seulement à l'IA avec des mots — vous lui <strong>montrez</strong> ce que vous avez, et elle vous aide à en faire quelque chose d'utile. Photo prise avec votre téléphone, rapport PDF reçu par email, tableau Excel, capture d'écran — Gemini peut analyser, résumer, expliquer ou extraire des informations précises.<br><br>🛠️ <strong>Outil utilisé dans cette leçon :</strong> Gemini (gemini.google.com)",
  sections: [

    // ── Section 1 ──────────────────────────────────────────────────────────────
    { type: 'heading', title: "Section 1 — C'est quoi une requête multimodale ?" },
    { type: 'paragraph', text: "Jusqu'ici, vos requêtes étaient uniquement en texte. Une requête multimodale, c'est quand vous <strong>combinez plusieurs types de médias</strong> dans une même demande à l'IA." },
    {
      type: 'list',
      title: 'Concrètement, ça peut être :',
      items: [
        "🖼️ <strong>Une image + du texte</strong> : vous montrez un document photographié et posez une question dessus",
        "📄 <strong>Un fichier PDF + du texte</strong> : vous importez un rapport et demandez un résumé",
        "📸 <strong>Une capture d'écran + du texte</strong> : vous partagez un tableau et demandez une analyse",
        "📊 <strong>Un fichier Word ou Excel + du texte</strong> : vous soumettez un fichier et demandez une extraction de données",
      ]
    },
    { type: 'retenir', title: 'À retenir', text: "La requête multimodale reflète la façon dont on travaille réellement. Au bureau, on ne jongle pas qu'avec des mots — on manipule des photos, des tableaux, des plans, des présentations. Gemini peut désormais faire pareil avec vous, dans la même conversation." },

    // ── Section 2 ──────────────────────────────────────────────────────────────
    { type: 'heading', title: 'Section 2 — Ce que Gemini accepte comme fichiers' },
    { type: 'paragraph', text: "Avant de commencer, voici ce que Gemini peut lire et analyser :" },
    {
      type: 'list',
      title: '🖼️ Images acceptées',
      items: [
        'Formats : JPG, JPEG, PNG, GIF, WebP',
        'Photos prises avec votre téléphone et transférées sur l\'ordinateur',
        'Captures d\'écran de votre écran',
        'Photos de documents physiques (contrats papier, tableaux blancs, programmes)',
        'Graphiques et infographies',
      ]
    },
    {
      type: 'list',
      title: '📄 Documents acceptés',
      items: [
        'PDF (rapports, contrats, présentations exportées)',
        'Fichiers texte TXT',
      ]
    },
    { type: 'infobox', icon: '⚠️', title: "Ce que Gemini ne lit pas directement", text: "• Fichiers Word (.docx) → convertissez en PDF avant de soumettre\n• Fichiers Excel (.xlsx) → faites une capture d'écran ou exportez en PDF\n• Fichiers PowerPoint (.pptx) → exportez en PDF avant soumission\n\n<strong>Comment convertir en PDF :</strong>\n• <strong>Windows</strong> : Ouvrez le fichier > Fichier > Enregistrer sous > choisir PDF\n• <strong>Mac</strong> : Fichier > Exporter > Exporter en PDF" },

    // ── Section 3 ──────────────────────────────────────────────────────────────
    { type: 'heading', title: 'Section 3 — Ajouter un fichier dans Gemini : étapes par étapes' },
    { type: 'paragraph', text: "La même procédure s'applique pour ajouter une image ou un document PDF." },
    { type: 'image', src: '/images/module4/lesson2/gemini-file-upload.png', caption: "Interface Gemini — l'icône trombone permet d'ajouter un fichier ou une image" },
    {
      type: 'steps',
      items: [
        { title: 'Ouvrir Gemini', text: "Allez sur <strong>gemini.google.com</strong> et connectez-vous avec votre compte Google." },
        { title: "Localiser l'icône d'ajout de fichier", text: "En bas de l'écran, repérez la grande zone de texte. À gauche, vous verrez une icône en forme de <strong>trombone</strong> ou d'image — c'est le bouton pour ajouter un fichier." },
        { title: 'Cliquer et sélectionner votre fichier', text: "Cliquez sur cette icône. Une fenêtre de votre explorateur de fichiers s'ouvre. Naviguez jusqu'à votre fichier (image ou PDF), cliquez dessus, puis cliquez sur <em>\"Ouvrir\"</em>." },
        { title: 'Vérifier que le fichier est bien chargé', text: "• Pour une image : une <strong>miniature</strong> apparaît dans la zone de saisie.\n• Pour un PDF : le <strong>nom du fichier</strong> apparaît dans la zone de saisie.\n\n⏳ Pour un PDF volumineux, attendez quelques secondes que le chargement soit complet avant d'écrire votre requête." },
        { title: 'Écrire votre requête et envoyer', text: "Dans la zone de texte, écrivez ce que vous voulez que Gemini fasse avec ce fichier. Appuyez sur Entrée ou cliquez sur le bouton d'envoi." },
      ]
    },
    { type: 'retenir', title: 'Note importante', text: "La fonctionnalité de chargement de fichiers dans Gemini peut varier selon votre région. Si elle n'est pas disponible chez vous, utilisez <strong>Microsoft Copilot</strong> (copilot.microsoft.com) qui offre des fonctionnalités similaires sans restriction géographique." },
    { type: 'infobox', icon: '📱', title: "Astuce — Transférer une photo de téléphone vers ordinateur", text: "Méthode la plus rapide :\n1. Ouvrez WhatsApp sur votre téléphone\n2. Envoyez la photo dans une conversation <em>\"Message à moi-même\"</em>\n3. Ouvrez web.whatsapp.com sur votre ordinateur\n4. Téléchargez la photo depuis WhatsApp Web\n5. Chargez-la ensuite dans Gemini" },

    // ── Section 4 ──────────────────────────────────────────────────────────────
    { type: 'heading', title: 'Section 4 — Construire une bonne requête multimodale' },
    { type: 'paragraph', text: "Le cadre <strong>T.C.R.É.I.</strong> que vous connaissez déjà s'applique exactement de la même façon. La seule différence : votre image ou document remplace ou complète la Référence." },
    { type: 'image', src: '/images/module4/lesson2/multimodal-formula-schema.png', caption: "La formule gagnante : Fichier + Tâche + Contexte + Format = Requête multimodale complète" },
    {
      type: 'list',
      title: 'Les 4 éléments de la formule gagnante',
      items: [
        "🎯 <strong>La tâche</strong> : Qu'est-ce que vous voulez que Gemini fasse ? Exemples : <em>Résume, Extrais, Analyse, Explique, Traduis, Compare, Rédige</em>",
        "🧠 <strong>Le contexte</strong> : Qui êtes-vous et pourquoi ? Exemples : <em>\"Je suis Responsable RH\"</em>, <em>\"Je dois présenter cela à ma direction\"</em>",
        "📋 <strong>Le format de sortie</strong> : Comment voulez-vous recevoir la réponse ? Exemples : <em>\"sous forme de tableau\"</em>, <em>\"en 5 bullet points\"</em>, <em>\"sous forme d'email prêt à envoyer\"</em>",
        "📎 <strong>Le fichier</strong> : Votre image ou document chargé via l'icône trombone.",
      ]
    },
    { type: 'retenir', title: 'Exemple complet', text: "📎 <strong>Fichier joint :</strong> Photo d'un programme de séminaire<br><strong>Requête :</strong> \"Je dois envoyer un récapitulatif à mon équipe [contexte]. Extrais les horaires de toutes les sessions de ce programme [tâche] et présente-les dans un tableau avec 3 colonnes : Heure, Intitulé de la session, Intervenant [format].\"" },

    // ── Section 5 ──────────────────────────────────────────────────────────────
    { type: 'heading', title: 'Section 5 — Exemples concrets par métier' },

    { type: 'infobox', icon: '👥', title: 'Exemple 1 — Ressources Humaines : analyser des CVs en PDF', text: "<strong>Situation :</strong> Vous recevez 15 CVs en PDF pour un poste de Chargé de clientèle. Vous voulez identifier rapidement les profils les plus pertinents.\n\n<strong>Étapes :</strong>\n1. Ouvrez gemini.google.com et connectez-vous\n2. Cliquez sur l'icône trombone et sélectionnez le premier CV en PDF\n3. Attendez que le nom du fichier apparaisse\n4. Tapez : <em>\"Tu es un Responsable RH spécialisé dans le secteur bancaire au Cameroun. Analyse ce CV et donne-moi : 1) Les compétences clés, 2) Le niveau d'expérience en années, 3) Les 3 points forts, 4) Les 2 points faibles pour un poste de Chargé de clientèle, 5) Ta recommandation : À convoquer ou Non, avec explication.\"</em>\n5. Pour le CV suivant, rechargez un nouveau fichier dans la même conversation et dites : <em>\"Fais la même analyse pour ce nouveau CV.\"</em>" },
    { type: 'image', src: '/images/module4/lesson2/example-cv-analysis.png', caption: "Gemini — analyse structurée d'un CV en PDF avec les 5 points d'évaluation" },

    { type: 'infobox', icon: '📢', title: "Exemple 2 — Communication : créer du contenu réseaux sociaux à partir d'une photo", text: "<strong>Situation :</strong> Vous venez d'organiser une journée portes ouvertes à Douala. Vous avez des photos sur votre téléphone et devez alimenter Facebook et LinkedIn.\n\n<strong>Étapes :</strong>\n1. Transférez la photo de votre téléphone vers votre ordinateur (via WhatsApp Web, Google Photos ou câble USB)\n2. Ouvrez gemini.google.com et chargez la photo via l'icône trombone\n3. Vérifiez que la miniature apparaît dans la zone de saisie\n4. Tapez : <em>\"Rédige deux publications à partir de cette photo de notre journée portes ouvertes à Douala. Publication 1 pour Facebook : ton chaleureux et accessible, maximum 5 lignes, 2 emojis, une question pour engager la communauté. Publication 2 pour LinkedIn : ton professionnel, maximum 4 lignes, axé sur les valeurs de notre entreprise.\"</em>\n5. Affinez si besoin : <em>\"Pour la publication Facebook, insiste davantage sur l'ambiance conviviale.\"</em>" },

    { type: 'infobox', icon: '📊', title: "Exemple 3 — Gestion de Projet : extraire les informations d'un programme", text: "<strong>Situation :</strong> Vous recevez le programme d'un séminaire en PDF. Vous devez envoyer un récapitulatif des sessions à votre équipe, puis rédiger un email de rappel.\n\n<strong>Étapes :</strong>\n1. Téléchargez le PDF du programme depuis votre email\n2. Ouvrez gemini.google.com, chargez le PDF et tapez :\n   <em>\"Extrais les horaires de toutes les sessions de ce programme et présente-les dans un tableau : Heure de début | Intitulé de la session | Nom de l'intervenant.\"</em>\n3. Une fois le tableau généré, continuez dans la même conversation :\n   <em>\"Maintenant, rédige un email de rappel professionnel à mon équipe en français, basé sur ce tableau. L'objet doit être accrocheur. Termine par une invitation à noter ces sessions dans leur agenda.\"</em>\n4. Copiez l'email généré et collez-le directement dans votre client email." },

    { type: 'infobox', icon: '💼', title: "Exemple 4 — Direction et Finance : synthétiser un rapport complexe en anglais", text: "<strong>Situation :</strong> Vous recevez un rapport de performance trimestriel en anglais (25 pages). Votre DG n'a pas le temps de tout lire.\n\n<strong>Étapes :</strong>\n1. Téléchargez le rapport PDF depuis votre email\n2. Ouvrez gemini.google.com et chargez le rapport (⏳ un document de 25 pages peut prendre 15 à 20 secondes)\n3. Tapez : <em>\"Tu es un analyste financier senior. Fais une synthèse exécutive en français avec : 1) Les 5 chiffres clés à retenir, 2) Les 3 points positifs du trimestre, 3) Les 2 points de vigilance ou risques, 4) Une recommandation pour le prochain trimestre. Format : bullet points, langage simple, pas de jargon.\"</em>\n4. Affinez si besoin : <em>\"Reformule le point 3 de façon plus diplomatique pour une présentation à la direction.\"</em>" },
    { type: 'image', src: '/images/module4/lesson2/example-report-synthesis.png', caption: "Gemini — synthèse exécutive en français d'un rapport PDF en anglais" },

    // ── Section 6 ──────────────────────────────────────────────────────────────
    { type: 'heading', title: 'Section 6 — Problèmes fréquents et solutions' },
    { type: 'infobox', icon: '🔧', title: "Problème 1 — Je ne vois pas l'icône pour ajouter un fichier", text: "• Vérifiez que vous êtes bien <strong>connecté</strong> à votre compte Google\n• Actualisez la page (F5 sur Windows, Cmd+R sur Mac)\n• Essayez avec <strong>Google Chrome</strong> — c'est le navigateur le plus compatible\n• Vérifiez que votre navigateur est à jour" },
    { type: 'infobox', icon: '🔧', title: "Problème 2 — Mon fichier ne se charge pas ou prend trop longtemps", text: "• Vérifiez la taille : si le PDF fait plus de <strong>20 Mo</strong>, compressez-le d'abord sur <strong>ilovepdf.com</strong> (gratuit)\n• Vérifiez votre connexion Internet — une connexion lente ralentit le chargement\n• Réessayez en actualisant la page et en rechargeant le fichier" },
    { type: 'infobox', icon: '🔧', title: "Problème 3 — Gemini dit qu'il ne peut pas lire mon fichier", text: "• <strong>Vérifiez le format</strong> : Gemini ne lit pas les .docx, .xlsx ou .pptx directement — convertissez en PDF d'abord\n• Si c'est un <strong>PDF scanné</strong> (photo d'un document papier), la qualité peut être faible — prenez une photo plus nette ou retapez les parties essentielles dans votre requête" },
    { type: 'infobox', icon: '🔧', title: "Problème 4 — La fonctionnalité n'est pas disponible dans ma région", text: "Utilisez <strong>Microsoft Copilot</strong> (copilot.microsoft.com) — pas de restriction géographique et fonctionnalités similaires." },
    { type: 'infobox', icon: '🔧', title: "Problème 5 — La réponse ne correspond pas à mon document", text: "• Précisez la section exacte : <em>\"En te basant uniquement sur la section Résultats financiers de ce rapport...\"</em>\n• Vérifiez que le fichier s'est bien chargé — le nom du fichier doit être visible dans la zone de saisie avant d'envoyer" },

    // ── Section 7 ──────────────────────────────────────────────────────────────
    { type: 'heading', title: 'Section 7 — Bonnes pratiques et limites' },
    {
      type: 'list',
      title: '✅ Ce qu\'il faut faire',
      items: [
        "Toujours décrire clairement ce que vous attendez en retour : tableau, résumé, email, liste, analyse",
        "Préciser le contexte de votre fichier pour aider Gemini à mieux interpréter",
        "Rester dans le même fil de conversation pour affiner sans recommencer de zéro",
        "Vérifier les informations extraites — Gemini peut parfois manquer un détail dans un document chargé",
        "Convertir vos fichiers Word, Excel et PowerPoint en PDF avant de les soumettre",
      ]
    },
    {
      type: 'list',
      title: '❌ Ce qu\'il faut éviter',
      items: [
        "Envoyer une image floue ou un document illisible : qualité entrante = qualité sortante",
        "Partager des documents avec des données personnelles sensibles (salaires nominatifs, données médicales, informations clients confidentielles)",
        "Charger plusieurs fichiers complexes en même temps : procédez un fichier à la fois",
      ]
    },
    { type: 'retenir', title: '⚠️ Avertissement important sur la confidentialité', text: "Lorsque vous soumettez un fichier à Gemini, son contenu est envoyé aux serveurs de Google pour être analysé. <strong>Ne soumettez jamais</strong> des documents contenant : contrats stratégiques non signés, données personnelles protégées par la loi, informations bancaires sensibles, secrets commerciaux. En cas de doute, demandez l'autorisation à votre responsable avant de soumettre un document d'entreprise à un outil IA externe." },

    // ── Section 8 ──────────────────────────────────────────────────────────────
    { type: 'heading', title: "Section 8 — Workflow pratique : du fichier au livrable en 4 étapes" },
    { type: 'image', src: '/images/module4/lesson2/workflow-4-steps.png', caption: "Workflow en 4 étapes : Préparer → Définir le livrable → Charger et rédiger → Itérer" },
    {
      type: 'steps',
      items: [
        { title: 'Préparer le fichier', text: "Quel fichier avez-vous ? Photo, PDF, capture d'écran, document scanné ?<br>Est-il dans le bon format ? Si non, convertissez d'abord en PDF ou en image.<br>Est-il de bonne qualité et lisible ?" },
        { title: 'Définir le livrable attendu', text: "Qu'est-ce que vous voulez obtenir en sortie ?<br>Tableau ? Résumé ? Email ? Publication réseaux sociaux ? Analyse ? Traduction ?<br>À qui est destiné ce livrable ?" },
        { title: 'Charger le fichier et rédiger la requête', text: "Chargez votre fichier via l'icône trombone dans Gemini.<br>Appliquez la formule : <strong>Tâche + Contexte + Format + Fichier chargé</strong>.<br>Envoyez et attendez la réponse." },
        { title: 'Itérer et finaliser', text: "• <strong>Le résultat vous convient ?</strong> Copiez et utilisez directement.\n• <strong>Ajustements nécessaires ?</strong> Restez dans la même conversation et affinez.<br>Exemples : <em>\"C'est bien, mais reformule le point 2 de façon plus concise\"</em> ou <em>\"Ajoute une conclusion qui incite à l'action.\"</em>" },
      ]
    },

    // ── À retenir ───────────────────────────────────────────────────────────────
    { type: 'retenir', title: 'À retenir — Résumé de la leçon', text: "La requête multimodale transforme Gemini en véritable assistant de bureau — capable de lire vos documents, analyser vos photos et en extraire exactement ce dont vous avez besoin.<br><br><strong>La clé : Fichier lisible + Requête précise = Livrable directement utilisable.</strong>" },
    {
      type: 'table',
      title: 'Tableau récapitulatif',
      headers: ['Type de fichier', 'Ce que vous pouvez demander', 'Format de sortie possible'],
      rows: [
        ["Photo d'un document", "Extraire, résumer, traduire", "Tableau, liste, email"],
        ["CV en PDF", "Analyser, évaluer, comparer", "Rapport structuré, recommandation"],
        ["Photo d'un événement", "Rédiger du contenu, décrire", "Post Facebook, LinkedIn"],
        ["Rapport complexe en PDF", "Résumer, synthétiser, traduire", "Synthèse exécutive, bullet points"],
        ["Programme de séminaire", "Extraire les horaires, planifier", "Tableau, email de rappel"],
      ]
    },
    { type: 'retenir', title: '💡 Le réflexe pro', text: "La prochaine fois que vous passez du temps à retaper des informations depuis un tableau, un programme ou un rapport, demandez-vous d'abord : <em>\"Est-ce que je peux charger ce fichier dans Gemini et lui demander de faire ce travail pour moi ?\"</em> La réponse sera très souvent <strong>OUI</strong>." },
  ],
  keywords: ['multimodal', 'PDF', 'image', 'requête', 'Gemini', 'fichier', 'analyse', 'résumé', 'extraction', 'trombone']
};

// ─── Contenu EN ───────────────────────────────────────────────────────────────
const contentEn = {
  intro: "In the previous lesson, you learned to create images from text. Now let's reverse the logic: what if your image or document became the starting point of your request?<br><br>This is the real power of multimodal. You're no longer just talking to AI with words — you're <strong>showing</strong> it what you have, and it helps you turn it into something useful. A photo taken with your phone, a PDF report received by email, an Excel spreadsheet, a screenshot — Gemini can analyze, summarize, explain or extract precise information.<br><br>🛠️ <strong>Tool used in this lesson:</strong> Gemini (gemini.google.com)",
  sections: [
    { type: 'heading', title: 'Section 1 — What is a multimodal request?' },
    { type: 'paragraph', text: "Until now, your requests were text-only. A multimodal request is when you <strong>combine multiple types of media</strong> in a single request to the AI." },
    {
      type: 'list',
      title: 'Concretely, this can be:',
      items: [
        "🖼️ <strong>An image + text</strong>: you show a photographed document and ask a question about it",
        "📄 <strong>A PDF file + text</strong>: you import a report and request a summary",
        "📸 <strong>A screenshot + text</strong>: you share a table and request an analysis",
        "📊 <strong>A Word or Excel file + text</strong>: you submit a file and request data extraction",
      ]
    },
    { type: 'retenir', title: 'Key takeaway', text: "Multimodal requests reflect how we actually work. At the office, we don't just deal with words — we handle photos, tables, plans, presentations. Gemini can now do the same with you, in the same conversation." },

    { type: 'heading', title: 'Section 2 — What files Gemini accepts' },
    { type: 'paragraph', text: "Before we begin, here is what Gemini can read and analyze:" },
    { type: 'list', title: '🖼️ Accepted images', items: ['Formats: JPG, JPEG, PNG, GIF, WebP', 'Photos taken with your phone and transferred to your computer', 'Screenshots of your screen', 'Photos of physical documents (paper contracts, whiteboards, programs)', 'Charts and infographics'] },
    { type: 'list', title: '📄 Accepted documents', items: ['PDF (reports, contracts, exported presentations)', 'Text files TXT'] },
    { type: 'infobox', icon: '⚠️', title: "What Gemini does NOT read directly", text: "• Word files (.docx) → convert to PDF before submitting\n• Excel files (.xlsx) → take a screenshot or export to PDF\n• PowerPoint files (.pptx) → export to PDF before submission\n\n<strong>How to convert to PDF:</strong>\n• <strong>Windows</strong>: Open the file > File > Save As > choose PDF\n• <strong>Mac</strong>: File > Export > Export as PDF" },

    { type: 'heading', title: 'Section 3 — Adding a file in Gemini: step by step' },
    { type: 'paragraph', text: "The same procedure applies for adding an image or a PDF document." },
    { type: 'image', src: '/images/module4/lesson2/gemini-file-upload.png', caption: "Gemini interface — the paperclip icon lets you add a file or image" },
    {
      type: 'steps',
      items: [
        { title: 'Open Gemini', text: "Go to <strong>gemini.google.com</strong> and sign in with your Google account." },
        { title: 'Locate the file attachment icon', text: "At the bottom of the screen, find the large text box. On the left, you'll see a <strong>paperclip</strong> or image icon — that's the button to add a file." },
        { title: 'Click and select your file', text: "Click on this icon. A file explorer window opens automatically. Navigate to your file (image or PDF), click on it, then click <em>\"Open\"</em>." },
        { title: 'Verify the file is loaded', text: "• For an image: a <strong>thumbnail</strong> appears in the input area.\n• For a PDF: the <strong>file name</strong> appears in the input area.\n\n⏳ For a large PDF, wait a few seconds for the loading to complete before writing your request." },
        { title: 'Write your request and send', text: "In the text box, write what you want Gemini to do with this file. Press Enter or click the send button." },
      ]
    },
    { type: 'retenir', title: 'Important note', text: "File upload in Gemini may vary by region. If the feature isn't available in your area, use <strong>Microsoft Copilot</strong> (copilot.microsoft.com) which offers similar features without geographic restrictions." },
    { type: 'infobox', icon: '📱', title: "Tip — Transfer a phone photo to computer", text: "Fastest method:\n1. Open WhatsApp on your phone\n2. Send the photo in a <em>\"Message to myself\"</em> conversation\n3. Open web.whatsapp.com on your computer\n4. Download the photo from WhatsApp Web\n5. Load it into Gemini" },

    { type: 'heading', title: 'Section 4 — Building a good multimodal request' },
    { type: 'paragraph', text: "The <strong>T.C.R.É.I.</strong> framework you already know applies in exactly the same way. The only difference: your image or document replaces or complements the Reference." },
    { type: 'image', src: '/images/module4/lesson2/multimodal-formula-schema.png', caption: "The winning formula: File + Task + Context + Format = Complete multimodal request" },
    {
      type: 'list',
      title: 'The 4 elements of the winning formula',
      items: [
        "🎯 <strong>The task</strong>: What do you want Gemini to do? Examples: <em>Summarize, Extract, Analyze, Explain, Translate, Compare, Write</em>",
        "🧠 <strong>The context</strong>: Who are you and why? Examples: <em>\"I am an HR Manager\"</em>, <em>\"I need to present this to my director\"</em>",
        "📋 <strong>Output format</strong>: How do you want to receive the answer? Examples: <em>\"as a table\"</em>, <em>\"in 5 bullet points\"</em>, <em>\"as a ready-to-send email\"</em>",
        "📎 <strong>The file</strong>: Your image or document loaded via the paperclip icon.",
      ]
    },
    { type: 'retenir', title: 'Complete example', text: "📎 <strong>Attached file:</strong> Photo of a seminar program<br><strong>Request:</strong> \"I need to send a summary to my team [context]. Extract the schedule of all sessions from this program [task] and present it in a table with 3 columns: Time, Session Title, Speaker [format].\"" },

    { type: 'heading', title: 'Section 5 — Concrete examples by profession' },
    { type: 'infobox', icon: '👥', title: 'Example 1 — Human Resources: analyzing CVs in PDF', text: "<strong>Situation:</strong> You receive 15 CVs in PDF for a Customer Service position. You want to quickly identify the most relevant profiles.\n\n<strong>Steps:</strong>\n1. Open gemini.google.com and sign in\n2. Click the paperclip icon and select the first CV in PDF\n3. Wait for the file name to appear\n4. Type: <em>\"You are an HR Manager specialized in the banking sector in Cameroon. Analyze this CV and give me: 1) Key skills, 2) Years of experience, 3) 3 strengths, 4) 2 weaknesses for a Customer Service role, 5) Your recommendation: To interview or Not, with an explanation.\"</em>\n5. For the next CV, reload a new file in the same conversation and say: <em>\"Do the same analysis for this new CV.\"</em>" },
    { type: 'image', src: '/images/module4/lesson2/example-cv-analysis.png', caption: "Gemini — structured CV analysis in PDF with the 5 evaluation points" },

    { type: 'infobox', icon: '📢', title: 'Example 2 — Communications: create social media content from an event photo', text: "<strong>Situation:</strong> You just organized an open day in Douala. You have photos on your phone and need to feed the company's Facebook and LinkedIn pages.\n\n<strong>Steps:</strong>\n1. Transfer the photo from phone to computer (via WhatsApp Web, Google Photos or USB)\n2. Open gemini.google.com and load the photo via the paperclip icon\n3. Type: <em>\"Write two posts from this photo of our open day in Douala. Post 1 for Facebook: warm and accessible tone, max 5 lines, 2 emojis, a question to engage the community. Post 2 for LinkedIn: professional tone, max 4 lines, focused on our company values.\"</em>\n4. Refine if needed: <em>\"For the Facebook post, emphasize the friendly atmosphere more.\"</em>" },

    { type: 'infobox', icon: '📊', title: 'Example 3 — Project Management: extract information from a program', text: "<strong>Situation:</strong> You receive a seminar program as PDF by email. You need to send a session summary to your team and draft a reminder email.\n\n<strong>Steps:</strong>\n1. Download the PDF from your email\n2. Open gemini.google.com, load the PDF and type:\n   <em>\"Extract all session schedules from this program and present them in a table: Start Time | Session Title | Speaker Name.\"</em>\n3. Once the table is generated, continue in the same conversation:\n   <em>\"Now write a professional reminder email to my team in French, based on this table. The subject should be catchy. End with an invitation to add these sessions to their calendar.\"</em>\n4. Copy the generated email and paste it directly into your email client." },

    { type: 'infobox', icon: '💼', title: 'Example 4 — Management and Finance: summarize a complex report in English', text: "<strong>Situation:</strong> You receive a 25-page quarterly performance report in English. Your CEO doesn't have time to read it all.\n\n<strong>Steps:</strong>\n1. Download the PDF report from your email\n2. Open gemini.google.com and load the report (⏳ a 25-page document may take 15–20 seconds)\n3. Type: <em>\"You are a senior financial analyst. Write an executive summary in French with: 1) The 5 key figures to remember, 2) The 3 positive points of the quarter, 3) The 2 watchpoints or identified risks, 4) A recommendation for next quarter. Format: bullet points, plain language, no jargon.\"</em>\n4. Refine: <em>\"Rephrase point 3 more diplomatically for a board presentation.\"</em>" },
    { type: 'image', src: '/images/module4/lesson2/example-report-synthesis.png', caption: "Gemini — executive summary in French from an English PDF report" },

    { type: 'heading', title: 'Section 6 — Common problems and solutions' },
    { type: 'infobox', icon: '🔧', title: "Problem 1 — I can't see the icon to add a file", text: "• Check that you are <strong>signed in</strong> to your Google account\n• Refresh the page (F5 on Windows, Cmd+R on Mac)\n• Try <strong>Google Chrome</strong> — it's the most compatible browser\n• Make sure your browser is up to date" },
    { type: 'infobox', icon: '🔧', title: "Problem 2 — My file won't load or takes too long", text: "• Check the file size: if the PDF is over <strong>20 MB</strong>, compress it first at <strong>ilovepdf.com</strong> (free)\n• Check your internet connection — a slow connection slows down loading\n• Try refreshing the page and reloading the file" },
    { type: 'infobox', icon: '🔧', title: "Problem 3 — Gemini says it can't read my file", text: "• <strong>Check the format</strong>: Gemini doesn't read .docx, .xlsx or .pptx directly — convert to PDF first\n• If it's a <strong>scanned PDF</strong> (photo of a paper document), recognition quality may be low — take a sharper photo or retype key parts in your request" },
    { type: 'infobox', icon: '🔧', title: "Problem 4 — The feature is not available in my region", text: "Use <strong>Microsoft Copilot</strong> (copilot.microsoft.com) — no geographic restriction and similar features." },
    { type: 'infobox', icon: '🔧', title: "Problem 5 — Gemini's answer doesn't match my document", text: "• Specify the exact section: <em>\"Based only on the Financial Results section of this report...\"</em>\n• Make sure the file loaded correctly — the file name should be visible in the input area before sending" },

    { type: 'heading', title: 'Section 7 — Best practices and limitations' },
    { type: 'list', title: '✅ What you should do', items: ["Always clearly describe what output you expect: table, summary, email, list, analysis", "Specify the context of your file to help Gemini better interpret it", "Stay in the same conversation thread to refine without starting over", "Verify extracted information — Gemini may occasionally miss a detail in a loaded document", "Convert Word, Excel and PowerPoint files to PDF before submitting"] },
    { type: 'list', title: '❌ What you should avoid', items: ["Sending a blurry image or illegible document: quality in = quality out", "Sharing documents with sensitive personal data (individual salaries, medical data, confidential client information)", "Loading multiple complex files at the same time: process one file at a time"] },
    { type: 'retenir', title: '⚠️ Important confidentiality warning', text: "When you submit a file to Gemini, its content is sent to Google's servers for analysis. <strong>Never submit</strong> documents containing: unsigned strategic contracts, legally protected personal data, sensitive banking information, trade secrets. When in doubt, ask your manager's permission before submitting a company document to an external AI tool." },

    { type: 'heading', title: 'Section 8 — Practical workflow: from file to deliverable in 4 steps' },
    { type: 'image', src: '/images/module4/lesson2/workflow-4-steps.png', caption: "4-step workflow: Prepare → Define deliverable → Load and write → Iterate" },
    {
      type: 'steps',
      items: [
        { title: 'Prepare the file', text: "What file do you have? Photo, PDF, screenshot, scanned document?<br>Is it in the right format? If not, convert to PDF or image first.<br>Is it good quality and legible?" },
        { title: 'Define the expected deliverable', text: "What do you want to get as output?<br>Table? Summary? Email? Social media post? Analysis? Translation?<br>Who is this deliverable for?" },
        { title: 'Load the file and write the request', text: "Load your file via the paperclip icon in Gemini.<br>Apply the formula: <strong>Task + Context + Format + Loaded file</strong>.<br>Send and wait for the response." },
        { title: 'Iterate and finalize', text: "• <strong>Result is good?</strong> Copy and use directly.\n• <strong>Adjustments needed?</strong> Stay in the same conversation and refine.<br>Examples: <em>\"That's good, but rephrase point 2 more concisely\"</em> or <em>\"Add a call-to-action conclusion.\"</em>" },
      ]
    },

    { type: 'retenir', title: 'Key takeaway — Lesson summary', text: "Multimodal requests transform Gemini into a real office assistant — capable of reading your documents, analyzing your photos and extracting exactly what you need.<br><br><strong>The key: Readable file + Precise request = Directly usable deliverable.</strong>" },
    {
      type: 'table',
      title: 'Summary table',
      headers: ['File type', 'What you can request', 'Possible output format'],
      rows: [
        ["Photo of a document", "Extract, summarize, translate", "Table, list, email"],
        ["CV in PDF", "Analyze, evaluate, compare", "Structured report, recommendation"],
        ["Event photo", "Write content, describe", "Facebook post, LinkedIn post"],
        ["Complex report in PDF", "Summarize, synthesize, translate", "Executive summary, bullet points"],
        ["Seminar program", "Extract schedule, plan", "Table, reminder email"],
      ]
    },
    { type: 'retenir', title: '💡 The pro reflex', text: "Next time you spend time retyping information from a table, program or report, ask yourself first: <em>\"Can I load this file into Gemini and ask it to do this work for me?\"</em> The answer will very often be <strong>YES</strong>." },
  ],
  keywords: ['multimodal', 'PDF', 'image', 'request', 'Gemini', 'file', 'analysis', 'summary', 'extraction', 'paperclip']
};

// ─── Insérer la leçon ─────────────────────────────────────────────────────────
const res = db.prepare(`
  INSERT INTO lessons (module_id, order_index, title_fr, title_en, content_fr, content_en, is_published)
  VALUES (?, 2, ?, ?, ?, ?, 1)
`).run(
  mod4.id,
  "Leçon 2 : Utiliser des images et des documents dans vos requêtes",
  "Lesson 2: Using Images and Documents in Your Requests",
  JSON.stringify(contentFr),
  JSON.stringify(contentEn)
);
console.log('  ✅ Leçon 2 créée (id=' + res.lastInsertRowid + ')');

// ─── Créer le dossier images ──────────────────────────────────────────────────
const fs = require('fs');
const imgDir = '../images/module4/lesson2';
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
  console.log('  ✅ Dossier images/module4/lesson2/ créé');
}

console.log('\n✅ Module 4 — Leçon 2 ajoutée avec succès !');
console.log('   5 images à placer dans : images/module4/lesson2/');
console.log('   - gemini-file-upload.png');
console.log('   - multimodal-formula-schema.png');
console.log('   - example-cv-analysis.png');
console.log('   - example-report-synthesis.png');
console.log('   - workflow-4-steps.png');
