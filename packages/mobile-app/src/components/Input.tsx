import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, layout, radius, spacing, typography } from "../theme";

export interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  maxLength?: number;
  keyboardType?: KeyboardTypeOptions;
  inputMode?: "text" | "numeric" | "tel" | "search" | "email" | "decimal";
  autoFocus?: boolean;
  showCharCount?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  helperText,
  errorText,
  maxLength,
  keyboardType = "default",
  inputMode,
  autoFocus = false,
  showCharCount = false,
  accessibilityLabel,
  accessibilityHint,
  style,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(errorText);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {showCharCount && maxLength ? (
          <Text
            style={[
              styles.charCount,
              value.length === maxLength && styles.charCountComplete,
            ]}
          >
            {value.length} / {maxLength}
          </Text>
        ) : null}
      </View>

      <TextInput
        accessible
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: false }}
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          hasError && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        maxLength={maxLength}
        keyboardType={keyboardType}
        inputMode={inputMode}
        autoFocus={autoFocus}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {hasError ? (
        <View accessible accessibilityRole="alert" style={styles.feedbackRow}>
          <Text style={styles.errorIcon}>⚠</Text>
          <Text style={styles.errorText}>{errorText}</Text>
        </View>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs + 2,
    marginVertical: spacing.xs,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  charCount: {
    ...typography.small,
    color: colors.textMuted,
  },
  charCountComplete: {
    color: colors.success.text,
    fontWeight: "700",
  },
  input: {
    minHeight: 52,
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    ...typography.title2,
    color: colors.textPrimary,
  },
  inputFocused: {
    borderColor: colors.borderFocus,
    backgroundColor: "#FAFDFB",
  },
  inputError: {
    borderColor: colors.error.indicator,
    backgroundColor: colors.error.background,
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  errorIcon: {
    color: colors.error.text,
    fontSize: 12,
  },
  errorText: {
    ...typography.captionBold,
    color: colors.error.text,
  },
  helperText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
