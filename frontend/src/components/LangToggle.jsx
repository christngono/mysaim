import { useLang } from '../context/LangContext'

export default function LangToggle({ light = false }) {
  const { lang, switchLang } = useLang()

  const base = 'px-2.5 py-1 text-xs font-bold rounded-md transition-all'
  const active = light
    ? 'bg-white text-saim-700'
    : 'bg-saim-500 text-white'
  const inactive = light
    ? 'text-white/70 hover:text-white'
    : 'text-slate-500 hover:text-saim-500 hover:bg-saim-50'

  return (
    <div className={`flex gap-1 rounded-lg p-0.5 ${light ? 'bg-white/10' : 'bg-slate-100'}`}>
      {['fr', 'en'].map(l => (
        <button
          key={l}
          onClick={() => switchLang(l)}
          className={`${base} ${lang === l ? active : inactive}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}