import { Platform, type TextStyle } from "react-native";

/**
 * Typography scale designed for clarity, font scaling support, and hierarchy.
 */
export const typography: Record<string, TextStyle> = {
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  display: {
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  title1: {
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  title2: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
  },
  title3: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    fontWeight: "400",
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
  callout: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  caption: {
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 18,
  },
  captionBold: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  small: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  },
  mono: {
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      default: "monospace",
    }),
    fontSize: 13,
    lineHeight: 18,
  },
};
