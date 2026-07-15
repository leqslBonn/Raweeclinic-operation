const ALLOWED_ACTIONS = new Set([
  "getSystemData", "addCustomer", "updateCustomer", "recordCustomerActivity",
  "addAppointment", "addFollowUp", "addEmployee", "addTransaction", "addVisit",
  "addExpense", "addPackage", "sellCourse", "useCourse", "addInventoryItem",
  "addStockMovement", "addSOP", "clockIn"
]);

export default async (request) => {
  if (request.method !== "POST") {
    return Response.json({ ok: false, error: "Method not allowed" }, { status: 405 });
  }

  const appsScriptUrl = Netlify.env.get("RAWEE_APPS_SCRIPT_URL");
  const apiKey = Netlify.env.get("RAWEE_APPS_SCRIPT_API_KEY");
  if (!appsScriptUrl || !apiKey) {
    return Response.json({ ok: false, error: "Server connection is not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    if (!ALLOWED_ACTIONS.has(String(body.action || ""))) {
      return Response.json({ ok: false, error: "Unsupported action" }, { status: 400 });
    }
    const upstream = await fetch(appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: body.action, data: body.data || {}, apiKey })
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
