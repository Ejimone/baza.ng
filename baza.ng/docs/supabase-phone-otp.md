# Supabase Phone OTP Integration

## Overview

Baza uses **Supabase Auth** as the phone OTP provider for user authentication. Supabase handles:

- OTP generation (6-digit codes)
- OTP storage and expiry
- SMS delivery via the SMS provider configured in the Supabase dashboard (Twilio, MessageBird, Vonage, etc.)

The Django backend issues its own JWT access/refresh tokens and manages its own `users.User` model. Supabase is used **only** for the OTP send and verify steps.

## Architecture

```
Mobile App                    Django Backend                 Supabase Auth
    │                              │                              │
    │  POST /v1/auth/otp-request   │                              │
    │  { "phone": "+234..." }      │                              │
    │─────────────────────────────>│                              │
    │                              │  POST /auth/v1/otp           │
    │                              │  { "phone": "+234..." }      │
    │                              │─────────────────────────────>│
    │                              │          200 OK              │
    │                              │<─────────────────────────────│
    │       { "message": "OTP sent" }                             │
    │<─────────────────────────────│                              │
    │                              │                              │
    │                              │                     SMS ────>│ User
    │                              │                              │
    │  POST /v1/auth/otp-verify    │                              │
    │  { "phone", "otp", "name" }  │                              │
    │─────────────────────────────>│                              │
    │                              │  POST /auth/v1/verify        │
    │                              │  { "phone", "token", "type"} │
    │                              │─────────────────────────────>│
    │                              │        200 OK (valid)        │
    │                              │<─────────────────────────────│
    │                              │                              │
    │                              │  Create/find local user      │
    │                              │  Issue own JWT tokens         │
    │       { "accessToken", "user" }                             │
    │<─────────────────────────────│                              │
```

## Files Changed

| File | Change |
|------|--------|
| `authentication/services.py` | Added `SupabaseOTPService` class; old `TermiiService` removed |
| `authentication/views.py` | Uses `SupabaseOTPService` for OTP send/verify |
| `config/settings.py` | Added `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`; removed `TERMII_*` vars |
| `docs/baza-devkit/.env.example` | Supabase env vars replacing Termii section |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL (e.g. `https://abc123.supabase.co`) |
| `SUPABASE_ANON_KEY` | Supabase anon/public key (used as `apikey` header) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (used as `Authorization` bearer) |

## Setup Steps

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Enable Phone Auth**: Dashboard → Authentication → Providers → Phone → Enable
3. **Configure SMS Provider**: In the same panel, set up Twilio (or MessageBird/Vonage) with your API credentials
4. **Copy keys** from Dashboard → Settings → API:
   - Project URL → `SUPABASE_URL`
   - `anon` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
5. **Add to `.env`** file in the project root

## Dev Mode Fallback

When `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` are empty/unset, the service runs in dev fallback mode:
- `send_otp()` returns `True` without sending any SMS
- `verify_otp()` returns `True` for any OTP code

This lets developers test the auth flow locally without a Supabase project.

## Rate Limiting

Two layers of rate limiting are in effect:

1. **App-level** (Upstash Redis): 3 OTP requests per phone per 10 minutes (configurable via `OTP_RATE_LIMIT_MAX` and `OTP_RATE_LIMIT_WINDOW_SECONDS`)
2. **Supabase-level**: 1 OTP per phone per 60 seconds (configurable in Supabase dashboard)

## API Endpoints

### POST /v1/auth/otp-request

**Request:**
```json
{ "phone": "+2348012345678" }
```

**Response 200:**
```json
{ "message": "OTP sent", "expiresIn": 300 }
```

**Errors:**
- `429` — `RATE_LIMIT_EXCEEDED`
- `502` — `OTP_SEND_FAILED`

### POST /v1/auth/otp-verify

**Request:**
```json
{
  "phone": "+2348012345678",
  "otp": "482910",
  "name": "Thrive",
  "referralCode": "THRIVE200"
}
```

**Response 200:**
```json
{
  "accessToken": "eyJhbG...",
  "user": { "id": "...", "name": "Thrive", "phone": "+2348012345678", ... }
}
```

**Errors:**
- `400` — `INVALID_OTP` — wrong or expired OTP
