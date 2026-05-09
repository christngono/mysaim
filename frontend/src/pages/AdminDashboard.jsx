import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(s) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function fmtDateTime(s) {
  if (!s) return '—'
  return new Date(s).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function fmtCFA(n) {
  if (!n && n !== 0) return '—'
  return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'
}
function fmtMonth(ym) {
  if (!ym) return '—'
  const [y, m] = ym.split('-')
  return new Date(y, m - 1).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
}

// ─── Small UI primitives ──────────────────────────────────────────────────────
function OnlineDot({ online }) {
  return (
    <span
      title={online ? 'En ligne' : 'Hors ligne'}
      className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${online ? 'bg-emerald-500 shadow shadow-emerald-300' : 'bg-slate-300'}`}
    />
  )
}

function Badge({ children, color = 'slate' }) {
  const cls = {
    slate:   'bg-slate-100 text-slate-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    amber:   'bg-amber-100 text-amber-700',
    red:     'bg-red-100 text-red-700',
    saim:    'bg-saim-100 text-saim-700',
  }[color] || 'bg-slate-100 text-slate-700'
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{children}</span>
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function Confirm({ message, onConfirm, onCancel }) {
  return (
    <Modal title="Confirmation" onClose={onCancel}>
      <p className="text-slate-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="btn-secondary text-sm px-4 py-2">Annuler</button>
        <button onClick={onConfirm} className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-full text-sm transition-all">Supprimer</button>
      </div>
    </Modal>
  )
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-saim-500' : 'bg-slate-200'}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getYoutubeEmbedUrl(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
}

// ─── File upload input ────────────────────────────────────────────────────────
function FileUploadInput({ accept, label, onUploaded }) {
  const ref = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState('')

  const handleChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setErr('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.post('/admin/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      onUploaded(res.data.url)
    } catch {
      setErr('Échec de l\'envoi')
    } finally {
      setUploading(false)
      if (ref.current) ref.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={handleChange} />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className="flex-shrink-0 text-xs bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-saim-50 hover:text-saim-700 hover:border-saim-200 disabled:opacity-50 transition-all"
      >
        {uploading ? '⏳ Envoi...' : label}
      </button>
      {err && <span className="text-xs text-red-500">{err}</span>}
    </div>
  )
}

// ─── Content Block Editor ─────────────────────────────────────────────────────
const BLOCK_TYPES = [
  { value: 'paragraph', label: '¶ Paragraphe' },
  { value: 'list',      label: '• Liste à puces' },
  { value: 'infobox',   label: '💡 Infobox' },
  { value: 'retenir',   label: '📌 À retenir' },
  { value: 'tools',     label: '🛠 Outils' },
  { value: 'image',     label: '🖼 Image' },
  { value: 'video',     label: '🎬 Vidéo' },
  { value: 'audio',     label: '🎵 Audio' },
  { value: 'resources', label: '🔗 Ressources' },
]

function BlockEditor({ blocks, onChange }) {
  const add = () => onChange([...blocks, { type: 'paragraph', text: '' }])

  const update = (i, patch) => {
    const next = blocks.map((b, idx) => idx === i ? { ...b, ...patch } : b)
    onChange(next)
  }

  const remove = (i) => onChange(blocks.filter((_, idx) => idx !== i))

  const move = (i, dir) => {
    const next = [...blocks]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  const updateLink = (blockIdx, linkIdx, patch) => {
    const links = [...(blocks[blockIdx].links || [])]
    links[linkIdx] = { ...links[linkIdx], ...patch }
    update(blockIdx, { links })
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => (
        <div key={i} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
          {/* Block header */}
          <div className="flex items-center gap-2 mb-3">
            <select
              className="input-field w-auto text-xs"
              value={block.type}
              onChange={e => update(i, { type: e.target.value, text: '', title: '', icon: '', items: '', src: '', caption: '', links: [] })}
            >
              {BLOCK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <div className="ml-auto flex gap-1">
              <button type="button" onClick={() => move(i, -1)} className="text-slate-400 hover:text-slate-700 text-xs px-1">↑</button>
              <button type="button" onClick={() => move(i, 1)}  className="text-slate-400 hover:text-slate-700 text-xs px-1">↓</button>
              <button type="button" onClick={() => remove(i)}   className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
            </div>
          </div>

          {/* ── Paragraphe ── */}
          {block.type === 'paragraph' && (
            <textarea className="input-field resize-none" rows={3} placeholder="Texte du paragraphe..." value={block.text || ''} onChange={e => update(i, { text: e.target.value })} />
          )}

          {/* ── Liste à puces ── */}
          {block.type === 'list' && (
            <div className="space-y-2">
              <input className="input-field" placeholder="Titre (optionnel)" value={block.title || ''} onChange={e => update(i, { title: e.target.value })} />
              <textarea
                className="input-field resize-none font-mono text-xs"
                rows={5}
                placeholder={"Une puce par ligne :\nPremier élément\nDeuxième élément\nTroisième élément"}
                value={block.items || ''}
                onChange={e => update(i, { items: e.target.value })}
              />
              <p className="text-xs text-slate-400">Saisissez une entrée par ligne</p>
            </div>
          )}

          {/* ── Infobox ── */}
          {block.type === 'infobox' && (
            <div className="space-y-2">
              <input className="input-field" placeholder="Icône (ex: 💡)" value={block.icon || ''} onChange={e => update(i, { icon: e.target.value })} />
              <input className="input-field" placeholder="Titre de l'infobox" value={block.title || ''} onChange={e => update(i, { title: e.target.value })} />
              <textarea className="input-field resize-none" rows={3} placeholder="Contenu..." value={block.text || ''} onChange={e => update(i, { text: e.target.value })} />
            </div>
          )}

          {/* ── À retenir ── */}
          {block.type === 'retenir' && (
            <div className="space-y-2">
              <input className="input-field" placeholder="Titre (ex: À retenir)" value={block.title || ''} onChange={e => update(i, { title: e.target.value })} />
              <textarea className="input-field resize-none" rows={3} placeholder="Points clés..." value={block.text || ''} onChange={e => update(i, { text: e.target.value })} />
            </div>
          )}

          {/* ── Outils ── */}
          {block.type === 'tools' && (
            <div className="space-y-2">
              <input className="input-field" placeholder="Titre (ex: Outils recommandés)" value={block.title || ''} onChange={e => update(i, { title: e.target.value })} />
              <input className="input-field" placeholder="Outils séparés par virgule (ex: ChatGPT, Gemini, Copilot)" value={block.items || ''} onChange={e => update(i, { items: e.target.value })} />
            </div>
          )}

          {/* ── Image ── */}
          {block.type === 'image' && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  className="input-field flex-1"
                  placeholder="URL de l'image (https://...)"
                  value={block.src || ''}
                  onChange={e => update(i, { src: e.target.value })}
                />
                <FileUploadInput accept="image/*" label="📷 Téléverser" onUploaded={url => update(i, { src: url })} />
              </div>
              <input className="input-field" placeholder="Légende (optionnel)" value={block.caption || ''} onChange={e => update(i, { caption: e.target.value })} />
              {block.src && (
                <img src={block.src} alt="" className="mt-1 max-h-40 rounded-lg border border-slate-200 object-contain bg-white" />
              )}
            </div>
          )}

          {/* ── Vidéo ── */}
          {block.type === 'video' && (
            <div className="space-y-2">
              <input className="input-field" placeholder="Titre (optionnel)" value={block.title || ''} onChange={e => update(i, { title: e.target.value })} />
              <div className="flex gap-2">
                <input
                  className="input-field flex-1"
                  placeholder="Lien YouTube / Vimeo / URL directe..."
                  value={block.src || ''}
                  onChange={e => update(i, { src: e.target.value })}
                />
                <FileUploadInput accept="video/*" label="🎬 Téléverser" onUploaded={url => update(i, { src: url })} />
              </div>
              {block.src && (() => {
                const embed = getYoutubeEmbedUrl(block.src)
                return embed
                  ? <div className="relative w-full rounded-lg overflow-hidden border border-slate-200" style={{ paddingBottom: '42%' }}><iframe src={embed} className="absolute inset-0 w-full h-full" allowFullScreen /></div>
                  : <video src={block.src} controls className="w-full max-h-40 rounded-lg border border-slate-200 bg-black" />
              })()}
            </div>
          )}

          {/* ── Audio ── */}
          {block.type === 'audio' && (
            <div className="space-y-2">
              <input className="input-field" placeholder="Titre (optionnel)" value={block.title || ''} onChange={e => update(i, { title: e.target.value })} />
              <div className="flex gap-2">
                <input
                  className="input-field flex-1"
                  placeholder="URL du fichier audio..."
                  value={block.src || ''}
                  onChange={e => update(i, { src: e.target.value })}
                />
                <FileUploadInput accept="audio/*" label="🎵 Téléverser" onUploaded={url => update(i, { src: url })} />
              </div>
              {block.src && <audio controls src={block.src} className="w-full mt-1" />}
            </div>
          )}

          {/* ── Ressources / Liens ── */}
          {block.type === 'resources' && (
            <div className="space-y-3">
              <input className="input-field" placeholder="Titre de la section (ex: Ressources complémentaires)" value={block.title || ''} onChange={e => update(i, { title: e.target.value })} />
              <div className="space-y-2">
                {(block.links || []).map((link, li) => (
                  <div key={li} className="flex items-center gap-2">
                    <input
                      className="input-field flex-1"
                      placeholder="Nom du lien"
                      value={link.label || ''}
                      onChange={e => updateLink(i, li, { label: e.target.value })}
                    />
                    <input
                      className="input-field flex-1"
                      placeholder="URL (https://...)"
                      value={link.url || ''}
                      onChange={e => updateLink(i, li, { url: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => update(i, { links: (block.links || []).filter((_, idx) => idx !== li) })}
                      className="text-red-400 hover:text-red-600 text-sm px-1 flex-shrink-0"
                    >✕</button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => update(i, { links: [...(block.links || []), { label: '', url: '' }] })}
                className="text-xs text-saim-600 hover:text-saim-800 font-semibold flex items-center gap-1"
              >
                + Ajouter un lien
              </button>
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={add} className="text-sm text-saim-600 hover:text-saim-800 font-semibold flex items-center gap-1 mt-2">
        + Ajouter un bloc
      </button>
    </div>
  )
}

// ─── Section: Tableau de bord ─────────────────────────────────────────────────
function SectionDashboard() {
  const [stats, setStats]   = useState(null)
  const [quotes, setQuotes] = useState([])

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {})
    api.get('/admin/quotes').then(r => setQuotes(r.data.slice(0, 5))).catch(() => {})
  }, [])

  const cards = stats ? [
    { label: 'Utilisateurs total', value: stats.total_users,   color: 'saim',    icon: '👥' },
    { label: 'Utilisateurs actifs', value: stats.active_users, color: 'emerald', icon: '✅' },
    { label: 'Leçons total',        value: stats.total_lessons, color: 'amber',  icon: '📚' },
    { label: 'Complétion leçons',   value: stats.completions,  color: 'violet',  icon: '🏆' },
  ] : []

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-800 mb-6">Tableau de bord</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {!stats ? [1, 2, 3, 4].map(i => (
          <div key={i} className="card p-5 animate-pulse">
            <div className="w-8 h-8 bg-slate-200 rounded-lg mb-2" />
            <div className="h-8 bg-slate-200 rounded w-2/3 mb-2" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
          </div>
        )) : cards.map(c => (
          <div key={c.label} className="card p-5">
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className="text-3xl font-extrabold text-slate-800">{c.value ?? '—'}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="text-base font-extrabold text-slate-700 mb-4">Dernières demandes de devis</h2>
        {quotes.length === 0 ? (
          <p className="text-sm text-slate-400">Aucune demande.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">
                <th className="pb-2">Nom</th>
                <th className="pb-2">Email</th>
                <th className="pb-2 hidden md:table-cell">Message</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(q => (
                <tr key={q.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-2 font-medium">{q.name}</td>
                  <td className="py-2 text-slate-500">{q.email}</td>
                  <td className="py-2 text-slate-400 hidden md:table-cell max-w-xs truncate">{q.message}</td>
                  <td className="py-2 text-slate-400 whitespace-nowrap">{fmtDate(q.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── Lesson Preview (renders content blocks as the user would see them) ───────
function PreviewBlock({ block }) {
  if (block.type === 'paragraph') {
    return <p className="text-slate-700 leading-relaxed">{block.text}</p>
  }
  if (block.type === 'list') {
    const items = typeof block.items === 'string'
      ? block.items.split('\n').map(s => s.trim()).filter(Boolean)
      : (Array.isArray(block.items) ? block.items : [])
    return (
      <div>
        {block.title && <p className="font-semibold text-slate-700 mb-2 text-sm">{block.title}</p>}
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-700 text-sm">
              <span className="w-2 h-2 rounded-full bg-saim-500 mt-1.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  if (block.type === 'infobox') {
    return (
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
        {block.icon && <span className="text-xl flex-shrink-0">{block.icon}</span>}
        <div>
          {block.title && <strong className="block text-blue-800 mb-1">{block.title}</strong>}
          <p className="text-blue-700 text-sm">{block.text}</p>
        </div>
      </div>
    )
  }
  if (block.type === 'retenir') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        {block.title && <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 mb-2">{block.title}</div>}
        <p className="text-emerald-800 text-sm">{block.text}</p>
      </div>
    )
  }
  if (block.type === 'tools') {
    const items = Array.isArray(block.items)
      ? block.items
      : (block.items || '').split(',').map(s => s.trim()).filter(Boolean)
    return (
      <div>
        {block.title && <p className="text-xs font-bold text-slate-500 mb-2">{block.title}</p>}
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5 bg-white border border-slate-200 text-saim-700 font-bold text-sm px-3 py-1.5 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-saim-500 inline-block" />
              {item}
            </span>
          ))}
        </div>
      </div>
    )
  }
  if (block.type === 'image') {
    return (
      <figure>
        {block.src && <img src={block.src} alt={block.caption || ''} className="w-full rounded-xl border border-slate-200 shadow-sm object-contain max-h-64" />}
        {block.caption && <figcaption className="text-xs text-slate-400 text-center mt-1">{block.caption}</figcaption>}
      </figure>
    )
  }
  if (block.type === 'video') {
    const embed = getYoutubeEmbedUrl(block.src)
    return (
      <div>
        {block.title && <p className="font-semibold text-slate-700 mb-2 text-sm">{block.title}</p>}
        {embed
          ? <div className="relative w-full rounded-xl overflow-hidden border border-slate-200" style={{ paddingBottom: '56.25%' }}>
              <iframe src={embed} className="absolute inset-0 w-full h-full" allowFullScreen />
            </div>
          : block.src && <video controls src={block.src} className="w-full rounded-xl border border-slate-200 bg-black" />
        }
      </div>
    )
  }
  if (block.type === 'audio') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        {block.title && <p className="font-semibold text-slate-700 mb-2 text-sm">{block.title}</p>}
        {block.src && <audio controls src={block.src} className="w-full" />}
      </div>
    )
  }
  if (block.type === 'resources') {
    return (
      <div className="bg-saim-50 border border-saim-100 rounded-xl p-4">
        {block.title && <p className="font-bold text-saim-700 mb-3 text-sm">{block.title}</p>}
        <ul className="space-y-2">
          {(block.links || []).map((link, i) => (
            <li key={i}>
              <a href={link.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-saim-600 hover:text-saim-800 font-medium text-sm hover:underline">
                <span>🔗</span><span>{link.label || link.url}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  return null
}

function LessonPreviewModal({ lesson, onClose }) {
  if (!lesson) return null
  let blocks = []
  let intro = null
  try {
    const raw = typeof lesson.content_fr === 'string' ? JSON.parse(lesson.content_fr) : lesson.content_fr
    if (Array.isArray(raw)) {
      blocks = raw
    } else if (raw) {
      intro = raw.intro
      blocks = raw.sections || []
    }
  } catch {}

  return (
    <Modal title={`Prévisualisation — ${lesson.title_fr}`} onClose={onClose} wide>
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-200">
            <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">Aperçu utilisateur (FR)</span>
          </div>
          <h3 className="text-xl font-extrabold text-saim-800 mb-4">{lesson.title_fr}</h3>
          {intro && <p className="text-slate-600 text-sm leading-relaxed mb-4">{intro}</p>}
          <div className="space-y-4">
            {blocks.map((block, i) => <PreviewBlock key={i} block={block} />)}
          </div>
          {blocks.length === 0 && !intro && (
            <p className="text-sm text-slate-400 italic">Aucun contenu à afficher.</p>
          )}
        </div>
      </div>
    </Modal>
  )
}

// ─── Section: Formations ──────────────────────────────────────────────────────
const EMPTY_FORM = {
  title_fr: '', title_en: '', description_fr: '', description_en: '',
  prerequisites: '', level: 'débutant', duration_hours: 2, price: 25500,
  teaser_url: '', color: 'blue', icon: '🤖', order_index: 0,
  is_published: false, target_audience: '', learning_objectives: '', image_url: '', programme: '', why_fr: '',
}

function textToProgramme(text) {
  if (!text.trim()) return []
  const lines = text.split('\n')
  const modules = []
  let current = null
  for (const line of lines) {
    const t = line.trim()
    if (!t) continue
    if (t.startsWith('##')) {
      current = { module: t.replace(/^#+\s*/, ''), items: [] }
      modules.push(current)
    } else if (current) {
      current.items.push(t)
    }
  }
  return modules
}

function programmeToText(modules) {
  if (!Array.isArray(modules) || !modules.length) return ''
  return modules.map(m => `## ${m.module}\n${(m.items || []).join('\n')}`).join('\n\n')
}

function FormationForm({ form, setForm, saving, onSave, onCancel, title }) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const uploadImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await api.post('/upload', fd)
      setForm(f => ({ ...f, image_url: r.data.url }))
    } catch { alert('Erreur upload') }
    finally { setUploading(false) }
  }

  return (
    <Modal title={title} onClose={onCancel} wide>
      <div className="space-y-4">
        {/* Image de couverture */}
        <div>
          <label className="label">Image de couverture</label>
          <div className="flex items-center gap-3">
            {form.image_url
              ? <img src={form.image_url} alt="" className="w-24 h-16 object-cover rounded-xl border border-slate-200" />
              : <div className="w-24 h-16 bg-slate-100 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">Aucune</div>
            }
            <div className="flex flex-col gap-1">
              <button type="button" onClick={() => fileRef.current?.click()}
                className="btn-secondary text-xs py-1.5 px-3">
                {uploading ? 'Upload...' : '📤 Uploader'}
              </button>
              {form.image_url && (
                <button type="button" onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                  className="text-xs text-red-500 hover:text-red-700 underline text-left">
                  Supprimer
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadImage} />
          </div>
          {form.image_url && (
            <input className="input-field mt-2 text-xs" value={form.image_url}
              onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
              placeholder="ou coller une URL" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Titre (FR) *</label><input className="input-field" value={form.title_fr} onChange={e => setForm(f => ({ ...f, title_fr: e.target.value }))} /></div>
          <div><label className="label">Titre (EN)</label><input className="input-field" value={form.title_en} onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Description (FR)</label><textarea className="input-field resize-none" rows={3} value={form.description_fr} onChange={e => setForm(f => ({ ...f, description_fr: e.target.value }))} /></div>
          <div><label className="label">Description (EN)</label><textarea className="input-field resize-none" rows={3} value={form.description_en} onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))} /></div>
        </div>
        <div>
          <label className="label">Objectifs (un par ligne)</label>
          <textarea className="input-field resize-none" rows={4} value={form.learning_objectives}
            onChange={e => setForm(f => ({ ...f, learning_objectives: e.target.value }))}
            placeholder="Utiliser les outils IA au quotidien&#10;Automatiser des tâches..." />
        </div>
        <div>
          <label className="label">Pourquoi cette formation ? (descriptif)</label>
          <textarea className="input-field resize-y" rows={4} value={form.why_fr}
            onChange={e => setForm(f => ({ ...f, why_fr: e.target.value }))}
            placeholder="Dans un monde où l'IA transforme..." />
        </div>
        <div><label className="label">Prérequis</label><input className="input-field" value={form.prerequisites} onChange={e => setForm(f => ({ ...f, prerequisites: e.target.value }))} /></div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Niveau</label>
            <select className="input-field" value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
              <option value="débutant">Débutant</option>
              <option value="intermédiaire">Intermédiaire</option>
              <option value="avancé">Avancé</option>
            </select>
          </div>
          <div><label className="label">Durée (h)</label><input type="number" className="input-field" value={form.duration_hours} onChange={e => setForm(f => ({ ...f, duration_hours: +e.target.value }))} /></div>
          <div><label className="label">Prix (FCFA)</label><input type="number" className="input-field" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} /></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Couleur</label>
            <select className="input-field" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}>
              {[['blue','🔵 Bleu'],['orange','🟠 Orange'],['purple','🟣 Violet'],['green','🟢 Vert']].map(([v,l]) =>
                <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div><label className="label">Icône (emoji)</label><input className="input-field text-2xl text-center" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} /></div>
          <div><label className="label">Ordre</label><input type="number" className="input-field" value={form.order_index} onChange={e => setForm(f => ({ ...f, order_index: +e.target.value }))} /></div>
        </div>
        <div><label className="label">Public cible (virgule-séparé)</label><input className="input-field" value={form.target_audience} onChange={e => setForm(f => ({ ...f, target_audience: e.target.value }))} placeholder="Cadres, Managers..." /></div>
        <div><label className="label">URL vidéo teaser</label><input className="input-field" value={form.teaser_url} onChange={e => setForm(f => ({ ...f, teaser_url: e.target.value }))} placeholder="https://youtube.com/..." /></div>
        <div>
          <label className="label">Programme du cours</label>
          <p className="text-xs text-slate-400 mb-1.5">Format : <code className="bg-slate-100 px-1 rounded">## Titre du module</code> puis items ligne par ligne. Séparer les modules par une ligne vide.</p>
          <textarea
            className="input-field resize-y font-mono text-xs"
            rows={10}
            value={form.programme}
            onChange={e => setForm(f => ({ ...f, programme: e.target.value }))}
            placeholder={"## Introduction à l'IA\nComprendre l'IA générative\nChatGPT, Claude, Gemini\n\n## Optimiser sa productivité\nRédiger emails en minutes\nAutomatiser les tâches"}
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="label mb-0">Publiée</label>
          <ToggleSwitch checked={form.is_published} onChange={v => setForm(f => ({ ...f, is_published: v }))} />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button onClick={onCancel} className="btn-secondary text-sm">Annuler</button>
          <button onClick={onSave} disabled={saving || !form.title_fr} className="btn-primary text-sm">
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function SectionFormations() {
  const [formations, setFormations] = useState([])
  const [editF, setEditF]           = useState(null) // formation being edited
  const [creating, setCreating]     = useState(false)
  const [form, setForm]             = useState(null)
  const [saving, setSaving]         = useState(false)

  const load = useCallback(() => {
    api.get('/admin/formations').then(r => setFormations(r.data)).catch(() => {})
  }, [])
  useEffect(() => { load() }, [load])

  const COLOR_THEME = {
    blue: 'bg-blue-50 text-blue-600', orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600', green: 'bg-green-50 text-green-600',
  }

  const openEdit = (f) => {
    let audience = [], objectives = [], programme = []
    try { audience   = JSON.parse(f.target_audience    || '[]') } catch {}
    try { objectives = JSON.parse(f.learning_objectives || '[]') } catch {}
    try { programme  = JSON.parse(f.programme           || '[]') } catch {}
    setEditF(f)
    setForm({
      title_fr: f.title_fr || '', title_en: f.title_en || '',
      description_fr: f.description_fr || '', description_en: f.description_en || '',
      prerequisites: f.prerequisites || '', level: f.level || 'débutant',
      duration_hours: f.duration_hours || 2, price: f.price || 25500,
      teaser_url: f.teaser_url || '', color: f.color || 'blue', icon: f.icon || '🤖',
      order_index: f.order_index || 0, is_published: f.is_published === 1,
      image_url: f.image_url || '',
      target_audience: audience.join(', '),
      learning_objectives: objectives.join('\n'),
      programme: programmeToText(programme),
      why_fr: f.why_fr || '',
    })
  }

  const openCreate = () => { setCreating(true); setForm({ ...EMPTY_FORM }) }

  const buildPayload = (form) => ({
    ...form,
    target_audience: form.target_audience.split(',').map(s => s.trim()).filter(Boolean),
    learning_objectives: form.learning_objectives.split('\n').map(s => s.trim()).filter(Boolean),
    programme: textToProgramme(form.programme || ''),
    image_url: form.image_url || null,
  })

  const save = async () => {
    setSaving(true)
    try {
      if (creating) {
        await api.post('/admin/formations', buildPayload(form))
        setCreating(false)
      } else {
        await api.put(`/admin/formations/${editF.id}`, buildPayload(form))
        setEditF(null)
      }
      setForm(null); load()
    } finally { setSaving(false) }
  }

  const togglePublish = async (f) => {
    let audience = [], objectives = [], programme = []
    try { audience   = JSON.parse(f.target_audience    || '[]') } catch {}
    try { objectives = JSON.parse(f.learning_objectives || '[]') } catch {}
    try { programme  = JSON.parse(f.programme           || '[]') } catch {}
    await api.put(`/admin/formations/${f.id}`, {
      ...f, target_audience: audience, learning_objectives: objectives,
      programme, image_url: f.image_url || null, is_published: f.is_published ? 0 : 1,
    })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800">Formations</h1>
        <button onClick={openCreate} className="btn-primary text-sm">+ Nouvelle formation</button>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {formations.map(f => {
          let audience = []
          try { audience = JSON.parse(f.target_audience || '[]') } catch {}
          const color = f.color || 'blue'
          return (
            <div key={f.id} className="card overflow-hidden">
              {/* Cover image strip */}
              {f.image_url && (
                <img src={f.image_url} alt={f.title_fr} className="w-full h-28 object-cover" />
              )}
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${COLOR_THEME[color] || 'bg-blue-50 text-blue-600'}`}>
                    {f.icon || '🤖'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-slate-800 leading-snug text-sm">{f.title_fr}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${f.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {f.is_published ? '✓ Publiée' : '○ Brouillon'}
                      </span>
                      {f.level && <span className="text-xs text-slate-400 capitalize">{f.level}</span>}
                      {f.duration_hours ? <span className="text-xs text-slate-400">{f.duration_hours}h</span> : null}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  {[
                    { v: f.module_count || 0,   l: 'Modules' },
                    { v: f.enrolled_count || 0, l: 'Inscrits' },
                    { v: (f.price || 25500).toLocaleString('fr-FR'), l: 'FCFA' },
                  ].map((s, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl py-2">
                      <div className="font-bold text-slate-700 text-sm">{s.v}</div>
                      <div className="text-xs text-slate-400">{s.l}</div>
                    </div>
                  ))}
                </div>

                {audience.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {audience.map((a, i) => <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{a}</span>)}
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={() => openEdit(f)} className="flex-1 btn-secondary text-xs py-2">✏️ Modifier</button>
                  <button
                    onClick={() => togglePublish(f)}
                    className={`flex-1 text-xs py-2 rounded-xl font-semibold transition-colors border ${f.is_published ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'}`}
                  >
                    {f.is_published ? '⏸ Dépublier' : '▶ Publier'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Create modal */}
      {creating && form && (
        <FormationForm form={form} setForm={setForm} saving={saving}
          onSave={save} onCancel={() => { setCreating(false); setForm(null) }}
          title="Nouvelle formation" />
      )}

      {/* Edit modal */}
      {editF && form && (
        <FormationForm form={form} setForm={setForm} saving={saving}
          onSave={save} onCancel={() => { setEditF(null); setForm(null) }}
          title={`Modifier : ${editF.title_fr}`} />
      )}
    </div>
  )
}

// ─── Section: Modules & Cours ─────────────────────────────────────────────────
function SectionModules() {
  const [formations, setFormations2]      = useState([])
  const [selectedFormId, setSelectedFormId] = useState(null)
  const [modules, setModules]             = useState([])
  const [expanded, setExpanded]           = useState({})
  const [lessons, setLessons]             = useState({})
  const [moduleModal, setModuleModal]     = useState(null) // null | { mode:'create'|'edit', data }
  const [lessonModal, setLessonModal]     = useState(null) // null | { mode, moduleId, data }
  const [confirmDel, setConfirmDel]       = useState(null) // null | { type, id, name }
  const [saving, setSaving]               = useState(false)
  const [previewLesson, setPreviewLesson] = useState(null)

  useEffect(() => {
    api.get('/admin/formations').then(r => {
      setFormations2(r.data)
      if (r.data.length > 0) setSelectedFormId(r.data[0].id)
    }).catch(() => {})
  }, [])

  const loadModules = useCallback(() => {
    const url = selectedFormId ? `/admin/modules?formation_id=${selectedFormId}` : '/admin/modules'
    api.get(url).then(r => setModules(r.data)).catch(() => {})
  }, [selectedFormId])

  useEffect(() => { if (selectedFormId !== null) loadModules() }, [loadModules, selectedFormId])

  const toggleExpand = async (modId) => {
    setExpanded(e => ({ ...e, [modId]: !e[modId] }))
    if (!lessons[modId]) {
      const r = await api.get(`/admin/modules/${modId}/lessons`)
      setLessons(l => ({ ...l, [modId]: r.data }))
    }
  }

  const reloadLessons = async (modId) => {
    const r = await api.get(`/admin/modules/${modId}/lessons`)
    setLessons(l => ({ ...l, [modId]: r.data }))
  }

  // ── Module form state ──
  const [mForm, setMForm] = useState({ title_fr: '', title_en: '', description_fr: '', description_en: '', order_index: 0, is_published: true, formation_id: null })

  const openModuleModal = (mode, data = null) => {
    setMForm(data ? {
      title_fr: data.title_fr, title_en: data.title_en,
      description_fr: data.description_fr || '', description_en: data.description_en || '',
      order_index: data.order_index, is_published: data.is_published === 1,
      formation_id: data.formation_id || selectedFormId,
    } : { title_fr: '', title_en: '', description_fr: '', description_en: '', order_index: 0, is_published: true, formation_id: selectedFormId })
    setModuleModal({ mode, data })
  }

  const saveModule = async () => {
    setSaving(true)
    try {
      if (moduleModal.mode === 'create') {
        await api.post('/admin/modules', { ...mForm, is_published: mForm.is_published ? 1 : 0 })
      } else {
        await api.put(`/admin/modules/${moduleModal.data.id}`, { ...mForm, is_published: mForm.is_published ? 1 : 0 })
      }
      setModuleModal(null)
      loadModules()
    } finally { setSaving(false) }
  }

  const deleteModule = async (id) => {
    await api.delete(`/admin/modules/${id}`)
    loadModules()
    setConfirmDel(null)
  }

  // ── Lesson form state ──
  const [lForm, setLForm] = useState({ title_fr: '', title_en: '', order_index: 0, is_published: true, blocks_fr: [], blocks_en: [] })

  const openLessonModal = (mode, moduleId, data = null) => {
    let bfr = [], ben = []
    if (data) {
      try { bfr = typeof data.content_fr === 'string' ? JSON.parse(data.content_fr) : data.content_fr } catch { bfr = [] }
      try { ben = typeof data.content_en === 'string' ? JSON.parse(data.content_en) : data.content_en } catch { ben = [] }
    }
    setLForm({
      title_fr: data?.title_fr || '', title_en: data?.title_en || '',
      order_index: data?.order_index ?? 0, is_published: data ? data.is_published === 1 : true,
      blocks_fr: Array.isArray(bfr) ? bfr : [], blocks_en: Array.isArray(ben) ? ben : [],
    })
    setLessonModal({ mode, moduleId, data })
  }

  const saveLesson = async () => {
    setSaving(true)
    try {
      const payload = {
        title_fr: lForm.title_fr, title_en: lForm.title_en,
        content_fr: JSON.stringify(lForm.blocks_fr),
        content_en: JSON.stringify(lForm.blocks_en),
        order_index: lForm.order_index,
        is_published: lForm.is_published ? 1 : 0,
      }
      if (lessonModal.mode === 'create') {
        await api.post(`/admin/modules/${lessonModal.moduleId}/lessons`, payload)
      } else {
        await api.put(`/admin/lessons/${lessonModal.data.id}`, payload)
      }
      setLessonModal(null)
      reloadLessons(lessonModal.moduleId)
    } finally { setSaving(false) }
  }

  const deleteLesson = async (id, moduleId) => {
    await api.delete(`/admin/lessons/${id}`)
    reloadLessons(moduleId)
    setConfirmDel(null)
  }

  const quickToggleModule = async (m) => {
    const newVal = m.is_published ? 0 : 1
    await api.put(`/admin/modules/${m.id}`, {
      title_fr: m.title_fr, title_en: m.title_en,
      description_fr: m.description_fr, description_en: m.description_en,
      order_index: m.order_index, is_published: newVal, formation_id: m.formation_id,
    })
    loadModules()
  }

  const quickToggleLesson = async (l, moduleId) => {
    const newVal = l.is_published ? 0 : 1
    await api.put(`/admin/lessons/${l.id}`, {
      title_fr: l.title_fr, title_en: l.title_en,
      content_fr: l.content_fr, content_en: l.content_en,
      order_index: l.order_index, is_published: newVal,
    })
    reloadLessons(moduleId)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold text-slate-800">Modules & Cours</h1>
        <button onClick={() => openModuleModal('create')} className="btn-primary text-sm">+ Nouveau module</button>
      </div>

      {/* Formation selector */}
      {formations.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {formations.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFormId(f.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${selectedFormId === f.id ? 'bg-saim-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-saim-300'}`}
            >
              {f.icon} {f.title_fr}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {modules.map(m => (
          <div key={m.id} className="card overflow-hidden">
            <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50" onClick={() => toggleExpand(m.id)}>
              <span className="text-slate-400 text-xs">{expanded[m.id] ? '▼' : '▶'}</span>
              <div className="flex-1">
                <span className="font-bold text-slate-800">{m.title_fr}</span>
                <span className="text-xs text-slate-400 ml-2">#{m.order_index}</span>
              </div>
              <div className="flex items-center gap-2 ml-2" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => quickToggleModule(m)}
                  title={m.is_published ? 'Masquer le module' : 'Publier le module'}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full transition-all ${m.is_published ? 'bg-emerald-100 text-emerald-700 hover:bg-red-100 hover:text-red-600' : 'bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700'}`}
                >
                  {m.is_published ? '✓ Publié' : '○ Brouillon'}
                </button>
                <button onClick={() => openModuleModal('edit', m)} className="text-xs text-saim-600 hover:text-saim-800 font-semibold px-2 py-1 rounded hover:bg-saim-50">Modifier</button>
                <button onClick={() => openLessonModal('create', m.id)} className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold px-2 py-1 rounded hover:bg-emerald-50">+ Leçon</button>
                <button onClick={() => setConfirmDel({ type: 'module', id: m.id, name: m.title_fr })} className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50">Supprimer</button>
              </div>
            </div>

            {expanded[m.id] && (
              <div className="border-t border-slate-100">
                {(lessons[m.id] || []).length === 0 ? (
                  <p className="text-sm text-slate-400 px-6 py-4">Aucune leçon dans ce module.</p>
                ) : (lessons[m.id] || []).map(l => (
                  <div key={l.id} className="flex items-center gap-2 px-6 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <span className="text-xs text-slate-400 w-5 text-right flex-shrink-0">{l.order_index}</span>
                    <span className="flex-1 text-sm font-medium text-slate-700 truncate">{l.title_fr}</span>
                    <button
                      onClick={() => quickToggleLesson(l, m.id)}
                      title={l.is_published ? 'Masquer la leçon' : 'Publier la leçon'}
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full transition-all flex-shrink-0 ${l.is_published ? 'bg-emerald-100 text-emerald-700 hover:bg-red-100 hover:text-red-600' : 'bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700'}`}
                    >
                      {l.is_published ? '✓ Publié' : '○ Brouillon'}
                    </button>
                    <button onClick={() => setPreviewLesson(l)} className="text-xs text-violet-600 hover:text-violet-800 font-semibold px-2 py-1 rounded hover:bg-violet-50 flex-shrink-0">👁 Aperçu</button>
                    <button onClick={() => openLessonModal('edit', m.id, l)} className="text-xs text-saim-600 hover:text-saim-800 font-semibold px-2 py-1 rounded hover:bg-saim-50 flex-shrink-0">Modifier</button>
                    <button onClick={() => setConfirmDel({ type: 'lesson', id: l.id, moduleId: m.id, name: l.title_fr })} className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50 flex-shrink-0">Supprimer</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Module Modal */}
      {moduleModal && (
        <Modal title={moduleModal.mode === 'create' ? 'Nouveau module' : 'Modifier le module'} onClose={() => setModuleModal(null)} wide>
          <div className="space-y-4">
            <div>
              <label className="label">Formation</label>
              <select className="input-field" value={mForm.formation_id || ''} onChange={e => setMForm(f => ({ ...f, formation_id: e.target.value ? +e.target.value : null }))}>
                <option value="">— Aucune —</option>
                {formations.map(f => <option key={f.id} value={f.id}>{f.title_fr}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Titre (FR)</label><input className="input-field" value={mForm.title_fr} onChange={e => setMForm(f => ({ ...f, title_fr: e.target.value }))} /></div>
              <div><label className="label">Titre (EN)</label><input className="input-field" value={mForm.title_en} onChange={e => setMForm(f => ({ ...f, title_en: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Description (FR)</label><textarea className="input-field resize-none" rows={3} value={mForm.description_fr} onChange={e => setMForm(f => ({ ...f, description_fr: e.target.value }))} /></div>
              <div><label className="label">Description (EN)</label><textarea className="input-field resize-none" rows={3} value={mForm.description_en} onChange={e => setMForm(f => ({ ...f, description_en: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Ordre</label><input type="number" className="input-field" value={mForm.order_index} onChange={e => setMForm(f => ({ ...f, order_index: +e.target.value }))} /></div>
              <div className="flex items-center gap-3 pt-5"><label className="label mb-0">Publié</label><ToggleSwitch checked={mForm.is_published} onChange={v => setMForm(f => ({ ...f, is_published: v }))} /></div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setModuleModal(null)} className="btn-secondary text-sm">Annuler</button>
              <button onClick={saveModule} disabled={saving} className="btn-primary text-sm">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Lesson Modal */}
      {lessonModal && (
        <Modal title={lessonModal.mode === 'create' ? 'Nouvelle leçon' : 'Modifier la leçon'} onClose={() => setLessonModal(null)} wide>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Titre (FR)</label><input className="input-field" value={lForm.title_fr} onChange={e => setLForm(f => ({ ...f, title_fr: e.target.value }))} /></div>
              <div><label className="label">Titre (EN)</label><input className="input-field" value={lForm.title_en} onChange={e => setLForm(f => ({ ...f, title_en: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Ordre</label><input type="number" className="input-field" value={lForm.order_index} onChange={e => setLForm(f => ({ ...f, order_index: +e.target.value }))} /></div>
              <div className="flex items-center gap-3 pt-5"><label className="label mb-0">Publié</label><ToggleSwitch checked={lForm.is_published} onChange={v => setLForm(f => ({ ...f, is_published: v }))} /></div>
            </div>

            <div>
              <label className="label mb-2">Contenu (FR)</label>
              <BlockEditor blocks={lForm.blocks_fr} onChange={b => setLForm(f => ({ ...f, blocks_fr: b }))} />
            </div>
            <div>
              <label className="label mb-2">Contenu (EN)</label>
              <BlockEditor blocks={lForm.blocks_en} onChange={b => setLForm(f => ({ ...f, blocks_en: b }))} />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewLesson({
                  title_fr: lForm.title_fr,
                  content_fr: JSON.stringify(lForm.blocks_fr),
                })}
                className="text-violet-600 hover:text-violet-800 font-semibold text-sm px-4 py-2 rounded-xl border border-violet-200 hover:bg-violet-50 transition-all"
              >
                👁 Prévisualiser
              </button>
              <button onClick={() => setLessonModal(null)} className="btn-secondary text-sm">Annuler</button>
              <button onClick={saveLesson} disabled={saving} className="btn-primary text-sm">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm delete */}
      {confirmDel && (
        <Confirm
          message={`Supprimer "${confirmDel.name}" ? Cette action est irréversible.`}
          onConfirm={() => confirmDel.type === 'module' ? deleteModule(confirmDel.id) : deleteLesson(confirmDel.id, confirmDel.moduleId)}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      {/* Lesson preview modal */}
      {previewLesson && (
        <LessonPreviewModal lesson={previewLesson} onClose={() => setPreviewLesson(null)} />
      )}
    </div>
  )
}

// ─── Section: Quiz ────────────────────────────────────────────────────────────
function SectionQuiz() {
  const [quizzes, setQuizzes]       = useState([])
  const [modules, setModules]       = useState([])
  const [expanded, setExpanded]     = useState({})
  const [questions, setQuestions]   = useState({})
  const [quizModal, setQuizModal]   = useState(null)
  const [qModal, setQModal]         = useState(null) // question modal
  const [confirmDel, setConfirmDel] = useState(null)
  const [saving, setSaving]         = useState(false)

  const [qzForm, setQzForm] = useState({ module_id: '', title_fr: '', title_en: '', passing_score: 7, is_published: true })
  const [qForm, setQForm]   = useState({
    question_fr: '', question_en: '', explanation_fr: '', explanation_en: '',
    choices: [
      { text_fr: '', text_en: '', is_correct: false },
      { text_fr: '', text_en: '', is_correct: false },
      { text_fr: '', text_en: '', is_correct: false },
      { text_fr: '', text_en: '', is_correct: false },
    ]
  })

  const load = useCallback(() => {
    api.get('/admin/quizzes').then(r => setQuizzes(r.data)).catch(() => {})
    api.get('/admin/modules').then(r => setModules(r.data)).catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  const toggleExpand = async (qzId) => {
    setExpanded(e => ({ ...e, [qzId]: !e[qzId] }))
    if (!questions[qzId]) {
      const r = await api.get(`/admin/quizzes/${qzId}/questions`)
      setQuestions(q => ({ ...q, [qzId]: r.data }))
    }
  }

  const reloadQuestions = async (qzId) => {
    const r = await api.get(`/admin/quizzes/${qzId}/questions`)
    setQuestions(q => ({ ...q, [qzId]: r.data }))
  }

  const openQuizModal = (mode, data = null) => {
    setQzForm(data ? {
      module_id: data.module_id, title_fr: data.title_fr, title_en: data.title_en,
      passing_score: data.passing_score, is_published: data.is_published === 1,
    } : { module_id: modules[0]?.id || '', title_fr: '', title_en: '', passing_score: 7, is_published: true })
    setQuizModal({ mode, data })
  }

  const saveQuiz = async () => {
    setSaving(true)
    try {
      if (quizModal.mode === 'create') {
        await api.post('/admin/quizzes', { ...qzForm, is_published: qzForm.is_published ? 1 : 0 })
      } else {
        await api.put(`/admin/quizzes/${quizModal.data.id}`, { ...qzForm, is_published: qzForm.is_published ? 1 : 0 })
      }
      setQuizModal(null)
      load()
    } finally { setSaving(false) }
  }

  const deleteQuiz = async (id) => {
    await api.delete(`/admin/quizzes/${id}`)
    load()
    setConfirmDel(null)
  }

  const openQModal = (quizId) => {
    setQForm({
      quiz_id: quizId,
      question_fr: '', question_en: '', explanation_fr: '', explanation_en: '',
      choices: [
        { text_fr: '', text_en: '', is_correct: false },
        { text_fr: '', text_en: '', is_correct: false },
        { text_fr: '', text_en: '', is_correct: false },
        { text_fr: '', text_en: '', is_correct: false },
      ]
    })
    setQModal(quizId)
  }

  const saveQuestion = async () => {
    setSaving(true)
    try {
      await api.post(`/admin/quizzes/${qModal}/questions`, qForm)
      setQModal(null)
      reloadQuestions(qModal)
    } finally { setSaving(false) }
  }

  const deleteQuestion = async (qId, quizId) => {
    await api.delete(`/admin/questions/${qId}`)
    reloadQuestions(quizId)
    setConfirmDel(null)
  }

  const setCorrect = (ci) => {
    setQForm(f => ({
      ...f,
      choices: f.choices.map((c, i) => ({ ...c, is_correct: i === ci }))
    }))
  }

  // Group quizzes by module
  const grouped = modules.map(m => ({
    module: m,
    quizzes: quizzes.filter(q => q.module_id === m.id),
  })).filter(g => g.quizzes.length > 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800">Quiz</h1>
        <button onClick={() => openQuizModal('create')} className="btn-primary text-sm">+ Nouveau quiz</button>
      </div>

      <div className="space-y-6">
        {grouped.map(g => (
          <div key={g.module.id}>
            <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest mb-3">{g.module.title_fr}</h2>
            <div className="space-y-3">
              {g.quizzes.map(qz => (
                <div key={qz.id} className="card overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <span className="text-slate-400 text-xs cursor-pointer" onClick={() => toggleExpand(qz.id)}>{expanded[qz.id] ? '▼' : '▶'}</span>
                    <div className="flex-1 cursor-pointer" onClick={() => toggleExpand(qz.id)}>
                      <span className="font-bold text-slate-800">{qz.title_fr}</span>
                      <span className="text-xs text-slate-400 ml-2">Score min: {qz.passing_score}/10 · {qz.question_count} question(s)</span>
                    </div>
                    <Badge color={qz.is_published ? 'emerald' : 'slate'}>{qz.is_published ? 'Publié' : 'Masqué'}</Badge>
                    <button onClick={() => openQuizModal('edit', qz)} className="text-xs text-saim-600 hover:text-saim-800 font-semibold px-2 py-1 rounded hover:bg-saim-50">Modifier</button>
                    <button onClick={() => openQModal(qz.id)} className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold px-2 py-1 rounded hover:bg-emerald-50">+ Question</button>
                    <button onClick={() => setConfirmDel({ type: 'quiz', id: qz.id, name: qz.title_fr })} className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50">Supprimer</button>
                  </div>

                  {expanded[qz.id] && (
                    <div className="border-t border-slate-100">
                      {(questions[qz.id] || []).length === 0 ? (
                        <p className="text-sm text-slate-400 px-6 py-4">Aucune question.</p>
                      ) : (questions[qz.id] || []).map((q, qi) => (
                        <div key={q.id} className="px-6 py-4 border-b border-slate-50 last:border-0">
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-bold text-slate-400 mt-0.5 w-5">{qi + 1}.</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-700 mb-2">{q.question_fr}</p>
                              <div className="grid grid-cols-2 gap-1.5">
                                {q.choices.map(c => (
                                  <div key={c.id} className={`text-xs px-2 py-1 rounded ${c.is_correct ? 'bg-emerald-100 text-emerald-700 font-semibold' : 'bg-slate-100 text-slate-500'}`}>
                                    {c.is_correct ? '✓ ' : ''}{c.text_fr}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <button onClick={() => setConfirmDel({ type: 'question', id: q.id, quizId: qz.id, name: q.question_fr.slice(0, 40) })} className="text-xs text-red-400 hover:text-red-600 px-1">✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {grouped.length === 0 && <p className="text-sm text-slate-400">Aucun quiz créé.</p>}
      </div>

      {/* Quiz Modal */}
      {quizModal && (
        <Modal title={quizModal.mode === 'create' ? 'Nouveau quiz' : 'Modifier le quiz'} onClose={() => setQuizModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="label">Module</label>
              <select className="input-field" value={qzForm.module_id} onChange={e => setQzForm(f => ({ ...f, module_id: e.target.value }))}>
                {modules.map(m => <option key={m.id} value={m.id}>{m.title_fr}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Titre (FR)</label><input className="input-field" value={qzForm.title_fr} onChange={e => setQzForm(f => ({ ...f, title_fr: e.target.value }))} /></div>
              <div><label className="label">Titre (EN)</label><input className="input-field" value={qzForm.title_en} onChange={e => setQzForm(f => ({ ...f, title_en: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Score minimum (/10)</label><input type="number" min={1} max={10} className="input-field" value={qzForm.passing_score} onChange={e => setQzForm(f => ({ ...f, passing_score: +e.target.value }))} /></div>
              <div className="flex items-center gap-3 pt-5"><label className="label mb-0">Publié</label><ToggleSwitch checked={qzForm.is_published} onChange={v => setQzForm(f => ({ ...f, is_published: v }))} /></div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setQuizModal(null)} className="btn-secondary text-sm">Annuler</button>
              <button onClick={saveQuiz} disabled={saving} className="btn-primary text-sm">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Question Modal */}
      {qModal && (
        <Modal title="Nouvelle question" onClose={() => setQModal(null)} wide>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Question (FR)</label><textarea className="input-field resize-none" rows={2} value={qForm.question_fr} onChange={e => setQForm(f => ({ ...f, question_fr: e.target.value }))} /></div>
              <div><label className="label">Question (EN)</label><textarea className="input-field resize-none" rows={2} value={qForm.question_en} onChange={e => setQForm(f => ({ ...f, question_en: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Explication (FR)</label><textarea className="input-field resize-none" rows={2} value={qForm.explanation_fr} onChange={e => setQForm(f => ({ ...f, explanation_fr: e.target.value }))} /></div>
              <div><label className="label">Explication (EN)</label><textarea className="input-field resize-none" rows={2} value={qForm.explanation_en} onChange={e => setQForm(f => ({ ...f, explanation_en: e.target.value }))} /></div>
            </div>
            <div>
              <label className="label mb-3">Choix de réponse (sélectionnez la bonne réponse)</label>
              <div className="space-y-2">
                {qForm.choices.map((c, ci) => (
                  <div key={ci} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${c.is_correct ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                    <input
                      type="radio"
                      name="correct_choice"
                      checked={c.is_correct}
                      onChange={() => setCorrect(ci)}
                      className="accent-emerald-500 w-4 h-4 flex-shrink-0"
                    />
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input className="input-field text-xs" placeholder={`Choix ${ci + 1} (FR)`} value={c.text_fr} onChange={e => setQForm(f => ({ ...f, choices: f.choices.map((ch, i) => i === ci ? { ...ch, text_fr: e.target.value } : ch) }))} />
                      <input className="input-field text-xs" placeholder={`Choix ${ci + 1} (EN)`} value={c.text_en} onChange={e => setQForm(f => ({ ...f, choices: f.choices.map((ch, i) => i === ci ? { ...ch, text_en: e.target.value } : ch) }))} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setQModal(null)} className="btn-secondary text-sm">Annuler</button>
              <button onClick={saveQuestion} disabled={saving} className="btn-primary text-sm">{saving ? 'Enregistrement...' : 'Ajouter la question'}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm delete */}
      {confirmDel && (
        <Confirm
          message={`Supprimer "${confirmDel.name}" ?`}
          onConfirm={() => {
            if (confirmDel.type === 'quiz') deleteQuiz(confirmDel.id)
            else if (confirmDel.type === 'question') deleteQuestion(confirmDel.id, confirmDel.quizId)
          }}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  )
}

// ─── Section: Utilisateurs ────────────────────────────────────────────────────
function SectionUsers() {
  const [users, setUsers]         = useState([])
  const [search, setSearch]       = useState('')
  const [userModal, setUserModal] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [saving, setSaving]       = useState(false)
  const [uForm, setUForm]         = useState({ first_name: '', last_name: '', email: '', password: '', role: 'user', post: '', ai_level: '', phone: '' })

  const load = useCallback(() => {
    api.get('/admin/users').then(r => setUsers(r.data)).catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  const openModal = (mode, data = null) => {
    setUForm(data ? {
      first_name: data.first_name, last_name: data.last_name, email: data.email,
      password: '', role: data.role, post: data.post || '', ai_level: data.ai_level || '', phone: data.phone || '',
    } : { first_name: '', last_name: '', email: '', password: '', role: 'user', post: '', ai_level: '', phone: '' })
    setUserModal({ mode, data })
  }

  const saveUser = async () => {
    setSaving(true)
    try {
      if (userModal.mode === 'create') {
        await api.post('/admin/users', uForm)
      } else {
        await api.put(`/admin/users/${userModal.data.id}`, {
          first_name: uForm.first_name, last_name: uForm.last_name,
          phone: uForm.phone, role: uForm.role, post: uForm.post,
          ai_level: uForm.ai_level || null, activity_sector: userModal.data?.activity_sector,
          is_active: userModal.data?.is_active ?? 1,
        })
      }
      setUserModal(null)
      load()
    } finally { setSaving(false) }
  }

  const deleteUser = async (id) => {
    await api.delete(`/admin/users/${id}`)
    load()
    setConfirmDel(null)
  }

  const toggleActive = async (u) => {
    await api.put(`/admin/users/${u.id}`, {
      first_name: u.first_name, last_name: u.last_name, phone: u.phone,
      role: u.role, post: u.post, ai_level: u.ai_level, activity_sector: u.activity_sector,
      is_active: u.is_active ? 0 : 1,
    })
    load()
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return !q || `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(q)
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-extrabold text-slate-800">Utilisateurs</h1>
        <div className="flex gap-3">
          <input
            className="input-field w-56 text-sm"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button onClick={() => openModal('create')} className="btn-primary text-sm">+ Nouvel utilisateur</button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 hidden lg:table-cell">Poste</th>
                <th className="px-4 py-3 hidden md:table-cell">Rôle</th>
                <th className="px-4 py-3 hidden md:table-cell">Accès</th>
                <th className="px-4 py-3 hidden xl:table-cell">Formations suivies</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">En ligne</th>
                <th className="px-4 py-3 hidden lg:table-cell">Inscrit le</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{u.first_name} {u.last_name}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{u.post || '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell"><Badge color={u.role === 'admin' ? 'saim' : 'slate'}>{u.role}</Badge></td>
                  {/* Accès column — summary badge */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    {u.enrollments && u.enrollments.some(e => e.status === 'paid') ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">✓ Accès complet</span>
                    ) : u.enrollments && u.enrollments.length > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">⏳ Essai</span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  {/* Formations suivies — detailed pills */}
                  <td className="px-4 py-3 hidden xl:table-cell">
                    {u.enrollments && u.enrollments.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {u.enrollments.map(e => (
                          <span key={e.formation_id} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${e.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            <span>{e.icon || '🎓'}</span>
                            <span className="max-w-[80px] truncate">{(e.title_fr || '').split(' ').slice(0, 2).join(' ')}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(u)}>
                      <Badge color={u.is_active ? 'emerald' : 'red'}>{u.is_active ? 'Actif' : 'Inactif'}</Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3"><OnlineDot online={u.is_online} /></td>
                  <td className="px-4 py-3 text-slate-400 hidden lg:table-cell whitespace-nowrap">{fmtDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openModal('edit', u)} className="text-xs text-saim-600 hover:text-saim-800 font-semibold">Modifier</button>
                      <button onClick={() => setConfirmDel({ id: u.id, name: `${u.first_name} ${u.last_name}` })} className="text-xs text-red-500 hover:text-red-700 font-semibold">Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-slate-400 text-sm">Aucun utilisateur trouvé.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {userModal && (
        <Modal title={userModal.mode === 'create' ? 'Nouvel utilisateur' : 'Modifier l\'utilisateur'} onClose={() => setUserModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Prénom</label><input className="input-field" value={uForm.first_name} onChange={e => setUForm(f => ({ ...f, first_name: e.target.value }))} /></div>
              <div><label className="label">Nom</label><input className="input-field" value={uForm.last_name} onChange={e => setUForm(f => ({ ...f, last_name: e.target.value }))} /></div>
            </div>
            <div><label className="label">Email</label><input type="email" className="input-field" value={uForm.email} onChange={e => setUForm(f => ({ ...f, email: e.target.value }))} disabled={userModal.mode === 'edit'} /></div>
            {userModal.mode === 'create' && (
              <div><label className="label">Mot de passe</label><input type="password" className="input-field" value={uForm.password} onChange={e => setUForm(f => ({ ...f, password: e.target.value }))} /></div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Rôle</label>
                <select className="input-field" value={uForm.role} onChange={e => setUForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="user">Utilisateur</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div><label className="label">Téléphone</label><input className="input-field" value={uForm.phone} onChange={e => setUForm(f => ({ ...f, phone: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Poste</label><input className="input-field" value={uForm.post} onChange={e => setUForm(f => ({ ...f, post: e.target.value }))} /></div>
              <div>
                <label className="label">Niveau IA (1-5)</label>
                <input type="number" min={1} max={5} className="input-field" value={uForm.ai_level} onChange={e => setUForm(f => ({ ...f, ai_level: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setUserModal(null)} className="btn-secondary text-sm">Annuler</button>
              <button onClick={saveUser} disabled={saving} className="btn-primary text-sm">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
            </div>
          </div>
        </Modal>
      )}

      {confirmDel && (
        <Confirm
          message={`Supprimer l'utilisateur "${confirmDel.name}" ?`}
          onConfirm={() => deleteUser(confirmDel.id)}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  )
}

// ─── Section: Demandes de devis ───────────────────────────────────────────────
function SectionQuotes() {
  const [quotes, setQuotes]     = useState([])
  const [expanded, setExpanded] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)

  const load = useCallback(() => {
    api.get('/admin/quotes').then(r => setQuotes(r.data)).catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  const deleteQuote = async (id) => {
    await api.delete(`/admin/quotes/${id}`)
    load()
    setConfirmDel(null)
    if (expanded === id) setExpanded(null)
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-800 mb-6">Demandes de devis</h1>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3 whitespace-nowrap">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(q => (
                <>
                  <tr
                    key={q.id}
                    className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer"
                    onClick={() => setExpanded(expanded === q.id ? null : q.id)}
                  >
                    <td className="px-4 py-3 font-medium">{q.name}</td>
                    <td className="px-4 py-3 text-slate-500">{q.email}</td>
                    <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{q.message}</td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{fmtDateTime(q.created_at)}</td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setConfirmDel({ id: q.id, name: q.name })} className="text-xs text-red-500 hover:text-red-700 font-semibold">Supprimer</button>
                    </td>
                  </tr>
                  {expanded === q.id && (
                    <tr key={`exp-${q.id}`} className="bg-saim-50">
                      <td colSpan={5} className="px-6 py-4">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{q.message}</p>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {quotes.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">Aucune demande de devis.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmDel && (
        <Confirm
          message={`Supprimer la demande de "${confirmDel.name}" ?`}
          onConfirm={() => deleteQuote(confirmDel.id)}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  )
}

// ─── Section: Stats & Revenus ─────────────────────────────────────────────────
function SectionStats() {
  const [kpi, setKpi]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/kpi').then(r => setKpi(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="card p-5 h-28" />)}
      </div>
      <div className="card p-5 h-48" />
    </div>
  )

  const { total_users, paid_users, trial_users, total_revenue,
          monthly_revenue, daily_visits, monthly_visits,
          paid_visit_freq, formation_stats } = kpi || {}

  const today = daily_visits?.[0]
  const thisMonth = monthly_visits?.[0]

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold text-slate-800">Stats &amp; Revenus</h1>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: '👥', label: 'Utilisateurs total',  value: total_users ?? '—',  color: 'text-slate-800' },
          { icon: '💳', label: 'Abonnés payants',      value: paid_users ?? '—',   color: 'text-emerald-700' },
          { icon: '⏳', label: 'En mode essai',         value: trial_users ?? '—',  color: 'text-amber-700' },
          { icon: '💰', label: 'Revenu total',          value: fmtCFA(total_revenue), color: 'text-saim-700' },
        ].map(c => (
          <div key={c.label} className="card p-5">
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className={`text-2xl font-extrabold ${c.color}`}>{c.value}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Visits KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: '📅', label: "Visites aujourd'hui",   value: today?.visits ?? 0,          sub: `${today?.unique_users ?? 0} utilisateurs uniques` },
          { icon: '📆', label: 'Visites ce mois',        value: thisMonth?.visits ?? 0,      sub: `${thisMonth?.unique_users ?? 0} utilisateurs uniques` },
          { icon: '🌐', label: 'Visites totales (web)',  value: (daily_visits || []).reduce((s, d) => s + d.visits, 0), sub: '30 derniers jours' },
          { icon: '🔁', label: 'Moy. visites / payant', value: paid_visit_freq?.length
              ? Math.round(paid_visit_freq.reduce((s, u) => s + u.visit_count, 0) / paid_visit_freq.length)
              : '—',
            sub: 'par utilisateur payant' },
        ].map(c => (
          <div key={c.label} className="card p-5">
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className="text-2xl font-extrabold text-slate-800">{c.value}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">{c.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue per month */}
        <div className="card p-6">
          <h2 className="text-base font-extrabold text-slate-700 mb-4">Revenu par mois</h2>
          {!monthly_revenue?.length ? (
            <p className="text-sm text-slate-400">Aucun paiement confirmé.</p>
          ) : (
            <div className="space-y-2">
              {monthly_revenue.map(r => (
                <div key={r.month} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-20 flex-shrink-0">{fmtMonth(r.month)}</span>
                  <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-saim-500 rounded-full"
                      style={{ width: `${Math.min(100, (r.total / (monthly_revenue[0]?.total || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 w-28 text-right flex-shrink-0">{fmtCFA(r.total)}</span>
                  <span className="text-xs text-slate-400 flex-shrink-0">({r.count} pmt)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily visits chart */}
        <div className="card p-6">
          <h2 className="text-base font-extrabold text-slate-700 mb-4">Visites journalières — 30 derniers jours</h2>
          {!daily_visits?.length ? (
            <p className="text-sm text-slate-400">Aucune donnée de visite (les visites seront comptées dès que des utilisateurs se connectent).</p>
          ) : (
            <div className="space-y-1.5">
              {daily_visits.slice(0, 10).map(d => (
                <div key={d.day} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-20 flex-shrink-0">{fmtDate(d.day)}</span>
                  <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full"
                      style={{ width: `${Math.min(100, (d.visits / (daily_visits[0]?.visits || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 w-10 text-right flex-shrink-0">{d.visits}</span>
                  <span className="text-xs text-slate-400 flex-shrink-0">{d.unique_users} uniq.</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Formation enrollment breakdown */}
      {formation_stats?.length > 0 && (
        <div className="card p-6">
          <h2 className="text-base font-extrabold text-slate-700 mb-4">Inscriptions par formation</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {formation_stats.map(f => {
              const tc = FORMATION_COLORS[f.color] || FORMATION_COLORS.blue
              return (
                <div key={f.id} className={`rounded-xl p-4 border ${tc.bg} border-transparent`}>
                  <div className="text-2xl mb-1">{f.icon || '🎓'}</div>
                  <div className="text-sm font-bold text-slate-800 mb-2 leading-tight">{f.title_fr}</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Payants</span>
                      <span className={`font-bold ${tc.text}`}>{f.paid_count}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Essai</span>
                      <span className="font-bold text-amber-600">{f.trial_count}</span>
                    </div>
                    <div className="flex justify-between text-xs border-t border-slate-200 pt-1 mt-1">
                      <span className="text-slate-500">Total</span>
                      <span className="font-bold text-slate-700">{f.total_enrolled}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Paid user visit frequency */}
      {paid_visit_freq?.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-slate-700">Fréquence de visite — utilisateurs payants</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  <th className="px-4 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Visites</th>
                  <th className="px-4 py-3 hidden md:table-cell">Première visite</th>
                  <th className="px-4 py-3 hidden md:table-cell">Dernière visite</th>
                </tr>
              </thead>
              <tbody>
                {paid_visit_freq.map(u => (
                  <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{u.first_name} {u.last_name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-saim-500 rounded-full"
                            style={{ width: `${Math.min(100, (u.visit_count / (paid_visit_freq[0]?.visit_count || 1)) * 100)}%` }}
                          />
                        </div>
                        <span className="font-bold text-saim-700">{u.visit_count}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{fmtDate(u.first_visit)}</td>
                    <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{fmtDate(u.last_visit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Section: Progression ─────────────────────────────────────────────────────
function fmtMinutes(seconds) {
  if (!seconds) return '0 min'
  const m = Math.round(seconds / 60)
  if (m < 60) return `${m} min`
  return `${Math.floor(m / 60)}h ${m % 60}min`
}

const FORMATION_COLORS = {
  blue:   { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  green:  { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500'  },
}

function SectionProgress() {
  const [data, setData]               = useState([])
  const [timeStats, setTimeStats]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [expanded, setExpanded]       = useState(null)
  const [resetModal, setResetModal]   = useState(null)
  const [resetting, setResetting]     = useState(false)
  const [filterFormation, setFilterFormation] = useState('all')

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      api.get('/admin/progress'),
      api.get('/admin/time-stats'),
    ]).then(([prog, time]) => {
      setData(prog.data)
      setTimeStats(time.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const resetProgress = async (userId, scope, moduleId = null) => {
    setResetting(true)
    try {
      await api.delete(`/admin/users/${userId}/progress`, {
        data: scope === 'all' ? { scope: 'all' } : { scope: 'module', module_id: moduleId }
      })
      load()
      setResetModal(null)
    } finally {
      setResetting(false)
    }
  }

  // Derive formation list from data for the filter tabs
  const formations = data.reduce((acc, u) => {
    u.modules.forEach(m => {
      if (m.formation_id && !acc.find(f => f.id === m.formation_id)) {
        acc.push({ id: m.formation_id, title: m.formation_title, color: m.formation_color, icon: m.formation_icon })
      }
    })
    return acc
  }, [])

  const filteredData = filterFormation === 'all'
    ? data
    : data.filter(u => u.enrollments && u.enrollments.some(e => e.formation_id === filterFormation))

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-800 mb-4">Progression des apprenants</h1>

      {/* Formation filter tabs */}
      {formations.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterFormation('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterFormation === 'all' ? 'bg-saim-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Toutes les formations ({data.length})
          </button>
          {formations.map(f => {
            const tc = FORMATION_COLORS[f.color] || FORMATION_COLORS.blue
            const count = data.filter(u => u.enrollments && u.enrollments.some(e => e.formation_id === f.id)).length
            return (
              <button
                key={f.id}
                onClick={() => setFilterFormation(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterFormation === f.id ? `${tc.bg} ${tc.text}` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {f.icon} {f.title} ({count})
              </button>
            )
          })}
        </div>
      )}

      {loading && (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-4 flex items-center gap-4">
              <div className="w-4 h-4 bg-slate-200 rounded" />
              <div className="flex-1 h-4 bg-slate-200 rounded" />
              <div className="w-24 h-3 bg-slate-200 rounded" />
              <div className="w-10 h-5 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      )}
      <div className="space-y-3">
        {!loading && filteredData.map(u => (
          <div key={u.id} className="card overflow-hidden">
            {/* Row header */}
            <div className="flex items-center gap-4 p-4 hover:bg-slate-50">
              <span
                className="text-slate-400 text-xs cursor-pointer"
                onClick={() => setExpanded(expanded === u.id ? null : u.id)}
              >
                {expanded === u.id ? '▼' : '▶'}
              </span>
              <div
                className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                onClick={() => setExpanded(expanded === u.id ? null : u.id)}
              >
                <OnlineDot online={u.is_online} />
                <div>
                  <span className="font-semibold text-slate-800 truncate">{u.first_name} {u.last_name}</span>
                  {/* Enrollment badges */}
                  {u.enrollments && u.enrollments.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {u.enrollments.map(e => {
                        const tc = FORMATION_COLORS[e.color] || FORMATION_COLORS.blue
                        return (
                          <span key={e.formation_id} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-semibold ${e.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : `${tc.bg} ${tc.text}`}`}>
                            <span>{e.icon || '🎓'}</span>
                            <span className="hidden sm:inline max-w-[70px] truncate">{e.title_fr}</span>
                            <span className="font-bold">{e.status === 'paid' ? '· Complet' : '· Essai'}</span>
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Module progress chips */}
              <div className="hidden md:flex gap-2 flex-wrap max-w-xs">
                {u.modules.filter(m => m.total_lessons > 0).map(m => {
                  const tc = FORMATION_COLORS[m.formation_color] || FORMATION_COLORS.blue
                  return (
                    <div key={m.module_id} title={`${m.formation_title} — ${m.module_title}`} className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${tc.bg} ${tc.text}`}>
                      {m.formation_icon} {m.completed}/{m.total_lessons}
                      {m.quiz_passed && <span className="ml-1">✓</span>}
                    </div>
                  )
                })}
              </div>

              {/* Overall % */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                  <div className="h-full bg-saim-500 rounded-full" style={{ width: `${u.percent}%` }} />
                </div>
                <span className="text-sm font-bold text-saim-700 w-10 text-right">{u.percent}%</span>
              </div>

              <span className="text-xs text-slate-400 hidden lg:block whitespace-nowrap">{fmtDate(u.last_activity)}</span>

              {/* Reset button */}
              <button
                onClick={e => { e.stopPropagation(); setResetModal({ user: u }) }}
                className="flex-shrink-0 text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50 transition-all"
                title="Réinitialiser la progression"
              >
                🔄 Réinit.
              </button>
            </div>

            {/* Expanded detail */}
            {expanded === u.id && (
              <div className="border-t border-slate-100 p-4">
                {u.modules.filter(m => m.total_lessons > 0).map(m => {
                  const tc = FORMATION_COLORS[m.formation_color] || FORMATION_COLORS.blue
                  return (
                  <div key={m.module_id} className="mb-4 last:mb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${tc.bg} ${tc.text}`}>{m.formation_icon} {m.formation_title}</span>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{m.module_title}</h3>
                      </div>
                      <button
                        onClick={() => resetProgress(u.id, 'module', m.module_id)}
                        disabled={resetting}
                        className="text-xs text-orange-500 hover:text-orange-700 font-semibold px-2 py-0.5 rounded hover:bg-orange-50 transition-all"
                        title="Réinitialiser ce module uniquement"
                      >
                        🔄 Réinit. ce module
                      </button>
                    </div>
                    <div className="space-y-1">
                      {m.lessons.map(l => (
                        <div key={l.lesson_id} className="flex items-center gap-3 text-xs text-slate-600 py-1 border-b border-slate-50">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs ${l.completed ? 'bg-emerald-500' : l.started_at ? 'bg-amber-400' : 'bg-slate-200'}`}>
                            {l.completed ? '✓' : l.started_at ? '…' : ''}
                          </span>
                          <span className="flex-1">{l.title_fr}</span>
                          <span className="text-slate-400 hidden sm:block">Début: {fmtDate(l.started_at)}</span>
                          <span className="text-slate-400 hidden sm:block">Fin: {fmtDate(l.completed_at)}</span>
                          {!l.completed && (
                            <button
                              onClick={() => api.post(`/admin/users/${u.id}/progress/complete`, { lesson_id: l.lesson_id }).then(load)}
                              className="flex-shrink-0 text-xs text-emerald-600 hover:text-emerald-800 font-bold px-2 py-0.5 rounded hover:bg-emerald-50 transition-all"
                              title="Valider cette leçon"
                            >✓ Valider</button>
                          )}
                        </div>
                      ))}
                    </div>
                    {m.quiz_score !== null && (
                      <div className={`mt-2 text-xs px-3 py-1.5 rounded-lg inline-block ${m.quiz_passed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        Quiz: {m.quiz_score}/{m.quiz_total} {m.quiz_passed ? '✓ Réussi' : '✗ Échoué'}
                      </div>
                    )}
                    {/* Time spent per section type */}
                    {(() => {
                      const rows = timeStats.filter(t => t.user_id === u.id && t.module_id === m.module_id)
                      if (!rows.length) return null
                      const labels = { lesson: '📖 Leçons', quiz: '📝 Quiz', exercise: '📋 Exercice', question: '💬 Q&A' }
                      return (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {rows.map(t => (
                            <span key={t.section_type} className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                              {labels[t.section_type] || t.section_type} · {fmtMinutes(t.total_seconds)}
                            </span>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
        {!loading && data.length === 0 && <p className="text-sm text-slate-400">Aucun apprenant.</p>}
      </div>

      {/* Reset modal */}
      {resetModal && (
        <Modal title={`Réinitialiser — ${resetModal.user.first_name} ${resetModal.user.last_name}`} onClose={() => setResetModal(null)}>
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-800 mb-1">⚠️ Action irréversible</p>
              <p className="text-xs text-amber-700">La progression supprimée ne peut pas être récupérée. L'apprenant devra recommencer les leçons, quiz et exercices concernés.</p>
            </div>

            <p className="text-sm text-slate-600">Que souhaitez-vous réinitialiser pour <strong>{resetModal.user.first_name}</strong> ?</p>

            {/* Per-module reset */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Par module</p>
              {resetModal.user.modules.map(m => (
                <div key={m.module_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-sm font-medium text-slate-700">{m.module_title}</span>
                    <span className="text-xs text-slate-400 ml-2">{m.completed}/{m.total_lessons} leçons{m.quiz_passed ? ' · Quiz ✓' : ''}</span>
                  </div>
                  <button
                    onClick={() => resetProgress(resetModal.user.id, 'module', m.module_id)}
                    disabled={resetting || (m.completed === 0 && !m.quiz_passed)}
                    className="text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 font-bold px-3 py-1.5 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    🔄 Réinit. module
                  </button>
                </div>
              ))}
            </div>

            {/* Full reset */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Tout le parcours</p>
              <button
                onClick={() => resetProgress(resetModal.user.id, 'all')}
                disabled={resetting}
                className="w-full inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-3 rounded-xl transition-all disabled:opacity-50"
              >
                🗑️ {resetting ? 'Réinitialisation...' : 'Réinitialiser TOUT le parcours'}
              </button>
              <p className="text-xs text-slate-400 text-center mt-1">Leçons + quiz + exercices de tous les modules</p>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setResetModal(null)} className="btn-secondary text-sm">Annuler</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── Section: Questions Q&A ───────────────────────────────────────────────────
function SectionQuestions() {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [saving, setSaving] = useState({})
  const [confirmDel, setConfirmDel] = useState(null)

  const load = useCallback(() => {
    api.get('/admin/questions').then(r => setQuestions(r.data)).catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  const sendAnswer = async (qId) => {
    const text = answers[qId]?.trim()
    if (!text) return
    setSaving(s => ({ ...s, [qId]: true }))
    try {
      await api.put(`/admin/questions/${qId}/answer`, { answer: text })
      load()
      setAnswers(a => ({ ...a, [qId]: '' }))
    } finally {
      setSaving(s => ({ ...s, [qId]: false }))
    }
  }

  const deleteQ = async (id) => {
    await api.delete(`/admin/questions/${id}`)
    load()
    setConfirmDel(null)
  }

  const unanswered = questions.filter(q => !q.answer).length

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800">Questions des apprenants</h1>
        {unanswered > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">{unanswered} sans réponse</span>
        )}
      </div>

      <div className="space-y-4">
        {questions.length === 0 && <p className="text-sm text-slate-400">Aucune question posée.</p>}
        {questions.map(q => (
          <div key={q.id} className="card p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-slate-800 text-sm">{q.user_name}</span>
                  <span className="text-xs text-slate-400">{q.user_email}</span>
                  <span className="text-xs bg-saim-100 text-saim-700 font-semibold px-2 py-0.5 rounded-full">{q.module_title_fr}</span>
                  <span className="text-xs text-slate-400">{fmtDateTime(q.created_at)}</span>
                </div>
                <p className="text-slate-800">{q.question}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge color={q.answer ? 'emerald' : 'amber'}>{q.answer ? 'Répondu' : 'En attente'}</Badge>
                <button onClick={() => setConfirmDel({ id: q.id, name: q.question.slice(0, 40) })} className="text-xs text-red-400 hover:text-red-600 font-semibold px-1">✕</button>
              </div>
            </div>

            {q.answer ? (
              <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Réponse</p>
                <p className="text-sm text-slate-700">{q.answer}</p>
                <p className="text-xs text-slate-400 mt-1">{fmtDateTime(q.answered_at)}</p>
              </div>
            ) : (
              <div className="mt-3 flex gap-2">
                <textarea
                  className="input-field flex-1 resize-none text-sm"
                  rows={2}
                  placeholder="Votre réponse..."
                  value={answers[q.id] || ''}
                  onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                />
                <button
                  onClick={() => sendAnswer(q.id)}
                  disabled={saving[q.id] || !answers[q.id]?.trim()}
                  className="btn-primary text-sm self-end flex-shrink-0"
                >
                  {saving[q.id] ? '...' : 'Répondre'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {confirmDel && (
        <Confirm
          message={`Supprimer la question "${confirmDel.name}..." ?`}
          onConfirm={() => deleteQ(confirmDel.id)}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  )
}

// ─── Section: Exercices ───────────────────────────────────────────────────────
function SectionExercises() {
  const [exercises, setExercises]     = useState([])
  const [modules, setModules]         = useState([])
  const [expanded, setExpanded]       = useState({})
  const [exQuestions, setExQuestions] = useState({})
  const [exModal, setExModal]         = useState(null)
  const [qModal, setQModal]           = useState(null) // { exerciseId }
  const [subsModal, setSubsModal]     = useState(null) // { exercise }
  const [submissions, setSubmissions] = useState([])
  const [gradeModal, setGradeModal]   = useState(null) // submission
  const [confirmDel, setConfirmDel]   = useState(null)
  const [saving, setSaving]           = useState(false)

  const [exForm, setExForm] = useState({ module_id: '', title_fr: '', title_en: '', instructions_fr: '', instructions_en: '', is_published: true })
  const [qForm, setQForm]   = useState({ question_fr: '', question_en: '', order_index: 0 })
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' })

  const load = useCallback(() => {
    api.get('/admin/exercises').then(r => setExercises(r.data)).catch(() => {})
    api.get('/admin/modules').then(r => setModules(r.data)).catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  const toggleExpand = async (exId) => {
    setExpanded(e => ({ ...e, [exId]: !e[exId] }))
    if (!exQuestions[exId]) {
      const ex = exercises.find(e => e.id === exId)
      if (ex) {
        const r = await api.get(`/exercises/module/${ex.module_id}`).catch(() => null)
        if (r) setExQuestions(q => ({ ...q, [exId]: r.data.questions || [] }))
      }
    }
  }

  const reloadQuestions = async (exId) => {
    const ex = exercises.find(e => e.id === exId)
    if (!ex) return
    const r = await api.get(`/exercises/module/${ex.module_id}`).catch(() => null)
    if (r) setExQuestions(q => ({ ...q, [exId]: r.data.questions || [] }))
  }

  const openExModal = (mode, data = null) => {
    setExForm(data ? {
      module_id: data.module_id,
      title_fr: data.title_fr, title_en: data.title_en,
      instructions_fr: data.instructions_fr || '', instructions_en: data.instructions_en || '',
      is_published: data.is_published === 1,
    } : { module_id: modules[0]?.id || '', title_fr: '', title_en: '', instructions_fr: '', instructions_en: '', is_published: true })
    setExModal({ mode, data })
  }

  const saveExercise = async () => {
    setSaving(true)
    try {
      if (exModal.mode === 'create') {
        await api.post('/admin/exercises', { ...exForm, is_published: exForm.is_published ? 1 : 0 })
      } else {
        await api.put(`/admin/exercises/${exModal.data.id}`, { ...exForm, is_published: exForm.is_published ? 1 : 0 })
      }
      setExModal(null)
      load()
    } finally { setSaving(false) }
  }

  const deleteExercise = async (id) => {
    await api.delete(`/admin/exercises/${id}`)
    load()
    setConfirmDel(null)
  }

  const openQModal = (exerciseId) => {
    setQForm({ question_fr: '', question_en: '', order_index: 0 })
    setQModal({ exerciseId })
  }

  const saveQuestion = async () => {
    setSaving(true)
    try {
      await api.post(`/admin/exercises/${qModal.exerciseId}/questions`, qForm)
      setQModal(null)
      reloadQuestions(qModal.exerciseId)
    } finally { setSaving(false) }
  }

  const deleteQuestion = async (qId, exId) => {
    await api.delete(`/admin/exercise-questions/${qId}`)
    reloadQuestions(exId)
    setConfirmDel(null)
  }

  const openSubmissions = async (exercise) => {
    const [subsRes, qRes] = await Promise.all([
      api.get(`/admin/exercises/${exercise.id}/submissions`),
      api.get(`/admin/exercises/${exercise.id}/questions`),
    ])
    setSubmissions(subsRes.data)
    setExQuestions(q => ({ ...q, [exercise.id]: qRes.data }))
    setSubsModal(exercise)
  }

  const openGradeModal = (sub) => {
    setGradeForm({ grade: sub.grade || '', feedback: sub.feedback || '' })
    setGradeModal(sub)
  }

  const saveGrade = async () => {
    setSaving(true)
    try {
      await api.put(`/admin/submissions/${gradeModal.id}/grade`, gradeForm)
      setGradeModal(null)
      if (subsModal) openSubmissions(subsModal)
    } finally { setSaving(false) }
  }

  const grouped = modules.map(m => ({
    module: m,
    exercises: exercises.filter(e => e.module_id === m.id),
  })).filter(g => g.exercises.length > 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800">Exercices</h1>
        <button onClick={() => openExModal('create')} className="btn-primary text-sm">+ Nouvel exercice</button>
      </div>

      <div className="space-y-6">
        {grouped.map(g => (
          <div key={g.module.id}>
            <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest mb-3">{g.module.title_fr}</h2>
            <div className="space-y-3">
              {g.exercises.map(ex => (
                <div key={ex.id} className="card overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <span className="text-slate-400 text-xs cursor-pointer" onClick={() => toggleExpand(ex.id)}>{expanded[ex.id] ? '▼' : '▶'}</span>
                    <div className="flex-1 cursor-pointer" onClick={() => toggleExpand(ex.id)}>
                      <span className="font-bold text-slate-800">{ex.title_fr}</span>
                      <span className="text-xs text-slate-400 ml-2">{ex.question_count} question(s)</span>
                    </div>
                    <Badge color={ex.is_published ? 'emerald' : 'slate'}>{ex.is_published ? 'Publié' : 'Masqué'}</Badge>
                    <button onClick={() => openExModal('edit', ex)} className="text-xs text-saim-600 hover:text-saim-800 font-semibold px-2 py-1 rounded hover:bg-saim-50">Modifier</button>
                    <button onClick={() => openQModal(ex.id)} className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold px-2 py-1 rounded hover:bg-emerald-50">+ Question</button>
                    <button onClick={() => openSubmissions(ex)} className="text-xs text-violet-600 hover:text-violet-800 font-semibold px-2 py-1 rounded hover:bg-violet-50">Soumissions</button>
                    <button onClick={() => setConfirmDel({ type: 'exercise', id: ex.id, name: ex.title_fr })} className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50">Supprimer</button>
                  </div>

                  {expanded[ex.id] && (
                    <div className="border-t border-slate-100">
                      {(exQuestions[ex.id] || []).length === 0 ? (
                        <p className="text-sm text-slate-400 px-6 py-4">Aucune question.</p>
                      ) : (exQuestions[ex.id] || []).map((q, qi) => (
                        <div key={q.id} className="flex items-start gap-3 px-6 py-3 border-b border-slate-50 last:border-0">
                          <span className="text-xs font-bold text-slate-400 mt-0.5 w-5">{qi + 1}.</span>
                          <p className="flex-1 text-sm text-slate-700">{q.question_fr}</p>
                          <button onClick={() => setConfirmDel({ type: 'exquestion', id: q.id, exId: ex.id, name: q.question_fr.slice(0, 40) })} className="text-xs text-red-400 hover:text-red-600 px-1">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {grouped.length === 0 && <p className="text-sm text-slate-400">Aucun exercice créé.</p>}
      </div>

      {/* Exercise modal */}
      {exModal && (
        <Modal title={exModal.mode === 'create' ? 'Nouvel exercice' : 'Modifier l\'exercice'} onClose={() => setExModal(null)} wide>
          <div className="space-y-4">
            <div>
              <label className="label">Module</label>
              <select className="input-field" value={exForm.module_id} onChange={e => setExForm(f => ({ ...f, module_id: e.target.value }))}>
                {modules.map(m => <option key={m.id} value={m.id}>{m.title_fr}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Titre (FR)</label><input className="input-field" value={exForm.title_fr} onChange={e => setExForm(f => ({ ...f, title_fr: e.target.value }))} /></div>
              <div><label className="label">Titre (EN)</label><input className="input-field" value={exForm.title_en} onChange={e => setExForm(f => ({ ...f, title_en: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Instructions (FR)</label><textarea className="input-field resize-none" rows={3} value={exForm.instructions_fr} onChange={e => setExForm(f => ({ ...f, instructions_fr: e.target.value }))} /></div>
              <div><label className="label">Instructions (EN)</label><textarea className="input-field resize-none" rows={3} value={exForm.instructions_en} onChange={e => setExForm(f => ({ ...f, instructions_en: e.target.value }))} /></div>
            </div>
            <div className="flex items-center gap-3"><label className="label mb-0">Publié</label><ToggleSwitch checked={exForm.is_published} onChange={v => setExForm(f => ({ ...f, is_published: v }))} /></div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setExModal(null)} className="btn-secondary text-sm">Annuler</button>
              <button onClick={saveExercise} disabled={saving} className="btn-primary text-sm">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Question modal */}
      {qModal && (
        <Modal title="Ajouter une question" onClose={() => setQModal(null)}>
          <div className="space-y-4">
            <div><label className="label">Question (FR)</label><textarea className="input-field resize-none" rows={3} value={qForm.question_fr} onChange={e => setQForm(f => ({ ...f, question_fr: e.target.value }))} /></div>
            <div><label className="label">Question (EN)</label><textarea className="input-field resize-none" rows={3} value={qForm.question_en} onChange={e => setQForm(f => ({ ...f, question_en: e.target.value }))} /></div>
            <div><label className="label">Ordre</label><input type="number" className="input-field" value={qForm.order_index} onChange={e => setQForm(f => ({ ...f, order_index: +e.target.value }))} /></div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setQModal(null)} className="btn-secondary text-sm">Annuler</button>
              <button onClick={saveQuestion} disabled={saving} className="btn-primary text-sm">{saving ? 'Enregistrement...' : 'Ajouter'}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Submissions modal */}
      {subsModal && (
        <Modal title={`Soumissions — ${subsModal.title_fr}`} onClose={() => setSubsModal(null)} wide>
          <div className="space-y-4">
            {submissions.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <div className="text-3xl mb-2">📭</div>
                <p className="text-sm">Aucune soumission pour cet exercice.</p>
              </div>
            )}
            {submissions.map(sub => {
              const answers = typeof sub.answers === 'object' ? sub.answers : (() => { try { return JSON.parse(sub.answers) } catch { return {} } })()
              const questions = exQuestions[subsModal.id] || []
              return (
                <div key={sub.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-3 p-4 bg-slate-50 border-b border-slate-200">
                    <div>
                      <span className="font-bold text-slate-800">{sub.user_name}</span>
                      <span className="text-xs text-slate-400 ml-2">{sub.user_email}</span>
                      <span className="text-xs text-slate-400 ml-3">Soumis le {fmtDateTime(sub.submitted_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {sub.grade
                        ? <Badge color="emerald">✓ {sub.grade}</Badge>
                        : <Badge color="amber">Non évalué</Badge>}
                      <button
                        onClick={() => openGradeModal(sub)}
                        className="text-xs bg-saim-500 hover:bg-saim-600 text-white font-bold px-3 py-1.5 rounded-full transition-all"
                      >
                        {sub.grade ? '✏️ Modifier' : '📝 Évaluer'}
                      </button>
                    </div>
                  </div>

                  {/* Feedback (if already graded) */}
                  {sub.feedback && (
                    <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100">
                      <span className="text-xs font-bold text-emerald-600">Feedback : </span>
                      <span className="text-xs text-emerald-800">{sub.feedback}</span>
                    </div>
                  )}

                  {/* Q&A answers */}
                  <div className="p-4 space-y-3">
                    {questions.length === 0 && (
                      <p className="text-xs text-slate-400 italic">Questions non chargées.</p>
                    )}
                    {questions.map((q, idx) => {
                      const ans = answers[String(q.id)] || answers[q.id] || ''
                      return (
                        <div key={q.id} className="rounded-xl overflow-hidden border border-slate-200">
                          <div className="bg-saim-50 px-4 py-2 border-b border-slate-200">
                            <span className="text-xs font-extrabold text-saim-700 mr-2">Q{idx + 1}</span>
                            <span className="text-sm font-medium text-slate-700">{q.question_fr}</span>
                          </div>
                          <div className="px-4 py-3 bg-white">
                            {ans
                              ? <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{ans}</p>
                              : <p className="text-sm text-slate-300 italic">Aucune réponse fournie</p>
                            }
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </Modal>
      )}

      {/* Grade modal */}
      {gradeModal && (
        <Modal title="Évaluer la soumission" onClose={() => setGradeModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="label">Note</label>
              <input className="input-field" placeholder="Ex: 15/20, Bien, A+..." value={gradeForm.grade} onChange={e => setGradeForm(f => ({ ...f, grade: e.target.value }))} />
            </div>
            <div>
              <label className="label">Feedback</label>
              <textarea className="input-field resize-none" rows={4} placeholder="Commentaires sur la soumission..." value={gradeForm.feedback} onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))} />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setGradeModal(null)} className="btn-secondary text-sm">Annuler</button>
              <button onClick={saveGrade} disabled={saving} className="btn-primary text-sm">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
            </div>
          </div>
        </Modal>
      )}

      {confirmDel && (
        <Confirm
          message={`Supprimer "${confirmDel.name}" ?`}
          onConfirm={() => {
            if (confirmDel.type === 'exercise') deleteExercise(confirmDel.id)
            else if (confirmDel.type === 'exquestion') deleteQuestion(confirmDel.id, confirmDel.exId)
          }}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  )
}

// ─── Section: Certificats ─────────────────────────────────────────────────────
function SectionCertificates() {
  const [users, setUsers]       = useState([])
  const [expanded, setExpanded] = useState(null)
  const [certs, setCerts]       = useState({})
  const [certModal, setCertModal] = useState(null) // userId
  const [fileUrl, setFileUrl]   = useState('')
  const [saving, setSaving]     = useState(false)

  const load = useCallback(() => {
    api.get('/admin/users').then(r => setUsers(r.data.filter(u => u.role === 'user'))).catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  const loadCerts = async (userId) => {
    const r = await api.get(`/admin/users/${userId}/certificates`)
    setCerts(c => ({ ...c, [userId]: r.data }))
  }

  const toggleExpand = async (userId) => {
    if (expanded === userId) {
      setExpanded(null)
    } else {
      setExpanded(userId)
      if (!certs[userId]) await loadCerts(userId)
    }
  }

  const openSendModal = (userId) => {
    setFileUrl('')
    setCertModal(userId)
  }

  const sendCertificate = async () => {
    if (!fileUrl) return
    setSaving(true)
    try {
      await api.post(`/admin/users/${certModal}/certificate`, { file_url: fileUrl })
      setCertModal(null)
      await loadCerts(certModal)
    } finally { setSaving(false) }
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-800 mb-6">Certificats</h1>

      <div className="space-y-3">
        {users.map(u => (
          <div key={u.id} className="card overflow-hidden">
            <div
              className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50"
              onClick={() => toggleExpand(u.id)}
            >
              <span className="text-slate-400 text-xs">{expanded === u.id ? '▼' : '▶'}</span>
              <div className="flex-1">
                <span className="font-semibold text-slate-800">{u.first_name} {u.last_name}</span>
                <span className="text-xs text-slate-400 ml-2">{u.email}</span>
              </div>
              <div onClick={e => e.stopPropagation()}>
                <button onClick={() => openSendModal(u.id)} className="btn-primary text-xs">
                  Envoyer un certificat
                </button>
              </div>
            </div>

            {expanded === u.id && (
              <div className="border-t border-slate-100 p-4">
                {(certs[u.id] || []).length === 0 ? (
                  <p className="text-sm text-slate-400">Aucun certificat envoyé.</p>
                ) : (
                  <div className="space-y-2">
                    {(certs[u.id] || []).map(c => (
                      <div key={c.id} className="flex items-center justify-between gap-3 bg-slate-50 rounded-xl px-4 py-3">
                        <div>
                          <p className="text-xs text-slate-500">Émis le {fmtDateTime(c.issued_at)}</p>
                        </div>
                        <a
                          href={c.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-saim-600 hover:text-saim-800 font-semibold hover:underline"
                        >
                          Télécharger
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {users.length === 0 && <p className="text-sm text-slate-400">Aucun utilisateur.</p>}
      </div>

      {certModal && (
        <Modal title="Envoyer un certificat" onClose={() => setCertModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="label">Fichier certificat (PDF)</label>
              <div className="flex gap-2 items-start">
                <input
                  className="input-field flex-1"
                  placeholder="URL du fichier..."
                  value={fileUrl}
                  onChange={e => setFileUrl(e.target.value)}
                />
                <FileUploadInput
                  accept=".pdf,application/pdf"
                  label="📄 Téléverser"
                  onUploaded={url => setFileUrl(url)}
                />
              </div>
              {fileUrl && (
                <p className="text-xs text-emerald-600 mt-1 font-semibold">Fichier prêt : {fileUrl}</p>
              )}
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setCertModal(null)} className="btn-secondary text-sm">Annuler</button>
              <button onClick={sendCertificate} disabled={saving || !fileUrl} className="btn-primary text-sm">
                {saving ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── Section: Liste d'attente ─────────────────────────────────────────────────
function SectionWaitlist() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/waitlist').then(r => setRows(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const byFormation = rows.reduce((acc, r) => {
    if (!acc[r.formation_id]) acc[r.formation_id] = { title: r.formation_title, color: r.color, icon: r.icon, members: [] }
    acc[r.formation_id].members.push(r)
    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800">Liste d'attente</h1>
        <span className="text-sm text-slate-400">{rows.length} inscription{rows.length > 1 ? 's' : ''} au total</span>
      </div>

      {loading && <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="card p-4 h-16" />)}</div>}

      {!loading && rows.length === 0 && (
        <div className="card p-8 text-center text-slate-400">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-sm">Aucune inscription en liste d'attente pour l'instant.</p>
        </div>
      )}

      {!loading && Object.entries(byFormation).map(([fid, group]) => {
        const tc = FORMATION_COLORS[group.color] || FORMATION_COLORS.blue
        return (
          <div key={fid} className="card overflow-hidden mb-5">
            <div className={`flex items-center gap-3 px-5 py-3 ${tc.bg}`}>
              <span className="text-xl">{group.icon || '🎓'}</span>
              <h2 className={`font-extrabold text-sm ${tc.text}`}>{group.title}</h2>
              <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-white/60 ${tc.text}`}>{group.members.length} personne{group.members.length > 1 ? 's' : ''}</span>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  <th className="px-4 py-2">Nom</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2 hidden md:table-cell">Téléphone</th>
                  <th className="px-4 py-2 hidden lg:table-cell">Inscrit le</th>
                </tr>
              </thead>
              <tbody>
                {group.members.map(m => (
                  <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-medium">{m.first_name} {m.last_name}</td>
                    <td className="px-4 py-2.5 text-slate-500">{m.email}</td>
                    <td className="px-4 py-2.5 text-slate-400 hidden md:table-cell">{m.phone || '—'}</td>
                    <td className="px-4 py-2.5 text-slate-400 hidden lg:table-cell">{fmtDate(m.joined_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main AdminDashboard ──────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard',     label: 'Tableau de bord',      icon: '📊' },
  { id: 'stats',         label: 'Stats & Revenus',       icon: '💰' },
  { id: 'formations',    label: 'Formations',            icon: '🎓' },
  { id: 'modules',       label: 'Modules & Cours',       icon: '📚' },
  { id: 'quizzes',       label: 'Quiz',                  icon: '📝' },
  { id: 'exercises',     label: 'Exercices',             icon: '📋' },
  { id: 'questions',     label: 'Questions',             icon: '💬' },
  { id: 'users',         label: 'Utilisateurs',          icon: '👥' },
  { id: 'certificates',  label: 'Certificats',           icon: '🏆' },
  { id: 'quotes',        label: 'Demandes de devis',     icon: '📨' },
  { id: 'progress',      label: 'Progression',           icon: '📈' },
  { id: 'waitlist',      label: "Liste d'attente",        icon: '⏳' },
]

export default function AdminDashboard({ onGoLanding }) {
  const { logout } = useAuth()
  const [section, setSection] = useState('dashboard')
  const [unansweredCount, setUnansweredCount] = useState(0)

  const handleLogout = () => {
    logout()
    onGoLanding()
  }

  // Poll unanswered questions count for badge
  useEffect(() => {
    const fetchCount = () => {
      api.get('/admin/questions').then(r => {
        setUnansweredCount(r.data.filter(q => !q.answer).length)
      }).catch(() => {})
    }
    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const renderSection = () => {
    switch (section) {
      case 'dashboard':    return <SectionDashboard />
      case 'stats':        return <SectionStats />
      case 'formations':   return <SectionFormations />
      case 'modules':      return <SectionModules />
      case 'quizzes':      return <SectionQuiz />
      case 'exercises':    return <SectionExercises />
      case 'questions':    return <SectionQuestions />
      case 'users':        return <SectionUsers />
      case 'certificates': return <SectionCertificates />
      case 'quotes':       return <SectionQuotes />
      case 'progress':     return <SectionProgress />
      case 'waitlist':     return <SectionWaitlist />
      default:             return <SectionDashboard />
    }
  }

  const currentNav = NAV_ITEMS.find(n => n.id === section)

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ── Sidebar ── */}
      <aside className="w-60 flex-shrink-0 bg-saim-800 text-white flex flex-col fixed top-0 left-0 h-full z-40">
        {/* Logo */}
        <div className="p-6 border-b border-saim-700">
          <img src="/images/saimlogo.png" alt="SAIM" className="h-8 brightness-0 invert" />
          <p className="text-xs text-saim-300 mt-1 font-medium">Administration</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all text-left ${
                section === item.id
                  ? 'bg-saim-700 text-white border-r-4 border-amber-400'
                  : 'text-saim-200 hover:bg-saim-700 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.id === 'questions' && unansweredCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                  {unansweredCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-saim-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-saim-200 hover:text-white hover:bg-saim-700 rounded-xl transition-all"
          >
            <span>🚪</span> Se déconnecter
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center gap-3 sticky top-0 z-30">
          <span className="text-xl">{currentNav?.icon}</span>
          <h1 className="text-base font-extrabold text-slate-700">{currentNav?.label}</h1>
          <div className="ml-auto">
            <span className="section-chip">Admin</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8">
          {renderSection()}
        </main>
      </div>
    </div>
  )
}
