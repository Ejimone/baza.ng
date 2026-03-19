# Direct Payment at Checkout

## Overview

The frontend is now running in a temporary **card-only checkout mode**.

- Wallet and DVA funding UI are hidden in the app.
- Checkout goes directly through **Paystack direct payment**.
- Wallet code and components are preserved in the codebase for future re-enable.

## Payment Methods

| Method            | Frontend Status              | Flow                                                                     |
| ----------------- | ---------------------------- | ------------------------------------------------------------------------ |
| **Wallet**        | Temporarily hidden in app UI | Preserved for later re-enable. Not selectable during this phase.         |
| **Pay with Card** | Active                       | Creates a pending checkout, opens Paystack checkout, verifies on return. |

## User Flow

### Card Payment (active)

1. User taps "PAY ₦X WITH CARD"
2. `POST /v1/orders/direct-checkout` is called with `paymentMethod: "paystack_direct"`
3. Backend returns `authorizationUrl`, `reference`, and `publicKey`
4. Paystack inline modal opens in-app
5. On success, frontend calls `GET /v1/orders/verify-payment` with the `reference`
6. If verified → cart clears → done screen shown
7. If pending/failed → Alert explains the order will be confirmed automatically (webhook fallback)

## Components

### Current Checkout Surface

- Cart now renders a single card-payment CTA.
- Wallet selector, insufficient-wallet sheet, and fund-wallet prompt are hidden.
- This is UI-level deactivation only; wallet modules remain in the repository.

## API Integration

### Types (`types/index.ts`)

- `PaymentMethod`: `"wallet" | "paystack"`
- `paymentMethod?` and `paymentReference?` fields on `Order` and `OrderDetail`
- `OrderPaymentVerifyResponse`: `{ status, message, order }`

### Service Functions (`services/orders.ts`)

- `initDirectCheckout(payload)` starts direct card checkout via `/orders/direct-checkout`
- `verifyOrderPayment(reference, orderId?)` confirms payment via `/orders/verify-payment`

### Hook (`hooks/useOrders.ts`)

- New method: `verifyPayment(reference, orderId)` wrapping the service function

## Design Decisions

- **Temporary card-only mode** — wallet is disabled in app UI while backend wallet endpoints stay available.
- **Direct checkout preserved** — existing Paystack direct flow remains the only active checkout path.
- **Cart screen accent: `#4caf7d`** — per `ScreenTheme.cart` in design tokens.
- **No wallet deletion** — components/services are retained for a future re-enable.
- **Webhook safety net** — if user closes browser after paying but before verify call completes, the backend webhook auto-confirms the order.

## Styling

All new components follow the Baza design system strictly:

- Dark backgrounds (`#050805`, `#080f09`, `#0a120a`)
- Sharp corners everywhere (no border-radius except bottom sheet top: 20px)
- Monospace font for all labels, prices, buttons
- Tracked uppercase labels (`letterSpacing: 0.15em+`)
- Green accent (`#4caf7d`) for active states and CTAs
- Red accent (`#e85c3a`) for insufficient balance indicators
- Amber (`#f5a623`) for shortfall amounts
