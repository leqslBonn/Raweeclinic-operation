import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

test("operational UI contains no seeded mock records or fallback arrays", async () => {
  const page = await read("app/page.tsx");
  assert.doesNotMatch(page, /mockCustomers|mockEmployees|mockTransactions|mockStock|TX001|ST001|C001|E001/);
  assert.match(page, /APP_VERSION = "1\.2\.1"/);
  assert.match(page, /ยังไม่มีข้อมูล/);
  assert.match(page, /bangkokDay/);
  assert.match(page, /ผลการติดต่อ/);
  assert.match(page, /approveExpense/);
  assert.match(page, /พนักงานผู้ทำรายการ/);
  assert.match(page, /CustomerEditAction/);
  assert.match(page, /ตัดจาก Stock/);
  assert.match(page, /setModuleEnabled/);
  assert.match(page, /setActive\(navItems\[0\]\[0\]\);\s*setRole\(nextRole\)/);
  assert.match(page, /active === .*&& role === "owner" \? <SettingsPage/);
  assert.match(page, /setSystemData\(current => \(\{ \.\.\.current, settings:/);
  assert.match(page, /await onToggle\(name, value\)/);
});

test("server protects data and separates owner from staff actions", async () => {
  const [api, auth] = await Promise.all([read("netlify/functions/rawee-api.mjs"), read("netlify/functions/rawee-auth.mjs")]);
  assert.match(api, /AUTH_REQUIRED/);
  assert.match(api, /STAFF_ACTIONS/);
  assert.doesNotMatch(api.match(/const STAFF_ACTIONS[\s\S]*?\]\);/)?.[0] || "", /addEmployee|addService|addPackage|addInventoryItem|addSOP/);
  assert.doesNotMatch(api.match(/const STAFF_ACTIONS[\s\S]*?\]\);/)?.[0] || "", /updateCustomer|approveExpense|voidTransaction|setModuleEnabled/);
  assert.match(auth, /HttpOnly; Secure; SameSite=Strict/);
  assert.doesNotMatch(auth, /Rawee1234|Staff1234/);
  assert.doesNotMatch(auth, /48c90c24|0a6dcd20/);
  assert.match(auth, /RAWEE_SESSION_SECRET/);
  assert.match(auth, /TRY_AGAIN_LATER/);
  assert.match(api, /RAWEE_SESSION_SECRET/);
});

test("Apps Script source covers every operational module", async () => {
  const source = await read("google_apps_script.js");
  for (const action of ["addCustomer","recordCustomerActivity","addAppointment","addVisit","addTransaction","addService","addPackage","sellCourse","useCourse","addExpense","addEmployee","clockIn","addInventoryItem","addStockMovement","addSOP","approveExpense","setAppointmentStatus","voidTransaction","setModuleEnabled","repairPhoneFormatting"]) assert.match(source, new RegExp(`case '${action}'`));
  assert.match(source, /setNumberFormat\('@'\)/);
  assert.match(source, /applyStockMovement_/);
  assert.match(source, /Settings/);
  assert.match(source, /replaceCatalog/);
  assert.match(source, /cleanupLegacyMockData/);
});
