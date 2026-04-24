const router = require('express').Router();
const pool = require('../db');
const { sendNotification } = require('../mailer');

router.post('/', async (req, res) => {
  try {
    const { name, email, company, phone, service_interest, message, preferred_date, preferred_time } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
    const result = await pool.query(
      `INSERT INTO consultations (name, email, company, phone, service_interest, message, preferred_date, preferred_time)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, email, company, phone, service_interest, message, preferred_date, preferred_time]
    );

    sendNotification(
      `New Consultation Request from ${name}`,
      `<h2>New Consultation Request</h2>
       <p><strong>Name:</strong> ${name}</p>
       <p><strong>Email:</strong> ${email}</p>
       <p><strong>Business:</strong> ${company || 'N/A'}</p>
       <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
       <p><strong>Service Interest:</strong> ${service_interest || 'N/A'}</p>
       <p><strong>Details:</strong></p>
       <pre style="white-space:pre-wrap;">${message || 'N/A'}</pre>`,
      email
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
