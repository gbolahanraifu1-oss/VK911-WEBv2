"use client";
import { useState, useMemo } from "react";

const CATEGORIES = ["All","Admin","Group","Media","Downloader","Fun","AI","Utility","Info"];
const CATEGORY_COLORS = { Admin:"#ef4444", Group:"#f59e0b", Media:"#22d3ee", Downloader:"#6366f1", Fun:"#ec4899", AI:"#00ff88", Utility:"#8b5cf6", Info:"#64748b", Default:"#334155" };

export default function CommandsPage() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const PER_PAGE = 20;

  const filtered = useMemo(() => {
    let list = COMMANDS;
    if (cat !== "All") list = list.filter((c) => c.category === cat);
    if (search.trim()) list = list.filter((c) => c.cmd.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [search, cat]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const catCounts = useMemo(() => {
    const counts = {};
    COMMANDS.forEach((c) => { counts[c.category] = (counts[c.category] || 0) + 1; });
    return counts;
  }, []);

  return (
    <div style={{ padding: "32px", maxWidth: "1400px" }}>
      <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#f1f5f9", margin: "0 0 6px 0" }}>⌘ Command Library</h1>
          <p style={{ color: "#475569", fontSize: "13px", margin: 0 }}>
            <span style={{ color: "#00ff88", fontWeight: "700" }}>{COMMANDS.length}</span> commands across {CATEGORIES.length - 1} categories — Plugin-based architecture
          </p>
        </div>
        <div style={{ padding: "8px 16px", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: "8px", fontSize: "12px", color: "#00ff88", fontFamily: "monospace" }}>
          VK911 MINI v2.0.3 — {COMMANDS.length} CMDS
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
        {CATEGORIES.map((c) => {
          const count = c === "All" ? COMMANDS.length : catCounts[c] || 0;
          const color = CATEGORY_COLORS[c] || CATEGORY_COLORS.Default;
          const active = cat === c;
          return (
            <button key={c} onClick={() => { setCat(c); setPage(1); }} style={{ padding: "7px 14px", background: active ? `${color}18` : "rgba(255,255,255,0.03)", border: active ? `1px solid ${color}55` : "1px solid rgba(255,255,255,0.06)", borderRadius: "99px", color: active ? color : "#64748b", fontSize: "12px", fontWeight: active ? "600" : "400", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              {c} <span style={{ fontSize: "10px", opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#334155", fontSize: "14px" }}>⌕</span>
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search commands, descriptions..." style={{ width: "100%", background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "12px 14px 12px 40px", fontSize: "13px", color: "#e2e8f0", outline: "none", boxSizing: "border-box" }} onFocus={(e) => (e.target.style.borderColor = "rgba(0,255,136,0.3)")} onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.06)")} />
        {search && <button onClick={() => { setSearch(""); setPage(1); }} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: "16px" }}>✕</button>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 320px" : "1fr", gap: "20px" }}>
        {/* Table */}
        <div style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Command","Category","Description","Usage","Access"].map((h) => (
                    <th key={h} style={{ padding: "14px 18px", textAlign: "left", fontSize: "10px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.8px", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((cmd, i) => {
                  const color = CATEGORY_COLORS[cmd.category] || CATEGORY_COLORS.Default;
                  const isSelected = selected?.cmd === cmd.cmd;
                  return (
                    <tr key={i} onClick={() => setSelected(isSelected ? null : cmd)} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", cursor: "pointer", background: isSelected ? "rgba(0,255,136,0.05)" : "transparent", transition: "background 0.1s" }}
                      onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                      onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                    >
                      <td style={{ padding: "12px 18px", fontFamily: "monospace", fontSize: "13px", color: "#00ff88", whiteSpace: "nowrap", fontWeight: "600" }}>{cmd.cmd}</td>
                      <td style={{ padding: "12px 18px" }}>
                        <span style={{ padding: "2px 8px", borderRadius: "99px", fontSize: "10px", fontWeight: "600", background: `${color}15`, color, border: `1px solid ${color}30` }}>{cmd.category}</span>
                      </td>
                      <td style={{ padding: "12px 18px", fontSize: "12px", color: "#94a3b8", maxWidth: "340px" }}>{cmd.desc}</td>
                      <td style={{ padding: "12px 18px", fontFamily: "monospace", fontSize: "11px", color: "#64748b", whiteSpace: "nowrap" }}>{cmd.usage}</td>
                      <td style={{ padding: "12px 18px", fontSize: "11px", color: "#475569", whiteSpace: "nowrap" }}>{cmd.access || "All Users"}</td>
                    </tr>
                  );
                })}
                {paged.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#334155", fontSize: "13px" }}>No commands found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div style={{ padding: "14px 18px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "#475569" }}>Showing {Math.min(filtered.length, (page-1)*PER_PAGE+1)}–{Math.min(filtered.length, page*PER_PAGE)} of {filtered.length}</span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "6px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", color: page === 1 ? "#334155" : "#94a3b8", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: "12px" }}>‹ Prev</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "6px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", color: page === totalPages ? "#334155" : "#94a3b8", cursor: page === totalPages ? "not-allowed" : "pointer", fontSize: "12px" }}>Next ›</button>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ background: "#0f0f1a", border: "1px solid rgba(0,255,136,0.15)", borderRadius: "14px", padding: "22px", height: "fit-content", position: "sticky", top: "20px" }}>
            <button onClick={() => setSelected(null)} style={{ float: "right", background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: "18px" }}>✕</button>
            <p style={{ fontSize: "10px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 10px 0" }}>Command Detail</p>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#00ff88", fontFamily: "monospace", margin: "0 0 6px 0" }}>{selected.cmd}</h2>
            <span style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: "600", background: `${CATEGORY_COLORS[selected.category] || "#334155"}15`, color: CATEGORY_COLORS[selected.category] || "#64748b", border: `1px solid ${CATEGORY_COLORS[selected.category] || "#334155"}30` }}>{selected.category}</span>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: "16px 0 12px 0", lineHeight: "1.7" }}>{selected.desc}</p>
            <div style={{ background: "#080810", borderRadius: "8px", padding: "12px 14px", marginBottom: "12px" }}>
              <p style={{ fontSize: "10px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 6px 0" }}>Usage</p>
              <code style={{ fontSize: "13px", color: "#00ff88", fontFamily: "monospace" }}>{selected.usage}</code>
            </div>
            {selected.example && (
              <div style={{ background: "#080810", borderRadius: "8px", padding: "12px 14px", marginBottom: "14px" }}>
                <p style={{ fontSize: "10px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 6px 0" }}>Example</p>
                <code style={{ fontSize: "12px", color: "#94a3b8", fontFamily: "monospace" }}>{selected.example}</code>
              </div>
            )}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "11px", background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>● Enabled</span>
              <span style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "11px", background: "rgba(255,255,255,0.05)", color: "#64748b", border: "1px solid rgba(255,255,255,0.06)" }}>{selected.access || "All Users"}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const COMMANDS = [
  // ─── ADMIN (30) ───
  { cmd: ".ban", category: "Admin", desc: "Ban a user from the group permanently", usage: ".ban @user", example: ".ban @2347001234567", access: "Admin Only" },
  { cmd: ".unban", category: "Admin", desc: "Unban a previously banned user by number", usage: ".unban [number]", example: ".unban 2347001234567", access: "Owner Only" },
  { cmd: ".kick", category: "Admin", desc: "Remove a user from the group", usage: ".kick @user", example: ".kick @2347001234567", access: "Admin Only" },
  { cmd: ".add", category: "Admin", desc: "Add a user to the group by number", usage: ".add [number]", example: ".add 2347001234567", access: "Admin Only" },
  { cmd: ".promote", category: "Admin", desc: "Promote user to group admin", usage: ".promote @user", example: ".promote @2347001234567", access: "Admin Only" },
  { cmd: ".demote", category: "Admin", desc: "Demote admin to regular member", usage: ".demote @user", example: ".demote @2347001234567", access: "Admin Only" },
  { cmd: ".mute", category: "Admin", desc: "Mute group — only admins can send messages", usage: ".mute", example: ".mute", access: "Admin Only" },
  { cmd: ".unmute", category: "Admin", desc: "Unmute group — everyone can send messages", usage: ".unmute", example: ".unmute", access: "Admin Only" },
  { cmd: ".antilink", category: "Admin", desc: "Toggle anti-link protection in the group", usage: ".antilink on/off", example: ".antilink on", access: "Admin Only" },
  { cmd: ".antispam", category: "Admin", desc: "Toggle anti-spam filter for the group", usage: ".antispam on/off", example: ".antispam on", access: "Admin Only" },
  { cmd: ".antibot", category: "Admin", desc: "Block other bots from joining the group", usage: ".antibot on/off", example: ".antibot on", access: "Admin Only" },
  { cmd: ".antitoxic", category: "Admin", desc: "Auto-delete toxic/offensive messages in group", usage: ".antitoxic on/off", example: ".antitoxic on", access: "Admin Only" },
  { cmd: ".warn", category: "Admin", desc: "Warn a user; 3 warnings = auto-kick", usage: ".warn @user [reason]", example: ".warn @user spamming", access: "Admin Only" },
  { cmd: ".clearwarn", category: "Admin", desc: "Clear all warnings for a user", usage: ".clearwarn @user", example: ".clearwarn @2347001234567", access: "Admin Only" },
  { cmd: ".pinmsg", category: "Admin", desc: "Pin a message in the group", usage: ".pinmsg (reply to message)", example: ".pinmsg", access: "Admin Only" },
  { cmd: ".unpinmsg", category: "Admin", desc: "Unpin the current pinned message", usage: ".unpinmsg", example: ".unpinmsg", access: "Admin Only" },
  { cmd: ".changedesc", category: "Admin", desc: "Change the group description", usage: ".changedesc [new description]", example: ".changedesc Welcome to our group!", access: "Admin Only" },
  { cmd: ".changename", category: "Admin", desc: "Change the group name", usage: ".changename [new name]", example: ".changename VK911 Squad", access: "Admin Only" },
  { cmd: ".setprefix", category: "Admin", desc: "Change the bot command prefix", usage: ".setprefix [symbol]", example: ".setprefix !", access: "Owner Only" },
  { cmd: ".lockgroup", category: "Admin", desc: "Lock group so only admins can edit settings", usage: ".lockgroup", example: ".lockgroup", access: "Admin Only" },
  { cmd: ".unlockgroup", category: "Admin", desc: "Unlock group settings for all members", usage: ".unlockgroup", example: ".unlockgroup", access: "Admin Only" },
  { cmd: ".broadcast", category: "Admin", desc: "Send broadcast message to all bot contacts", usage: ".broadcast [message]", example: ".broadcast Hello everyone!", access: "Owner Only" },
  { cmd: ".broadcastgroup", category: "Admin", desc: "Broadcast to all groups the bot is in", usage: ".broadcastgroup [message]", example: ".broadcastgroup Bot update!", access: "Owner Only" },
  { cmd: ".restart", category: "Admin", desc: "Restart the bot process", usage: ".restart", example: ".restart", access: "Owner Only" },
  { cmd: ".leave", category: "Admin", desc: "Make bot leave the current group", usage: ".leave", example: ".leave", access: "Owner Only" },
  { cmd: ".setname", category: "Admin", desc: "Change the bot's WhatsApp display name", usage: ".setname [name]", example: ".setname VK911 MINI", access: "Owner Only" },
  { cmd: ".setbio", category: "Admin", desc: "Change the bot's WhatsApp status/bio", usage: ".setbio [text]", example: ".setbio VK911 MINI Bot", access: "Owner Only" },
  { cmd: ".setpp", category: "Admin", desc: "Change the bot's profile picture", usage: ".setpp (send image)", example: ".setpp", access: "Owner Only" },
  { cmd: ".revoke", category: "Admin", desc: "Revoke and reset the group invite link", usage: ".revoke", example: ".revoke", access: "Admin Only" },
  { cmd: ".uptime", category: "Admin", desc: "Check how long the bot has been running", usage: ".uptime", example: ".uptime", access: "Owner Only" },

  // ─── GROUP (25) ───
  { cmd: ".tagall", category: "Group", desc: "Tag all group members with a message", usage: ".tagall [message]", example: ".tagall Meeting in 5!", access: "Admin Only" },
  { cmd: ".hidetag", category: "Group", desc: "Tag all members silently (no visible text)", usage: ".hidetag [message]", example: ".hidetag Read this", access: "Admin Only" },
  { cmd: ".everyone", category: "Group", desc: "Ping all group members with an announcement", usage: ".everyone [message]", example: ".everyone Important update!", access: "Admin Only" },
  { cmd: ".groupinfo", category: "Group", desc: "Show detailed group information and stats", usage: ".groupinfo", example: ".groupinfo", access: "All Users" },
  { cmd: ".members", category: "Group", desc: "List all group members (up to 50)", usage: ".members", example: ".members", access: "All Users" },
  { cmd: ".admins", category: "Group", desc: "List all group admins", usage: ".admins", example: ".admins", access: "All Users" },
  { cmd: ".viewonce", category: "Group", desc: "Reveal view-once media (reply to it)", usage: ".viewonce (reply)", example: ".viewonce", access: "All Users" },
  { cmd: ".poll", category: "Group", desc: "Create a group poll with multiple options", usage: ".poll [question] | [opt1] | [opt2]", example: ".poll Best OS? | Linux | Windows | Mac", access: "All Users" },
  { cmd: ".gclink", category: "Group", desc: "Get the current group invite link", usage: ".gclink", example: ".gclink", access: "Admin Only" },
  { cmd: ".joinlink", category: "Group", desc: "Make bot join a group via invite link", usage: ".joinlink [chat.whatsapp.com/...]", example: ".joinlink https://chat.whatsapp.com/xxx", access: "Owner Only" },
  { cmd: ".listgroups", category: "Group", desc: "List all groups the bot is currently in", usage: ".listgroups", example: ".listgroups", access: "Owner Only" },
  { cmd: ".antidelete", category: "Group", desc: "Toggle anti-delete (resend deleted messages)", usage: ".antidelete on/off", example: ".antidelete on", access: "Admin Only" },
  { cmd: ".report", category: "Group", desc: "Report a user to group admins", usage: ".report @user [reason]", example: ".report @user Sending spam", access: "All Users" },
  { cmd: ".schedule", category: "Group", desc: "Schedule a message to be sent later", usage: ".schedule [time] [message]", example: ".schedule 30s Good morning!", access: "Admin Only" },
  { cmd: ".strike", category: "Group", desc: "Issue a formal strike to a user", usage: ".strike @user", example: ".strike @2347001234567", access: "Admin Only" },
  { cmd: ".warncount", category: "Group", desc: "Check how many warnings a user has", usage: ".warncount @user", example: ".warncount @2347001234567", access: "Admin Only" },
  { cmd: ".kick5", category: "Group", desc: "Kick up to 5 tagged users at once", usage: ".kick5 @u1 @u2 @u3", example: ".kick5 @a @b @c", access: "Admin Only" },
  { cmd: ".grouptag", category: "Group", desc: "Tag only admins or only members", usage: ".grouptag admin/member", example: ".grouptag admin", access: "Admin Only" },
  { cmd: ".timer", category: "Group", desc: "Set auto-delete timer for messages", usage: ".timer [seconds]", example: ".timer 30", access: "Admin Only" },
  { cmd: ".eventnotif", category: "Group", desc: "Toggle event notifications in the group", usage: ".eventnotif on/off", example: ".eventnotif on", access: "Admin Only" },
  { cmd: ".setgcicon", category: "Group", desc: "Set a custom emoji as group icon label", usage: ".setgcicon [emoji]", example: ".setgcicon 🔥", access: "Admin Only" },
  { cmd: ".listusers", category: "Group", desc: "List all users across all groups (requires DB)", usage: ".listusers", example: ".listusers", access: "Owner Only" },
  { cmd: ".resetnumber", category: "Group", desc: "Instructions to reset bot session/number", usage: ".resetnumber", example: ".resetnumber", access: "Owner Only" },
  { cmd: ".welcome", category: "Group", desc: "Toggle welcome messages for new members", usage: ".welcome on/off", example: ".welcome on", access: "Admin Only" },
  { cmd: ".goodbye", category: "Group", desc: "Toggle goodbye messages when members leave", usage: ".goodbye on/off", example: ".goodbye on", access: "Admin Only" },

  // ─── MEDIA (20) ───
  { cmd: ".sticker", category: "Media", desc: "Convert image/video/GIF to WhatsApp sticker", usage: ".sticker (send media)", example: ".sticker", access: "All Users" },
  { cmd: ".toimage", category: "Media", desc: "Convert a sticker to a regular image", usage: ".toimage (reply to sticker)", example: ".toimage", access: "All Users" },
  { cmd: ".attp", category: "Media", desc: "Convert text to animated text sticker", usage: ".attp [text]", example: ".attp Hello World", access: "All Users" },
  { cmd: ".ttp", category: "Media", desc: "Convert text to plain text sticker", usage: ".ttp [text]", example: ".ttp VK911 MINI", access: "All Users" },
  { cmd: ".jpeg", category: "Media", desc: "Convert image to compressed JPEG", usage: ".jpeg (send image)", example: ".jpeg", access: "All Users" },
  { cmd: ".mp4", category: "Media", desc: "Convert video/GIF to MP4 format", usage: ".mp4 (send video)", example: ".mp4", access: "All Users" },
  { cmd: ".togif", category: "Media", desc: "Convert video/sticker to GIF", usage: ".togif (reply to video)", example: ".togif", access: "All Users" },
  { cmd: ".resize", category: "Media", desc: "Resize an image to custom dimensions", usage: ".resize [width]x[height] (send image)", example: ".resize 512x512", access: "All Users" },
  { cmd: ".blur", category: "Media", desc: "Apply blur effect to an image", usage: ".blur (send image)", example: ".blur", access: "All Users" },
  { cmd: ".enhance", category: "Media", desc: "Enhance and upscale image quality", usage: ".enhance (send image)", example: ".enhance", access: "All Users" },
  { cmd: ".removebg", category: "Media", desc: "Remove background from an image (API required)", usage: ".removebg (send image)", example: ".removebg", access: "All Users" },
  { cmd: ".crop", category: "Media", desc: "Crop image to square format", usage: ".crop (send image)", example: ".crop", access: "All Users" },
  { cmd: ".brightness", category: "Media", desc: "Adjust image brightness level", usage: ".brightness [1-200] (send image)", example: ".brightness 150", access: "All Users" },
  { cmd: ".greyscale", category: "Media", desc: "Convert image to black and white", usage: ".greyscale (send image)", example: ".greyscale", access: "All Users" },
  { cmd: ".flip", category: "Media", desc: "Flip image horizontally or vertically", usage: ".flip h/v (send image)", example: ".flip h", access: "All Users" },
  { cmd: ".mirror", category: "Media", desc: "Mirror an image horizontally", usage: ".mirror (send image)", example: ".mirror", access: "All Users" },
  { cmd: ".invert", category: "Media", desc: "Invert colors of an image", usage: ".invert (send image)", example: ".invert", access: "All Users" },
  { cmd: ".compress", category: "Media", desc: "Compress media file to reduce size", usage: ".compress (send media)", example: ".compress", access: "All Users" },
  { cmd: ".watermark", category: "Media", desc: "Add VK911 MINI watermark to an image", usage: ".watermark (send image)", example: ".watermark", access: "All Users" },
  { cmd: ".trim", category: "Media", desc: "Trim a video to specified duration", usage: ".trim [start] [end] (reply to video)", example: ".trim 0 30", access: "All Users" },

  // ─── DOWNLOADER (20) ───
  { cmd: ".ytmp3", category: "Downloader", desc: "Download YouTube video as MP3 audio", usage: ".ytmp3 [YouTube URL or title]", example: ".ytmp3 https://youtube.com/watch?v=xxx", access: "All Users" },
  { cmd: ".ytmp4", category: "Downloader", desc: "Download YouTube video as MP4", usage: ".ytmp4 [YouTube URL or title]", example: ".ytmp4 Blinding Lights", access: "All Users" },
  { cmd: ".play", category: "Downloader", desc: "Search and play a song from YouTube", usage: ".play [song name]", example: ".play Rema Calm Down", access: "All Users" },
  { cmd: ".tiktok", category: "Downloader", desc: "Download TikTok video (no watermark)", usage: ".tiktok [TikTok URL]", example: ".tiktok https://vm.tiktok.com/xxx", access: "All Users" },
  { cmd: ".instagram", category: "Downloader", desc: "Download Instagram reel/post media", usage: ".instagram [Instagram URL]", example: ".instagram https://instagram.com/p/xxx", access: "All Users" },
  { cmd: ".facebook", category: "Downloader", desc: "Download Facebook video", usage: ".facebook [Facebook video URL]", example: ".facebook https://fb.watch/xxx", access: "All Users" },
  { cmd: ".twitter", category: "Downloader", desc: "Download Twitter/X video or GIF", usage: ".twitter [Tweet URL]", example: ".twitter https://twitter.com/x/status/xxx", access: "All Users" },
  { cmd: ".spotify", category: "Downloader", desc: "Search Spotify track and download preview", usage: ".spotify [song name or URL]", example: ".spotify Afrobeats 2025", access: "All Users" },
  { cmd: ".apk", category: "Downloader", desc: "Search and download Android APK file", usage: ".apk [app name]", example: ".apk WhatsApp", access: "All Users" },
  { cmd: ".document", category: "Downloader", desc: "Convert and send media as a document file", usage: ".document (reply to media)", example: ".document", access: "All Users" },
  { cmd: ".pinterest", category: "Downloader", desc: "Download Pinterest image or video", usage: ".pinterest [Pinterest URL]", example: ".pinterest https://pin.it/xxx", access: "All Users" },
  { cmd: ".soundcloud", category: "Downloader", desc: "Download SoundCloud track", usage: ".soundcloud [track URL or name]", example: ".soundcloud Chill Beats", access: "All Users" },
  { cmd: ".gdrive", category: "Downloader", desc: "Download file from Google Drive link", usage: ".gdrive [Google Drive URL]", example: ".gdrive https://drive.google.com/xxx", access: "All Users" },
  { cmd: ".lyric", category: "Downloader", desc: "Get lyrics for any song", usage: ".lyric [song name]", example: ".lyric Ojuelegba Wizkid", access: "All Users" },
  { cmd: ".search", category: "Downloader", desc: "Search YouTube and get top 5 results", usage: ".search [query]", example: ".search Afrobeats mix 2025", access: "All Users" },
  { cmd: ".audio", category: "Downloader", desc: "Extract audio track from a video", usage: ".audio (reply to video)", example: ".audio", access: "All Users" },
  { cmd: ".video", category: "Downloader", desc: "Convert audio to video (static background)", usage: ".video (reply to audio)", example: ".video", access: "All Users" },
  { cmd: ".readcv", category: "Downloader", desc: "Read text content from a PDF or document", usage: ".readcv (send PDF)", example: ".readcv", access: "All Users" },
  { cmd: ".mediafire", category: "Downloader", desc: "Download file from MediaFire link", usage: ".mediafire [MediaFire URL]", example: ".mediafire https://mediafire.com/file/xxx", access: "All Users" },
  { cmd: ".mega", category: "Downloader", desc: "Download file from MEGA.nz link", usage: ".mega [Mega URL]", example: ".mega https://mega.nz/file/xxx", access: "All Users" },

  // ─── FUN (20) ───
  { cmd: ".joke", category: "Fun", desc: "Get a random joke", usage: ".joke", example: ".joke", access: "All Users" },
  { cmd: ".truth", category: "Fun", desc: "Get a random truth question for truth or dare", usage: ".truth", example: ".truth", access: "All Users" },
  { cmd: ".dare", category: "Fun", desc: "Get a random dare challenge", usage: ".dare", example: ".dare", access: "All Users" },
  { cmd: ".8ball", category: "Fun", desc: "Ask the magic 8-ball a yes/no question", usage: ".8ball [question]", example: ".8ball Will Nigeria win the World Cup?", access: "All Users" },
  { cmd: ".roll", category: "Fun", desc: "Roll a dice with custom number of sides", usage: ".roll [sides]", example: ".roll 20", access: "All Users" },
  { cmd: ".quote", category: "Fun", desc: "Get a random motivational/inspirational quote", usage: ".quote", example: ".quote", access: "All Users" },
  { cmd: ".rizz", category: "Fun", desc: "Get a random smooth pickup line", usage: ".rizz", example: ".rizz", access: "All Users" },
  { cmd: ".meme", category: "Fun", desc: "Get a random meme from Reddit", usage: ".meme", example: ".meme", access: "All Users" },
  { cmd: ".rps", category: "Fun", desc: "Play Rock Paper Scissors against the bot", usage: ".rps [rock/paper/scissors]", example: ".rps rock", access: "All Users" },
  { cmd: ".ship", category: "Fun", desc: "Calculate compatibility between two users", usage: ".ship @user1 @user2", example: ".ship @Alice @Bob", access: "All Users" },
  { cmd: ".flip", category: "Fun", desc: "Flip a coin — heads or tails", usage: ".flip", example: ".flip", access: "All Users" },
  { cmd: ".wyr", category: "Fun", desc: "Would you rather — get a random dilemma", usage: ".wyr", example: ".wyr", access: "All Users" },
  { cmd: ".fact", category: "Fun", desc: "Get a random interesting fact", usage: ".fact", example: ".fact", access: "All Users" },
  { cmd: ".roast", category: "Fun", desc: "Roast a tagged user (all in good fun)", usage: ".roast @user", example: ".roast @2347001234567", access: "All Users" },
  { cmd: ".compliment", category: "Fun", desc: "Send a random compliment to a user", usage: ".compliment @user", example: ".compliment @2347001234567", access: "All Users" },
  { cmd: ".trivia", category: "Fun", desc: "Get a random trivia question", usage: ".trivia", example: ".trivia", access: "All Users" },
  { cmd: ".hack", category: "Fun", desc: "Fake hacking animation (for fun)", usage: ".hack @user", example: ".hack @2347001234567", access: "All Users" },
  { cmd: ".kiss", category: "Fun", desc: "Send a kiss GIF to a user", usage: ".kiss @user", example: ".kiss @2347001234567", access: "All Users" },
  { cmd: ".hug", category: "Fun", desc: "Send a hug GIF to a user", usage: ".hug @user", example: ".hug @2347001234567", access: "All Users" },
  { cmd: ".punch", category: "Fun", desc: "Send a punch GIF to a user", usage: ".punch @user", example: ".punch @2347001234567", access: "All Users" },

  // ─── AI (15) ───
  { cmd: ".ai", category: "AI", desc: "Chat with GPT-4o-mini AI assistant", usage: ".ai [question]", example: ".ai Explain quantum physics", access: "All Users" },
  { cmd: ".gpt", category: "AI", desc: "Chat with GPT-4 for longer/smarter responses", usage: ".gpt [prompt]", example: ".gpt Write a business plan for a restaurant", access: "All Users" },
  { cmd: ".gemini", category: "AI", desc: "Chat with Google Gemini 1.5 Flash AI", usage: ".gemini [question]", example: ".gemini What is the future of AI?", access: "All Users" },
  { cmd: ".dalle", category: "AI", desc: "Generate an image with DALL-E 3 AI (OpenAI key required)", usage: ".dalle [description]", example: ".dalle A futuristic Lagos city at night", access: "All Users" },
  { cmd: ".translate", category: "AI", desc: "Translate text to any language", usage: ".translate [lang] [text]", example: ".translate yo Good morning brother", access: "All Users" },
  { cmd: ".summarize", category: "AI", desc: "Summarize a long text or document", usage: ".summarize [text] or reply to message", example: ".summarize (reply to article)", access: "All Users" },
  { cmd: ".fix", category: "AI", desc: "Fix grammar and improve writing in text", usage: ".fix [text]", example: ".fix i went to market yesterday buy thing", access: "All Users" },
  { cmd: ".code", category: "AI", desc: "Generate code from a plain English description", usage: ".code [description]", example: ".code Node.js Express REST API with auth", access: "All Users" },
  { cmd: ".explain", category: "AI", desc: "Explain any topic in simple terms", usage: ".explain [topic]", example: ".explain blockchain in simple terms", access: "All Users" },
  { cmd: ".story", category: "AI", desc: "Generate a creative short story with AI", usage: ".story [prompt]", example: ".story A boy who discovered he could fly", access: "All Users" },
  { cmd: ".poem", category: "AI", desc: "Write a poem on any topic with AI", usage: ".poem [topic]", example: ".poem Lagos hustle and grind", access: "All Users" },
  { cmd: ".essay", category: "AI", desc: "Write a structured essay on a given topic", usage: ".essay [topic]", example: ".essay The importance of education in Africa", access: "All Users" },
  { cmd: ".rename", category: "AI", desc: "Rename a file or sticker with a custom label", usage: ".rename [new name] (reply to file)", example: ".rename my_document", access: "All Users" },
  { cmd: ".lyrics-ai", category: "AI", desc: "Generate song lyrics using AI on a given topic", usage: ".lyrics-ai [topic]", example: ".lyrics-ai heartbreak in Yoruba style", access: "All Users" },
  { cmd: ".react", category: "AI", desc: "Get AI to react/comment on a message or image", usage: ".react (reply to message)", example: ".react", access: "All Users" },

  // ─── UTILITY (20) ───
  { cmd: ".menu", category: "Utility", desc: "Show the full VK911 MINI command menu", usage: ".menu", example: ".menu", access: "All Users" },
  { cmd: ".ping", category: "Utility", desc: "Check bot response speed in milliseconds", usage: ".ping", example: ".ping", access: "All Users" },
  { cmd: ".speed", category: "Utility", desc: "Run an internet speed test from the bot server", usage: ".speed", example: ".speed", access: "All Users" },
  { cmd: ".calc", category: "Utility", desc: "Calculate any math expression", usage: ".calc [expression]", example: ".calc (25 * 4) / 2 + 10", access: "All Users" },
  { cmd: ".time", category: "Utility", desc: "Get current time in any timezone", usage: ".time [timezone]", example: ".time Africa/Lagos", access: "All Users" },
  { cmd: ".weather", category: "Utility", desc: "Get current weather for any city", usage: ".weather [city]", example: ".weather Lagos", access: "All Users" },
  { cmd: ".shorten", category: "Utility", desc: "Shorten a long URL to a shorter link", usage: ".shorten [URL]", example: ".shorten https://google.com/very/long/url", access: "All Users" },
  { cmd: ".qr", category: "Utility", desc: "Generate a QR code from any text or URL", usage: ".qr [text or URL]", example: ".qr https://vk911mini.com", access: "All Users" },
  { cmd: ".base64", category: "Utility", desc: "Encode or decode text in Base64", usage: ".base64 encode/decode [text]", example: ".base64 encode Hello World", access: "All Users" },
  { cmd: ".define", category: "Utility", desc: "Look up the definition of any word", usage: ".define [word]", example: ".define serendipity", access: "All Users" },
  { cmd: ".currency", category: "Utility", desc: "Convert between currencies using live rates", usage: ".currency [amount] [from] to [to]", example: ".currency 100 USD to NGN", access: "All Users" },
  { cmd: ".crypto", category: "Utility", desc: "Get live cryptocurrency price", usage: ".crypto [coin]", example: ".crypto BTC", access: "All Users" },
  { cmd: ".covid", category: "Utility", desc: "Get latest COVID-19 statistics by country", usage: ".covid [country]", example: ".covid Nigeria", access: "All Users" },
  { cmd: ".timer-util", category: "Utility", desc: "Set a countdown timer that pings you when done", usage: ".timer-util [minutes]", example: ".timer-util 5", access: "All Users" },
  { cmd: ".remind", category: "Utility", desc: "Set a reminder that the bot sends at a future time", usage: ".remind [time] [message]", example: ".remind 10m Take your medication", access: "All Users" },
  { cmd: ".encode", category: "Utility", desc: "URL-encode a string", usage: ".encode [text]", example: ".encode Hello World & friends", access: "All Users" },
  { cmd: ".decode", category: "Utility", desc: "URL-decode an encoded string", usage: ".decode [text]", example: ".decode Hello%20World", access: "All Users" },
  { cmd: ".password", category: "Utility", desc: "Generate a strong random password", usage: ".password [length]", example: ".password 16", access: "All Users" },
  { cmd: ".color", category: "Utility", desc: "Get color info and preview from hex code", usage: ".color [#hex]", example: ".color #00ff88", access: "All Users" },
  { cmd: ".uuid", category: "Utility", desc: "Generate a random UUID v4 string", usage: ".uuid", example: ".uuid", access: "All Users" },

  // ─── INFO (15) ───
  { cmd: ".owner", category: "Info", desc: "Show bot owner contact information", usage: ".owner", example: ".owner", access: "All Users" },
  { cmd: ".info", category: "Info", desc: "Show bot information, version, and stats", usage: ".info", example: ".info", access: "All Users" },
  { cmd: ".runtime", category: "Info", desc: "Show how long the bot has been running", usage: ".runtime", example: ".runtime", access: "All Users" },
  { cmd: ".channel", category: "Info", desc: "Get the VK911 MINI official WhatsApp channel link", usage: ".channel", example: ".channel", access: "All Users" },
  { cmd: ".github", category: "Info", desc: "Get the VK911 MINI GitHub repository link", usage: ".github", example: ".github", access: "All Users" },
  { cmd: ".version", category: "Info", desc: "Show current bot version and changelog", usage: ".version", example: ".version", access: "All Users" },
  { cmd: ".support", category: "Info", desc: "Get support group and contact links", usage: ".support", example: ".support", access: "All Users" },
  { cmd: ".alive", category: "Info", desc: "Check if bot is alive with a status message", usage: ".alive", example: ".alive", access: "All Users" },
  { cmd: ".myinfo", category: "Info", desc: "Show your own WhatsApp profile info", usage: ".myinfo", example: ".myinfo", access: "All Users" },
  { cmd: ".userinfo", category: "Info", desc: "Get WhatsApp profile info for any tagged user", usage: ".userinfo @user", example: ".userinfo @2347001234567", access: "All Users" },
  { cmd: ".status", category: "Info", desc: "Check bot server status and health", usage: ".status", example: ".status", access: "All Users" },
  { cmd: ".storage", category: "Info", desc: "Check bot server storage and memory usage", usage: ".storage", example: ".storage", access: "Owner Only" },
  { cmd: ".list", category: "Info", desc: "List all commands in a specific category", usage: ".list [category]", example: ".list Fun", access: "All Users" },
  { cmd: ".help", category: "Info", desc: "Get detailed help for a specific command", usage: ".help [command]", example: ".help sticker", access: "All Users" },
  { cmd: ".about", category: "Info", desc: "Show full bot description and credits", usage: ".about", example: ".about", access: "All Users" },
];
