# Updated Auth with Referral (Frontend Handoff)

This doc explains the new referral-enabled auth flow for frontend implementation.

## Goals

- Support email/Google-first signup.
- Let user enter referral code right after signup.
- Let user skip referral and continue app usage.
- Enforce one-time referral application server-side.

## Base URLs

- Base URL: `https://baza-chi.vercel.app`
- Auth base: `https://baza-chi.vercel.app/v1/auth`
- Referral base: `https://baza-chi.vercel.app/v1/referral`

## Endpoints

### Auth

- `POST /v1/auth/firebase-verify`
- `POST /v1/auth/otp-request`
- `POST /v1/auth/otp-verify`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`

### Referral

- `POST /v1/referral/apply-code` (JWT required)
- `GET /v1/referral/stats` (JWT required)

## Core Behavior

### 1) Firebase signup/login with optional referral

`POST /v1/auth/firebase-verify` now accepts optional `referralCode`.

- New user + valid referral code: `referred_by` is set.
- New user + invalid/self referral code: auth still succeeds, referral is ignored.
- Existing user: referral is not overwritten.

Request example:

```bash
curl -sS -X POST "https://baza-chi.vercel.app/v1/auth/firebase-verify" \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "<firebase_id_token>",
    "referralCode": "abc123def456"
  }'
```

Success response example:

```json
{
  "accessToken": "<jwt_access_token>",
  "isNewUser": true,
  "user": {
    "id": "uuid",
    "name": "User",
    "email": "user@example.com",
    "phone": null,
    "referralCode": "self_generated_user_code",
    "walletBalance": 0
  }
}
```

`isNewUser` behavior:

- `true`: account was created during this auth call.
- `false`: existing account login/link.

### 2) Post-signup referral entry (recommended onboarding step)

Use `POST /v1/referral/apply-code` after signup/login.

- Allows user to enter referral code after account creation.
- If user taps Skip, do not call this endpoint.
- One-time only: once set, cannot be changed.

Request example:

```bash
curl -sS -X POST "https://baza-chi.vercel.app/v1/referral/apply-code" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "referralCode": "abc123def456"
  }'
```

Success response (`200`):

```json
{
  "message": "Referral code applied",
  "referralCode": "abc123def456",
  "referrer": {
    "name": "John Referrer",
    "phone": "+234...",
    "email": "john@example.com"
  }
}
```

## Error Codes for `POST /v1/referral/apply-code`

- `AUTH_REQUIRED` (401): Missing/invalid token.
- `INVALID_JSON` (400): Bad JSON body.
- `REFERRAL_CODE_REQUIRED` (400): Empty or missing `referralCode`.
- `REFERRAL_CODE_INVALID` (400): Code not found.
- `REFERRAL_CODE_SELF` (400): User submitted own code.
- `REFERRAL_ALREADY_SET` (409): Referral already applied previously.

## Frontend Flow (Recommended)

### Flow A: Google/Email signup -> referral prompt

1. User completes Google/Email signup.
2. Call `POST /v1/auth/firebase-verify` with `idToken`.
3. Store `accessToken`, `isNewUser`, and user payload.
4. If `isNewUser === true`, show referral screen:
   - Enter code -> call `POST /v1/referral/apply-code`
   - Skip -> continue to home/dashboard
5. If `isNewUser === false`, skip referral prompt and continue.
6. Mark referral prompt as completed in frontend state so user is not reprompted.

### Flow B: OTP signup (already supports referral)

`POST /v1/auth/otp-verify` already accepts `referralCode`.

Request example:

```bash
curl -sS -X POST "https://baza-chi.vercel.app/v1/auth/otp-verify" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+2347012345678",
    "otp": "123456",
    "intent": "signup",
    "name": "John Doe",
    "referralCode": "abc123def456"
  }'
```

## TypeScript (Compact)

```ts
interface AuthUser {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  referralCode: string;
  walletBalance: number;
}

interface FirebaseVerifyResponse {
  accessToken: string;
  isNewUser: boolean;
  user: AuthUser;
}

interface OtpVerifyResponse {
  accessToken: string;
  isNewUser: boolean;
  user: AuthUser;
}

interface ApplyReferralRequest {
  referralCode: string;
}

interface ApplyReferralResponse {
  message: "Referral code applied";
  referralCode: string;
  referrer: {
    name: string;
    phone: string | null;
    email: string | null;
  };
}

interface ApiError {
  error: string;
  code: string;
}
```

## Important Notes

- Referral bonus is still awarded by existing first-order logic.
- Referral is intentionally immutable once applied.
- For skip behavior, backend requires no special endpoint; frontend simply continues.
- Use `isNewUser` from auth responses to decide whether to show referral onboarding.

## Quick Frontend Checklist

1. Add onboarding referral screen after first successful auth.
2. Wire submit to `POST /v1/referral/apply-code`.
3. Handle code-based errors in UI (`REFERRAL_CODE_INVALID`, `REFERRAL_ALREADY_SET`, etc.).
4. Persist “referral step completed” in local app state/profile flow.
5. Continue app flow on skip without API call.
