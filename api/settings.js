import pkg from "pg";
const { Pool } = pkg;

const DEFAULTS = {
  prefix: ".",
  botName: "VK911 MINI",
  ownerNumber: "",
  timezone: "Africa/Lagos",
  antilink: "false",
  antispam: "true",
  antibot: "false",
  antitoxic: "false",
  welcomeMsg: "true",
  goodbyeMsg: "true",
  readMessages: "true",
  readStatus: "false",
  autoReact: "true",
  publicMode: "true",
  selfBot: "false",
  nsfwEnabled: "false",
  channelLink: "https://whatsapp.com/channel/0029VaYpQHFHXotnpcTf3C3T",
  channelName: "VK911 MINI Official",
  footerText: "© powered by VK911 TECH",
  maxFileSize: "100",
  botApiPort: "3001",
};

function getPool() {
  if (!process.env.DATABASE_URL) return null;
  return new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
}

async function ensureTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  // ── GET ──
  if (req.method === "GET") {
    const pool = getPool();
    if (!pool) return res.status(200).json(DEFAULTS);
    try {
      await ensureTable(pool);
      const result = await pool.query("SELECT key, value FROM site_config WHERE key LIKE 'setting_%'");
      const saved = {};
      result.rows.forEach((r) => { saved[r.key.replace("setting_", "")] = r.value; });
      return res.status(200).json({ ...DEFAULTS, ...saved });
    } catch (err) {
      return res.status(200).json(DEFAULTS);
    } finally {
      await pool.end();
    }
  }

  // ── POST ──
  if (req.method === "POST") {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });

    const body = req.body || {};
    const { settings, botUrl } = body;
    if (!settings || typeof settings !== "object") {
      return res.status(400).json({ error: "settings object required" });
    }

    // Save to DB
    let dbOk = false;
    const pool = getPool();
    if (pool) {
      try {
        await ensureTable(pool);
        for (const [key, value] of Object.entries(settings)) {
          await pool.query(`
            INSERT INTO site_config (key, value)
            VALUES ($1, $2)
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
          `, [`setting_${key}`, String(value)]);
        }
        dbOk = true;
      } catch (err) {
        console.error("Settings DB error:", err.message);
      } finally {
        await pool.end();
      }
    }

    // Try to sync to bot's /config endpoint
    let botSynced = false;
    let botError = null;
    if (botUrl) {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 8000);
        const botRes = await fetch(`${botUrl}/config`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings }),
          signal: ctrl.signal,
        });
        clearTimeout(t);
        botSynced = botRes.ok;
        if (!botRes.ok) botError = `Bot returned ${botRes.status}`;
      } catch (err) {
        botError = err.name === "AbortError" ? "Bot timeout" : err.message;
      }
    }

    return res.status(200).json({
      saved: dbOk || !pool,
      botSynced,
      botError,
      message: botSynced
        ? "Settings saved and synced to bot"
        : dbOk
        ? "Settings saved to database (bot not synced — bot needs /config endpoint)"
        : "Settings saved locally",
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
