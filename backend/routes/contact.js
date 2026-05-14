const router = require('express').Router();
const pool = require('../db');
const { sendNotification } = require('../mailer');
const { scoreLeadAsync } = require('./consultations');

router.post('/', async (req, res) => {
  try {
    const { name, email, company, phone, subject, message, website } = req.body;

    // Honeypot: bots fill in the hidden "website" field; real users leave it blank
    if (website) {
      return res.status(200).json({ ok: true });
    }

    if (!name || !email || !message) return res.status(400).json({ error: 'Name, email, and message are required' });

    const result = await pool.query(
      `INSERT INTO contacts (name, email, company, phone, subject, message) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, email, company, phone, subject, message]
    );

    const record = result.rows[0];

    sendNotification(
      `New Contact Message from ${name}`,
      `<h2>New Contact Message</h2>
       <p><strong>Name:</strong> ${name}</p>
       <p><strong>Email:</strong> ${email}</p>
       <p><strong>Company:</strong> ${company || 'N/A'}</p>
       <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
       <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
       <p><strong>Message:</strong></p>
       <pre style="white-space:pre-wrap;">${message}</pre>`,
      email
    );

    // Async lead scoring — fire and forget
    scoreLeadAsync('contact', record.id, { name, company, subject, message });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
