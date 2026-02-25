# Paystack Inline Payment Integration

## Overview

Baza uses **Paystack Inline JS** for wallet top-ups. The frontend handles the payment popup, the backend verifies and credits the wallet. A webhook provides a safety net for payments that aren't verified via the API (e.g. user closes browser after paying).

## Architecture

```
┌───────────┐     ┌──────────────────┐     ┌──────────────┐
│  Frontend │────▶│  Paystack Popup   │────▶│  Paystack    │
│  (React)  │     │  (Inline JS v2)   │     │  API         │
└─────┬─────┘     └──────────────────┘     └──────┬───────┘
      │                                           │
      │ onSuccess(reference)                      │ charge.success webhook
      ▼                                           ▼
┌─────┴─────────────────────────────────────────────────────┐
│  Django Backend                                           │
│  GET /v1/wallet/verify-topup?reference=xxx                │
│  POST /v1/webhooks/paystack                               │
│  → Verify with Paystack API → Credit wallet atomically    │
└───────────────────────────────────────────────────────────┘
```

## Payment Flows

### Flow A: Paystack Inline (Recommended)

1. Frontend calls `GET /v1/wallet/paystack-config` to get the public key
2. Frontend opens Paystack popup using `PaystackPop.newTransaction()` with:
   - `key`: public key from step 1
   - `email`: user's email
   - `amount`: amount in kobo (₦1 = 100 kobo)
   - `metadata.user_id`: current user's ID (required for webhook fallback)
3. User completes payment in the popup
4. `onSuccess` callback fires with `{ reference }` 
5. Frontend calls `GET /v1/wallet/verify-topup?reference=xxx`
6. Backend verifies with Paystack Verify API, creates WalletTransaction, credits wallet

### Flow B: Server-Init + resumeTransaction

1. Frontend calls `POST /v1/wallet/topup` with `{ "amount": 500000 }`
2. Backend calls Paystack Initialize Transaction API
3. Backend returns `{ authorizationUrl, accessCode, reference }`
4. Frontend calls `popup.resumeTransaction(accessCode)`
5. User completes payment
6. Frontend calls `GET /v1/wallet/verify-topup?reference=xxx`
7. Backend verifies and credits wallet

## Frontend Integration

### Install Paystack Inline JS

```html
<!-- CDN -->
<script src="https://js.paystack.co/v2/inline.js"></script>
```

Or via npm:
```bash
npm install @paystack/inline-js
```

### React Example (Flow A)

```jsx
import PaystackPop from '@paystack/inline-js';

function WalletTopUp({ user, token, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleTopUp = async (amountKobo) => {
    setLoading(true);

    // 1. Get public key from backend
    const configRes = await fetch('/v1/wallet/paystack-config', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { publicKey } = await configRes.json();

    // 2. Open Paystack popup
    const popup = new PaystackPop();
    popup.newTransaction({
      key: publicKey,
      email: user.email || `${user.phone}@baza.ng`,
      amount: amountKobo,
      currency: 'NGN',
      reference: `topup_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      metadata: {
        user_id: user.id,
        purpose: 'wallet_topup',
      },
      onSuccess: async (transaction) => {
        // 3. Verify on backend
        const verifyRes = await fetch(
          `/v1/wallet/verify-topup?reference=${transaction.reference}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const result = await verifyRes.json();
        if (result.status === 'success') {
          onSuccess(result.walletBalance);
        }
        setLoading(false);
      },
      onCancel: () => {
        setLoading(false);
      },
      onError: (error) => {
        console.error('Payment error:', error);
        setLoading(false);
      },
    });
  };

  return (
    <div>
      {[5000, 10000, 20000, 50000, 100000].map((amt) => (
        <button
          key={amt}
          disabled={loading}
          onClick={() => handleTopUp(amt * 100)} // Convert naira to kobo
        >
          ₦{amt.toLocaleString()}
        </button>
      ))}
    </div>
  );
}
```

## API Endpoints

### GET /v1/wallet/paystack-config

Returns the Paystack public key.

**Response:**
```json
{ "publicKey": "pk_live_xxxxxxxxxxxxxxx" }
```

### POST /v1/wallet/topup

Server-init flow — creates a Paystack transaction.

**Request:**
```json
{ "amount": 500000, "callbackUrl": "https://yourapp.com/callback" }
```

**Response:**
```json
{
  "authorizationUrl": "https://checkout.paystack.com/xxxxx",
  "accessCode": "0peioxfhpn",
  "reference": "topup_abc123"
}
```

### GET /v1/wallet/verify-topup?reference=xxx

Verifies a Paystack payment and credits the wallet. Works for both Flow A and Flow B. Idempotent.

**Response (success):**
```json
{
  "status": "success",
  "message": "Wallet credited",
  "walletBalance": 2950000,
  "amount": 500000
}
```

### POST /v1/webhooks/paystack

Paystack webhook handler. Automatically credits wallet on `charge.success` events.

## Webhook Setup

1. Go to **Paystack Dashboard** → **Settings** → **API Keys & Webhooks**
2. Set **Webhook URL** to: `https://baza-chi.vercel.app/v1/webhooks/paystack`
3. Paystack uses your **secret key** to sign webhooks with HMAC-SHA512
4. The backend verifies the `x-paystack-signature` header before processing

## Idempotency & Safety

- **verify-topup** and **webhook** both use `get_or_create` with the reference as the unique key
- If both fire for the same payment, only one will credit the wallet
- Calling verify-topup twice returns `"Already credited"` without double-crediting
- All wallet mutations are wrapped in `transaction.atomic()` 

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PAYSTACK_SECRET_KEY` | Secret key from Paystack dashboard (starts with `sk_`) |
| `PAYSTACK_PUBLIC_KEY` | Public key from Paystack dashboard (starts with `pk_`) |

## Testing

Run the integration test script:

```bash
export AUTH_TOKEN=<your_jwt_access_token>
export BASE_URL=https://baza-chi.vercel.app  # or http://localhost:8000
python test_paystack.py
```

## Amount Convention

All amounts are in **kobo** (₦1 = 100 kobo). Never send naira floats.

| Display | Kobo Value |
|---------|------------|
| ₦500    | 50000      |
| ₦1,000  | 100000     |
| ₦5,000  | 500000     |
| ₦10,000 | 1000000    |
