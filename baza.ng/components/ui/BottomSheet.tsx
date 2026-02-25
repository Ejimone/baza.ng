import { View, Pressable, type ViewProps } from "react-native";

interface BottomSheetProps extends ViewProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  heroColor?: string;
}

export default function BottomSheet({
  visible,
  onClose,
  children,
  heroColor,
  ...rest
}: BottomSheetProps) {
  if (!visible) return null;

  return (
    <View
      className="absolute inset-0 z-[500] bg-black/[0.88] flex-col justify-end"
      {...rest}
    >
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View
        className="rounded-t-[20px] pt-0 pb-11"
        style={{ backgroundColor: heroColor ?? "#080f09" }}
      >
        {children}
      </View>
    </View>
  );
}
