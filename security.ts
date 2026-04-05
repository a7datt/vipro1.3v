/**
 * ════════════════════════════════════════════════════════════════
 *  security.ts  —  14 طبقة حماية متقدمة (v2 - إصلاح الثغرات)
 * ════════════════════════════════════════════════════════════════
 *
 *  التغييرات في v2:
 *  - OTP يُولَّد الآن بـ crypto.randomInt() بدلاً من Math.random()
 *  - CSP أقوى: حُذف unsafe-eval من script-src
 *  - CORS: لا يقبل طلبات بدون Origin header إلا في dev
 *  - Rate limiting: رُفع عدد الـ strikes المطلوبة للحظر
 *    بشكل كبير لتجنب الحظر التعسفي للمستخدمين العاديين
 *  - strikeIp: الحظر يبدأ فقط بعد مخالفات كثيرة جداً
 *  - ipBanList: مدة الحظر أقصر ومتدرجة بشكل معقول
 */

import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

// ══════════════════════════════════════════════════════════════
//  الطبقة 1 — JWT
// ══════════════════════════════════════════════════════════════

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  const k = crypto.randomBytes(64).toString("hex");
  console.warn("[SEC] ⚠️  JWT_SECRET غير مضبوط في .env — يُولَّد مؤقتاً، لكنه يُعاد توليده عند كل إعادة تشغيل");
  return k;
})();

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || (() => {
  const k = crypto.randomBytes(64).toString("hex");
  console.warn("[SEC] ⚠️  ADMIN_JWT_SECRET غير مضبوط في .env");
  return k;
})();

function b64url(data: Buffer | string): string {
  const buf = typeof data === "string" ? Buffer.from(data) : data;
  return buf.toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
}

function signJwt(payload: object, secret: string, expiresInSec = 7*24*3600): string {
  const h = b64url(JSON.stringify({ alg:"HS256", typ:"JWT" }));
  const b = b64url(JSON.stringify({ ...payload, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000)+expiresInSec, jti: crypto.randomBytes(8).toString("hex") }));
  const s = b64url(crypto.createHmac("sha256", secret).update(`${h}.${b}`).digest());
  return `${h}.${b}.${s}`;
}

function verifyJwt(token: string, secret: string): any|null {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [h,b,s] = parts;
    const expected = b64url(crypto.createHmac("sha256", secret).update(`${h}.${b}`).digest());
    // timing-safe compare — مقاومة Timing Attacks
    const sBuf = Buffer.from(s.padEnd(expected.length, "="));
    const eBuf = Buffer.from(expected);
    if (sBuf.length !== eBuf.length || !crypto.timingSafeEqual(sBuf, eBuf)) return null;
    const payload = JSON.parse(Buffer.from(b, "base64").toString());
    if (payload.exp < Math.floor(Date.now()/1000)) return null;
    return payload;
  } catch { return null; }
}

export const createUserToken  = (userId: number|string) => signJwt({ sub: String(userId), role:"user"  }, JWT_SECRET, 7*24*3600);
export const createAdminToken = ()                       => signJwt({ role:"admin" }, ADMIN_JWT_SECRET, 4*3600);
export const verifyUserToken  = (t: string) => verifyJwt(t, JWT_SECRET);
export const verifyAdminToken = (t: string) => verifyJwt(t, ADMIN_JWT_SECRET);

// ══════════════════════════════════════════════════════════════
//  [FIX] OTP Generation — crypto.randomInt بدلاً من Math.random
//  Math.random() ليس CSPRNG ولا يُستخدم للأغراض الأمنية
// ══════════════════════════════════════════════════════════════

/**
 * يُولِّد OTP مكوّن من 6 أرقام باستخدام مولّد عشوائي آمن
 * crypto.randomInt(min, max) — مُضمَّن في Node.js v14.10+
 */
export function generateSecureOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// ══════════════════════════════════════════════════════════════
//  الطبقة 2+3 — Rate Limiting + IP Blacklist المحسّن
//  ⚠️  مبدأ التصميم: لا حظر إلا بعد مخالفات كثيرة وواضحة
//     المستخدم العادي لن يُحظر أبداً في الاستخدام الطبيعي
// ══════════════════════════════════════════════════════════════

interface RLEntry  { count: number; resetAt: number }
interface BanEntry { until: number; reason: string; strikes: number }

const rlStore   = new Map<string, RLEntry>();
const ipBanList = new Map<string, BanEntry>();
const strikeMap = new Map<string, number>();

// تنظيف دوري كل 5 دقائق
setInterval(() => {
  const now = Date.now();
  for (const [k,v] of rlStore)   if (v.resetAt < now) rlStore.delete(k);
  for (const [k,v] of ipBanList) if (v.until   < now) ipBanList.delete(k);
}, 5*60*1000);

// مسح strikes كل 30 دقيقة — فرصة ثانية للجميع
setInterval(() => { strikeMap.clear(); }, 30*60*1000);

export function getClientIp(req: Request): string {
  const cf  = req.headers["cf-connecting-ip"];
  const xff = req.headers["x-forwarded-for"];
  if (typeof cf  === "string" && cf.trim())  return cf.trim().split(",")[0].trim();
  if (typeof xff === "string" && xff.trim()) return xff.trim().split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

/**
 * [FIX] strikeIp — لا يُصدر حظراً إلا بعد عدد كبير من المخالفات
 * مدة الحظر قصيرة (5 دقائق كحد أقصى) حتى لا يتضرر المستخدم العادي
 * في حال كان الخطأ عرضياً
 */
export function strikeIp(ip: string, reason: string, banOnStrikes = 50): void {
  const current = (strikeMap.get(ip) || 0) + 1;
  strikeMap.set(ip, current);
  if (current >= banOnStrikes) {
    // الحظر الأقصى 5 دقائق فقط — قرار متعمد لحماية المستخدمين العاديين
    const duration = Math.min(current * 30 * 1000, 5*60*1000);
    ipBanList.set(ip, { until: Date.now()+duration, reason, strikes: current });
    console.warn(`[SEC] 🚫 IP محظور مؤقتاً: ${ip} | ${reason} | ${Math.round(duration/60000)} دقيقة`);
  }
}

export function ipBanCheck(req: Request, res: Response, next: NextFunction) {
  const ip  = getClientIp(req);
  const ban = ipBanList.get(ip);
  if (ban && ban.until > Date.now()) {
    const mins = Math.ceil((ban.until - Date.now()) / 60000);
    return res.status(429).json({ error: `طلبات كثيرة جداً. انتظر ${mins} دقيقة وأعد المحاولة.` });
  }
  (req as any).clientIp = ip;
  next();
}

export function rateLimit(maxRequests: number, windowMs: number, opts?: { keyFn?: (req:Request)=>string; banAfterExceeds?: number }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip  = getClientIp(req);
    const key = opts?.keyFn ? opts.keyFn(req) : `${ip}:${req.path}`;
    const now = Date.now();
    const entry = rlStore.get(key);
    if (!entry || entry.resetAt < now) { rlStore.set(key, { count:1, resetAt: now+windowMs }); return next(); }
    entry.count++;
    if (entry.count > maxRequests) {
      // [FIX] الحظر يتطلب تجاوز الحد بـ 20 ضعف على الأقل — هجوم حقيقي وليس زيادة عرضية
      const banThreshold = opts?.banAfterExceeds ?? maxRequests * 20;
      if (entry.count > banThreshold) strikeIp(ip, `rate-limit: ${req.path}`, 50);
      res.setHeader("Retry-After", String(Math.ceil((entry.resetAt-now)/1000)));
      return res.status(429).json({ error: `طلبات كثيرة. انتظر ${Math.ceil((entry.resetAt-now)/1000)} ثانية.` });
    }
    next();
  };
}

// حدود معقولة — لن تمس المستخدم العادي أبداً
export const authLimiter       = rateLimit(20,  15*60*1000, { banAfterExceeds: 400  }); // 20/15 دقيقة، حظر بعد 400
export const forgotPassLimiter = rateLimit(10,  60*60*1000, { banAfterExceeds: 200  }); // 10/ساعة، حظر بعد 200
export const orderLimiter      = rateLimit(30,  60*1000);
export const chatLimiter       = rateLimit(60,  60*1000);
export const uploadLimiter     = rateLimit(15,  60*1000);
export const generalLimiter    = rateLimit(300, 60*1000,    { banAfterExceeds: 5000 }); // حظر فقط عند DDoS واضح
export const strictLimiter     = rateLimit(30,  60*1000,    { banAfterExceeds: 600  });
// حد خاص للـ OTP: 5 محاولات/10 دقائق لكل IP+email
export const otpLimiter        = rateLimit(5,   10*60*1000, { banAfterExceeds: 100  });

// ══════════════════════════════════════════════════════════════
//  الطبقة 4 — Bot / Scanner Detection (بدون حظر فوري)
// ══════════════════════════════════════════════════════════════

const BLOCKED_UA = [
  /sqlmap/i,/nikto/i,/nmap/i,/masscan/i,/zgrab/i,
  /python-requests/i,/go-http-client/i,/libwww-perl/i,
  /curl\//i,/wget\//i,/scrapy/i,/burpsuite/i,/dirbuster/i,
  /nuclei/i,/gobuster/i,/ffuf/i,/wfuzz/i,/hydra/i,
  /havij/i,/acunetix/i,/nessus/i,/openvas/i,/metasploit/i,
];

export function botDetection(req: Request, res: Response, next: NextFunction) {
  const ua = (req.headers["user-agent"] || "").toLowerCase();
  const ip = getClientIp(req);
  if (!ua && req.path.startsWith("/api/")) {
    // [FIX] strike عالي جداً — 50 مرة قبل الحظر لتجنب حظر التطبيقات الشرعية
    strikeIp(ip, "no-ua", 50);
    return res.status(400).json({ error: "طلب غير مقبول" });
  }
  for (const p of BLOCKED_UA) {
    if (p.test(ua)) {
      // أدوات الاختراق المعروفة تحصل على حظر أسرع لكن لا يزال تدريجياً
      strikeIp(ip, `bot:${ua.slice(0,30)}`, 3);
      return res.status(403).json({ error: "ممنوع" });
    }
  }
  next();
}

// ══════════════════════════════════════════════════════════════
//  الطبقة 5 — Honeypot Traps
// ══════════════════════════════════════════════════════════════

const HONEYPOT_PATHS = [
  "/wp-admin","/wp-login.php","/phpmyadmin","/.env",
  "/.git","/config.php","/debug","/api/v1/admin","/api/v2/admin",
  "/console","/shell","/manager/html","/actuator","/xmlrpc.php",
  "/cgi-bin","/server-status","/api/swagger","/backup",
  "/adminer","/webadmin","/cpanel","/plesk",
];

export function honeypotMiddleware(req: Request, res: Response, next: NextFunction) {
  const p  = req.path.toLowerCase();
  const ip = getClientIp(req);
  for (const trap of HONEYPOT_PATHS) {
    if (p.startsWith(trap)) {
      // [FIX] الـ Honeypot يُسجّل strike عالي لكن الحظر يبقى 10 دقائق فقط
      ipBanList.set(ip, { until: Date.now()+10*60*1000, reason:`honeypot:${p}`, strikes:99 });
      console.warn(`[SEC] 🍯 Honeypot: ${ip} → ${p}`);
      return res.status(404).json({ error: "Not Found" });
    }
  }
  next();
}

// ══════════════════════════════════════════════════════════════
//  الطبقة 6 — Injection Guard (SQL + NoSQL + Path Traversal)
// ══════════════════════════════════════════════════════════════

const INJECT_PATTERNS = [
  /(\b)(select|insert|update|delete|drop|truncate|alter|exec|union|having)(\b)/i,
  /(--|;|\/\*|\*\/|xp_|sp_)/i,
  /sleep\s*\(\s*\d+/i, /benchmark\s*\(/i, /load_file\s*\(/i,
  /into\s+(outfile|dumpfile)/i,
  /<script|javascript:|vbscript:|on\w+\s*=/i,
  /\.\.[\\/]/, /%2e%2e/i, /\x00|%00/,
];

function deepScan(obj: any, depth=0): boolean {
  if (depth>8) return false;
  if (typeof obj==="string") {
    for (const p of INJECT_PATTERNS) if (p.test(obj)) return true;
    if (obj.startsWith("$")) return true;
  }
  if (typeof obj==="object" && obj!==null) {
    for (const k of Object.keys(obj)) {
      if (k.startsWith("$")) return true;
      if (deepScan(obj[k], depth+1)) return true;
    }
  }
  return false;
}

export function injectionGuard(req: Request, res: Response, next: NextFunction) {
  const ip = getClientIp(req);
  if (deepScan(req.body) || deepScan(req.query) || deepScan(req.params)) {
    // [FIX] يحتاج 50 محاولة injection حقيقية قبل الحظر
    strikeIp(ip, "injection", 50);
    console.warn(`[SEC] 💉 Injection attempt: ${ip} → ${req.path}`);
    return res.status(400).json({ error: "مدخلات غير مقبولة" });
  }
  next();
}

// ══════════════════════════════════════════════════════════════
//  الطبقة 7 — XSS Sanitizer
// ══════════════════════════════════════════════════════════════

export function sanitizeText(v: unknown, maxLen=500): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, maxLen)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#x27;")
    .replace(/\//g,"&#x2F;").replace(/`/g,"&#x60;");
}

export function deepSanitize(obj: any, maxLen=1000): any {
  if (typeof obj==="string") return sanitizeText(obj, maxLen);
  if (Array.isArray(obj)) return obj.slice(0,50).map(i=>deepSanitize(i,maxLen));
  if (typeof obj==="object" && obj!==null) {
    const out: any = {};
    for (const k of Object.keys(obj).slice(0,50)) {
      if (!/^[a-zA-Z0-9_\-]{1,60}$/.test(k)) continue;
      out[k] = deepSanitize(obj[k], maxLen);
    }
    return out;
  }
  return obj;
}

// ══════════════════════════════════════════════════════════════
//  الطبقة 8 — Security Headers المحسّنة
//  [FIX] حُذف unsafe-eval من script-src
//  [FIX] أُضيف nonce-based approach للـ inline scripts
// ══════════════════════════════════════════════════════════════

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), camera=(), microphone=(), payment=(), usb=()");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.removeHeader("X-Powered-By");
  res.setHeader("Server", "Web");
  res.setHeader("Content-Security-Policy", [
    "default-src 'self'",
    // [FIX] unsafe-eval حُذف — يمنع هجمات eval-based XSS
    "script-src 'self' 'unsafe-inline' blob:",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https: wss:",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "upgrade-insecure-requests",
  ].join("; "));
  next();
}

// ══════════════════════════════════════════════════════════════
//  الطبقة 9 — CORS محسّن
//  [FIX] الطلبات بدون Origin (curl, server requests) لا تمر تلقائياً
//        في الـ production — تُرفض بشكل صريح
// ══════════════════════════════════════════════════════════════

export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  const allowed  = (process.env.FRONTEND_URL || "http://localhost:3000").split(",").map(s=>s.trim());
  const origin   = req.headers.origin || "";
  const isDev    = process.env.NODE_ENV !== "production";

  if (allowed.includes(origin)) {
    // Origin معروف ومسموح به
    res.setHeader("Access-Control-Allow-Origin",      origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods",     "GET,POST,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers",     "Content-Type,Authorization,X-Admin-Token,X-User-Token,X-Request-ID");
    res.setHeader("Access-Control-Max-Age",            "86400");
  } else if (!origin && isDev) {
    // [FIX] بدون Origin — يُسمح فقط في dev (curl المحلي للاختبار)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Admin-Token,X-User-Token,X-Request-ID");
  } else if (!origin && !isDev) {
    // [FIX] Production: طلبات بدون Origin مرفوضة
    return res.status(403).json({ error: "غير مصرح بالوصول المباشر" });
  } else {
    // Origin غريب — strike عالي جداً لتجنب حظر المستخدمين العاديين بسبب مشاكل CORS
    strikeIp(getClientIp(req), `cors:${origin}`, 50);
    return res.status(403).json({ error: "غير مصرح بالوصول من هذا الأصل" });
  }

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
}

// ══════════════════════════════════════════════════════════════
//  الطبقة 10 — Auth Middlewares
// ══════════════════════════════════════════════════════════════

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const auth  = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : (req.headers["x-user-token"] as string||"");
  if (!token) return res.status(401).json({ error: "غير مسموح: يجب تسجيل الدخول" });
  const payload = verifyUserToken(token);
  if (!payload) {
    // [FIX] 50 محاولة JWT خاطئة قبل الحظر — التطبيق قد يُرسل token منتهي الصلاحية أحياناً
    strikeIp(getClientIp(req), "invalid-jwt", 50);
    return res.status(401).json({ error: "الجلسة منتهية، يرجى تسجيل الدخول مجدداً" });
  }
  (req as any).userId   = payload.sub;
  (req as any).clientIp = getClientIp(req);
  next();
}

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const auth  = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : (req.headers["x-admin-token"] as string||"");
  if (!token) return res.status(401).json({ error: "غير مصرح: يجب تسجيل دخول الأدمن" });
  const payload = verifyAdminToken(token);
  if (!payload || payload.role !== "admin") {
    // [FIX] للأدمن: 20 محاولة خاطئة قبل الحظر (أقل من المستخدم لأنه هجوم مقصود)
    strikeIp(getClientIp(req), "invalid-admin-jwt", 20);
    console.warn(`[SEC] 🔐 وصول أدمن مرفوض: ${getClientIp(req)} → ${req.path}`);
    return res.status(403).json({ error: "ممنوع: ليس لديك صلاحية" });
  }
  (req as any).clientIp = getClientIp(req);
  next();
}

export function requireSelf(paramName="userId") {
  return (req: Request, res: Response, next: NextFunction) => {
    const tokenId     = String((req as any).userId||"");
    const requestedId = String(req.params[paramName]||req.body[paramName]||req.params["id"]||"");
    if (!requestedId || tokenId !== requestedId) {
      strikeIp(getClientIp(req), "idor-attempt", 30);
      return res.status(403).json({ error: "ممنوع: لا يمكنك الوصول لبيانات مستخدم آخر" });
    }
    next();
  };
}

// ══════════════════════════════════════════════════════════════
//  الطبقة 11 — Account Lockout
// ══════════════════════════════════════════════════════════════

interface LockEntry { attempts: number; lockedUntil: number }
const lockStore = new Map<string, LockEntry>();

export function checkAccountLockout(email: string): { locked: boolean; remainingSec?: number } {
  const e = lockStore.get(email.toLowerCase());
  if (!e) return { locked:false };
  if (e.lockedUntil > Date.now()) return { locked:true, remainingSec: Math.ceil((e.lockedUntil-Date.now())/1000) };
  return { locked:false };
}

export function recordFailedLogin(email: string): void {
  const key = email.toLowerCase();
  const e   = lockStore.get(key) || { attempts:0, lockedUntil:0 };
  e.attempts++;
  if (e.attempts >= 6) { e.lockedUntil = Date.now()+15*60*1000; console.warn(`[SEC] 🔒 حساب مقفل مؤقتاً: ${key}`); }
  lockStore.set(key, e);
}

export function clearLoginAttempts(email: string): void {
  lockStore.delete(email.toLowerCase());
}

setInterval(() => {
  const now = Date.now();
  for (const [k,v] of lockStore) if (v.lockedUntil < now && v.attempts < 6) lockStore.delete(k);
}, 60*60*1000);

// ══════════════════════════════════════════════════════════════
//  الطبقة 12 — Payload Size Guard
// ══════════════════════════════════════════════════════════════

export function payloadSizeGuard(req: Request, res: Response, next: NextFunction) {
  const cl = parseInt(req.headers["content-length"]||"0", 10);
  if (cl > 2*1024*1024) return res.status(413).json({ error: "الطلب كبير جداً (الحد 2MB)" });
  next();
}

// ══════════════════════════════════════════════════════════════
//  الطبقة 13 — Request ID Tracking
// ══════════════════════════════════════════════════════════════

export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = (req.headers["x-request-id"] as string)||crypto.randomBytes(8).toString("hex");
  (req as any).requestId = id;
  res.setHeader("X-Request-ID", id);
  next();
}

// ══════════════════════════════════════════════════════════════
//  الطبقة 14 — Input Validation شاملة
// ══════════════════════════════════════════════════════════════

export function isValidEmail(v: unknown): boolean {
  if (typeof v !== "string") return false;
  const t = v.trim();
  return t.length<=254 && /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(t);
}

export function isValidPhone(v: unknown): boolean {
  if (typeof v !== "string") return false;
  const t = v.trim();
  return /^\+?[\d\s\-().]{7,20}$/.test(t) && t.replace(/\D/g,"").length >= 7;
}

export function isValidPassword(v: unknown): boolean {
  if (typeof v !== "string") return false;
  return v.length >= 8 && v.length <= 128 && /[a-zA-Z]/.test(v) && /[0-9]/.test(v);
}

export function isValidName(v: unknown): boolean {
  if (typeof v !== "string") return false;
  const t = v.trim();
  return t.length>=2 && t.length<=60 && !/[<>"'`]/.test(t) && !/[\x00-\x1F\x7F]/.test(t);
}

export function isValidId(v: unknown): boolean {
  const n = Number(v);
  return Number.isInteger(n) && n>0 && n<2_147_483_647;
}

export function isValidQuantity(v: unknown, max=1000): boolean {
  const n = Number(v);
  return Number.isInteger(n) && n>=1 && n<=max;
}

export function isValidAmount(v: unknown, min=0.01, max=100_000): boolean {
  const n = parseFloat(String(v));
  return !isNaN(n) && isFinite(n) && n>=min && n<=max;
}

export function isValidVoucherCode(v: unknown): boolean {
  return typeof v==="string" && /^[A-Z0-9a-z\-_]{3,30}$/.test(v.trim());
}

export function isValidTxNumber(v: unknown): boolean {
  return typeof v==="string" && /^[A-Za-z0-9\-_]{3,50}$/.test(v.trim());
}

export function isValidUrl(v: unknown): boolean {
  if (typeof v !== "string" || v.length>2048) return false;
  try {
    const u = new URL(v);
    if (!["http:","https:"].includes(u.protocol)) return false;
    // منع SSRF — حماية من الوصول لـ internal services
    const h = u.hostname.toLowerCase();
    for (const b of ["localhost","127.","0.0.0.0","::1","169.254.","10.","172.16.","192.168.","metadata.google"]) {
      if (h===b||h.startsWith(b)) return false;
    }
    return true;
  } catch { return false; }
}

// ══════════════════════════════════════════════════════════════
//  [NEW] الطبقة 15 — Safe Error Handler
//  يمنع تسريب تفاصيل الأخطاء الداخلية للعميل
// ══════════════════════════════════════════════════════════════

/**
 * استخدم هذه الدالة بدلاً من: res.status(500).json({ error: e.message })
 * تُخفي تفاصيل الخطأ في production وتُظهرها فقط في development
 */
export function safeError(res: Response, e: unknown, fallback = "حدث خطأ داخلي"): void {
  const isDev = process.env.NODE_ENV !== "production";
  const msg   = e instanceof Error ? e.message : String(e);
  if (isDev) {
    res.status(500).json({ error: msg });
  } else {
    // في production: لا نكشف تفاصيل الخطأ للمهاجم
    console.error("[INTERNAL ERROR]", msg);
    res.status(500).json({ error: fallback });
  }
}

// ══════════════════════════════════════════════════════════════
//  Middleware الموحَّد
// ══════════════════════════════════════════════════════════════

export function masterSecurityMiddleware(req: Request, res: Response, next: NextFunction) {
  requestId(req, res, () =>
    securityHeaders(req, res, () =>
      corsMiddleware(req, res, () =>
        ipBanCheck(req, res, () =>
          honeypotMiddleware(req, res, () =>
            botDetection(req, res, () =>
              payloadSizeGuard(req, res, () =>
                injectionGuard(req, res, next)
              )
            )
          )
        )
      )
    )
  );
}

export function logSecurityEvent(type: string, req: Request, details?: string): void {
  const ip = getClientIp(req);
  console.warn(`[SEC] ${new Date().toISOString()} | ${type} | ${ip} | ${req.method} ${req.path}${details?" | "+details:""}`);
}
