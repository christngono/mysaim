import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import { useLang } from './context/LangContext'
import LandingPage from './pages/LandingPage'
import AboutPage from './pages/AboutPage'
import FormationPage from './pages/FormationPage'
import ContactPage from './pages/ContactPage'
import CatalogPage from './pages/CatalogPage'
import FormationDetailRoute from './pages/FormationDetailRoute'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AuthModal from './components/AuthModal'
import { toSlug } from './utils/slug'

export default function App() {
  const { user, loading } = useAuth()
  const { lang }          = useLang()
  const navigate          = useNavigate()
  const location          = useLocation()
  const [authMode, setAuthMode]     = useState(null)
  const [splashDone, setSplashDone] = useState(false)

  // Navigation helpers (keep callback API so pages need no changes)
  const goLanding   = ()           => navigate('/')
  const goAbout     = ()           => navigate('/a-propos')
  const goFormation = ()           => navigate('/entreprise')
  const goContact   = ()           => navigate('/contact')
  const goCatalog   = (f = null)   => f ? navigate(`/formations/${toSlug(f.title_fr)}`, { state: { formation: f } }) : navigate('/formations')
  const goDashboard = ()           => user ? navigate('/dashboard') : setAuthMode('login')

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  // Durée minimale du splash : 1.4 secondes
  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 1400)
    return () => clearTimeout(t)
  }, [])

  if (loading || !splashDone) return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0c1a2e 0%, #0f3460 50%, #1a1a4e 100%)' }}>

      {/* ── Particules flottantes ── */}
      {[...Array(14)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width:  `${6 + (i % 4) * 5}px`,
            height: `${6 + (i % 4) * 5}px`,
            left:   `${(i * 37 + 7) % 95}%`,
            top:    `${(i * 53 + 11) % 85}%`,
            background: i % 3 === 0
              ? 'rgba(56,189,248,0.25)'
              : i % 3 === 1
              ? 'rgba(99,102,241,0.2)'
              : 'rgba(255,255,255,0.08)',
          }}
          animate={{
            y:       [0, -22, 0],
            opacity: [0.4, 0.9, 0.4],
            scale:   [1, 1.3, 1],
          }}
          transition={{
            duration: 4.2 + (i % 4) * 2,
            delay:    i * 0.3,
            repeat:   Infinity,
            ease:     'easeInOut',
          }}
        />
      ))}

      {/* ── Anneaux tournants ── */}
      <div className="absolute">
        {[120, 170, 220].map((size, i) => (
          <motion.div
            key={size}
            className="absolute rounded-full border border-sky-400/20"
            style={{
              width:  size,
              height: size,
              top:    -size / 2,
              left:   -size / 2,
            }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 16.2 + i * 8, repeat: Infinity, ease: 'linear' }}
          >
            {/* Point lumineux sur l'anneau */}
            <motion.div
              className="absolute w-2 h-2 rounded-full bg-sky-400"
              style={{ top: -4, left: '50%', marginLeft: -4 }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.6 }}
            />
          </motion.div>
        ))}
      </div>

      {/* ── Halo pulsant derrière le logo ── */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 160, height: 160, background: 'radial-gradient(circle, rgba(56,189,248,0.18) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0.15, 0.6] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── Contenu central ── */}
      <div className="relative z-10 flex flex-col items-center gap-8">

        {/* Logo */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1,   y: 0   }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}>

          {/* Éclat derrière le logo */}
          <motion.div
            className="absolute inset-0 rounded-full blur-xl"
            style={{ background: 'rgba(56,189,248,0.3)' }}
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.img
            src="/uploads/apropos/saim_ai_logo_fond.png"
            alt="SAIM"
            className="h-28 relative z-10 drop-shadow-2xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
        </motion.div>

        {/* Textes */}
        <div className="flex flex-col items-center gap-1.5">
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.4em' }}
            animate={{ opacity: 1, letterSpacing: '0.15em' }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-white font-extrabold text-xl tracking-widest uppercase">
            SAIM
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-sky-300/80 text-sm font-medium tracking-wide">
            Plateforme de Formation IA
          </motion.p>
        </div>

        {/* Barre de progression */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="w-48 h-0.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1, delay: 0.8, ease: 'easeInOut' }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #38bdf8, #818cf8, #38bdf8)', backgroundSize: '200%' }}
          />
        </motion.div>

        {/* Points de chargement */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-sky-400"
              animate={{ opacity: [0.2, 1, 0.2], y: [0, -5, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>
    </div>
  )

  const handleAuthSuccess = () => {
    setAuthMode(null)
    navigate('/dashboard')
  }

  return (
    <>
      <Routes>
        <Route path="/" element={
          <LandingPage
            onLoginClick={() => setAuthMode('login')}
            onRegisterClick={() => setAuthMode('register')}
            onAboutPage={goAbout}
            onFormationPage={goFormation}
            onCatalogPage={goCatalog}
            onContactPage={goContact}
            onEnterDashboard={goDashboard}
          />
        } />

        <Route path="/a-propos" element={
          <AboutPage
            onGoLanding={goLanding}
            onLoginClick={() => setAuthMode('login')}
            onFormationPage={goFormation}
            onCatalogPage={goCatalog}
            onContactPage={goContact}
          />
        } />

        <Route path="/formations" element={
          <CatalogPage
            onGoLanding={goLanding}
            onLoginClick={() => setAuthMode('login')}
            onEnterDashboard={goDashboard}
            onAboutPage={goAbout}
            onFormationPage={goFormation}
            onContactPage={goContact}
            onCatalogPage={goCatalog}
          />
        } />

        <Route path="/formations/:slug" element={
          <FormationDetailRoute
            onLoginClick={() => setAuthMode('login')}
            onGoLanding={goLanding}
            onAboutPage={goAbout}
            onCatalogPage={goCatalog}
            onFormationPage={goFormation}
            onContactPage={goContact}
          />
        } />

        <Route path="/entreprise" element={
          <FormationPage
            onGoLanding={goLanding}
            onAboutPage={goAbout}
            onCatalogPage={goCatalog}
            onLoginClick={() => setAuthMode('login')}
            onContactPage={goContact}
          />
        } />

        <Route path="/contact" element={
          <ContactPage
            onGoLanding={goLanding}
            onAboutPage={goAbout}
            onFormationPage={goFormation}
            onCatalogPage={goCatalog}
            onContactPage={goContact}
            onLoginClick={() => setAuthMode('login')}
          />
        } />

        <Route path="/dashboard" element={
          !user
            ? <Navigate to="/" replace />
            : user.role === 'admin'
              ? <AdminDashboard onGoLanding={goLanding} />
              : <UserDashboard onGoLanding={goLanding} />
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </>
  )
}