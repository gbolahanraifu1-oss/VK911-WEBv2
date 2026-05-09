"use client";
import { useState } from "react";
import { BOT_FILE_STRUCTURE, SETUP_STEPS } from "../../../data/botFilesIndex";

const FILE_ICONS = {
  "index-js": "🚀",
  "config-js": "⚙",
  "env-example": "🔑",
  "lib_connection-js": "🔌",
  "lib_handler-js": "⚡",
  "lib_apiServer-js": "🌐",
  "lib_functions-js": "🛠",
  "lib_database-js": "🗄",
  "plugins_admin-js": "👑",
  "plugins_group-js": "👥",
  "plugins_media-js": "🎬",
  "plugins_downloader-js": "📥",
  "plugins_fun-js": "🎉",
  "plugins_ai-js": "🤖",
  "plugins_utility-js": "🔧",
  "plugins_info-js": "ℹ️",
  "plugins_nsfw-js": "🔞",
  "README-md": "📖",
};

export default function DownloadPage() {
  const [activeKey, setActiveKey] = useState(null);
  const [activeFile, setActiveFile] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState("files");

  const fetchFile = async (key, name) => {
    if (activeKey === key) {
      setActiveKey(null);
      setCode("");
      return;
    }
    setActiveKey(key);
    setActiveFile(name);
    setLoading(true);
    setCopied(false);
    try {
      const res = await fetch(`/api/download/${key}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      setCode(text);
    } catch (err) {
      setCode(`// Error loading file: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (typeof navigator !== "undefined") navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    if (typeof document === "undefined") return;
    const blob = new Blob([code], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = activeFile || "file.js";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const totalFiles = Object.values(BOT_FILE_STRUCTURE).flat().length;

  return (
    <div style={{ padding: "32px", maxWidth: "1400px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: "800",
            color: "#f1f5f9",
            margin: "0 0 6px 0",
          }}
        >
          ↓ Download Bot Project
        </h1>
        <p style={{ color: "#475569", fontSize: "13px", margin: 0 }}>
          VK911 XMD v2.0.3 — {totalFiles} files — Click a file to view and
          download
        </p>
      </div>

      {/* Info Banner */}
      <div
        style={{
          background: "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: "12px",
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          gap: "12px",
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: "20px", flexShrink: 0 }}>📦</span>
        <div>
          <p
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#a5b4fc",
              margin: "0 0 4px 0",
            }}
          >
            How to Download the Bot
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "#64748b",
              margin: 0,
              lineHeight: "1.7",
            }}
          >
            Click any file → view its code → click{" "}
            <strong style={{ color: "#94a3b8" }}>Copy</strong> or{" "}
            <strong style={{ color: "#94a3b8" }}>Download</strong>. Create the
            folder structure on your VPS, paste each file, then run{" "}
            <code
              style={{
                background: "rgba(255,255,255,0.08)",
                padding: "1px 6px",
                borderRadius: "4px",
                fontFamily: "monospace",
                fontSize: "11px",
              }}
            >
              npm install && node index.js
            </code>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        {[
          ["files", "📁 Files"],
          ["setup", "🚀 Setup Guide"],
          ["structure", "🗂 Folder Structure"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: "9px 18px",
              background:
                tab === id ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.03)",
              border:
                tab === id
                  ? "1px solid rgba(0,255,136,0.3)"
                  : "1px solid rgba(255,255,255,0.06)",
              borderRadius: "8px",
              color: tab === id ? "#00ff88" : "#64748b",
              fontSize: "13px",
              fontWeight: tab === id ? "600" : "400",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "files" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: activeKey ? "320px 1fr" : "1fr",
            gap: "20px",
          }}
        >
          {/* File Groups */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {Object.entries(BOT_FILE_STRUCTURE).map(([groupName, files]) => (
              <div
                key={groupName}
                style={{
                  background: "#0f0f1a",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "11px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {groupName}{" "}
                  <span
                    style={{
                      padding: "1px 7px",
                      borderRadius: "99px",
                      background: "rgba(255,255,255,0.06)",
                      color: "#475569",
                      fontSize: "10px",
                    }}
                  >
                    {files.length}
                  </span>
                </div>
                {files.map((file) => (
                  <button
                    key={file.key}
                    onClick={() => fetchFile(file.key, file.name)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "11px 16px",
                      background:
                        activeKey === file.key
                          ? "rgba(0,255,136,0.08)"
                          : "transparent",
                      border: "none",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.1s",
                    }}
                    onMouseOver={(e) => {
                      if (activeKey !== file.key)
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.03)";
                    }}
                    onMouseOut={(e) => {
                      if (activeKey !== file.key)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span style={{ fontSize: "14px", flexShrink: 0 }}>
                      {FILE_ICONS[file.key] || "📄"}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: activeKey === file.key ? "#00ff88" : "#e2e8f0",
                          fontFamily: "monospace",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {file.name.split("/").pop()}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#475569",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {file.desc}
                      </div>
                    </div>
                    {activeKey === file.key && (
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#00ff88",
                          flexShrink: 0,
                          boxShadow: "0 0 6px #00ff88",
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            ))}

            {/* Stats */}
            <div
              style={{
                background: "#0f0f1a",
                border: "1px solid rgba(0,255,136,0.1)",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                {[
                  ["Total Files", totalFiles],
                  ["Commands", "214+"],
                  ["Plugins", "9"],
                  ["Version", "v2.0.3"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#334155",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                      }}
                    >
                      {k}
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "800",
                        color: "#00ff88",
                        fontFamily: "monospace",
                      }}
                    >
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Code Viewer */}
          {activeKey && (
            <div
              style={{
                background: "#080810",
                border: "1px solid rgba(0,255,136,0.15)",
                borderRadius: "14px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                maxHeight: "80vh",
                position: "sticky",
                top: "20px",
              }}
            >
              <div
                style={{
                  padding: "13px 16px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#0a0a16",
                  flexShrink: 0,
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span>{FILE_ICONS[activeKey] || "📄"}</span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#e2e8f0",
                      fontFamily: "monospace",
                    }}
                  >
                    {activeFile}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={copyCode}
                    style={{
                      padding: "6px 12px",
                      background: copied
                        ? "rgba(34,197,94,0.2)"
                        : "rgba(255,255,255,0.06)",
                      border: copied
                        ? "1px solid rgba(34,197,94,0.3)"
                        : "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "6px",
                      color: copied ? "#22c55e" : "#94a3b8",
                      fontSize: "11px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    {copied ? "✓ Copied" : "⎘ Copy"}
                  </button>
                  <button
                    onClick={downloadFile}
                    style={{
                      padding: "6px 12px",
                      background: "rgba(0,255,136,0.08)",
                      border: "1px solid rgba(0,255,136,0.2)",
                      borderRadius: "6px",
                      color: "#00ff88",
                      fontSize: "11px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    ↓ Save
                  </button>
                  <button
                    onClick={() => setActiveKey(null)}
                    style={{
                      padding: "6px 10px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "6px",
                      color: "#475569",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                {loading ? (
                  <div
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#334155",
                      fontFamily: "monospace",
                      fontSize: "12px",
                    }}
                  >
                    ⏳ Loading...
                  </div>
                ) : (
                  <pre
                    style={{
                      margin: 0,
                      padding: "18px",
                      fontSize: "11.5px",
                      lineHeight: "1.7",
                      color: "#94a3b8",
                      fontFamily: "'JetBrains Mono', monospace",
                      overflowX: "auto",
                      background: "transparent",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                    }}
                  >
                    {code || "// Click a file to view its code"}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "setup" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "16px",
          }}
        >
          {[
            {
              title: "1. Download Files",
              icon: "📥",
              steps: [
                "Click each file in the Files tab",
                "Copy or download to your computer",
                "Create matching folder structure on VPS",
              ],
            },
            {
              title: "2. Install Dependencies",
              icon: "📦",
              steps: [
                "Ensure Node.js 18+ is installed: node --version",
                "Run: npm install",
                "Install ffmpeg: sudo apt install ffmpeg (Linux)",
              ],
            },
            {
              title: "3. Configure .env",
              icon: "🔑",
              steps: [
                "Copy .env.example to .env: cp .env.example .env",
                "Edit: OWNER_NUMBER=2347001234567",
                "Add API keys (OpenAI, Gemini, etc.)",
                "Set CHANNEL_LINK to your WhatsApp channel",
              ],
            },
            {
              title: "4. Start the Bot",
              icon: "🚀",
              steps: [
                "Run: node index.js",
                "First run: scan QR or use pairing code",
                "Bot saves session — auto-reconnects",
                "Use PM2 to keep alive: pm2 start index.js --name vk911-xmd",
              ],
            },
            {
              title: "5. Deploy Web Dashboard",
              icon: "🌐",
              steps: [
                "Web folder is this Next.js app",
                "Deploy to Vercel, Netlify, or cPanel",
                "Bot and web run on SEPARATE servers",
                "Dashboard connects to bot via API port 3001",
              ],
            },
            {
              title: "6. Verify Everything",
              icon: "✅",
              steps: [
                "Open dashboard → Web Pairing",
                "Enter your bot server URL (http://vps-ip:3001)",
                "Request QR or pairing code",
                "Confirm status shows Connected",
              ],
            },
          ].map((section, i) => (
            <div
              key={i}
              style={{
                background: "#0f0f1a",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "14px",
                padding: "20px",
              }}
            >
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#00ff88",
                  margin: "0 0 14px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>{section.icon}</span>
                {section.title}
              </h3>
              {section.steps.map((step, j) => (
                <div
                  key={j}
                  style={{ display: "flex", gap: "10px", marginBottom: "8px" }}
                >
                  <span
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "rgba(0,255,136,0.1)",
                      border: "1px solid rgba(0,255,136,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "9px",
                      fontWeight: "700",
                      color: "#00ff88",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  >
                    {j + 1}
                  </span>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#94a3b8",
                      margin: 0,
                      lineHeight: "1.6",
                    }}
                  >
                    {step}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {tab === "structure" && (
        <div
          style={{
            background: "#080810",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "14px",
            padding: "24px",
          }}
        >
          <h3
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              margin: "0 0 20px 0",
            }}
          >
            ⬦ Required Folder Structure on VPS
          </h3>
          <pre
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "12px",
              color: "#94a3b8",
              lineHeight: "2",
              margin: 0,
            }}
          >
            {`vk911-xmd/
├── 🚀 index.js          ← npm start runs this
├── ⚙  config.js         ← Bot config (reads from .env)
├── 🔑 .env              ← Your API keys & settings
├── 📁 lib/
│   ├── connection.js    ← Baileys WhatsApp connection
│   ├── handler.js       ← Plugin system & message router
│   ├── apiServer.js     ← HTTP API (port 3001) for dashboard
│   ├── functions.js     ← Shared utils (ffmpeg, downloads)
│   └── database.js      ← PostgreSQL (optional, for settings)
├── 📁 plugins/          ← 214+ commands in 9 plugin files
│   ├── admin.js         30 commands — ban, kick, promote...
│   ├── group.js         25 commands — tagall, poll, hidetag...
│   ├── media.js         25 commands — sticker, tts, ttp...
│   ├── downloader.js    25 commands — play, ytmp3, tiktok...
│   ├── fun.js           30 commands — joke, meme, 8ball...
│   ├── ai.js            20 commands — gpt, gemini, dalle...
│   ├── utility.js       25 commands — calc, weather, qr...
│   ├── info.js          20 commands — menu, ping, alive...
│   └── nsfw.js          10 commands — DISABLED by default
├── 📁 sessions/         ← Auto-created on first pairing
│   └── VK911-Session/   ← WhatsApp session data
└── 📁 temp/             ← Temp media (auto-cleaned hourly)

─────────────────────────────────────────────────────
VPS Setup Commands:
  node --version          ← Must be 18+
  npm install             ← Install all dependencies
  cp .env.example .env    ← Copy and edit config
  node index.js           ← Start (first run: scan QR)
  pm2 start index.js --name vk911-xmd  ← Keep alive
─────────────────────────────────────────────────────
Web Dashboard (separate deployment):
  Platform: Next.js (already on your web host)
  Connect: Enter bot URL in Web Pairing page
  Bot API port: 3001 (configure in .env)
─────────────────────────────────────────────────────
WhatsApp Channel (auto-followed on start):
  Name: VK911 XMD Official
  Link: https://whatsapp.com/channel/0029VaYpQHFHXotnpcTf3C3T
─────────────────────────────────────────────────────
                   © powered by VK911 TECH | v2.0.3`}
          </pre>
        </div>
      )}

      <div
        style={{
          marginTop: "24px",
          padding: "16px 20px",
          background: "rgba(0,255,136,0.04)",
          border: "1px solid rgba(0,255,136,0.1)",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <p style={{ fontSize: "12px", color: "#475569", margin: 0 }}>
          📢 Stay updated — Follow the official channel for bot updates & tips
        </p>
        <a
          href="https://whatsapp.com/channel/0029VaYpQHFHXotnpcTf3C3T"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "8px 16px",
            background: "rgba(0,255,136,0.1)",
            border: "1px solid rgba(0,255,136,0.25)",
            borderRadius: "8px",
            color: "#00ff88",
            fontSize: "12px",
            fontWeight: "600",
            textDecoration: "none",
          }}
        >
          📢 VK911 XMD Channel →
        </a>
      </div>
    </div>
  );
}
