// Custom Views: 2 VIZ + 2 NON-VIZ for Akarsu Advisory
// VIZ: client engagement timeline, advisory area heatmap (client x service)
// NON-VIZ: client advisory report (PDF-ready), service offering rules editor
const router = require('express').Router();
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Lightweight rate limit (uses ipKeyGenerator to handle IPv6 correctly when needed)
let keyGenerator;
try {
  const { ipKeyGenerator } = require('express-rate-limit');
  if (typeof ipKeyGenerator === 'function') keyGenerator = ipKeyGenerator;
} catch (_) { /* older version, leave undefined to use default */ }

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  ...(keyGenerator ? { keyGenerator } : {}),
});

router.use(limiter);

// ---------- In-memory seed data (deterministic, demo-ready) ----------
const CLIENTS = [
  { id: 1, name: 'Northwind Capital', industry: 'Financial Services' },
  { id: 2, name: 'Helios Healthcare', industry: 'Healthcare' },
  { id: 3, name: 'Arctos Manufacturing', industry: 'Manufacturing' },
  { id: 4, name: 'Vertex Retail Group', industry: 'Retail' },
  { id: 5, name: 'Skyline Energy', industry: 'Energy' },
];

const SERVICE_AREAS = [
  'Strategy',
  'Operations',
  'M&A',
  'Digital Transformation',
  'Risk & Compliance',
];

// Engagement events for timeline (client_id, date, type, summary, hours)
const ENGAGEMENT_EVENTS = [
  { client_id: 1, date: '2026-01-12', type: 'Kickoff',       service: 'Strategy',                summary: 'Discovery workshop & charter signed', hours: 8 },
  { client_id: 1, date: '2026-02-05', type: 'Workshop',      service: 'Strategy',                summary: 'Vision alignment session',            hours: 6 },
  { client_id: 1, date: '2026-03-18', type: 'Deliverable',   service: 'M&A',                     summary: 'Target screening report delivered',   hours: 12 },
  { client_id: 1, date: '2026-04-22', type: 'Steerco',       service: 'Strategy',                summary: 'Q2 steering committee review',        hours: 3 },
  { client_id: 2, date: '2026-01-28', type: 'Kickoff',       service: 'Operations',              summary: 'Process baseline assessment',         hours: 10 },
  { client_id: 2, date: '2026-03-04', type: 'Deliverable',   service: 'Digital Transformation',  summary: 'EHR roadmap v1',                      hours: 16 },
  { client_id: 2, date: '2026-04-10', type: 'Review',        service: 'Risk & Compliance',       summary: 'HIPAA gap analysis review',           hours: 5 },
  { client_id: 3, date: '2026-02-14', type: 'Workshop',      service: 'Operations',              summary: 'Lean value-stream mapping',           hours: 9 },
  { client_id: 3, date: '2026-04-02', type: 'Deliverable',   service: 'Digital Transformation',  summary: 'MES vendor recommendation',           hours: 14 },
  { client_id: 4, date: '2026-01-20', type: 'Kickoff',       service: 'Strategy',                summary: 'Store-format strategy launch',        hours: 7 },
  { client_id: 4, date: '2026-03-11', type: 'Deliverable',   service: 'Digital Transformation',  summary: 'Omnichannel target operating model',  hours: 18 },
  { client_id: 5, date: '2026-02-22', type: 'Workshop',      service: 'Risk & Compliance',       summary: 'Carbon disclosure readiness',         hours: 6 },
  { client_id: 5, date: '2026-04-29', type: 'Deliverable',   service: 'M&A',                     summary: 'Renewables JV term sheet',            hours: 11 },
];

// Pricing rules / scope (mutable in-memory CRUD store)
let NEXT_RULE_ID = 1;
const PRICING_RULES = [];
function seedRule(service, tier, min_hours, max_hours, rate_usd, scope) {
  PRICING_RULES.push({ id: NEXT_RULE_ID++, service, tier, min_hours, max_hours, rate_usd, scope });
}
seedRule('Strategy',               'Standard',   40,   120, 425, 'Vision, target operating model, roadmap');
seedRule('Strategy',               'Enterprise', 120,  400, 495, 'Multi-BU strategy, board-level facilitation');
seedRule('Operations',             'Standard',   60,   200, 385, 'Process redesign, lean diagnostics');
seedRule('M&A',                    'Premium',    80,   320, 575, 'Target screening, diligence, integration plan');
seedRule('Digital Transformation', 'Standard',   80,   240, 450, 'Tech stack assessment, vendor selection');
seedRule('Risk & Compliance',      'Standard',   40,   160, 395, 'Regulatory gap analysis, controls design');

// ---------- Helpers ----------
function buildHeatmap() {
  const matrix = CLIENTS.map(c => {
    const row = { client_id: c.id, client: c.name, industry: c.industry, cells: {} };
    SERVICE_AREAS.forEach(s => { row.cells[s] = 0; });
    return row;
  });
  let max = 0;
  ENGAGEMENT_EVENTS.forEach(ev => {
    const row = matrix.find(r => r.client_id === ev.client_id);
    if (!row) return;
    if (row.cells[ev.service] == null) row.cells[ev.service] = 0;
    row.cells[ev.service] += ev.hours;
    if (row.cells[ev.service] > max) max = row.cells[ev.service];
  });
  return { services: SERVICE_AREAS, rows: matrix, max_hours: max };
}

function buildTimeline(clientId) {
  let events = ENGAGEMENT_EVENTS.slice();
  if (clientId) events = events.filter(e => e.client_id === Number(clientId));
  events.sort((a, b) => a.date.localeCompare(b.date));
  return events.map(e => ({
    ...e,
    client: (CLIENTS.find(c => c.id === e.client_id) || {}).name || 'Unknown',
  }));
}

function buildReport(clientId) {
  const client = CLIENTS.find(c => c.id === Number(clientId));
  if (!client) return null;
  const events = ENGAGEMENT_EVENTS.filter(e => e.client_id === client.id);
  const totalHours = events.reduce((s, e) => s + e.hours, 0);
  const byService = {};
  events.forEach(e => { byService[e.service] = (byService[e.service] || 0) + e.hours; });
  const topService = Object.entries(byService).sort((a, b) => b[1] - a[1])[0];
  const recommendations = [
    `Continue investment in ${topService ? topService[0] : 'core advisory'} where engagement is highest.`,
    'Schedule a quarterly executive review to validate roadmap milestones.',
    'Expand cross-functional benchmarking against industry peers.',
    'Establish a value-tracking dashboard tied to engagement KPIs.',
  ];
  const lines = [];
  lines.push(`Akarsu Advisory - Client Advisory Report`);
  lines.push(`Client: ${client.name}`);
  lines.push(`Industry: ${client.industry}`);
  lines.push(`Generated: ${new Date().toISOString().slice(0, 10)}`);
  lines.push('');
  lines.push(`Total advisory hours: ${totalHours}`);
  lines.push(`Engagements: ${events.length}`);
  lines.push('');
  lines.push('Service distribution:');
  Object.entries(byService).forEach(([s, h]) => lines.push(`  - ${s}: ${h} hours`));
  lines.push('');
  lines.push('Timeline:');
  events.sort((a, b) => a.date.localeCompare(b.date)).forEach(e => {
    lines.push(`  ${e.date}  [${e.type}] ${e.service} - ${e.summary} (${e.hours}h)`);
  });
  lines.push('');
  lines.push('Recommendations:');
  recommendations.forEach((r, i) => lines.push(`  ${i + 1}. ${r}`));
  return {
    client,
    total_hours: totalHours,
    engagements: events.length,
    by_service: byService,
    recommendations,
    text: lines.join('\n'),
    pdf_ready: true, // flagged so frontend can pipe to print/PDF
  };
}

// ---------- Endpoints ----------

// 1) VIZ - Client Engagement Timeline
router.get('/timeline', auth, (req, res) => {
  try {
    const { client_id } = req.query;
    const events = buildTimeline(client_id);
    res.json({
      ok: true,
      view: 'client-engagement-timeline',
      clients: CLIENTS,
      events,
      total: events.length,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 2) VIZ - Advisory Area Heatmap (client x service)
router.get('/heatmap', auth, (req, res) => {
  try {
    const data = buildHeatmap();
    res.json({
      ok: true,
      view: 'advisory-area-heatmap',
      ...data,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 3) NON-VIZ - Client Advisory Report (PDF-ready text payload)
router.get('/report/:clientId', auth, (req, res) => {
  try {
    const report = buildReport(req.params.clientId);
    if (!report) return res.status(404).json({ error: 'Client not found' });
    res.json({ ok: true, view: 'client-advisory-report', ...report });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 4) NON-VIZ - Service Offering Rules editor (CRUD pricing tiers & scope)
router.get('/rules', auth, (req, res) => {
  res.json({
    ok: true,
    view: 'service-offering-rules',
    services: SERVICE_AREAS,
    rules: PRICING_RULES,
  });
});

router.post('/rules', auth, (req, res) => {
  try {
    const { service, tier, min_hours, max_hours, rate_usd, scope } = req.body || {};
    if (!service || !tier) return res.status(400).json({ error: 'service and tier required' });
    const rule = {
      id: NEXT_RULE_ID++,
      service: String(service),
      tier: String(tier),
      min_hours: Number(min_hours) || 0,
      max_hours: Number(max_hours) || 0,
      rate_usd: Number(rate_usd) || 0,
      scope: String(scope || ''),
    };
    PRICING_RULES.push(rule);
    res.json({ ok: true, rule });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/rules/:id', auth, (req, res) => {
  const id = Number(req.params.id);
  const idx = PRICING_RULES.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Rule not found' });
  const { service, tier, min_hours, max_hours, rate_usd, scope } = req.body || {};
  const current = PRICING_RULES[idx];
  PRICING_RULES[idx] = {
    ...current,
    service: service != null ? String(service) : current.service,
    tier: tier != null ? String(tier) : current.tier,
    min_hours: min_hours != null ? Number(min_hours) : current.min_hours,
    max_hours: max_hours != null ? Number(max_hours) : current.max_hours,
    rate_usd: rate_usd != null ? Number(rate_usd) : current.rate_usd,
    scope: scope != null ? String(scope) : current.scope,
  };
  res.json({ ok: true, rule: PRICING_RULES[idx] });
});

router.delete('/rules/:id', auth, (req, res) => {
  const id = Number(req.params.id);
  const idx = PRICING_RULES.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Rule not found' });
  const [removed] = PRICING_RULES.splice(idx, 1);
  res.json({ ok: true, removed });
});

module.exports = router;
