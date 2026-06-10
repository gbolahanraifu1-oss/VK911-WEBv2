import { useEffect, useState } from "react";
import { Outlet } from "react-router";

const navItems = [
  { id: "user", label: "My Session", icon: "◉", href: "/user" },
  { id: "pair", label: "Pair Device", icon: "⟳", href: "/user/pair" },
  { id: "contact", label: "Contact Us", icon: "✉", href: "/user/contact" },
];

export default function UserLayout() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("user");

  useEffect(() => {
    const token = localStorage.getItem("vk911_token");
    if (!token) { window.location.href = "/"; return; }
    const u = localStorage.getItem("vk911_user");
    if (u) {
      const parsed = JSON.parse(u);
      if (parsed.role === "admin") { window.location.href = "/dashboard"; return; }
      setUser(parsed);
    }
    const path = window.location.pathname;
    if (path.includes("/pair")) setActive("pair");
    else if (path.includes("/contact")) setActive("contact");
    else setActive("user");
  }, []);

  // Load bot URL from DB and cache in localStorage for user pages
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/config?key=bot_url");
        const data = await res.json();
        if (data.value) localStorage.setItem("vk911_bot_url", data.value);
      } catch {}
    };
    load();
  }, []);

  const logout = () => {
    localStorage.removeItem("vk911_token");
    localStorage.removeItem("vk911_user");
    window.location.href = "/";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080810", fontFamily: "'Inter', sans-serif" }}>
      <header style={{ background: "#0a0a16", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "0 24px", display: "flex", alignItems: "center", height: "56px", gap: "16px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginRight: "auto" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg, #00ff88, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345z"/></svg>
          </div>
          <span style={{ fontSize: "14px", fontWeight: "800", color: "#f1f5f9" }}>VK911 MINI</span>
          <span style={{ fontSize: "10px", color: "#00ff88", fontFamily: "monospace", padding: "2px 8px", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: "99px" }}>USER</span>
        </div>

        {navItems.map((item) => (
          <a key={item.id} href={item.href} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "8px", background: active === item.id ? "rgba(0,255,136,0.1)" : "transparent", border: active === item.id ? "1px solid rgba(0,255,136,0.25)" : "1px solid transparent", color: active === item.id ? "#00ff88" : "#64748b", textDecoration: "none", fontSize: "13px", fontWeight: active === item.id ? "600" : "400", transition: "all 0.15s" }}
            onMouseOver={(e) => { if (active !== item.id) e.currentTarget.style.color = "#e2e8f0"; }}
            onMouseOut={(e) => { if (active !== item.id) e.currentTarget.style.color = "#64748b"; }}
          >
            <span style={{ fontFamily: "monospace" }}>{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto" }}>
          <span style={{ fontSize: "12px", color: "#475569" }}>{user?.username}</span>
          <button onClick={logout} style={{ padding: "6px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "8px", color: "#ef4444", fontSize: "12px", cursor: "pointer" }}>Sign Out</button>
        </div>
      </header>

      <main style={{ padding: "32px 24px", maxWidth: "900px", margin: "0 auto" }}>
        <Outlet />
      </main>
    </div>
  );
}
