import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FormationDetailView from '../components/FormationDetailView'
import api from '../api/axios'

export default function FormationDetailRoute({
  onLoginClick, onGoLanding, onAboutPage, onCatalogPage, onFormationPage, onContactPage,
}) {
  const { slug }     = useParams()
  const navigate     = useNavigate()
  const { user }     = useAuth()
  const { lang }     = useLang()

  const [formation, setFormation] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  // Fetch formation by slug
  useEffect(() => {
    setLoading(true)
    api.get(`/courses/public/slug/${slug}`)
      .then(r => setFormation(r.data))
      .catch(() => navigate('/formations', { replace: true }))
      .finally(() => setLoading(false))
  }, [slug, navigate])

  // If logged in, merge enrollment status on top
  useEffect(() => {
    if (!user || !formation) return
    api.get('/courses/formations')
      .then(r => {
        const match = r.data.find(x => x.id === formation.id)
        if (match) setFormation(prev => ({ ...prev, enrollment_status: match.enrollment_status }))
      })
      .catch(() => {})
  }, [user, formation?.id])

  const handleEnroll = async () => {
    if (enrolling) return
    setEnrolling(true)
    try {
      await api.post('/courses/enroll', { formation_id: formation.id })
      navigate('/dashboard')
    } catch {
      setEnrolling(false)
    }
  }

  const scrollTo = (id) => {
    if (id === 'hero') { onGoLanding(); return }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar
          onLoginClick={onLoginClick}
          scrollTo={scrollTo}
          onAboutPage={onAboutPage}
          onCatalogPage={onCatalogPage}
          onFormationPage={onFormationPage}
          onContactPage={onContactPage}
        />
        <div className="flex-1 pt-16 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-saim-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!formation) return null

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        onLoginClick={onLoginClick}
        scrollTo={scrollTo}
        onAboutPage={onAboutPage}
        onCatalogPage={onCatalogPage}
        onFormationPage={onFormationPage}
        onContactPage={onContactPage}
      />
      <div className="flex-1 pt-16">
        <FormationDetailView
          formation={formation}
          lang={lang}
          user={user}
          onBack={() => navigate('/formations')}
          onLoginClick={onLoginClick}
          onEnroll={handleEnroll}
          onContinue={() => navigate('/dashboard')}
          onPay={() => navigate('/dashboard')}
          onWaitlist={async () => {
            try {
              await api.post('/courses/waitlist', { formation_id: formation.id })
              setFormation(prev => ({ ...prev, _waitlisted: true }))
            } catch {}
          }}
          isOnWaitlist={formation._waitlisted || false}
        />
      </div>
      <Footer />
    </div>
  )
}
