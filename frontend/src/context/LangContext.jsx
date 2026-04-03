import { createContext, useContext, useState } from 'react'

const LangContext = createContext()

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('saim_lang') || 'fr')

  const switchLang = (l) => {
    setLang(l)
    localStorage.setItem('saim_lang', l)
    document.documentElement.lang = l
  }

  return (
    <LangContext.Provider value={{ lang, switchLang }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)