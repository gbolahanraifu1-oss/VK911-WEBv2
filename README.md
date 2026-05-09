# VK911 XMD — Web Dashboard

React Router v7 admin dashboard for managing the VK911 XMD WhatsApp Bot.

---

## Features

- **Login** — Secure admin login (auto-creates `admin/admin123` on first run)
- **Dashboard** — Real-time bot stats, charts, session status
- **Web Pairing** — Connect your bot via QR code or pairing code
- **Commands** — Browse and search all 214+ bot commands
- **Analytics** — Message volume, command usage, error rate charts
- **Sessions** — Manage active bot sessions
- **Settings** — Bot configuration panel
- **Download** — Download individual bot source files

---

## Deployment

### Option A — Railway / Render / Fly.io (Recommended for SSR)

This is the simplest path — these platforms run Node.js servers natively.

```bash
# Railway
npm install -g @railway/cli
railway login
railway new
railway up

# OR Render — connect your GitHub repo, set:
# Build Command: npm run build
# Start Command: npm start
# Environment Variable: DATABASE_URL
```

**Default login:** `admin` / `admin123` (created automatically on first login)

---

### Option B — Vercel (with SSR)

The `vercel.json` in this folder is configured for Vercel's Node.js runtime. 
React Router v7 SSR requires the server bundle to run — not purely static hosting.

#### Steps:
1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → Add New Project → Import your repo
3. Set **Framework Preset**: `Other`
4. Leave build settings as-is (vercel.json handles them)
5. Add environment variable: `DATABASE_URL` = your Neon PostgreSQL connection string

Get a free PostgreSQL database at [neon.tech](https://neon.tech).

> Note: Vercel's server-side routing is handled by `vercel.json`. Static assets are
> served from `build/client/` and all other requests go to the React Router server bundle.

**Default login:** `admin` / `admin123` (change after first login)

---

## Local Development

```bash
npm install
cp .env.example .env
# Add your DATABASE_URL to .env

npm run dev
# Open http://localhost:5173
```

---

## Stack

- **Framework**: React Router v7 (SSR)
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Data Fetching**: TanStack Query
- **Database**: Neon PostgreSQL (serverless)
- **Auth**: localStorage-based JWT

---

## Connecting to Your Bot

On the **Web Pairing** page, set the bot URL to `http://YOUR_VPS_IP:3001`.
The bot must be running with `node index.js` on your server.

---

## Database Tables (auto-created)

- `users` — Admin accounts
- `bot_sessions` — Bot session status
- `command_usage` — Command analytics
- `message_volume` — Message rate data
- `group_settings` — Per-group settings
- `warnings` — User warnings
