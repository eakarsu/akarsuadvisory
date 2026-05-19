import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminModal from '../../components/AdminModal';

const SCORE_STYLES = {
  hot: { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5' },
  warm: { background: '#fffbeb', color: '#b45309', border: '1px solid #fcd34d' },
  cold: { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #93c5fd' },
};

function LeadScoreBadge({ item }) {
  if (!item.lead_score) return null;
  const style = SCORE_STYLES[item.lead_score] || {};
  let reasoning = '';
  try { reasoning = JSON.parse(item.lead_score_reasoning)?.reasoning || ''; } catch (_) {}
  return (
    <span title={reasoning} style={{ ...style, padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', cursor: 'default' }}>
      {item.lead_score}
    </span>
  );
}

export default function AdminConsultations() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [aiReply, setAiReply] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [filter, setFilter] = useState('all');

  const load = () => api('/api/admin/consultations').then(r => r.json()).then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => { await api(`/api/admin/consultations/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }); load(); };
  const del = async (id) => { if (confirm('Delete?')) { await api(`/api/admin/consultations/${id}`, { method: 'DELETE' }); setSelected(null); load(); } };

  const generateReply = async (item) => {
    setAiLoading(true); setAiReply(''); setSendResult(null);
    try {
      const res = await api('/api/admin/ai/reply-consultation', { method: 'POST', body: JSON.stringify({ name: item.name, company: item.company, service_interest: item.service_interest, message: item.message }) });
      const data = await res.json();
      setAiReply(data.reply);
    } catch { setAiReply('Failed to generate reply.'); }
    setAiLoading(false);
  };

  const generateAndSend = async (item) => {
    setSendLoading(true); setSendResult(null); setAiReply('');
    try {
      const res = await api('/api/admin/ai/reply-consultation', {
        method: 'POST',
        body: JSON.stringify({
          name: item.name,
          email: item.email,
          company: item.company,
          service_interest: item.service_interest,
          message: item.message,
          consultation_id: item.id,
          action: 'reply-and-send',
        }),
      });
      const data = await res.json();
      setAiReply(data.reply);
      setSendResult({ ok: data.sent, sent_at: data.sent_at });
      if (data.sent) load(); // refresh list so status reflects update
    } catch { setSendResult({ ok: false, error: 'Failed to generate and send.' }); }
    setSendLoading(false);
  };

  const scoreThisLead = async (item) => {
    try {
      await api('/api/admin/ai/score-lead', {
        method: 'POST',
        body: JSON.stringify({ type: 'consultation', id: item.id, name: item.name, company: item.company, service_interest: item.service_interest, message: item.message }),
      });
      load();
    } catch { alert('Scoring failed.'); }
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); alert('Copied!'); };
  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="admin-title" style={{ margin: 0 }}>Consultations ({items.length})</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'pending', 'contacted', 'scheduled', 'completed'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`btn ${filter === s ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '6px 14px', fontSize: 13, textTransform: 'capitalize' }}>{s} {s !== 'all' && `(${items.filter(i => i.status === s).length})`}</button>
          ))}
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Service</th><th>Date</th><th>Score</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id} onClick={() => { setSelected(i); setAiReply(''); setSendResult(null); }} style={{ cursor: 'pointer' }}>
                <td><strong>{i.name}</strong></td>
                <td>{i.email}</td>
                <td>{i.company || '-'}</td>
                <td><span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: 12, fontSize: 12 }}>{i.service_interest || '-'}</span></td>
                <td>{i.preferred_date ? new Date(i.preferred_date).toLocaleDateString() : '-'}</td>
                <td><LeadScoreBadge item={i} /></td>
                <td>
                  <select value={i.status} onClick={e => e.stopPropagation()} onChange={e => updateStatus(i.id, e.target.value)} className="admin-select-sm">
                    <option value="pending">Pending</option><option value="contacted">Contacted</option><option value="scheduled">Scheduled</option><option value="completed">Completed</option>
                  </select>
                </td>
                <td onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 6 }}>
                  <button className="admin-action" onClick={() => { setSelected(i); setAiReply(''); setSendResult(null); }}>View</button>
                  <button className="admin-action admin-action-danger" onClick={() => del(i.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No consultations found.</td></tr>}
          </tbody>
        </table>
      </div>
      <AdminModal open={!!selected} onClose={() => setSelected(null)} title={`Consultation — ${selected?.name}`}>
        {selected && (
          <div>
            {/* Lead score banner */}
            {selected.lead_score && (() => {
              let parsed = {};
              try { parsed = JSON.parse(selected.lead_score_reasoning) || {}; } catch (_) {}
              return (
                <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, ...SCORE_STYLES[selected.lead_score] }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, textTransform: 'uppercase' }}>{selected.lead_score} Lead</span>
                    {parsed.confidence && <span style={{ fontSize: 12 }}>({parsed.confidence}% confidence)</span>}
                  </div>
                  {parsed.reasoning && <div style={{ marginTop: 6, fontSize: 13 }}>{parsed.reasoning}</div>}
                  {parsed.signals && <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {parsed.signals.map((s, i) => <span key={i} style={{ background: 'rgba(0,0,0,0.07)', padding: '2px 8px', borderRadius: 8, fontSize: 11 }}>{s}</span>)}
                  </div>}
                </div>
              );
            })()}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div><span style={{ fontSize: 12, color: '#64748b' }}>Email</span><div><a href={`mailto:${selected.email}`} style={{ color: '#2a3139', fontWeight: 500 }}>{selected.email}</a></div></div>
              <div><span style={{ fontSize: 12, color: '#64748b' }}>Phone</span><div style={{ fontWeight: 500 }}>{selected.phone || '-'}</div></div>
              <div><span style={{ fontSize: 12, color: '#64748b' }}>Company</span><div style={{ fontWeight: 500 }}>{selected.company || '-'}</div></div>
              <div><span style={{ fontSize: 12, color: '#64748b' }}>Service Interest</span><div><span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: 12, fontSize: 13 }}>{selected.service_interest || '-'}</span></div></div>
              <div><span style={{ fontSize: 12, color: '#64748b' }}>Preferred Date</span><div style={{ fontWeight: 500 }}>{selected.preferred_date ? new Date(selected.preferred_date).toLocaleDateString() : '-'}</div></div>
              <div><span style={{ fontSize: 12, color: '#64748b' }}>Preferred Time</span><div style={{ fontWeight: 500 }}>{selected.preferred_time || '-'}</div></div>
            </div>
            <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, marginBottom: 20 }}>
              <strong>Message</strong>
              <p style={{ marginTop: 8, color: '#475569', lineHeight: 1.7 }}>{selected.message || 'No message provided.'}</p>
            </div>

            {/* AI Reply Section */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>AI-Generated Reply</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  {!selected.lead_score && (
                    <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 13 }} onClick={() => scoreThisLead(selected)}>Score Lead</button>
                  )}
                  <button className="btn btn-outline" style={{ padding: '6px 16px', fontSize: 13 }} onClick={() => generateReply(selected)} disabled={aiLoading || sendLoading}>
                    {aiLoading ? 'Generating...' : 'Generate Reply'}
                  </button>
                  <button className="btn btn-primary" style={{ padding: '6px 16px', fontSize: 13 }} onClick={() => generateAndSend(selected)} disabled={aiLoading || sendLoading}>
                    {sendLoading ? 'Sending...' : 'Generate & Send'}
                  </button>
                </div>
              </div>

              {sendResult && (
                <div style={{ padding: 10, borderRadius: 8, marginBottom: 12, background: sendResult.ok ? '#dcfce7' : '#fef2f2', color: sendResult.ok ? '#166534' : '#b91c1c', fontSize: 13 }}>
                  {sendResult.ok ? `Email sent successfully at ${new Date(sendResult.sent_at).toLocaleString()}` : (sendResult.error || 'Send failed.')}
                </div>
              )}

              {aiReply ? (
                <div style={{ padding: 16, background: '#f7f7f7', borderRadius: 8, border: '1px solid #99f6e4' }}>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'DM Sans, sans-serif', fontSize: 14, lineHeight: 1.7, color: '#334155', margin: 0 }}>{aiReply}</pre>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => copyToClipboard(aiReply)}>Copy to Clipboard</button>
                    <a href={`mailto:${selected.email}?subject=Re: Consultation Request - Akarsu Advisory&body=${encodeURIComponent(aiReply)}`} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 12, textDecoration: 'none' }}>Open in Email Client</a>
                  </div>
                </div>
              ) : (
                <div style={{ padding: 24, background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1', textAlign: 'center', color: '#94a3b8' }}>
                  Click "Generate Reply" to preview, or "Generate &amp; Send" to generate and send the email in one click.
                </div>
              )}
            </div>

            <div style={{ marginTop: 20, display: 'flex', gap: 8, borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
              <button className="btn btn-outline" style={{ color: '#dc2626', borderColor: '#dc2626' }} onClick={() => del(selected.id)}>Delete</button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
