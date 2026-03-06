import React, { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  AreaChart, Area
} from "recharts";
import { Snowflake, Thermometer, Droplets, Activity, Sun, Moon, Wifi, AlertCircle } from "lucide-react";

// ─── DATA GENERATOR ────────────────────────────────────────────────────────────
const generateLN2Data = (vessel) =>
  Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    s1: parseFloat((-196.2 + Math.random() * 0.5).toFixed(2)),
    s2: parseFloat((-195.8 + Math.random() * 0.8).toFixed(2)),
    room: parseFloat((Math.random() * 7 + 18).toFixed(1)),
    level: Math.floor(Math.random() * 15 + 80),
  }));

// ─── THEME ─────────────────────────────────────────────────────────────────────
const themes = {
  light: {
    bg: "#f0f6ff",
    surface: "#ffffff",
    surfaceAlt: "#f8fbff",
    border: "rgba(14,120,210,0.10)",
    borderStrong: "rgba(14,120,210,0.20)",
    text: "#0a1628",
    textSub: "#5a7299",
    textMuted: "#9ab0cc",
    accent: "#0d6efd",
    accentGlow: "rgba(13,110,253,0.18)",
    gridLine: "#e8f0fb",
    s1: "#0d6efd",
    s2: "#00b4d8",
    room: "#64748b",
    level: "#0096c7",
    statusOk: "#10b981",
    statusWarn: "#f59e0b",
    headerBg: "rgba(255,255,255,0.85)",
    tooltipBg: "rgba(255,255,255,0.97)",
    tooltipBorder: "rgba(14,120,210,0.15)",
    shadow: "0 4px 32px rgba(13,110,253,0.07), 0 1px 4px rgba(0,0,0,0.04)",
    shadowHover: "0 8px 40px rgba(13,110,253,0.13), 0 2px 8px rgba(0,0,0,0.06)",
    toggleBg: "#e8f0fb",
    toggleCircle: "#0d6efd",
  },
  dark: {
    bg: "#070d1a",
    surface: "#0d1526",
    surfaceAlt: "#111d34",
    border: "rgba(56,189,248,0.09)",
    borderStrong: "rgba(56,189,248,0.18)",
    text: "#e8f4ff",
    textSub: "#7bafd4",
    textMuted: "#3d6080",
    accent: "#38bdf8",
    accentGlow: "rgba(56,189,248,0.20)",
    gridLine: "#13233d",
    s1: "#38bdf8",
    s2: "#67e8f9",
    room: "#94a3b8",
    level: "#0ea5e9",
    statusOk: "#34d399",
    statusWarn: "#fbbf24",
    headerBg: "rgba(13,21,38,0.90)",
    tooltipBg: "rgba(13,21,38,0.97)",
    tooltipBorder: "rgba(56,189,248,0.18)",
    shadow: "0 4px 32px rgba(0,0,0,0.40), 0 1px 6px rgba(0,0,0,0.30)",
    shadowHover: "0 8px 48px rgba(56,189,248,0.12), 0 2px 10px rgba(0,0,0,0.40)",
    toggleBg: "#1a2d48",
    toggleCircle: "#38bdf8",
  }
};

// ─── CUSTOM TOOLTIP ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, t, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: t.tooltipBg,
      border: `1px solid ${t.tooltipBorder}`,
      borderRadius: "10px",
      padding: "10px 16px",
      boxShadow: t.shadow,
      fontSize: "13px",
      color: t.text,
    }}>
      <div style={{ color: t.textMuted, marginBottom: 4, fontWeight: 600, fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: "20px", color: payload[0].color }}>
        {payload[0].value}{unit}
      </div>
    </div>
  );
};

// ─── METRIC CARD ───────────────────────────────────────────────────────────────
const MetricCard = ({ title, value, unit, sub, icon, color, glow, t, alert }) => (
  <div style={{
    background: t.surface,
    border: `1px solid ${t.border}`,
    borderRadius: "20px",
    padding: "24px 26px",
    boxShadow: t.shadow,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    position: "relative",
    overflow: "hidden",
    transition: "box-shadow 0.2s, transform 0.2s",
    cursor: "default",
  }}>
    {/* Glow accent */}
    <div style={{
      position: "absolute", top: 0, right: 0,
      width: "80px", height: "80px",
      background: `radial-gradient(circle at top right, ${color}22, transparent 70%)`,
      borderRadius: "0 20px 0 0",
    }} />

    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div style={{
        background: `linear-gradient(135deg, ${color}22, ${color}11)`,
        border: `1px solid ${color}33`,
        borderRadius: "12px",
        padding: "9px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <span style={{ color }}>{icon}</span>
      </div>
      {alert && (
        <div style={{
          display: "flex", alignItems: "center", gap: "4px",
          background: `${t.statusWarn}18`,
          border: `1px solid ${t.statusWarn}44`,
          borderRadius: "20px",
          padding: "3px 10px",
          fontSize: "10px",
          fontWeight: 700,
          color: t.statusWarn,
          letterSpacing: "0.06em"
        }}>
          <AlertCircle size={10} /> WARN
        </div>
      )}
    </div>

    <div>
      <div style={{ fontSize: "11px", fontWeight: 700, color: t.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px" }}>{title}</div>
      <div style={{ fontSize: "34px", fontWeight: 800, color: t.text, lineHeight: 1, letterSpacing: "-0.02em" }}>
        {value}<span style={{ fontSize: "16px", color: t.textSub, fontWeight: 600, marginLeft: "2px" }}>{unit}</span>
      </div>
    </div>
    <div style={{
      display: "flex", alignItems: "center", gap: "6px",
      fontSize: "12px", color: t.textSub
    }}>
      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: t.statusOk, boxShadow: `0 0 6px ${t.statusOk}` }} />
      {sub}
    </div>
  </div>
);

// ─── GRAPH CARD ────────────────────────────────────────────────────────────────
const CHART_HEIGHT = 220;

const GraphCard = ({ title, subtitle, data, dataKey, color, isArea, domain, unit, t }) => {
  const containerRef = React.useRef(null);
  const [chartWidth, setChartWidth] = React.useState(0);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width);
        if (w > 0) setChartWidth(w);
      }
    });
    ro.observe(containerRef.current);
    // Set initial width
    setChartWidth(Math.floor(containerRef.current.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);

  const chartProps = {
    width: chartWidth,
    height: CHART_HEIGHT,
    data,
    margin: { top: 4, right: 4, bottom: 0, left: 0 },
  };

  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: "20px",
      padding: "24px",
      boxShadow: t.shadow,
    }}>
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: t.text, letterSpacing: "-0.01em" }}>{title}</h3>
        <div style={{ fontSize: "12px", color: t.textMuted, marginTop: "3px" }}>{subtitle}</div>
      </div>
      {/* overflow:hidden prevents horizontal scrollbar; width:100% lets ResizeObserver measure correctly */}
      <div ref={containerRef} style={{ width: "100%", overflow: "hidden" }}>
        {chartWidth > 0 && (
          isArea ? (
            <AreaChart {...chartProps}>
              <defs>
                <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 6" vertical={false} stroke={t.gridLine} />
              <XAxis dataKey="time" tick={{ fill: t.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
              <YAxis domain={domain} tick={{ fill: t.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<CustomTooltip t={t} unit={unit} />} />
              <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#grad-${dataKey})`} strokeWidth={2.5} dot={false} />
            </AreaChart>
          ) : (
            <LineChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 6" vertical={false} stroke={t.gridLine} />
              <XAxis dataKey="time" tick={{ fill: t.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
              <YAxis domain={domain} tick={{ fill: t.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} width={42} />
              <Tooltip content={<CustomTooltip t={t} unit={unit} />} />
              <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: color, strokeWidth: 0 }} />
            </LineChart>
          )
        )}
      </div>
    </div>
  );
};

// ─── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function SensorDashboard() {
  const [isDark, setIsDark] = useState(true);
  const [selectedVessel, setSelectedVessel] = useState(0);
  const [data, setData] = useState(() => generateLN2Data("Vessel 1"));
  const [now, setNow] = useState(new Date());
  const [liveTemp, setLiveTemp] = useState(-196.14);
  const [pulse, setPulse] = useState(false);

  const t = isDark ? themes.dark : themes.light;

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
      setLiveTemp(prev => parseFloat((prev + (Math.random() - 0.5) * 0.06).toFixed(2)));
      setPulse(p => !p);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVesselChange = (idx) => {
    setSelectedVessel(idx);
    setData(generateLN2Data(`Vessel ${idx + 1}`));
  };

  const latest = data[data.length - 1] || {};

  return (
    <div style={{
      fontFamily: "'Syne', 'Space Grotesk', system-ui, sans-serif",
      background: t.bg,
      minHeight: "100vh",
      width: "100vw",
      maxWidth: "100vw",
      marginLeft: "calc(-50vw + 50%)",
      padding: "28px 32px",
      boxSizing: "border-box",
      transition: "background 0.35s, color 0.35s",
      color: t.text,
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; min-height: 100vh; margin: 0; padding: 0; overflow-x: hidden; }
        html, body, #root { width: 100% !important; max-width: 100vw !important; margin: 0 !important; padding: 0 !important; overflow-x: hidden; }
        .vessel-btn { transition: all 0.18s ease; }
        .vessel-btn:hover { transform: translateY(-1px); }
        .theme-toggle:hover { transform: scale(1.08); }
        .metric-card:hover { transform: translateY(-2px); }
      `}</style>

      {/* ─── HEADER ─── */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: t.headerBg,
        backdropFilter: "blur(16px)",
        border: `1px solid ${t.border}`,
        borderRadius: "18px",
        padding: "18px 28px",
        marginBottom: "28px",
        boxShadow: t.shadow,
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            background: `linear-gradient(135deg, ${t.accent}, ${isDark ? "#0ea5e9" : "#0096c7"})`,
            padding: "10px",
            borderRadius: "14px",
            boxShadow: `0 4px 16px ${t.accentGlow}`,
            display: "flex",
          }}>
            <Snowflake color="#fff" size={22} />
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: t.text, letterSpacing: "-0.03em", lineHeight: 1 }}>
              LN₂ Cryo<span style={{ color: t.accent }}>Monitor</span>
            </div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: t.textMuted, letterSpacing: "0.2em", marginTop: "3px", textTransform: "uppercase" }}>
              NL Technologies — Real-Time Cryogenic Analysis
            </div>
          </div>
        </div>

        {/* Center: Status Bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
          background: t.surfaceAlt,
          border: `1px solid ${t.border}`,
          borderRadius: "12px",
          padding: "10px 20px",
        }}>
          <StatusPill label="SYSTEM" status="NOMINAL" ok t={t} />
          <div style={{ width: "1px", height: "24px", background: t.border }} />
          <StatusPill label="DATA FEED" status="LIVE" ok t={t} pulse={pulse} />
          <div style={{ width: "1px", height: "24px", background: t.border }} />
          <StatusPill label="ALERT" status="NONE" ok={false} warn={false} t={t} />
        </div>

        {/* Right: Controls */}
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {/* Theme Toggle */}
          <button
            className="theme-toggle"
            onClick={() => setIsDark(!isDark)}
            style={{
              background: t.toggleBg,
              border: `1px solid ${t.border}`,
              borderRadius: "50px",
              padding: "8px 14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: t.text,
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              transition: "all 0.2s",
              boxShadow: `0 2px 8px ${t.accentGlow}`,
            }}
          >
            {isDark ? <Sun size={15} color={t.accent} /> : <Moon size={15} color={t.accent} />}
            {isDark ? "LIGHT" : "DARK"}
          </button>

          {/* Clock */}
          <div style={{
            textAlign: "right",
            borderLeft: `1px solid ${t.border}`,
            paddingLeft: "16px",
          }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "17px", fontWeight: 600, color: t.accent, letterSpacing: "0.04em" }}>
              {now.toLocaleTimeString("en-US", { hour12: false })}
            </div>
            <div style={{ fontSize: "11px", color: t.textMuted, marginTop: "2px" }}>
              {now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            </div>
          </div>
        </div>
      </header>

      {/* ─── VESSEL SELECTOR ─── */}
      <div style={{ marginBottom: "24px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginRight: "4px" }}>
          Select Dewar Unit
        </span>
        {Array.from({ length: 10 }, (_, i) => (
          <button
            key={i}
            className="vessel-btn"
            onClick={() => handleVesselChange(i)}
            style={{
              background: selectedVessel === i
                ? `linear-gradient(135deg, ${t.accent}, ${isDark ? "#0ea5e9" : "#0096c7"})`
                : t.surface,
              border: `1px solid ${selectedVessel === i ? t.accent : t.border}`,
              borderRadius: "10px",
              padding: "7px 16px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 700,
              color: selectedVessel === i ? "#fff" : t.textSub,
              letterSpacing: "0.04em",
              boxShadow: selectedVessel === i ? `0 4px 16px ${t.accentGlow}` : "none",
              transition: "all 0.18s",
            }}
          >
            DU-{String(i + 1).padStart(2, "0")}
          </button>
        ))}
      </div>

      {/* ─── METRIC CARDS ─── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
        marginBottom: "24px",
      }}>
        <MetricCard
          title="Submerged Probe" value={latest.s1 || liveTemp} unit="°C"
          sub="LN₂ Temperature S1" icon={<Snowflake size={18} />}
          color={t.s1} t={t}
        />
        <MetricCard
          title="Vapor Phase Probe" value={latest.s2 || -195.87} unit="°C"
          sub="LN₂ Temperature S2" icon={<Thermometer size={18} />}
          color={t.s2} t={t}
        />
        <MetricCard
          title="Ambient Sensor" value={latest.room || 21.4} unit="°C"
          sub="Room Temperature" icon={<Activity size={18} />}
          color={t.room} t={t}
        />
        <MetricCard
          title="Fill Level" value={latest.level || 87} unit="%"
          sub="Vessel Liquid Volume" icon={<Droplets size={18} />}
          color={t.level} t={t}
          alert={(latest.level || 87) < 82}
        />
      </div>

      {/* ─── CHARTS GRID ─── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
      }}>
        <GraphCard
          title="Cryogenic Stability — S1"
          subtitle="Submerged probe fluctuation over 24h"
          data={data} dataKey="s1" color={t.s1}
          domain={[-197, -195]} unit="°C" t={t}
        />
        <GraphCard
          title="Vapor Phase Stability — S2"
          subtitle="Ullage zone temperature over 24h"
          data={data} dataKey="s2" color={t.s2}
          domain={[-197, -195]} unit="°C" t={t}
        />
        <GraphCard
          title="Ambient Room Temperature"
          subtitle="Environmental monitoring over 24h"
          data={data} dataKey="room" color={t.room}
          domain={[15, 30]} unit="°C" t={t}
        />
        <GraphCard
          title="LN₂ Fill Level"
          subtitle="Vessel liquid volume percentage over 24h"
          data={data} dataKey="level" color={t.level}
          isArea domain={[0, 100]} unit="%" t={t}
        />
      </div>

      {/* ─── FOOTER ─── */}
      <footer style={{
        marginTop: "24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 4px",
      }}>
        <div style={{ fontSize: "11px", color: t.textMuted, letterSpacing: "0.08em" }}>
          NL Technologies · LN₂ Cryo-Monitor v2.0 · Sampling interval: 1 min
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: t.statusOk }}>
          <Wifi size={12} />
          <span style={{ fontWeight: 700, letterSpacing: "0.06em" }}>ALL SENSORS ONLINE</span>
        </div>
      </footer>
    </div>
  );
}

// ─── STATUS PILL ───────────────────────────────────────────────────────────────
const StatusPill = ({ label, status, ok, warn, t, pulse }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
    <div style={{ fontSize: "9px", fontWeight: 700, color: t.textMuted, letterSpacing: "0.14em", textTransform: "uppercase" }}>{label}</div>
    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
      <div style={{
        width: "6px", height: "6px", borderRadius: "50%",
        background: ok ? t.statusOk : (warn === false ? t.textMuted : t.statusWarn),
        boxShadow: ok && pulse !== undefined
          ? `0 0 ${pulse ? "8px" : "4px"} ${t.statusOk}`
          : ok ? `0 0 6px ${t.statusOk}` : "none",
        transition: "box-shadow 0.5s",
      }} />
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "11px", fontWeight: 600,
        color: ok ? t.statusOk : (warn === false ? t.textMuted : t.statusWarn),
        letterSpacing: "0.06em"
      }}>
        {status}
      </span>
    </div>
  </div>
);