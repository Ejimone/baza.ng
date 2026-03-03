# Dynamic Catalogues

This update allows catalogue categories to be created, edited, activated/deactivated, and deleted from Django admin without backend code changes.

## What Changed

- Added admin-managed category tables for:
  - `BundleCategory`
  - `MealPackCategory`
  - `ReadyEatCategory`
- Existing dynamic category tables remain for:
  - `ProductCategory`
  - `SnackCategory`
- Added `category` field to:
  - `Bundle`
  - `MealPack`
  - `ReadyEatItem`
- Admin forms for all catalog item types now load category options from active category tables.

## API Changes

- `GET /v1/products/bundles`
  - Supports `?category=<name>` filter
  - Returns `category` per item and `categories` list in response
- `GET /v1/products/mealpacks`
  - Supports `?category=<name>` filter
  - Returns `category` per item and `categories` list in response
- `GET /v1/products/readyeat`
  - Supports `?category=<name>` filter
  - Returns `category` per item and `categories` list in response
- `GET /v1/products/snacks`
  - Supports `?category=<name>` filter
  - Returns `categories` list sourced from `SnackCategory` table
- `GET /v1/products/restock`
  - Supports `?category=<name>` filter
  - Returns `categories` list sourced from `ProductCategory` table
- `GET /v1/products/categories`
  - Returns category tabs for all product types
  - Optional `?type=restock|snacks|bundles|mealpacks|readyeat` to return one type
- `GET /v1/products/catalog`
  - Returns all product types in one payload
  - Includes both `items` and `categories` for `restock`, `snacks`, `bundles`, `mealpacks`, and `readyeat`

## Migration

Migration `products.0007_dynamic_catalog_categories`:

- Creates new category tables (`BundleCategory`, `MealPackCategory`, `ReadyEatCategory`)
- Adds `category` column to `Bundle`, `MealPack`, and `ReadyEatItem`
- Seeds default `General` category rows for the new category tables

Run:

```bash
python manage.py migrate
```
