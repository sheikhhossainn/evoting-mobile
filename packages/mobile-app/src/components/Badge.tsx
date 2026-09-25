import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius, spacing, typography } from "../theme";

export type BadgeVariant =
  | "open"
  | "closed"
  | "eligible"
  | "voted"
  | "ineligible"
  | "audit"
  | "info"
  | "neutral";

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  symbol?: string;
  style?: StyleProp<ViewStyle>;
}

export function Badge({ label, variant = "neutral", symbol, style }: BadgeProps) {
  const config = getBadgeConfig(variant);
  const displaySymbol = symbol ?? config.defaultSymbol;

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${config.accessibilityPrefix}: ${label}`}
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
        },
        style,
      ]}
    >
      {displaySymbol ? (
        <Text style={[styles.symbol, { color: config.text }]}>{displaySymbol}</Text>
      ) : null}
      <Text style={[styles.label, { color: config.text }]}>{label}</Text>
    </View>
  );
}

function getBadgeConfig(variant: BadgeVariant) {
  switch (variant) {
    case "open":
    case "eligible":
      return {
        bg: colors.success.background,
        border: colors.success.border,
        text: colors.success.text,
        defaultSymbol: "●",
        accessibilityPrefix: "Active status",
      };
    case "closed":
      return {
        bg: colors.neutral.background,
        border: colors.neutral.border,
        text: colors.neutral.text,
        defaultSymbol: "■",
        accessibilityPrefix: "Closed status",
      };
    case "voted":
      return {
        bg: colors.warning.background,
        border: colors.warning.border,
        text: colors.warning.text,
        defaultSymbol: "🔒",
        accessibilityPrefix: "Record status",
      };
    case "ineligible":
      return {
        bg: colors.error.background,
        border: colors.error.border,
        text: colors.error.text,
        defaultSymbol: "✕",
        accessibilityPrefix: "Alert status",
      };
    case "audit":
      return {
        bg: colors.info.background,
        border: colors.info.border,
        text: colors.info.text,
        defaultSymbol: "🛡",
        accessibilityPrefix: "Audit status",
      };
    case "info":
      return {
        bg: colors.info.background,
        border: colors.info.border,
        text: colors.info.text,
        defaultSymbol: "ℹ",
        accessibilityPrefix: "Information",
      };
    case "neutral":
    default:
      return {
        bg: colors.surfaceSubtle,
        border: colors.borderStrong,
        text: colors.textSecondary,
        defaultSymbol: "",
        accessibilityPrefix: "Status",
      };
  }
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    gap: spacing.xs,
  },
  symbol: {
    fontSize: 11,
    fontWeight: "700",
  },
  label: {
    ...typography.captionBold,
    letterSpacing: 0.2,
  },
});
