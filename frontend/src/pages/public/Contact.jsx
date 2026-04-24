import { useState } from 'react';
import useSEO from '../../hooks/useSEO';

export default function Contact() {
  useSEO('Contact', 'Get in touch with Akarsu Advisory.');
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to send');
      setSent(true);
    } catch { setError('Something went wrong. Please try again.'); }
  };

  return (
    <div>
      <section className="hero hero-sm">
        <div className="container">
          <h1 className="hero-title">Contact Us</h1>
          <p className="hero-subtitle">We would like to hear from you.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="grid grid-2">
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Get in Touch</h2>
              <p className="body-text" style={{ marginBottom: 24 }}>Whether you have a specific challenge in mind or want to explore how we can help, we are here to listen.</p>
              <div style={{ marginBottom: 16 }}>
                <strong>Email</strong><br />
                <a href="mailto:akarsuadvisory@gmail.com" style={{ color: '#2a3139' }}>akarsuadvisory@gmail.com</a>
              </div>
            </div>
            <div>
              {sent ? (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                  <h3 style={{ color: '#2a3139', marginBottom: 8 }}>Thank you</h3>
                  <p className="text-muted">We will respond within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="form">
                  {error && <p style={{ color: '#dc2626', marginBottom: 12 }}>{error}</p>}
                  <div className="form-row">
                    <div className="form-group"><label htmlFor="c-name">Name *</label><input id="c-name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                    <div className="form-group"><label htmlFor="c-email">Email *</label><input id="c-email" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label htmlFor="c-company">Company</label><input id="c-company" value={form.company} onChange={e => setForm({...form, company: e.target.value})} /></div>
                    <div className="form-group"><label htmlFor="c-phone">Phone</label><input id="c-phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                  </div>
                  <div className="form-group"><label htmlFor="c-subject">Subject</label><input id="c-subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} /></div>
                  <div className="form-group"><label htmlFor="c-msg">Message *</label><textarea id="c-msg" rows={5} required value={form.message} onChange={e => setForm({...form, message: e.target.value})} /></div>
                  <button type="submit" className="btn btn-primary">Send Message</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
