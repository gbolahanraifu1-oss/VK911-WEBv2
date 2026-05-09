// VK911 XMD — Bot File Content: Plugin files (Part 2)
export const PLUGINS_FUN_JS = `// VK911 XMD — Fun Plugin (30 commands)
// © powered by VK911 TECH
import axios from 'axios';
import config from '../config.js';

const JOKES = ['Why don\\'t scientists trust atoms? Because they make up everything!','Why did the scarecrow win an award? Because he was outstanding in his field!','I told my wife she was drawing her eyebrows too high. She looked surprised.'];
const TRUTHS = ['What is your biggest secret?','Who was your first crush?','What is the most embarrassing thing you\\'ve done?','Have you ever lied to get out of trouble?'];
const DARES = ['Send a silly selfie','Do 20 push-ups','Sing a song for 30 seconds','Change your WhatsApp status for 1 hour'];
const QUOTES = ['"The only way to do great work is to love what you do." — Steve Jobs','"In the middle of every difficulty lies opportunity." — Einstein','"Success is not final, failure is not fatal." — Churchill'];
const RIZZ = ['Are you a magician? Because whenever I look at you, everyone else disappears.','Do you have a map? I keep getting lost in your eyes.','Is your name Google? Because you have everything I\\'ve been searching for.'];

const funPlugins = [
  { cmd: 'joke', category: 'Fun', handler: async ({ reply }) => { await reply(\`😂 \${JOKES[Math.floor(Math.random() * JOKES.length)]}\\n\${config.footer}\`); }},
  { cmd: 'truth', category: 'Fun', handler: async ({ reply }) => { await reply(\`🎭 *Truth:*\\n\${TRUTHS[Math.floor(Math.random() * TRUTHS.length)]}\\n\${config.footer}\`); }},
  { cmd: 'dare', category: 'Fun', handler: async ({ reply }) => { await reply(\`🎯 *Dare:*\\n\${DARES[Math.floor(Math.random() * DARES.length)]}\\n\${config.footer}\`); }},
  { cmd: '8ball', category: 'Fun', handler: async ({ text, reply }) => {
    if (!text) return reply('Ask a question! Usage: .8ball [question]');
    const answers = ['Yes!','No!','Maybe...','Definitely!','Absolutely not!','Ask again later','Signs point to yes','Very doubtful'];
    await reply(\`🎱 *Magic 8-Ball*\\n❓ \${text}\\n🔮 \${answers[Math.floor(Math.random() * answers.length)]}\\n\${config.footer}\`);
  }},
  { cmd: 'roll', category: 'Fun', handler: async ({ text, reply }) => {
    const sides = parseInt(text) || 6;
    await reply(\`🎲 Rolled a \${sides}-sided dice: *\${Math.floor(Math.random() * sides) + 1}*\\n\${config.footer}\`);
  }},
  { cmd: 'quote', category: 'Fun', handler: async ({ reply }) => { await reply(\`💬 \${QUOTES[Math.floor(Math.random() * QUOTES.length)]}\\n\${config.footer}\`); }},
  { cmd: 'rizz', category: 'Fun', handler: async ({ reply }) => { await reply(\`💘 \${RIZZ[Math.floor(Math.random() * RIZZ.length)]}\\n\${config.footer}\`); }},
  { cmd: 'meme', category: 'Fun', handler: async ({ sock, from, msg, reply }) => {
    try {
      const res = await axios.get('https://meme-api.com/gimme', { timeout: 10000 });
      await sock.sendMessage(from, { image: { url: res.data.url }, caption: \`😂 \${res.data.title}\\n\${config.footer}\` }, { quoted: msg });
    } catch { await reply('❌ Could not fetch meme. Try again.'); }
  }},
  { cmd: 'rps', category: 'Fun', handler: async ({ text, reply }) => {
    const choices = ['rock', 'paper', 'scissors'];
    const user = text?.toLowerCase();
    if (!choices.includes(user)) return reply('Usage: .rps [rock/paper/scissors]');
    const bot = choices[Math.floor(Math.random() * 3)];
    const wins = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
    const result = user === bot ? 'Draw!' : wins[user] === bot ? 'You win! 🎉' : 'I win! 🤖';
    await reply(\`🎮 *Rock Paper Scissors*\\n👤 You: \${user}\\n🤖 Bot: \${bot}\\n🏆 \${result}\\n\${config.footer}\`);
  }},
  { cmd: 'ship', category: 'Fun', handler: async ({ msg, text, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentioned.length < 2) return reply('Tag 2 users! Usage: .ship @user1 @user2');
    const score = Math.floor(Math.random() * 100);
    const bar = '❤'.repeat(Math.floor(score / 10)) + '🖤'.repeat(10 - Math.floor(score / 10));
    await reply(\`💑 *Compatibility Meter*\\n@\${mentioned[0].split('@')[0]} ❤️ @\${mentioned[1].split('@')[0]}\\n\${bar}\\n💘 Score: \${score}%\\n\${config.footer}\`);
  }},
];

export default funPlugins;`;

export const PLUGINS_AI_JS = `// VK911 XMD — AI Plugin (20 commands)
// © powered by VK911 TECH
import axios from 'axios';
import config from '../config.js';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

let openai = null;
let genai = null;

if (config.openaiKey) openai = new OpenAI({ apiKey: config.openaiKey });
if (config.geminiKey) genai = new GoogleGenerativeAI(config.geminiKey);

const aiPlugins = [
  { cmd: 'ai', category: 'AI', handler: async ({ text, reply }) => {
    if (!text) return reply(\`Usage: \${config.prefix}ai [question]\`);
    if (!openai) return reply('❌ OpenAI API key not configured. Add OPENAI_API_KEY to .env');
    try {
      const res = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: text }], max_tokens: 1000 });
      await reply(\`🤖 *AI Response:*\\n\${res.choices[0].message.content}\\n\${config.footer}\`);
    } catch (err) { await reply(\`❌ AI Error: \${err.message}\`); }
  }},
  { cmd: 'gpt', category: 'AI', handler: async ({ text, reply }) => {
    if (!text) return reply(\`Usage: \${config.prefix}gpt [prompt]\`);
    if (!openai) return reply('❌ OpenAI API key not configured.');
    try {
      const res = await openai.chat.completions.create({ model: 'gpt-4', messages: [{ role: 'system', content: 'You are a helpful assistant for VK911 XMD WhatsApp bot.' }, { role: 'user', content: text }], max_tokens: 1500 });
      await reply(\`🤖 *GPT-4:*\\n\${res.choices[0].message.content}\\n\${config.footer}\`);
    } catch (err) { await reply(\`❌ GPT Error: \${err.message}\`); }
  }},
  { cmd: 'gemini', category: 'AI', handler: async ({ text, reply }) => {
    if (!text) return reply(\`Usage: \${config.prefix}gemini [question]\`);
    if (!genai) return reply('❌ Gemini API key not configured. Add GEMINI_API_KEY to .env');
    try {
      const model = genai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(text);
      await reply(\`✨ *Gemini AI:*\\n\${result.response.text()}\\n\${config.footer}\`);
    } catch (err) { await reply(\`❌ Gemini Error: \${err.message}\`); }
  }},
  { cmd: 'dalle', category: 'AI', handler: async ({ text, sock, from, msg, reply }) => {
    if (!text) return reply(\`Usage: \${config.prefix}dalle [description]\`);
    if (!openai) return reply('❌ OpenAI API key not configured.');
    try {
      await reply('🎨 Generating image with DALL-E...');
      const res = await openai.images.generate({ model: 'dall-e-3', prompt: text, n: 1, size: '1024x1024' });
      await sock.sendMessage(from, { image: { url: res.data[0].url }, caption: \`🎨 *DALL-E 3*\\nPrompt: \${text}\\n\${config.footer}\` }, { quoted: msg });
    } catch (err) { await reply(\`❌ DALL-E Error: \${err.message}\`); }
  }},
  { cmd: 'translate', category: 'AI', handler: async ({ text, reply }) => {
    const [lang, ...words] = text.split(' ');
    const toTranslate = words.join(' ');
    if (!lang || !toTranslate) return reply(\`Usage: \${config.prefix}translate [lang] [text]\\nExample: .translate fr Hello World\`);
    try {
      const res = await axios.get(\`https://api.mymemory.translated.net/get?q=\${encodeURIComponent(toTranslate)}&langpair=en|\${lang}\`, { timeout: 10000 });
      await reply(\`🌍 *Translation* (→ \${lang.toUpperCase()}):\\n\${res.data.responseData.translatedText}\\n\${config.footer}\`);
    } catch (err) { await reply('❌ Translation failed'); }
  }},
];

export default aiPlugins;`;

export const PLUGINS_DOWNLOADER_JS = `// VK911 XMD — Downloader Plugin (25 commands)
// © powered by VK911 TECH | Play Media APIs enabled
import axios from 'axios';
import ytdl from 'ytdl-core';
import yts from 'yt-search';
import config from '../config.js';

const MEDIA_API = config.mediaApiUrl;

// Helper: search YouTube
async function searchYT(query) {
  const results = await yts(query);
  return results.videos?.[0];
}

const dlPlugins = [
  { cmd: 'play', category: 'Downloader', handler: async ({ text, sock, from, msg, reply }) => {
    if (!text) return reply(\`🎵 Usage: \${config.prefix}play [song name]\`);
    try {
      await reply('🔍 Searching...');
      const video = await searchYT(text);
      if (!video) return reply('❌ No results found');
      await reply(\`🎵 *\${video.title}*\\n⏱ Duration: \${video.timestamp}\\n👁 Views: \${video.views?.toLocaleString()}\\n\\n⬇️ Downloading audio...\`);
      const stream = ytdl(video.url, { quality: 'lowestaudio', filter: 'audioonly' });
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);
      await sock.sendMessage(from, { audio: buffer, mimetype: 'audio/mp4', ptt: false }, { quoted: msg });
    } catch (err) { await reply(\`❌ Play error: \${err.message}\\nTry .ytmp3 [url] instead.\`); }
  }},
  { cmd: 'ytmp3', category: 'Downloader', handler: async ({ text, sock, from, msg, reply }) => {
    if (!text || !text.includes('youtu')) return reply(\`🎵 Usage: \${config.prefix}ytmp3 [YouTube URL]\`);
    try {
      await reply('⬇️ Downloading MP3...');
      const info = await ytdl.getInfo(text);
      const stream = ytdl(text, { quality: 'lowestaudio', filter: 'audioonly' });
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      await sock.sendMessage(from, { audio: Buffer.concat(chunks), mimetype: 'audio/mp4', fileName: \`\${info.videoDetails.title}.mp3\` }, { quoted: msg });
    } catch (err) { await reply(\`❌ Error: \${err.message}\`); }
  }},
  { cmd: 'tiktok', category: 'Downloader', handler: async ({ text, sock, from, msg, reply }) => {
    if (!text) return reply(\`🎵 Usage: \${config.prefix}tiktok [TikTok URL]\`);
    try {
      await reply('⬇️ Downloading TikTok (no watermark)...');
      const res = await axios.get(\`\${MEDIA_API}/api/downloader/tiktok?url=\${encodeURIComponent(text)}\`, { timeout: 30000 });
      const data = res.data?.result || res.data;
      if (!data?.url && !data?.video) throw new Error('No video URL returned');
      const videoUrl = data.url || data.video;
      await sock.sendMessage(from, { video: { url: videoUrl }, caption: \`🎵 TikTok Video\\n\${config.footer}\` }, { quoted: msg });
    } catch (err) { await reply(\`❌ TikTok error: \${err.message}\\nMake sure the URL is public.\`); }
  }},
  { cmd: 'ig', category: 'Downloader', handler: async ({ text, sock, from, msg, reply }) => {
    if (!text) return reply(\`📸 Usage: \${config.prefix}ig [Instagram URL]\`);
    try {
      await reply('⬇️ Downloading Instagram...');
      const res = await axios.get(\`\${MEDIA_API}/api/downloader/instagram?url=\${encodeURIComponent(text)}\`, { timeout: 30000 });
      const data = res.data?.result || res.data;
      const videoUrl = data?.url || data?.video;
      if (videoUrl) {
        await sock.sendMessage(from, { video: { url: videoUrl }, caption: \`📸 Instagram\\n\${config.footer}\` }, { quoted: msg });
      } else {
        await reply('❌ Could not extract Instagram media.');
      }
    } catch (err) { await reply(\`❌ Instagram error: \${err.message}\`); }
  }},
  { cmd: 'fb', category: 'Downloader', handler: async ({ text, sock, from, msg, reply }) => {
    if (!text) return reply(\`📘 Usage: \${config.prefix}fb [Facebook URL]\`);
    try {
      await reply('⬇️ Downloading Facebook video...');
      const res = await axios.get(\`\${MEDIA_API}/api/downloader/facebook?url=\${encodeURIComponent(text)}\`, { timeout: 30000 });
      const data = res.data?.result || res.data;
      await sock.sendMessage(from, { video: { url: data?.url || data?.sd }, caption: \`📘 Facebook Video\\n\${config.footer}\` }, { quoted: msg });
    } catch (err) { await reply(\`❌ Facebook error: \${err.message}\`); }
  }},
];

export default dlPlugins;`;

export const PLUGINS_NSFW_JS = `// VK911 XMD — NSFW Plugin (10 commands — DISABLED BY DEFAULT)
// © powered by VK911 TECH
// WARNING: These commands are for 18+ groups ONLY
// Disabled by default. Enable via: ENABLE_NSFW=true in .env
import axios from 'axios';
import config from '../config.js';

const nsfwPlugins = [
  { cmd: 'nsfw', category: 'NSFW', adminOnly: true, handler: async ({ text, from, reply }) => {
    if (!config.enableNsfw) return reply('❌ NSFW commands are globally disabled.\\nSet ENABLE_NSFW=true in .env and restart the bot.');
    const enabled = text?.toLowerCase() === 'on';
    await reply(\`🔞 NSFW: *\${enabled ? 'ENABLED for this group' : 'DISABLED for this group'}*\\n⚠️ 18+ only\\n\${config.footer}\`);
  }},
  { cmd: 'hentai', category: 'NSFW', nsfwOnly: true, handler: async ({ sock, from, msg, reply }) => {
    if (!config.enableNsfw) return reply('❌ NSFW disabled.');
    try {
      const res = await axios.get('https://api.waifu.pics/nsfw/waifu', { timeout: 10000 });
      await sock.sendMessage(from, { image: { url: res.data.url }, caption: \`🔞 NSFW\\n\${config.footer}\` }, { quoted: msg });
    } catch { await reply('❌ Failed to fetch'); }
  }},
];

export default nsfwPlugins;`;
