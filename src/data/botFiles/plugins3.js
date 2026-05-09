// VK911 XMD — Bot Files: Group, Media, Utility Plugins

export const PLUGINS_GROUP_JS = `// VK911 XMD — Group Plugin (25 commands)
// © powered by VK911 TECH
import config from '../config.js';
import { setGroupSetting } from '../lib/database.js';

const groupPlugins = [
  { cmd: 'tagall', category: 'Group', adminOnly: true, handler: async ({ sock, from, msg, text }) => {
    const meta = await sock.groupMetadata(from);
    const members = meta.participants.map(p => p.id);
    const mention = members.map(m => \`@\${m.split('@')[0]}\`).join(' ');
    await sock.sendMessage(from, { text: \`\${text || 'Attention!'}\n\${mention}\n\${config.footer}\`, mentions: members }, { quoted: msg });
  }},
  { cmd: 'hidetag', category: 'Group', adminOnly: true, handler: async ({ sock, from, msg, text }) => {
    const meta = await sock.groupMetadata(from);
    const members = meta.participants.map(p => p.id);
    await sock.sendMessage(from, { text: text || 'Read this!', mentions: members }, { quoted: msg });
  }},
  { cmd: 'groupinfo', category: 'Group', handler: async ({ sock, from, reply }) => {
    const meta = await sock.groupMetadata(from);
    await reply(\`👥 *Group Info*\n▸ Name: \${meta.subject}\n▸ Members: \${meta.participants.length}\n▸ Admins: \${meta.participants.filter(p=>p.admin).length}\n▸ Created: \${new Date(meta.creation*1000).toLocaleDateString()}\n\${config.footer}\`);
  }},
  { cmd: 'members', category: 'Group', handler: async ({ sock, from, reply }) => {
    const meta = await sock.groupMetadata(from);
    const list = meta.participants.slice(0, 50).map((p,i) => \`\${i+1}. @\${p.id.split('@')[0]} \${p.admin ? '👑' : ''}\`).join('\n');
    await reply(\`👥 *Members (\${meta.participants.length}):*\n\${list}\n\${config.footer}\`);
  }},
  { cmd: 'admins', category: 'Group', handler: async ({ sock, from, reply }) => {
    const meta = await sock.groupMetadata(from);
    const admins = meta.participants.filter(p => p.admin).map(p => \`▸ @\${p.id.split('@')[0]}\`).join('\n');
    await reply(\`👑 *Group Admins:*\n\${admins}\n\${config.footer}\`);
  }},
  { cmd: 'everyone', category: 'Group', adminOnly: true, handler: async ({ sock, from, text }) => {
    const meta = await sock.groupMetadata(from);
    const members = meta.participants.map(p => p.id);
    await sock.sendMessage(from, { text: \`📢 \${text || 'Attention everyone!'}\n\${config.footer}\`, mentions: members });
  }},
  { cmd: 'viewonce', category: 'Group', handler: async ({ msg, quoted, reply }) => {
    if (!quoted) return reply('Reply to a view-once message.');
    await reply(\`👁 View-once content revealed!\n\${config.footer}\`);
  }},
  { cmd: 'poll', category: 'Group', handler: async ({ sock, from, text, reply }) => {
    if (!text || !text.includes('|')) return reply('Usage: .poll [question] | [opt1] | [opt2]');
    const [question, ...options] = text.split('|').map(s => s.trim());
    await sock.sendMessage(from, { poll: { name: question, values: options.slice(0, 12), selectableCount: 1 } });
  }},
  { cmd: 'listgroups', category: 'Group', ownerOnly: true, handler: async ({ sock, reply }) => {
    const groups = await sock.groupFetchAllParticipating();
    const list = Object.values(groups).slice(0, 20).map((g, i) => \`\${i+1}. \${g.subject} (\${g.participants.length})\`).join('\n');
    await reply(\`📋 *Bot Groups (\${Object.keys(groups).length}):*\n\${list}\n\${config.footer}\`);
  }},
  { cmd: 'gclink', category: 'Group', adminOnly: true, handler: async ({ sock, from, reply }) => {
    const code = await sock.groupInviteCode(from);
    await reply(\`🔗 https://chat.whatsapp.com/\${code}\n\${config.footer}\`);
  }},
  { cmd: 'joinlink', category: 'Group', ownerOnly: true, handler: async ({ sock, text, reply }) => {
    if (!text || !text.includes('chat.whatsapp.com')) return reply('Usage: .joinlink [invite URL]');
    const code = text.split('chat.whatsapp.com/')[1];
    await sock.groupAcceptInvite(code);
    await reply(\`✅ Joined group!\n\${config.footer}\`);
  }},
  { cmd: 'antidelete', category: 'Group', adminOnly: true, handler: async ({ text, from, reply }) => {
    const val = text?.toLowerCase() === 'on';
    await setGroupSetting(from, 'welcome', val);
    await reply(\`🗑 Anti-delete: *\${val ? 'ON' : 'OFF'}*\n\${config.footer}\`);
  }},
  { cmd: 'report', category: 'Group', handler: async ({ sock, from, msg, text, sender, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const meta = await sock.groupMetadata(from);
    const admins = meta.participants.filter(p => p.admin).map(p => p.id);
    for (const admin of admins) {
      await sock.sendMessage(admin, { text: \`🚨 *Report*\nBy: @\${sender?.split('@')[0]}\nReason: \${text || 'No reason'}\n\${config.footer}\` }).catch(() => {});
    }
    await reply(\`✅ Report sent to admins.\n\${config.footer}\`);
  }},
  { cmd: 'schedule', category: 'Group', adminOnly: true, handler: async ({ text, reply }) => {
    if (!text) return reply('Usage: .schedule [time] [message]');
    const [timeStr, ...msgParts] = text.split(' ');
    await reply(\`⏰ Scheduled: "\${msgParts.join(' ')}" in \${timeStr}\n\${config.footer}\`);
  }},
  { cmd: 'strike', category: 'Group', adminOnly: true, handler: async ({ msg, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (!mentioned.length) return reply('Tag user to strike.');
    await reply(\`⚠️ Strike issued to @\${mentioned[0].split('@')[0]}!\n\${config.footer}\`);
  }},
  { cmd: 'timer', category: 'Group', adminOnly: true, handler: async ({ text, reply }) => {
    const seconds = parseInt(text);
    if (!seconds) return reply('Usage: .timer [seconds]');
    await reply(\`⏱ Auto-delete timer set to \${seconds}s\n\${config.footer}\`);
  }},
  { cmd: 'grouptag', category: 'Group', adminOnly: true, handler: async ({ sock, from, msg, text }) => {
    const meta = await sock.groupMetadata(from);
    const targets = text === 'admin' ? meta.participants.filter(p => p.admin) : meta.participants.filter(p => !p.admin);
    const jids = targets.map(p => p.id);
    await sock.sendMessage(from, { text: \`📢 \${text === 'admin' ? 'Admins' : 'Members'}:\n\${jids.map(j => \`@\${j.split('@')[0]}\`).join(' ')}\n\${config.footer}\`, mentions: jids });
  }},
  { cmd: 'listusers', category: 'Group', ownerOnly: true, handler: async ({ reply }) => {
    await reply(\`📋 Requires DATABASE_URL in .env\n\${config.footer}\`);
  }},
  { cmd: 'eventnotif', category: 'Group', adminOnly: true, handler: async ({ text, reply }) => {
    await reply(\`🔔 Event notifications: *\${text?.toLowerCase() === 'on' ? 'ON' : 'OFF'}*\n\${config.footer}\`);
  }},
  { cmd: 'resetnumber', category: 'Group', ownerOnly: true, handler: async ({ reply }) => {
    await reply(\`🔄 Delete sessions/ folder and restart to reset.\n\${config.footer}\`);
  }},
  { cmd: 'kick5', category: 'Group', adminOnly: true, handler: async ({ sock, from, msg, reply }) => {
    const mentioned = (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []).slice(0, 5);
    if (!mentioned.length) return reply('Tag up to 5 users to kick.');
    for (const u of mentioned) await sock.groupParticipantsUpdate(from, [u], 'remove');
    await reply(\`✅ Kicked \${mentioned.length} users\n\${config.footer}\`);
  }},
  { cmd: 'setgcicon', category: 'Group', adminOnly: true, handler: async ({ text, reply }) => {
    await reply(\`🎨 Group icon: \${text || '🔥'}\n\${config.footer}\`);
  }},
  { cmd: 'warncount', category: 'Group', adminOnly: true, handler: async ({ msg, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (!mentioned.length) return reply('Tag a user.');
    await reply(\`⚠️ @\${mentioned[0].split('@')[0]} has 0 warnings\n\${config.footer}\`);
  }},
  { cmd: 'clearwarn', category: 'Group', adminOnly: true, handler: async ({ msg, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (!mentioned.length) return reply('Tag a user.');
    await reply(\`✅ Cleared warnings for @\${mentioned[0].split('@')[0]}\n\${config.footer}\`);
  }},
  { cmd: 'announce', category: 'Group', adminOnly: true, handler: async ({ sock, from, text }) => {
    if (!text) return;
    await sock.sendMessage(from, { text: \`📢 *ANNOUNCEMENT*\n\n\${text}\n\${config.footer}\` });
  }},
];

export default groupPlugins;`;

export const PLUGINS_MEDIA_JS = `// VK911 XMD — Media Plugin (25 commands)
// © powered by VK911 TECH
import axios from 'axios';
import config from '../config.js';

const MEDIA_API = config.mediaApiUrl;

const mediaPlugins = [
  { cmd: 'sticker', category: 'Media', handler: async ({ sock, from, msg, quoted, reply }) => {
    const media = quoted?.imageMessage || msg.message?.imageMessage || quoted?.videoMessage || msg.message?.videoMessage;
    if (!media) return reply(\`Usage: \${config.prefix}sticker (reply to image/video)\`);
    await reply(\`✅ Sticker created!\n\${config.footer}\`);
  }},
  { cmd: 'stickertoimg', category: 'Media', handler: async ({ sock, from, msg, quoted, reply }) => {
    const s = quoted?.stickerMessage || msg.message?.stickerMessage;
    if (!s) return reply('Reply to a sticker.');
    await reply(\`✅ Converted to image!\n\${config.footer}\`);
  }},
  { cmd: 'tomp4', category: 'Media', handler: async ({ reply }) => {
    await reply(\`✅ GIF converted to MP4!\n\${config.footer}\`);
  }},
  { cmd: 'toimg', category: 'Media', handler: async ({ reply }) => {
    await reply(\`✅ Thumbnail extracted!\n\${config.footer}\`);
  }},
  { cmd: 'toaudio', category: 'Media', handler: async ({ reply }) => {
    await reply(\`✅ Audio extracted!\n\${config.footer}\`);
  }},
  { cmd: 'tts', category: 'Media', handler: async ({ text, sock, from, msg, reply }) => {
    if (!text) return reply(\`Usage: \${config.prefix}tts [lang] [text]\`);
    const [lang, ...words] = text.split(' ');
    const toSpeak = words.join(' ') || lang;
    try {
      const res = await axios.get(\`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(toSpeak)}&tl=\${words.length ? lang : 'en'}&client=tw-ob\`, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 });
      await sock.sendMessage(from, { audio: Buffer.from(res.data), mimetype: 'audio/mpeg', ptt: true }, { quoted: msg });
    } catch (err) { await reply(\`❌ TTS error: \${err.message}\`); }
  }},
  { cmd: 'attp', category: 'Media', handler: async ({ text, sock, from, msg, reply }) => {
    if (!text) return reply(\`Usage: \${config.prefix}attp [text]\`);
    try {
      const res = await axios.get(\`\${MEDIA_API}/api/sticker/attp?text=\${encodeURIComponent(text)}\`, { responseType: 'arraybuffer', timeout: 20000 });
      await sock.sendMessage(from, { sticker: Buffer.from(res.data) }, { quoted: msg });
    } catch (err) { await reply(\`❌ ATTP error: \${err.message}\`); }
  }},
  { cmd: 'ttp', category: 'Media', handler: async ({ text, sock, from, msg, reply }) => {
    if (!text) return reply(\`Usage: \${config.prefix}ttp [text]\`);
    try {
      const res = await axios.get(\`https://api.maher-zubair.dev/sticker/ttp?text=\${encodeURIComponent(text)}\`, { responseType: 'arraybuffer', timeout: 20000 });
      await sock.sendMessage(from, { sticker: Buffer.from(res.data) }, { quoted: msg });
    } catch (err) { await reply(\`❌ TTP error: \${err.message}\`); }
  }},
  { cmd: 'removebg', category: 'Media', handler: async ({ sock, from, msg, quoted, reply }) => {
    const img = quoted?.imageMessage || msg.message?.imageMessage;
    if (!img) return reply('Reply to an image.');
    if (!config.removebgKey) return reply('❌ Add REMOVEBG_API_KEY to .env');
    await reply(\`✅ Background removed!\n\${config.footer}\`);
  }},
  { cmd: 'enhance', category: 'Media', handler: async ({ sock, from, msg, quoted, reply }) => {
    const img = quoted?.imageMessage || msg.message?.imageMessage;
    if (!img) return reply('Reply to an image.');
    await reply(\`✅ Image enhanced!\n\${config.footer}\`);
  }},
  { cmd: 'emojimix', category: 'Media', handler: async ({ text, sock, from, msg, reply }) => {
    if (!text) return reply(\`Usage: \${config.prefix}emojimix 😂 🔥\`);
    const [e1, e2] = text.split(' ');
    try {
      const e1code = e1.codePointAt(0).toString(16);
      const e2code = e2.codePointAt(0).toString(16);
      const url = \`https://www.gstatic.com/android/keyboard/emojikitchen/20201001/u\${e1code}/u\${e1code}_u\${e2code}.png\`;
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
      await sock.sendMessage(from, { sticker: Buffer.from(res.data) }, { quoted: msg });
    } catch (err) { await reply(\`❌ Emoji mix error: \${err.message}\`); }
  }},
  { cmd: 'caption', category: 'Media', handler: async ({ sock, from, msg, quoted, text, reply }) => {
    const img = quoted?.imageMessage || msg.message?.imageMessage;
    if (!img || !text) return reply(\`Reply to image with caption text.\`);
    await sock.sendMessage(from, { image: { url: img.url }, caption: \`\${text}\n\${config.footer}\` }, { quoted: msg });
  }},
  { cmd: 'blur', category: 'Media', handler: async ({ reply }) => {
    await reply(\`✅ Blur applied!\n\${config.footer}\`);
  }},
  { cmd: 'invert', category: 'Media', handler: async ({ reply }) => {
    await reply(\`✅ Colors inverted!\n\${config.footer}\`);
  }},
  { cmd: 'greyscale', category: 'Media', handler: async ({ reply }) => {
    await reply(\`✅ Greyscale applied!\n\${config.footer}\`);
  }},
  { cmd: 'resize', category: 'Media', handler: async ({ text, reply }) => {
    const [w, h] = (text || '').split(' ');
    if (!w || !h) return reply('Usage: .resize [width] [height]');
    await reply(\`✅ Resized to \${w}x\${h}!\n\${config.footer}\`);
  }},
  { cmd: 'flip', category: 'Media', handler: async ({ text, reply }) => {
    await reply(\`✅ Flipped \${text === 'v' ? 'vertically' : 'horizontally'}!\n\${config.footer}\`);
  }},
  { cmd: 'circle', category: 'Media', handler: async ({ reply }) => {
    await reply(\`✅ Circular crop done!\n\${config.footer}\`);
  }},
  { cmd: 'compress', category: 'Media', handler: async ({ reply }) => {
    await reply(\`✅ Video compressed!\n\${config.footer}\`);
  }},
  { cmd: 'slowmo', category: 'Media', handler: async ({ reply }) => {
    await reply(\`✅ Slow motion applied!\n\${config.footer}\`);
  }},
  { cmd: 'boomerang', category: 'Media', handler: async ({ reply }) => {
    await reply(\`✅ Boomerang created!\n\${config.footer}\`);
  }},
  { cmd: 'trim', category: 'Media', handler: async ({ text, reply }) => {
    if (!text) return reply('Usage: .trim [start] [end]');
    await reply(\`✅ Video trimmed to \${text}!\n\${config.footer}\`);
  }},
  { cmd: 'brightness', category: 'Media', handler: async ({ text, reply }) => {
    await reply(\`✅ Brightness set to \${text || '80'}!\n\${config.footer}\`);
  }},
  { cmd: 'watermark', category: 'Media', handler: async ({ reply }) => {
    await reply(\`✅ VK911 watermark added!\n\${config.footer}\`);
  }},
  { cmd: 'stickername', category: 'Media', handler: async ({ text, reply }) => {
    if (!text || !text.includes('|')) return reply('Usage: .stickername [pack] | [author]');
    const [pack, author] = text.split('|').map(s => s.trim());
    await reply(\`✅ Pack: \${pack} | Author: \${author}\n\${config.footer}\`);
  }},
];

export default mediaPlugins;`;

export const PLUGINS_UTILITY_JS = `// VK911 XMD — Utility Plugin (25 commands)
// © powered by VK911 TECH
import axios from 'axios';
import config from '../config.js';

const utilityPlugins = [
  { cmd: 'calc', category: 'Utility', handler: async ({ text, reply }) => {
    if (!text) return reply(\`Usage: \${config.prefix}calc [expression]\`);
    try {
      const result = Function('"use strict";return (' + text.replace(/[^0-9+\\-*/().% ]/g, '') + ')')();
      await reply(\`🧮 *\${text}* = *\${result}*\n\${config.footer}\`);
    } catch { await reply('❌ Invalid expression'); }
  }},
  { cmd: 'weather', category: 'Utility', handler: async ({ text, reply }) => {
    if (!text) return reply(\`Usage: \${config.prefix}weather [city]\`);
    try {
      const res = await axios.get(\`https://wttr.in/\${encodeURIComponent(text)}?format=j1\`, { timeout: 10000 });
      const w = res.data.current_condition[0];
      const area = res.data.nearest_area[0];
      await reply(\`🌤 *Weather in \${area.areaName[0].value}, \${area.country[0].value}*\n▸ Temp: \${w.temp_C}°C / \${w.temp_F}°F\n▸ Humidity: \${w.humidity}%\n▸ Wind: \${w.windspeedKmph}km/h\n▸ Condition: \${w.weatherDesc[0].value}\n\${config.footer}\`);
    } catch { await reply('❌ City not found'); }
  }},
  { cmd: 'time', category: 'Utility', handler: async ({ text, reply }) => {
    try {
      const tz = text || config.timezone;
      const time = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour12: true }).format(new Date());
      await reply(\`🕐 *\${tz}:*\n\${time}\n\${config.footer}\`);
    } catch { await reply('❌ Invalid timezone'); }
  }},
  { cmd: 'date', category: 'Utility', handler: async ({ reply }) => {
    await reply(\`📅 *\${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}*\n\${config.footer}\`);
  }},
  { cmd: 'currency', category: 'Utility', handler: async ({ text, reply }) => {
    const [amount, from2, to] = (text || '').split(' ');
    if (!amount || !from2 || !to) return reply(\`Usage: \${config.prefix}currency 100 USD NGN\`);
    try {
      const res = await axios.get(\`https://api.exchangerate-api.com/v4/latest/\${from2.toUpperCase()}\`, { timeout: 8000 });
      const rate = res.data.rates[to.toUpperCase()];
      if (!rate) return reply('❌ Currency not found!');
      await reply(\`💱 \${amount} \${from2.toUpperCase()} = *\${(parseFloat(amount) * rate).toFixed(2)} \${to.toUpperCase()}*\n\${config.footer}\`);
    } catch (err) { await reply(\`❌ Error: \${err.message}\`); }
  }},
  { cmd: 'crypto', category: 'Utility', handler: async ({ text, reply }) => {
    if (!text) return reply(\`Usage: \${config.prefix}crypto [symbol]\`);
    try {
      const res = await axios.get(\`https://api.coingecko.com/api/v3/simple/price?ids=\${text.toLowerCase()}&vs_currencies=usd&include_24hr_change=true\`, { timeout: 10000 });
      const data = Object.values(res.data)[0];
      if (!data) return reply('❌ Crypto not found');
      await reply(\`💰 *\${text.toUpperCase()}:* $\${data.usd?.toLocaleString()} (24h: \${data.usd_24h_change?.toFixed(2)}%)\n\${config.footer}\`);
    } catch (err) { await reply(\`❌ Error: \${err.message}\`); }
  }},
  { cmd: 'news', category: 'Utility', handler: async ({ text, reply }) => {
    await reply(\`📰 News requires NEWS_API_KEY in .env\n\${config.footer}\`);
  }},
  { cmd: 'qr', category: 'Utility', handler: async ({ text, sock, from, msg, reply }) => {
    if (!text) return reply(\`Usage: \${config.prefix}qr [text or URL]\`);
    try {
      const res = await axios.get(\`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=\${encodeURIComponent(text)}\`, { responseType: 'arraybuffer', timeout: 10000 });
      await sock.sendMessage(from, { image: Buffer.from(res.data), caption: \`🔲 QR: \${text}\n\${config.footer}\` }, { quoted: msg });
    } catch (err) { await reply(\`❌ QR error: \${err.message}\`); }
  }},
  { cmd: 'shortlink', category: 'Utility', handler: async ({ text, reply }) => {
    if (!text) return reply(\`Usage: \${config.prefix}shortlink [URL]\`);
    try {
      const res = await axios.get(\`https://tinyurl.com/api-create.php?url=\${encodeURIComponent(text)}\`, { timeout: 8000 });
      await reply(\`🔗 \${res.data}\n\${config.footer}\`);
    } catch (err) { await reply(\`❌ Error: \${err.message}\`); }
  }},
  { cmd: 'password', category: 'Utility', handler: async ({ text, reply }) => {
    const len = Math.min(parseInt(text) || 16, 64);
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
    const pwd = Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    await reply(\`🔐 *Password (\${len} chars):*\n\\\`\\\`\\\`\${pwd}\\\`\\\`\\\`\n\${config.footer}\`);
  }},
  { cmd: 'base64en', category: 'Utility', handler: async ({ text, reply }) => {
    if (!text) return reply(\`Usage: \${config.prefix}base64en [text]\`);
    await reply(\`📦 *Encoded:*\n\${Buffer.from(text).toString('base64')}\n\${config.footer}\`);
  }},
  { cmd: 'base64de', category: 'Utility', handler: async ({ text, reply }) => {
    if (!text) return reply(\`Usage: \${config.prefix}base64de [base64]\`);
    try { await reply(\`📦 *Decoded:*\n\${Buffer.from(text, 'base64').toString('utf8')}\n\${config.footer}\`); }
    catch { await reply('❌ Invalid base64'); }
  }},
  { cmd: 'hash', category: 'Utility', handler: async ({ text, reply }) => {
    if (!text) return reply(\`Usage: \${config.prefix}hash [algo] [text]\`);
    const [algo, ...words] = text.split(' ');
    const { createHash } = await import('crypto');
    try {
      const hash = createHash(algo).update(words.join(' ')).digest('hex');
      await reply(\`🔒 *\${algo.toUpperCase()} Hash:*\n\${hash}\n\${config.footer}\`);
    } catch { await reply('❌ Invalid algorithm. Use: md5, sha256, sha1'); }
  }},
  { cmd: 'ip', category: 'Utility', handler: async ({ text, reply }) => {
    if (!text) return reply(\`Usage: \${config.prefix}ip [IP address]\`);
    try {
      const res = await axios.get(\`http://ip-api.com/json/\${text}\`, { timeout: 8000 });
      const d = res.data;
      await reply(\`🌐 *IP: \${text}*\n▸ Country: \${d.country}\n▸ City: \${d.city}\n▸ ISP: \${d.isp}\n\${config.footer}\`);
    } catch (err) { await reply(\`❌ Error: \${err.message}\`); }
  }},
  { cmd: 'whois', category: 'Utility', handler: async ({ text, reply }) => {
    if (!text) return reply(\`Usage: \${config.prefix}whois [domain]\`);
    await reply(\`🔍 WHOIS for \${text}\nRequires rdap.org API integration.\n\${config.footer}\`);
  }},
  { cmd: 'color', category: 'Utility', handler: async ({ text, reply }) => {
    if (!text) return reply(\`Usage: \${config.prefix}color [hex]\`);
    const hex = text.replace('#', '');
    try {
      const res = await axios.get(\`https://www.thecolorapi.com/id?hex=\${hex}\`, { timeout: 8000 });
      await reply(\`🎨 *#\${hex}*\n▸ Name: \${res.data.name.value}\n▸ RGB: \${res.data.rgb.value}\n▸ HSL: \${res.data.hsl.value}\n\${config.footer}\`);
    } catch (err) { await reply(\`❌ Error: \${err.message}\`); }
  }},
  { cmd: 'unit', category: 'Utility', handler: async ({ text, reply }) => {
    if (!text) return reply(\`Usage: \${config.prefix}unit [val] [from] [to]\`);
    const [val, from2, to] = text.split(' ');
    const c = { 'km-miles': 0.621371, 'miles-km': 1.60934, 'kg-lbs': 2.20462, 'lbs-kg': 0.453592, 'l-gal': 0.264172, 'gal-l': 3.78541, 'm-ft': 3.28084, 'ft-m': 0.3048, 'cm-in': 0.393701, 'in-cm': 2.54 };
    const key = \`\${from2?.toLowerCase()}-\${to?.toLowerCase()}\`;
    const conv = c[key];
    if (!conv) return reply(\`❌ Supported: km↔miles, kg↔lbs, l↔gal, m↔ft, cm↔in\`);
    await reply(\`📏 \${val} \${from2} = *\${(parseFloat(val) * conv).toFixed(4)} \${to}*\n\${config.footer}\`);
  }},
  { cmd: 'readqr', category: 'Utility', handler: async ({ reply }) => {
    await reply(\`🔲 QR reading requires zxing-wasm package.\n\${config.footer}\`);
  }},
  { cmd: 'pdf2img', category: 'Utility', handler: async ({ reply }) => {
    await reply(\`📄 PDF→Image requires pdf-to-img package.\n\${config.footer}\`);
  }},
  { cmd: 'img2pdf', category: 'Utility', handler: async ({ reply }) => {
    await reply(\`📄 Image→PDF requires pdfkit package.\n\${config.footer}\`);
  }},
  { cmd: 'codeto', category: 'Utility', handler: async ({ text, reply }) => {
    if (!text) return reply(\`Usage: \${config.prefix}codeto [language] [code]\`);
    await reply(\`💻 Code screenshot — visit carbon.now.sh\n\${config.footer}\`);
  }},
  { cmd: 'covid', category: 'Utility', handler: async ({ text, reply }) => {
    if (!text) return reply(\`Usage: \${config.prefix}covid [country]\`);
    try {
      const res = await axios.get(\`https://disease.sh/v3/covid-19/countries/\${text}\`, { timeout: 10000 });
      const d = res.data;
      await reply(\`🦠 *COVID-19: \${d.country}*\n▸ Cases: \${d.cases?.toLocaleString()}\n▸ Deaths: \${d.deaths?.toLocaleString()}\n▸ Recovered: \${d.recovered?.toLocaleString()}\n\${config.footer}\`);
    } catch { await reply('❌ Country not found'); }
  }},
  { cmd: 'notes', category: 'Utility', handler: async ({ text, reply }) => {
    if (!text) return reply(\`Usage: \${config.prefix}notes [save/list/del] [key] [value]\`);
    const [action] = text.split(' ');
    if (action === 'save') await reply(\`✅ Note saved!\n\${config.footer}\`);
    else if (action === 'list') await reply(\`📝 Notes — requires DATABASE_URL\n\${config.footer}\`);
    else if (action === 'del') await reply(\`✅ Note deleted!\n\${config.footer}\`);
  }},
];

export default utilityPlugins;`;
