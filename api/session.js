import pkg from "pg";
const { Pool } = pkg;

function getPool() {
  if (!process.env.DATABASE_URL) return null;
  return new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
}

function decodeUserId(auth) {
  if (!auth?.startsWith("Bearer ")) return null;
  try { return Buffer.from(auth.slice(7), "base64").toString("utf-8").split(":")[0] || null; }
  catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  const pool = getPool();
  if (!pool) return res.status(500).json({ error: "DATABASE_URL not configured" });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bot_sessions (
        id SERIAL PRIMARY KEY,
        session_id TEXT UNIQUE NOT NULL,
        phone_number TEXT,
        username TEXT,
        bot_url TEXT,
        status TEXT DEFAULT 'disconnected',
        last_active TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`ALTER TABLE bot_sessions ADD COLUMN IF NOT EXISTS username TEXT`).catch(() => {});
    await pool.query(`ALTER TABLE bot_sessions ADD COLUMN IF NOT EXISTS bot_url TEXT`).catch(() => {});

    const url    = req.url || "";
    const params = new URLSearchParams(url.split("?")[1] || "");
    const isUserRoute = url.includes("/user/session") || params.get("user") === "1";
    const userId = decodeUserId(req.headers.authorization);

    // ── User-scoped GET ──────────────────────────────────────────────
    if (isUserRoute && req.method === "GET") {
      if (!userId) return res.status(200).json(url.includes("/user/session") ? null : []);
      const ur = await pool.query("SELECT username FROM users WHERE id = $1", [userId]).catch(() => ({ rows: [] }));
      if (!ur.rows.length) return res.status(200).json(url.includes("/user/session") ? null : []);
      const username = ur.rows[0].username;
      const sr = await pool.query(
        "SELECT * FROM bot_sessions WHERE username = $1 ORDER BY last_active DESC", [username]
      );
      if (url.includes("/user/session")) return res.status(200).json(sr.rows[0] || null);
      return res.status(200).json(sr.rows);
    }

    // ── Admin GET: all sessions ──────────────────────────────────────
    if (req.method === "GET") {
      const result = await pool.query("SELECT * FROM bot_sessions ORDER BY last_active DESC");
      return res.status(200).json(result.rows);
    }

    // ── POST: upsert a session ───────────────────────────────────────
    if (req.method === "POST") {
      const { session_id, phone_number, username, bot_url, status } = req.body || {};
      if (!session_id) return res.status(400).json({ error: "session_id required" });
      let resolvedUsername = username || null;
      if (!resolvedUsername && userId) {
        const ur = await pool.query("SELECT username FROM users WHERE id = $1", [userId]).catch(() => ({ rows: [] }));
        if (ur.rows.length) resolvedUsername = ur.rows[0].username;
      }
      const result = await pool.query(`
        INSERT INTO bot_sessions (session_id, phone_number, username, bot_url, status)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (session_id) DO UPDATE
          SET phone_number = EXCLUDED.phone_number,
              username     = COALESCE(EXCLUDED.username, bot_sessions.username),
              bot_url      = COALESCE(EXCLUDED.bot_url, bot_sessions.bot_url),
              status       = EXCLUDED.status,
              last_active  = NOW()
        RETURNING *
      `, [session_id, phone_number || session_id, resolvedUsername, bot_url || null, status || "disconnected"]);
      return res.status(200).json(result.rows[0]);
    }

    // ── DELETE ───────────────────────────────────────────────────────
    if (req.method === "DELETE") {
      const id = params.get("id") || url.split("/").filter(Boolean).pop();
      if (!id || isNaN(id)) return res.status(400).json({ error: "numeric id required" });
      await pool.query("DELETE FROM bot_sessions WHERE id = $1", [parseInt(id)]);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    await pool.end();
  }
}
