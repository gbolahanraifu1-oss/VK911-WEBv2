import { useState, useEffect, useRef } from "react";

export default function UserPairPage() {
  const [method, setMethod] = useState("code");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+234");
  const [pairingCode, setPairingCode] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [logs, setLogs] = useState([]);
  const [botUrl, setBotUrl] = useState("https://vk911webv2.hidenfree.com");
  const pollRef = useRef(null);

  const addLog = (msg, type = "info") =>
    setLogs((l) => [{ msg, type, time: new Date().toLocaleTimeString() }, ...l.slice(0, 14)]);

  const requestPairingCode = async () => {
    if (!phone) return setError("Enter your WhatsApp number");
    setError(""); setStatus("loading"); setPairingCode("");
    addLog(`Requesting pairing code for ${countryCode}${phone}...`);
    try {
      const res = await fetch(`${botUrl}/api/pair/code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `${countryCode}${phone}`.replace(/\D/g, "") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setPairingCode(data.code);
      setStatus("awaiting");
      addLog(`Code generated: ${data.code}`, "success");
      startPoll();
    } catch (err) {
      setError(`Bot error: ${err.message}`);
      setStatus("error");
      addLog(err.message, "error");
    }
  };

  const requestQR = async () => {
    setStatus("loading"); setQrCode("");
    addLog("Requesting QR code...");
    try {
      const res = await fetch(`${botUrl}/api/pair/qr`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setQrCode(data.qr);
      setStatus("awaiting");
      addLog("QR ready — scan with WhatsApp", "success");
      startPoll();
    } catch (err) {
      setError(`Cannot reach bot at ${botUrl}`);
      setStatus("error");
      addLog(err.message, "error");
    }
  };

  const startPoll = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${botUrl}/api/status`);
        const data = await res.json();
        if (data.connected) {
          setStatus("connected");
          addLog("✓ Successfully connected to WhatsApp!", "success");
          clearInterval(pollRef.current);
        }
      } catch (_) {}
    }, 3000);
  };

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const statusColor = status === "connected" ? "#22c55e" : status === "error" ? "#ef4444" : status === "awaiting" ? "#f59e0b" : "#64748b";

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#f1f5f9", margin: "0 0 6px 0" }}>⟳ Pair Your Device</h1>
        <p style={{ color: "#475569", fontSize: "13px", margin: 0 }}>Connect your WhatsApp to VK911 XMD bot</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Bot URL */}
          <div style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "20px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "10px" }}>Bot Server URL</label>
            <input value={botUrl} onChange={(e) => setBotUrl(e.target.value)} placeholder="http://vps-ip:3001"
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#e2e8f0", outline: "none", boxSizing: "border-box", fontFamily: "monospace" }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(0,255,136,0.4)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
            <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: statusColor }} />
              <span style={{ fontSize: "12px", color: statusColor }}>
                {status === "connected" ? "Connected" : status === "awaiting" ? "Awaiting scan..." : status === "loading" ? "Connecting..." : status === "error" ? "Error" : "Not connected"}
              </span>
            </div>
          </div>

          {/* Method tabs */}
          <div style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "20px" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              {[["code", "# Pairing Code"], ["qr", "📱 QR Code"]].map(([id, label]) => (
                <button key={id} onClick={() => { setMethod(id); setStatus("idle"); setError(""); setPairingCode(""); setQrCode(""); }}
                  style={{ padding: "8px 16px", background: method === id ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.03)", border: method === id ? "1px solid rgba(0,255,136,0.3)" : "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", color: method === id ? "#00ff88" : "#64748b", fontSize: "12px", fontWeight: method === id ? "600" : "400", cursor: "pointer" }}>
                  {label}
                </button>
              ))}
            </div>

            {error && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "12px", color: "#f87171" }}>⚠ {error}</div>}

            {method === "code" && (
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>WhatsApp Number</label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                  <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 8px", fontSize: "13px", color: "#e2e8f0", outline: "none", fontFamily: "monospace" }}>
                    {["+234","+1","+44","+91","+254","+27","+233","+55","+49","+33","+62"].map((c) => (
                      <option key={c} value={c} style={{ background: "#0f0f1a" }}>{c}</option>
                    ))}
                  </select>
                  <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="7001234567" type="tel"
                    style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", color: "#e2e8f0", outline: "none", fontFamily: "monospace" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(0,255,136,0.4)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                  />
                </div>

                {pairingCode && (
                  <div style={{ marginBottom: "16px", padding: "18px", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: "12px", textAlign: "center" }}>
                    <p style={{ fontSize: "11px", color: "#00ff88", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 10px 0" }}>Your Pairing Code</p>
                    <div style={{ fontSize: "34px", fontWeight: "800", letterSpacing: "8px", color: "#f1f5f9", fontFamily: "monospace" }}>{pairingCode}</div>
                    <p style={{ fontSize: "11px", color: "#475569", margin: "10px 0 0 0" }}>WhatsApp → Linked Devices → Link with phone number</p>
                  </div>
                )}

                <button onClick={requestPairingCode} disabled={status === "loading" || status === "connected"}
                  style={{ width: "100%", padding: "12px", background: status === "connected" ? "rgba(34,197,94,0.2)" : "linear-gradient(135deg, #00ff88, #06b6d4)", border: "none", borderRadius: "10px", color: status === "connected" ? "#22c55e" : "#080810", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
                  {status === "connected" ? "✓ Connected" : status === "loading" ? "— Generating..." : "→ Get Pairing Code"}
                </button>
              </div>
            )}

            {method === "qr" && (
              <div>
                <div style={{ width: "180px", height: "180px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {qrCode ? (
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrCode)}&bgcolor=0f0f1a&color=00ff88`} alt="QR" style={{ width: "160px", height: "160px", borderRadius: "8px" }} />
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "36px", opacity: 0.2, marginBottom: "8px" }}>⬡</div>
                      <p style={{ fontSize: "11px", color: "#334155", margin: 0 }}>QR appears here</p>
                    </div>
                  )}
                </div>
                <button onClick={requestQR} disabled={status === "loading" || status === "connected"}
                  style={{ width: "100%", padding: "12px", background: status === "connected" ? "rgba(34,197,94,0.2)" : "linear-gradient(135deg, #00ff88, #06b6d4)", border: "none", borderRadius: "10px", color: status === "connected" ? "#22c55e" : "#080810", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
                  {status === "connected" ? "✓ Connected" : status === "loading" ? "— Generating QR..." : "→ Generate QR Code"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right — Logs */}
        <div style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "20px" }}>
          <h3 style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 14px 0" }}>⬦ Pairing Logs</h3>
          <div style={{ fontFamily: "monospace", fontSize: "11px", maxHeight: "400px", overflowY: "auto" }}>
            {logs.length === 0 && <p style={{ color: "#334155" }}>— Waiting for activity</p>}
            {logs.map((log, i) => (
              <div key={i} style={{ marginBottom: "8px", paddingBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <span style={{ color: "#334155" }}>{log.time} </span>
                <span style={{ color: log.type === "success" ? "#22c55e" : log.type === "error" ? "#ef4444" : "#6366f1" }}>[{log.type}] </span>
                <span style={{ color: "#64748b" }}>{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}