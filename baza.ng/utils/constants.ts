export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://baza-chi.vercel.app/v1";

export const DEEP_LINK_SCHEME = "bazang";

export const TOKEN_REFRESH_BUFFER_MS = 60_000;

export const WALLET_POLL_INTERVAL_MS = 10_000;

export const OTP_LENGTH = 6;
export const OTP_EXPIRY_SECONDS = 300;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

export const SNACK_CATEGORIES = ["All", "Snacks", "Breads", "Drinks"] as const;

export const RESTOCK_CATEGORIES = [
  "All",
  "Grains",
  "Protein",
  "Cooking",
  "Seasoning",
  "Dairy",
  "Staples",
  "Household",
] as const;

export type ShoppingMode =
  | "stockup"
  | "cookmeal"
  | "readyeat"
  | "snacks"
  | "shoplist"
  | "chat";

export interface ModeConfig {
  key: ShoppingMode;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  bg: string;
  route: string;
}

export const SHOPPING_MODES: ModeConfig[] = [
  {
    key: "shoplist",
    title: "Shop Your List",
    subtitle: "Search and build your own",
    emoji: "📝",
    color: "#6ec6ff",
    bg: "#000d1a",
    route: "/(app)/modes/shoplist",
  },
  {
    key: "stockup",
    title: "Stock Up",
    subtitle: "Pre-built bundles, one tap",
    emoji: "📦",
    color: "#f5a623",
    bg: "#1a1200",
    route: "/(app)/modes/stockup",
  },
  {
    key: "cookmeal",
    title: "Cook a Meal",
    subtitle: "Ingredients for tonight",
    emoji: "🍲",
    color: "#e85c3a",
    bg: "#1a0800",
    route: "/(app)/modes/cookmeal",
  },
  {
    key: "readyeat",
    title: "Ready to Eat",
    subtitle: "Hot food, delivered fast",
    emoji: "🍛",
    color: "#e85c3a",
    bg: "#1a0600",
    route: "/(app)/modes/readyeat",
  },
  {
    key: "snacks",
    title: "Snacks & Drinks",
    subtitle: "Quick bites and beverages",
    emoji: "🍿",
    color: "#c77dff",
    bg: "#0d0019",
    route: "/(app)/modes/snacks",
  },
  {
    key: "chat",
    title: "Help Me Decide (AI COMING SOON)",
    subtitle: "AI picks for you",
    emoji: "💬",
    color: "#4caf7d",
    bg: "#001a0a",
    route: "/(app)/modes/chat",
  },
];

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  DISPATCHED: "On the way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};
