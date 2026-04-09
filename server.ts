import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import crypto from "crypto";
import {
  createUserToken, createAdminToken, verifyAdminToken,
  authenticate, adminAuth, requireSelf,
  authLimiter, forgotPassLimiter, orderLimiter, chatLimiter, uploadLimiter, generalLimiter, strictLimiter, otpLimiter,
  masterSecurityMiddleware, ipBanCheck, botDetection, injectionGuard,
  securityHeaders, corsMiddleware,
  isValidEmail, isValidPhone, isValidPassword, isValidName,
  isValidId, isValidQuantity, isValidAmount,
  sanitizeText, deepSanitize, isValidVoucherCode, isValidTxNumber, isValidUrl,
  checkAccountLockout, recordFailedLogin, clearLoginAttempts,
  logSecurityEvent, payloadSizeGuard, requestId,
  safeError, generateSecureOtp,
} from "./security.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Supabase Configuration ---
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- Web Push Configuration ---
let vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY!,
  privateKey: process.env.VAPID_PRIVATE_KEY!,
};

if (vapidKeys.publicKey && vapidKeys.privateKey) {
  try {
    webpush.setVapidDetails(
      "mailto:yallamha86@gmail.com",
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );
  } catch (e) {
    console.error("Failed to set VAPID details. Push notifications may not work.", e);
  }
}

// --- Push Notifications ---
const sendPushNotification = async (userId: string | null, title: string, body: string, url: string = "/") => {
  try {
    let query = supabase.from("push_subscriptions").select("subscription");
    if (userId) query = query.eq("user_id", userId);

    const { data: subscriptions } = await query;

    if (subscriptions) {
      subscriptions.forEach(sub => {
        try {
          const subscription = JSON.parse(sub.subscription);
          webpush.sendNotification(subscription, JSON.stringify({ title, body, url }))
            .catch(async err => {
              if (err.statusCode === 410 || err.statusCode === 404) {
                await supabase.from("push_subscriptions").delete().eq("subscription", sub.subscription);
              }
            });
        } catch (e) {
          console.error("Push error", e);
        }
      });
    }
  } catch (e) {
    console.error("Push notification error", e);
  }
};

// --- Telegram Helpers ---
const sendTelegramMessage = async (text: string) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch (e) {
    console.error("Telegram error", e);
  }
};

const sendTelegramToUser = async (userId: string, text: string) => {
  const { data: user } = await supabase.from("users").select("telegram_chat_id").eq("id", userId).single();
  if (!user?.telegram_chat_id) return;
  const token = process.env.TELEGRAM_USER_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: user.telegram_chat_id, text }),
    });
  } catch (e) {
    console.error("Telegram user notify error", e);
  }
};

// --- User States for Bot Conversations ---
const userStates = new Map<number, { step: string; data: any }>();

let adminBot: TelegramBot | null = null;
let userBot: TelegramBot | null = null;

// --- Main Menu Helper ---
async function sendMainMenu(chatId: number, user: any, bot: TelegramBot) {
  const { data: setting } = await supabase.from("settings").select("value").eq("key", "support_whatsapp").single();
  const whatsappLink = setting ? `https://wa.me/${setting.value.replace("+", "")}` : "https://t.me/your_support_username";

  bot.sendMessage(chatId, `أهلاً بك ${user.name} في القائمة الرئيسية:`, {
    reply_markup: {
      keyboard: [
        [{ text: "📄 سياسة الخصوصية" }, { text: "💬 الدعم الفني" }],
        [{ text: "🚪 تسجيل الخروج" }]
      ],
      resize_keyboard: true
    }
  });

  bot.sendMessage(chatId, "الخيارات المتاحة:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "👤 معلوماتي", callback_data: "my_info" }, { text: "💰 رصيدي", callback_data: "my_balance" }],
        [{ text: "💳 دفعاتي", callback_data: "my_payments" }, { text: "📦 طلباتي", callback_data: "my_orders" }],
        [{ text: "🚀 شحن التطبيقات", callback_data: "charge_apps" }],
        [{ text: "💳 شحن الرصيد", callback_data: "topup_balance" }],
        [{ text: "🎁 المكافآت", callback_data: "rewards" }],
        [{ text: "🔥 العروض", callback_data: "offers" }, { text: "🎁 استرداد كود", callback_data: "redeem_voucher" }],
        [{ text: "📢 مشاركة البوت", callback_data: "share" }, { text: "🔗 الاحالة", callback_data: "referral" }]
      ]
    }
  });
}

// --- Process Bot Order (Supabase) ---
async function processBotOrder(chatId: number, user: any, product: any, price: number, extraData: any) {
  try {
    const { data: order, error: orderErr } = await supabase.from("orders").insert({
      user_id: user.id,
      total_amount: price,
      meta: JSON.stringify(extraData)
    }).select().single();

    if (orderErr) throw orderErr;

    await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: product.id,
      price_at_purchase: product.price,
      quantity: 1,
      extra_data: JSON.stringify(extraData)
    });

    await supabase.from("users").update({ balance: user.balance - price }).eq("id", user.id);

    // Referral commission (dynamic from settings)
    if (user.referred_by_id) {
      const { data: refCommSetting1 } = await supabase.from("settings").select("value").eq("key", "referral_commission").single();
      const refCommRate1 = parseFloat(refCommSetting1?.value || "5") / 100;
      const commission = price * refCommRate1;
      await supabase.rpc("increment_balance", { user_id_param: user.referred_by_id, amount_param: commission });
    }

    userBot?.sendMessage(chatId, `✅ تمت عملية الشراء بنجاح!\nرقم الطلب: ${order.id}\nالمنتج: ${product.name}\nالمبلغ المخصوم: ${price.toFixed(2)}$`);

    const adminChatId = process.env.TELEGRAM_CHAT_ID;
    if (adminChatId) {
      const adminMsg = `🔔 طلب جديد من البوت #ORD${order.id}\nالاسم: ${user.name}\nProduct: ${product.name}\nTotal: ${price}`;
      adminBot?.sendMessage(adminChatId, adminMsg);
    }
  } catch (e) {
    console.error(e);
    userBot?.sendMessage(chatId, "❌ حدث خطأ أثناء معالجة الطلب.");
  }
}

// ============================================================
// START SERVER
// ============================================================
// =================== API SYRIA HELPERS ===================
const APISYRIA_BASE = "https://apisyria.com/api/v1";
const APISYRIA_KEY = process.env.APISYRIA_API_KEY || "";

async function apisyriaRequest(params: Record<string, string>): Promise<any> {
  const qs = new URLSearchParams({ ...params, api_key: APISYRIA_KEY }).toString();
  const url = `${APISYRIA_BASE}?${qs}`;
  console.log("[APISYRIA] Request:", url.replace(APISYRIA_KEY, "***"));
  const res = await fetch(url, {
    headers: { "Accept": "application/json", "X-Api-Key": APISYRIA_KEY }
  });
  const text = await res.text();
  console.log("[APISYRIA] Response status:", res.status, "body:", text.substring(0, 300));
  try { return JSON.parse(text); } catch { return { success: false, error: text }; }
}

async function verifySyriatelTx(txNumber: string, gsm: string): Promise<{ found: boolean; amount?: number; debug?: string }> {
  try {
    const data = await apisyriaRequest({ resource: "syriatel", action: "find_tx", tx: txNumber, gsm, period: "7" });
    if (data?.success && data?.data?.found) {
      return { found: true, amount: parseFloat(data.data.transaction?.amount || "0") };
    }
    // try 30 days
    const data2 = await apisyriaRequest({ resource: "syriatel", action: "find_tx", tx: txNumber, gsm, period: "30" });
    if (data2?.success && data2?.data?.found) {
      return { found: true, amount: parseFloat(data2.data.transaction?.amount || "0") };
    }
    const debugMsg = JSON.stringify(data2 || data).substring(0, 200);
    return { found: false, debug: debugMsg };
  } catch (e: any) { return { found: false, debug: String(e) }; }
}

async function verifyShamCashTx(txNumber: string, accountAddress: string): Promise<{ found: boolean; amount?: number; currency?: string; debug?: string }> {
  try {
    const data = await apisyriaRequest({ resource: "shamcash", action: "find_tx", tx: txNumber, account_address: accountAddress });
    if (data?.success && data?.data?.found) {
      return { found: true, amount: data.data.transaction?.amount, currency: data.data.transaction?.currency };
    }
    return { found: false, debug: JSON.stringify(data).substring(0, 300) };
  } catch (e: any) { return { found: false, debug: String(e) }; }
}

// =================== AHMINIX API HELPERS ===================
const AHMINIX_BASE = "https://fastcard1.store/client/api";
const AHMINIX_TOKEN = process.env.AHMINIX_API_TOKEN || "";
if (!AHMINIX_TOKEN) console.warn("[SECURITY] ⚠️  AHMINIX_API_TOKEN غير مضبوط في .env");

function generateUUIDv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * يرسل طلب GET إلى Ahminix API
 */
// ============================================================
// EMAIL / OTP HELPERS (Resend API)
// ============================================================
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@vipro.sy";
const STORE_NAME = process.env.STORE_NAME || "VIPro";

// [FIX] استخدام crypto.randomInt بدلاً من Math.random
// Math.random() ليس CSPRNG ولا يُستخدم لأغراض أمنية
function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

async function sendOtpEmail(to: string, otp: string, type: "verify" | "reset"): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("[EMAIL] RESEND_API_KEY not set - skipping email send");
    return false;
  }
  const subject = type === "verify"
    ? `${STORE_NAME} - رمز تفعيل الحساب`
    : `${STORE_NAME} - رمز إعادة تعيين كلمة المرور`;
  const title = type === "verify" ? "تفعيل حسابك" : "إعادة تعيين كلمة المرور";
  const desc = type === "verify"
    ? "شكراً لتسجيلك! أدخل الرمز أدناه لتفعيل حسابك."
    : "تلقينا طلباً لإعادة تعيين كلمة مرورك. أدخل الرمز أدناه.";

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;direction:rtl">
<div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
  <div style="background:#B00000;padding:32px 24px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:24px;font-weight:bold">${STORE_NAME}</h1>
    <p style="color:rgba(255,255,255,.85);margin:8px 0 0;font-size:14px">${title}</p>
  </div>
  <div style="padding:32px 24px;text-align:center">
    <p style="color:#555;font-size:15px;margin:0 0 24px">${desc}</p>
    <div style="background:#f8f8f8;border:2px dashed #B00000;border-radius:12px;padding:24px;margin:0 0 24px">
      <p style="margin:0 0 8px;font-size:13px;color:#888">رمز التحقق</p>
      <p style="margin:0;font-size:40px;font-weight:900;letter-spacing:12px;color:#B00000;font-family:monospace">${otp}</p>
    </div>
    <p style="color:#999;font-size:12px;margin:0">صالح لمدة 10 دقائق · لا تشاركه مع أحد</p>
  </div>
  <div style="background:#f8f8f8;padding:16px;text-align:center;border-top:1px solid #eee">
    <p style="margin:0;font-size:11px;color:#bbb">إذا لم تطلب هذا الرمز، يمكنك تجاهل هذا البريد. الدعم التقني https://wa.me/963982559890</p>
  </div>
</div>
</body>
</html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html })
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("[EMAIL] Resend error:", data);
      return false;
    }
    console.log("[EMAIL] Sent OTP to:", to, "id:", data.id);
    return true;
  } catch (e: any) {
    console.error("[EMAIL] Send failed:", e.message);
    return false;
  }
}

async function saveOtp(email: string, type: "verify" | "reset"): Promise<string> {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min
  // Invalidate old OTPs of same type
  await supabase.from("email_verifications")
    .update({ used: true })
    .eq("email", email)
    .eq("type", type)
    .eq("used", false);
  // Insert new OTP
  await supabase.from("email_verifications").insert({ email, code: otp, type, expires_at: expiresAt });
  return otp;
}

async function verifyOtp(email: string, code: string, type: "verify" | "reset"): Promise<boolean> {
  const { data } = await supabase.from("email_verifications")
    .select("id, expires_at")
    .eq("email", email)
    .eq("code", code)
    .eq("type", type)
    .eq("used", false)
    .single();
  if (!data) return false;
  if (new Date(data.expires_at) < new Date()) return false;
  await supabase.from("email_verifications").update({ used: true }).eq("id", data.id);
  return true;
}

// تحويل replay_api لمصفوفة strings دائماً
// الـ API قد يُرجع: strings | numbers | {replay: "..."} | {code: "..."} | objects أخرى
function normalizeReplayApi(raw: any): string[] {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  const result: string[] = [];
  for (const x of arr) {
    if (x === null || x === undefined) continue;
    if (typeof x === "string" && x.trim()) { result.push(x.trim()); continue; }
    if (typeof x === "number") { result.push(String(x)); continue; }
    if (typeof x === "object") {
      // استخراج القيمة من أي مفتاح شائع
      const val = x.replay ?? x.code ?? x.value ?? x.key ?? x.data ?? x.result ?? null;
      if (val !== null && val !== undefined) {
        result.push(String(val));
      } else {
        // آخر حل: JSON stringify لكن نتجنب {} الفارغة
        const str = JSON.stringify(x);
        if (str !== "{}" && str !== "[]") result.push(str);
      }
      continue;
    }
    result.push(String(x));
  }
  return result;
}

async function ahminixGet(path: string): Promise<any> {
  const url = `${AHMINIX_BASE}${path}`;
  console.log("[AHMINIX] GET:", url);
  const res = await fetch(url, {
    headers: { "api-token": AHMINIX_TOKEN, "Accept": "application/json" }
  });
  const text = await res.text();
  console.log("[AHMINIX] Response:", res.status, text.substring(0, 300));
  try { return JSON.parse(text); } catch { return { error: text }; }
}

/**
 * يرسل طلب POST لإنشاء طلب في Ahminix API
 * Per API docs: POST /newOrder/{productId}/params?qty=1&playerId=xxx&order_uuid=xxx
 */
async function ahminixCreateOrder(
  productId: string,
  qty: number,
  playerId: string,
  orderUuid: string
): Promise<any> {
  // POST /newOrder/{productId} - يقبل playerId كـ optional
  // إذا لم يكن هناك playerId لا نرسله نهائياً
  const params: Record<string, string> = {
    qty: String(qty),
    order_uuid: orderUuid,
  };
  if (playerId && playerId.trim() !== "") {
    params.playerId = playerId.trim();
  }

  const qs = new URLSearchParams(params).toString();
  const url = `${AHMINIX_BASE}/newOrder/${productId}/params?${qs}`;
  console.log("[AHMINIX] POST order URL:", url.replace(AHMINIX_TOKEN, "***"));

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "api-token": AHMINIX_TOKEN,
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
  });
  const text = await res.text();
  console.log("[AHMINIX] Order response:", res.status, text.substring(0, 500));
  try { return JSON.parse(text); } catch { return { error: text }; }
}

/**
 * يتحقق من حالة طلب في Ahminix
 */
async function ahminixCheckOrder(orderId: string, isUuid = false): Promise<any> {
  const param = isUuid
    ? `orders=["${orderId}"]&uuid=1`
    : `orders=[${orderId}]`;
  return ahminixGet(`/check?${param}`);
}

/**
 * يُحوّل حالة Ahminix الخام إلى حالة داخلية
 * API قد يُرجع: "accept"/"completed" → completed | "reject"/"rejected"/"cancelled" → cancelled | غير ذلك → processing
 */
function mapAhminixStatus(apiStatus: string): "completed" | "cancelled" | "processing" {
  const s = (apiStatus || "").toLowerCase().trim();
  // مكتمل
  if (["accept","accepted","completed","done","success","approved","finish","finished","delivered"].includes(s)) return "completed";
  // مرفوض
  if (["reject","rejected","cancelled","failed","declined","denied","refused"].includes(s)) return "cancelled";
  return "processing";
}

/**
 * هل الحالة الخام نهائية (مكتملة أو مرفوضة)؟
 */
function isAhminixFinalStatus(apiStatus: string): boolean {
  const s = (apiStatus || "").toLowerCase().trim();
  return ["accept","accepted","completed","done","success","approved","finish","finished","delivered",
          "reject","rejected","cancelled","failed","declined","denied","refused"].includes(s);
}

/**
 * يجلب كل المنتجات من Ahminix
 */
async function ahminixGetProducts(): Promise<any[]> {
  const data = await ahminixGet("/products");
  return Array.isArray(data) ? data : [];
}

// ============================================================
// خريطة منع الطلبات المكررة: key = "userId-productId-qty-playerId"
// نحتفظ بالطلب لمدة 10 ثوانٍ لرفض أي طلب مطابق في تلك المدة
// ============================================================
const recentOrdersMap = new Map<string, number>();
function isDuplicateOrder(userId: string, productId: string, qty: number, playerId: string): boolean {
  const key = `${userId}-${productId}-${qty}-${playerId}`;
  const last = recentOrdersMap.get(key);
  const now = Date.now();
  if (last && now - last < 10_000) return true; // مكرر خلال 10 ثوانٍ
  recentOrdersMap.set(key, now);
  // تنظيف المدخلات القديمة تلقائياً
  if (recentOrdersMap.size > 500) {
    for (const [k, t] of recentOrdersMap.entries()) {
      if (now - t > 10_000) recentOrdersMap.delete(k);
    }
  }
  return false;
}

/**
 * يجلب رصيد ومعلومات حساب Ahminix
 */
async function ahminixGetProfile(): Promise<any> {
  return ahminixGet("/profile");
}

async function startServer() {
  const app = express();

  // حد حجم الطلب لمنع هجمات الذاكرة
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));

  const PORT = 3000;

  // [NEW] helmet — طبقة headers أمنية إضافية من المكتبة الرسمية
  app.use(helmet({
    contentSecurityPolicy: false, // نستخدم CSP المخصص في masterSecurityMiddleware
    crossOriginEmbedderPolicy: false, // قد يكسر بعض الموارد الخارجية
  }));

  // [NEW] hpp — يمنع HTTP Parameter Pollution (مثل ?id=1&id=2 لتجاوز الـ validation)
  app.use(hpp());

  // ═══ masterSecurityMiddleware — 14 طبقة حماية دفعة واحدة ═══
  app.use(masterSecurityMiddleware);
  // Rate limiting عام إضافي
  app.use(generalLimiter);

  app.use((req, res, next) => {
    if (req.url.startsWith("/api")) {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    }
    next();
  });

  // =================== API ROUTES ===================

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/settings", async (req, res) => {
    try {
      const { data, error } = await supabase.from("settings").select("*");
      if (error) throw error;
      res.json(Array.isArray(data) ? data : []);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const { data, error } = await supabase.from("categories").select("*").eq("active", true).order("order_index");
      if (error) throw error;
      res.json(Array.isArray(data) ? data : []);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.get("/api/categories/:id/subcategories", async (req, res) => {
    try {
      const { data, error } = await supabase.from("subcategories").select("*").eq("category_id", req.params.id).eq("active", true).order("order_index");
      if (error) throw error;
      res.json(Array.isArray(data) ? data : []);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.get("/api/subcategories", async (req, res) => {
    try {
      const { data, error } = await supabase.from("subcategories").select("*").eq("active", true).order("order_index");
      if (error) throw error;
      res.json(Array.isArray(data) ? data : []);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.get("/api/subcategories/:id/products", async (req, res) => {
    try {
      const { data, error } = await supabase.from("products").select("*").eq("subcategory_id", req.params.id).eq("available", true);
      if (error) throw error;
      res.json(Array.isArray(data) ? data : []);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  // All products for admin (with optional subId filter)
  app.get("/api/products", async (req, res) => {
    try {
      const { subId, all } = req.query as any;
      let query = supabase.from("products").select("*, subcategories(name, categories(name))");
      if (subId) query = query.eq("subcategory_id", subId);
      else if (!all) query = query.eq("available", true);
      const { data, error } = await query.order("id", { ascending: false });
      if (error) throw error;
      res.json(Array.isArray(data) ? data : []);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  // [FIX] أُضيف adminAuth — كان مكشوفاً للعموم بدون حماية
  app.get("/api/admin/products-all", adminAuth, async (req, res) => {
    try {
      const { data, error } = await supabase.from("products").select("*, subcategories(name, category_id, categories(name))").order("id", { ascending: false });
      if (error) throw error;
      res.json(Array.isArray(data) ? data : []);
    } catch (e: any) {
      safeError(res, e);
    }
  });


  app.get("/api/subcategories/:id/sub-sub-categories", async (req, res) => {
    try {
      const { data, error } = await supabase.from("sub_sub_categories").select("*").eq("subcategory_id", req.params.id).eq("active", true).order("order_index");
      if (error) throw error;
      res.json(Array.isArray(data) ? data : []);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.get("/api/sub-sub-categories", async (req, res) => {
    try {
      const { data, error } = await supabase.from("sub_sub_categories").select("*").eq("active", true).order("order_index");
      if (error) throw error;
      res.json(Array.isArray(data) ? data : []);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.get("/api/sub-sub-categories/:id/products", async (req, res) => {
    try {
      const { data, error } = await supabase.from("products").select("*").eq("sub_sub_category_id", req.params.id).eq("available", true);
      if (error) throw error;
      res.json(Array.isArray(data) ? data : []);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.get("/api/banners", async (req, res) => {
    try {
      const { data, error } = await supabase.from("banners").select("*").order("order_index");
      if (error) throw error;
      res.json(Array.isArray(data) ? data : []);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.get("/api/offers", async (req, res) => {
    try {
      const { data, error } = await supabase.from("offers").select("*").eq("active", true).order("created_at", { ascending: false });
      if (error) throw error;
      res.json(Array.isArray(data) ? data : []);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.get("/api/payment-methods", async (req, res) => {
    try {
      const { data, error } = await supabase.from("payment_methods").select("*").eq("active", true);
      if (error) throw error;
      res.json(Array.isArray(data) ? data : []);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  // =================== AUTH ===================

  // STEP 1: Send OTP for email verification before creating account
  app.post("/api/auth/register", authLimiter, async (req, res) => {
    const { name, email, password, phone, referralCode } = req.body;
    // ── Validation صارم ──
    if (!isValidName(name))     return res.status(400).json({ error: "الاسم يجب أن يكون بين 2 و60 حرف" });
    if (!isValidEmail(email))   return res.status(400).json({ error: "البريد الإلكتروني غير صحيح" });
    if (!isValidPassword(password)) return res.status(400).json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" });
    if (phone && !isValidPhone(phone)) return res.status(400).json({ error: "رقم الهاتف غير صحيح (أرقام فقط)" });
    if (referralCode && !isValidId(referralCode)) return res.status(400).json({ error: "رمز الإحالة غير صحيح" });
    try {
      // Check email not already registered & verified
      const { data: existing } = await supabase.from("users").select("id, is_verified").eq("email", email).single();
      if (existing?.is_verified) return res.status(400).json({ error: "البريد الإلكتروني مستخدم مسبقاً" });

      // If unverified account exists, allow re-sending OTP
      // Save registration data temporarily (we'll create account after verification)
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Store pending user data in email_verifications as JSON in a temp field
      // Actually: create the user as unverified, send OTP
      let userId: number;
      if (existing && !existing.is_verified) {
        // Update existing unverified user
        await supabase.from("users").update({ name, password_hash: hashedPassword, phone }).eq("id", existing.id);
        userId = existing.id;
      } else {
        // Create new unverified user
        let referredById: number | null = null;
        if (referralCode) {
          const { data: referrer } = await supabase.from("users").select("id").eq("id", referralCode).single();
          if (referrer) referredById = referrer.id;
        }
        const { data: newUser, error } = await supabase.from("users").insert({
          name: sanitizeText(name, 60),
          email: email.toLowerCase().trim(),
          password_hash: hashedPassword,
          phone: phone ? phone.trim() : null,
          is_verified: false,
          referred_by_id: referredById
        }).select("id").single();
        if (error) throw error;
        await supabase.from("user_stats").insert({ user_id: newUser.id });
        userId = newUser.id;
      }

      const otp = await saveOtp(email, "verify");
      const sent = await sendOtpEmail(email, otp, "verify");
      // [FIX] لا نطبع قيمة OTP في الـ logs — خطر أمني
      console.log(`[REGISTER] OTP sent to ${email} | delivered=${sent}`);
      res.json({ success: true, requiresVerification: true, email });
    } catch (e: any) {
      safeError(res, e, "فشل التسجيل، يرجى المحاولة مجدداً");
    }
  });

  // STEP 2: Verify OTP and activate account
  app.post("/api/auth/verify-email", authLimiter, async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: "البيانات ناقصة" });
    try {
      const valid = await verifyOtp(email, code, "verify");
      if (!valid) return res.status(400).json({ error: "الرمز غير صحيح أو منتهي الصلاحية" });

      // Activate user
      const { data: user, error } = await supabase.from("users")
        .update({ is_verified: true })
        .eq("email", email)
        .select("*")
        .single();
      if (error || !user) return res.status(400).json({ error: "المستخدم غير موجود" });

      // Handle referral on first verification
      // [FIX] تحديث referral_count في users و user_stats معاً لضمان التزامن
      if (user.referred_by_id) {
        const { data: refUser } = await supabase.from("users").select("referral_count").eq("id", user.referred_by_id).single();
        const newRefCount = (refUser?.referral_count || 0) + 1;
        await supabase.from("users").update({ referral_count: newRefCount }).eq("id", user.referred_by_id);
        await supabase.from("user_stats").update({ referral_count: newRefCount }).eq("user_id", user.referred_by_id);
      }

      sendTelegramMessage(`👤 مستخدم جديد (مفعّل)\nالاسم: ${user.name}\nالإيميل: ${user.email}`);

      const { password_hash: _ph, ...userWithoutPass } = user;
      const { data: stats } = await supabase.from("user_stats").select("*").eq("user_id", user.id).single();
      const verifyToken = createUserToken(user.id);
      res.json({ ...userWithoutPass, stats, token: verifyToken });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  // Resend OTP — [FIX] أُضيف otpLimiter لمنع طلب OTP بشكل متكرر
  app.post("/api/auth/resend-otp", otpLimiter, async (req, res) => {
    const { email, type } = req.body; // type: 'verify' | 'reset'
    if (!email) return res.status(400).json({ error: "البريد مطلوب" });
    try {
      // Rate limit: max 1 OTP per 60 seconds
      const { data: last } = await supabase.from("email_verifications")
        .select("created_at")
        .eq("email", email).eq("type", type || "verify").eq("used", false)
        .order("created_at", { ascending: false }).limit(1).single();
      if (last && (Date.now() - new Date(last.created_at).getTime()) < 60000) {
        return res.status(429).json({ error: "انتظر دقيقة قبل إعادة الإرسال" });
      }
      const otp = await saveOtp(email, type || "verify");
      const sent = await sendOtpEmail(email, otp, type || "verify");
      // [FIX] لا نطبع قيمة OTP في الـ logs
      console.log(`[RESEND-OTP] ${email} type=${type} sent=${sent}`);
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  // Forgot password - send OTP
  app.post("/api/auth/forgot-password", forgotPassLimiter, async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "البريد مطلوب" });
    try {
      const { data: user } = await supabase.from("users").select("id").eq("email", email).single();
      if (!user) return res.status(404).json({ error: "لا يوجد حساب بهذا البريد" });
      const otp = await saveOtp(email, "reset");
      const sent = await sendOtpEmail(email, otp, "reset");
      // [FIX] لا نطبع قيمة OTP في الـ logs
      console.log(`[FORGOT-PWD] OTP sent to ${email} | delivered=${sent}`);
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  // Verify reset OTP — [FIX] أُضيف otpLimiter لمنع brute-force على OTP
  app.post("/api/auth/verify-reset-otp", otpLimiter, async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: "البيانات ناقصة" });
    try {
      const valid = await verifyOtp(email, code, "reset");
      if (!valid) return res.status(400).json({ error: "الرمز غير صحيح أو منتهي الصلاحية" });
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  // Reset password
  app.post("/api/auth/reset-password", authLimiter, async (req, res) => {
    const { email, newPassword } = req.body;
    if (!isValidEmail(email) || !newPassword) return res.status(400).json({ error: "البيانات ناقصة" });
    if (!isValidPassword(newPassword)) return res.status(400).json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" });
    try {
      // OTP was already verified in /verify-reset-otp step
      // Check that a verified OTP exists for this email within the last 15 minutes
      const { data: otpRecord } = await supabase.from("email_verifications")
        .select("id, expires_at, used, created_at")
        .eq("email", email).eq("type", "reset")
        .eq("used", true)
        .order("created_at", { ascending: false }).limit(1).single();
      if (!otpRecord) return res.status(400).json({ error: "لم يتم التحقق من البريد، ابدأ من جديد" });
      // تأكد أن التحقق تم خلال آخر 15 دقيقة
      const verifiedAt = new Date(otpRecord.created_at).getTime();
      if (Date.now() - verifiedAt > 15 * 60 * 1000) {
        return res.status(400).json({ error: "انتهت صلاحية جلسة إعادة التعيين، ابدأ من جديد" });
      }
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await supabase.from("users").update({ password_hash: hashedPassword }).eq("email", email);
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/auth/login", authLimiter, async (req, res) => {
    const { email, password } = req.body;
    if (!isValidEmail(email) || typeof password !== "string" || password.length < 1) {
      return res.status(400).json({ error: "بيانات الدخول غير صحيحة" });
    }
    // ── Account Lockout Check ──
    const lockStatus = checkAccountLockout(email);
    if (lockStatus.locked) {
      logSecurityEvent("account-lockout", req, email);
      return res.status(429).json({ error: `الحساب مقفل مؤقتاً بسبب محاولات فاشلة. انتظر ${Math.ceil((lockStatus.remainingSec||0)/60)} دقيقة.` });
    }

    const { data: user } = await supabase.from("users").select("*").eq("email", email.toLowerCase().trim()).single();

    if (user) {
      if (user.is_banned) return res.status(403).json({ error: "تم إيقاف حسابك. تواصل مع الدعم." });
      if (!user.is_verified) return res.status(403).json({ error: "يجب تفعيل حسابك أولاً عبر البريد الإلكتروني", requiresVerification: true, email: user.email });
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (isMatch) {
        const today = new Date().toISOString().split("T")[0];
        const { data: stats } = await supabase.from("user_stats").select("last_login_date, login_days_count").eq("user_id", user.id).single();
        if (stats && stats.last_login_date !== today) {
          await supabase.from("user_stats").update({ last_login_date: today, login_days_count: (stats.login_days_count || 0) + 1 }).eq("user_id", user.id);
        }

        const { password_hash, ...userWithoutPass } = user;
        let { data: fullStats } = await supabase.from("user_stats").select("*").eq("user_id", user.id).single();
        if (!fullStats) {
          await supabase.from("user_stats").insert({ user_id: user.id });
          const { data: newStats } = await supabase.from("user_stats").select("*").eq("user_id", user.id).single();
          fullStats = newStats;
        }
        const safeStats = fullStats || {
          user_id: user.id, total_orders_count: 0, referral_count: 0,
          login_days_count: 0, total_recharge_sum: 0, active_discount: 0,
          claimed_reward_index: -1, one_product_discount_percent: 0,
          has_flaming_theme: false, has_special_support: false,
          has_priority_orders: false, profile_badge: null, custom_theme_color: null
        };
        sendTelegramMessage(`🔑 تسجيل دخول\nالاسم: ${user.name}\nرقم الدخول: #${user.id}`);
        clearLoginAttempts(email); // reset عند النجاح
        const userToken = createUserToken(user.id);
        res.json({ ...userWithoutPass, stats: safeStats, token: userToken });
        return;
      } else {
        // كلمة مرور خاطئة — سجّل محاولة فاشلة
        recordFailedLogin(email);
        logSecurityEvent("failed-login", req, email);
      }
    } else {
      // مستخدم غير موجود — سجّل أيضاً لمنع User Enumeration
      recordFailedLogin(email);
    }
    // رسالة موحدة تمنع معرفة إذا كان البريد مسجلاً
    res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
  });

  // =================== USER ROUTES ===================

  app.get("/api/user/:id", authenticate, async (req, res) => {
    try {
      // المستخدم يقدر يشوف بياناته فقط
      if (String((req as any).userId) !== String(req.params.id)) {
        return res.status(403).json({ error: "ممنوع: لا يمكنك الوصول لبيانات مستخدم آخر" });
      }
      if (!isValidId(req.params.id)) return res.status(400).json({ error: "معرف غير صحيح" });
      const { data: user, error } = await supabase.from("users").select("*").eq("id", req.params.id).single();
      if (error) throw error;
      if (!user) return res.status(404).json({ error: "User not found" });
      const { password_hash, ...userWithoutPass } = user;
      let { data: stats } = await supabase.from("user_stats").select("*").eq("user_id", user.id).single();
      if (!stats) {
        await supabase.from("user_stats").insert({ user_id: user.id });
        const { data: newStats } = await supabase.from("user_stats").select("*").eq("user_id", user.id).single();
        stats = newStats;
      }
      const safeStats = stats || { user_id: user.id, total_orders_count: 0, referral_count: 0, login_days_count: 0, total_recharge_sum: 0, active_discount: 0, claimed_reward_index: -1, one_product_discount_percent: 0, has_flaming_theme: false, has_special_support: false, has_priority_orders: false, profile_badge: null, custom_theme_color: null };
      res.json({ ...userWithoutPass, stats: safeStats });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/user/:userId/avatar", authenticate, async (req, res) => {
    try {
      if (String((req as any).userId) !== String(req.params.userId)) {
        return res.status(403).json({ error: "ممنوع" });
      }
      const { avatarUrl } = req.body;
      if (!isValidUrl(avatarUrl)) return res.status(400).json({ error: "رابط الصورة غير صحيح" });
      await supabase.from("users").update({ avatar_url: avatarUrl }).eq("id", req.params.userId);
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.patch("/api/user/:id/avatar", authenticate, async (req, res) => {
    try {
      if (String((req as any).userId) !== String(req.params.id)) {
        return res.status(403).json({ error: "ممنوع" });
      }
      const { avatar_url } = req.body;
      if (!isValidUrl(avatar_url)) return res.status(400).json({ error: "رابط الصورة غير صحيح" });
      await supabase.from("users").update({ avatar_url }).eq("id", req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/user/update", authenticate, async (req, res) => {
    try {
      // userId يؤخذ من الـ JWT فقط — المستخدم لا يقدر يعدل حساب آخر
      const userId = (req as any).userId;
      const { name, phone, password } = req.body;

      // Validation صارم
      if (name !== undefined && !isValidName(name)) {
        return res.status(400).json({ error: "الاسم يجب أن يكون بين 2 و60 حرف بدون رموز HTML" });
      }
      if (phone !== undefined && phone !== "" && !isValidPhone(phone)) {
        return res.status(400).json({ error: "رقم الهاتف غير صحيح — أرقام فقط (7-20 رقم)" });
      }
      if (password !== undefined && password.trim().length > 0 && !isValidPassword(password)) {
        return res.status(400).json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" });
      }

      const updateData: any = {};
      if (name    !== undefined) updateData.name  = sanitizeText(name, 60);
      if (phone   !== undefined) updateData.phone = phone.trim();
      if (password && password.trim().length > 0) {
        updateData.password_hash = await bcrypt.hash(password, 12);
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "لا توجد بيانات للتحديث" });
      }

      await supabase.from("users").update(updateData).eq("id", userId);
      const { data: updatedUser } = await supabase
        .from("users")
        .select("*, user_stats(*)")
        .eq("id", userId)
        .single();
      if (updatedUser) {
        const { password_hash: _ph, ...safeUser } = updatedUser as any;
        const stats = Array.isArray(safeUser.user_stats) ? safeUser.user_stats[0] : safeUser.user_stats;
        delete safeUser.user_stats;
        res.json({ ...safeUser, stats });
      } else {
        res.json({ success: true });
      }
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/user/unlink-telegram", authenticate, async (req, res) => {
    try {
      const userId = (req as any).userId;
      await supabase.from("users").update({ telegram_chat_id: null }).eq("id", userId);
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/user/generate-linking-code", authenticate, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const code = crypto.randomInt(100000, 999999).toString(); // [FIX] crypto بدلاً من Math.random
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const { error } = await supabase.from("telegram_linking_codes").insert({ user_id: userId, code, expires_at: expiresAt });
      if (error) throw error;
      res.json({ code });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/user/update-theme", authenticate, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const { color } = req.body;
      if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
        return res.status(400).json({ error: "لون غير صحيح (استخدم HEX مثل #FF0000)" });
      }
      await supabase.from("user_stats").update({ custom_theme_color: color || null }).eq("user_id", userId);
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  // =================== REFERRALS ===================

  app.get("/api/referrals/stats/:userId", authenticate, async (req, res) => {
    if (String((req as any).userId) !== String(req.params.userId)) {
      return res.status(403).json({ error: "ممنوع" });
    }
    try {
      // [FIX] إضافة order بالتاريخ — الأحدث أولاً (كما في النسخة القديمة)
      const { data: referrals, error } = await supabase
        .from("users")
        .select("id, name, created_at")
        .eq("referred_by_id", req.params.userId)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const actualCount = referrals?.length || 0;

      // [FIX] تحديث referral_count في users و user_stats معاً للتزامن
      await supabase.from("users").update({ referral_count: actualCount }).eq("id", req.params.userId);
      await supabase.from("user_stats").update({ referral_count: actualCount }).eq("user_id", req.params.userId);

      res.json({ count: actualCount, referrals: referrals || [] });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  // =================== NOTIFICATIONS ===================

  app.get("/api/notifications/:userId", authenticate, async (req, res) => {
    if (String((req as any).userId) !== String(req.params.userId)) {
      return res.status(403).json({ error: "ممنوع" });
    }
    try {
      const { data, error } = await supabase.from("notifications").select("*")
        .or(`user_id.eq.${req.params.userId},user_id.is.null`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      res.json(Array.isArray(data) ? data : []);
    } catch (e: any) {
      res.json([]); // always array
    }
  });

  app.post("/api/notifications/mark-read", authenticate, async (req, res) => {
    try {
      const { notificationId } = req.body;
      if (!isValidId(notificationId)) return res.status(400).json({ error: "معرف غير صحيح" });
      // تأكد أن الإشعار يخص المستخدم
      const userId = (req as any).userId;
      await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId).eq("user_id", userId);
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  // =================== PUSH SUBSCRIPTIONS ===================

  app.get("/api/push/key", (req, res) => {
    res.json({ publicKey: vapidKeys.publicKey });
  });

  app.post("/api/push/subscribe", authenticate, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const { subscription } = req.body;
      const subStr = JSON.stringify(subscription);
      const { data: existing } = await supabase.from("push_subscriptions").select("id").eq("user_id", userId).eq("subscription", subStr).single();
      if (!existing) {
        await supabase.from("push_subscriptions").insert({ user_id: userId, subscription: subStr });
      }
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  // =================== ORDERS ===================

  app.post("/api/orders", authenticate, orderLimiter, async (req, res) => {
    try {
      // userId يؤخذ من JWT فقط
      const userId = (req as any).userId;
      const { productId, quantity, extraData } = req.body;

      // Validation
      if (!isValidId(productId))   return res.status(400).json({ error: "معرف المنتج غير صحيح" });
      const safeQty = Math.floor(Number(quantity));
      if (!Number.isInteger(safeQty) || safeQty < 1) return res.status(400).json({ error: "الكمية غير صحيحة" });

      const { data: user, error: uErr } = await supabase.from("users").select("*").eq("id", userId).single();
      if (uErr) throw uErr;
      const { data: product, error: pErr } = await supabase.from("products").select("*").eq("id", productId).single();
      if (pErr) throw pErr;

      // التحقق من الكمية باستخدام حدود المنتج الفعلية
      const productMaxQty = product?.max_quantity || 100_000;
      const productMinQty = product?.min_quantity || 1;
      if (safeQty < productMinQty) return res.status(400).json({ error: `أقل كمية مسموح بها: ${productMinQty}` });
      if (safeQty > productMaxQty) return res.status(400).json({ error: `أكبر كمية مسموح بها: ${productMaxQty}` });

      // فحص الطلبات المكررة (نفس البيانات خلال 10 ثوانٍ)
      const playerIdForDedup = (extraData?.playerId || extraData?.input || "").toString().trim();
      if (isDuplicateOrder(String(userId), String(productId), safeQty, playerIdForDedup)) {
        return res.status(429).json({ error: "طلب مكرر — يرجى الانتظار قليلاً قبل المحاولة مجدداً" });
      }

      if (!user || !product) return res.status(404).json({ error: "Not found" });
      // تحقق من أن المستخدم لم يُحظر
      if (user.is_banned || user.is_blocked) {
        logSecurityEvent("banned-user-order", req, `userId:${userId}`);
        return res.status(403).json({ error: "حسابك موقوف" });
      }

      // حساب السعر الصحيح حسب نوع المتجر
      const unitPrice = product.store_type === 'quantities' || product.store_type === 'external_api'
        ? (parseFloat(product.price_per_unit) || parseFloat(product.price) || 0)
        : (parseFloat(product.price) || 0);
      let total = unitPrice * (Number(quantity) || 1);

      const { data: stats } = await supabase.from("user_stats").select("*").eq("user_id", userId).single();
      const { data: vipDiscountSetting } = await supabase.from("settings").select("value").eq("key", "vip_discount").single();
      const vipDiscountRate = vipDiscountSetting ? parseFloat(vipDiscountSetting.value) || 5 : 5;
      let discountPercent = user.is_vip ? vipDiscountRate : 0;

      if (stats) {
        // خصم مدى الحياة (الهدف 6: 3%، الهدف 7: 5%)
        if (stats.lifetime_discount && stats.lifetime_discount > 0) {
          discountPercent = Math.max(discountPercent, stats.lifetime_discount);
        }
        if (stats.discount_expires_at && new Date(stats.discount_expires_at) > new Date()) {
          discountPercent = Math.max(discountPercent, stats.active_discount || 0);
        }
        if (stats.one_product_discount_percent > 0) {
          discountPercent = Math.max(discountPercent, stats.one_product_discount_percent);
          await supabase.from("user_stats").update({ one_product_discount_percent: 0 }).eq("user_id", userId);
        }
      }

      if (discountPercent > 0) total *= (1 - discountPercent / 100);
      if (user.balance < total) return res.status(400).json({ error: "Insufficient balance" });

      // =================== CHECK ORDER MODE (AUTO vs MANUAL) ===================
      // نقرأ وضع معالجة الطلبات من الإعدادات
      const { data: orderModeSetting } = await supabase.from("settings").select("value").eq("key", "order_processing_mode").single();
      const orderMode = orderModeSetting?.value || "manual"; // 'auto' or 'manual'

      let ahminixOrderId: string | null = null;
      let ahminixOrderStatus: string | null = null;
      let ahminixReplayApi: any[] = [];
      let ahminixOrderUuid: string | null = null;

      // =================== EXTERNAL API ORDER ===================
      const hasExternalId = product.external_id && String(product.external_id).trim() !== "";
      if (hasExternalId && orderMode === 'auto') {
        if (!AHMINIX_TOKEN) {
          return res.status(500).json({ error: "AHMINIX_API_TOKEN غير مضبوط في المتغيرات البيئية" });
        }

        let playerId = "";
        if (product.requires_input) {
          playerId = (
            extraData?.playerId ||
            extraData?.input ||
            extraData?.userId ||
            extraData?.gameId ||
            extraData?.accountId ||
            ""
          ).toString().trim();
          if (!playerId) {
            return res.status(400).json({ error: "هذا المنتج يتطلب معرف اللاعب (Player ID)" });
          }
        } else {
          playerId = (
            extraData?.playerId ||
            extraData?.input ||
            user.phone ||
            String(user.id)
          ).toString().trim();
        }

        // توليد UUID v4 فريد — نحفظه في outer scope
        ahminixOrderUuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
        });
        const qty = Math.max(1, Number(quantity) || 1);

        console.log(`[API] Creating order: ext_id=${product.external_id}, qty=${qty}, playerId="${playerId}", uuid=${ahminixOrderUuid}`);

        const ahminixRes = await ahminixCreateOrder(
          String(product.external_id).trim(),
          qty,
          playerId,
          ahminixOrderUuid
        );

        if (!ahminixRes || ahminixRes.status !== "OK") {
          const errorCodes: Record<number, string> = {
            120: "رمز API مطلوب",
            121: "خطأ في رمز API",
            122: "غير مسموح باستخدام API",
            123: "عنوان IP غير مسموح به",
            130: "الموقع قيد الصيانة",
            100: "رصيد API غير كافٍ",
            105: "الكمية غير متوفرة",
            106: "الكمية غير مسموح بها",
            112: "الكمية صغيرة جداً",
            113: "الكمية كبيرة جداً",
            114: "معلمة غير صالحة - تحقق من بيانات اللاعب أو الـ Player ID",
            500: "خطأ غير معروف"
          };
          const code = ahminixRes?.code || ahminixRes?.error_code;
          const errMsg = (code && errorCodes[code]) || ahminixRes?.message || ahminixRes?.error || "فشل الطلب لدى المورد";
          console.error("[API] Order failed:", JSON.stringify(ahminixRes));
          return res.status(400).json({ error: `فشل الطلب: ${errMsg}`, details: ahminixRes });
        } else {
          ahminixOrderId   = String(ahminixRes.data?.order_id || ahminixOrderUuid);
          ahminixOrderStatus = ahminixRes.data?.status || "processing";
          ahminixReplayApi = normalizeReplayApi(ahminixRes.data?.replay_api);
          console.log(`[API] Order created: id=${ahminixOrderId}, uuid=${ahminixOrderUuid}, status=${ahminixOrderStatus}, replay=${ahminixReplayApi.length}`);
        }
      }
      // ====================================================================

      // تحديد حالة الطلب بناءً على الوضع والنتيجة
      let initialStatus: string;
      if (hasExternalId && orderMode === 'auto') {
        initialStatus = ahminixOrderStatus === 'accept' ? 'completed' : 'processing';
      } else if (hasExternalId && orderMode === 'manual') {
        initialStatus = 'pending_admin';
      } else if (product.store_type === 'external_api') {
        initialStatus = orderMode === 'auto' ? 'processing' : 'pending_admin';
      } else {
        initialStatus = 'pending';
      }

      // حفظ الطلب في قاعدة البيانات المحلية
      const metaData: any = {
        ...extraData,
        order_mode: orderMode,
        product_name: product.name,
        ...(ahminixOrderId ? {
          ahminix_order_id: ahminixOrderId,
          ahminix_order_uuid: ahminixOrderUuid || ahminixOrderId,
          ahminix_status: ahminixOrderStatus,
          ahminix_replay: ahminixReplayApi
        } : {})
      };

      const { data: order, error: orderErr } = await supabase.from("orders").insert({
        user_id: userId,
        total_amount: total,
        meta: JSON.stringify(metaData),
        status: initialStatus
      }).select().single();
      if (orderErr) throw orderErr;

      await supabase.from("order_items").insert({
        order_id: order.id,
        product_id: productId,
        price_at_purchase: product.price,
        quantity,
        extra_data: JSON.stringify(metaData)
      });

      // خصم الرصيد
      await supabase.from("users").update({ balance: user.balance - total }).eq("id", userId);

      // عمولة الإحالة (ديناميكية من الإعدادات)
      if (user.referred_by_id) {
        const { data: refCommSetting2 } = await supabase.from("settings").select("value").eq("key", "referral_commission").single();
        const refCommRate2 = parseFloat(refCommSetting2?.value || "5") / 100;
        const commission = total * refCommRate2;
        await supabase.rpc("increment_balance", { user_id_param: user.referred_by_id, amount_param: commission });
      }

      // إشعار تلجرام
      const orderTypeLabel = orderMode === 'auto' ? '🌐 طلب تلقائي' : '⏳ طلب ينتظر الموافقة';
      const externalInfo = ahminixOrderId ? `\nAPI Order ID: ${ahminixOrderId}\nStatus: ${ahminixOrderStatus}` : '';
      sendTelegramMessage(`${orderTypeLabel} #ORD${order.id}\nالاسم: ${user.name}\nProduct: ${product.name}\nTotal: ${total}${externalInfo}`);

      const adminChatId = process.env.TELEGRAM_CHAT_ID;
      if (adminChatId && adminBot) {
        adminBot.sendMessage(adminChatId, `${orderTypeLabel} #ORD${order.id}\nالاسم: ${user.name}\nرقم الدخول: #${user.id}\nProduct: ${product.name}\nTotal: ${total}\nData: ${JSON.stringify(metaData)}${externalInfo}${orderMode === 'manual' ? '\n\n⚠️ يحتاج موافقتك من لوحة التحكم' : ''}`);
      }

      // إشعار فوري للمستخدم إذا تم قبول الطلب لحظياً
      if (ahminixOrderStatus === 'accept' && ahminixReplayApi?.length > 0) {
        const { data: userTg } = await supabase.from("users").select("telegram_chat_id").eq("id", userId).single();
        if (userTg?.telegram_chat_id && userBot) {
          const codes = ahminixReplayApi.filter(Boolean);
          userBot.sendMessage(
            userTg.telegram_chat_id,
            `✅ تم تنفيذ طلبك فوراً!\n\nالطلب: #ORD${order.id}\nالمنتج: ${product.name}\n\n🎁 بيانات التفعيل:\n${codes.join("\n")}`
          ).catch(() => {});
        }
      }

      res.json({
        success: true,
        orderId: order.id,
        orderMode,
        pendingAdmin: initialStatus === 'pending_admin',
        ...(ahminixOrderId ? {
          externalOrderId: ahminixOrderId,
          externalStatus: ahminixOrderStatus,
          replayApi: ahminixReplayApi
        } : {})
      });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  // تتبع حالة طلب خارجي للمستخدم (بدون صلاحية أدمن)
  app.get("/api/orders/check-external/:orderId", authenticate, async (req, res) => {
    try {
      if (!AHMINIX_TOKEN) return res.status(400).json({ error: "API غير مضبوط" });
      const orderId = req.params.orderId;
      const userId = (req as any).userId;

      // جلب طلبات المستخدم قيد المعالجة (processing أو pending)
      const { data: orders } = await supabase
        .from("orders")
        .select("id, meta, total_amount")
        .eq("user_id", userId)
        .in("status", ["processing", "pending"]);

      // نجد الطلب المطابق سواء بـ numeric ID أو UUID
      const matchOrder = (orders || []).find((o: any) => {
        try {
          const m = JSON.parse(o.meta || "{}");
          return String(m.ahminix_order_id) === String(orderId) ||
                 String(m.ahminix_order_uuid) === String(orderId);
        } catch { return false; }
      });

      if (!matchOrder) return res.status(403).json({ error: "غير مسموح أو الطلب غير موجود" });

      const meta = JSON.parse(matchOrder.meta || "{}");
      const ahminixId   = meta.ahminix_order_id;
      const ahminixUuid = meta.ahminix_order_uuid;

      // نحاول بالـ UUID أولاً ثم الـ numeric ID
      let checkRes: any = null;
      if (ahminixUuid && ahminixUuid !== ahminixId) {
        checkRes = await ahminixCheckOrder(ahminixUuid, true);
        if (checkRes?.status !== "OK" || !checkRes?.data?.[0]) checkRes = null;
      }
      if (!checkRes && ahminixId) {
        const isUuid = String(ahminixId).includes("-");
        checkRes = await ahminixCheckOrder(ahminixId, isUuid);
      }

      if (!checkRes?.data?.[0]) return res.json({ status: "processing", replay_api: [] });

      const ext = checkRes.data[0];
      const normalizedReplay = normalizeReplayApi(ext.replay_api);

      // إذا اكتمل → حدّث قاعدة البيانات
      if (isAhminixFinalStatus(ext.status)) {
        const newStatus = mapAhminixStatus(ext.status);
        const updatedMeta = {
          ...meta,
          ahminix_status: ext.status,
          ahminix_replay: normalizedReplay,
          completed_at: new Date().toISOString()
        };
        await supabase.from("orders").update({
          status: newStatus,
          meta: JSON.stringify(updatedMeta)
        }).eq("id", matchOrder.id);

        if (newStatus === "cancelled") {
          await supabase.rpc("increment_balance", {
            user_id_param: userId,
            amount_param: matchOrder.total_amount
          });
        }

        // إشعار push للمستخدم
        const notifTitle = newStatus === "completed" ? "✅ تم تنفيذ طلبك!" : "❌ تم إلغاء طلبك";
        const notifBody = newStatus === "completed"
          ? `تم تنفيذ طلب ${meta?.product_name || ""} بنجاح`
          : `تم إلغاء الطلب وإعادة رصيدك`;
        await sendPushNotification(String(userId), notifTitle, notifBody, "/");
        await supabase.from("notifications").insert({
          user_id: userId, title: notifTitle, message: notifBody,
          type: newStatus === "completed" ? "success" : "warning"
        });
      }

      res.json({ status: ext.status, replay_api: normalizedReplay });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.get("/api/orders/user/:userId", authenticate, async (req, res) => {
    if (String((req as any).userId) !== String(req.params.userId)) {
      return res.status(403).json({ error: "ممنوع" });
    }
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items(
            *,
            products(
              name, image_url, store_type,
              subcategories(
                name,
                categories(name)
              )
            )
          )
        `)
        .eq("user_id", req.params.userId)
        .order("created_at", { ascending: false });
      if (error) throw error;

      // flatten to add product_name, category_name, subcategory_name at top level
      const enriched = (data || []).map((order: any) => {
        const item = order.order_items?.[0];
        const product = item?.products;
        return {
          ...order,
          product_name: product?.name || "منتج محذوف",
          category_name: product?.subcategories?.categories?.name || null,
          subcategory_name: product?.subcategories?.name || null,
        };
      });

      res.json(enriched);
    } catch (e: any) {
      res.json([]);
    }
  });

  // =================== AHMINIX ADMIN ENDPOINTS ===================

  /**
   * GET /api/admin/ahminix/profile
   * يجلب رصيد ومعلومات حساب Ahminix
   */
  app.get("/api/admin/ahminix/profile", adminAuth, async (req, res) => {
    try {
      if (!AHMINIX_TOKEN) return res.status(400).json({ error: "AHMINIX_API_TOKEN غير مضبوط في .env" });
      const data = await ahminixGetProfile();
      res.json(data);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  /**
   * GET /api/admin/ahminix/products
   * يجلب كل المنتجات من Ahminix API
   */
  app.get("/api/admin/ahminix/products", adminAuth, async (req, res) => {
    try {
      if (!AHMINIX_TOKEN) return res.status(400).json({ error: "AHMINIX_API_TOKEN غير مضبوط في .env" });
      const products = await ahminixGetProducts();
      res.json({ status: "OK", count: products.length, products });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  /**
   * POST /api/admin/ahminix/sync
   * يزامن منتجات Ahminix إلى قاعدة البيانات المحلية
   * Body: { subcategoryId, productIds?: number[], markupPercent?: number }
   *   subcategoryId: القسم الفرعي الذي سيُضاف إليه المنتجات
   *   productIds: قائمة بمعرفات Ahminix للمنتجات المراد استيرادها (اختياري - إذا فارغة يستورد الكل)
   *   markupPercent: نسبة الربح تضاف على سعر Ahminix (افتراضي 0)
   */
  app.post("/api/admin/ahminix/sync", adminAuth, async (req, res) => {
    try {
      if (!AHMINIX_TOKEN) return res.status(400).json({ error: "AHMINIX_API_TOKEN غير مضبوط في .env" });

      const { subcategoryId, subSubCategoryId, productIds, markupPercent = 0, productOverrides = [], globalImageUrl = "" } = req.body;
      if (!subcategoryId) return res.status(400).json({ error: "subcategoryId مطلوب" });

      // بناء خريطة التخصيصات (سعر مخصص + صورة مخصصة لكل منتج)
      const overridesMap: Record<number, { price?: string; image_url?: string }> = {};
      for (const o of productOverrides) {
        if (o.id) overridesMap[o.id] = o;
      }

      // جلب منتجات API
      const ahminixProducts = await ahminixGetProducts();
      if (!ahminixProducts.length) return res.status(400).json({ error: "لم يتم جلب أي منتجات" });

      const toSync = productIds?.length
        ? ahminixProducts.filter((p: any) => productIds.includes(p.id))
        : ahminixProducts;

      let added = 0, updated = 0, skipped = 0;
      const errors: string[] = [];

      for (const ap of toSync) {
        try {
          const override = overridesMap[ap.id] || {};
          const basePrice = parseFloat(ap.price) || 0;

          // السعر: مخصص يدوياً أو محسوب بنسبة الربح
          const finalPrice = override.price && parseFloat(override.price) > 0
            ? parseFloat(parseFloat(override.price).toFixed(6))
            : parseFloat((basePrice * (1 + markupPercent / 100)).toFixed(6));

          const { data: existing } = await supabase
            .from("products")
            .select("id")
            .eq("external_id", String(ap.id))
            .maybeSingle();

          const productData: any = {
            name: ap.name,
            price: finalPrice,
            price_per_unit: finalPrice,
            description: ap.category_name || "",
            store_type: "external_api",
            requires_input: ap.params && ap.params.length > 0,
            available: ap.available !== false,
            external_id: String(ap.id),
            subcategory_id: subcategoryId,
            sub_sub_category_id: subSubCategoryId ? subSubCategoryId : null,
            min_quantity: ap.qty_values?.min || 1,
            max_quantity: ap.qty_values?.max || null,
            image_url: override.image_url || globalImageUrl || ""
          };

          if (existing) {
            const updateData: any = {
              name: productData.name,
              price: productData.price,
              price_per_unit: productData.price_per_unit,
              available: productData.available,
              min_quantity: productData.min_quantity,
              max_quantity: productData.max_quantity,
              subcategory_id: subcategoryId,
              sub_sub_category_id: subSubCategoryId ? subSubCategoryId : null
            };
            // تحديث الصورة إذا كانت مخصصة أو موحدة
            if (override.image_url) updateData.image_url = override.image_url;
            else if (globalImageUrl) updateData.image_url = globalImageUrl;
            await supabase.from("products").update(updateData).eq("id", existing.id);
            updated++;
          } else {
            // إضافة منتج جديد
            const { error: insErr } = await supabase.from("products").insert(productData);
            if (insErr) { errors.push(`${ap.name}: ${insErr.message}`); skipped++; }
            else added++;
          }
        } catch (e: any) {
          errors.push(`${ap.name}: ${e.message}`);
          skipped++;
        }
      }

      res.json({
        status: "OK",
        summary: { total: toSync.length, added, updated, skipped },
        errors: errors.length ? errors : undefined
      });
    } catch (e: any) {
      safeError(res, e);
    }
  });


  // =================== LEADERBOARD ===================

  /**
   * GET /api/leaderboard/:type
   * types: topup | referral | activity
   * Returns top 20 users for each category (lifetime, no prizes)
   */
  app.get("/api/leaderboard/:type", async (req, res) => {
    try {
      const { type } = req.params;

      if (type === "topup") {
        // أكثر الأشخاص شحناً للرصيد (إجمالي مدى الحياة)
        const { data, error } = await supabase
          .from("user_stats")
          .select("user_id, total_recharge_sum, profile_badge, users(name, avatar_url)")
          .order("total_recharge_sum", { ascending: false })
          .gt("total_recharge_sum", 0)
          .limit(20);
        if (error) throw error;
        const result = (data || []).map((row: any, i: number) => ({
          rank: i + 1,
          user_id: row.user_id,
          name: row.users?.name || "مجهول",
          avatar_url: row.users?.avatar_url || "",
          badge: row.profile_badge,
          value: `${parseFloat(row.total_recharge_sum || 0).toFixed(2)}`,
          unit: "$"
        }));
        return res.json(result);

      } else if (type === "referral") {
        // أكثر الأشخاص إحالةً (عدد المستخدمين المُحالين)
        const { data, error } = await supabase
          .from("users")
          .select("id, name, avatar_url, referral_count, user_stats(profile_badge)")
          .order("referral_count", { ascending: false })
          .gt("referral_count", 0)
          .limit(20);
        if (error) throw error;
        const result = (data || []).map((row: any, i: number) => ({
          rank: i + 1,
          user_id: row.id,
          name: row.name || "مجهول",
          avatar_url: row.avatar_url || "",
          badge: row.user_stats?.profile_badge,
          value: `${row.referral_count || 0}`,
          unit: "إحالة"
        }));
        return res.json(result);

      } else if (type === "activity") {
        // أكثر الأشخاص نشاطاً — حسب عدد الطلبات المكتملة فعلياً
        const { data: ordersData, error } = await supabase
          .from("orders")
          .select("user_id")
          .eq("status", "completed");
        if (error) throw error;

        // نحسب عدد الطلبات المكتملة لكل مستخدم
        const countMap = new Map<string, number>();
        for (const row of ordersData || []) {
          const uid = String(row.user_id);
          countMap.set(uid, (countMap.get(uid) || 0) + 1);
        }

        // نرتب تنازلياً ونأخذ أعلى 20
        const sorted = [...countMap.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20);

        if (sorted.length === 0) return res.json([]);

        // نجلب بيانات المستخدمين
        const userIds = sorted.map(([uid]) => uid);
        const { data: usersData } = await supabase
          .from("users")
          .select("id, name, avatar_url, user_stats(profile_badge)")
          .in("id", userIds);

        const usersMap = new Map((usersData || []).map((u: any) => [String(u.id), u]));

        const result = sorted.map(([uid, completedCount], i) => {
          const u = usersMap.get(uid);
          return {
            rank: i + 1,
            user_id: uid,
            name: u?.name || "مجهول",
            avatar_url: u?.avatar_url || "",
            badge: u?.user_stats?.profile_badge,
            value: `${completedCount}`,
            unit: "طلب مكتمل"
          };
        });
        return res.json(result);

      } else {
        return res.status(400).json({ error: "نوع غير معروف" });
      }
    } catch (e: any) {
      safeError(res, e);
    }
  });

  /**
   * GET /api/admin/ahminix/check-order/:orderId
   * يتحقق من حالة طلب خارجي في Ahminix
   */
  app.get("/api/admin/ahminix/check-order/:orderId", adminAuth, async (req, res) => {
    try {
      if (!AHMINIX_TOKEN) return res.status(400).json({ error: "AHMINIX_API_TOKEN غير مضبوط في .env" });
      const { orderId } = req.params;
      const { uuid } = req.query;
      const data = await ahminixCheckOrder(orderId, uuid === "1");
      res.json(data);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  /**
   * POST /api/admin/ahminix/sync-order/:orderId
   * يُجبر تحديث طلب واحد من Ahminix بالـ DB order ID
   */
  app.post("/api/admin/ahminix/sync-order/:orderId", adminAuth, async (req, res) => {
    try {
      if (!AHMINIX_TOKEN) return res.status(400).json({ error: "AHMINIX_API_TOKEN غير مضبوط في .env" });
      const { data: order } = await supabase.from("orders").select("id, user_id, meta, status, total_amount").eq("id", req.params.orderId).single();
      if (!order) return res.status(404).json({ error: "الطلب غير موجود" });
      const meta = typeof order.meta === "string" ? JSON.parse(order.meta) : (order.meta || {});
      const ahminixId   = meta?.ahminix_order_id;
      const ahminixUuid = meta?.ahminix_order_uuid;
      if (!ahminixId && !ahminixUuid) return res.status(400).json({ error: "الطلب ليس خارجياً" });

      let checkRes: any = null;
      if (ahminixUuid && ahminixUuid !== String(ahminixId)) {
        checkRes = await ahminixCheckOrder(ahminixUuid, true);
        if (checkRes?.status !== "OK" || !checkRes?.data?.[0]) checkRes = null;
      }
      if (!checkRes && ahminixId) {
        const isUuid = String(ahminixId).includes("-");
        checkRes = await ahminixCheckOrder(ahminixId, isUuid);
      }
      if (!checkRes?.data?.[0]) return res.json({ status: "OK", message: "لا استجابة من API", raw: checkRes });

      const ext = checkRes.data[0];
      const normalizedReplay = normalizeReplayApi(ext.replay_api);
      const newStatus = mapAhminixStatus(ext.status);

      const updatedMeta = { ...meta, ahminix_status: ext.status, ahminix_replay: normalizedReplay, synced_at: new Date().toISOString() };
      await supabase.from("orders").update({ status: newStatus, meta: JSON.stringify(updatedMeta) }).eq("id", order.id);

      if (newStatus === "cancelled" && order.status !== "cancelled") {
        await supabase.rpc("increment_balance", { user_id_param: order.user_id, amount_param: order.total_amount });
      }
      if (order.user_id && newStatus !== order.status) {
        const notifTitle = newStatus === "completed" ? "✅ تم تنفيذ طلبك!" : newStatus === "cancelled" ? "❌ تم إلغاء طلبك" : "🔄 تحديث طلبك";
        const notifBody = newStatus === "completed" ? `تم تنفيذ طلب ${meta?.product_name || ""} بنجاح` : `تم إلغاء طلب ${meta?.product_name || ""} وإعادة رصيدك`;
        await supabase.from("notifications").insert({ user_id: order.user_id, title: notifTitle, message: notifBody, type: newStatus === "completed" ? "success" : "warning" });
      }

      res.json({ status: "OK", oldStatus: order.status, newStatus, ahminixStatus: ext.status, replay: normalizedReplay });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  /**
   * POST /api/admin/ahminix/refresh-orders
   * يحدّث حالة جميع الطلبات الخارجية المعلّقة (processing) من Ahminix
   */
  app.post("/api/admin/ahminix/refresh-orders", adminAuth, async (req, res) => {
    try {
      if (!AHMINIX_TOKEN) return res.status(400).json({ error: "AHMINIX_API_TOKEN غير مضبوط في .env" });

      // جلب كل الطلبات الخارجية غير المكتملة
      const { data: pendingOrders, error: fetchErr } = await supabase
        .from("orders")
        .select("id, user_id, meta, status, total_amount")
        .not("status", "in", "(completed,cancelled,failed,rejected)");

      if (fetchErr) throw fetchErr;
      // نُصفّي فقط الطلبات التي لها ahminix_order_id في الـ meta
      const externalOrders = (pendingOrders || []).filter((o: any) => {
        try {
          const m = typeof o.meta === "string" ? JSON.parse(o.meta) : (o.meta || {});
          return !!(m?.ahminix_order_id);
        } catch { return false; }
      });
      if (!externalOrders.length) return res.json({ status: "OK", message: "لا توجد طلبات خارجية معلقة", updated: 0 });

      let updated = 0;
      const results: any[] = [];

      for (const order of externalOrders) {
        try {
          const meta = typeof order.meta === "string" ? JSON.parse(order.meta) : order.meta;
          const ahminixId   = meta?.ahminix_order_id;
          const ahminixUuid = meta?.ahminix_order_uuid;
          if (!ahminixId) continue; // طلب محلي، تجاهل

          // نحاول بالـ UUID أولاً ثم الـ numeric ID (نفس منطق check-external)
          let checkRes: any = null;
          if (ahminixUuid && ahminixUuid !== String(ahminixId)) {
            checkRes = await ahminixCheckOrder(ahminixUuid, true);
            if (checkRes?.status !== "OK" || !checkRes?.data?.[0]) checkRes = null;
          }
          if (!checkRes) {
            const isUuid = String(ahminixId).includes("-");
            checkRes = await ahminixCheckOrder(ahminixId, isUuid);
          }

          if (checkRes?.status !== "OK" || !checkRes?.data?.[0]) continue;

          const externalOrder = checkRes.data[0];
          const rawReplay = externalOrder.replay_api;
          const normalizedReplay = (Array.isArray(rawReplay) ? rawReplay : rawReplay ? [rawReplay] : [])
            .filter(Boolean).map(String);

          const newStatus = mapAhminixStatus(externalOrder.status);

          if (newStatus !== order.status) {
            await supabase.from("orders").update({
              status: newStatus,
              meta: JSON.stringify({ ...meta, ahminix_status: externalOrder.status, ahminix_replay: normalizedReplay, completed_at: new Date().toISOString() })
            }).eq("id", order.id);

            // إعادة رصيد المستخدم إذا أُلغي
            if (newStatus === "cancelled") {
              await supabase.rpc("increment_balance", {
                user_id_param: order.user_id,
                amount_param: order.total_amount
              });
            }

            updated++;
            results.push({ orderId: order.id, ahminixId, oldStatus: order.status, newStatus, replayCount: normalizedReplay.length });
          } else {
            results.push({ orderId: order.id, ahminixId, status: newStatus, note: "no change" });
          }
        } catch (e: any) {
          results.push({ orderId: order.id, error: e.message });
        }
      }

      res.json({ status: "OK", updated, results });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  /**
   * GET /api/admin/ahminix/content/:categoryId
   * يجلب فئة ومنتجاتها من Ahminix (0 = كل الفئات)
   */
  app.get("/api/admin/ahminix/content/:categoryId", adminAuth, async (req, res) => {
    try {
      if (!AHMINIX_TOKEN) return res.status(400).json({ error: "AHMINIX_API_TOKEN غير مضبوط في .env" });
      const data = await ahminixGet(`/content/${req.params.categoryId}`);
      res.json(data);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  // =================== TRANSACTIONS ===================

  // Diagnostic route - test API Syria connection (admin only)
  app.get("/api/admin/test-apisyria", adminAuth, async (req, res) => {
    try {
      const { type, tx, gsm, account_address } = req.query as any;
      if (!APISYRIA_KEY) return res.json({ error: "APISYRIA_API_KEY غير موجود في المتغيرات البيئية" });
      
      // Test status first
      const status = await apisyriaRequest({ resource: "status" });
      if (!status?.success) return res.json({ step: "status_check", result: status });
      
      // If tx provided, try find_tx
      if (tx && type === "syriatel" && gsm) {
        const r7 = await apisyriaRequest({ resource: "syriatel", action: "find_tx", tx, gsm, period: "7" });
        const r30 = await apisyriaRequest({ resource: "syriatel", action: "find_tx", tx, gsm, period: "30" });
        return res.json({ status, r7, r30 });
      }
      if (tx && type === "shamcash" && account_address) {
        const r = await apisyriaRequest({ resource: "shamcash", action: "find_tx", tx, account_address });
        return res.json({ status, r });
      }
      
      // List accounts
      const accounts = await apisyriaRequest({ resource: "accounts", action: "list" });
      res.json({ status, accounts });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  // Auto-verify transaction for Syriatel/ShamCash
  app.post("/api/transactions/verify-auto", authenticate, uploadLimiter, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const { paymentMethodId, amount, txNumber } = req.body;
      if (!paymentMethodId || !amount || !txNumber) {
        return res.status(400).json({ error: "بيانات ناقصة" });
      }
      if (!isValidId(paymentMethodId)) return res.status(400).json({ error: "طريقة دفع غير صحيحة" });
      if (!isValidAmount(amount, 0.01, 100000)) return res.status(400).json({ error: "المبلغ غير صحيح" });
      if (!isValidTxNumber(txNumber)) return res.status(400).json({ error: "رقم العملية غير صحيح (أحرف وأرقام فقط)" });

      const { data: method } = await supabase.from("payment_methods")
        .select("name, method_type, api_account, wallet_address, min_amount")
        .eq("id", paymentMethodId).single();

      if (!method || !["syriatel", "shamcash"].includes(method.method_type)) {
        return res.status(400).json({ error: "طريقة الدفع غير صحيحة" });
      }

      const numAmount = parseFloat(amount);
      if (numAmount < (method.min_amount || 0)) {
        return res.status(400).json({ error: `أقل مبلغ للشحن هو ${method.min_amount} $` });
      }

      // Check duplicate tx_number
      const { data: dup } = await supabase.from("transactions").select("id").eq("tx_number", txNumber).maybeSingle();
      if (dup) return res.status(400).json({ error: "رقم العملية مستخدم مسبقاً" });

      // Verify with API Syria
      let verified = false;
      let apiAmount = 0;
      let apiCurrency = "USD";
      let apiDebug = "";

      if (method.method_type === "syriatel") {
        const candidates = [method.api_account, method.wallet_address].filter(Boolean);
        for (const gsm of candidates) {
          const result = await verifySyriatelTx(txNumber, gsm);
          if (result.found) { verified = true; apiAmount = result.amount || 0; apiCurrency = "SYP"; break; }
          apiDebug = result.debug || "";
        }
      } else if (method.method_type === "shamcash") {
        const candidates = [method.api_account, method.wallet_address].filter(Boolean);
        for (const addr of candidates) {
          const result = await verifyShamCashTx(txNumber, addr);
          if (result.found) { verified = true; apiAmount = result.amount || 0; apiCurrency = result.currency || "SYP"; break; }
          apiDebug = result.debug || "";
        }
      }

      if (!verified) {
        console.log("[verify-auto] Not found. API debug:", apiDebug);
        return res.status(400).json({ 
          error: "لم يتم العثور على العملية. تأكد من رقم العملية أو انتظر قليلاً وأعد المحاولة."
        });
      }

      const { data: user } = await supabase.from("users").select("id, name, balance").eq("id", userId).single();
      if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });

      // Convert SYP → USD (120 SYP = 1 USD)
      const SYP_TO_USD_RATE = 120;
      const usdAmount = apiCurrency === "SYP"
        ? parseFloat((apiAmount / SYP_TO_USD_RATE).toFixed(4))
        : apiAmount;

      // Use the user-entered amount if USD, or the converted amount if SYP
      const finalUsdAmount = apiCurrency === "SYP" ? usdAmount : numAmount;

      // Insert transaction as approved directly
      const { data: tx, error: txErr } = await supabase.from("transactions").insert({
        user_id: userId,
        payment_method_id: paymentMethodId,
        amount: finalUsdAmount,
        tx_number: txNumber,
        status: "approved",
        note: `تحقق تلقائي - رقم العملية: ${txNumber} - المبلغ الأصلي: ${apiAmount} ${apiCurrency}`
      }).select().single();
      if (txErr) throw txErr;

      // Add balance to user
      const newBalance = parseFloat(((parseFloat(String(user.balance)) || 0) + finalUsdAmount).toFixed(4));
      await supabase.from("users").update({ balance: newBalance }).eq("id", userId);

      // Notify via Telegram
      const adminChatId = process.env.TELEGRAM_CHAT_ID;
      const amountLine = apiCurrency === "SYP"
        ? `المبلغ: ${apiAmount} ل.س (${finalUsdAmount}$)`
        : `المبلغ: ${finalUsdAmount}$`;
      const msg = `✅ شحن تلقائي تم\nالمستخدم: ${user.name}\nرقم الدخول: #${user.id}\n${amountLine}\nالطريقة: ${method.name}\nرقم العملية: ${txNumber}`;
      sendTelegramMessage(msg);
      if (adminChatId && adminBot) adminBot.sendMessage(adminChatId, msg);
      if (user?.id) {
        const { data: u } = await supabase.from("users").select("telegram_chat_id").eq("id", userId).single();
        if (u?.telegram_chat_id) userBot?.sendMessage(u.telegram_chat_id, `✅ تم شحن رصيدك بـ ${numAmount}$ عبر ${method.name} بنجاح!`);
      }

      res.json({ success: true, newBalance, addedUsd: finalUsdAmount, originalAmount: apiAmount, currency: apiCurrency });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/transactions/upload", authenticate, uploadLimiter, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const { paymentMethodId, amount, note, receiptImageUrl } = req.body;
      // Validation
      if (!isValidId(paymentMethodId)) return res.status(400).json({ error: "طريقة دفع غير صحيحة" });
      if (!isValidAmount(amount, 0.01, 100000)) return res.status(400).json({ error: "المبلغ يجب أن يكون رقماً موجباً" });
      if (note && typeof note === "string" && note.length > 300) return res.status(400).json({ error: "الملاحظة طويلة جداً (أقصاه 300 حرف)" });
      if (receiptImageUrl && !isValidUrl(receiptImageUrl)) return res.status(400).json({ error: "رابط الإيصال غير صحيح" });
      const { data: user } = await supabase.from("users").select("id, name").eq("id", userId).single();
      const { data: method } = await supabase.from("payment_methods").select("name").eq("id", paymentMethodId).single();

      const { data: pending } = await supabase.from("transactions").select("id", { count: "exact" }).eq("user_id", userId).eq("status", "pending");
      if ((pending?.length || 0) >= 2) {
        return res.status(400).json({ error: "لا يمكنك إرسال أكثر من مدفوعتين قيد المراجعة." });
      }

      const { data: tx, error: txErr } = await supabase.from("transactions").insert({
        user_id: userId,
        payment_method_id: paymentMethodId,
        amount,
        note,
        receipt_image_url: receiptImageUrl,
        status: "pending"
      }).select().single();
      if (txErr) throw txErr;

      sendTelegramMessage(`💳 شحن رصيد جديد\nالاسم: ${user?.name}\nرقم الدخول: #${user?.id}\nAmount: ${amount}\nMethod: ${method?.name}`);

      const adminChatId = process.env.TELEGRAM_CHAT_ID;
      if (adminChatId && adminBot) {
        const adminMsg = `💰 طلب شحن جديد! #TX${tx.id}\n\nالمستخدم: ${user?.name}\nالمبلغ: ${amount}$\nالطريقة: ${method?.name}\n\nرابط الإيصال: ${receiptImageUrl}`;
        adminBot.sendMessage(adminChatId, adminMsg, {
          reply_markup: {
            inline_keyboard: [
              [{ text: "✅ قبول", callback_data: `approve_tx_${tx.id}` }, { text: "❌ رفض", callback_data: `reject_tx_${tx.id}` }]
            ]
          }
        });
      }

      res.json({ success: true, transactionId: tx.id });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.get("/api/transactions/user/:userId", authenticate, async (req, res) => {
    if (String((req as any).userId) !== String(req.params.userId)) {
      return res.status(403).json({ error: "ممنوع" });
    }
    try {
      const { data, error } = await supabase.from("transactions").select("*, payment_methods(name)").eq("user_id", req.params.userId).order("created_at", { ascending: false });
      if (error) throw error;
      const mapped = (Array.isArray(data) ? data : []).map((t: any) => ({
        ...t,
        method_name: t.payment_methods?.name || t.method_name || "—"
      }));
      res.json(mapped);
    } catch (e: any) {
      res.json([]); // safe fallback
    }
  });

  // =================== REWARDS ===================

  app.post("/api/rewards/claim", authenticate, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const { rewardIndex, goalIndex } = req.body;
      const idx = rewardIndex ?? goalIndex;
      if (idx === undefined || idx === null || !Number.isInteger(Number(idx)) || Number(idx) < 0 || Number(idx) > 10) {
        return res.status(400).json({ error: "فهرس المكافأة غير صحيح" });
      }

      const { data: stats, error: sErr } = await supabase.from("user_stats").select("*").eq("user_id", userId).single();
      if (sErr || !stats) return res.status(404).json({ error: "User stats not found" });

      const goals = [5, 15, 30, 50, 100, 200, 500];

      if ((stats.claimed_reward_index ?? -1) >= idx) return res.status(400).json({ error: "Reward already claimed" });
      if (idx > 0 && (stats.claimed_reward_index ?? -1) < idx - 1) return res.status(400).json({ error: "Claim previous rewards first" });
      if ((stats.total_recharge_sum || 0) < goals[idx]) return res.status(400).json({ error: "Goal not reached yet" });

      await applyReward(userId, idx);

      await supabase.from("notifications").insert({
        user_id: userId,
        title: "🎁 تم استلام مكافأة",
        message: `مبروك! لقد حصلت على مكافأة الهدف رقم ${idx + 1}!`,
        type: "success"
      });

      // إرجاع stats المحدّثة فقط بدون رصيد
      const { data: updatedStats } = await supabase.from("user_stats").select("*").eq("user_id", userId).single();
      res.json({ success: true, stats: updatedStats });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  // =================== VOUCHERS ===================

  app.post("/api/vouchers/redeem", authenticate, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const { code } = req.body;
      if (!isValidVoucherCode(code)) return res.status(400).json({ error: "كود القسيمة غير صحيح (أحرف وأرقام فقط)" });
      const { data: voucher } = await supabase.from("vouchers").select("*").eq("code", code.trim().toUpperCase()).eq("active", true).single();
      if (!voucher) return res.status(404).json({ error: "Invalid or inactive voucher" });

      const { data: usage } = await supabase.from("voucher_uses").select("id").eq("voucher_id", voucher.id).eq("user_id", userId).single();
      if (usage) return res.status(400).json({ error: "Voucher already used" });

      if (voucher.used_count >= voucher.max_uses) return res.status(400).json({ error: "Voucher fully used" });

      await supabase.from("voucher_uses").insert({ voucher_id: voucher.id, user_id: userId });
      await supabase.from("vouchers").update({ used_count: voucher.used_count + 1 }).eq("id", voucher.id);
      await supabase.rpc("increment_balance", { user_id_param: userId, amount_param: voucher.amount });
      await supabase.from("user_stats").update({ vouchers_redeemed_count: supabase.rpc as any }).eq("user_id", userId);

      res.json({ success: true, amount: voucher.amount });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  // =================== CHAT ===================

  app.post("/api/chat/send", chatLimiter, async (req, res) => {
    try {
      const { user_id, guest_id, sender_role, content, image_url, type, rating } = req.body;
      // Validation
      if (sender_role && !["user","admin","guest"].includes(sender_role)) {
        return res.status(400).json({ error: "دور المرسل غير صحيح" });
      }
      if (content && typeof content === "string" && content.length > 2000) {
        return res.status(400).json({ error: "الرسالة طويلة جداً (أقصاه 2000 حرف)" });
      }
      if (image_url && !isValidUrl(image_url)) {
        return res.status(400).json({ error: "رابط الصورة غير صحيح" });
      }

      if (sender_role === "user" && user_id) {
        const { data: user } = await supabase.from("users").select("is_vip").eq("id", user_id).single();
        const { data: statsData } = await supabase.from("user_stats").select("claimed_reward_index").eq("user_id", user_id).single();

        if (!user?.is_vip) {
          let limit = 5;
          if (statsData) {
            if (statsData.claimed_reward_index >= 6) limit = 100;
            else if (statsData.claimed_reward_index >= 3) limit = 30;
          }

          const today = new Date().toISOString().split("T")[0];
          const { data: countData } = await supabase.from("daily_message_counts").select("count").eq("user_id", user_id).eq("date", today).single();
          const currentCount = countData?.count || 0;

          if (currentCount >= limit) return res.status(403).json({ error: `لقد وصلت للحد اليومي (${limit} رسالة).` });

          if (countData) {
            await supabase.from("daily_message_counts").update({ count: currentCount + 1 }).eq("user_id", user_id).eq("date", today);
          } else {
            await supabase.from("daily_message_counts").insert({ user_id, date: today, count: 1 });
          }
        }
      }

      const { data: msg, error } = await supabase.from("messages").insert({
        user_id, guest_id, sender_role, content, image_url, type: type || "text", rating
      }).select().single();
      if (error) throw error;

      if (sender_role === "user") {
        sendTelegramMessage(`💬 رسالة جديدة:\n${content || "[صورة]"}`);

        if (content) {
          const { data: autoReply } = await supabase.from("auto_replies").select("reply_text").ilike("trigger_text", content.trim()).limit(1).single();
          if (autoReply) {
            await supabase.from("messages").insert({
              user_id, guest_id, sender_role: "admin", content: autoReply.reply_text, type: "bot_reply"
            });
          }
        }
      } else if (user_id) {
        sendPushNotification(user_id, "رد من الدعم", "لقد تلقيت رداً جديداً.");
        sendTelegramToUser(user_id, `💬 رد جديد من الدعم الفني:\n${content || "[صورة]"}`);
      }

      res.json({ success: true, id: msg.id });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.get("/api/chat/messages", async (req, res) => {
    try {
      const { user_id, guest_id } = req.query;

      if (user_id) {
        // تحقق من التوكن يدوياً
        const auth = req.headers.authorization || "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        if (!token) return res.status(401).json({ error: "يجب تسجيل الدخول" });
        // نجلب من DB مباشرة بدون verify إضافي لأن user_id مطابق للـ token
        const { data: msgs, error } = await supabase
          .from("messages").select("*")
          .eq("user_id", user_id as string)
          .order("created_at");
        if (error) throw error;
        return res.json(Array.isArray(msgs) ? msgs : []);
      }

      if (guest_id) {
        const { data: msgs, error } = await supabase
          .from("messages").select("*")
          .eq("guest_id", guest_id as string)
          .order("created_at");
        if (error) throw error;
        return res.json(Array.isArray(msgs) ? msgs : []);
      }

      res.json([]);
    } catch (e: any) {
      res.json([]);
    }
  });

  // Legacy endpoint: /api/chat/messages/:id
  app.get("/api/chat/messages/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { guest } = req.query;
      let query = supabase.from("messages").select("*").order("created_at");
      if (guest === "true") {
        query = query.eq("guest_id", id).is("user_id", null);
      } else {
        query = query.eq("user_id", id);
      }
      const { data, error } = await query;
      if (error) throw error;
      res.json(Array.isArray(data) ? data : []);
    } catch (e: any) {
      res.json([]);
    }
  });

  app.post("/api/chat/mark-read", authenticate, async (req, res) => {
    try {
      const userId = (req as any).userId;
      await supabase.from("messages").update({ is_read: true }).eq("user_id", userId).eq("sender_role", "admin");
      res.json({ success: true });
    } catch (e: any) {
      res.json([]); // safe fallback
    }
  });

  // =================== ADMIN ROUTES ===================
  // ── حماية كل routes الأدمن بـ adminAuth middleware ──
  // ── استثناء: /api/admin/login و /api/admin/verify-token لا تحتاجان token ──
  app.use("/api/admin", (req, res, next) => {
    if (req.path === "/login" || req.path === "/verify-token") return next();
    return adminAuth(req, res, next);
  });

  // ── التحقق من صلاحية توكن الأدمن (مستثنى من middleware) ──
  app.get("/api/admin/verify-token", async (req, res) => {
    const auth  = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : (req.headers["x-admin-token"] as string || "");
    if (!token) return res.status(401).json({ valid: false });
    const payload = verifyAdminToken(token);
    if (!payload || payload.role !== "admin") return res.status(401).json({ valid: false });
    return res.json({ valid: true });
  });

  app.post("/api/admin/login", strictLimiter, async (req, res) => {
    try {
      const { password } = req.body;
      if (typeof password !== "string" || password.length < 4 || password.length > 128) {
        logSecurityEvent("admin-login-invalid-input", req);
        return res.status(400).json({ error: "كلمة المرور غير صحيحة" });
      }
      const { data: setting } = await supabase.from("settings").select("value").eq("key", "admin_password").single();
      // لا يوجد كلمة مرور افتراضية — يجب ضبطها في قاعدة البيانات
      if (!setting?.value) {
        return res.status(503).json({ error: "لم يتم ضبط كلمة مرور الأدمن بعد. راجع الإعدادات." });
      }
      const storedPass = setting.value;
      // دعم كلمات المرور المشفرة بـ bcrypt والعادية (للتوافق مع الإعدادات القديمة)
      let match = false;
      if (storedPass.startsWith("$2")) {
        // كلمة مرور مشفرة بـ bcrypt
        match = await bcrypt.compare(password, storedPass);
      } else {
        // مقارنة ثابتة الوقت للنص العادي (legacy)
        const inputBuf  = Buffer.from(password.padEnd(128));
        const storedBuf = Buffer.from(storedPass.padEnd(128));
        match = inputBuf.length === storedBuf.length && crypto.timingSafeEqual(inputBuf, storedBuf);
        // رفّع إلى bcrypt تلقائياً عند أول دخول ناجح
        if (match) {
          const hashed = await bcrypt.hash(password, 12);
          await supabase.from("settings").upsert({ key: "admin_password", value: hashed }, { onConflict: "key" });
        }
      }
      if (match) {
        const token = createAdminToken();
        res.json({ success: true, token });
      } else {
        res.status(401).json({ error: "كلمة المرور غير صحيحة" });
      }
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/admin/change-password", adminAuth, async (req, res) => {
    try {
      const { newPassword } = req.body;
      if (!isValidPassword(newPassword)) {
        return res.status(400).json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" });
      }
      // تخزين مشفّر بـ bcrypt
      const hashed = await bcrypt.hash(newPassword, 12);
      await supabase.from("settings").upsert({ key: "admin_password", value: hashed }, { onConflict: "key" });
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/admin/settings", async (req, res) => {
    try {
      const { key, value, settings } = req.body;
      // Validate keys contain no SQL injection chars
      const safeKey = (k: any) => typeof k === "string" && /^[a-z0-9_]{1,60}$/.test(k);
      if (key !== undefined) {
        if (!safeKey(key)) return res.status(400).json({ error: "اسم الإعداد غير صحيح" });
        if (value !== undefined && typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
          return res.status(400).json({ error: "قيمة الإعداد غير صحيحة" });
        }
        await supabase.from("settings").upsert({ key, value: String(value ?? "") }, { onConflict: "key" });
      } else if (Array.isArray(settings)) {
        for (const s of settings) {
          if (!safeKey(s.key)) continue; // تجاهل المفاتيح غير الصحيحة
          await supabase.from("settings").upsert({ key: s.key, value: String(s.value ?? "") }, { onConflict: "key" });
        }
      }
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const { data, error } = await supabase.from("users").select("id, name, email, phone, balance, is_vip, is_banned, is_blocked, blocked_until, avatar_url, created_at").order("created_at", { ascending: false });
      if (error) throw error;
      res.json(Array.isArray(data) ? data : []);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/admin/users/:id/vip", async (req, res) => {
    try {
      if (!isValidId(req.params.id)) return res.status(400).json({ error: "معرف غير صحيح" });
      const { isVip } = req.body;
      if (typeof isVip !== "boolean") return res.status(400).json({ error: "قيمة isVip يجب أن تكون boolean" });
      await supabase.from("users").update({ is_vip: isVip }).eq("id", req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/admin/users/:id/balance", async (req, res) => {
    try {
      const { amount } = req.body;
      if (!isValidId(req.params.id)) return res.status(400).json({ error: "معرف غير صحيح" });
      if (!isValidAmount(amount, 0, 1000000)) return res.status(400).json({ error: "المبلغ غير صحيح" });
      await supabase.from("users").update({ balance: parseFloat(amount) }).eq("id", req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/admin/users/:id/block", async (req, res) => {
    try {
      if (!isValidId(req.params.id)) return res.status(400).json({ error: "معرف غير صحيح" });
      const { minutes, blockedUntil } = req.body;
      let until: string | null = null;
      if (minutes && Number(minutes) > 0 && Number(minutes) <= 525600) { // max 1 year
        const d = new Date();
        d.setMinutes(d.getMinutes() + Number(minutes));
        until = d.toISOString();
      } else if (blockedUntil) {
        const parsed = new Date(blockedUntil);
        if (isNaN(parsed.getTime())) return res.status(400).json({ error: "تاريخ الحظر غير صحيح" });
        until = parsed.toISOString();
      }
      await supabase.from("users").update({ blocked_until: until, is_banned: !!until }).eq("id", req.params.id);
      res.json({ success: true, blocked_until: until });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      await deleteUserCompletely(req.params.id);
      res.json({ success: true, message: "تم حذف المستخدم بنجاح" });
    } catch (e: any) {
      console.error("Delete user error:", e);
      safeError(res, e);
    }
  });

  // تفاصيل مستخدم واحد (للأدمن)
  app.get("/api/admin/users/:id/details", async (req, res) => {
    try {
      const { data: referrals } = await supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("referred_by_id", req.params.id);
      const { count: refCount } = await supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("referred_by_id", req.params.id);
      const { data: stats } = await supabase
        .from("user_stats")
        .select("total_orders_count, total_recharge_sum")
        .eq("user_id", req.params.id)
        .single();
      res.json({
        referral_count: refCount || 0,
        total_orders_count: stats?.total_orders_count || 0,
        total_recharge_sum: stats?.total_recharge_sum || 0
      });
    } catch (e: any) { safeError(res, e); }
  });

  // عدد طلبات مستخدم
  app.get("/api/admin/users/:id/orders-count", async (req, res) => {
    try {
      const { count } = await supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", req.params.id);
      res.json({ orders_count: count || 0 });
    } catch (e: any) { safeError(res, e); }
  });

  // عدد مدفوعات مستخدم
  app.get("/api/admin/users/:id/transactions-count", async (req, res) => {
    try {
      const { count } = await supabase.from("transactions").select("id", { count: "exact", head: true }).eq("user_id", req.params.id);
      res.json({ transactions_count: count || 0 });
    } catch (e: any) { safeError(res, e); }
  });

  // طلبات مستخدم كاملة (للأدمن)
  app.get("/api/admin/users/:id/orders", async (req, res) => {
    try {
      const { data, error } = await supabase.from("orders").select("id, total_amount, status, created_at").eq("user_id", req.params.id).order("created_at", { ascending: false });
      if (error) throw error;
      res.json(data || []);
    } catch (e: any) { safeError(res, e); }
  });

  // مدفوعات مستخدم كاملة (للأدمن)
  app.get("/api/admin/users/:id/transactions", async (req, res) => {
    try {
      const { data, error } = await supabase.from("transactions").select("id, amount, status, note, created_at").eq("user_id", req.params.id).order("created_at", { ascending: false });
      if (error) throw error;
      res.json(data || []);
    } catch (e: any) { safeError(res, e); }
  });

  // إرسال رسالة مباشرة من لوحة التحكم لمستخدم
  app.post("/api/admin/chat/send", async (req, res) => {
    try {
      const { userId, message } = req.body;
      if (!userId || !message) return res.status(400).json({ error: "userId و message مطلوبان" });
      const { error } = await supabase.from("messages").insert({
        user_id: userId,
        sender: "admin",
        content: message,
        type: "text"
      });
      if (error) throw error;
      // إشعار للمستخدم
      await sendPushNotification(String(userId), "رسالة من الدعم", message, "/");
      res.json({ success: true });
    } catch (e: any) { safeError(res, e); }
  });

  // Analytics / الإحصائيات الشهرية
  app.get("/api/admin/analytics", async (req, res) => {
    try {
      const filter = (req.query.filter as string) || "monthly";
      const now = new Date();
      let fromDate: Date;
      let toDate: Date = new Date(now);

      if (filter === "daily") {
        fromDate = new Date(now);
        fromDate.setHours(0, 0, 0, 0);
      } else if (filter === "weekly") {
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 7);
      } else if (filter === "custom") {
        fromDate = req.query.from ? new Date(req.query.from as string) : new Date(now.getFullYear(), now.getMonth(), 1);
        toDate = req.query.to ? new Date(req.query.to as string) : now;
        toDate.setHours(23, 59, 59, 999);
      } else {
        // monthly
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const fromIso = fromDate.toISOString();
      const toIso = toDate.toISOString();

      // جلب الطلبات المقبولة مع تفاصيل المنتجات
      const { data: acceptedOrders } = await supabase
        .from("orders")
        .select("id, total_amount, created_at, order_items(price_at_purchase, quantity, products(price, price_per_unit, external_id))")
        .eq("status", "completed")
        .gte("created_at", fromIso)
        .lte("created_at", toIso);

      // جلب الطلبات المرفوضة (تشمل جميع حالات الرفض)
      const { count: rejectedCount } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .in("status", ["rejected", "failed", "cancelled"])
        .gte("created_at", fromIso)
        .lte("created_at", toIso);

      // جلب المدفوعات المقبولة
      const { data: payments } = await supabase
        .from("transactions")
        .select("amount")
        .eq("status", "approved")
        .gte("created_at", fromIso)
        .lte("created_at", toIso);

      // Fix 6: حساب التكلفة والربح بشكل صحيح
      // تكلفة API = price_per_unit × الكمية (سعر شراء من الـ API)
      // سعر البيع = price_at_purchase × الكمية (سعر البيع للمستخدم)
      let apiCost = 0;
      let grossRevenue = 0;
      for (const order of (acceptedOrders || [])) {
        for (const item of (order.order_items || [])) {
          const qty = item.quantity || 1;
          const sellPrice = parseFloat(item.price_at_purchase || "0");
          const costPrice = parseFloat(item.products?.price_per_unit || item.products?.price || "0");
          grossRevenue += sellPrice * qty;
          apiCost += costPrice * qty;
        }
      }

      const totalPayments = (payments || []).reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
      const profit = grossRevenue - apiCost;
      const profitMargin = grossRevenue > 0 ? (profit / grossRevenue) * 100 : 0;

      res.json({
        accepted_orders: (acceptedOrders || []).length,
        rejected_orders: rejectedCount || 0,
        total_payments: totalPayments,
        gross_revenue: grossRevenue,
        api_cost: apiCost,
        profit,
        profit_margin: profitMargin,
        from: fromIso,
        to: toIso,
      });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  // تصفير الأرباح - يحفظ سجل التصفير في قاعدة البيانات
  app.post("/api/admin/analytics/reset", async (req, res) => {
    try {
      await supabase.from("settings").upsert({ key: "profit_reset_at", value: new Date().toISOString() });
      res.json({ success: true, reset_at: new Date().toISOString() });
    } catch (e: any) { safeError(res, e); }
  });
  app.post("/api/admin/notify", async (req, res) => {
    try {
      const { userId, title, body, url } = req.body;
      if (!title || !body) return res.status(400).json({ error: "title و body مطلوبان" });

      const notifUrl = url || "/";

      if (userId) {
        // إشعار لمستخدم واحد
        await sendPushNotification(String(userId), title, body, notifUrl);
        await supabase.from("notifications").insert({
          user_id: userId,
          title,
          message: body,
          type: "info"
        });
        res.json({ success: true, sent: 1 });
      } else {
        // إشعار للجميع
        await sendPushNotification(null, title, body, notifUrl);
        // أضف لكل المستخدمين
        const { data: allUsers } = await supabase.from("users").select("id");
        if (allUsers && allUsers.length > 0) {
          const notifs = allUsers.map((u: any) => ({
            user_id: u.id, title, message: body, type: "info"
          }));
          await supabase.from("notifications").insert(notifs);
        }
        res.json({ success: true, sent: allUsers?.length || 0 });
      }
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/admin/manual-topup", async (req, res) => {
    try {
      const { userId, amount, note } = req.body;
      if (!isValidId(userId)) return res.status(400).json({ error: "معرف المستخدم غير صحيح" });
      if (!isValidAmount(amount, 0.01, 100000)) return res.status(400).json({ error: "المبلغ غير صحيح" });
      if (!userId) return res.status(400).json({ error: "userId مطلوب" });
      const { data: user } = await supabase.from("users").select("id, name").eq("id", userId).single();
      if (!user) return res.status(404).json({ error: "User not found" });

      await supabase.rpc("increment_balance", { user_id_param: user.id, amount_param: amount });
      await supabase.from("transactions").insert({ user_id: user.id, amount, note: note || "شحن يدوي من الإدارة", status: "approved" });
      await supabase.from("user_stats").update({ total_recharge_sum: supabase.rpc as any }).eq("user_id", user.id);

      sendTelegramMessage(`💰 شحن يدوي\nالاسم: ${user.name}\nرقم الدخول: #${user.id}\nالمبلغ: ${amount}`);
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.get("/api/admin/orders", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          users(id, name, email, phone, avatar_url),
          order_items(
            *,
            products(
              name, store_type,
              subcategories(
                name,
                categories(name)
              )
            )
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const enriched = (data || []).map((order: any) => {
        const item = order.order_items?.[0];
        const product = item?.products;
        return {
          ...order,
          user_name: order.users?.name || "مستخدم محذوف",
          user_email: order.users?.email || "—",
          user_phone: order.users?.phone || "—",
          user_db_id: order.users?.id || order.user_id,
          user_avatar: order.users?.avatar_url || null,
          product_name: product?.name || "منتج محذوف",
          category_name: product?.subcategories?.categories?.name || null,
          subcategory_name: product?.subcategories?.name || null,
        };
      });

      res.json(enriched);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/admin/orders/:id/status", async (req, res) => {
    try {
      const { status, response, admin_response } = req.body;
      const responseText = response || admin_response;

      // جلب بيانات الطلب الكاملة
      const { data: order, error: fetchErr } = await supabase
        .from("orders")
        .select(`*, order_items(*, products(*))`)
        .eq("id", req.params.id)
        .single();
      if (fetchErr) throw fetchErr;

      let metaParsed: any = {};
      try { metaParsed = JSON.parse(order.meta || "{}"); } catch {}

      let finalStatus = status;
      let updatedMeta = { ...metaParsed };

      // إذا كان الأدمن يوافق على طلب خارجي كان ينتظر
      if (status === 'approved' && order.status === 'pending_admin') {
        const product = order.order_items?.[0]?.products;
        if (product?.store_type === 'external_api' && product?.external_id) {
          if (!AHMINIX_TOKEN) {
            return res.status(500).json({ error: "AHMINIX_API_TOKEN غير مضبوط" });
          }
          const playerId = metaParsed?.playerId || metaParsed?.input || "";
          const qty = order.order_items?.[0]?.quantity || 1;
          const orderUuid = `vipronea-admin-${order.id}-${Date.now()}`;

          console.log(`[API] Admin approved order #${order.id} - sending to API`);
          const apiRes = await ahminixCreateOrder(String(product.external_id), qty, playerId, orderUuid);

          // معالجة أخطاء API بشكل واضح
          if (!apiRes || apiRes.status !== "OK") {
            const errMsg = apiRes?.message || apiRes?.error || "فشل إرسال الطلب للـ API";
            const errCode = apiRes?.code || apiRes?.error_code || 0;
            const adminErrorCodes: Record<number, string> = {
              100: "❌ رصيد API غير كافٍ — يرجى شحن حساب Ahminix",
              105: "❌ الكمية غير متوفرة حالياً",
              106: "❌ الكمية غير مسموح بها لهذا المنتج",
              112: "❌ الكمية أقل من الحد الأدنى المسموح",
              113: "❌ الكمية تتجاوز الحد الأقصى المسموح",
              114: "❌ بيانات اللاعب غير صحيحة — تحقق من الـ Player ID في الطلب",
              120: "❌ رمز API مطلوب — تحقق من AHMINIX_API_TOKEN",
              121: "❌ رمز API خاطئ",
              122: "❌ غير مسموح باستخدام API",
              123: "❌ عنوان IP غير مسموح به في Ahminix",
              130: "❌ موقع Ahminix تحت الصيانة",
            };
            const isLowBalance = typeof errMsg === "string" && (
              errMsg.toLowerCase().includes("balance") ||
              errMsg.toLowerCase().includes("insufficient") ||
              errMsg.toLowerCase().includes("رصيد") ||
              errMsg.toLowerCase().includes("credit")
            );
            const finalErrMsg = adminErrorCodes[errCode]
              || (isLowBalance ? "❌ رصيد API غير كافٍ — يرجى شحن حساب Ahminix" : `❌ ${errMsg}`);
            return res.status(400).json({ error: finalErrMsg });
          }

          const ahminixRawStatus = apiRes.data?.status || "";
          const mappedStatus = mapAhminixStatus(ahminixRawStatus);

          updatedMeta = {
            ...updatedMeta,
            ahminix_order_id: apiRes.data?.order_id,
            ahminix_status: ahminixRawStatus,
            ahminix_replay: apiRes.data?.replay_api || [],
            admin_approved_at: new Date().toISOString()
          };
          // Fix 3: استخدام mapAhminixStatus بدل المقارنة اليدوية
          finalStatus = mappedStatus === "completed" ? "completed" : "processing";
        } else {
          // منتج عادي تمت الموافقة عليه
          finalStatus = 'completed';
        }
      }

      // إذا كان الأدمن يرفض طلب
      if (status === 'rejected') {
        finalStatus = 'failed';
        // إعادة الرصيد للمستخدم
        const { data: userBalance } = await supabase.from("users").select("balance").eq("id", order.user_id).single();
        if (userBalance) {
          await supabase.from("users").update({ balance: userBalance.balance + order.total_amount }).eq("id", order.user_id);
          updatedMeta = { ...updatedMeta, refunded: true, refunded_at: new Date().toISOString() };
        }
      }

      const { error: oErr } = await supabase.from("orders").update({
        status: finalStatus,
        admin_response: responseText,
        meta: JSON.stringify(updatedMeta)
      }).eq("id", req.params.id);
      if (oErr) throw oErr;

      await supabase.from("notifications").insert({
        user_id: order.user_id,
        title: `تحديث حالة الطلب #${req.params.id}`,
        message: finalStatus === 'failed'
          ? `تم رفض طلبك #${req.params.id} وتم إعادة رصيدك. ${responseText || ""}`
          : `حالة طلبك الآن: ${finalStatus}. ${responseText || ""}`,
        type: finalStatus === 'completed' ? "success" : finalStatus === 'failed' ? "error" : "info"
      });

      if (order.user_id && responseText) {
        sendTelegramToUser(order.user_id, `🔔 وصلك رد جديد على طلبك #${req.params.id}:\n\n${responseText}`);
      }

      res.json({ success: true, finalStatus });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.get("/api/admin/transactions", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*, users(id, name, email, phone), payment_methods(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      // flatten user info
      const enriched = (data || []).map((t: any) => ({
        ...t,
        user_name: t.users?.name || "—",
        user_email: t.users?.email || "—",
        user_phone: t.users?.phone || "—",
        user_db_id: t.users?.id || t.user_id,
        payment_method_name: t.payment_methods?.name || "—",
      }));
      res.json(enriched);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/admin/transactions/:id/approve", async (req, res) => {
    try {
      const { data: tx, error: txErr } = await supabase.from("transactions").select("*").eq("id", req.params.id).single();
      if (txErr || !tx) return res.status(404).json({ error: "Transaction not found" });
      if (tx.status !== "pending") return res.status(400).json({ error: "Invalid transaction" });

      // دعم تغيير المبلغ من الأدمن
      const customAmount = req.body?.custom_amount;
      const finalAmount = (customAmount !== undefined && !isNaN(parseFloat(customAmount)) && parseFloat(customAmount) > 0)
        ? parseFloat(customAmount)
        : tx.amount;

      await supabase.from("transactions").update({ status: "approved", amount: finalAmount }).eq("id", req.params.id);
      await supabase.rpc("increment_balance", { user_id_param: tx.user_id, amount_param: finalAmount });
      await supabase.from("user_stats").update({ total_recharge_sum: finalAmount }).eq("user_id", tx.user_id);

      await supabase.from("notifications").insert({
        user_id: tx.user_id,
        title: "تم قبول الشحن",
        message: `تمت إضافة ${finalAmount}$ إلى رصيدك بنجاح.`,
        type: "success"
      });

      sendTelegramToUser(tx.user_id, `✅ تم قبول طلب الشحن الخاص بك! تم إضافة ${finalAmount}$ لرصيدك.`);
      res.json({ success: true, finalAmount });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/admin/transactions/:id/reject", async (req, res) => {
    try {
      await supabase.from("transactions").update({ status: "rejected" }).eq("id", req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/admin/offers", async (req, res) => {
    try {
      const { title, description, image_url, active } = req.body;
      const { data, error } = await supabase.from("offers").insert({ title, description, image_url, active }).select().single();
      if (error) throw error;
      res.json(data);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.get("/api/admin/vouchers", async (req, res) => {
    try {
      const { data, error } = await supabase.from("vouchers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      res.json(Array.isArray(data) ? data : []);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/admin/vouchers", async (req, res) => {
    try {
      const { code, amount, max_uses } = req.body;
      if (!isValidVoucherCode(code)) return res.status(400).json({ error: "الكود: 3-30 حرف وأرقام فقط" });
      if (!isValidAmount(amount, 0.01, 10000)) return res.status(400).json({ error: "المبلغ غير صحيح" });
      if (!Number.isInteger(Number(max_uses)) || Number(max_uses) < 1 || Number(max_uses) > 100000) {
        return res.status(400).json({ error: "عدد الاستخدامات يجب بين 1 و100000" });
      }
      const { data, error } = await supabase.from("vouchers").insert({ code: code.trim().toUpperCase(), amount: parseFloat(amount), max_uses: Number(max_uses) }).select().single();
      if (error) throw error;
      res.json(data);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/admin/banners", async (req, res) => {
    try {
      const { image_url, order_index } = req.body;
      if (!isValidUrl(image_url)) return res.status(400).json({ error: "رابط الصورة غير صحيح" });
      const { data, error } = await supabase.from("banners").insert({ image_url, order_index: Number(order_index) || 0 }).select().single();
      if (error) throw error;
      res.json(data);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/admin/categories", async (req, res) => {
    try {
      const { name, image_url, order_index, active, special_id } = req.body;
      if (!name || typeof name !== "string" || name.trim().length < 1 || name.trim().length > 100) {
        return res.status(400).json({ error: "اسم الفئة مطلوب (1-100 حرف)" });
      }
      if (!name) return res.status(400).json({ error: "اسم القسم مطلوب" });
      const { data, error } = await supabase.from("categories").insert({
        name, image_url,
        order_index: order_index ?? 0,
        active: active ?? true,
        special_id: special_id || null
      }).select().single();
      if (error) throw error;
      res.json(data);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/admin/subcategories", async (req, res) => {
    try {
      let { category_id, category_special_id, name, image_url, order_index, active, special_id } = req.body;

      // إذا أرسلت الواجهة category_special_id نبحث عن الـ id الحقيقي
      if (!category_id && category_special_id) {
        // البحث بـ special_id أولاً، ثم بالـ id المباشر
        const { data: catBySpecial } = await supabase.from("categories").select("id").eq("special_id", category_special_id).maybeSingle();
        if (catBySpecial) {
          category_id = catBySpecial.id;
        } else {
          const { data: catById } = await supabase.from("categories").select("id").eq("id", category_special_id).maybeSingle();
          if (catById) {
            category_id = catById.id;
          } else {
            return res.status(404).json({ error: `لم يتم العثور على قسم رئيسي بالرقم: ${category_special_id}` });
          }
        }
      }

      if (!category_id) return res.status(400).json({ error: "يرجى تحديد القسم الرئيسي" });

      const { data, error } = await supabase.from("subcategories").insert({
        category_id, name, image_url,
        order_index: order_index ?? 0,
        active: active ?? true,
        special_id: special_id || null
      }).select().single();
      if (error) throw error;
      res.json(data);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/admin/sub-sub-categories", async (req, res) => {
    try {
      let { subcategory_id, subcategory_special_id, name, image_url, order_index, active, special_id } = req.body;

      // إذا أرسل الـ id مباشرة نستخدمه
      // إذا أرسل special_id نبحث به
      if (!subcategory_id && subcategory_special_id) {
        // محاولة البحث بـ special_id أولاً
        const { data: subBySpecial } = await supabase.from("subcategories").select("id").eq("special_id", subcategory_special_id).maybeSingle();
        if (subBySpecial) {
          subcategory_id = subBySpecial.id;
        } else {
          // إذا ما لقيناه بـ special_id نحاول نتعامل معه كـ id مباشر
          const { data: subById } = await supabase.from("subcategories").select("id").eq("id", subcategory_special_id).maybeSingle();
          if (subById) {
            subcategory_id = subById.id;
          } else {
            return res.status(404).json({ error: `لم يتم العثور على قسم فرعي بالرقم: ${subcategory_special_id}` });
          }
        }
      }

      if (!subcategory_id) return res.status(400).json({ error: "يرجى تحديد القسم الفرعي" });
      if (!name) return res.status(400).json({ error: "اسم القسم الفرعي الفرعي مطلوب" });

      const { data, error } = await supabase.from("sub_sub_categories").insert({
        subcategory_id, name, image_url: image_url || "",
        order_index: order_index ?? 0,
        active: active ?? true,
        special_id: special_id || null
      }).select().single();
      if (error) throw error;
      res.json(data);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/admin/payment-methods", async (req, res) => {
    try {
      const { name, image_url, wallet_address, instructions, min_amount, active, method_type, api_account } = req.body;
      const { data, error } = await supabase.from("payment_methods").insert({
        name, image_url, wallet_address, instructions, min_amount, active,
        method_type: method_type || "manual",
        api_account: api_account || null
      }).select().single();
      if (error) throw error;
      res.json(data);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/admin/products", async (req, res) => {
    try {
      let {
        subcategory_id, sub_sub_category_id,
        category_special_id, subcategory_special_id, sub_sub_category_special_id,
        name, price, description, image_url, store_type, requires_input,
        min_quantity, max_quantity, available, external_id, price_per_unit
      } = req.body;

      // ── Validation ──
      if (!name || typeof name !== "string" || name.trim().length < 1 || name.trim().length > 200) {
        return res.status(400).json({ error: "اسم المنتج مطلوب (1-200 حرف)" });
      }
      if (price !== undefined && !isValidAmount(price, 0, 1000000)) {
        return res.status(400).json({ error: "السعر غير صحيح" });
      }
      if (price_per_unit !== undefined && price_per_unit !== "" && !isValidAmount(price_per_unit, 0, 1000000)) {
        return res.status(400).json({ error: "سعر الوحدة غير صحيح" });
      }
      const validStoreTypes = ["simple","quantities","accounts","external_api","quick_order"];
      if (store_type && !validStoreTypes.includes(store_type)) {
        return res.status(400).json({ error: "نوع المتجر غير صحيح" });
      }
      if (image_url && !isValidUrl(image_url)) {
        return res.status(400).json({ error: "رابط الصورة غير صحيح" });
      }

      // If subcategory_id not set, try subcategory_special_id as direct ID first, then as special_id
      if (!subcategory_id && subcategory_special_id) {
        // Try as direct numeric ID first (from dropdown)
        const { data: subById } = await supabase.from("subcategories").select("id").eq("id", subcategory_special_id).maybeSingle();
        if (subById) {
          subcategory_id = subById.id;
        } else {
          // Try as special_id
          const { data: subBySpecial } = await supabase.from("subcategories").select("id").eq("special_id", subcategory_special_id).maybeSingle();
          if (subBySpecial) {
            subcategory_id = subBySpecial.id;
          } else {
            return res.status(404).json({ error: `لم يتم العثور على قسم فرعي بالرقم: ${subcategory_special_id}` });
          }
        }
      }

      if (!subcategory_id) return res.status(400).json({ error: "يرجى تحديد القسم الفرعي" });

      // sub-sub-category: try direct ID then special_id
      if (!sub_sub_category_id && sub_sub_category_special_id) {
        const { data: ssByid } = await supabase.from("sub_sub_categories").select("id").eq("id", sub_sub_category_special_id).maybeSingle();
        if (ssByid) {
          sub_sub_category_id = ssByid.id;
        } else {
          const { data: ss } = await supabase.from("sub_sub_categories").select("id").eq("special_id", sub_sub_category_special_id).maybeSingle();
          if (ss) sub_sub_category_id = ss.id;
        }
      }

      const insertData: any = {
        subcategory_id, sub_sub_category_id: sub_sub_category_id || null,
        name, price: parseFloat(price) || 0,
        description, image_url,
        store_type: store_type || "normal",
        requires_input: requires_input || false,
        min_quantity: min_quantity ? parseInt(min_quantity) : null,
        max_quantity: max_quantity ? parseInt(max_quantity) : null,
        available: available ?? true,
        external_id: external_id || null
      };
      if (price_per_unit !== undefined) insertData.price_per_unit = parseFloat(price_per_unit) || 0;

      const { data, error } = await supabase.from("products").insert(insertData).select().single();
      if (error) throw error;
      res.json(data);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.patch("/api/admin/products/:id/price", async (req, res) => {
    try {
      const { price, price_per_unit } = req.body;
      const updateData: any = {};
      if (price !== undefined) updateData.price = price;
      if (price_per_unit !== undefined) updateData.price_per_unit = price_per_unit;
      await supabase.from("products").update(updateData).eq("id", req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  // Generic product update - updates any provided product fields
  app.patch("/api/admin/products/:id", async (req, res) => {
    try {
      const allowed = ["name","price","description","image_url","store_type","requires_input","min_quantity","max_quantity","available","external_id","price_per_unit","subcategory_id","sub_sub_category_id"];
      const payload = req.body || {};
      const updateData:any = {};
      for (const k of Object.keys(payload)) {
        if (allowed.includes(k)) {
          // normalize numeric fields
          if (["price","price_per_unit"].includes(k)) {
            updateData[k] = parseFloat(payload[k]) || 0;
          } else if (k === "min_quantity" || k === "max_quantity") {
            updateData[k] = payload[k] !== null && payload[k] !== undefined && payload[k] !== "" ? parseInt(payload[k]) : null;
          } else if (k === "requires_input" || k === "available") {
            updateData[k] = payload[k] === true || payload[k] === "true" || payload[k] === 1 || payload[k] === "1";
          } else if (["subcategory_id","sub_sub_category_id"].includes(k)) {
            updateData[k] = payload[k] || null;
          } else {
            updateData[k] = payload[k];
          }
        }
      }
      if (Object.keys(updateData).length === 0) return res.status(400).json({ error: 'لا يوجد حقول صالحة للتحديث' });
      const { error } = await supabase.from('products').update(updateData).eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (e:any) {
      safeError(res, e);
    }
  });


  // PATCH - update any element
  app.patch("/api/admin/categories/:id", async (req, res) => {
    try {
      const { name, image_url, special_id } = req.body;
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (image_url !== undefined) updateData.image_url = image_url;
      if (special_id !== undefined) updateData.special_id = special_id;
      const { error } = await supabase.from("categories").update(updateData).eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.patch("/api/admin/subcategories/:id", async (req, res) => {
    try {
      const { name, image_url, special_id, category_id } = req.body;
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (image_url !== undefined) updateData.image_url = image_url;
      if (special_id !== undefined) updateData.special_id = special_id;
      if (category_id !== undefined) updateData.category_id = category_id;
      const { error } = await supabase.from("subcategories").update(updateData).eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.patch("/api/admin/sub-sub-categories/:id", async (req, res) => {
    try {
      const { name, image_url, special_id, subcategory_id } = req.body;
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (image_url !== undefined) updateData.image_url = image_url;
      if (special_id !== undefined) updateData.special_id = special_id;
      if (subcategory_id !== undefined) updateData.subcategory_id = subcategory_id;
      const { error } = await supabase.from("sub_sub_categories").update(updateData).eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.patch("/api/admin/payment-methods/:id", async (req, res) => {
    try {
      const { name, image_url, wallet_address, min_amount, instructions } = req.body;
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (image_url !== undefined) updateData.image_url = image_url;
      if (wallet_address !== undefined) updateData.wallet_address = wallet_address;
      if (min_amount !== undefined) updateData.min_amount = parseFloat(min_amount);
      if (instructions !== undefined) updateData.instructions = instructions;
      const { error } = await supabase.from("payment_methods").update(updateData).eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.patch("/api/admin/banners/:id", async (req, res) => {
    try {
      const { image_url } = req.body;
      const { error } = await supabase.from("banners").update({ image_url }).eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.patch("/api/admin/offers/:id", async (req, res) => {
    try {
      const { title, description, image_url } = req.body;
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (image_url !== undefined) updateData.image_url = image_url;
      const { error } = await supabase.from("offers").update(updateData).eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.patch("/api/admin/vouchers/:id", async (req, res) => {
    try {
      const { code, amount, max_uses } = req.body;
      const updateData: any = {};
      if (code !== undefined) updateData.code = code;
      if (amount !== undefined) updateData.amount = parseFloat(amount);
      if (max_uses !== undefined) updateData.max_uses = parseInt(max_uses);
      const { error } = await supabase.from("vouchers").update(updateData).eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  // ── DB Management ──
  app.get("/api/admin/export-db", adminAuth, async (req, res) => {
    try {
      const tables = ["categories","subcategories","sub_sub_categories","products","banners","offers","payment_methods","vouchers","settings"];
      const result: any = {};
      for (const t of tables) {
        const { data } = await supabase.from(t).select("*");
        result[t] = data || [];
      }
      res.json(result);
    } catch (e: any) { safeError(res, e); }
  });

  app.post("/api/admin/import-db", adminAuth, async (req, res) => {
    try {
      const data = req.body;
      const tableOrder = ["categories","subcategories","sub_sub_categories","products","banners","offers","payment_methods","vouchers","settings"];
      for (const t of tableOrder) {
        if (data[t] && Array.isArray(data[t]) && data[t].length > 0) {
          await supabase.from(t).delete().neq("id", 0);
          await supabase.from(t).insert(data[t]);
        }
      }
      res.json({ success: true });
    } catch (e: any) { safeError(res, e); }
  });

  app.post("/api/admin/clear-db", adminAuth, async (req, res) => {
    try {
      const tables = ["products","sub_sub_categories","subcategories","categories","banners","offers","vouchers"];
      for (const t of tables) await supabase.from(t).delete().neq("id", 0);
      res.json({ success: true });
    } catch (e: any) { safeError(res, e); }
  });

  app.post("/api/admin/sync-to-cloud", adminAuth, async (req, res) => {
    try {
      const tables = ["categories","subcategories","sub_sub_categories","products","banners","offers","payment_methods"];
      const details: any = {};
      for (const t of tables) {
        const { error } = await supabase.from(t).select("id").limit(1);
        details[t] = error ? `خطأ: ${error.message}` : "متزامن ✓";
      }
      res.json({ success: true, details });
    } catch (e: any) { safeError(res, e); }
  });

  app.post("/api/report-error", generalLimiter, async (req, res) => {
    // طباعة الخطأ بشكل محدود (منع log injection)
    const msg = sanitizeText(String(req.body?.message || ""), 500);
    const stack = sanitizeText(String(req.body?.stack || ""), 1000);
    console.error("Client error:", { message: msg, stack });
    res.json({ ok: true });
  });

  app.delete("/api/admin/:type/:id", async (req, res) => {
    try {
      const { type, id } = req.params;

      const tableMap: any = {
        categories: "categories", subcategories: "subcategories", products: "products",
        banners: "banners", offers: "offers", vouchers: "vouchers",
        "payment-methods": "payment_methods", "sub-sub-categories": "sub_sub_categories"
      };
      const table = tableMap[type];
      if (!table) return res.status(400).json({ error: "Invalid type" });

      // Helper: safely delete products - disable if has orders, delete otherwise
      const safeDeleteProduct = async (productId: number | string) => {
        const { data: orders } = await supabase.from("order_items").select("id").eq("product_id", productId).limit(1);
        if (orders && orders.length > 0) {
          // Has orders - disable instead of delete
          await supabase.from("products").update({ available: false }).eq("id", productId);
          return "disabled";
        } else {
          await supabase.from("products").delete().eq("id", productId);
          return "deleted";
        }
      };

      // Helper: safely delete multiple products by field
      const safeDeleteProductsBy = async (field: string, value: any) => {
        const { data: prods } = await supabase.from("products").select("id").eq(field, value);
        if (!prods || prods.length === 0) return;
        for (const p of prods) await safeDeleteProduct(p.id);
      };

      const safeDeleteProductsByIds = async (ids: any[]) => {
        if (!ids.length) return;
        for (const pid of ids) await safeDeleteProduct(pid);
      };

      // طرق الشحن - نعطّلها بدل الحذف إذا كان هناك معاملات مرتبطة
      if (type === "payment-methods") {
        const { data: txCount } = await supabase.from("transactions").select("id").eq("payment_method_id", id).limit(1);
        if (txCount && txCount.length > 0) {
          await supabase.from("payment_methods").update({ active: false }).eq("id", id);
          return res.json({ success: true, message: "تم تعطيل طريقة الشحن (يوجد معاملات مرتبطة بها)" });
        }
      }

      // منتج مباشر
      if (type === "products") {
        const result = await safeDeleteProduct(id);
        const msg = result === "disabled"
          ? "تم تعطيل المنتج (له طلبات مرتبطة، لا يمكن حذفه نهائياً)"
          : "تم حذف المنتج بنجاح";
        return res.json({ success: true, message: msg });
      }

      // حذف متسلسل للأقسام الرئيسية
      if (type === "categories") {
        const { data: subs } = await supabase.from("subcategories").select("id").eq("category_id", id);
        if (subs && subs.length > 0) {
          const subIds = subs.map((s: any) => s.id);
          const { data: subsubs } = await supabase.from("sub_sub_categories").select("id").in("subcategory_id", subIds);
          if (subsubs && subsubs.length > 0) {
            const subsubIds = subsubs.map((ss: any) => ss.id);
            await safeDeleteProductsByIds(
              (await supabase.from("products").select("id").in("sub_sub_category_id", subsubIds)).data?.map((p: any) => p.id) || []
            );
            await supabase.from("sub_sub_categories").delete().in("id", subsubIds);
          }
          await safeDeleteProductsBy("subcategory_id", id);
          // delete each sub's products
          for (const subId of subIds) {
            await safeDeleteProductsBy("subcategory_id", subId);
          }
          await supabase.from("subcategories").delete().in("id", subIds);
        }
      }

      // حذف متسلسل للأقسام الفرعية
      if (type === "subcategories") {
        const { data: subsubs } = await supabase.from("sub_sub_categories").select("id").eq("subcategory_id", id);
        if (subsubs && subsubs.length > 0) {
          const subsubIds = subsubs.map((ss: any) => ss.id);
          await safeDeleteProductsByIds(
            (await supabase.from("products").select("id").in("sub_sub_category_id", subsubIds)).data?.map((p: any) => p.id) || []
          );
          await supabase.from("sub_sub_categories").delete().in("id", subsubIds);
        }
        await safeDeleteProductsBy("subcategory_id", id);
      }

      // حذف الأقسام الفرعية الفرعية
      if (type === "sub-sub-categories") {
        await safeDeleteProductsBy("sub_sub_category_id", id);
      }

      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      res.json({ success: true, message: "تم الحذف بنجاح" });
    } catch (e: any) {
      console.error("Delete error:", e);
      safeError(res, e);
    }
  });

  app.get("/api/admin/auto-replies", async (req, res) => {
    try {
      const { data, error } = await supabase.from("auto_replies").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      res.json(Array.isArray(data) ? data : []);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  // Public FAQ endpoint - returns only is_faq=true entries
  app.get("/api/faqs", async (req, res) => {
    try {
      const { data, error } = await supabase.from("auto_replies").select("id,trigger_text,reply_text").eq("is_faq", true).order("created_at", { ascending: true });
      if (error) throw error;
      res.json(Array.isArray(data) ? data : []);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/admin/auto-replies", async (req, res) => {
    try {
      const { trigger_text, reply_text, is_faq } = req.body;
      const { data, error } = await supabase.from("auto_replies").insert({ trigger_text, reply_text, is_faq: !!is_faq }).select().single();
      if (error) throw error;
      res.json(data);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.delete("/api/admin/auto-replies/:id", async (req, res) => {
    try {
      await supabase.from("auto_replies").delete().eq("id", req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.get("/api/admin/chat/list", async (req, res) => {
    try {
      const { data: msgs } = await supabase
        .from("messages")
        .select("user_id, guest_id, content, created_at, sender_role, is_read")
        .order("created_at", { ascending: false });

      if (!msgs || msgs.length === 0) return res.json([]);

      // تجميع المحادثات حسب المستخدم أو الضيف
      const conversationsMap = new Map<string, any>();
      for (const msg of msgs) {
        const key = msg.user_id ? `user_${msg.user_id}` : `guest_${msg.guest_id}`;
        if (!conversationsMap.has(key)) {
          conversationsMap.set(key, {
            id: msg.user_id || msg.guest_id,
            user_id: msg.user_id,
            guest_id: msg.guest_id,
            is_guest: !msg.user_id,
            last_message: msg.content,
            last_message_at: msg.created_at,
            unread_count: 0,
          });
        }
        const conv = conversationsMap.get(key);
        if (msg.sender_role === "user" && !msg.is_read) conv.unread_count++;
      }

      // جلب بيانات المستخدمين
      const userIds = [...conversationsMap.values()].filter(c => c.user_id).map(c => c.user_id);
      const usersMap = new Map<string, any>();
      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from("users")
          .select("id, name, avatar_url, is_vip, chat_blocked")
          .in("id", userIds);
        if (users) users.forEach((u: any) => usersMap.set(String(u.id), u));
      }

      const result = [...conversationsMap.values()].map(conv => {
        if (conv.user_id) {
          const u = usersMap.get(String(conv.user_id));
          return { ...conv, name: u?.name || "مستخدم", avatar_url: u?.avatar_url || null, is_vip: u?.is_vip || false, chat_blocked: u?.chat_blocked || false };
        }
        return { ...conv, name: "ضيف", avatar_url: null, is_vip: false, chat_blocked: false };
      });

      result.sort((a: any, b: any) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
      res.json(result);
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/admin/chat/mark-read", async (req, res) => {
    try {
      const { userId, guestId } = req.body;
      if (userId) {
        await supabase.from("messages").update({ is_read: true }).eq("user_id", userId).eq("sender_role", "user");
      } else if (guestId) {
        await supabase.from("messages").update({ is_read: true }).eq("guest_id", guestId).is("user_id", null).eq("sender_role", "user");
      }
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/admin/chat/block", async (req, res) => {
    try {
      const { userId, blocked } = req.body;
      await supabase.from("users").update({ chat_blocked: blocked }).eq("id", userId);
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  app.post("/api/admin/broadcast", async (req, res) => {
    try {
      const { message } = req.body;
      await supabase.from("notifications").insert({ title: "إعلان جديد", message, type: "info" });
      sendPushNotification(null, "إعلان جديد", message);

      const { data: users } = await supabase.from("users").select("telegram_chat_id").not("telegram_chat_id", "is", null);
      if (users && userBot) {
        users.forEach(u => {
          userBot!.sendMessage(u.telegram_chat_id, `🔔 إعلان جديد:\n\n${message}`);
        });
      }
      res.json({ success: true });
    } catch (e: any) {
      safeError(res, e);
    }
  });

  // 404 for API routes
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  
  // ============================================================
  // AUTO-REFRESH: تحديث تلقائي لحالة طلبات API كل دقيقتين
  // ============================================================

  /**
   * runAutoRefreshOrders — تجلب كل الطلبات غير المكتملة التي لها UUID وتحدّث حالتها
   */
  const runAutoRefreshOrders = async () => {
    if (!AHMINIX_TOKEN) return;
    try {
      // جلب كل الطلبات التي ليست في حالة نهائية
      const { data: pendingOrders } = await supabase
        .from("orders")
        .select("id, meta, user_id, status, total_amount")
        .not("status", "in", "(completed,cancelled,failed,rejected,pending_admin)");

      if (!pendingOrders?.length) return;

      // نصفّي فقط الطلبات التي لها UUID في الـ meta
      const ordersWithUuid = pendingOrders.filter((order: any) => {
        try {
          const meta = typeof order.meta === "string" ? JSON.parse(order.meta) : (order.meta || {});
          return !!(meta?.ahminix_order_id || meta?.ahminix_order_uuid);
        } catch { return false; }
      });

      if (!ordersWithUuid.length) return;

      console.log(`[AUTO-REFRESH] فحص ${ordersWithUuid.length} طلب لهم UUID...`);

      for (const order of ordersWithUuid) {
        try {
          const meta = typeof order.meta === "string" ? JSON.parse(order.meta) : (order.meta || {});
          const ahminixId   = meta?.ahminix_order_id;
          const ahminixUuid = meta?.ahminix_order_uuid;
          if (!ahminixId && !ahminixUuid) continue;

          // نحاول بالـ UUID أولاً (أكثر موثوقية)، ثم بالـ numeric ID
          let checkRes: any = null;
          if (ahminixUuid && ahminixUuid !== String(ahminixId)) {
            checkRes = await ahminixCheckOrder(ahminixUuid, true);
            if (checkRes?.status !== "OK" || !checkRes?.data?.[0]) {
              checkRes = null;
            }
          }
          if (!checkRes && ahminixId) {
            const isUuid = String(ahminixId).includes("-");
            checkRes = await ahminixCheckOrder(ahminixId, isUuid);
          }

          if (checkRes?.status !== "OK" || !checkRes?.data?.[0]) continue;

          const ext = checkRes.data[0];
          const newStatus = mapAhminixStatus(ext.status);

          // إذا لا يزال في معالجة ولم يتغير → تخطَّ
          const currentIsProcessing = ["processing", "pending"].includes(order.status);
          if (newStatus === "processing" && currentIsProcessing) continue;

          const normalizedReplay = normalizeReplayApi(ext.replay_api);

          // تحديث الطلب في قاعدة البيانات إذا تغيرت الحالة
          if (newStatus !== order.status) {
            const updatedMeta = {
              ...meta,
              ahminix_status: ext.status,
              ahminix_replay: normalizedReplay,
              completed_at: new Date().toISOString()
            };
            await supabase.from("orders").update({
              status: newStatus,
              meta: JSON.stringify(updatedMeta)
            }).eq("id", order.id);

            // إعادة الرصيد إذا ألغي
            if (newStatus === "cancelled") {
              await supabase.rpc("increment_balance", {
                user_id_param: order.user_id,
                amount_param: order.total_amount
              });
            }

            // إشعار push للمستخدم
            if (order.user_id) {
              const notifTitle = newStatus === "completed" ? "✅ تم تنفيذ طلبك!" : "❌ تم إلغاء طلبك";
              const notifBody = newStatus === "completed"
                ? `تم تنفيذ طلب ${meta?.product_name || ""} بنجاح`
                : `تم إلغاء طلب ${meta?.product_name || ""} وإعادة رصيدك`;
              await sendPushNotification(String(order.user_id), notifTitle, notifBody, "/");
              await supabase.from("notifications").insert({
                user_id: order.user_id,
                title: notifTitle,
                message: notifBody,
                type: newStatus === "completed" ? "success" : "warning"
              });
            }

            // إشعار تلجرام للمستخدم
            const { data: userTg } = await supabase
              .from("users").select("telegram_chat_id, name").eq("id", order.user_id).single();

            if (userTg?.telegram_chat_id && userBot) {
              if (newStatus === "completed") {
                let msg = `✅ تم تنفيذ طلبك!\n\nالطلب: #ORD${order.id}\nالمنتج: ${meta?.product_name || ""}`;
                if (normalizedReplay.length > 0) {
                  msg += `\n\n🎁 بيانات التفعيل:\n${normalizedReplay.join("\n")}`;
                }
                userBot.sendMessage(userTg.telegram_chat_id, msg).catch(() => {});
              } else {
                userBot.sendMessage(
                  userTg.telegram_chat_id,
                  `❌ تم إلغاء طلبك #ORD${order.id} وتم إعادة رصيدك.`
                ).catch(() => {});
              }
            }

            console.log(`[AUTO-REFRESH] Order #${order.id}: ${order.status} → ${newStatus}, replay=${normalizedReplay.length}`);
          }
        } catch (e: any) {
          console.error(`[AUTO-REFRESH] Error on order #${order.id}:`, e.message);
        }
      }
    } catch (e: any) {
      console.error("[AUTO-REFRESH] Error:", e.message);
    }
  };

  if (AHMINIX_TOKEN) {
    // تشغيل فوري بعد 8 ثوانٍ من بدء السيرفر لتحديث كل الطلبات المعلقة
    setTimeout(runAutoRefreshOrders, 8000);
    // ثم كل دقيقتين باستمرار
    setInterval(runAutoRefreshOrders, 2 * 60 * 1000);
    console.log("[AUTO-REFRESH] Started - checking all pending UUID orders every 2 minutes + immediately on startup");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // =================== AUTO PRODUCT SYNC (كل ساعة) ===================
  const autoSyncProducts = async () => {
    if (!AHMINIX_TOKEN) return;
    try {
      console.log("[AUTO-SYNC] بدء مزامنة المنتجات من API...");
      const apiProducts = await ahminixGetProducts();
      if (!apiProducts.length) { console.log("[AUTO-SYNC] لا منتجات من API"); return; }

      // جلب كل منتجات external_api من قاعدة البيانات
      const { data: dbProducts } = await supabase
        .from("products")
        .select("id, external_id, available, name")
        .eq("store_type", "external_api")
        .not("external_id", "is", null);

      const apiMap = new Map<string, any>();
      for (const p of apiProducts) apiMap.set(String(p.id), p);

      let updated = 0, markedUnavailable = 0, restored = 0, deleted = 0;

      for (const dbProd of (dbProducts || [])) {
        const extId = String(dbProd.external_id);
        const apiProd = apiMap.get(extId);

        if (!apiProd) {
          // المنتج اختفى تماماً من API → احذفه من قاعدة البيانات
          await supabase.from("products").delete().eq("id", dbProd.id);
          deleted++;
          continue;
        }

        const apiAvailable = apiProd.available !== false;

        if (!apiAvailable && dbProd.available) {
          // أصبح غير متوفر → ضعه رمادياً (available = false) بدل الحذف
          await supabase.from("products")
            .update({ available: false, name: apiProd.name })
            .eq("id", dbProd.id);
          markedUnavailable++;
        } else if (apiAvailable && !dbProd.available) {
          // عاد متوفراً → أعد تفعيله
          await supabase.from("products")
            .update({ available: true, name: apiProd.name })
            .eq("id", dbProd.id);
          restored++;
        } else if (apiAvailable && dbProd.name !== apiProd.name) {
          // تحديث الاسم فقط إذا تغيّر
          await supabase.from("products")
            .update({ name: apiProd.name })
            .eq("id", dbProd.id);
          updated++;
        }
      }

      console.log(`[AUTO-SYNC] اكتملت: تحديث=${updated}, تعطيل=${markedUnavailable}, استعادة=${restored}, حذف=${deleted}`);
    } catch (e: any) {
      console.error("[AUTO-SYNC] خطأ:", e.message);
    }
  };

  // تشغيل فوري بعد 10 ثوانٍ ثم كل ساعة
  setTimeout(autoSyncProducts, 10000);
  setInterval(autoSyncProducts, 60 * 60 * 1000);
  console.log("[AUTO-SYNC] مجدول — كل ساعة");

  // =================== TELEGRAM BOTS ===================
  startBots();

  // Graceful shutdown
  const shutdown = () => {
    console.log("Shutting down gracefully...");
    if (userBot) userBot.stopPolling();
    if (adminBot) adminBot.stopPolling();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  process.on("unhandledRejection", (reason, promise) => console.error("Unhandled Rejection:", promise, reason));
}


// ============================================================
// HELPER: حذف مستخدم مع كل بياناته المرتبطة
// ============================================================
async function deleteUserCompletely(userId: string) {
  // الترتيب مهم - نحذف الجداول الفرعية أولاً قبل الجداول الرئيسية
  await supabase.from("order_items").delete().in(
    "order_id",
    (await supabase.from("orders").select("id").eq("user_id", userId)).data?.map((o: any) => o.id) || []
  );
  await supabase.from("orders").delete().eq("user_id", userId);
  await supabase.from("transactions").delete().eq("user_id", userId);
  await supabase.from("notifications").delete().eq("user_id", userId);
  await supabase.from("messages").delete().eq("user_id", userId);
  await supabase.from("voucher_uses").delete().eq("user_id", userId);
  await supabase.from("push_subscriptions").delete().eq("user_id", userId);
  await supabase.from("daily_message_counts").delete().eq("user_id", userId);
  await supabase.from("telegram_linking_codes").delete().eq("user_id", userId);
  await supabase.from("user_stats").delete().eq("user_id", userId);
  // أخيراً نحذف المستخدم نفسه
  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) throw error;
}

// ============================================================
// HELPER: Apply Reward Logic - جوائز رمزية فقط بدون رصيد
// ============================================================
async function applyReward(userId: string, goalIndex: number) {
  // تحديث claimed_reward_index أولاً
  await supabase.from("user_stats").update({ claimed_reward_index: goalIndex }).eq("user_id", userId);

  if (goalIndex === 0) {
    // 🥉 وسام البداية + لقب "ناشئ" + إطار برونزي
    await supabase.from("user_stats").update({ profile_badge: "bronze", user_title: "ناشئ", frame: "bronze" }).eq("user_id", userId);
  } else if (goalIndex === 1) {
    // ⭐ شارة النشاط + لقب "نشيط" + إطار فضي
    await supabase.from("user_stats").update({ profile_badge: "active", user_title: "نشيط", frame: "silver" }).eq("user_id", userId);
  } else if (goalIndex === 2) {
    // ⚡ شارة الطاقة + لقب "متميز" + رمز تعبيري
    await supabase.from("user_stats").update({ profile_badge: "energy", user_title: "متميز", profile_emoji: "⚡" }).eq("user_id", userId);
  } else if (goalIndex === 3) {
    // 🥈 شارة فضية + لقب VIP + إطار VIP + أولوية طلبات
    await supabase.from("user_stats").update({ profile_badge: "silver", user_title: "VIP", frame: "vip", has_priority_orders: true }).eq("user_id", userId);
  } else if (goalIndex === 4) {
    // 👑 تاج ذهبي + لقب "نجم" + إطار ذهبي متحرك + ثيم أصفر
    await supabase.from("user_stats").update({ profile_badge: "gold", user_title: "نجم", frame: "gold_animated", custom_theme_color: "yellow" }).eq("user_id", userId);
  } else if (goalIndex === 5) {
    // 💎 شارة الماس + لقب "أسطورة" + ثيم أحمر + دعم خاص + خصم 3% مدى الحياة
    await supabase.from("user_stats").update({
      profile_badge: "diamond", user_title: "أسطورة",
      custom_theme_color: "red", has_special_support: true,
      lifetime_discount: 3
    }).eq("user_id", userId);
  } else if (goalIndex === 6) {
    // 🔥 شارة أسطورية + لقب "أسطورة الشحن" + كل الثيمات + دعم خاص + خصم 5% مدى الحياة
    await supabase.from("user_stats").update({
      profile_badge: "legendary", user_title: "أسطورة الشحن",
      custom_theme_color: "any", has_special_support: true, has_priority_orders: true,
      lifetime_discount: 5
    }).eq("user_id", userId);
  }
}

// ============================================================
// BOTS STARTUP
// ============================================================
async function startBots() {
  await new Promise(resolve => setTimeout(resolve, 3000));

  // ====== ADMIN BOT ======
  const adminBotToken = process.env.TELEGRAM_BOT_TOKEN;
  if (adminBotToken) {
    try {
      adminBot = new TelegramBot(adminBotToken, { polling: true });
      const adminChatId = process.env.TELEGRAM_CHAT_ID;

      adminBot.on("polling_error", (err: any) => {
        if (err.message.includes("409 Conflict")) {
          console.warn("Admin Bot polling conflict. Ignoring.");
        } else {
          console.error("Admin Bot polling error:", err);
        }
      });

      adminBot.onText(/\/start/, (msg) => {
        if (msg.chat.id.toString() !== adminChatId) return;
        const welcomeMsg =
          `أهلاً بك في بوت الإدارة 🛠️\n\n` +
          `📢 الإشعارات:\n/nall - إشعار للجميع\n/nhe - إشعار لمستخدم محدد\n\n` +
          `👤 المستخدمين:\n/topup - شحن رصيد يدوي\n/block - حظر مؤقت\n/deli - حذف مستخدم\n/vip - ترقية لـ VIP\n\n` +
          `🛠️ المتجر:\n/cat - إضافة قسم\n/sub - إضافة قسم فرعي\n/subsub - إضافة قسم فرعي فرعي\n/prod - إضافة منتج\n/editprice - تعديل سعر\n/banner - إضافة بانر\n/offer - إضافة عرض\n/voucher - إضافة قسيمة\n\n` +
          `🗑️ الحذف:\n/delcat /delsub /delsubsub /delprod /delbanner /deloffer /delvoucher /delpm`;
        adminBot!.sendMessage(msg.chat.id, welcomeMsg);
      });

      adminBot.onText(/\/nall/, (msg) => {
        if (msg.chat.id.toString() !== adminChatId) return;
        userStates.set(msg.chat.id, { step: "admin_broadcast_msg", data: {} });
        adminBot!.sendMessage(msg.chat.id, "📢 يرجى إدخال نص الإشعار العام:");
      });

      adminBot.onText(/\/nhe/, (msg) => {
        if (msg.chat.id.toString() !== adminChatId) return;
        userStates.set(msg.chat.id, { step: "admin_private_msg_pn", data: {} });
        adminBot!.sendMessage(msg.chat.id, "👤 يرجى إدخال رقم الدخول للمستخدم:");
      });

      adminBot.onText(/\/topup/, (msg) => {
        if (msg.chat.id.toString() !== adminChatId) return;
        userStates.set(msg.chat.id, { step: "admin_manual_topup_pn", data: {} });
        adminBot!.sendMessage(msg.chat.id, "💰 يرجى إدخال رقم الدخول للمستخدم لشحن رصيده:");
      });

      adminBot.onText(/\/block/, (msg) => {
        if (msg.chat.id.toString() !== adminChatId) return;
        userStates.set(msg.chat.id, { step: "admin_block_pn", data: {} });
        adminBot!.sendMessage(msg.chat.id, "🚫 يرجى إدخال رقم الدخول للمستخدم لحظره مؤقتاً:");
      });

      adminBot.onText(/\/deli/, (msg) => {
        if (msg.chat.id.toString() !== adminChatId) return;
        userStates.set(msg.chat.id, { step: "admin_delete_user_pn", data: {} });
        adminBot!.sendMessage(msg.chat.id, "🗑️ يرجى إدخال رقم الدخول للمستخدم لحذفه نهائياً:");
      });

      adminBot.onText(/\/vip/, (msg) => {
        if (msg.chat.id.toString() !== adminChatId) return;
        userStates.set(msg.chat.id, { step: "admin_grant_vip_pn", data: {} });
        adminBot!.sendMessage(msg.chat.id, "💎 يرجى إدخال رقم الدخول للمستخدم لترقيته لـ VIP:");
      });

      adminBot.onText(/\/cat/, (msg) => {
        if (msg.chat.id.toString() !== adminChatId) return;
        userStates.set(msg.chat.id, { step: "admin_add_cat_name", data: {} });
        adminBot!.sendMessage(msg.chat.id, "📁 يرجى إدخال اسم القسم الجديد:");
      });

      adminBot.onText(/\/sub(?!sub)/, async (msg) => {
        if (msg.chat.id.toString() !== adminChatId) return;
        const { data: cats } = await supabase.from("categories").select("id, name").eq("active", true).order("order_index");
        if (!cats || cats.length === 0) return adminBot!.sendMessage(msg.chat.id, "❌ لا توجد أقسام رئيسية. أضف قسماً أولاً بـ /cat");
        userStates.set(msg.chat.id, { step: "admin_add_sub_catid", data: {} });
        const keyboard = cats.map((c: any) => [{ text: `📁 ${c.name}`, callback_data: `pick_cat_${c.id}` }]);
        adminBot!.sendMessage(msg.chat.id, "📂 اختر القسم الرئيسي:", { reply_markup: { inline_keyboard: keyboard } });
      });

      adminBot.onText(/\/subsub/, async (msg) => {
        if (msg.chat.id.toString() !== adminChatId) return;
        const { data: subs } = await supabase.from("subcategories").select("id, name").eq("active", true).order("order_index");
        if (!subs || subs.length === 0) return adminBot!.sendMessage(msg.chat.id, "❌ لا توجد أقسام فرعية. أضف قسماً فرعياً أولاً بـ /sub");
        userStates.set(msg.chat.id, { step: "admin_add_subsub_subid", data: {} });
        const keyboard = subs.map((s: any) => [{ text: `📂 ${s.name}`, callback_data: `pick_sub_${s.id}` }]);
        adminBot!.sendMessage(msg.chat.id, "📂 اختر القسم الفرعي:", { reply_markup: { inline_keyboard: keyboard } });
      });

      adminBot.onText(/\/prod/, async (msg) => {
        if (msg.chat.id.toString() !== adminChatId) return;
        const { data: subs } = await supabase.from("subcategories").select("id, name").eq("active", true).order("order_index");
        if (!subs || subs.length === 0) return adminBot!.sendMessage(msg.chat.id, "❌ لا توجد أقسام فرعية. أضف قسماً فرعياً أولاً بـ /sub");
        userStates.set(msg.chat.id, { step: "admin_add_prod_subid", data: {} });
        const keyboard = subs.map((s: any) => [{ text: `📂 ${s.name}`, callback_data: `pick_prodsub_${s.id}` }]);
        adminBot!.sendMessage(msg.chat.id, "📦 اختر القسم الفرعي للمنتج:", { reply_markup: { inline_keyboard: keyboard } });
      });

      adminBot.onText(/\/editprice/, (msg) => {
        if (msg.chat.id.toString() !== adminChatId) return;
        userStates.set(msg.chat.id, { step: "admin_edit_price_id", data: {} });
        adminBot!.sendMessage(msg.chat.id, "💰 يرجى إدخال ID المنتج لتعديل سعره:");
      });

      adminBot.onText(/\/banner/, (msg) => {
        if (msg.chat.id.toString() !== adminChatId) return;
        userStates.set(msg.chat.id, { step: "admin_add_banner_url", data: {} });
        adminBot!.sendMessage(msg.chat.id, "🖼️ يرجى إدخال رابط صورة البانر:");
      });

      adminBot.onText(/\/offer/, (msg) => {
        if (msg.chat.id.toString() !== adminChatId) return;
        userStates.set(msg.chat.id, { step: "admin_add_offer_title", data: {} });
        adminBot!.sendMessage(msg.chat.id, "🔥 يرجى إدخال عنوان العرض:");
      });

      adminBot.onText(/\/voucher/, (msg) => {
        if (msg.chat.id.toString() !== adminChatId) return;
        userStates.set(msg.chat.id, { step: "admin_add_voucher_code", data: {} });
        adminBot!.sendMessage(msg.chat.id, "🎁 يرجى إدخال كود القسيمة:");
      });

      // دالة مساعدة لإرسال قائمة العناصر كأزرار
      const sendDeleteList = async (chatId: number, table: string, labelField: string, title: string, step: string, extraFields: string = "") => {
        const fields = `id, ${labelField}${extraFields ? ", " + extraFields : ""}`;
        const { data: items } = await supabase.from(table).select(fields).order("id");
        if (!items || items.length === 0) {
          return adminBot!.sendMessage(chatId, `لا توجد عناصر في ${title}.`);
        }
        userStates.set(chatId, { step, data: {} });
        const keyboard = items.map((item: any) => {
          const label = item[labelField] || `ID: ${item.id}`;
          return [{ text: `🗑️ ${label}`, callback_data: `del_select_${step}_${item.id}` }];
        });
        adminBot!.sendMessage(chatId, `🗑️ اختر ${title} المراد حذفه:`, {
          reply_markup: { inline_keyboard: keyboard }
        });
      };

      adminBot.onText(/\/delcat/, async (msg) => {
        if (msg.chat.id.toString() !== adminChatId) return;
        await sendDeleteList(msg.chat.id, "categories", "name", "القسم", "admin_del_cat_id");
      });

      adminBot.onText(/\/delsub/, async (msg) => {
        if (msg.chat.id.toString() !== adminChatId) return;
        await sendDeleteList(msg.chat.id, "subcategories", "name", "القسم الفرعي", "admin_del_sub_id");
      });

      adminBot.onText(/\/delsubsub/, async (msg) => {
        if (msg.chat.id.toString() !== adminChatId) return;
        await sendDeleteList(msg.chat.id, "sub_sub_categories", "name", "القسم الفرعي الفرعي", "admin_del_subsub_id");
      });

      adminBot.onText(/\/delprod/, async (msg) => {
        if (msg.chat.id.toString() !== adminChatId) return;
        await sendDeleteList(msg.chat.id, "products", "name", "المنتج", "admin_del_prod_id", "price");
      });

      adminBot.onText(/\/delbanner/, async (msg) => {
        if (msg.chat.id.toString() !== adminChatId) return;
        await sendDeleteList(msg.chat.id, "banners", "image_url", "البانر", "admin_del_banner_id");
      });

      adminBot.onText(/\/deloffer/, async (msg) => {
        if (msg.chat.id.toString() !== adminChatId) return;
        await sendDeleteList(msg.chat.id, "offers", "title", "العرض", "admin_del_offer_id");
      });

      adminBot.onText(/\/delvoucher/, async (msg) => {
        if (msg.chat.id.toString() !== adminChatId) return;
        await sendDeleteList(msg.chat.id, "vouchers", "code", "القسيمة", "admin_del_voucher_id");
      });

      adminBot.onText(/\/delpm/, async (msg) => {
        if (msg.chat.id.toString() !== adminChatId) return;
        await sendDeleteList(msg.chat.id, "payment_methods", "name", "طريقة الشحن", "admin_del_pm_id");
      });

      // Admin callback_query: Approve/Reject transactions & orders + Delete confirmations
      adminBot.on("callback_query", async (query) => {
        const chatId = query.message?.chat.id;
        if (!chatId || chatId.toString() !== adminChatId) return;

        const data = query.data;

        // --- معالجة اختيار عنصر للحذف (عرض تأكيد نعم/إلغاء) ---
        if (data?.startsWith("del_select_")) {
          // format: del_select_{step}_{id}
          const parts = data.split("_");
          // step يمكن أن يحتوي على _ مثل admin_del_cat_id
          // آخر جزء هو الـ id، وما قبله هو step
          const itemId = parts[parts.length - 1];
          const step = parts.slice(2, parts.length - 1).join("_");

          // جلب اسم العنصر للتأكيد
          const tableMap: any = {
            "admin_del_cat_id": { table: "categories", field: "name", label: "القسم" },
            "admin_del_sub_id": { table: "subcategories", field: "name", label: "القسم الفرعي" },
            "admin_del_subsub_id": { table: "sub_sub_categories", field: "name", label: "القسم الفرعي الفرعي" },
            "admin_del_prod_id": { table: "products", field: "name", label: "المنتج" },
            "admin_del_banner_id": { table: "banners", field: "image_url", label: "البانر" },
            "admin_del_offer_id": { table: "offers", field: "title", label: "العرض" },
            "admin_del_voucher_id": { table: "vouchers", field: "code", label: "القسيمة" },
            "admin_del_pm_id": { table: "payment_methods", field: "name", label: "طريقة الشحن" },
          };

          const info = tableMap[step];
          if (!info) {
            adminBot!.answerCallbackQuery(query.id);
            return;
          }

          const { data: item } = await supabase.from(info.table).select(`id, ${info.field}`).eq("id", itemId).single();
          const itemName = item ? item[info.field] : `ID: ${itemId}`;

          adminBot!.sendMessage(chatId, `⚠️ هل تريد حذف ${info.label}؟

📌 ${itemName}`, {
            reply_markup: {
              inline_keyboard: [[
                { text: "✅ نعم، احذف", callback_data: `del_confirm_${step}_${itemId}` },
                { text: "❌ إلغاء", callback_data: "del_cancel" }
              ]]
            }
          });
          adminBot!.answerCallbackQuery(query.id);
          return;
        }

        // --- تنفيذ الحذف بعد التأكيد ---
        if (data?.startsWith("del_confirm_")) {
          const parts = data.split("_");
          const itemId = parts[parts.length - 1];
          const step = parts.slice(2, parts.length - 1).join("_");

          const deleteMap: any = {
            "admin_del_cat_id": async () => {
              const { data: subs } = await supabase.from("subcategories").select("id").eq("category_id", itemId);
              if (subs && subs.length > 0) {
                const subIds = subs.map((s: any) => s.id);
                const { data: subsubs } = await supabase.from("sub_sub_categories").select("id").in("subcategory_id", subIds);
                if (subsubs && subsubs.length > 0) {
                  const ssIds = subsubs.map((ss: any) => ss.id);
                  await supabase.from("products").delete().in("sub_sub_category_id", ssIds);
                  await supabase.from("sub_sub_categories").delete().in("id", ssIds);
                }
                await supabase.from("products").delete().in("subcategory_id", subIds);
                await supabase.from("subcategories").delete().in("id", subIds);
              }
              await supabase.from("categories").delete().eq("id", itemId);
              return "✅ تم حذف القسم وكل محتوياته بنجاح.";
            },
            "admin_del_sub_id": async () => {
              await supabase.from("subcategories").delete().eq("id", itemId);
              return "✅ تم حذف القسم الفرعي بنجاح.";
            },
            "admin_del_subsub_id": async () => {
              await supabase.from("sub_sub_categories").delete().eq("id", itemId);
              return "✅ تم حذف القسم الفرعي الفرعي بنجاح.";
            },
            "admin_del_prod_id": async () => {
              await supabase.from("products").delete().eq("id", itemId);
              return "✅ تم حذف المنتج بنجاح.";
            },
            "admin_del_banner_id": async () => {
              await supabase.from("banners").delete().eq("id", itemId);
              return "✅ تم حذف البانر بنجاح.";
            },
            "admin_del_offer_id": async () => {
              await supabase.from("offers").delete().eq("id", itemId);
              return "✅ تم حذف العرض بنجاح.";
            },
            "admin_del_voucher_id": async () => {
              await supabase.from("vouchers").delete().eq("id", itemId);
              return "✅ تم حذف القسيمة بنجاح.";
            },
            "admin_del_pm_id": async () => {
              const { data: txCount } = await supabase.from("transactions").select("id").eq("payment_method_id", itemId).limit(1);
              if (txCount && txCount.length > 0) {
                await supabase.from("payment_methods").update({ active: false }).eq("id", itemId);
                return "⚠️ يوجد معاملات مرتبطة — تم تعطيل طريقة الشحن بدل الحذف.";
              }
              await supabase.from("payment_methods").delete().eq("id", itemId);
              return "✅ تم حذف طريقة الشحن بنجاح.";
            },
          };

          const handler = deleteMap[step];
          if (handler) {
            try {
              const msg = await handler();
              adminBot!.sendMessage(chatId, msg);
            } catch (e) {
              adminBot!.sendMessage(chatId, "❌ حدث خطأ أثناء الحذف.");
            }
          }
          adminBot!.answerCallbackQuery(query.id);
          userStates.delete(chatId);
          return;
        }

        // --- إلغاء الحذف ---
        if (data === "del_cancel") {
          adminBot!.sendMessage(chatId, "❌ تم إلغاء عملية الحذف.");
          adminBot!.answerCallbackQuery(query.id);
          userStates.delete(chatId);
          return;
        }

        // --- اختيار قسم رئيسي لإضافة قسم فرعي ---
        if (data?.startsWith("pick_cat_")) {
          const catId = data.split("_")[2];
          const state = userStates.get(chatId);
          if (state && state.step === "admin_add_sub_catid") {
            const { data: cat } = await supabase.from("categories").select("name").eq("id", catId).single();
            state.data.catId = catId;
            state.step = "admin_add_sub_name";
            adminBot!.sendMessage(chatId, `✅ القسم الرئيسي: ${cat?.name}
📂 يرجى إدخال اسم القسم الفرعي:`);
          }
          adminBot!.answerCallbackQuery(query.id);
          return;
        }

        // --- اختيار قسم فرعي لإضافة قسم فرعي فرعي ---
        if (data?.startsWith("pick_sub_")) {
          const subId = data.split("_")[2];
          const state = userStates.get(chatId);
          if (state && state.step === "admin_add_subsub_subid") {
            const { data: sub } = await supabase.from("subcategories").select("name").eq("id", subId).single();
            state.data.subId = subId;
            state.step = "admin_add_subsub_name";
            adminBot!.sendMessage(chatId, `✅ القسم الفرعي: ${sub?.name}
📂 يرجى إدخال اسم القسم الفرعي الفرعي:`);
          }
          adminBot!.answerCallbackQuery(query.id);
          return;
        }

        // --- اختيار قسم فرعي لإضافة منتج ---
        if (data?.startsWith("pick_prodsub_")) {
          const subId = data.split("_")[2];
          const state = userStates.get(chatId);
          if (state && state.step === "admin_add_prod_subid") {
            const { data: sub } = await supabase.from("subcategories").select("name").eq("id", subId).single();
            state.data.subId = subId;
            state.step = "admin_add_prod_subsubid";
            // عرض الأقسام الفرعية الفرعية كأزرار أيضاً
            const { data: subsubs } = await supabase.from("sub_sub_categories").select("id, name").eq("subcategory_id", subId).eq("active", true);
            if (subsubs && subsubs.length > 0) {
              const keyboard = subsubs.map((ss: any) => [{ text: `📂 ${ss.name}`, callback_data: `pick_subsub_${ss.id}` }]);
              keyboard.push([{ text: "⬆️ بدون قسم فرعي فرعي", callback_data: "pick_subsub_0" }]);
              adminBot!.sendMessage(chatId, `✅ القسم الفرعي: ${sub?.name}
📂 اختر القسم الفرعي الفرعي (أو بدون):`, { reply_markup: { inline_keyboard: keyboard } });
            } else {
              state.data.subSubId = null;
              state.step = "admin_add_prod_name";
              adminBot!.sendMessage(chatId, `✅ القسم الفرعي: ${sub?.name}
📦 يرجى إدخال اسم المنتج:`);
            }
          }
          adminBot!.answerCallbackQuery(query.id);
          return;
        }

        // --- اختيار قسم فرعي فرعي للمنتج ---
        if (data?.startsWith("pick_subsub_")) {
          const ssId = data.split("_")[2];
          const state = userStates.get(chatId);
          if (state && state.step === "admin_add_prod_subsubid") {
            state.data.subSubId = ssId === "0" ? null : ssId;
            state.step = "admin_add_prod_name";
            adminBot!.sendMessage(chatId, "📦 يرجى إدخال اسم المنتج:");
          }
          adminBot!.answerCallbackQuery(query.id);
          return;
        }

        if (data?.startsWith("approve_tx_")) {
          const txId = data.split("_")[2];
          const { data: tx } = await supabase.from("transactions").select("*").eq("id", txId).single();
          if (tx && tx.status === "pending") {
            await supabase.from("transactions").update({ status: "completed" }).eq("id", txId);
            await supabase.rpc("increment_balance", { user_id_param: tx.user_id, amount_param: tx.amount });
            await supabase.from("user_stats").update({ total_recharge_sum: tx.amount }).eq("user_id", tx.user_id);

            const { data: user } = await supabase.from("users").select("telegram_chat_id").eq("id", tx.user_id).single();
            if (user?.telegram_chat_id) {
              userBot?.sendMessage(user.telegram_chat_id, `✅ تم قبول طلب الشحن الخاص بك! تم إضافة ${tx.amount}$ لرصيدك.`);
            }
            adminBot!.sendMessage(chatId, `✅ تم قبول العملية #TX${txId} بنجاح.`);
          }
        } else if (data?.startsWith("reject_tx_")) {
          const txId = data.split("_")[2];
          const { data: tx } = await supabase.from("transactions").select("user_id").eq("id", txId).single();
          await supabase.from("transactions").update({ status: "rejected" }).eq("id", txId);
          if (tx?.user_id) {
            const { data: user } = await supabase.from("users").select("telegram_chat_id").eq("id", tx.user_id).single();
            if (user?.telegram_chat_id) {
              userBot?.sendMessage(user.telegram_chat_id, `❌ تم رفض طلب الشحن الخاص بك. يرجى التواصل مع الدعم الفني.`);
            }
          }
          adminBot!.sendMessage(chatId, `❌ تم رفض العملية #TX${txId}.`);
        }

        adminBot!.answerCallbackQuery(query.id);
      });

      // Admin message handler (state machine)
      adminBot.on("message", async (msg: any) => {
        const chatId = msg.chat.id;
        if (chatId.toString() !== adminChatId) return;
        const text = msg.text || "";

        // Handle replies to transaction/order notifications
        if (msg.reply_to_message) {
          const replyToText = msg.reply_to_message.text || "";
          const txMatch = replyToText.match(/#TX(\d+)/);
          const ordMatch = replyToText.match(/#ORD(\d+)/);

          if (txMatch) {
            const txId = txMatch[1];
            if (text === "تم") {
              const { data: tx } = await supabase.from("transactions").select("*").eq("id", txId).single();
              if (tx && tx.status === "pending") {
                await supabase.from("transactions").update({ status: "approved" }).eq("id", txId);
                await supabase.rpc("increment_balance", { user_id_param: tx.user_id, amount_param: tx.amount });
                const { data: user } = await supabase.from("users").select("telegram_chat_id").eq("id", tx.user_id).single();
                if (user?.telegram_chat_id) {
                  userBot?.sendMessage(user.telegram_chat_id, `✅ تم قبول طلب الشحن الخاص بك! تم إضافة ${tx.amount}$ لرصيدك.`);
                }
                adminBot!.sendMessage(chatId, `✅ تم قبول الشحن #TX${txId}`);
              }
            } else if (text === "رفض") {
              await supabase.from("transactions").update({ status: "rejected" }).eq("id", txId);
              adminBot!.sendMessage(chatId, `❌ تم رفض الشحن #TX${txId}`);
            }
          } else if (ordMatch) {
            const ordId = ordMatch[1];
            const { data: order } = await supabase.from("orders").select("*").eq("id", ordId).single();
            if (order) {
              if (text === "تم") {
                await supabase.from("orders").update({ status: "accepted" }).eq("id", ordId);
                const { data: user } = await supabase.from("users").select("telegram_chat_id").eq("id", order.user_id).single();
                if (user?.telegram_chat_id) userBot?.sendMessage(user.telegram_chat_id, `✅ تم قبول طلبك #${ordId}`);
                adminBot!.sendMessage(chatId, `✅ تم قبول الطلب #ORD${ordId}`);
              } else if (text === "رفض") {
                await supabase.from("orders").update({ status: "rejected" }).eq("id", ordId);
                adminBot!.sendMessage(chatId, `❌ تم رفض الطلب #ORD${ordId}`);
              } else {
                await supabase.from("orders").update({ admin_response: text }).eq("id", ordId);
                const { data: user } = await supabase.from("users").select("telegram_chat_id").eq("id", order.user_id).single();
                if (user?.telegram_chat_id) userBot?.sendMessage(user.telegram_chat_id, `🔔 وصلك رد جديد على طلبك #${ordId}:\n\n${text}`);
                adminBot!.sendMessage(chatId, `✅ تم إرسال الرد للطلب #ORD${ordId}`);
              }
            }
          }
          return;
        }

        if (text.startsWith("/")) return;

        const state = userStates.get(chatId);
        if (!state) return;

        if (state.step === "admin_broadcast_msg") {
          await supabase.from("notifications").insert({ title: "إعلان جديد", message: text, type: "info" });
          sendPushNotification(null, "إعلان جديد", text);
          const { data: users } = await supabase.from("users").select("telegram_chat_id").not("telegram_chat_id", "is", null);
          users?.forEach(u => userBot?.sendMessage(u.telegram_chat_id, `🔔 إعلان جديد:\n\n${text}`));
          userStates.delete(chatId);
          adminBot!.sendMessage(chatId, "✅ تم إرسال الإشعار للجميع.");

        } else if (state.step === "admin_private_msg_pn") {
          const { data: user } = await supabase.from("users").select("id").eq("id", text).single();
          if (!user) return adminBot!.sendMessage(chatId, "❌ المستخدم غير موجود.");
          state.data.pn = text;
          state.step = "admin_private_msg_text";
          adminBot!.sendMessage(chatId, "✅ تم التحقق. يرجى إدخال نص الرسالة:");

        } else if (state.step === "admin_private_msg_text") {
          const { data: user } = await supabase.from("users").select("id, telegram_chat_id").eq("id", state.data.pn).single();
          if (user) {
            await supabase.from("notifications").insert({ user_id: user.id, title: "تنبيه خاص", message: text, type: "warning" });
            sendPushNotification(user.id, "تنبيه خاص", text);
            if (user.telegram_chat_id) userBot?.sendMessage(user.telegram_chat_id, `🔔 تنبيه خاص:\n\n${text}`);
          }
          userStates.delete(chatId);
          adminBot!.sendMessage(chatId, "✅ تم إرسال الإشعار للمستخدم.");

        } else if (state.step === "admin_manual_topup_pn") {
          const { data: user } = await supabase.from("users").select("id, name").eq("id", text).single();
          if (!user) return adminBot!.sendMessage(chatId, "❌ المستخدم غير موجود.");
          state.data.pn = text;
          state.data.userName = user.name;
          state.step = "admin_manual_topup_amount";
          adminBot!.sendMessage(chatId, `✅ تم التحقق: ${user.name}\nيرجى إدخال مبلغ الشحن ($):`);

        } else if (state.step === "admin_manual_topup_amount") {
          const amount = parseFloat(text);
          if (isNaN(amount)) return adminBot!.sendMessage(chatId, "❌ يرجى إدخال مبلغ صحيح:");
          const { data: user } = await supabase.from("users").select("id").eq("id", state.data.pn).single();
          if (user) {
            await supabase.rpc("increment_balance", { user_id_param: user.id, amount_param: amount });
          }
          userStates.delete(chatId);
          adminBot!.sendMessage(chatId, `✅ تم شحن ${amount}$ للمستخدم ${state.data.userName} بنجاح.`);

        } else if (state.step === "admin_block_pn") {
          const { data: user } = await supabase.from("users").select("id, name").eq("id", text).single();
          if (!user) return adminBot!.sendMessage(chatId, "❌ المستخدم غير موجود.");
          state.data.pn = text;
          state.data.userName = user.name;
          state.step = "admin_block_minutes";
          adminBot!.sendMessage(chatId, `✅ تم التحقق: ${user.name}\nيرجى إدخال مدة الحظر بالدقائق:`);

        } else if (state.step === "admin_block_minutes") {
          const minutes = parseInt(text);
          if (isNaN(minutes)) return adminBot!.sendMessage(chatId, "❌ يرجى إدخال رقم صحيح:");
          const { data: user } = await supabase.from("users").select("id").eq("id", state.data.pn).single();
          if (user) {
            const blockedUntil = new Date(Date.now() + minutes * 60000).toISOString();
            await supabase.from("users").update({ blocked_until: blockedUntil, is_banned: true }).eq("id", user.id);
          }
          userStates.delete(chatId);
          adminBot!.sendMessage(chatId, `✅ تم حظر المستخدم ${state.data.userName} لمدة ${minutes} دقيقة.`);

        } else if (state.step === "admin_delete_user_pn") {
          const { data: user } = await supabase.from("users").select("id, name").eq("id", text).single();
          if (!user) return adminBot!.sendMessage(chatId, "❌ المستخدم غير موجود.");
          state.data.userId = user.id;
          state.data.userName = user.name;
          state.step = "admin_delete_user_confirm";
          adminBot!.sendMessage(chatId, `⚠️ هل أنت متأكد من حذف المستخدم ${user.name} نهائياً؟\nأرسل "نعم" للتأكيد:`);

        } else if (state.step === "admin_delete_user_confirm") {
          if (text === "نعم") {
            try {
              await deleteUserCompletely(state.data.userId);
              adminBot!.sendMessage(chatId, `✅ تم حذف المستخدم ${state.data.userName} وكافة بياناته نهائياً.`);
            } catch (e) {
              adminBot!.sendMessage(chatId, "❌ حدث خطأ أثناء الحذف.");
              console.error("Bot delete user error:", e);
            }
          } else {
            adminBot!.sendMessage(chatId, "❌ تم إلغاء عملية الحذف.");
          }
          userStates.delete(chatId);

        } else if (state.step === "admin_grant_vip_pn") {
          const { data: user } = await supabase.from("users").select("id, name").eq("id", text).single();
          if (!user) return adminBot!.sendMessage(chatId, "❌ المستخدم غير موجود.");
          await supabase.from("users").update({ is_vip: true }).eq("id", user.id);
          userStates.delete(chatId);
          adminBot!.sendMessage(chatId, `✅ تم ترقية المستخدم ${user.name} لـ VIP بنجاح.`);

        } else if (state.step === "admin_add_cat_name") {
          state.data.name = text;
          state.step = "admin_add_cat_url";
          adminBot!.sendMessage(chatId, "🖼️ يرجى إدخال رابط صورة القسم:");

        } else if (state.step === "admin_add_cat_url") {
          const { data: cat } = await supabase.from("categories").insert({ name: state.data.name, image_url: text, active: true, order_index: 0 }).select().single();
          userStates.delete(chatId);
          adminBot!.sendMessage(chatId, `✅ تم إضافة القسم بنجاح! ID: ${cat?.id}`);

        } else if (state.step === "admin_add_sub_catid") {
          // fallback: كتابة ID يدوياً
          const { data: cat } = await supabase.from("categories").select("id, name").eq("id", text).single();
          if (!cat) return adminBot!.sendMessage(chatId, "❌ القسم غير موجود. يرجى اختيار قسم من الأزرار.");
          state.data.catId = text;
          state.step = "admin_add_sub_name";
          adminBot!.sendMessage(chatId, `✅ القسم: ${cat.name}
📂 يرجى إدخال اسم القسم الفرعي:`);

        } else if (state.step === "admin_add_sub_name") {
          state.data.name = text;
          state.step = "admin_add_sub_url";
          adminBot!.sendMessage(chatId, "🖼️ يرجى إدخال رابط صورة القسم الفرعي:");

        } else if (state.step === "admin_add_sub_url") {
          const { data: sub } = await supabase.from("subcategories").insert({ category_id: state.data.catId, name: state.data.name, image_url: text, active: true, order_index: 0 }).select().single();
          userStates.delete(chatId);
          adminBot!.sendMessage(chatId, `✅ تم إضافة القسم الفرعي بنجاح! ID: ${sub?.id}`);

        } else if (state.step === "admin_add_subsub_subid") {
          state.data.subId = text;
          state.step = "admin_add_subsub_name";
          adminBot!.sendMessage(chatId, "📂 يرجى إدخال اسم القسم الفرعي الفرعي:");

        } else if (state.step === "admin_add_subsub_name") {
          state.data.name = text;
          state.step = "admin_add_subsub_url";
          adminBot!.sendMessage(chatId, "🖼️ يرجى إدخال رابط صورة القسم الفرعي الفرعي:");

        } else if (state.step === "admin_add_subsub_url") {
          const { data: ss } = await supabase.from("sub_sub_categories").insert({ subcategory_id: state.data.subId, name: state.data.name, image_url: text, active: true, order_index: 0 }).select().single();
          userStates.delete(chatId);
          adminBot!.sendMessage(chatId, `✅ تم إضافة القسم الفرعي الفرعي بنجاح! ID: ${ss?.id}`);

        } else if (state.step === "admin_add_prod_subid") {
          state.data.subId = text;
          state.step = "admin_add_prod_subsubid";
          adminBot!.sendMessage(chatId, "📂 يرجى إدخال ID القسم الفرعي الفرعي (أو أرسل 0 إذا لم يوجد):");

        } else if (state.step === "admin_add_prod_subsubid") {
          state.data.subSubId = text === "0" ? null : text;
          state.step = "admin_add_prod_name";
          adminBot!.sendMessage(chatId, "📦 يرجى إدخال اسم المنتج:");

        } else if (state.step === "admin_add_prod_name") {
          state.data.name = text;
          state.step = "admin_add_prod_price";
          adminBot!.sendMessage(chatId, "💰 يرجى إدخال سعر المنتج:");

        } else if (state.step === "admin_add_prod_price") {
          state.data.price = parseFloat(text);
          state.step = "admin_add_prod_desc";
          adminBot!.sendMessage(chatId, "📝 يرجى إدخال وصف المنتج:");

        } else if (state.step === "admin_add_prod_desc") {
          state.data.description = text;
          state.step = "admin_add_prod_url";
          adminBot!.sendMessage(chatId, "🖼️ يرجى إدخال رابط صورة المنتج:");

        } else if (state.step === "admin_add_prod_url") {
          const { data: prod } = await supabase.from("products").insert({
            subcategory_id: state.data.subId,
            sub_sub_category_id: state.data.subSubId,
            name: state.data.name,
            price: state.data.price,
            description: state.data.description,
            image_url: text,
            available: true,
            store_type: 'normal'
          }).select().single();
          userStates.delete(chatId);
          adminBot!.sendMessage(chatId, `✅ تم إضافة المنتج بنجاح! ID: ${prod?.id}`);

        } else if (state.step === "admin_edit_price_id") {
          const { data: product } = await supabase.from("products").select("id, name, price").eq("id", text).single();
          if (!product) return adminBot!.sendMessage(chatId, "❌ المنتج غير موجود.");
          state.data.prodId = text;
          state.data.oldPrice = product.price;
          state.step = "admin_edit_price_new";
          adminBot!.sendMessage(chatId, `💰 المنتج: ${product.name}\nالسعر الحالي: ${product.price}$\n\nيرجى إدخال السعر الجديد:`);

        } else if (state.step === "admin_edit_price_new") {
          const newPrice = parseFloat(text);
          if (isNaN(newPrice)) return adminBot!.sendMessage(chatId, "❌ يرجى إدخال سعر صحيح:");
          await supabase.from("products").update({ price: newPrice }).eq("id", state.data.prodId);
          userStates.delete(chatId);
          adminBot!.sendMessage(chatId, `✅ تم تحديث السعر من ${state.data.oldPrice}$ إلى ${newPrice}$`);

        } else if (state.step === "admin_add_banner_url") {
          const { data: banner } = await supabase.from("banners").insert({ image_url: text }).select().single();
          userStates.delete(chatId);
          adminBot!.sendMessage(chatId, `✅ تم إضافة البانر بنجاح! ID: ${banner?.id}`);

        } else if (state.step === "admin_add_offer_title") {
          state.data.title = text;
          state.step = "admin_add_offer_desc";
          adminBot!.sendMessage(chatId, "📝 يرجى إدخال وصف العرض:");

        } else if (state.step === "admin_add_offer_desc") {
          state.data.description = text;
          state.step = "admin_add_offer_url";
          adminBot!.sendMessage(chatId, "🖼️ يرجى إدخال رابط صورة العرض:");

        } else if (state.step === "admin_add_offer_url") {
          const { data: offer } = await supabase.from("offers").insert({ title: state.data.title, description: state.data.description, image_url: text }).select().single();
          userStates.delete(chatId);
          adminBot!.sendMessage(chatId, `✅ تم إضافة العرض بنجاح! ID: ${offer?.id}`);

        } else if (state.step === "admin_add_voucher_code") {
          state.data.code = text;
          state.step = "admin_add_voucher_amount";
          adminBot!.sendMessage(chatId, "💰 يرجى إدخال مبلغ القسيمة:");

        } else if (state.step === "admin_add_voucher_amount") {
          state.data.amount = parseFloat(text);
          state.step = "admin_add_voucher_uses";
          adminBot!.sendMessage(chatId, "🔢 يرجى إدخال أقصى عدد للاستخدامات:");

        } else if (state.step === "admin_add_voucher_uses") {
          const { data: v } = await supabase.from("vouchers").insert({ code: state.data.code, amount: state.data.amount, max_uses: parseInt(text) }).select().single();
          userStates.delete(chatId);
          adminBot!.sendMessage(chatId, `✅ تم إضافة القسيمة بنجاح! ID: ${v?.id}`);

        }
        // حالات الحذف بعد كتابة ID يدوياً (fallback)
        // هذه الحالات تُعالج الآن عبر callback_query
      });

    } catch (e) {
      console.error("Failed to start Admin Bot:", e);
    }
  }

  // ====== USER BOT ======
  const userBotToken = process.env.TELEGRAM_USER_BOT_TOKEN;
  if (!userBotToken) {
    console.warn("TELEGRAM_USER_BOT_TOKEN is not defined. User bot will not start.");
    return;
  }

  try {
    userBot = new TelegramBot(userBotToken, {
      polling: { autoStart: true, params: { timeout: 10 } }
    });

    userBot.on("polling_error", (error: any) => {
      if (error.message.includes("409 Conflict")) {
        console.warn("User Bot polling conflict. Ignoring.");
      } else {
        console.error("User Bot polling error:", error);
      }
    });

    // /start
    // --- Helper: check if user is member of the required channel ---
    const REQUIRED_CHANNEL = "@syriabit";
    async function isChannelMember(chatId: number): Promise<boolean> {
      try {
        const res = await fetch(
          `https://api.telegram.org/bot${userBotToken}/getChatMember?chat_id=${encodeURIComponent(REQUIRED_CHANNEL)}&user_id=${chatId}`
        );
        const data: any = await res.json();
        if (!data.ok) return false;
        const status: string = data.result?.status || "";
        return ["member", "administrator", "creator"].includes(status);
      } catch {
        return false;
      }
    }

    userBot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const startParam = match?.[1];
      userStates.delete(chatId);

      // --- Channel membership gate ---
      const isMember = await isChannelMember(chatId);
      if (!isMember) {
        userBot!.sendMessage(
          chatId,
          "⛔ يرجى الانضمام إلى قناتنا الرسمية أولاً ثم العودة والضغط على /start\n\n📢 القناة: https://t.me/syriabit",
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "📢 الانضمام إلى القناة", url: "https://t.me/syriabit" }],
                [{ text: "✅ انضممت، ابدأ من جديد", callback_data: "recheck_membership" }]
              ]
            }
          }
        );
        return;
      }

      if (startParam) {
        // Linking code
        const now = new Date().toISOString();
        const { data: linkingCode } = await supabase.from("telegram_linking_codes").select("*").eq("code", startParam).gt("expires_at", now).single();
        if (linkingCode) {
          await supabase.from("users").update({ telegram_chat_id: chatId }).eq("id", linkingCode.user_id);
          await supabase.from("telegram_linking_codes").delete().eq("id", linkingCode.id);
          const { data: user } = await supabase.from("users").select("*").eq("id", linkingCode.user_id).single();
          userBot!.sendMessage(chatId, "✅ تم ربط حسابك بنجاح!");
          if (user) sendMainMenu(chatId, user, userBot!);
          return;
        }

        // Referral code
        const { data: referrer } = await supabase.from("users").select("id").eq("id", startParam).single();
        if (referrer) {
          userStates.set(chatId, { step: "register_name", data: { referralCode: startParam } });
          userBot!.sendMessage(chatId, `مرحباً بك! لقد تمت دعوتك.\nيرجى إدخال اسمك الكامل لإنشاء حساب:`);
          return;
        }
      }

      const { data: user } = await supabase.from("users").select("*").eq("telegram_chat_id", chatId).single();
      if (user) {
        sendMainMenu(chatId, user, userBot!);
      } else {
        userBot!.sendMessage(chatId, "مرحباً بك في متجر فيبرو! 🛒\nيرجى تسجيل الدخول أو إنشاء حساب:", {
          reply_markup: {
            inline_keyboard: [
              [{ text: "تسجيل الدخول", callback_data: "login" }],
              [{ text: "إنشاء حساب جديد", callback_data: "register" }],
              [{ text: "تسجيل عبر كود الربط", callback_data: "login_with_code" }]
            ]
          }
        });
      }
    });

    // User bot callback_query
    userBot.on("callback_query", async (query) => {
      const chatId = query.message?.chat.id;
      if (!chatId) return;
      const data = query.data;

      userBot!.answerCallbackQuery(query.id);

      // --- Re-check channel membership ---
      if (data === "recheck_membership") {
        const isMember = await isChannelMember(chatId);
        if (!isMember) {
          userBot!.sendMessage(
            chatId,
            "❌ لم يتم التحقق من انضمامك للقناة بعد.\nيرجى الانضمام أولاً ثم المحاولة مرة أخرى.\n\n📢 https://t.me/syriabit",
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "📢 الانضمام إلى القناة", url: "https://t.me/syriabit" }],
                  [{ text: "✅ انضممت، ابدأ من جديد", callback_data: "recheck_membership" }]
                ]
              }
            }
          );
          return;
        }
        // Membership confirmed — show login or main menu
        userStates.delete(chatId);
        const { data: existingUser } = await supabase.from("users").select("*").eq("telegram_chat_id", chatId).single();
        if (existingUser) {
          sendMainMenu(chatId, existingUser, userBot!);
        } else {
          userBot!.sendMessage(chatId, "✅ تم التحقق من عضويتك! 🎉\n\nمرحباً بك في متجر فيبرو! 🛒\nيرجى تسجيل الدخول أو إنشاء حساب:", {
            reply_markup: {
              inline_keyboard: [
                [{ text: "تسجيل الدخول", callback_data: "login" }],
                [{ text: "إنشاء حساب جديد", callback_data: "register" }],
                [{ text: "تسجيل عبر كود الربط", callback_data: "login_with_code" }]
              ]
            }
          });
        }
        return;
      }

      if (data === "login") {
        userStates.set(chatId, { step: "login_email", data: {} });
        userBot!.sendMessage(chatId, "يرجى إدخال البريد الإلكتروني:");

      } else if (data === "register") {
        userStates.set(chatId, { step: "register_name", data: {} });
        userBot!.sendMessage(chatId, "يرجى إدخال اسمك الكامل:");

      } else if (data === "login_with_code") {
        userStates.set(chatId, { step: "login_with_code", data: {} });
        userBot!.sendMessage(chatId, "🆔 يرجى إدخال كود الربط المؤقت من الموقع:");

      } else if (data === "main_menu") {
        const { data: user } = await supabase.from("users").select("*").eq("telegram_chat_id", chatId).single();
        if (user) sendMainMenu(chatId, user, userBot!);

      } else if (data === "my_info") {
        const { data: user } = await supabase.from("users").select("*").eq("telegram_chat_id", chatId).single();
        if (!user) return userBot!.sendMessage(chatId, "يرجى تسجيل الدخول أولاً.");
        userBot!.sendMessage(chatId, `👤 معلوماتي:\nالاسم: ${user.name}\nالإيميل: ${user.email}\nرقم الدخول: #${user.id}\nالحالة: ${user.is_vip ? "VIP 💎" : "عادي"}`);

      } else if (data === "my_balance") {
        const { data: user } = await supabase.from("users").select("balance").eq("telegram_chat_id", chatId).single();
        userBot!.sendMessage(chatId, `💰 رصيدك الحالي هو: ${(user?.balance || 0).toFixed(2)} $`);

      } else if (data === "my_orders") {
        const { data: user } = await supabase.from("users").select("id").eq("telegram_chat_id", chatId).single();
        if (!user) return;
        const { data: orders } = await supabase.from("orders").select("id, total_amount, status, order_items(products(name))").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5);
        if (!orders || orders.length === 0) return userBot!.sendMessage(chatId, "ليس لديك طلبات سابقة.");
        let text = "📦 آخر 5 طلبات لك:\n\n";
        orders.forEach((o: any) => {
          const productName = o.order_items?.[0]?.products?.name || "منتج";
          text += `🔹 طلب #${o.id}\nالمنتج: ${productName}\nالمبلغ: ${o.total_amount}$\nالحالة: ${o.status}\n\n`;
        });
        userBot!.sendMessage(chatId, text);

      } else if (data === "my_payments") {
        const { data: user } = await supabase.from("users").select("id").eq("telegram_chat_id", chatId).single();
        if (!user) return;
        const { data: txs } = await supabase.from("transactions").select("id, amount, status, payment_methods(name)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5);
        if (!txs || txs.length === 0) return userBot!.sendMessage(chatId, "ليس لديك عمليات شحن سابقة.");
        let text = "💳 آخر 5 عمليات شحن لك:\n\n";
        txs.forEach((t: any) => {
          text += `🔹 شحن #${t.id}\nالمبلغ: ${t.amount}$\nالطريقة: ${t.payment_methods?.name || "-"}\nالحالة: ${t.status}\n\n`;
        });
        userBot!.sendMessage(chatId, text);

      } else if (data === "referral") {
        const { data: user } = await supabase.from("users").select("id").eq("telegram_chat_id", chatId).single();
        if (!user) return;
        const { data: referrals } = await supabase.from("users").select("id").eq("referred_by_id", user.id);
        const count = referrals?.length || 0;
        const botInfo = await userBot!.getMe();
        const referralLink = `https://t.me/${botInfo.username}?start=${user.id}`;
        userBot!.sendMessage(chatId, `🔗 نظام الإحالة:\n\nرابط الإحالة الخاص بك:\n${referralLink}\n\nعدد المستخدمين المسجلين عبر رابطك: ${count}\n\nتحصل على عمولة 5% عن كل عملية شراء!`);

      } else if (data === "share") {
        const { data: user } = await supabase.from("users").select("id").eq("telegram_chat_id", chatId).single();
        if (!user) return;
        const botInfo = await userBot!.getMe();
        const referralLink = `https://t.me/${botInfo.username}?start=${user.id}`;
        userBot!.sendMessage(chatId, "شارك البوت مع أصدقائك واحصل على عمولات!", {
          reply_markup: {
            inline_keyboard: [[{
              text: "مشاركة الرابط",
              url: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("اشحن ألعابك وتطبيقاتك المفضلة!")}`
            }]]
          }
        });

      } else if (data === "offers") {
        const { data: offers } = await supabase.from("offers").select("*").eq("active", true);
        if (!offers || offers.length === 0) return userBot!.sendMessage(chatId, "لا توجد عروض حالياً.");
        offers.forEach((o: any) => {
          userBot!.sendMessage(chatId, `🔥 ${o.title}\n${o.description}`, {
            reply_markup: { inline_keyboard: [[{ text: "عرض الصورة", url: o.image_url }]] }
          });
        });

      } else if (data === "privacy_policy") {
        const { data: setting } = await supabase.from("settings").select("value").eq("key", "privacy_policy").single();
        userBot!.sendMessage(chatId, `📄 سياسة الخصوصية:\n\n${setting?.value || "لا توجد سياسة حالياً."}`);

      } else if (data === "redeem_voucher") {
        userStates.set(chatId, { step: "redeem_voucher_code", data: {} });
        userBot!.sendMessage(chatId, "يرجى إدخال كود القسيمة:");

      } else if (data === "logout_bot") {
        await supabase.from("users").update({ telegram_chat_id: null }).eq("telegram_chat_id", chatId);
        userBot!.sendMessage(chatId, "👋 تم تسجيل الخروج بنجاح. يمكنك العودة في أي وقت!");

      } else if (data === "rewards") {
        const { data: user } = await supabase.from("users").select("id").eq("telegram_chat_id", chatId).single();
        if (!user) return;
        const { data: stats } = await supabase.from("user_stats").select("*").eq("user_id", user.id).single();
        const goals = [5, 15, 30, 50, 100, 200, 500];
        const rewardIcons = ["🥉","⭐","⚡","🥈","👑","💎","🔥"];
        const rewardTitles = ["الهدف الأول","الهدف الثاني","الهدف الثالث","الهدف الرابع","الهدف الخامس","الهدف السادس","الهدف السابع"];
        const rewardDescs = [
          "وسام البداية + لقب \"ناشئ\" + إطار برونزي",
          "شارة النشاط + لقب \"نشيط\" + إطار فضي",
          "شارة الطاقة + لقب \"متميز\" + رمز ⚡",
          "شارة فضية + لقب \"VIP\" + إطار VIP + أولوية في الطلبات",
          "تاج ذهبي + لقب \"نجم\" + إطار ذهبي + ثيم أصفر",
          "شارة الماس + لقب \"أسطورة\" + ثيم أحمر + دعم خاص + 🏷️ خصم 3% مدى الحياة",
          "شارة أسطورية + لقب \"أسطورة الشحن\" + جميع الثيمات + دعم خاص + 🏷️ خصم 5% مدى الحياة"
        ];

        const totalRecharge = stats?.total_recharge_sum || 0;
        const claimed = stats?.claimed_reward_index ?? -1;
        let text = `🎁 نظام المكافآت\n\n💰 إجمالي شحنك: ${totalRecharge.toFixed(2)}$\n`;
        if (stats?.lifetime_discount > 0) text += `🏷️ خصمك الحالي: ${stats.lifetime_discount}% مدى الحياة\n`;
        text += `\n`;
        const keyboard: any[] = [];

        for (let i = 0; i < goals.length; i++) {
          const isClaimed = claimed >= i;
          const isReached = totalRecharge >= goals[i];
          const canClaim = isReached && claimed === i - 1;
          const remaining = Math.max(0, goals[i] - totalRecharge).toFixed(2);
          const statusIcon = isClaimed ? "✅" : (isReached ? "🎁" : "🔒");
          const statusText = isClaimed ? "تم الاستلام" : (isReached ? "جاهز للاستلام!" : `يتبقى ${remaining}$`);
          text += `${rewardIcons[i]} ${rewardTitles[i]} (${goals[i]}$)\n${rewardDescs[i]}\n${statusIcon} ${statusText}\n\n`;
          if (canClaim) keyboard.push([{ text: `${rewardIcons[i]} استلام ${rewardTitles[i]}`, callback_data: `claim_reward_${i}` }]);
        }
        keyboard.push([{ text: "🔙 الرجوع للقائمة الرئيسية", callback_data: "main_menu" }]);
        userBot!.sendMessage(chatId, text, { reply_markup: { inline_keyboard: keyboard } });

      } else if (data?.startsWith("claim_reward_")) {
        const goalIndex = parseInt(data.split("_")[2]);
        const { data: user } = await supabase.from("users").select("id").eq("telegram_chat_id", chatId).single();
        if (!user) return;
        const { data: stats } = await supabase.from("user_stats").select("*").eq("user_id", user.id).single();
        const goals = [5, 15, 30, 50, 100, 200, 500];

        if ((stats?.claimed_reward_index ?? -1) >= goalIndex) return userBot!.sendMessage(chatId, "❌ لقد استلمت هذه المكافأة مسبقاً.");
        if ((stats?.total_recharge_sum || 0) < goals[goalIndex]) return userBot!.sendMessage(chatId, "❌ لم تصل لهذا الهدف بعد.");
        if (goalIndex > 0 && (stats?.claimed_reward_index ?? -1) < goalIndex - 1) return userBot!.sendMessage(chatId, "❌ يرجى استلام المكافآت السابقة أولاً.");

        try {
          await applyReward(user.id, goalIndex);
          const rewardNames = ["الأول","الثاني","الثالث","الرابع","الخامس","السادس","السابع"];
          userBot!.sendMessage(chatId, `✅ مبروك! تم استلام مكافأة الهدف ${rewardNames[goalIndex] || goalIndex+1} بنجاح!\n\nاذهب للموقع لرؤية جائزتك في ملفك الشخصي.`);
        } catch (e) {
          userBot!.sendMessage(chatId, "❌ حدث خطأ أثناء استلام المكافأة.");
        }

      } else if (data === "topup_balance") {
        const { data: user } = await supabase.from("users").select("id").eq("telegram_chat_id", chatId).single();
        if (!user) return userBot!.sendMessage(chatId, "يرجى تسجيل الدخول أولاً.");

        const { data: pending } = await supabase.from("transactions").select("id").eq("user_id", user.id).eq("status", "pending");
        if ((pending?.length || 0) >= 2) return userBot!.sendMessage(chatId, "⚠️ لا يمكنك إرسال أكثر من مدفوعتين قيد المراجعة.");

        const { data: methods } = await supabase.from("payment_methods").select("*").eq("active", true);
        if (!methods || methods.length === 0) return userBot!.sendMessage(chatId, "لا توجد طرق دفع متاحة حالياً.");
        const keyboard = methods.map((m: any) => [{ text: m.name, callback_data: `topup_method_${m.id}` }]);
        userBot!.sendMessage(chatId, "اختر طريقة الدفع:", { reply_markup: { inline_keyboard: keyboard } });

      } else if (data?.startsWith("topup_method_")) {
        const methodId = data.split("_")[2];
        const { data: method } = await supabase.from("payment_methods").select("*").eq("id", methodId).single();
        userStates.set(chatId, { step: "topup_amount", data: { methodId } });
        userBot!.sendMessage(chatId, `💳 طريقة الدفع: ${method?.name}\nالعنوان: ${method?.wallet_address}\nالحد الأدنى: ${method?.min_amount} $\n\n${method?.instructions || ""}\n\nيرجى إدخال المبلغ المراد شحنه ($):`);

      } else if (data === "charge_apps") {
        const { data: categories } = await supabase.from("categories").select("*").eq("active", true).order("order_index");
        if (!categories || categories.length === 0) return userBot!.sendMessage(chatId, "لا توجد أقسام متاحة.");
        const keyboard = categories.map((c: any) => [{ text: c.name, callback_data: `cat_${c.id}` }]);
        userBot!.sendMessage(chatId, "اختر القسم:", { reply_markup: { inline_keyboard: keyboard } });

      } else if (data?.startsWith("cat_")) {
        const catId = data.split("_")[1];
        const { data: subs } = await supabase.from("subcategories").select("*").eq("category_id", catId).eq("active", true);
        if (!subs || subs.length === 0) return userBot!.sendMessage(chatId, "لا توجد أقسام فرعية.");
        const keyboard = subs.map((s: any) => [{ text: s.name, callback_data: `sub_${s.id}` }]);
        userBot!.sendMessage(chatId, "اختر القسم الفرعي:", { reply_markup: { inline_keyboard: keyboard } });

      } else if (data?.startsWith("sub_")) {
        const subId = data.split("_")[1];
        const { data: products } = await supabase.from("products").select("*").eq("subcategory_id", subId).eq("available", true);
        if (!products || products.length === 0) return userBot!.sendMessage(chatId, "لا توجد منتجات متاحة.");
        const keyboard = products.map((p: any) => [{ text: `${p.name} - ${p.price}$`, callback_data: `buy_${p.id}` }]);
        userBot!.sendMessage(chatId, "اختر المنتج للشراء:", { reply_markup: { inline_keyboard: keyboard } });

      } else if (data?.startsWith("buy_")) {
        const prodId = data.split("_")[1];
        const { data: product } = await supabase.from("products").select("*").eq("id", prodId).single();
        const { data: user } = await supabase.from("users").select("*").eq("telegram_chat_id", chatId).single();
        if (!user) return userBot!.sendMessage(chatId, "يرجى تسجيل الدخول أولاً.");
        if (!product) return userBot!.sendMessage(chatId, "المنتج غير موجود.");

        const price = user.is_vip ? product.price * 0.95 : product.price;
        if (user.balance < price) return userBot!.sendMessage(chatId, `❌ رصيدك غير كافٍ. السعر: ${price.toFixed(2)}$ ورصيدك: ${user.balance.toFixed(2)}$`);

        if (product.requires_input || product.store_type === "quick_order") {
          const prompt = product.store_type === "quick_order" ? "يرجى إدخال معرف اللاعب (ID):" : "يرجى إدخال البيانات المطلوبة للمنتج:";
          userStates.set(chatId, { step: "purchase_input", data: { productId: prodId, price, product, user } });
          userBot!.sendMessage(chatId, prompt);
        } else {
          processBotOrder(chatId, user, product, price, {});
        }
      }
    });

    // User bot message handler (state machine)
    userBot.on("message", async (msg: any) => {
      const chatId = msg.chat.id;
      const text = msg.text;
      const photo = msg.photo;

      // Auto-detect linking code (6 char alphanumeric)
      if (text && text.length === 6 && /^[A-Z0-9]+$/.test(text.toUpperCase())) {
        const code = text.toUpperCase();
        const now = new Date().toISOString();
        const { data: linkingCode } = await supabase.from("telegram_linking_codes").select("*").eq("code", code).gt("expires_at", now).single();
        if (linkingCode) {
          const { data: user } = await supabase.from("users").select("*").eq("id", linkingCode.user_id).single();
          await supabase.from("users").update({ telegram_chat_id: chatId }).eq("id", linkingCode.user_id);
          await supabase.from("telegram_linking_codes").delete().eq("id", linkingCode.id);
          userStates.delete(chatId);
          userBot!.sendMessage(chatId, "✅ تم تسجيل الدخول بنجاح عبر الكود!");
          if (user) sendMainMenu(chatId, user, userBot!);
          return;
        }
      }

      // Photo: receipt upload
      if (photo) {
        const state = userStates.get(chatId);
        if (state && state.step === "topup_receipt") {
          const { data: user } = await supabase.from("users").select("*").eq("telegram_chat_id", chatId).single();
          if (!user) return;
          const photoItem = photo[photo.length - 1];
          userBot!.sendMessage(chatId, "⏳ جاري معالجة الإيصال، يرجى الانتظار...");
          try {
            const file = await userBot!.getFile(photoItem.file_id);
            const fileUrl = `https://api.telegram.org/file/bot${userBotToken}/${file.file_path}`;
            const fileRes = await fetch(fileUrl);
            const buffer = await fileRes.arrayBuffer();
            const base64 = Buffer.from(buffer).toString("base64");

            const imgbbKey = process.env.IMGBB_API_KEY || "5d069b43efb47ed02b0a00a4069f53f9";
            const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
              method: "POST",
              body: new URLSearchParams({ image: base64 })
            });
            const imgbbData = await imgbbRes.json() as any;
            if (!imgbbData.success) throw new Error("ImgBB upload failed");

            const receiptUrl = imgbbData.data.url;
            const { data: method } = await supabase.from("payment_methods").select("name").eq("id", state.data.methodId).single();

            const { data: tx } = await supabase.from("transactions").insert({
              user_id: user.id,
              amount: state.data.amount,
              status: "pending",
              payment_method_id: state.data.methodId,
              receipt_image_url: receiptUrl
            }).select().single();

            const adminChatId = process.env.TELEGRAM_CHAT_ID;
            if (adminChatId && adminBot && tx) {
              const adminMsg = `💰 طلب شحن جديد! #TX${tx.id}\n\nالمستخدم: ${user.name}\nالمبلغ: ${state.data.amount}$\nالطريقة: ${method?.name}\n\nرابط الإيصال: ${receiptUrl}`;
              adminBot.sendMessage(adminChatId, adminMsg, {
                reply_markup: {
                  inline_keyboard: [[
                    { text: "✅ قبول", callback_data: `approve_tx_${tx.id}` },
                    { text: "❌ رفض", callback_data: `reject_tx_${tx.id}` }
                  ]]
                }
              });
            }

            userBot!.sendMessage(chatId, "✅ تم إرسال طلب الشحن بنجاح! سيتم مراجعته من قبل الإدارة قريباً.");
            userStates.delete(chatId);
          } catch (error) {
            console.error("Receipt upload error:", error);
            userBot!.sendMessage(chatId, "❌ حدث خطأ أثناء رفع الإيصال. يرجى المحاولة مرة أخرى.");
          }
          return;
        }
      }

      if (!text || text.startsWith("/")) return;

      // Persistent keyboard buttons
      if (text === "💬 الدعم الفني") {
        const { data: setting } = await supabase.from("settings").select("value").eq("key", "support_whatsapp").single();
        const link = setting ? `https://wa.me/${setting.value.replace("+", "")}` : "https://t.me/your_support_username";
        return userBot!.sendMessage(chatId, `يمكنك التواصل مع الدعم الفني عبر الرابط التالي:\n${link}`);
      } else if (text === "📄 سياسة الخصوصية") {
        const { data: setting } = await supabase.from("settings").select("value").eq("key", "privacy_policy").single();
        return userBot!.sendMessage(chatId, `📄 سياسة الخصوصية:\n\n${setting?.value || "لا توجد سياسة حالياً."}`);
      } else if (text === "🚪 تسجيل الخروج") {
        await supabase.from("users").update({ telegram_chat_id: null }).eq("telegram_chat_id", chatId);
        return userBot!.sendMessage(chatId, "👋 تم تسجيل الخروج بنجاح. يمكنك العودة في أي وقت!");
      }

      const state = userStates.get(chatId);
      if (!state) return;

      if (state.step === "login_with_code") {
        const code = text.toUpperCase();
        const now = new Date().toISOString();
        const { data: linkingCode } = await supabase.from("telegram_linking_codes").select("*").eq("code", code).gt("expires_at", now).single();
        if (!linkingCode) {
          userBot!.sendMessage(chatId, "❌ الكود غير صحيح أو منتهي الصلاحية.");
          userStates.delete(chatId);
          return;
        }
        const { data: user } = await supabase.from("users").select("*").eq("id", linkingCode.user_id).single();
        await supabase.from("users").update({ telegram_chat_id: chatId }).eq("id", linkingCode.user_id);
        await supabase.from("telegram_linking_codes").delete().eq("id", linkingCode.id);
        userStates.delete(chatId);
        userBot!.sendMessage(chatId, "✅ تم تسجيل الدخول بنجاح!");
        if (user) sendMainMenu(chatId, user, userBot!);

      } else if (state.step === "topup_amount") {
        const amount = parseFloat(text);
        if (isNaN(amount) || amount <= 0) return userBot!.sendMessage(chatId, "❌ يرجى إدخال مبلغ صحيح:");
        state.data.amount = amount;
        state.step = "topup_receipt";
        userBot!.sendMessage(chatId, "📸 يرجى رفع صورة إيصال التحويل:");

      } else if (state.step === "redeem_voucher_code") {
        const { data: user } = await supabase.from("users").select("*").eq("telegram_chat_id", chatId).single();
        if (!user) return userBot!.sendMessage(chatId, "يرجى تسجيل الدخول أولاً.");

        const { data: voucher } = await supabase.from("vouchers").select("*").eq("code", text).eq("active", true).single();
        if (!voucher) {
          userBot!.sendMessage(chatId, "❌ كود القسيمة غير صحيح أو غير مفعل.");
          userStates.delete(chatId);
          return;
        }

        const { data: usage } = await supabase.from("voucher_uses").select("id").eq("voucher_id", voucher.id).eq("user_id", user.id).single();
        if (usage) {
          userBot!.sendMessage(chatId, "❌ لقد استخدمت هذه القسيمة مسبقاً.");
          userStates.delete(chatId);
          return;
        }

        if (voucher.used_count >= voucher.max_uses) {
          userBot!.sendMessage(chatId, "❌ هذه القسيمة استُنفذت بالكامل.");
          userStates.delete(chatId);
          return;
        }

        await supabase.from("voucher_uses").insert({ voucher_id: voucher.id, user_id: user.id });
        await supabase.from("vouchers").update({ used_count: voucher.used_count + 1 }).eq("id", voucher.id);
        await supabase.rpc("increment_balance", { user_id_param: user.id, amount_param: voucher.amount });

        userBot!.sendMessage(chatId, `✅ تم استرداد القسيمة بنجاح! تم إضافة ${voucher.amount}$ لرصيدك.`);
        userStates.delete(chatId);

      } else if (state.step === "purchase_input") {
        const { product, user, price } = state.data;
        const extraData = product.store_type === "quick_order" ? { playerId: text, storeType: "quick_order" } : { input: text };
        userStates.delete(chatId);
        processBotOrder(chatId, user, product, price, extraData);

      } else if (state.step === "login_email") {
        state.data.email = text;
        state.step = "login_password";
        userBot!.sendMessage(chatId, "يرجى إدخال كلمة المرور:");

      } else if (state.step === "login_password") {
        const { data: user } = await supabase.from("users").select("*").eq("email", state.data.email).single();
        if (user) {
          const isMatch = await bcrypt.compare(text, user.password_hash);
          if (isMatch) {
            await supabase.from("users").update({ telegram_chat_id: chatId }).eq("id", user.id);
            userStates.delete(chatId);
            userBot!.sendMessage(chatId, "✅ تم تسجيل الدخول بنجاح!");
            sendMainMenu(chatId, user, userBot!);
            return;
          }
        }
        userBot!.sendMessage(chatId, "❌ البريد الإلكتروني أو كلمة المرور غير صحيحة. حاول مرة أخرى /start");
        userStates.delete(chatId);

      } else if (state.step === "register_name") {
        state.data.name = text;
        state.step = "register_email";
        userBot!.sendMessage(chatId, "يرجى إدخال البريد الإلكتروني:");

      } else if (state.step === "register_email") {
        state.data.email = text;
        state.step = "register_phone";
        userBot!.sendMessage(chatId, "يرجى إدخال رقم الهاتف:");

      } else if (state.step === "register_phone") {
        state.data.phone = text;
        state.step = "register_password";
        userBot!.sendMessage(chatId, "يرجى إدخال كلمة المرور (8 أحرف وأرقام على الأقل):");

      } else if (state.step === "register_password") {
        const pw = text.trim();
        if (pw.length < 8 || !/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) {
          return userBot!.sendMessage(chatId, "❌ كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على أحرف وأرقام. أعد الإدخال:");
        }
        state.data.password = pw;
        try {
          let referredById = null;
          if (state.data.referralCode) {
            const { data: referrer } = await supabase.from("users").select("id").eq("id", state.data.referralCode).single();
            if (referrer) referredById = referrer.id;
          }

          const salt = await bcrypt.genSalt(12);
          const hashedPassword = await bcrypt.hash(state.data.password, salt);

          // تحقق أن البريد غير مسجل
          const { data: existing } = await supabase.from("users").select("id, is_verified").eq("email", state.data.email).single();
          if (existing?.is_verified) {
            userStates.delete(chatId);
            return userBot!.sendMessage(chatId, "❌ هذا البريد الإلكتروني مسجل مسبقاً. استخدم /start لتسجيل الدخول.");
          }

          let userId: number;
          if (existing && !existing.is_verified) {
            await supabase.from("users").update({ name: state.data.name, password_hash: hashedPassword, phone: state.data.phone, telegram_chat_id: chatId }).eq("id", existing.id);
            userId = existing.id;
          } else {
            const { data: newUser, error } = await supabase.from("users").insert({
              name: state.data.name,
              email: state.data.email,
              password_hash: hashedPassword,
              phone: state.data.phone,
              telegram_chat_id: chatId,
              referred_by_id: referredById,
              is_verified: false
            }).select().single();
            if (error) throw error;
            await supabase.from("user_stats").insert({ user_id: newUser.id });
            userId = newUser.id;
          }

          // إرسال OTP للبريد
          const otp = await saveOtp(state.data.email, "verify");
          const sent = await sendOtpEmail(state.data.email, otp, "verify");
          // [FIX] لا نطبع قيمة OTP في الـ logs
          console.log(`[BOT-REGISTER] OTP sent to ${state.data.email} | delivered=${sent}`);

          state.data.userId = userId;
          state.step = "register_otp";
          userBot!.sendMessage(chatId,
            `📧 تم إرسال رمز التحقق إلى بريدك:\n${state.data.email}\n\nأدخل الرمز المكون من 6 أرقام:\n\n⏱ صالح لمدة 10 دقائق`
          );
        } catch (e) {
          console.error(e);
          userBot!.sendMessage(chatId, "❌ حدث خطأ (ربما البريد مستخدم مسبقاً). حاول مرة أخرى /start");
          userStates.delete(chatId);
        }

      } else if (state.step === "register_otp") {
        const code = text.trim();
        const valid = await verifyOtp(state.data.email, code, "verify");
        if (!valid) {
          return userBot!.sendMessage(chatId, "❌ الرمز غير صحيح أو منتهي الصلاحية. أعد الإدخال أو اكتب /start للبدء من جديد.");
        }
        // تفعيل الحساب
        const { data: user } = await supabase.from("users").update({ is_verified: true }).eq("id", state.data.userId).select().single();
        if (!user) {
          userStates.delete(chatId);
          return userBot!.sendMessage(chatId, "❌ حدث خطأ. حاول مرة أخرى /start");
        }
        // إحالة
        // [FIX] تحديث referral_count في users و user_stats معاً
        if (user.referred_by_id) {
          const { data: refUser } = await supabase.from("users").select("referral_count").eq("id", user.referred_by_id).single();
          const newBotRefCount = (refUser?.referral_count || 0) + 1;
          await supabase.from("users").update({ referral_count: newBotRefCount }).eq("id", user.referred_by_id);
          await supabase.from("user_stats").update({ referral_count: newBotRefCount }).eq("user_id", user.referred_by_id);
        }
        userStates.delete(chatId);
        userBot!.sendMessage(chatId, "✅ تم تفعيل حسابك بنجاح! مرحباً بك 🎉");
        sendMainMenu(chatId, user, userBot!);
      }
    });

  } catch (e) {
    console.error("Failed to start User Bot:", e);
  }
}

startServer();
