# เชื่อม Google Sheet กับ Customer Follow Up

ทำครั้งเดียวด้วยบัญชี `rawee.aesthetics3@gmail.com`

1. เปิด Google Sheet `Rawee data`
2. เลือก **Extensions → Apps Script**
3. ลบโค้ดเดิม แล้วคัดลอกทั้งหมดจาก `google_apps_script.js`
4. เปลี่ยน `RAWEE-CHANGE-THIS-KEY` เป็นรหัสที่เดายากอย่างน้อย 20 ตัว
5. กด **Deploy → New deployment → Web app**
6. Execute as: **Me** และ Who has access: **Anyone**
7. กด Deploy และอนุญาตสิทธิ์
8. คัดลอก URL ที่ลงท้าย `/exec`
9. เปิดหน้า **ตั้งค่า** ในเว็บ แล้ววาง URL และ API Key

ห้ามส่ง Password หรือ OTP ให้บุคคลอื่น
