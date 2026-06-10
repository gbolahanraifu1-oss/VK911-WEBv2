import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import DashSidebar from "../../components/DashSidebar";

export default function DashboardLayout() {
  const [active, setActive] = useState("dashboard");

  useEffect(() => {
    const token = localStorage.getItem("vk911_token");
    if (!token) window.location.href = "/";
    const path = window.location.pathname;
    if (path.includes("/pairing")) setActive("pairing");
    else if (path.includes("/commands")) setActive("commands");
    else if (path.includes("/analytics")) setActive("analytics");
    else if (path.includes("/sessions")) setActive("sessions");
    else if (path.includes("/settings")) setActive("settings");
    else if (path.includes("/download")) setActive("download");
    else setActive("dashboard");
  }, []);

  // Load bot URL from DB then keepalive ping every 4 min
  useEffect(() => {
    let botUrl = "";
    const loadAndPing = async () => {
      try {
        const res = await fetch("/api/config?key=bot_url");
        const data = await res.json();
        if (data.value) {
          botUrl = data.value;
          localStorage.setItem("vk911_bot_url", data.value);
        } else {
          botUrl = localStorage.getItem("vk911_bot_url") || "";
        }
      } catch {
        botUrl = localStorage.getItem("vk911_bot_url") || "";
      }
      if (!botUrl) return;
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      fetch(`${botUrl}/health`, { signal: ctrl.signal })
        .then(() => clearTimeout(t))
        .catch(() => clearTimeout(t));
    };
    loadAndPing();
    const id = setInterval(() => {
      const url = localStorage.getItem("vk911_bot_url");
      if (!url) return;
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      fetch(`${url}/health`, { signal: ctrl.signal })
        .then(() => clearTimeout(t))
        .catch(() => clearTimeout(t));
    }, 4 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080810" }}>
      <DashSidebar active={active} />
      <main style={{ flex: 1, overflowX: "hidden", overflowY: "auto", minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
