# Termii Phone OTP Authentication

## Overview

The app now uses backend-driven OTP auth only. Firebase phone auth has been removed from the frontend.

Frontend auth calls your backend endpoints:

- `POST /v1/auth/otp-request`
- `POST /v1/auth/otp-verify`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`

The backend handles Termii integration, OTP storage, and verification.

## Current Frontend Flow

### Sign Up

1. User enters `name`, `phone`, and optional `referralCode`
2. App calls `POST /v1/auth/otp-request` with:
   - `phone`
   - `intent: "signup"`
   - `channel` (`"sms"` by default)
3. App routes to OTP screen
4. App calls `POST /v1/auth/otp-verify` with:
   - `phone`, `otp`, `intent: "signup"`, `channel`
   - `name`, `referralCode`
5. Backend returns `{ accessToken, user }`, app logs user in

### Sign In

1. User enters phone number
2. App calls `POST /v1/auth/otp-request` with `intent: "login"`
3. App routes to OTP screen
4. App calls `POST /v1/auth/otp-verify` with `intent: "login"`
5. Backend returns `{ accessToken, user }`

### Session Restoration

On app launch, frontend attempts `POST /v1/auth/refresh`, then hydrates profile with `GET /v1/user/me`.

## Key Frontend Files

| File                    | Role                                                  |
| ----------------------- | ----------------------------------------------------- |
| `services/auth.ts`      | API methods for OTP request/verify + refresh/logout   |
| `hooks/useAuth.ts`      | Auth orchestration + backend error code mapping       |
| `app/(auth)/signin.tsx` | Starts login OTP flow (`intent: "login"`)             |
| `app/(auth)/signup.tsx` | Starts signup OTP flow (`intent: "signup"`)           |
| `app/(auth)/otp.tsx`    | Verifies OTP and resends OTP with same intent/channel |

## API Contract

Refer to root `documentation.md` for full request/response schema, error codes, and WhatsApp channel details.
