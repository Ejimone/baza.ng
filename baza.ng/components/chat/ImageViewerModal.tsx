import { Image, Modal, Pressable, StyleSheet, View } from "react-native";
import { optimizedUrl } from "../../utils/cloudinary";

interface ImageViewerModalProps {
  visible: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

export default function ImageViewerModal({
  visible,
  onClose,
  imageUrl,
}: ImageViewerModalProps) {
  if (!imageUrl) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.content}>
          <Image
            source={{ uri: optimizedUrl(imageUrl, 800) }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "80%",
  },
});
