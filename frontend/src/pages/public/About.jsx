import { Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

const approaches = [
  { title: 'Experienced Professionals', text: 'Our team brings years of experience in finance, accounting, and business strategy to every engagement.' },
  { title: 'No Full-Time Costs', text: 'Get the expertise of a CFO and financial team without the overhead of full-time executive hires.' },
  { title: 'Data-Driven Decisions', text: 'We turn your financial data into actionable insights that drive smarter business decisions.' },
  { title: 'Tailored to Your Business', text: 'Every business is different. We customize our approach to fit your unique goals and challenges.' },
];

const values = [
  { title: 'Clarity', text: 'We cut through complexity to give you a clear picture of your financial health.' },
  { title: 'Integrity', text: 'We provide honest, transparent counsel — even when the numbers tell a tough story.' },
  { title: 'Partnership', text: 'We work alongside you as a trusted extension of your team, not an outside vendor.' },
  { title: 'Results', text: 'We measure our success by the real financial outcomes we help you achieve.' },
];

export default function About() {
  useSEO('About', 'Learn about Akarsu Advisory — experienced financial professionals helping small businesses unlock clarity and growth.');

  return (
    <div>
      <section className="hero hero-sm">
        <div className="container">
          <h1 className="hero-title">About Akarsu Advisory</h1>
          <p className="hero-subtitle">
            Financial clarity for growing businesses — without the cost of a full-time executive.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container content-narrow">
          <p className="section-label">Who We Are</p>
          <h2 className="section-title">Your Financial Partner</h2>
          <div className="body-text">
            <p style={{ marginBottom: 16 }}>
              We are a team of experienced financial professionals dedicated to helping small businesses unlock financial clarity, sustainable growth, and data-driven decision making.
            </p>
            <p style={{ marginBottom: 16 }}>
              With several years of experience in finance, accounting, and business acumen, we provide the expertise you need without the costs of a full-time executive. From financial statement analysis to cash flow forecasting and scenario modeling, we give you the tools and insights to run your business with confidence.
            </p>
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <p className="section-label">Why Us</p>
          <h2 className="section-title">Our Approach</h2>
          <div className="grid grid-2">
            {approaches.map(item => (
              <div className="card" key={item.title}>
                <h3 className="card-title">{item.title}</h3>
                <p className="card-text">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="section-label">What Guides Us</p>
          <h2 className="section-title">Our Values</h2>
          <div className="grid grid-4">
            {values.map(v => (
              <div className="card text-center" key={v.title}>
                <h3 className="card-title">{v.title}</h3>
                <p className="card-text">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container text-center">
          <h2 className="cta-title">Ready to Get Started?</h2>
          <p className="cta-text">Let us help you make smarter financial decisions for your business.</p>
          <Link to="/book-consultation" className="btn btn-primary btn-lg">Book a Consultation</Link>
        </div>
      </section>
    </div>
  );
}
