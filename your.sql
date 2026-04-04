-- ============================================================
-- VIPro Platform — Full Database Schema
-- Generated for Supabase (PostgreSQL)
-- ============================================================
-- Run this in Supabase SQL Editor to create all tables from scratch
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. USERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id                  BIGSERIAL PRIMARY KEY,
  name                TEXT NOT NULL,
  email               TEXT NOT NULL UNIQUE,
  password_hash       TEXT NOT NULL,
  phone               TEXT,
  balance             NUMERIC(12,6) NOT NULL DEFAULT 0,
  is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
  is_vip              BOOLEAN NOT NULL DEFAULT FALSE,
  is_banned           BOOLEAN NOT NULL DEFAULT FALSE,
  is_blocked          BOOLEAN NOT NULL DEFAULT FALSE,
  blocked_until       TIMESTAMPTZ,
  avatar_url          TEXT,
  referred_by_id      BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  referral_count      INT NOT NULL DEFAULT 0,
  telegram_chat_id    BIGINT,
  unread_support_count INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email        ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_referred_by  ON public.users(referred_by_id);
CREATE INDEX IF NOT EXISTS idx_users_telegram     ON public.users(telegram_chat_id);

-- ────────────────────────────────────────────────────────────
-- 2. USER_STATS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_stats (
  id                          BIGSERIAL PRIMARY KEY,
  user_id                     BIGINT NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  total_orders_count          INT NOT NULL DEFAULT 0,
  referral_count              INT NOT NULL DEFAULT 0,
  login_days_count            INT NOT NULL DEFAULT 0,
  total_recharge_sum          NUMERIC(12,6) NOT NULL DEFAULT 0,
  active_discount             NUMERIC(5,2) NOT NULL DEFAULT 0,
  discount_expires_at         TIMESTAMPTZ,
  lifetime_discount           NUMERIC(5,2) NOT NULL DEFAULT 0,
  claimed_reward_index        INT NOT NULL DEFAULT -1,
  one_product_discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  has_flaming_theme           BOOLEAN NOT NULL DEFAULT FALSE,
  has_special_support         BOOLEAN NOT NULL DEFAULT FALSE,
  has_priority_orders         BOOLEAN NOT NULL DEFAULT FALSE,
  profile_badge               TEXT,        -- 'bronze' | 'silver' | 'gold' | 'gold_animated' | NULL
  custom_theme_color          TEXT,
  user_title                  TEXT,
  frame                       TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);

-- ────────────────────────────────────────────────────────────
-- 3. CATEGORIES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  image_url   TEXT,
  order_index INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 4. SUBCATEGORIES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subcategories (
  id           BIGSERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  category_id  BIGINT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  image_url    TEXT,
  order_index  INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subcategories_category ON public.subcategories(category_id);

-- ────────────────────────────────────────────────────────────
-- 5. SUB_SUB_CATEGORIES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sub_sub_categories (
  id             BIGSERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  subcategory_id BIGINT NOT NULL REFERENCES public.subcategories(id) ON DELETE CASCADE,
  image_url      TEXT,
  order_index    INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subsubcat_subcat ON public.sub_sub_categories(subcategory_id);

-- ────────────────────────────────────────────────────────────
-- 6. PRODUCTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id                   BIGSERIAL PRIMARY KEY,
  name                 TEXT NOT NULL,
  description          TEXT,
  price                NUMERIC(12,6) NOT NULL DEFAULT 0,
  price_per_unit       NUMERIC(12,6),
  image_url            TEXT,
  available            BOOLEAN NOT NULL DEFAULT TRUE,
  store_type           TEXT NOT NULL DEFAULT 'regular',
    -- 'regular' | 'quantities' | 'external_api'
  requires_input       BOOLEAN NOT NULL DEFAULT FALSE,
  min_quantity         INT NOT NULL DEFAULT 1,
  external_id          TEXT,               -- Ahminix product ID
  subcategory_id       BIGINT REFERENCES public.subcategories(id) ON DELETE SET NULL,
  sub_sub_category_id  BIGINT REFERENCES public.sub_sub_categories(id) ON DELETE SET NULL,
  order_index          INT NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_subcategory     ON public.products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_products_sub_sub         ON public.products(sub_sub_category_id);
CREATE INDEX IF NOT EXISTS idx_products_external_id     ON public.products(external_id);
CREATE INDEX IF NOT EXISTS idx_products_available       ON public.products(available);

-- ────────────────────────────────────────────────────────────
-- 7. ORDERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  total_amount    NUMERIC(12,6) NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'pending',
    -- 'pending' | 'pending_admin' | 'processing' | 'accepted' | 'completed' | 'rejected' | 'cancelled'
  meta            JSONB,
  admin_response  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ────────────────────────────────────────────────────────────
-- 8. ORDER_ITEMS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id                 BIGSERIAL PRIMARY KEY,
  order_id           BIGINT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id         BIGINT REFERENCES public.products(id) ON DELETE SET NULL,
  price_at_purchase  NUMERIC(12,6) NOT NULL DEFAULT 0,
  quantity           INT NOT NULL DEFAULT 1,
  extra_data         JSONB,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order   ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);

-- ────────────────────────────────────────────────────────────
-- 9. PAYMENT_METHODS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id               BIGSERIAL PRIMARY KEY,
  name             TEXT NOT NULL,
  image_url        TEXT,
  wallet_address   TEXT,
  min_amount       NUMERIC(12,6) NOT NULL DEFAULT 0,
  instructions     TEXT,
  method_type      TEXT NOT NULL DEFAULT 'manual',
    -- 'manual' | 'auto'
  api_account      TEXT,
  available        BOOLEAN NOT NULL DEFAULT TRUE,
  order_index      INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 10. TRANSACTIONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
  id                  BIGSERIAL PRIMARY KEY,
  user_id             BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  payment_method_id   BIGINT REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  amount              NUMERIC(12,6) NOT NULL DEFAULT 0,
  tx_number           TEXT,
  note                TEXT,
  receipt_image_url   TEXT,
  status              TEXT NOT NULL DEFAULT 'pending',
    -- 'pending' | 'approved' | 'rejected'
  admin_note          TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id    ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status     ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- ────────────────────────────────────────────────────────────
-- 11. NOTIFICATIONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    -- NULL = broadcast to all users
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'info',
    -- 'info' | 'success' | 'warning' | 'error'
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id   ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read   ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created   ON public.notifications(created_at DESC);

-- ────────────────────────────────────────────────────────────
-- 12. MESSAGES (Chat / Support)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  guest_id     TEXT,
  sender_role  TEXT NOT NULL DEFAULT 'user',
    -- 'user' | 'admin' | 'bot_reply'
  content      TEXT,
  image_url    TEXT,
  type         TEXT NOT NULL DEFAULT 'text',
    -- 'text' | 'image' | 'bot_reply'
  rating       INT,
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_user_id   ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_guest_id  ON public.messages(guest_id);
CREATE INDEX IF NOT EXISTS idx_messages_created   ON public.messages(created_at ASC);

-- ────────────────────────────────────────────────────────────
-- 13. AUTO_REPLIES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.auto_replies (
  id           BIGSERIAL PRIMARY KEY,
  trigger_text TEXT NOT NULL,
  reply_text   TEXT NOT NULL,
  is_faq       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 14. BANNERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.banners (
  id          BIGSERIAL PRIMARY KEY,
  image_url   TEXT NOT NULL,
  link        TEXT,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  order_index INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 15. OFFERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.offers (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  image_url   TEXT,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  order_index INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 16. VOUCHERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vouchers (
  id         BIGSERIAL PRIMARY KEY,
  code       TEXT NOT NULL UNIQUE,
  amount     NUMERIC(12,6) NOT NULL DEFAULT 0,
  max_uses   INT NOT NULL DEFAULT 1,
  used_count INT NOT NULL DEFAULT 0,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vouchers_code ON public.vouchers(code);

-- ────────────────────────────────────────────────────────────
-- 17. VOUCHER_USES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.voucher_uses (
  id         BIGSERIAL PRIMARY KEY,
  voucher_id BIGINT NOT NULL REFERENCES public.vouchers(id) ON DELETE CASCADE,
  user_id    BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(voucher_id, user_id)
);

-- ────────────────────────────────────────────────────────────
-- 18. SETTINGS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.settings (
  id         BIGSERIAL PRIMARY KEY,
  key        TEXT NOT NULL UNIQUE,
  value      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- القيم الافتراضية للإعدادات
INSERT INTO public.settings (key, value) VALUES
  ('order_processing_mode', 'manual'),
  ('privacy_policy',        ''),
  ('support_whatsapp',      ''),
  ('admin_password',        ''),
  ('profit_reset_at',       NULL)
ON CONFLICT (key) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 19. EMAIL_VERIFICATIONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_verifications (
  id         BIGSERIAL PRIMARY KEY,
  email      TEXT NOT NULL,
  code       TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'verify',
    -- 'verify' | 'reset'
  used       BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  pending_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_verif_email ON public.email_verifications(email);

-- ────────────────────────────────────────────────────────────
-- 20. PUSH_SUBSCRIPTIONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id           BIGSERIAL PRIMARY KEY,
  user_id      TEXT,
  subscription JSONB NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_user_id ON public.push_subscriptions(user_id);

-- ────────────────────────────────────────────────────────────
-- 21. TELEGRAM_LINKING_CODES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.telegram_linking_codes (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  code       TEXT NOT NULL UNIQUE,
  used       BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tg_codes_code ON public.telegram_linking_codes(code);

-- ────────────────────────────────────────────────────────────
-- 22. DAILY_MESSAGE_COUNTS (حد الرسائل اليومي)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_message_counts (
  id      BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
  date    DATE NOT NULL DEFAULT CURRENT_DATE,
  count   INT NOT NULL DEFAULT 0,
  UNIQUE(user_id, date)
);

-- ────────────────────────────────────────────────────────────
-- 23. PROFIT_RESETS (سجل تصفير الأرباح)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profit_resets (
  id         BIGSERIAL PRIMARY KEY,
  reset_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reset_by   TEXT DEFAULT 'admin',
  note       TEXT
);

-- ============================================================
-- RPC FUNCTIONS
-- ============================================================

-- دالة زيادة رصيد المستخدم بشكل آمن (atomic)
CREATE OR REPLACE FUNCTION public.increment_balance(
  user_id_param BIGINT,
  amount_param  NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users
  SET balance    = balance + amount_param,
      updated_at = NOW()
  WHERE id = user_id_param;
END;
$$;

-- دالة زيادة عداد الطلبات في user_stats
CREATE OR REPLACE FUNCTION public.increment_orders_count(user_id_param BIGINT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_stats
  SET total_orders_count = total_orders_count + 1,
      updated_at         = NOW()
  WHERE user_id = user_id_param;
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
-- تفعيل RLS على الجداول الحساسة
ALTER TABLE public.users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages            ENABLE ROW LEVEL SECURITY;

-- السياسات: نستخدم service_role من السيرفر فقط، لذا نسمح للـ service_role بكل شيء
-- وإن أردت استخدام Supabase Auth مباشرة عدّل هذه السياسات

CREATE POLICY "service_role_all_users"         ON public.users         FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_user_stats"    ON public.user_stats    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_orders"        ON public.orders        FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_transactions"  ON public.transactions  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_notifications" ON public.notifications FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_messages"      ON public.messages      FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- REALTIME
-- ============================================================
-- تفعيل Realtime على جداول الدردشة والإشعارات
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- ============================================================
-- !! الـ SQL الإضافي المطلوب لحفظ الإحصائيات !!
-- أضف هذا إن لم تكن الجداول موجودة مسبقاً
-- ============================================================

-- جدول profit_resets لحفظ سجل تصفير الأرباح
CREATE TABLE IF NOT EXISTS public.profit_resets (
  id       BIGSERIAL PRIMARY KEY,
  reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note     TEXT
);

-- عمود pending_data في email_verifications لحفظ بيانات التسجيل المعلّق
ALTER TABLE public.email_verifications
  ADD COLUMN IF NOT EXISTS pending_data JSONB;

-- عمود referral_count في users (إن لم يكن موجوداً)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS referral_count INT NOT NULL DEFAULT 0;

-- عمود unread_support_count في users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS unread_support_count INT NOT NULL DEFAULT 0;

-- عمود telegram_chat_id في users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT;

-- أعمدة user_stats الجديدة
ALTER TABLE public.user_stats
  ADD COLUMN IF NOT EXISTS lifetime_discount         NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE public.user_stats
  ADD COLUMN IF NOT EXISTS discount_expires_at       TIMESTAMPTZ;
ALTER TABLE public.user_stats
  ADD COLUMN IF NOT EXISTS user_title                TEXT;
ALTER TABLE public.user_stats
  ADD COLUMN IF NOT EXISTS frame                     TEXT;

-- إضافة profit_reset_at لـ settings
INSERT INTO public.settings (key, value)
VALUES ('profit_reset_at', NULL)
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- END OF FILE
-- ============================================================
