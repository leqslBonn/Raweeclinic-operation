/** Rawee Customer Follow Up - Google Apps Script API */
const SPREADSHEET_ID = '1wA-u9CkCVDQ88LIl1P9cNMFaNBF6c6A2DuQsYV9adR8';
const API_KEY = 'RAWEE-CHANGE-THIS-KEY';

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || 'health');
  return action === 'health'
    ? json_({ ok: true, service: 'Rawee Customer Follow Up', timestamp: new Date().toISOString() })
    : json_({ ok: false, error: 'Unsupported action' });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.apiKey !== API_KEY) return json_({ ok: false, error: 'Unauthorized' });
    const data = body.data || {};
    switch (body.action) {
      case 'inspectWorkbook': return inspectWorkbook_();
      case 'initializeOperationalWorkbook': return initializeOperationalWorkbook_();
      case 'cleanupLegacyMockData': return cleanupLegacyMockData_();
      case 'cleanupTestData': return cleanupTestData_();
      case 'replaceCatalog': return replaceCatalog_(data);
      case 'getSystemData': return getSystemData_();
      case 'addCustomer': return addCustomer_(data);
      case 'updateCustomer': return updateRecord_('Customers', 'customer_id', data);
      case 'recordCustomerActivity': return recordCustomerActivity_(data);
      case 'addAppointment': return appendRecord_('Appointments', data, 'APT');
      case 'addFollowUp': return appendRecord_('FollowUps', data, 'FUP');
      case 'addEmployee': return upsertRecord_('Employees', 'employee_id', data, 'EMP');
      case 'addTransaction': return addTransaction_(data);
      case 'addVisit': return addVisit_(data);
      case 'addExpense': return appendRecord_('Expenses', data, 'EXP');
      case 'addService': return upsertRecord_('Services', 'service_id', data, 'SRV');
      case 'addPackage': return upsertRecord_('Packages', 'package_id', data, 'PKG');
      case 'sellCourse': return sellCourse_(data);
      case 'useCourse': return useCourse_(data);
      case 'addInventoryItem': return upsertRecord_('Inventory', 'item_id', data, 'ITM');
      case 'addStockMovement': return addStockMovement_(data);
      case 'addSOP': return upsertRecord_('SOP', 'sop_id', data, 'SOP');
      case 'clockIn': return upsertAttendance_(data);
      default: return json_({ ok: false, error: 'Unsupported action' });
    }
  } catch (error) {
    return json_({ ok: false, error: String(error && error.message || error) });
  } finally { try { lock.releaseLock(); } catch (_) {} }
}

function initializeOperationalWorkbook_() {
  const schemas = {
    Customers: ['customer_id','created_at','full_name','nickname','phone','line_id','birth_date','gender','source','consent_contact','allergy_note','medical_note','service_interest','last_visit','last_visit_date','next_followup_date','lifetime_value','status','last_activity_at','last_activity_note','updated_at'],
    Services: ['service_id','service_name','category','default_price','followup_day_1','followup_day_2','followup_day_3','duration_min','active','note','source_image','updated_at'],
    FollowUps: ['followup_id','customer_id','visit_id','due_date','due_time','followup_type','priority','assigned_to','status','contact_result','note','completed_at','completed_by','created_at'],
    Appointments: ['appointment_id','appointment_date','start_time','end_time','customer_id','service_id','provider_id','room','status','confirmation_status','note','created_at','created_by'],
    Visits: ['visit_id','visit_date','customer_id','appointment_id','service_id','provider_id','treatment_area','product_brand','product_lot','quantity','clinical_note','photo_folder_url','consent_recorded','next_followup_date','created_at','created_by'],
    Transactions: ['transaction_id','transaction_date','customer_id','appointment_id','visit_id','service_id','package_id','course_id','transaction_type','description','quantity','unit_price','discount','net_amount','paid_amount','balance_due','payment_method','payment_status','staff_id','note','created_at'],
    Employees: ['employee_id','full_name','nickname','email','phone','role','position','start_date','work_status','pin_enabled','active','note'],
    Attendance: ['attendance_id','work_date','employee_id','clock_in','clock_out','break_minutes','work_hours','attendance_status','late_minutes','leave_type','approval_status','approved_by','note'],
    SOP: ['sop_id','sop_name','category','step_no','step_detail','owner_role','required','evidence_required','version','active','updated_at','updated_by'],
    Packages: ['package_id','package_name','service_id','total_sessions','package_price','regular_price','validity_days','active','components','terms','note','source_image','created_at','created_by'],
    CustomerCourses: ['course_id','customer_id','package_id','purchase_date','total_sessions','sessions_used','sessions_remaining','total_amount','paid_amount','balance_due','expiry_date','status','sales_staff_id','note','created_at'],
    CourseUsage: ['usage_id','course_id','customer_id','visit_id','usage_date','service_id','sessions_used','provider_id','note','created_at','created_by'],
    Expenses: ['expense_id','expense_date','category','vendor','description','amount','payment_method','receipt_url','status','staff_id','approved_by','note','created_at'],
    Inventory: ['item_id','item_name','category','unit','on_hand','reorder_level','cost_per_unit','lot_no','expiry_date','active','note','updated_at'],
    StockMovements: ['movement_id','movement_date','item_id','movement_type','quantity','unit_cost','reference_type','reference_id','staff_id','note','created_at']
  };
  Object.keys(schemas).forEach(name => ensureSheet_(name, schemas[name]));
  const formSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Form Responses 1');
  if (formSheet && formSheet.getLastRow() <= 1) formSheet.hideSheet();
  return json_({ ok: true, sheets: Object.keys(schemas) });
}

function getSystemData_() {
  const names = ['Customers','Employees','Appointments','FollowUps','Transactions','Attendance','Services','Visits','Packages','CustomerCourses','CourseUsage','Expenses','Inventory','StockMovements','SOP'];
  const keys = ['customers','employees','appointments','followups','transactions','attendance','services','visits','packages','customer_courses','course_usage','expenses','inventory','stock_movements','sop'];
  const result = { ok: true, timestamp: new Date().toISOString() };
  names.forEach((name, index) => { result[keys[index]] = records_(name); });
  return json_(result);
}

function addCustomer_(data) {
  const phone = cleanPhone_(data.phone);
  if (!String(data.full_name || '').trim() || phone.length < 9) return json_({ ok: false, error: 'Name and valid phone are required' });
  const existing = records_('Customers');
  if (existing.some(row => cleanPhone_(row.phone) === phone)) return json_({ ok: false, error: 'DUPLICATE_PHONE' });
  data.customer_id = data.customer_id || makeId_('CUS');
  data.created_at = data.created_at || new Date();
  data.phone = phone;
  data.status = data.status || 'ลูกค้าใหม่';
  data.consent_contact = Boolean(data.consent_contact);
  appendByHeaders_(sheet_('Customers'), data);
  return json_({ ok: true, customer_id: data.customer_id });
}

function addVisit_(data) {
  if (!data.customer_id || !data.service_id || !data.visit_date) return json_({ ok: false, error: 'Customer, service and visit date are required' });
  const result = appendRecord_('Visits', data, 'VIS', true);
  const updates = { customer_id: data.customer_id, last_visit: data.service_id, last_visit_date: data.visit_date, status: data.next_followup_date ? 'รอติดตาม' : 'Active', updated_at: new Date() };
  updateRecord_('Customers', 'customer_id', updates, true);
  if (data.next_followup_date) appendRecord_('FollowUps', { customer_id: data.customer_id, visit_id: result.id, due_date: data.next_followup_date, followup_type: 'หลังรับบริการ', priority: 'ปกติ', status: 'รอติดตาม', note: data.clinical_note || '', created_at: new Date() }, 'FUP', true);
  return json_({ ok: true, id: result.id });
}

function addTransaction_(data) {
  const total = Number(data.net_amount || 0), paid = Number(data.paid_amount || 0);
  if (!data.customer_id || !data.transaction_date || total < 0 || paid < 0 || paid > total) return json_({ ok: false, error: 'Invalid customer or payment amount' });
  if (!records_('Customers').some(row => String(row.customer_id) === String(data.customer_id))) return json_({ ok: false, error: 'Customer not found' });
  data.balance_due = Math.max(0, total - paid);
  return appendRecord_('Transactions', data, 'TXN');
}

function recordCustomerActivity_(data) {
  if (!data.customer_id || !data.status) return json_({ ok: false, error: 'Customer and status are required' });
  const now = new Date();
  updateRecord_('Customers', 'customer_id', { customer_id: data.customer_id, status: data.status, next_followup_date: data.next_followup_date || '', last_activity_at: now, last_activity_note: data.note || ('เปลี่ยนสถานะเป็น ' + data.status), updated_at: now }, true);
  appendRecord_('FollowUps', { customer_id: data.customer_id, due_date: data.next_followup_date || '', followup_type: data.followup_type || 'ติดตามลูกค้า', priority: data.priority || '', assigned_to: data.performed_by || '', status: data.status, contact_result: data.contact_result || '', note: data.note || '', completed_at: data.status === 'สำเร็จ' ? now : '', completed_by: data.performed_by || '', created_at: now }, 'FUP', true);
  return json_({ ok: true, customer_id: data.customer_id, status: data.status });
}

function sellCourse_(data) {
  if (!data.customer_id || !data.package_id || Number(data.total_sessions) <= 0) return json_({ ok: false, error: 'Customer, package and sessions are required' });
  const customer = records_('Customers').find(row => String(row.customer_id) === String(data.customer_id));
  const packageRow = records_('Packages').find(row => String(row.package_id) === String(data.package_id) && row.active !== false);
  if (!customer || !packageRow) return json_({ ok: false, error: 'Customer or package not found' });
  data.total_sessions = Number(packageRow.total_sessions || data.total_sessions);
  if (Number(data.total_amount) < 0 || Number(data.paid_amount) < 0 || Number(data.paid_amount) > Number(data.total_amount)) return json_({ ok: false, error: 'Invalid course payment amount' });
  data.course_id = data.course_id || makeId_('CRS');
  data.purchase_date = data.purchase_date || new Date();
  data.sessions_used = Number(data.sessions_used || 0);
  data.sessions_remaining = Number(data.total_sessions) - data.sessions_used;
  data.total_amount = Number(data.total_amount || 0); data.paid_amount = Number(data.paid_amount || 0);
  data.balance_due = Math.max(0, data.total_amount - data.paid_amount);
  data.status = data.status || (data.balance_due === 0 ? 'Active-Paid' : 'Active-Partial'); data.created_at = new Date();
  appendByHeaders_(sheet_('CustomerCourses'), data);
  if (data.paid_amount > 0) appendRecord_('Transactions', { transaction_date: data.purchase_date, customer_id: data.customer_id, package_id: data.package_id, course_id: data.course_id, transaction_type: 'course_purchase', description: 'ซื้อคอร์ส ' + data.package_id, quantity: 1, net_amount: data.total_amount, paid_amount: data.paid_amount, balance_due: data.balance_due, payment_method: data.payment_method || '', payment_status: data.balance_due === 0 ? 'Paid' : 'Partial', staff_id: data.sales_staff_id || '', note: data.note || '', created_at: new Date() }, 'TXN', true);
  return json_({ ok: true, course_id: data.course_id, balance_due: data.balance_due });
}

function useCourse_(data) {
  if (!data.course_id) return json_({ ok: false, error: 'Course is required' });
  const rows = records_('CustomerCourses'); const course = rows.find(row => String(row.course_id) === String(data.course_id));
  if (!course) return json_({ ok: false, error: 'Course not found' });
  const count = Math.max(1, Number(data.sessions_used || 1)); const remaining = Number(course.sessions_remaining || 0);
  if (remaining < count) return json_({ ok: false, error: 'Not enough course sessions' });
  updateRecord_('CustomerCourses', 'course_id', { course_id: data.course_id, sessions_used: Number(course.sessions_used || 0) + count, sessions_remaining: remaining - count, status: remaining - count === 0 ? 'Completed' : course.status }, true);
  data.usage_id = data.usage_id || makeId_('USE'); data.customer_id = data.customer_id || course.customer_id; data.sessions_used = count; data.created_at = new Date();
  appendByHeaders_(sheet_('CourseUsage'), data);
  return json_({ ok: true, usage_id: data.usage_id, sessions_remaining: remaining - count });
}

function addStockMovement_(data) {
  if (!data.item_id || !data.movement_type || Number(data.quantity) <= 0) return json_({ ok: false, error: 'Item, type and positive quantity are required' });
  const item = records_('Inventory').find(row => String(row.item_id) === String(data.item_id));
  if (!item) return json_({ ok: false, error: 'Inventory item not found' });
  const quantity = Math.abs(Number(data.quantity)); const outgoing = ['OUT','USE','ADJUST_DOWN'].indexOf(String(data.movement_type).toUpperCase()) >= 0;
  const onHand = Number(item.on_hand || 0) + (outgoing ? -quantity : quantity);
  if (onHand < 0) return json_({ ok: false, error: 'Insufficient stock' });
  updateRecord_('Inventory', 'item_id', { item_id: data.item_id, on_hand: onHand, updated_at: new Date() }, true);
  data.movement_id = data.movement_id || makeId_('MOV'); data.quantity = quantity; data.created_at = new Date(); appendByHeaders_(sheet_('StockMovements'), data);
  return json_({ ok: true, movement_id: data.movement_id, on_hand: onHand });
}

function upsertAttendance_(data) {
  if (!data.employee_id || !data.work_date) return json_({ ok: false, error: 'Employee and work date are required' });
  const existing = records_('Attendance').find(row => String(row.employee_id) === String(data.employee_id) && String(row.work_date).slice(0,10) === String(data.work_date).slice(0,10));
  if (existing) { data.attendance_id = existing.attendance_id; return updateRecord_('Attendance', 'attendance_id', data); }
  return appendRecord_('Attendance', data, 'ATT');
}

function replaceCatalog_(data) {
  if (!Array.isArray(data.services) || !Array.isArray(data.packages)) return json_({ ok: false, error: 'Services and packages are required' });
  clearRows_('Services'); clearRows_('Packages');
  data.services.forEach(row => appendByHeaders_(sheet_('Services'), row));
  data.packages.forEach(row => appendByHeaders_(sheet_('Packages'), row));
  return json_({ ok: true, services: data.services.length, packages: data.packages.length });
}

function cleanupLegacyMockData_() {
  const removed = {};
  removed.customers = deleteRowsWhere_('Customers', row => /^C\d{3}$/.test(String(row.customer_id || '')) || String(row.source || '') === 'Mock Data Import');
  removed.employees = deleteRowsWhere_('Employees', row => /^E\d{3}$/.test(String(row.employee_id || '')) || String(row.work_status || '') === 'Archived');
  ['Appointments','FollowUps','Transactions','Attendance','Visits','CustomerCourses','CourseUsage','Expenses','Inventory','StockMovements'].forEach(name => { removed[name] = deleteRowsWhere_(name, row => /^C\d{3}$/.test(String(row.customer_id || '')) || /^(TX|ST|APT|FUP|VIS|ATT)\d{3}$/.test(String(row.transaction_id || row.item_id || row.appointment_id || row.followup_id || row.visit_id || row.attendance_id || ''))); });
  return json_({ ok: true, removed: removed });
}

function cleanupTestData_() {
  const idFields = { Customers:'customer_id', Employees:'employee_id', Appointments:'appointment_id', FollowUps:'followup_id', Transactions:'transaction_id', Attendance:'attendance_id', Visits:'visit_id', Services:'service_id', Packages:'package_id', CustomerCourses:'course_id', CourseUsage:'usage_id', Expenses:'expense_id', Inventory:'item_id', StockMovements:'movement_id', SOP:'sop_id' };
  const removed = {};
  Object.keys(idFields).forEach(name => { const field=idFields[name]; removed[name]=deleteRowsWhere_(name,row=>String(row[field]||'').indexOf('QA-')===0 || String(row.note||'').indexOf('[QA]')>=0); });
  return json_({ ok:true, removed:removed });
}

function appendRecord_(sheetName, data, prefix, raw) {
  const idKey = { Appointments:'appointment_id', FollowUps:'followup_id', Transactions:'transaction_id', Attendance:'attendance_id', Visits:'visit_id', Expenses:'expense_id' }[sheetName];
  if (idKey && !data[idKey]) data[idKey] = makeId_(prefix); appendByHeaders_(sheet_(sheetName), data);
  const result = { ok: true, id: idKey ? data[idKey] : null }; return raw ? result : json_(result);
}

function upsertRecord_(sheetName, idKey, data, prefix) { if (!data[idKey]) data[idKey] = makeId_(prefix); const exists = records_(sheetName).some(row => String(row[idKey]) === String(data[idKey])); return exists ? updateRecord_(sheetName, idKey, data) : (appendByHeaders_(sheet_(sheetName), data), json_({ ok: true, id: data[idKey] })); }
function updateRecord_(sheetName, idKey, data, raw) { const sheet=sheet_(sheetName), values=sheet.getDataRange().getValues(), headers=(values[0]||[]).map(String), idIndex=headers.indexOf(idKey), row=values.slice(1).findIndex(item=>String(item[idIndex])===String(data[idKey])); if(idIndex<0||row<0){const result={ok:false,error:'Record not found'};return raw?result:json_(result);} headers.forEach((header,col)=>{if(Object.prototype.hasOwnProperty.call(data,header))sheet.getRange(row+2,col+1).setValue(data[header]);});const result={ok:true,id:data[idKey]};return raw?result:json_(result); }
function records_(name) { const values=sheet_(name).getDataRange().getValues(); if(values.length<2)return[]; const headers=values[0].map(String); return values.slice(1).filter(row=>row.some(value=>value!=='')).map(row=>{const record={};headers.forEach((header,index)=>{const value=row[index];record[header]=value instanceof Date?value.toISOString():value;});return record;}); }
function ensureSheet_(name, headers) { const book=SpreadsheetApp.openById(SPREADSHEET_ID);let sheet=book.getSheetByName(name);if(!sheet)sheet=book.insertSheet(name);const last=sheet.getLastColumn(),existing=last?sheet.getRange(1,1,1,last).getDisplayValues()[0].map(String):[],missing=headers.filter(header=>existing.indexOf(header)<0);if(!existing.some(Boolean))sheet.getRange(1,1,1,headers.length).setValues([headers]);else if(missing.length)sheet.getRange(1,last+1,1,missing.length).setValues([missing]);sheet.setFrozenRows(1);return sheet; }
function appendByHeaders_(sheet, data) { const headers=sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];sheet.appendRow(headers.map(key=>Object.prototype.hasOwnProperty.call(data,key)?data[key]:'')); }
function deleteRowsWhere_(name, predicate) { const sheet=sheet_(name),records=records_(name);let removed=0;for(let index=records.length-1;index>=0;index--){if(predicate(records[index])){sheet.deleteRow(index+2);removed++;}}return removed; }
function clearRows_(name) { const sheet=sheet_(name);if(sheet.getLastRow()>1)sheet.getRange(2,1,sheet.getLastRow()-1,sheet.getLastColumn()).clearContent(); }
function inspectWorkbook_() { const book=SpreadsheetApp.openById(SPREADSHEET_ID);return json_({ok:true,spreadsheet_name:book.getName(),sheets:book.getSheets().map(sheet=>({name:sheet.getName(),hidden:sheet.isSheetHidden(),rows:Math.max(0,sheet.getLastRow()-1),columns:sheet.getLastColumn(),headers:sheet.getLastColumn()?sheet.getRange(1,1,1,sheet.getLastColumn()).getDisplayValues()[0]:[]}))}); }
function sheet_(name) { const sheet=SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);if(!sheet)throw new Error('Sheet not found: '+name);return sheet; }
function makeId_(prefix) { return prefix+'-'+Utilities.formatDate(new Date(),'Asia/Bangkok','yyyyMMdd-HHmmss')+'-'+Math.floor(100+Math.random()*900); }
function cleanPhone_(value) { return String(value||'').replace(/\D/g,''); }
function json_(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
