import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AdminAI() {
  const { api } = useAuth();
  const [activeTab, setActiveTab] = useState('insight');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Insight Generator
  const [insightTopic, setInsightTopic] = useState('');
  const [insightCategory, setInsightCategory] = useState('Financial Literacy');

  // Reply Generator
  const [replyName, setReplyName] = useState('');
  const [replyCompany, setReplyCompany] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [replyMessage, setReplyMessage] = useState('');

  // Service Enhancer
  const [serviceName, setServiceName] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');

  // Industry Enhancer
  const [industryName, setIndustryName] = useState('');

  // Case Study Generator
  const [caseTitle, setCaseTitle] = useState('');
  const [caseIndustry, setCaseIndustry] = useState('');

  // Business Analyzer
  const [analyzeData, setAnalyzeData] = useState('');
  const [analyzeType, setAnalyzeType] = useState('financial');

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); alert('Copied!'); };

  const loadSample = (tab) => {
    setResult(null);
    if (tab === 'insight') {
      const samples = [
        { topic: 'How to reduce accounts receivable aging for small businesses', category: 'Cash Flow' },
        { topic: '5 tax deductions every small business owner misses', category: 'Tax' },
        { topic: 'When to hire a fractional CFO vs. a full-time bookkeeper', category: 'Advisory' },
      ];
      const s = samples[Math.floor(Math.random() * samples.length)];
      setInsightTopic(s.topic); setInsightCategory(s.category);
    }
    if (tab === 'reply') {
      const samples = [
        { name: 'Sarah Chen', company: 'Brightside Retail', subject: 'Cash flow problems', message: 'Hi, we run 3 retail stores doing about $2M in revenue. We are profitable on paper but always seem to run out of cash mid-month. We need help understanding why and building a forecast. What would working with you look like?' },
        { name: 'Mike Johnson', company: 'Johnson Construction LLC', subject: 'Need help with job costing', message: 'We are a general contractor doing $5M/year but have no idea which jobs are actually profitable. Our bookkeeper tracks income and expenses but not at the job level. Can you help us set up proper job costing?' },
        { name: 'Dr. Rachel Kim', company: 'BrightPath Dental', subject: 'Second location expansion', message: 'We want to open a second dental office but are not sure if we can afford it. Our current location does about $1.2M and is profitable. How do we model whether a second location makes financial sense?' },
      ];
      const s = samples[Math.floor(Math.random() * samples.length)];
      setReplyName(s.name); setReplyCompany(s.company); setReplySubject(s.subject); setReplyMessage(s.message);
    }
    if (tab === 'service') {
      const samples = [
        { name: 'Forensic Accounting & Fraud Detection', desc: '' },
        { name: 'Startup Financial Modeling', desc: 'Helping early-stage startups build investor-ready financial models.' },
        { name: 'Nonprofit Grant Accounting', desc: '' },
      ];
      const s = samples[Math.floor(Math.random() * samples.length)];
      setServiceName(s.name); setServiceDesc(s.desc);
    }
    if (tab === 'industry') {
      const samples = ['Revenue Recognition & Compliance', 'International Tax Advisory', 'Financial Due Diligence', 'Inventory Accounting & Valuation'];
      setIndustryName(samples[Math.floor(Math.random() * samples.length)]);
    }
    if (tab === 'casestudy') {
      const samples = [
        { title: 'How We Helped a SaaS Startup Extend Runway by 14 Months', industry: 'Budgeting & Forecasting' },
        { title: 'Uncovering $200K in Hidden Costs at a Manufacturing Firm', industry: 'Cost Accounting & COGS Analysis' },
        { title: 'Turning Around a Cash-Strapped Medical Practice', industry: 'Cash Flow Management' },
      ];
      const s = samples[Math.floor(Math.random() * samples.length)];
      setCaseTitle(s.title); setCaseIndustry(s.industry);
    }
    if (tab === 'analyze') {
      const samples = [
        { type: 'financial', data: 'Revenue: $1,200,000\nCOGS: $720,000\nGross Profit: $480,000\nOperating Expenses: $390,000\nRent: $48,000\nPayroll: $240,000\nMarketing: $36,000\nInsurance: $18,000\nUtilities: $12,000\nOther: $36,000\nNet Income: $90,000\nAccounts Receivable: $185,000\nAccounts Payable: $95,000\nCash on Hand: $42,000\nLine of Credit Balance: $75,000' },
        { type: 'ar-aging', data: 'Current (0-30 days): $45,000\n31-60 days: $62,000\n61-90 days: $38,000\n91-120 days: $24,000\nOver 120 days: $16,000\nTotal AR: $185,000\nTotal Monthly Revenue: $100,000\nNumber of Clients: 45\nTop Client Owes: $28,000 (92 days)\nSecond Largest: $19,000 (67 days)' },
        { type: 'budget', data: 'Q1 Budget vs Actual:\nRevenue Budget: $300,000 | Actual: $275,000 | Variance: -$25,000\nCOGS Budget: $180,000 | Actual: $192,000 | Variance: -$12,000\nPayroll Budget: $60,000 | Actual: $68,000 | Variance: -$8,000\nMarketing Budget: $15,000 | Actual: $22,000 | Variance: -$7,000\nRent Budget: $12,000 | Actual: $12,000 | Variance: $0\nNet Income Budget: $33,000 | Actual: -$19,000 | Variance: -$52,000' },
      ];
      const s = samples[Math.floor(Math.random() * samples.length)];
      setAnalyzeType(s.type); setAnalyzeData(s.data);
    }
  };

  const sampleBtnStyle = { padding: '5px 12px', fontSize: 12, background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', borderRadius: 6, cursor: 'pointer', fontWeight: 500, fontFamily: 'DM Sans, sans-serif' };

  const generateInsight = async () => {
    if (!insightTopic.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await api('/api/admin/ai/generate-insight', { method: 'POST', body: JSON.stringify({ topic: insightTopic, category: insightCategory }) });
      const data = await res.json();
      setResult({ type: 'insight', data });
    } catch { setResult({ type: 'error', data: 'Failed to generate.' }); }
    setLoading(false);
  };

  const generateReply = async () => {
    if (!replyName.trim() || !replyMessage.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await api('/api/admin/ai/reply-contact', { method: 'POST', body: JSON.stringify({ name: replyName, company: replyCompany, subject: replySubject, message: replyMessage }) });
      const data = await res.json();
      setResult({ type: 'reply', data });
    } catch { setResult({ type: 'error', data: 'Failed to generate.' }); }
    setLoading(false);
  };

  const enhanceService = async () => {
    if (!serviceName.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await api('/api/admin/ai/enhance-service', { method: 'POST', body: JSON.stringify({ name: serviceName, description: serviceDesc, action: 'full-generate' }) });
      const data = await res.json();
      setResult({ type: 'service', data });
    } catch { setResult({ type: 'error', data: 'Failed to generate.' }); }
    setLoading(false);
  };

  const enhanceIndustry = async () => {
    if (!industryName.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await api('/api/admin/ai/enhance-industry', { method: 'POST', body: JSON.stringify({ name: industryName, action: 'full-generate' }) });
      const data = await res.json();
      setResult({ type: 'industry', data });
    } catch { setResult({ type: 'error', data: 'Failed to generate.' }); }
    setLoading(false);
  };

  const generateCaseStudy = async () => {
    if (!caseTitle.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await api('/api/admin/ai/enhance-case-study', { method: 'POST', body: JSON.stringify({ title: caseTitle, industry: caseIndustry, action: 'full-generate' }) });
      const data = await res.json();
      setResult({ type: 'casestudy', data });
    } catch { setResult({ type: 'error', data: 'Failed to generate.' }); }
    setLoading(false);
  };

  const analyzeBusinessData = async () => {
    if (!analyzeData.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await api('/api/admin/ai/analyze', { method: 'POST', body: JSON.stringify({ type: analyzeType, data: analyzeData }) });
      const data = await res.json();
      setResult({ type: 'analysis', data });
    } catch { setResult({ type: 'error', data: 'Failed to analyze.' }); }
    setLoading(false);
  };

  const tabs = [
    { id: 'insight', label: 'Article Generator' },
    { id: 'reply', label: 'Email Reply' },
    { id: 'service', label: 'Service Content' },
    { id: 'industry', label: 'Industry Content' },
    { id: 'casestudy', label: 'Case Study' },
    { id: 'analyze', label: 'Data Analyzer' },
  ];

  const renderResult = () => {
    if (!result) return null;
    if (result.type === 'error') return <div style={{ padding: 16, background: '#fef2f2', borderRadius: 8, color: '#dc2626' }}>{result.data}</div>;

    const resultBox = (content) => (
      <div style={{ padding: 20, background: '#f7f7f7', borderRadius: 8, border: '1px solid #99f6e4', marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#2a3139', margin: 0 }}>AI Result</h3>
          <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => copyToClipboard(typeof content === 'string' ? content : JSON.stringify(content, null, 2))}>Copy</button>
        </div>
        {typeof content === 'string' ? (
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'DM Sans, sans-serif', fontSize: 14, lineHeight: 1.7, color: '#334155', margin: 0 }}>{content}</pre>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(content).filter(([k]) => k !== 'type').map(([key, val]) => (
              <div key={key}>
                <strong style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>{key.replace(/_/g, ' ')}</strong>
                <div style={{ marginTop: 4, fontSize: 14, color: '#334155', lineHeight: 1.7 }}>{typeof val === 'string' ? val : JSON.stringify(val)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    if (result.type === 'insight') return resultBox(result.data);
    if (result.type === 'reply') return resultBox(result.data.reply);
    if (result.type === 'service') return resultBox(result.data);
    if (result.type === 'industry') return resultBox(result.data);
    if (result.type === 'casestudy') return resultBox(result.data);
    if (result.type === 'analysis') return resultBox(result.data.analysis);
    return null;
  };

  const inputStyle = { padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontFamily: 'DM Sans, sans-serif', outline: 'none', width: '100%' };
  const textareaStyle = { ...inputStyle, resize: 'vertical' };

  return (
    <div className="admin-page">
      <h1 className="admin-title">AI Assistant</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setResult(null); }} className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '8px 18px', fontSize: 13 }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>

        {/* Article Generator */}
        {activeTab === 'insight' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', margin: 0 }}>AI Article Generator</h2>
              <button style={sampleBtnStyle} onClick={() => loadSample('insight')}>Load Sample</button>
            </div>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>Generate a full blog article on any accounting or finance topic for small businesses.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input placeholder="Topic (e.g. 'How to reduce accounts receivable aging')" value={insightTopic} onChange={e => setInsightTopic(e.target.value)} style={inputStyle} onKeyDown={e => e.key === 'Enter' && generateInsight()} />
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <select value={insightCategory} onChange={e => setInsightCategory(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
                  <option>Financial Literacy</option><option>Cash Flow</option><option>Tax</option><option>Budgeting</option><option>Strategy</option><option>Advisory</option><option>Bookkeeping</option><option>Compliance</option>
                </select>
                <button className="btn btn-primary" onClick={generateInsight} disabled={loading} style={{ whiteSpace: 'nowrap' }}>{loading ? 'Generating...' : 'Generate Article'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Email Reply */}
        {activeTab === 'reply' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', margin: 0 }}>AI Email Reply Generator</h2>
              <button style={sampleBtnStyle} onClick={() => loadSample('reply')}>Load Sample</button>
            </div>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>Generate a professional email reply to a client inquiry or consultation request.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <input placeholder="Client Name" value={replyName} onChange={e => setReplyName(e.target.value)} style={inputStyle} />
              <input placeholder="Company" value={replyCompany} onChange={e => setReplyCompany(e.target.value)} style={inputStyle} />
            </div>
            <input placeholder="Subject" value={replySubject} onChange={e => setReplySubject(e.target.value)} style={{ ...inputStyle, marginBottom: 12 }} />
            <textarea placeholder="Their message..." rows={4} value={replyMessage} onChange={e => setReplyMessage(e.target.value)} style={textareaStyle} />
            <button className="btn btn-primary" onClick={generateReply} disabled={loading} style={{ marginTop: 12 }}>{loading ? 'Generating...' : 'Generate Reply'}</button>
          </div>
        )}

        {/* Service Content */}
        {activeTab === 'service' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', margin: 0 }}>AI Service Content Generator</h2>
              <button style={sampleBtnStyle} onClick={() => loadSample('service')}>Load Sample</button>
            </div>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>Generate a complete service description with tagline and features.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input placeholder="Service Name (e.g. 'Fractional CFO Services')" value={serviceName} onChange={e => setServiceName(e.target.value)} style={inputStyle} />
              <textarea placeholder="Existing description (optional — leave blank for full AI generation)" rows={3} value={serviceDesc} onChange={e => setServiceDesc(e.target.value)} style={textareaStyle} />
              <button className="btn btn-primary" onClick={enhanceService} disabled={loading}>{loading ? 'Generating...' : 'Generate Service Content'}</button>
            </div>
          </div>
        )}

        {/* Industry Content */}
        {activeTab === 'industry' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', margin: 0 }}>AI Industry Content Generator</h2>
              <button style={sampleBtnStyle} onClick={() => loadSample('industry')}>Load Sample</button>
            </div>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>Generate description, challenges, and approach for an accounting & finance practice area.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input placeholder="Practice Area (e.g. 'Tax Planning & Strategy')" value={industryName} onChange={e => setIndustryName(e.target.value)} style={inputStyle} onKeyDown={e => e.key === 'Enter' && enhanceIndustry()} />
              <button className="btn btn-primary" onClick={enhanceIndustry} disabled={loading}>{loading ? 'Generating...' : 'Generate Content'}</button>
            </div>
          </div>
        )}

        {/* Case Study */}
        {activeTab === 'casestudy' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', margin: 0 }}>AI Case Study Generator</h2>
              <button style={sampleBtnStyle} onClick={() => loadSample('casestudy')}>Load Sample</button>
            </div>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>Generate a complete case study with challenge, approach, and results.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <input placeholder="Case Study Title" value={caseTitle} onChange={e => setCaseTitle(e.target.value)} style={inputStyle} />
              <input placeholder="Practice Area (e.g. 'Cash Flow Management')" value={caseIndustry} onChange={e => setCaseIndustry(e.target.value)} style={inputStyle} />
            </div>
            <button className="btn btn-primary" onClick={generateCaseStudy} disabled={loading}>{loading ? 'Generating...' : 'Generate Case Study'}</button>
          </div>
        )}

        {/* Data Analyzer */}
        {activeTab === 'analyze' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', margin: 0 }}>AI Business Data Analyzer</h2>
              <button style={sampleBtnStyle} onClick={() => loadSample('analyze')}>Load Sample</button>
            </div>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>Paste financial data, metrics, or business information and get AI-powered analysis with key insights and recommendations.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <select value={analyzeType} onChange={e => setAnalyzeType(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
                <option value="financial">Financial Statements</option>
                <option value="cash-flow">Cash Flow Data</option>
                <option value="budget">Budget vs Actual</option>
                <option value="kpi">KPI Metrics</option>
                <option value="ar-aging">AR Aging Report</option>
                <option value="profitability">Profitability Analysis</option>
              </select>
              <textarea placeholder="Paste your data here (CSV, JSON, or plain text)..." rows={6} value={analyzeData} onChange={e => setAnalyzeData(e.target.value)} style={textareaStyle} />
              <button className="btn btn-primary" onClick={analyzeBusinessData} disabled={loading}>{loading ? 'Analyzing...' : 'Analyze Data'}</button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ marginTop: 20, padding: 24, background: '#f8fafc', borderRadius: 8, textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>...</div>
            AI is generating your content. This may take a few seconds.
          </div>
        )}

        {/* Result */}
        {renderResult()}
      </div>
    </div>
  );
}
