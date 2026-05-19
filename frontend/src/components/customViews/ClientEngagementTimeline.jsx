import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const TYPE_COLORS = {
  Kickoff: '#2563eb',
  Workshop: '#7c3aed',
  Deliverable: '#059669',
  Steerco: '#d97706',
  Review: '#dc2626',
};

export default function ClientEngagementTimeline() {
  const { api } = useAuth();
  const [data, setData] = useState({ clients: [], events: [] });
  const [clientId, setClientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = (cid) => {
    setLoading(true);
    setError('');
    const url = cid ? `/api/custom-views/timeline?client_id=${cid}` : '/api/custom-views/timeline';
    api(url)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(''); }, []);

  return (
    <div data-testid="viz-timeline" style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 16, padding: 24, marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2a3139', margin: 0 }}>Client Engagement Timeline</h3>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>Chronological view of advisory touchpoints</p>
        </div>
        <select
          value={clientId}
          onChange={e => { setClientId(e.target.value); load(e.target.value); }}
          style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}
        >
          <option value="">All Clients</option>
          {data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      {loading && <p style={{ color: '#6b7280' }}>Loading...</p>}
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      {!loading && !error && (
        <div style={{ position: 'relative', paddingLeft: 24 }}>
          <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, background: '#e2e8f0' }} />
          {data.events.length === 0 && <p style={{ color: '#6b7280' }}>No engagement events.</p>}
          {data.events.map((e, i) => (
            <div key={i} style={{ position: 'relative', paddingBottom: 16 }}>
              <div style={{ position: 'absolute', left: -20, top: 6, width: 12, height: 12, borderRadius: '50%', background: TYPE_COLORS[e.type] || '#6b7280', border: '2px solid #fff', boxShadow: '0 0 0 1px #e2e8f0' }} />
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                  <strong style={{ color: '#2a3139', fontSize: 14 }}>{e.client} - {e.service}</strong>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>{e.date}</span>
                </div>
                <div style={{ marginTop: 4, fontSize: 13, color: '#374151' }}>
                  <span style={{ display: 'inline-block', padding: '2px 8px', background: TYPE_COLORS[e.type] || '#6b7280', color: '#fff', borderRadius: 999, fontSize: 11, marginRight: 8 }}>{e.type}</span>
                  {e.summary}
                  <span style={{ marginLeft: 8, color: '#6b7280' }}>({e.hours}h)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
