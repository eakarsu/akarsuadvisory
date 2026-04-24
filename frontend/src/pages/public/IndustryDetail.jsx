import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

export default function IndustryDetail() {
  const { slug } = useParams();
  const [ind, setInd] = useState(null);

  useEffect(() => {
    fetch(`/api/industries/${slug}`).then(r => r.json()).then(setInd).catch(() => {});
  }, [slug]);

  useSEO(ind?.name, ind?.description);

  if (!ind) return <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>Loading...</div>;

  return (
    <div>
      <section className="hero hero-sm">
        <div className="container">
          <p className="section-label">Industry Focus</p>
          <h1 className="hero-title">{ind.name}</h1>
          <p className="hero-subtitle">{ind.description}</p>
        </div>
      </section>
      <section className="section">
        <div className="container content-narrow">
          {ind.challenges && (
            <div style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Key Challenges</h2>
              <p className="body-text">{ind.challenges}</p>
            </div>
          )}
          {ind.approach && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Our Approach</h2>
              <p className="body-text">{ind.approach}</p>
            </div>
          )}
        </div>
      </section>
      <section className="cta-section">
        <div className="container text-center">
          <h2 className="cta-title">Let's Talk About Your Industry</h2>
          <p className="cta-text">We bring deep sector expertise to every engagement.</p>
          <Link to="/book-consultation" className="btn btn-primary btn-lg">Book a Consultation</Link>
        </div>
      </section>
    </div>
  );
}
