import { useLang } from '../context/LangContext'
import { useT } from '../i18n/translations'

const mailIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)
const phoneIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
  </svg>
)
const pinIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

export default function Footer({ scrollTo }) {
  const { lang } = useLang()
  const t = useT(lang)

  return (
    <footer className="bg-saim-800 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <img src="/uploads/apropos/saim_ai_logo_fond.png" alt="SAIM" className="h-12 mb-4" />
            <p className="text-slate-300 text-sm leading-relaxed">{t('footer_desc')}</p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors text-sm">f</a>
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors text-sm">in</a>
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors text-sm">tw</a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold mb-4 text-white">{t('footer_links_title')}</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              {[
                ['about', t('nav_about')],
                ['training', t('nav_training')],
                ['agent', t('nav_agent')],
                ['contact', t('nav_contact')],
              ].map(([id, label]) => (
                <li key={id}>
                  <button onClick={() => scrollTo(id)} className="hover:text-white transition-colors">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-white">{t('footer_contact_title')}</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-saim-300 flex-shrink-0">{mailIcon}</span>
                contact@saim.cm
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
