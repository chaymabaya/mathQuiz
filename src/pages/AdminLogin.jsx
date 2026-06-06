import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../utils/storage';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!username || !password) { setError('Veuillez remplir tous les champs.'); return; }
    if (adminLogin(username, password)) {
      navigate('/admin/dashboard');
    } else {
      setError('Identifiants incorrects. Réessayez.');
    }
  };

  return (
    <div className="screen-wrap">
      <div className="card" style={{ maxWidth: 420 }}>
        <div className="brand">
          <div className="brand-icon">🔐</div>
          <h1>Espace Admin</h1>
          <p>Connexion réservée aux enseignants</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="form-group">
          <label>Identifiant</label>
          <input type="text" placeholder="admin" value={username}
            onChange={e => { setUsername(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>

        <div className="form-group">
          <label>Mot de passe</label>
          <input type="password" placeholder="••••••••" value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>

        <button className="btn btn-primary" onClick={handleLogin}>Se connecter →</button>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <a href="/" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 700 }}>
            ← Retour au test élève
          </a>
        </p>
      </div>
    </div>
  );
}
