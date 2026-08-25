/**
 * Contact form handler (Vercel serverless function).
 *
 * The site posts url-encoded form data here. Messages are delivered by email
 * through Resend. Configure two environment variables in the Vercel dashboard:
 *
 *   RESEND_API_KEY   an API key from resend.com
 *   CONTACT_TO       the address that should receive messages
 *   CONTACT_FROM     optional; defaults to Resend's shared testing sender
 *
 * Until those are set the endpoint answers 503 and the form says plainly that
 * it is not connected yet, rather than pretending a message was sent.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function readBody(req) {
  // Vercel parses json and url-encoded bodies, but fall back to parsing the
  // raw string so this works whatever the runtime hands over.
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    return Object.fromEntries(new URLSearchParams(req.body));
  }
  return {};
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const body = readBody(req);

  // Honeypot: bots fill hidden fields. Accept and discard so they see success.
  if (typeof body["bot-field"] === "string" && body["bot-field"].trim() !== "") {
    return res.status(200).json({ ok: true });
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const organization = (body.organization || "").trim();
  const message = (body.message || "").trim();
  const audience = (body.audience || "Not specified").trim();

  const invalid = [];
  if (!name) invalid.push("name");
  if (!email || !EMAIL.test(email)) invalid.push("email");
  if (!message) invalid.push("message");
  if (invalid.length) {
    return res.status(400).json({ error: "invalid", fields: invalid });
  }
  if (message.length > 5000 || name.length > 200 || organization.length > 200) {
    return res.status(400).json({ error: "too_long" });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  if (!key || !to) {
    return res.status(503).json({ error: "not_configured" });
  }

  const from = process.env.CONTACT_FROM || "QuietCart <onboarding@resend.dev>";
  const lines = [
    `From: ${name} <${email}>`,
    organization ? `Organization: ${organization}` : null,
    `They are a: ${audience}`,
    "",
    message,
  ].filter(Boolean);

  try {
    const send = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `QuietCart enquiry from ${name}`,
        text: lines.join("\n"),
      }),
    });

    if (!send.ok) {
      const detail = await send.text();
      console.error("Resend rejected the message:", send.status, detail);
      return res.status(502).json({ error: "delivery_failed" });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Could not reach the mail provider:", err);
    return res.status(502).json({ error: "delivery_failed" });
  }
};
