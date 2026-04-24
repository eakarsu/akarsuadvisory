import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import useSEO from '../../hooks/useSEO';

export default function InsightDetail() {
  const { slug } = useParams();
  const [insight, setInsight] = useState(null);

  useEffect(() => {
    fetch(`/api/insights/${slug}`).then(r => r.json()).then(setInsight).catch(() => {});
  }, [slug]);

  useSEO(insight?.title, insight?.summary);

  if (!insight) return <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>Loading...</div>;

  return (
    <div>
      <section className="hero hero-sm">
        <div className="container">
          <span className="badge" style={{ marginBottom: 16 }}>{insight.category || 'Insight'}</span>
          <h1 className="hero-title">{insight.title}</h1>
          <p className="hero-subtitle">{insight.summary}</p>
          <p className="text-muted" style={{ marginTop: 12, fontSize: 14 }}>
            By {insight.author || 'Akarsu Advisory'} &middot; {new Date(insight.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container content-narrow">
          <div className="markdown-content">
            <ReactMarkdown>{insight.content}</ReactMarkdown>
          </div>
        </div>
      </section>
      <section className="cta-section">
        <div className="container text-center">
          <h2 className="cta-title">Want to Discuss This Topic?</h2>
          <p className="cta-text">Our advisory team is ready to explore how these insights apply to your organization.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/book-consultation" className="btn btn-primary btn-lg">Book a Consultation</Link>
            <Link to="/insights" className="btn btn-outline">More Insights</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
