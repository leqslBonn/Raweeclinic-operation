"use client";

import { useEffect, useMemo, useState } from "react";

const LOGIN_SESSION_KEY = "raweeClinicAuthenticated";
const LOGIN_USER_HASH = "5e00556ac64a0763e7921cbf4841e8fc032c51a839faa53e1acecfa00f29f0d5";
const LOGIN_PASSWORD_HASH = "e6a363a774e27d7218ac4f5eadfc36fe5e1d94e7e259162dd727babbc6f230d6";

const navItems = [
  ["ภาพรวม", "⌂"], ["ลูกค้า", "♙"], ["ติดตามลูกค้า", "◎"], ["นัดหมาย", "□"],
  ["การเงิน", "฿"], ["พนักงาน", "♧"], ["SOP & Checklist", "✓"], ["ตั้งค่า", "⚙"],
];

const followUps = [
  { name: "คุณมิ้นท์", service: "Botox กราม", time: "วันนี้ 10:30", owner: "แป้ง", tone: "urgent" },
  { name: "คุณอร", service: "เลเซอร์เส้นเลือดขอด", time: "วันนี้ 13:00", owner: "นุ่น", tone: "today" },
  { name: "คุณก้อย", service: "Filler ใต้ตา", time: "วันนี้ 15:30", owner: "แป้ง", tone: "today" },
  { name: "คุณเมย์", service: "ทรีตเมนต์ผิว", time: "เกินกำหนด 1 วัน", owner: "ฝน", tone: "late" },
];

const appointments = [
  { time: "10:00", name: "คุณนภา", service: "Botox", status: "ยืนยันแล้ว" },
  { time: "11:30", name: "คุณใบเตย", service: "ปรึกษา Filler", status: "รอยืนยัน" },
  { time: "14:00", name: "คุณจูน", service: "ติดตามผล", status: "ยืนยันแล้ว" },
  { time: "16:30", name: "คุณน้ำ", service: "ทรีตเมนต์", status: "ยืนยันแล้ว" },
];

export default function Home() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [active, setActive] = useState("ภาพรวม");
  const [showAdd, setShowAdd] = useState(false);
  const [done, setDone] = useState<string[]>([]);
  const [connectionVersion, setConnectionVersion] = useState(0);
  const today = useMemo(() => new Intl.DateTimeFormat("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date()), []);

  useEffect(() => {
    setAuthenticated(sessionStorage.getItem(LOGIN_SESSION_KEY) === "yes");
  }, []);

  if (authenticated === null) return <div className="login-loading">กำลังเปิดระบบ...</div>;
  if (!authenticated) return <LoginPage onLogin={() => setAuthenticated(true)} />;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">R<span>✦</span></div>
          <div><strong>RAWEE</strong><small>AESTHETIC CLINIC</small></div>
        </div>
        <nav>
          <p className="nav-label">เมนูหลัก</p>
          {navItems.map(([label, icon]) => (
            <button key={label} className={active === label ? "active" : ""} onClick={() => setActive(label)}>
              <span className="nav-icon">{icon}</span>{label}
              {label === "ติดตามลูกค้า" && <b className="badge">4</b>}
            </button>
          ))}
        </nav>
        <div className="clinic-card"><span className="pulse"/><div><b>Rawee Clinic</b><small>ระบบพร้อมใช้งาน</small></div></div>
        <div className="user"><div className="avatar">ร</div><div><b>คุณรวี</b><small>เจ้าของคลินิก</small></div><button className="logout-btn" onClick={() => { sessionStorage.removeItem(LOGIN_SESSION_KEY); setAuthenticated(false); }}>ออก</button></div>
      </aside>

      <section className="workspace">
        <header>
          <div><h1>{active}</h1><p>{today} · สาขาคลองสาม</p></div>
          <div className="header-actions"><button className="icon-btn" aria-label="แจ้งเตือน">♢<i>3</i></button><button className="primary" onClick={() => setShowAdd(true)}>＋ เพิ่มลูกค้าใหม่</button></div>
        </header>

        {active === "ภาพรวม" ? <Dashboard done={done} setDone={setDone} /> : active === "ตั้งค่า" ? <SettingsPage key={connectionVersion} onSaved={() => setConnectionVersion(v => v + 1)} /> : <ModulePlaceholder active={active} onAdd={() => setShowAdd(true)} />}
      </section>

      {showAdd && <AddCustomer onClose={() => setShowAdd(false)} />}
    </main>
  );
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChecking(true);
    setError("");
    const [userHash, passwordHash] = await Promise.all([sha256(username.trim()), sha256(password)]);
    if (userHash === LOGIN_USER_HASH && passwordHash === LOGIN_PASSWORD_HASH) {
      sessionStorage.setItem(LOGIN_SESSION_KEY, "yes");
      onLogin();
    } else {
      setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
    setChecking(false);
  }

  return <main className="login-page">
    <section className="login-card">
      <div className="login-brand-mark">R<span>✦</span></div>
      <p className="login-eyebrow">RAWEE AESTHETIC CLINIC</p>
      <h1>Customer Follow Up</h1>
      <p className="login-intro">กรุณาเข้าสู่ระบบสำหรับเจ้าของคลินิกและพนักงาน</p>
      <form onSubmit={submit}>
        <label>ชื่อผู้ใช้<input value={username} onChange={event => setUsername(event.target.value)} autoComplete="username" required placeholder="กรอกชื่อผู้ใช้" /></label>
        <label>รหัสผ่าน<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required placeholder="กรอกรหัสผ่าน" /></label>
        {error && <p className="login-error">{error}</p>}
        <button className="primary login-submit" disabled={checking}>{checking ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}</button>
      </form>
      <small className="login-help">หากลืมรหัสผ่าน กรุณาติดต่อเจ้าของคลินิก</small>
    </section>
  </main>;
}

function Dashboard({ done, setDone }: { done: string[]; setDone: (v: string[]) => void }) {
  return <>
    <section className="hero-strip">
      <div><span className="eyebrow">GOOD MORNING</span><h2>วันนี้มีลูกค้ารอการดูแล <em>4 ราย</em></h2><p>ติดตามให้ครบ เพื่อประสบการณ์ที่ดีที่สุดของลูกค้า</p></div>
      <div className="hero-orb"><span>4</span><small>งานวันนี้</small></div>
    </section>

    <section className="metrics">
      <Metric icon="♙" label="ลูกค้าวันนี้" value="12" note="↑ 20% จากเมื่อวาน" tone="rose" />
      <Metric icon="฿" label="รายรับวันนี้" value="48,500" unit="บาท" note="↑ 12.5% จากเฉลี่ย" tone="gold" />
      <Metric icon="◎" label="ต้องติดตาม" value={`${4 - done.length}`} note={done.length ? `ทำแล้ว ${done.length} ราย` : "มี 1 รายเลยกำหนด"} tone="purple" />
      <Metric icon="□" label="นัดหมาย" value="8" note="ยืนยันแล้ว 6 ราย" tone="sage" />
    </section>

    <section className="content-grid">
      <div className="panel follow-panel">
        <div className="panel-head"><div><h3>ติดตามลูกค้าวันนี้</h3><p>เรียงตามความเร่งด่วน</p></div><button className="text-btn">ดูทั้งหมด →</button></div>
        <div className="follow-list">
          {followUps.map((item) => <div className={`follow-row ${done.includes(item.name) ? "completed" : ""}`} key={item.name}>
            <button className="check" aria-label={`ติดตาม ${item.name} สำเร็จ`} onClick={() => setDone(done.includes(item.name) ? done.filter(x => x !== item.name) : [...done, item.name])}>{done.includes(item.name) ? "✓" : ""}</button>
            <div className={`customer-avatar ${item.tone}`}>{item.name.slice(-1)}</div>
            <div className="customer-info"><b>{item.name}</b><span>{item.service}</span></div>
            <div className={`due ${item.tone}`}><b>{item.time}</b><span>ผู้ดูแล: {item.owner}</span></div>
            <button className="more">•••</button>
          </div>)}
        </div>
      </div>

      <div className="panel appointment-panel">
        <div className="panel-head"><div><h3>นัดหมายวันนี้</h3><p>8 นัด · ยืนยันแล้ว 6</p></div><button className="calendar-btn">15 ก.ค.</button></div>
        <div className="appointment-list">
          {appointments.map(a => <div className="appointment" key={a.time}>
            <b className="time">{a.time}</b><div className="line"/><div><strong>{a.name}</strong><span>{a.service}</span></div><small className={a.status === "ยืนยันแล้ว" ? "confirmed" : "waiting"}>{a.status}</small>
          </div>)}
        </div>
        <button className="outline-wide">＋ เพิ่มนัดหมาย</button>
      </div>
    </section>

    <section className="bottom-grid">
      <div className="panel chart-panel"><div className="panel-head"><div><h3>ภาพรวมรายรับ</h3><p>7 วันที่ผ่านมา</p></div><b className="total">฿ 286,400</b></div><div className="bars">{[48,62,42,78,70,88,58].map((h,i)=><div key={i}><span style={{height:`${h}%`}} className={i===5?"hot":""}/><small>{["พฤ","ศ","ส","อา","จ","อ","พ"][i]}</small></div>)}</div></div>
      <div className="panel team-panel"><div className="panel-head"><div><h3>พนักงานวันนี้</h3><p>เข้างาน 5 จาก 6 คน</p></div><span className="live">● LIVE</span></div><div className="team-avatars"><span>ป</span><span>น</span><span>ฝ</span><span>ม</span><span>อ</span><span className="absent">ล</span></div><div className="attendance"><span><i className="green"/>ตรงเวลา <b>4</b></span><span><i className="amber"/>สาย <b>1</b></span><span><i className="gray"/>ลา <b>1</b></span></div></div>
    </section>
  </>;
}

function Metric({icon,label,value,unit,note,tone}:{icon:string,label:string,value:string,unit?:string,note:string,tone:string}) {
  return <div className="metric"><div className={`metric-icon ${tone}`}>{icon}</div><div><span>{label}</span><strong>{value} <small>{unit}</small></strong><p>{note}</p></div></div>;
}

function ModulePlaceholder({active,onAdd}:{active:string,onAdd:()=>void}) {
  const copy:Record<string,string> = {"ลูกค้า":"ค้นหาและดูประวัติลูกค้าแบบรวมศูนย์","ติดตามลูกค้า":"จัดลำดับงานติดตามและมอบหมายผู้รับผิดชอบ","นัดหมาย":"จัดตารางบริการและสถานะการยืนยันนัด","การเงิน":"สรุปรายรับและบริการยอดนิยม","พนักงาน":"ดูเวลาเข้า–ออก การลา และสถิติการทำงาน","SOP & Checklist":"สร้างขั้นตอนงานและเช็กลิสต์ที่แก้ไขได้","ตั้งค่า":"เปิด–ปิดโมดูลและกำหนดสิทธิ์ผู้ใช้งาน"};
  return <div className="module-page"><div className="module-icon">✦</div><h2>{active}</h2><p>{copy[active]}</p><div className="sample-table"><div><b>โมดูลพร้อมสำหรับเชื่อม Google Sheets</b><span>เวอร์ชันทดลองจะแสดงตัวอย่างขั้นตอนและโครงสร้างข้อมูล</span></div><button onClick={onAdd}>{active === "ลูกค้า" ? "＋ เพิ่มลูกค้า" : "เปิดตัวอย่าง"}</button></div></div>;
}

const CONNECTION_URL_KEY = "raweeAppsScriptUrl";
const CONNECTION_API_KEY = "raweeAppsScriptApiKey";

function SettingsPage({onSaved}:{onSaved:()=>void}) {
  const [url,setUrl]=useState(()=>typeof window === "undefined" ? "" : localStorage.getItem(CONNECTION_URL_KEY) || "");
  const [apiKey,setApiKey]=useState(()=>typeof window === "undefined" ? "" : localStorage.getItem(CONNECTION_API_KEY) || "");
  const [message,setMessage]=useState("");
  const connected=Boolean(url && apiKey);
  function save(){
    localStorage.setItem(CONNECTION_URL_KEY,url.trim());
    localStorage.setItem(CONNECTION_API_KEY,apiKey.trim());
    setMessage("บันทึกการเชื่อมต่อแล้ว");
    onSaved();
  }
  return <div className="settings-page">
    <div className="settings-title"><div className="module-icon">⚙</div><div><span className="eyebrow">SYSTEM SETTINGS</span><h2>ตั้งค่าระบบ</h2><p>เชื่อม Google Sheet และควบคุมโมดูลของคลินิก</p></div></div>
    <div className="connection-card">
      <div className="connection-head"><div><h3>Google Sheet Connection</h3><p>ฐานข้อมูล: Rawee data · เจ้าของ: rawee.aesthetics3@gmail.com</p></div><span className={connected?"status-connected":"status-waiting"}>{connected?"● พร้อมใช้งาน":"○ รอเชื่อมต่อ"}</span></div>
      <label>Apps Script Web App URL<input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://script.google.com/macros/s/.../exec"/></label>
      <label>API Key<input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="รหัสเดียวกับใน Apps Script"/></label>
      <div className="settings-actions"><button className="primary" onClick={save} disabled={!url.trim()||!apiKey.trim()}>บันทึกการเชื่อมต่อ</button>{message&&<span>{message}</span>}</div>
    </div>
    <div className="module-toggles"><h3>โมดูลระบบ</h3>{[["ลูกค้าและ Follow-up",true],["นัดหมาย",true],["รายรับ",true],["พนักงานและเวลาเข้างาน",true],["SOP & Checklist",true],["Stock",false]].map(([n,on])=><div key={String(n)}><span>{n}</span><button className={on?"toggle on":"toggle"} aria-label={`เปิดปิด ${n}`}><i/></button></div>)}</div>
  </div>;
}

function AddCustomer({onClose}:{onClose:()=>void}) {
  const [saved,setSaved]=useState(false);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const connected=typeof window !== "undefined" && Boolean(localStorage.getItem(CONNECTION_URL_KEY) && localStorage.getItem(CONNECTION_API_KEY));
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault(); setSaving(true); setError("");
    const form=new FormData(e.currentTarget);
    const url=localStorage.getItem(CONNECTION_URL_KEY)||"";
    const apiKey=localStorage.getItem(CONNECTION_API_KEY)||"";
    if(!url||!apiKey){setSaving(false);setError("กรุณาเชื่อม Google Sheet ในเมนูตั้งค่าก่อน");return;}
    const data={full_name:form.get("full_name"),nickname:form.get("nickname"),phone:form.get("phone"),source:"Web App",consent_contact:form.get("consent_contact")==="on",medical_note:form.get("medical_note")};
    try{
      await fetch(url,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action:"addCustomer",apiKey,data})});
      setSaved(true);
    }catch{setError("ส่งข้อมูลไม่สำเร็จ กรุณาตรวจ URL และลองใหม่");}
    finally{setSaving(false);}
  }
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="modal"><button className="modal-close" onClick={onClose}>×</button>{saved ? <div className="success"><div>✓</div><h2>ส่งข้อมูลลูกค้าแล้ว</h2><p>ระบบส่งข้อมูลไปยัง Google Sheet เรียบร้อย</p><button className="primary" onClick={onClose}>กลับหน้าหลัก</button></div> : <><span className="eyebrow">NEW CUSTOMER</span><h2>เพิ่มลูกค้าใหม่</h2><p>{connected?"ข้อมูลจะถูกบันทึกใน Google Sheet ของคลินิก":"ยังไม่เชื่อม Google Sheet — ตั้งค่าได้ที่เมนูตั้งค่า"}</p><form onSubmit={submit}><label>ชื่อ–นามสกุล<input name="full_name" required placeholder="เช่น สมหญิง ใจดี"/></label><div className="form-grid"><label>ชื่อเล่น<input name="nickname" placeholder="ชื่อเล่น"/></label><label>เบอร์โทร<input name="phone" required inputMode="tel" placeholder="08x-xxx-xxxx"/></label></div><label>บริการที่สนใจ<select name="service_interest" defaultValue=""><option value="" disabled>เลือกบริการ</option><option>Botox</option><option>Filler</option><option>เส้นเลือดขอด</option><option>ทรีตเมนต์ผิว</option></select></label><label>หมายเหตุ<textarea name="medical_note" placeholder="ข้อมูลที่ควรทราบ..."/></label><label className="consent"><input name="consent_contact" type="checkbox"/> ลูกค้ายินยอมให้ติดต่อเพื่อนัดหมายและติดตามผล</label>{error&&<p className="form-error">{error}</p>}<button className="primary form-submit" disabled={saving}>{saving?"กำลังบันทึก...":"บันทึกลูกค้า"}</button></form></>}</div></div>;
}
