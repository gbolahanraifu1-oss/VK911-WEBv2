import { useState, useEffect, useRef } from "react";

const Toggle = ({ value, onChange, disabled }) => (
  <button onClick={() => !disabled && onChange(!value)}
    style={{ width:"44px", height:"24px", borderRadius:"12px", background:value?"#00ff88":"rgba(255,255,255,0.1)", border:"none", cursor:disabled?"not-allowed":"pointer", position:"relative", transition:"background 0.2s", opacity:disabled?0.6:1 }}>
    <span style={{ position:"absolute", top:"3px", left:value?"22px":"3px", width:"18px", height:"18px", borderRadius:"50%", background:value?"#080810":"#475569", transition:"left 0.2s" }} />
  </button>
);

const FIELDS = [
  { key:"readMessages", label:"Read Messages",      sub:"Mark your messages as read (blue ticks) when bot processes them", icon:"✓✓" },
  { key:"readStatus",   label:"Read Status/Stories",sub:"Auto-read WhatsApp status updates from contacts",               icon:"◉" },
  { key:"autoReact",    label:"Auto React",          sub:"Bot reacts ✅ to your commands automatically",                  icon:"✅" },
  { key:"welcomeMsg",   label:"Welcome Messages",    sub:"Show welcome message when joining a group",                    icon:"👋" },
];

export default function UserSettingsPage() {
  const [sessions, setSessions]   = useState([]);
  const [selPhone, setSelPhone]   = useState(null);
  const [settings, setSettings]   = useState({ readMessages:true, readStatus:false, autoReact:true, welcomeMsg:true });
  const [loaded, setLoaded]       = useState(false);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [savedKey, setSavedKey]   = useState(null);
  const [syncMsg, setSyncMsg]     = useState("");
  const timer = useRef(null);

  const token = () => localStorage.getItem("vk911_token") || "";

  // Load user's sessions
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/session?user=1", { headers: { Authorization: `Bearer ${token()}` } });
        if (r.ok) {
          const d = await r.json();
          const list = Array.isArray(d) ? d : d ? [d] : [];
          setSessions(list);
          if (list.length === 1) setSelPhone(list[0].phone_number || list[0].session_id);
        }
      } catch {}
      setSessionsLoaded(true);
    })();
  }, []);

  // Load settings when phone is selected
  useEffect(() => {
    if (!selPhone) { setLoaded(false); return; }
    setLoaded(false);
    (async () => {
      try {
        const r = await fetch(`/api/settings?phone=${encodeURIComponent(selPhone)}`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        if (r.ok) {
          const d = await r.json();
          const p = {};
          for (const k of ["readMessages","readStatus","autoReact","welcomeMsg"])
            p[k] = d[k] === "true" || d[k] === true;
          setSettings(s => ({ ...s, ...p }));
        }
      } catch {}
      setLoaded(true);
    })();
  }, [selPhone]);

  const toggle = async (key, val) => {
    setSettings(s => ({ ...s, [key]: val }));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaving(true); setSyncMsg("");
      try {
        const r = await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
          body: JSON.stringify({ phone: selPhone, settings: { [key]: val } }),
        });
        const d = await r.json();
        setSavedKey(key);
        setSyncMsg(d.botSynced ? "✓ Synced to bot" : "✓ Saved (not synced to bot)");
        setTimeout(() => { setSavedKey(null); setSyncMsg(""); }, 3000);
      } catch {}
      setSaving(false);
    }, 400);
  };

  // ── No sessions yet ──────────────────────────────────────────────────
  if (sessionsLoaded && sessions.length === 0) {
    return (
      <div style={{ maxWidth:"560px" }}>
        <div style={{ marginBottom:"24px" }}>
          <h1 style={{ fontSize:"22px", fontWeight:"800", color:"#f1f5f9", margin:"0 0 6px 0" }}>⚙ My Settings</h1>
          <p style={{ color:"#475569", fontSize:"13px", margin:0 }}>Per-session bot preferences</p>
        </div>
        <div style={{ background:"#0f0f1a", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"16px", padding:"40px 24px", textAlign:"center" }}>
          <div style={{ fontSize:"40px", marginBottom:"14px" }}>📱</div>
          <div style={{ fontSize:"15px", fontWeight:"700", color:"#e2e8f0", marginBottom:"8px" }}>No sessions yet</div>
          <div style={{ fontSize:"13px", color:"#475569", marginBottom:"22px" }}>Pair your WhatsApp number first, then configure per-session settings here.</div>
          <a href="/user/pair" style={{ padding:"11px 24px", background:"linear-gradient(135deg,#00ff88,#06b6d4)", borderRadius:"10px", color:"#080810", fontSize:"14px", fontWeight:"700", textDecoration:"none" }}>
            ⟳ Pair Your Device
          </a>
        </div>
      </div>
    );
  }

  // ── Multiple sessions — session picker ───────────────────────────────
  const showPicker = sessionsLoaded && sessions.length > 1;

  return (
    <div style={{ maxWidth:"560px" }}>
      <div style={{ marginBottom:"24px" }}>
        <h1 style={{ fontSize:"22px", fontWeight:"800", color:"#f1f5f9", margin:"0 0 6px 0" }}>⚙ My Settings</h1>
        <p style={{ color:"#475569", fontSize:"13px", margin:0 }}>Per-session bot preferences — changes apply only to the selected session</p>
      </div>

      {/* Session selector (shown when user has multiple) */}
      {showPicker && (
        <div style={{ background:"#0f0f1a", border:"1px solid rgba(99,102,241,0.2)", borderRadius:"14px", padding:"18px 20px", marginBottom:"20px" }}>
          <label style={{ display:"block", fontSize:"11px", fontWeight:"700", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:"10px" }}>
            Select Session to Configure
          </label>
          <p style={{ fontSize:"12px", color:"#475569", margin:"0 0 12px 0" }}>
            You have {sessions.length} paired sessions. Settings are saved per session and won't affect other users or sessions globally.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
            {sessions.map(s => {
              const ph = s.phone_number || s.session_id;
              const sel = selPhone === ph;
              const stC = { connected:"#22c55e", connecting:"#f59e0b", disconnected:"#ef4444" }[s.status] || "#475569";
              return (
                <button key={s.id} onClick={()=>setSelPhone(ph)}
                  style={{ display:"flex", alignItems:"center", gap:"14px", padding:"12px 16px", background:sel?"rgba(0,255,136,0.08)":"rgba(255,255,255,0.02)", border:`1px solid ${sel?"rgba(0,255,136,0.4)":"rgba(255,255,255,0.08)"}`, borderRadius:"10px", cursor:"pointer", textAlign:"left" }}>
                  <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:stC, flexShrink:0 }} />
                  <div>
                    <div style={{ fontSize:"13px", fontWeight:"700", color:"#e2e8f0", fontFamily:"monospace" }}>+{ph}</div>
                    <div style={{ fontSize:"11px", color:stC }}>{s.status}</div>
                  </div>
                  {sel && <span style={{ marginLeft:"auto", fontSize:"11px", color:"#00ff88", fontWeight:"700" }}>Selected ✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Single session info */}
      {!showPicker && sessions.length === 1 && selPhone && (
        <div style={{ background:"#0f0f1a", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"12px", padding:"14px 18px", marginBottom:"18px", display:"flex", alignItems:"center", gap:"12px" }}>
          <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:{ connected:"#22c55e", connecting:"#f59e0b", disconnected:"#ef4444" }[sessions[0]?.status]||"#475569" }} />
          <div style={{ fontSize:"13px", color:"#64748b" }}>
            Configuring session: <span style={{ color:"#e2e8f0", fontFamily:"monospace", fontWeight:"700" }}>+{selPhone}</span>
            <span style={{ fontSize:"11px", color:"#334155", marginLeft:"8px" }}>(applies only to this session)</span>
          </div>
        </div>
      )}

      {/* Prompt to pick session */}
      {showPicker && !selPhone && (
        <div style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:"12px", padding:"14px 18px", marginBottom:"18px", fontSize:"13px", color:"#818cf8" }}>
          ↑ Select a session above to configure its settings
        </div>
      )}

      {/* Settings toggles */}
      {selPhone && (
        <div style={{ background:"#0f0f1a", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"16px", overflow:"hidden", marginBottom:"14px" }}>
          {!loaded ? (
            <div style={{ padding:"32px", textAlign:"center", color:"#475569", fontSize:"13px" }}>Loading settings…</div>
          ) : (
            FIELDS.map((f, i) => (
              <div key={f.key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 22px", borderBottom:i<FIELDS.length-1?"1px solid rgba(255,255,255,0.04)":"none" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"14px", flex:1, minWidth:0 }}>
                  <div style={{ width:"36px", height:"36px", borderRadius:"10px", background:"rgba(99,102,241,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", flexShrink:0 }}>{f.icon}</div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:"13px", fontWeight:"600", color:"#e2e8f0" }}>{f.label}</div>
                    <div style={{ fontSize:"11px", color:"#475569" }}>{f.sub}</div>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
                  {savedKey===f.key && <span style={{ fontSize:"11px", color:"#22c55e" }}>✓</span>}
                  <Toggle value={settings[f.key]} onChange={v=>toggle(f.key,v)} disabled={saving} />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Sync status */}
      {syncMsg && (
        <div style={{ padding:"10px 16px", background:syncMsg.includes("bot")&&syncMsg.includes("not")?"rgba(245,158,11,0.1)":"rgba(34,197,94,0.1)", border:`1px solid ${syncMsg.includes("not")?"rgba(245,158,11,0.2)":"rgba(34,197,94,0.2)"}`, borderRadius:"8px", fontSize:"12px", color:syncMsg.includes("not")?"#f59e0b":"#22c55e" }}>
          {syncMsg}
          {syncMsg.includes("not synced") && <span style={{ color:"#475569", marginLeft:"6px" }}>— settings saved to dashboard DB; bot sync requires the bot to support <code>/config</code></span>}
        </div>
      )}
    </div>
  );
}
