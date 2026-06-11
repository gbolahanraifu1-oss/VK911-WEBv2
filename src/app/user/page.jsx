import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function UserHomePage() {
  const [user, setUser] = useState(null);
  const [botUrl, setBotUrl] = useState("");

  useEffect(() => {
    const u = localStorage.getItem("vk911_user");
    const b = localStorage.getItem("vk911_bot_url") || "";
    if (u) setUser(JSON.parse(u));
    setBotUrl(b);
  }, []);

  const token = () => localStorage.getItem("vk911_token") || "";

  // Fetch all sessions for this user
  const { data: sessions = [], isLoading: sesLoading, refetch } = useQuery({
    queryKey: ["user-sessions"],
    queryFn: async () => {
      const r = await fetch("/api/session?user=1", { headers: { Authorization: `Bearer ${token()}` } });
      if (!r.ok) return [];
      const d = await r.json();
      return Array.isArray(d) ? d : d ? [d] : [];
    },
    refetchInterval: 10000,
    enabled: !!token(),
  });

  const { data: botHealth } = useQuery({
    queryKey: ["bot-health"],
    queryFn: async () => {
      if (!botUrl) return null;
      try {
        const r = await fetch(`${botUrl}/health`, { signal: AbortSignal.timeout(6000) });
        if (r.ok) return r.json();
        // V2 fallback: GET /
        const r2 = await fetch(`${botUrl}/`, { signal: AbortSignal.timeout(6000) });
        return r2.ok ? r2.json() : null;
      } catch { return null; }
    },
    refetchInterval: 15000,
    enabled: !!botUrl,
    retry: false,
  });

  const SC = { connected:"#22c55e", connecting:"#f59e0b", disconnected:"#ef4444" };
  const SL = { connected:"Connected", connecting:"Connecting…", disconnected:"Disconnected" };

  return (
    <div>
      <div style={{ marginBottom:"32px" }}>
        <h1 style={{ fontSize:"22px", fontWeight:"800", color:"#f1f5f9", margin:"0 0 6px 0" }}>
          Welcome, <span style={{ background:"linear-gradient(135deg,#00ff88,#06b6d4)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{user?.username}</span>
        </h1>
        <p style={{ color:"#475569", fontSize:"13px", margin:0 }}>Manage your VK911 MINI WhatsApp bot session</p>
      </div>

      {/* Bot server pill */}
      <div style={{ background:"#0f0f1a", border:`1px solid ${botHealth?"rgba(0,255,136,0.2)":"rgba(255,255,255,0.06)"}`, borderRadius:"16px", padding:"16px 22px", marginBottom:"20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:botHealth?"#22c55e":botUrl?"#ef4444":"#475569", boxShadow:botHealth?"0 0 8px #22c55e":"none" }} />
          <div>
            <div style={{ fontSize:"13px", fontWeight:"600", color:botHealth?"#22c55e":"#64748b" }}>
              {!botUrl ? "No bot URL set" : botHealth ? `Bot online — ${botUrl}` : `Bot unreachable — ${botUrl}`}
            </div>
            {botHealth && <div style={{ fontSize:"11px", color:"#475569", fontFamily:"monospace" }}>uptime {Math.floor((botHealth.uptime||0)/60)}m {Math.floor((botHealth.uptime||0)%60)}s</div>}
          </div>
        </div>
        <a href="/user/pair" style={{ padding:"9px 18px", background:"linear-gradient(135deg,#00ff88,#06b6d4)", borderRadius:"10px", color:"#080810", fontSize:"13px", fontWeight:"700", textDecoration:"none" }}>
          ⟳ Pair Device
        </a>
      </div>

      {/* Sessions */}
      <div style={{ background:"#0f0f1a", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"16px", padding:"22px", marginBottom:"22px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"18px" }}>
          <div>
            <h2 style={{ fontSize:"14px", fontWeight:"700", color:"#e2e8f0", margin:0 }}>My Sessions</h2>
            <p style={{ fontSize:"11px", color:"#475569", margin:"4px 0 0 0" }}>Your paired WhatsApp devices</p>
          </div>
          <button onClick={()=>refetch()} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"8px", padding:"6px 12px", color:"#64748b", fontSize:"11px", cursor:"pointer" }}>↺ Refresh</button>
        </div>

        {sesLoading ? (
          <div style={{ textAlign:"center", padding:"24px", color:"#475569", fontSize:"13px" }}>Loading sessions…</div>
        ) : sessions.length === 0 ? (
          <div style={{ textAlign:"center", padding:"32px 16px" }}>
            <div style={{ fontSize:"36px", marginBottom:"12px" }}>📱</div>
            <div style={{ fontSize:"14px", fontWeight:"600", color:"#64748b", marginBottom:"6px" }}>No sessions yet</div>
            <div style={{ fontSize:"12px", color:"#475569", marginBottom:"18px" }}>Pair your WhatsApp number to get started</div>
            <a href="/user/pair" style={{ padding:"10px 22px", background:"linear-gradient(135deg,#00ff88,#06b6d4)", borderRadius:"10px", color:"#080810", fontSize:"13px", fontWeight:"700", textDecoration:"none" }}>
              ⟳ Pair Now
            </a>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {sessions.map(s => (
              <div key={s.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", background:"rgba(255,255,255,0.02)", border:`1px solid ${(SC[s.status]||"#475569")}20`, borderRadius:"12px", flexWrap:"wrap", gap:"12px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
                  <div style={{ width:"40px", height:"40px", borderRadius:"50%", background:`${SC[s.status]||"#475569"}15`, border:`2px solid ${SC[s.status]||"#475569"}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px" }}>📱</div>
                  <div>
                    <div style={{ fontSize:"14px", fontWeight:"700", color:"#e2e8f0", fontFamily:"monospace" }}>+{s.phone_number || s.session_id}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:"6px", marginTop:"3px" }}>
                      <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:SC[s.status]||"#475569" }} />
                      <span style={{ fontSize:"11px", color:SC[s.status]||"#475569", fontWeight:"600" }}>{SL[s.status]||s.status}</span>
                    </div>
                    <div style={{ fontSize:"10px", color:"#334155", fontFamily:"monospace", marginTop:"2px" }}>
                      Last active: {s.last_active ? new Date(s.last_active).toLocaleString() : "—"}
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:"8px" }}>
                  <a href="/user/settings" style={{ padding:"7px 14px", background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", borderRadius:"8px", color:"#818cf8", fontSize:"11px", fontWeight:"600", textDecoration:"none" }}>Settings</a>
                  {s.status !== "connected" && (
                    <a href="/user/pair" style={{ padding:"7px 14px", background:"rgba(0,255,136,0.15)", border:"1px solid rgba(0,255,136,0.3)", borderRadius:"8px", color:"#00ff88", fontSize:"11px", fontWeight:"600", textDecoration:"none" }}>Re-pair</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"10px" }}>
        {[
          { label:"Pair Device", desc:"Connect WhatsApp via pairing code", icon:"⟳", color:"#00ff88", href:"/user/pair" },
          { label:"My Settings", desc:"Configure per-session bot preferences", icon:"⚙", color:"#6366f1", href:"/user/settings" },
          { label:"VK911 MINI Channel", desc:"Updates & announcements", icon:"📢", color:"#22d3ee", href:"https://whatsapp.com/channel/0029Vb88OB4545unOuID4H0Q", ext:true },
          { label:"GitHub", desc:"Source code & docs", icon:"⎇", color:"#f59e0b", href:"https://github.com/GBEXCHANGE/VK911-BOT", ext:true },
        ].map(a => (
          <a key={a.label} href={a.href} target={a.ext?"_blank":undefined} rel={a.ext?"noopener noreferrer":undefined}
            style={{ display:"flex", alignItems:"center", gap:"12px", padding:"14px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:"12px", textDecoration:"none" }}
            onMouseOver={e=>(e.currentTarget.style.borderColor=`${a.color}40`)}
            onMouseOut={e=>(e.currentTarget.style.borderColor="rgba(255,255,255,0.05)")}>
            <div style={{ width:"36px", height:"36px", borderRadius:"10px", background:`${a.color}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", flexShrink:0 }}>{a.icon}</div>
            <div>
              <div style={{ fontSize:"13px", fontWeight:"600", color:"#e2e8f0" }}>{a.label}</div>
              <div style={{ fontSize:"11px", color:"#475569" }}>{a.desc}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
