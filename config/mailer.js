const dns = require("dns").promises;
const nodemailer = require("nodemailer");

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);

let transporter = null;
let transporterReady = false;

async function buildTransporter() {
  // Resolve the SMTP hostname to IPv4 explicitly.
  // Render has no outbound IPv6, so we must avoid AAAA records.
  let host = SMTP_HOST;
  try {
    const addresses = await dns.resolve4(SMTP_HOST);
    if (addresses && addresses.length > 0) {
      host = addresses[0];
      console.log(`SMTP resolved ${SMTP_HOST} to IPv4 ${host}`);
    }
  } catch (err) {
    console.error("SMTP IPv4 resolve failed, falling back to hostname:", err.message);
  }

  transporter = nodemailer.createTransport({
    host,                       // IPv4 address if resolution succeeded, else hostname
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    requireTLS: SMTP_PORT === 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      // Send SNI so Gmail serves the correct certificate
      servername: SMTP_HOST,
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  transporter.verify((err) => {
    if (err) {
      console.error("SMTP verification failed:", err.message);
    } else {
      transporterReady = true;
      console.log("SMTP ready");
    }
  });
}

// Build the transporter once at startup.
buildTransporter();

async function sendMail({ to, subject, html, text }) {
  if (!transporter) {
    throw new Error("SMTP transporter not initialized");
  }
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || "Oladan Radar <no-reply@oladanradar.com>",
    to,
    subject,
    text,
    html,
  });
  return info;
}

module.exports = { sendMail };