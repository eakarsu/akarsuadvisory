const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const [consultations, contacts, insights, caseStudies, services, industries] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM consultations'),
      pool.query('SELECT COUNT(*) FROM contacts'),
      pool.query('SELECT COUNT(*) FROM insights'),
      pool.query('SELECT COUNT(*) FROM case_studies'),
      pool.query('SELECT COUNT(*) FROM services'),
      pool.query('SELECT COUNT(*) FROM industries'),
    ]);
    const recentConsultations = await pool.query('SELECT * FROM consultations ORDER BY created_at DESC LIMIT 5');
    const recentContacts = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC LIMIT 5');
    res.json({
      stats: {
        consultations: parseInt(consultations.rows[0].count),
        contacts: parseInt(contacts.rows[0].count),
        insights: parseInt(insights.rows[0].count),
        caseStudies: parseInt(caseStudies.rows[0].count),
        services: parseInt(services.rows[0].count),
        industries: parseInt(industries.rows[0].count),
      },
      recentConsultations: recentConsultations.rows,
      recentContacts: recentContacts.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
