import { useState } from 'react';

export default function StudentForm({ onSubmit }) {
  const [form, setForm]       = useState({ prenom: '', nom: '', college: '' });
  const [niveau, setNiveau]   = useState(null);
  const [inscrit, setInscrit] = useState(null);
  const [errors, setErrors]   = useState({});
  const [showErr, setShowErr] = useState(false);

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: false }));
  };

  const handleSubmit = () => {
    const e = {};
    if (!form.prenom.trim())  e.prenom  = true;
    if (!form.nom.trim())     e.nom     = true;
    if (!form.college.trim()) e.college = true;
    if (!niveau)              e.niveau  = true;
    if (!inscrit)             e.inscrit = true;

    setErrors(e);
    if (Object.keys(e).length > 0) { setShowErr(true); return; }
    setShowErr(false);

    onSubmit({
      prenom:  form.prenom.trim(),
      nom:     form.nom.trim(),
      niveau:  niveau === 'Oui' ? '3ème' : 'Autre niveau',
      college: form.college.trim(),
      inscrit,
    });
  };

  return (
    <div className="screen-wrap">
      <div className="card">
        <div className="brand">
          <div className="brand-icon">📐</div>
          <h1>MathQuiz</h1>
          <p>Teste tes connaissances en mathématiques !</p>
        </div>

        {showErr && (
          <div className="error-msg">
            ⚠ Merci de remplir tous les champs et de sélectionner toutes les options.
          </div>
        )}

        <div className="form-group">
          <label>Prénom <span className="required">*</span></label>
          <input
            type="text"
            className={errors.prenom ? 'input-error' : ''}
            placeholder="Ex : Alice"
            value={form.prenom}
            onChange={e => set('prenom', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Nom <span className="required">*</span></label>
          <input
            type="text"
            className={errors.nom ? 'input-error' : ''}
            placeholder="Ex : Martin"
            value={form.nom}
            onChange={e => set('nom', e.target.value)}
          />
        </div>

        <div className="form-group">
          <span className="toggle-label">Êtes-vous en 3ème ? <span className="required">*</span></span>
          <div className="toggle-group">
            {['Oui', 'Non'].map(v => (
              <button
                key={v}
                className={`toggle-btn${niveau === v ? ' active' : ''}${errors.niveau && niveau !== v ? ' toggle-err' : ''}`}
                onClick={() => { setNiveau(v); setErrors(e => ({ ...e, niveau: false })); }}
              >{v}</button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Nom du collège <span className="required">*</span></label>
          <input
            type="text"
            className={errors.college ? 'input-error' : ''}
            placeholder="Ex : Collège Victor Hugo"
            value={form.college}
            onChange={e => set('college', e.target.value)}
          />
        </div>

        <div className="form-group">
          <span className="toggle-label">Êtes-vous inscrit(e) dans ce collège ? <span className="required">*</span></span>
          <div className="toggle-group">
            {['Oui', 'Non'].map(v => (
              <button
                key={v}
                className={`toggle-btn${inscrit === v ? ' active' : ''}${errors.inscrit && inscrit !== v ? ' toggle-err' : ''}`}
                onClick={() => { setInscrit(v); setErrors(e => ({ ...e, inscrit: false })); }}
              >{v}</button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleSubmit}>
          Accéder au test →
        </button>

      </div>
    </div>
  );
}
