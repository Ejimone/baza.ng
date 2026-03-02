# Help Me Decide — AI Integration

This document describes the frontend integration implemented for the `Help me decide` screen (`app/(app)/modes/chat.tsx`) using the live AI backend endpoints under `/v1/ai/*`.

## What was implemented

- Replaced support-thread wiring with AI chat wiring.
- Added AI client service: `services/ai.ts`.
- Added AI types: sessions, suggestions, messages, message types, and chat response in `types/index.ts`.
- Updated chat screen flow to:
  - Load quick suggestions from `GET /v1/ai/suggestions`
  - Load latest session from `GET /v1/ai/sessions`
  - Load session history from `GET /v1/ai/history?sessionId=...`
  - Send messages via `POST /v1/ai/chat`
- Added UI handling for structured AI messages:
  - `mcq`: renders tappable options
  - `confirmation`: renders Confirm / Cancel quick actions

## Runtime behavior

1. On screen open, suggestions and latest session are fetched.
2. If a session exists, message history is shown.
3. Sending a message appends the user bubble immediately.
4. The AI response is appended when `/v1/ai/chat` returns.
5. Session ID is persisted in local component state for subsequent turns.

## Endpoint contract used

- `GET /v1/ai/suggestions`
- `GET /v1/ai/sessions`
- `POST /v1/ai/sessions`
- `POST /v1/ai/chat`
- `GET /v1/ai/history?sessionId=...`

## Verification

The backend smoke script was executed successfully before implementation:

- Script: `AI-part.py`
- Result: `5 passed, 0 failed`
- Provider/model observed: `OpenAI Production / GPT-4o Mini`
