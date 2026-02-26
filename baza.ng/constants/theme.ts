export const colors = {
  bg: {
    primary: "#060d07",
    secondary: "#080f09",
    tertiary: "#0a1a0c",
    card: "#0d1a0f",
    surface: "#070a12",
  },
  accent: {
    green: "#4caf7d",
    amber: "#f5a623",
    red: "#e85c3a",
    purple: "#c77dff",
    blue: "#6ec6ff",
    orange: "#ff8a50",
  },
  text: {
    primary: "#f5f5f0",
    secondary: "#2a4a2a",
    muted: "#555555",
    inverse: "#000000",
  },
  border: {
    default: "#1a2a1c",
    subtle: "#2a4a2c",
  },
  mode: {
    stockup: { accent: "#f5a623", bg: "#1a1200" },
    cookmeal: { accent: "#e85c3a", bg: "#1a0800" },
    readyeat: { accent: "#e85c3a", bg: "#1a0600" },
    snacks: { accent: "#c77dff", bg: "#0d0019" },
    shoplist: { accent: "#6ec6ff", bg: "#000d1a" },
    chat: { accent: "#4caf7d", bg: "#001a0a" },
  },
  status: {
    PENDING: "#f5a623",
    CONFIRMED: "#4caf7d",
    PREPARING: "#6ec6ff",
    DISPATCHED: "#c77dff",
    DELIVERED: "#4caf7d",
    CANCELLED: "#e85c3a",
  },
} as const;

export const fonts = {
  serif: "NotoSerif_400Regular",
  mono: "NotoSerif_400Regular",
} as const;

export const spacing = {
  statusBar: 52,
  safeBottom: 40,
  safeBottomLarge: 44,
  safeBottomXL: 48,
  floatingCart: 80,
  grid: 4,
} as const;

export const radii = {
  none: 0,
  sheet: 20,
} as const;
