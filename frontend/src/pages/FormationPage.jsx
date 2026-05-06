import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { useT } from '../i18n/translations'
import LangToggle from '../components/LangToggle'
import Footer from '../components/Footer'
import api from '../api/axios'
import { clean } from '../utils/sanitize'

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const icons = {
  lightning:   (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
  megaphone:   (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" /></svg>,
  film:        (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m17.25 2.625h-1.5c-.621 0-1.125-.504-1.125-1.125m2.625 1.125V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125M3.375 5.625c0-.621.504-1.125 1.125-1.125m0 0h13.5m-13.5 0c.621 0 1.125.504 1.125 1.125M20.625 5.625c0-.621-.504-1.125-1.125-1.125m0 0h-1.5m1.5 0c.621 0 1.125.504 1.125 1.125" /></svg>,
  chip:        (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" /></svg>,
  monitor:     (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /></svg>,
  building:    (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>,
  mappin:      (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>,
  user:        (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
  library:     (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>,
  graduation:  (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>,
  sparkles:    (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>,
  checkCircle: (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  check:       (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>,
}

// ─── Données programmes ───────────────────────────────────────────────────────
const programs = [
  {
    iconKey: 'lightning',
    color: 'saim',
    title: "Maîtriser l'IA pour la Productivité Professionnelle",
    tags: ['Cadres', 'Managers', 'Dirigeants', 'Consultants', 'Professionnels'],
    modules: [
      {
        title: "Module 1 : Introduction à l'IA et à l'IA Générative",
        items: [
          "Qu'est-ce que l'IA ? Définitions et applications concrètes.",
          "Comment fonctionne l'IA : Le rôle de la Data et du Machine Learning.",
          "L'IA Générative (GenIA) : Création de textes, images, vidéos.",
          "Forces, limites et biais des modèles d'IA.",
        ],
      },
      {
        title: "Module 2 : Optimiser sa Productivité avec l'IA",
        items: [
          "Identification des tâches répétitives et chronophages.",
          "Outils d'IA pour l'automatisation et l'efficacité (assistants textuels, outils bureautiques).",
          "Cas pratiques d'intégration de l'IA dans les workflows professionnels.",
        ],
      },
      {
        title: "Module 3 : L'Art du Prompting",
        items: [
          "Comprendre l'importance d'un bon prompt.",
          "Formuler des prompts clairs, précis et efficaces.",
          "Techniques avancées : Prompting contextuel, itératif, few-shot.",
          "Exercices pratiques pour différents cas d'utilisation.",
        ],
      },
      {
        title: "Module 4 : Découvrir les Requêtes Multimodales",
        items: [
          "Comprendre l'IA multimodale : texte, image, son, vidéo.",
          "Comment interagir avec des IA qui combinent plusieurs types de données.",
          "Cas d'usage des requêtes multimodales en entreprise.",
        ],
      },
      {
        title: "Module 5 : Utilisation de l'IA dans son Domaine d'Activité",
        items: [
          "Identifier les opportunités d'intégration de l'IA dans votre métier.",
          "Adapter les outils d'IA aux spécificités de votre secteur.",
          "Développer des stratégies d'adoption de l'IA personnalisées.",
        ],
      },
    ],
  },
  {
    iconKey: 'megaphone',
    color: 'amber',
    title: "Utiliser l'IA dans le Marketing",
    tags: ['Marketeurs', 'Communicants', 'Entrepreneurs', 'Community managers', 'PME'],
    modules: [
      {
        title: "Module 1 : Fondamentaux de l'IA pour le Marketing",
        items: [
          "Panorama des outils d'IA dédiés au marketing.",
          "Comprendre l'impact de l'IA sur les stratégies marketing.",
          "Éthique et IA dans la communication.",
        ],
      },
      {
        title: "Module 2 : Création de Contenu et Rédaction Assistée par l'IA",
        items: [
          "Génération de textes marketing (articles de blog, posts réseaux sociaux, emails).",
          "Création de visuels et d'images avec l'IA (DALL-E, Midjourney).",
          "Optimisation du contenu pour le SEO grâce à l'IA.",
        ],
      },
      {
        title: "Module 3 : Automatisation et Personnalisation des Campagnes",
        items: [
          "Utilisation de l'IA pour la segmentation d'audience.",
          "Automatisation des campagnes email et des chatbots.",
          "Analyse prédictive des comportements clients.",
        ],
      },
      {
        title: "Module 4 : Mesure de Performance et Optimisation",
        items: [
          "Tableaux de bord IA pour le suivi des KPIs marketing.",
          "Optimisation des campagnes publicitaires avec l'IA.",
          "Études de cas et bonnes pratiques.",
        ],
      },
    ],
  },
  {
    iconKey: 'film',
    color: 'violet',
    title: "Montage Vidéo avec les Outils IA",
    tags: ['Créateurs de contenu', 'Agences com', 'Entrepreneurs', 'Freelances', 'Médias'],
    modules: [
      {
        title: "Module 1 : Introduction à l'IA dans la Production Vidéo",
        items: [
          "Présentation des outils d'IA pour le montage et la création vidéo.",
          "Comprendre les workflows de production vidéo assistés par l'IA.",
          "Notions de base de la narration visuelle.",
        ],
      },
      {
        title: "Module 2 : Génération et Amélioration d'Assets Vidéo par l'IA",
        items: [
          "Création de scripts et de storyboards avec l'IA.",
          "Génération d'images et de séquences vidéo à partir de texte (text-to-video).",
          "Amélioration de la qualité vidéo (upscaling, stabilisation, colorisation) avec l'IA.",
        ],
      },
      {
        title: "Module 3 : Montage et Post-Production Intelligents",
        items: [
          "Montage automatique de séquences vidéo.",
          "Suppression d'objets indésirables, retouche faciale par l'IA.",
          "Génération de voix off et de sous-titres automatiques.",
        ],
      },
      {
        title: "Module 4 : Effets Spéciaux et Animation par l'IA",
        items: [
          "Création d'effets visuels complexes.",
          "Animation de personnages et de scènes.",
          "Optimisation pour différentes plateformes de diffusion.",
        ],
      },
    ],
  },
  {
    iconKey: 'chip',
    color: 'emerald',
    title: "Spécialisation des Modèles IA pour les Professionnels",
    tags: ['Data scientists', 'Ingénieurs', 'Chercheurs', 'CTO', 'Développeurs'],
    modules: [
      {
        title: "Module 1 : Fondamentaux des Modèles Spécialisés",
        items: [
          "Rappel sur les architectures de modèles (LLM, Vision Transformers).",
          "Introduction au Fine-Tuning et à l'entraînement sur données spécifiques.",
          "Évaluation des performances et métriques clés.",
        ],
      },
      {
        title: "Module 2 : Personnalisation et Adaptation des Modèles",
        items: [
          "Techniques de Fine-Tuning : LoRA, QLoRA, etc.",
          "Intégration de bases de connaissances externes (RAG — Retrieval Augmented Generation).",
          "Développement de modèles d'IA sur mesure pour des cas d'usage précis.",
        ],
      },
      {
        title: "Module 3 : Déploiement et Gestion des Modèles en Production",
        items: [
          "Mise en production de modèles IA : infrastructures et bonnes pratiques.",
          "Monitoring et maintenance des performances des modèles.",
          "Sécurité et éthique des modèles spécialisés.",
        ],
      },
      {
        title: "Module 4 : Cas Pratiques Avancés et Projets",
        items: [
          "Études de cas d'intégration réussie de modèles spécialisés par secteur.",
          "Atelier de développement d'un mini-projet de personnalisation de modèle.",
          "Optimisation des coûts et des ressources pour les déploiements IA.",
        ],
      },
    ],
  },
]

const colorMap = {
  saim:    { bg: 'bg-saim-50',    badge: 'bg-saim-100 text-saim-700',      border: 'border-saim-500',    text: 'text-saim-700',    btn: 'bg-saim-500 hover:bg-saim-600',     dot: 'bg-saim-500'    },
  amber:   { bg: 'bg-amber-50',   badge: 'bg-amber-100 text-amber-700',    border: 'border-amber-500',   text: 'text-amber-700',   btn: 'bg-amber-500 hover:bg-amber-600',   dot: 'bg-amber-500'   },
  violet:  { bg: 'bg-violet-50',  badge: 'bg-violet-100 text-violet-700',  border: 'border-violet-500',  text: 'text-violet-700',  btn: 'bg-violet-500 hover:bg-violet-600', dot: 'bg-violet-500'  },
  emerald: { bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-500', text: 'text-emerald-700', btn: 'bg-emerald-500 hover:bg-emerald-600', dot: 'bg-emerald-500' },
}

const formulas = [
  { iconKey: 'monitor',  label: 'En ligne',     desc: 'Formation à distance, accessible depuis partout. Sessions live + replays disponibles.' },
  { iconKey: 'building', label: 'Au bureau',     desc: 'Formation dispensée directement dans vos locaux, par nos formateurs certifiés.' },
  { iconKey: 'mappin',   label: 'En extérieur', desc: 'Formation dans un site externe choisi pour une immersion totale et un cadre propice.' },
]

// ─── Modal Demande de devis ───────────────────────────────────────────────────
function DevisModal({ onClose }) {
  const [form, setForm]     = useState({ name: '', email: '', org: '', message: '' })
  const [status, setStatus] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setStatus('sending')
    try {
      await api.post('/contact', {
        name: form.name,
        email: form.email,
        message: `[DEMANDE DE DEVIS]\nOrganisation / Structure : ${form.org || 'Non précisé'}\n\n${form.message}`,
      })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative"
        onClick={e => e.stopPropagation()}>

        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6">
          <span className="section-chip">Entreprises &amp; Institutions</span>
          <h2 className="text-xl font-extrabold text-saim-800 mt-3">Demander un devis</h2>
          <p className="text-slate-500 text-sm mt-1">Notre équipe vous contactera sous 24h avec une proposition personnalisée.</p>
        </div>

        {status === 'success' ? (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                {icons.checkCircle('w-9 h-9 text-emerald-500')}
              </div>
            </div>
            <h3 className="font-extrabold text-saim-800 text-lg mb-2">Demande envoyée !</h3>
            <p className="text-slate-500 text-sm">Nous vous contacterons très prochainement.</p>
            <button onClick={onClose} className="mt-6 btn-primary px-6 py-2 text-sm">Fermer</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nom complet *</label>
              <input type="text" className="input-field" placeholder="Jean Dupont"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: clean(e.target.value) }))} required />
            </div>
            <div>
              <label className="label">Email professionnel *</label>
              <input type="email" className="input-field" placeholder="jean@organisation.cm"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: clean(e.target.value) }))} required />
            </div>
            <div>
              <label className="label">Organisation / Structure</label>
              <input type="text" className="input-field" placeholder="Nom de votre organisation"
                value={form.org}
                onChange={e => setForm(f => ({ ...f, org: clean(e.target.value) }))} />
            </div>
            <div>
              <label className="label">Décrivez votre besoin *</label>
              <textarea rows={4} className="input-field resize-none"
                placeholder="Formation souhaitée, nombre de participants, modalité préférée..."
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: clean(e.target.value) }))} required />
            </div>
            {status === 'error' && (
              <p className="text-sm text-red-600 font-medium">Une erreur s'est produite. Réessayez.</p>
            )}
            <button type="submit" className="btn-primary w-full justify-center"
              disabled={status === 'sending'}>
              {status === 'sending' ? 'Envoi en cours...' : 'Envoyer la demande'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function FormationPage({ onGoLanding, onAboutPage, onLoginClick }) {
  const { user, logout } = useAuth()
  const { lang }         = useLang()
  const t                = useT(lang)

  const [menuOpen, setMenuOpen]           = useState(false)
  const [dropOpen, setDropOpen]           = useState(false)
  const [profile, setProfile]             = useState('particulier')
  const [activeProgram, setActiveProgram] = useState(null)
  const [openModules, setOpenModules]     = useState({})
  const [devisOpen, setDevisOpen]         = useState(false)

  const toggleModule = key =>
    setOpenModules(prev => ({ ...prev, [key]: !prev[key] }))

  const handleSelectProgram = (i) => {
    setActiveProgram(i)
    setOpenModules({})
    setTimeout(() => {
      document.getElementById('programme-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const handleProfileSwitch = (p) => {
    setProfile(p)
    setActiveProgram(null)
    setOpenModules({})
  }

  const prog = activeProgram !== null ? programs[activeProgram] : null
  const cm   = prog ? colorMap[prog.color] : null

  return (
    <div className="min-h-screen bg-white">

      {/* ─── MODAL DEVIS ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {devisOpen && (
          <motion.div key="devis-modal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}>
            <DevisModal onClose={() => setDevisOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── NAVBAR ──────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">

            <button onClick={onGoLanding} className="flex-shrink-0">
              <img src="/images/saimlogo.png" alt="SAIM" className="h-10" />
            </button>

            <div className="hidden md:flex items-center gap-1 flex-1 ml-6">
              <button onClick={onGoLanding}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-saim-600 hover:bg-saim-50 rounded-lg transition-colors">
                Accueil
              </button>
              <button onClick={onAboutPage}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-saim-600 hover:bg-saim-50 rounded-lg transition-colors">
                {t('nav_about')}
              </button>
              <button className="px-3 py-2 text-sm font-semibold text-saim-600 bg-saim-50 rounded-lg cursor-default">
                {t('nav_training')}
              </button>
              <button onClick={onGoLanding}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-saim-600 hover:bg-saim-50 rounded-lg transition-colors">
                {t('nav_contact')}
              </button>
            </div>

            <div className="hidden md:flex items-center gap-3 ml-auto">
              <a href="https://wa.me/237677518862" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-bold px-3 py-1.5 rounded-full transition-all active:scale-95">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp
              </a>
              <LangToggle />
              {user ? (
                <div className="relative">
                  <button onClick={() => setDropOpen(!dropOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-saim-50 hover:bg-saim-100 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-saim-500 text-white flex items-center justify-center text-xs font-bold">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </div>
                    <span className="text-sm font-medium text-saim-700">{user.first_name}</span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {dropOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                      <button onClick={() => { setDropOpen(false); onGoLanding() }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        {t('nav_dashboard')}
                      </button>
                      <hr className="my-1 border-slate-100" />
                      <button onClick={() => { setDropOpen(false); logout() }}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                        {t('nav_logout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={onLoginClick} className="btn-primary text-sm px-4 py-2">
                  {t('nav_login')}
                </button>
              )}
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden ml-auto p-2 rounded-lg text-slate-600 hover:bg-slate-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>

          {menuOpen && (
            <div className="md:hidden border-t border-slate-100 py-3 space-y-1">
              <button onClick={() => { onGoLanding(); setMenuOpen(false) }}
                className="block w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                Accueil
              </button>
              <button onClick={() => { onAboutPage(); setMenuOpen(false) }}
                className="block w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                {t('nav_about')}
              </button>
              <button className="block w-full text-left px-4 py-2 text-sm text-saim-600 font-semibold bg-saim-50 rounded-lg">
                {t('nav_training')}
              </button>
              <button onClick={() => { onGoLanding(); setMenuOpen(false) }}
                className="block w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                {t('nav_contact')}
              </button>
              <div className="flex items-center gap-3 px-4 pt-2">
                <LangToggle />
                {!user && (
                  <button onClick={() => { onLoginClick(); setMenuOpen(false) }}
                    className="btn-primary text-sm flex-1 justify-center">
                    {t('nav_login')}
                  </button>
                )}
                {user && (
                  <button onClick={() => { logout(); setMenuOpen(false) }}
                    className="text-sm text-red-500 font-medium">
                    {t('nav_logout')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ─── HERO BANNER ──────────────────────────────────────────────────── */}
      <section className="relative pt-16 overflow-hidden bg-gradient-to-br from-saim-700 via-saim-600 to-saim-800">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-10 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-96 h-96 rounded-full bg-saim-400/10 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <button onClick={onGoLanding}
              className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8 transition-colors group">
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour à l'accueil
            </button>
            <span className="inline-block bg-white/15 backdrop-blur text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
              Nos formations
            </span>
            <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Des formations IA<br className="hidden lg:block" /> pour tous les profils
            </h1>
            <p className="text-white/80 text-lg max-w-2xl leading-relaxed">
              Que vous soyez un particulier ou une organisation, SAIM propose une offre adaptée à vos besoins et à votre contexte.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── SÉLECTEUR DE PROFIL ──────────────────────────────────────────── */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-8">
            <span className="section-chip">Votre profil</span>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-saim-800 mt-3">Qui êtes-vous ?</h2>
            <p className="text-slate-500 mt-2 text-sm">Sélectionnez votre profil pour voir l'offre qui vous correspond.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleProfileSwitch('particulier')}
              className={`text-left p-6 rounded-2xl border-2 transition-all shadow-sm hover:shadow-md ${
                profile === 'particulier'
                  ? 'border-saim-500 bg-saim-50'
                  : 'border-slate-200 bg-white hover:border-saim-300'
              }`}>
              <div className="w-12 h-12 rounded-xl bg-saim-100 text-saim-600 flex items-center justify-center mb-3">
                {icons.user('w-6 h-6')}
              </div>
              <h3 className={`text-lg font-extrabold mb-1 ${profile === 'particulier' ? 'text-saim-700' : 'text-slate-800'}`}>
                Particulier
              </h3>
              <p className="text-sm text-slate-500 leading-snug">
                Formation individuelle 100&nbsp;% en ligne. Accédez aux programmes SAIM à votre rythme.
              </p>
              {profile === 'particulier' && (
                <span className="inline-block mt-3 text-xs font-bold text-saim-600 bg-saim-100 px-3 py-1 rounded-full">
                  Sélectionné
                </span>
              )}
            </button>

            <button
              onClick={() => handleProfileSwitch('entreprise')}
              className={`text-left p-6 rounded-2xl border-2 transition-all shadow-sm hover:shadow-md ${
                profile === 'entreprise'
                  ? 'border-saim-500 bg-saim-50'
                  : 'border-slate-200 bg-white hover:border-saim-300'
              }`}>
              <div className="w-12 h-12 rounded-xl bg-saim-100 text-saim-600 flex items-center justify-center mb-3">
                {icons.library('w-6 h-6')}
              </div>
              <h3 className={`text-lg font-extrabold mb-1 ${profile === 'entreprise' ? 'text-saim-700' : 'text-slate-800'}`}>
                Entreprise &amp; Institution
              </h3>
              <p className="text-sm text-slate-500 leading-snug">
                Privée ou publique. Formation personnalisable, plusieurs modalités disponibles.
              </p>
              {profile === 'entreprise' && (
                <span className="inline-block mt-3 text-xs font-bold text-saim-600 bg-saim-100 px-3 py-1 rounded-full">
                  Sélectionné
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ─── CONTENU PAR PROFIL ───────────────────────────────────────────── */}
      {profile === 'particulier' ? (
          <>

            {/* Bandeau infos */}
            <section className="bg-white border-b border-slate-100">
              <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-2 bg-saim-100 text-saim-700 text-sm font-bold px-4 py-2 rounded-full">
                      {icons.monitor('w-4 h-4')} Formation 100&nbsp;% en ligne
                    </span>
                    <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-sm font-bold px-4 py-2 rounded-full">
                      {icons.check('w-4 h-4')} Accès immédiat après inscription
                    </span>
                    <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-sm font-bold px-4 py-2 rounded-full">
                      {icons.graduation('w-4 h-4')} Certificat de fin de formation
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-0.5">Prix par formation</div>
                    <div className="text-3xl font-extrabold text-saim-700">25&nbsp;500 FCFA</div>
                    <div className="text-xs text-slate-400">/ personne</div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4 cartes formations */}
            <section className="py-16 bg-slate-50">
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-10">
                  <span className="section-chip">Nos programmes</span>
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-saim-800 mt-3">Choisissez votre formation</h2>
                  <p className="text-slate-500 mt-2 text-sm">Cliquez sur une formation pour voir le programme détaillé.</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {programs.map((p, i) => {
                    const c = colorMap[p.color]
                    return (
                      <div key={i}
                        className={`card p-6 cursor-pointer transition-all hover:shadow-lg border-2 ${
                          activeProgram === i ? `${c.border} ${c.bg}` : 'border-transparent hover:border-slate-200'
                        }`}
                        onClick={() => handleSelectProgram(i)}>
                        <div className={`w-12 h-12 rounded-xl ${c.badge} flex items-center justify-center mb-4`}>
                          {icons[p.iconKey]('w-6 h-6')}
                        </div>
                        <h3 className="font-extrabold text-slate-800 text-sm leading-snug mb-3">{p.title}</h3>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {p.tags.slice(0, 2).map(tag => (
                            <span key={tag} className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>{tag}</span>
                          ))}
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); onLoginClick() }}
                          className={`w-full text-white text-xs font-bold py-2 rounded-lg mt-2 transition-all ${c.btn}`}>
                          S'essayer gratuitement
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          </>

        ) : (
          <>

            {/* 3 formules */}
            <section className="py-16 bg-white">
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-10">
                  <span className="section-chip">Modalités</span>
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-saim-800 mt-3">Trois formules disponibles</h2>
                  <p className="text-slate-500 mt-2 text-sm max-w-xl mx-auto">
                    Chaque formation peut être dispensée selon la modalité la plus adaptée à votre organisation.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  {formulas.map((f, i) => (
                    <div key={i} className="card p-7 text-center border border-slate-100 hover:shadow-lg hover:border-saim-200 transition-all">
                      <div className="w-14 h-14 rounded-2xl bg-saim-100 text-saim-600 flex items-center justify-center mx-auto mb-4">
                        {icons[f.iconKey]('w-7 h-7')}
                      </div>
                      <h3 className="font-extrabold text-saim-800 text-lg mb-2">{f.label}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Bandeau personnalisation */}
                <div className="rounded-2xl bg-gradient-to-r from-saim-600 to-saim-800 p-8 flex flex-wrap items-center justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        {icons.sparkles('w-4 h-4 text-white')}
                      </div>
                      <h3 className="text-white font-extrabold text-lg">Formation personnalisable</h3>
                    </div>
                    <p className="text-white/75 text-sm leading-relaxed max-w-lg">
                      Chaque programme peut être adapté aux besoins spécifiques de votre organisation : contenu, durée, modalité et cas d'usage métier sur mesure.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="bg-white/15 text-white text-xs font-bold px-3 py-1 rounded-full">Entreprises privées</span>
                      <span className="bg-white/15 text-white text-xs font-bold px-3 py-1 rounded-full">Institutions publiques</span>
                      <span className="bg-white/15 text-white text-xs font-bold px-3 py-1 rounded-full">ONG &amp; Associations</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-3 flex-shrink-0">
                    <div className="text-center">
                      <div className="text-xs text-white/60 uppercase tracking-wide font-semibold mb-1">Tarification</div>
                      <div className="text-3xl font-extrabold text-white">Sur devis</div>
                    </div>
                    <button
                      onClick={() => setDevisOpen(true)}
                      className="inline-flex items-center gap-2 bg-white hover:bg-saim-50 text-saim-700 font-bold px-6 py-3 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95">
                      Demander un devis
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 4 cartes formations entreprise */}
            <section className="py-16 bg-slate-50">
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-10">
                  <span className="section-chip">Nos programmes</span>
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-saim-800 mt-3">Programmes disponibles</h2>
                  <p className="text-slate-500 mt-2 text-sm">Cliquez sur une formation pour voir le programme détaillé.</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {programs.map((p, i) => {
                    const c = colorMap[p.color]
                    return (
                      <div key={i}
                        className={`card p-6 cursor-pointer transition-all hover:shadow-lg border-2 ${
                          activeProgram === i ? `${c.border} ${c.bg}` : 'border-transparent hover:border-slate-200'
                        }`}
                        onClick={() => handleSelectProgram(i)}>
                        <div className={`w-12 h-12 rounded-xl ${c.badge} flex items-center justify-center mb-4`}>
                          {icons[p.iconKey]('w-6 h-6')}
                        </div>
                        <h3 className="font-extrabold text-slate-800 text-sm leading-snug mb-3">{p.title}</h3>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {p.tags.slice(0, 2).map(tag => (
                            <span key={tag} className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>{tag}</span>
                          ))}
                        </div>
                        <div className={`text-sm font-extrabold ${c.text}`}>Sur devis</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          </>
        )}

      {/* ─── DÉTAIL PROGRAMME ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeProgram !== null && prog && cm && (
          <motion.section
            key={`detail-${activeProgram}`}
            id="programme-detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="py-20 bg-white border-t border-slate-100">
            <div className="max-w-4xl mx-auto px-6">

              {/* En-tête */}
              <div className={`rounded-2xl p-8 mb-8 ${cm.bg}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full mb-4 ${cm.badge}`}>
                      {icons[prog.iconKey]('w-4 h-4')}
                      <span>Formation SAIM</span>
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-extrabold text-saim-800 mb-4">{prog.title}</h2>
                    <div className="flex flex-wrap gap-2">
                      {prog.tags.map(tag => (
                        <span key={tag} className={`text-xs px-3 py-1 rounded-full font-medium ${cm.badge}`}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-slate-500 font-medium mb-0.5">Prix</div>
                    {profile === 'particulier' ? (
                      <>
                        <div className="text-3xl font-extrabold text-saim-700">25&nbsp;500 FCFA</div>
                        <div className="text-xs text-slate-400">/ personne</div>
                      </>
                    ) : (
                      <div className="text-3xl font-extrabold text-saim-700">Sur devis</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Accordéon modules */}
              <h3 className="text-lg font-extrabold text-saim-800 mb-4">Programme de la formation</h3>
              <div className="space-y-3 mb-10">
                {prog.modules.map((mod, mi) => {
                  const key = `${activeProgram}-${mi}`
                  const isOpen = !!openModules[key]
                  return (
                    <div key={mi} className="card overflow-hidden">
                      <button
                        onClick={() => toggleModule(key)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className={`w-8 h-8 rounded-full ${cm.badge} flex items-center justify-center text-sm font-extrabold flex-shrink-0`}>
                            {mi + 1}
                          </span>
                          <span className="font-semibold text-slate-800 text-sm leading-snug">{mod.title}</span>
                        </div>
                        <svg className={`w-5 h-5 text-slate-400 flex-shrink-0 ml-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}>
                            <div className="px-5 pb-5 border-t border-slate-100">
                              <ul className="mt-4 space-y-2.5">
                                {mod.items.map((item, ii) => (
                                  <li key={ii} className="flex items-start gap-2.5 text-sm text-slate-600">
                                    <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${cm.dot}`} />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>

              {/* CTA */}
              <div className="flex flex-wrap justify-center gap-4">
                {profile === 'particulier' ? (
                  <button onClick={onLoginClick}
                    className={`inline-flex items-center gap-2 text-white font-bold px-8 py-3.5 rounded-full ${cm.btn} transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95`}>
                    S'essayer gratuitement →
                  </button>
                ) : (
                  <button onClick={() => setDevisOpen(true)}
                    className="inline-flex items-center gap-2 bg-saim-600 hover:bg-saim-700 text-white font-bold px-8 py-3.5 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95">
                    Demander un devis →
                  </button>
                )}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ─── CTA FINAL ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-saim-600 to-saim-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-96 h-96 bg-saim-400/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
            Prêt à commencer votre formation ?
          </h2>
          <p className="text-white/75 text-lg mb-10 max-w-2xl mx-auto">
            Rejoignez plus de 300 professionnels qui ont déjà amélioré leur productivité avec SAIM.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={onLoginClick}
              className="inline-flex items-center gap-2 bg-white text-saim-700 hover:bg-saim-50 font-extrabold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              S'essayer gratuitement
            </button>
            <button onClick={() => setDevisOpen(true)}
              className="inline-flex items-center gap-2 border-2 border-white/60 hover:border-white text-white hover:bg-white/10 font-bold px-8 py-3.5 rounded-full transition-all">
              Demander un devis entreprise
            </button>
          </div>
        </div>
      </section>

      <Footer scrollTo={onGoLanding} />
    </div>
  )
}
