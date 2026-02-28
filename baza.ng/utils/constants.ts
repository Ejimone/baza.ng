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
  imageUrl?: string;
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
    imageUrl:
      "https://res.cloudinary.com/dunnk4pbw/image/upload/v1772258098/stock-up_mgqkal.jpg",
    color: "#4caf7d",
    bg: "#0d1a0f",
    route: "/(app)/modes/stockup",
  },
  {
    key: "cookmeal",
    title: "Cook a meal",
    subtitle: "MEAL PACKS FOR ANY TIME OF DAY",
    emoji: "🍳",
    imageUrl:
      "https://res.cloudinary.com/dunnk4pbw/image/upload/v1772258098/mealpack_ut1e1k.jpg",
    color: "#4caf7d",
    bg: "#0d1a0f",
    route: "/(app)/modes/cookmeal",
  },
  {
    key: "readyeat",
    title: "Ready to eat",
    subtitle: "HOT FOOD, DELIVERED NOW",
    emoji: "🥡",
    imageUrl:
      "https://res.cloudinary.com/dunnk4pbw/image/upload/v1772258098/ready_to_eat_ts7lfd.jpg",
    color: "#4caf7d",
    bg: "#0d1a0f",
    route: "/(app)/modes/readyeat",
  },
  {
    key: "snacks",
    title: "Snacks & Drinks",
    subtitle: "DRINKS, SNACKS & BAKED GOODS",
    emoji: "⚡",
    imageUrl:
      "https://res.cloudinary.com/dunnk4pbw/image/upload/v1772258098/snacks_xxmult.jpg",
    color: "#4caf7d",
    bg: "#0d1a0f",
    route: "/(app)/modes/snacks",
  },
  {
    key: "shoplist",
    title: "Shop Your List",
    subtitle: "PICK EXACTLY WHAT YOU NEED",
    emoji: "🔍",
    imageUrl:
      "https://res.cloudinary.com/dunnk4pbw/image/upload/v1772258098/your_list_h3kj62.jpg",
    color: "#4caf7d",
    bg: "#0d1a0f",
    route: "/(app)/modes/shoplist",
  },
  // {
  //   key: "chat",
  //   title: "Help me decide",
  //   subtitle: "AI(COMING SOON)",
  //   emoji: "💬",
  //   imageUrl:
  //     "https://res.cloudinary.com/dunnk4pbw/image/upload/v1772258333/suraajm20-ai-generated-9688500_1920_qpqfr3.png",
  //   color: "#4caf7d",
  //   bg: "#0d1a0f",
  //   route: "/(app)/modes/chat",
  // },
];

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  DISPATCHED: "On the way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};
