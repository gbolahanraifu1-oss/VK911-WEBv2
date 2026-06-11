import https from "https";

// FILE_MAP: GitHub raw fallback for keys NOT in the local mapper
const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/GBEXCHANGE/VK911-BOT/main";
const GITHUB_FILE_MAP = {
  "index-js":    "index.js",
  "config-js":   "config.js",
  "env-example": ".env.example",
  "handler-js":  "handler.js",
  "database-js": "database.js",
  "README-md":   "Readme.md",
};

function fetchRaw(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
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

  const [pathPart, queryStr] = (req.url || "").split("?");
  const segments  = pathPart.split("/").filter(Boolean);
  const pathFile  = segments.length > 2 ? segments[segments.length - 1] : null;
  const params    = new URLSearchParams(queryStr || "");
  const keyParam  = params.get("key");
  const fileParam = params.get("file") || pathFile;

  // ── Key-based lookup: check local mapper first, then GitHub raw ──
  if (keyParam) {
    // 1. Try local mapper (served from this repo — always the fixed version)
    try {
      const { getBotFileContent } = await import("../src/data/botFiles/mapper.js");
      const local = getBotFileContent(keyParam);
      if (local) {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache");
        return res.status(200).send(local);
      }
    } catch {}

    // 2. Fall back to GitHub raw for keys not in local mapper
    const filePath = GITHUB_FILE_MAP[keyParam];
    if (!filePath) return res.status(404).json({ error: "Unknown file key: " + keyParam });
    try {
      const content = await fetchRaw(`${GITHUB_RAW_BASE}/${filePath}`);
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.status(200).send(content);
    } catch (err) {
      return res.status(502).json({ error: "Could not fetch file: " + err.message });
    }
  }

  // ── File-based lookup (path segment or ?file=): always use mapper ──
  if (fileParam) {
    try {
      const { getBotFileContent } = await import("../src/data/botFiles/mapper.js");
      const content = getBotFileContent(fileParam);
      if (!content) return res.status(404).send("// File not found: " + fileParam);
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      return res.status(200).send(content);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: "Provide ?key= or ?file= parameter" });
}
