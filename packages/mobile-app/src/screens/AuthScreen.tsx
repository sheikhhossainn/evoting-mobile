import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Election } from "@evoting/core-api";
import { Badge, Button, Card, Header, Input } from "../components";
import { colors, radius, spacing, typography } from "../theme";

export interface AuthScreenProps {
  election: Election;
  nid: string;
  setNid: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  busy?: boolean;
}

export function AuthScreen({
  election,
  nid,
  setNid,
  onSubmit,
  onBack,
  busy = false,
}: AuthScreenProps) {
  const isValidNid = /^\d{11}$/.test(nid.trim());
  const remainingDigits = 11 - nid.length;

  const helperText =
    nid.length === 0
      ? "Enter your 11-digit National ID number."
      : isValidNid
      ? "✓ 11-digit NID formatted correctly. Ready to verify."
      : `Please enter ${remainingDigits} more numeric digit${remainingDigits === 1 ? "" : "s"}.`;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardContainer}
    >
      <View style={styles.container}>
        <Header
          eyebrow="STEP 1 OF 3"
          title="Voter Authentication"
          subtitle="Confirm your identity and check eligibility for the chosen election."
          onBack={onBack}
          backLabel="Election Hub"
        />

        {/* Selected Election Summary */}
        <Card variant="subtle" style={styles.electionContextCard}>
          <View style={styles.electionHeaderRow}>
            <View style={styles.electionInfoCol}>
              <Text style={styles.contextLabel}>TARGET ELECTION</Text>
              <Text style={styles.electionName}>{election.name}</Text>
            </View>
            <Badge
              label={election.availability === "open" ? "Open" : election.status}
              variant={election.availability === "open" ? "open" : "neutral"}
            />
          </View>
          <Text style={styles.electionId} numberOfLines={1}>
            ID: {election.election_id}
          </Text>
        </Card>

        {/* Form Container */}
        <Card variant="default" style={styles.formCard}>
          <Text accessibilityRole="header" style={styles.formTitle}>
            National Identity (NID)
          </Text>
          <Text style={styles.formDescription}>
            Your NID is verified against the official voter registry to establish eligibility for this specific election.
          </Text>

          <Input
            label="National ID Number"
            value={nid}
            onChangeText={(text) => {
              // Restrict to digits only
              const sanitized = text.replace(/[^\d]/g, "");
              setNid(sanitized);
            }}
            placeholder="e.g. 19901234567"
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={11}
            showCharCount
            helperText={helperText}
            autoFocus
            accessibilityLabel="11-digit National ID number"
            accessibilityHint="Type your eleven digit national identification number"
          />

          {/* Privacy & Trust Guarantee */}
          <View style={styles.privacyNotice} accessible accessibilityRole="summary">
            <Text style={styles.privacyIcon}>🔒</Text>
            <View style={styles.privacyTextCol}>
              <Text style={styles.privacyTitle}>Privacy & Secrecy Guarantee</Text>
              <Text style={styles.privacyBody}>
                Your NID is used transiently to authenticate this session. It is never stored on this phone and is never attached to your encrypted vote.
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionGroup}>
            <Button
              label={busy ? "Verifying Eligibility…" : "Verify Eligibility & Continue"}
              onPress={onSubmit}
              disabled={!isValidNid || busy}
              loading={busy}
              icon="→"
              accessibilityLabel="Verify eligibility and proceed"
              accessibilityHint={
                isValidNid
                  ? "Submits your NID to check voting eligibility"
                  : "Disabled until exactly 11 digits are entered"
              }
            />
            <Button
              label="Cancel & Return"
              variant="outline"
              onPress={onBack}
              disabled={busy}
            />
          </View>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    gap: spacing.base,
  },
  electionContextCard: {
    gap: spacing.xs,
    padding: spacing.md,
  },
  electionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  electionInfoCol: {
    flex: 1,
    gap: spacing.xxs,
  },
  contextLabel: {
    ...typography.eyebrow,
    color: colors.textMuted,
    fontSize: 10,
  },
  electionName: {
    ...typography.title3,
    color: colors.textPrimary,
  },
  electionId: {
    ...typography.mono,
    color: colors.textMuted,
    fontSize: 11,
  },
  formCard: {
    gap: spacing.base,
  },
  formTitle: {
    ...typography.title2,
    color: colors.textPrimary,
  },
  formDescription: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  privacyNotice: {
    flexDirection: "row",
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  privacyIcon: {
    fontSize: 18,
    marginTop: 2,
  },
  privacyTextCol: {
    flex: 1,
    gap: 2,
  },
  privacyTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  privacyBody: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  actionGroup: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
