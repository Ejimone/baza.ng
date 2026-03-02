#!/usr/bin/env python3
"""
AI Chat Endpoint Smoke Test

Tests live /v1/ai/* endpoints:
- GET  /v1/ai/suggestions
- GET  /v1/ai/sessions
- POST /v1/ai/sessions
- POST /v1/ai/chat
- GET  /v1/ai/history?sessionId=...

Auth:
- Prefer AUTH_TOKEN env var if provided
- Else tries OTP flow with TEST_PHONE + TEST_OTP (or fallback OTPs 111111/1111)

Usage:
  export BASE_URL=https://baza-chi.vercel.app
  export TEST_PHONE=+917204218098
  export TEST_OTP=111111
  python test_ai_chat.py

Or with existing token:
  export AUTH_TOKEN=<jwt>
  python test_ai_chat.py
"""

import json
import os
import sys
from typing import Optional

import requests


BASE = os.getenv("BASE_URL", "https://baza-chi.vercel.app").rstrip("/")
TEST_PHONE = os.getenv("TEST_PHONE", "+917204218098")
AUTH_TOKEN = os.getenv("AUTH_TOKEN", "").strip()
TEST_OTP = os.getenv("TEST_OTP", "").strip()

passed = 0
failed = 0
session_id = None


def step(name, fn):
    global passed, failed
    try:
        fn()
        print(f"  ✓ {name}")
        passed += 1
    except AssertionError as err:
        print(f"  ✗ {name} — {err}")
        failed += 1
    except Exception as err:
        print(f"  ✗ {name} — {type(err).__name__}: {err}")
        failed += 1


def _req(method: str, path: str, token: str, **kwargs):
    headers = kwargs.pop("headers", {})
    headers.update({
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    })
    return requests.request(method, f"{BASE}{path}", headers=headers, timeout=30, **kwargs)


def get_token() -> str:
    if AUTH_TOKEN:
        return AUTH_TOKEN

    # Request OTP
    r = requests.post(
        f"{BASE}/v1/auth/otp-request",
        headers={"Content-Type": "application/json"},
        json={"phone": TEST_PHONE},
        timeout=30,
    )
    assert r.status_code == 200, f"otp-request failed: {r.status_code} {r.text}"

    otp_candidates = [TEST_OTP] if TEST_OTP else ["111111", "1111"]
    last_response = None

    for code in otp_candidates:
        r2 = requests.post(
            f"{BASE}/v1/auth/otp-verify",
            headers={"Content-Type": "application/json"},
            json={"phone": TEST_PHONE, "otp": code},
            timeout=30,
        )
        last_response = r2
        if r2.status_code == 200:
            body = r2.json()
            token = body.get("accessToken")
            assert token, f"otp-verify response missing accessToken: {body}"
            print(f"    authenticated with phone {TEST_PHONE} using OTP {code}")
            return token

    raise AssertionError(
        f"otp-verify failed for all OTP candidates. Last response: "
        f"{last_response.status_code if last_response else 'n/a'} {last_response.text if last_response else 'n/a'}"
    )


def test_suggestions(token: str):
    r = _req("GET", "/v1/ai/suggestions", token)
    assert r.status_code == 200, f"expected 200 got {r.status_code}: {r.text}"
    body = r.json()
    assert "suggestions" in body, f"missing suggestions: {body}"
    assert isinstance(body["suggestions"], list), "suggestions should be a list"
    print(f"    suggestions count: {len(body['suggestions'])}")


def test_sessions_list(token: str):
    r = _req("GET", "/v1/ai/sessions", token)
    assert r.status_code == 200, f"expected 200 got {r.status_code}: {r.text}"
    body = r.json()
    assert "sessions" in body, f"missing sessions: {body}"
    assert isinstance(body["sessions"], list), "sessions should be a list"
    print(f"    existing sessions: {len(body['sessions'])}")


def test_session_create(token: str):
    global session_id
    r = _req("POST", "/v1/ai/sessions", token, json={"title": "Smoke Test Chat"})
    assert r.status_code == 201, f"expected 201 got {r.status_code}: {r.text}"
    body = r.json()
    assert "session" in body and "id" in body["session"], f"invalid session response: {body}"
    session_id = body["session"]["id"]
    print(f"    created session: {session_id}")


def test_chat(token: str):
    assert session_id, "session_id missing"
    r = _req(
        "POST",
        "/v1/ai/chat",
        token,
        json={
            "sessionId": session_id,
            "message": "Hello, what can you help me with in this app?",
        },
    )
    assert r.status_code == 200, f"expected 200 got {r.status_code}: {r.text}"
    body = r.json()
    assert "message" in body, f"missing message in response: {body}"
    assert "session" in body, f"missing session in response: {body}"
    assert "provider" in body and "model" in body, f"missing provider/model: {body}"
    content = body["message"].get("content", "")
    print(f"    provider/model: {body.get('provider')} / {body.get('model')}")
    print(f"    assistant reply preview: {content[:90]!r}")


def test_history(token: str):
    assert session_id, "session_id missing"
    r = _req("GET", f"/v1/ai/history?sessionId={session_id}", token)
    assert r.status_code == 200, f"expected 200 got {r.status_code}: {r.text}"
    body = r.json()
    assert "messages" in body, f"missing messages: {body}"
    assert isinstance(body["messages"], list), "messages should be a list"
    print(f"    history message count: {len(body['messages'])}")


def main():
    print(f"\n🤖 AI Chat Smoke Test\n   Base: {BASE}\n")

    token = get_token()
    print(f"    token acquired: {token[:20]}…")

    step("1. GET /v1/ai/suggestions", lambda: test_suggestions(token))
    step("2. GET /v1/ai/sessions", lambda: test_sessions_list(token))
    step("3. POST /v1/ai/sessions", lambda: test_session_create(token))
    step("4. POST /v1/ai/chat", lambda: test_chat(token))
    step("5. GET /v1/ai/history", lambda: test_history(token))

    print(f"\n{'═' * 50}")
    print(f"  Results: {passed} passed, {failed} failed")
    print(f"{'═' * 50}\n")

    if failed:
        print("⚠ Some AI smoke tests failed — see details above.")
    else:
        print("✅ AI smoke tests passed!")

    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
