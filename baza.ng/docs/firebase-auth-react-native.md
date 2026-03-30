# Firebase Authentication (Google + Email) Integration Guide

> End-to-end guide for integrating Firebase Authentication in React Native and exchanging Firebase ID tokens for Baza backend JWTs.

---

## Table of Contents

1. [Overview](#overview)
2. [What Was Added in Backend](#what-was-added-in-backend)
3. [Backend Endpoint Contract](#backend-endpoint-contract)
4. [Environment Variables](#environment-variables)
5. [React Native Setup](#react-native-setup)
6. [Flow and Handshaking](#flow-and-handshaking)
7. [Code Examples (React Native)](#code-examples-react-native)
8. [Token Lifecycle](#token-lifecycle)
9. [Error Codes](#error-codes)
10. [Security Notes](#security-notes)
11. [Using Cursor AI or Codex](#using-cursor-ai-or-codex)
12. [Testing Checklist](#testing-checklist)

---

## Overview

Baza now supports Firebase-based authentication in addition to existing phone OTP auth.

Supported in this phase:

- Google Sign-In via Firebase
- Email/Password via Firebase
- Existing Termii OTP flow remains active and unchanged

Core design:

1. Frontend signs in with Firebase SDK.
2. Frontend gets Firebase ID token (`getIdToken()`).
3. Frontend sends ID token to backend `POST /v1/auth/firebase-verify`.
4. Backend verifies token with Firebase Admin SDK.
5. Backend auto-links user by email (if existing) or creates a new user.
6. Backend returns Baza access token + refresh cookie.

Production API base URL:

- `https://baza-chi.vercel.app`

---

## What Was Added in Backend

### New Endpoint

- `POST /v1/auth/firebase-verify`

### New User Fields

- `users.User.firebase_uid` (unique, nullable)
- `users.User.firebase_provider` (nullable)
- `users.User.phone` now nullable to support email-first accounts

### New Backend Service

- Firebase Admin verification service in `authentication/services.py`
- Verifies Firebase ID tokens and normalizes claims:
  - `uid`
  - `email`
  - `email_verified`
  - `name`
  - `picture`
  - `phone_number`
  - `sign_in_provider`

### Existing Auth Preserved

- `/v1/auth/otp-request`
- `/v1/auth/otp-verify`
- `/v1/auth/refresh`
- `/v1/auth/logout`

No breaking changes were introduced for OTP users.

---

## Backend Endpoint Contract

### `POST /v1/auth/firebase-verify`

Validate Firebase ID token and exchange for Baza session tokens.

### Request Body

```json
{
  "idToken": "<firebase-id-token>",
  "name": "Optional display name",
  "phone": "Optional phone fallback"
}
```

### Field Rules

- `idToken` is required.
- `name` is optional.
- `phone` is optional and used only when backend needs to populate missing phone data.

### Success Response (`200`)

```json
{
  "accessToken": "<baza-access-token>",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "+2348012345678",
    "email": "john@example.com",
    "memberSince": "2026-03-06T03:00:00+00:00",
    "walletBalance": 0,
    "accountNumber": null,
    "bankName": "Providus Bank",
    "accountName": "Baza NG Ltd",
    "dvaAssigned": false,
    "referralCode": "abc123def456",
    "firebaseUid": "firebase_uid_123",
    "firebaseProvider": "google.com"
  }
}
```

A `baza_refresh` HTTP-only cookie is also set.

### Account Linking Rules

- If `firebase_uid` already exists in DB: sign in that user.
- Else if email matches existing user: auto-link `firebase_uid` to that user and sign in.
- Else: create new user and sign in.

### Rate Limit

`firebase-verify` is rate-limited per client IP.

---

## Environment Variables

Add to backend `.env` (or deployment secrets):

```bash
# Firebase Admin
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=/absolute/path/to/serviceAccountKey.json
# Optional alternative to path-based key loading:
# FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account", ...}

# Optional: enforce revocation checks on every verify call
FIREBASE_CHECK_REVOKED=false

# Endpoint rate limit
FIREBASE_VERIFY_RATE_LIMIT_WINDOW_SECONDS=60
FIREBASE_VERIFY_RATE_LIMIT_MAX=30
```

Notes:

- For local dev, path-based key loading is easiest.
- For production (Vercel/CI), JSON-in-env is usually safer than shipping key files.
- Keep `serviceAccountKey.json` out of git.

---

## React Native Setup

Use React Native Firebase auth module:

```bash
yarn add @react-native-firebase/app @react-native-firebase/auth
```

For Google Sign-In provider flow:

```bash
yarn add @react-native-google-signin/google-signin
```

In Firebase Console, enable these providers:

- Authentication > Sign-in method > Google
- Authentication > Sign-in method > Email/Password

---

## Flow and Handshaking

### A) Google Sign-In Handshake

1. User taps "Continue with Google".
2. RN app opens Google auth flow and signs user into Firebase.
3. RN app calls `user.getIdToken()`.
4. RN app `POST`s token to `/v1/auth/firebase-verify`.
5. Backend verifies token with Firebase Admin SDK.
6. Backend links/creates local user.
7. Backend issues Baza access token + `baza_refresh` cookie.
8. RN app stores access token and uses it for `/v1/*` API calls.

### B) Email/Password Handshake

1. User signs up or signs in with Firebase Email/Password.
2. RN app calls `user.getIdToken()`.
3. RN app `POST`s token to `/v1/auth/firebase-verify`.
4. Backend verifies token, links/creates local user, and returns Baza token pair.
5. RN app uses Baza access token for API authorization.

### C) Backend Verification Handshake (Server Side)

1. Receive `idToken` from client over HTTPS.
2. Verify JWT signature, issuer, audience, and expiration via Firebase Admin SDK.
3. Read decoded claims (`uid`, `email`, provider).
4. Resolve Baza user:
   - by `firebase_uid`
   - else by email auto-link
   - else create new user
5. Return Baza `accessToken` and refresh cookie.

### D) Session Continuation Handshake

1. Frontend sends `Authorization: Bearer <accessToken>` for protected calls.
2. If access token expires, frontend calls `/v1/auth/refresh` (cookie-based).
3. Backend rotates refresh token and returns new access token.

---

## Code Examples (React Native)

### Google -> Firebase -> Baza

```javascript
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "@react-native-firebase/auth";

GoogleSignin.configure({
  webClientId: "<your-web-client-id>.apps.googleusercontent.com",
});

export async function signInWithGoogleAndExchange(apiBaseUrl) {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const signInResult = await GoogleSignin.signIn();

  let idToken = signInResult?.data?.idToken || signInResult?.idToken;
  if (!idToken) {
    throw new Error("Google sign-in did not return an ID token");
  }

  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(getAuth(), credential);

  const firebaseIdToken = await userCredential.user.getIdToken();

  const res = await fetch(`${apiBaseUrl}/v1/auth/firebase-verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ idToken: firebaseIdToken }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.code || "FIREBASE_VERIFY_FAILED");
  }

  return res.json();
}
```

### Email/Password -> Firebase -> Baza

```javascript
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "@react-native-firebase/auth";

export async function signUpWithEmailAndExchange(apiBaseUrl, email, password) {
  const auth = getAuth();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const idToken = await cred.user.getIdToken();

  const res = await fetch(`${apiBaseUrl}/v1/auth/firebase-verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.code || "FIREBASE_VERIFY_FAILED");
  }

  return res.json();
}

export async function signInWithEmailAndExchange(apiBaseUrl, email, password) {
  const auth = getAuth();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await cred.user.getIdToken();

  const res = await fetch(`${apiBaseUrl}/v1/auth/firebase-verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.code || "FIREBASE_VERIFY_FAILED");
  }

  return res.json();
}
```

---

## Token Lifecycle

- Firebase token: identity proof sent from client to backend.
- Baza access token: used for API authorization.
- Baza refresh token: cookie-based rotation via `/v1/auth/refresh`.

Recommended frontend behavior:

1. Keep access token in secure storage.
2. Retry once on `401` by calling `/v1/auth/refresh`.
3. If refresh fails, force re-authentication.

---

## Error Codes

`POST /v1/auth/firebase-verify` can return:

- `INVALID_JSON` (`400`)
- `ID_TOKEN_REQUIRED` (`400`)
- `EMAIL_REQUIRED` (`400`)
- `RATE_LIMIT_EXCEEDED` (`429`)
- `FIREBASE_TOKEN_INVALID` (`401`)
- `FIREBASE_TOKEN_EXPIRED` (`401`)
- `FIREBASE_TOKEN_REVOKED` (`401`)
- `ACCOUNT_LINK_CONFLICT` (`409`)
- `EMAIL_MISMATCH` (`409`)
- `PHONE_ALREADY_REGISTERED` (`409`)
- `FIREBASE_CONFIG_ERROR` (`500`)

---

## Security Notes

- Always send Firebase ID token to backend over HTTPS only.
- Never trust Firebase UID from client payload alone; verify token server-side.
- Keep service account keys outside git and rotate leaked keys immediately.
- Prefer secret manager/env vars in production.
- Set `REFRESH_COOKIE_SECURE=true` in production.

---

## Using Cursor AI or Codex

Use the section below as a full prompt spec. Paste it directly into Cursor AI or Codex.

### One-Shot Prompt (Paste As-Is)

```text
Implement Firebase Authentication in my React Native app and integrate with Baza backend endpoint POST /v1/auth/firebase-verify.

Goal:
- Add Google sign-in and Email/Password sign-in/sign-up via Firebase.
- Exchange Firebase ID token with backend.
- Store Baza access token and authenticated user in app state.
- Keep existing OTP auth flow working; do not remove it.

Backend contract (must follow exactly):
- Endpoint: POST {API_BASE_URL}/v1/auth/firebase-verify
- Production value for API_BASE_URL: https://baza-chi.vercel.app
- Request JSON: { idToken: string, name?: string, phone?: string }
- Success 200 returns: { accessToken: string, user: {...} }
- Non-200 returns: { error: string, code: string }

Required implementation:
1) Create auth service file: src/services/auth/firebaseAuth.ts
  - signInWithGoogleAndExchange(apiBaseUrl: string)
  - signUpWithEmailAndExchange(apiBaseUrl: string, email: string, password: string)
  - signInWithEmailAndExchange(apiBaseUrl: string, email: string, password: string)
  - exchangeFirebaseToken(apiBaseUrl: string, idToken: string, extras?: { name?: string; phone?: string })
  - Throw an Error that includes backend code when request fails.

2) Wire auth state/store (Context, Zustand, Redux, or existing pattern)
  - Persist accessToken securely (SecureStore/Keychain/Keystore equivalent).
  - Persist minimal user profile from backend response.
  - Expose methods: loginWithGoogle, loginWithEmail, signupWithEmail, logout.

3) Update API client wrapper
  - Attach Authorization: Bearer <accessToken> for protected routes.
  - On 401, call POST /v1/auth/refresh once, then retry original request once.
  - If refresh fails, clear local auth state and navigate to login.

4) Update UI screens
  - Login screen: add "Continue with Google" and Email/Password form.
  - Signup screen: Email/Password signup path.
  - Show loading and disable duplicate submissions.
  - Display backend error code/message (for example: EMAIL_REQUIRED, FIREBASE_TOKEN_INVALID).

5) Configure Firebase client usage
  - Use @react-native-firebase/app and @react-native-firebase/auth.
  - Use @react-native-google-signin/google-signin for Google provider flow.
  - GoogleSignin.configure must use webClientId from env/config.

6) Preserve compatibility
  - Keep OTP flow untouched and available.
  - Firebase auth must be additive, not a replacement.

7) Add basic tests (or test notes if no test setup)
  - Success: Google login -> backend exchange -> authenticated state set.
  - Success: Email sign-up/sign-in -> backend exchange -> authenticated state set.
  - Failure: invalid Firebase token -> backend error surfaced.
  - Existing-user repeat login should succeed with same Firebase account.

Output expectations:
- Show all modified files.
- For each file, explain why it changed in 1-2 lines.
- Include final manual QA steps and commands for validation.
```

### Follow-Up Prompt: Refactor Quality Pass

```text
Review the Firebase auth implementation you just generated.
Refactor for readability and reliability without changing behavior:
- deduplicate repeated fetch/error parsing logic
- add strong TypeScript types for backend response and user shape
- ensure no secrets are hardcoded
- keep OTP flow unchanged
Return a concise list of changes and updated files.
```

### Follow-Up Prompt: Bugfix Mode

```text
I am seeing Firebase login failures. Diagnose and patch auth flow.
Check these first:
- Google webClientId configuration
- Firebase authorized domains
- getIdToken() retrieval path
- /v1/auth/firebase-verify payload and error handling
- refresh retry logic on 401
Apply minimal safe changes and return exact diffs.
```

### Non-Negotiable Guardrails

- Keep `apiBaseUrl` configurable.
- Never embed service account credentials or private keys in frontend code.
- Always surface backend `code` in UI/dev logs.
- Keep Firebase flow additive; do not break OTP auth.
- Use only backend-issued `accessToken` for Baza protected endpoints.

---

## Testing Checklist

- [ ] Google Sign-In works on Android and iOS.
- [ ] Email signup/signin works in Firebase and backend exchange.
- [ ] Existing OTP users can still login without regression.
- [ ] Existing user with same email is auto-linked to Firebase account.
- [ ] Protected endpoints accept returned Baza access token.
- [ ] Refresh flow rotates token correctly.
- [ ] Invalid Firebase token returns stable error code.

---

## Manual cURL Verification (Existing User Repeat Login)

Use this to validate the backend exchange path after a user has already been linked/created.

```bash
curl -sS -X POST http://127.0.0.1:8003/v1/auth/firebase-verify \
  -H "Content-Type: application/json" \
  --data '{"idToken":"<firebase-id-token>"}'
```

Verified result (2026-03-06):

- Status code: `200`
- Short JSON fields:

```json
{
  "id": "2c3aa04d-6aea-4698-9d35-43c1fa92cb0a",
  "email": "vexiwrites@gmail.com",
  "dvaAssigned": false,
  "firebaseUid": "vbOwhBdsDZQIhJWT1lq7ursh1wU2",
  "firebaseProvider": "google.com"
}
```
