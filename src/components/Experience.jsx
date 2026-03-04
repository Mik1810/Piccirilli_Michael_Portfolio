import './Experience.css';

const experiences = [
  {
    role: 'CyberChallenge 2024',
    company: 'Cybersecurity National Lab',
    period: 'Giugno 2024',
    description:
      'Partecipante alla CyberChallenge 2024, raggiungendo la fase nazionale a Torino con acquisizione di competenze pratiche in cybersecurity.',
  },
  {
    role: 'iCities — CINI Challenge',
    company: 'iCities Conference, Gaeta',
    period: 'Gen 2024 – Ott 2024',
    description:
      'Sviluppo del "Flood Monitoring and Management System" per il monitoraggio e prevenzione di disastri ambientali. Vincitore del premio SellaLab offerto da Banca Sella.',
  },
  {
    role: 'Street Science 2025',
    company: 'Università dell\'Aquila',
    period: 'Settembre 2025',
    description:
      'Organizzazione e gestione dello stand pop-up di informatica e delle Olimpiadi di Informatica per le scuole superiori.',
  },
  {
    role: 'Donazione di Sangue — Volontario',
    company: 'Teramo',
    period: 'Gen 2024 – In corso',
    description:
      'Volontario per la donazione di sangue, partecipo regolarmente quando possibile.',
  },
];

const education = [
  {
    degree: 'Laurea Magistrale in Informatica — Curriculum AICONDA',
    institution: 'Università degli Studi dell\'Aquila',
    period: 'Ott 2024 – In corso',
    description: 'Curriculum in AI, Computing and Data Analytics.',
  },
  {
    degree: 'Laurea Triennale in Informatica — 110/110',
    institution: 'Università degli Studi dell\'Aquila',
    period: 'Ott 2021 – Ott 2024',
    description: 'Tesi: "Studio della complessità computazionale di Nine Men\'s Morris". Competenze in analisi, progettazione software, linguaggi di programmazione e lavoro in team.',
  },
];

function Experience() {
  return (
    <section id="experience" className="experience">
      <div className="section-container">
        <h2 className="section-title">Esperienze</h2>
        <p className="section-subtitle">Il mio percorso accademico e le attività svolte</p>

        <div className="timeline">
          <h3 className="timeline-heading">Attività e Conferenze</h3>
          {experiences.map((exp, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <div>
                    <h4 className="timeline-role">{exp.role}</h4>
                    <p className="timeline-company">{exp.company}</p>
                  </div>
                  <span className="timeline-period">{exp.period}</span>
                </div>
                <p className="timeline-description">{exp.description}</p>
              </div>
            </div>
          ))}

          <h3 className="timeline-heading" style={{ marginTop: '3rem' }}>
            Formazione
          </h3>
          {education.map((edu, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <div>
                    <h4 className="timeline-role">{edu.degree}</h4>
                    <p className="timeline-company">{edu.institution}</p>
                  </div>
                  <span className="timeline-period">{edu.period}</span>
                </div>
                <p className="timeline-description">{edu.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Experience;
