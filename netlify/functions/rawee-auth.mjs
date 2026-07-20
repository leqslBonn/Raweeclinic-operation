const encoder = new TextEncoder();
const USERS = {
  Rawee: { role: "owner", passwordHash: "48c90c24f9e5851f352d830ebe544d81569c4fc930b84f059ef13bfc889d611f" },
  Staff: { role: "staff", passwordHash: "0a6dcd204823635cbb89bf8fd12e73417b0f84ce355b44dd4efaed89b4e45fa1" }
};

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

export default async (request) => {
  const secret = Netlify.env.get("RAWEE_APPS_SCRIPT_API_KEY");
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
  const user = USERS[username];
  if (!user || await hash(String(body.password || "")) !== user.passwordHash) {
    return Response.json({ ok: false, error: "INVALID_CREDENTIALS" }, { status: 401 });
  }
  const payload = bytesToBase64Url(encoder.encode(JSON.stringify({ role: user.role, exp: Date.now() + 12 * 60 * 60 * 1000 })));
  const token = `${payload}.${await sign(payload, secret)}`;
  return Response.json({ ok: true, role: user.role }, {
    headers: { "Set-Cookie": `rawee_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200` }
  });
};

export const config = { path: "/api/rawee-auth" };
