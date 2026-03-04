import { useState } from 'react';
import personal from '../data/personal.json';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { name, navLinks, cv } = personal;

  const handleClick = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="#hero" className="navbar-logo">
          {name}
        </a>
        <div className="navbar-right">
          <button
            className={`navbar-toggle ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <ThemeToggle />
        </div>
        <ul className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={handleClick}>
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={cv}
              target="_blank"
              rel="noopener noreferrer"
              className="navbar-cv-btn"
              onClick={handleClick}
            >
              Scarica CV
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
