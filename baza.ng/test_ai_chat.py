#!/usr/bin/env python3
"""
AI Chat Deep Conversation + Tool Coverage Test

Runs a live conversation against /v1/ai/chat and tracks which backend tools
were actually invoked via message.metadata.toolCalls.

Also verifies:
- GET  /v1/ai/suggestions
- GET  /v1/ai/sessions
- POST /v1/ai/sessions
- GET  /v1/ai/history

Usage:
  export BASE_URL=https://baza-chi.vercel.app
  export TEST_PHONE=+917204218098
  export TEST_OTP=111111
  python test_ai_chat.py

Optional:
  export AUTH_TOKEN=<jwt>
  export REQUIRE_ALL_TOOLS=true   # fail if any tool was not called
"""

import os
import sys

import requests


BASE = os.getenv("BASE_URL", "https://baza-chi.vercel.app").rstrip("/")
TEST_PHONE = os.getenv("TEST_PHONE", "+917204218098")
AUTH_TOKEN = os.getenv("AUTH_TOKEN", "").strip()
TEST_OTP = os.getenv("TEST_OTP", "").strip()
REQUIRE_ALL_TOOLS = os.getenv("REQUIRE_ALL_TOOLS", "false").strip().lower() == "true"

EXPECTED_TOOLS = {
    "search_products",
    "list_bundles",
    "list_mealpacks",
    "list_readyeat",
    "list_snacks",
    "get_product_details",
    "get_product_categories",
    "get_user_profile",
    "get_wallet_balance",
    "list_orders",
    "get_order_status",
    "list_addresses",
    "create_order",
    "add_to_cart",
    "view_cart",
    "remove_from_cart",
    "clear_cart",
    "checkout_cart",
}

passed = 0
failed = 0
session_id = None
called_tools = set()
last_items = []
last_orders = []
cart_candidate_id = None
cart_candidate_name = None


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
    headers.update(
        {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
    )
    return requests.request(method, f"{BASE}{path}", headers=headers, timeout=45, **kwargs)


def get_token() -> str:
    if AUTH_TOKEN:
        return AUTH_TOKEN

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
        "otp-verify failed for all OTP candidates. Last response: "
        f"{last_response.status_code if last_response else 'n/a'} "
        f"{last_response.text if last_response else 'n/a'}"
    )


def test_suggestions(token: str):
    r = _req("GET", "/v1/ai/suggestions", token)
    assert r.status_code == 200, f"expected 200 got {r.status_code}: {r.text}"
    body = r.json()
    assert isinstance(body.get("suggestions"), list), f"invalid suggestions response: {body}"
    print(f"    suggestions count: {len(body['suggestions'])}")


def test_sessions_list(token: str):
    r = _req("GET", "/v1/ai/sessions", token)
    assert r.status_code == 200, f"expected 200 got {r.status_code}: {r.text}"
    body = r.json()
    assert isinstance(body.get("sessions"), list), f"invalid sessions response: {body}"
    print(f"    existing sessions: {len(body['sessions'])}")


def test_session_create(token: str):
    global session_id
    r = _req("POST", "/v1/ai/sessions", token, json={"title": "Full Tool Coverage Chat"})
    assert r.status_code == 201, f"expected 201 got {r.status_code}: {r.text}"
    body = r.json()
    session_id = body.get("session", {}).get("id")
    assert session_id, f"missing session id: {body}"
    print(f"    created session: {session_id}")


def send_chat(token: str, prompt: str):
    global last_items, last_orders, cart_candidate_id, cart_candidate_name
    assert session_id, "session_id missing"

    r = _req(
        "POST",
        "/v1/ai/chat",
        token,
        json={"sessionId": session_id, "message": prompt},
    )
    assert r.status_code == 200, f"chat failed ({r.status_code}): {r.text}"

    body = r.json()
    msg = body.get("message", {})
    metadata = msg.get("metadata") or {}
    tool_calls = metadata.get("toolCalls") or []

    for call in tool_calls:
        name = call.get("name")
        if name:
            called_tools.add(name)

    items = metadata.get("items")
    if isinstance(items, list) and items:
        last_items = items
        for candidate in items:
            if candidate.get("inStock"):
                cart_candidate_id = candidate.get("id")
                cart_candidate_name = candidate.get("name")
                break

    orders = metadata.get("orders")
    if isinstance(orders, list) and orders:
        last_orders = orders

    reply = (msg.get("content") or "")[:120].replace("\n", " ")
    print(f"    user: {prompt[:70]!r}")
    print(f"    ai: {reply!r}")
    if tool_calls:
        print(f"    tools: {[c.get('name') for c in tool_calls]}")
        for i, tc in enumerate(tool_calls):
            name = tc.get("name", "?")
            args = tc.get("arguments") or tc.get("args") or {}
            result = tc.get("result")
            err = tc.get("error")
            print(f"      [{i+1}] {name} args={args}")
            if err:
                print(f"          ERROR: {err}")
            if result is not None:
                print(f"          result: {result}")

    tool_results = metadata.get("toolResults") or metadata.get("tool_results") or []
    if tool_results:
        for i, tr in enumerate(tool_results):
            name = tr.get("name", "?")
            err = tr.get("error")
            result = tr.get("result")
            if err:
                print(f"    tool_result[{i+1}] {name} ERROR: {err}")
            if result is not None:
                print(f"    tool_result[{i+1}] {name} result: {result}")

    if "error" in (reply or "").lower() or "sorry" in (reply or "").lower():
        print(f"    [WARN] AI response suggests error: {reply!r}")
        print(f"    [WARN] full metadata: {metadata}")

    return body


def test_full_conversation(token: str):
    # Intentionally crafted prompts to trigger each tool at least once.
    send_chat(token, "Hi, please check my profile details and show my wallet balance.")
    send_chat(token, "What product categories do you have?")
    send_chat(token, "Search products for rice and show options.")
    send_chat(token, "Show me available bundles.")
    send_chat(token, "Show me meal packs available now.")
    send_chat(token, "Show ready to eat meals.")
    send_chat(token, "Show snacks in stock.")
    send_chat(token, "List my saved addresses.")
    send_chat(token, "Show my recent orders.")

    # Attempt get_order_status using latest known order id if available.
    if last_orders:
        order_id = last_orders[0].get("id")
        if order_id:
            send_chat(token, f"Track this order status: {order_id}")
    else:
        send_chat(token, "Track order status for my latest order.")

    # Attempt get_product_details using latest listed item if available.
    if last_items:
        sample = last_items[0]
        pid = sample.get("id")
        category = (sample.get("category") or "").lower()
        if pid:
            # Infer type from known category labels when possible, default snack.
            inferred_type = "snack"
            if "bundle" in category:
                inferred_type = "bundle"
            elif "meal" in category:
                inferred_type = "mealpack"
            elif "ready" in category:
                inferred_type = "readyeat"
            send_chat(
                token,
                f"Get product details for id {pid} with product_type {inferred_type}.",
            )
    else:
        send_chat(token, "Show details for the first snack item you listed.")

    # Try to trigger create_order. AI policy may ask for confirmation first.
    send_chat(
        token,
        "I want to order 1 snack item costing 50000 kobo. Please prepare the order summary first.",
    )
    send_chat(token, "Yes, I confirm. Please place the order now using wallet.")

    # Explicit structured instruction to strongly force create_order tool call.
    send_chat(
        token,
        "Now call create_order immediately with this exact payload: "
        "items=[{name:'Puff Puff', emoji:'🍩', qty:1, itemType:'SNACK', unitPrice:20000, totalPrice:20000}], "
        "total=20000, note='AI smoke test order'. I confirm and approve this order.",
    )

    send_chat(
        token,
        "FINAL CONFIRMATION: execute create_order tool right now. "
        "Do not ask another question. "
        "Payload: items=[{name:'Egg Roll × 2', emoji:'🥚', qty:1, itemType:'snack', unitPrice:80000, totalPrice:80000}], "
        "total=80000, note='force tool coverage test'. "
        "I fully approve immediate placement even if wallet balance is insufficient.",
    )

    # Cart flow tools coverage
    send_chat(token, "Clear my cart first.")
    if cart_candidate_id:
        send_chat(
            token,
            f"Use add_to_cart now: product_id={cart_candidate_id}, product_type=snack, qty=2.",
        )
    else:
        send_chat(token, "Use add_to_cart now: product_id=puff, product_type=snack, qty=2.")
    send_chat(token, "Show my current cart now.")
    if cart_candidate_id:
        send_chat(
            token,
            f"Use remove_from_cart tool now for product_id={cart_candidate_id} and product_type=snack.",
        )
        send_chat(
            token,
            f"Use add_to_cart now: product_id={cart_candidate_id}, product_type=snack, qty=1.",
        )
    else:
        send_chat(token, "Use remove_from_cart tool now for product_id=puff and product_type=snack.")
        send_chat(token, "Use add_to_cart now: product_id=puff, product_type=snack, qty=1.")

    send_chat(
        token,
        "Use checkout_cart tool now with note='chat checkout test'. Confirmed.",
    )

    print(f"    total unique tools called: {len(called_tools)}")


def test_history(token: str):
    assert session_id, "session_id missing"
    r = _req("GET", f"/v1/ai/history?sessionId={session_id}", token)
    assert r.status_code == 200, f"expected 200 got {r.status_code}: {r.text}"
    body = r.json()
    messages = body.get("messages")
    assert isinstance(messages, list), f"invalid history response: {body}"
    assert len(messages) >= 2, "history should contain multiple messages"
    print(f"    history message count: {len(messages)}")


def test_tool_coverage_report():
    missing = sorted(EXPECTED_TOOLS - called_tools)
    hit = sorted(called_tools)

    print("\n    Tool coverage report")
    print(f"    called ({len(hit)}): {', '.join(hit) if hit else '(none)'}")
    print(f"    missing ({len(missing)}): {', '.join(missing) if missing else '(none)'}")

    if REQUIRE_ALL_TOOLS:
        assert not missing, "Missing required tools: " + ", ".join(missing)


def main():
    print(f"\n🤖 AI Chat Full Conversation Test\n   Base: {BASE}\n")

    token = get_token()
    print(f"    token acquired: {token[:20]}…")

    step("1. GET /v1/ai/suggestions", lambda: test_suggestions(token))
    step("2. GET /v1/ai/sessions", lambda: test_sessions_list(token))
    step("3. POST /v1/ai/sessions", lambda: test_session_create(token))
    step("4. Full conversation (tool calls)", lambda: test_full_conversation(token))
    step("5. GET /v1/ai/history", lambda: test_history(token))
    step("6. Tool coverage report", test_tool_coverage_report)

    print(f"\n{'═' * 50}")
    print(f"  Results: {passed} passed, {failed} failed")
    print(f"{'═' * 50}\n")

    if failed:
        print("⚠ Deep AI conversation test has failures.")
    else:
        print("✅ Deep AI conversation test passed!")

    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
