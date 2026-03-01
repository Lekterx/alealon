const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.warn('SMTP non configuré — emails désactivés');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    logger.warn(`Email non envoyé (SMTP non configuré) : ${subject}`);
    return;
  }

  try {
    await t.sendMail({
      from: `"Alé Alon" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email envoyé à ${to} : ${subject}`);
  } catch (err) {
    logger.error(`Erreur envoi email à ${to}`, err);
  }
}

async function sendSubmissionStatus({ email, eventTitle, status, reason }) {
  const isAccepted = status === 'published';
  const subject = isAccepted
    ? `Votre événement "${eventTitle}" a été publié !`
    : `Votre événement "${eventTitle}" n'a pas été retenu`;

  const html = isAccepted
    ? `<p>Bonjour,</p><p>Votre événement <strong>${eventTitle}</strong> a été validé et publié sur Alé Alon.</p><p>Merci pour votre contribution !</p><p>L'équipe Alé Alon</p>`
    : `<p>Bonjour,</p><p>Votre événement <strong>${eventTitle}</strong> n'a pas été retenu pour publication.</p>${reason ? `<p>Raison : ${reason}</p>` : ''}<p>N'hésitez pas à soumettre d'autres événements.</p><p>L'équipe Alé Alon</p>`;

  await sendEmail({ to: email, subject, html });
}

module.exports = { sendEmail, sendSubmissionStatus };
