// VK911 XMD — Bot Files Index
// This file contains the list of all available bot files for download

export const BOT_FILE_KEYS = [
  "index-js",
  "config-js",
  "env-example",
  "lib_connection-js",
  "lib_handler-js",
  "lib_apiServer-js",
  "lib_functions-js",
  "lib_database-js",
  "plugins_admin-js",
  "plugins_group-js",
  "plugins_media-js",
  "plugins_downloader-js",
  "plugins_fun-js",
  "plugins_ai-js",
  "plugins_utility-js",
  "plugins_info-js",
  "plugins_nsfw-js",
  "README-md",
];

export const BOT_FILE_CATEGORIES = {
  core: ["index-js", "config-js", "env-example"],
  lib: [
    "lib_connection-js",
    "lib_handler-js",
    "lib_apiServer-js",
    "lib_functions-js",
    "lib_database-js",
  ],
  plugins: [
    "plugins_admin-js",
    "plugins_info-js",
    "plugins_fun-js",
    "plugins_ai-js",
    "plugins_downloader-js",
    "plugins_nsfw-js",
  ],
  docs: ["README-md"],
};

export const BOT_FILE_STRUCTURE = {
  "Core Files": [
    { name: "index.js", key: "index-js", desc: "Main entry point" },
    { name: "config.js", key: "config-js", desc: "Configuration" },
    { name: ".env.example", key: "env-example", desc: "Environment template" },
  ],
  "Library Files": [
    {
      name: "lib/connection.js",
      key: "lib_connection-js",
      desc: "WhatsApp connection handler",
    },
    {
      name: "lib/handler.js",
      key: "lib_handler-js",
      desc: "Plugin loader & message handler",
    },
    {
      name: "lib/apiServer.js",
      key: "lib_apiServer-js",
      desc: "Internal HTTP API server",
    },
    {
      name: "lib/functions.js",
      key: "lib_functions-js",
      desc: "Shared utility functions",
    },
    {
      name: "lib/database.js",
      key: "lib_database-js",
      desc: "Database handler (PostgreSQL)",
    },
  ],
  "Plugin Files": [
    {
      name: "plugins/admin.js",
      key: "plugins_admin-js",
      desc: "30 admin commands",
    },
    {
      name: "plugins/group.js",
      key: "plugins_group-js",
      desc: "25 group management commands",
    },
    {
      name: "plugins/media.js",
      key: "plugins_media-js",
      desc: "25 media processing commands",
    },
    {
      name: "plugins/downloader.js",
      key: "plugins_downloader-js",
      desc: "25 download commands (YT, TikTok, IG...)",
    },
    {
      name: "plugins/fun.js",
      key: "plugins_fun-js",
      desc: "30 fun & game commands",
    },
    {
      name: "plugins/ai.js",
      key: "plugins_ai-js",
      desc: "20 AI commands (GPT, Gemini, DALL-E)",
    },
    {
      name: "plugins/utility.js",
      key: "plugins_utility-js",
      desc: "25 utility tool commands",
    },
    {
      name: "plugins/info.js",
      key: "plugins_info-js",
      desc: "20 info & status commands",
    },
    {
      name: "plugins/nsfw.js",
      key: "plugins_nsfw-js",
      desc: "10 NSFW commands (disabled by default)",
    },
  ],
  Documentation: [
    {
      name: "README.md",
      key: "README-md",
      desc: "Setup guide & documentation",
    },
  ],
};

export const SETUP_STEPS = [
  {
    step: 1,
    title: "Download Files",
    desc: "Download all bot files using the buttons below",
  },
  { step: 2, title: "Install Dependencies", desc: "Run: npm install" },
  {
    step: 3,
    title: "Configure Environment",
    desc: "Copy .env.example to .env and fill in your values",
  },
  { step: 4, title: "Start Bot", desc: "Run: node index.js" },
  {
    step: 5,
    title: "Pair Device",
    desc: "Scan QR code or use pairing code from the web dashboard",
  },
];
