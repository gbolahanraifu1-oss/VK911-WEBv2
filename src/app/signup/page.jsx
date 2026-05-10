import { useState, useEffect } from "react";

export default function SignupPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("vk911_token") : null;
    if (token) window.location.href = "/user";
    setParticles(Array.from({ length: 30 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 2 + 1, speed: Math.random() * 20 + 10,
    })));
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) return setError("Passwords do not match");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      localStorage.setItem("vk911_token", data.token);
      localStorage.setItem("vk911_user", JSON.stringify(data.user));
      window.location.href = "/user";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 80% 50%, #0d1220 0%, #080810 50%, #0a0518 100%)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes float-0{0%,100%{transform:translateY(0)}50%{transform:translateY(-25px)}}
        @keyframes float-1{0%,100%{transform:translateY(0)}50%{transform:translateY(20px)}}
        @keyframes float-2{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}
        *{box-sizing:border-box}
      `}</style>

      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {particles.map((p) => (
          <div key={p.id} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, width: `${p.size}px`, height: `${p.size}px`, borderRadius: "50%", background: p.id % 3 === 0 ? "#6366f1" : p.id % 3 === 1 ? "#00ff88" : "#22d3ee", opacity: 0.1, animation: `float-${p.id % 3} ${p.speed}s infinite linear` }} />
        ))}
      </div>

      <div style={{ width: "100%", maxWidth: "420px", padding: "0 20px", zIndex: 10 }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "64px", height: "64px", borderRadius: "18px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", marginBottom: "16px", boxShadow: "0 0 40px rgba(99,102,241,0.4)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345z"/>
            </svg>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 4px 0" }}>VK911 XMD</h1>
          <p style={{ color: "#475569", fontSize: "13px", margin: 0, fontFamily: "monospace" }}>Create your account</p>
        </div>

        <div style={{ background: "rgba(15,15,26,0.95)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: "20px", padding: "32px", backdropFilter: "blur(20px)", boxShadow: "0 0 60px rgba(0,0,0,0.5)" }}>
          <h2 style={{ fontSize: "17px", fontWeight: "700", color: "#f1f5f9", margin: "0 0 4px 0" }}>Sign Up</h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 24px 0" }}>Get your own WhatsApp bot session</p>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "11px 14px", marginBottom: "18px", fontSize: "13px", color: "#f87171" }}>⚠ {error}</div>
          )}

          <form onSubmit={handleSignup}>
            {[
              { label: "Username", key: "username", type: "text", placeholder: "yourname" },
              { label: "Email (optional)", key: "email", type: "email", placeholder: "you@email.com" },
              { label: "Password", key: "password", type: "password", placeholder: "••••••••" },
              { label: "Confirm Password", key: "confirm", type: "password", placeholder: "••••••••" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "7px" }}>{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  required={key !== "email"}
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "11px 14px", fontSize: "14px", color: "#e2e8f0", outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>
            ))}

            <button type="submit" disabled={loading} style={{ width: "100%", padding: "13px", marginTop: "8px", background: loading ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", color: "#fff", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 0 20px rgba(99,102,241,0.4)" }}>
              {loading ? "— Creating account..." : "→ Create Account"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#475569", marginTop: "20px", marginBottom: 0 }}>
            Already have an account?{" "}
            <a href="/" style={{ color: "#6366f1", textDecoration: "none", fontWeight: "600" }}>Sign In</a>
          </p>
        </div>
      </div>
    </div>
  );
}