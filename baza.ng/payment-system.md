# Baza Payment System — Frontend Integration Guide

## Overview

Baza supports **three payment modes** for ordering products, a **wallet topup** flow, and **bank transfer wallet funding** via Paystack Dedicated Virtual Accounts (DVA). Every user receives a unique bank account number on signup that they can transfer money to from any bank.

### Payment Modes

| Mode | Field Value | How It Works |
|------|------------|--------------|
| **Wallet** | `"wallet"` | Deducts from user's wallet balance. Order confirmed instantly. |
| **Paystack Direct** | `"paystack"` | Backend initialises a Paystack transaction. Frontend redirects to Paystack checkout or uses `resumeTransaction`. Order confirmed after verification. |
| **Paystack Inline** | `"paystack_inline"` | Frontend opens Paystack popup with the public key. Order confirmed after verification. _(Recommended for best UX)_ |

### Wallet Funding Methods

| Method | How It Works |
|--------|-------------|
| **Card (Paystack Inline)** | `POST /v1/wallet/topup` or direct Inline popup. Instant credit after verification. |
| **Bank Transfer (DVA)** | User transfers to their dedicated bank account number. Credited automatically via webhook. See [DVA docs](dva-bank-transfer.md). |

### Amount Convention

All monetary values are in **kobo** (₦1 = 100 kobo). Never send naira floats.

| Display | Kobo |
|---------|------|
| ₦500 | 50000 |
| ₦1,000 | 100000 |
| ₦5,000 | 500000 |

---

## Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│  FRONTEND (React Native / React)                                     │
│                                                                       │
│  ┌─────────────┐  ┌──────────────────┐  ┌─────────────────────────┐  │
│  │ Wallet Pay  │  │ Paystack Direct  │  │  Paystack Inline       │  │
│  │ (deduct)    │  │ (redirect/resume)│  │  (popup, recommended)  │  │
│  └──────┬──────┘  └────────┬─────────┘  └───────────┬─────────────┘  │
│         │                  │                        │                │
└─────────┼──────────────────┼────────────────────────┼────────────────┘
          │                  │                        │
          ▼                  ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  BACKEND (Django)                                                   │
│                                                                     │
│  POST /v1/orders/create                                             │
│    paymentMethod: "wallet" | "paystack" | "paystack_inline"         │
│                                                                     │
│  GET /v1/orders/verify-payment?reference=xxx&orderId=yyy            │
│    → Verifies with Paystack API → Confirms order atomically         │
│                                                                     │
│  POST /v1/webhooks/paystack                                         │
│    → Safety net: auto-confirms PENDING orders on charge.success     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 1. User Account Number

Every user automatically receives a **10-digit account number** and a **bank name** on signup. These are returned in the user profile:

```
GET /v1/user/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "209abc40-...",
  "name": "John Doe",
  "phone": "+2348012345678",
  "walletBalance": 500000,
  "accountNumber": "4829173650",
  "bankName": "Providus Bank",
  "accountName": "Baza NG Ltd",
  "referralCode": "a3f8b2c1d4e5"
}
```

Display the account number on the wallet screen so users know where to send bank transfers.

---

## 2. Wallet Topup

Before paying from wallet, users must fund it. See [paystack-inline-integration.md](paystack-inline-integration.md) for full details. Quick summary:

### Topup via Paystack Inline (Recommended)

```jsx
import PaystackPop from '@paystack/inline-js';

async function topUpWallet(amountKobo, user, token) {
  // 1. Get Paystack public key
  const res = await fetch('/v1/wallet/paystack-config', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { publicKey } = await res.json();

  // 2. Open popup
  const popup = new PaystackPop();
  popup.newTransaction({
    key: publicKey,
    email: user.email || `${user.phone}@baza.ng`,
    amount: amountKobo,
    currency: 'NGN',
    reference: `topup_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    metadata: { user_id: user.id, purpose: 'wallet_topup' },
    onSuccess: async (txn) => {
      // 3. Verify on backend
      const verify = await fetch(
        `/v1/wallet/verify-topup?reference=${txn.reference}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await verify.json();
      // result.walletBalance has the updated balance
    },
    onCancel: () => { /* user closed popup */ },
  });
}
```

### Topup Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/v1/wallet/paystack-config` | Get Paystack public key |
| `POST` | `/v1/wallet/topup` | Server-init topup (returns `authorizationUrl`) |
| `GET` | `/v1/wallet/verify-topup?reference=xxx` | Verify topup & credit wallet |
| `GET` | `/v1/wallet/balance` | Check current wallet balance |
| `GET` | `/v1/wallet/transactions` | Paginated wallet transaction history |

---

## 3. Order Payment — All Three Flows

### Request Body (Same for All Flows)

```
POST /v1/orders/create
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "items": [
    {
      "itemType": "product",
      "name": "Spaghetti",
      "emoji": "🍝",
      "qty": 2,
      "unitPrice": 150000,
      "totalPrice": 300000,
      "meta": { "size": "1kg" }
    },
    {
      "itemType": "snack",
      "name": "Chin Chin",
      "emoji": "🍪",
      "qty": 1,
      "unitPrice": 50000,
      "totalPrice": 50000
    }
  ],
  "total": 350000,
  "note": "Please deliver before noon",
  "addressId": "addr-uuid-here",
  "paymentMethod": "wallet"
}
```

> **`total`** must equal the sum of all `totalPrice` values in `items`. All amounts are in kobo.

---

### Flow A: Wallet Payment (`"wallet"`)

The simplest flow. Deducts from the user's wallet and confirms the order immediately.

```jsx
async function payWithWallet(orderData, token) {
  const res = await fetch('/v1/orders/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...orderData,
      paymentMethod: 'wallet',
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    // data.code will be "INSUFFICIENT_BALANCE", "EMPTY_CART", etc.
    throw new Error(data.error);
  }

  // Order is already CONFIRMED
  console.log(data.order);        // { id, status: "CONFIRMED", total, ... }
  console.log(data.walletBalance); // updated wallet balance in kobo
}
```

**Success Response (201):**
```json
{
  "order": {
    "id": "order-uuid",
    "status": "CONFIRMED",
    "total": 350000,
    "eta": "Tomorrow by 10am",
    "paymentMethod": "wallet",
    "paymentReference": "order_a1b2c3d4e5f6g7h8",
    "items": [...]
  },
  "walletBalance": 150000
}
```

**Error Responses:**
| Code | Meaning |
|------|---------|
| `INSUFFICIENT_BALANCE` | Wallet balance < order total |
| `EMPTY_CART` | No items in the order |
| `INVALID_TOTAL` | Total is 0 or negative |

---

### Flow B: Paystack Direct (`"paystack"`)

Backend initialises a Paystack transaction. The frontend redirects the user to Paystack's checkout page (or uses `resumeTransaction`), then verifies.

```jsx
import PaystackPop from '@paystack/inline-js';

async function payWithPaystackDirect(orderData, token) {
  // 1. Create order — backend initialises Paystack transaction
  const res = await fetch('/v1/orders/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...orderData,
      paymentMethod: 'paystack',
      callbackUrl: 'https://yourapp.com/payment/callback',
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);

  // data.order.status is "PENDING" at this point
  const { order, authorizationUrl, accessCode, reference } = data;

  // 2. Option A: Redirect to Paystack checkout
  // window.location.href = authorizationUrl;

  // 2. Option B: Use Paystack Inline with resumeTransaction (better UX)
  const popup = new PaystackPop();
  popup.resumeTransaction(accessCode, {
    onSuccess: async (txn) => {
      // 3. Verify payment
      const verify = await fetch(
        `/v1/orders/verify-payment?reference=${reference}&orderId=${order.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await verify.json();

      if (result.status === 'success') {
        // Order is now CONFIRMED
        console.log(result.order); // { status: "CONFIRMED", ... }
      }
    },
    onCancel: () => {
      // Order stays PENDING — user can retry
      console.log('Payment cancelled. Order', order.id, 'is still pending.');
    },
  });
}
```

**Create Response (201):**
```json
{
  "order": {
    "id": "order-uuid",
    "status": "PENDING",
    "total": 350000,
    "paymentMethod": "paystack",
    "paymentReference": "order_ps_a1b2c3d4e5f6g7h8",
    "items": [...]
  },
  "authorizationUrl": "https://checkout.paystack.com/xxxxx",
  "accessCode": "0peioxfhpn",
  "reference": "order_ps_a1b2c3d4e5f6g7h8"
}
```

---

### Flow C: Paystack Inline (`"paystack_inline"`) — Recommended

Frontend opens the Paystack popup directly. Best UX because the user never leaves the app.

```jsx
import PaystackPop from '@paystack/inline-js';

async function payWithPaystackInline(orderData, user, token) {
  // 1. Get public key
  const configRes = await fetch('/v1/wallet/paystack-config', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { publicKey } = await configRes.json();

  // 2. Create order (returns PENDING order)
  const createRes = await fetch('/v1/orders/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...orderData,
      paymentMethod: 'paystack_inline',
    }),
  });

  const createData = await createRes.json();
  if (!createRes.ok) throw new Error(createData.error);

  const { order } = createData;

  // 3. Open Paystack popup
  const popup = new PaystackPop();
  const reference = `order_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  popup.newTransaction({
    key: publicKey,
    email: user.email || `${user.phone}@baza.ng`,
    amount: order.total,
    currency: 'NGN',
    reference,
    metadata: {
      user_id: user.id,
      purpose: 'order_payment',
      order_id: order.id,
    },
    onSuccess: async (txn) => {
      // 4. Verify payment on backend
      const verifyRes = await fetch(
        `/v1/orders/verify-payment?reference=${txn.reference}&orderId=${order.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await verifyRes.json();

      if (result.status === 'success') {
        // Order confirmed!
        console.log(result.order); // { status: "CONFIRMED", eta: "Tomorrow by 10am" }
      }
    },
    onCancel: () => {
      // Order stays PENDING — user can retry later
    },
    onError: (error) => {
      console.error('Payment error:', error);
    },
  });
}
```

**Create Response (201):**
```json
{
  "order": {
    "id": "order-uuid",
    "status": "PENDING",
    "total": 350000,
    "paymentMethod": "paystack_inline",
    "items": [...]
  },
  "message": "Order created. Complete payment with Paystack Inline, then call GET /v1/orders/verify-payment?reference=xxx&orderId=yyy"
}
```

---

## 4. Verify Payment Endpoint

After Paystack confirms payment (in Flow B or C), the frontend must call this endpoint to confirm the order.

```
GET /v1/orders/verify-payment?reference=<paystack_reference>&orderId=<order_uuid>
Authorization: Bearer <token>
```

**Success Response:**
```json
{
  "status": "success",
  "message": "Payment verified, order confirmed",
  "order": {
    "id": "order-uuid",
    "status": "CONFIRMED",
    "total": 350000,
    "eta": "Tomorrow by 10am",
    "paymentMethod": "paystack",
    "paymentReference": "order_ps_a1b2c3...",
    "items": [...]
  }
}
```

**Error Responses:**

| HTTP | Code | Meaning |
|------|------|---------|
| 400 | `MISSING_REFERENCE` | No `reference` query param |
| 400 | `MISSING_ORDER_ID` | No `orderId` query param |
| 404 | `NOT_FOUND` | Order doesn't exist or doesn't belong to user |
| 400 | `INVALID_ORDER_STATUS` | Order is not PENDING (e.g. already CANCELLED) |
| 502 | `VERIFICATION_FAILED` | Paystack API error |
| 400 | `PAYMENT_FAILED` | Paystack says payment wasn't successful |
| 400 | `AMOUNT_MISMATCH` | Paid amount ≠ order total |

**Idempotent:** Calling verify-payment twice for an already-confirmed order returns success without side effects.

---

## 5. Webhook Safety Net

The backend automatically handles `charge.success` webhooks from Paystack. If the user closes the browser after paying but before calling verify-payment, the webhook will:

1. Detect `purpose: "order_payment"` in the Paystack metadata
2. Find the PENDING order by its `payment_reference`
3. Confirm the order and record the wallet transaction

**Webhook URL (set in Paystack Dashboard):**
```
https://baza-chi.vercel.app/v1/webhooks/paystack
```

No frontend action needed — this is a backend safety net.

---

## 6. Complete React Component Example

```jsx
import { useState } from 'react';
import PaystackPop from '@paystack/inline-js';

export function Checkout({ cart, user, token, onOrderComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Build order data from cart
  const orderData = {
    items: cart.items.map((item) => ({
      itemType: item.type,
      name: item.name,
      emoji: item.emoji,
      qty: item.qty,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * item.qty,
    })),
    total: cart.items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0),
    note: cart.note,
    addressId: cart.addressId,
  };

  // ── WALLET PAYMENT ────────────────────────────────
  const handleWalletPay = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/v1/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...orderData, paymentMethod: 'wallet' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onOrderComplete(data.order, data.walletBalance);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── PAYSTACK INLINE PAYMENT ───────────────────────
  const handlePaystackPay = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get public key
      const configRes = await fetch('/v1/wallet/paystack-config', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { publicKey } = await configRes.json();

      // Create PENDING order
      const createRes = await fetch('/v1/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...orderData, paymentMethod: 'paystack_inline' }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error);

      const { order } = createData;
      const reference = `order_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

      // Open Paystack popup
      const popup = new PaystackPop();
      popup.newTransaction({
        key: publicKey,
        email: user.email || `${user.phone}@baza.ng`,
        amount: order.total,
        currency: 'NGN',
        reference,
        metadata: {
          user_id: user.id,
          purpose: 'order_payment',
          order_id: order.id,
        },
        onSuccess: async (txn) => {
          // Verify on backend
          const verifyRes = await fetch(
            `/v1/orders/verify-payment?reference=${txn.reference}&orderId=${order.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const result = await verifyRes.json();

          if (result.status === 'success') {
            onOrderComplete(result.order);
          } else {
            setError('Payment verification failed. Your order will be confirmed shortly via webhook.');
          }
          setLoading(false);
        },
        onCancel: () => {
          setError('Payment cancelled. Your order is saved — you can retry.');
          setLoading(false);
        },
        onError: (err) => {
          setError(`Payment error: ${err.message}`);
          setLoading(false);
        },
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Checkout — ₦{(orderData.total / 100).toLocaleString()}</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 12 }}>
        <button disabled={loading} onClick={handleWalletPay}>
          Pay from Wallet (₦{(user.walletBalance / 100).toLocaleString()})
        </button>

        <button disabled={loading} onClick={handlePaystackPay}>
          Pay with Card
        </button>
      </div>
    </div>
  );
}
```

---

## 7. Order Status Flow

```
PENDING → CONFIRMED → PREPARING → DISPATCHED → DELIVERED
   │
   └──→ CANCELLED
```

- **PENDING**: Order placed with Paystack payment method, awaiting payment.
- **CONFIRMED**: Payment verified. Order is being processed.
- **PREPARING**: Kitchen/warehouse is preparing the order.
- **DISPATCHED**: Order is out for delivery.
- **DELIVERED**: Order has been delivered.
- **CANCELLED**: Order was cancelled (only possible from PENDING).

---

## 8. API Reference Summary

### Order Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/v1/orders/create` | JWT | Create order with payment |
| `GET` | `/v1/orders/verify-payment` | JWT | Verify Paystack payment for order |
| `GET` | `/v1/orders/` | JWT | List user's orders (paginated) |
| `GET` | `/v1/orders/<id>` | JWT | Get order detail |

### Wallet Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/v1/wallet/balance` | JWT | Current wallet balance |
| `GET` | `/v1/wallet/transactions` | JWT | Transaction history |
| `GET` | `/v1/wallet/account` | JWT | DVA bank account details (auto-provisions if needed) |
| `GET` | `/v1/wallet/paystack-config` | JWT | Get Paystack public key |
| `POST` | `/v1/wallet/topup` | JWT | Server-init wallet topup |
| `GET` | `/v1/wallet/verify-topup` | JWT | Verify wallet topup payment |

### Webhook

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/v1/webhooks/paystack` | HMAC sig | Handles `charge.success`, `dedicatedaccount.assign.success` |

---

## 9.5. Bank Transfer Wallet Funding (DVA)

Every user gets a **dedicated bank account number** (Paystack DVA). Transfer money from any bank and it's credited automatically.

> Full details: [dva-bank-transfer.md](dva-bank-transfer.md)

### Fetch Account Details

```
GET /v1/wallet/account
Authorization: Bearer <token>
```

**Response:**
```json
{
  "accountNumber": "9876543210",
  "bankName": "Wema Bank",
  "accountName": "BAZA/JOHN DOE",
  "assigned": true,
  "walletBalance": 500000
}
```

If `assigned` is `false`, the DVA is still being provisioned. Poll again after a few seconds.

### React Component

```jsx
import { useState, useEffect } from 'react';

export function BankTransferFunding({ token }) {
  const [account, setAccount] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/v1/wallet/account', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setAccount);
  }, [token]);

  if (!account) return <p>Loading...</p>;
  if (!account.assigned) return <p>Setting up your bank account... please wait.</p>;

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(account.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
      <h3>Fund via Bank Transfer</h3>
      <p><strong>Bank:</strong> {account.bankName}</p>
      <p>
        <strong>Account Number:</strong>{' '}
        <span onClick={copyAccountNumber} style={{ cursor: 'pointer' }}>
          {account.accountNumber} {copied ? '✅' : '📋'}
        </span>
      </p>
      <p><strong>Account Name:</strong> {account.accountName}</p>
      <p style={{ color: '#718096', fontSize: 14, marginTop: 12 }}>
        Transfer any amount from any bank app. It will be credited to your
        wallet automatically.
      </p>
      <p><strong>Current Balance:</strong> ₦{(account.walletBalance / 100).toLocaleString()}</p>
    </div>
  );
}
```

### How Auto-Credit Works

1. User transfers money to their DVA account number from any bank
2. Paystack fires `charge.success` webhook with `channel: "dedicated_nuban"`
3. Backend identifies user by `customer_code`, credits wallet atomically
4. WebSocket broadcasts `wallet_credited` event for real-time UI update

### Listen for Real-Time Credit (WebSocket)

```js
const ws = new WebSocket(
  `wss://baza-chi.vercel.app/ws/orders/?token=${accessToken}`
);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'wallet_credited') {
    // Update wallet balance in your app state
    setWalletBalance(data.walletBalance);
    showToast(`Wallet funded! New balance: ₦${(data.walletBalance / 100).toLocaleString()}`);
  }
};
```

---

## 10. Error Handling Best Practices

```jsx
// Always check res.ok before parsing
const res = await fetch('/v1/orders/create', { ... });
const data = await res.json();

if (!res.ok) {
  switch (data.code) {
    case 'INSUFFICIENT_BALANCE':
      showTopUpPrompt();
      break;
    case 'EMPTY_CART':
      showEmptyCartMessage();
      break;
    case 'INVALID_TOTAL':
      showRecalculateMessage();
      break;
    case 'SERVICE_UNAVAILABLE':
      showMaintenanceMessage();
      break;
    default:
      showGenericError(data.error);
  }
  return;
}
```

---

## 11. Testing Checklist

Use these cURL commands to test against the backend:

### Check wallet balance
```bash
curl -s -H "Authorization: Bearer $TOKEN" https://baza-chi.vercel.app/v1/wallet/balance
```

### Get DVA bank account details
```bash
curl -s -H "Authorization: Bearer $TOKEN" https://baza-chi.vercel.app/v1/wallet/account
```

### Get wallet transaction history
```bash
curl -s -H "Authorization: Bearer $TOKEN" https://baza-chi.vercel.app/v1/wallet/transactions
```

### Create wallet order
```bash
curl -s -X POST https://baza-chi.vercel.app/v1/orders/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"itemType":"product","name":"Rice","emoji":"🍚","qty":1,"unitPrice":100000,"totalPrice":100000}],
    "total": 100000,
    "paymentMethod": "wallet"
  }'
```

### Create Paystack order
```bash
curl -s -X POST https://baza-chi.vercel.app/v1/orders/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"itemType":"product","name":"Rice","emoji":"🍚","qty":1,"unitPrice":100000,"totalPrice":100000}],
    "total": 100000,
    "paymentMethod": "paystack"
  }'
```

### Verify order payment
```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://baza-chi.vercel.app/v1/orders/verify-payment?reference=REF_HERE&orderId=ORDER_ID_HERE"
```
