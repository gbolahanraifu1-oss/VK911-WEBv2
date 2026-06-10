import { useState } from "react";

const BOT_FILE_STRUCTURE = {
  "Core Files": [
    { name: "index.js", key: "index-js", desc: "Main entry point — bot startup & session management" },
    { name: "config.js", key: "config-js", desc: "Bot configuration — prefix, owner, feature flags" },
    { name: "handler.js", key: "handler-js", desc: "Message handler & command dispatcher" },
    { name: "database.js", key: "database-js", desc: "Database helper utilities" },
  ],
  "API & Pairing": [
    { name: "pairApi.js", key: "pairapi-js", desc: "Web pairing API server — GET /pair?phone=..." },
  ],
  Documentation: [
    { name: "Readme.md", key: "README-md", desc: "Setup guide & deployment instructions" },
  ],
};

const FILE_ICONS = {
  "index-js": "🚀", "config-js": "⚙", "handler-js": "⚡", "database-js": "🗄",
  "pairapi-js": "🔌", "README-md": "📖",
};

const SETUP_STEPS = [
  { step: "1", title: "Clone or download the bot files", cmd: "git clone https://github.com/GBEXCHANGE/VK911-BOT.git" },
  { step: "2", title: "Install dependencies", cmd: "cd VK911-BOT && npm install" },
  { step: "3", title: "Set up environment variables", cmd: "cp .env.example .env && nano .env" },
  { step: "4", title: "Add your SESSION_ID to .env", cmd: 'SESSION_ID="your-session-string-here"' },
  { step: "5", title: "Start the bot", cmd: "node index.js" },
];

export default function DownloadPage() {
  const [activeKey, setActiveKey] = useState(null);
  const [activeFile, setActiveFile] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState("files");

  const fetchFile = async (key, name) => {
    if (activeKey === key) { setActiveKey(null); setCode(""); return; }
    setActiveKey(key);
    setActiveFile(name);
    setLoading(true);
    setCopied(false);
    try {
      const res = await fetch(`/api/download?key=${key}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      setCode(text);
    } catch (err) {
      setCode(`// Error loading file: ${err.message}\n// Try downloading directly from: https://github.com/GBEXCHANGE/VK911-BOT`);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
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
        <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#f1f5f9", margin: "0 0 6px 0" }}>↓ Download Bot Project</h1>
        <p style={{ color: "#475569", fontSize: "13px", margin: 0 }}>VK911 MINI XMD — {totalFiles} files — Click a file to preview and download</p>
      </div>

      {/* Info Banner */}
      <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "12px", padding: "16px 20px", marginBottom: "24px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
        <span style={{ fontSize: "20px", flexShrink: 0 }}>📦</span>
        <div>
          <p style={{ fontSize: "13px", fontWeight: "600", color: "#a5b4fc", margin: "0 0 4px 0" }}>Full Bot Source</p>
          <p style={{ fontSize: "12px", color: "#64748b", margin: 0, lineHeight: "1.7" }}>
            Click any file to view its source code, then copy or download it.{" "}
            <a href="https://github.com/GBEXCHANGE/VK911-BOT" target="_blank" rel="noopener noreferrer" style={{ color: "#6366f1", fontWeight: "600" }}>View full repo on GitHub →</a>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
        {[["files", "📁 Files"], ["setup", "🚀 Setup Guide"], ["structure", "🗂 Folder Structure"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: "9px 18px", background: tab === id ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.03)", border: tab === id ? "1px solid rgba(0,255,136,0.3)" : "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", color: tab === id ? "#00ff88" : "#64748b", fontSize: "13px", fontWeight: tab === id ? "600" : "400", cursor: "pointer" }}>{label}</button>
        ))}
      </div>

      {tab === "files" && (
        <div style={{ display: "grid", gridTemplateColumns: activeKey ? "300px 1fr" : "1fr", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {Object.entries(BOT_FILE_STRUCTURE).map(([groupName, files]) => (
              <div key={groupName} style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden" }}>
                <div style={{ padding: "11px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  {groupName} <span style={{ padding: "1px 7px", borderRadius: "99px", background: "rgba(255,255,255,0.06)", color: "#475569", fontSize: "10px" }}>{files.length}</span>
                </div>
                {files.map((file) => (
                  <button key={file.key} onClick={() => fetchFile(file.key, file.name)} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "11px 16px", background: activeKey === file.key ? "rgba(0,255,136,0.08)" : "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.03)", cursor: "pointer", textAlign: "left" }}
                    onMouseOver={(e) => { if (activeKey !== file.key) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                    onMouseOut={(e) => { if (activeKey !== file.key) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ fontSize: "14px", flexShrink: 0 }}>{FILE_ICONS[file.key] || "📄"}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "12px", fontWeight: "600", color: activeKey === file.key ? "#00ff88" : "#e2e8f0", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                      <div style={{ fontSize: "10px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.desc}</div>
                    </div>
                    {activeKey === file.key && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00ff88", flexShrink: 0, boxShadow: "0 0 6px #00ff88" }} />}
                  </button>
                ))}
              </div>
            ))}

            {/* Stats */}
            <div style={{ background: "#0f0f1a", border: "1px solid rgba(0,255,136,0.1)", borderRadius: "12px", padding: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {[["Total Files", totalFiles], ["Commands", "200+"], ["Plugins", "9"], ["Version", "v2.0.3"]].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: "10px", color: "#334155", textTransform: "uppercase", letterSpacing: "0.8px" }}>{k}</div>
                    <div style={{ fontSize: "16px", fontWeight: "800", color: "#00ff88", fontFamily: "monospace" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Code Viewer */}
          {activeKey && (
            <div style={{ background: "#080810", border: "1px solid rgba(0,255,136,0.15)", borderRadius: "14px", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "80vh", position: "sticky", top: "20px" }}>
              <div style={{ padding: "13px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a0a16", flexShrink: 0, gap: "8px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>{FILE_ICONS[activeKey] || "📄"}</span>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#e2e8f0", fontFamily: "monospace" }}>{activeFile}</span>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={copyCode} style={{ padding: "6px 12px", background: copied ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)", border: copied ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: copied ? "#22c55e" : "#94a3b8", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}>
                    {copied ? "✓ Copied" : "⎘ Copy"}
                  </button>
                  <button onClick={downloadFile} style={{ padding: "6px 12px", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: "6px", color: "#00ff88", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}>
                    ↓ Download
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
                {loading ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#475569", fontSize: "13px" }}>Loading file...</div>
                ) : (
                  <pre style={{ margin: 0, fontSize: "11px", color: "#94a3b8", fontFamily: "'JetBrains Mono', 'Courier New', monospace", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: "1.7" }}>{code}</pre>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "setup" && (
        <div style={{ maxWidth: "700px" }}>
          {SETUP_STEPS.map((s) => (
            <div key={s.step} style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800", color: "#00ff88", flexShrink: 0 }}>{s.step}</div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0", margin: "0 0 8px 0" }}>{s.title}</p>
                <div style={{ background: "#080810", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "10px 14px" }}>
                  <code style={{ fontSize: "12px", color: "#00ff88", fontFamily: "monospace" }}>{s.cmd}</code>
                </div>
              </div>
            </div>
          ))}
          <div style={{ background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.1)", borderRadius: "12px", padding: "16px 20px", marginTop: "24px" }}>
            <p style={{ fontSize: "12px", color: "#475569", margin: 0 }}>
              Need help? Join the{" "}
              <a href="https://whatsapp.com/channel/0029Vb88OB4545unOuID4H0Q" target="_blank" rel="noopener noreferrer" style={{ color: "#00ff88", fontWeight: "600" }}>VK911 XMD Channel →</a>
            </p>
          </div>
        </div>
      )}

      {tab === "structure" && (
        <div style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "24px", maxWidth: "600px" }}>
          <pre style={{ margin: 0, fontSize: "12px", color: "#94a3b8", fontFamily: "monospace", lineHeight: "1.9" }}>{`VK911_MINI_XMD/
├── index.js          # Main entry — session management
├── config.js         # Bot config — prefix, owner, flags
├── handler.js        # Message handler & command loader
├── pairApi.js        # Web pairing API — GET /pair?phone=
├── database.js       # DB utilities
├── Readme.md         # Setup documentation
├── commands/
│   ├── admin/        # Group admin commands
│   ├── ai/           # AI commands (GPT, Gemini)
│   ├── anime/        # Anime image commands
│   ├── fun/          # Fun & games commands
│   ├── general/      # General utility commands
│   ├── media/        # Media download commands
│   ├── owner/        # Bot owner commands
│   ├── textmaker/    # Text art commands
│   └── utility/      # Utility commands
└── utils/
    ├── helpers.js    # Shared helper functions
    ├── sticker.js    # Sticker creation utilities
    ├── converter.js  # Media format converter
    └── ...           # Other utilities`}</pre>
        </div>
      )}
    </div>
  );
}
