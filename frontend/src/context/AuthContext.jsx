import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser]             = useState(null)
  const [token, setToken]           = useState(() => localStorage.getItem('saim_token'))
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading]       = useState(true)

  const hydrateUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me')
      const { enrollments: enr = [], ...userData } = res.data
      setUser(userData)
      setEnrollments(enr)
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) {
      hydrateUser()
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token: t, user: u } = res.data
    localStorage.setItem('saim_token', t)
    setToken(t)
    // /auth/login doesn't return enrollments yet — hydrate via /me
    setUser(u)
    try {
      const meRes = await api.get('/auth/me')
      const { enrollments: enr = [], ...userData } = meRes.data
      setUser(userData)
      setEnrollments(enr)
    } catch {}
    return u
  }

  const loginWithGoogle = async (credential) => {
    const res = await api.post('/auth/google', { credential })
    const { token: t, user: u } = res.data
    localStorage.setItem('saim_token', t)
    setToken(t)
    setUser(u)
    try {
      const meRes = await api.get('/auth/me')
      const { enrollments: enr = [], ...userData } = meRes.data
      setUser(userData)
      setEnrollments(enr)
    } catch {}
    return u
  }

  const register = async (data) => {
    const res = await api.post('/auth/register', data)
    const { token: t, user: u } = res.data
    localStorage.setItem('saim_token', t)
    setToken(t)
    setUser(u)
    try {
      const meRes = await api.get('/auth/me')
      const { enrollments: enr = [], ...userData } = meRes.data
      setUser(userData)
      setEnrollments(enr)
    } catch {}
    return u
  }

  const logout = () => {
    localStorage.removeItem('saim_token')
    setToken(null)
    setUser(null)
    setEnrollments([])
  }

  // Refresh enrollments after payment confirmation
  const refreshEnrollments = async () => {
    try {
      const res = await api.get('/auth/me')
      const { enrollments: enr = [], ...userData } = res.data
      setUser(userData)
      setEnrollments(enr)
    } catch {}
  }

  // Returns 'paid' | 'trial' | null
  const getEnrollmentStatus = (formationId) => {
    const e = enrollments.find(e => e.formation_id === formationId)
    return e?.status ?? null
  }

  const isPaid = (formationId) => getEnrollmentStatus(formationId) === 'paid'
  const isEnrolled = (formationId) => getEnrollmentStatus(formationId) !== null

  // moduleIndex = 0-based position of the module in its formation
  const canAccessModule = (formationId, moduleIndex) => {
    const status = getEnrollmentStatus(formationId)
    if (!status) return false
    if (status === 'paid') return true
    return moduleIndex === 0 // trial = first module only
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading, enrollments,
      login, loginWithGoogle, register, logout, refreshEnrollments,
      isPaid, isEnrolled, canAccessModule, getEnrollmentStatus,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
