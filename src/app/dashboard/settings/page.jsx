import { useState, useEffect, useRef } from "react";

const Section = ({ title, children }) => (
  <div style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", marginBottom: "20px", overflow: "hidden" }}>
    <div style={{ padding: "14px 22px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <h3 style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", margin: 0 }}>⬦ {title}</h3>
    </div>
    <div style={{ padding: "22px" }}>{children}</div>
  </div>
);

const Field = ({ label, sub, children }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "18px", marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.04)", flexWrap: "wrap", gap: "12px" }}>
    <div>
      <p style={{ fontSize: "13px", fontWeight: "500", color: "#e2e8f0", margin: "0 0 3px 0" }}>{label}</p>
      {sub && <p style={{ fontSize: "11px", color: "#475569", margin: 0 }}>{sub}</p>}
    </div>
    {children}
  </div>
);

const Toggle = ({ value, onChange, saving }) => (
  <button onClick={() => !saving && onChange(!value)} style={{ width: "44px", height: "24px", borderRadius: "12px", background: value ? "#00ff88" : "rgba(255,255,255,0.1)", border: "none", cursor: saving ? "wait" : "pointer", position: "relative", transition: "background 0.2s", opacity: saving ? 0.6 : 1 }}>
    <span style={{ position: "absolute", top: "3px", left: value ? "22px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: value ? "#080810" : "#475569", transition: "left 0.2s" }} />
  </button>
);

const InputStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "9px 14px", fontSize: "13px", color: "#e2e8f0", outline: "none", fontFamily: "'JetBrains Mono', monospace", minWidth: "200px" };

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    prefix: ".", botName: "VK911 MINI", ownerNumber: "", timezone: "Africa/Lagos",
    antilink: false, antispam: true, antibot: false, antitoxic: false,
    welcomeMsg: true, goodbyeMsg: true, readMessages: true, readStatus: false,
    autoReact: true, publicMode: true, selfBot: false, nsfwEnabled: false,
    channelLink: "https://whatsapp.com/channel/0029VaYpQHFHXotnpcTf3C3T",
    channelName: "VK911 MINI Official", footerText: "© powered by VK911 TECH",
    maxFileSize: "100", botApiPort: "3001",
  });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [botUrl, setBotUrl] = useState("");
  const saveTimer = useRef(null);

  // Load settings from DB on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [settingsRes, configRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/config?key=bot_url"),
        ]);
        const data = await settingsRes.json();
        const config = await configRes.json();
        if (config.value) setBotUrl(config.value);
        // Convert string booleans from DB to actual booleans
        const parsed = {};
        for (const [k, v] of Object.entries(data)) {
          parsed[k] = v === "true" ? true : v === "false" ? false : v;
        }
        setSettings((s) => ({ ...s, ...parsed }));
      } catch {}
      setLoaded(true);
    };
    load();
  }, []);

  const set = (key, val) => setSettings((s) => ({ ...s, [key]: val }));

  // Auto-save after 600ms debounce whenever settings change
  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { saveToDb(false); }, 600);
    return () => clearTimeout(saveTimer.current);
  }, [settings]);

  const saveToDb = async (syncBot = false) => {
    setSaving(true);
    setSyncStatus(null);
    try {
      const token = localStorage.getItem("vk911_token");
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ settings, botUrl: syncBot ? botUrl : undefined }),
      });
      const data = await res.json();
      setSyncStatus({
        ok: true,
        botSynced: data.botSynced,
        botError: data.botError,
        msg: data.message,
      });
    } catch (err) {
      setSyncStatus({ ok: false, msg: "Save failed: " + err.message });
    } finally {
      setSaving(false);
      if (syncBot) setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  if (!loaded) return (
    <div style={{ padding: "32px", color: "#475569", fontSize: "13px" }}>Loading settings...</div>
  );

  return (
    <div style={{ padding: "32px", maxWidth: "900px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#f1f5f9", margin: "0 0 6px 0" }}>⚙ Settings</h1>
          <p style={{ color: "#475569", fontSize: "13px", margin: 0 }}>Configure VK911 MINI bot behavior — changes auto-save to database</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {saving && <span style={{ fontSize: "11px", color: "#f59e0b", fontFamily: "monospace" }}>Saving...</span>}
          {syncStatus && !saving && (
            <span style={{ fontSize: "11px", color: syncStatus.ok ? "#22c55e" : "#ef4444", fontFamily: "monospace" }}>
              {syncStatus.ok ? (syncStatus.botSynced ? "✓ Saved + synced to bot" : "✓ Saved to DB") : syncStatus.msg}
            </span>
          )}
          <button onClick={() => saveToDb(true)} disabled={saving || !botUrl} style={{ padding: "10px 22px", background: botUrl ? "linear-gradient(135deg, #00ff88, #06b6d4)" : "rgba(255,255,255,0.05)", border: botUrl ? "none" : "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: botUrl ? "#080810" : "#334155", fontSize: "13px", fontWeight: "700", cursor: botUrl ? "pointer" : "not-allowed" }} title={!botUrl ? "Configure bot URL first in the Pairing page" : ""}>
            ⟳ Sync to Bot
          </button>
        </div>
      </div>

      {/* Bot sync info */}
      {syncStatus?.botError && (
        <div style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "12px", color: "#d97706" }}>
          ⚠ Settings saved to DB but bot sync failed: {syncStatus.botError}. Update your bot to support <code style={{ fontFamily: "monospace", background: "rgba(255,255,255,0.05)", padding: "1px 6px", borderRadius: "4px" }}>POST /config</code> — or re-deploy after changing env vars.
        </div>
      )}

      <Section title="Bot Identity">
        <Field label="Bot Name" sub="Display name shown in bot messages">
          <input value={settings.botName} onChange={(e) => set("botName", e.target.value)} style={InputStyle} />
        </Field>
        <Field label="Command Prefix" sub="Character used before commands (e.g. . / ! $)">
          <input value={settings.prefix} onChange={(e) => set("prefix", e.target.value)} style={{ ...InputStyle, width: "80px", minWidth: "80px", textAlign: "center" }} maxLength={2} />
        </Field>
        <Field label="Owner Number" sub="Your WhatsApp number with country code (no +)">
          <input value={settings.ownerNumber} onChange={(e) => set("ownerNumber", e.target.value)} placeholder="2347001234567" style={InputStyle} />
        </Field>
        <Field label="Timezone" sub="Server timezone for scheduled messages">
          <select value={settings.timezone} onChange={(e) => set("timezone", e.target.value)} style={{ ...InputStyle, cursor: "pointer" }}>
            {["Africa/Lagos","Africa/Nairobi","Africa/Johannesburg","America/New_York","America/Chicago","America/Los_Angeles","Europe/London","Europe/Paris","Asia/Kolkata","Asia/Jakarta","Asia/Dubai","Asia/Singapore"].map((tz) => (
              <option key={tz} value={tz} style={{ background: "#0f0f1a" }}>{tz}</option>
            ))}
          </select>
        </Field>
        <Field label="Footer Text" sub="Footer shown in bot messages">
          <input value={settings.footerText} onChange={(e) => set("footerText", e.target.value)} style={{ ...InputStyle, minWidth: "240px" }} />
        </Field>
      </Section>

      <Section title="Bot Mode & Access">
        <Field label="Public Mode" sub="Allow anyone to use the bot (not just owner/groups)">
          <Toggle value={settings.publicMode} onChange={(v) => set("publicMode", v)} saving={saving} />
        </Field>
        <Field label="Self Bot Mode" sub="Bot only responds to the owner (private use)">
          <Toggle value={settings.selfBot} onChange={(v) => set("selfBot", v)} saving={saving} />
        </Field>
        <Field label="Read Messages" sub="Mark messages as read (✓✓ blue ticks) when processed">
          <Toggle value={settings.readMessages} onChange={(v) => set("readMessages", v)} saving={saving} />
        </Field>
        <Field label="Read Status/Stories" sub="Auto-read WhatsApp status updates">
          <Toggle value={settings.readStatus} onChange={(v) => set("readStatus", v)} saving={saving} />
        </Field>
        <Field label="Auto React" sub="Auto-react ✅ to successful commands">
          <Toggle value={settings.autoReact} onChange={(v) => set("autoReact", v)} saving={saving} />
        </Field>
      </Section>

      <Section title="Auto-Moderation">
        <Field label="Anti-Link" sub="Delete links posted in groups automatically">
          <Toggle value={settings.antilink} onChange={(v) => set("antilink", v)} saving={saving} />
        </Field>
        <Field label="Anti-Spam" sub="Detect and remove spam messages">
          <Toggle value={settings.antispam} onChange={(v) => set("antispam", v)} saving={saving} />
        </Field>
        <Field label="Anti-Bot" sub="Block other bots from joining groups">
          <Toggle value={settings.antibot} onChange={(v) => set("antibot", v)} saving={saving} />
        </Field>
        <Field label="Anti-Toxic" sub="Auto-delete toxic/offensive messages">
          <Toggle value={settings.antitoxic} onChange={(v) => set("antitoxic", v)} saving={saving} />
        </Field>
        <Field label="Welcome Messages" sub="Send welcome message when members join">
          <Toggle value={settings.welcomeMsg} onChange={(v) => set("welcomeMsg", v)} saving={saving} />
        </Field>
        <Field label="Goodbye Messages" sub="Send goodbye message when members leave">
          <Toggle value={settings.goodbyeMsg} onChange={(v) => set("goodbyeMsg", v)} saving={saving} />
        </Field>
        <Field label="NSFW Commands" sub="Enable adult content commands (18+ groups only)">
          <Toggle value={settings.nsfwEnabled} onChange={(v) => set("nsfwEnabled", v)} saving={saving} />
        </Field>
      </Section>

      <Section title="WhatsApp Channel">
        <Field label="Channel Name" sub="Official VK911 MINI WhatsApp channel name">
          <input value={settings.channelName} onChange={(e) => set("channelName", e.target.value)} style={InputStyle} />
        </Field>
        <Field label="Channel Link" sub="WhatsApp channel link shown in .menu and .channel">
          <input value={settings.channelLink} onChange={(e) => set("channelLink", e.target.value)} style={{ ...InputStyle, minWidth: "280px" }} placeholder="https://whatsapp.com/channel/xxx" />
        </Field>
      </Section>

      <Section title="API Keys (Media & AI)">
        <div style={{ marginBottom: "14px", padding: "12px 14px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "8px", fontSize: "12px", color: "#d97706" }}>
          ⚠ API keys here are for reference only. Set them in the bot's <code style={{ fontFamily: "monospace" }}>.env</code> file for actual use — they are not forwarded to the bot server.
        </div>
        {[{label:"OpenAI API Key",key:"gptApiKey",ph:"sk-proj-..."},{label:"Google Gemini Key",key:"geminiApiKey",ph:"AIza..."},{label:"Max File Size (MB)",key:"maxFileSize",ph:"100",type:"number"},{label:"Bot API Port",key:"botApiPort",ph:"3001",type:"number"}].map(({label,key,ph,type}) => (
          <Field key={key} label={label}>
            <input type={type || "text"} value={settings[key] || ""} onChange={(e) => set(key, e.target.value)} placeholder={ph} style={{ ...InputStyle, minWidth: type ? "120px" : "260px" }} />
          </Field>
        ))}
      </Section>

      {/* Bot config endpoint info */}
      <div style={{ background: "#0f0f1a", border: "1px solid rgba(99,102,241,0.15)", borderRadius: "14px", padding: "20px 24px" }}>
        <p style={{ fontSize: "12px", fontWeight: "700", color: "#6366f1", margin: "0 0 10px 0" }}>ℹ How settings sync to your bot</p>
        <p style={{ fontSize: "12px", color: "#475569", margin: "0 0 10px 0", lineHeight: "1.8" }}>
          All settings auto-save to the dashboard database. To live-sync with your running bot, click <strong style={{ color: "#e2e8f0" }}>⟳ Sync to Bot</strong> — this calls <code style={{ fontFamily: "monospace", color: "#00ff88", fontSize: "11px" }}>POST {botUrl || "http://your-bot"}/config</code>
        </p>
        <p style={{ fontSize: "12px", color: "#475569", margin: 0 }}>
          For the bot to accept live config, update <code style={{ fontFamily: "monospace", color: "#94a3b8", fontSize: "11px" }}>lib/apiServer.js</code> to handle <code style={{ fontFamily: "monospace", color: "#94a3b8", fontSize: "11px" }}>POST /config</code>, or restart the bot after changing <code style={{ fontFamily: "monospace", color: "#94a3b8", fontSize: "11px" }}>.env</code>.
        </p>
      </div>
    </div>
  );
}
