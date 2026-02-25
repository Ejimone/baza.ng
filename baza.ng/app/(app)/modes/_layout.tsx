import { Stack } from "expo-router";

export default function ModesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#060d07" },
      }}
    />
  );
}
