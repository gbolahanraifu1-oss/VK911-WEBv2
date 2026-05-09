import sql from "@/app/api/utils/sql";
import bcrypt from "bcryptjs";

export async function action({ request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return Response.json(
        { error: "Username and password required" },
        { status: 400 }
      );
    }

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
      await sql`INSERT INTO users (username, password_hash, role) VALUES ('admin', ${hash}, 'admin') ON CONFLICT DO NOTHING`;
    }

    const users = await sql`SELECT * FROM users WHERE username = ${username}`;
    if (users.length === 0) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = Buffer.from(
      `${user.id}:${user.username}:${Date.now()}:${Math.random()}`
    ).toString("base64");

    return Response.json({
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}