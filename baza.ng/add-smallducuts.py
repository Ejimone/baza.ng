import os
import sys

import requests


API_BASE_URL = os.getenv("API_BASE_URL", "http://127.0.0.1:8000/v1")
ACCESS_TOKEN = os.getenv("ACCESS_TOKEN", "")

PRODUCTS = [
    {"id": "i1", "name": "Rolled Oats 1kg", "brand": "Quaker", "emoji": "🌾", "price": 180000, "category": "Grains"},
    {"id": "i2", "name": "Eggs (crate of 30)", "brand": "Farm Fresh", "emoji": "🥚", "price": 280000, "category": "Protein"},
    {"id": "i3", "name": "Sliced Bread", "brand": "Butterfield", "emoji": "🍞", "price": 90000, "category": "Staples"},
    {"id": "i4", "name": "Peak Milk (sachet ×12)", "brand": "Peak", "emoji": "🥛", "price": 340000, "category": "Dairy"},
    {"id": "i5", "name": "Lipton Tea (×50 bags)", "brand": "Lipton", "emoji": "🍵", "price": 120000, "category": "Staples"},
    {"id": "i6", "name": "Wildflower Honey 500g", "brand": "Osuji", "emoji": "🍯", "price": 260000, "category": "Staples"},
    {"id": "i7", "name": "Butter 250g", "brand": "Anchor", "emoji": "🧈", "price": 190000, "category": "Dairy"},
    {"id": "i8", "name": "Strawberry Jam 340g", "brand": "Hartley's", "emoji": "🍓", "price": 180000, "category": "Staples"},
    {"id": "p1", "name": "Chicken (whole, 1.5kg)", "brand": "Farm Fresh", "emoji": "🍗", "price": 480000, "category": "Protein"},
    {"id": "p2", "name": "Beef (1kg)", "brand": "Local Farm", "emoji": "🥩", "price": 520000, "category": "Protein"},
    {"id": "p3", "name": "Fresh Tilapia (1kg)", "brand": "Local Farm", "emoji": "🐟", "price": 360000, "category": "Protein"},
    {"id": "p4", "name": "Eggs (crate of 30)", "brand": "Farm Fresh", "emoji": "🥚", "price": 280000, "category": "Protein"},
    {"id": "p5", "name": "Black-eyed Beans 1kg", "brand": "Local", "emoji": "🫘", "price": 220000, "category": "Protein"},
    {"id": "p6", "name": "Groundnuts 500g", "brand": "Local", "emoji": "🥜", "price": 140000, "category": "Protein"},
    {"id": "s1", "name": "Golden Penny Rice 5kg", "brand": "Golden Penny", "emoji": "🌾", "price": 720000, "category": "Grains"},
    {"id": "s2", "name": "Garri (Ijebu) 5kg", "brand": "Farm Fresh", "emoji": "🌽", "price": 450000, "category": "Grains"},
    {"id": "s3", "name": "Flour 2kg", "brand": "Honeywell", "emoji": "🌫️", "price": 210000, "category": "Grains"},
    {"id": "s4", "name": "Vegetable Oil 5L", "brand": "Kings", "emoji": "🫙", "price": 810000, "category": "Cooking"},
    {"id": "s5", "name": "Tomato Paste ×6 cans", "brand": "Gino", "emoji": "🍅", "price": 210000, "category": "Cooking"},
    {"id": "s6", "name": "Maggi Cubes ×50", "brand": "Maggi", "emoji": "🧂", "price": 95000, "category": "Seasoning"},
    {"id": "s7", "name": "Table Salt 1kg", "brand": "Dangote", "emoji": "🧂", "price": 55000, "category": "Seasoning"},
    {"id": "s8", "name": "Dangote Sugar 2kg", "brand": "Dangote", "emoji": "🍬", "price": 320000, "category": "Staples"},
    {"id": "s9", "name": "Semolina 1kg", "brand": "Honeywell", "emoji": "🟡", "price": 180000, "category": "Grains"},
    {"id": "s10", "name": "Indomie Noodles ×40", "brand": "Indomie", "emoji": "🍜", "price": 480000, "category": "Grains"},
    {"id": "v1", "name": "Eva Water 75cl ×12", "brand": "Eva", "emoji": "💧", "price": 180000, "category": "Drinks"},
    {"id": "v2", "name": "Malt (Big Stout) ×6", "brand": "Big Stout", "emoji": "🍺", "price": 240000, "category": "Drinks"},
    {"id": "v3", "name": "Chivita Juice 1L ×4", "brand": "Chivita", "emoji": "🧃", "price": 320000, "category": "Drinks"},
    {"id": "v4", "name": "Coca-Cola 50cl ×12", "brand": "Coca-Cola", "emoji": "🥤", "price": 360000, "category": "Drinks"},
    {"id": "v5", "name": "Sprite 50cl ×12", "brand": "Sprite", "emoji": "🥤", "price": 340000, "category": "Drinks"},
    {"id": "v6", "name": "Hollandia Yoghurt ×6", "brand": "Hollandia", "emoji": "🍶", "price": 280000, "category": "Dairy"},
    {"id": "r1", "name": "Indomie Noodles ×40", "brand": "Indomie", "emoji": "🍜", "price": 480000, "category": "Grains"},
    {"id": "r2", "name": "Indomie Noodles ×10", "brand": "Indomie", "emoji": "🍜", "price": 135000, "category": "Grains"},
    {"id": "r3", "name": "Peak Milk ×12 sachet", "brand": "Peak", "emoji": "🥛", "price": 340000, "category": "Dairy"},
    {"id": "r4", "name": "Peak Milk ×6 sachet", "brand": "Peak", "emoji": "🥛", "price": 175000, "category": "Dairy"},
    {"id": "r5", "name": "Vegetable Oil 5L", "brand": "Kings", "emoji": "🫙", "price": 810000, "category": "Cooking"},
    {"id": "r6", "name": "Vegetable Oil 2L", "brand": "Kings", "emoji": "🫙", "price": 360000, "category": "Cooking"},
    {"id": "r7", "name": "Golden Penny Rice 5kg", "brand": "Golden Penny", "emoji": "🌾", "price": 720000, "category": "Grains"},
    {"id": "r8", "name": "Golden Penny Rice 10kg", "brand": "Golden Penny", "emoji": "🌾", "price": 1380000, "category": "Grains"},
    {"id": "r9", "name": "Maggi Cubes ×50", "brand": "Maggi", "emoji": "🧂", "price": 95000, "category": "Seasoning"},
    {"id": "r10", "name": "Gino Tomato Paste ×6", "brand": "Gino", "emoji": "🍅", "price": 210000, "category": "Cooking"},
    {"id": "r11", "name": "Garri (Ijebu) 5kg", "brand": "Farm Fresh", "emoji": "🌽", "price": 450000, "category": "Grains"},
    {"id": "r12", "name": "Dangote Sugar 2kg", "brand": "Dangote", "emoji": "🍬", "price": 320000, "category": "Staples"},
    {"id": "r13", "name": "Semolina 1kg", "brand": "Honeywell", "emoji": "🟡", "price": 180000, "category": "Grains"},
    {"id": "r14", "name": "Semolina 5kg", "brand": "Honeywell", "emoji": "🟡", "price": 850000, "category": "Grains"},
    {"id": "r15", "name": "Wheat Flour 2kg", "brand": "Honeywell", "emoji": "🌫️", "price": 210000, "category": "Grains"},
    {"id": "r20", "name": "Chicken (whole, 1.5kg)", "brand": "Farm Fresh", "emoji": "🍗", "price": 480000, "category": "Protein"},
    {"id": "r21", "name": "Beef 1kg", "brand": "Local Farm", "emoji": "🥩", "price": 520000, "category": "Protein"},
    {"id": "r22", "name": "Fresh Tilapia 1kg", "brand": "Local Farm", "emoji": "🐟", "price": 360000, "category": "Protein"},
    {"id": "r23", "name": "Titus Mackerel ×6 cans", "brand": "Titus", "emoji": "🐟", "price": 420000, "category": "Protein"},
    {"id": "r24", "name": "Eggs ×30", "brand": "Farm Fresh", "emoji": "🥚", "price": 450000, "category": "Protein"},
    {"id": "r25", "name": "Eggs ×12", "brand": "Farm Fresh", "emoji": "🥚", "price": 195000, "category": "Protein"},
    {"id": "r26", "name": "Black-eyed Beans 1kg", "brand": "Local", "emoji": "🫘", "price": 220000, "category": "Protein"},
    {"id": "r27", "name": "Black-eyed Beans 5kg", "brand": "Local", "emoji": "🫘", "price": 1050000, "category": "Protein"},
    {"id": "r30", "name": "Palm Oil 1L", "brand": "Buka Fresh", "emoji": "🧡", "price": 240000, "category": "Cooking"},
    {"id": "r31", "name": "Palm Oil 4L", "brand": "Buka Fresh", "emoji": "🧡", "price": 880000, "category": "Cooking"},
    {"id": "r32", "name": "Tomato Stew (frozen, 1kg)", "brand": "Baza Kitchen", "emoji": "🍅", "price": 290000, "category": "Cooking"},
    {"id": "r33", "name": "Crayfish (ground) 100g", "brand": "Local", "emoji": "🦐", "price": 110000, "category": "Cooking"},
    {"id": "r40", "name": "Knorr Chicken ×50", "brand": "Knorr", "emoji": "🧂", "price": 105000, "category": "Seasoning"},
    {"id": "r41", "name": "Cameroon Pepper 100g", "brand": "Local", "emoji": "🌶️", "price": 75000, "category": "Seasoning"},
    {"id": "r42", "name": "Curry Powder 100g", "brand": "Doyin", "emoji": "🟡", "price": 65000, "category": "Seasoning"},
    {"id": "r43", "name": "Thyme 50g", "brand": "Doyin", "emoji": "🌿", "price": 55000, "category": "Seasoning"},
    {"id": "r44", "name": "Table Salt 1kg", "brand": "Dangote", "emoji": "🧂", "price": 55000, "category": "Seasoning"},
    {"id": "r50", "name": "Butter 250g", "brand": "Anchor", "emoji": "🧈", "price": 210000, "category": "Dairy"},
    {"id": "r51", "name": "Hollandia Yoghurt 500ml", "brand": "Hollandia", "emoji": "🥛", "price": 140000, "category": "Dairy"},
    {"id": "r60", "name": "Dangote Sugar 5kg", "brand": "Dangote", "emoji": "🍬", "price": 780000, "category": "Staples"},
    {"id": "r61", "name": "Milo 200g", "brand": "Nestlé", "emoji": "☕", "price": 190000, "category": "Staples"},
    {"id": "r62", "name": "Milo 400g", "brand": "Nestlé", "emoji": "☕", "price": 360000, "category": "Staples"},
    {"id": "r63", "name": "Lipton Yellow Label ×100", "brand": "Lipton", "emoji": "🍵", "price": 120000, "category": "Staples"},
    {"id": "r64", "name": "Nescafé 50g", "brand": "Nescafé", "emoji": "☕", "price": 240000, "category": "Staples"},
    {"id": "r70", "name": "Ariel Washing Powder 1kg", "brand": "Ariel", "emoji": "🧺", "price": 280000, "category": "Household"},
    {"id": "r71", "name": "Omo Detergent 500g", "brand": "Omo", "emoji": "🧺", "price": 140000, "category": "Household"},
    {"id": "r72", "name": "Izal Disinfectant 750ml", "brand": "Izal", "emoji": "🧴", "price": 190000, "category": "Household"},
    {"id": "r73", "name": "Sponge + Scrub ×3", "brand": "Local", "emoji": "🧽", "price": 60000, "category": "Household"},
    {"id": "r74", "name": "Toilet Rolls ×12", "brand": "Innoson", "emoji": "🧻", "price": 220000, "category": "Household"},
    {"id": "r75", "name": "Hand Wash Refill 500ml", "brand": "Dettol", "emoji": "🧴", "price": 170000, "category": "Household"},
]


def main():
    if not ACCESS_TOKEN:
        print("Set ACCESS_TOKEN in your environment before running this script.")
        print("Example:")
        print('  ACCESS_TOKEN="<token>" python add-smallducuts.py')
        sys.exit(1)

    endpoint = f"{API_BASE_URL.rstrip('/')}/products/import-smallproducts"
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }

    response = requests.post(endpoint, json={"products": PRODUCTS}, headers=headers, timeout=60)
    try:
        payload = response.json()
    except Exception:
        payload = {"raw": response.text}

    print("status:", response.status_code)
    print("response:", payload)

    if response.status_code >= 400:
        sys.exit(1)


if __name__ == "__main__":
    main()
