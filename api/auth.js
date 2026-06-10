import pkg from "pg";
import bcrypt from "bcryptjs";
const { Pool } = pkg;

export const config = { api: { bodyParser: true } };

function getPool() {
  return new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
}

async function ensureUsersTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT").catch(() => {});
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.DATABASE_URL)
    return res.status(500).json({ error: "DATABASE_URL not configured" });

  // Vercel rewrites /api/auth/login and /api/auth/signup to this handler.
  // Detect which action via original URL path.
  const url = req.url || "";
  const isSignup = url.includes("/signup");

  const pool = getPool();
  try {
    let body = req.body;
    if (!body || typeof body === "string") {
      try { body = JSON.parse(body || "{}"); } catch { return res.status(400).json({ error: "Invalid JSON" }); }
    }
    const { username, password, email } = body;
    if (!username || !password) return res.status(400).json({ error: "Username and password required" });

    await ensureUsersTable(pool);

    if (isSignup) {
      if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
      const existing = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
      if (existing.rows.length > 0) return res.status(409).json({ error: "Username already taken" });

      const hash = await bcrypt.hash(password, 10);
      const result = await pool.query(
        "INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, 'user') RETURNING id, username, role",
        [username, email || null, hash]
      );
      const user = result.rows[0];
      const token = Buffer.from(`${user.id}:${user.username}:${Date.now()}:${Math.random()}`).toString("base64");
      return res.status(201).json({ token, user: { id: user.id, username: user.username, role: user.role } });
    }

    // LOGIN
    const countRes = await pool.query("SELECT COUNT(*) as count FROM users");
    if (parseInt(countRes.rows[0].count) === 0) {
      const hash = await bcrypt.hash("admin123", 10);
      await pool.query(
        "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, 'admin') ON CONFLICT DO NOTHING",
        ["admin", hash]
      );
    }

    const userRes = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (userRes.rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = userRes.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = Buffer.from(`${user.id}:${user.username}:${Date.now()}:${Math.random()}`).toString("base64");
    return res.status(200).json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(500).json({ error: err.message });
  } finally {
    await pool.end();
  }
}
