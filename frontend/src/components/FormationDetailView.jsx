// Shared formation detail view — used by /formations/:slug (public) and UserDashboard (logged-in)

const INFO_ICONS = {
  price: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  globe: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
  badge: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  clip:  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  bars:  "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
}

function InfoIcon({ type }) {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={INFO_ICONS[type]} />
    </svg>
  )
}

function getEmbedUrl(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
}

const THEME_BAR = { blue: 'bg-blue-600', orange: 'bg-orange-500', purple: 'bg-purple-600', green: 'bg-green-600' }

export default function FormationDetailView({
  formation, lang, user,
  onBack, onLoginClick,
  onEnroll, onContinue, onPay, onWaitlist, isOnWaitlist,
}) {
  const hasContent = (formation.module_count || 0) > 0
  let objectives = [], programme = []
  const objRaw  = lang === 'en' && formation.learning_objectives_en?.length ? formation.learning_objectives_en : formation.learning_objectives
  const progRaw = lang === 'en' && formation.programme_en?.length           ? formation.programme_en           : formation.programme
  try { objectives = Array.isArray(objRaw)  ? objRaw  : JSON.parse(objRaw  || '[]') } catch {}
  try { programme  = Array.isArray(progRaw) ? progRaw : JSON.parse(progRaw || '[]') } catch {}
  const prereqs = lang === 'en' && formation.prerequisites_en ? formation.prerequisites_en : formation.prerequisites
  const why     = lang === 'en' && formation.why_en            ? formation.why_en            : formation.why_fr

  const embedUrl = getEmbedUrl(formation.teaser_url)
  const title    = lang === 'en' && formation.title_en ? formation.title_en : formation.title_fr
  const color    = formation.color || 'blue'
  const themeBar = THEME_BAR[color] || 'bg-blue-600'

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">

      {/* ─── Banner ─────────────────────────────────────────────────────────── */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        {formation.image_url
          ? <img src={formation.image_url} alt={title} className="w-full h-full object-cover" loading="eager" />
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
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={INFO_ICONS.bars} /></svg>
                {formation.level}
              </span>
            )}
            {formation.duration_hours > 0 && (
              <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={INFO_ICONS.clock} /></svg>
                {formation.duration_hours}h
              </span>
            )}
            {hasContent && (
              <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                {formation.module_count} modules
              </span>
            )}
          </div>
        </div>
        <div className={`absolute top-0 left-0 right-0 h-1 ${themeBar}`} />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ─── Teaser video ──────────────────────────────────────────────────── */}
        {embedUrl && (
          <section>
            <h2 className="text-lg font-extrabold text-slate-800 mb-4">
              {lang === 'fr' ? 'Vidéo de présentation' : 'Preview video'}
            </h2>
            <div className="aspect-video rounded-2xl overflow-hidden shadow-lg">
              <iframe src={embedUrl} title="Teaser" className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          </section>
        )}

        {/* ─── Infos utiles ──────────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
          <div className="flex flex-wrap gap-x-6 gap-y-4">
            {[
              { type: 'price', label: lang === 'fr' ? 'Prix'        : 'Price',        value: `${(formation.price || 25500).toLocaleString('fr-FR')} FCFA` },
              { type: 'clock', label: lang === 'fr' ? 'Durée'       : 'Duration',     value: `${formation.duration_hours || 3}h` },
              { type: 'globe', label: lang === 'fr' ? 'Format'      : 'Format',       value: lang === 'fr' ? '100% en ligne' : '100% online' },
              { type: 'badge', label: lang === 'fr' ? 'Certificat'  : 'Certificate',  value: 'Certificat SAIM AI' },
              ...(formation.level ? [{ type: 'bars', label: lang === 'fr' ? 'Niveau' : 'Level', value: formation.level }] : []),
              ...(prereqs ? [{ type: 'clip', label: lang === 'fr' ? 'Prérequis' : 'Prerequisites', value: prereqs }] : []),
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="w-8 h-8 flex-shrink-0 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  <InfoIcon type={item.type} />
                </span>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm font-bold text-slate-800 capitalize">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Pourquoi cette formation ──────────────────────────────────────── */}
        {why && (
          <section className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-extrabold text-slate-800 mb-3">
              {lang === 'fr' ? 'Pourquoi cette formation ?' : 'Why this course?'}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{why}</p>
          </section>
        )}

        {/* ─── Objectifs ─────────────────────────────────────────────────────── */}
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

        {/* ─── Programme ─────────────────────────────────────────────────────── */}
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
                    {m.items?.length > 0 && <span className="ml-auto text-xs text-slate-400">{m.items.length} {lang === 'fr' ? `leçon${m.items.length > 1 ? 's' : ''}` : `lesson${m.items.length > 1 ? 's' : ''}`}</span>}
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

        {/* ─── CTA card ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">

          {/* Coming soon */}
          {!hasContent && (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="font-extrabold text-slate-800 mb-2">
                {lang === 'fr' ? 'Formation bientôt disponible' : 'Coming soon'}
              </h3>
              <p className="text-sm text-slate-500 mb-5">
                {lang === 'fr'
                  ? "Cette formation est en cours de préparation. Inscrivez-vous dès maintenant pour être notifié(e) en premier."
                  : 'This course is being prepared. Sign up now to be notified first when it launches.'}
              </p>
              {user && isOnWaitlist ? (
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 font-bold px-5 py-3 rounded-xl text-sm">
                  ✓ {lang === 'fr' ? "Inscription confirmée ! Nous vous contacterons." : 'You are on the waitlist!'}
                </div>
              ) : (
                <button
                  onClick={user ? onWaitlist : onLoginClick}
                  className={`w-full ${themeBar} hover:opacity-90 text-white font-bold px-6 py-3.5 rounded-xl transition-colors text-sm`}
                >
                  {lang === 'fr' ? "M'inscrire sur la liste →" : 'Join waitlist →'}
                </button>
              )}
            </div>
          )}

          {/* Not logged in */}
          {hasContent && !user && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-extrabold text-slate-800">{lang === 'fr' ? 'Essai gratuit' : 'Free trial'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === 'fr' ? 'Accédez au premier module sans engagement' : 'Access the first module for free'}
                  </p>
                </div>
                <span className="text-xl font-extrabold text-slate-800">{(formation.price || 25500).toLocaleString('fr-FR')} FCFA</span>
              </div>
              <button
                onClick={onLoginClick}
                className={`w-full ${themeBar} hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all text-sm`}
              >
                {lang === 'fr' ? "S'essayer gratuitement →" : 'Try for free →'}
              </button>
              <p className="text-xs text-center text-slate-400 mt-3">
                {lang === 'fr' ? 'Créez un compte gratuit pour commencer' : 'Create a free account to get started'}
              </p>
            </div>
          )}

          {/* Logged in, not enrolled */}
          {hasContent && user && !formation.enrollment_status && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-extrabold text-slate-800">{lang === 'fr' ? 'Essai gratuit' : 'Free trial'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === 'fr' ? 'Accédez au premier module sans engagement' : 'Access the first module for free'}
                  </p>
                </div>
                <span className="text-xl font-extrabold text-slate-800">{(formation.price || 25500).toLocaleString('fr-FR')} FCFA</span>
              </div>
              <button
                onClick={onEnroll}
                className={`w-full ${themeBar} hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all text-sm`}
              >
                {lang === 'fr' ? "S'essayer gratuitement →" : 'Try for free →'}
              </button>
            </div>
          )}

          {/* Trial */}
          {hasContent && user && formation.enrollment_status === 'trial' && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700 mb-3">
                {lang === 'fr' ? 'Vous avez un accès essai actif' : 'You have an active trial'}
              </p>
              <button onClick={onContinue} className={`w-full ${themeBar} hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all text-sm`}>
                {lang === 'fr' ? '▶ Continuer la formation' : '▶ Continue course'}
              </button>
              <button onClick={onPay} className="w-full border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold py-3 rounded-xl transition-all text-sm">
                {lang === 'fr' ? `Accès complet · ${(formation.price || 25500).toLocaleString('fr-FR')} FCFA` : `Full access · ${(formation.price || 25500).toLocaleString('fr-FR')} FCFA`}
              </button>
            </div>
          )}

          {/* Paid */}
          {hasContent && user && formation.enrollment_status === 'paid' && (
            <button onClick={onContinue} className={`w-full ${themeBar} hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all text-sm`}>
              {lang === 'fr' ? '▶ Continuer la formation' : '▶ Continue course'}
            </button>
          )}

        </div>
      </div>
    </main>
  )
}
