import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { useT } from '../i18n/translations'
import LangToggle from './LangToggle'
import { clean } from '../utils/sanitize'

const EyeIcon = ({ open }) => open
  ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
  : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>

function pwdChecks(pwd) {
  return {
    length: pwd.length >= 8,
    upper:  /[A-Z]/.test(pwd),
    lower:  /[a-z]/.test(pwd),
    digit:  /[0-9]/.test(pwd),
  }
}

function StrengthMeter({ pwd, lang }) {
  const checks = pwdChecks(pwd)
  const labels = {
    length: lang === 'fr' ? '8 caractères min.' : '8+ characters',
    upper:  lang === 'fr' ? 'Majuscule'         : 'Uppercase',
    lower:  lang === 'fr' ? 'Minuscule'         : 'Lowercase',
    digit:  lang === 'fr' ? 'Chiffre'           : 'Number',
  }
  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {Object.entries(checks).map(([k, ok]) => (
        <span key={k} className={`text-xs flex items-center gap-0.5 font-medium ${ok ? 'text-green-600' : 'text-slate-400'}`}>
          {ok
            ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          }
          {labels[k]}
        </span>
      ))}
    </div>
  )
}

function Divider({ label }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-slate-100" />
      <span className="text-xs text-slate-400 font-medium">{label}</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  )
}

export default function AuthModal({ mode = 'login', onClose, onSuccess }) {
  const [view, setView] = useState(mode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, loginWithGoogle, register } = useAuth()
  const { lang } = useLang()
  const t = useT(lang)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [showLoginPwd, setShowLoginPwd] = useState(false)

  const [regForm, setRegForm] = useState({
    email: '', first_name: '', last_name: '', phone: '',
    password: '', post: '', ai_level: '1', activity_sector: '',
  })
  const [showRegPwd, setShowRegPwd] = useState(false)

  const isStrong = Object.values(pwdChecks(regForm.password)).every(Boolean)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(loginForm.email, loginForm.password)
      onSuccess(user)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!isStrong) return
    setError('')
    setLoading(true)
    try {
      const user = await register({ ...regForm, ai_level: parseInt(regForm.ai_level) })
      onSuccess(user)
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || "Erreur d'inscription")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async (credentialResponse) => {
    setError('')
    setLoading(true)
    try {
      const user = await loginWithGoogle(credentialResponse.credential)
      onSuccess(user)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto animate-pop-in">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img src="/uploads/apropos/saim_ai_logo_fond.png" alt="SAIM" className="h-8" />
            <h2 className="font-bold text-slate-800">
              {view === 'login' ? t('login_title') : t('reg_title')}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <LangToggle />
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Google button */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogle}
              onError={() => setError('Erreur Google')}
              text={view === 'login' ? 'signin_with' : 'signup_with'}
              shape="pill"
              locale={lang === 'fr' ? 'fr' : 'en'}
            />
          </div>

          <Divider label={lang === 'fr' ? 'ou' : 'or'} />

          {/* ─── LOGIN ─────────────────────────────────────────────────────── */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label">{t('login_email')}</label>
                <input
                  type="email" required
                  className="input-field"
                  placeholder="vous@email.com"
                  value={loginForm.email}
                  onChange={e => setLoginForm({ ...loginForm, email: clean(e.target.value) })}
                />
              </div>
              <div>
                <label className="label">{t('login_password')}</label>
                <div className="relative">
                  <input
                    type={showLoginPwd ? 'text' : 'password'} required
                    className="input-field pr-10"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowLoginPwd(v => !v)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <EyeIcon open={showLoginPwd} />
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
                {loading ? '...' : t('login_btn')}
              </button>
              <p className="text-center text-sm text-slate-500">
                {t('login_no_account')}{' '}
                <button type="button" onClick={() => { setView('register'); setError('') }} className="text-saim-600 font-semibold hover:underline">
                  {t('login_register')}
                </button>
              </p>
            </form>
          )}

          {/* ─── REGISTER ──────────────────────────────────────────────────── */}
          {view === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">{t('reg_fname')}</label>
                  <input required className="input-field" placeholder="Jean"
                    value={regForm.first_name} onChange={e => setRegForm({ ...regForm, first_name: clean(e.target.value) })} />
                </div>
                <div>
                  <label className="label">{t('reg_lname')}</label>
                  <input required className="input-field" placeholder="Dupont"
                    value={regForm.last_name} onChange={e => setRegForm({ ...regForm, last_name: clean(e.target.value) })} />
                </div>
              </div>

              <div>
                <label className="label">{t('reg_email')}</label>
                <input type="email" required className="input-field" placeholder="vous@email.com"
                  value={regForm.email} onChange={e => setRegForm({ ...regForm, email: clean(e.target.value) })} />
              </div>

              <div>
                <label className="label">{t('reg_phone')}</label>
                <input type="tel" className="input-field" placeholder="+237 6XX XXX XXX"
                  value={regForm.phone} onChange={e => setRegForm({ ...regForm, phone: clean(e.target.value) })} />
              </div>

              <div>
                <label className="label">{t('reg_password')}</label>
                <div className="relative">
                  <input
                    type={showRegPwd ? 'text' : 'password'} required
                    className="input-field pr-10"
                    placeholder="••••••••"
                    value={regForm.password}
                    onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowRegPwd(v => !v)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <EyeIcon open={showRegPwd} />
                  </button>
                </div>
                {regForm.password && <StrengthMeter pwd={regForm.password} lang={lang} />}
              </div>

              <div>
                <label className="label">{t('reg_post')}</label>
                <input className="input-field" placeholder="Ex: Directeur commercial"
                  value={regForm.post} onChange={e => setRegForm({ ...regForm, post: clean(e.target.value) })} />
              </div>

              <div>
                <label className="label">{t('reg_ai_level')}</label>
                <select className="input-field" value={regForm.ai_level}
                  onChange={e => setRegForm({ ...regForm, ai_level: e.target.value })}>
                  {[1,2,3,4,5].map(n => (
                    <option key={n} value={n}>{t(`reg_ai_${n}`)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">{t('reg_sector')}</label>
                <input className="input-field" placeholder="Ex: Finance, Santé, Education..."
                  value={regForm.activity_sector} onChange={e => setRegForm({ ...regForm, activity_sector: clean(e.target.value) })} />
              </div>

              <button type="submit" disabled={loading || !isStrong} className="btn-primary w-full justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? '...' : t('reg_btn')}
              </button>

              <p className="text-center text-sm text-slate-500">
                {t('reg_have_account')}{' '}
                <button type="button" onClick={() => { setView('login'); setError('') }} className="text-saim-600 font-semibold hover:underline">
                  {t('reg_login')}
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
