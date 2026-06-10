import { useState, useEffect, useRef } from "react";

const Toggle = ({ value, onChange, saving }) => (
  <button onClick={() => !saving && onChange(!value)} style={{ width: "44px", height: "24px", borderRadius: "12px", background: value ? "#00ff88" : "rgba(255,255,255,0.1)", border: "none", cursor: saving ? "wait" : "pointer", position: "relative", transition: "background 0.2s", opacity: saving ? 0.6 : 1 }}>
    <span style={{ position: "absolute", top: "3px", left: value ? "22px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: value ? "#080810" : "#475569", transition: "left 0.2s" }} />
  </button>
);

const FIELDS = [
  { key: "readMessages", label: "Read Messages", sub: "Mark your messages as read (blue ticks) when the bot processes them", icon: "✓✓" },
  { key: "readStatus", label: "Read Status/Stories", sub: "Auto-read WhatsApp status updates from contacts", icon: "◉" },
  { key: "autoReact", label: "Auto React", sub: "Bot reacts ✅ to your successful commands automatically", icon: "✅" },
  { key: "welcomeMsg", label: "Welcome Messages", sub: "Show welcome message when joining a group with the bot", icon: "👋" },
];

export default function UserSettingsPage() {
  const [settings, setSettings] = useState({ readMessages: true, readStatus: false, autoReact: true, welcomeMsg: true });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedKey, setSavedKey] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        const parsed = {};
        for (const k of ["readMessages","readStatus","autoReact","welcomeMsg"]) {
          parsed[k] = data[k] === "true" || data[k] === true;
        }
        setSettings((s) => ({ ...s, ...parsed }));
      } catch {}
      setLoaded(true);
    };
    load();
  }, []);

  const toggle = async (key, val) => {
    setSettings((s) => ({ ...s, [key]: val }));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaving(true);
      try {
        const token = localStorage.getItem("vk911_token");
        await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ settings: { [key]: val } }),
        });
        setSavedKey(key);
        setTimeout(() => setSavedKey(null), 2000);
      } catch {}
      setSaving(false);
    }, 400);
  };

  if (!loaded) return <div style={{ padding: "32px", color: "#475569", fontSize: "13px" }}>Loading settings...</div>;

  return (
    <div style={{ maxWidth: "600px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#f1f5f9", margin: "0 0 6px 0" }}>⚙ My Settings</h1>
        <p style={{ color: "#475569", fontSize: "13px", margin: 0 }}>Personalize how VK911 MINI behaves for you</p>
      </div>

      <div style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", overflow: "hidden" }}>
        <div style={{ padding: "14px 22px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h3 style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", margin: 0 }}>⬦ Bot Behavior</h3>
        </div>
        <div style={{ padding: "8px 0" }}>
          {FIELDS.map((field) => (
            <div key={field.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.03)", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: settings[field.key] ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${settings[field.key] ? "rgba(0,255,136,0.2)" : "rgba(255,255,255,0.06)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0, transition: "all 0.2s" }}>
                  {field.icon}
                </div>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: "500", color: "#e2e8f0", margin: "0 0 2px 0" }}>{field.label}</p>
                  <p style={{ fontSize: "11px", color: "#475569", margin: 0 }}>{field.sub}</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                {savedKey === field.key && <span style={{ fontSize: "10px", color: "#22c55e", fontFamily: "monospace" }}>Saved</span>}
                <Toggle value={settings[field.key]} onChange={(v) => toggle(field.key, v)} saving={saving} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "20px", background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.08)", borderRadius: "12px", padding: "16px 20px" }}>
        <p style={{ fontSize: "12px", color: "#475569", margin: 0, lineHeight: "1.7" }}>
          Changes save automatically. Advanced settings (anti-spam, bot mode, API keys) are managed by the admin. 
          For help, use <a href="/user/contact" style={{ color: "#00ff88", fontWeight: "600" }}>Contact Us →</a>
        </p>
      </div>
    </div>
  );
}
