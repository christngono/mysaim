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

// ─── Données programmes ───────────────────────────────────────────────────────
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
export default function AboutPage({ onGoLanding, onLoginClick, onFormationPage }) {
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
              <img src="/images/saimlogo.png" alt="SAIM" className="h-10" />
            </button>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1 flex-1 ml-6">
              <button onClick={onGoLanding}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-saim-600 hover:bg-saim-50 rounded-lg transition-colors">
                Accueil
              </button>
              <button className="px-3 py-2 text-sm font-semibold text-saim-600 bg-saim-50 rounded-lg cursor-default">
                À propos
              </button>
              <button onClick={() => onFormationPage?.()}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-saim-600 hover:bg-saim-50 rounded-lg transition-colors">
                {t('nav_training')}
              </button>
              <button onClick={onGoLanding}
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
                Accueil
              </button>
              <button className="block w-full text-left px-4 py-2 text-sm text-saim-600 font-semibold bg-saim-50 rounded-lg">
                À propos
              </button>
              <button onClick={() => { onFormationPage?.(); setMenuOpen(false) }}
                className="block w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                {t('nav_training')}
              </button>
              <button onClick={() => { onGoLanding(); setMenuOpen(false) }}
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
      <section className="relative pt-16 overflow-hidden bg-gradient-to-br from-saim-700 via-saim-600 to-saim-800">
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
              Retour à l'accueil
            </button>
            <span className="inline-block bg-white/15 backdrop-blur text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
              À propos de nous
            </span>
            <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              SAIM AI — L'IA au service<br className="hidden lg:block" /> de la prospérité africaine
            </h1>
            <p className="text-white/80 text-lg max-w-2xl leading-relaxed">
              Nous accompagnons les entreprises et institutions africaines dans l'adoption et la maîtrise de l'Intelligence Artificielle comme levier de transformation stratégique.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── VISION ───────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div className="text-center mb-10"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <span className="section-chip">Notre vision</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-saim-800 mt-3">L'IA comme outil stratégique africain</h2>
          </motion.div>
          <motion.div className="space-y-5 text-slate-600 text-lg leading-relaxed"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <p>
              Chez SAIM, nous sommes animés par une conviction profonde : l'Intelligence Artificielle est un levier de transformation incontournable pour les entreprises et institutions africaines. Notre vision est de les accompagner dans l'adoption et la maîtrise de l'IA, non pas comme une simple technologie importée, mais comme un{' '}
              <strong className="text-saim-700">outil stratégique, adapté à nos réalités et contrôlé par l'humain</strong>.
            </p>
            <p>
              Nous croyons fermement que pour exploiter pleinement le potentiel de l'IA, il est impératif de comprendre ses mécanismes, de l'utiliser de manière responsable et de l'intégrer intelligemment dans nos écosystèmes locaux. Notre mission est de faire de l'IA un moteur de{' '}
              <strong className="text-saim-700">productivité, d'innovation et de croissance durable</strong> pour le continent africain.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── SERVICES ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-14"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <span className="section-chip">Nos services</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-saim-800 mt-3">Expertise et Solutions sur Mesure</h2>
          </motion.div>
          <motion.div className="grid md:grid-cols-2 gap-8"
            variants={staggerGrid} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <motion.div variants={cardItem}
              className="card p-8 hover:shadow-xl transition-all group border-2 border-transparent hover:border-saim-100">
              <div className="w-14 h-14 rounded-2xl bg-saim-100 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                🎓
              </div>
              <h3 className="text-xl font-extrabold text-saim-800 mb-4">
                Formation Spécialisée pour Entreprises et Institutions
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Nous concevons et dispensons des programmes de formation sur mesure, adaptés aux besoins spécifiques de chaque structure. Que ce soit pour initier vos équipes aux fondamentaux de l'IA, les former aux outils génératifs ou les accompagner dans des projets complexes, nos formations sont conçues pour{' '}
                <strong className="text-saim-700">transformer la théorie en compétences opérationnelles</strong>.
              </p>
            </motion.div>
            <motion.div variants={cardItem}
              className="card p-8 hover:shadow-xl transition-all group border-2 border-transparent hover:border-violet-100">
              <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                🤖
              </div>
              <h3 className="text-xl font-extrabold text-saim-800 mb-4">
                Déploiement de Solutions d'Intelligence Artificielle sur Mesure
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Au-delà de la formation, nous accompagnons les entreprises dans l'intégration concrète de l'IA. Nous développons et déployons des{' '}
                <strong className="text-violet-700">solutions d'IA personnalisées</strong>, basées sur vos données et vos objectifs métier, pour optimiser vos processus, améliorer votre prise de décision et créer de la valeur ajoutée.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── EXPÉRIENCE ───────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-14"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <span className="section-chip">Notre expérience</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-saim-800 mt-3 mb-4">Des Partenariats Stratégiques et des Résultats Concrets</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Nous avons eu le privilège de collaborer avec des acteurs majeurs et de contribuer à la montée en compétence de centaines de professionnels.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
            variants={staggerGrid} initial="hidden" whileInView="visible" viewport={viewOpts}>
            {[
              { num: '300+', label: 'Professionnels formés' },
              { num: '4',    label: 'Institutions partenaires' },
              { num: '7+',   label: "Ans d'expérience" },
              { num: '5+',   label: 'Pays couverts' },
            ].map((s, i) => (
              <motion.div key={i} variants={cardItem} className="card p-6 text-center">
                <div className="text-3xl font-extrabold text-saim-600 mb-1">{s.num}</div>
                <div className="text-sm text-slate-500 font-medium">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* EDC Gallery */}
          <motion.div className="mb-14"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-10 bg-saim-500 rounded-full flex-shrink-0" />
              <h3 className="font-extrabold text-saim-800 text-lg">EDC — Electricity Development Corporation</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {galleryEdc.map((src, i) => (
                <motion.div key={i}
                  className="aspect-video rounded-xl overflow-hidden shadow-md bg-slate-100"
                  whileHover={{ scale: 1.03 }} transition={{ duration: 0.3 }}>
                  <img src={src} alt={`Formation EDC ${i + 1}`} className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* MINTP Gallery */}
          <motion.div className="mb-10"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-10 bg-amber-500 rounded-full flex-shrink-0" />
              <h3 className="font-extrabold text-saim-800 text-lg">MINTP — Ministère des Travaux Publics</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {galleryMintp.map((src, i) => (
                <motion.div key={i}
                  className="aspect-video rounded-xl overflow-hidden shadow-md bg-slate-100"
                  whileHover={{ scale: 1.03 }} transition={{ duration: 0.3 }}>
                  <img src={src} alt={`Formation MINTP ${i + 1}`} className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Autres partenaires */}
          <motion.div className="p-6 bg-saim-50 rounded-2xl border border-saim-100"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <p className="text-xs font-bold text-saim-600 uppercase tracking-widest mb-4">Autres partenaires institutionnels</p>
            <div className="flex flex-wrap gap-3">
              {[
                'Port Autonome de Kribi',
                'Ministère de la Jeunesse & Éducation Civique',
                'Établissements scolaires secondaires',
                'Universités camerounaises',
              ].map(p => (
                <span key={p} className="text-sm bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-full font-medium shadow-sm">
                  {p}
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
              Notre équipe
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mt-2 mb-3">
              Des Experts Passionnés à Votre Service
            </h2>
            <p className="text-white/65 max-w-xl mx-auto">
              Notre force réside dans notre équipe : une synergie de professionnels certifiés et passionnés par l'Intelligence Artificielle.
            </p>
          </motion.div>
          <motion.div className="grid sm:grid-cols-3 gap-6"
            variants={staggerGrid} initial="hidden" whileInView="visible" viewport={viewOpts}>
            {[
              { icon: '🏆', num: '7+',   title: "Ans d'expérience",        desc: "Dans la formation et le consulting en solutions d'IA" },
              { icon: '🎓', num: '100%', title: 'Ingénieurs certifiés',     desc: 'Formation et consulting en Intelligence Artificielle' },
              { icon: '🌍', num: '300+', title: 'Professionnels formés',    desc: 'Accompagnés dans leur transformation digitale' },
            ].map((item, i) => (
              <motion.div key={i} variants={cardItem}
                className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-4xl font-extrabold text-white mb-1">{item.num}</div>
                <div className="text-saim-300 font-bold text-sm mb-2">{item.title}</div>
                <div className="text-white/55 text-sm leading-relaxed">{item.desc}</div>
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
            <span className="section-chip">Nos valeurs</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-saim-800 mt-3">Les Piliers de Notre Engagement</h2>
          </motion.div>
          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerGrid} initial="hidden" whileInView="visible" viewport={viewOpts}>
            {[
              {
                icon: '🔒', color: 'saim',
                title: 'Souveraineté des Données',
                desc: "Nous prônons une gestion des données qui respecte la confidentialité et la propriété, essentielles pour la confiance numérique en Afrique.",
              },
              {
                icon: '🌍', color: 'amber',
                title: 'Personnalisation aux Besoins Locaux',
                desc: "L'IA doit être un outil flexible, capable de s'adapter aux spécificités culturelles, économiques et sociales de nos régions.",
              },
              {
                icon: '🧑‍💼', color: 'emerald',
                title: 'Contrôle Humain sur les IA',
                desc: "L'IA doit toujours rester un outil au service de l'humain, sous son contrôle, pour augmenter ses capacités et non le remplacer.",
              },
              {
                icon: '📈', color: 'violet',
                title: 'Viabilité et Impact Réel',
                desc: "Nos solutions et formations visent des résultats concrets et durables, garantissant une valeur ajoutée mesurable pour nos partenaires.",
              },
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
                  <div className={`w-12 h-12 rounded-xl ${vcm.icon} flex items-center justify-center text-2xl mb-5`}>
                    {v.icon}
                  </div>
                  <h3 className={`font-extrabold mb-3 text-sm leading-snug ${vcm.title}`}>{v.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{v.desc}</p>
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
            Prêt à Transformer Votre Organisation ?
          </motion.h2>
          <motion.p className="text-white/75 text-lg mb-10 max-w-2xl mx-auto"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            Rejoignez plus de 300 professionnels qui ont déjà amélioré leur productivité avec SAIM.
          </motion.p>
          <motion.div className="flex flex-wrap justify-center gap-4"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewOpts}>
            <button onClick={() => onFormationPage?.()}
              className="inline-flex items-center gap-2 bg-white text-saim-700 hover:bg-saim-50 font-extrabold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Voir nos formations →
            </button>
            <button onClick={onGoLanding}
              className="inline-flex items-center gap-2 border-2 border-white/60 hover:border-white text-white hover:bg-white/10 font-bold px-8 py-3.5 rounded-full transition-all">
              Retour à l'accueil
            </button>
          </motion.div>
        </div>
      </section>

      <Footer scrollTo={onGoLanding} />
    </div>
  )
}
