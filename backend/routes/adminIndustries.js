const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM industries ORDER BY name')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, slug, description, challenges, approach, related_services, published } = req.body;
    const r = await pool.query(
      `INSERT INTO industries (name, slug, description, challenges, approach, related_services, published)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, slug, description, challenges, approach, JSON.stringify(related_services || []), published !== false]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, slug, description, challenges, approach, related_services, published } = req.body;
    const r = await pool.query(
      `UPDATE industries SET name=$1, slug=$2, description=$3, challenges=$4, approach=$5, related_services=$6, published=$7
       WHERE id=$8 RETURNING *`,
      [name, slug, description, challenges, approach, JSON.stringify(related_services || []), published, req.params.id]
    );
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try { await pool.query('DELETE FROM industries WHERE id=$1', [req.params.id]); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
