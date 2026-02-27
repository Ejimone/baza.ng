import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("TERMII_API_KEY")
if not api_key:
    # Try fetching from EXPO_PUBLIC as fallback
    api_key = os.getenv("EXPO_PUBLIC_TERMII_API_KEY")

if not api_key:
    print("Error: TERMII_API_KEY not found in environment variables.")
    exit(1)

url = "https://v3.api.termii.com/api/sender-id/request"

payload = {
    "api_key": api_key,
    "sender_id": "bazang",
    "use_case": "otp verification for signup",
    "company": "baza.ng"
}

headers = {
    'Content-Type': 'application/json',
}

try:
    print(f"Requesting Sender ID 'bazang'...")
    response = requests.request("POST", url, headers=headers, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
