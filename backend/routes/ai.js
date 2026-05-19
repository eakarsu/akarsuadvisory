const router = require('express').Router();
const auth = require('../middleware/auth');
const pool = require('../db');
const { sendNotification } = require('../mailer');

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

async function aiComplete(prompt, maxTokens = 1000) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENROUTER_KEY}` },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'Unable to generate response.';
}

/**
 * Robustly parse a JSON object from an LLM text response.
 * Tries: 1) direct JSON.parse, 2) strip markdown fences, 3) regex extraction.
 */
function parseJsonFromAI(text) {
  // 1. Try direct parse
  try {
    return JSON.parse(text);
  } catch (_) {}

  // 2. Strip markdown code fences (```json ... ``` or ``` ... ```)
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch (_) {}
  }

  // 3. Regex extraction — last resort
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0]);
    } catch (_) {}
  }

  return null;
}

// Generate email reply for consultation
// Supports action='reply' (default) and action='reply-and-send'
router.post('/reply-consultation', auth, async (req, res) => {
  try {
    const { name, email, company, service_interest, message, consultation_id, action } = req.body;
    const prompt = `You are a professional financial advisor at Akarsu Advisory, a financial advisory firm for small businesses. Write a warm, professional email reply to a consultation request.

Client: ${name}${company ? ` from ${company}` : ''}
Service interest: ${service_interest || 'General inquiry'}
Their message: ${message || 'No message provided'}

Write a concise, friendly reply (3-4 paragraphs) that:
1. Thanks them for reaching out
2. Acknowledges their specific situation/challenge
3. Briefly explains how Akarsu Advisory can help with their specific need
4. Suggests next steps (scheduling a call)

Sign off as "The Akarsu Advisory Team". Do not include subject line.`;

    const reply = await aiComplete(prompt);

    if (action === 'reply-and-send') {
      // Send the email to the lead
      if (!email) return res.status(400).json({ error: 'Recipient email is required for reply-and-send' });

      await sendNotification(
        `Re: Your Consultation Request — Akarsu Advisory`,
        `<div style="font-family:sans-serif;max-width:600px;line-height:1.7;">
          ${reply.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('')}
        </div>`,
        email  // sendNotification sends to NOTIFY_EMAIL + extraRecipient
      );

      // Mark the DB record as replied with timestamp
      if (consultation_id) {
        await pool.query(
          `UPDATE consultations SET status='contacted', notes=COALESCE(notes||E'\n\n','') || $1 WHERE id=$2`,
          [`[AI Reply Sent at ${new Date().toISOString()}]\n${reply}`, consultation_id]
        );
      }

      return res.json({ reply, sent: true, sent_at: new Date().toISOString() });
    }

    res.json({ reply });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate email reply for contact
// Supports action='reply' (default) and action='reply-and-send'
router.post('/reply-contact', auth, async (req, res) => {
  try {
    const { name, email, company, subject, message, contact_id, action } = req.body;
    const prompt = `You are a professional financial advisor at Akarsu Advisory, a financial advisory firm for small businesses. Write a warm, professional email reply to a contact form submission.

Client: ${name}${company ? ` from ${company}` : ''}
Subject: ${subject || 'General inquiry'}
Their message: ${message || 'No message provided'}

Write a concise, friendly reply (3-4 paragraphs) that:
1. Thanks them for reaching out
2. Directly addresses their question or concern
3. Provides helpful initial guidance or information
4. Suggests booking a consultation for a deeper discussion

Sign off as "The Akarsu Advisory Team". Do not include subject line.`;

    const reply = await aiComplete(prompt);

    if (action === 'reply-and-send') {
      if (!email) return res.status(400).json({ error: 'Recipient email is required for reply-and-send' });

      await sendNotification(
        `Re: ${subject || 'Your Inquiry'} — Akarsu Advisory`,
        `<div style="font-family:sans-serif;max-width:600px;line-height:1.7;">
          ${reply.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('')}
        </div>`,
        email
      );

      if (contact_id) {
        await pool.query(
          `UPDATE contacts SET status='replied' WHERE id=$1`,
          [contact_id]
        );
        // Store the sent reply in a note-style column if it exists, otherwise skip gracefully
        await pool.query(
          `UPDATE contacts SET notes=COALESCE(notes||E'\n\n','') || $1 WHERE id=$2`,
          [`[AI Reply Sent at ${new Date().toISOString()}]\n${reply}`, contact_id]
        ).catch(() => {}); // notes column may not exist yet — silently ignore
      }

      return res.json({ reply, sent: true, sent_at: new Date().toISOString() });
    }

    res.json({ reply });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate insight article
router.post('/generate-insight', auth, async (req, res) => {
  try {
    const { topic, category } = req.body;
    const prompt = `You are a financial content writer for Akarsu Advisory, a financial advisory firm helping small businesses. Write a blog article about: "${topic}"

Category: ${category || 'Financial Literacy'}

Write in markdown format with:
- A compelling title
- A 1-2 sentence summary
- Article content with headers (##), bullet points, and practical advice
- Focused on small business owners
- 400-600 words
- Practical, actionable, no fluff

Return as JSON: {"title": "...", "summary": "...", "content": "...", "slug": "..."}`;

    const text = await aiComplete(prompt);
    const parsed = parseJsonFromAI(text);
    if (parsed) {
      res.json(parsed);
    } else {
      res.json({ title: topic, summary: '', content: text, slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, '-') });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Summarize/analyze data
router.post('/analyze', auth, async (req, res) => {
  try {
    const { type, data } = req.body;
    const prompt = `You are a financial advisor at Akarsu Advisory. Analyze this ${type} data and provide a brief summary with key insights and recommended actions. Be concise (3-5 bullet points).

Data: ${JSON.stringify(data)}`;
    const analysis = await aiComplete(prompt);
    res.json({ analysis });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Enhance service - generate improved description, tagline, features
router.post('/enhance-service', auth, async (req, res) => {
  try {
    const { name, tagline, description, features, action } = req.body;
    const actions = {
      'improve-description': `Rewrite and improve this financial service description for "${name}" to be more compelling, professional, and client-focused. Keep it 2-3 sentences.\n\nCurrent description: ${description || 'None provided'}\nTagline: ${tagline || 'None'}\n\nReturn ONLY the improved description text, nothing else.`,
      'generate-tagline': `Generate a short, compelling tagline (max 10 words) for a financial advisory service called "${name}".\nDescription: ${description || 'Not provided'}\n\nReturn ONLY the tagline, nothing else.`,
      'suggest-features': `Suggest 6-8 specific features/deliverables for a financial advisory service called "${name}".\nDescription: ${description || 'Not provided'}\nExisting features: ${features || 'None'}\n\nReturn as a comma-separated list. Be specific to small business financial advisory. Return ONLY the comma-separated list.`,
      'full-generate': `You are creating content for Akarsu Advisory, a financial advisory firm for small businesses. Generate complete service content for: "${name}"

Return as JSON: {"tagline": "short compelling tagline", "description": "2-3 sentence professional description", "features": "comma-separated list of 6-8 features"}`,
    };
    const prompt = `You are a professional financial advisor at Akarsu Advisory, helping small businesses. ${actions[action] || actions['improve-description']}`;
    const text = await aiComplete(prompt);
    if (action === 'full-generate') {
      const parsed = parseJsonFromAI(text);
      res.json(parsed || { result: text });
    } else {
      res.json({ result: text.trim() });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Enhance industry - generate description, challenges, approach
router.post('/enhance-industry', auth, async (req, res) => {
  try {
    const { name, description, challenges, approach, action } = req.body;
    const actions = {
      'improve-description': `Rewrite this industry description for "${name}" to be more compelling for small business owners. Keep it 2-3 sentences.\n\nCurrent: ${description || 'None'}\n\nReturn ONLY the improved description.`,
      'generate-challenges': `List the top 3-4 financial challenges that small businesses in the "${name}" industry face. Write as a flowing paragraph (not bullet points), 2-3 sentences.\n\nReturn ONLY the challenges text.`,
      'generate-approach': `Describe how a financial advisory firm would help small businesses in the "${name}" industry. Write as a flowing paragraph (not bullet points), 2-3 sentences covering specific strategies.\n\nReturn ONLY the approach text.`,
      'full-generate': `You are creating content for Akarsu Advisory. Generate complete industry page content for: "${name}"

Return as JSON: {"description": "2-3 sentence overview", "challenges": "paragraph about financial challenges", "approach": "paragraph about advisory approach"}`,
    };
    const prompt = `You are a professional financial advisor at Akarsu Advisory, helping small businesses. ${actions[action] || actions['full-generate']}`;
    const text = await aiComplete(prompt);
    if (action === 'full-generate' || !action) {
      const parsed = parseJsonFromAI(text);
      res.json(parsed || { result: text });
    } else {
      res.json({ result: text.trim() });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Enhance case study - generate/improve challenge, approach, result
router.post('/enhance-case-study', auth, async (req, res) => {
  try {
    const { title, industry, challenge, approach, result, action } = req.body;
    const actions = {
      'improve-challenge': `Rewrite this case study challenge section to be more specific and compelling:\nTitle: ${title}\nIndustry: ${industry}\nCurrent: ${challenge || 'None'}\n\nReturn ONLY the improved challenge text (2-3 sentences).`,
      'improve-approach': `Rewrite this case study approach section with specific financial advisory strategies:\nTitle: ${title}\nIndustry: ${industry}\nChallenge: ${challenge}\nCurrent: ${approach || 'None'}\n\nReturn ONLY the improved approach text (2-3 sentences).`,
      'improve-result': `Rewrite this case study result section with specific outcomes and metrics:\nTitle: ${title}\nIndustry: ${industry}\nCurrent: ${result || 'None'}\n\nReturn ONLY the improved result text with quantifiable results (2-3 sentences).`,
      'full-generate': `Generate a complete financial advisory case study for: "${title}" in the ${industry || 'small business'} industry.

Return as JSON: {"challenge": "2-3 sentences about the financial challenge", "approach": "2-3 sentences about advisory approach", "result": "2-3 sentences with specific measurable outcomes"}`,
    };
    const prompt = `You are a professional financial advisor at Akarsu Advisory, helping small businesses. ${actions[action] || actions['full-generate']}`;
    const text = await aiComplete(prompt);
    if (action === 'full-generate' || !action) {
      const parsed = parseJsonFromAI(text);
      res.json(parsed || { result: text });
    } else {
      res.json({ result: text.trim() });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Enhance testimonial - polish quote
router.post('/enhance-testimonial', auth, async (req, res) => {
  try {
    const { name, title, company, quote, action } = req.body;
    const actions = {
      'polish-quote': `Polish and improve this client testimonial quote while keeping the same sentiment and voice. Make it sound more natural and impactful.\n\nClient: ${name}, ${title} at ${company}\nOriginal quote: "${quote}"\n\nReturn ONLY the improved quote text (no quotation marks).`,
      'generate-quote': `Generate a realistic, compelling client testimonial for Akarsu Advisory from:\n${name}, ${title} at ${company}\n\nThe quote should:\n- Sound natural and specific (not generic)\n- Mention specific financial improvements or benefits\n- Be 2-3 sentences\n\nReturn ONLY the quote text (no quotation marks).`,
    };
    const prompt = `You are writing client testimonials for Akarsu Advisory, a financial advisory firm for small businesses. ${actions[action] || actions['polish-quote']}`;
    const result = await aiComplete(prompt);
    res.json({ result: result.trim().replace(/^["']|["']$/g, '') });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Enhance insight - summarize or improve content
router.post('/enhance-insight', auth, async (req, res) => {
  try {
    const { title, summary, content, action } = req.body;
    const actions = {
      'improve-summary': `Rewrite this article summary to be more compelling and SEO-friendly (1-2 sentences):\nTitle: ${title}\nCurrent summary: ${summary || 'None'}\n\nReturn ONLY the improved summary.`,
      'improve-content': `Improve and expand this financial article content. Make it more actionable, add specific examples for small business owners.\nTitle: ${title}\nCurrent content: ${content || 'None'}\n\nReturn the improved content in markdown format.`,
      'generate-seo': `Generate SEO keywords and a meta description for this financial article:\nTitle: ${title}\nSummary: ${summary}\n\nReturn as JSON: {"meta_description": "...", "keywords": ["keyword1", "keyword2", ...]}`,
    };
    const prompt = `You are a financial content writer for Akarsu Advisory, helping small businesses. ${actions[action] || actions['improve-content']}`;
    const text = await aiComplete(prompt);
    if (action === 'generate-seo') {
      const parsed = parseJsonFromAI(text);
      res.json(parsed || { result: text });
    } else {
      res.json({ result: text.trim() });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Score a lead (hot/warm/cold) using AI
// Called internally after form submission — also available as an explicit admin action
router.post('/score-lead', auth, async (req, res) => {
  try {
    const { type, id, name, company, service_interest, industry, message, subject } = req.body;
    if (!type || !id) return res.status(400).json({ error: 'type and id are required' });

    const prompt = `You are a lead scoring specialist at Akarsu Advisory, a financial advisory firm for small businesses. Evaluate this inbound lead and score them.

Lead type: ${type === 'consultation' ? 'Consultation Request' : 'Contact Form'}
Name: ${name || 'Unknown'}
Company: ${company || 'Not provided'}
${service_interest ? `Service Interest: ${service_interest}` : ''}
${industry ? `Industry: ${industry}` : ''}
${subject ? `Subject: ${subject}` : ''}
Message: ${message || 'No message provided'}

Score this lead as one of: hot, warm, or cold.
- hot: clear pain point, specific service need, likely decision-maker, budget implied
- warm: genuine interest but vague or early-stage exploration
- cold: generic inquiry, low urgency, likely researcher or competitor

Return as JSON: {
  "score": "hot|warm|cold",
  "confidence": 0-100,
  "reasoning": "1-2 sentence explanation",
  "signals": ["signal 1", "signal 2", "signal 3"]
}`;

    const text = await aiComplete(prompt, 500);
    const parsed = parseJsonFromAI(text);
    if (!parsed) return res.status(500).json({ error: 'Failed to parse AI score response' });

    // Persist the score to the DB
    const table = type === 'consultation' ? 'consultations' : 'contacts';
    await pool.query(
      `UPDATE ${table} SET lead_score=$1, lead_score_reasoning=$2, lead_scored_at=NOW() WHERE id=$3`,
      [parsed.score, JSON.stringify(parsed), id]
    ).catch(() => {}); // columns may not exist if migration not run — silently ignore

    res.json(parsed);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai/generate-proposal — draft a consulting proposal
router.post('/generate-proposal', auth, async (req, res) => {
  try {
    const { client, industry, problem, scope, durationWeeks, budget, deliverables } = req.body || {};
    const prompt = `Draft a concise consulting proposal in markdown.

Client: ${client || 'TBD'}
Industry: ${industry || 'TBD'}
Problem statement: ${problem || 'TBD'}
Scope: ${scope || 'TBD'}
Duration (weeks): ${durationWeeks || 'TBD'}
Budget: ${budget || 'TBD'}
Deliverables: ${JSON.stringify(deliverables || [])}

Sections:
1. Executive Summary
2. Understanding of the Problem
3. Approach & Methodology
4. Scope & Deliverables
5. Timeline & Milestones
6. Investment & Terms
7. Why Akarsu Advisory
8. Next Steps

Be concise and confident. Use bullets where helpful.`;
    const text = await aiComplete(prompt, 1500);
    res.json({ proposal: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/predict-engagement — predict likelihood of follow-on engagement
router.post('/predict-engagement', auth, async (req, res) => {
  try {
    const { client, history, currentEngagement, signals } = req.body || {};
    const prompt = `Predict the likelihood that the client will hire us for a follow-on engagement.

Client: ${JSON.stringify(client || {})}
Engagement history: ${JSON.stringify(history || [])}
Current engagement: ${JSON.stringify(currentEngagement || {})}
Signals: ${JSON.stringify(signals || [])}

Respond with JSON only:
{
  "engagementProbabilityPct": 0,
  "tier": "low|medium|high",
  "topReasons": ["..."],
  "risks": ["..."],
  "recommendedNextActions": ["..."]
}`;
    const text = await aiComplete(prompt, 800);
    const parsed = parseJsonFromAI(text);
    if (!parsed) return res.status(500).json({ error: 'Failed to parse AI response', raw: text });
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/generate-white-paper — draft a white paper from case study data
router.post('/generate-white-paper', auth, async (req, res) => {
  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured.' });
  }
  try {
    const { topic, audience, caseStudies, keyFindings, callToAction } = req.body || {};
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: "'topic' is required" });
    }
    const prompt = `You are a financial writer at Akarsu Advisory. Draft a thought-leadership white paper in markdown.

Topic: ${topic}
Target audience: ${audience || 'Small business owners and CFOs'}
Underlying case studies / data points: ${JSON.stringify(caseStudies || [])}
Key findings to highlight: ${keyFindings || 'Synthesize from the case studies provided.'}
Call to action: ${callToAction || 'Schedule a consultation with Akarsu Advisory.'}

Sections (in markdown):
1. Title and executive summary (3-4 sentences)
2. Industry context / why this matters
3. Methodology / data sources
4. Key findings (bullet points with brief commentary)
5. Case study highlights (1-2 short anonymized vignettes)
6. Recommendations for practitioners
7. Conclusion + call to action

Be concise, professional, and credible. Use # for the title, ## for sections.`;
    const text = await aiComplete(prompt, 1800);
    res.json({ whitePaper: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/predict-pricing — recommend a price for an advisory engagement
router.post('/predict-pricing', auth, async (req, res) => {
  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured.' });
  }
  try {
    const { service, scope, durationWeeks, clientSize, industry, complexity, comparableProjects } = req.body || {};
    if (!service || typeof service !== 'string' || !service.trim()) {
      return res.status(400).json({ error: "'service' is required" });
    }
    const prompt = `You are a pricing strategist at Akarsu Advisory, a financial advisory firm for small businesses. Recommend a price for the following engagement using market-aware reasoning.

Service: ${service}
Scope: ${scope || 'Not specified'}
Duration (weeks): ${durationWeeks || 'Not specified'}
Client size: ${clientSize || 'Small business'}
Industry: ${industry || 'General'}
Complexity: ${complexity || 'Medium'}
Comparable past projects: ${JSON.stringify(comparableProjects || [])}

Respond with JSON only:
{
  "recommendedFixedFeeUSD": { "low": 0, "target": 0, "high": 0 },
  "recommendedHourlyRateUSD": { "low": 0, "target": 0, "high": 0 },
  "recommendedRetainerMonthlyUSD": { "low": 0, "target": 0, "high": 0 },
  "primaryPricingModel": "fixed|hourly|retainer|hybrid",
  "rationale": "1-2 sentence explanation",
  "marketSignals": ["..."],
  "discountTriggers": ["..."],
  "premiumTriggers": ["..."]
}`;
    const text = await aiComplete(prompt, 900);
    const parsed = parseJsonFromAI(text);
    if (!parsed) return res.status(500).json({ error: 'Failed to parse AI response', raw: text });
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/match-consultant — match a consultant to a client's industry/challenge
router.post('/match-consultant', auth, async (req, res) => {
  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured.' });
  }
  try {
    const { clientIndustry, challenge, budget, urgency, consultants } = req.body || {};
    if (!challenge || typeof challenge !== 'string' || !challenge.trim()) {
      return res.status(400).json({ error: "'challenge' is required" });
    }
    if (!Array.isArray(consultants) || consultants.length === 0) {
      return res.status(400).json({ error: "'consultants' must be a non-empty array" });
    }
    const prompt = `You are a partner at Akarsu Advisory, matching consultants to client engagements.

Client industry: ${clientIndustry || 'General'}
Client challenge: ${challenge}
Budget range: ${budget || 'Not specified'}
Urgency: ${urgency || 'Standard'}

Available consultants:
${JSON.stringify(consultants, null, 2)}

Rank the consultants from best to worst fit. Respond with JSON only:
{
  "rankings": [
    {
      "consultantId": "id-or-name",
      "fitScore": 0,
      "strengths": ["..."],
      "concerns": ["..."],
      "recommendedRole": "lead|support|advisor|skip"
    }
  ],
  "topPickRationale": "...",
  "alternativeStaffing": "..."
}`;
    const text = await aiComplete(prompt, 1200);
    const parsed = parseJsonFromAI(text);
    if (!parsed) return res.status(500).json({ error: 'Failed to parse AI response', raw: text });
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
