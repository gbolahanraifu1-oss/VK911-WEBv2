import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    // Manual body parsing fallback
    let body = req.body;
    if (!body || typeof body === "string") {
      try {
        body = JSON.parse(body || "{}");
      } catch {
        return res.status(400).json({ error: "Invalid JSON body" });
      }
    }

    const { username, password } = body;

    if (!username || !password)
      return res.status(400).json({ error: "Username and password required" });

    if (!process.env.DATABASE_URL)
      return res.status(500).json({ error: "DATABASE_URL not configured" });

    const sql = neon(process.env.DATABASE_URL);

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    const existing = await sql`SELECT COUNT(*) as count FROM users`;
    if (parseInt(existing[0].count) === 0) {
      const hash = await bcrypt.hash("admin123", 10);
      await sql`INSERT INTO users (username, password_hash, role)
        VALUES ('admin', ${hash}, 'admin') ON CONFLICT DO NOTHING`;
    }

    const users = await sql`SELECT * FROM users WHERE username = ${username}`;
    if (users.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = Buffer.from(
      `${user.id}:${user.username}:${Date.now()}:${Math.random()}`
    ).toString("base64");

    return res.status(200).json({
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}