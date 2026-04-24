import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

export default function CaseStudies() {
  useSEO('Case Studies', 'Real results from real engagements.');
  const [cases, setCases] = useState([]);

  useEffect(() => {
    fetch('/api/case-studies').then(r => r.json()).then(d => setCases(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  return (
    <div>
      <section className="hero hero-sm">
        <div className="container">
          <h1 className="hero-title">Case Studies</h1>
          <p className="hero-subtitle">Real results from real engagements.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {cases.length === 0 ? (
            <p className="text-muted">No case studies published yet.</p>
          ) : (
            <div className="grid grid-3">
              {cases.map(cs => (
                <Link key={cs.id} to={`/case-studies/${cs.slug}`} className="card card-link">
                  {cs.industry && <span className="badge">{cs.industry}</span>}
                  <h3 className="card-title" style={{ marginTop: cs.industry ? 12 : 0 }}>{cs.title}</h3>
                  <p className="card-text">{cs.result ? cs.result.slice(0, 150) + '...' : ''}</p>
                  <span className="card-arrow">&rarr;</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
