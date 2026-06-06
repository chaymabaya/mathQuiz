import { useState, useRef } from 'react';
import { getQuestions } from '../utils/storage';
import Confetti from '../components/Confetti';
import { playApplause } from '../utils/sound';

function computeTotal(questions) {
  return questions.reduce((s, q) => s + (q.type === 'qcm' ? 1 : q.subQuestions.length), 0);
}

function computeScore(answers, questions) {
  let score = 0;
  questions.forEach(q => {
    if (q.type === 'qcm') {
      if (answers[q.id] === q.correct) score++;
    } else {
      q.subQuestions.forEach(sub => {
        if (answers[sub.id] === sub.correct) score++;
      });
    }
  });
  return score;
}

export default function Test({ student, onComplete }) {
  const [questions]           = useState(() => getQuestions());
  const [qIdx, setQIdx]       = useState(0);
  const [subIdx, setSubIdx]   = useState(0);
  const [answers, setAnswers] = useState({});
  const [locked, setLocked]   = useState(new Set());
  const [showNext, setShowNext]   = useState(false);
  const [answered, setAnswered]   = useState(0);
  const [confetti, setConfetti]   = useState(0);
  const [bravoKey, setBravoKey]   = useState(null);
  // firstWrong: { lockId: chosenKey } — wrong 1st attempt, not yet locked
  const [firstWrong, setFirstWrong] = useState({});
  const answersRef = useRef({});

  const total    = computeTotal(questions);
  const currentQ = questions[qIdx];
  const isLastQ  = qIdx >= questions.length - 1;
  const progress = (answered / total) * 100;

  let displayStep = 0;
  for (let i = 0; i < qIdx; i++) {
    displayStep += questions[i].type === 'qcm' ? 1 : questions[i].subQuestions.length;
  }
  displayStep += currentQ.type === 'system' ? subIdx + 1 : 1;

  const lock     = id => setLocked(prev => new Set([...prev, id]));
  const isLocked = id => locked.has(id);

  const triggerBravo = (key) => {
    setConfetti(c => c + 1);
    setBravoKey(key);
    playApplause();
    setTimeout(() => setBravoKey(null), 1200);
  };

  // ── QCM handler ──────────────────────────────────────────
  const handleQCM = (question, key) => {
    const lockId    = `q${question.id}`;
    if (isLocked(lockId)) return;

    const isCorrect      = key === question.correct;
    const alreadyRetried = lockId in firstWrong;

    if (isCorrect) {
      // Correct answer (1st or 2nd try)
      answersRef.current = { ...answersRef.current, [question.id]: key };
      setAnswers({ ...answersRef.current });
      lock(lockId);
      setAnswered(c => c + 1);
      if (!alreadyRetried) triggerBravo(lockId); // full celebration only on 1st try
      setShowNext(true);
    } else if (alreadyRetried) {
      // 2nd wrong attempt → lock, no more chances
      answersRef.current = { ...answersRef.current, [question.id]: key };
      setAnswers({ ...answersRef.current });
      lock(lockId);
      setAnswered(c => c + 1);
      setShowNext(true);
    } else {
      // 1st wrong attempt → give one more chance
      setFirstWrong(prev => ({ ...prev, [lockId]: key }));
    }
  };

  // ── Oui/Non handler — verrouillage immédiat, pas de 2ème chance ──
  const handleON = (question, subQ, chosen) => {
    const lockId = `sq${subQ.id}`;
    if (isLocked(lockId)) return;

    answersRef.current = { ...answersRef.current, [subQ.id]: chosen };
    setAnswers({ ...answersRef.current });
    lock(lockId);
    setAnswered(c => c + 1);

    if (chosen === subQ.correct) triggerBravo(lockId);

    const isLastSub = subIdx >= question.subQuestions.length - 1;
    if (isLastSub) setShowNext(true);
    else setTimeout(() => setSubIdx(si => si + 1), 700);
  };

  const handleNext = () => {
    if (isLastQ) {
      const finalScore = computeScore(answersRef.current, questions);
      onComplete({ score: finalScore, total, answers: answersRef.current, questions });
    } else {
      setShowNext(false);
      setSubIdx(0);
      setQIdx(qi => qi + 1);
    }
  };

  // ── Render helpers ────────────────────────────────────────
  const fbClass = ok => `feedback-box show ${ok ? 'feedback-correct' : 'feedback-wrong'}`;

  const renderQCMFeedback = (question) => {
    const lockId         = `q${question.id}`;
    const isDone         = isLocked(lockId);
    const firstBadChoice = firstWrong[lockId];
    const finalChoice    = answers[question.id];
    const wasRetried     = !!firstBadChoice;

    if (!isDone && firstBadChoice) {
      // Between 1st and 2nd attempt
      return (
        <div className="feedback-box show feedback-wrong">
          <div className="retry-prompt">
            🔄 Pas tout à fait… Essaie encore une fois !
          </div>
          <div style={{ marginTop: 6 }}>{question.feedbacks[firstBadChoice]}</div>
        </div>
      );
    }
    if (isDone && finalChoice) {
      const isCorrect = finalChoice === question.correct;
      return (
        <div className={fbClass(isCorrect)}>
          {bravoKey === lockId && !wasRetried && (
            <span className="bravo-splash">🎉 BRAVO !</span>
          )}
          {wasRetried && isCorrect && (
            <span className="retry-success">✓ Bien joué ! Bonne réponse au 2ème essai !</span>
          )}
          {question.feedbacks[finalChoice]}
        </div>
      );
    }
    return null;
  };

  const renderONFeedback = (subQ) => {
    const lockId      = `sq${subQ.id}`;
    const finalChoice = answers[subQ.id];
    if (!isLocked(lockId) || !finalChoice) return null;
    const isCorrect = finalChoice === subQ.correct;
    return (
      <div className={fbClass(isCorrect)}>
        {bravoKey === lockId && <span className="bravo-splash">🎉 BRAVO !</span>}
        {subQ.feedbacks[finalChoice]}
      </div>
    );
  };

  return (
    <div className="screen-wrap">
      <Confetti trigger={confetti} />

      <div className="card">
        {/* Progress */}
        <div className="progress-header">
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-counter">Question {displayStep} / {total}</span>
        </div>

        {/* ── QCM ── */}
        {currentQ.type === 'qcm' && (
          <div className="question-block">
            <div className="question-badge qbadge-qcm">📋 QCM</div>
            <div className="question-title">{currentQ.title}</div>
            <div className="question-context">{currentQ.context}</div>

            <div className="options-list">
              {currentQ.options.map(opt => {
                const lockId         = `q${currentQ.id}`;
                const isDone         = isLocked(lockId);
                const finalChoice    = answers[currentQ.id];
                const firstBadChoice = firstWrong[lockId];

                let cls = 'option-btn';
                if (isDone) {
                  if (opt.key === currentQ.correct) cls += ' correct';
                  else if (opt.key === finalChoice)  cls += ' wrong';
                } else if (firstBadChoice === opt.key) {
                  cls += ' wrong'; // highlight 1st wrong attempt
                }

                // Disable: locked, OR was the 1st wrong choice (can't re-click it)
                const isDisabled = isDone || firstBadChoice === opt.key;

                return (
                  <button key={opt.key} className={cls} disabled={isDisabled}
                    onClick={() => handleQCM(currentQ, opt.key)}>
                    <span className="option-letter">{opt.key}</span>
                    {opt.text}
                    {isDone && opt.key === currentQ.correct && (
                      <span className="check-mark">✓</span>
                    )}
                  </button>
                );
              })}
            </div>

            {renderQCMFeedback(currentQ)}
          </div>
        )}

        {/* ── SYSTEM ── */}
        {currentQ.type === 'system' && (
          <div className="question-block">
            <div className="question-badge qbadge-ouinon">✋ Oui / Non</div>
            <div className="question-title">{currentQ.title}</div>
            <div className="question-context">{currentQ.context}</div>

            {currentQ.subQuestions.slice(0, subIdx + 1).map((subQ, i) => {
              const lockId      = `sq${subQ.id}`;
              const isDone      = isLocked(lockId);
              const finalChoice = answers[subQ.id];

              return (
                <div key={subQ.id}>
                  {i > 0 && <hr className="subq-divider" />}
                  <div className="question-sub">{subQ.text}</div>
                  <div className="ouinon-group">
                    {['Oui', 'Non'].map(val => {
                      let cls = 'ouinon-btn';
                      if (isDone) {
                        if (val === subQ.correct) cls += ' correct';
                        else if (val === finalChoice) cls += ' wrong';
                      }
                      return (
                        <button key={val} className={cls} disabled={isDone}
                          onClick={() => handleON(currentQ, subQ, val)}>
                          {val}
                          {isDone && val === subQ.correct && (
                            <span className="check-mark">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {renderONFeedback(subQ)}
                </div>
              );
            })}
          </div>
        )}

        {/* Next button */}
        {showNext && (
          <div style={{ marginTop: 20 }}>
            <button className="btn btn-primary" onClick={handleNext}>
              {isLastQ ? 'Voir mes résultats →' : 'Question suivante →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
