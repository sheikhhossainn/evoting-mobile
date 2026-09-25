import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { VoterMe } from "@evoting/core-api";
import { Badge, Button, Card, Header } from "../components";
import { colors, radius, spacing, typography } from "../theme";

export interface StatusScreenProps {
  me: VoterMe;
  onContinue: () => void;
  onBack: () => void;
  busy?: boolean;
}

export function StatusScreen({
  me,
  onContinue,
  onBack,
  busy = false,
}: StatusScreenProps) {
  const isEligibleToVote = me.is_eligible && !me.has_voted;

  return (
    <View style={styles.container}>
      <Header
        eyebrow="STEP 2 OF 3"
        title="Voter Status"
        subtitle="Server-verified eligibility status for this session."
        onBack={onBack}
        backLabel="Elections"
      />

      {/* Main Status Verification Card */}
      <Card
        variant={isEligibleToVote ? "highlight" : "default"}
        style={styles.statusCard}
      >
        <View style={styles.badgeRow}>
          {me.has_voted ? (
            <Badge label="Ballot Already Cast" variant="voted" />
          ) : me.is_eligible ? (
            <Badge label="Verified Eligible" variant="eligible" />
          ) : (
            <Badge label="Ineligible to Vote" variant="ineligible" />
          )}
        </View>

        <Text accessibilityRole="header" style={styles.headline}>
          {me.has_voted
            ? "Your Vote Is Recorded"
            : me.is_eligible
            ? "You Are Cleared to Vote"
            : "Registration Not Found"}
        </Text>

        <Text style={styles.description}>
          {me.has_voted
            ? "A ballot has already been submitted and accepted for this voter registration. To protect the integrity of the election and enforce the one-vote principle, ballots cannot be submitted more than once."
            : me.is_eligible
            ? "Your identity has been authenticated against the official voter roll. You can now load your constituency candidates and construct an encrypted ballot."
            : "The provided identity number was not found on the registered voter roll for this election."}
        </Text>

        {/* Voter Metadata Breakdown */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>CONSTITUENCY</Text>
            <Text style={styles.detailValue}>
              {me.constituency_code ?? "Standard Roll"}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>VOTING ELIGIBILITY</Text>
            <Text style={[styles.detailValue, isEligibleToVote && styles.detailValueSuccess]}>
              {me.is_eligible ? "Approved" : "Not Registered"}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>PARTICIPATION STATUS</Text>
            <Text style={styles.detailValue}>
              {me.has_voted ? "Vote Cast" : "Not Voted"}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>SESSION SECURITY</Text>
            <Text style={styles.detailValue}>Device Bound (20m TTL)</Text>
          </View>
        </View>
      </Card>

      {/* Trust Notice */}
      <View style={styles.securityNotice}>
        <Text style={styles.securityIcon}>🛡</Text>
        <View style={styles.securityTextCol}>
          <Text style={styles.securityTitle}>Client-Side Ballot Encryption</Text>
          <Text style={styles.securityBody}>
            When you proceed, candidates for constituency{" "}
            <Text style={styles.bold}>{me.constituency_code ?? "assigned"}</Text> will be loaded alongside the election ElGamal public key. Your choice is encrypted entirely on your device.
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionGroup}>
        {isEligibleToVote && (
          <Button
            label={busy ? "Loading Candidates…" : "Build My Ballot"}
            onPress={onContinue}
            loading={busy}
            icon="🗳"
            accessibilityLabel="Build my ballot"
            accessibilityHint="Fetches candidates and prepares the local cryptographic ballot"
          />
        )}
        <Button
          label="Return to Election Hub"
          variant="outline"
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
  statusCard: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  badgeRow: {
    flexDirection: "row",
  },
  headline: {
    ...typography.display,
    fontSize: 22,
    lineHeight: 28,
    color: colors.textPrimary,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  detailsGrid: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xxs,
  },
  detailLabel: {
    ...typography.eyebrow,
    color: colors.textMuted,
    fontSize: 11,
  },
  detailValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  detailValueSuccess: {
    color: colors.success.text,
  },
  securityNotice: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  securityIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  securityTextCol: {
    flex: 1,
    gap: 2,
  },
  securityTitle: {
    ...typography.bodyBold,
    color: colors.primaryDark,
    fontSize: 14,
  },
  securityBody: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  bold: {
    fontWeight: "700",
    color: colors.textPrimary,
  },
  actionGroup: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
