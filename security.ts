/**
 * ============================================================
 *  security.ts — طبقة الأمان الشاملة للمشروع
 *  يغطي: JWT · Rate Limiting · Input Validation · CORS · Headers
 * ============================================================
 */

import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

// ──────────────────────────────────────────────────────────────
//  JWT بسيط بدون مكتبة خارجية (HMAC-SHA256)
// ──────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  const fallback = crypto.randomBytes(64).toString("hex");
  console.warn("[SECURITY] ⚠️  JWT_SECRET غير مضبوط في .env — تم توليد مفتاح مؤقت. سيتم تسجيل خروج كل المستخدمين عند إعادة تشغيل السيرفر!");
  return fallback;
})();

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || (() => {
  const fallback = crypto.randomBytes(64).toString("hex");
  console.warn("[SECURITY] ⚠️  ADMIN_JWT_SECRET غير مضبوط في .env — توليد مؤقت.");
  return fallback;
})();

function base64url(data: Buffer | string): string {
  const buf = typeof data === "string" ? Buffer.from(data) : data;
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function signJwt(payload: object, secret: string, expiresInSec = 7 * 24 * 3600): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body   = base64url(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + expiresInSec }));
  const sig    = base64url(crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest());
  return `${header}.${body}.${sig}`;
}

function verifyJwt(token: string, secret: string): any | null {
  try {
    const [header, body, sig] = token.split(".");
    const expected = base64url(crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest());
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(body, "base64").toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

export const createUserToken  = (userId: number | string) => signJwt({ sub: String(userId), role: "user"  }, JWT_SECRET);
export const createAdminToken = ()                        => signJwt({ role: "admin" }, ADMIN_JWT_SECRET, 4 * 3600);
export const verifyUserToken  = (t: string) => verifyJwt(t, JWT_SECRET);
export const verifyAdminToken = (t: string) => verifyJwt(t, ADMIN_JWT_SECRET);

// ──────────────────────────────────────────────────────────────
//  Middleware: التحقق من المستخدم المسجّل
// ──────────────────────────────────────────────────────────────
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const auth  = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : (req.headers["x-user-token"] as string || "");
  if (!token) return res.status(401).json({ error: "غير مسموح: يجب تسجيل الدخول" });
  const payload = verifyUserToken(token);
  if (!payload) return res.status(401).json({ error: "الجلسة منتهية أو غير صحيحة، يرجى تسجيل الدخول مجدداً" });
  (req as any).userId = payload.sub;
  next();
}

// ──────────────────────────────────────────────────────────────
//  Middleware: التحقق من الأدمن
// ──────────────────────────────────────────────────────────────
export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const auth  = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : (req.headers["x-admin-token"] as string || "");
  if (!token) return res.status(401).json({ error: "غير مصرح: يجب تسجيل دخول الأدمن" });
  const payload = verifyAdminToken(token);
  if (!payload || payload.role !== "admin") return res.status(403).json({ error: "ممنوع: ليس لديك صلاحية الوصول" });
  next();
}

// ──────────────────────────────────────────────────────────────
//  Rate Limiting (بدون مكتبة خارجية — In-Memory Map)
// ──────────────────────────────────────────────────────────────
interface RateLimitEntry { count: number; resetAt: number }
const rateLimitStore = new Map<string, RateLimitEntry>();

// تنظيف دوري كل 5 دقائق لتجنب memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) rateLimitStore.delete(key);
  }
}, 5 * 60 * 1000);

export function rateLimit(maxRequests: number, windowMs: number, keyFn?: (req: Request) => string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyFn ? keyFn(req) : `${req.ip}:${req.path}`;
    const now  = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || entry.resetAt < now) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    entry.count++;
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({ error: `تجاوزت الحد المسموح به. حاول مرة أخرى بعد ${retryAfter} ثانية.` });
    }
    next();
  };
}

// Rate limiters جاهزة
export const authLimiter       = rateLimit(8,  15 * 60 * 1000); // 8 محاولة/15 دقيقة (login/register)
export const forgotPassLimiter = rateLimit(3,  60 * 60 * 1000); // 3/ساعة
export const orderLimiter      = rateLimit(20, 60 * 1000);       // 20/دقيقة
export const chatLimiter       = rateLimit(30, 60 * 1000);       // 30/دقيقة
export const uploadLimiter     = rateLimit(5,  60 * 1000);       // 5/دقيقة
export const generalLimiter    = rateLimit(100, 60 * 1000);      // 100/دقيقة (عام)

// ──────────────────────────────────────────────────────────────
//  Security Headers (بديل helmet بسيط)
// ──────────────────────────────────────────────────────────────
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options",   "nosniff");
  res.setHeader("X-Frame-Options",           "DENY");
  res.setHeader("X-XSS-Protection",          "1; mode=block");
  res.setHeader("Referrer-Policy",           "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy",        "geolocation=(), camera=(), microphone=()");
  res.setHeader("Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;"
  );
  next();
}

// ──────────────────────────────────────────────────────────────
//  CORS
// ──────────────────────────────────────────────────────────────
export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  const allowed = (process.env.FRONTEND_URL || "http://localhost:3000").split(",").map(s => s.trim());
  const origin  = req.headers.origin || "";
  if (allowed.includes(origin) || !origin) {
    res.setHeader("Access-Control-Allow-Origin",      origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods",     "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers",     "Content-Type,Authorization,X-Admin-Token,X-User-Token");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
}

// ──────────────────────────────────────────────────────────────
//  Input Validation Helpers
// ──────────────────────────────────────────────────────────────

/** بريد إلكتروني صحيح */
export function isValidEmail(v: unknown): boolean {
  if (typeof v !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) && v.length <= 254;
}

/** رقم هاتف: أرقام فقط + + ونقطة وشرطة، 7-20 حرف */
export function isValidPhone(v: unknown): boolean {
  if (typeof v !== "string") return false;
  return /^\+?[\d\s\-().]{7,20}$/.test(v.trim());
}

/** كلمة المرور: 8 أحرف على الأقل */
export function isValidPassword(v: unknown): boolean {
  return typeof v === "string" && v.length >= 8 && v.length <= 128;
}

/** اسم: 2-60 حرف، لا HTML */
export function isValidName(v: unknown): boolean {
  if (typeof v !== "string") return false;
  const trimmed = v.trim();
  return trimmed.length >= 2 && trimmed.length <= 60 && !/<[^>]*>/.test(trimmed);
}

/** معرّف رقمي صحيح (ID) */
export function isValidId(v: unknown): boolean {
  const n = Number(v);
  return Number.isInteger(n) && n > 0;
}

/** كمية: عدد صحيح موجب محدود */
export function isValidQuantity(v: unknown, max = 1000): boolean {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= max;
}

/** مبلغ مالي موجب */
export function isValidAmount(v: unknown, min = 0.01, max = 100000): boolean {
  const n = parseFloat(String(v));
  return !isNaN(n) && n >= min && n <= max;
}

/** تنظيف النص من HTML/Script injection */
export function sanitizeText(v: unknown, maxLen = 500): string {
  if (typeof v !== "string") return "";
  return v
    .trim()
    .slice(0, maxLen)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/** رمز القسيمة: أحرف وأرقام فقط */
export function isValidVoucherCode(v: unknown): boolean {
  return typeof v === "string" && /^[A-Z0-9a-z\-_]{3,30}$/.test(v.trim());
}

/** رقم عملية مالية */
export function isValidTxNumber(v: unknown): boolean {
  return typeof v === "string" && /^[A-Za-z0-9\-_]{3,50}$/.test(v.trim());
}

/** URL صحيح */
export function isValidUrl(v: unknown): boolean {
  if (typeof v !== "string") return false;
  try { const u = new URL(v); return ["http:", "https:"].includes(u.protocol); } catch { return false; }
}

// ──────────────────────────────────────────────────────────────
//  Middleware: تحقق من أن userId في الطلب يطابق userId في الـ Token
//  (يمنع المستخدم من التعديل على حسابات الآخرين)
// ──────────────────────────────────────────────────────────────
export function requireSelf(paramName = "userId") {
  return (req: Request, res: Response, next: NextFunction) => {
    const tokenUserId = String((req as any).userId || "");
    // يأخذ الـ ID من route params أو body
    const requestedId = String(req.params[paramName] || req.body[paramName] || req.params["id"] || "");
    if (!requestedId || tokenUserId !== requestedId) {
      return res.status(403).json({ error: "ممنوع: لا يمكنك الوصول إلى بيانات مستخدم آخر" });
    }
    next();
  };
}
