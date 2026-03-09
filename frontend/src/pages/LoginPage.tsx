import React, { useState, useEffect, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8000/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface User { id: number; username: string; email: string; name: string; role?: string; is_superuser?: boolean; }
interface ApiResponse { success: boolean; message: string; access?: string; refresh?: string; user?: User; }
type Panel = "login" | "register" | "forgot" | "success";
type AlertType = "error" | "success" | "info";
type LoginRole = "operator" | "admin";
interface AlertState { type: AlertType; message: string; }

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#070d1a",
  surface: "#0c1427",
  borderStrong: "rgba(56,189,248,0.18)",
  border: "rgba(56,189,248,0.09)",
  text: "#e8f4ff",
  textSub: "#7bafd4",
  textMuted: "#3d6080",
  accent: "#38bdf8",
  accent2: "#0ea5e9",
  accentGlow: "rgba(56,189,248,0.22)",
  admin: "#7c5af5",
  admin2: "#4f8ef7",
  adminGlow: "rgba(124,90,245,0.28)",
  ok: "#34d399",
  gridLine: "#13233d",
  inputBg: "#060e1d",
  inputBorder: "rgba(56,189,248,0.16)",
  errBg: "rgba(239,68,68,0.08)", errBd: "rgba(239,68,68,0.28)", errTx: "#f87171",
  infoBg: "rgba(56,189,248,0.08)", infoBd: "rgba(56,189,248,0.24)", infoTx: "#7dd3fc",
  okBg: "rgba(52,211,153,0.08)", okBd: "rgba(52,211,153,0.28)", okTx: "#34d399",
};

// ─── DEBUG LOGGER ─────────────────────────────────────────────────────────────
const log = {
  info:    (msg: string, data?: unknown) => console.log(`%c[LOGIN] ${msg}`,   "color:#38bdf8;font-weight:bold", data ?? ""),
  success: (msg: string, data?: unknown) => console.log(`%c[LOGIN] ✅ ${msg}`, "color:#34d399;font-weight:bold", data ?? ""),
  warn:    (msg: string, data?: unknown) => console.warn(`%c[LOGIN] ⚠️ ${msg}`, "color:#fbbf24;font-weight:bold", data ?? ""),
  error:   (msg: string, data?: unknown) => console.error(`%c[LOGIN] ❌ ${msg}`,"color:#f87171;font-weight:bold", data ?? ""),
  group:   (label: string)               => console.group(`%c[LOGIN] 📦 ${label}`, "color:#a78bfa;font-weight:bold"),
  end:     ()                            => console.groupEnd(),
};

// ─── API ──────────────────────────────────────────────────────────────────────
async function apiLogin(u: string, p: string): Promise<ApiResponse> {
  const url = `${API_BASE}/login/`;
  log.group("apiLogin()");
  log.info("Target URL", url);
  log.info("Payload", { username: u, password: "***hidden***" });

  try {
    log.info("Sending POST request...");
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u, password: p }),
    });

    log.info(`HTTP Status: ${r.status} ${r.statusText}`);
    log.info("Response headers", Object.fromEntries(r.headers.entries()));

    const d = await r.json();
    log.info("Response body", d);

    if (r.ok && d.access) {
      log.success("Login successful — storing tokens & user");
      log.info("User object from server", d.user);
      localStorage.setItem("access_token",  d.access);
      localStorage.setItem("refresh_token", d.refresh ?? "");
      localStorage.setItem("user", JSON.stringify(d.user ?? { username: u, name: u, email: "" }));
      log.info("localStorage after login", {
        access_token:  localStorage.getItem("access_token")?.slice(0, 30) + "...",
        refresh_token: localStorage.getItem("refresh_token")?.slice(0, 20) + "...",
        user:          localStorage.getItem("user"),
      });
      log.end();
      return { success: true, message: d.message || "Welcome back!", ...d };
    }

    log.warn("Login failed — server returned non-OK or missing access token", { status: r.status, body: d });
    log.end();
    return { success: false, message: d.message || "Invalid credentials." };

  } catch (err) {
    log.error("Network / fetch error — is the backend running at " + API_BASE + "?", err);
    log.end();
    return { success: false, message: "Connection error. Is the backend running?" };
  }
}

async function apiRegister(name: string, email: string, username: string, password: string): Promise<ApiResponse> {
  log.group("apiRegister()");
  log.info("Registering", { name, email, username });
  try {
    const r = await fetch(`${API_BASE}/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, username, password }),
    });
    log.info(`HTTP Status: ${r.status}`);
    const d = await r.json();
    log.info("Response", d);
    log.end();
    if (r.ok && d.success) return { success: true, message: d.message };
    return { success: false, message: d.message || "Registration failed." };
  } catch (err) {
    log.error("Register network error", err);
    log.end();
    return { success: false, message: "Server unreachable." };
  }
}

async function apiForgot(email: string): Promise<ApiResponse> {
  log.group("apiForgot()");
  log.info("Sending reset to", email);
  try {
    const r = await fetch(`${API_BASE}/forgot-password/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    log.info(`HTTP Status: ${r.status}`);
    log.end();
    if (r.ok) return { success: true, message: "Reset link sent to your email." };
    return { success: false, message: "Failed to send reset link." };
  } catch (err) {
    log.error("Forgot-password network error", err);
    log.end();
    return { success: false, message: "Server error." };
  }
}

function isAdminUser(u: User) {
  const raw = u as any; // cast to catch unexpected shapes from backend
  const result =
    raw.role === "admin"      ||
    raw.is_superuser === true  ||
    raw.is_superuser === 1     ||
    raw.is_staff === true      ||
    raw.is_staff === 1;
  log.info("isAdminUser() — FULL raw user object:", raw);
  log.info("isAdminUser() — fields checked:", {
    role: raw.role,
    is_superuser: raw.is_superuser,
    is_staff: raw.is_staff,
    RESULT: result,
  });
  if (!result) {
    log.error(
      "Admin check FAILED — backend user object has none of: role=admin, is_superuser=true, is_staff=true. " +
      "Your Django login view must serialize these fields. See full object above.",
      raw
    );
  }
  return result;
}

function pwStr(v: string) {
  if (!v) return { w: "0%", c: "transparent", label: "" };
  let s = 0;
  if (v.length >= 6) s++; if (v.length >= 10) s++;
  if (/[A-Z]/.test(v)) s++; if (/[0-9]/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v)) s++;
  return [{ w: "20%", c: "#ef4444", label: "Very weak" }, { w: "40%", c: "#f97316", label: "Weak" },
  { w: "60%", c: "#eab308", label: "Fair" }, { w: "80%", c: "#84cc16", label: "Strong" },
  { w: "100%", c: "#34d399", label: "Very strong" }][Math.min(s - 1, 4)];
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const IUser = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const ILock = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
const IMail = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;
const IAt = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" /></svg>;
const IEye = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const IEyeOff = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>;
const IBack = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>;
const IBigCheck = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>;
const IAlert = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
const IMonitor = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>;
const IShield = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
const IWifi = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1" fill="currentColor" /></svg>;
const ISnowflake = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2l3 3-3 3-3-3z" /><path d="M12 22l3-3-3-3-3 3z" />
    <path d="M2 12l3 3 3-3-3-3z" /><path d="M22 12l-3 3-3-3 3-3z" />
    <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);
const IconMonitorColour = ({ c }: { c: string }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2">
    <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);
const IconShieldColour = ({ c }: { c: string }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill={c} stroke="none">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5L12 1z" />
  </svg>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spin = () => <span style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "_SP .7s linear infinite", flexShrink: 0 }} />;

// ─── Alert ────────────────────────────────────────────────────────────────────
const AlertBox: React.FC<{ a: AlertState | null }> = ({ a }) => {
  if (!a) return null;
  const s = { error: { bg: T.errBg, bd: T.errBd, tx: T.errTx }, success: { bg: T.okBg, bd: T.okBd, tx: T.okTx }, info: { bg: T.infoBg, bd: T.infoBd, tx: T.infoTx } }[a.type];
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.bd}`, color: s.tx, padding: "10px 13px", borderRadius: 9, fontSize: 13, fontWeight: 500, marginBottom: 15, display: "flex", alignItems: "flex-start", gap: 8 }}>
      <span style={{ flexShrink: 0, marginTop: 1 }}><IAlert /></span>
      <span style={{ lineHeight: 1.5 }}>{a.message}</span>
    </div>
  );
};

// ─── Field ────────────────────────────────────────────────────────────────────
interface FP { label: string; id: string; type: "text" | "email" | "password"; ph: string; val: string; set: (v: string) => void; icon: React.ReactNode; toggle?: boolean; showPw?: boolean; onToggle?: () => void; extra?: React.ReactNode; ac?: string; autoC?: string; }
const Field: React.FC<FP> = ({ label, id, type, ph, val, set, icon, toggle, showPw, onToggle, extra, ac = T.accent, autoC }) => {
  const [fo, setFo] = useState(false);
  return (
    <div style={{ marginBottom: 13 }}>
      <label htmlFor={id} style={{ display: "block", fontSize: 10, fontWeight: 700, color: fo ? ac : T.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6, transition: "color .2s" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: fo ? ac : T.textMuted, display: "flex", transition: "color .2s" }}>{icon}</span>
        <input id={id} type={toggle ? (showPw ? "text" : "password") : type} placeholder={ph} value={val}
          onChange={e => set(e.target.value)} onFocus={() => setFo(true)} onBlur={() => setFo(false)} autoComplete={autoC}
          style={{ width: "100%", height: 46, padding: "0 44px 0 40px", fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: T.text, background: T.inputBg, border: `1.5px solid ${fo ? ac : T.inputBorder}`, borderRadius: 10, outline: "none", boxShadow: fo ? `0 0 0 3px ${ac}22` : "none", transition: "all .2s", boxSizing: "border-box" }} />
        {toggle && <button type="button" onClick={onToggle} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.textMuted, padding: 4, display: "flex" }}>{showPw ? <IEyeOff /> : <IEye />}</button>}
      </div>
      {extra}
    </div>
  );
};

// ─── Left panel helpers ───────────────────────────────────────────────────────
const SPill: React.FC<{ label: string; status: string }> = ({ label, status }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
    <div style={{ fontSize: 8, fontWeight: 700, color: T.textMuted, letterSpacing: "0.15em", textTransform: "uppercase" }}>{label}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.ok, boxShadow: `0 0 7px ${T.ok}` }} />
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: T.ok, letterSpacing: "0.08em" }}>{status}</span>
    </div>
  </div>
);
const Feat: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 13, padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(56,189,248,0.07)", border: "1px solid rgba(56,189,248,0.13)", display: "flex", alignItems: "center", justifyContent: "center", color: T.accent, flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 11.5, color: T.textMuted, lineHeight: 1.5 }}>{desc}</div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [panel, setPanel] = useState<Panel>("login");
  const [role, setRole] = useState<LoginRole>("operator");
  const [uname, setUname] = useState("");
  const [upw, setUpw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [lAlert, setLAlert] = useState<AlertState | null>(null);
  const [lLoad, setLLoad] = useState(false);

  const [rName, setRName] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rUser, setRUser] = useState("");
  const [rPw, setRPw] = useState("");
  const [rShowPw, setRShowPw] = useState(false);
  const [rAlert, setRAlert] = useState<AlertState | null>(null);
  const [rLoad, setRLoad] = useState(false);

  const [fEmail, setFEmail] = useState("");
  const [fAlert, setFAlert] = useState<AlertState | null>(null);
  const [fLoad, setFLoad] = useState(false);

  const [okMsg, setOkMsg] = useState("");
  const [now, setNow] = useState(new Date());
  const str = pwStr(rPw);

  const isAdmin = role === "admin";
  const ac = isAdmin ? T.admin : T.accent;
  const ac2 = isAdmin ? T.admin2 : T.accent2;
  const gl = isAdmin ? T.adminGlow : T.accentGlow;

  // ─── Health check on mount ───────────────────────────────────────
  useEffect(() => {
    log.info(`Page mounted. API_BASE = ${API_BASE}`);
    log.info("Checking backend health...");

    fetch(`${API_BASE}/health/`)
      .then(r => {
        log.success(`Health check OK — HTTP ${r.status}`);
        return r.json();
      })
      .then(d => log.info("Health response body", d))
      .catch(err => log.error("Health check FAILED — backend may be down or CORS is blocking", err));

    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const goTo = (p: Panel) => {
    log.info(`Navigating panel: ${panel} → ${p}`);
    setPanel(p); setLAlert(null); setRAlert(null); setFAlert(null);
  };

  // ─── doLogin ─────────────────────────────────────────────────────
  const doLogin = async () => {
    log.group("doLogin()");
    log.info("Selected role tab", role);
    log.info("Username entered", uname || "(empty)");
    log.info("Password entered", upw ? "***" : "(empty)");

    if (!uname || !upw) {
      log.warn("Validation failed — empty fields");
      setLAlert({ type: "error", message: "Please fill in all fields." });
      log.end();
      return;
    }

    setLLoad(true);
    const res = await apiLogin(uname, upw);
    setLLoad(false);

    log.info("apiLogin() result", res);

    if (!res.success) {
      log.error("Login rejected by server", res.message);
      setLAlert({ type: "error", message: res.message });
      log.end();
      return;
    }

    if (role === "admin") {
      log.info("Admin tab selected — checking admin privileges on user object...");
      log.info("User object", res.user);

      if (!res.user || !isAdminUser(res.user)) {
        log.error("Admin check FAILED — user is not admin/superuser", res.user);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        setLAlert({ type: "error", message: "Access denied. This account does not have admin privileges." });
        log.end();
        return;
      }

      log.success("Admin check PASSED — navigating to /admin");
      log.end();
      navigate("/admin", { replace: true });
    } else {
      log.success("Operator login — navigating to /dashboard");
      log.end();
      navigate("/dashboard", { replace: true });
    }
  };

  const doReg = async () => {
    if (!rName || !rEmail || !rUser || !rPw) { setRAlert({ type: "error", message: "Please fill in all fields." }); return; }
    setRLoad(true);
    const res = await apiRegister(rName, rEmail, rUser, rPw);
    setRLoad(false);
    if (res.success) { setOkMsg(res.message); setPanel("success"); }
    else setRAlert({ type: "error", message: res.message });
  };

  const doForgot = async () => {
    if (!fEmail) { setFAlert({ type: "error", message: "Please enter your email." }); return; }
    setFLoad(true);
    const res = await apiForgot(fEmail);
    setFLoad(false);
    setFAlert({ type: res.success ? "info" : "error", message: res.message });
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter") return;
    if (panel === "login") doLogin();
    if (panel === "register") doReg();
    if (panel === "forgot") doForgot();
  };

  const btnP: React.CSSProperties = { width: "100%", height: 48, background: `linear-gradient(135deg,${ac},${ac2})`, color: "#fff", fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 700, border: "none", borderRadius: 10, cursor: "pointer", boxShadow: `0 4px 18px ${gl}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, letterSpacing: "0.04em", transition: "all .25s" };
  const btnS: React.CSSProperties = { width: "100%", height: 46, background: "transparent", color: T.textSub, fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 600, border: "1.5px solid rgba(56,189,248,0.18)", borderRadius: 10, cursor: "pointer", marginTop: 8, transition: "all .2s" };
  const btnBk: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${T.border}`, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: T.textSub, marginBottom: 18, padding: "5px 12px", borderRadius: 7 };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; height: 100%; }
        @keyframes _SP    { to { transform: rotate(360deg); } }
        @keyframes _FI    { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes _SR    { from { opacity:0; transform:translateX(10px); } to { opacity:1; transform:translateX(0); } }
        @keyframes _GRID  { from { background-position:0 0; } to { background-position:28px 28px; } }
        .lp-left  { animation: _FI .5s cubic-bezier(.22,.68,0,1.1) both; }
        .lp-right { animation: _FI .5s cubic-bezier(.22,.68,0,1.1) .07s both; }
        .lp-p     { animation: _SR .25s cubic-bezier(.22,.68,0,1.1) both; }
        .lp-pri:hover:not(:disabled) { filter:brightness(1.1); transform:translateY(-1px); }
        .lp-pri:active:not(:disabled){ transform:translateY(0); }
        .lp-sec:hover { border-color:${T.accent}!important; color:${T.accent}!important; background:rgba(56,189,248,0.05)!important; }
        .lp-bk:hover  { border-color:${T.accent}!important; color:${T.accent}!important; }
        .lp-lk:hover  { opacity:.7; text-decoration:underline; }
        .lp-tab:hover { opacity:.9; }
        input::placeholder { color:${T.textMuted}; font-size:13px; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(56,189,248,0.15); border-radius:2px; }
      `}</style>

      <div onKeyDown={onKey} style={{ fontFamily: "'DM Sans',sans-serif", background: T.bg, width: "100vw", height: "100vh", display: "flex", overflow: "hidden" }}>

        {/* ══════════════════ LEFT BRAND PANEL ══════════════════ */}
        <div className="lp-left" style={{ width: "44%", minWidth: 390, height: "100%", background: "linear-gradient(155deg,#0b1829 0%,#070d1a 60%,#08121f 100%)", borderRight: `1px solid ${T.borderStrong}`, display: "flex", flexDirection: "column", padding: "44px 52px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(56,189,248,0.055) 1px,transparent 1px)", backgroundSize: "28px 28px", animation: "_GRID 12s linear infinite", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: -200, left: -160, width: 560, height: 560, background: "radial-gradient(circle,rgba(13,110,253,0.12) 0%,transparent 65%)", borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -180, right: -100, width: 480, height: 480, background: "radial-gradient(circle,rgba(56,189,248,0.07) 0%,transparent 65%)", borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 30, right: -110, width: 340, height: 340, borderRadius: "50%", border: "1px solid rgba(56,189,248,0.055)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ width: 68, height: 68, borderRadius: 20, background: `linear-gradient(135deg,${T.accent},${T.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 30px ${T.accentGlow}`, marginBottom: 28 }}><ISnowflake /></div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 40, fontWeight: 800, color: T.text, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 6 }}>LN₂ Cryo<span style={{ color: T.accent }}>Monitor</span></div>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 18 }}>NL Technologies Pvt Ltd</div>
            <div style={{ width: 48, height: 3, borderRadius: 99, background: `linear-gradient(90deg,${T.accent},${T.accent2})`, marginBottom: 20 }} />
            <div style={{ fontSize: 14.5, color: T.textSub, lineHeight: 1.7, maxWidth: 320, marginBottom: 36 }}>Real-time cryogenic monitoring and analysis platform for liquid nitrogen storage management.</div>
            <div style={{ flex: 1 }}>
              <Feat icon={<IMonitor />} title="Live Sensor Dashboard" desc="24/7 temperature & fill-level monitoring across all Dewar units" />
              <Feat icon={<IShield />} title="Secure Role-Based Access" desc="Separate operator and admin authentication with route protection" />
              <Feat icon={<IWifi />} title="Real-Time Data Feed" desc="Sub-second sensor polling with instant alert notifications" />
            </div>
            <div style={{ marginTop: 28, background: "rgba(10,18,32,0.8)", backdropFilter: "blur(14px)", border: `1px solid ${T.borderStrong}`, borderRadius: 13, padding: "13px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                <SPill label="System" status="NOMINAL" /><div style={{ width: 1, height: 20, background: T.border }} />
                <SPill label="Network" status="ONLINE" /><div style={{ width: 1, height: 20, background: T.border }} />
                <SPill label="Sensors" status="LIVE" />
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 17, fontWeight: 600, color: T.accent, lineHeight: 1 }}>{now.toLocaleTimeString("en-US", { hour12: false })}</div>
                <div style={{ fontSize: 10, color: T.textMuted, marginTop: 3 }}>{now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════ RIGHT FORM PANEL ══════════════════ */}
        <div className="lp-right" style={{ flex: 1, height: "100%", overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 48px", background: `radial-gradient(ellipse at 70% 20%,rgba(56,189,248,0.04) 0%,transparent 55%),${T.bg}` }}>

          <div style={{ width: "100%", maxWidth: 420 }}>

            {panel === "login" && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 9, paddingLeft: 2 }}>
                  Sign in as
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "#040a14", border: `2px solid ${isAdmin ? "rgba(124,90,245,0.50)" : "rgba(56,189,248,0.35)"}`, borderRadius: 14, padding: 5, gap: 5, transition: "border-color .3s" }}>
                  <button type="button" className="lp-tab" onClick={() => { setRole("operator"); setLAlert(null); log.info("Role switched → operator"); }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "13px 8px", borderRadius: 10, background: !isAdmin ? `linear-gradient(135deg,${T.accent},${T.accent2})` : "transparent", border: "none", cursor: "pointer", color: !isAdmin ? "#ffffff" : T.textMuted, fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", boxShadow: !isAdmin ? `0 3px 16px ${T.accentGlow}` : "none", transition: "all .25s" }}>
                    <IconMonitorColour c={!isAdmin ? "#fff" : T.textMuted} />Operator
                  </button>
                  <button type="button" className="lp-tab" onClick={() => { setRole("admin"); setLAlert(null); log.info("Role switched → admin"); }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "13px 8px", borderRadius: 10, background: isAdmin ? `linear-gradient(135deg,${T.admin},${T.admin2})` : "transparent", border: "none", cursor: "pointer", color: isAdmin ? "#ffffff" : T.textMuted, fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", boxShadow: isAdmin ? `0 3px 16px ${T.adminGlow}` : "none", transition: "all .25s" }}>
                    <IconShieldColour c={isAdmin ? "#fff" : T.textMuted} />Admin
                  </button>
                </div>
                <div style={{ marginTop: 8, padding: "9px 13px", background: isAdmin ? "rgba(124,90,245,0.08)" : "rgba(56,189,248,0.06)", border: `1px solid ${isAdmin ? "rgba(124,90,245,0.25)" : "rgba(56,189,248,0.16)"}`, borderRadius: 9, display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: isAdmin ? "#c4b5fd" : T.textSub, lineHeight: 1.4, transition: "all .25s" }}>
                  <span style={{ flexShrink: 0, display: "flex" }}>{isAdmin ? <IconShieldColour c="#a78bfa" /> : <IconMonitorColour c={T.accent} />}</span>
                  {isAdmin ? "Admin credentials required · Redirects to Admin Control Panel" : "Operator credentials · Redirects to Sensor Dashboard"}
                </div>
              </div>
            )}

            <div style={{ height: 3, borderRadius: "6px 6px 0 0", background: `linear-gradient(90deg,${ac},${ac2})`, transition: "background .35s" }} />

            <div style={{ background: T.surface, backdropFilter: "blur(20px)", borderLeft: `1px solid ${isAdmin && panel === "login" ? "rgba(124,90,245,0.35)" : T.borderStrong}`, borderRight: `1px solid ${isAdmin && panel === "login" ? "rgba(124,90,245,0.35)" : T.borderStrong}`, borderBottom: `1px solid ${isAdmin && panel === "login" ? "rgba(124,90,245,0.35)" : T.borderStrong}`, borderTop: "none", borderRadius: "0 0 18px 18px", padding: "28px 34px 34px", position: "relative", boxShadow: isAdmin && panel === "login" ? "0 28px 70px rgba(0,0,0,0.55),0 6px 20px rgba(124,90,245,0.14)" : "0 28px 70px rgba(0,0,0,0.55),0 6px 20px rgba(56,189,248,0.06)", transition: "border-color .35s,box-shadow .35s" }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: 160, height: 160, background: `radial-gradient(circle at top right,${isAdmin && panel === "login" ? "rgba(124,90,245,0.08)" : "rgba(56,189,248,0.05)"},transparent 65%)`, pointerEvents: "none", transition: "background .35s" }} />

              {/* ── LOGIN ── */}
              {panel === "login" && (
                <div className="lp-p">
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: isAdmin ? "#c4b5fd" : T.accent, background: isAdmin ? "rgba(124,90,245,0.10)" : "rgba(56,189,248,0.08)", border: `1px solid ${isAdmin ? "rgba(124,90,245,0.25)" : "rgba(56,189,248,0.18)"}`, borderRadius: 6, padding: "3px 10px", marginBottom: 12, transition: "all .3s" }}>
                    {isAdmin ? <IconShieldColour c="#a78bfa" /> : <IconMonitorColour c={T.accent} />}
                    {isAdmin ? "Admin Access" : "Operator Access"}
                  </div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 800, color: T.text, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 6 }}>Welcome back</div>
                  <div style={{ fontSize: 13.5, color: T.textSub, marginBottom: 20, lineHeight: 1.5 }}>Sign in to access the {isAdmin ? "Admin Control Panel" : "Sensor Dashboard"}</div>
                  <AlertBox a={lAlert} />
                  <Field label="Username" id="lu" type="text" ph="Enter your username" val={uname} set={setUname} icon={<IUser />} autoC="username" ac={ac} />
                  <Field label="Password" id="lp" type="password" ph="Enter your password" val={upw} set={setUpw} icon={<ILock />} toggle showPw={showPw} onToggle={() => setShowPw(p => !p)} autoC="current-password" ac={ac} />
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -4, marginBottom: 18 }}>
                    <button className="lp-lk" onClick={() => goTo("forgot")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 12.5, fontWeight: 600, color: ac, padding: 0, transition: "color .2s" }}>Forgot password?</button>
                  </div>
                  <button className="lp-pri" style={{ ...btnP, opacity: lLoad ? .65 : 1, cursor: lLoad ? "not-allowed" : "pointer" }} onClick={doLogin} disabled={lLoad}>
                    {lLoad ? <><Spin /> Authenticating...</> : isAdmin ? "Sign In as Admin" : "Sign In"}
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0", color: T.textMuted, fontSize: 10 }}>
                    <div style={{ flex: 1, height: 1, background: T.border }} /><span style={{ fontWeight: 700, letterSpacing: "0.1em" }}>OR</span><div style={{ flex: 1, height: 1, background: T.border }} />
                  </div>
                  <button className="lp-sec" style={btnS} onClick={() => goTo("register")}>Create a new account</button>
                </div>
              )}

              {/* ── REGISTER ── */}
              {panel === "register" && (
                <div className="lp-p">
                  <button className="lp-bk" style={btnBk} onClick={() => goTo("login")}><IBack /> Back to Login</button>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.accent, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>New Operator</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 800, color: T.text, letterSpacing: "-0.03em", marginBottom: 6 }}>Create Account</div>
                  <div style={{ fontSize: 13.5, color: T.textSub, marginBottom: 18 }}>Join NL Technologies</div>
                  <AlertBox a={rAlert} />
                  <Field label="Full Name" id="rn" type="text" ph="Your full name" val={rName} set={setRName} icon={<IUser />} />
                  <Field label="Email Address" id="re" type="email" ph="you@example.com" val={rEmail} set={setREmail} icon={<IMail />} />
                  <Field label="Username" id="ru" type="text" ph="Choose a username" val={rUser} set={setRUser} icon={<IAt />} />
                  <Field label="Password" id="rp" type="password" ph="Create a strong password" val={rPw} set={setRPw} icon={<ILock />} toggle showPw={rShowPw} onToggle={() => setRShowPw(p => !p)} autoC="new-password"
                    extra={rPw ? <div style={{ marginTop: 7 }}><div style={{ height: 3, borderRadius: 99, background: T.gridLine, overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 99, background: str?.c, width: str?.w, transition: "width .35s,background .35s" }} /></div><div style={{ fontSize: 10.5, marginTop: 4, color: str?.c, fontWeight: 600 }}>{str?.label}</div></div> : undefined}
                  />
                  <button className="lp-pri" style={{ ...btnP, background: `linear-gradient(135deg,${T.accent},${T.accent2})`, boxShadow: `0 4px 18px ${T.accentGlow}`, opacity: rLoad ? .65 : 1 }} onClick={doReg} disabled={rLoad}>
                    {rLoad ? <><Spin /> Please wait...</> : "Create Account"}
                  </button>
                  <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: T.textSub }}>
                    Already have an account?{" "}<button className="lp-lk" onClick={() => goTo("login")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, color: T.accent, padding: 0 }}>Sign in</button>
                  </div>
                </div>
              )}

              {/* ── FORGOT ── */}
              {panel === "forgot" && (
                <div className="lp-p">
                  <button className="lp-bk" style={btnBk} onClick={() => goTo("login")}><IBack /> Back to Login</button>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.accent, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>Password Recovery</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 800, color: T.text, letterSpacing: "-0.03em", marginBottom: 6 }}>Reset Password</div>
                  <div style={{ fontSize: 13.5, color: T.textSub, marginBottom: 18, lineHeight: 1.55 }}>Enter your registered email and we'll send you a reset link.</div>
                  <AlertBox a={fAlert} />
                  <Field label="Email Address" id="fe" type="email" ph="Enter your email address" val={fEmail} set={setFEmail} icon={<IMail />} />
                  <button className="lp-pri" style={{ ...btnP, opacity: fLoad ? .65 : 1 }} onClick={doForgot} disabled={fLoad}>
                    {fLoad ? <><Spin /> Please wait...</> : "Send Reset Link"}
                  </button>
                </div>
              )}

              {/* ── SUCCESS ── */}
              {panel === "success" && (
                <div className="lp-p" style={{ textAlign: "center", padding: "8px 0" }}>
                  <div style={{ width: 72, height: 72, background: T.okBg, border: `1px solid ${T.okBd}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 0 28px rgba(52,211,153,0.12)" }}><IBigCheck /></div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.ok, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>Registration Complete</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 800, color: T.text, letterSpacing: "-0.03em", marginBottom: 10 }}>Account Created!</div>
                  <div style={{ fontSize: 13.5, color: T.textSub, marginBottom: 26, lineHeight: 1.6 }}>{okMsg}</div>
                  <button className="lp-pri" style={{ ...btnP, maxWidth: 200, margin: "0 auto" }} onClick={() => goTo("login")}>Sign In Now</button>
                </div>
              )}
            </div>

            <div style={{ textAlign: "center", marginTop: 14, fontSize: 10.5, color: T.textMuted, letterSpacing: "0.04em" }}>
              © {new Date().getFullYear()} NL Technologies Pvt Ltd · All rights reserved
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
