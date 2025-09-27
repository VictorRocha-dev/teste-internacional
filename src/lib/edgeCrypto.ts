// src/lib/edgeCrypto.ts
// Compatível com Edge Runtime (usa Web Crypto: crypto.subtle)

export type RegionPayload = { region: string; ts: number };

// pegue do env (Next injeta no Edge)
const SECRET = process.env.REGION_SECRET || "dev-secret-change-me";

// helpers
const te = new TextEncoder();
function toBytes(s: string) {
  return te.encode(s);
}

function base64urlFromBytes(buf: ArrayBuffer | Uint8Array) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function bytesFromBase64url(b64url: string) {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
  const bin = atob(b64 + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function base64urlFromString(s: string) {
  return base64urlFromBytes(toBytes(s));
}
function stringFromBase64url(b64url: string) {
  const bytes = bytesFromBase64url(b64url);
  return new TextDecoder().decode(bytes);
}

// importa chave HMAC-SHA256 a partir do SECRET
async function getKey() {
  return await crypto.subtle.importKey(
    "raw",
    toBytes(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signRegion(p: RegionPayload): Promise<string> {
  const data = JSON.stringify(p);
  const key = await getKey();
  const sigBuf = await crypto.subtle.sign("HMAC", key, toBytes(data));
  const sig = base64urlFromBytes(sigBuf);
  // token = base64url(JSON.stringify({ p, sig }))
  const tokenJson = JSON.stringify({ p, sig });
  return base64urlFromString(tokenJson);
}

export async function verifyRegion(
  token?: string | null
): Promise<RegionPayload | null> {
  if (!token) return null;
  try {
    const json = stringFromBase64url(token);
    const { p, sig } = JSON.parse(json) as { p: RegionPayload; sig: string };
    const key = await getKey();
    const expectedBuf = await crypto.subtle.sign(
      "HMAC",
      key,
      toBytes(JSON.stringify(p))
    );
    const expected = base64urlFromBytes(expectedBuf);
    if (expected !== sig) return null;

    // (opcional) expirar em 24h
    const now = Math.floor(Date.now() / 1000);
    if (!p.ts || now - p.ts > 60 * 60 * 24) return null;

    return p;
  } catch {
    return null;
  }
}
