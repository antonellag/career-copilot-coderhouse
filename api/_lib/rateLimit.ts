import type { VercelRequest } from "@vercel/node";

/**
 * Best-effort in-memory rate limit, shared by both Gemini-calling endpoints
 * (api/chat.ts, api/roadmap.ts). This state lives in one serverless
 * instance's memory, not a shared store — Vercel doesn't guarantee the same
 * instance handles the next request, so this won't stop a truly distributed
 * abuse pattern. What it does stop, which is the realistic risk for a demo
 * link sitting in front of a real billed API key: one client (or a stuck
 * retry loop, or someone leaving a tab hammering "Enviar") burning through
 * quota on whichever warm instance answers them.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > MAX_PER_WINDOW;
}

// x-forwarded-for can be a comma-separated chain (client, proxy1, proxy2...)
// — the first entry is the original client Vercel saw.
export function clientKey(req: VercelRequest): string {
  const fwd = req.headers["x-forwarded-for"];
  const ip = Array.isArray(fwd) ? fwd[0] : fwd;
  return ip?.split(",")[0]?.trim() || "unknown";
}
