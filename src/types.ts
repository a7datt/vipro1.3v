import { LucideIcon } from "lucide-react";

export interface Category {
  id: number;
  name: string;
  image_url: string;
}

export interface Subcategory {
  id: number;
  category_id: number;
  name: string;
  image_url: string;
}

export interface SubSubCategory {
  id: number;
  subcategory_id: number;
  name: string;
  image_url: string;
}

export interface Product {
  id: number;
  subcategory_id: number;
  sub_sub_category_id?: number;
  name: string;
  price: number;
  description: string;
  image_url: string;
  requires_input: boolean;
  store_type: string;
  min_quantity?: number;
  price_per_unit?: number;
  external_id?: string;
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  balance: number;
  role: string;
  personal_number: string;
  avatar_url?: string;
  phone?: string;
  telegram_chat_id?: number | null;
  is_vip: boolean;
  is_banned: boolean;
  is_blocked?: boolean;
  blocked_until?: string;
  created_at?: string;
  stats?: {
    total_recharge_sum: number;
    claimed_reward_index: number;
    referral_count: number;
    total_orders_count: number;
    login_days_count: number;
    profile_badge?: string;
    user_title?: string;
    frame?: string;
    profile_emoji?: string;
    has_priority_orders?: boolean;
    has_special_support?: boolean;
    custom_theme_color?: string;
  };
}

export interface Order {
  id: number;
  product_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  meta: string;
  admin_response?: string;
  user_name?: string;
}

export interface Transaction {
  id: number;
  amount: number;
  method_name: string;
  status: string;
  created_at: string;
  receipt_image_url: string;
  note: string;
  user_name?: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
  wallet_address: string;
  instructions: string;
  image_url: string;
  min_amount: number;
  method_type?: 'manual' | 'syriatel' | 'shamcash';
  api_account?: string;
}

export interface Banner {
  id: number;
  image_url: string;
}

export interface Offer {
  id: number;
  title: string;
  description: string;
  image_url: string;
}

export interface VoucherRedeemViewProps {
  voucherCode: string;
  setVoucherCode: (val: string) => void;
  handleRedeemVoucher: () => void;
  setView: (val: any) => void;
}

export interface AdminLoginViewProps {
  setIsAdmin: (val: boolean) => void;
  setAdminAuth: (val: boolean) => void;
  setView: (val: any) => void;
}

export interface AdminPanelProps {
  user: UserData | null;
  fetchUser: (id: number) => Promise<void>;
  categories: Category[];
  subcategories: Subcategory[];
  subSubCategories: SubSubCategory[];
  fetchCategories: () => Promise<void>;
  fetchSubcategories: () => Promise<void>;
  fetchSubSubCategories: () => Promise<void>;
  paymentMethods: PaymentMethod[];
  fetchPaymentMethods: () => Promise<void>;
  banners: Banner[];
  fetchBanners: () => Promise<void>;
  offers: Offer[];
  fetchOffers: () => Promise<void>;
  setIsAdmin: (val: boolean) => void;
  theme: any;
  adminTab: string;
  setAdminTab: (val: string) => void;
  selectedChatUser: any;
  setSelectedChatUser: (user: any) => void;
  setSiteSettings: (data: any[]) => void;
}

export interface AdminChatViewProps {
  selectedChatUser: any;
  setSelectedChatUser: (user: any) => void;
}

export interface PrivacyPolicyViewProps {
  setView: (val: any) => void;
}

export interface SettingsViewProps {
  setView: (val: any) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export interface SuccessViewProps {
  setView: (val: any) => void;
  setActiveTab: (val: string) => void;
  viewData: any;
}
