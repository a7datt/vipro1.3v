/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Component } from "react";
import { 
  Home, 
  Wallet, 
  ShoppingBag, 
  User, 
  Bell, 
  Menu, 
  ChevronRight, 
  ChevronLeft,
  Plus, 
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  LogOut,
  Settings,
  History,
  MessageSquare,
  Ticket,
  LayoutGrid,
  Search,
  Lock,
  Copy,
  ExternalLink,
  Pencil,
  Database,
  Upload,
  Download,
  Trash2,
  PlusCircle,
  Phone,
  ShieldCheck,
  RefreshCw,
  FileJson,
  Eraser,
  Star,
  Award,
  Crown,
  ChevronDown,
  ChevronUp,
  Palette,
  Send,
  X,
  Paperclip,
  Bot,
  Zap,
  Trophy,
  Share2,
  HelpCircle,
  Info,
  Tag,
  KeyRound,
  Mail,
  RotateCcw,} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { createClient } from "@supabase/supabase-js";
import { 
  Category, 
  Subcategory, 
  SubSubCategory, 
  Product, 
  UserData, 
  Order, 
  Transaction, 
  PaymentMethod, 
  Banner, 
  Offer,
  AdminPanelProps,
  VoucherRedeemViewProps,
  AdminLoginViewProps
} from "./types";

// --- Supabase Configuration ---
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const VoucherRedeemView = ({ voucherCode, setVoucherCode, handleRedeemVoucher, setView }: VoucherRedeemViewProps) => (
  <div className="px-6 flex flex-col items-center justify-center min-h-[60vh] space-y-6">
    <div className="w-20 h-20 bg-brand rounded-3xl flex items-center justify-center text-white shadow-xl shadow-brand-soft">
      <Ticket size={40} />
    </div>
    <div className="text-center space-y-2">
      <h2 className="text-2xl font-bold text-gray-800">شحن كود الرصيد</h2>
      <p className="text-gray-400 text-sm">أدخل الكود الذي حصلت عليه لشحن رصيدك فوراً</p>
    </div>
    <div className="w-full space-y-4">
      <input 
        type="text" 
        placeholder="ضع الكود هنا (مثال: GIFT100)" 
        value={voucherCode}
        onChange={(e) => setVoucherCode(e.target.value)}
        className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-center text-lg font-bold outline-none focus:border-brand shadow-sm"
      />
      <button 
        onClick={handleRedeemVoucher}
        className="w-full bg-brand text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-soft transition-all active:scale-95"
      >
        تأكيد الشحن
      </button>
      <button 
        onClick={() => setView({ type: "main" })}
        className="w-full text-gray-400 font-bold text-sm"
      >
        إلغاء
      </button>
    </div>
  </div>
);

const AdminLoginView = ({ setIsAdmin, setAdminAuth, setView }: AdminLoginViewProps) => {
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pass })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) localStorage.setItem("adminToken", data.token);
        setIsAdmin(true);
        setAdminAuth(true);
        setView({ type: "main" });
      } else {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          alert(data.error || "كلمة مرور خاطئة");
        } else {
          alert("كلمة مرور خاطئة");
        }
      }
    } catch (e: any) {
      if (e.name === 'TypeError' && e.message === 'Failed to fetch') {
        alert("فشل الاتصال بالسيرفر (تأكد من اتصالك بالإنترنت)");
      } else {
        alert("فشل الاتصال بالسيرفر");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="px-6 flex flex-col items-center justify-center min-h-[70vh] space-y-8">
      <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-gray-100">
        <Lock size={40} />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">دخول المسؤول</h2>
        <p className="text-gray-400 text-sm">يرجى إدخال كلمة المرور للوصول للوحة التحكم</p>
      </div>
      <div className="w-full space-y-4">
        <input 
          type="password" 
          placeholder="كلمة المرور" 
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-center text-lg outline-none focus:border-gray-800 shadow-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        <button 
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-gray-800 text-white py-4 rounded-2xl font-bold shadow-lg shadow-gray-100 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? "جاري التحقق..." : "دخول"}
        </button>
        <button 
          onClick={() => setView({ type: "main" })}
          className="w-full text-gray-400 font-bold text-sm"
        >
          عودة للمتجر
        </button>
      </div>
    </div>
  );
};

const REWARD_GOALS = [
  { id: 1, target: 5,   title: "الهدف الأول",   icon: "🥉", rewardText: "وسام البداية + لقب \"ناشئ\" + إطار برونزي",                     rewards: { badge: 'bronze',    title: 'ناشئ',            frame: 'bronze'        } },
  { id: 2, target: 15,  title: "الهدف الثاني",  icon: "⭐", rewardText: "شارة النشاط + لقب \"نشيط\" + إطار فضي",                         rewards: { badge: 'active',    title: 'نشيط',            frame: 'silver'        } },
  { id: 3, target: 30,  title: "الهدف الثالث",  icon: "⚡", rewardText: "شارة الطاقة + لقب \"متميز\" + رمز ⚡",                           rewards: { badge: 'energy',    title: 'متميز',           emoji: '⚡'            } },
  { id: 4, target: 50,  title: "الهدف الرابع",  icon: "🥈", rewardText: "شارة فضية + لقب \"VIP\" + إطار VIP + أولوية في الطلبات",         rewards: { badge: 'silver',    title: 'VIP',             frame: 'vip', priority: true } },
  { id: 5, target: 100, title: "الهدف الخامس",  icon: "👑", rewardText: "تاج ذهبي + لقب \"نجم\" + إطار ذهبي + ثيم مخصص أصفر",            rewards: { badge: 'gold',      title: 'نجم',             frame: 'gold_animated', theme: 'yellow' } },
  { id: 6, target: 200, title: "الهدف السادس",  icon: "💎", rewardText: "شارة الماس + لقب \"أسطورة\" + ثيم أحمر + دعم خاص + خصم 3% مدى الحياة", rewards: { badge: 'diamond',   title: 'أسطورة',          theme: 'red', specialSupport: true, discount: 3 } },
  { id: 7, target: 500, title: "الهدف السابع",  icon: "🔥", rewardText: "شارة أسطورية + لقب \"أسطورة الشحن\" + جميع الثيمات + دعم خاص + خصم 5% مدى الحياة", rewards: { badge: 'legendary', title: 'أسطورة الشحن', anyTheme: true, specialSupport: true, discount: 5 } }
];

// --- Error Boundary ---
export class ErrorBoundary extends (Component as any) {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    const userStr = localStorage.getItem("userId");
    const user = userStr ? JSON.parse(userStr) : null;
    fetch("/api/report-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: error?.toString(),
        stack: errorInfo?.componentStack,
        userInfo: user ? { id: user.id, name: user.name } : "Guest"
      })
    }).catch(console.error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
            <XCircle size={48} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">عذراً، حدث خطأ ما</h1>
          <p className="text-gray-600 mb-8 max-w-md">
            لقد واجه التطبيق مشكلة غير متوقعة. يرجى أخذ لقطة شاشة (Screenshot) والتواصل مع الدعم الفني لمساعدتك.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-brand text-white rounded-xl font-bold shadow-lg shadow-brand-soft"
          >
            إعادة تحميل التطبيق
          </button>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-8 p-4 bg-gray-100 rounded-lg text-left text-xs overflow-auto max-w-full">
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

  const AdminImageUpload = ({ onUpload, currentUrl, label }: { onUpload: (url: string) => void, currentUrl: string, label: string }) => {
    const [uploading, setUploading] = useState(false);
    
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      setUploading(true);
      const formData = new FormData();
      formData.append("image", file);
      
      try {
        const imgbbKey = (import.meta as any).env.VITE_IMGBB_API_KEY || "97ffbf56fe1a203445531d664cd4b928";
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          onUpload(data.data.url);
        } else {
          alert("فشل الرفع: " + (data.error?.message || "خطأ غير معروف"));
        }
      } catch (err) {
        alert("خطأ في الاتصال بخادم الصور");
      } finally {
        setUploading(false);
      }
    };

    return (
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400">{label}</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="رابط الصورة" 
            className="flex-1 p-3 bg-gray-50 border-none rounded-xl text-sm outline-none" 
            value={currentUrl} 
            onChange={e => onUpload(e.target.value)} 
          />
          <label className="bg-brand-light text-brand px-4 py-3 rounded-xl text-xs font-bold cursor-pointer hover:bg-brand-soft transition-colors flex items-center gap-1">
            <Upload size={14} />
            {uploading ? "..." : "رفع"}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
        {currentUrl && (
          <div className="w-16 h-16 rounded-lg border border-gray-100 overflow-hidden bg-gray-50">
            <img src={currentUrl} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
          </div>
        )}
      </div>
    );
  };

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [user, setUser] = useState<UserData | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [view, setView] = useState<{ type: string; id?: number; data?: any; catId?: number; fromSubSub?: boolean; subId?: number; subName?: string }>({ type: "main" });
  const [pageLoading, setPageLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subSubCategories, setSubSubCategories] = useState<SubSubCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [checkoutQuantity, setCheckoutQuantity] = useState<number>(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState<any>(null);
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminTab, setAdminTab] = useState("admin_home");
  const [themeModal, setThemeModal] = useState({ isOpen: false, color: "#10b981" });
  const [newAdminPass, setNewAdminPass] = useState("");
  const [showAllRewards, setShowAllRewards] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [voucherCode, setVoucherCode] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockCountdown, setBlockCountdown] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [linkingModal, setLinkingModal] = useState<{ isOpen: boolean; code: string; timeLeft: number }>({
    isOpen: false,
    code: "",
    timeLeft: 0
  });

  // Theme effect
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // أظهر الإشعار تلقائياً في كل جلسة إذا التطبيق غير مثبت
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      if (!isStandalone) {
        setTimeout(() => setShowInstallBanner(true), 2000);
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    setShowInstallBanner(false);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const subscribeToPush = async (userId: number) => {
    try {
      if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) return;
      if (Notification.permission === "default") await Notification.requestPermission();
      if (Notification.permission !== "granted") return;

      const registration = await navigator.serviceWorker.ready;
      const keyRes = await fetch("/api/push/key");
      if (!keyRes.ok) return;
      const { publicKey } = await keyRes.json();
      if (!publicKey) return;

      // إلغاء الـ subscription القديم دائماً لضمان الـ key الصحيح
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) await existingSub.unsubscribe();

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` },
        body: JSON.stringify({ userId, subscription })
      }).catch(() => {});
    } catch (e: any) {
      // تجاهل كل أخطاء Push بصمت - لا تؤثر على عمل التطبيق
    }
  };

  useEffect(() => {
    if (user && 'serviceWorker' in navigator && 'PushManager' in window) {
      subscribeToPush(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Supabase Realtime Subscriptions
  useEffect(() => {
    const channels = [
      supabase.channel('categories-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, fetchCategories).subscribe(),
      supabase.channel('products-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        // Refresh products if we are in a product view
        if (view.type === "products" && view.id) {
          fetchProducts(view.id, view.fromSubSub);
        }
      }).subscribe(),
      supabase.channel('banners-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, fetchBanners).subscribe(),
      supabase.channel('offers-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, fetchOffers).subscribe(),
      supabase.channel('settings-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
        // لا نعيد تحميل الصفحة إذا كان المستخدم في لوحة التحكم
        if (!document.querySelector('[data-admin-panel]')) {
          window.location.reload();
        }
      }).subscribe(),
    ];

    if (user) {
      channels.push(
        supabase.channel(`user-${user.id}-changes`).on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'users', 
          filter: `id=eq.${user.id}` 
        }, (payload) => {
          setUser(prev => prev ? { ...prev, ...payload.new } : null);
          // بيانات المستخدم تبقى في React state فقط
        }).subscribe()
      );
      
      channels.push(
        supabase.channel(`user-stats-${user.id}-changes`).on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'user_stats', 
          filter: `user_id=eq.${user.id}` 
        }, (payload) => {
          setUserStats(payload.new);
        }).subscribe()
      );

      channels.push(
        supabase.channel(`user-notifications-${user.id}`).on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, fetchNotifications).subscribe()
      );
    }

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user?.id]);

  // Block countdown effect
  useEffect(() => {
    let interval: any;
    if (isBlocked && blockCountdown > 0) {
      interval = setInterval(() => {
        setBlockCountdown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBlocked, blockCountdown]);

  // Telegram linking timer effect
  useEffect(() => {
    let interval: any;
    if (linkingModal.isOpen && linkingModal.timeLeft > 0) {
      interval = setInterval(() => {
        setLinkingModal(prev => ({ ...prev, timeLeft: Math.max(0, prev.timeLeft - 1) }));
      }, 1000);
    } else if (linkingModal.timeLeft === 0 && linkingModal.isOpen) {
      setLinkingModal(prev => ({ ...prev, isOpen: false }));
    }
    return () => clearInterval(interval);
  }, [linkingModal.isOpen, linkingModal.timeLeft]);

  // Fetch initial data
  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
    fetchSubSubCategories();
    fetchPaymentMethods();
    fetchBanners();
    fetchOffers();
    const savedUserId = localStorage.getItem("userId");
    if (savedUserId && !isNaN(Number(savedUserId))) {
      fetchUser(Number(savedUserId));
    }

    // Handle referral code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      localStorage.setItem("referralCode", ref);
      if (!savedUserId) {
        setView({ type: "login" });
      }
    }

    // Handle Admin Route
    if (window.location.pathname === "/adminvipa7d1216") {
      setView({ type: "admin_login" });
    }
  }, []);

  useEffect(() => {
    if (user?.stats?.custom_theme_color && user.stats.custom_theme_color.startsWith('#')) {
      document.documentElement.style.setProperty('--custom-primary', user.stats.custom_theme_color);
      document.documentElement.style.setProperty('--custom-primary-light', `${user.stats.custom_theme_color}1a`);
    } else {
      document.documentElement.style.removeProperty('--custom-primary');
      document.documentElement.style.removeProperty('--custom-primary-light');
    }
  }, [user?.stats?.custom_theme_color]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/notifications/${user.id}`);
      if (!res.ok) throw new Error(`Failed to fetch notifications: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response from notifications API");
      }
      const data = await res.json();
      const serverNotifs = (Array.isArray(data) ? data : []).map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        created_at: n.created_at,
        is_read: n.is_read
      }));

      // Add the TG link warning if needed
      if (user.telegram_chat_id) {
        serverNotifs.unshift({
          id: 'tg-link',
          title: 'تم ربط حسابك ببوت تلجرام',
          message: 'لقد تم ربط حسابك ببوت تلجرام. إن لم تكن أنت، يرجى الضغط على فك الارتباط وتغيير بياناتك.',
          type: 'warning',
          action: 'unlink'
        });
      }
      setNotifications(serverNotifs);
    } catch (e: any) {
      if (e.name === 'TypeError' && e.message === 'Failed to fetch') return;
      console.error("Fetch notifications error:", e);
    }
  };

  useEffect(() => {
    if (user && !isAdmin) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    } else if (!user) {
      setNotifications([]);
    }
  }, [user, isAdmin]);

  const markNotificationRead = async (id: number | string) => {
    if (typeof id === 'string') return; // Local notifs
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id })
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnlinkTelegram = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/user/unlink-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });
      if (res.ok) {
        fetchUser(user.id);
        alert("تم فك الارتباط بنجاح. لقد تم تسجيل خروجك من بوت تليجرام أيضاً.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateLinkingCode = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/user/generate-linking-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await res.json();
      if (res.ok) {
        setLinkingModal({
          isOpen: true,
          code: data.code,
          timeLeft: 600 // 10 minutes
        });
      } else {
        alert(data.error || "فشل توليد الكود");
      }
    } catch (e) {
      console.error(e);
      alert("خطأ في الاتصال بالسيرفر");
    }
  };

  const handleUpdateTheme = async (color: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/user/update-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` },
        body: JSON.stringify({ color })
      });
      if (res.ok) {
        fetchUser(user.id);
        setThemeModal({ ...themeModal, isOpen: false });
      }
    } catch (e) {
      alert("فشل تحديث الثيم");
    }
  };

  const handleChangeAdminPassword = async () => {
    if (!newAdminPass) return alert("يرجى إدخال كلمة المرور الجديدة");
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: newAdminPass })
      });
      if (res.ok) {
        alert("تم تغيير كلمة المرور بنجاح");
        setNewAdminPass("");
      }
    } catch (e) {
      alert("فشل تغيير كلمة المرور");
    }
  };

  // Helper: يجيب الـ auth token من localStorage
  const getAuthToken = (): string => localStorage.getItem("authToken") || "";

  const fetchUser = async (id: number) => {
    if (!id || isNaN(id)) return;
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/user/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) {
        if (res.status === 404) {
          console.warn(`User ${id} not found`);
          return;
        }
        throw new Error(`Failed to fetch user: ${res.status}`);
      }
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Expected JSON but got:", text.substring(0, 100));
        return;
      }

      const data = await res.json();
      if (data) {
        setUser(data);
        if (data.token) localStorage.setItem("authToken", data.token);
        
        if (data.blocked_until) {
          const until = new Date(data.blocked_until);
          const now = new Date();
          if (until > now) {
            setIsBlocked(true);
            setBlockCountdown(Math.floor((until.getTime() - now.getTime()) / 1000));
          } else {
            setIsBlocked(false);
          }
        } else {
          setIsBlocked(false);
        }
      }
    } catch (e: any) {
      if (e.name === 'TypeError' && e.message === 'Failed to fetch') {
        // Silent network error (likely server restarting)
        return;
      }
      console.error("Fetch user error:", e);
    }
  };

  const handleRedeemVoucher = async () => {
    if (!user || !voucherCode) return;
    try {
      const res = await fetch("/api/user/redeem-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, code: voucherCode })
      });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response from redeem voucher API");
      }

      const data = await res.json();
      if (res.ok) {
        alert(`✅ تم شحن ${data.amount}$ بنجاح!`);
        setVoucherCode("");
        fetchUser(user.id);
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (e: any) {
      if (e.name === 'TypeError' && e.message === 'Failed to fetch') {
        alert("❌ فشل الاتصال بالخادم (تأكد من اتصالك بالإنترنت)");
      } else {
        alert("❌ فشل الاتصال بالخادم");
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response from categories API");
      }
      const data = await res.json();
      setCategories(data || []);
    } catch (e: any) {
      if (e.name === 'TypeError' && e.message === 'Failed to fetch') return;
      console.error("Fetch categories error:", e);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch("/api/payment-methods");
      if (!res.ok) throw new Error(`Failed to fetch payment methods: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response from payment methods API");
      }
      const data = await res.json();
      setPaymentMethods(data || []);
    } catch (e: any) {
      if (e.name === 'TypeError' && e.message === 'Failed to fetch') return;
      console.error("Fetch payment methods error:", e);
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/banners");
      if (!res.ok) throw new Error(`Failed to fetch banners: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response from banners API");
      }
      const data = await res.json();
      setBanners(data || []);
    } catch (e: any) {
      if (e.name === 'TypeError' && e.message === 'Failed to fetch') return;
      console.error("Fetch banners error:", e);
    }
  };

  const fetchOffers = async () => {
    try {
      const res = await fetch("/api/offers");
      if (!res.ok) throw new Error(`Failed to fetch offers: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response from offers API");
      }
      const data = await res.json();
      setOffers(data || []);
    } catch (e: any) {
      if (e.name === 'TypeError' && e.message === 'Failed to fetch') return;
      console.error("Fetch offers error:", e);
    }
  };

  const fetchSubcategories = async (catId?: number) => {
    try {
      const url = catId ? `/api/categories/${catId}/subcategories` : "/api/subcategories";
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch subcategories: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response from subcategories API");
      }
      const data = await res.json();
      setSubcategories(data || []);
    } catch (e: any) {
      if (e.name === 'TypeError' && e.message === 'Failed to fetch') return;
      console.error("Fetch subcategories error:", e);
    }
  };

  const fetchSubSubCategories = async (subId?: number): Promise<SubSubCategory[]> => {
    try {
      const url = subId ? `/api/subcategories/${subId}/sub-sub-categories` : "/api/sub-sub-categories";
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch sub-sub-categories: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response from sub-sub-categories API");
      }
      const data = await res.json();
      setSubSubCategories(data || []);
      return data || [];
    } catch (e: any) {
      if (e.name === 'TypeError' && e.message === 'Failed to fetch') return [];
      console.error("Fetch sub-sub-categories error:", e);
      return [];
    }
  };

  const fetchProducts = async (subId: number, isSubSub: boolean = false) => {
    try {
      const url = isSubSub 
        ? `/api/sub-sub-categories/${subId}/products`
        : `/api/subcategories/${subId}/products`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response from products API");
      }
      const data = await res.json();
      setProducts(data || []);
    } catch (e: any) {
      if (e.name === 'TypeError' && e.message === 'Failed to fetch') return;
      console.error("Fetch products error:", e);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/orders/user/${user.id}`);
      if (!res.ok) throw new Error(`Failed to fetch orders: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response from orders API");
      }
      const data = await res.json();
      setOrders(data || []);
    } catch (e: any) {
      if (e.name === 'TypeError' && e.message === 'Failed to fetch') return;
      console.error("Fetch orders error:", e);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/transactions/user/${user.id}`);
      if (!res.ok) throw new Error(`Failed to fetch transactions: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response from transactions API");
      }
      const data = await res.json();
      setTransactions(data || []);
    } catch (e: any) {
      if (e.name === 'TypeError' && e.message === 'Failed to fetch') return;
      console.error("Fetch transactions error:", e);
    }
  };

  useEffect(() => {
    if (activeTab === "orders" && orders.length === 0) fetchOrders();
    if ((activeTab === "wallet" || view.type === "payments") && transactions.length === 0) fetchTransactions();
  }, [activeTab, view.type, user]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    setIsDrawerOpen(false);
    setActiveTab("home");
    setView({ type: "main" });
  };

  // --- Theme Helper ---
  const getTheme = () => {
    if (user?.stats?.custom_theme_color && user.stats.custom_theme_color.startsWith('#')) {
      return {
        primary: "bg-[var(--custom-primary)]",
        primaryHover: "opacity-90",
        text: "text-[var(--custom-primary)]",
        textDark: "text-[var(--custom-primary)]",
        bgLight: "bg-[var(--custom-primary-light)]",
        border: "border-[var(--custom-primary-light)]",
        shadow: "shadow-[var(--custom-primary-light)]",
        gradient: "from-[var(--custom-primary)] to-[var(--custom-primary)]",
        icon: "text-[var(--custom-primary)]",
        button: "bg-[var(--custom-primary)]",
        buttonHover: "opacity-90"
      };
    }
    if (user?.stats?.custom_theme_color === 'brand') {
      return {
        primary: "bg-brand",
        primaryHover: "hover:opacity-90",
        text: "text-brand",
        textDark: "text-brand",
        bgLight: "bg-brand-light",
        border: "border-brand-soft",
        shadow: "shadow-brand-soft",
        gradient: "from-brand to-brand",
        icon: "text-brand",
        button: "bg-brand",
        buttonHover: "hover:opacity-90"
      };
    }
    if (user?.is_vip || user?.stats?.custom_theme_color === 'yellow') {
      return {
        primary: "bg-amber-500",
        primaryHover: "hover:bg-amber-600",
        text: "text-amber-600",
        textDark: "text-amber-700",
        bgLight: "bg-amber-50",
        border: "border-amber-100",
        shadow: "shadow-amber-100",
        gradient: "from-amber-500 to-yellow-600",
        icon: "text-amber-600",
        button: "bg-amber-600",
        buttonHover: "hover:bg-amber-700"
      };
    }
    return {
      primary: "bg-[#B00000]",
      primaryHover: "hover:bg-[#8B0000]",
      text: "text-[#B00000]",
      textDark: "text-[#8B0000]",
      bgLight: "bg-red-50",
      border: "border-red-100",
      shadow: "shadow-red-100",
      gradient: "from-[#B00000] to-[#8B0000]",
      icon: "text-[#B00000]",
      button: "bg-[#B00000]",
      buttonHover: "hover:bg-[#8B0000]"
    };
  };

  const theme = getTheme();

  // --- UI Components ---

  const Header = () => (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-40">
      <div className="flex items-center gap-3">
        <button onClick={() => setIsDrawerOpen(true)} className="p-2 hover:bg-gray-50 rounded-full">
          <Menu size={24} className="text-gray-700" />
        </button>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
        <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
          <img 
            src="https://i.ibb.co/5WZRchqw/1764620392904-removebg-preview-1.png" 
            alt="Logo" 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <span className={`font-bold text-gray-800 hidden sm:block ${user?.is_vip ? 'text-amber-600' : ''}`}>
          فيبرو {user?.is_vip && 'VIP'}
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        {user && (
          <div className={`${theme.textDark} flex items-center`}>
            <span className="font-bold">{user.balance.toFixed(2)} $</span>
          </div>
        )}
        <button onClick={() => setNotificationsOpen(true)} className="p-2 hover:bg-gray-50 rounded-full relative">
          <Bell size={22} className="text-gray-600" />
          {(Array.isArray(notifications) ? notifications : []).some(n => !n.is_read) && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>
      </div>
    </header>
  );

  const NotificationPanel = () => (
    <AnimatePresence>
      {notificationsOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setNotificationsOpen(false)}
            className="fixed inset-0 bg-black/20 z-50"
          />
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-800">الإشعارات</h3>
              <button onClick={() => setNotificationsOpen(false)} className="p-2 bg-gray-100 rounded-full">
                <XCircle size={20} className="text-gray-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {notifications.length > 0 ? (
                (Array.isArray(notifications) ? notifications : []).map(notif => (
                  <div 
                    key={notif.id} 
                    onClick={() => markNotificationRead(notif.id)}
                    className={`p-4 rounded-2xl border transition-all ${notif.is_read ? 'opacity-60' : 'shadow-sm'} ${
                      notif.type === 'warning' ? 'bg-amber-50 border-amber-100' : 
                      notif.type === 'success' ? 'bg-brand-light border-brand-soft' : 'bg-blue-50 border-blue-100'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-bold ${
                        notif.type === 'warning' ? 'text-amber-800' : 
                        notif.type === 'success' ? 'text-brand' : 'text-blue-800'
                      }`}>{notif.title}</h4>
                      {notif.created_at && <span className="text-[9px] text-gray-400">{new Date(notif.created_at).toLocaleTimeString("ar-EG")}</span>}
                    </div>
                    <p className={`text-sm leading-relaxed ${
                      notif.type === 'warning' ? 'text-amber-700' : 
                      notif.type === 'success' ? 'text-brand' : 'text-blue-700'
                    }`}>{notif.message}</p>
                    {notif.action === 'unlink' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleUnlinkTelegram(); }}
                        className="mt-3 bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
                      >
                        فك الارتباط الآن
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Bell size={48} className="mb-4 opacity-20" />
                  <p>لا توجد إشعارات حالياً</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  const BottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around z-40">
      <button 
        onClick={() => { setActiveTab("home"); setView({ type: "main" }); }}
        className={`flex flex-col items-center gap-1 ${activeTab === "home" ? theme.text : "text-gray-400"}`}
      >
        <Home size={22} />
        <span className="text-[10px] font-medium">الرئيسية</span>
      </button>
      <button 
        onClick={() => setActiveTab("wallet")}
        className={`flex flex-col items-center gap-1 ${activeTab === "wallet" ? theme.text : "text-gray-400"}`}
      >
        <Wallet size={22} />
        <span className="text-[10px] font-medium">شحن</span>
      </button>
      <button 
        onClick={() => setActiveTab("orders")}
        className={`flex flex-col items-center gap-1 ${activeTab === "orders" ? theme.text : "text-gray-400"}`}
      >
        <ShoppingBag size={22} />
        <span className="text-[10px] font-medium">الطلبات</span>
      </button>
      <button 
        onClick={() => setActiveTab("profile")}
        className={`flex flex-col items-center gap-1 ${activeTab === "profile" ? theme.text : "text-gray-400"}`}
      >
        <User size={22} />
        <span className="text-[10px] font-medium">حسابي</span>
      </button>
    </nav>
  );

  const Drawer = () => (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 z-50"
          />
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed top-0 right-0 bottom-0 w-72 bg-white z-50 shadow-2xl flex flex-col"
          >
            <div className={`p-6 ${theme.primary} text-white`}>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                <User size={32} />
              </div>
              <h3 className="font-bold text-lg">{user ? user.name : "زائر"}</h3>
              <p className="text-white/80 text-sm">{user ? user.email : "سجل الدخول للمزيد"}</p>
            </div>
            
            <div className="flex-1 py-4 overflow-y-auto">
              <DrawerItem icon={<User size={20} />} label="الملف الشخصي" onClick={() => { setActiveTab("profile"); setView({ type: "main" }); setIsDrawerOpen(false); }} />
              <DrawerItem icon={<History size={20} />} label="دفعاتي" onClick={() => { setActiveTab("profile"); setView({ type: "payments" }); setIsDrawerOpen(false); }} />
              <DrawerItem icon={<MessageSquare size={20} />} label="الدعم الفني" onClick={() => { setView({ type: "chat" }); setIsDrawerOpen(false); }} />
              {deferredPrompt && (
                <DrawerItem 
                  icon={<Download size={20} />} 
                  label="تثبيت التطبيق" 
                  onClick={() => { handleInstallApp(); setIsDrawerOpen(false); }} 
                  className="text-brand"
                />
              )}
              <div className="border-t border-gray-100 my-2"></div>
              {user ? (
                <DrawerItem icon={<LogOut size={20} />} label="تسجيل الخروج" onClick={handleLogout} className="text-red-500" />
              ) : (
                <DrawerItem icon={<ArrowRight size={20} />} label="تسجيل الدخول" onClick={() => { setView({ type: "login" }); setIsDrawerOpen(false); }} />
              )}
            </div>
            
            <div className="p-4 text-center text-xs text-gray-400 border-t border-gray-100">
              الإصدار 1.0.0
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  const DrawerItem = ({ icon, label, onClick, className = "" }: any) => (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${className}`}>
      <span className="text-gray-500">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );

  // --- Views ---

  const HomeView = () => {
    const [currentBanner, setCurrentBanner] = useState(0);

    useEffect(() => {
      if (banners.length > 1) {
        const timer = setInterval(() => {
          setCurrentBanner((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
      }
    }, [banners]);

    return (
      <div className="space-y-6 pb-20">
        {/* Hero Carousel */}
        <div className="px-4">
          <div className={`h-44 bg-gray-100 rounded-2xl overflow-hidden relative shadow-lg ${theme.shadow}`}>
            {banners.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.img
                  key={banners[currentBanner].id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={banners[currentBanner].image_url}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
            ) : (
              <div className={`h-full bg-gradient-to-r ${theme.gradient} flex flex-col justify-center px-6 text-white`}>
                <h2 className="text-2xl font-bold mb-1">أفضل العروض</h2>
                <p className="text-white/90 text-sm">اشحن ألعابك المفضلة بضغطة واحدة</p>
                <button className="mt-4 bg-white text-brand px-4 py-1.5 rounded-full text-sm font-bold w-fit">اكتشف الآن</button>
              </div>
            )}
            
            {banners.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {banners.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all ${idx === currentBanner ? "w-4 bg-white" : "w-1.5 bg-white/40"}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

      {/* Categories */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">الأقسام الرئيسية</h3>
          <button className={`${theme.text} text-sm font-medium`}>عرض الكل</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {categories.map(cat => (
            <motion.button 
              whileTap={{ scale: 0.95 }}
              key={cat.id}
              onClick={async () => {
                setPageLoading(true);
                await fetchSubcategories(cat.id);
                setView({ type: "subcategories", id: cat.id, data: cat.name });
                setPageLoading(false);
              }}
              className={`bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center gap-2 hover:${theme.border} transition-colors`}
            >
              <div className={`w-14 h-14 ${theme.bgLight} rounded-xl flex items-center justify-center overflow-hidden`}>
                <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <span className="font-bold text-gray-700 text-[10px] text-center">{cat.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Dynamic Offers */}
      {offers.length > 0 && (
        <div className="px-4">
          <h3 className="font-bold text-gray-800 mb-4">عروض مميزة</h3>
          <div className="space-y-4">
            {offers.map(offer => (
              <div key={offer.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center overflow-hidden">
                  {offer.image_url ? (
                    <img src={offer.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <ImageIcon size={24} className="text-orange-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-sm">{offer.title}</h4>
                  <p className="text-gray-400 text-xs">{offer.description}</p>
                </div>
                <ChevronRight size={20} className="text-gray-300" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

  const SubcategoriesView = () => (
    <div className="px-4 space-y-4 pb-20">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => setView({ type: "main" })} className="p-2 bg-gray-100 rounded-full">
          <ArrowRight size={20} className="text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">{view.data}</h2>
      </div>
      {subcategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
            <LayoutGrid size={40} />
          </div>
          <div>
            <p className="font-bold text-gray-500 text-lg">لم تتم إضافة أقسام بعد</p>
            <p className="text-gray-400 text-sm mt-1">عُد لاحقاً، سيتم إضافة محتوى قريباً</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {subcategories.map(sub => (
            <motion.button 
              whileTap={{ scale: 0.98 }}
              key={sub.id}
              onClick={async () => {
                setPageLoading(true);
                const subSubs = await fetchSubSubCategories(sub.id);
                await fetchProducts(sub.id);
                if (subSubs.length > 0) {
                  setView({ type: "sub_sub_categories", id: sub.id, data: sub.name, catId: view.id });
                } else {
                  setView({ type: "products", id: sub.id, data: sub.name, fromSubSub: false });
                }
                setPageLoading(false);
              }}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-brand-soft"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                  <img src={sub.image_url || "https://picsum.photos/seed/sub/100/100"} alt={sub.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <span className="font-bold text-gray-700">{sub.name}</span>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );

  const SubSubCategoriesView = () => {
    const directProducts = products.filter(p => !p.sub_sub_category_id);
    return (
      <div className="px-4 space-y-4 pb-20">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => setView({ type: "subcategories", id: view.catId, data: view.data })} className="p-2 bg-gray-100 rounded-full">
            <ArrowRight size={20} className="text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">{view.data}</h2>
        </div>

        {/* Sub-sub-categories */}
        {subSubCategories.length > 0 && (
          <div className="grid grid-cols-1 gap-3">
            {subSubCategories.map(ss => (
              <motion.button
                whileTap={{ scale: 0.98 }}
                key={ss.id}
                onClick={async () => {
                  setPageLoading(true);
                  await fetchProducts(ss.id, true);
                  setView({ type: "products", id: ss.id, data: ss.name, fromSubSub: true, subId: view.id, subName: view.data, catId: view.catId });
                  setPageLoading(false);
                }}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-brand-soft"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                    <img src={ss.image_url || "https://picsum.photos/seed/ss/100/100"} alt={ss.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <span className="font-bold text-gray-700">{ss.name}</span>
                </div>
                <ChevronRight size={20} className="text-gray-300" />
              </motion.button>
            ))}
          </div>
        )}

        {/* Direct products (no sub-sub-category) */}
        {directProducts.length > 0 && (
          <div className="space-y-4">
            {subSubCategories.length > 0 && (
              <p className="text-xs font-bold text-gray-400 px-1">منتجات القسم</p>
            )}
            <div className="grid grid-cols-1 gap-4">
              {directProducts.map(prod => (
                <div key={prod.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                      <img src={prod.image_url || "https://picsum.photos/seed/prod/100/100"} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{prod.name}</h4>
                      <p className={`${theme.text} font-bold`}>
                        {prod.store_type === 'quantities'
                          ? `${(parseFloat(prod.price_per_unit as any) || 0).toFixed(6)} $ / وحدة`
                          : `${(parseFloat(prod.price as any) || 0).toFixed(2)} $`}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">{prod.description || "لا يوجد وصف متاح لهذا المنتج."}</p>
                  {prod.store_type === 'external_api' && (
                    <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[10px] font-bold px-3 py-1.5 rounded-lg w-fit">
                      <ExternalLink size={11} />
                      شحن فوري
                    </div>
                  )}
                  <button
                    onClick={() => {
                      if (!user) return setView({ type: "login" });
                      if (prod.store_type === 'quick_order') {
                        setView({ type: "quick_order", data: prod });
                      } else {
                        setCheckoutQuantity(parseInt(String(prod.min_quantity)) || 0);
                        setView({ type: "checkout", data: prod });
                      }
                    }}
                    className={`w-full ${theme.button} text-white py-3 rounded-xl font-bold ${theme.buttonHover} transition-colors`}
                  >
                    {prod.store_type === 'quick_order' ? "طلب سريع" : prod.store_type === 'external_api' ? "شراء الآن ⚡" : "شراء الآن"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {subSubCategories.length === 0 && directProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
              <ShoppingBag size={40} />
            </div>
            <div>
              <p className="font-bold text-gray-500 text-lg">لم تتم إضافة منتجات بعد</p>
              <p className="text-gray-400 text-sm mt-1">عُد لاحقاً، سيتم إضافة محتوى قريباً</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ProductsView = () => (
    <div className="px-4 space-y-4 pb-20">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => {
            if (view.fromSubSub) {
              setView({ type: "sub_sub_categories", id: view.subId, data: view.subName, catId: view.catId });
            } else {
              setView({ type: "subcategories", data: "الرجوع" });
            }
          }}
          className="p-2 bg-gray-100 rounded-full">
          <ArrowRight size={20} className="text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">{view.data}</h2>
      </div>
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
            <ShoppingBag size={40} />
          </div>
          <div>
            <p className="font-bold text-gray-500 text-lg">لم تتم إضافة منتجات بعد</p>
            <p className="text-gray-400 text-sm mt-1">عُد لاحقاً، سيتم إضافة منتجات قريباً</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {products.map(prod => (
            <div key={prod.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                  <img src={prod.image_url || "https://picsum.photos/seed/prod/100/100"} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">{prod.name}</h4>
                  <p className={`${theme.text} font-bold`}>
                    {prod.store_type === 'quantities'
                      ? `${(parseFloat(prod.price_per_unit) || 0).toFixed(6)} $ / وحدة`
                      : `${(parseFloat(prod.price) || 0).toFixed(2)} $`}
                  </p>
                </div>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{prod.description || "لا يوجد وصف متاح لهذا المنتج."}</p>
              {prod.store_type === 'external_api' && (
                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[10px] font-bold px-3 py-1.5 rounded-lg w-fit">
                  <ExternalLink size={11} />
                  شحن فوري
                </div>
              )}
              <button 
                onClick={() => {
                  if (!user) return setView({ type: "login" });
                  if (prod.store_type === 'quick_order') {
                    setView({ type: "quick_order", data: prod });
                  } else {
                    setCheckoutQuantity(parseInt(String(prod.min_quantity)) || 0);
                    setView({ type: "checkout", data: prod });
                  }
                }}
                className={`w-full ${theme.button} text-white py-3 rounded-xl font-bold ${theme.buttonHover} transition-colors`}
              >
                {prod.store_type === 'quick_order' ? "طلب سريع" : prod.store_type === 'external_api' ? "شراء الآن ⚡" : "شراء الآن"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const QuickOrderView = () => {
    const prod = view.data;
    const [playerId, setPlayerId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const finalPrice = user?.is_vip ? Number(prod.price) * 0.95 : Number(prod.price);

    const handleQuickOrder = async () => {
      if (!user) return;
      if (!playerId) return setError("يرجى إدخال المعرف");
      
      setLoading(true);
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` },
          body: JSON.stringify({
            userId: user.id,
            productId: prod.id,
            quantity: 1,
            extraData: { playerId, storeType: 'quick_order' }
          })
        });
        
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Expected JSON response from orders API");
        }

        const data = await res.json();
        if (data.success) {
          fetchUser(user.id);
          setView({ type: "success", data: "تم إرسال الطلب السريع بنجاح!" });
        } else {
          setError(data.error || "حدث خطأ ما");
        }
      } catch (e: any) {
        if (e.name === 'TypeError' && e.message === 'Failed to fetch') {
          setError("فشل الاتصال بالخادم (تأكد من اتصالك بالإنترنت)");
        } else {
          setError("حدث خطأ ما أثناء إرسال الطلب");
          console.error("Quick order error:", e);
        }
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="px-4 space-y-6 pb-20">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => setView({ type: "products", data: "الرجوع" })} className="p-2 bg-gray-100 rounded-full">
            <ArrowRight size={20} className="text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">متجر الطلب السريع</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <h4 className="font-bold text-lg text-gray-800">{prod.name}</h4>
            <div className="flex flex-col items-center">
              {user?.is_vip && <p className="text-gray-400 line-through text-sm">{prod.price.toFixed(2)} $</p>}
              <p className={`${theme.text} font-bold text-xl`}>{finalPrice.toFixed(2)} $</p>
              {user?.is_vip && <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-bold mt-1">خصم VIP 5%</span>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">ضع المعرف (ID)</label>
              <input 
                type="text" 
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                placeholder="أدخل المعرف هنا..."
                className={`w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-center text-lg font-bold outline-none focus:${theme.border}`}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-500 mb-1">السعر الإجمالي</p>
              <p className="text-xl font-bold text-gray-800">{finalPrice.toFixed(2)} $</p>
            </div>

            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

            <button 
              disabled={loading}
              onClick={handleQuickOrder}
              className={`w-full ${theme.button} text-white py-4 rounded-xl font-bold shadow-lg ${theme.shadow} disabled:opacity-50`}
            >
              {loading ? "جاري الإرسال..." : "إرسال الطلب"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CheckoutView = () => {
    const prod = view.data;
    const qtyRef = React.useRef<HTMLInputElement>(null);
    const extraRef = React.useRef<HTMLInputElement>(null);
    const [displayQty, setDisplayQty] = React.useState<string>(
      (prod.store_type === 'quantities' || prod.store_type === 'external_api') ? (String(checkoutQuantity || prod.min_quantity || 1)) : "1"
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [orderResult, setOrderResult] = useState<any>(null);

    // حساب السعر بشكل صحيح
    const unitPrice = (prod.store_type === 'quantities' || prod.store_type === 'external_api')
      ? (parseFloat(String(prod.price_per_unit)) || parseFloat(String(prod.price)) || 0)
      : (parseFloat(String(prod.price)) || 0);

    const parsedQty = parseFloat(displayQty) || 0;
    const safeQty = Math.max(1, parsedQty || 1);
    const baseTotal = unitPrice * safeQty;
    const finalPrice = user?.is_vip ? baseTotal * 0.95 : baseTotal;

    const handlePurchase = async () => {
      if (!user) return;
      const extraData = extraRef.current?.value || "";
      const quantity = parseFloat(qtyRef.current?.value || "1") || 1;
      if (prod.requires_input && !extraData) return setError("يرجى إدخال البيانات المطلوبة");
      if ((prod.store_type === 'quantities' || prod.store_type === 'external_api') && quantity < (prod.min_quantity || 1)) return setError(`أقل كمية مسموحة هي ${prod.min_quantity}`);
      setCheckoutQuantity(quantity);
      setLoading(true);
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` },
          body: JSON.stringify({
            userId: user.id,
            productId: prod.id,
            quantity: quantity,
            extraData: {
              input: extraData,
              playerId: extraData, // لـ Ahminix API
              storeType: prod.store_type
            }
          })
        });
        const data = await res.json();
        if (data.success) {
          fetchUser(user.id);
          if (data.pendingAdmin) {
            // الوضع اليدوي - الطلب ينتظر موافقة الأدمن
            setView({ type: "success", data: "تم استلام طلبك بنجاح! سيتم مراجعته والرد عليك قريباً." });
          } else if (prod.store_type === 'external_api' && data.externalOrderId) {
            setOrderResult(data);
          } else {
            setView({ type: "success", data: "تمت عملية الشراء بنجاح!" });
          }
        } else {
          setError(data.error || "حدث خطأ ما");
        }
      } catch (e) {
        setError("فشل الاتصال بالخادم");
      } finally {
        setLoading(false);
      }
    };

    // عرض نتيجة الطلب الخارجي
    if (orderResult) {
      const statusMap: Record<string, { label: string; color: string; bg: string }> = {
        accept: { label: "✅ تم التنفيذ", color: "text-green-700", bg: "bg-green-50" },
        processing: { label: "⏳ قيد المعالجة", color: "text-amber-700", bg: "bg-amber-50" },
        reject: { label: "❌ مرفوض", color: "text-red-700", bg: "bg-red-50" },
      };
      const s = statusMap[orderResult.externalStatus] || statusMap["processing"];
      return (
        <div className="px-4 space-y-6 pb-20 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-gray-800">تم إرسال الطلب!</h2>
            <p className="text-gray-400 text-sm">جاري معالجة طلبك</p>
          </div>
          <div className="w-full bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <div className={`${s.bg} ${s.color} px-4 py-3 rounded-xl font-bold text-center text-lg`}>{s.label}</div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">رقم الطلب الخارجي</span><span className="font-bold text-gray-800 text-xs">{orderResult.externalOrderId}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">المبلغ المدفوع</span><span className="font-bold text-[#B00000]">{finalPrice.toFixed(2)} $</span></div>
            {orderResult.replayApi?.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-xs font-bold text-gray-600 mb-2">بيانات التفعيل:</p>
                {orderResult.replayApi.map((r: string, i: number) => (
                  <p key={i} className="text-sm font-mono font-bold text-[#B00000] break-all">{r}</p>
                ))}
              </div>
            )}
            {orderResult.externalStatus === 'processing' && (
              <OrderPollingStatus
                externalOrderId={orderResult.externalOrderId}
                onStatusChange={(newStatus: string, replayApi: any[]) => {
                  setOrderResult((prev: any) => ({ ...prev, externalStatus: newStatus, replayApi }));
                  fetchOrders();
                }}
              />
            )}
          </div>
          <button
            onClick={() => { setActiveTab("orders"); setView({ type: "main" }); }}
            className={`w-full ${theme.button} text-white py-4 rounded-xl font-bold`}
          >
            عرض طلباتي
          </button>
        </div>
      );
    }

    return (
      <div className="px-4 space-y-6 pb-20">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => setView({ type: "products", data: "الرجوع" })} className="p-2 bg-gray-100 rounded-full">
            <ArrowRight size={20} className="text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">تأكيد الطلب</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-gray-50">
            <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden">
              <img src={prod.image_url || "https://picsum.photos/seed/prod/100/100"} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800">{prod.name}</h4>
              <div className="flex items-center gap-2 flex-wrap">
                {user?.is_vip && <p className="text-gray-400 line-through text-xs">{unitPrice.toFixed(2)} $</p>}
                <p className={`${theme.text} font-bold`}>{unitPrice.toFixed(2)} $</p>
                {user?.is_vip && <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-bold">VIP</span>}
                {prod.store_type === 'external_api' && (
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                    <ExternalLink size={9} /> شحن فوري
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* حقل الكمية للمنتجات الكمية والخارجية */}
          {(prod.store_type === 'quantities' || prod.store_type === 'external_api') && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                الكمية المطلوبة
                {prod.min_quantity ? ` (أقل كمية: ${prod.min_quantity})` : ""}
              </label>
              <input
                ref={qtyRef}
                type="number"
                min={prod.min_quantity || 1}
                defaultValue={displayQty}
                onChange={(e) => setDisplayQty(e.target.value)}
                className={`w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:${theme.border} transition-colors`}
              />
            </div>
          )}

          {/* حقل رقم الهاتف */}
          {prod.store_type === 'numbers' && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">رقم الهاتف</label>
              <input
                ref={extraRef}
                type="tel"
                defaultValue=""
                placeholder="أدخل رقم هاتفك هنا..."
                className={`w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:${theme.border} transition-colors`}
              />
            </div>
          )}

          {/* حقل Player ID للمنتجات الخارجية (Ahminix) */}
          {prod.store_type === 'external_api' && prod.requires_input && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">معرف اللاعب (Player ID) *</label>
              <input
                ref={extraRef}
                type="text"
                defaultValue=""
                placeholder="أدخل معرف اللاعب هنا..."
                className={`w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-blue-400 transition-colors text-center font-bold text-lg`}
              />
              <p className="text-xs text-gray-400 text-center">سيتم معالجة الطلب فورياً بعد تأكيد الدفع</p>
            </div>
          )}

          {/* حقل البيانات للمنتجات العادية */}
          {prod.requires_input && prod.store_type !== 'numbers' && prod.store_type !== 'external_api' && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">معرف اللاعب / رقم الحساب / رقم الهاتف للرصيد</label>
              <input
                ref={extraRef}
                type="text"
                defaultValue=""
                placeholder="أدخل البيانات هنا..."
                className={`w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:${theme.border} transition-colors`}
              />
            </div>
          )}

          <div className="space-y-3 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">سعر الوحدة</span>
              <span className="font-bold">
                {(prod.store_type === 'quantities' || prod.store_type === 'external_api') ? unitPrice.toFixed(6) : unitPrice.toFixed(2)} $
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">الكمية</span>
              <span className="font-bold">{safeQty}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">المجموع الفرعي</span>
              <span className="font-bold">{baseTotal.toFixed(2)} $</span>
            </div>
            {user?.is_vip && (
              <div className="flex justify-between text-sm text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
                <div className="flex items-center gap-1">
                  <Star size={14} fill="currentColor" />
                  <span>خصم VIP (5%)</span>
                </div>
                <span className="font-bold">- {(baseTotal * 0.05).toFixed(2)} $</span>
              </div>
            )}
            <div className="flex justify-between text-lg border-t border-gray-100 pt-3 mt-2">
              <span className="font-bold text-gray-800">المبلغ النهائي</span>
              <div className="text-left">
                <span className={`font-bold ${theme.text} text-xl`}>{finalPrice.toFixed(2)} $</span>
                <p className="text-[10px] text-gray-400">شامل جميع الرسوم</p>
              </div>
            </div>
          </div>

          {prod.store_type === 'external_api' && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
              <ExternalLink size={16} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700">سيتم تنفيذ هذا الطلب فورياً بعد تأكيد الدفع</p>
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

          <button
            disabled={loading}
            onClick={handlePurchase}
            className={`w-full ${theme.button} text-white py-4 rounded-xl font-bold shadow-lg ${theme.shadow} flex items-center justify-center gap-2 disabled:opacity-50`}
          >
            {loading ? "جاري معالجة الطلب..." : "تأكيد الدفع بالرصيد"}
          </button>
        </div>
      </div>
    );
  };

  const WalletView = () => {
    const selectedMethod = selectedPaymentMethod;
    const setSelectedMethod = setSelectedPaymentMethod;
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [receiptUrl, setReceiptUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [txNumber, setTxNumber] = useState("");

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      try {
        const imgbbKey = (import.meta as any).env.VITE_IMGBB_API_KEY || "97ffbf56fe1a203445531d664cd4b928";
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          setReceiptUrl(data.data.url);
        } else {
          console.error("ImgBB Error:", data);
          alert("فشل رفع الصورة: " + (data.error?.message || "خطأ غير معروف"));
        }
      } catch (err) {
        console.error("Upload Error:", err);
        alert("خطأ في الاتصال بخادم الصور");
      } finally {
        setUploading(false);
      }
    };

    const clearReceipt = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setReceiptUrl("");
    };

    const handleAutoTopUp = async () => {
      if (!user || !selectedMethod || !amount || !txNumber) {
        alert("يرجى إدخال المبلغ ورقم العملية");
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/transactions/verify-auto", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` },
          body: JSON.stringify({
            userId: user.id,
            paymentMethodId: selectedMethod.id,
            amount: parseFloat(amount),
            txNumber: txNumber.trim()
          })
        });
        const data = await res.json();
        if (data.success) {
          fetchUser(user.id);
          fetchTransactions();
          const added = data.addedUsd ?? parseFloat(amount);
          const orig = data.originalAmount ? ` (${data.originalAmount} ${data.currency})` : "";
          setView({ type: "success", data: `✅ تم شحن ${added.toFixed(4)}$${orig} بنجاح عبر ${selectedMethod.name}!` });
        } else {
          alert(data.error || "فشل التحقق");
        }
      } catch (e) {
        alert("فشل الاتصال بالخادم");
      } finally {
        setLoading(false);
      }
    };

    const handleTopUp = async () => {
      if (!user || !selectedMethod || !amount || !receiptUrl) {
        alert("يرجى إكمال جميع البيانات ورفع الإيصال");
        return;
      }
      
      const numAmount = parseFloat(amount);
      if (numAmount < selectedMethod.min_amount) {
        alert(`أقل مبلغ للشحن عبر هذه الطريقة هو ${selectedMethod.min_amount} $`);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/transactions/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` },
          body: JSON.stringify({
            userId: user.id,
            paymentMethodId: selectedMethod.id,
            amount: numAmount,
            note,
            receiptImageUrl: receiptUrl
          })
        });
        const data = await res.json();
        if (data.success) {
          setView({ type: "success", data: "تم إرسال طلب الشحن بنجاح، يرجى انتظار التحقق." });
          fetchTransactions();
        } else {
          alert(data.error || "فشل إرسال الطلب");
        }
      } catch (e) {
        alert("فشل الاتصال بالخادم، يرجى المحاولة لاحقاً");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (selectedMethod) {
      const isAuto = selectedMethod.method_type === 'syriatel' || selectedMethod.method_type === 'shamcash';
      return (
        <div className="px-4 space-y-6 pb-20">
          <div className="flex items-center gap-2 mb-6">
            <button onClick={() => setSelectedMethod(null)} className="p-2 bg-gray-100 rounded-full">
              <ArrowRight size={20} className="text-gray-600" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">شحن عبر {selectedMethod.name}</h2>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            {isAuto ? (
              /* --- Auto verify UI (Syriatel / ShamCash) --- */
              <>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center space-y-1">
                  <p className="text-green-700 font-bold text-sm">✅ شحن تلقائي فوري</p>
                  <p className="text-green-600 text-xs">يتم التحقق من العملية تلقائياً وإضافة الرصيد فوراً 
في حال كانت العملية بالليرة السورية سيتم تعبئة رصيد بـ1$ لكل 120 ل.س جديدو</p>
                </div>
                <div className="bg-brand-light p-4 rounded-xl border border-brand-soft text-center">
                  <p className="text-brand text-xs mb-1">
                    {selectedMethod.method_type === 'syriatel' ? 'رقم سيريتل كاش' : 'عنوان شام كاش'}
                  </p>
                  <p className="text-xl font-bold text-brand tracking-wider">{selectedMethod.wallet_address}</p>
                  {selectedMethod.min_amount > 0 && (
                    <p className="text-xs text-brand mt-2 font-bold">أقل مبلغ: {selectedMethod.min_amount} $</p>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">اكتب قيمة المبلغ المرسل ان كان $ او ل.س </label>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-brand" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">رقم العملية (Transaction ID)</label>
                    <input type="text" value={txNumber} onChange={e => setTxNumber(e.target.value)}
                      placeholder={selectedMethod.method_type === 'syriatel' ? 'مثال: 123456789' : 'مثال: 987654321'}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-brand font-mono" />
                    <p className="text-xs text-gray-400">أدخل رقم العملية كما يظهر في تطبيق {selectedMethod.name}</p>
                  </div>
                  <button disabled={loading || !txNumber || !amount} onClick={handleAutoTopUp}
                    className="w-full bg-brand text-white py-4 rounded-xl font-bold shadow-lg shadow-brand-soft disabled:opacity-50">
                    {loading ? "جاري التحقق..." : "تحقق وشحن فوراً"}
                  </button>
                </div>
              </>
            ) : (
              /* --- Manual verify UI (existing) --- */
              <>
                <div className="bg-brand-light p-4 rounded-xl border border-brand-soft text-center">
                  <p className="text-brand text-sm mb-1">رقم المحفظة / العنوان</p>
                  <p className="text-2xl font-bold text-brand tracking-wider">{selectedMethod.wallet_address}</p>
                  {selectedMethod.min_amount > 0 && (
                    <p className="text-xs text-brand mt-2 font-bold">أقل مبلغ: {selectedMethod.min_amount} $</p>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">المبلغ المراد شحنه</label>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-brand" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">ملاحظات إضافية</label>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="اختياري..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-brand h-24 resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">إرفاق صورة الإيصال</label>
                    <label className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors relative overflow-hidden">
                      {receiptUrl ? (
                        <>
                          <img src={receiptUrl} className="w-full h-full object-cover" alt="Receipt" referrerPolicy="no-referrer" />
                          <button onClick={clearReceipt} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"><X size={16} /></button>
                        </>
                      ) : (
                        <>
                          <ImageIcon size={32} />
                          <span className="text-xs">{uploading ? "جاري الرفع..." : "اضغط لرفع الصورة"}</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  </div>
                  <button disabled={loading || uploading || !receiptUrl} onClick={handleTopUp}
                    className="w-full bg-brand text-white py-4 rounded-xl font-bold shadow-lg shadow-brand-soft disabled:opacity-50">
                    {loading ? "جاري الإرسال..." : "إرسال طلب التحقق"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="px-4 space-y-6 pb-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">شحن الرصيد</h2>
        
        <button 
          onClick={() => setView({ type: "voucher_redeem" })}
          className="w-full bg-gradient-to-r from-brand to-brand-soft p-6 rounded-2xl text-white shadow-lg shadow-brand-soft flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Ticket size={28} />
            </div>
            <div className="text-right">
              <h3 className="font-bold text-lg">استرداد كود رصيد</h3>
              <p className="text-white/80 text-xs">اشحن رصيدك عبر الأكواد والقسائم</p>
            </div>
          </div>
          <ChevronRight size={24} className="text-white/60" />
        </button>

        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">طرق الشحن المباشر</h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {paymentMethods.map(method => (
            <button 
              key={method.id}
              onClick={() => setSelectedMethod(method)}
              className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center gap-2 hover:border-brand-soft transition-colors"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                <img src={method.image_url || "https://picsum.photos/seed/pay/100/100"} alt={method.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <span className="font-bold text-gray-800 text-[10px] text-center">{method.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const PaymentsView = () => {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    return (
      <div className="px-4 space-y-6 pb-20">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => setView({ type: "main" })} className="p-2 bg-gray-100 rounded-full">
            <ArrowRight size={20} className="text-gray-600" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">دفعاتي</h2>
        </div>

        <div className="space-y-3">
          {transactions.map(t => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div 
                onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    t.status === 'approved' ? 'bg-brand-light text-brand' : 
                    t.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {t.status === 'approved' ? <CheckCircle size={20} /> : 
                     t.status === 'rejected' ? <XCircle size={20} /> : <Clock size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">{t.method_name}</p>
                    <p className="text-[10px] text-gray-400">{new Date(t.created_at).toLocaleDateString("ar-EG")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <p className="font-bold text-brand">+{t.amount} $</p>
                    <p className={`text-[10px] font-medium ${
                      t.status === 'approved' ? 'text-brand' : 
                      t.status === 'rejected' ? 'text-red-500' : 'text-orange-500'
                    }`}>
                      {t.status === 'approved' ? 'مكتمل' : t.status === 'rejected' ? 'مرفوض' : 'قيد التحقق'}
                    </p>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${expandedId === t.id ? 'rotate-180' : ''}`} />
                </div>
              </div>
              
              {expandedId === t.id && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-50 space-y-3 bg-gray-50/50">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">رقم العملية</p>
                      <p className="font-bold text-gray-700">#TX{t.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">تاريخ الطلب</p>
                      <p className="font-bold text-gray-700">{new Date(t.created_at).toLocaleString("ar-EG")}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">طريقة الشحن</p>
                      <p className="font-bold text-gray-700">{t.method_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">المبلغ</p>
                      <p className="font-bold text-brand">{t.amount} $</p>
                    </div>
                  </div>
                  {t.note && (
                    <div>
                      <p className="text-gray-400 text-xs">ملاحظات</p>
                      <p className="text-gray-700 text-sm">{t.note}</p>
                    </div>
                  )}
                  {t.receipt_image_url && (
                    <div>
                      <p className="text-gray-400 text-xs mb-2">صورة الإيصال</p>
                      <div className="w-full h-48 bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <img 
                          src={t.receipt_image_url} 
                          alt="Receipt" 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                          onClick={() => window.open(t.receipt_image_url, '_blank')}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="text-center py-20 space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                <History size={40} />
              </div>
              <p className="text-gray-400">لا توجد عمليات دفع سابقة</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const OrdersView = () => {
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

    const getOrderCodes = (metaStr: string): string[] => {
      try {
        const meta = JSON.parse(metaStr || "{}");
        const codes: string[] = [];
        // replay_api from Ahminix - the activation codes
        if (Array.isArray(meta.ahminix_replay)) codes.push(...meta.ahminix_replay.filter(Boolean));
        if (Array.isArray(meta.replay_api)) codes.push(...meta.replay_api.filter(Boolean));
        return [...new Set(codes)];
      } catch { return []; }
    };
    const getMetaLabels = (metaStr: string) => {
      // Keys to hide from user (internal fields)
      const hidden = new Set(['storeType','order_mode','ahminix_order_id','ahminix_status','ahminix_replay','replay_api','input','playerId']);
      try {
        const meta = JSON.parse(metaStr || "{}");
        const labelMap: Record<string, string> = {
          playerId: "معرف اللاعب",
          input: "البيانات المدخلة",
          quantity: "الكمية"
        };
        return Object.entries(meta)
          .filter(([k]) => !hidden.has(k))
          .map(([k, v]: any) => ({ label: labelMap[k] || k, value: String(v) }));
      } catch { return []; }
    };

    return (
      <div className="px-4 space-y-6 pb-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">طلباتي</h2>
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div
                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    order.status === 'completed' ? 'bg-brand-light text-brand' :
                    order.status === 'failed' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {order.status === 'completed' ? <CheckCircle size={20} /> :
                     order.status === 'failed' ? <XCircle size={20} /> : <Clock size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">{order.product_name}</p>
                    <p className="text-[10px] text-gray-400">{new Date(order.created_at).toLocaleDateString("ar-EG")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <p className="font-bold text-brand">{order.total_amount} $</p>
                    <p className={`text-[10px] font-medium ${
                      order.status === 'completed' ? 'text-brand' :
                      order.status === 'failed' ? 'text-red-500' : 'text-blue-500'
                    }`}>
                      {order.status === 'new' ? 'جديد' : order.status === 'completed' ? 'مكتمل' : order.status === 'failed' || order.status === 'cancelled' ? 'ملغي' : order.status === 'pending_admin' ? 'ينتظر الموافقة' : 'قيد المعالجة'}
                    </p>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${expandedOrderId === order.id ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {expandedOrderId === order.id && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-50 space-y-3 bg-gray-50/50">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">رقم الطلب</p>
                      <p className="font-bold text-gray-700">#{order.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">تاريخ الطلب</p>
                      <p className="font-bold text-gray-700">{new Date(order.created_at).toLocaleString("ar-EG")}</p>
                    </div>
                    {order.category_name && (
                      <div>
                        <p className="text-gray-400 text-xs">القسم الرئيسي</p>
                        <p className="font-bold text-gray-700">{order.category_name}</p>
                      </div>
                    )}
                    {order.subcategory_name && (
                      <div>
                        <p className="text-gray-400 text-xs">القسم الفرعي</p>
                        <p className="font-bold text-gray-700">{order.subcategory_name}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-400 text-xs">المنتج</p>
                      <p className="font-bold text-gray-700">{order.product_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">الإجمالي</p>
                      <p className="font-bold text-brand">{order.total_amount} $</p>
                    </div>
                  </div>
                  {order.meta && getMetaLabels(order.meta).length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">تفاصيل الطلب</p>
                      {getMetaLabels(order.meta).map(({ label, value }, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="text-gray-500">{label}</span>
                          <span className="font-bold text-gray-700">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Activation codes from API */}
                  {(() => {
                    const codes = getOrderCodes(order.meta || "{}");
                    if (!codes.length) return null;
                    return (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-3 space-y-2">
                        <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle size={12}/> بيانات التفعيل
                        </p>
                        {codes.map((code, i) => (
                          <div key={i} className="flex items-center justify-between gap-2 bg-white rounded-lg p-2 border border-green-100">
                            <p className="font-mono font-bold text-green-800 text-sm break-all">{code}</p>
                            <button
                              onClick={() => { navigator.clipboard.writeText(code); }}
                              className="shrink-0 text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-lg font-bold active:scale-95"
                            >نسخ</button>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  {/* Auto-refresh for processing API orders */}
                  {order.status === 'processing' && (() => {
                    try {
                      const meta = JSON.parse(order.meta || "{}");
                      if (!meta.ahminix_order_id) return null;
                      return (
                        <OrderPollingStatus
                          externalOrderId={meta.ahminix_order_id}
                          onStatusChange={(_newStatus: string, replayApi: any[]) => {
                            fetchOrders();
                          }}
                        />
                      );
                    } catch { return null; }
                  })()}
                  {order.admin_response && (
                    <div className="bg-brand-light p-3 rounded-xl border border-brand-soft">
                      <p className="text-[10px] font-bold text-brand mb-1">رد الإدارة:</p>
                      <p className="text-xs text-brand">{order.admin_response}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {orders.length === 0 && (
            <div className="text-center py-20 space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                <ShoppingBag size={40} />
              </div>
              <p className="text-gray-400">لم تقم بأي طلبات بعد</p>
              <button onClick={() => setActiveTab("home")} className="text-brand font-bold">ابدأ التسوق الآن</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ProfileView = () => {
    const [uploading, setUploading] = useState(false);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("image", file);
        const imgbbKey = (import.meta as any).env.VITE_IMGBB_API_KEY || "97ffbf56fe1a203445531d664cd4b928";
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, { method: "POST", body: formData });
        const data = await res.json();
        if (data.success) {
          const updateRes = await fetch(`/api/user/${user?.id}/avatar`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ avatar_url: data.data.url })
          });
          if (updateRes.ok) { fetchUser(user!.id); alert("تم تحديث الصورة الشخصية بنجاح"); }
        }
      } catch { alert("فشل رفع الصورة"); } finally { setUploading(false); }
    };

    return (
      <div className="px-4 space-y-5 pb-20">

        {/* بطاقة الملف الشخصي */}
        <div className={`bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-3 ${user?.is_vip ? 'vip-card-glow border-amber-200 shadow-amber-50' : ''}`}>
          
          {/* زر معلومات الحساب */}
          <div className="w-full flex justify-end -mb-1">
            <button
              onClick={() => setView({ type: "profile_details" })}
              className="p-2 bg-gray-100 hover:bg-brand-light text-gray-500 hover:text-brand rounded-xl transition-all active:scale-90"
              title="معلومات الحساب التفصيلية"
            >
              <Pencil size={16} />
            </button>
          </div>

          {/* الصورة الشخصية */}
          <div className="relative">
            <div className={`w-24 h-24 ${theme.bgLight} rounded-full flex items-center justify-center ${theme.icon} border-4 border-white shadow-lg ${theme.shadow} overflow-hidden ${user?.is_vip ? 'vip-glow' : ''} ${user?.stats?.frame ? `frame-${user.stats.frame}` : ''}`}>
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : <User size={48} />}
              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-brand text-white p-2 rounded-full cursor-pointer shadow-lg hover:opacity-90 transition-colors">
              <Plus size={16} />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
            </label>
          </div>

          {/* الاسم والبيانات */}
          <div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <h2 className={`text-xl font-bold text-gray-800 ${user?.is_vip ? 'vip-text-glow' : ''}`}>{user?.name || "زائر"}</h2>
              {user?.is_vip && <span className="vip-badge"><Crown size={10} />VIP</span>}
              {user?.stats?.profile_badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold badge-${user.stats.profile_badge} inline-flex items-center gap-1`}>
                  {user.stats.profile_badge === 'bronze' && <Award size={10} />}
                  {user.stats.profile_badge === 'active' && <Star size={10} />}
                  {user.stats.profile_badge === 'energy' && <Zap size={10} />}
                  {user.stats.profile_badge === 'silver' && <ShieldCheck size={10} />}
                  {user.stats.profile_badge === 'gold' && <Crown size={10} />}
                  {user.stats.profile_badge === 'diamond' && <Star size={10} />}
                  {user.stats.profile_badge === 'legendary' && <Crown size={10} />}
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm mt-0.5">{user?.email || "قم بتسجيل الدخول للوصول لكافة الميزات"}</p>
            {user?.id && <p className="text-xs text-brand font-bold mt-1">رقم الدخول: #{user.id}</p>}
            {user?.stats?.user_title && (
              <p className="text-xs font-bold mt-1 text-purple-600 flex items-center justify-center gap-1"><Award size={11} /> {user.stats.user_title}</p>
            )}
          </div>

          {/* أزرار الإجراءات السريعة - 3 أزرار في صف */}
          {user && (
            <div className="w-full grid grid-cols-3 gap-2 pt-1">
              {user.telegram_chat_id ? (
                <button onClick={handleUnlinkTelegram} className="bg-red-50 text-red-600 p-3 rounded-2xl border border-red-100 flex flex-col items-center gap-1 transition-all active:scale-95">
                  <LogOut size={18} />
                  <span className="text-[10px] font-bold">إلغاء تليجرام</span>
                </button>
              ) : (
                <button onClick={handleGenerateLinkingCode} className="bg-blue-50 text-blue-600 p-3 rounded-2xl border border-blue-100 flex flex-col items-center gap-1 transition-all active:scale-95">
                  <MessageSquare size={18} />
                  <span className="text-[10px] font-bold">ربط تليجرام</span>
                </button>
              )}
              <button onClick={() => setView({ type: "referral" })} className="bg-brand-light text-brand p-3 rounded-2xl border border-brand-soft flex flex-col items-center gap-1 transition-all active:scale-95">
                <Plus size={18} />
                <span className="text-[10px] font-bold">الإحالة</span>
              </button>
              <button onClick={() => setView({ type: "payments" })} className="bg-green-50 text-green-600 p-3 rounded-2xl border border-green-100 flex flex-col items-center gap-1 transition-all active:scale-95">
                <History size={18} />
                <span className="text-[10px] font-bold">دفعاتي</span>
              </button>
            </div>
          )}
          {/* زر الترتيب */}
          {user && (
            <button onClick={() => setView({ type: "leaderboard" })} className="w-full bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 py-2.5 rounded-2xl border border-amber-100 flex items-center justify-center gap-2 transition-all active:scale-95 font-bold text-sm">
              <Trophy size={18} className="text-amber-500" />
              الترتيب
            </button>
          )}
        </div>

        {/* حالة تليجرام */}
        {user && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${user?.telegram_chat_id ? 'bg-blue-100' : 'bg-orange-100'}`}>
                <MessageSquare size={16} className={user?.telegram_chat_id ? 'text-blue-600' : 'text-orange-500'} />
              </div>
              <div>
                <p className={`text-sm font-bold ${user?.telegram_chat_id ? 'text-blue-800' : 'text-orange-700'}`}>
                  {user?.telegram_chat_id ? 'تليجرام مرتبط' : 'تليجرام غير مرتبط'}
                </p>
                <p className={`text-[10px] ${user?.telegram_chat_id ? 'text-blue-400' : 'text-orange-400'}`}>
                  {user?.telegram_chat_id ? 'حسابك مؤمن بالبوت' : 'اربط للحصول على إشعارات'}
                </p>
              </div>
            </div>
            {user?.telegram_chat_id ? (
              <button onClick={handleUnlinkTelegram} className="text-[10px] font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">فك الربط</button>
            ) : (
              <button onClick={handleGenerateLinkingCode} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">ربط الآن</button>
            )}
          </div>
        )}

        {/* نظام المكافآت */}
        {user && user.stats && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-amber-500" />
                <h3 className="font-bold text-gray-800">نظام المكافآت</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-1 rounded-lg">
                  {user.stats.total_recharge_sum.toFixed(2)} $
                </span>
                <button onClick={() => setShowAllRewards(!showAllRewards)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                  {showAllRewards ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {REWARD_GOALS.map((goal, index) => {
                const isClaimed = user.stats!.claimed_reward_index >= index;
                const isReached = user.stats!.total_recharge_sum >= goal.target;
                const isCurrent = user.stats!.claimed_reward_index === index - 1;
                const prevTarget = index === 0 ? 0 : REWARD_GOALS[index - 1].target;
                const progress = Math.min(100, Math.max(0, ((user.stats!.total_recharge_sum - prevTarget) / (goal.target - prevTarget)) * 100));
                if (!showAllRewards && !isCurrent) return null;
                return (
                  <div key={goal.id} className={`space-y-3 p-4 rounded-2xl border transition-all ${isClaimed ? 'bg-brand-light border-brand-soft' : isCurrent ? 'bg-amber-50 border-amber-100 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-40'}`}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-base ${isClaimed ? 'bg-brand/10' : isCurrent ? 'bg-amber-100' : 'bg-gray-100'}`}>
                          {goal.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-gray-800">{goal.title}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{goal.rewardText}</p>
                          {(goal as any).rewards?.discount && (
                            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                              🏷️ خصم {(goal as any).rewards.discount}% مدى الحياة
                            </span>
                          )}
                          {isClaimed && (goal as any).rewards?.frame && (
                            <span className="inline-flex items-center gap-1 mt-1 ml-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">🖼️ إطار مفعّل</span>
                          )}
                          {isClaimed && (goal as any).rewards?.badge && (
                            <span className="inline-flex items-center gap-1 mt-1 ml-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">🏅 شارة مفعّلة</span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {isClaimed ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-brand whitespace-nowrap"><CheckCircle size={13} />تم</span>
                        ) : isReached ? (
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch("/api/rewards/claim", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` }, body: JSON.stringify({ goalIndex: index }) });
                                const resData = await res.json();
                                if (res.ok) {
                                  alert("🎁 مبروك! تم استلام المكافأة بنجاح");
                                  if (resData.stats) { setUser(prev => prev ? { ...prev, stats: resData.stats } : prev); // stats تبقى في React state }
                                  fetchUser(user.id);
                                } else { alert(resData.error || "فشل استلام المكافأة"); }
                              } catch (error) { 
  alert("خطأ في الاتصال");
                                }
                            }}
                            className="bg-brand text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm active:scale-95 transition-all whitespace-nowrap"
                          >استلام 🎁</button>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 whitespace-nowrap">{(goal.target - user.stats!.total_recharge_sum).toFixed(0)} $ متبقي</span>
                        )}
                      </div>
                    </div>
                    {!isClaimed && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-400">
                          <span>{prevTarget} $</span><span>{goal.target} $</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-500 ${isReached ? 'bg-brand' : 'bg-amber-400'}`} style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* قائمة الإجراءات */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
          <ProfileItem icon={<User size={20} />} label="تعديل الملف الشخصي" onClick={() => setView({ type: "edit_profile" })} />
          {!!user?.stats?.has_special_support && (
            <ProfileItem icon={<ShieldCheck size={20} />} label="الدعم الخاص (الأولوية)" className="text-amber-600 bg-amber-50/50" onClick={() => alert("لديك أولوية في الدعم الفني. تواصل معنا عبر الواتساب.")} />
          )}
          <ProfileItem icon={<Settings size={20} />} label="الإعدادات" onClick={() => setView({ type: "settings" })} />
          <ProfileItem icon={<Clock size={20} />} label="سياسة الخصوصية" onClick={() => setView({ type: "privacy_policy" })} />
          <ProfileItem icon={<MessageSquare size={20} />} label="الدعم الفني" onClick={() => setView({ type: "chat" })} className="text-brand relative" badge={user?.unread_support_count > 0 ? user.unread_support_count : undefined} />
          {!!user?.stats?.custom_theme_color && (
            <ProfileItem icon={<Palette size={20} />} label="تخصيص الثيم" onClick={() => setThemeModal({ isOpen: true, color: user.stats.custom_theme_color === 'any' ? '#10b981' : user.stats.custom_theme_color })} className="text-brand" />
          )}
          {user ? (
            <ProfileItem icon={<LogOut size={20} />} label="تسجيل الخروج" onClick={handleLogout} className="text-red-500" />
          ) : (
            <ProfileItem icon={<ArrowRight size={20} />} label="تسجيل الدخول" onClick={() => setView({ type: "login" })} />
          )}
        </div>
      </div>
    );
  };

    const ProfileItem = ({ icon, label, onClick, className = "", badge }: any) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${className}`}>
      <div className="flex items-center gap-4">
        <span className="text-gray-400">{icon}</span>
        <span className="font-medium text-gray-700">{label}</span>
        {badge !== undefined && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
            {badge}
          </span>
        )}
      </div>
      <ChevronRight size={18} className="text-gray-300" />
    </button>
  );

  const ThemeCustomizationModal = () => {
    if (!themeModal.isOpen) return null;
    const colors = [
      "#10b981", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6", 
      "#ec4899", "#06b6d4", "#14b8a6", "#f97316", "#6366f1",
      "#000000", "#4b5563", "#1e293b", "#064e3b", "#7c2d12"
    ];

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand via-brand to-blue-500"></div>
          <button onClick={() => setThemeModal({ ...themeModal, isOpen: false })} className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center text-brand mx-auto mb-4">
              <Palette size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">تخصيص لون الثيم</h3>
            <p className="text-gray-400 text-sm mt-1">اختر لونك المفضل لتمييز حسابك</p>
          </div>

          <div className="grid grid-cols-5 gap-3 mb-8">
            {colors.map(c => (
              <button 
                key={c} 
                onClick={() => setThemeModal({ ...themeModal, color: c })}
                className={`w-full aspect-square rounded-xl transition-all ${themeModal.color === c ? 'ring-4 ring-offset-2 ring-brand scale-110' : 'hover:scale-105'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-10 h-10 rounded-lg shadow-sm" style={{ backgroundColor: themeModal.color }}></div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">اللون المختار</p>
                <p className="text-sm font-mono font-bold text-gray-700">{themeModal.color}</p>
              </div>
            </div>
            
            <button 
              onClick={() => handleUpdateTheme(themeModal.color)}
              className="w-full bg-gray-800 text-white py-4 rounded-2xl font-bold shadow-lg shadow-gray-100 transition-all active:scale-95"
            >
              حفظ التغييرات
            </button>
          </div>
        </motion.div>
      </div>
    );
  };


  // ============================================================
  // VERIFY EMAIL VIEW - 6-digit OTP boxes
  // ============================================================
  const VerifyEmailView = ({ email, onSuccess, type = "verify" }: { email: string; onSuccess: (userData?: any) => void; type?: "verify" | "reset" }) => {
    const [digits, setDigits] = useState<string[]>(["","","","","",""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendTimer, setResendTimer] = useState(60);
    const [resending, setResending] = useState(false);
    const inputRefs = Array.from({ length: 6 }, () => React.useRef<HTMLInputElement>(null));

    useEffect(() => {
      inputRefs[0].current?.focus();
      const t = setInterval(() => setResendTimer(s => s > 0 ? s - 1 : 0), 1000);
      return () => clearInterval(t);
    }, []);

    const handleDigit = (i: number, val: string) => {
      const v = val.replace(/[^0-9]/g, "").slice(-1);
      const next = [...digits];
      next[i] = v;
      setDigits(next);
      if (v && i < 5) inputRefs[i + 1].current?.focus();
    };

    const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !digits[i] && i > 0) {
        inputRefs[i - 1].current?.focus();
      }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
      if (pasted.length === 6) {
        setDigits(pasted.split(""));
        inputRefs[5].current?.focus();
      }
    };

    const handleVerify = async () => {
      const code = digits.join("");
      if (code.length < 6) return setError("أدخل الرمز المكون من 6 أرقام");
      setLoading(true); setError("");
      try {
        const endpoint = type === "verify" ? "/api/auth/verify-email" : "/api/auth/verify-reset-otp";
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code })
        });
        const data = await res.json();
        if (res.ok) {
          onSuccess(data);
        } else {
          setError(data.error || "الرمز غير صحيح");
          setDigits(["","","","","",""]);
          inputRefs[0].current?.focus();
        }
      } catch { setError("خطأ في الاتصال"); }
      finally { setLoading(false); }
    };

    const handleResend = async () => {
      if (resendTimer > 0) return;
      setResending(true);
      try {
        await fetch("/api/auth/resend-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, type })
        });
        setResendTimer(60);
        setDigits(["","","","",""," "]);
        setDigits(["","","","","",""]);
        inputRefs[0].current?.focus();
      } catch {}
      finally { setResending(false); }
    };

    return (
      <div className="px-6 flex flex-col items-center justify-center min-h-[80vh] pb-20">
        <div className="w-20 h-20 bg-brand rounded-3xl flex items-center justify-center text-white shadow-xl shadow-brand-soft mb-8">
          <Mail size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {type === "verify" ? "تحقق من بريدك" : "أدخل رمز التحقق"}
        </h2>
        <p className="text-gray-400 text-sm mb-2 text-center">
          أرسلنا رمزاً مكوناً من 6 أرقام إلى
        </p>
        <p className="text-brand font-bold text-sm mb-8 text-center">{email}</p>

        {/* OTP Boxes */}
        <div className="flex gap-3 mb-6 dir-ltr" dir="ltr" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={inputRefs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`w-12 h-14 text-center text-2xl font-black rounded-2xl border-2 outline-none transition-all
                ${d ? 'border-brand bg-brand-light text-brand' : 'border-gray-200 bg-white text-gray-800'}
                focus:border-brand focus:bg-brand-light`}
            />
          ))}
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <button
          disabled={loading || digits.join("").length < 6}
          onClick={handleVerify}
          className="w-full bg-brand text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-soft disabled:opacity-50 mb-4"
        >
          {loading ? "جاري التحقق..." : "تأكيد الرمز"}
        </button>

        <button
          disabled={resendTimer > 0 || resending}
          onClick={handleResend}
          className="flex items-center gap-2 text-sm font-bold disabled:text-gray-300 text-brand"
        >
          <RotateCcw size={16} />
          {resendTimer > 0 ? `إعادة الإرسال بعد ${resendTimer}s` : (resending ? "جاري الإرسال..." : "إعادة إرسال الرمز")}
        </button>

        {/* Spam tip */}
        <div className="mt-6 mx-auto max-w-xs bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <p className="text-[11px] text-amber-700 text-center leading-relaxed">
            <span className="font-bold block mb-1">لا ترى البريد الإلكتروني؟</span>
            في حال عدم رؤيتك للبريد من البريد الوارد، اضغط على القائمة الجانبية
            <span className="font-bold mx-1">|||</span>
            ثم اذهب إلى <span className="font-bold">الرسائل غير المرغوب فيها</span>، حدّث الصفحة وسترى الإيميل.
          </p>
        </div>
      </div>
    );
  };

  // ============================================================
  // FORGOT PASSWORD VIEW
  // ============================================================
  const ForgotPasswordView = () => {
    const [step, setStep] = useState<"email" | "otp" | "newpass">("email");
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [error, setError] = useState("");

    const handleSendOtp = async () => {
      if (!email) return setError("أدخل بريدك الإلكتروني");
      setLoading(true); setError("");
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (res.ok) { setStep("otp"); }
        else { setError(data.error || "حدث خطأ"); }
      } catch { setError("خطأ في الاتصال"); }
      finally { setLoading(false); }
    };

    const handleResetPassword = async () => {
      if (newPassword !== confirmPassword) return setError("كلمتا المرور غير متطابقتين");
      if (newPassword.length < 6) return setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      setResetting(true); setError("");
      try {
        // We pass a dummy code here since OTP was already verified in step "otp"
        // Server accepts recently-verified OTPs
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: "verified", newPassword })
        });
        const data = await res.json();
        if (res.ok) {
          // Auto login after password reset
          const loginRes = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: newPassword })
          });
          const loginData = await loginRes.json();
          if (loginRes.ok && loginData.id) {
            setUser(loginData);
            if (loginData.token) localStorage.setItem("authToken", loginData.token);
            localStorage.setItem("userId", String(loginData.id));
            setView({ type: "main" });
            setActiveTab("home");
          } else {
            setView({ type: "login" });
          }
        } else { setError(data.error || "حدث خطأ"); }
      } catch { setError("خطأ في الاتصال"); }
      finally { setResetting(false); }
    };

    // Step 3: New password
    if (step === "newpass") {
      return (
        <div className="px-6 flex flex-col items-center justify-center min-h-[80vh] pb-20">
          <div className="w-20 h-20 bg-brand rounded-3xl flex items-center justify-center text-white shadow-xl shadow-brand-soft mb-6">
            <KeyRound size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">كلمة مرور جديدة</h2>
          <p className="text-gray-400 text-sm mb-8 text-center">تم التأكيد · اكتب كلمة المرور الجديدة</p>
          <div className="w-full space-y-4">
            <input type="password" placeholder="كلمة المرور الجديدة (6 أحرف على الأقل)"
              value={newPassword} onChange={e => setNewPassword(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-brand shadow-sm"/>
            <input type="password" placeholder="تأكيد كلمة المرور"
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-brand shadow-sm"/>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button disabled={resetting} onClick={handleResetPassword}
              className="w-full bg-brand text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-soft disabled:opacity-50">
              {resetting ? "جاري الحفظ..." : "حفظ كلمة السر وتسجيل الدخول"}
            </button>
          </div>
        </div>
      );
    }

    // Step 2: OTP verification
    if (step === "otp") {
      return (
        <VerifyEmailView
          email={email}
          type="reset"
          onSuccess={() => setStep("newpass")}
        />
      );
    }

    // Step 1: Enter email
    return (
      <div className="px-6 flex flex-col items-center justify-center min-h-[80vh] pb-20">
        <div className="w-20 h-20 bg-brand rounded-3xl flex items-center justify-center text-white shadow-xl shadow-brand-soft mb-6">
          <KeyRound size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">استرداد الحساب</h2>
        <p className="text-gray-400 text-sm mb-8 text-center">لاسترداد كلمة مرورك ضع الإيميل بالأسفل</p>
        <div className="w-full space-y-4">
          <input type="email" placeholder="البريد الإلكتروني"
            value={email} onChange={e => setEmail(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-brand shadow-sm"
            onKeyDown={e => e.key === "Enter" && handleSendOtp()}
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button disabled={loading} onClick={handleSendOtp}
            className="w-full bg-brand text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-soft disabled:opacity-50">
            {loading ? "جاري الإرسال..." : "تأكيد"}
          </button>
          <button onClick={() => setView({ type: "login" })}
            className="w-full text-gray-400 text-sm font-medium pt-1">
            العودة لتسجيل الدخول
          </button>
        </div>
      </div>
    );
  };

  const LoginView = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [referralCode, setReferralCode] = useState(localStorage.getItem("referralCode") || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [verifyEmail, setVerifyEmail] = useState<string | null>(null);

    const handleAuth = async () => {
      setLoading(true);
      setError("");

      // ── Validation محلي قبل الإرسال ──
      if (isRegister) {
        if (!name || name.trim().length < 2 || name.trim().length > 60) {
          setError("الاسم يجب أن يكون بين 2 و60 حرف");
          setLoading(false); return;
        }
        if (/<[^>]*>/.test(name)) {
          setError("الاسم لا يجب أن يحتوي على رموز HTML");
          setLoading(false); return;
        }
        if (phone && !/^\+?[\d\s\-(). ]{7,20}$/.test(phone.trim())) {
          setError("رقم الهاتف غير صحيح — أرقام فقط (7-20 رقم)");
          setLoading(false); return;
        }
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
        setError("البريد الإلكتروني غير صحيح");
        setLoading(false); return;
      }
      if (password.length < 8) {
        setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
        setLoading(false); return;
      }

      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const body = isRegister ? { name: name.trim(), email: email.trim().toLowerCase(), password, phone: phone.trim(), referralCode } : { email: email.trim().toLowerCase(), password };
      
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Expected JSON response from auth API");
        }

        const data = await res.json();
        if (res.ok) {
          if (data.requiresVerification) {
            // Registration success → show OTP verification
            setVerifyEmail(data.email || email);
          } else {
            setUser(data);
            // حفظ الـ token فقط — البيانات الحساسة تبقى في React state
            if (data.token) localStorage.setItem("authToken", data.token);
            localStorage.setItem("userId", String(data.id));
            localStorage.removeItem("referralCode");
            setView({ type: "main" });
            setActiveTab("home");
          }
        } else {
          if (data.requiresVerification) {
            // Account not verified → show OTP
            setVerifyEmail(data.email || email);
          } else {
            setError(data.error || "حدث خطأ ما");
          }
        }
      } catch (e: any) {
        if (e.name === 'TypeError' && e.message === 'Failed to fetch') {
          setError("فشل الاتصال بالخادم (تأكد من اتصالك بالإنترنت)");
        } else {
          setError("حدث خطأ غير متوقع أثناء تسجيل الدخول");
          console.error("Auth error:", e);
        }
      } finally {
        setLoading(false);
      }
    };

    // Show OTP verification screen
    if (verifyEmail) {
      return (
        <VerifyEmailView
          email={verifyEmail}
          type="verify"
          onSuccess={(userData) => {
            if (userData && userData.id) {
              setUser(userData);
              if (userData.token) localStorage.setItem("authToken", userData.token);
              localStorage.setItem("userId", String(userData.id));
              localStorage.removeItem("referralCode");
              setView({ type: "main" });
              setActiveTab("home");
            } else {
              setVerifyEmail(null);
            }
          }}
        />
      );
    }

    return (
      <div className="px-6 flex flex-col items-center justify-center min-h-[80vh] pb-20">
        <div className="w-20 h-20 bg-brand rounded-3xl flex items-center justify-center text-white shadow-xl shadow-brand-soft mb-8">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{isRegister ? "إنشاء حساب جديد" : "تسجيل الدخول"}</h2>
        <p className="text-gray-400 text-sm mb-8 text-center">أهلاً بك في متجرنا، يرجى إدخال بياناتك للمتابعة</p>
        
        <div className="w-full space-y-4">
          {isRegister && (
            <input 
              type="text" 
              placeholder="الاسم الكامل" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-brand shadow-sm"
            />
          )}
          <input 
            type="email" 
            placeholder="البريد الإلكتروني" 
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
            autoComplete="email"
            className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-brand shadow-sm"
          />
          {isRegister && (
            <input 
              type="tel" 
              placeholder="رقم الهاتف (مثال: +963xxxxxxxxx)" 
              value={phone}
              onChange={(e) => {
                // أرقام وعلامات هاتف فقط
                const val = e.target.value.replace(/[^\d\s\+\-\(\)\.]/g, "");
                if (val.length <= 20) setPhone(val);
              }}
              pattern="[+\d\s\-\(\)\.]{7,20}"
              className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-brand shadow-sm"
            />
          )}
          <input 
            type="password" 
            placeholder="كلمة المرور" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-brand shadow-sm"
          />
          {!isRegister && (
            <button
              onClick={() => setView({ type: "forgot_password" })}
              className="text-right text-xs text-gray-800 font-medium -mt-1"
            >
              نسيت كلمة المرور؟
            </button>
          )}
          {isRegister && (
            <input 
              type="text" 
              placeholder="كود الإحالة (اختياري)" 
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-brand shadow-sm"
            />
          )}
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <button 
            disabled={loading}
            onClick={handleAuth}
            className="w-full bg-brand text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-soft disabled:opacity-50"
          >
            {loading ? "جاري المعالجة..." : (isRegister ? "إنشاء الحساب" : "دخول")}
          </button>
          
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className={`w-full ${theme.text} text-sm font-bold pt-4`}
          >
            {isRegister ? "لديك حساب بالفعل؟ سجل دخولك" : "ليس لديك حساب؟ أنشئ حساباً جديداً"}
          </button>

          <button 
            onClick={() => setView({ type: "chat" })}
            className="w-full flex items-center justify-center gap-2 text-gray-400 text-xs font-bold pt-4"
          >
            <Phone size={14} /> تواصل مع الدعم الفني
          </button>
        </div>
      </div>
    );
  };

  const ProfileDetailsView = () => {
    return (
      <div className="px-4 space-y-4 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 pt-2">
          <button onClick={() => setView({ type: "main" })} className="p-2 bg-gray-100 rounded-xl text-gray-600 active:scale-90 transition-all">
            <ArrowRight size={20} />
          </button>
          <h2 className="font-bold text-gray-800 text-lg">معلومات الحساب</h2>
        </div>

        {/* صورة واسم */}
        <div className={`bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-2 ${user?.is_vip ? 'vip-card-glow border-amber-200' : ''}`}>
          <div className={`w-20 h-20 ${theme.bgLight} rounded-full flex items-center justify-center ${theme.icon} border-4 border-white shadow-lg overflow-hidden ${user?.is_vip ? 'vip-glow' : ''}`}>
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User size={40} />
            )}
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <h3 className={`text-xl font-bold text-gray-800 ${user?.is_vip ? 'vip-text-glow' : ''}`}>{user?.name || "—"}</h3>
              {user?.is_vip && <span className="vip-badge"><Crown size={10} />VIP</span>}
            </div>
            <p className="text-gray-400 text-sm">{user?.email || "—"}</p>
            {user?.phone && <p className="text-gray-400 text-xs mt-0.5">{user.phone}</p>}
          </div>
        </div>

        {/* شبكة البيانات */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-brand-light p-4 rounded-2xl border border-brand-soft">
            <p className="text-[10px] text-brand font-bold uppercase tracking-wider mb-1">رقم الدخول</p>
            <p className="text-lg font-bold text-brand">#{user?.id || "—"}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
            <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider mb-1">رقم الدخول</p>
            <p className="text-lg font-bold text-purple-700">#{user?.id || "—"}</p>
          </div>
          <div className={`${theme.bgLight} p-4 rounded-2xl border ${theme.border}`}>
            <p className={`text-[10px] ${theme.text} font-bold uppercase tracking-wider mb-1`}>الرصيد</p>
            <p className={`text-lg font-bold ${theme.textDark}`}>{user?.balance?.toFixed(2) ?? "0.00"} $</p>
          </div>
          <div className={`${user?.is_vip ? 'bg-amber-100 border-amber-200' : 'bg-gray-50 border-gray-100'} p-4 rounded-2xl border`}>
            <p className={`text-[10px] ${user?.is_vip ? 'text-amber-600' : 'text-gray-500'} font-bold uppercase tracking-wider mb-1`}>الحالة</p>
            <p className={`text-lg font-bold ${user?.is_vip ? 'text-amber-700' : 'text-gray-700'}`}>{user?.is_vip ? 'VIP 💎' : 'عادي'}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1">إجمالي الطلبات</p>
            <p className="text-lg font-bold text-blue-700">{orders.length}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1">إجمالي الشحن</p>
            <p className="text-lg font-bold text-emerald-700">{user?.stats?.total_recharge_sum?.toFixed(2) ?? "0.00"} $</p>
          </div>
          <div className="bg-green-50 p-4 rounded-2xl border border-green-100 col-span-2">
            <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider mb-1">تاريخ الانضمام</p>
            <p className="text-base font-bold text-green-700">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString("ar-EG", { year: 'numeric', month: 'long', day: 'numeric' }) : "—"}
            </p>
          </div>
        </div>

        {/* روابط سريعة */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
          <button onClick={() => setView({ type: "payments" })} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-light text-brand rounded-xl flex items-center justify-center"><History size={18} /></div>
              <span className="font-bold text-gray-800 text-sm">دفعاتي</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>
          <button onClick={() => setActiveTab("orders")} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><ShoppingBag size={18} /></div>
              <span className="font-bold text-gray-800 text-sm">طلباتي</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>
          <button onClick={() => setView({ type: "edit_profile" })} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center"><Pencil size={18} /></div>
              <span className="font-bold text-gray-800 text-sm">تعديل المعلومات</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>
        </div>
      </div>
    );
  };


  const LeaderboardView = () => {
    const [tab, setTab] = useState<'topup'|'referral'|'activity'>('topup');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInfo, setShowInfo] = useState<string|null>(null);

    useEffect(() => {
      setLoading(true);
      setData([]);
      fetch(`/api/leaderboard/${tab}`)
        .then(r => r.json())
        .then(d => setData(Array.isArray(d) ? d : []))
        .catch(() => setData([]))
        .finally(() => setLoading(false));
    }, [tab]);

    const tabs = [
      {
        key: 'topup',
        label: 'أكثر شحناً',
        icon: <Wallet size={18}/>,
        color: 'text-green-600',
        activeBg: 'bg-green-50 border-green-200',
        desc: 'ترتيب المستخدمين حسب إجمالي مبالغ الشحن التي أضافوها لحساباتهم منذ تسجيلهم وحتى الآن.'
      },
      {
        key: 'referral',
        label: 'أكثر إحالةً',
        icon: <Share2 size={18}/>,
        color: 'text-blue-600',
        activeBg: 'bg-blue-50 border-blue-200',
        desc: 'ترتيب المستخدمين حسب عدد الأصدقاء الذين دعوهم للمنصة عبر رابط الإحالة الخاص بهم.'
      },
      {
        key: 'activity',
        label: 'الأكثر نشاطاً',
        icon: <Zap size={18}/>,
        color: 'text-amber-600',
        activeBg: 'bg-amber-50 border-amber-200',
        desc: 'ترتيب المستخدمين حسب إجمالي عدد الطلبات التي أجروها في المتجر منذ انضمامهم.'
      },
    ] as const;

    const medalIcons = [
      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center"><Trophy size={16} className="text-amber-500"/></div>,
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><Trophy size={16} className="text-gray-400"/></div>,
      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center"><Trophy size={16} className="text-orange-400"/></div>,
    ];

    const activeTab = tabs.find(t => t.key === tab)!;

    return (
      <div className="px-4 space-y-4 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 pt-2">
          <button onClick={() => setView({ type: 'main' })} className="p-2 bg-gray-100 rounded-xl text-gray-600 active:scale-90 transition-all">
            <ArrowRight size={20} />
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <Trophy size={20} className="text-amber-500" />لوحة الترتيب
            </h2>
            <p className="text-xs text-gray-400">ترتيب مدى الحياة · بدون جوائز</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-2">
          {tabs.map(t => (
            <div key={t.key} className="relative">
              <button onClick={() => { setTab(t.key); setShowInfo(null); }}
                className={`w-full p-3 rounded-2xl border text-center transition-all active:scale-95 ${tab === t.key ? t.activeBg : 'bg-white border-gray-100'}`}>
                <div className={`flex justify-center mb-1 ${tab === t.key ? t.color : 'text-gray-400'}`}>{t.icon}</div>
                <p className={`text-[10px] font-bold ${tab === t.key ? t.color : 'text-gray-400'}`}>{t.label}</p>
              </button>
              <button
                onClick={() => setShowInfo(showInfo === t.key ? null : t.key)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                <HelpCircle size={11}/>
              </button>
            </div>
          ))}
        </div>

        {/* Info tooltip */}
        {showInfo && (
          <div className={`p-3 rounded-2xl border text-xs text-gray-600 leading-relaxed ${tabs.find(t=>t.key===showInfo)?.activeBg || 'bg-gray-50 border-gray-100'}`}>
            <div className="flex items-start gap-2">
              <Info size={14} className="mt-0.5 shrink-0 text-gray-400"/>
              <p>{tabs.find(t => t.key === showInfo)?.desc}</p>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"/></div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Trophy size={40} className="mx-auto mb-3 opacity-20"/>
            <p className="text-sm">لا توجد بيانات بعد</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.map((entry: any, i: number) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                i === 0 ? 'bg-amber-50 border-amber-200 shadow-sm' :
                i === 1 ? 'bg-gray-50 border-gray-200' :
                i === 2 ? 'bg-orange-50 border-orange-100' :
                'bg-white border-gray-100'
              }`}>
                {/* Rank */}
                <div className="w-8 shrink-0 flex justify-center">
                  {i < 3
                    ? medalIcons[i]
                    : <span className="text-xs font-black text-gray-400">#{i+1}</span>
                  }
                </div>
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${theme.bgLight}`}>
                  {entry.avatar_url
                    ? <img src={entry.avatar_url} className="w-full h-full object-cover" referrerPolicy="no-referrer"/>
                    : <User size={20} className={theme.icon}/>}
                </div>
                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-800 truncate">{entry.name || 'مجهول'}</p>
                  {entry.badge && (
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">{entry.badge}</span>
                  )}
                </div>
                {/* Value */}
                <div className="text-right shrink-0 flex items-center gap-1">
                  <div className={i < 3 ? activeTab.color : 'text-gray-400'}>
                    {activeTab.icon}
                  </div>
                  <div>
                    <p className={`font-black text-sm ${i < 3 ? activeTab.color : 'text-gray-700'}`}>{entry.value}</p>
                    <p className="text-[9px] text-gray-400">{entry.unit}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Current user position */}
        {user && data.length > 0 && (() => {
          const myIdx = data.findIndex((e:any) => String(e.user_id) === String(user.id));
          return (
            <div className={`rounded-2xl p-3 text-center border ${myIdx >= 0 ? 'bg-brand-light border-brand-soft' : 'bg-gray-50 border-gray-100'}`}>
              {myIdx >= 0
                ? <p className="text-xs font-bold text-brand">أنت في المركز #{myIdx + 1} 🎉</p>
                : <p className="text-xs text-gray-400">أنت لست في الترتيب حتى الآن · استمر!</p>
              }
            </div>
          );
        })()}
      </div>
    );
  };

  const EditProfileView = () => {
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleUpdate = async () => {
      if (!user) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/user/update", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` },
          body: JSON.stringify({ userId: user.id, name, email, phone, password })
        });
        const data = await res.json();
        if (res.ok) {
          // reload full user object to avoid partial data crash
          await fetchUser(user!.id);
          setView({ type: "success", data: "تم تحديث المعلومات بنجاح" });
        } else {
          setError(data.error || "فشل التحديث");
        }
      } catch (e) {
        setError("خطأ في الاتصال بالخادم");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="px-4 space-y-6 pb-20">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => setView({ type: "main" })} className="p-2 bg-gray-100 rounded-full">
            <ArrowRight size={20} className="text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">تعديل المعلومات الشخصية</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">الاسم الكامل</label>
                <input 
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-brand"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">البريد الإلكتروني</label>
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-brand"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">رقم الهاتف</label>
                <input 
                  type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-brand"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">كلمة المرور الجديدة (اختياري)</label>
                <input 
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="اتركها فارغة إذا لم ترد التغيير"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-brand"
                />
              </div>

          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

          <button 
            disabled={loading}
            onClick={handleUpdate}
            className="w-full bg-brand text-white py-4 rounded-xl font-bold shadow-lg shadow-brand-soft disabled:opacity-50"
          >
            {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>

          <div className="pt-4 border-t border-gray-50">
            <p className="text-[10px] text-gray-400 mb-2">احتفظ ببيانات دخولك في مكان آمن للعودة لحسابك في أي وقت.</p>
            <button 
              onClick={() => {
                const text = `بيانات دخول متجرنا:\nالاسم: ${user?.name}\nالبريد: ${user?.email}\nرقم الدخول: ${user?.id}`;
                const blob = new Blob([text], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `my_account_info.txt`;
                a.click();
              }}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold text-sm"
            >
              تحميل بيانات الحساب (نسخة احتياطية)
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ReferralView = () => {
    const [stats, setStats] = useState({ count: 0 });
    const referralLink = `${window.location.origin}/?ref=${user?.id}`;

    useEffect(() => {
      if (user) {
        fetch(`/api/referrals/stats/${user.id}`)
          .then(res => res.json())
          .then(data => setStats(data))
          .catch(console.error);
      }
    }, [user]);

    const copyLink = () => {
      navigator.clipboard.writeText(referralLink);
      alert("تم نسخ رابط الإحالة");
    };

    return (
      <div className="px-4 space-y-6 pb-20">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => setView({ type: "main" })} className="p-2 bg-gray-100 rounded-full">
            <ArrowRight size={20} className="text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">نظام الإحالة</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 bg-brand-light text-brand rounded-full flex items-center justify-center mx-auto">
            <Plus size={32} />
          </div>
          <h3 className="font-bold text-lg">اربح 5% من كل عملية شراء</h3>
          <p className="text-gray-500 text-sm">شارك رابط الإحالة الخاص بك مع أصدقائك واحصل على عمولة 5% من كل عملية شراء يقومون بها، تضاف مباشرة إلى رصيدك.</p>
          
          <div className="bg-brand-light p-4 rounded-xl">
            <p className="text-xs text-brand font-bold mb-1">عدد المستخدمين المسجلين عبر رابطك</p>
            <p className="text-2xl font-bold text-brand">{stats.count}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-700 text-right">رابط الإحالة الخاص بك</p>
            <div className="flex gap-2">
              <button onClick={copyLink} className="bg-brand text-white px-4 py-2 rounded-xl font-bold text-sm">نسخ</button>
              <input 
                readOnly 
                value={referralLink}
                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm text-left outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ChatView = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [uploading, setUploading] = useState(false);
    const [sending, setSending] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [rating, setRating] = useState(0);
    const [faqs, setFaqs] = useState<any[]>([]);
    const [showFaqs, setShowFaqs] = useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const fetchFaqs = async () => {
      try {
        const res = await fetch("/api/faqs");
        if (!res.ok) return;
        const data = await res.json();
        setFaqs(Array.isArray(data) ? data : []);
      } catch {}
    };

    const fetchMessages = async () => {
      try {
        const guestId = localStorage.getItem("guest_id") || `guest_${Math.random().toString(36).substr(2, 9)}`;
        if (!localStorage.getItem("guest_id")) localStorage.setItem("guest_id", guestId);
        const identifier = user ? user.id : guestId;
        const isGuest = !user;
        const url = isGuest
          ? `/api/chat/messages?guest_id=${identifier}`
          : `/api/chat/messages?user_id=${identifier}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const raw = await res.json();
        const data = Array.isArray(raw) ? raw : [];
        // تحديث مباشر بدون وميض - فقط إذا تغيرت الرسائل
        setMessages(prev => {
          if (prev.length === data.length && prev.every((m, i) => m.id === data[i]?.id)) return prev;
          return data;
        });
        const hasUnread = data.some((m: any) => m.sender_role === 'admin' && !m.is_read);
        if (hasUnread && user) {
          await fetch("/api/chat/mark-read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id })
          }).catch(() => {});
          fetchUser(user.id);
        }
      } catch (e) {
        // تجاهل أخطاء الشبكة بصمت
      }
    };

    useEffect(() => {
      fetchMessages();
      fetchFaqs();
      const interval = setInterval(fetchMessages, 30000);
      return () => clearInterval(interval);
    }, []);

    useEffect(() => {
      // عرض الأسئلة الشائعة تلقائياً عند الدخول لأول مرة إذا لا توجد رسائل
      if (messages.length === 0 && faqs.length > 0) {
        setShowFaqs(true);
      }
    }, [messages, faqs]);

    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [messages]);

    const handleSend = async (content?: string, imageUrl?: string, type: string = 'text', ratingVal?: number) => {
      const guestId = localStorage.getItem("guest_id");
      if (!user && !guestId) return;
      if (!content && !imageUrl && type === 'text') return;
      
      setSending(true);
      try {
        const res = await fetch("/api/chat/send", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` },
          body: JSON.stringify({
            user_id: user ? user.id : null,
            guest_id: user ? null : guestId,
            sender_role: "user",
            content: content || "",
            image_url: imageUrl || "",
            type,
            rating: ratingVal
          })
        });
        if (res.ok) {
          setNewMessage("");
          fetchMessages();
        } else {
          const data = await res.json();
          alert(data.error || "فشل الإرسال");
        }
      } catch (e) {
        alert("خطأ في الاتصال");
      } finally {
        setSending(false);
      }
    };

    const handleFaqClick = async (faq: any) => {
      setShowFaqs(false);
      // إرسال السؤال كرسالة من المستخدم
      await handleSend(faq.trigger_text);
      // إرسال الرد كرسالة من البوت فوراً
      const guestId = localStorage.getItem("guest_id");
      try {
        await fetch("/api/chat/send", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` },
          body: JSON.stringify({
            user_id: user ? user.id : null,
            guest_id: user ? null : guestId,
            sender_role: "admin",
            content: faq.reply_text,
            image_url: "",
            type: "bot_reply"
          })
        });
        fetchMessages();
      } catch {}
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    };

    const confirmAndSendImage = async () => {
      if (!selectedFile) return;
      setUploading(true);
      const formData = new FormData();
      formData.append("image", selectedFile);
      try {
        const imgbbKey = (import.meta as any).env.VITE_IMGBB_API_KEY || "97ffbf56fe1a203445531d664cd4b928";
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          handleSend("", data.data.url);
          setImagePreview(null);
          setSelectedFile(null);
        }
      } catch (err) {
        alert("فشل رفع الصورة");
      } finally {
        setUploading(false);
      }
    };

    return (
      <div className="fixed inset-0 z-[60] bg-gray-50 flex flex-col bottom-16">
        <div className="bg-white p-4 border-b border-gray-100 flex items-center gap-3 shadow-sm">
          <button onClick={() => setView({ type: "main" })} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowRight size={20} className="text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-light text-brand rounded-full flex items-center justify-center font-bold">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">الدعم الفني</h3>
              <p className="text-[10px] text-brand font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse"></span>
                متصل الآن
              </p>
            </div>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-[#F7F7F7]">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div 
                key={m.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${m.sender_role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm relative ${
                  m.sender_role === 'user' ? 'bg-white text-gray-800 rounded-tr-none' : 'bg-[#B00000] text-white rounded-tl-none'
                }`}>
                  {m.type === 'bot_reply' && (
                    <div className="flex items-center gap-1 mb-1 opacity-70">
                      <Bot size={10} />
                      <span className="text-[8px] font-bold">تم الرد بواسطة بوت الدردشة</span>
                    </div>
                  )}
                  {m.image_url && (
                    <img src={m.image_url} alt="Chat" className="rounded-lg mb-2 max-w-full border border-gray-100" referrerPolicy="no-referrer" />
                  )}
                  {m.type === 'rating_request' ? (
                    <div className="text-center py-2">
                      <p className="text-xs font-bold mb-3">{m.content}</p>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button 
                            key={star} 
                            onClick={() => setRating(star)}
                            className={`transition-all ${rating >= star ? 'text-yellow-400 scale-110' : 'text-white/30'}`}
                          >
                            <Star size={24} fill={rating >= star ? "currentColor" : "none"} />
                          </button>
                        ))}
                      </div>
                      <button 
                        disabled={rating === 0}
                        onClick={() => {
                          handleSend(`تم تقييم الدردشة بـ ${rating} نجوم`, "", "rating_response", rating);
                          setRating(0);
                        }}
                        className="w-full py-2 bg-white text-[#B00000] rounded-xl text-xs font-bold active:scale-95 transition-all disabled:opacity-50"
                      >
                        تأكيد التقييم
                      </button>
                    </div>
                  ) : (
                    m.content && <p className="text-sm leading-relaxed font-medium">{m.content}</p>
                  )}
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className={`text-[8px] ${m.sender_role === 'user' ? 'text-gray-400' : 'text-white/70'}`}>
                      {new Date(m.created_at).toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {m.sender_role === 'user' && (
                      <span className="text-[10px] text-brand">✓✓</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0">
          {/* FAQ Panel */}
          {showFaqs && faqs.length > 0 && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
              <div className="p-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/80">
                <h5 className="font-bold text-sm text-gray-700 flex items-center gap-2">
                  <MessageSquare size={14} className="text-brand" />
                  الأسئلة الشائعة
                </h5>
                <button onClick={() => setShowFaqs(false)} className="text-gray-400 p-1"><X size={16} /></button>
              </div>
              <div className="p-3 space-y-2 max-h-56 overflow-y-auto">
                {faqs.map((faq: any) => (
                  <button
                    key={faq.id}
                    onClick={() => handleFaqClick(faq)}
                    className="w-full text-right p-3 bg-gray-50 hover:bg-brand-light rounded-xl text-sm font-bold text-gray-700 hover:text-brand transition-colors"
                  >
                    {faq.trigger_text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {imagePreview && (
            <div className="fixed inset-0 z-[70] bg-black/80 flex flex-col items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-4 w-full max-w-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800">معاينة الصورة</h3>
                  <button onClick={() => { setImagePreview(null); setSelectedFile(null); }} className="p-1 hover:bg-gray-100 rounded-full">
                    <X size={20} />
                  </button>
                </div>
                <img src={imagePreview} alt="Preview" className="w-full h-64 object-contain rounded-xl mb-4 bg-gray-50" />
                <button 
                  onClick={confirmAndSendImage}
                  disabled={uploading}
                  className="w-full py-3 bg-brand text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send size={18} className="rotate-180" />
                      إرسال الصورة
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          {faqs.length > 0 && (
            <button
              onClick={() => setShowFaqs(!showFaqs)}
              className={`p-3 rounded-xl transition-colors ${showFaqs ? 'bg-brand text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
              title="الأسئلة الشائعة"
            >
              <Paperclip size={20} />
            </button>
          )}
          <label className="p-3 bg-gray-50 text-gray-400 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <ImageIcon size={20} />
            <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} disabled={uploading} />
          </label>
          <input 
            type="text" 
            placeholder="اكتب رسالتك هنا..." 
            className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#B00000] transition-all"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend(newMessage)}
          />
          <button 
            onClick={() => handleSend(newMessage)}
            disabled={sending || uploading}
            className={`p-3 ${theme.button} text-white rounded-xl shadow-lg shadow-brand-soft disabled:opacity-50 active:scale-95 transition-all`}
          >
            <ArrowLeft size={20} />
          </button>
        </div>
      </div>
    );
  };

  const AdminChatView = () => {
    const [chatList, setChatList] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [reply, setReply] = useState("");
    const [uploading, setUploading] = useState(false);
    const [showQuickReplies, setShowQuickReplies] = useState(false);
    const [autoReplies, setAutoReplies] = useState<any[]>([]);
    const [isFaqChecked, setIsFaqChecked] = useState(false);
    const triggerRef = React.useRef<HTMLInputElement>(null);
    const replyRef = React.useRef<HTMLTextAreaElement>(null);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const fetchChatList = async () => {
      const res = await fetch("/api/admin/chat/list", { headers: { "x-admin-token": localStorage.getItem("adminToken") || "" } });
      const data = await res.json();
      setChatList(Array.isArray(data) ? data : []);
    };

    const fetchAutoReplies = async () => {
      const res = await fetch("/api/admin/auto-replies", { headers: { "x-admin-token": localStorage.getItem("adminToken") || "" } });
      const data = await res.json();
      setAutoReplies(Array.isArray(data) ? data : []);
    };

    const fetchMessages = async (userId: any, isGuest: boolean = false) => {
      const res = await fetch(`/api/chat/messages/${userId}${isGuest ? '?guest=true' : ''}`);
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
      await fetch("/api/admin/chat/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [isGuest ? 'guestId' : 'userId']: userId })
      });
      fetchChatList();
    };

    useEffect(() => {
      fetchChatList();
      fetchAutoReplies();
      if (selectedChatUser) fetchMessages(selectedChatUser.id, selectedChatUser.is_guest);
      const interval = setInterval(() => {
        fetchChatList();
        if (selectedChatUser) fetchMessages(selectedChatUser.id, selectedChatUser.is_guest);
      }, 3000);
      return () => clearInterval(interval);
    }, [selectedChatUser]);

    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [messages]);

    const handleSendReply = async (content?: string, imageUrl?: string, type: string = 'text') => {
      if (!selectedChatUser || (!content && !imageUrl && type === 'text')) return;
      try {
        const res = await fetch("/api/chat/send", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` },
          body: JSON.stringify({
            user_id: selectedChatUser.is_guest ? null : selectedChatUser.id,
            guest_id: selectedChatUser.is_guest ? selectedChatUser.id : null,
            sender_role: "admin",
            content: content || "",
            image_url: imageUrl || "",
            type
          })
        });
        if (res.ok) {
          setReply("");
          setShowQuickReplies(false);
          fetchMessages(selectedChatUser.id, selectedChatUser.is_guest);
        }
      } catch (e) {
        alert("فشل الإرسال");
      }
    };

    const handleToggleBlock = async (userId: number, currentBlocked: boolean) => {
      if (!confirm(`هل تريد ${currentBlocked ? 'إلغاء حظر' : 'حظر'} هذا المستخدم من الدردشة؟`)) return;
      const res = await fetch("/api/admin/chat/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, blocked: !currentBlocked })
      });
      if (res.ok) {
        if (selectedChatUser?.id === userId) {
          setSelectedChatUser({ ...selectedChatUser, chat_blocked: !currentBlocked });
        }
        fetchChatList();
      }
    };

    const handleAddAutoReply = async () => {
      const trigger = triggerRef.current?.value?.trim() || "";
      const replyText = replyRef.current?.value?.trim() || "";
      if (!trigger || !replyText) return alert("يرجى إدخال النص والرد");
      const res = await fetch("/api/admin/auto-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trigger_text: trigger, reply_text: replyText, is_faq: isFaqChecked })
      });
      if (res.ok) {
        if (triggerRef.current) triggerRef.current.value = "";
        if (replyRef.current) replyRef.current.value = "";
        setIsFaqChecked(false);
        fetchAutoReplies();
        // إرسال الرد فوراً للمستخدم الحالي إن وجد
        if (selectedChatUser) handleSendReply(replyText);
        alert("✅ تم حفظ الرد التلقائي وإرساله");
      } else {
        alert("❌ فشل الحفظ");
      }
    };

    const handleDeleteAutoReply = async (id: number) => {
      if (!confirm("هل تريد حذف هذا الرد التلقائي؟")) return;
      const res = await fetch(`/api/admin/auto-replies/${id}`, { method: "DELETE" });
      if (res.ok) fetchAutoReplies();
    };

    if (selectedChatUser) {
      return (
        <div className="fixed inset-0 z-[60] bg-gray-50 flex flex-col bottom-16">
          <div className="bg-white p-4 border-b border-gray-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedChatUser(null)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                <ArrowRight size={18} />
              </button>
              <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                {selectedChatUser.avatar_url ? (
                  <img src={selectedChatUser.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={20} /></div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-gray-800">{selectedChatUser.name}</h4>
                  {selectedChatUser.is_vip && (
                    <span className="vip-badge scale-75 origin-right">
                      <Crown size={8} />
                      VIP
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 font-bold">ID: #{selectedChatUser.id}</p>
              </div>
            </div>
            {!selectedChatUser.is_guest && (
              <button 
                onClick={() => handleToggleBlock(selectedChatUser.id, selectedChatUser.chat_blocked)}
                className={`p-2 rounded-xl transition-all active:scale-90 ${selectedChatUser.chat_blocked ? 'bg-brand-light text-brand' : 'bg-red-50 text-red-600'}`}
                title={selectedChatUser.chat_blocked ? "إلغاء الحظر" : "حظر المستخدم"}
              >
                <Lock size={18} />
              </button>
            )}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-[#F7F7F7]">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div 
                  key={m.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${m.sender_role === 'admin' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm relative ${
                    m.sender_role === 'admin' ? 'bg-[#B00000] text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'
                  }`}>
                    {m.image_url && <img src={m.image_url} alt="" className="rounded-lg mb-2 max-w-full border border-gray-100" referrerPolicy="no-referrer" />}
                    {m.content && <p className="text-sm font-medium leading-relaxed">{m.content}</p>}
                    <p className={`text-[8px] mt-1 ${m.sender_role === 'admin' ? 'text-white/70' : 'text-gray-400'}`}>
                      {new Date(m.created_at).toLocaleString("ar-EG", { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-2 sticky bottom-0">
            <button 
              onClick={() => setShowQuickReplies(!showQuickReplies)}
              className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Paperclip size={20} />
            </button>
            <label className="p-3 bg-gray-50 text-gray-400 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <ImageIcon size={20} />
              <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                const formData = new FormData();
                formData.append("image", file);
                const imgbbKey = (import.meta as any).env.VITE_IMGBB_API_KEY || "97ffbf56fe1a203445531d664cd4b928";
                const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, { method: "POST", body: formData });
                const data = await res.json();
                if (data.success) handleSendReply("", data.data.url);
                setUploading(false);
              }} />
            </label>
            <input 
              type="text" 
              placeholder="اكتب ردك..." 
              className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#B00000] transition-all"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendReply(reply)}
            />
            <button onClick={() => handleSendReply(reply)} className="p-3 bg-[#B00000] text-white rounded-xl shadow-lg shadow-red-100 active:scale-95 transition-all">
              <Send size={20} className="rotate-180" />
            </button>

            {showQuickReplies && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                  <h5 className="font-bold text-sm text-gray-700">الردود التلقائية والخيارات</h5>
                  <button onClick={() => setShowQuickReplies(false)} className="text-gray-400"><X size={18} /></button>
                </div>
                <div className="max-h-64 overflow-y-auto p-4 space-y-3">
                  <button 
                    onClick={() => handleSendReply("قيم تجربتك مع الدعم", "", "rating_request")}
                    className="w-full p-3 bg-brand-light text-brand rounded-xl text-sm font-bold hover:bg-brand-soft transition-colors flex items-center justify-center gap-2"
                  >
                    <Star size={16} />
                    إرسال طلب تقييم الدردشة
                  </button>
                  
                  <div className="pt-2 border-t border-gray-50">
                    <p className="text-[10px] text-gray-400 font-bold mb-2 uppercase tracking-wider">الردود المضافة</p>
                    {Array.isArray(autoReplies) && autoReplies.map(ar => (
                      <div key={ar.id} className="flex items-center gap-2 mb-2">
                        <button 
                          onClick={() => handleSendReply(ar.reply_text)}
                          className="flex-1 text-right p-3 bg-gray-50 rounded-xl text-xs hover:bg-gray-100 transition-colors"
                        >
                          <span className="font-bold text-brand block text-[10px] mb-1">إذا أرسل: {ar.trigger_text}</span>
                          {ar.reply_text}
                        </button>
                        <button onClick={() => handleDeleteAutoReply(ar.id)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-50 space-y-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">إضافة رد تلقائي جديد</p>
                    <input 
                      ref={triggerRef}
                      type="text" 
                      placeholder="النص الذي يرسله المستخدم..." 
                      className="w-full p-3 bg-gray-50 rounded-xl text-xs border-none outline-none focus:ring-1 focus:ring-brand"
                      defaultValue=""
                    />
                    <textarea 
                      ref={replyRef}
                      placeholder="رد البوت التلقائي..." 
                      className="w-full p-3 bg-gray-50 rounded-xl text-xs border-none outline-none focus:ring-1 focus:ring-brand h-20 resize-none"
                      defaultValue=""
                    />
                    <div className="flex items-center gap-2 px-1">
                      <input 
                        type="checkbox" 
                        id="is_faq_chk"
                        checked={isFaqChecked}
                        onChange={e => setIsFaqChecked(e.target.checked)}
                        className="w-4 h-4 rounded accent-brand"
                      />
                      <label htmlFor="is_faq_chk" className="text-xs font-bold text-gray-600">إضافته كسؤال شائع (FAQ) يظهر للمستخدمين</label>
                    </div>
                    <button 
                      onClick={handleAddAutoReply}
                      className="w-full p-3 bg-gray-800 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
                    >
                      💾 حفظ وإرسال
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="font-bold text-gray-800 text-lg">محادثات الدعم</h3>
        <div className="grid grid-cols-1 gap-3">
          {chatList.map((chat) => (
            <button 
              key={chat.id} 
              onClick={() => setSelectedChatUser(chat)}
              className={`p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 text-right transition-all active:scale-[0.98] ${chat.is_guest ? 'bg-red-50 border-red-100' : 'bg-white'}`}
            >
              <div className="w-12 h-12 bg-gray-50 rounded-full overflow-hidden relative border border-gray-100">
                {chat.avatar_url ? (
                  <img src={chat.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={24} /></div>
                )}
                {chat.unread_count > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {chat.unread_count}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2 truncate">
                    <h4 className="font-bold text-gray-800 text-sm truncate">{chat.name}</h4>
                    {chat.is_vip && (
                      <span className="vip-badge scale-75 origin-right">
                        <Crown size={8} />
                        VIP
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {chat.last_message_at ? new Date(chat.last_message_at).toLocaleDateString("ar-EG") : ""}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400 truncate flex-1">{chat.last_message || "بدأ محادثة جديدة"}</p>
                  <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">ID: #{chat.id}</span>
                </div>
              </div>
            </button>
          ))}
          {chatList.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold">لا توجد محادثات نشطة حالياً</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const PrivacyPolicyView = () => {
    const [policy, setPolicy] = useState("");

    useEffect(() => {
      fetch("/api/settings")
        .then(res => res.json())
        .then(data => {
          const p = data.find((s: any) => s.key === 'privacy_policy');
          setPolicy(p ? p.value : "سيتم إضافة سياسة الخصوصية قريباً.");
        })
        .catch(console.error);
    }, []);

    return (
      <div className="px-4 space-y-6 pb-20">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => setView({ type: "main" })} className="p-2 bg-gray-100 rounded-full">
            <ArrowRight size={20} className="text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">سياسة الخصوصية</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
            {policy}
          </div>
        </div>
      </div>
    );
  };

  const SettingsView = () => (
    <div className="px-4 space-y-6 pb-20">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => setView({ type: "main" })} className="p-2 bg-gray-100 rounded-full">
          <ArrowRight size={20} className="text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">الإعدادات</h2>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-gray-400" />
            <span className="font-medium text-gray-700">الإشعارات</span>
          </div>
          <button 
            onClick={() => alert("تم تفعيل الإشعارات بنجاح!")}
            className="w-10 h-5 bg-brand rounded-full relative"
          >
            <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
          </button>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ImageIcon size={20} className="text-gray-400" />
            <span className="font-medium text-gray-700">الوضع الليلي</span>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-10 h-5 rounded-full relative transition-colors ${isDarkMode ? 'bg-brand' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isDarkMode ? 'right-1' : 'left-1'}`}></div>
          </button>
        </div>
      </div>
    </div>
  );

  const SuccessView = () => (
    <div className="px-6 flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
      <div className="w-24 h-24 bg-brand-light text-brand rounded-full flex items-center justify-center shadow-inner">
        <CheckCircle size={64} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">عملية ناجحة</h2>
        <p className="text-gray-400">{view.data}</p>
      </div>
      <button 
        onClick={() => { setView({ type: "main" }); setActiveTab("home"); }}
        className="bg-brand text-white px-8 py-3 rounded-xl font-bold"
      >
        العودة للرئيسية
      </button>
    </div>
  );

  // --- Admin Panel Helper Components (must be proper components, not IIFEs, to support useState) ---

  const AdminNotifModal = ({ onClose, handleSendNotification }: { onClose: () => void, handleSendNotification: (userId: number | null, title: string, body: string) => Promise<void> }) => {
    const [target, setTarget] = useState<"all"|"one">("all");
    const [uid, setUid] = useState("");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [sending, setSending] = useState(false);
    return (
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[60] bg-black/50 flex items-end" onClick={onClose}>
        <motion.div initial={{y:80}} animate={{y:0}} exit={{y:80}} className="bg-white w-full rounded-t-3xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center gap-2"><Bell size={18}/>إرسال إشعار</h3>
            <button onClick={onClose} className="text-gray-400"><X size={20}/></button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setTarget("all")} className={`flex-1 py-2 rounded-xl text-xs font-bold ${target==="all"?"bg-[#B00000] text-white":"bg-gray-100 text-gray-600"}`}>للجميع</button>
            <button onClick={() => setTarget("one")} className={`flex-1 py-2 rounded-xl text-xs font-bold ${target==="one"?"bg-[#B00000] text-white":"bg-gray-100 text-gray-600"}`}>لمستخدم معين</button>
          </div>
          {target==="one" && <input type="text" placeholder="ID المستخدم" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={uid} onChange={e => setUid(e.target.value)}/>}
          <input type="text" placeholder="عنوان الإشعار" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={title} onChange={e => setTitle(e.target.value)}/>
          <textarea placeholder="نص الإشعار" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none h-20 resize-none" value={body} onChange={e => setBody(e.target.value)}/>
          <button disabled={sending||!title||!body} onClick={async () => { setSending(true); await handleSendNotification(target==="one"&&uid?parseInt(uid):null, title, body); setSending(false); onClose(); }}
            className="w-full bg-[#B00000] text-white py-3.5 rounded-2xl font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2">
            <Send size={16}/>{sending?"جاري الإرسال...":"إرسال الإشعار"}
          </button>
        </motion.div>
      </motion.div>
    );
  };

  const AdminAhminixTab = ({ categories, subcategories, subSubCategories, fetchCategories, fetchSubcategories, fetchSubSubCategories }: any) => {
    const [ahminixProfile, setAhminixProfile] = useState<any>(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [ahminixProducts, setAhminixProducts] = useState<any[]>([]);
    const [productsFetched, setProductsFetched] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [targetSubcategoryId, setTargetSubcategoryId] = useState("");
    const [targetSubSubCategoryId, setTargetSubSubCategoryId] = useState("");
    const [markupPercent, setMarkupPercent] = useState(0);
    const [globalImageUrl, setGlobalImageUrl] = useState("");
    const [syncLoading, setSyncLoading] = useState(false);
    const [syncResult, setSyncResult] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [localSubcats, setLocalSubcats] = useState<any[]>([]);
    const [localSubSubs, setLocalSubSubs] = useState<any[]>([]);
    const [refreshLoading, setRefreshLoading] = useState(false);
    const [refreshResult, setRefreshResult] = useState<any>(null);
    const [checkOrderId, setCheckOrderId] = useState("");
    const [checkLoading, setCheckLoading] = useState(false);
    const [checkResult, setCheckResult] = useState<any>(null);

    useEffect(() => {
      fetch("/api/subcategories").then(r=>r.json()).then(setLocalSubcats).catch(()=>{});
      fetch("/api/sub-sub-categories").then(r=>r.json()).then(setLocalSubSubs).catch(()=>{});
    }, []);

    const loadProfile = async () => { setLoadingProfile(true); try { const res = await fetch("/api/admin/ahminix/profile", { headers: { "x-admin-token": localStorage.getItem("adminToken") || "" } }); setAhminixProfile(await res.json()); } catch(e:any) { setAhminixProfile({error:e.message}); } setLoadingProfile(false); };
    const loadProducts = async () => { setLoadingProducts(true); setProductsFetched(false); setSelectedProducts([]); setSyncResult(null); try { const res = await fetch("/api/admin/ahminix/products", { headers: { "x-admin-token": localStorage.getItem("adminToken") || "" } }); const data = await res.json(); setAhminixProducts(data.products || (Array.isArray(data)?data:[])); setProductsFetched(true); } catch { setAhminixProducts([]); setProductsFetched(true); } setLoadingProducts(false); };
    const handleRefreshOrders = async () => { setRefreshLoading(true); setRefreshResult(null); try { const res = await fetch("/api/admin/ahminix/refresh-orders",{method:"POST"}); setRefreshResult(await res.json()); } catch(e:any){setRefreshResult({error:e.message});} setRefreshLoading(false); };
    const handleCheckOrder = async () => { if (!checkOrderId.trim()) return; setCheckLoading(true); setCheckResult(null); try { const isUuid = checkOrderId.includes("-"); const res = await fetch(`/api/admin/ahminix/check-order/${encodeURIComponent(checkOrderId)}${isUuid?"?uuid=1":""}`); setCheckResult(await res.json()); } catch(e:any){setCheckResult({error:e.message});} setCheckLoading(false); };
    const toggleProduct = (id: number) => setSelectedProducts(prev => prev.includes(id)?prev.filter(p=>p!==id):[...prev,id]);

    const filteredProducts = ahminixProducts.filter(p => (!searchQuery||p.name?.toLowerCase().includes(searchQuery.toLowerCase())) && (!categoryFilter||p.category_name===categoryFilter));
    const uniqueCategories = [...new Set(ahminixProducts.map((p:any) => p.category_name).filter(Boolean))];

    return (
      <div className="space-y-6 pb-8">
        <div className="bg-gradient-to-r from-[#B00000] to-[#8B0000] p-6 rounded-2xl text-white">
          <div className="flex items-center gap-3 mb-2"><ExternalLink size={24}/><h2 className="text-xl font-bold">إدارة API الخارجي</h2></div>
          <p className="text-white/80 text-sm">استيراد المنتجات وإدارة الحساب الخارجي</p>
        </div>

        {/* رصيد الحساب */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center gap-2"><Wallet size={18} className="text-[#B00000]"/>حساب API الخارجي</h3>
            <button onClick={loadProfile} disabled={loadingProfile} className="bg-[#B00000] text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50 flex items-center gap-1"><RefreshCw size={12} className={loadingProfile?"animate-spin":""}/>{loadingProfile?"جاري...":"تحديث"}</button>
          </div>
          {ahminixProfile ? (
            ahminixProfile.error ? <p className="text-red-500 text-sm">{ahminixProfile.error}</p> : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl text-center"><p className="text-[10px] text-gray-400 mb-1">البريد الإلكتروني</p><p className="font-bold text-gray-800 text-sm">{ahminixProfile.email||"—"}</p></div>
                <div className="bg-green-50 p-4 rounded-xl text-center"><p className="text-[10px] text-gray-400 mb-1">الرصيد</p><p className="font-bold text-green-700 text-lg">{parseFloat(ahminixProfile.balance||0).toFixed(3)} $</p></div>
              </div>
            )
          ) : <p className="text-gray-400 text-sm text-center py-4">اضغط "تحديث" لعرض معلومات الحساب</p>}
        </div>

        {/* تحديث الطلبات */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><RefreshCw size={18} className="text-[#B00000]"/>تحديث حالة الطلبات</h3>
          <p className="text-xs text-gray-500">يفحص الطلبات بحالة "processing" ويحدّثها تلقائياً</p>
          <button onClick={handleRefreshOrders} disabled={refreshLoading} className="w-full bg-[#B00000] text-white py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"><RefreshCw size={16} className={refreshLoading?"animate-spin":""}/>{refreshLoading?"جاري التحديث...":"تحديث الطلبات"}</button>
          {refreshResult && <div className={`p-4 rounded-xl text-sm font-medium ${refreshResult.error?'bg-red-50 text-red-700':'bg-green-50 text-green-700'}`}>{refreshResult.error?`خطأ: ${refreshResult.error}`:`تم تحديث ${refreshResult.updated} طلب`}</div>}
        </div>

        {/* فحص طلب */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><Search size={18} className="text-[#B00000]"/>فحص طلب</h3>
          <div className="flex gap-2">
            <input type="text" placeholder="ID الطلب أو UUID" value={checkOrderId} onChange={e => setCheckOrderId(e.target.value)} className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none border border-gray-100"/>
            <button onClick={handleCheckOrder} disabled={checkLoading} className="bg-[#B00000] text-white px-4 py-3 rounded-xl font-bold text-sm disabled:opacity-50">{checkLoading?"...":"فحص"}</button>
          </div>
          {checkResult && (
            <div className="bg-gray-50 p-4 rounded-xl">
              {checkResult.error ? <p className="text-red-500 text-sm">{checkResult.error}</p> : checkResult.data?.[0] ? (
                <div className="space-y-2 text-sm">
                  {[["رقم الطلب",checkResult.data[0].order_id],["المنتج",checkResult.data[0].product_name],["الحالة",checkResult.data[0].status],["السعر",`${checkResult.data[0].price} $`]].map(([l,v]) => (
                    <div key={String(l)} className="flex justify-between"><span className="text-gray-500">{l}:</span><span className={`font-bold ${String(l)==="الحالة"?(v==="accept"?"text-green-600":v==="reject"?"text-red-600":"text-amber-600"):"text-gray-800"}`}>{String(v)}</span></div>
                  ))}
                </div>
              ) : <p className="text-gray-500 text-sm text-center">لم يتم العثور على الطلب</p>}
            </div>
          )}
        </div>

        {/* استيراد المنتجات */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center gap-2"><Download size={18} className="text-[#B00000]"/>استيراد المنتجات</h3>
            <button onClick={loadProducts} disabled={loadingProducts} className="bg-[#B00000] text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50 flex items-center gap-1"><RefreshCw size={12} className={loadingProducts?"animate-spin":""}/>{loadingProducts?"جاري الجلب...":"جلب المنتجات"}</button>
          </div>

          {/* التصنيف */}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">القسم الفرعي <span className="text-red-400">*</span></label>
              <select value={targetSubcategoryId} onChange={e => { setTargetSubcategoryId(e.target.value); setTargetSubSubCategoryId(""); }} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#B00000]">
                <option value="">-- اختر القسم الفرعي --</option>
                {localSubcats.map((s:any) => <option key={s.id} value={s.id}>{s.name} (#{s.id})</option>)}
              </select>
            </div>
            {targetSubcategoryId && localSubSubs.filter((ss:any) => String(ss.subcategory_id)===String(targetSubcategoryId)).length > 0 && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">فرع فرعي <span className="text-gray-300">(اختياري)</span></label>
                <select value={targetSubSubCategoryId} onChange={e => setTargetSubSubCategoryId(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none">
                  <option value="">-- بدون فرع فرعي --</option>
                  {localSubSubs.filter((ss:any) => String(ss.subcategory_id)===String(targetSubcategoryId)).map((ss:any) => <option key={ss.id} value={ss.id}>{ss.name} (#{ss.id})</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">نسبة الربح %</label>
              <input type="number" min={0} max={500} value={markupPercent} onChange={e => setMarkupPercent(parseFloat(e.target.value)||0)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none" placeholder="0 = بدون هامش"/>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">صورة موحدة لكل المنتجات <span className="text-gray-300">(اختياري)</span></label>
              <div className="flex gap-2">
                <input type="text" value={globalImageUrl} onChange={e => setGlobalImageUrl(e.target.value)} className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none" placeholder="https://... رابط الصورة"/>
                <label className="bg-gray-100 text-gray-600 px-3 py-3 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 whitespace-nowrap hover:bg-gray-200 transition-colors">
                  <Upload size={14}/>
                  رفع
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const formData = new FormData();
                      formData.append("image", file);
                      const imgbbKey = (import.meta as any).env.VITE_IMGBB_API_KEY || "97ffbf56fe1a203445531d664cd4b928";
                      const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, { method: "POST", body: formData });
                      const data = await res.json();
                      if (data.success) setGlobalImageUrl(data.data.url);
                      else alert("فشل رفع الصورة");
                    } catch { alert("خطأ في رفع الصورة"); }
                  }}/>
                </label>
              </div>
              {globalImageUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={globalImageUrl} className="w-12 h-12 object-cover rounded-lg border border-gray-100" referrerPolicy="no-referrer"/>
                  <button onClick={() => setGlobalImageUrl("")} className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-lg">حذف</button>
                </div>
              )}
            </div>
          </div>

          {/* قائمة المنتجات */}
          {loadingProducts && (
            <div className="flex items-center justify-center py-8 gap-3">
              <RefreshCw size={20} className="animate-spin text-[#B00000]"/>
              <span className="text-sm text-gray-500">جاري جلب المنتجات...</span>
            </div>
          )}

          {!loadingProducts && ahminixProducts.length > 0 && (
            <div className="space-y-3 border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-600">المنتجات ({ahminixProducts.length})</p>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedProducts(filteredProducts.map((p:any)=>p.id))} className="text-xs text-brand font-bold">تحديد الكل</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={() => setSelectedProducts([])} className="text-xs text-gray-400 font-bold">إلغاء الكل</button>
                </div>
              </div>

              {/* بحث وفلتر */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input type="text" placeholder="بحث في المنتجات..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl pr-8 pl-3 py-2 text-xs outline-none"/>
                </div>
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-gray-50 border border-gray-100 rounded-xl px-2 py-2 text-xs outline-none max-w-[100px]">
                  <option value="">الكل</option>
                  {uniqueCategories.map((c:any) => <option key={String(c)} value={String(c)}>{String(c)}</option>)}
                </select>
              </div>

              {selectedProducts.length > 0 && (
                <div className="bg-brand-light text-brand text-xs font-bold px-3 py-2 rounded-xl">
                  تم تحديد {selectedProducts.length} منتج
                </div>
              )}

              {/* قائمة المنتجات */}
              <div className="space-y-2 max-h-72 overflow-y-auto rounded-xl border border-gray-100">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-xs">لا توجد منتجات مطابقة</div>
                ) : filteredProducts.map((p:any) => (
                  <div key={p.id} onClick={() => toggleProduct(p.id)}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-all ${selectedProducts.includes(p.id)?'bg-red-50 border-r-2 border-[#B00000]':'bg-white hover:bg-gray-50'}`}>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${selectedProducts.includes(p.id)?'border-[#B00000] bg-[#B00000]':'border-gray-300'}`}>
                      {selectedProducts.includes(p.id) && <CheckCircle size={12} className="text-white"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400">{p.category_name}</span>
                        <span className="text-[10px] font-bold text-[#B00000]">{p.price} $</span>
                        {p.id && <span className="text-[9px] text-gray-300">#{p.id}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loadingProducts && productsFetched && ahminixProducts.length === 0 && (
            <div className="text-center py-6 bg-red-50 rounded-xl border border-red-100">
              <Download size={32} className="mx-auto mb-2 text-red-300"/>
              <p className="text-xs text-red-600 font-bold">لم يتم العثور على منتجات</p>
              <p className="text-[10px] text-red-400 mt-1">تحقق من إعدادات API أو حاول مرة أخرى</p>
            </div>
          )}

          {!loadingProducts && !productsFetched && ahminixProducts.length === 0 && (
            <div className="text-center py-6 bg-gray-50 rounded-xl">
              <Download size={32} className="mx-auto mb-2 text-gray-300"/>
              <p className="text-xs text-gray-400">اضغط "جلب المنتجات" لعرض المنتجات المتاحة</p>
            </div>
          )}

          <button
            onClick={async () => {
              if (!targetSubcategoryId) return alert("اختر القسم الفرعي أولاً");
              setSyncLoading(true); setSyncResult(null);
              try {
                const res = await fetch("/api/admin/ahminix/sync", { method:"POST", headers:{"Content-Type":"application/json"},
                  body: JSON.stringify({ subcategoryId:parseInt(targetSubcategoryId), subSubCategoryId:targetSubSubCategoryId?parseInt(targetSubSubCategoryId):undefined, productIds:selectedProducts.length?selectedProducts:undefined, markupPercent, globalImageUrl: globalImageUrl || undefined })
                });
                setSyncResult(await res.json());
              } catch(e:any){setSyncResult({error:e.message});}
              setSyncLoading(false);
            }}
            disabled={syncLoading||!targetSubcategoryId}
            className="w-full bg-[#B00000] text-white py-3.5 rounded-xl font-bold disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Download size={16} className={syncLoading?"animate-bounce":""}/>
            {syncLoading?"جاري الاستيراد...":selectedProducts.length?`استيراد ${selectedProducts.length} منتج`:"استيراد كل المنتجات"}
          </button>

          {syncResult && (
            <div className={`p-4 rounded-xl text-sm ${syncResult.error?'bg-red-50 text-red-700':'bg-green-50 text-green-700'}`}>
              {syncResult.error ? `خطأ: ${syncResult.error}` : (
                <div className="space-y-1">
                  <p className="font-bold">اكتمل الاستيراد</p>
                  <p>مضاف: {syncResult.summary?.added} · محدّث: {syncResult.summary?.updated} · تجاوز: {syncResult.summary?.skipped}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

const OrderPollingStatus = ({ externalOrderId, onStatusChange }: { externalOrderId: string; onStatusChange: (status: string, replayApi: any[]) => void }) => {
  const [polling, setPolling] = React.useState(false);
  const [pollCount, setPollCount] = React.useState(0);
  React.useEffect(() => {
    if (!externalOrderId) return;
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 20;
    const interval = setInterval(async () => {
      if (cancelled || attempts >= maxAttempts) { clearInterval(interval); return; }
      attempts++;
      setPollCount(attempts);
      setPolling(true);
      try {
        const res = await fetch(`/api/admin/ahminix/check-order/${encodeURIComponent(externalOrderId)}`);
        const data = await res.json();
        if (data?.data?.[0]) {
          const ext = data.data[0];
          if (ext.status === 'accept' || ext.status === 'reject') {
            clearInterval(interval);
            onStatusChange(ext.status, ext.replay_api || []);
          }
        }
      } catch {}
      setPolling(false);
    }, 8000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [externalOrderId]);
  return (
    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-1">
      <div className="flex items-center gap-2">
        {polling ? <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"/> : <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"/>}
        <p className="text-xs font-bold text-amber-700">جاري متابعة حالة الطلب تلقائياً...</p>
      </div>
      <p className="text-[10px] text-amber-500">محاولة {pollCount} من 20 · يتحقق كل 8 ثوانٍ</p>
      <p className="text-[10px] text-amber-400">سيتم تحديث الحالة فور الرد من المورد</p>
    </div>
  );
};

const AdminUserCard = ({ u, fetchAdminUsers, handleToggleVip, handleBlockUser, handleDeleteUser, handleSendNotification }: any) => {
  const [showNotif, setShowNotif] = React.useState(false);
  const [nt, setNt] = React.useState("");
  const [nb, setNb] = React.useState("");
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border-2 border-white shadow">
          {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" referrerPolicy="no-referrer"/> : <User size={20} className="text-gray-400"/>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-sm text-gray-800 truncate">{u.name}</p>
            {u.is_vip && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold shrink-0">VIP</span>}
            {u.is_banned && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold shrink-0">محظور</span>}
          </div>
          <p className="text-[10px] text-gray-400 truncate">#{u.id} · {u.email}</p>
          <p className="text-[10px] text-brand font-bold">{u.balance?.toFixed(2)} $ · ID: #{u.id}</p>
        </div>
      </div>
      <div className="border-t border-gray-50 px-3 py-2.5 flex items-center gap-2 flex-wrap">
        <button onClick={async () => {
          const nb2 = prompt("الرصيد الجديد:", u.balance?.toString());
          if (nb2 !== null && !isNaN(parseFloat(nb2))) {
            const res = await fetch(`/api/admin/users/${u.id}/balance`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({balance: parseFloat(nb2)}) });
            if (res.ok) fetchAdminUsers();
          }
        }} className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-[11px] font-bold active:scale-95">
          <Wallet size={12}/> الرصيد
        </button>
        <button onClick={() => handleToggleVip(u.id, u.is_vip)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold active:scale-95 ${u.is_vip ? "bg-gray-100 text-gray-600" : "bg-amber-50 text-amber-700"}`}>
          <Crown size={12}/> {u.is_vip ? "إلغاء VIP" : "VIP"}
        </button>
        <button onClick={() => setShowNotif(!showNotif)}
          className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-[11px] font-bold active:scale-95">
          <Bell size={12}/> إشعار
        </button>
        <button onClick={() => handleBlockUser(u.id)}
          className="flex items-center gap-1 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg text-[11px] font-bold active:scale-95">
          <Lock size={12}/> حظر
        </button>
        <button onClick={() => handleDeleteUser(u.id)}
          className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-[11px] font-bold active:scale-95">
          <Trash2 size={12}/> حذف
        </button>
      </div>
      {showNotif && (
        <div className="border-t border-blue-50 bg-blue-50/40 px-4 py-3 space-y-2">
          <p className="text-[11px] font-bold text-blue-700">إرسال إشعار لـ {u.name}</p>
          <input type="text" placeholder="عنوان الإشعار" value={nt} onChange={e => setNt(e.target.value)} className="w-full p-2.5 bg-white rounded-xl text-xs outline-none border border-blue-100"/>
          <input type="text" placeholder="نص الإشعار" value={nb} onChange={e => setNb(e.target.value)} className="w-full p-2.5 bg-white rounded-xl text-xs outline-none border border-blue-100"/>
          <button onClick={async () => { if (!nt || !nb) return; await handleSendNotification(u.id, nt, nb); setNt(""); setNb(""); setShowNotif(false); }}
            className="w-full bg-blue-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1">
            <Send size={12}/> إرسال
          </button>
        </div>
      )}
    </div>
  );
};

const AdminHomeTab = ({adminUsers, adminOrders, adminTransactions, setAdminTab, fetchUser, fetchAdminUsers, handleToggleVip, handleBlockUser, handleDeleteUser, handleSendNotification}: any) => {
  const [userSearch, setUserSearch] = React.useState("");
  const filtered = adminUsers.filter(u =>
  !userSearch || u.name?.includes(userSearch) || u.email?.includes(userSearch) || String(u.id).includes(userSearch)
  );
  return (

  <div className="space-y-4">
    {/* إحصائيات سريعة */}
    <div className="grid grid-cols-3 gap-2">
      {[
        { label: "المستخدمين", val: adminUsers.length, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "الطلبات", val: adminOrders.length, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "الدفعات", val: adminTransactions.length, color: "text-green-600", bg: "bg-green-50" },
      ].map(s => (
        <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center border border-white`}>
          <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
          <p className="text-[10px] text-gray-500 font-bold mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>

    {/* قائمة المستخدمين */}
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input type="text" placeholder="بحث بالاسم أو ID أو رقم شخصي..." value={userSearch} onChange={e => setUserSearch(e.target.value)}
          className="w-full bg-white border border-gray-100 rounded-xl pr-9 pl-3 py-2.5 text-xs outline-none shadow-sm"/>
      </div>
      <span className="bg-purple-50 text-purple-600 px-3 py-2 rounded-xl text-xs font-bold shrink-0">{filtered.length}</span>
    </div>

    <div className="space-y-3">
      {filtered.length === 0 && (
        <div className="text-center py-10">
          <User size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-gray-400 text-sm font-medium">لا يوجد مستخدمين</p>
          <button onClick={fetchAdminUsers} className="mt-3 text-xs text-brand font-bold">تحديث القائمة</button>
        </div>
      )}
      {filtered.map(u => (
        <AdminUserCard key={u.id} u={u}
          fetchAdminUsers={fetchAdminUsers}
          handleToggleVip={handleToggleVip}
          handleBlockUser={handleBlockUser}
          handleDeleteUser={handleDeleteUser}
          handleSendNotification={handleSendNotification}
        />
      ))}
    </div>
  </div>

  );
};

const AdminOrdersTab = ({adminOrders, orderSearch, setOrderSearch, orderDateFilter, setOrderDateFilter, fetchAdminOrders}: any) => {
  const [orderMode, setOrderMode] = React.useState<string>("manual");
  const [modeLoading, setModeLoading] = React.useState(false);
  const [modeLoaded, setModeLoaded] = React.useState(false);
  React.useEffect(() => {
  fetch("/api/settings").then(r => r.json()).then((data: any[]) => {
  const s = data.find((x: any) => x.key === "order_processing_mode");
  setOrderMode(s?.value || "manual");
  setModeLoaded(true);
  }).catch(() => setModeLoaded(true));
  }, []);
  const toggleMode = async (newMode: string) => {
  setModeLoading(true);
  await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "order_processing_mode", value: newMode }) });
  setOrderMode(newMode);
  setModeLoading(false);
  };
  const handleOrderAction = async (orderId: number, action: "approved" | "rejected", adminResp?: string) => {
  await fetch(`/api/admin/orders/${orderId}/status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: action, admin_response: adminResp || "" }) });
  fetchAdminOrders();
  };
  const pendingAdminOrders = adminOrders.filter(o => o.status === 'pending_admin');
  const filteredOrders = adminOrders.filter(o => !orderSearch || o.product_name?.includes(orderSearch) || String(o.id).includes(orderSearch) || o.user_name?.includes(orderSearch));
  return (

  <div className="space-y-4">
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><Zap size={16} className="text-[#B00000]"/>وضع المعالجة</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">{orderMode === 'auto' ? "تلقائي - يُرسل للـ API فوراً" : "يدوي - ينتظر موافقتك"}</p>
        </div>
        {modeLoaded && (
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            <button onClick={() => toggleMode("auto")} disabled={modeLoading} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${orderMode === 'auto' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500'}`}>تلقائي</button>
            <button onClick={() => toggleMode("manual")} disabled={modeLoading} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${orderMode === 'manual' ? 'bg-[#B00000] text-white shadow-sm' : 'text-gray-500'}`}>يدوي</button>
          </div>
        )}
      </div>
    </div>
    {pendingAdminOrders.length > 0 && (
      <div className="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center"><span className="text-white text-xs font-bold">{pendingAdminOrders.length}</span></div>
          <h3 className="font-bold text-amber-700">طلبات تنتظر موافقتك</h3>
        </div>
        {pendingAdminOrders.map(order => {
          let metaParsed: any = {};
          try { metaParsed = JSON.parse(order.meta || "{}"); } catch {}
          return (
            <div key={order.id} className="border border-amber-100 rounded-xl bg-amber-50/40 p-4 space-y-3">
              <div>
                <p className="font-bold text-sm text-[#B00000]">#{order.id} - {order.product_name}</p>
                <p className="text-xs text-gray-500">{order.user_name} · {(order.total_price || 0).toFixed(2)} $</p>
                {metaParsed.player_id && <p className="text-xs text-gray-600">ID: {metaParsed.player_id}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleOrderAction(order.id, "approved")} className="flex-1 bg-green-500 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"><CheckCircle size={12}/>قبول</button>
                <button onClick={() => { const r = prompt("سبب الرفض:"); handleOrderAction(order.id, "rejected", r || ""); }} className="flex-1 bg-red-100 text-red-600 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"><XCircle size={12}/>رفض</button>
              </div>
            </div>
          );
        })}
      </div>
    )}
    <div className="relative">
      <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/>
      <input type="text" placeholder="بحث في الطلبات..." value={orderSearch} onChange={e => setOrderSearch(e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl pr-9 pl-3 py-2.5 text-xs outline-none shadow-sm"/>
    </div>
    <div className="space-y-3">
      {filteredOrders.map(order => (
        <div key={order.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-sm text-gray-800">#{order.id} - {order.product_name}</p>
              <p className="text-xs text-gray-500">{order.user_name} · {new Date(order.created_at).toLocaleDateString("ar-EG")}</p>
              <p className="text-xs font-bold text-[#B00000]">{(order.total_price || 0).toFixed(2)} $</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${order.status==='completed'?'bg-green-100 text-green-700':order.status==='rejected'?'bg-red-100 text-red-600':order.status==='processing'?'bg-blue-100 text-blue-700':'bg-amber-100 text-amber-700'}`}>
              {order.status==='completed'?'مكتمل':order.status==='rejected'?'مرفوض':order.status==='processing'?'معالجة':'انتظار'}
            </span>
          </div>
        </div>
      ))}
      {filteredOrders.length === 0 && <div className="text-center py-12 text-gray-400"><ShoppingBag size={40} className="mx-auto mb-3 opacity-20"/><p>لا توجد طلبات</p></div>}
    </div>
  </div>

  );
};

const AdminTransactionsTab = ({adminTransactions, transSearch, setTransSearch, handleApproveTransaction, handleRejectTransaction}: any) => {
  const filteredTrans = adminTransactions.filter(t => !transSearch || t.user_name?.includes(transSearch) || String(t.id).includes(transSearch));
  return (

  <div className="space-y-4">
    <div className="relative">
      <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/>
      <input type="text" placeholder="بحث في الدفعات..." value={transSearch} onChange={e => setTransSearch(e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl pr-9 pl-3 py-2.5 text-xs outline-none shadow-sm"/>
    </div>
    <div className="space-y-3">
      {filteredTrans.map(t => (
        <div key={t.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-sm text-gray-800">{t.user_name}</p>
              <p className="text-[10px] text-gray-400">#{t.id ? `TX${t.id}` : '—'}</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${t.status==='approved'?'bg-green-100 text-green-700':t.status==='rejected'?'bg-red-100 text-red-600':'bg-amber-100 text-amber-700'}`}>
              {t.status==='approved'?'مقبول':t.status==='rejected'?'مرفوض':'منتظر'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 p-2.5 rounded-xl">
              <p className="text-[9px] text-gray-400 font-bold mb-0.5">رقم العملية</p>
              <p className="text-xs font-black text-gray-700">#{t.id ? `TX${t.id}` : '—'}</p>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-xl">
              <p className="text-[9px] text-gray-400 font-bold mb-0.5">المبلغ</p>
              <p className="text-xs font-black text-green-600">{(t.amount || 0).toFixed(2)} $</p>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-xl">
              <p className="text-[9px] text-gray-400 font-bold mb-0.5">تاريخ الطلب</p>
              <p className="text-[10px] font-bold text-gray-700">{new Date(t.created_at).toLocaleDateString("ar-EG", {year:'numeric',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'})}</p>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-xl">
              <p className="text-[9px] text-gray-400 font-bold mb-0.5">طريقة الشحن</p>
              <p className="text-[10px] font-bold text-gray-700 truncate">{t.payment_method_name || '—'}</p>
            </div>
          </div>
          {t.receipt_image_url && (
            <div>
              <p className="text-[9px] text-gray-400 font-bold mb-1">صورة الإيصال</p>
              <img src={t.receipt_image_url} className="w-full h-40 object-cover rounded-xl cursor-pointer" referrerPolicy="no-referrer" onClick={() => window.open(t.receipt_image_url, '_blank')}/>
            </div>
          )}
          {t.status === 'pending' && (
            <div className="flex gap-2">
              <button onClick={() => handleApproveTransaction(t.id)} className="flex-1 bg-green-500 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1"><CheckCircle size={13}/>قبول</button>
              <button onClick={() => handleRejectTransaction(t.id)} className="flex-1 bg-red-100 text-red-600 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1"><XCircle size={13}/>رفض</button>
            </div>
          )}
        </div>
      ))}
      {filteredTrans.length === 0 && <div className="text-center py-12 text-gray-400"><Wallet size={40} className="mx-auto mb-3 opacity-20"/><p>لا توجد دفعات</p></div>}
    </div>
  </div>

  );
};

const AdminElementsTab = ({categories, subcategories, subSubCategories, fetchCategories, fetchSubcategories, fetchSubSubCategories, paymentMethods, fetchPaymentMethods, banners, fetchBanners, offers, fetchOffers, handleDelete}: any) => {
  const [editingItem, setEditingItem] = React.useState<any>(null);
  const [editingType, setEditingType] = React.useState<string>("");
  const [elementsSubTab, setElementsSubTab] = React.useState<string>("");
  const [elementsType, setElementsType] = React.useState<string>("");
  const [allElements, setAllElements] = React.useState<any[]>([]);
  const [loadingElements, setLoadingElements] = React.useState(false);
  const [allSubcats, setAllSubcats] = React.useState<any[]>([]);
  const [allSubSubs, setAllSubSubs] = React.useState<any[]>([]);
  React.useEffect(() => {
  fetch("/api/subcategories").then(r=>r.json()).then(setAllSubcats).catch(()=>{});
  fetch("/api/sub-sub-categories").then(r=>r.json()).then(setAllSubSubs).catch(()=>{});
  }, []);
  const loadElements = async (type: string) => {
  setLoadingElements(true); setAllElements([]);
  const map: Record<string,string> = { categories:"/api/categories", subcategories:"/api/subcategories", subSubCategories:"/api/sub-sub-categories", products:"/api/admin/products-all", paymentMethods:"/api/payment-methods", banners:"/api/banners", offers:"/api/offers", vouchers:"/api/admin/vouchers" };
  try { const res = await fetch(map[type]); const data = await res.json(); setAllElements(Array.isArray(data)?data:[]); } catch { setAllElements([]); }
  setLoadingElements(false);
  };
  const handleSaveEdit = async () => {
  if (!editingItem || !editingType) return;
  const epMap: Record<string,string> = { categories:"categories", subcategories:"subcategories", subSubCategories:"sub-sub-categories", products:"products", paymentMethods:"payment-methods", banners:"banners", offers:"offers", vouchers:"vouchers" };
  try {
  const res = await fetch(`/api/admin/${epMap[editingType]}/${editingItem.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(editingItem) });
  if (res.ok) { alert("تم التعديل"); setEditingItem(null); setEditingType(""); loadElements(elementsType); fetchCategories(); fetchSubcategories(); fetchSubSubCategories(); fetchPaymentMethods(); fetchBanners(); fetchOffers(); }
  else { const d = await res.json(); alert("فشل: "+(d.error||"")); }
  } catch { alert("خطأ في الاتصال"); }
  };
  const delMap: Record<string,string> = { categories:"categories", subcategories:"subcategories", subSubCategories:"sub-sub-categories", products:"products", paymentMethods:"payment-methods", banners:"banners", offers:"offers", vouchers:"vouchers" };
  const tabs4 = [
  { id:"store", label:"عناصر المتجر", icon:<LayoutGrid size={20}/>, color:"bg-blue-50 text-blue-600", border:"border-blue-200" },
  { id:"banners_offers", label:"البانر والعروض", icon:<ImageIcon size={20}/>, color:"bg-orange-50 text-orange-600", border:"border-orange-200" },
  { id:"vouchers", label:"القسائم", icon:<Ticket size={20}/>, color:"bg-green-50 text-green-600", border:"border-green-200" },
  { id:"payments_tab", label:"طرق الدفع", icon:<Wallet size={20}/>, color:"bg-purple-50 text-purple-600", border:"border-purple-200" },
  ];
  return (

  <div className="space-y-4">
    {!elementsSubTab && (
      <div className="grid grid-cols-2 gap-3">
        {tabs4.map(tab => (
          <button key={tab.id} onClick={() => {
            setElementsSubTab(tab.id);
            const ft = tab.id==="store"?"categories":tab.id==="banners_offers"?"banners":tab.id==="vouchers"?"vouchers":"paymentMethods";
            setElementsType(ft); loadElements(ft);
          }} className={`bg-white p-5 rounded-2xl border-2 ${tab.border} shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-all`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tab.color}`}>{tab.icon}</div>
            <span className="font-bold text-gray-800 text-sm text-center">{tab.label}</span>
          </button>
        ))}
      </div>
    )}
    {elementsSubTab && (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => { setElementsSubTab(""); setAllElements([]); }} className="p-2 bg-gray-100 rounded-xl"><ArrowRight size={18} className="text-gray-600"/></button>
          <h3 className="font-bold text-gray-800">{tabs4.find(t=>t.id===elementsSubTab)?.label}</h3>
        </div>
        {elementsSubTab === "store" && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[{val:"categories",label:"الأقسام"},{val:"subcategories",label:"الفرعية"},{val:"subSubCategories",label:"الفرع الفرعي"},{val:"products",label:"المنتجات"}].map(opt => (
              <button key={opt.val} onClick={() => { setElementsType(opt.val); loadElements(opt.val); }}
                className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all ${elementsType===opt.val?'bg-[#B00000] text-white':'bg-white border border-gray-100 text-gray-600'}`}>{opt.label}</button>
            ))}
          </div>
        )}
        {elementsSubTab === "banners_offers" && (
          <div className="flex gap-2">
            {[{val:"banners",label:"البانرات"},{val:"offers",label:"العروض"}].map(opt => (
              <button key={opt.val} onClick={() => { setElementsType(opt.val); loadElements(opt.val); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${elementsType===opt.val?'bg-orange-500 text-white':'bg-white border border-gray-100 text-gray-600'}`}>{opt.label}</button>
            ))}
          </div>
        )}
        {loadingElements && <div className="text-center py-10 text-gray-400 text-sm">جاري التحميل...</div>}
        {!loadingElements && allElements.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">لا توجد عناصر</div>}
        {!loadingElements && allElements.map((item: any) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              {item.image_url && <img src={item.image_url} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" referrerPolicy="no-referrer"/>}
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-700 truncate">{item.name||item.title||item.code||`#${item.id}`}</p>
                {item.price !== undefined && <p className="text-[10px] text-brand">{item.store_type==='quantities'?`${item.price_per_unit}$/وحدة`:`${Number(item.price).toFixed(2)} $`}</p>}
                {item.amount !== undefined && !item.price && <p className="text-[10px] text-brand">{item.amount} $</p>}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => { setEditingItem({...item}); setEditingType(elementsType); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Pencil size={14}/></button>
              <button onClick={async () => { await handleDelete(delMap[elementsType]||elementsType, item.id); loadElements(elementsType); }} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 size={14}/></button>
            </div>
          </div>
        ))}
      </div>
    )}
    <AnimatePresence>
      {editingItem && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onClick={() => setEditingItem(null)}>
          <motion.div initial={{scale:0.92,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.92,opacity:0}} className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800">تعديل العنصر</h3>
              <button onClick={() => setEditingItem(null)} className="p-2 bg-gray-100 rounded-full"><X size={18}/></button>
            </div>
            {editingType === "categories" && <div className="space-y-3"><input type="text" placeholder="اسم القسم" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.name||""} onChange={e => setEditingItem({...editingItem,name:e.target.value})} autoFocus/><AdminImageUpload label="صورة القسم" currentUrl={editingItem.image_url||""} onUpload={url => setEditingItem({...editingItem,image_url:url})}/><input type="text" placeholder="الرقم الخاص" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.special_id||""} onChange={e => setEditingItem({...editingItem,special_id:e.target.value})}/></div>}
            {editingType === "subcategories" && <div className="space-y-3"><select className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.category_id||""} onChange={e => setEditingItem({...editingItem,category_id:e.target.value})}><option value="">-- القسم الرئيسي --</option>{categories.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><input type="text" placeholder="اسم القسم الفرعي" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.name||""} onChange={e => setEditingItem({...editingItem,name:e.target.value})} autoFocus/><AdminImageUpload label="الصورة" currentUrl={editingItem.image_url||""} onUpload={url => setEditingItem({...editingItem,image_url:url})}/><input type="text" placeholder="الرقم الخاص" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.special_id||""} onChange={e => setEditingItem({...editingItem,special_id:e.target.value})}/></div>}
            {editingType === "subSubCategories" && <div className="space-y-3"><select className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.subcategory_id||""} onChange={e => setEditingItem({...editingItem,subcategory_id:e.target.value})}><option value="">-- القسم الفرعي --</option>{allSubcats.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}</select><input type="text" placeholder="اسم الفرع الفرعي" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.name||""} onChange={e => setEditingItem({...editingItem,name:e.target.value})} autoFocus/><AdminImageUpload label="الصورة" currentUrl={editingItem.image_url||""} onUpload={url => setEditingItem({...editingItem,image_url:url})}/><input type="text" placeholder="الرقم الخاص" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.special_id||""} onChange={e => setEditingItem({...editingItem,special_id:e.target.value})}/></div>}
            {editingType === "products" && (
              <div className="space-y-3">
                <select className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.subcategory_id||""} onChange={e => setEditingItem({...editingItem,subcategory_id:e.target.value,sub_sub_category_id:null})}><option value="">-- القسم الفرعي --</option>{allSubcats.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                {allSubSubs.filter((ss:any) => String(ss.subcategory_id)===String(editingItem.subcategory_id)).length > 0 && (
                  <select className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.sub_sub_category_id||""} onChange={e => setEditingItem({...editingItem,sub_sub_category_id:e.target.value||null})}><option value="">-- فرع فرعي (اختياري) --</option>{allSubSubs.filter((ss:any) => String(ss.subcategory_id)===String(editingItem.subcategory_id)).map((ss:any) => <option key={ss.id} value={ss.id}>{ss.name}</option>)}</select>
                )}
                <input type="text" placeholder="اسم المنتج" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.name||""} onChange={e => setEditingItem({...editingItem,name:e.target.value})} autoFocus/>
                <textarea placeholder="الوصف" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none h-20 resize-none" value={editingItem.description||""} onChange={e => setEditingItem({...editingItem,description:e.target.value})}/>
                <AdminImageUpload label="صورة المنتج" currentUrl={editingItem.image_url||""} onUpload={url => setEditingItem({...editingItem,image_url:url})}/>
                <select className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.store_type||"normal"} onChange={e => setEditingItem({...editingItem,store_type:e.target.value})}><option value="normal">متجر عادي</option><option value="quick_order">طلب سريع</option><option value="quantities">متجر الكميات</option><option value="numbers">متجر الأرقام</option><option value="external_api">شحن فوري (API خارجي)</option></select>
                {(editingItem.store_type==='quantities'||editingItem.store_type==='external_api') ? (
                  <div className="space-y-2 p-3 bg-gray-50 rounded-xl"><input type="number" placeholder="أقل كمية" className="w-full p-2 bg-white rounded-lg text-sm outline-none" value={editingItem.min_quantity||""} onChange={e => setEditingItem({...editingItem,min_quantity:e.target.value})}/><input type="number" step="0.000001" placeholder="سعر الوحدة" className="w-full p-2 bg-white rounded-lg text-sm outline-none" value={editingItem.price_per_unit||""} onChange={e => setEditingItem({...editingItem,price_per_unit:e.target.value})}/>{editingItem.store_type==='external_api' && <input type="text" placeholder="معرف المنتج الخارجي" className="w-full p-2 bg-white rounded-lg text-sm outline-none border border-blue-100" value={editingItem.external_id||""} onChange={e => setEditingItem({...editingItem,external_id:e.target.value})}/>}</div>
                ) : <input type="number" step="0.01" placeholder="السعر $" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.price||""} onChange={e => setEditingItem({...editingItem,price:e.target.value})}/>}
                <div className="flex items-center gap-2"><input type="checkbox" checked={!!editingItem.requires_input} onChange={e => setEditingItem({...editingItem,requires_input:e.target.checked})} className="w-4 h-4 rounded"/><label className="text-xs font-bold text-gray-600">يتطلب بيانات إضافية</label></div>
              </div>
            )}
            {editingType === "paymentMethods" && <div className="space-y-3"><input type="text" placeholder="اسم طريقة الدفع" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.name||""} onChange={e => setEditingItem({...editingItem,name:e.target.value})}/><AdminImageUpload label="صورة الطريقة" currentUrl={editingItem.image_url||""} onUpload={url => setEditingItem({...editingItem,image_url:url})}/><input type="text" placeholder="رقم المحفظة" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.wallet_address||""} onChange={e => setEditingItem({...editingItem,wallet_address:e.target.value})}/><input type="number" placeholder="أقل مبلغ $" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.min_amount||""} onChange={e => setEditingItem({...editingItem,min_amount:e.target.value})}/></div>}
            {editingType === "banners" && <div className="space-y-3"><AdminImageUpload label="صورة البانر" currentUrl={editingItem.image_url||""} onUpload={url => setEditingItem({...editingItem,image_url:url})}/></div>}
            {editingType === "offers" && <div className="space-y-3"><input type="text" placeholder="عنوان العرض" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.title||""} onChange={e => setEditingItem({...editingItem,title:e.target.value})} autoFocus/><textarea placeholder="وصف العرض" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none h-20 resize-none" value={editingItem.description||""} onChange={e => setEditingItem({...editingItem,description:e.target.value})}/><AdminImageUpload label="صورة العرض" currentUrl={editingItem.image_url||""} onUpload={url => setEditingItem({...editingItem,image_url:url})}/></div>}
            {editingType === "vouchers" && <div className="space-y-3"><input type="text" placeholder="الكود" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.code||""} onChange={e => setEditingItem({...editingItem,code:e.target.value})}/><input type="number" placeholder="القيمة $" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.amount||""} onChange={e => setEditingItem({...editingItem,amount:e.target.value})}/><input type="number" placeholder="أقصى استخدامات" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.max_uses||""} onChange={e => setEditingItem({...editingItem,max_uses:e.target.value})}/></div>}
            <button onClick={handleSaveEdit} className="w-full bg-[#B00000] text-white py-3.5 rounded-2xl font-bold text-sm mt-2">حفظ التعديلات</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>

  );
};


  // --- Admin Panel ---
const AdminPanel = ({
  user,
  fetchUser,
  categories,
  subcategories,
  subSubCategories,
  fetchCategories,
  fetchSubcategories,
  fetchSubSubCategories,
  paymentMethods,
  fetchPaymentMethods,
  banners,
  fetchBanners,
  offers,
  fetchOffers,
  setIsAdmin,
  theme,
  adminTab,
  setAdminTab
}: AdminPanelProps) => {
  const [adminOrders, setAdminOrders] = useState<any[]>([]);
    const [adminTransactions, setAdminTransactions] = useState<any[]>([]);
    const [orderSearch, setOrderSearch] = useState("");
    const [orderDateFilter, setOrderDateFilter] = useState("");
    const [transSearch, setTransSearch] = useState("");
    const [transDateFilter, setTransDateFilter] = useState("");
    const [newCategory, setNewCategory] = useState({ name: "", image_url: "", special_id: "" });
    const [newSubcategory, setNewSubcategory] = useState({ category_special_id: "", name: "", image_url: "", special_id: "" });
    const [newSubSubCategory, setNewSubSubCategory] = useState({ subcategory_special_id: "", name: "", image_url: "", special_id: "" });
    const [newProduct, setNewProduct] = useState({ 
      category_special_id: "", 
      subcategory_special_id: "", 
      sub_sub_category_special_id: "",
      name: "", 
      price: "", 
      description: "", 
      image_url: "", 
      requires_input: false, 
      store_type: "normal",
      min_quantity: "",
      price_per_unit: "",
      external_id: ""
    });
    const [newPaymentMethod, setNewPaymentMethod] = useState({ name: "", image_url: "", wallet_address: "", min_amount: "", instructions: "", method_type: "manual", api_account: "" });
    const [newBanner, setNewBanner] = useState({ image_url: "" });
    const [manualTopup, setManualTopup] = useState({ userId: "", amount: "" });
    const [settings, setSettings] = useState<any[]>([]);
    const [privacyPolicy, setPrivacyPolicy] = useState("");
    const [supportWhatsapp, setSupportWhatsapp] = useState("");

    const [adminUsers, setAdminUsers] = useState<any[]>([]);
    const [adminVouchers, setAdminVouchers] = useState<any[]>([]);
    const [adminProducts, setAdminProducts] = useState<any[]>([]);
    const [selectedSubId, setSelectedSubId] = useState("");
    const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

    const fetchAdminProducts = async (subId: string) => {
      if (!subId) return;
      const res = await fetch(`/api/products?subId=${subId}`);
      const data = await res.json();
      setAdminProducts(data);
    };

    const handleUpdateProductPrice = async (id: number, currentPrice: number, storeType?: string) => {
      const label = storeType === 'quantities' ? "السعر لكل وحدة" : "السعر الجديد";
      const newPrice = prompt(`أدخل ${label}:`, currentPrice.toString());
      if (newPrice !== null) {
        const field = storeType === 'quantities' ? 'price_per_unit' : 'price';
        const res = await fetch(`/api/admin/products/${id}/price`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [field]: parseFloat(newPrice) })
        });
        if (res.ok) {
          alert("تم التحديث بنجاح");
          fetchAdminProducts(selectedSubId);
        }
      }
    };
    const [newVoucher, setNewVoucher] = useState({ code: "", amount: "", max_uses: "1" });
    const [newOffer, setNewOffer] = useState({ title: "", description: "", image_url: "" });

    const handleExportDB = async () => {
      try {
        const res = await fetch("/api/admin/export-db", { headers: { "x-admin-token": localStorage.getItem("adminToken") || "" } });
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `database_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
      } catch (e) {
        alert("فشل تصدير البيانات");
      }
    };

    const handleImportDB = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      if (!confirm("تحذير: سيتم مسح كافة البيانات الحالية واستبدالها بالبيانات المستوردة. هل أنت متأكد؟")) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          const res = await fetch("/api/admin/import-db", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
          });
          if (res.ok) {
            alert("تم استيراد البيانات بنجاح! سيتم إعادة تحميل الصفحة.");
            window.location.reload();
          } else {
            const err = await res.json();
            alert(`فشل الاستيراد: ${err.error}`);
          }
        } catch (err) {
          alert("ملف غير صالح");
        }
      };
      reader.readAsText(file);
    };

    const handleClearDB = async () => {
      if (!confirm("هل أنت متأكد من مسح كافة بيانات الموقع؟ لا يمكن التراجع عن هذه الخطوة.")) return;
      const res = await fetch("/api/admin/clear-db", { method: "POST" });
      if (res.ok) {
        alert("تم مسح قاعدة البيانات بنجاح");
        window.location.reload();
      }
    };

    useEffect(() => {
      fetchAdminOrders();
      fetchAdminTransactions();
      fetchAdminUsers();
      fetchAdminSettings();
      fetchAdminVouchers();
    }, []);

    const fetchAdminVouchers = async () => {
      const res = await fetch("/api/admin/vouchers", { headers: { "x-admin-token": localStorage.getItem("adminToken") || "" } });
      const data = await res.json();
      setAdminVouchers(data);
    };

    const handleCreateVoucher = async () => {
      const res = await fetch("/api/admin/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVoucher)
      });
      if (res.ok) {
        setNewVoucher({ code: "", amount: "", max_uses: "1" });
        fetchAdminVouchers();
        alert("تم إنشاء الكود بنجاح");
      } else {
        const data = await res.json();
        alert(data.error || "فشل إنشاء الكود");
      }
    };

    const handleDeleteVoucher = async (id: number) => {
      if (!confirm("هل أنت متأكد من حذف هذا الكود؟")) return;
      const res = await fetch(`/api/admin/vouchers/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAdminVouchers();
        alert("تم حذف الكود");
      }
    };

    const fetchAdminSettings = async () => {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings(data);
      const pp = data.find((s: any) => s.key === 'privacy_policy');
      const sw = data.find((s: any) => s.key === 'support_whatsapp');
      if (pp) setPrivacyPolicy(pp.value);
      if (sw) setSupportWhatsapp(sw.value);
    };

    const handleUpdateSetting = async (key: string, value: string) => {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value })
      });
      if (res.ok) {
        alert("تم تحديث الإعداد بنجاح");
        fetchAdminSettings();
      }
    };

    const handleCloudSync = async () => {
      if (!confirm("هل تريد مزامنة كافة البيانات الحالية مع قاعدة البيانات السحابية (Supabase)؟")) return;
      try {
        const res = await fetch("/api/admin/sync-to-cloud", { method: "POST" });
        const data = await res.json();
        if (res.ok) {
          let msg = "تمت المزامنة السحابية بنجاح!\n\nالتفاصيل:\n";
          for (const [table, status] of Object.entries(data.details || {})) {
            msg += `${table}: ${status}\n`;
          }
          alert(msg);
        } else {
          alert(`فشل المزامنة: ${data.error}`);
        }
      } catch (e) {
        alert("خطأ في الاتصال بالسيرفر");
      }
    };

    const fetchAdminUsers = async () => {
      const res = await fetch("/api/admin/users", { headers: { "x-admin-token": localStorage.getItem("adminToken") || "" } });
      const data = await res.json();
      setAdminUsers(Array.isArray(data) ? data : []);
    };

    const handleToggleVip = async (userId: number, currentStatus: boolean) => {
      const res = await fetch(`/api/admin/users/${userId}/vip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVip: !currentStatus })
      });
      if (res.ok) {
        fetchAdminUsers();
        alert("تم تحديث حالة VIP");
      }
    };

    const handleDeleteUser = async (userId: number) => {
      if (!confirm("هل أنت متأكد من حذف هذا المستخدم نهائياً؟ لا يمكن التراجع!")) return;
      try {
        const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok) {
          alert("✅ تم حذف المستخدم بنجاح");
          fetchAdminUsers();
        } else {
          alert("❌ " + (data.error || "فشل الحذف"));
        }
      } catch (e) { alert("خطأ في الاتصال"); }
    };

    const handleBlockUser = async (userId: number) => {
      const mins = prompt("أدخل مدة الحظر بالدقائق (مثال: 60 = ساعة):");
      if (!mins || isNaN(parseInt(mins))) return;
      try {
        const res = await fetch(`/api/admin/users/${userId}/block`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ minutes: parseInt(mins) })
        });
        const data = await res.json();
        if (res.ok) {
          alert(`✅ تم حظر المستخدم لمدة ${mins} دقيقة`);
          fetchAdminUsers();
        } else {
          alert("❌ " + (data.error || "فشل الحظر"));
        }
      } catch (e) { alert("خطأ في الاتصال"); }
    };

    const handleSendNotification = async (userId: number | null, title: string, body: string) => {
      try {
        const res = await fetch("/api/admin/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-token": localStorage.getItem("adminToken") || "" },
          body: JSON.stringify({ userId, title, body })
        });
        const data = await res.json();
        if (res.ok) {
          alert(userId ? "✅ تم إرسال الإشعار للمستخدم" : `✅ تم الإرسال لـ ${data.sent || "الكل"} مستخدم`);
        } else {
          alert("❌ " + (data.error || "فشل الإرسال"));
        }
      } catch (e) { alert("خطأ في الاتصال"); }
    };

    const handleAddOffer = async () => {
      const res = await fetch("/api/admin/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOffer)
      });
      if (res.ok) {
        setNewOffer({ title: "", description: "", image_url: "" });
        fetchOffers();
        alert("تمت إضافة العرض");
      }
    };

    const fetchAdminOrders = async () => {
      try {
        const res = await fetch("/api/admin/orders", { headers: { "x-admin-token": localStorage.getItem("adminToken") || "" } });
        const data = await res.json();
        setAdminOrders(Array.isArray(data) ? data : []);
      } catch (e) { console.error(e); }
    };

    const fetchAdminTransactions = async () => {
      try {
        const res = await fetch("/api/admin/transactions", { headers: { "x-admin-token": localStorage.getItem("adminToken") || "" } });
        const data = await res.json();
        setAdminTransactions(Array.isArray(data) ? data : []);
      } catch (e) { console.error(e); }
    };

    const handleApproveTransaction = async (id: number) => {
      await fetch(`/api/admin/transactions/${id}/approve`, { method: "POST" });
      fetchAdminTransactions();
    };

    const handleRejectTransaction = async (id: number) => {
      await fetch(`/api/admin/transactions/${id}/reject`, { method: "POST" });
      fetchAdminTransactions();
    };

    const handleAddCategory = async () => {
      await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory)
      });
      setNewCategory({ name: "", image_url: "", special_id: "" });
      fetchCategories();
      fetchCategories();
        alert("✅ تمت إضافة القسم الرئيسي بنجاح");
    };

    const handleAddSubcategory = async () => {
      if (!newSubcategory.name) return alert("يرجى إدخال اسم القسم الفرعي");
      if (!newSubcategory.category_special_id) return alert("يرجى إدخال رقم القسم الرئيسي الخاص");
      const res = await fetch("/api/admin/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSubcategory)
      });
      const data = await res.json();
      if (res.ok) {
        setNewSubcategory({ category_special_id: "", name: "", image_url: "", special_id: "" });
        fetchSubcategories();
        fetchCategories();
        alert("✅ تمت إضافة القسم الفرعي بنجاح");
      } else {
        alert("❌ " + (data.error || "خطأ في الإضافة"));
      }
    };

    const handleAddProduct = async () => {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        setNewProduct({ 
          category_special_id: "", 
          subcategory_special_id: "", 
          sub_sub_category_special_id: "",
          name: "", 
          price: "", 
          description: "", 
          image_url: "", 
          requires_input: false, 
          store_type: "normal",
          min_quantity: "",
          price_per_unit: "",
          external_id: ""
        });
        alert("تمت إضافة المنتج");
      } else {
        const data = await res.json();
        alert(data.error || "خطأ في الإضافة");
      }
    };

    const handleAddSubSubCategory = async () => {
      if (!newSubSubCategory.name) return alert("يرجى إدخال اسم القسم الفرعي الفرعي");
      if (!newSubSubCategory.subcategory_special_id) return alert("يرجى إدخال رقم القسم الفرعي الخاص");
      const res = await fetch("/api/admin/sub-sub-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSubSubCategory)
      });
      const data = await res.json();
      if (res.ok) {
        setNewSubSubCategory({ subcategory_special_id: "", name: "", image_url: "", special_id: "" });
        fetchSubSubCategories();
        fetchSubcategories();
        alert("✅ تمت إضافة القسم الفرعي الفرعي بنجاح");
      } else {
        alert("❌ " + (data.error || "خطأ في الإضافة"));
      }
    };

    const handleAddPaymentMethod = async () => {
      const res = await fetch("/api/admin/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPaymentMethod)
      });
      if (res.ok) {
        setNewPaymentMethod({ name: "", image_url: "", wallet_address: "", min_amount: "", instructions: "" });
        fetchPaymentMethods();
        alert("تمت إضافة طريقة الدفع");
      } else {
        const data = await res.json();
        alert(data.error || "خطأ في الإضافة");
      }
    };

    const handleAddBanner = async () => {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBanner)
      });
      if (res.ok) {
        setNewBanner({ image_url: "" });
        fetchBanners();
        alert("تمت إضافة الصورة المتحركة");
      } else {
        alert("خطأ في الإضافة");
      }
    };

    const handleDelete = async (type: string, id: number) => {
      if (!confirm("هل أنت متأكد من الحذف؟")) return;
      const res = await fetch(`/api/admin/${type}/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (res.ok) {
        // تحديث كل القوائم بعد الحذف
        fetchCategories();
        fetchSubcategories();
        fetchSubSubCategories();
        if (type === 'payment-methods') fetchPaymentMethods();
        if (type === 'banners') fetchBanners();
        if (type === 'offers') fetchOffers();
        alert(result.message || "✅ تم الحذف بنجاح");
      } else {
        const errData = result;
        alert("❌ " + (errData.error || "فشل الحذف"));
      }
    };

    const handleManualTopup = async () => {
      const res = await fetch("/api/admin/manual-topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: manualTopup.userId, amount: manualTopup.amount })
      });
      if (res.ok) {
        setManualTopup({ userId: "", amount: "" });
        alert("تم شحن الرصيد بنجاح");
      } else {
        const data = await res.json();
        alert(data.error || "خطأ في الشحن");
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 pb-20 text-right" dir="rtl" data-admin-panel="true">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => { localStorage.removeItem("adminToken"); setIsAdmin(false); setAdminAuth(false); }} className="text-gray-400 p-2"><LogOut size={20} /></button>
          <h1 className="font-bold text-lg">لوحة التحكم</h1>
          {adminTab === "admin_home" && (
            <button
              onClick={() => setActiveSubMenu(activeSubMenu === "admin_settings" ? null : "admin_settings")}
              className={`p-2 rounded-xl transition-all ${activeSubMenu === "admin_settings" ? "bg-gray-800 text-white" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <Settings size={20} />
            </button>
          )}
          {adminTab !== "admin_home" && <div className="w-10" />}
        </div>

        {/* Settings Modal */}
        <AnimatePresence>
          {activeSubMenu === "admin_settings" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-end"
              onClick={() => setActiveSubMenu(null)}
            >
              <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
                className="bg-white w-full rounded-t-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2"><Settings size={18} /> الإعدادات</h3>
                  <button onClick={() => setActiveSubMenu(null)} className="text-gray-400"><X size={22} /></button>
                </div>

                {/* التواصل */}
                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-sm text-gray-700 flex items-center gap-2"><Phone size={15} className="text-blue-500" />التواصل</h4>
                  <div className="flex gap-2">
                    <input type="text" value={supportWhatsapp} onChange={e => setSupportWhatsapp(e.target.value)} placeholder="رقم واتساب الدعم" className="flex-1 p-3 bg-white rounded-xl text-sm outline-none border border-gray-100" />
                    <button onClick={() => handleUpdateSetting('support_whatsapp', supportWhatsapp)} className="bg-blue-600 text-white px-4 rounded-xl text-sm font-bold">حفظ</button>
                  </div>
                </div>

                {/* السياسة */}
                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-sm text-gray-700 flex items-center gap-2"><ShieldCheck size={15} className="text-green-500" />السياسة</h4>
                  <textarea value={privacyPolicy} onChange={e => setPrivacyPolicy(e.target.value)} className="w-full p-3 bg-white rounded-xl text-sm outline-none h-28 resize-none border border-gray-100" placeholder="نص سياسة الخصوصية..." />
                  <button onClick={() => handleUpdateSetting('privacy_policy', privacyPolicy)} className="w-full bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm">حفظ السياسة</button>
                </div>

                {/* البيانات */}
                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-sm text-gray-700 flex items-center gap-2"><Database size={15} className="text-orange-500" />البيانات</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={handleExportDB} className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl text-xs font-bold hover:bg-gray-50">
                      <Download size={14} /> تصدير البيانات
                    </button>
                    <label className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl text-xs font-bold cursor-pointer hover:bg-gray-50">
                      <Upload size={14} /> استيراد البيانات
                      <input type="file" className="hidden" accept=".json" onChange={handleImportDB} />
                    </label>
                  </div>
                  <button onClick={handleClearDB} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl text-xs font-bold hover:bg-red-100 border border-red-100">
                    <Eraser size={14} /> مسح قاعدة البيانات
                  </button>
                  <button onClick={handleCloudSync} className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-3 rounded-xl text-xs font-bold hover:bg-blue-100 border border-blue-100">
                    <RefreshCw size={14} /> مزامنة السحابة
                  </button>
                </div>

                {/* تغيير كلمة السر */}
                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-sm text-gray-700 flex items-center gap-2"><Lock size={15} className="text-red-500" />تغيير كلمة السر</h4>
                  <div className="flex gap-2">
                    <input type="password" placeholder="كلمة المرور الجديدة" className="flex-1 p-3 bg-white rounded-xl text-sm outline-none border border-gray-100" value={newAdminPass} onChange={e => setNewAdminPass(e.target.value)} />
                    <button onClick={handleChangeAdminPassword} className="bg-gray-800 text-white px-4 rounded-xl text-sm font-bold">حفظ</button>
                  </div>
                </div>

                {/* API */}
                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-sm text-gray-700 flex items-center gap-2"><ExternalLink size={15} className="text-purple-500" />API الخارجي</h4>
                  <button onClick={() => { setAdminTab("ahminix"); setActiveSubMenu(null); }} className="w-full bg-purple-50 text-purple-700 py-3 rounded-xl text-sm font-bold border border-purple-100 flex items-center justify-center gap-2">
                    <ExternalLink size={14} /> فتح إدارة API الخارجي
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4 space-y-4">
          {/* ===== ADMIN HOME ===== */}
          {adminTab === "admin_home" && <AdminHomeTab adminUsers={adminUsers} adminOrders={adminOrders} adminTransactions={adminTransactions} setAdminTab={setAdminTab} fetchUser={fetchUser} fetchAdminUsers={fetchAdminUsers} handleToggleVip={handleToggleVip} handleBlockUser={handleBlockUser} handleDeleteUser={handleDeleteUser} handleSendNotification={handleSendNotification} />}

          {adminTab === "chat" && <AdminChatView />}

          {/* ===== ORDERS ===== */}
          {adminTab === "orders" && <AdminOrdersTab adminOrders={adminOrders} orderSearch={orderSearch} setOrderSearch={setOrderSearch} orderDateFilter={orderDateFilter} setOrderDateFilter={setOrderDateFilter} fetchAdminOrders={fetchAdminOrders} />}

          {/* ===== TRANSACTIONS ===== */}
          {adminTab === "transactions" && <AdminTransactionsTab adminTransactions={adminTransactions} transSearch={transSearch} setTransSearch={setTransSearch} handleApproveTransaction={handleApproveTransaction} handleRejectTransaction={handleRejectTransaction} />}

          {/* ===== ELEMENTS ===== */}
          {adminTab === "elements" && <AdminElementsTab categories={categories} subcategories={subcategories} subSubCategories={subSubCategories} fetchCategories={fetchCategories} fetchSubcategories={fetchSubcategories} fetchSubSubCategories={fetchSubSubCategories} paymentMethods={paymentMethods} fetchPaymentMethods={fetchPaymentMethods} banners={banners} fetchBanners={fetchBanners} offers={offers} fetchOffers={fetchOffers} handleDelete={handleDelete} />}

          {/* ===== AHMINIX ===== */}
          {adminTab === "ahminix" && (
            <AdminAhminixTab
              categories={categories}
              subcategories={subcategories}
              subSubCategories={subSubCategories}
              fetchCategories={fetchCategories}
              fetchSubcategories={fetchSubcategories}
              fetchSubSubCategories={fetchSubSubCategories}
            />
          )}

        </div>

        {/* FAB Button */}
        <AnimatePresence>
          {activeSubMenu === "fab_open" && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[55] bg-black/40" onClick={() => setActiveSubMenu(null)}/>
          )}
        </AnimatePresence>
        {activeSubMenu === "fab_open" && (
          <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} exit={{opacity:0,y:30}}
            className="fixed bottom-20 left-4 right-4 z-[56] bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 space-y-1">
            <p className="text-xs font-bold text-gray-400 mb-3 text-center">اختر ما تريد إضافته</p>
            {[
              { key:"add_category", label:"إضافة قسم رئيسي", icon:<LayoutGrid size={16}/>, color:"text-blue-600 bg-blue-50" },
              { key:"add_subcategory", label:"إضافة قسم فرعي", icon:<ChevronDown size={16}/>, color:"text-blue-500 bg-blue-50" },
              { key:"add_subSubCategory", label:"إضافة فرع فرعي", icon:<ChevronRight size={16}/>, color:"text-blue-400 bg-blue-50" },
              { key:"add_product", label:"إضافة منتج", icon:<ShoppingBag size={16}/>, color:"text-indigo-600 bg-indigo-50" },
              { key:"add_banner", label:"إضافة بانر", icon:<ImageIcon size={16}/>, color:"text-pink-600 bg-pink-50" },
              { key:"add_offer", label:"إضافة عرض", icon:<Tag size={16}/>, color:"text-rose-600 bg-rose-50" },
              { key:"add_balance", label:"إضافة رصيد", icon:<Wallet size={16}/>, color:"text-green-600 bg-green-50" },
              { key:"add_voucher", label:"إضافة قسيمة", icon:<Ticket size={16}/>, color:"text-purple-600 bg-purple-50" },
              { key:"add_paymentMethod", label:"إضافة طريقة دفع", icon:<Plus size={16}/>, color:"text-orange-600 bg-orange-50" },
              { key:"add_notification", label:"إرسال إشعار", icon:<Bell size={16}/>, color:"text-red-600 bg-red-50" },
              { key:"ahminix_link", label:"API الخارجي", icon:<ExternalLink size={16}/>, color:"text-gray-600 bg-gray-100" },
            ].map(item => (
              <button key={item.key} onClick={() => { if(item.key==="ahminix_link"){setAdminTab("ahminix");setActiveSubMenu(null);}else setActiveSubMenu(item.key); }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors active:scale-[0.98]">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color}`}>{item.icon}</div>
                <span className="font-bold text-gray-700 text-sm">{item.label}</span>
                <ChevronRight size={16} className="text-gray-300 mr-auto rotate-180"/>
              </button>
            ))}
          </motion.div>
        )}

        {/* Add Modals */}
        <AnimatePresence>
          {activeSubMenu && activeSubMenu.startsWith("add_") && activeSubMenu !== "add_balance" && activeSubMenu !== "add_notification" && activeSubMenu !== "add_product" && activeSubMenu !== "add_banner" && activeSubMenu !== "add_offer" && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[60] bg-black/50 flex items-end justify-center" onClick={() => setActiveSubMenu(null)}>
              <motion.div initial={{y:100,opacity:0}} animate={{y:0,opacity:1}} exit={{y:100,opacity:0}} className="bg-white w-full max-w-lg rounded-t-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800">{activeSubMenu==="add_category"?"إضافة قسم رئيسي":activeSubMenu==="add_subcategory"?"إضافة قسم فرعي":activeSubMenu==="add_subSubCategory"?"إضافة فرع فرعي":activeSubMenu==="add_product"?"إضافة منتج":activeSubMenu==="add_voucher"?"إضافة قسيمة":"إضافة طريقة دفع"}</h3>
                  <button onClick={() => setActiveSubMenu(null)} className="text-gray-400"><X size={22}/></button>
                </div>
                {activeSubMenu === "add_category" && (
                  <div className="space-y-3">
                    <input type="text" placeholder="اسم القسم الرئيسي" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newCategory.name} onChange={e => setNewCategory({...newCategory,name:e.target.value})}/>
                    <AdminImageUpload label="صورة القسم" currentUrl={newCategory.image_url} onUpload={url => setNewCategory({...newCategory,image_url:url})}/>
                    <button onClick={() => { handleAddCategory(); setActiveSubMenu(null); }} className="w-full bg-[#B00000] text-white py-3.5 rounded-2xl font-bold text-sm">إضافة القسم الرئيسي</button>
                  </div>
                )}
                {activeSubMenu === "add_subcategory" && (
                  <div className="space-y-3">
                    <select className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newSubcategory.category_special_id} onChange={e => setNewSubcategory({...newSubcategory,category_special_id:e.target.value})}><option value="">-- اختر القسم الرئيسي --</option>{categories.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                    <input type="text" placeholder="اسم القسم الفرعي" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newSubcategory.name} onChange={e => setNewSubcategory({...newSubcategory,name:e.target.value})}/>
                    <AdminImageUpload label="صورة القسم الفرعي" currentUrl={newSubcategory.image_url} onUpload={url => setNewSubcategory({...newSubcategory,image_url:url})}/>
                    <button onClick={() => { handleAddSubcategory(); setActiveSubMenu(null); }} className="w-full bg-[#B00000] text-white py-3.5 rounded-2xl font-bold text-sm">إضافة القسم الفرعي</button>
                  </div>
                )}
                {activeSubMenu === "add_subSubCategory" && (
                  <div className="space-y-3">
                    <select className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newSubSubCategory.subcategory_special_id} onChange={e => setNewSubSubCategory({...newSubSubCategory,subcategory_special_id:e.target.value})}><option value="">-- اختر القسم الفرعي --</option>{subcategories.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                    <input type="text" placeholder="اسم الفرع الفرعي" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newSubSubCategory.name} onChange={e => setNewSubSubCategory({...newSubSubCategory,name:e.target.value})}/>
                    <AdminImageUpload label="الصورة" currentUrl={newSubSubCategory.image_url} onUpload={url => setNewSubSubCategory({...newSubSubCategory,image_url:url})}/>
                    <button onClick={() => { handleAddSubSubCategory(); setActiveSubMenu(null); }} className="w-full bg-[#B00000] text-white py-3.5 rounded-2xl font-bold text-sm">إضافة الفرع الفرعي</button>
                  </div>
                )}
                {activeSubMenu === "add_voucher" && (
                  <div className="space-y-3">
                    <input type="text" placeholder="الكود" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newVoucher.code} onChange={e => setNewVoucher({...newVoucher,code:e.target.value})}/>
                    <div className="grid grid-cols-2 gap-2"><input type="number" placeholder="القيمة $" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newVoucher.amount} onChange={e => setNewVoucher({...newVoucher,amount:e.target.value})}/><input type="number" placeholder="عدد الاستخدامات" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newVoucher.max_uses} onChange={e => setNewVoucher({...newVoucher,max_uses:e.target.value})}/></div>
                    <button onClick={() => { handleCreateVoucher(); setActiveSubMenu(null); }} className="w-full bg-[#B00000] text-white py-3.5 rounded-2xl font-bold text-sm">إنشاء القسيمة</button>
                  </div>
                )}
                {activeSubMenu === "add_paymentMethod" && (
                  <div className="space-y-3">
                    <input type="text" placeholder="اسم طريقة الدفع" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newPaymentMethod.name} onChange={e => setNewPaymentMethod({...newPaymentMethod,name:e.target.value})}/>
                    <AdminImageUpload label="صورة الطريقة" currentUrl={newPaymentMethod.image_url} onUpload={url => setNewPaymentMethod({...newPaymentMethod,image_url:url})}/>
                    <select className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newPaymentMethod.method_type} onChange={e => setNewPaymentMethod({...newPaymentMethod,method_type:e.target.value,api_account:""})}><option value="manual">يدوي (إيصال)</option><option value="syriatel">سيريتل كاش</option><option value="shamcash">شام كاش</option></select>
                    <input type="text" placeholder="رقم المحفظة / العنوان" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newPaymentMethod.wallet_address} onChange={e => setNewPaymentMethod({...newPaymentMethod,wallet_address:e.target.value})}/>
                    {(newPaymentMethod.method_type==="syriatel"||newPaymentMethod.method_type==="shamcash") && <input type="text" placeholder={newPaymentMethod.method_type==="syriatel"?"رقم GSM (0933xxxxxx)":"عنوان الحساب"} className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none font-mono" value={newPaymentMethod.api_account} onChange={e => setNewPaymentMethod({...newPaymentMethod,api_account:e.target.value})}/>}
                    <input type="number" placeholder="أقل مبلغ $" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newPaymentMethod.min_amount} onChange={e => setNewPaymentMethod({...newPaymentMethod,min_amount:e.target.value})}/>
                    <button onClick={() => { handleAddPaymentMethod(); setActiveSubMenu(null); }} className="w-full bg-[#B00000] text-white py-3.5 rounded-2xl font-bold text-sm">إضافة طريقة الدفع</button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Product Modal */}
        <AnimatePresence>
          {activeSubMenu === "add_product" && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[60] bg-black/50 flex items-end justify-center" onClick={() => setActiveSubMenu(null)}>
              <motion.div initial={{y:100,opacity:0}} animate={{y:0,opacity:1}} exit={{y:100,opacity:0}} className="bg-white w-full max-w-lg rounded-t-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2"><ShoppingBag size={18} className="text-indigo-600"/>إضافة منتج</h3>
                  <button onClick={() => setActiveSubMenu(null)} className="text-gray-400"><X size={22}/></button>
                </div>
                <div className="space-y-3">
                  {/* القسم الفرعي */}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">القسم الفرعي <span className="text-red-400">*</span></label>
                    <select className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newProduct.subcategory_special_id} onChange={e => setNewProduct({...newProduct, subcategory_special_id: e.target.value, sub_sub_category_special_id: ""})}>
                      <option value="">-- القسم الفرعي --</option>
                      {subcategories.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  {/* فرع فرعي */}
                  {newProduct.subcategory_special_id && subSubCategories.filter((ss:any) => String(ss.subcategory_id) === String(newProduct.subcategory_special_id)).length > 0 && (
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">فرع فرعي <span className="text-gray-300">(اختياري)</span></label>
                      <select className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newProduct.sub_sub_category_special_id} onChange={e => setNewProduct({...newProduct, sub_sub_category_special_id: e.target.value})}>
                        <option value="">-- فرع فرعي (اختياري) --</option>
                        {subSubCategories.filter((ss:any) => String(ss.subcategory_id) === String(newProduct.subcategory_special_id)).map((ss:any) => <option key={ss.id} value={ss.id}>{ss.name}</option>)}
                      </select>
                    </div>
                  )}
                  {/* اسم المنتج */}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">اسم المنتج <span className="text-red-400">*</span></label>
                    <input type="text" placeholder="اسم المنتج" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} autoFocus/>
                  </div>
                  {/* الوصف */}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">الوصف</label>
                    <textarea placeholder="وصف المنتج (اختياري)" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none h-20 resize-none" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}/>
                  </div>
                  {/* صورة المنتج */}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">صورة المنتج</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="https://... رابط الصورة" className="flex-1 p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})}/>
                      <label className="bg-gray-100 text-gray-600 px-3 py-3 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 whitespace-nowrap hover:bg-gray-200 transition-colors">
                        <Upload size={14}/>رفع
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const formData = new FormData();
                            formData.append("image", file);
                            const imgbbKey = (import.meta as any).env.VITE_IMGBB_API_KEY || "97ffbf56fe1a203445531d664cd4b928";
                            const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, { method: "POST", body: formData });
                            const data = await res.json();
                            if (data.success) setNewProduct(p => ({...p, image_url: data.data.url}));
                            else alert("فشل رفع الصورة");
                          } catch { alert("خطأ في رفع الصورة"); }
                        }}/>
                      </label>
                    </div>
                    {newProduct.image_url && (
                      <div className="mt-2 flex items-center gap-2">
                        <img src={newProduct.image_url} className="w-12 h-12 object-cover rounded-lg border border-gray-100" referrerPolicy="no-referrer"/>
                        <button onClick={() => setNewProduct(p => ({...p, image_url: ""}))} className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-lg">حذف</button>
                      </div>
                    )}
                  </div>
                  {/* نوع المتجر */}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">نوع المتجر</label>
                    <select className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newProduct.store_type} onChange={e => setNewProduct({...newProduct, store_type: e.target.value})}>
                      <option value="normal">عادي</option>
                      <option value="quick_order">طلب سريع</option>
                      <option value="quantities">كميات</option>
                      <option value="numbers">أرقام</option>
                      <option value="external_api">شحن فوري (API خارجي)</option>
                    </select>
                  </div>
                  {/* السعر */}
                  {(newProduct.store_type === "quantities" || newProduct.store_type === "external_api") ? (
                    <div className="space-y-2 p-3 bg-gray-50 rounded-xl">
                      <input type="number" placeholder="أقل كمية" className="w-full p-2 bg-white rounded-lg text-sm outline-none" value={newProduct.min_quantity} onChange={e => setNewProduct({...newProduct, min_quantity: e.target.value})}/>
                      <input type="number" step="0.000001" placeholder="سعر الوحدة $" className="w-full p-2 bg-white rounded-lg text-sm outline-none" value={newProduct.price_per_unit} onChange={e => setNewProduct({...newProduct, price_per_unit: e.target.value})}/>
                      {newProduct.store_type === "external_api" && (
                        <input type="text" placeholder="معرف المنتج الخارجي (external_id)" className="w-full p-2 bg-white rounded-lg text-sm outline-none border border-blue-100" value={newProduct.external_id} onChange={e => setNewProduct({...newProduct, external_id: e.target.value})}/>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">السعر $</label>
                      <input type="number" step="0.01" placeholder="السعر $" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})}/>
                    </div>
                  )}
                  {/* يتطلب بيانات إضافية */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <input type="checkbox" id="req_input_new" checked={newProduct.requires_input} onChange={e => setNewProduct({...newProduct, requires_input: e.target.checked})} className="w-4 h-4 rounded accent-brand"/>
                    <label htmlFor="req_input_new" className="text-sm font-bold text-gray-700 cursor-pointer">يتطلب بيانات إضافية</label>
                  </div>
                  <button
                    onClick={async () => {
                      if (!newProduct.name) return alert("يرجى إدخال اسم المنتج");
                      if (!newProduct.subcategory_special_id) return alert("يرجى اختيار القسم الفرعي");
                      await handleAddProduct();
                      setActiveSubMenu(null);
                    }}
                    className="w-full bg-[#B00000] text-white py-3.5 rounded-2xl font-bold text-sm"
                  >
                    حفظ المنتج
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Banner Modal */}
        <AnimatePresence>
          {activeSubMenu === "add_banner" && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[60] bg-black/50 flex items-end justify-center" onClick={() => setActiveSubMenu(null)}>
              <motion.div initial={{y:100,opacity:0}} animate={{y:0,opacity:1}} exit={{y:100,opacity:0}} className="bg-white w-full max-w-lg rounded-t-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2"><ImageIcon size={18} className="text-pink-500"/>إضافة بانر</h3>
                  <button onClick={() => setActiveSubMenu(null)} className="text-gray-400"><X size={22}/></button>
                </div>
                <div className="space-y-3">
                  <label className="text-xs text-gray-500 block">صورة البانر <span className="text-red-400">*</span></label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://... رابط الصورة"
                      className="flex-1 p-3 bg-gray-50 rounded-xl text-sm outline-none"
                      value={newBanner.image_url}
                      onChange={e => setNewBanner({...newBanner, image_url: e.target.value})}
                    />
                    <label className="bg-gray-100 text-gray-600 px-3 py-3 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 whitespace-nowrap hover:bg-gray-200 transition-colors">
                      <Upload size={14}/>رفع
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const formData = new FormData();
                          formData.append("image", file);
                          const imgbbKey = (import.meta as any).env.VITE_IMGBB_API_KEY || "97ffbf56fe1a203445531d664cd4b928";
                          const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, { method: "POST", body: formData });
                          const data = await res.json();
                          if (data.success) setNewBanner({ image_url: data.data.url });
                          else alert("فشل رفع الصورة");
                        } catch { alert("خطأ في رفع الصورة"); }
                      }}/>
                    </label>
                  </div>
                  {newBanner.image_url && (
                    <div className="mt-1">
                      <img src={newBanner.image_url} className="w-full h-36 object-cover rounded-xl border border-gray-100" referrerPolicy="no-referrer"/>
                    </div>
                  )}
                  <button
                    onClick={async () => {
                      if (!newBanner.image_url) return alert("يرجى إضافة صورة البانر");
                      await handleAddBanner();
                      setActiveSubMenu(null);
                    }}
                    className="w-full bg-[#B00000] text-white py-3.5 rounded-2xl font-bold text-sm"
                  >
                    حفظ البانر
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Offer Modal */}
        <AnimatePresence>
          {activeSubMenu === "add_offer" && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[60] bg-black/50 flex items-end justify-center" onClick={() => setActiveSubMenu(null)}>
              <motion.div initial={{y:100,opacity:0}} animate={{y:0,opacity:1}} exit={{y:100,opacity:0}} className="bg-white w-full max-w-lg rounded-t-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2"><Tag size={18} className="text-rose-500"/>إضافة عرض</h3>
                  <button onClick={() => setActiveSubMenu(null)} className="text-gray-400"><X size={22}/></button>
                </div>
                <div className="space-y-3">
                  <label className="text-xs text-gray-500 block">صورة العرض</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://... رابط الصورة"
                      className="flex-1 p-3 bg-gray-50 rounded-xl text-sm outline-none"
                      value={newOffer.image_url}
                      onChange={e => setNewOffer({...newOffer, image_url: e.target.value})}
                    />
                    <label className="bg-gray-100 text-gray-600 px-3 py-3 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 whitespace-nowrap hover:bg-gray-200 transition-colors">
                      <Upload size={14}/>رفع
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const formData = new FormData();
                          formData.append("image", file);
                          const imgbbKey = (import.meta as any).env.VITE_IMGBB_API_KEY || "97ffbf56fe1a203445531d664cd4b928";
                          const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, { method: "POST", body: formData });
                          const data = await res.json();
                          if (data.success) setNewOffer(o => ({...o, image_url: data.data.url}));
                          else alert("فشل رفع الصورة");
                        } catch { alert("خطأ في رفع الصورة"); }
                      }}/>
                    </label>
                  </div>
                  {newOffer.image_url && (
                    <img src={newOffer.image_url} className="w-full h-36 object-cover rounded-xl border border-gray-100" referrerPolicy="no-referrer"/>
                  )}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">اسم العرض <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      placeholder="عنوان العرض"
                      className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none"
                      value={newOffer.title}
                      onChange={e => setNewOffer({...newOffer, title: e.target.value})}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">وصف العرض</label>
                    <textarea
                      placeholder="وصف العرض (اختياري)"
                      className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none h-20 resize-none"
                      value={newOffer.description}
                      onChange={e => setNewOffer({...newOffer, description: e.target.value})}
                    />
                  </div>
                  <button
                    onClick={async () => {
                      if (!newOffer.title) return alert("يرجى إدخال اسم العرض");
                      await handleAddOffer();
                      setActiveSubMenu(null);
                    }}
                    className="w-full bg-[#B00000] text-white py-3.5 rounded-2xl font-bold text-sm"
                  >
                    حفظ العرض
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Balance Modal */}
        <AnimatePresence>
          {activeSubMenu === "add_balance" && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[60] bg-black/50 flex items-end" onClick={() => setActiveSubMenu(null)}>
              <motion.div initial={{y:80}} animate={{y:0}} exit={{y:80}} className="bg-white w-full rounded-t-3xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-gray-800 flex items-center gap-2"><Wallet size={18}/>شحن رصيد يدوي</h3>
                <input type="text" placeholder="رقم الدخول للمستخدم" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={manualTopup.userId} onChange={e => setManualTopup({...manualTopup,userId:e.target.value})}/>
                <input type="number" placeholder="المبلغ $" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={manualTopup.amount} onChange={e => setManualTopup({...manualTopup,amount:e.target.value})}/>
                <button onClick={() => { handleManualTopup(); setActiveSubMenu(null); }} className="w-full bg-[#B00000] text-white py-3.5 rounded-2xl font-bold text-sm">شحن الرصيد</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Notification Modal */}
        <AnimatePresence>
          {activeSubMenu === "add_notification" && (
            <AdminNotifModal
              onClose={() => setActiveSubMenu(null)}
              handleSendNotification={handleSendNotification}
            />
          )}
        </AnimatePresence>

        {/* Bottom Admin Nav */}
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around z-40">
          {([
            { tab:"admin_home", icon:<Home size={22}/>, label:"الرئيسية" },
            { tab:"orders", icon:<ShoppingBag size={22}/>, label:"الطلبات", badge: adminOrders.filter((o:any)=>o.status==='pending_admin').length },
            { tab:"fab", icon:null, label:"" },
            { tab:"transactions", icon:<Wallet size={22}/>, label:"الدفعات", badge: adminTransactions.filter((t:any)=>t.status==='pending').length },
            { tab:"chat", icon:<MessageSquare size={22}/>, label:"الشات" },
            { tab:"elements", icon:<LayoutGrid size={22}/>, label:"العناصر" },
          ] as any[]).map((item:any) => {
            if (item.tab === "fab") return (
              <button key="fab" onClick={() => setActiveSubMenu(activeSubMenu==="fab_open"?null:"fab_open")}
                className="relative -top-4 w-14 h-14 bg-[#B00000] text-white rounded-full shadow-lg shadow-red-200 flex items-center justify-center active:scale-95 transition-all">
                <Plus size={28} className={`transition-transform duration-200 ${activeSubMenu==="fab_open"?"rotate-45":""}`}/>
              </button>
            );
            return (
              <button key={item.tab} onClick={() => { setAdminTab(item.tab); setActiveSubMenu(null); }}
                className={`flex flex-col items-center gap-0.5 relative ${adminTab===item.tab?"text-[#B00000]":"text-gray-400"}`}>
                {item.icon}
                <span className="text-[9px] font-medium">{item.label}</span>
                {item.badge > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#B00000] text-white text-[8px] font-bold rounded-full flex items-center justify-center">{item.badge}</span>}
              </button>
            );
          })}
        </nav>
      </div>
    );
  };

  if (isAdmin) return (
    <AdminPanel 
      user={user}
      fetchUser={fetchUser}
      categories={categories}
      subcategories={subcategories}
      subSubCategories={subSubCategories}
      fetchCategories={fetchCategories}
      fetchSubcategories={fetchSubcategories}
      fetchSubSubCategories={fetchSubSubCategories}
      paymentMethods={paymentMethods}
      fetchPaymentMethods={fetchPaymentMethods}
      banners={banners}
      fetchBanners={fetchBanners}
      offers={offers}
      fetchOffers={fetchOffers}
      setIsAdmin={setIsAdmin}
      theme={theme}
      adminTab={adminTab}
      setAdminTab={setAdminTab}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50 text-right" dir="rtl">
      {!(view.type === "chat" || (isAdmin && adminTab === "chat" && selectedChatUser)) && <Header />}
      <Drawer />
      <NotificationPanel />
      
      <main className={view.type === "chat" || (isAdmin && adminTab === "chat" && selectedChatUser) ? "pb-16" : "pt-20 pb-24"}>
        <AnimatePresence mode="wait">
          <motion.div
            key={view.type + activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {view.type === "admin_login" && (
              <AdminLoginView 
                setIsAdmin={setIsAdmin}
                setAdminAuth={setAdminAuth}
                setView={setView}
              />
            )}
            {view.type === "voucher_redeem" && (
              <VoucherRedeemView 
                voucherCode={voucherCode}
                setVoucherCode={setVoucherCode}
                handleRedeemVoucher={handleRedeemVoucher}
                setView={setView}
              />
            )}
            {view.type !== "admin_login" && view.type !== "voucher_redeem" && (
              <>
                {activeTab === "home" && (
                  <>
                    {view.type === "main" && <HomeView />}
                    {view.type === "subcategories" && <SubcategoriesView />}
                    {view.type === "sub_sub_categories" && <SubSubCategoriesView />}
                    {view.type === "products" && <ProductsView />}
                    {view.type === "checkout" && <CheckoutView />}
                    {view.type === "quick_order" && <QuickOrderView />}
                    {view.type === "success" && <SuccessView />}
                    {view.type === "login" && <LoginView />}
                    {view.type === "forgot_password" && <ForgotPasswordView />}
                  </>
                )}
                {activeTab === "wallet" && (user ? <WalletView /> : <LoginView />)}
                {activeTab === "orders" && (user ? <OrdersView /> : <LoginView />)}
                {activeTab === "profile" && (
                  <>
                    {view.type === "main" && <ProfileView />}
                    {view.type === "profile_details" && <ProfileDetailsView />}
                    {view.type === "leaderboard" && <LeaderboardView />}
                    {view.type === "payments" && <PaymentsView />}
                    {view.type === "edit_profile" && <EditProfileView />}
                    {view.type === "referral" && <ReferralView />}
                    {view.type === "privacy_policy" && <PrivacyPolicyView />}
                    {view.type === "chat" && <ChatView />}
                    {view.type === "settings" && <SettingsView />}
                    {view.type === "success" && <SuccessView />}
                    {view.type === "login" && <LoginView />}
                  </>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav />

      {/* PWA Install Banner */}
      <AnimatePresence>
        {showInstallBanner && deferredPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -80 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 right-0 z-[110] p-3"
          >
            <div className="bg-gray-900 text-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl max-w-md mx-auto">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shrink-0">
                <Download size={20} />
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-bold">تثبيت التطبيق</p>
                <p className="text-[11px] text-gray-400">هل تريد تثبيت التطبيق على جهازك؟</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleInstallApp}
                  className="bg-brand text-white px-3 py-1.5 rounded-xl text-xs font-bold active:scale-95 transition-all"
                >
                  تأكيد
                </button>
                <button
                  onClick={() => setShowInstallBanner(false)}
                  className="bg-white/10 text-white px-3 py-1.5 rounded-xl text-xs font-bold active:scale-95 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Telegram Linking Modal */}
      <AnimatePresence>
        {linkingModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare size={40} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">ربط حساب تليجرام</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">استخدم الكود التالي في البوت لربط حسابك</p>
                </div>

                <div className="relative group">
                  <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-6 transition-colors group-hover:border-blue-400">
                    <span className="text-4xl font-black tracking-widest text-gray-900 dark:text-white font-mono">
                      {linkingModal.code}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(linkingModal.code);
                      alert("تم نسخ الكود");
                    }}
                    className="absolute -top-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg hover:bg-blue-700 transition-colors"
                    title="نسخ الكود"
                  >
                    <Copy size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-orange-500 font-bold">
                  <Clock size={18} />
                  <span>
                    {Math.floor(linkingModal.timeLeft / 60)}:
                    {(linkingModal.timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  <button 
                    onClick={() => {
                      window.open(`https://t.me/viprostorebot?start=${linkingModal.code}`, '_blank');
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 dark:shadow-none flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <ExternalLink size={20} />
                    فتح تليجرام
                  </button>
                  <button 
                    onClick={() => setLinkingModal(prev => ({ ...prev, isOpen: false }))}
                    className="w-full text-gray-400 dark:text-gray-500 font-bold text-sm py-2"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {themeModal.isOpen && <ThemeCustomizationModal />}
      </AnimatePresence>

      {/* Blocked Overlay */}
      <AnimatePresence>
        {isBlocked && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-red-600 flex flex-col items-center justify-center text-white p-6 text-center"
          >
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <XCircle size={64} />
            </div>
            <h1 className="text-3xl font-bold mb-4">لقد تم حظرك مؤقتاً</h1>
            <p className="text-red-100 mb-8 max-w-xs">لقد تم تقييد وصولك للموقع بسبب مخالفة القوانين. يرجى الانتظار حتى انتهاء مدة الحظر.</p>
            
            <div className="bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-sm space-y-2">
              <p className="text-xs uppercase tracking-widest text-red-200 font-bold">الوقت المتبقي</p>
              <p className="text-5xl font-bold font-mono">
                {Math.floor(blockCountdown / 60)}:{String(blockCountdown % 60).padStart(2, '0')}
              </p>
            </div>
            
            <button 
              onClick={() => window.location.reload()}
              className="mt-12 bg-white text-red-600 px-8 py-3 rounded-2xl font-bold shadow-xl active:scale-95 transition-all"
            >
              تحديث الصفحة
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Loading Spinner */}
      <AnimatePresence>
        {pageLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-white/60 backdrop-blur-sm flex items-center justify-center pointer-events-none"
          >
            <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-[#B00000] animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
