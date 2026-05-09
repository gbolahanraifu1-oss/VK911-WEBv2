"use client";
import { useState, useEffect, useRef } from "react";

const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "10px 22px",
      background: active ? "rgba(0,255,136,0.1)" : "transparent",
      border: active
        ? "1px solid rgba(0,255,136,0.3)"
        : "1px solid transparent",
      borderRadius: "8px",
      color: active ? "#00ff88" : "#64748b",
      fontSize: "13px",
      fontWeight: active ? "600" : "400",
      cursor: "pointer",
      transition: "all 0.15s",
    }}
  >
    {label}
  </button>
);

export default function PairingPage() {
  const [method, setMethod] = useState("qr");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [pairingCode, setPairingCode] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | connected | error
  const [logs, setLogs] = useState([]);
  const [botUrl, setBotUrl] = useState("http://localhost:3001");
  const [error, setError] = useState("");
  const pollRef = useRef(null);

  const addLog = (msg, type = "info") =>
    setLogs((l) => [
      { msg, type, time: new Date().toLocaleTimeString() },
      ...l.slice(0, 19),
    ]);

  const requestPairingCode = async () => {
    if (!phone) {
      setError("Enter your WhatsApp number");
      return;
    }
    setError("");
    setStatus("loading");
    setPairingCode("");
    addLog(`Requesting pairing code for ${countryCode}${phone}...`, "info");
    try {
      const res = await fetch(`${botUrl}/api/pair/code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: `${countryCode}${phone}`.replace(/\D/g, ""),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get pairing code");
      setPairingCode(data.code);
      setStatus("awaiting");
      addLog(`Pairing code generated: ${data.code}`, "success");
      startPollStatus();
    } catch (err) {
      setError(
        `Bot server error: ${err.message}. Make sure bot is running at ${botUrl}`,
      );
      setStatus("error");
      addLog(err.message, "error");
      console.error(err);
    }
  };

  const requestQR = async () => {
    setStatus("loading");
    setQrCode("");
    addLog("Requesting QR code from bot server...", "info");
    try {
      const res = await fetch(`${botUrl}/api/pair/qr`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setQrCode(data.qr);
      setStatus("awaiting");
      addLog("QR Code received — scan with WhatsApp", "success");
      startPollStatus();
    } catch (err) {
      setError(`Cannot reach bot at ${botUrl}. Start the bot first.`);
      setStatus("error");
      addLog(err.message, "error");
      console.error(err);
    }
  };

  const startPollStatus = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${botUrl}/api/status`);
        const data = await res.json();
        if (data.connected) {
          setStatus("connected");
          addLog("✓ Bot successfully connected to WhatsApp!", "success");
          clearInterval(pollRef.current);
        }
      } catch (_) {}
    }, 3000);
  };

  useEffect(
    () => () => {
      if (pollRef.current) clearInterval(pollRef.current);
    },
    [],
  );

  const stepsBotUrl = [
    "Deploy the bot to your VPS/server",
    "Run: npm install && npm start (inside bot/ folder)",
    "Note the bot API port (default: 3001)",
    "Enter the URL below and connect",
  ];
  const stepsQR = [
    "Open WhatsApp on your phone",
    "Tap ⋮ Menu → Linked Devices",
    'Tap "Link a Device"',
    "Scan the QR code shown here",
  ];
  const stepsCode = [
    "Open WhatsApp on your phone",
    "Tap ⋮ Menu → Linked Devices",
    'Tap "Link a Device" → "Link with phone number"',
    "Enter the 8-character code shown below",
  ];

  return (
    <div style={{ padding: "32px", maxWidth: "1100px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: "800",
            color: "#f1f5f9",
            margin: "0 0 6px 0",
          }}
        >
          ⟳ Web Pairing
        </h1>
        <p style={{ color: "#475569", fontSize: "13px", margin: 0 }}>
          Connect your WhatsApp account to VK911 XMD bot
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: "24px",
        }}
      >
        {/* Left - Main panel */}
        <div>
          {/* Bot URL */}
          <div
            style={{
              background: "#0f0f1a",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "14px",
              padding: "22px",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                margin: "0 0 14px 0",
              }}
            >
              ⬦ Bot Server URL
            </h3>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                value={botUrl}
                onChange={(e) => setBotUrl(e.target.value)}
                placeholder="http://your-vps-ip:3001"
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  color: "#e2e8f0",
                  outline: "none",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "rgba(0,255,136,0.4)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.08)")
                }
              />
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background:
                    status === "connected"
                      ? "rgba(34,197,94,0.1)"
                      : status === "error"
                        ? "rgba(239,68,68,0.1)"
                        : "rgba(255,255,255,0.04)",
                  border: `1px solid ${status === "connected" ? "rgba(34,197,94,0.3)" : status === "error" ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.06)"}`,
                  fontSize: "11px",
                  fontWeight: "600",
                  color:
                    status === "connected"
                      ? "#22c55e"
                      : status === "error"
                        ? "#ef4444"
                        : "#64748b",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "currentColor",
                    display: "inline-block",
                  }}
                />
                {status === "connected"
                  ? "Connected"
                  : status === "error"
                    ? "Error"
                    : status === "loading"
                      ? "Connecting..."
                      : status === "awaiting"
                        ? "Awaiting Scan"
                        : "Offline"}
              </div>
            </div>
            {/* Setup steps */}
            <div
              style={{
                marginTop: "14px",
                padding: "12px",
                background: "rgba(0,0,0,0.3)",
                borderRadius: "8px",
              }}
            >
              <p
                style={{
                  fontSize: "10px",
                  color: "#334155",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  margin: "0 0 8px 0",
                }}
              >
                Setup Steps
              </p>
              {stepsBotUrl.map((s, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    margin: "0 0 4px 0",
                    fontFamily: "monospace",
                  }}
                >
                  {i + 1}. {s}
                </p>
              ))}
            </div>
          </div>

          {/* Method Tabs */}
          <div
            style={{
              background: "#0f0f1a",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "14px",
              padding: "22px",
            }}
          >
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
              <Tab
                label="📱 QR Code"
                active={method === "qr"}
                onClick={() => {
                  setMethod("qr");
                  setStatus("idle");
                  setPairingCode("");
                  setError("");
                }}
              />
              <Tab
                label="# Pairing Code"
                active={method === "code"}
                onClick={() => {
                  setMethod("code");
                  setStatus("idle");
                  setQrCode("");
                  setError("");
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  marginBottom: "16px",
                  fontSize: "12px",
                  color: "#f87171",
                }}
              >
                ⚠ {error}
              </div>
            )}

            {method === "qr" && (
              <div>
                {/* Steps */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginBottom: "20px",
                  }}
                >
                  {stepsQR.map((s, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          background: "rgba(0,255,136,0.1)",
                          border: "1px solid rgba(0,255,136,0.25)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          fontWeight: "700",
                          color: "#00ff88",
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span style={{ fontSize: "13px", color: "#94a3b8" }}>
                        {s}
                      </span>
                    </div>
                  ))}
                </div>

                {/* QR Display */}
                <div
                  style={{
                    width: "200px",
                    height: "200px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    margin: "0 auto 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {qrCode ? (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrCode)}&bgcolor=0f0f1a&color=00ff88`}
                      alt="QR Code"
                      style={{
                        width: "180px",
                        height: "180px",
                        borderRadius: "8px",
                      }}
                    />
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: "40px",
                          marginBottom: "8px",
                          opacity: 0.3,
                        }}
                      >
                        ⬡
                      </div>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#334155",
                          margin: 0,
                        }}
                      >
                        QR appears here
                      </p>
                    </div>
                  )}
                  {status === "loading" && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(8,8,16,0.8)",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        color: "#00ff88",
                        animation: "pulse 1.5s infinite",
                      }}
                    >
                      Loading...
                    </div>
                  )}
                </div>

                <button
                  onClick={requestQR}
                  disabled={status === "loading" || status === "connected"}
                  style={{
                    width: "100%",
                    padding: "13px",
                    background:
                      status === "connected"
                        ? "rgba(34,197,94,0.2)"
                        : "linear-gradient(135deg, #00ff88, #06b6d4)",
                    border: "none",
                    borderRadius: "10px",
                    color: status === "connected" ? "#22c55e" : "#080810",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    opacity: status === "loading" ? 0.6 : 1,
                  }}
                >
                  {status === "connected"
                    ? "✓ Connected"
                    : status === "loading"
                      ? "— Generating QR..."
                      : "→ Generate QR Code"}
                </button>
              </div>
            )}

            {method === "code" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginBottom: "20px",
                  }}
                >
                  {stepsCode.map((s, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          background: "rgba(99,102,241,0.1)",
                          border: "1px solid rgba(99,102,241,0.25)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          fontWeight: "700",
                          color: "#6366f1",
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span style={{ fontSize: "13px", color: "#94a3b8" }}>
                        {s}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Phone Input */}
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      marginBottom: "8px",
                    }}
                  >
                    WhatsApp Phone Number
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                        padding: "11px 10px",
                        fontSize: "13px",
                        color: "#e2e8f0",
                        outline: "none",
                        fontFamily: "'JetBrains Mono', monospace",
                        flexShrink: 0,
                      }}
                    >
                      {countryCodes.map((c) => (
                        <option
                          key={c.code}
                          value={c.code}
                          style={{ background: "#0f0f1a" }}
                        >
                          {c.code} {c.country}
                        </option>
                      ))}
                    </select>
                    <input
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="7001234567"
                      type="tel"
                      style={{
                        flex: 1,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                        padding: "11px 14px",
                        fontSize: "14px",
                        color: "#e2e8f0",
                        outline: "none",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "rgba(99,102,241,0.5)")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = "rgba(255,255,255,0.08)")
                      }
                    />
                  </div>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#334155",
                      margin: "6px 0 0 0",
                    }}
                  >
                    Include country code without leading 0. Example: 7001234567
                    for Nigeria (+234)
                  </p>
                </div>

                {/* Pairing Code Display */}
                {pairingCode && (
                  <div
                    style={{
                      marginBottom: "16px",
                      padding: "20px",
                      background: "rgba(99,102,241,0.08)",
                      border: "1px solid rgba(99,102,241,0.25)",
                      borderRadius: "12px",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#6366f1",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        margin: "0 0 12px 0",
                      }}
                    >
                      Your Pairing Code
                    </p>
                    <div
                      style={{
                        fontSize: "36px",
                        fontWeight: "800",
                        letterSpacing: "8px",
                        color: "#e2e8f0",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {pairingCode}
                    </div>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#475569",
                        margin: "12px 0 0 0",
                      }}
                    >
                      Enter this code in WhatsApp → Linked Devices → Link with
                      phone number
                    </p>
                  </div>
                )}

                <button
                  onClick={requestPairingCode}
                  disabled={status === "loading" || status === "connected"}
                  style={{
                    width: "100%",
                    padding: "13px",
                    background:
                      status === "connected"
                        ? "rgba(34,197,94,0.2)"
                        : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    border: "none",
                    borderRadius: "10px",
                    color: status === "connected" ? "#22c55e" : "#fff",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    opacity: status === "loading" ? 0.6 : 1,
                  }}
                >
                  {status === "connected"
                    ? "✓ Connected"
                    : status === "loading"
                      ? "— Generating Code..."
                      : "→ Generate Pairing Code"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right - Logs & Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Status */}
          <div
            style={{
              background: "#0f0f1a",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "14px",
              padding: "22px",
            }}
          >
            <h3
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                margin: "0 0 16px 0",
              }}
            >
              ⬦ Connection Status
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {[
                {
                  label: "Bot Server",
                  val:
                    status !== "idle" && status !== "error"
                      ? "Reachable"
                      : "Not checked",
                  ok: status !== "idle" && status !== "error",
                },
                {
                  label: "WhatsApp Link",
                  val: status === "connected" ? "Linked" : "Pending",
                  ok: status === "connected",
                },
                {
                  label: "Session",
                  val: status === "connected" ? "Active" : "None",
                  ok: status === "connected",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "#64748b" }}>
                    {item.label}
                  </span>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "99px",
                      fontSize: "11px",
                      fontWeight: "600",
                      background: item.ok
                        ? "rgba(34,197,94,0.1)"
                        : "rgba(100,116,139,0.1)",
                      color: item.ok ? "#22c55e" : "#475569",
                      border: `1px solid ${item.ok ? "rgba(34,197,94,0.3)" : "rgba(100,116,139,0.2)"}`,
                    }}
                  >
                    {item.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Logs */}
          <div
            style={{
              background: "#0f0f1a",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "14px",
              padding: "22px",
              flex: 1,
            }}
          >
            <h3
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                margin: "0 0 14px 0",
              }}
            >
              ⬦ Pairing Logs
            </h3>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
                maxHeight: "260px",
                overflowY: "auto",
              }}
            >
              {logs.length === 0 && (
                <p style={{ color: "#334155", fontSize: "12px" }}>
                  — No events yet
                </p>
              )}
              {logs.map((log, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: "8px",
                    paddingBottom: "8px",
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                  }}
                >
                  <span style={{ color: "#334155" }}>{log.time} </span>
                  <span
                    style={{
                      color:
                        log.type === "success"
                          ? "#22c55e"
                          : log.type === "error"
                            ? "#ef4444"
                            : "#6366f1",
                    }}
                  >
                    [{log.type}]{" "}
                  </span>
                  <span style={{ color: "#64748b" }}>{log.msg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <div
            style={{
              background: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: "14px",
              padding: "16px 18px",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "#d97706",
                margin: "0 0 8px 0",
                fontWeight: "600",
              }}
            >
              ⚠ Important Note
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "#92400e",
                margin: 0,
                lineHeight: "1.6",
              }}
            >
              This dashboard connects to your self-hosted bot API. The bot must
              be running on your VPS/server before pairing. Each session is
              isolated and stored securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const countryCodes = [
  { code: "+1", country: "US/CA" },
  { code: "+234", country: "NG" },
  { code: "+254", country: "KE" },
  { code: "+27", country: "ZA" },
  { code: "+233", country: "GH" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "IN" },
  { code: "+1242", country: "BS" },
  { code: "+63", country: "PH" },
  { code: "+62", country: "ID" },
  { code: "+55", country: "BR" },
  { code: "+49", country: "DE" },
  { code: "+33", country: "FR" },
  { code: "+92", country: "PK" },
  { code: "+880", country: "BD" },
  { code: "+20", country: "EG" },
  { code: "+213", country: "DZ" },
  { code: "+212", country: "MA" },
];
