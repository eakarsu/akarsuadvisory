// Custom feature endpoints (batch_09 audit suggestions)
const router = require('express').Router();
const auth = require('../middleware/auth');

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-sonnet-4';

async function aiComplete(prompt, system, maxTokens = 1800) {
  if (!OPENROUTER_KEY) {
    const e = new Error('OPENROUTER_API_KEY missing'); e.statusCode = 503; throw e;
  }
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENROUTER_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.5,
    }),
  });
  const data = await r.json();
  return { content: data.choices?.[0]?.message?.content || '', model: data.model };
}

function parseJSON(t) {
  if (!t) return null;
  const c = String(t).replace(/```(?:json)?/gi, '').replace(/```/g, '');
  const m = c.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

function err(res, e, label) {
  if (e.statusCode === 503) return res.status(503).json({ error: e.message });
  console.error(`${label} error:`, e.message);
  res.status(500).json({ error: e.message });
}

// 1. Predictive engagement modeling
router.post('/engagement-prediction', auth, async (req, res) => {
  try {
    const { client_id, recent_consultations, services_used, life_signals } = req.body || {};
    if (!client_id) return res.status(400).json({ error: 'client_id required' });
    const ai = await aiComplete(
      `CLIENT: ${client_id}\nCONSULTATIONS: ${JSON.stringify(recent_consultations || [])}\nSERVICES: ${JSON.stringify(services_used || [])}\nSIGNALS: ${JSON.stringify(life_signals || {})}\nReturn JSON {"likely_next_engagement":"","probability_90d":0,"recommended_offer":"","outreach_channel":"email|call|meeting","ETA_days":0}`,
      'You score advisory engagement probability for the next phase. JSON only.'
    );
    res.json({ type: 'engagement-prediction', result: parseJSON(ai.content) || { raw: ai.content }, model: ai.model });
  } catch (e) { err(res, e, 'engagement-prediction'); }
});

// 2. White-paper generation from case study data
router.post('/whitepaper-generate', auth, async (req, res) => {
  try {
    const { case_studies, theme, target_audience } = req.body || {};
    if (!Array.isArray(case_studies)) return res.status(400).json({ error: 'case_studies array required' });
    const ai = await aiComplete(
      `THEME: ${theme || 'industry overview'}\nAUDIENCE: ${target_audience || 'C-suite'}\nCASES: ${JSON.stringify(case_studies.slice(0,8))}\nReturn JSON {"title":"","executive_summary":"","sections":[{"heading":"","body":""}],"key_takeaways":[""],"cta":""}`,
      'You author thought-leadership whitepapers from case-study evidence. JSON only.',
      3000
    );
    res.json({ type: 'whitepaper-generate', result: parseJSON(ai.content) || { raw: ai.content }, model: ai.model });
  } catch (e) { err(res, e, 'whitepaper-generate'); }
});

// 3. Consultant matching by client industry/challenge
router.post('/consultant-match', auth, async (req, res) => {
  try {
    const { client_brief, consultants } = req.body || {};
    if (!client_brief || !Array.isArray(consultants)) return res.status(400).json({ error: 'client_brief and consultants required' });
    const ai = await aiComplete(
      `BRIEF: ${client_brief}\nCONSULTANTS: ${JSON.stringify(consultants.slice(0,15))}\nReturn JSON {"ranked":[{"consultant_id":"","score":0,"strengths":[""],"prior_relevant":""}],"top_pick":""}`,
      'You match consultants to client briefs. JSON only.'
    );
    res.json({ type: 'consultant-match', result: parseJSON(ai.content) || { raw: ai.content }, model: ai.model });
  } catch (e) { err(res, e, 'consultant-match'); }
});

// 4. Predictive pricing for services
router.post('/pricing-prediction', auth, async (req, res) => {
  try {
    const { service, scope, client_size, market_comp } = req.body || {};
    if (!service) return res.status(400).json({ error: 'service required' });
    const ai = await aiComplete(
      `SERVICE: ${service}\nSCOPE: ${JSON.stringify(scope || {})}\nCLIENT_SIZE: ${client_size || 'mid'}\nMARKET: ${JSON.stringify(market_comp || {})}\nReturn JSON {"recommended_price_usd":0,"low_anchor":0,"high_anchor":0,"price_per_hour_usd":0,"discount_levers":[""]}`,
      'You price advisory services from scope + market comps. JSON only.'
    );
    res.json({ type: 'pricing-prediction', result: parseJSON(ai.content) || { raw: ai.content }, model: ai.model });
  } catch (e) { err(res, e, 'pricing-prediction'); }
});

// 5. Client communication timeline optimization
router.post('/comm-timeline', auth, async (req, res) => {
  try {
    const { client_id, last_touches, project_phase } = req.body || {};
    if (!client_id) return res.status(400).json({ error: 'client_id required' });
    const ai = await aiComplete(
      `CLIENT: ${client_id}\nLAST_TOUCHES: ${JSON.stringify(last_touches || [])}\nPHASE: ${project_phase || 'discovery'}\nReturn JSON {"next_touchpoints":[{"days_from_now":0,"channel":"","topic":""}],"recommended_cadence":"weekly|biweekly|monthly","escalation_triggers":[""]}`,
      'You optimize client communication cadence. JSON only.'
    );
    res.json({ type: 'comm-timeline', result: parseJSON(ai.content) || { raw: ai.content }, model: ai.model });
  } catch (e) { err(res, e, 'comm-timeline'); }
});

// 6. CRM integration (Salesforce/HubSpot)
// TODO: configure credentials for CRM_API_KEY / CRM_INSTANCE_URL.
router.post('/crm-sync', auth, async (req, res) => {
  try {
    const { crm = 'hubspot', entity, payload } = req.body || {};
    const ai = await aiComplete(
      `CRM: ${crm}\nENTITY: ${entity || 'contact'}\nPAYLOAD: ${JSON.stringify(payload || {})}\nCRM API set: ${Boolean(process.env.CRM_API_KEY)}\nReturn JSON {"target_object":"","mapped_fields":{},"missing_required":[""],"sync_status":"ready|blocked"}`,
      'You map our advisory CRM entity to Salesforce/HubSpot shape. JSON only.'
    );
    res.json({ type: 'crm-sync', result: parseJSON(ai.content) || { raw: ai.content }, model: ai.model });
  } catch (e) { err(res, e, 'crm-sync'); }
});

// 7. Thought-leadership automation
router.post('/thought-leadership', auth, async (req, res) => {
  try {
    const { topic, recent_insights, target_channel } = req.body || {};
    if (!topic) return res.status(400).json({ error: 'topic required' });
    const ai = await aiComplete(
      `TOPIC: ${topic}\nRECENT_INSIGHTS: ${JSON.stringify(recent_insights || []).slice(0,2000)}\nCHANNEL: ${target_channel || 'linkedin'}\nReturn JSON {"headline":"","hook":"","body":"","hashtags":[""],"cta":"","best_post_time":""}`,
      'You draft thought-leadership posts. JSON only.'
    );
    res.json({ type: 'thought-leadership', result: parseJSON(ai.content) || { raw: ai.content }, model: ai.model });
  } catch (e) { err(res, e, 'thought-leadership'); }
});

// 8. Webinar / speaking opportunity identification
// TODO: configure credentials for EVENTS_FEED_API_KEY (Eventbrite/Meetup).
router.post('/speaking-opportunities', auth, async (req, res) => {
  try {
    const { speaker_profile, target_industries, location } = req.body || {};
    if (!speaker_profile) return res.status(400).json({ error: 'speaker_profile required' });
    const ai = await aiComplete(
      `PROFILE: ${JSON.stringify(speaker_profile)}\nINDUSTRIES: ${JSON.stringify(target_industries || [])}\nLOCATION: ${location || 'global'}\nEvents API: ${Boolean(process.env.EVENTS_FEED_API_KEY)}\nReturn JSON {"opportunities":[{"event":"","date":"","fit_score":0,"pitch_hook":""}],"pitch_template":""}`,
      'You surface relevant speaking / webinar opportunities. JSON only.'
    );
    res.json({ type: 'speaking-opportunities', result: parseJSON(ai.content) || { raw: ai.content }, model: ai.model });
  } catch (e) { err(res, e, 'speaking-opportunities'); }
});

module.exports = router;
