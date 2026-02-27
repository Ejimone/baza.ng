# Termii Phone OTP Authentication

## Overview

Baza uses [Termii](https://termii.com) for phone number verification via SMS OTP. Users must verify their phone number to authenticate — no passwords are used.

## Flow

### Sign Up

1. User enters **name**, **phone number**, and optional **referral code**
2. App calls Termii `POST /api/sms/otp/send` with the phone number
3. Termii sends a 6-digit numeric code via SMS and returns a `pin_id`
4. User is navigated to the OTP screen (with `pinId` passed as a param)
5. User enters the 6-digit code
6. App calls Termii `POST /api/sms/otp/verify` with the `pin_id` and entered code
7. If `verified === "True"`, a local user session is created and persisted to SecureStore

### Sign In

1. User enters **phone number**
2. Same OTP send → verify flow as sign up
3. Session is restored from SecureStore (existing user data preserved)

### Session Restoration

On app launch, the root layout checks SecureStore for a saved auth session and user data. If found, the user is automatically logged in without re-verification.

## Environment Variables

```env
EXPO_PUBLIC_TERMII_API_KEY=your_termii_api_key
EXPO_PUBLIC_TERMII_BASE_URL=https://v3.api.termii.com
```

## Key Files

| File                    | Role                                                                |
| ----------------------- | ------------------------------------------------------------------- |
| `services/termii.ts`    | Termii API client — `sendOtp()` and `verifyOtp()`                   |
| `hooks/useAuth.ts`      | Auth hook that orchestrates OTP send/verify and session creation    |
| `stores/authStore.ts`   | Zustand store — tracks auth state, `pinId`, persists to SecureStore |
| `utils/storage.ts`      | SecureStore helpers for user data and auth session                  |
| `app/(auth)/signup.tsx` | Sign up screen — collects name, phone, referral code                |
| `app/(auth)/signin.tsx` | Sign in screen — collects phone only                                |
| `app/(auth)/otp.tsx`    | OTP entry screen — 6-digit input with auto-submit and resend        |
| `app/_layout.tsx`       | Root layout — restores session from SecureStore on launch           |

## Termii API Endpoints

### Send OTP

```
POST https://v3.api.termii.com/api/sms/otp/send
```

Payload:

```json
{
  "api_key": "...",
  "message_type": "NUMERIC",
  "to": "2347065250817",
  "from": "N-Alert",
  "channel": "dnd",
  "pin_attempts": 3,
  "pin_time_to_live": 5,
  "pin_length": 6,
  "pin_placeholder": "< 123456 >",
  "message_text": "Your Baza verification code is < 123456 >. Valid for 5 minutes.",
  "pin_type": "NUMERIC"
}
```

### Verify OTP

```
POST https://v3.api.termii.com/api/sms/otp/verify
```

Payload:

```json
{
  "api_key": "...",
  "pin_id": "returned-from-send",
  "pin": "user-entered-code"
}
```

## Security Notes

- The Termii API key is exposed in the client bundle via `EXPO_PUBLIC_*` env vars. For production, proxy Termii calls through your backend to protect the API key.
- OTP codes expire after 5 minutes and allow a maximum of 3 attempts.
- Phone numbers are normalized to international format (234...) before sending.
