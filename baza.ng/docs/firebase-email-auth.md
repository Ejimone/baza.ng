# Firebase Email & Google Authentication

> Email and Google signup/signin are **alternatives** to the phone OTP flow. All three methods coexist — users choose their preferred method. Phone auth uses Termii (see `docs/termii-phone-auth.md`). Email and Google auth use Firebase.

**Implementation must match** [`firebase-auth-react-native.md`](../firebase-auth-react-native.md) — backend contract, request/response shape, and error codes.

## Overview

Baza.ng supports **Firebase Email/Password Authentication** via the Firebase JS SDK. The flow works as follows:

1. **User** enters email and password on the signup or signin screen
2. **Frontend** calls `createUserWithEmailAndPassword` (signup) or `signInWithEmailAndPassword` (signin)
3. **Frontend** gets a **Firebase ID Token** from the signed-in user via `user.getIdToken()`
4. **Frontend** sends the Firebase ID Token to the **backend** endpoint `POST /v1/auth/firebase-verify`
5. **Backend** verifies the token using Firebase Admin SDK, finds/creates the user by email, and returns the app's JWT (`accessToken`) + user data

---

## Architecture

```
┌─────────────────┐                    ┌─────────────────┐
│  Signup/Signin   │  createUser /      │   Firebase      │
│  Email Screen    │  signInWithEmail   │   Auth          │
└────────┬────────┘ ─────────────────►└────────┬────────┘
         │                                        │
         │  user.getIdToken()                     │
         │◄───────────────────────────────────────┘
         │
         │  POST /auth/firebase-verify
         │  { firebaseToken, email, name?, referralCode? }
         ▼
┌─────────────────┐
│   Backend       │  verify_id_token → find/create by email → JWT
└─────────────────┘
```

---

## Frontend ↔ Backend Contract

- **Route:** `POST /v1/auth/firebase-verify`
- **Base URL:** `https://baza-chi.vercel.app/v1` (from `utils/constants.ts`)

### Request (matches firebase-auth-react-native.md)

```json
{
  "idToken": "<Firebase ID token from user.getIdToken()>",
  "name": "Optional display name",
  "phone": "Optional phone fallback"
}
```

- `idToken` is required.
- `name` and `phone` are optional. Backend extracts `email`, `uid`, etc. from the token.

### Success Response (`200`)

```json
{
  "accessToken": "<your-app-jwt>",
  "user": {
    "id": "...",
    "name": "...",
    "phone": "...",
    "email": "user@example.com",
    "memberSince": "...",
    "walletBalance": 0,
    "referralCode": "...",
    "notifications": { ... }
  }
}
```

Sets `baza_refresh` HTTP-only cookie for token refresh.

### Failure Responses

- `400`: missing/invalid payload, invalid JSON, token has neither email nor phone
- `401`: invalid/expired/revoked Firebase token
- `404`: backend does not expose `/v1/auth/firebase-verify`
- `500`: Firebase Admin initialization/verification failure

---

## Frontend Implementation

### Files

| File | Purpose |
|------|---------|
| `config/firebase.ts` | Firebase JS SDK initialization and auth instance |
| `services/firebaseEmailAuth.ts` | `signUpWithEmail`, `signInWithEmail`, `signInWithGoogle`, `getIdToken`, `signOut` |
| `services/auth.ts` | `verifyFirebaseToken` — POST to backend |
| `hooks/useAuth.ts` | `signUpWithEmail`, `signInWithEmail`, `signInWithGoogle` with error mapping |
| `app/(auth)/index.tsx` | Onboarding with 3 options: Google, Email, Phone |
| `app/(auth)/signup-email.tsx` | Email signup screen |
| `app/(auth)/signin-email.tsx` | Email signin screen |

### Flow (matches firebase-auth-react-native.md)

```typescript
// All flows: get idToken from Firebase, POST to /v1/auth/firebase-verify
// Request: { idToken: string, name?: string, phone?: string }

// Email signup
const user = await firebaseEmailAuth.signUpWithEmail(email, password);
const idToken = await firebaseEmailAuth.getIdToken(user);
const { accessToken, user: userData } = await authService.verifyFirebaseToken({
  idToken,
  name: name ?? user.displayName ?? undefined,
});

// Email signin
const user = await firebaseEmailAuth.signInWithEmail(email, password);
const idToken = await firebaseEmailAuth.getIdToken(user);
const { accessToken, user: userData } = await authService.verifyFirebaseToken({
  idToken,
});

// Google signin (signup + signin)
const user = await firebaseEmailAuth.signInWithGoogle();
const idToken = await firebaseEmailAuth.getIdToken(user);
const { accessToken, user: userData } = await authService.verifyFirebaseToken({
  idToken,
  name: user.displayName ?? undefined,
});
```

---

## Firebase Console Setup

1. **Enable Email/Password** sign-in provider: Authentication → Sign-in method → Email/Password → Enable
2. **Enable Google** sign-in provider: Authentication → Sign-in method → Google → Enable
3. **Add Web App** (if using Firebase JS SDK): Project Settings → Your apps → Add app (Web) → copy config
4. **Environment variables** (optional overrides in `.env`):
   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `EXPO_PUBLIC_FIREBASE_APP_ID`

---

## Backend Requirement

The backend must expose `POST /v1/auth/firebase-verify` and support **email** tokens. The decoded Firebase ID token contains:

- `email` — for email/password sign-in
- `phone_number` — for phone sign-in (if using Firebase Phone Auth)

Backend pseudocode:

```python
decoded = firebase_auth.verify_id_token(firebase_token)
email = decoded.get("email")
phone = decoded.get("phone_number")

if email:
    user, created = User.objects.get_or_create(
        email=email,
        defaults={"name": name or "User", "firebase_uid": decoded["uid"], ...}
    )
elif phone:
    user, created = User.objects.get_or_create(
        phone=normalize_phone(phone),
        defaults={"name": name or "User", "firebase_uid": decoded["uid"], ...}
    )
else:
    return 400  # Token must have email or phone
```

See `docs/firebase-phone-auth.md` for full backend implementation details (Firebase Admin init, JWT issuance, etc.).

---

## Google Sign-In Setup

- **Package:** `@react-native-google-signin/google-signin` (requires development build, not Expo Go)
- **Config:** `app.json` includes the plugin with `iosUrlScheme` and `googleServicesFile` for Android/iOS
- **Web Client ID:** From Firebase/Google Cloud OAuth client (client_type 3). Used in `firebaseEmailAuth.ts`.

## Auth Methods (Onboarding Options)

| Method | Signup | Signin | Backend |
|--------|--------|--------|---------|
| **Google** | Onboarding → `signInWithGoogle` | Onboarding → `signInWithGoogle` | Firebase verify (`/auth/firebase-verify`) |
| **Email** | `/(auth)/signup-email` | `/(auth)/signin-email` | Firebase verify (`/auth/firebase-verify`) |
| **Phone** | `/(auth)/signup` → OTP → `/(auth)/otp` | `/(auth)/signin` → OTP → `/(auth)/otp` | Termii OTP (`/auth/otp-request`, `/auth/otp-verify`) |

Onboarding shows all three options. Users can switch between methods via links on each auth screen.

---

## Firebase Error Codes (Frontend)

| Code | Message |
|------|---------|
| `auth/email-already-in-use` | An account with this email already exists. Please sign in. |
| `auth/invalid-email` | Please enter a valid email address. |
| `auth/weak-password` | Password should be at least 6 characters. |
| `auth/user-not-found`, `auth/wrong-password`, `auth/invalid-credential` | Invalid email or password. Please try again. |
| `auth/too-many-requests` | Too many attempts. Please try again later. |
| `auth/network-request-failed` | Network error. Please check your connection and try again. |
