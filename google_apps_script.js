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
      case 'addCustomer': return addCustomer_(body.data || {});
      case 'addAppointment': return appendRecord_('Appointments', body.data || {}, 'APT');
      case 'addFollowUp': return appendRecord_('FollowUps', body.data || {}, 'FUP');
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
  const idKey = { Appointments: 'appointment_id', FollowUps: 'followup_id', Attendance: 'attendance_id' }[sheetName];
  if (idKey && !data[idKey]) data[idKey] = makeId_(prefix);
  appendByHeaders_(sheet, data);
  return json_({ ok: true, id: idKey ? data[idKey] : null });
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
