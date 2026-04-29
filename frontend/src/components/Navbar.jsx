import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { useT } from '../i18n/translations'
import LangToggle from './LangToggle'

export default function Navbar({ onLoginClick, scrollTo }) {
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
            <a
              href="https://wa.me/237677518862"
              target="_blank"
              rel="noopener noreferrer"
              title="Contacter SAIM sur WhatsApp"
              className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-bold px-3 py-1.5 rounded-full transition-all active:scale-95"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              WhatsApp
            </a>
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