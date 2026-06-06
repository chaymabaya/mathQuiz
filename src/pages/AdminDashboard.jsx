import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getResults, clearResults,
  getQuestions, saveQuestions,
  adminLogout,
} from '../utils/storage';
import defaultQuestions from '../data/defaultQuestions';

// ═══════════════════════════════════════════════════
//  RESULTS TAB
// ═══════════════════════════════════════════════════

function DetailView({ result }) {
  const questions = getQuestions();
  const items = [];
  questions.forEach(q => {
    if (q.type === 'qcm') {
      const given = result.answers?.[q.id];
      const opt   = q.options.find(o => o.key === given);
      const corr  = q.options.find(o => o.key === q.correct);
      items.push({
        q:         `${q.title} ${q.context}`,
        given:     given ? `${given} — ${opt?.text || given}` : 'Non répondu',
        correct:   `${q.correct} — ${corr?.text}`,
        isCorrect: given === q.correct,
      });
    } else {
      q.subQuestions.forEach(sub => {
        const given = result.answers?.[sub.id];
        items.push({
          q:         sub.text,
          given:     given || 'Non répondu',
          correct:   sub.correct,
          isCorrect: given === sub.correct,
        });
      });
    }
  });

  return (
    <div className="detail-view">
      {items.map((item, i) => (
        <div key={i} className={`detail-item ${item.isCorrect ? 'detail-ok' : 'detail-fail'}`}>
          <div className="detail-q">{item.q}</div>
          <div className="detail-answers">
            <span>Réponse : <strong>{item.given}</strong></span>
            <span>Attendu : <strong>{item.correct}</strong></span>
            <span className={item.isCorrect ? 'tag-correct' : 'tag-wrong'}>
              {item.isCorrect ? '✓ Correct' : '✗ Incorrect'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultsTab() {
  const [results, setResults] = useState(() => getResults());
  const [expanded, setExpanded] = useState(null);

  const fmt = iso => {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const avg = results.length
    ? (results.reduce((s, r) => s + r.score / r.total, 0) / results.length * 100).toFixed(1)
    : 0;

  const handleClear = () => {
    if (!window.confirm('Effacer tous les résultats ? Action irréversible.')) return;
    clearResults();
    setResults([]);
  };

  const scoreClass = (r) => {
    const ratio = r.score / r.total;
    if (ratio >= 0.75) return 'score-good';
    if (ratio >= 0.5)  return 'score-ok';
    return 'score-low';
  };

  return (
    <div>
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-num">{results.length}</div>
          <div className="stat-label">Élèves testés</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{avg}%</div>
          <div className="stat-label">Score moyen</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{results.filter(r => r.score === r.total).length}</div>
          <div className="stat-label">Scores parfaits</div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="empty-state">Aucun résultat pour le moment.</div>
      ) : (
        <>
          <div className="results-table-wrap">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Date</th><th>Prénom</th><th>Nom</th>
                  <th>Collège</th><th>Niveau</th><th>Score</th><th></th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <>
                    <tr key={r.id}
                      className={`result-row${expanded === r.id ? ' row-expanded' : ''}`}
                      onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                    >
                      <td>{fmt(r.date)}</td>
                      <td>{r.prenom}</td>
                      <td><strong>{r.nom}</strong></td>
                      <td>{r.college}</td>
                      <td><span className="level-badge">{r.niveau}</span></td>
                      <td>
                        <span className={`score-badge ${scoreClass(r)}`}>
                          {r.score} / {r.total}
                        </span>
                      </td>
                      <td className="expand-cell">{expanded === r.id ? '▲' : '▼'}</td>
                    </tr>
                    {expanded === r.id && (
                      <tr key={`${r.id}-d`} className="detail-row">
                        <td colSpan={7}><DetailView result={r} /></td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn-danger" onClick={handleClear} style={{ marginTop: 16 }}>
            🗑 Effacer tous les résultats
          </button>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  QUESTION EDITORS
// ═══════════════════════════════════════════════════

function QCMEditor({ question, onSave, onCancel }) {
  const [title,     setTitle]     = useState(question.title);
  const [context,   setContext]   = useState(question.context);
  const [options,   setOptions]   = useState([...question.options]);
  const [correct,   setCorrect]   = useState(question.correct);
  const [feedbacks, setFeedbacks] = useState({ ...question.feedbacks });

  const updateOpt = (i, val) => {
    const o = [...options]; o[i] = { ...o[i], text: val }; setOptions(o);
  };
  const updateFb = (key, val) => setFeedbacks(fb => ({ ...fb, [key]: val }));
  const addOpt = () => {
    const key = 'ABCDEFGH'[options.length] || `O${options.length}`;
    setOptions(o => [...o, { key, text: '' }]);
    setFeedbacks(fb => ({ ...fb, [key]: '' }));
  };
  const removeOpt = (i) => {
    const key = options[i].key;
    setOptions(o => o.filter((_, j) => j !== i));
    setFeedbacks(fb => { const n = { ...fb }; delete n[key]; return n; });
    if (correct === key) setCorrect(options[0]?.key || '');
  };

  return (
    <div className="editor-box">
      <div className="editor-row">
        <label className="editor-label">Titre</label>
        <input className="editor-input" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div className="editor-row">
        <label className="editor-label">Contexte / Énoncé</label>
        <textarea className="editor-textarea" rows={2} value={context} onChange={e => setContext(e.target.value)} />
      </div>
      <div className="editor-row">
        <label className="editor-label">Options &amp; bonne réponse</label>
        {options.map((opt, i) => (
          <div key={opt.key} className="opt-edit-row">
            <span className="opt-key-badge">{opt.key}</span>
            <input className="editor-input" style={{ flex: 1 }} value={opt.text}
              onChange={e => updateOpt(i, e.target.value)} placeholder={`Option ${opt.key}`} />
            <label className="radio-label">
              <input type="radio" name={`corr_${question.id}`}
                checked={correct === opt.key} onChange={() => setCorrect(opt.key)} />
              Bonne réponse
            </label>
            {options.length > 2 && (
              <button className="btn-icon-del" onClick={() => removeOpt(i)}>✕</button>
            )}
          </div>
        ))}
        {options.length < 6 && (
          <button className="btn-add-opt" onClick={addOpt}>+ Ajouter une option</button>
        )}
      </div>
      <div className="editor-row">
        <label className="editor-label">Feedbacks par réponse</label>
        {options.map(opt => (
          <div key={opt.key} style={{ marginBottom: 10 }}>
            <div className={`fb-label ${opt.key === correct ? 'fb-correct' : ''}`}>
              {opt.key === correct ? '✓ ' : ''}Feedback pour {opt.key}
            </div>
            <textarea className="editor-textarea" rows={2}
              value={feedbacks[opt.key] || ''} onChange={e => updateFb(opt.key, e.target.value)} />
          </div>
        ))}
      </div>
      <div className="editor-actions">
        <button className="btn btn-primary"
          style={{ width: 'auto', padding: '10px 24px' }}
          onClick={() => onSave({ ...question, title, context, options, correct, feedbacks })}>
          💾 Enregistrer
        </button>
        <button className="btn btn-ghost"
          style={{ width: 'auto', padding: '10px 24px' }}
          onClick={onCancel}>Annuler</button>
      </div>
    </div>
  );
}

function SystemEditor({ question, onSave, onCancel }) {
  const [title,   setTitle]   = useState(question.title);
  const [context, setContext] = useState(question.context);
  const [subs,    setSubs]    = useState(
    question.subQuestions.map(s => ({ ...s, feedbacks: { ...s.feedbacks } }))
  );

  const updateSub = (i, field, val) =>
    setSubs(p => { const n = [...p]; n[i] = { ...n[i], [field]: val }; return n; });

  const updateFb = (i, key, val) =>
    setSubs(p => {
      const n = [...p];
      n[i] = { ...n[i], feedbacks: { ...n[i].feedbacks, [key]: val } };
      return n;
    });

  const addSub = () => {
    const id = `${question.id}${String.fromCharCode(97 + subs.length)}`;
    setSubs(p => [...p, { id, text: '', correct: 'Oui', feedbacks: { Oui: '', Non: '' } }]);
  };

  const removeSub = i => subs.length > 1 && setSubs(p => p.filter((_, j) => j !== i));

  return (
    <div className="editor-box">
      <div className="editor-row">
        <label className="editor-label">Titre</label>
        <input className="editor-input" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div className="editor-row">
        <label className="editor-label">Système d'équations</label>
        <textarea className="editor-textarea" rows={3} value={context}
          onChange={e => setContext(e.target.value)} />
      </div>

      {subs.map((sub, i) => (
        <div key={sub.id} className="subq-editor-block">
          <div className="subq-editor-header">
            <span className="subq-num-badge">{i + 1}</span>
            <strong>Sous-question {i + 1}</strong>
            {subs.length > 1 && (
              <button className="btn-icon-del" onClick={() => removeSub(i)}>✕</button>
            )}
          </div>
          <div className="editor-row">
            <label className="editor-label">Énoncé</label>
            <input className="editor-input" value={sub.text}
              onChange={e => updateSub(i, 'text', e.target.value)} />
          </div>
          <div className="editor-row">
            <label className="editor-label">Bonne réponse</label>
            <div style={{ display: 'flex', gap: 16 }}>
              {['Oui', 'Non'].map(v => (
                <label key={v} className="radio-label">
                  <input type="radio" name={`corr_${sub.id}`}
                    checked={sub.correct === v} onChange={() => updateSub(i, 'correct', v)} />
                  {v}
                </label>
              ))}
            </div>
          </div>
          <div className="editor-row">
            <label className="editor-label">Feedback si Oui</label>
            <textarea className="editor-textarea" rows={2}
              value={sub.feedbacks.Oui || ''} onChange={e => updateFb(i, 'Oui', e.target.value)} />
          </div>
          <div className="editor-row">
            <label className="editor-label">Feedback si Non</label>
            <textarea className="editor-textarea" rows={2}
              value={sub.feedbacks.Non || ''} onChange={e => updateFb(i, 'Non', e.target.value)} />
          </div>
        </div>
      ))}

      <button className="btn-add-opt" onClick={addSub}>+ Ajouter une sous-question</button>

      <div className="editor-actions">
        <button className="btn btn-primary"
          style={{ width: 'auto', padding: '10px 24px' }}
          onClick={() => onSave({ ...question, title, context, subQuestions: subs })}>
          💾 Enregistrer
        </button>
        <button className="btn btn-ghost"
          style={{ width: 'auto', padding: '10px 24px' }}
          onClick={onCancel}>Annuler</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  EXERCISES TAB
// ═══════════════════════════════════════════════════

function ExercisesTab() {
  const [questions,    setQuestions]    = useState(() => getQuestions());
  const [editing,      setEditing]      = useState(null);
  const [showAddMenu,  setShowAddMenu]  = useState(false);

  const persist = (qs) => { saveQuestions(qs); setQuestions(qs); };

  const handleSave = (updated) => {
    persist(questions.map(q => q.id === updated.id ? updated : q));
    setEditing(null);
  };

  const handleDelete = (id) => {
    if (questions.length <= 1) { alert('Au moins une question doit être conservée.'); return; }
    if (!window.confirm('Supprimer cette question ?')) return;
    persist(questions.filter(q => q.id !== id));
  };

  const nextId = () => {
    const nums = questions.map(q => Number(q.id)).filter(n => !isNaN(n));
    return nums.length ? Math.max(...nums) + 1 : 1;
  };

  const addQCM = () => {
    const id = nextId();
    const q = {
      id, type: 'qcm',
      title: 'Nouvelle question QCM', context: '',
      options: [{ key: 'A', text: '' }, { key: 'B', text: '' }, { key: 'C', text: '' }],
      correct: 'A',
      feedbacks: { A: '', B: '', C: '' },
    };
    persist([...questions, q]);
    setEditing(id);
    setShowAddMenu(false);
  };

  const addSystem = () => {
    const id = nextId();
    const q = {
      id, type: 'system',
      title: "Nouveau système d'équations", context: '',
      subQuestions: [{ id: `${id}a`, text: '', correct: 'Oui', feedbacks: { Oui: '', Non: '' } }],
    };
    persist([...questions, q]);
    setEditing(id);
    setShowAddMenu(false);
  };

  const resetDefault = () => {
    if (!window.confirm('Réinitialiser tous les exercices par défaut ?')) return;
    persist(defaultQuestions);
    setEditing(null);
  };

  return (
    <div>
      <div className="ex-toolbar">
        <span className="ex-count">
          {questions.length} exercice{questions.length > 1 ? 's' : ''}
        </span>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost-sm" onClick={resetDefault}>↺ Réinitialiser</button>
          <div style={{ position: 'relative' }}>
            <button className="btn btn-primary"
              style={{ width: 'auto', padding: '9px 18px', fontSize: '0.88rem' }}
              onClick={() => setShowAddMenu(m => !m)}>
              + Ajouter ▾
            </button>
            {showAddMenu && (
              <div className="add-menu">
                <button onClick={addQCM}>📋 Question QCM</button>
                <button onClick={addSystem}>✋ Système Oui/Non</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="exercises-list">
        {questions.map((q, idx) => (
          <div key={q.id} className="exercise-item">
            <div className="exercise-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <span className="ex-num">{idx + 1}</span>
                <span className={`question-badge ${q.type === 'qcm' ? 'qbadge-qcm' : 'qbadge-ouinon'}`}
                  style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>
                  {q.type === 'qcm' ? '📋 QCM' : '✋ Oui/Non'}
                </span>
                <span className="ex-title">{q.title}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button className="btn-edit"
                  onClick={() => setEditing(editing === q.id ? null : q.id)}>
                  {editing === q.id ? '✕ Fermer' : '✏ Modifier'}
                </button>
                <button className="btn-del" onClick={() => handleDelete(q.id)}>🗑</button>
              </div>
            </div>

            {editing === q.id && (
              q.type === 'qcm'
                ? <QCMEditor    question={q} onSave={handleSave} onCancel={() => setEditing(null)} />
                : <SystemEditor question={q} onSave={handleSave} onCancel={() => setEditing(null)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  MAIN DASHBOARD
// ═══════════════════════════════════════════════════

export default function AdminDashboard() {
  const [tab, setTab] = useState('results');
  const navigate = useNavigate();

  const handleLogout = () => { adminLogout(); navigate('/admin'); };

  return (
    <div className="admin-wrap">
      {/* Header */}
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="brand-icon" style={{ width: 40, height: 40, fontSize: 20 }}>📐</div>
          <div>
            <div style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: '1.2rem', color: 'var(--blue)' }}>
              MathQuiz Admin
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tableau de bord</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/" className="btn-ghost-sm" style={{ textDecoration: 'none' }}>👁 Voir le test</a>
          <button className="btn-ghost-sm" onClick={handleLogout}>🚪 Déconnexion</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button className={`tab-btn${tab === 'results' ? ' active' : ''}`}
          onClick={() => setTab('results')}>
          📊 Résultats des élèves
        </button>
        <button className={`tab-btn${tab === 'exercises' ? ' active' : ''}`}
          onClick={() => setTab('exercises')}>
          ✏ Modifier les exercices
        </button>
      </div>

      {/* Content */}
      <div className="admin-content">
        {tab === 'results'   ? <ResultsTab />   : <ExercisesTab />}
      </div>
    </div>
  );
}
