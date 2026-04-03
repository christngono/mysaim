import { useState, useEffect } from 'react'
import { useLang } from '../context/LangContext'
import { useT } from '../i18n/translations'
import api from '../api/axios'

// ─── Result screen ────────────────────────────────────────────────────────────
function QuizResult({ result, score, total, passed, passingScore, t, lang, onRetake, onClose }) {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Score banner */}
      <div className={`rounded-2xl p-8 text-center mb-8 ${passed ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' : 'bg-gradient-to-br from-red-500 to-red-700'}`}>
        <div className="text-5xl mb-3">{passed ? '🏆' : '📚'}</div>
        <h2 className="text-2xl font-extrabold text-white mb-1">
          {passed ? t('quiz_passed') : t('quiz_failed')}
        </h2>
        <div className="text-white/80 text-lg mt-3">
          {t('quiz_score')} : <span className="font-extrabold text-white text-3xl">{score}/{total}</span>
        </div>
        <div className="text-white/60 text-sm mt-1">
          {t('quiz_threshold')} : {passingScore}/{total}
        </div>
      </div>

      {/* Per-question breakdown */}
      <div className="space-y-4 mb-8">
        {result.map((item, i) => {
          const question = lang === 'en' ? item.question_en : item.question_fr
          return (
            <div key={item.question_id} className={`card p-5 border-l-4 ${item.is_correct ? 'border-emerald-500' : 'border-red-400'}`}>
              <div className="flex items-start gap-3 mb-3">
                <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white ${item.is_correct ? 'bg-emerald-500' : 'bg-red-400'}`}>
                  {item.is_correct ? '✓' : '✗'}
                </span>
                <p className="font-semibold text-slate-800 text-sm">{i + 1}. {question}</p>
              </div>
              <div className="ml-10 space-y-2">
                {item.choices.map(c => {
                  const isCorrect    = c.id === item.correct_choice_id
                  const isUserChoice = c.id === item.user_choice_id
                  const text = lang === 'en' ? c.text_en : c.text_fr

                  let cls = 'bg-slate-50 text-slate-600 border border-slate-200'
                  if (isCorrect)                   cls = 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold'
                  if (isUserChoice && !isCorrect)  cls = 'bg-red-50 text-red-700 border border-red-300 line-through'

                  return (
                    <div key={c.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${cls}`}>
                      {isCorrect   && <span className="text-emerald-500 font-bold">✓</span>}
                      {isUserChoice && !isCorrect && <span className="text-red-400 font-bold">✗</span>}
                      {!isCorrect && !isUserChoice && <span className="w-4" />}
                      {text}
                    </div>
                  )
                })}
                {/* Explanation */}
                {(() => {
                  const expl = lang === 'en' ? item.explanation_en : item.explanation_fr
                  return expl ? (
                    <div className="flex items-start gap-2 mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                      <span className="flex-shrink-0 font-bold">💡</span>
                      <span>{expl}</span>
                    </div>
                  ) : null
                })()}
              </div>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        {!passed && (
          <button onClick={onRetake} className="btn-primary">
            {t('quiz_retake')} →
          </button>
        )}
        <button onClick={onClose} className="btn-secondary">
          {passed ? '← Continuer la formation' : 'Fermer'}
        </button>
      </div>
    </div>
  )
}

// ─── Main Quiz component ──────────────────────────────────────────────────────
export default function QuizView({ moduleId, quizInfo, onClose, onPassed }) {
  const { lang } = useLang()
  const t = useT(lang)

  const [quizData,  setQuizData]  = useState(null)
  const [answers,   setAnswers]   = useState({})     // { questionId: choiceId }
  const [loading,   setLoading]   = useState(true)
  const [submitting,setSubmitting]= useState(false)
  const [result,    setResult]    = useState(null)   // after submit
  const [error,     setError]     = useState('')

  const loadQuiz = async () => {
    setLoading(true)
    setResult(null)
    setAnswers({})
    setError('')
    try {
      const res = await api.get(`/quiz/module/${moduleId}`)
      setQuizData(res.data)
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadQuiz() }, [moduleId])

  const handleSelect = (questionId, choiceId) => {
    setAnswers(prev => ({ ...prev, [questionId]: choiceId }))
  }

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quizData.questions.length) {
      setError(lang === 'fr' ? 'Veuillez répondre à toutes les questions.' : 'Please answer all questions.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await api.post(`/quiz/${quizData.id}/submit`, { answers })
      setResult(res.data)
      if (res.data.passed && onPassed) onPassed()
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur de soumission')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-saim-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error && !quizData) return (
    <div className="text-center py-12 text-slate-500">
      <div className="text-4xl mb-3">⚠️</div>
      <p>{error}</p>
    </div>
  )

  // Already passed — show result directly
  if (!result && quizData?.best_attempt?.passed) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <div className="text-5xl mb-4">🏆</div>
        <h2 className="text-2xl font-extrabold text-saim-800 mb-2">{t('quiz_already_passed')}</h2>
        <p className="text-slate-500 mb-2">
          {lang === 'fr' ? 'Votre meilleur score' : 'Your best score'} :{' '}
          <span className="font-bold text-emerald-600">{quizData.best_attempt.score}/{quizData.best_attempt.total}</span>
        </p>
        <button onClick={onClose} className="btn-primary mt-6">← {lang === 'fr' ? 'Retour' : 'Back'}</button>
      </div>
    )
  }

  if (result) {
    return (
      <QuizResult
        result={result.result}
        score={result.score}
        total={result.total}
        passed={result.passed}
        passingScore={result.passing_score}
        t={t}
        lang={lang}
        onRetake={loadQuiz}
        onClose={onClose}
      />
    )
  }

  const title = lang === 'en' ? quizData.title_en : quizData.title_fr
  const answered = Object.keys(answers).length
  const total = quizData.questions.length

  return (
    <div className="max-w-2xl mx-auto">
      {/* Quiz header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📝</span>
          <h2 className="text-xl font-extrabold text-saim-800">{title}</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          {lang === 'fr'
            ? `Répondez aux ${total} questions. Score minimum : ${quizData.passing_score}/${total} pour valider.`
            : `Answer all ${total} questions. Minimum score: ${quizData.passing_score}/${total} to pass.`}
        </p>
        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-saim-500 rounded-full transition-all duration-300"
              style={{ width: `${(answered / total) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-500">{answered}/{total}</span>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6 mb-8">
        {quizData.questions.map((q, qi) => {
          const question = lang === 'en' ? q.question_en : q.question_fr
          const selected = answers[q.id]
          return (
            <div key={q.id} className="card p-6">
              <p className="font-semibold text-slate-800 mb-4">
                <span className="inline-flex w-7 h-7 rounded-full bg-saim-100 text-saim-700 text-xs font-extrabold items-center justify-center mr-2">{qi + 1}</span>
                {question}
              </p>
              <div className="space-y-2">
                {q.choices.map(c => {
                  const text = lang === 'en' ? c.text_en : c.text_fr
                  const isSelected = selected === c.id
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleSelect(q.id, c.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm border-2 transition-all ${
                        isSelected
                          ? 'border-saim-500 bg-saim-50 text-saim-800 font-semibold'
                          : 'border-slate-200 hover:border-saim-300 hover:bg-saim-50/50 text-slate-700'
                      }`}
                    >
                      <span className={`inline-flex w-5 h-5 rounded-full border-2 mr-3 items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'border-saim-500 bg-saim-500' : 'border-slate-300'}`}>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                      </span>
                      {text}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">⚠️ {error}</div>
      )}

      <div className="text-center">
        <button
          onClick={handleSubmit}
          disabled={submitting || answered < total}
          className="btn-primary px-10 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? '...' : t('quiz_validate')} ✓
        </button>
        {answered < total && (
          <p className="text-xs text-slate-400 mt-2">
            {lang === 'fr' ? `${total - answered} question(s) sans réponse` : `${total - answered} unanswered question(s)`}
          </p>
        )}
      </div>
    </div>
  )
}
