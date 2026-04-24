import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

export default function Services() {
  useSEO('Our Services', 'Explore financial advisory services from Akarsu Advisory — financial statement review, budgeting, forecasting, and scenario modeling for small businesses.');

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="site">
      {/* Hero */}
      <section className="hero hero-sm">
        <div className="container">
          <h1 className="hero-title">Services Offered</h1>
          <p className="hero-subtitle">
            How We Help You Grow — financial clarity, sustainable growth, and data-driven decision making for your business.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section">
        <div className="container">
          {loading ? (
            <p className="text-center text-muted">Loading services...</p>
          ) : services.length > 0 ? (
            <div className="grid grid-3">
              {services.map((svc) => (
                <Link
                  to={`/services/${svc.slug}`}
                  className="card card-link"
                  key={svc.id || svc.slug}
                >
                  <h3 className="card-title">{svc.name}</h3>
                  <p className="card-text">{svc.tagline}</p>
                  <span className="card-arrow">&rarr;</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted">No services available at this time.</p>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta-section">
        <div className="container text-center">
          <h2 className="cta-title">Not Sure Where to Start?</h2>
          <p className="cta-text">
            Every business is different. Tell us about your goals and we&rsquo;ll
            recommend the right approach.
          </p>
          <Link to="/book-consultation" className="btn btn-primary btn-lg">
            Book a Consultation
          </Link>
        </div>
      </section>
    </div>
  );
}
