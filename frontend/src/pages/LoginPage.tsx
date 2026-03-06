import React, { useState, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";  // ← ADDED

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:8000/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface User { id: number; username: string; email: string; name: string; }
interface ApiResponse { success: boolean; message: string; access?: string; refresh?: string; user?: User; }
type Panel = "login" | "register" | "forgot" | "success";
type AlertType = "error" | "success" | "info";
interface AlertState { type: AlertType; message: string; }

// ─── Console Logger ───────────────────────────────────────────────────────────
const log = {
  info: (msg: string, data?: unknown) => {
    console.log(`%c[NL ℹ️] ${msg}`, "color:#1a56db;font-weight:bold;font-size:12px;", data ?? "");
  },
  success: (msg: string, data?: unknown) => {
    console.log(`%c[NL ✅] ${msg}`, "color:#16a34a;font-weight:bold;font-size:12px;", data ?? "");
  },
  error: (msg: string, data?: unknown) => {
    console.error(`%c[NL ❌] ${msg}`, "color:#dc2626;font-weight:bold;font-size:12px;", data ?? "");
  },
  layout: () => {
    console.log(
      `%c[Viewport Size] 📏 Width: ${window.innerWidth}px | Height: ${window.innerHeight}px`,
      "background: #1e293b; color: #38bdf8; padding: 4px 8px; border-radius: 4px; font-weight: bold;"
    );
  },
  divider: (label: string) => {
    console.log(`%c──────────── ${label} ────────────`, "color:#94a3b8;font-size:11px;");
  },
};

// ─── API Calls ────────────────────────────────────────────────────────────────
async function apiLogin(username: string, password: string): Promise<ApiResponse> {
  const url = `${API_BASE}/login/`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok && data.access) {
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh ?? "");
      // ── Persist user info so the dashboard can display it ─────────────────
      const userPayload = data.user ?? { username, name: username, email: "" };
      localStorage.setItem("user", JSON.stringify(userPayload));
      return { success: true, message: data.message || "Welcome back!", ...data };
    }
    return { success: false, message: data.message || "Invalid credentials." };
  } catch (err) { return { success: false, message: "Connection error." }; }
}

async function apiRegister(name: string, email: string, username: string, password: string): Promise<ApiResponse> {
  const url = `${API_BASE}/register/`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, username, password }),
    });
    const data = await res.json();
    if (res.ok && data.success) return { success: true, message: data.message };
    return { success: false, message: data.message || "Registration failed." };
  } catch (err) { return { success: false, message: "Server unreachable." }; }
}

async function apiForgotPassword(email: string): Promise<ApiResponse> {
  const url = `${API_BASE}/forgot-password/`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) return { success: true, message: "Reset link sent." };
    return { success: false, message: "Failed to send link." };
  } catch (err) { return { success: false, message: "Server error." }; }
}

// ─── Password Strength ────────────────────────────────────────────────────────
function getPasswordStrength(val: string) {
  if (!val) return { width: "0%", color: "transparent", label: "" };
  let score = 0;
  if (val.length >= 6) score++;
  if (val.length >= 10) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const levels = [
    { width: "20%", color: "#ef4444", label: "Very weak" },
    { width: "40%", color: "#f97316", label: "Weak" },
    { width: "60%", color: "#eab308", label: "Fair" },
    { width: "80%", color: "#84cc16", label: "Strong" },
    { width: "100%", color: "#22c55e", label: "Very strong" },
  ];
  return levels[Math.min(score - 1, 4)];
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconUser = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const IconLock = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
const IconMail = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>);
const IconAt  = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>);
const IconEye = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>);
const IconEyeOff = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>);
const IconArrowLeft = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>);
const IconCheck = () => (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>);
const IconAlertCircle = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>);
const IconBolt = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/></svg>);

// ─── Styles ───────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  body:         { fontFamily:"'DM Sans','Segoe UI',sans-serif", background:"#f8fafd", width:"100vw", height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", position:"fixed", top:0, left:0, overflow:"hidden" },
  dotGrid:      { position:"absolute", inset:0, backgroundImage:"radial-gradient(circle, rgba(26,86,219,0.06) 1px, transparent 1px)", backgroundSize:"28px 28px", pointerEvents:"none", zIndex:0 },
  blob1:        { position:"absolute", top:-200, left:-200, width:800, height:800, background:"radial-gradient(circle, rgba(26,86,219,0.07) 0%, transparent 70%)", pointerEvents:"none", borderRadius:"50%" },
  blob2:        { position:"absolute", bottom:-200, right:-200, width:900, height:900, background:"radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)", pointerEvents:"none", borderRadius:"50%" },
  wrapper:      { position:"relative", zIndex:1, width:"90%", maxWidth:580, display:"flex", flexDirection:"column", alignItems:"center" },
  brandHeader:  { textAlign:"center", marginBottom:40 },
  brandLogo:    { display:"inline-flex", alignItems:"center", gap:14, marginBottom:8 },
  logoIcon:     { width:52, height:52, background:"linear-gradient(135deg,#1a56db 0%,#0ea5e9 100%)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 16px rgba(26,86,219,0.28)" },
  brandName:    { fontFamily:"'Syne','Segoe UI',sans-serif", fontSize:26, fontWeight:800, color:"#0f172a", letterSpacing:"-0.5px", margin:0 },
  brandSub:     { fontSize:12, fontWeight:500, color:"#94a3b8", letterSpacing:3, textTransform:"uppercase" as const },
  card:         { background:"#ffffff", borderRadius:24, boxShadow:"0 30px 70px rgba(26,86,219,0.12),0 8px 24px rgba(0,0,0,0.05)", padding:"56px 64px", border:"1px solid rgba(226,232,240,0.7)", position:"relative", overflow:"hidden", width:"100%" },
  cardTop:      { position:"absolute", top:0, left:0, right:0, height:4, background:"linear-gradient(90deg,#1a56db,#0ea5e9)" },
  panelTitle:   { fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:700, color:"#0f172a", marginBottom:8 },
  panelSub:     { fontSize:15, color:"#475569", marginBottom:32, lineHeight:1.6 },
  fieldGroup:   { marginBottom:22 },
  label:        { display:"block", fontSize:14, fontWeight:600, color:"#0f172a", marginBottom:9 },
  inputWrap:    { position:"relative" },
  inputIcon:    { position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", display:"flex" },
  input:        { width:"100%", height:52, padding:"0 48px 0 48px", fontFamily:"'DM Sans',sans-serif", fontSize:15.5, color:"#0f172a", background:"#f8fafd", border:"1.5px solid #e2e8f0", borderRadius:10, outline:"none", transition:"all 0.2s", boxSizing:"border-box" as const },
  togglePw:     { position:"absolute", right:16, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#94a3b8", padding:4, borderRadius:5, display:"flex", alignItems:"center" },
  forgotRow:    { display:"flex", justifyContent:"flex-end", marginTop:-12, marginBottom:22 },
  linkBtn:      { background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:500, color:"#1a56db", padding:0 },
  btnPrimary:   { width:"100%", height:54, background:"linear-gradient(135deg,#1a56db 0%,#2563eb 100%)", color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:16, fontWeight:600, border:"none", borderRadius:10, cursor:"pointer", boxShadow:"0 4px 14px rgba(26,86,219,0.25)", marginTop:8, display:"flex", alignItems:"center", justifyContent:"center", gap:10, transition:"all 0.2s" },
  btnSecondary: { width:"100%", height:50, background:"transparent", color:"#1a56db", fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:600, border:"1.5px solid #e2e8f0", borderRadius:10, cursor:"pointer", marginTop:12 },
  divider:      { display:"flex", alignItems:"center", gap:14, margin:"24px 0", color:"#94a3b8", fontSize:13, fontWeight:500 },
  dividerLine:  { flex:1, height:1, background:"#e2e8f0" },
  backBtn:      { display:"inline-flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:500, color:"#475569", marginBottom:24, padding:"6px 10px", borderRadius:8 },
  signupRow:    { textAlign:"center" as const, marginTop:22, fontSize:14.5, color:"#475569" },
  strengthBar:  { height:5, borderRadius:99, background:"#e2e8f0", marginTop:8, overflow:"hidden" },
  bottomBrand:  { textAlign:"center" as const, marginTop:32, fontSize:13, color:"#94a3b8" },
  successIcon:  { width:72, height:72, background:"#f0fdf4", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", border:"2px solid #bbf7d0" },
  successCenter:{ textAlign:"center" as const, padding:"20px 0" },
};

// ─── Alert ────────────────────────────────────────────────────────────────────
const Alert: React.FC<{ alert: AlertState | null }> = ({ alert }) => {
  if (!alert) return null;
  const styles: Record<AlertType, React.CSSProperties> = {
    error:   { background:"#fef2f2", color:"#b91c1c", border:"1px solid #fecaca" },
    success: { background:"#f0fdf4", color:"#15803d", border:"1px solid #bbf7d0" },
    info:    { background:"#eff6ff", color:"#1d4ed8", border:"1px solid #bfdbfe" },
  };
  return (
    <div style={{...styles[alert.type], padding:"12px 16px", borderRadius:10, fontSize:14.5, fontWeight:500, marginBottom:22, display:"flex", alignItems:"flex-start", gap:10}}>
      <IconAlertCircle/><span>{alert.message}</span>
    </div>
  );
};

// ─── Field ────────────────────────────────────────────────────────────────────
interface FieldProps {
  label: string; id: string; type: "text"|"email"|"password";
  placeholder: string; value: string; onChange: (v:string)=>void;
  icon: React.ReactNode; showToggle?: boolean; showPw?: boolean;
  onToggle?: ()=>void; extra?: React.ReactNode; autoComplete?: string;
}
const Field: React.FC<FieldProps> = ({label,id,type,placeholder,value,onChange,icon,showToggle,showPw,onToggle,extra,autoComplete}) => {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={S.fieldGroup}>
      <label style={S.label} htmlFor={id}>{label}</label>
      <div style={S.inputWrap}>
        <span style={{...S.inputIcon, color:focused?"#1a56db":"#94a3b8"}}>{icon}</span>
        <input id={id} type={showToggle?(showPw?"text":"password"):type} placeholder={placeholder} value={value}
          onChange={e=>onChange(e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          autoComplete={autoComplete}
          style={{...S.input, borderColor:focused?"#1a56db":"#e2e8f0", boxShadow:focused?"0 0 0 4px rgba(26,86,219,0.08)":"none", background:focused?"#fff":"#f8fafd"}}/>
        {showToggle && <button type="button" onClick={onToggle} style={S.togglePw}>{showPw?<IconEyeOff/>:<IconEye/>}</button>}
      </div>
      {extra}
    </div>
  );
};

const Spinner = () => (<span style={{width:20,height:20,border:"2.5px solid rgba(255,255,255,0.35)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>);

// ─── Main Component ───────────────────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const navigate = useNavigate(); // ← ADDED — must be inside <Router>

  const [panel, setPanel] = useState<Panel>("login");
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
  const strength = getPasswordStrength(regPassword);

  React.useEffect(() => {
    log.divider("PAGE DIMENSIONS");
    log.layout();
    const handleResize = () => log.layout();
    window.addEventListener("resize", handleResize);
    log.divider("API CHECK");
    fetch(`${API_BASE}/health/`)
      .then(r => r.json())
      .then(d => log.success("Django is reachable ✅", d))
      .catch(() => log.error("Django is NOT reachable ❌"));
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const goTo = (p: Panel) => {
    setPanel(p);
    setLoginAlert(null); setRegAlert(null); setForgotAlert(null);
  };

  // ── LOGIN — navigate to /dashboard on success ─────────────────────────────
  const handleLogin = async () => {
    if (!loginUsername || !loginPassword) {
      setLoginAlert({type:"error", message:"Please fill in all fields."});
      return;
    }
    setLoginLoading(true);
    const res = await apiLogin(loginUsername, loginPassword);
    setLoginLoading(false);
    if (res.success) {
      log.success("Login successful — redirecting to dashboard");
      navigate("/dashboard", { replace: true }); // ← KEY CHANGE
    } else {
      setLoginAlert({type:"error", message: res.message});
    }
  };

  const handleRegister = async () => {
    if (!regName||!regEmail||!regUsername||!regPassword) {
      setRegAlert({type:"error", message:"Please fill in all fields."}); return;
    }
    setRegLoading(true);
    const res = await apiRegister(regName, regEmail, regUsername, regPassword);
    setRegLoading(false);
    if (res.success) { setSuccessMsg(res.message); setPanel("success"); }
    else setRegAlert({type:"error", message: res.message});
  };

  const handleForgot = async () => {
    if (!forgotEmail) {
      setForgotAlert({type:"error", message:"Please enter your email."}); return;
    }
    setForgotLoading(true);
    const res = await apiForgotPassword(forgotEmail);
    setForgotLoading(false);
    if (res.success) setForgotAlert({type:"info", message: res.message});
    else setForgotAlert({type:"error", message: res.message});
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter") return;
    if (panel==="login") handleLogin();
    else if (panel==="register") handleRegister();
    else if (panel==="forgot") handleForgot();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        .ll-wrap { animation: fadeUp 0.6s cubic-bezier(.22,.68,0,1.2) both; }
        @media (min-width: 1024px) { .ll-wrap { max-width: 620px !important; } }
        @media (max-width: 580px) {
          .ll-card { padding: 32px 24px !important; border-radius: 16px !important; }
          .ll-title { font-size: 24px !important; }
        }
        .ll-link:hover { text-decoration:underline; opacity:0.75; }
        .ll-back:hover { color:#1a56db !important; background:#eff6ff !important; }
        .ll-primary:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 22px rgba(26,86,219,0.35) !important; }
        .ll-secondary:hover { border-color:#1a56db !important; background:#eff6ff !important; }
      `}</style>

      <div style={S.body} onKeyDown={onKey}>
        <div style={S.dotGrid}/><div style={S.blob1}/><div style={S.blob2}/>

        <div className="ll-wrap" style={S.wrapper}>

          {/* Brand */}
          <div style={S.brandHeader}>
            <div style={S.brandLogo}>
              <div style={S.logoIcon}><IconBolt/></div>
              <div>
                <div style={S.brandName}><span style={{color:"#1a56db"}}>NL</span> Technologies</div>
                <div style={S.brandSub}>Pvt Ltd</div>
              </div>
            </div>
          </div>

          <div className="ll-card" style={S.card}>
            <div style={S.cardTop}/>

            {/* LOGIN PANEL */}
            {panel==="login" && (
              <div>
                <div className="ll-title" style={S.panelTitle}>Welcome back</div>
                <div style={S.panelSub}>Sign in to your account to continue</div>
                <Alert alert={loginAlert}/>
                <Field label="Username" id="login-user" type="text" placeholder="Enter your username" value={loginUsername} onChange={setLoginUsername} icon={<IconUser/>} autoComplete="username"/>
                <Field label="Password" id="login-pw" type="password" placeholder="Enter your password" value={loginPassword} onChange={setLoginPassword} icon={<IconLock/>} showToggle showPw={showLoginPw} onToggle={()=>setShowLoginPw(!showLoginPw)} autoComplete="current-password"/>
                <div style={S.forgotRow}><button className="ll-link" style={S.linkBtn} onClick={()=>goTo("forgot")}>Forgot password?</button></div>
                <button className="ll-primary" style={{...S.btnPrimary, opacity:loginLoading?0.7:1, cursor:loginLoading?"not-allowed":"pointer"}} onClick={handleLogin} disabled={loginLoading}>
                  {loginLoading ? <><Spinner/> Please wait...</> : "Sign In"}
                </button>
                <div style={S.divider}><span style={S.dividerLine}/>or<span style={S.dividerLine}/></div>
                <button className="ll-secondary" style={S.btnSecondary} onClick={()=>goTo("register")}>Create a new account</button>
              </div>
            )}

            {/* REGISTER PANEL */}
            {panel==="register" && (
              <div>
                <button className="ll-back" style={S.backBtn} onClick={()=>goTo("login")}><IconArrowLeft/> Back to Login</button>
                <div className="ll-title" style={S.panelTitle}>Create Account</div>
                <div style={S.panelSub}>Join NL Technologies today</div>
                <Alert alert={regAlert}/>
                <Field label="Full Name"     id="reg-name"  type="text"     placeholder="Your full name"          value={regName}     onChange={setRegName}     icon={<IconUser/>}/>
                <Field label="Email Address" id="reg-email" type="email"    placeholder="you@example.com"          value={regEmail}    onChange={setRegEmail}    icon={<IconMail/>}/>
                <Field label="Username"      id="reg-user"  type="text"     placeholder="Choose a username"        value={regUsername} onChange={setRegUsername} icon={<IconAt/>}/>
                <Field label="Password"      id="reg-pw"    type="password" placeholder="Create a strong password" value={regPassword} onChange={setRegPassword} icon={<IconLock/>} showToggle showPw={showRegPw} onToggle={()=>setShowRegPw(!showRegPw)} autoComplete="new-password"
                  extra={regPassword?(<div><div style={S.strengthBar}><div style={{height:"100%",borderRadius:99,background:strength?.color,width:strength?.width,transition:"width 0.3s,background 0.3s"}}/></div><div style={{fontSize:12.5,marginTop:6,color:strength?.color}}>{strength?.label}</div></div>):undefined}/>
                <button className="ll-primary" style={{...S.btnPrimary,opacity:regLoading?0.7:1}} onClick={handleRegister} disabled={regLoading}>
                  {regLoading?<><Spinner/> Please wait...</>:"Create Account"}
                </button>
                <div style={S.signupRow}>Already have an account? <button className="ll-link" style={S.linkBtn} onClick={()=>goTo("login")}>Sign in</button></div>
              </div>
            )}

            {/* FORGOT PANEL */}
            {panel==="forgot" && (
              <div>
                <button className="ll-back" style={S.backBtn} onClick={()=>goTo("login")}><IconArrowLeft/> Back to Login</button>
                <div className="ll-title" style={S.panelTitle}>Reset Password</div>
                <div style={S.panelSub}>Enter your registered email and we'll send you a reset link.</div>
                <Alert alert={forgotAlert}/>
                <Field label="Email Address" id="forgot-email" type="email" placeholder="Enter your email address" value={forgotEmail} onChange={setForgotEmail} icon={<IconMail/>}/>
                <button className="ll-primary" style={{...S.btnPrimary,opacity:forgotLoading?0.7:1}} onClick={handleForgot} disabled={forgotLoading}>
                  {forgotLoading?<><Spinner/> Please wait...</>:"Send Reset Link"}
                </button>
              </div>
            )}

            {/* SUCCESS PANEL — shown only after registration, not login */}
            {panel==="success" && (
              <div style={S.successCenter}>
                <div style={S.successIcon}><IconCheck/></div>
                <div className="ll-title" style={S.panelTitle}>Account Created!</div>
                <div style={{...S.panelSub,marginBottom:28}}>{successMsg}</div>
                <button className="ll-primary" style={{...S.btnPrimary,maxWidth:240,margin:"0 auto"}} onClick={()=>goTo("login")}>Sign In Now</button>
              </div>
            )}
          </div>

          <div style={S.bottomBrand}>© {new Date().getFullYear()} NL Technologies Pvt Ltd · All rights reserved</div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;