// Enums

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED";

export type WalletTxnType =
  | "CREDIT_TRANSFER"
  | "CREDIT_CARD"
  | "CREDIT_REFERRAL"
  | "DEBIT_ORDER"
  | "DEBIT_REFUND";

export type MessageSender = "USER" | "AI" | "HUMAN_AGENT" | "SYSTEM";

export type CartItemType =
  | "product"
  | "bundle"
  | "mealpack"
  | "readyeat"
  | "snack";

// User & Auth

export interface NotificationPreferences {
  orders: boolean;
  delivery: boolean;
  deals: boolean;
  reminders: boolean;
  newsletter: boolean;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  memberSince: string;
  walletBalance: number;
  accountNumber?: string;
  bankName?: string;
  accountName?: string;
  referralCode: string;
  notifications: NotificationPreferences;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
}

// Addresses

export interface Address {
  id: string;
  label: string;
  address: string;
  landmark?: string;
  isDefault: boolean;
}

// Products — Stock Up Bundles

export interface BundleItem {
  id: string;
  productId: string;
  name: string;
  emoji: string;
  unitPrice: number;
  defaultQty: number;
  minQty: number;
  maxQty: number;
}

export interface Bundle {
  id: string;
  name: string;
  emoji: string;
  description: string;
  basePrice: number;
  savings: number;
  color: string;
  tags: string[];
  items: BundleItem[];
}

// Products — Cook a Meal

export interface MealIngredient {
  name: string;
  emoji: string;
  unit: string;
  perPlate: number;
  pricePerPlate: number;
}

export interface MealPack {
  id: string;
  name: string;
  emoji: string;
  description: string;
  baseTime: number;
  basePlates: number;
  basePrice: number;
  color: string;
  ingredients: MealIngredient[];
}

// Products — Ready to Eat

export interface ReadyEatItem {
  id: string;
  name: string;
  kitchen: string;
  emoji: string;
  price: number;
  oldPrice?: number;
  deliveryTime: string;
  tags: string[];
  description: string;
  color: string;
}

// Products — Snacks & Drinks

export interface SnackItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  category: string;
  tag: string;
  color: string;
}

// Products — Restock / Shop Your List

export interface RestockItem {
  id: string;
  name: string;
  brand: string;
  emoji: string;
  price: number;
  category: string;
}

// Cart

export interface BundleMeta {
  items: Array<{ id: string; name: string; qty: number; unitPrice: number }>;
}

export interface MealPackMeta {
  plates: number;
  removedItems: string[];
  extraItems?: Array<{
    id: string;
    name: string;
    emoji: string;
    qty: number;
    unitPrice: number;
  }>;
}

export interface CartItem {
  id: string;
  itemType: CartItemType;
  productId?: string;
  name: string;
  emoji: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  meta?: BundleMeta | MealPackMeta;
}

// Orders

export interface OrderItemSummary {
  name: string;
  emoji: string;
  qty: number;
}

export interface OrderItem {
  id: string;
  itemType: string;
  name: string;
  emoji: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  meta?: Record<string, unknown>;
}

export interface Order {
  id: string;
  status: OrderStatus;
  total: number;
  note?: string;
  eta?: string;
  items: OrderItemSummary[];
  createdAt: string;
}

export interface OrderDetail extends Omit<Order, "items"> {
  items: OrderItem[];
  addressId?: string;
}

// Wallet

export interface WalletBalance {
  balance: number;
  accountNumber: string;
  bankName: string;
  accountName: string;
}

export interface WalletTransaction {
  id: string;
  amount: number;
  type: WalletTxnType;
  description?: string;
  reference: string;
  createdAt: string;
}

export interface TopupInitResponse {
  authorizationUrl: string;
  accessCode?: string;
  reference: string;
}

export interface TopupVerifyResponse {
  status: string;
  amount: number;
  walletBalance: number;
}

export interface WalletAccountResponse {
  accountNumber: string;
  bankName: string;
  accountName: string;
  assigned: boolean;
  walletBalance: number;
}

export interface PaystackConfig {
  publicKey: string;
}

// Referral

export interface Referral {
  name: string;
  joinedAt: string;
  firstOrderPlaced: boolean;
  creditEarned: number;
}

export interface ReferralStats {
  code: string;
  totalReferrals: number;
  pendingCredits: number;
  paidCredits: number;
  referrals: Referral[];
}

// Support

export interface SupportMessage {
  id: string;
  text: string;
  sender: MessageSender;
  flagged: boolean;
  createdAt: string;
}

export interface SupportThread {
  messages: SupportMessage[];
  humanJoined: boolean;
}

export interface SendMessageResponse {
  userMessage: { id: string; text: string; sender: "USER" };
  aiReply: {
    id: string;
    text: string;
    sender: "AI";
    flagged: boolean;
  };
  humanJoined: boolean;
  flagged: boolean;
}

// Pagination

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface PaginatedResponse<T> {
  data: T;
  pagination: Pagination;
}

// API Error

export interface ApiError {
  error: string;
  code: string;
}
