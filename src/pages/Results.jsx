import { useEffect, useRef, useState } from 'react';
import { addResult } from '../utils/storage';
import Confetti from '../components/Confetti';
import { playApplause } from '../utils/sound';

const MOTIVE_QUOTES = [
  { emoji: '🌱', text: "Chaque expert a d'abord été un débutant. Tu es sur la bonne voie !" },
  { emoji: '🔥', text: "L'échec d'aujourd'hui est la réussite de demain. Ne lâche pas !" },
  { emoji: '💡', text: "Les erreurs sont tes meilleures professeurs. Apprends d'elles !" },
  { emoji: '⭐', text: "Tu es capable de bien plus que tu ne le crois. Entraîne-toi encore !" },
  { emoji: '🚀', text: "Chaque tentative te rapproche du succès. Continue comme ça !" },
];

function getMessage(score, total) {
  const r = score / total;
  if (r === 1)   return "Score parfait ! Tu es brillant(e) 🌟";
  if (r >= 0.75) return "Très bien ! Encore un petit effort 💪";
  if (r >= 0.5)  return "Pas mal ! Continue à t'entraîner 📚";
  return "Ne te décourage pas, la pratique mène à la perfection ! 💪";
}

function MotivationSection({ student, detail, onRestart }) {
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * MOTIVE_QUOTES.length));
  const quote = MOTIVE_QUOTES[quoteIdx];
  const wrongItems = detail.filter(d => !d.isCorrect);

  return (
    <div className="motivation-section">

      {/* Animated encouragement header */}
      <div className="motiv-header">
        <div className="motiv-emoji-wrap">
          <span className="motiv-emoji">💪</span>
        </div>
        <h3 className="motiv-title">Ne te décourage pas, {student.prenom} !</h3>
        <p className="motiv-subtitle">Tout le monde progresse à son rythme. L'important c'est de continuer !</p>
      </div>

      {/* Rotating motivational quote */}
      <div className="motiv-quote-box">
        <span className="motiv-quote-emoji">{quote.emoji}</span>
        <p className="motiv-quote-text">"{quote.text}"</p>
        <div className="motiv-dots">
          {MOTIVE_QUOTES.map((_, i) => (
            <button
              key={i}
              className={`motiv-dot${i === quoteIdx ? ' active' : ''}`}
              onClick={() => setQuoteIdx(i)}
            />
          ))}
        </div>
      </div>

      {/* What to review */}
      {wrongItems.length > 0 && (
        <div className="motiv-review-box">
          <div className="motiv-review-title">📚 À revoir pour progresser :</div>
          <ul className="motiv-review-list">
            {wrongItems.map((item, i) => (
              <li key={i} className="motiv-review-item">
                <span className="motiv-review-icon">→</span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tips */}
      <div className="motiv-tips">
        <div className="motiv-tip"><span>📖</span> Relis ton cours sur les équations</div>
        <div className="motiv-tip"><span>✏️</span> Refais les exercices pas à pas</div>
        <div className="motiv-tip"><span>🔄</span> Recommence le test pour t'améliorer</div>
      </div>

      <button className="btn btn-orange" onClick={onRestart} style={{ marginTop: 8 }}>
        🔄 Réessayer le test
      </button>
    </div>
  );
}

export default function Results({ student, result, onRestart }) {
  const { score, total, answers, questions } = result;
  const savedRef             = useRef(false);
  const [confetti, setConfetti] = useState(0);

  const isInsufficient = score < Math.ceil(total / 2);
  const isPerfect      = score === total;

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    addResult({
      prenom: student.prenom, nom: student.nom,
      niveau: student.niveau, college: student.college,
      inscrit: student.inscrit, score, total, answers,
    });
    if (!isInsufficient) {
      setConfetti(1);
      playApplause();
      if (isPerfect) {
        setTimeout(() => { setConfetti(c => c + 1); playApplause(); }, 900);
        setTimeout(() => { setConfetti(c => c + 1); playApplause(); }, 1800);
      }
    }
  }, []);

  const pct = (score / total) * 100;

  const detail = [];
  questions.forEach(q => {
    if (q.type === 'qcm') {
      detail.push({ label: `${q.title} ${q.context}`, isCorrect: answers[q.id] === q.correct });
    } else {
      q.subQuestions.forEach(sub => {
        detail.push({
          label:     sub.text.length > 40 ? sub.text.slice(0, 40) + '…' : sub.text,
          isCorrect: answers[sub.id] === sub.correct,
        });
      });
    }
  });

  return (
    <div className="screen-wrap">
      <Confetti trigger={confetti} />

      <div className="card results-card">

        {isPerfect && (
          <div className="perfect-banner">🏆 Score parfait ! 🏆</div>
        )}

        <div className="results-header">
          {isPerfect ? '🎉 ' : ''}
          {isInsufficient ? `Courage ${student.prenom} !` : `Bravo ${student.prenom} !`}
          {isPerfect ? ' 🎉' : ''}
        </div>

        {/* Score circle */}
        <div className="score-circle-wrap">
          <div className="score-circle" style={{
            '--pct': `${pct}%`,
            background: isInsufficient
              ? `conic-gradient(#ff9800 0%, #ff9800 ${pct}%, #e0e7ff ${pct}%)`
              : `conic-gradient(var(--blue) 0%, var(--blue) ${pct}%, #e0e7ff ${pct}%)`,
          }}>
            <div className="score-inner">
              <div className="score-num" style={{ color: isInsufficient ? '#e65100' : undefined }}>
                {score}
              </div>
              <div className="score-denom">/ {total}</div>
            </div>
          </div>
        </div>

        {/* Stars */}
        <div className="score-stars">
          {Array.from({ length: total }, (_, i) => (
            <span key={i} style={{
              opacity:   i < score ? 1 : 0.22,
              display:   'inline-block',
              fontSize:  '1.9rem',
              animation: i < score ? `starPulse 1.4s ease-in-out ${i * 0.18}s infinite` : 'none',
            }}>⭐</span>
          ))}
        </div>

        <div className={`result-msg${isPerfect ? ' result-msg-perfect' : ''}${isInsufficient ? ' result-msg-low' : ''}`}>
          {getMessage(score, total)}
        </div>

        {/* Score detail pills */}
        <div className="score-detail">
          {detail.map((d, i) => (
            <span key={i} className={`score-pill${d.isCorrect ? '' : ' wrong-pill'}`}>
              {d.isCorrect ? '✓' : '✗'} {d.label}
            </span>
          ))}
        </div>

        {/* Motivation block for low score */}
        {isInsufficient
          ? <MotivationSection student={student} detail={detail} onRestart={onRestart} />
          : (
            <button className="btn btn-ghost" onClick={onRestart}>
              🔄 Recommencer le test
            </button>
          )
        }
      </div>
    </div>
  );
}
