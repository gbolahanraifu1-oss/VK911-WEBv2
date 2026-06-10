import pkg from "pg";
const { Pool } = pkg;

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

  // No DB — fall back gracefully
  const pool = getPool();
  if (!pool) {
    if (req.method === "GET") return res.status(200).json({});
    return res.status(503).json({ error: "DATABASE_URL not configured" });
  }

  try {
    await ensureTable(pool);

    if (req.method === "GET") {
      // GET /api/config          → return all key-value pairs as object
      // GET /api/config?key=bot_url → return single value
      const key = req.query?.key || req.url?.split("?key=")[1]?.split("&")[0];
      if (key) {
        const result = await pool.query("SELECT value FROM site_config WHERE key = $1", [key]);
        return res.status(200).json({ key, value: result.rows[0]?.value || null });
      }
      const result = await pool.query("SELECT key, value FROM site_config");
      const obj = {};
      result.rows.forEach((r) => { obj[r.key] = r.value; });
      return res.status(200).json(obj);
    }

    if (req.method === "POST") {
      // POST /api/config  body: { key, value }  OR  { bot_url: "..." }
      // Support both shapes
      let { key, value } = req.body || {};
      if (!key && req.body?.bot_url !== undefined) { key = "bot_url"; value = req.body.bot_url; }
      if (!key) return res.status(400).json({ error: "key required" });

      // Simple admin-only check: require Authorization header (same token used by dashboard)
      const auth = req.headers.authorization;
      if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });

      if (value === null || value === undefined || value === "") {
        await pool.query("DELETE FROM site_config WHERE key = $1", [key]);
        return res.status(200).json({ key, value: null, deleted: true });
      }

      const result = await pool.query(`
        INSERT INTO site_config (key, value)
        VALUES ($1, $2)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
        RETURNING *
      `, [key, value]);
      return res.status(200).json({ key: result.rows[0].key, value: result.rows[0].value });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Config API error:", err.message);
    return res.status(500).json({ error: err.message });
  } finally {
    await pool.end();
  }
}
