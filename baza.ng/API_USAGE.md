# API Usage (Baza Backend)

## Base URLs

| Environment | URL |
|-------------|-----|
| Production | `https://baza-chi.vercel.app/v1` |
| Local | `http://localhost:8000/v1` |

**All prices** are in kobo (₦1 = 100 kobo). Never send naira floats to the API.

---

## Authentication

The backend uses **Supabase Auth** for phone OTP verification (SMS delivery + OTP validation).
Supabase handles OTP generation, storage, expiry, and SMS delivery.
The backend issues its own JWT access/refresh tokens and manages its own user model.

**Setup:** Enable Phone Auth in Supabase Dashboard → Authentication → Providers → Phone,
then configure an SMS provider (e.g. Twilio) in the same panel.

### POST /v1/auth/otp-request

Request OTP. Rate limited: 3 requests per phone per 10 minutes.

```bash
curl -X POST https://baza-chi.vercel.app/v1/auth/otp-request \
  -H "Content-Type: application/json" \
  -d '{"phone": "+2348012345678"}'
```

**Response 200:**
```json
{ "message": "OTP sent", "expiresIn": 300 }
```

**Errors:** `429` — `RATE_LIMIT_EXCEEDED`

---

### POST /v1/auth/otp-verify

Verify OTP. Creates account if new user. Returns access token + sets refresh cookie.

```bash
curl -X POST https://baza-chi.vercel.app/v1/auth/otp-verify \
  -H "Content-Type: application/json" \
  -d '{"phone": "+2348012345678", "otp": "482910", "name": "Thrive", "referralCode": "THRIVE200"}'
```

- `name` — only required on first signup
- `referralCode` — optional, on signup only

**Response 200:**
```json
{
  "accessToken": "eyJhbG...",
  "user": {
    "id": "209abc40-...",
    "name": "Thrive",
    "phone": "+2348012345678",
    "memberSince": "2024-01-15T00:00:00Z",
    "walletBalance": 0,
    "accountNumber": null,
    "bankName": "Providus Bank",
    "accountName": "Baza NG Ltd",
    "referralCode": "558b980b0bb2"
  }
}
```

Sets `baza_refresh` HttpOnly cookie (30-day TTL). Do not store accessToken anywhere except memory.

**Errors:** `400` — `INVALID_OTP` | `OTP_EXPIRED` | `INVALID_REFERRAL`

---

### POST /v1/auth/refresh

Get new access token using the `baza_refresh` cookie. No body required.

```bash
curl -X POST https://baza-chi.vercel.app/v1/auth/refresh \
  -b "baza_refresh=eyJhbG..."
```

**Response 200:**
```json
{ "accessToken": "eyJhbG..." }
```

**Errors:** `401` — `REFRESH_TOKEN_INVALID` | `REFRESH_TOKEN_EXPIRED`

---

### POST /v1/auth/logout

Blacklist refresh token. Clears the cookie.

```bash
curl -X POST https://baza-chi.vercel.app/v1/auth/logout \
  -H "Authorization: Bearer <accessToken>" \
  -b "baza_refresh=eyJhbG..."
```

**Response 200:**
```json
{ "message": "Logged out" }
```

---

### Environment Variables (Auth)

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
JWT_SECRET=your-jwt-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRY_MINUTES=15
REFRESH_TOKEN_EXPIRY_DAYS=30
```

---

## Protected Routes

All protected endpoints require:

```
Authorization: Bearer <accessToken>
```

| Protected | Public |
|-----------|--------|
| `/v1/products/*` | `/v1/auth/*` |
| `/v1/user/*` | `/v1/webhooks/*` |
| `/v1/orders/*` | |
| `/v1/wallet/*` | |
| `/v1/referral/*` | |
| `/v1/support/*` | |

---

## User Endpoints

### GET /v1/user/me

Get full user profile.

```bash
curl https://baza-chi.vercel.app/v1/user/me \
  -H "Authorization: Bearer <accessToken>"
```

**Response 200:**
```json
{
  "id": "209abc40-...",
  "name": "Baza Tester",
  "phone": "+2348012345678",
  "email": "tester@baza.ng",
  "memberSince": "2024-01-15T00:00:00Z",
  "walletBalance": 0,
  "accountNumber": null,
  "bankName": "Providus Bank",
  "accountName": "Baza NG Ltd",
  "referralCode": "558b980b0bb2",
  "notifications": {
    "orders": true,
    "delivery": true,
    "deals": true,
    "reminders": false,
    "newsletter": false
  }
}
```

---

### PUT /v1/user/profile

Update name or email.

```bash
curl -X PUT https://baza-chi.vercel.app/v1/user/profile \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Thrive O.", "email": "newemail@example.com"}'
```

**Response 200:** Updated user object (same shape as GET /user/me).

---

### PUT /v1/user/notifications

Update notification preferences.

```bash
curl -X PUT https://baza-chi.vercel.app/v1/user/notifications \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"orders": true, "delivery": true, "deals": false, "reminders": true, "newsletter": false}'
```

**Response 200:**
```json
{
  "notifications": {
    "orders": true,
    "delivery": true,
    "deals": false,
    "reminders": true,
    "newsletter": false
  }
}
```

---

## Address Endpoints (all protected)

### GET /v1/user/addresses/

List all addresses for authenticated user.

```bash
curl https://baza-chi.vercel.app/v1/user/addresses/ \
  -H "Authorization: Bearer <accessToken>"
```

**Response 200:**
```json
{
  "addresses": [
    {
      "id": "6b4d778b-...",
      "label": "Home",
      "address": "14 Akin Adesola Street, Victoria Island",
      "landmark": "Near Access Bank",
      "isDefault": true
    }
  ]
}
```

---

### POST /v1/user/addresses/create

Create a new address. First address is automatically set as default.

```bash
curl -X POST https://baza-chi.vercel.app/v1/user/addresses/create \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"label": "Office", "address": "Eko Atlantic, Block 3A", "landmark": "Next to Civic Tower"}'
```

**Response 201:** New address object.

---

### PUT /v1/user/addresses/:id

Update an existing address. Send any subset of `{ label, address, landmark }`.

```bash
curl -X PUT https://baza-chi.vercel.app/v1/user/addresses/<address_id> \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"label": "Office HQ", "landmark": "Eko Hotel"}'
```

**Response 200:** Updated address object.

---

### PATCH /v1/user/addresses/:id/default

Set this address as default, unsets all others.

```bash
curl -X PATCH https://baza-chi.vercel.app/v1/user/addresses/<address_id>/default \
  -H "Authorization: Bearer <accessToken>"
```

**Response 200:**
```json
{ "message": "Default address updated" }
```

---

### DELETE /v1/user/addresses/:id/delete

Delete an address.

```bash
curl -X DELETE https://baza-chi.vercel.app/v1/user/addresses/<address_id>/delete \
  -H "Authorization: Bearer <accessToken>"
```

**Response 200:**
```json
{ "message": "Address deleted" }
```

---

## Product Endpoints (all protected)

### GET /v1/products/bundles

Returns all active Stock Up bundles.

```bash
curl https://baza-chi.vercel.app/v1/products/bundles \
  -H "Authorization: Bearer <accessToken>"
```

**Response 200:**
```json
{
  "bundles": [
    {
      "id": "b1",
      "name": "Breakfast Bundle",
      "emoji": "🌅",
      "description": "Everything for a solid week of breakfasts",
      "basePrice": 1840000,
      "savings": 22,
      "color": "#f5a623",
      "tags": ["Feeds 4", "7 days"],
      "items": [
        {
          "id": "i1",
          "productId": "prod_i1",
          "name": "Rolled Oats 1kg",
          "emoji": "🌾",
          "unitPrice": 180000,
          "defaultQty": 1,
          "minQty": 0,
          "maxQty": 5
        }
      ]
    }
  ]
}
```

---

### GET /v1/products/mealpacks

Returns all active Cook a Meal packs.

```bash
curl https://baza-chi.vercel.app/v1/products/mealpacks \
  -H "Authorization: Bearer <accessToken>"
```

**Response 200:**
```json
{
  "mealPacks": [
    {
      "id": "m1",
      "name": "Jollof Pack",
      "emoji": "🍚",
      "description": "Everything for a full pot of party jollof",
      "baseTime": 45,
      "basePlates": 4,
      "basePrice": 890000,
      "color": "#e85c3a",
      "ingredients": [...]
    }
  ]
}
```

---

### GET /v1/products/readyeat

Returns all active Ready to Eat items.

```bash
curl https://baza-chi.vercel.app/v1/products/readyeat \
  -H "Authorization: Bearer <accessToken>"
```

---

### GET /v1/products/snacks

Returns all active Snacks & Drinks items.

**Query params:** `?category=Snacks` (optional — Snacks | Breads | Drinks)

```bash
curl "https://baza-chi.vercel.app/v1/products/snacks?category=Snacks" \
  -H "Authorization: Bearer <accessToken>"
```

---

### GET /v1/products/restock

Returns Shop Your List items.

**Query params:** `?category=Grains&q=rice` (both optional, combinable)

```bash
curl "https://baza-chi.vercel.app/v1/products/restock?category=Grains&q=rice" \
  -H "Authorization: Bearer <accessToken>"
```

---

### POST /v1/products/import-smallproducts (admin only)

Import product rows programmatically.

```bash
curl -X POST https://baza-chi.vercel.app/v1/products/import-smallproducts \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"products":[{"id":"r999","name":"Sample","brand":"Demo","emoji":"🧪","price":1000,"category":"Testing"}]}'
```

---

## Order Endpoints (all protected)

### POST /v1/orders/create

Create order, deduct wallet, record transaction. Uses a single DB transaction.

```bash
curl -X POST https://baza-chi.vercel.app/v1/orders/create \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "itemType": "product",
        "productId": "r7",
        "name": "Golden Penny Rice 5kg",
        "emoji": "🌾",
        "qty": 2,
        "unitPrice": 720000,
        "totalPrice": 1440000
      }
    ],
    "total": 1440000,
    "note": "Leave at gate, ring twice",
    "addressId": "6b4d778b-..."
  }'
```

**Response 201:**
```json
{
  "order": {
    "id": "6fc40e1b-...",
    "status": "CONFIRMED",
    "total": 1440000,
    "note": "Leave at gate, ring twice",
    "eta": "Tomorrow by 10am",
    "items": [
      {
        "name": "Golden Penny Rice 5kg",
        "emoji": "🌾",
        "qty": 2,
        "itemType": "product",
        "unitPrice": 720000,
        "totalPrice": 1440000,
        "meta": null
      }
    ],
    "createdAt": "2024-02-24T10:30:00Z"
  },
  "walletBalance": 2170000
}
```

**Errors:** `400` — `INSUFFICIENT_BALANCE` | `EMPTY_CART`

---

### GET /v1/orders/

Get order history for authenticated user.

**Query params:** `?page=1&limit=20&status=CONFIRMED`

```bash
curl "https://baza-chi.vercel.app/v1/orders/?page=1&limit=20" \
  -H "Authorization: Bearer <accessToken>"
```

**Response 200:**
```json
{
  "orders": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### GET /v1/orders/:id

Get single order detail.

```bash
curl https://baza-chi.vercel.app/v1/orders/<order_id> \
  -H "Authorization: Bearer <accessToken>"
```

**Response 200:** Full order object with all item details.

---

## Wallet Endpoints (all protected)

### GET /v1/wallet/paystack-config

Returns the Paystack public key for frontend Inline JS integration.

```bash
curl https://baza-chi.vercel.app/v1/wallet/paystack-config \
  -H "Authorization: Bearer <accessToken>"
```

**Response 200:**
```json
{
  "publicKey": "pk_live_xxxxxxxxxxxxxxx"
}
```

---

### Wallet Top-Up — Paystack Inline Flow (Recommended)

This is the primary payment flow. The frontend handles the Paystack popup, the backend only verifies.

**Step 1 — Frontend opens Paystack Inline popup:**

```js
import PaystackPop from '@paystack/inline-js';

const popup = new PaystackPop();
popup.newTransaction({
  key: publicKey,           // from GET /v1/wallet/paystack-config
  email: user.email,        // or `${user.phone}@baza.ng`
  amount: 500000,           // ₦5,000 in kobo
  currency: 'NGN',
  reference: `topup_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
  metadata: {
    user_id: user.id,       // IMPORTANT: include for webhook fallback
    purpose: 'wallet_topup',
  },
  onSuccess: (transaction) => {
    // Step 2: verify on backend
    verifyPayment(transaction.reference);
  },
  onCancel: () => {
    console.log('User cancelled payment');
  },
});
```

**Step 2 — Frontend calls backend to verify & credit wallet:**

```bash
curl "https://baza-chi.vercel.app/v1/wallet/verify-topup?reference=topup_xxx" \
  -H "Authorization: Bearer <accessToken>"
```

**Response 200:**
```json
{
  "status": "success",
  "message": "Wallet credited",
  "walletBalance": 2950000,
  "amount": 500000
}
```

---

### Wallet Top-Up — Server-Init Flow (Alternative)

Backend initialises the transaction, frontend completes it with `resumeTransaction()`.

**Step 1 — POST /v1/wallet/topup:**

```bash
curl -X POST https://baza-chi.vercel.app/v1/wallet/topup \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 500000, "callbackUrl": "https://yourapp.com/callback"}'
```

**Response 200:**
```json
{
  "authorizationUrl": "https://checkout.paystack.com/xxxxx",
  "accessCode": "0peioxfhpn",
  "reference": "topup_abc123"
}
```

**Step 2 — Frontend completes payment:**

```js
const popup = new PaystackPop();
popup.resumeTransaction(accessCode);
```

**Step 3 — Verify on backend (same as Inline flow):**

```bash
curl "https://baza-chi.vercel.app/v1/wallet/verify-topup?reference=topup_abc123" \
  -H "Authorization: Bearer <accessToken>"
```

---

### GET /v1/wallet/balance

```bash
curl https://baza-chi.vercel.app/v1/wallet/balance \
  -H "Authorization: Bearer <accessToken>"
```

**Response 200:**
```json
{
  "balance": 2450000,
  "accountNumber": "2038471659",
  "bankName": "Providus Bank",
  "accountName": "Baza NG Ltd"
}
```

---

### GET /v1/wallet/transactions

**Query params:** `?page=1&limit=20`

```bash
curl "https://baza-chi.vercel.app/v1/wallet/transactions?page=1&limit=20" \
  -H "Authorization: Bearer <accessToken>"
```

**Response 200:**
```json
{
  "transactions": [
    {
      "id": "clx...",
      "amount": 1000000,
      "type": "CREDIT_TRANSFER",
      "description": "Bank transfer — Providus",
      "reference": "pay_abc123",
      "createdAt": "2024-02-24T09:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 0, "totalPages": 0, "hasNext": false, "hasPrev": false }
}
```

---

## Referral Endpoints (protected)

### GET /v1/referral/stats

```bash
curl https://baza-chi.vercel.app/v1/referral/stats \
  -H "Authorization: Bearer <accessToken>"
```

**Response 200:**
```json
{
  "code": "558b980b0bb2",
  "totalReferrals": 5,
  "pendingCredits": 200000,
  "paidCredits": 800000,
  "referrals": [
    {
      "name": "Ada",
      "joinedAt": "2024-02-10T00:00:00Z",
      "firstOrderPlaced": true,
      "creditEarned": 200000
    }
  ]
}
```

Referral bonus (₦2,000 for referrer, ₦1,000 for referred) is triggered automatically when a referred user places their first order.

---

## Support Chat Endpoints (all protected)

### GET /v1/support/thread

Get conversation history for authenticated user.

```bash
curl https://baza-chi.vercel.app/v1/support/thread \
  -H "Authorization: Bearer <accessToken>"
```

**Response 200:**
```json
{
  "messages": [
    {
      "id": "clx...",
      "text": "Hey! I'm Baza's support assistant.",
      "sender": "AI",
      "flagged": false,
      "createdAt": "2024-02-24T10:00:00Z"
    }
  ],
  "humanJoined": false
}
```

---

### POST /v1/support/message

Send a message. AI responds automatically. Flags conversation if keywords indicate escalation.

```bash
curl -X POST https://baza-chi.vercel.app/v1/support/message \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"text": "My order is wrong, something was missing"}'
```

**Response 200:**
```json
{
  "userMessage": { "id": "...", "text": "My order is wrong...", "sender": "USER" },
  "aiReply": {
    "id": "...",
    "text": "Thanks for reaching out! I'm here to help. Could you provide more details about your question?",
    "sender": "AI",
    "flagged": false
  },
  "humanJoined": false,
  "flagged": false
}
```

---

## Webhooks

### POST /v1/webhooks/paystack

**Public route — no auth required.** Paystack signs the request body with your secret key using HMAC-SHA512. The signature is in the `x-paystack-signature` header.

**Setup:** Go to Paystack Dashboard → Settings → API Keys & Webhooks → set Webhook URL to:
```
https://baza-chi.vercel.app/v1/webhooks/paystack
```

Handled events:
- `charge.success` — card/bank payment succeeded → wallet credited automatically

The webhook serves as a **fallback** to the verify-topup endpoint. If the user closes the browser before the frontend calls verify, the webhook still processes the payment. Both are **idempotent** — a payment is never double-credited.

---

## Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `INVALID_OTP` | 400 | Wrong OTP entered |
| `OTP_EXPIRED` | 400 | OTP older than 5 minutes |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `UNAUTHORIZED` | 401 | Missing or invalid access token |
| `REFRESH_TOKEN_INVALID` | 401 | Bad refresh token |
| `REFRESH_TOKEN_EXPIRED` | 401 | Refresh token past 30 days |
| `INSUFFICIENT_BALANCE` | 400 | Wallet balance too low for order |
| `EMPTY_CART` | 400 | Order submitted with no items |
| `NOT_FOUND` | 404 | Resource not found |
| `MISSING_FIELDS` | 400 | Required fields not provided |
| `METHOD_NOT_ALLOWED` | 405 | Wrong HTTP method |
| `SERVER_ERROR` | 500 | Unexpected error |

---

## Pagination Convention

All list endpoints accept `?page=1&limit=20`. Default limit: 20. Max limit: 100.

```json
"pagination": {
  "page": 1,
  "limit": 20,
  "total": 47,
  "totalPages": 3,
  "hasNext": true,
  "hasPrev": false
}
```

---

## Deployment

### Vercel (Production)

The project is deployed on Vercel with Neon PostgreSQL.

- **URL:** https://baza-chi.vercel.app
- **Runtime:** Python 3.12 (`@vercel/python`)
- **Database:** Neon PostgreSQL (via Vercel Storage)
- **Static files:** WhiteNoise (served through Django WSGI)
- **Config:** `vercel.json` → single build from `config/wsgi.py`, catch-all route

Deploy:
```bash
npx vercel --prod --yes
```

Push env vars:
```bash
echo "value" | npx vercel env add VAR_NAME production
```

Run migrations against Neon:
```bash
DATABASE_URL="postgresql://..." python manage.py migrate
```

### Local Development

```bash
brew services start postgresql@15
python manage.py migrate
python manage.py runserver
```

## Django Admin

- **Production:** https://baza-chi.vercel.app/admin/
- **Local:** http://localhost:8000/admin/
- Login with **phone** as username (custom user model).

Create superuser:
```bash
python manage.py createsuperuser
```

### Admin Seed Action

Seeding uses a separate script file (`add-smallducuts.py`):

```bash
ACCESS_TOKEN="<access_token>" python add-smallducuts.py
```

Products admin includes action: **Clear full catalog data (confirm)**.
