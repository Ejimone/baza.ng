"""Quick script to verify wallet creation on signup."""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User

# Check an existing user
u = User.objects.first()
if u:
    print(f"Existing User: {u.name} ({u.phone})")
    print(f"  wallet_balance: {u.wallet_balance}")
    print(f"  account_number: {u.account_number}")
    print(f"  bank_name: {u.bank_name}")
    print(f"  account_name: {u.account_name}")
    print(f"  paystack_customer_code: {u.paystack_customer_code}")
    print(f"  paystack_dva_assigned: {u.paystack_dva_assigned}")
    print(f"  paystack_dva_account_number: {u.paystack_dva_account_number}")
    print()

# Create a new test user
test_phone = "+2340000099999"
User.objects.filter(phone=test_phone).delete()

new_user = User.objects.create_user(phone=test_phone, name="Test Wallet User")
print(f"New User: {new_user.name} ({new_user.phone})")
print(f"  wallet_balance: {new_user.wallet_balance}")
print(f"  account_number: {new_user.account_number}")
print(f"  bank_name: {new_user.bank_name}")
print(f"  account_name: {new_user.account_name}")
print(f"  paystack_customer_code: {new_user.paystack_customer_code}")
print(f"  paystack_dva_assigned: {new_user.paystack_dva_assigned}")
print(f"  paystack_dva_account_number: {new_user.paystack_dva_account_number}")

wallet_ok = new_user.wallet_balance == 0 and new_user.account_number is not None and len(new_user.account_number) == 10
print(f"\n  WALLET INITIALIZED: {wallet_ok}")

# Cleanup
User.objects.filter(phone=test_phone).delete()
print("  Test user cleaned up")
