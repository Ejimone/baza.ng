# Notification System API Usage

## Base URLs

| Environment | URL                              |
| ----------- | -------------------------------- |
| Production  | `https://baza-chi.vercel.app/v1` |

This notification system supports:

1. Real-time live notifications over WebSocket.
2. In-app notification inbox via REST APIs.
3. Push notifications via Firebase Cloud Messaging (FCM).
4. Email notifications for key transactional events.

All notification REST endpoints are protected and require:

```http
Authorization: Bearer <accessToken>
```

## Coverage by Event Type

The backend emits notification events for:

- Order created.
- Order status changes (`PENDING`, `CONFIRMED`, `PREPARING`, `DISPATCHED`, `DELIVERED`, `CANCELLED`).
- Payment success confirmation.
- Cart item added, updated, and removed.
- Product status changes for admin users.

## Notification Object Shape

```json
{
  "id": "uuid",
  "eventType": "order_status_changed",
  "title": "Order status updated",
  "body": "Your order ...",
  "audience": "customer",
  "data": {
    "orderId": "uuid",
    "status": "DISPATCHED"
  },
  "isRead": false,
  "readAt": null,
  "createdAt": "2026-03-30T06:00:00+00:00"
}
```

## WebSocket (Live Notifications)

### URL

Use your API host with the websocket path:

- Production: `wss://baza-chi.vercel.app/ws/notifications/?token=<accessToken>`
- Local: `ws://localhost:8000/ws/notifications/?token=<accessToken>`

The server authenticates with the `token` query parameter.

### Groups

- User group: `user_{user_id}_notifications`
- Admin group: `admin_notifications`

Admin users join both groups.

### Connected event

```json
{
  "type": "connected",
  "message": "Notification stream open"
}
```

### Notification event

```json
{
  "type": "notification",
  "notification": {
    "id": "uuid",
    "eventType": "order_created",
    "title": "Order placed",
    "body": "Your order ...",
    "audience": "customer",
    "data": {
      "orderId": "uuid",
      "status": "CONFIRMED"
    },
    "isRead": false,
    "readAt": null,
    "createdAt": "2026-03-30T06:00:00+00:00"
  }
}
```

## Customer Notification Endpoints

### GET /v1/notifications

List in-app notifications for the authenticated user.

Query parameters:

| Param        | Type           | Required | Default | Notes             |
| ------------ | -------------- | -------- | ------- | ----------------- |
| `limit`      | integer        | No       | `20`    | Min 1, max 100    |
| `offset`     | integer        | No       | `0`     | Pagination offset |
| `unreadOnly` | boolean string | No       | `false` | `true` or `false` |

Example:

```bash
curl "https://baza-chi.vercel.app/v1/notifications?limit=20&offset=0&unreadOnly=false" \
  -H "Authorization: Bearer <accessToken>"
```

Response `200`:

```json
{
  "notifications": [
    {
      "id": "uuid",
      "eventType": "order_created",
      "title": "Order placed",
      "body": "Your order ...",
      "audience": "customer",
      "data": {
        "orderId": "uuid",
        "status": "CONFIRMED"
      },
      "isRead": false,
      "readAt": null,
      "createdAt": "2026-03-30T06:00:00+00:00"
    }
  ],
  "count": 1,
  "unreadCount": 1,
  "pagination": {
    "limit": 20,
    "offset": 0
  }
}
```

Errors:

- `401 AUTH_REQUIRED`
- `400 INVALID_PAGINATION`

### PATCH /v1/notifications/{notificationId}/read

Marks one notification as read.

Path parameters:

| Param            | Type | Required |
| ---------------- | ---- | -------- |
| `notificationId` | UUID | Yes      |

Example:

```bash
curl -X PATCH "https://baza-chi.vercel.app/v1/notifications/<notification_id>/read" \
  -H "Authorization: Bearer <accessToken>"
```

Response `200`:

```json
{
  "notification": {
    "id": "uuid",
    "eventType": "order_status_changed",
    "title": "Order status updated",
    "body": "Your order ...",
    "audience": "customer",
    "data": {
      "orderId": "uuid",
      "status": "DISPATCHED"
    },
    "isRead": true,
    "readAt": "2026-03-30T07:00:00+00:00",
    "createdAt": "2026-03-30T06:00:00+00:00"
  }
}
```

Errors:

- `401 AUTH_REQUIRED`
- `404 NOTIFICATION_NOT_FOUND`

### PATCH /v1/notifications/read-all

Marks all unread notifications as read for the authenticated user.

Example:

```bash
curl -X PATCH "https://baza-chi.vercel.app/v1/notifications/read-all" \
  -H "Authorization: Bearer <accessToken>"
```

Response `200`:

```json
{
  "status": "ok"
}
```

Errors:

- `401 AUTH_REQUIRED`

### DELETE /v1/notifications/{notificationId}

Deletes one notification from the authenticated user's inbox.

Path parameters:

| Param            | Type | Required |
| ---------------- | ---- | -------- |
| `notificationId` | UUID | Yes      |

Example:

```bash
curl -X DELETE "https://baza-chi.vercel.app/v1/notifications/<notification_id>" \
  -H "Authorization: Bearer <accessToken>"
```

Response `200`:

```json
{
  "status": "ok"
}
```

Errors:

- `401 AUTH_REQUIRED`
- `404 NOTIFICATION_NOT_FOUND`

## Device Token Endpoints (FCM)

### POST /v1/notifications/device-tokens

Registers or reassigns a device token for push notifications.

Request body:

| Field      | Type   | Required | Notes                              |
| ---------- | ------ | -------- | ---------------------------------- |
| `token`    | string | Yes      | FCM registration token             |
| `platform` | string | No       | `web`, `ios`, `android`, `unknown` |

Example:

```bash
curl -X POST "https://baza-chi.vercel.app/v1/notifications/device-tokens" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"token":"<fcm_token>","platform":"web"}'
```

Response `201`:

```json
{
  "id": "uuid",
  "platform": "web",
  "isActive": true
}
```

Errors:

- `401 AUTH_REQUIRED`
- `400 INVALID_JSON`
- `400 TOKEN_REQUIRED`

### DELETE /v1/notifications/device-tokens/remove

Deactivates a registered token for the current user.

Request body:

| Field   | Type   | Required |
| ------- | ------ | -------- |
| `token` | string | Yes      |

Example:

```bash
curl -X DELETE "https://baza-chi.vercel.app/v1/notifications/device-tokens/remove" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"token":"<fcm_token>"}'
```

Response `200`:

```json
{
  "status": "ok"
}
```

Errors:

- `401 AUTH_REQUIRED`
- `400 INVALID_JSON`
- `400 TOKEN_REQUIRED`
- `404 TOKEN_NOT_FOUND`

## Admin Notification Endpoints

These endpoints require an authenticated admin user (`is_staff` or `is_superuser`).

### GET /v1/admin/notifications

Lists admin notifications for the authenticated admin user.

Query parameters:

| Param    | Type    | Required | Default | Notes             |
| -------- | ------- | -------- | ------- | ----------------- |
| `limit`  | integer | No       | `20`    | Min 1, max 100    |
| `offset` | integer | No       | `0`     | Pagination offset |

Example:

```bash
curl "https://baza-chi.vercel.app/v1/admin/notifications?limit=20&offset=0" \
  -H "Authorization: Bearer <adminAccessToken>"
```

Response `200`:

```json
{
  "notifications": [
    {
      "id": "uuid",
      "eventType": "admin_order_created",
      "title": "New order received",
      "body": "Order ...",
      "audience": "admin",
      "data": {
        "orderId": "uuid",
        "status": "CONFIRMED",
        "userId": "uuid"
      },
      "isRead": false,
      "readAt": null,
      "createdAt": "2026-03-30T06:00:00+00:00"
    }
  ],
  "count": 1
}
```

Errors:

- `401 AUTH_REQUIRED`
- `403 ADMIN_REQUIRED`
- `400 INVALID_PAGINATION`

### PATCH /v1/admin/notifications/{notificationId}/read

Marks one admin notification as read.

Path parameters:

| Param            | Type | Required |
| ---------------- | ---- | -------- |
| `notificationId` | UUID | Yes      |

Example:

```bash
curl -X PATCH "https://baza-chi.vercel.app/v1/admin/notifications/<notification_id>/read" \
  -H "Authorization: Bearer <adminAccessToken>"
```

Response `200`:

```json
{
  "notification": {
    "id": "uuid",
    "eventType": "admin_order_status_changed",
    "title": "Order status changed",
    "body": "Order ...",
    "audience": "admin",
    "data": {
      "orderId": "uuid",
      "status": "DELIVERED"
    },
    "isRead": true,
    "readAt": "2026-03-30T07:00:00+00:00",
    "createdAt": "2026-03-30T06:00:00+00:00"
  }
}
```

Errors:

- `401 AUTH_REQUIRED`
- `403 ADMIN_REQUIRED`
- `404 NOTIFICATION_NOT_FOUND`

## User Preference Mapping

Notification dispatch respects existing user preference fields:

| Preference Field   | Purpose                          |
| ------------------ | -------------------------------- |
| `notif_orders`     | order and payment notifications  |
| `notif_delivery`   | delivery lifecycle notifications |
| `notif_deals`      | promotional broadcasts           |
| `notif_reminders`  | reminder-type notifications      |
| `notif_newsletter` | newsletter notifications         |

## Environment Flags

| Env Var                      | Purpose                                   | Default           |
| ---------------------------- | ----------------------------------------- | ----------------- |
| `NOTIFICATION_PUSH_ENABLED`  | enable/disable FCM delivery               | `true`            |
| `NOTIFICATION_EMAIL_ENABLED` | enable/disable email channel              | `true`            |
| `DEFAULT_FROM_EMAIL`         | sender email used for notification emails | `noreply@baza.ng` |

## Frontend Integration Flow

1. Authenticate user and hold `accessToken` in memory.
2. Register device token after login on each device/app install.
3. Open websocket connection to `/ws/notifications/` using JWT query token.
4. Fetch inbox via `GET /v1/notifications` on app launch.
5. Keep unread badge synced from `unreadCount` in inbox response.
6. Mark read per item or bulk-read when user views notifications.
7. Remove old notifications via delete endpoint when needed.

## Error Codes (Notification APIs)

| Code                     | HTTP | Meaning                                      |
| ------------------------ | ---- | -------------------------------------------- |
| `AUTH_REQUIRED`          | 401  | Missing or invalid access token              |
| `ADMIN_REQUIRED`         | 403  | Endpoint requires admin privileges           |
| `INVALID_JSON`           | 400  | Malformed JSON body                          |
| `INVALID_PAGINATION`     | 400  | Invalid `limit` or `offset`                  |
| `TOKEN_REQUIRED`         | 400  | Missing device token in request              |
| `TOKEN_NOT_FOUND`        | 404  | Device token not found for user              |
| `NOTIFICATION_NOT_FOUND` | 404  | Notification does not exist for current user |
| `METHOD_NOT_ALLOWED`     | 405  | Wrong HTTP method                            |

## Reliability Model

Notification fanout is best-effort and does not block critical business actions.
If push/email delivery fails, core order/payment/cart/product operations still complete.
