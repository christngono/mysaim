import { useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { useT } from '../i18n/translations'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../api/axios'
import { clean } from '../utils/sanitize'

// ─── Formules Section ─────────────────────────────────────────────────────────
function FormuleSection({ t, scrollTo }) {
  const [active, setActive] = useState('a')

  const tabs = [
    { key: 'a', label: t('formule_tab_a') },
    { key: 'b', label: t('formule_tab_b') },
    { key: 'c', label: t('formule_tab_c') },
  ]

  const formules = {
    a: {
      badge:    t('formule_a_badge'),
      badgeCls: 'bg-saim-500 text-white',
      icon:     '🏕️',
      title:    t('formule_a_title'),
      sub:      t('formule_a_sub'),
      gradient: 'from-saim-600 to-saim-800',
      details: [
        { label: t('formule_lbl_duration'), value: t('formule_a_duration'), icon: '⏱️' },
        { label: t('formule_lbl_lieu'),     value: t('formule_a_lieu'),     icon: '📍' },
        { label: t('formule_lbl_inclus'),   value: t('formule_a_inclus'),   icon: '✅' },
        { label: t('formule_lbl_avantage'), value: t('formule_a_avantage'), icon: '⭐' },
      ],
      cta:      t('formule_cta_devis'),
      ctaCls:   'btn-primary',
    },
    b: {
      badge:    t('formule_b_badge'),
      badgeCls: 'bg-amber-500 text-white',
      icon:     '🏢',
      title:    t('formule_b_title'),
      sub:      t('formule_b_sub'),
      gradient: 'from-amber-500 to-amber-700',
      details: [
        { label: t('formule_lbl_duration'), value: t('formule_b_duration'), icon: '⏱️' },
        { label: t('formule_lbl_lieu'),     value: t('formule_b_lieu'),     icon: '📍' },
        { label: t('formule_lbl_inclus'),   value: t('formule_b_inclus'),   icon: '✅' },
        { label: t('formule_lbl_avantage'), value: t('formule_b_avantage'), icon: '⭐' },
      ],
      cta:      t('formule_cta_devis'),
      ctaCls:   'btn-primary',
    },
    c: {
      badge:    t('formule_c_badge'),
      badgeCls: 'bg-emerald-500 text-white',
      icon:     '💻',
      title:    t('formule_c_title'),
      sub:      t('formule_c_sub'),
      gradient: 'from-emerald-600 to-emerald-800',
      details: [
        { label: t('formule_lbl_duration'), value: t('formule_c_duration'),  icon: '⏱️' },
        { label: t('formule_lbl_modalite'), value: t('formule_c_modalite'),  icon: '🖥️' },
        { label: t('formule_lbl_inclus'),   value: t('formule_c_inclus'),    icon: '✅' },
        { label: t('formule_lbl_prix'),     value: t('formule_c_prix'),      icon: '💰' },
        { label: t('formule_lbl_avantage'), value: t('formule_c_avantage'),  icon: '⭐' },
      ],
      cta:      t('formule_cta_devis'),
      ctaCls:   'btn-accent',
    },
  }

  const f = formules[active]

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-chip">{t('formules_label')}</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-saim-800 mt-3 mb-3">{t('formules_title')}</h2>
          <p className="text-slate-500 max-w-xl mx-auto">{t('formules_sub')}</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${
                active === tab.key
                  ? 'bg-saim-500 text-white shadow-lg shadow-saim-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-saim-300 hover:text-saim-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="card overflow-hidden shadow-xl">
          {/* Card header */}
          <div className={`bg-gradient-to-r ${f.gradient} p-8 text-white`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className={`inline-block text-xs font-extrabold tracking-widest uppercase px-3 py-1 rounded-full mb-4 ${f.badgeCls} bg-white/20`}>
                  {f.badge}
                </span>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{f.icon}</span>
                  <h3 className="text-2xl font-extrabold">{f.title}</h3>
                </div>
                <p className="text-white/80 text-sm max-w-md">{f.sub}</p>
              </div>
            </div>
          </div>

          {/* Card body */}
          <div className="p-8">
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {f.details.map((d, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                  <span className="text-xl flex-shrink-0">{d.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">{d.label}</div>
                    <div className="text-sm font-medium text-slate-700">{d.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center">
              <button
                onClick={f.onCta ?? (() => scrollTo('contact'))}
                className={`${f.ctaCls} text-base px-10 py-3`}
              >
                {f.cta}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function LandingPage({ onLoginClick, onRegisterClick, onEnterDashboard }) {
  const { user } = useAuth()
  const { lang } = useLang()
  const t = useT(lang)

  const [contactForm, setContactForm]     = useState({ name: '', email: '', message: '' })
  const [contactStatus, setContactStatus] = useState(null) // null | 'sending' | 'success' | 'error'

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    if (!contactForm.name || !contactForm.email || !contactForm.message) return
    setContactStatus('sending')
    try {
      await api.post('/contact', contactForm)
      setContactStatus('success')
      setContactForm({ name: '', email: '', message: '' })
    } catch {
      setContactStatus('error')
    }
  }

  const refs = {
    hero:     useRef(null),
    about:    useRef(null),
    training: useRef(null),
    contact:  useRef(null),
  }

  const scrollTo = (id) => {
    if (id === 'dashboard') { onEnterDashboard(); return }
    refs[id]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const objectives = [
    { icon: '🧠', key: 'obj_1' },
    { icon: '🛠️', key: 'obj_2' },
    { icon: '✍️', key: 'obj_3' },
    { icon: '⚡', key: 'obj_4' },
    { icon: '🚀', key: 'obj_5' },
  ]

  const modules = [
    { num: 1, icon: '🤖', color: 'saim', titleKey: 'mod1_title', descKey: 'mod1_desc' },
    { num: 2, icon: '⚡', color: 'amber', titleKey: 'mod2_title', descKey: 'mod2_desc' },
    { num: 3, icon: '✍️', color: 'emerald', titleKey: 'mod3_title', descKey: 'mod3_desc' },
  ]

  const colorMap = {
    saim:    { bg: 'bg-saim-100',    text: 'text-saim-700',    num: 'bg-saim-500' },
    amber:   { bg: 'bg-amber-100',   text: 'text-amber-700',   num: 'bg-amber-500' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', num: 'bg-emerald-500' },
  }

  return (
    <div className="min-h-screen">
      <Navbar onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} scrollTo={scrollTo} />

      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <section ref={refs.hero} id="hero" className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img src="/images/image_qui_apprend.jpg" alt="Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-saim-700/90 via-saim-600/85 to-saim-800/90" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 lg:py-40">
          <div className="max-w-3xl">
            <p className="inline-flex items-start gap-2 bg-white/15 backdrop-blur text-white text-sm font-medium px-4 py-2.5 rounded-xl mb-6 animate-float-in max-w-xl leading-relaxed">
              🌍 {t('hero_tag')}
            </p>
            <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight mb-6 animate-float-in" style={{ animationDelay: '0.1s' }}>
              {t('hero_title')}
            </h1>
            <p className="text-lg text-white/85 mb-10 max-w-xl animate-float-in" style={{ animationDelay: '0.2s' }}>
              {t('hero_sub')}
            </p>
            <div className="flex flex-wrap gap-4 animate-float-in" style={{ animationDelay: '0.3s' }}>
              {user ? (
                <button onClick={onEnterDashboard} className="btn-accent text-base px-8 py-3">
                  {t('nav_dashboard')} →
                </button>
              ) : (
                <>
                  <button onClick={() => scrollTo('contact')} className="btn-accent text-base px-8 py-3">
                    Nous contacter →
                  </button>
                  <button onClick={() => scrollTo('about')} className="inline-flex items-center gap-2 text-white border-2 border-white/40 hover:border-white hover:bg-white/10 font-semibold px-8 py-3 rounded-full transition-all text-base">
                    {t('hero_learn')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <button onClick={() => scrollTo('about')} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white animate-bounce-slow">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </section>

      {/* ─── ABOUT ─────────────────────────────────────────────────────────── */}
      <section ref={refs.about} id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="section-chip">{t('about_label')}</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-saim-800 mt-3 mb-6">{t('about_title')}</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-4">{t('about_p1')}</p>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">{t('about_p2')}</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { num: '300+', key: 'about_stat1' },
                  { num: '3',    key: 'about_stat2' },
                  { num: '5+',   key: 'about_stat3' },
                ].map(s => (
                  <div key={s.key} className="text-center p-4 bg-saim-50 rounded-xl">
                    <div className="text-2xl font-extrabold text-saim-600">{s.num}</div>
                    <div className="text-xs text-slate-500 font-medium mt-1">{t(s.key)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img src="/images/image_Annie.jpeg" alt="SAIM Formation" className="w-full rounded-2xl shadow-2xl object-cover max-h-96" />
              <div className="absolute -bottom-4 -left-4 bg-saim-500 text-white rounded-xl px-5 py-3 shadow-lg">
                <div className="text-2xl font-extrabold">100%</div>
                <div className="text-xs opacity-90">Pratique & concret</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PARTENAIRES ───────────────────────────────────────────────────── */}
      <section className="py-10 bg-white border-y border-slate-100 overflow-hidden">
        <div className="text-center mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ils nous font confiance</p>
        </div>
        {/* Marquee */}
        <div className="relative flex overflow-hidden select-none">
          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-white to-transparent" />

          {/* Track — doubled for seamless loop */}
          {[0, 1].map(pass => (
            <div key={pass} aria-hidden={pass === 1} className="flex items-center gap-16 animate-marquee px-8 flex-shrink-0">

              {/* EDC */}
              <div className="flex-shrink-0 flex items-center justify-center h-16 w-40 grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                <img src="/images/EDC_Cameroun_logo.jpg" alt="EDC Cameroun" className="max-h-14 max-w-full object-contain" />
              </div>

              {/* Ministère de la Jeunesse */}
              <div className="flex-shrink-0 flex items-center justify-center h-16 w-56">
                <div className="text-center opacity-60 hover:opacity-100 transition-all">
                  <div className="text-2xl mb-0.5">🏛️</div>
                  <div className="text-xs font-bold text-slate-500 leading-tight max-w-[140px]">Ministère de la Jeunesse<br/>& Éducation Civique</div>
                </div>
              </div>

              {/* Google */}
              <div className="flex-shrink-0 flex items-center justify-center h-16 w-40 grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                <img src="/images/GOOGLE.webp" alt="Google" className="max-h-10 max-w-full object-contain" />
              </div>

              {/* Microsoft */}
              <div className="flex-shrink-0 flex items-center justify-center h-16 w-40 opacity-60 hover:opacity-100 transition-all">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 23 23" className="w-8 h-8 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#f25022" d="M1 1h10v10H1z"/>
                    <path fill="#00a4ef" d="M1 12h10v10H1z"/>
                    <path fill="#7fba00" d="M12 1h10v10H12z"/>
                    <path fill="#ffb900" d="M12 12h10v10H12z"/>
                  </svg>
                  <span className="font-semibold text-slate-600 text-sm">Microsoft</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* ─── OBJECTIVES ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="section-chip">{t('obj_label')}</span>
            <h2 className="text-3xl font-extrabold text-saim-800 mt-3">{t('obj_title')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {objectives.map((obj, i) => (
              <div key={i} className="card p-5 text-center hover:border-saim-300 group">
                <div className="text-3xl mb-3">{obj.icon}</div>
                <p className="text-sm font-medium text-slate-700 group-hover:text-saim-700 transition-colors">
                  {t(obj.key)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRAINING / MODULES ────────────────────────────────────────────── */}
      <section ref={refs.training} id="training" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-chip">{t('training_label')}</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-saim-800 mt-3 mb-4">{t('training_title')}</h2>
            <p className="text-slate-500 max-w-xl mx-auto">{t('training_sub')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-14">
            {modules.map(m => {
              const c = colorMap[m.color]
              return (
                <div key={m.num} className="card p-6 hover:shadow-lg transition-all group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full ${c.num} text-white flex items-center justify-center font-extrabold text-sm`}>{m.num}</div>
                    <span className={`text-2xl`}>{m.icon}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2 group-hover:text-saim-700 transition-colors">{t(m.titleKey)}</h3>
                  <p className="text-sm text-slate-500">{t(m.descKey)}</p>
                </div>
              )
            })}
          </div>

          {/* Illustrative image */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img src="/images/image_chatgpt.jpg" alt="AI Training" className="w-full h-72 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-saim-800/80 to-transparent flex items-end p-8">
              <div>
                <h3 className="text-white font-bold text-xl mb-2">Prêt à commencer ?</h3>
                <button onClick={() => scrollTo('contact')} className="btn-accent text-sm">
                  Contactez-nous →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FORMULES ──────────────────────────────────────────────────────── */}
      <FormuleSection t={t} scrollTo={scrollTo} />

      {/* ─── POURQUOI SAIM ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-chip">{t('why_label')}</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-saim-800 mt-3 mb-3">{t('why_title')}</h2>
            <p className="text-slate-500 max-w-lg mx-auto">{t('why_sub')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {[
              { icon: '🎯', titleKey: 'why_1_title', descKey: 'why_1_desc', color: 'saim' },
              { icon: '⚡', titleKey: 'why_2_title', descKey: 'why_2_desc', color: 'amber' },
              { icon: '📖', titleKey: 'why_3_title', descKey: 'why_3_desc', color: 'emerald' },
              { icon: '👥', titleKey: 'why_4_title', descKey: 'why_4_desc', color: 'violet' },
              { icon: '🏆', titleKey: 'why_5_title', descKey: 'why_5_desc', color: 'saim' },
            ].map((item, i) => {
              const colorMap = {
                saim:    { bg: 'bg-saim-50',    icon: 'bg-saim-100 text-saim-700',    title: 'text-saim-700' },
                amber:   { bg: 'bg-amber-50',   icon: 'bg-amber-100 text-amber-700',   title: 'text-amber-700' },
                emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-700', title: 'text-emerald-700' },
                violet:  { bg: 'bg-violet-50',  icon: 'bg-violet-100 text-violet-700',  title: 'text-violet-700' },
              }
              const c = colorMap[item.color]
              return (
                <div key={i} className={`card p-6 text-center hover:shadow-lg transition-all group ${c.bg}`}>
                  <div className={`w-14 h-14 rounded-2xl ${c.icon} flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <h3 className={`font-extrabold text-sm mb-2 ${c.title}`}>{t(item.titleKey)}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{t(item.descKey)}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── QUI PEUT BÉNÉFICIER ───────────────────────────────────────────── */}
      <section className="py-24 bg-saim-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="section-chip">{t('who_label')}</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-saim-800 mt-3 mb-4">{t('who_title')}</h2>
              <p className="text-slate-500 mb-8">{t('who_sub')}</p>
              <ul className="space-y-3">
                {[1,2,3,4,5,6,7,8].map(n => (
                  <li key={n} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-saim-100 text-saim-600 flex items-center justify-center text-base flex-shrink-0 mt-0.5">💡</span>
                    <span className="text-slate-700 text-sm font-medium">{t(`who_${n}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { num: '300+', label: 'Professionnels formés' },
                  { num: '3',    label: 'Formules disponibles' },
                  { num: '100%', label: 'Satisfaction garantie' },
                  { num: '5+',   label: 'Pays couverts' },
                ].map((stat, i) => (
                  <div key={i} className="card p-6 text-center shadow-md">
                    <div className="text-3xl font-extrabold text-saim-600 mb-1">{stat.num}</div>
                    <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROCESSUS ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-chip">{t('process_label')}</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-saim-800 mt-3 mb-3">{t('process_title')}</h2>
            <p className="text-slate-500 max-w-lg mx-auto">{t('process_sub')}</p>
          </div>
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-saim-100 -translate-x-1/2" />
            <div className="space-y-8">
              {[1,2,3,4,5,6].map((n, i) => {
                const isLeft = i % 2 === 0
                return (
                  <div key={n} className={`flex items-center gap-6 md:gap-12 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    {/* Card */}
                    <div className={`flex-1 ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
                      <div className={`card p-6 hover:shadow-lg transition-all ${isLeft ? 'md:ml-auto' : ''} max-w-sm ${isLeft ? 'md:ml-auto md:mr-0' : 'md:ml-0'}`}>
                        <h3 className="font-extrabold text-saim-800 mb-1">{t(`process_${n}_title`)}</h3>
                        <p className="text-sm text-slate-500">{t(`process_${n}_desc`)}</p>
                      </div>
                    </div>
                    {/* Number bubble */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-saim-500 text-white font-extrabold text-lg flex items-center justify-center shadow-lg shadow-saim-200">
                        {n}
                      </div>
                    </div>
                    {/* Empty side */}
                    <div className="flex-1 hidden md:block" />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-saim-600 to-saim-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">{t('cta_title')}</h2>
          <p className="text-white/75 text-lg mb-10 max-w-2xl mx-auto">{t('cta_desc')}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => scrollTo('contact')}
              className="inline-flex items-center gap-2 bg-white text-saim-700 hover:bg-saim-50 font-extrabold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all text-base"
            >
              📞 {t('cta_btn1')}
            </button>
            <a
              href="/programme-saim.pdf"
              download="Programme-SAIM-Course.pdf"
              className="inline-flex items-center gap-2 border-2 border-white/60 hover:border-white text-white hover:bg-white/10 font-bold px-8 py-3.5 rounded-full transition-all text-base"
            >
              📄 {t('cta_btn2')}
            </a>
          </div>
        </div>
      </section>

      {/* ─── CONTACT ───────────────────────────────────────────────────────── */}
      <section ref={refs.contact} id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <span className="section-chip">{t('contact_label')}</span>
              <h2 className="text-3xl font-extrabold text-saim-800 mt-3 mb-6">{t('contact_title')}</h2>
              <p className="text-slate-500 mb-8">{t('contact_sub')}</p>
              <div className="space-y-4">
                {[
                  { icon: '📧', label: t('contact_email'), value: 'partners@mysaim.cm' },
                  { icon: '📞', label: t('contact_phone'), value: '(+237) 677 1 88 62' },
                  { icon: '📍', label: t('contact_location'), value: t('contact_location_val') },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-4 p-4 bg-saim-50 rounded-xl">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{item.label}</div>
                      <div className="font-medium text-slate-700">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form className="card p-8 space-y-4" onSubmit={handleContactSubmit}>
              <div>
                <label className="label">{t('contact_name_label')}</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Jean Dupont"
                  value={contactForm.name}
                  onChange={e => setContactForm(f => ({ ...f, name: clean(e.target.value) }))}
                />
              </div>
              <div>
                <label className="label">{t('contact_email_label')}</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="jean@email.com"
                  value={contactForm.email}
                  onChange={e => setContactForm(f => ({ ...f, email: clean(e.target.value) }))}
                />
              </div>
              <div>
                <label className="label">{t('contact_msg_label')}</label>
                <textarea
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Votre message..."
                  value={contactForm.message}
                  onChange={e => setContactForm(f => ({ ...f, message: clean(e.target.value) }))}
                />
              </div>
              {contactStatus === 'success' && (
                <p className="text-sm text-emerald-600 font-medium">Message envoyé avec succès !</p>
              )}
              {contactStatus === 'error' && (
                <p className="text-sm text-red-600 font-medium">Une erreur s'est produite. Réessayez.</p>
              )}
              <button
                type="submit"
                className="btn-primary w-full justify-center"
                disabled={contactStatus === 'sending'}
              >
                {contactStatus === 'sending' ? 'Envoi en cours...' : t('contact_send')}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer scrollTo={scrollTo} />
    </div>
  )
}