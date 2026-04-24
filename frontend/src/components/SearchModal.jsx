import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const TYPE_MAP = {
  service: { label: 'Service', color: '#2563eb', path: '/services' },
};

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    if (open) { setQuery(''); setResults([]); setTimeout(() => inputRef.current?.focus(), 100); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (query.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    timerRef.current = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        .then(r => r.json())
        .then(data => setResults(Array.isArray(data) ? data : []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);
  }, [query]);

  const handleClick = (item) => {
    const info = TYPE_MAP[item.type] || { path: '' };
    navigate(`${info.path}/${item.slug}`);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-input-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input ref={inputRef} className="search-input" placeholder="Search services..." value={query} onChange={e => setQuery(e.target.value)} />
          <kbd className="search-kbd">ESC</kbd>
        </div>
        <div className="search-results">
          {loading && <p className="search-status">Searching...</p>}
          {!loading && query.length >= 2 && results.length === 0 && <p className="search-status">No results found</p>}
          {results.map((r, i) => {
            const info = TYPE_MAP[r.type] || { label: r.type, color: '#64748b' };
            return (
              <button key={i} className="search-result-item" onClick={() => handleClick(r)}>
                <span className="search-result-badge" style={{ background: info.color }}>{info.label}</span>
                <span className="search-result-title">{r.title || r.name}</span>
                {r.summary && <span className="search-result-summary">{r.summary.slice(0, 100)}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
