// VK911 XMD — Bot File Content: lib files
export const LIB_CONNECTION_JS = `// VK911 XMD — WhatsApp Connection Handler (Baileys)
import { makeWASocket, DisconnectReason, useMultiFileAuthState, makeInMemoryStore, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import config from '../config.js';
import { handleMessage } from './handler.js';
import { updateSessionStatus } from './database.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SESSION_DIR = join(__dirname, '..', 'sessions', config.sessionName);

let sock = null;
let store = null;

export async function startConnection(logger) {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  store = makeInMemoryStore({ logger: logger.child({ level: 'silent', stream: 'store' }) });
  store.readFromFile(join(__dirname, '..', 'temp', 'baileys_store.json'));
  setInterval(() => store.writeToFile(join(__dirname, '..', 'temp', 'baileys_store.json')), 10000);

  sock = makeWASocket({
    version,
    logger: logger.child({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state,
    browser: ['VK911 XMD', 'Chrome', '120.0.0'],
    syncFullHistory: false,
    getMessage: async (key) => {
      const msg = await store.loadMessage(key.remoteJid, key.id);
      return msg?.message || undefined;
    },
  });

  store.bind(sock.ev);

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr, isNewLogin } = update;

    if (qr) {
      logger.info('[VK911] QR Code generated — scan or use pairing code via /api/pair/qr');
      global.currentQR = qr;
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      logger.warn(\`[VK911] Connection closed. Reconnect: \${shouldReconnect}\`);
      await updateSessionStatus(config.sessionName, 'disconnected');
      if (shouldReconnect) {
        setTimeout(() => startConnection(logger), 5000);
      } else {
        logger.error('[VK911] Logged out. Delete session folder and restart.');
      }
    }

    if (connection === 'open') {
      logger.info('[VK911] Connected to WhatsApp!');
      global.currentQR = null;
      await updateSessionStatus(config.sessionName, 'connected', sock.user?.id?.split(':')[0]);
      
      // Send startup message to owner
      const ownerJid = config.ownerNumber + '@s.whatsapp.net';
      await sock.sendMessage(ownerJid, {
        text: \`\\u2705 *VK911 XMD Connected!*\\nVersion: \${config.version}\\nPrefix: \${config.prefix}\\nMode: \${config.botMode}\\n\${config.footer}\`
      }).catch(() => {});

      // Subscribe to WhatsApp Channel newsletter if enabled
      if (config.enableNewsletter && config.channelId) {
        await sock.followNewsletter(config.channelId).catch(() => {});
        logger.info(\`[VK911] Subscribed to channel: \${config.channelName}\`);
      }
    }
  });

  // Request pairing code if not registered
  if (!state.creds.registered) {
    logger.info('[VK911] Use /api/pair/code endpoint or scan QR to pair');
  }

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (!msg.message) continue;
      try {
        await handleMessage(sock, msg, store);
      } catch (err) {
        logger.error('[VK911] Message handler error:', err);
      }
    }
  });

  // Group participants update
  sock.ev.on('group-participants.update', async (update) => {
    const { id, participants, action } = update;
    try {
      const groupMeta = await sock.groupMetadata(id);
      for (const participant of participants) {
        if (action === 'add' && config.enableWelcome) {
          const welcome = \`\\u{1F44B} Welcome @\${participant.split('@')[0]} to *\${groupMeta.subject}*!\\n\\nWe're happy to have you here.\\n\${config.footer}\`;
          await sock.sendMessage(id, { text: welcome, mentions: [participant] });
        }
        if (action === 'remove' && config.enableGoodbye) {
          await sock.sendMessage(id, { text: \`\\u{1F44B} Goodbye @\${participant.split('@')[0]}! We'll miss you.\\n\${config.footer}\`, mentions: [participant] });
        }
      }
    } catch (err) {}
  });

  global.sock = sock;
  return sock;
}

export { sock, store };`;

export const LIB_HANDLER_JS = `// VK911 XMD — Plugin Loader & Message Handler
import fs from 'fs-extra';
import { join } from 'path';
import config from '../config.js';
import { recordCommandUsage, recordMessage } from './database.js';

const plugins = new Map();

export async function loadPlugins(pluginsDir) {
  const files = await fs.readdir(pluginsDir).catch(() => []);
  let total = 0;
  for (const file of files.filter(f => f.endsWith('.js'))) {
    try {
      const mod = await import(join(pluginsDir, file));
      const cmds = mod.default || [];
      for (const cmd of cmds) {
        plugins.set(cmd.cmd, cmd);
        total++;
      }
      console.log(\`[Plugins] Loaded: \${file} (\${cmds.length} commands)\`);
    } catch (err) {
      console.error(\`[Plugins] Failed to load \${file}:\`, err.message);
    }
  }
  console.log(\`[Plugins] Total: \${total} commands loaded\`);
}

export async function handleMessage(sock, msg, store) {
  const from = msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');
  const sender = isGroup ? msg.key.participant : msg.key.remoteJid;
  const body = (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    msg.message?.buttonsResponseMessage?.selectedButtonId ||
    msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
    ''
  );

  // Record message volume
  await recordMessage().catch(() => {});

  // Read message if enabled
  if (config.enableReadMsg) {
    await sock.readMessages([msg.key]).catch(() => {});
  }

  if (!body.startsWith(config.prefix)) return;

  const [rawCmd, ...args] = body.slice(config.prefix.length).trim().split(' ');
  const cmd = rawCmd.toLowerCase();
  const text = args.join(' ');
  const isOwner = sender?.startsWith(config.ownerNumber) || config.coOwner.some(o => sender?.startsWith(o));

  const plugin = plugins.get(cmd);
  if (!plugin) return;

  // Access control
  if (plugin.ownerOnly && !isOwner) {
    return sock.sendMessage(from, { text: '\\u26D4 This command is for the bot owner only.' });
  }
  if (plugin.adminOnly && isGroup) {
    const groupMeta = await sock.groupMetadata(from).catch(() => null);
    const isAdmin = groupMeta?.participants.find(p => p.id === sender)?.admin;
    if (!isAdmin) return sock.sendMessage(from, { text: '\\u26D4 This command is for group admins only.' });
  }
  if (plugin.nsfwOnly && !config.enableNsfw) {
    return sock.sendMessage(from, { text: '\\u26D4 NSFW commands are disabled.' });
  }

  // Auto react
  if (config.enableAutoReact) {
    await sock.sendMessage(from, { react: { text: '\\u23F3', key: msg.key } }).catch(() => {});
  }

  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const reply = async (text) => sock.sendMessage(from, { text }, { quoted: msg });

  try {
    await plugin.handler({ sock, msg, from, sender, isGroup, isOwner, body, cmd, text, args, quoted, reply, store, config });

    // Success react
    if (config.enableAutoReact) {
      await sock.sendMessage(from, { react: { text: '\\u2705', key: msg.key } }).catch(() => {});
    }

    await recordCommandUsage(cmd, plugin.category || 'Unknown', true).catch(() => {});
  } catch (err) {
    console.error(\`[Handler] Command \${cmd} error:\`, err);
    await reply(\`\\u274C Error: \${err.message || 'Something went wrong'}\`).catch(() => {});
    await recordCommandUsage(cmd, plugin.category || 'Unknown', false).catch(() => {});
  }
}`;

export const LIB_API_SERVER_JS = `// VK911 XMD — Internal HTTP API Server
// Used by the web dashboard for pairing & stats
import express from 'express';
import cors from 'cors';
import QRCode from 'qrcode';
import config from '../config.js';

let pairingCode = null;

export async function startApiServer(port) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Bot status
  app.get('/api/status', (req, res) => {
    const connected = global.sock?.user != null;
    res.json({ connected, version: config.version, prefix: config.prefix, user: global.sock?.user });
  });

  // Get QR code as data URL
  app.get('/api/pair/qr', async (req, res) => {
    if (!global.currentQR) return res.status(404).json({ error: 'No QR available. Bot may already be connected.' });
    try {
      const qr = await QRCode.toDataURL(global.currentQR, { width: 300, margin: 2 });
      res.json({ qr: global.currentQR, qrImage: qr });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Request pairing code
  app.post('/api/pair/code', async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number required' });
    if (!global.sock) return res.status(503).json({ error: 'Bot not initialized' });
    try {
      const code = await global.sock.requestPairingCode(phone.replace(/\\D/g, ''));
      pairingCode = code;
      res.json({ code });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Session info
  app.get('/api/session', (req, res) => {
    res.json({ sessionName: config.sessionName, connected: global.sock?.user != null, user: global.sock?.user });
  });

  app.listen(port, () => console.log(\`[VK911 API] Running on port \${port}\`));
}`;

export const LIB_FUNCTIONS_JS = `// VK911 XMD — Shared Utility Functions
import fs from 'fs-extra';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import config from '../config.js';

ffmpeg.setFfmpegPath(ffmpegPath);

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMP = join(__dirname, '..', 'temp');

// Download buffer from URL
export async function getBuffer(url, options = {}) {
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000, ...options });
  return Buffer.from(res.data);
}

// Download file to temp folder
export async function downloadFile(url, filename) {
  const filePath = join(TEMP, filename);
  const res = await axios.get(url, { responseType: 'stream', timeout: 60000 });
  const writer = fs.createWriteStream(filePath);
  res.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(filePath));
    writer.on('error', reject);
  });
}

// Convert to audio using ffmpeg
export async function toAudio(input, codec = 'libopus') {
  const output = input.replace(/\\.[^/.]+$/, '.ogg');
  return new Promise((resolve, reject) => {
    ffmpeg(input).audioCodec(codec).save(output)
      .on('end', () => resolve(output))
      .on('error', reject);
  });
}

// Convert video to mp4
export async function toMp4(input) {
  const output = input.replace(/\\.[^/.]+$/, '.mp4');
  return new Promise((resolve, reject) => {
    ffmpeg(input).videoCodec('libx264').audioCodec('aac').save(output)
      .on('end', () => resolve(output))
      .on('error', reject);
  });
}

// Extract audio from video
export async function extractAudio(input) {
  const output = input.replace(/\\.[^/.]+$/, '_audio.mp3');
  return new Promise((resolve, reject) => {
    ffmpeg(input).noVideo().audioCodec('libmp3lame').save(output)
      .on('end', () => resolve(output))
      .on('error', reject);
  });
}

// Send media with caption
export async function sendMedia(sock, jid, buffer, mimetype, caption = '', quoted = null) {
  const opts = { quoted };
  if (mimetype.startsWith('image/')) return sock.sendMessage(jid, { image: buffer, caption, ...opts });
  if (mimetype.startsWith('video/')) return sock.sendMessage(jid, { video: buffer, caption, ...opts });
  if (mimetype.startsWith('audio/')) return sock.sendMessage(jid, { audio: buffer, mimetype: 'audio/mpeg', ...opts });
  return sock.sendMessage(jid, { document: buffer, mimetype, caption, ...opts });
}

// Format bytes to human readable
export function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1073741824).toFixed(1) + ' GB';
}

// Format uptime
export function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  return \`\${d}d \${h % 24}h \${m % 60}m \${s % 60}s\`;
}

// Clean temp files older than 1 hour
export async function cleanTemp() {
  const files = await fs.readdir(TEMP).catch(() => []);
  const now = Date.now();
  for (const file of files) {
    const filePath = join(TEMP, file);
    const stat = await fs.stat(filePath).catch(() => null);
    if (stat && now - stat.mtime.getTime() > 3600000) {
      await fs.remove(filePath).catch(() => {});
    }
  }
}

// Run cleanup every hour
setInterval(cleanTemp, 3600000);`;

export const LIB_DATABASE_JS = `// VK911 XMD — Database Handler (PostgreSQL)
import pg from 'pg';
import config from '../config.js';

const { Pool } = pg;
let pool = null;

if (config.databaseUrl) {
  pool = new Pool({ connectionString: config.databaseUrl });
  pool.connect()
    .then(() => console.log('[VK911 DB] Connected to PostgreSQL'))
    .catch(err => console.error('[VK911 DB] Connection failed:', err.message));
}

export async function initDatabase() {
  if (!pool) return;
  await pool.query(\`
    CREATE TABLE IF NOT EXISTS bot_sessions (
      id SERIAL PRIMARY KEY, session_id TEXT UNIQUE NOT NULL,
      phone_number TEXT, status TEXT DEFAULT 'disconnected',
      last_active TIMESTAMP DEFAULT NOW(), created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS command_usage (
      id SERIAL PRIMARY KEY, command_name TEXT NOT NULL, category TEXT NOT NULL,
      used_at TIMESTAMP DEFAULT NOW(), success BOOLEAN DEFAULT true
    );
    CREATE TABLE IF NOT EXISTS message_volume (
      id SERIAL PRIMARY KEY, timestamp TIMESTAMP DEFAULT NOW(), count INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS group_settings (
      id SERIAL PRIMARY KEY, group_id TEXT UNIQUE NOT NULL,
      antilink BOOLEAN DEFAULT false, antispam BOOLEAN DEFAULT true,
      antibot BOOLEAN DEFAULT false, welcome BOOLEAN DEFAULT true,
      goodbye BOOLEAN DEFAULT true, nsfw BOOLEAN DEFAULT false,
      warn_limit INTEGER DEFAULT 3, muted BOOLEAN DEFAULT false
    );
    CREATE TABLE IF NOT EXISTS warnings (
      id SERIAL PRIMARY KEY, group_id TEXT NOT NULL, user_id TEXT NOT NULL,
      reason TEXT, warned_at TIMESTAMP DEFAULT NOW()
    );
  \`);
}

export async function recordCommandUsage(cmd, category, success = true) {
  if (!pool) return;
  await pool.query('INSERT INTO command_usage (command_name, category, success) VALUES ($1, $2, $3)', [cmd, category, success]);
}

export async function recordMessage() {
  if (!pool) return;
  await pool.query('INSERT INTO message_volume (count) VALUES (1)');
}

export async function updateSessionStatus(sessionId, status, phone = null) {
  if (!pool) return;
  await pool.query(
    'INSERT INTO bot_sessions (session_id, phone_number, status) VALUES ($1, $2, $3) ON CONFLICT (session_id) DO UPDATE SET status = $3, phone_number = COALESCE($2, bot_sessions.phone_number), last_active = NOW()',
    [sessionId, phone, status]
  );
}

export async function getGroupSettings(groupId) {
  if (!pool) return {};
  const res = await pool.query('SELECT * FROM group_settings WHERE group_id = $1', [groupId]);
  return res.rows[0] || {};
}

export async function setGroupSetting(groupId, key, value) {
  if (!pool) return;
  await pool.query(
    \`INSERT INTO group_settings (group_id, \${key}) VALUES ($1, $2) ON CONFLICT (group_id) DO UPDATE SET \${key} = $2\`,
    [groupId, value]
  );
}`;
