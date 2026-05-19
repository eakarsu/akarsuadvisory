import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ClientAdvisoryReport() {
  const { api } = useAuth();
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/custom-views/timeline')
      .then(r => r.json())
      .then(d => {
        setClients(d.clients || []);
        if (d.clients && d.clients[0]) setClientId(String(d.clients[0].id));
      })
      .catch(() => {});
  }, [api]);

  const generate = () => {
    if (!clientId) return;
    setLoading(true);
    setError('');
    setReport(null);
    api(`/api/custom-views/report/${clientId}`)
      .then(r => r.json())
      .then(d => setReport(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  const downloadPdf = () => {
    if (!report) return;
    // Use browser's print-to-PDF for the report text
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Advisory Report - ${report.client.name}</title>
      <style>
        body { font-family: -apple-system, system-ui, sans-serif; padding: 40px; color: #2a3139; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        pre { white-space: pre-wrap; font-family: inherit; font-size: 13px; line-height: 1.7; }
      </style></head>
      <body><h1>Akarsu Advisory - ${report.client.name}</h1>
      <pre>${report.text.replace(/</g, '&lt;')}</pre>
      <script>window.onload=()=>window.print()</script>
      </body></html>`);
    w.document.close();
  };

  return (
    <div data-testid="nonviz-report" style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 16, padding: 24, marginBottom: 24 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2a3139', margin: 0 }}>Client Advisory Report (PDF)</h3>
      <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 16px' }}>Generate a printable, PDF-ready advisory summary per client</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <select
          value={clientId}
          onChange={e => setClientId(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, minWidth: 220 }}
        >
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={generate} className="btn btn-primary" disabled={loading || !clientId}>
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
        {report && (
          <button onClick={downloadPdf} className="btn btn-outline">Download / Print PDF</button>
        )}
      </div>

      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      {report && (
        <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 12 }}>
            <Metric label="Client" value={report.client.name} />
            <Metric label="Industry" value={report.client.industry} />
            <Metric label="Engagements" value={report.engagements} />
            <Metric label="Total Hours" value={report.total_hours} />
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12, color: '#374151', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, maxHeight: 320, overflowY: 'auto' }}>
            {report.text}
          </pre>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 10 }}>
      <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#2a3139', marginTop: 2 }}>{value}</div>
    </div>
  );
}
