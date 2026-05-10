import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { useT } from '../i18n/translations'
import LangToggle from '../components/LangToggle'
import Footer from '../components/Footer'
import api from '../api/axios'
import { clean } from '../utils/sanitize'

const fadeUp   = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }
const fadeLeft = { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6 } } }
const fadeRight = { hidden: { opacity: 0, x: 40  }, visible: { opacity: 1, x: 0, transition: { duration: 0.6 } } }
const viewOpts = { once: true, amount: 0.2 }

const mailIcon  = (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
const phoneIcon = (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" /></svg>
const pinIcon   = (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
const checkIcon = (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>

export default function ContactPage({ onGoLanding, onAboutPage, onFormationPage, onCatalogPage, onLoginClick, onContactPage }) {
  const { user, logout } = useAuth()
  const { lang }         = useLang()
  const t                = useT(lang)

  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const [form, setForm]         = useState({ name: '', email: '', message: '' })
  const [status, setStatus]     = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setStatus('sending')
    try {
      await api.post('/contact', form)
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ─── NAVBAR ──────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">

            <button onClick={onGoLanding} className="flex-shrink-0">
              <img src="/uploads/apropos/saim_ai_logo_fond.png" alt="SAIM" className="h-10" />
            </button>

            <div className="hidden md:flex items-center gap-1 flex-1 ml-6">
              <button onClick={onAboutPage}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-saim-600 hover:bg-saim-50 rounded-lg transition-colors">
                {t('nav_about')}
              </button>
              <button onClick={() => onCatalogPage?.()}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-saim-600 hover:bg-saim-50 rounded-lg transition-colors">
                {t('nav_catalog')}
              </button>
              <button onClick={onFormationPage}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-saim-600 hover:bg-saim-50 rounded-lg transition-colors">
                {t('nav_training')}
              </button>
              <button className="px-3 py-2 text-sm font-semibold text-saim-600 bg-saim-50 rounded-lg cursor-default">
                {t('nav_contact')}
              </button>
            </div>

            <div className="hidden md:flex items-center gap-3 ml-auto">
              <a href="https://wa.me/237677518862" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-bold px-3 py-1.5 rounded-full transition-all active:scale-95">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
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
              <button onClick={() => { onAboutPage(); setMenuOpen(false) }}
                className="block w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                {t('nav_about')}
              </button>
              <button onClick={() => { onCatalogPage?.(); setMenuOpen(false) }}
                className="block w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                {t('nav_catalog')}
              </button>
              <button onClick={() => { onFormationPage(); setMenuOpen(false) }}
                className="block w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                {t('nav_training')}
              </button>
              <button className="block w-full text-left px-4 py-2 text-sm text-saim-600 font-semibold bg-saim-50 rounded-lg">
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

      {/* ─── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 overflow-hidden bg-gradient-to-br from-saim-700 via-saim-600 to-saim-800">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-10 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-96 h-96 rounded-full bg-saim-400/10 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="text-center max-w-2xl mx-auto">
            <button onClick={onGoLanding}
              className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8 transition-colors group">
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {lang === 'en' ? 'Back to home' : 'Retour à l\'accueil'}
            </button>
            <span className="inline-block bg-white/15 backdrop-blur text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
              {t('contact_hero_chip')}
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
              {t('contact_hero_title')}
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              {t('contact_hero_sub')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── CONTENU PRINCIPAL ───────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* ── Colonne gauche : image + infos + réseaux ── */}
            <motion.div
              variants={fadeLeft} initial="hidden" whileInView="visible" viewport={viewOpts}
              className="space-y-8">

              {/* Image */}
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="/uploads/apropos/facebook_pub3.png"
                  alt="SAIM Formation"
                  className="w-full object-cover"
                />
              </div>

              {/* Infos de contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-extrabold text-saim-800">
                  {t('contact_label')}
                </h3>
                {[
                  { icon: mailIcon,  label: t('contact_email'),    value: 'partners@mysaim.com' },
                  { icon: phoneIcon, label: t('contact_phone'),    value: '(+237) 677 1 88 62' },
                  { icon: pinIcon,   label: t('contact_location'), value: t('contact_location_val') },
                ].map(item => (
                  <div key={item.label}
                    className="flex items-center gap-4 p-4 bg-saim-50 rounded-xl">
                    <span className="w-10 h-10 bg-saim-100 text-saim-600 rounded-full flex items-center justify-center flex-shrink-0">
                      {item.icon('w-5 h-5')}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{item.label}</div>
                      <div className="font-medium text-slate-700">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Réseaux sociaux */}
              <div>
                <h3 className="text-lg font-extrabold text-saim-800 mb-4">
                  {t('contact_follow')}
                </h3>
                <div className="flex gap-3">
                  <a href="https://web.facebook.com/profile.php?id=61589286779656"
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-5 py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-sm rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </a>
                  <a href="https://www.linkedin.com/company/saim-course"
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-5 py-3 bg-[#0A66C2] hover:bg-[#095bb5] text-white font-bold text-sm rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </a>
                  <a href="https://wa.me/237677518862"
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-5 py-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-sm rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>

            {/* ── Colonne droite : formulaire ── */}
            <motion.div
              variants={fadeRight} initial="hidden" whileInView="visible" viewport={viewOpts}>
              <div className="card p-8">
                <h2 className="text-2xl font-extrabold text-saim-800 mb-2">{t('contact_title')}</h2>
                <p className="text-slate-500 text-sm mb-8">{t('contact_sub')}</p>

                {status === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                        {checkIcon('w-9 h-9 text-emerald-500')}
                      </div>
                    </div>
                    <h3 className="font-extrabold text-saim-800 text-lg mb-2">{t('dv_ok_title')}</h3>
                    <p className="text-slate-500 text-sm mb-6">{t('dv_ok_desc')}</p>
                    <button onClick={() => setStatus(null)} className="btn-primary px-6 py-2 text-sm">
                      {lang === 'en' ? 'Send another message' : 'Envoyer un autre message'}
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="label">{t('contact_name_label')}</label>
                      <input type="text" className="input-field" placeholder="christian kemy"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: clean(e.target.value) }))} required />
                    </div>
                    <div>
                      <label className="label">{t('contact_email_label')}</label>
                      <input type="email" className="input-field" placeholder="kemy@gmail.com"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: clean(e.target.value) }))} required />
                    </div>
                    <div>
                      <label className="label">{t('contact_msg_label')}</label>
                      <textarea rows={5} className="input-field resize-none"
                        placeholder={lang === 'en' ? 'Your message...' : 'Votre message...'}
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: clean(e.target.value) }))} required />
                    </div>
                    {status === 'error' && (
                      <p className="text-sm text-red-600 font-medium">{t('contact_error')}</p>
                    )}
                    <button type="submit" className="btn-primary w-full justify-center"
                      disabled={status === 'sending'}>
                      {status === 'sending' ? t('contact_sending') : t('contact_send')}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      <Footer
        onGoLanding={onGoLanding}
        onAboutPage={onAboutPage}
        onFormationPage={onFormationPage}
        onContactPage={onContactPage}
      />
    </div>
  )
}
