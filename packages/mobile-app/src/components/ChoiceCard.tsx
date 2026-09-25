import React from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, layout, radius, spacing, typography } from "../theme";
import { Badge } from "./Badge";

export interface ChoiceCardProps {
  title: string;
  subtitle?: string;
  tag?: string;
  selected: boolean;
  onSelect: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

export function ChoiceCard({
  title,
  subtitle,
  tag,
  selected,
  onSelect,
  accessibilityLabel,
  accessibilityHint,
  style,
}: ChoiceCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? `${title}${subtitle ? `, ${subtitle}` : ""}`}
      accessibilityHint={accessibilityHint ?? (selected ? "Selected choice" : "Tap to select this choice")}
      onPress={onSelect}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.cardPressed,
        style,
      ]}
    >
      <View style={styles.contentRow}>
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
            {tag ? <Badge label={tag} variant={selected ? "open" : "neutral"} /> : null}
          </View>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        <View
          style={[styles.radioOuter, selected && styles.radioOuterSelected]}
          accessible={false}
        >
          {selected ? <View style={styles.radioInner} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: layout.minTouchTarget + 12,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginVertical: spacing.xs,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.interactive.selectedBg,
    borderWidth: 2,
  },
  cardPressed: {
    opacity: 0.85,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  textContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  title: {
    ...typography.title2,
    color: colors.textPrimary,
  },
  titleSelected: {
    color: colors.primaryDark,
    fontWeight: "800",
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
});
