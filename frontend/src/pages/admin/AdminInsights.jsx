import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminModal from '../../components/AdminModal';

export default function AdminInsights() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', slug: '', summary: '', content: '', category: '', domain: '', published: false, featured: false });
  const [showForm, setShowForm] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const load = () => api('/api/admin/insights').then(r => r.json()).then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    await api(editing ? `/api/admin/insights/${editing}` : '/api/admin/insights', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(form) });
    setEditing(null); setShowForm(false); setForm({ title: '', slug: '', summary: '', content: '', category: '', domain: '', published: false, featured: false }); load();
  };

  const del = async (id) => { if (!confirm('Delete?')) return; await api(`/api/admin/insights/${id}`, { method: 'DELETE' }); setSelected(null); load(); };
  const edit = (i) => { setEditing(i.id); setSelected(null); setShowForm(true); setForm({ title: i.title, slug: i.slug, summary: i.summary || '', content: i.content || '', category: i.category || '', domain: i.domain || '', published: i.published, featured: i.featured }); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const generateWithAI = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    try {
      const res = await api('/api/admin/ai/generate-insight', { method: 'POST', body: JSON.stringify({ topic: aiTopic, category: form.category || 'Financial Literacy' }) });
      const data = await res.json();
      setForm({ ...form, title: data.title || aiTopic, slug: data.slug || aiTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-'), summary: data.summary || '', content: data.content || '', published: false, featured: false });
      setAiTopic('');
    } catch { alert('Failed to generate article.'); }
    setAiLoading(false);
  };

  const aiEnhance = async (action) => {
    setAiLoading(true); setAiResult(null);
    try {
      const res = await api('/api/admin/ai/enhance-insight', { method: 'POST', body: JSON.stringify({ title: selected.title, summary: selected.summary, content: selected.content, action }) });
      const data = await res.json();
      setAiResult(data);
    } catch { setAiResult({ result: 'Failed to generate.' }); }
    setAiLoading(false);
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); alert('Copied!'); };

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="admin-title" style={{ margin: 0 }}>Insights ({items.length})</h1>
        {!showForm && <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add New</button>}
      </div>
      {showForm && <>
      <div style={{ marginBottom: 20, padding: 16, background: '#f7f7f7', borderRadius: 8, border: '1px solid #99f6e4' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#2a3139' }}>AI Article Generator</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Enter a topic (e.g. 'How to manage inventory costs for restaurants')" value={aiTopic} onChange={e => setAiTopic(e.target.value)} style={{ flex: 1, padding: '8px 14px', border: '1px solid #e2e8f0', borderRadius: 6 }} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), generateWithAI())} />
          <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: 13 }} onClick={generateWithAI} disabled={aiLoading}>{aiLoading ? 'Generating...' : 'Generate Article'}</button>
        </div>
      </div>
      <form onSubmit={save} className="admin-form">
        <div className="admin-form-grid">
          <input placeholder="Title" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <input placeholder="Slug" required value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} />
          <input placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
          <input placeholder="Domain" value={form.domain} onChange={e => setForm({...form, domain: e.target.value})} />
        </div>
        <textarea placeholder="Summary" rows={2} value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} />
        <textarea placeholder="Content (Markdown)" rows={6} value={form.content} onChange={e => setForm({...form, content: e.target.value})} />
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <label><input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} /> Published</label>
          <label><input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} /> Featured</label>
          <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
          <button type="button" className="btn btn-outline" onClick={() => { setEditing(null); setShowForm(false); setForm({ title: '', slug: '', summary: '', content: '', category: '', domain: '', published: false, featured: false }); }}>Cancel</button>
        </div>
      </form>
      </>}
      <div className="admin-table-wrap" style={{ marginTop: 24 }}>
        <table className="admin-table">
          <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id} onClick={() => { setSelected(i); setAiResult(null); }} style={{ cursor: 'pointer' }}>
                <td><strong>{i.title}</strong></td>
                <td><span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: 12, fontSize: 12 }}>{i.category}</span></td>
                <td>
                  <span style={{ background: i.published ? '#dcfce7' : '#fef3c7', color: i.published ? '#166534' : '#92400e', padding: '3px 10px', borderRadius: 12, fontSize: 12, marginRight: 6 }}>{i.published ? 'Published' : 'Draft'}</span>
                  {i.featured && <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 10px', borderRadius: 12, fontSize: 12 }}>Featured</span>}
                </td>
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
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 14px', borderRadius: 16, fontSize: 13 }}>{selected.category}</span>
              <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '4px 14px', borderRadius: 16, fontSize: 13 }}>{selected.domain}</span>
              {selected.featured && <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 14px', borderRadius: 16, fontSize: 13 }}>Featured</span>}
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
              By {selected.author} | {new Date(selected.created_at).toLocaleString()}
            </div>
            <div style={{ padding: 16, background: '#f7f7f7', borderRadius: 8, marginBottom: 16 }}>
              <strong>Summary</strong>
              <p style={{ marginTop: 8, color: '#334155', lineHeight: 1.7 }}>{selected.summary}</p>
            </div>
            <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, marginBottom: 16 }}>
              <strong>Content</strong>
              <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap', fontFamily: 'DM Sans, sans-serif', fontSize: 14, lineHeight: 1.7, color: '#475569', maxHeight: 400, overflow: 'auto' }}>{selected.content}</pre>
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20, marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>AI Assistant</h3>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => aiEnhance('improve-summary')} disabled={aiLoading}>Improve Summary</button>
                <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => aiEnhance('improve-content')} disabled={aiLoading}>Improve Content</button>
                <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => aiEnhance('generate-seo')} disabled={aiLoading}>Generate SEO</button>
              </div>
              {aiLoading && <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, textAlign: 'center', color: '#64748b' }}>Generating...</div>}
              {aiResult && !aiLoading && (
                <div style={{ padding: 16, background: '#f7f7f7', borderRadius: 8, border: '1px solid #99f6e4' }}>
                  {aiResult.result && <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'DM Sans, sans-serif', fontSize: 14, lineHeight: 1.7, color: '#334155', margin: 0 }}>{aiResult.result}</pre>}
                  {aiResult.meta_description && <div style={{ marginBottom: 8 }}><strong>Meta Description:</strong> {aiResult.meta_description}</div>}
                  {aiResult.keywords && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}><strong style={{ marginRight: 4 }}>Keywords:</strong> {aiResult.keywords.map((k, i) => <span key={i} style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 10px', borderRadius: 12, fontSize: 12 }}>{k}</span>)}</div>}
                  <button className="btn btn-outline" style={{ marginTop: 12, padding: '6px 14px', fontSize: 12 }} onClick={() => copyToClipboard(aiResult.result || aiResult.meta_description || JSON.stringify(aiResult, null, 2))}>Copy to Clipboard</button>
                </div>
              )}
              {!aiResult && !aiLoading && (
                <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Use AI to improve summaries, enhance content, or generate SEO metadata.</div>
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
