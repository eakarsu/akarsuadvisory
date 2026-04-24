import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminModal from '../../components/AdminModal';

export default function AdminTestimonials() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', title: '', company: '', quote: '', rating: 5, published: true });
  const [showForm, setShowForm] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const load = () => api('/api/admin/testimonials').then(r => r.json()).then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    await api(editing ? `/api/admin/testimonials/${editing}` : '/api/admin/testimonials', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(form) });
    setEditing(null); setShowForm(false); setForm({ name: '', title: '', company: '', quote: '', rating: 5, published: true }); load();
  };

  const del = async (id) => { if (confirm('Delete?')) { await api(`/api/admin/testimonials/${id}`, { method: 'DELETE' }); setSelected(null); load(); } };
  const edit = (i) => { setEditing(i.id); setSelected(null); setShowForm(true); setForm({ name: i.name, title: i.title || '', company: i.company || '', quote: i.quote, rating: i.rating || 5, published: i.published }); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const aiEnhance = async (action) => {
    setAiLoading(true); setAiResult(null);
    try {
      const res = await api('/api/admin/ai/enhance-testimonial', { method: 'POST', body: JSON.stringify({ name: selected.name, title: selected.title, company: selected.company, quote: selected.quote, action }) });
      const data = await res.json();
      setAiResult(data);
    } catch { setAiResult({ result: 'Failed to generate.' }); }
    setAiLoading(false);
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); alert('Copied!'); };

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="admin-title" style={{ margin: 0 }}>Testimonials ({items.length})</h1>
        {!showForm && <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add New</button>}
      </div>
      {showForm && <form onSubmit={save} className="admin-form">
        <div className="admin-form-grid">
          <input placeholder="Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <input placeholder="Company" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
          <input placeholder="Rating (1-5)" type="number" min={1} max={5} value={form.rating} onChange={e => setForm({...form, rating: parseInt(e.target.value) || 5})} />
        </div>
        <textarea placeholder="Quote" rows={3} required value={form.quote} onChange={e => setForm({...form, quote: e.target.value})} />
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <label><input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} /> Published</label>
          <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
          <button type="button" className="btn btn-outline" onClick={() => { setEditing(null); setShowForm(false); setForm({ name: '', title: '', company: '', quote: '', rating: 5, published: true }); }}>Cancel</button>
        </div>
      </form>}
      <div className="admin-table-wrap" style={{ marginTop: 24 }}>
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Company</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id} onClick={() => { setSelected(i); setAiResult(null); }} style={{ cursor: 'pointer' }}>
                <td><strong>{i.name}</strong><br /><span style={{ fontSize: 12, color: '#64748b' }}>{i.title}</span></td>
                <td>{i.company}</td>
                <td style={{ color: '#f59e0b' }}>{'★'.repeat(i.rating || 5)}{'☆'.repeat(5 - (i.rating || 5))}</td>
                <td><span style={{ background: i.published ? '#dcfce7' : '#fef3c7', color: i.published ? '#166534' : '#92400e', padding: '3px 10px', borderRadius: 12, fontSize: 12 }}>{i.published ? 'Published' : 'Draft'}</span></td>
                <td onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 6 }}>
                  <button className="admin-action" onClick={() => setSelected(i)}>View</button>
                  <button className="admin-action" onClick={() => edit(i)}>Edit</button>
                  <button className="admin-action admin-action-danger" onClick={() => del(i.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AdminModal open={!!selected} onClose={() => setSelected(null)} title="Testimonial">
        {selected && (
          <div>
            <div style={{ padding: 24, background: '#f8fafc', borderRadius: 12, borderLeft: '4px solid #2a3139', marginBottom: 20 }}>
              <p style={{ fontSize: 18, lineHeight: 1.8, color: '#334155', fontStyle: 'italic', margin: 0 }}>"{selected.quote}"</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 28, background: '#2a3139', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22 }}>{selected.name[0]}</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{selected.name}</div>
                <div style={{ color: '#64748b' }}>{selected.title}{selected.company ? `, ${selected.company}` : ''}</div>
                <div style={{ color: '#f59e0b', fontSize: 18, marginTop: 4 }}>{'★'.repeat(selected.rating || 5)}{'☆'.repeat(5 - (selected.rating || 5))}</div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20, marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>AI Assistant</h3>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => aiEnhance('polish-quote')} disabled={aiLoading}>Polish Quote</button>
                <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => aiEnhance('generate-quote')} disabled={aiLoading}>Generate New Quote</button>
              </div>
              {aiLoading && <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, textAlign: 'center', color: '#64748b' }}>Generating...</div>}
              {aiResult && !aiLoading && (
                <div style={{ padding: 16, background: '#f7f7f7', borderRadius: 8, border: '1px solid #99f6e4' }}>
                  <p style={{ fontStyle: 'italic', fontSize: 15, lineHeight: 1.7, color: '#334155', margin: 0 }}>"{aiResult.result}"</p>
                  <button className="btn btn-outline" style={{ marginTop: 12, padding: '6px 14px', fontSize: 12 }} onClick={() => copyToClipboard(aiResult.result)}>Copy to Clipboard</button>
                </div>
              )}
              {!aiResult && !aiLoading && (
                <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Use AI to polish existing quotes or generate new testimonials.</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #e2e8f0', paddingTop: 20, marginTop: 20 }}>
              <button className="btn btn-primary" onClick={() => edit(selected)}>Edit</button>
              <button className="btn btn-outline" style={{ color: '#dc2626', borderColor: '#dc2626' }} onClick={() => del(selected.id)}>Delete</button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
