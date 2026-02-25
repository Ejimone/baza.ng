# Baza.ng Mobile App — Development Status

> Last updated: 2026-02-25 (Phase 4 complete)

---

## Backend API Status

| Test Suite         | Result                 | Notes                                                                                                       |
| ------------------ | ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| `test_runner.py`   | PASS (19/20 endpoints) | All endpoints working. Order create returned 400 (INSUFFICIENT_BALANCE) — expected with low wallet balance. |
| `test_paystack.py` | PASS (6/6 tests)       | Paystack config, wallet balance, topup init, verify flows all working.                                      |
| `UserFlow.py`      | NOT RUN                | Requires interactive OTP input. Verified manually via test_runner.py which covers the same endpoints.       |

**API Base URL:** `https://baza-chi.vercel.app/v1`

**Last tested:** 2026-02-25 (re-verified before Phase 2 build — all results consistent)

### Verified Endpoints

- Auth: otp-verify, refresh, logout
- User: me, profile update, notification preferences
- Addresses: create, list, update, set default
- Products: bundles, mealpacks, readyeat, snacks, restock
- Wallet: balance, transactions, paystack-config, topup, verify-topup
- Orders: create, list, detail
- Referral: stats
- Support: thread, message

---

## Development Phases

### Phase 1: Project Scaffold — COMPLETE

Created the full Expo Router file structure with placeholder components.

**Files created (67 total):**

Screens (25 files):

- `app/(auth)/` — \_layout, index (welcome), signin, signup, otp
- `app/(app)/` — \_layout, index (intent gate), cart, orders, orders/[id], profile
- `app/(app)/modes/` — \_layout, stockup, cookmeal, readyeat, snacks, shoplist, chat
- `app/(app)/modes/stockup/[id]` — bundle detail
- `app/(app)/modes/cookmeal/[id]` — meal pack detail
- `app/(app)/settings/` — \_layout, notifications, address, refer, support, account

Components (22 files):

- `components/ui/` — QtyControl, FloatingCart, FundPrompt, Button, Card, Badge, Input, OTPInput, BottomSheet, LoadingSpinner, EmptyState, SearchBar
- `components/cards/` — BundleCard, MealPackCard, ReadyEatCard, ProductCard, SnackCard, OrderCard, ModeCard
- `components/layout/` — ScreenWrapper, Header
- `components/wallet/` — WalletCard, TransactionItem

State Management (3 files):

- `stores/` — authStore, cartStore, walletStore

Services (7 files):

- `services/` — api, auth, products, orders, wallet, referral, support

Hooks (5 files):

- `hooks/` — useAuth, useCart, useWallet, useOrders, useProducts

Types & Utilities (5 files):

- `types/index.ts`
- `utils/` — format, constants, storage
- `constants/theme.ts`

Updated (2 files):

- `app/_layout.tsx` — root layout with auth/app groups
- `app/index.tsx` — entry redirect to (auth)

---

### Phase 1.5: NativeWind Style System — COMPLETE

Installed NativeWind v4 and translated all 579 inline style declarations from `baza-ng-v3.jsx` into NativeWind/Tailwind class strings.

**Dependencies added:**

- `nativewind` v4.2.2
- `tailwindcss` v3.4.17
- `postcss` v8.5.6 (dev)

**New files (6):**

- `tailwind.config.js` — All custom design tokens from the prototype:
  - Colors: baza backgrounds, per-mode backgrounds (stockup/cookmeal/readyeat/snacks/shoplist/chat), accent colors (green/amber/red/purple/blue/orange), text colors, border colors, and per-screen variants
  - Fonts: DM Serif Display (serif), SpaceMono (mono)
  - Spacing: status bar (52px), safe area (40px/44px/48px), floating cart (80px)
  - Letter spacing: 13 custom values from tight-1 to wide-3xl
  - Font sizes: 2xs (8px), 3xs (9px), xxs (10px)
- `global.css` — Tailwind base/components/utilities directives
- `babel.config.js` — NativeWind v4 babel preset with `jsxImportSource: "nativewind"`
- `metro.config.js` — Metro config with `withNativeWind()` CSS transformer
- `nativewind-env.d.ts` — TypeScript ambient declaration for `className` prop
- `styles/index.ts` — Component styles module (44KB, all 23 components)

**Component styles covered (23 total):**

- [x] Splash, IntentGate, IntentGateWithBalance
- [x] BundleDetail, StockUpMode
- [x] MealPackDetail, TonightMode (Cook a Meal)
- [x] ReadyEatMode (including popup modal)
- [x] SnacksDrinksMode (QuickiesMode)
- [x] RestockMode (Shop Your List)
- [x] ChatMode (Help Me Decide)
- [x] FundPrompt
- [x] CartScreen
- [x] OrdersScreen
- [x] ProfileScreen (including top-up sheet)
- [x] NotificationsScreen
- [x] DeliveryAddressScreen (including add form overlay)
- [x] ReferScreen
- [x] AuthScreen (welcome, signin, signup, otp sub-screens)
- [x] SupportChatScreen
- [x] AccountSettingsScreen
- [x] FloatingCart
- [x] QtyControl

**Modified files (1):**

- `app/_layout.tsx` — Added `import "../global.css"` for NativeWind processing

---

### Phase 2: Core Infrastructure — COMPLETE

Installed core dependencies and implemented the full foundation layer: TypeScript types, API client with auth interceptors, Zustand state management, service layer, custom hooks, and utility modules. All code is type-checked and lint-free. Zero mock data — everything connects to the live API.

**Dependencies added:**

- `zustand` — lightweight state management (3 stores)
- `axios` — HTTP client with request/response interceptors
- `expo-secure-store` — secure storage for refresh tokens (native keychain)

**Implemented files (20 total):**

Types (1 file):

- `types/index.ts` — 30+ interfaces and type aliases covering all API shapes:
  - User, Address, NotificationPreferences
  - Bundle, BundleItem, MealPack, MealIngredient
  - ReadyEatItem, SnackItem, RestockItem
  - CartItem (discriminated by itemType with BundleMeta/MealPackMeta)
  - Order, OrderDetail, OrderItem, OrderItemSummary, OrderStatus
  - WalletBalance, WalletTransaction, TopupInitResponse, TopupVerifyResponse, PaystackConfig
  - ReferralStats, Referral
  - SupportMessage, SupportThread, SendMessageResponse
  - Pagination, PaginatedResponse, ApiError

Utilities (4 files):

- `utils/constants.ts` — API_BASE_URL (from EXPO_PUBLIC_API_URL env var with fallback), shopping mode configs (6 modes with key/title/subtitle/emoji/color/bg/route), snack categories, restock categories, order status labels, OTP/polling constants
- `utils/storage.ts` — SecureStore wrappers: getRefreshToken(), setRefreshToken(), deleteRefreshToken(). Access token stays in Zustand memory only.
- `utils/format.ts` — formatPrice(kobo) → "₦X,XXX", clamp(), truncate(), getGreeting() (time-of-day), formatDate() (relative time)
- `constants/theme.ts` — Design tokens: bg colors, accent colors per mode, text colors, border colors, order status colors, font families, spacing constants, radii

API Client (1 file):

- `services/api.ts` — Axios instance with:
  - Base URL from constants
  - Request interceptor: attaches Bearer token from authStore
  - Response interceptor: on 401, queues requests, attempts /auth/refresh, retries all queued requests on success
  - On refresh failure: calls authStore.logout()
  - setAuthAccessors() for lazy store wiring (avoids circular imports)

Services (6 files):

- `services/auth.ts` — requestOtp(phone), verifyOtp(payload), refreshToken(), logout()
- `services/products.ts` — getBundles(), getMealPacks(), getReadyEat(), getSnacks(category?), getRestock(category?, q?)
- `services/orders.ts` — createOrder(payload), getOrders(page?, limit?, status?), getOrder(id), cartItemsToOrderItems() helper
- `services/wallet.ts` — getBalance(), getTransactions(page?, limit?), getPaystackConfig(), initTopup(amount, callbackUrl), verifyTopup(reference)
- `services/referral.ts` — getStats()
- `services/support.ts` — getThread(), sendMessage(text)

Stores (3 files):

- `stores/authStore.ts` — Zustand store: user, accessToken, isAuthenticated, login(), logout() (clears SecureStore), setAccessToken(), updateUser(). Auto-wires API client on import.
- `stores/cartStore.ts` — Zustand store: items[], addItem() (merge if existing), removeItem(), updateQty() (auto-remove at 0), clear(), total() (kobo sum), count() (qty sum)
- `stores/walletStore.ts` — Zustand store: balance, accountNumber, bankName, accountName, isLoading, setBalance(), setWalletInfo(), refreshBalance() (calls wallet service)

Hooks (5 files):

- `hooks/useAuth.ts` — wraps authStore + auth service. Exposes requestOtp(), verifyOtp() (auto-navigates to app on success), logout() (clears cart, tokens, navigates to auth), loading/error states
- `hooks/useCart.ts` — wraps cartStore. Exposes items, total (kobo), count, formattedTotal, isEmpty, addItem, removeItem, updateQty, clear, getItemQty(), isInCart()
- `hooks/useWallet.ts` — wraps walletStore + wallet service. Exposes balance, formattedBalance, account info, fetchTransactions(), initTopup(), verifyTopup(), startPolling()/stopPolling() (10s interval for wallet screen)
- `hooks/useOrders.ts` — order management. Exposes fetchOrders(page?, limit?, status?), fetchOrder(id), createOrder(payload), pagination, loading/error states
- `hooks/useProducts.ts` — product fetching per mode. Exposes fetchBundles(), fetchMealPacks(), fetchReadyEat(), fetchSnacks(category?), fetchRestock(category?, q?), all with separate state arrays and loading/error

- [x] Install dependencies (zustand, axios, expo-secure-store)
- [x] Define TypeScript types/interfaces (`types/index.ts`)
- [x] Implement secure storage helpers (`utils/storage.ts`)
- [x] Implement API client with auth interceptors (`services/api.ts`)
- [x] Implement Zustand stores (authStore, cartStore, walletStore)
- [x] Implement service layer (auth, products, orders, wallet, referral, support)
- [x] Build design tokens (`constants/theme.ts`) and formatting utilities (`utils/format.ts`, `utils/constants.ts`)
- [x] Wire up custom hooks (useAuth, useCart, useWallet, useOrders, useProducts)

---

### Phase 3: Authentication Flow — COMPLETE

Built all 4 auth screens and wired up the full auth routing with redirect guards, token refresh on app launch, and secure token management.

**Modified files (4):**

- `app/_layout.tsx` — Root layout now initializes auth state on launch: reads refresh token from SecureStore, calls `/auth/refresh` to get a new access token, fetches `/user/me` to hydrate the user profile. Shows a loading spinner during initialization. Adds `<StatusBar style="light" />` for the dark theme.
- `app/index.tsx` — Now auth-aware: redirects to `/(app)` if authenticated, `/(auth)` if not.
- `app/(auth)/_layout.tsx` — Auth layout redirects to `/(app)` if user is already logged in. Uses `slide_from_right` animation.
- `app/(app)/_layout.tsx` — App layout redirects to `/(auth)` if user is not logged in.

**Implemented screens (4):**

- `app/(auth)/index.tsx` — **Welcome screen**: "baza.ng" branding with logo, tagline ("MEMBERS ONLY · LAGOS"), description, "CREATE ACCOUNT" and "SIGN IN" buttons, terms notice. All styles from `authScreen` in `styles/index.ts`.
- `app/(auth)/signin.tsx` — **Sign In screen**: Back button, "WELCOME BACK" header, phone number input with validation (8+ digits), "SEND CODE" button that calls `requestOtp()` then navigates to OTP screen with phone param. Links to sign up. Shows loading/error states.
- `app/(auth)/signup.tsx` — **Sign Up screen**: Back button, "NEW MEMBER" header, name input, phone input, optional referral code with "APPLY" button (validates 4+ chars, shows "₦1,000 credit will be added" on success). "SEND VERIFICATION CODE" button calls `requestOtp()` then navigates to OTP screen with phone/name/referralCode params.
- `app/(auth)/otp.tsx` — **OTP Verification screen**: Back button, "VERIFICATION" header showing the phone number, 6 individual digit input boxes with auto-advance on fill and auto-backspace on delete. Auto-submits when all 6 digits are filled (calls `verifyOtp()` which logs in and navigates to `/(app)`). 60-second resend cooldown timer. "RESEND CODE" button. Error display.

**Auth flow end-to-end:**

1. App launches → root layout checks SecureStore for refresh token → if found, refreshes and hydrates user → redirects to `/(app)`
2. No token → shows Welcome screen → user chooses Sign In or Create Account
3. User enters phone (and name/referral on signup) → `requestOtp()` sends SMS → navigates to OTP screen
4. User enters 6-digit OTP → auto-submits → `verifyOtp()` calls API → on success, stores user + token in Zustand → `router.replace("/(app)")`
5. On logout: clears cart, deletes refresh token from SecureStore, resets auth store, navigates to `/(auth)`
6. On 401 during API calls: interceptor attempts token refresh → if fails, auto-logout

- [x] Welcome screen with branding and CTA buttons
- [x] Sign In screen (phone number input)
- [x] Sign Up screen (phone + name + optional referral code)
- [x] OTP Verification screen (6-digit input with timer)
- [x] Auth layout with redirect logic (logged in → app, not logged in → auth)
- [x] Token management (access token in memory, refresh token in SecureStore)
- [x] Auto-refresh on 401 responses (implemented in Phase 2 api.ts, wired up here)

---

### Phase 4: Home / Intent Gate — COMPLETE

Built the main home screen (Intent Gate) that users see after authentication. Displays wallet balance, personalized greeting, active order card, 6 shopping mode navigation cards, floating cart button, and a top-up bottom sheet.

**Implemented/Modified files (5):**

- `app/(app)/index.tsx` — **Intent Gate screen**: Full home experience with:
  - Wallet balance header (live from API via `useWallet` hook)
  - Personalized time-of-day greeting ("Good morning/afternoon/evening") with user's first name
  - Active order card: shows most recent PENDING/CONFIRMED/PREPARING/DISPATCHED order with emoji summary, ETA, status badge, and tap-to-view navigation to order detail
  - 6 shopping mode cards rendered from `SHOPPING_MODES` config, each with per-mode accent color, background, emoji, title, subtitle, and arrow chevron. Tapping navigates to the mode screen.
  - Pull-to-refresh: refreshes wallet balance and orders list simultaneously
  - Top-up bottom sheet: displays user's Providus Bank DVA account number, bank name, quick amount selector (₦5K, ₦10K, ₦20K, ₦50K), transfer CTA
  - Floating cart bar at bottom (only visible when cart has items) showing item count, total, and checkout link

- `components/layout/Header.tsx` — **Header component**: Top bar with "WALLET BALANCE" label, formatted balance amount from live API, "TOP UP" button that triggers bottom sheet, "available" sub-label, and user avatar (first initial) that navigates to profile screen.

- `components/cards/ModeCard.tsx` — **ModeCard component**: Reusable card for each shopping mode. Receives a `ModeConfig` object, renders mode-specific background color, border tint, emoji in a tinted container, title (serif font), subtitle (muted accent), and arrow chevron. Tapping navigates to the mode route.

- `components/ui/FloatingCart.tsx` — **FloatingCart component**: Persistent sticky bar positioned at bottom of screen. Shows cart icon, item count ("3 ITEMS"), formatted total, and "CHECKOUT →" text. Only renders when cart is non-empty. Tapping navigates to cart screen.

- `components/layout/ScreenWrapper.tsx` — **ScreenWrapper component**: Reusable safe area wrapper using `react-native-safe-area-context`. Handles status bar padding and optional bottom safe area. Used as base layout for screens.

**Data flow (zero mock data):**

- Wallet balance: fetched from `GET /v1/wallet/balance` via `useWallet` → `walletStore.refreshBalance()` on mount
- Active order: fetched from `GET /v1/orders/?page=1&limit=5` via `useOrders.fetchOrders()` on mount, filtered client-side for active statuses
- User name: read from `authStore.user.name` (hydrated during auth/refresh in root layout)
- Account details (for top-up sheet): `accountNumber`, `bankName`, `accountName` from wallet store

- [x] Intent Gate screen with 6 shopping mode cards
- [x] Mode cards with emoji, title, subtitle, accent color
- [x] Wallet balance display in header (live API data)
- [x] Navigation to each mode screen
- [x] Active order card with status and ETA
- [x] Floating cart button (visible when items in cart)
- [x] Top-up bottom sheet with DVA account details
- [x] Pull-to-refresh on home screen
- [x] ScreenWrapper safe area component

**Six Shopping Modes:**

1. Stock Up (bundles) — amber accent, navigates to `/(app)/modes/stockup`
2. Cook a Meal (meal packs) — red accent, navigates to `/(app)/modes/cookmeal`
3. Ready to Eat (hot food) — red accent, navigates to `/(app)/modes/readyeat`
4. Snacks & Drinks (impulse buys) — purple accent, navigates to `/(app)/modes/snacks`
5. Shop Your List (search) — blue accent, navigates to `/(app)/modes/shoplist`
6. Help Me Decide (AI chat) — green accent, navigates to `/(app)/modes/chat`

---

### Phase 5: Shopping Modes — NOT STARTED

- [ ] **Stock Up** — Bundle list + BundleCard + navigate to BundleDetail
- [ ] **Bundle Detail** — Item list with per-item QtyControl, add-to-cart
- [ ] **Cook a Meal** — Meal pack list + MealPackCard + navigate to MealPackDetail
- [ ] **Meal Pack Detail** — Plate adjustment, ingredient removal, add-to-cart
- [ ] **Ready to Eat** — Grid of ready-eat items with BottomSheet detail popup
- [ ] **Snacks & Drinks** — Grid view with category filter tabs (Snacks, Breads, Drinks)
- [ ] **Shop Your List** — SearchBar + category filter + ProductCard grid
- [ ] **Help Me Decide** — AI chat interface, product recommendation cards

---

### Phase 6: Cart and Checkout — NOT STARTED

- [ ] Cart screen with item list and quantity controls
- [ ] Cart total calculation (kobo)
- [ ] Order note input
- [ ] Wallet balance check before checkout
- [ ] Payment method selection (Wallet / Paystack)
- [ ] Wallet payment flow (instant deduction)
- [ ] Paystack Inline payment flow (WebView popup)
- [ ] Order confirmation feedback
- [ ] FloatingCart button (persistent on shopping screens)

---

### Phase 7: Orders — NOT STARTED

- [ ] Order history list with OrderCard components
- [ ] Status badges (PENDING, CONFIRMED, PREPARING, DISPATCHED, DELIVERED, CANCELLED)
- [ ] Pagination support
- [ ] Order detail screen with full item breakdown
- [ ] ETA display

---

### Phase 8: Profile and Settings — NOT STARTED

- [ ] Profile screen with WalletCard (balance, account number, copy)
- [ ] Navigation to settings screens
- [ ] Notifications screen (toggle preferences)
- [ ] Delivery Address screen (add, edit, delete, set default)
- [ ] Refer a Friend screen (share code, view stats)
- [ ] Support Chat screen (AI chat with message history)
- [ ] Account Settings screen (name, email, phone change, password)

---

### Phase 9: Polish — NOT STARTED

- [ ] Loading states (LoadingSpinner on all data-fetching screens)
- [ ] Empty states (EmptyState component for no data)
- [ ] Error handling (network errors, API errors, retry logic)
- [ ] Animations (fadeUp, slideUp, scaleIn, cartBump per design spec)
- [ ] Pull-to-refresh on list screens
- [ ] Keyboard handling and avoidance
- [ ] Dark theme consistency across all screens
- [ ] Typography with DM Serif Display for headlines
- [ ] Safe area handling (status bar, bottom safe area)

---

## Project Structure

```
baza.ng/
├── tailwind.config.js
├── global.css
├── babel.config.js
├── metro.config.js
├── nativewind-env.d.ts
├── styles/
│   └── index.ts
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── signin.tsx
│   │   ├── signup.tsx
│   │   └── otp.tsx
│   └── (app)/
│       ├── _layout.tsx
│       ├── index.tsx
│       ├── cart.tsx
│       ├── orders.tsx
│       ├── orders/[id].tsx
│       ├── profile.tsx
│       ├── modes/
│       │   ├── _layout.tsx
│       │   ├── stockup.tsx
│       │   ├── cookmeal.tsx
│       │   ├── readyeat.tsx
│       │   ├── snacks.tsx
│       │   ├── shoplist.tsx
│       │   ├── chat.tsx
│       │   ├── stockup/[id].tsx
│       │   └── cookmeal/[id].tsx
│       └── settings/
│           ├── _layout.tsx
│           ├── notifications.tsx
│           ├── address.tsx
│           ├── refer.tsx
│           ├── support.tsx
│           └── account.tsx
├── components/
│   ├── ui/
│   │   ├── QtyControl.tsx
│   │   ├── FloatingCart.tsx
│   │   ├── FundPrompt.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── OTPInput.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   └── SearchBar.tsx
│   ├── cards/
│   │   ├── BundleCard.tsx
│   │   ├── MealPackCard.tsx
│   │   ├── ReadyEatCard.tsx
│   │   ├── ProductCard.tsx
│   │   ├── SnackCard.tsx
│   │   ├── OrderCard.tsx
│   │   └── ModeCard.tsx
│   ├── layout/
│   │   ├── ScreenWrapper.tsx
│   │   └── Header.tsx
│   └── wallet/
│       ├── WalletCard.tsx
│       └── TransactionItem.tsx
├── stores/
│   ├── authStore.ts
│   ├── cartStore.ts
│   └── walletStore.ts
├── services/
│   ├── api.ts
│   ├── auth.ts
│   ├── products.ts
│   ├── orders.ts
│   ├── wallet.ts
│   ├── referral.ts
│   └── support.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useCart.ts
│   ├── useWallet.ts
│   ├── useOrders.ts
│   └── useProducts.ts
├── types/
│   └── index.ts
├── utils/
│   ├── format.ts
│   ├── constants.ts
│   └── storage.ts
├── constants/
│   └── theme.ts
└── development-status.md
```

---

## Next Step

**Phase 5: Shopping Modes** — Build all 6 shopping mode screens. Each mode fetches products from the live API and allows users to add items to cart.

**Recommended order:**
1. Stock Up screen (`app/(app)/modes/stockup.tsx`) — bundle list → BundleCard → navigate to BundleDetail
2. Bundle Detail screen (`app/(app)/modes/stockup/[id].tsx`) — item list with per-item QtyControl, add-to-cart
3. Cook a Meal screen (`app/(app)/modes/cookmeal.tsx`) — meal pack list → MealPackCard → navigate to MealPackDetail
4. Meal Pack Detail (`app/(app)/modes/cookmeal/[id].tsx`) — plate adjustment, ingredient toggle, add-to-cart
5. Ready to Eat screen (`app/(app)/modes/readyeat.tsx`) — grid with popup detail modal
6. Snacks & Drinks screen (`app/(app)/modes/snacks.tsx`) — grid with category filter tabs
7. Shop Your List screen (`app/(app)/modes/shoplist.tsx`) — search + category filter + product grid
8. Help Me Decide screen (`app/(app)/modes/chat.tsx`) — AI chat interface

---

## Notes

- No admin features are included — all admin functionality is handled by the Django backend.
- All prices are in kobo (1 NGN = 100 kobo). Never use floats for money.
- Products are fetched from the live API — no dummy/mock data needed.
- The JSX prototype in `baza-ng-v3.jsx` serves as the reference for all UI/UX patterns.
- All component styles live in `styles/index.ts` — import the relevant export and use NativeWind `className` props.
