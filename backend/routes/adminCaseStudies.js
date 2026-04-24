const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM case_studies ORDER BY created_at DESC')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, slug, industry, challenge, approach, result, metrics, published } = req.body;
    const r = await pool.query(
      `INSERT INTO case_studies (title, slug, industry, challenge, approach, result, metrics, published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, slug, industry, challenge, approach, result, JSON.stringify(metrics || {}), published !== false]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, slug, industry, challenge, approach, result, metrics, published } = req.body;
    const r = await pool.query(
      `UPDATE case_studies SET title=$1, slug=$2, industry=$3, challenge=$4, approach=$5, result=$6, metrics=$7, published=$8
       WHERE id=$9 RETURNING *`,
      [title, slug, industry, challenge, approach, result, JSON.stringify(metrics || {}), published, req.params.id]
    );
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try { await pool.query('DELETE FROM case_studies WHERE id=$1', [req.params.id]); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
