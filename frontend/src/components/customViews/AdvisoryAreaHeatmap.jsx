import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

function cellColor(value, max) {
  if (!value || !max) return '#f8fafc';
  const ratio = value / max;
  const lightness = 92 - Math.round(ratio * 50); // 92% -> 42%
  return `hsl(212, 70%, ${lightness}%)`;
}

export default function AdvisoryAreaHeatmap() {
  const { api } = useAuth();
  const [data, setData] = useState({ services: [], rows: [], max_hours: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api('/api/custom-views/heatmap')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [api]);

  return (
    <div data-testid="viz-heatmap" style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 16, padding: 24, marginBottom: 24 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2a3139', margin: 0 }}>Advisory Area Heatmap</h3>
      <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 16px' }}>Hours of advisory work per client x service area</p>
      {loading && <p style={{ color: '#6b7280' }}>Loading...</p>}
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      {!loading && !error && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'separate', borderSpacing: 4, width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Client</th>
                {data.services.map(s => (
                  <th key={s} style={{ padding: '8px 6px', fontSize: 11, color: '#6b7280', fontWeight: 600, textAlign: 'center' }}>{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map(row => (
                <tr key={row.client_id}>
                  <td style={{ padding: '6px 12px', fontSize: 13, color: '#2a3139', fontWeight: 500 }}>
                    {row.client}
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{row.industry}</div>
                  </td>
                  {data.services.map(s => {
                    const v = row.cells[s] || 0;
                    return (
                      <td key={s} title={`${row.client} / ${s}: ${v}h`} style={{ background: cellColor(v, data.max_hours), borderRadius: 6, textAlign: 'center', padding: '14px 10px', fontSize: 13, fontWeight: 600, color: v / (data.max_hours || 1) > 0.5 ? '#fff' : '#2a3139', minWidth: 64 }}>
                        {v || '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 12, color: '#6b7280' }}>
            <span>Low</span>
            <div style={{ display: 'flex' }}>
              {[0.1, 0.3, 0.5, 0.7, 0.9].map(r => (
                <div key={r} style={{ width: 24, height: 12, background: cellColor(r * (data.max_hours || 1), data.max_hours || 1) }} />
              ))}
            </div>
            <span>High ({data.max_hours}h)</span>
          </div>
        </div>
      )}
    </div>
  );
}
