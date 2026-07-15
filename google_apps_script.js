/** Rawee Customer Follow Up - Google Apps Script API */
const SPREADSHEET_ID = '1wA-u9CkCVDQ88LIl1P9cNMFaNBF6c6A2DuQsYV9adR8';
const API_KEY = 'RAWEE-CHANGE-THIS-KEY';

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || 'health');
  if (action === 'health') return json_({ ok: true, service: 'Rawee Customer Follow Up', timestamp: new Date().toISOString() });
  return json_({ ok: false, error: 'Unsupported action' });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.apiKey !== API_KEY) return json_({ ok: false, error: 'Unauthorized' });
    switch (body.action) {
      case 'getSystemData': return getSystemData_();
      case 'addCustomer': return addCustomer_(body.data || {});
      case 'updateCustomer': return updateRecord_('Customers', 'customer_id', body.data || {});
      case 'recordCustomerActivity': return recordCustomerActivity_(body.data || {});
      case 'addAppointment': return appendRecord_('Appointments', body.data || {}, 'APT');
      case 'addFollowUp': return appendRecord_('FollowUps', body.data || {}, 'FUP');
      case 'addEmployee': return upsertRecord_('Employees', 'employee_id', body.data || {}, 'EMP');
      case 'addTransaction': return appendRecord_('Transactions', body.data || {}, 'TXN');
      case 'bulkUpsertEmployees': return bulkUpsertEmployees_(body.data || []);
      case 'clockIn': return appendRecord_('Attendance', body.data || {}, 'ATT');
      default: return json_({ ok: false, error: 'Unsupported action' });
    }
  } catch (error) {
    return json_({ ok: false, error: String(error && error.message || error) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function addCustomer_(data) {
  const phone = cleanPhone_(data.phone);
  if (!data.full_name || !phone) return json_({ ok: false, error: 'Name and phone are required' });
  const sheet = sheet_('Customers');
  const values = sheet.getDataRange().getValues();
  const headers = values[0] || [];
  const phoneIndex = headers.indexOf('phone');
  if (phoneIndex >= 0 && values.slice(1).some(row => cleanPhone_(row[phoneIndex]) === phone)) {
    return json_({ ok: false, error: 'DUPLICATE_PHONE' });
  }
  data.customer_id = data.customer_id || makeId_('CUS');
  data.created_at = new Date();
  data.phone = phone;
  data.status = data.status || 'Active';
  data.consent_contact = Boolean(data.consent_contact);
  appendByHeaders_(sheet, data);
  return json_({ ok: true, customer_id: data.customer_id });
}

function appendRecord_(sheetName, data, prefix) {
  const sheet = sheet_(sheetName);
  const idKey = { Appointments: 'appointment_id', FollowUps: 'followup_id', Transactions: 'transaction_id', Attendance: 'attendance_id' }[sheetName];
  if (idKey && !data[idKey]) data[idKey] = makeId_(prefix);
  appendByHeaders_(sheet, data);
  return json_({ ok: true, id: idKey ? data[idKey] : null });
}

function getSystemData_() {
  return json_({
    ok: true,
    customers: records_('Customers'),
    employees: records_('Employees'),
    appointments: records_('Appointments'),
    followups: records_('FollowUps'),
    transactions: records_('Transactions'),
    attendance: records_('Attendance'),
    timestamp: new Date().toISOString()
  });
}

function recordCustomerActivity_(data) {
  if (!data.customer_id || !data.status) return json_({ ok: false, error: 'Customer and status are required' });
  const customerSheet = sheet_('Customers');
  const values = customerSheet.getDataRange().getValues();
  const headers = values[0].map(String);
  const idIndex = headers.indexOf('customer_id');
  const rowIndex = idIndex < 0 ? -1 : values.slice(1).findIndex(row => String(row[idIndex]) === String(data.customer_id));
  if (rowIndex < 0) return json_({ ok: false, error: 'Customer not found' });
  const activityAt = new Date();
  const updates = {
    status: data.status,
    last_activity_at: activityAt,
    last_activity_note: data.note || ('เปลี่ยนสถานะเป็น ' + data.status),
    updated_at: activityAt
  };
  headers.forEach((header, columnIndex) => {
    if (Object.prototype.hasOwnProperty.call(updates, header)) customerSheet.getRange(rowIndex + 2, columnIndex + 1).setValue(updates[header]);
  });
  const followup = {
    followup_id: makeId_('FUP'),
    customer_id: data.customer_id,
    status: data.status,
    channel: data.channel || 'System',
    note: updates.last_activity_note,
    assigned_to: data.performed_by || '',
    completed_at: activityAt,
    created_at: activityAt
  };
  appendByHeaders_(sheet_('FollowUps'), followup);
  return json_({ ok: true, customer_id: data.customer_id, status: data.status, activity_at: activityAt.toISOString() });
}

function records_(sheetName) {
  const values = sheet_(sheetName).getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(String);
  return values.slice(1).filter(row => row.some(value => value !== '')).map(row => {
    const record = {};
    headers.forEach((header, index) => {
      const value = row[index];
      record[header] = value instanceof Date ? value.toISOString() : value;
    });
    return record;
  });
}

function updateRecord_(sheetName, idKey, data) {
  if (!data[idKey]) return json_({ ok: false, error: 'Missing ' + idKey });
  const sheet = sheet_(sheetName);
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);
  const idIndex = headers.indexOf(idKey);
  if (idIndex < 0) return json_({ ok: false, error: 'Missing header ' + idKey });
  const rowIndex = values.slice(1).findIndex(row => String(row[idIndex]) === String(data[idKey]));
  if (rowIndex < 0) return json_({ ok: false, error: 'Record not found' });
  const targetRow = rowIndex + 2;
  headers.forEach((header, columnIndex) => {
    if (Object.prototype.hasOwnProperty.call(data, header)) sheet.getRange(targetRow, columnIndex + 1).setValue(data[header]);
  });
  return json_({ ok: true, id: data[idKey] });
}

function upsertRecord_(sheetName, idKey, data, prefix) {
  const sheet = sheet_(sheetName);
  if (!data[idKey]) data[idKey] = makeId_(prefix);
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);
  const idIndex = headers.indexOf(idKey);
  const exists = idIndex >= 0 && values.slice(1).some(row => String(row[idIndex]) === String(data[idKey]));
  if (exists) return updateRecord_(sheetName, idKey, data);
  appendByHeaders_(sheet, data);
  return json_({ ok: true, id: data[idKey] });
}

function bulkUpsertEmployees_(employees) {
  if (!Array.isArray(employees)) return json_({ ok: false, error: 'Employees must be an array' });
  employees.forEach(employee => {
    const sheet = sheet_('Employees');
    const values = sheet.getDataRange().getValues();
    const headers = values[0].map(String);
    const idIndex = headers.indexOf('employee_id');
    const rowIndex = idIndex < 0 ? -1 : values.slice(1).findIndex(row => String(row[idIndex]) === String(employee.employee_id));
    if (rowIndex < 0) appendByHeaders_(sheet, employee);
    else headers.forEach((header, columnIndex) => {
      if (Object.prototype.hasOwnProperty.call(employee, header)) sheet.getRange(rowIndex + 2, columnIndex + 1).setValue(employee[header]);
    });
  });
  return json_({ ok: true, count: employees.length });
}

function appendByHeaders_(sheet, data) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (!headers.length || !headers[0]) throw new Error('Missing headers in ' + sheet.getName());
  sheet.appendRow(headers.map(key => Object.prototype.hasOwnProperty.call(data, key) ? data[key] : ''));
}

function sheet_(name) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
  if (!sheet) throw new Error('Sheet not found: ' + name);
  return sheet;
}

function makeId_(prefix) {
  return prefix + '-' + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMdd-HHmmss') + '-' + Math.floor(100 + Math.random() * 900);
}

function cleanPhone_(value) { return String(value || '').replace(/\D/g, ''); }
function json_(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
