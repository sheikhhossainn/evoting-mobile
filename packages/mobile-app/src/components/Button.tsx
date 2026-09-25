import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, layout, radius, spacing, typography } from "../theme";

export interface ButtonProps {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  secondary?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  icon?: string;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  secondary = false,
  disabled = false,
  loading = false,
  style,
  accessibilityLabel,
  accessibilityHint,
  icon,
}: ButtonProps) {
  const isInteractive = !disabled && !loading;
  const actualVariant = secondary ? "secondary" : variant;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      disabled={!isInteractive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[actualVariant],
        pressed && isInteractive && styles[`${actualVariant}Pressed`],
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={actualVariant === "primary" || actualVariant === "danger" ? colors.textInverse : colors.primary}
        />
      ) : (
        <>
          {icon ? <Text style={[styles.text, styles[`${actualVariant}Text`]]}>{icon} </Text> : null}
          <Text style={[styles.text, styles[`${actualVariant}Text`]]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.minTouchTarget,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    ...typography.bodyBold,
    textAlign: "center",
  },
  // Primary (Pine Green)
  primary: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  primaryPressed: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  primaryText: {
    color: colors.textInverse,
  },
  // Secondary (Light tinted surface)
  secondary: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  secondaryPressed: {
    backgroundColor: "#D3ECE4",
  },
  secondaryText: {
    color: colors.primaryDark,
  },
  // Outline
  outline: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  outlinePressed: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.primary,
  },
  outlineText: {
    color: colors.textPrimary,
  },
  // Ghost
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  ghostPressed: {
    backgroundColor: colors.surfaceSubtle,
  },
  ghostText: {
    color: colors.primary,
  },
  // Danger
  danger: {
    backgroundColor: colors.error.indicator,
    borderWidth: 1,
    borderColor: colors.error.indicator,
  },
  dangerPressed: {
    backgroundColor: "#B91C1C",
  },
  dangerText: {
    color: colors.textInverse,
  },
  // Disabled state
  disabled: {
    opacity: 0.5,
    backgroundColor: colors.interactive.disabledBg,
    borderColor: colors.interactive.disabledBg,
  },
});
