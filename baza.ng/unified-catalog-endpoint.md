# Unified Catalog Endpoint

This endpoint reduces frontend requests by returning all product types and their category tabs in one response.

## Endpoint

- **Method:** `GET`
- **URL:** `/v1/products/catalog`
- **Auth:** Bearer JWT required

## Response Shape

```json
{
  "catalog": {
    "restock": {
      "categories": ["All", "Rice", "Beans"],
      "items": [
        {
          "id": "prod_1",
          "name": "Local Rice",
          "brand": "Baza",
          "emoji": "🍚",
          "imageUrl": "",
          "price": 100000,
          "category": "Rice",
          "quantityInStock": 20
        }
      ]
    },
    "snacks": {
      "categories": ["All", "Chips"],
      "items": []
    },
    "bundles": {
      "categories": ["All", "Family"],
      "items": []
    },
    "mealpacks": {
      "categories": ["All", "Party"],
      "items": []
    },
    "readyeat": {
      "categories": ["All", "Lunch"],
      "items": []
    }
  }
}
```

## Notes for Frontend

- Use this endpoint to hydrate all product tabs on initial app load.
- Category tabs are sourced from admin-managed category tables, so newly created categories appear even if no item exists yet.
- Only active, in-stock items are returned (`is_active=true` and `quantity_in_stock > 0`).
- Keep your existing filtered endpoints (`/bundles`, `/mealpacks`, `/readyeat`, `/snacks`, `/restock`) for per-tab refresh if needed.

## Suggested Frontend Flow

1. Call `/v1/products/catalog` once after authentication.
2. Cache `catalog` in client state.
3. Render each product-type screen from the corresponding branch:
   - `catalog.restock`
   - `catalog.snacks`
   - `catalog.bundles`
   - `catalog.mealpacks`
   - `catalog.readyeat`
4. Use each branch `categories` array as the tab source.
