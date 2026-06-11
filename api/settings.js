import pkg from "pg";
const { Pool } = pkg;

const DEFAULTS = {
  prefix: ".", botName: "VK911 MINI", ownerNumber: "", timezone: "Africa/Lagos",
  antilink: "false", antispam: "true", antibot: "false", antitoxic: "false",
  welcomeMsg: "true", goodbyeMsg: "true", readMessages: "true", readStatus: "false",
  autoReact: "true", publicMode: "true", selfBot: "false", nsfwEnabled: "false",
  channelLink: "https://whatsapp.com/channel/0029VaYpQHFHXotnpcTf3C3T",
  channelName: "VK911 MINI Official", footerText: "© powered by VK911 TECH",
  maxFileSize: "100", botApiPort: "3001",
};
const USER_KEYS = ["readMessages","readStatus","autoReact","welcomeMsg"];

function getPool() {
  if (!process.env.DATABASE_URL) return null;
  return new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
}
async function ensureTable(pool) {
  await pool.query(`CREATE TABLE IF NOT EXISTS site_config (
    key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TIMESTAMP DEFAULT NOW()
  )`);
}
function decodeUserId(auth) {
  if (!auth?.startsWith("Bearer ")) return null;
  try { return Buffer.from(auth.slice(7), "base64").toString("utf-8").split(":")[0] || null; }
  catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  const params = new URLSearchParams((req.url || "").split("?")[1] || "");
  const phoneParam = params.get("phone");

  // ── GET ─────────────────────────────────────────────────────────────────
  if (req.method === "GET") {
    const pool = getPool();
    if (!pool) return res.status(200).json(DEFAULTS);
    try {
      await ensureTable(pool);
      // Global settings
      const gRows = await pool.query("SELECT key, value FROM site_config WHERE key LIKE 'setting_%'");
      const global = {};
      gRows.rows.forEach(r => { global[r.key.replace("setting_", "")] = r.value; });

      // Per-phone settings (user overrides) — only for user keys
      if (phoneParam) {
        const pRows = await pool.query("SELECT key, value FROM site_config WHERE key LIKE $1", [`usr_${phoneParam}_%`]);
        const perPhone = {};
        pRows.rows.forEach(r => { perPhone[r.key.replace(`usr_${phoneParam}_`, "")] = r.value; });
        return res.status(200).json({ ...DEFAULTS, ...global, ...perPhone, _scope: "user", _phone: phoneParam });
      }

      return res.status(200).json({ ...DEFAULTS, ...global });
    } catch { return res.status(200).json(DEFAULTS); }
    finally { await pool.end(); }
  }

  // ── POST ─────────────────────────────────────────────────────────────────
  if (req.method === "POST") {
    if (!req.headers.authorization?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
    const body = req.body || {};
    const { settings, botUrl, phone } = body;
    if (!settings || typeof settings !== "object") return res.status(400).json({ error: "settings object required" });

    const pool = getPool();
    let dbOk = false;
    if (pool) {
      try {
        await ensureTable(pool);
        for (const [key, value] of Object.entries(settings)) {
          if (phone) {
            // Per-user settings: only allow user-facing keys
            if (!USER_KEYS.includes(key)) continue;
            await pool.query(
              "INSERT INTO site_config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()",
              [`usr_${phone}_${key}`, String(value)]
            );
          } else {
            // Global/admin settings
            await pool.query(
              "INSERT INTO site_config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()",
              [`setting_${key}`, String(value)]
            );
          }
        }
        dbOk = true;
      } catch (err) { console.error("Settings DB error:", err.message); }
      finally { await pool.end(); }
    }

    // Sync to bot
    let botSynced = false, botError = null;
    const targetUrl = botUrl || (phone ? await getBotUrlForPhone(phone) : null);
    if (targetUrl) {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 8000);
        const r = await fetch(`${targetUrl}/config`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings }), signal: ctrl.signal,
        });
        clearTimeout(t);
        botSynced = r.ok;
        if (!r.ok) botError = `Bot returned ${r.status}`;
      } catch (err) { botError = err.name === "AbortError" ? "Bot timeout" : err.message; }
    }

    return res.status(200).json({
      saved: dbOk, botSynced, botError, scope: phone ? "user" : "global",
      message: botSynced ? "Settings saved and synced to bot" : dbOk ? "Settings saved to database" : "Settings not saved",
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

async function getBotUrlForPhone(phone) {
  if (!process.env.DATABASE_URL) return null;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    const r = await pool.query("SELECT bot_url FROM bot_sessions WHERE session_id = $1 AND bot_url IS NOT NULL LIMIT 1", [phone]);
    if (r.rows.length && r.rows[0].bot_url) return r.rows[0].bot_url;
    // Fall back to global bot_url
    const g = await pool.query("SELECT value FROM site_config WHERE key = 'bot_url' LIMIT 1");
    return g.rows[0]?.value || null;
  } catch { return null; }
  finally { await pool.end(); }
}
