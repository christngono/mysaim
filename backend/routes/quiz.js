const express = require('express');
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ─── GET /quiz/module/:moduleId  ──────────────────────────────────────────────
router.get('/module/:moduleId', requireAuth, (req, res) => {
  const quiz = db.prepare('SELECT * FROM quizzes WHERE module_id = ? AND is_published = 1').get(req.params.moduleId);
  if (!quiz) return res.status(404).json({ error: 'No quiz for this module' });

  const questions = db.prepare('SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index').all(quiz.id);
  const questionsWithChoices = questions.map(q => ({
    ...q,
    choices: db.prepare('SELECT * FROM quiz_choices WHERE question_id = ? ORDER BY order_index').all(q.id)
      .map(c => ({ id: c.id, text_fr: c.text_fr, text_en: c.text_en, order_index: c.order_index }))
      // Note: is_correct is NOT sent to the client (anti-cheat)
  }));

  // Get user's best attempt
  const bestAttempt = db.prepare(
    'SELECT * FROM quiz_attempts WHERE user_id = ? AND quiz_id = ? ORDER BY score DESC, completed_at DESC LIMIT 1'
  ).get(req.user.id, quiz.id);

  res.json({
    id: quiz.id,
    module_id: quiz.module_id,
    title_fr: quiz.title_fr,
    title_en: quiz.title_en,
    passing_score: quiz.passing_score,
    questions: questionsWithChoices,
    best_attempt: bestAttempt || null,
  });
});

// ─── POST /quiz/:quizId/submit  ───────────────────────────────────────────────
router.post('/:quizId/submit', requireAuth, (req, res) => {
  const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ? AND is_published = 1').get(req.params.quizId);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  // Check if user already passed — cannot retake if passed
  const passedAttempt = db.prepare(
    'SELECT id FROM quiz_attempts WHERE user_id = ? AND quiz_id = ? AND passed = 1'
  ).get(req.user.id, quiz.id);
  if (passedAttempt) return res.status(400).json({ error: 'Already passed this quiz' });

  const { answers } = req.body; // { questionId: choiceId, ... }
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'answers must be an object' });
  }

  const questions = db.prepare('SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index').all(quiz.id);
  const total = questions.length;
  let score = 0;

  // Build result with correct/wrong per question
  const result = questions.map(q => {
    const choices = db.prepare('SELECT * FROM quiz_choices WHERE question_id = ? ORDER BY order_index').all(q.id);
    const correctChoice = choices.find(c => c.is_correct === 1);
    const userChoiceId = answers[String(q.id)] ? parseInt(answers[String(q.id)]) : null;
    const userChoice = choices.find(c => c.id === userChoiceId) || null;
    const isCorrect = userChoice && userChoice.is_correct === 1;
    if (isCorrect) score++;

    return {
      question_id:       q.id,
      question_fr:       q.question_fr,
      question_en:       q.question_en,
      explanation_fr:    q.explanation_fr || '',
      explanation_en:    q.explanation_en || '',
      choices:           choices.map(c => ({ id: c.id, text_fr: c.text_fr, text_en: c.text_en })),
      user_choice_id:    userChoiceId,
      correct_choice_id: correctChoice?.id || null,
      is_correct:        isCorrect,
    };
  });

  const passed = score >= quiz.passing_score;

  db.prepare(`
    INSERT INTO quiz_attempts (user_id, quiz_id, score, total, passed, answers)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.user.id, quiz.id, score, total, passed ? 1 : 0, JSON.stringify(answers));

  res.json({ score, total, passed, passing_score: quiz.passing_score, result });
});

// ─── GET /quiz/:quizId/my-attempts  ──────────────────────────────────────────
router.get('/:quizId/my-attempts', requireAuth, (req, res) => {
  const attempts = db.prepare(
    'SELECT id, score, total, passed, completed_at FROM quiz_attempts WHERE user_id = ? AND quiz_id = ? ORDER BY completed_at DESC'
  ).all(req.user.id, req.params.quizId);
  res.json(attempts);
});

// ─── GET /quiz/scores  (all module scores for current user) ──────────────────
router.get('/scores', requireAuth, (req, res) => {
  const modules = db.prepare('SELECT id, title_fr, title_en, order_index FROM modules ORDER BY order_index').all();

  const scores = modules.map(m => {
    const quiz = db.prepare('SELECT id, passing_score FROM quizzes WHERE module_id = ? AND is_published = 1').get(m.id);
    if (!quiz) return { module_id: m.id, title_fr: m.title_fr, title_en: m.title_en, order_index: m.order_index, quiz: null };

    const best = db.prepare(
      'SELECT score, total, passed, completed_at FROM quiz_attempts WHERE user_id = ? AND quiz_id = ? ORDER BY score DESC LIMIT 1'
    ).get(req.user.id, quiz.id);

    return {
      module_id:   m.id,
      title_fr:    m.title_fr,
      title_en:    m.title_en,
      order_index: m.order_index,
      quiz: {
        id:            quiz.id,
        passing_score: quiz.passing_score,
        best_score:    best?.score ?? null,
        total:         best?.total ?? 10,
        passed:        best?.passed === 1,
        completed_at:  best?.completed_at ?? null,
      }
    };
  });

  // Final average (only from passed quizzes)
  const passedScores = scores.filter(s => s.quiz?.passed).map(s => s.quiz.best_score / s.quiz.total * 10);
  const finalAverage = passedScores.length > 0
    ? Math.round(passedScores.reduce((a, b) => a + b, 0) / passedScores.length * 10) / 10
    : null;

  res.json({ scores, final_average: finalAverage });
});

module.exports = router;
