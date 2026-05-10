import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const POLL_INTERVAL = 4000
const POLL_MAX = 80000

export default function PaymentModal({ formation, onClose, onSuccess }) {
  const { refreshEnrollments } = useAuth()
  const [step, setStep] = useState('form') // form | pending | success | timeout
  const [operator, setOperator] = useState('MTN')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [reference, setReference] = useState(null)
  const [ussdCode, setUssdCode] = useState(null)
  const pollRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      clearInterval(pollRef.current)
      clearTimeout(timeoutRef.current)
    }
  }, [])

  const stopPolling = () => {
    clearInterval(pollRef.current)
    clearTimeout(timeoutRef.current)
  }

  const startPolling = (ref) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/payments/status/${ref}`)
        if (res.data.status === 'confirmed') {
          stopPolling()
          await refreshEnrollments()
          setStep('success')
          setTimeout(() => { onSuccess?.(); onClose() }, 2500)
        } else if (res.data.status === 'failed') {
          stopPolling()
          setError('Le paiement a échoué. Veuillez réessayer.')
          setStep('form')
        }
      } catch {}
    }, POLL_INTERVAL)

    timeoutRef.current = setTimeout(() => {
      stopPolling()
      setStep('timeout')
    }, POLL_MAX)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const cleaned = phone.replace(/\s/g, '')
    if (!/^(6[5-9]\d{7}|6[0-4]\d{7})$/.test(cleaned)) {
      setError('Numéro invalide. Format attendu : 6XXXXXXXX (Cameroun)')
      return
    }

    try {
      const res = await api.post('/payments/initiate', {
        formation_id: formation.id,
        phone: cleaned,
        operator,
      })
      setReference(res.data.reference)
      setUssdCode(res.data.ussd_code)
      setStep('pending')
      startPolling(res.data.reference)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'initiation du paiement')
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
            <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity text-xl leading-none">&times;</button>
          </div>
          <h2 className="text-xl font-bold">{formation?.title_fr}</h2>
          <p className="text-3xl font-extrabold mt-2">25 500 <span className="text-lg font-semibold">FCFA</span></p>
          <p className="text-sm opacity-70 mt-1">Paiement unique — accès permanent</p>
        </div>

        {/* Body */}
        <div className="p-6">
          <AnimatePresence mode="wait">

            {step === 'form' && (
              <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-4">
                {/* Operator */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Opérateur Mobile Money</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'MTN',    img: '/images/mtnmoney.jpeg',   label: 'MTN MoMo'     },
                      { key: 'ORANGE', img: '/images/orangemoney.png', label: 'Orange Money' },
                    ].map(op => (
                      <button
                        key={op.key}
                        type="button"
                        onClick={() => setOperator(op.key)}
                        className={`py-3 px-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                          operator === op.key
                            ? 'border-saim-600 bg-saim-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img src={op.img} alt={op.label} className="h-10 object-contain" />
                        <span className={`text-xs font-semibold ${operator === op.key ? 'text-saim-700' : 'text-gray-500'}`}>{op.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="6XXXXXXXX"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-saim-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Numéro Cameroun sans indicatif (+237)</p>
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

                <button
                  type="submit"
                  className="w-full bg-saim-600 hover:bg-saim-700 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Payer 25 500 FCFA
                </button>

                <p className="text-xs text-center text-gray-400">
                  Vous recevrez une confirmation sur votre téléphone
                </p>
              </motion.form>
            )}

            {step === 'pending' && (
              <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-6 space-y-4">
                <div className="w-16 h-16 mx-auto border-4 border-saim-200 border-t-saim-600 rounded-full animate-spin" />
                <h3 className="font-bold text-gray-800">Confirmation en attente</h3>
                <p className="text-sm text-gray-500">Vérifiez votre téléphone et confirmez le paiement</p>
                {ussdCode && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Code USSD</p>
                    <p className="font-mono font-bold text-saim-700 text-lg">{ussdCode}</p>
                  </div>
                )}
                <p className="text-xs text-gray-400">Vérification automatique toutes les 4 secondes…</p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center py-8 space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center text-3xl">✅</div>
                <h3 className="font-bold text-xl text-gray-800">Paiement confirmé !</h3>
                <p className="text-sm text-gray-500">Votre accès complet est maintenant activé.</p>
              </motion.div>
            )}

            {step === 'timeout' && (
              <motion.div key="timeout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-6 space-y-4">
                <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center text-3xl">⏳</div>
                <h3 className="font-bold text-gray-800">Activation en cours…</h3>
                <p className="text-sm text-gray-500">
                  Si vous avez confirmé le paiement, votre accès sera activé automatiquement dans quelques minutes.
                  Reconnectez-vous pour vérifier.
                </p>
                <button
                  onClick={onClose}
                  className="w-full border border-gray-300 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
