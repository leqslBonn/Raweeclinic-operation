"use client";

import { useMemo, useState } from "react";

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
  const [active, setActive] = useState("ภาพรวม");
  const [showAdd, setShowAdd] = useState(false);
  const [done, setDone] = useState<string[]>([]);
  const today = useMemo(() => new Intl.DateTimeFormat("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date()), []);

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
        <div className="user"><div className="avatar">ร</div><div><b>คุณรวี</b><small>เจ้าของคลินิก</small></div><span>⋮</span></div>
      </aside>

      <section className="workspace">
        <header>
          <div><h1>{active}</h1><p>{today} · สาขาคลองสาม</p></div>
          <div className="header-actions"><button className="icon-btn" aria-label="แจ้งเตือน">♢<i>3</i></button><button className="primary" onClick={() => setShowAdd(true)}>＋ เพิ่มลูกค้าใหม่</button></div>
        </header>

        {active === "ภาพรวม" ? <Dashboard done={done} setDone={setDone} /> : <ModulePlaceholder active={active} onAdd={() => setShowAdd(true)} />}
      </section>

      {showAdd && <AddCustomer onClose={() => setShowAdd(false)} />}
    </main>
  );
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

function AddCustomer({onClose}:{onClose:()=>void}) {
  const [saved,setSaved]=useState(false);
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="modal"><button className="modal-close" onClick={onClose}>×</button>{saved ? <div className="success"><div>✓</div><h2>บันทึกลูกค้าแล้ว</h2><p>ข้อมูลทดลองถูกเพิ่มเรียบร้อย</p><button className="primary" onClick={onClose}>กลับหน้าหลัก</button></div> : <><span className="eyebrow">NEW CUSTOMER</span><h2>เพิ่มลูกค้าใหม่</h2><p>กรอกข้อมูลพื้นฐานก่อน สามารถเพิ่มประวัติบริการภายหลังได้</p><form onSubmit={e=>{e.preventDefault();setSaved(true)}}><label>ชื่อ–นามสกุล<input required placeholder="เช่น สมหญิง ใจดี"/></label><div className="form-grid"><label>ชื่อเล่น<input placeholder="ชื่อเล่น"/></label><label>เบอร์โทร<input required inputMode="tel" placeholder="08x-xxx-xxxx"/></label></div><label>บริการที่สนใจ<select defaultValue=""><option value="" disabled>เลือกบริการ</option><option>Botox</option><option>Filler</option><option>เส้นเลือดขอด</option><option>ทรีตเมนต์ผิว</option></select></label><label>หมายเหตุ<textarea placeholder="ข้อมูลที่ควรทราบ..."/></label><button className="primary form-submit">บันทึกลูกค้า</button></form></>}</div></div>;
}
