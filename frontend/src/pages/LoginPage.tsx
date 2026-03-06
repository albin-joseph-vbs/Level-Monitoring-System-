import React, { useState, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:8000/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface User { id: number; username: string; email: string; name: string; }
interface ApiResponse { success: boolean; message: string; access?: string; refresh?: string; user?: User; }
type Panel = "login" | "register" | "forgot" | "success";
type AlertType = "error" | "success" | "info";
interface AlertState { type: AlertType; message: string; }

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg:               "#070d1a",
  surface:          "#0d1526",
  surfaceAlt:       "#111d34",
  border:           "rgba(56,189,248,0.09)",
  borderStrong:     "rgba(56,189,248,0.16)",
  borderFocus:      "#38bdf8",
  text:             "#e8f4ff",
  textSub:          "#7bafd4",
  textMuted:        "#3d6080",
  accent:           "#38bdf8",
  accent2:          "#0ea5e9",
  accentGlow:       "rgba(56,189,248,0.22)",
  statusOk:         "#34d399",
  gridLine:         "#13233d",
  inputBg:          "#0a1220",
  inputBorder:      "rgba(56,189,248,0.14)",
  inputFocusShadow: "rgba(56,189,248,0.14)",
  errorBg:          "rgba(239,68,68,0.08)",
  errorBorder:      "rgba(239,68,68,0.25)",
  errorText:        "#f87171",
  infoBg:           "rgba(56,189,248,0.08)",
  infoBorder:       "rgba(56,189,248,0.22)",
  infoText:         "#7dd3fc",
  successBg:        "rgba(52,211,153,0.08)",
  successBorder:    "rgba(52,211,153,0.25)",
  successText:      "#34d399",
};

// ─── Logger ───────────────────────────────────────────────────────────────────
const log = {
  success: (m: string, d?: unknown) => console.log(`%c[NL ✅] ${m}`, "color:#34d399;font-weight:bold;", d ?? ""),
  error:   (m: string, d?: unknown) => console.error(`%c[NL ❌] ${m}`, "color:#f87171;font-weight:bold;", d ?? ""),
  layout:  () => console.log(`%c[Viewport] ${window.innerWidth}×${window.innerHeight}`, "background:#0d1526;color:#38bdf8;padding:3px 8px;border-radius:4px;"),
};

// ─── API ──────────────────────────────────────────────────────────────────────
async function apiLogin(username: string, password: string): Promise<ApiResponse> {
  try {
    const res  = await fetch(`${API_BASE}/login/`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ username, password }) });
    const data = await res.json();
    if (res.ok && data.access) {
      localStorage.setItem("access_token",  data.access);
      localStorage.setItem("refresh_token", data.refresh ?? "");
      localStorage.setItem("user", JSON.stringify(data.user ?? { username, name: username, email: "" }));
      return { success: true, message: data.message || "Welcome back!", ...data };
    }
    return { success: false, message: data.message || "Invalid credentials." };
  } catch { return { success: false, message: "Connection error." }; }
}
async function apiRegister(name: string, email: string, username: string, password: string): Promise<ApiResponse> {
  try {
    const res  = await fetch(`${API_BASE}/register/`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ name, email, username, password }) });
    const data = await res.json();
    if (res.ok && data.success) return { success: true, message: data.message };
    return { success: false, message: data.message || "Registration failed." };
  } catch { return { success: false, message: "Server unreachable." }; }
}
async function apiForgotPassword(email: string): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_BASE}/forgot-password/`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ email }) });
    if (res.ok) return { success: true, message: "Reset link sent to your email." };
    return { success: false, message: "Failed to send reset link." };
  } catch { return { success: false, message: "Server error." }; }
}

// ─── Password Strength ────────────────────────────────────────────────────────
function getStrength(val: string) {
  if (!val) return { w:"0%", c:"transparent", label:"" };
  let s = 0;
  if (val.length >= 6) s++; if (val.length >= 10) s++;
  if (/[A-Z]/.test(val)) s++; if (/[0-9]/.test(val)) s++; if (/[^A-Za-z0-9]/.test(val)) s++;
  return [
    { w:"20%", c:"#ef4444", label:"Very weak"  },
    { w:"40%", c:"#f97316", label:"Weak"        },
    { w:"60%", c:"#eab308", label:"Fair"        },
    { w:"80%", c:"#84cc16", label:"Strong"      },
    { w:"100%",c:"#34d399", label:"Very strong" },
  ][Math.min(s - 1, 4)];
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const IUser   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const ILock   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IMail   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IAt     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>;
const IEye    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IEyeOff = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IArrow  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>;
const ICheck  = () => <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IAlertI = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

const ISnowflake = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2l3 3-3 3-3-3z"/>
    <path d="M12 22l3-3-3-3-3 3z"/>
    <path d="M2 12l3 3 3-3-3-3z"/>
    <path d="M22 12l-3 3-3-3 3-3z"/>
    <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);
const IMonitor = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
const IShield  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IWifi    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></svg>;

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <span style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.25)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
);

// ─── Alert ────────────────────────────────────────────────────────────────────
const Alert: React.FC<{ alert: AlertState | null }> = ({ alert }) => {
  if (!alert) return null;
  const map = {
    error:   { bg: T.errorBg,   border: T.errorBorder,   color: T.errorText   },
    success: { bg: T.successBg, border: T.successBorder, color: T.successText },
    info:    { bg: T.infoBg,    border: T.infoBorder,    color: T.infoText    },
  };
  const s = map[alert.type];
  return (
    <div style={{ background:s.bg, border:`1px solid ${s.border}`, color:s.color, padding:"11px 14px", borderRadius:10, fontSize:13.5, fontWeight:500, marginBottom:18, display:"flex", alignItems:"flex-start", gap:9 }}>
      <span style={{ flexShrink:0, marginTop:1 }}><IAlertI /></span>
      <span>{alert.message}</span>
    </div>
  );
};

// ─── Field ────────────────────────────────────────────────────────────────────
interface FieldProps {
  label: string; id: string; type: "text"|"email"|"password";
  placeholder: string; value: string; onChange: (v: string) => void;
  icon: React.ReactNode; showToggle?: boolean; showPw?: boolean;
  onToggle?: () => void; extra?: React.ReactNode; autoComplete?: string;
}
const Field: React.FC<FieldProps> = ({ label, id, type, placeholder, value, onChange, icon, showToggle, showPw, onToggle, extra, autoComplete }) => {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ marginBottom:14 }}>
      <label htmlFor={id} style={{ display:"block", fontSize:11, fontWeight:700, color: focused ? T.accent : T.textMuted, letterSpacing:"0.11em", textTransform:"uppercase", marginBottom:7, transition:"color 0.2s" }}>
        {label}
      </label>
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute", left:15, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color: focused ? T.accent : T.textMuted, display:"flex", transition:"color 0.2s" }}>{icon}</span>
        <input
          id={id}
          type={showToggle ? (showPw ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          style={{
            width:"100%", height:50, padding:"0 46px 0 44px",
            fontFamily:"'DM Sans',sans-serif", fontSize:15, color:T.text,
            background: T.inputBg,
            border:`1.5px solid ${focused ? T.borderFocus : T.inputBorder}`,
            borderRadius:11, outline:"none",
            boxShadow: focused ? `0 0 0 3px ${T.inputFocusShadow}` : "none",
            transition:"all 0.2s", boxSizing:"border-box" as const,
          }}
        />
        {showToggle && (
          <button type="button" onClick={onToggle} style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:T.textMuted, padding:4, borderRadius:5, display:"flex" }}>
            {showPw ? <IEyeOff /> : <IEye />}
          </button>
        )}
      </div>
      {extra}
    </div>
  );
};

// ─── StatusPill ───────────────────────────────────────────────────────────────
const StatusPill: React.FC<{ label: string; status: string; ok?: boolean }> = ({ label, status, ok = true }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
    <div style={{ fontSize:8, fontWeight:700, color:T.textMuted, letterSpacing:"0.15em", textTransform:"uppercase" }}>{label}</div>
    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
      <div style={{ width:5, height:5, borderRadius:"50%", background: ok ? T.statusOk : T.textMuted, boxShadow: ok ? `0 0 7px ${T.statusOk}` : "none" }} />
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color: ok ? T.statusOk : T.textMuted, letterSpacing:"0.08em" }}>{status}</span>
    </div>
  </div>
);

// ─── Feature row ─────────────────────────────────────────────────────────────
const Feature: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div style={{ display:"flex", alignItems:"flex-start", gap:14, padding:"14px 0", borderBottom:`1px solid ${T.border}` }}>
    <div style={{ width:38, height:38, borderRadius:11, background:`rgba(56,189,248,0.07)`, border:`1px solid rgba(56,189,248,0.13)`, display:"flex", alignItems:"center", justifyContent:"center", color:T.accent, flexShrink:0 }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize:13.5, fontWeight:700, color:T.text, marginBottom:3 }}>{title}</div>
      <div style={{ fontSize:12, color:T.textMuted, lineHeight:1.55 }}>{desc}</div>
    </div>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [panel,         setPanel]         = useState<Panel>("login");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw,   setShowLoginPw]   = useState(false);
  const [loginAlert,    setLoginAlert]    = useState<AlertState|null>(null);
  const [loginLoading,  setLoginLoading]  = useState(false);

  const [regName,     setRegName]     = useState("");
  const [regEmail,    setRegEmail]    = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPw,   setShowRegPw]   = useState(false);
  const [regAlert,    setRegAlert]    = useState<AlertState|null>(null);
  const [regLoading,  setRegLoading]  = useState(false);

  const [forgotEmail,   setForgotEmail]   = useState("");
  const [forgotAlert,   setForgotAlert]   = useState<AlertState|null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const [now,        setNow]        = useState(new Date());

  const strength = getStrength(regPassword);

  React.useEffect(() => {
    log.layout();
    window.addEventListener("resize", log.layout);
    fetch(`${API_BASE}/health/`).then(r => r.json()).then(d => log.success("Django reachable", d)).catch(() => log.error("Django NOT reachable"));
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => { window.removeEventListener("resize", log.layout); clearInterval(clock); };
  }, []);

  const goTo = (p: Panel) => { setPanel(p); setLoginAlert(null); setRegAlert(null); setForgotAlert(null); };

  const handleLogin = async () => {
    if (!loginUsername || !loginPassword) { setLoginAlert({ type:"error", message:"Please fill in all fields." }); return; }
    setLoginLoading(true);
    const res = await apiLogin(loginUsername, loginPassword);
    setLoginLoading(false);
    if (res.success) { log.success("Redirecting to dashboard"); navigate("/dashboard", { replace: true }); }
    else setLoginAlert({ type:"error", message: res.message });
  };
  const handleRegister = async () => {
    if (!regName||!regEmail||!regUsername||!regPassword) { setRegAlert({ type:"error", message:"Please fill in all fields." }); return; }
    setRegLoading(true);
    const res = await apiRegister(regName, regEmail, regUsername, regPassword);
    setRegLoading(false);
    if (res.success) { setSuccessMsg(res.message); setPanel("success"); }
    else setRegAlert({ type:"error", message: res.message });
  };
  const handleForgot = async () => {
    if (!forgotEmail) { setForgotAlert({ type:"error", message:"Please enter your email." }); return; }
    setForgotLoading(true);
    const res = await apiForgotPassword(forgotEmail);
    setForgotLoading(false);
    if (res.success) setForgotAlert({ type:"info", message: res.message });
    else setForgotAlert({ type:"error", message: res.message });
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter") return;
    if (panel==="login")    handleLogin();
    if (panel==="register") handleRegister();
    if (panel==="forgot")   handleForgot();
  };

  const btnPrimary: React.CSSProperties = {
    width:"100%", height:52,
    background:`linear-gradient(135deg, ${T.accent} 0%, ${T.accent2} 100%)`,
    color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:700,
    border:"none", borderRadius:11, cursor:"pointer",
    boxShadow:`0 4px 20px ${T.accentGlow}`,
    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
    letterSpacing:"0.05em", transition:"all 0.2s",
  };
  const btnSecondary: React.CSSProperties = {
    width:"100%", height:50,
    background:"transparent", color:T.accent,
    fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:600,
    border:`1.5px solid ${T.inputBorder}`, borderRadius:11, cursor:"pointer",
    marginTop:8, transition:"all 0.2s", letterSpacing:"0.03em",
  };
  const btnBack: React.CSSProperties = {
    display:"inline-flex", alignItems:"center", gap:6, background:"none",
    border:`1px solid ${T.border}`, cursor:"pointer",
    fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, color:T.textSub,
    marginBottom:20, padding:"6px 14px", borderRadius:8, transition:"all 0.2s",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width:100%; height:100%; overflow:hidden; }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideR  { from { opacity:0; transform:translateX(12px); } to { opacity:1; transform:translateX(0); } }
        @keyframes gridPan { from { background-position:0 0; } to { background-position:28px 28px; } }
        .nl-left  { animation: fadeIn 0.55s cubic-bezier(.22,.68,0,1.1) both; }
        .nl-right { animation: fadeIn 0.55s cubic-bezier(.22,.68,0,1.1) 0.08s both; }
        .nl-panel { animation: slideR 0.28s cubic-bezier(.22,.68,0,1.1) both; }
        .nl-primary:hover:not(:disabled) { transform:translateY(-1px); filter:brightness(1.1); box-shadow:0 10px 32px rgba(56,189,248,0.38) !important; }
        .nl-primary:active:not(:disabled){ transform:translateY(0); }
        .nl-secondary:hover { border-color:${T.accent} !important; background:rgba(56,189,248,0.06) !important; }
        .nl-back:hover      { border-color:${T.accent} !important; color:${T.accent} !important; }
        .nl-link:hover      { opacity:0.7; text-decoration:underline; }
        input::placeholder  { color:${T.textMuted}; font-size:14px; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(56,189,248,0.18); border-radius:2px; }
      `}</style>

      <div onKeyDown={onKey} style={{ fontFamily:"'DM Sans',sans-serif", background:T.bg, width:"100vw", height:"100vh", display:"flex", overflow:"hidden", position:"fixed", top:0, left:0 }}>

        {/* ══════════════════════════════════════════
            LEFT — Brand panel
        ══════════════════════════════════════════ */}
        <div className="nl-left" style={{
          width:"46%", minWidth:420, height:"100%",
          background:"linear-gradient(155deg, #0b1829 0%, #070d1a 55%, #08121f 100%)",
          borderRight:`1px solid ${T.borderStrong}`,
          display:"flex", flexDirection:"column",
          padding:"52px 56px",
          position:"relative", overflow:"hidden", flexShrink:0,
        }}>

          {/* Animated dot grid */}
          <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle, rgba(56,189,248,0.06) 1px, transparent 1px)`, backgroundSize:"28px 28px", animation:"gridPan 10s linear infinite", pointerEvents:"none" }} />

          {/* Glow blobs */}
          <div style={{ position:"absolute", top:-220, left:-180, width:620, height:620, background:`radial-gradient(circle, rgba(13,110,253,0.13) 0%, transparent 65%)`, borderRadius:"50%", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:-200, right:-120, width:520, height:520, background:`radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 65%)`, borderRadius:"50%", pointerEvents:"none" }} />

          {/* Decorative rings bottom-right */}
          <div style={{ position:"absolute", bottom:40, right:-100, width:360, height:360, borderRadius:"50%", border:`1px solid rgba(56,189,248,0.06)`, pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:0,  right:-150, width:480, height:480, borderRadius:"50%", border:`1px solid rgba(56,189,248,0.035)`, pointerEvents:"none" }} />

          {/* Content */}
          <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", height:"100%" }}>

            {/* Logo */}
            <div style={{
              width:76, height:76, borderRadius:22,
              background:`linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:`0 10px 36px ${T.accentGlow}, 0 0 0 1px rgba(56,189,248,0.18)`,
              marginBottom:32,
            }}>
              <ISnowflake />
            </div>

            {/* Brand name */}
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:44, fontWeight:800, color:T.text, letterSpacing:"-0.03em", lineHeight:1.0, marginBottom:8 }}>
              LN₂ Cryo<span style={{ color:T.accent }}>Monitor</span>
            </div>

            <div style={{ fontSize:11, fontWeight:700, color:T.textMuted, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:22 }}>
              NL Technologies Pvt Ltd
            </div>

            {/* Accent rule */}
            <div style={{ width:56, height:3, borderRadius:99, background:`linear-gradient(90deg, ${T.accent}, ${T.accent2})`, marginBottom:26 }} />

            {/* Tagline */}
            <div style={{ fontSize:15.5, color:T.textSub, lineHeight:1.72, maxWidth:340, marginBottom:44 }}>
              Real-time cryogenic monitoring and analysis platform for liquid nitrogen storage management.
            </div>

            {/* Feature list */}
            <div style={{ flex:1 }}>
              <Feature icon={<IMonitor />} title="Live Sensor Dashboard"  desc="24/7 temperature & fill-level monitoring across all Dewar units" />
              <Feature icon={<IShield />}  title="Secure Operator Access" desc="Role-based authentication with encrypted session management"      />
              <Feature icon={<IWifi />}    title="Real-Time Data Feed"    desc="Sub-second sensor polling with instant alert notifications"       />
            </div>

            {/* Status bar */}
            <div style={{ marginTop:36, background:"rgba(10,18,32,0.75)", backdropFilter:"blur(14px)", border:`1px solid ${T.borderStrong}`, borderRadius:14, padding:"15px 22px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", gap:22, alignItems:"center" }}>
                <StatusPill label="System"  status="NOMINAL" ok />
                <div style={{ width:1, height:22, background:T.border }} />
                <StatusPill label="Network" status="ONLINE"  ok />
                <div style={{ width:1, height:22, background:T.border }} />
                <StatusPill label="Sensors" status="LIVE"    ok />
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:19, fontWeight:600, color:T.accent, lineHeight:1 }}>{now.toLocaleTimeString("en-US",{hour12:false})}</div>
                <div style={{ fontSize:10, color:T.textMuted, marginTop:3, letterSpacing:"0.04em" }}>{now.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</div>
              </div>
            </div>

          </div>
        </div>

        {/* ══════════════════════════════════════════
            RIGHT — Form panel
        ══════════════════════════════════════════ */}
        <div className="nl-right" style={{
          flex:1, height:"100%", display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          padding:"40px 52px", overflowY:"auto", position:"relative",
          background:`radial-gradient(ellipse at 70% 30%, rgba(56,189,248,0.04) 0%, transparent 60%), ${T.bg}`,
        }}>

          <div style={{ width:"100%", maxWidth:430, position:"relative", zIndex:1 }}>

            {/* Thin accent top bar */}
            <div style={{ height:3, borderRadius:"6px 6px 0 0", background:`linear-gradient(90deg, ${T.accent}, ${T.accent2})` }} />

            {/* Form card */}
            <div style={{
              background:"rgba(11,18,34,0.94)", backdropFilter:"blur(22px)",
              border:`1px solid ${T.borderStrong}`, borderTop:"none",
              borderRadius:"0 0 20px 20px",
              boxShadow:`0 36px 90px rgba(0,0,0,0.58), 0 8px 24px rgba(56,189,248,0.06)`,
              padding:"38px 42px 42px",
              position:"relative", overflow:"hidden",
            }}>

              {/* Top-right glow inside card */}
              <div style={{ position:"absolute", top:0, right:0, width:200, height:200, background:`radial-gradient(circle at top right, rgba(56,189,248,0.06), transparent 65%)`, pointerEvents:"none" }} />

              {/* ── LOGIN ── */}
              {panel==="login" && (
                <div className="nl-panel">
                  <div style={{ marginBottom:26 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:T.accent, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:10 }}>Operator Access</div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:33, fontWeight:800, color:T.text, letterSpacing:"-0.03em", lineHeight:1.08 }}>Welcome back</div>
                    <div style={{ fontSize:14.5, color:T.textSub, marginTop:9, lineHeight:1.55 }}>Sign in to access the monitoring system</div>
                  </div>
                  <Alert alert={loginAlert} />
                  <Field label="Username" id="lu" type="text"     placeholder="Enter your username" value={loginUsername} onChange={setLoginUsername} icon={<IUser />} autoComplete="username" />
                  <Field label="Password" id="lp" type="password" placeholder="Enter your password" value={loginPassword} onChange={setLoginPassword} icon={<ILock />} showToggle showPw={showLoginPw} onToggle={() => setShowLoginPw(!showLoginPw)} autoComplete="current-password" />
                  <div style={{ display:"flex", justifyContent:"flex-end", marginTop:-4, marginBottom:20 }}>
                    <button className="nl-link" onClick={() => goTo("forgot")} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, color:T.accent, padding:0 }}>
                      Forgot password?
                    </button>
                  </div>
                  <button className="nl-primary" style={{ ...btnPrimary, opacity: loginLoading?0.65:1, cursor: loginLoading?"not-allowed":"pointer" }} onClick={handleLogin} disabled={loginLoading}>
                    {loginLoading ? <><Spinner /> Authenticating...</> : "Sign In"}
                  </button>
                  <div style={{ display:"flex", alignItems:"center", gap:12, margin:"18px 0", color:T.textMuted, fontSize:11 }}>
                    <div style={{ flex:1, height:1, background:T.border }} />
                    <span style={{ fontWeight:700, letterSpacing:"0.08em" }}>OR</span>
                    <div style={{ flex:1, height:1, background:T.border }} />
                  </div>
                  <button className="nl-secondary" style={btnSecondary} onClick={() => goTo("register")}>Create a new account</button>
                </div>
              )}

              {/* ── REGISTER ── */}
              {panel==="register" && (
                <div className="nl-panel">
                  <button className="nl-back" style={btnBack} onClick={() => goTo("login")}><IArrow /> Back to Login</button>
                  <div style={{ marginBottom:20 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:T.accent, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:10 }}>New Operator</div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:33, fontWeight:800, color:T.text, letterSpacing:"-0.03em" }}>Create Account</div>
                    <div style={{ fontSize:14.5, color:T.textSub, marginTop:9 }}>Join NL Technologies</div>
                  </div>
                  <Alert alert={regAlert} />
                  <Field label="Full Name"     id="rn" type="text"     placeholder="Your full name"          value={regName}     onChange={setRegName}     icon={<IUser />} />
                  <Field label="Email Address" id="re" type="email"    placeholder="you@example.com"          value={regEmail}    onChange={setRegEmail}    icon={<IMail />} />
                  <Field label="Username"      id="ru" type="text"     placeholder="Choose a username"        value={regUsername} onChange={setRegUsername} icon={<IAt />}   />
                  <Field
                    label="Password" id="rp" type="password" placeholder="Create a strong password"
                    value={regPassword} onChange={setRegPassword} icon={<ILock />}
                    showToggle showPw={showRegPw} onToggle={() => setShowRegPw(!showRegPw)} autoComplete="new-password"
                    extra={regPassword ? (
                      <div style={{ marginTop:8 }}>
                        <div style={{ height:4, borderRadius:99, background:T.gridLine, overflow:"hidden" }}>
                          <div style={{ height:"100%", borderRadius:99, background:strength?.c, width:strength?.w, transition:"width 0.35s,background 0.35s" }} />
                        </div>
                        <div style={{ fontSize:11, marginTop:5, color:strength?.c, fontWeight:600 }}>{strength?.label}</div>
                      </div>
                    ) : undefined}
                  />
                  <button className="nl-primary" style={{ ...btnPrimary, opacity:regLoading?0.65:1 }} onClick={handleRegister} disabled={regLoading}>
                    {regLoading ? <><Spinner /> Please wait...</> : "Create Account"}
                  </button>
                  <div style={{ textAlign:"center", marginTop:16, fontSize:13.5, color:T.textSub }}>
                    Already have an account?{" "}
                    <button className="nl-link" onClick={() => goTo("login")} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:700, color:T.accent, padding:0 }}>Sign in</button>
                  </div>
                </div>
              )}

              {/* ── FORGOT ── */}
              {panel==="forgot" && (
                <div className="nl-panel">
                  <button className="nl-back" style={btnBack} onClick={() => goTo("login")}><IArrow /> Back to Login</button>
                  <div style={{ marginBottom:20 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:T.accent, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:10 }}>Password Recovery</div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:33, fontWeight:800, color:T.text, letterSpacing:"-0.03em" }}>Reset Password</div>
                    <div style={{ fontSize:14.5, color:T.textSub, marginTop:9, lineHeight:1.6 }}>Enter your registered email and we'll send you a reset link.</div>
                  </div>
                  <Alert alert={forgotAlert} />
                  <Field label="Email Address" id="fe" type="email" placeholder="Enter your email address" value={forgotEmail} onChange={setForgotEmail} icon={<IMail />} />
                  <button className="nl-primary" style={{ ...btnPrimary, opacity:forgotLoading?0.65:1 }} onClick={handleForgot} disabled={forgotLoading}>
                    {forgotLoading ? <><Spinner /> Please wait...</> : "Send Reset Link"}
                  </button>
                </div>
              )}

              {/* ── SUCCESS ── */}
              {panel==="success" && (
                <div className="nl-panel" style={{ textAlign:"center", padding:"10px 0" }}>
                  <div style={{ width:78, height:78, background:T.successBg, border:`1px solid ${T.successBorder}`, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 22px", boxShadow:`0 0 30px rgba(52,211,153,0.13)` }}>
                    <ICheck />
                  </div>
                  <div style={{ fontSize:10, fontWeight:700, color:T.statusOk, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:10 }}>Registration Complete</div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:33, fontWeight:800, color:T.text, letterSpacing:"-0.03em", marginBottom:12 }}>Account Created!</div>
                  <div style={{ fontSize:14.5, color:T.textSub, marginBottom:28, lineHeight:1.65 }}>{successMsg}</div>
                  <button className="nl-primary" style={{ ...btnPrimary, maxWidth:220, margin:"0 auto" }} onClick={() => goTo("login")}>Sign In Now</button>
                </div>
              )}

            </div>

            {/* Footer */}
            <div style={{ textAlign:"center", marginTop:18, fontSize:11, color:T.textMuted, letterSpacing:"0.04em" }}>
              © {new Date().getFullYear()} NL Technologies Pvt Ltd · All rights reserved
            </div>

          </div>
        </div>

      </div>
    </>
  );
};

export default LoginPage;