import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  AreaChart, Area
} from "recharts";
import {
  Snowflake, Thermometer, Droplets, Activity, Sun, Moon,
  Wifi, AlertCircle, LogOut, User, Mail, AtSign
} from "lucide-react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const themes = {
  light: {
    bg: "#f0f6ff", surface: "#ffffff", surfaceAlt: "#f8fbff",
    border: "rgba(14,120,210,0.10)", text: "#0a1628", textSub: "#5a7299", textMuted: "#9ab0cc",
    accent: "#0d6efd", accent2: "#0096c7", accentGlow: "rgba(13,110,253,0.18)",
    gridLine: "#e8f0fb", s1: "#0d6efd", s2: "#00b4d8", room: "#64748b", level: "#0096c7",
    statusOk: "#10b981", statusWarn: "#f59e0b",
    headerBg: "rgba(255,255,255,0.85)", tooltipBg: "rgba(255,255,255,0.97)", tooltipBorder: "rgba(14,120,210,0.15)",
    shadow: "0 4px 32px rgba(13,110,253,0.07), 0 1px 4px rgba(0,0,0,0.04)",
    toggleBg: "#e8f0fb", sidebarBg: "#ffffff", sidebarBorder: "rgba(14,120,210,0.12)",
    inputBg: "#f0f6ff", inputBorder: "#d0e2ff", inputFocusBorder: "#0d6efd", inputFocusShadow: "rgba(13,110,253,0.15)",
  },
  dark: {
    bg: "#070d1a", surface: "#0d1526", surfaceAlt: "#111d34",
    border: "rgba(56,189,248,0.09)", text: "#e8f4ff", textSub: "#7bafd4", textMuted: "#3d6080",
    accent: "#38bdf8", accent2: "#0ea5e9", accentGlow: "rgba(56,189,248,0.20)",
    gridLine: "#13233d", s1: "#38bdf8", s2: "#67e8f9", room: "#94a3b8", level: "#0ea5e9",
    statusOk: "#34d399", statusWarn: "#fbbf24",
    headerBg: "rgba(13,21,38,0.90)", tooltipBg: "rgba(13,21,38,0.97)", tooltipBorder: "rgba(56,189,248,0.18)",
    shadow: "0 4px 32px rgba(0,0,0,0.40), 0 1px 6px rgba(0,0,0,0.30)",
    toggleBg: "#1a2d48", sidebarBg: "#0d1526", sidebarBorder: "rgba(56,189,248,0.10)",
    inputBg: "#111d34", inputBorder: "rgba(56,189,248,0.15)", inputFocusBorder: "#38bdf8", inputFocusShadow: "rgba(56,189,248,0.15)",
  }
};

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { width: 100%; min-height: 100vh; overflow-x: hidden; }
  body { font-family: 'DM Sans', sans-serif; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes dropIn { from { opacity:0; transform:translateY(-8px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes slideIn { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
  .fade-up { animation: fadeUp 0.5s cubic-bezier(.22,.68,0,1.1) both; }
  .slide-in { animation: slideIn 0.4s cubic-bezier(.22,.68,0,1.1) both; }
  .btn-hover:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
  .btn-hover:active:not(:disabled) { transform: translateY(0); }
  .sidebar-btn:hover { opacity: 0.85; transform: translateY(-1px); }
  .vessel-btn:hover { opacity: 0.85; }
`;

// ─── DATA GENERATOR ───────────────────────────────────────────────────────────
const generateLN2Data = () =>
  Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    s1: parseFloat((-196.2 + Math.random() * 0.5).toFixed(2)),
    s2: parseFloat((-195.8 + Math.random() * 0.8).toFixed(2)),
    room: parseFloat((Math.random() * 7 + 18).toFixed(1)),
    level: Math.floor(Math.random() * 15 + 80),
  }));

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN PAGE
// USER MENU (avatar button + dropdown)
// ═══════════════════════════════════════════════════════════════════════════════
function UserMenu({ user, isDark, setIsDark, onLogout, t }) {
  const navigate = useNavigate();
  const initial = (user.name || user.username || "U")[0].toUpperCase();
  const [open, setOpen] = useState(false);
  const sessionStart = useRef(new Date());
  const [elapsed, setElapsed] = useState("00:00:00");
  const menuRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.floor((new Date() - sessionStart.current) / 1000);
      setElapsed(`${String(Math.floor(diff / 3600)).padStart(2,"0")}:${String(Math.floor((diff % 3600) / 60)).padStart(2,"0")}:${String(diff % 60).padStart(2,"0")}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const InfoRow = ({ icon, label, value }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 0", borderBottom: `1px solid ${t.border}` }}>
      <div style={{ color: t.accent, marginTop: "1px", flexShrink: 0 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: "9px", fontWeight: 700, color: t.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "2px" }}>{label}</div>
        <div style={{ fontSize: "12px", fontWeight: 600, color: t.text, wordBreak: "break-all", lineHeight: 1.4 }}>{value}</div>
      </div>
    </div>
  );

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      {/* Avatar trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        title={user.name || user.username}
        style={{
          width: "36px", height: "36px", borderRadius: "50%",
          background: open
            ? `linear-gradient(135deg, ${t.accent}, ${t.accent2})`
            : `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
          border: `2px solid ${open ? t.accent : "transparent"}`,
          outline: open ? `3px solid ${t.accentGlow}` : "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Syne', sans-serif", fontSize: "14px", fontWeight: 800, color: "#fff",
          cursor: "pointer",
          boxShadow: `0 2px 12px ${t.accentGlow}`,
          transition: "all 0.2s", flexShrink: 0,
        }}
      >
        {initial}
      </button>

      {/* Dropdown panel — rendered via portal-like fixed positioning below the avatar */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 12px)",
          right: 0,
          width: "268px",
          background: isDark ? "#0d1526" : "#ffffff",
          border: `1px solid ${isDark ? "rgba(56,189,248,0.18)" : "rgba(14,120,210,0.14)"}`,
          borderRadius: "18px",
          boxShadow: isDark
            ? "0 24px 64px rgba(0,0,0,0.65), 0 6px 20px rgba(0,0,0,0.45)"
            : "0 24px 64px rgba(13,110,253,0.16), 0 6px 20px rgba(0,0,0,0.10)",
          zIndex: 9999,
          overflow: "visible",
          animation: "dropIn 0.22s cubic-bezier(.22,.68,0,1.2) both",
        }}>

          {/* Arrow pointer */}
          <div style={{
            position: "absolute", top: "-7px", right: "12px",
            width: "14px", height: "14px",
            background: isDark ? "#0d1526" : "#ffffff",
            border: `1px solid ${isDark ? "rgba(56,189,248,0.18)" : "rgba(14,120,210,0.14)"}`,
            borderBottom: "none", borderRight: "none",
            transform: "rotate(45deg)",
            borderRadius: "2px 0 0 0",
          }} />

          {/* Inner container with overflow:hidden for rounded corners on content */}
          <div style={{ borderRadius: "18px", overflow: "hidden" }}>

            {/* Top gradient bar */}
            <div style={{ height: "3px", background: `linear-gradient(90deg, ${t.accent}, ${t.accent2})` }} />

            {/* Profile section */}
            <div style={{
              padding: "18px 18px 15px",
              background: isDark
                ? "linear-gradient(135deg, rgba(56,189,248,0.06) 0%, transparent 100%)"
                : "linear-gradient(135deg, rgba(13,110,253,0.04) 0%, transparent 100%)",
              borderBottom: `1px solid ${isDark ? "rgba(56,189,248,0.08)" : "rgba(14,120,210,0.07)"}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "13px" }}>
                <div style={{
                  width: "50px", height: "50px", borderRadius: "50%", flexShrink: 0,
                  background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Syne', sans-serif", fontSize: "21px", fontWeight: 800, color: "#fff",
                  boxShadow: `0 4px 16px ${t.accentGlow}`,
                  border: `2px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.8)"}`,
                }}>{initial}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "15px", fontWeight: 800, color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.01em" }}>
                    {user.name || user.username}
                  </div>
                  <div style={{ fontSize: "11px", color: t.textMuted, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.email || `${user.username}@nl-tech.com`}
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "6px", background: isDark ? "rgba(52,211,153,0.12)" : "rgba(16,185,129,0.1)", borderRadius: "20px", padding: "2px 8px", border: `1px solid ${t.statusOk}30` }}>
                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: t.statusOk, boxShadow: `0 0 5px ${t.statusOk}` }} />
                    <span style={{ fontSize: "9px", color: t.statusOk, fontWeight: 700, letterSpacing: "0.06em" }}>ONLINE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div style={{ padding: "12px 18px", borderBottom: `1px solid ${isDark ? "rgba(56,189,248,0.07)" : "rgba(14,120,210,0.07)"}` }}>
              {[
                { icon: <AtSign size={12} />, label: "Username", value: user.username || user.name },
                { icon: <Mail size={12} />, label: "Email", value: user.email || "—" },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "5px 0" }}>
                  <div style={{ width: "26px", height: "26px", borderRadius: "8px", background: isDark ? "rgba(56,189,248,0.08)" : "rgba(13,110,253,0.07)", display: "flex", alignItems: "center", justifyContent: "center", color: t.accent, flexShrink: 0 }}>{icon}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "9px", fontWeight: 700, color: t.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: t.textSub, marginTop: "1px", wordBreak: "break-all" }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Session */}
            <div style={{ padding: "10px 18px 12px", borderBottom: `1px solid ${isDark ? "rgba(56,189,248,0.07)" : "rgba(14,120,210,0.07)"}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "9px", fontWeight: 700, color: t.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "2px" }}>Session</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "20px", fontWeight: 700, color: t.accent, letterSpacing: "0.05em" }}>{elapsed}</div>
              </div>
              <div style={{ fontSize: "9px", fontWeight: 700, color: t.textMuted, textAlign: "right" }}>
                <div style={{ letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "2px" }}>Role</div>
                <div style={{ fontSize: "11px", color: t.textSub, fontWeight: 600 }}>Operator</div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: "10px 10px 10px" }}>
              <button onClick={() => setIsDark(!isDark)} style={{
                width: "100%", padding: "10px 12px", marginBottom: "5px",
                background: "transparent",
                border: `1px solid ${isDark ? "rgba(56,189,248,0.1)" : "rgba(14,120,210,0.1)"}`,
                borderRadius: "11px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "10px",
                color: t.text, fontSize: "13px", fontWeight: 600,
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(56,189,248,0.07)" : "rgba(13,110,253,0.05)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ display: "flex", alignItems: "center", color: t.accent }}>{isDark ? <Sun size={15} /> : <Moon size={15} />}</span>
                {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              </button>

              <button onClick={() => {
                setOpen(false);
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("user");
                if (onLogout) onLogout();
                navigate("/login", { replace: true });
              }} style={{
                width: "100%", padding: "10px 12px",
                background: "transparent",
                border: "1px solid rgba(239,68,68,0.15)",
                borderRadius: "11px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "10px",
                color: "#ef4444", fontSize: "13px", fontWeight: 600,
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.07)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>

          </div>{/* end inner container */}
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
const CustomTooltip = ({ active, payload, label, t, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`, borderRadius: "10px", padding: "10px 16px", boxShadow: t.shadow, fontSize: "13px", color: t.text }}>
      <div style={{ color: t.textMuted, marginBottom: 4, fontWeight: 600, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: "20px", color: payload[0].color }}>{payload[0].value}{unit}</div>
    </div>
  );
};

const MetricCard = ({ title, value, unit, sub, icon, color, t, warn }) => (
  <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "18px", padding: "20px 22px", boxShadow: t.shadow, display: "flex", flexDirection: "column", gap: "9px", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 0, right: 0, width: "70px", height: "70px", background: `radial-gradient(circle at top right, ${color}22, transparent 70%)`, borderRadius: "0 18px 0 0" }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div style={{ background: `${color}18`, border: `1px solid ${color}28`, borderRadius: "11px", padding: "8px", display: "flex" }}>
        <span style={{ color }}>{icon}</span>
      </div>
      {warn && <div style={{ display: "flex", alignItems: "center", gap: "4px", background: `${t.statusWarn}18`, border: `1px solid ${t.statusWarn}44`, borderRadius: "20px", padding: "2px 9px", fontSize: "9px", fontWeight: 700, color: t.statusWarn }}><AlertCircle size={9} /> WARN</div>}
    </div>
    <div>
      <div style={{ fontSize: "9px", fontWeight: 700, color: t.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "3px" }}>{title}</div>
      <div style={{ fontSize: "30px", fontWeight: 800, color: t.text, lineHeight: 1, letterSpacing: "-0.02em" }}>
        {value}<span style={{ fontSize: "13px", color: t.textSub, fontWeight: 600, marginLeft: "2px" }}>{unit}</span>
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: t.textSub }}>
      <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: t.statusOk, boxShadow: `0 0 5px ${t.statusOk}` }} />{sub}
    </div>
  </div>
);

const CHART_HEIGHT = 200;
const GraphCard = ({ title, subtitle, data, dataKey, color, isArea, domain, unit, t }) => {
  const ref = useRef(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(entries => { const cw = Math.floor(entries[0].contentRect.width); if (cw > 0) setW(cw); });
    ro.observe(ref.current);
    setW(Math.floor(ref.current.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);
  const cp = { width: w, height: CHART_HEIGHT, data, margin: { top: 4, right: 4, bottom: 0, left: 0 } };
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "18px", padding: "20px 22px", boxShadow: t.shadow }}>
      <h3 style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 700, color: t.text }}>{title}</h3>
      <div style={{ fontSize: "10px", color: t.textMuted, marginBottom: "14px" }}>{subtitle}</div>
      <div ref={ref} style={{ width: "100%", overflow: "hidden" }}>
        {w > 0 && (isArea ? (
          <AreaChart {...cp}>
            <defs><linearGradient id={`g-${dataKey}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.26} /><stop offset="100%" stopColor={color} stopOpacity={0.02} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 6" vertical={false} stroke={t.gridLine} />
            <XAxis dataKey="time" tick={{ fill: t.textMuted, fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
            <YAxis domain={domain} tick={{ fill: t.textMuted, fontSize: 9 }} axisLine={false} tickLine={false} width={34} />
            <Tooltip content={<CustomTooltip t={t} unit={unit} />} />
            <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#g-${dataKey})`} strokeWidth={2.5} dot={false} />
          </AreaChart>
        ) : (
          <LineChart {...cp}>
            <CartesianGrid strokeDasharray="3 6" vertical={false} stroke={t.gridLine} />
            <XAxis dataKey="time" tick={{ fill: t.textMuted, fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
            <YAxis domain={domain} tick={{ fill: t.textMuted, fontSize: 9 }} axisLine={false} tickLine={false} width={40} />
            <Tooltip content={<CustomTooltip t={t} unit={unit} />} />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: color, strokeWidth: 0 }} />
          </LineChart>
        ))}
      </div>
    </div>
  );
};

const StatusPill = ({ label, status, ok, warn, t, pulse }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
    <div style={{ fontSize: "8px", fontWeight: 700, color: t.textMuted, letterSpacing: "0.14em", textTransform: "uppercase" }}>{label}</div>
    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
      <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: ok ? t.statusOk : (warn === false ? t.textMuted : t.statusWarn), boxShadow: ok ? `0 0 ${pulse ? "7px" : "3px"} ${t.statusOk}` : "none", transition: "box-shadow 0.5s" }} />
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", fontWeight: 600, color: ok ? t.statusOk : (warn === false ? t.textMuted : t.statusWarn), letterSpacing: "0.06em" }}>{status}</span>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function DashboardPage({ user, isDark, setIsDark, onLogout }) {
  // If no user prop passed, read from localStorage (when accessed via React Router)
  if (!user) {
    try { user = JSON.parse(localStorage.getItem("user") || "{}"); } catch { user = {}; }
    if (!user.username && !user.name) user = { name: "User", username: "user", email: "" };
  }
  const t = isDark ? themes.dark : themes.light;
  const [selectedVessel, setSelectedVessel] = useState(0);
  const [data, setData] = useState(() => generateLN2Data());
  const [now, setNow] = useState(new Date());
  const [liveTemp, setLiveTemp] = useState(-196.14);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
      setLiveTemp(p => parseFloat((p + (Math.random() - 0.5) * 0.06).toFixed(2)));
      setPulse(p => !p);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const latest = data[data.length - 1] || {};

  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: t.bg, transition: "background 0.35s, color 0.35s" }}>
      <style>{GLOBAL_CSS}</style>

      <div style={{ padding: "22px 26px", overflowX: "hidden" }}>
        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: t.headerBg, backdropFilter: "blur(16px)", border: `1px solid ${t.border}`, borderRadius: "15px", padding: "13px 22px", marginBottom: "18px", boxShadow: t.shadow, position: "relative", zIndex: 100, overflow: "visible" }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`, padding: "8px", borderRadius: "10px", display: "flex", boxShadow: `0 4px 12px ${t.accentGlow}` }}>
              <Snowflake color="#fff" size={16} />
            </div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "17px", fontWeight: 800, color: t.text, letterSpacing: "-0.02em", lineHeight: 1 }}>
                LN₂ Cryo<span style={{ color: t.accent }}>Monitor</span>
              </div>
              <div style={{ fontSize: "9px", color: t.textMuted, marginTop: "2px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Real-Time Cryogenic Analysis</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: "10px", padding: "8px 16px" }}>
              <StatusPill label="SYSTEM" status="NOMINAL" ok t={t} />
              <div style={{ width: "1px", height: "20px", background: t.border }} />
              <StatusPill label="DATA FEED" status="LIVE" ok t={t} pulse={pulse} />
              <div style={{ width: "1px", height: "20px", background: t.border }} />
              <StatusPill label="ALERT" status="NONE" ok={false} warn={false} t={t} />
            </div>
            <div style={{ borderLeft: `1px solid ${t.border}`, paddingLeft: "16px", textAlign: "right" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "15px", fontWeight: 600, color: t.accent }}>{now.toLocaleTimeString("en-US", { hour12: false })}</div>
              <div style={{ fontSize: "9px", color: t.textMuted, marginTop: "2px" }}>{now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</div>
            </div>
            {/* Avatar / user menu */}
            <UserMenu user={user} isDark={isDark} setIsDark={setIsDark} onLogout={onLogout} t={t} />
          </div>
        </header>

        {/* Vessel selector */}
        <div style={{ display: "flex", gap: "7px", alignItems: "center", flexWrap: "wrap", marginBottom: "16px" }}>
          <span style={{ fontSize: "9px", fontWeight: 700, color: t.textMuted, letterSpacing: "0.16em", textTransform: "uppercase", marginRight: "4px" }}>Dewar Unit</span>
          {Array.from({ length: 10 }, (_, i) => (
            <button key={i} className="vessel-btn" onClick={() => { setSelectedVessel(i); setData(generateLN2Data()); }} style={{
              background: selectedVessel === i ? `linear-gradient(135deg, ${t.accent}, ${t.accent2})` : t.surface,
              border: `1px solid ${selectedVessel === i ? t.accent : t.border}`,
              borderRadius: "8px", padding: "5px 12px", cursor: "pointer",
              fontSize: "10px", fontWeight: 700, color: selectedVessel === i ? "#fff" : t.textSub,
              boxShadow: selectedVessel === i ? `0 3px 12px ${t.accentGlow}` : "none",
              transition: "all 0.15s",
            }}>DU-{String(i + 1).padStart(2, "0")}</button>
          ))}
        </div>

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "14px" }}>
          <MetricCard title="Submerged Probe" value={latest.s1 || liveTemp} unit="°C" sub="LN₂ Temp S1" icon={<Snowflake size={16} />} color={t.s1} t={t} />
          <MetricCard title="Vapor Phase Probe" value={latest.s2 || -195.87} unit="°C" sub="LN₂ Temp S2" icon={<Thermometer size={16} />} color={t.s2} t={t} />
          <MetricCard title="Ambient Sensor" value={latest.room || 21.4} unit="°C" sub="Room Temperature" icon={<Activity size={16} />} color={t.room} t={t} />
          <MetricCard title="Fill Level" value={latest.level || 87} unit="%" sub="Vessel Volume" icon={<Droplets size={16} />} color={t.level} t={t} warn={(latest.level || 87) < 82} />
        </div>

        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <GraphCard title="Cryogenic Stability — S1" subtitle="Submerged probe fluctuation over 24h" data={data} dataKey="s1" color={t.s1} domain={[-197, -195]} unit="°C" t={t} />
          <GraphCard title="Vapor Phase Stability — S2" subtitle="Ullage zone temperature over 24h" data={data} dataKey="s2" color={t.s2} domain={[-197, -195]} unit="°C" t={t} />
          <GraphCard title="Ambient Room Temperature" subtitle="Environmental monitoring over 24h" data={data} dataKey="room" color={t.room} domain={[15, 30]} unit="°C" t={t} />
          <GraphCard title="LN₂ Fill Level" subtitle="Vessel liquid volume percentage over 24h" data={data} dataKey="level" color={t.level} isArea domain={[0, 100]} unit="%" t={t} />
        </div>

        <footer style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "10px", color: t.textMuted }}>NL Technologies · LN₂ Cryo-Monitor v2.0 · 1 min sampling interval</div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: t.statusOk }}>
            <Wifi size={11} /><span style={{ fontWeight: 700, letterSpacing: "0.06em" }}>ALL SENSORS ONLINE</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SENSOR DASHBOARD — default export used by App.tsx <Route path="/dashboard">
// Reads user from localStorage (saved by LoginPage on successful login)
// ═══════════════════════════════════════════════════════════════════════════════
export default function SensorDashboard() {
  const [isDark, setIsDark] = useState(true);

  // Read user written by LoginPage after successful /api/login/ response
  let user = null;
  try {
    const raw = localStorage.getItem("user");
    if (raw) user = JSON.parse(raw);
  } catch { /* ignore */ }
  if (!user || (!user.username && !user.name)) {
    user = { name: "User", username: "user", email: "" };
  }

  return (
    <DashboardPage
      user={user}
      isDark={isDark}
      setIsDark={setIsDark}
      onLogout={() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
      }}
    />
  );
}