"use client";

import { useEffect, useMemo, useState } from "react";

const LOGIN_SESSION_KEY = "raweeClinicAuthenticated";
type UserRole = "owner" | "staff";

const LOGIN_USER_HASH = "5e00556ac64a0763e7921cbf4841e8fc032c51a839faa53e1acecfa00f29f0d5";
const LOGIN_PASSWORD_HASH = "48c90c24f9e5851f352d830ebe544d81569c4fc930b84f059ef13bfc889d611f";
const STAFF_USER_HASH = "681927e34b77e4b91b1f6f305d9ede004ad0b02f7c81ff74d8f7015e1b8f9c4e";
const STAFF_PASSWORD_HASH = "0a6dcd204823635cbb89bf8fd12e73417b0f84ce355b44dd4efaed89b4e45fa1";

const navItems = [
  ["ภาพรวม", "⌂"], ["ลูกค้า", "♙"], ["ติดตามลูกค้า", "◎"], ["นัดหมาย", "□"],
  ["การเงิน", "฿"], ["พนักงาน", "♧"], ["SOP & Checklist", "✓"], ["Stock", "▦"], ["ตั้งค่า", "⚙"],
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

const mockCustomers = [
  { id:"C001", name:"คุณมินท์", phone:"081-245-7810", service:"Botox กราม", last:"14 ก.ค. 69", follow:"วันนี้ 10:30", status:"ด่วน" },
  { id:"C002", name:"คุณอร", phone:"089-310-4421", service:"เลเซอร์เส้นเลือดขอด", last:"10 ก.ค. 69", follow:"วันนี้ 13:00", status:"รอติดตาม" },
  { id:"C003", name:"คุณก้อย", phone:"086-778-1290", service:"Filler ใต้ตา", last:"12 ก.ค. 69", follow:"วันนี้ 15:30", status:"รอติดตาม" },
  { id:"C004", name:"คุณเมย์", phone:"092-451-8803", service:"ทรีตเมนต์ผิว", last:"7 ก.ค. 69", follow:"เกินกำหนด 1 วัน", status:"เกินกำหนด" },
  { id:"C005", name:"คุณนภา", phone:"095-632-1744", service:"Botox หน้าผาก", last:"15 ก.ค. 69", follow:"22 ก.ค. 69", status:"นัดแล้ว" },
  { id:"C006", name:"คุณใบเตย", phone:"082-904-5172", service:"ปรึกษา Filler", last:"15 ก.ค. 69", follow:"18 ก.ค. 69", status:"รอยืนยัน" },
  { id:"C007", name:"คุณจูน", phone:"099-207-6531", service:"ติดตามผล Botox", last:"8 ก.ค. 69", follow:"วันนี้ 14:00", status:"นัดแล้ว" },
  { id:"C008", name:"คุณน้ำ", phone:"084-663-4908", service:"ทรีตเมนต์ผิว", last:"13 ก.ค. 69", follow:"20 ก.ค. 69", status:"นัดแล้ว" },
  { id:"C009", name:"คุณแพรว", phone:"096-114-7823", service:"Filler ปาก", last:"11 ก.ค. 69", follow:"25 ก.ค. 69", status:"รอติดตาม" },
  { id:"C010", name:"คุณปุ้ย", phone:"080-537-2619", service:"เลเซอร์ขน", last:"9 ก.ค. 69", follow:"ติดตามแล้ว", status:"สำเร็จ" },
  { id:"C011", name:"คุณแนน", phone:"093-825-0176", service:"Botox กราม", last:"6 ก.ค. 69", follow:"17 ก.ค. 69", status:"รอติดตาม" },
  { id:"C012", name:"คุณฝน", phone:"087-446-9315", service:"วิตามินผิว", last:"14 ก.ค. 69", follow:"21 ก.ค. 69", status:"นัดแล้ว" },
  { id:"C013", name:"คุณแอน", phone:"091-735-2480", service:"Filler ร่องแก้ม", last:"5 ก.ค. 69", follow:"ติดตามแล้ว", status:"สำเร็จ" },
  { id:"C014", name:"คุณตาล", phone:"088-390-6612", service:"เลเซอร์เส้นเลือดขอด", last:"3 ก.ค. 69", follow:"18 ก.ค. 69", status:"รอติดตาม" },
  { id:"C015", name:"คุณบี", phone:"094-802-3711", service:"ทรีตเมนต์สิว", last:"15 ก.ค. 69", follow:"29 ก.ค. 69", status:"นัดแล้ว" },
  { id:"C016", name:"คุณออย", phone:"083-519-7246", service:"Botox ริ้วรอย", last:"4 ก.ค. 69", follow:"เกินกำหนด 2 วัน", status:"เกินกำหนด" },
  { id:"C017", name:"คุณพลอย", phone:"097-264-1185", service:"Filler คาง", last:"12 ก.ค. 69", follow:"26 ก.ค. 69", status:"รอยืนยัน" },
  { id:"C018", name:"คุณหญิง", phone:"085-977-4302", service:"ปรึกษาผิว", last:"10 ก.ค. 69", follow:"ติดตามแล้ว", status:"สำเร็จ" },
  { id:"C019", name:"คุณฟ้า", phone:"098-601-3527", service:"วิตามินผิว", last:"13 ก.ค. 69", follow:"20 ก.ค. 69", status:"รอติดตาม" },
  { id:"C020", name:"คุณดาว", phone:"081-733-9046", service:"เลเซอร์ขน", last:"11 ก.ค. 69", follow:"24 ก.ค. 69", status:"นัดแล้ว" },
];

const mockEmployees = [
  { id:"E001", name:"พญ. รวี", position:"แพทย์และเจ้าของคลินิก", shift:"10:00–19:00", attendance:"ตรงเวลา", status:"ปฏิบัติงาน" },
  { id:"E002", name:"คุณแป้ง", position:"ผู้จัดการคลินิก", shift:"09:30–18:30", attendance:"ตรงเวลา", status:"ปฏิบัติงาน" },
  { id:"E003", name:"คุณนุ่น", position:"พยาบาลวิชาชีพ", shift:"10:00–19:00", attendance:"ตรงเวลา", status:"ปฏิบัติงาน" },
  { id:"E004", name:"คุณฝน", position:"ผู้ช่วยแพทย์", shift:"10:00–19:00", attendance:"สาย 8 นาที", status:"ปฏิบัติงาน" },
  { id:"E005", name:"คุณมายด์", position:"ที่ปรึกษาความงาม", shift:"11:00–20:00", attendance:"ตรงเวลา", status:"ปฏิบัติงาน" },
  { id:"E006", name:"คุณอ้อม", position:"ต้อนรับและแอดมิน", shift:"09:30–18:30", attendance:"ตรงเวลา", status:"ปฏิบัติงาน" },
  { id:"E007", name:"คุณลูกแก้ว", position:"แม่บ้านและ Stock", shift:"09:00–18:00", attendance:"ลาพักร้อน", status:"ลา" },
];

const mockTransactions = [
  ["TX001","คุณนภา","Botox หน้าผาก","8,500","ชำระแล้ว"], ["TX002","คุณใบเตย","ค่าปรึกษา","500","ชำระแล้ว"],
  ["TX003","คุณจูน","Botox กราม","12,000","ชำระแล้ว"], ["TX004","คุณน้ำ","ทรีตเมนต์ผิว","2,500","ชำระแล้ว"],
  ["TX005","คุณบี","ทรีตเมนต์สิว","3,200","ชำระแล้ว"], ["TX006","คุณฝน","วิตามินผิว","2,900","ชำระแล้ว"],
  ["TX007","คุณพลอย","มัดจำ Filler คาง","3,000","มัดจำ"], ["TX008","คุณดาว","เลเซอร์ขน","4,500","ชำระแล้ว"],
];

const mockStock = [
  ["ST001","Botulinum toxin 100U","12 ขวด","5 ขวด","ปกติ"], ["ST002","Hyaluronic Filler 1 ml","18 กล่อง","8 กล่อง","ปกติ"],
  ["ST003","เข็ม 30G","65 ชิ้น","30 ชิ้น","ปกติ"], ["ST004","ถุงมือ Nitrile M","4 กล่อง","5 กล่อง","ต้องสั่ง"],
  ["ST005","Alcohol pad","120 ชิ้น","50 ชิ้น","ปกติ"], ["ST006","ยาชาแบบครีม","6 หลอด","4 หลอด","ใกล้ขั้นต่ำ"],
  ["ST007","Serum Vitamin C","9 ขวด","5 ขวด","ปกติ"], ["ST008","หน้ากากอนามัย","3 กล่อง","4 กล่อง","ต้องสั่ง"],
];

type Customer = typeof mockCustomers[number];
type Employee = typeof mockEmployees[number];

function displayDate(value:unknown, fallback:string) {
  if(!value) return fallback;
  const date=new Date(String(value));
  if(Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("th-TH",{day:"numeric",month:"short",year:"2-digit"}).format(date);
}

function normalizeCustomer(record:Record<string,unknown>,index:number):Customer {
  const fallback=mockCustomers[index%mockCustomers.length];
  return {
    id:String(record.customer_id||fallback.id),
    name:String(record.full_name||fallback.name),
    phone:String(record.phone||fallback.phone),
    service:String(record.service_interest||record.last_service||fallback.service),
    last:displayDate(record.last_visit_date||record.created_at,fallback.last),
    follow:displayDate(record.next_followup||record.next_followup_date,fallback.follow),
    status:String(record.status||fallback.status),
  };
}

function normalizeEmployee(record:Record<string,unknown>,index:number):Employee {
  const fallback=mockEmployees[index%mockEmployees.length];
  return {
    id:String(record.employee_id||fallback.id),
    name:String(record.full_name||record.name||fallback.name),
    position:String(record.position||record.role||fallback.position),
    shift:String(record.shift||record.shift_time||fallback.shift),
    attendance:String(record.attendance||record.attendance_status||fallback.attendance),
    status:String(record.status||fallback.status),
  };
}

export default function Home() {
  const [role, setRole] = useState<UserRole | null | undefined>(undefined);
  const [active, setActive] = useState("ภาพรวม");
  const [showAdd, setShowAdd] = useState(false);
  const [done, setDone] = useState<string[]>([]);
  const [connectionVersion, setConnectionVersion] = useState(0);
  const [customers,setCustomers]=useState<Customer[]>(mockCustomers);
  const [employees,setEmployees]=useState<Employee[]>(mockEmployees);
  const [dataStatus,setDataStatus]=useState<"mock"|"loading"|"sheet"|"error">("mock");
  const today = useMemo(() => new Intl.DateTimeFormat("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date()), []);

  useEffect(() => {
    const savedRole = sessionStorage.getItem(LOGIN_SESSION_KEY);
    setRole(savedRole === "owner" || savedRole === "staff" ? savedRole : null);
  }, []);

  async function loadSheetData() {
    const url=localStorage.getItem(CONNECTION_URL_KEY)||"";
    const apiKey=localStorage.getItem(CONNECTION_API_KEY)||"";
    if(!url||!apiKey){setDataStatus("mock");return;}
    setDataStatus("loading");
    try{
      const response=await fetch(url,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action:"getSystemData",apiKey})});
      const result=await response.json();
      if(!result.ok) throw new Error(result.error||"โหลดข้อมูลไม่สำเร็จ");
      setCustomers((result.customers||[]).map((record:Record<string,unknown>,index:number)=>normalizeCustomer(record,index)));
      setEmployees((result.employees||[]).map((record:Record<string,unknown>,index:number)=>normalizeEmployee(record,index)));
      setDataStatus("sheet");
    }catch{setDataStatus("error");}
  }

  async function updateCustomerStatus(customerId:string,status:string) {
    const url=localStorage.getItem(CONNECTION_URL_KEY)||"";
    const apiKey=localStorage.getItem(CONNECTION_API_KEY)||"";
    if(!url||!apiKey) throw new Error("กรุณาเชื่อม Google Sheet ก่อน");
    const response=await fetch(url,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action:"recordCustomerActivity",apiKey,data:{customer_id:customerId,status,note:`ปรับสถานะเป็น ${status}`,channel:"Web App",performed_by:role==="owner"?"Rawee":"Staff"}})});
    const result=await response.json();
    if(!result.ok) throw new Error(result.error||"บันทึกสถานะไม่สำเร็จ");
    setCustomers(current=>current.map(customer=>customer.id===customerId?{...customer,status}:customer));
    await loadSheetData();
  }

  useEffect(()=>{if(role) void loadSheetData();},[role,connectionVersion]);

  if (role === undefined) return <div className="login-loading">กำลังเปิดระบบ...</div>;
  if (role === null) return <LoginPage onLogin={setRole} />;

  const visibleNavItems = role === "owner" ? navItems : navItems.filter(([label]) => label !== "ตั้งค่า");

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">R<span>✦</span></div>
          <div><strong>RAWEE</strong><small>AESTHETIC CLINIC</small></div>
        </div>
        <nav>
          <p className="nav-label">เมนูหลัก</p>
          {visibleNavItems.map(([label, icon]) => (
            <button key={label} className={active === label ? "active" : ""} onClick={() => setActive(label)}>
              <span className="nav-icon">{icon}</span>{label}
              {label === "ติดตามลูกค้า" && <b className="badge">4</b>}
            </button>
          ))}
        </nav>
        <div className="clinic-card"><span className="pulse"/><div><b>Rawee Clinic</b><small>ระบบพร้อมใช้งาน</small></div></div>
        <div className="user"><div className="avatar">{role === "owner" ? "ร" : "S"}</div><div><b>{role === "owner" ? "คุณรวี" : "Staff"}</b><small>{role === "owner" ? "เจ้าของคลินิก" : "พนักงาน"}</small></div><button className="logout-btn" onClick={() => { sessionStorage.removeItem(LOGIN_SESSION_KEY); setRole(null); }}>ออก</button></div>
      </aside>

      <section className="workspace">
        <header>
          <div><h1>{active}</h1><p>{today} · สาขาคลองสาม</p></div>
          <div className="header-actions"><span className={`data-source ${dataStatus}`}>{dataStatus==="sheet"?"● Google Sheet":dataStatus==="loading"?"กำลังโหลด...":dataStatus==="error"?"○ รออัปเดต Apps Script":"○ ข้อมูลตัวอย่าง"}</span><button className="icon-btn" aria-label="โหลดข้อมูลใหม่" title="โหลดข้อมูลจาก Google Sheet ใหม่" onClick={()=>void loadSheetData()}>↻</button><button className="primary" onClick={() => setShowAdd(true)}>＋ เพิ่มลูกค้าใหม่</button></div>
        </header>

        {active === "ภาพรวม" ? <Dashboard done={done} setDone={setDone} onOpenModule={setActive} customers={customers} employees={employees} /> : active === "ตั้งค่า" && role === "owner" ? <SettingsPage key={connectionVersion} onSaved={() => setConnectionVersion(v => v + 1)} /> : <ModuleContent active={active} onAdd={() => setShowAdd(true)} customers={customers} employees={employees} onUpdateStatus={updateCustomerStatus} />}
      </section>

      {showAdd && <AddCustomer onClose={() => setShowAdd(false)} onSaved={loadSheetData} />}
    </main>
  );
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function LoginPage({ onLogin }: { onLogin: (role: UserRole) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChecking(true);
    setError("");
    const [userHash, passwordHash] = await Promise.all([sha256(username.trim()), sha256(password)]);
    let matchedRole: UserRole | null = null;
    if (userHash === LOGIN_USER_HASH && passwordHash === LOGIN_PASSWORD_HASH) matchedRole = "owner";
    if (userHash === STAFF_USER_HASH && passwordHash === STAFF_PASSWORD_HASH) matchedRole = "staff";
    if (matchedRole) {
      sessionStorage.setItem(LOGIN_SESSION_KEY, matchedRole);
      onLogin(matchedRole);
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

function Dashboard({ done, setDone, onOpenModule, customers, employees }: { done: string[]; setDone: (v: string[]) => void; onOpenModule: (module:string) => void; customers:Customer[]; employees:Employee[] }) {
  const [selectedStatus,setSelectedStatus]=useState("ทั้งหมด");
  const dashboardStatuses=["ด่วน","เกินกำหนด","รอติดตาม","รอยืนยัน","นัดแล้ว","สำเร็จ"];
  const statusCounts=dashboardStatuses.reduce<Record<string,number>>((result,status)=>{result[status]=customers.filter(customer=>customer.status===status).length;return result;},{});
  const visibleStatusCustomers=selectedStatus==="ทั้งหมด"?customers:customers.filter(customer=>customer.status===selectedStatus);
  const revenue=mockTransactions.reduce((sum,row)=>sum+Number(row[3].replace(",","")),0).toLocaleString("th-TH");
  const openFollowUps=statusCounts["ด่วน"]+statusCounts["เกินกำหนด"]+statusCounts["รอติดตาม"];
  return <>
    <section className="hero-strip">
      <div><span className="eyebrow">GOOD MORNING</span><h2>วันนี้มีลูกค้ารอการดูแล <em>4 ราย</em></h2><p>ติดตามให้ครบ เพื่อประสบการณ์ที่ดีที่สุดของลูกค้า</p></div>
      <div className="hero-orb"><span>4</span><small>งานวันนี้</small></div>
    </section>

    <section className="metrics">
      <Metric icon="♙" label="ลูกค้าทั้งระบบ" value={String(customers.length)} note="อัปเดตจากฐานข้อมูลที่เชื่อมต่อ" tone="rose" />
      <Metric icon="฿" label="รายรับวันนี้" value={revenue} unit="บาท" note={`${mockTransactions.length} ธุรกรรม`} tone="gold" />
      <Metric icon="◎" label="ต้องติดตาม" value={String(openFollowUps-done.length)} note={`ด่วน ${statusCounts["ด่วน"]} · เกินกำหนด ${statusCounts["เกินกำหนด"]}`} tone="purple" />
      <Metric icon="□" label="นัดหมาย" value="8" note="ยืนยันแล้ว 6 ราย" tone="sage" />
    </section>

    <section className="dashboard-status-panel panel">
      <div className="panel-head"><div><h3>สถานะลูกค้าปัจจุบัน</h3><p>กดสถานะเพื่อเรียกดูรายชื่อลูกค้า · รวม {customers.length} ราย</p></div><button className="text-btn" onClick={()=>onOpenModule("ติดตามลูกค้า")}>เปิดศูนย์ติดตาม →</button></div>
      <div className="dashboard-status-cards">
        <button className={selectedStatus==="ทั้งหมด"?"active":""} onClick={()=>setSelectedStatus("ทั้งหมด")}><b>{customers.length}</b><span>ทั้งหมด</span></button>
        {dashboardStatuses.map(status=><button key={status} className={selectedStatus===status?"active":status==="เกินกำหนด"||status==="ด่วน"?"attention":""} onClick={()=>setSelectedStatus(status)}><b>{statusCounts[status]}</b><span>{status}</span></button>)}
      </div>
      <div className="dashboard-status-result"><b>{selectedStatus==="ทั้งหมด"?"ลูกค้าทุกสถานะ":`ลูกค้าสถานะ ${selectedStatus}`}</b><span>{visibleStatusCustomers.length} ราย</span></div>
      <div className="dashboard-customer-list">{visibleStatusCustomers.slice(0,8).map(customer=><button key={customer.id} onClick={()=>onOpenModule("ติดตามลูกค้า")}><span className="mini-avatar">{customer.name.slice(-1)}</span><span><b>{customer.name}</b><small>{customer.service} · เข้าล่าสุด {customer.last}</small></span><i>{customer.status}</i></button>)}</div>
      {visibleStatusCustomers.length>8&&<button className="dashboard-more" onClick={()=>onOpenModule("ติดตามลูกค้า")}>ดูอีก {visibleStatusCustomers.length-8} รายในหน้าติดตามลูกค้า →</button>}
    </section>

    <section className="content-grid">
      <div className="panel follow-panel">
        <div className="panel-head"><div><h3>ติดตามลูกค้าวันนี้</h3><p>เรียงตามความเร่งด่วน</p></div><button className="text-btn" onClick={()=>onOpenModule("ติดตามลูกค้า")}>ดูทั้งหมด →</button></div>
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
        <button className="outline-wide" onClick={()=>onOpenModule("นัดหมาย")}>＋ เพิ่มนัดหมาย</button>
      </div>
    </section>

    <section className="bottom-grid">
      <div className="panel chart-panel"><div className="panel-head"><div><h3>ภาพรวมรายรับ</h3><p>7 วันที่ผ่านมา</p></div><b className="total">฿ 286,400</b></div><div className="bars">{[48,62,42,78,70,88,58].map((h,i)=><div key={i}><span style={{height:`${h}%`}} className={i===5?"hot":""}/><small>{["พฤ","ศ","ส","อา","จ","อ","พ"][i]}</small></div>)}</div></div>
      <div className="panel team-panel"><div className="panel-head"><div><h3>พนักงานวันนี้</h3><p>เข้างาน {employees.filter(employee=>employee.status!=="ลา").length} จาก {employees.length} คน</p></div><span className="live">● LIVE</span></div><div className="team-avatars">{employees.map(employee=><span key={employee.id} className={employee.status==="ลา"?"absent":""}>{employee.name.replace("คุณ","").replace("พญ. ","").slice(0,1)}</span>)}</div><div className="attendance"><span><i className="green"/>ตรงเวลา <b>{employees.filter(employee=>employee.attendance==="ตรงเวลา").length}</b></span><span><i className="amber"/>สาย <b>{employees.filter(employee=>employee.attendance.includes("สาย")).length}</b></span><span><i className="gray"/>ลา <b>{employees.filter(employee=>employee.status==="ลา").length}</b></span></div></div>
    </section>
  </>;
}

function Metric({icon,label,value,unit,note,tone}:{icon:string,label:string,value:string,unit?:string,note:string,tone:string}) {
  return <div className="metric"><div className={`metric-icon ${tone}`}>{icon}</div><div><span>{label}</span><strong>{value} <small>{unit}</small></strong><p>{note}</p></div></div>;
}

function ModuleContent({active,onAdd,customers,employees,onUpdateStatus}:{active:string;onAdd:()=>void;customers:Customer[];employees:Employee[];onUpdateStatus:(customerId:string,status:string)=>Promise<void>}) {
  if(active === "ลูกค้า") return <DataModule title="ฐานข้อมูลลูกค้า" subtitle={`ข้อมูล ${customers.length} รายจากฐานข้อมูลที่เชื่อมต่อ`} action="＋ เพิ่มลูกค้า" onAction={onAdd} headers={["รหัส","ลูกค้า","เบอร์โทร","บริการล่าสุด","เข้ารับบริการ","ติดตามครั้งถัดไป","สถานะ"]} rows={customers.map(c=>[c.id,c.name,c.phone,c.service,c.last,c.follow,c.status])}/>;
  if(active === "ติดตามลูกค้า") return <FollowUpModule customers={customers} onUpdateStatus={onUpdateStatus}/>;
  if(active === "นัดหมาย") return <DataModule title="ตารางนัดหมาย" subtitle="นัดหมายวันนี้และ 7 วันข้างหน้า" headers={["เวลา/วันที่","ลูกค้า","บริการ","ผู้ดูแล","สถานะ"]} rows={customers.slice(4,12).map((c,i)=>[["วันนี้ 10:00","วันนี้ 11:30","วันนี้ 14:00","วันนี้ 16:30","18 ก.ค. 11:00","20 ก.ค. 13:30","22 ก.ค. 15:00","24 ก.ค. 17:00"][i],c.name,c.service,["คุณนุ่น","คุณฝน","พญ. รวี"][i%3],c.status])}/>;
  if(active === "การเงิน") return <DataModule title="รายรับและธุรกรรม" subtitle="ยอดจำลองวันนี้ 37,100 บาท · ยังไม่ใช่ข้อมูลบัญชีจริง" headers={["เลขที่","ลูกค้า","รายการ","ยอด (บาท)","สถานะ"]} rows={mockTransactions}/>;
  if(active === "พนักงาน") return <DataModule title="พนักงานและเวลาเข้างาน" subtitle={`พนักงาน ${employees.length} คนจากฐานข้อมูลที่เชื่อมต่อ`} headers={["รหัส","ชื่อ","ตำแหน่ง","กะงาน","เวลาเข้า","สถานะ"]} rows={employees.map(e=>[e.id,e.name,e.position,e.shift,e.attendance,e.status])}/>;
  if(active === "SOP & Checklist") return <DataModule title="SOP & Checklist" subtitle="ขั้นตอนหลักพร้อมเปิดใช้งานและแก้ไขเพิ่มภายหลัง" headers={["หมวด","รายการตรวจ","ผู้รับผิดชอบ","รอบ","สถานะ"]} rows={[["เปิดคลินิก","ตรวจความสะอาดและอุปกรณ์","แม่บ้าน / Stock","ทุกวัน","พร้อมใช้"],["บริการลูกค้า","ยืนยันประวัติแพ้ยาและ Consent","พยาบาล","ทุกเคส","บังคับ"],["หัตถการ","ถ่ายภาพก่อน–หลังและลง Lot ยา","ผู้ช่วยแพทย์","ทุกเคส","บังคับ"],["Follow-up","ติดต่อหลังบริการตามกำหนด","ที่ปรึกษา","ทุกวัน","พร้อมใช้"],["ปิดคลินิก","สรุปเงินสดและตรวจ Stock","ผู้จัดการ","ทุกวัน","พร้อมใช้"],["ฉุกเฉิน","ตรวจชุดยาและเบอร์ติดต่อฉุกเฉิน","พยาบาล","ทุกสัปดาห์","พร้อมใช้"]]}/>;
  if(active === "Stock") return <DataModule title="Stock คลินิก" subtitle="วัสดุและเวชภัณฑ์จำลอง · แจ้งเตือนเมื่อถึงจุดสั่งซื้อ" headers={["รหัส","รายการ","คงเหลือ","ขั้นต่ำ","สถานะ"]} rows={mockStock}/>;
  return <DataModule title={active} subtitle="โมดูลพร้อมใช้งาน" headers={["สถานะ"]} rows={[["พร้อมใช้งาน"]]}/>;
}

function FollowUpModule({customers:sourceCustomers,onUpdateStatus}:{customers:Customer[];onUpdateStatus:(customerId:string,status:string)=>Promise<void>}) {
  const [search,setSearch]=useState("");
  const [statusFilter,setStatusFilter]=useState("ทั้งหมด");
  const [ownerFilter,setOwnerFilter]=useState("ทั้งหมด");
  const [serviceFilter,setServiceFilter]=useState("ทั้งหมด");
  const [sortBy,setSortBy]=useState("priority");
  const owners=["แป้ง","นุ่น","ฝน","มายด์"];
  const customers=useMemo(()=>sourceCustomers.map((customer,index)=>({...customer,owner:owners[index%owners.length]})),[sourceCustomers]);
  const statuses=useMemo(()=>Array.from(new Set(customers.map(c=>c.status))),[customers]);
  const services=useMemo(()=>Array.from(new Set(customers.map(c=>c.service))).sort((a,b)=>a.localeCompare(b,"th")),[customers]);
  const statusCounts=useMemo(()=>statuses.reduce<Record<string,number>>((result,status)=>{result[status]=customers.filter(c=>c.status===status).length;return result;},{}),[customers,statuses]);
  const visibleCustomers=useMemo(()=>{
    const keyword=search.trim().toLocaleLowerCase("th");
    const priority:Record<string,number>={"เกินกำหนด":0,"ด่วน":1,"รอติดตาม":2,"รอยืนยัน":3,"นัดแล้ว":4,"สำเร็จ":5};
    return customers.filter(c=>(!keyword||[c.id,c.name,c.phone,c.service].some(value=>value.toLocaleLowerCase("th").includes(keyword)))&&(statusFilter==="ทั้งหมด"||c.status===statusFilter)&&(ownerFilter==="ทั้งหมด"||c.owner===ownerFilter)&&(serviceFilter==="ทั้งหมด"||c.service===serviceFilter)).sort((a,b)=>{
      if(sortBy==="latest") return parseInt(b.last)-parseInt(a.last);
      if(sortBy==="oldest") return parseInt(a.last)-parseInt(b.last);
      if(sortBy==="name") return a.name.localeCompare(b.name,"th");
      return (priority[a.status]??9)-(priority[b.status]??9)||parseInt(a.last)-parseInt(b.last);
    });
  },[customers,search,statusFilter,ownerFilter,serviceFilter,sortBy]);
  const clearFilters=()=>{setSearch("");setStatusFilter("ทั้งหมด");setOwnerFilter("ทั้งหมด");setServiceFilter("ทั้งหมด");setSortBy("priority");};
  return <section className="data-module followup-module">
    <div className="data-module-head"><div><span className="eyebrow">FOLLOW-UP CONTROL</span><h2>คิวติดตามลูกค้า</h2><p>ค้นหา กรองสถานะ และเรียงลำดับงานเพื่อไม่ให้ลูกค้าขาดช่วง</p></div></div>
    <div className="status-cards">
      <button className={statusFilter==="ทั้งหมด"?"selected":""} onClick={()=>setStatusFilter("ทั้งหมด")}><b>{customers.length}</b><span>ลูกค้าทั้งหมด</span></button>
      {statuses.map(status=><button key={status} className={statusFilter===status?"selected":""} onClick={()=>setStatusFilter(status)}><b>{statusCounts[status]}</b><span>{status}</span></button>)}
    </div>
    <div className="filter-panel">
      <label className="search-field"><span>ค้นหาลูกค้า</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ชื่อ เบอร์โทร รหัส หรือบริการ..."/></label>
      <label><span>สถานะ</span><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>ทั้งหมด</option>{statuses.map(status=><option key={status}>{status}</option>)}</select></label>
      <label><span>ผู้ดูแล</span><select value={ownerFilter} onChange={e=>setOwnerFilter(e.target.value)}><option>ทั้งหมด</option>{owners.map(owner=><option key={owner}>{owner}</option>)}</select></label>
      <label><span>บริการ</span><select value={serviceFilter} onChange={e=>setServiceFilter(e.target.value)}><option>ทั้งหมด</option>{services.map(service=><option key={service}>{service}</option>)}</select></label>
      <label><span>เรียงลำดับ</span><select value={sortBy} onChange={e=>setSortBy(e.target.value)}><option value="priority">เร่งด่วนก่อน</option><option value="latest">เข้าคลินิกล่าสุด</option><option value="oldest">เข้าคลินิกเก่าสุด</option><option value="name">ชื่อลูกค้า ก–ฮ</option></select></label>
      <button className="clear-filter" onClick={clearFilters}>ล้างตัวกรอง</button>
    </div>
    <div className="result-bar"><div><b>{visibleCustomers.length}</b><span> รายการที่พบ</span></div><span>{statusFilter==="ทั้งหมด"?"ทุกสถานะ":`สถานะ: ${statusFilter}`}</span></div>
    <div className="data-table-wrap"><table className="data-table"><thead><tr>{["รหัส","ลูกค้า","เบอร์โทร","บริการ","เข้าคลินิกล่าสุด","กำหนดติดตาม","ผู้ดูแล","สถานะ","กิจกรรม"].map(header=><th key={header}>{header}</th>)}</tr></thead><tbody>{visibleCustomers.map(customer=><tr key={customer.id}><td>{customer.id}</td><td><b>{customer.name}</b></td><td>{customer.phone}</td><td>{customer.service}</td><td>{customer.last}</td><td>{customer.follow}</td><td>{customer.owner}</td><td><span className={`status-pill status-${customer.status}`}>{customer.status}</span></td><td><CustomerStatusAction customer={customer} onUpdateStatus={onUpdateStatus}/></td></tr>)}</tbody></table>{visibleCustomers.length===0&&<div className="empty-result">ไม่พบลูกค้าตามเงื่อนไขที่เลือก</div>}</div>
  </section>;
}

function CustomerStatusAction({customer,onUpdateStatus}:{customer:Customer;onUpdateStatus:(customerId:string,status:string)=>Promise<void>}) {
  const [nextStatus,setNextStatus]=useState(customer.status);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  async function save(status:string) {
    setSaving(true);setMessage("");
    try{await onUpdateStatus(customer.id,status);setNextStatus(status);setMessage("บันทึกแล้ว");}
    catch(error){setMessage(error instanceof Error?error.message:"บันทึกไม่สำเร็จ");}
    finally{setSaving(false);}
  }
  return <div className="status-action"><select value={nextStatus} onChange={event=>setNextStatus(event.target.value)} disabled={saving}>{["ด่วน","เกินกำหนด","รอติดตาม","รอยืนยัน","นัดแล้ว","สำเร็จ"].map(status=><option key={status}>{status}</option>)}</select><button onClick={()=>void save(nextStatus)} disabled={saving||nextStatus===customer.status}>{saving?"...":"บันทึก"}</button>{customer.status!=="สำเร็จ"&&<button className="complete-action" onClick={()=>void save("สำเร็จ")} disabled={saving}>✓ ติดตามแล้ว</button>}{message&&<small>{message}</small>}</div>;
}

function DataModule({title,subtitle,headers,rows,action,onAction}:{title:string;subtitle:string;headers:string[];rows:string[][];action?:string;onAction?:()=>void}) {
  return <section className="data-module">
    <div className="data-module-head"><div><span className="eyebrow">ACTIVE MODULE</span><h2>{title}</h2><p>{subtitle}</p></div>{action&&onAction&&<button className="primary" onClick={onAction}>{action}</button>}</div>
    <div className="module-summary"><b>{rows.length}</b><span>รายการที่แสดง</span><i>● เปิดใช้งาน</i></div>
    <div className="data-table-wrap"><table className="data-table"><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row,rowIndex)=><tr key={`${row[0]}-${rowIndex}`}>{row.map((cell,cellIndex)=><td key={`${cellIndex}-${cell}`}><span className={cellIndex===row.length-1?"status-pill":""}>{cell}</span></td>)}</tr>)}</tbody></table></div>
  </section>;
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
    <div className="module-toggles"><h3>โมดูลระบบ</h3>{[["ลูกค้าและ Follow-up",true],["นัดหมาย",true],["รายรับ",true],["พนักงานและเวลาเข้างาน",true],["SOP & Checklist",true],["Stock",true]].map(([n,on])=><div key={String(n)}><span>{n}</span><button className={on?"toggle on":"toggle"} aria-label={`เปิดปิด ${n}`}><i/></button></div>)}</div>
  </div>;
}

function AddCustomer({onClose,onSaved}:{onClose:()=>void;onSaved:()=>Promise<void>}) {
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
    const data={full_name:form.get("full_name"),nickname:form.get("nickname"),phone:form.get("phone"),service_interest:form.get("service_interest"),source:"Web App",consent_contact:form.get("consent_contact")==="on",medical_note:form.get("medical_note")};
    try{
      const response=await fetch(url,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action:"addCustomer",apiKey,data})});
      const result=await response.json();
      if(!result.ok) throw new Error(result.error||"SAVE_FAILED");
      setSaved(true);
      await onSaved();
    }catch(error){setError(error instanceof Error&&error.message==="DUPLICATE_PHONE"?"มีเบอร์โทรนี้อยู่ในระบบแล้ว":"ส่งข้อมูลไม่สำเร็จ กรุณาตรวจ URL และลองใหม่");}
    finally{setSaving(false);}
  }
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="modal"><button className="modal-close" onClick={onClose}>×</button>{saved ? <div className="success"><div>✓</div><h2>ส่งข้อมูลลูกค้าแล้ว</h2><p>ระบบส่งข้อมูลไปยัง Google Sheet เรียบร้อย</p><button className="primary" onClick={onClose}>กลับหน้าหลัก</button></div> : <><span className="eyebrow">NEW CUSTOMER</span><h2>เพิ่มลูกค้าใหม่</h2><p>{connected?"ข้อมูลจะถูกบันทึกใน Google Sheet ของคลินิก":"ยังไม่เชื่อม Google Sheet — ตั้งค่าได้ที่เมนูตั้งค่า"}</p><form onSubmit={submit}><label>ชื่อ–นามสกุล<input name="full_name" required placeholder="เช่น สมหญิง ใจดี"/></label><div className="form-grid"><label>ชื่อเล่น<input name="nickname" placeholder="ชื่อเล่น"/></label><label>เบอร์โทร<input name="phone" required inputMode="tel" placeholder="08x-xxx-xxxx"/></label></div><label>บริการที่สนใจ<select name="service_interest" defaultValue=""><option value="" disabled>เลือกบริการ</option><option>Botox</option><option>Filler</option><option>เส้นเลือดขอด</option><option>ทรีตเมนต์ผิว</option></select></label><label>หมายเหตุ<textarea name="medical_note" placeholder="ข้อมูลที่ควรทราบ..."/></label><label className="consent"><input name="consent_contact" type="checkbox"/> ลูกค้ายินยอมให้ติดต่อเพื่อนัดหมายและติดตามผล</label>{error&&<p className="form-error">{error}</p>}<button className="primary form-submit" disabled={saving}>{saving?"กำลังบันทึก...":"บันทึกลูกค้า"}</button></form></>}</div></div>;
}
