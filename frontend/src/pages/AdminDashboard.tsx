import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ReferenceLine, Legend,
} from "recharts";
import {
  Shield, Snowflake, Plus, Trash2, Save, RotateCcw,
  Thermometer, Droplets, Activity, AlertTriangle,
  LogOut, Sun, Moon, CheckCircle, Info, Lock,
  Layers, Settings, Table2, Home, ChevronDown,
  Bell, Mail, TrendingUp, TrendingDown, X, Edit3,
  AtSign, Smartphone, Phone, Users, Search,
  FlaskConical, ArrowRight, ArrowLeft,
  SlidersHorizontal, Eye, EyeOff,
} from "lucide-react";

// ─── THEMES ───────────────────────────────────────────────────────────────────
const T = {
  dark: {
    bg:"#0f1729",
    surface:"#1a2540",
    surfaceAlt:"#1e2d4a",
    surfaceEl:"#243358",
    border:"rgba(148,188,255,0.12)",
    borderMd:"rgba(148,188,255,0.20)",
    borderHi:"rgba(148,188,255,0.35)",
    text:"#e8f0ff",
    textSub:"#8eaacc",
    textMuted:"#5a7ba8",
    accent:"#4db8ff",
    accent2:"#a78bfa",
    accentGlow:"rgba(77,184,255,0.22)",
    a2Glow:"rgba(167,139,250,0.22)",
    ok:"#34d399",
    warn:"#fbbf24",
    err:"#f87171",
    hBg:"rgba(15,23,41,0.96)",
    sh:"0 2px 16px rgba(0,0,0,0.35),0 1px 0 rgba(148,188,255,0.06)",
    shH:"0 8px 32px rgba(0,0,0,0.5),0 1px 0 rgba(148,188,255,0.10)",
    inBg:"#243358",
    inBd:"rgba(148,188,255,0.18)",
    inFo:"#4db8ff",
    danger:"#f87171",
    dangerGlow:"rgba(248,113,113,0.12)",
    s1:"#4db8ff",s2:"#a78bfa",room:"#34d399",level:"#fbbf24",
    cg:"rgba(148,188,255,0.06)",
    cb:"#1a2540",
    tr:"#2a3a60",
    card1:"linear-gradient(135deg,#1e2d4a,#19274a)",
    card2:"linear-gradient(135deg,#221d40,#1a1d40)",
    tabBar:"#162035",
  },
  light: {
    bg:"#f0f4f8",
    surface:"#ffffff",
    surfaceAlt:"#f7f9fc",
    surfaceEl:"#edf2ff",
    border:"rgba(30,64,175,0.08)",
    borderMd:"rgba(30,64,175,0.16)",
    borderHi:"rgba(30,64,175,0.30)",
    text:"#07142a",
    textSub:"#3b5080",
    textMuted:"#8fa0c8",
    accent:"#1d7fe8",
    accent2:"#6366f1",
    accentGlow:"rgba(29,127,232,0.15)",
    a2Glow:"rgba(99,102,241,0.15)",
    ok:"#10b981",
    warn:"#f59e0b",
    err:"#ef4444",
    hBg:"rgba(255,255,255,0.97)",
    sh:"0 2px 12px rgba(0,0,30,0.06),0 1px 0 rgba(30,64,175,0.04)",
    shH:"0 8px 32px rgba(0,0,30,0.10)",
    inBg:"#f0f5ff",
    inBd:"rgba(30,64,175,0.12)",
    inFo:"#1d7fe8",
    danger:"#ef4444",
    dangerGlow:"rgba(239,68,68,0.08)",
    s1:"#1d7fe8",s2:"#6366f1",room:"#10b981",level:"#f59e0b",
    cg:"rgba(30,64,175,0.04)",
    cb:"#f0f5ff",
    tr:"#e8eeff",
    card1:"linear-gradient(135deg,#f0f5ff,#e8eeff)",
    card2:"linear-gradient(135deg,#f5f0ff,#ede8ff)",
    tabBar:"#f8faff",
  },
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&family=Rajdhani:wght@400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body,#root{width:100%;min-height:100vh}
  body{font-family:'Outfit',sans-serif}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
  @keyframes slideR{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}
  @keyframes slideU{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .fu{animation:fadeUp .38s cubic-bezier(.22,.68,0,1.05) both}
  .fu2{animation:fadeUp .38s .06s cubic-bezier(.22,.68,0,1.05) both}
  .fu3{animation:fadeUp .38s .12s cubic-bezier(.22,.68,0,1.05) both}
  .fu4{animation:fadeUp .38s .18s cubic-bezier(.22,.68,0,1.05) both}
  .sr{animation:slideR .22s ease both}
  .su{animation:slideU .18s ease both}
  .ai:focus{outline:none}
  .rh:hover{background:rgba(148,188,255,.025)!important}
  .ch{transition:box-shadow .18s,transform .18s}
  .ch:hover{transform:translateY(-1px)}
  .bs{transition:all .2s}
  .bs:hover{filter:brightness(1.1);transform:translateY(-1px)}
  .bs:active{transform:translateY(0)}
  .bd:hover{background:rgba(248,113,113,0.18)!important}
  .ts{position:relative;display:inline-block;width:38px;height:21px;flex-shrink:0}
  .ts input{opacity:0;width:0;height:0}
  .tsl{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;border-radius:21px;transition:.22s}
  .tsl:before{position:absolute;content:"";height:15px;width:15px;left:3px;bottom:3px;border-radius:50%;transition:.22s;background:white}
  input:checked+.tsl:before{transform:translateX(17px)}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(148,188,255,.15);border-radius:3px}
  ::-webkit-scrollbar-thumb:hover{background:rgba(148,188,255,.30)}
  input[type=number]::-webkit-inner-spin-button{opacity:.35}
  .contact-card:hover .contact-actions{opacity:1!important}
`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SM = [
  {key:"s1",   label:"Submerged Probe", sl:"S1",   icon:Snowflake,   unit:"°C", desc:"LN₂ submerged temperature"},
  {key:"s2",   label:"Vapor Phase",     sl:"S2",   icon:Thermometer, unit:"°C", desc:"Ullage zone temperature"},
  {key:"room", label:"Ambient Room",    sl:"ROOM", icon:Activity,    unit:"°C", desc:"Environmental monitor"},
  {key:"level",label:"Fill Level",      sl:"LVL",  icon:Droplets,    unit:"%",  desc:"Vessel liquid volume"},
];
const COLORS=["#4db8ff","#a78bfa","#34d399","#fbbf24","#f87171","#38bdf8","#fb923c","#e879f9","#22d3ee","#4ade80"];
const DV=()=>({s1:{min:-197.5,max:-194},s2:{min:-197,max:-193.5},room:{min:15,max:28},level:{min:70,max:100}});
const DA=()=>({
  sms:{enabled:true,numbers:[{id:1,label:"Primary On-Call",number:"",country:"+1",active:true,alerts:{rising:true,declining:true,outOfRange:true,lowLevel:true}}],globalTriggers:{rising:true,declining:true,outOfRange:true,lowLevel:true},cooldown:30,severity:"warn"},
  email:{enabled:true,addresses:[{id:1,label:"Lab Manager",email:"",active:true,alerts:{rising:true,declining:true,outOfRange:true,lowLevel:true}}],globalTriggers:{rising:true,declining:true,outOfRange:true,lowLevel:true},cooldown:15,severity:"warn",includeChart:true,dailyDigest:false,digestTime:"08:00"},
  thresholds:{risingRate:0.5,decliningRate:0.5,levelCrit:60,levelWarn:75},
});
const SK="ln2_v3";
const load=()=>{try{const r=localStorage.getItem(SK);if(r)return JSON.parse(r);}catch{}return null;};
const persist=(c)=>{try{localStorage.setItem(SK,JSON.stringify(c));}catch{}};

// ─── LIVE DATA ────────────────────────────────────────────────────────────────
const gl=(vs)=>vs.map((v,i)=>({
  id:i,name:`DU-${String(i+1).padStart(2,"0")}`,
  s1:+(v.s1.min+Math.random()*(v.s1.max-v.s1.min)).toFixed(2),
  s2:+(v.s2.min+Math.random()*(v.s2.max-v.s2.min)).toFixed(2),
  room:+(v.room.min+Math.random()*(v.room.max-v.room.min)).toFixed(2),
  level:+(v.level.min+Math.random()*(v.level.max-v.level.min)).toFixed(1),
  status:Math.random()>.1?"ok":Math.random()>.5?"warn":"err",
}));
const gp=(vs,lbl)=>{const p={time:lbl};vs.slice(0,5).forEach((_,i)=>{p[`s1_${i}`]=+(-195.5+i*.2+(Math.random()-.5)*.5).toFixed(2);p[`s2_${i}`]=+(-195+i*.15+(Math.random()-.5)*.4).toFixed(2);p[`rm_${i}`]=+(22+i*.3+(Math.random()-.5)*1.2).toFixed(2);p[`lv_${i}`]=+Math.min(100,Math.max(60,85-i*2+(Math.random()-.5)*4)).toFixed(1);});return p;};
const gs=(vs,n=20)=>Array.from({length:n},(_,i)=>{const d=new Date(Date.now()-(n-i)*60000);return gp(vs,`${d.getHours().toString().padStart(2,"00")}:${d.getMinutes().toString().padStart(2,"00")}`);});

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const PageWrap=({children})=><div style={{width:"100%"}}>{children}</div>;

const Chip=({c,children})=><span style={{display:"inline-flex",alignItems:"center",gap:3,background:`${c}22`,border:`1px solid ${c}40`,color:c,borderRadius:5,padding:"2px 8px",fontSize:9,fontWeight:700,letterSpacing:"0.08em",fontFamily:"'Rajdhani',sans-serif",whiteSpace:"nowrap"}}>{children}</span>;

const Dot=({status,t})=>{const c={ok:t.ok,warn:t.warn,err:t.err}[status]||t.textMuted;return(<div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:7,height:7,borderRadius:"50%",background:c,boxShadow:`0 0 7px ${c}`,animation:status==="err"?"pulse 1s infinite":"none"}}/><span style={{fontSize:10,fontWeight:700,color:c,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:"'Rajdhani',sans-serif"}}>{status==="ok"?"NOMINAL":status==="warn"?"WARNING":"ALERT"}</span></div>);};

const SHdr=({title,sub,t})=>(<div style={{marginBottom:16}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:3,height:16,background:`linear-gradient(180deg,${t.accent},${t.accent2})`,borderRadius:2}}/><h2 style={{fontSize:13,fontWeight:700,color:t.text,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.06em",textTransform:"uppercase"}}>{title}</h2></div>{sub&&<div style={{fontSize:11,color:t.textMuted,marginTop:4,marginLeft:11}}>{sub}</div>}</div>);

const Card=({children,t,className="",style={}})=>(<div className={`ch ${className}`} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,boxShadow:t.sh,...style}}>{children}</div>);

const StatCard=({icon:I,label,value,sub,color,t,d=""})=>(<div className={`ch fu${d}`} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"18px 20px",boxShadow:t.sh,position:"relative",overflow:"hidden",flex:1,minWidth:0}}><div style={{position:"absolute",top:0,right:0,width:70,height:70,background:`radial-gradient(circle at 70% 30%,${color}18,transparent 70%)`,borderRadius:"0 12px 0 0"}}/><div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14}}><div style={{background:`${color}20`,border:`1px solid ${color}30`,borderRadius:9,padding:8,display:"flex"}}><I size={15} color={color}/></div>{sub&&<span style={{fontSize:9,color:t.textMuted,fontFamily:"'Space Mono',monospace",letterSpacing:"0.05em"}}>{sub}</span>}</div><div style={{fontSize:28,fontWeight:800,color:t.text,fontFamily:"'Rajdhani',sans-serif",lineHeight:1}}>{value}</div><div style={{fontSize:10,color:t.textSub,marginTop:5,fontWeight:500,letterSpacing:"0.06em",textTransform:"uppercase"}}>{label}</div></div>);

const NI=({value,onChange,step=0.1,t,unit,warn=false,w=110})=>(<div style={{position:"relative",display:"flex",alignItems:"center"}}><input className="ai" type="number" step={step} value={value} onChange={e=>onChange(parseFloat(e.target.value))} style={{width:w,padding:"8px 30px 8px 12px",background:t.inBg,border:`1px solid ${warn?t.warn+"88":t.inBd}`,borderRadius:9,color:t.text,fontSize:13,fontWeight:600,fontFamily:"'Space Mono',monospace",transition:"border .15s,box-shadow .15s",boxShadow:warn?`0 0 0 3px ${t.warn}18`:"none"}} onFocus={e=>{e.target.style.borderColor=warn?t.warn:t.inFo;e.target.style.boxShadow=`0 0 0 3px ${warn?t.warn:t.accent}18`;}} onBlur={e=>{e.target.style.borderColor=warn?t.warn+"88":t.inBd;e.target.style.boxShadow=warn?`0 0 0 3px ${t.warn}18`:"none";}}/><span style={{position:"absolute",right:9,fontSize:10,color:t.textSub,fontWeight:700,pointerEvents:"none"}}>{unit}</span></div>);

const TI=({value,onChange,placeholder,t,prefix,type="text",full=true})=>(<div style={{position:"relative",display:"flex",alignItems:"center"}}>{prefix&&<span style={{position:"absolute",left:11,fontSize:13,color:t.textMuted,pointerEvents:"none",zIndex:1}}>{prefix}</span>}<input className="ai" type={type} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)} style={{width:full?"100%":"auto",padding:`9px 13px 9px ${prefix?"30px":"13px"}`,background:t.inBg,border:`1px solid ${t.inBd}`,borderRadius:9,color:t.text,fontSize:13,fontWeight:500,fontFamily:"'Outfit',sans-serif",transition:"border .15s,box-shadow .15s"}} onFocus={e=>{e.target.style.borderColor=t.inFo;e.target.style.boxShadow=`0 0 0 3px ${t.accent}18`;}} onBlur={e=>{e.target.style.borderColor=t.inBd;e.target.style.boxShadow="none";}}/></div>);

const Tog=({checked,onChange,t,color})=>{const c=color||t.accent;return(<label className="ts"><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}/><span className="tsl" style={{background:checked?c:t.tr,boxShadow:checked?`0 0 7px ${c}50`:"none"}}/></label>);};

const CB=({checked,onChange,t,ind=false})=>{const ref=useRef(null);useEffect(()=>{if(ref.current)ref.current.indeterminate=ind;},[ind]);return(<div ref={ref} onClick={e=>{e.stopPropagation();onChange(!checked);}} style={{width:17,height:17,borderRadius:5,border:`2px solid ${checked||ind?t.accent:t.inBd}`,background:checked||ind?`${t.accent}20`:t.cb,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .15s",flexShrink:0}}>{checked&&<svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2" fill="none" stroke={t.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}{!checked&&ind&&<div style={{width:7,height:2,background:t.accent,borderRadius:1}}/>}</div>);};

const Toast=({msg,ok,t})=>(<div style={{position:"fixed",bottom:24,right:24,zIndex:9999,background:ok?t.ok:t.err,color:"#fff",borderRadius:10,padding:"12px 20px",display:"flex",alignItems:"center",gap:8,fontSize:13,fontWeight:700,boxShadow:"0 8px 32px rgba(0,0,0,0.4)",animation:"fadeUp .3s ease both"}}><CheckCircle size={15}/> {msg}</div>);

const CTip=({active,payload,label,t,unit=""})=>{if(!active||!payload?.length)return null;return(<div style={{background:t.surfaceEl,border:`1px solid ${t.borderMd}`,borderRadius:10,padding:"11px 15px",minWidth:130,boxShadow:"0 12px 40px rgba(0,0,0,0.4)"}}><div style={{fontSize:9,color:t.textMuted,fontWeight:700,marginBottom:7,letterSpacing:"0.09em",fontFamily:"'Space Mono',monospace"}}>{label}</div>{payload.map((p,i)=>(<div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:14,marginBottom:3}}><div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:7,height:7,borderRadius:2,background:p.color}}/><span style={{fontSize:10,color:t.textSub}}>{p.name}</span></div><span style={{fontSize:11,fontWeight:700,color:t.text,fontFamily:"'Space Mono',monospace"}}>{p.value}{unit}</span></div>))}</div>);};

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
const OverviewTab=({vessels,liveData,timeData,t})=>{
  const valid=vessels.filter(v=>SM.every(s=>v[s.key].min<v[s.key].max)).length;
  const alerts=liveData.filter(d=>d.status==="err").length;
  const avgLv=liveData.length?(liveData.reduce((a,b)=>a+b.level,0)/liveData.length).toFixed(1):0;
  return(
    <PageWrap>
      <div style={{display:"flex",gap:14,marginBottom:20}}>
        <StatCard icon={Layers} label="Dewar Units" value={vessels.length} sub="CONFIGURED" color={t.accent} t={t}/>
        <StatCard icon={CheckCircle} label="Nominal" value={valid} sub="VESSELS" color={t.ok} t={t} d="2"/>
        <StatCard icon={AlertTriangle} label="Alerts" value={alerts} sub="CRITICAL" color={t.err} t={t} d="3"/>
        <StatCard icon={Droplets} label="Avg Fill Level" value={`${avgLv}%`} sub="FLEET" color={t.level} t={t} d="4"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        {[{k:"s1",lbl:"S1 · SUBMERGED PROBE",sub:"LN₂ submerged sensor — all vessels",c:t.s1},{k:"s2",lbl:"S2 · VAPOR PHASE",sub:"Ullage zone sensor — all vessels",c:t.s2}].map(cfg=>(
          <Card key={cfg.k} t={t} className="fu2" style={{padding:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div><div style={{fontSize:12,fontWeight:700,color:t.text,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.05em"}}>{cfg.lbl}</div><div style={{fontSize:10,color:t.textSub,marginTop:2}}>{cfg.sub}</div></div>
              <Chip c={cfg.c}>LIVE</Chip>
            </div>
            <ResponsiveContainer width="100%" height={165}>
              <LineChart data={timeData} margin={{top:4,right:4,left:-24,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.cg}/>
                <XAxis dataKey="time" tick={{fill:t.textMuted,fontSize:9,fontFamily:"Space Mono"}} tickLine={false} axisLine={{stroke:t.border}} interval={4}/>
                <YAxis tick={{fill:t.textMuted,fontSize:9,fontFamily:"Space Mono"}} tickLine={false} axisLine={false} domain={["auto","auto"]}/>
                <Tooltip content={<CTip t={t} unit="°C"/>}/>
                {vessels.slice(0,5).map((_,i)=><Line key={i} type="monotone" dataKey={`${cfg.k}_${i}`} name={`DU-${String(i+1).padStart(2,"00")}`} stroke={COLORS[i]} strokeWidth={1.5} dot={false} activeDot={{r:3}}/>)}
              </LineChart>
            </ResponsiveContainer>
          </Card>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <Card t={t} className="fu3" style={{padding:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div><div style={{fontSize:12,fontWeight:700,color:t.text,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.05em"}}>FILL LEVEL · ALL VESSELS</div><div style={{fontSize:10,color:t.textSub,marginTop:2}}>Current liquid volume percentage</div></div>
            <Chip c={t.level}>SNAPSHOT</Chip>
          </div>
          <ResponsiveContainer width="100%" height={165}>
            <BarChart data={liveData} margin={{top:4,right:4,left:-24,bottom:0}} barSize={11}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.cg} vertical={false}/>
              <XAxis dataKey="name" tick={{fill:t.textMuted,fontSize:9,fontFamily:"Space Mono"}} tickLine={false} axisLine={false}/>
              <YAxis domain={[0,100]} tick={{fill:t.textMuted,fontSize:9,fontFamily:"Space Mono"}} tickLine={false} axisLine={false}/>
              <Tooltip content={<CTip t={t} unit="%"/>}/>
              <ReferenceLine y={70} stroke={t.warn} strokeDasharray="4 4" strokeWidth={1}/>
              <Bar dataKey="level" name="Fill Level" fill={t.level} radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card t={t} className="fu3" style={{padding:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div><div style={{fontSize:12,fontWeight:700,color:t.text,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.05em"}}>AMBIENT TEMPERATURE TREND</div><div style={{fontSize:10,color:t.textSub,marginTop:2}}>Room sensor — first 5 vessels over time</div></div>
            <Chip c={t.room}>TREND</Chip>
          </div>
          <ResponsiveContainer width="100%" height={165}>
            <AreaChart data={timeData} margin={{top:4,right:4,left:-24,bottom:0}}>
              <defs>{vessels.slice(0,5).map((_,i)=><linearGradient key={i} id={`rg${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS[i]} stopOpacity={0.2}/><stop offset="95%" stopColor={COLORS[i]} stopOpacity={0}/></linearGradient>)}</defs>
              <CartesianGrid strokeDasharray="3 3" stroke={t.cg}/>
              <XAxis dataKey="time" tick={{fill:t.textMuted,fontSize:9,fontFamily:"Space Mono"}} tickLine={false} axisLine={{stroke:t.border}} interval={4}/>
              <YAxis tick={{fill:t.textMuted,fontSize:9,fontFamily:"Space Mono"}} tickLine={false} axisLine={false} domain={["auto","auto"]}/>
              <Tooltip content={<CTip t={t} unit="°C"/>}/>
              {vessels.slice(0,5).map((_,i)=><Area key={i} type="monotone" dataKey={`rm_${i}`} name={`DU-${String(i+1).padStart(2,"00")}`} stroke={COLORS[i]} strokeWidth={1.5} fill={`url(#rg${i})`} dot={false}/>)}
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card t={t} className="fu4" style={{padding:20}}>
        <SHdr title="FLEET HEALTH MATRIX" sub="Normalized sensor readings per vessel (% of optimal range)" t={t}/>
        <ResponsiveContainer width="100%" height={230}>
          <RadarChart data={liveData.slice(0,8).map(d=>({name:d.name,"S1":Math.min(100,Math.max(0,Math.abs((d.s1+196)/3*100))),"S2":Math.min(100,Math.max(0,Math.abs((d.s2+196)/3*100))),"Level":d.level,"Room":Math.min(100,Math.max(0,(d.room-15)/13*100))}))}>
            <PolarGrid stroke={t.border}/><PolarAngleAxis dataKey="name" tick={{fill:t.textSub,fontSize:10,fontFamily:"Space Mono"}}/><PolarRadiusAxis angle={30} domain={[0,100]} tick={{fill:t.textMuted,fontSize:8}}/>
            <Radar name="S1" dataKey="S1" stroke={t.s1} fill={t.s1} fillOpacity={0.1} strokeWidth={1.5}/>
            <Radar name="S2" dataKey="S2" stroke={t.s2} fill={t.s2} fillOpacity={0.1} strokeWidth={1.5}/>
            <Radar name="Level" dataKey="Level" stroke={t.level} fill={t.level} fillOpacity={0.1} strokeWidth={1.5}/>
            <Legend wrapperStyle={{fontSize:11,color:t.textSub}}/><Tooltip content={<CTip t={t} unit="%"/>}/>
          </RadarChart>
        </ResponsiveContainer>
      </Card>
    </PageWrap>
  );
};

// ─── SENSOR DATA TAB ──────────────────────────────────────────────────────────
const SensorDataTab=({liveData,vessels,t})=>{
  const [sk,setSk]=useState("id");const [sd,setSd]=useState("asc");const [f,setF]=useState("all");
  const hs=k=>{if(sk===k)setSd(d=>d==="asc"?"desc":"asc");else{setSk(k);setSd("asc");}};
  const rows=[...liveData].filter(d=>f==="all"||d.status===f).sort((a,b)=>{const av=a[sk],bv=b[sk];return sd==="asc"?(av>bv?1:-1):(av<bv?1:-1);});
  const th={padding:"10px 14px",fontSize:10,fontWeight:700,color:t.textSub,letterSpacing:"0.1em",textTransform:"uppercase",textAlign:"left",cursor:"pointer",userSelect:"none",whiteSpace:"nowrap",fontFamily:"'Rajdhani',sans-serif",borderBottom:`1px solid ${t.border}`,background:t.surfaceAlt};
  const cols=[{k:"name",l:"Unit"},{k:"status",l:"Status"},{k:"s1",l:"S1 Temp (°C)"},{k:"s2",l:"S2 Temp (°C)"},{k:"room",l:"Room Temp (°C)"},{k:"level",l:"Fill Level (%)"}];
  return(
    <PageWrap>
      <div className="fu" style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        <span style={{fontSize:11,color:t.textSub,fontWeight:600,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.06em",textTransform:"uppercase"}}>Filter:</span>
        {["all","ok","warn","err"].map(fv=>{const cc={all:t.accent,ok:t.ok,warn:t.warn,err:t.err}[fv];const ia=f===fv;const ll={all:"All",ok:"Nominal",warn:"Warning",err:"Alert"}[fv];return<button key={fv} onClick={()=>setF(fv)} style={{padding:"6px 13px",borderRadius:7,cursor:"pointer",background:ia?`${cc}22`:"transparent",border:`1px solid ${ia?cc+"55":t.border}`,color:ia?cc:t.textSub,fontSize:11,fontWeight:700,transition:"all .15s",fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.06em"}}>{ll}</button>;})}
        <div style={{marginLeft:"auto",fontSize:10,color:t.textMuted,fontFamily:"'Space Mono',monospace"}}>{rows.length}/{liveData.length} vessels</div>
      </div>
      <Card t={t} className="fu2" style={{overflow:"hidden",marginBottom:14}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{cols.map(c=><th key={c.k} style={th} onClick={()=>hs(c.k)}><span style={{color:sk===c.k?t.accent:t.textSub}}>{c.l}{sk===c.k?(sd==="asc"?" ↑":" ↓"):""}</span></th>)}<th style={th}>Health</th></tr></thead>
            <tbody>{rows.map(row=>{
              const v=vessels[row.id];
              const ok2={s1:v&&row.s1>=v.s1.min&&row.s1<=v.s1.max,s2:v&&row.s2>=v.s2.min&&row.s2<=v.s2.max,room:v&&row.room>=v.room.min&&row.room<=v.room.max,level:v&&row.level>=v.level.min&&row.level<=v.level.max};
              const tdS=(r)=>({padding:"11px 14px",fontSize:12,fontWeight:600,color:r?t.text:t.err,borderBottom:`1px solid ${t.border}`,fontFamily:"'Space Mono',monospace",background:!r?`${t.err}08`:"transparent"});
              return(<tr key={row.id} className="rh" style={{transition:"background .12s"}}>
                <td style={{padding:"11px 14px",borderBottom:`1px solid ${t.border}`}}><div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:28,height:28,borderRadius:7,background:`${t.accent}20`,border:`1px solid ${t.accent}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:t.accent,fontFamily:"'Rajdhani',sans-serif"}}>{String(row.id+1).padStart(2,"00")}</div><div><div style={{fontSize:12,fontWeight:700,color:t.text,fontFamily:"'Rajdhani',sans-serif"}}>{row.name}</div><div style={{fontSize:9,color:t.textMuted}}>Dewar Unit</div></div></div></td>
                <td style={{padding:"11px 14px",borderBottom:`1px solid ${t.border}`}}><Dot status={row.status} t={t}/></td>
                <td style={tdS(ok2.s1)}>{row.s1}°C{!ok2.s1&&<AlertTriangle size={10} style={{display:"inline",marginLeft:4}}/>}</td>
                <td style={tdS(ok2.s2)}>{row.s2}°C{!ok2.s2&&<AlertTriangle size={10} style={{display:"inline",marginLeft:4}}/>}</td>
                <td style={tdS(ok2.room)}>{row.room}°C{!ok2.room&&<AlertTriangle size={10} style={{display:"inline",marginLeft:4}}/>}</td>
                <td style={tdS(ok2.level)}><div style={{display:"flex",alignItems:"center",gap:7}}><div style={{flex:1,height:5,background:t.surfaceAlt,borderRadius:3,overflow:"hidden",minWidth:44}}><div style={{height:"100%",width:`${row.level}%`,background:row.level>80?t.ok:row.level>60?t.warn:t.err,borderRadius:3,transition:"width .5s"}}/></div><span style={{minWidth:40}}>{row.level}%</span></div></td>
                <td style={{padding:"11px 14px",borderBottom:`1px solid ${t.border}`}}><div style={{display:"flex",gap:3}}>{[ok2.s1,ok2.s2,ok2.room,ok2.level].map((o,i)=><div key={i} title={SM[i].label} style={{width:7,height:7,borderRadius:2,background:o?t.ok:t.err}}/>)}</div></td>
              </tr>);
            })}</tbody>
          </table>
        </div>
      </Card>
      <div className="fu3" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {SM.map(({key,label,unit,icon:Ic})=>{
          const vals=liveData.map(d=>d[key]);const avg=(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(key==="level"?1:2);const mn=Math.min(...vals).toFixed(key==="level"?1:2);const mx=Math.max(...vals).toFixed(key==="level"?1:2);const c=t[key];
          return(<Card key={key} t={t} style={{padding:16}}><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}><div style={{background:`${c}20`,borderRadius:7,padding:6,display:"flex"}}><Ic size={13} color={c}/></div><div style={{fontSize:10,fontWeight:700,color:t.textSub,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.06em",textTransform:"uppercase"}}>{label}</div></div>{[["AVG",avg],["MIN",mn],["MAX",mx]].map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}><span style={{fontSize:9,color:t.textMuted,fontWeight:700,letterSpacing:"0.1em"}}>{l}</span><span style={{fontSize:12,color:t.text,fontWeight:700,fontFamily:"'Space Mono',monospace"}}>{v}{unit}</span></div>)}</Card>);
        })}
      </div>
    </PageWrap>
  );
};

// ─── CONFIG TAB ───────────────────────────────────────────────────────────────
const ConfigTab=({vessels,onChange,onDelete,t})=>{
  const [sel,setSel]=useState(new Set());const [exp,setExp]=useState(null);const [bs,setBs]=useState(null);const [bv,setBv]=useState({min:"",max:""});const [done,setDone]=useState(false);
  const allS=sel.size===vessels.length&&vessels.length>0;const someS=sel.size>0&&!allS;
  const tgAll=()=>{if(allS)setSel(new Set());else setSel(new Set(vessels.map((_,i)=>i)));};
  const tgOne=idx=>setSel(p=>{const n=new Set(p);n.has(idx)?n.delete(idx):n.add(idx);return n;});
  const applyBulk=()=>{if(!bs||!sel.size)return;sel.forEach(idx=>{if(bv.min!=="")onChange(idx,bs,"min",parseFloat(bv.min));if(bv.max!=="")onChange(idx,bs,"max",parseFloat(bv.max));});setDone(true);setTimeout(()=>setDone(false),2000);};
  const delSel=()=>{[...sel].sort((a,b)=>b-a).forEach(i=>onDelete(i));setSel(new Set());};
  return(
    <PageWrap>
      <div className="fu" style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"12px 16px",marginBottom:12,boxShadow:t.sh}}>
        <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}><CB checked={allS} ind={someS} onChange={tgAll} t={t}/><span style={{fontSize:11,fontWeight:600,color:t.textSub}}>{sel.size===0?"Select all":`${sel.size} of ${vessels.length} selected`}</span></div>
          {sel.size>0&&(<><div style={{width:1,height:22,background:t.border}}/>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:9,color:t.textMuted,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.09em"}}>BULK EDIT:</span>
              {SM.map(s=>{const a=bs===s.key;return(<button key={s.key} onClick={()=>{setBs(a?null:s.key);setBv({min:"",max:""});}} style={{padding:"4px 10px",borderRadius:6,cursor:"pointer",border:`1px solid ${a?t[s.key]+"80":t.border}`,background:a?`${t[s.key]}20`:"transparent",color:a?t[s.key]:t.textSub,fontSize:10,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",transition:"all .15s"}}>{s.sl}</button>);})}
            </div>
            {bs&&(<div className="sr" style={{display:"flex",alignItems:"center",gap:7}}>
              <span style={{fontSize:10,color:t.textSub}}>Min</span>
              <input type="number" step={bs==="level"?1:0.1} placeholder="—" value={bv.min} onChange={e=>setBv(v=>({...v,min:e.target.value}))} className="ai" style={{width:82,padding:"5px 9px",background:t.inBg,border:`1px solid ${t.inBd}`,borderRadius:7,color:t.text,fontSize:12,fontFamily:"'Space Mono',monospace",fontWeight:600}} onFocus={e=>e.target.style.borderColor=t.inFo} onBlur={e=>e.target.style.borderColor=t.inBd}/>
              <span style={{fontSize:10,color:t.textSub}}>Max</span>
              <input type="number" step={bs==="level"?1:0.1} placeholder="—" value={bv.max} onChange={e=>setBv(v=>({...v,max:e.target.value}))} className="ai" style={{width:82,padding:"5px 9px",background:t.inBg,border:`1px solid ${t.inBd}`,borderRadius:7,color:t.text,fontSize:12,fontFamily:"'Space Mono',monospace",fontWeight:600}} onFocus={e=>e.target.style.borderColor=t.inFo} onBlur={e=>e.target.style.borderColor=t.inBd}/>
              <button onClick={applyBulk} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 12px",borderRadius:7,cursor:"pointer",background:done?`${t.ok}22`:`${t.accent}22`,border:`1px solid ${done?t.ok+"50":t.accent+"50"}`,color:done?t.ok:t.accent,fontSize:10,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",transition:"all .2s"}}>{done?<><CheckCircle size={11}/> APPLIED</>:<><Edit3 size={11}/> APPLY TO {sel.size}</>}</button>
              <button onClick={()=>setBs(null)} style={{width:26,height:26,borderRadius:7,background:"transparent",border:`1px solid ${t.border}`,color:t.textMuted,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={11}/></button>
            </div>)}
            <div style={{marginLeft:"auto",display:"flex",gap:7}}>
              <button onClick={()=>setSel(new Set())} style={{padding:"5px 11px",borderRadius:7,cursor:"pointer",background:"transparent",border:`1px solid ${t.border}`,color:t.textSub,fontSize:10,fontWeight:600}}>Clear</button>
              {vessels.length>1&&<button onClick={delSel} className="bd" style={{display:"flex",alignItems:"center",gap:4,padding:"5px 11px",borderRadius:7,cursor:"pointer",background:t.dangerGlow,border:`1px solid ${t.danger}35`,color:t.danger,fontSize:10,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",transition:"all .15s"}}><Trash2 size={11}/> DELETE {sel.size}</button>}
            </div>
          </>)}
          {sel.size===0&&<div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:5}}><Info size={11} color={t.textMuted}/><span style={{fontSize:10,color:t.textMuted}}>Select vessels to bulk-edit or delete</span></div>}
        </div>
      </div>
      {vessels.map((vessel,idx)=>{
        const io=exp===idx;const ic=sel.has(idx);const he=SM.some(s=>vessel[s.key].min>=vessel[s.key].max);
        return(<div key={idx} className="fu" style={{background:t.surface,border:`1px solid ${ic?t.accent+"55":he?t.warn+"55":t.border}`,borderRadius:12,overflow:"hidden",marginBottom:7,boxShadow:t.sh,transition:"box-shadow .18s,border-color .18s"}}>
          <div style={{display:"flex",alignItems:"center",padding:"12px 16px",gap:12}}>
            <div onClick={e=>{e.stopPropagation();tgOne(idx);}}><CB checked={ic} onChange={()=>tgOne(idx)} t={t}/></div>
            <div style={{width:34,height:34,borderRadius:9,flexShrink:0,background:`${t.accent}22`,border:`1px solid ${t.accent}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:t.accent,fontFamily:"'Rajdhani',sans-serif"}}>{String(idx+1).padStart(2,"00")}</div>
            <div className="rh" onClick={()=>setExp(io?null:idx)} style={{flex:1,cursor:"pointer",borderRadius:7,padding:"4px 7px",transition:"background .12s"}}>
              <div style={{fontSize:13,fontWeight:700,color:t.text,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.03em"}}>DEWAR UNIT DU-{String(idx+1).padStart(2,"00")}</div>
              <div style={{display:"flex",gap:12,marginTop:2,flexWrap:"wrap"}}>{SM.map(s=><span key={s.key} style={{fontSize:9,color:t.textSub,fontFamily:"'Space Mono',monospace"}}><span style={{color:t[s.key]}}>{s.sl}</span>: {vessel[s.key].min}–{vessel[s.key].max}{s.unit}</span>)}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              {he&&<Chip c={t.warn}><AlertTriangle size={9}/> INVALID</Chip>}
              <div style={{display:"flex",gap:3}}>{SM.map(s=>{const ok=vessel[s.key].min<vessel[s.key].max;return<div key={s.key} title={s.label} style={{width:6,height:6,borderRadius:"50%",background:ok?t.ok:t.err,boxShadow:`0 0 4px ${ok?t.ok:t.err}`}}/>;})}</div>
              {vessels.length>1&&<button onClick={e=>{e.stopPropagation();onDelete(idx);}} className="bd" style={{width:26,height:26,borderRadius:7,background:t.dangerGlow,border:`1px solid ${t.danger}35`,color:t.danger,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}><Trash2 size={11}/></button>}
              <div onClick={()=>setExp(io?null:idx)} style={{color:t.textSub,transition:"transform .2s",transform:io?"rotate(180deg)":"none",cursor:"pointer"}}><ChevronDown size={15}/></div>
            </div>
          </div>
          {io&&(<div style={{borderTop:`1px solid ${t.border}`,padding:18,background:t.surfaceAlt,animation:"fadeUp .2s ease both"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
              {SM.map(({key,label,icon:Ic,unit,desc})=>{
                const cfg=vessel[key];const inv=cfg.min>=cfg.max;const c=t[key];
                return(<div key={key} style={{background:t.surface,border:`1px solid ${inv?t.warn+"55":t.border}`,borderRadius:10,padding:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}><div style={{background:`${c}22`,borderRadius:7,padding:6,display:"flex"}}><Ic size={13} color={c}/></div><div><div style={{fontSize:11,fontWeight:700,color:t.text,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.04em"}}>{label.toUpperCase()}</div><div style={{fontSize:9,color:t.textSub,marginTop:1}}>{desc}</div></div></div>
                  {inv&&<div style={{display:"flex",alignItems:"center",gap:4,background:`${t.warn}18`,border:`1px solid ${t.warn}35`,borderRadius:7,padding:"5px 8px",marginBottom:10,fontSize:9,color:t.warn,fontWeight:700}}><AlertTriangle size={9}/> Min must be less than Max</div>}
                  {["min","max"].map(b=>(<div key={b} style={{marginBottom:9}}><div style={{fontSize:9,fontWeight:700,color:t.textSub,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:5,fontFamily:"'Rajdhani',sans-serif"}}>{b==="min"?"Min Threshold":"Max Threshold"}</div><NI value={cfg[b]} onChange={v=>onChange(idx,key,b,v)} step={key==="level"?1:0.1} t={t} unit={unit} warn={inv}/></div>))}
                </div>);
              })}
            </div>
          </div>)}
        </div>);
      })}
    </PageWrap>
  );
};

// ─── ADD VESSEL TAB ───────────────────────────────────────────────────────────
const AddVesselTab=({vessels,onAdd,t})=>{
  const [step,setStep]=useState(0);const [draft,setDraft]=useState(DV());const [name,setName]=useState("");const [desc,setDesc]=useState("");const [loc,setLoc]=useState("");const [done,setDone]=useState(false);
  const invalid=SM.some(s=>draft[s.key].min>=draft[s.key].max);
  const nextIdx=vessels.length+1;
  const PRESETS=[
    {icon:"🧬",label:"Cryogenic Storage",sub:"Standard LN₂ biobank",color:t.accent,config:DV()},
    {icon:"🔬",label:"Research Lab",sub:"Extended ranges",color:t.accent2,config:{s1:{min:-196,max:-193},s2:{min:-195.5,max:-192.5},room:{min:18,max:25},level:{min:60,max:100}}},
    {icon:"🏥",label:"Clinical Grade",sub:"Strict pharmaceutical",color:t.ok,config:{s1:{min:-197,max:-195},s2:{min:-196.5,max:-194.5},room:{min:15,max:22},level:{min:80,max:100}}},
    {icon:"⚗️",label:"Custom",sub:"Configure all params",color:t.warn,config:DV()},
  ];
  const STEPS=[{label:"Profile",icon:FlaskConical},{label:"Tolerances",icon:SlidersHorizontal},{label:"Review",icon:CheckCircle}];
  const handleSubmit=()=>{if(invalid)return;onAdd({...draft,_meta:{name:name||`DU-${String(nextIdx).padStart(2,"00")}`,desc,loc}});setDraft(DV());setName("");setDesc("");setLoc("");setDone(true);setStep(0);setTimeout(()=>setDone(false),3000);};
  return(
    <PageWrap>
      {done&&<div className="fu" style={{display:"flex",alignItems:"center",gap:11,background:`${t.ok}18`,border:`1px solid ${t.ok}40`,borderRadius:12,padding:"14px 20px",marginBottom:18}}><CheckCircle size={18} color={t.ok}/><div><div style={{fontSize:13,fontWeight:700,color:t.ok,fontFamily:"'Rajdhani',sans-serif"}}>VESSEL ADDED SUCCESSFULLY</div><div style={{fontSize:10,color:t.textSub,marginTop:2}}>Total fleet: {vessels.length} dewar units</div></div></div>}
      <div className="fu" style={{display:"flex",alignItems:"center",background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"14px 22px",marginBottom:22,boxShadow:t.sh}}>
        {STEPS.map((s,i)=>{const active=step===i;const d2=step>i;const Ic=s.icon;return(<React.Fragment key={i}><div style={{display:"flex",alignItems:"center",gap:9,flex:i<STEPS.length-1?1:"auto"}}>
          <div style={{width:32,height:32,borderRadius:9,background:d2?`${t.ok}22`:active?`${t.accent}22`:`${t.textMuted}14`,border:`1px solid ${d2?t.ok+"50":active?t.accent+"50":t.border}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .3s"}}>{d2?<CheckCircle size={14} color={t.ok}/>:<Ic size={14} color={active?t.accent:t.textMuted}/>}</div>
          <div><div style={{fontSize:11,fontWeight:700,color:active?t.text:d2?t.ok:t.textSub,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.06em",transition:"color .3s"}}>{s.label.toUpperCase()}</div><div style={{fontSize:9,color:t.textMuted}}>Step {i+1}</div></div>
          {i<STEPS.length-1&&<div style={{flex:1,height:1,background:`linear-gradient(90deg,${d2?t.ok+"60":active?t.accent+"30":t.border},${step>i+1?t.ok+"60":t.border})`,margin:"0 14px",transition:"all .3s"}}/>}
        </div></React.Fragment>);})}
      </div>
      {step===0&&(<div className="fu2">
        <SHdr title="SELECT VESSEL TEMPLATE" sub="Choose a preset configuration" t={t}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          {PRESETS.map((p,pi)=>(
            <button key={pi} onClick={()=>setDraft({...p.config})} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"18px 14px",cursor:"pointer",textAlign:"left",transition:"all .22s",boxShadow:t.sh,position:"relative",overflow:"hidden"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=p.color+"60";e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;e.currentTarget.style.transform="translateY(0)";}}>
              <div style={{position:"absolute",top:0,right:0,width:55,height:55,background:`radial-gradient(circle at 80% 20%,${p.color}20,transparent 70%)`}}/>
              <div style={{fontSize:26,marginBottom:10}}>{p.icon}</div>
              <div style={{fontSize:12,fontWeight:700,color:t.text,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.04em",marginBottom:3}}>{p.label.toUpperCase()}</div>
              <div style={{fontSize:10,color:t.textSub,marginBottom:10}}>{p.sub}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:3}}>{SM.map(s=><span key={s.key} style={{fontSize:8,color:p.color,fontFamily:"'Space Mono',monospace",background:`${p.color}18`,border:`1px solid ${p.color}28`,borderRadius:3,padding:"2px 4px"}}>{s.sl}: {p.config[s.key].min}–{p.config[s.key].max}</span>)}</div>
            </button>
          ))}
        </div>
        <SHdr title="VESSEL PROFILE" sub={`Identity for DU-${String(nextIdx).padStart(2,"00")}`} t={t}/>
        <Card t={t} style={{padding:20,marginBottom:18}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div><div style={{fontSize:9,fontWeight:700,color:t.textSub,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:7,fontFamily:"'Rajdhani',sans-serif"}}>Vessel Name <span style={{fontWeight:400,color:t.textMuted}}>(optional)</span></div><TI value={name} onChange={setName} placeholder={`DU-${String(nextIdx).padStart(2,"00")}`} t={t}/></div>
            <div><div style={{fontSize:9,fontWeight:700,color:t.textSub,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:7,fontFamily:"'Rajdhani',sans-serif"}}>Physical Location</div><TI value={loc} onChange={setLoc} placeholder="e.g. Lab B, Room 204" t={t}/></div>
          </div>
          <div><div style={{fontSize:9,fontWeight:700,color:t.textSub,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:7,fontFamily:"'Rajdhani',sans-serif"}}>Notes</div><TI value={desc} onChange={setDesc} placeholder="e.g. Primary stem cell storage" t={t}/></div>
        </Card>
        <div style={{display:"flex",justifyContent:"flex-end"}}>
          <button onClick={()=>setStep(1)} className="bs" style={{display:"flex",alignItems:"center",gap:7,padding:"10px 22px",borderRadius:10,cursor:"pointer",background:`linear-gradient(135deg,${t.accent},${t.accent2})`,border:"none",color:"#fff",fontSize:12,fontWeight:700,boxShadow:`0 4px 18px ${t.accentGlow}`,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.06em"}}>CONFIGURE TOLERANCES <ArrowRight size={14}/></button>
        </div>
      </div>)}
      {step===1&&(<div className="fu2">
        <SHdr title="SENSOR THRESHOLDS" sub="Set min/max operating ranges for each sensor" t={t}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}}>
          {SM.map(({key,label,icon:Ic,unit,desc})=>{
            const cfg=draft[key];const inv=cfg.min>=cfg.max;const c=t[key];
            return(<Card key={key} t={t} style={{padding:20,border:`1px solid ${inv?t.warn+"55":t.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:16}}>
                <div style={{width:38,height:38,borderRadius:10,background:`${c}22`,border:`1px solid ${c}35`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ic size={17} color={c}/></div>
                <div><div style={{fontSize:13,fontWeight:700,color:t.text,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.04em"}}>{label.toUpperCase()}</div><div style={{fontSize:10,color:t.textSub,marginTop:1}}>{desc} · <span style={{color:c,fontWeight:700}}>{unit}</span></div></div>
              </div>
              {inv&&<div style={{display:"flex",alignItems:"center",gap:5,background:`${t.warn}18`,border:`1px solid ${t.warn}35`,borderRadius:8,padding:"7px 11px",marginBottom:12,fontSize:9,color:t.warn,fontWeight:700}}><AlertTriangle size={11}/> Min must be less than Max</div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {["min","max"].map(b=>(<div key={b}><div style={{fontSize:9,fontWeight:700,color:t.textSub,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:7,fontFamily:"'Rajdhani',sans-serif"}}>{b==="min"?"▼ Minimum":"▲ Maximum"}</div><NI value={cfg[b]} onChange={v=>setDraft(d=>({...d,[key]:{...d[key],[b]:v}}))} step={key==="level"?1:0.1} t={t} unit={unit} warn={inv} w={120}/></div>))}
              </div>
              <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${t.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:9,color:t.textMuted,fontFamily:"'Space Mono',monospace"}}>{cfg.min}{unit}</span><span style={{fontSize:9,color:t.textMuted,fontFamily:"'Space Mono',monospace"}}>{cfg.max}{unit}</span></div>
                <div style={{height:5,background:t.surfaceAlt,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:inv?"0%":"100%",background:`linear-gradient(90deg,${c}80,${c})`,borderRadius:3,transition:"width .4s"}}/></div>
                {!inv&&<div style={{fontSize:9,color:c,textAlign:"center",marginTop:3,fontFamily:"'Space Mono',monospace",fontWeight:700}}>Range: {(cfg.max-cfg.min).toFixed(key==="level"?0:1)}{unit}</div>}
              </div>
            </Card>);
          })}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",gap:9}}>
          <button onClick={()=>setStep(0)} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 18px",borderRadius:10,cursor:"pointer",background:"transparent",border:`1px solid ${t.border}`,color:t.textSub,fontSize:12,fontWeight:600}}><ArrowLeft size={13}/> Back</button>
          <div style={{display:"flex",gap:9}}>
            <button onClick={()=>setDraft(DV())} style={{padding:"10px 16px",borderRadius:10,cursor:"pointer",background:"transparent",border:`1px solid ${t.border}`,color:t.textSub,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:5}}><RotateCcw size={12}/> Reset</button>
            <button onClick={()=>setStep(2)} disabled={invalid} className="bs" style={{display:"flex",alignItems:"center",gap:7,padding:"10px 22px",borderRadius:10,cursor:invalid?"not-allowed":"pointer",background:invalid?t.surfaceAlt:`linear-gradient(135deg,${t.accent},${t.accent2})`,border:"none",color:invalid?t.textMuted:"#fff",fontSize:12,fontWeight:700,boxShadow:invalid?"none":`0 4px 18px ${t.accentGlow}`,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.06em"}}>REVIEW & ADD <ArrowRight size={14}/></button>
          </div>
        </div>
      </div>)}
      {step===2&&(<div className="fu2">
        <SHdr title="REVIEW & CONFIRM" sub="Confirm configuration before adding to fleet" t={t}/>
        <Card t={t} style={{overflow:"hidden",marginBottom:18}}>
          <div style={{background:t.surfaceAlt,borderBottom:`1px solid ${t.border}`,padding:"18px 22px",display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:44,height:44,borderRadius:12,background:`${t.accent}22`,border:`1px solid ${t.accent}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:t.accent,fontFamily:"'Rajdhani',sans-serif"}}>{String(nextIdx).padStart(2,"00")}</div>
            <div><div style={{fontSize:16,fontWeight:800,color:t.text,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.04em"}}>{name||`DU-${String(nextIdx).padStart(2,"00")}`}</div><div style={{fontSize:10,color:t.textSub,marginTop:2}}>{loc?`📍 ${loc}`:"No location"}{desc?` · ${desc}`:""}</div></div>
            <div style={{marginLeft:"auto"}}><Chip c={t.ok}>READY TO ADD</Chip></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)"}}>
            {SM.map(({key,label,icon:Ic,unit},i)=>{
              const cfg=draft[key];const c=t[key];const inv=cfg.min>=cfg.max;
              return(<div key={key} style={{padding:"16px 18px",borderRight:i<3?`1px solid ${t.border}`:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}><div style={{background:`${c}20`,borderRadius:6,padding:5,display:"flex"}}><Ic size={12} color={c}/></div><span style={{fontSize:10,fontWeight:700,color:t.textSub,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.05em"}}>{label}</span></div>
                <div style={{fontSize:15,fontWeight:800,color:inv?t.warn:c,fontFamily:"'Space Mono',monospace"}}>{cfg.min}<span style={{fontSize:10,color:t.textMuted,fontWeight:400}}>{unit}</span></div>
                <div style={{fontSize:9,color:t.textMuted,margin:"2px 0"}}>to</div>
                <div style={{fontSize:15,fontWeight:800,color:inv?t.warn:c,fontFamily:"'Space Mono',monospace"}}>{cfg.max}<span style={{fontSize:10,color:t.textMuted,fontWeight:400}}>{unit}</span></div>
                {inv&&<div style={{fontSize:9,color:t.warn,marginTop:5,fontWeight:700}}>⚠ Invalid</div>}
              </div>);
            })}
          </div>
        </Card>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <button onClick={()=>setStep(1)} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 18px",borderRadius:10,cursor:"pointer",background:"transparent",border:`1px solid ${t.border}`,color:t.textSub,fontSize:12,fontWeight:600}}><ArrowLeft size={13}/> Back</button>
          <button onClick={handleSubmit} disabled={invalid} className="bs" style={{display:"flex",alignItems:"center",gap:7,padding:"11px 28px",borderRadius:10,cursor:invalid?"not-allowed":"pointer",background:invalid?t.surfaceAlt:`linear-gradient(135deg,${t.accent},${t.accent2})`,border:"none",color:invalid?t.textMuted:"#fff",fontSize:13,fontWeight:800,boxShadow:invalid?"none":`0 6px 22px ${t.accentGlow}`,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.08em"}}>
            <Plus size={15}/> ADD DU-{String(nextIdx).padStart(2,"00")} TO FLEET
          </button>
        </div>
      </div>)}
    </PageWrap>
  );
};

// ─── ALERTS TAB ───────────────────────────────────────────────────────────────
const TRIGGERS=[
  {key:"rising",    label:"Temperature Rising",    icon:TrendingUp,    desc:"Fires when reading climbs faster than configured rate"},
  {key:"declining", label:"Temperature Declining", icon:TrendingDown,  desc:"Fires when reading drops faster than configured rate"},
  {key:"outOfRange",label:"Out of Range",          icon:AlertTriangle, desc:"Reading exits the configured min/max band"},
  {key:"lowLevel",  label:"Low Fill Level",        icon:Droplets,      desc:"LN₂ level below warning or critical threshold"},
];
const COUNTRIES=[{code:"+1",flag:"🇺🇸"},{code:"+44",flag:"🇬🇧"},{code:"+91",flag:"🇮🇳"},{code:"+61",flag:"🇦🇺"},{code:"+49",flag:"🇩🇪"},{code:"+33",flag:"🇫🇷"},{code:"+81",flag:"🇯🇵"},{code:"+86",flag:"🇨🇳"}];

const AlertsTab=({alertConfig,setAlertConfig,t})=>{
  const [saved,setSaved]=useState(false);const [sec,setSec]=useState("sms");
  const us=p=>setAlertConfig(c=>({...c,sms:{...c.sms,...p}}));
  const ue=p=>setAlertConfig(c=>({...c,email:{...c.email,...p}}));
  const ut=p=>setAlertConfig(c=>({...c,thresholds:{...c.thresholds,...p}}));
  const addNum=()=>us({numbers:[...alertConfig.sms.numbers,{id:Date.now(),label:"",number:"",country:"+1",active:true,alerts:{rising:true,declining:true,outOfRange:true,lowLevel:true}}]});
  const rmNum=id=>us({numbers:alertConfig.sms.numbers.filter(n=>n.id!==id)});
  const upNum=(id,f,v)=>us({numbers:alertConfig.sms.numbers.map(n=>n.id===id?{...n,[f]:v}:n)});
  const upNA=(id,k,v)=>us({numbers:alertConfig.sms.numbers.map(n=>n.id===id?{...n,alerts:{...n.alerts,[k]:v}}:n)});
  const addAddr=()=>ue({addresses:[...alertConfig.email.addresses,{id:Date.now(),label:"",email:"",active:true,alerts:{rising:true,declining:true,outOfRange:true,lowLevel:true}}]});
  const rmAddr=id=>ue({addresses:alertConfig.email.addresses.filter(n=>n.id!==id)});
  const upAddr=(id,f,v)=>ue({addresses:alertConfig.email.addresses.map(n=>n.id===id?{...n,[f]:v}:n)});
  const upAA=(id,k,v)=>ue({addresses:alertConfig.email.addresses.map(n=>n.id===id?{...n,alerts:{...n.alerts,[k]:v}}:n)});
  const TM=({checked,onChange,label,color})=>(<div onClick={onChange} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:5,background:checked?`${color}20`:`${t.surfaceEl}`,border:`1px solid ${checked?color+"45":t.border}`,cursor:"pointer",transition:"all .15s"}}><div style={{width:5,height:5,borderRadius:"50%",background:checked?color:t.textMuted,transition:"all .15s"}}/><span style={{fontSize:9,fontWeight:700,color:checked?color:t.textSub,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.06em"}}>{label}</span></div>);
  const secs=[{id:"sms",label:"SMS / Text",icon:Smartphone,color:t.ok},{id:"email",label:"Email",icon:Mail,color:t.accent2},{id:"thresholds",label:"Thresholds",icon:SlidersHorizontal,color:t.warn}];
  return(
    <PageWrap>
      <div className="fu" style={{display:"flex",gap:8,marginBottom:18,background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:7,boxShadow:t.sh}}>
        {secs.map(s=>{const ia=sec===s.id;const Ic=s.icon;return(<button key={s.id} onClick={()=>setSec(s.id)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"10px 14px",borderRadius:9,cursor:"pointer",background:ia?`${s.color}20`:"transparent",border:`1px solid ${ia?s.color+"45":t.border}`,color:ia?s.color:t.textSub,fontSize:11,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.07em",transition:"all .18s"}}><Ic size={14}/>{s.label.toUpperCase()}{s.id==="sms"&&<span style={{background:`${t.ok}22`,color:t.ok,borderRadius:4,padding:"1px 5px",fontSize:8,fontWeight:800}}>{alertConfig.sms.numbers.length}</span>}{s.id==="email"&&<span style={{background:`${t.accent2}22`,color:t.accent2,borderRadius:4,padding:"1px 5px",fontSize:8,fontWeight:800}}>{alertConfig.email.addresses.length}</span>}</button>);})}
      </div>
      {sec==="sms"&&(<div className="fu2">
        <div style={{background:t.surface,border:`1px solid ${alertConfig.sms.enabled?t.ok+"40":t.border}`,borderRadius:12,padding:"14px 18px",marginBottom:14,boxShadow:t.sh,display:"flex",alignItems:"center",justifyContent:"space-between",transition:"border-color .3s"}}>
          <div style={{display:"flex",alignItems:"center",gap:11}}><div style={{width:38,height:38,borderRadius:10,background:alertConfig.sms.enabled?`${t.ok}22`:`${t.textMuted}12`,border:`1px solid ${alertConfig.sms.enabled?t.ok+"50":t.border}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .3s"}}><Smartphone size={16} color={alertConfig.sms.enabled?t.ok:t.textMuted}/></div><div><div style={{fontSize:14,fontWeight:700,color:t.text,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.04em"}}>SMS ALERT SYSTEM</div><div style={{fontSize:10,color:t.textSub,marginTop:2}}>{alertConfig.sms.numbers.filter(n=>n.active).length} active · {alertConfig.sms.cooldown}min cooldown</div></div></div>
          <div style={{display:"flex",alignItems:"center",gap:9}}><span style={{fontSize:10,fontWeight:700,color:alertConfig.sms.enabled?t.ok:t.textMuted,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.08em"}}>{alertConfig.sms.enabled?"ENABLED":"DISABLED"}</span><Tog checked={alertConfig.sms.enabled} onChange={v=>us({enabled:v})} t={t} color={t.ok}/></div>
        </div>
        <div style={{opacity:alertConfig.sms.enabled?1:0.45,transition:"opacity .3s",pointerEvents:alertConfig.sms.enabled?"all":"none"}}>
          <Card t={t} style={{overflow:"hidden",marginBottom:14}}>
            <div style={{padding:"13px 18px",borderBottom:`1px solid ${t.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:t.surfaceAlt}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}><div style={{background:`${t.ok}22`,borderRadius:7,padding:6,display:"flex"}}><Phone size={13} color={t.ok}/></div><div><div style={{fontSize:12,fontWeight:700,color:t.text,fontFamily:"'Rajdhani',sans-serif"}}>PHONE NUMBERS</div><div style={{fontSize:10,color:t.textSub}}>Per-recipient triggers</div></div></div>
              <button onClick={addNum} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:8,cursor:"pointer",background:`${t.ok}22`,border:`1px solid ${t.ok}40`,color:t.ok,fontSize:10,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.background=t.ok;e.currentTarget.style.color="#fff";}} onMouseLeave={e=>{e.currentTarget.style.background=`${t.ok}22`;e.currentTarget.style.color=t.ok;}}><Plus size={11}/> ADD NUMBER</button>
            </div>
            <div style={{padding:8}}>
              {alertConfig.sms.numbers.length===0&&<div style={{padding:"24px",textAlign:"center",color:t.textSub,fontSize:12}}>No phone numbers configured.</div>}
              {alertConfig.sms.numbers.map((item,ni)=>(
                <div key={item.id} className="su" style={{background:ni%2===0?t.surfaceAlt:"transparent",borderRadius:9,padding:"12px 14px",marginBottom:3}}>
                  <div style={{display:"grid",gridTemplateColumns:"auto 1fr 1fr auto",gap:10,alignItems:"center",marginBottom:9}}>
                    <Tog checked={item.active} onChange={v=>upNum(item.id,"active",v)} t={t} color={t.ok}/>
                    <TI value={item.label} onChange={v=>upNum(item.id,"label",v)} placeholder="Recipient label" t={t}/>
                    <div style={{display:"flex",gap:5}}><select value={item.country} onChange={e=>upNum(item.id,"country",e.target.value)} className="ai" style={{padding:"8px 9px",background:t.inBg,border:`1px solid ${t.inBd}`,borderRadius:8,color:t.text,fontSize:11,cursor:"pointer",flexShrink:0}}>{COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}</select><TI value={item.number} onChange={v=>upNum(item.id,"number",v)} placeholder="555 000 0000" t={t} type="tel"/></div>
                    <button onClick={()=>rmNum(item.id)} className="bd" style={{width:30,height:30,borderRadius:8,background:t.dangerGlow,border:`1px solid ${t.danger}30`,color:t.danger,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",flexShrink:0}}><X size={12}/></button>
                  </div>
                  <div style={{paddingLeft:48}}><div style={{fontSize:9,fontWeight:700,color:t.textSub,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5,fontFamily:"'Rajdhani',sans-serif"}}>Alert on:</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{TRIGGERS.map(tg=><TM key={tg.key} checked={item.alerts?.[tg.key]??true} onChange={()=>upNA(item.id,tg.key,!(item.alerts?.[tg.key]??true))} label={tg.label.split(" ").slice(0,2).join(" ")} color={t.ok}/>)}</div></div>
                </div>
              ))}
            </div>
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Card t={t} style={{padding:15}}><div style={{fontSize:10,fontWeight:700,color:t.textSub,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:10}}>Cooldown Period</div><div style={{display:"flex",alignItems:"center",gap:9}}><NI value={alertConfig.sms.cooldown} onChange={v=>us({cooldown:v})} step={5} t={t} unit="min" w={96}/><span style={{fontSize:10,color:t.textSub}}>between alerts</span></div></Card>
            <Card t={t} style={{padding:15}}><div style={{fontSize:10,fontWeight:700,color:t.textSub,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:10}}>Minimum Severity</div><div style={{display:"flex",gap:7}}>{[{v:"warn",l:"Warning",c:t.warn},{v:"err",l:"Critical",c:t.err}].map(o=><button key={o.v} onClick={()=>us({severity:o.v})} style={{flex:1,padding:"8px 10px",borderRadius:8,cursor:"pointer",background:alertConfig.sms.severity===o.v?`${o.c}22`:"transparent",border:`1px solid ${alertConfig.sms.severity===o.v?o.c+"55":t.border}`,color:alertConfig.sms.severity===o.v?o.c:t.textSub,fontSize:11,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",transition:"all .18s"}}>{o.l}</button>)}</div></Card>
          </div>
        </div>
      </div>)}
      {sec==="email"&&(<div className="fu2">
        <div style={{background:t.surface,border:`1px solid ${alertConfig.email.enabled?t.accent2+"40":t.border}`,borderRadius:12,padding:"14px 18px",marginBottom:14,boxShadow:t.sh,display:"flex",alignItems:"center",justifyContent:"space-between",transition:"border-color .3s"}}>
          <div style={{display:"flex",alignItems:"center",gap:11}}><div style={{width:38,height:38,borderRadius:10,background:alertConfig.email.enabled?`${t.accent2}22`:`${t.textMuted}12`,border:`1px solid ${alertConfig.email.enabled?t.accent2+"50":t.border}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .3s"}}><Mail size={16} color={alertConfig.email.enabled?t.accent2:t.textMuted}/></div><div><div style={{fontSize:14,fontWeight:700,color:t.text,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.04em"}}>EMAIL ALERT SYSTEM</div><div style={{fontSize:10,color:t.textSub,marginTop:2}}>{alertConfig.email.addresses.filter(a=>a.active).length} active · {alertConfig.email.cooldown}min cooldown</div></div></div>
          <div style={{display:"flex",alignItems:"center",gap:9}}><span style={{fontSize:10,fontWeight:700,color:alertConfig.email.enabled?t.accent2:t.textMuted,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.08em"}}>{alertConfig.email.enabled?"ENABLED":"DISABLED"}</span><Tog checked={alertConfig.email.enabled} onChange={v=>ue({enabled:v})} t={t} color={t.accent2}/></div>
        </div>
        <div style={{opacity:alertConfig.email.enabled?1:0.45,transition:"opacity .3s",pointerEvents:alertConfig.email.enabled?"all":"none"}}>
          <Card t={t} style={{overflow:"hidden",marginBottom:14}}>
            <div style={{padding:"13px 18px",borderBottom:`1px solid ${t.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:t.surfaceAlt}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}><div style={{background:`${t.accent2}22`,borderRadius:7,padding:6,display:"flex"}}><AtSign size={13} color={t.accent2}/></div><div><div style={{fontSize:12,fontWeight:700,color:t.text,fontFamily:"'Rajdhani',sans-serif"}}>EMAIL ADDRESSES</div><div style={{fontSize:10,color:t.textSub}}>Per-recipient triggers</div></div></div>
              <button onClick={addAddr} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:8,cursor:"pointer",background:`${t.accent2}22`,border:`1px solid ${t.accent2}40`,color:t.accent2,fontSize:10,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.background=t.accent2;e.currentTarget.style.color="#fff";}} onMouseLeave={e=>{e.currentTarget.style.background=`${t.accent2}22`;e.currentTarget.style.color=t.accent2;}}><Plus size={11}/> ADD EMAIL</button>
            </div>
            <div style={{padding:8}}>
              {alertConfig.email.addresses.length===0&&<div style={{padding:"24px",textAlign:"center",color:t.textSub,fontSize:12}}>No email addresses configured.</div>}
              {alertConfig.email.addresses.map((item,ni)=>(
                <div key={item.id} className="su" style={{background:ni%2===0?t.surfaceAlt:"transparent",borderRadius:9,padding:"12px 14px",marginBottom:3}}>
                  <div style={{display:"grid",gridTemplateColumns:"auto 1fr 1fr auto",gap:10,alignItems:"center",marginBottom:9}}>
                    <Tog checked={item.active} onChange={v=>upAddr(item.id,"active",v)} t={t} color={t.accent2}/>
                    <TI value={item.label} onChange={v=>upAddr(item.id,"label",v)} placeholder="Recipient name" t={t}/>
                    <TI value={item.email} onChange={v=>upAddr(item.id,"email",v)} placeholder="name@organisation.com" t={t} type="email" prefix="@"/>
                    <button onClick={()=>rmAddr(item.id)} className="bd" style={{width:30,height:30,borderRadius:8,background:t.dangerGlow,border:`1px solid ${t.danger}30`,color:t.danger,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",flexShrink:0}}><X size={12}/></button>
                  </div>
                  <div style={{paddingLeft:48}}><div style={{fontSize:9,fontWeight:700,color:t.textSub,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5,fontFamily:"'Rajdhani',sans-serif"}}>Alert on:</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{TRIGGERS.map(tg=><TM key={tg.key} checked={item.alerts?.[tg.key]??true} onChange={()=>upAA(item.id,tg.key,!(item.alerts?.[tg.key]??true))} label={tg.label.split(" ").slice(0,2).join(" ")} color={t.accent2}/>)}</div></div>
                </div>
              ))}
            </div>
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <Card t={t} style={{padding:15}}><div style={{fontSize:10,fontWeight:700,color:t.textSub,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:10}}>Cooldown</div><NI value={alertConfig.email.cooldown} onChange={v=>ue({cooldown:v})} step={5} t={t} unit="min" w={96}/></Card>
            <Card t={t} style={{padding:15}}><div style={{fontSize:10,fontWeight:700,color:t.textSub,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:10}}>Severity</div><div style={{display:"flex",gap:7}}>{[{v:"warn",l:"Warning",c:t.warn},{v:"err",l:"Critical",c:t.err}].map(o=><button key={o.v} onClick={()=>ue({severity:o.v})} style={{flex:1,padding:"7px 7px",borderRadius:8,cursor:"pointer",background:alertConfig.email.severity===o.v?`${o.c}22`:"transparent",border:`1px solid ${alertConfig.email.severity===o.v?o.c+"55":t.border}`,color:alertConfig.email.severity===o.v?o.c:t.textSub,fontSize:10,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",transition:"all .18s"}}>{o.l}</button>)}</div></Card>
            <Card t={t} style={{padding:15}}><div style={{fontSize:10,fontWeight:700,color:t.textSub,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:9}}>Options</div>{[{k:"includeChart",l:"Attach chart"},{k:"dailyDigest",l:"Daily digest"}].map(o=><div key={o.k} onClick={()=>ue({[o.k]:!alertConfig.email[o.k]})} style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",marginBottom:7}}><span style={{fontSize:11,color:t.textSub}}>{o.l}</span><Tog checked={alertConfig.email[o.k]} onChange={v=>ue({[o.k]:v})} t={t} color={t.accent2}/></div>)}{alertConfig.email.dailyDigest&&<input type="time" value={alertConfig.email.digestTime} onChange={e=>ue({digestTime:e.target.value})} className="ai" style={{padding:"6px 9px",background:t.inBg,border:`1px solid ${t.inBd}`,borderRadius:7,color:t.text,fontSize:11,fontWeight:600,fontFamily:"'Space Mono',monospace",width:"100%",marginTop:6}}/>}</Card>
          </div>
        </div>
      </div>)}
      {sec==="thresholds"&&(<div className="fu2">
        <SHdr title="ALERT TRIGGER THRESHOLDS" sub="Define conditions that fire alerts across all channels" t={t}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}}>
          {[
            {l:"Rising Rate Limit",k:"risingRate",u:"°C/min",icon:TrendingUp,c:t.err,d:"Alert when any sensor rises faster than this rate"},
            {l:"Declining Rate Limit",k:"decliningRate",u:"°C/min",icon:TrendingDown,c:t.accent2,d:"Alert when any sensor drops faster than this rate"},
            {l:"Fill Level Warning",k:"levelWarn",u:"%",icon:Droplets,c:t.warn,d:"Notify when fill drops below this percentage"},
            {l:"Fill Level Critical",k:"levelCrit",u:"%",icon:AlertTriangle,c:t.err,d:"Critical alert below this percentage"},
          ].map(({l,k,u,icon:Ic,c,d})=>(
            <Card key={k} t={t} style={{padding:18}}>
              <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:12}}><div style={{width:36,height:36,borderRadius:9,background:`${c}22`,border:`1px solid ${c}35`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ic size={15} color={c}/></div><div><div style={{fontSize:12,fontWeight:700,color:t.text,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.04em"}}>{l.toUpperCase()}</div><div style={{fontSize:10,color:t.textSub,marginTop:2}}>{d}</div></div></div>
              <NI value={alertConfig.thresholds[k]} onChange={v=>ut({[k]:v})} step={k.includes("level")?1:0.1} t={t} unit={u} w={120}/>
            </Card>
          ))}
        </div>
        <Card t={t} style={{padding:18}}>
          <div style={{fontSize:11,fontWeight:700,color:t.textSub,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:12}}>Trigger Reference</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            {TRIGGERS.map(tg=>{const Ic=tg.icon;return(<div key={tg.key} style={{display:"flex",alignItems:"flex-start",gap:9,padding:"11px 13px",background:t.surfaceAlt,borderRadius:9,border:`1px solid ${t.border}`}}><div style={{background:`${t.accent}22`,borderRadius:6,padding:5,display:"flex",flexShrink:0,marginTop:1}}><Ic size={11} color={t.accent}/></div><div><div style={{fontSize:11,fontWeight:700,color:t.text,fontFamily:"'Rajdhani',sans-serif"}}>{tg.label}</div><div style={{fontSize:10,color:t.textSub,marginTop:2}}>{tg.desc}</div></div></div>);})}
          </div>
        </Card>
      </div>)}
      <div className="fu4" style={{display:"flex",justifyContent:"flex-end",marginTop:18}}>
        <button onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2200);}} className="bs" style={{display:"flex",alignItems:"center",gap:7,padding:"10px 26px",borderRadius:10,cursor:"pointer",background:saved?`linear-gradient(135deg,${t.ok},#059669)`:`linear-gradient(135deg,${t.accent},${t.accent2})`,border:"none",color:"#fff",fontSize:12,fontWeight:700,boxShadow:`0 4px 18px ${t.accentGlow}`,transition:"all .3s",fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.07em"}}>
          {saved?<><CheckCircle size={14}/> SAVED</>:<><Save size={14}/> SAVE ALERT CONFIG</>}
        </button>
      </div>
    </PageWrap>
  );
};

// ─── CONTACTS TAB ─────────────────────────────────────────────────────────────
const ContactsTab=({alertConfig,setAlertConfig,t})=>{
  const [view,setView]=useState("both");const [q,setQ]=useState("");
  const us=p=>setAlertConfig(c=>({...c,sms:{...c.sms,...p}}));
  const ue=p=>setAlertConfig(c=>({...c,email:{...c.email,...p}}));
  const upNum=(id,f,v)=>us({numbers:alertConfig.sms.numbers.map(n=>n.id===id?{...n,[f]:v}:n)});
  const upAddr=(id,f,v)=>ue({addresses:alertConfig.email.addresses.map(n=>n.id===id?{...n,[f]:v}:n)});
  const rmNum=id=>us({numbers:alertConfig.sms.numbers.filter(n=>n.id!==id)});
  const rmAddr=id=>ue({addresses:alertConfig.email.addresses.filter(n=>n.id!==id)});
  const nums=alertConfig.sms.numbers.filter(n=>!q||n.label.toLowerCase().includes(q.toLowerCase())||n.number.includes(q));
  const addrs=alertConfig.email.addresses.filter(a=>!q||a.label.toLowerCase().includes(q.toLowerCase())||a.email.toLowerCase().includes(q.toLowerCase()));
  const totalActive=[...alertConfig.sms.numbers,...alertConfig.email.addresses].filter(x=>x.active).length;
  const total=alertConfig.sms.numbers.length+alertConfig.email.addresses.length;
  return(
    <PageWrap>
      <div className="fu" style={{display:"flex",gap:14,marginBottom:18}}>
        <StatCard icon={Users} label="Total Contacts" value={total} sub="CONFIGURED" color={t.accent} t={t}/>
        <StatCard icon={Smartphone} label="SMS Numbers" value={alertConfig.sms.numbers.length} sub="RECIPIENTS" color={t.ok} t={t} d="2"/>
        <StatCard icon={Mail} label="Email Addresses" value={alertConfig.email.addresses.length} sub="RECIPIENTS" color={t.accent2} t={t} d="3"/>
        <StatCard icon={Bell} label="Active Channels" value={totalActive} sub="ENABLED" color={t.warn} t={t} d="4"/>
      </div>
      <div className="fu2" style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:180}}>
          <Search size={12} color={t.textMuted} style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}/>
          <input className="ai" type="text" placeholder="Search contacts…" value={q} onChange={e=>setQ(e.target.value)} style={{width:"100%",padding:"9px 13px 9px 32px",background:t.surface,border:`1px solid ${t.border}`,borderRadius:9,color:t.text,fontSize:12,fontFamily:"'Outfit',sans-serif",boxShadow:t.sh}} onFocus={e=>{e.target.style.borderColor=t.inFo;e.target.style.boxShadow=`0 0 0 3px ${t.accent}18`;}} onBlur={e=>{e.target.style.borderColor=t.border;e.target.style.boxShadow=t.sh;}}/>
        </div>
        <div style={{display:"flex",gap:5,background:t.surface,border:`1px solid ${t.border}`,borderRadius:9,padding:4,boxShadow:t.sh}}>
          {[{v:"both",l:"All"},{v:"sms",l:"SMS"},{v:"email",l:"Email"}].map(o=>{const ia=view===o.v;return(<button key={o.v} onClick={()=>setView(o.v)} style={{padding:"6px 12px",borderRadius:7,cursor:"pointer",background:ia?`${t.accent}20`:"transparent",border:`1px solid ${ia?t.accent+"45":"transparent"}`,color:ia?t.accent:t.textSub,fontSize:10,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",transition:"all .18s"}}>{o.l}</button>);})}
        </div>
        <button onClick={()=>setAlertConfig(c=>({...c,sms:{...c.sms,numbers:[...c.sms.numbers,{id:Date.now(),label:"",number:"",country:"+1",active:true,alerts:{rising:true,declining:true,outOfRange:true,lowLevel:true}}]}}))} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 14px",borderRadius:9,cursor:"pointer",background:`${t.ok}22`,border:`1px solid ${t.ok}40`,color:t.ok,fontSize:10,fontWeight:700,fontFamily:"'Rajdhani',sans-serif"}}><Phone size={11}/> Add SMS</button>
        <button onClick={()=>setAlertConfig(c=>({...c,email:{...c.email,addresses:[...c.email.addresses,{id:Date.now(),label:"",email:"",active:true,alerts:{rising:true,declining:true,outOfRange:true,lowLevel:true}}]}}))} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 14px",borderRadius:9,cursor:"pointer",background:`${t.accent2}22`,border:`1px solid ${t.accent2}40`,color:t.accent2,fontSize:10,fontWeight:700,fontFamily:"'Rajdhani',sans-serif"}}><Mail size={11}/> Add Email</button>
      </div>
      {(view==="both"||view==="sms")&&nums.length>0&&(<div className="fu3" style={{marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:11}}><div style={{width:3,height:14,background:t.ok,borderRadius:2}}/><div style={{fontSize:12,fontWeight:700,color:t.text,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.05em"}}>SMS RECIPIENTS</div><span style={{background:`${t.ok}22`,color:t.ok,borderRadius:5,padding:"1px 7px",fontSize:9,fontWeight:700}}>{nums.length}</span></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:11}}>
          {nums.map(item=>(<div key={item.id} className="contact-card ch" style={{background:t.surface,border:`1px solid ${item.active?t.ok+"35":t.border}`,borderRadius:12,padding:16,boxShadow:t.sh,position:"relative",transition:"all .18s"}}>
            <div style={{position:"absolute",top:13,right:13,opacity:0,transition:"opacity .18s"}} className="contact-actions"><div style={{display:"flex",gap:5}}><Tog checked={item.active} onChange={v=>upNum(item.id,"active",v)} t={t} color={t.ok}/><button onClick={()=>rmNum(item.id)} className="bd" style={{width:26,height:26,borderRadius:7,background:t.dangerGlow,border:`1px solid ${t.danger}30`,color:t.danger,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Trash2 size={11}/></button></div></div>
            <div style={{display:"flex",alignItems:"flex-start",gap:11,marginBottom:11}}><div style={{width:38,height:38,borderRadius:10,background:item.active?`${t.ok}22`:`${t.textMuted}12`,border:`1px solid ${item.active?t.ok+"40":t.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:15}}>{item.label?item.label.charAt(0).toUpperCase():"?"}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:700,color:t.text,fontFamily:"'Rajdhani',sans-serif",marginBottom:2}}>{item.label||<span style={{color:t.textMuted,fontWeight:400,fontSize:11}}>Unnamed</span>}</div><div style={{display:"flex",alignItems:"center",gap:5}}><Phone size={10} color={t.ok}/><span style={{fontSize:11,color:t.textSub,fontFamily:"'Space Mono',monospace"}}>{item.country} {item.number||"No number"}</span></div></div></div>
            <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:9}}><div style={{width:6,height:6,borderRadius:"50%",background:item.active?t.ok:t.textMuted,boxShadow:item.active?`0 0 5px ${t.ok}`:"none"}}/><span style={{fontSize:9,fontWeight:700,color:item.active?t.ok:t.textMuted,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.08em"}}>{item.active?"ACTIVE":"INACTIVE"}</span></div>
            <div style={{paddingTop:9,borderTop:`1px solid ${t.border}`}}><div style={{fontSize:9,fontWeight:700,color:t.textSub,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5,fontFamily:"'Rajdhani',sans-serif"}}>Subscribed:</div><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{TRIGGERS.map(tg=>item.alerts?.[tg.key]?<span key={tg.key} style={{fontSize:8,background:`${t.ok}18`,color:t.ok,border:`1px solid ${t.ok}30`,borderRadius:3,padding:"1px 5px",fontWeight:700,fontFamily:"'Rajdhani',sans-serif"}}>{tg.label.split(" ")[0]}</span>:null)}{Object.values(item.alerts||{}).every(v=>!v)&&<span style={{fontSize:9,color:t.textMuted}}>None</span>}</div></div>
          </div>))}
        </div>
      </div>)}
      {(view==="both"||view==="email")&&addrs.length>0&&(<div className="fu3">
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:11}}><div style={{width:3,height:14,background:t.accent2,borderRadius:2}}/><div style={{fontSize:12,fontWeight:700,color:t.text,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.05em"}}>EMAIL RECIPIENTS</div><span style={{background:`${t.accent2}22`,color:t.accent2,borderRadius:5,padding:"1px 7px",fontSize:9,fontWeight:700}}>{addrs.length}</span></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:11}}>
          {addrs.map(item=>(<div key={item.id} className="contact-card ch" style={{background:t.surface,border:`1px solid ${item.active?t.accent2+"35":t.border}`,borderRadius:12,padding:16,boxShadow:t.sh,position:"relative",transition:"all .18s"}}>
            <div style={{position:"absolute",top:13,right:13,opacity:0,transition:"opacity .18s"}} className="contact-actions"><div style={{display:"flex",gap:5}}><Tog checked={item.active} onChange={v=>upAddr(item.id,"active",v)} t={t} color={t.accent2}/><button onClick={()=>rmAddr(item.id)} className="bd" style={{width:26,height:26,borderRadius:7,background:t.dangerGlow,border:`1px solid ${t.danger}30`,color:t.danger,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Trash2 size={11}/></button></div></div>
            <div style={{display:"flex",alignItems:"flex-start",gap:11,marginBottom:11}}><div style={{width:38,height:38,borderRadius:10,background:item.active?`${t.accent2}22`:`${t.textMuted}12`,border:`1px solid ${item.active?t.accent2+"40":t.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:15}}>{item.label?item.label.charAt(0).toUpperCase():"?"}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:700,color:t.text,fontFamily:"'Rajdhani',sans-serif",marginBottom:2}}>{item.label||<span style={{color:t.textMuted,fontWeight:400,fontSize:11}}>Unnamed</span>}</div><div style={{display:"flex",alignItems:"center",gap:5}}><Mail size={10} color={t.accent2}/><span style={{fontSize:11,color:t.textSub,fontFamily:"'Space Mono',monospace",wordBreak:"break-all"}}>{item.email||"No email"}</span></div></div></div>
            <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:9}}><div style={{width:6,height:6,borderRadius:"50%",background:item.active?t.accent2:t.textMuted,boxShadow:item.active?`0 0 5px ${t.accent2}`:"none"}}/><span style={{fontSize:9,fontWeight:700,color:item.active?t.accent2:t.textMuted,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.08em"}}>{item.active?"ACTIVE":"INACTIVE"}</span></div>
            <div style={{paddingTop:9,borderTop:`1px solid ${t.border}`}}><div style={{fontSize:9,fontWeight:700,color:t.textSub,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5,fontFamily:"'Rajdhani',sans-serif"}}>Subscribed:</div><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{TRIGGERS.map(tg=>item.alerts?.[tg.key]?<span key={tg.key} style={{fontSize:8,background:`${t.accent2}18`,color:t.accent2,border:`1px solid ${t.accent2}30`,borderRadius:3,padding:"1px 5px",fontWeight:700,fontFamily:"'Rajdhani',sans-serif"}}>{tg.label.split(" ")[0]}</span>:null)}{Object.values(item.alerts||{}).every(v=>!v)&&<span style={{fontSize:9,color:t.textMuted}}>None</span>}</div></div>
          </div>))}
        </div>
      </div>)}
      {((view==="both"&&nums.length===0&&addrs.length===0)||(view==="sms"&&nums.length===0)||(view==="email"&&addrs.length===0))&&(
        <div className="fu2" style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"44px 24px",textAlign:"center",boxShadow:t.sh}}>
          <div style={{fontSize:36,marginBottom:14}}>📭</div>
          <div style={{fontSize:14,fontWeight:700,color:t.textSub,fontFamily:"'Rajdhani',sans-serif",marginBottom:6}}>{q?"NO CONTACTS MATCH":"NO CONTACTS CONFIGURED"}</div>
          <div style={{fontSize:11,color:t.textMuted}}>{q?"Try different terms":"Add contacts in the Alerts tab"}</div>
        </div>
      )}
    </PageWrap>
  );
};

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard(){
  // ── useNavigate for sign-out redirect ──────────────────────────────────────
  const navigate = useNavigate();

  const [dark,setDark]=useState(true);
  const t=dark?T.dark:T.light;
  const [tab,setTab]=useState("overview");
  const [vessels,setVessels]=useState(()=>load()?.vessels??Array.from({length:10},DV));
  const [alertConfig,setAlertConfig]=useState(()=>load()?.alertConfig??DA());
  const [liveData,setLiveData]=useState([]);
  const [timeData,setTimeData]=useState([]);
  const [toast,setToast]=useState(null);
  const [unsaved,setUnsaved]=useState(false);
  const [lastUp,setLastUp]=useState(new Date());

  useEffect(()=>{
    setLiveData(gl(vessels));setTimeData(gs(vessels));
    const iv=setInterval(()=>{
      setLiveData(gl(vessels));
      const now=new Date();const lbl=`${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;
      setTimeData(p=>[...p.slice(-19),gp(vessels,lbl)]);setLastUp(now);
    },5000);
    return()=>clearInterval(iv);
  },[vessels]);

  const showToast=(m,ok=true)=>{setToast({m,ok});setTimeout(()=>setToast(null),2800);};
  const hCh=(vi,sk2,b,v)=>{setVessels(p=>p.map((vx,i)=>i===vi?{...vx,[sk2]:{...vx[sk2],[b]:v}}:vx));setUnsaved(true);};
  const hDel=(idx)=>{setVessels(v=>v.filter((_,i)=>i!==idx));setUnsaved(true);};
  const hAdd=(cfg)=>{setVessels(v=>[...v,cfg]);setUnsaved(true);showToast(`DU-${String(vessels.length+1).padStart(2,"0")} added to fleet`);};
  const hSave=()=>{const inv=vessels.some(v=>SM.some(s=>v[s.key].min>=v[s.key].max));if(inv){showToast("Fix invalid ranges before saving",false);return;}persist({vessels,alertConfig,updatedAt:new Date().toISOString()});setUnsaved(false);showToast("Configuration saved successfully");};
  const hReset=()=>{setVessels(Array.from({length:10},DV));setUnsaved(true);showToast("Reset to factory defaults");};

  // ── Sign-out: clear tokens + redirect to /login ────────────────────────────
  const handleSignOut=()=>{
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const TABS=[
    {id:"overview",label:"Overview",   icon:Home,    badge:null},
    {id:"config",  label:"Config",     icon:Settings,badge:{v:vessels.length,c:t.accent}},
    {id:"add",     label:"Add Vessel", icon:Plus,    badge:{v:"+",c:t.ok}},
    {id:"data",    label:"Sensor Data",icon:Table2,  badge:null},
    {id:"alerts",  label:"Alerts",     icon:Bell,    badge:{dot:true,v:alertConfig.sms.enabled||alertConfig.email.enabled?t.ok:null}},
    {id:"contacts",label:"Contacts",   icon:Users,   badge:{v:alertConfig.sms.numbers.length+alertConfig.email.addresses.length,c:t.accent2}},
  ];

  return(
    <div style={{minHeight:"100vh",background:t.bg,transition:"background .3s"}}>
      <style>{CSS}</style>

      {/* Header */}
      <header style={{position:"sticky",top:0,zIndex:500,background:t.hBg,backdropFilter:"blur(20px)",borderBottom:`1px solid ${t.border}`,height:58,display:"flex",alignItems:"center",padding:"0 24px",boxShadow:`0 1px 0 ${t.border},0 2px 16px rgba(0,0,0,0.2)`}}>
        <div style={{display:"flex",alignItems:"center",gap:12,flex:1}}>
          <div style={{background:`linear-gradient(135deg,${t.accent},${t.accent2})`,padding:8,borderRadius:10,display:"flex",boxShadow:`0 3px 12px ${t.accentGlow}`}}><Shield color="#fff" size={16}/></div>
          <div><div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:16,fontWeight:700,color:t.text,letterSpacing:"0.07em",lineHeight:1}}>LN₂ CRYOMONITOR</div><div style={{fontSize:8,color:t.textMuted,letterSpacing:"0.2em",textTransform:"uppercase",marginTop:1,fontFamily:"'Space Mono',monospace"}}>ADMIN CONTROL PANEL</div></div>
          <div style={{width:1,height:28,background:t.border,margin:"0 6px"}}/>
          <div style={{display:"flex",alignItems:"center",gap:5,background:`${t.accent}18`,border:`1px solid ${t.accent}30`,borderRadius:18,padding:"3px 10px"}}><Lock size={8} color={t.accent}/><span style={{fontSize:8,fontWeight:700,color:t.accent,letterSpacing:"0.15em",fontFamily:"'Rajdhani',sans-serif"}}>ADMIN ACCESS</span></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:18,background:`${t.ok}18`,border:`1px solid ${t.ok}30`}}><div style={{width:5,height:5,borderRadius:"50%",background:t.ok,boxShadow:`0 0 5px ${t.ok}`,animation:"pulse 2s infinite"}}/><span style={{fontSize:8,fontWeight:700,color:t.ok,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.12em"}}>LIVE</span></div>
          <span style={{fontSize:9,color:t.textSub,fontFamily:"'Space Mono',monospace"}}>{lastUp.toLocaleTimeString()}</span>
          {unsaved&&<div style={{display:"flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:18,background:`${t.warn}18`,border:`1px solid ${t.warn}35`,fontSize:8,fontWeight:700,color:t.warn,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.08em"}}><div style={{width:5,height:5,borderRadius:"50%",background:t.warn,animation:"pulse 1s infinite"}}/> UNSAVED</div>}
          <div style={{width:1,height:22,background:t.border}}/>
          <button onClick={()=>setDark(d=>!d)} style={{width:32,height:32,borderRadius:8,cursor:"pointer",background:t.surface,border:`1px solid ${t.border}`,color:t.textSub,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>{dark?<Sun size={13}/>:<Moon size={13}/>}</button>
          <button onClick={hReset} style={{padding:"6px 13px",borderRadius:8,cursor:"pointer",background:"transparent",border:`1px solid ${t.border}`,color:t.textSub,fontSize:10,fontWeight:600,display:"flex",alignItems:"center",gap:4,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.05em",transition:"all .15s"}}><RotateCcw size={11}/> RESET</button>
          <button onClick={hSave} className="bs" style={{padding:"6px 16px",borderRadius:8,cursor:"pointer",background:`linear-gradient(135deg,${t.accent},${t.accent2})`,border:"none",color:"#fff",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",gap:4,boxShadow:`0 2px 10px ${t.accentGlow}`,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.07em"}}><Save size={11}/> SAVE</button>
          <button onClick={handleSignOut} style={{padding:"6px 13px",borderRadius:8,cursor:"pointer",background:t.dangerGlow,border:`1px solid ${t.danger}35`,color:t.danger,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",gap:4,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.05em",transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.background=t.err;e.currentTarget.style.color="#fff";}} onMouseLeave={e=>{e.currentTarget.style.background=t.dangerGlow;e.currentTarget.style.color=t.danger;}}><LogOut size={11}/> SIGN OUT</button>
        </div>
      </header>

      {/* Tab bar */}
      <div style={{background:t.tabBar,borderBottom:`1px solid ${t.border}`,padding:"0 24px",display:"flex",alignItems:"center",gap:0}}>
        {TABS.map(tb=>{const ia=tab===tb.id;const Ic=tb.icon;return(<button key={tb.id} onClick={()=>setTab(tb.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"11px 15px",cursor:"pointer",background:"transparent",border:"none",borderBottom:`2px solid ${ia?t.accent:"transparent"}`,color:ia?t.accent:t.textSub,fontSize:11,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.07em",marginBottom:-1,transition:"color .18s,border-color .18s",whiteSpace:"nowrap"}}>
          <Ic size={13}/>{tb.label.toUpperCase()}
          {tb.badge&&!tb.badge.dot&&tb.badge.v!==undefined&&<span style={{background:`${tb.badge.c}22`,color:tb.badge.c,borderRadius:4,padding:"1px 6px",fontSize:8,fontWeight:800}}>{tb.badge.v}</span>}
          {tb.badge?.dot&&tb.badge.v&&<span style={{width:5,height:5,borderRadius:"50%",background:tb.badge.v,display:"inline-block",marginLeft:2}}/>}
        </button>);})}
      </div>

      {/* Content */}
      <main style={{padding:"20px 24px 56px",width:"100%",maxWidth:"100%"}}>
        {tab==="overview"&&<OverviewTab vessels={vessels} liveData={liveData} timeData={timeData} t={t}/>}
        {tab==="config"  &&<ConfigTab vessels={vessels} onChange={hCh} onDelete={hDel} t={t}/>}
        {tab==="add"     &&<AddVesselTab vessels={vessels} onAdd={hAdd} t={t}/>}
        {tab==="data"    &&<SensorDataTab liveData={liveData} vessels={vessels} t={t}/>}
        {tab==="alerts"  &&<AlertsTab alertConfig={alertConfig} setAlertConfig={setAlertConfig} t={t}/>}
        {tab==="contacts"&&<ContactsTab alertConfig={alertConfig} setAlertConfig={setAlertConfig} t={t}/>}
      </main>

      <footer style={{borderTop:`1px solid ${t.border}`,padding:"12px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",background:t.surface}}>
        <div style={{fontSize:9,color:t.textMuted,fontFamily:"'Space Mono',monospace"}}>NL Technologies · LN₂ CryoMonitor v2.2 · Admin Panel</div>
        <div style={{display:"flex",alignItems:"center",gap:5,fontSize:9,color:t.textMuted,fontFamily:"'Space Mono',monospace"}}><Lock size={8}/> Secure · Admin-only access</div>
      </footer>

      {toast&&<Toast msg={toast.m} ok={toast.ok} t={t}/>}
    </div>
  );
}