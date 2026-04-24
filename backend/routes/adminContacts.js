const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    let q = 'SELECT * FROM contacts';
    const params = [];
    if (status) { params.push(status); q += ` WHERE status = $1`; }
    q += ' ORDER BY created_at DESC';
    res.json((await pool.query(q, params)).rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const r = await pool.query('UPDATE contacts SET status=$1 WHERE id=$2 RETURNING *', [status, req.params.id]);
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try { await pool.query('DELETE FROM contacts WHERE id=$1', [req.params.id]); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
