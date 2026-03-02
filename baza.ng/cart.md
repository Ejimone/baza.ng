# Cart API Integration Guide

This document covers everything needed to integrate cart functionality on the frontend.

## Overview

The cart is now **server-side and persistent per authenticated user**.

- Manual frontend cart actions and AI chat cart actions use the same backend cart state.
- Cart data is stored in `orders.CartItem`.
- Prices are returned in **kobo** (integer) plus formatted strings for display.

Base URL (production):

- `https://baza-chi.vercel.app`

Route prefix:

- `/v1/orders`

Auth:

- All cart endpoints require JWT auth.
- Send `Authorization: Bearer <access_token>`.

---

## Supported Cart Item Types

Use one of these values for `itemType`:

- `product`
- `bundle`
- `mealpack`
- `readyeat`
- `snack`

`productId` should be the ID from the corresponding products endpoint response.

---

## Data Shapes

### Cart summary response

```json
{
  "items": [
    {
      "id": "f5dd237f-cf16-42cb-8110-1ff5f3e9e53d",
      "productId": "e7cb9a0f-7c8f-4955-9877-72f4f4f1fd58",
      "itemType": "product",
      "name": "Peppered Turkey",
      "emoji": "🍗",
      "imageUrl": "https://...",
      "qty": 2,
      "unitPrice": 350000,
      "totalPrice": 700000,
      "priceFormatted": "₦3,500",
      "totalFormatted": "₦7,000",
      "meta": null,
      "updatedAt": "2026-03-02T09:41:11.112233+00:00"
    }
  ],
  "count": 1,
  "total": 700000,
  "totalFormatted": "₦7,000"
}
```

Notes:
- `count` = number of unique cart rows (not total quantity).
- `total` = sum of each row `totalPrice` in kobo.
- Items are ordered by most recently updated.

---

## Endpoints

### 1) Get cart

`GET /v1/orders/cart`

Returns current cart summary.

**Success (200)**
- Returns the cart summary shape shown above.

---

### 2) Add item to cart

`POST /v1/orders/cart/items`

Request body:

```json
{
  "productId": "e7cb9a0f-7c8f-4955-9877-72f4f4f1fd58",
  "itemType": "product",
  "qty": 2
}
```

Rules:
- `productId` and `itemType` are required.
- `qty` defaults to `1` when omitted.
- `qty` is clamped to minimum `1`.
- If the same `productId + itemType` already exists for this user, quantity is incremented.

**Success (201)**

```json
{
  "success": true,
  "message": "Added Peppered Turkey x2 to cart",
  "items": ["..."],
  "count": 1,
  "total": 700000,
  "totalFormatted": "₦7,000"
}
```

Possible errors:
- `400 MISSING_FIELDS` → `productId and itemType are required`
- `400 INVALID_JSON`
- `400 NOT_FOUND` → product not found/inactive
- `400 OUT_OF_STOCK`

---

### 3) Update cart item quantity

`PATCH /v1/orders/cart/items/:itemId`

Request body:

```json
{
  "qty": 3
}
```

Rules:
- `qty` is required and must be an integer.
- If `qty <= 0`, item is removed.

**Success (200)**

```json
{
  "success": true,
  "message": "Cart item updated",
  "items": ["..."],
  "count": 1,
  "total": 1050000,
  "totalFormatted": "₦10,500"
}
```

Or when `qty <= 0`:

```json
{
  "success": true,
  "message": "Item removed from cart",
  "items": [],
  "count": 0,
  "total": 0,
  "totalFormatted": "₦0"
}
```

Possible errors:
- `400 INVALID_JSON`
- `400 MISSING_QTY`
- `400 INVALID_QTY`
- `404 NOT_FOUND` (cart item ID not found for user)

---

### 4) Remove one cart item

`DELETE /v1/orders/cart/items/:itemId`

Removes that specific cart row.

**Success (200)**

```json
{
  "success": true,
  "message": "Item removed from cart",
  "items": ["..."],
  "count": 0,
  "total": 0,
  "totalFormatted": "₦0"
}
```

Possible errors:
- `404 NOT_FOUND` (item not found)

---

### 5) Clear cart

`DELETE /v1/orders/cart/clear`

Removes all items for the authenticated user.

**Success (200)**

```json
{
  "success": true,
  "message": "Cart cleared",
  "items": [],
  "count": 0,
  "total": 0,
  "totalFormatted": "₦0"
}
```

---

## Common Error Format

All errors use:

```json
{
  "error": "Human readable message",
  "code": "ERROR_CODE"
}
```

Common status codes:
- `401 AUTH_REQUIRED` (missing/invalid JWT)
- `400` validation/input errors
- `404 NOT_FOUND`
- `405 METHOD_NOT_ALLOWED`

---

## Frontend Integration Flow (Recommended)

1. On app/page load, call `GET /v1/orders/cart` and hydrate your cart store.
2. On “Add to cart”, call `POST /v1/orders/cart/items`.
3. On quantity stepper change, call `PATCH /v1/orders/cart/items/:itemId`.
4. On remove button, call `DELETE /v1/orders/cart/items/:itemId`.
5. On “Clear cart”, call `DELETE /v1/orders/cart/clear`.
6. After each mutation, replace local state with the response `items/count/total` (do not manually recalculate).

---

## AI Chat Synchronization

AI cart tools now use the same backend cart service as these endpoints:

- AI `add_to_cart` → shared add logic
- AI `view_cart` → shared summary
- AI `remove_from_cart` → shared remove logic
- AI `clear_cart` → shared clear logic
- AI `checkout_cart` reads this same cart and clears it after successful checkout

Meaning:
- If AI adds an item, frontend immediately sees it via `GET /v1/orders/cart`.
- If frontend updates/removes items, AI sees updated cart state in the next chat action.

---

## cURL Smoke Test Sequence

```bash
BASE="https://baza-chi.vercel.app"
TOKEN="<JWT_ACCESS_TOKEN>"
PRODUCT_ID="<product_or_bundle_or_mealpack_or_readyeat_or_snack_id>"

# Add
curl -s -X POST "$BASE/v1/orders/cart/items" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"itemType\":\"product\",\"qty\":2}" | jq

# List
curl -s "$BASE/v1/orders/cart" \
  -H "Authorization: Bearer $TOKEN" | jq

# Update (replace <ITEM_ID> with item id from list response)
curl -s -X PATCH "$BASE/v1/orders/cart/items/<ITEM_ID>" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"qty":3}' | jq

# Remove one
curl -s -X DELETE "$BASE/v1/orders/cart/items/<ITEM_ID>" \
  -H "Authorization: Bearer $TOKEN" | jq

# Clear all
curl -s -X DELETE "$BASE/v1/orders/cart/clear" \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## Checkout Note

Cart endpoints only manage cart state.
To place an order, use order checkout endpoints (`/v1/orders/create` or `/v1/orders/direct-checkout`) with cart items mapped into order payload format.
