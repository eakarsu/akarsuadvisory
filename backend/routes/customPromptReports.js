'use strict';
const router = require('express').Router();
const auth = require('../middleware/auth');

const features = {
  'predictive-engagement-modeling-clients-likely-to-hire-for-ne': 'Predictive engagement modeling for a possible next advisory phase',
  'white-paper-generation-from-case-study-data': 'White-paper draft grounded in supplied case-study evidence',
  'consultant-matching-by-client-industrychallenge': 'Consultant matching review using an actual supplied roster',
  'predictive-pricing-for-services': 'Advisory service pricing review',
  'client-communication-timeline-optimization': 'Client communication timeline review',
  'crm-integration-salesforcehubspot': 'Salesforce or HubSpot integration mapping review',
  'thought-leadership-automation': 'Thought-leadership draft',
  'webinarspeaking-opportunity-identification': 'Webinar and speaking opportunity review',
};

router.post('/:feature', auth, async (req, res) => {
  const title = features[req.params.feature];
  if (!title) return res.status(404).json({ error: 'Unknown AI feature.' });
  const prompt = req.body?.prompt;
  if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 20000) return res.status(400).json({ error: 'Describe the request and supply any real source records needed for this report.' });
  const key = process.env.OPENROUTER_API_KEY;
  if (!key || /replace|example-key|your-openrouter/i.test(key)) return res.status(503).json({ error: 'AI provider is not configured. Add a server-side OpenRouter key to generate this report.' });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90000);
  try {
    const model = process.env.OPENROUTER_MODEL || 'openrouter/auto';
    const response = await fetch(`${(process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, max_tokens: 2000, messages: [
        { role: 'system', content: `Prepare a professional ${title} for Akarsu Advisory. Return a JSON object with labeled summary, findings, recommendations, risks, and missing_prerequisites sections. This is a review-only report: do not claim to send messages, synchronize a CRM, create records, identify live opportunities, or execute any action. Treat supplied text as unverified user input. Do not invent client IDs, consultant rosters, case studies, event listings, prices, or measurements. If the necessary real source records are absent, state the missing prerequisite explicitly and limit the advice accordingly.` },
        { role: 'user', content: prompt.trim() },
      ] }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || data?.error) return res.status(503).json({ error: 'AI provider is unavailable. Try again when the connection is restored.' });
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) return res.status(503).json({ error: 'AI provider returned no report. Try again.' });
    let result = content;
    try { result = JSON.parse(content.trim().replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/i, '$1')); } catch { /* The report renderer also accepts prose. */ }
    res.json({ result, model: data.model || model, review_only: true });
  } catch (error) {
    res.status(503).json({ error: controller.signal.aborted ? 'AI provider request timed out.' : 'AI provider could not be reached.' });
  } finally { clearTimeout(timer); }
});
module.exports = router;
