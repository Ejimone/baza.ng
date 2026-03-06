# Firebase Phone Authentication

> Deprecated: frontend Firebase auth is no longer active in this project. The app now uses backend OTP endpoints backed by Termii. See `documentation.md` and `docs/termii-phone-auth.md` for the active flow.

## Overview

Baza.ng uses **Firebase Phone Authentication** (`@react-native-firebase/auth`) to verify users' phone numbers. The flow works as follows:

1. **Frontend** calls `signInWithPhoneNumber()` → Firebase sends an SMS with a 6-digit OTP
2. **User** enters the OTP on the verification screen
3. **Frontend** calls `confirmation.confirm(code)` → Firebase verifies the code
4. **Frontend** gets a **Firebase ID Token** from the signed-in user
5. **Frontend** sends the Firebase ID Token to your **backend** endpoint `/v1/auth/firebase-verify`
6. **Backend** verifies the token using Firebase Admin SDK, creates/finds the user, and returns your app's own JWT (`accessToken`) + user data

---

## Architecture

```
┌─────────────┐    SMS OTP    ┌─────────────┐
│   Firebase   │ ───────────► │   User's     │
│   Auth       │              │   Phone      │
└──────┬───────┘              └──────────────┘
       │
       │ signInWithPhoneNumber / confirm(code)
       │
┌──────▼───────┐   Firebase ID Token   ┌─────────────────┐
│   Frontend   │ ────────────────────► │   Your Backend   │
│   (Expo)     │                       │   /auth/          │
│              │ ◄──────────────────── │   firebase-verify │
│              │   { accessToken,      │                   │
│              │     user }            │   Verifies token  │
└──────────────┘                       │   via Admin SDK   │
                                       └─────────────────┘
```

---

## Frontend ↔ Backend Handshake (Exact Contract)

The app currently uses:

- `API_BASE_URL = https://baza-chi.vercel.app/v1` (from `utils/constants.ts`)
- Frontend call: `api.post("/auth/firebase-verify", body)`

So the **actual network route** is:

- `POST /v1/auth/firebase-verify`

### Request

```json
{
  "firebaseToken": "<Firebase ID token from user.getIdToken()>",
  "phone": "+2348012345678",
  "name": "Thrive",
  "referralCode": "THRIVE200"
}
```

### Success Response (`200`)

```json
{
  "accessToken": "<your-app-jwt>",
  "user": {
    "id": "...",
    "name": "...",
    "phone": "+234..."
  }
}
```

### Failure Responses

- `400`: missing/invalid payload, phone mismatch, invalid JSON
- `401`: invalid/expired/revoked Firebase token
- `404`: route mismatch (backend does not expose `/v1/auth/firebase-verify`)
- `500`: backend Firebase Admin initialization/verification failure

---

## Frontend Implementation (Already Done)

### Files Modified/Created

| File                       | Purpose                                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| `services/firebaseAuth.ts` | Low-level Firebase auth wrapper (`sendOtp`, `confirmOtp`, `getIdToken`, `signOut`)             |
| `services/auth.ts`         | Updated to use Firebase for OTP sending and verification, then sends Firebase token to backend |
| `hooks/useAuth.ts`         | Updated with Firebase error mapping for user-friendly messages                                 |
| `app/(auth)/otp.tsx`       | Updated resend to use `forceResend` parameter                                                  |
| `app.json`                 | Added Firebase plugins, Google services files, and iOS static frameworks config                |

### How the Frontend Flow Works

```typescript
// 1. User enters phone number on SignUp/SignIn screen
//    → requestOtp("+2348012345678") is called
//    → Firebase sends SMS to that number

// 2. User is navigated to OTP screen
//    → User enters 6-digit code
//    → verifyOtp({ phone, otp, name?, referralCode? }) is called

// 3. Inside verifyOtp:
//    a. Firebase confirms the code: confirmation.confirm(code)
//    b. Get Firebase ID Token: user.getIdToken()
//    c. Send to backend: POST /v1/auth/firebase-verify { firebaseToken, phone, name?, referralCode? }
//    d. Backend returns: { accessToken, user }
//    e. App stores the JWT and navigates to main screen
```

---

## Backend Implementation (Django)

### 1. Install Firebase Admin SDK

```bash
pip install firebase-admin
```

Add `firebase-admin` to your `requirements.txt`.

### 2. Initialize Firebase Admin SDK

```python
# config/firebase.py  (or inside your Django settings / apps.py)
import firebase_admin
from firebase_admin import credentials

# Option A: Service account JSON file
cred = credentials.Certificate("path/to/service-account-key.json")
firebase_admin.initialize_app(cred)

# Option B: Environment variable (recommended for production)
# Set GOOGLE_APPLICATION_CREDENTIALS env var pointing to the key file,
# then simply:
# firebase_admin.initialize_app()
```

Call this once at startup — for example in your auth app's `apps.py`:

```python
# auth_app/apps.py
from django.apps import AppConfig

class AuthAppConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "auth_app"

    def ready(self):
        from config.firebase import _  # noqa – triggers initialization
```

> **Getting the Service Account Key:**
>
> 1. Go to [Firebase Console](https://console.firebase.google.com/) → Your Project → Project Settings → Service Accounts
> 2. Click "Generate new private key"
> 3. Save the JSON file securely (never commit to git!)

### 3. Add `firebase_uid` to Your User Model

```python
# models.py  (or in your custom User model)
from django.db import models

class User(models.Model):
    # ... your existing fields ...
    firebase_uid = models.CharField(max_length=128, unique=True, null=True, blank=True)
```

Then run:

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create the Verification View

```python
# views.py
import re
import json
import logging

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from firebase_admin import auth as firebase_auth

from .models import User
from .tokens import generate_access_token, generate_refresh_token  # your JWT helpers

logger = logging.getLogger(__name__)


def normalize_phone(phone: str) -> str:
    """Strip spaces, dashes, parentheses from a phone number."""
    return re.sub(r"[\s\-\(\)]", "", phone)


@csrf_exempt
@require_POST
def firebase_verify(request):
    """
    POST /v1/auth/firebase-verify
    Body: { firebaseToken, phone?, name?, referralCode? }

    Verifies the Firebase ID token, finds or creates the user,
    and returns the app's own JWT + user data.
    """
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    firebase_token = body.get("firebaseToken")
    phone = body.get("phone")
    name = body.get("name")
    referral_code = body.get("referralCode")

    if not firebase_token:
        return JsonResponse({"error": "Firebase token is required"}, status=400)

    # 1. Verify the Firebase ID token
    try:
        decoded_token = firebase_auth.verify_id_token(firebase_token)
    except firebase_auth.InvalidIdTokenError:
        return JsonResponse({"error": "Invalid Firebase token"}, status=401)
    except firebase_auth.ExpiredIdTokenError:
        return JsonResponse({"error": "Token expired. Please sign in again."}, status=401)
    except firebase_auth.RevokedIdTokenError:
        return JsonResponse({"error": "Token revoked. Please sign in again."}, status=401)
    except Exception:
        logger.exception("Firebase token verification failed")
        return JsonResponse({"error": "Authentication failed"}, status=500)

    # 2. Extract the verified phone number
    verified_phone = decoded_token.get("phone_number")
    if not verified_phone:
        return JsonResponse({"error": "Token does not contain a phone number"}, status=400)

    # Optional: verify request phone matches token phone
    if phone and normalize_phone(phone) != normalize_phone(verified_phone):
        return JsonResponse({"error": "Phone number mismatch"}, status=400)

    # 3. Find or create the user
    normalized = normalize_phone(verified_phone)
    user, created = User.objects.get_or_create(
        phone=normalized,
        defaults={
            "name": name or "User",
            "firebase_uid": decoded_token["uid"],
        },
    )

    if created and referral_code:
        handle_referral_bonus(referral_code, user)  # your referral logic

    if not created and not user.firebase_uid:
        user.firebase_uid = decoded_token["uid"]
        user.save(update_fields=["firebase_uid"])

    # 4. Generate your app's own JWTs
    access_token = generate_access_token(user)
    refresh_token = generate_refresh_token(user)

    # 5. Build response
    response = JsonResponse({
        "accessToken": access_token,
        "user": {
            "id": str(user.id),
            "name": user.name,
            "phone": user.phone,
            "email": getattr(user, "email", None),
            "memberSince": str(user.date_joined if hasattr(user, "date_joined") else user.created_at),
            "walletBalance": float(getattr(user, "wallet_balance", 0)),
            "referralCode": getattr(user, "referral_code", ""),
            "notifications": getattr(user, "notifications", {}),
            # ... other fields the frontend User type expects
        },
    })

    # 6. Set refresh token as httpOnly cookie
    response.set_cookie(
        "refreshToken",
        refresh_token,
        httponly=True,
        secure=True,
        samesite="Strict",
        max_age=7 * 24 * 60 * 60,  # 7 days
    )

    return response
```

### 5. Wire Up the URL

```python
# urls.py
from django.urls import path
from .views import firebase_verify

urlpatterns = [
    # ... your existing auth URLs ...
    path("v1/auth/firebase-verify", firebase_verify, name="firebase-verify"),
]
```

If your project-level `urls.py` already prefixes all API routes with `v1/` (for example `path("v1/", include("auth.urls"))`), then keep this app-level route as:

```python
path("auth/firebase-verify", firebase_verify, name="firebase-verify")
```

Do **not** prefix `v1` twice.

### 6. Protect Existing Endpoints (Middleware)

Your existing JWT middleware doesn't change — the backend still issues its own JWTs. Firebase is only used for the initial phone verification. Your middleware continues to verify your own access tokens on protected routes.

### 7. Managing Users

#### Revoking User Sessions

```python
from firebase_admin import auth as firebase_auth

# Revoke all Firebase sessions for a user
firebase_auth.revoke_refresh_tokens(firebase_uid)
```

#### Deleting Users

```python
# When deleting a user from your system, also delete from Firebase
firebase_auth.delete_user(firebase_uid)
```

#### Listing Firebase Users (Admin/Management Command)

```python
# e.g. inside a Django management command
from firebase_admin import auth as firebase_auth

page = firebase_auth.list_users()
for user in page.iterate_all():
    print(user.uid, user.phone_number)
```

---

## Setup Checklist

### Firebase Console

- [ ] Enable **Phone** sign-in provider in Firebase Console → Authentication → Sign-in method
- [ ] Ensure project billing is enabled (Blaze) for the active Firebase/GCP project
- [ ] Ensure APIs are enabled in GCP: `identitytoolkit.googleapis.com` and `fpnv.googleapis.com`
- [ ] Add test phone numbers for development (Firebase Console → Authentication → Sign-in method → Phone → Phone numbers for testing)
- [ ] Download and place `google-services.json` (Android) in project root
- [ ] Download and place `GoogleService-Info.plist` (iOS) in project root
- [ ] Generate Service Account Key for your backend

### Frontend (Already Done)

- [x] Install `@react-native-firebase/app` and `@react-native-firebase/auth`
- [x] Install `expo-build-properties` for iOS static frameworks
- [x] Configure `app.json` with plugins and Google services file paths
- [x] Create `services/firebaseAuth.ts` wrapper
- [x] Update `services/auth.ts` to use Firebase
- [x] Update `hooks/useAuth.ts` with Firebase error handling
- [x] Update OTP screen for resend flow

### Backend (You Need to Do)

- [ ] Install Firebase Admin SDK
- [ ] Initialize Admin SDK with service account
- [ ] Create `POST /auth/firebase-verify` endpoint
- [ ] Add `firebase_uid` column to users table
- [ ] Test with Firebase test phone numbers first

### Build & Deploy

- [ ] Run `npx expo prebuild --clean` to regenerate native projects
- [ ] Test on a **real device** (Firebase Phone Auth doesn't work in Expo Go)
- [ ] Use `npx expo run:ios` or `npx expo run:android` for development builds

---

## Testing

### Test Phone Numbers

Add test phone numbers in Firebase Console to avoid SMS costs during development:

1. Go to Firebase Console → Authentication → Sign-in method → Phone
2. Under "Phone numbers for testing", add:
   - `+234 800 000 0001` → code `123456`
   - `+234 800 000 0002` → code `654321`
3. These numbers will always receive the specified code (no actual SMS sent)

### Important Notes

- Firebase Phone Auth **does NOT work in Expo Go** — you must use a development build
- On **iOS Simulator**, Firebase uses reCAPTCHA fallback (works but looks different)
- On **Android Emulator**, you may need to configure SHA-1 fingerprints
- Always test on **real devices** before release

---

## Troubleshooting (Current Errors)

### 1) `This app is not authorized for Firebase Authentication.`

Usually means Firebase project/app mismatch or provider config mismatch.

Verify all of these:

1. Firebase project is the active one (`baza-c408e`) in both `google-services.json` and `GoogleService-Info.plist`
2. Firebase Android app package name matches app config: `com.baza.mobile`
3. Firebase iOS app bundle ID matches app config: `com.baza.mobile`
4. Phone provider is enabled in Firebase Console
5. Rebuild native app after config changes:
   - `npx expo prebuild --clean`
   - `npx expo run:ios`
   - `npx expo run:android`

### 2) Backend log: `POST /v1/auth/firebase-verify ... 404`

This is a route mismatch, not a Firebase token problem.

Because frontend base URL already includes `/v1`, your backend must resolve:

- `POST /v1/auth/firebase-verify`

Fix by either:

- exposing `/v1/auth/firebase-verify` on backend, **or**
- changing frontend base URL/path combination so the final URL matches your backend router.

Quick validation command:

```bash
curl -i -X POST https://<your-api-host>/v1/auth/firebase-verify \
    -H "Content-Type: application/json" \
    -d '{"firebaseToken":"test"}'
```

If this returns `404`, the backend route is still not wired correctly.

---

## Environment Variables

No additional environment variables are needed on the frontend — Firebase configuration is handled entirely through `google-services.json` and `GoogleService-Info.plist`.

For the backend, you'll need:

```
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
```

Or pass the service account key contents directly as an environment variable for cloud deployments.
