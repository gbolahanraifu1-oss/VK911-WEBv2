import { useState, useEffect } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("vk911_token") : null;
    if (token) {
      const user = JSON.parse(localStorage.getItem("vk911_user") || "{}");
      window.location.href = user.role === "admin" ? "/dashboard" : "/user";
    }
    setParticles(Array.from({ length: 40 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 2 + 1, speed: Math.random() * 20 + 10,
    })));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("vk911_token", data.token);
      localStorage.setItem("vk911_user", JSON.stringify(data.user));
      window.location.href = data.user.role === "admin" ? "/dashboard" : "/user";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 20% 50%, #0d1f12 0%, #080810 50%, #0a0518 100%)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes float-0{0%,100%{transform:translateY(0) translateX(0)}50%{transform:translateY(-30px) translateX(15px)}}
        @keyframes float-1{0%,100%{transform:translateY(0) translateX(0)}50%{transform:translateY(20px) translateX(-20px)}}
        @keyframes float-2{0%,100%{transform:translateY(0) translateX(0)}50%{transform:translateY(-20px) translateX(-10px)}}
        @keyframes float-3{0%,100%{transform:translateY(0) translateX(0)}50%{transform:translateY(25px) translateX(25px)}}
        @keyframes float-4{0%,100%{transform:translateY(0) translateX(0)}50%{transform:translateY(-15px) translateX(20px)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:#0a0a15}
        ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:3px}
      `}</style>

      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {particles.map((p) => (
          <div key={p.id} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, width: `${p.size}px`, height: `${p.size}px`, borderRadius: "50%", background: p.id % 3 === 0 ? "#00ff88" : p.id % 3 === 1 ? "#6366f1" : "#22d3ee", opacity: 0.12, animation: `float-${p.id % 5} ${p.speed}s infinite linear` }} />
        ))}
      </div>

      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "420px", padding: "0 20px", zIndex: 10 }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "72px", height: "72px", borderRadius: "20px", background: "linear-gradient(135deg, #00ff88, #06b6d4)", marginBottom: "20px", boxShadow: "0 0 40px rgba(0,255,136,0.3)" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
              <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345z"/>
            </svg>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", background: "linear-gradient(135deg, #00ff88, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 4px 0" }}>VK911 MINI</h1>
          <p style={{ color: "#475569", fontSize: "13px", margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>v2.0.3 — Admin Console</p>
        </div>

        <div style={{ background: "rgba(15,15,26,0.95)", border: "1px solid rgba(0,255,136,0.15)", borderRadius: "20px", padding: "36px", backdropFilter: "blur(20px)", boxShadow: "0 0 60px rgba(0,0,0,0.5)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#f1f5f9", margin: "0 0 6px 0" }}>Sign In</h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 28px 0" }}>Access your bot management panel</p>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#f87171" }}>⚠ {error}</div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>Username</label>
              <input type="text" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} placeholder="admin" required
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px 16px", fontSize: "14px", color: "#e2e8f0", outline: "none", boxSizing: "border-box" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(0,255,136,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>
            <div style={{ marginBottom: "28px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" required
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px 16px", fontSize: "14px", color: "#e2e8f0", outline: "none", boxSizing: "border-box" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(0,255,136,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", background: loading ? "rgba(0,255,136,0.3)" : "linear-gradient(135deg, #00ff88, #06b6d4)", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", color: "#080810", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 0 20px rgba(0,255,136,0.3)" }}>
              {loading ? "— Authenticating..." : "→ Access Dashboard"}
            </button>
          </form>

          <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "#475569", margin: 0 }}>
              New here?{" "}
              <a href="/signup" style={{ color: "#00ff88", textDecoration: "none", fontWeight: "600" }}>Create account →</a>
            </p>
          </div>

          <p style={{ textAlign: "center", fontSize: "11px", color: "#334155", marginTop: "16px", marginBottom: 0 }}>
            © powered by VK911 TECH — VK911 MINI v2.0.3
          </p>
        </div>
      </div>
    </div>
  );
}