"use client";
import { useEffect, useState } from "react";
import DashSidebar from "../../components/DashSidebar";

export default function DashboardLayout({ children }) {
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

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080810" }}>
      <DashSidebar active={active} />
      <main
        style={{ flex: 1, overflowX: "hidden", overflowY: "auto", minWidth: 0 }}
      >
        {children}
      </main>
    </div>
  );
}
