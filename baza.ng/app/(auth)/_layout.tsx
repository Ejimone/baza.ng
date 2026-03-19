import { Redirect, Stack } from "expo-router";
import { getThemePalette } from "../../constants/appTheme";
import { useAuthStore } from "../../stores/authStore";

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const palette = getThemePalette("light");

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
