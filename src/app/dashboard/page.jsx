import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const StatCard = ({ label, value, sub, color, icon }) => (
  <div style={{
    background: "#0f0f1a",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "14px", padding: "20px 22px",
    position: "relative", overflow: "hidden",
  }}>
    <div style={{
      position: "absolute", top: 0, left: 0,
      width: "3px", height: "100%",
      background: color, borderRadius: "14px 0 0 14px",
    }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <p style={{ fontSize: "11px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 10px 0", fontWeight: "600" }}>{label}</p>
        <p style={{ fontSize: "28px", fontWeight: "800", color: "#f1f5f9", margin: "0 0 4px 0", fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
        <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>{sub}</p>
      </div>
      <span style={{ fontSize: "28px", opacity: 0.6 }}>{icon}</span>
    </div>
  </div>
);

const COLORS = ["#00ff88", "#6366f1", "#22d3ee", "#f59e0b", "#ec4899"];

const defaultMsgData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  count: Math.floor(Math.random() * 150 + 20),
}));
const defaultCmdData = [
  { name: ".play", count: 248 },
  { name: ".sticker", count: 195 },
  { name: ".tiktok", count: 167 },
  { name: ".ai", count: 143 },
  { name: ".ytmp3", count: 129 },
  { name: ".kick", count: 98 },
];
const defaultCatData = [
  { name: "Media", value: 45 },
  { name: "Admin", value: 30 },
  { name: "Fun", value: 55 },
  { name: "AI", value: 20 },
  { name: "Utility", value: 64 },
];
const activityLog = [
  { time: "14:32", type: "cmd", msg: ".ytmp4 executed — 120910912@g.us" },
  { time: "14:31", type: "cmd", msg: ".sticker executed — 25476221@s.whatsapp.net" },
  { time: "14:30", type: "info", msg: "Bot reconnected to WhatsApp servers" },
  { time: "14:28", type: "warn", msg: "Rate limit hit on media downloads" },
  { time: "14:25", type: "cmd", msg: ".ai executed — 25470100@s.whatsapp.net" },
  { time: "14:22", type: "cmd", msg: ".kick executed in group — admin action" },
  { time: "14:19", type: "info", msg: "New session registered: main-session" },
];

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to load stats");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const { data: sessions } = useQuery({
    queryKey: ["sessions-list"],
    queryFn: async () => {
      const res = await fetch("/api/sessions");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 15000,
  });

  const msgData = stats?.messageVolume || [];
  const cmdData = stats?.topCommands || [];
  const catData = stats?.categoryStats || [];

  return (
    <div style={{ padding: "32px", maxWidth: "1400px" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <div style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: "#22c55e", boxShadow: "0 0 8px #22c55e",
            animation: "pulse 2s infinite",
          }} />
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#f1f5f9", margin: 0 }}>Overview</h1>
          <span style={{
            padding: "3px 10px",
            background: "rgba(0,255,136,0.1)",
            border: "1px solid rgba(0,255,136,0.25)",
            borderRadius: "99px", fontSize: "10px",
            color: "#00ff88", fontFamily: "monospace", letterSpacing: "1px",
          }}>LIVE</span>
        </div>
        <p style={{ color: "#475569", fontSize: "13px", margin: 0 }}>
          VK911 MINI v2.0.3 — Real-time bot performance & stats
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        <StatCard label="Total Commands" value={isLoading ? "—" : stats?.totalCommands || 214} sub="200+ available plugins" color="#00ff88" icon="⌘" />
        <StatCard label="Messages Today" value={isLoading ? "—" : stats?.messagesToday || 0} sub="Processed by bot" color="#6366f1" icon="✉" />
        <StatCard label="Active Sessions" value={isLoading ? "—" : sessions?.length || 0} sub="Live connections" color="#22d3ee" icon="◉" />
        <StatCard label="Commands Used" value={isLoading ? "—" : stats?.commandsUsed || 0} sub="Last 24 hours" color="#f59e0b" icon="◈" />
        <StatCard label="Success Rate" value={isLoading ? "—" : `${stats?.successRate || 99}%`} sub="Command success" color="#ec4899" icon="✓" />
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "20px", marginBottom: "20px" }}>
        <div style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "22px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: "600", color: "#94a3b8", margin: "0 0 20px 0", textTransform: "uppercase", letterSpacing: "0.8px" }}>⬦ Message Volume — 24h</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={msgData.length ? msgData : defaultMsgData}>
              <defs>
                <linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="hour" tick={{ fill: "#475569", fontSize: 10 }} />
              <YAxis tick={{ fill: "#475569", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(0,255,136,0.3)", borderRadius: "8px", color: "#e2e8f0" }} />
              <Area type="monotone" dataKey="count" stroke="#00ff88" fill="url(#msgGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "22px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: "600", color: "#94a3b8", margin: "0 0 20px 0", textTransform: "uppercase", letterSpacing: "0.8px" }}>⬦ Top Commands</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={cmdData.length ? cmdData : defaultCmdData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" tick={{ fill: "#475569", fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#94a3b8", fontSize: 10 }} width={70} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "8px", color: "#e2e8f0" }} />
              <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "20px", marginBottom: "20px" }}>
        <div style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "22px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: "600", color: "#94a3b8", margin: "0 0 20px 0", textTransform: "uppercase", letterSpacing: "0.8px" }}>⬦ Commands by Category</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <ResponsiveContainer width={150} height={150}>
              <PieChart>
                <Pie data={catData.length ? catData : defaultCatData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {(catData.length ? catData : defaultCatData).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2e8f0" }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {(catData.length ? catData : defaultCatData).map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", color: "#94a3b8", flex: 1 }}>{item.name}</span>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#e2e8f0", fontFamily: "monospace" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "22px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: "600", color: "#94a3b8", margin: "0 0 20px 0", textTransform: "uppercase", letterSpacing: "0.8px" }}>⬦ Recent Activity</h3>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px" }}>
            {activityLog.map((log, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", paddingBottom: "10px", marginBottom: "10px", borderBottom: i < activityLog.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <span style={{ color: "#334155", flexShrink: 0 }}>{log.time}</span>
                <span style={{ color: log.type === "cmd" ? "#00ff88" : log.type === "warn" ? "#f59e0b" : "#6366f1" }}>[{log.type.toUpperCase()}]</span>
                <span style={{ color: "#94a3b8" }}>{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bot Info Footer */}
      <div style={{ background: "#0f0f1a", border: "1px solid rgba(0,255,136,0.1)", borderRadius: "14px", padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {[["Bot Name","VK911 MINI"],["Version","v2.0.3"],["Engine","Baileys"],["Runtime","Node.js"],["Plugins","8 active"]].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: "10px", color: "#334155", textTransform: "uppercase", letterSpacing: "0.8px" }}>{k}</div>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#e2e8f0", fontFamily: "monospace" }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: "11px", color: "#334155" }}>© powered by VK911 TECH</div>
      </div>
    </div>
  );
}