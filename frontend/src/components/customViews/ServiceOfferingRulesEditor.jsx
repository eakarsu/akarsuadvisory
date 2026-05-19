import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const EMPTY = { service: '', tier: 'Standard', min_hours: 40, max_hours: 160, rate_usd: 400, scope: '' };

export default function ServiceOfferingRulesEditor() {
  const { api } = useAuth();
  const [services, setServices] = useState([]);
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    api('/api/custom-views/rules')
      .then(r => r.json())
      .then(d => {
        setServices(d.services || []);
        setRules(d.rules || []);
        if (!form.service && d.services && d.services[0]) {
          setForm(f => ({ ...f, service: d.services[0] }));
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/custom-views/rules/${editingId}` : '/api/custom-views/rules';
      const r = await api(url, { method, body: JSON.stringify(form) });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || 'Save failed');
      }
      setEditingId(null);
      setForm({ ...EMPTY, service: services[0] || '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const edit = (rule) => {
    setEditingId(rule.id);
    setForm({
      service: rule.service,
      tier: rule.tier,
      min_hours: rule.min_hours,
      max_hours: rule.max_hours,
      rate_usd: rule.rate_usd,
      scope: rule.scope || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...EMPTY, service: services[0] || '' });
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this pricing rule?')) return;
    try {
      const r = await api(`/api/custom-views/rules/${id}`, { method: 'DELETE' });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || 'Delete failed');
      }
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div data-testid="nonviz-rules" style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 16, padding: 24, marginBottom: 24 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2a3139', margin: 0 }}>Service Offering Rules Editor</h3>
      <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 16px' }}>Manage pricing tiers and scope per advisory service</p>

      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, alignItems: 'end', marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
        <Field label="Service">
          <select value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} required style={inputStyle}>
            <option value="">Select</option>
            {services.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Tier">
          <select value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })} required style={inputStyle}>
            <option>Standard</option>
            <option>Premium</option>
            <option>Enterprise</option>
          </select>
        </Field>
        <Field label="Min Hours">
          <input type="number" min="0" value={form.min_hours} onChange={e => setForm({ ...form, min_hours: Number(e.target.value) })} style={inputStyle} />
        </Field>
        <Field label="Max Hours">
          <input type="number" min="0" value={form.max_hours} onChange={e => setForm({ ...form, max_hours: Number(e.target.value) })} style={inputStyle} />
        </Field>
        <Field label="Rate USD/hr">
          <input type="number" min="0" value={form.rate_usd} onChange={e => setForm({ ...form, rate_usd: Number(e.target.value) })} style={inputStyle} />
        </Field>
        <Field label="Scope">
          <input type="text" value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })} placeholder="What's included..." style={inputStyle} />
        </Field>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 13 }}>
            {editingId ? 'Update' : 'Add Rule'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="btn btn-outline" style={{ padding: '8px 14px', fontSize: 13 }}>Cancel</button>
          )}
        </div>
      </form>

      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      {loading && <p style={{ color: '#6b7280' }}>Loading...</p>}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#6b7280', textAlign: 'left' }}>
              <th style={th}>Service</th>
              <th style={th}>Tier</th>
              <th style={th}>Hours</th>
              <th style={th}>Rate</th>
              <th style={th}>Scope</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={td}><strong>{r.service}</strong></td>
                <td style={td}>{r.tier}</td>
                <td style={td}>{r.min_hours} - {r.max_hours}</td>
                <td style={td}>${r.rate_usd}/hr</td>
                <td style={td}>{r.scope}</td>
                <td style={td}>
                  <button onClick={() => edit(r)} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 12, marginRight: 4 }}>Edit</button>
                  <button onClick={() => remove(r.id)} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 12, color: '#dc2626', borderColor: '#fecaca' }}>Delete</button>
                </td>
              </tr>
            ))}
            {rules.length === 0 && !loading && (
              <tr><td colSpan={6} style={{ ...td, color: '#6b7280', textAlign: 'center' }}>No pricing rules yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' };
const th = { padding: '8px 10px', fontSize: 12, fontWeight: 600 };
const td = { padding: '8px 10px', verticalAlign: 'top' };

function Field({ label, children }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      {children}
    </label>
  );
}
