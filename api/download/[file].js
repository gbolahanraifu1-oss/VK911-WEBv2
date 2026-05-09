// Vercel serverless handler for bot file downloads
// Mirrors the file content served from /api/download/[file] in the SPA

import { getBotFileContent } from "../../src/data/botFiles/mapper.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { file } = req.query;
  const content = getBotFileContent(file);

  if (!content) {
    return res.status(404).send(`// File not found: ${file}
// This file key does not exist in the bot files map.`);
  }

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  return res.status(200).send(content);
}