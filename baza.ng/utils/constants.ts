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
  | "wholesale"
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
    key: "wholesale",
    title: "Buy Wholesale",
    subtitle: "BETTER UNIT PRICE. RIGHT QUANTITY.",
    emoji: "",
    imageUrl:
      "https://res.cloudinary.com/dunnk4pbw/image/upload/v1772497110/Buy_Wholesale_onadh7.png",
    color: "#4caf7d",
    bg: "#111315",
    route: "/(app)/modes/wholesale",
  },
  {
    key: "stockup",
    title: "Stock up the house",
    subtitle: "BUNDLES FOR THE WEEK OR MONTH",
    emoji: "🏠",
    imageUrl:
      "https://res.cloudinary.com/dunnk4pbw/image/upload/v1772497112/Stock_Up_the_House_hmfwwo.png",
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
      "https://res.cloudinary.com/dunnk4pbw/image/upload/v1772497111/Cook_a_Meal_qbxxhv.png",
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
      "https://res.cloudinary.com/dunnk4pbw/image/upload/v1772497111/Ready_to_Eat_pp2f9u.png",
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
      "https://res.cloudinary.com/dunnk4pbw/image/upload/v1772497111/Snacks_Drinks_ksobtm.png",
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
      "https://res.cloudinary.com/dunnk4pbw/image/upload/v1772497111/Shop_with_AI_thuej0.png",
    color: "#4caf7d",
    bg: "#0d1a0f",
    route: "/(app)/modes/shoplist",
  },
  // {
  //   key: "chat",
  //   title: "Help me decide",
  //   subtitle: "AI ASSISTANT, READY TO HELP",
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
