import type { ClerkAppearanceTheme } from "@clerk/nextjs/types";

/**
 * Keeps Clerk's hosted UI on the same palette as the gallery.
 * Variable names follow Clerk Core 3 (colorForeground / colorInput / …),
 * not the pre-v7 colorText / colorInputBackground spelling.
 */
export const clerkAppearance: ClerkAppearanceTheme = {
  variables: {
    colorPrimary: "#c2452c",
    colorPrimaryForeground: "#faf9f7",
    colorForeground: "#16150f",
    colorMutedForeground: "#736f65",
    colorBackground: "#ffffff",
    colorInput: "#faf9f7",
    colorInputForeground: "#16150f",
    colorBorder: "#e7e3da",
    borderRadius: "10px",
    fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  },
  elements: {
    card: "border border-[#e7e3da] shadow-none",
    headerTitle: "display",
  },
};
