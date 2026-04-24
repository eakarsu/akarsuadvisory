import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminModal from '../../components/AdminModal';

export default function AdminIndustries() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', challenges: '', approach: '', published: true });
  const [showForm, setShowForm] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const load = () => api('/api/admin/industries').then(r => r.json()).then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    await api(editing ? `/api/admin/industries/${editing}` : '/api/admin/industries', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(form) });
    setEditing(null); setShowForm(false); setForm({ name: '', slug: '', description: '', challenges: '', approach: '', published: true }); load();
  };

  const del = async (id) => { if (confirm('Delete?')) { await api(`/api/admin/industries/${id}`, { method: 'DELETE' }); setSelected(null); load(); } };
  const edit = (i) => { setEditing(i.id); setSelected(null); setShowForm(true); setForm({ name: i.name, slug: i.slug, description: i.description || '', challenges: i.challenges || '', approach: i.approach || '', published: i.published }); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const aiEnhance = async (action) => {
    setAiLoading(true); setAiResult(null);
    try {
      const res = await api('/api/admin/ai/enhance-industry', { method: 'POST', body: JSON.stringify({ name: selected.name, description: selected.description, challenges: selected.challenges, approach: selected.approach, action }) });
      const data = await res.json();
      setAiResult(data);
    } catch { setAiResult({ result: 'Failed to generate.' }); }
    setAiLoading(false);
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); alert('Copied!'); };

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="admin-title" style={{ margin: 0 }}>Industries ({items.length})</h1>
        {!showForm && <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add New</button>}
      </div>
      {showForm && <form onSubmit={save} className="admin-form">
        <div className="admin-form-grid">
          <input placeholder="Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input placeholder="Slug" required value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} />
        </div>
        <textarea placeholder="Description" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        <textarea placeholder="Challenges" rows={2} value={form.challenges} onChange={e => setForm({...form, challenges: e.target.value})} />
        <textarea placeholder="Approach" rows={2} value={form.approach} onChange={e => setForm({...form, approach: e.target.value})} />
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <label><input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} /> Published</label>
          <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
          <button type="button" className="btn btn-outline" onClick={() => { setEditing(null); setShowForm(false); setForm({ name: '', slug: '', description: '', challenges: '', approach: '', published: true }); }}>Cancel</button>
        </div>
      </form>}
      <div className="admin-table-wrap" style={{ marginTop: 24 }}>
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id} onClick={() => { setSelected(i); setAiResult(null); }} style={{ cursor: 'pointer' }}>
                <td><strong>{i.name}</strong></td>
                <td>{i.description?.slice(0, 80)}...</td>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div><span style={{ fontSize: 12, color: '#64748b' }}>Slug</span><div style={{ fontWeight: 500 }}>/industries/{selected.slug}</div></div>
              <div><span style={{ fontSize: 12, color: '#64748b' }}>Created</span><div style={{ fontWeight: 500 }}>{new Date(selected.created_at).toLocaleString()}</div></div>
            </div>
            <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, marginBottom: 12 }}>
              <strong>Description</strong>
              <p style={{ marginTop: 8, color: '#475569', lineHeight: 1.7 }}>{selected.description}</p>
            </div>
            <div style={{ padding: 16, background: '#fef2f2', borderRadius: 8, marginBottom: 12 }}>
              <strong style={{ color: '#dc2626' }}>Challenges</strong>
              <p style={{ marginTop: 8, color: '#475569', lineHeight: 1.7 }}>{selected.challenges}</p>
            </div>
            <div style={{ padding: 16, background: '#f7f7f7', borderRadius: 8, marginBottom: 12 }}>
              <strong style={{ color: '#2a3139' }}>Our Approach</strong>
              <p style={{ marginTop: 8, color: '#475569', lineHeight: 1.7 }}>{selected.approach}</p>
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20, marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>AI Assistant</h3>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => aiEnhance('improve-description')} disabled={aiLoading}>Improve Description</button>
                <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => aiEnhance('generate-challenges')} disabled={aiLoading}>Generate Challenges</button>
                <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => aiEnhance('generate-approach')} disabled={aiLoading}>Generate Approach</button>
                <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => aiEnhance('full-generate')} disabled={aiLoading}>Full AI Generate</button>
              </div>
              {aiLoading && <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, textAlign: 'center', color: '#64748b' }}>Generating...</div>}
              {aiResult && !aiLoading && (
                <div style={{ padding: 16, background: '#f7f7f7', borderRadius: 8, border: '1px solid #99f6e4' }}>
                  {aiResult.result && <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'DM Sans, sans-serif', fontSize: 14, lineHeight: 1.7, color: '#334155', margin: 0 }}>{aiResult.result}</pre>}
                  {aiResult.description && <div style={{ marginBottom: 8 }}><strong>Description:</strong> {aiResult.description}</div>}
                  {aiResult.challenges && <div style={{ marginBottom: 8 }}><strong>Challenges:</strong> {aiResult.challenges}</div>}
                  {aiResult.approach && <div><strong>Approach:</strong> {aiResult.approach}</div>}
                  <button className="btn btn-outline" style={{ marginTop: 12, padding: '6px 14px', fontSize: 12 }} onClick={() => copyToClipboard(aiResult.result || JSON.stringify(aiResult, null, 2))}>Copy to Clipboard</button>
                </div>
              )}
              {!aiResult && !aiLoading && (
                <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Use AI to generate challenges, approach strategies, or improve descriptions.</div>
              )}
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 8, borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
              <button className="btn btn-primary" onClick={() => edit(selected)}>Edit Industry</button>
              <button className="btn btn-outline" style={{ color: '#dc2626', borderColor: '#dc2626' }} onClick={() => del(selected.id)}>Delete</button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
