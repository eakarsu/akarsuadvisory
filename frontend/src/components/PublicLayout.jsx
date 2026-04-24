import { useState, useCallback } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import SearchModal from './SearchModal';

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  return (
    <div className="site">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo">
            <img src="/logo.jpg" alt="Akarsu Advisory" className="logo-img" />
          </Link>
          <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
            <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
            <NavLink to="/about" onClick={() => setMenuOpen(false)}>About</NavLink>
            <NavLink to="/services" onClick={() => setMenuOpen(false)}>Services</NavLink>
            <NavLink to="/contact" onClick={() => setMenuOpen(false)}>Contact</NavLink>
            <button className="search-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
          </nav>
          <div className="header-actions">
            <Link to="/book-consultation" className="header-cta">Book a Consultation</Link>
          </div>
          <button className={`mobile-toggle ${menuOpen ? 'mobile-toggle-open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span/><span/><span/>
          </button>
        </div>
      </header>
      {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />}

      <main id="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-social">
            <a href="https://www.instagram.com/akarsuadvisory" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="https://www.linkedin.com/company/akarsuadvisory/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            <a href="https://www.facebook.com/share/1a8swmNaGM/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
          </div>
          <p style={{ color: '#9ca3af', fontSize: 14 }}>&copy; {new Date().getFullYear()} Akarsu Advisory LLC. All rights reserved.</p>
        </div>
      </footer>
      <SearchModal open={searchOpen} onClose={closeSearch} />
    </div>
  );
}
