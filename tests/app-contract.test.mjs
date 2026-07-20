import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

test("operational UI contains no seeded mock records or fallback arrays", async () => {
  const page = await read("app/page.tsx");
  assert.doesNotMatch(page, /mockCustomers|mockEmployees|mockTransactions|mockStock|TX001|ST001|C001|E001/);
  assert.match(page, /APP_VERSION = "1\.1\.0"/);
  assert.match(page, /ยังไม่มีข้อมูล/);
});

test("server protects data and separates owner from staff actions", async () => {
  const [api, auth] = await Promise.all([read("netlify/functions/rawee-api.mjs"), read("netlify/functions/rawee-auth.mjs")]);
  assert.match(api, /AUTH_REQUIRED/);
  assert.match(api, /STAFF_ACTIONS/);
  assert.doesNotMatch(api.match(/const STAFF_ACTIONS[\s\S]*?\]\);/)?.[0] || "", /addEmployee|addService|addPackage|addInventoryItem|addSOP/);
  assert.match(auth, /HttpOnly; Secure; SameSite=Strict/);
  assert.doesNotMatch(auth, /Rawee1234|Staff1234/);
});

test("Apps Script source covers every operational module", async () => {
  const source = await read("google_apps_script.js");
  for (const action of ["addCustomer","recordCustomerActivity","addAppointment","addVisit","addTransaction","addService","addPackage","sellCourse","useCourse","addExpense","addEmployee","clockIn","addInventoryItem","addStockMovement","addSOP"]) assert.match(source, new RegExp(`case '${action}'`));
  assert.match(source, /replaceCatalog/);
  assert.match(source, /cleanupLegacyMockData/);
});
