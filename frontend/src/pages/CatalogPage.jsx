import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { useT } from '../i18n/translations'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../api/axios'

// ─── Shared icon paths ────────────────────────────────────────────────────────
const IP = {
  price: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  globe: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
  badge: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  clip:  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  bars:  "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  book:  "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
}

function SvgIcon({ d, cls = 'w-4 h-4' }) {
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={d} />
    </svg>
  )
}

const THEME = {
  blue:   { bar: 'bg-blue-600',   tag: 'bg-blue-50 text-blue-700',   iconBg: 'bg-blue-100 text-blue-600',   ring: 'ring-blue-200'   },
  orange: { bar: 'bg-orange-500', tag: 'bg-orange-50 text-orange-700', iconBg: 'bg-orange-100 text-orange-600', ring: 'ring-orange-200' },
  purple: { bar: 'bg-purple-600', tag: 'bg-purple-50 text-purple-700', iconBg: 'bg-purple-100 text-purple-600', ring: 'ring-purple-200' },
  green:  { bar: 'bg-green-600',  tag: 'bg-green-50 text-green-700',  iconBg: 'bg-green-100 text-green-600',  ring: 'ring-green-200'  },
}
function theme(color) { return THEME[color] || THEME.blue }

// ─── YouTube embed helper ─────────────────────────────────────────────────────
function getEmbedUrl(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
}

// ─── Formation Card (grid) ────────────────────────────────────────────────────
function FormationCard({ formation, lang, onClick }) {
  const t = theme(formation.color)
  const title = lang === 'en' && formation.title_en ? formation.title_en : formation.title_fr
  const desc  = lang === 'en' && formation.description_en ? formation.description_en : formation.description_fr
  const hasContent = (formation.module_count || 0) > 0
  const audience = Array.isArray(formation.target_audience)
    ? formation.target_audience
    : (formation.target_audience || '').split(',').map(s => s.trim()).filter(Boolean)

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col"
      onClick={onClick}
    >
      <div className="relative h-44 overflow-hidden flex-shrink-0">
        {formation.image_url
          ? <img src={formation.image_url} alt={title} className="w-full h-full object-cover" />
          : <div className={`w-full h-full ${t.iconBg} flex items-center justify-center text-6xl opacity-60`}>{formation.icon || '🤖'}</div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${t.bar}`} />
        {!hasContent && (
          <span className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400 text-white shadow">
            {lang === 'fr' ? 'Bientôt' : 'Soon'}
          </span>
        )}
        <div className={`absolute bottom-3 left-3 w-9 h-9 rounded-xl ${t.iconBg} flex items-center justify-center text-xl shadow-md border-2 border-white`}>
          {formation.icon || '🤖'}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="font-extrabold text-slate-800 text-sm leading-snug">{title}</h3>
        {desc && <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{desc}</p>}

        <div className="flex flex-wrap gap-1 mt-auto">
          {audience.slice(0, 3).map((a, i) => (
            <span key={i} className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.tag}`}>{a}</span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
          {formation.duration_hours > 0 && (
            <span className="flex items-center gap-1">
              <SvgIcon d={IP.clock} cls="w-3.5 h-3.5" />{formation.duration_hours}h
            </span>
          )}
          {formation.level && <span className="capitalize">{formation.level}</span>}
          <span className="ml-auto font-bold text-slate-600">{(formation.price || 25500).toLocaleString('fr-FR')} FCFA</span>
        </div>

        <button className={`w-full ${t.bar} hover:opacity-90 text-white font-bold py-2.5 rounded-xl text-xs transition-all`}>
          {lang === 'fr' ? 'En savoir plus' : 'Learn more'} →
        </button>
      </div>
    </div>
  )
}

// ─── Formation Detail (public, inline) ───────────────────────────────────────
function FormationDetail({ formation, lang, onBack, onLoginOrDash }) {
  const hasContent = (formation.module_count || 0) > 0
  const objectives = Array.isArray(formation.learning_objectives) ? formation.learning_objectives : []
  const programme  = Array.isArray(formation.programme)           ? formation.programme           : []
  const embedUrl   = getEmbedUrl(formation.teaser_url)
  const title      = lang === 'en' && formation.title_en ? formation.title_en : formation.title_fr
  const t          = theme(formation.color)

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
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          {lang === 'fr' ? 'Retour' : 'Back'}
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="text-3xl mb-2">{formation.icon || '🤖'}</div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-3">{title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-white/80 text-sm">
            {formation.level && (
              <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full capitalize">
                <SvgIcon d={IP.bars} cls="w-3.5 h-3.5" />{formation.level}
              </span>
            )}
            {formation.duration_hours > 0 && (
              <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full">
                <SvgIcon d={IP.clock} cls="w-3.5 h-3.5" />{formation.duration_hours}h
              </span>
            )}
            {hasContent && (
              <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full">
                <SvgIcon d={IP.book} cls="w-3.5 h-3.5" />{formation.module_count} modules
              </span>
            )}
          </div>
        </div>
        <div className={`absolute top-0 left-0 right-0 h-1 ${t.bar}`} />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Teaser video */}
        {embedUrl && (
          <section>
            <h2 className="text-lg font-extrabold text-slate-800 mb-4">{lang === 'fr' ? 'Vidéo de présentation' : 'Preview video'}</h2>
            <div className="aspect-video rounded-2xl overflow-hidden shadow-lg">
              <iframe src={embedUrl} title="Teaser" className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          </section>
        )}

        {/* Infos utiles — horizontal */}
        <section className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
          <div className="flex flex-wrap gap-x-6 gap-y-4">
            {[
              { type: 'price', label: lang === 'fr' ? 'Prix' : 'Price',         value: `${(formation.price || 25500).toLocaleString('fr-FR')} FCFA` },
              { type: 'clock', label: lang === 'fr' ? 'Durée' : 'Duration',     value: `${formation.duration_hours || 3}h` },
              { type: 'globe', label: lang === 'fr' ? 'Format' : 'Format',      value: lang === 'fr' ? '100% en ligne' : '100% online' },
              { type: 'badge', label: lang === 'fr' ? 'Certificat' : 'Certificate', value: 'Certificat SAIM AI' },
              ...(formation.level         ? [{ type: 'bars', label: 'Niveau', value: formation.level }] : []),
              ...(formation.prerequisites ? [{ type: 'clip', label: lang === 'fr' ? 'Prérequis' : 'Prerequisites', value: formation.prerequisites }] : []),
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="w-8 h-8 flex-shrink-0 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  <SvgIcon d={IP[item.type]} />
                </span>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm font-bold text-slate-800 capitalize">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Descriptif */}
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
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  </span>
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
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold text-white ${t.bar}`}>{i + 1}</span>
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

        {/* CTA */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {!hasContent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="font-extrabold text-slate-800 mb-2">
                {lang === 'fr' ? 'Formation bientôt disponible' : 'Coming soon'}
              </h3>
              <p className="text-sm text-slate-500 mb-5">
                {lang === 'fr'
                  ? "Cette formation est en cours de préparation. Inscrivez-vous dès maintenant pour être notifié(e) en premier dès son lancement."
                  : 'This course is being prepared. Sign up now to be notified first when it launches.'}
              </p>
              <button
                onClick={() => onLoginOrDash(formation)}
                className={`w-full ${t.bar} hover:opacity-90 text-white font-bold px-6 py-3.5 rounded-xl transition-colors text-sm`}
              >
                {lang === 'fr' ? "S'inscrire →" : 'Sign up →'}
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-extrabold text-slate-800">{lang === 'fr' ? 'Essai gratuit' : 'Free trial'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{lang === 'fr' ? 'Accédez au premier module sans engagement' : 'Access the first module for free'}</p>
                </div>
                <span className="text-xl font-extrabold text-slate-800">{(formation.price || 25500).toLocaleString('fr-FR')} FCFA</span>
              </div>
              <button
                onClick={() => onLoginOrDash(formation)}
                className={`w-full ${t.bar} hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all text-sm`}
              >
                {lang === 'fr' ? "S'essayer gratuitement →" : 'Try for free →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

// ─── Main CatalogPage ─────────────────────────────────────────────────────────
export default function CatalogPage({
  onGoLanding, onLoginClick, onEnterDashboard,
  onAboutPage, onContactPage, initialFormation,
}) {
  const { user } = useAuth()
  const { lang } = useLang()
  const t = useT(lang)

  const [formations, setFormations]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [detail, setDetail]           = useState(initialFormation || null)

  useEffect(() => {
    api.get('/courses/public')
      .then(r => setFormations(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // When initialFormation changes (App navigates here with a pre-selected formation)
  useEffect(() => {
    if (initialFormation) setDetail(initialFormation)
  }, [initialFormation])

  const scrollTo = (id) => {
    if (id === 'dashboard') { onEnterDashboard(); return }
    if (id === 'hero') { onGoLanding(); return }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLoginOrDash = () => {
    if (user) onEnterDashboard()
    else onLoginClick()
  }

  if (detail) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar
          onLoginClick={onLoginClick}
          scrollTo={scrollTo}
          onAboutPage={onAboutPage}
          onContactPage={onContactPage}
          onCatalogPage={() => setDetail(null)}
        />
        <div className="flex-1 pt-16">
          <FormationDetail
            formation={detail}
            lang={lang}
            onBack={() => setDetail(null)}
            onLoginOrDash={handleLoginOrDash}
          />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        onLoginClick={onLoginClick}
        scrollTo={scrollTo}
        onAboutPage={onAboutPage}
        onContactPage={onContactPage}
        onCatalogPage={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />

      {/* Hero */}
      <section className="pt-28 pb-12 px-6 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onGoLanding}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {lang === 'fr' ? 'Accueil' : 'Home'}
          </button>
          <h1 className="text-3xl md:text-4xl font-extrabold text-saim-800 mb-3">
            {lang === 'fr' ? 'Explorer nos formations' : 'Explore our courses'}
          </h1>
          <p className="text-slate-500 max-w-xl">
            {lang === 'fr'
              ? 'Choisissez la formation IA qui correspond à votre profil et boostez votre carrière.'
              : 'Choose the AI course that matches your profile and accelerate your career.'}
          </p>
          {!user && (
            <div className="mt-4 inline-flex items-center gap-2 bg-saim-50 border border-saim-200 text-saim-700 text-sm px-4 py-2 rounded-full">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {lang === 'fr' ? 'Créez un compte gratuit pour vous inscrire.' : 'Create a free account to enroll.'}
            </div>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="flex-1 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 h-80 animate-pulse" />
              ))}
            </div>
          ) : formations.length === 0 ? (
            <p className="text-center text-slate-400 py-20">{lang === 'fr' ? 'Aucune formation disponible.' : 'No courses available.'}</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {formations.map(f => (
                <FormationCard
                  key={f.id}
                  formation={f}
                  lang={lang}
                  onClick={() => { setDetail(f); window.scrollTo({ top: 0, behavior: 'instant' }) }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
