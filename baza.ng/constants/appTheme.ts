export type ThemeMode = "dark" | "light";

export const appTheme = {
  dark: {
    background: "#060d07",
    card: "#0d1a0f",
    textPrimary: "#f5f5f0",
    textSecondary: "#2a4a2a",
    border: "#1a2a1c",
    statusBar: "light" as const,
  },
  light: {
    background: "#f4f7f2",
    card: "#ffffff",
    textPrimary: "#102015",
    textSecondary: "#44624d",
    border: "#d8e2d6",
    statusBar: "dark" as const,
  },
} as const;

export function getThemePalette(mode: ThemeMode) {
  return appTheme[mode];
}
