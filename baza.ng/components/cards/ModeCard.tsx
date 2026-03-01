import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { getThemePalette } from "../../constants/appTheme";
import { useThemeStore } from "../../stores/themeStore";
import { intentGateBalance as s } from "../../styles";
import { optimizedUrl } from "../../utils/cloudinary";
import type { ModeConfig } from "../../utils/constants";

interface ModeCardProps {
  mode: ModeConfig;
}

export default function ModeCard({ mode }: ModeCardProps) {
  const router = useRouter();
  const themeMode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(themeMode);

  return (
    <Pressable
      className="flex-row items-center gap-4"
      style={{
        backgroundColor: themeMode === "light" ? palette.card : mode.bg,
        borderColor: themeMode === "light" ? palette.border : `${mode.color}22`,
        borderRadius: 4,
        paddingLeft: 0,
        paddingRight: 16,
        paddingTop: 0,
        paddingBottom: 0,
        overflow: "hidden",
      }}
      onPress={() => router.push(mode.route as any)}
    >
      <View
        style={{
          backgroundColor: "transparent",
          width: 84,
          height: 84,
          borderTopLeftRadius: 4,
          borderBottomLeftRadius: 4,
          overflow: "hidden",
        }}
      >
        {mode.imageUrl ? (
          <Image
            source={{ uri: optimizedUrl(mode.imageUrl, 168) }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <Text style={{ fontSize: 22 }}>{mode.emoji}</Text>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text className={s.modeTitle} style={{ color: palette.textPrimary }}>
          {mode.title}
        </Text>
        <Text
          className={s.modeDesc}
          style={{
            color:
              themeMode === "light" ? palette.textSecondary : `${mode.color}88`,
          }}
        >
          {mode.subtitle}
        </Text>
      </View>

      <Text className={s.modeChevron} style={{ color: `${mode.color}55` }}>
        →
      </Text>
    </Pressable>
  );
}
