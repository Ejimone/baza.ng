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
    key: "stockup",
    title: "Stock up the house",
    subtitle: "BUNDLES FOR THE WEEK OR MONTH",
    emoji: "🏠",
    color: "#4caf7d",
    bg: "#0d1a0f",
    route: "/(app)/modes/stockup",
  },
  {
    key: "cookmeal",
    title: "Cook a meal",
    subtitle: "MEAL PACKS FOR ANY TIME OF DAY",
    emoji: "🍳",
    color: "#4caf7d",
    bg: "#0d1a0f",
    route: "/(app)/modes/cookmeal",
  },
  {
    key: "readyeat",
    title: "Ready to eat",
    subtitle: "HOT FOOD, DELIVERED NOW",
    emoji: "🥡",
    color: "#4caf7d",
    bg: "#0d1a0f",
    route: "/(app)/modes/readyeat",
  },
  {
    key: "snacks",
    title: "Snacks & Drinks",
    subtitle: "DRINKS, SNACKS & BAKED GOODS",
    emoji: "⚡",
    color: "#4caf7d",
    bg: "#0d1a0f",
    route: "/(app)/modes/snacks",
  },
  {
    key: "shoplist",
    title: "Shop Your List",
    subtitle: "PICK EXACTLY WHAT YOU NEED",
    emoji: "🔍",
    color: "#4caf7d",
    bg: "#0d1a0f",
    route: "/(app)/modes/shoplist",
  },
  {
    key: "chat",
    title: "Help me decide",
    subtitle: "AI(COMING SOON)",
    emoji: "💬",
    color: "#4caf7d",
    bg: "#0d1a0f",
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
