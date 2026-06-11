// VK911 MINI XMD — Fixed pairApi.js
// Auto-generated — contains the fixed Web Pairing API server
export const PAIR_API_JS = `// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💣 VK911 XMD  |  Web Pairing API  ·  ⚡ FAST  ·  Event-driven
//
// GET  /pair?phone=234...   → { code: "ABCD-EFGH", phone, ms }
// GET  /health              → { status, uptime, sockets }
// POST /warm  body:{phone}  → starts socket in advance (optional pre-warm)
// GET  /config              → { settings }  — read current live config
// POST /config body:{settings:{…}} → update live bot config immediately
//
// FIX (2026-06): Force-close any existing connected session before each
// fresh pair request. A socket that is already open (readyState=1) cannot
// produce a valid WhatsApp pairing code — calling requestPairingCode on it
// returns a code that WhatsApp rejects with "Invalid code, check and try
// again". closeSession() in index.js tears down the socket + deletes the
// session directory, so every /pair request starts completely fresh.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const express = require('express');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = parseInt(process.env.PORT || process.env.WEB_PORT || 24724);
const BOT  = 'VK911 MINI XMD';

const PAIR_CODE_TTL = 55 * 1000; // codes are valid ~60s; reuse within 55s
const _pending = new Map();      // phone → { promise, t0 }

// Shared code cache visible to the bot's own internal pairing flow too
global._pairCache = global._pairCache || {};
function getCachedCode(phone) {
    const c = global._pairCache[phone];
    if (c && Date.now() - c.ts < PAIR_CODE_TTL) return c.code;
    return null;
}
function setCachedCode(phone, code) {
    if (!code) return;
    global._pairCache[phone] = { code, ts: Date.now() };
}
function clearCachedCode(phone) {
    delete global._pairCache[phone];
}
function fmt(code) { return code?.match(/.{1,4}/g)?.join('-') || code; }

// ─── CORS ─────────────────────────────────────────────────────────────
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin',  '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Max-Age', '86400');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});
app.use(express.json());

// ─── Static / health ──────────────────────────────────────────────────
app.get('/', (req, res) => {
    const html = path.join(__dirname, 'index.html');
    if (fs.existsSync(html)) return res.sendFile(html);
    res.json({ status: 'ok', bot: BOT, uptime: Math.floor(process.uptime()) });
});

app.get('/health', (req, res) => {
    res.json({
        status:  'ok',
        bot:     BOT,
        uptime:  Math.floor(process.uptime()),
        pending: _pending.size,
        cached:  Object.keys(global._pairCache).length,
    });
});

// ─── /config — read & live-update bot configuration ──────────────────
app.get('/config', (req, res) => {
    try {
        const cfg = require('./config');
        res.json({
            status: 'ok',
            settings: {
                botName:      cfg.botName,
                prefix:       cfg.prefix,
                timezone:     cfg.timezone,
                selfMode:     cfg.selfMode,
                autoRead:     cfg.autoRead,
                autoReact:    cfg.autoReact,
                autoTyping:   cfg.autoTyping,
                autoSticker:  cfg.autoSticker,
                antilink:     cfg.defaultGroupSettings?.antilink,
                antispam:     cfg.defaultGroupSettings?.antiSpam,
                antibot:      cfg.defaultGroupSettings?.antibot,
                welcomeMsg:   cfg.defaultGroupSettings?.welcome,
                goodbyeMsg:   cfg.defaultGroupSettings?.goodbye,
                nsfwEnabled:  cfg.defaultGroupSettings?.nsfw,
                ownerNumber:  cfg.ownerNumber?.[0],
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Could not read config: ' + err.message });
    }
});

app.post('/config', (req, res) => {
    const { settings } = req.body || {};
    if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ error: 'Body must be { settings: { key: value } }' });
    }

    let cfg;
    try { cfg = require('./config'); }
    catch (err) { return res.status(500).json({ error: 'Could not load config: ' + err.message }); }

    const applied = {};
    const skipped = {};

    for (const [key, rawVal] of Object.entries(settings)) {
        const bool = rawVal === 'true' || rawVal === true;
        const str  = String(rawVal);
        switch (key) {
            case 'readMessages':
            case 'readStatus':  cfg.autoRead = bool; applied[key] = bool; break;
            case 'autoReact':   cfg.autoReact = bool; applied[key] = bool; break;
            case 'selfBot':     cfg.selfMode = bool; applied[key] = bool; break;
            case 'publicMode':  cfg.selfMode = !bool; applied[key] = bool; break;
            case 'botName':     if (str.trim()) { cfg.botName = str.trim(); applied[key] = str.trim(); } break;
            case 'prefix':      if (str.trim()) { cfg.prefix = str.trim(); applied[key] = str.trim(); } break;
            case 'ownerNumber':
                if (str.replace(/\\D/g, '').length >= 7) {
                    cfg.ownerNumber = [str.replace(/\\D/g, '')];
                    applied[key] = str.replace(/\\D/g, '');
                } break;
            case 'timezone':    if (str.trim()) { cfg.timezone = str.trim(); applied[key] = str.trim(); } break;
            case 'antilink':    if (cfg.defaultGroupSettings) { cfg.defaultGroupSettings.antilink = bool; applied[key] = bool; } break;
            case 'antispam':    if (cfg.defaultGroupSettings) { cfg.defaultGroupSettings.antiSpam = bool; applied[key] = bool; } break;
            case 'antibot':     if (cfg.defaultGroupSettings) { cfg.defaultGroupSettings.antibot = bool; applied[key] = bool; } break;
            case 'welcomeMsg':  if (cfg.defaultGroupSettings) { cfg.defaultGroupSettings.welcome = bool; applied[key] = bool; } break;
            case 'goodbyeMsg':  if (cfg.defaultGroupSettings) { cfg.defaultGroupSettings.goodbye = bool; applied[key] = bool; } break;
            case 'nsfwEnabled': if (cfg.defaultGroupSettings) { cfg.defaultGroupSettings.nsfw = bool; applied[key] = bool; } break;
            default:            skipped[key] = 'unknown setting key';
        }
    }

    const appliedCount = Object.keys(applied).length;
    console.log(\`[Config] 🔧 Live update — applied \${appliedCount} setting(s):\`, applied);
    res.json({ status: 'ok', applied, skipped, message: \`\${appliedCount} setting(s) applied to live bot config\` });
});

// ─── Helpers ──────────────────────────────────────────────────────────

// Always clean unregistered sessions — no guard on cached codes.
// A stale cached code must NOT prevent cleaning a broken session directory.
function cleanBrokenSession(phone) {
    const sessionDir = path.join(__dirname, 'sessions', phone);
    const credsPath  = path.join(sessionDir, 'creds.json');
    if (!fs.existsSync(credsPath)) return;
    try {
        const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
        if (!creds.registered) {
            fs.rmSync(sessionDir, { recursive: true, force: true });
            console.log(\`[WebPair] +\${phone} cleaned unregistered session folder\`);
        }
    } catch {
        fs.rmSync(sessionDir, { recursive: true, force: true });
    }
}

// getCodeFromSocket — event-driven, no polling
// KEY FIX: call tryNow('immediate') right away so the code request is
// queued before the socket can settle into QR mode. Also only listen for
// 'connecting' events (not QR events) — QR and pairing code are mutually
// exclusive flows; triggering on QR invalidates the pairing code.
function getCodeFromSocket(sock, phone, totalMs = 22000) {
    return new Promise((resolve, reject) => {
        // Cache hit — instant response
        const cached = getCachedCode(phone);
        if (cached) {
            console.log(\`[WebPair] +\${phone} ↺ reused cached code (\${Math.round((Date.now() - global._pairCache[phone].ts) / 1000)}s old)\`);
            return resolve(cached);
        }

        let done     = false;
        let inFlight = false;

        const finish = (err, code) => {
            if (done) return;
            done = true;
            clearTimeout(masterTimer);
            try { sock?.ev?.off?.('connection.update', onUpdate); } catch {}
            if (!err && code) setCachedCode(phone, code);
            err ? reject(err) : resolve(code);
        };

        // Monkey-patch to deduplicate concurrent callers
        const origRequest = sock.requestPairingCode?.bind(sock);
        let socketCallPromise = null;
        if (origRequest) {
            sock.requestPairingCode = async function (...args) {
                const cc = getCachedCode(phone);
                if (cc) return cc;
                if (socketCallPromise) return socketCallPromise;
                socketCallPromise = (async () => {
                    try {
                        const c = await origRequest(...args);
                        if (c) setCachedCode(phone, c);
                        return c;
                    } catch (e) {
                        socketCallPromise = null;
                        throw e;
                    }
                })();
                return socketCallPromise;
            };
        }

        const masterTimer = setTimeout(
            () => finish(new Error('Timed out — please tap Get Code again.')),
            totalMs
        );

        let attempts = 0;
        const tryNow = async (label) => {
            if (done || inFlight) return;
            inFlight = true;
            attempts++;
            try {
                const c = await sock.requestPairingCode(phone);
                if (!c) throw new Error('Empty code');
                console.log(\`[WebPair] +\${phone} ✅ got code via \${label} (attempt \${attempts})\`);
                finish(null, c);
            } catch (e) {
                inFlight = false;
                console.log(\`[WebPair] +\${phone} attempt \${attempts} failed (\${label}): \${e.message}\`);
                if (attempts >= 5) return finish(new Error('Could not get code after 5 attempts. Try again.'));
                setTimeout(() => tryNow('retry-' + attempts), 1500);
            }
        };

        // Listen for 'connecting' state ONLY (not QR — QR and pairing are mutually exclusive)
        const onUpdate = (u) => {
            if (done) return;
            if (u.connection === 'connecting') {
                tryNow('connecting-event');
            }
        };
        try { sock?.ev?.on?.('connection.update', onUpdate); } catch {}

        // Fire immediately — in Baileys v7 requestPairingCode queues internally
        // until the socket reaches the right internal state. Calling it right
        // away (before any QR event fires) keeps it in pairing-code mode.
        tryNow('immediate');
    });
}

// ─── /warm — optional pre-spawn ───────────────────────────────────────
app.post('/warm', async (req, res) => {
    const phone = String(req.body?.phone || req.query?.phone || '').replace(/[^0-9]/g, '');
    if (!phone || phone.length < 7 || phone.length > 15)
        return res.status(400).json({ error: 'bad phone' });
    if (!app._getSocket)
        return res.status(503).json({ error: 'not ready' });

    cleanBrokenSession(phone);
    app._getSocket(phone).catch(() => {});
    res.json({ status: 'warming' });
});

// ─── /pair — main endpoint ────────────────────────────────────────────
app.get('/pair', async (req, res) => {
    const phone = (req.query.phone || '').replace(/[^0-9]/g, '');
    if (!phone || phone.length < 7 || phone.length > 15)
        return res.status(400).json({ error: 'Invalid number. Format: 2347062301699' });

    if (!app._getSocket)
        return res.status(503).json({ error: 'Bot booting. Try again in 3 seconds.' });

    // Cache hit — return immediately
    const cached = getCachedCode(phone);
    if (cached) {
        console.log(\`[WebPair] +\${phone} cache-hit → \${fmt(cached)}\`);
        return res.json({ code: fmt(cached), phone, ms: 0, cached: true });
    }

    // Piggy-back on existing in-flight request for the same phone
    if (_pending.has(phone)) {
        try {
            const code = await _pending.get(phone).promise;
            return res.json({ code: fmt(code), phone, ms: Date.now() - _pending.get(phone).t0, dedup: true });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    // ── KEY FIX: close any active session so we start completely fresh ──
    // A connected socket (readyState=1) returns a pairing code that WhatsApp
    // rejects. We must tear it down and delete the session directory before
    // creating a new socket.
    if (app._closeSession) {
        try { await app._closeSession(phone); } catch {}
    } else {
        // Fallback if closeSession not wired in — at least clean broken creds
        cleanBrokenSession(phone);
    }
    clearCachedCode(phone); // discard any stale code from previous attempts

    const t0 = Date.now();

    const promise = (async () => {
        const sock = await app._getSocket(phone);
        if (!sock) throw new Error('Could not start session for this number.');
        return getCodeFromSocket(sock, phone);
    })();

    _pending.set(phone, { promise, t0 });
    promise.finally(() => setTimeout(() => _pending.delete(phone), 500));

    try {
        const code = await promise;
        const ms   = Date.now() - t0;
        console.log(\`[WebPair] ✅ +\${phone} → \${fmt(code)} (\${ms}ms)\`);
        res.json({ code: fmt(code), phone, ms });
    } catch (err) {
        console.error(\`[WebPair] ❌ +\${phone}:\`, err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── Boot ─────────────────────────────────────────────────────────────
// init(getSocketFn, closeSessionFn)
//   getSocketFn(phone)  → creates/returns a Baileys socket for that phone
//   closeSessionFn(phone) → tears down the socket + deletes session dir
function init(getSocketFn, closeSessionFn) {
    app._getSocket    = getSocketFn;
    app._closeSession = closeSessionFn || null;
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(\`🌐 WebPair API → port \${PORT} (\${BOT})\`);
        console.log(\`   /health  /pair?phone=…  POST /warm {phone}  GET|POST /config\`);
    });
    server.on('error', e => console.error('[WebPair]', e.message));
    return server;
}

module.exports = { init, app };
`;
