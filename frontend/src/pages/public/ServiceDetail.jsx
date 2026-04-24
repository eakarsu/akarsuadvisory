import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

export default function ServiceDetail() {
  const { slug } = useParams();
  const [service, setService] = useState(null);

  useEffect(() => {
    fetch(`/api/services/${slug}`).then(r => r.json()).then(setService).catch(() => {});
  }, [slug]);

  useSEO(service?.name, service?.tagline);

  if (!service) return <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>Loading...</div>;

  const features = typeof service.features === 'string' ? JSON.parse(service.features) : (service.features || []);

  return (
    <div>
      <section className="hero hero-sm">
        <div className="container">
          <p className="section-label">Our Services</p>
          <h1 className="hero-title">{service.name}</h1>
          <p className="hero-subtitle">{service.tagline}</p>
        </div>
      </section>
      <section className="section">
        <div className="container content-narrow">
          <p className="body-text">{service.description}</p>
          {features.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h2 className="section-title" style={{ fontSize: 24 }}>What We Deliver</h2>
              <div className="grid grid-2" style={{ marginTop: 20 }}>
                {features.map((f, i) => (
                  <div key={i} className="card"><p className="card-title" style={{ fontSize: 15, marginBottom: 0 }}>{f}</p></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      <section className="cta-section">
        <div className="container text-center">
          <h2 className="cta-title">Discuss Your Needs</h2>
          <p className="cta-text">Let us understand your situation and design an approach tailored to your objectives.</p>
          <Link to="/book-consultation" className="btn btn-primary btn-lg">Book a Consultation</Link>
        </div>
      </section>
    </div>
  );
}
