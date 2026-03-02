# Direct Paystack Checkout (Pay Without Wallet)

## Overview

The direct checkout flow lets users pay for orders **immediately via Paystack**
(card, bank transfer, USSD, mobile money, etc.) without needing wallet balance.
The backend initialises the Paystack transaction securely, and the frontend
completes payment using either **Paystack Popup** or a **redirect**.

## Architecture

```
Frontend                         Backend                         Paystack
   │                               │                               │
   │  POST /v1/orders/direct-checkout                               │
   │  { items, total, ... }        │                               │
   │ ─────────────────────────────>│                               │
   │                               │  POST /transaction/initialize │
   │                               │ ─────────────────────────────>│
   │                               │  { access_code, auth_url }   │
   │                               │<──────────────────────────────│
   │                               │  cache cart data (no order)  │
   │  { accessCode,                │                               │
   │    authorizationUrl,           │                               │
   │    reference, publicKey }      │                               │
   │<──────────────────────────────│                               │
   │                               │                               │
   │  popup.resumeTransaction(     │                               │
   │    accessCode)                │                               │
   │ ──────────────────────────────────────────────────────────────>│
   │                               │                               │
   │  onSuccess({ reference })     │                               │
   │<──────────────────────────────────────────────────────────────│
   │                               │                               │
   │  GET /v1/orders/verify-payment?reference=xx                   │
   │ ─────────────────────────────>│                               │
   │                               │  GET /transaction/verify/xx   │
   │                               │ ─────────────────────────────>│
   │                               │  { status: "success" }       │
   │                               │<──────────────────────────────│
   │                               │  CREATE order (CONFIRMED)    │
   │  { order (CONFIRMED) }        │                               │
   │<──────────────────────────────│                               │
   │                               │                               │
   │    (webhook also auto-creates order — safety net)             │
```

## Endpoints

### 1. Initialise Direct Checkout

```
POST /v1/orders/direct-checkout
Authorization: Bearer <JWT>
```

**Request Body:**

| Field         | Type    | Required | Description                             |
| ------------- | ------- | -------- | --------------------------------------- |
| `items`       | array   | Yes      | Array of cart items (see below)         |
| `total`       | integer | Yes      | Order total in **kobo** (₦1 = 100 kobo) |
| `note`        | string  | No       | Delivery note                           |
| `addressId`   | UUID    | No       | Saved delivery address ID               |
| `callbackUrl` | string  | No       | URL Paystack redirects to after payment |

**Item object:**

| Field        | Type    | Description             |
| ------------ | ------- | ----------------------- |
| `name`       | string  | Item name               |
| `emoji`      | string  | Display emoji           |
| `qty`        | integer | Quantity                |
| `itemType`   | string  | `"product"`, etc.       |
| `unitPrice`  | integer | Price per unit in kobo  |
| `totalPrice` | integer | qty × unitPrice in kobo |
| `meta`       | object  | Optional extra data     |

**Success Response (200):**

```json
{
  "authorizationUrl": "https://checkout.paystack.com/xxx",
  "accessCode": "xxx",
  "reference": "dco_abc123",
  "publicKey": "pk_live_xxx"
}
```

> **Note:** No order is created at this point. Cart data is cached on the
> server. The order will only be created after payment succeeds.

```

**Error Responses:**

| Status | Code                  | When                             |
|--------|-----------------------|----------------------------------|
| 400    | `EMPTY_CART`          | No items provided                |
| 400    | `INVALID_TOTAL`       | Total ≤ 0                        |
| 502    | `PAYSTACK_ERROR`      | Paystack API failed              |
| 503    | `SERVICE_UNAVAILABLE` | Paystack keys not configured     |

### 2. Verify Payment & Create Order

```

GET /v1/orders/verify-payment?reference=dco_xxx
Authorization: Bearer <JWT>

```

Verifies the Paystack payment. If successful, the order is **created** with
status `CONFIRMED` and returned. If payment failed or was cancelled, no order
is created. This endpoint is idempotent — calling it twice returns the same order.

### 3. Webhook (automatic)

The Paystack `charge.success` webhook at `POST /v1/webhooks/paystack` also
auto-creates the order using the cached cart data. This means even if the user
closes their browser after paying, the order will still be created and confirmed.

## Alternative: Via `create_order` Endpoint

You can also use the general order creation endpoint with
`paymentMethod: "paystack_direct"`:

```

POST /v1/orders/create
{
"items": [...],
"total": 300000,
"paymentMethod": "paystack_direct",
"callbackUrl": "https://myapp.com/callback"
}

````

This returns the same response as `/v1/orders/direct-checkout`.

## Frontend Integration Examples

### Paystack Popup (Recommended)

```javascript
// 1. Call backend
const res = await fetch('/v1/orders/direct-checkout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    items: cart.items,
    total: cart.total,
    addressId: selectedAddress.id,
  }),
});
const data = await res.json();

// 2. Open Paystack Popup
const popup = new PaystackPop();
popup.resumeTransaction(data.accessCode, {
  onSuccess: async (transaction) => {
    // 3. Verify payment — this creates the order
    const verify = await fetch(
      `/v1/orders/verify-payment?reference=${data.reference}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const result = await verify.json();
    // Navigate to order confirmation page
    // result.order contains the confirmed order
  },
  onCancel: () => {
    // Handle cancelled payment
  },
});
````

### Redirect Flow

```javascript
const res = await fetch('/v1/orders/direct-checkout', { ... });
const data = await res.json();

// Redirect to Paystack checkout page
window.location.href = data.authorizationUrl;

// After payment, Paystack redirects to callbackUrl with ?reference=xxx
// Your callback page should call verify-payment
```

## Payment Methods Summary

| Method            | Flow                               | Wallet Needed? |
| ----------------- | ---------------------------------- | -------------- |
| `wallet`          | Deduct from wallet immediately     | Yes            |
| `paystack`        | Server-init → redirect to Paystack | No             |
| `paystack_inline` | Frontend-only Paystack popup       | No             |
| `paystack_direct` | Server-init → Popup/redirect       | No             |

The key difference between `paystack` and `paystack_direct` is intent —
`paystack_direct` has a dedicated endpoint (`/direct-checkout`) designed
specifically for the "pay now without wallet" use case, and always attaches
metadata so webhooks can auto-confirm orders.
