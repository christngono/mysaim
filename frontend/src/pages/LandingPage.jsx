import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { useT } from '../i18n/translations'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../api/axios'
import { clean } from '../utils/sanitize'

// ─── Animation variants ────────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } },
}
const fadeLeft = {
  hidden:  { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.7,  ease: 'easeOut' } },
}
const fadeRight = {
  hidden:  { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.7,  ease: 'easeOut' } },
}
const staggerGrid = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}
const cardItem = {
  hidden:  { opacity: 0, y: 35, scale: 0.96 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
}
const viewOpts = { once: true, margin: '-80px' }

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
      cta:    t('formule_cta_devis'),
      ctaCls: 'btn-primary',
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
      cta:    t('formule_cta_devis'),
      ctaCls: 'btn-primary',
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
      cta:    t('formule_cta_devis'),
      ctaCls: 'btn-accent',
    },
  }

  const f = formules[active]

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div className="text-center mb-12"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
          <span className="section-chip">{t('formules_label')}</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-saim-800 mt-3 mb-3">{t('formules_title')}</h2>
          <p className="text-slate-500 max-w-xl mx-auto">{t('formules_sub')}</p>
        </motion.div>

        <motion.div className="flex flex-wrap justify-center gap-2 mb-10"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
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
        </motion.div>

        <motion.div className="card overflow-hidden shadow-xl"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
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
            <div className="text-center">
              <button
                onClick={f.onCta ?? (() => scrollTo('contact'))}
                className={`${f.ctaCls} text-base px-10 py-3`}
              >
                {f.cta}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function LandingPage({ onLoginClick, onEnterDashboard, onAboutPage }) {
  const { user } = useAuth()
  const { lang } = useLang()
  const t = useT(lang)

  const [contactForm, setContactForm]     = useState({ name: '', email: '', message: '' })
  const [contactStatus, setContactStatus] = useState(null)

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

  // ── Hero parallax ────────────────────────────────────────────────────────────
  const heroRef = useRef(null)
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroBgY   = useTransform(heroScroll, [0, 1], ['0%', '35%'])
  const heroTextY = useTransform(heroScroll, [0, 1], ['0%', '15%'])
  const heroOpacity = useTransform(heroScroll, [0, 0.6], [1, 0])

  // ── CTA banner parallax ──────────────────────────────────────────────────────
  const ctaRef = useRef(null)
  const { scrollYProgress: ctaScroll } = useScroll({ target: ctaRef, offset: ['start end', 'end start'] })
  const ctaBgY = useTransform(ctaScroll, [0, 1], ['-10%', '10%'])

  const objectives = [
    { icon: '🧠', key: 'obj_1' },
    { icon: '🛠️', key: 'obj_2' },
    { icon: '✍️', key: 'obj_3' },
    { icon: '⚡', key: 'obj_4' },
    { icon: '🚀', key: 'obj_5' },
  ]

  const formations = [
    {
      icon: '⚡',
      color: 'saim',
      title: 'Maîtriser l\'IA pour la productivité professionnelle',
      desc: 'Intégrez l\'intelligence artificielle dans votre quotidien professionnel pour travailler mieux, plus vite et plus intelligemment.',
      tags: ['Cadres', 'Managers', 'Dirigeants', 'Consultants', 'Professionnels'],
      price: '20 000',
      tagBg: 'bg-saim-50 text-saim-700',
      iconBg: 'bg-saim-100',
      priceCls: 'text-saim-700',
      bg: '/images/image_qui_apprend.jpg',
      gradient: 'from-saim-700/90 via-saim-600/85 to-saim-800/90',
      accentDot: 'bg-saim-400',
    },
    {
      icon: '📣',
      color: 'amber',
      title: 'Utiliser l\'IA dans le marketing',
      desc: 'Créez du contenu percutant, automatisez vos campagnes et amplifiez votre impact commercial grâce aux outils IA.',
      tags: ['Marketeurs', 'Communicants', 'Entrepreneurs', 'Community managers', 'PME'],
      price: '25 000',
      tagBg: 'bg-amber-50 text-amber-700',
      iconBg: 'bg-amber-100',
      priceCls: 'text-amber-700',
      bg: '/images/image_chatgpt.jpg',
      gradient: 'from-amber-900/90 via-amber-700/80 to-saim-900/90',
      accentDot: 'bg-amber-400',
    },
    {
      icon: '🎬',
      color: 'violet',
      title: 'Montage vidéo avec les outils IA',
      desc: 'Produisez des vidéos publicitaires, films et animations de qualité professionnelle rapidement grâce à l\'IA.',
      tags: ['Créateurs de contenu', 'Agences com', 'Entrepreneurs', 'Freelances', 'Médias'],
      price: '30 000',
      tagBg: 'bg-violet-50 text-violet-700',
      iconBg: 'bg-violet-100',
      priceCls: 'text-violet-700',
      bg: '/images/capture_generation_Image.jpeg',
      gradient: 'from-violet-900/90 via-violet-700/80 to-saim-900/90',
      accentDot: 'bg-violet-400',
    },
  ]

  const [slideIdx, setSlideIdx] = useState(0)
  const slide = formations[slideIdx]

  useEffect(() => {
    const timer = setInterval(() => setSlideIdx(i => (i + 1) % formations.length), 5500)
    return () => clearInterval(timer)
  }, [slideIdx])

  return (
    <div className="min-h-screen">
      <Navbar onLoginClick={onLoginClick} scrollTo={scrollTo} onAboutPage={onAboutPage} />

      {/* ─── HERO SLIDESHOW ────────────────────────────────────────────────── */}
      <section ref={(el) => { refs.hero.current = el; heroRef.current = el }}
        id="hero" className="relative min-h-screen flex items-center overflow-hidden">

        {/* Slideshow background — cross-fade */}
        <AnimatePresence mode="sync">
          <motion.div key={`bg-${slideIdx}`} className="absolute inset-0"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{ y: heroBgY }}>
            <img src={slide.bg} alt={slide.title}
              className="w-full h-full object-cover scale-110" />
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />
          </motion.div>
        </AnimatePresence>

        {/* Decorative orbs */}
        <motion.div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute bottom-32 left-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />

        {/* Slide counter top-right */}
        <div className="absolute top-24 right-8 z-20 text-white/50 text-sm font-bold tabular-nums select-none">
          {slideIdx + 1} / {formations.length}
        </div>

        {/* Slide content */}
        <motion.div className="relative z-10 max-w-7xl mx-auto px-6 py-32 lg:py-40 w-full"
          style={{ y: heroTextY, opacity: heroOpacity }}>
          <AnimatePresence mode="wait">
            <motion.div key={`content-${slideIdx}`} className="max-w-3xl"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
                <span>{slide.icon}</span>
                <span>Formation SAIM</span>
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <span className="font-extrabold">{slide.price} FCFA</span>
                <span className="text-white/60 font-normal">/ personne</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
                {slide.title}
              </h1>

              {/* Description */}
              <p className="text-lg text-white/85 mb-6 max-w-xl leading-relaxed">
                {slide.desc}
              </p>

              {/* Audience tags */}
              <div className="flex flex-wrap gap-2 mb-10">
                {slide.tags.map(tag => (
                  <span key={tag}
                    className="text-xs bg-white/15 backdrop-blur border border-white/20 text-white/90 px-3 py-1.5 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-4">
                {user ? (
                  <button onClick={onEnterDashboard} className="btn-accent text-base px-8 py-3">
                    {t('nav_dashboard')} →
                  </button>
                ) : (
                  <>
                    <button onClick={onLoginClick}
                      className="btn-accent text-base px-8 py-3">
                      S'essayer gratuitement →
                    </button>
                    <button onClick={() => scrollTo('about')}
                      className="inline-flex items-center gap-2 text-white border-2 border-white/40 hover:border-white hover:bg-white/10 font-semibold px-8 py-3 rounded-full transition-all text-base">
                      En savoir plus
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Prev arrow */}
        <button
          onClick={() => setSlideIdx(i => (i - 1 + formations.length) % formations.length)}
          className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 backdrop-blur border border-white/25 text-white flex items-center justify-center hover:bg-white/25 transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Next arrow */}
        <button
          onClick={() => setSlideIdx(i => (i + 1) % formations.length)}
          className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 backdrop-blur border border-white/25 text-white flex items-center justify-center hover:bg-white/25 transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Navigation dots */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
          {formations.map((f, i) => (
            <button key={i} onClick={() => setSlideIdx(i)}
              className={`transition-all duration-400 rounded-full ${
                i === slideIdx
                  ? `w-8 h-2.5 ${f.accentDot}`
                  : 'w-2.5 h-2.5 bg-white/35 hover:bg-white/60'
              }`} />
          ))}
        </div>

        {/* Scroll down */}
        <button onClick={() => scrollTo('about')}
          className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 text-white/50 hover:text-white transition-colors animate-bounce-slow">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </section>

      {/* ─── ABOUT ─────────────────────────────────────────────────────────── */}
      <section ref={refs.about} id="about" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeLeft} initial="hidden" whileInView="visible" viewport={viewOpts}>
              <span className="section-chip">{t('about_label')}</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-saim-800 mt-3 mb-6">{t('about_title')}</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-4">{t('about_p1')}</p>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">{t('about_p2')}</p>
              <motion.div className="grid grid-cols-3 gap-4"
                variants={staggerGrid} initial="hidden" whileInView="visible" viewport={viewOpts}>
                {[
                  { num: '300+', key: 'about_stat1' },
                  { num: '3',    key: 'about_stat2' },
                  { num: '5+',   key: 'about_stat3' },
                ].map(s => (
                  <motion.div key={s.key} variants={cardItem} className="text-center p-4 bg-saim-50 rounded-xl">
                    <div className="text-2xl font-extrabold text-saim-600">{s.num}</div>
                    <div className="text-xs text-slate-500 font-medium mt-1">{t(s.key)}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div className="relative" variants={fadeRight} initial="hidden" whileInView="visible" viewport={viewOpts}>
              <motion.img
                src="/images/image_Annie.jpeg" alt="SAIM Formation"
                className="w-full rounded-2xl shadow-2xl object-cover max-h-96"
                whileHover={{ scale: 1.02 }} transition={{ duration: 0.4 }} />
              <motion.div
                className="absolute -bottom-4 -left-4 bg-saim-500 text-white rounded-xl px-5 py-3 shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={viewOpts} transition={{ delay: 0.4, duration: 0.5 }}>
                <div className="text-2xl font-extrabold">100%</div>
                <div className="text-xs opacity-90">Pratique & concret</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── PARTENAIRES ───────────────────────────────────────────────────── */}
      <section className="py-10 bg-white border-y border-slate-100 overflow-hidden">
        <motion.div className="text-center mb-6"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ils nous font confiance</p>
        </motion.div>
        <div className="relative flex overflow-hidden select-none">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-white to-transparent" />
          {[0, 1].map(pass => (
            <div key={pass} aria-hidden={pass === 1} className="flex items-center gap-16 animate-marquee px-8 flex-shrink-0">
              <div className="flex-shrink-0 flex items-center justify-center h-16 w-40 grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                <img src="/images/EDC_Cameroun_logo.jpg" alt="EDC Cameroun" className="max-h-14 max-w-full object-contain" />
              </div>
              <div className="flex-shrink-0 flex items-center justify-center h-16 w-56">
                <div className="text-center opacity-60 hover:opacity-100 transition-all">
                  <div className="text-2xl mb-0.5">🏛️</div>
                  <div className="text-xs font-bold text-slate-500 leading-tight max-w-[140px]">Ministère de la Jeunesse<br/>& Éducation Civique</div>
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center justify-center h-16 w-40 grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                <img src="/images/GOOGLE.webp" alt="Google" className="max-h-10 max-w-full object-contain" />
              </div>
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
          <motion.div className="text-center mb-12"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <span className="section-chip">{t('obj_label')}</span>
            <h2 className="text-3xl font-extrabold text-saim-800 mt-3">{t('obj_title')}</h2>
          </motion.div>
          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
            variants={staggerGrid} initial="hidden" whileInView="visible" viewport={viewOpts}>
            {objectives.map((obj, i) => (
              <motion.div key={i} variants={cardItem}
                className="card p-5 text-center hover:border-saim-300 group cursor-default"
                whileHover={{ y: -6, transition: { duration: 0.25 } }}>
                <div className="text-3xl mb-3">{obj.icon}</div>
                <p className="text-sm font-medium text-slate-700 group-hover:text-saim-700 transition-colors">
                  {t(obj.key)}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── NOS FORMATIONS ────────────────────────────────────────────────── */}
      <section ref={refs.training} id="training" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-14"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <span className="section-chip">Nos formations</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-saim-800 mt-3 mb-4">Nos Formations</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Choisissez la formation qui correspond à votre besoin professionnel</p>
          </motion.div>

          <motion.div className="grid md:grid-cols-3 gap-8"
            variants={staggerGrid} initial="hidden" whileInView="visible" viewport={viewOpts}>
            {formations.map((f, i) => (
              <motion.div key={i} variants={cardItem}
                className="card p-8 flex flex-col hover:shadow-xl transition-all border-2 border-transparent hover:border-saim-100"
                whileHover={{ y: -8, transition: { duration: 0.25 } }}>
                <div className="mb-5">
                  <div className={`w-14 h-14 rounded-2xl ${f.iconBg} flex items-center justify-center text-3xl mb-5`}>
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-extrabold text-saim-800 mb-3 leading-snug">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
                <div className="mb-6 flex-1">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Pour qui ?</div>
                  <div className="flex flex-wrap gap-1.5">
                    {f.tags.map(tag => (
                      <span key={tag} className={`text-xs px-2.5 py-1 rounded-full font-medium ${f.tagBg}`}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-5 mt-auto">
                  <div className="mb-4">
                    <div className="text-xs text-slate-400 font-medium mb-0.5">Prix</div>
                    <div className={`text-2xl font-extrabold ${f.priceCls}`}>
                      {f.price} <span className="text-base font-bold text-slate-500">FCFA</span>
                      <span className="text-xs font-medium text-slate-400 ml-1">/ personne</span>
                    </div>
                  </div>
                  <button onClick={onLoginClick}
                    className="btn-primary w-full justify-center text-sm">
                    S'essayer gratuitement →
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FORMULES ──────────────────────────────────────────────────────── */}
      <FormuleSection t={t} scrollTo={scrollTo} />

      {/* ─── POURQUOI SAIM ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-14"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <span className="section-chip">{t('why_label')}</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-saim-800 mt-3 mb-3">{t('why_title')}</h2>
            <p className="text-slate-500 max-w-lg mx-auto">{t('why_sub')}</p>
          </motion.div>
          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5"
            variants={staggerGrid} initial="hidden" whileInView="visible" viewport={viewOpts}>
            {[
              { icon: '🎯', titleKey: 'why_1_title', descKey: 'why_1_desc', color: 'saim' },
              { icon: '⚡', titleKey: 'why_2_title', descKey: 'why_2_desc', color: 'amber' },
              { icon: '📖', titleKey: 'why_3_title', descKey: 'why_3_desc', color: 'emerald' },
              { icon: '👥', titleKey: 'why_4_title', descKey: 'why_4_desc', color: 'violet' },
              { icon: '🏆', titleKey: 'why_5_title', descKey: 'why_5_desc', color: 'saim' },
            ].map((item, i) => {
              const cm = {
                saim:    { bg: 'bg-saim-50',    icon: 'bg-saim-100 text-saim-700',       title: 'text-saim-700' },
                amber:   { bg: 'bg-amber-50',   icon: 'bg-amber-100 text-amber-700',     title: 'text-amber-700' },
                emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-700', title: 'text-emerald-700' },
                violet:  { bg: 'bg-violet-50',  icon: 'bg-violet-100 text-violet-700',   title: 'text-violet-700' },
              }
              const c = cm[item.color]
              return (
                <motion.div key={i} variants={cardItem}
                  className={`card p-6 text-center hover:shadow-lg transition-all group ${c.bg}`}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                  <div className={`w-14 h-14 rounded-2xl ${c.icon} flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <h3 className={`font-extrabold text-sm mb-2 ${c.title}`}>{t(item.titleKey)}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{t(item.descKey)}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── QUI PEUT BÉNÉFICIER ───────────────────────────────────────────── */}
      <section className="py-24 bg-saim-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeLeft} initial="hidden" whileInView="visible" viewport={viewOpts}>
              <span className="section-chip">{t('who_label')}</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-saim-800 mt-3 mb-4">{t('who_title')}</h2>
              <p className="text-slate-500 mb-8">{t('who_sub')}</p>
              <motion.ul className="space-y-3"
                variants={staggerGrid} initial="hidden" whileInView="visible" viewport={viewOpts}>
                {[1,2,3,4,5,6,7,8].map(n => (
                  <motion.li key={n} variants={cardItem} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-saim-100 text-saim-600 flex items-center justify-center text-base flex-shrink-0 mt-0.5">💡</span>
                    <span className="text-slate-700 text-sm font-medium">{t(`who_${n}`)}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>

            <motion.div className="relative hidden lg:block"
              variants={fadeRight} initial="hidden" whileInView="visible" viewport={viewOpts}>
              <motion.div className="grid grid-cols-2 gap-4"
                variants={staggerGrid} initial="hidden" whileInView="visible" viewport={viewOpts}>
                {[
                  { num: '300+', label: 'Professionnels formés' },
                  { num: '3',    label: 'Formules disponibles' },
                  { num: '100%', label: 'Satisfaction garantie' },
                  { num: '5+',   label: 'Pays couverts' },
                ].map((stat, i) => (
                  <motion.div key={i} variants={cardItem}
                    className="card p-6 text-center shadow-md"
                    whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}>
                    <div className="text-3xl font-extrabold text-saim-600 mb-1">{stat.num}</div>
                    <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── PROCESSUS ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div className="text-center mb-14"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <span className="section-chip">{t('process_label')}</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-saim-800 mt-3 mb-3">{t('process_title')}</h2>
            <p className="text-slate-500 max-w-lg mx-auto">{t('process_sub')}</p>
          </motion.div>
          <div className="relative">
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-saim-100 -translate-x-1/2" />
            <div className="space-y-8">
              {[1,2,3,4,5,6].map((n, i) => {
                const isLeft = i % 2 === 0
                return (
                  <motion.div key={n}
                    className={`flex items-center gap-6 md:gap-12 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                    variants={isLeft ? fadeLeft : fadeRight}
                    initial="hidden" whileInView="visible" viewport={viewOpts}>
                    <div className={`flex-1 ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
                      <div className={`card p-6 hover:shadow-lg transition-all max-w-sm ${isLeft ? 'md:ml-auto md:mr-0' : 'md:ml-0'}`}>
                        <h3 className="font-extrabold text-saim-800 mb-1">{t(`process_${n}_title`)}</h3>
                        <p className="text-sm text-slate-500">{t(`process_${n}_desc`)}</p>
                      </div>
                    </div>
                    <div className="relative z-10 flex-shrink-0">
                      <motion.div
                        className="w-12 h-12 rounded-full bg-saim-500 text-white font-extrabold text-lg flex items-center justify-center shadow-lg shadow-saim-200"
                        whileInView={{ scale: [0.5, 1.2, 1] }}
                        viewport={viewOpts}
                        transition={{ duration: 0.5, delay: 0.2 }}>
                        {n}
                      </motion.div>
                    </div>
                    <div className="flex-1 hidden md:block" />
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER — parallax ─────────────────────────────────────────── */}
      <section ref={ctaRef} className="py-20 relative overflow-hidden">
        {/* Parallax background */}
        <motion.div className="absolute inset-0 bg-gradient-to-br from-saim-600 to-saim-900"
          style={{ y: ctaBgY }} />
        {/* Decorative blobs */}
        <motion.div className="absolute -top-10 -right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 7, repeat: Infinity }} />
        <motion.div className="absolute -bottom-16 -left-16 w-96 h-96 bg-saim-400/10 rounded-full blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 9, repeat: Infinity, delay: 2 }} />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            {t('cta_title')}
          </motion.h2>
          <motion.p className="text-white/75 text-lg mb-10 max-w-2xl mx-auto"
            variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={viewOpts} transition={{ delay: 0.15 }}>
            {t('cta_desc')}
          </motion.p>
          <motion.div className="flex flex-wrap justify-center gap-4"
            variants={staggerGrid} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <motion.button variants={cardItem}
              onClick={() => scrollTo('contact')}
              className="inline-flex items-center gap-2 bg-white text-saim-700 hover:bg-saim-50 font-extrabold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all text-base">
              📞 {t('cta_btn1')}
            </motion.button>
            <motion.a variants={cardItem}
              href="/programme-saim.pdf" download="Programme-SAIM-Course.pdf"
              className="inline-flex items-center gap-2 border-2 border-white/60 hover:border-white text-white hover:bg-white/10 font-bold px-8 py-3.5 rounded-full transition-all text-base">
              📄 {t('cta_btn2')}
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* ─── CONTACT ───────────────────────────────────────────────────────── */}
      <section ref={refs.contact} id="contact" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div variants={fadeLeft} initial="hidden" whileInView="visible" viewport={viewOpts}>
              <span className="section-chip">{t('contact_label')}</span>
              <h2 className="text-3xl font-extrabold text-saim-800 mt-3 mb-6">{t('contact_title')}</h2>
              <p className="text-slate-500 mb-8">{t('contact_sub')}</p>
              <motion.div className="space-y-4"
                variants={staggerGrid} initial="hidden" whileInView="visible" viewport={viewOpts}>
                {[
                  { icon: '📧', label: t('contact_email'),    value: 'partners@mysaim.cm' },
                  { icon: '📞', label: t('contact_phone'),    value: '(+237) 677 1 88 62' },
                  { icon: '📍', label: t('contact_location'), value: t('contact_location_val') },
                ].map(item => (
                  <motion.div key={item.label} variants={cardItem}
                    className="flex items-center gap-4 p-4 bg-saim-50 rounded-xl">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{item.label}</div>
                      <div className="font-medium text-slate-700">{item.value}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.form className="card p-8 space-y-4" onSubmit={handleContactSubmit}
              variants={fadeRight} initial="hidden" whileInView="visible" viewport={viewOpts}>
              <div>
                <label className="label">{t('contact_name_label')}</label>
                <input type="text" className="input-field" placeholder="Jean Dupont"
                  value={contactForm.name}
                  onChange={e => setContactForm(f => ({ ...f, name: clean(e.target.value) }))} />
              </div>
              <div>
                <label className="label">{t('contact_email_label')}</label>
                <input type="email" className="input-field" placeholder="jean@email.com"
                  value={contactForm.email}
                  onChange={e => setContactForm(f => ({ ...f, email: clean(e.target.value) }))} />
              </div>
              <div>
                <label className="label">{t('contact_msg_label')}</label>
                <textarea rows={4} className="input-field resize-none" placeholder="Votre message..."
                  value={contactForm.message}
                  onChange={e => setContactForm(f => ({ ...f, message: clean(e.target.value) }))} />
              </div>
              {contactStatus === 'success' && (
                <p className="text-sm text-emerald-600 font-medium">Message envoyé avec succès !</p>
              )}
              {contactStatus === 'error' && (
                <p className="text-sm text-red-600 font-medium">Une erreur s'est produite. Réessayez.</p>
              )}
              <button type="submit" className="btn-primary w-full justify-center"
                disabled={contactStatus === 'sending'}>
                {contactStatus === 'sending' ? 'Envoi en cours...' : t('contact_send')}
              </button>
            </motion.form>
          </div>
        </div>
      </section>

      <Footer scrollTo={scrollTo} />
    </div>
  )
}
