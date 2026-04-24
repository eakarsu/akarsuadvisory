const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.json([]);
    const term = `%${q.trim()}%`;

    const [insights, cases, industries, services] = await Promise.all([
      pool.query(
        `SELECT id, title, slug, summary, category, 'insight' as type FROM insights
         WHERE published = true AND (title ILIKE $1 OR summary ILIKE $1 OR content ILIKE $1 OR category ILIKE $1)
         LIMIT 5`, [term]
      ),
      pool.query(
        `SELECT id, title, slug, industry, 'case_study' as type FROM case_studies
         WHERE published = true AND (title ILIKE $1 OR industry ILIKE $1 OR challenge ILIKE $1 OR result ILIKE $1)
         LIMIT 5`, [term]
      ),
      pool.query(
        `SELECT id, name as title, slug, description as summary, 'industry' as type FROM industries
         WHERE published = true AND (name ILIKE $1 OR description ILIKE $1)
         LIMIT 5`, [term]
      ),
      pool.query(
        `SELECT id, name as title, slug, tagline as summary, 'service' as type FROM services
         WHERE published = true AND (name ILIKE $1 OR tagline ILIKE $1 OR description ILIKE $1)
         LIMIT 5`, [term]
      ),
    ]);

    res.json([...insights.rows, ...cases.rows, ...industries.rows, ...services.rows]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
