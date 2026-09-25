import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Candidate } from "@evoting/core-api";
import type { EncryptedBallot } from "@evoting/core-crypto";
import { Badge, Button, Card, Header, StatusBanner } from "../components";
import { colors, radius, spacing, typography } from "../theme";

export interface AuditScreenProps {
  ballot: EncryptedBallot;
  candidate: Candidate;
  onSave: () => void;
  onCastFresh: () => void;
  onBack: () => void;
  busy?: boolean;
}

export function AuditScreen({
  ballot,
  candidate,
  onSave,
  onCastFresh,
  onBack,
  busy = false,
}: AuditScreenProps) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave();
    setSaved(true);
  };

  return (
    <View style={styles.container}>
      <Header
        eyebrow="BENALOH AUDIT"
        title="Cast-or-Audit Verification"
        subtitle="Verify encryption correctness before committing your vote."
        onBack={onBack}
        backLabel="Ballot"
      />

      {/* Audit Purpose & Protocol Rule */}
      <StatusBanner
        variant="info"
        title="Protocol Security Rule"
        message="This audited ballot reveals its encryption randomness to prove correctness. It will NEVER be submitted. You must proceed to create and cast a fresh ballot."
      />

      {/* Candidate Verification Card */}
      <Card variant="highlight" style={styles.auditResultCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardEyebrow}>AUDITED CANDIDATE</Text>
          <Badge label="Audit Verified" variant="audit" />
        </View>

        <Text style={styles.candidateName}>{candidate.name}</Text>
        <Text style={styles.candidateMeta}>
          {candidate.party} · Constituency {candidate.constituency_code}
        </Text>

        <Text style={styles.auditVerificationText}>
          ✓ The encryption math opens correctly to candidate ID:{" "}
          <Text style={styles.monoText}>{candidate.id}</Text>
        </Text>
      </Card>

      {/* Cryptographic Parameters Inspection */}
      <Card variant="default" style={styles.paramsCard}>
        <Text accessibilityRole="header" style={styles.paramsTitle}>
          Cryptographic Artifacts
        </Text>
        <Text style={styles.paramsDescription}>
          The ElGamal ciphertext pairs and ephemeral randomness below demonstrate mathematical proof of your selection:
        </Text>

        <View style={styles.paramItem}>
          <Text style={styles.paramLabel}>CIPHERTEXT COMPONENT C1</Text>
          <Text selectable style={styles.monoBox}>
            {ballot.ciphertext.c1}
          </Text>
        </View>

        <View style={styles.paramItem}>
          <Text style={styles.paramLabel}>CIPHERTEXT COMPONENT C2</Text>
          <Text selectable style={styles.monoBox}>
            {ballot.ciphertext.c2}
          </Text>
        </View>

        <View style={styles.paramItem}>
          <Text style={styles.paramLabel}>REVEALED RANDOMNESS (R)</Text>
          <Text selectable style={styles.monoBox}>
            {ballot.randomness}
          </Text>
        </View>
      </Card>

      {/* Save Notification */}
      {saved && (
        <StatusBanner
          variant="success"
          message="Audit copy securely saved to device storage. You can review or delete it anytime from Settings."
        />
      )}

      {/* Action Buttons */}
      <View style={styles.actionGroup}>
        <Button
          label="Cast Fresh Ballot"
          onPress={onCastFresh}
          icon="→"
          accessibilityLabel="Proceed to cast a freshly encrypted ballot"
          accessibilityHint="Advances to final vote confirmation with a fresh cryptographic ballot"
        />

        <Button
          label={saved ? "Audit Saved ✓" : "Save Audit Copy to Device"}
          variant="outline"
          onPress={handleSave}
          disabled={saved || busy}
          icon="💾"
          accessibilityLabel="Save audit copy"
          accessibilityHint="Stores ciphertext and randomness in OS secure storage"
        />

        <Button
          label="Return to Candidate Selection"
          variant="ghost"
          onPress={onBack}
          disabled={busy}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.base,
  },
  auditResultCard: {
    gap: spacing.xs,
    padding: spacing.base,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardEyebrow: {
    ...typography.eyebrow,
    color: colors.primaryDark,
    fontSize: 11,
  },
  candidateName: {
    ...typography.title1,
    color: colors.primaryDark,
  },
  candidateMeta: {
    ...typography.body,
    color: colors.textSecondary,
  },
  auditVerificationText: {
    ...typography.captionBold,
    color: colors.success.text,
    marginTop: spacing.xs,
    backgroundColor: colors.success.background,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.success.border,
  },
  monoText: {
    ...typography.mono,
    color: colors.success.text,
  },
  paramsCard: {
    gap: spacing.md,
  },
  paramsTitle: {
    ...typography.title3,
    color: colors.textPrimary,
  },
  paramsDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  paramItem: {
    gap: spacing.xxs,
  },
  paramLabel: {
    ...typography.eyebrow,
    fontSize: 10,
    color: colors.textMuted,
  },
  monoBox: {
    ...typography.mono,
    fontSize: 11,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  actionGroup: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
