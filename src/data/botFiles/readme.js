// VK911 XMD — Bot File Content: README.md
export const README_MD = `# VK911 XMD — WhatsApp Bot v2.0.3
## © powered by VK911 TECH

A powerful WhatsApp bot with 214+ commands built on @whiskeysockets/baileys.

---

## 📦 Quick Setup

\`\`\`bash
# 1. Navigate to bot folder
cd vk911-xmd

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
nano .env  # Fill in your values

# 4. Start the bot
node index.js

# 5. Keep alive with PM2 (recommended)
npm install -g pm2
pm2 start index.js --name vk911-xmd
pm2 save
pm2 startup
\`\`\`

---

## 📁 Folder Structure

\`\`\`
vk911-xmd/
├── index.js          ← Main entry point
├── config.js         ← Configuration  
├── .env              ← Environment variables
├── lib/
│   ├── connection.js ← Baileys connection
│   ├── handler.js    ← Plugin loader
│   ├── apiServer.js  ← HTTP API for web dashboard
│   ├── functions.js  ← Shared utilities
│   └── database.js   ← PostgreSQL (optional)
├── plugins/
│   ├── admin.js      ← 30 admin commands
│   ├── group.js      ← 25 group commands
│   ├── media.js      ← 25 media commands
│   ├── downloader.js ← 25 download commands
│   ├── fun.js        ← 30 fun commands
│   ├── ai.js         ← 20 AI commands
│   ├── utility.js    ← 25 utility commands
│   ├── info.js       ← 20 info commands
│   └── nsfw.js       ← 10 NSFW (disabled by default)
├── sessions/         ← Auto-created on first pair
└── temp/             ← Temporary media files
\`\`\`

---

## 🔌 Pairing Methods

### QR Code
Run \`node index.js\` and the QR will appear. Scan with WhatsApp → Linked Devices.

### Pairing Code (via Web Dashboard)
1. Start the bot: \`node index.js\`
2. Open the web dashboard → Web Pairing
3. Enter your phone number
4. Enter the code in WhatsApp → Linked Devices → Link with phone number

---

## 🔑 Required API Keys

Add these to your \`.env\` file:

| Key | Source | Required For |
|-----|--------|-------------|
| OPENAI_API_KEY | platform.openai.com | .ai, .gpt, .dalle, .code |
| GEMINI_API_KEY | ai.google.dev | .gemini |
| ELEVENLABS_API_KEY | elevenlabs.io | .voiceclone |
| REMOVEBG_API_KEY | remove.bg | .removebg |

---

## 🌐 Web Dashboard

The dashboard is a separate Next.js app deployed on web hosting.

1. Deploy the web folder to Vercel/Netlify/any Node.js host
2. Set environment variable: \`NEXT_PUBLIC_BOT_URL=http://your-vps:3001\`
3. The dashboard connects to your bot via the internal API on port 3001

---

## 📢 WhatsApp Channel

The bot automatically follows the VK911 XMD channel on startup.
Channel: https://whatsapp.com/channel/0029VaYpQHFHXotnpcTf3C3T

Users can view the channel via the .channel command.

---

## 🎵 Play/Media APIs

The bot uses multiple API fallbacks for media downloads:
- Primary: ytdl-core (YouTube direct)
- Secondary: api.vreden.my.id
- Tertiary: api.maher-zubair.dev

---

## ⚙️ Adding New Commands (Plugin System)

Create a new file in \`plugins/\`:

\`\`\`js
// plugins/mycommands.js
import config from '../config.js';

const myPlugins = [
  {
    cmd: 'hello',
    category: 'Custom',
    handler: async ({ reply }) => {
      await reply('Hello World! ' + config.footer);
    }
  },
];

export default myPlugins;
\`\`\`

The bot auto-loads all \`.js\` files in the plugins folder on startup!

---

## 🗄️ Database (Optional)

Set \`DATABASE_URL\` in .env for PostgreSQL storage.
Tables are auto-created on first run.

---

## 📞 Support
- Channel: https://whatsapp.com/channel/0029VaYpQHFHXotnpcTf3C3T
- Owner: As configured in .env → OWNER_NUMBER

**© powered by VK911 TECH — VK911 XMD v2.0.3**`;
