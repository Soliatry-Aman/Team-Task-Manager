const { Resend } = require("resend");

const sendEmail = async ({ to, subject, html }) => {
  const { RESEND_API_KEY, EMAIL_FROM } = process.env;

  // Skip if no API key configured (dev mode)
  if (!RESEND_API_KEY) {
    console.warn("[sendEmail] ⚠️  RESEND_API_KEY is not set — email skipped.");
    return { sent: false, skipped: true };
  }

  const resend = new Resend(RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM || "TeamTask <onboarding@resend.dev>",
    to,
    subject,
    html,
  });

  if (error) {
    console.error("[sendEmail] ❌ Resend error:", error);
    throw new Error(error.message);
  }

  console.log(`[sendEmail] ✅ Email sent to ${to} — ID: ${data?.id}`);
  return { sent: true, skipped: false };
};

module.exports = sendEmail;
