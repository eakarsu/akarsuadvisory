import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminModal from '../../components/AdminModal';

export default function AdminServices() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', tagline: '', description: '', features: '', sort_order: 0, published: true });
  const [showForm, setShowForm] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const load = () => api('/api/admin/services').then(r => r.json()).then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    const body = { ...form, features: form.features.split(',').map(f => f.trim()).filter(Boolean) };
    await api(editing ? `/api/admin/services/${editing}` : '/api/admin/services', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(body) });
    setEditing(null); setShowForm(false); setForm({ name: '', slug: '', tagline: '', description: '', features: '', sort_order: 0, published: true }); load();
  };

  const del = async (id) => {
    if (confirm('Delete this service?')) { await api(`/api/admin/services/${id}`, { method: 'DELETE' }); setSelected(null); load(); }
  };

  const edit = (i) => {
    const feats = Array.isArray(i.features) ? i.features.join(', ') : '';
    setEditing(i.id); setSelected(null); setShowForm(true);
    setForm({ name: i.name, slug: i.slug, tagline: i.tagline || '', description: i.description || '', features: feats, sort_order: i.sort_order || 0, published: i.published });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const aiEnhance = async (action) => {
    setAiLoading(true); setAiResult(null);
    try {
      const res = await api('/api/admin/ai/enhance-service', { method: 'POST', body: JSON.stringify({ name: selected.name, tagline: selected.tagline, description: selected.description, features: Array.isArray(selected.features) ? selected.features.join(', ') : '', action }) });
      const data = await res.json();
      setAiResult(data);
    } catch { setAiResult({ result: 'Failed to generate.' }); }
    setAiLoading(false);
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); alert('Copied!'); };

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="admin-title" style={{ margin: 0 }}>Services ({items.length})</h1>
        {!showForm && <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add New</button>}
      </div>
      {showForm && <form onSubmit={save} className="admin-form">
        <div className="admin-form-grid">
          <input placeholder="Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input placeholder="Slug" required value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} />
          <input placeholder="Tagline" value={form.tagline} onChange={e => setForm({...form, tagline: e.target.value})} />
          <input placeholder="Sort Order" type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: parseInt(e.target.value) || 0})} />
        </div>
        <textarea placeholder="Description" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        <input placeholder="Features (comma-separated)" value={form.features} onChange={e => setForm({...form, features: e.target.value})} />
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <label><input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} /> Published</label>
          <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
          <button type="button" className="btn btn-outline" onClick={() => { setEditing(null); setShowForm(false); setForm({ name: '', slug: '', tagline: '', description: '', features: '', sort_order: 0, published: true }); }}>Cancel</button>
        </div>
      </form>}
      <div className="admin-table-wrap" style={{ marginTop: 24 }}>
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Tagline</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id} onClick={() => { setSelected(i); setAiResult(null); }} style={{ cursor: 'pointer' }}>
                <td><strong>{i.name}</strong></td>
                <td>{i.tagline}</td>
                <td>{i.sort_order}</td>
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
      <AdminModal open={!!selected} onClose={() => setSelected(null)} title={selected?.name}>
        {selected && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div><span style={{ fontSize: 12, color: '#64748b' }}>Slug</span><div style={{ fontWeight: 500 }}>/services/{selected.slug}</div></div>
              <div><span style={{ fontSize: 12, color: '#64748b' }}>Sort Order</span><div style={{ fontWeight: 500 }}>{selected.sort_order}</div></div>
              <div><span style={{ fontSize: 12, color: '#64748b' }}>Status</span><div><span style={{ background: selected.published ? '#dcfce7' : '#fef3c7', color: selected.published ? '#166534' : '#92400e', padding: '3px 10px', borderRadius: 12, fontSize: 12 }}>{selected.published ? 'Published' : 'Draft'}</span></div></div>
              <div><span style={{ fontSize: 12, color: '#64748b' }}>Created</span><div style={{ fontWeight: 500 }}>{new Date(selected.created_at).toLocaleString()}</div></div>
            </div>
            <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, marginBottom: 16 }}>
              <strong>Description</strong>
              <p style={{ marginTop: 8, color: '#475569', lineHeight: 1.7 }}>{selected.description}</p>
            </div>
            <div>
              <strong>Features</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {(Array.isArray(selected.features) ? selected.features : []).map((f, idx) => (
                  <span key={idx} style={{ background: '#e0f2fe', color: '#0369a1', padding: '5px 14px', borderRadius: 16, fontSize: 13 }}>{f}</span>
                ))}
              </div>
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20, marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>AI Assistant</h3>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => aiEnhance('improve-description')} disabled={aiLoading}>Improve Description</button>
                <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => aiEnhance('generate-tagline')} disabled={aiLoading}>Generate Tagline</button>
                <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => aiEnhance('suggest-features')} disabled={aiLoading}>Suggest Features</button>
                <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => aiEnhance('full-generate')} disabled={aiLoading}>Full AI Generate</button>
              </div>
              {aiLoading && <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, textAlign: 'center', color: '#64748b' }}>Generating...</div>}
              {aiResult && !aiLoading && (
                <div style={{ padding: 16, background: '#edf2f7', borderRadius: 8, border: '1px solid #99f6e4' }}>
                  {aiResult.result && <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'DM Sans, sans-serif', fontSize: 14, lineHeight: 1.7, color: '#334155', margin: 0 }}>{aiResult.result}</pre>}
                  {aiResult.tagline && <div style={{ marginBottom: 8 }}><strong>Tagline:</strong> {aiResult.tagline}</div>}
                  {aiResult.description && <div style={{ marginBottom: 8 }}><strong>Description:</strong> {aiResult.description}</div>}
                  {aiResult.features && <div><strong>Features:</strong> {aiResult.features}</div>}
                  <button className="btn btn-outline" style={{ marginTop: 12, padding: '6px 14px', fontSize: 12 }} onClick={() => copyToClipboard(aiResult.result || JSON.stringify(aiResult, null, 2))}>Copy to Clipboard</button>
                </div>
              )}
              {!aiResult && !aiLoading && (
                <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Use AI to improve descriptions, generate taglines, or suggest features.</div>
              )}
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 8, borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
              <button className="btn btn-primary" onClick={() => edit(selected)}>Edit Service</button>
              <button className="btn btn-outline" style={{ color: '#dc2626', borderColor: '#dc2626' }} onClick={() => del(selected.id)}>Delete Service</button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
