import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { useT } from '../i18n/translations'
import LangToggle from './LangToggle'

export default function Navbar({ onLoginClick, onRegisterClick, scrollTo }) {
  const { user, logout } = useAuth()
  const { lang } = useLang()
  const t = useT(lang)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)

  const navLinks = [
    { key: 'about',    label: t('nav_about'),    id: 'about' },
    { key: 'training', label: t('nav_training'), id: 'training' },
    { key: 'contact',  label: t('nav_contact'),  id: 'contact' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <button onClick={() => scrollTo('hero')} className="flex-shrink-0">
            <img src="/images/saimlogo.png" alt="SAIM" className="h-10" />
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1 flex-1 ml-6">
            {navLinks.map(link => (
              <button
                key={link.key}
                onClick={() => scrollTo(link.id)}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-saim-600 hover:bg-saim-50 rounded-lg transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3 ml-auto">
            <LangToggle />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-saim-50 hover:bg-saim-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-saim-500 text-white flex items-center justify-center text-xs font-bold">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </div>
                  <span className="text-sm font-medium text-saim-700">{user.first_name}</span>
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {dropOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                    <button
                      onClick={() => { setDropOpen(false); scrollTo('dashboard') }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      {t('nav_dashboard')}
                    </button>
                    <hr className="my-1 border-slate-100" />
                    <button
                      onClick={() => { setDropOpen(false); logout() }}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                    >
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

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden ml-auto p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
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
            {navLinks.map(link => (
              <button
                key={link.key}
                onClick={() => { scrollTo(link.id); setMenuOpen(false) }}
                className="block w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                {link.label}
              </button>
            ))}
            <div className="flex items-center gap-3 px-4 pt-2">
              <LangToggle />
              {!user && (
                <button onClick={() => { onLoginClick(); setMenuOpen(false) }} className="btn-primary text-sm flex-1 justify-center">
                  {t('nav_login')}
                </button>
              )}
              {user && (
                <>
                  <button onClick={() => { scrollTo('dashboard'); setMenuOpen(false) }} className="btn-primary text-sm flex-1 justify-center">
                    {t('nav_dashboard')}
                  </button>
                  <button onClick={() => { logout(); setMenuOpen(false) }} className="text-sm text-red-500 font-medium">
                    {t('nav_logout')}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}