export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    let body = req.body;
    if (!body || typeof body === "string") {
      try { body = JSON.parse(body || "{}"); } catch { return res.status(400).json({ error: "Invalid JSON" }); }
    }

    const { name, email, subject, message } = body;
    if (!name || !message) return res.status(400).json({ error: "Name and message are required" });

    const BOT_API_URL = process.env.BOT_API_URL || "http://localhost:3001";
    const OWNER_NUMBER = process.env.OWNER_NUMBER; // e.g. 2347001234567

    if (!OWNER_NUMBER) return res.status(500).json({ error: "OWNER_NUMBER not configured" });

    const text = `📬 *New Contact Form Message*\n\n` +
      `👤 *Name:* ${name}\n` +
      `📧 *Email:* ${email || "Not provided"}\n` +
      `📌 *Subject:* ${subject || "No subject"}\n\n` +
      `💬 *Message:*\n${message}\n\n` +
      `_Sent via VK911 XMD Web Portal_`;

    const botRes = await fetch(`${BOT_API_URL}/api/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jid: `${OWNER_NUMBER}@s.whatsapp.net`,
        message: text,
      }),
    });

    if (!botRes.ok) {
      const err = await botRes.json().catch(() => ({}));
      throw new Error(err.error || `Bot returned ${botRes.status}`);
    }

    return res.status(200).json({ success: true, message: "Message sent to WhatsApp" });
  } catch (err) {
    console.error("Contact error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}