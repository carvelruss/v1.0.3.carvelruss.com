import { Link } from 'react-router-dom';

export default function WSFooter() {
  return (
    <footer className="pf-footer">
      <div className="container">
        <div className="pf-footer__inner">

          {/* Left: brand + tagline */}
          <div>
            <Link to="/" className="ws-brand" style={{ fontSize: '1rem' }}>
              Carvel<span> Russ</span>
            </Link>
            <p className="pf-footer__copy" style={{ marginTop: '.375rem' }}>
              UI/UX Developer &amp; Digital Product Designer
            </p>
          </div>

          {/* Right: nav links + copyright */}
          <div>
            <nav className="pf-footer__links">
              <Link to="/case-studies" className="pf-footer__link">Case Studies</Link>
              <Link to="/blogs" className="pf-footer__link">Blogs</Link>
              <Link to="/skills" className="pf-footer__link">Skills</Link>
              <Link to="/contact" className="pf-footer__link">Contact</Link>
            </nav>
            <p className="pf-footer__copy" style={{ marginTop: '.75rem' }}>
              &copy; 2024 Carvel Russ. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
