const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendNotification(subject, html, extraRecipient) {
  const notifyEmail = process.env.NOTIFY_EMAIL;
  if (!notifyEmail || !process.env.SMTP_USER) return;
  const recipients = extraRecipient ? `${notifyEmail}, ${extraRecipient}` : notifyEmail;
  try {
    await transporter.sendMail({
      from: `"Akarsu Advisory" <${process.env.SMTP_USER}>`,
      to: recipients,
      subject,
      html,
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
}

module.exports = { sendNotification };
