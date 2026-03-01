import { Redirect, Stack } from "expo-router";
import { getThemePalette } from "../../constants/appTheme";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const mode = useThemeStore((s) => s.mode);
  const palette = getThemePalette(mode);

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: palette.background },
      }}
    />
  );
}
