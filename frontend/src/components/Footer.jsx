import { useLang } from '../context/LangContext'
import { useT } from '../i18n/translations'

export default function Footer({ scrollTo }) {
  const { lang } = useLang()
  const t = useT(lang)

  return (
    <footer className="bg-saim-800 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <img src="/images/saimlogo.png" alt="SAIM" className="h-12 mb-4 brightness-200" />
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
                <span>📧</span> contact@saim.cm
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span> (+237) 677 1 88 62
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span> {t('contact_location_val')}
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