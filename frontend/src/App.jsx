import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import { useLang } from './context/LangContext'
import LandingPage from './pages/LandingPage'
import AboutPage from './pages/AboutPage'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AuthModal from './components/AuthModal'

export default function App() {
  const { user, loading } = useAuth()
  const { lang } = useLang()
  const [view, setView]       = useState('landing')   // 'landing' | 'about' | 'dashboard'
  const [authMode, setAuthMode] = useState(null)      // null | 'login' | 'register'

  // Add section-chip utility class dynamically
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-saim-50">
      <div className="flex flex-col items-center gap-4">
        <img src="/images/saimlogo.png" alt="SAIM" className="h-16 animate-pulse" />
        <div className="h-1 w-32 bg-saim-100 rounded-full overflow-hidden">
          <div className="h-full bg-saim-500 rounded-full animate-pulse w-2/3" />
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