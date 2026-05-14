import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AdminPredictEngagement() {
  const { api } = useAuth();
  const [form, setForm] = useState({
    client_name: '',
    company: '',
    industry: '',
    last_engagement: '',
    interaction_summary: '',
    open_opportunities: '',
    sentiment_signals: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const loadSample = () => setForm({
    client_name: 'Mike Johnson',
    company: 'Johnson Construction LLC',
    industry: 'Construction',
    last_engagement: 'Q3 2025: job costing setup, 8 weeks',
    interaction_summary: '3 follow-ups since close; opened all 4 monthly insight emails; replied positively to forecast offer.',
    open_opportunities: 'Year-end tax planning; quarterly forecasting retainer.',
    sentiment_signals: 'Mentioned "we should do this every quarter" in last call.',
  });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await api('/api/ai/predict-engagement', {
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

  const probability = result?.probability ?? result?.score;

  return (
    <div className="admin-page">
      <h1 className="admin-title">AI Engagement Predictor</h1>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', margin: 0 }}>Predict Follow-On Engagement</h2>
          <button style={sampleBtnStyle} onClick={loadSample}>Load Sample</button>
        </div>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>Predicted probability of follow-on engagement with reasons + recommended actions.</p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input placeholder="Client Name" value={form.client_name} onChange={set('client_name')} style={inputStyle} />
            <input placeholder="Company" value={form.company} onChange={set('company')} style={inputStyle} />
          </div>
          <input placeholder="Industry" value={form.industry} onChange={set('industry')} style={inputStyle} />
          <input placeholder="Last engagement (e.g. Q3 2025: job costing setup)" value={form.last_engagement} onChange={set('last_engagement')} style={inputStyle} />
          <textarea placeholder="Interaction summary *" rows={3} value={form.interaction_summary} onChange={set('interaction_summary')} required style={textareaStyle} />
          <textarea placeholder="Open opportunities" rows={3} value={form.open_opportunities} onChange={set('open_opportunities')} style={textareaStyle} />
          <textarea placeholder="Sentiment signals" rows={3} value={form.sentiment_signals} onChange={set('sentiment_signals')} style={textareaStyle} />
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Predicting…' : 'Predict Engagement'}</button>
        </form>

        {loading && (
          <div style={{ marginTop: 20, padding: 24, background: '#f8fafc', borderRadius: 8, textAlign: 'center', color: '#64748b' }}>
            AI is analyzing engagement signals…
          </div>
        )}

        {error && (
          <div style={{ marginTop: 20, padding: 16, background: '#fef2f2', borderRadius: 8, color: '#dc2626' }}>{error}</div>
        )}

        {result && (
          <div style={{ marginTop: 20, padding: 20, background: '#f7f7f7', borderRadius: 8, border: '1px solid #99f6e4' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#2a3139', margin: 0 }}>Engagement Forecast</h3>
              {typeof probability !== 'undefined' && (
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f766e', background: '#ccfbf1', padding: '4px 10px', borderRadius: 999 }}>
                  Probability: {probability}
                </span>
              )}
            </div>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'DM Sans, sans-serif', fontSize: 14, lineHeight: 1.7, color: '#334155', margin: 0 }}>
              {typeof (result.analysis || result.result) === 'string'
                ? (result.analysis || result.result)
                : JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
