import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { intentGateBalance as s } from "../../styles";
import { optimizedUrl } from "../../utils/cloudinary";
import type { ModeConfig } from "../../utils/constants";

interface ModeCardProps {
  mode: ModeConfig;
}

export default function ModeCard({ mode }: ModeCardProps) {
  const router = useRouter();

  return (
    <Pressable
      className={s.modeButton}
      style={{ backgroundColor: mode.bg, borderColor: `${mode.color}22` }}
      onPress={() => router.push(mode.route as any)}
    >
      <View
        className={s.modeIcon}
        style={{
          backgroundColor: `${mode.color}15`,
          borderRadius: 0,
          overflow: "hidden",
        }}
      >
        {mode.imageUrl ? (
          <Image
            source={{ uri: optimizedUrl(mode.imageUrl, 88) }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <Text style={{ fontSize: 22 }}>{mode.emoji}</Text>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text className={s.modeTitle}>{mode.title}</Text>
        <Text className={s.modeDesc} style={{ color: `${mode.color}88` }}>
          {mode.subtitle}
        </Text>
      </View>

      <Text className={s.modeChevron} style={{ color: `${mode.color}55` }}>
        →
      </Text>
    </Pressable>
  );
}
