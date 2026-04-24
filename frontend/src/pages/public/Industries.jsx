import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

export default function Industries() {
  useSEO('Industries', 'Deep sector expertise across technology, financial services, healthcare, energy, and more.');
  const [industries, setIndustries] = useState([]);

  useEffect(() => {
    fetch('/api/industries').then(r => r.json()).then(d => setIndustries(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  return (
    <div>
      <section className="hero hero-sm">
        <div className="container">
          <h1 className="hero-title">Industries We Serve</h1>
          <p className="hero-subtitle">Deep sector expertise that translates into practical, actionable advice.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            {industries.map(ind => (
              <Link key={ind.id} to={`/industries/${ind.slug}`} className="card card-link">
                <h3 className="card-title">{ind.name}</h3>
                <p className="card-text">{ind.description}</p>
                <span className="card-arrow">&rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="cta-section">
        <div className="container text-center">
          <h2 className="cta-title">Need Industry-Specific Advice?</h2>
          <p className="cta-text">Our sector specialists bring deep domain knowledge to every engagement.</p>
          <Link to="/book-consultation" className="btn btn-primary btn-lg">Book a Consultation</Link>
        </div>
      </section>
    </div>
  );
}
