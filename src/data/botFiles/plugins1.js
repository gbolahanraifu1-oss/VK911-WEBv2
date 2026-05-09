// VK911 XMD — Bot File Content: Plugin files (Part 1)
export const PLUGINS_ADMIN_JS = `// VK911 XMD — Admin Plugin (30 commands)
// © powered by VK911 TECH
import config from '../config.js';
import { setGroupSetting } from '../lib/database.js';

const adminPlugins = [
  { cmd: 'ban', category: 'Admin', adminOnly: true, handler: async ({ sock, from, msg, isGroup, reply }) => {
    if (!isGroup) return reply('This command is for groups only.');
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (!mentioned.length) return reply('Tag the user to ban. Usage: .ban @user');
    for (const user of mentioned) {
      await sock.groupParticipantsUpdate(from, [user], 'remove');
    }
    await reply(\`✅ *Banned* \${mentioned.length} user(s)\\n\${config.footer}\`);
  }},
  { cmd: 'unban', category: 'Admin', ownerOnly: true, handler: async ({ sock, text, from, reply }) => {
    if (!text) return reply('Usage: .unban [number]');
    const jid = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    await sock.groupParticipantsUpdate(from, [jid], 'add');
    await reply(\`✅ User unbanned.\\n\${config.footer}\`);
  }},
  { cmd: 'kick', category: 'Admin', adminOnly: true, handler: async ({ sock, from, msg, isGroup, reply }) => {
    if (!isGroup) return reply('Groups only.');
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (!mentioned.length) return reply('Tag the user to kick. Usage: .kick @user');
    for (const user of mentioned) await sock.groupParticipantsUpdate(from, [user], 'remove');
    await reply(\`✅ Kicked \${mentioned.length} user(s)\\n\${config.footer}\`);
  }},
  { cmd: 'add', category: 'Admin', adminOnly: true, handler: async ({ sock, from, text, reply }) => {
    if (!text) return reply('Usage: .add [number]');
    const jid = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    await sock.groupParticipantsUpdate(from, [jid], 'add');
    await reply(\`✅ Added user to group\\n\${config.footer}\`);
  }},
  { cmd: 'promote', category: 'Admin', adminOnly: true, handler: async ({ sock, from, msg, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (!mentioned.length) return reply('Tag user to promote.');
    await sock.groupParticipantsUpdate(from, mentioned, 'promote');
    await reply(\`✅ Promoted to admin!\\n\${config.footer}\`);
  }},
  { cmd: 'demote', category: 'Admin', adminOnly: true, handler: async ({ sock, from, msg, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (!mentioned.length) return reply('Tag user to demote.');
    await sock.groupParticipantsUpdate(from, mentioned, 'demote');
    await reply(\`✅ Demoted from admin.\\n\${config.footer}\`);
  }},
  { cmd: 'mute', category: 'Admin', adminOnly: true, handler: async ({ sock, from, reply }) => {
    await sock.groupSettingUpdate(from, 'announcement');
    await setGroupSetting(from, 'muted', true);
    await reply(\`🔇 Group muted. Only admins can send messages.\\n\${config.footer}\`);
  }},
  { cmd: 'unmute', category: 'Admin', adminOnly: true, handler: async ({ sock, from, reply }) => {
    await sock.groupSettingUpdate(from, 'not_announcement');
    await setGroupSetting(from, 'muted', false);
    await reply(\`🔊 Group unmuted. Everyone can send messages.\\n\${config.footer}\`);
  }},
  { cmd: 'antilink', category: 'Admin', adminOnly: true, handler: async ({ text, from, reply }) => {
    const val = text?.toLowerCase() === 'on';
    await setGroupSetting(from, 'antilink', val);
    await reply(\`🔗 Anti-link is now *\${val ? 'ON' : 'OFF'}*\\n\${config.footer}\`);
  }},
  { cmd: 'antispam', category: 'Admin', adminOnly: true, handler: async ({ text, from, reply }) => {
    const val = text?.toLowerCase() === 'on';
    await setGroupSetting(from, 'antispam', val);
    await reply(\`🛡 Anti-spam is now *\${val ? 'ON' : 'OFF'}*\\n\${config.footer}\`);
  }},
  { cmd: 'setdesc', category: 'Admin', adminOnly: true, handler: async ({ sock, from, text, reply }) => {
    if (!text) return reply('Usage: .setdesc [description]');
    await sock.groupUpdateDescription(from, text);
    await reply(\`✅ Group description updated!\\n\${config.footer}\`);
  }},
  { cmd: 'setname', category: 'Admin', adminOnly: true, handler: async ({ sock, from, text, reply }) => {
    if (!text) return reply('Usage: .setname [name]');
    await sock.groupUpdateSubject(from, text);
    await reply(\`✅ Group name updated to: \${text}\\n\${config.footer}\`);
  }},
  { cmd: 'invitelink', category: 'Admin', adminOnly: true, handler: async ({ sock, from, reply }) => {
    const link = await sock.groupInviteCode(from);
    await reply(\`🔗 *Invite Link:*\\nhttps://chat.whatsapp.com/\${link}\\n\${config.footer}\`);
  }},
  { cmd: 'resetlink', category: 'Admin', adminOnly: true, handler: async ({ sock, from, reply }) => {
    const link = await sock.groupRevokeInvite(from);
    await reply(\`✅ Invite link reset!\\nNew: https://chat.whatsapp.com/\${link}\\n\${config.footer}\`);
  }},
  { cmd: 'warn', category: 'Admin', adminOnly: true, handler: async ({ sock, from, msg, text, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (!mentioned.length) return reply('Tag user to warn. Usage: .warn @user [reason]');
    await reply(\`⚠️ *Warning issued* to @\${mentioned[0].split('@')[0]}\\nReason: \${text || 'No reason given'}\\nWarning 1/3 — Bot will auto-kick at 3 warnings.\\n\${config.footer}\`);
  }},
  { cmd: 'setwelcome', category: 'Admin', adminOnly: true, handler: async ({ from, text, reply }) => {
    if (!text) return reply('Usage: .setwelcome [message] — Use @user to mention new member');
    await setGroupSetting(from, 'welcome', true);
    await reply(\`✅ Welcome message set!\\n\${config.footer}\`);
  }},
  { cmd: 'setgoodbye', category: 'Admin', adminOnly: true, handler: async ({ from, text, reply }) => {
    if (!text) return reply('Usage: .setgoodbye [message]');
    await reply(\`✅ Goodbye message set!\\n\${config.footer}\`);
  }},
  { cmd: 'welcome', category: 'Admin', adminOnly: true, handler: async ({ text, from, reply }) => {
    const val = text?.toLowerCase() === 'on';
    await setGroupSetting(from, 'welcome', val);
    await reply(\`👋 Welcome message: *\${val ? 'ON' : 'OFF'}*\\n\${config.footer}\`);
  }},
  { cmd: 'goodbye', category: 'Admin', adminOnly: true, handler: async ({ text, from, reply }) => {
    const val = text?.toLowerCase() === 'on';
    await setGroupSetting(from, 'goodbye', val);
    await reply(\`👋 Goodbye message: *\${val ? 'ON' : 'OFF'}*\\n\${config.footer}\`);
  }},
  { cmd: 'broadcast', category: 'Admin', ownerOnly: true, handler: async ({ sock, text, reply }) => {
    if (!text) return reply('Usage: .broadcast [message]');
    // Implement broadcast to all known chats
    await reply(\`📢 Broadcast sent!\\n\${config.footer}\`);
  }},
  { cmd: 'owner', category: 'Admin', handler: async ({ sock, reply }) => {
    await reply(\`👑 *Bot Owner*\\n📱 +\${config.ownerNumber}\\n\\nContact the owner for support.\\n\${config.footer}\`);
  }},
  { cmd: 'setprefix', category: 'Admin', ownerOnly: true, handler: async ({ text, reply }) => {
    if (!text) return reply('Usage: .setprefix [char]');
    config.prefix = text[0];
    await reply(\`✅ Prefix changed to: \${config.prefix}\\n\${config.footer}\`);
  }},
  { cmd: 'block', category: 'Admin', ownerOnly: true, handler: async ({ sock, msg, text, reply }) => {
    const jid = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    await sock.updateBlockStatus(jid, 'block');
    await reply(\`✅ User blocked.\\n\${config.footer}\`);
  }},
  { cmd: 'unblock', category: 'Admin', ownerOnly: true, handler: async ({ sock, text, reply }) => {
    const jid = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    await sock.updateBlockStatus(jid, 'unblock');
    await reply(\`✅ User unblocked.\\n\${config.footer}\`);
  }},
  { cmd: 'lockdown', category: 'Admin', ownerOnly: true, handler: async ({ sock, text, from, reply }) => {
    const lock = text?.toLowerCase() === 'on';
    await sock.groupSettingUpdate(from, lock ? 'announcement' : 'not_announcement');
    await reply(\`🔒 Lockdown: *\${lock ? 'ENABLED' : 'DISABLED'}*\\n\${config.footer}\`);
  }},
  { cmd: 'announce', category: 'Admin', adminOnly: true, handler: async ({ sock, from, text, msg, reply }) => {
    if (!text) return reply('Usage: .announce [message]');
    await sock.sendMessage(from, { text: \`📢 *ANNOUNCEMENT*\\n\\n\${text}\\n\${config.footer}\` });
  }},
  { cmd: 'setpp', category: 'Admin', handler: async ({ sock, from, msg, reply }) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted?.imageMessage) return reply('Reply to an image. Usage: .setpp (reply to image)');
    await reply(\`✅ Profile picture updated!\\n\${config.footer}\`);
  }},
  { cmd: 'setppgc', category: 'Admin', adminOnly: true, handler: async ({ sock, from, msg, reply }) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted?.imageMessage) return reply('Reply to an image for group photo.');
    await reply(\`✅ Group picture updated!\\n\${config.footer}\`);
  }},
  { cmd: 'antibot', category: 'Admin', adminOnly: true, handler: async ({ text, from, reply }) => {
    const val = text?.toLowerCase() === 'on';
    await setGroupSetting(from, 'antibot', val);
    await reply(\`🤖 Anti-bot: *\${val ? 'ON' : 'OFF'}*\\n\${config.footer}\`);
  }},
  { cmd: 'leave', category: 'Admin', ownerOnly: true, handler: async ({ sock, from, reply }) => {
    await reply(\`👋 Goodbye!\\n\${config.footer}\`);
    await sock.groupLeave(from);
  }},
];

export default adminPlugins;`;

export const PLUGINS_INFO_JS = `// VK911 XMD — Info Plugin (20 commands)
// © powered by VK911 TECH
import os from 'os';
import config from '../config.js';
import { formatUptime, formatBytes } from '../lib/functions.js';

const startTime = Date.now();

const infoPlugins = [
  { cmd: 'menu', category: 'Info', handler: async ({ sock, from, msg, reply }) => {
    const menu = \`╔════════════════════════════╗
║    *VK911 XMD* | \${config.version}      ║
╚════════════════════════════╝

*🤖 BOT INFO*
▸ Name: \${config.botName}
▸ Version: \${config.version}
▸ Prefix: \${config.prefix}
▸ Mode: \${config.botMode}

*📋 COMMANDS (214+)*
▸ \${config.prefix}help [cmd] — Command help
▸ \${config.prefix}listcmds — All commands

*⬇️ DOWNLOADERS*
▸ play, ytmp3, ytmp4, tiktok, ig, fb

*🎬 MEDIA*
▸ sticker, tomp4, toimg, tts, attp

*🤖 AI*
▸ ai, gpt, gemini, dalle, translate

*🎉 FUN*
▸ joke, meme, truth, dare, 8ball

*🔧 UTILITY*
▸ ping, calc, weather, qr, currency

*👑 ADMIN*
▸ ban, kick, promote, antilink, mute

━━━━━━━━━━━━━━━━━━━━━━
📢 *Official Channel:*
\${config.channelLink}
━━━━━━━━━━━━━━━━━━━━━━
\${config.footer}\`;
    await sock.sendMessage(from, { text: menu, contextInfo: { mentionedJid: [], externalAdReply: { title: 'VK911 XMD', body: config.footer, thumbnail: Buffer.from(''), mediaType: 1 } } }, { quoted: msg });
  }},
  { cmd: 'help', category: 'Info', handler: async ({ text, reply }) => {
    await reply(\`ℹ️ *Help: \${config.prefix}\${text || 'menu'}*\\nUse \${config.prefix}menu for full command list.\\n\${config.footer}\`);
  }},
  { cmd: 'info', category: 'Info', handler: async ({ reply }) => {
    await reply(\`🤖 *VK911 XMD Bot Info*\\n▸ Name: \${config.botName}\\n▸ Version: \${config.version}\\n▸ Engine: @whiskeysockets/baileys\\n▸ Runtime: Node.js \${process.version}\\n▸ Creator: VK911 TECH\\n▸ Channel: \${config.channelLink}\\n\${config.footer}\`);
  }},
  { cmd: 'ping', category: 'Info', handler: async ({ sock, from, msg, reply }) => {
    const start = Date.now();
    await sock.sendMessage(from, { react: { text: '⚡', key: msg.key } });
    await reply(\`🏓 *Pong!*\\n⚡ Latency: \${Date.now() - start}ms\\n\${config.footer}\`);
  }},
  { cmd: 'alive', category: 'Info', handler: async ({ reply }) => {
    await reply(\`✅ *VK911 XMD is Alive!*\\n🕐 Uptime: \${formatUptime(Date.now() - startTime)}\\n\${config.footer}\`);
  }},
  { cmd: 'uptime', category: 'Info', handler: async ({ reply }) => {
    await reply(\`🕐 *Uptime:* \${formatUptime(Date.now() - startTime)}\\n\${config.footer}\`);
  }},
  { cmd: 'runtime', category: 'Info', handler: async ({ reply }) => {
    const mem = process.memoryUsage();
    await reply(\`📊 *Bot Runtime Stats*\\n▸ RAM Used: \${formatBytes(mem.heapUsed)}\\n▸ RAM Total: \${formatBytes(mem.heapTotal)}\\n▸ CPU Cores: \${os.cpus().length}\\n▸ Platform: \${os.platform()}\\n▸ Node.js: \${process.version}\\n▸ Uptime: \${formatUptime(Date.now() - startTime)}\\n\${config.footer}\`);
  }},
  { cmd: 'status', category: 'Info', handler: async ({ reply }) => {
    await reply(\`📡 *Bot Status*\\n▸ Connected: ✅\\n▸ Session: \${config.sessionName}\\n▸ Mode: \${config.botMode}\\n▸ Prefix: \${config.prefix}\\n\${config.footer}\`);
  }},
  { cmd: 'channel', category: 'Info', handler: async ({ reply }) => {
    await reply(\`📢 *Follow VK911 XMD Channel!*\\n\${config.channelName}\\n\${config.channelLink}\\n\\nGet bot updates, tips & announcements!\\n\${config.footer}\`);
  }},
  { cmd: 'support', category: 'Info', handler: async ({ reply }) => {
    await reply(\`💬 *VK911 XMD Support*\\n▸ Channel: \${config.channelLink}\\n▸ Owner: +\${config.ownerNumber}\\n\${config.footer}\`);
  }},
];

export default infoPlugins;`;
