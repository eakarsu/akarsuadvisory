/**
 * Scheduled Insights Pipeline
 *
 * POST /api/admin/run-scheduled-insights
 *
 * Reads insights with status='queued' from the scheduled_insights table,
 * calls OpenRouter to generate the full article for each topic,
 * then inserts the result into the insights table as a draft (published=false).
 *
 * The scheduled_insights table is created lazily on first request if it
 * does not already exist.
 *
 * Intended to be called by an external cron job (e.g. a docker cron, Render
 * scheduled job, or GitHub Actions workflow) that hits this endpoint with the
 * admin JWT in the Authorization header.
 */

const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

async function aiComplete(prompt, maxTokens = 1500) {
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
  return data.choices?.[0]?.message?.content || '';
}

function parseJsonFromAI(text) {
  try { return JSON.parse(text); } catch (_) {}
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) { try { return JSON.parse(fenceMatch[1].trim()); } catch (_) {} }
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) { try { return JSON.parse(braceMatch[0]); } catch (_) {} }
  return null;
}

async function ensureTables(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS scheduled_insights (
      id SERIAL PRIMARY KEY,
      topic VARCHAR(500) NOT NULL,
      category VARCHAR(100),
      status VARCHAR(50) DEFAULT 'queued',
      result_insight_id INT,
      error TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      processed_at TIMESTAMP
    )
  `);
}

router.post('/run-scheduled-insights', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await ensureTables(client);

    // Fetch all queued items, process up to 10 at a time to avoid timeout
    const { rows: queued } = await client.query(
      `SELECT * FROM scheduled_insights WHERE status='queued' ORDER BY created_at ASC LIMIT 10`
    );

    if (queued.length === 0) {
      return res.json({ processed: 0, message: 'No queued insights found.' });
    }

    const results = [];

    for (const item of queued) {
      // Mark as processing to prevent duplicate runs
      await client.query(
        `UPDATE scheduled_insights SET status='processing' WHERE id=$1`,
        [item.id]
      );

      try {
        const prompt = `You are a financial content writer for Akarsu Advisory, a financial advisory firm helping small businesses. Write a blog article about: "${item.topic}"

Category: ${item.category || 'Financial Literacy'}

Write in markdown format with:
- A compelling title
- A 1-2 sentence summary
- Article content with headers (##), bullet points, and practical advice
- Focused on small business owners
- 400-600 words
- Practical, actionable, no fluff

Return as JSON: {"title": "...", "summary": "...", "content": "...", "slug": "..."}`;

        const text = await aiComplete(prompt, 1500);
        const parsed = parseJsonFromAI(text);

        let title, summary, content, slug;
        if (parsed) {
          ({ title, summary, content, slug } = parsed);
        } else {
          title = item.topic;
          summary = '';
          content = text;
          slug = item.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        }

        // Ensure slug uniqueness by appending ID if needed
        const existing = await client.query('SELECT id FROM insights WHERE slug=$1', [slug]);
        if (existing.rows.length > 0) {
          slug = `${slug}-${item.id}`;
        }

        // Insert as draft insight
        const insightResult = await client.query(
          `INSERT INTO insights (title, slug, summary, content, category, published, featured)
           VALUES ($1,$2,$3,$4,$5,false,false) RETURNING id`,
          [title, slug, summary, content, item.category || 'Financial Literacy']
        );

        const insightId = insightResult.rows[0].id;

        await client.query(
          `UPDATE scheduled_insights SET status='done', result_insight_id=$1, processed_at=NOW() WHERE id=$2`,
          [insightId, item.id]
        );

        results.push({ topic: item.topic, status: 'done', insight_id: insightId, title });
      } catch (itemErr) {
        await client.query(
          `UPDATE scheduled_insights SET status='error', error=$1, processed_at=NOW() WHERE id=$2`,
          [itemErr.message, item.id]
        );
        results.push({ topic: item.topic, status: 'error', error: itemErr.message });
      }
    }

    res.json({ processed: results.length, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Also expose a simple endpoint to queue a new scheduled insight topic
router.post('/queue-insight', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await ensureTables(client);
    const { topic, category } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required' });
    const result = await client.query(
      `INSERT INTO scheduled_insights (topic, category) VALUES ($1,$2) RETURNING *`,
      [topic, category || 'Financial Literacy']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// List scheduled insights (for admin UI)
router.get('/scheduled-insights', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await ensureTables(client);
    const { rows } = await client.query('SELECT * FROM scheduled_insights ORDER BY created_at DESC LIMIT 100');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
