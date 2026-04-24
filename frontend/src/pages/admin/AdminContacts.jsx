import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminModal from '../../components/AdminModal';

export default function AdminContacts() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [aiReply, setAiReply] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = () => api('/api/admin/contacts').then(r => r.json()).then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => { await api(`/api/admin/contacts/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }); load(); };
  const del = async (id) => { if (confirm('Delete?')) { await api(`/api/admin/contacts/${id}`, { method: 'DELETE' }); setSelected(null); load(); } };

  const generateReply = async (item) => {
    setAiLoading(true); setAiReply('');
    try {
      const res = await api('/api/admin/ai/reply-contact', { method: 'POST', body: JSON.stringify({ name: item.name, company: item.company, subject: item.subject, message: item.message }) });
      const data = await res.json();
      setAiReply(data.reply);
    } catch { setAiReply('Failed to generate reply.'); }
    setAiLoading(false);
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); alert('Copied!'); };
  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="admin-title" style={{ margin: 0 }}>Contact Submissions ({items.length})</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'new', 'read', 'replied', 'archived'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`btn ${filter === s ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '6px 14px', fontSize: 13, textTransform: 'capitalize' }}>{s} {s !== 'all' && `(${items.filter(i => i.status === s).length})`}</button>
          ))}
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Subject</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id} onClick={() => { setSelected(i); setAiReply(''); }} style={{ cursor: 'pointer' }}>
                <td><strong>{i.name}</strong></td>
                <td>{i.email}</td>
                <td>{i.company || '-'}</td>
                <td>{i.subject || '-'}</td>
                <td>{new Date(i.created_at).toLocaleDateString()}</td>
                <td>
                  <select value={i.status} onClick={e => e.stopPropagation()} onChange={e => updateStatus(i.id, e.target.value)} className="admin-select-sm">
                    <option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option><option value="archived">Archived</option>
                  </select>
                </td>
                <td onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 6 }}>
                  <button className="admin-action" onClick={() => { setSelected(i); setAiReply(''); }}>View</button>
                  <button className="admin-action admin-action-danger" onClick={() => del(i.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No contacts found.</td></tr>}
          </tbody>
        </table>
      </div>
      <AdminModal open={!!selected} onClose={() => setSelected(null)} title={`Contact — ${selected?.name}`}>
        {selected && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div><span style={{ fontSize: 12, color: '#64748b' }}>Email</span><div><a href={`mailto:${selected.email}`} style={{ color: '#2a3139', fontWeight: 500 }}>{selected.email}</a></div></div>
              <div><span style={{ fontSize: 12, color: '#64748b' }}>Phone</span><div style={{ fontWeight: 500 }}>{selected.phone || '-'}</div></div>
              <div><span style={{ fontSize: 12, color: '#64748b' }}>Company</span><div style={{ fontWeight: 500 }}>{selected.company || '-'}</div></div>
              <div><span style={{ fontSize: 12, color: '#64748b' }}>Subject</span><div style={{ fontWeight: 500 }}>{selected.subject || '-'}</div></div>
            </div>
            <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, marginBottom: 20 }}>
              <strong>Message</strong>
              <p style={{ marginTop: 8, color: '#475569', lineHeight: 1.7 }}>{selected.message || 'No message provided.'}</p>
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>AI-Generated Reply</h3>
                <button className="btn btn-primary" style={{ padding: '6px 16px', fontSize: 13 }} onClick={() => generateReply(selected)} disabled={aiLoading}>{aiLoading ? 'Generating...' : 'Generate Reply'}</button>
              </div>
              {aiReply ? (
                <div style={{ padding: 16, background: '#f7f7f7', borderRadius: 8, border: '1px solid #99f6e4' }}>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'DM Sans, sans-serif', fontSize: 14, lineHeight: 1.7, color: '#334155', margin: 0 }}>{aiReply}</pre>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => copyToClipboard(aiReply)}>Copy to Clipboard</button>
                    <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || 'Your inquiry'} - Akarsu Advisory&body=${encodeURIComponent(aiReply)}`} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 12, textDecoration: 'none' }}>Send via Email</a>
                  </div>
                </div>
              ) : (
                <div style={{ padding: 24, background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1', textAlign: 'center', color: '#94a3b8' }}>Click "Generate Reply" to create an AI-powered response.</div>
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
