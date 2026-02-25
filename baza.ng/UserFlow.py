#!/usr/bin/env python3
"""
UserFlow.py — End-to-end user flow test for Baza API
=====================================================

Tests the complete user journey from OTP authentication through checkout.

Usage:
    # Against deployed Vercel instance:
    python UserFlow.py

    # Against local dev:
    BASE_URL=http://localhost:8000 python UserFlow.py

    # With a specific phone number:
    PHONE=+2348012345678 python UserFlow.py

Flow tested:
    1. OTP Request  → POST /v1/auth/otp-request
    2. OTP Verify   → POST /v1/auth/otp-verify  (requires manual OTP input)
    3. Get Profile  → GET  /v1/user/me
    4. Update Profile → PUT /v1/user/profile
    5. Update Notifications → PUT /v1/user/notifications
    6. Create Address → POST /v1/user/addresses/create
    7. List Addresses → GET  /v1/user/addresses/
    8. Update Address → PUT /v1/user/addresses/<id>
    9. Set Default   → PATCH /v1/user/addresses/<id>/default
    10. Browse Products → GET /v1/products/bundles, mealpacks, readyeat, snacks, restock
    11. Get Wallet   → GET  /v1/wallet/balance
    12. Get Transactions → GET /v1/wallet/transactions
    13. Create Order → POST /v1/orders/create
    14. List Orders  → GET  /v1/orders/
    15. Get Order    → GET  /v1/orders/<id>
    16. Referral Stats → GET /v1/referral/stats
    17. Support Thread → GET /v1/support/thread
    18. Send Support Msg → POST /v1/support/message
    19. Refresh Token → POST /v1/auth/refresh
    20. Logout       → POST /v1/auth/logout
    21. Delete Address → DELETE /v1/user/addresses/<id>/delete
"""

import json
import os
import sys
import time

import requests

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
BASE_URL = os.getenv("BASE_URL", "https://baza-chi.vercel.app").rstrip("/")
PHONE = os.getenv("PHONE", "+917204218098")
API = f"{BASE_URL}/v1"

# Session keeps cookies (for baza_refresh)
session = requests.Session()
ACCESS_TOKEN = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def headers():
    h = {"Content-Type": "application/json"}
    if ACCESS_TOKEN:
        h["Authorization"] = f"Bearer {ACCESS_TOKEN}"
    return h


def log_step(step_num, name):
    print(f"\n{'='*60}")
    print(f"  Step {step_num}: {name}")
    print(f"{'='*60}")


def log_result(resp, label="Response"):
    status = resp.status_code
    try:
        body = resp.json()
    except Exception:
        body = resp.text[:500]
    icon = "✅" if 200 <= status < 300 else "❌"
    print(f"  {icon} {label}: {status}")
    print(f"  Body: {json.dumps(body, indent=2, default=str)[:800]}")
    return body


def fail(msg):
    print(f"\n❌ FAILED: {msg}")
    sys.exit(1)


# ---------------------------------------------------------------------------
# Step 1: OTP Request
# ---------------------------------------------------------------------------
def step_otp_request():
    log_step(1, f"OTP Request → {PHONE}")
    resp = session.post(f"{API}/auth/otp-request", json={"phone": PHONE}, headers=headers())
    body = log_result(resp)
    if resp.status_code != 200:
        fail(f"OTP request failed: {body}")
    return body


# ---------------------------------------------------------------------------
# Step 2: OTP Verify (requires manual input)
# ---------------------------------------------------------------------------
def step_otp_verify():
    log_step(2, "OTP Verify (enter OTP from SMS)")
    otp = input("  ➡️  Enter the OTP you received: ").strip()
    if not otp:
        fail("No OTP entered")

    resp = session.post(
        f"{API}/auth/otp-verify",
        json={"phone": PHONE, "otp": otp, "name": "Test User"},
        headers=headers(),
    )
    body = log_result(resp)
    if resp.status_code != 200:
        fail(f"OTP verify failed: {body}")

    global ACCESS_TOKEN
    ACCESS_TOKEN = body.get("accessToken")
    if not ACCESS_TOKEN:
        fail("No accessToken in response")

    print(f"  🔑 Access token received (first 20 chars): {ACCESS_TOKEN[:20]}...")
    print(f"  👤 User: {body.get('user', {}).get('name')} ({body.get('user', {}).get('phone')})")
    return body


# ---------------------------------------------------------------------------
# Step 3: Get Profile
# ---------------------------------------------------------------------------
def step_get_profile():
    log_step(3, "GET /user/me")
    resp = session.get(f"{API}/user/me", headers=headers())
    body = log_result(resp)
    if resp.status_code != 200:
        fail(f"Get profile failed: {body}")
    return body


# ---------------------------------------------------------------------------
# Step 4: Update Profile
# ---------------------------------------------------------------------------
def step_update_profile():
    log_step(4, "PUT /user/profile")
    resp = session.put(
        f"{API}/user/profile",
        json={"name": "Baza Tester", "email": "tester@baza.ng"},
        headers=headers(),
    )
    body = log_result(resp)
    if resp.status_code != 200:
        fail(f"Update profile failed: {body}")
    return body


# ---------------------------------------------------------------------------
# Step 5: Update Notifications
# ---------------------------------------------------------------------------
def step_update_notifications():
    log_step(5, "PUT /user/notifications")
    resp = session.put(
        f"{API}/user/notifications",
        json={"orders": True, "delivery": True, "deals": False, "reminders": True, "newsletter": False},
        headers=headers(),
    )
    body = log_result(resp)
    if resp.status_code != 200:
        fail(f"Update notifications failed: {body}")
    return body


# ---------------------------------------------------------------------------
# Step 6: Create Address
# ---------------------------------------------------------------------------
def step_create_address():
    log_step(6, "POST /user/addresses/create")
    resp = session.post(
        f"{API}/user/addresses/create",
        json={
            "label": "Home",
            "address": "14 Akin Adesola Street, Victoria Island, Lagos",
            "landmark": "Near Access Bank",
        },
        headers=headers(),
    )
    body = log_result(resp)
    if resp.status_code not in (200, 201):
        fail(f"Create address failed: {body}")
    return body


# ---------------------------------------------------------------------------
# Step 7: List Addresses
# ---------------------------------------------------------------------------
def step_list_addresses():
    log_step(7, "GET /user/addresses/")
    resp = session.get(f"{API}/user/addresses/", headers=headers())
    body = log_result(resp)
    if resp.status_code != 200:
        fail(f"List addresses failed: {body}")
    return body


# ---------------------------------------------------------------------------
# Step 8: Update Address
# ---------------------------------------------------------------------------
def step_update_address(address_id):
    log_step(8, f"PUT /user/addresses/{address_id}")
    resp = session.put(
        f"{API}/user/addresses/{address_id}",
        json={"label": "Home (Updated)", "landmark": "Opposite GTBank"},
        headers=headers(),
    )
    body = log_result(resp)
    if resp.status_code != 200:
        fail(f"Update address failed: {body}")
    return body


# ---------------------------------------------------------------------------
# Step 9: Set Default Address
# ---------------------------------------------------------------------------
def step_set_default(address_id):
    log_step(9, f"PATCH /user/addresses/{address_id}/default")
    resp = session.patch(
        f"{API}/user/addresses/{address_id}/default",
        headers=headers(),
    )
    body = log_result(resp)
    if resp.status_code != 200:
        fail(f"Set default address failed: {body}")
    return body


# ---------------------------------------------------------------------------
# Step 10: Browse Products (all categories)
# ---------------------------------------------------------------------------
def step_browse_products():
    log_step(10, "Browse Products (all endpoints)")

    endpoints = [
        ("bundles", "/products/bundles"),
        ("mealpacks", "/products/mealpacks"),
        ("readyeat", "/products/readyeat"),
        ("snacks", "/products/snacks"),
        ("restock", "/products/restock"),
        ("restock+filter", "/products/restock?category=Grains&q=rice"),
    ]

    results = {}
    for name, path in endpoints:
        resp = session.get(f"{API}{path}", headers=headers())
        body = log_result(resp, label=name)
        results[name] = body
        if resp.status_code != 200:
            print(f"  ⚠️  {name} returned {resp.status_code}")

    return results


# ---------------------------------------------------------------------------
# Step 11: Get Wallet Balance
# ---------------------------------------------------------------------------
def step_wallet_balance():
    log_step(11, "GET /wallet/balance")
    resp = session.get(f"{API}/wallet/balance", headers=headers())
    body = log_result(resp)
    if resp.status_code != 200:
        fail(f"Wallet balance failed: {body}")
    return body


# ---------------------------------------------------------------------------
# Step 12: Get Wallet Transactions
# ---------------------------------------------------------------------------
def step_wallet_transactions():
    log_step(12, "GET /wallet/transactions")
    resp = session.get(f"{API}/wallet/transactions", headers=headers())
    body = log_result(resp)
    if resp.status_code != 200:
        fail(f"Wallet transactions failed: {body}")
    return body


# ---------------------------------------------------------------------------
# Step 13: Create Order
# ---------------------------------------------------------------------------
def step_create_order(address_id=None):
    log_step(13, "POST /orders/create")

    order_data = {
        "items": [
            {
                "itemType": "product",
                "productId": "r1",
                "name": "Test Product",
                "emoji": "🧪",
                "qty": 1,
                "unitPrice": 100000,
                "totalPrice": 100000,
            }
        ],
        "total": 100000,
        "note": "Test order from UserFlow.py",
    }
    if address_id:
        order_data["addressId"] = address_id

    resp = session.post(f"{API}/orders/create", json=order_data, headers=headers())
    body = log_result(resp)

    # Order may fail with INSUFFICIENT_BALANCE — that's expected if wallet is 0
    if resp.status_code == 400 and body.get("code") == "INSUFFICIENT_BALANCE":
        print("  ℹ️  Wallet balance is 0 — order declined as expected (INSUFFICIENT_BALANCE)")
        return body

    if resp.status_code not in (200, 201):
        fail(f"Create order failed: {body}")
    return body


# ---------------------------------------------------------------------------
# Step 14: List Orders
# ---------------------------------------------------------------------------
def step_list_orders():
    log_step(14, "GET /orders/")
    resp = session.get(f"{API}/orders/", headers=headers())
    body = log_result(resp)
    if resp.status_code != 200:
        fail(f"List orders failed: {body}")
    return body


# ---------------------------------------------------------------------------
# Step 15: Get Order Detail
# ---------------------------------------------------------------------------
def step_get_order(order_id):
    log_step(15, f"GET /orders/{order_id}")
    resp = session.get(f"{API}/orders/{order_id}", headers=headers())
    body = log_result(resp)
    if resp.status_code != 200:
        print(f"  ⚠️  Order detail returned {resp.status_code}")
    return body


# ---------------------------------------------------------------------------
# Step 16: Referral Stats
# ---------------------------------------------------------------------------
def step_referral_stats():
    log_step(16, "GET /referral/stats")
    resp = session.get(f"{API}/referral/stats", headers=headers())
    body = log_result(resp)
    if resp.status_code != 200:
        fail(f"Referral stats failed: {body}")
    return body


# ---------------------------------------------------------------------------
# Step 17: Support Thread
# ---------------------------------------------------------------------------
def step_support_thread():
    log_step(17, "GET /support/thread")
    resp = session.get(f"{API}/support/thread", headers=headers())
    body = log_result(resp)
    if resp.status_code != 200:
        fail(f"Support thread failed: {body}")
    return body


# ---------------------------------------------------------------------------
# Step 18: Send Support Message
# ---------------------------------------------------------------------------
def step_support_message():
    log_step(18, "POST /support/message")
    resp = session.post(
        f"{API}/support/message",
        json={"text": "Hello, I have a question about my order delivery time."},
        headers=headers(),
    )
    body = log_result(resp)
    if resp.status_code != 200:
        fail(f"Support message failed: {body}")
    return body


# ---------------------------------------------------------------------------
# Step 19: Refresh Token
# ---------------------------------------------------------------------------
def step_refresh():
    log_step(19, "POST /auth/refresh")
    resp = session.post(f"{API}/auth/refresh", headers=headers())
    body = log_result(resp)
    if resp.status_code == 200:
        global ACCESS_TOKEN
        ACCESS_TOKEN = body.get("accessToken", ACCESS_TOKEN)
        print(f"  🔑 New access token received")
    else:
        print(f"  ⚠️  Refresh failed (may be expected if no cookie): {body}")
    return body


# ---------------------------------------------------------------------------
# Step 20: Logout
# ---------------------------------------------------------------------------
def step_logout():
    log_step(20, "POST /auth/logout")
    resp = session.post(f"{API}/auth/logout", headers=headers())
    body = log_result(resp)
    if resp.status_code != 200:
        print(f"  ⚠️  Logout returned {resp.status_code}")
    return body


# ---------------------------------------------------------------------------
# Step 21: Delete Address (cleanup)
# ---------------------------------------------------------------------------
def step_delete_address(address_id):
    log_step(21, f"DELETE /user/addresses/{address_id}/delete")
    resp = session.delete(f"{API}/user/addresses/{address_id}/delete", headers=headers())
    body = log_result(resp)
    return body


# ===========================================================================
# Main Flow
# ===========================================================================
def main():
    print("=" * 60)
    print("  BAZA USER FLOW TEST")
    print(f"  Base URL: {BASE_URL}")
    print(f"  Phone: {PHONE}")
    print("=" * 60)

    # AUTH
    step_otp_request()
    step_otp_verify()

    # USER PROFILE
    step_get_profile()
    step_update_profile()
    step_update_notifications()

    # ADDRESSES
    addr = step_create_address()
    address_id = addr.get("id")

    step_list_addresses()

    if address_id:
        step_update_address(address_id)
        step_set_default(address_id)

    # PRODUCTS
    step_browse_products()

    # WALLET
    step_wallet_balance()
    step_wallet_transactions()

    # ORDERS
    order_result = step_create_order(address_id)
    step_list_orders()

    order_id = None
    if isinstance(order_result, dict) and "order" in order_result:
        order_id = order_result["order"].get("id")
    if order_id:
        step_get_order(order_id)

    # REFERRALS
    step_referral_stats()

    # SUPPORT
    step_support_thread()
    step_support_message()

    # TOKEN REFRESH
    step_refresh()

    # LOGOUT
    step_logout()

    # CLEANUP
    if address_id:
        # Re-auth to delete (we logged out)
        print("\n  ℹ️  Skipping address delete (already logged out)")

    # SUMMARY
    print("\n" + "=" * 60)
    print("  ✨ USER FLOW TEST COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()
