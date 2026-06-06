export default function Landing({ onStart }) {
  return (
    <div className="landing-wrap">

      {/* ── Header ── */}
      <header className="site-header">
        <div className="site-logo">
          <span className="site-logo-icon">📐</span>
          <span>MathQuiz</span>
        </div>
        <a href="/admin" className="site-admin-link">🔐 Espace enseignant</a>
      </header>

      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-badge">✨ Plateforme éducative interactive</div>

          <h1 className="hero-title">
            Entraîne-toi en<br />
            <span className="hero-title-accent">Mathématiques</span>
          </h1>

          <p className="hero-subtitle">
            Des exercices interactifs avec corrections détaillées,<br />
            conçus pour les collégiens qui veulent progresser.
          </p>

          <button className="btn hero-cta" onClick={onStart}>
            🚀 Commencer le test
          </button>

          <div className="hero-stats">
            <div className="hero-stat"><span>📋</span>QCM interactif</div>
            <div className="hero-stat-sep" />
            <div className="hero-stat"><span>💡</span>Corrections instantanées</div>
            <div className="hero-stat-sep" />
            <div className="hero-stat"><span>🏆</span>Score détaillé</div>
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </section>

      {/* ── Features ── */}
      <section className="features-section">
        <h2 className="features-title">Comment ça marche ?</h2>
        <div className="features-grid">
          {[
            { icon: '📝', step: '01', title: 'Inscription', desc: 'Remplis le formulaire rapide avec ton prénom, ton collège et ton niveau.' },
            { icon: '🧠', step: '02', title: 'Test', desc: 'Réponds aux questions de maths avec feedback immédiat à chaque réponse.' },
            { icon: '📊', step: '03', title: 'Résultats', desc: 'Vois ton score, tes erreurs et reçois des conseils pour progresser.' },
          ].map(f => (
            <div key={f.step} className="feature-card">
              <div className="feature-step">{f.step}</div>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-card-title">{f.title}</h3>
              <p className="feature-card-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA bottom ── */}
      <section className="cta-bottom">
        <h2>Prêt(e) à tester tes connaissances ?</h2>
        <p>Le test dure environ 5 minutes. Bonne chance !</p>
        <button className="btn hero-cta" onClick={onStart}>
          Je me lance ! →
        </button>
      </section>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <span>📐 MathQuiz — Plateforme éducative pour collégiens</span>
        <a href="/admin">Espace enseignant</a>
      </footer>

    </div>
  );
}
