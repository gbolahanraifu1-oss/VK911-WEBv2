import { useState, useEffect, useRef } from "react";

export default function UserPairPage() {
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+234");
  const [pairingCode, setPairingCode] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [logs, setLogs] = useState([]);
  const [botUrl, setBotUrl] = useState(() => localStorage.getItem("vk911_bot_url") || "");
  const pollRef = useRef(null);

  const addLog = (msg, type = "info") =>
    setLogs((l) => [{ msg, type, time: new Date().toLocaleTimeString() }, ...l.slice(0, 14)]);

  useEffect(() => {
    if (botUrl) localStorage.setItem("vk911_bot_url", botUrl);
  }, [botUrl]);

  const requestPairingCode = async () => {
    if (!phone) return setError("Enter your WhatsApp number");
    if (!botUrl) return setError("Enter your bot server URL first");
    setError(""); setStatus("loading"); setPairingCode("");
    const fullPhone = `${countryCode}${phone}`.replace(/\D/g, "");
    addLog(`Requesting pairing code for ${fullPhone}...`);
    try {
      // Bot uses GET /pair?phone=...
      const res = await fetch(`${botUrl}/pair?phone=${encodeURIComponent(fullPhone)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      const code = data.code || data.pairingCode || data.pair_code;
      if (!code) throw new Error("No code returned from bot");
      setPairingCode(code);
      setStatus("awaiting");
      addLog(`Code generated: ${code}`, "success");
      startPoll();
    } catch (err) {
      setError(`Bot error: ${err.message}`);
      setStatus("error");
      addLog(err.message, "error");
    }
  };

  const startPoll = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${botUrl}/health`);
        const data = await res.json();
        if (data.connected) {
          setStatus("connected");
          addLog("Connected to WhatsApp!", "success");
          clearInterval(pollRef.current);
        }
      } catch (_) {}
    }, 4000);
  };

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const statusColor = { idle: "#475569", loading: "#f59e0b", awaiting: "#f59e0b", connected: "#22c55e", error: "#ef4444" }[status];

  return (
    <div style={{ padding: "32px", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#f1f5f9", margin: "0 0 6px 0" }}>⟳ Pair Your Device</h1>
        <p style={{ color: "#475569", fontSize: "13px", margin: 0 }}>Connect your WhatsApp to VK911 XMD via pairing code</p>
      </div>

      {/* Bot URL */}
      <div style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "20px", marginBottom: "20px" }}>
        <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>Bot Server URL</label>
        <input value={botUrl} onChange={(e) => setBotUrl(e.target.value.replace(/\/$/, ""))} placeholder="https://your-bot-server.com" style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "11px 16px", fontSize: "13px", color: "#e2e8f0", outline: "none", boxSizing: "border-box", fontFamily: "monospace" }} onFocus={(e) => (e.target.style.borderColor = "rgba(0,255,136,0.4)")} onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")} />
      </div>

      {/* Phone Input */}
      <div style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "24px", marginBottom: "16px" }}>
        <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "10px" }}>WhatsApp Number</label>
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "11px 12px", fontSize: "13px", color: "#e2e8f0", outline: "none", cursor: "pointer" }}>
            {["+1","+7","+20","+27","+44","+49","+60","+61","+62","+63","+65","+66","+81","+82","+86","+91","+92","+212","+213","+221","+224","+225","+233","+234","+237","+243","+254","+255","+256","+260","+263","+264","+265","+266","+267","+268"].map(cc => (
              <option key={cc} value={cc}>{cc}</option>
            ))}
          </select>
          <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="8012345678" type="tel" style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "11px 16px", fontSize: "14px", color: "#e2e8f0", outline: "none", fontFamily: "monospace" }} onFocus={(e) => (e.target.style.borderColor = "rgba(0,255,136,0.4)")} onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")} />
        </div>

        {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", fontSize: "12px", color: "#f87171" }}>⚠ {error}</div>}

        <button onClick={requestPairingCode} disabled={status === "loading" || !botUrl} style={{ width: "100%", padding: "13px", background: status === "loading" || !botUrl ? "rgba(0,255,136,0.25)" : "linear-gradient(135deg, #00ff88, #06b6d4)", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", color: "#080810", cursor: status === "loading" || !botUrl ? "not-allowed" : "pointer" }}>
          {status === "loading" ? "Requesting..." : "Get Pairing Code"}
        </button>
      </div>

      {/* Code Display */}
      {pairingCode && (
        <div style={{ background: "#0f0f1a", border: "1px solid rgba(0,255,136,0.3)", borderRadius: "14px", padding: "24px", marginBottom: "16px", textAlign: "center" }}>
          <p style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 12px 0" }}>Your Pairing Code</p>
          <div style={{ fontSize: "36px", fontFamily: "'JetBrains Mono', monospace", fontWeight: "800", color: "#00ff88", letterSpacing: "8px", textShadow: "0 0 30px rgba(0,255,136,0.4)" }}>{pairingCode}</div>
          <p style={{ fontSize: "11px", color: "#475569", margin: "12px 0 0 0" }}>WhatsApp → Linked Devices → Link with phone number</p>
        </div>
      )}

      {/* Status */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", marginBottom: "16px" }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: statusColor, flexShrink: 0, boxShadow: status === "connected" ? `0 0 8px ${statusColor}` : "none" }} />
        <span style={{ fontSize: "12px", color: statusColor, fontWeight: "600", fontFamily: "monospace" }}>
          {{ idle: "Ready", loading: "Requesting...", awaiting: "Waiting for scan...", connected: "Connected!", error: "Error" }[status]}
        </span>
      </div>

      {logs.length > 0 && (
        <div style={{ background: "#080810", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "10px", padding: "14px", maxHeight: "160px", overflowY: "auto" }}>
          {logs.map((log, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "6px", fontFamily: "monospace", fontSize: "11px" }}>
              <span style={{ color: "#334155" }}>{log.time}</span>
              <span style={{ color: { info: "#6366f1", success: "#00ff88", error: "#ef4444", warn: "#f59e0b" }[log.type] }}>[{log.type.toUpperCase()}]</span>
              <span style={{ color: "#64748b" }}>{log.msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
