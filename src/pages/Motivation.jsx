export default function Motivation({ student, onStart }) {
  return (
    <div className="screen-wrap">
      <div className="card motivation-card">
        <div className="rocket-wrap">
          <span className="rocket-icon">🚀</span>
        </div>

        <h2>Bonjour {student.prenom} {student.nom} !</h2>

        <div className="badge-row">
          <span className="badge badge-blue">{student.niveau}</span>
          <span className="badge badge-orange">{student.college}</span>
          <span className="badge badge-purple">
            {student.inscrit === 'Oui' ? '✓ Inscrit(e)' : 'Non-inscrit(e)'}
          </span>
        </div>

        <div className="motivation-quote">
          "Chaque erreur est une chance d'apprendre.<br />
          Concentre-toi et fais de ton mieux !"
        </div>

        <button className="btn btn-orange" onClick={onStart}>
          Je suis prêt(e) – Commencer ! 🎯
        </button>
      </div>
    </div>
  );
}
