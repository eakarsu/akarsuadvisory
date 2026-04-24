const router = require('express').Router();
const auth = require('../middleware/auth');

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

async function aiComplete(prompt) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENROUTER_KEY}` },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'Unable to generate response.';
}

// Generate email reply for consultation
router.post('/reply-consultation', auth, async (req, res) => {
  try {
    const { name, company, service_interest, message } = req.body;
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
    res.json({ reply });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate email reply for contact
router.post('/reply-contact', auth, async (req, res) => {
  try {
    const { name, company, subject, message } = req.body;
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
    try {
      const match = text.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match[0]);
      res.json(parsed);
    } catch {
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
      try {
        const match = text.match(/\{[\s\S]*\}/);
        res.json(JSON.parse(match[0]));
      } catch { res.json({ result: text }); }
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
      try {
        const match = text.match(/\{[\s\S]*\}/);
        res.json(JSON.parse(match[0]));
      } catch { res.json({ result: text }); }
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
      try {
        const match = text.match(/\{[\s\S]*\}/);
        res.json(JSON.parse(match[0]));
      } catch { res.json({ result: text }); }
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
      try {
        const match = text.match(/\{[\s\S]*\}/);
        res.json(JSON.parse(match[0]));
      } catch { res.json({ result: text }); }
    } else {
      res.json({ result: text.trim() });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
