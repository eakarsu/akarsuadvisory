const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM insights ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, slug, summary, content, category, domain, published, featured } = req.body;
    const result = await pool.query(
      `INSERT INTO insights (title, slug, summary, content, category, domain, published, featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, slug, summary, content, category, domain, published || false, featured || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, slug, summary, content, category, domain, published, featured } = req.body;
    const result = await pool.query(
      `UPDATE insights SET title=$1, slug=$2, summary=$3, content=$4, category=$5, domain=$6, published=$7, featured=$8
       WHERE id=$9 RETURNING *`,
      [title, slug, summary, content, category, domain, published, featured, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM insights WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
