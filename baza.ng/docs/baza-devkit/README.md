# Baza.ng — Development Master Guide

### 3-Day Sprint · Full Stack · Decision Log Included

---

## What We're Building

Baza.ng is a members-only Nigerian grocery and food delivery app. Users join, get a dedicated virtual bank account (Providus Bank), fund their wallet by transfer, and shop across six intent-based modes: Stock Up, Cook a Meal, Ready to Eat, Snacks & Drinks, Shop Your List, and Help Me Decide.

The prototype (baza-ng-v3.jsx) is your single source of truth for UI, UX patterns, data shapes, and interaction logic. Every screen is built and functional. Your job is to connect it to a real backend and convert the web prototype to React Native.

---

## Architecture Decisions (with Reasoning)

Every decision below was made. Do not re-debate these in the sprint. Debate costs hours you don't have.

---

### 1. PostgreSQL, not MongoDB

**Decision: PostgreSQL via Prisma**

MongoDB is fine for document-heavy apps with no financial transactions. Baza.ng has:

- Wallet debits/credits that must be atomic — if the server crashes mid-deduction, the money must either deduct or not. MongoDB multi-document transactions exist but they're opt-in bolted-on complexity. PostgreSQL is ACID by default.
- A referral system where credits are conditional (friend places first order). This is a multi-table constraint. In Mongo you'd write your own rollback logic. In Postgres it's a transaction in 3 lines.
- Orders that reference users, products, wallet transactions — three-way joins that are trivial in SQL and require multiple aggregation pipeline stages in Mongo.
- A clear, predictable schema. The app has 12 defined data types, none of them semi-structured. A schema is a feature here, not a constraint.

Prisma gives us auto-generated TypeScript types (no more `any` on DB results), a readable schema file that doubles as documentation, and one-command migrations.

---

### 2. Python Django + Express, not NestJS / Django / Laravel

**Decision: Python Django + Express + Zod**

NestJS is excellent but adds 2–3 hours of boilerplate setup on day one and forces a specific mental model. Django and Laravel are great frameworks but your frontend team is in TypeScript — shared types between frontend and backend are a significant velocity gain in a 3-day sprint.

Express because:

- Every Node.js developer knows it. Zero onboarding cost.
- Minimal, compositional. You control exactly what goes in.
- Zod handles validation and gives you inferred TypeScript types from your schemas for free.

If this were a 3-month project, NestJS would win. In 3 days, Express wins.

---

### 3. Termii, not Twilio (for SMS OTP)

**Decision: Termii**

Termii is purpose-built for West African SMS. Built-in support for MTN, Glo, Airtel, 9mobile routing. Twilio routes through international aggregators that introduce Nigerian network delivery failures — especially for non-MTN numbers. Termii's delivery rate in Nigeria is 30–40% higher on Airtel and Glo. They also have a sandbox mode with a fixed OTP (so your team doesn't burn credits during development). Pricing is cheaper per SMS.

Termii docs: https://developers.termii.com

---

### 4. Paystack Dedicated Virtual Accounts, not card-first

**Decision: Paystack DVA as primary wallet funding**

Nigerian users trust bank transfer more than card-on-file. The UX is familiar: user sees "Transfer ₦X to account 2038471659, Providus Bank." The money arrives in seconds. Paystack fires a webhook. Balance updates instantly.

Card payments via Paystack standard checkout are implemented as a fallback (for users who prefer it), but DVA is the primary flow because:

- No card storage liability
- Familiar Nigerian mental model (bank transfer = trusted)
- The webhook pattern is simple and reliable

DVA docs: https://paystack.com/docs/payments/dedicated-virtual-accounts

---

### 5. Redis for OTP storage, not PostgreSQL

**Decision: Redis with 5-minute TTL**

OTPs should expire. Storing them in Postgres means either a cron job to clean them up or a timestamp comparison on every auth check. Redis has native TTL — set a key, set an expiry, Redis handles the rest. The OTP is gone in 5 minutes automatically.

Redis also handles the refresh token blacklist (when a user logs out, the refresh token is blacklisted in Redis until its natural expiry — no DB write needed).

---

### 6. JWT with HttpOnly cookies + Refresh tokens, not session-based auth

**Decision: JWT access tokens (15 min) + refresh tokens (30 days) in HttpOnly cookies**

Why not sessions? Sessions require shared storage across multiple server instances. If you scale to two servers, sessions need Redis or a sticky load balancer. JWT is stateless.

Why HttpOnly cookies for mobile? Expo's WebView and React Native's fetch both handle cookies correctly. `httpOnly` means JavaScript can't read the token — XSS can't steal it. The refresh token lives in a secure cookie. The access token can be stored in memory (Zustand) on the mobile side for fast access.

The access token is short-lived (15 min) so if it leaks, damage is limited. The refresh token is rotated on every use.

---

### 7. Cloudinary for images, not S3

**Decision: Cloudinary**

Three-day sprint. S3 requires IAM roles, bucket policies, CORS configuration, a CDN setup (CloudFront), and pre-signed URL generation. That's a half-day of work. Cloudinary requires an account and one environment variable. Upload endpoint is a POST to their API. CDN is built in. Auto-optimization (WebP serving, size variants) is built in. Free tier covers the product images we need.

If you scale to 10,000+ products, move to S3. Not now.

---

### 8. Anthropic Claude API for support chat, not custom NLP

**Decision: Claude API (claude-sonnet-4-6) directly**

The support chat feature is already designed: AI handles first, flags to human if needed. Building custom intent detection is a week of work minimum. The Claude API handles all of this natively — context-aware, empathetic responses, no training required. The flagging logic is prompt-engineered (see support chat section in API contract). Cost per support conversation is negligible.

---

### 9. Railway for hosting, not Heroku / AWS / DigitalOcean

**Decision: Railway**

Heroku's free tier is gone. AWS is powerful and complex — at least a day of setup for a team that doesn't already know it. DigitalOcean is fine but requires more manual config. Railway gives you:

- PostgreSQL + Redis + Node.js in one platform
- Deploy from GitHub push (zero config)
- Environment variables UI
- Logs built in
- ~$15/month for the stack we're building

You can be deployed in 20 minutes on day 3. That's the decision.

Railway: https://railway.app

---

### 10. Expo Managed Workflow + Expo Router, not bare React Native

**Decision: Expo SDK 51+ managed workflow**

Bare React Native means touching Xcode and Android Studio configuration. That's a minimum 2-hour setup tax per developer. In 3 days, that's fatal. Expo Managed Workflow means:

- `npx create-expo-app` → running on simulator in 5 minutes
- No Podfile, no Gradle files, no native module linking
- OTA updates via Expo Updates (push fixes without App Store review)
- Expo Router for file-based navigation (same mental model as Next.js)
- EAS Build for production APK/IPA on day 3

If you need a native module that Expo doesn't support, use Expo Development Build. You won't need to.

---

## Full Tech Stack

| Layer        | Technology                               | Why                                       |
| ------------ | ---------------------------------------- | ----------------------------------------- |
| Mobile       | React Native + Expo SDK 51               | Fast setup, no native config              |
| Navigation   | Expo Router                              | File-based, matches screen structure      |
| State        | Zustand                                  | Already in prototype, minimal boilerplate |
| Styling      | NativeWind v4                            | Tailwind classes in React Native          |
| Animations   | React Native Reanimated v3               | Smooth, native thread                     |
| Backend      | Python Django + Express                  | Familiar, typed, fast                     |
| Validation   | Zod                                      | Runtime validation + TS types             |
| ORM          | Prisma                                   | Auto types, readable schema, migrations   |
| Database     | PostgreSQL 15                            | ACID, relational, financial-safe          |
| Cache / OTP  | Redis 7                                  | TTL for OTP, token blacklist              |
| Auth         | JWT + HttpOnly cookies                   | Stateless, secure                         |
| SMS OTP      | Termii                                   | Best Nigerian delivery rates              |
| Payments     | Paystack DVA                             | Bank transfer wallet funding              |
| Images       | Cloudinary                               | Simplest CDN setup                        |
| AI Support   | Anthropic Claude API (claude-sonnet-4-6) | Already proven in prototype               |
| Hosting      | Railway                                  | PostgreSQL + Redis + Node in one          |
| Mobile Build | Expo EAS                                 | APK/IPA without Xcode/Android Studio      |

---

## Team Split (3 days, 2 developers)

**Dev A — Backend (Node.js)**
Owns: API, database, auth, Paystack, Termii, Claude API integration, Railway deploy

**Dev B — Mobile (React Native / Expo)**
Owns: All screens, navigation, Zustand store, API integration, EAS build

Both devs sync at end of each day (30 min standup). Backend Dev A should expose mock endpoints by end of Day 1 so Dev B can start integration on Day 2 morning.

---

## 3-Day Sprint Plan

### DAY 1 — Foundation (Backend focus)

**Dev A targets:**

| Time       | Task                                                                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–1:00  | Init Python Django project. Install: express, prisma, @prisma/client, zod, jsonwebtoken, bcrypt, cookie-parser, cors, dotenv, redis, ioredis, axios |
| 1:00–2:00  | Run `prisma init`, write schema.prisma (see schema file in this kit), run first migration                                                           |
| 2:00–3:00  | Seed database with all product data from prototype (bundles, meal packs, ready eat, snacks, restock items)                                          |
| 3:00–5:00  | Auth endpoints: POST /auth/otp-request, POST /auth/otp-verify (Termii integration, Redis OTP storage)                                               |
| 5:00–6:00  | JWT service: generateAccessToken, generateRefreshToken, verifyToken, refreshAccessToken                                                             |
| 6:00–7:00  | Paystack DVA: on user signup, call Paystack API to create dedicated virtual account, store accountNumber on user                                    |
| 7:00–8:00  | User endpoints: GET /user/me, PUT /user/profile, PUT /user/address                                                                                  |
| 8:00–9:00  | Write mock responses for all Day 2 endpoints so Dev B can start integration                                                                         |
| 9:00–10:00 | Test auth flow end to end with Postman/Insomnia                                                                                                     |

**Dev B targets:**

| Time       | Task                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–1:00  | `npx create-expo-app baza-ng --template` + install NativeWind, Zustand, Reanimated, Expo Router                                    |
| 1:00–2:00  | Set up NativeWind, create colors.ts and typography.ts from style guide                                                             |
| 2:00–4:00  | Auth screens: Welcome, Sign Up (with referral code field), Sign In, OTP input                                                      |
| 4:00–6:00  | Wire auth screens to Dev A's auth endpoints (or mocks)                                                                             |
| 6:00–8:00  | Zustand store: authStore (user, token, logout), cartStore (items, total, addItem, removeItem, clear), walletStore (balance, topup) |
| 8:00–10:00 | Intent Gate (home screen): 6 mode cards, orders card, wallet balance, floating cart                                                |

---

### DAY 2 — Products + Orders

**Dev A targets:**

| Time       | Task                                                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–2:00  | Products APIs: GET /products/bundles, GET /products/mealpacks, GET /products/readyeat, GET /products/snacks, GET /products/restock (with ?category= filter) |
| 2:00–4:00  | Orders: POST /orders (create), GET /orders (list for user), GET /orders/:id                                                                                 |
| 4:00–6:00  | Wallet: GET /wallet/balance, GET /wallet/transactions, POST /wallet/topup (card via Paystack standard)                                                      |
| 6:00–8:00  | Paystack webhook handler: POST /webhooks/paystack — verify HMAC signature, handle dedicated_account.credit → update wallet balance, handle charge.success   |
| 8:00–9:00  | Referral: POST /referral/apply (on signup), GET /referral/stats                                                                                             |
| 9:00–10:00 | Address CRUD: POST /user/addresses, PUT /user/addresses/:id, DELETE /user/addresses/:id, PATCH /user/addresses/:id/default                                  |

**Dev B targets:**

| Time       | Task                                                                           |
| ---------- | ------------------------------------------------------------------------------ |
| 0:00–2:00  | Stock Up screen: bundle cards → bundle detail with per-item qty controls       |
| 2:00–4:00  | Cook a Meal screen: meal pack cards → detail with ingredient toggle/multiplier |
| 4:00–6:00  | Ready to Eat: list + popup modal with plates adjuster                          |
| 6:00–7:00  | Snacks & Drinks: 2-col grid with category filter                               |
| 7:00–9:00  | Shop Your List: search + category filter bar + ADD→stepper                     |
| 9:00–10:00 | Cart screen: items list, order note, wallet balance check, confirm button      |

---

### DAY 3 — Features + Polish + Deploy

**Dev A targets:**

| Time       | Task                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–2:00  | Support chat: POST /support/message (calls Claude API, stores to DB), GET /support/thread, POST /support/flag (mark for human review) |
| 2:00–3:00  | Account settings: PUT /user/password, PUT /user/email (sends verification), PUT /user/phone (sends OTP)                               |
| 3:00–4:00  | Notifications preferences: GET /user/notifications, PUT /user/notifications                                                           |
| 4:00–5:00  | Railway: create project, add PostgreSQL plugin, add Redis plugin, set all env vars, deploy from GitHub                                |
| 5:00–7:00  | Integration test all endpoints with real mobile client                                                                                |
| 7:00–10:00 | Bug fixes from integration testing                                                                                                    |

**Dev B targets:**

| Time       | Task                                                                              |
| ---------- | --------------------------------------------------------------------------------- |
| 0:00–2:00  | Checkout flow: wallet balance check → fund prompt → confirm order → success state |
| 2:00–4:00  | Profile screen: wallet card, orders link, all settings rows                       |
| 4:00–5:00  | Orders screen: list + status badges + order note display                          |
| 5:00–6:00  | Support chat screen (wire to backend)                                             |
| 6:00–7:00  | Notifications, Address, Refer screens                                             |
| 7:00–8:00  | EAS Build: run `eas build --profile preview --platform android` for APK           |
| 8:00–10:00 | Testing on real device + bug fixes                                                |

---

## MVP Cut Line

If you're behind on Day 3, cut these (implement post-launch):

| Feature                           | Priority     |
| --------------------------------- | ------------ |
| Support AI chat                   | Nice to have |
| Referral system                   | Nice to have |
| Account settings (password/email) | Nice to have |
| Push notifications                | Nice to have |
| Help Me Decide (Chat mode)        | Nice to have |

**Must work for launch:**

- Auth (OTP → signup → login)
- All 5 shopping modes (cut Chat mode)
- Add to cart + cart management
- Wallet balance display
- Checkout (wallet deduction)
- Order confirmation + history
- Profile with wallet

---

## Environment Variables

See `.env.example` in this kit. The backend needs 16 environment variables. Set them all in Railway's Variables UI before deploy.

---

## Repository Structure

```
baza-ng/
├── backend/
│   ├── src/
│   │   ├── routes/         # Express route handlers
│   │   ├── services/       # Business logic (wallet, auth, orders)
│   │   ├── middleware/      # Auth, error handling, rate limiting
│   │   ├── lib/            # Paystack, Termii, Claude, Redis clients
│   │   └── index.ts        # Express app entry
│   ├── prisma/
│   │   ├── schema.prisma   # Source of truth for DB schema
│   │   └── seed.ts         # Seed all product data
│   └── package.json
│
└── mobile/
    ├── app/
    │   ├── (auth)/         # auth group: welcome, signin, signup, otp
    │   ├── (app)/          # main group: intent, cart, profile, orders...
    │   └── _layout.tsx
    ├── components/
    │   ├── modes/          # StockUp, CookMeal, ReadyEat, etc.
    │   ├── ui/             # QtyControl, FloatingCart, etc.
    │   └── shared/         # Button, Input, Card
    ├── store/
    │   ├── authStore.ts
    │   ├── cartStore.ts
    │   └── walletStore.ts
    ├── lib/
    │   └── api.ts          # Axios instance + all API calls
    └── package.json
```

---

## Critical Rules

1. **Never store auth tokens in AsyncStorage.** Use Expo SecureStore for refresh tokens.
2. **Always verify Paystack webhook signatures.** Unverified webhooks are a security hole.
3. **All wallet deductions must be database transactions.** `prisma.$transaction([...])` — never two separate queries.
4. **OTPs expire in 5 minutes.** Set Redis TTL to 300 seconds. No exceptions.
5. **Rate limit OTP requests.** Max 3 OTP requests per phone number per 10 minutes (Redis counter).
6. **The prototype is the design spec.** Do not redesign screens. Ship first, iterate after.
