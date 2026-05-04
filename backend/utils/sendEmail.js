const { Resend } = require("resend");

const sendEmail = async ({ to, subject, html }) => {
  const { RESEND_API_KEY, EMAIL_FROM } = process.env;

  // Skip if no API key configured (dev mode)
  if (!RESEND_API_KEY) {
    return { sent: false, skipped: true };
  }

  const resend = new Resend(RESEND_API_KEY);

  await resend.emails.send({
    from: EMAIL_FROM || "TeamTask <onboarding@resend.dev>",
    to,
    subject,
    html,
  });

  return { sent: true, skipped: false };
};

module.exports = sendEmail;
