import { Request, Response, NextFunction } from "express";

type Bucket = { count: number; resetAt: number };
const attempts = new Map<string, Bucket>();

const WINDOW_MS = 5 * 60 * 1000; // 5분
const MAX = 5; // 최대 5회

export function loginRateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() || req.socket.remoteAddress || "ip";
  const { username } = (req.body ?? {}) as { username?: string };
  const key = `login:${ip}:${username ?? "-"}`;

  const now = Date.now();
  const b = attempts.get(key);

  if (!b || b.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  if (b.count >= MAX) {
    const retry = Math.ceil((b.resetAt - now) / 1000);
    res.setHeader("Retry-After", String(retry));
    return res.status(429).json({ success: false, message: `Too many requests. Retry in ${retry} seconds.` });
  }

  b.count++;
  return next();
}

export function clearLoginBucket(username: string, ip: string) {
  const key = `login:${ip}:${username}`;
  attempts.delete(key);
}
