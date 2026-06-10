import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function UserHomePage() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [botUrl, setBotUrl] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("vk911_bot_url") || "" : ""));

  useEffect(() => {
    const u = localStorage.getItem("vk911_user");
    const t = localStorage.getItem("vk911_token");
    if (u) setUser(JSON.parse(u));
    if (t) setToken(t);
    setBotUrl(localStorage.getItem("vk911_bot_url") || "");
  }, []);

  const { data: session, isLoading, refetch } = useQuery({
    queryKey: ["user-session"],
    queryFn: async () => {
      const res = await fetch("/api/user/session", {
        headers: { Authorization: `Bearer ${localStorage.getItem("vk911_token")}` },
      });
      if (!res.ok) return null;
      return res.json();
    },
    refetchInterval: 10000,
    enabled: !!token,
  });

  // Check bot health directly using /health endpoint
  const { data: botHealth } = useQuery({
    queryKey: ["bot-health", botUrl],
    queryFn: async () => {
      if (!botUrl) return null;
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(`${botUrl}/health`, { signal: ctrl.signal });
      clearTimeout(t);
      return res.json();
    },
    refetchInterval: 15000,
    enabled: !!botUrl,
    retry: false,
  });

  const statusColor = session?.status === "connected" ? "#22c55e" : session?.status === "connecting" ? "#f59e0b" : "#ef4444";
  const statusLabel = session?.status === "connected" ? "Connected" : session?.status === "connecting" ? "Connecting..." : "Not Connected";

  const actions = [
    { label: "Pair Your Device", desc: "Connect WhatsApp via pairing code", icon: "⟳", color: "#00ff88", href: "/user/pair" },
    { label: "Contact Support", desc: "Reach the VK911 XMD team", icon: "✉", color: "#6366f1", href: "/user/contact" },
    { label: "VK911 XMD Channel", desc: "Updates, tips & announcements", icon: "📢", color: "#22d3ee", href: "https://whatsapp.com/channel/0029Vb88OB4545unOuID4H0Q", external: true },
    { label: "GitHub Repository", desc: "Source code & documentation", icon: "⎇", color: "#f59e0b", href: "https://github.com/GBEXCHANGE/VK911-BOT", external: true },
  ];

  return (
    <div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#f1f5f9", margin: "0 0 6px 0" }}>
          Welcome back, <span style={{ background: "linear-gradient(135deg, #00ff88, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{user?.username}</span>
        </h1>
        <p style={{ color: "#475569", fontSize: "13px", margin: 0 }}>Manage your VK911 XMD WhatsApp bot session</p>
      </div>

      {/* Bot Server Status */}
      <div style={{ background: "#0f0f1a", border: `1px solid ${botHealth ? "rgba(0,255,136,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: "16px", padding: "20px 24px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <p style={{ fontSize: "11px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 6px 0" }}>Bot Server</p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: botHealth ? "#22c55e" : botUrl ? "#ef4444" : "#475569", boxShadow: botHealth ? "0 0 8px #22c55e" : "none", flexShrink: 0 }} />
              <span style={{ fontSize: "13px", fontWeight: "600", color: botHealth ? "#22c55e" : "#64748b" }}>
                {!botUrl ? "No bot URL configured" : botHealth ? `Online — ${botUrl}` : `Unreachable — ${botUrl}`}
              </span>
            </div>
            {botHealth && <p style={{ fontSize: "11px", color: "#475569", margin: "4px 0 0 0", fontFamily: "monospace" }}>Uptime: {Math.floor((botHealth.uptime || 0) / 60)}m {(botHealth.uptime || 0) % 60}s</p>}
          </div>
          <a href="/user/pair" style={{ padding: "10px 20px", background: "linear-gradient(135deg, #00ff88, #06b6d4)", border: "none", borderRadius: "10px", color: "#080810", fontSize: "13px", fontWeight: "700", cursor: "pointer", textDecoration: "none" }}>
            {botUrl ? "⟳ Reconnect" : "⟳ Pair Device"}
          </a>
        </div>
      </div>

      {/* Connection Status Card */}
      <div style={{ background: "#0f0f1a", border: `1px solid ${session?.status === "connected" ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: "16px", padding: "28px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: `${statusColor}15`, border: `2px solid ${statusColor}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
              {session?.status === "connected" ? "📱" : "🔌"}
            </div>
            <div>
              <p style={{ fontSize: "18px", fontWeight: "800", color: "#f1f5f9", margin: "0 0 4px 0" }}>{statusLabel}</p>
              {session?.phone_number && <p style={{ fontSize: "12px", color: "#64748b", margin: 0, fontFamily: "monospace" }}>+{session.phone_number}</p>}
              {session?.session_id && <p style={{ fontSize: "11px", color: "#475569", margin: "2px 0 0 0", fontFamily: "monospace" }}>Session: {session.session_id}</p>}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => refetch()} style={{ padding: "9px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "#94a3b8", fontSize: "12px", cursor: "pointer" }}>↺ Refresh</button>
            {session?.status !== "connected" && (
              <a href="/user/pair" style={{ padding: "9px 18px", background: "linear-gradient(135deg, #00ff88, #06b6d4)", border: "none", borderRadius: "10px", color: "#080810", fontSize: "12px", fontWeight: "700", cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                ⟳ Connect
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
        {actions.map((action) => (
          <a key={action.label} href={action.href} target={action.external ? "_blank" : "_self"} rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", textDecoration: "none", transition: "border-color 0.15s" }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = `${action.color}40`)}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)")}
          >
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${action.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>{action.icon}</div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>{action.label}</div>
              <div style={{ fontSize: "11px", color: "#475569" }}>{action.desc}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
