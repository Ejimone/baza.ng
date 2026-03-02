# Baza AI Assistant — Frontend Integration Guide

> Complete API reference for integrating the AI chat feature into the Baza mobile/web app.

## this is the users part, the admin section is not here, but its done in the backend

## Table of Contents

1. [Overview](#overview)
2. [Setup (Admin)](#setup-admin)
3. [API Endpoints](#api-endpoints)
4. [Message Types & Rendering](#message-types--rendering)
5. [Function Calling & Tool Results](#function-calling--tool-results)
6. [Quick-Action Suggestions](#quick-action-suggestions)
7. [Example Flows](#example-flows)
8. [Error Handling](#error-handling)

---

## Overview

The AI assistant lets users have personalised conversations with an intelligent agent that can:

- 🔍 Search & browse products (groceries, bundles, meal packs, ready-to-eat, snacks)
- 🛒 Place orders via wallet payment
- 💰 Check wallet balance & account details
- 📦 View order history & track orders
- 📍 View saved delivery addresses
- 🎯 Get personalised recommendations

The AI knows the user's **name** and addresses them personally. All responses include structured metadata so the frontend can render **rich UI** (product cards, MCQ choices, order confirmations — not just plain text).

### Architecture

```
Frontend ──→ POST /v1/ai/chat ──→ AI Service ──→ Active LLM (OpenAI/Gemini)
                                       │
                                       ├──→ Tool Calls (search products, place orders, etc.)
                                       │
                                       └──→ Structured Response (product_list, mcq, etc.)
```

Admin can switch LLM providers and models via Django Admin (`/admin/ai_chat/llmmodel/`) with **zero downtime**.

---

## Setup (Admin)

Before the AI works, the admin must configure at least one LLM provider and model via Django Admin:

### 0. Set Environment Variables (Required)

LLM API keys are read from environment variables in both local and production.
You do **not** need to store keys in Django Admin.

Use these variables:

- `OPENAI_API_KEY` for OpenAI
- `GOOGLE_GENAI_API_KEY` (or `GEMINI_API_KEY` / `GOOGLE_API_KEY`) for Gemini

If no env key is set, the backend can optionally fall back to the provider `api_key` field in admin.

### 1. Add an LLM Provider

Go to **Django Admin → AI Chat → LLM Providers → Add**

| Field         | Example (OpenAI)              | Example (Gemini)              |
| ------------- | ----------------------------- | ----------------------------- |
| Name          | OpenAI Production             | Google Gemini                 |
| Provider type | OpenAI                        | Google Gemini                 |
| API key       | _(leave empty — env is used)_ | _(leave empty — env is used)_ |
| Is active     | ✅                            | ✅                            |

### 2. Add an LLM Model

Go to **Django Admin → AI Chat → LLM Models → Add**

| Field        | Example (GPT-4)   | Example (Gemini) |
| ------------ | ----------------- | ---------------- |
| Provider     | OpenAI Production | Google Gemini    |
| Name         | gpt-4             | gemini-2.0-flash |
| Display name | GPT-4             | Gemini 2.0 Flash |
| Is active    | ✅                | ☐                |
| Max tokens   | 4096              | 4096             |
| Temperature  | 0.7               | 0.7              |

> **⚠️ Only ONE model can be active at a time.** Setting a model as active automatically deactivates all others.

### 2.1 Recommended Production Setup

- Create provider records in admin with **empty API key**.
- Keep secrets only in environment variables.
- Activate exactly one model for runtime usage.

### 3. Switching Models

To switch from GPT-4 to Gemini (or any other model):

1. Go to **LLM Models** list
2. Check the box next to the desired model
3. Select **"Set selected model as active"** from the actions dropdown
4. Click **Go**

No server restart needed — the change takes effect immediately.

---

## API Endpoints

All endpoints require **JWT authentication** via the `Authorization: Bearer <token>` header.

### `POST /v1/ai/chat` — Send Chat Message

The main endpoint. Sends a message and receives the AI's response.

**Request:**

```json
{
  "message": "Show me some snacks",
  "sessionId": "uuid-optional"
}
```

| Field       | Type          | Required | Notes                             |
| ----------- | ------------- | -------- | --------------------------------- |
| `message`   | string        | ✅       | The user's message                |
| `sessionId` | string (UUID) | ❌       | Omit to auto-create a new session |

**Response (200):**

```json
{
  "message": {
    "id": "a3b8d1b6-...",
    "role": "assistant",
    "content": "Here are some snacks for you, Evidence! 🍿\n\n1. Pringles Original — ₦1,500\n2. ...",
    "messageType": "product_list",
    "metadata": {
      "items": [
        {
          "id": "snack-001",
          "name": "Pringles Original",
          "price": 150000,
          "priceFormatted": "₦1,500",
          "category": "Chips",
          "imageUrl": "https://res.cloudinary.com/...",
          "inStock": true
        }
      ],
      "toolName": "list_snacks",
      "toolCalls": [{ "name": "list_snacks", "arguments": {} }],
      "toolResults": [{ "name": "list_snacks", "result": "..." }]
    },
    "createdAt": "2026-03-02T10:45:00+00:00"
  },
  "session": {
    "id": "session-uuid",
    "title": "Show me some snacks"
  },
  "model": "GPT-4",
  "provider": "OpenAI"
}
```

---

### `GET /v1/ai/history?sessionId=uuid` — Chat History

**Query params:**

| Param       | Type | Default  | Notes            |
| ----------- | ---- | -------- | ---------------- |
| `sessionId` | UUID | required | Session to fetch |
| `page`      | int  | 1        | Page number      |
| `limit`     | int  | 50       | Max 100          |

**Response (200):**

```json
{
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "content": "Hi",
      "messageType": "text",
      "metadata": null,
      "createdAt": "2026-03-02T10:40:00+00:00"
    },
    {
      "id": "msg-2",
      "role": "assistant",
      "content": "Hey Evidence! 👋 How far! ...",
      "messageType": "text",
      "metadata": null,
      "createdAt": "2026-03-02T10:40:01+00:00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 2,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### `GET /v1/ai/sessions` — List Sessions

**Query params:** `page` (default 1), `limit` (default 20, max 50)

**Response (200):**

```json
{
  "sessions": [
    {
      "id": "uuid",
      "title": "Show me some snacks",
      "createdAt": "2026-03-02T10:40:00+00:00",
      "updatedAt": "2026-03-02T10:45:00+00:00"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 3, "totalPages": 1. "hasNext": false, "hasPrev": false }
}
```

### `POST /v1/ai/sessions` — Create New Session

**Request:**

```json
{
  "title": "My Shopping Chat"
}
```

**Response (201):**

```json
{
  "session": {
    "id": "uuid",
    "title": "My Shopping Chat",
    "createdAt": "2026-03-02T..."
  }
}
```

---

### `GET /v1/ai/suggestions` — Quick-Action Suggestions

Returns contextual chips/buttons for the chat UI. Call on chat screen load.

**Response (200):**

```json
{
  "suggestions": [
    { "text": "🛒 Browse products", "action": "browse_products" },
    { "text": "🍱 Show meal packs", "action": "browse_mealpacks" },
    { "text": "🍿 Show snacks", "action": "browse_snacks" },
    { "text": "💰 Check wallet balance", "action": "check_wallet" },
    { "text": "📦 Track my order", "action": "track_order" },
    { "text": "📋 My order history", "action": "order_history" }
  ]
}
```

**Frontend behavior:** When user taps a suggestion, send it as a chat message:

```javascript
// When user taps "🛒 Browse products"
sendMessage("Browse products");
```

---

## Message Types & Rendering

The `messageType` field tells the frontend HOW to render each message. Here's what each type means:

### `text` — Plain Text

Standard chat bubble. Render the `content` as text with markdown support.

```json
{
  "messageType": "text",
  "content": "Hey Evidence! 👋 Welcome to Baza. What can I help you with today?",
  "metadata": null
}
```

### `product_list` — Product Cards

Render items as **swipeable product cards** or a **scrollable list**. The `metadata.items` array contains structured product data.

```json
{
  "messageType": "product_list",
  "content": "Here are some snacks for you! 🍿",
  "metadata": {
    "items": [
      {
        "id": "snack-001",
        "name": "Pringles Original",
        "price": 150000,
        "priceFormatted": "₦1,500",
        "category": "Chips",
        "imageUrl": "https://...",
        "inStock": true
      }
    ],
    "toolName": "list_snacks"
  }
}
```

**Frontend rendering:**

1. Show the `content` as a text message above the cards
2. Render each item as a **product card** with:
   - Image (from `imageUrl`)
   - Name
   - Price (use `priceFormatted`)
   - "Add to cart" / "Order" button
   - Stock indicator (gray out if `inStock: false`)
3. Cards should be horizontally scrollable or in a grid

### `mcq` — Multiple Choice Question

The AI asks the user to choose from numbered options. Render as **tappable buttons/chips**.

```json
{
  "messageType": "mcq",
  "content": "What type of food are you looking for?\n\n1. Ready-to-eat meals 🍱\n2. Groceries for cooking 🛒\n3. Snacks 🍿\n4. Meal bundles 📦",
  "metadata": {
    "options": [
      "Ready-to-eat meals 🍱",
      "Groceries for cooking 🛒",
      "Snacks 🍿",
      "Meal bundles 📦"
    ]
  }
}
```

**Frontend rendering:**

1. Show the question as a text message
2. Render `metadata.options` as a **vertical list of tappable buttons**
3. When tapped, send the option text (or number) as a chat message
4. Disable buttons after one is selected

### `confirmation` — Order Confirmation

The AI is asking the user to confirm an order. Render with a **confirm/cancel button pair**.

```json
{
  "messageType": "confirmation",
  "content": "Here's your order summary:\n\n- Pringles Original x2 — ₦3,000\n- Coca-Cola x3 — ₦1,500\n\nTotal: ₦4,500\n\nShould I place this order?",
  "metadata": {}
}
```

**Frontend rendering:**

1. Show the content as a styled order summary card
2. Add two buttons: **"✅ Confirm Order"** and **"❌ Cancel"**
3. On confirm, send `"Yes, place the order"` as a chat message
4. On cancel, send `"No, cancel"` as a chat message

### `order_summary` — Order Placed/Status

An order was placed or order details were fetched. Show an **order card**.

```json
{
  "messageType": "order_summary",
  "content": "Your order has been placed! 🎉",
  "metadata": {
    "order": {
      "orderId": "uuid",
      "status": "CONFIRMED",
      "total": 450000,
      "totalFormatted": "₦4,500",
      "eta": "Tomorrow by 10am",
      "walletBalance": 1550000,
      "walletFormatted": "₦15,500"
    }
  }
}
```

**Frontend rendering:**

1. Show a success card with green checkmark
2. Display order ID, status, total, ETA
3. Show updated wallet balance
4. Add a "View Order" button linking to the order details page

### `error` — Error Message

Something went wrong. Show with a warning/error style.

```json
{
  "messageType": "error",
  "content": "I'm sorry, no AI model is currently configured. Please contact support.",
  "metadata": null
}
```

---

## Function Calling & Tool Results

The AI automatically calls backend tools when needed. You **don't need to handle tool calls on the frontend** — they happen server-side. The response comes back pre-processed.

### Available Tools (for reference)

| Tool                     | Description       | Triggers When User Says          |
| ------------------------ | ----------------- | -------------------------------- |
| `search_products`        | Search products   | "find rice", "search for oil"    |
| `list_bundles`           | List bundles      | "show me bundles"                |
| `list_mealpacks`         | List meal packs   | "what meal packs are available?" |
| `list_readyeat`          | List ready-to-eat | "ready to eat food"              |
| `list_snacks`            | List snacks       | "show snacks"                    |
| `get_product_details`    | Product details   | "tell me about [product]"        |
| `get_product_categories` | List categories   | "what categories do you have?"   |
| `get_user_profile`       | User profile      | "what's my name?"                |
| `get_wallet_balance`     | Wallet balance    | "check my balance"               |
| `list_orders`            | Order history     | "my orders"                      |
| `get_order_status`       | Order tracking    | "track order [id]"               |
| `list_addresses`         | Saved addresses   | "my addresses"                   |
| `create_order`           | Place order       | "yes, place the order"           |

### Tool Data in Metadata

When tools are called, the response metadata includes:

```json
{
  "metadata": {
    "items": [...],                    // Product data (for rendering cards)
    "toolName": "list_snacks",         // Which tool was called
    "toolCalls": [                     // All tool calls made (for debugging)
      { "name": "list_snacks", "arguments": {} }
    ],
    "toolResults": [                   // Raw tool results (for debugging)
      { "name": "list_snacks", "result": "{...}" }
    ]
  }
}
```

---

## Example Flows

### Flow 1: Browse & Order

```
User: "Show me some snacks"
AI: [messageType: product_list] "Here are some snacks! 🍿" + product cards

User: "I'll take 2 Pringles and 3 Cokes"
AI: [messageType: confirmation] "Here's your order summary: ..." + confirm/cancel buttons

User: [taps Confirm]  → sends "Yes, place the order"
AI: [messageType: order_summary] "Order placed! 🎉" + order card with updated wallet
```

### Flow 2: Check Wallet & Top Up

```
User: "What's my balance?"
AI: [messageType: text] "Your wallet balance is ₦15,500. Your bank account details for top-up are..."
```

### Flow 3: Track Order

```
User: "Track my latest order"
AI: [messageType: order_summary] "Your order #abc123 is CONFIRMED. ETA: Tomorrow by 10am" + order card
```

### Flow 4: MCQ Interaction

```
User: "I want to buy food"
AI: [messageType: mcq] "What type of food? 1. Ready-to-eat 2. Groceries 3. Snacks 4. Bundles"
     → renders 4 tappable buttons

User: [taps "Ready-to-eat meals"]  → sends "Ready-to-eat meals"
AI: [messageType: product_list] "Here are our ready-to-eat options:" + food cards
```

---

## Error Handling

### HTTP Errors

| Status | Code                 | Meaning             |
| ------ | -------------------- | ------------------- |
| 400    | `MISSING_MESSAGE`    | Empty message text  |
| 400    | `INVALID_JSON`       | Malformed JSON body |
| 401    | `AUTH_REQUIRED`      | Missing/invalid JWT |
| 404    | `SESSION_NOT_FOUND`  | Invalid session ID  |
| 405    | `METHOD_NOT_ALLOWED` | Wrong HTTP method   |

### AI Errors

If the AI service encounters an error, you'll get `messageType: "error"` with a user-friendly message:

```json
{
  "message": {
    "messageType": "error",
    "content": "I'm having trouble connecting to my AI service right now. Please try again in a moment."
  }
}
```

### Quick Backend Smoke Test

Run the AI endpoint smoke test:

```bash
/Users/evidenceejimone/baza/venv/bin/python test_ai_chat.py
```

What it verifies:

- `GET /v1/ai/suggestions`
- `GET /v1/ai/sessions`
- `POST /v1/ai/sessions`
- `POST /v1/ai/chat`
- `GET /v1/ai/history`

### No AI Model Configured

If the admin hasn't set an active model, all chat requests return:

```json
{
  "message": {
    "messageType": "error",
    "content": "I'm sorry, no AI model is currently configured. Please contact support."
  },
  "model": null,
  "provider": null
}
```

---

## Database Models

### Chat Models

| Model         | Purpose                                               |
| ------------- | ----------------------------------------------------- |
| `ChatSession` | Groups messages into conversations                    |
| `ChatMessage` | Individual user/assistant messages                    |
| `LLMProvider` | Stores provider name + API key                        |
| `LLMModel`    | Model config (name, tokens, temperature, active flag) |

### Key Fields — ChatMessage

| Field         | Values                                                                                              | Notes                                     |
| ------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `role`        | `user`, `assistant`, `system`, `tool`                                                               | Who sent it                               |
| `messageType` | `text`, `product_list`, `mcq`, `confirmation`, `order_summary`, `error`, `tool_call`, `tool_result` | How to render                             |
| `metadata`    | JSON                                                                                                | Rich payload (items, options, order data) |

---

## Notes for Frontend Engineers

1. **Always check `messageType`** — don't just render `content` as text for all messages
2. **`metadata` is nullable** — only present for rich messages
3. **Products have `imageUrl`** — use it for cards; it may be empty (use a placeholder)
4. **Prices are in kobo** — use `priceFormatted` for display (already Naira-formatted)
5. **Sessions auto-title** — the first user message becomes the session title
6. **Suggestions are contextual** — re-fetch `GET /v1/ai/suggestions` when the user opens the chat
7. **MCQ options are tappable** — send the option text back as a message when tapped
8. **The AI confirms before ordering** — the frontend should render confirm/cancel buttons for `confirmation` type
