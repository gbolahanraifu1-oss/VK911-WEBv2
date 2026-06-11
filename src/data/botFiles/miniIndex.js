// VK911 MINI XMD — Fixed index.js
// Auto-generated — contains closeSession() for clean pairing
export const MINI_INDEX_JS = `/**
 * VK911 MINI XMD - Main Entry Point
 * Session Isolation: each paired user gets their own sessions/<phone>/ folder
 */
process.env.PUPPETEER_SKIP_DOWNLOAD          = 'true';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
process.env.PUPPETEER_CACHE_DIR              = '/tmp/puppeteer_cache_disabled';

const { initializeTempSystem } = require('./utils/tempManager');
const { startCleanup }         = require('./utils/cleanup');
initializeTempSystem();
startCleanup();

// ── Console filter — suppress Baileys internal noise ─────────────────────────
const _log = console.log.bind(console), _error = console.error.bind(console), _warn = console.warn.bind(console);
const NOISE = ['closing session','sessionentry','prekey bundle','pendingprekey','_chains',
               'registrationid','currentratchet','chainkey','ratchet','signal protocol',
               'ephemeralkeypair','indexinfo','basekey'];
const isNoisy = (...a) => a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' ').toLowerCase().split('').some
  ? NOISE.some(p => a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' ').toLowerCase().includes(p))
  : false;
console.log   = (...a) => { if (!isNoisy(...a)) _log(...a);   };
console.error = (...a) => { if (!isNoisy(...a)) _error(...a); };
console.warn  = (...a) => { if (!isNoisy(...a)) _warn(...a);  };

const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');

const config  = require('./config');
const handler = require('./handler');
const fs      = require('fs');
const path    = require('path');
const os      = require('os');

// ── Sessions root folder ──────────────────────────────────────────────────────
const SESSIONS_ROOT = path.join(__dirname, 'sessions');
if (!fs.existsSync(SESSIONS_ROOT)) fs.mkdirSync(SESSIONS_ROOT, { recursive: true });

function getSessionDir(phone) {
  const dir = path.join(SESSIONS_ROOT, phone);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// ── Active sessions store: phone → { sock, tgChatId, retries } ───────────────
const activeSessions = new Map();

// ── In-memory message store ───────────────────────────────────────────────────
function createStore() {
  const messages = new Map();
  return {
    messages,
    bind: (ev) => {
      ev.on('messages.upsert', ({ messages: msgs }) => {
        for (const msg of msgs) {
          if (!msg.key?.id) continue;
          const jid = msg.key.remoteJid;
          if (!messages.has(jid)) messages.set(jid, new Map());
          const chat = messages.get(jid);
          chat.set(msg.key.id, msg);
          if (chat.size > 10) chat.delete(chat.keys().next().value);
        }
      });
    },
    loadMessage: async (jid, id) => messages.get(jid)?.get(id) || null
  };
}

// ── Silent pino logger ────────────────────────────────────────────────────────
const createLogger = () => {
  try { return pino({ level: 'silent' }); }
  catch { return { info:()=>{}, error:()=>{}, warn:()=>{}, debug:()=>{}, trace:()=>{}, child:()=>createLogger() }; }
};

// ── Small-caps helper ─────────────────────────────────────────────────────────
function sc(str) {
  const m = {a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
  return String(str).toLowerCase().split('').map(c => m[c] || c).join('');
}

function cleanupPuppeteerCache() {
  try {
    const dir = path.join(os.homedir(), '.cache', 'puppeteer');
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

// ── Per-session dedup maps: phone → Set<msgId> ────────────────────────────────
const _sessionProcessed = new Map();
setInterval(() => {
  for (const [, set] of _sessionProcessed) set.clear();
}, 5 * 60 * 1000);

// ── Cache Baileys version at startup — don't fetch on every reconnect ──────────
let _cachedBaileysVersion = null;
async function getBaileysVersion() {
  if (_cachedBaileysVersion) return _cachedBaileysVersion;
  try {
    const { version } = await fetchLatestBaileysVersion();
    _cachedBaileysVersion = version;
    console.log('[Baileys] version cached:', version.join('.'));
    return version;
  } catch {
    _cachedBaileysVersion = [2, 3000, 1015901307]; // fallback
    return _cachedBaileysVersion;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// startBotForUser(phone, tgChatId)
// Creates an isolated WhatsApp connection for the given phone number.
// Session files live in: sessions/<phone>/
// ═════════════════════════════════════════════════════════════════════════════
async function startBotForUser(phone, tgChatId) {
  // If already active, just return existing sock
  if (activeSessions.has(phone)) {
    const existing = activeSessions.get(phone);
    if (existing.sock?.ws?.readyState === 1) {
      console.log(\`[\${phone}] Already connected, skipping duplicate start.\`);
      return existing.sock;
    }
  }

  const sessionDir           = getSessionDir(phone);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const version              = await getBaileysVersion();

  console.log(\`[\${phone}] Starting isolated session in sessions/\${phone}/\`);

  const sock = makeWASocket({
    version,
    logger: createLogger(),
    printQRInTerminal:      false,
    browser:                Browsers.ubuntu('Chrome'),
    auth: {
      creds: state.creds,
      keys:  makeCacheableSignalKeyStore(state.keys, createLogger())
    },
    syncFullHistory:        false,
    downloadHistory:        false,
    markOnlineOnConnect:    false,
    getMessage:             async () => undefined,
    // ── Keep the WS connection alive between messages ──
    keepAliveIntervalMs:    10_000,
    connectTimeoutMs:       60_000,
    defaultQueryTimeoutMs:  60_000,
    retryRequestDelayMs:    250,
  });

  const store = createStore();
  store.bind(sock.ev);

  // Track this session
  activeSessions.set(phone, { sock, tgChatId, retries: 0 });

  // ── Connection events ───────────────────────────────────────────────────────
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      const session = activeSessions.get(phone) || {};
      session.retries = 0;
      activeSessions.set(phone, { ...session, sock, tgChatId });

      const connectedNum = sock.user.id.split(':')[0];
      const timeStr      = new Date().toLocaleString('en-GB', {
        timeZone: config.timezone || 'Africa/Lagos', hour12: true
      });

      console.log(\`[\${phone}] ✅ Connected as \${connectedNum}\`);

      // ── WhatsApp connection notice — first pair only ────────────────────────
      const connectedJid  = connectedNum + '@s.whatsapp.net';
      const ownerJid      = config.ownerNumber[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      const fs            = require('fs');
      const path          = require('path');
      const flagFile      = path.join(process.cwd(), 'sessions', phone, '.connected');
      const isFirstPair   = !fs.existsSync(flagFile);

      if (isFirstPair) {
        try { fs.mkdirSync(path.dirname(flagFile), { recursive: true }); } catch {}
        try { fs.writeFileSync(flagFile, Date.now().toString()); } catch {}

        const noticeText =
          \`*╭┈───〔 VK911 MINI XMD 〕┈───⊷*\\n\` +
          \`*├▢ ✅ \${sc('status')}:* Connected\\n\` +
          \`*├▢ 📱 \${sc('number')}:* \${connectedNum}\\n\` +
          \`*├▢ 👑 \${sc('owner')}:* \${config.ownerName[0]}\\n\` +
          \`*├▢ ⚡ \${sc('prefix')}:* \${config.prefix}\\n\` +
          \`*├▢ 🕐 \${sc('time')}:* \${timeStr}\\n\` +
          \`*╰───────────────────⊷*\\n\\n\` +
          \`> _\${config.botName} is ready — type .menu for commands_\`;

        try { await sock.sendMessage(connectedJid, { text: noticeText }); } catch {}
        if (connectedJid !== ownerJid) {
          try { await sock.sendMessage(ownerJid, { text: noticeText }); } catch {}
        }
      }

      if (config.autoBio) {
        try { await sock.updateProfileStatus(\`\${config.botName} | Active 24/7\`); } catch {}
      }
      handler.initializeAntiCall(sock);

      // ── Keepalive: prevent server from killing idle connection ──────────────
      // Sends presence update every 25s to keep the WS alive
      if (sock._keepaliveInterval) clearInterval(sock._keepaliveInterval);
      sock._keepaliveInterval = setInterval(async () => {
        try {
          if (sock.ws?.readyState === 1) {
            await sock.sendPresenceUpdate('available');
          }
        } catch (_) {}
      }, 25000);

    } else if (connection === 'close') {
      // Clear keepalive on disconnect
      if (sock._keepaliveInterval) {
        clearInterval(sock._keepaliveInterval);
        sock._keepaliveInterval = null;
      }
      const code    = lastDisconnect?.error?.output?.statusCode;
      const session = activeSessions.get(phone) || {};

      if (code === DisconnectReason.loggedOut) {
        console.log(\`[\${phone}] 🔒 Logged out — clearing session folder.\`);
        activeSessions.delete(phone);
        try { fs.rmSync(getSessionDir(phone), { recursive: true, force: true }); } catch {}
        return;
      }

      // 515 Stream Error — normal Baileys post-pairing restart, KEEP creds, reconnect fast
      if (code === 515) {
        console.log(\`[\${phone}] 🔄 Stream restart (515) — reconnecting in 2s (keeping session)\`);
        activeSessions.set(phone, { ...session, sock: null });
        setTimeout(() => startBotForUser(phone, tgChatId), 2000);
        return;
      }

      // All other errors — reconnect with backoff, max 15 attempts then pause 10 min
      session.retries = (session.retries || 0) + 1;
      activeSessions.set(phone, { ...session, sock: null });

      const MAX_RETRIES = 15;
      if (session.retries > MAX_RETRIES) {
        console.log(\`[\${phone}] ⚠️  Max retries (\${MAX_RETRIES}) — pausing 10 min\`);
        session.retries = 0;
        activeSessions.set(phone, { ...session, sock: null });
        setTimeout(() => startBotForUser(phone, tgChatId), 10 * 60 * 1000);
        return;
      }

      const delay = Math.min(session.retries * 5000, 30000);
      console.log(\`[\${phone}] ⏳ Reconnecting in \${delay / 1000}s (attempt \${session.retries}/\${MAX_RETRIES})\`);
      setTimeout(() => startBotForUser(phone, tgChatId), delay);
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // ── Messages ────────────────────────────────────────────────────────────────
  const isSystemJid = (jid) => !jid || jid.includes('@broadcast') ||
    jid.includes('status.broadcast') || jid.includes('@newsletter');

  sock.ev.on('messages.upsert', ({ messages: msgs, type }) => {
    if (type !== 'notify') return;
    for (const msg of msgs) {
      if (!msg.message || !msg.key?.id) continue;
      const from = msg.key.remoteJid;
      if (!from || isSystemJid(from)) continue;

      const msgId = msg.key.id;
      if (!_sessionProcessed.has(phone)) _sessionProcessed.set(phone, new Set());
      const sessionDedup = _sessionProcessed.get(phone);
      if (sessionDedup.has(msgId)) continue;
      if (msg.messageTimestamp && Date.now() - msg.messageTimestamp * 1000 > 5 * 60 * 1000) continue;

      sessionDedup.add(msgId);

      if (!store.messages.has(from)) store.messages.set(from, new Map());
      store.messages.get(from).set(msgId, msg);

      handler.handleMessage(sock, msg).catch(err => {
        if (!err.message?.includes('rate-overlimit') && !err.message?.includes('not-authorized')) {
          console.error(\`[\${phone}] Message error:\`, err.message);
        }
      });

      setImmediate(async () => {
        if (config.autoRead && from.endsWith('@g.us')) {
          try { await sock.readMessages([msg.key]); } catch {}
        }
        if (from.endsWith('@g.us')) {
          try {
            const gm = await handler.getGroupMetadata(sock, from);
            if (gm) await handler.handleAntilink(sock, msg, gm);
          } catch {}
        }
      });
    }
  });

  sock.ev.on('group-participants.update', async (update) => {
    await handler.handleGroupUpdate(sock, update);
  });
  sock.ev.on('message-receipt.update', () => {});
  sock.ev.on('messages.update', () => {});
  sock.ev.on('error', (e) => {
    const c = e?.output?.statusCode;
    if (c === 515 || c === 503 || c === 408) return;
    console.error(\`[\${phone}] Socket error:\`, e.message || e);
  });

  return sock;
}

// ═════════════════════════════════════════════════════════════════════════════
// resumeExistingSessions()
// On startup, auto-reconnect any phone that already has a sessions/<phone>/creds.json
// ═════════════════════════════════════════════════════════════════════════════
async function resumeExistingSessions() {
  if (!fs.existsSync(SESSIONS_ROOT)) return;
  const phones = fs.readdirSync(SESSIONS_ROOT).filter(d => {
    const credsPath = path.join(SESSIONS_ROOT, d, 'creds.json');
    return fs.existsSync(credsPath);
  });
  if (!phones.length) return;
  console.log(\`\\n📂 Resuming \${phones.length} existing session(s): \${phones.join(', ')}\\n\`);
  for (const phone of phones) {
    try { await startBotForUser(phone, null); }
    catch (e) { console.error(\`[\${phone}] Resume error:\`, e.message); }
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// Telegram Pairing Bot
// /start  /help  /getcode <phone>  /sessions  /disconnect <phone>
// ═════════════════════════════════════════════════════════════════════════════
function startTelegramBot() {
  const token = config.telegramBotToken;
  if (!token) return;

  let TelegramBot;
  try { TelegramBot = require('node-telegram-bot-api'); }
  catch {
    console.log('⚠️  node-telegram-bot-api not found — run: npm install node-telegram-bot-api');
    return;
  }

  let tgBot;
  try {
    tgBot = new TelegramBot(token, { polling: { interval: 1000, autoStart: true } });
  } catch (e) {
    console.log('⚠️  Telegram bot failed to start:', e.message);
    return;
  }

  const send = (chatId, text) =>
    tgBot.sendMessage(chatId, text, { parse_mode: 'Markdown' }).catch(() => {});

  tgBot.on('message', async (tgMsg) => {
    const chatId = tgMsg.chat.id;
    const text   = (tgMsg.text || '').trim();

    // /start or /help
    if (text === '/start' || text === '/help') {
      return send(chatId,
\`*╭┈───〔 VK911 MINI XMD 〕┈───⊷*
*├▢ 🤖 \${sc('bot')}:* VK911 MINI XMD Pairing
*├▢ 📋 \${sc('version')}:* v\${config.version}
*╰───────────────────⊷*

\\\`『 COMMANDS 』\\\`
*╭───────────────────⊷*
*┋ ⬡* /getcode <number> — Get pairing code
*┋ ⬡* /sessions — List active sessions
*┋ ⬡* /disconnect <number> — Remove a session
*┋ ⬡* /help — Show this menu
*╰───────────────────⊷*

\\\`『 HOW TO PAIR 』\\\`
*╭───────────────────⊷*
*┋ ⬡* 1️⃣ Send \\\`/getcode 2347062301699\\\`
*┋ ⬡* 2️⃣ Wait for your 8-digit code
*┋ ⬡* 3️⃣ Open WhatsApp → ⋮ Menu
*┋ ⬡* 4️⃣ Tap *Linked Devices*
*┋ ⬡* 5️⃣ Tap *Link with phone number*
*┋ ⬡* 6️⃣ Enter the code
*┋ ⬡* 7️⃣ Done — bot is live! 🎉
*╰───────────────────⊷*

_No + or spaces in number_

> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ VK911 MINI XMD*\`);
    }

    // /sessions — list active
    if (text === '/sessions') {
      const list = Array.from(activeSessions.entries());
      if (!list.length) {
        return send(chatId,
\`*╭┈───〔 VK911 MINI XMD 〕┈───⊷*
*├▢ 📂 \${sc('sessions')}:* No active sessions
*╰───────────────────⊷*

Send \\\`/getcode YOUR\\\\_NUMBER\\\` to pair.\`);
      }
      const rows = list.map(([phone, s]) => {
        const state = s.sock?.ws?.readyState === 1 ? '🟢 Online' : '🔴 Offline';
        return \`*┋ ⬡ \${phone}:* \${state}\`;
      });
      return send(chatId,
\`*╭┈───〔 VK911 MINI XMD 〕┈───⊷*
*├▢ 📂 \${sc('active sessions')}:* \${list.length}
*╰───────────────────⊷*

\\\`『 SESSIONS 』\\\`
*╭───────────────────⊷*
\${rows.join('\\n')}
*╰───────────────────⊷*

> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ VK911 MINI XMD*\`);
    }

    // /disconnect <phone>
    if (text.startsWith('/disconnect')) {
      const phone = text.replace('/disconnect', '').trim().replace(/\\D/g, '');
      if (!phone) return send(chatId, '❌ Usage: /disconnect 2347062301699');
      const session = activeSessions.get(phone);
      if (!session) return send(chatId, \`❌ No active session for *+\${phone}*\`);
      try {
        if (session.sock) await session.sock.end();
        activeSessions.delete(phone);
        try { fs.rmSync(getSessionDir(phone), { recursive: true, force: true }); } catch {}
        return send(chatId,
\`*╭┈───〔 VK911 MINI XMD 〕┈───⊷*
*├▢ ✅ \${sc('status')}:* Disconnected
*├▢ 📱 \${sc('number')}:* +\${phone}
*├▢ 🗑️ \${sc('session')}:* Cleared
*╰───────────────────⊷*\`);
      } catch (e) {
        return send(chatId, \`❌ Failed to disconnect: \${e.message}\`);
      }
    }

    // /getcode <phone>
    if (text.startsWith('/getcode')) {
      const phone = text.replace('/getcode', '').trim().replace(/\\D/g, '');
      if (!phone || phone.length < 7) {
        return send(chatId,
\`*╭┈───〔 VK911 MINI XMD 〕┈───⊷*
*├▢ ❌ \${sc('error')}:* Invalid Number
*╰───────────────────⊷*

Usage: \\\`/getcode 2347062301699\\\`
_No + or spaces_\`);
      }

      // Check if already connected
      const existing = activeSessions.get(phone);
      if (existing?.sock?.ws?.readyState === 1) {
        return send(chatId,
\`*╭┈───〔 VK911 MINI XMD 〕┈───⊷*
*├▢ 🟢 \${sc('status')}:* Already Connected
*├▢ 📱 \${sc('number')}:* +\${phone}
*╰───────────────────⊷*

_This number is already paired and online._
Send \\\`/disconnect \${phone}\\\` to remove it.\`);
      }

      await send(chatId,
\`*╭┈───〔 VK911 MINI XMD 〕┈───⊷*
*├▢ ⏳ \${sc('status')}:* Starting session...
*├▢ 📱 \${sc('number')}:* +\${phone}
*├▢ 📂 \${sc('folder')}:* sessions/\${phone}/
*╰───────────────────⊷*

_Requesting pairing code — please wait..._\`);

      try {
        // Start isolated session for this phone
        const sock = await startBotForUser(phone, chatId);

        // ── Event-driven pairing: request code only AFTER Baileys signals
        //    the connection is ready (qr event or ws open), NOT after a blind delay.
        //    Using the same cache/monkey-patch layer as the web API so a code
        //    generated here is reused if the user also hits /pair, and vice versa.
        const PAIR_CODE_TTL = 55_000;
        const cached = global._pairCache?.[phone];
        let code;
        if (cached && Date.now() - cached.ts < PAIR_CODE_TTL) {
          code = cached.code;
        } else {
          code = await new Promise((resolve, reject) => {
            let done      = false;
            let inFlight  = false;
            let attempts  = 0;
            const timer   = setTimeout(() => {
              if (!done) { done = true; reject(new Error('Timed out — please try again.')); }
            }, 25_000);

            const finish = (err, c) => {
              if (done) return;
              done = true;
              clearTimeout(timer);
              try { sock.ev.off('connection.update', onUpdate); } catch {}
              if (!err && c) {
                global._pairCache = global._pairCache || {};
                global._pairCache[phone] = { code: c, ts: Date.now() };
              }
              err ? reject(err) : resolve(c);
            };

            const tryGet = async (label) => {
              if (done || inFlight) return;
              inFlight = true;
              attempts++;
              try {
                const c = await sock.requestPairingCode(phone);
                if (!c) throw new Error('empty code');
                console.log(\`[TgPair] +\${phone} code via \${label} (attempt \${attempts})\`);
                finish(null, c);
              } catch (e) {
                inFlight = false;
                if (attempts >= 4) return finish(new Error('Could not get code. Try /getcode again.'));
                setTimeout(() => tryGet('retry-' + attempts), 2000);
              }
            };

            const onUpdate = (u) => {
              if (done) return;
              if (u.qr || u.connection === 'connecting') tryGet('qr-event');
            };
            sock.ev.on('connection.update', onUpdate);

            // Safety fallback — fires if neither QR nor connecting event comes
            setTimeout(() => tryGet('fallback-3s'), 3000);
          });
        }

        const formatted = code?.match(/.{1,4}/g)?.join('-') || code;

        await send(chatId,
\`*╭┈───〔 VK911 MINI XMD 〕┈───⊷*
*├▢ 🔑 \${sc('code')}:* Ready
*├▢ 📱 \${sc('number')}:* +\${phone}
*├▢ ⏳ \${sc('valid')}:* ~60 seconds
*├▢ 📂 \${sc('session')}:* sessions/\${phone}/
*╰───────────────────⊷*

*Your Pairing Code:*

\\\`\\\`\\\`
   \${formatted}
\\\`\\\`\\\`

\\\`『 STEPS TO LINK 』\\\`
*╭───────────────────⊷*
*┋ ⬡* 1️⃣ Open *WhatsApp*
*┋ ⬡* 2️⃣ Tap *⋮ Menu* → *Linked Devices*
*┋ ⬡* 3️⃣ Tap *Link a Device*
*┋ ⬡* 4️⃣ Tap *Link with phone number instead*
*┋ ⬡* 5️⃣ Enter: \\\`\${formatted}\\\`
*┋ ⬡* 6️⃣ Tap *Link*
*╰───────────────────⊷*

_Code expires in 1 minute — act fast!_ ⚡

> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ VK911 MINI XMD*\`);

      } catch (e) {
        console.error(\`[\${phone}] Pairing code error:\`, e.message);
        activeSessions.delete(phone);
        await send(chatId,
\`*╭┈───〔 VK911 MINI XMD 〕┈───⊷*
*├▢ ❌ \${sc('status')}:* Pairing Failed
*├▢ 📱 \${sc('number')}:* +\${phone}
*├▢ ⚠️ \${sc('reason')}:* \${e.message.substring(0, 60)}
*╰───────────────────⊷*

Try \\\`/getcode \${phone}\\\` again in 30 seconds.\`);
      }
      return;
    }

    // Unknown
    send(chatId, \`ℹ️ Send /help for instructions or /getcode <number> to pair.\`);
  });

  tgBot.on('polling_error', (e) => {
    if (e.message?.includes('409') || e.message?.includes('ETELEGRAM')) return;
    console.log('⚠️  Telegram polling error:', e.code || e.message);
  });

  console.log('✅ Telegram Pairing Bot started — send /getcode <number> to your bot');
}

// ── Startup ───────────────────────────────────────────────────────────────────
console.log(\`🚀 Starting VK911 MINI XMD v\${config.version}...\`);
console.log(\`⚡ Prefix : \${config.prefix}\`);
console.log(\`👑 Owner  : \${config.ownerName[0]}\`);
console.log(\`📂 Sessions root: \${SESSIONS_ROOT}\\n\`);

cleanupPuppeteerCache();

// ── Web Pairing API — MUST be initialized before Telegram bot so both share
//    the same startBotForUser socket factory and _pairCache ─────────────────
// closeSession — tears down socket + deletes session dir for fresh pairing
// Called by pairApi before each /pair request so no stale connected socket
// is reused (a connected socket produces a code WhatsApp rejects).
async function closeSession(phone) {
    if (activeSessions.has(phone)) {
        const session = activeSessions.get(phone);
        activeSessions.delete(phone);
        if (session?.sock) {
            try {
                if (session.sock._keepaliveInterval) clearInterval(session.sock._keepaliveInterval);
                session.sock.ws?.close?.();
            } catch {}
        }
        console.log(\`[\${phone}] Session closed for fresh pairing.\`);
    }
    // Delete session directory so new socket starts with zero credentials
    const sessionDir = path.join(SESSIONS_ROOT, phone);
    try { fs.rmSync(sessionDir, { recursive: true, force: true }); } catch {}
    // Clear any stale cached pairing code
    if (global._pairCache) delete global._pairCache[phone];
}

const { init: initWebPair } = require('./pairApi');
initWebPair(startBotForUser, closeSession);

startTelegramBot();

// Resume existing sessions first, then wait for new /getcode requests
resumeExistingSessions().catch(err => {
  console.error('Session resume error:', err.message);
});

process.on('uncaughtException', (err) => {
  if (err.code === 'ENOSPC' || err.message?.includes('no space left')) {
    console.error('⚠️  Disk full — cleaning up...');
    try { require('./utils/cleanup').cleanupOldFiles(); } catch {}
    return;
  }
  console.error('Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (err) => {
  if (err?.message?.includes('rate-overlimit')) return;
  if (err?.code === 'ENOSPC' || err?.message?.includes('no space left')) {
    try { require('./utils/cleanup').cleanupOldFiles(); } catch {}
    return;
  }
  console.error('Unhandled Rejection:', err?.message || err);
});

module.exports = { activeSessions, startBotForUser, closeSession };
`;
