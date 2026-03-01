import { Stack } from "expo-router";
import { getThemePalette } from "../../../constants/appTheme";
import { useThemeStore } from "../../../stores/themeStore";

export default function SettingsLayout() {
  const mode = useThemeStore((s) => s.mode);
  const palette = getThemePalette(mode);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.background },
      }}
    />
  );
}
