// lib/crypto.ts
import crypto from "node:crypto";

const SECRET = process.env.REGION_SECRET || "dev-secret-change-me";

export type RegionPayload = { region: string; ts: number }; // ts = epoch seconds

export function signRegion(p: RegionPayload): string {
  const data = JSON.stringify(p);
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest("hex");
  return Buffer.from(JSON.stringify({ p, sig }), "utf8").toString("base64url");
}

export function verifyRegion(
  token: string | undefined | null
): RegionPayload | null {
  if (!token) return null;
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const { p, sig } = JSON.parse(raw);
    const calc = crypto
      .createHmac("sha256", SECRET)
      .update(JSON.stringify(p))
      .digest("hex");
    if (calc !== sig) return null;

    // (opcional) expirar após 24h
    const now = Math.floor(Date.now() / 1000);
    if (now - (p.ts || 0) > 60 * 60 * 24) return null;

    return p as RegionPayload;
  } catch {
    return null;
  }
}
