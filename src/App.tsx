/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Component, useCallback, useRef } from "react";
import { 
  Home, 
  Wallet, 
  ShoppingBag, 
  User, 
  UserCircle,
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
  RotateCcw,
  BarChart2,
  TrendingUp,
  Calendar,
  ChevronDown as ChevronDownIcon,
  MessageCircle,
  Filter,
  RefreshCcw,
  DollarSign,
  Sun,
  Moon,
  Shield,
  Gift,
  Headphones,
  Link2,
} from "lucide-react";
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
          showToast(data.error || "كلمة مرور خاطئة", 'error');
        } else {
          showToast("كلمة مرور خاطئة", 'error');
        }
      }
    } catch (e: any) {
      if (e.name === 'TypeError' && e.message === 'Failed to fetch') {
        showToast("فشل الاتصال بالسيرفر (تأكد من اتصالك بالإنترنت)", 'error');
      } else {
        showToast("فشل الاتصال بالسيرفر", 'error');
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
          showToast("فشل الرفع: " + (data.error?.message || "خطأ غير معروف"), 'error');
        }
      } catch (err) {
        showToast("خطأ في الاتصال بخادم الصور", 'error');
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
            <img loading="lazy" src={currentUrl} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
          </div>
        )}
      </div>
    );
  };

// ===================== TOAST SYSTEM =====================
type ToastType = 'success' | 'error' | 'info';
interface Toast { id: number; message: string; type: ToastType; }

let toastIdCounter = 0;
let globalShowToast: ((msg: string, type?: ToastType) => void) | null = null;

export function showToast(msg: string, type: ToastType = 'info') {
  if (globalShowToast) globalShowToast(msg, type);
}

const ToastContainer = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => {
    globalShowToast = (msg, type = 'info') => {
      const id = ++toastIdCounter;
      setToasts(prev => [...prev, { id, message: msg, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    };
    return () => { globalShowToast = null; };
  }, []);
  const colors: Record<ToastType, string> = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };
  const iconMap: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={16} className="shrink-0" />,
    error:   <XCircle    size={16} className="shrink-0" />,
    info:    <Info       size={16} className="shrink-0" />,
  };
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none" style={{minWidth:'260px',maxWidth:'90vw'}}>
      {toasts.map(t => (
        <div key={t.id} className={`${colors[t.type]} text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold`}
          style={{animation:'toastIn 0.3s ease, toastOut 0.4s ease 3.1s forwards'}}>
          {iconMap[t.type]}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};
// ===================== END TOAST SYSTEM =====================

// ===================== CUSTOM DIALOG SYSTEM =====================
interface DialogConfig {
  type: 'confirm' | 'prompt';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  inputLabel?: string;
  inputDefault?: string;
  inputPlaceholder?: string;
  onConfirm: (value?: string) => void;
  onCancel?: () => void;
  danger?: boolean;
}
let globalShowDialog: ((cfg: DialogConfig) => void) | null = null;

export function showDialog(cfg: DialogConfig) {
  if (globalShowDialog) globalShowDialog(cfg);
}

export function showConfirm(message: string, title: string, onConfirm: () => void, danger = false) {
  showDialog({ type: 'confirm', title, message, confirmText: 'تأكيد', cancelText: 'إلغاء', onConfirm, danger });
}

export function showPromptDialog(message: string, title: string, onConfirm: (val: string) => void, inputDefault = '', inputPlaceholder = '') {
  showDialog({ type: 'prompt', title, message, confirmText: 'تأكيد', cancelText: 'إلغاء', inputDefault, inputPlaceholder, onConfirm });
}

const CustomDialogContainer = () => {
  const [dialog, setDialog] = useState<DialogConfig | null>(null);
  const [inputValue, setInputValue] = useState('');
  useEffect(() => {
    globalShowDialog = (cfg) => {
      setInputValue(cfg.inputDefault || '');
      setDialog(cfg);
    };
    return () => { globalShowDialog = null; };
  }, []);
  if (!dialog) return null;
  const handleConfirm = () => {
    dialog.onConfirm(dialog.type === 'prompt' ? inputValue : undefined);
    setDialog(null);
  };
  const handleCancel = () => {
    if (dialog.onCancel) dialog.onCancel();
    setDialog(null);
  };
  return (
    <div className="fixed inset-0 z-[9998] flex items-end justify-center" style={{backdropFilter:'blur(2px)',WebkitBackdropFilter:'blur(2px)',background:'rgba(0,0,0,0.35)'}}>
      <div className="bg-white w-full max-w-sm rounded-t-3xl shadow-2xl p-6 space-y-4 animate-slideUp" style={{animation:'slideUpDialog 0.25s ease'}}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 ${dialog.danger ? 'bg-red-100' : 'bg-brand-light'}`}>
            {dialog.danger ? '⚠️' : dialog.type === 'prompt' ? '✏️' : '❓'}
          </div>
          <div>
            <h3 className={`font-bold text-base ${dialog.danger ? 'text-red-700' : 'text-gray-800'}`}>{dialog.title}</h3>
            <p className="text-gray-500 text-sm leading-snug">{dialog.message}</p>
          </div>
        </div>
        {dialog.type === 'prompt' && (
          <input
            autoFocus
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={dialog.inputPlaceholder || ''}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-brand shadow-sm"
            onKeyDown={e => { if (e.key === 'Enter') handleConfirm(); }}
          />
        )}
        <div className="flex gap-3">
          <button onClick={handleCancel} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold text-sm">
            {dialog.cancelText || 'إلغاء'}
          </button>
          <button onClick={handleConfirm} className={`flex-1 py-3 rounded-2xl font-bold text-sm text-white ${dialog.danger ? 'bg-red-500' : 'bg-brand'}`}>
            {dialog.confirmText || 'تأكيد'}
          </button>
        </div>
      </div>
    </div>
  );
};
// ===================== END CUSTOM DIALOG SYSTEM =====================

// ===================== WALLET CHARGE VIEW (كل الـ state داخله لمنع إغلاق الكيبورد) =====================
interface WalletChargeViewProps {
  user: any;
  paymentMethods: PaymentMethod[];
  showToast: (msg: string, type: 'success'|'error'|'info') => void;
  setView: (v: any) => void;
  fetchUser: (id: number) => void;
  fetchTransactions: () => void;
}

// React.memo يمنع إعادة رسم المكوّن عند أي تحديث خارجي لا يخصه
const WalletChargeView: React.FC<WalletChargeViewProps> = React.memo(({
  user, paymentMethods, showToast, setView, fetchUser, fetchTransactions,
}) => {
  const [selectedMethod, setSelectedMethodState] = React.useState<PaymentMethod | null>(null);
  const [walletAmount, setWalletAmount] = React.useState("");
  const [walletNote, setWalletNote] = React.useState("");
  const [walletReceiptUrl, setWalletReceiptUrl] = React.useState("");
  const [walletUploading, setWalletUploading] = React.useState(false);
  const [walletTxNumber, setWalletTxNumber] = React.useState("");
  const [walletLoading, setWalletLoading] = React.useState(false);

  const setSelectedMethod = (m: PaymentMethod | null) => {
    setSelectedMethodState(m);
    if (!m) {
      setWalletAmount(""); setWalletNote(""); setWalletReceiptUrl(""); setWalletTxNumber("");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setWalletUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const imgbbKey = (import.meta as any).env.VITE_IMGBB_API_KEY || "97ffbf56fe1a203445531d664cd4b928";
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) { setWalletReceiptUrl(data.data.url); }
      else { showToast("فشل رفع الصورة: " + (data.error?.message || "خطأ غير معروف"), 'error'); }
    } catch { showToast("خطأ في الاتصال بخادم الصور", 'error'); }
    finally { setWalletUploading(false); }
  };

  const clearReceipt = (e: React.MouseEvent) => { e.stopPropagation(); e.preventDefault(); setWalletReceiptUrl(""); };

  const handleAutoTopUp = async () => {
    if (!user || !selectedMethod || !walletAmount || !walletTxNumber) {
      showToast("يرجى إدخال المبلغ ورقم العملية", 'error'); return;
    }
    setWalletLoading(true);
    try {
      const res = await fetch("/api/transactions/verify-auto", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` },
        body: JSON.stringify({ userId: user.id, paymentMethodId: selectedMethod.id, amount: parseFloat(walletAmount), txNumber: walletTxNumber.trim() })
      });
      const data = await res.json();
      if (data.success) {
        fetchUser(user.id); fetchTransactions();
        const added = data.addedUsd ?? parseFloat(walletAmount);
        const orig = data.originalAmount ? ` (${data.originalAmount} ${data.currency})` : "";
        setView({ type: "success", data: `✅ تم شحن ${added.toFixed(4)}$${orig} بنجاح عبر ${selectedMethod.name}!` });
      } else { showToast(data.error || "فشل التحقق", 'error'); }
    } catch { showToast("فشل الاتصال بالخادم", 'error'); }
    finally { setWalletLoading(false); }
  };

  const handleTopUp = async () => {
    if (!user || !selectedMethod || !walletAmount || !walletReceiptUrl) {
      showToast("يرجى إكمال جميع البيانات ورفع الإيصال", 'error'); return;
    }
    const numAmount = parseFloat(walletAmount);
    if (numAmount < selectedMethod.min_amount) {
      showToast(`أقل مبلغ للشحن عبر هذه الطريقة هو ${selectedMethod.min_amount} $`, 'error'); return;
    }
    setWalletLoading(true);
    try {
      const res = await fetch("/api/transactions/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` },
        body: JSON.stringify({ userId: user.id, paymentMethodId: selectedMethod.id, amount: numAmount, note: walletNote, receiptImageUrl: walletReceiptUrl })
      });
      const data = await res.json();
      if (data.success) { setView({ type: "success", data: "تم إرسال طلب الشحن بنجاح، يرجى انتظار التحقق." }); fetchTransactions(); }
      else { showToast(data.error || "فشل إرسال الطلب", 'error'); }
    } catch (e) { showToast("فشل الاتصال بالخادم، يرجى المحاولة لاحقاً", 'error'); console.error(e); }
    finally { setWalletLoading(false); }
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
            <>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center space-y-1">
                <p className="text-green-700 font-bold text-sm">✅ شحن تلقائي فوري</p>
                <p className="text-green-600 text-xs">يتم التحقق من العملية تلقائياً وإضافة الرصيد فوراً {"\n"}في حال كانت العملية بالليرة السورية سيتم تعبئة رصيد بـ1$ لكل 120 ل.س جديدو</p>
              </div>
              <div className="bg-brand-light p-4 rounded-xl border border-brand-soft text-center">
                <p className="text-brand text-xs mb-1">{selectedMethod.method_type === 'syriatel' ? 'رقم سيريتل كاش' : 'عنوان شام كاش'}</p>
                <p className="text-xl font-bold text-brand tracking-wider">{selectedMethod.wallet_address}</p>
                {selectedMethod.min_amount > 0 && <p className="text-xs text-brand mt-2 font-bold">أقل مبلغ: {selectedMethod.min_amount} $</p>}
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">اكتب قيمة المبلغ المرسل ان كان $ او ل.س </label>
                  <input type="text" inputMode="decimal" value={walletAmount} onChange={e => setWalletAmount(e.target.value)} placeholder="0.00"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-brand" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">رقم العملية (Transaction ID)</label>
                  <input type="text" value={walletTxNumber} onChange={e => setWalletTxNumber(e.target.value)}
                    placeholder={selectedMethod.method_type === 'syriatel' ? 'مثال: 123456789' : 'مثال: 987654321'}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-brand font-mono" />
                  <p className="text-xs text-gray-400">أدخل رقم العملية كما يظهر في تطبيق {selectedMethod.name}</p>
                </div>
                <button disabled={walletLoading || !walletTxNumber || !walletAmount} onClick={handleAutoTopUp}
                  className="w-full bg-brand text-white py-4 rounded-xl font-bold shadow-lg shadow-brand-soft disabled:opacity-50">
                  {walletLoading ? "جاري التحقق..." : "تحقق وشحن فوراً"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-brand-light p-4 rounded-xl border border-brand-soft text-center space-y-2">
                <p className="text-brand text-xs font-semibold mb-1">رقم المحفظة / العنوان</p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-brand tracking-wider break-all">{selectedMethod.wallet_address}</p>
                  <button onClick={() => { navigator.clipboard.writeText(selectedMethod.wallet_address).then(() => showToast("تم نسخ عنوان المحفظة!", 'success')).catch(() => showToast("فشل النسخ", 'error')); }}
                    className="flex items-center gap-1 bg-brand text-white text-[10px] font-bold px-2 py-1 rounded-lg shrink-0">
                    <Copy size={11} /> نسخ
                  </button>
                </div>
                <p className="text-[10px] text-brand/70 font-medium">طريقة الدفع: {selectedMethod.name}</p>
                {selectedMethod.description && <p className="text-xs text-brand/60 font-light mt-1">{selectedMethod.description}</p>}
                {selectedMethod.min_amount > 0 && <p className="text-xs text-brand mt-1 font-bold">أقل مبلغ: {selectedMethod.min_amount} $</p>}
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">المبلغ المراد شحنه</label>
                  <input type="text" inputMode="decimal" value={walletAmount} onChange={e => setWalletAmount(e.target.value)} placeholder="0.00"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-brand" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">ملاحظات إضافية</label>
                  <textarea value={walletNote} onChange={e => setWalletNote(e.target.value)} placeholder="اختياري..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-brand h-24 resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">إرفاق صورة الإيصال</label>
                  <label className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors relative overflow-hidden">
                    {walletReceiptUrl ? (
                      <>
                        <img loading="lazy" src={walletReceiptUrl} className="w-full h-full object-cover" alt="Receipt" referrerPolicy="no-referrer" />
                        <button onClick={clearReceipt} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"><X size={16} /></button>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={32} />
                        <span className="text-xs">{walletUploading ? "جاري الرفع..." : "اضغط لرفع الصورة"}</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={walletUploading} />
                  </label>
                </div>
                <button disabled={walletLoading || walletUploading || !walletReceiptUrl} onClick={handleTopUp}
                  className="w-full bg-brand text-white py-4 rounded-xl font-bold shadow-lg shadow-brand-soft disabled:opacity-50">
                  {walletLoading ? "جاري الإرسال..." : "إرسال طلب التحقق"}
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
      <button onClick={() => setView({ type: "voucher_redeem" })}
        className="w-full bg-gradient-to-r from-brand to-brand-soft p-6 rounded-2xl text-white shadow-lg shadow-brand-soft flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><Ticket size={28} /></div>
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
      <div className="grid grid-cols-4 gap-2">
        {paymentMethods.map(method => (
          <button key={method.id} onClick={() => setSelectedMethod(method)}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:border-brand-soft transition-colors active:scale-95">
            <div className="w-full flex items-center justify-center bg-gray-50 py-1.5">
              <div className="w-3/4 aspect-square overflow-hidden rounded-lg">
                <img loading="lazy" src={method.image_url || "https://picsum.photos/seed/pay/100/100"} alt={method.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
            <div className="px-1.5 py-1.5">
              <span className="font-bold text-gray-800 text-[9px] text-center block leading-tight">{method.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
// إغلاق React.memo
}, (prevProps, nextProps) => {
  // نعيد الرسم فقط عند تغيير paymentMethods أو user.id أو user.balance
  // هذا يمنع إعادة رسم المكوّن عند تحديث بيانات المستخدم الأخرى
  if (prevProps.paymentMethods !== nextProps.paymentMethods) return false;
  if (prevProps.user?.id !== nextProps.user?.id) return false;
  if (prevProps.user?.balance !== nextProps.user?.balance) return false;
  return true;
});
// ===================== END WALLET CHARGE VIEW =====================

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [user, setUser] = useState<UserData | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [view, setView] = useState<{ type: string; id?: number; data?: any; catId?: number; fromSubSub?: boolean; subId?: number; subName?: string; fromFav?: boolean }>({ type: "main" });
  const [pageLoading, setPageLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subSubCategories, setSubSubCategories] = useState<SubSubCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [checkoutQuantity, setCheckoutQuantity] = useState<number>(0);
  const [checkoutOrderResult, setCheckoutOrderResult] = useState<any>(null);
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
  const [siteSettings, setSiteSettings] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");
  // ── Currency state ──
  const [currency, setCurrency] = useState<"USD"|"SYP">(() => (localStorage.getItem("currency") as any) || "USD");
  const [sypRate, setSypRate] = useState<number>(0); // يُجلب دائماً من API — لا نعتمد على localStorage
  const [sypRateUpdatedAt, setSypRateUpdatedAt] = useState<string>("");
  const [showRateTooltip, setShowRateTooltip] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  // ── Wallet charge form states (رُفعت هنا لمنع ضياع البيانات عند إعادة الرسم) ──
  // wallet state moved inside WalletChargeView for keyboard stability
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockCountdown, setBlockCountdown] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [linkingModal, setLinkingModal] = useState<{ isOpen: boolean; code: string; timeLeft: number }>({
    isOpen: false,
    code: "",
    timeLeft: 0
  });

  // ===== HOME SORT MODE & FAVORITES =====
  const [homeSortMode, setHomeSortMode] = useState<"categories" | "most_purchased" | "favorites">("categories");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [mostPurchased, setMostPurchased] = useState<any[]>([]);
  const [mostPurchasedLoading, setMostPurchasedLoading] = useState(false);
  const [favorites, setFavorites] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem("vipro_favorites") || "[]"); } catch { return []; }
  });
  const [longPressTarget, setLongPressTarget] = useState<any | null>(null);
  const [longPressPos, setLongPressPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // ===== ONBOARDING TUTORIAL STATE =====
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // ===== CUSTOM DIALOG STATE =====
  const [dialogOpen, setDialogOpen] = useState(false);

  // ===== NAVIGATION HISTORY STACK =====
  const [viewHistory, setViewHistory] = useState<any[]>([]);

  const navigateTo = useCallback((newView: any) => {
    setViewHistory(prev => [...prev, newView]);
    setView(newView);
  }, []);

  const navigateBack = useCallback(() => {
    setViewHistory(prev => {
      if (prev.length <= 1) {
        setView({ type: "main" });
        setActiveTab("home");
        return [];
      }
      const currentView = prev[prev.length - 1];
      // إذا وصلنا للصفحة الحالية عبر most_purchased نرجع للرئيسية مباشرة
      if (currentView?.fromMostPurchased) {
        setView({ type: "main" });
        setActiveTab("home");
        setHomeSortMode("categories");
        return [];
      }
      const newHistory = prev.slice(0, -1);
      const prevView = newHistory[newHistory.length - 1];
      setView(prevView);
      return newHistory;
    });
  }, []);

  // ===== PULL TO REFRESH =====
  const pullStartY = useRef(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // حفظ المفضلة في localStorage عند التغيير
  useEffect(() => {
    localStorage.setItem("vipro_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (item: any) => {
    setFavorites(prev => {
      const exists = prev.some(f => f._fav_key === item._fav_key);
      if (exists) return prev;
      return [...prev, item];
    });
    setLongPressTarget(null);
  };

  const removeFromFavorites = (favKey: string) => {
    setFavorites(prev => prev.filter(f => f._fav_key !== favKey));
  };

  const isFavorite = (favKey: string) => favorites.some(f => f._fav_key === favKey);

  const fetchMostPurchased = async () => {
    if (mostPurchasedLoading) return;
    setMostPurchasedLoading(true);
    try {
      const token = localStorage.getItem("authToken") || "";
      const res = await fetch("/api/most-purchased", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setMostPurchased(data || []);
      }
    } catch {}
    setMostPurchasedLoading(false);
  };

  // useLongPress helper داخلي
  const useLongPressHandlers = (item: any, e: React.TouchEvent | React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setLongPressTarget(item);
    setLongPressPos({ x: rect.left + rect.width / 2, y: rect.top });
  };
  // ===== END HOME SORT MODE & FAVORITES =====

  // Theme effect
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // أظهر الإشعار كل 5 جلسات فقط وليس كل جلسة
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      if (!isStandalone) {
        const sessionKey = "vipro_install_session";
        const lastShownKey = "vipro_install_last_session";
        // رقم الجلسة الحالية
        const currentSession = parseInt(sessionStorage.getItem(sessionKey) || "0");
        if (currentSession === 0) {
          // جلسة جديدة — زد العداد في localStorage
          const totalSessions = parseInt(localStorage.getItem(lastShownKey) || "0") + 1;
          localStorage.setItem(lastShownKey, String(totalSessions));
          sessionStorage.setItem(sessionKey, String(totalSessions));
          // أظهر فقط إذا كانت الجلسة مضاعف 5
          if (totalSessions % 5 === 1 || totalSessions === 1) {
            setTimeout(() => setShowInstallBanner(true), 2000);
          }
        }
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
        // لا نعيد تحميل الصفحة أبداً - نكتفي بتحديث الإعدادات بهدوء
        // window.location.reload() محذوف نهائياً لأنه يُخرج المستخدم من صفحة الدفع
        fetchSiteSettings();
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

  // ── adminFetch: جميع طلبات الأدمن تُرسل التوكن تلقائياً ──
  const adminFetch = (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = localStorage.getItem("adminToken") || "";
    const existingHeaders = (options.headers as Record<string, string>) || {};
    return fetch(url, {
      ...options,
      headers: {
        ...existingHeaders,
        "x-admin-token": token,
      }
    });
  };

  // ===== BACK BUTTON (popstate) =====
  useEffect(() => {
    const handlePopState = () => {
      if (view.type !== 'main') {
        navigateBack();
        window.history.pushState(null, '', window.location.href);
      } else if (activeTab !== 'home') {
        setActiveTab('home');
        window.history.pushState(null, '', window.location.href);
      }
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [view, activeTab, navigateBack]);

  // ===== PULL TO REFRESH (DISABLED) =====
  useEffect(() => {
    if (activeTab !== 'home') return;
    const onTouchStart = (_e: TouchEvent) => {};
    const onTouchMove = (_e: TouchEvent) => {};
    const onTouchEnd = async () => {
      if (false) {
        setPullDistance(0);
        setIsPulling(false);
      }
    };
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [activeTab, pullDistance, isRefreshing]);

  // Fetch initial data
  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
    fetchSubSubCategories();
    fetchPaymentMethods();
    fetchBanners();
    fetchOffers();
    fetchSiteSettings();
    // 1) جلب السعر من DB فوراً لعرضه في الواجهة
    // 2) بعده محاولة تحديثه من الموقع الخارجي وحفظه في DB
    fetchSypRate().then(() => {
      fetchAndStoreSypRateFromBrowser();
    });
    // تحديث السعر الحي كل 30 دقيقة
    const sypRateInterval = setInterval(fetchAndStoreSypRateFromBrowser, 30 * 60 * 1000);
    const savedUserId = localStorage.getItem("userId");
    if (savedUserId && !isNaN(Number(savedUserId))) {
      fetchUser(Number(savedUserId));
    }

    // Handle Google OAuth redirect callback (hash fragment contains access_token)
    const handleGoogleRedirectCallback = async () => {
      const hash = window.location.hash;
      if (!hash.includes('access_token')) return;
      const params = new URLSearchParams(hash.replace('#', ''));
      const accessToken = params.get('access_token');
      const state = params.get('state');
      if (!accessToken || state !== 'google_oauth') return;

      // Clean URL immediately
      window.history.replaceState(null, '', window.location.pathname);

      try {
        const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (!profileRes.ok) return;
        const profile = await profileRes.json();

        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken, googleId: profile.sub, email: profile.email, name: profile.name, picture: profile.picture })
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data);
          if (data.token) localStorage.setItem('authToken', data.token);
          localStorage.setItem('userId', String(data.id));
          setView({ type: 'main' });
          setActiveTab('home');
          if (data.isNew) { setOnboardingStep(0); setShowOnboarding(true); }
        }
      } catch { /* silent */ }
    };
    handleGoogleRedirectCallback();

    // Handle referral code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      localStorage.setItem("referralCode", ref);
      if (!savedUserId) {
        setView({ type: "login" });
      }
    }

    // Handle Admin Route — استعادة الجلسة إن وُجد توكن محفوظ
    if (window.location.pathname === "/adminvipa7d1216") {
      const savedAdminToken = localStorage.getItem("adminToken");
      if (savedAdminToken) {
        // تحقق من صلاحية التوكن قبل الدخول المباشر
        fetch("/api/admin/verify-token", {
          headers: { "x-admin-token": savedAdminToken }
        })
          .then(res => res.json())
          .then(data => {
            if (data.valid) {
              setIsAdmin(true);
              setAdminAuth(true);
              setView({ type: "main" });
            } else {
              // التوكن منتهي أو غير صالح — احذفه واطلب تسجيل الدخول
              localStorage.removeItem("adminToken");
              setView({ type: "admin_login" });
            }
          })
          .catch(() => {
            // خطأ في الاتصال — اعرض صفحة تسجيل الدخول
            setView({ type: "admin_login" });
          });
      } else {
        setView({ type: "admin_login" });
      }
    }
    return () => clearInterval(sypRateInterval);
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
      const token = localStorage.getItem("authToken") || "";
      const res = await fetch(`/api/notifications/${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
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
          action: 'unlink',
          is_read: false
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
    // Optimistic update - mark as read in local state immediately
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    if (typeof id === 'string') return; // Local notifs - no API call needed
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` },
        body: JSON.stringify({ notificationId: id })
      });
      // Re-fetch to sync with server
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const markAllNotificationsRead = async () => {
    const unread = (Array.isArray(notifications) ? notifications : []).filter(n => !n.is_read);
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    for (const n of unread) {
      if (typeof n.id !== 'string') {
        try {
          await fetch("/api/notifications/mark-read", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` },
            body: JSON.stringify({ notificationId: n.id })
          });
        } catch {}
      }
    }
    fetchNotifications();
  };

  const handleUnlinkTelegram = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("authToken") || "";
      const res = await fetch("/api/user/unlink-telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user.id })
      });
      if (res.ok) {
        fetchUser(user.id);
        showToast("تم فك الارتباط بنجاح.", 'success');
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "فشل فك الارتباط، حاول مجدداً", 'error');
      }
    } catch (e) {
      console.error(e);
      showToast("فشل الاتصال بالخادم", 'error');
    }
  };

  const handleGenerateLinkingCode = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/user/generate-linking-code", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` },
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
        showToast(data.error || "فشل توليد الكود", 'error');
      }
    } catch (e) {
      console.error(e);
      showToast("خطأ في الاتصال بالسيرفر", 'error');
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
      showToast("فشل تحديث الثيم", 'error');
    }
  };

  const handleChangeAdminPassword = async () => {
    if (!newAdminPass) return showToast("يرجى إدخال كلمة المرور الجديدة", 'error');
    try {
      const res = await adminFetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: newAdminPass })
      });
      if (res.ok) {
        showToast("تم تغيير كلمة المرور بنجاح", 'success');
        setNewAdminPass("");
      }
    } catch (e) {
      showToast("فشل تغيير كلمة المرور", 'error');
    }
  };

  // Helper: يجيب الـ auth token من localStorage
  const getAuthToken = (): string => localStorage.getItem("authToken") || "";

  const fetchUser = useCallback(async (id: number) => {
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
  }, []);

  const handleRedeemVoucher = async () => {
    if (!user || !voucherCode) return;
    try {
      const res = await fetch("/api/vouchers/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` },
        body: JSON.stringify({ code: voucherCode })
      });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response from redeem voucher API");
      }

      const data = await res.json();
      if (res.ok) {
        showToast(`✅ تم شحن ${data.amount}$ بنجاح!`, 'success');
        setVoucherCode("");
        fetchUser(user.id);
      } else {
        showToast(`❌ ${data.error}`, 'error');
      }
    } catch (e: any) {
      if (e.name === 'TypeError' && e.message === 'Failed to fetch') {
        showToast("❌ فشل الاتصال بالخادم (تأكد من اتصالك بالإنترنت)", 'error');
      } else {
        showToast("❌ فشل الاتصال بالخادم", 'error');
      }
    }
  };

  const fetchSiteSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) return;
      const data = await res.json();
      setSiteSettings(Array.isArray(data) ? data : []);
    } catch (e) { console.error("Fetch settings error:", e); }
  };

  // جلب سعر الصرف من قاعدة البيانات — المصدر الوحيد للسعر
  const fetchSypRate = async (): Promise<number | null> => {
    try {
      const res = await fetch("/api/syp-rate");
      if (!res.ok) return null;
      const data = await res.json();
      const rate = data?.rate;
      if (rate && !isNaN(Number(rate)) && Number(rate) > 0) {
        const parsed = parseFloat(String(rate));
        setSypRate(parsed);
        const now = new Date().toLocaleTimeString("ar-SY", { hour: "2-digit", minute: "2-digit" });
        setSypRateUpdatedAt(now);
        return parsed;
      }
      return null;
    } catch (e) { return null; }
  };

  // جلب السعر الحي من الموقع الخارجي وإرساله للـ DB — ثم تحديث الواجهة من DB
  const fetchAndStoreSypRateFromBrowser = async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      let liveRate: number | null = null;
      try {
        const res = await fetch("https://sse.sp-today.com/snapshot", { signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) {
          const json = await res.json();
          const buyRaw = json?.data?.currencies?.["USD:damascus"]?.buy;
          if (buyRaw && !isNaN(Number(buyRaw))) {
            const r = parseFloat((Number(buyRaw) / 100).toFixed(2));
            if (r > 0) liveRate = r;
          }
        }
      } catch (_) { clearTimeout(timeout); }

      if (liveRate !== null) {
        // أرسل السعر الجديد للـ DB
        try {
          const postRes = await fetch("/api/syp-rate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rate: liveRate }),
          });
          if (postRes.ok) {
            // بعد الحفظ اجلب من DB لضمان تطابق الواجهة مع ما هو مخزون فعلاً
            await fetchSypRate();
            return;
          }
        } catch (_) {}
      }

      // fallback: اجلب ما هو موجود في DB حالياً
      await fetchSypRate();
    } catch (e) {
      await fetchSypRate();
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
      const res = await fetch(`/api/orders/user/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` }
      });
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

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("authToken") || "";
      const res = await fetch(`/api/transactions/user/${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
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
  }, [user]);

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
      primary: "bg-[var(--brand)]",
      primaryHover: "hover:bg-[var(--brand-dark)]",
      text: "text-[var(--brand)]",
      textDark: "text-[var(--brand-dark)]",
      bgLight: "bg-red-50",
      border: "border-red-100",
      shadow: "shadow-red-100",
      gradient: "from-[var(--brand)] to-[var(--brand-dark)]",
      icon: "text-[var(--brand)]",
      button: "bg-[var(--brand)]",
      buttonHover: "hover:bg-[var(--brand-dark)]"
    };
  };

  const theme = getTheme();

  // دالة تنسيق السعر حسب العملة المختارة
  const fmtPrice = (usd: number, decimals?: number) => {
    if (currency === "SYP") {
      if (sypRate === 0) return "...";
      return `${Math.round(usd * sypRate).toLocaleString("en-US")} ل.س`;
    }
    return `${usd.toFixed(decimals !== undefined ? decimals : 2)} $`;
  };

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
          <img loading="lazy" 
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
          <div className="relative flex items-center select-none">
            <span
              className={`font-bold cursor-pointer ${theme.textDark}`}
              onMouseDown={() => { if (currency === "SYP") setShowRateTooltip(true); }}
              onMouseUp={() => setShowRateTooltip(false)}
              onMouseLeave={() => setShowRateTooltip(false)}
              onTouchStart={() => { if (currency === "SYP") setShowRateTooltip(true); }}
              onTouchEnd={() => setShowRateTooltip(false)}
            >
              {currency === "SYP"
                ? (sypRate === 0 ? "..." : `${Math.round(user.balance * sypRate).toLocaleString("en-US")} ل.س`)
                : `${user.balance.toFixed(2)} $`}
            </span>
            {showRateTooltip && currency === "SYP" && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-gray-900 text-white rounded-xl px-3 py-2 shadow-xl text-center whitespace-nowrap pointer-events-none"
                style={{ fontSize: "11px", minWidth: "160px" }}>
                <p className="font-bold text-yellow-300 text-xs mb-0.5">
                  {sypRate > 0 ? `1$ = ${sypRate.toLocaleString("en-US")} ل.س` : "جاري تحميل السعر..."}
                </p>
                {sypRateUpdatedAt && sypRate > 0 && <p className="text-gray-300 text-[10px]">آخر تحديث: {sypRateUpdatedAt}</p>}
                <p className="text-gray-400 text-[9px] mt-0.5">* السعر بالليرة السورية الجديدة</p>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
              </div>
            )}
          </div>
        )}
        <div className="relative inline-flex">
          <button onClick={() => setNotificationsOpen(true)} className="p-2 hover:bg-gray-50 rounded-full">
            <Bell size={22} className="text-gray-600" />
          </button>
          {(Array.isArray(notifications) ? notifications : []).filter(n => !n.is_read).length > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-white flex items-center justify-center pointer-events-none z-10">
              <span className="text-white text-[9px] font-bold leading-none px-0.5">
                {(Array.isArray(notifications) ? notifications : []).filter(n => !n.is_read).length > 9 ? "9+" : (Array.isArray(notifications) ? notifications : []).filter(n => !n.is_read).length}
              </span>
            </span>
          )}
        </div>
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
              <div className="flex items-center gap-2">
                {(Array.isArray(notifications) ? notifications : []).some(n => !n.is_read) && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs font-bold text-brand bg-brand-light px-3 py-1.5 rounded-full"
                  >
                    تمييز الكل كمقروء
                  </button>
                )}
                <button onClick={() => setNotificationsOpen(false)} className="p-2 bg-gray-100 rounded-full">
                  <XCircle size={20} className="text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {notifications.length > 0 ? (
                (Array.isArray(notifications) ? notifications : []).map(notif => (
                  <div 
                    key={notif.id} 
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${notif.is_read ? 'opacity-60' : 'shadow-sm'} ${
                      notif.type === 'warning' ? 'bg-amber-50 border-amber-100' : 
                      notif.type === 'success' ? 'bg-brand-light border-brand-soft' : 'bg-blue-50 border-blue-100'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-bold ${
                        notif.type === 'warning' ? 'text-amber-800' : 
                        notif.type === 'success' ? 'text-brand' : 'text-blue-800'
                      }`}>{notif.title}</h4>
                      <div className="flex items-center gap-1.5 flex-shrink-0 mr-2">
                        {notif.created_at && <span className="text-[9px] text-gray-400">{new Date(notif.created_at).toLocaleTimeString("ar-EG")}</span>}
                        {!notif.is_read && (
                          <button
                            onClick={(e) => { e.stopPropagation(); markNotificationRead(notif.id); }}
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              notif.type === 'warning' ? 'bg-amber-200 text-amber-800' :
                              notif.type === 'success' ? 'bg-brand text-white' : 'bg-blue-200 text-blue-800'
                            }`}
                          >
                            ✓ مقروء
                          </button>
                        )}
                      </div>
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
                    {(() => {
                      const urlMatch = (notif.message || '').match(/https:\/\/[^\s]+/);
                      if (!urlMatch) return null;
                      return (
                        <button
                          onClick={(e) => { e.stopPropagation(); window.open(urlMatch[0], '_blank', 'noopener,noreferrer'); }}
                          className={`mt-3 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-sm ${
                            notif.type === 'warning' ? 'bg-amber-600 text-white' :
                            notif.type === 'success' ? 'bg-brand text-white' : 'bg-blue-600 text-white'
                          }`}
                        >
                          <ExternalLink size={12} />
                          فتح الرابط
                        </button>
                      );
                    })()}
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

  const BottomNav = () => {
    const pendingOrders = orders.filter((o: any) => o.status === "pending" || o.status === "pending_admin" || o.status === "processing").length;
    const unreadMsgs = user?.unread_support_count || 0;
    return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around z-40">
      <button 
        onClick={() => { setCheckoutOrderResult(null); setActiveTab("home"); setView({ type: "main" }); setViewHistory([]); }}
        className={`flex flex-col items-center gap-1 ${activeTab === "home" ? theme.text : "text-gray-400"}`}
      >
        <Home size={22} />
        <span className="text-[10px] font-medium">الرئيسية</span>
      </button>
      <button 
        onClick={() => { setCheckoutOrderResult(null); setActiveTab("wallet"); }}
        className={`flex flex-col items-center gap-1 ${activeTab === "wallet" ? theme.text : "text-gray-400"}`}
      >
        <Wallet size={22} />
        <span className="text-[10px] font-medium">شحن</span>
      </button>
      <button 
        onClick={() => { setCheckoutOrderResult(null); setActiveTab("orders"); }}
        className={`flex flex-col items-center gap-1 ${activeTab === "orders" ? theme.text : "text-gray-400"}`}
      >
        <div className="relative">
          <ShoppingBag size={22} />
          {pendingOrders > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center leading-none border-2 border-white z-10">
              {pendingOrders > 9 ? "9+" : pendingOrders}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium">الطلبات</span>
      </button>
      <button 
        onClick={() => { setCheckoutOrderResult(null); setActiveTab("profile"); }}
        className={`flex flex-col items-center gap-1 ${activeTab === "profile" ? theme.text : "text-gray-400"}`}
      >
        <div className="relative">
          <User size={22} />
          {unreadMsgs > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center leading-none border-2 border-white z-10">
              {unreadMsgs > 9 ? "9+" : unreadMsgs}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium">حسابي</span>
      </button>
    </nav>
    );
  };

  const Drawer = () => {
    const whatsappLink = siteSettings?.find((s: any) => s.key === "support_whatsapp")?.value || "https://chat.whatsapp.com/DELXtdEh9ua5edFTupESNU";

    return (
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
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed top-0 right-0 bottom-0 w-72 z-50 shadow-2xl flex flex-col ${isDarkMode ? "bg-zinc-900 text-white" : "bg-white text-gray-800"}`}
          >
            {/* ===== رأس القائمة — معلومات الحساب ===== */}
            <div className={`${theme.primary} p-5 pt-10`}>
              {user ? (
                <div className="flex items-center gap-3">
                  {/* صورة الحساب */}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center flex-shrink-0 border-2 border-white/30">
                    {user.avatar_url
                      ? <img loading="lazy" src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      : <User size={28} className="text-white" />
                    }
                  </div>
                  {/* بيانات الحساب */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{user.name}</p>
                    <p className="text-white/75 text-[11px] truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">#{user.id}</span>
                      <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Wallet size={9} /> {user.balance?.toFixed(2) ?? "0.00"} $
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                    <User size={26} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">زائر</p>
                    <p className="text-white/70 text-xs">سجل الدخول للمزيد</p>
                  </div>
                </div>
              )}
            </div>

            {/* ===== قائمة العناصر ===== */}
            <div className="flex-1 overflow-y-auto py-2">

              {/* ===== اختيار العملة ===== */}
              <div className="px-4 pt-3 pb-1">
                <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm"
                  style={{ background: "linear-gradient(135deg, #f5d485, #f0c030)", color: "#4a2e00" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-base">💱</span>
                    <span>العملة</span>
                  </div>
                  <select
                    value={currency}
                    onChange={(e) => {
                      const next = e.target.value as "USD" | "SYP";
                      setCurrency(next);
                      localStorage.setItem("currency", next);
                    }}
                    className="border-0 rounded-lg px-3 py-1 font-black text-sm cursor-pointer outline-none"
                    style={{ background: "rgba(255,255,255,0.45)", color: "#4a2e00" }}
                  >
                    <option value="USD">$</option>
                    <option value="SYP">ل.س</option>
                  </select>
                </div>
              </div>


              {user && (
                <>
                  <DrawerItem icon={<History size={18} />}    label="دفعاتي"      onClick={() => { setActiveTab("profile"); setView({ type: "payments" }); setIsDrawerOpen(false); }} />
                  <DrawerItem icon={<ShoppingBag size={18} />} label="طلباتي"     onClick={() => { setActiveTab("orders"); setView({ type: "main" }); setIsDrawerOpen(false); }} />
                  <DrawerItem icon={<Wallet size={18} />}     label="شحن الرصيد"  onClick={() => { setActiveTab("wallet"); setView({ type: "main" }); setIsDrawerOpen(false); }} />
                  <DrawerItem icon={<Star size={18} />}       label="المفضلة"     onClick={() => { setActiveTab("home"); setView({ type: "main" }); setHomeSortMode("favorites"); setIsDrawerOpen(false); }} />

                  <div className={`my-2 mx-4 border-t ${isDarkMode ? "border-zinc-700" : "border-gray-100"}`} />

                  <DrawerItem icon={<Trophy size={18} />}     label="الترتيب"     onClick={() => { setActiveTab("profile"); setView({ type: "leaderboard" }); setIsDrawerOpen(false); }} />
                  <DrawerItem icon={<Gift size={18} />}       label="الإحالة"     onClick={() => { setActiveTab("profile"); setView({ type: "referral" }); setIsDrawerOpen(false); }} />

                  <div className={`my-2 mx-4 border-t ${isDarkMode ? "border-zinc-700" : "border-gray-100"}`} />

                  <DrawerItem icon={<Headphones size={18} />} label="الدعم الفني"  onClick={() => { setActiveTab("profile"); setView({ type: "chat" }); setIsDrawerOpen(false); }} />

                  {/* واتساب */}
                  <button
                    onClick={() => { window.open(whatsappLink, "_blank"); setIsDrawerOpen(false); }}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 transition-colors ${isDarkMode ? "hover:bg-zinc-800" : "hover:bg-gray-50"}`}
                  >
                    <span className="text-green-500">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </span>
                    <span className="font-medium text-sm">دعم واتساب</span>
                  </button>

                  <DrawerItem icon={<Shield size={18} />}     label="سياسة الخصوصية" onClick={() => { setActiveTab("profile"); setView({ type: "privacy_policy" }); setIsDrawerOpen(false); }} />

                  {/* ربط تلجرام */}
                  <button
                    onClick={() => {
                      if (user?.telegram_chat_id) {
                        handleUnlinkTelegram();
                      } else {
                        handleGenerateLinkingCode();
                      }
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 transition-colors ${isDarkMode ? "hover:bg-zinc-800" : "hover:bg-gray-50"}`}
                  >
                    <span className={user?.telegram_chat_id ? "text-blue-500" : "text-orange-400"}>
                      <MessageSquare size={18} />
                    </span>
                    <span className="font-medium text-sm flex-1 text-right">
                      {user?.telegram_chat_id ? "تلجرام مرتبط ✓" : "ربط تلجرام"}
                    </span>
                    {user?.telegram_chat_id && (
                      <span className="text-[10px] text-red-400 font-bold">فك الربط</span>
                    )}
                  </button>

                  <div className={`my-2 mx-4 border-t ${isDarkMode ? "border-zinc-700" : "border-gray-100"}`} />
                </>
              )}

              {/* الوضع الليلي / النهاري */}
              <div className={`flex items-center justify-between px-5 py-3.5 ${isDarkMode ? "hover:bg-zinc-800" : "hover:bg-gray-50"} transition-colors`}>
                <div className="flex items-center gap-4">
                  <span className={isDarkMode ? "text-yellow-400" : "text-gray-500"}>
                    {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                  </span>
                  <span className="font-medium text-sm">{isDarkMode ? "الوضع الليلي" : "الوضع النهاري"}</span>
                </div>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isDarkMode ? "bg-brand" : "bg-gray-200"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 flex items-center justify-center ${isDarkMode ? "right-1" : "left-1"}`}>
                    {isDarkMode ? <Moon size={9} className="text-brand" /> : <Sun size={9} className="text-yellow-500" />}
                  </div>
                </button>
              </div>

              {deferredPrompt && (
                <DrawerItem
                  icon={<Download size={18} />}
                  label="تثبيت التطبيق"
                  onClick={() => { handleInstallApp(); setIsDrawerOpen(false); }}
                  className="text-brand"
                />
              )}

              <div className={`my-2 mx-4 border-t ${isDarkMode ? "border-zinc-700" : "border-gray-100"}`} />

              {user ? (
                <DrawerItem icon={<LogOut size={18} />} label="تسجيل الخروج" onClick={handleLogout} className="text-red-500" />
              ) : (
                <DrawerItem icon={<ArrowRight size={18} />} label="تسجيل الدخول" onClick={() => { setView({ type: "login" }); setIsDrawerOpen(false); }} />
              )}
            </div>

            <div className={`p-3 text-center text-[10px] border-t ${isDarkMode ? "text-zinc-500 border-zinc-700" : "text-gray-300 border-gray-100"}`}>
              vipro store · الإصدار 1.3
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    );
  };

  const DrawerItem = ({ icon, label, onClick, className = "" }: any) => (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-3.5 transition-colors text-sm font-medium ${isDarkMode ? "hover:bg-zinc-800" : "hover:bg-gray-50"} ${className}`}>
      <span className={className ? "" : isDarkMode ? "text-zinc-400" : "text-gray-500"}>{icon}</span>
      <span>{label}</span>
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
          <div className={`aspect-[3/1] bg-gray-100 rounded-2xl overflow-hidden relative shadow-lg ${theme.shadow}`}>
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

      {/* Categories / Most Purchased / Favorites */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">
            {homeSortMode === "categories" ? "الأقسام الرئيسية" : homeSortMode === "most_purchased" ? "أكثر المنتجات شراءً" : "مفضلاتي"}
          </h3>
          {/* Custom Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(v => !v)}
              className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full border ${theme.border} ${theme.text} bg-white shadow-sm`}
            >
              {homeSortMode === "categories" ? "الأقسام" : homeSortMode === "most_purchased" ? "الأكثر شراءً" : "المفضلة"}
              <ChevronDown size={14} className={`transition-transform ${showSortDropdown ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {showSortDropdown && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowSortDropdown(false)}
                    className="fixed inset-0 z-40"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -6 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute left-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-w-[160px]"
                  >
                    {[
                      { value: "categories", label: "الأقسام الرئيسية", icon: "🗂" },
                      { value: "most_purchased", label: "الأكثر شراءً", icon: "🔥" },
                      { value: "favorites", label: "مفضلاتي", icon: "⭐" },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          const v = opt.value as any;
                          setHomeSortMode(v);
                          if (v === "most_purchased") fetchMostPurchased();
                          setShowSortDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-right transition-colors ${
                          homeSortMode === opt.value
                            ? `${theme.bgLight} ${theme.text}`
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-base">{opt.icon}</span>
                        <span className="flex-1 text-right">{opt.label}</span>
                        {homeSortMode === opt.value && <span className={`w-2 h-2 rounded-full ${theme.button}`} />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ===== CATEGORIES VIEW ===== */}
        {homeSortMode === "categories" && (
          <div className="grid grid-cols-3 gap-3">
            {categories.length === 0 ? (
              [1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-gray-100 rounded-xl overflow-hidden animate-pulse">
                  <div className="w-full aspect-square bg-gray-200" />
                  <div className="h-4 bg-gray-200 mx-2 my-2 rounded-full" />
                </div>
              ))
            ) : categories.map(cat => {
              const favKey = `cat_${cat.id}`;
              let longPressTimer: any = null;
              return (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  key={cat.id}
                  onClick={async () => {
                    setPageLoading(true);
                    await fetchSubcategories(cat.id);
                    navigateTo({ type: "subcategories", id: cat.id, data: cat.name });
                    setPageLoading(false);
                  }}
                  onContextMenu={e => e.preventDefault()}
                  onTouchStart={e => {
                    const touch = e.touches[0];
                    longPressTimer = setTimeout(() => {
                      useLongPressHandlers({ ...cat, _fav_key: favKey, _fav_type: "category", _fav_label: cat.name, _fav_image: cat.image_url }, e);
                    }, 600);
                  }}
                  onTouchEnd={() => clearTimeout(longPressTimer)}
                  onTouchMove={() => clearTimeout(longPressTimer)}
                  onMouseDown={e => {
                    longPressTimer = setTimeout(() => {
                      useLongPressHandlers({ ...cat, _fav_key: favKey, _fav_type: "category", _fav_label: cat.name, _fav_image: cat.image_url }, e);
                    }, 600);
                  }}
                  onMouseUp={() => clearTimeout(longPressTimer)}
                  onMouseLeave={() => clearTimeout(longPressTimer)}
                  className={`bg-white rounded-xl border ${isFavorite(favKey) ? "border-yellow-400" : "border-gray-100"} shadow-sm flex flex-col items-center overflow-hidden hover:${theme.border} transition-colors relative`}
                >
                  {isFavorite(favKey) && <span className="absolute top-1 right-1 text-yellow-400 text-xs">⭐</span>}
                  <div className="w-full aspect-square overflow-hidden bg-gray-50">
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      draggable={false}
                      onDragStart={e => e.preventDefault()}
                    />
                  </div>
                  <span className="font-bold text-gray-700 text-[10px] text-center w-full px-1 py-1.5 leading-tight">{cat.name}</span>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* ===== MOST PURCHASED VIEW ===== */}
        {homeSortMode === "most_purchased" && (
          <div className="grid grid-cols-3 gap-3">
            {mostPurchasedLoading ? (
              [1,2,3,4,5,6,7,8,9].map(i => (
                <div key={i} className="bg-gray-100 rounded-xl overflow-hidden animate-pulse">
                  <div className="w-full aspect-square bg-gray-200" />
                  <div className="h-4 bg-gray-200 mx-2 my-2 rounded-full" />
                </div>
              ))
            ) : mostPurchased.length === 0 ? (
              <div className="col-span-3 text-center text-gray-400 py-10 text-sm">لا توجد بيانات بعد</div>
            ) : mostPurchased.slice(0, 9).map((prod: any) => (
              <motion.div
                whileTap={{ scale: 0.95 }}
                key={prod.id}
                onClick={() => {
                  if (!user) return navigateTo({ type: "login" });
                  if (prod.store_type === 'quick_order') {
                    navigateTo({ type: "quick_order", data: prod, fromMostPurchased: true });
                  } else {
                    setCheckoutQuantity(parseInt(String(prod.min_quantity)) || 0);
                    navigateTo({ type: "checkout", data: prod, fromMostPurchased: true });
                  }
                }}
                className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center overflow-hidden cursor-pointer"
              >
                <div className="w-full aspect-square overflow-hidden bg-gray-50">
                  <img
                    src={prod.image_url || ""}
                    alt={prod.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    draggable={false}
                    onDragStart={e => e.preventDefault()}
                    onContextMenu={e => e.preventDefault()}
                  />
                </div>
                <div className="w-full px-1 py-1.5">
                  <p className="font-bold text-gray-700 text-[10px] text-center leading-tight truncate">{prod.name}</p>
                  <p className={`${theme.text} text-[10px] text-center font-bold`}>{fmtPrice(parseFloat(prod.price || 0))}</p>
                  <p className="text-gray-400 text-[9px] text-center">🛒 تم شراؤه {prod.purchase_count} {prod.purchase_count === 1 ? "مرة" : "مرات"}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ===== FAVORITES VIEW ===== */}
        {homeSortMode === "favorites" && (
          <div>
            {favorites.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Star size={40} className="mx-auto mb-3 text-gray-200" />
                <p className="text-sm">لا توجد مفضلات بعد</p>
                <p className="text-xs mt-1">اضغط مطولاً على أي قسم أو منتج لإضافته</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {favorites.slice(0, 9).map((fav: any) => (
                  <div key={fav._fav_key} className="relative">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        // Reset history when coming from favorites - start fresh from main
                        setViewHistory([{ type: "main" }]);
                        if (fav._fav_type === "category") {
                          setPageLoading(true);
                          await fetchSubcategories(fav.id);
                          const nextView = { type: "subcategories", id: fav.id, data: fav.name, fromFav: true };
                          setViewHistory([{ type: "main" }, nextView]);
                          setView(nextView);
                          setPageLoading(false);
                        } else if (fav._fav_type === "subcategory") {
                          setPageLoading(true);
                          const subSubs = await fetchSubSubCategories(fav.id);
                          await fetchProducts(fav.id);
                          if (subSubs.length > 0) {
                            const nextView = { type: "sub_sub_categories", id: fav.id, data: fav.name, catId: fav.category_id, fromFav: true };
                            setViewHistory([{ type: "main" }, nextView]);
                            setView(nextView);
                          } else {
                            const nextView = { type: "products", id: fav.id, data: fav.name, fromSubSub: false, catId: fav.category_id, fromFav: true };
                            setViewHistory([{ type: "main" }, nextView]);
                            setView(nextView);
                          }
                          setPageLoading(false);
                        } else if (fav._fav_type === "sub_sub_category") {
                          setPageLoading(true);
                          await fetchProducts(fav.id, true);
                          const nextView = { type: "products", id: fav.id, data: fav.name, fromSubSub: true, catId: fav.category_id, subId: fav.subcategory_id, fromFav: true };
                          setViewHistory([{ type: "main" }, nextView]);
                          setView(nextView);
                          setPageLoading(false);
                        } else if (fav._fav_type === "product") {
                          setPageLoading(true);
                          const subId = fav._view_id;
                          const isSubSub = fav._view_fromSubSub ?? true;
                          await fetchProducts(subId, isSubSub);
                          const prodListView = {
                            type: "products",
                            id: subId,
                            data: fav._view_data,
                            fromSubSub: isSubSub,
                            catId: fav._view_catId,
                            subId: fav._view_subId,
                            subName: fav._view_subName,
                            fromFav: true,
                          };
                          setViewHistory([{ type: "main" }, prodListView]);
                          setView(prodListView);
                          setPageLoading(false);
                          setTimeout(() => {
                            if (!user) return setView({ type: "login" });
                            if (fav.store_type === 'quick_order') {
                              setView({ type: "quick_order", data: fav });
                            } else {
                              setCheckoutQuantity(parseInt(String(fav.min_quantity)) || 0);
                              setView({ type: "checkout", data: fav });
                            }
                          }, 150);
                        }
                      }}
                      className="w-full bg-white rounded-xl border border-yellow-300 shadow-sm flex flex-col items-center overflow-hidden"
                      onContextMenu={e => e.preventDefault()}
                    >
                      <div className="w-full aspect-square overflow-hidden bg-gray-50 relative">
                        <img
                          src={fav._fav_image || ""}
                          alt={fav._fav_label}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          draggable={false}
                          onDragStart={e => e.preventDefault()}
                          onContextMenu={e => e.preventDefault()}
                        />
                        <span className="absolute top-1 right-1 text-yellow-400 text-xs">⭐</span>
                      </div>
                      <span className="font-bold text-gray-700 text-[10px] text-center w-full px-1 py-1.5 leading-tight truncate">{fav._fav_label}</span>
                    </motion.button>
                    <button
                      onClick={() => removeFromFavorites(fav._fav_key)}
                      className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] z-10"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
                    <img loading="lazy" src={offer.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
        <button onClick={navigateBack} className="p-2 bg-gray-100 rounded-full">
          <ArrowRight size={20} className="text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">{view.data}</h2>
      </div>
      {subcategories.length === 0 && pageLoading ? (
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-gray-100 rounded-xl overflow-hidden animate-pulse">
              <div className="w-full aspect-square bg-gray-200" />
              <div className="h-4 bg-gray-200 mx-2 my-2 rounded-full" />
            </div>
          ))}
        </div>
      ) : subcategories.length === 0 ? (
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
        <div className="grid grid-cols-3 gap-3">
          {subcategories.map(sub => {
            const favKey = `sub_${sub.id}`;
            let lpTimer: any = null;
            return (
              <motion.button
                whileTap={{ scale: 0.95 }}
                key={sub.id}
                onClick={async () => {
                  setPageLoading(true);
                  const subSubs = await fetchSubSubCategories(sub.id);
                  await fetchProducts(sub.id);
                  if (subSubs.length > 0) {
                    navigateTo({ type: "sub_sub_categories", id: sub.id, data: sub.name, catId: view.id });
                  } else {
                    navigateTo({ type: "products", id: sub.id, data: sub.name, fromSubSub: false });
                  }
                  setPageLoading(false);
                }}
                onContextMenu={e => e.preventDefault()}
                onTouchStart={e => { lpTimer = setTimeout(() => useLongPressHandlers({ ...sub, _fav_key: favKey, _fav_type: "subcategory", _fav_label: sub.name, _fav_image: sub.image_url, category_id: view.id }, e), 600); }}
                onTouchEnd={() => clearTimeout(lpTimer)}
                onTouchMove={() => clearTimeout(lpTimer)}
                onMouseDown={e => { lpTimer = setTimeout(() => useLongPressHandlers({ ...sub, _fav_key: favKey, _fav_type: "subcategory", _fav_label: sub.name, _fav_image: sub.image_url, category_id: view.id }, e), 600); }}
                onMouseUp={() => clearTimeout(lpTimer)}
                onMouseLeave={() => clearTimeout(lpTimer)}
                className={`bg-white rounded-2xl border ${isFavorite(favKey) ? "border-yellow-400" : "border-gray-100"} shadow-sm flex flex-col items-center overflow-hidden active:scale-95 transition-transform relative`}
              >
                {isFavorite(favKey) && <span className="absolute top-1 right-1 text-yellow-400 text-xs z-10">⭐</span>}
                <div className="w-full aspect-square overflow-hidden bg-gray-50">
                  <img
                    src={sub.image_url || "https://picsum.photos/seed/sub/100/100"}
                    alt={sub.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    draggable={false}
                    onDragStart={e => e.preventDefault()}
                    onContextMenu={e => e.preventDefault()}
                  />
                </div>
                <span className="font-bold text-gray-700 text-[9px] text-center w-full px-1 py-1.5 leading-tight">{sub.name}</span>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );

  const SubSubCategoriesView = () => {
    const directProducts = products.filter(p => !p.sub_sub_category_id);
    return (
      <div className="px-4 space-y-4 pb-20">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={navigateBack} className="p-2 bg-gray-100 rounded-full">
            <ArrowRight size={20} className="text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">{view.data}</h2>
        </div>

        {/* Sub-sub-categories */}
        {subSubCategories.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {subSubCategories.map(ss => {
              const favKey = `sss_${ss.id}`;
              let lpTimer2: any = null;
              return (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  key={ss.id}
                  onClick={async () => {
                    setPageLoading(true);
                    await fetchProducts(ss.id, true);
                    navigateTo({ type: "products", id: ss.id, data: ss.name, fromSubSub: true, subId: view.id, subName: view.data, catId: view.catId, fromFav: view.fromFav });
                    setPageLoading(false);
                  }}
                  onContextMenu={e => e.preventDefault()}
                  onTouchStart={e => { lpTimer2 = setTimeout(() => useLongPressHandlers({ ...ss, _fav_key: favKey, _fav_type: "sub_sub_category", _fav_label: ss.name, _fav_image: ss.image_url, category_id: view.catId, subcategory_id: view.id }, e), 600); }}
                  onTouchEnd={() => clearTimeout(lpTimer2)}
                  onTouchMove={() => clearTimeout(lpTimer2)}
                  onMouseDown={e => { lpTimer2 = setTimeout(() => useLongPressHandlers({ ...ss, _fav_key: favKey, _fav_type: "sub_sub_category", _fav_label: ss.name, _fav_image: ss.image_url, category_id: view.catId, subcategory_id: view.id }, e), 600); }}
                  onMouseUp={() => clearTimeout(lpTimer2)}
                  onMouseLeave={() => clearTimeout(lpTimer2)}
                  className={`bg-white rounded-2xl border ${isFavorite(favKey) ? "border-yellow-400" : "border-gray-100"} shadow-sm flex flex-col items-center overflow-hidden active:scale-95 transition-transform relative`}
                >
                  {isFavorite(favKey) && <span className="absolute top-1 right-1 text-yellow-400 text-xs z-10">⭐</span>}
                  <div className="w-full aspect-square overflow-hidden bg-gray-50">
                    <img
                      src={ss.image_url || "https://picsum.photos/seed/ss/100/100"}
                      alt={ss.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      draggable={false}
                      onDragStart={e => e.preventDefault()}
                      onContextMenu={e => e.preventDefault()}
                    />
                  </div>
                  <span className="font-bold text-gray-700 text-[9px] text-center w-full px-1 py-1.5 leading-tight">{ss.name}</span>
                </motion.button>
              );
            })}
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
                      <img loading="lazy" src={prod.image_url || "https://picsum.photos/seed/prod/100/100"} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{prod.name}</h4>
                      <p className={`${theme.text} font-bold`}>
                        {prod.store_type === 'quantities'
                          ? fmtPrice(parseFloat(prod.price_per_unit as any) || 0, 6) + " / وحدة"
                          : fmtPrice(parseFloat(prod.price as any) || 0)}
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
        <button onClick={navigateBack} className="p-2 bg-gray-100 rounded-full">
          <ArrowRight size={20} className="text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">{view.data}</h2>
      </div>
      {products.length === 0 && pageLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 flex gap-4 animate-pulse shadow-sm">
              <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 bg-gray-200 rounded-full w-3/4" />
                <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                <div className="h-3 bg-gray-100 rounded-full w-2/3" />
                <div className="h-8 bg-gray-200 rounded-xl w-1/3 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
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
        <div className="grid grid-cols-1 gap-3">
          {products.map(prod => {
            const isUnavailable = prod.available === false;
            const isApi = prod.store_type === 'external_api';
            const isQuantity = prod.store_type === 'quantities';
            const isQuick = prod.store_type === 'quick_order';
            let lpTimerProd: any = null;
            const typeLabel = isApi ? 'تلقائي' : isQuick ? 'سريع' : isQuantity ? 'كمية' : 'يدوي';
            const typeBg = isApi ? 'bg-blue-500' : isQuick ? 'bg-purple-500' : isQuantity ? 'bg-teal-500' : 'bg-gray-500';
            return (
            <div
              key={prod.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all relative ${isUnavailable ? "border-gray-100 opacity-60 grayscale" : isFavorite(`prod_${prod.id}`) ? "border-yellow-400" : "border-gray-100"}`}
              style={{ aspectRatio: '3/1' }}
              onContextMenu={e => e.preventDefault()}
              onTouchStart={e => { lpTimerProd = setTimeout(() => useLongPressHandlers({ ...prod, _fav_key: `prod_${prod.id}`, _fav_type: "product", _fav_label: prod.name, _fav_image: prod.image_url, _view_id: view.id, _view_data: view.data, _view_fromSubSub: view.fromSubSub, _view_catId: view.catId, _view_subId: view.subId, _view_subName: view.subName }, e), 600); }}
              onTouchEnd={() => clearTimeout(lpTimerProd)}
              onTouchMove={() => clearTimeout(lpTimerProd)}
              onMouseDown={e => { lpTimerProd = setTimeout(() => useLongPressHandlers({ ...prod, _fav_key: `prod_${prod.id}`, _fav_type: "product", _fav_label: prod.name, _fav_image: prod.image_url, _view_id: view.id, _view_data: view.data, _view_fromSubSub: view.fromSubSub, _view_catId: view.catId, _view_subId: view.subId, _view_subName: view.subName }, e), 600); }}
              onMouseUp={() => clearTimeout(lpTimerProd)}
              onMouseLeave={() => clearTimeout(lpTimerProd)}
            >
              <div className="flex h-full" dir="rtl">
                {/* Right: Product Image 1:1 */}
                <div className="relative shrink-0 h-full" style={{ aspectRatio: '1/1' }}>
                  <img
                    loading="lazy"
                    src={prod.image_url || "https://picsum.photos/seed/prod/300/300"}
                    alt={prod.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {/* Type badge */}
                  <span className={`absolute top-2 right-2 ${typeBg} text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm`}>
                    {typeLabel}
                  </span>
                  {/* Favorite star */}
                  {isFavorite(`prod_${prod.id}`) && (
                    <span className="absolute top-2 left-2 text-yellow-400 text-sm drop-shadow">⭐</span>
                  )}
                </div>

                {/* Middle: Name, Description, Price — close to image */}
                <div className="flex flex-col justify-center px-3 py-2 min-w-0 overflow-hidden items-start shrink-0 max-w-[45%]">
                  <h4 className="font-bold text-gray-800 text-sm truncate w-full">{prod.name}</h4>
                  {prod.description && (
                    <p className="text-gray-400 text-[11px] leading-snug mt-0.5 line-clamp-2">{prod.description}</p>
                  )}
                  <p className={`${isUnavailable ? "text-gray-400" : theme.text} font-bold text-sm mt-1`}>
                    {isQuantity
                      ? fmtPrice(parseFloat(prod.price_per_unit) || 0, 6) + " / وحدة"
                      : fmtPrice(parseFloat(prod.price) || 0)}
                  </p>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Left: Buy Button */}
                <div className="flex flex-col items-center justify-center px-3 shrink-0">
                  <button
                    disabled={isUnavailable}
                    onClick={() => {
                      if (isUnavailable) return;
                      if (!user) return setView({ type: "login" });
                      if (isQuick) {
                        setView({ type: "quick_order", data: prod });
                      } else {
                        setCheckoutQuantity(parseInt(String(prod.min_quantity)) || 0);
                        setView({ type: "checkout", data: prod });
                      }
                    }}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors whitespace-nowrap ${isUnavailable ? "bg-gray-100 text-gray-400 cursor-not-allowed" : `${theme.button} text-white ${theme.buttonHover}`}`}
                  >
                    {isUnavailable ? "—" : isQuick ? "طلب" : isApi ? "⚡ شراء" : "شراء"}
                  </button>
                </div>
              </div>

              {/* Unavailable overlay */}
              {isUnavailable && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                  <span className="bg-white/90 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">غير متوفر</span>
                </div>
              )}
            </div>
            );
          })}
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
              {user?.is_vip && <p className="text-gray-400 line-through text-sm">{fmtPrice(prod.price)}</p>}
              <p className={`${theme.text} font-bold text-xl`}>{fmtPrice(finalPrice)}</p>
              {user?.is_vip && <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-bold mt-1">خصم VIP {siteSettings?.find((s:any)=>s.key==="vip_discount")?.value || "5"}%</span>}
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
              <p className="text-xl font-bold text-gray-800">{fmtPrice(finalPrice)}</p>
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
    const prod = view.data || (checkoutOrderResult?.prod);
    const qtyRef = React.useRef<HTMLInputElement>(null);
    const [displayQty, setDisplayQty] = React.useState<string>(
      (prod.store_type === 'quantities' || prod.store_type === 'external_api') ? (String(checkoutQuantity || prod.min_quantity || 1)) : "1"
    );
    const [extraInput, setExtraInput] = React.useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const orderResult = checkoutOrderResult;
    const setOrderResult = setCheckoutOrderResult;

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
      if (loading) return; // منع الضغط المزدوج
      const extraData = extraInput.trim();
      const quantity = parseFloat(qtyRef.current?.value || String(displayQty) || "1") || 1;
      if (prod.requires_input && !extraData) return setError("يرجى إدخال البيانات المطلوبة");
      if ((prod.store_type === 'quantities' || prod.store_type === 'external_api') && quantity < (prod.min_quantity || 1)) return setError(`أقل كمية مسموحة هي ${prod.min_quantity}`);
      if (prod.max_quantity && quantity > prod.max_quantity) return setError(`أكبر كمية مسموحة هي ${prod.max_quantity}`);
      setCheckoutQuantity(quantity);
      setLoading(true);
      try {
        // إذا المنتج خارجي وبدون حقل مدخل → نرسل رقم الهاتف تلقائياً كـ playerId
        const autoPlayerId = (prod.store_type === 'external_api' && !prod.requires_input)
          ? (user.phone || String(user.id))
          : extraData;

        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` },
          body: JSON.stringify({
            userId: user.id,
            productId: prod.id,
            quantity: quantity,
            extraData: {
              input: prod.requires_input ? extraData : autoPlayerId,
              playerId: prod.requires_input ? extraData : autoPlayerId,
              storeType: prod.store_type
            }
          })
        });
        const data = await res.json();
        if (data.success) {
          fetchUser(user.id);
          if (data.pendingAdmin) {
            setView({ type: "success", data: "تم استلام طلبك بنجاح! سيتم مراجعته والرد عليك قريباً." });
          } else if (prod.store_type === 'external_api') {
            setOrderResult({
              ...data,
              prod: prod,
              // نستخدم الـ externalOrderId الذي يعيده السيرفر (UUID أو numeric)
              externalOrderId: data.externalOrderId || null,
              externalStatus: data.externalStatus || "processing",
              replayApi: Array.isArray(data.replayApi) ? data.replayApi.map(String) : []
            });
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
      const statusMap: Record<string, { label: string; color: string; bg: string; icon: any }> = {
        accept:     { label: "✅ تم التنفيذ بنجاح", color: "text-green-700", bg: "bg-green-50 border-green-200", icon: <CheckCircle size={40} className="text-green-600" /> },
        completed:  { label: "✅ تم التنفيذ بنجاح", color: "text-green-700", bg: "bg-green-50 border-green-200", icon: <CheckCircle size={40} className="text-green-600" /> },
        processing: { label: "⏳ قيد المعالجة", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: <Clock size={40} className="text-amber-500" /> },
        pending:    { label: "⏳ قيد المعالجة", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: <Clock size={40} className="text-amber-500" /> },
        reject:     { label: "❌ تم الرفض", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: <XCircle size={40} className="text-red-500" /> },
        rejected:   { label: "❌ تم الرفض", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: <XCircle size={40} className="text-red-500" /> },
        cancelled:  { label: "❌ تم الرفض", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: <XCircle size={40} className="text-red-500" /> },
      };
      const s = statusMap[(orderResult.externalStatus || "").toLowerCase()] || statusMap["processing"];
      // نضمن أن كل code هو string حتى لا يحدث React Error #31
      const codes: string[] = (orderResult.replayApi || [])
        .map((x: any) => {
          if (!x) return null;
          if (typeof x === "string") return x.trim() || null;
          if (typeof x === "number") return String(x);
          if (typeof x === "object") {
            const v = x.replay ?? x.code ?? x.value ?? x.key ?? x.data ?? null;
            return v !== null ? String(v) : null;
          }
          return String(x);
        })
        .filter(Boolean) as string[];
      return (
        <div className="px-4 space-y-4 pb-20">
          <div className="flex items-center gap-2 pt-2">
            <button onClick={() => { setCheckoutOrderResult(null); setView({ type: "main" }); setActiveTab("home"); }} className="p-2 bg-gray-100 rounded-full">
              <ArrowRight size={20} className="text-gray-600" />
            </button>
            <h2 className="text-lg font-bold text-gray-800">تفاصيل الطلب</h2>
          </div>
          <div className="flex flex-col items-center py-4 gap-3">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-gray-100">
              {s.icon}
            </div>
            <h2 className="text-xl font-bold text-gray-800">تم إرسال الطلب!</h2>
            <p className="text-gray-400 text-sm">رقم الطلب: #{orderResult.orderId}</p>
          </div>

          <div className={`border rounded-2xl p-4 text-center font-bold text-base ${s.bg} ${s.color}`}>
            {s.label}
          </div>

          {/* بيانات التفعيل - تظهر فور توفرها */}
          {codes.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-bold text-green-800 flex items-center gap-2">
                <CheckCircle size={16} /> بيانات التفعيل
              </p>
              {codes.map((code: string, i: number) => (
                <div key={i} className="flex items-center justify-between gap-3 bg-white rounded-xl p-3 border border-green-100">
                  <p className="font-mono font-bold text-green-800 text-sm break-all">{code}</p>
                  <button
                    onClick={() => { navigator.clipboard.writeText(code); }}
                    className="shrink-0 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95 flex items-center gap-1"
                  ><Copy size={12} /> نسخ</button>
                </div>
              ))}
              <p className="text-xs text-green-600 text-center">احتفظ بهذه البيانات في مكان آمن</p>
            </div>
          )}

          {/* تتبع تلقائي إذا قيد المعالجة */}
          {(() => {
            const st = (orderResult.externalStatus || "").toLowerCase();
            const isFinal = st === "accept" || st === "completed" || st === "reject" || st === "rejected" || st === "cancelled";
            return !isFinal && orderResult.externalOrderId ? (
              <OrderPollingStatus
                externalOrderId={orderResult.externalOrderId}
                onStatusChange={(newStatus: string, replayApi: any[]) => {
                  setOrderResult((prev: any) => ({ ...prev, externalStatus: newStatus, replayApi }));
                  fetchOrders();
                }}
              />
            ) : null;
          })()}

          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">المبلغ المدفوع</span><span className="font-bold text-[var(--brand)]">{fmtPrice(finalPrice)}</span></div>
            {orderResult.externalOrderId && <div className="flex justify-between"><span className="text-gray-500">رقم الطلب الخارجي</span><span className="font-bold text-gray-700 text-xs">{orderResult.externalOrderId}</span></div>}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setCheckoutOrderResult(null); setView({ type: "main" }); setActiveTab("home"); }}
              className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold"
            >
              الرئيسية
            </button>
            <button
              onClick={() => { setCheckoutOrderResult(null); setActiveTab("orders"); setView({ type: "main" }); }}
              className={`flex-1 ${theme.button} text-white py-4 rounded-xl font-bold`}
            >
              عرض طلباتي
            </button>
          </div>
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
              <img loading="lazy" src={prod.image_url || "https://picsum.photos/seed/prod/100/100"} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800">{prod.name}</h4>
              <div className="flex items-center gap-2 flex-wrap">
                {user?.is_vip && <p className="text-gray-400 line-through text-xs">{fmtPrice(unitPrice)}</p>}
                <p className={`${theme.text} font-bold`}>{fmtPrice(unitPrice)}</p>
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
                {prod.min_quantity || prod.max_quantity ? ` (${prod.min_quantity ? `أقل: ${prod.min_quantity}` : ""}${prod.min_quantity && prod.max_quantity ? " — " : ""}${prod.max_quantity ? `أكثر: ${prod.max_quantity}` : ""})` : ""}
              </label>
              <input
                ref={qtyRef}
                type="number"
                min={prod.min_quantity || 1}
                max={prod.max_quantity || undefined}
                value={displayQty}
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
                type="tel"
                value={extraInput}
                onChange={(e) => setExtraInput(e.target.value)}
                placeholder="أدخل رقم هاتفك هنا..."
                className={`w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:${theme.border} transition-colors`}
              />
            </div>
          )}

          {/* حقل Player ID للمنتجات الخارجية (Ahminix) - فقط إذا كان requires_input = true */}
          {prod.store_type === 'external_api' && prod.requires_input && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                {prod.params?.[0] || "معرف اللاعب (Player ID)"} *
              </label>
              <input
                type="text"
                value={extraInput}
                onChange={(e) => setExtraInput(e.target.value)}
                placeholder={`أدخل ${prod.params?.[0] || "معرف اللاعب"} هنا...`}
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
                type="text"
                value={extraInput}
                onChange={(e) => setExtraInput(e.target.value)}
                placeholder="أدخل البيانات هنا..."
                className={`w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:${theme.border} transition-colors`}
              />
            </div>
          )}

          <div className="space-y-3 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">سعر الوحدة</span>
              <span className="font-bold">
                {(prod.store_type === 'quantities' || prod.store_type === 'external_api') ? fmtPrice(unitPrice, 6) : fmtPrice(unitPrice)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">الكمية</span>
              <span className="font-bold">{safeQty}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">المجموع الفرعي</span>
              <span className="font-bold">{fmtPrice(baseTotal)}</span>
            </div>
            {user?.is_vip && (
              <div className="flex justify-between text-sm text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
                <div className="flex items-center gap-1">
                  <Star size={14} fill="currentColor" />
                  <span>خصم VIP ({siteSettings?.find((s:any)=>s.key==="vip_discount")?.value || "5"}%)</span>
                </div>
                <span className="font-bold">- {fmtPrice(baseTotal * 0.05)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg border-t border-gray-100 pt-3 mt-2">
              <span className="font-bold text-gray-800">المبلغ النهائي</span>
              <div className="text-left">
                <span className={`font-bold ${theme.text} text-xl`}>{fmtPrice(finalPrice)}</span>
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

  const WalletView = () => (
    <WalletChargeView
      user={user}
      paymentMethods={paymentMethods}
      showToast={showToast}
      setView={setView}
      fetchUser={fetchUser}
      fetchTransactions={fetchTransactions}
    />
  );


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
                        <img loading="lazy" 
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
    const [filterStatus, setFilterStatus] = useState<'all'|'completed'|'failed'|'pending'>('all');

    const completedCount = orders.filter(o => o.status === 'completed').length;
    const failedCount    = orders.filter(o => o.status === 'failed' || o.status === 'cancelled').length;
    const pendingCount   = orders.filter(o => o.status !== 'completed' && o.status !== 'failed' && o.status !== 'cancelled').length;

    const filteredOrders = orders.filter(o => {
      if (filterStatus === 'all')       return true;
      if (filterStatus === 'completed') return o.status === 'completed';
      if (filterStatus === 'failed')    return o.status === 'failed' || o.status === 'cancelled';
      if (filterStatus === 'pending')   return o.status !== 'completed' && o.status !== 'failed' && o.status !== 'cancelled';
      return true;
    });

    const filters: { key: 'all'|'completed'|'failed'|'pending'; label: string; count?: number; color: string }[] = [
      { key: 'all',       label: 'الكل',         color: 'bg-gray-800 text-white' },
      { key: 'completed', label: 'مكتملة',  count: completedCount, color: 'bg-green-500 text-white' },
      { key: 'failed',    label: 'مرفوضة',  count: failedCount,    color: 'bg-red-500 text-white' },
      { key: 'pending',   label: 'قيد المراجعة', count: pendingCount, color: 'bg-blue-500 text-white' },
    ];

    const getOrderCodes = (metaStr: string): string[] => {
      try {
        const meta = JSON.parse(metaStr || "{}");
        const raw: any[] = [];
        if (Array.isArray(meta.ahminix_replay)) raw.push(...meta.ahminix_replay);
        if (Array.isArray(meta.replay_api)) raw.push(...meta.replay_api);
        // تحويل كل شيء لـ string (يمنع React Error #31)
        return [...new Set(
          raw.map((x: any) => {
            if (!x) return null;
            if (typeof x === "string") return x.trim() || null;
            if (typeof x === "number") return String(x);
            if (typeof x === "object") {
              const v = x.replay ?? x.code ?? x.value ?? x.key ?? x.data ?? null;
              return v !== null ? String(v) : null;
            }
            return String(x);
          }).filter(Boolean) as string[]
        )];
      } catch { return []; }
    };

    const getMetaLabels = (metaStr: string) => {
      // الحقول الداخلية التي لا نعرضها
      const hidden = new Set(['storeType','order_mode','ahminix_order_id','ahminix_status','ahminix_replay','replay_api']);
      const labelMap: Record<string, string> = {
        playerId:  "معرف اللاعب",
        input:     "البيانات المدخلة",
        quantity:  "الكمية",
        phone:     "رقم الهاتف",
        gameId:    "معرف اللعبة",
        accountId: "معرف الحساب",
        userId:    "معرف المستخدم",
        server:    "السيرفر",
        zone:      "المنطقة",
      };
      try {
        const meta = JSON.parse(metaStr || "{}");
        return Object.entries(meta)
          .filter(([k, v]) => !hidden.has(k) && v !== null && v !== undefined && String(v).trim() !== "")
          .map(([k, v]: any) => ({ label: labelMap[k] || k, value: String(v) }));
      } catch { return []; }
    };

    return (
      <div className="px-4 space-y-4 pb-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">طلباتي</h2>

        {/* شريط التصفية */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => { setFilterStatus(f.key); setExpandedOrderId(null); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 border ${
                filterStatus === f.key
                  ? f.color + ' border-transparent shadow-sm'
                  : 'bg-white border-gray-100 text-gray-500'
              }`}
            >
              {f.label}
              {f.count !== undefined && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  filterStatus === f.key ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'
                }`}>{f.count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div
                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    order.status === 'completed' ? 'bg-green-50 text-green-600' :
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
                      order.status === 'completed' ? 'text-green-600' :
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
                  {/* Auto-refresh for processing/pending API orders */}
                  {(order.status === 'processing' || order.status === 'pending') && (() => {
                    try {
                      const meta = JSON.parse(order.meta || "{}");
                      const pollId = meta.ahminix_order_uuid || meta.ahminix_order_id;
                      if (!pollId) return null;
                      return (
                        <OrderPollingStatus
                          externalOrderId={String(pollId)}
                          onStatusChange={() => { fetchOrders(); }}
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
          {filteredOrders.length === 0 && (
            <div className="text-center py-16 space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                <ShoppingBag size={40} />
              </div>
              <p className="text-gray-400">
                {filterStatus === 'all' ? 'لم تقم بأي طلبات بعد' : 'لا توجد طلبات في هذا التصنيف'}
              </p>
              {filterStatus === 'all' && (
                <button onClick={() => setActiveTab("home")} className="text-brand font-bold">ابدأ التسوق الآن</button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const ProfileView = () => {
    return (
      <div className="px-4 space-y-4 pb-20">

        {/* صورة الحساب */}
        <div className="flex flex-col items-center pt-6 pb-2">
          <div className={`w-24 h-24 ${theme.bgLight} rounded-full flex items-center justify-center ${theme.icon} border-4 border-white shadow-lg ${theme.shadow} overflow-hidden ${user?.is_vip ? 'vip-glow' : ''} ${user?.stats?.frame ? `frame-${user.stats.frame}` : ''}`}>
            {user?.avatar_url ? (
              <img loading="lazy" src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : <User size={48} />}
          </div>
        </div>

        {/* الاسم + الشارة بجانب بعض */}
        {user?.name && (
          <div className="flex items-center justify-center gap-2 -mt-1 flex-wrap">
            <p className="text-base font-semibold text-gray-800">{user.name}</p>
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
            {user?.is_vip && <span className="vip-badge"><Crown size={10} />VIP</span>}
          </div>
        )}

        {/* رقم الدخول + اللقب بجانب بعض */}
        {user?.id && (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-brand">#{user.id}</span>
            {user?.stats?.user_title && (
              <span className="text-xs font-bold text-purple-600 flex items-center gap-1">
                <Award size={11} /> {user.stats.user_title}
              </span>
            )}
          </div>
        )}

        {/* 3 أزرار: ربط تليجرام / الإحالة / دفعاتي */}
        {user && (
          <div className="grid grid-cols-3 gap-2 pt-1">
            {user.telegram_chat_id ? (
              <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl border border-blue-100 flex flex-col items-center gap-1">
                <MessageSquare size={18} />
                <span className="text-[10px] font-bold">تليجرام مرتبط</span>
              </div>
            ) : (
              <button onClick={handleGenerateLinkingCode} className="bg-orange-50 text-orange-600 p-3 rounded-2xl border border-orange-100 flex flex-col items-center gap-1 transition-all active:scale-95">
                <MessageSquare size={18} />
                <span className="text-[10px] font-bold leading-tight text-center">اربط الآن</span>
              </button>
            )}
            <button onClick={() => setView({ type: "referral" })} className="bg-brand-light text-brand p-3 rounded-2xl border border-brand-soft flex flex-col items-center gap-1 transition-all active:scale-95">
              <Share2 size={18} />
              <span className="text-[10px] font-bold">الإحالة</span>
            </button>
            <button onClick={() => setView({ type: "payments" })} className="bg-green-50 text-green-600 p-3 rounded-2xl border border-green-100 flex flex-col items-center gap-1 transition-all active:scale-95">
              <History size={18} />
              <span className="text-[10px] font-bold">دفعاتي</span>
            </button>
          </div>
        )}

        {/* زر نظام المكافآت والترتيب */}
        {user && (
          <button onClick={() => setView({ type: "rewards_leaderboard" })} className="w-full bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 py-3 rounded-2xl border border-amber-100 flex items-center justify-center gap-2 transition-all active:scale-95 font-bold text-sm">
            <Trophy size={18} className="text-amber-500" />
            نظام المكافآت والترتيب
          </button>
        )}

        {/* قائمة الإجراءات */}
        <div className="space-y-2">
          <ProfileItem icon={<UserCircle size={20} />} label="معلومات الحساب" onClick={() => setView({ type: "profile_details" })} />
          <ProfileItem icon={<User size={20} />} label="تعديل الملف الشخصي" onClick={() => setView({ type: "edit_profile" })} />
          <ProfileItem icon={<Settings size={20} />} label="الإعدادات" onClick={() => setView({ type: "settings" })} />
          <ProfileItem icon={<Headphones size={20} />} label="الدعم الفني" onClick={() => setView({ type: "chat" })} className="text-brand relative" badge={user?.unread_support_count > 0 ? user.unread_support_count : undefined} />
          {user ? (
            <ProfileItem icon={<LogOut size={20} />} label="تسجيل الخروج" onClick={handleLogout} className="text-red-500" />
          ) : (
            <ProfileItem icon={<ArrowRight size={20} />} label="تسجيل الدخول" onClick={() => setView({ type: "login" })} />
          )}
        </div>

        {/* Syrbit Copyright */}
        <div className="flex justify-center py-4">
          <a href="https://chat.whatsapp.com/DELXtdEh9ua5edFTupESNU" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-purple-500 transition-colors">
            <span>برمجة شركة</span>
            <span className="font-black text-purple-500">Syrbit</span>
            <ExternalLink size={9} />
          </a>
        </div>
      </div>
    );
  };

    const ProfileItem = ({ icon, label, onClick, className = "", badge }: any) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all ${className}`}>
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
      if (newPassword.length < 8) return setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) return setError("يجب أن تحتوي كلمة المرور على أحرف وأرقام");
      if (newPassword !== confirmPassword) return setError("كلمتا المرور غير متطابقتين");
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
      const getStrength = (pw: string) => {
        let s = 0;
        if (pw.length >= 8) s++;
        if (pw.length >= 12) s++;
        if (/[A-Z]/.test(pw)) s++;
        if (/[0-9]/.test(pw)) s++;
        if (/[^A-Za-z0-9]/.test(pw)) s++;
        return s;
      };
      const score = getStrength(newPassword);
      const levels = [
        { label: "ضعيفة جداً", color: "bg-red-500", width: "w-1/5" },
        { label: "ضعيفة", color: "bg-orange-400", width: "w-2/5" },
        { label: "متوسطة", color: "bg-yellow-400", width: "w-3/5" },
        { label: "جيدة", color: "bg-blue-500", width: "w-4/5" },
        { label: "قوية 💪", color: "bg-green-500", width: "w-full" },
      ];
      const lvl = levels[Math.min(score, 4)];
      return (
        <div className="px-6 flex flex-col items-center justify-center min-h-[80vh] pb-20">
          <div className="w-20 h-20 bg-brand rounded-3xl flex items-center justify-center text-white shadow-xl shadow-brand-soft mb-6">
            <KeyRound size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">كلمة مرور جديدة</h2>
          <p className="text-gray-400 text-sm mb-8 text-center">تم التأكيد · اكتب كلمة المرور الجديدة</p>
          <div className="w-full space-y-4">
            <div className="space-y-2">
              <input type="password" placeholder="كلمة المرور الجديدة"
                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-brand shadow-sm"/>
              {newPassword.length > 0 && (
                <div className="space-y-1 px-1">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${lvl.color} ${lvl.width}`} />
                  </div>
                  <p className={`text-[11px] font-bold ${score < 2 ? "text-red-500" : score < 4 ? "text-yellow-600" : "text-green-600"}`}>
                    قوة كلمة المرور: {lvl.label}
                  </p>
                  <ul className="text-[10px] text-gray-400 space-y-0.5">
                    <li className={newPassword.length >= 8 ? "text-green-500" : ""}>✓ 8 أحرف على الأقل</li>
                    <li className={/[A-Za-z]/.test(newPassword) ? "text-green-500" : ""}>✓ أحرف إنجليزية</li>
                    <li className={/[0-9]/.test(newPassword) ? "text-green-500" : ""}>✓ أرقام (0-9)</li>
                    <li className={/[^A-Za-z0-9]/.test(newPassword) ? "text-green-500" : ""}>✓ رمز خاص (!@#...)</li>
                  </ul>
                </div>
              )}
            </div>
            <input type="password" placeholder="تأكيد كلمة المرور"
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className={`w-full bg-white border rounded-2xl px-5 py-4 outline-none shadow-sm ${confirmPassword && confirmPassword !== newPassword ? "border-red-300 focus:border-red-400" : "border-gray-100 focus:border-brand"}`}/>
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-red-500 text-xs text-center">كلمتا المرور غير متطابقتين</p>
            )}
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button disabled={resetting || score < 2 || newPassword !== confirmPassword} onClick={handleResetPassword}
              className="w-full bg-brand text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-soft disabled:opacity-50">
              {resetting ? "جاري الحفظ..." : "حفظ كلمة المرور وتسجيل الدخول"}
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
            // Show onboarding only after registration (not login)
            if (isRegister) {
              setOnboardingStep(0);
              setShowOnboarding(true);
            }
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
              // Show onboarding after registration via OTP
              if (isRegister) {
                setOnboardingStep(0);
                setShowOnboarding(true);
              }
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
          <div className="space-y-2">
          <input 
            type="password" 
            placeholder="كلمة المرور" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-brand shadow-sm"
          />
          {isRegister && password.length > 0 && (() => {
            let score = 0;
            if (password.length >= 8) score++;
            if (password.length >= 12) score++;
            if (/[A-Z]/.test(password)) score++;
            if (/[0-9]/.test(password)) score++;
            if (/[^A-Za-z0-9]/.test(password)) score++;
            const levels = [
              { label: "ضعيفة جداً", color: "bg-red-500", width: "w-1/5" },
              { label: "ضعيفة", color: "bg-orange-400", width: "w-2/5" },
              { label: "متوسطة", color: "bg-yellow-400", width: "w-3/5" },
              { label: "جيدة", color: "bg-blue-500", width: "w-4/5" },
              { label: "قوية 💪", color: "bg-green-500", width: "w-full" },
            ];
            const lvl = levels[Math.min(score, 4)];
            return (
              <div className="space-y-1 px-1">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${lvl.color} ${lvl.width}`} />
                </div>
                <p className={`text-[11px] font-bold ${score < 2 ? "text-red-500" : score < 4 ? "text-yellow-600" : "text-green-600"}`}>
                  كلمة المرور: {lvl.label}
                </p>
                <ul className="text-[10px] text-gray-400 space-y-0.5 mt-1">
                  <li className={password.length >= 8 ? "text-green-500" : ""}>✓ 8 أحرف على الأقل</li>
                  <li className={/[A-Z]/.test(password) ? "text-green-500" : ""}>✓ حرف كبير (A-Z)</li>
                  <li className={/[0-9]/.test(password) ? "text-green-500" : ""}>✓ رقم (0-9)</li>
                  <li className={/[^A-Za-z0-9]/.test(password) ? "text-green-500" : ""}>✓ رمز خاص (!@#...)</li>
                </ul>
              </div>
            );
          })()}
          </div>
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

          {/* Google Sign-In */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-3 text-xs text-gray-400 font-medium">أو</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
          <button
            onClick={() => {
              const clientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;
              if (!clientId) { setError("تسجيل الدخول عبر Google غير مفعّل حالياً"); return; }
              const redirectUri = window.location.origin;
              const params = new URLSearchParams({
                client_id: clientId,
                redirect_uri: redirectUri,
                response_type: 'token',
                scope: 'openid email profile',
                state: 'google_oauth',
                prompt: 'select_account',
                include_granted_scopes: 'true',
              });
              window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
            }}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-2xl py-3.5 font-bold text-gray-700 text-sm shadow-sm active:scale-95 transition-all hover:border-gray-300"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.6 29.3 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c11.1 0 20.4-8.1 20.4-21 0-1.4-.1-2.7-.4-4z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.6 5.1 29.6 3 24 3 16.3 3 9.7 7.9 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 36 26.9 37 24 37c-5.2 0-9.6-3.4-11.2-8.1l-6.6 5.1C9.7 41.1 16.3 45 24 45z"/>
              <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.2 4-4 5.4l6.6 5.4C41.8 35.4 44 30.1 44 24c0-1.4-.1-2.7-.4-4z"/>
            </svg>
            تسجيل الدخول عبر Google
          </button>

          <button 
            onClick={() => { setActiveTab("profile"); setView({ type: "chat" }); }}
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
              <img loading="lazy" src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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


  const RewardsLeaderboardView = () => {
    const [activeSection, setActiveSection] = useState<'rewards'|'leaderboard'>('rewards');
    const [showAllRewards, setShowAllRewards] = useState(false);
    const [leaderboardTab, setLeaderboardTab] = useState<'topup'|'referral'|'activity'>('topup');
    const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
    const [leaderboardLoading, setLeaderboardLoading] = useState(true);
    const [showInfo, setShowInfo] = useState<string|null>(null);

    useEffect(() => {
      if (activeSection === 'leaderboard') {
        setLeaderboardLoading(true);
        setLeaderboardData([]);
        fetch(`/api/leaderboard/${leaderboardTab}`)
          .then(r => r.json())
          .then(d => setLeaderboardData(Array.isArray(d) ? d : []))
          .catch(() => setLeaderboardData([]))
          .finally(() => setLeaderboardLoading(false));
      }
    }, [activeSection, leaderboardTab]);

    const lbTabs = [
      { key: 'topup', label: 'أكثر شحناً', icon: <Wallet size={16}/>, color: 'text-green-600', activeBg: 'bg-green-50 border-green-200', desc: 'ترتيب المستخدمين حسب إجمالي مبالغ الشحن.' },
      { key: 'referral', label: 'أكثر إحالةً', icon: <Share2 size={16}/>, color: 'text-blue-600', activeBg: 'bg-blue-50 border-blue-200', desc: 'ترتيب المستخدمين حسب عدد الأصدقاء المدعوين.' },
      { key: 'activity', label: 'الأكثر نشاطاً', icon: <Zap size={16}/>, color: 'text-amber-600', activeBg: 'bg-amber-50 border-amber-200', desc: 'ترتيب المستخدمين حسب إجمالي عدد الطلبات.' },
    ] as const;

    const activeLbTab = lbTabs.find(t => t.key === leaderboardTab)!;
    const medalIcons = [
      <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center"><Trophy size={14} className="text-amber-500"/></div>,
      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"><Trophy size={14} className="text-gray-400"/></div>,
      <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center"><Trophy size={14} className="text-orange-400"/></div>,
    ];

    return (
      <div className="px-4 space-y-4 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 pt-2">
          <button onClick={() => setView({ type: "main" })} className="p-2 bg-gray-100 rounded-xl text-gray-600 active:scale-90 transition-all">
            <ArrowRight size={20} />
          </button>
          <h2 className="font-bold text-gray-800 text-lg">نظام المكافآت والترتيب</h2>
        </div>

        {/* زرا التبديل العلويان */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveSection('rewards')}
            className={`py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border transition-all active:scale-95 ${activeSection === 'rewards' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-gray-100 text-gray-400'}`}
          >
            <Star size={16} className={activeSection === 'rewards' ? 'text-amber-500' : 'text-gray-300'} />
            نظام المكافآت
          </button>
          <button
            onClick={() => setActiveSection('leaderboard')}
            className={`py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border transition-all active:scale-95 ${activeSection === 'leaderboard' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-gray-100 text-gray-400'}`}
          >
            <Trophy size={16} className={activeSection === 'leaderboard' ? 'text-amber-500' : 'text-gray-300'} />
            الترتيب
          </button>
        </div>

        {/* قسم نظام المكافآت */}
        {activeSection === 'rewards' && user && user.stats && (
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
                                  showToast("🎁 مبروك! تم استلام المكافأة بنجاح", 'success');
                                  if (resData.stats) { setUser(prev => prev ? { ...prev, stats: resData.stats } : prev); }
                                  fetchUser(user.id);
                                } else { showToast(resData.error || "فشل استلام المكافأة", 'error'); }
                              } catch { showToast("خطأ في الاتصال", 'error'); }
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

        {/* قسم الترتيب */}
        {activeSection === 'leaderboard' && (
          <>
            {/* تبويبات الترتيب */}
            <div className="grid grid-cols-3 gap-2">
              {lbTabs.map(t => (
                <div key={t.key} className="relative">
                  <button onClick={() => { setLeaderboardTab(t.key); setShowInfo(null); }}
                    className={`w-full p-3 rounded-2xl border text-center transition-all active:scale-95 ${leaderboardTab === t.key ? t.activeBg : 'bg-white border-gray-100'}`}>
                    <div className={`flex justify-center mb-1 ${leaderboardTab === t.key ? t.color : 'text-gray-400'}`}>{t.icon}</div>
                    <p className={`text-[10px] font-bold ${leaderboardTab === t.key ? t.color : 'text-gray-400'}`}>{t.label}</p>
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

            {showInfo && (
              <div className={`p-3 rounded-2xl border text-xs text-gray-600 leading-relaxed ${lbTabs.find(t=>t.key===showInfo)?.activeBg || 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-start gap-2">
                  <Info size={14} className="mt-0.5 shrink-0 text-gray-400"/>
                  <p>{lbTabs.find(t => t.key === showInfo)?.desc}</p>
                </div>
              </div>
            )}

            {leaderboardLoading ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"/></div>
            ) : leaderboardData.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Trophy size={40} className="mx-auto mb-3 opacity-20"/>
                <p className="text-sm">لا توجد بيانات بعد</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboardData.map((entry: any, i: number) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                    i === 0 ? 'bg-amber-50 border-amber-200 shadow-sm' :
                    i === 1 ? 'bg-gray-50 border-gray-200' :
                    i === 2 ? 'bg-orange-50 border-orange-100' :
                    'bg-white border-gray-100'
                  }`}>
                    <div className="w-7 shrink-0 flex justify-center">
                      {i < 3 ? medalIcons[i] : <span className="text-xs font-black text-gray-400">#{i+1}</span>}
                    </div>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${theme.bgLight}`}>
                      {entry.avatar_url
                        ? <img loading="lazy" src={entry.avatar_url} className="w-full h-full object-cover" referrerPolicy="no-referrer"/>
                        : <User size={18} className={theme.icon}/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-800 truncate">{entry.name || 'مجهول'}</p>
                      {entry.badge && (
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">{entry.badge}</span>
                      )}
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-1">
                      <div className={i < 3 ? activeLbTab.color : 'text-gray-400'}>{activeLbTab.icon}</div>
                      <div>
                        <p className={`font-black text-sm ${i < 3 ? activeLbTab.color : 'text-gray-700'}`}>{entry.value}</p>
                        <p className="text-[9px] text-gray-400">{entry.unit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {user && leaderboardData.length > 0 && (() => {
              const myIdx = leaderboardData.findIndex((e:any) => String(e.user_id) === String(user.id));
              return (
                <div className={`rounded-2xl p-3 text-center border ${myIdx >= 0 ? 'bg-brand-light border-brand-soft' : 'bg-gray-50 border-gray-100'}`}>
                  {myIdx >= 0
                    ? <p className="text-xs font-bold text-brand">أنت في المركز #{myIdx + 1} 🎉</p>
                    : <p className="text-xs text-gray-400">أنت لست في الترتيب حتى الآن · استمر!</p>
                  }
                </div>
              );
            })()}
          </>
        )}
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
                    ? <img loading="lazy" src={entry.avatar_url} className="w-full h-full object-cover" referrerPolicy="no-referrer"/>
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
    const [avatarUploading, setAvatarUploading] = useState(false);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setAvatarUploading(true);
      try {
        const formData = new FormData();
        formData.append("image", file);
        const imgbbKey = (import.meta as any).env.VITE_IMGBB_API_KEY || "97ffbf56fe1a203445531d664cd4b928";
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, { method: "POST", body: formData });
        const data = await res.json();
        if (data.success) {
          const token = localStorage.getItem("authToken") || "";
          const updateRes = await fetch(`/api/user/${user?.id}/avatar`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ avatar_url: data.data.url })
          });
          if (updateRes.ok) { fetchUser(user!.id); showToast("✅ تم تحديث الصورة الشخصية بنجاح", 'success'); }
          else { showToast("فشل تحديث الصورة", 'error'); }
        } else { showToast("فشل رفع الصورة", 'error'); }
      } catch { showToast("فشل رفع الصورة", 'error'); } finally { setAvatarUploading(false); }
    };

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
          <h2 className="text-xl font-bold text-gray-800">تعديل الملف الشخصي</h2>
        </div>

        {/* صورة الحساب مع زر التغيير */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className={`w-24 h-24 ${theme.bgLight} rounded-full flex items-center justify-center ${theme.icon} border-4 border-white shadow-lg overflow-hidden`}>
              {user?.avatar_url ? (
                <img loading="lazy" src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : <User size={48} />}
              {avatarUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-brand text-white p-2 rounded-full cursor-pointer shadow-lg hover:opacity-90 transition-colors">
              <Plus size={16} />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={avatarUploading} />
            </label>
          </div>
          <p className="text-xs text-gray-400">اضغط على + لتغيير الصورة</p>
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
            <label className="text-sm font-bold text-gray-700">تغيير كلمة المرور (اختياري)</label>
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
              تنزيل نسخة من بياناتي
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ReferralView = () => {
    const [stats, setStats] = useState<{count: number, referrals: any[]}>({ count: 0, referrals: [] });
    const commissionRate = parseFloat(siteSettings?.find((s:any) => s.key === "referral_commission")?.value || "5");
    const referralLink = `${window.location.origin}/?ref=${user?.id}`;

    useEffect(() => {
      if (user) {
        const token = localStorage.getItem("authToken") || "";
        fetch(`/api/referrals/stats/${user.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
          .then(res => res.json())
          .then(data => setStats({ count: data.count || 0, referrals: data.referrals || [] }))
          .catch(console.error);
      }
    }, [user]);

    const copyLink = () => {
      navigator.clipboard.writeText(referralLink);
      showToast("تم نسخ رابط الإحالة", 'success');
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
          <h3 className="font-bold text-lg">اربح {commissionRate}% من كل عملية شراء</h3>
          <p className="text-gray-500 text-sm">شارك رابط الإحالة الخاص بك مع أصدقائك واحصل على عمولة {commissionRate}% من كل عملية شراء يقومون بها، تضاف مباشرة إلى رصيدك.</p>
          
          <div className="bg-brand-light p-4 rounded-xl">
            <p className="text-xs text-brand font-bold mb-1">عدد المستخدمين المسجلين عبر رابطك</p>
            <p className="text-2xl font-bold text-brand">{stats.count}</p>
          </div>

          {stats.referrals.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-700 text-right">المستخدمون المُحالون</p>
              <div className="space-y-2">
                {stats.referrals.map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2">
                    <span className="text-sm text-gray-700 font-medium">{r.name || "مستخدم"}</span>
                    <span className="text-[10px] text-gray-400">{new Date(r.created_at).toLocaleDateString("ar-EG")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
        const token = localStorage.getItem("authToken") || "";
        const guestId = localStorage.getItem("guest_id") || `guest_${Math.random().toString(36).substr(2, 9)}`;
        if (!localStorage.getItem("guest_id")) localStorage.setItem("guest_id", guestId);
        const url = user
          ? `/api/chat/messages?user_id=${user.id}`
          : `/api/chat/messages?guest_id=${guestId}`;
        const res = await fetch(url, {
          headers: user && token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!res.ok) return;
        const raw = await res.json();
        const data = Array.isArray(raw) ? raw : [];
        setMessages(prev => {
          if (prev.length === data.length && prev.every((m, i) => m.id === data[i]?.id)) return prev;
          return data;
        });
        const hasUnread = data.some((m: any) => m.sender_role === 'admin' && !m.is_read);
        if (hasUnread && user) {
          await fetch("/api/chat/mark-read", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
      // تحديث ذكي: نتحقق فقط من وجود رسائل جديدة بشكل خفيف كل 8 ثواني
      // وإذا وجدنا جديداً نحدث، وإلا نتجاهل بدون إعادة رسم
      const interval = setInterval(async () => {
        try {
          const token = localStorage.getItem("authToken") || "";
          const guestId = localStorage.getItem("guest_id") || "";
          const url = user
            ? `/api/chat/messages?user_id=${user.id}`
            : `/api/chat/messages?guest_id=${guestId}`;
          const res = await fetch(url, {
            headers: user && token ? { Authorization: `Bearer ${token}` } : {}
          });
          if (!res.ok) return;
          const raw = await res.json();
          const data = Array.isArray(raw) ? raw : [];
          // نحدث الحالة فقط إذا كان هناك رسائل جديدة فعلاً
          setMessages(prev => {
            if (prev.length === data.length && prev.every((m, i) => m.id === data[i]?.id)) return prev;
            return data;
          });
        } catch {}
      }, 8000);
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
          showToast(data.error || "فشل الإرسال", 'error');
        }
      } catch (e) {
        showToast("خطأ في الاتصال", 'error');
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
        showToast("فشل رفع الصورة", 'error');
      } finally {
        setUploading(false);
      }
    };

    return (
      <div className="fixed inset-0 z-[60] bg-gray-50 flex flex-col" style={{top:0, bottom:'64px'}}>
        <div className="bg-white p-4 border-b border-gray-100 flex items-center gap-3 shadow-sm shrink-0">
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
                  m.sender_role === 'user' ? 'bg-white text-gray-800 rounded-tr-none' : 'bg-[var(--brand)] text-white rounded-tl-none'
                }`}>
                  {m.type === 'bot_reply' && (
                    <div className="flex items-center gap-1 mb-1 opacity-70">
                      <Bot size={10} />
                      <span className="text-[8px] font-bold">تم الرد بواسطة بوت الدردشة</span>
                    </div>
                  )}
                  {m.image_url && (
                    <img loading="lazy" src={m.image_url} alt="Chat" className="rounded-lg mb-2 max-w-full border border-gray-100" referrerPolicy="no-referrer" />
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
                        className="w-full py-2 bg-white text-[var(--brand)] rounded-xl text-xs font-bold active:scale-95 transition-all disabled:opacity-50"
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

        <div className="relative p-4 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0 mt-auto">
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
                <img loading="lazy" src={imagePreview} alt="Preview" className="w-full h-64 object-contain rounded-xl mb-4 bg-gray-50" />
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
            className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[var(--brand)] transition-all"
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
      const res = await adminFetch("/api/admin/chat/list", { headers: { "x-admin-token": localStorage.getItem("adminToken") || "" } });
      const data = await res.json();
      setChatList(Array.isArray(data) ? data : []);
    };

    const fetchAutoReplies = async () => {
      const res = await adminFetch("/api/admin/auto-replies", { headers: { "x-admin-token": localStorage.getItem("adminToken") || "" } });
      const data = await res.json();
      setAutoReplies(Array.isArray(data) ? data : []);
    };

    const fetchMessages = async (userId: any, isGuest: boolean = false) => {
      const res = await fetch(`/api/chat/messages/${userId}${isGuest ? '?guest=true' : ''}`);
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
      await adminFetch("/api/admin/chat/mark-read", {
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
        showToast("فشل الإرسال", 'error');
      }
    };

    const handleToggleBlock = async (userId: number, currentBlocked: boolean) => {
      showConfirm(
        `هل تريد ${currentBlocked ? 'إلغاء حظر' : 'حظر'} هذا المستخدم من الدردشة؟`,
        currentBlocked ? 'إلغاء الحظر' : 'حظر المستخدم',
        async () => {
          const res = await adminFetch("/api/admin/chat/block", {
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
        },
        false
      );
    };

    const handleAddAutoReply = async () => {
      const trigger = triggerRef.current?.value?.trim() || "";
      const replyText = replyRef.current?.value?.trim() || "";
      if (!trigger || !replyText) return showToast("يرجى إدخال النص والرد", 'error');
      const res = await adminFetch("/api/admin/auto-replies", {
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
        showToast("✅ تم حفظ الرد التلقائي وإرساله", 'success');
      } else {
        showToast("❌ فشل الحفظ", 'error');
      }
    };

    const handleDeleteAutoReply = async (id: number) => {
      showConfirm("هل تريد حذف هذا الرد التلقائي؟", "حذف الرد التلقائي", async () => {
        try {
          const res = await adminFetch(`/api/admin/auto-replies/${id}`, {
            method: "DELETE",
            headers: { "x-admin-token": localStorage.getItem("adminToken") || "" }
          });
          if (res.ok) {
            setAutoReplies(prev => prev.filter((r: any) => r.id !== id));
            showToast("✅ تم حذف الرد التلقائي", 'success');
          } else {
            showToast("❌ فشل حذف الرد التلقائي", 'error');
          }
        } catch (e) {
          showToast("❌ فشل الاتصال بالخادم", 'error');
        }
      }, true);
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
                  <img loading="lazy" src={selectedChatUser.avatar_url} alt="" className="w-full h-full object-cover" />
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
                    m.sender_role === 'admin' ? 'bg-[var(--brand)] text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'
                  }`}>
                    {m.image_url && <img loading="lazy" src={m.image_url} alt="" className="rounded-lg mb-2 max-w-full border border-gray-100" referrerPolicy="no-referrer" />}
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
              className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[var(--brand)] transition-all"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendReply(reply)}
            />
            <button onClick={() => handleSendReply(reply)} className="p-3 bg-[var(--brand)] text-white rounded-xl shadow-lg shadow-red-100 active:scale-95 transition-all">
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
              <div className="relative w-12 h-12 shrink-0">
                <div className="w-12 h-12 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                  {chat.avatar_url ? (
                    <img loading="lazy" src={chat.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={24} /></div>
                  )}
                </div>
                {chat.unread_count > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white z-10">
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
        {/* تفعيل الإشعارات */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-gray-400" />
            <span className="font-medium text-gray-700">الإشعارات</span>
          </div>
          <button 
            onClick={() => showToast("تم تفعيل الإشعارات بنجاح!", 'success')}
            className="w-10 h-5 bg-brand rounded-full relative"
          >
            <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
          </button>
        </div>
        {/* تبديل العملة */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">💱</span>
            <span className="font-medium text-gray-700">عملة العرض</span>
          </div>
          <select
            value={currency}
            onChange={(e) => {
              const next = e.target.value as "USD" | "SYP";
              setCurrency(next);
              localStorage.setItem("currency", next);
            }}
            className="px-4 py-1.5 rounded-xl font-black text-sm shadow-sm outline-none cursor-pointer border-0"
            style={{ background: "linear-gradient(135deg, #f5d485, #f0c030)", color: "#4a2e00" }}
          >
            <option value="USD">$</option>
            <option value="SYP">ل.س</option>
          </select>
        </div>
        {/* الوضع الليلي */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon size={20} className="text-gray-400" />
            <span className="font-medium text-gray-700">الوضع الليلي</span>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-10 h-5 rounded-full relative transition-colors ${isDarkMode ? 'bg-brand' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isDarkMode ? 'right-1' : 'left-1'}`}></div>
          </button>
        </div>
        {/* سياسة الخصوصية */}
        <button onClick={() => setView({ type: "privacy_policy" })} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-gray-400" />
            <span className="font-medium text-gray-700">سياسة الخصوصية</span>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </button>
        {/* أولوية الدعم - تظهر فقط إن كان يملكها */}
        {!!user?.stats?.has_special_support && (
          <button onClick={() => showToast("لديك أولوية في الدعم الفني. تواصل معنا عبر الواتساب.", 'info')} className="w-full p-4 flex items-center justify-between hover:bg-amber-50 transition-colors">
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-amber-500" />
              <span className="font-medium text-amber-600">أولوية الدعم</span>
            </div>
            <ChevronRight size={18} className="text-amber-300" />
          </button>
        )}
        {/* تخصيص الثيم - تظهر فقط إن كان يملكها */}
        {!!user?.stats?.custom_theme_color && (
          <button onClick={() => setThemeModal({ isOpen: true, color: user.stats.custom_theme_color === 'any' ? '#10b981' : user.stats.custom_theme_color })} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Palette size={20} className="text-brand" />
              <span className="font-medium text-brand">تخصيص الثيم</span>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
        )}
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
            <button onClick={() => setTarget("all")} className={`flex-1 py-2 rounded-xl text-xs font-bold ${target==="all"?"bg-[var(--brand)] text-white":"bg-gray-100 text-gray-600"}`}>للجميع</button>
            <button onClick={() => setTarget("one")} className={`flex-1 py-2 rounded-xl text-xs font-bold ${target==="one"?"bg-[var(--brand)] text-white":"bg-gray-100 text-gray-600"}`}>لمستخدم معين</button>
          </div>
          {target==="one" && <input type="text" placeholder="ID المستخدم" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={uid} onChange={e => setUid(e.target.value)}/>}
          <input type="text" placeholder="عنوان الإشعار" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={title} onChange={e => setTitle(e.target.value)}/>
          <textarea placeholder="نص الإشعار" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none h-20 resize-none" value={body} onChange={e => setBody(e.target.value)}/>
          <button disabled={sending||!title||!body} onClick={async () => { setSending(true); await handleSendNotification(target==="one"&&uid?parseInt(uid):null, title, body); setSending(false); onClose(); }}
            className="w-full bg-[var(--brand)] text-white py-3.5 rounded-2xl font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2">
            <Send size={16}/>{sending?"جاري الإرسال...":"إرسال الإشعار"}
          </button>
        </motion.div>
      </motion.div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // AdminProvidersTab — إدارة المزودين الخارجيين (متعدد المزودين + تشفير)
  // ─────────────────────────────────────────────────────────────────────────
  const AdminAhminixTab = ({ categories, subcategories, subSubCategories, fetchCategories, fetchSubcategories, fetchSubSubCategories }: any) => {

    // ── State: قائمة المزودين ──────────────────────────────────────────────
    const [providers, setProviders] = useState<any[]>([]);
    const [loadingProviders, setLoadingProviders] = useState(false);

    // ── State: نموذج إضافة / تعديل مزود ─────────────────────────────────
    const [showProviderForm, setShowProviderForm] = useState(false);
    const [editingProvider, setEditingProvider] = useState<any>(null); // null = إضافة جديد
    const [providerFormData, setProviderFormData] = useState({ name: "", base_url: "", api_token: "", notes: "" });
    const [savingProvider, setSavingProvider] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // ── State: المزود المختار للعمل ────────────────────────────────────────
    const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
    const selectedProvider = providers.find(p => p.id === selectedProviderId) || null;

    // ── State: معلومات الحساب ─────────────────────────────────────────────
    const [providerProfile, setProviderProfile] = useState<any>(null);
    const [loadingProfile, setLoadingProfile] = useState(false);

    // ── State: منتجات المزود ─────────────────────────────────────────────
    const [providerProducts, setProviderProducts] = useState<any[]>([]);
    const [productsFetched, setProductsFetched] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    // ── State: مزامنة المنتجات ────────────────────────────────────────────
    const [targetSubcategoryId, setTargetSubcategoryId] = useState("");
    const [targetSubSubCategoryId, setTargetSubSubCategoryId] = useState("");
    const [markupPercent, setMarkupPercent] = useState(0);
    const [globalImageUrl, setGlobalImageUrl] = useState("");
    const [syncLoading, setSyncLoading] = useState(false);
    const [syncResult, setSyncResult] = useState<any>(null);

    // ── State: تحديث الطلبات ──────────────────────────────────────────────
    const [refreshLoading, setRefreshLoading] = useState(false);
    const [refreshResult, setRefreshResult] = useState<any>(null);

    // ── State: فحص طلب ───────────────────────────────────────────────────
    const [checkOrderId, setCheckOrderId] = useState("");
    const [checkLoading, setCheckLoading] = useState(false);
    const [checkResult, setCheckResult] = useState<any>(null);

    // ── State: الأقسام المحلية ────────────────────────────────────────────
    const [localSubcats, setLocalSubcats] = useState<any[]>([]);
    const [localSubSubs, setLocalSubSubs] = useState<any[]>([]);

    // ── State: التبويب النشط ──────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<"providers"|"products"|"orders">("providers");

    useEffect(() => {
      fetchProviders();
      fetch("/api/subcategories").then(r=>r.json()).then(setLocalSubcats).catch(()=>{});
      fetch("/api/sub-sub-categories").then(r=>r.json()).then(setLocalSubSubs).catch(()=>{});
    }, []);

    // عند تغيير المزود المختار — نصفر الحالات المرتبطة به
    useEffect(() => {
      setProviderProfile(null);
      setProviderProducts([]);
      setProductsFetched(false);
      setSelectedProducts([]);
      setSyncResult(null);
      setCheckResult(null);
    }, [selectedProviderId]);

    // ── جلب قائمة المزودين ───────────────────────────────────────────────
    const fetchProviders = async () => {
      setLoadingProviders(true);
      try {
        const res = await adminFetch("/api/admin/providers");
        const data = await res.json();
        setProviders(Array.isArray(data) ? data : []);
      } catch { setProviders([]); }
      setLoadingProviders(false);
    };

    // ── حفظ مزود (إضافة أو تعديل) ──────────────────────────────────────
    const handleSaveProvider = async () => {
      if (!providerFormData.name.trim() || !providerFormData.base_url.trim()) {
        showToast("الاسم ورابط API مطلوبان", "error"); return;
      }
      if (!editingProvider && !providerFormData.api_token.trim()) {
        showToast("التوكن مطلوب عند الإضافة", "error"); return;
      }
      setSavingProvider(true);
      try {
        const body: any = {
          name: providerFormData.name.trim(),
          base_url: providerFormData.base_url.trim(),
          notes: providerFormData.notes.trim() || undefined,
        };
        if (providerFormData.api_token.trim()) body.api_token = providerFormData.api_token.trim();

        if (editingProvider) {
          await adminFetch(`/api/admin/providers/${editingProvider.id}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
          });
          showToast("تم تحديث المزود", "success");
        } else {
          await adminFetch("/api/admin/providers", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
          });
          showToast("تم إضافة المزود", "success");
        }
        setShowProviderForm(false);
        setEditingProvider(null);
        setProviderFormData({ name: "", base_url: "", api_token: "", notes: "" });
        fetchProviders();
      } catch (e: any) {
        showToast(e.message || "حدث خطأ", "error");
      }
      setSavingProvider(false);
    };

    // ── حذف مزود ──────────────────────────────────────────────────────────
    const handleDeleteProvider = async (id: number) => {
      if (!confirm("هل أنت متأكد من حذف هذا المزود؟ لا يمكن حذفه إن كان يملك منتجات مرتبطة.")) return;
      setDeletingId(id);
      try {
        const res = await adminFetch(`/api/admin/providers/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) { showToast(data.error || "فشل الحذف", "error"); }
        else { showToast("تم حذف المزود", "success"); if (selectedProviderId === id) setSelectedProviderId(null); fetchProviders(); }
      } catch (e: any) { showToast(e.message, "error"); }
      setDeletingId(null);
    };

    // ── تبديل حالة المزود (نشط/معطل) ─────────────────────────────────────
    const handleToggleProvider = async (id: number, current: boolean) => {
      try {
        await adminFetch(`/api/admin/providers/${id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: !current })
        });
        fetchProviders();
      } catch (e: any) { showToast(e.message, "error"); }
    };

    // ── جلب بيانات حساب المزود ────────────────────────────────────────────
    const loadProviderProfile = async () => {
      if (!selectedProviderId) return;
      setLoadingProfile(true);
      try {
        const res = await adminFetch(`/api/admin/providers/${selectedProviderId}/profile`);
        setProviderProfile(await res.json());
      } catch (e: any) { setProviderProfile({ error: e.message }); }
      setLoadingProfile(false);
    };

    // ── جلب منتجات المزود ─────────────────────────────────────────────────
    const loadProviderProducts = async () => {
      if (!selectedProviderId) return;
      setLoadingProducts(true); setProductsFetched(false); setSelectedProducts([]); setSyncResult(null);
      try {
        const res = await adminFetch(`/api/admin/providers/${selectedProviderId}/products`);
        const data = await res.json();
        setProviderProducts(data.products || (Array.isArray(data) ? data : []));
        setProductsFetched(true);
      } catch { setProviderProducts([]); setProductsFetched(true); }
      setLoadingProducts(false);
    };

    // ── مزامنة المنتجات ────────────────────────────────────────────────────
    const handleSync = async () => {
      if (!targetSubcategoryId) { showToast("اختر القسم الفرعي أولاً", "info"); return; }
      if (!selectedProviderId) { showToast("اختر مزوداً أولاً", "info"); return; }
      setSyncLoading(true); setSyncResult(null);
      try {
        const res = await adminFetch(`/api/admin/providers/${selectedProviderId}/sync`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subcategoryId: parseInt(targetSubcategoryId),
            subSubCategoryId: targetSubSubCategoryId ? parseInt(targetSubSubCategoryId) : undefined,
            productIds: selectedProducts.length ? selectedProducts : undefined,
            markupPercent, globalImageUrl: globalImageUrl || undefined
          })
        });
        setSyncResult(await res.json());
      } catch (e: any) { setSyncResult({ error: e.message }); }
      setSyncLoading(false);
    };

    // ── تحديث الطلبات ─────────────────────────────────────────────────────
    const handleRefreshOrders = async () => {
      setRefreshLoading(true); setRefreshResult(null);
      try {
        const res = await adminFetch("/api/admin/ahminix/refresh-orders", { method: "POST" });
        setRefreshResult(await res.json());
      } catch (e: any) { setRefreshResult({ error: e.message }); }
      setRefreshLoading(false);
    };

    // ── فحص طلب ───────────────────────────────────────────────────────────
    const handleCheckOrder = async () => {
      if (!checkOrderId.trim()) return;
      if (!selectedProviderId) { showToast("اختر مزوداً أولاً", "info"); return; }
      setCheckLoading(true); setCheckResult(null);
      try {
        const raw = checkOrderId.trim();
        const isUuid = raw.includes("-");
        const res = await adminFetch(`/api/admin/providers/${selectedProviderId}/check-order/${encodeURIComponent(raw)}${isUuid ? "?uuid=1" : ""}`);
        setCheckResult(await res.json());
      } catch (e: any) { setCheckResult({ error: e.message }); }
      setCheckLoading(false);
    };

    const toggleProduct = (id: number) =>
      setSelectedProducts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

    const filteredProducts = providerProducts.filter(p =>
      (!searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (!categoryFilter || p.category_name === categoryFilter)
    );
    const uniqueCategories = [...new Set(providerProducts.map((p: any) => p.category_name).filter(Boolean))];

    return (
      <div className="space-y-5 pb-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-[var(--brand)] to-[var(--brand-dark)] p-6 rounded-2xl text-white">
          <div className="flex items-center gap-3 mb-2">
            <ExternalLink size={24}/>
            <h2 className="text-xl font-bold">إدارة المزودين الخارجيين</h2>
          </div>
          <p className="text-white/80 text-sm">ربط مزودي API المتعددين — التوكنات مشفرة بـ AES-256</p>
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────────── */}
        <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
          {([
            { key: "providers", label: "المزودون", icon: "🔌" },
            { key: "products",  label: "المنتجات",  icon: "📦" },
            { key: "orders",    label: "الطلبات",   icon: "🔄" },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === t.key ? "bg-white text-[var(--brand)] shadow-sm" : "text-gray-500"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            TAB 1: المزودون
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "providers" && (
          <div className="space-y-4">

            {/* زر إضافة مزود */}
            <button onClick={() => { setEditingProvider(null); setProviderFormData({ name: "", base_url: "", api_token: "", notes: "" }); setShowProviderForm(true); }}
              className="w-full bg-[var(--brand)] text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm">
              <Plus size={18}/> إضافة مزود جديد
            </button>

            {/* نموذج إضافة / تعديل */}
            {showProviderForm && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-5 py-4 flex items-center justify-between">
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    {editingProvider ? <><Pencil size={15}/> تعديل المزود</> : <><Plus size={15}/> مزود جديد</>}
                  </h3>
                  <button onClick={() => { setShowProviderForm(false); setEditingProvider(null); }} className="text-white/70 hover:text-white">
                    <X size={18}/>
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">الاسم <span className="text-red-400">*</span></label>
                    <input type="text" placeholder="مثال: FastCard" value={providerFormData.name}
                      onChange={e => setProviderFormData(p => ({ ...p, name: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--brand)] transition-colors"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">رابط API Base URL <span className="text-red-400">*</span></label>
                    <input type="url" placeholder="https://example.com/client/api" value={providerFormData.base_url}
                      onChange={e => setProviderFormData(p => ({ ...p, base_url: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--brand)] transition-colors font-mono text-xs" dir="ltr"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                      API Token {editingProvider ? <span className="text-gray-400 font-normal">(اتركه فارغاً للإبقاء على الحالي)</span> : <span className="text-red-400">*</span>}
                    </label>
                    <input type="password" placeholder={editingProvider ? "••••••• (لم يتغير)" : "أدخل التوكن — يُشفَّر تلقائياً"} value={providerFormData.api_token}
                      onChange={e => setProviderFormData(p => ({ ...p, api_token: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--brand)] transition-colors font-mono" dir="ltr"/>
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">🔒 مشفر بـ AES-256-GCM — لا يظهر في أي مكان بعد الحفظ</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">ملاحظات <span className="text-gray-400 font-normal">(اختياري)</span></label>
                    <input type="text" placeholder="مثال: مزود ألعاب" value={providerFormData.notes}
                      onChange={e => setProviderFormData(p => ({ ...p, notes: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--brand)] transition-colors"/>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button onClick={() => { setShowProviderForm(false); setEditingProvider(null); }}
                      className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold text-sm">إلغاء</button>
                    <button onClick={handleSaveProvider} disabled={savingProvider}
                      className="flex-1 bg-[var(--brand)] text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                      {savingProvider ? <><RefreshCw size={14} className="animate-spin"/> جاري...</> : <><CheckCircle size={14}/> {editingProvider ? "حفظ التعديلات" : "إضافة المزود"}</>}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* قائمة المزودين */}
            {loadingProviders ? (
              <div className="flex items-center justify-center py-10 gap-3">
                <RefreshCw size={20} className="animate-spin text-[var(--brand)]"/>
                <span className="text-sm text-gray-500">جاري التحميل...</span>
              </div>
            ) : providers.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-8 text-center border border-dashed border-gray-200">
                <ExternalLink size={36} className="mx-auto mb-3 text-gray-300"/>
                <p className="font-bold text-gray-500 text-sm mb-1">لا يوجد مزودون</p>
                <p className="text-xs text-gray-400">أضف مزوداً للبدء في استيراد المنتجات</p>
              </div>
            ) : (
              <div className="space-y-3">
                {providers.map(prov => (
                  <div key={prov.id}
                    className={`bg-white rounded-2xl border-2 transition-all overflow-hidden ${selectedProviderId === prov.id ? "border-[var(--brand)] shadow-md" : "border-gray-100"}`}>
                    {/* رأس البطاقة */}
                    <div className="p-4 flex items-center gap-3 cursor-pointer" onClick={() => setSelectedProviderId(selectedProviderId === prov.id ? null : prov.id)}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${prov.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                        {prov.name[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-800 text-sm truncate">{prov.name}</p>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${prov.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {prov.is_active ? "نشط" : "معطل"}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono truncate mt-0.5">{prov.base_url}</p>
                        {prov.notes && <p className="text-[10px] text-gray-400 mt-0.5 italic">{prov.notes}</p>}
                      </div>
                      <ChevronDown size={16} className={`text-gray-400 transition-transform flex-shrink-0 ${selectedProviderId === prov.id ? "rotate-180" : ""}`}/>
                    </div>

                    {/* أزرار الإجراءات */}
                    {selectedProviderId === prov.id && (
                      <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
                        {/* أزرار الإجراءات */}
                        <div className="grid grid-cols-4 gap-2">
                          <button onClick={() => { setActiveTab("products"); }}
                            className="bg-blue-50 text-blue-700 py-2.5 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1">
                            <Download size={14}/> استيراد
                          </button>
                          <button onClick={loadProviderProfile} disabled={loadingProfile}
                            className="bg-green-50 text-green-700 py-2.5 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 disabled:opacity-50">
                            <Wallet size={14}/> الرصيد
                          </button>
                          <button onClick={() => { setEditingProvider(prov); setProviderFormData({ name: prov.name, base_url: prov.base_url, api_token: "", notes: prov.notes || "" }); setShowProviderForm(true); }}
                            className="bg-amber-50 text-amber-700 py-2.5 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1">
                            <Pencil size={14}/> تعديل
                          </button>
                          <button onClick={() => handleDeleteProvider(prov.id)} disabled={deletingId === prov.id}
                            className="bg-red-50 text-red-600 py-2.5 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 disabled:opacity-50">
                            <Trash2 size={14}/> حذف
                          </button>
                        </div>

                        {/* زر تبديل الحالة */}
                        <button onClick={() => handleToggleProvider(prov.id, prov.is_active)}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${prov.is_active ? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600" : "bg-green-50 text-green-700"}`}>
                          {prov.is_active ? "⏸ تعطيل المزود" : "▶ تفعيل المزود"}
                        </button>

                        {/* بيانات الحساب */}
                        {providerProfile && (
                          providerProfile.error ? (
                            <div className="bg-red-50 p-3 rounded-xl text-red-600 text-xs">{providerProfile.error}</div>
                          ) : (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-gray-50 p-3 rounded-xl text-center">
                                <p className="text-[9px] text-gray-400 mb-1">البريد الإلكتروني</p>
                                <p className="font-bold text-gray-800 text-xs truncate">{providerProfile.email || "—"}</p>
                              </div>
                              <div className="bg-green-50 p-3 rounded-xl text-center">
                                <p className="text-[9px] text-gray-400 mb-1">الرصيد</p>
                                <p className="font-bold text-green-700 text-base">{parseFloat(providerProfile.balance || 0).toFixed(3)} $</p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 2: المنتجات — استيراد ومزامنة
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "products" && (
          <div className="space-y-4">

            {/* اختيار المزود */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                <ExternalLink size={16} className="text-[var(--brand)]"/> اختر المزود
              </h3>
              {providers.filter(p => p.is_active).length === 0 ? (
                <div className="bg-amber-50 p-3 rounded-xl text-amber-700 text-xs font-bold text-center">
                  لا يوجد مزود نشط — أضف مزوداً من تبويب المزودون أولاً
                </div>
              ) : (
                <div className="space-y-2">
                  {providers.filter(p => p.is_active).map(prov => (
                    <button key={prov.id} onClick={() => setSelectedProviderId(prov.id)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-right ${selectedProviderId === prov.id ? "border-[var(--brand)] bg-red-50" : "border-gray-100 bg-gray-50 hover:border-gray-200"}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${selectedProviderId === prov.id ? "bg-[var(--brand)] text-white" : "bg-white text-gray-600 border border-gray-200"}`}>
                        {prov.name[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 text-right">
                        <p className={`font-bold text-sm ${selectedProviderId === prov.id ? "text-[var(--brand)]" : "text-gray-700"}`}>{prov.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{prov.base_url}</p>
                      </div>
                      {selectedProviderId === prov.id && <CheckCircle size={18} className="text-[var(--brand)] flex-shrink-0"/>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedProviderId && (
              <>
                {/* إعدادات الاستيراد */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                    <Download size={16} className="text-[var(--brand)]"/> إعدادات الاستيراد
                  </h3>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">القسم الفرعي <span className="text-red-400">*</span></label>
                    <select value={targetSubcategoryId} onChange={e => { setTargetSubcategoryId(e.target.value); setTargetSubSubCategoryId(""); }}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--brand)]">
                      <option value="">-- اختر القسم الفرعي --</option>
                      {localSubcats.map((s: any) => <option key={s.id} value={s.id}>{s.name} (#{s.id})</option>)}
                    </select>
                  </div>
                  {targetSubcategoryId && localSubSubs.filter((ss: any) => String(ss.subcategory_id) === String(targetSubcategoryId)).length > 0 && (
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">فرع فرعي <span className="text-gray-300">(اختياري)</span></label>
                      <select value={targetSubSubCategoryId} onChange={e => setTargetSubSubCategoryId(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none">
                        <option value="">-- بدون فرع فرعي --</option>
                        {localSubSubs.filter((ss: any) => String(ss.subcategory_id) === String(targetSubcategoryId)).map((ss: any) => <option key={ss.id} value={ss.id}>{ss.name} (#{ss.id})</option>)}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">نسبة الربح %</label>
                    <input type="number" min={0} max={500} value={markupPercent} onChange={e => setMarkupPercent(parseFloat(e.target.value) || 0)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none" placeholder="0 = بدون هامش"/>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">صورة موحدة <span className="text-gray-300">(اختياري)</span></label>
                    <div className="flex gap-2">
                      <input type="text" value={globalImageUrl} onChange={e => setGlobalImageUrl(e.target.value)}
                        className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none" placeholder="https://... رابط الصورة"/>
                      <label className="bg-gray-100 text-gray-600 px-3 py-3 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 whitespace-nowrap hover:bg-gray-200 transition-colors">
                        <Upload size={14}/> رفع
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0]; if (!file) return;
                          try {
                            const formData = new FormData(); formData.append("image", file);
                            const imgbbKey = (import.meta as any).env.VITE_IMGBB_API_KEY || "97ffbf56fe1a203445531d664cd4b928";
                            const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, { method: "POST", body: formData });
                            const data = await res.json();
                            if (data.success) setGlobalImageUrl(data.data.url);
                            else showToast("فشل رفع الصورة", "error");
                          } catch { showToast("خطأ في رفع الصورة", "error"); }
                        }}/>
                      </label>
                    </div>
                    {globalImageUrl && (
                      <div className="mt-2 flex items-center gap-2">
                        <img loading="lazy" src={globalImageUrl} className="w-12 h-12 object-cover rounded-lg border border-gray-100" referrerPolicy="no-referrer"/>
                        <button onClick={() => setGlobalImageUrl("")} className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-lg">حذف</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* جلب المنتجات وعرضها */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm"><Download size={16} className="text-[var(--brand)]"/>منتجات المزود</h3>
                    <button onClick={loadProviderProducts} disabled={loadingProducts}
                      className="bg-[var(--brand)] text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50 flex items-center gap-1">
                      <RefreshCw size={12} className={loadingProducts ? "animate-spin" : ""}/>{loadingProducts ? "جاري..." : "جلب المنتجات"}
                    </button>
                  </div>

                  {loadingProducts && (
                    <div className="flex items-center justify-center py-8 gap-3">
                      <RefreshCw size={20} className="animate-spin text-[var(--brand)]"/>
                      <span className="text-sm text-gray-500">جاري الجلب...</span>
                    </div>
                  )}

                  {!loadingProducts && providerProducts.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-600">المنتجات ({providerProducts.length})</p>
                        <div className="flex gap-2">
                          <button onClick={() => setSelectedProducts(filteredProducts.map((p: any) => p.id))} className="text-xs text-[var(--brand)] font-bold">تحديد الكل</button>
                          <span className="text-gray-300">|</span>
                          <button onClick={() => setSelectedProducts([])} className="text-xs text-gray-400 font-bold">إلغاء الكل</button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                          <input type="text" placeholder="بحث..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl pr-8 pl-3 py-2 text-xs outline-none"/>
                        </div>
                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                          className="bg-gray-50 border border-gray-100 rounded-xl px-2 py-2 text-xs outline-none max-w-[100px]">
                          <option value="">الكل</option>
                          {uniqueCategories.map((c: any) => <option key={String(c)} value={String(c)}>{String(c)}</option>)}
                        </select>
                      </div>
                      {selectedProducts.length > 0 && (
                        <div className="bg-red-50 text-[var(--brand)] text-xs font-bold px-3 py-2 rounded-xl">
                          تم تحديد {selectedProducts.length} منتج
                        </div>
                      )}
                      <div className="space-y-2 max-h-72 overflow-y-auto rounded-xl border border-gray-100">
                        {filteredProducts.length === 0 ? (
                          <div className="text-center py-6 text-gray-400 text-xs">لا توجد منتجات مطابقة</div>
                        ) : filteredProducts.map((p: any) => (
                          <div key={p.id} onClick={() => toggleProduct(p.id)}
                            className={`flex items-center gap-3 p-3 cursor-pointer transition-all ${selectedProducts.includes(p.id) ? "bg-red-50 border-r-2 border-[var(--brand)]" : "bg-white hover:bg-gray-50"}`}>
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${selectedProducts.includes(p.id) ? "border-[var(--brand)] bg-[var(--brand)]" : "border-gray-300"}`}>
                              {selectedProducts.includes(p.id) && <CheckCircle size={12} className="text-white"/>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-800 truncate">{p.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-gray-400">{p.category_name}</span>
                                <span className="text-[10px] font-bold text-[var(--brand)]">{p.price} $</span>
                                {p.id && <span className="text-[9px] text-gray-300">#{p.id}</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!loadingProducts && productsFetched && providerProducts.length === 0 && (
                    <div className="text-center py-6 bg-red-50 rounded-xl border border-red-100">
                      <Download size={32} className="mx-auto mb-2 text-red-300"/>
                      <p className="text-xs text-red-600 font-bold">لم يتم العثور على منتجات</p>
                      <p className="text-[10px] text-red-400 mt-1">تحقق من إعدادات المزود</p>
                    </div>
                  )}

                  {!loadingProducts && !productsFetched && (
                    <div className="text-center py-6 bg-gray-50 rounded-xl">
                      <Download size={32} className="mx-auto mb-2 text-gray-300"/>
                      <p className="text-xs text-gray-400">اضغط "جلب المنتجات" لعرض المنتجات</p>
                    </div>
                  )}

                  {/* زر الاستيراد */}
                  <button onClick={handleSync} disabled={syncLoading || !targetSubcategoryId}
                    className="w-full bg-[var(--brand)] text-white py-3.5 rounded-xl font-bold disabled:opacity-40 flex items-center justify-center gap-2">
                    <Download size={16} className={syncLoading ? "animate-bounce" : ""}/>
                    {syncLoading ? "جاري الاستيراد..." : selectedProducts.length ? `استيراد ${selectedProducts.length} منتج` : "استيراد كل المنتجات"}
                  </button>

                  {syncResult && (
                    <div className={`p-4 rounded-xl text-sm ${syncResult.error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                      {syncResult.error ? `خطأ: ${syncResult.error}` : (
                        <div className="space-y-1">
                          <p className="font-bold">✅ اكتمل الاستيراد — {syncResult.provider}</p>
                          <p>مضاف: {syncResult.summary?.added} · محدّث: {syncResult.summary?.updated} · تجاوز: {syncResult.summary?.skipped}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 3: الطلبات — تحديث وفحص
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "orders" && (
          <div className="space-y-4">

            {/* تحديث كل الطلبات */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                <RefreshCw size={16} className="text-[var(--brand)]"/> تحديث حالة الطلبات
              </h3>
              <p className="text-xs text-gray-500">يفحص جميع الطلبات بحالة "processing" ويحدّثها من جميع المزودين تلقائياً</p>
              <button onClick={handleRefreshOrders} disabled={refreshLoading}
                className="w-full bg-[var(--brand)] text-white py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                <RefreshCw size={16} className={refreshLoading ? "animate-spin" : ""}/>
                {refreshLoading ? "جاري التحديث..." : "تحديث جميع الطلبات"}
              </button>
              {refreshResult && (
                <div className={`p-4 rounded-xl text-sm font-medium ${refreshResult.error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                  {refreshResult.error ? `خطأ: ${refreshResult.error}` : `✅ تم تحديث ${refreshResult.updated} طلب`}
                </div>
              )}
            </div>

            {/* فحص طلب محدد */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                <Search size={16} className="text-[var(--brand)]"/> فحص طلب محدد
              </h3>

              {/* اختيار المزود للفحص */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">المزود</label>
                <select value={selectedProviderId || ""} onChange={e => setSelectedProviderId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none">
                  <option value="">-- اختر المزود --</option>
                  {providers.filter(p => p.is_active).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="flex gap-2">
                <input type="text" placeholder="ID الطلب أو UUID" value={checkOrderId} onChange={e => setCheckOrderId(e.target.value)}
                  className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none border border-gray-100" dir="ltr"/>
                <button onClick={handleCheckOrder} disabled={checkLoading || !selectedProviderId}
                  className="bg-[var(--brand)] text-white px-4 py-3 rounded-xl font-bold text-sm disabled:opacity-50">
                  {checkLoading ? "..." : "فحص"}
                </button>
              </div>

              {checkResult && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  {checkResult.error ? (
                    <p className="text-red-500 text-sm">{checkResult.error}</p>
                  ) : checkResult.data?.[0] ? (() => {
                    const d = checkResult.data[0];
                    const replayCodes: string[] = (() => {
                      if (!d.replay_api) return [];
                      const arr = Array.isArray(d.replay_api) ? d.replay_api : [d.replay_api];
                      return arr.filter(Boolean).map((x: any) => {
                        if (typeof x === "string") return x;
                        if (typeof x === "number") return String(x);
                        if (typeof x === "object") { const v = x.replay ?? x.code ?? x.value ?? null; return v !== null ? String(v) : JSON.stringify(x); }
                        return String(x);
                      });
                    })();
                    const statusColor = d.status === "accept" ? "text-green-700 bg-green-100" : d.status === "reject" ? "text-red-700 bg-red-100" : "text-amber-700 bg-amber-100";
                    return (
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-gray-400 border-b border-gray-200 pb-2">تفاصيل الطلب</p>
                        {d.order_id !== undefined && <div className="flex justify-between"><span className="text-gray-500 text-sm">رقم العملية</span><span className="font-bold text-sm">{d.order_id}</span></div>}
                        {d.product_name && <div className="flex justify-between gap-2"><span className="text-gray-500 text-sm shrink-0">المنتج</span><span className="font-bold text-xs text-left">{d.product_name}</span></div>}
                        {d.qty !== undefined && <div className="flex justify-between"><span className="text-gray-500 text-sm">الكمية</span><span className="font-bold text-sm">{d.qty}</span></div>}
                        <div className="flex justify-between items-center"><span className="text-gray-500 text-sm">الحالة</span><span className={`font-bold text-sm px-3 py-1 rounded-full ${statusColor}`}>{d.status}</span></div>
                        {replayCodes.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-gray-500 text-sm font-semibold">الرد</p>
                            <div className="bg-white p-3 rounded-xl border border-gray-200">
                              <p className="text-xs text-gray-800 font-mono break-all whitespace-pre-wrap">{replayCodes.join("\n")}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })() : <p className="text-gray-500 text-sm text-center">لم يتم العثور على الطلب</p>}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    );
  };


const OrderPollingStatus = ({ externalOrderId, onStatusChange }: { externalOrderId: string; onStatusChange: (status: string, replayApi: any[]) => void }) => {
  const [polling, setPolling] = React.useState(false);
  const [pollCount, setPollCount] = React.useState(0);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    if (!externalOrderId || done) return;
    let cancelled = false;
    let attempts = 0;
    const interval = setInterval(async () => {
      if (cancelled) { clearInterval(interval); return; }
      attempts++;
      setPollCount(attempts);
      setPolling(true);
      try {
        const token = localStorage.getItem("authToken") || "";
        if (!token) { clearInterval(interval); setDone(true); return; }
        const res = await fetch(`/api/orders/check-external/${encodeURIComponent(externalOrderId)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) { setPolling(false); return; }
        const data = await res.json();
        const status = (data?.status || "").toLowerCase();
        // الـ API قد يُرجع: accept/completed أو reject/rejected/cancelled
        const isFinal = status === "accept" || status === "completed" || status === "reject" || status === "rejected" || status === "cancelled";
        if (isFinal) {
          clearInterval(interval);
          setDone(true);
          onStatusChange(status, Array.isArray(data.replay_api) ? data.replay_api : []);
        }
        // أي حالة أخرى = لا تزال في المعالجة، نكمل الـ polling
      } catch {}
      setPolling(false);
    }, 8000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [externalOrderId]);

  if (done) return null;
  return (
    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-1">
      <div className="flex items-center gap-2">
        {polling
          ? <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"/>
          : <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"/>}
        <p className="text-xs font-bold text-amber-700">جاري متابعة حالة الطلب تلقائياً...</p>
      </div>
      <p className="text-[10px] text-amber-500">المحاولة {pollCount} · يتحقق كل 8 ثوانٍ · ينتهي تلقائياً عند تغيير الحالة</p>
    </div>
  );
};

const AdminUserCard = ({ u, fetchAdminUsers, handleToggleVip, handleBlockUser, handleDeleteUser, handleSendNotification, onOpenChat, onViewOrders, onViewTransactions }: any) => {
  const [showNotif, setShowNotif] = React.useState(false);
  const [nt, setNt] = React.useState("");
  const [nb, setNb] = React.useState("");
  const [showDetails, setShowDetails] = React.useState(false);
  const [showBalance, setShowBalance] = React.useState(false);
  const [newBal, setNewBal] = React.useState(u.balance?.toString() || "0");
  const [userDetails, setUserDetails] = React.useState<any>(null);
  const [detailsLoading, setDetailsLoading] = React.useState(false);

  const loadDetails = async () => {
    if (userDetails) return;
    setDetailsLoading(true);
    try {
      const [statsRes, ordersRes, txRes] = await Promise.all([
        adminFetch(`/api/admin/users/${u.id}/details`),
        adminFetch(`/api/admin/users/${u.id}/orders-count`),
        adminFetch(`/api/admin/users/${u.id}/transactions-count`),
      ]);
      const stats = statsRes.ok ? await statsRes.json() : {};
      const ordersData = ordersRes.ok ? await ordersRes.json() : {};
      const txData = txRes.ok ? await txRes.json() : {};
      setUserDetails({ ...stats, ...ordersData, ...txData });
    } catch(e) {}
    setDetailsLoading(false);
  };

  const handleSaveBalance = async () => {
    const val = parseFloat(newBal);
    if (isNaN(val)) return;
    const res = await adminFetch(`/api/admin/users/${u.id}/balance`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({amount: val})
    });
    if (res.ok) { fetchAdminUsers(); setShowBalance(false); }
  };



  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header Row */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border-2 border-white shadow">
          {u.avatar_url ? <img loading="lazy" src={u.avatar_url} className="w-full h-full object-cover" referrerPolicy="no-referrer"/> : <User size={20} className="text-gray-400"/>}
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
        {/* Details arrow */}
        <button onClick={() => { setShowDetails(!showDetails); if (!showDetails) loadDetails(); }}
          className="p-2 rounded-xl bg-gray-50 text-gray-500 active:scale-90 transition-all">
          {showDetails ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
        </button>
      </div>

      {/* Details Panel */}
      {showDetails && (
        <div className="border-t border-gray-50 bg-gray-50/60 px-4 py-3 space-y-2">
          {detailsLoading ? (
            <p className="text-center text-xs text-gray-400 py-2">جاري التحميل...</p>
          ) : (
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Mail size={11} className="text-gray-400 shrink-0"/>
                  <span className="text-[10px] text-gray-500 truncate">{u.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone size={11} className="text-gray-400 shrink-0"/>
                  <span className="text-[10px] text-gray-500">{u.phone || "—"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <KeyRound size={11} className="text-gray-400 shrink-0"/>
                  <span className="text-[10px] text-gray-500">رقم الدخول: #{u.id}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={11} className="text-gray-400 shrink-0"/>
                  <span className="text-[10px] text-gray-500">{u.created_at ? new Date(u.created_at).toLocaleDateString("ar") : "—"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wallet size={11} className="text-green-500 shrink-0"/>
                  <span className="text-[10px] text-green-700 font-bold">{u.balance?.toFixed(2)} $</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Share2 size={11} className="text-purple-400 shrink-0"/>
                  <span className="text-[10px] text-gray-500">إحالات: {userDetails?.referral_count ?? "—"}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => onViewOrders && onViewOrders(u)}
                  className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-700 py-1.5 rounded-xl text-[10px] font-bold">
                  <ShoppingBag size={11}/> إجمالي الطلبات: {userDetails?.orders_count ?? "—"} ▼
                </button>
                <button onClick={() => onViewTransactions && onViewTransactions(u)}
                  className="flex-1 flex items-center justify-center gap-1 bg-green-50 text-green-700 py-1.5 rounded-xl text-[10px] font-bold">
                  <Wallet size={11}/> إجمالي المدفوعات: {userDetails?.transactions_count ?? "—"} ▼
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="border-t border-gray-50 px-3 py-2.5 flex items-center gap-2 flex-wrap">
        <button onClick={() => setShowBalance(!showBalance)}
          className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-[11px] font-bold active:scale-95">
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
        <button onClick={() => onOpenChat && onOpenChat(u)}
          className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-[11px] font-bold active:scale-95">
          <MessageCircle size={12}/> دردشة
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

      {/* Inline Balance Editor */}
      {showBalance && (
        <div className="border-t border-green-50 bg-green-50/40 px-4 py-3 space-y-2">
          <p className="text-[11px] font-bold text-green-700">تعديل رصيد {u.name}</p>
          <div className="flex gap-2">
            <input type="number" value={newBal} onChange={e => setNewBal(e.target.value)}
              className="flex-1 p-2.5 bg-white rounded-xl text-xs outline-none border border-green-100 text-center font-bold"
              placeholder="0.00"/>
            <button onClick={handleSaveBalance}
              className="bg-green-600 text-white px-4 rounded-xl text-xs font-bold active:scale-95">
              حفظ
            </button>
            <button onClick={() => setShowBalance(false)}
              className="bg-gray-100 text-gray-600 px-3 rounded-xl text-xs font-bold active:scale-95">
              <X size={12}/>
            </button>
          </div>
        </div>
      )}

      {/* Notification Panel */}
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

// ===================== ADMIN STATS TAB =====================
const AdminStatsTab = ({ adminFetch }: { adminFetch: any }) => {
  const [filter, setFilter] = React.useState<"daily"|"weekly"|"monthly"|"custom">("monthly");
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/analytics?filter=${filter}`;
      if (filter === "custom" && customFrom && customTo) {
        url += `&from=${customFrom}&to=${customTo}`;
      }
      const res = await adminFetch(url);
      if (res.ok) setData(await res.json());
    } catch(e) {}
    setLoading(false);
  };

  const handleReset = async () => {
    const res = await adminFetch("/api/admin/analytics/reset", { method: "POST", headers: {"Content-Type":"application/json"} });
    if (res.ok) { showToast("✅ تم تصفير الأرباح", 'success'); fetchStats(); }
    setShowResetConfirm(false);
  };

  React.useEffect(() => { fetchStats(); }, [filter]);

  const stats = data || { accepted_orders: 0, rejected_orders: 0, total_payments: 0, gross_revenue: 0, api_cost: 0, profit: 0, profit_margin: 0, net_margin: 0, orders_with_cost: 0, orders_without_cost: 0 };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-black text-gray-800 flex items-center gap-2"><BarChart2 size={18} className="text-brand"/> الإحصائيات</h2>
        <button onClick={fetchStats} className="p-2 bg-gray-50 rounded-xl text-gray-400 active:scale-90"><RefreshCcw size={15}/></button>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
        {([
          {key:"daily", label:"يومي"},
          {key:"weekly", label:"أسبوعي"},
          {key:"monthly", label:"شهري"},
          {key:"custom", label:"مخصص"},
        ] as any[]).map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all ${filter===f.key?"bg-white text-brand shadow-sm":"text-gray-500"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {filter === "custom" && (
        <div className="flex gap-2">
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 mb-1">من</p>
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
              className="w-full p-2.5 bg-white rounded-xl text-xs outline-none border border-gray-100"/>
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 mb-1">إلى</p>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
              className="w-full p-2.5 bg-white rounded-xl text-xs outline-none border border-gray-100"/>
          </div>
          <div className="flex items-end">
            <button onClick={fetchStats} className="bg-brand text-white px-4 py-2.5 rounded-xl text-xs font-bold">بحث</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">جاري التحميل...</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} className="text-green-500"/>
                <p className="text-[11px] font-bold text-green-700">الطلبات المقبولة</p>
              </div>
              <p className="text-2xl font-black text-green-700">{stats.accepted_orders}</p>
            </div>
            <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <XCircle size={16} className="text-red-400"/>
                <p className="text-[11px] font-bold text-red-600">الطلبات المرفوضة</p>
              </div>
              <p className="text-2xl font-black text-red-600">{stats.rejected_orders}</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Wallet size={16} className="text-blue-500"/>
                <p className="text-[11px] font-bold text-blue-700">إجمالي المدفوعات</p>
              </div>
              <p className="text-2xl font-black text-blue-700">{stats.total_payments?.toFixed(2)} $</p>
            </div>
            <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-purple-500"/>
                <p className="text-[11px] font-bold text-purple-700">الإيرادات</p>
              </div>
              <p className="text-2xl font-black text-purple-700">{stats.gross_revenue?.toFixed(2)} $</p>
            </div>
          </div>

          {/* Profit Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-amber-600"/>
                <p className="font-bold text-amber-800">صافي الأرباح</p>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                ربح: {stats.profit_margin?.toFixed(1)}% | هامش: {stats.net_margin?.toFixed(1)}%
              </span>
            </div>
            <p className={`text-3xl font-black ${(stats.profit || 0) >= 0 ? "text-amber-700" : "text-red-600"}`}>
              {(stats.profit || 0) >= 0 ? "+" : ""}{(stats.profit || 0).toFixed(2)} $
            </p>
            <div className="mt-3 bg-white/60 rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-500">سعر البيع (إيرادات)</span>
                <span className="font-bold text-green-600">+ {(stats.gross_revenue || 0).toFixed(2)} $</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-500">تكلفة API (سعر الشراء)</span>
                <span className="font-bold text-red-500">- {(stats.api_cost || 0).toFixed(2)} ${stats.orders_without_cost > 0 && stats.orders_with_cost === 0 ? " ⚠️" : ""}</span>
              </div>
              <div className="border-t border-gray-200 pt-1.5 flex justify-between text-[11px]">
                <span className="font-bold text-gray-700">صافي الربح</span>
                <span className={`font-black ${(stats.profit || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {(stats.profit || 0) >= 0 ? "+" : ""}{(stats.profit || 0).toFixed(2)} $
                </span>
              </div>
              {(stats.orders_without_cost > 0) && (
                <p className="text-[9px] text-amber-600 bg-amber-50 rounded-lg px-2 py-1 mt-1">
                  ⚠️ {stats.orders_without_cost} طلب بدون سعر تكلفة (price_per_unit = 0) — تحقق من إعداد المنتجات
                </p>
              )}
            </div>
          </div>

          {/* Reset Button */}
          {!showResetConfirm ? (
            <button onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-500 py-3 rounded-2xl text-sm font-bold active:scale-95">
              <RotateCcw size={14}/> تصفير الأرباح
            </button>
          ) : (
            <div className="bg-red-50 rounded-2xl p-4 border border-red-100 space-y-3">
              <p className="text-sm font-bold text-red-700 text-center">هل أنت متأكد من تصفير سجل الأرباح؟</p>
              <div className="flex gap-2">
                <button onClick={handleReset} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-bold">تأكيد التصفير</button>
                <button onClick={() => setShowResetConfirm(false)} className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm font-bold">إلغاء</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const AdminHomeTab = ({adminUsers, adminOrders, adminTransactions, setAdminTab, fetchUser, fetchAdminUsers, handleToggleVip, handleBlockUser, handleDeleteUser, handleSendNotification, onOpenChatWithUser}: any) => {
  const [userSearch, setUserSearch] = React.useState("");
  const [userOrdersModal, setUserOrdersModal] = React.useState<any>(null);
  const [userTxModal, setUserTxModal] = React.useState<any>(null);
  const [userOrdersList, setUserOrdersList] = React.useState<any[]>([]);
  const [userTxList, setUserTxList] = React.useState<any[]>([]);
  const [modalLoading, setModalLoading] = React.useState(false);

  const filtered = adminUsers.filter(u =>
    !userSearch || u.name?.includes(userSearch) || u.email?.includes(userSearch) || String(u.id).includes(userSearch)
  );

  const openUserOrders = async (u: any) => {
    setUserOrdersModal(u);
    setModalLoading(true);
    try {
      const res = await adminFetch(`/api/admin/users/${u.id}/orders`);
      const data = res.ok ? await res.json() : [];
      setUserOrdersList(Array.isArray(data) ? data : []);
    } catch(e) { setUserOrdersList([]); }
    setModalLoading(false);
  };

  const openUserTx = async (u: any) => {
    setUserTxModal(u);
    setModalLoading(true);
    try {
      const res = await adminFetch(`/api/admin/users/${u.id}/transactions`);
      const data = res.ok ? await res.json() : [];
      setUserTxList(Array.isArray(data) ? data : []);
    } catch(e) { setUserTxList([]); }
    setModalLoading(false);
  };

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
        <input type="text" placeholder="بحث بالاسم أو ID أو إيميل..." value={userSearch} onChange={e => setUserSearch(e.target.value)}
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
          onOpenChat={(user: any) => { onOpenChatWithUser && onOpenChatWithUser(user); }}
          onViewOrders={openUserOrders}
          onViewTransactions={openUserTx}
        />
      ))}
    </div>

    {/* Modal: طلبات المستخدم */}
    {userOrdersModal && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setUserOrdersModal(null)}>
        <div className="bg-white w-full rounded-t-3xl max-h-[75vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-white p-4 flex items-center justify-between border-b border-gray-100">
            <p className="font-bold text-sm">طلبات {userOrdersModal.name}</p>
            <button onClick={() => setUserOrdersModal(null)}><X size={18}/></button>
          </div>
          <div className="p-4 space-y-2">
            {modalLoading ? <p className="text-center text-sm text-gray-400 py-6">جاري التحميل...</p> :
              userOrdersList.length === 0 ? <p className="text-center text-sm text-gray-400 py-6">لا توجد طلبات</p> :
              userOrdersList.map((o: any) => (
                <div key={o.id} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-700">#{o.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${o.status==='accepted'?'bg-green-100 text-green-700':o.status==='rejected'?'bg-red-100 text-red-600':'bg-yellow-100 text-yellow-700'}`}>{o.status}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">{o.total_amount?.toFixed(2)} $</p>
                  <p className="text-[10px] text-gray-400">{o.created_at ? new Date(o.created_at).toLocaleDateString("ar") : ""}</p>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    )}

    {/* Modal: مدفوعات المستخدم */}
    {userTxModal && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setUserTxModal(null)}>
        <div className="bg-white w-full rounded-t-3xl max-h-[75vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-white p-4 flex items-center justify-between border-b border-gray-100">
            <p className="font-bold text-sm">مدفوعات {userTxModal.name}</p>
            <button onClick={() => setUserTxModal(null)}><X size={18}/></button>
          </div>
          <div className="p-4 space-y-2">
            {modalLoading ? <p className="text-center text-sm text-gray-400 py-6">جاري التحميل...</p> :
              userTxList.length === 0 ? <p className="text-center text-sm text-gray-400 py-6">لا توجد مدفوعات</p> :
              userTxList.map((t: any) => (
                <div key={t.id} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-700">{t.amount?.toFixed(2)} $</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.status==='approved'?'bg-green-100 text-green-700':t.status==='rejected'?'bg-red-100 text-red-600':'bg-yellow-100 text-yellow-700'}`}>{t.status}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">{t.note || "—"}</p>
                  <p className="text-[10px] text-gray-400">{t.created_at ? new Date(t.created_at).toLocaleDateString("ar") : ""}</p>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

const AdminOrdersTab = ({adminOrders, orderSearch, setOrderSearch, orderDateFilter, setOrderDateFilter, fetchAdminOrders, adminFetch}: any) => {
  const [orderMode, setOrderMode] = React.useState<string>("manual");
  const [modeLoading, setModeLoading] = React.useState(false);
  const [modeLoaded, setModeLoaded] = React.useState(false);
  const [expandedOrderId, setExpandedOrderId] = React.useState<number|null>(null);
  const [overridePlayerIds, setOverridePlayerIds] = React.useState<Record<number, string>>({});
  React.useEffect(() => {
  fetch("/api/settings").then(r => r.json()).then((data: any[]) => {
  const s = data.find((x: any) => x.key === "order_processing_mode");
  setOrderMode(s?.value || "manual");
  setModeLoaded(true);
  }).catch(() => setModeLoaded(true));
  }, []);
  const toggleMode = async (newMode: string) => {
  setModeLoading(true);
  await adminFetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "order_processing_mode", value: newMode }) });
  setOrderMode(newMode);
  setModeLoading(false);
  };
  const handleOrderAction = async (orderId: number, action: "approved" | "rejected", adminResp?: string) => {
  const overrideId = overridePlayerIds[orderId]?.trim() || undefined;
  const body: any = { status: action, admin_response: adminResp || "" };
  if (action === "approved" && overrideId) body.override_player_id = overrideId;
  const res = await adminFetch(`/api/admin/orders/${orderId}/status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) {
    // خطأ حقيقي في السيرفر (ليس خطأ API)
    showToast(data.error || "حدث خطأ في السيرفر", 'error');
    fetchAdminOrders();
    return;
  }
  if (action === "approved") {
    if (data.finalStatus === "completed") {
      showToast("✅ تم التنفيذ بنجاح", 'success');
    } else if (data.apiError) {
      showToast(`⏳ تم إرسال الطلب — قيد المعالجة\n\nملاحظة: ${data.apiError}`, 'success');
    } else {
      showToast("⏳ تم الإرسال — قيد المعالجة", 'success');
    }
  }
  fetchAdminOrders();
  };
  const pendingAdminOrders = adminOrders.filter(o => o.status === 'pending_admin');
  const filteredOrders = adminOrders.filter(o => !orderSearch || o.product_name?.includes(orderSearch) || String(o.id).includes(orderSearch) || o.user_name?.includes(orderSearch));
  return (

  <div className="space-y-4">
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><Zap size={16} className="text-[var(--brand)]"/>وضع المعالجة</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">{orderMode === 'auto' ? "تلقائي - يُرسل للـ API فوراً" : "يدوي - ينتظر موافقتك"}</p>
        </div>
        {modeLoaded && (
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            <button onClick={() => toggleMode("auto")} disabled={modeLoading} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${orderMode === 'auto' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500'}`}>تلقائي</button>
            <button onClick={() => toggleMode("manual")} disabled={modeLoading} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${orderMode === 'manual' ? 'bg-[var(--brand)] text-white shadow-sm' : 'text-gray-500'}`}>يدوي</button>
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
          const savedPlayerId = metaParsed.playerId || metaParsed.input || metaParsed.player_id || "";
          const lastError = metaParsed.last_api_error || "";
          const productExtId = order.order_items?.[0]?.products?.external_id || "";
          const qty = order.order_items?.[0]?.quantity || 1;
          const currentOverride = overridePlayerIds[order.id];
          // إذا لم يعدّل الأدمن الحقل، نستخدم savedPlayerId تلقائياً
          const effectivePlayerId = (currentOverride !== undefined ? currentOverride : savedPlayerId).trim();
          return (
            <div key={order.id} className="border border-amber-100 rounded-xl bg-amber-50/40 p-4 space-y-3">
              <div>
                <p className="font-bold text-sm text-[var(--brand)]">#{order.id} - {order.product_name}</p>
                <p className="text-xs text-gray-500">{order.user_name} · {(order.total_amount || order.total_price || 0).toFixed(2)} $</p>
                {productExtId && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    <span className="font-bold">Product ID: </span><span className="font-mono">{productExtId}</span>
                    {qty > 1 && <span className="font-bold ml-2">الكمية: {qty}</span>}
                  </p>
                )}
                {savedPlayerId && (
                  <p className="text-xs text-gray-600 mt-1 font-mono break-all">
                    <span className="font-bold text-gray-500">Player ID: </span>{savedPlayerId}
                  </p>
                )}
                {lastError && (
                  <p className="text-xs text-red-500 mt-1 bg-red-50 rounded-lg px-2 py-1">⚠️ {lastError}</p>
                )}
              </div>
              <div>
                <p className="text-[10px] text-gray-400 mb-1">تعديل Player ID قبل القبول (اختياري)</p>
                <input
                  type="text"
                  placeholder={savedPlayerId || "أدخل Player ID..."}
                  value={currentOverride !== undefined ? currentOverride : savedPlayerId}
                  onChange={e => setOverridePlayerIds(prev => ({ ...prev, [order.id]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[var(--brand)] font-mono"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const body: any = { status: "approved", admin_response: "" };
                    if (effectivePlayerId) body.override_player_id = effectivePlayerId;
                    adminFetch(`/api/admin/orders/${order.id}/status`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(body)
                    }).then((res: Response) => res.json()).then((data: any) => {
                      if (data.error) { showToast(data.error || "حدث خطأ", 'error'); }
                      else if (data.finalStatus === "completed") { showToast("✅ تم التنفيذ بنجاح", 'success'); }
                      else if (data.apiError) { showToast(`⏳ تم إرسال الطلب — قيد المعالجة\n\nملاحظة: ${data.apiError}`, 'success'); }
                      else { showToast("⏳ تم الإرسال — قيد المعالجة", 'success'); }
                      fetchAdminOrders();
                    });
                  }}
                  className="flex-1 bg-green-500 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                ><CheckCircle size={12}/>قبول</button>
                <button
                  onClick={() => { showPromptDialog("سبب الرفض:", "رفض الطلب", (r) => { handleOrderAction(order.id, "rejected", r || ""); }, "", "اكتب سبب الرفض..."); }}
                  className="flex-1 bg-red-100 text-red-600 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                ><XCircle size={12}/>رفض</button>
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
      {filteredOrders.map(order => {
        let metaParsed: any = {};
        try { metaParsed = JSON.parse(order.meta || "{}"); } catch {}
        const isExpanded = expandedOrderId === order.id;
        const statusColor = order.status==='completed' ? 'bg-green-100 text-green-700' : order.status==='failed'||order.status==='cancelled'||order.status==='rejected' ? 'bg-red-100 text-red-600' : order.status==='processing' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700';
        const statusLabel = order.status==='completed' ? 'مكتمل' : order.status==='failed'||order.status==='cancelled'||order.status==='rejected' ? 'مرفوض' : order.status==='processing' ? 'معالجة' : 'انتظار';
        return (
        <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* ── معلومات المستخدم — دائمة الظهور ── */}
          <div className="px-4 pt-4 pb-3 flex items-center gap-3 border-b border-gray-50">
            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {order.user_avatar
                ? <img loading="lazy" src={order.user_avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer"/>
                : <User size={18} className="text-gray-400"/>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm text-gray-800 truncate">{order.user_name}</p>
              <p className="text-[10px] text-gray-400 truncate">{order.user_email || order.users?.email || "—"}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[10px] text-gray-400">#{order.user_db_id || order.user_id}</span>
                {(order.user_phone || order.users?.phone) && <span className="text-[10px] text-gray-400">{order.user_phone || order.users?.phone}</span>}
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${statusColor}`}>{statusLabel}</span>
          </div>

          {/* ── ملخص الطلب — دائم الظهور ── */}
          <div className="px-4 py-3 flex items-center justify-between cursor-pointer" onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}>
            <div>
              <p className="font-bold text-sm text-gray-800">#{order.id} — {order.product_name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleString("ar-EG")}</p>
              <p className="text-xs font-bold text-[var(--brand)] mt-0.5">{(order.total_amount || 0).toFixed(2)} $</p>
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}/>
          </div>

          {/* ── تفاصيل الطلب — تظهر بعد فتح السهم ── */}
          {isExpanded && (
            <div className="border-t border-gray-50 bg-gray-50/50 px-4 pb-4 pt-3 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {order.category_name && <div className="bg-white rounded-xl p-2.5 border border-gray-100"><p className="text-[9px] text-gray-400 mb-0.5">القسم الرئيسي</p><p className="font-bold text-gray-700">{order.category_name}</p></div>}
                {order.subcategory_name && <div className="bg-white rounded-xl p-2.5 border border-gray-100"><p className="text-[9px] text-gray-400 mb-0.5">القسم الفرعي</p><p className="font-bold text-gray-700">{order.subcategory_name}</p></div>}
                {order.order_items?.[0]?.products?.store_type && <div className="bg-white rounded-xl p-2.5 border border-gray-100"><p className="text-[9px] text-gray-400 mb-0.5">نوع المتجر</p><p className="font-bold text-gray-700">{order.order_items[0].products.store_type}</p></div>}
                {(metaParsed.playerId || metaParsed.player_id) && <div className="bg-white rounded-xl p-2.5 border border-gray-100"><p className="text-[9px] text-gray-400 mb-0.5">Player ID</p><p className="font-bold text-gray-700">{metaParsed.playerId || metaParsed.player_id}</p></div>}
                {metaParsed.ahminix_order_id && <div className="bg-white rounded-xl p-2.5 border border-gray-100 col-span-2"><p className="text-[9px] text-gray-400 mb-0.5">معرف Ahminix</p><p className="font-bold text-gray-700">{metaParsed.ahminix_order_id}</p></div>}
                {order.admin_response && <div className="bg-white rounded-xl p-2.5 border border-gray-100 col-span-2"><p className="text-[9px] text-gray-400 mb-0.5">رد الأدمن</p><p className="font-bold text-gray-700">{order.admin_response}</p></div>}
                <div className="bg-white rounded-xl p-2.5 border border-gray-100"><p className="text-[9px] text-gray-400 mb-0.5">استرداد الرصيد</p><p className={`font-bold text-xs ${metaParsed.refunded ? 'text-green-600' : 'text-gray-400'}`}>{metaParsed.refunded ? `✅ تم` : "لا"}</p></div>
              </div>
              {metaParsed.ahminix_order_id && (order.status === 'processing' || order.status === 'pending') && (
                <button onClick={async (e) => {
                  e.stopPropagation();
                  const res = await adminFetch(`/api/admin/ahminix/sync-order/${order.id}`, { method: "POST" });
                  const d = await res.json();
                  showToast(d.error ? `خطأ: ${d.error}` : `${d.oldStatus} ← ${d.newStatus} (API: ${d.ahminixStatus})`, 'error');
                  fetchAdminOrders();
                }} className="w-full text-xs bg-blue-50 text-blue-600 py-2 rounded-xl font-bold border border-blue-100 active:scale-95">🔄 مزامنة مع Ahminix</button>
              )}

              {/* ── تغيير حالة الطلب يدوياً ── */}
              <div className="bg-white rounded-xl p-3 border border-gray-100 space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">تغيير حالة الطلب</p>
                <div className="flex gap-2">
                  <select
                    defaultValue={order.status}
                    id={`status-select-${order.id}`}
                    className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-xs outline-none focus:border-[var(--brand)] bg-white"
                    onClick={e => e.stopPropagation()}
                  >
                    <option value="pending_admin">⏳ قيد المراجعة</option>
                    <option value="processing">🔄 قيد المعالجة</option>
                    <option value="completed">✅ مقبول / مكتمل</option>
                    <option value="failed">❌ مرفوض</option>
                    <option value="cancelled">🚫 ملغي</option>
                  </select>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const sel = document.getElementById(`status-select-${order.id}`) as HTMLSelectElement;
                      const newStatus = sel?.value;
                      if (!newStatus) return;
                      const res = await adminFetch(`/api/admin/orders/${order.id}/status`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: newStatus === "failed" ? "rejected" : newStatus, admin_response: "" })
                      });
                      const d = await res.json();
                      if (d.error) showToast(`خطأ: ${d.error}`, 'error');
                      else { showToast("✅ تم تحديث الحالة", 'success'); fetchAdminOrders(); }
                    }}
                    className="bg-[var(--brand)] text-white px-3 py-2 rounded-lg text-xs font-bold active:scale-95"
                  >حفظ</button>
                </div>
              </div>
            </div>
          )}
        </div>
        );
      })}
      {filteredOrders.length === 0 && <div className="text-center py-12 text-gray-400"><ShoppingBag size={40} className="mx-auto mb-3 opacity-20"/><p>لا توجد طلبات</p></div>}
    </div>
  </div>

  );
};

const AdminTransactionsTab = ({adminTransactions, transSearch, setTransSearch, handleApproveTransaction, handleRejectTransaction}: any) => {
  const [expandedId, setExpandedId] = React.useState<number|null>(null);
  const [customAmounts, setCustomAmounts] = React.useState<Record<number,string>>({});
  const filteredTrans = adminTransactions.filter(t => !transSearch || t.user_name?.includes(transSearch) || String(t.id).includes(transSearch) || t.user_email?.includes(transSearch));
  return (

  <div className="space-y-4">
    <div className="relative">
      <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/>
      <input type="text" placeholder="بحث في الدفعات..." value={transSearch} onChange={e => setTransSearch(e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl pr-9 pl-3 py-2.5 text-xs outline-none shadow-sm"/>
    </div>
    <div className="space-y-3">
      {filteredTrans.map(t => {
        const isExpanded = expandedId === t.id;
        const customAmt = customAmounts[t.id] ?? "";
        return (
        <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* ── معلومات المستخدم — دائمة الظهور ── */}
          <div className="px-4 pt-4 pb-3 flex items-center gap-3 border-b border-gray-50">
            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {t.user_avatar
                ? <img loading="lazy" src={t.user_avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer"/>
                : <User size={18} className="text-gray-400"/>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm text-gray-800 truncate">{t.user_name || "—"}</p>
              <p className="text-[10px] text-gray-400 truncate">{t.user_email || "—"}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[10px] text-gray-400">#{t.user_db_id || t.user_id}</span>
                {t.user_phone && t.user_phone !== "—" && <span className="text-[10px] text-gray-400">{t.user_phone}</span>}
              </div>
            </div>
            <div className="flex-shrink-0 text-left">
              <p className="text-sm font-black text-green-600">{(t.amount||0).toFixed(2)} $</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.status==='approved'?'bg-green-100 text-green-700':t.status==='rejected'?'bg-red-100 text-red-600':'bg-amber-100 text-amber-700'}`}>
                {t.status==='approved'?'مقبول':t.status==='rejected'?'مرفوض':'منتظر'}
              </span>
            </div>
          </div>

          {/* ── ملخص الدفعة — دائم الظهور + زر السهم ── */}
          <div className="px-4 py-3 flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : t.id)}>
            <div>
              <p className="font-bold text-xs text-gray-700">TX{t.id} · {t.payment_method_name || "—"}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{new Date(t.created_at).toLocaleString("ar-EG")}</p>
              {t.tx_number && <p className="text-[10px] text-gray-400 mt-0.5">رقم العملية: {t.tx_number}</p>}
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform flex-shrink-0 ${isExpanded?'rotate-180':''}`}/>
          </div>

          {/* ── تفاصيل الدفعة — تظهر بعد فتح السهم ── */}
          {isExpanded && (
            <div className="border-t border-gray-50 bg-gray-50/50 px-4 pb-4 pt-3 space-y-3">
              {/* صورة الإيصال */}
              {t.receipt_image_url && (
                <div>
                  <p className="text-[9px] text-gray-400 font-bold mb-1">صورة الإيصال</p>
                  <img loading="lazy" src={t.receipt_image_url} className="w-full h-44 object-cover rounded-xl cursor-pointer border border-gray-100" referrerPolicy="no-referrer" onClick={() => window.open(t.receipt_image_url, '_blank')}/>
                </div>
              )}
              {/* ملاحظة */}
              {t.note && (
                <div className="bg-white rounded-xl p-2.5 border border-gray-100">
                  <p className="text-[9px] text-gray-400 font-bold mb-0.5">الملاحظة</p>
                  <p className="text-xs text-gray-700">{t.note}</p>
                </div>
              )}

              {/* أزرار القبول/الرفض فقط للمعلقة */}
              {t.status === 'pending' && (
                <div className="space-y-2">
                  <div className="bg-white rounded-xl border border-gray-100 p-3">
                    <p className="text-[10px] text-gray-400 font-bold mb-1.5">تعديل المبلغ (اختياري)</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number" min="0.01" step="0.01"
                        placeholder={`الافتراضي: ${(t.amount||0).toFixed(2)}`}
                        value={customAmt}
                        onChange={e => setCustomAmounts(prev => ({...prev, [t.id]: e.target.value}))}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[var(--brand)]"
                      />
                      <span className="text-xs text-gray-400 font-bold">$</span>
                    </div>
                    {customAmt && parseFloat(customAmt) > 0 && (
                      <p className="text-[10px] text-amber-600 mt-1">⚠️ سيتم إضافة {parseFloat(customAmt).toFixed(2)}$ بدلاً من {(t.amount||0).toFixed(2)}$</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const amt = customAmt && parseFloat(customAmt) > 0 ? parseFloat(customAmt) : undefined;
                        handleApproveTransaction(t.id, amt);
                        setCustomAmounts(prev => { const n={...prev}; delete n[t.id]; return n; });
                      }}
                      className="flex-1 bg-green-500 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95">
                      <CheckCircle size={13}/>قبول{customAmt && parseFloat(customAmt)>0 ? ` (${parseFloat(customAmt).toFixed(2)}$)` : ""}
                    </button>
                    <button onClick={() => handleRejectTransaction(t.id)} className="flex-1 bg-red-100 text-red-600 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95">
                      <XCircle size={13}/>رفض
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        );
      })}
      {filteredTrans.length === 0 && <div className="text-center py-12 text-gray-400"><Wallet size={40} className="mx-auto mb-3 opacity-20"/><p>لا توجد دفعات</p></div>}
    </div>
  </div>

  );
};

const AdminElementsTab = ({categories, subcategories, subSubCategories, fetchCategories, fetchSubcategories, fetchSubSubCategories, paymentMethods, fetchPaymentMethods, banners, fetchBanners, offers, fetchOffers, handleDelete, adminFetch}: any) => {
  const [editingItem, setEditingItem] = React.useState<any>(null);
  const [editingType, setEditingType] = React.useState<string>("");
  const [elementsSubTab, setElementsSubTab] = React.useState<string>("");
  const [elementsType, setElementsType] = React.useState<string>("");
  const [allElements, setAllElements] = React.useState<any[]>([]);
  const [loadingElements, setLoadingElements] = React.useState(false);
  const [allSubcats, setAllSubcats] = React.useState<any[]>([]);
  const [allSubSubs, setAllSubSubs] = React.useState<any[]>([]);
  // المسارات التي تحتاج توكن أدمن
  const adminRoutes = new Set(["/api/admin/products-all", "/api/admin/vouchers"]);
  React.useEffect(() => {
  fetch("/api/subcategories").then(r=>r.json()).then(setAllSubcats).catch(()=>{});
  fetch("/api/sub-sub-categories").then(r=>r.json()).then(setAllSubSubs).catch(()=>{});
  }, []);
  const loadElements = async (type: string) => {
  setLoadingElements(true); setAllElements([]);
  const map: Record<string,string> = { categories:"/api/categories", subcategories:"/api/subcategories", subSubCategories:"/api/sub-sub-categories", products:"/api/admin/products-all", paymentMethods:"/api/payment-methods", banners:"/api/banners", offers:"/api/offers", vouchers:"/api/admin/vouchers" };
  const url = map[type];
  try {
    // استخدم adminFetch للمسارات المحمية، وfetch العادي للمسارات العامة
    const res = adminRoutes.has(url) ? await adminFetch(url) : await fetch(url);
    const data = await res.json();
    setAllElements(Array.isArray(data)?data:[]);
  } catch { setAllElements([]); }
  setLoadingElements(false);
  };
  const handleSaveEdit = async () => {
  if (!editingItem || !editingType) return;
  const epMap: Record<string,string> = { categories:"categories", subcategories:"subcategories", subSubCategories:"sub-sub-categories", products:"products", paymentMethods:"payment-methods", banners:"banners", offers:"offers", vouchers:"vouchers" };
  try {
  const res = await adminFetch(`/api/admin/${epMap[editingType]}/${editingItem.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(editingItem) });
  if (res.ok) { showToast("تم التعديل", 'success'); setEditingItem(null); setEditingType(""); loadElements(elementsType); fetchCategories(); fetchSubcategories(); fetchSubSubCategories(); fetchPaymentMethods(); fetchBanners(); fetchOffers(); }
  else { const d = await res.json(); showToast("فشل: "+(d.error||""), 'error'); }
  } catch { showToast("خطأ في الاتصال", 'error'); }
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
                className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all ${elementsType===opt.val?'bg-[var(--brand)] text-white':'bg-white border border-gray-100 text-gray-600'}`}>{opt.label}</button>
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
              {item.image_url && <img loading="lazy" src={item.image_url} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" referrerPolicy="no-referrer"/>}
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-700 truncate">{item.name||item.title||item.code||`#${item.id}`}</p>
                {item.price !== undefined && <p className="text-[10px] text-brand">{item.store_type==='quantities'?`${item.price_per_unit}$/وحدة`:`${Number(item.price).toFixed(2)} $`}</p>}
                {item.amount !== undefined && !item.price && <p className="text-[10px] text-brand">{item.amount} $</p>}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => { setEditingItem({...item}); setEditingType(elementsType); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Pencil size={14}/></button>
              <button onClick={() => { handleDelete(delMap[elementsType]||elementsType, item.id, () => loadElements(elementsType)); }} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 size={14}/></button>
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
                  <div className="space-y-2 p-3 bg-gray-50 rounded-xl"><input type="number" placeholder="أقل كمية" className="w-full p-2 bg-white rounded-lg text-sm outline-none" value={editingItem.min_quantity||""} onChange={e => setEditingItem({...editingItem,min_quantity:e.target.value})}/><input type="number" placeholder="أكثر كمية" className="w-full p-2 bg-white rounded-lg text-sm outline-none" value={editingItem.max_quantity||""} onChange={e => setEditingItem({...editingItem,max_quantity:e.target.value})}/><input type="number" step="0.000001" placeholder="سعر الوحدة" className="w-full p-2 bg-white rounded-lg text-sm outline-none" value={editingItem.price_per_unit||""} onChange={e => setEditingItem({...editingItem,price_per_unit:e.target.value})}/>{editingItem.store_type==='external_api' && <input type="text" placeholder="معرف المنتج الخارجي" className="w-full p-2 bg-white rounded-lg text-sm outline-none border border-blue-100" value={editingItem.external_id||""} onChange={e => setEditingItem({...editingItem,external_id:e.target.value})}/>}</div>
                ) : <input type="number" step="0.01" placeholder="السعر $" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.price||""} onChange={e => setEditingItem({...editingItem,price:e.target.value})}/>}
                <div className="flex items-center gap-2"><input type="checkbox" checked={!!editingItem.requires_input} onChange={e => setEditingItem({...editingItem,requires_input:e.target.checked})} className="w-4 h-4 rounded"/><label className="text-xs font-bold text-gray-600">يتطلب بيانات إضافية</label></div>
              </div>
            )}
            {editingType === "paymentMethods" && <div className="space-y-3"><input type="text" placeholder="اسم طريقة الدفع" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.name||""} onChange={e => setEditingItem({...editingItem,name:e.target.value})}/><AdminImageUpload label="صورة الطريقة" currentUrl={editingItem.image_url||""} onUpload={url => setEditingItem({...editingItem,image_url:url})}/><input type="text" placeholder="رقم المحفظة" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.wallet_address||""} onChange={e => setEditingItem({...editingItem,wallet_address:e.target.value})}/><textarea placeholder="وصف طريقة الدفع (اختياري)" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none h-16 resize-none" value={editingItem.description||""} onChange={e => setEditingItem({...editingItem,description:e.target.value})}/><input type="number" placeholder="أقل مبلغ $" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.min_amount||""} onChange={e => setEditingItem({...editingItem,min_amount:e.target.value})}/></div>}
            {editingType === "banners" && <div className="space-y-3"><AdminImageUpload label="صورة البانر" currentUrl={editingItem.image_url||""} onUpload={url => setEditingItem({...editingItem,image_url:url})}/></div>}
            {editingType === "offers" && <div className="space-y-3"><input type="text" placeholder="عنوان العرض" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.title||""} onChange={e => setEditingItem({...editingItem,title:e.target.value})} autoFocus/><textarea placeholder="وصف العرض" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none h-20 resize-none" value={editingItem.description||""} onChange={e => setEditingItem({...editingItem,description:e.target.value})}/><AdminImageUpload label="صورة العرض" currentUrl={editingItem.image_url||""} onUpload={url => setEditingItem({...editingItem,image_url:url})}/></div>}
            {editingType === "vouchers" && <div className="space-y-3"><input type="text" placeholder="الكود" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.code||""} onChange={e => setEditingItem({...editingItem,code:e.target.value})}/><input type="number" placeholder="القيمة $" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.amount||""} onChange={e => setEditingItem({...editingItem,amount:e.target.value})}/><input type="number" placeholder="أقصى استخدامات" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={editingItem.max_uses||""} onChange={e => setEditingItem({...editingItem,max_uses:e.target.value})}/></div>}
            <button onClick={handleSaveEdit} className="w-full bg-[var(--brand)] text-white py-3.5 rounded-2xl font-bold text-sm mt-2">حفظ التعديلات</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Syrbit Copyright */}
    <div className="flex justify-center pb-4 pt-2">
      <a href="https://chat.whatsapp.com/DELXtdEh9ua5edFTupESNU" target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-purple-500 transition-colors">
        <span>برمجة شركة</span>
        <span className="font-black text-purple-500">Syrbit</span>
        <ExternalLink size={9} />
      </a>
    </div>
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
  setAdminTab,
  setSiteSettings
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
      max_quantity: "",
      price_per_unit: "",
      external_id: ""
    });
    const [newPaymentMethod, setNewPaymentMethod] = useState({ name: "", image_url: "", wallet_address: "", min_amount: "", instructions: "", description: "", method_type: "manual", api_account: "" });
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

    // Discount customization state
    const [vipDiscountVal, setVipDiscountVal] = useState("5");
    const [referralCommissionVal, setReferralCommissionVal] = useState("10");

    // Rewards customization state
    const [rewardGoals, setRewardGoals] = useState<any[]>([
      { id: 1, order: 1, target: 5,   name: "الهدف الأول",   description: "وسام البداية + لقب ناشئ + إطار برونزي",   frame: "bronze",       badge: "bronze",    title_type: "ناشئ",          discount: "" },
      { id: 2, order: 2, target: 15,  name: "الهدف الثاني",  description: "شارة النشاط + لقب نشيط + إطار فضي",         frame: "silver",       badge: "active",    title_type: "نشيط",          discount: "" },
      { id: 3, order: 3, target: 30,  name: "الهدف الثالث",  description: "شارة الطاقة + لقب متميز + رمز ⚡",           frame: "",             badge: "energy",    title_type: "متميز",         discount: "" },
      { id: 4, order: 4, target: 50,  name: "الهدف الرابع",  description: "شارة فضية + لقب VIP + إطار VIP + أولوية",   frame: "vip",          badge: "silver",    title_type: "VIP",           discount: "" },
      { id: 5, order: 5, target: 100, name: "الهدف الخامس",  description: "تاج ذهبي + لقب نجم + إطار ذهبي متحرك",      frame: "gold_animated",badge: "gold",      title_type: "نجم",           discount: "" },
      { id: 6, order: 6, target: 200, name: "الهدف السادس",  description: "شارة الماس + لقب أسطورة + دعم خاص",          frame: "",             badge: "diamond",   title_type: "أسطورة",        discount: "3" },
      { id: 7, order: 7, target: 500, name: "الهدف السابع",  description: "شارة أسطورية + لقب أسطورة الشحن + كل الثيمات", frame: "",           badge: "legendary", title_type: "أسطورة الشحن", discount: "5" },
    ]);
    const [editingGoal, setEditingGoal] = useState<any>(null);
    const [savingDiscount, setSavingDiscount] = useState(false);
    const [savingReward, setSavingReward] = useState(false);

    const fetchAdminProducts = async (subId: string) => {
      if (!subId) return;
      const res = await fetch(`/api/products?subId=${subId}`);
      const data = await res.json();
      setAdminProducts(data);
    };

    const handleUpdateProductPrice = async (id: number, currentPrice: number, storeType?: string) => {
      const label = storeType === 'quantities' ? "السعر لكل وحدة" : "السعر الجديد";
      showPromptDialog(`أدخل ${label}:`, "تعديل السعر", async (newPrice) => {
        if (newPrice !== null && newPrice !== '') {
          const field = storeType === 'quantities' ? 'price_per_unit' : 'price';
          const res = await adminFetch(`/api/admin/products/${id}/price`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [field]: parseFloat(newPrice) })
          });
          if (res.ok) {
            showToast("تم التحديث بنجاح", 'success');
            fetchAdminProducts(selectedSubId);
          }
        }
      }, currentPrice.toString(), `مثال: ${currentPrice}`);
    };
    const [newVoucher, setNewVoucher] = useState({ code: "", amount: "", max_uses: "1" });
    const [newOffer, setNewOffer] = useState({ title: "", description: "", image_url: "" });

    const handleExportDB = async () => {
      try {
        const res = await adminFetch("/api/admin/export-db", { headers: { "x-admin-token": localStorage.getItem("adminToken") || "" } });
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `database_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
      } catch (e) {
        showToast("فشل تصدير البيانات", 'error');
      }
    };

    const handleImportDB = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      showConfirm("تحذير: سيتم مسح كافة البيانات الحالية واستبدالها بالبيانات المستوردة. هل أنت متأكد؟", "استيراد قاعدة البيانات", () => {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            const res = await adminFetch("/api/admin/import-db", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data)
            });
            if (res.ok) {
              showToast("تم استيراد البيانات بنجاح! سيتم إعادة تحميل الصفحة.", 'success');
              window.location.reload();
            } else {
              const err = await res.json();
              showToast(`فشل الاستيراد: ${err.error}`, 'error');
            }
          } catch (err) {
            showToast("ملف غير صالح", 'info');
          }
        };
        reader.readAsText(file);
      }, true);
    };

    const handleClearDB = async () => {
      showConfirm("هل أنت متأكد من مسح كافة بيانات الموقع؟ لا يمكن التراجع عن هذه الخطوة.", "مسح قاعدة البيانات", async () => {
        const res = await adminFetch("/api/admin/clear-db", { method: "POST" });
        if (res.ok) {
          showToast("تم مسح قاعدة البيانات بنجاح", 'success');
          window.location.reload();
        }
      }, true);
    };

    useEffect(() => {
      fetchAdminOrders();
      fetchAdminTransactions();
      fetchAdminUsers();
      fetchAdminSettings();
      fetchAdminVouchers();
    }, []);

    const fetchAdminVouchers = async () => {
      const res = await adminFetch("/api/admin/vouchers", { headers: { "x-admin-token": localStorage.getItem("adminToken") || "" } });
      const data = await res.json();
      setAdminVouchers(data);
    };

    const handleCreateVoucher = async () => {
      const res = await adminFetch("/api/admin/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVoucher)
      });
      if (res.ok) {
        setNewVoucher({ code: "", amount: "", max_uses: "1" });
        fetchAdminVouchers();
        showToast("تم إنشاء الكود بنجاح", 'success');
      } else {
        const data = await res.json();
        showToast(data.error || "فشل إنشاء الكود", 'error');
      }
    };

    const handleDeleteVoucher = async (id: number) => {
      showConfirm("هل أنت متأكد من حذف هذا الكود؟", "حذف الكود", async () => {
        const res = await adminFetch(`/api/admin/vouchers/${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchAdminVouchers();
          showToast("تم حذف الكود", 'success');
        }
      }, true);
    };

    const fetchAdminSettings = async () => {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings(data);
      const pp = data.find((s: any) => s.key === 'privacy_policy');
      const sw = data.find((s: any) => s.key === 'support_whatsapp');
      const vd = data.find((s: any) => s.key === 'vip_discount');
      const rc = data.find((s: any) => s.key === 'referral_commission');
      if (pp) setPrivacyPolicy(pp.value);
      if (sw) setSupportWhatsapp(sw.value);
      if (vd) setVipDiscountVal(vd.value);
      if (rc) setReferralCommissionVal(rc.value);
    };

    const handleUpdateSetting = async (key: string, value: string) => {
      const res = await adminFetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value })
      });
      if (res.ok) {
        showToast("تم تحديث الإعداد بنجاح", 'success');
        fetchAdminSettings();
        // تحديث siteSettings في الـ App الرئيسي لتنعكس التغييرات فوراً
        fetch("/api/settings").then(r => r.json()).then((data: any[]) => setSiteSettings(data)).catch(() => {});
      }
    };

    const handleCloudSync = async () => {
      showConfirm("هل تريد مزامنة كافة البيانات الحالية مع قاعدة البيانات السحابية (Supabase)؟", "مزامنة سحابية", async () => {
        try {
          const res = await adminFetch("/api/admin/sync-to-cloud", { method: "POST" });
          const data = await res.json();
          if (res.ok) {
            let msg = "تمت المزامنة السحابية بنجاح!";
            showToast(msg, 'success');
          } else {
            showToast(`فشل المزامنة: ${data.error}`, 'error');
          }
        } catch (e) {
          showToast("خطأ في الاتصال بالسيرفر", 'error');
        }
      }, false);
    };

    const fetchAdminUsers = async () => {
      const res = await adminFetch("/api/admin/users", { headers: { "x-admin-token": localStorage.getItem("adminToken") || "" } });
      const data = await res.json();
      setAdminUsers(Array.isArray(data) ? data : []);
    };

    const handleToggleVip = async (userId: number, currentStatus: boolean) => {
      const res = await adminFetch(`/api/admin/users/${userId}/vip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVip: !currentStatus })
      });
      if (res.ok) {
        fetchAdminUsers();
        showToast("تم تحديث حالة VIP", 'success');
      }
    };

    const handleDeleteUser = async (userId: number) => {
      showConfirm("هل أنت متأكد من حذف هذا المستخدم نهائياً؟ لا يمكن التراجع!", "حذف المستخدم", async () => {
        try {
          const res = await adminFetch(`/api/admin/users/${userId}`, { method: "DELETE" });
          const data = await res.json();
          if (res.ok) {
            showToast("✅ تم حذف المستخدم بنجاح", 'success');
            fetchAdminUsers();
          } else {
            showToast("❌ " + (data.error || "فشل الحذف"), 'error');
          }
        } catch (e) { showToast("خطأ في الاتصال", 'error'); }
      }, true);
    };

    const handleBlockUser = async (userId: number) => {
      showPromptDialog("أدخل مدة الحظر بالدقائق (مثال: 60 = ساعة):", "حظر المستخدم", async (mins) => {
        if (!mins || isNaN(parseInt(mins))) return;
        try {
          const res = await adminFetch(`/api/admin/users/${userId}/block`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ minutes: parseInt(mins) })
          });
          const data = await res.json();
          if (res.ok) {
            showToast(`✅ تم حظر المستخدم لمدة ${mins} دقيقة`, 'success');
            fetchAdminUsers();
          } else {
            showToast("❌ " + (data.error || "فشل الحظر"), 'error');
          }
        } catch (e) { showToast("خطأ في الاتصال", 'error'); }
      }, "", "مثال: 60");
    };

    const handleSendNotification = async (userId: number | null, title: string, body: string) => {
      try {
        const res = await adminFetch("/api/admin/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-token": localStorage.getItem("adminToken") || "" },
          body: JSON.stringify({ userId, title, body })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(userId ? "✅ تم إرسال الإشعار للمستخدم" : `✅ تم الإرسال لـ ${data.sent || "الكل"} مستخدم`, 'success');
        } else {
          showToast("❌ " + (data.error || "فشل الإرسال"), 'error');
        }
      } catch (e) { showToast("خطأ في الاتصال", 'error'); }
    };

    const handleAddOffer = async () => {
      const res = await adminFetch("/api/admin/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOffer)
      });
      if (res.ok) {
        setNewOffer({ title: "", description: "", image_url: "" });
        fetchOffers();
        showToast("تمت إضافة العرض", 'info');
      }
    };

    const fetchAdminOrders = async () => {
      try {
        const res = await adminFetch("/api/admin/orders", { headers: { "x-admin-token": localStorage.getItem("adminToken") || "" } });
        const data = await res.json();
        setAdminOrders(Array.isArray(data) ? data : []);
      } catch (e) { console.error(e); }
    };

    const fetchAdminTransactions = async () => {
      try {
        const res = await adminFetch("/api/admin/transactions", { headers: { "x-admin-token": localStorage.getItem("adminToken") || "" } });
        const data = await res.json();
        setAdminTransactions(Array.isArray(data) ? data : []);
      } catch (e) { console.error(e); }
    };

    const handleApproveTransaction = async (id: number, customAmount?: number) => {
      const body: any = {};
      if (customAmount !== undefined && customAmount > 0) body.custom_amount = customAmount;
      await adminFetch(`/api/admin/transactions/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      fetchAdminTransactions();
    };

    const handleRejectTransaction = async (id: number) => {
      await adminFetch(`/api/admin/transactions/${id}/reject`, { method: "POST" });
      fetchAdminTransactions();
    };

    const handleAddCategory = async () => {
      if (!newCategory.name || newCategory.name.trim().length < 1) {
        return showToast("يرجى إدخال اسم القسم الرئيسي", 'error');
      }
      const res = await adminFetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory)
      });
      const data = await res.json();
      if (res.ok) {
        setNewCategory({ name: "", image_url: "", special_id: "" });
        fetchCategories();
        showToast("✅ تمت إضافة القسم الرئيسي بنجاح", 'success');
      } else {
        showToast("❌ " + (data.error || "خطأ في الإضافة"), 'error');
      }
    };

    const handleAddSubcategory = async () => {
      if (!newSubcategory.name) return showToast("يرجى إدخال اسم القسم الفرعي", 'error');
      if (!newSubcategory.category_special_id) return showToast("يرجى إدخال رقم القسم الرئيسي الخاص", 'error');
      const res = await adminFetch("/api/admin/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSubcategory)
      });
      const data = await res.json();
      if (res.ok) {
        setNewSubcategory({ category_special_id: "", name: "", image_url: "", special_id: "" });
        fetchSubcategories();
        fetchCategories();
        showToast("✅ تمت إضافة القسم الفرعي بنجاح", 'success');
      } else {
        showToast("❌ " + (data.error || "خطأ في الإضافة", 'error'));
      }
    };

    const handleAddProduct = async () => {
      const res = await adminFetch("/api/admin/products", {
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
          max_quantity: "",
          price_per_unit: "",
          external_id: ""
        });
        showToast("تمت إضافة المنتج", 'info');
      } else {
        const data = await res.json();
        showToast(data.error || "خطأ في الإضافة", 'error');
      }
    };

    const handleAddSubSubCategory = async () => {
      if (!newSubSubCategory.name) return showToast("يرجى إدخال اسم القسم الفرعي الفرعي", 'error');
      if (!newSubSubCategory.subcategory_special_id) return showToast("يرجى إدخال رقم القسم الفرعي الخاص", 'error');
      const res = await adminFetch("/api/admin/sub-sub-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSubSubCategory)
      });
      const data = await res.json();
      if (res.ok) {
        setNewSubSubCategory({ subcategory_special_id: "", name: "", image_url: "", special_id: "" });
        fetchSubSubCategories();
        fetchSubcategories();
        showToast("✅ تمت إضافة القسم الفرعي الفرعي بنجاح", 'success');
      } else {
        showToast("❌ " + (data.error || "خطأ في الإضافة", 'error'));
      }
    };

    const handleAddPaymentMethod = async () => {
      const res = await adminFetch("/api/admin/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPaymentMethod)
      });
      if (res.ok) {
        setNewPaymentMethod({ name: "", image_url: "", wallet_address: "", min_amount: "", instructions: "", description: "", method_type: "manual", api_account: "" });
        fetchPaymentMethods();
        showToast("تمت إضافة طريقة الدفع", 'info');
      } else {
        const data = await res.json();
        showToast(data.error || "خطأ في الإضافة", 'error');
      }
    };

    const handleAddBanner = async () => {
      const res = await adminFetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBanner)
      });
      if (res.ok) {
        setNewBanner({ image_url: "" });
        fetchBanners();
        showToast("تمت إضافة الصورة المتحركة", 'info');
      } else {
        showToast("خطأ في الإضافة", 'error');
      }
    };

    const handleDelete = async (type: string, id: number, onSuccess?: () => void) => {
      showConfirm("هل أنت متأكد من الحذف؟", "تأكيد الحذف", async () => {
        try {
          const res = await adminFetch(`/api/admin/${type}/${id}`, { method: "DELETE" });
          const result = await res.json();
          if (res.ok) {
            fetchCategories();
            fetchSubcategories();
            fetchSubSubCategories();
            if (type === 'payment-methods') fetchPaymentMethods();
            if (type === 'banners') fetchBanners();
            if (type === 'offers') fetchOffers();
            showToast(result.message || "✅ تم الحذف بنجاح", 'success');
            if (onSuccess) onSuccess();
          } else {
            showToast("❌ " + (result.error || "فشل الحذف"), 'error');
          }
        } catch (e) {
          showToast("❌ خطأ في الاتصال بالخادم", 'error');
        }
      }, true);
    };

    const handleManualTopup = async () => {
      const res = await adminFetch("/api/admin/manual-topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: manualTopup.userId, amount: manualTopup.amount })
      });
      if (res.ok) {
        setManualTopup({ userId: "", amount: "" });
        showToast("تم شحن الرصيد بنجاح", 'success');
      } else {
        const data = await res.json();
        showToast(data.error || "خطأ في الشحن", 'error');
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
          {adminTab === "admin_home" && <AdminHomeTab adminUsers={adminUsers} adminOrders={adminOrders} adminTransactions={adminTransactions} setAdminTab={setAdminTab} fetchUser={fetchUser} fetchAdminUsers={fetchAdminUsers} handleToggleVip={handleToggleVip} handleBlockUser={handleBlockUser} handleDeleteUser={handleDeleteUser} handleSendNotification={handleSendNotification} onOpenChatWithUser={(u: any) => { setSelectedChatUser(u); setAdminTab("chat"); }} />}

          {/* ===== STATS ===== */}
          {adminTab === "admin_stats" && <AdminStatsTab adminFetch={adminFetch} />}

          {adminTab === "chat" && <AdminChatView />}

          {/* ===== ORDERS ===== */}
          {adminTab === "orders" && <AdminOrdersTab adminOrders={adminOrders} orderSearch={orderSearch} setOrderSearch={setOrderSearch} orderDateFilter={orderDateFilter} setOrderDateFilter={setOrderDateFilter} fetchAdminOrders={fetchAdminOrders} adminFetch={adminFetch} />}

          {/* ===== TRANSACTIONS ===== */}
          {adminTab === "transactions" && <AdminTransactionsTab adminTransactions={adminTransactions} transSearch={transSearch} setTransSearch={setTransSearch} handleApproveTransaction={handleApproveTransaction} handleRejectTransaction={handleRejectTransaction} />}

          {/* ===== ELEMENTS ===== */}
          {adminTab === "elements" && <AdminElementsTab categories={categories} subcategories={subcategories} subSubCategories={subSubCategories} fetchCategories={fetchCategories} fetchSubcategories={fetchSubcategories} fetchSubSubCategories={fetchSubSubCategories} paymentMethods={paymentMethods} fetchPaymentMethods={fetchPaymentMethods} banners={banners} fetchBanners={fetchBanners} offers={offers} fetchOffers={fetchOffers} handleDelete={handleDelete} adminFetch={adminFetch} />}

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
            className="fixed bottom-20 left-4 right-4 z-[56] bg-white rounded-3xl shadow-2xl border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-400 mb-4 text-center">اختر ما تريد إضافته</p>
            <div className="grid grid-cols-4 gap-3">
            {[
              { key:"add_category", label:"قسم رئيسي", icon:<LayoutGrid size={20}/>, color:"text-blue-600 bg-blue-50" },
              { key:"add_subcategory", label:"قسم فرعي", icon:<ChevronDown size={20}/>, color:"text-blue-500 bg-blue-50" },
              { key:"add_subSubCategory", label:"فرع فرعي", icon:<ChevronRight size={20}/>, color:"text-blue-400 bg-blue-50" },
              { key:"add_product", label:"منتج", icon:<ShoppingBag size={20}/>, color:"text-indigo-600 bg-indigo-50" },
              { key:"add_banner", label:"بانر", icon:<ImageIcon size={20}/>, color:"text-pink-600 bg-pink-50" },
              { key:"add_offer", label:"عرض", icon:<Tag size={20}/>, color:"text-rose-600 bg-rose-50" },
              { key:"add_balance", label:"رصيد", icon:<Wallet size={20}/>, color:"text-green-600 bg-green-50" },
              { key:"add_voucher", label:"قسيمة", icon:<Ticket size={20}/>, color:"text-purple-600 bg-purple-50" },
              { key:"add_paymentMethod", label:"طريقة دفع", icon:<Plus size={20}/>, color:"text-orange-600 bg-orange-50" },
              { key:"add_notification", label:"إشعار", icon:<Bell size={20}/>, color:"text-red-600 bg-red-50" },
              { key:"customize_discounts", label:"تخصيص التخفيضات", icon:<Tag size={20}/>, color:"text-teal-600 bg-teal-50" },
              { key:"customize_rewards", label:"تخصيص المكافآت", icon:<Crown size={20}/>, color:"text-yellow-600 bg-yellow-50" },
              { key:"ahminix_link", label:"API خارجي", icon:<ExternalLink size={20}/>, color:"text-gray-600 bg-gray-100" },
            ].map(item => (
              <button key={item.key} onClick={() => { if(item.key==="ahminix_link"){setAdminTab("ahminix");setActiveSubMenu(null);}else setActiveSubMenu(item.key); }}
                className="flex flex-col items-center gap-2 p-2 rounded-2xl hover:bg-gray-50 transition-colors active:scale-95">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}>{item.icon}</div>
                <span className="text-[10px] font-bold text-gray-600 text-center leading-tight">{item.label}</span>
              </button>
            ))}
            </div>
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
                    <button onClick={() => { handleAddCategory(); setActiveSubMenu(null); }} className="w-full bg-[var(--brand)] text-white py-3.5 rounded-2xl font-bold text-sm">إضافة القسم الرئيسي</button>
                  </div>
                )}
                {activeSubMenu === "add_subcategory" && (
                  <div className="space-y-3">
                    <select className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newSubcategory.category_special_id} onChange={e => setNewSubcategory({...newSubcategory,category_special_id:e.target.value})}><option value="">-- اختر القسم الرئيسي --</option>{categories.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                    <input type="text" placeholder="اسم القسم الفرعي" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newSubcategory.name} onChange={e => setNewSubcategory({...newSubcategory,name:e.target.value})}/>
                    <AdminImageUpload label="صورة القسم الفرعي" currentUrl={newSubcategory.image_url} onUpload={url => setNewSubcategory({...newSubcategory,image_url:url})}/>
                    <button onClick={() => { handleAddSubcategory(); setActiveSubMenu(null); }} className="w-full bg-[var(--brand)] text-white py-3.5 rounded-2xl font-bold text-sm">إضافة القسم الفرعي</button>
                  </div>
                )}
                {activeSubMenu === "add_subSubCategory" && (
                  <div className="space-y-3">
                    <select className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newSubSubCategory.subcategory_special_id} onChange={e => setNewSubSubCategory({...newSubSubCategory,subcategory_special_id:e.target.value})}><option value="">-- اختر القسم الفرعي --</option>{subcategories.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                    <input type="text" placeholder="اسم الفرع الفرعي" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newSubSubCategory.name} onChange={e => setNewSubSubCategory({...newSubSubCategory,name:e.target.value})}/>
                    <AdminImageUpload label="الصورة" currentUrl={newSubSubCategory.image_url} onUpload={url => setNewSubSubCategory({...newSubSubCategory,image_url:url})}/>
                    <button onClick={() => { handleAddSubSubCategory(); setActiveSubMenu(null); }} className="w-full bg-[var(--brand)] text-white py-3.5 rounded-2xl font-bold text-sm">إضافة الفرع الفرعي</button>
                  </div>
                )}
                {activeSubMenu === "add_voucher" && (
                  <div className="space-y-3">
                    <input type="text" placeholder="الكود" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newVoucher.code} onChange={e => setNewVoucher({...newVoucher,code:e.target.value})}/>
                    <div className="grid grid-cols-2 gap-2"><input type="number" placeholder="القيمة $" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newVoucher.amount} onChange={e => setNewVoucher({...newVoucher,amount:e.target.value})}/><input type="number" placeholder="عدد الاستخدامات" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newVoucher.max_uses} onChange={e => setNewVoucher({...newVoucher,max_uses:e.target.value})}/></div>
                    <button onClick={() => { handleCreateVoucher(); setActiveSubMenu(null); }} className="w-full bg-[var(--brand)] text-white py-3.5 rounded-2xl font-bold text-sm">إنشاء القسيمة</button>
                  </div>
                )}
                {activeSubMenu === "add_paymentMethod" && (
                  <div className="space-y-3">
                    <input type="text" placeholder="اسم طريقة الدفع" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newPaymentMethod.name} onChange={e => setNewPaymentMethod({...newPaymentMethod,name:e.target.value})}/>
                    <AdminImageUpload label="صورة الطريقة" currentUrl={newPaymentMethod.image_url} onUpload={url => setNewPaymentMethod({...newPaymentMethod,image_url:url})}/>
                    <select className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newPaymentMethod.method_type} onChange={e => setNewPaymentMethod({...newPaymentMethod,method_type:e.target.value,api_account:""})}><option value="manual">يدوي (إيصال)</option><option value="syriatel">سيريتل كاش</option><option value="shamcash">شام كاش</option></select>
                    <input type="text" placeholder="رقم المحفظة / العنوان" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newPaymentMethod.wallet_address} onChange={e => setNewPaymentMethod({...newPaymentMethod,wallet_address:e.target.value})}/>
                    <textarea placeholder="وصف طريقة الدفع (اختياري - يظهر للمستخدم)" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none h-16 resize-none" value={newPaymentMethod.description} onChange={e => setNewPaymentMethod({...newPaymentMethod,description:e.target.value})}/>
                    {(newPaymentMethod.method_type==="syriatel"||newPaymentMethod.method_type==="shamcash") && <input type="text" placeholder={newPaymentMethod.method_type==="syriatel"?"رقم GSM (0933xxxxxx)":"عنوان الحساب"} className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none font-mono" value={newPaymentMethod.api_account} onChange={e => setNewPaymentMethod({...newPaymentMethod,api_account:e.target.value})}/>}
                    <input type="number" placeholder="أقل مبلغ $" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" value={newPaymentMethod.min_amount} onChange={e => setNewPaymentMethod({...newPaymentMethod,min_amount:e.target.value})}/>
                    <button onClick={() => { handleAddPaymentMethod(); setActiveSubMenu(null); }} className="w-full bg-[var(--brand)] text-white py-3.5 rounded-2xl font-bold text-sm">إضافة طريقة الدفع</button>
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
                            else showToast("فشل رفع الصورة", 'error');
                          } catch { showToast("خطأ في رفع الصورة", 'error'); }
                        }}/>
                      </label>
                    </div>
                    {newProduct.image_url && (
                      <div className="mt-2 flex items-center gap-2">
                        <img loading="lazy" src={newProduct.image_url} className="w-12 h-12 object-cover rounded-lg border border-gray-100" referrerPolicy="no-referrer"/>
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
                      <input type="number" placeholder="أكثر كمية" className="w-full p-2 bg-white rounded-lg text-sm outline-none" value={newProduct.max_quantity||""} onChange={e => setNewProduct({...newProduct, max_quantity: e.target.value})}/>
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
                      if (!newProduct.name) return showToast("يرجى إدخال اسم المنتج", 'error');
                      if (!newProduct.subcategory_special_id) return showToast("يرجى اختيار القسم الفرعي", 'error');
                      await handleAddProduct();
                      setActiveSubMenu(null);
                    }}
                    className="w-full bg-[var(--brand)] text-white py-3.5 rounded-2xl font-bold text-sm"
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
                          else showToast("فشل رفع الصورة", 'error');
                        } catch { showToast("خطأ في رفع الصورة", 'error'); }
                      }}/>
                    </label>
                  </div>
                  {newBanner.image_url && (
                    <div className="mt-1">
                      <img loading="lazy" src={newBanner.image_url} className="w-full h-36 object-cover rounded-xl border border-gray-100" referrerPolicy="no-referrer"/>
                    </div>
                  )}
                  <button
                    onClick={async () => {
                      if (!newBanner.image_url) return showToast("يرجى إضافة صورة البانر", 'error');
                      await handleAddBanner();
                      setActiveSubMenu(null);
                    }}
                    className="w-full bg-[var(--brand)] text-white py-3.5 rounded-2xl font-bold text-sm"
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
                          else showToast("فشل رفع الصورة", 'error');
                        } catch { showToast("خطأ في رفع الصورة", 'error'); }
                      }}/>
                    </label>
                  </div>
                  {newOffer.image_url && (
                    <img loading="lazy" src={newOffer.image_url} className="w-full h-36 object-cover rounded-xl border border-gray-100" referrerPolicy="no-referrer"/>
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
                      if (!newOffer.title) return showToast("يرجى إدخال اسم العرض", 'error');
                      await handleAddOffer();
                      setActiveSubMenu(null);
                    }}
                    className="w-full bg-[var(--brand)] text-white py-3.5 rounded-2xl font-bold text-sm"
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
                <button onClick={() => { handleManualTopup(); setActiveSubMenu(null); }} className="w-full bg-[var(--brand)] text-white py-3.5 rounded-2xl font-bold text-sm">شحن الرصيد</button>
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

          {/* Customize Discounts Modal */}
          {activeSubMenu === "customize_discounts" && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[60] bg-black/50 flex items-end justify-center" onClick={() => setActiveSubMenu(null)}>
              <motion.div initial={{y:100,opacity:0}} animate={{y:0,opacity:1}} exit={{y:100,opacity:0}} className="bg-white w-full max-w-lg rounded-t-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2"><Tag size={18} className="text-teal-600"/>تخصيص التخفيضات</h3>
                  <button onClick={() => setActiveSubMenu(null)} className="text-gray-400"><X size={22}/></button>
                </div>
                <div className="bg-teal-50 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-sm text-teal-700 flex items-center gap-2"><Crown size={14}/>نسبة خصم VIP</h4>
                  <p className="text-xs text-gray-500">نسبة الخصم التي تُطبَّق تلقائياً على كل طلبات عملاء VIP</p>
                  <div className="flex gap-2 items-center">
                    <input type="number" min="0" max="100" step="0.5" value={vipDiscountVal} onChange={e => setVipDiscountVal(e.target.value)} className="flex-1 p-3 bg-white rounded-xl text-sm outline-none border border-teal-100 text-center font-bold" placeholder="مثال: 5" />
                    <span className="text-gray-500 font-bold text-lg">%</span>
                    <button disabled={savingDiscount} onClick={async () => { setSavingDiscount(true); await handleUpdateSetting('vip_discount', vipDiscountVal); setSavingDiscount(false); }} className="bg-teal-600 text-white px-5 py-3 rounded-xl text-sm font-bold disabled:opacity-50">
                      {savingDiscount ? "..." : "حفظ"}
                    </button>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-sm text-blue-700 flex items-center gap-2"><Star size={14}/>نسبة عمولة الإحالة</h4>
                  <p className="text-xs text-gray-500">النسبة المئوية التي يحصل عليها المستخدم من كل شحنة يجريها من أحاله</p>
                  <div className="flex gap-2 items-center">
                    <input type="number" min="0" max="100" step="0.5" value={referralCommissionVal} onChange={e => setReferralCommissionVal(e.target.value)} className="flex-1 p-3 bg-white rounded-xl text-sm outline-none border border-blue-100 text-center font-bold" placeholder="مثال: 10" />
                    <span className="text-gray-500 font-bold text-lg">%</span>
                    <button disabled={savingDiscount} onClick={async () => { setSavingDiscount(true); await handleUpdateSetting('referral_commission', referralCommissionVal); setSavingDiscount(false); }} className="bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-bold disabled:opacity-50">
                      {savingDiscount ? "..." : "حفظ"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Customize Rewards Modal */}
          {activeSubMenu === "customize_rewards" && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[60] bg-black/50 flex items-end justify-center" onClick={() => setActiveSubMenu(null)}>
              <motion.div initial={{y:100,opacity:0}} animate={{y:0,opacity:1}} exit={{y:100,opacity:0}} className="bg-white w-full max-w-lg rounded-t-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2"><Crown size={18} className="text-yellow-600"/>تخصيص نظام المكافآت والأهداف</h3>
                  <button onClick={() => setActiveSubMenu(null)} className="text-gray-400"><X size={22}/></button>
                </div>
                <p className="text-xs text-gray-400 text-center">اختر هدفاً لتعديله</p>
                {rewardGoals.map((goal) => (
                  <div key={goal.id} className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-gray-800">{goal.name}</p>
                        <p className="text-[10px] text-gray-400">{goal.description}</p>
                      </div>
                      <button onClick={() => setEditingGoal({...goal})} className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"><Settings size={12}/>تعديل</button>
                    </div>
                  </div>
                ))}
                {editingGoal && (
                  <div className="bg-yellow-50 rounded-2xl p-4 space-y-3 border border-yellow-100">
                    <h4 className="font-bold text-sm text-yellow-800 flex items-center gap-2"><Crown size={14}/>تعديل: {editingGoal.name}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 font-bold">ترتيب الهدف</label>
                        <input type="number" min="1" value={editingGoal.order} onChange={e => setEditingGoal({...editingGoal, order: parseInt(e.target.value)||1})} className="w-full p-2.5 bg-white rounded-xl text-sm outline-none border border-yellow-100 text-center" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 font-bold">الهدف ($)</label>
                        <input type="number" min="1" value={editingGoal.target} onChange={e => setEditingGoal({...editingGoal, target: parseInt(e.target.value)||1})} className="w-full p-2.5 bg-white rounded-xl text-sm outline-none border border-yellow-100 text-center" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold">اسم الهدف</label>
                      <input type="text" value={editingGoal.name} onChange={e => setEditingGoal({...editingGoal, name: e.target.value})} className="w-full p-2.5 bg-white rounded-xl text-sm outline-none border border-yellow-100" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold">وصف الهدف</label>
                      <textarea value={editingGoal.description} onChange={e => setEditingGoal({...editingGoal, description: e.target.value})} className="w-full p-2.5 bg-white rounded-xl text-sm outline-none border border-yellow-100 h-16 resize-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold">نوع الإطار</label>
                      <select value={editingGoal.frame} onChange={e => setEditingGoal({...editingGoal, frame: e.target.value})} className="w-full p-2.5 bg-white rounded-xl text-sm outline-none border border-yellow-100">
                        <option value="">بدون إطار</option>
                        <option value="bronze">برونزي</option>
                        <option value="silver">فضي</option>
                        <option value="vip">VIP</option>
                        <option value="gold_animated">ذهبي متحرك</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold">نوع الشارة</label>
                      <select value={editingGoal.badge} onChange={e => setEditingGoal({...editingGoal, badge: e.target.value})} className="w-full p-2.5 bg-white rounded-xl text-sm outline-none border border-yellow-100">
                        <option value="">بدون شارة</option>
                        <option value="bronze">برونز</option>
                        <option value="active">نشيط</option>
                        <option value="energy">طاقة</option>
                        <option value="silver">فضة</option>
                        <option value="gold">ذهب</option>
                        <option value="diamond">ماس</option>
                        <option value="legendary">أسطوري</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold">نوع اللقب</label>
                      <select value={editingGoal.title_type} onChange={e => setEditingGoal({...editingGoal, title_type: e.target.value})} className="w-full p-2.5 bg-white rounded-xl text-sm outline-none border border-yellow-100">
                        <option value="ناشئ">ناشئ</option>
                        <option value="نشيط">نشيط</option>
                        <option value="متميز">متميز</option>
                        <option value="VIP">VIP</option>
                        <option value="نجم">نجم</option>
                        <option value="أسطورة">أسطورة</option>
                        <option value="أسطورة الشحن">أسطورة الشحن</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold">نسبة الخصم % (اتركه فارغاً للبدون خصم)</label>
                      <input type="number" min="0" max="100" step="0.5" value={editingGoal.discount} onChange={e => setEditingGoal({...editingGoal, discount: e.target.value})} className="w-full p-2.5 bg-white rounded-xl text-sm outline-none border border-yellow-100 text-center" placeholder="فارغ = بدون خصم" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingGoal(null)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl text-sm font-bold">إلغاء</button>
                      <button disabled={savingReward} onClick={async () => {
                        setSavingReward(true);
                        const updatedGoals = rewardGoals.map(g => g.id === editingGoal.id ? editingGoal : g).sort((a,b) => a.order - b.order);
                        setRewardGoals(updatedGoals);
                        await handleUpdateSetting('reward_goals', JSON.stringify(updatedGoals));
                        setEditingGoal(null);
                        setSavingReward(false);
                        showToast("✅ تم حفظ الهدف بنجاح", 'success');
                      }} className="flex-1 bg-yellow-600 text-white py-3 rounded-xl text-sm font-bold disabled:opacity-50">
                        {savingReward ? "جاري الحفظ..." : "حفظ التعديلات"}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Admin Nav */}
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around z-40">
          {([
            { tab:"admin_home", icon:<Home size={22}/>, label:"الرئيسية" },
            { tab:"admin_stats", icon:<BarChart2 size={22}/>, label:"الإحصائيات" },
            { tab:"orders", icon:<ShoppingBag size={22}/>, label:"الطلبات", badge: adminOrders.filter((o:any)=>o.status==='pending_admin').length },
            { tab:"fab", icon:null, label:"" },
            { tab:"transactions", icon:<Wallet size={22}/>, label:"الدفعات", badge: adminTransactions.filter((t:any)=>t.status==='pending').length },
            { tab:"chat", icon:<MessageSquare size={22}/>, label:"الشات" },
            { tab:"elements", icon:<LayoutGrid size={22}/>, label:"العناصر" },
          ] as any[]).map((item:any) => {
            if (item.tab === "fab") return (
              <button key="fab" onClick={() => setActiveSubMenu(activeSubMenu==="fab_open"?null:"fab_open")}
                className="relative -top-4 w-14 h-14 bg-[var(--brand)] text-white rounded-full shadow-lg shadow-red-200 flex items-center justify-center active:scale-95 transition-all">
                <Plus size={28} className={`transition-transform duration-200 ${activeSubMenu==="fab_open"?"rotate-45":""}`}/>
              </button>
            );
            return (
              <button key={item.tab} onClick={() => { setAdminTab(item.tab); setActiveSubMenu(null); }}
                className={`flex flex-col items-center gap-0.5 relative ${adminTab===item.tab?"text-[var(--brand)]":"text-gray-400"}`}>
                {item.icon}
                <span className="text-[9px] font-medium">{item.label}</span>
                {item.badge > 0 && <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] bg-[var(--brand)] text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white z-10">{item.badge}</span>}
              </button>
            );
          })}
        </nav>
      </div>
    );
  };

  if (isAdmin) return (
    <>
      <ToastContainer />
      <CustomDialogContainer />
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
        setSiteSettings={setSiteSettings}
      />
    </>
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
                    {(view.type === "checkout" || (checkoutOrderResult && activeTab === "home")) && <CheckoutView />}
                    {view.type === "quick_order" && !checkoutOrderResult && <QuickOrderView />}
                    {view.type === "success" && !checkoutOrderResult && <SuccessView />}
                    {view.type === "login" && <LoginView />}
                    {view.type === "forgot_password" && <ForgotPasswordView />}
                  </>
                )}
                {activeTab === "wallet" && (user ? <WalletView /> : (view.type === "forgot_password" ? <ForgotPasswordView /> : <LoginView />))}
                {activeTab === "orders" && (user ? <OrdersView /> : (view.type === "forgot_password" ? <ForgotPasswordView /> : <LoginView />))}
                {activeTab === "profile" && (
                  <>
                    {view.type === "main" && <ProfileView />}
                    {view.type === "profile_details" && <ProfileDetailsView />}
                    {view.type === "rewards_leaderboard" && <RewardsLeaderboardView />}
                    {view.type === "leaderboard" && <LeaderboardView />}
                    {view.type === "payments" && <PaymentsView />}
                    {view.type === "edit_profile" && <EditProfileView />}
                    {view.type === "referral" && <ReferralView />}
                    {view.type === "privacy_policy" && <PrivacyPolicyView />}
                    {view.type === "chat" && <ChatView />}
                    {view.type === "settings" && <SettingsView />}
                    {view.type === "success" && <SuccessView />}
                    {view.type === "login" && <LoginView />}
                    {view.type === "forgot_password" && <ForgotPasswordView />}
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
                      showToast("تم نسخ الكود", 'success');
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
            <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-[var(--brand)] animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== LONG PRESS FAVORITE OVERLAY ===== */}
      <AnimatePresence>
        {longPressTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.45)" }}
            onClick={() => setLongPressTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="bg-white rounded-2xl shadow-2xl p-5 mx-6 w-72 flex flex-col items-center gap-4"
              onClick={e => e.stopPropagation()}
            >
              {/* صورة العنصر */}
              {longPressTarget._fav_image && (
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={longPressTarget._fav_image}
                    alt={longPressTarget._fav_label}
                    className="w-full h-full object-cover"
                    draggable={false}
                    onDragStart={e => e.preventDefault()}
                    onContextMenu={e => e.preventDefault()}
                  />
                </div>
              )}
              <p className="font-bold text-gray-800 text-center text-sm">{longPressTarget._fav_label}</p>

              {isFavorite(longPressTarget._fav_key) ? (
                <div className="flex flex-col items-center gap-2 w-full">
                  <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                    <Star size={16} fill="currentColor" />
                    <span>موجود في المفضلة</span>
                  </div>
                  <button
                    onClick={() => { removeFromFavorites(longPressTarget._fav_key); setLongPressTarget(null); }}
                    className="w-full py-2.5 rounded-xl bg-red-50 text-red-500 font-bold text-sm"
                  >
                    إزالة من المفضلة
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addToFavorites(longPressTarget)}
                  className={`w-full py-3 rounded-xl ${theme.button} text-white font-bold text-sm flex items-center justify-center gap-2`}
                >
                  <Star size={16} fill="currentColor" />
                  إضافة إلى المفضلة
                </button>
              )}

              <button
                onClick={() => setLongPressTarget(null)}
                className="text-gray-400 text-sm"
              >
                إلغاء
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ===== END LONG PRESS OVERLAY ===== */}

      {/* ===== ONBOARDING TUTORIAL ===== */}
      <AnimatePresence>
        {showOnboarding && (() => {
          const steps = [
            {
              icon: "⭐",
              title: "إضافة التطبيقات للمفضلة",
              desc: "لإضافة أي قسم أو منتج إلى المفضلة، اضغط عليه ضغطةً مطولة وستظهر لك قائمة الإضافة.",
            },
            {
              icon: "💳",
              title: "كيفية شحن رصيدك",
              desc: "اذهب إلى تبويب «شحن» ← اختر طريقة الدفع ← انسخ عنوان الحساب ← حوّل المبلغ ← خذ لقطة شاشة للحوالة ← ارجع للموقع وأدخل المبلغ وارفع صورة الحوالة.",
            },
            {
              icon: "🛍️",
              title: "تتبع طلباتك",
              desc: "بعد إتمام أي طلب، يمكنك متابعة حالته في تبويب «الطلبات» في الشريط السفلي.",
            },
            {
              icon: "🔔",
              title: "الإشعارات والدعم",
              desc: "ستصلك إشعارات فورية عند تحديث حالة طلبك. وللتواصل مع الدعم الفني، اذهب إلى «حسابي» ← «تواصل معنا».",
            },
            {
              icon: "🎁",
              title: "نقاط المكافآت",
              desc: "مع كل طلب تجمع نقاطاً يمكنك استبدالها بمكافآت ومزايا حصرية. تحقق من رصيد نقاطك في صفحة «حسابي».",
            },
          ];
          const step = steps[onboardingStep];
          const isLast = onboardingStep === steps.length - 1;
          return (
            <motion.div
              key="onboarding-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-end justify-center p-4 pb-8"
            >
              <motion.div
                key={onboardingStep}
                initial={{ opacity: 0, y: 60, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
              >
                {/* Progress bar */}
                <div className="h-1 bg-gray-100">
                  <div
                    className="h-full bg-brand transition-all duration-500 rounded-full"
                    style={{ width: `${((onboardingStep + 1) / steps.length) * 100}%` }}
                  />
                </div>

                <div className="p-7 text-center space-y-4" dir="rtl">
                  {/* Icon */}
                  <div className="w-20 h-20 bg-brand-light rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-sm">
                    {step.icon}
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>

                  {/* Step dots */}
                  <div className="flex justify-center gap-2 pt-1">
                    {steps.map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 rounded-full transition-all duration-300 ${i === onboardingStep ? "w-6 bg-brand" : "w-2 bg-gray-200"}`}
                      />
                    ))}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowOnboarding(false)}
                      className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-400 text-sm font-bold active:scale-95 active:bg-[#B00000]/10 transition-all"
                    >
                      تخطي
                    </button>
                    <button
                      onClick={() => {
                        if (isLast) {
                          setShowOnboarding(false);
                        } else {
                          setOnboardingStep(s => s + 1);
                        }
                      }}
                      className="flex-[2] py-3 rounded-2xl bg-brand text-white text-sm font-bold active:scale-95 active:opacity-80 transition-all shadow-lg shadow-brand-soft"
                    >
                      {isLast ? "ابدأ الآن 🎉" : "التالي"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
      {/* ===== END ONBOARDING TUTORIAL ===== */}

      {/* ===== TOAST CONTAINER ===== */}
      <ToastContainer />

      {/* ===== CUSTOM DIALOG CONTAINER ===== */}
      <CustomDialogContainer />
    </div>
  );
}
