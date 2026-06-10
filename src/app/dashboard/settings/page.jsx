"use client";
import { useState } from "react";

const Section = ({ title, children }) => (
  <div
    style={{
      background: "#0f0f1a",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "14px",
      marginBottom: "20px",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        padding: "16px 22px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <h3
        style={{
          fontSize: "12px",
          fontWeight: "700",
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.8px",
          margin: 0,
        }}
      >
        ⬦ {title}
      </h3>
    </div>
    <div style={{ padding: "22px" }}>{children}</div>
  </div>
);

const Field = ({ label, sub, children }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: "18px",
      marginBottom: "18px",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      flexWrap: "wrap",
      gap: "12px",
    }}
  >
    <div>
      <p
        style={{
          fontSize: "13px",
          fontWeight: "500",
          color: "#e2e8f0",
          margin: "0 0 3px 0",
        }}
      >
        {label}
      </p>
      {sub && (
        <p style={{ fontSize: "11px", color: "#475569", margin: 0 }}>{sub}</p>
      )}
    </div>
    {children}
  </div>
);

const Toggle = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    style={{
      width: "44px",
      height: "24px",
      borderRadius: "12px",
      background: value ? "#00ff88" : "rgba(255,255,255,0.1)",
      border: "none",
      cursor: "pointer",
      position: "relative",
      transition: "background 0.2s",
    }}
  >
    <span
      style={{
        position: "absolute",
        top: "3px",
        left: value ? "22px" : "3px",
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        background: value ? "#080810" : "#475569",
        transition: "left 0.2s",
      }}
    />
  </button>
);

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    prefix: ".",
    botName: "VK911 MINI",
    ownerNumber: "",
    timezone: "Africa/Lagos",
    antilink: false,
    antispam: true,
    antibot: false,
    antitoxic: false,
    welcomeMsg: true,
    goodbyeMsg: true,
    readMessages: true,
    readStatus: false,
    autoReact: true,
    publicMode: false,
    selfBot: false,
    nsfwEnabled: false,
    channelLink: "https://whatsapp.com/channel/vk911xmd",
    channelName: "VK911 MINI Official",
    botImage: "",
    footerText: "© powered by VK911 TECH",
    botApiPort: "3001",
    playApiKey: "",
    dalleApiKey: "",
    gptApiKey: "",
    geminiApiKey: "",
    maxFileSize: "100",
    sessionName: "VK911-Session",
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setSettings((s) => ({ ...s, [key]: val }));

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const InputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    padding: "9px 14px",
    fontSize: "13px",
    color: "#e2e8f0",
    outline: "none",
    fontFamily: "'JetBrains Mono', monospace",
    minWidth: "200px",
  };

  return (
    <div style={{ padding: "32px", maxWidth: "900px" }}>
      <div
        style={{
          marginBottom: "28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: "800",
              color: "#f1f5f9",
              margin: "0 0 6px 0",
            }}
          >
            ⚙ Settings
          </h1>
          <p style={{ color: "#475569", fontSize: "13px", margin: 0 }}>
            Configure VK911 MINI bot behavior and features
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          style={{
            padding: "10px 24px",
            background: saved
              ? "rgba(34,197,94,0.2)"
              : "linear-gradient(135deg, #00ff88, #06b6d4)",
            border: saved ? "1px solid rgba(34,197,94,0.3)" : "none",
            borderRadius: "10px",
            color: saved ? "#22c55e" : "#080810",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          {saving ? "— Saving..." : saved ? "✓ Saved!" : "→ Save Settings"}
        </button>
      </div>

      <Section title="Bot Identity">
        <Field label="Bot Name" sub="Display name shown in bot messages">
          <input
            value={settings.botName}
            onChange={(e) => set("botName", e.target.value)}
            style={InputStyle}
          />
        </Field>
        <Field
          label="Command Prefix"
          sub="Character used before commands (e.g., . / ! $)"
        >
          <input
            value={settings.prefix}
            onChange={(e) => set("prefix", e.target.value)}
            style={{
              ...InputStyle,
              width: "80px",
              minWidth: "80px",
              textAlign: "center",
            }}
            maxLength={2}
          />
        </Field>
        <Field
          label="Owner Number"
          sub="Your WhatsApp number with country code (no +)"
        >
          <input
            value={settings.ownerNumber}
            onChange={(e) => set("ownerNumber", e.target.value)}
            placeholder="2347001234567"
            style={InputStyle}
          />
        </Field>
        <Field
          label="Session Name"
          sub="Unique identifier for this bot session"
        >
          <input
            value={settings.sessionName}
            onChange={(e) => set("sessionName", e.target.value)}
            style={InputStyle}
          />
        </Field>
        <Field label="Timezone" sub="Server timezone for scheduled messages">
          <select
            value={settings.timezone}
            onChange={(e) => set("timezone", e.target.value)}
            style={{ ...InputStyle, cursor: "pointer" }}
          >
            {[
              "Africa/Lagos",
              "Africa/Nairobi",
              "Africa/Johannesburg",
              "America/New_York",
              "Europe/London",
              "Asia/Kolkata",
              "Asia/Jakarta",
            ].map((tz) => (
              <option key={tz} value={tz} style={{ background: "#0f0f1a" }}>
                {tz}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Footer Text" sub="Footer shown in bot messages">
          <input
            value={settings.footerText}
            onChange={(e) => set("footerText", e.target.value)}
            style={{ ...InputStyle, minWidth: "240px" }}
          />
        </Field>
      </Section>

      <Section title="WhatsApp Channel">
        <Field
          label="Channel Name"
          sub="Official VK911 MINI WhatsApp channel name"
        >
          <input
            value={settings.channelName}
            onChange={(e) => set("channelName", e.target.value)}
            style={InputStyle}
          />
        </Field>
        <Field
          label="Channel Link"
          sub="WhatsApp channel link shown in .menu and .channel command"
        >
          <input
            value={settings.channelLink}
            onChange={(e) => set("channelLink", e.target.value)}
            style={{ ...InputStyle, minWidth: "280px" }}
            placeholder="https://whatsapp.com/channel/xxx"
          />
        </Field>
      </Section>

      <Section title="Bot Mode & Access">
        <Field
          label="Public Mode"
          sub="Allow anyone to use the bot (not just owner/groups)"
        >
          <Toggle
            value={settings.publicMode}
            onChange={(v) => set("publicMode", v)}
          />
        </Field>
        <Field
          label="Self Bot Mode"
          sub="Bot only responds to the owner (private use)"
        >
          <Toggle
            value={settings.selfBot}
            onChange={(v) => set("selfBot", v)}
          />
        </Field>
        <Field label="Read Messages" sub="Mark messages as read when processed">
          <Toggle
            value={settings.readMessages}
            onChange={(v) => set("readMessages", v)}
          />
        </Field>
        <Field
          label="Read Status/Stories"
          sub="Auto-read WhatsApp status updates"
        >
          <Toggle
            value={settings.readStatus}
            onChange={(v) => set("readStatus", v)}
          />
        </Field>
        <Field label="Auto React" sub="Auto-react ✅ to successful commands">
          <Toggle
            value={settings.autoReact}
            onChange={(v) => set("autoReact", v)}
          />
        </Field>
      </Section>

      <Section title="Auto-Moderation">
        <Field label="Anti-Link" sub="Delete links posted in groups">
          <Toggle
            value={settings.antilink}
            onChange={(v) => set("antilink", v)}
          />
        </Field>
        <Field label="Anti-Spam" sub="Detect and remove spam messages">
          <Toggle
            value={settings.antispam}
            onChange={(v) => set("antispam", v)}
          />
        </Field>
        <Field label="Anti-Bot" sub="Block other bots from joining groups">
          <Toggle
            value={settings.antibot}
            onChange={(v) => set("antibot", v)}
          />
        </Field>
        <Field label="Anti-Toxic" sub="Auto-delete toxic/offensive messages">
          <Toggle
            value={settings.antitoxic}
            onChange={(v) => set("antitoxic", v)}
          />
        </Field>
        <Field
          label="Welcome Messages"
          sub="Send welcome message when members join"
        >
          <Toggle
            value={settings.welcomeMsg}
            onChange={(v) => set("welcomeMsg", v)}
          />
        </Field>
        <Field
          label="NSFW Commands"
          sub="Enable adult content commands (18+ groups only)"
        >
          <Toggle
            value={settings.nsfwEnabled}
            onChange={(v) => set("nsfwEnabled", v)}
          />
        </Field>
      </Section>

      <Section title="API Keys (Media & AI)">
        <div
          style={{
            marginBottom: "14px",
            padding: "12px 14px",
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.15)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#d97706",
          }}
        >
          ⚠ API keys are stored in the bot's .env file. Enter them here to save
          to the dashboard config (for reference).
        </div>
        {[
          {
            label: "OpenAI API Key",
            key: "gptApiKey",
            placeholder: "sk-proj-...",
          },
          {
            label: "Google Gemini Key",
            key: "geminiApiKey",
            placeholder: "AIza...",
          },
          {
            label: "DALL-E / OpenAI Image Key",
            key: "dalleApiKey",
            placeholder: "sk-proj-...",
          },
          {
            label: "Play/Media API Key",
            key: "playApiKey",
            placeholder: "Enter your media API key",
          },
        ].map(({ label, key, placeholder }) => (
          <Field key={key} label={label}>
            <input
              type="password"
              value={settings[key]}
              onChange={(e) => set(key, e.target.value)}
              placeholder={placeholder}
              style={{ ...InputStyle, minWidth: "280px" }}
            />
          </Field>
        ))}
        <Field
          label="Max File Size (MB)"
          sub="Maximum file size to process/download"
        >
          <input
            type="number"
            value={settings.maxFileSize}
            onChange={(e) => set("maxFileSize", e.target.value)}
            style={{ ...InputStyle, width: "100px", minWidth: "100px" }}
            min="10"
            max="500"
          />
        </Field>
        <Field
          label="Bot API Port"
          sub="HTTP port for the bot's internal API server"
        >
          <input
            type="number"
            value={settings.botApiPort}
            onChange={(e) => set("botApiPort", e.target.value)}
            style={{ ...InputStyle, width: "100px", minWidth: "100px" }}
          />
        </Field>
      </Section>
    </div>
  );
}
