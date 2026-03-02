import { Pressable, Text, View } from "react-native";
import ProductImage from "../ui/ProductImage";
import BottomSheet from "../ui/BottomSheet";
import { formatPrice } from "../../utils/format";

export interface ChatProductItem {
  id: string;
  name: string;
  price?: number;
  priceFormatted?: string;
  category?: string;
  imageUrl?: string;
  inStock?: boolean;
}

interface ProductDetailSheetProps {
  visible: boolean;
  onClose: () => void;
  item: ChatProductItem | null;
  onAddToCart: (item: ChatProductItem) => void;
  onViewImage?: (imageUrl: string) => void;
}

const toPlainText = (value: string) =>
  value
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export default function ProductDetailSheet({
  visible,
  onClose,
  item,
  onAddToCart,
  onViewImage,
}: ProductDetailSheetProps) {
  if (!item) return null;

  const fallbackEmoji = item.name?.trim()?.charAt(0)?.toUpperCase() || "P";
  const priceDisplay =
    item.priceFormatted ??
    (typeof item.price === "number" ? formatPrice(item.price) : "");
  const categoryText = item.category ? toPlainText(item.category) : "Product";

  return (
    <BottomSheet visible={visible} onClose={onClose} heroColor="#ffffff">
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}>
        <Pressable
          onPress={() => item.imageUrl && onViewImage?.(item.imageUrl)}
          style={{ marginBottom: 16, alignSelf: "center" }}
        >
          <ProductImage
            imageUrl={item.imageUrl}
            emoji={fallbackEmoji}
            size={200}
            borderRadius={12}
          />
        </Pressable>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#111b21",
            marginBottom: 4,
          }}
          numberOfLines={2}
        >
          {toPlainText(item.name)}
        </Text>

        <Text
          style={{
            fontSize: 12,
            color: "#667781",
            marginBottom: 8,
          }}
        >
          {categoryText}
        </Text>

        {priceDisplay ? (
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#25d366",
              marginBottom: 16,
            }}
          >
            {priceDisplay}
          </Text>
        ) : null}

        {item.inStock === false && (
          <Text
            style={{
              fontSize: 12,
              color: "#e85c3a",
              marginBottom: 12,
            }}
          >
            Out of stock
          </Text>
        )}

        <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
          <Pressable
            onPress={onClose}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#e9edef",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 14, color: "#667781" }}>Close</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              onAddToCart(item);
              onClose();
            }}
            disabled={item.inStock === false}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor: item.inStock === false ? "#ccc" : "#25d366",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: item.inStock === false ? "#666" : "#fff",
              }}
            >
              Add to cart
            </Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
}
