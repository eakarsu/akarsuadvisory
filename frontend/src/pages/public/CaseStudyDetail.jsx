import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

export default function CaseStudyDetail() {
  const { slug } = useParams();
  const [cs, setCs] = useState(null);

  useEffect(() => {
    fetch(`/api/case-studies/${slug}`).then(r => r.json()).then(setCs).catch(() => {});
  }, [slug]);

  useSEO(cs?.title, cs?.result);

  if (!cs) return <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>Loading...</div>;

  const metrics = typeof cs.metrics === 'string' ? JSON.parse(cs.metrics) : (cs.metrics || {});
  const metricEntries = Object.entries(metrics);

  return (
    <div>
      <section className="hero hero-sm">
        <div className="container">
          {cs.industry && <span className="badge" style={{ marginBottom: 16 }}>{cs.industry}</span>}
          <h1 className="hero-title">{cs.title}</h1>
        </div>
      </section>

      {metricEntries.length > 0 && (
        <div className="stats-bar">
          <div className="container">
            <div className="stats-grid">
              {metricEntries.map(([key, val]) => (
                <div key={key} className="stat-item">
                  <div className="stat-value">{val}</div>
                  <div className="stat-label">{key.replace(/_/g, ' ')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <section className="section">
        <div className="container content-narrow">
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>The Challenge</h2>
            <p className="body-text">{cs.challenge}</p>
          </div>
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Our Approach</h2>
            <p className="body-text">{cs.approach}</p>
          </div>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Results</h2>
            <p className="body-text">{cs.result}</p>
          </div>
        </div>
      </section>
      <section className="cta-section">
        <div className="container text-center">
          <h2 className="cta-title">Ready for Similar Results?</h2>
          <p className="cta-text">Let us show you what we can achieve together.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/book-consultation" className="btn btn-primary btn-lg">Book a Consultation</Link>
            <Link to="/case-studies" className="btn btn-outline">More Case Studies</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
