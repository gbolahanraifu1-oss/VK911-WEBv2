"use client";
import { useState, useEffect } from "react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "⬡", href: "/dashboard" },
  {
    id: "pairing",
    label: "Web Pairing",
    icon: "⟳",
    href: "/dashboard/pairing",
  },
  { id: "commands", label: "Commands", icon: "⌘", href: "/dashboard/commands" },
  {
    id: "analytics",
    label: "Analytics",
    icon: "◈",
    href: "/dashboard/analytics",
  },
  { id: "sessions", label: "Sessions", icon: "◉", href: "/dashboard/sessions" },
  { id: "settings", label: "Settings", icon: "⚙", href: "/dashboard/settings" },
  {
    id: "download",
    label: "Download Bot",
    icon: "↓",
    href: "/dashboard/download",
  },
];

export default function DashSidebar({ active }) {
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem("vk911_user");
    if (u) setUser(JSON.parse(u));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("vk911_token");
    localStorage.removeItem("vk911_user");
    window.location.href = "/";
  };

  const SidebarContent = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? "20px 12px" : "24px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #00ff88, #06b6d4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 0 20px rgba(0,255,136,0.3)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345z" />
          </svg>
        </div>
        {!collapsed && (
          <div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "800",
                color: "#f1f5f9",
                lineHeight: 1.2,
              }}
            >
              VK911 XMD
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "#00ff88",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "1px",
              }}
            >
              v2.0.3
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            color: "#475569",
            cursor: "pointer",
            fontSize: "16px",
            padding: "4px",
          }}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <a
              key={item.id}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: collapsed ? "12px" : "11px 14px",
                borderRadius: "10px",
                marginBottom: "2px",
                background: isActive ? "rgba(0,255,136,0.1)" : "transparent",
                border: isActive
                  ? "1px solid rgba(0,255,136,0.2)"
                  : "1px solid transparent",
                color: isActive ? "#00ff88" : "#64748b",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: isActive ? "600" : "400",
                transition: "all 0.15s",
                justifyContent: collapsed ? "center" : "flex-start",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.color = "#e2e8f0";
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748b";
                }
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  flexShrink: 0,
                  fontFamily: "monospace",
                }}
              >
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && isActive && (
                <span
                  style={{
                    marginLeft: "auto",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#00ff88",
                    boxShadow: "0 0 8px #00ff88",
                  }}
                />
              )}
            </a>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div
        style={{
          padding: "12px 8px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 14px",
            borderRadius: "10px",
            background: "rgba(255,255,255,0.03)",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "700",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {user?.username?.[0]?.toUpperCase() || "A"}
          </div>
          {!collapsed && (
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#e2e8f0",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.username || "Admin"}
              </div>
              <div style={{ fontSize: "10px", color: "#22c55e" }}>● Online</div>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: collapsed ? "10px" : "10px 14px",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.15)",
            borderRadius: "10px",
            color: "#ef4444",
            fontSize: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: "8px",
            transition: "all 0.15s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "rgba(239,68,68,0.15)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "rgba(239,68,68,0.08)")
          }
        >
          <span>⎋</span>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen((o) => !o)}
        style={{
          display: "none",
          position: "fixed",
          top: "16px",
          left: "16px",
          zIndex: 1000,
          width: "40px",
          height: "40px",
          background: "rgba(0,255,136,0.15)",
          border: "1px solid rgba(0,255,136,0.3)",
          borderRadius: "10px",
          color: "#00ff88",
          fontSize: "18px",
          cursor: "pointer",
          alignItems: "center",
          justifyContent: "center",
        }}
        className="mobile-sidebar-toggle"
      >
        ☰
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 998,
          }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: collapsed ? "68px" : "220px",
          minHeight: "100vh",
          background: "#0a0a16",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          flexShrink: 0,
          transition: "width 0.2s",
          position: "relative",
          zIndex: 999,
        }}
        className="dash-sidebar"
      >
        <SidebarContent />
      </aside>

      <style jsx global>{`
        @media(max-width:768px){
          .dash-sidebar{position:fixed!important;left:${mobileOpen ? "0" : "-220px"}!important;top:0!important;bottom:0!important;width:220px!important;transition:left 0.25s!important;}
          .mobile-sidebar-toggle{display:flex!important;}
        }
      `}</style>
    </>
  );
}
