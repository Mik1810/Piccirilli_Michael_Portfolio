import './Skills.css';

const skillCategories = [
  {
    category: 'Programmazione',
    skills: ['Programmazione Web', 'Linguaggi di Programmazione', 'Progettazione Software', 'Problem Solving'],
  },
  {
    category: 'Competenze Tecniche',
    skills: ['Intelligenza Artificiale', 'Cybersecurity', 'Strumenti e Tecnologie Moderne', 'Documentazione Tecnica'],
  },
  {
    category: 'Soft Skills',
    skills: ['Lavoro in Team', 'Apprendimento Autonomo', 'Metodo Scientifico', 'Comunicazione dei Risultati'],
  },
  {
    category: 'Lingue',
    skills: ['Italiano (madrelingua)', 'Inglese (B2)'],
  },
];

function Skills() {
  return (
    <section id="skills" className="skills">
      <div className="section-container">
        <h2 className="section-title reveal">Competenze</h2>
        <p className="section-subtitle reveal reveal-delay-1">
          Le tecnologie e gli strumenti con cui lavoro
        </p>
        <div className="skills-grid">
          {skillCategories.map((cat, index) => (
            <div key={cat.category} className={`skill-category reveal reveal-delay-${Math.min(index + 1, 4)}`}>
              <h3 className="skill-category-title">{cat.category}</h3>
              <div className="skill-list">
                {cat.skills.map((skill) => (
                  <span key={skill} className="skill-item">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Skills;
