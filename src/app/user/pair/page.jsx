import { useState, useEffect, useRef } from "react";

export default function UserPairPage() {
  const [phone, setPhone] = useState("");
  const [cc, setCc]       = useState("+234");
  const [code, setCode]   = useState("");
  const [status, setStatus] = useState("idle"); // idle|loading|awaiting|connected|error
  const [error, setError]  = useState("");
  const [logs, setLogs]    = useState([]);
  const [botUrl, setBotUrl]  = useState("");
  const [botLoading, setBotLoading] = useState(true);
  const pollRef    = useRef(null);
  const fullPhRef  = useRef("");

  const log = (msg, type = "info") =>
    setLogs(l => [{ msg, type, time: new Date().toLocaleTimeString() }, ...l.slice(0, 14)]);

  useEffect(() => {
    (async () => {
      setBotLoading(true);
      try {
        const r = await fetch("/api/config?key=bot_url");
        const d = await r.json();
        const u = d.value || localStorage.getItem("vk911_bot_url") || "";
        setBotUrl(u);
        if (d.value) localStorage.setItem("vk911_bot_url", d.value);
      } catch { setBotUrl(localStorage.getItem("vk911_bot_url") || ""); }
      finally   { setBotLoading(false); }
    })();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const saveSession = async (ph, st) => {
    try {
      await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("vk911_token")}` },
        body: JSON.stringify({ session_id: ph, phone_number: ph, bot_url: botUrl, status: st }),
      });
    } catch {}
  };

  // Try V2 (POST /api/pair/code) then MINI (GET /pair?phone=...)
  const fetchCode = async (bUrl, ph) => {
    const ac  = new AbortController();
    const t1  = setTimeout(() => ac.abort(), 75000);
    try {
      const r = await fetch(`${bUrl}/api/pair/code`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: ph }), signal: ac.signal,
      });
      clearTimeout(t1);
      const d = await r.json();
      if (r.status === 409) throw new Error(d.error || "Session already connected — clear it first");
      if (r.ok) return { code: d.code, format: "v2" };
      if (r.status !== 404) throw new Error(d.error || `Bot returned HTTP ${r.status}`);
    } catch (e) {
      clearTimeout(t1);
      if (e.name !== "AbortError" && !e.message.includes("404") && !e.message.includes("Failed to fetch")) throw e;
    }
    // MINI fallback
    const ac2 = new AbortController();
    const t2  = setTimeout(() => ac2.abort(), 75000);
    try {
      const r2 = await fetch(`${bUrl}/pair?phone=${encodeURIComponent(ph)}`, { signal: ac2.signal });
      clearTimeout(t2);
      const d2 = await r2.json();
      if (!r2.ok) throw new Error(d2.error || `Bot returned HTTP ${r2.status}`);
      return { code: d2.code || d2.pairingCode, format: "mini" };
    } catch (e) {
      clearTimeout(t2);
      if (e.name === "AbortError") throw new Error("Request timed out (75s) — bot is not responding");
      throw e;
    }
  };

  const startPoll = (bUrl, ph) => {
    if (pollRef.current) clearInterval(pollRef.current);
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      if (++attempts > 72) { clearInterval(pollRef.current); return; } // 6 min max
      try {
        // V2: GET /api/status
        const r = await fetch(`${bUrl}/api/status`, { signal: AbortSignal.timeout(5000) });
        if (r.ok) {
          const d = await r.json();
          if (d.connected && (d.user?.id || "").includes(ph.slice(-10))) {
            return finish(bUrl, ph);
          }
        }
      } catch {}
      try {
        // MINI: GET /sessions
        const r2 = await fetch(`${bUrl}/sessions`, { signal: AbortSignal.timeout(5000) });
        if (r2.ok) {
          const d2 = await r2.json();
          if (d2[ph] === "connected") return finish(bUrl, ph);
        }
      } catch {}
    }, 5000);
  };

  const finish = async (bUrl, ph) => {
    if (pollRef.current) clearInterval(pollRef.current);
    await saveSession(ph, "connected");
    setStatus("connected");
    log("✅ Connected to WhatsApp! Redirecting...", "success");
    setTimeout(() => { window.location.href = "/user"; }, 2500);
  };

  const handlePair = async () => {
    if (!phone) return setError("Enter your WhatsApp number");
    if (!botUrl) return setError("Bot server not configured — contact admin");
    setError(""); setStatus("loading"); setCode("");
    const ph = `${cc}${phone}`.replace(/\D/g, "");
    fullPhRef.current = ph;
    log(`Requesting code for +${ph}...`);
    try {
      const { code: c, format } = await fetchCode(botUrl, ph);
      if (!c) throw new Error("No pairing code returned from bot");
      setCode(c); setStatus("awaiting");
      log(`Code received (${format} endpoint): ${c}`, "success");
      log("Open WhatsApp → Linked Devices → Link a Device → enter the code above", "info");
      await saveSession(ph, "connecting");
      startPoll(botUrl, ph);
    } catch (err) {
      setError(err.message); setStatus("error");
      log(err.message, "error");
    }
  };

  const SC = { idle:"#475569", loading:"#f59e0b", awaiting:"#f59e0b", connected:"#22c55e", error:"#ef4444" };
  const SL = { idle:"Ready", loading:"Requesting code…", awaiting:"Waiting for scan…", connected:"Connected!", error:"Error" };

  return (
    <div style={{ padding: "32px", maxWidth: "560px", margin: "0 auto" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#f1f5f9", margin: "0 0 6px 0" }}>⟳ Pair Your Device</h1>
        <p style={{ color: "#475569", fontSize: "13px", margin: 0 }}>Connect your WhatsApp to VK911 MINI via pairing code</p>
      </div>

      {/* Bot status */}
      <div style={{ background:"#0f0f1a", border:`1px solid ${botUrl?"rgba(0,255,136,0.15)":"rgba(239,68,68,0.15)"}`, borderRadius:"14px", padding:"14px 18px", marginBottom:"20px", display:"flex", alignItems:"center", gap:"12px" }}>
        <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:botLoading?"#475569":botUrl?"#22c55e":"#ef4444", boxShadow:botUrl&&!botLoading?"0 0 6px #22c55e":"none", flexShrink:0 }} />
        <div>
          <div style={{ fontSize:"12px", fontWeight:"600", color:botLoading?"#64748b":botUrl?"#22c55e":"#ef4444" }}>
            {botLoading ? "Loading bot server…" : botUrl ? "Bot server configured ✓" : "Bot server not configured — contact admin"}
          </div>
          {botUrl && <div style={{ fontSize:"11px", color:"#475569", fontFamily:"monospace", marginTop:"2px" }}>{botUrl}</div>}
        </div>
      </div>

      {/* Phone input */}
      <div style={{ background:"#0f0f1a", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"14px", padding:"24px", marginBottom:"14px" }}>
        <label style={{ display:"block", fontSize:"11px", fontWeight:"700", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:"10px" }}>WhatsApp Number</label>
        <div style={{ display:"flex", gap:"8px", marginBottom:"16px" }}>
          <select value={cc} onChange={e=>setCc(e.target.value)} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", padding:"11px 10px", fontSize:"13px", color:"#e2e8f0", outline:"none" }}>
            {["+1","+7","+20","+27","+44","+49","+60","+61","+62","+63","+65","+66","+81","+82","+86","+91","+92","+212","+213","+221","+224","+225","+233","+234","+237","+243","+254","+255","+256","+260","+263","+264","+265","+266","+267","+268"].map(x=><option key={x}>{x}</option>)}
          </select>
          <input value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,""))} placeholder="8012345678" type="tel"
            style={{ flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", padding:"11px 16px", fontSize:"14px", color:"#e2e8f0", outline:"none", fontFamily:"monospace" }}
            onFocus={e=>(e.target.style.borderColor="rgba(0,255,136,0.4)")} onBlur={e=>(e.target.style.borderColor="rgba(255,255,255,0.08)")} />
        </div>

        {error && <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"8px", padding:"10px 14px", marginBottom:"14px", fontSize:"12px", color:"#f87171" }}>⚠ {error}</div>}

        <button onClick={handlePair} disabled={status==="loading"||!botUrl||botLoading}
          style={{ width:"100%", padding:"13px", background:status==="loading"||!botUrl||botLoading?"rgba(0,255,136,0.25)":"linear-gradient(135deg,#00ff88,#06b6d4)", border:"none", borderRadius:"10px", fontSize:"14px", fontWeight:"700", color:"#080810", cursor:status==="loading"||!botUrl||botLoading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
          {status==="loading" && <span style={{ width:"14px", height:"14px", border:"2px solid #080810", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />}
          {status==="loading" ? "Requesting…" : "Get Pairing Code"}
        </button>
      </div>

      {/* Code display */}
      {code && (
        <div style={{ background:"#0f0f1a", border:"1px solid rgba(0,255,136,0.3)", borderRadius:"14px", padding:"24px", marginBottom:"14px", textAlign:"center" }}>
          <p style={{ fontSize:"11px", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.8px", margin:"0 0 10px 0" }}>Your Pairing Code</p>
          <div style={{ fontSize:"34px", fontFamily:"monospace", fontWeight:"800", color:"#00ff88", letterSpacing:"8px", textShadow:"0 0 30px rgba(0,255,136,0.4)" }}>{code}</div>
          <p style={{ fontSize:"11px", color:"#475569", margin:"10px 0 0 0" }}>WhatsApp → Linked Devices → Link a Device → enter code above</p>
        </div>
      )}

      {/* Status bar */}
      <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"12px 16px", background:"#0f0f1a", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"10px", marginBottom:"14px" }}>
        <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:SC[status], flexShrink:0, boxShadow:status==="connected"?`0 0 8px ${SC[status]}`:"none" }} />
        <span style={{ fontSize:"12px", color:SC[status], fontWeight:"600", fontFamily:"monospace" }}>{SL[status]}</span>
        {status==="awaiting" && <span style={{ fontSize:"11px", color:"#475569", marginLeft:"auto" }}>Polling every 5 s…</span>}
      </div>

      {/* Logs */}
      {logs.length > 0 && (
        <div style={{ background:"#080810", border:"1px solid rgba(255,255,255,0.04)", borderRadius:"10px", padding:"14px", maxHeight:"160px", overflowY:"auto" }}>
          {logs.map((l,i)=>(
            <div key={i} style={{ display:"flex", gap:"10px", marginBottom:"4px", fontFamily:"monospace", fontSize:"11px" }}>
              <span style={{ color:"#334155" }}>{l.time}</span>
              <span style={{ color:{info:"#6366f1",success:"#00ff88",error:"#ef4444",warn:"#f59e0b"}[l.type] }}>[{l.type.toUpperCase()}]</span>
              <span style={{ color:"#64748b", wordBreak:"break-all" }}>{l.msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
