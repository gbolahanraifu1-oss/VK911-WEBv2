"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  msg: "#00ff88",
  cmd: "#6366f1",
  session: "#22d3ee",
  error: "#ef4444",
};

export default function AnalyticsPage() {
  const [range, setRange] = useState("24h");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["analytics", range],
    queryFn: async () => {
      const res = await fetch(`/api/analytics?range=${range}`);
      if (!res.ok) throw new Error("Failed to load analytics");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const msgVolume = data?.messageVolume || defaultMsgData;
  const cmdUsage = data?.commandUsage || defaultCmdData;
  const sessionData = data?.sessions || defaultSessionData;
  const errorRate = data?.errorRate || defaultErrorData;

  return (
    <div style={{ padding: "32px", maxWidth: "1400px" }}>
      <div
        style={{
          marginBottom: "32px",
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
            ◈ Analytics
          </h1>
          <p style={{ color: "#475569", fontSize: "13px", margin: 0 }}>
            Real-time performance metrics & usage stats
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {["1h", "24h", "7d", "30d"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: "8px 16px",
                background:
                  range === r
                    ? "rgba(0,255,136,0.1)"
                    : "rgba(255,255,255,0.04)",
                border:
                  range === r
                    ? "1px solid rgba(0,255,136,0.3)"
                    : "1px solid rgba(255,255,255,0.06)",
                borderRadius: "8px",
                color: range === r ? "#00ff88" : "#64748b",
                fontSize: "12px",
                fontWeight: range === r ? "600" : "400",
                cursor: "pointer",
                fontFamily: "monospace",
              }}
            >
              {r}
            </button>
          ))}
          <button
            onClick={() => refetch()}
            style={{
              padding: "8px 14px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "8px",
              color: "#64748b",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            ↺
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "14px",
          marginBottom: "28px",
        }}
      >
        {[
          {
            label: "Messages",
            val: data?.totalMessages || "1,842",
            delta: "+12.4%",
            color: "#00ff88",
          },
          {
            label: "Commands",
            val: data?.totalCommands || "642",
            delta: "+8.1%",
            color: "#6366f1",
          },
          {
            label: "Sessions",
            val: data?.activeSessions || "3",
            delta: "+1",
            color: "#22d3ee",
          },
          {
            label: "Errors",
            val: data?.errors || "7",
            delta: "-3.2%",
            color: "#f59e0b",
            bad: false,
          },
          {
            label: "Avg Resp.",
            val: data?.avgResponse || "1.2s",
            delta: "-0.3s",
            color: "#ec4899",
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: "#0f0f1a",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              padding: "16px 18px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: `linear-gradient(90deg, ${item.color}, transparent)`,
              }}
            />
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
                fontSize: "24px",
                fontWeight: "800",
                color: "#f1f5f9",
                margin: "0 0 4px 0",
                fontFamily: "monospace",
              }}
            >
              {item.val}
            </p>
            <span style={{ fontSize: "11px", color: item.color }}>
              {item.delta}
            </span>
          </div>
        ))}
      </div>

      {/* Message Volume */}
      <div
        style={{
          background: "#0f0f1a",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "14px",
          padding: "24px",
          marginBottom: "20px",
        }}
      >
        <h3
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "#94a3b8",
            margin: "0 0 24px 0",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
          }}
        >
          ⬦ Message Volume
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={msgVolume}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff88" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
            />
            <XAxis dataKey="time" tick={{ fill: "#475569", fontSize: 10 }} />
            <YAxis tick={{ fill: "#475569", fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                background: "#1a1a2e",
                border: "1px solid rgba(0,255,136,0.2)",
                borderRadius: "8px",
                color: "#e2e8f0",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="messages"
              stroke="#00ff88"
              fill="url(#g1)"
              strokeWidth={2}
              name="Messages"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        {/* Command Usage */}
        <div
          style={{
            background: "#0f0f1a",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "14px",
            padding: "24px",
          }}
        >
          <h3
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#94a3b8",
              margin: "0 0 24px 0",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
            }}
          >
            ⬦ Command Usage
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cmdUsage}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis dataKey="time" tick={{ fill: "#475569", fontSize: 10 }} />
              <YAxis tick={{ fill: "#475569", fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: "#1a1a2e",
                  border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="count"
                fill="#6366f1"
                radius={[3, 3, 0, 0]}
                name="Commands"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Active Sessions */}
        <div
          style={{
            background: "#0f0f1a",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "14px",
            padding: "24px",
          }}
        >
          <h3
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#94a3b8",
              margin: "0 0 24px 0",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
            }}
          >
            ⬦ Active Sessions
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={sessionData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis dataKey="time" tick={{ fill: "#475569", fontSize: 10 }} />
              <YAxis tick={{ fill: "#475569", fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: "#1a1a2e",
                  border: "1px solid rgba(34,211,238,0.2)",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="sessions"
                stroke="#22d3ee"
                strokeWidth={2}
                dot={false}
                name="Sessions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Error Rate */}
      <div
        style={{
          background: "#0f0f1a",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "14px",
          padding: "24px",
          marginBottom: "20px",
        }}
      >
        <h3
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "#94a3b8",
            margin: "0 0 24px 0",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
          }}
        >
          ⬦ Error Rate vs Success Rate
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={errorRate}>
            <defs>
              <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
            />
            <XAxis dataKey="time" tick={{ fill: "#475569", fontSize: 10 }} />
            <YAxis tick={{ fill: "#475569", fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                background: "#1a1a2e",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#e2e8f0",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", color: "#64748b" }} />
            <Area
              type="monotone"
              dataKey="success"
              stroke="#22c55e"
              fill="url(#g2)"
              strokeWidth={2}
              name="Success"
            />
            <Area
              type="monotone"
              dataKey="errors"
              stroke="#ef4444"
              fill="url(#g3)"
              strokeWidth={2}
              name="Errors"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const times = Array.from(
  { length: 24 },
  (_, i) => `${String(i).padStart(2, "0")}:00`,
);
const defaultMsgData = times.map((time) => ({
  time,
  messages: Math.floor(Math.random() * 200 + 30),
}));
const defaultCmdData = times.map((time) => ({
  time,
  count: Math.floor(Math.random() * 80 + 5),
}));
const defaultSessionData = times.map((time) => ({
  time,
  sessions: Math.floor(Math.random() * 5 + 1),
}));
const defaultErrorData = times.map((time) => ({
  time,
  success: Math.floor(Math.random() * 180 + 50),
  errors: Math.floor(Math.random() * 10),
}));
