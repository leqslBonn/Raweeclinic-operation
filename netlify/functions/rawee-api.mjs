const OWNER_ACTIONS = new Set([
  "getSystemData", "addCustomer", "updateCustomer", "recordCustomerActivity",
  "addAppointment", "addFollowUp", "addEmployee", "addTransaction", "addVisit",
  "addExpense", "addService", "addPackage", "sellCourse", "useCourse",
  "addInventoryItem", "addStockMovement", "addSOP", "clockIn"
]);

const STAFF_ACTIONS = new Set([
  "getSystemData", "addCustomer", "updateCustomer", "recordCustomerActivity",
  "addAppointment", "addFollowUp", "addTransaction", "addVisit", "addExpense",
  "sellCourse", "useCourse", "addStockMovement", "clockIn"
]);

const encoder = new TextEncoder();

function cookieValue(request, name) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function bytesToBase64Url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signature(value, secret) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}

async function readSession(request, secret) {
  const token = cookieValue(request, "rawee_session");
  const [payload, supplied] = token.split(".");
  if (!payload || !supplied || await signature(payload, secret) !== supplied) return null;
  try {
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (!decoded.role || Number(decoded.exp) < Date.now()) return null;
    return decoded;
  } catch { return null; }
}

export default async (request) => {
  if (request.method !== "POST") return Response.json({ ok: false, error: "Method not allowed" }, { status: 405 });
  const appsScriptUrl = Netlify.env.get("RAWEE_APPS_SCRIPT_URL");
  const apiKey = Netlify.env.get("RAWEE_APPS_SCRIPT_API_KEY");
  if (!appsScriptUrl || !apiKey) return Response.json({ ok: false, error: "Server connection is not configured" }, { status: 503 });
  const session = await readSession(request, apiKey);
  if (!session) return Response.json({ ok: false, error: "AUTH_REQUIRED" }, { status: 401 });

  try {
    const body = await request.json();
    const action = String(body.action || "");
    const allowed = session.role === "owner" ? OWNER_ACTIONS : STAFF_ACTIONS;
    if (!allowed.has(action)) return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
    const data = { ...(body.data || {}), performed_by: session.role };
    if (session.role === "staff" && action === "addExpense") data.status = "Pending";
    const upstream = await fetch(appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, data, apiKey })
    });
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.ok ? 200 : 502,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
    });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Connection failed" }, { status: 502 });
  }
};

export const config = { path: "/api/rawee" };
