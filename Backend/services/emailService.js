const nodemailer = require('nodemailer');

let cachedTransporter = null;

function buildTransporterFromEnv() {
  if (cachedTransporter) return cachedTransporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (!SMTP_HOST || !SMTP_PORT) {
    console.warn('Email disabled: SMTP_HOST/SMTP_PORT not configured');
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_SECURE || '').toLowerCase() === 'true' || Number(SMTP_PORT) === 465,
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });

  cachedTransporter = transporter;
  return transporter;
}

async function sendEmail({ subject, text }) {
  const transporter = buildTransporterFromEnv();
  if (!transporter) return { skipped: true };

  const from = process.env.ALERT_EMAIL_FROM || process.env.SMTP_USER;
  const to = process.env.ALERT_EMAIL_TO;

  if (!from || !to) {
    console.warn('Email disabled: ALERT_EMAIL_FROM/ALERT_EMAIL_TO not configured');
    return { skipped: true };
  }

  return transporter.sendMail({ from, to, subject, text });
}

function formatLowStockMessage({ productName, category, quantity }) {
  return [
    `Product Name: ${productName}`,
    `Product Category: ${category}`,
    `Message: Low stock alert! Only ${quantity} quantity left!`,
  ].join('\n');
}

function formatOutOfStockMessage({ productName, category }) {
  return [
    `Product Name: ${productName}`,
    `Product Category: ${category}`,
    `Message: Out of stock!`,
  ].join('\n');
}

async function sendLowStockAlert({ productName, category, quantity }) {
  const subject = `Low stock: ${productName} (${quantity} left)`;
  const text = formatLowStockMessage({ productName, category, quantity });
  return sendEmail({ subject, text });
}

async function sendOutOfStockAlert({ productName, category }) {
  const subject = `Out of stock: ${productName}`;
  const text = formatOutOfStockMessage({ productName, category });
  return sendEmail({ subject, text });
}

module.exports = {
  sendLowStockAlert,
  sendOutOfStockAlert,
};


