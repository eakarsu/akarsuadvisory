import { useState } from 'react';
import useSEO from '../../hooks/useSEO';

const EMPLOYEE_OPTIONS = ['1 to 5', '6 to 20', '21 to 50', '51+'];

const INDUSTRY_OPTIONS = [
  'Technology / SaaS / Software',
  'Professional Services (consulting, agencies, legal, accounting, etc.)',
  'Healthcare / Medical',
  'E-commerce / Retail',
  'Manufacturing / Wholesale / Distribution',
  'Construction / Real Estate / Property Services',
  'Hospitality / Food / Lifestyle (restaurants, gyms, beauty, etc.)',
  'Other',
];

const SERVICE_OPTIONS = [
  'Understanding your financial statements',
  'Forecasting/budgeting your revenues and expenses',
  'Understanding your weekly cash balances',
  'Forecasting/budgeting weekly cash balances',
  'Assistance with scenario building, such as opening a new location, launching a new product/service, new personnel etc.',
  'Assistance with business operations, such as inventory management, cost management, working capital, personnel management, etc.',
  'Assistance with other strategic business decisions',
];

export default function BookConsultation() {
  useSEO('Book a Consultation', 'Schedule a confidential consultation with our advisory team.');
  const [form, setForm] = useState({
    email: '', name: '', company: '', phone: '',
    employees: '', industry: '', services: [], message: '',
    website: '', // honeypot — must stay blank; bots fill it in
  });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const toggleService = (svc) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(svc)
        ? prev.services.filter(s => s !== svc)
        : [...prev.services, svc],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.services.length === 0) { setError('Please select at least one service.'); return; }
    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.company,
          phone: form.phone,
          service_interest: form.services.join('; '),
          message: `Employees: ${form.employees}\nIndustry: ${form.industry}\n\nServices:\n${form.services.map(s => '- ' + s).join('\n')}\n\nNotes: ${form.message || 'N/A'}`,
          website: form.website, // honeypot
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setSent(true);
    } catch { setError('Something went wrong. Please try again.'); }
  };

  return (
    <div>
      <section className="hero hero-sm">
        <div className="container">
          <h1 className="hero-title">Book a Consultation</h1>
          <p className="hero-subtitle">A free, no-obligation conversation about your financial goals.</p>
        </div>
      </section>
      <section className="section">
        <div className="container content-narrow">
          {sent ? (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <h3 style={{ color: '#2a3139', marginBottom: 8 }}>Consultation Requested</h3>
              <p className="text-muted">Thank you. We will contact you within 24 hours to confirm your consultation.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="form">
              {error && <p style={{ color: '#dc2626', marginBottom: 12 }}>{error}</p>}

              <div className="form-group">
                <label htmlFor="b-email">Email *</label>
                <input id="b-email" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>

              <div className="form-group">
                <label htmlFor="b-name">What is your name? *</label>
                <input id="b-name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>

              <div className="form-group">
                <label htmlFor="b-company">What is the name of your business? *</label>
                <input id="b-company" required value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
              </div>

              <div className="form-group">
                <label htmlFor="b-phone">Please enter your phone number I can contact during business hours. *</label>
                <input id="b-phone" type="tel" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>

              <div className="form-group">
                <label>How many employees does your business have? *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  {EMPLOYEE_OPTIONS.map(opt => (
                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: '#475569', cursor: 'pointer' }}>
                      <input type="radio" name="employees" required value={opt} checked={form.employees === opt} onChange={e => setForm({...form, employees: e.target.value})} style={{ accentColor: '#2a3139' }} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>What industry is your business? *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  {INDUSTRY_OPTIONS.map(opt => (
                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: '#475569', cursor: 'pointer' }}>
                      <input type="radio" name="industry" required value={opt} checked={form.industry === opt} onChange={e => setForm({...form, industry: e.target.value})} style={{ accentColor: '#2a3139' }} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Which of these services would benefit your business? Select all that apply. *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  {SERVICE_OPTIONS.map(opt => (
                    <label key={opt} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 15, color: '#475569', cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.services.includes(opt)} onChange={() => toggleService(opt)} style={{ accentColor: '#2a3139', marginTop: 3 }} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="b-msg">Any other notes/comments/questions you may have? (Optional)</label>
                <textarea id="b-msg" rows={4} value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
              </div>

              {/* Honeypot field — hidden from humans, bots fill it in */}
              <div style={{ position: 'absolute', left: '-9999px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true">
                <label htmlFor="b-website">Website</label>
                <input id="b-website" type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={e => setForm({...form, website: e.target.value})} />
              </div>

              <button type="submit" className="btn btn-primary btn-lg">Request Consultation</button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
