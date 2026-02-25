// Baza.ng — Mobile Design Tokens
// Import from anywhere in the mobile app.
// These match STYLE_GUIDE.md exactly.
// Usage: import { Colors, Typography, Spacing, Radius } from '@/constants/design';

// ─── COLORS ──────────────────────────────────────────────────────────────────

export const Colors = {
  // Base backgrounds
  bg: {
    deepest:     '#060d07',   // auth screens, profile, cart
    green:       '#0a1a0c',   // intent gate (home)
    navy:        '#070a12',   // Shop Your List
    card:        '#080f09',   // profile rows, settings
    readyEat:    '#0a0600',   // ready to eat mode
    snacks:      '#0c0714',   // snacks & drinks mode
    navyCard:    '#0d1220',   // restock item rows
  },

  // Mode accent colors
  accent: {
    green:       '#4caf7d',   // primary brand, Cook a Meal, success, CTA
    amber:       '#f5a623',   // Stock Up, Egusi, active orders
    red:         '#e85c3a',   // Ready to Eat, Jollof, Protein Pack
    purple:      '#c77dff',   // Snacks & Drinks
    blue:        '#6ec6ff',   // Shop Your List, address, Beverage
    yellow:      '#ffe082',   // Fried Rice, Beverage items
  },

  // Text
  text: {
    primary:     '#f0f0e8',   // headlines, prices
    secondary:   '#c8e0ca',   // body on dark green
    secondaryNav:'#c8d8f0',   // body on dark navy
    muted:       '#9ab09b',   // ingredient names
    subdued:     '#5a7a5a',   // description on green bg
    mutedNav:    '#3a5a8a',   // body on navy bg
  },

  // Labels (low contrast — intentional)
  label: {
    green:       '#2a3a2a',   // subtle on green bg
    navy:        '#2a4060',   // subtle on navy bg
    faint:       '#1a2a1a',   // near-invisible on green
    faintNav:    '#1a2540',   // near-invisible on navy
    danger:      '#3a1a1a',   // dark red border
    dangerText:  '#5a2a2a',   // muted red text
  },

  // Status
  status: {
    success:     '#4caf7d',
    warning:     '#f5a623',
    error:       '#e85c3a',
    info:        '#6ec6ff',
  },

  // Per-bundle/pack colors (look up by bundle.id or pack.id)
  byMealPack: {
    m1: '#e85c3a',  // Jollof
    m2: '#f5a623',  // Egusi
    m3: '#4caf7d',  // Okro
    m4: '#ffe082',  // Fried Rice
  },

  byBundle: {
    b1: '#f5a623',  // Breakfast
    b2: '#e85c3a',  // Protein
    b3: '#4caf7d',  // Pantry
    b4: '#6ec6ff',  // Beverage
  },

  // Utility
  white:         '#ffffff',
  transparent:   'transparent',

  // Overlay
  overlay:       'rgba(0,0,0,0.88)',
} as const;

// ─── TYPOGRAPHY ──────────────────────────────────────────────────────────────
// Fonts must be loaded via expo-font:
//   import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
//   import { SpaceMono_400Regular } from '@expo-google-fonts/space-mono';

export const Fonts = {
  serif:   'DMSerifDisplay_400Regular',  // DM Serif Display — headlines, product names
  mono:    'SpaceMono_400Regular',       // SpaceMono — prices, labels, buttons, everything else
} as const;

export const FontSize = {
  micro:   9,   // uppercase labels, category pills
  tiny:    10,  // secondary labels, brand names
  small:   11,  // body text, button text
  body:    12,  // item names, setting rows
  bodyMd:  13,  // list item names
  md:      14,  // prices in lists
  otp:     16,  // OTP digit boxes
  stepper: 18,  // stepper numbers
  title:   24,  // screen titles
  titleLg: 26,  // large screen titles
  hero:    80,  // emoji heroes (product detail)
  heroLg:  100, // emoji heroes (popup modal)
} as const;

export const LetterSpacing = {
  none:    0,
  tight:   0.5,
  normal:  1,
  wide:    2,    // labels (in React Native, values are in points not em)
  wider:   3,
  widest:  4,
} as const;

// ─── SPACING ─────────────────────────────────────────────────────────────────

export const Spacing = {
  xxs:  4,
  xs:   6,
  sm:   8,
  md:   12,
  base: 14,
  lg:   16,
  xl:   20,
  xxl:  24,
  statusBar: 52,   // top padding to clear status bar
  safeBottom: 80,  // bottom padding for scrollable content (above floating cart)
} as const;

// ─── BORDER RADIUS ───────────────────────────────────────────────────────────
// Sharp corners everywhere. Only exceptions are bottom sheet and circles.

export const Radius = {
  none:   0,     // Standard cards, buttons, inputs, list items
  circle: 9999,  // Floating cart button, status dots, icon circles
  sheet:  20,    // Bottom sheet modal top corners ONLY
} as const;

// ─── BORDERS ─────────────────────────────────────────────────────────────────

export const makeBorder = (color: string, opacity: string = '22') =>
  ({ borderWidth: 1, borderColor: color + opacity });

export const BorderPresets = {
  card:       (color: string) => makeBorder(color, '22'),  // subtle card border
  active:     (color: string) => makeBorder(color, '55'),  // selected/active
  divider:    (color: string) => makeBorder(color, '0a'),  // barely visible row divider
  input:      { borderWidth: 1, borderColor: '#1a2a1c' },  // input on green bg
  inputNavy:  { borderWidth: 1, borderColor: '#1a2540' },  // input on navy bg
  danger:     { borderWidth: 1, borderColor: '#3a1a1a' },  // remove/delete
  sheetTop:   (color: string) => ({ borderTopWidth: 2, borderTopColor: color + '44' }),
} as const;

// ─── SHADOWS ─────────────────────────────────────────────────────────────────
// Baza doesn't use shadows — we use borders for depth.
// Only exception: the floating cart button glow.

export const Glow = {
  amber: {
    shadowColor: '#f5a623',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,  // Android
  },
  green: {
    shadowColor: '#4caf7d',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
} as const;

// ─── ANIMATION DURATIONS ─────────────────────────────────────────────────────

export const Duration = {
  instant:  100,
  fast:     150,
  normal:   200,
  medium:   250,
  slow:     300,
} as const;

// ─── COMPONENT SIZE PRESETS ──────────────────────────────────────────────────

export const Size = {
  // QtyControl buttons
  qtyBtn:     { width: 32, height: 32 },
  qtyBtnSm:   { width: 26, height: 26 },
  // Floating cart
  floatingCart: { height: 44, minWidth: 100, borderRadius: 50 },
  // Emoji thumbnail in lists
  thumbnail:  { width: 44, height: 44 },
  // Mode card icon
  modeIcon:   { width: 42, height: 42 },
  // Status indicator dot
  dot:        { width: 6, height: 6, borderRadius: 3 },
} as const;

// ─── SCREEN THEME PRESETS ────────────────────────────────────────────────────
// Quick lookup by screen/mode key

export const ScreenTheme: Record<string, { bg: string; accent: string }> = {
  auth:        { bg: Colors.bg.deepest,  accent: Colors.accent.green },
  intent:      { bg: Colors.bg.green,    accent: Colors.accent.green },
  cart:        { bg: Colors.bg.deepest,  accent: Colors.accent.green },
  orders:      { bg: Colors.bg.deepest,  accent: Colors.accent.amber },
  profile:     { bg: Colors.bg.deepest,  accent: Colors.accent.green },
  stockup:     { bg: Colors.bg.deepest,  accent: Colors.accent.amber },
  tonight:     { bg: Colors.bg.deepest,  accent: Colors.accent.green },  // dynamic per pack
  readyeat:    { bg: Colors.bg.readyEat, accent: Colors.accent.red },
  quickies:    { bg: Colors.bg.snacks,   accent: Colors.accent.purple },
  restock:     { bg: Colors.bg.navy,     accent: Colors.accent.blue },
  chat:        { bg: Colors.bg.deepest,  accent: Colors.accent.green },
  address:     { bg: Colors.bg.deepest,  accent: Colors.accent.blue },
  refer:       { bg: Colors.bg.deepest,  accent: Colors.accent.amber },
  support:     { bg: Colors.bg.deepest,  accent: Colors.accent.green },
  settings:    { bg: Colors.bg.deepest,  accent: Colors.accent.green },
};

// ─── PRICE FORMATTING ────────────────────────────────────────────────────────
// Always display in naira. All API values are in kobo.

export const formatPrice = (kobo: number): string =>
  `₦${(kobo / 100).toLocaleString('en-NG')}`;

export const toKobo = (naira: number): number => Math.round(naira * 100);
export const toNaira = (kobo: number): number => kobo / 100;
