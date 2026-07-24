'use strict';

const router = require('express').Router();
const auth = require('../middleware/auth');
const pool = require('../db');

router.post('/advisory-review', auth, async (req, res, next) => {
  try {
    const prompt = String(req.body?.prompt || '').trim();
    if (prompt.length < 20 || prompt.length > 12000) {
      return res.status(400).json({ error: 'prompt must contain 20 to 12000 characters' });
    }
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL;
    const baseUrl = process.env.OPENROUTER_BASE_URL;
    if (!apiKey || !model || baseUrl !== 'https://openrouter.ai/api/v1') {
      return res.status(503).json({ error: 'OpenRouter is not configured' });
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Number(process.env.OPENROUTER_TIMEOUT_MS || 180000));
    let provider;
    try {
      provider = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json',
          'http-referer': process.env.PUBLIC_APP_URL,
          'x-title': 'Akarsu Advisory',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are an evidence-focused financial operations advisor. State uncertainty, require human approval, and never initiate trades or transfers.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 1800,
        }),
      });
    } finally {
      clearTimeout(timer);
    }
    if (!provider.ok) throw Object.assign(new Error(`OpenRouter returned ${provider.status}`), { status: 502 });
    const payload = await provider.json();
    const result = payload?.choices?.[0]?.message?.content;
    const providerReceipt = provider.headers.get('x-request-id') || payload?.id;
    if (typeof result !== 'string' || !result.trim() || !providerReceipt) {
      throw Object.assign(new Error('OpenRouter returned an incomplete response'), { status: 502 });
    }
    const saved = await pool.query(
      `INSERT INTO runtime_ai_results(user_id,prompt,model,provider_receipt,result,usage)
       VALUES($1,$2,$3,$4,$5,$6::jsonb) RETURNING id,created_at`,
      [req.user.id, prompt, payload.model || model, providerReceipt, result, JSON.stringify(payload.usage || {})],
    );
    res.json({ id: saved.rows[0].id, createdAt: saved.rows[0].created_at, model: payload.model || model, result, usage: payload.usage || {} });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
