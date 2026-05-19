import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AdminGenerateProposal() {
  const { api } = useAuth();
  const [form, setForm] = useState({
    client_name: '',
    company: '',
    industry: '',
    challenge: '',
    objectives: '',
    scope: '',
    duration: '',
    budget_range: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const loadSample = () => setForm({
    client_name: 'Sarah Chen',
    company: 'Brightside Retail',
    industry: 'Specialty Retail',
    challenge: 'Profitable on paper but always running out of cash mid-month across 3 retail stores ($2M revenue).',
    objectives: 'Build a 13-week cash flow forecast; identify working capital sinks; recommend financing alternatives.',
    scope: 'Cash flow analysis; working capital review; financing options memo; CFO advisory monthly retainer (3 months).',
    duration: '3 months',
    budget_range: '$15,000 - $25,000',
  });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await api('/api/ai/generate-proposal', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setResult(data);
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontFamily: 'DM Sans, sans-serif', outline: 'none', width: '100%' };
  const textareaStyle = { ...inputStyle, resize: 'vertical' };
  const sampleBtnStyle = { padding: '5px 12px', fontSize: 12, background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', borderRadius: 6, cursor: 'pointer', fontWeight: 500, fontFamily: 'DM Sans, sans-serif' };

  return (
    <div className="admin-page">
      <h1 className="admin-title">AI Proposal Generator</h1>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', margin: 0 }}>Generate Consulting Proposal</h2>
          <button style={sampleBtnStyle} onClick={loadSample}>Load Sample</button>
        </div>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>Draft a structured consulting proposal in markdown.</p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input placeholder="Client Name" value={form.client_name} onChange={set('client_name')} style={inputStyle} />
            <input placeholder="Company" value={form.company} onChange={set('company')} style={inputStyle} />
          </div>
          <input placeholder="Industry" value={form.industry} onChange={set('industry')} style={inputStyle} />
          <textarea placeholder="Client challenge / problem statement *" rows={3} value={form.challenge} onChange={set('challenge')} required style={textareaStyle} />
          <textarea placeholder="Objectives" rows={3} value={form.objectives} onChange={set('objectives')} style={textareaStyle} />
          <textarea placeholder="Scope of work" rows={3} value={form.scope} onChange={set('scope')} style={textareaStyle} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input placeholder="Duration (e.g. 3 months)" value={form.duration} onChange={set('duration')} style={inputStyle} />
            <input placeholder="Budget Range" value={form.budget_range} onChange={set('budget_range')} style={inputStyle} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Generating…' : 'Generate Proposal'}</button>
        </form>

        {loading && (
          <div style={{ marginTop: 20, padding: 24, background: '#f8fafc', borderRadius: 8, textAlign: 'center', color: '#64748b' }}>
            AI is drafting your proposal…
          </div>
        )}

        {error && (
          <div style={{ marginTop: 20, padding: 16, background: '#fef2f2', borderRadius: 8, color: '#dc2626' }}>{error}</div>
        )}

        {result && (
          <div style={{ marginTop: 20, padding: 20, background: '#f7f7f7', borderRadius: 8, border: '1px solid #99f6e4' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#2a3139', margin: 0, marginBottom: 12 }}>Generated Proposal</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'DM Sans, sans-serif', fontSize: 14, lineHeight: 1.7, color: '#334155', margin: 0 }}>
              {typeof (result.proposal || result.result) === 'string'
                ? (result.proposal || result.result)
                : JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
