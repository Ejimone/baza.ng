# CLAUDE.md — Baza.ng Project Context

### Read this file before touching any code in this project.

This file tells you everything about the Baza.ng codebase. Claude Code reads this automatically. If you're another AI tool, read this before writing a single line.

---

## What Is Baza.ng?

Baza.ng is a **members-only Nigerian grocery and food delivery app**. The name comes from "baza" (Hausa: to spread out, distribute). Only paying members can shop. Members get:

- A dedicated virtual bank account (Providus Bank via Paystack)
- Member prices (lower than retail)
- Free delivery
- Access to local kitchens (Ready to Eat)

The app is currently a React (web) prototype being converted to a React Native (Expo) mobile app with a Node.js + PostgreSQL backend.

---

## Repository Structure

```
baza-ng/
├── backend/           — Python Django
├── mobile/            — React Native + Expo mobile app
└── devkit/            — This folder. Architecture docs, schema, API contract.
    ├── CLAUDE.md          — You are here
    ├── README.md          — Sprint plan and architecture decisions
    ├── API_CONTRACT.md    — All endpoints, request/response shapes
    ├── schema.prisma      — Database schema (source of truth)
    ├── STYLE_GUIDE.md     — All design tokens and component patterns
    ├── seed.ts            — Product data seed file
    └── .env.example       — All required environment variables
```

---

## The Six Shopping Modes

The core UX concept. Every user session starts at the Intent Gate where they pick a mode:

| Mode            | Key        | Color          | Description                                                                                |
| --------------- | ---------- | -------------- | ------------------------------------------------------------------------------------------ |
| Stock Up        | `stockup`  | #f5a623 amber  | Pre-built bundles (Breakfast Bundle, Protein Pack, etc.) with per-item customization       |
| Cook a Meal     | `tonight`  | per pack       | Meal kits with ingredients that scale by plates. Users can remove items they already have. |
| Ready to Eat    | `readyeat` | #e85c3a red    | Hot food from local Lagos kitchens. Tap emoji to popup, adjust plates, add to cart.        |
| Snacks & Drinks | `quickies` | #c77dff purple | Impulse buys grid. Category filter: Snacks / Breads / Drinks. ADD→stepper.                 |
| Shop Your List  | `restock`  | #6ec6ff blue   | Search + category filter. 42 items across 8 categories. Full text search.                  |
| Help Me Decide  | `chat`     | #4caf7d green  | AI chat assistant (Claude API). Guides user to products.                                   |

---

## Tech Stack

### Backend (in `/backend`)

- **Runtime:** Python
- **Framework:** Django
- **Validation:**
- **ORM:** Prisma 5 + PostgreSQL 15
- **Cache/OTP:** Redis 7 (via ioredis)
- **Auth:** JWT access tokens (15 min) + refresh tokens (30 days, HttpOnly cookie)
- **SMS:** Termii API (Nigerian SMS, better delivery than Twilio)
- **Payments:** Paystack Dedicated Virtual Accounts + webhooks
- **AI:** Anthropic Claude API (claude-sonnet-4-6) — support chat only

### Mobile (in `/mobile`)

- **Framework:** Expo SDK 51 (managed workflow)
- **Navigation:** Expo Router (file-based, like Next.js)
- **State:** Zustand (3 stores: authStore, cartStore, walletStore)
- **Styling:** NativeWind v4 (Tailwind in React Native)
- **Animations:** React Native Reanimated v3
- **Secure storage:** Expo SecureStore (refresh tokens ONLY — never AsyncStorage)
- **HTTP client:** Axios with interceptors for token refresh

---

## Database Conventions

- All money values stored in **kobo** (₦1 = 100 kobo). Never floats. Never naira.
- All IDs: Prisma `@id @default(cuid())`
- Product IDs (bundles, meal packs, etc.) match the prototype exactly: `b1`, `b2`, `m1`, `m2`, `re1`, `q1`, `r1`, etc.
- Timestamps: `createdAt` and `updatedAt` on every model
- Soft deletes: use `isActive: Boolean @default(true)` on product tables, never hard delete
- All wallet operations MUST use `prisma.$transaction([...])` — never two separate queries

---

## Auth Flow

1. User enters phone number
2. Backend calls Termii API, sends 6-digit OTP
3. OTP stored in Redis with 5-minute TTL: `otp:{phone}` = `{code, attempts}`
4. User submits OTP → backend verifies from Redis → deletes key on success
5. If new user: create User record, call Paystack DVA API, store account number
6. If referral code present: validate and store `user.referredBy`
7. Return access token (JWT, 15 min) + set refresh token cookie (HttpOnly, 30 days)
8. Mobile stores access token in Zustand memory only. Refresh token lives in SecureStore.

---

## Payment Flow

### Wallet Top-Up via Bank Transfer (Primary)

1. User sees their Providus Bank account number in the wallet screen
2. User transfers from any Nigerian bank app
3. Paystack fires `dedicated_account.credit` webhook to `POST /webhooks/paystack`
4. Backend verifies HMAC-SHA512 signature, finds user, creates WalletTransaction, increments balance
5. Mobile polls `GET /wallet/balance` every 10 seconds while wallet screen is open (or use WebSocket if time allows)

### Wallet Top-Up via Card (Secondary)

1. User taps "Top Up by Card", enters amount
2. Backend calls Paystack Initialize Transaction API
3. Returns Paystack checkout URL
4. Mobile opens URL in WebView
5. After payment, Paystack redirects to `bazang://wallet/topup-success?reference=xxx`
6. Mobile deep link triggers `GET /wallet/verify-topup?reference=xxx`
7. Backend verifies, credits wallet

### Checkout

1. Cart total calculated on mobile
2. POST /orders with items array
3. Backend verifies balance in a DB transaction, deducts, creates order
4. Returns new wallet balance + order confirmation

---

## Referral System

- Every user gets a unique referral code on signup (stored as `user.referralCode`)
- Referrer earns ₦2,000 (200000 kobo) when referred friend places FIRST order
- Referred friend gets ₦1,000 (100000 kobo) credit after first order
- Applied automatically in POST /orders handler (check if first order, if referredBy set)
- On signup with referral code: validate code exists, store `user.referredBy = code`

---

## Support Chat Logic

The support chat uses the Claude API with a specific system prompt. The AI:

1. Handles standard queries (order status, delivery, wallet)
2. Auto-flags messages containing: "wrong", "missing", "damage", "urgent", "refund", "cancel", "human", "agent", "rubbish", "useless", "angry"
3. When flagged: sends Slack webhook to ops team, sets `SupportMessage.flagged = true`
4. Human agent can join thread — stored as messages with `sender: "HUMAN_AGENT"`
5. On human join: AI should still assist but defer to human agent's instructions

---

## Key Business Rules

1. **Members only.** Every API route except `/auth/*` and `/webhooks/*` requires valid JWT.
2. **Kobo everywhere.** All prices in kobo at DB and API level. Mobile converts for display.
3. **Atomic wallet operations.** Use Prisma transactions. No exceptions.
4. **OTP rate limiting.** Max 3 OTP requests per phone per 10 minutes. Track in Redis.
5. **Webhook signature verification.** Never process Paystack webhooks without verifying the HMAC-SHA512 signature.
6. **Referral credits are one-time.** A user can only earn referral credit for each referred friend once (first order only).
7. **Product soft deletes only.** Never hard delete products — orders reference them historically.
8. **Prices are snapshot at order time.** Copy name, emoji, price into OrderItem at checkout. Don't rely on product table for historical order display.

---

## API Conventions

- Base path: `/v1`
- Auth: `Authorization: Bearer {accessToken}` header
- All responses: `Content-Type: application/json`
- Success responses include the relevant resource or a `message` field
- Error responses: `{ "error": "Human readable message", "code": "SNAKE_CASE_CODE" }`
- Prices in all responses: in kobo
- Dates: ISO 8601 strings

---

## Mobile Conventions

### Zustand Stores

**authStore:**

```typescript
{
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  login: (user, token) => void
  logout: () => void  // clears token, clears cart, navigates to /auth
  updateUser: (partial) => void
}
```

**cartStore:**

```typescript
{
  items: CartItem[]
  addItem: (item) => void
  removeItem: (id) => void
  updateQty: (id, qty) => void
  clear: () => void
  total: () => number  // computed, in kobo
  count: () => number  // total item count
}
```

**walletStore:**

```typescript
{
  balance: number  // in kobo
  setBalance: (n) => void
  refreshBalance: () => Promise<void>
}
```

### Navigation (Expo Router)

```
app/
  (auth)/
    _layout.tsx    — redirect to (app) if already logged in
    index.tsx      — Welcome screen
    signin.tsx     — Sign In
    signup.tsx     — Sign Up
    otp.tsx        — OTP verification
  (app)/
    _layout.tsx    — redirect to (auth) if not logged in
    index.tsx      — Intent Gate (home)
    cart.tsx       — Cart screen
    orders.tsx     — Order history
    orders/[id].tsx — Order detail
    profile.tsx    — Profile
    modes/
      stockup.tsx
      cookmeal.tsx
      readyeat.tsx
      snacks.tsx
      shoplist.tsx
      chat.tsx
    settings/
      notifications.tsx
      address.tsx
      refer.tsx
      support.tsx
      account.tsx
```

### Axios Instance

```typescript
// lib/api.ts
const api = axios.create({ baseURL: process.env.EXPO_PUBLIC_API_URL });

// Request interceptor: attach access token from authStore
// Response interceptor: on 401, try refresh token, retry original request
// On refresh failure: logout user, navigate to auth
```

---

## Prototype Reference

The UI prototype is at `/mobile/prototype/baza-ng-v3.jsx`. This is a working React (web) prototype of all screens. It is your design spec. Use it to understand:

- Exact component structure
- Color values (see inline styles)
- Interaction patterns (ADD→stepper, plate adjuster, ingredient toggle)
- Data shapes (see the DATA section at the top of the file)

When implementing a screen in React Native, open the corresponding section of the prototype and mirror the logic exactly. The only changes are: primitives (div→View, etc.) and styling (inline objects → StyleSheet / NativeWind classes).

---

## What Not to Do

- Do NOT use MongoDB. Decision is made. PostgreSQL.
- Do NOT use AsyncStorage for tokens. Use Expo SecureStore.
- Do NOT hardcode product data in the mobile app. Fetch from API.
- Do NOT use floats for money anywhere in the codebase.
- Do NOT use `any` TypeScript type. Use Zod-inferred types on backend, shared types on mobile.
- Do NOT skip Paystack webhook signature verification.
- Do NOT redesign screens. The prototype is final. Ship it.
- Do NOT use rounded corners on cards/buttons (only bottom sheet modals get borderRadius).
- Do NOT use any font other than DM Serif Display and monospace/SpaceMono.
- Do NOT store the access token in SecureStore — memory only. Store ONLY the refresh token in SecureStore.

---

## Environment Variables Required

See `.env.example` for the full list. The most critical:

- `DATABASE_URL` — PostgreSQL connection string (Railway provides this)
- `REDIS_URL` — Redis connection string (Railway provides this)
- `JWT_ACCESS_SECRET` — random 64-char string
- `JWT_REFRESH_SECRET` — different random 64-char string
- `PAYSTACK_SECRET_KEY` — from Paystack dashboard
- `TERMII_API_KEY` — from Termii dashboard
- `ANTHROPIC_API_KEY` — from console.anthropic.com
- `PAYSTACK_WEBHOOK_SECRET` — from Paystack dashboard (for HMAC verification)

---

## Useful Commands

```bash
# Backend
npm run dev           — start with ts-node-dev (hot reload)
npx prisma studio     — open Prisma visual DB browser
npx prisma migrate dev --name [name]  — create and run migration
npx ts-node prisma/seed.ts            — seed product data
npm run build         — compile TypeScript
npm start             — run compiled build

# Mobile
npx expo start        — start Expo dev server
npx expo start --ios  — open in iOS simulator
npx expo start --android — open in Android emulator
eas build --profile preview --platform android  — build APK
eas build --profile preview --platform ios      — build IPA (needs Apple account)
```
