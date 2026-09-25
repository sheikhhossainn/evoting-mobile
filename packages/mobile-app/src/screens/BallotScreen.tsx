import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Candidate } from "@evoting/core-api";
import { Badge, Button, Card, ChoiceCard, Header } from "../components";
import { colors, radius, spacing, typography } from "../theme";

export interface BallotScreenProps {
  candidates: Candidate[];
  selected: Candidate | null;
  onSelect: (candidate: Candidate) => void;
  onAudit: () => void;
  onProceedToCast: () => void;
  onBack: () => void;
  busy?: boolean;
}

export function BallotScreen({
  candidates,
  selected,
  onSelect,
  onAudit,
  onProceedToCast,
  onBack,
  busy = false,
}: BallotScreenProps) {
  const hasSelection = selected !== null;

  return (
    <View style={styles.container}>
      <Header
        eyebrow="STEP 3 OF 3"
        title="Official Ballot"
        subtitle="Select one candidate. Your ballot is encrypted locally before submission."
        onBack={onBack}
        backLabel="Voter Status"
      />

      {/* Cryptographic Privacy Assurance */}
      <View style={styles.cryptographyNotice}>
        <Text style={styles.cryptographyIcon}>🔒</Text>
        <View style={styles.cryptographyTextCol}>
          <Text style={styles.cryptographyTitle}>Ballot Secrecy & Integrity</Text>
          <Text style={styles.cryptographyBody}>
            Your choice is encrypted with the election public key. A non-interactive zero-knowledge proof (ZKP) proves your ballot is valid without revealing who you voted for.
          </Text>
        </View>
      </View>

      {/* Candidates List Header */}
      <View style={styles.candidateHeaderRow}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Candidates
        </Text>
        <Text style={styles.candidateCount}>
          {candidates.length} candidate{candidates.length === 1 ? "" : "s"} on ballot
        </Text>
      </View>

      {/* Candidate List or Empty State */}
      {candidates.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Candidates Available</Text>
          <Text style={styles.emptyBody}>
            The candidate list for your assigned constituency could not be loaded. Please return to the status screen and retry.
          </Text>
          <Button label="Back to Status" variant="outline" onPress={onBack} />
        </Card>
      ) : (
        <View style={styles.candidateList} accessible accessibilityRole="radiogroup">
          {candidates.map((candidate) => {
            const isSelected = selected?.id === candidate.id;
            return (
              <ChoiceCard
                key={candidate.id}
                title={candidate.name}
                subtitle={`${candidate.party} · Constituency ${candidate.constituency_code}`}
                tag={candidate.party}
                selected={isSelected}
                onSelect={() => onSelect(candidate)}
                accessibilityLabel={`${candidate.name}, Party: ${candidate.party}, Constituency: ${candidate.constituency_code}`}
                accessibilityHint="Double tap to select this candidate for your ballot"
              />
            );
          })}
        </View>
      )}

      {/* Selection Confirmation Bar */}
      {hasSelection && (
        <Card variant="highlight" style={styles.selectionSummaryCard}>
          <View style={styles.selectionRow}>
            <View style={styles.selectionTextCol}>
              <Text style={styles.selectionEyebrow}>YOUR SELECTION</Text>
              <Text style={styles.selectionName}>{selected.name}</Text>
              <Text style={styles.selectionParty}>{selected.party}</Text>
            </View>
            <Badge label="Selected" variant="eligible" />
          </View>
        </Card>
      )}

      {/* Decision Actions: Cast directly OR Benaloh Audit */}
      <View style={styles.actionGroup}>
        <Button
          label="Review & Cast Vote"
          onPress={onProceedToCast}
          disabled={!hasSelection || busy}
          loading={busy}
          icon="✓"
          accessibilityLabel="Proceed to cast your vote"
          accessibilityHint={
            hasSelection
              ? "Advances to the final confirmation and submission screen"
              : "Disabled until you select a candidate"
          }
        />

        <View style={styles.auditOptionCard}>
          <Text style={styles.auditOptionTitle}>Benaloh Cast-or-Audit Verification</Text>
          <Text style={styles.auditOptionBody}>
            You can independently audit your encrypted ballot before submitting. Auditing opens and reveals the encryption randomness to verify correctness, then discards the audited ballot.
          </Text>
          <Button
            label="Audit Ballot First (Benaloh Check)"
            variant="outline"
            onPress={onAudit}
            disabled={!hasSelection || busy}
            icon="🛡"
            accessibilityLabel="Audit this ballot using Benaloh verification"
            accessibilityHint="Generates an audited ballot to verify encryption correctness"
          />
        </View>

        <Button
          label="Change Voter or Election"
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
  cryptographyNotice: {
    flexDirection: "row",
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  cryptographyIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  cryptographyTextCol: {
    flex: 1,
    gap: 2,
  },
  cryptographyTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  cryptographyBody: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  candidateHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.title2,
    color: colors.textPrimary,
  },
  candidateCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
  candidateList: {
    gap: spacing.xs,
  },
  emptyCard: {
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    ...typography.title2,
    color: colors.textPrimary,
  },
  emptyBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
  selectionSummaryCard: {
    padding: spacing.md,
  },
  selectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectionTextCol: {
    gap: 2,
  },
  selectionEyebrow: {
    ...typography.eyebrow,
    color: colors.primaryDark,
    fontSize: 11,
  },
  selectionName: {
    ...typography.title2,
    color: colors.primaryDark,
  },
  selectionParty: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  actionGroup: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  auditOptionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  auditOptionTitle: {
    ...typography.title3,
    color: colors.textPrimary,
  },
  auditOptionBody: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
