import experiencesData from '../../data/experiences.json';
import educationData from '../../data/education.json';
import { useLanguage } from '../../context/LanguageContext';
import '../css/Experience.css';

function Experience() {
  const { t } = useLanguage();
  const translatedExp = t('experience.experiences');
  const translatedEdu = t('experience.education');

  // Merge translated text with static data (logos)
  const experiences = experiencesData.map((exp, i) => ({
    ...exp,
    ...(translatedExp[i] || {}),
  }));
  const education = educationData.map((edu, i) => ({
    ...edu,
    ...(translatedEdu[i] || {}),
  }));

  return (
    <section id="experience" className="experience">
      <div className="section-container">
        <h2 className="section-title reveal">{t('experience.title')}</h2>
        <p className="section-subtitle reveal reveal-delay-1">{t('experience.subtitle')}</p>

        <div className="timeline">
          <h3 className="timeline-heading reveal">{t('experience.activitiesHeading')}</h3>
          {experiences.map((exp, index) => (
            <div key={index} className={`timeline-item reveal reveal-delay-${Math.min(index + 1, 4)}`}>
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <div className="timeline-header-left">
                    <span className={`timeline-icon${exp.logoBg ? ' has-logo-bg' : ''}`} style={exp.logoBg ? {'--logo-bg': exp.logoBg} : undefined}>
                      {exp.logo ? <img src={exp.logo} alt={exp.role} /> : exp.icon}
                    </span>
                    <div>
                      <h4 className="timeline-role">{exp.role}</h4>
                      <p className="timeline-company">{exp.company}</p>
                    </div>
                  </div>
                  <span className="timeline-period">{exp.period}</span>
                </div>
                <p className="timeline-description">{exp.description}</p>
              </div>
            </div>
          ))}

          <h3 className="timeline-heading reveal" style={{ marginTop: '3rem' }}>
            {t('experience.educationHeading')}
          </h3>
          {education.map((edu, index) => (
            <div key={index} className={`timeline-item reveal reveal-delay-${Math.min(index + 1, 4)}`}>
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <div className="timeline-header-left">
                    <span className="timeline-icon">
                      {edu.logo ? <img src={edu.logo} alt={edu.degree} /> : edu.icon}
                    </span>
                    <div>
                      <h4 className="timeline-role">{edu.degree}</h4>
                      <p className="timeline-company">{edu.institution}</p>
                    </div>
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
