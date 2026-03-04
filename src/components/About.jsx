import about from '../data/about.json';
import './About.css';

function About() {
  return (
    <section id="about" className="about">
      <div className="section-container">
        <h2 className="section-title reveal">{about.title}</h2>
        <p className="section-subtitle reveal reveal-delay-1">{about.subtitle}</p>
        <div className="about-content reveal reveal-delay-2">
          <div className="about-bio">
            <p>{about.bio}</p>
            <div className="about-interests">
              {about.interests.map((interest) => (
                <span key={interest} className="about-interest-tag">{interest}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
