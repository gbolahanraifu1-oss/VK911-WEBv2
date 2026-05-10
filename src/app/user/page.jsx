import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function UserHomePage() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    const u = localStorage.getItem("vk911_user");
    const t = localStorage.getItem("vk911_token");
    if (u) setUser(JSON.parse(u));
    if (t) setToken(t);
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

  const statusColor = session?.status === "connected" ? "#22c55e" : session?.status === "connecting" ? "#f59e0b" : "#ef4444";
  const statusLabel = session?.status === "connected" ? "Connected" : session?.status === "connecting" ? "Connecting..." : "Not Connected";

  return (
    <div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Welcome */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#f1f5f9", margin: "0 0 6px 0" }}>
          Welcome back, <span style={{ background: "linear-gradient(135deg, #00ff88, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{user?.username}</span> 👋
        </h1>
        <p style={{ color: "#475569", fontSize: "13px", margin: 0 }}>Manage your VK911 XMD WhatsApp bot session</p>
      </div>

      {/* Connection Status Card */}
      <div style={{ background: "#0f0f1a", border: `1px solid ${session?.status === "connected" ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: "16px", padding: "28px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: `${statusColor}15`, border: `2px solid ${statusColor}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
              {session?.status === "connected" ? "📱" : "🔌"}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: statusColor, animation: session?.status === "connected" ? "pulse 2s infinite" : "none" }} />
                <span style={{ fontSize: "16px", fontWeight: "700", color: statusColor }}>{isLoading ? "Checking..." : statusLabel}</span>
              </div>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                {session?.phone ? `Paired with ${session.phone}` : "No device paired yet"}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => refetch()} style={{ padding: "9px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#64748b", fontSize: "12px", cursor: "pointer" }}>↺ Refresh</button>
            {session?.status !== "connected" && (
              <a href="/user/pair" style={{ padding: "9px 18px", background: "linear-gradient(135deg, #00ff88, #06b6d4)", border: "none", borderRadius: "8px", color: "#080810", fontSize: "12px", fontWeight: "700", cursor: "pointer", textDecoration: "none" }}>+ Pair Device</a>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Session Status", value: isLoading ? "—" : statusLabel, color: statusColor, icon: "◉" },
          { label: "Paired Phone", value: session?.phone || "—", color: "#6366f1", icon: "📱" },
          { label: "Connected Since", value: session?.connected_at ? new Date(session.connected_at).toLocaleDateString() : "—", color: "#22d3ee", icon: "📅" },
          { label: "Messages Sent", value: session?.messages_sent || "0", color: "#f59e0b", icon: "✉" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "18px 20px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "3px", height: "100%", background: s.color }} />
            <p style={{ fontSize: "11px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 8px 0" }}>{s.label}</p>
            <p style={{ fontSize: "18px", fontWeight: "800", color: "#f1f5f9", margin: 0, fontFamily: "monospace" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "22px" }}>
        <h3 style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 18px 0" }}>⬦ Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          {[
            { label: "Pair New Device", desc: "Connect WhatsApp via QR or code", href: "/user/pair", color: "#00ff88", icon: "⟳" },
            { label: "Contact Support", desc: "Get help from the VK911 team", href: "/user/contact", color: "#6366f1", icon: "✉" },
            { label: "VK911 Channel", desc: "Follow for updates & tips", href: "https://whatsapp.com/channel/0029VaYpQHFHXotnpcTf3C3T", color: "#22d3ee", icon: "📢", external: true },
          ].map((action) => (
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
    </div>
  );
}