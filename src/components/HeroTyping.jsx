import { useState, useEffect } from 'react';
import personal from '../data/personal.json';
import icons from '../data/icons';
import './HeroTyping.css';

const { name: nameText, roles, greeting, photo, university, socials } = personal;

function HeroTyping() {
  // Phase 1: type the name
  const [nameCharIndex, setNameCharIndex] = useState(0);
  const [nameFinished, setNameFinished] = useState(false);

  // Phase 2: cycle through roles
  const [roleIndex, setRoleIndex] = useState(0);
  const [roleCharIndex, setRoleCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Type the name first
  useEffect(() => {
    if (nameFinished) return;
    if (nameCharIndex < nameText.length) {
      const timeout = setTimeout(() => setNameCharIndex(nameCharIndex + 1), 100);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => setNameFinished(true), 600);
      return () => clearTimeout(timeout);
    }
  }, [nameCharIndex, nameFinished]);

  // Then cycle through roles
  useEffect(() => {
    if (!nameFinished) return;
    const currentRole = roles[roleIndex];
    let timeout;

    if (!isDeleting && roleCharIndex < currentRole.length) {
      timeout = setTimeout(() => setRoleCharIndex(roleCharIndex + 1), 80);
    } else if (!isDeleting && roleCharIndex === currentRole.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && roleCharIndex > 0) {
      timeout = setTimeout(() => setRoleCharIndex(roleCharIndex - 1), 40);
    } else if (isDeleting && roleCharIndex === 0) {
      setIsDeleting(false);
      setRoleIndex((roleIndex + 1) % roles.length);
    }

    return () => clearTimeout(timeout);
  }, [roleCharIndex, isDeleting, roleIndex, nameFinished]);

  const displayName = nameText.substring(0, nameCharIndex);
  const displayRole = nameFinished ? roles[roleIndex].substring(0, roleCharIndex) : '';

  return (
    <section id="hero" className="hero-typing">
      <div className="hero-typing-container hero-animate">
        <div className="hero-typing-text">
          <p className="hero-typing-greeting">{greeting}</p>
          <h1 className="hero-typing-name">
            <span className="typed-text">{displayName}</span>
            {!nameFinished && <span className="cursor">|</span>}
          </h1>
          <h2 className="hero-typing-role">
            {nameFinished && (
              <>
                <span className="typed-text">{displayRole}</span>
                <span className="cursor">|</span>
              </>
            )}
          </h2>
          {nameFinished && (
            <div className="hero-university-badge">
              <img src={university.logo} alt={university.name} className="hero-university-logo" />
              <span>{university.name}</span>
            </div>
          )}
          <div className="hero-typing-actions">
            <a href="#projects" className="btn btn-primary">I miei progetti</a>
            <a href="#contact" className="btn btn-outline">Contattami</a>
          </div>
          <div className="hero-typing-socials">
            {socials.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.name}>
                {icons[s.icon]?.(22)}
              </a>
            ))}
          </div>
        </div>
        <div className="hero-typing-image photo-glow">
          <img className="float-animation" src={photo} alt={nameText} />
        </div>
      </div>
    </section>
  );
}

export default HeroTyping;
