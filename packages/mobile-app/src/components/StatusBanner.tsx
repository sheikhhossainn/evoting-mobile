import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius, spacing, typography } from "../theme";

export type BannerVariant = "error" | "danger" | "warning" | "info" | "success" | "offline";

export interface StatusBannerProps {
  message: string;
  title?: string;
  variant?: BannerVariant;
  style?: StyleProp<ViewStyle>;
  onDismiss?: () => void;
}

export function StatusBanner({
  message,
  title,
  variant = "info",
  style,
  onDismiss,
}: StatusBannerProps) {
  const config = getBannerConfig(variant);

  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLabel={`${config.roleLabel}: ${title ? `${title}. ` : ""}${message}`}
      style={[
        styles.banner,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
        },
        style,
      ]}
    >
      <Text style={[styles.icon, { color: config.iconColor }]}>{config.icon}</Text>
      <View style={styles.textContainer}>
        {title ? <Text style={[styles.title, { color: config.textColor }]}>{title}</Text> : null}
        <Text style={[styles.message, { color: config.textColor }]}>{message}</Text>
      </View>
      {onDismiss ? (
        <Text
          accessibilityRole="button"
          accessibilityLabel="Dismiss message"
          onPress={onDismiss}
          style={[styles.dismiss, { color: config.textColor }]}
        >
          ✕
        </Text>
      ) : null}
    </View>
  );
}

function getBannerConfig(variant: BannerVariant) {
  switch (variant) {
    case "offline":
    case "error":
    case "danger":
      return {
        bg: colors.error.background,
        border: colors.error.border,
        textColor: colors.error.text,
        iconColor: colors.error.indicator,
        icon: "⚠",
        roleLabel: "Alert error",
      };
    case "warning":
      return {
        bg: colors.warning.background,
        border: colors.warning.border,
        textColor: colors.warning.text,
        iconColor: colors.warning.indicator,
        icon: "▲",
        roleLabel: "Warning notice",
      };
    case "success":
      return {
        bg: colors.success.background,
        border: colors.success.border,
        textColor: colors.success.text,
        iconColor: colors.success.indicator,
        icon: "✓",
        roleLabel: "Success confirmation",
      };
    case "info":
    default:
      return {
        bg: colors.info.background,
        border: colors.info.border,
        textColor: colors.info.text,
        iconColor: colors.info.indicator,
        icon: "ℹ",
        roleLabel: "Information notice",
      };
  }
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  icon: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
    gap: spacing.xxs,
  },
  title: {
    ...typography.bodyBold,
  },
  message: {
    ...typography.caption,
    lineHeight: 19,
  },
  dismiss: {
    padding: spacing.xs,
    fontSize: 16,
    fontWeight: "700",
  },
});
