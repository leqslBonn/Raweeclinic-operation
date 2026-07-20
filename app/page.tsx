/// <reference types="vite/client" />
"use client";
import { useEffect, useMemo, useState, type ReactNode } from "react";
const APP_VERSION = "1.2.0";
const RAW_DATA_SHEET_URL = "https://docs.google.com/spreadsheets/d/1wA-u9CkCVDQ88LIl1P9cNMFaNBF6c6A2DuQsYV9adR8/edit";
const LOCAL_PREVIEW = import.meta.env.DEV && new URLSearchParams(window.location.search).get("preview") === "owner";
type UserRole = "owner" | "staff";
type RawRecord = Record<string, unknown>;
type Customer = {
    id: string;
    name: string;
    phone: string;
    service: string;
    last: string;
    follow: string;
    followRaw: string;
    status: string;
    owner: string;
};
type Employee = {
    id: string;
    name: string;
    position: string;
    shift: string;
    status: string;
};
type FormKind = "customer" | "appointment" | "visit" | "transaction" | "service" | "package" | "courseSale" | "courseUse" | "expense" | "inventoryItem" | "stockMovement" | "employee" | "attendance" | "sop";
type SystemData = {
    appointments: RawRecord[];
    followups: RawRecord[];
    transactions: RawRecord[];
    visits: RawRecord[];
    services: RawRecord[];
    packages: RawRecord[];
    customer_courses: RawRecord[];
    course_usage: RawRecord[];
    expenses: RawRecord[];
    inventory: RawRecord[];
    stock_movements: RawRecord[];
    attendance: RawRecord[];
    sop: RawRecord[];
    settings: RawRecord[];
};
const emptySystemData: SystemData = { appointments: [], followups: [], transactions: [], visits: [], services: [], packages: [], customer_courses: [], course_usage: [], expenses: [], inventory: [], stock_movements: [], attendance: [], sop: [], settings: [] };
const statuses = ["ลูกค้าใหม่", "ด่วน", "เกินกำหนด", "รอติดตาม", "รอยืนยัน", "นัดแล้ว", "สำเร็จ", "งดติดต่อ"];
const systemModules = ["ลูกค้า", "ติดตามลูกค้า", "นัดหมาย", "เข้ารับบริการ", "บริการและโปรโมชั่น", "การเงิน", "คอร์ส", "ค่าใช้จ่าย", "พนักงาน", "SOP & Checklist", "Stock"];
const navItems = [["ภาพรวม", "⌂"], ["ลูกค้า", "♙"], ["ติดตามลูกค้า", "◎"], ["นัดหมาย", "□"], ["เข้ารับบริการ", "✚"], ["บริการและโปรโมชั่น", "✦"], ["การเงิน", "฿"], ["คอร์ส", "◫"], ["ค่าใช้จ่าย", "−"], ["พนักงาน", "♧"], ["SOP & Checklist", "✓"], ["Stock", "▦"], ["ตั้งค่า", "⚙"]];
function text(value: unknown, fallback = "-") { const result = String(value ?? "").trim(); return result || fallback; }
function dateText(value: unknown) { if (!value)
    return "-"; const date = new Date(String(value)); return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", day: "numeric", month: "short", year: "2-digit" }).format(date); }
function bangkokDay(date = new Date()) { const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date); const get = (type: string) => parts.find(part => part.type === type)?.value || ""; return `${get("year")}-${get("month")}-${get("day")}`; }
function isoDay(value: unknown) { if (!value)
    return ""; const raw = String(value); if (/^\d{4}-\d{2}-\d{2}$/.test(raw.slice(0, 10)))
    return raw.slice(0, 10); const date = new Date(raw); return Number.isNaN(date.getTime()) ? raw.slice(0, 10) : bangkokDay(date); }
function phoneText(value: unknown) { let phone = String(value ?? "").replace(/\D/g, ""); if (phone.length === 9)
    phone = `0${phone}`; return phone || "-"; }
const statusThai: Record<string, string> = { Scheduled: "นัดหมาย", Confirmed: "ยืนยันแล้ว", Completed: "เสร็จแล้ว", Cancelled: "ยกเลิก", Paid: "ชำระครบ", Partial: "ชำระบางส่วน", Deposit: "มัดจำ", Void: "ยกเลิกแล้ว", Pending: "รอตรวจ", Approved: "อนุมัติแล้ว", Rejected: "ไม่อนุมัติ", Present: "มาทำงาน", Late: "สาย", Leave: "ลา", Absent: "ขาด", "Active-Paid": "ใช้งาน · ชำระครบ", "Active-Partial": "ใช้งาน · ค้างชำระ", Active: "ใช้งาน", Inactive: "ปิดใช้งาน" };
function translated(value: unknown, fallback = "-") { const raw = text(value, fallback); return statusThai[raw] || raw; }
function customerStatus(value: unknown) { const status = text(value, "ลูกค้าใหม่"); return status === "Active" ? "ลูกค้าใหม่" : status; }
function normalizeCustomer(row: RawRecord, followups: RawRecord[], services: RawRecord[]): Customer {
    const id = text(row.customer_id, "");
    const latest = followups.filter(item => String(item.customer_id) === id).sort((a, b) => String(b.created_at || b.completed_at || "").localeCompare(String(a.created_at || a.completed_at || "")))[0];
    const followRaw = text(row.next_followup_date || latest?.due_date, "");
    const serviceValue = row.last_visit || row.service_interest;
    const service = text(services.find(item => String(item.service_id) === String(serviceValue))?.service_name || serviceValue, "ยังไม่มีบริการ");
    return { id, name: text(row.full_name, "ไม่ระบุชื่อ"), phone: phoneText(row.phone), service, last: dateText(row.last_visit_date || row.created_at), follow: dateText(followRaw), followRaw, status: customerStatus(row.status || latest?.status), owner: text(latest?.assigned_to, "ยังไม่มอบหมาย") };
}
function normalizeEmployee(row: RawRecord): Employee { return { id: text(row.employee_id, ""), name: text(row.full_name, "ไม่ระบุชื่อ"), position: text(row.position || row.role), shift: text(row.shift || row.shift_time, "ยังไม่กำหนด"), status: text(row.work_status, "Active") }; }
function money(value: unknown) { return Number(value || 0).toLocaleString("th-TH", { maximumFractionDigits: 2 }); }
export default function Home() {
    const [role, setRole] = useState<UserRole | null | undefined>(LOCAL_PREVIEW ? "owner" : undefined);
    const [active, setActive] = useState("ภาพรวม");
    const [showAdd, setShowAdd] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [showForm, setShowForm] = useState<FormKind | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [systemData, setSystemData] = useState<SystemData>(emptySystemData);
    const [dataStatus, setDataStatus] = useState<"loading" | "sheet" | "error">(LOCAL_PREVIEW ? "sheet" : "loading");
    const [loadError, setLoadError] = useState("");
    const today = useMemo(() => new Intl.DateTimeFormat("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date()), []);
    useEffect(() => { if (LOCAL_PREVIEW) return; void fetch("/api/rawee-auth", { credentials: "include" }).then(async (response) => { if (!response.ok)
        return setRole(null); const result = await response.json(); setRole(result.role); void loadSheetData(); }).catch(() => setRole(null)); }, []);
    useEffect(() => { if (!role || LOCAL_PREVIEW)
        return; const refresh = () => void loadSheetData(); const visible = () => { if (document.visibilityState === "visible")
        refresh(); }; const timer = window.setInterval(refresh, 30000); window.addEventListener("focus", refresh); document.addEventListener("visibilitychange", visible); return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", visible); }; }, [role]);
    async function loadSheetData() { setDataStatus("loading"); setLoadError(""); try {
        const result = await callRaweeApi("getSystemData");
        const followups = result.followups || [];
        const services = (result.services || []).filter((row: RawRecord) => row.active !== false);
        setCustomers((result.customers || []).filter((row: RawRecord) => row.customer_id).map((row: RawRecord) => normalizeCustomer(row, followups, services)));
        setEmployees((result.employees || []).filter((row: RawRecord) => row.employee_id && row.active !== false && !['Archived', 'Inactive'].includes(String(row.work_status))).map(normalizeEmployee));
        setSystemData({ appointments: result.appointments || [], followups, transactions: result.transactions || [], visits: result.visits || [], services, packages: (result.packages || []).filter((row: RawRecord) => row.active !== false), customer_courses: result.customer_courses || [], course_usage: result.course_usage || [], expenses: result.expenses || [], inventory: (result.inventory || []).filter((row: RawRecord) => row.active !== false), stock_movements: result.stock_movements || [], attendance: result.attendance || [], sop: (result.sop || []).filter((row: RawRecord) => row.active !== false), settings: result.settings || [] });
        setDataStatus("sheet");
    }
    catch (error) {
        setDataStatus("error");
        setLoadError(error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ");
    } }
    async function updateCustomerStatus(customerId: string, status: string, detail: RawRecord = {}) { await callRaweeApi("recordCustomerActivity", { customer_id: customerId, status, ...detail }); await loadSheetData(); }
    async function saveOperationalRecord(action: string, data: RawRecord) { await callRaweeApi(action, data); await loadSheetData(); }
    async function logout() { await fetch("/api/rawee-auth", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) }); setRole(null); }
    if (role === undefined)
        return <div className="login-loading">กำลังเปิดระบบ...</div>;
    if (role === null)
        return <LoginPage onLogin={nextRole => { setRole(nextRole); void loadSheetData(); }}/>;
    const disabledModules = new Set(systemData.settings.filter(row => String(row.setting_value).toUpperCase() === "FALSE").map(row => String(row.setting_id).replace(/^module:/, "")));
    const visibleNav = navItems.filter(([label]) => (role === "owner" || label !== "ตั้งค่า") && (label === "ภาพรวม" || label === "ตั้งค่า" || !disabledModules.has(label)));
    const openCount = customers.filter(item => ["ด่วน", "เกินกำหนด", "รอติดตาม"].includes(item.status)).length;
    return <main className="app-shell"><aside className="sidebar"><div className="brand"><div className="brand-mark">R<span>✦</span></div><div><strong>RAWEE</strong><small>AESTHETIC CLINIC</small></div></div><nav><p className="nav-label">เมนูหลัก</p>{visibleNav.map(([label, icon]) => <button key={label} className={active === label ? "active" : ""} onClick={() => setActive(label)}><span className="nav-icon">{icon}</span>{label}{label === "ติดตามลูกค้า" && openCount > 0 && <b className="badge">{openCount}</b>}</button>)}</nav><div className="clinic-card"><span className="pulse"/><div><b>Rawee Clinic</b><small>{dataStatus === "sheet" ? `เชื่อม Google Sheet · v${APP_VERSION}` : `ตรวจการเชื่อมต่อ · v${APP_VERSION}`}</small></div></div><div className="user"><div className="avatar">{role === "owner" ? "ร" : "S"}</div><div><b>{role === "owner" ? "คุณรวี" : "Staff"}</b><small>{role === "owner" ? "เจ้าของคลินิก" : "พนักงาน"}</small></div><button className="logout-btn" onClick={() => void logout()}>ออก</button></div></aside>
  <section className="workspace"><header><div><h1>{active}</h1><p>{today} · สาขาคลองสาม</p></div><div className="header-actions"><span className={`data-source ${dataStatus}`}>{dataStatus === "sheet" ? "● Google Sheet" : dataStatus === "loading" ? "กำลังโหลด..." : "○ เชื่อมต่อไม่สำเร็จ"}</span><button className="icon-btn" aria-label="โหลดข้อมูลใหม่" onClick={() => void loadSheetData()}>↻</button><button className="primary" onClick={() => setShowActions(true)}>＋ บันทึกข้อมูล</button></div></header>{dataStatus === "error" && <div className="system-alert">โหลดข้อมูลไม่สำเร็จ: {loadError} <button onClick={() => void loadSheetData()}>ลองอีกครั้ง</button></div>}{active === "ภาพรวม" ? <Dashboard onOpenModule={setActive} customers={customers} employees={employees} systemData={systemData}/> : active === "ตั้งค่า" && role === "owner" ? <SettingsPage /> : <ModuleContent active={active} role={role} onAdd={() => setShowAdd(true)} customers={customers} employees={employees} systemData={systemData} onOpenForm={setShowForm} onUpdateStatus={updateCustomerStatus}/>}</section>
  {showAdd && <AddCustomer services={systemData.services} onClose={() => setShowAdd(false)} onSaved={loadSheetData}/>} {showActions && <ActionCenter role={role} onClose={() => setShowActions(false)} onChoose={kind => { setShowActions(false); if (kind === "customer") setShowAdd(true); else setShowForm(kind); }}/>}{showForm && <OperationalForm kind={showForm} role={role} customers={customers} employees={employees} systemData={systemData} onClose={() => setShowForm(null)} onSave={saveOperationalRecord}/>}</main>;
}
function LoginPage({ onLogin }: {
    onLogin: (role: UserRole) => void;
}) { const [username, setUsername] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [checking, setChecking] = useState(false); async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setChecking(true); setError(""); try {
    const response = await fetch("/api/rawee-auth", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: username.trim(), password }) });
    const result = await response.json();
    if (!response.ok || !result.ok)
        throw new Error("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    onLogin(result.role);
}
catch (error) {
    setError(error instanceof Error ? error.message : "เข้าสู่ระบบไม่สำเร็จ");
}
finally {
    setChecking(false);
} } return <main className="login-page"><section className="login-card"><div className="login-brand-mark">R<span>✦</span></div><p className="login-eyebrow">RAWEE AESTHETIC CLINIC</p><h1>Customer Follow Up</h1><p className="login-intro">เข้าสู่ระบบสำหรับเจ้าของคลินิกและพนักงาน</p><form onSubmit={submit}><label>ชื่อผู้ใช้<input value={username} onChange={event => setUsername(event.target.value)} autoComplete="username" required/></label><label>รหัสผ่าน<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required/></label>{error && <p className="login-error">{error}</p>}<button className="primary login-submit" disabled={checking}>{checking ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}</button></form><small className="login-help">หากลืมรหัสผ่าน กรุณาติดต่อเจ้าของคลินิก · v{APP_VERSION}</small></section></main>; }
function Dashboard({ onOpenModule, customers, employees, systemData }: {
    onOpenModule: (module: string) => void;
    customers: Customer[];
    employees: Employee[];
    systemData: SystemData;
}) { const [selectedStatus, setSelectedStatus] = useState("ทั้งหมด"); const dashboardStatuses = statuses.slice(0, 7); const counts = Object.fromEntries(dashboardStatuses.map(status => [status, customers.filter(c => c.status === status).length])); const visible = selectedStatus === "ทั้งหมด" ? customers : customers.filter(c => c.status === selectedStatus); const today = bangkokDay(); const todayTx = systemData.transactions.filter(row => isoDay(row.transaction_date || row.created_at) === today && String(row.payment_status) !== "Void"); const todayAppointments = systemData.appointments.filter(row => isoDay(row.appointment_date) === today && String(row.status) !== "Cancelled"); const open = customers.filter(c => ["ด่วน", "เกินกำหนด", "รอติดตาม"].includes(c.status)); const revenue = todayTx.reduce((sum, row) => sum + Number(row.paid_amount || row.net_amount || 0), 0); const serviceName = (id: unknown) => text(systemData.services.find(item => String(item.service_id) === String(id))?.service_name || id); const days = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); const iso = bangkokDay(date); return { label: new Intl.DateTimeFormat("th-TH", { weekday: "short" }).format(date), amount: systemData.transactions.filter(row => isoDay(row.transaction_date || row.created_at) === iso && String(row.payment_status) !== "Void").reduce((sum, row) => sum + Number(row.paid_amount || row.net_amount || 0), 0) }; }); const max = Math.max(1, ...days.map(day => day.amount)); const todayAttendance = systemData.attendance.filter(row => isoDay(row.work_date) === today); return <><section className="hero-strip"><div><span className="eyebrow">CLINIC OPERATIONS</span><h2>วันนี้มีลูกค้ารอการดูแล <em>{open.length} ราย</em></h2><p>ตัวเลขทั้งหมดคำนวณจาก Google Sheet ปัจจุบัน</p></div><div className="hero-orb"><span>{open.length}</span><small>งานติดตาม</small></div></section><section className="metrics"><Metric icon="♙" label="ลูกค้าทั้งระบบ" value={String(customers.length)} note="ข้อมูลจริงใน Google Sheet" tone="rose"/><Metric icon="฿" label="รายรับวันนี้" value={money(revenue)} unit="บาท" note={`${todayTx.length} ธุรกรรม`} tone="gold"/><Metric icon="◎" label="ต้องติดตาม" value={String(open.length)} note={`ด่วน ${counts["ด่วน"] || 0} · เกินกำหนด ${counts["เกินกำหนด"] || 0}`} tone="purple"/><Metric icon="□" label="นัดหมายวันนี้" value={String(todayAppointments.length)} note={`ยืนยันแล้ว ${todayAppointments.filter(row => String(row.status) === "Confirmed").length} ราย`} tone="sage"/></section><section className="dashboard-status-panel panel"><div className="panel-head"><div><h3>สถานะลูกค้าปัจจุบัน</h3><p>กดสถานะเพื่อเรียกดู · รวม {customers.length} ราย</p></div><button className="text-btn" onClick={() => onOpenModule("ติดตามลูกค้า")}>เปิดศูนย์ติดตาม →</button></div><div className="dashboard-status-cards"><button className={selectedStatus === "ทั้งหมด" ? "active" : ""} onClick={() => setSelectedStatus("ทั้งหมด")}><b>{customers.length}</b><span>ทั้งหมด</span></button>{dashboardStatuses.map(status => <button key={status} className={selectedStatus === status ? "active" : ["เกินกำหนด", "ด่วน"].includes(status) ? "attention" : ""} onClick={() => setSelectedStatus(status)}><b>{counts[status] || 0}</b><span>{status}</span></button>)}</div><div className="dashboard-status-result"><b>{selectedStatus === "ทั้งหมด" ? "ลูกค้าทุกสถานะ" : `ลูกค้าสถานะ ${selectedStatus}`}</b><span>{visible.length} ราย</span></div><div className="dashboard-customer-list">{visible.slice(0, 8).map(customer => <button key={customer.id} onClick={() => onOpenModule("ติดตามลูกค้า")}><span className="mini-avatar">{customer.name.slice(-1)}</span><span><b>{customer.name}</b><small>{customer.service} · เข้าล่าสุด {customer.last}</small></span><i>{customer.status}</i></button>)}</div>{visible.length === 0 && <EmptyState label="ยังไม่มีลูกค้าในสถานะนี้"/>}</section><section className="content-grid"><div className="panel follow-panel"><div className="panel-head"><div><h3>งานติดตามสำคัญ</h3><p>บันทึกผลได้ที่ศูนย์ติดตาม</p></div><button className="text-btn" onClick={() => onOpenModule("ติดตามลูกค้า")}>ดูทั้งหมด →</button></div><div className="follow-list">{open.slice(0, 4).map(item => <button className="follow-row follow-link" key={item.id} onClick={() => onOpenModule("ติดตามลูกค้า")}><div className={`customer-avatar ${item.status === "ด่วน" ? "urgent" : item.status === "เกินกำหนด" ? "late" : "today"}`}>{item.name.slice(-1)}</div><div className="customer-info"><b>{item.name}</b><span>{item.service}</span></div><div className="due"><b>{item.follow}</b><span>{item.status}</span></div></button>)}{open.length === 0 && <EmptyState label="ไม่มีงานติดตามค้าง"/>}</div></div><div className="panel appointment-panel"><div className="panel-head"><div><h3>นัดหมายวันนี้</h3><p>{todayAppointments.length} นัด</p></div></div><div className="appointment-list">{todayAppointments.slice(0, 4).map((row, index) => <div className="appointment" key={text(row.appointment_id, String(index))}><b className="time">{text(row.start_time)}</b><div className="line"/><div><strong>{text(customers.find(c => c.id === String(row.customer_id))?.name || row.customer_id)}</strong><span>{serviceName(row.service_id)}</span></div><small>{translated(row.status)}</small></div>)}{todayAppointments.length === 0 && <EmptyState label="วันนี้ยังไม่มีนัดหมาย"/>}</div><button className="outline-wide" onClick={() => onOpenModule("นัดหมาย")}>เปิดตารางนัดหมาย</button></div></section><section className="bottom-grid"><div className="panel chart-panel"><div className="panel-head"><div><h3>รายรับ 7 วันล่าสุด</h3><p>คำนวณจากวันที่รับเงิน</p></div><b className="total">฿ {money(days.reduce((sum, day) => sum + day.amount, 0))}</b></div><div className="bars">{days.map(day => <div key={day.label}><span style={{ height: `${day.amount ? Math.max(8, day.amount / max * 100) : 2}%` }} className={day.amount === max && day.amount > 0 ? "hot" : ""}/><small>{day.label}</small></div>)}</div></div><div className="panel team-panel"><div className="panel-head"><div><h3>พนักงานวันนี้</h3><p>มีบันทึกเวลา {todayAttendance.length} จาก {employees.length} คน</p></div><span className="live">● LIVE</span></div><div className="team-avatars">{employees.map(employee => <span key={employee.id}>{employee.name.slice(0, 1)}</span>)}</div><div className="attendance"><span><i className="green"/>มาทำงาน <b>{todayAttendance.filter(row => ["Present", "Late"].includes(String(row.attendance_status))).length}</b></span><span><i className="amber"/>สาย <b>{todayAttendance.filter(row => String(row.attendance_status) === "Late").length}</b></span><span><i className="gray"/>ลา/ขาด <b>{todayAttendance.filter(row => ["Leave", "Absent"].includes(String(row.attendance_status))).length}</b></span></div></div></section></>; }
function Metric({ icon, label, value, unit, note, tone }: {
    icon: string;
    label: string;
    value: string;
    unit?: string;
    note: string;
    tone: string;
}) { return <div className="metric"><div className={`metric-icon ${tone}`}>{icon}</div><div><span>{label}</span><strong>{value} <small>{unit}</small></strong><p>{note}</p></div></div>; }
function EmptyState({ label }: {
    label: string;
}) { return <div className="empty-result">{label}</div>; }
function ModuleContent({ active, role, onAdd, customers, employees, systemData, onOpenForm, onUpdateStatus }: {
    active: string;
    role: UserRole;
    onAdd: () => void;
    customers: Customer[];
    employees: Employee[];
    systemData: SystemData;
    onOpenForm: (kind: FormKind) => void;
    onUpdateStatus: (customerId: string, status: string, detail?: RawRecord) => Promise<void>;
}) {
    const customerName = (id: unknown) => text(customers.find(c => c.id === String(id))?.name || id);
    const serviceName = (id: unknown) => text(systemData.services.find(s => String(s.service_id) === String(id))?.service_name || id);
    const employeeName = (id: unknown) => text(employees.find(e => e.id === String(id))?.name || id);
    const packageName = (id: unknown) => text(systemData.packages.find(p => String(p.package_id) === String(id))?.package_name || id);
    const today = bangkokDay();
    const attendanceByEmployee = Object.fromEntries(systemData.attendance.filter(row => isoDay(row.work_date) === today).map(row => [String(row.employee_id), row]));
    if (active === "ลูกค้า")
        return <DataModule title="ฐานข้อมูลลูกค้า" subtitle={`${customers.length} รายจาก Google Sheet`} action="＋ เพิ่มลูกค้า" onAction={onAdd} headers={["รหัส", "ลูกค้า", "เบอร์โทร", "บริการล่าสุด", "เข้าล่าสุด", "ติดตามถัดไป", "สถานะ", ...(role === "owner" ? ["แก้ไข"] : [])]} rows={customers.map(c => { const cells: TableCell[] = [c.id, c.name, c.phone, c.service, c.last, c.follow, c.status]; if (role === "owner") cells.push(<CustomerEditAction customer={c} services={systemData.services}/>); return cells; })}/>;
    if (active === "ติดตามลูกค้า")
        return <FollowUpModule customers={customers} employees={employees} onUpdateStatus={onUpdateStatus}/>;
    if (active === "นัดหมาย")
        return <DataModule title="ตารางนัดหมาย" subtitle="ค้นหาและตรวจนัดหมายจาก Google Sheet" action="＋ เพิ่มนัดหมาย" onAction={() => onOpenForm("appointment")} headers={["วันที่", "เวลา", "ลูกค้า", "บริการ", "ผู้ให้บริการ", "สถานะ", ...(role === "owner" ? ["จัดการ"] : [])]} rows={systemData.appointments.map(row => { const cells: TableCell[] = [dateText(row.appointment_date), text(row.start_time), customerName(row.customer_id), serviceName(row.service_id), employeeName(row.provider_id), translated(row.status)]; if (role === "owner")
            cells.push(<div className="row-actions"><OwnerRecordAction action="setAppointmentStatus" id={text(row.appointment_id)} status="Confirmed" label="ยืนยัน" confirmText="ยืนยันนัดหมายนี้?"/><OwnerRecordAction action="setAppointmentStatus" id={text(row.appointment_id)} status="Completed" label="เสร็จ" confirmText="ยืนยันว่ารับบริการเสร็จแล้ว?"/><OwnerRecordAction action="setAppointmentStatus" id={text(row.appointment_id)} status="Cancelled" label="ยกเลิก" confirmText="ยกเลิกนัดหมายนี้?"/></div>); return cells; })}/>;
    if (active === "เข้ารับบริการ")
        return <DataModule title="ประวัติเข้ารับบริการ" subtitle="หัตถการ ผู้ให้บริการ Lot และวันติดตาม" action="＋ บันทึกบริการ" onAction={() => onOpenForm("visit")} headers={["วันที่", "ลูกค้า", "บริการ", "ผู้ให้บริการ", "บริเวณ/Lot", "ติดตาม"]} rows={systemData.visits.map(row => [dateText(row.visit_date), customerName(row.customer_id), serviceName(row.service_id), employeeName(row.provider_id), text(row.treatment_area || row.product_lot), dateText(row.next_followup_date)])}/>;
    if (active === "บริการและโปรโมชั่น")
        return <CatalogModule role={role} services={systemData.services} packages={systemData.packages} onOpenForm={onOpenForm}/>;
    if (active === "การเงิน")
        return <DataModule title="รายรับและธุรกรรม" subtitle="รับชำระบริการ มัดจำ และผ่อนคอร์ส" action="＋ รับชำระ" onAction={() => onOpenForm("transaction")} headers={["วันที่", "ลูกค้า", "ประเภท", "รายการ", "รับชำระ", "ค้างชำระ", "สถานะ", ...(role === "owner" ? ["จัดการ"] : [])]} rows={systemData.transactions.map(row => { const cells: TableCell[] = [dateText(row.transaction_date), customerName(row.customer_id), text(row.transaction_type, "บริการ"), text(row.description || serviceName(row.service_id)), money(row.paid_amount || row.net_amount), money(row.balance_due), translated(row.payment_status)]; if (role === "owner")
            cells.push(String(row.payment_status) === "Void" ? "ยกเลิกแล้ว" : <OwnerRecordAction action="voidTransaction" id={text(row.transaction_id)} label="ยกเลิกรายการ" confirmText="ยกเลิกรายการรับเงินนี้? ยอดจะไม่ถูกรวมใน Dashboard"/>); return cells; })}/>;
    if (active === "คอร์ส")
        return <DataModule title="แพ็กเกจและเหมาคอร์ส" subtitle="ยอดชำระและสิทธิ์คงเหลือ" action="＋ ขายคอร์ส" onAction={() => onOpenForm("courseSale")} headers={["รหัสคอร์ส", "ลูกค้า", "แพ็กเกจ", "ทั้งหมด", "ใช้แล้ว", "คงเหลือ", "ยอดค้าง", "สถานะ"]} rows={systemData.customer_courses.map(row => [text(row.course_id), customerName(row.customer_id), packageName(row.package_id), text(row.total_sessions, "0"), text(row.sessions_used, "0"), text(row.sessions_remaining, "0"), money(row.balance_due), translated(row.status)])}/>;
    if (active === "ค่าใช้จ่าย")
        return <DataModule title="ค่าใช้จ่ายคลินิก" subtitle={role === "owner" ? "ตรวจและอนุมัติรายการที่พนักงานบันทึก" : "รายการที่บันทึกจะอยู่สถานะรอตรวจ"} action="＋ ลงค่าใช้จ่าย" onAction={() => onOpenForm("expense")} headers={["วันที่", "หมวด", "รายละเอียด", "ผู้ขาย", "จำนวนเงิน", "สถานะ", ...(role === "owner" ? ["อนุมัติ"] : [])]} rows={systemData.expenses.map(row => { const cells: TableCell[] = [dateText(row.expense_date), text(row.category), text(row.description), text(row.vendor), money(row.amount), translated(row.status)]; if (role === "owner")
            cells.push(String(row.status) === "Pending" ? <div className="row-actions"><OwnerRecordAction action="approveExpense" id={text(row.expense_id)} status="Approved" label="อนุมัติ" confirmText="อนุมัติค่าใช้จ่ายนี้?"/><OwnerRecordAction action="approveExpense" id={text(row.expense_id)} status="Rejected" label="ไม่อนุมัติ" confirmText="ไม่อนุมัติค่าใช้จ่ายนี้?"/></div> : translated(row.status)); return cells; })}/>;
    if (active === "พนักงาน")
        return <DataModule title="พนักงานและเวลาเข้างาน" subtitle={`พนักงานปัจจุบัน ${employees.length} คน`} action={role === "owner" ? "＋ เพิ่มพนักงาน" : "＋ ลงเวลา/การลา"} onAction={() => onOpenForm(role === "owner" ? "employee" : "attendance")} headers={["รหัส", "ชื่อ", "ตำแหน่ง", "กะงาน", "เวลาเข้า", "เวลาออก", "สถานะวันนี้"]} rows={employees.map(e => { const a = attendanceByEmployee[e.id] || {}; return [e.id, e.name, e.position, e.shift, text(a.clock_in), text(a.clock_out), translated(a.attendance_status, "ยังไม่ลงเวลา")]; })}/>;
    if (active === "SOP & Checklist")
        return <DataModule title="SOP & Checklist" subtitle="ขั้นตอนปฏิบัติงานที่ใช้งานจริง" action={role === "owner" ? "＋ เพิ่ม SOP" : undefined} onAction={role === "owner" ? () => onOpenForm("sop") : undefined} headers={["หมวด", "ชื่อ SOP", "ลำดับ", "ขั้นตอน", "ผู้รับผิดชอบ", "ระดับ"]} rows={systemData.sop.map(row => [text(row.category), text(row.sop_name), text(row.step_no), text(row.step_detail), text(row.owner_role), row.required === true || String(row.required).toUpperCase() === "TRUE" ? "บังคับ" : "แนะนำ"])}/>;
    if (active === "Stock")
        return <DataModule title="Stock คลินิก" subtitle="ยอดคงเหลือจริงและจุดสั่งซื้อ" action={role === "owner" ? "＋ เพิ่มสินค้า" : "＋ เบิก/รับ Stock"} onAction={() => onOpenForm(role === "owner" ? "inventoryItem" : "stockMovement")} headers={["รหัส", "รายการ", "หมวด", "คงเหลือ", "หน่วย", "ขั้นต่ำ", "สถานะ"]} rows={systemData.inventory.map(row => { const on = Number(row.on_hand || 0), min = Number(row.reorder_level || 0); return [text(row.item_id), text(row.item_name), text(row.category), text(on), text(row.unit), text(min), on <= min ? "ต้องสั่ง" : "ปกติ"]; })}/>;
    return null;
}
function CatalogModule({ role, services, packages, onOpenForm }: {
    role: UserRole;
    services: RawRecord[];
    packages: RawRecord[];
    onOpenForm: (kind: FormKind) => void;
}) { return <section className="data-module"><div className="data-module-head"><div><span className="eyebrow">SERVICE CATALOG</span><h2>บริการและโปรโมชั่น</h2><p>รายการจริงจากภาพประชาสัมพันธ์ในโฟลเดอร์ รายการ</p></div>{role === "owner" && <div className="catalog-actions"><button className="sheet-link" onClick={() => onOpenForm("service")}>＋ บริการ</button><button className="primary" onClick={() => onOpenForm("package")}>＋ โปรโมชั่น</button></div>}</div><h3 className="section-caption">บริการ {services.length} รายการ</h3><DataTable headers={["รหัส", "ชื่อบริการ", "หมวด", "ราคาเริ่มต้น", "ติดตาม", "สถานะ"]} rows={services.map(row => [text(row.service_id), text(row.service_name), text(row.category), `฿ ${money(row.default_price)}`, text(row.followup_day_1, "-"), row.active === false ? "ปิด" : "เปิด"])}/><h3 className="section-caption">โปรโมชั่น/แพ็กเกจ {packages.length} รายการ</h3><DataTable headers={["รหัส", "ชื่อโปรโมชั่น", "ราคา", "ราคาปกติ", "รายการที่รวม", "เงื่อนไข"]} rows={packages.map(row => [text(row.package_id), text(row.package_name), `฿ ${money(row.package_price)}`, row.regular_price ? `฿ ${money(row.regular_price)}` : "-", text(row.components), text(row.terms || row.note)])}/></section>; }
function FollowUpModule({ customers, employees, onUpdateStatus }: {
    customers: Customer[];
    employees: Employee[];
    onUpdateStatus: (customerId: string, status: string, detail?: RawRecord) => Promise<void>;
}) { const [query, setQuery] = useState(""); const [status, setStatus] = useState("ทั้งหมด"); const [sort, setSort] = useState("follow-asc"); const filtered = useMemo(() => customers.filter(c => (status === "ทั้งหมด" || c.status === status) && [c.id, c.name, c.phone, c.service, c.owner].join(" ").toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === "name" ? a.name.localeCompare(b.name, "th") : sort === "last-desc" ? b.last.localeCompare(a.last, "th") : String(a.followRaw || "9999").localeCompare(String(b.followRaw || "9999"))), [customers, query, status, sort]); return <section className="data-module followup-module"><div className="data-module-head"><div><span className="eyebrow">CUSTOMER CARE</span><h2>คิวติดตามลูกค้า</h2><p>ค้นหา กรอง และบันทึกผลลง Google Sheet</p></div></div><div className="status-cards"><button className={status === "ทั้งหมด" ? "selected" : ""} onClick={() => setStatus("ทั้งหมด")}><b>{customers.length}</b><span>ทั้งหมด</span></button>{statuses.slice(0, 7).map(item => <button key={item} className={status === item ? "selected" : ""} onClick={() => setStatus(item)}><b>{customers.filter(c => c.status === item).length}</b><span>{item}</span></button>)}</div><div className="filter-panel"><label className="search-field"><span>ค้นหา</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="ชื่อ เบอร์โทร บริการ ผู้ดูแล"/></label><label><span>สถานะ</span><select value={status} onChange={e => setStatus(e.target.value)}><option>ทั้งหมด</option>{statuses.map(item => <option key={item}>{item}</option>)}</select></label><label><span>เรียงลำดับ</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="follow-asc">กำหนดติดตามใกล้สุด</option><option value="last-desc">เข้าคลินิกล่าสุด</option><option value="name">ชื่อลูกค้า</option></select></label><button className="clear-filter" onClick={() => { setQuery(""); setStatus("ทั้งหมด"); }}>ล้างตัวกรอง</button></div><div className="result-bar"><span>ผลลัพธ์</span><b>{filtered.length} ราย</b></div><div className="data-table-wrap"><table className="data-table"><thead><tr>{["รหัส", "ลูกค้า", "เบอร์โทร", "บริการ", "เข้าล่าสุด", "ติดตาม", "ผู้ดูแล", "สถานะ", "บันทึกกิจกรรม"].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{filtered.map(c => <tr key={c.id}><td>{c.id}</td><td><b>{c.name}</b></td><td>{c.phone}</td><td>{c.service}</td><td>{c.last}</td><td>{c.follow}</td><td>{c.owner}</td><td><span className="status-pill">{c.status}</span></td><td><CustomerStatusAction customer={c} employees={employees} onUpdateStatus={onUpdateStatus}/></td></tr>)}</tbody></table>{filtered.length === 0 && <EmptyState label="ไม่พบลูกค้าตามเงื่อนไข"/>}</div></section>; }
function CustomerStatusAction({ customer, employees, onUpdateStatus }: {
    customer: Customer;
    employees: Employee[];
    onUpdateStatus: (id: string, status: string, detail?: RawRecord) => Promise<void>;
}) {
    const [next, setNext] = useState(customer.status);
    const [nextDate, setNextDate] = useState(customer.followRaw);
    const [result, setResult] = useState("");
    const [note, setNote] = useState("");
    const [staffId, setStaffId] = useState("");
    const [expanded, setExpanded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    async function save(status: string) { setSaving(true); setMessage(""); try {
        if (employees.length > 0 && !staffId)
            throw new Error("กรุณาเลือกพนักงานผู้ติดตาม");
        await onUpdateStatus(customer.id, status, { staff_id: staffId, note: note.trim() || `อัปเดตจากหน้าเว็บเป็น ${status}`, contact_result: result || (status === "สำเร็จ" ? "ติดตามแล้ว" : ""), next_followup_date: status === "สำเร็จ" || status === "งดติดต่อ" ? "" : nextDate, followup_type: "ติดตามลูกค้า" });
        setNext(status);
        setMessage("✓ บันทึกแล้ว");
        setExpanded(false);
    }
    catch (error) {
        setMessage(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ");
    }
    finally {
        setSaving(false);
    } }
    return <div className="status-action"><div className="status-action-main"><select value={next} onChange={e => setNext(e.target.value)} disabled={saving}>{statuses.map(item => <option key={item}>{item}</option>)}</select><button onClick={() => setExpanded(value => !value)} disabled={saving}>รายละเอียด</button><button onClick={() => void save(next)} disabled={saving || next === customer.status}>บันทึก</button>{customer.status !== "สำเร็จ" && <button className="complete-action" onClick={() => void save("สำเร็จ")} disabled={saving}>✓ ติดตามแล้ว</button>}</div>{expanded && <div className="followup-detail"><label>พนักงานผู้ติดตาม<select value={staffId} onChange={e => setStaffId(e.target.value)}><option value="">เลือก...</option>{employees.map(employee => <option key={employee.id} value={employee.id}>{employee.name}</option>)}</select></label><label>ผลการติดต่อ<select value={result} onChange={e => setResult(e.target.value)}><option value="">เลือก...</option><option>ติดต่อได้</option><option>ไม่รับสาย</option><option>ขอเลื่อนนัด</option><option>ปฏิเสธบริการ</option><option>ติดตามแล้ว</option></select></label><label>ติดตามครั้งถัดไป<input type="date" value={nextDate} onChange={e => setNextDate(e.target.value)}/></label><label className="wide-field">รายละเอียด<input value={note} onChange={e => setNote(e.target.value)} placeholder="สรุปสิ่งที่คุยกับลูกค้า"/></label></div>}{message && <small>{message}</small>}</div>;
}
function CustomerEditAction({customer,services}:{customer:Customer;services:RawRecord[]}){
    const[open,setOpen]=useState(false);const[saving,setSaving]=useState(false);const[error,setError]=useState("");
    async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setSaving(true);setError("");const form=new FormData(event.currentTarget);try{await callRaweeApi("updateCustomer",{customer_id:customer.id,full_name:form.get("full_name"),phone:form.get("phone"),service_interest:form.get("service_interest"),updated_at:new Date().toISOString()});window.location.reload();}catch(error){setError(error instanceof Error?error.message:"แก้ไขไม่สำเร็จ");setSaving(false);}}
    return <><button className="row-action" onClick={()=>setOpen(true)}>แก้ไข</button>{open&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}><div className="modal"><button className="modal-close" onClick={()=>setOpen(false)}>×</button><span className="eyebrow">CUSTOMER PROFILE</span><h2>แก้ไขข้อมูลลูกค้า</h2><form onSubmit={submit}><label>ชื่อ–นามสกุล<input name="full_name" defaultValue={customer.name} required/></label><label>เบอร์โทร<input name="phone" defaultValue={customer.phone} required inputMode="tel" pattern="0[0-9 -]{8,14}"/></label><label>บริการที่สนใจ<select name="service_interest" defaultValue={customer.service}><option value="">ยังไม่ระบุ</option>{services.map(service=><option key={text(service.service_id)} value={text(service.service_name)}>{text(service.service_name)}</option>)}</select></label>{error&&<p className="form-error">{error}</p>}<button className="primary form-submit" disabled={saving}>{saving?"กำลังบันทึก...":"บันทึกการแก้ไข"}</button></form></div></div>}</>;
}

function OwnerRecordAction({ action, id, label, status, confirmText }: {
    action: string;
    id: string;
    label: string;
    status?: string;
    confirmText: string;
}) { const [saving, setSaving] = useState(false); async function run() { if (!window.confirm(confirmText))
    return; const reason = action === "voidTransaction" || status === "Cancelled" || status === "Rejected" ? window.prompt("ระบุเหตุผลเพื่อเก็บประวัติ") || "" : ""; if ((action === "voidTransaction" || status === "Cancelled" || status === "Rejected") && !reason)
    return; setSaving(true); try {
    const idField = action === "approveExpense" ? "expense_id" : action === "setAppointmentStatus" ? "appointment_id" : "transaction_id";
    await callRaweeApi(action, { [idField]: id, status, reason, note: reason });
    window.location.reload();
}
catch (error) {
    window.alert(error instanceof Error ? error.message : "ทำรายการไม่สำเร็จ");
    setSaving(false);
} } return <button className="row-action" disabled={saving} onClick={() => void run()}>{saving ? "กำลังบันทึก..." : label}</button>; }
type TableCell = string | number | ReactNode;
function DataTable({ headers, rows }: {
    headers: string[];
    rows: TableCell[][];
}) { return <div className="data-table-wrap"><table className="data-table"><thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}><span className={j === row.length - 1 && typeof cell === "string" ? "status-pill" : ""}>{cell}</span></td>)}</tr>)}</tbody></table>{rows.length === 0 && <EmptyState label="ยังไม่มีข้อมูล — กดเพิ่มรายการเพื่อเริ่มใช้งาน"/>}</div>; }
function DataModule({ title, subtitle, headers, rows, action, onAction }: {
    title: string;
    subtitle: string;
    headers: string[];
    rows: TableCell[][];
    action?: string;
    onAction?: () => void;
}) { const [query, setQuery] = useState(""); const filtered = rows.filter(row => row.map(cell => typeof cell === "string" || typeof cell === "number" ? String(cell) : "").join(" ").toLowerCase().includes(query.toLowerCase())); return <section className="data-module"><div className="data-module-head"><div><span className="eyebrow">ACTIVE MODULE</span><h2>{title}</h2><p>{subtitle}</p></div>{action && onAction && <button className="primary" onClick={onAction}>{action}</button>}</div><div className="module-toolbar"><label><span>ค้นหาในรายการ</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="พิมพ์คำค้นหา..."/></label><div className="module-summary"><b>{filtered.length}</b><span>รายการที่แสดง</span><i>● เปิดใช้งาน</i></div></div><DataTable headers={headers} rows={filtered}/></section>; }
const formTitles: Record<FormKind, string> = { customer: "เพิ่มลูกค้า", appointment: "เพิ่มนัดหมาย", visit: "บันทึกเข้ารับบริการ", transaction: "รับชำระเงิน", service: "เพิ่มบริการ", package: "สร้างโปรโมชั่น/แพ็กเกจ", courseSale: "ขาย/เหมาคอร์ส", courseUse: "ใช้สิทธิ์คอร์ส", expense: "ลงค่าใช้จ่าย", inventoryItem: "เพิ่มสินค้า Stock", stockMovement: "ความเคลื่อนไหว Stock", employee: "เพิ่มพนักงาน", attendance: "ลงเวลา/การลา", sop: "เพิ่ม SOP" };
function ActionCenter({ role, onClose, onChoose }: {
    role: UserRole;
    onClose: () => void;
    onChoose: (kind: FormKind) => void;
}) { const staff: FormKind[] = ["customer", "appointment", "visit", "transaction", "courseSale", "courseUse", "expense", "stockMovement", "attendance"]; const owner: FormKind[] = [...staff, "service", "package", "inventoryItem", "employee", "sop"]; return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget)
    onClose(); }}><div className="modal action-center"><button className="modal-close" onClick={onClose}>×</button><span className="eyebrow">STAFF DATA ENTRY</span><h2>บันทึกข้อมูลเข้าระบบ</h2><p>ข้อมูลจะบันทึกลง Google Sheet โดยตรง</p><div className="action-grid">{(role === "owner" ? owner : staff).map(kind => <button key={kind} onClick={() => onChoose(kind)}><i>＋</i><b>{formTitles[kind]}</b><small>กรอกข้อมูลจริง</small></button>)}</div></div></div>; }
type EntryField = {
    name: string;
    label: string;
    type?: string;
    required?: boolean;
    options?: {
        value: string;
        label: string;
    }[];
    placeholder?: string;
    defaultValue?: string;
};
function OperationalForm({ kind, role, customers, employees, systemData, onClose, onSave }: {
    kind: FormKind;
    role: UserRole;
    customers: Customer[];
    employees: Employee[];
    systemData: SystemData;
    onClose: () => void;
    onSave: (action: string, data: RawRecord) => Promise<void>;
}) { const [saving, setSaving] = useState(false); const [saved, setSaved] = useState(false); const [error, setError] = useState(""); const today = bangkokDay(); const customerOptions = customers.map(c => ({ value: c.id, label: `${c.name} · ${c.phone}` })); const employeeOptions = employees.map(e => ({ value: e.id, label: `${e.name} · ${e.position}` })); const serviceOptions = systemData.services.map(s => ({ value: text(s.service_id), label: text(s.service_name) })); const packageOptions = systemData.packages.map(p => ({ value: text(p.package_id), label: `${text(p.package_name)} · ${money(p.package_price)} บาท` })); const courseOptions = systemData.customer_courses.filter(c => Number(c.sessions_remaining) > 0).map(c => ({ value: text(c.course_id), label: `${text(c.course_id)} · ${customers.find(x => x.id === String(c.customer_id))?.name || c.customer_id} · เหลือ ${c.sessions_remaining}` })); const inventoryOptions = systemData.inventory.map(i => ({ value: text(i.item_id), label: `${text(i.item_name)} · คงเหลือ ${i.on_hand || 0} ${i.unit || ""}` })); const fields: Record<Exclude<FormKind, "customer">, EntryField[]> = { appointment: [{ name: "appointment_date", label: "วันที่นัด", type: "date", required: true, defaultValue: today }, { name: "start_time", label: "เวลา", type: "time", required: true }, { name: "customer_id", label: "ลูกค้า", options: customerOptions, required: true }, { name: "service_id", label: "บริการ", options: serviceOptions, required: true }, { name: "provider_id", label: "ผู้ให้บริการ", options: employeeOptions }, { name: "status", label: "สถานะ", options: [{ value: "Scheduled", label: "นัดหมาย" }, { value: "Confirmed", label: "ยืนยันแล้ว" }, { value: "Completed", label: "เสร็จแล้ว" }, { value: "Cancelled", label: "ยกเลิก" }], required: true }, { name: "note", label: "หมายเหตุ", type: "textarea" }], visit: [{ name: "visit_date", label: "วันที่รับบริการ", type: "date", required: true, defaultValue: today }, { name: "customer_id", label: "ลูกค้า", options: customerOptions, required: true }, { name: "service_id", label: "บริการ", options: serviceOptions, required: true }, { name: "provider_id", label: "ผู้ให้บริการ", options: employeeOptions }, { name: "treatment_area", label: "บริเวณที่ทำ" }, { name: "product_brand", label: "ยี่ห้อผลิตภัณฑ์" }, { name: "product_lot", label: "Lot ผลิตภัณฑ์" }, { name: "quantity", label: "จำนวนผลิตภัณฑ์ที่ใช้", type: "number" }, { name: "inventory_item_id", label: "ตัดจาก Stock (ถ้ามี)", options: inventoryOptions }, { name: "stock_quantity", label: "จำนวนที่ตัด Stock", type: "number" }, { name: "next_followup_date", label: "วันติดตามครั้งถัดไป", type: "date" }, { name: "clinical_note", label: "บันทึกการรักษา", type: "textarea" }], transaction: [{ name: "transaction_date", label: "วันที่รับเงิน", type: "date", required: true, defaultValue: today }, { name: "customer_id", label: "ลูกค้า", options: customerOptions, required: true }, { name: "transaction_type", label: "ประเภทรายรับ", options: [{ value: "service", label: "ค่าบริการ" }, { value: "deposit", label: "มัดจำ" }, { value: "course_payment", label: "ชำระคอร์ส" }, { value: "other", label: "อื่น ๆ" }], required: true }, { name: "description", label: "รายการ", required: true }, { name: "net_amount", label: "ยอดที่ต้องชำระ", type: "number", required: true }, { name: "paid_amount", label: "รับชำระครั้งนี้", type: "number", required: true }, { name: "payment_method", label: "วิธีชำระ", options: [{ value: "cash", label: "เงินสด" }, { value: "transfer", label: "โอน" }, { value: "card", label: "บัตร" }, { value: "other", label: "อื่น ๆ" }], required: true }, { name: "payment_status", label: "สถานะ", options: [{ value: "Paid", label: "ชำระครบ" }, { value: "Partial", label: "ชำระบางส่วน" }, { value: "Deposit", label: "มัดจำ" }], required: true }, { name: "note", label: "หมายเหตุ", type: "textarea" }], service: [{ name: "service_name", label: "ชื่อบริการ", required: true }, { name: "category", label: "หมวด", required: true }, { name: "default_price", label: "ราคาเริ่มต้น", type: "number", required: true }, { name: "duration_min", label: "เวลาประมาณ (นาที)", type: "number" }, { name: "followup_day_1", label: "ติดตามครั้งแรกหลัง (วัน)", type: "number" }, { name: "note", label: "รายละเอียด", type: "textarea" }], package: [{ name: "package_name", label: "ชื่อโปรโมชั่น/แพ็กเกจ", required: true }, { name: "service_id", label: "บริการหลัก", options: serviceOptions }, { name: "total_sessions", label: "จำนวนสิทธิ์รวม", type: "number", required: true }, { name: "package_price", label: "ราคาโปรโมชั่น", type: "number", required: true }, { name: "regular_price", label: "ราคาปกติ", type: "number" }, { name: "validity_days", label: "อายุคอร์ส (วัน)", type: "number", defaultValue: "365" }, { name: "components", label: "รายการที่รวม", type: "textarea", required: true }, { name: "terms", label: "เงื่อนไข", type: "textarea" }], courseSale: [{ name: "purchase_date", label: "วันที่ซื้อคอร์ส", type: "date", required: true, defaultValue: today }, { name: "customer_id", label: "ลูกค้า", options: customerOptions, required: true }, { name: "package_id", label: "แพ็กเกจ", options: packageOptions, required: true }, { name: "total_sessions", label: "จำนวนสิทธิ์", type: "number", required: true }, { name: "total_amount", label: "ราคาเหมาคอร์ส", type: "number", required: true }, { name: "paid_amount", label: "ชำระแล้ว", type: "number", required: true }, { name: "payment_method", label: "วิธีชำระ", options: [{ value: "cash", label: "เงินสด" }, { value: "transfer", label: "โอน" }, { value: "card", label: "บัตร" }], required: true }, { name: "expiry_date", label: "วันหมดอายุ", type: "date" }, { name: "note", label: "หมายเหตุ", type: "textarea" }], courseUse: [{ name: "course_id", label: "คอร์สของลูกค้า", options: courseOptions, required: true }, { name: "usage_date", label: "วันที่ใช้สิทธิ์", type: "date", required: true, defaultValue: today }, { name: "sessions_used", label: "จำนวนสิทธิ์ที่ใช้", type: "number", required: true, defaultValue: "1" }, { name: "provider_id", label: "ผู้ให้บริการ", options: employeeOptions }, { name: "note", label: "หมายเหตุ", type: "textarea" }], expense: [{ name: "expense_date", label: "วันที่จ่าย", type: "date", required: true, defaultValue: today }, { name: "category", label: "หมวดค่าใช้จ่าย", options: [{ value: "เวชภัณฑ์", label: "เวชภัณฑ์" }, { value: "ค่าเช่า/สาธารณูปโภค", label: "ค่าเช่า/สาธารณูปโภค" }, { value: "การตลาด", label: "การตลาด" }, { value: "เงินเดือน", label: "เงินเดือน" }, { value: "อื่น ๆ", label: "อื่น ๆ" }], required: true }, { name: "vendor", label: "ร้านค้า/ผู้รับเงิน" }, { name: "description", label: "รายละเอียด", required: true }, { name: "amount", label: "จำนวนเงิน", type: "number", required: true }, { name: "payment_method", label: "วิธีจ่าย", options: [{ value: "cash", label: "เงินสด" }, { value: "transfer", label: "โอน" }, { value: "card", label: "บัตร" }] }, { name: "note", label: "หมายเหตุ", type: "textarea" }], inventoryItem: [{ name: "item_name", label: "ชื่อสินค้า/เวชภัณฑ์", required: true }, { name: "category", label: "หมวด", required: true }, { name: "unit", label: "หน่วย", required: true }, { name: "on_hand", label: "ยอดเริ่มต้น", type: "number", required: true }, { name: "reorder_level", label: "จุดสั่งซื้อ", type: "number", required: true }, { name: "cost_per_unit", label: "ต้นทุนต่อหน่วย", type: "number" }, { name: "lot_no", label: "Lot" }, { name: "expiry_date", label: "วันหมดอายุ", type: "date" }, { name: "note", label: "หมายเหตุ", type: "textarea" }], stockMovement: [{ name: "movement_date", label: "วันที่", type: "date", required: true, defaultValue: today }, { name: "item_id", label: "สินค้า", options: inventoryOptions, required: true }, { name: "movement_type", label: "ประเภท", options: [{ value: "IN", label: "รับเข้า" }, { value: "USE", label: "เบิกใช้" }, { value: "ADJUST_UP", label: "ปรับเพิ่ม" }, { value: "ADJUST_DOWN", label: "ปรับลด" }], required: true }, { name: "quantity", label: "จำนวน (มากกว่า 0)", type: "number", required: true }, { name: "unit_cost", label: "ต้นทุนต่อหน่วย", type: "number" }, { name: "note", label: "หมายเหตุ/เลขเอกสาร", type: "textarea" }], employee: [{ name: "full_name", label: "ชื่อ–นามสกุล", required: true }, { name: "nickname", label: "ชื่อเล่น" }, { name: "phone", label: "เบอร์โทร" }, { name: "role", label: "สิทธิ์", options: [{ value: "staff", label: "Staff" }, { value: "manager", label: "Manager" }] }, { name: "position", label: "ตำแหน่ง", required: true }, { name: "start_date", label: "วันที่เริ่มงาน", type: "date" }, { name: "shift", label: "กะงาน เช่น 09:00–18:00" }, { name: "note", label: "หมายเหตุ", type: "textarea" }], attendance: [{ name: "work_date", label: "วันที่", type: "date", required: true, defaultValue: today }, { name: "employee_id", label: "พนักงาน", options: employeeOptions, required: true }, { name: "clock_in", label: "เวลาเข้า", type: "time" }, { name: "clock_out", label: "เวลาออก", type: "time" }, { name: "attendance_status", label: "สถานะ", options: [{ value: "Present", label: "มาทำงาน" }, { value: "Late", label: "สาย" }, { value: "Leave", label: "ลา" }, { value: "Absent", label: "ขาด" }], required: true }, { name: "leave_type", label: "ประเภทการลา" }, { name: "note", label: "หมายเหตุ", type: "textarea" }], sop: [{ name: "sop_name", label: "ชื่อ SOP", required: true }, { name: "category", label: "หมวด", required: true }, { name: "step_no", label: "ลำดับ", type: "number", required: true }, { name: "step_detail", label: "ขั้นตอน", type: "textarea", required: true }, { name: "owner_role", label: "ผู้รับผิดชอบ", required: true }, { name: "required", label: "ระดับ", options: [{ value: "TRUE", label: "บังคับ" }, { value: "FALSE", label: "แนะนำ" }], required: true }, { name: "version", label: "เวอร์ชัน", defaultValue: "1.0" }] }; const numeric = new Set(["quantity", "net_amount", "paid_amount", "default_price", "duration_min", "followup_day_1", "total_sessions", "total_amount", "package_price", "regular_price", "validity_days", "sessions_used", "amount", "on_hand", "reorder_level", "cost_per_unit", "unit_cost", "stock_quantity", "step_no"]); const actions: Record<Exclude<FormKind, "customer">, string> = { appointment: "addAppointment", visit: "addVisit", transaction: "addTransaction", service: "addService", package: "addPackage", courseSale: "sellCourse", courseUse: "useCourse", expense: "addExpense", inventoryItem: "addInventoryItem", stockMovement: "addStockMovement", employee: "addEmployee", attendance: "clockIn", sop: "addSOP" }; function change(event: React.ChangeEvent<HTMLFormElement>) { const target = event.target as unknown as HTMLSelectElement; if (target.name === "package_id") {
    const p = systemData.packages.find(row => String(row.package_id) === target.value);
    if (p) {
        const form = event.currentTarget;
        const sessions = form.elements.namedItem("total_sessions") as HTMLInputElement | null;
        const amount = form.elements.namedItem("total_amount") as HTMLInputElement | null;
        if (sessions)
            sessions.value = String(p.total_sessions || 1);
        if (amount)
            amount.value = String(p.package_price || 0);
    }
} } async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setSaving(true); setError(""); const data: RawRecord = {}; for (const [key, value] of new FormData(event.currentTarget).entries())
    data[key] = numeric.has(key) ? Number(value) : value; data.created_at = new Date().toISOString(); if (role === "owner") data.staff_id = "owner"; else if (!data.staff_id) { setError("กรุณาเลือกชื่อพนักงานผู้ทำรายการ"); setSaving(false); return; } data.created_by = data.staff_id; if (kind === "service" || kind === "package" || kind === "inventoryItem") {
    data.active = true;
} if (kind === "employee") {
    data.active = true;
    data.work_status = "Active";
} if (kind === "expense")
    data.status = "Pending"; if (kind === "transaction")
    data.balance_due = Math.max(0, Number(data.net_amount) - Number(data.paid_amount)); if (kind === "courseSale") {
    data.sessions_used = 0;
    data.sessions_remaining = Number(data.total_sessions);
    data.balance_due = Math.max(0, Number(data.total_amount) - Number(data.paid_amount));
    data.sales_staff_id = data.staff_id;
} if (kind === "courseUse") {
    const course = systemData.customer_courses.find(row => String(row.course_id) === String(data.course_id));
    data.customer_id = course?.customer_id || "";
    data.service_id = course?.package_id || "";
} try {
    await onSave(actions[kind as Exclude<FormKind, "customer">], data);
    setSaved(true);
}
catch (error) {
    setError(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ");
}
finally {
    setSaving(false);
} } if (saved)
    return <div className="modal-backdrop"><div className="modal"><button className="modal-close" onClick={onClose}>×</button><div className="success"><div>✓</div><h2>บันทึกลง Google Sheet แล้ว</h2><p>{formTitles[kind]}เรียบร้อย</p><button className="primary" onClick={onClose}>ปิด</button></div></div></div>; return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget)
    onClose(); }}><div className="modal operational-modal"><button className="modal-close" onClick={onClose}>×</button><span className="eyebrow">GOOGLE SHEET ENTRY</span><h2>{formTitles[kind]}</h2><p>กรอกข้อมูลจริง ระบบจะบันทึกลงแท็บที่เกี่ยวข้อง</p><form onSubmit={submit} onChange={change}>{role === "staff" && <label className="operator-field">พนักงานผู้ทำรายการ<select name="staff_id" required defaultValue=""><option value="" disabled>เลือกชื่อพนักงาน...</option>{employeeOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>}<div className="entry-grid">{fields[kind as Exclude<FormKind, "customer">].map(field => <label key={field.name} className={field.type === "textarea" ? "wide-field" : ""}>{field.label}{field.type === "textarea" ? <textarea name={field.name} required={field.required}/> : field.options ? <select name={field.name} required={field.required} defaultValue=""><option value="" disabled>เลือก...</option>{field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input name={field.name} type={field.type || "text"} required={field.required} defaultValue={field.defaultValue} min={field.type === "number" ? "0" : undefined} step={field.type === "number" ? "any" : undefined}/>}</label>)}</div>{error && <p className="form-error">{error}</p>}<button className="primary form-submit" disabled={saving}>{saving ? "กำลังบันทึก..." : "บันทึกลง Google Sheet"}</button></form></div></div>; }
async function callRaweeApi(action: string, data: RawRecord = {}) { const response = await fetch("/api/rawee", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, data }) }); const result = await response.json().catch(() => ({ ok: false, error: "ระบบตอบกลับไม่ถูกต้อง" })); if (!response.ok || !result.ok)
    throw new Error(result.error === "FORBIDDEN" ? "บัญชีนี้ไม่มีสิทธิ์ทำรายการนี้" : result.error === "AUTH_REQUIRED" ? "กรุณาเข้าสู่ระบบใหม่" : result.error || "เชื่อม Google Sheet ไม่สำเร็จ"); return result; }
function SettingsPage() {
    const [enabled, setEnabled] = useState<Record<string, boolean>>(Object.fromEntries(systemModules.map(name => [name, true])));
    const [saving, setSaving] = useState("");
    useEffect(() => { if (LOCAL_PREVIEW) return; void callRaweeApi("getSystemData").then(result => { const next = Object.fromEntries(systemModules.map(name => [name, true])); for (const row of result.settings || []) {
        const name = String(row.setting_id || "").replace(/^module:/, "");
        if (name in next)
            next[name] = String(row.setting_value).toUpperCase() !== "FALSE";
    } setEnabled(next); }); }, []);
    async function toggle(name: string) { setSaving(name); const value = !enabled[name]; try {
        await callRaweeApi("setModuleEnabled", { module: name, enabled: value });
        setEnabled(current => ({ ...current, [name]: value }));
    }
    catch (error) {
        window.alert(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ");
    }
    finally {
        setSaving("");
    } }
    async function repairPhones() { if (!window.confirm("ซ่อมรูปแบบเบอร์โทรใน Google Sheet และเติมเลข 0 ให้ข้อมูล 9 หลัก?"))
        return; const result = await callRaweeApi("repairPhoneFormatting"); window.alert(`ซ่อมเบอร์โทรแล้ว ${result.repaired || 0} รายการ`); window.location.reload(); }
    return <div className="settings-page"><div className="settings-title"><div className="module-icon">⚙</div><div><span className="eyebrow">SYSTEM SETTINGS</span><h2>ตั้งค่าระบบ</h2><p>การเชื่อมต่อและโมดูลที่พร้อมใช้งาน</p></div></div><div className="connection-card"><div className="connection-head"><div><h3>Google Sheet Connection</h3><p>ฐานข้อมูล Rawee data · เชื่อมผ่านระบบหลังบ้าน</p></div><span className="status-connected">● พร้อมใช้งาน</span></div><div className="secure-connection"><b>✓ ข้อมูลลับเก็บไว้ใน Netlify Environment</b><span>Staff มองไม่เห็นหน้าเชื่อมต่อและไม่มีสิทธิ์แก้การตั้งค่า</span></div><div className="settings-actions"><a className="sheet-link" href={RAW_DATA_SHEET_URL} target="_blank" rel="noreferrer">▦ เปิด Google Sheet (Raw Data)</a><button className="sheet-link" onClick={() => void repairPhones()}>ซ่อมรูปแบบเบอร์โทร</button></div></div><div className="module-toggles"><h3>เปิด–ปิดโมดูลระบบ</h3>{systemModules.map(name => <div key={name}><span>{name}</span><button className={`toggle ${enabled[name] ? "on" : ""}`} disabled={saving === name} onClick={() => void toggle(name)} aria-label={`${enabled[name] ? "ปิด" : "เปิด"} ${name}`}><i /></button></div>)}</div></div>;
}
function AddCustomer({ services, onClose, onSaved }: {
    services: RawRecord[];
    onClose: () => void;
    onSaved: () => Promise<void>;
}) {
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setSaving(true); setError(""); const form = new FormData(event.currentTarget); try {
        await callRaweeApi("addCustomer", { full_name: form.get("full_name"), nickname: form.get("nickname"), phone: form.get("phone"), line_id: form.get("line_id"), birth_date: form.get("birth_date"), source: form.get("source") || "หน้าร้าน", service_interest: form.get("service_interest"), consent_contact: form.get("consent_contact") === "on", allergy_note: form.get("allergy_note"), medical_note: form.get("medical_note"), status: "ลูกค้าใหม่" });
        setSaved(true);
        await onSaved();
    }
    catch (error) {
        setError(error instanceof Error && error.message === "DUPLICATE_PHONE" ? "มีเบอร์โทรนี้อยู่ในระบบแล้ว" : error instanceof Error ? error.message : "บันทึกไม่สำเร็จ");
    }
    finally {
        setSaving(false);
    } }
    return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget)
        onClose(); }}><div className="modal customer-modal"><button className="modal-close" onClick={onClose}>×</button>{saved ? <div className="success"><div>✓</div><h2>บันทึกลูกค้าแล้ว</h2><p>ข้อมูลอยู่ใน Google Sheet และ Dashboard</p><button className="primary" onClick={onClose}>ปิด</button></div> : <><span className="eyebrow">NEW CUSTOMER</span><h2>เพิ่มลูกค้าใหม่</h2><p>ข้อมูลสุขภาพใช้ประกอบการคัดกรองก่อนรับบริการ</p><form onSubmit={submit}><label>ชื่อ–นามสกุล<input name="full_name" required/></label><div className="form-grid"><label>ชื่อเล่น<input name="nickname"/></label><label>เบอร์โทร<input name="phone" required inputMode="tel" pattern="0[0-9 -]{8,14}" placeholder="0xxxxxxxxx"/></label><label>LINE ID<input name="line_id"/></label><label>วันเกิด<input name="birth_date" type="date"/></label></div><label>รู้จักคลินิกจาก<select name="source" defaultValue="หน้าร้าน"><option>หน้าร้าน</option><option>Facebook</option><option>Instagram</option><option>เพื่อนแนะนำ</option><option>อื่น ๆ</option></select></label><label>บริการที่สนใจ<select name="service_interest" defaultValue=""><option value="">ยังไม่ระบุ</option>{services.map(service => <option key={text(service.service_id)} value={text(service.service_name)}>{text(service.service_name)}</option>)}</select></label><label>ประวัติแพ้ยา/ผลิตภัณฑ์<textarea name="allergy_note" placeholder="ถ้าไม่มีให้ระบุ ไม่มี" required/></label><label>โรคประจำตัว/ข้อมูลทางการแพทย์<textarea name="medical_note" placeholder="ถ้าไม่มีให้ระบุ ไม่มี" required/></label><label className="consent"><input name="consent_contact" type="checkbox" required/> ลูกค้ายินยอมให้ติดต่อเพื่อนัดหมายและติดตามผล</label>{error && <p className="form-error">{error}</p>}<button className="primary form-submit" disabled={saving}>{saving ? "กำลังบันทึก..." : "บันทึกลูกค้า"}</button></form></>}</div></div>;
}
