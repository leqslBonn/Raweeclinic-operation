const encoder = new TextEncoder();
const attempts = globalThis.__raweeLoginAttempts || new Map();
globalThis.__raweeLoginAttempts = attempts;

function bytesToBase64Url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function hash(value) {
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)))].map(byte => byte.toString(16).padStart(2, "0")).join("");
}
async function sign(value, secret) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}
function cookieValue(request, name) {
  const match = (request.headers.get("cookie") || "").match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : "";
}
async function readSession(request, secret) {
  const [payload, supplied] = cookieValue(request, "rawee_session").split(".");
  if (!payload || !supplied || await sign(payload, secret) !== supplied) return null;
  try {
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return Number(decoded.exp) > Date.now() ? decoded : null;
  } catch { return null; }
}

const handler = async (request) => {
  const secret = Netlify.env.get("RAWEE_SESSION_SECRET");
  if (!secret) return Response.json({ ok: false, error: "Server authentication is not configured" }, { status: 503 });
  if (request.method === "GET") {
    const session = await readSession(request, secret);
    return session ? Response.json({ ok: true, role: session.role }) : Response.json({ ok: false }, { status: 401 });
  }
  if (request.method !== "POST") return Response.json({ ok: false }, { status: 405 });
  const body = await request.json().catch(() => ({}));
  if (body.action === "logout") {
    return Response.json({ ok: true }, { headers: { "Set-Cookie": "rawee_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0" } });
  }
  const username = String(body.username || "").trim();
  const users = {
    Rawee: { role: "owner", passwordHash: Netlify.env.get("RAWEE_OWNER_PASSWORD_HASH") },
    Staff: { role: "staff", passwordHash: Netlify.env.get("RAWEE_STAFF_PASSWORD_HASH") }
  };
  const clientKey = (request.headers.get("x-nf-client-connection-ip") || request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const attempt = attempts.get(clientKey) || { count: 0, blockedUntil: 0 };
  if (attempt.blockedUntil > Date.now()) return Response.json({ ok: false, error: "TRY_AGAIN_LATER" }, { status: 429 });
  const user = users[username];
  if (!user || await hash(String(body.password || "")) !== user.passwordHash) {
    const count = attempt.count + 1;
    attempts.set(clientKey, { count: count >= 5 ? 0 : count, blockedUntil: count >= 5 ? Date.now() + 15 * 60 * 1000 : 0 });
    return Response.json({ ok: false, error: "INVALID_CREDENTIALS" }, { status: 401 });
  }
  attempts.delete(clientKey);
  const payload = bytesToBase64Url(encoder.encode(JSON.stringify({ role: user.role, exp: Date.now() + 12 * 60 * 60 * 1000 })));
  const token = `${payload}.${await sign(payload, secret)}`;
  return Response.json({ ok: true, role: user.role }, {
    headers: { "Set-Cookie": `rawee_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200` }
  });
};

export default handler;
export const config = { path: "/api/rawee-auth" };
