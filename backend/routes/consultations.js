const router = require('express').Router();
const pool = require('../db');
const { sendNotification } = require('../mailer');

router.post('/', async (req, res) => {
  try {
    const { name, email, company, phone, service_interest, message, preferred_date, preferred_time, website } = req.body;

    // Honeypot: bots fill in the hidden "website" field; real users leave it blank
    if (website) {
      // Return 200 to fool bots, but do nothing
      return res.status(200).json({ ok: true });
    }

    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

    const result = await pool.query(
      `INSERT INTO consultations (name, email, company, phone, service_interest, message, preferred_date, preferred_time)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, email, company, phone, service_interest, message, preferred_date, preferred_time]
    );

    const record = result.rows[0];

    sendNotification(
      `New Consultation Request from ${name}`,
      `<h2>New Consultation Request</h2>
       <p><strong>Name:</strong> ${name}</p>
       <p><strong>Email:</strong> ${email}</p>
       <p><strong>Business:</strong> ${company || 'N/A'}</p>
       <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
       <p><strong>Service Interest:</strong> ${service_interest || 'N/A'}</p>
       <p><strong>Details:</strong></p>
       <pre style="white-space:pre-wrap;">${message || 'N/A'}</pre>`,
      email
    );

    // Async lead scoring — fire and forget (do not block the response)
    scoreLeadAsync('consultation', record.id, { name, company, service_interest, message });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Call the AI lead scoring endpoint internally after a new submission.
 * Runs asynchronously so it does not block the user-facing response.
 */
async function scoreLeadAsync(type, id, { name, company, service_interest, industry, message, subject } = {}) {
  try {
    const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_KEY) return;

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

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENROUTER_KEY}` },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
      }),
    });

    const data = await aiRes.json();
    const text = data.choices?.[0]?.message?.content || '';

    // Parse JSON from response
    let parsed = null;
    try { parsed = JSON.parse(text); } catch (_) {}
    if (!parsed) {
      const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fenceMatch) { try { parsed = JSON.parse(fenceMatch[1].trim()); } catch (_) {} }
    }
    if (!parsed) {
      const braceMatch = text.match(/\{[\s\S]*\}/);
      if (braceMatch) { try { parsed = JSON.parse(braceMatch[0]); } catch (_) {} }
    }

    if (parsed) {
      const table = type === 'consultation' ? 'consultations' : 'contacts';
      await pool.query(
        `UPDATE ${table} SET lead_score=$1, lead_score_reasoning=$2, lead_scored_at=NOW() WHERE id=$3`,
        [parsed.score, JSON.stringify(parsed), id]
      ).catch(() => {}); // silently ignore if columns not yet added
    }
  } catch (err) {
    console.error('Lead scoring failed:', err.message);
  }
}

module.exports = router;
module.exports.scoreLeadAsync = scoreLeadAsync;
