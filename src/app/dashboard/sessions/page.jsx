"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function SessionsPage() {
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState(null);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const res = await fetch("/api/sessions");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 10000,
  });

  const deleteMut = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/sessions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("vk911_token")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
      setConfirm(null);
    },
  });

  const statusColor = {
    connected: "#22c55e",
    disconnected: "#ef4444",
    connecting: "#f59e0b",
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1200px" }}>
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
            ◉ Sessions
          </h1>
          <p style={{ color: "#475569", fontSize: "13px", margin: 0 }}>
            Manage active bot session instances — isolated per device
          </p>
        </div>
        <a
          href="/dashboard/pairing"
          style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg, #00ff88, #06b6d4)",
            border: "none",
            borderRadius: "10px",
            color: "#080810",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          + New Session
        </a>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "14px",
          marginBottom: "28px",
        }}
      >
        {[
          { label: "Total Sessions", val: sessions.length, color: "#6366f1" },
          {
            label: "Connected",
            val: sessions.filter((s) => s.status === "connected").length,
            color: "#22c55e",
          },
          {
            label: "Disconnected",
            val: sessions.filter((s) => s.status === "disconnected").length,
            color: "#ef4444",
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: "#0f0f1a",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              padding: "16px 18px",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                margin: "0 0 8px 0",
              }}
            >
              {item.label}
            </p>
            <p
              style={{
                fontSize: "28px",
                fontWeight: "800",
                color: item.color,
                margin: 0,
                fontFamily: "monospace",
              }}
            >
              {item.val}
            </p>
          </div>
        ))}
      </div>

      {/* Sessions Table */}
      <div
        style={{
          background: "#0f0f1a",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              margin: 0,
            }}
          >
            ⬦ Active Sessions
          </h3>
          <button
            onClick={() => qc.invalidateQueries({ queryKey: ["sessions"] })}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "6px",
              padding: "6px 12px",
              color: "#64748b",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            ↺ Refresh
          </button>
        </div>

        {isLoading ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: "#334155",
              fontSize: "13px",
            }}
          >
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <p style={{ fontSize: "32px", marginBottom: "12px" }}>◉</p>
            <p
              style={{
                color: "#475569",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              No sessions found
            </p>
            <p style={{ color: "#334155", fontSize: "12px" }}>
              Link your WhatsApp via the Web Pairing page
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  {[
                    "Session ID",
                    "Phone Number",
                    "Status",
                    "Last Active",
                    "Created",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "13px 18px",
                        textAlign: "left",
                        fontSize: "10px",
                        fontWeight: "700",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map((s, i) => {
                  const color = statusColor[s.status] || "#64748b";
                  return (
                    <tr
                      key={s.id || i}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.03)",
                      }}
                    >
                      <td
                        style={{
                          padding: "14px 18px",
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "12px",
                          color: "#e2e8f0",
                        }}
                      >
                        {s.session_id || `session-${i + 1}`}
                      </td>
                      <td
                        style={{
                          padding: "14px 18px",
                          fontFamily: "monospace",
                          fontSize: "12px",
                          color: "#94a3b8",
                        }}
                      >
                        {s.phone_number || "—"}
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 10px",
                            borderRadius: "99px",
                            fontSize: "11px",
                            fontWeight: "600",
                            background: `${color}15`,
                            color,
                            border: `1px solid ${color}30`,
                          }}
                        >
                          <span
                            style={{
                              width: "5px",
                              height: "5px",
                              borderRadius: "50%",
                              background: "currentColor",
                              display:
                                s.status === "connected" ? "block" : "none",
                            }}
                          />
                          {s.status || "unknown"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "14px 18px",
                          fontSize: "12px",
                          color: "#64748b",
                        }}
                      >
                        {s.last_active
                          ? new Date(s.last_active).toLocaleString()
                          : "—"}
                      </td>
                      <td
                        style={{
                          padding: "14px 18px",
                          fontSize: "12px",
                          color: "#64748b",
                        }}
                      >
                        {s.created_at
                          ? new Date(s.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <button
                          onClick={() => setConfirm(s.id || i)}
                          style={{
                            padding: "6px 12px",
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            borderRadius: "6px",
                            color: "#ef4444",
                            fontSize: "11px",
                            cursor: "pointer",
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {confirm !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#0f0f1a",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "16px",
              padding: "28px",
              width: "360px",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#f1f5f9",
                margin: "0 0 8px 0",
              }}
            >
              Remove Session?
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                margin: "0 0 24px 0",
              }}
            >
              This will disconnect the bot from WhatsApp. You'll need to re-pair
              to reconnect.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setConfirm(null)}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMut.mutate(confirm)}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "8px",
                  color: "#ef4444",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                {deleteMut.isLoading ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
