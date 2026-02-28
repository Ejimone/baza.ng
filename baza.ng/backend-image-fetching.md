# Backend Image Fetching — How It Works

## Overview

Product images are uploaded by the admin via the Django admin panel and stored on **Cloudinary** (a cloud image CDN). Every product API endpoint returns an `imageUrl` field containing the full Cloudinary URL. The `emoji` field is kept as a fallback for items that don't have an image yet.

## How It Works (Backend)

1. **Admin uploads an image** — In the Django admin (`/admin/`), every product type (Product, Bundle, MealPack, ReadyEatItem, SnackItem, etc.) has an `image` file upload field.

2. **Cloudinary stores the file** — Django uses `django-cloudinary-storage` as the default file storage backend. When the admin saves, the image is uploaded to Cloudinary automatically and the model stores the Cloudinary file path.

3. **API returns `imageUrl`** — Every product endpoint serializes the image field into a full Cloudinary URL (e.g. `https://res.cloudinary.com/deo9bzyui/image/upload/v1/products/jollof-rice.jpg`). If no image is uploaded, `imageUrl` is an empty string `""`.

4. **OrderItems snapshot the URL** — When an order is placed, each `OrderItem` stores the `imageUrl` at the time of order, so it's preserved even if the product image changes later.

## API Response Format

Every product endpoint includes both `emoji` (legacy) and `imageUrl` (new):

```json
{
  "id": "prod_001",
  "name": "Jollof Rice",
  "emoji": "🍚",
  "imageUrl": "https://res.cloudinary.com/deo9bzyui/image/upload/v1/products/jollof-rice.jpg",
  "price": 150000
}
```

When no image is uploaded:

```json
{
  "id": "prod_002",
  "name": "Bread",
  "emoji": "🍞",
  "imageUrl": "",
  "price": 50000
}
```

## Endpoints That Return `imageUrl`

| Endpoint | Description |
|----------|-------------|
| `GET /v1/products/bundles` | Bundle items + their child product items |
| `GET /v1/products/mealpacks` | Meal packs + their ingredients |
| `GET /v1/products/readyeat` | Ready-to-eat items |
| `GET /v1/products/snacks` | Snack items |
| `GET /v1/products/restock` | Restock (grocery) products |
| `GET /v1/orders/` | Order list (each order item has `imageUrl`) |
| `GET /v1/orders/<id>` | Order detail (each order item has `imageUrl`) |

## React Native Frontend Integration

### 1. Display Product Images

Use `imageUrl` with a fallback to `emoji` when there's no image:

```tsx
import { Image, Text, View, StyleSheet } from 'react-native';

type ProductImageProps = {
  imageUrl: string;
  emoji: string;
  size?: number;
};

function ProductImage({ imageUrl, emoji, size = 64 }: ProductImageProps) {
  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, { width: size, height: size }]}
        resizeMode="cover"
      />
    );
  }

  // Fallback to emoji
  return (
    <View style={[styles.emojiContainer, { width: size, height: size }]}>
      <Text style={styles.emoji}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  emojiContainer: {
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 32,
  },
});
```

### 2. Use It in a Product Card

```tsx
function ProductCard({ product }) {
  return (
    <View style={{ flexDirection: 'row', padding: 12, gap: 12 }}>
      <ProductImage
        imageUrl={product.imageUrl}
        emoji={product.emoji}
        size={64}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '600' }}>{product.name}</Text>
        <Text>₦{(product.price / 100).toLocaleString()}</Text>
      </View>
    </View>
  );
}
```

### 3. Fetch Products from the API

```tsx
const API_BASE = 'https://your-backend.vercel.app';

async function fetchRestockItems(token: string, category?: string) {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.set('category', category);

  const res = await fetch(
    `${API_BASE}/v1/products/restock?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await res.json();
  return data.items; // each item has { id, name, emoji, imageUrl, price, ... }
}
```

### 4. Optimized Images with Cloudinary Transforms

Cloudinary URLs support on-the-fly image transformations. You can append transforms to reduce bandwidth on mobile:

```tsx
function optimizedUrl(url: string, width: number): string {
  if (!url || !url.includes('cloudinary.com')) return url;

  // Insert transformation before /v1/ in the Cloudinary URL
  // e.g. .../upload/v1/... → .../upload/w_200,q_auto,f_auto/v1/...
  return url.replace(
    '/upload/',
    `/upload/w_${width},q_auto,f_auto/`
  );
}

// Usage
<Image
  source={{ uri: optimizedUrl(product.imageUrl, 200) }}
  style={{ width: 100, height: 100, borderRadius: 12 }}
/>
```

This gives you:
- **`w_200`** — resize to 200px width (saves bandwidth on list views)
- **`q_auto`** — automatic quality optimization
- **`f_auto`** — serve WebP/AVIF when the device supports it

### 5. Caching with React Native Fast Image (Optional)

For better performance, use `react-native-fast-image`:

```bash
npm install react-native-fast-image
```

```tsx
import FastImage from 'react-native-fast-image';

function ProductImage({ imageUrl, emoji, size = 64 }) {
  if (imageUrl) {
    return (
      <FastImage
        source={{
          uri: optimizedUrl(imageUrl, size * 2), // 2x for retina
          priority: FastImage.priority.normal,
        }}
        style={{ width: size, height: size, borderRadius: 12 }}
        resizeMode={FastImage.resizeMode.cover}
      />
    );
  }

  return (
    <View style={{
      width: size, height: size, borderRadius: 12,
      backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
    </View>
  );
}
```

### 6. Sending `imageUrl` When Creating Orders

When the user checks out, include `imageUrl` in each cart item so it's stored on the order:

```tsx
const orderPayload = {
  items: cart.map(item => ({
    name: item.name,
    emoji: item.emoji,
    imageUrl: item.imageUrl,  // ← include this
    qty: item.qty,
    itemType: item.itemType,
    unitPrice: item.unitPrice,
    totalPrice: item.unitPrice * item.qty,
  })),
  total: cartTotal,
  addressId: selectedAddress.id,
  paymentMethod: 'paystack_direct',
};

const res = await fetch(`${API_BASE}/v1/orders/direct-checkout`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(orderPayload),
});
```

## Summary

| Field | Type | Description |
|-------|------|-------------|
| `imageUrl` | `string` | Full Cloudinary URL, or `""` if no image uploaded |
| `emoji` | `string` | Fallback emoji character (may be empty on new items) |

**Rule of thumb for the frontend:** Use `imageUrl` when it's non-empty, fall back to `emoji` otherwise.
