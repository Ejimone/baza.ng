# Baza.ng Mobile App — Development Status

> Last updated: 2026-02-25

---

## Backend API Status

| Test Suite | Result | Notes |
|---|---|---|
| `test_runner.py` | PASS (19/20 endpoints) | All endpoints working. Order create returned 400 (INSUFFICIENT_BALANCE) — expected with low wallet balance. |
| `test_paystack.py` | PASS (6/6 tests) | Paystack config, wallet balance, topup init, verify flows all working. |
| `UserFlow.py` | NOT RUN | Requires interactive OTP input. Verified manually via test_runner.py which covers the same endpoints. |

**API Base URL:** `https://baza-chi.vercel.app/v1`

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
- `app/(auth)/` — _layout, index (welcome), signin, signup, otp
- `app/(app)/` — _layout, index (intent gate), cart, orders, orders/[id], profile
- `app/(app)/modes/` — _layout, stockup, cookmeal, readyeat, snacks, shoplist, chat
- `app/(app)/modes/stockup/[id]` — bundle detail
- `app/(app)/modes/cookmeal/[id]` — meal pack detail
- `app/(app)/settings/` — _layout, notifications, address, refer, support, account

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

### Phase 2: Core Infrastructure — NOT STARTED

- [ ] Install dependencies (zustand, axios, expo-secure-store)
- [ ] Implement API client with auth interceptors (`services/api.ts`)
- [ ] Implement Zustand stores (authStore, cartStore, walletStore)
- [ ] Define TypeScript types/interfaces (`types/index.ts`)
- [ ] Build design system tokens (`constants/theme.ts`)
- [ ] Implement storage utilities (`utils/storage.ts`)
- [ ] Implement currency formatting (`utils/format.ts`)

---

### Phase 3: Authentication Flow — NOT STARTED

- [ ] Welcome screen with branding and CTA buttons
- [ ] Sign In screen (phone number input)
- [ ] Sign Up screen (phone + name + optional referral code)
- [ ] OTP Verification screen (6-digit input with timer)
- [ ] Auth layout with redirect logic (logged in -> app, not logged in -> auth)
- [ ] Token management (access token in memory, refresh token in SecureStore)
- [ ] Auto-refresh on 401 responses

---

### Phase 4: Home / Intent Gate — NOT STARTED

- [ ] Intent Gate screen with 6 shopping mode cards
- [ ] Mode cards with emoji, title, subtitle, accent color
- [ ] Wallet balance display in header
- [ ] Navigation to each mode screen

**Six Shopping Modes:**
1. Stock Up (bundles) — green accent
2. Cook a Meal (meal packs) — amber accent
3. Ready to Eat (hot food) — red accent
4. Snacks & Drinks (impulse buys) — purple accent
5. Shop Your List (search) — blue accent
6. Help Me Decide (AI chat) — teal accent

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

## Notes

- No admin features are included — all admin functionality is handled by the Django backend.
- All prices are in kobo (1 NGN = 100 kobo). Never use floats for money.
- Products are fetched from the live API — no dummy/mock data needed.
- The JSX prototype in `baza-ng-v3.jsx` serves as the reference for all UI/UX patterns.
