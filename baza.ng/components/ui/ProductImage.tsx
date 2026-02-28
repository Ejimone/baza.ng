import { Image, StyleSheet, Text, View } from "react-native";
import { optimizedUrl } from "../../utils/cloudinary";

interface ProductImageProps {
  imageUrl?: string;
  emoji: string;
  /** Logical pixel size for both width and height */
  size?: number;
  borderRadius?: number;
}

/**
 * Displays a Cloudinary product image when available, falling back to the
 * emoji character when no URL is provided.
 */
export default function ProductImage({
  imageUrl,
  emoji,
  size = 48,
  borderRadius = 8,
}: ProductImageProps) {
  if (imageUrl) {
    return (
      <Image
        source={{ uri: optimizedUrl(imageUrl, size * 2) }} // 2× for retina
        style={[styles.image, { width: size, height: size, borderRadius }]}
        resizeMode="cover"
      />
    );
  }
  return (
    <View
      style={[
        styles.emojiContainer,
        { width: size, height: size, borderRadius },
      ]}
    >
      <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: "#0d1a0f",
  },
  emojiContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
