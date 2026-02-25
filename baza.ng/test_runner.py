#!/usr/bin/env python3
"""Run all test steps against the live Vercel API."""
import json
import requests

API = "https://baza-chi.vercel.app/v1"
PHONE = "+917204218098"
OTP = "1111"
s = requests.Session()

def h(token=None):
    hd = {"Content-Type": "application/json"}
    if token:
        hd["Authorization"] = f"Bearer {token}"
    return hd

def p(label, resp):
    try:
        body = resp.json()
    except Exception:
        body = resp.text[:300]
    icon = "✅" if 200 <= resp.status_code < 300 else "❌"
    print(f"\n{icon} {label}: {resp.status_code}")
    print(json.dumps(body, indent=2, default=str)[:600])
    return body

# Step 2: Verify OTP
print("=" * 50)
print("Step 2: OTP Verify")
resp = s.post(f"{API}/auth/otp-verify", json={"phone": PHONE, "otp": OTP, "name": "Test User"}, headers=h())
body = p("otp-verify", resp)
if resp.status_code != 200:
    print("FAILED - stopping")
    exit(1)

TOKEN = body["accessToken"]
print(f"Token: {TOKEN[:30]}...")

# Step 3: GET /user/me
resp = s.get(f"{API}/user/me", headers=h(TOKEN))
p("GET /user/me", resp)

# Step 4: PUT /user/profile
resp = s.put(f"{API}/user/profile", json={"name": "Baza Tester", "email": "tester@baza.ng"}, headers=h(TOKEN))
p("PUT /user/profile", resp)

# Step 5: PUT /user/notifications
resp = s.put(f"{API}/user/notifications", json={"orders": True, "delivery": True, "deals": False, "reminders": True, "newsletter": False}, headers=h(TOKEN))
p("PUT /user/notifications", resp)

# Step 6: POST address
resp = s.post(f"{API}/user/addresses/create", json={"label": "Home", "address": "14 Akin Adesola St, VI Lagos", "landmark": "Near Access Bank"}, headers=h(TOKEN))
addr = p("POST /user/addresses/create", resp)
addr_id = addr.get("id")

# Step 7: GET addresses
resp = s.get(f"{API}/user/addresses/", headers=h(TOKEN))
p("GET /user/addresses/", resp)

# Step 8: PUT address
if addr_id:
    resp = s.put(f"{API}/user/addresses/{addr_id}", json={"label": "Home Updated", "landmark": "Opposite GTBank"}, headers=h(TOKEN))
    p(f"PUT /user/addresses/{addr_id}", resp)

    # Step 9: PATCH default
    resp = s.patch(f"{API}/user/addresses/{addr_id}/default", headers=h(TOKEN))
    p(f"PATCH default", resp)

# Step 10: Products
for name, path in [("bundles", "/products/bundles"), ("mealpacks", "/products/mealpacks"), ("readyeat", "/products/readyeat"), ("snacks", "/products/snacks"), ("restock", "/products/restock")]:
    resp = s.get(f"{API}{path}", headers=h(TOKEN))
    p(f"GET {path}", resp)

# Step 11: Wallet balance
resp = s.get(f"{API}/wallet/balance", headers=h(TOKEN))
p("GET /wallet/balance", resp)

# Step 12: Wallet transactions
resp = s.get(f"{API}/wallet/transactions", headers=h(TOKEN))
p("GET /wallet/transactions", resp)

# Step 13: Create order
resp = s.post(f"{API}/orders/create", json={
    "items": [{"itemType": "product", "productId": "r1", "name": "Test Product", "emoji": "🧪", "qty": 1, "unitPrice": 100000, "totalPrice": 100000}],
    "total": 100000,
    "note": "Test order from test_runner.py",
    "addressId": addr_id,
}, headers=h(TOKEN))
order_body = p("POST /orders/create", resp)

# Step 14: List orders
resp = s.get(f"{API}/orders/", headers=h(TOKEN))
p("GET /orders/", resp)

# Step 15: Order detail
order_id = None
if isinstance(order_body, dict) and "order" in order_body:
    order_id = order_body["order"]["id"]
    resp = s.get(f"{API}/orders/{order_id}", headers=h(TOKEN))
    p(f"GET /orders/{order_id}", resp)

# Step 16: Referral stats
resp = s.get(f"{API}/referral/stats", headers=h(TOKEN))
p("GET /referral/stats", resp)

# Step 17: Support thread
resp = s.get(f"{API}/support/thread", headers=h(TOKEN))
p("GET /support/thread", resp)

# Step 18: Send support message
resp = s.post(f"{API}/support/message", json={"text": "Hello, question about delivery time."}, headers=h(TOKEN))
p("POST /support/message", resp)

# Step 19: Refresh
resp = s.post(f"{API}/auth/refresh", headers=h(TOKEN))
refresh_body = p("POST /auth/refresh", resp)
if resp.status_code == 200:
    TOKEN = refresh_body.get("accessToken", TOKEN)

# Step 20: Logout
resp = s.post(f"{API}/auth/logout", headers=h(TOKEN))
p("POST /auth/logout", resp)

print("\n" + "=" * 50)
print("✨ ALL STEPS COMPLETE")
print("=" * 50)
