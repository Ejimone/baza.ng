#!/usr/bin/env python3
"""
Paystack Payment Gateway — Integration Test Script

Tests the Paystack Inline wallet top-up flow against the live API.
Can be used with both the local dev server and the Vercel deployment.

Usage:
  1. Set environment variables:
       export BASE_URL=https://baza-chi.vercel.app
       export TEST_PHONE=+2348012345678
       export AUTH_TOKEN=<your JWT access token>

  2. Run:
       python test_paystack.py

  NOTE: This script does NOT actually charge a card. It tests:
    - GET /v1/wallet/paystack-config → returns public key
    - POST /v1/wallet/topup → initialises a Paystack transaction (server-init flow)
    - GET /v1/wallet/verify-topup?reference=xxx → verifies payment status
"""

import json
import os
import sys

import requests

BASE = os.getenv("BASE_URL", "https://baza-chi.vercel.app").rstrip("/")
TOKEN = os.getenv("AUTH_TOKEN", "")
if not TOKEN:
    print("ERROR: Set AUTH_TOKEN env var to a valid JWT access token.")
    sys.exit(1)

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json",
}

passed = 0
failed = 0


def step(name, fn):
    global passed, failed
    try:
        fn()
        print(f"  ✓ {name}")
        passed += 1
    except AssertionError as e:
        print(f"  ✗ {name} — {e}")
        failed += 1
    except Exception as e:
        print(f"  ✗ {name} — {type(e).__name__}: {e}")
        failed += 1


# ── 1. Paystack Config ──────────────────────────────────────────────────────

def test_paystack_config():
    r = requests.get(f"{BASE}/v1/wallet/paystack-config", headers=HEADERS, timeout=15)
    assert r.status_code == 200, f"expected 200 got {r.status_code}: {r.text}"
    body = r.json()
    assert "publicKey" in body, f"response missing publicKey: {body}"
    pk = body["publicKey"]
    assert pk.startswith("pk_"), f"publicKey should start with pk_: {pk}"
    print(f"    publicKey: {pk[:20]}…")


# ── 2. Get current wallet balance ───────────────────────────────────────────

def test_wallet_balance():
    r = requests.get(f"{BASE}/v1/wallet/balance", headers=HEADERS, timeout=15)
    assert r.status_code == 200, f"expected 200 got {r.status_code}: {r.text}"
    body = r.json()
    assert "balance" in body, f"response missing balance: {body}"
    print(f"    balance: {body['balance']} kobo (₦{body['balance'] / 100:,.2f})")


# ── 3. Server-init topup (Flow B) ──────────────────────────────────────────

topup_reference = None

def test_topup_init():
    global topup_reference
    r = requests.post(
        f"{BASE}/v1/wallet/topup",
        headers=HEADERS,
        json={"amount": 50000, "callbackUrl": "https://baza.ng/callback"},  # ₦500
        timeout=30,
    )
    assert r.status_code == 200, f"expected 200 got {r.status_code}: {r.text}"
    body = r.json()
    assert "authorizationUrl" in body, f"missing authorizationUrl: {body}"
    assert "accessCode" in body, f"missing accessCode: {body}"
    assert "reference" in body, f"missing reference: {body}"
    topup_reference = body["reference"]
    print(f"    authorizationUrl: {body['authorizationUrl'][:60]}…")
    print(f"    accessCode: {body['accessCode']}")
    print(f"    reference: {topup_reference}")


# ── 4. Verify (will fail since no payment was made — expected) ──────────────

def test_verify_pending():
    if not topup_reference:
        raise AssertionError("skipped — no reference from topup")
    r = requests.get(
        f"{BASE}/v1/wallet/verify-topup?reference={topup_reference}",
        headers=HEADERS,
        timeout=15,
    )
    # Expecting either 400 (payment not successful) or 502 (Paystack says abandoned)
    # since we didn't actually pay
    body = r.json()
    print(f"    status: {r.status_code}, body: {json.dumps(body)}")
    assert r.status_code in (400, 502), (
        f"expected 400/502 for unpaid txn, got {r.status_code}: {body}"
    )


# ── 5. Verify with bogus reference (should handle gracefully) ──────────────

def test_verify_bogus():
    r = requests.get(
        f"{BASE}/v1/wallet/verify-topup?reference=bogus_ref_12345",
        headers=HEADERS,
        timeout=15,
    )
    body = r.json()
    print(f"    status: {r.status_code}, body: {json.dumps(body)}")
    # Paystack verify will fail for unknown reference → 502
    assert r.status_code in (400, 502), (
        f"expected 400/502, got {r.status_code}: {body}"
    )


# ── 6. Verify without reference param ──────────────────────────────────────

def test_verify_no_ref():
    r = requests.get(
        f"{BASE}/v1/wallet/verify-topup",
        headers=HEADERS,
        timeout=15,
    )
    assert r.status_code == 400, f"expected 400 got {r.status_code}: {r.text}"
    body = r.json()
    assert body.get("code") == "MISSING_REFERENCE", f"unexpected code: {body}"


# ── Run tests ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print(f"\n🔧 Paystack Integration Test\n   Base: {BASE}\n")

    step("1. GET paystack-config", test_paystack_config)
    step("2. GET wallet/balance", test_wallet_balance)
    step("3. POST wallet/topup (server-init)", test_topup_init)
    step("4. GET verify-topup (pending — expect fail)", test_verify_pending)
    step("5. GET verify-topup (bogus reference)", test_verify_bogus)
    step("6. GET verify-topup (no reference)", test_verify_no_ref)

    print(f"\n{'═' * 50}")
    print(f"  Results: {passed} passed, {failed} failed")
    print(f"{'═' * 50}\n")

    if failed:
        print("⚠ Some tests failed — see details above.")
    else:
        print("✅ All Paystack integration tests passed!")

    sys.exit(1 if failed else 0)
