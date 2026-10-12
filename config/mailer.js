const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.SMTP_FROM || "Oladan Radar <onboarding@resend.dev>";

async function sendMail({ to, subject, html, text }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
    text,
  });

  if (result.error) {
    throw new Error(result.error.message || "Resend send failed");
  }

  return result.data;
}

// Log that the mailer is ready (Resend doesn't need a verify call)
if (process.env.RESEND_API_KEY) {
  console.log("SMTP ready (Resend)");
} else {
  console.error("Mailer not configured: RESEND_API_KEY is missing");
}

module.exports = { sendMail };