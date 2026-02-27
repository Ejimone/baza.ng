# Direct Payment at Checkout

## Overview

Users can now choose between **Wallet** and **Pay with Card** (Paystack) at checkout. Previously, only wallet payment was supported. The backend already supports multiple payment methods — this feature connects the frontend to that capability.

## Payment Methods

| Method            | Button Text        | Flow                                                                             |
| ----------------- | ------------------ | -------------------------------------------------------------------------------- |
| **Wallet**        | `CONFIRM ORDER`    | Deducts from wallet balance instantly. Order confirmed.                          |
| **Pay with Card** | `PAY ₦X WITH CARD` | Creates a PENDING order, opens Paystack checkout in browser, verifies on return. |

## User Flow

### Wallet Payment (existing, enhanced)

1. User selects **Wallet** in the payment method selector
2. If balance is sufficient → taps "CONFIRM ORDER" → order placed → wallet debited → done screen
3. If balance is insufficient → `InsufficientFundsSheet` appears with two options:
   - **PAY WITH CARD** — switches to Paystack flow and proceeds immediately
   - **FUND WALLET INSTEAD** — opens existing `FundPrompt` for wallet top-up

### Card Payment (new)

1. User selects **Pay with Card** in the payment method selector
2. Taps "PAY ₦X WITH CARD" (green button)
3. `POST /v1/orders/create` is called with `paymentMethod: "paystack"`
4. Backend returns `authorizationUrl`, `reference`, and a PENDING order
5. Paystack checkout opens in `expo-web-browser` (same pattern as wallet top-up in `FundPrompt`)
6. After browser closes, `GET /v1/orders/verify-payment` is called with the `reference` and `orderId`
7. If verified → cart clears → done screen shown
8. If pending/failed → Alert explains the order will be confirmed automatically (webhook fallback)

## Components

### `PaymentMethodSelector` (`components/ui/PaymentMethodSelector.tsx`)

- Two side-by-side option cards: Wallet (👛) and Card (💳)
- Active option has green-tinted background with stronger border (`#4caf7d55`)
- Inactive option uses dark card background with subtle border (`#1a2a1c`)
- Wallet option shows current balance; displays "LOW" in red when insufficient
- Sharp corners, monospace uppercase labels — matches Baza design system

### `InsufficientFundsSheet` (`components/ui/InsufficientFundsSheet.tsx`)

- Bottom sheet overlay (same pattern as `FundPrompt`)
- Shows shortfall amount in amber
- Two CTAs: "PAY WITH CARD" (primary, white bg) and "FUND WALLET INSTEAD" (outline, green text)
- Cancel button at bottom

## API Integration

### Types Added (`types/index.ts`)

- `PaymentMethod`: `"wallet" | "paystack"`
- `paymentMethod?` and `paymentReference?` fields on `Order` and `OrderDetail`
- `OrderPaymentVerifyResponse`: `{ status, message, order }`

### Service Functions (`services/orders.ts`)

- `CreateOrderPayload` now includes optional `paymentMethod` and `callbackUrl`
- `CreateOrderResponse` now includes optional `authorizationUrl`, `accessCode`, `reference`
- New function: `verifyOrderPayment(reference, orderId)` → `GET /orders/verify-payment`

### Hook (`hooks/useOrders.ts`)

- New method: `verifyPayment(reference, orderId)` wrapping the service function

## Design Decisions

- **Paystack Direct via `expo-web-browser`** — reuses the proven pattern from wallet top-up. No new dependencies needed. React Native cannot run `PaystackPop` (web-only).
- **Both options always visible** — wallet and card selectors are always shown regardless of balance, giving users maximum flexibility.
- **Cart screen accent: `#4caf7d`** — per `ScreenTheme.cart` in design tokens.
- **Card confirm button uses `bg-baza-green`** (`#4caf7d`) to visually distinguish from wallet's white button.
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
