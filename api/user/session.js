import pkg from "pg";
const { Pool } = pkg;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });

  if (!process.env.DATABASE_URL) return res.status(200).json(null);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    // Decode token to get user id
    const token = auth.slice(7);
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const userId = decoded.split(":")[0];

    // Get user info to find their session
    const userRes = await pool.query("SELECT username FROM users WHERE id = $1", [userId]).catch(() => ({ rows: [] }));
    if (!userRes.rows.length) return res.status(200).json(null);

    const username = userRes.rows[0].username;

    // Find their session
    const sessionRes = await pool.query(
      "SELECT * FROM bot_sessions WHERE session_id = $1 ORDER BY last_active DESC LIMIT 1",
      [username]
    ).catch(() => ({ rows: [] }));

    return res.status(200).json(sessionRes.rows[0] || null);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    await pool.end();
  }
}
