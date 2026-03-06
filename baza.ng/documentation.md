# Phone Number & WhatsApp Authentication — API Documentation

> Complete reference for Baza's OTP-based authentication system supporting both SMS and WhatsApp delivery channels via [Termii](https://termii.com).

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Environment Variables](#environment-variables)
4. [Endpoints](#endpoints)
   - [Request OTP](#1-request-otp)
   - [Verify OTP](#2-verify-otp)
   - [Refresh Token](#3-refresh-token)
   - [Logout](#4-logout)
5. [OTP Channels](#otp-channels)
   - [SMS (Default)](#sms-default)
   - [WhatsApp](#whatsapp)
6. [Error Codes](#error-codes)
7. [Rate Limiting](#rate-limiting)
8. [Token Lifecycle](#token-lifecycle)
9. [Frontend Integration Guide](#frontend-integration-guide)
10. [Dev Mode](#dev-mode)

---

## Overview

Baza uses **phone-number-first authentication** — no passwords. Users authenticate by receiving a one-time password (OTP) on their phone and submitting it back to the server.

Two delivery channels are supported:

| Channel      | Delivery Method            | Termii API Used                                                         |
| ------------ | -------------------------- | ----------------------------------------------------------------------- |
| **SMS**      | Text message (generic/DND) | Send Token (`/api/sms/otp/send`) + Verify Token (`/api/sms/otp/verify`) |
| **WhatsApp** | WhatsApp message           | Send WhatsApp Token (`/api/sms/send` with `channel: "whatsapp_otp"`)    |

Both channels share the same endpoints — the client simply passes `"channel": "sms"` or `"channel": "whatsapp"` in the request body.

---

## Architecture

```
┌────────────┐         ┌──────────────────┐         ┌─────────────┐
│  Frontend   │──POST──▶│  /v1/auth/otp-   │──────▶  │   Termii    │
│  (App/Web)  │         │  request         │         │   SMS / WA   │
└────────────┘         └──────────────────┘         └─────────────┘
                              │                           │
                              ▼                           ▼
                        ┌──────────┐              ┌──────────────┐
                        │  Upstash │◀─────────────│  OTP stored  │
                        │  Redis   │  pin_id/otp  │  (TTL-based) │
                        └──────────┘              └──────────────┘
                              │
┌────────────┐         ┌──────────────────┐
│  Frontend   │──POST──▶│  /v1/auth/otp-   │──▶ Verify OTP ──▶ Issue JWT
│  (App/Web)  │         │  verify          │
└────────────┘         └──────────────────┘
```

### Key Differences Between Channels

| Aspect          | SMS Channel               | WhatsApp Channel                     |
| --------------- | ------------------------- | ------------------------------------ |
| OTP Generation  | Termii generates the OTP  | Server generates the OTP             |
| OTP Delivery    | Termii sends via SMS      | Termii sends via WhatsApp            |
| Verification    | Termii's Verify Token API | Local comparison against Redis store |
| Termii Endpoint | `POST /api/sms/otp/send`  | `POST /api/sms/send`                 |

---

## Environment Variables

Add these to your `.env` file:

```bash
# ── Termii ───────────────────────────────────────
TERMII_API_KEY=your_termii_api_key
TERMII_SENDER_ID=BazaNG                  # Approved SMS sender ID
TERMII_CHANNEL=generic                    # SMS route: "generic" or "dnd"
TERMII_WHATSAPP_SENDER_ID=BazaNG         # WhatsApp device name / sender ID

# ── OTP Settings ─────────────────────────────────
OTP_TTL_SECONDS=300                       # OTP expiry (5 minutes)
OTP_RATE_LIMIT_WINDOW_SECONDS=600         # Rate limit window (10 minutes)
OTP_RATE_LIMIT_MAX=3                      # Max OTP requests per window

# ── JWT ──────────────────────────────────────────
JWT_SECRET=your_jwt_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_MINUTES=60
REFRESH_TOKEN_DAYS=30
REFRESH_COOKIE_SECURE=false               # Set "true" in production

# ── Redis (Upstash) ─────────────────────────────
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

> **Note:** The `TERMII_WHATSAPP_SENDER_ID` must match a WhatsApp device registered on your Termii dashboard. The WhatsApp OTP feature must be enabled by Termii support — contact them to activate it for your account.

---

## Endpoints

Base URL: `/v1/auth/`

### 1. Request OTP

**`POST /v1/auth/otp-request`**

Sends a 6-digit OTP to the user's phone via SMS or WhatsApp.

#### Request Body

```json
{
  "phone": "+2347012345678",
  "intent": "signup",
  "channel": "whatsapp"
}
```

| Field     | Type   | Required | Description                                                                  |
| --------- | ------ | -------- | ---------------------------------------------------------------------------- |
| `phone`   | string | Yes      | Phone number (international format recommended, e.g. `+2347012345678`)       |
| `intent`  | string | No       | `"signup"` or `"login"` — enables pre-flight checks (uniqueness / existence) |
| `channel` | string | No       | `"sms"` (default) or `"whatsapp"` — delivery channel for the OTP             |

#### Success Response — `200 OK`

```json
{
  "message": "OTP sent",
  "channel": "whatsapp",
  "expiresIn": 300
}
```

#### Error Responses

| Status | Code                       | When                                           |
| ------ | -------------------------- | ---------------------------------------------- |
| 400    | `INVALID_JSON`             | Request body is not valid JSON                 |
| 400    | `PHONE_REQUIRED`           | `phone` field is missing or empty              |
| 404    | `ACCOUNT_NOT_FOUND`        | `intent=login` but phone is not registered     |
| 409    | `PHONE_ALREADY_REGISTERED` | `intent=signup` but phone already exists       |
| 429    | `RATE_LIMIT_EXCEEDED`      | Too many OTP requests in the rate limit window |
| 502    | `OTP_SEND_FAILED`          | Termii API call failed                         |

---

### 2. Verify OTP

**`POST /v1/auth/otp-verify`**

Verifies the OTP and returns JWT tokens. Creates a new user on first signup.

#### Request Body

```json
{
  "phone": "+2347012345678",
  "otp": "123456",
  "intent": "signup",
  "channel": "whatsapp",
  "name": "John Doe",
  "referralCode": "abc123def456"
}
```

| Field          | Type   | Required | Description                                                        |
| -------------- | ------ | -------- | ------------------------------------------------------------------ |
| `phone`        | string | Yes      | Same phone number used in `otp-request`                            |
| `otp`          | string | Yes      | The 6-digit OTP received by the user                               |
| `intent`       | string | No       | `"signup"` or `"login"` — enforces account existence checks        |
| `channel`      | string | No       | `"sms"` (default) or `"whatsapp"` — must match the request channel |
| `name`         | string | No       | User's display name (used on signup, defaults to "Baza Member")    |
| `referralCode` | string | No       | Referral code of the inviting user                                 |

> **Important:** The `channel` value in `otp-verify` must match the `channel` used in `otp-request`. SMS and WhatsApp OTPs are stored under different keys.

#### Success Response — `200 OK`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "phone": "+2347012345678",
    "memberSince": "2026-03-05T10:30:00+00:00",
    "walletBalance": 0,
    "accountNumber": "1234567890",
    "bankName": "Wema Bank",
    "accountName": "JOHN DOE / BAZA",
    "dvaAssigned": true,
    "referralCode": "a1b2c3d4e5f6"
  }
}
```

A `baza_refresh` HTTP-only cookie is also set on the response for token refreshing.

#### Error Responses

| Status | Code                       | When                                          |
| ------ | -------------------------- | --------------------------------------------- |
| 400    | `INVALID_JSON`             | Request body is not valid JSON                |
| 400    | `PHONE_OTP_REQUIRED`       | `phone` or `otp` field is missing             |
| 400    | `INVALID_OTP`              | OTP is incorrect or expired                   |
| 404    | `ACCOUNT_NOT_FOUND`        | `intent=login` but no account with this phone |
| 409    | `PHONE_ALREADY_REGISTERED` | `intent=signup` but phone already registered  |

---

### 3. Refresh Token

**`POST /v1/auth/refresh`**

Rotates the refresh token and issues a new access token.

#### Request

No body required. The `baza_refresh` cookie is read automatically.

#### Success Response — `200 OK`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

A new `baza_refresh` cookie replaces the old one (token rotation).

#### Error Responses

| Status | Code                    | When                                    |
| ------ | ----------------------- | --------------------------------------- |
| 401    | `REFRESH_TOKEN_INVALID` | Cookie missing, token revoked, or wrong |
| 401    | `REFRESH_TOKEN_EXPIRED` | Refresh token has expired               |

---

### 4. Logout

**`POST /v1/auth/logout`**

Revokes the current refresh token and clears the cookie.

#### Request

No body required.

#### Success Response — `200 OK`

```json
{
  "message": "Logged out"
}
```

---

## OTP Channels

### SMS (Default)

The default channel. Uses Termii's **Send Token** API which generates the OTP server-side and delivers it via SMS.

```json
// otp-request
{ "phone": "+2347012345678", "intent": "login" }

// otp-verify
{ "phone": "+2347012345678", "otp": "123456", "intent": "login" }
```

**How it works internally:**

1. Server calls Termii `POST /api/sms/otp/send` with `channel: "generic"` (or `"dnd"`)
2. Termii generates a 6-digit PIN, sends it via SMS, and returns a `pin_id`
3. `pin_id` is stored in Redis with TTL = `OTP_TTL_SECONDS`
4. On verify, server calls Termii `POST /api/sms/otp/verify` with the `pin_id` and user's OTP
5. Termii confirms whether the PIN matches

### WhatsApp

Uses Termii's **Send WhatsApp Token** API. The OTP is generated on the server and sent to the user's WhatsApp number.

```json
// otp-request
{ "phone": "+2347012345678", "intent": "login", "channel": "whatsapp" }

// otp-verify
{ "phone": "+2347012345678", "otp": "123456", "intent": "login", "channel": "whatsapp" }
```

**How it works internally:**

1. Server generates a cryptographically secure 6-digit OTP using `secrets.randbelow()`
2. Server calls Termii `POST /api/sms/send` with `channel: "whatsapp_otp"` and the OTP in the `sms` field
3. The OTP is stored in Redis under a separate key (`termii_wa_otp:{phone}`) with TTL = `OTP_TTL_SECONDS`
4. On verify, the server compares the submitted OTP against the Redis-stored value using constant-time comparison (`secrets.compare_digest`) to prevent timing attacks
5. On match, the OTP key is deleted from Redis

> **Prerequisites:** WhatsApp OTP must be activated on your Termii account (contact Termii support). You must have a registered WhatsApp device on your Termii dashboard and set `TERMII_WHATSAPP_SENDER_ID` accordingly.

---

## Error Codes

| Code                       | HTTP Status | Description                                              |
| -------------------------- | ----------- | -------------------------------------------------------- |
| `INVALID_JSON`             | 400         | Request body could not be parsed as JSON                 |
| `PHONE_REQUIRED`           | 400         | The `phone` field is missing or empty                    |
| `PHONE_OTP_REQUIRED`       | 400         | `phone` and/or `otp` fields are missing                  |
| `INVALID_OTP`              | 400         | The OTP is wrong or has expired                          |
| `PHONE_ALREADY_REGISTERED` | 409         | Signup attempted with an already-registered phone number |
| `ACCOUNT_NOT_FOUND`        | 404         | Login attempted with an unregistered phone number        |
| `RATE_LIMIT_EXCEEDED`      | 429         | Too many OTP requests — wait and try again               |
| `OTP_SEND_FAILED`          | 502         | Termii API returned an error or was unreachable          |
| `REFRESH_TOKEN_INVALID`    | 401         | Refresh token is missing, revoked, or malformed          |
| `REFRESH_TOKEN_EXPIRED`    | 401         | Refresh token has passed its expiry date                 |

All error responses follow this shape:

```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE"
}
```

---

## Rate Limiting

OTP requests are rate-limited per phone number:

- **Window:** `OTP_RATE_LIMIT_WINDOW_SECONDS` (default 600s = 10 minutes)
- **Max requests:** `OTP_RATE_LIMIT_MAX` (default 3)

This applies to **both** SMS and WhatsApp channels (same rate limit key). After exceeding the limit, the user receives a `429 RATE_LIMIT_EXCEEDED` error.

---

## Token Lifecycle

| Token         | Lifetime                     | Storage                 |
| ------------- | ---------------------------- | ----------------------- |
| Access Token  | `ACCESS_TOKEN_MINUTES` (60m) | Client-side (in-memory) |
| Refresh Token | `REFRESH_TOKEN_DAYS` (30d)   | HTTP-only cookie + DB   |

- Access tokens are short-lived JWTs containing `sub` (user ID), `type: "access"`, `iat`, `exp`, and `jti`.
- Refresh tokens are rotated on every `/v1/auth/refresh` call — the old token is deleted and a new one issued.
- On logout, the refresh token is revoked (deleted from DB) and the cookie is cleared.

---

## Frontend Integration Guide

### Signup Flow (WhatsApp)

```
1. User enters phone number
2. App calls POST /v1/auth/otp-request
   Body: { "phone": "+234...", "intent": "signup", "channel": "whatsapp" }
3. User receives OTP on WhatsApp
4. User enters OTP in the app
5. App calls POST /v1/auth/otp-verify
   Body: { "phone": "+234...", "otp": "123456", "intent": "signup",
           "channel": "whatsapp", "name": "User Name" }
6. App receives accessToken + user object
7. Store accessToken for API calls
```

### Login Flow (SMS — default)

```
1. User enters phone number
2. App calls POST /v1/auth/otp-request
   Body: { "phone": "+234...", "intent": "login" }
3. User receives OTP via SMS
4. User enters OTP in the app
5. App calls POST /v1/auth/otp-verify
   Body: { "phone": "+234...", "otp": "123456", "intent": "login" }
6. App receives accessToken + user object
```

### Channel Selection UI

The frontend can offer users a choice:

```
┌──────────────────────────────────┐
│   How would you like to receive  │
│         your OTP code?           │
│                                  │
│   ┌────────┐    ┌────────────┐   │
│   │  SMS   │    │  WhatsApp  │   │
│   └────────┘    └────────────┘   │
└──────────────────────────────────┘
```

Based on the selection, set `"channel": "sms"` or `"channel": "whatsapp"` in both the request and verify calls.

### Token Refresh

```javascript
// When access token expires (401 on any API call):
const res = await fetch("/v1/auth/refresh", {
  method: "POST",
  credentials: "include", // sends baza_refresh cookie
});
const { accessToken } = await res.json();
// Retry the original request with new accessToken
```

---

## Dev Mode

When `TERMII_API_KEY` is not set (empty string), the service runs in **dev mode**:

- **SMS:** OTP is not actually sent. Any OTP code will be accepted during verification.
- **WhatsApp:** OTP is generated and stored in Redis but not delivered. Any OTP code will be accepted.

This allows local development without a Termii account or active WhatsApp configuration.
