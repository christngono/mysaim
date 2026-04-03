import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { useT } from '../i18n/translations'
import LangToggle from '../components/LangToggle'
import QuizView from '../components/QuizView'
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
  if (section.type === 'image') {
    return (
      <img src={section.src} alt={section.alt || ''} className="w-full rounded-xl shadow-md border border-slate-100 my-4" />
    )
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
        <img
          src={section.src}
          alt={section.caption || ''}
          className="w-full rounded-xl shadow-md border border-slate-100 object-contain"
        />
        {section.caption && (
          <figcaption className="text-xs text-slate-400 text-center mt-2">{section.caption}</figcaption>
        )}
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
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )
          : section.src && (
            <video controls src={section.src} className="w-full rounded-xl shadow-md border border-slate-100 bg-black" />
          )
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
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-saim-600 hover:text-saim-800 font-medium text-sm hover:underline transition-colors"
              >
                <span>🔗</span>
                <span>{link.label || link.url}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  if (section.type === 'example') {
    const headerCls = section.color === 'purple'
      ? 'bg-gradient-to-r from-violet-700 to-purple-600'
      : 'bg-gradient-to-r from-saim-700 to-saim-500'
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
  return null
}

// ─── Lesson content viewer ────────────────────────────────────────────────────
function LessonViewer({ lesson, lang, t, onComplete }) {
  if (!lesson) return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 py-20">
      <span className="text-5xl">📖</span>
      <p className="font-medium">Sélectionnez une leçon pour commencer</p>
    </div>
  )

  const raw     = lang === 'en' ? lesson.content_en : lesson.content_fr
  const title   = lang === 'en' ? lesson.title_en : lesson.title_fr

  // Support both content formats:
  //   array  → blocks created via admin editor
  //   object → seeded lessons with {intro, sections, keywords}
  const isArray = Array.isArray(raw)
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
          <p className="text-slate-400 text-sm mb-4">{t('dash_finish_btn').replace('J\'ai', 'Vous avez')} cette leçon ?</p>
          <button onClick={onComplete} className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-emerald-200 transition-all hover:-translate-y-0.5 active:scale-95">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {t('dash_finish_btn')}
          </button>
        </div>
      )}
      {lesson.completed && (
        <div className="mt-8 flex items-center justify-center gap-2 text-emerald-600 font-semibold">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {t('dash_completed')}
        </div>
      )}
    </div>
  )
}

// ─── Congratulations popup ────────────────────────────────────────────────────
function CongratsPopup({ t, onClose, onNext }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-pop-in relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-emerald-400 to-saim-500" />
        <div className="text-5xl mb-4 animate-bounce-slow">🏆</div>
        <h3 className="text-xl font-extrabold text-saim-800 mb-2">{t('dash_congrats')}</h3>
        <p className="text-slate-500 text-sm mb-6">{t('dash_congrats_p')}</p>
        <div className="flex gap-3 justify-center">
          {onNext && (
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

// ─── ExerciseView ─────────────────────────────────────────────────────────────
function ExerciseView({ moduleId, lang }) {
  const [data, setData] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!moduleId) return
    setData(null)
    setError('')
    setAnswers({})
    setSubmitted(false)
    api.get(`/exercises/module/${moduleId}`)
      .then(r => {
        setData(r.data)
        if (r.data.submission) setSubmitted(true)
      })
      .catch(() => setError('Aucun exercice disponible pour ce module.'))
  }, [moduleId])

  const handleSubmit = async () => {
    if (!data) return
    const unanswered = data.questions.filter(q => !answers[q.id]?.trim())
    if (unanswered.length > 0) {
      setError('Veuillez répondre à toutes les questions avant de soumettre.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await api.post(`/exercises/${data.id}/submit`, { answers })
      const r = await api.get(`/exercises/module/${moduleId}`)
      setData(r.data)
      setSubmitted(true)
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors de la soumission.')
    } finally {
      setSubmitting(false)
    }
  }

  if (error && !data) return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-4">
      <div className="text-5xl">📋</div>
      <p className="text-slate-400">{error}</p>
    </div>
  )

  if (!data) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="text-slate-400 text-sm">Chargement...</div>
    </div>
  )

  const title = lang === 'en' ? data.title_en : data.title_fr
  const instructions = lang === 'en' ? data.instructions_en : data.instructions_fr

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">Exercice</div>
        <h2 className="text-2xl font-extrabold text-saim-800 mb-2">{title}</h2>
        {instructions && (
          <p className="text-slate-600 leading-relaxed bg-saim-50 border border-saim-100 rounded-xl p-4">{instructions}</p>
        )}
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
            const ans = typeof data.submission.answers === 'object'
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
                  className="input-field resize-none w-full"
                  rows={4}
                  placeholder="Votre réponse..."
                  value={answers[q.id] || ''}
                  onChange={e => setAnswers(prev => ({ ...prev, [q.id]: clean(e.target.value) }))}
                />
              </div>
            )
          })}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="text-right">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Envoi...' : 'Soumettre l\'exercice'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── QuestionView ─────────────────────────────────────────────────────────────
function QuestionView({ moduleId, lang }) {
  const [questions, setQuestions] = useState([])
  const [newQuestion, setNewQuestion] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const r = await api.get('/questions/my')
      setQuestions(r.data.filter(q => String(q.module_id) === String(moduleId)))
    } catch {}
  }, [moduleId])

  useEffect(() => { load() }, [load])

  const sendQuestion = async () => {
    if (!newQuestion.trim()) return
    setSending(true)
    setError('')
    try {
      await api.post('/questions', { module_id: moduleId, question: newQuestion.trim() })
      setNewQuestion('')
      load()
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors de l\'envoi.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="inline-block bg-saim-100 text-saim-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">Q&amp;A</div>
        <h2 className="text-2xl font-extrabold text-saim-800 mb-2">Questions au formateur</h2>
        <p className="text-slate-500 text-sm">Posez vos questions sur ce module. Le formateur vous répondra dès que possible.</p>
      </div>

      {/* New question form */}
      <div className="card p-5 mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Nouvelle question</label>
        <textarea
          className="input-field resize-none w-full mb-3"
          rows={3}
          placeholder="Posez votre question ici..."
          value={newQuestion}
          onChange={e => setNewQuestion(clean(e.target.value))}
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex justify-end">
          <button
            onClick={sendQuestion}
            disabled={sending || !newQuestion.trim()}
            className="btn-primary text-sm"
          >
            {sending ? 'Envoi...' : 'Envoyer la question'}
          </button>
        </div>
      </div>

      {/* Past questions */}
      <div className="space-y-4">
        {questions.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm">Aucune question posée pour ce module.</p>
          </div>
        )}
        {questions.map(q => (
          <div key={q.id} className="card p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
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
                {q.answered_at && (
                  <p className="text-xs text-slate-400 mt-2">{new Date(q.answered_at).toLocaleString('fr-FR')}</p>
                )}
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
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const dropdownRef = useRef(null)

  const fetchCount = useCallback(async () => {
    try {
      const r = await api.get('/notifications/count')
      setCount(r.data.count)
    } catch {}
  }, [])

  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [fetchCount])

  const openDropdown = async () => {
    if (!open) {
      try {
        const r = await api.get('/notifications')
        setNotifications(r.data)
      } catch {}
    }
    setOpen(o => !o)
  }

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })))
      setCount(0)
    } catch {}
  }

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n))
      setCount(prev => Math.max(0, prev - 1))
    } catch {}
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={openDropdown}
        className="relative p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition-colors"
        title="Notifications"
      >
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
              <button onClick={markAllRead} className="text-xs text-saim-600 hover:text-saim-800 font-semibold">
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">Aucune notification.</div>
            ) : notifications.map(n => {
              let parsedData = {}
              try { parsedData = JSON.parse(n.data) } catch {}
              return (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.is_read ? 'bg-saim-50/50' : ''}`}
                  onClick={() => !n.is_read && markRead(n.id)}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base flex-shrink-0 mt-0.5">
                      {n.type === 'certificate' ? '🏆' : n.type === 'exercise_graded' ? '📋' : '💬'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                      {n.type === 'certificate' && parsedData.file_url && (
                        <a
                          href={parsedData.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-1.5 text-xs text-saim-600 hover:text-saim-800 font-semibold hover:underline"
                          onClick={e => e.stopPropagation()}
                        >
                          Télécharger le certificat →
                        </a>
                      )}
                      <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleString('fr-FR')}</p>
                    </div>
                    {!n.is_read && (
                      <span className="w-2 h-2 bg-saim-500 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function UserDashboard({ onGoLanding }) {
  const { user, logout } = useAuth()
  const { lang } = useLang()
  const t = useT(lang)

  const [modules,        setModules]       = useState([])
  const [progress,       setProgress]      = useState({ total: 0, completed: 0, percent: 0 })
  const [activeLesson,   setActiveLesson]  = useState(null)
  const [lessonData,     setLessonData]    = useState(null)
  const [showCongrats,   setShowCongrats]  = useState(false)
  const [expandedMod,    setExpandedMod]   = useState({})
  // 'lesson' | 'quiz' | 'locked' | 'exercise' | 'question' | null
  const [activeView,     setActiveView]    = useState(null)
  const [quizModuleId,   setQuizModuleId]  = useState(null)
  const [lockedMod,      setLockedMod]     = useState(null)
  const [exerciseModuleId, setExerciseModuleId] = useState(null)
  const [questionModuleId, setQuestionModuleId] = useState(null)
  const [sidebarOpen,    setSidebarOpen]   = useState(false)

  const loadModules = useCallback(async () => {
    try {
      const [mods, prog] = await Promise.all([
        api.get('/courses/modules'),
        api.get('/courses/progress'),
      ])
      setModules(mods.data)
      setProgress(prog.data)
      // Auto-expand first module
      if (mods.data.length > 0) {
        setExpandedMod({ [mods.data[0].id]: true })
      }
    } catch {}
  }, [])

  useEffect(() => {
    loadModules()
    const interval = setInterval(loadModules, 30000) // auto-refresh every 30s
    return () => clearInterval(interval)
  }, [loadModules])

  const selectLesson = async (lesson) => {
    setActiveLesson(lesson)
    setActiveView('lesson')
    setQuizModuleId(null)
    setLockedMod(null)
    setExerciseModuleId(null)
    setQuestionModuleId(null)
    setSidebarOpen(false)
    try {
      const res = await api.get(`/courses/lessons/${lesson.id}`)
      setLessonData(res.data)
    } catch {}
  }

  const openQuiz = (moduleId) => {
    setActiveView('quiz')
    setQuizModuleId(moduleId)
    setActiveLesson(null)
    setLessonData(null)
    setLockedMod(null)
    setExerciseModuleId(null)
    setQuestionModuleId(null)
    setSidebarOpen(false)
  }

  const openLocked = (module) => {
    setActiveView('locked')
    setLockedMod(module)
    setActiveLesson(null)
    setLessonData(null)
    setQuizModuleId(null)
    setExerciseModuleId(null)
    setQuestionModuleId(null)
    setSidebarOpen(false)
  }

  const openExercise = (moduleId) => {
    setActiveView('exercise')
    setExerciseModuleId(moduleId)
    setActiveLesson(null)
    setLessonData(null)
    setQuizModuleId(null)
    setLockedMod(null)
    setQuestionModuleId(null)
    setSidebarOpen(false)
  }

  const openQuestion = (moduleId) => {
    setActiveView('question')
    setQuestionModuleId(moduleId)
    setActiveLesson(null)
    setLessonData(null)
    setQuizModuleId(null)
    setLockedMod(null)
    setExerciseModuleId(null)
    setSidebarOpen(false)
  }

  const completeLesson = async () => {
    if (!activeLesson) return
    await api.post(`/courses/lessons/${activeLesson.id}/complete`)
    setLessonData(prev => prev ? { ...prev, completed: true } : null)
    setShowCongrats(true)
    loadModules()
  }

  const goToNext = () => {
    setShowCongrats(false)
    // Find next lesson
    const allLessons = modules.flatMap(m => m.lessons)
    const idx = allLessons.findIndex(l => l.id === activeLesson?.id)
    if (idx >= 0 && idx < allLessons.length - 1) {
      selectLesson(allLessons[idx + 1])
    }
  }

  const hasNext = () => {
    const allLessons = modules.flatMap(m => m.lessons)
    const idx = allLessons.findIndex(l => l.id === activeLesson?.id)
    return idx >= 0 && idx < allLessons.length - 1
  }

  const currentTitle = activeView === 'quiz'
    ? t('quiz_title')
    : activeView === 'locked'
      ? (lang === 'en' ? lockedMod?.title_en : lockedMod?.title_fr) || t('module_locked_title')
      : activeView === 'exercise'
        ? (lang === 'fr' ? 'Exercice du module' : 'Module exercise')
        : activeView === 'question'
          ? (lang === 'fr' ? 'Questions au formateur' : 'Ask a question')
          : lessonData
            ? (lang === 'en' ? lessonData.title_en : lessonData.title_fr)
            : t('dash_lesson')

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      {/* ─── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <div className="flex items-center h-14 px-4 gap-3">
          {/* Mobile sidebar toggle */}
          <button
            className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Menu de progression"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <button onClick={onGoLanding} className="flex-shrink-0">
            <img src="/images/saimlogo.png" alt="SAIM" className="h-9" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-slate-400 font-medium">{t('dash_lesson')}</div>
            <div className="text-sm font-bold text-saim-800 truncate">{currentTitle}</div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <LangToggle />
            {/* Notification bell */}
            <NotificationBell />
            {/* Profile */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-saim-500 text-white flex items-center justify-center text-xs font-bold">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div className="hidden sm:block text-xs">
                <div className="font-semibold text-slate-700">{user?.first_name} {user?.last_name}</div>
                <div className="text-slate-400">{user?.post || user?.email}</div>
              </div>
            </div>
            <button
              onClick={() => { logout(); onGoLanding() }}
              title={t('nav_logout')}
              className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-saim-400 to-saim-600 rounded-full transition-all duration-700"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-saim-600 flex-shrink-0">
              {progress.percent}% ({progress.completed}/{progress.total})
            </span>
          </div>
        </div>
      </header>

      {/* ─── BODY ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── SIDEBAR (30%) ──────────────────────────────────────────────────── */}
        <aside className={`
          fixed md:relative inset-y-0 left-0 z-50
          w-72 lg:w-80 flex-shrink-0 bg-white border-r border-slate-100 overflow-y-auto
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:block
        `}>
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-700 text-sm">{t('dash_progress')}</h3>
          </div>
          <nav className="p-2">
            {modules.map(module => {
              const modTitle  = lang === 'en' ? module.title_en : module.title_fr
              const isExpanded = expandedMod[module.id]
              const modDone   = module.lessons.filter(l => l.completed).length
              const isLocked  = module.locked
              const isQuizActive = activeView === 'quiz' && quizModuleId === module.id
              const isLockedActive = activeView === 'locked' && lockedMod?.id === module.id

              return (
                <div key={module.id} className="mb-1">
                  {/* Module header */}
                  <button
                    onClick={() => isLocked ? openLocked(module) : setExpandedMod(prev => ({ ...prev, [module.id]: !prev[module.id] }))}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors text-left ${isLockedActive ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                  >
                    <div className={`w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 ${isLocked ? 'bg-slate-300' : 'bg-saim-500'}`}>
                      {isLocked ? '🔒' : module.order_index}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-bold truncate ${isLocked ? 'text-slate-400' : 'text-slate-700'}`}>{modTitle}</div>
                      {!isLocked && (
                        <div className="text-xs text-slate-400">{modDone}/{module.lessons.length} {lang === 'fr' ? 'leçons' : 'lessons'}</div>
                      )}
                      {isLocked && (
                        <div className="text-xs text-slate-400">{lang === 'fr' ? 'Bientôt disponible' : 'Coming soon'}</div>
                      )}
                    </div>
                    {!isLocked && (
                      <svg className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    )}
                  </button>

                  {/* Lessons + Quiz (unlocked modules only) */}
                  {!isLocked && isExpanded && (
                    <ul className="ml-4 mt-1 space-y-0.5">
                      {module.lessons.map(lesson => {
                        const lessonTitle = lang === 'en' ? lesson.title_en : lesson.title_fr
                        const isActive = activeView === 'lesson' && activeLesson?.id === lesson.id
                        return (
                          <li key={lesson.id}>
                            <button
                              onClick={() => selectLesson(lesson)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-colors ${isActive ? 'bg-saim-50 text-saim-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                              {lesson.completed ? (
                                <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              ) : isActive ? (
                                <span className="w-4 h-4 rounded-full border-2 border-saim-400 flex-shrink-0" />
                              ) : (
                                <span className="w-4 h-4 rounded-full border-2 border-slate-200 flex-shrink-0" />
                              )}
                              <span className="truncate">{lessonTitle}</span>
                            </button>
                          </li>
                        )
                      })}

                      {/* Quiz entry */}
                      {module.quiz ? (
                        <li>
                          <button
                            onClick={() => openQuiz(module.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-colors ${isQuizActive ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-slate-600 hover:bg-amber-50/60 hover:text-amber-700'}`}
                          >
                            {module.quiz.passed ? (
                              <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            ) : (
                              <span className="text-base flex-shrink-0 leading-none">📝</span>
                            )}
                            <span className="truncate">
                              {lang === 'fr' ? 'Quiz du module' : 'Module quiz'}
                              {module.quiz.passed && ` — ${module.quiz.best_score}/${module.quiz.total}`}
                            </span>
                          </button>
                        </li>
                      ) : (
                        <li>
                          <div className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 italic">
                            <span className="text-base flex-shrink-0 leading-none">📝</span>
                            <span>{lang === 'fr' ? 'Quiz à venir' : 'Quiz coming soon'}</span>
                          </div>
                        </li>
                      )}

                      {/* Exercise entry */}
                      {module.exercise ? (
                        <li>
                          <button
                            onClick={() => openExercise(module.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-colors ${activeView === 'exercise' && exerciseModuleId === module.id ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-slate-600 hover:bg-violet-50/60 hover:text-violet-700'}`}
                          >
                            {module.exercise.submitted ? (
                              <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            ) : (
                              <span className="text-base flex-shrink-0 leading-none">📋</span>
                            )}
                            <span className="truncate">
                              {lang === 'fr' ? 'Exercice du module' : 'Module exercise'}
                            </span>
                          </button>
                        </li>
                      ) : null}

                      {/* Q&A entry */}
                      <li>
                        <button
                          onClick={() => openQuestion(module.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-colors ${activeView === 'question' && questionModuleId === module.id ? 'bg-saim-50 text-saim-700 font-semibold' : 'text-slate-600 hover:bg-saim-50/60 hover:text-saim-700'}`}
                        >
                          <span className="text-base flex-shrink-0 leading-none">💬</span>
                          <span className="truncate">
                            {lang === 'fr' ? 'Poser une question' : 'Ask a question'}
                          </span>
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              )
            })}
          </nav>
        </aside>

        {/* ── MAIN CONTENT (70%) ─────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-10 pb-20">

            {/* Quiz view */}
            {activeView === 'quiz' && quizModuleId && (
              <QuizView
                moduleId={quizModuleId}
                onClose={() => { setActiveView(null); setQuizModuleId(null) }}
                onPassed={loadModules}
              />
            )}

            {/* Locked module */}
            {activeView === 'locked' && lockedMod && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-5">
                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-5xl">🔒</div>
                <h3 className="text-2xl font-extrabold text-slate-700">
                  {lang === 'en' ? lockedMod.title_en : lockedMod.title_fr}
                </h3>
                <div className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {lang === 'fr' ? 'Bientôt disponible' : 'Coming soon'}
                </div>
                <p className="text-slate-500 max-w-sm">{t('module_locked_desc')}</p>
              </div>
            )}

            {/* Lesson view */}
            {activeView === 'lesson' && lessonData && (
              <LessonViewer lesson={lessonData} lang={lang} t={t} onComplete={completeLesson} />
            )}

            {/* Exercise view */}
            {activeView === 'exercise' && exerciseModuleId && (
              <ExerciseView moduleId={exerciseModuleId} lang={lang} />
            )}

            {/* Question view */}
            {activeView === 'question' && questionModuleId && (
              <QuestionView moduleId={questionModuleId} lang={lang} />
            )}

            {/* Welcome screen */}
            {!activeView && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
                <div className="w-20 h-20 rounded-full bg-saim-50 flex items-center justify-center text-4xl">📚</div>
                <h3 className="text-xl font-bold text-saim-800">{t('dash_welcome')}, {user?.first_name} !</h3>
                <p className="text-slate-500 max-w-sm">
                  {lang === 'fr'
                    ? 'Sélectionnez une leçon dans le menu de gauche pour commencer votre formation.'
                    : 'Select a lesson from the left menu to start your training.'}
                </p>
                {modules[0]?.lessons?.[0] && (
                  <button onClick={() => selectLesson(modules[0].lessons[0])} className="btn-primary mt-2">
                    {lang === 'fr' ? 'Commencer le Module 1' : 'Start Module 1'} →
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ─── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="bg-saim-800 text-white py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <img src="/images/saimlogo.png" alt="SAIM" className="h-5 brightness-200" />
          <span className="text-slate-400">© 2026 SAIM</span>
        </div>
        <div className="flex gap-4 text-slate-400">
          <button onClick={onGoLanding} className="hover:text-white transition-colors">{t('nav_about')}</button>
          <span>partner@mysaim.com</span>
          <span>(+237) 677 51 88 62</span>
        </div>
      </footer>

      {/* ─── CONGRATS POPUP ─────────────────────────────────────────────────── */}
      {showCongrats && (
        <CongratsPopup
          t={t}
          onClose={() => setShowCongrats(false)}
          onNext={hasNext() ? goToNext : null}
        />
      )}
    </div>
  )
}