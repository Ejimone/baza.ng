# Updates

## Completed

- Implemented navigation performance hardening to remove transition-window JS blocking and improve perceived responsiveness: deferred app/home/wallet/profile non-critical mount work with `InteractionManager.runAfterInteractions`, memoized nav surfaces (`BottomNav`, `Header`, route visibility checks), added development perf instrumentation (`utils/perfLogger.ts`) for `tap -> transition start` and `tap -> first shell paint`, introduced progressive home placeholders during deferred catalog hydration, optimized hook data flow (`useCart` lookup memoization + single-pass totals, `useProducts` consolidated state updates, `useOrders` consolidated list/pagination updates, interaction-aware wallet polling), and documented the rollout (`docs/navigation-performance-hardening.md`) (`app/(app)/_layout.tsx`, `components/layout/BottomNav.tsx`, `components/layout/Header.tsx`, `app/(app)/index.tsx`, `app/(app)/wallet.tsx`, `app/(app)/profile.tsx`, `hooks/useCart.ts`, `hooks/useProducts.ts`, `hooks/useOrders.ts`, `hooks/useWallet.ts`, `utils/perfLogger.ts`).

- Extended Nigerian-friendly phone input UX beyond auth to the referral share screen: referral phone input now live-formats as local NG style (`0901 234 5678`), validates against Nigerian mobile format before enabling send, and still normalizes internally to `+234...` (`app/(app)/settings/refer.tsx`, `utils/format.ts`).

- Improved auth phone UX for Nigerian users by adding live local-number formatting in sign-in/sign-up inputs (`0901 234 5678` style) while still normalizing to backend-safe E.164 (`+234...`) before API calls. Input now gracefully accepts local (`0901...`), short (`901...`), and international (`+234...`/`234...`) entry styles (`utils/format.ts`, `app/(auth)/signin.tsx`, `app/(auth)/signup.tsx`).

- Reverted frontend phone auth from Firebase back to backend Termii OTP flow. Replaced Firebase verification logic in `services/auth.ts` with `POST /v1/auth/otp-request` and `POST /v1/auth/otp-verify` payloads (`intent` + `channel`), updated `hooks/useAuth.ts` to backend error-code mapping, and updated auth screens (`app/(auth)/signin.tsx`, `app/(auth)/signup.tsx`, `app/(auth)/otp.tsx`) to pass login/signup intent and resend with consistent channel. Removed Firebase auth artifacts (`services/firebaseAuth.ts`, `plugins/withFirebaseFix.js`, Firebase deps/plugins in `package.json` and `app.json`). Updated auth docs in `docs/termii-phone-auth.md`.

- Updated Firebase Phone Auth integration documentation with the exact frontend↔backend handshake contract and route expectations (`POST /v1/auth/firebase-verify`), plus targeted troubleshooting for `This app is not authorized for Firebase Authentication` and backend `404` mismatches (`docs/firebase-phone-auth.md`).

- Implemented Firebase Phone Authentication for the frontend auth flow: replaced Termii/backend-based OTP sending with `@react-native-firebase/auth` `signInWithPhoneNumber`. Firebase now sends SMS directly; OTP verification is handled client-side via Firebase, then a Firebase ID token is sent to the backend (`POST /auth/firebase-verify`) for server-side verification and JWT issuance. Added `services/firebaseAuth.ts` (Firebase wrapper), updated `services/auth.ts` (Firebase integration), updated `hooks/useAuth.ts` (Firebase error mapping), updated `app/(auth)/otp.tsx` (resend flow), and configured `app.json` with Firebase plugins (`@react-native-firebase/app`, `@react-native-firebase/auth`, `expo-build-properties`), Google services files, and iOS static frameworks. Added implementation doc: `docs/firebase-phone-auth.md`.

- Improved Help Me Decide response quality and tool usability: assistant text now strips markdown/link raw artifacts and product-list replies are normalized to concise copy while cards render details below; added in-chat tool shortcut chips for full tool flow coverage (including `checkout_cart`) and persisted tool-call metadata on messages (`app/(app)/modes/chat.tsx`).

- Fixed AI chat product-list cards so each item reliably shows image + details in-card by enriching AI item payloads with live catalog data (lookup by id/name across bundles, meal packs, ready-to-eat, snacks, and restock) and adding a visible image fallback when an item image URL is missing (`app/(app)/modes/chat.tsx`).

- Redesigned AI quick-suggestion section in Help Me Decide to responsive square sliding cards (instead of tall rectangles), reusing Home mode images/titles/subtitles and preserving tap-to-send behavior (`app/(app)/modes/chat.tsx`).

- Added `Clear Chat` functionality in Help Me Decide: resets UI state and starts a fresh backend AI session for real-time continuation from a clean thread. Also updated AI product listings to a horizontal sliding card carousel (snacks-style card presentation), and sanitized chat display text to remove special characters from AI-generated content/options (`app/(app)/modes/chat.tsx`).

- Polished Help Me Decide product cards to be fully tappable and navigate to related destination screens/details using AI tool context (bundles, meal packs, ready-to-eat, snacks, and shop-list fallback) in `app/(app)/modes/chat.tsx`.

- Upgraded `Help me decide` chat UX: AI `product_list` messages now render as product cards (not plain lists), MCQ responses now render as poll/vote-style selectable options, confirmation actions now use plain text labels, and chat visuals were restyled toward a WhatsApp-like layout/color treatment while keeping theme compatibility (`app/(app)/modes/chat.tsx`).

- Fixed duplicate React key warnings in Help Me Decide option chips by switching MCQ/quick-reply list keys to index-scoped unique keys in `app/(app)/modes/chat.tsx`.

- Updated Home mode card copy for `Help me decide` to reflect live availability (removed "COMING SOON" wording) in `utils/constants.ts`.

- Implemented live AI integration for `Help me decide` mode: added AI client service (`services/ai.ts`), introduced typed AI models in `types/index.ts`, and rewired chat UI to `/v1/ai/*` endpoints (suggestions, sessions, history, chat) with structured rendering support for `mcq` options and `confirmation` actions in `app/(app)/modes/chat.tsx`. Also ran `AI-part.py` smoke test successfully (`5 passed, 0 failed`) before wiring frontend. Added implementation doc: `docs/help-me-decide-ai.md`.

- Rolled out bottom nav globally at the `(app)` layout level so it persists across app screens (including Orders and Settings), with route-based auto-hide for detail/pop-up-heavy routes (`orders/[id]`, `modes/stockup/[id]`, `modes/cookmeal/[id]`, `modes/readyeat`, `modes/chat`). Removed page-level duplicate nav mounts and centralized behavior in layout (`app/(app)/_layout.tsx`, `app/(app)/index.tsx`, `app/(app)/cart.tsx`, `app/(app)/profile.tsx`, `app/(app)/modes/shoplist.tsx`).

- Added live cart indicator on the bottom-nav cart tab: badge now shows current total cart item count and updates immediately on add/increment/decrement/remove actions (`components/layout/BottomNav.tsx`).

- Made bottom nav persistent on key tab pages (`Home`, `Browse`, `Cart`, `Account`) by mounting it on cart, profile, and browse screens as well; nav remains keyboard-responsive (moves up/down on keyboard show/hide), and pressing the currently active tab now does nothing (no reload/no redirect to same page) (`components/layout/BottomNav.tsx`, `app/(app)/cart.tsx`, `app/(app)/profile.tsx`, `app/(app)/modes/shoplist.tsx`).

- Improved Cart light/dark parity: cart surfaces, headers, balance bar, item rows, subtotal/delivery labels, notes input, and insufficient-funds sheet now use theme palette-aware styling for consistent readability in both modes (`app/(app)/cart.tsx`, `components/ui/InsufficientFundsSheet.tsx`).

- Replaced emoji-based icons with Phosphor icons in newly added nav/payment surfaces: bottom nav now uses `House`, `MagnifyingGlass`, `ShoppingCart`, `UserCircle`, and payment method options now use `Wallet` and `CreditCard` (`components/layout/BottomNav.tsx`, `components/ui/PaymentMethodSelector.tsx`).

- Updated the Wholesale mode card media to use the provided Cloudinary image instead of emoji fallback (`utils/constants.ts`).

- Added a new keyboard-aware bottom navigation on Home with `Home`, `Browse`, `Cart`, and `Account` actions; the nav now animates up/down with keyboard visibility while typing in search (`components/layout/BottomNav.tsx`, `app/(app)/index.tsx`).

- Added a new `Buy Wholesale` mode and route, built by reusing the Quick Restock flow (same product browsing/adding behavior), and made the shared screen title/hint adapt when accessed via wholesale (`utils/constants.ts`, `app/(app)/modes/wholesale.tsx`, `app/(app)/modes/shoplist.tsx`).

- Fixed search-result thumbnail alignment/padding so result rows match other product cards: updated Home universal search and Add More Items search results to render via shared `ProductImage` with consistent sizing/radius and flush thumbnail containers (`app/(app)/index.tsx`, `components/ui/AddMoreItemsSheet.tsx`).

- Added smooth move-up/move-down animation for keyboard handling in the floating cart using `Animated.timing`, so the cart now glides above the keyboard and back down instead of jumping (`components/ui/FloatingCart.tsx`).

- Made `FloatingCart` keyboard-aware: when the keyboard opens, the cart auto-repositions above it; when keyboard closes, it returns to its normal bottom position (`components/ui/FloatingCart.tsx`).

- Fixed floating cart placement so it no longer overlaps the Home profile control: moved shared `FloatingCart` position from top-right to bottom-docked (`styles/index.ts`).

- Fixed two UI state/visibility issues: (1) floating cart now updates count and total immediately on add/remove by deriving values directly from current cart items in `useCart`, and (2) Stock Up bundle detail member price is now visible in light mode by binding the amount text color to theme palette (`hooks/useCart.ts`, `app/(app)/modes/stockup/[id].tsx`).

- Adjusted home and mode product-list card media layout so thumbnails are larger and start flush at the left edge (no inner left padding), matching the requested card style. Applied to home mode cards and key product rows in Stock Up, Cook a Meal, Ready to Eat, and Shop List (`components/cards/ModeCard.tsx`, `components/cards/BundleCard.tsx`, `components/cards/MealPackCard.tsx`, `components/cards/ProductCard.tsx`, `app/(app)/modes/readyeat.tsx`).

- Refined the same card-media update by removing top/bottom inner spacing on those rows, increasing media blocks so the image sits exactly on card edges, removing remaining media inset/border feel, and applying the exact flush-media treatment to Snacks cards for cross-mode consistency (`components/cards/SnackCard.tsx` plus the files above).

- Removed the remaining vertical inner padding source on Home mode selection cards so those cards now match the product-card flush-media pattern more exactly (`components/cards/ModeCard.tsx`).

- Polished product-card visuals across Home and mode lists: increased product thumbnail sizes, removed inner thumbnail padding so images sit flush inside their containers, and standardized corner radius to `4px` across shared product card components (`components/cards/ModeCard.tsx`, `components/cards/BundleCard.tsx`, `components/cards/MealPackCard.tsx`, `components/cards/SnackCard.tsx`, `components/cards/ProductCard.tsx`, `components/ui/ProductImage.tsx`). Also fixed Cook a Meal detail total price visibility in light mode by binding the footer price text to the active theme palette (`app/(app)/modes/cookmeal/[id].tsx`).

- Moved the Light/Dark mode switcher from Account Settings to the Profile screen for better discoverability; users can now toggle theme directly from Profile without navigating into settings (`app/(app)/profile.tsx`), and the toggle section was removed from Account Settings (`app/(app)/settings/account.tsx`).

- Improved app startup and perceived speed with background prefetch + caching: added shared in-memory TTL caching and in-flight request de-duplication for product, order, and wallet service fetches (`services/products.ts`, `services/orders.ts`, `services/wallet.ts`), seeded product hook state from cache (`hooks/useProducts.ts`), and added authenticated app warmup prefetch on app stack mount (`app/(app)/_layout.tsx`) so data is loaded in the background before users navigate.
- Fixed Stock Up theme responsiveness in light mode by applying token-based background/header/text/border styling on the mode list screen (`app/(app)/modes/stockup.tsx`) and aligned detail status/loading colors with theme palette (`app/(app)/modes/stockup/[id].tsx`).

- Updated home universal search selection behavior for item-level results: selecting a `Product` result now opens Shop List with that exact item popup pre-opened, and selecting a `Ready to Eat` result opens the item popup directly, so users can order the specific item immediately instead of landing on the generic list page.

- Fixed remaining light-mode parity regressions reported after the previous sweep: themed Order Detail/Order History list surfaces in `app/(app)/orders/[id].tsx` and updated `components/ui/SearchBar.tsx` so the Shop List search bar (non-universal variant) uses theme palette tokens for background, border, input, and clear icon states.

- Final light/dark parity sweep across remaining reusable and mode surfaces: themed `FloatingCart` and `EmptyState`; applied token-based light-mode styling to `Shop your list` (`app/(app)/modes/shoplist.tsx`), `Snacks & Drinks` (`app/(app)/modes/snacks.tsx`), `Ready to Eat` (`app/(app)/modes/readyeat.tsx`), `Cook a Meal` (`app/(app)/modes/cookmeal.tsx`), and `Orders` (`app/(app)/orders.tsx`), including popups/sheets and header/error states so light mode renders consistently.

- Added app-wide Light/Dark theme switching with local persistence: introduced `themeStore` (Zustand), persisted preference via secure storage, wired global theme hydration in root layout, applied theme-aware background handling to app/auth/settings/modes stacks and `ScreenWrapper`, and added a new theme toggle control in Account Settings (`app/(app)/settings/account.tsx`).
- Phase 2 theme polish: converted key shared primitives to light/dark token usage (`components/ui/Button.tsx`, `components/ui/Card.tsx`, `components/ui/Input.tsx`) and updated shared header surface/text styling (`components/layout/Header.tsx`) so buttons, cards, inputs, and header visuals adapt consistently across themes.
- Phase 3 theme migration: updated high-impact screens (`app/(app)/profile.tsx`, `app/(app)/wallet.tsx`, and settings list screens under `app/(app)/settings/*`) to use light/dark tokens for key text, card surfaces, borders, form fields, and bottom sheets; also updated wallet shared blocks (`components/wallet/WalletCard.tsx`, `components/wallet/TransactionItem.tsx`) for consistent readability in light mode.
- Phase 4 theme migration: updated remaining auth + modes/detail screens to replace hardcoded dark fallback colors with theme-aware token usage, including auth entry forms (`app/(auth)/*`), mode list/chat screens, and key mode detail popups/sheets (`app/(app)/modes/*`, `app/(app)/modes/*/[id].tsx`), plus status bar/background adaptations for light mode in detail overlays.
- Updated the home universal search input to use a Phosphor magnifying-glass icon and switched its visual treatment from blue to a green-neutral palette for better consistency with the app's primary design language.
- Replaced home prompt text ("What are we doing today?") with a universal search input on the main screen. Users can now search across bundles, bundle items, meal packs, ingredients, ready-to-eat items, snacks, and restock products from one place, with tap-to-navigate results.
- Added full-screen image preview support to Bundle Detail item list: tapping any bundle item thumbnail now opens a full-screen preview modal, including items added via "+ Add More Items" (imageUrl is now preserved for added items).
- Updated Quick Restock UX: added visible spacing/separation between list items and enabled tap-to-open item details popup from the row/image. The popup now supports add-to-cart and quantity stepper controls, while keeping the inline list `ADD`/stepper behavior unchanged.
- Updated Ready to Eat popup UX to match the new design: popup now opens as a fully opaque full-screen modal (background screen/components are no longer visible), includes an inline PLATES quantity stepper block, computes and shows live total price, and uses a single bottom CTA format (`ADD X PLATE(S) · ₦TOTAL`).
- Added dual payment method support at checkout: users can now choose between **Wallet** and **Pay with Card** (Paystack) on the cart screen. Added `PaymentMethodSelector` component (two side-by-side option cards), `InsufficientFundsSheet` component (bottom sheet with "Pay with Card" / "Fund Wallet" options when wallet balance is low), extended `CreateOrderPayload` with `paymentMethod` and `callbackUrl` fields, added `verifyOrderPayment` service function, and updated `useOrders` hook with `verifyPayment` method. Card payments use Paystack Direct flow via `expo-web-browser` (same proven pattern as wallet top-up). See `docs/direct-payment-checkout.md` for full details.
- Added "+ Add More Items" button and bottom sheet to Stock Up, Cook a Meal, and Ready to Eat mode screens. Users can tap the button at the bottom of each list to open a search overlay that browses the full product catalog (via restock API), with category filters and debounced search. Items are added to cart as `product` type. Implemented via reusable `AddMoreItemsSheet` component.
- Extended "+ Add More Items" button to the Cart page (below cart items) and both detail pages: Bundle Detail (`stockup/[id]`) and Meal Pack Detail (`cookmeal/[id]`), placed above the "Add to Cart" button.
- Added slide-up/slide-down animation to `BottomSheet` component using `Animated.spring` (open) and `Animated.timing` (close) with background fade overlay.
- Changed "Add More Items" behavior on detail pages (Bundle Detail and Meal Pack Detail) to append selected products to the page's item list instead of adding directly to cart. On Bundle Detail, new items appear as editable bundle items with qty controls. On Meal Pack Detail, new items appear as extra items below ingredients with qty controls and are included in the cart meta and total price. Extended `MealPackMeta` type with optional `extraItems` field.
- Updated home header wallet balance interaction: tapping the amount no longer navigates to wallet; only the `TOP UP` button is actionable and opens the top-up sheet directly.
- Implemented auth session bootstrap persistence on app reload by always attempting `/auth/refresh` at startup, then hydrating user state from `/user/me` when refresh succeeds.
- Cleaned auth client flow to remove unused local refresh-token storage dependency from frontend logout/bootstrap path.

- Reviewed `docs/` and project prototype files before backend setup.
- Initialized Django project in current directory (`config` project package).
- Scaffolded backend apps: `authentication`, `users`, `addresses`, `products`, `orders`, `wallet`, `webhooks`, `referrals`, `support`.
- Registered apps in `INSTALLED_APPS`.
- Implemented database models mapped from `docs/baza-devkit/schema.prisma`.
- Set custom auth model: `AUTH_USER_MODEL = 'users.User'`.
- Generated and applied initial migrations.
- Ran `manage.py check` successfully.
- Added app-level URL files and wired all app routes under `/v1/`.
- Implemented first product endpoints from API contract in `products/views.py`.
- Verified product endpoints return HTTP 200 in local smoke tests.
- Implemented auth scaffold endpoints (`otp-request`, `otp-verify`, `refresh`, `logout`).
- Enabled temporary open host/CORS settings for development.
- Verified auth endpoint flow with local smoke tests.
- Upgraded auth token flow to JWT access/refresh with rotation.
- Added Upstash Redis OTP storage + rate limiting service layer.
- Added Termii OTP send integration path.
- **Replaced Termii with Supabase Auth for phone OTP** — OTP generation, storage, expiry, and SMS delivery now handled by Supabase Auth REST API (`POST /auth/v1/otp` and `POST /auth/v1/verify`). Removed `TermiiService` class. Added `SupabaseOTPService` in `authentication/services.py`.
- Updated `authentication/views.py` to use `SupabaseOTPService` for OTP send/verify, while keeping app-level rate limiting via Upstash Redis.
- Added `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` to Django settings.
- Removed old `TERMII_*` env vars from settings.
- Updated `docs/baza-devkit/.env.example` with Supabase env vars (replacing Termii section).
- Updated `API_USAGE.md` with Supabase auth flow documentation.
- Switched DB config to PostgreSQL env-based setup.
- Added JWT auth middleware that automatically protects contract-protected `/v1/*` routes.
- Added reusable JWT auth decorator for route-level enforcement where needed.
- Switched one protected endpoint to DRF view style and `Response`.
- Added shared helper for authenticated user id extraction across apps.
- Added shared helper for full authenticated user object retrieval.
- Applied `@require_jwt_auth` and helper usage on another protected products endpoint.
- Registered all key models in Django admin for superuser CRUD.
- Added API usage documentation file.
- Added products admin POST action to seed full sample catalog from `docs/baza-devkit/seed.ts` mapping.
- Seeded catalog rows remain normal DB data and can be edited/deleted from admin.
- Replaced seed module flow with separate importer script: `add-smallducuts.py`.
- Added protected POST endpoint `POST /v1/products/import-smallproducts` for script-driven product import.
- Deleted `products/seed_catalog.py` as requested.
- Added admin action `Clear full catalog data (confirm)` with confirmation template for reset/reseed.
- Enforced authentication on all `/v1/*` endpoints except explicitly public prefixes.
- Added admin-role enforcement for admin-only API operation: `POST /v1/products/import-smallproducts`.
- Added Products administration quick-add buttons right after the title (Add Product, Add Bundle item 1, Add Bundle item 2, Add Bundle).
- Added Vercel deployment configuration: `vercel.json`, WhiteNoise static file serving, `psycopg2-binary` driver, and WSGI `app` alias for Vercel's Python runtime.
- Deployed to Vercel production: https://baza-chi.vercel.app
- Connected Neon PostgreSQL database via Vercel Storage. Ran all migrations against Neon DB.
- Pushed all environment variables to Vercel (Supabase, Upstash Redis, JWT, Cloudinary, etc.).
- Fixed JWT_ALGORITHM env var newline bug — added `.strip()` to all `os.getenv()` calls in settings.py.
- Fixed RefreshToken model — changed `token` field from `CharField(max_length=255)` to `TextField` (JWT strings exceed 255 chars). Migration 0003 applied.
- Implemented all remaining protected API endpoints:
  - **User endpoints** (`users/views.py`): `GET /user/me`, `PUT /user/profile`, `PUT /user/notifications`
  - **Address endpoints** (`addresses/views.py`): `GET /user/addresses/` (list), `POST /user/addresses/create`, `PUT /user/addresses/:id` (update), `PATCH /user/addresses/:id/default` (set default), `DELETE /user/addresses/:id/delete`
  - **Order endpoints** (`orders/views.py`): `POST /orders/create` (with atomic wallet deduction + referral bonus), `GET /orders/` (paginated list), `GET /orders/:id` (detail)
  - **Wallet endpoints** (`wallet/views.py`): `GET /wallet/balance`, `GET /wallet/transactions` (paginated)
  - **Referral endpoint** (`referrals/views.py`): `GET /referral/stats` (shows referred users, paid/pending credits)
  - **Support endpoints** (`support/views.py`): `GET /support/thread` (conversation history), `POST /support/message` (with placeholder AI reply + keyword-based flagging)
- Wired all new URL routes in app-level `urls.py` files.
- Created `UserFlow.py` — 21-step end-to-end test script covering auth → profile → addresses → products → wallet → orders → referrals → support → refresh → logout.
- Tested all endpoints successfully against live Vercel deployment:
  - Auth: OTP request, OTP verify, refresh (with cookie), logout — all pass
  - User: GET /me, PUT /profile, PUT /notifications — all pass
  - Addresses: create, list, update, set default, delete — all pass
  - Products: bundles, mealpacks, readyeat, snacks, restock — all pass (empty data, no products seeded)
  - Wallet: balance, transactions — all pass
  - Orders: create, list, detail — all pass
  - Referral: stats — passes
  - Support: thread, message (with AI reply) — all pass
- Updated `API_USAGE.md` with complete endpoint documentation matching the live API contract, including cURL examples, request/response shapes, error codes, deployment instructions, and pagination convention.

### Real-time Updates & WebSocket Infrastructure

- Added **Django Channels** + **Daphne** ASGI server for WebSocket support.
- Added **Redis** via `django-redis` as the session backend and cache backend for high-throughput request processing.
- Configured **`channels_redis`** channel layer for WebSocket pub/sub messaging.
- Created JWT-based WebSocket authentication middleware (`config/ws_auth.py`) — clients connect with `?token=<JWT>` query param.
- Built **Order WebSocket consumer** (`orders/consumers.py`):
  - Per-user group `user_{id}_orders` for personal order updates.
  - Admin group `admin_orders` for staff to see all order events in real time.
  - Supports `order_created` and `order_update` event types.
- Built **Product WebSocket consumer** (`products/consumers.py`):
  - Global `products` group — all connected clients receive catalog changes.
  - Supports `product_created`, `product_updated`, `product_deleted`, and `stock_update` event types.
- Created **Django signals** (`orders/signals.py`, `products/signals.py`) that automatically broadcast to WebSocket groups on every model save/delete.
  - Order signals broadcast to both user-specific and admin groups.
  - Product signals broadcast for all product types: `Product`, `ReadyEatItem`, `SnackItem`, `Bundle`, `MealPack`.
- WebSocket routing registered at `ws/orders/` and `ws/products/`.
- ASGI entrypoint (`config/asgi.py`) upgraded to `ProtocolTypeRouter` with HTTP + WebSocket protocol handling.

### Paystack Payment Integration

- Created **PaystackService** (`wallet/paystack.py`) — service layer for Paystack REST API:
  - `initialize_transaction()` — starts a payment and returns `authorization_url`.
  - `verify_transaction()` — verifies payment status by reference.
  - `verify_webhook_signature()` — HMAC-SHA512 signature verification for webhooks.
- Added **`POST /v1/wallet/topup`** endpoint — initializes a Paystack transaction, pre-creates a pending wallet txn, returns `authorizationUrl` for the client.
- Added **`GET /v1/wallet/verify-topup?reference=xxx`** endpoint — verifies payment via Paystack API, credits wallet atomically, idempotent (safe to call twice).
- Created **Paystack webhook handler** (`webhooks/views.py`):
  - `POST /v1/webhooks/paystack` — receives `charge.success` events.
  - Verifies HMAC-SHA512 signature against `PAYSTACK_SECRET_KEY`.
  - Credits user wallet idempotently (no double-crediting).
  - Pushes real-time wallet balance update via WebSocket.
- Added `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_WEBHOOK_SECRET` to settings.
- Added `REDIS_URL` configuration with `django-redis` cache backend and session backend.
- Updated `requirements.txt` with new dependencies: `channels`, `channels-redis`, `daphne`, `django-redis`, `redis`.

### High-Throughput Scaling (2500+ Concurrent Requests)

- **Upstash Redis integration** — configured `UPSTASH_REDIS_URL` (TCP/TLS endpoint) for `django-redis` cache and `channels-redis` channel layer. Existing `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (HTTP REST API) kept for OTP service and rate limiting.
- **Redis-backed sessions** — `SESSION_ENGINE` set to `django.contrib.sessions.backends.cache` backed by Upstash Redis. Eliminates DB queries for session reads, enabling thousands of concurrent auth'd requests.
- **Redis connection pooling** — `BlockingConnectionPool` with `max_connections=50`, socket timeouts, and `RETRY_ON_TIMEOUT` for resilient high-concurrency Redis access.
- **Async views** — Converted all product catalog views (`bundles`, `mealpacks`, `readyeat_items`, `snack_items`, `restock_items`) and order read views (`list_orders`, `get_order`) to native async Django views using `async def` + `sync_to_async` for ORM calls. ASGI server processes these without blocking threads.
- **Async-capable JWT middleware** — `JWTAuthenticationMiddleware` upgraded to support both sync WSGI and async ASGI request cycles via `__acall__`.
- **Async-compatible auth decorators** — `@require_jwt_auth` and `@require_admin_user` now auto-detect sync/async views and wrap accordingly.
- **Product catalog caching** — All product views cache results in Redis (TTL 120s). Cache is auto-invalidated by Django signals on any product model save/delete.
- **Response coalescing middleware** (`config/middleware.py: ResponseCacheMiddleware`) — Short-lived (5s) per-user response cache for GET /v1/ endpoints. Identical requests within the window return instantly from Redis without hitting the DB.
- **Concurrency limit middleware** (`config/middleware.py: ConcurrencyLimitMiddleware`) — Async semaphore limits in-flight requests to 2500. When exceeded, returns `503 Server Busy` with `Retry-After` header instead of crashing. Placed first in middleware stack.
- **Database connection pooling** — `CONN_MAX_AGE=600` + `CONN_HEALTH_CHECKS=True` for persistent, self-healing DB connections. Eliminates connection setup overhead per request.
- **DRF throttling** — Added `AnonRateThrottle` (100/min) and `UserRateThrottle` (300/min) as safety nets against API abuse.
- **Smart channel layer fallback** — Uses `channels_redis.core.RedisChannelLayer` when `UPSTASH_REDIS_URL` is set; falls back to `InMemoryChannelLayer` for local development.
- **Structured logging** — Added `LOGGING` config with formatters for production observability.

### Paystack Inline Payment Gateway

- **Added `GET /v1/wallet/paystack-config`** endpoint — returns Paystack public key so the frontend can initialise Paystack Inline without hard-coding keys.
- **Refactored `GET /v1/wallet/verify-topup`** to support **two payment flows**:
  - **Flow A (Paystack Inline):** Frontend opens Paystack popup directly with the public key → user pays → frontend sends reference to backend → backend verifies with Paystack API and credits wallet. No pre-existing WalletTransaction needed.
  - **Flow B (Server-init):** Backend calls `POST /v1/wallet/topup` → returns `accessCode` → frontend uses `popup.resumeTransaction(accessCode)` → on success calls verify endpoint.
- **Updated webhook handler** (`webhooks/views.py`) to handle Inline-initiated transactions — creates WalletTransaction from webhook metadata when no pre-existing record exists. Uses `get_or_create` for race-condition safety between verify endpoint and webhook.
- Both verify endpoint and webhook are **idempotent** — a payment is never double-credited.
- Added `test_paystack.py` — integration test script for the Paystack payment flow (config, topup init, verify).
- Updated `API_USAGE.md` with complete Paystack Inline integration guide, including frontend JS code examples and webhook setup instructions.

### Complete Order Payment System

- **Three payment modes** for order checkout:
  - **`wallet`** — Deducts from user's wallet balance. Order is CONFIRMED immediately. Returns updated wallet balance.
  - **`paystack`** — Backend initialises a Paystack transaction. Returns `authorizationUrl`, `accessCode`, and `reference`. Order stays PENDING until verified.
  - **`paystack_inline`** — Order created as PENDING. Frontend opens Paystack popup with the public key, then calls verify endpoint with the Paystack reference.
- **Added `PaymentMethod`** enum (`wallet`, `paystack`, `paystack_inline`) and new fields (`payment_method`, `payment_reference`) to Order model.
- **Refactored `POST /v1/orders/create`** to accept `paymentMethod` in the request body and route to the correct payment handler. Validates payment method, items, and total.
- **Added `GET /v1/orders/verify-payment?reference=xxx&orderId=yyy`** — verifies Paystack payment via API, confirms order atomically, records WalletTransaction (DEBIT_ORDER). Idempotent (safe to call twice).
- **Updated webhook handler** (`webhooks/views.py`) to handle order payments — detects `purpose: "order_payment"` in Paystack metadata, finds PENDING order by reference, and auto-confirms it. Acts as a safety net if user closes browser after paying.
- **Added auto-generated account number on signup** — `generate_account_number()` creates a unique 10-digit number. `UserManager.create_user()` auto-assigns one if not provided.
- **Added resilient WebSocket broadcasting** — order and product signals now catch Redis connection failures gracefully (logged as warnings) instead of crashing the request.
- **Created `docs/payment-system.md`** — comprehensive frontend integration guide with React code examples for all 3 payment flows, API reference, error codes, and webhook documentation.

### Dedicated Virtual Account (DVA) — Bank Transfer Wallet Funding

- **Paystack DVA integration** — every customer gets a real bank account number (via Paystack Dedicated Virtual Accounts) so they can fund their wallet by bank transfer from any bank.
- **Added DVA methods to `PaystackService`** (`wallet/paystack.py`): `create_customer()`, `create_dedicated_account()`, `assign_dedicated_account()`, `fetch_dedicated_account()`.
- **Added DVA service layer** (`wallet/dva_service.py`): `provision_dva_for_user()` — two-step flow: create Paystack customer → create DVA. Idempotent, non-blocking on failure.
- **Added Paystack DVA fields to User model**: `paystack_customer_code`, `paystack_dva_id`, `paystack_dva_account_number`, `paystack_dva_account_name`, `paystack_dva_bank_name`, `paystack_dva_bank_slug`, `paystack_dva_assigned`.
- **Auto-provision DVA on signup/login** — triggered in `otp_verify` after user creation or for existing users without a DVA. Non-blocking (login still succeeds if Paystack is down).
- **`GET /v1/wallet/account`** — returns dedicated virtual account details (account number, bank name, account name, assignment status). If DVA not yet provisioned, attempts on-the-fly provisioning.
- **Webhook handlers for DVA events**:
  - `charge.success` with `channel: "dedicated_nuban"` → credits user wallet (`CREDIT_TRANSFER` type). User identified by `customer_code`.
  - `dedicatedaccount.assign.success` → stores DVA details on user record.
  - `dedicatedaccount.assign.failed` → logged as warning.
- **Management command** `python manage.py provision_dvas` — batch-provision DVAs for existing users. Supports `--dry-run`, `--user-id`, `--delay`.
- **Admin panel** — DVA fields shown in collapsible "Paystack DVA" fieldset on user detail page; `paystack_dva_assigned` column in user list.
- **`PAYSTACK_DVA_PREFERRED_BANK`** env var — defaults to `"test-bank"` for testing; set to `"wema-bank"` or `"titan-paystack"` for production.
- **Created `docs/dva-bank-transfer.md`** — frontend integration guide with React examples, API reference, webhook event table, and testing instructions.
- **Updated `docs/payment-system.md`** — added bank transfer as a wallet funding method.

- Added wallet account (DVA) and transaction history tests to `test_paystack.py` (steps 3-4).
- Updated `docs/payment-system.md` testing checklist with DVA account and transaction cURL commands.

### Font Consistency — Noto Serif Only

- **Switched to single-font system**: Noto Serif (`NotoSerif_400Regular`) is now the only font used across the entire app — headlines, titles, prices, labels, buttons, descriptions, stepper controls, everything.
- Installed `@expo-google-fonts/noto-serif` package.
- Updated `app/_layout.tsx` to import and load `NotoSerif_400Regular` (removed DM Serif Display and SpaceMono imports).
- Updated `tailwind.config.js`: both `font-serif` and `font-mono` now map to `NotoSerif_400Regular`.
- Updated `constants/theme.ts` font entries to `NotoSerif_400Regular`.
- Replaced all 34 inline `fontFamily: "SpaceMono_400Regular"` references across 13 source files with `"NotoSerif_400Regular"`.
- **Fixed core stylesheet** (`styles/index.ts`): All ~150+ text style classes have explicit `font-mono` or `font-serif` (both resolve to Noto Serif).
- **Root cause**: React Native does not cascade `fontFamily` from parent `<View>` to child `<Text>` (unlike CSS). Every `<Text>` element must explicitly declare its font via `className` or inline `style`.

## Next

1. **Set Paystack webhook URL** in Paystack Dashboard → Settings → API Keys & Webhooks → `https://baza-chi.vercel.app/v1/webhooks/paystack`
2. Deploy with Daphne (ASGI) instead of WSGI for WebSocket support. For Vercel, consider a separate WebSocket server on Railway/Render.
3. Implement phone number verification hardening with real SMS delivery monitoring and retry tracking.
4. Build role-based permissions per endpoint (member, admin, support agent) and apply fine-grained checks beyond prefix-based control.
5. Replace placeholder AI support replies with Claude API integration for intelligent, context-aware support chat.
6. Add request/response serializers and strict payload validation for all write endpoints.
7. Seed product catalog into Neon database for production use.
8. Add integration tests for auth, role access, product import, and admin catalog workflows.
