import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart
} from "recharts";

// ─── Simulated Data Generator ───────────────────────────────────────────────
const now = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

function generateVesselData() {
  return Array.from({ length: 20 }, (_, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    temp1: parseFloat((-193 + Math.random() * 4).toFixed(2)),
    temp2: parseFloat((-191 + Math.random() * 4).toFixed(2)),
    level: parseFloat((55 + Math.random() * 30).toFixed(1)),
    roomTemp: parseFloat((20 + Math.random() * 5).toFixed(1)),
  }));
}

const VESSELS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Vessel ${String(i + 1).padStart(2, "0")}`,
  status: i === 2 ? "critical" : i === 5 ? "warning" : "normal",
  data: generateVesselData(),
  current: {
    temp1: parseFloat((-193 + Math.random() * 4).toFixed(2)),
    temp2: parseFloat((-191 + Math.random() * 4).toFixed(2)),
    level: parseFloat((55 + Math.random() * 35).toFixed(1)),
    roomTemp: parseFloat((20 + Math.random() * 5).toFixed(1)),
  },
}));
// Force some critical/warning values
VESSELS[2].current.level = 14.3;
VESSELS[2].current.temp1 = -187.2;
VESSELS[5].current.level = 22.7;

// ─── Login Screen ────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      if (user === "admin" && pass === "admin123") {
        onLogin();
      } else {
        setErr("Invalid credentials. Try admin / admin123");
        setLoading(false);
      }
    }, 900);
  };

  return (
    <div style={styles.loginBg}>
      {/* Animated grid lines */}
      <div style={styles.gridOverlay} />
      <div style={styles.loginCard}>
        <div style={styles.loginLogo}>
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
            <circle cx="19" cy="19" r="18" stroke="#00e5ff" strokeWidth="1.5" />
            <circle cx="19" cy="19" r="11" stroke="#00e5ff" strokeWidth="1" strokeDasharray="3 2" />
            <circle cx="19" cy="19" r="4" fill="#00e5ff" />
            <line x1="19" y1="1" x2="19" y2="8" stroke="#00e5ff" strokeWidth="1.5" />
            <line x1="19" y1="30" x2="19" y2="37" stroke="#00e5ff" strokeWidth="1.5" />
          </svg>
        </div>
        <div style={styles.loginTitle}>CRYO<span style={{ color: "#00e5ff" }}>WATCH</span></div>
        <div style={styles.loginSub}>Bio-Sample Monitoring System</div>
        <div style={styles.loginDivider} />
        <div style={styles.loginLabel}>USERNAME</div>
        <input
          style={{ ...styles.loginInput, borderColor: err ? "#ff4444" : "#1e3a5f" }}
          value={user}
          onChange={e => { setUser(e.target.value); setErr(""); }}
          placeholder="admin"
          onKeyDown={e => e.key === "Enter" && handleLogin()}
        />
        <div style={styles.loginLabel}>PASSWORD</div>
        <input
          type="password"
          style={{ ...styles.loginInput, borderColor: err ? "#ff4444" : "#1e3a5f" }}
          value={pass}
          onChange={e => { setPass(e.target.value); setErr(""); }}
          placeholder="••••••••"
          onKeyDown={e => e.key === "Enter" && handleLogin()}
        />
        {err && <div style={styles.loginErr}>{err}</div>}
        <button
          style={{ ...styles.loginBtn, opacity: loading ? 0.7 : 1 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "AUTHENTICATING..." : "LOGIN →"}
        </button>
        <div style={styles.loginHint}>Demo: admin / admin123</div>
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusDot({ status }) {
  const color = status === "critical" ? "#ff3b3b" : status === "warning" ? "#ffb300" : "#00e676";
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: color, marginRight: 6,
      boxShadow: `0 0 6px ${color}`,
      animation: status !== "normal" ? "pulse 1.2s infinite" : "none"
    }} />
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({ icon, label, value, unit, status, sub }) {
  const borderColor = status === "critical" ? "#ff3b3b" : status === "warning" ? "#ffb300" : "#00e5ff33";
  const valueColor = status === "critical" ? "#ff3b3b" : status === "warning" ? "#ffb300" : "#00e5ff";
  return (
    <div style={{ ...styles.metricCard, borderColor }}>
      <div style={styles.metricIcon}>{icon}</div>
      <div style={styles.metricLabel}>{label}</div>
      <div style={{ ...styles.metricValue, color: valueColor }}>
        {value}<span style={styles.metricUnit}>{unit}</span>
      </div>
      {sub && <div style={styles.metricSub}>{sub}</div>}
      {status !== "normal" && (
        <div style={{ ...styles.metricAlert, color: valueColor }}>
          ⚠ {status === "critical" ? "CRITICAL" : "WARNING"}
        </div>
      )}
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, unit }) {
  if (active && payload && payload.length) {
    return (
      <div style={styles.tooltip}>
        <div style={styles.tooltipTime}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, fontSize: 12 }}>
            {p.name}: <b>{p.value}{unit}</b>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

// ─── Sensor Graph ─────────────────────────────────────────────────────────────
function SensorGraph({ title, data, dataKey, color, unit, refValue, refLabel, icon }) {
  return (
    <div style={styles.graphCard}>
      <div style={styles.graphHeader}>
        <span style={styles.graphIcon}>{icon}</span>
        <span style={styles.graphTitle}>{title}</span>
        <span style={{ ...styles.graphUnit, color }}>{unit}</span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#0d2035" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: "#4a7fa5", fontSize: 9 }} tickLine={false} axisLine={false} interval={4} />
          <YAxis tick={{ fill: "#4a7fa5", fontSize: 9 }} tickLine={false} axisLine={false} />
          {refValue && (
            <ReferenceLine y={refValue} stroke="#ff3b3b" strokeDasharray="4 2"
              label={{ value: refLabel, fill: "#ff3b3b", fontSize: 9, position: "insideTopRight" }} />
          )}
          <Tooltip content={<CustomTooltip unit={unit} />} />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2}
            fill={`url(#grad-${dataKey})`} dot={false} name={title} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function Dashboard({ onLogout }) {
  const [selectedVessel, setSelectedVessel] = useState(VESSELS[0]);
  const [vessels, setVessels] = useState(VESSELS);
  const [tick, setTick] = useState(0);
  const [time, setTime] = useState(now());

  // Live update simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(now());
      setTick(t => t + 1);
      setVessels(prev => prev.map(v => {
        const newReading = {
          time: now(),
          temp1: parseFloat((-193 + Math.random() * 6).toFixed(2)),
          temp2: parseFloat((-191 + Math.random() * 6).toFixed(2)),
          level: parseFloat((v.current.level + (Math.random() - 0.52) * 0.8).toFixed(1)),
          roomTemp: parseFloat((v.current.roomTemp + (Math.random() - 0.5) * 0.3).toFixed(1)),
        };
        const newData = [...v.data.slice(-19), newReading];
        const newCurrent = {
          temp1: newReading.temp1,
          temp2: newReading.temp2,
          level: Math.max(5, Math.min(100, newReading.level)),
          roomTemp: newReading.roomTemp,
        };
        const status =
          newCurrent.level < 15 || newCurrent.temp1 > -188
            ? "critical"
            : newCurrent.level < 25 || newCurrent.temp1 > -190
            ? "warning"
            : "normal";
        return { ...v, data: newData, current: newCurrent, status };
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Keep selected vessel in sync
  useEffect(() => {
    setSelectedVessel(prev => vessels.find(v => v.id === prev.id) || vessels[0]);
  }, [vessels]);

  const v = selectedVessel;
  const temp1Status = v.current.temp1 > -188 ? "critical" : v.current.temp1 > -190 ? "warning" : "normal";
  const temp2Status = v.current.temp2 > -188 ? "critical" : v.current.temp2 > -190 ? "warning" : "normal";
  const levelStatus = v.current.level < 15 ? "critical" : v.current.level < 25 ? "warning" : "normal";
  const roomStatus = v.current.roomTemp > 25 || v.current.roomTemp < 18 ? "warning" : "normal";

  return (
    <div style={styles.dashBg}>
      <div style={styles.gridOverlay} />

      {/* ── Top Bar ── */}
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          <svg width="26" height="26" viewBox="0 0 38 38" fill="none" style={{ marginRight: 8 }}>
            <circle cx="19" cy="19" r="18" stroke="#00e5ff" strokeWidth="1.5" />
            <circle cx="19" cy="19" r="4" fill="#00e5ff" />
          </svg>
          <span style={styles.brandName}>CRYO<span style={{ color: "#00e5ff" }}>WATCH</span></span>
          <span style={styles.brandSub}>Bio-Sample Monitoring</span>
        </div>
        <div style={styles.topCenter}>
          <span style={styles.liveIndicator}>
            <span style={styles.liveDot} />
            LIVE
          </span>
          <span style={styles.topTime}>{time}</span>
        </div>
        <div style={styles.topRight}>
          <span style={styles.adminBadge}>ADMIN</span>
          <button style={styles.logoutBtn} onClick={onLogout}>LOGOUT</button>
        </div>
      </div>

      <div style={styles.mainLayout}>
        {/* ── Vessel Sidebar ── */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarTitle}>VESSELS</div>
          <div style={styles.sidebarCount}>{vessels.length} monitored</div>
          {vessels.map(vessel => (
            <div
              key={vessel.id}
              style={{
                ...styles.vesselItem,
                background: selectedVessel.id === vessel.id
                  ? "linear-gradient(90deg, #003d5c 0%, #001e30 100%)"
                  : "transparent",
                borderColor: selectedVessel.id === vessel.id
                  ? "#00e5ff"
                  : vessel.status === "critical" ? "#ff3b3b44"
                  : vessel.status === "warning" ? "#ffb30044"
                  : "#1e3a5f44",
              }}
              onClick={() => setSelectedVessel(vessel)}
            >
              <div style={styles.vesselItemTop}>
                <StatusDot status={vessel.status} />
                <span style={styles.vesselItemName}>{vessel.name}</span>
              </div>
              <div style={styles.vesselItemStats}>
                <span style={{ color: "#4a7fa5" }}>T1:</span>
                <span style={{ color: vessel.status === "critical" ? "#ff3b3b" : "#a0d4f0" }}>
                  {vessel.current.temp1}°
                </span>
                <span style={{ color: "#4a7fa5", marginLeft: 6 }}>LVL:</span>
                <span style={{ color: vessel.current.level < 20 ? "#ff3b3b" : "#a0d4f0" }}>
                  {vessel.current.level}%
                </span>
              </div>
            </div>
          ))}

          {/* Alerts summary */}
          <div style={styles.alertSummary}>
            <div style={styles.alertSummaryTitle}>ALERTS</div>
            {vessels.filter(v => v.status !== "normal").length === 0 ? (
              <div style={styles.noAlerts}>✓ All Clear</div>
            ) : (
              vessels.filter(v => v.status !== "normal").map(v => (
                <div key={v.id} style={{
                  ...styles.alertItem,
                  borderColor: v.status === "critical" ? "#ff3b3b" : "#ffb300",
                  color: v.status === "critical" ? "#ff3b3b" : "#ffb300",
                }}>
                  <StatusDot status={v.status} />
                  {v.name} — {v.status.toUpperCase()}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Main Content ── */}
        <div style={styles.content}>
          {/* Vessel Header */}
          <div style={styles.vesselHeader}>
            <div>
              <div style={styles.vesselTitle}>
                <StatusDot status={v.status} />
                {v.name}
              </div>
              <div style={styles.vesselSubtitle}>Real-time cryogenic monitoring · Updates every 4s</div>
            </div>
            <div style={{
              ...styles.vesselStatusBadge,
              background: v.status === "critical" ? "#ff3b3b22" : v.status === "warning" ? "#ffb30022" : "#00e67622",
              color: v.status === "critical" ? "#ff3b3b" : v.status === "warning" ? "#ffb300" : "#00e676",
              borderColor: v.status === "critical" ? "#ff3b3b" : v.status === "warning" ? "#ffb300" : "#00e676",
            }}>
              {v.status.toUpperCase()}
            </div>
          </div>

          {/* ── 4 Metric Cards ── */}
          <div style={styles.metricsRow}>
            <MetricCard
              icon="🌡"
              label="TEMPERATURE — SENSOR 1"
              value={v.current.temp1}
              unit="°C"
              status={temp1Status}
              sub="Cryogenic probe (inside vessel)"
            />
            <MetricCard
              icon="🌡"
              label="TEMPERATURE — SENSOR 2"
              value={v.current.temp2}
              unit="°C"
              status={temp2Status}
              sub="Redundancy probe (inside vessel)"
            />
            <MetricCard
              icon="🏠"
              label="ROOM TEMPERATURE"
              value={v.current.roomTemp}
              unit="°C"
              status={roomStatus}
              sub="Ambient air — target 18–25°C"
            />
            <MetricCard
              icon="💧"
              label="LN2 LEVEL"
              value={v.current.level}
              unit="%"
              status={levelStatus}
              sub={
                levelStatus === "critical" ? "⚠ REFILL IMMEDIATELY"
                : levelStatus === "warning" ? "↓ Schedule refill soon"
                : "✓ Level nominal"
              }
            />
          </div>

          {/* Level Bar */}
          <div style={styles.levelBarContainer}>
            <div style={styles.levelBarLabel}>
              <span>LN2 FILL LEVEL</span>
              <span style={{
                color: levelStatus === "critical" ? "#ff3b3b" : levelStatus === "warning" ? "#ffb300" : "#00e5ff"
              }}>{v.current.level}%</span>
            </div>
            <div style={styles.levelBarBg}>
              <div style={{
                ...styles.levelBarFill,
                width: `${v.current.level}%`,
                background: levelStatus === "critical"
                  ? "linear-gradient(90deg, #ff3b3b, #ff6b6b)"
                  : levelStatus === "warning"
                  ? "linear-gradient(90deg, #ffb300, #ffd54f)"
                  : "linear-gradient(90deg, #00b4d8, #00e5ff)",
              }} />
              <div style={styles.levelMark20} />
              <div style={styles.levelMark5} />
            </div>
            <div style={styles.levelBarMarks}>
              <span style={{ color: "#ff3b3b", fontSize: 9 }}>5% EMERGENCY</span>
              <span style={{ color: "#ffb300", fontSize: 9 }}>20% CRITICAL</span>
              <span style={{ color: "#4a7fa5", fontSize: 9 }}>100%</span>
            </div>
          </div>

          {/* ── 4 Graphs ── */}
          <div style={styles.graphsGrid}>
            <SensorGraph
              title="Sensor 1 Temperature"
              data={v.data}
              dataKey="temp1"
              color="#00e5ff"
              unit="°C"
              refValue={-190}
              refLabel="Alert: -190°C"
              icon="🌡"
            />
            <SensorGraph
              title="Sensor 2 Temperature"
              data={v.data}
              dataKey="temp2"
              color="#7c4dff"
              unit="°C"
              refValue={-190}
              refLabel="Alert: -190°C"
              icon="🌡"
            />
            <SensorGraph
              title="LN2 Level"
              data={v.data}
              dataKey="level"
              color="#00e676"
              unit="%"
              refValue={20}
              refLabel="Critical: 20%"
              icon="💧"
            />
            <SensorGraph
              title="Room Temperature"
              data={v.data}
              dataKey="roomTemp"
              color="#ffb300"
              unit="°C"
              refValue={25}
              refLabel="Max: 25°C"
              icon="🏠"
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #010e1a; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 2px; }
      `}</style>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  loginBg: {
    minHeight: "100vh", background: "#010e1a",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Courier New', monospace", position: "relative", overflow: "hidden",
  },
  gridOverlay: {
    position: "absolute", inset: 0, pointerEvents: "none",
    backgroundImage: "linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
  },
  loginCard: {
    background: "linear-gradient(145deg, #021828 0%, #010e1a 100%)",
    border: "1px solid #1e3a5f", borderRadius: 4, padding: "44px 40px",
    width: 360, position: "relative", zIndex: 1,
    boxShadow: "0 0 60px rgba(0,229,255,0.07), 0 0 0 1px #1e3a5f",
  },
  loginLogo: { display: "flex", justifyContent: "center", marginBottom: 16 },
  loginTitle: {
    textAlign: "center", fontSize: 28, fontWeight: "bold",
    color: "#e0f7fa", letterSpacing: 6, marginBottom: 4,
  },
  loginSub: {
    textAlign: "center", fontSize: 10, color: "#4a7fa5",
    letterSpacing: 2, marginBottom: 20, textTransform: "uppercase",
  },
  loginDivider: { height: 1, background: "linear-gradient(90deg, transparent, #1e3a5f, transparent)", marginBottom: 24 },
  loginLabel: { fontSize: 9, color: "#4a7fa5", letterSpacing: 3, marginBottom: 6, textTransform: "uppercase" },
  loginInput: {
    width: "100%", background: "#010e1a", border: "1px solid #1e3a5f",
    color: "#a0d4f0", padding: "10px 12px", fontSize: 13, marginBottom: 16,
    borderRadius: 2, outline: "none", fontFamily: "'Courier New', monospace",
    transition: "border-color 0.2s",
  },
  loginErr: { color: "#ff4444", fontSize: 11, marginBottom: 12, textAlign: "center" },
  loginBtn: {
    width: "100%", background: "linear-gradient(90deg, #003d5c, #005a87)",
    border: "1px solid #00e5ff", color: "#00e5ff", padding: "12px",
    fontSize: 12, letterSpacing: 3, cursor: "pointer", borderRadius: 2,
    fontFamily: "'Courier New', monospace", transition: "all 0.2s",
    marginTop: 4,
  },
  loginHint: { textAlign: "center", fontSize: 10, color: "#1e3a5f", marginTop: 14 },

  // Dashboard
  dashBg: {
    minHeight: "100vh", background: "#010e1a",
    fontFamily: "'Courier New', monospace", position: "relative", color: "#e0f7fa",
  },
  topBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 24px", height: 52, borderBottom: "1px solid #1e3a5f",
    background: "#010e1a", position: "sticky", top: 0, zIndex: 100,
  },
  topLeft: { display: "flex", alignItems: "center" },
  brandName: { fontSize: 18, fontWeight: "bold", letterSpacing: 4, color: "#e0f7fa" },
  brandSub: { fontSize: 9, color: "#4a7fa5", letterSpacing: 2, marginLeft: 14, marginTop: 2 },
  topCenter: { display: "flex", alignItems: "center", gap: 16 },
  liveIndicator: {
    display: "flex", alignItems: "center", fontSize: 9, color: "#00e676",
    letterSpacing: 2, border: "1px solid #00e67633", padding: "3px 10px", borderRadius: 2,
  },
  liveDot: {
    width: 6, height: 6, borderRadius: "50%", background: "#00e676",
    marginRight: 6, animation: "blink 1s infinite",
  },
  topTime: { fontSize: 12, color: "#4a7fa5", letterSpacing: 1 },
  topRight: { display: "flex", alignItems: "center", gap: 12 },
  adminBadge: {
    fontSize: 9, color: "#00e5ff", border: "1px solid #00e5ff33",
    padding: "3px 10px", borderRadius: 2, letterSpacing: 2,
  },
  logoutBtn: {
    background: "transparent", border: "1px solid #1e3a5f", color: "#4a7fa5",
    padding: "4px 12px", fontSize: 9, cursor: "pointer", letterSpacing: 2,
    borderRadius: 2, fontFamily: "'Courier New', monospace",
  },

  mainLayout: { display: "flex", height: "calc(100vh - 52px)" },

  // Sidebar
  sidebar: {
    width: 200, borderRight: "1px solid #1e3a5f", padding: "16px 0",
    overflowY: "auto", flexShrink: 0, background: "#00080f",
  },
  sidebarTitle: { fontSize: 9, color: "#4a7fa5", letterSpacing: 3, padding: "0 16px 4px" },
  sidebarCount: { fontSize: 9, color: "#1e3a5f", padding: "0 16px 12px", borderBottom: "1px solid #0d2035" },
  vesselItem: {
    padding: "10px 16px", cursor: "pointer", borderLeft: "2px solid transparent",
    transition: "all 0.15s", marginBottom: 1,
  },
  vesselItemTop: { display: "flex", alignItems: "center", marginBottom: 4 },
  vesselItemName: { fontSize: 11, color: "#a0d4f0", letterSpacing: 1 },
  vesselItemStats: { fontSize: 9, display: "flex", gap: 4, paddingLeft: 14 },
  alertSummary: { marginTop: 20, padding: "12px 16px", borderTop: "1px solid #0d2035" },
  alertSummaryTitle: { fontSize: 9, color: "#4a7fa5", letterSpacing: 3, marginBottom: 8 },
  noAlerts: { fontSize: 10, color: "#00e676" },
  alertItem: {
    fontSize: 9, padding: "5px 8px", borderLeft: "2px solid",
    marginBottom: 4, display: "flex", alignItems: "center",
  },

  // Content
  content: { flex: 1, overflowY: "auto", padding: "20px 24px" },
  vesselHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 20,
  },
  vesselTitle: { fontSize: 18, fontWeight: "bold", letterSpacing: 3, display: "flex", alignItems: "center" },
  vesselSubtitle: { fontSize: 9, color: "#4a7fa5", letterSpacing: 1, marginTop: 4 },
  vesselStatusBadge: {
    fontSize: 10, padding: "6px 16px", border: "1px solid",
    letterSpacing: 3, borderRadius: 2,
  },

  // Metric Cards
  metricsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 },
  metricCard: {
    background: "linear-gradient(145deg, #021828, #010e1a)",
    border: "1px solid", borderRadius: 3, padding: "16px",
    transition: "border-color 0.3s",
  },
  metricIcon: { fontSize: 18, marginBottom: 8 },
  metricLabel: { fontSize: 8, color: "#4a7fa5", letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" },
  metricValue: { fontSize: 26, fontWeight: "bold", lineHeight: 1, letterSpacing: 1 },
  metricUnit: { fontSize: 12, marginLeft: 3, opacity: 0.7 },
  metricSub: { fontSize: 8, color: "#1e3a5f", marginTop: 8, letterSpacing: 1 },
  metricAlert: { fontSize: 9, marginTop: 6, letterSpacing: 2, fontWeight: "bold" },

  // Level bar
  levelBarContainer: { marginBottom: 16, background: "#00080f", border: "1px solid #1e3a5f", padding: "12px 16px", borderRadius: 3 },
  levelBarLabel: { display: "flex", justifyContent: "space-between", fontSize: 9, letterSpacing: 2, color: "#4a7fa5", marginBottom: 8 },
  levelBarBg: { height: 10, background: "#0d2035", borderRadius: 5, overflow: "visible", position: "relative" },
  levelBarFill: { height: "100%", borderRadius: 5, transition: "width 1s ease, background 0.5s", position: "relative" },
  levelMark20: {
    position: "absolute", left: "20%", top: -4, bottom: -4,
    width: 1, background: "#ff3b3b55",
  },
  levelMark5: {
    position: "absolute", left: "5%", top: -4, bottom: -4,
    width: 1, background: "#ff3b3b33",
  },
  levelBarMarks: { display: "flex", justifyContent: "space-between", marginTop: 6 },

  // Graphs
  graphsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  graphCard: {
    background: "linear-gradient(145deg, #021828, #010e1a)",
    border: "1px solid #1e3a5f", borderRadius: 3, padding: "14px 16px",
  },
  graphHeader: { display: "flex", alignItems: "center", marginBottom: 10 },
  graphIcon: { fontSize: 13, marginRight: 8 },
  graphTitle: { fontSize: 9, color: "#a0d4f0", letterSpacing: 2, flex: 1, textTransform: "uppercase" },
  graphUnit: { fontSize: 9, letterSpacing: 1 },

  // Tooltip
  tooltip: {
    background: "#021828", border: "1px solid #1e3a5f",
    padding: "8px 12px", borderRadius: 3, fontSize: 11,
  },
  tooltipTime: { color: "#4a7fa5", fontSize: 9, marginBottom: 4, letterSpacing: 1 },
};

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;
  return <Dashboard onLogout={() => setLoggedIn(false)} />;
}
