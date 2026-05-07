import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import { useLang } from './context/LangContext'
import LandingPage from './pages/LandingPage'
import AboutPage from './pages/AboutPage'
import FormationPage from './pages/FormationPage'
import ContactPage from './pages/ContactPage'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AuthModal from './components/AuthModal'

export default function App() {
  const { user, loading } = useAuth()
  const { lang } = useLang()
  const [view, setView]       = useState('landing')   // 'landing' | 'about' | 'formation' | 'contact' | 'dashboard'
  const [authMode, setAuthMode] = useState(null)      // null | 'login' | 'register'

  // Add section-chip utility class dynamically
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-saim-50 via-white to-saim-100">
      <div className="flex flex-col items-center gap-8">
        {/* Professional Logo Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <motion.div
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(2, 132, 199, 0.7)",
                "0 0 0 20px rgba(2, 132, 199, 0)",
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full"
          />
          <img 
            src="/uploads/apropos/saim_ai_logo_fond.png" 
            alt="SAIM" 
            className="h-24 relative z-10"
          />
        </motion.div>

        {/* Loading Text */}
        <div className="flex flex-col items-center gap-2">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-saim-600 font-semibold text-lg"
          >
            SAIM
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-slate-500 text-sm"
          >
            Plateforme de Formation IA
          </motion.p>
        </div>

        {/* Progress Bar */}
        <div className="w-40 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-saim-500 via-saim-600 to-saim-700 rounded-full"
          />
        </div>
      </div>
    </div>
  )

  const handleAuthSuccess = () => {
    setAuthMode(null)
    setView('dashboard')
  }

  // Redirect to dashboard if user is logged in and tries to go there
  if (view === 'dashboard' && !user) {
    setView('landing')
    setAuthMode('login')
  }

  return (
    <>
      {view === 'landing' && (
        <LandingPage
          onLoginClick={() => setAuthMode('login')}
          onRegisterClick={() => setAuthMode('register')}
          onAboutPage={() => setView('about')}
          onFormationPage={() => setView('formation')}
          onContactPage={() => setView('contact')}
          onEnterDashboard={() => {
            if (user) setView('dashboard')
            else setAuthMode('login')
          }}
        />
      )}

      {view === 'about' && (
        <AboutPage
          onGoLanding={() => setView('landing')}
          onLoginClick={() => setAuthMode('login')}
          onFormationPage={() => setView('formation')}
          onContactPage={() => setView('contact')}
        />
      )}

      {view === 'formation' && (
        <FormationPage
          onGoLanding={() => setView('landing')}
          onAboutPage={() => setView('about')}
          onLoginClick={() => setAuthMode('login')}
          onContactPage={() => setView('contact')}
        />
      )}

      {view === 'contact' && (
        <ContactPage
          onGoLanding={() => setView('landing')}
          onAboutPage={() => setView('about')}
          onFormationPage={() => setView('formation')}
          onContactPage={() => setView('contact')}
          onLoginClick={() => setAuthMode('login')}
        />
      )}

      {view === 'dashboard' && user && user.role === 'admin' && (
        <AdminDashboard onGoLanding={() => setView('landing')} />
      )}

      {view === 'dashboard' && user && user.role !== 'admin' && (
        <UserDashboard onGoLanding={() => setView('landing')} />
      )}

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