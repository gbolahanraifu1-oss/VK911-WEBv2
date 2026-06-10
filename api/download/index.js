import https from "https";

// Map of file keys to their actual paths in the VK911_MINI_XMD GitHub repo
const FILE_MAP = {
  "index-js": "index.js",
  "config-js": "config.js",
  "env-example": ".env.example",
  "handler-js": "handler.js",
  "database-js": "database.js",
  "pairapi-js": "pairApi.js",
  "README-md": "Readme.md",
};

const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/GBEXCHANGE/VK911-BOT/main";

function fetchRaw(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 200) resolve(data);
        else reject(new Error(`HTTP ${res.statusCode}`));
      });
    }).on("error", reject);
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // GET /api/download?key=index-js
  const key = req.query?.key || req.url?.split("?key=")[1]?.split("&")[0];
  if (!key) return res.status(400).json({ error: "key param required" });

  const filePath = FILE_MAP[key];
  if (!filePath) return res.status(404).json({ error: "Unknown file key" });

  try {
    const content = await fetchRaw(`${GITHUB_RAW_BASE}/${filePath}`);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(200).send(content);
  } catch (err) {
    return res.status(502).json({ error: `Could not fetch file: ${err.message}` });
  }
}
