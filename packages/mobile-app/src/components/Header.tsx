import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, layout, radius, spacing, typography } from "../theme";

export interface HeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  onBack?: () => void;
  backLabel?: string;
}

export function Header({
  title,
  subtitle,
  eyebrow,
  onBack,
  backLabel = "Back",
}: HeaderProps) {
  return (
    <View style={styles.container}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Navigate back: ${backLabel}`}
          accessibilityHint="Returns to the previous screen"
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>{backLabel}</Text>
        </Pressable>
      ) : null}

      <View style={styles.content}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  backButton: {
    minHeight: layout.minTouchTarget,
    minWidth: layout.minTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.sm,
    gap: spacing.xs,
  },
  backButtonPressed: {
    opacity: 0.6,
  },
  backIcon: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  backText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  content: {
    gap: spacing.xs,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.primary,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
