import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminModal from '../../components/AdminModal';

export default function Dashboard() {
  const { api } = useAuth();
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [aiReply, setAiReply] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    api('/api/admin/dashboard').then(r => r.json()).then(setData).catch(() => {});
  }, []);

  const openItem = (item, type) => { setSelected(item); setSelectedType(type); setAiReply(''); };

  const generateReply = async () => {
    setAiLoading(true); setAiReply('');
    try {
      const endpoint = selectedType === 'consultation' ? '/api/admin/ai/reply-consultation' : '/api/admin/ai/reply-contact';
      const body = selectedType === 'consultation'
        ? { name: selected.name, company: selected.company, service_interest: selected.service_interest, message: selected.message }
        : { name: selected.name, company: selected.company, subject: selected.subject, message: selected.message };
      const res = await api(endpoint, { method: 'POST', body: JSON.stringify(body) });
      const d = await res.json();
      setAiReply(d.reply);
    } catch { setAiReply('Failed to generate reply.'); }
    setAiLoading(false);
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); alert('Copied!'); };

  if (!data) return <div className="admin-page"><p>Loading...</p></div>;

  const cards = [
    { label: 'Consultations', count: data.stats.consultations, to: '/admin/consultations', color: '#2a3139' },
    { label: 'Contacts', count: data.stats.contacts, to: '/admin/contacts', color: '#2563eb' },
    { label: 'Services', count: data.stats.services, to: '/admin/services', color: '#7c3aed' },
    { label: 'Insights', count: data.stats.insights, to: '/admin/insights', color: '#b45309' },
    { label: 'Case Studies', count: data.stats.caseStudies, to: '/admin/case-studies', color: '#059669' },
    { label: 'Industries', count: data.stats.industries, to: '/admin/industries', color: '#dc2626' },
  ];

  return (
    <div className="admin-page">
      <h1 className="admin-title">Dashboard</h1>
      <div className="admin-stats">
        {cards.map(c => (
          <Link key={c.label} to={c.to} className="admin-stat-card">
            <div className="admin-stat-value" style={{ color: c.color }}>{c.count}</div>
            <div className="admin-stat-label">{c.label}</div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 32 }}>
        <div>
          <h2 className="admin-subtitle">Recent Consultations</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Service</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {data.recentConsultations.map(c => (
                  <tr key={c.id} onClick={() => openItem(c, 'consultation')} style={{ cursor: 'pointer' }}>
                    <td><strong>{c.name}</strong></td>
                    <td><span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: 12, fontSize: 12 }}>{c.service_interest || '-'}</span></td>
                    <td><span className={`admin-badge admin-badge-${c.status}`}>{c.status}</span></td>
                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {data.recentConsultations.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: 20 }}>No consultations yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="admin-subtitle">Recent Contacts</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Subject</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {data.recentContacts.map(c => (
                  <tr key={c.id} onClick={() => openItem(c, 'contact')} style={{ cursor: 'pointer' }}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.subject || '-'}</td>
                    <td><span className={`admin-badge admin-badge-${c.status}`}>{c.status}</span></td>
                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {data.recentContacts.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: 20 }}>No contacts yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AdminModal open={!!selected} onClose={() => setSelected(null)} title={`${selectedType === 'consultation' ? 'Consultation' : 'Contact'} — ${selected?.name}`}>
        {selected && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div><span style={{ fontSize: 12, color: '#64748b' }}>Email</span><div><a href={`mailto:${selected.email}`} style={{ color: '#2a3139', fontWeight: 500 }}>{selected.email}</a></div></div>
              <div><span style={{ fontSize: 12, color: '#64748b' }}>Phone</span><div style={{ fontWeight: 500 }}>{selected.phone || '-'}</div></div>
              <div><span style={{ fontSize: 12, color: '#64748b' }}>Company</span><div style={{ fontWeight: 500 }}>{selected.company || '-'}</div></div>
              {selectedType === 'consultation' && (
                <div><span style={{ fontSize: 12, color: '#64748b' }}>Service Interest</span><div><span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: 12, fontSize: 13 }}>{selected.service_interest || '-'}</span></div></div>
              )}
              {selectedType === 'contact' && (
                <div><span style={{ fontSize: 12, color: '#64748b' }}>Subject</span><div style={{ fontWeight: 500 }}>{selected.subject || '-'}</div></div>
              )}
              {selectedType === 'consultation' && selected.preferred_date && (
                <div><span style={{ fontSize: 12, color: '#64748b' }}>Preferred Date</span><div style={{ fontWeight: 500 }}>{new Date(selected.preferred_date).toLocaleDateString()}</div></div>
              )}
              {selectedType === 'consultation' && selected.preferred_time && (
                <div><span style={{ fontSize: 12, color: '#64748b' }}>Preferred Time</span><div style={{ fontWeight: 500 }}>{selected.preferred_time}</div></div>
              )}
            </div>
            <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, marginBottom: 20 }}>
              <strong>Message</strong>
              <p style={{ marginTop: 8, color: '#475569', lineHeight: 1.7 }}>{selected.message || 'No message provided.'}</p>
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>AI-Generated Reply</h3>
                <button className="btn btn-primary" style={{ padding: '6px 16px', fontSize: 13 }} onClick={generateReply} disabled={aiLoading}>{aiLoading ? 'Generating...' : 'Generate Reply'}</button>
              </div>
              {aiReply ? (
                <div style={{ padding: 16, background: '#f7f7f7', borderRadius: 8, border: '1px solid #99f6e4' }}>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'DM Sans, sans-serif', fontSize: 14, lineHeight: 1.7, color: '#334155', margin: 0 }}>{aiReply}</pre>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => copyToClipboard(aiReply)}>Copy to Clipboard</button>
                    <a href={`mailto:${selected.email}?subject=Re: ${selectedType === 'consultation' ? 'Consultation Request' : (selected.subject || 'Your inquiry')} - Akarsu Advisory&body=${encodeURIComponent(aiReply)}`} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 12, textDecoration: 'none' }}>Send via Email</a>
                  </div>
                </div>
              ) : (
                <div style={{ padding: 24, background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1', textAlign: 'center', color: '#94a3b8' }}>Click "Generate Reply" to create an AI-powered response.</div>
              )}
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
