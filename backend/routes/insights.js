const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const { category, domain } = req.query;
    let q = 'SELECT * FROM insights WHERE published = true';
    const params = [];
    if (category) { params.push(category); q += ` AND category = $${params.length}`; }
    if (domain) { params.push(domain); q += ` AND domain = $${params.length}`; }
    q += ' ORDER BY featured DESC, created_at DESC';
    const result = await pool.query(q, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM insights WHERE slug = $1 AND published = true', [req.params.slug]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
