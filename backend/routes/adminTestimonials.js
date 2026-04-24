const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM testimonials ORDER BY created_at DESC')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, title, company, quote, rating, published } = req.body;
    const r = await pool.query(
      'INSERT INTO testimonials (name, title, company, quote, rating, published) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, title, company, quote, rating || 5, published !== false]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, title, company, quote, rating, published } = req.body;
    const r = await pool.query(
      'UPDATE testimonials SET name=$1, title=$2, company=$3, quote=$4, rating=$5, published=$6 WHERE id=$7 RETURNING *',
      [name, title, company, quote, rating, published, req.params.id]
    );
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try { await pool.query('DELETE FROM testimonials WHERE id=$1', [req.params.id]); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
