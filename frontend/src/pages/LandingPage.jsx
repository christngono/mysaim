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
  visible: { opacity: 1, x: 0,  transition: { duration: 0.7, ease: 'easeOut' } },
}
const fadeRight = {
  hidden:  { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.7, ease: 'easeOut' } },
}
const staggerGrid = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}
const cardItem = {
  hidden:  { opacity: 0, y: 35, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
}
const viewOpts = { once: true, margin: '-80px' }

// ─── SVG Icons ─────────────────────────────────────────────────────────────────
const icons = {
  lightning: (cls = 'w-6 h-6') => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  megaphone: (cls = 'w-6 h-6') => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  video: (cls = 'w-6 h-6') => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  chip: (cls = 'w-6 h-6') => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
    </svg>
  ),
  lightbulb: (cls = 'w-6 h-6') => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  cog: (cls = 'w-6 h-6') => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  shield: (cls = 'w-6 h-6') => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  chart: (cls = 'w-6 h-6') => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  target: (cls = 'w-6 h-6') => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth={2}/><circle cx="12" cy="12" r="6" strokeWidth={2}/><circle cx="12" cy="12" r="2" strokeWidth={2}/>
    </svg>
  ),
  book: (cls = 'w-6 h-6') => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  users: (cls = 'w-6 h-6') => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  award: (cls = 'w-6 h-6') => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  mail: (cls = 'w-5 h-5') => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  phone: (cls = 'w-5 h-5') => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
    </svg>
  ),
  pin: (cls = 'w-5 h-5') => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  document: (cls = 'w-5 h-5') => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  building: (cls = 'w-8 h-8') => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  check: (cls = 'w-4 h-4') => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
}

// ─── Données formations ────────────────────────────────────────────────────────
const formations = [
  { iconKey: 'lightning', color: 'saim',    titleKey: 'f1_title', descKey: 'f1_desc', tagsKey: 'f1_tags', tagBg: 'bg-saim-50 text-saim-700',     iconBg: 'bg-saim-100 text-saim-600',     accentDot: 'bg-saim-400',  bg: '/images/image_qui_apprend.jpg',          gradient: 'from-saim-700/90 via-saim-600/85 to-saim-800/90'    },
  { iconKey: 'megaphone', color: 'amber',   titleKey: 'f2_title', descKey: 'f2_desc', tagsKey: 'f2_tags', tagBg: 'bg-amber-50 text-amber-700',    iconBg: 'bg-amber-100 text-amber-600',    accentDot: 'bg-amber-400', bg: '/images/image_chatgpt.jpg',              gradient: 'from-amber-900/90 via-amber-700/80 to-saim-900/90'  },
  { iconKey: 'video',     color: 'violet',  titleKey: 'f3_title', descKey: 'f3_desc', tagsKey: 'f3_tags', tagBg: 'bg-violet-50 text-violet-700',  iconBg: 'bg-violet-100 text-violet-600',  accentDot: 'bg-violet-400', bg: '/images/capture_generation_Image.jpeg', gradient: 'from-violet-900/90 via-violet-700/80 to-saim-900/90' },
  { iconKey: 'chip',      color: 'emerald', titleKey: 'f4_title', descKey: 'f4_desc', tagsKey: 'f4_tags', tagBg: 'bg-emerald-50 text-emerald-700', iconBg: 'bg-emerald-100 text-emerald-600', accentDot: 'bg-emerald-400', bg: '/images/image_qui_apprend.jpg',     gradient: 'from-emerald-900/90 via-emerald-700/80 to-saim-900/90' },
]

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function LandingPage({ onLoginClick, onEnterDashboard, onAboutPage, onFormationPage }) {
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

  const heroRef = useRef(null)
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroBgY    = useTransform(heroScroll, [0, 1], ['0%', '35%'])
  const heroTextY  = useTransform(heroScroll, [0, 1], ['0%', '15%'])
  const heroOpacity = useTransform(heroScroll, [0, 0.6], [1, 0])

  const ctaRef = useRef(null)
  const { scrollYProgress: ctaScroll } = useScroll({ target: ctaRef, offset: ['start end', 'end start'] })
  const ctaBgY = useTransform(ctaScroll, [0, 1], ['-10%', '10%'])

  const [slideIdx, setSlideIdx] = useState(0)
  const slide = formations[slideIdx]

  useEffect(() => {
    const timer = setInterval(() => setSlideIdx(i => (i + 1) % formations.length), 5500)
    return () => clearInterval(timer)
  }, [slideIdx])

  return (
    <div className="min-h-screen">
      <Navbar onLoginClick={onLoginClick} scrollTo={scrollTo} onAboutPage={onAboutPage} onFormationPage={onFormationPage} />

      {/* ─── HERO SLIDESHOW ─────────────────────────────────────────────────── */}
      <section ref={(el) => { refs.hero.current = el; heroRef.current = el }}
        id="hero" className="relative min-h-screen flex items-center overflow-hidden">

        <AnimatePresence mode="sync">
          <motion.div key={`bg-${slideIdx}`} className="absolute inset-0"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1 }} style={{ y: heroBgY }}>
            <img src={slide.bg} alt={t(slide.titleKey)} className="w-full h-full object-cover scale-110" />
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />
          </motion.div>
        </AnimatePresence>

        <motion.div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute bottom-32 left-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />

        <div className="absolute top-24 right-8 z-20 text-white/50 text-sm font-bold tabular-nums select-none">
          {slideIdx + 1} / {formations.length}
        </div>

        <motion.div className="relative z-10 max-w-7xl mx-auto px-6 py-32 lg:py-40 w-full"
          style={{ y: heroTextY, opacity: heroOpacity }}>
          <AnimatePresence mode="wait">
            <motion.div key={`content-${slideIdx}`} className="max-w-3xl"
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.55, ease: 'easeOut' }}>

              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
                <span className="w-4 h-4 opacity-80">{icons[slide.iconKey]('w-4 h-4')}</span>
                <span>{t('hero_badge')}</span>
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <span className="font-extrabold">25 500 FCFA</span>
                <span className="text-white/60 font-normal">{t('hero_per_person')}</span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
                {t(slide.titleKey)}
              </h1>
              <p className="text-lg text-white/85 mb-6 max-w-xl leading-relaxed">{t(slide.descKey)}</p>

              <div className="flex flex-wrap gap-2 mb-10">
                {t(slide.tagsKey).split(',').map(tag => (
                  <span key={tag} className="text-xs bg-white/15 backdrop-blur border border-white/20 text-white/90 px-3 py-1.5 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                {user ? (
                  <button onClick={onEnterDashboard} className="btn-accent text-base px-8 py-3">
                    {t('nav_dashboard')} →
                  </button>
                ) : (
                  <>
                    <button onClick={onLoginClick} className="btn-accent text-base px-8 py-3">
                      {t('hero_try')} →
                    </button>
                    <button onClick={onFormationPage}
                      className="inline-flex items-center gap-2 text-white border-2 border-white/40 hover:border-white hover:bg-white/10 font-semibold px-8 py-3 rounded-full transition-all text-base">
                      {t('hero_learn')}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <button onClick={() => setSlideIdx(i => (i - 1 + formations.length) % formations.length)}
          className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 backdrop-blur border border-white/25 text-white flex items-center justify-center hover:bg-white/25 transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button onClick={() => setSlideIdx(i => (i + 1) % formations.length)}
          className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 backdrop-blur border border-white/25 text-white flex items-center justify-center hover:bg-white/25 transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
          {formations.map((f, i) => (
            <button key={i} onClick={() => setSlideIdx(i)}
              className={`transition-all duration-400 rounded-full ${
                i === slideIdx ? `w-8 h-2.5 ${f.accentDot}` : 'w-2.5 h-2.5 bg-white/35 hover:bg-white/60'
              }`} />
          ))}
        </div>

        <button onClick={() => scrollTo('about')}
          className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 text-white/50 hover:text-white transition-colors animate-bounce-slow">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </section>

      {/* ─── QUI SOMMES-NOUS ─────────────────────────────────────────────────── */}
      <section ref={refs.about} id="about" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeLeft} initial="hidden" whileInView="visible" viewport={viewOpts}>
              <span className="section-chip">{t('about_label')}</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-saim-800 mt-3 mb-6">{t('about_title')}</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-4">{t('about_p1')}</p>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">{t('about_p2')}</p>

              <motion.div className="grid grid-cols-3 gap-4 mb-8"
                variants={staggerGrid} initial="hidden" whileInView="visible" viewport={viewOpts}>
                {[
                  { num: '300+', label: t('about_stat1') },
                  { num: '4',    label: t('about_stat_formations') },
                  { num: '5+',   label: t('about_stat3') },
                ].map((s, i) => (
                  <motion.div key={i} variants={cardItem} className="text-center p-4 bg-saim-50 rounded-xl">
                    <div className="text-2xl font-extrabold text-saim-600">{s.num}</div>
                    <div className="text-xs text-slate-500 font-medium mt-1">{s.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              <button onClick={onAboutPage}
                className="inline-flex items-center gap-2 bg-saim-500 hover:bg-saim-600 text-white font-bold px-6 py-3 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95">
                {t('about_learn_more')}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </motion.div>

            <motion.div className="relative" variants={fadeRight} initial="hidden" whileInView="visible" viewport={viewOpts}>
              <motion.img src="/images/image_Annie.jpeg" alt="SAIM Formation"
                className="w-full rounded-2xl shadow-2xl object-cover max-h-96"
                whileHover={{ scale: 1.02 }} transition={{ duration: 0.4 }} />
              <motion.div className="absolute -bottom-4 -left-4 bg-saim-500 text-white rounded-xl px-5 py-3 shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={viewOpts} transition={{ delay: 0.4, duration: 0.5 }}>
                <div className="text-2xl font-extrabold">100%</div>
                <div className="text-xs opacity-90">{t('about_practical')}</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── PARTENAIRES ────────────────────────────────────────────────────── */}
      <section className="py-10 bg-white border-y border-slate-100 overflow-hidden">
        <motion.div className="text-center mb-6"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('partners_trust')}</p>
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
                  <div className="flex justify-center mb-0.5 text-slate-500">{icons.building('w-7 h-7')}</div>
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

      {/* ─── OBJECTIFS ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-12"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <span className="section-chip">{t('obj_label')}</span>
            <h2 className="text-3xl font-extrabold text-saim-800 mt-3 mb-3">{t('obj_title')}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-sm leading-relaxed">
              {t('obj_sub')}
            </p>
          </motion.div>
          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerGrid} initial="hidden" whileInView="visible" viewport={viewOpts}>
            {[
              { iconKey: 'lightbulb', iconBg: 'bg-saim-100 text-saim-600', titleKey: 'obj1_title', descKey: 'obj1_desc' },
              { iconKey: 'cog', iconBg: 'bg-amber-100 text-amber-600', titleKey: 'obj2_title', descKey: 'obj2_desc' },
              { iconKey: 'shield', iconBg: 'bg-violet-100 text-violet-600', titleKey: 'obj3_title', descKey: 'obj3_desc' },
              { iconKey: 'chart', iconBg: 'bg-emerald-100 text-emerald-600', titleKey: 'obj4_title', descKey: 'obj4_desc' },
            ].map((obj, i) => (
              <motion.div key={i} variants={cardItem}
                className="card p-6 hover:border-saim-300 group cursor-default hover:shadow-lg transition-all"
                whileHover={{ y: -6, transition: { duration: 0.25 } }}>
                <div className={`w-12 h-12 rounded-xl ${obj.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {icons[obj.iconKey]('w-6 h-6')}
                </div>
                <h3 className="font-extrabold text-saim-800 text-sm mb-2">{t(obj.titleKey)}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{t(obj.descKey)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── NOS FORMATIONS ─────────────────────────────────────────────────── */}
      <section ref={refs.training} id="training" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-14"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <span className="section-chip">{t('fmts_chip')}</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-saim-800 mt-3 mb-3">{t('fmts_title')}</h2>
            <p className="text-slate-500 max-w-xl mx-auto mb-4">{t('fmts_sub')}</p>
            <div className="inline-flex items-center gap-2 bg-saim-50 border border-saim-200 text-saim-700 text-sm font-bold px-4 py-2 rounded-full">
              {icons.award('w-4 h-4')}
              {t('fmts_price')}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Image gauche */}
            <motion.div variants={fadeLeft} initial="hidden" whileInView="visible" viewport={viewOpts}
              className="relative sticky top-24">
              <img src="/uploads/apropos/image_apropos.png" alt="Formations SAIM"
                className="w-full rounded-2xl shadow-xl object-cover max-h-[560px]" />
              <div className="absolute -bottom-4 -right-4 bg-saim-500 text-white rounded-xl px-5 py-3 shadow-lg">
                <div className="text-2xl font-extrabold">4</div>
                <div className="text-xs opacity-90">{t('fmts_count')}</div>
              </div>
            </motion.div>

            {/* 4 cartes droite */}
            <motion.div className="space-y-4"
              variants={staggerGrid} initial="hidden" whileInView="visible" viewport={viewOpts}>
              {formations.map((f, i) => (
                <motion.div key={i} variants={cardItem}
                  className="card p-5 flex items-start gap-4 hover:shadow-lg transition-all border-2 border-transparent hover:border-saim-100"
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}>
                  <div className={`w-12 h-12 rounded-xl ${f.iconBg} flex items-center justify-center flex-shrink-0`}>
                    {icons[f.iconKey]('w-6 h-6')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-saim-800 text-sm leading-snug mb-1">{t(f.titleKey)}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed mb-3">{t(f.descKey)}</p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={onLoginClick}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-saim-600 hover:text-saim-700 bg-saim-50 hover:bg-saim-100 px-3 py-1.5 rounded-full transition-colors">
                        {icons.check('w-3 h-3')}
                        {t('fmts_try')}
                      </button>
                      <button onClick={onFormationPage}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-saim-500 hover:bg-saim-600 px-3 py-1.5 rounded-full transition-colors">
                        {t('fmts_details')}
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── POURQUOI SAIM ──────────────────────────────────────────────────── */}
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
              { iconKey: 'target',    titleKey: 'why_1_title', descKey: 'why_1_desc', color: 'saim'    },
              { iconKey: 'lightning', titleKey: 'why_2_title', descKey: 'why_2_desc', color: 'amber'   },
              { iconKey: 'book',      titleKey: 'why_3_title', descKey: 'why_3_desc', color: 'emerald' },
              { iconKey: 'users',     titleKey: 'why_4_title', descKey: 'why_4_desc', color: 'violet'  },
              { iconKey: 'award',     titleKey: 'why_5_title', descKey: 'why_5_desc', color: 'saim'    },
            ].map((item, i) => {
              const cm = {
                saim:    { bg: 'bg-saim-50',    icon: 'bg-saim-100 text-saim-600',     title: 'text-saim-700'    },
                amber:   { bg: 'bg-amber-50',   icon: 'bg-amber-100 text-amber-600',   title: 'text-amber-700'   },
                emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', title: 'text-emerald-700' },
                violet:  { bg: 'bg-violet-50',  icon: 'bg-violet-100 text-violet-600', title: 'text-violet-700'  },
              }
              const c = cm[item.color]
              return (
                <motion.div key={i} variants={cardItem}
                  className={`card p-6 text-center hover:shadow-lg transition-all group ${c.bg}`}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                  <div className={`w-14 h-14 rounded-2xl ${c.icon} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    {icons[item.iconKey]('w-6 h-6')}
                  </div>
                  <h3 className={`font-extrabold text-sm mb-2 ${c.title}`}>{t(item.titleKey)}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{t(item.descKey)}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── QUI PEUT BÉNÉFICIER ────────────────────────────────────────────── */}
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
                    <span className="w-7 h-7 rounded-full bg-saim-100 text-saim-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {icons.check('w-3.5 h-3.5')}
                    </span>
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
                  { num: '300+', label: t('who_s1') },
                  { num: '4',    label: t('who_s2') },
                  { num: '100%', label: t('who_s3') },
                  { num: '5+',   label: t('who_s4') },
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

      {/* ─── PROCESSUS ──────────────────────────────────────────────────────── */}
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
                        whileInView={{ scale: [0.5, 1.2, 1] }} viewport={viewOpts}
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

      {/* ─── CTA BANNER ─────────────────────────────────────────────────────── */}
      <section ref={ctaRef} className="py-20 relative overflow-hidden">
        <motion.div className="absolute inset-0 bg-gradient-to-br from-saim-600 to-saim-900" style={{ y: ctaBgY }} />
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
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}
            transition={{ delay: 0.15 }}>
            {t('cta_desc')}
          </motion.p>
          <motion.div className="flex flex-wrap justify-center gap-4"
            variants={staggerGrid} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <motion.button variants={cardItem} onClick={() => scrollTo('contact')}
              className="inline-flex items-center gap-2 bg-white text-saim-700 hover:bg-saim-50 font-extrabold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all text-base">
              {icons.phone('w-4 h-4')}
              {t('cta_btn1')}
            </motion.button>
            <motion.a variants={cardItem}
              href="/programme-saim.pdf" download="Programme-SAIM-Course.pdf"
              className="inline-flex items-center gap-2 border-2 border-white/60 hover:border-white text-white hover:bg-white/10 font-bold px-8 py-3.5 rounded-full transition-all text-base">
              {icons.document('w-4 h-4')}
              {t('cta_btn2')}
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* ─── CONTACT ────────────────────────────────────────────────────────── */}
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
                  { icon: 'mail',  label: t('contact_email'),    value: 'partners@mysaim.cm' },
                  { icon: 'phone', label: t('contact_phone'),    value: '(+237) 677 1 88 62' },
                  { icon: 'pin',   label: t('contact_location'), value: t('contact_location_val') },
                ].map(item => (
                  <motion.div key={item.label} variants={cardItem}
                    className="flex items-center gap-4 p-4 bg-saim-50 rounded-xl">
                    <span className="w-10 h-10 bg-saim-100 text-saim-600 rounded-full flex items-center justify-center flex-shrink-0">
                      {icons[item.icon]('w-5 h-5')}
                    </span>
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
