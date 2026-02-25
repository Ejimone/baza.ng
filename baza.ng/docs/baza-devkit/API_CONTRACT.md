# Baza.ng — API Contract
### All endpoints, request shapes, response shapes, error codes

**Base URL:** `https://api.baza.ng/v1` (Railway deploy)  
**Dev URL:** `http://localhost:3001/v1`  
**All prices:** in kobo (₦1 = 100 kobo). Never send naira floats to the API.  
**Auth:** Bearer token in `Authorization` header for all protected routes.  
**Errors:** Always return `{ error: string, code: string }`.

---

## AUTH

### POST /auth/otp-request
Request OTP. Rate limited: 3 requests per phone per 10 minutes.

**Request:**
```json
{
  "phone": "+2348012345678"
}
```

**Response 200:**
```json
{
  "message": "OTP sent",
  "expiresIn": 300
}
```

**Errors:**
- `429` — `RATE_LIMIT_EXCEEDED` — too many OTP requests

---

### POST /auth/otp-verify
Verify OTP. Creates account if new user. Returns tokens.

**Request:**
```json
{
  "phone": "+2348012345678",
  "otp": "482910",
  "name": "Thrive",               // only on signup
  "referralCode": "THRIVE200"     // optional, on signup only
}
```

**Response 200:**
```json
{
  "accessToken": "eyJhbG...",
  "user": {
    "id": "clx...",
    "name": "Thrive",
    "phone": "+2348012345678",
    "memberSince": "2024-01-15T00:00:00Z",
    "walletBalance": 0,
    "accountNumber": "2038471659",
    "bankName": "Providus Bank",
    "accountName": "Baza NG Ltd",
    "referralCode": "THRIVE200"
  }
}
```

Note: refresh token is set as HttpOnly cookie `baza_refresh`. Do not store accessToken anywhere except memory.

**Errors:**
- `400` — `INVALID_OTP` — wrong OTP
- `400` — `OTP_EXPIRED` — OTP older than 5 minutes
- `400` — `INVALID_REFERRAL` — referral code doesn't exist (non-blocking — just don't apply it)

---

### POST /auth/refresh
Get new access token using refresh token cookie.

**Request:** no body (sends `baza_refresh` cookie automatically)

**Response 200:**
```json
{
  "accessToken": "eyJhbG..."
}
```

**Errors:**
- `401` — `REFRESH_TOKEN_INVALID`
- `401` — `REFRESH_TOKEN_EXPIRED`

---

### POST /auth/logout
Blacklist refresh token.

**Request:** no body

**Response 200:**
```json
{ "message": "Logged out" }
```

---

## USER

### GET /user/me *(protected)*
Get full user profile.

**Response 200:**
```json
{
  "id": "clx...",
  "name": "Thrive",
  "phone": "+2348012345678",
  "email": "thrive@example.com",
  "memberSince": "2024-01-15T00:00:00Z",
  "walletBalance": 2450000,
  "accountNumber": "2038471659",
  "bankName": "Providus Bank",
  "accountName": "Baza NG Ltd",
  "referralCode": "THRIVE200",
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

### PUT /user/profile *(protected)*
Update name or email.

**Request:**
```json
{
  "name": "Thrive O.",
  "email": "newemail@example.com"
}
```

**Response 200:** updated user object (same shape as GET /user/me)

---

### PUT /user/password *(protected)*
Change password. Requires current password.

**Request:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response 200:** `{ "message": "Password updated" }`

**Errors:**
- `400` — `INCORRECT_PASSWORD`
- `400` — `PASSWORD_TOO_WEAK` — less than 8 chars

---

### POST /user/phone-change-request *(protected)*
Start phone number change. Sends OTP to new number.

**Request:** `{ "newPhone": "+2348087654321" }`  
**Response 200:** `{ "message": "OTP sent to new number" }`

---

### POST /user/phone-change-verify *(protected)*
**Request:** `{ "newPhone": "+2348087654321", "otp": "291847" }`  
**Response 200:** updated user object

---

### PUT /user/notifications *(protected)*

**Request:**
```json
{
  "orders": true,
  "delivery": true,
  "deals": false,
  "reminders": true,
  "newsletter": false
}
```

**Response 200:** `{ "notifications": { ...updated prefs } }`

---

## ADDRESSES *(all protected)*

### GET /user/addresses
**Response 200:**
```json
{
  "addresses": [
    {
      "id": "clx...",
      "label": "Home",
      "address": "14 Akin Adesola Street, Victoria Island",
      "landmark": "Near Access Bank",
      "isDefault": true
    }
  ]
}
```

---

### POST /user/addresses

**Request:**
```json
{
  "label": "Office",
  "address": "Eko Atlantic, Block 3A",
  "landmark": "Next to Civic Tower"
}
```

**Response 201:** new address object

---

### PUT /user/addresses/:id

**Request:** any subset of `{ label, address, landmark }`  
**Response 200:** updated address object

---

### PATCH /user/addresses/:id/default
Sets this address as default, unsets all others.  
**Response 200:** `{ "message": "Default address updated" }`

---

### DELETE /user/addresses/:id
**Response 200:** `{ "message": "Address deleted" }`

---

## PRODUCTS *(all protected)*

### GET /products/bundles
Returns all active Stock Up bundles.

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

### GET /products/mealpacks
Returns all active Cook a Meal packs.

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
      "ingredients": [
        {
          "name": "Long grain rice",
          "emoji": "🌾",
          "unit": "cups",
          "perPlate": 0.5,
          "pricePerPlate": 45000
        }
      ]
    }
  ]
}
```

---

### GET /products/readyeat
Returns all active Ready to Eat items.

**Query params:** none (all items returned, client filters)

**Response 200:**
```json
{
  "items": [
    {
      "id": "re1",
      "name": "Jollof Rice + Chicken",
      "kitchen": "Mama Titi's Kitchen",
      "emoji": "🍛",
      "price": 380000,
      "oldPrice": 450000,
      "deliveryTime": "20–35 min",
      "tags": ["Bestseller", "Spicy available"],
      "description": "Party jollof, smoky and rich.",
      "color": "#e85c3a"
    }
  ]
}
```

---

### GET /products/snacks
Returns all active Snacks & Drinks items.

**Query params:** `?category=Snacks` (optional, filters by Snacks | Breads | Drinks)

**Response 200:**
```json
{
  "items": [
    {
      "id": "q1",
      "name": "Egg Roll × 2",
      "emoji": "🥚",
      "price": 80000,
      "category": "Snacks",
      "tag": "Hot & fresh",
      "color": "#f5a623"
    }
  ]
}
```

---

### GET /products/restock
Returns Shop Your List items.

**Query params:** `?category=Grains&q=rice` (both optional, combinable)

**Response 200:**
```json
{
  "items": [
    {
      "id": "r7",
      "name": "Golden Penny Rice 5kg",
      "brand": "Golden Penny",
      "emoji": "🌾",
      "price": 720000,
      "category": "Grains"
    }
  ],
  "categories": ["All", "Grains", "Protein", "Cooking", "Seasoning", "Dairy", "Staples", "Household"]
}
```

---

## ORDERS *(all protected)*

### POST /orders
Create order, deduct wallet, record transaction. This must be a single DB transaction.

**Request:**
```json
{
  "items": [
    {
      "itemType": "product",
      "productId": "r7",
      "name": "Golden Penny Rice 5kg",
      "emoji": "🌾",
      "qty": 2,
      "unitPrice": 720000,
      "totalPrice": 1440000
    },
    {
      "itemType": "mealpack",
      "name": "Jollof Pack",
      "emoji": "🍚",
      "qty": 1,
      "unitPrice": 890000,
      "totalPrice": 890000,
      "meta": {
        "plates": 4,
        "removedItems": ["Chicken"]
      }
    }
  ],
  "total": 2330000,
  "note": "Leave at gate, ring twice",
  "addressId": "clx..."
}
```

**Response 201:**
```json
{
  "order": {
    "id": "ORD-482910",
    "status": "CONFIRMED",
    "total": 2330000,
    "eta": "Tomorrow by 10am",
    "items": [...],
    "createdAt": "2024-02-24T10:30:00Z"
  },
  "walletBalance": 2170000
}
```

**Errors:**
- `400` — `INSUFFICIENT_BALANCE` — wallet balance < total
- `400` — `EMPTY_CART`
- `400` — `ITEM_UNAVAILABLE` — one or more items no longer active

---

### GET /orders
Get order history for authenticated user.

**Query params:** `?page=1&limit=20&status=CONFIRMED`

**Response 200:**
```json
{
  "orders": [
    {
      "id": "ORD-482910",
      "status": "CONFIRMED",
      "total": 2330000,
      "note": "Leave at gate",
      "eta": "Tomorrow by 10am",
      "items": [
        { "name": "Golden Penny Rice 5kg", "emoji": "🌾", "qty": 2 }
      ],
      "createdAt": "2024-02-24T10:30:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 3 }
}
```

---

### GET /orders/:id
Get single order detail.

**Response 200:** Full order object with all item details.

---

## WALLET *(all protected)*

### GET /wallet/balance

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

### GET /wallet/transactions

**Query params:** `?page=1&limit=20`

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
  "pagination": { ... }
}
```

---

### POST /wallet/topup
Top up via Paystack card payment (not DVA transfer — that comes via webhook).

**Request:**
```json
{
  "amount": 1000000,
  "callbackUrl": "bazang://wallet/topup-success"
}
```

**Response 200:**
```json
{
  "authorizationUrl": "https://checkout.paystack.com/...",
  "reference": "pay_abc123"
}
```

Open `authorizationUrl` in a WebView. On success Paystack redirects to `callbackUrl`. Verify via GET /wallet/verify-topup.

---

### GET /wallet/verify-topup?reference=pay_abc123
Called after Paystack card payment redirect. Verifies transaction server-side.

**Response 200:**
```json
{
  "status": "success",
  "amount": 1000000,
  "walletBalance": 3450000
}
```

---

## PAYSTACK WEBHOOK

### POST /webhooks/paystack
**This route must NOT require auth.** Verify using Paystack HMAC-SHA512 signature in `x-paystack-signature` header.

**Handled events:**

`dedicated_account.credit` — user transferred to DVA:
- Verify signature
- Find user by `data.customer.email` or `data.dedicated_account.account_number`
- Create WalletTransaction (CREDIT_TRANSFER)
- Increment user.walletBalance atomically
- Return 200 immediately (Paystack retries if non-200)

`charge.success` — card payment succeeded:
- Verify signature
- Match by `data.reference`
- Create WalletTransaction (CREDIT_CARD)
- Increment walletBalance
- Return 200

**Signature verification (Node.js):**
```typescript
import crypto from 'crypto';

function verifyPaystackSignature(payload: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(payload)
    .digest('hex');
  return hash === signature;
}
```

---

## REFERRAL

### GET /referral/stats *(protected)*
**Response 200:**
```json
{
  "code": "THRIVE200",
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

---

### POST /referral/claim *(called internally)*
Called automatically when a referred user places their first order. Not a public endpoint — triggered from `POST /orders` handler.

Logic:
1. Check if user was referred (user.referredBy is set)
2. Check if this is their first order (orders.count === 1)
3. If yes: create WalletTransaction (CREDIT_REFERRAL) for the referrer, increment their walletBalance by 200000 (₦2000)
4. Also give referred user 100000 (₦1000) credit

---

## SUPPORT CHAT *(all protected)*

### GET /support/thread
Get conversation history for authenticated user.

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

### POST /support/message
Send a message. AI responds automatically. Flags if needed.

**Request:**
```json
{
  "text": "My order is wrong, something was missing"
}
```

**Response 200:**
```json
{
  "userMessage": { "id": "...", "text": "My order is wrong...", "sender": "USER" },
  "aiReply": {
    "id": "...",
    "text": "I'm really sorry about that. Can you share your order ID?",
    "sender": "AI",
    "flagged": true
  },
  "humanJoined": false,
  "flagged": true
}
```

**AI system prompt used (for Claude API call):**
```
You are Baza's customer support assistant. Baza.ng is a members-only Nigerian grocery 
and food delivery service based in Lagos.

Your job:
1. Help users with order tracking, wallet issues, delivery problems, cancellations
2. Be warm, concise, and empathetic
3. If the message involves: wrong items, missing items, damage, urgent escalation, 
   or the user explicitly asks for a human — set flagged: true in your response
4. Respond in JSON: { "text": "your response", "flagged": boolean }
5. Never fabricate order details — ask the user for their order ID
6. Keep responses under 3 sentences unless detailed help is genuinely needed

Context: User's name is {userName}, phone is {userPhone}.
Recent orders: {recentOrders}
```

---

### POST /support/flag *(internal)*
Called by the message handler when AI flags a conversation. Notifies admin (Slack webhook or email). Not called by mobile client directly.

---

## ERROR CODES REFERENCE

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
| `ITEM_UNAVAILABLE` | 400 | One or more items no longer in stock |
| `INCORRECT_PASSWORD` | 400 | Wrong current password |
| `PASSWORD_TOO_WEAK` | 400 | New password under 8 chars |
| `NOT_FOUND` | 404 | Resource not found |
| `FORBIDDEN` | 403 | User doesn't own this resource |
| `SERVER_ERROR` | 500 | Unexpected error (log and investigate) |

---

## PAGINATION CONVENTION

All list endpoints accept `?page=1&limit=20`. Default limit: 20. Max limit: 100.

Response always includes:
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

## PRICE CONVENTION

**All prices stored and transmitted in kobo.** Display layer converts: `₦${(price / 100).toLocaleString()}`.

Never use floats for money. Never store ₦24,500 as `24500.00`. Store `2450000`.

This prevents floating point errors in financial calculations.
