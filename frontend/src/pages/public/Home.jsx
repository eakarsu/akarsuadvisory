import { Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

const SERVICES = [
  { name: 'Financial Statement Review & Analysis', slug: 'financial-statement-review', desc: 'Profit & Loss, Balance Sheet, Cash Flow Statement, metrics/KPIs, working capital — we break down the numbers so you can make informed decisions.' },
  { name: 'Annual Budget Planning', slug: 'annual-budget-planning', desc: 'Structured annual budgets aligned with your business goals, giving you a clear financial roadmap for the year ahead.' },
  { name: 'Monthly P&L Forecasting', slug: 'monthly-pl-forecasting', desc: 'Stay ahead with monthly profit and loss projections that help you anticipate revenue trends and manage expenses proactively.' },
  { name: 'Weekly Cash Flow Forecasting', slug: 'weekly-cash-flow-forecasting', desc: 'Real-time visibility into your cash position with weekly forecasts so you never get caught off guard.' },
  { name: 'Scenario Modeling', slug: 'scenario-modeling', desc: 'Data-driven modeling for key decisions — capital expenditures, operating expense adjustments, and more.' },
];

export default function Home() {
  useSEO('Financial Clarity for Growing Businesses', 'Akarsu Advisory helps small businesses unlock financial clarity, sustainable growth, and data-driven decision making.');

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <p className="section-label" style={{ color: '#d3d3d3' }}>Who We Are</p>
          <h1 className="hero-title" style={{ fontSize: 48, maxWidth: 800, marginBottom: 24 }}>
            Financial Clarity for <span style={{ color: '#d3d3d3' }}>Growing Businesses</span>
          </h1>
          <p className="hero-subtitle" style={{ maxWidth: 640, fontSize: 18, lineHeight: 1.8 }}>
            We are a team of experienced financial professionals dedicated to helping small businesses unlock financial clarity, sustainable growth and data driven decision making. With several years of experience in finance, accounting and business acumen, we provide the expertise you need without the costs of a full-time executive.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="section">
        <div className="container">
          <p className="section-label">Services Offered</p>
          <h2 className="section-title" style={{ fontSize: 36, marginBottom: 48 }}>How We Help You Grow</h2>
          <div className="grid grid-3" style={{ textAlign: 'left' }}>
            {SERVICES.map(svc => (
              <Link to={`/services/${svc.slug}`} className="card card-link" key={svc.slug}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#2a3139', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
                </div>
                <h3 className="card-title">{svc.name}</h3>
                <p className="card-text">{svc.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <p className="section-label">Let's Connect</p>
          <h2 className="cta-title" style={{ fontSize: 36 }}>Ready to Take Control of Your Finances?</h2>
          <p className="cta-text">
            Schedule a free consultation and discover how we can help your business thrive.
          </p>
          <Link to="/book-consultation" className="btn btn-primary btn-lg" style={{ gap: 8 }}>
            Get Started
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
