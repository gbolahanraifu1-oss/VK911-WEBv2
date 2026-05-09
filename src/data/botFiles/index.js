// VK911 XMD — Bot File Content: index.js
export const INDEX_JS = `// ╔═══════════════════════════════════════════════════╗
// ║   VK911 XMD — Main Entry Point                    ║
// ║   © powered by VK911 TECH | Version v2.0.3        ║
// ╚═══════════════════════════════════════════════════╝
import 'dotenv/config';
import fs from 'fs-extra';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pino from 'pino';
import config from './config.js';
import { startConnection } from './lib/connection.js';
import { loadPlugins } from './lib/handler.js';
import { startApiServer } from './lib/apiServer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const logger = pino({
  transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' } },
});

console.log(\`
╔═══════════════════════════════════════════════╗
║         VK911 XMD — WhatsApp Bot v2.0.3       ║
║         © powered by VK911 TECH               ║
╚═══════════════════════════════════════════════╝\`);

async function main() {
  await fs.ensureDir(join(__dirname, 'sessions', config.sessionName));
  await fs.ensureDir(join(__dirname, 'temp'));
  logger.info('[VK911] Loading plugins...');
  await loadPlugins(join(__dirname, 'plugins'));
  logger.info(\`[VK911] Starting API server on port \${config.botApiPort}\`);
  await startApiServer(config.botApiPort);
  logger.info('[VK911] Connecting to WhatsApp...');
  await startConnection(logger);
  logger.info('[VK911] VK911 XMD v2.0.3 is ready!');
}

main().catch(err => { logger.error('[VK911] Fatal:', err); process.exit(1); });`;
