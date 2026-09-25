import { Platform, type TextStyle } from "react-native";

/**
 * Typography scale designed for clarity, font scaling support, and hierarchy.
 * Strictly typed to prevent runtime access to undefined properties.
 */
export const typography = {
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  } as TextStyle,
  display: {
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 32,
    letterSpacing: -0.5,
  } as TextStyle,
  h1: {
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 32,
    letterSpacing: -0.5,
  } as TextStyle,
  title1: {
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
    letterSpacing: -0.3,
  } as TextStyle,
  h2: {
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
    letterSpacing: -0.3,
  } as TextStyle,
  title2: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
  } as TextStyle,
  h3: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
  } as TextStyle,
  title3: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  } as TextStyle,
  body: {
    fontSize: 15,
    fontWeight: "400",
    lineHeight: 22,
  } as TextStyle,
  bodyBold: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  } as TextStyle,
  bodySm: {
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 18,
  } as TextStyle,
  callout: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  } as TextStyle,
  caption: {
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 18,
  } as TextStyle,
  captionBold: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  } as TextStyle,
  small: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  } as TextStyle,
  mono: {
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      default: "monospace",
    }),
    fontSize: 13,
    lineHeight: 18,
  } as TextStyle,
} as const;

export type TypographyToken = keyof typeof typography;
