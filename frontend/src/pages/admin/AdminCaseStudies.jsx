import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminModal from '../../components/AdminModal';

export default function AdminCaseStudies() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', slug: '', industry: '', challenge: '', approach: '', result: '', published: true });
  const [showForm, setShowForm] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const load = () => api('/api/admin/case-studies').then(r => r.json()).then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    await api(editing ? `/api/admin/case-studies/${editing}` : '/api/admin/case-studies', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(form) });
    setEditing(null); setShowForm(false); setForm({ title: '', slug: '', industry: '', challenge: '', approach: '', result: '', published: true }); load();
  };

  const del = async (id) => { if (confirm('Delete?')) { await api(`/api/admin/case-studies/${id}`, { method: 'DELETE' }); setSelected(null); load(); } };
  const edit = (i) => { setEditing(i.id); setSelected(null); setShowForm(true); setForm({ title: i.title, slug: i.slug, industry: i.industry || '', challenge: i.challenge || '', approach: i.approach || '', result: i.result || '', published: i.published }); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const aiEnhance = async (action) => {
    setAiLoading(true); setAiResult(null);
    try {
      const res = await api('/api/admin/ai/enhance-case-study', { method: 'POST', body: JSON.stringify({ title: selected.title, industry: selected.industry, challenge: selected.challenge, approach: selected.approach, result: selected.result, action }) });
      const data = await res.json();
      setAiResult(data);
    } catch { setAiResult({ result: 'Failed to generate.' }); }
    setAiLoading(false);
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); alert('Copied!'); };

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="admin-title" style={{ margin: 0 }}>Case Studies ({items.length})</h1>
        {!showForm && <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add New</button>}
      </div>
      {showForm && <form onSubmit={save} className="admin-form">
        <div className="admin-form-grid">
          <input placeholder="Title" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <input placeholder="Slug" required value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} />
          <input placeholder="Industry" value={form.industry} onChange={e => setForm({...form, industry: e.target.value})} />
        </div>
        <textarea placeholder="Challenge" rows={3} value={form.challenge} onChange={e => setForm({...form, challenge: e.target.value})} />
        <textarea placeholder="Approach" rows={3} value={form.approach} onChange={e => setForm({...form, approach: e.target.value})} />
        <textarea placeholder="Result" rows={3} value={form.result} onChange={e => setForm({...form, result: e.target.value})} />
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <label><input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} /> Published</label>
          <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
          <button type="button" className="btn btn-outline" onClick={() => { setEditing(null); setShowForm(false); setForm({ title: '', slug: '', industry: '', challenge: '', approach: '', result: '', published: true }); }}>Cancel</button>
        </div>
      </form>}
      <div className="admin-table-wrap" style={{ marginTop: 24 }}>
        <table className="admin-table">
          <thead><tr><th>Title</th><th>Industry</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id} onClick={() => { setSelected(i); setAiResult(null); }} style={{ cursor: 'pointer' }}>
                <td><strong>{i.title}</strong></td>
                <td><span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '3px 10px', borderRadius: 12, fontSize: 12 }}>{i.industry}</span></td>
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
      <AdminModal open={!!selected} onClose={() => setSelected(null)} title={selected?.title}>
        {selected && (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '4px 14px', borderRadius: 16, fontSize: 13 }}>{selected.industry}</span>
              <span style={{ background: selected.published ? '#dcfce7' : '#fef3c7', color: selected.published ? '#166534' : '#92400e', padding: '4px 14px', borderRadius: 16, fontSize: 13 }}>{selected.published ? 'Published' : 'Draft'}</span>
            </div>
            <div style={{ padding: 16, background: '#fef2f2', borderRadius: 8, marginBottom: 12, borderLeft: '4px solid #dc2626' }}>
              <strong style={{ color: '#dc2626' }}>Challenge</strong>
              <p style={{ marginTop: 8, color: '#475569', lineHeight: 1.7 }}>{selected.challenge}</p>
            </div>
            <div style={{ padding: 16, background: '#eff6ff', borderRadius: 8, marginBottom: 12, borderLeft: '4px solid #2563eb' }}>
              <strong style={{ color: '#2563eb' }}>Approach</strong>
              <p style={{ marginTop: 8, color: '#475569', lineHeight: 1.7 }}>{selected.approach}</p>
            </div>
            <div style={{ padding: 16, background: '#f7f7f7', borderRadius: 8, marginBottom: 12, borderLeft: '4px solid #059669' }}>
              <strong style={{ color: '#059669' }}>Result</strong>
              <p style={{ marginTop: 8, color: '#475569', lineHeight: 1.7 }}>{selected.result}</p>
            </div>
            {selected.metrics && typeof selected.metrics === 'object' && Object.keys(selected.metrics).length > 0 && (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                {Object.entries(selected.metrics).map(([k, v]) => (
                  <div key={k} style={{ padding: '10px 18px', background: '#f7f7f7', borderRadius: 8, border: '1px solid #99f6e4', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>{k.replace(/_/g, ' ')}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#2a3139' }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20, marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>AI Assistant</h3>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => aiEnhance('improve-challenge')} disabled={aiLoading}>Improve Challenge</button>
                <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => aiEnhance('improve-approach')} disabled={aiLoading}>Improve Approach</button>
                <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => aiEnhance('improve-result')} disabled={aiLoading}>Improve Result</button>
                <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => aiEnhance('full-generate')} disabled={aiLoading}>Full AI Generate</button>
              </div>
              {aiLoading && <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, textAlign: 'center', color: '#64748b' }}>Generating...</div>}
              {aiResult && !aiLoading && (
                <div style={{ padding: 16, background: '#f7f7f7', borderRadius: 8, border: '1px solid #99f6e4' }}>
                  {aiResult.result && <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'DM Sans, sans-serif', fontSize: 14, lineHeight: 1.7, color: '#334155', margin: 0 }}>{aiResult.result}</pre>}
                  {aiResult.challenge && <div style={{ marginBottom: 8 }}><strong>Challenge:</strong> {aiResult.challenge}</div>}
                  {aiResult.approach && <div style={{ marginBottom: 8 }}><strong>Approach:</strong> {aiResult.approach}</div>}
                  {aiResult.result && !aiResult.challenge && ''}
                  {aiResult.result && aiResult.challenge && <div><strong>Result:</strong> {aiResult.result}</div>}
                  <button className="btn btn-outline" style={{ marginTop: 12, padding: '6px 14px', fontSize: 12 }} onClick={() => copyToClipboard(aiResult.result || JSON.stringify(aiResult, null, 2))}>Copy to Clipboard</button>
                </div>
              )}
              {!aiResult && !aiLoading && (
                <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Use AI to improve challenge, approach, or result sections.</div>
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
