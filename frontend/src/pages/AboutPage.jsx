import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { useT } from '../i18n/translations'
import LangToggle from '../components/LangToggle'
import Footer from '../components/Footer'

const fadeUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}
const staggerGrid = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}
const cardItem = {
  hidden:  { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1,   transition: { duration: 0.5 } },
}
const viewOpts = { once: true, margin: '-60px' }

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const icons = {
  graduation: (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>,
  chip:       (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" /></svg>,
  trophy:     (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" /></svg>,
  globe:      (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253M3 12a8.959 8.959 0 011.284-4.418M12 10.5a9 9 0 01.716 9.253" /></svg>,
  lock:       (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>,
  mappin:     (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>,
  user:       (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
  chart:      (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>,
}

// ─── Données galeries ─────────────────────────────────────────────────────────
const galleryEdc = [
  '/uploads/apropos/image_edc1.jpeg',
  '/uploads/apropos/image_edc2.jpeg',
  '/uploads/apropos/image_edc3.jpeg',
  '/uploads/apropos/image3_edc.jpeg',
]
const galleryMintp = [
  '/uploads/apropos/formationMINTP1.jpeg',
  '/uploads/apropos/image_mintp2.jpeg',
  '/uploads/apropos/image_mintp3.jpeg',
]

// ─── Composant principal ──────────────────────────────────────────────────────
export default function AboutPage({ onGoLanding, onLoginClick, onFormationPage, onCatalogPage, onContactPage }) {
  const { user, logout } = useAuth()
  const { lang } = useLang()
  const t = useT(lang)

  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">

      {/* ─── NAVBAR ──────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">

            {/* Logo */}
            <button onClick={onGoLanding} className="flex-shrink-0">
              <img src="/uploads/apropos/saim_ai_logo_fond.png" alt="SAIM" className="h-10" />
            </button>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1 flex-1 ml-6">
              <button onClick={onGoLanding}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-saim-600 hover:bg-saim-50 rounded-lg transition-colors">
                {t('nav_home')}
              </button>
              <button className="px-3 py-2 text-sm font-semibold text-saim-600 bg-saim-50 rounded-lg cursor-default">
                {t('nav_about')}
              </button>
              <button onClick={() => onCatalogPage?.()}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-saim-600 hover:bg-saim-50 rounded-lg transition-colors">
                {t('nav_catalog')}
              </button>
              <button onClick={() => onFormationPage?.()}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-saim-600 hover:bg-saim-50 rounded-lg transition-colors">
                {t('nav_training')}
              </button>
              <button onClick={onContactPage}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-saim-600 hover:bg-saim-50 rounded-lg transition-colors">
                {t('nav_contact')}
              </button>
            </div>

            {/* Right side */}
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

            {/* Mobile burger */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden ml-auto p-2 rounded-lg text-slate-600 hover:bg-slate-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden border-t border-slate-100 py-3 space-y-1">
              <button onClick={() => { onGoLanding(); setMenuOpen(false) }}
                className="block w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                {t('nav_home')}
              </button>
              <button className="block w-full text-left px-4 py-2 text-sm text-saim-600 font-semibold bg-saim-50 rounded-lg">
                {t('nav_about')}
              </button>
              <button onClick={() => { onCatalogPage?.(); setMenuOpen(false) }}
                className="block w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                {t('nav_catalog')}
              </button>
              <button onClick={() => { onFormationPage?.(); setMenuOpen(false) }}
                className="block w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                {t('nav_training')}
              </button>
              <button onClick={() => { onContactPage?.(); setMenuOpen(false) }}
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
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/uploads/apropos/image_apropos.png" alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-br from-saim-800/85 via-saim-700/75 to-saim-900/85" />
        </div>
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
              {t('ab_back')}
            </button>
            <span className="inline-block bg-white/15 backdrop-blur text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
              {t('ab_hero_chip')}
            </span>
            <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              {t('ab_hero_title')}
            </h1>
            <p className="text-white/80 text-lg max-w-2xl leading-relaxed">
              {t('ab_hero_sub')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── VISION ───────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div className="text-center mb-10"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <span className="section-chip">{t('ab_vision_chip')}</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-saim-800 mt-3">{t('ab_vision_title')}</h2>
          </motion.div>
          <motion.div className="space-y-5 text-slate-600 text-lg leading-relaxed"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <p>{t('ab_vision_p1')}</p>
            <p>{t('ab_vision_p2')}</p>
          </motion.div>
        </div>
      </section>

      {/* ─── SERVICES ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-14"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <span className="section-chip">{t('ab_svc_chip')}</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-saim-800 mt-3">{t('ab_svc_title')}</h2>
          </motion.div>
          <motion.div className="grid md:grid-cols-2 gap-8"
            variants={staggerGrid} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <motion.div variants={cardItem}
              className="card p-8 hover:shadow-xl transition-all group border-2 border-transparent hover:border-saim-100">
              <div className="w-14 h-14 rounded-2xl bg-saim-100 text-saim-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {icons.graduation('w-7 h-7')}
              </div>
              <h3 className="text-xl font-extrabold text-saim-800 mb-4">{t('ab_svc1_title')}</h3>
              <p className="text-slate-600 leading-relaxed">{t('ab_svc1_desc')}</p>
            </motion.div>
            <motion.div variants={cardItem}
              className="card p-8 hover:shadow-xl transition-all group border-2 border-transparent hover:border-violet-100">
              <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {icons.chip('w-7 h-7')}
              </div>
              <h3 className="text-xl font-extrabold text-saim-800 mb-4">{t('ab_svc2_title')}</h3>
              <p className="text-slate-600 leading-relaxed">{t('ab_svc2_desc')}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── EXPÉRIENCE ───────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-14"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <span className="section-chip">{t('ab_exp_chip')}</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-saim-800 mt-3 mb-4">{t('ab_exp_title')}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">{t('ab_exp_sub')}</p>
          </motion.div>

          {/* Stats */}
          <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
            variants={staggerGrid} initial="hidden" whileInView="visible" viewport={viewOpts}>
            {[
              { num: '300+', labelKey: 'ab_ts3_title' },
              { num: '4',    labelKey: 'ab_exp_inst'  },
              { num: '7+',   labelKey: 'ab_exp_years' },
              { num: '5+',   labelKey: 'about_stat3'  },
            ].map((s, i) => (
              <motion.div key={i} variants={cardItem} className="card p-6 text-center">
                <div className="text-3xl font-extrabold text-saim-600 mb-1">{s.num}</div>
                <div className="text-sm text-slate-500 font-medium">{t(s.labelKey)}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* EDC Gallery */}
          <motion.div className="mb-14"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-10 bg-saim-500 rounded-full flex-shrink-0" />
              <h3 className="font-extrabold text-saim-800 text-lg">{t('ab_edc_label')}</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {galleryEdc.map((src, i) => (
                <motion.div key={i}
                  className="aspect-video rounded-xl overflow-hidden shadow-md bg-slate-100"
                  whileHover={{ scale: 1.03 }} transition={{ duration: 0.3 }}>
                  <img src={src} alt={`Formation EDC ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* MINTP Gallery */}
          <motion.div className="mb-10"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-10 bg-amber-500 rounded-full flex-shrink-0" />
              <h3 className="font-extrabold text-saim-800 text-lg">{t('ab_mintp_label')}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {galleryMintp.map((src, i) => (
                <motion.div key={i}
                  className="aspect-video rounded-xl overflow-hidden shadow-md bg-slate-100"
                  whileHover={{ scale: 1.03 }} transition={{ duration: 0.3 }}>
                  <img src={src} alt={`Formation MINTP ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Autres partenaires */}
          <motion.div className="p-6 bg-saim-50 rounded-2xl border border-saim-100"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <p className="text-xs font-bold text-saim-600 uppercase tracking-widest mb-4">{t('ab_partners_lbl')}</p>
            <div className="flex flex-wrap gap-3">
              {['ab_partner1', 'ab_partner2', 'ab_partner3', 'ab_partner4'].map(key => (
                <span key={key} className="text-sm bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-full font-medium shadow-sm">
                  {t(key)}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── ÉQUIPE ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-saim-800">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-12"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <span className="inline-block bg-white/15 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
              {t('ab_team_chip')}
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mt-2 mb-3">
              {t('ab_team_title')}
            </h2>
            <p className="text-white/65 max-w-xl mx-auto">
              {t('ab_team_sub')}
            </p>
          </motion.div>
          <motion.div className="grid sm:grid-cols-3 gap-6"
            variants={staggerGrid} initial="hidden" whileInView="visible" viewport={viewOpts}>
            {[
              { iconKey: 'trophy',     num: '7+',   titleKey: 'ab_ts1_title', descKey: 'ab_ts1_desc' },
              { iconKey: 'graduation', num: '100%', titleKey: 'ab_ts2_title', descKey: 'ab_ts2_desc' },
              { iconKey: 'globe',      num: '300+', titleKey: 'ab_ts3_title', descKey: 'ab_ts3_desc' },
            ].map((item, i) => (
              <motion.div key={i} variants={cardItem}
                className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto mb-4">
                  {icons[item.iconKey]('w-7 h-7')}
                </div>
                <div className="text-4xl font-extrabold text-white mb-1">{item.num}</div>
                <div className="text-saim-300 font-bold text-sm mb-2">{t(item.titleKey)}</div>
                <div className="text-white/55 text-sm leading-relaxed">{t(item.descKey)}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── VALEURS ──────────────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-14"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <span className="section-chip">{t('ab_val_chip')}</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-saim-800 mt-3">{t('ab_val_title')}</h2>
          </motion.div>
          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerGrid} initial="hidden" whileInView="visible" viewport={viewOpts}>
            {[
              { iconKey: 'lock',   color: 'saim',    titleKey: 'ab_v1_title', descKey: 'ab_v1_desc' },
              { iconKey: 'mappin', color: 'amber',   titleKey: 'ab_v2_title', descKey: 'ab_v2_desc' },
              { iconKey: 'user',   color: 'emerald', titleKey: 'ab_v3_title', descKey: 'ab_v3_desc' },
              { iconKey: 'chart',  color: 'violet',  titleKey: 'ab_v4_title', descKey: 'ab_v4_desc' },
            ].map((v, i) => {
              const vcm = {
                saim:    { bg: 'bg-saim-50',    icon: 'bg-saim-100 text-saim-600',       title: 'text-saim-700' },
                amber:   { bg: 'bg-amber-50',   icon: 'bg-amber-100 text-amber-600',     title: 'text-amber-700' },
                emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', title: 'text-emerald-700' },
                violet:  { bg: 'bg-violet-50',  icon: 'bg-violet-100 text-violet-600',   title: 'text-violet-700' },
              }[v.color]
              return (
                <motion.div key={i} variants={cardItem}
                  className={`card p-7 ${vcm.bg} hover:shadow-lg transition-all`}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                  <div className={`w-12 h-12 rounded-xl ${vcm.icon} flex items-center justify-center mb-5`}>
                    {icons[v.iconKey]('w-6 h-6')}
                  </div>
                  <h3 className={`font-extrabold mb-3 text-sm leading-snug ${vcm.title}`}>{t(v.titleKey)}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{t(v.descKey)}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA FINAL ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-saim-600 to-saim-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-96 h-96 bg-saim-400/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            {t('ab_cta_title')}
          </motion.h2>
          <motion.p className="text-white/75 text-lg mb-10 max-w-2xl mx-auto"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            {t('ab_cta_desc')}
          </motion.p>
          <motion.div className="flex flex-wrap justify-center gap-4"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <button onClick={() => onFormationPage?.()}
              className="inline-flex items-center gap-2 bg-white text-saim-700 hover:bg-saim-50 font-extrabold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              {t('ab_cta_btn1')}
            </button>
            <button onClick={onGoLanding}
              className="inline-flex items-center gap-2 border-2 border-white/60 hover:border-white text-white hover:bg-white/10 font-bold px-8 py-3.5 rounded-full transition-all">
              {t('ab_cta_btn2')}
            </button>
          </motion.div>
        </div>
      </section>

      <Footer
        onGoLanding={onGoLanding}
        onAboutPage={() => {}}
        onFormationPage={onFormationPage}
        onContactPage={onContactPage}
      />
    </div>
  )
}
