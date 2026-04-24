import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

export default function Insights() {
  useSEO('Insights', 'Perspectives on strategy, growth, and transformation from our advisory team.');
  const [insights, setInsights] = useState([]);
  const [category, setCategory] = useState('');

  useEffect(() => {
    const params = category ? `?category=${category}` : '';
    fetch(`/api/insights${params}`).then(r => r.json()).then(d => setInsights(Array.isArray(d) ? d : [])).catch(() => {});
  }, [category]);

  const categories = [...new Set(insights.map(i => i.category).filter(Boolean))];

  return (
    <div>
      <section className="hero hero-sm">
        <div className="container">
          <h1 className="hero-title">Insights</h1>
          <p className="hero-subtitle">Perspectives on strategy, growth, and transformation.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {categories.length > 0 && (
            <div style={{ marginBottom: 32, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className={`chip ${!category ? 'chip-active' : ''}`} onClick={() => setCategory('')}>All</button>
              {categories.map(c => (
                <button key={c} className={`chip ${category === c ? 'chip-active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
              ))}
            </div>
          )}
          {insights.length === 0 ? (
            <p className="text-muted">No insights published yet.</p>
          ) : (
            <div className="grid grid-3">
              {insights.map(ins => (
                <Link key={ins.id} to={`/insights/${ins.slug}`} className="card card-link">
                  <span className="badge">{ins.category || 'Insight'}</span>
                  <h3 className="card-title" style={{ marginTop: 12 }}>{ins.title}</h3>
                  <p className="card-text">{ins.summary}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
