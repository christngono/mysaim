import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { useT } from '../i18n/translations'
import LangToggle from '../components/LangToggle'
import QuizView from '../components/QuizView'
import PaymentModal from '../components/PaymentModal'
import api from '../api/axios'
import { clean } from '../utils/sanitize'

// ─── YouTube embed helper ─────────────────────────────────────────────────────
function getYoutubeEmbedUrl(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
}

// ─── Keyword highlighter ──────────────────────────────────────────────────────
function highlight(text, keywords = []) {
  if (!keywords.length) return text
  const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const rx = new RegExp(`(${escaped.join('|')})`, 'gi')
  return text.replace(rx, '<span class="highlight-kw">$1</span>')
}

// ─── Content block renderer ───────────────────────────────────────────────────
function ContentBlock({ section, lang, keywords }) {
  if (section.type === 'infobox') {
    return (
      <div className="info-box flex items-start gap-3">
        {section.icon && <span className="text-xl flex-shrink-0 mt-0.5">{section.icon}</span>}
        <div>
          {section.title && <strong className="block mb-1">{section.title}</strong>}
          <p dangerouslySetInnerHTML={{ __html: highlight(section.text, keywords) }} />
        </div>
      </div>
    )
  }
  if (section.type === 'retenir') {
    return (
      <div className="retenir-box">
        <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 mb-2">{section.title}</div>
        <p className="text-emerald-800" dangerouslySetInnerHTML={{ __html: highlight(section.text, keywords) }} />
      </div>
    )
  }
  if (section.type === 'paragraph') {
    return <p dangerouslySetInnerHTML={{ __html: highlight(section.text, keywords) }} />
  }
  if (section.type === 'tools') {
    const items = Array.isArray(section.items)
      ? section.items
      : (section.items || '').split(',').map(s => s.trim()).filter(Boolean)
    return (
      <div className="flex flex-wrap gap-2 my-4">
        {items.map(item => (
          <span key={item} className="flex items-center gap-1.5 bg-white border border-slate-200 text-saim-700 font-bold text-sm px-3 py-1.5 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-saim-500 inline-block" />
            {item}
          </span>
        ))}
      </div>
    )
  }
  if (section.type === 'list') {
    const items = typeof section.items === 'string'
      ? section.items.split('\n').map(s => s.trim()).filter(Boolean)
      : (Array.isArray(section.items) ? section.items : [])
    return (
      <div className="my-4">
        {section.title && <p className="font-semibold text-slate-700 mb-2">{section.title}</p>}
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-saim-500 mt-2 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: highlight(item, keywords) }} />
            </li>
          ))}
        </ul>
      </div>
    )
  }
  if (section.type === 'image') {
    return (
      <figure className="my-5">
        <img src={section.src} alt={section.caption || section.alt || ''} className="w-full rounded-xl shadow-md border border-slate-100 object-contain" />
        {section.caption && <figcaption className="text-xs text-slate-400 text-center mt-2">{section.caption}</figcaption>}
      </figure>
    )
  }
  if (section.type === 'video') {
    const embedUrl = getYoutubeEmbedUrl(section.src)
    return (
      <div className="my-5">
        {section.title && <p className="font-semibold text-slate-700 mb-2">{section.title}</p>}
        {embedUrl
          ? (
            <div className="relative w-full rounded-xl overflow-hidden shadow-md border border-slate-100" style={{ paddingBottom: '56.25%' }}>
              <iframe src={embedUrl} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          )
          : section.src && <video controls src={section.src} className="w-full rounded-xl shadow-md border border-slate-100 bg-black" />
        }
      </div>
    )
  }
  if (section.type === 'audio') {
    return (
      <div className="my-4 bg-saim-50 border border-saim-100 rounded-xl p-4">
        {section.title && <p className="font-semibold text-saim-700 mb-3 text-sm">{section.title}</p>}
        {section.src && <audio controls src={section.src} className="w-full" />}
      </div>
    )
  }
  if (section.type === 'resources') {
    return (
      <div className="my-5 bg-saim-50 border border-saim-100 rounded-xl p-5">
        {section.title && <p className="font-bold text-saim-700 mb-3 text-sm uppercase tracking-wide">{section.title}</p>}
        <ul className="space-y-2">
          {(section.links || []).map((link, idx) => (
            <li key={idx}>
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-saim-600 hover:text-saim-800 font-medium text-sm hover:underline transition-colors">
                <span>🔗</span><span>{link.label || link.url}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  if (section.type === 'example') {
    const headerCls = section.color === 'purple' ? 'bg-gradient-to-r from-violet-700 to-purple-600' : 'bg-gradient-to-r from-saim-700 to-saim-500'
    return (
      <div className="card overflow-hidden my-5">
        <div className={`${headerCls} text-white p-4 flex items-center gap-3`}>
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center text-lg">{section.icon}</div>
          <div>
            <div className="text-xs opacity-70">{section.tag}</div>
            <div className="font-bold">{section.title}</div>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
            <img src="/images/image_Annie.jpeg" alt="Alice" className="w-14 h-14 rounded-full object-cover object-top border-2 border-saim-100 flex-shrink-0" />
            <p className="text-sm text-slate-600">{section.story}</p>
          </div>
          <p dangerouslySetInnerHTML={{ __html: highlight(section.description, keywords) }} />
          <img src={section.image} alt={section.caption} className="w-full rounded-lg border border-slate-100 shadow-sm" />
          <p className="text-xs text-slate-400 text-center">{section.caption}</p>
        </div>
      </div>
    )
  }
  if (section.type === 'heading') {
    return (
      <div className="mt-10 mb-4 pb-2 border-b-2 border-saim-100">
        <h3 className="text-base font-extrabold text-saim-700 uppercase tracking-wide">{section.title}</h3>
      </div>
    )
  }
  if (section.type === 'steps') {
    const items = section.items || []
    return (
      <div className="my-5 space-y-4">
        {section.title && <p className="font-semibold text-slate-700 mb-3">{section.title}</p>}
        <ol className="space-y-4">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-4">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-saim-500 text-white text-sm font-bold flex items-center justify-center mt-0.5">{idx + 1}</span>
              <div className="flex-1">
                {item.title && <strong className="block text-slate-800 mb-1">{item.title}</strong>}
                <span className="text-slate-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: highlight(typeof item === 'string' ? item : (item.text || ''), keywords) }} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    )
  }
  if (section.type === 'table') {
    return (
      <div className="my-5 overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        {section.title && <p className="font-semibold text-slate-700 px-4 pt-4 mb-3">{section.title}</p>}
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-saim-700 text-white">
              {(section.headers || []).map((h, i) => (
                <th key={i} className="text-left px-4 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(section.rows || []).map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-saim-50'}>
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 border-b border-slate-100 text-slate-700">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  return null
}

// ─── Lesson content viewer ────────────────────────────────────────────────────
function LessonViewer({ lesson, lang, t, onComplete, nextStepBtn }) {
  if (!lesson) return null

  const raw      = lang === 'en' ? lesson.content_en : lesson.content_fr
  const title    = lang === 'en' ? lesson.title_en   : lesson.title_fr
  const isArray  = Array.isArray(raw)
  const intro    = isArray ? null : raw?.intro
  const sections = isArray ? raw : (raw?.sections || [])
  const kw       = isArray ? [] : (raw?.keywords || [])

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-extrabold text-saim-800 mb-4">{title}</h2>
      {intro && (
        <p className="text-slate-600 text-base leading-relaxed mb-6"
           dangerouslySetInnerHTML={{ __html: highlight(intro, kw) }} />
      )}
      {sections.map((section, i) => (
        <ContentBlock key={i} section={section} lang={lang} keywords={kw} />
      ))}

      {/* Finish button */}
      {!lesson.completed && (
        <div className="mt-10 text-center">
          <p className="text-slate-400 text-sm mb-4">{t('dash_finish_btn').replace("J'ai", 'Vous avez')} cette leçon ?</p>
          <button onClick={onComplete} className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-emerald-200 transition-all hover:-translate-y-0.5 active:scale-95">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {t('dash_finish_btn')}
          </button>
        </div>
      )}

      {/* Lesson completed state + next step */}
      {lesson.completed && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {t('dash_completed')}
          </div>
          {nextStepBtn && (
            <div className="text-center">{nextStepBtn}</div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Congratulations popup ────────────────────────────────────────────────────
function CongratsPopup({ t, onClose, onNext, onQuiz }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-pop-in relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-emerald-400 to-saim-500" />
        <div className="text-5xl mb-4 animate-bounce-slow">🏆</div>
        <h3 className="text-xl font-extrabold text-saim-800 mb-2">{t('dash_congrats')}</h3>
        <p className="text-slate-500 text-sm mb-6">{t('dash_congrats_p')}</p>
        <div className="flex gap-3 justify-center flex-wrap">
          {onQuiz && (
            <button onClick={onQuiz} className="btn-primary text-sm">
              Passer le quiz →
            </button>
          )}
          {onNext && !onQuiz && (
            <button onClick={onNext} className="btn-primary text-sm">
              {t('dash_next')} →
            </button>
          )}
          <button onClick={onClose} className="btn-secondary text-sm">
            {t('dash_close')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── PromptingWorkshop — exercice interactif T.C.R.É.I. ──────────────────────
const STEP_META = [
  {
    label: 'Tâche & Rôle',
    color: 'bg-saim-500',
    light: 'bg-saim-50 border-saim-200',
    textColor: 'text-saim-700',
    icon: '🎯',
    tip: "Pensez au rôle comme à un « chapeau d'expert » que vous posez sur la tête de l'IA. Plus le rôle est précis (ex : « chef cuisinier sénégalais avec 20 ans d'expérience »), plus la réponse sera adaptée à votre besoin réel.",
  },
  {
    label: 'Contexte',
    color: 'bg-amber-500',
    light: 'bg-amber-50 border-amber-200',
    textColor: 'text-amber-700',
    icon: '📍',
    tip: "Le contexte, c'est tout ce que l'IA ne peut pas deviner : votre budget, votre équipe, vos contraintes, votre audience. Plus vous donnez de détails concrets, moins l'IA sera générique.",
  },
  {
    label: 'Référence',
    color: 'bg-violet-500',
    light: 'bg-violet-50 border-violet-200',
    textColor: 'text-violet-700',
    icon: '📎',
    tip: "Une référence, c'est un exemple passé, un document, un style que vous aimez. C'est comme montrer un modèle à un stagiaire plutôt que de tout expliquer en mots.",
  },
  {
    label: 'Itération',
    color: 'bg-emerald-600',
    light: 'bg-emerald-50 border-emerald-200',
    textColor: 'text-emerald-700',
    icon: '🔁',
    tip: "L'itération transforme un prompt en dialogue. Chaque échange affine la réponse. Ne cherchez pas la perfection au premier essai — c'est normal et même recommandé d'ajuster.",
  },
  {
    label: 'Bilan final',
    color: 'bg-rose-500',
    light: 'bg-rose-50 border-rose-200',
    textColor: 'text-rose-700',
    icon: '🏆',
    tip: "Comparer les deux prompts est la meilleure façon de mesurer l'impact du cadre T.C.R.É.I. Identifiez l'élément qui a le plus changé la qualité : c'est votre levier principal pour la prochaine fois.",
  },
]

const TOPICS = [
  { key: 'A', icon: '📅', label: 'Réunion', desc: "Créer un ordre du jour pour une réunion d'équipe sur les objectifs trimestriels." },
  { key: 'B', icon: '🤝', label: 'Team-building', desc: 'Générer des idées créatives pour une activité de team-building virtuelle.' },
  { key: 'C', icon: '🍽️', label: 'Cuisine', desc: "Trouver une idée de menu de dîner amusante pour surprendre un ami." },
]

// ── Consigne permanente bilingue ───────────────────────────────────────────────
const CONSIGNE = {
  fr: {
    title: '📋 Consigne de l\'atelier',
    gemini: 'Se connecter sur Gemini',
    geminiSteps: [
      'Ouvrez votre navigateur (Chrome recommandé)',
      'Allez sur gemini.google.com',
      'Cliquez sur « Se connecter » en haut à droite',
      'Utilisez votre compte Google (Gmail)',
      'Vous êtes prêt à prompter !',
    ],
    steps: [
      { icon: '1️⃣', label: 'Choisissez un sujet', desc: 'Sélectionnez le sujet A, B ou C ci-dessous.' },
      { icon: '2️⃣', label: 'Prompt Vague (Phase 1)', desc: 'Sur Gemini, tapez uniquement l\'intitulé du sujet, sans détails. Observez la réponse.' },
      { icon: '3️⃣', label: 'Ajoutez un Rôle', desc: 'Relancez : « Agis en tant qu\'expert en [domaine]. Ta mission est de [objectif]. » → Observez le changement de ton.' },
      { icon: '4️⃣', label: 'Ajoutez le Contexte', desc: 'Précisez : budget, nombre de personnes, contraintes, délai, ton souhaité. → La réponse devient-elle plus concrète ?' },
      { icon: '5️⃣', label: 'Ajoutez une Référence', desc: '« L\'année dernière nous avons fait [exemple]... » → L\'IA s\'adapte-t-elle à votre historique ?' },
      { icon: '6️⃣', label: 'Itérez', desc: 'Demandez des ajustements : « Rends-le plus court », « Ajoute une option végétarienne »... Combien d\'échanges pour atteindre le résultat voulu ?' },
      { icon: '7️⃣', label: 'Revenez ici & Répondez', desc: 'Revenez sur cette page, répondez aux 5 questions d\'analyse, puis soumettez votre atelier.' },
    ],
    videoNote: '🎬 Vidéo tutoriel : Comment se connecter sur Gemini',
    videoComingSoon: 'Vidéo bientôt disponible',
    collapse: 'Réduire la consigne',
    expand: 'Afficher la consigne',
  },
  en: {
    title: '📋 Workshop Instructions',
    gemini: 'Connect to Gemini',
    geminiSteps: [
      'Open your browser (Chrome recommended)',
      'Go to gemini.google.com',
      'Click "Sign in" at the top right',
      'Use your Google account (Gmail)',
      'You\'re ready to prompt!',
    ],
    steps: [
      { icon: '1️⃣', label: 'Choose a topic', desc: 'Select topic A, B or C below.' },
      { icon: '2️⃣', label: 'Vague Prompt (Phase 1)', desc: 'On Gemini, type only the topic title with no details. Observe the response.' },
      { icon: '3️⃣', label: 'Add a Role', desc: 'Relaunch: "Act as an expert in [field]. Your mission is to [goal]." → Observe the change in tone.' },
      { icon: '4️⃣', label: 'Add Context', desc: 'Specify: budget, number of people, constraints, deadline, desired tone. → Does the response become more concrete?' },
      { icon: '5️⃣', label: 'Add a Reference', desc: '"Last year we did [example]..." → Does the AI adapt to your history?' },
      { icon: '6️⃣', label: 'Iterate', desc: 'Ask for adjustments: "Make it shorter", "Add a vegetarian option"... How many exchanges to reach the desired result?' },
      { icon: '7️⃣', label: 'Come back here & Answer', desc: 'Return to this page, answer the 5 analysis questions, then submit your workshop.' },
    ],
    videoNote: '🎬 Tutorial video: How to connect to Gemini',
    videoComingSoon: 'Video coming soon',
    collapse: 'Collapse instructions',
    expand: 'Show instructions',
  }
}

function WorkshopInstructions({ lang, topic, geminiVideoUrl }) {
  const [open, setOpen] = useState(true)
  const c = CONSIGNE[lang] || CONSIGNE.fr
  const selectedTopic = TOPICS.find(t => t.key === topic)

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl overflow-hidden mb-6">
      {/* Header always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-blue-100/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">📋</span>
          <span className="font-extrabold text-blue-800 text-sm">{c.title}</span>
          {topic && (
            <span className="ml-2 inline-flex items-center gap-1 bg-saim-100 text-saim-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {selectedTopic?.icon} Sujet {topic}
            </span>
          )}
        </div>
        <span className="text-blue-500 text-xs font-medium">
          {open ? `▲ ${c.collapse}` : `▼ ${c.expand}`}
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-5 border-t border-blue-200">
          {/* Gemini connection */}
          <div className="mt-4">
            <p className="text-xs font-extrabold text-blue-700 uppercase tracking-wider mb-2">
              🌐 {c.gemini}
            </p>
            {/* Video placeholder */}
            <div className="bg-white border border-blue-200 rounded-xl overflow-hidden mb-3">
              {geminiVideoUrl ? (
                <video controls className="w-full rounded-xl max-h-56" playsInline preload="metadata">
                  <source src={geminiVideoUrl} type="video/mp4" />
                  <source src={geminiVideoUrl} type="video/quicktime" />
                </video>
              ) : (
                <div className="flex items-center gap-3 p-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-xl flex-shrink-0">🎬</div>
                  <div>
                    <p className="text-xs font-bold text-blue-700">{c.videoNote}</p>
                    <p className="text-xs text-blue-400 italic">{c.videoComingSoon}</p>
                  </div>
                </div>
              )}
            </div>
            <ol className="space-y-1.5">
              {c.geminiSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-blue-800">
                  <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 font-extrabold flex items-center justify-center flex-shrink-0 text-[10px]">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            <a
              href="https://gemini.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-all"
            >
              Ouvrir Gemini →
            </a>
          </div>

          {/* Step-by-step guide */}
          <div>
            <p className="text-xs font-extrabold text-blue-700 uppercase tracking-wider mb-3">
              🗺️ Déroulement de l'atelier
            </p>
            <div className="space-y-2">
              {c.steps.map((s, i) => (
                <div key={i} className="flex gap-3 bg-white rounded-xl px-3 py-2.5 border border-blue-100">
                  <span className="text-base flex-shrink-0">{s.icon}</span>
                  <div>
                    <p className="text-xs font-extrabold text-blue-800">{s.label}</p>
                    <p className="text-xs text-blue-600 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PromptingWorkshop({ data, lang, onGoToQuestion }) {
  const [topic,        setTopic]        = useState(null)
  const [step,         setStep]         = useState(0)
  const [answers,      setAnswers]      = useState({})
  const [showFeedback, setShowFeedback] = useState(false)
  const [submitting,   setSubmitting]   = useState(false)
  const [submitted,    setSubmitted]    = useState(!!data.submission)
  const [subData,      setSubData]      = useState(data)
  const totalSteps = data.questions.length

  const currentQ = step >= 1 && step <= totalSteps ? data.questions[step - 1] : null
  const meta      = step >= 1 && step <= totalSteps ? STEP_META[step - 1] : null

  const advance = () => {
    setShowFeedback(true)
    setTimeout(() => { setShowFeedback(false); setStep(s => s + 1) }, 1800)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const allAnswers = {}
    data.questions.forEach(q => { allAnswers[q.id] = answers[q.id] || '' })
    if (data.questions[0]) {
      allAnswers[data.questions[0].id] = `[Sujet ${topic}] ` + (answers[data.questions[0].id] || '')
    }
    try {
      await api.post(`/exercises/${data.id}/submit`, { answers: allAnswers })
      const r = await api.get(`/exercises/module/${data.module_id || subData.module_id}`)
      setSubData(r.data); setSubmitted(true)
    } catch { /* ignore */ }
    finally { setSubmitting(false) }
  }

  // ── Already submitted ────────────────────────────────────────────────────────
  if (submitted && subData.submission) {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="text-2xl">🏆</div>
          <div>
            <p className="font-bold text-emerald-700">Atelier terminé !</p>
            <p className="text-emerald-600 text-xs">
              Soumis le {new Date(subData.submission.submitted_at).toLocaleString('fr-FR')}
              {subData.submission.grade && <span className="ml-2 font-bold"> · Note : {subData.submission.grade}</span>}
            </p>
          </div>
        </div>
        {subData.questions.map((q, idx) => {
          const qText = lang === 'en' ? q.question_en : q.question_fr
          const m = STEP_META[idx]
          const ans = (() => {
            try {
              const parsed = typeof subData.submission.answers === 'object'
                ? subData.submission.answers : JSON.parse(subData.submission.answers)
              return parsed[q.id] || '—'
            } catch { return '—' }
          })()
          return (
            <div key={q.id} className={`card p-5 border-l-4 border-${['saim','amber','violet','emerald','rose'][idx]}-400`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{m.icon}</span>
                <span className={`text-xs font-extrabold uppercase tracking-wider ${m.textColor}`}>{m.label}</span>
              </div>
              <p className="font-semibold text-slate-800 text-sm mb-2">{qText}</p>
              <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-700 whitespace-pre-wrap border border-slate-100">{ans}</div>
            </div>
          )
        })}
        {subData.submission.feedback && (
          <div className="card p-5 border-l-4 border-saim-400">
            <p className="text-xs font-bold text-saim-600 uppercase tracking-wider mb-2">Feedback du formateur</p>
            <p className="text-slate-700 whitespace-pre-wrap">{subData.submission.feedback}</p>
          </div>
        )}
        {!subData.submission.feedback && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            {lang === 'en' ? 'Your workshop is being evaluated. You will receive a notification when it is graded.' : 'Votre atelier est en cours d\'évaluation. Vous recevrez une notification lorsqu\'il sera corrigé.'}
          </div>
        )}
        {onGoToQuestion && (
          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-500 mb-3">{lang === 'en' ? 'Next step' : 'Étape suivante'}</p>
            <button onClick={onGoToQuestion} className="inline-flex items-center gap-2 bg-saim-600 hover:bg-saim-700 text-white font-bold px-8 py-3 rounded-full shadow-lg transition-all hover:-translate-y-0.5 active:scale-95">
              💬 {lang === 'en' ? 'Ask a question →' : 'Poser une question →'}
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── Feedback animation ────────────────────────────────────────────────────────
  if (showFeedback && meta) {
    const feedbacks = {
      fr: [
        "Excellent ! Le rôle oriente tout le reste. Passons au contexte 👇",
        "Parfait ! Détails précis = IA précise. Voyons les références 📎",
        "Super ! Une bonne référence personnalise tout. À l'itération ! 🔁",
        "Bravo ! Itérer c'est dialoguer. Dernière étape : le bilan 🏆",
        "Excellent travail ! Cadre T.C.R.É.I. maîtrisé. Passez au récapitulatif →",
      ],
      en: [
        "Excellent! The role guides everything else. Let's move to context 👇",
        "Perfect! Precise details = precise AI. Let's look at references 📎",
        "Great! A good reference personalizes everything. To iteration! 🔁",
        "Bravo! Iterating is dialoguing. Last step: the summary 🏆",
        "Excellent work! T.C.R.E.I. framework mastered. Move to summary →",
      ]
    }
    const msgs = feedbacks[lang] || feedbacks.fr
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[40vh] text-center gap-6">
        <div className={`w-20 h-20 rounded-full ${meta.color} flex items-center justify-center text-4xl shadow-lg animate-pulse`}>
          {meta.icon}
        </div>
        <p className="text-lg font-bold text-slate-700 max-w-sm">{msgs[step - 1]}</p>
        <div className="flex gap-1.5">
          {[1,2,3,4,5].map(i => (
            <div key={i} className={`w-3 h-3 rounded-full transition-all ${i <= step ? meta.color : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>
    )
  }

  // ── Step 0 : Topic selection ─────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-saim-100 text-saim-700 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
            🎓 Atelier interactif
          </div>
          <h2 className="text-2xl font-extrabold text-saim-800 mb-1">
            {lang === 'en' ? 'Prompting Workshop — T.C.R.E.I.' : 'Atelier du Prompting — T.C.R.É.I.'}
          </h2>
          <p className="text-slate-500 text-sm">
            {lang === 'en'
              ? 'Follow the instructions below, then choose your topic to start.'
              : 'Suivez les instructions ci-dessous, puis choisissez votre sujet pour commencer.'}
          </p>
        </div>

        {/* Consigne toujours visible */}
        <WorkshopInstructions lang={lang} topic={topic} geminiVideoUrl="/videos/gemini-tuto.mp4" />

        {/* Topic selection */}
        <p className="text-sm font-bold text-slate-700 mb-4">
          {lang === 'en' ? '① Choose your topic:' : '① Choisissez votre sujet :'}
        </p>
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {TOPICS.map(t => (
            <button
              key={t.key}
              onClick={() => setTopic(t.key)}
              className={`text-left p-5 rounded-2xl border-2 transition-all ${
                topic === t.key
                  ? 'border-saim-500 bg-saim-50 shadow-lg scale-[1.02]'
                  : 'border-slate-200 bg-white hover:border-saim-300 hover:bg-saim-50/50'
              }`}
            >
              <div className="text-3xl mb-2">{t.icon}</div>
              <div className="font-extrabold text-slate-800 mb-1">
                {lang === 'en' ? 'Topic' : 'Sujet'} {t.key} — {t.label}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{t.desc}</p>
              {topic === t.key && (
                <div className="mt-3 inline-flex items-center gap-1 text-saim-600 text-xs font-bold">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {lang === 'en' ? 'Selected' : 'Sélectionné'}
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
          <strong>⚠️ {lang === 'en' ? 'Before clicking Start:' : 'Avant de cliquer sur Démarrer :'}</strong>{' '}
          {lang === 'en'
            ? 'Make sure you have completed your Gemini session (steps 2 to 6 above). You will answer the analysis questions after your prompting test.'
            : 'Assurez-vous d\'avoir complété votre session Gemini (étapes 2 à 6 ci-dessus). Vous répondrez aux questions d\'analyse après votre test de prompting.'}
        </div>

        <div className="text-center">
          <button
            onClick={() => setStep(1)}
            disabled={!topic}
            className="btn-primary px-10 py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {lang === 'en' ? 'Start analysis →' : 'Commencer l\'analyse →'}
          </button>
          {!topic && (
            <p className="text-xs text-slate-400 mt-2">
              {lang === 'en' ? 'Select a topic to continue' : 'Sélectionnez un sujet pour continuer'}
            </p>
          )}
        </div>
      </div>
    )
  }

  // ── Steps 1-5 ────────────────────────────────────────────────────────────────
  if (step >= 1 && step <= totalSteps && currentQ && meta) {
    const qText  = lang === 'en' ? currentQ.question_en : currentQ.question_fr
    const val    = answers[currentQ.id] || ''
    const isLast = step === totalSteps

    return (
      <div className="max-w-3xl mx-auto">
        {/* Consigne toujours visible (réduite par défaut en mode questions) */}
        <WorkshopInstructions lang={lang} topic={topic} geminiVideoUrl="/videos/gemini-tuto.mp4" />

        {/* Progress */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full ${meta.color} text-white flex items-center justify-center text-base`}>{meta.icon}</span>
              <span className={`text-sm font-extrabold ${meta.textColor}`}>{meta.label}</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {lang === 'en' ? `Step ${step}/${totalSteps}` : `Étape ${step}/${totalSteps}`}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${meta.color}`}
              style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
          <div className="flex gap-1.5 mt-2">
            {STEP_META.map((m, i) => (
              <div key={i} title={m.label}
                className={`h-1.5 flex-1 rounded-full transition-all cursor-default ${i < step ? m.color : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>

        {/* Topic badge */}
        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-500 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          {TOPICS.find(t => t.key === topic)?.icon} {lang === 'en' ? 'Topic' : 'Sujet'} {topic} — {TOPICS.find(t => t.key === topic)?.label}
        </div>

        {/* Question card */}
        <div className={`card p-6 border-2 ${meta.light} mb-4`}>
          <p className="text-xs font-extrabold uppercase tracking-wider mb-2 opacity-50">
            {lang === 'en' ? `Question ${step}` : `Question ${step}`}
          </p>
          <p className="font-bold text-slate-800 leading-relaxed">{qText}</p>
        </div>

        {/* Conseil */}
        <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <span className="text-xl flex-shrink-0">💡</span>
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">
              {lang === 'en' ? 'SAIM Tip' : 'Conseil SAIM'}
            </p>
            <p className="text-sm text-amber-800 leading-relaxed">{meta.tip}</p>
          </div>
        </div>

        {/* Answer */}
        <div className="card p-5">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {lang === 'en' ? 'Your answer' : 'Votre réponse'}
          </label>
          <textarea
            className="input-field resize-none w-full" rows={5}
            placeholder={lang === 'en' ? 'Write your analysis here...' : 'Rédigez votre analyse ici...'}
            value={val}
            onChange={e => setAnswers(prev => ({ ...prev, [currentQ.id]: clean(e.target.value) }))}
          />
        </div>

        <div className="flex items-center justify-between mt-5">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} className="text-sm text-slate-500 hover:text-slate-700 font-medium">
              ← {lang === 'en' ? 'Back' : 'Retour'}
            </button>
          ) : <div />}
          {!isLast ? (
            <button onClick={advance} disabled={!val.trim()}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
              {lang === 'en' ? 'Next step →' : 'Étape suivante →'}
            </button>
          ) : (
            <button onClick={() => setStep(totalSteps + 1)} disabled={!val.trim()}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
              {lang === 'en' ? 'See summary →' : 'Voir le récapitulatif →'}
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Step 6 : Summary + Submit ─────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🎓</div>
        <h2 className="text-2xl font-extrabold text-saim-800 mb-2">Récapitulatif de votre atelier</h2>
        <p className="text-slate-500 text-sm">Vérifiez vos réponses avant de soumettre.</p>
      </div>
      <div className="space-y-4 mb-8">
        {data.questions.map((q, idx) => {
          const m = STEP_META[idx]
          const qText = lang === 'en' ? q.question_en : q.question_fr
          return (
            <div key={q.id} className={`card p-5 border-l-4 border-${['saim','amber','violet','emerald','rose'][idx]}-400`}>
              <div className="flex items-center gap-2 mb-1">
                <span>{m.icon}</span>
                <span className={`text-xs font-extrabold uppercase tracking-wider ${m.textColor}`}>{m.label}</span>
              </div>
              <p className="text-xs text-slate-500 mb-2">{qText}</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{answers[q.id] || <span className="text-slate-300 italic">Non renseigné</span>}</p>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-between">
        <button onClick={() => setStep(totalSteps)} className="text-sm text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1">
          ← Modifier
        </button>
        <button onClick={handleSubmit} disabled={submitting} className="btn-primary px-10 py-3 text-base">
          {submitting ? 'Envoi...' : '✅ Soumettre l\'atelier'}
        </button>
      </div>
    </div>
  )
}

// ─── ExerciseView ─────────────────────────────────────────────────────────────
function ExerciseView({ moduleId, lang, onGoToQuestion }) {
  const [data, setData]           = useState(null)
  const [answers, setAnswers]     = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!moduleId) return
    setData(null); setError(''); setAnswers({}); setSubmitted(false)
    api.get(`/exercises/module/${moduleId}`)
      .then(r => { setData(r.data); if (r.data.submission) setSubmitted(true) })
      .catch(() => setError('Aucun exercice disponible pour ce module.'))
  }, [moduleId])

  const handleSubmit = async () => {
    if (!data) return
    const unanswered = data.questions.filter(q => !answers[q.id]?.trim())
    if (unanswered.length > 0) { setError('Veuillez répondre à toutes les questions avant de soumettre.'); return }
    setSubmitting(true); setError('')
    try {
      await api.post(`/exercises/${data.id}/submit`, { answers })
      const r = await api.get(`/exercises/module/${moduleId}`)
      setData(r.data); setSubmitted(true)
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors de la soumission.')
    } finally { setSubmitting(false) }
  }

  if (error && !data) return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-4">
      <div className="text-5xl">📋</div>
      <p className="text-slate-400">{error}</p>
    </div>
  )
  if (!data) return <div className="flex items-center justify-center min-h-[40vh]"><div className="text-slate-400 text-sm">Chargement...</div></div>

  const title        = lang === 'en' ? data.title_en        : data.title_fr
  const instructions = lang === 'en' ? data.instructions_en : data.instructions_fr

  // ── Detect interactive workshop ────────────────────────────────────────────
  const isAtelier = (data.instructions_fr || '').includes('[ATELIER_TCREI]')
  if (isAtelier) {
    return (
      <div className="max-w-3xl mx-auto">
        <PromptingWorkshop data={data} lang={lang} onGoToQuestion={onGoToQuestion} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">Exercice</div>
        <h2 className="text-2xl font-extrabold text-saim-800 mb-2">{title}</h2>
        {instructions && <p className="text-slate-600 leading-relaxed bg-saim-50 border border-saim-100 rounded-xl p-4">{instructions}</p>}
      </div>

      {submitted && data.submission ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <p className="font-semibold text-emerald-700 text-sm">Exercice soumis</p>
              <p className="text-emerald-600 text-xs">
                {new Date(data.submission.submitted_at).toLocaleString('fr-FR')}
                {data.submission.grade && <span className="ml-2 font-bold">Note : {data.submission.grade}</span>}
              </p>
            </div>
          </div>
          {data.questions.map((q, idx) => {
            const qText = lang === 'en' ? q.question_en : q.question_fr
            const ans   = typeof data.submission.answers === 'object'
              ? data.submission.answers[q.id]
              : (() => { try { return JSON.parse(data.submission.answers)[q.id] } catch { return '' } })()
            return (
              <div key={q.id} className="card p-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Question {idx + 1}</p>
                <p className="font-semibold text-slate-800 mb-3">{qText}</p>
                <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-700 whitespace-pre-wrap border border-slate-100">{ans || '—'}</div>
              </div>
            )
          })}
          {data.submission.feedback && (
            <div className="card p-5 border-l-4 border-saim-400">
              <p className="text-xs font-bold text-saim-600 uppercase tracking-wider mb-2">Feedback du formateur</p>
              <p className="text-slate-700 whitespace-pre-wrap">{data.submission.feedback}</p>
            </div>
          )}
          {!data.submission.feedback && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
              Votre exercice est en cours d'évaluation. Vous recevrez une notification lorsqu'il sera corrigé.
            </div>
          )}
          {onGoToQuestion && (
            <div className="text-center pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500 mb-3">Étape suivante</p>
              <button onClick={onGoToQuestion} className="inline-flex items-center gap-2 bg-saim-600 hover:bg-saim-700 text-white font-bold px-8 py-3 rounded-full shadow-lg transition-all hover:-translate-y-0.5 active:scale-95">
                💬 Poser une question →
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {data.questions.map((q, idx) => {
            const qText = lang === 'en' ? q.question_en : q.question_fr
            return (
              <div key={q.id} className="card p-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Question {idx + 1}</p>
                <p className="font-semibold text-slate-800 mb-3">{qText}</p>
                <textarea
                  className="input-field resize-none w-full" rows={4}
                  placeholder="Votre réponse..."
                  value={answers[q.id] || ''}
                  onChange={e => setAnswers(prev => ({ ...prev, [q.id]: clean(e.target.value) }))}
                />
              </div>
            )
          })}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="text-right">
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
              {submitting ? 'Envoi...' : "Soumettre l'exercice"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── QuestionView ─────────────────────────────────────────────────────────────
function QuestionView({ moduleId, lang, onGoToNextModule }) {
  const [questions, setQuestions]   = useState([])
  const [newQuestion, setNewQuestion] = useState('')
  const [sending, setSending]       = useState(false)
  const [sent, setSent]             = useState(false)
  const [error, setError]           = useState('')

  const load = useCallback(async () => {
    try {
      const r = await api.get('/questions/my')
      setQuestions(r.data.filter(q => String(q.module_id) === String(moduleId)))
    } catch {}
  }, [moduleId])

  useEffect(() => { load() }, [load])

  const sendQuestion = async () => {
    if (!newQuestion.trim()) return
    setSending(true); setError('')
    try {
      await api.post('/questions', { module_id: moduleId, question: newQuestion.trim() })
      setNewQuestion(''); setSent(true); load()
    } catch (e) {
      setError(e.response?.data?.error || "Erreur lors de l'envoi.")
    } finally { setSending(false) }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="inline-block bg-saim-100 text-saim-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">Q&amp;A</div>
        <h2 className="text-2xl font-extrabold text-saim-800 mb-2">Questions au formateur</h2>
        <p className="text-slate-500 text-sm">Posez vos questions sur ce module. Le formateur vous répondra dès que possible.</p>
      </div>

      {/* Question form */}
      {!sent ? (
        <div className="card p-5 mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Votre question</label>
          <textarea
            className="input-field resize-none w-full mb-3" rows={3}
            placeholder="Posez votre question ici..."
            value={newQuestion}
            onChange={e => setNewQuestion(clean(e.target.value))}
          />
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <div className="flex items-center justify-between gap-3">
            <button onClick={sendQuestion} disabled={sending || !newQuestion.trim()} className="btn-primary text-sm">
              {sending ? 'Envoi...' : 'Envoyer la question'}
            </button>
            {onGoToNextModule && (
              <button onClick={onGoToNextModule} className="text-sm text-slate-400 hover:text-slate-600 underline transition-colors">
                Passer au module suivant
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="card p-5 mb-6 bg-emerald-50 border-emerald-200">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-4">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Question envoyée avec succès !
          </div>
          {onGoToNextModule && (
            <button onClick={onGoToNextModule} className="inline-flex items-center gap-2 bg-saim-600 hover:bg-saim-700 text-white font-bold px-8 py-3 rounded-full shadow-lg transition-all hover:-translate-y-0.5 active:scale-95">
              Module suivant →
            </button>
          )}
        </div>
      )}

      {/* Past questions */}
      <div className="space-y-4">
        {questions.map(q => (
          <div key={q.id} className="card p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="font-medium text-slate-800">{q.question}</p>
              <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${q.answer ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {q.answer ? 'Répondu' : 'En attente'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">{new Date(q.created_at).toLocaleString('fr-FR')}</p>
            {q.answer && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Réponse du formateur</p>
                <p className="text-slate-700 text-sm whitespace-pre-wrap">{q.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── NotificationBell ─────────────────────────────────────────────────────────
function NotificationBell() {
  const [count, setCount]                 = useState(0)
  const [open, setOpen]                   = useState(false)
  const [notifications, setNotifications] = useState([])
  const dropdownRef                       = useRef(null)

  const fetchCount = useCallback(async () => {
    try { const r = await api.get('/notifications/count'); setCount(r.data.count) } catch {}
  }, [])

  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [fetchCount])

  const openDropdown = async () => {
    if (!open) {
      try { const r = await api.get('/notifications'); setNotifications(r.data) } catch {}
    }
    setOpen(o => !o)
  }

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 }))); setCount(0)
    } catch {}
  }

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n))
      setCount(prev => Math.max(0, prev - 1))
    } catch {}
  }

  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={openDropdown} className="relative p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition-colors" title="Notifications">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center leading-none">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-700">Notifications</span>
            {notifications.some(n => !n.is_read) && (
              <button onClick={markAllRead} className="text-xs text-saim-600 hover:text-saim-800 font-semibold">Tout marquer lu</button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0
              ? <div className="p-6 text-center text-slate-400 text-sm">Aucune notification.</div>
              : notifications.map(n => {
                  let parsedData = {}
                  try { parsedData = JSON.parse(n.data) } catch {}
                  return (
                    <div key={n.id} className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer ${!n.is_read ? 'bg-saim-50/50' : ''}`} onClick={() => !n.is_read && markRead(n.id)}>
                      <div className="flex items-start gap-2">
                        <span className="text-base flex-shrink-0 mt-0.5">
                          {n.type === 'certificate' ? '🏆' : n.type === 'exercise_graded' ? '📋' : '💬'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                          {n.type === 'certificate' && parsedData.file_url && (
                            <a href={parsedData.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1.5 text-xs text-saim-600 hover:text-saim-800 font-semibold hover:underline" onClick={e => e.stopPropagation()}>
                              Télécharger le certificat →
                            </a>
                          )}
                          <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleString('fr-FR')}</p>
                        </div>
                        {!n.is_read && <span className="w-2 h-2 bg-saim-500 rounded-full flex-shrink-0 mt-1.5" />}
                      </div>
                    </div>
                  )
                })
            }
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sidebar icons ────────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
  )
}
function ActiveDot() {
  return <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-saim-500 bg-saim-50 flex items-center justify-center"><span className="w-2 h-2 rounded-full bg-saim-500" /></span>
}
function EmptyDot() {
  return <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-slate-300 bg-white" />
}
function LockDot() {
  return <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">🔒</span>
}

// ─── Onboarding Guide ────────────────────────────────────────────────────────
const ONBOARDING_STEPS = [
  { icon: '🎉', title: 'Bienvenue sur SAIM !', desc: 'Votre plateforme de formation en Intelligence Artificielle. En quelques clics, découvrez comment tirer le meilleur parti de votre parcours.' },
  { icon: '📋', title: 'Le Sommaire à gauche', desc: 'La barre de gauche contient tous vos modules de formation. Cliquez sur un module pour voir ou réduire ses leçons.' },
  { icon: '▶️', title: 'Commencez par une leçon', desc: 'Sélectionnez une leçon dans le sommaire pour l\'ouvrir. Lisez son contenu attentivement avant de passer à la suite.' },
  { icon: '✅', title: 'Validez chaque leçon', desc: 'À la fin de chaque leçon, cliquez sur "Terminer la leçon". Cela enregistre votre progression et débloque la suivante.' },
  { icon: '📝', title: 'Passez le Quiz', desc: 'Quand toutes les leçons d\'un module sont terminées, un quiz apparaît. Répondez aux questions pour tester vos connaissances. Score minimum requis pour continuer.' },
  { icon: '📋', title: 'Réalisez l\'Exercice', desc: 'Après le quiz, un exercice pratique vous attend. Appliquez ce que vous avez appris en répondant aux questions ouvertes.' },
  { icon: '💬', title: 'Posez vos Questions', desc: 'Une fois l\'exercice soumis, vous pouvez poser une question au formateur. Il vous répondra directement sur la plateforme.' },
  { icon: '🚀', title: 'Module suivant !', desc: 'Répétez ce parcours pour chaque module — Leçons → Quiz → Exercice → Questions — jusqu\'à compléter toute votre formation. Bonne chance !' },
]

function OnboardingGuide({ onDone }) {
  const [step, setStep] = useState(0)
  const [animating, setAnimating] = useState(false)

  const goTo = (next) => {
    setAnimating(true)
    setTimeout(() => { setStep(next); setAnimating(false) }, 250)
  }

  const current = ONBOARDING_STEPS[step]
  const isLast = step === ONBOARDING_STEPS.length - 1

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-saim-900/80 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Progress bar */}
        <div className="h-1.5 bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-saim-400 to-saim-600 transition-all duration-500"
            style={{ width: `${((step + 1) / ONBOARDING_STEPS.length) * 100}%` }}
          />
        </div>

        <div className={`p-8 transition-all duration-250 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          {/* Step indicator */}
          <div className="flex justify-center gap-1.5 mb-6">
            {ONBOARDING_STEPS.map((_, i) => (
              <span key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-saim-500 w-5' : i < step ? 'bg-saim-300' : 'bg-slate-200'}`} />
            ))}
          </div>

          {/* Icon */}
          <div className="text-6xl text-center mb-5">{current.icon}</div>

          {/* Content */}
          <h2 className="text-xl font-extrabold text-saim-800 text-center mb-3">{current.title}</h2>
          <p className="text-slate-500 text-center text-sm leading-relaxed mb-8">{current.desc}</p>

          {/* Actions */}
          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={() => goTo(step - 1)} className="flex-1 py-3 rounded-full border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all">
                ← Précédent
              </button>
            )}
            {step === 0 && (
              <button onClick={onDone} className="text-slate-400 text-sm underline hover:text-slate-600 transition-all">
                Ignorer
              </button>
            )}
            <button
              onClick={isLast ? onDone : () => goTo(step + 1)}
              className="flex-1 py-3 rounded-full bg-saim-600 hover:bg-saim-700 text-white text-sm font-bold transition-all active:scale-95"
            >
              {isLast ? '🚀 Commencer ma formation !' : 'Suivant →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Formation Detail Page ────────────────────────────────────────────────────
function FormationDetailPage({ formation, lang, onBack, onEnroll, onContinue, onPay, onWaitlist, isOnWaitlist }) {
  const hasContent = (formation.module_count || 0) > 0
  let objectives = [], programme = []
  try { objectives = JSON.parse(formation.learning_objectives || '[]') } catch {}
  try { programme  = JSON.parse(formation.programme           || '[]') } catch {}
  const embedUrl = getYoutubeEmbedUrl(formation.teaser_url)
  const title    = lang === 'en' && formation.title_en ? formation.title_en : formation.title_fr
  const color    = formation.color || 'blue'
  const themeBar = { blue:'bg-blue-600', orange:'bg-orange-500', purple:'bg-purple-600', green:'bg-green-600' }[color] || 'bg-blue-600'

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      {/* Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        {formation.image_url
          ? <img src={formation.image_url} alt={title} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-slate-700 flex items-center justify-center text-8xl opacity-30">{formation.icon || '🤖'}</div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <button
          onClick={onBack}
          className="absolute top-4 left-4 flex items-center gap-1.5 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 px-3 py-1.5 rounded-full text-sm backdrop-blur-sm transition-all"
        >
          ← {lang === 'fr' ? 'Retour' : 'Back'}
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="text-3xl mb-2">{formation.icon || '🤖'}</div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-3">{title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-white/70 text-sm">
            {formation.level && <span className="capitalize bg-white/10 px-2.5 py-1 rounded-full">📶 {formation.level}</span>}
            {formation.duration_hours > 0 && <span className="bg-white/10 px-2.5 py-1 rounded-full">⏱ {formation.duration_hours}h</span>}
            {hasContent && <span className="bg-white/10 px-2.5 py-1 rounded-full">📚 {formation.module_count} modules</span>}
          </div>
        </div>
        <div className={`absolute top-0 left-0 right-0 h-1 ${themeBar}`} />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Teaser video */}
        {embedUrl && (
          <section>
            <h2 className="text-lg font-extrabold text-slate-800 mb-4">{lang === 'fr' ? 'Vidéo de présentation' : 'Preview video'}</h2>
            <div className="aspect-video rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src={embedUrl}
                title="Teaser"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {/* Descriptif — Pourquoi cette formation? */}
        {formation.why_fr && (
          <section className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-extrabold text-slate-800 mb-3">
              {lang === 'fr' ? 'Pourquoi cette formation ?' : 'Why this course?'}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{formation.why_fr}</p>
          </section>
        )}

        {/* Objectifs */}
        {objectives.length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-extrabold text-slate-800 mb-4">
              {lang === 'fr' ? 'Objectifs de la formation' : 'Learning objectives'}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {objectives.map((o, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-extrabold">✓</span>
                  <span className="text-sm text-slate-700 leading-snug">{o}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Programme */}
        {programme.length > 0 && (
          <section>
            <h2 className="text-lg font-extrabold text-slate-800 mb-4">
              {lang === 'fr' ? 'Programme du cours' : 'Course curriculum'}
            </h2>
            <div className="space-y-3">
              {programme.map((m, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50 border-b border-slate-100">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold text-white ${themeBar}`}>{i + 1}</span>
                    <h3 className="font-bold text-slate-800 text-sm">{m.module}</h3>
                    {m.items?.length > 0 && <span className="ml-auto text-xs text-slate-400">{m.items.length} leçon{m.items.length > 1 ? 's' : ''}</span>}
                  </div>
                  {m.items?.length > 0 && (
                    <ul className="divide-y divide-slate-50">
                      {m.items.map((item, j) => (
                        <li key={j} className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-600">
                          <span className="w-4 h-4 rounded-full border-2 border-slate-200 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Infos utiles */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-extrabold text-slate-800 mb-4">
            {lang === 'fr' ? 'Informations utiles' : 'Key info'}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: '💰', label: lang === 'fr' ? 'Prix' : 'Price', value: `${(formation.price || 25500).toLocaleString('fr-FR')} FCFA` },
              { icon: '⏱', label: lang === 'fr' ? 'Durée' : 'Duration', value: `${formation.duration_hours || 3}h de formation` },
              { icon: '🌐', label: lang === 'fr' ? 'Format' : 'Format', value: '100% en ligne' },
              { icon: '🎓', label: lang === 'fr' ? 'Certification' : 'Certificate', value: 'Certificat SAIM AI' },
              ...(formation.prerequisites ? [{ icon: '📋', label: lang === 'fr' ? 'Prérequis' : 'Prerequisites', value: formation.prerequisites }] : []),
              ...(formation.level ? [{ icon: '📶', label: 'Niveau', value: formation.level }] : []),
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {!hasContent ? (
            <div className="text-center">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="font-extrabold text-slate-800 mb-2">
                {lang === 'fr' ? 'Formation bientôt disponible' : 'Coming soon'}
              </h3>
              <p className="text-sm text-slate-500 mb-5">
                {lang === 'fr'
                  ? "Cette formation est en cours de préparation. Inscrivez-vous dès maintenant pour être notifié(e) en premier dès son lancement."
                  : 'This course is being prepared. Sign up now to be notified first when it launches.'}
              </p>
              {isOnWaitlist ? (
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 font-bold px-5 py-3 rounded-xl text-sm">
                  ✓ {lang === 'fr' ? "Inscription confirmée ! Nous vous contacterons." : 'You are on the waitlist!'}
                </div>
              ) : (
                <button
                  onClick={onWaitlist}
                  className={`w-full ${themeBar} hover:opacity-90 text-white font-bold px-6 py-3.5 rounded-xl transition-colors text-sm`}
                >
                  {lang === 'fr' ? "S'inscrire →" : 'Sign up →'}
                </button>
              )}
            </div>
          ) : !formation.enrollment_status ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-extrabold text-slate-800">{lang === 'fr' ? 'Essai gratuit' : 'Free trial'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{lang === 'fr' ? 'Accédez au premier module sans engagement' : 'Access the first module for free'}</p>
                </div>
                <span className="text-xl font-extrabold text-slate-800">{(formation.price || 25500).toLocaleString('fr-FR')} FCFA</span>
              </div>
              <button onClick={onEnroll} className={`w-full ${themeBar} hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all text-sm`}>
                {lang === 'fr' ? "S'essayer gratuitement →" : 'Try for free →'}
              </button>
            </div>
          ) : formation.enrollment_status === 'trial' ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700 mb-3">{lang === 'fr' ? 'Vous avez un accès essai actif' : 'You have an active trial'}</p>
              <button onClick={onContinue} className={`w-full ${themeBar} hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all text-sm`}>
                {lang === 'fr' ? '▶ Continuer la formation' : '▶ Continue course'}
              </button>
              <button onClick={onPay} className="w-full border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold py-3 rounded-xl transition-all text-sm">
                {lang === 'fr' ? `Accès complet · ${(formation.price || 25500).toLocaleString('fr-FR')} FCFA` : `Full access · ${(formation.price || 25500).toLocaleString('fr-FR')} FCFA`}
              </button>
            </div>
          ) : (
            <button onClick={onContinue} className={`w-full ${themeBar} hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all text-sm`}>
              {lang === 'fr' ? '▶ Continuer la formation' : '▶ Continue course'}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}

// ─── Catalog Card ─────────────────────────────────────────────────────────────
function CatalogCard({ formation, title, status, isComingSoon, audience, theme, lang, onDetail, onEnroll, onContinue, onPay }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm ${isComingSoon ? '' : 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200'}`}>

      {/* Cover image — clickable */}
      <div className="relative w-full h-40 flex-shrink-0 overflow-hidden cursor-pointer" onClick={onDetail}>
        {formation.image_url ? (
          <img src={formation.image_url} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full ${theme.iconBg} flex items-center justify-center text-5xl`}>
            {formation.icon || '🤖'}
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {isComingSoon && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400 text-white shadow">Bientôt</span>}
          {status === 'paid'  && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow">✓ Inscrit</span>}
          {status === 'trial' && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/90 text-blue-700 shadow">Essai</span>}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />
        <div className={`absolute bottom-2 left-3 w-9 h-9 rounded-xl ${theme.iconBg} flex items-center justify-center text-xl shadow-md border-2 border-white`}>
          {formation.icon || '🤖'}
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-extrabold text-slate-800 leading-snug text-sm mb-2 cursor-pointer hover:text-saim-600 transition-colors" onClick={onDetail}>{title}</h3>
          <div className="flex flex-wrap gap-1">
            {audience.map((a, i) => <span key={i} className={`text-xs font-medium px-2 py-0.5 rounded-full ${theme.tag}`}>{a}</span>)}
          </div>
        </div>

        {(formation.level || formation.duration_hours) && (
          <div className="flex items-center gap-3 text-xs text-slate-400">
            {formation.level && <span className="capitalize">📶 {formation.level}</span>}
            {formation.duration_hours > 0 && <span>⏱ {formation.duration_hours}h</span>}
          </div>
        )}

        {/* En savoir plus */}
        <button onClick={onDetail} className={`w-full border rounded-xl py-2 text-xs font-semibold transition-colors ${theme.outline}`}>
          {lang === 'fr' ? 'En savoir plus →' : 'Learn more →'}
        </button>

        {/* CTA */}
        <div className="mt-auto pt-1">
          {isComingSoon ? (
            <button onClick={onDetail} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold py-2.5 rounded-xl transition-colors">
              {lang === 'fr' ? "✉️ Liste d'attente" : '✉️ Waitlist'}
            </button>
          ) : !status ? (
            <button onClick={onEnroll} className={`w-full ${theme.fill} text-white text-sm font-bold py-2.5 rounded-xl transition-colors`}>
              {lang === 'fr' ? "S'essayer gratuitement" : 'Try for free'}
            </button>
          ) : status === 'trial' ? (
            <div className="flex flex-col gap-2">
              <button onClick={onContinue} className={`w-full ${theme.fill} text-white text-sm font-bold py-2.5 rounded-xl transition-colors`}>
                {lang === 'fr' ? '▶ Continuer' : '▶ Continue'}
              </button>
              <button onClick={onPay} className={`w-full border text-xs font-semibold py-2 rounded-xl transition-colors ${theme.outline}`}>
                Accès complet · 25 500 FCFA
              </button>
            </div>
          ) : (
            <button onClick={onContinue} className={`w-full ${theme.fill} text-white text-sm font-bold py-2.5 rounded-xl transition-colors`}>
              {lang === 'fr' ? '▶ Continuer' : '▶ Continue'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function UserDashboard({ onGoLanding }) {
  const { user, logout, refreshEnrollments } = useAuth()
  const { lang }         = useLang()
  const t                = useT(lang)

  const [activeNav,         setActiveNav]         = useState('learning') // 'catalog' | 'learning' | 'reader'
  const [detailFormation,   setDetailFormation]   = useState(null)
  const [waitlistSet,       setWaitlistSet]       = useState(new Set())
  const [waitlistMsg,       setWaitlistMsg]       = useState(null)
  const [formations,        setFormations]        = useState([])
  const [loadingFormations, setLoadingFormations] = useState(true)
  const [activeFormationId, setActiveFormationId] = useState(1)
  const [paymentFormation,  setPaymentFormation]  = useState(null)

  const [modules,          setModules]          = useState([])
  const [progress,         setProgress]         = useState({ total: 0, completed: 0, percent: 0 })
  const [activeLesson,     setActiveLesson]      = useState(null)
  const [lessonData,       setLessonData]        = useState(null)
  const [showCongrats,     setShowCongrats]      = useState(false)
  const [activeView,       setActiveView]        = useState(null)
  const [quizModuleId,     setQuizModuleId]      = useState(null)
  const [lockedMod,        setLockedMod]         = useState(null)
  const [exerciseModuleId, setExerciseModuleId]  = useState(null)
  const [questionModuleId, setQuestionModuleId]  = useState(null)
  const [sidebarOpen,      setSidebarOpen]       = useState(false)
  const [collapsedModules, setCollapsedModules]  = useState(new Set())
  const [loadingModules,   setLoadingModules]    = useState(true)
  const [loadingLesson,    setLoadingLesson]     = useState(false)
  const [showProfile,      setShowProfile]       = useState(false)
  const [showOnboarding,   setShowOnboarding]    = useState(false)
  const [welcomeBack,      setWelcomeBack]       = useState(null)
  const sectionStartRef = useRef(null)

  const loadFormations = useCallback(async () => {
    try {
      const res = await api.get('/courses/formations')
      setFormations(res.data)
    } catch {} finally { setLoadingFormations(false) }
  }, [])

  const loadModules = useCallback(async () => {
    try {
      const [mods, prog] = await Promise.all([
        api.get(`/courses/modules?formation_id=${activeFormationId}`),
        api.get(`/courses/progress?formation_id=${activeFormationId}`)
      ])
      setModules(mods.data)
      setProgress(prog.data)
    } catch {} finally { setLoadingModules(false) }
  }, [activeFormationId])

  // ─── Time tracking ──────────────────────────────────────────────────────────
  const trackTime = () => {
    const s = sectionStartRef.current
    if (!s) return
    const seconds = Math.round((Date.now() - s.startedAt) / 1000)
    sectionStartRef.current = null
    if (seconds < 5) return
    api.post('/courses/track-time', {
      section_type: s.type, section_id: s.id, module_id: s.moduleId, duration_seconds: seconds
    }).catch(() => {})
  }

  useEffect(() => { return () => { trackTime() } }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadFormations() }, [loadFormations])

  // Track site visit once on mount
  useEffect(() => { api.post('/courses/track-visit').catch(() => {}) }, [])

  // Load waitlist
  useEffect(() => {
    api.get('/courses/waitlist').then(r => setWaitlistSet(new Set(r.data))).catch(() => {})
  }, [])

  // Reset detail view when switching main nav
  useEffect(() => { setDetailFormation(null) }, [activeNav])

  const joinWaitlist = async (formationId) => {
    try {
      const r = await api.post('/courses/waitlist', { formation_id: formationId })
      setWaitlistSet(s => new Set([...s, formationId]))
      setWaitlistMsg(r.data.message)
      setTimeout(() => setWaitlistMsg(null), 6000)
    } catch {}
  }

  useEffect(() => {
    loadModules()
    const interval = setInterval(loadModules, 30000)
    return () => clearInterval(interval)
  }, [loadModules])

  const switchFormation = (formationId) => {
    setActiveFormationId(formationId)
    setActiveView(null)
    setActiveLesson(null)
    setLessonData(null)
    setQuizModuleId(null)
    setLockedMod(null)
    setExerciseModuleId(null)
    setQuestionModuleId(null)
    setActiveNav('reader')
  }

  const enrollAndStart = async (formation) => {
    try {
      await api.post('/courses/enroll', { formation_id: formation.id })
      await refreshEnrollments()
      await loadFormations()
      switchFormation(formation.id)
    } catch {}
  }

  // ─── Onboarding + Welcome back ───────────────────────────────────────────────
  const findContinueLesson = (mods) => {
    for (const mod of mods) {
      if (mod.locked) continue
      for (const lesson of mod.lessons) {
        if (!lesson.completed) return lesson
      }
    }
    return null
  }

  useEffect(() => {
    if (loadingModules || modules.length === 0) return
    const done = localStorage.getItem('saim_onboarding_done')
    if (!done) {
      setShowOnboarding(true)
      return
    }
    // Welcome back — une seule fois par session
    if (!sessionStorage.getItem('saim_welcomed')) {
      sessionStorage.setItem('saim_welcomed', '1')
      const lesson = findContinueLesson(modules)
      if (lesson) setWelcomeBack(lesson)
    }
  }, [loadingModules, modules]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Progression helpers ────────────────────────────────────────────────────
  const getModuleOf = (lesson) => modules.find(m => m.lessons.some(l => l.id === lesson.id))

  const isLastLessonOfModule = (lesson) => {
    const mod = getModuleOf(lesson)
    if (!mod || mod.lessons.length === 0) return false
    return mod.lessons[mod.lessons.length - 1].id === lesson.id
  }

  const getNextModule = (moduleId) => {
    const idx = modules.findIndex(m => m.id === moduleId)
    if (idx >= 0 && idx < modules.length - 1) return modules[idx + 1]
    return null
  }

  // ─── Navigation actions ─────────────────────────────────────────────────────
  const selectLesson = async (lesson) => {
    trackTime()
    sectionStartRef.current = { type: 'lesson', id: lesson.id, moduleId: lesson.module_id, startedAt: Date.now() }
    setActiveLesson(lesson); setActiveView('lesson'); setLoadingLesson(true)
    setQuizModuleId(null); setLockedMod(null); setExerciseModuleId(null); setQuestionModuleId(null)
    setSidebarOpen(false)
    try { const res = await api.get(`/courses/lessons/${lesson.id}`); setLessonData(res.data) } catch {}
    finally { setLoadingLesson(false) }
  }

  const openQuiz = (moduleId) => {
    trackTime()
    const mod = modules.find(m => m.id === moduleId)
    if (mod?.quiz) sectionStartRef.current = { type: 'quiz', id: mod.quiz.id, moduleId, startedAt: Date.now() }
    setActiveView('quiz'); setQuizModuleId(moduleId)
    setActiveLesson(null); setLessonData(null); setLockedMod(null); setExerciseModuleId(null); setQuestionModuleId(null)
    setSidebarOpen(false)
  }

  const openLocked = (module) => {
    trackTime()
    setActiveView('locked'); setLockedMod(module)
    setActiveLesson(null); setLessonData(null); setQuizModuleId(null); setExerciseModuleId(null); setQuestionModuleId(null)
    setSidebarOpen(false)
  }

  const openExercise = (moduleId) => {
    trackTime()
    const mod = modules.find(m => m.id === moduleId)
    if (mod?.exercise) sectionStartRef.current = { type: 'exercise', id: mod.exercise.id, moduleId, startedAt: Date.now() }
    setActiveView('exercise'); setExerciseModuleId(moduleId)
    setActiveLesson(null); setLessonData(null); setQuizModuleId(null); setLockedMod(null); setQuestionModuleId(null)
    setSidebarOpen(false)
  }

  const openQuestion = (moduleId) => {
    trackTime()
    sectionStartRef.current = { type: 'question', id: moduleId, moduleId, startedAt: Date.now() }
    setActiveView('question'); setQuestionModuleId(moduleId)
    setActiveLesson(null); setLessonData(null); setQuizModuleId(null); setLockedMod(null); setExerciseModuleId(null)
    setSidebarOpen(false)
  }

  const goToNextModule = (currentModuleId) => {
    const next = getNextModule(currentModuleId)
    if (next && !next.locked && next.lessons.length > 0) {
      selectLesson(next.lessons[0])
    }
  }

  const completeLesson = async () => {
    if (!activeLesson) return
    await api.post(`/courses/lessons/${activeLesson.id}/complete`)
    setLessonData(prev => prev ? { ...prev, completed: true } : null)
    setShowCongrats(true)
    loadModules()
  }

  // After congrats: go to next lesson in module, or quiz if last lesson
  const afterCongrats = () => {
    setShowCongrats(false)
    if (!activeLesson) return
    const mod = getModuleOf(activeLesson)
    if (!mod) return
    const idx = mod.lessons.findIndex(l => l.id === activeLesson.id)
    // If there's a next lesson in this module
    if (idx >= 0 && idx < mod.lessons.length - 1) {
      selectLesson(mod.lessons[idx + 1])
    } else if (mod.quiz) {
      openQuiz(mod.id)
    }
  }

  const isCongratsLastLesson = activeLesson ? isLastLessonOfModule(activeLesson) : false
  const congratsMod          = activeLesson ? getModuleOf(activeLesson) : null

  // ─── "Next step" button rendered inside LessonViewer after completion ───────
  const buildNextStepBtn = () => {
    if (!lessonData?.completed || !activeLesson) return null
    const mod = getModuleOf(activeLesson)
    if (!mod) return null
    const idx = mod.lessons.findIndex(l => l.id === activeLesson.id)
    // Not the last lesson → show next lesson button
    if (idx >= 0 && idx < mod.lessons.length - 1) {
      return (
        <button onClick={() => selectLesson(mod.lessons[idx + 1])} className="inline-flex items-center gap-2 bg-saim-600 hover:bg-saim-700 text-white font-bold px-8 py-3 rounded-full shadow-lg transition-all hover:-translate-y-0.5 active:scale-95">
          Leçon suivante →
        </button>
      )
    }
    // Last lesson → show "Passer le quiz" if quiz exists
    if (mod.quiz) {
      return (
        <button onClick={() => openQuiz(mod.id)} className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 rounded-full shadow-lg transition-all hover:-translate-y-0.5 active:scale-95">
          📝 Passer le quiz →
        </button>
      )
    }
    // No quiz → show exercise if exists
    if (mod.exercise) {
      return (
        <button onClick={() => openExercise(mod.id)} className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-3 rounded-full shadow-lg transition-all hover:-translate-y-0.5 active:scale-95">
          📋 Faire l'exercice →
        </button>
      )
    }
    return null
  }

  const activeFormation = formations.find(f => f.id === activeFormationId)
  const enrolledFormations = formations.filter(f => f.enrollment_status !== null)

  // ── Shared header (all views) ────────────────────────────────────────────────
  const DashHeader = () => (
    <header className="sticky top-0 z-[60] bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center h-14 px-4 gap-3">
        {activeNav === 'reader' && (
          <button className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-500" onClick={() => setSidebarOpen(o => !o)} aria-label="Menu">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        )}
        <button onClick={onGoLanding} className="flex-shrink-0">
          <img src="/uploads/apropos/saim_ai_logo_fond.png" alt="SAIM" className="h-9" />
        </button>
        <nav className="hidden sm:flex items-center gap-1 ml-4">
          {[
            { key: 'learning', label: lang === 'fr' ? 'Mon Apprentissage' : 'My Learning', icon: '🏠' },
            { key: 'catalog',  label: lang === 'fr' ? 'Explorer les formations' : 'Browse courses', icon: '🔍' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveNav(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeNav === tab.key || (tab.key === 'learning' && activeNav === 'reader') ? 'bg-saim-50 text-saim-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          <a href="https://wa.me/237677518862" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-bold px-3 py-1.5 rounded-full transition-all active:scale-95 flex-shrink-0">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
          <LangToggle />
          <NotificationBell />
          <button onClick={() => setShowProfile(true)} className="flex items-center gap-2 hover:bg-slate-50 rounded-xl px-2 py-1 transition-colors">
            <div className="w-8 h-8 rounded-full bg-saim-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="hidden lg:block text-xs text-left">
              <div className="font-semibold text-slate-700">{user?.first_name} {user?.last_name}</div>
              <div className="text-slate-400">{user?.post || user?.email}</div>
            </div>
          </button>
          <button onClick={() => { logout(); onGoLanding() }} title={t('nav_logout')} className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </div>
      {activeNav === 'reader' && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-saim-400 to-saim-600 rounded-full transition-all duration-700" style={{ width: `${progress.percent}%` }} />
            </div>
            <span className="text-xs font-bold text-saim-600 flex-shrink-0">{progress.percent}%</span>
          </div>
        </div>
      )}
    </header>
  )

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <DashHeader />

      {/* ─── MON APPRENTISSAGE (tableau de bord perso) ──────────────────────── */}
      {activeNav === 'learning' && (
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="max-w-5xl mx-auto px-6 py-8">

            {/* Greeting */}
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold text-saim-800">
                {lang === 'fr' ? `Bonjour, ${user?.first_name} 👋` : `Hello, ${user?.first_name} 👋`}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {lang === 'fr' ? 'Continuez votre progression en intelligence artificielle.' : 'Continue your artificial intelligence journey.'}
              </p>
            </div>

            {/* Stats row */}
            {enrolledFormations.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  {
                    icon: '📚',
                    value: enrolledFormations.length,
                    label: lang === 'fr' ? 'Formation(s) inscrite(s)' : 'Enrolled course(s)',
                    color: 'bg-saim-50 border-saim-100',
                    textColor: 'text-saim-700',
                  },
                  {
                    icon: '✅',
                    value: `${enrolledFormations.reduce((acc, f) => acc + f.completed_lessons, 0)}`,
                    label: lang === 'fr' ? 'Leçons complétées' : 'Lessons completed',
                    color: 'bg-emerald-50 border-emerald-100',
                    textColor: 'text-emerald-700',
                  },
                  {
                    icon: '🏆',
                    value: `${enrolledFormations.filter(f => f.progress_percent === 100).length}`,
                    label: lang === 'fr' ? 'Formation(s) terminée(s)' : 'Completed course(s)',
                    color: 'bg-amber-50 border-amber-100',
                    textColor: 'text-amber-700',
                  },
                ].map((stat, i) => (
                  <div key={i} className={`${stat.color} border rounded-2xl p-4 text-center`}>
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className={`text-3xl font-extrabold ${stat.textColor}`}>{stat.value}</div>
                    <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Enrolled formations */}
            {loadingFormations ? (
              <div className="space-y-4">
                {[1,2].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse flex gap-5">
                    <div className="w-32 h-24 bg-slate-200 rounded-xl flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded w-2/3 mb-3" />
                      <div className="h-3 bg-slate-200 rounded w-full mb-2" />
                      <div className="h-2 bg-slate-200 rounded w-full mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : enrolledFormations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-5">
                <div className="w-24 h-24 rounded-full bg-saim-50 flex items-center justify-center text-5xl">🎓</div>
                <h3 className="text-xl font-bold text-slate-700">
                  {lang === 'fr' ? 'Aucune formation en cours' : 'No course in progress'}
                </h3>
                <p className="text-slate-400 max-w-sm text-sm">
                  {lang === 'fr' ? 'Explorez le catalogue et inscrivez-vous à votre première formation gratuitement.' : 'Browse the catalog and enroll in your first course for free.'}
                </p>
                <button onClick={() => setActiveNav('catalog')} className="btn-primary">
                  🔍 {lang === 'fr' ? 'Explorer les formations' : 'Browse courses'} →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                  {lang === 'fr' ? 'Mes formations' : 'My courses'}
                </h2>
                {enrolledFormations.map(formation => {
                  const title = lang === 'en' ? formation.title_en : formation.title_fr
                  const desc  = lang === 'en' ? formation.description_en : formation.description_fr
                  const isPaid = formation.enrollment_status === 'paid'
                  const enrollDate = formation.enrolled_at ? new Date(formation.enrolled_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : null

                  return (
                    <div key={formation.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5">
                      <div className="flex gap-0 sm:gap-5 flex-col sm:flex-row">
                        {/* Image */}
                        {formation.image_url ? (
                          <img src={formation.image_url} alt={title} className="w-full sm:w-40 h-40 sm:h-auto object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-full sm:w-40 h-28 sm:h-auto bg-gradient-to-br from-saim-700 to-saim-900 flex items-center justify-center flex-shrink-0">
                            <span className="text-4xl">🤖</span>
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 p-5">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="font-extrabold text-slate-800 leading-snug">{title}</h3>
                            <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                              {isPaid ? '✓ Accès complet' : 'Module 1 gratuit'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mb-3 line-clamp-1">{desc}</p>

                          {/* Meta */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mb-4">
                            {enrollDate && <span>📅 Inscrit le {enrollDate}</span>}
                            <span>📚 {formation.module_count} modules · {formation.lesson_count} leçons</span>
                          </div>

                          {/* Progress bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-slate-500">{lang === 'fr' ? 'Progression' : 'Progress'}</span>
                              <span className="text-xs font-bold text-saim-600">{formation.progress_percent}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-saim-400 to-saim-600 rounded-full transition-all duration-700"
                                style={{ width: `${formation.progress_percent}%` }}
                              />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              {formation.completed_lessons}/{formation.lesson_count} {lang === 'fr' ? 'leçons complétées' : 'lessons completed'}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => switchFormation(formation.id)}
                              className="bg-saim-600 hover:bg-saim-700 text-white text-sm font-bold px-6 py-2 rounded-xl transition-colors"
                            >
                              {formation.progress_percent === 0
                                ? (lang === 'fr' ? '▶️ Commencer' : '▶️ Start')
                                : formation.progress_percent === 100
                                  ? (lang === 'fr' ? '🔁 Revoir' : '🔁 Review')
                                  : (lang === 'fr' ? '▶️ Continuer' : '▶️ Continue')}
                            </button>
                            {!isPaid && (
                              <button
                                onClick={() => setPaymentFormation(formation)}
                                className="text-sm font-semibold text-saim-600 hover:text-saim-800 border border-saim-200 hover:border-saim-400 px-4 py-2 rounded-xl transition-colors"
                              >
                                🔓 Accès complet — 25 500 FCFA
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                <div className="pt-4 text-center">
                  <button onClick={() => setActiveNav('catalog')} className="text-saim-600 hover:text-saim-800 text-sm font-semibold underline">
                    🔍 {lang === 'fr' ? 'Explorer d\'autres formations' : 'Browse more courses'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ─── EXPLORER LES FORMATIONS (catalogue) ────────────────────────────── */}
      {activeNav === 'catalog' && (() => {
        const THEME = {
          blue:   { iconBg: 'bg-blue-50',   iconText: 'text-blue-500',   outline: 'border-blue-500 text-blue-600 hover:bg-blue-50',   fill: 'bg-blue-600 hover:bg-blue-700',   tag: 'bg-blue-50 text-blue-700' },
          orange: { iconBg: 'bg-orange-50', iconText: 'text-orange-500', outline: 'border-orange-500 text-orange-600 hover:bg-orange-50', fill: 'bg-orange-500 hover:bg-orange-600', tag: 'bg-orange-50 text-orange-700' },
          purple: { iconBg: 'bg-purple-50', iconText: 'text-purple-500', outline: 'border-purple-500 text-purple-600 hover:bg-purple-50', fill: 'bg-purple-600 hover:bg-purple-700', tag: 'bg-purple-50 text-purple-700' },
          green:  { iconBg: 'bg-green-50',  iconText: 'text-green-500',  outline: 'border-green-500 text-green-600 hover:bg-green-50',  fill: 'bg-green-600 hover:bg-green-700',  tag: 'bg-green-50 text-green-700' },
        }

        // ── Formation detail page ──────────────────────────────────────────────
        if (detailFormation) {
          const f = formations.find(x => x.id === detailFormation.id) || detailFormation
          return (
            <>
              {waitlistMsg && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2">
                  ✓ {waitlistMsg}
                </div>
              )}
              <FormationDetailPage
                formation={f}
                lang={lang}
                onBack={() => setDetailFormation(null)}
                onEnroll={() => { enrollAndStart(f); setDetailFormation(null) }}
                onContinue={() => { switchFormation(f.id); setDetailFormation(null) }}
                onPay={() => { setPaymentFormation(f); setDetailFormation(null) }}
                onWaitlist={() => joinWaitlist(f.id)}
                isOnWaitlist={waitlistSet.has(f.id)}
              />
            </>
          )
        }

        return (
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {/* Hero banner */}
          <div className="relative bg-slate-900 overflow-hidden">
            <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-0">
              {/* Left: text */}
              <div className="flex-1 z-10 text-center lg:text-left">
                <p className="text-saim-400 text-xs font-bold uppercase tracking-widest mb-3">
                  {lang === 'fr' ? 'Plateforme de formation IA' : 'AI Training Platform'}
                </p>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
                  {lang === 'fr'
                    ? <>Apprenez l&apos;IA avec<br className="hidden sm:block" /> les meilleurs experts</>
                    : <>Learn AI with<br className="hidden sm:block" /> the best experts</>}
                </h1>
                <p className="text-slate-400 text-base mb-6 max-w-md mx-auto lg:mx-0">
                  {lang === 'fr'
                    ? 'Des formations pratiques pour maîtriser l\'intelligence artificielle et booster votre carrière.'
                    : 'Practical courses to master artificial intelligence and accelerate your career.'}
                </p>
                <button
                  onClick={() => document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 bg-saim-500 hover:bg-saim-600 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
                >
                  {lang === 'fr' ? 'Voir les formations' : 'Browse courses'} →
                </button>
              </div>
              {/* Right: image */}
              <div className="relative flex-shrink-0 w-full max-w-xs lg:max-w-sm lg:ml-12">
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-slate-900 z-10 lg:hidden" />
                <img
                  src="/uploads/apropos/image_videoai.png"
                  alt="Formation IA"
                  className="w-full rounded-2xl shadow-2xl object-cover"
                />
              </div>
            </div>
            {/* Stats row */}
            <div className="border-t border-slate-800">
              <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap justify-center lg:justify-start gap-8 text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-extrabold text-white">300+</span>
                  <span className="text-slate-400">{lang === 'fr' ? 'apprenants actifs' : 'active learners'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-extrabold text-white">4</span>
                  <span className="text-slate-400">{lang === 'fr' ? 'formations disponibles' : 'courses available'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-extrabold text-white">100%</span>
                  <span className="text-slate-400">{lang === 'fr' ? 'en ligne, à votre rythme' : 'online, at your pace'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Formations grid */}
          <div id="catalog-grid" className="max-w-6xl mx-auto px-6 py-8">
            {loadingFormations ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse space-y-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-2xl" />
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-9 bg-slate-200 rounded-xl" />
                    <div className="h-9 bg-slate-200 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {formations.map(formation => {
                  const color  = formation.color || 'blue'
                  const theme  = THEME[color] || THEME.blue
                  const title  = lang === 'en' ? formation.title_en : formation.title_fr
                  const status = formation.enrollment_status
                  const isComingSoon = (formation.module_count || 0) === 0
                  let audience = []
                  try { audience = JSON.parse(formation.target_audience || '[]') } catch {}

                  return (
                    <CatalogCard
                      key={formation.id}
                      formation={formation}
                      title={title}
                      status={status}
                      isComingSoon={isComingSoon}
                      audience={audience}
                      theme={theme}
                      lang={lang}
                      onDetail={() => setDetailFormation(formation)}
                      onEnroll={() => enrollAndStart(formation)}
                      onContinue={() => switchFormation(formation.id)}
                      onPay={() => setPaymentFormation(formation)}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </main>
        )
      })()}

      {/* ─── LECTEUR DE FORMATION (sidebar + contenu) ───────────────────────── */}
      {activeNav === 'reader' && (
        <div className="flex flex-1 overflow-hidden">
          {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />}

          <aside className={`
            fixed md:relative inset-y-0 left-0 z-50 md:z-0
            w-72 lg:w-80 flex-shrink-0 bg-white border-r border-slate-200 overflow-y-auto
            transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            {activeFormation && (
              <div className="px-4 py-3 border-b border-slate-100 bg-saim-50">
                <p className="text-xs font-bold text-saim-600 uppercase tracking-wider mb-0.5">Formation</p>
                <p className="text-sm font-bold text-saim-800 leading-snug">{lang === 'en' ? activeFormation.title_en : activeFormation.title_fr}</p>
                <button onClick={() => setActiveNav('learning')} className="text-xs text-saim-500 hover:text-saim-700 mt-1 underline">
                  ← {lang === 'fr' ? 'Mon Apprentissage' : 'My Learning'}
                </button>
              </div>
            )}

            {loadingModules ? (
              <div className="p-4 space-y-5 animate-pulse">
                {[1, 2].map(i => (
                  <div key={i} className="border-b border-slate-100 pb-4">
                    <div className="h-2.5 bg-slate-200 rounded w-1/4 mb-2" />
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
                    {[1, 2, 3].map(j => (
                      <div key={j} className="flex items-center gap-3 px-2 py-2.5">
                        <div className="w-5 h-5 rounded-full bg-slate-200 flex-shrink-0" />
                        <div className="h-3.5 bg-slate-200 rounded flex-1" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <nav className="divide-y divide-slate-100">
                {modules.map((module) => {
                  const modTitle     = lang === 'en' ? module.title_en : module.title_fr
                  const isLocked     = module.locked
                  const needsPayment = module.needs_payment
                  const allDone      = !isLocked && module.lessons.length > 0 && module.lessons.every(l => l.completed)
                  const quizUnlocked = allDone
                  const exerciseUnlocked = module.quiz?.passed
                  const questionUnlocked = module.exercise?.submitted
                  const isQuizActive = activeView === 'quiz' && quizModuleId === module.id
                  const isExActive   = activeView === 'exercise' && exerciseModuleId === module.id
                  const isQActive    = activeView === 'question' && questionModuleId === module.id

                  return (
                    <div key={module.id}>
                      <div
                        className={`px-4 py-3 flex items-center gap-2 ${needsPayment ? 'cursor-pointer hover:bg-amber-50/50' : isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50 transition-colors'}`}
                        onClick={() => {
                          if (needsPayment) setPaymentFormation(formations.find(f => f.id === activeFormationId) || null)
                          else if (isLocked) openLocked(module)
                          else setCollapsedModules(s => { const n = new Set(s); n.has(module.id) ? n.delete(module.id) : n.add(module.id); return n })
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-saim-600 uppercase tracking-wider">Module {module.order_index + 1}</p>
                          <p className="text-sm font-bold text-slate-800 mt-0.5 leading-snug">{modTitle}</p>
                          {isLocked && !needsPayment && <p className="text-xs text-slate-400 mt-0.5">Bientôt disponible</p>}
                          {needsPayment && <p className="text-xs text-amber-600 font-semibold mt-0.5">🔒 25 500 FCFA</p>}
                          {!isLocked && <p className="text-xs text-slate-400 mt-0.5">{module.lessons.filter(l => l.completed).length}/{module.lessons.length} leçons</p>}
                        </div>
                        {needsPayment && <span className="text-amber-500 text-sm flex-shrink-0">🔒</span>}
                        {!isLocked && (
                          <svg className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${collapsedModules.has(module.id) ? '-rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </div>

                      {!isLocked && !collapsedModules.has(module.id) && (
                        <ul className="pb-2">
                          {module.lessons.map(lesson => {
                            const lessonTitle = lang === 'en' ? lesson.title_en : lesson.title_fr
                            const isActive    = activeView === 'lesson' && activeLesson?.id === lesson.id
                            return (
                              <li key={lesson.id}>
                                <button onClick={() => selectLesson(lesson)}
                                  className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${isActive ? 'bg-saim-50 border-r-2 border-saim-500' : 'hover:bg-slate-50'}`}>
                                  {lesson.completed ? <CheckIcon /> : isActive ? <ActiveDot /> : <EmptyDot />}
                                  <div className="min-w-0">
                                    <p className={`text-sm leading-snug ${isActive ? 'font-semibold text-saim-700' : 'text-slate-700'} ${lesson.completed ? 'text-slate-500' : ''}`}>{lessonTitle}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Leçon</p>
                                  </div>
                                </button>
                              </li>
                            )
                          })}

                          {module.quiz ? (
                            <li>
                              <button disabled={!quizUnlocked} onClick={() => quizUnlocked && openQuiz(module.id)}
                                className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${!quizUnlocked ? 'opacity-40 cursor-not-allowed' : isQuizActive ? 'bg-amber-50 border-r-2 border-amber-400' : 'hover:bg-amber-50/50'}`}>
                                {module.quiz.passed ? <CheckIcon /> : quizUnlocked ? <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-sm">📝</span> : <LockDot />}
                                <div className="min-w-0">
                                  <p className={`text-sm leading-snug ${isQuizActive ? 'font-semibold text-amber-700' : 'text-slate-700'}`}>
                                    Quiz du module{module.quiz.passed && <span className="ml-1 text-xs text-emerald-600 font-bold">{module.quiz.best_score}/{module.quiz.total}</span>}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-0.5">Quiz</p>
                                </div>
                              </button>
                            </li>
                          ) : (
                            <li className="px-4 py-2.5 flex items-center gap-3 opacity-30"><LockDot /><p className="text-xs text-slate-400 italic">Quiz à venir</p></li>
                          )}

                          {module.exercise && (
                            <li>
                              <button disabled={!exerciseUnlocked} onClick={() => exerciseUnlocked && openExercise(module.id)}
                                className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${!exerciseUnlocked ? 'opacity-40 cursor-not-allowed' : isExActive ? 'bg-violet-50 border-r-2 border-violet-400' : 'hover:bg-violet-50/50'}`}>
                                {module.exercise.submitted ? <CheckIcon /> : exerciseUnlocked ? <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-sm">📋</span> : <LockDot />}
                                <div className="min-w-0">
                                  <p className={`text-sm leading-snug ${isExActive ? 'font-semibold text-violet-700' : 'text-slate-700'}`}>Exercice du module</p>
                                  <p className="text-xs text-slate-400 mt-0.5">Exercice</p>
                                </div>
                              </button>
                            </li>
                          )}

                          <li>
                            <button disabled={!questionUnlocked} onClick={() => questionUnlocked && openQuestion(module.id)}
                              className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${!questionUnlocked ? 'opacity-40 cursor-not-allowed' : isQActive ? 'bg-saim-50 border-r-2 border-saim-400' : 'hover:bg-saim-50/50'}`}>
                              <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm ${questionUnlocked ? 'bg-saim-100' : 'bg-slate-100'}`}>
                                {questionUnlocked ? '💬' : '🔒'}
                              </span>
                              <div className="min-w-0">
                                <p className={`text-sm leading-snug ${isQActive ? 'font-semibold text-saim-700' : 'text-slate-700'}`}>Poser une question</p>
                                <p className="text-xs text-slate-400 mt-0.5">Q&amp;A</p>
                              </div>
                            </button>
                          </li>
                        </ul>
                      )}
                    </div>
                  )
                })}
              </nav>
            )}
          </aside>

          <main className="flex-1 overflow-y-auto bg-white">
            <div className="max-w-4xl mx-auto px-6 lg:px-10 py-8 pb-24">

              {activeView === 'quiz' && quizModuleId && (() => {
                const mod = modules.find(m => m.id === quizModuleId)
                const exerciseUnlocked = mod?.quiz?.passed
                return (
                  <QuizView
                    moduleId={quizModuleId}
                    onClose={() => { setActiveView(null); setQuizModuleId(null) }}
                    onPassed={() => { loadModules() }}
                    afterPassedBtn={exerciseUnlocked && mod?.exercise
                      ? <button onClick={() => openExercise(quizModuleId)} className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-3 rounded-full shadow-lg transition-all hover:-translate-y-0.5 active:scale-95">📋 Faire l'exercice →</button>
                      : null}
                  />
                )
              })()}

              {activeView === 'locked' && lockedMod && !lockedMod.needs_payment && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-5">
                  <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-5xl">🔒</div>
                  <h3 className="text-2xl font-extrabold text-slate-700">{lang === 'en' ? lockedMod.title_en : lockedMod.title_fr}</h3>
                  <div className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{lang === 'fr' ? 'Bientôt disponible' : 'Coming soon'}</div>
                  <p className="text-slate-500 max-w-sm">{t('module_locked_desc')}</p>
                </div>
              )}

              {activeView === 'locked' && lockedMod && lockedMod.needs_payment && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-5">
                  <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center text-5xl">🔒</div>
                  <h3 className="text-2xl font-extrabold text-slate-700">{lang === 'en' ? lockedMod.title_en : lockedMod.title_fr}</h3>
                  <p className="text-slate-500 max-w-sm">{lang === 'fr' ? 'Ce module nécessite un accès complet.' : 'This module requires full access.'}</p>
                  <button onClick={() => setPaymentFormation(formations.find(f => f.id === activeFormationId) || null)}
                    className="bg-saim-600 hover:bg-saim-700 text-white font-bold px-8 py-3 rounded-full shadow-lg transition-all hover:-translate-y-0.5">
                    Accès complet — 25 500 FCFA
                  </button>
                </div>
              )}

              {activeView === 'lesson' && loadingLesson && (
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="w-10 h-10 border-4 border-saim-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {activeView === 'lesson' && lessonData && !loadingLesson && (
                <LessonViewer lesson={lessonData} lang={lang} t={t} onComplete={completeLesson} nextStepBtn={buildNextStepBtn()} />
              )}

              {activeView === 'exercise' && exerciseModuleId && (() => {
                const mod = modules.find(m => m.id === exerciseModuleId)
                return <ExerciseView moduleId={exerciseModuleId} lang={lang} onGoToQuestion={mod?.exercise?.submitted ? () => openQuestion(exerciseModuleId) : undefined} />
              })()}

              {activeView === 'question' && questionModuleId && (() => {
                const nextMod = getNextModule(questionModuleId)
                return <QuestionView moduleId={questionModuleId} lang={lang} onGoToNextModule={nextMod && !nextMod.locked ? () => goToNextModule(questionModuleId) : undefined} />
              })()}

              {!activeView && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-saim-50 flex items-center justify-center text-4xl">📚</div>
                  <h3 className="text-2xl font-bold text-saim-800">
                    {lang === 'en' ? activeFormation?.title_en : activeFormation?.title_fr}
                  </h3>
                  <p className="text-slate-500 max-w-sm">
                    {lang === 'fr' ? 'Sélectionnez une leçon dans le menu de gauche pour commencer.' : 'Select a lesson from the left menu to start.'}
                  </p>
                  {modules[0]?.lessons?.[0] && (
                    <button onClick={() => selectLesson(modules[0].lessons[0])} className="btn-primary mt-2">
                      {lang === 'fr' ? '▶️ Commencer le Module 1' : '▶️ Start Module 1'} →
                    </button>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      )}

      {/* ─── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="w-full bg-saim-800 text-white py-3 px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs flex-shrink-0">
        <div className="flex items-center gap-2">
          <img src="/uploads/apropos/saim_ai_logo_fond.png" alt="SAIM" className="h-5 brightness-200" />
          <span className="text-slate-400">© 2026 SAIM</span>
        </div>
        <div className="flex gap-4 text-slate-400">
          <button onClick={onGoLanding} className="hover:text-white transition-colors">{t('nav_about')}</button>
          <span>contact@saim.cm</span>
          <span>(+237) 677 1 88 62</span>
        </div>
      </footer>

      {/* ─── ONBOARDING ─────────────────────────────────────────────────────── */}
      {showOnboarding && (
        <OnboardingGuide onDone={() => {
          localStorage.setItem('saim_onboarding_done', 'true')
          sessionStorage.setItem('saim_welcomed', '1')
          setShowOnboarding(false)
        }} />
      )}

      {/* ─── CONGRATS POPUP ─────────────────────────────────────────────────── */}
      {showCongrats && (
        <CongratsPopup
          t={t}
          onClose={() => setShowCongrats(false)}
          onNext={!isCongratsLastLesson ? afterCongrats : null}
          onQuiz={isCongratsLastLesson && congratsMod?.quiz ? () => { setShowCongrats(false); openQuiz(congratsMod.id) } : null}
        />
      )}

      {/* ─── PAYMENT MODAL ──────────────────────────────────────────────────── */}
      {paymentFormation && (
        <PaymentModal
          formation={paymentFormation}
          onClose={() => setPaymentFormation(null)}
          onSuccess={async () => {
            await loadFormations()
            await loadModules()
          }}
        />
      )}

      {/* ─── PROFILE MODAL ──────────────────────────────────────────────────── */}
      {showProfile && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowProfile(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-extrabold text-slate-800">Mon profil</h2>
              <button onClick={() => setShowProfile(false)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-saim-500 text-white flex items-center justify-center text-2xl font-extrabold flex-shrink-0">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800">{user?.first_name} {user?.last_name}</h3>
                  <p className="text-sm text-slate-500">{user?.post || 'Apprenant'}</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Email',     value: user?.email,           icon: '✉️' },
                  { label: 'Téléphone', value: user?.phone,           icon: '📞' },
                  { label: 'Poste',     value: user?.post,            icon: '💼' },
                  { label: 'Secteur',   value: user?.activity_sector, icon: '🏢' },
                  { label: 'Niveau IA', value: user?.ai_level ? `Niveau ${user.ai_level} / 5` : null, icon: '🤖' },
                ].filter(f => f.value).map(f => (
                  <div key={f.label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <span className="text-lg flex-shrink-0">{f.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400 font-medium">{f.label}</p>
                      <p className="text-sm font-semibold text-slate-700 truncate">{f.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowProfile(false)} className="mt-6 w-full btn-secondary text-sm">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
