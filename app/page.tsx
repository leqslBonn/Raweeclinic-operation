"use client";

import { useEffect, useMemo, useState } from "react";

const LOGIN_SESSION_KEY = "raweeClinicAuthenticated";
const APP_VERSION = "1.0.0";
type UserRole = "owner" | "staff";

const LOGIN_USER_HASH = "5e00556ac64a0763e7921cbf4841e8fc032c51a839faa53e1acecfa00f29f0d5";
const LOGIN_PASSWORD_HASH = "48c90c24f9e5851f352d830ebe544d81569c4fc930b84f059ef13bfc889d611f";
const STAFF_USER_HASH = "681927e34b77e4b91b1f6f305d9ede004ad0b02f7c81ff74d8f7015e1b8f9c4e";
const STAFF_PASSWORD_HASH = "0a6dcd204823635cbb89bf8fd12e73417b0f84ce355b44dd4efaed89b4e45fa1";

const navItems = [
  ["ภาพรวม", "⌂"], ["ลูกค้า", "♙"], ["ติดตามลูกค้า", "◎"], ["นัดหมาย", "□"],
  ["เข้ารับบริการ", "✚"], ["การเงิน", "฿"], ["คอร์ส", "◫"], ["ค่าใช้จ่าย", "−"], ["พนักงาน", "♧"], ["SOP & Checklist", "✓"], ["Stock", "▦"], ["ตั้งค่า", "⚙"],
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
type RawRecord = Record<string,unknown>;
type FormKind = "customer"|"appointment"|"visit"|"transaction"|"package"|"courseSale"|"courseUse"|"expense"|"inventoryItem"|"stockMovement"|"employee"|"attendance"|"sop";
type SystemData = {
  appointments:RawRecord[]; transactions:RawRecord[]; visits:RawRecord[]; services:RawRecord[];
  packages:RawRecord[]; customer_courses:RawRecord[]; course_usage:RawRecord[]; expenses:RawRecord[];
  inventory:RawRecord[]; stock_movements:RawRecord[]; attendance:RawRecord[]; sop:RawRecord[];
};
const emptySystemData:SystemData={appointments:[],transactions:[],visits:[],services:[],packages:[],customer_courses:[],course_usage:[],expenses:[],inventory:[],stock_movements:[],attendance:[],sop:[]};

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
  const workStatus=String(record.status||record.work_status||fallback.status);
  return {
    id:String(record.employee_id||fallback.id),
    name:String(record.full_name||record.name||fallback.name),
    position:String(record.position||record.role||fallback.position),
    shift:String(record.shift||record.shift_time||fallback.shift),
    attendance:String(record.attendance||record.attendance_status||fallback.attendance),
    status:workStatus==="Leave"||workStatus==="ลา"?"ลา":"ปฏิบัติงาน",
  };
}

export default function Home() {
  const [role, setRole] = useState<UserRole | null | undefined>(undefined);
  const [active, setActive] = useState("ภาพรวม");
  const [showAdd, setShowAdd] = useState(false);
  const [showActions,setShowActions]=useState(false);
  const [showForm,setShowForm]=useState<FormKind|null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [connectionVersion, setConnectionVersion] = useState(0);
  const [customers,setCustomers]=useState<Customer[]>(mockCustomers);
  const [employees,setEmployees]=useState<Employee[]>(mockEmployees);
  const [systemData,setSystemData]=useState<SystemData>(emptySystemData);
  const [dataStatus,setDataStatus]=useState<"mock"|"loading"|"sheet"|"error">("mock");
  const today = useMemo(() => new Intl.DateTimeFormat("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date()), []);

  useEffect(() => {
    const savedRole = sessionStorage.getItem(LOGIN_SESSION_KEY);
    setRole(savedRole === "owner" || savedRole === "staff" ? savedRole : null);
  }, []);

  async function loadSheetData() {
    setDataStatus("loading");
    try{
      const result=await callRaweeApi("getSystemData");
      if(!result.ok) throw new Error(result.error||"โหลดข้อมูลไม่สำเร็จ");
      setCustomers((result.customers||[]).map((record:Record<string,unknown>,index:number)=>normalizeCustomer(record,index)));
      setEmployees((result.employees||[]).filter((record:Record<string,unknown>)=>record.active!==false&&String(record.work_status||"")!=="Archived").map((record:Record<string,unknown>,index:number)=>normalizeEmployee(record,index)));
      setSystemData({
        appointments:result.appointments||[],transactions:result.transactions||[],visits:result.visits||[],services:result.services||[],
        packages:result.packages||[],customer_courses:result.customer_courses||[],course_usage:result.course_usage||[],expenses:result.expenses||[],
        inventory:result.inventory||[],stock_movements:result.stock_movements||[],attendance:result.attendance||[],sop:result.sop||[]
      });
      setDataStatus("sheet");
    }catch{setDataStatus("error");}
  }

  async function updateCustomerStatus(customerId:string,status:string) {
    const result=await callRaweeApi("recordCustomerActivity",{customer_id:customerId,status,note:`ปรับสถานะเป็น ${status}`,channel:"Web App",performed_by:role==="owner"?"Rawee":"Staff"});
    if(!result.ok) throw new Error(result.error||"บันทึกสถานะไม่สำเร็จ");
    setCustomers(current=>current.map(customer=>customer.id===customerId?{...customer,status}:customer));
    await loadSheetData();
  }

  async function saveOperationalRecord(action:string,data:RawRecord) {
    const result=await callRaweeApi(action,data);
    if(!result.ok) throw new Error(result.error||"บันทึกข้อมูลไม่สำเร็จ");
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
        <div className="clinic-card"><span className="pulse"/><div><b>Rawee Clinic</b><small>ระบบพร้อมใช้งาน · v{APP_VERSION}</small></div></div>
        <div className="user"><div className="avatar">{role === "owner" ? "ร" : "S"}</div><div><b>{role === "owner" ? "คุณรวี" : "Staff"}</b><small>{role === "owner" ? "เจ้าของคลินิก" : "พนักงาน"}</small></div><button className="logout-btn" onClick={() => { sessionStorage.removeItem(LOGIN_SESSION_KEY); setRole(null); }}>ออก</button></div>
      </aside>

      <section className="workspace">
        <header>
          <div><h1>{active}</h1><p>{today} · สาขาคลองสาม</p></div>
          <div className="header-actions"><span className={`data-source ${dataStatus}`}>{dataStatus==="sheet"?"● Google Sheet":dataStatus==="loading"?"กำลังโหลด...":dataStatus==="error"?"○ รออัปเดต Apps Script":"○ ข้อมูลตัวอย่าง"}</span><button className="icon-btn" aria-label="โหลดข้อมูลใหม่" title="โหลดข้อมูลจาก Google Sheet ใหม่" onClick={()=>void loadSheetData()}>↻</button><button className="primary" onClick={() => setShowActions(true)}>＋ บันทึกข้อมูล</button></div>
        </header>

        {active === "ภาพรวม" ? <Dashboard done={done} setDone={setDone} onOpenModule={setActive} customers={customers} employees={employees} systemData={systemData} /> : active === "ตั้งค่า" && role === "owner" ? <SettingsPage key={connectionVersion} onSaved={() => setConnectionVersion(v => v + 1)} /> : <ModuleContent active={active} onAdd={() => setShowAdd(true)} customers={customers} employees={employees} systemData={systemData} onOpenForm={setShowForm} onUpdateStatus={updateCustomerStatus} />}
      </section>

      {showAdd && <AddCustomer onClose={() => setShowAdd(false)} onSaved={loadSheetData} />}
      {showActions&&<ActionCenter role={role} onClose={()=>setShowActions(false)} onChoose={kind=>{setShowActions(false);if(kind==="customer")setShowAdd(true);else setShowForm(kind);}}/>}
      {showForm&&<OperationalForm kind={showForm} role={role} customers={customers} employees={employees} systemData={systemData} onClose={()=>setShowForm(null)} onSave={saveOperationalRecord}/>}
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
      <small className="login-help">หากลืมรหัสผ่าน กรุณาติดต่อเจ้าของคลินิก · v{APP_VERSION}</small>
    </section>
  </main>;
}

function Dashboard({ done, setDone, onOpenModule, customers, employees, systemData }: { done: string[]; setDone: (v: string[]) => void; onOpenModule: (module:string) => void; customers:Customer[]; employees:Employee[]; systemData:SystemData }) {
  const [selectedStatus,setSelectedStatus]=useState("ทั้งหมด");
  const dashboardStatuses=["ด่วน","เกินกำหนด","รอติดตาม","รอยืนยัน","นัดแล้ว","สำเร็จ"];
  const statusCounts=dashboardStatuses.reduce<Record<string,number>>((result,status)=>{result[status]=customers.filter(customer=>customer.status===status).length;return result;},{});
  const visibleStatusCustomers=selectedStatus==="ทั้งหมด"?customers:customers.filter(customer=>customer.status===selectedStatus);
  const todayISO=new Date().toISOString().slice(0,10);
  const todayTransactions=systemData.transactions.filter(row=>String(row.transaction_date||row.created_at||"").slice(0,10)===todayISO);
  const revenue=todayTransactions.reduce((sum,row)=>sum+Number(row.paid_amount||row.net_amount||0),0).toLocaleString("th-TH");
  const todayAppointments=systemData.appointments.filter(row=>String(row.appointment_date||"").slice(0,10)===todayISO);
  const dashboardFollowUps=customers.filter(customer=>["ด่วน","เกินกำหนด","รอติดตาม"].includes(customer.status)).slice(0,4);
  const totalRevenue=systemData.transactions.reduce((sum,row)=>sum+Number(row.paid_amount||row.net_amount||0),0).toLocaleString("th-TH");
  const openFollowUps=statusCounts["ด่วน"]+statusCounts["เกินกำหนด"]+statusCounts["รอติดตาม"];
  return <>
    <section className="hero-strip">
      <div><span className="eyebrow">GOOD MORNING</span><h2>วันนี้มีลูกค้ารอการดูแล <em>{openFollowUps} ราย</em></h2><p>ติดตามให้ครบ เพื่อประสบการณ์ที่ดีที่สุดของลูกค้า</p></div>
      <div className="hero-orb"><span>{openFollowUps}</span><small>งานติดตาม</small></div>
    </section>

    <section className="metrics">
      <Metric icon="♙" label="ลูกค้าทั้งระบบ" value={String(customers.length)} note="อัปเดตจากฐานข้อมูลที่เชื่อมต่อ" tone="rose" />
      <Metric icon="฿" label="รายรับวันนี้" value={revenue} unit="บาท" note={`${todayTransactions.length} ธุรกรรมจาก Google Sheet`} tone="gold" />
      <Metric icon="◎" label="ต้องติดตาม" value={String(openFollowUps-done.length)} note={`ด่วน ${statusCounts["ด่วน"]} · เกินกำหนด ${statusCounts["เกินกำหนด"]}`} tone="purple" />
      <Metric icon="□" label="นัดหมายวันนี้" value={String(todayAppointments.length)} note={`ยืนยันแล้ว ${todayAppointments.filter(row=>String(row.status)==="Confirmed").length} ราย`} tone="sage" />
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
          {dashboardFollowUps.map((item) => <div className={`follow-row ${done.includes(item.name) ? "completed" : ""}`} key={item.id}>
            <button className="check" aria-label={`ติดตาม ${item.name} สำเร็จ`} onClick={() => setDone(done.includes(item.name) ? done.filter(x => x !== item.name) : [...done, item.name])}>{done.includes(item.name) ? "✓" : ""}</button>
            <div className={`customer-avatar ${item.status==="ด่วน"?"urgent":item.status==="เกินกำหนด"?"late":"today"}`}>{item.name.slice(-1)}</div>
            <div className="customer-info"><b>{item.name}</b><span>{item.service}</span></div>
            <div className={`due ${item.status==="เกินกำหนด"?"late":"today"}`}><b>{item.follow}</b><span>{item.status}</span></div>
            <button className="more">•••</button>
          </div>)}
        </div>
      </div>

      <div className="panel appointment-panel">
        <div className="panel-head"><div><h3>นัดหมายวันนี้</h3><p>{todayAppointments.length} นัดจาก Google Sheet</p></div><button className="calendar-btn">วันนี้</button></div>
        <div className="appointment-list">
          {todayAppointments.slice(0,4).map((appointment,index) => <div className="appointment" key={String(appointment.appointment_id||index)}>
            <b className="time">{String(appointment.start_time||"-")}</b><div className="line"/><div><strong>{customers.find(customer=>customer.id===String(appointment.customer_id))?.name||String(appointment.customer_id||"-")}</strong><span>{String(appointment.service_id||"-")}</span></div><small className={String(appointment.status) === "Confirmed" ? "confirmed" : "waiting"}>{String(appointment.status||"-")}</small>
          </div>)}
        </div>
        <button className="outline-wide" onClick={()=>onOpenModule("นัดหมาย")}>＋ เพิ่มนัดหมาย</button>
      </div>
    </section>

    <section className="bottom-grid">
      <div className="panel chart-panel"><div className="panel-head"><div><h3>ภาพรวมรายรับ</h3><p>ยอดสะสมจาก Google Sheet</p></div><b className="total">฿ {totalRevenue}</b></div><div className="bars">{[18,24,20,32,28,36,30].map((h,i)=><div key={i}><span style={{height:`${systemData.transactions.length?h:8}%`}} className={i===5?"hot":""}/><small>{["พฤ","ศ","ส","อา","จ","อ","พ"][i]}</small></div>)}</div></div>
      <div className="panel team-panel"><div className="panel-head"><div><h3>พนักงานวันนี้</h3><p>เข้างาน {employees.filter(employee=>employee.status!=="ลา").length} จาก {employees.length} คน</p></div><span className="live">● LIVE</span></div><div className="team-avatars">{employees.map(employee=><span key={employee.id} className={employee.status==="ลา"?"absent":""}>{employee.name.replace("คุณ","").replace("พญ. ","").slice(0,1)}</span>)}</div><div className="attendance"><span><i className="green"/>ตรงเวลา <b>{employees.filter(employee=>employee.attendance==="ตรงเวลา").length}</b></span><span><i className="amber"/>สาย <b>{employees.filter(employee=>employee.attendance.includes("สาย")).length}</b></span><span><i className="gray"/>ลา <b>{employees.filter(employee=>employee.status==="ลา").length}</b></span></div></div>
    </section>
  </>;
}

function Metric({icon,label,value,unit,note,tone}:{icon:string,label:string,value:string,unit?:string,note:string,tone:string}) {
  return <div className="metric"><div className={`metric-icon ${tone}`}>{icon}</div><div><span>{label}</span><strong>{value} <small>{unit}</small></strong><p>{note}</p></div></div>;
}

function ModuleContent({active,onAdd,customers,employees,systemData,onOpenForm,onUpdateStatus}:{active:string;onAdd:()=>void;customers:Customer[];employees:Employee[];systemData:SystemData;onOpenForm:(kind:FormKind)=>void;onUpdateStatus:(customerId:string,status:string)=>Promise<void>}) {
  const customerName=(id:unknown)=>customers.find(customer=>customer.id===String(id))?.name||String(id||"-");
  const money=(value:unknown)=>Number(value||0).toLocaleString("th-TH");
  if(active === "ลูกค้า") return <DataModule title="ฐานข้อมูลลูกค้า" subtitle={`ข้อมูล ${customers.length} รายจากฐานข้อมูลที่เชื่อมต่อ`} action="＋ เพิ่มลูกค้า" onAction={onAdd} headers={["รหัส","ลูกค้า","เบอร์โทร","บริการล่าสุด","เข้ารับบริการ","ติดตามครั้งถัดไป","สถานะ"]} rows={customers.map(c=>[c.id,c.name,c.phone,c.service,c.last,c.follow,c.status])}/>;
  if(active === "ติดตามลูกค้า") return <FollowUpModule customers={customers} onUpdateStatus={onUpdateStatus}/>;
  if(active === "นัดหมาย") return <DataModule title="ตารางนัดหมาย" subtitle="ข้อมูลนัดหมายจาก Google Sheet" action="＋ เพิ่มนัดหมาย" onAction={()=>onOpenForm("appointment")} headers={["วันที่","เวลา","ลูกค้า","บริการ","สถานะ"]} rows={systemData.appointments.map(row=>[String(row.appointment_date||"-"),String(row.start_time||"-"),customerName(row.customer_id),String(row.service_id||"-"),String(row.status||"-")])}/>;
  if(active === "เข้ารับบริการ") return <DataModule title="ประวัติเข้ารับบริการ" subtitle="บันทึกหัตถการจริง ผู้ให้บริการ Lot และวันติดตาม" action="＋ บันทึกบริการ" onAction={()=>onOpenForm("visit")} headers={["วันที่","ลูกค้า","บริการ","ผู้ให้บริการ","Lot/หมายเหตุ"]} rows={systemData.visits.map(row=>[String(row.visit_date||"-"),customerName(row.customer_id),String(row.service_id||"-"),String(row.provider_id||"-"),String(row.product_lot||row.clinical_note||"-")])}/>;
  if(active === "การเงิน") return <DataModule title="รายรับและธุรกรรม" subtitle="รับชำระบริการ มัดจำ และผ่อนชำระจาก Google Sheet" action="＋ รับชำระ" onAction={()=>onOpenForm("transaction")} headers={["วันที่","ลูกค้า","ประเภท","รายการ","รับชำระ","สถานะ"]} rows={systemData.transactions.map(row=>[String(row.transaction_date||"-"),customerName(row.customer_id),String(row.transaction_type||"บริการ"),String(row.description||row.service_id||"-"),money(row.paid_amount||row.net_amount),String(row.payment_status||"-")])}/>;
  if(active === "คอร์ส") return <DataModule title="แพ็กเกจและเหมาคอร์ส" subtitle="ขายคอร์ส ติดตามยอดชำระ และสิทธิ์คงเหลือ" action="＋ ขายคอร์ส" onAction={()=>onOpenForm("courseSale")} headers={["รหัสคอร์ส","ลูกค้า","แพ็กเกจ","ทั้งหมด","ใช้แล้ว","คงเหลือ","ยอดค้าง","สถานะ"]} rows={systemData.customer_courses.map(row=>[String(row.course_id||"-"),customerName(row.customer_id),String(row.package_id||"-"),String(row.total_sessions||0),String(row.sessions_used||0),String(row.sessions_remaining||0),money(row.balance_due),String(row.status||"-")])}/>;
  if(active === "ค่าใช้จ่าย") return <DataModule title="ค่าใช้จ่ายคลินิก" subtitle="ค่าใช้จ่ายที่พนักงานกรอกและรอเจ้าของตรวจสอบ" action="＋ ลงค่าใช้จ่าย" onAction={()=>onOpenForm("expense")} headers={["วันที่","หมวด","รายละเอียด","ผู้ขาย","จำนวนเงิน","สถานะ"]} rows={systemData.expenses.map(row=>[String(row.expense_date||"-"),String(row.category||"-"),String(row.description||"-"),String(row.vendor||"-"),money(row.amount),String(row.status||"-")])}/>;
  if(active === "พนักงาน") return <DataModule title="พนักงานและเวลาเข้างาน" subtitle={`พนักงาน ${employees.length} คนจากฐานข้อมูลที่เชื่อมต่อ`} headers={["รหัส","ชื่อ","ตำแหน่ง","กะงาน","เวลาเข้า","สถานะ"]} rows={employees.map(e=>[e.id,e.name,e.position,e.shift,e.attendance,e.status])}/>;
  if(active === "SOP & Checklist") return <DataModule title="SOP & Checklist" subtitle="ขั้นตอนจริงจาก Google Sheet และเพิ่มรายการได้เอง" action="＋ เพิ่ม SOP" onAction={()=>onOpenForm("sop")} headers={["หมวด","ชื่อ SOP","ขั้นตอน","ผู้รับผิดชอบ","บังคับ","สถานะ"]} rows={systemData.sop.map(row=>[String(row.category||"-"),String(row.sop_name||"-"),String(row.step_detail||"-"),String(row.owner_role||"-"),String(row.required||"-"),String(row.active||"-")])}/>;
  if(active === "Stock") return <DataModule title="Stock คลินิก" subtitle="ยอดคงเหลือจริงและจุดสั่งซื้อจาก Google Sheet" action="＋ ลงความเคลื่อนไหว" onAction={()=>onOpenForm("stockMovement")} headers={["รหัส","รายการ","หมวด","คงเหลือ","หน่วย","ขั้นต่ำ","สถานะ"]} rows={systemData.inventory.map(row=>{const onHand=Number(row.on_hand||0),minimum=Number(row.reorder_level||0);return[String(row.item_id||"-"),String(row.item_name||"-"),String(row.category||"-"),String(onHand),String(row.unit||"-"),String(minimum),onHand<=minimum?"ต้องสั่ง":"ปกติ"]})}/>;
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
    try{await onUpdateStatus(customer.id,status);setNextStatus(status);setMessage("✓ อัปเดต Google Sheet แล้ว");}
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

const formTitles:Record<FormKind,string>={customer:"เพิ่มลูกค้า",appointment:"เพิ่มนัดหมาย",visit:"บันทึกเข้ารับบริการ",transaction:"รับชำระเงิน",package:"สร้างแพ็กเกจคอร์ส",courseSale:"ขาย/เหมาคอร์ส",courseUse:"ใช้สิทธิ์คอร์ส",expense:"ลงค่าใช้จ่าย",inventoryItem:"เพิ่มสินค้า Stock",stockMovement:"ความเคลื่อนไหว Stock",employee:"เพิ่มพนักงาน",attendance:"ลงเวลา/การลา",sop:"เพิ่ม SOP"};

function ActionCenter({role,onClose,onChoose}:{role:UserRole;onClose:()=>void;onChoose:(kind:FormKind)=>void}) {
  const staffActions:FormKind[]=["customer","appointment","visit","transaction","courseSale","courseUse","expense","stockMovement","attendance"];
  const ownerActions:FormKind[]=[...staffActions,"package","inventoryItem","employee","sop"];
  const icons:Record<FormKind,string>={customer:"♙",appointment:"□",visit:"✚",transaction:"฿",package:"◫",courseSale:"▣",courseUse:"✓",expense:"−",inventoryItem:"▦",stockMovement:"⇄",employee:"♧",attendance:"◷",sop:"☑"};
  return <div className="modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}><div className="modal action-center"><button className="modal-close" onClick={onClose}>×</button><span className="eyebrow">STAFF DATA ENTRY</span><h2>บันทึกข้อมูลเข้าระบบ</h2><p>เลือกรายการที่ต้องการกรอก ข้อมูลจะบันทึกลง Google Sheet โดยตรง</p><div className="action-grid">{(role==="owner"?ownerActions:staffActions).map(kind=><button key={kind} onClick={()=>onChoose(kind)}><i>{icons[kind]}</i><b>{formTitles[kind]}</b><small>กรอกเอง</small></button>)}</div></div></div>;
}

type EntryField={name:string;label:string;type?:string;required?:boolean;options?:{value:string;label:string}[];placeholder?:string;defaultValue?:string};

function OperationalForm({kind,role,customers,employees,systemData,onClose,onSave}:{kind:FormKind;role:UserRole;customers:Customer[];employees:Employee[];systemData:SystemData;onClose:()=>void;onSave:(action:string,data:RawRecord)=>Promise<void>}) {
  const [saving,setSaving]=useState(false); const [saved,setSaved]=useState(false); const [error,setError]=useState("");
  const today=new Date().toISOString().slice(0,10);
  const customerOptions=customers.map(customer=>({value:customer.id,label:`${customer.name} · ${customer.phone}`}));
  const employeeOptions=employees.map(employee=>({value:employee.id,label:`${employee.name} · ${employee.position}`}));
  const serviceOptions=systemData.services.map(service=>({value:String(service.service_id||service.service_name),label:String(service.service_name||service.service_id)}));
  const packageOptions=systemData.packages.map(item=>({value:String(item.package_id),label:`${String(item.package_name||item.package_id)} · ${Number(item.total_sessions||0)} ครั้ง`}));
  const courseOptions=systemData.customer_courses.filter(item=>Number(item.sessions_remaining||0)>0).map(item=>({value:String(item.course_id),label:`${String(item.course_id)} · ${customers.find(c=>c.id===String(item.customer_id))?.name||item.customer_id} · เหลือ ${item.sessions_remaining} ครั้ง`}));
  const inventoryOptions=systemData.inventory.map(item=>({value:String(item.item_id),label:`${String(item.item_name||item.item_id)} · คงเหลือ ${item.on_hand||0} ${item.unit||""}`}));
  const fields:Record<Exclude<FormKind,"customer">,EntryField[]>={
    appointment:[{name:"appointment_date",label:"วันที่นัด",type:"date",required:true,defaultValue:today},{name:"start_time",label:"เวลา",type:"time",required:true},{name:"customer_id",label:"ลูกค้า",options:customerOptions,required:true},{name:"service_id",label:"บริการ",options:serviceOptions,required:true},{name:"provider_id",label:"ผู้ให้บริการ",options:employeeOptions},{name:"status",label:"สถานะ",options:[{value:"Scheduled",label:"นัดหมาย"},{value:"Confirmed",label:"ยืนยันแล้ว"},{value:"Completed",label:"เสร็จแล้ว"},{value:"Cancelled",label:"ยกเลิก"}],required:true},{name:"note",label:"หมายเหตุ",type:"textarea"}],
    visit:[{name:"visit_date",label:"วันที่รับบริการ",type:"date",required:true,defaultValue:today},{name:"customer_id",label:"ลูกค้า",options:customerOptions,required:true},{name:"service_id",label:"บริการ",options:serviceOptions,required:true},{name:"provider_id",label:"แพทย์/ผู้ให้บริการ",options:employeeOptions},{name:"treatment_area",label:"บริเวณที่ทำ"},{name:"product_brand",label:"ยี่ห้อผลิตภัณฑ์"},{name:"product_lot",label:"Lot ผลิตภัณฑ์"},{name:"quantity",label:"จำนวนที่ใช้",type:"number"},{name:"next_followup_date",label:"วันติดตามครั้งถัดไป",type:"date"},{name:"clinical_note",label:"บันทึกการรักษา",type:"textarea"}],
    transaction:[{name:"transaction_date",label:"วันที่รับเงิน",type:"date",required:true,defaultValue:today},{name:"customer_id",label:"ลูกค้า",options:customerOptions,required:true},{name:"transaction_type",label:"ประเภทรายรับ",options:[{value:"service",label:"ค่าบริการ"},{value:"deposit",label:"มัดจำ"},{value:"course_payment",label:"ชำระคอร์ส/ผ่อนคอร์ส"},{value:"other",label:"อื่น ๆ"}],required:true},{name:"description",label:"รายการ",required:true},{name:"net_amount",label:"ยอดที่ต้องชำระ",type:"number",required:true},{name:"paid_amount",label:"รับชำระครั้งนี้",type:"number",required:true},{name:"payment_method",label:"วิธีชำระ",options:[{value:"cash",label:"เงินสด"},{value:"transfer",label:"โอน"},{value:"card",label:"บัตร"},{value:"other",label:"อื่น ๆ"}],required:true},{name:"payment_status",label:"สถานะ",options:[{value:"Paid",label:"ชำระครบ"},{value:"Partial",label:"ชำระบางส่วน"},{value:"Deposit",label:"มัดจำ"}],required:true},{name:"note",label:"หมายเหตุ",type:"textarea"}],
    package:[{name:"package_name",label:"ชื่อแพ็กเกจ",required:true},{name:"service_id",label:"บริการหลัก",options:serviceOptions},{name:"total_sessions",label:"จำนวนครั้ง",type:"number",required:true},{name:"package_price",label:"ราคาแพ็กเกจ",type:"number",required:true},{name:"validity_days",label:"อายุคอร์ส (วัน)",type:"number",defaultValue:"365"},{name:"note",label:"เงื่อนไข/หมายเหตุ",type:"textarea"}],
    courseSale:[{name:"purchase_date",label:"วันที่ซื้อคอร์ส",type:"date",required:true,defaultValue:today},{name:"customer_id",label:"ลูกค้า",options:customerOptions,required:true},{name:"package_id",label:"แพ็กเกจ",options:packageOptions,required:true},{name:"total_sessions",label:"จำนวนครั้ง",type:"number",required:true},{name:"total_amount",label:"ราคาเหมาคอร์ส",type:"number",required:true},{name:"paid_amount",label:"ชำระแล้ว",type:"number",required:true},{name:"payment_method",label:"วิธีชำระ",options:[{value:"cash",label:"เงินสด"},{value:"transfer",label:"โอน"},{value:"card",label:"บัตร"}],required:true},{name:"expiry_date",label:"วันหมดอายุ",type:"date"},{name:"note",label:"เงื่อนไข/หมายเหตุ",type:"textarea"}],
    courseUse:[{name:"course_id",label:"คอร์สของลูกค้า",options:courseOptions,required:true},{name:"usage_date",label:"วันที่ใช้สิทธิ์",type:"date",required:true,defaultValue:today},{name:"sessions_used",label:"จำนวนครั้งที่ใช้",type:"number",required:true,defaultValue:"1"},{name:"provider_id",label:"ผู้ให้บริการ",options:employeeOptions},{name:"note",label:"หมายเหตุ",type:"textarea"}],
    expense:[{name:"expense_date",label:"วันที่จ่าย",type:"date",required:true,defaultValue:today},{name:"category",label:"หมวดค่าใช้จ่าย",options:[{value:"เวชภัณฑ์",label:"เวชภัณฑ์"},{value:"ค่าเช่า/สาธารณูปโภค",label:"ค่าเช่า/สาธารณูปโภค"},{value:"การตลาด",label:"การตลาด"},{value:"เงินเดือน",label:"เงินเดือน"},{value:"อื่น ๆ",label:"อื่น ๆ"}],required:true},{name:"vendor",label:"ร้านค้า/ผู้รับเงิน"},{name:"description",label:"รายละเอียด",required:true},{name:"amount",label:"จำนวนเงิน",type:"number",required:true},{name:"payment_method",label:"วิธีจ่าย",options:[{value:"cash",label:"เงินสด"},{value:"transfer",label:"โอน"},{value:"card",label:"บัตร"}]},{name:"status",label:"สถานะ",options:[{value:"Pending",label:"รอตรวจ"},{value:"Approved",label:"อนุมัติ"}],required:true},{name:"note",label:"หมายเหตุ",type:"textarea"}],
    inventoryItem:[{name:"item_name",label:"ชื่อสินค้า/เวชภัณฑ์",required:true},{name:"category",label:"หมวด",required:true},{name:"unit",label:"หน่วย",placeholder:"ขวด / กล่อง / ชิ้น",required:true},{name:"on_hand",label:"ยอดเริ่มต้น",type:"number",required:true},{name:"reorder_level",label:"จุดสั่งซื้อ",type:"number",required:true},{name:"cost_per_unit",label:"ต้นทุนต่อหน่วย",type:"number"},{name:"lot_no",label:"Lot"},{name:"expiry_date",label:"วันหมดอายุ",type:"date"},{name:"note",label:"หมายเหตุ",type:"textarea"}],
    stockMovement:[{name:"movement_date",label:"วันที่",type:"date",required:true,defaultValue:today},{name:"item_id",label:"สินค้า",options:inventoryOptions,required:true},{name:"movement_type",label:"ประเภท",options:[{value:"IN",label:"รับเข้า"},{value:"USE",label:"เบิกใช้"},{value:"ADJUST_UP",label:"ปรับเพิ่ม"},{value:"ADJUST_DOWN",label:"ปรับลด"}],required:true},{name:"quantity",label:"จำนวน",type:"number",required:true},{name:"unit_cost",label:"ต้นทุนต่อหน่วย",type:"number"},{name:"note",label:"หมายเหตุ/เลขเอกสาร",type:"textarea"}],
    employee:[{name:"full_name",label:"ชื่อ–นามสกุล",required:true},{name:"nickname",label:"ชื่อเล่น"},{name:"phone",label:"เบอร์โทร"},{name:"role",label:"สิทธิ์",options:[{value:"staff",label:"Staff"},{value:"manager",label:"Manager"}]},{name:"position",label:"ตำแหน่ง",required:true},{name:"start_date",label:"วันที่เริ่มงาน",type:"date"},{name:"note",label:"หมายเหตุ",type:"textarea"}],
    attendance:[{name:"work_date",label:"วันที่",type:"date",required:true,defaultValue:today},{name:"employee_id",label:"พนักงาน",options:employeeOptions,required:true},{name:"clock_in",label:"เวลาเข้า",type:"time"},{name:"clock_out",label:"เวลาออก",type:"time"},{name:"attendance_status",label:"สถานะ",options:[{value:"Present",label:"มาทำงาน"},{value:"Late",label:"สาย"},{value:"Leave",label:"ลา"},{value:"Absent",label:"ขาด"}],required:true},{name:"leave_type",label:"ประเภทการลา"},{name:"note",label:"หมายเหตุ",type:"textarea"}],
    sop:[{name:"sop_name",label:"ชื่อ SOP",required:true},{name:"category",label:"หมวด",required:true},{name:"step_no",label:"ลำดับ",type:"number",required:true},{name:"step_detail",label:"ขั้นตอน",type:"textarea",required:true},{name:"owner_role",label:"ผู้รับผิดชอบ",required:true},{name:"required",label:"ระดับ",options:[{value:"TRUE",label:"บังคับ"},{value:"FALSE",label:"แนะนำ"}],required:true},{name:"version",label:"เวอร์ชัน",defaultValue:"1.0"}]
  };
  const numericKeys=new Set(["quantity","net_amount","paid_amount","total_sessions","total_amount","package_price","validity_days","sessions_used","amount","on_hand","reorder_level","cost_per_unit","unit_cost","step_no"]);
  const actionMap:Record<Exclude<FormKind,"customer">,string>={appointment:"addAppointment",visit:"addVisit",transaction:"addTransaction",package:"addPackage",courseSale:"sellCourse",courseUse:"useCourse",expense:"addExpense",inventoryItem:"addInventoryItem",stockMovement:"addStockMovement",employee:"addEmployee",attendance:"clockIn",sop:"addSOP"};
  async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setSaving(true);setError("");const form=new FormData(event.currentTarget);const data:RawRecord={};for(const [key,value] of form.entries())data[key]=numericKeys.has(key)?Number(value):value;data.created_at=new Date().toISOString();data.created_by=role==="owner"?"Rawee":"Staff";data.staff_id=role==="owner"?"Rawee":"Staff";if(kind==="package"||kind==="inventoryItem"){data.active=true;}if(kind==="sop")data.active=true;if(kind==="employee"){data.active=true;data.work_status="Active";}if(kind==="courseSale"){data.sessions_used=0;data.sessions_remaining=Number(data.total_sessions||0);data.balance_due=Math.max(0,Number(data.total_amount||0)-Number(data.paid_amount||0));data.status=Number(data.balance_due)===0?"Active-Paid":"Active-Partial";data.sales_staff_id=data.staff_id;}if(kind==="courseUse"){const course=systemData.customer_courses.find(item=>String(item.course_id)===String(data.course_id));data.customer_id=course?.customer_id||"";data.service_id=course?.package_id||"";}if(kind==="transaction")data.balance_due=Math.max(0,Number(data.net_amount||0)-Number(data.paid_amount||0));try{await onSave(actionMap[kind as Exclude<FormKind,"customer">],data);setSaved(true);}catch(error){setError(error instanceof Error?error.message:"บันทึกไม่สำเร็จ");}finally{setSaving(false);}}
  if(saved)return <div className="modal-backdrop"><div className="modal"><button className="modal-close" onClick={onClose}>×</button><div className="success"><div>✓</div><h2>บันทึกลง Google Sheet แล้ว</h2><p>{formTitles[kind]}เรียบร้อย พร้อมแสดงใน Dashboard</p><button className="primary" onClick={onClose}>ปิด</button></div></div></div>;
  return <div className="modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}><div className="modal operational-modal"><button className="modal-close" onClick={onClose}>×</button><span className="eyebrow">GOOGLE SHEET ENTRY</span><h2>{formTitles[kind]}</h2><p>กรอกข้อมูลให้ครบ ระบบจะบันทึกลงแท็บที่เกี่ยวข้องโดยอัตโนมัติ</p><form onSubmit={submit}><div className="entry-grid">{fields[kind as Exclude<FormKind,"customer">].map(field=><label key={field.name} className={field.type==="textarea"?"wide-field":""}>{field.label}{field.type==="textarea"?<textarea name={field.name} required={field.required} placeholder={field.placeholder}/>:field.options?<select name={field.name} required={field.required} defaultValue=""><option value="" disabled>เลือก...</option>{field.options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select>:<input name={field.name} type={field.type||"text"} required={field.required} placeholder={field.placeholder} defaultValue={field.defaultValue} step={field.type==="number"?"any":undefined}/>}</label>)}</div>{error&&<p className="form-error">{error}</p>}<button className="primary form-submit" disabled={saving}>{saving?"กำลังบันทึก...":"บันทึกลง Google Sheet"}</button></form></div></div>;
}

const CONNECTION_URL_KEY = "raweeAppsScriptUrl";
const CONNECTION_API_KEY = "raweeAppsScriptApiKey";
const RAW_DATA_SHEET_URL = "https://docs.google.com/spreadsheets/d/1wA-u9CkCVDQ88LIl1P9cNMFaNBF6c6A2DuQsYV9adR8/edit";

async function callRaweeApi(action:string,data:RawRecord={}) {
  const hosted=typeof window!=="undefined"&&window.location.hostname.endsWith("netlify.app");
  const url=hosted?"/api/rawee":localStorage.getItem(CONNECTION_URL_KEY)||"";
  const apiKey=hosted?"":localStorage.getItem(CONNECTION_API_KEY)||"";
  if(!url) throw new Error("กรุณาเชื่อม Google Sheet ก่อน");
  const response=await fetch(url,{method:"POST",headers:{"Content-Type":hosted?"application/json":"text/plain;charset=utf-8"},body:JSON.stringify(hosted?{action,data}:{action,data,apiKey})});
  const result=await response.json();
  if(!response.ok||!result.ok) throw new Error(result.error||"เชื่อม Google Sheet ไม่สำเร็จ");
  return result;
}

function SettingsPage({onSaved}:{onSaved:()=>void}) {
  const hosted=typeof window!=="undefined"&&window.location.hostname.endsWith("netlify.app");
  const [url,setUrl]=useState(()=>typeof window === "undefined" ? "" : localStorage.getItem(CONNECTION_URL_KEY) || "");
  const [apiKey,setApiKey]=useState(()=>typeof window === "undefined" ? "" : localStorage.getItem(CONNECTION_API_KEY) || "");
  const [message,setMessage]=useState("");
  const connected=hosted||Boolean(url && apiKey);
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
      {hosted?<div className="secure-connection"><b>✓ เชื่อมต่ออัตโนมัติแบบปลอดภัย</b><span>API Key ถูกเก็บไว้ในระบบหลังบ้าน Staff ไม่สามารถเปิดดูหรือแก้ไขได้</span></div>:<><label>Apps Script Web App URL<input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://script.google.com/macros/s/.../exec"/></label><label>API Key<input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="รหัสเดียวกับใน Apps Script"/></label></>}
      <div className="settings-actions">
        {!hosted&&<button className="primary" onClick={save} disabled={!url.trim()||!apiKey.trim()}>บันทึกการเชื่อมต่อ</button>}
        <a className="sheet-link" href={RAW_DATA_SHEET_URL} target="_blank" rel="noreferrer" aria-label="เปิด Google Sheet Raw Data ในแท็บใหม่">▦ เปิด Google Sheet (Raw Data)</a>
        {message&&<span>{message}</span>}
      </div>
    </div>
    <div className="module-toggles"><h3>โมดูลระบบ</h3>{[["ลูกค้าและ Follow-up",true],["นัดหมาย",true],["รายรับ",true],["พนักงานและเวลาเข้างาน",true],["SOP & Checklist",true],["Stock",true]].map(([n,on])=><div key={String(n)}><span>{n}</span><button className={on?"toggle on":"toggle"} aria-label={`เปิดปิด ${n}`}><i/></button></div>)}</div>
  </div>;
}

function AddCustomer({onClose,onSaved}:{onClose:()=>void;onSaved:()=>Promise<void>}) {
  const [saved,setSaved]=useState(false);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const connected=typeof window !== "undefined" && (window.location.hostname.endsWith("netlify.app")||Boolean(localStorage.getItem(CONNECTION_URL_KEY) && localStorage.getItem(CONNECTION_API_KEY)));
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault(); setSaving(true); setError("");
    const form=new FormData(e.currentTarget);
    const data={full_name:form.get("full_name"),nickname:form.get("nickname"),phone:form.get("phone"),service_interest:form.get("service_interest"),source:"Web App",consent_contact:form.get("consent_contact")==="on",medical_note:form.get("medical_note")};
    try{
      await callRaweeApi("addCustomer",data);
      setSaved(true);
      await onSaved();
    }catch(error){setError(error instanceof Error&&error.message==="DUPLICATE_PHONE"?"มีเบอร์โทรนี้อยู่ในระบบแล้ว":"ส่งข้อมูลไม่สำเร็จ กรุณาตรวจ URL และลองใหม่");}
    finally{setSaving(false);}
  }
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="modal"><button className="modal-close" onClick={onClose}>×</button>{saved ? <div className="success"><div>✓</div><h2>ส่งข้อมูลลูกค้าแล้ว</h2><p>ระบบส่งข้อมูลไปยัง Google Sheet เรียบร้อย</p><button className="primary" onClick={onClose}>กลับหน้าหลัก</button></div> : <><span className="eyebrow">NEW CUSTOMER</span><h2>เพิ่มลูกค้าใหม่</h2><p>{connected?"ข้อมูลจะถูกบันทึกใน Google Sheet ของคลินิก":"ยังไม่เชื่อม Google Sheet — ตั้งค่าได้ที่เมนูตั้งค่า"}</p><form onSubmit={submit}><label>ชื่อ–นามสกุล<input name="full_name" required placeholder="เช่น สมหญิง ใจดี"/></label><div className="form-grid"><label>ชื่อเล่น<input name="nickname" placeholder="ชื่อเล่น"/></label><label>เบอร์โทร<input name="phone" required inputMode="tel" placeholder="08x-xxx-xxxx"/></label></div><label>บริการที่สนใจ<select name="service_interest" defaultValue=""><option value="" disabled>เลือกบริการ</option><option>Botox</option><option>Filler</option><option>เส้นเลือดขอด</option><option>ทรีตเมนต์ผิว</option></select></label><label>หมายเหตุ<textarea name="medical_note" placeholder="ข้อมูลที่ควรทราบ..."/></label><label className="consent"><input name="consent_contact" type="checkbox"/> ลูกค้ายินยอมให้ติดต่อเพื่อนัดหมายและติดตามผล</label>{error&&<p className="form-error">{error}</p>}<button className="primary form-submit" disabled={saving}>{saving?"กำลังบันทึก...":"บันทึกลูกค้า"}</button></form></>}</div></div>;
}
