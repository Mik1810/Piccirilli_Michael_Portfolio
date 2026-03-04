import personal from '../data/personal.json';
import icons from '../data/icons';
import './Footer.css';

function Footer() {
  const year = new Date().getFullYear();
  const { name, socials } = personal;

  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; {year} {name}. Tutti i diritti riservati.</p>
        <div className="footer-socials">
          {socials.map((s) => (
            <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.name} className="footer-social-link">
              {icons[s.icon]?.(24)}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
