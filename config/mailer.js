const nodemailer = require("nodemailer");

const port = parseInt(process.env.SMTP_PORT || "587", 10);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port,
  secure: port === 465,        // true for 465, false for 587
  requireTLS: port === 587,    // enforce STARTTLS on 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // Prevent self-signed cert issues on some hosting environments
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000,    // 10s — fail fast instead of hanging
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

transporter.verify((err, success) => {
  if (err) {
    console.error("SMTP verification failed:", err.message);
  } else {
    console.log("SMTP ready");
  }
});

async function sendMail({ to, subject, html, text }) {
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || "Oladan Radar <no-reply@oladanradar.com>",
    to,
    subject,
    text,
    html,
  });
  return info;
}

module.exports = { transporter, sendMail };