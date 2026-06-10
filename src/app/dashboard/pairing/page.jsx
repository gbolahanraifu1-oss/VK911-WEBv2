import { useState, useEffect, useRef } from "react";

const Tab = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{ padding: "10px 22px", background: active ? "rgba(0,255,136,0.1)" : "transparent", border: active ? "1px solid rgba(0,255,136,0.3)" : "1px solid transparent", borderRadius: "8px", color: active ? "#00ff88" : "#64748b", fontSize: "13px", fontWeight: active ? "600" : "400", cursor: "pointer", transition: "all 0.15s" }}>
    {label}
  </button>
);

export default function PairingPage() {
  const [method, setMethod] = useState("code");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+234");
  const [pairingCode, setPairingCode] = useState("");
  const [status, setStatus] = useState("idle");
  const [logs, setLogs] = useState([]);
  const [botUrl, setBotUrl] = useState("");
  const [botUrlInput, setBotUrlInput] = useState("");
  const [urlSaving, setUrlSaving] = useState(false);
  const [urlSaved, setUrlSaved] = useState(false);
  const [error, setError] = useState("");
  const [botOnline, setBotOnline] = useState(null);
  const pollRef = useRef(null);

  const addLog = (msg, type = "info") =>
    setLogs((l) => [{ msg, type, time: new Date().toLocaleTimeString() }, ...l.slice(0, 19)]);

  // Load bot URL from DB on mount (falls back to localStorage)
  useEffect(() => {
    const loadBotUrl = async () => {
      try {
        const res = await fetch("/api/config?key=bot_url");
        const data = await res.json();
        if (data.value) {
          setBotUrl(data.value);
          setBotUrlInput(data.value);
          localStorage.setItem("vk911_bot_url", data.value);
        } else {
          const cached = localStorage.getItem("vk911_bot_url") || "";
          setBotUrl(cached);
          setBotUrlInput(cached);
        }
      } catch {
        const cached = localStorage.getItem("vk911_bot_url") || "";
        setBotUrl(cached);
        setBotUrlInput(cached);
      }
    };
    loadBotUrl();
  }, []);

  // Check bot health whenever botUrl changes
  useEffect(() => {
    if (!botUrl) { setBotOnline(false); return; }
    const check = async () => {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 6000);
        const res = await fetch(`${botUrl}/health`, { signal: ctrl.signal });
        clearTimeout(t);
        setBotOnline(res.ok);
        if (res.ok) addLog("Bot server reachable", "success");
        else addLog("Bot returned non-200 on /health", "warn");
      } catch {
        setBotOnline(false);
        addLog("Cannot reach bot server", "error");
      }
    };
    check();
  }, [botUrl]);

  // Save bot URL to DB + localStorage
  const saveBotUrl = async () => {
    const url = botUrlInput.replace(/\/$/, "");
    setUrlSaving(true);
    try {
      const token = localStorage.getItem("vk911_token");
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key: "bot_url", value: url }),
      });
      if (!res.ok) throw new Error("Failed to save");
      localStorage.setItem("vk911_bot_url", url);
      setBotUrl(url);
      setUrlSaved(true);
      addLog("Bot URL saved to database", "success");
      setTimeout(() => setUrlSaved(false), 3000);
    } catch (err) {
      // Fall back to localStorage only
      localStorage.setItem("vk911_bot_url", url);
      setBotUrl(url);
      setUrlSaved(true);
      addLog("Bot URL saved locally (DB unavailable)", "warn");
      setTimeout(() => setUrlSaved(false), 3000);
    } finally {
      setUrlSaving(false);
    }
  };

  const requestPairingCode = async () => {
    if (!phone) { setError("Enter your WhatsApp number"); return; }
    if (!botUrl) { setError("Save the bot server URL first"); return; }
    setError(""); setStatus("loading"); setPairingCode("");
    const fullPhone = `${countryCode}${phone}`.replace(/\D/g, "");
    addLog(`Requesting pairing code for ${fullPhone}...`, "info");
    try {
      const res = await fetch(`${botUrl}/pair?phone=${encodeURIComponent(fullPhone)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get pairing code");
      const code = data.code || data.pairingCode || data.pair_code;
      if (!code) throw new Error("No code returned from bot");
      setPairingCode(code);
      setStatus("awaiting");
      addLog(`Pairing code: ${code}`, "success");
      startPollStatus();
    } catch (err) {
      setError(`Bot error: ${err.message}. Make sure bot is running at ${botUrl}`);
      setStatus("error");
      addLog(err.message, "error");
    }
  };

  const startPollStatus = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${botUrl}/health`);
        const data = await res.json();
        if (data.status === "ok" && data.connected) {
          setStatus("connected");
          addLog("Bot connected to WhatsApp!", "success");
          clearInterval(pollRef.current);
        }
      } catch (_) {}
    }, 4000);
  };

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const statusColor = { idle: "#475569", loading: "#f59e0b", awaiting: "#f59e0b", connected: "#22c55e", error: "#ef4444" }[status];
  const urlChanged = botUrlInput.replace(/\/$/, "") !== botUrl;

  return (
    <div style={{ padding: "32px", maxWidth: "900px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#f1f5f9", margin: "0 0 6px 0" }}>⟳ Web Pairing</h1>
        <p style={{ color: "#475569", fontSize: "13px", margin: 0 }}>Connect your WhatsApp account to VK911 MINI</p>
      </div>

      {/* Bot URL Config */}
      <div style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "22px", marginBottom: "20px" }}>
        <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "10px" }}>
          Bot Server URL <span style={{ color: "#22c55e", fontSize: "10px", fontWeight: "600", letterSpacing: "0" }}>— saved across all users</span>
        </label>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            value={botUrlInput}
            onChange={(e) => setBotUrlInput(e.target.value)}
            placeholder="https://your-bot-server.com"
            style={{ flex: 1, minWidth: "260px", background: "rgba(255,255,255,0.04)", border: `1px solid ${urlChanged ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: "10px", padding: "11px 16px", fontSize: "13px", color: "#e2e8f0", outline: "none", fontFamily: "monospace" }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(0,255,136,0.4)")}
            onBlur={(e) => (e.target.style.borderColor = urlChanged ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)")}
            onKeyDown={(e) => { if (e.key === "Enter") saveBotUrl(); }}
          />
          <button
            onClick={saveBotUrl}
            disabled={urlSaving || !botUrlInput}
            style={{ padding: "11px 20px", background: urlSaved ? "rgba(34,197,94,0.2)" : "rgba(0,255,136,0.1)", border: urlSaved ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(0,255,136,0.25)", borderRadius: "10px", color: urlSaved ? "#22c55e" : "#00ff88", fontSize: "13px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            {urlSaving ? "Saving..." : urlSaved ? "✓ Saved" : "→ Save URL"}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", fontSize: "12px", whiteSpace: "nowrap" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: botOnline === null ? "#475569" : botOnline ? "#22c55e" : "#ef4444", boxShadow: botOnline ? "0 0 6px #22c55e" : "none", display: "inline-block" }} />
            <span style={{ color: botOnline === null ? "#64748b" : botOnline ? "#22c55e" : "#ef4444" }}>
              {botOnline === null ? "Checking..." : botOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
        <p style={{ fontSize: "11px", color: "#475569", margin: "8px 0 0 0" }}>Enter your bot's public URL and click Save — it will be stored in the database and available to all users</p>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        <Tab label="Pairing Code" active={method === "code"} onClick={() => setMethod("code")} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Input Panel */}
        <div style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "24px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 20px 0" }}>⬦ Enter Phone Number</h3>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>WhatsApp Number</label>
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
            <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "11px 12px", fontSize: "13px", color: "#e2e8f0", outline: "none", cursor: "pointer" }}>
              {["+1","+7","+20","+27","+30","+31","+32","+33","+34","+36","+39","+40","+41","+43","+44","+45","+46","+47","+48","+49","+51","+52","+54","+55","+56","+57","+58","+60","+61","+62","+63","+64","+65","+66","+81","+82","+84","+86","+90","+91","+92","+93","+94","+95","+98","+212","+213","+216","+218","+220","+221","+222","+223","+224","+225","+226","+227","+228","+229","+230","+231","+232","+233","+234","+235","+236","+237","+238","+239","+240","+241","+242","+243","+244","+245","+246","+247","+248","+249","+250","+251","+252","+253","+254","+255","+256","+257","+258","+260","+261","+262","+263","+264","+265","+266","+267","+268","+269","+290","+291","+297","+298","+299","+350","+351","+352","+353","+354","+355","+356","+357","+358","+359","+370","+371","+372","+373","+374","+375","+376","+377","+380","+381","+382","+385","+386","+387","+389","+420","+421","+423","+500","+501","+502","+503","+504","+505","+506","+507","+508","+509","+590","+591","+592","+593","+594","+595","+596","+597","+598","+599","+670","+672","+673","+674","+675","+676","+677","+678","+679","+680","+681","+682","+683","+685","+686","+687","+688","+689","+690","+691","+692","+850","+852","+853","+855","+856","+880","+886","+960","+961","+962","+963","+964","+965","+966","+967","+968","+970","+971","+972","+973","+974","+975","+976","+977","+992","+993","+994","+995","+996","+998"].map(cc => (
                <option key={cc} value={cc}>{cc}</option>
              ))}
            </select>
            <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="8012345678" type="tel" style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "11px 16px", fontSize: "14px", color: "#e2e8f0", outline: "none", fontFamily: "monospace" }} onFocus={(e) => (e.target.style.borderColor = "rgba(0,255,136,0.4)")} onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")} />
          </div>
          {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "10px", padding: "11px 14px", marginBottom: "16px", fontSize: "12px", color: "#f87171" }}>⚠ {error}</div>}
          <button onClick={requestPairingCode} disabled={status === "loading" || !botUrl} style={{ width: "100%", padding: "13px", background: status === "loading" || !botUrl ? "rgba(0,255,136,0.25)" : "linear-gradient(135deg, #00ff88, #06b6d4)", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", color: "#080810", cursor: status === "loading" || !botUrl ? "not-allowed" : "pointer", boxShadow: status === "loading" || !botUrl ? "none" : "0 0 20px rgba(0,255,136,0.25)" }}>
            {status === "loading" ? "Requesting..." : "Get Pairing Code"}
          </button>
          <p style={{ fontSize: "11px", color: "#475569", margin: "12px 0 0 0", lineHeight: "1.7" }}>
            1. Enter your number above<br />
            2. Click "Get Pairing Code"<br />
            3. Open WhatsApp → Linked Devices → Link with phone number<br />
            4. Enter the 8-character code shown
          </p>
        </div>

        {/* Output Panel */}
        <div>
          <div style={{ background: "#0f0f1a", border: `1px solid ${pairingCode ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: "14px", padding: "24px", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 20px 0" }}>⬦ Pairing Code</h3>
            {pairingCode ? (
              <div>
                <div style={{ fontSize: "36px", fontFamily: "'JetBrains Mono', monospace", fontWeight: "800", color: "#00ff88", letterSpacing: "8px", textAlign: "center", padding: "20px 0", textShadow: "0 0 30px rgba(0,255,136,0.4)" }}>{pairingCode}</div>
                <p style={{ textAlign: "center", fontSize: "11px", color: "#475569", margin: "8px 0 0 0" }}>Enter this code in WhatsApp → Linked Devices → Link with phone number</p>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px", opacity: 0.3 }}>⟳</div>
                <p style={{ fontSize: "12px", color: "#334155", margin: 0 }}>{status === "loading" ? "Generating code..." : "Code will appear here"}</p>
              </div>
            )}
          </div>
          <div style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: statusColor, boxShadow: status === "connected" ? `0 0 8px ${statusColor}` : "none", flexShrink: 0 }} />
            <span style={{ fontSize: "12px", color: statusColor, fontWeight: "600", fontFamily: "monospace" }}>
              {{ idle: "Waiting", loading: "Requesting code...", awaiting: "Waiting for scan...", connected: "Connected!", error: "Error" }[status]}
            </span>
          </div>
        </div>
      </div>

      {logs.length > 0 && (
        <div style={{ background: "#080810", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "14px", padding: "18px", marginTop: "20px", maxHeight: "200px", overflowY: "auto" }}>
          <div style={{ fontSize: "11px", color: "#334155", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "12px" }}>Activity Log</div>
          {logs.map((log, i) => (
            <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "8px", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px" }}>
              <span style={{ color: "#334155", flexShrink: 0 }}>{log.time}</span>
              <span style={{ color: { info: "#6366f1", success: "#00ff88", error: "#ef4444", warn: "#f59e0b" }[log.type] }}>[{log.type.toUpperCase()}]</span>
              <span style={{ color: "#64748b" }}>{log.msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
