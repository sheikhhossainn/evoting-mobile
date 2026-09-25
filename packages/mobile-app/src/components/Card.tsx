import React, { type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, layout, radius, spacing } from "../theme";

export interface CardProps {
  children: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityRole?: "button" | "radio" | "none";
  accessibilityLabel?: string;
  accessibilityHint?: string;
  variant?: "default" | "elevated" | "subtle" | "highlight";
}

export function Card({
  children,
  onPress,
  selected = false,
  style,
  accessibilityRole = onPress ? "button" : "none",
  accessibilityLabel,
  accessibilityHint,
  variant = "default",
}: CardProps) {
  const isInteractive = Boolean(onPress);

  const cardStyle = [
    styles.card,
    styles[variant],
    selected && styles.selected,
    style,
  ];

  if (isInteractive) {
    return (
      <Pressable
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ selected }}
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          styles.interactive,
          pressed && styles.pressed,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: layout.cardPadding,
    borderWidth: 1,
    borderColor: colors.border,
  },
  interactive: {
    minHeight: layout.minTouchTarget,
  },
  default: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  elevated: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  subtle: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
  },
  highlight: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  selected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.interactive.selectedBg,
  },
  pressed: {
    opacity: 0.85,
    borderColor: colors.primary,
  },
});
