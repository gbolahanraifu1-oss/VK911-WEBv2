import { useState } from "react";

const socials = [
  { name: "TikTok", icon: "🎵", color: "#ff0050", handle: "@vk911_gaming", url: "https://tiktok.com/@vk911_gaming", desc: "Watch bot tutorials & gaming content" },
  { name: "WhatsApp Channel", icon: "💬", color: "#25d366", handle: "VK911 MINI Official", url: "https://whatsapp.com/channel/0029VaYpQHFHXotnpcTf3C3T", desc: "Bot updates, tips & announcements" },
  { name: "Instagram", icon: "📸", color: "#e1306c", handle: "@vk911_gaming", url: "https://instagram.com/vk911_gaming", desc: "Behind the scenes & updates" },
  { name: "YouTube", icon: "▶", color: "#ff0000", handle: "VK911 Gaming", url: "https://youtube.com/@vk911_gaming", desc: "Bot setup guides & tutorials" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setSent(true);
    } catch (err) {
      alert("Failed to send: " + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#f1f5f9", margin: "0 0 6px 0" }}>✉ Contact & Support</h1>
        <p style={{ color: "#475569", fontSize: "13px", margin: 0 }}>Get help or follow VK911 MINI on social media</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Contact Form */}
        <div style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "24px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 20px 0" }}>⬦ Send a Message</h3>

          {sent ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#22c55e", margin: "0 0 8px 0" }}>Message Sent!</h3>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 20px 0" }}>We'll get back to you within 24 hours.</p>
              <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                style={{ padding: "10px 20px", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: "8px", color: "#00ff88", fontSize: "13px", cursor: "pointer" }}>
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {[
                { label: "Your Name", key: "name", type: "text", placeholder: "John Doe" },
                { label: "Email", key: "email", type: "email", placeholder: "you@email.com" },
                { label: "Subject", key: "subject", type: "text", placeholder: "Bot pairing issue" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "7px" }}>{label}</label>
                  <input type={type} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} required
                    style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#e2e8f0", outline: "none", boxSizing: "border-box" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(0,255,136,0.4)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                  />
                </div>
              ))}
              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "7px" }}>Message</label>
                <textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Describe your issue or question..." required rows={4}
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#e2e8f0", outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(0,255,136,0.4)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>
              <button type="submit" disabled={sending}
                style={{ width: "100%", padding: "12px", background: sending ? "rgba(0,255,136,0.3)" : "linear-gradient(135deg, #00ff88, #06b6d4)", border: "none", borderRadius: "10px", color: "#080810", fontWeight: "700", fontSize: "13px", cursor: sending ? "not-allowed" : "pointer" }}>
                {sending ? "— Sending..." : "→ Send Message"}
              </button>
            </form>
          )}
        </div>

        {/* Socials */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "24px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 18px 0" }}>⬦ Follow VK911 MINI</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {socials.map((s) => (
                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", textDecoration: "none", transition: "border-color 0.15s" }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = `${s.color}40`)}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)")}
                >
                  <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>{s.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>{s.name}</div>
                    <div style={{ fontSize: "11px", color: s.color, fontFamily: "monospace" }}>{s.handle}</div>
                    <div style={{ fontSize: "11px", color: "#475569" }}>{s.desc}</div>
                  </div>
                  <span style={{ fontSize: "16px", color: "#334155" }}>→</span>
                </a>
              ))}
            </div>
          </div>

          {/* Direct WhatsApp support */}
          <div style={{ background: "rgba(37,211,102,0.06)", border: "1px solid rgba(37,211,102,0.2)", borderRadius: "16px", padding: "20px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: "700", color: "#25d366", margin: "0 0 8px 0" }}>💬 Direct WhatsApp Support</h3>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 14px 0", lineHeight: "1.6" }}>For urgent issues, contact the developer directly on WhatsApp.</p>
            <a href="https://wa.me/2347XXXXXXXXX" target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 18px", background: "rgba(37,211,102,0.15)", border: "1px solid rgba(37,211,102,0.3)", borderRadius: "8px", color: "#25d366", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
              💬 Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}