"use client";
import { useState, useMemo } from "react";

const CATEGORIES = [
  "All",
  "Admin",
  "Group",
  "Media",
  "Downloader",
  "Fun",
  "AI",
  "Utility",
  "Info",
  "NSFW",
];
const CATEGORY_COLORS = {
  Admin: "#ef4444",
  Group: "#f59e0b",
  Media: "#22d3ee",
  Downloader: "#6366f1",
  Fun: "#ec4899",
  AI: "#00ff88",
  Utility: "#8b5cf6",
  Info: "#64748b",
  NSFW: "#f97316",
  Default: "#334155",
};

export default function CommandsPage() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const PER_PAGE = 20;

  const filtered = useMemo(() => {
    let list = COMMANDS;
    if (cat !== "All") list = list.filter((c) => c.category === cat);
    if (search.trim())
      list = list.filter(
        (c) =>
          c.cmd.toLowerCase().includes(search.toLowerCase()) ||
          c.desc.toLowerCase().includes(search.toLowerCase()),
      );
    return list;
  }, [search, cat]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const catCounts = useMemo(() => {
    const counts = {};
    COMMANDS.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div style={{ padding: "32px", maxWidth: "1400px" }}>
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
            ⌘ Command Library
          </h1>
          <p style={{ color: "#475569", fontSize: "13px", margin: 0 }}>
            <span style={{ color: "#00ff88", fontWeight: "700" }}>
              {COMMANDS.length}
            </span>{" "}
            commands across {CATEGORIES.length - 1} categories — Plugin-based
            architecture
          </p>
        </div>
        <div
          style={{
            padding: "8px 16px",
            background: "rgba(0,255,136,0.08)",
            border: "1px solid rgba(0,255,136,0.2)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#00ff88",
            fontFamily: "monospace",
          }}
        >
          VK911 MINI v2.0.3 — 200+ CMDS
        </div>
      </div>

      {/* Category Filter */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        {CATEGORIES.map((c) => {
          const count = c === "All" ? COMMANDS.length : catCounts[c] || 0;
          const color = CATEGORY_COLORS[c] || CATEGORY_COLORS.Default;
          const active = cat === c;
          return (
            <button
              key={c}
              onClick={() => {
                setCat(c);
                setPage(1);
              }}
              style={{
                padding: "7px 14px",
                background: active ? `${color}18` : "rgba(255,255,255,0.03)",
                border: active
                  ? `1px solid ${color}55`
                  : "1px solid rgba(255,255,255,0.06)",
                borderRadius: "99px",
                color: active ? color : "#64748b",
                fontSize: "12px",
                fontWeight: active ? "600" : "400",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {c}{" "}
              <span style={{ fontSize: "10px", opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <span
          style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#334155",
            fontSize: "14px",
          }}
        >
          ⌕
        </span>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search commands, descriptions..."
          style={{
            width: "100%",
            background: "#0f0f1a",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "10px",
            padding: "12px 14px 12px 40px",
            fontSize: "13px",
            color: "#e2e8f0",
            outline: "none",
            boxSizing: "border-box",
          }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(0,255,136,0.3)")}
          onBlur={(e) =>
            (e.target.style.borderColor = "rgba(255,255,255,0.06)")
          }
        />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setPage(1);
            }}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: "#475569",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            ✕
          </button>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: selected ? "1fr 320px" : "1fr",
          gap: "20px",
        }}
      >
        {/* Table */}
        <div
          style={{
            background: "#0f0f1a",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  {[
                    "Command",
                    "Category",
                    "Description",
                    "Usage",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "14px 18px",
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
                {paged.map((cmd, i) => {
                  const color =
                    CATEGORY_COLORS[cmd.category] || CATEGORY_COLORS.Default;
                  const isSelected = selected?.cmd === cmd.cmd;
                  return (
                    <tr
                      key={i}
                      onClick={() => setSelected(isSelected ? null : cmd)}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.03)",
                        cursor: "pointer",
                        background: isSelected
                          ? "rgba(0,255,136,0.05)"
                          : "transparent",
                        transition: "background 0.1s",
                      }}
                      onMouseOver={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background =
                            "rgba(255,255,255,0.02)";
                      }}
                      onMouseOut={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <td
                        style={{
                          padding: "13px 18px",
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#00ff88",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cmd.cmd}
                      </td>
                      <td style={{ padding: "13px 18px" }}>
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: "99px",
                            fontSize: "10px",
                            fontWeight: "600",
                            background: `${color}15`,
                            color,
                            border: `1px solid ${color}30`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {cmd.category}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "13px 18px",
                          fontSize: "12px",
                          color: "#94a3b8",
                          maxWidth: "280px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cmd.desc}
                      </td>
                      <td
                        style={{
                          padding: "13px 18px",
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "11px",
                          color: "#475569",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cmd.usage}
                      </td>
                      <td style={{ padding: "13px 18px" }}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: "600",
                            background: "rgba(34,197,94,0.1)",
                            color: "#22c55e",
                            border: "1px solid rgba(34,197,94,0.2)",
                          }}
                        >
                          ● ON
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              borderTop: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <span style={{ fontSize: "12px", color: "#475569" }}>
              Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–
              {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}{" "}
              commands
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: "6px 12px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "6px",
                  color: page === 1 ? "#334155" : "#94a3b8",
                  cursor: page === 1 ? "not-allowed" : "pointer",
                  fontSize: "12px",
                }}
              >
                ‹ Prev
              </button>
              <span
                style={{
                  padding: "6px 12px",
                  background: "rgba(0,255,136,0.08)",
                  border: "1px solid rgba(0,255,136,0.2)",
                  borderRadius: "6px",
                  color: "#00ff88",
                  fontSize: "12px",
                  fontFamily: "monospace",
                }}
              >
                {page}/{totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: "6px 12px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "6px",
                  color: page === totalPages ? "#334155" : "#94a3b8",
                  cursor: page === totalPages ? "not-allowed" : "pointer",
                  fontSize: "12px",
                }}
              >
                Next ›
              </button>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div
            style={{
              background: "#0f0f1a",
              border: "1px solid rgba(0,255,136,0.15)",
              borderRadius: "14px",
              padding: "22px",
              height: "fit-content",
              position: "sticky",
              top: "20px",
            }}
          >
            <button
              onClick={() => setSelected(null)}
              style={{
                float: "right",
                background: "none",
                border: "none",
                color: "#475569",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              ✕
            </button>
            <p
              style={{
                fontSize: "10px",
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                margin: "0 0 10px 0",
              }}
            >
              Command Detail
            </p>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "800",
                color: "#00ff88",
                fontFamily: "monospace",
                margin: "0 0 6px 0",
              }}
            >
              {selected.cmd}
            </h2>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: "99px",
                fontSize: "11px",
                fontWeight: "600",
                background: `${CATEGORY_COLORS[selected.category] || "#334155"}15`,
                color: CATEGORY_COLORS[selected.category] || "#64748b",
                border: `1px solid ${CATEGORY_COLORS[selected.category] || "#334155"}30`,
              }}
            >
              {selected.category}
            </span>
            <p
              style={{
                fontSize: "13px",
                color: "#94a3b8",
                margin: "16px 0",
                lineHeight: "1.6",
              }}
            >
              {selected.desc}
            </p>
            <div style={{ marginBottom: "14px" }}>
              <p
                style={{
                  fontSize: "10px",
                  color: "#334155",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  margin: "0 0 6px 0",
                }}
              >
                Usage
              </p>
              <code
                style={{
                  display: "block",
                  padding: "10px 12px",
                  background: "rgba(0,0,0,0.4)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#22d3ee",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {selected.usage}
              </code>
            </div>
            <div>
              <p
                style={{
                  fontSize: "10px",
                  color: "#334155",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  margin: "0 0 6px 0",
                }}
              >
                Example
              </p>
              <code
                style={{
                  display: "block",
                  padding: "10px 12px",
                  background: "rgba(0,0,0,0.4)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#f1f5f9",
                  fontFamily: "'JetBrains Mono', monospace",
                  lineHeight: 1.6,
                }}
              >
                {selected.example}
              </code>
            </div>
            <div
              style={{
                marginTop: "14px",
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: "99px",
                  fontSize: "11px",
                  background: "rgba(34,197,94,0.1)",
                  color: "#22c55e",
                  border: "1px solid rgba(34,197,94,0.2)",
                }}
              >
                ● Enabled
              </span>
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: "99px",
                  fontSize: "11px",
                  background: "rgba(255,255,255,0.05)",
                  color: "#64748b",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {selected.access || "All Users"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const COMMANDS = [
  // ─── ADMIN (30) ───
  {
    cmd: ".ban",
    category: "Admin",
    desc: "Ban a user from the group permanently",
    usage: ".ban @user",
    example: ".ban @2347001234567",
    access: "Admin Only",
  },
  {
    cmd: ".unban",
    category: "Admin",
    desc: "Unban a previously banned user",
    usage: ".unban @user",
    example: ".unban @2347001234567",
    access: "Admin Only",
  },
  {
    cmd: ".kick",
    category: "Admin",
    desc: "Remove a user from the group",
    usage: ".kick @user",
    example: ".kick @2347001234567",
    access: "Admin Only",
  },
  {
    cmd: ".add",
    category: "Admin",
    desc: "Add a user to the group",
    usage: ".add [number]",
    example: ".add 2347001234567",
    access: "Admin Only",
  },
  {
    cmd: ".promote",
    category: "Admin",
    desc: "Promote user to group admin",
    usage: ".promote @user",
    example: ".promote @2347001234567",
    access: "Admin Only",
  },
  {
    cmd: ".demote",
    category: "Admin",
    desc: "Demote admin to regular member",
    usage: ".demote @user",
    example: ".demote @2347001234567",
    access: "Admin Only",
  },
  {
    cmd: ".antilink",
    category: "Admin",
    desc: "Toggle anti-link protection (delete links posted)",
    usage: ".antilink on/off",
    example: ".antilink on",
    access: "Admin Only",
  },
  {
    cmd: ".antispam",
    category: "Admin",
    desc: "Toggle anti-spam filter for the group",
    usage: ".antispam on/off",
    example: ".antispam on",
    access: "Admin Only",
  },
  {
    cmd: ".antibot",
    category: "Admin",
    desc: "Block other bots from joining the group",
    usage: ".antibot on/off",
    example: ".antibot on",
    access: "Admin Only",
  },
  {
    cmd: ".antitoxic",
    category: "Admin",
    desc: "Auto-delete toxic/offensive messages",
    usage: ".antitoxic on/off",
    example: ".antitoxic on",
    access: "Admin Only",
  },
  {
    cmd: ".warn",
    category: "Admin",
    desc: "Warn a user. Auto-kick after 3 warnings",
    usage: ".warn @user [reason]",
    example: ".warn @user Spamming",
    access: "Admin Only",
  },
  {
    cmd: ".warncount",
    category: "Admin",
    desc: "Check how many warnings a user has",
    usage: ".warncount @user",
    example: ".warncount @user",
    access: "Admin Only",
  },
  {
    cmd: ".clearwarn",
    category: "Admin",
    desc: "Clear all warnings for a user",
    usage: ".clearwarn @user",
    example: ".clearwarn @user",
    access: "Admin Only",
  },
  {
    cmd: ".mute",
    category: "Admin",
    desc: "Mute the group (only admins can send)",
    usage: ".mute",
    example: ".mute",
    access: "Admin Only",
  },
  {
    cmd: ".unmute",
    category: "Admin",
    desc: "Unmute the group for all members",
    usage: ".unmute",
    example: ".unmute",
    access: "Admin Only",
  },
  {
    cmd: ".setprefix",
    category: "Admin",
    desc: "Change bot command prefix",
    usage: ".setprefix [prefix]",
    example: ".setprefix !",
    access: "Owner Only",
  },
  {
    cmd: ".block",
    category: "Admin",
    desc: "Block a user from using the bot",
    usage: ".block @user",
    example: ".block @user",
    access: "Admin Only",
  },
  {
    cmd: ".unblock",
    category: "Admin",
    desc: "Unblock a user to use the bot",
    usage: ".unblock @user",
    example: ".unblock @user",
    access: "Admin Only",
  },
  {
    cmd: ".setdesc",
    category: "Admin",
    desc: "Change group description",
    usage: ".setdesc [text]",
    example: ".setdesc Welcome to VK911 group!",
    access: "Admin Only",
  },
  {
    cmd: ".setname",
    category: "Admin",
    desc: "Change group name",
    usage: ".setname [name]",
    example: ".setname VK911 Official",
    access: "Admin Only",
  },
  {
    cmd: ".setwelcome",
    category: "Admin",
    desc: "Set custom welcome message for new members",
    usage: ".setwelcome [msg]",
    example: ".setwelcome Welcome @user!",
    access: "Admin Only",
  },
  {
    cmd: ".setgoodbye",
    category: "Admin",
    desc: "Set goodbye message for leaving members",
    usage: ".setgoodbye [msg]",
    example: ".setgoodbye Goodbye @user!",
    access: "Admin Only",
  },
  {
    cmd: ".lockdown",
    category: "Admin",
    desc: "Full group lockdown mode",
    usage: ".lockdown on/off",
    example: ".lockdown on",
    access: "Owner Only",
  },
  {
    cmd: ".resetlink",
    category: "Admin",
    desc: "Reset the group invite link",
    usage: ".resetlink",
    example: ".resetlink",
    access: "Admin Only",
  },
  {
    cmd: ".invitelink",
    category: "Admin",
    desc: "Get the group invite link",
    usage: ".invitelink",
    example: ".invitelink",
    access: "Admin Only",
  },
  {
    cmd: ".broadcast",
    category: "Admin",
    desc: "Send a message to all bot users",
    usage: ".broadcast [msg]",
    example: ".broadcast Bot maintenance at 12AM",
    access: "Owner Only",
  },
  {
    cmd: ".announce",
    category: "Admin",
    desc: "Pin announcement in group",
    usage: ".announce [msg]",
    example: ".announce Meeting at 5PM today",
    access: "Admin Only",
  },
  {
    cmd: ".setppgc",
    category: "Admin",
    desc: "Set group profile picture",
    usage: ".setppgc (reply to image)",
    example: ".setppgc",
    access: "Admin Only",
  },
  {
    cmd: ".setpp",
    category: "Admin",
    desc: "Set your profile picture via bot",
    usage: ".setpp (reply to image)",
    example: ".setpp",
    access: "All Users",
  },
  {
    cmd: ".owner",
    category: "Admin",
    desc: "Display bot owner contact info",
    usage: ".owner",
    example: ".owner",
    access: "All Users",
  },

  // ─── GROUP (25) ───
  {
    cmd: ".tagall",
    category: "Group",
    desc: "Tag all group members in a message",
    usage: ".tagall [msg]",
    example: ".tagall Attention everyone!",
    access: "Admin Only",
  },
  {
    cmd: ".hidetag",
    category: "Group",
    desc: "Tag all without showing their names (silent mention)",
    usage: ".hidetag [msg]",
    example: ".hidetag Read this!",
    access: "Admin Only",
  },
  {
    cmd: ".groupinfo",
    category: "Group",
    desc: "Display detailed group information",
    usage: ".groupinfo",
    example: ".groupinfo",
    access: "All Users",
  },
  {
    cmd: ".members",
    category: "Group",
    desc: "List all group members with roles",
    usage: ".members",
    example: ".members",
    access: "All Users",
  },
  {
    cmd: ".admins",
    category: "Group",
    desc: "List all group admins",
    usage: ".admins",
    example: ".admins",
    access: "All Users",
  },
  {
    cmd: ".leave",
    category: "Group",
    desc: "Make the bot leave the group",
    usage: ".leave",
    example: ".leave",
    access: "Owner Only",
  },
  {
    cmd: ".joinlink",
    category: "Group",
    desc: "Join a group via invite link",
    usage: ".joinlink [link]",
    example: ".joinlink https://chat.whatsapp.com/xxx",
    access: "Owner Only",
  },
  {
    cmd: ".poll",
    category: "Group",
    desc: "Create a poll in the group",
    usage: ".poll [question] | [opt1] | [opt2]",
    example: ".poll Fav color? | Red | Blue | Green",
    access: "All Users",
  },
  {
    cmd: ".schedule",
    category: "Group",
    desc: "Schedule a message to send later",
    usage: ".schedule [time] [msg]",
    example: ".schedule 10min Meeting reminder",
    access: "Admin Only",
  },
  {
    cmd: ".everyone",
    category: "Group",
    desc: "Message that notifies all members",
    usage: ".everyone [msg]",
    example: ".everyone Check pinned message",
    access: "Admin Only",
  },
  {
    cmd: ".antidelete",
    category: "Group",
    desc: "Restore deleted messages in group",
    usage: ".antidelete on/off",
    example: ".antidelete on",
    access: "Admin Only",
  },
  {
    cmd: ".viewonce",
    category: "Group",
    desc: "Reveal and re-share view-once media",
    usage: ".viewonce (reply)",
    example: ".viewonce",
    access: "All Users",
  },
  {
    cmd: ".kick5",
    category: "Group",
    desc: "Kick multiple users at once (up to 5)",
    usage: ".kick5 @u1 @u2 @u3",
    example: ".kick5 @u1 @u2",
    access: "Admin Only",
  },
  {
    cmd: ".listgroups",
    category: "Group",
    desc: "List all groups the bot is in",
    usage: ".listgroups",
    example: ".listgroups",
    access: "Owner Only",
  },
  {
    cmd: ".listusers",
    category: "Group",
    desc: "List all private chat users with bot",
    usage: ".listusers",
    example: ".listusers",
    access: "Owner Only",
  },
  {
    cmd: ".grouptag",
    category: "Group",
    desc: "Tag specific role members in group",
    usage: ".grouptag admin/member",
    example: ".grouptag admin",
    access: "Admin Only",
  },
  {
    cmd: ".gclink",
    category: "Group",
    desc: "Fetch current group invite link",
    usage: ".gclink",
    example: ".gclink",
    access: "Admin Only",
  },
  {
    cmd: ".resetnumber",
    category: "Group",
    desc: "Reset bot phone number session",
    usage: ".resetnumber",
    example: ".resetnumber",
    access: "Owner Only",
  },
  {
    cmd: ".report",
    category: "Group",
    desc: "Report a user to group admins",
    usage: ".report @user [reason]",
    example: ".report @user Spamming links",
    access: "All Users",
  },
  {
    cmd: ".strike",
    category: "Group",
    desc: "Give a strike to a user",
    usage: ".strike @user",
    example: ".strike @user",
    access: "Admin Only",
  },
  {
    cmd: ".timer",
    category: "Group",
    desc: "Set auto-delete timer for group messages",
    usage: ".timer [seconds]",
    example: ".timer 86400",
    access: "Admin Only",
  },
  {
    cmd: ".welcome",
    category: "Group",
    desc: "Toggle welcome message on/off",
    usage: ".welcome on/off",
    example: ".welcome on",
    access: "Admin Only",
  },
  {
    cmd: ".goodbye",
    category: "Group",
    desc: "Toggle goodbye message on/off",
    usage: ".goodbye on/off",
    example: ".goodbye on",
    access: "Admin Only",
  },
  {
    cmd: ".eventnotif",
    category: "Group",
    desc: "Enable/disable event notifications",
    usage: ".eventnotif on/off",
    example: ".eventnotif on",
    access: "Admin Only",
  },
  {
    cmd: ".setgcicon",
    category: "Group",
    desc: "Set group icon to emoji flag or symbol",
    usage: ".setgcicon [emoji]",
    example: ".setgcicon 🔥",
    access: "Admin Only",
  },

  // ─── MEDIA (25) ───
  {
    cmd: ".sticker",
    category: "Media",
    desc: "Convert image/video to WhatsApp sticker",
    usage: ".sticker (reply to media)",
    example: ".sticker",
    access: "All Users",
  },
  {
    cmd: ".stickertoimg",
    category: "Media",
    desc: "Convert sticker back to image",
    usage: ".stickertoimg (reply to sticker)",
    example: ".stickertoimg",
    access: "All Users",
  },
  {
    cmd: ".tomp4",
    category: "Media",
    desc: "Convert sticker GIF to MP4 video",
    usage: ".tomp4 (reply to gif/sticker)",
    example: ".tomp4",
    access: "All Users",
  },
  {
    cmd: ".toimg",
    category: "Media",
    desc: "Extract thumbnail from video as image",
    usage: ".toimg (reply to video)",
    example: ".toimg",
    access: "All Users",
  },
  {
    cmd: ".toaudio",
    category: "Media",
    desc: "Extract audio from any video file",
    usage: ".toaudio (reply to video)",
    example: ".toaudio",
    access: "All Users",
  },
  {
    cmd: ".tts",
    category: "Media",
    desc: "Text to speech — converts text to voice note",
    usage: ".tts [language] [text]",
    example: ".tts en Hello World",
    access: "All Users",
  },
  {
    cmd: ".stickername",
    category: "Media",
    desc: "Set pack and author name on sticker",
    usage: ".stickername [pack] | [author]",
    example: ".stickername VK911 | XMD",
    access: "All Users",
  },
  {
    cmd: ".emojimix",
    category: "Media",
    desc: "Mix two emojis into one sticker",
    usage: ".emojimix [e1] [e2]",
    example: ".emojimix 😂 🔥",
    access: "All Users",
  },
  {
    cmd: ".attp",
    category: "Media",
    desc: "Create animated text sticker",
    usage: ".attp [text]",
    example: ".attp VK911 MINI",
    access: "All Users",
  },
  {
    cmd: ".ttp",
    category: "Media",
    desc: "Convert text to image sticker",
    usage: ".ttp [text]",
    example: ".ttp Hello World",
    access: "All Users",
  },
  {
    cmd: ".blur",
    category: "Media",
    desc: "Apply blur effect to an image",
    usage: ".blur [level] (reply to image)",
    example: ".blur 5",
    access: "All Users",
  },
  {
    cmd: ".invert",
    category: "Media",
    desc: "Invert colors of an image",
    usage: ".invert (reply to image)",
    example: ".invert",
    access: "All Users",
  },
  {
    cmd: ".greyscale",
    category: "Media",
    desc: "Convert image to black & white",
    usage: ".greyscale (reply to image)",
    example: ".greyscale",
    access: "All Users",
  },
  {
    cmd: ".resize",
    category: "Media",
    desc: "Resize an image to custom dimensions",
    usage: ".resize [w] [h] (reply to img)",
    example: ".resize 512 512",
    access: "All Users",
  },
  {
    cmd: ".brightness",
    category: "Media",
    desc: "Adjust brightness of an image",
    usage: ".brightness [level]",
    example: ".brightness 80",
    access: "All Users",
  },
  {
    cmd: ".flip",
    category: "Media",
    desc: "Flip image horizontally or vertically",
    usage: ".flip h/v (reply to img)",
    example: ".flip h",
    access: "All Users",
  },
  {
    cmd: ".circle",
    category: "Media",
    desc: "Crop image into a circle frame",
    usage: ".circle (reply to img)",
    example: ".circle",
    access: "All Users",
  },
  {
    cmd: ".enhance",
    category: "Media",
    desc: "AI enhance/upscale an image",
    usage: ".enhance (reply to img)",
    example: ".enhance",
    access: "All Users",
  },
  {
    cmd: ".removebg",
    category: "Media",
    desc: "Remove background from an image using AI",
    usage: ".removebg (reply to img)",
    example: ".removebg",
    access: "All Users",
  },
  {
    cmd: ".caption",
    category: "Media",
    desc: "Add a text caption overlay on an image",
    usage: ".caption [text] (reply to img)",
    example: ".caption VK911 MINI",
    access: "All Users",
  },
  {
    cmd: ".watermark",
    category: "Media",
    desc: "Add VK911 watermark to images",
    usage: ".watermark (reply to img)",
    example: ".watermark",
    access: "All Users",
  },
  {
    cmd: ".compress",
    category: "Media",
    desc: "Compress a video file to smaller size",
    usage: ".compress (reply to video)",
    example: ".compress",
    access: "All Users",
  },
  {
    cmd: ".slowmo",
    category: "Media",
    desc: "Apply slow motion effect to a video",
    usage: ".slowmo (reply to video)",
    example: ".slowmo",
    access: "All Users",
  },
  {
    cmd: ".boomerang",
    category: "Media",
    desc: "Create a boomerang loop from a video",
    usage: ".boomerang (reply to video)",
    example: ".boomerang",
    access: "All Users",
  },
  {
    cmd: ".trim",
    category: "Media",
    desc: "Trim a video to specific start/end time",
    usage: ".trim [start] [end]",
    example: ".trim 0:10 0:30",
    access: "All Users",
  },

  // ─── DOWNLOADER (25) ───
  {
    cmd: ".play",
    category: "Downloader",
    desc: "Search and play music as audio via YouTube",
    usage: ".play [song name]",
    example: ".play Blinding Lights",
    access: "All Users",
  },
  {
    cmd: ".playvid",
    category: "Downloader",
    desc: "Search and play music as video via YouTube",
    usage: ".playvid [song name]",
    example: ".playvid Blinding Lights",
    access: "All Users",
  },
  {
    cmd: ".ytmp3",
    category: "Downloader",
    desc: "Download YouTube video as MP3 audio",
    usage: ".ytmp3 [YouTube URL]",
    example: ".ytmp3 https://youtube.com/watch?v=xxx",
    access: "All Users",
  },
  {
    cmd: ".ytmp4",
    category: "Downloader",
    desc: "Download YouTube video as MP4",
    usage: ".ytmp4 [YouTube URL]",
    example: ".ytmp4 https://youtube.com/watch?v=xxx",
    access: "All Users",
  },
  {
    cmd: ".tiktok",
    category: "Downloader",
    desc: "Download TikTok video without watermark",
    usage: ".tiktok [TikTok URL]",
    example: ".tiktok https://tiktok.com/@user/video/xxx",
    access: "All Users",
  },
  {
    cmd: ".ig",
    category: "Downloader",
    desc: "Download Instagram post, reel, or story",
    usage: ".ig [Instagram URL]",
    example: ".ig https://instagram.com/p/xxx",
    access: "All Users",
  },
  {
    cmd: ".fb",
    category: "Downloader",
    desc: "Download Facebook video",
    usage: ".fb [Facebook URL]",
    example: ".fb https://facebook.com/video/xxx",
    access: "All Users",
  },
  {
    cmd: ".twitter",
    category: "Downloader",
    desc: "Download Twitter/X video or GIF",
    usage: ".twitter [Twitter URL]",
    example: ".twitter https://twitter.com/user/status/xxx",
    access: "All Users",
  },
  {
    cmd: ".pinterest",
    category: "Downloader",
    desc: "Download Pinterest image or video",
    usage: ".pinterest [URL]",
    example: ".pinterest https://pin.it/xxx",
    access: "All Users",
  },
  {
    cmd: ".soundcloud",
    category: "Downloader",
    desc: "Download SoundCloud audio track",
    usage: ".soundcloud [URL]",
    example: ".soundcloud https://soundcloud.com/xxx",
    access: "All Users",
  },
  {
    cmd: ".spotify",
    category: "Downloader",
    desc: "Download Spotify track as MP3 (via search)",
    usage: ".spotify [song/URL]",
    example: ".spotify Shape of You",
    access: "All Users",
  },
  {
    cmd: ".apk",
    category: "Downloader",
    desc: "Download APK file by app name",
    usage: ".apk [app name]",
    example: ".apk WhatsApp",
    access: "All Users",
  },
  {
    cmd: ".wallpaper",
    category: "Downloader",
    desc: "Download HD wallpapers by keyword",
    usage: ".wallpaper [keyword]",
    example: ".wallpaper mountains sunset",
    access: "All Users",
  },
  {
    cmd: ".gdrive",
    category: "Downloader",
    desc: "Download file from Google Drive link",
    usage: ".gdrive [URL]",
    example: ".gdrive https://drive.google.com/xxx",
    access: "All Users",
  },
  {
    cmd: ".mediafire",
    category: "Downloader",
    desc: "Download from MediaFire link",
    usage: ".mediafire [URL]",
    example: ".mediafire https://mediafire.com/file/xxx",
    access: "All Users",
  },
  {
    cmd: ".anonfile",
    category: "Downloader",
    desc: "Download from AnonFiles link",
    usage: ".anonfile [URL]",
    example: ".anonfile https://anonfiles.com/xxx",
    access: "All Users",
  },
  {
    cmd: ".pixiv",
    category: "Downloader",
    desc: "Download Pixiv artwork by ID",
    usage: ".pixiv [artwork ID]",
    example: ".pixiv 99881234",
    access: "All Users",
  },
  {
    cmd: ".anime",
    category: "Downloader",
    desc: "Search and download anime clips/images",
    usage: ".anime [anime name]",
    example: ".anime Naruto",
    access: "All Users",
  },
  {
    cmd: ".manga",
    category: "Downloader",
    desc: "Download manga chapters by title",
    usage: ".manga [title] [chapter]",
    example: ".manga One Piece 1",
    access: "All Users",
  },
  {
    cmd: ".mp3search",
    category: "Downloader",
    desc: "Search MP3 by keyword and download",
    usage: ".mp3search [keyword]",
    example: ".mp3search Wizkid Essence",
    access: "All Users",
  },
  {
    cmd: ".lirik",
    category: "Downloader",
    desc: "Get lyrics for any song",
    usage: ".lirik [song name]",
    example: ".lirik Blinding Lights",
    access: "All Users",
  },
  {
    cmd: ".ytplaylist",
    category: "Downloader",
    desc: "Download all songs from YouTube playlist",
    usage: ".ytplaylist [playlist URL]",
    example: ".ytplaylist https://youtube.com/playlist?list=xxx",
    access: "All Users",
  },
  {
    cmd: ".terabox",
    category: "Downloader",
    desc: "Download file from TeraBox link",
    usage: ".terabox [URL]",
    example: ".terabox https://terabox.com/xxx",
    access: "All Users",
  },
  {
    cmd: ".twitter2",
    category: "Downloader",
    desc: "Alternative Twitter downloader",
    usage: ".twitter2 [URL]",
    example: ".twitter2 https://x.com/xxx",
    access: "All Users",
  },
  {
    cmd: ".savefrom",
    category: "Downloader",
    desc: "Download video from any supported URL",
    usage: ".savefrom [URL]",
    example: ".savefrom https://site.com/video",
    access: "All Users",
  },

  // ─── FUN (30) ───
  {
    cmd: ".joke",
    category: "Fun",
    desc: "Get a random funny joke",
    usage: ".joke",
    example: ".joke",
    access: "All Users",
  },
  {
    cmd: ".meme",
    category: "Fun",
    desc: "Get a random fresh meme",
    usage: ".meme",
    example: ".meme",
    access: "All Users",
  },
  {
    cmd: ".truth",
    category: "Fun",
    desc: "Get a random truth question",
    usage: ".truth",
    example: ".truth",
    access: "All Users",
  },
  {
    cmd: ".dare",
    category: "Fun",
    desc: "Get a random dare challenge",
    usage: ".dare",
    example: ".dare",
    access: "All Users",
  },
  {
    cmd: ".8ball",
    category: "Fun",
    desc: "Ask the magic 8ball a yes/no question",
    usage: ".8ball [question]",
    example: ".8ball Will I be rich?",
    access: "All Users",
  },
  {
    cmd: ".roll",
    category: "Fun",
    desc: "Roll a dice (1-6) or custom sided dice",
    usage: ".roll [sides]",
    example: ".roll 20",
    access: "All Users",
  },
  {
    cmd: ".flip",
    category: "Fun",
    desc: "Flip a coin — heads or tails",
    usage: ".flip",
    example: ".flip",
    access: "All Users",
  },
  {
    cmd: ".quote",
    category: "Fun",
    desc: "Get a random inspirational quote",
    usage: ".quote",
    example: ".quote",
    access: "All Users",
  },
  {
    cmd: ".roast",
    category: "Fun",
    desc: "Roast a tagged user with a funny line",
    usage: ".roast @user",
    example: ".roast @user",
    access: "All Users",
  },
  {
    cmd: ".ship",
    category: "Fun",
    desc: "Check compatibility between two users",
    usage: ".ship @user1 @user2",
    example: ".ship @user1 @user2",
    access: "All Users",
  },
  {
    cmd: ".waifu",
    category: "Fun",
    desc: "Get a random anime waifu image",
    usage: ".waifu",
    example: ".waifu",
    access: "All Users",
  },
  {
    cmd: ".neko",
    category: "Fun",
    desc: "Get a random neko/catgirl image",
    usage: ".neko",
    example: ".neko",
    access: "All Users",
  },
  {
    cmd: ".hug",
    category: "Fun",
    desc: "Send a hug GIF to a user",
    usage: ".hug @user",
    example: ".hug @user",
    access: "All Users",
  },
  {
    cmd: ".slap",
    category: "Fun",
    desc: "Slap a user with an anime GIF",
    usage: ".slap @user",
    example: ".slap @user",
    access: "All Users",
  },
  {
    cmd: ".pat",
    category: "Fun",
    desc: "Pat a user on the head with GIF",
    usage: ".pat @user",
    example: ".pat @user",
    access: "All Users",
  },
  {
    cmd: ".punch",
    category: "Fun",
    desc: "Punch a user with anime GIF",
    usage: ".punch @user",
    example: ".punch @user",
    access: "All Users",
  },
  {
    cmd: ".laugh",
    category: "Fun",
    desc: "Send a laugh reaction GIF",
    usage: ".laugh",
    example: ".laugh",
    access: "All Users",
  },
  {
    cmd: ".rps",
    category: "Fun",
    desc: "Play Rock Paper Scissors vs the bot",
    usage: ".rps [rock/paper/scissors]",
    example: ".rps rock",
    access: "All Users",
  },
  {
    cmd: ".guess",
    category: "Fun",
    desc: "Play number guessing game",
    usage: ".guess [number]",
    example: ".guess 42",
    access: "All Users",
  },
  {
    cmd: ".trivia",
    category: "Fun",
    desc: "Answer a random trivia question",
    usage: ".trivia",
    example: ".trivia",
    access: "All Users",
  },
  {
    cmd: ".akinator",
    category: "Fun",
    desc: "Play Akinator mind reading game",
    usage: ".akinator",
    example: ".akinator",
    access: "All Users",
  },
  {
    cmd: ".howgay",
    category: "Fun",
    desc: "Check how gay someone is (just for fun!)",
    usage: ".howgay @user",
    example: ".howgay @user",
    access: "All Users",
  },
  {
    cmd: ".howrich",
    category: "Fun",
    desc: "Check how rich someone is (random fun)",
    usage: ".howrich @user",
    example: ".howrich @user",
    access: "All Users",
  },
  {
    cmd: ".howhot",
    category: "Fun",
    desc: "Rate how hot someone is (fun meter)",
    usage: ".howhot @user",
    example: ".howhot @user",
    access: "All Users",
  },
  {
    cmd: ".rank",
    category: "Fun",
    desc: "Get your activity rank in the group",
    usage: ".rank",
    example: ".rank",
    access: "All Users",
  },
  {
    cmd: ".leaderboard",
    category: "Fun",
    desc: "Show top 10 most active members",
    usage: ".leaderboard",
    example: ".leaderboard",
    access: "All Users",
  },
  {
    cmd: ".rizz",
    category: "Fun",
    desc: "Generate random rizz/pickup line",
    usage: ".rizz",
    example: ".rizz",
    access: "All Users",
  },
  {
    cmd: ".compliment",
    category: "Fun",
    desc: "Get a random compliment for a user",
    usage: ".compliment @user",
    example: ".compliment @user",
    access: "All Users",
  },
  {
    cmd: ".insult",
    category: "Fun",
    desc: "Generate a random (friendly) insult",
    usage: ".insult @user",
    example: ".insult @user",
    access: "All Users",
  },
  {
    cmd: ".fakechat",
    category: "Fun",
    desc: "Generate a fake WhatsApp chat screenshot",
    usage: ".fakechat [name]:[msg]",
    example: ".fakechat Elon:I bought WhatsApp",
    access: "All Users",
  },

  // ─── AI (20) ───
  {
    cmd: ".ai",
    category: "AI",
    desc: "Chat with AI assistant (GPT-4 powered)",
    usage: ".ai [question]",
    example: ".ai What is quantum computing?",
    access: "All Users",
  },
  {
    cmd: ".gpt",
    category: "AI",
    desc: "Advanced GPT-4 reasoning mode",
    usage: ".gpt [prompt]",
    example: ".gpt Write a business plan for a bakery",
    access: "All Users",
  },
  {
    cmd: ".gemini",
    category: "AI",
    desc: "Google Gemini AI assistant",
    usage: ".gemini [question]",
    example: ".gemini Explain black holes",
    access: "All Users",
  },
  {
    cmd: ".dalle",
    category: "AI",
    desc: "Generate image from text using DALL-E",
    usage: ".dalle [description]",
    example: ".dalle A cyberpunk city at night",
    access: "All Users",
  },
  {
    cmd: ".imagine",
    category: "AI",
    desc: "Stable Diffusion image generation",
    usage: ".imagine [prompt]",
    example: ".imagine Realistic lion in savannah",
    access: "All Users",
  },
  {
    cmd: ".imgdesc",
    category: "AI",
    desc: "AI describe/analyze an image",
    usage: ".imgdesc (reply to image)",
    example: ".imgdesc",
    access: "All Users",
  },
  {
    cmd: ".ocr",
    category: "AI",
    desc: "Extract text from image using OCR",
    usage: ".ocr (reply to image)",
    example: ".ocr",
    access: "All Users",
  },
  {
    cmd: ".translate",
    category: "AI",
    desc: "Translate text to any language",
    usage: ".translate [lang] [text]",
    example: ".translate fr Hello World",
    access: "All Users",
  },
  {
    cmd: ".langdetect",
    category: "AI",
    desc: "Auto-detect language of text",
    usage: ".langdetect [text]",
    example: ".langdetect Bonjour le monde",
    access: "All Users",
  },
  {
    cmd: ".summarize",
    category: "AI",
    desc: "AI summarize long text or article",
    usage: ".summarize [text or URL]",
    example: ".summarize https://article-url.com",
    access: "All Users",
  },
  {
    cmd: ".code",
    category: "AI",
    desc: "AI code generator — describe what you need",
    usage: ".code [language] [description]",
    example: ".code python Fibonacci sequence",
    access: "All Users",
  },
  {
    cmd: ".fixcode",
    category: "AI",
    desc: "AI debug and fix broken code",
    usage: ".fixcode (reply to code message)",
    example: ".fixcode",
    access: "All Users",
  },
  {
    cmd: ".essay",
    category: "AI",
    desc: "AI write an essay on any topic",
    usage: ".essay [topic]",
    example: ".essay Climate change and its effects",
    access: "All Users",
  },
  {
    cmd: ".story",
    category: "AI",
    desc: "AI generate a short story",
    usage: ".story [theme]",
    example: ".story A robot falls in love",
    access: "All Users",
  },
  {
    cmd: ".rhyme",
    category: "AI",
    desc: "AI write a rhyme or rap verse",
    usage: ".rhyme [topic]",
    example: ".rhyme Lagos streets",
    access: "All Users",
  },
  {
    cmd: ".dictionary",
    category: "AI",
    desc: "Get definition and usage of a word",
    usage: ".dictionary [word]",
    example: ".dictionary ephemeral",
    access: "All Users",
  },
  {
    cmd: ".wikipedia",
    category: "AI",
    desc: "Search and fetch Wikipedia article",
    usage: ".wikipedia [topic]",
    example: ".wikipedia Artificial Intelligence",
    access: "All Users",
  },
  {
    cmd: ".chatbot",
    category: "AI",
    desc: "Enable personal AI chatbot mode for DM",
    usage: ".chatbot on/off",
    example: ".chatbot on",
    access: "All Users",
  },
  {
    cmd: ".imagine3d",
    category: "AI",
    desc: "3D image generation from text prompt",
    usage: ".imagine3d [prompt]",
    example: ".imagine3d 3D dragon on mountain",
    access: "All Users",
  },
  {
    cmd: ".voiceclone",
    category: "AI",
    desc: "Clone voice from audio sample (ElevenLabs)",
    usage: ".voiceclone (reply to voice)",
    example: ".voiceclone",
    access: "All Users",
  },

  // ─── UTILITY (25) ───
  {
    cmd: ".ping",
    category: "Utility",
    desc: "Check bot latency and response time",
    usage: ".ping",
    example: ".ping",
    access: "All Users",
  },
  {
    cmd: ".uptime",
    category: "Utility",
    desc: "Show how long the bot has been running",
    usage: ".uptime",
    example: ".uptime",
    access: "All Users",
  },
  {
    cmd: ".calc",
    category: "Utility",
    desc: "Perform mathematical calculations",
    usage: ".calc [expression]",
    example: ".calc 25 * 4 + 10",
    access: "All Users",
  },
  {
    cmd: ".weather",
    category: "Utility",
    desc: "Get real-time weather for any city",
    usage: ".weather [city]",
    example: ".weather Lagos",
    access: "All Users",
  },
  {
    cmd: ".time",
    category: "Utility",
    desc: "Get current time for any timezone/city",
    usage: ".time [city]",
    example: ".time New York",
    access: "All Users",
  },
  {
    cmd: ".date",
    category: "Utility",
    desc: "Show current date and day of week",
    usage: ".date",
    example: ".date",
    access: "All Users",
  },
  {
    cmd: ".currency",
    category: "Utility",
    desc: "Convert between currencies with live rates",
    usage: ".currency [amount] [from] [to]",
    example: ".currency 100 USD NGN",
    access: "All Users",
  },
  {
    cmd: ".crypto",
    category: "Utility",
    desc: "Get cryptocurrency price in real-time",
    usage: ".crypto [symbol]",
    example: ".crypto BTC",
    access: "All Users",
  },
  {
    cmd: ".news",
    category: "Utility",
    desc: "Fetch latest news by category",
    usage: ".news [category]",
    example: ".news technology",
    access: "All Users",
  },
  {
    cmd: ".covid",
    category: "Utility",
    desc: "Get COVID-19 stats for any country",
    usage: ".covid [country]",
    example: ".covid Nigeria",
    access: "All Users",
  },
  {
    cmd: ".qr",
    category: "Utility",
    desc: "Generate QR code from any text or URL",
    usage: ".qr [text or URL]",
    example: ".qr https://github.com",
    access: "All Users",
  },
  {
    cmd: ".readqr",
    category: "Utility",
    desc: "Decode and read a QR code image",
    usage: ".readqr (reply to image)",
    example: ".readqr",
    access: "All Users",
  },
  {
    cmd: ".shortlink",
    category: "Utility",
    desc: "Shorten any long URL",
    usage: ".shortlink [URL]",
    example: ".shortlink https://very-long-url.com/path?query=1",
    access: "All Users",
  },
  {
    cmd: ".password",
    category: "Utility",
    desc: "Generate strong random password",
    usage: ".password [length]",
    example: ".password 16",
    access: "All Users",
  },
  {
    cmd: ".base64en",
    category: "Utility",
    desc: "Encode text to Base64",
    usage: ".base64en [text]",
    example: ".base64en Hello World",
    access: "All Users",
  },
  {
    cmd: ".base64de",
    category: "Utility",
    desc: "Decode Base64 back to plain text",
    usage: ".base64de [base64]",
    example: ".base64de SGVsbG8gV29ybGQ=",
    access: "All Users",
  },
  {
    cmd: ".hash",
    category: "Utility",
    desc: "Hash text with MD5/SHA256",
    usage: ".hash [algo] [text]",
    example: ".hash sha256 mypassword",
    access: "All Users",
  },
  {
    cmd: ".color",
    category: "Utility",
    desc: "Get color info and preview from hex code",
    usage: ".color [hex]",
    example: ".color #00ff88",
    access: "All Users",
  },
  {
    cmd: ".ip",
    category: "Utility",
    desc: "Lookup IP address geolocation info",
    usage: ".ip [IP address]",
    example: ".ip 8.8.8.8",
    access: "All Users",
  },
  {
    cmd: ".whois",
    category: "Utility",
    desc: "WHOIS lookup for a domain name",
    usage: ".whois [domain]",
    example: ".whois google.com",
    access: "All Users",
  },
  {
    cmd: ".codeto",
    category: "Utility",
    desc: "Convert code snippet to beautiful image",
    usage: ".codeto [language] [code]",
    example: '.codeto js console.log("hi")',
    access: "All Users",
  },
  {
    cmd: ".unit",
    category: "Utility",
    desc: "Convert between measurement units",
    usage: ".unit [val] [from] [to]",
    example: ".unit 100 km miles",
    access: "All Users",
  },
  {
    cmd: ".pdf2img",
    category: "Utility",
    desc: "Convert PDF to images (first page)",
    usage: ".pdf2img (reply to PDF)",
    example: ".pdf2img",
    access: "All Users",
  },
  {
    cmd: ".img2pdf",
    category: "Utility",
    desc: "Convert image to PDF document",
    usage: ".img2pdf (reply to image)",
    example: ".img2pdf",
    access: "All Users",
  },
  {
    cmd: ".notes",
    category: "Utility",
    desc: "Save and retrieve personal notes",
    usage: ".notes save/list/del [key] [text]",
    example: ".notes save info VK911 is best",
    access: "All Users",
  },

  // ─── INFO (20) ───
  {
    cmd: ".menu",
    category: "Info",
    desc: "Show the full bot command menu with channel link",
    usage: ".menu",
    example: ".menu",
    access: "All Users",
  },
  {
    cmd: ".help",
    category: "Info",
    desc: "Get help for a specific command",
    usage: ".help [command]",
    example: ".help sticker",
    access: "All Users",
  },
  {
    cmd: ".info",
    category: "Info",
    desc: "Show bot info, version, and creator details",
    usage: ".info",
    example: ".info",
    access: "All Users",
  },
  {
    cmd: ".runtime",
    category: "Info",
    desc: "Show bot server resource usage stats",
    usage: ".runtime",
    example: ".runtime",
    access: "All Users",
  },
  {
    cmd: ".speed",
    category: "Info",
    desc: "Run an internet speed test on the bot server",
    usage: ".speed",
    example: ".speed",
    access: "All Users",
  },
  {
    cmd: ".listcmds",
    category: "Info",
    desc: "Show all available commands as list",
    usage: ".listcmds",
    example: ".listcmds",
    access: "All Users",
  },
  {
    cmd: ".alive",
    category: "Info",
    desc: "Check if the bot is alive and responsive",
    usage: ".alive",
    example: ".alive",
    access: "All Users",
  },
  {
    cmd: ".status",
    category: "Info",
    desc: "Show current bot session status",
    usage: ".status",
    example: ".status",
    access: "All Users",
  },
  {
    cmd: ".whatsapp",
    category: "Info",
    desc: "Show current WhatsApp account info",
    usage: ".whatsapp",
    example: ".whatsapp",
    access: "All Users",
  },
  {
    cmd: ".profile",
    category: "Info",
    desc: "Get profile picture of any WhatsApp user",
    usage: ".profile @user",
    example: ".profile @user",
    access: "All Users",
  },
  {
    cmd: ".bio",
    category: "Info",
    desc: "Get WhatsApp status/bio of a user",
    usage: ".bio @user",
    example: ".bio @user",
    access: "All Users",
  },
  {
    cmd: ".number",
    category: "Info",
    desc: "Check if a WhatsApp number exists",
    usage: ".number [phone]",
    example: ".number 2347001234567",
    access: "All Users",
  },
  {
    cmd: ".plugins",
    category: "Info",
    desc: "List all loaded bot plugins",
    usage: ".plugins",
    example: ".plugins",
    access: "All Users",
  },
  {
    cmd: ".changelog",
    category: "Info",
    desc: "Show the latest bot update changelog",
    usage: ".changelog",
    example: ".changelog",
    access: "All Users",
  },
  {
    cmd: ".privacy",
    category: "Info",
    desc: "View bot privacy policy",
    usage: ".privacy",
    example: ".privacy",
    access: "All Users",
  },
  {
    cmd: ".channel",
    category: "Info",
    desc: "Get link to VK911 official WhatsApp channel",
    usage: ".channel",
    example: ".channel",
    access: "All Users",
  },
  {
    cmd: ".support",
    category: "Info",
    desc: "Get bot support group link",
    usage: ".support",
    example: ".support",
    access: "All Users",
  },
  {
    cmd: ".donate",
    category: "Info",
    desc: "Show donation/support details for the developer",
    usage: ".donate",
    example: ".donate",
    access: "All Users",
  },
  {
    cmd: ".update",
    category: "Info",
    desc: "Check for bot updates from GitHub",
    usage: ".update",
    example: ".update",
    access: "Owner Only",
  },
  {
    cmd: ".restart",
    category: "Info",
    desc: "Restart the bot process safely",
    usage: ".restart",
    example: ".restart",
    access: "Owner Only",
  },

  // ─── NSFW (10 — disabled by default) ───
  {
    cmd: ".nsfw",
    category: "NSFW",
    desc: "Toggle NSFW commands on/off (Group only)",
    usage: ".nsfw on/off",
    example: ".nsfw on",
    access: "Admin Only",
  },
  {
    cmd: ".hentai",
    category: "NSFW",
    desc: "Send NSFW anime image (18+ groups only)",
    usage: ".hentai",
    example: ".hentai",
    access: "18+ Groups",
  },
  {
    cmd: ".boobs",
    category: "NSFW",
    desc: "NSFW content (18+ only, disabled by default)",
    usage: ".boobs",
    example: ".boobs",
    access: "18+ Groups",
  },
  {
    cmd: ".ass",
    category: "NSFW",
    desc: "NSFW content (18+ only, disabled by default)",
    usage: ".ass",
    example: ".ass",
    access: "18+ Groups",
  },
  {
    cmd: ".pussy",
    category: "NSFW",
    desc: "NSFW content (18+ only, disabled by default)",
    usage: ".pussy",
    example: ".pussy",
    access: "18+ Groups",
  },
  {
    cmd: ".blowjob",
    category: "NSFW",
    desc: "NSFW content (18+ only, disabled by default)",
    usage: ".blowjob",
    example: ".blowjob",
    access: "18+ Groups",
  },
  {
    cmd: ".neko-nsfw",
    category: "NSFW",
    desc: "NSFW neko content (18+ only)",
    usage: ".neko-nsfw",
    example: ".neko-nsfw",
    access: "18+ Groups",
  },
  {
    cmd: ".waifu-nsfw",
    category: "NSFW",
    desc: "NSFW waifu images (18+ only)",
    usage: ".waifu-nsfw",
    example: ".waifu-nsfw",
    access: "18+ Groups",
  },
  {
    cmd: ".nsfw-gif",
    category: "NSFW",
    desc: "NSFW GIF content (18+ only)",
    usage: ".nsfw-gif",
    example: ".nsfw-gif",
    access: "18+ Groups",
  },
  {
    cmd: ".adult-story",
    category: "NSFW",
    desc: "Generate adult story (18+ only)",
    usage: ".adult-story [prompt]",
    example: ".adult-story romantic night",
    access: "18+ Groups",
  },
];
