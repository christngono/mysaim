import { useState, useRef, useCallback } from 'react'
import { useLang } from '../context/LangContext'
import { useT } from '../i18n/translations'

/* ── Icônes contact ──────────────────────────────────────────────────────── */
const mailIcon  = <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
const phoneIcon = <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" /></svg>
const pinIcon   = <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>

/* ── Motifs SVG de fond ──────────────────────────────────────────────────── */
const shapes = [
  { id: 0,  type: 'circle',   cx: 80,   cy: 60,   r: 28,  depth: 0.04, animDur: 8,  animDelay: 0   },
  { id: 1,  type: 'circle',   cx: 320,  cy: 140,  r: 14,  depth: 0.08, animDur: 11, animDelay: 1.5 },
  { id: 2,  type: 'circle',   cx: 600,  cy: 40,   r: 40,  depth: 0.03, animDur: 14, animDelay: 3   },
  { id: 3,  type: 'circle',   cx: 900,  cy: 130,  r: 20,  depth: 0.07, animDur: 9,  animDelay: 0.8 },
  { id: 4,  type: 'circle',   cx: 1150, cy: 50,   r: 32,  depth: 0.05, animDur: 12, animDelay: 2   },
  { id: 5,  type: 'circle',   cx: 1350, cy: 140,  r: 16,  depth: 0.09, animDur: 7,  animDelay: 4   },
  { id: 6,  type: 'hex',      cx: 200,  cy: 120,  r: 22,  depth: 0.06, animDur: 13, animDelay: 1   },
  { id: 7,  type: 'hex',      cx: 480,  cy: 90,   r: 18,  depth: 0.05, animDur: 10, animDelay: 2.5 },
  { id: 8,  type: 'hex',      cx: 750,  cy: 155,  r: 26,  depth: 0.04, animDur: 15, animDelay: 0.5 },
  { id: 9,  type: 'hex',      cx: 1050, cy: 80,   r: 20,  depth: 0.07, animDur: 11, animDelay: 3.5 },
  { id: 10, type: 'hex',      cx: 1280, cy: 120,  r: 14,  depth: 0.08, animDur: 9,  animDelay: 1.2 },
  { id: 11, type: 'diamond',  cx: 140,  cy: 155,  r: 16,  depth: 0.06, animDur: 10, animDelay: 2   },
  { id: 12, type: 'diamond',  cx: 420,  cy: 50,   r: 24,  depth: 0.04, animDur: 12, animDelay: 3   },
  { id: 13, type: 'diamond',  cx: 690,  cy: 120,  r: 14,  depth: 0.09, animDur: 8,  animDelay: 0.7 },
  { id: 14, type: 'diamond',  cx: 1000, cy: 50,   r: 20,  depth: 0.05, animDur: 14, animDelay: 1.8 },
  { id: 15, type: 'diamond',  cx: 1200, cy: 160,  r: 12,  depth: 0.07, animDur: 11, animDelay: 4   },
  { id: 16, type: 'cross',    cx: 260,  cy: 60,   r: 14,  depth: 0.08, animDur: 9,  animDelay: 2.2 },
  { id: 17, type: 'cross',    cx: 550,  cy: 150,  r: 10,  depth: 0.06, animDur: 13, animDelay: 0.3 },
  { id: 18, type: 'cross',    cx: 840,  cy: 60,   r: 16,  depth: 0.05, animDur: 10, animDelay: 3.2 },
  { id: 19, type: 'cross',    cx: 1120, cy: 150,  r: 12,  depth: 0.07, animDur: 8,  animDelay: 1.5 },
]

function ShapePath({ type, cx, cy, r }) {
  if (type === 'circle') {
    return <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="1.5" />
  }
  if (type === 'hex') {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
    }).join(' ')
    return <polygon points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" />
  }
  if (type === 'diamond') {
    return <polygon points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
      fill="none" stroke="currentColor" strokeWidth="1.5" />
  }
  if (type === 'cross') {
    return (
      <g>
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    )
  }
  return null
}

/* ── Composant principal ─────────────────────────────────────────────────── */
export default function Footer({ onGoLanding, onAboutPage, onFormationPage, onContactPage, scrollTo }) {
  const { lang } = useLang()
  const t = useT(lang)

  const footerRef = useRef(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e) => {
    const rect = footerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 2
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 2
    setMouse({ x, y })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setMouse({ x: 0, y: 0 })
  }, [])

  const goAbout    = () => onAboutPage    ? onAboutPage()    : scrollTo?.('about')
  const goFormation = () => onFormationPage ? onFormationPage() : scrollTo?.('training')
  const goContact  = () => onContactPage  ? onContactPage()  : scrollTo?.('contact')
  const goLanding  = () => onGoLanding    ? onGoLanding()    : scrollTo?.('hero')

  return (
    <footer
      ref={footerRef}
      className="relative bg-saim-900 text-white overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}>

      {/* ── Fond animé ────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <svg
          className="absolute inset-0 w-full h-full text-white/[0.06]"
          viewBox="0 0 1440 200"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg">
          <defs>
            <style>{`
              @keyframes floatShape {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                33%       { transform: translateY(-8px) rotate(2deg); }
                66%       { transform: translateY(4px) rotate(-1deg); }
              }
            `}</style>
          </defs>
          {shapes.map(s => (
            <g
              key={s.id}
              style={{
                animation: `floatShape ${s.animDur}s ease-in-out ${s.animDelay}s infinite`,
                transform: `translate(${mouse.x * s.depth * 60}px, ${mouse.y * s.depth * 30}px)`,
                transition: 'transform 0.6s ease-out',
              }}>
              <ShapePath type={s.type} cx={s.cx} cy={s.cy} r={s.r} />
            </g>
          ))}
        </svg>

        {/* Dégradé radial au survol */}
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100"
          style={{
            background: `radial-gradient(circle 600px at ${50 + mouse.x * 30}% ${50 + mouse.y * 30}%, rgba(2,132,199,0.08) 0%, transparent 70%)`,
            opacity: Math.abs(mouse.x) + Math.abs(mouse.y) > 0.1 ? 1 : 0,
          }}
        />
      </div>

      {/* ── Contenu ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Marque */}
          <div>
            <button onClick={goLanding} className="mb-4 block">
              <img src="/uploads/apropos/saim_ai_logo_fond.png" alt="SAIM" className="h-12" />
            </button>
            <p className="text-slate-300 text-sm leading-relaxed">{t('footer_desc')}</p>
            <div className="flex gap-3 mt-4">
              <a href="https://web.facebook.com/profile.php?id=61589286779656"
                target="_blank" rel="noopener noreferrer"
                title="Facebook SAIM"
                className="w-9 h-9 bg-white/10 hover:bg-[#1877F2] rounded-full flex items-center justify-center transition-all hover:scale-110">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/saim-course"
                target="_blank" rel="noopener noreferrer"
                title="LinkedIn SAIM"
                className="w-9 h-9 bg-white/10 hover:bg-[#0A66C2] rounded-full flex items-center justify-center transition-all hover:scale-110">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://wa.me/237677518862"
                target="_blank" rel="noopener noreferrer"
                title="WhatsApp SAIM"
                className="w-9 h-9 bg-white/10 hover:bg-[#25D366] rounded-full flex items-center justify-center transition-all hover:scale-110">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              </a>
            </div>
          </div>

          {/* Liens */}
          <div>
            <h4 className="font-bold mb-4 text-white">{t('footer_links_title')}</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <button onClick={goAbout} className="hover:text-white transition-colors">
                  {t('nav_about')}
                </button>
              </li>
              <li>
                <button onClick={goFormation} className="hover:text-white transition-colors">
                  {t('nav_training')}
                </button>
              </li>
              <li>
                <button onClick={goContact} className="hover:text-white transition-colors">
                  {t('nav_contact')}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-white">{t('footer_contact_title')}</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-saim-300 flex-shrink-0">{mailIcon}</span>
                partners@saim.com
              </li>
              <li className="flex items-center gap-2">
                <span className="text-saim-300 flex-shrink-0">{phoneIcon}</span>
                (+237) 677 1 88 62
              </li>
              <li className="flex items-center gap-2">
                <span className="text-saim-300 flex-shrink-0">{pinIcon}</span>
                {t('contact_location_val')}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-sm text-slate-400">
          {t('footer_rights')}
        </div>
      </div>
    </footer>
  )
}
