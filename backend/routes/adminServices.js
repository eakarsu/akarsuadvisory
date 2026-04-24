const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM services ORDER BY sort_order')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, slug, tagline, description, features, sort_order, published } = req.body;
    const r = await pool.query(
      `INSERT INTO services (name, slug, tagline, description, features, sort_order, published)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, slug, tagline, description, JSON.stringify(features || []), sort_order || 0, published !== false]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, slug, tagline, description, features, sort_order, published } = req.body;
    const r = await pool.query(
      `UPDATE services SET name=$1, slug=$2, tagline=$3, description=$4, features=$5, sort_order=$6, published=$7
       WHERE id=$8 RETURNING *`,
      [name, slug, tagline, description, JSON.stringify(features || []), sort_order, published, req.params.id]
    );
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try { await pool.query('DELETE FROM services WHERE id=$1', [req.params.id]); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
