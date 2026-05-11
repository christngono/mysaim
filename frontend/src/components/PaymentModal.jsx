import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const WA_NUMBER = '237677518862'

export default function PaymentModal({ formation, onClose, onSuccess }) {
  const { user, refreshEnrollments } = useAuth()
  const [step, setStep]     = useState('info')  // info | code | success
  const [code, setCode]     = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const price = (formation?.price || 25500).toLocaleString('fr-FR')
  const formationName = formation?.title_fr || 'la formation'

  const waMessage = encodeURIComponent(
    `Bonjour SAIM 👋\nJe souhaite obtenir un accès complet à la formation : "${formationName}"\nMontant : ${price} FCFA\nMon email : ${user?.email || ''}\nMerci de m'indiquer la procédure de paiement.`
  )
  const waLink = `https://wa.me/${WA_NUMBER}?text=${waMessage}`

  const handleRedeem = async (e) => {
    e.preventDefault()
    if (!code.trim()) return
    setError('')
    setLoading(true)
    try {
      await api.post('/payments/redeem', {
        code: code.trim().toUpperCase(),
        formation_id: formation.id,
      })
      await refreshEnrollments()
      setStep('success')
      setTimeout(() => { onSuccess?.(); onClose() }, 2500)
    } catch (err) {
      setError(err.response?.data?.error || 'Code invalide ou déjà utilisé')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-saim-600 to-saim-800 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium opacity-80">Accès complet</span>
            <button onClick={onClose} className="opacity-70 hover:opacity-100 text-xl leading-none">&times;</button>
          </div>
          <h2 className="text-xl font-bold">{formationName}</h2>
          <p className="text-3xl font-extrabold mt-2">{price} <span className="text-lg font-semibold">FCFA</span></p>
          <p className="text-sm opacity-70 mt-1">Paiement unique — accès permanent</p>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">

            {/* ── Step 1: Instructions paiement ── */}
            {step === 'info' && (
              <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">

                {/* Opérateurs */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Modes de paiement acceptés :</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { img: '/images/mtnmoney.jpeg',   label: 'MTN MoMo',     number: '677 518 862' },
                      { img: '/images/orangemoney.png', label: 'Orange Money', number: '699 XXX XXX' },
                    ].map(op => (
                      <div key={op.label} className="border border-slate-200 rounded-xl p-3 flex flex-col items-center gap-2">
                        <img src={op.img} alt={op.label} className="h-10 object-contain" />
                        <span className="text-xs font-semibold text-slate-700">{op.label}</span>
                        <span className="text-xs font-mono text-saim-600 font-bold">{op.number}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Procédure */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Comment ça marche</p>
                  {[
                    'Cliquez sur "Payer via WhatsApp" ci-dessous',
                    'Envoyez-nous votre demande de paiement',
                    'Effectuez le virement Mobile Money',
                    'Nous vous envoyons un code d\'activation',
                    'Entrez le code pour débloquer votre accès',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-saim-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                      <span className="text-sm text-slate-600">{step}</span>
                    </div>
                  ))}
                </div>

                {/* WhatsApp button */}
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 text-sm"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Payer via WhatsApp
                </a>

                <button
                  onClick={() => setStep('code')}
                  className="w-full text-sm text-saim-600 hover:text-saim-800 font-semibold text-center transition-colors py-1"
                >
                  J'ai déjà un code d'activation →
                </button>
              </motion.div>
            )}

            {/* ── Step 2: Saisir le code ── */}
            {step === 'code' && (
              <motion.form key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleRedeem} className="space-y-5">
                <div className="text-center">
                  <div className="w-14 h-14 bg-saim-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">🔑</div>
                  <h3 className="font-extrabold text-slate-800 mb-1">Entrer le code d'activation</h3>
                  <p className="text-sm text-slate-500">Entrez le code reçu après votre paiement WhatsApp</p>
                </div>

                <div>
                  <input
                    type="text"
                    value={code}
                    onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
                    placeholder="SAIM-XXXXX-XXXXX"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-saim-500 uppercase"
                    maxLength={16}
                    autoFocus
                  />
                  {error && <p className="text-sm text-red-600 mt-2 text-center">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading || code.length < 16}
                  className="w-full bg-saim-600 hover:bg-saim-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors"
                >
                  {loading ? 'Vérification…' : 'Activer mon accès'}
                </button>

                <button type="button" onClick={() => { setStep('info'); setError('') }}
                  className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors py-1">
                  ← Retour
                </button>
              </motion.form>
            )}

            {/* ── Step 3: Succès ── */}
            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8 space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center text-3xl">✅</div>
                <h3 className="font-bold text-xl text-slate-800">Accès activé !</h3>
                <p className="text-sm text-slate-500">Votre accès complet est maintenant disponible. Bonne formation !</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
