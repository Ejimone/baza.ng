# Address and Phone Number Update (Frontend Integration)

This guide shows how the frontend should collect and save phone number and delivery address before checkout.

## API Base
- Production: `https://baza-chi.vercel.app`

## Auth Requirement

All endpoints below require:

- Header: `Authorization: Bearer <accessToken>`
- Header: `Content-Type: application/json`

Get `accessToken` first by exchanging Firebase ID token:

- `POST /v1/auth/firebase-verify`

---

## 1) Update Phone Number

### Endpoint

- `PUT /v1/user/phone`

### Request

```json
{
  "phone": "+2348030001122"
}
```

### Success (`200`)

```json
{
  "id": "uuid",
  "name": "Evidence Ejimone",
  "phone": "+2348030001122",
  "email": "opencodehq@gmail.com",
  "memberSince": "2026-03-06T06:02:14.617073+00:00"
}
```

### Common Errors

- `400 PHONE_REQUIRED`
- `409 PHONE_ALREADY_REGISTERED`
- `401 ACCESS_TOKEN_EXPIRED` (or invalid auth)

---

## 2) Create Address

### Endpoint

- `POST /v1/user/addresses/create`

### Request

```json
{
  "label": "Home",
  "address": "12 Admiralty Way, Lekki",
  "landmark": "Beside fuel station"
}
```

### Success (`201`)

```json
{
  "id": "06d7b56c-7945-490b-91ba-8bf0b9c051a4",
  "label": "Home",
  "address": "12 Admiralty Way, Lekki",
  "landmark": "Beside fuel station",
  "isDefault": true
}
```

### Common Errors

- `400 MISSING_FIELDS`
- `401` for missing/expired token

---

## 3) Update Existing Address

### Endpoint

- `PUT /v1/user/addresses/{addressId}`

### Request

```json
{
  "label": "Home",
  "address": "14 Admiralty Way, Lekki Phase 1",
  "landmark": "Opposite supermarket"
}
```

### Success (`200`)

Returns the updated address object.

### Common Errors

- `404 NOT_FOUND` when address is not owned by the signed-in user
- `401` for missing/expired token

---

## Checkout Prerequisite Rules

Order creation now enforces these requirements in backend:

- User must have a phone number: else `400 PHONE_REQUIRED`
- Request must include `addressId`: else `400 ADDRESS_REQUIRED`
- `addressId` must belong to user: else `404 ADDRESS_NOT_FOUND`

Applies to:

- `POST /v1/orders/create`
- `POST /v1/orders/direct-checkout`
- `GET /v1/orders/verify-payment?reference=...`

---

## Recommended Frontend UX Flow

1. User signs in and app calls `GET /v1/user/me`.
2. If `phone` is empty, open phone capture screen and call `PUT /v1/user/phone`.
3. Load address list from `GET /v1/user/addresses/`.
4. If list is empty, force address creation using `POST /v1/user/addresses/create`.
5. During checkout, require a selected `addressId` before calling order endpoints.
6. If backend returns `PHONE_REQUIRED` or `ADDRESS_REQUIRED`, redirect user to completion step instead of showing generic error toast.

---

## React Native Example (Fetch)

```javascript
export async function updatePhone(apiBaseUrl, accessToken, phone) {
  const res = await fetch(`${apiBaseUrl}/v1/user/phone`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phone }),
  });

  const body = await res.json();
  if (!res.ok) throw body;
  return body;
}

export async function createAddress(apiBaseUrl, accessToken, payload) {
  const res = await fetch(`${apiBaseUrl}/v1/user/addresses/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await res.json();
  if (!res.ok) throw body;
  return body;
}

export async function updateAddress(apiBaseUrl, accessToken, addressId, payload) {
  const res = await fetch(`${apiBaseUrl}/v1/user/addresses/${addressId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await res.json();
  if (!res.ok) throw body;
  return body;
}
```

---

## Quick cURL Reference

```bash
# 1) Verify Firebase token
curl -X POST http://127.0.0.1:8003/v1/auth/firebase-verify \
  -H 'Content-Type: application/json' \
  --data '{"idToken":"<FIREBASE_ID_TOKEN>"}'

# 2) Update phone
curl -X PUT http://127.0.0.1:8003/v1/user/phone \
  -H 'Authorization: Bearer <ACCESS_TOKEN>' \
  -H 'Content-Type: application/json' \
  --data '{"phone":"+2348030001122"}'

# 3) Create address
curl -X POST http://127.0.0.1:8003/v1/user/addresses/create \
  -H 'Authorization: Bearer <ACCESS_TOKEN>' \
  -H 'Content-Type: application/json' \
  --data '{"label":"Home","address":"12 Admiralty Way, Lekki","landmark":"Beside fuel station"}'

# 4) Update address
curl -X PUT http://127.0.0.1:8003/v1/user/addresses/<ADDRESS_ID> \
  -H 'Authorization: Bearer <ACCESS_TOKEN>' \
  -H 'Content-Type: application/json' \
  --data '{"label":"Home","address":"14 Admiralty Way, Lekki Phase 1","landmark":"Opposite supermarket"}'
```
