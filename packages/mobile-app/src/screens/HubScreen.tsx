import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Election } from "@evoting/core-api";
import { Badge, Button, Card, Header } from "../components";
import { colors, radius, spacing, typography } from "../theme";

export interface HubScreenProps {
  elections: Election[];
  onSelect: (election: Election) => void;
  onRefresh: () => void;
  onPublic: (screen: "watchdog" | "results" | "settings") => void;
  busy?: boolean;
}

export function HubScreen({
  elections,
  onSelect,
  onRefresh,
  onPublic,
  busy = false,
}: HubScreenProps) {
  const [filter, setFilter] = useState<"all" | "open">("all");

  const openCount = elections.filter((e) => e.availability === "open").length;
  const filteredElections =
    filter === "open"
      ? elections.filter((e) => e.availability === "open")
      : elections;

  return (
    <View style={styles.container}>
      <Header
        eyebrow="NATIONAL E-VOTING SYSTEM"
        title="Election Hub"
        subtitle="Select an active election to authenticate and cast a verifiable ballot."
      />

      {/* Security Assurance Card */}
      <View style={styles.trustBanner} accessible accessibilityRole="summary">
        <Text style={styles.trustIcon}>🛡</Text>
        <View style={styles.trustTextCol}>
          <Text style={styles.trustTitle}>End-to-End Cryptographic Security</Text>
          <Text style={styles.trustBody}>
            Ballots are encrypted on this device using ElGamal public key cryptography and verified with zero-knowledge proofs.
          </Text>
        </View>
      </View>

      {/* Elections Header & Filter Controls */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Available Elections
          </Text>
          <Badge
            label={`${openCount} Open`}
            variant={openCount > 0 ? "open" : "neutral"}
          />
        </View>

        {elections.length > 0 && (
          <View style={styles.filterRow} accessible accessibilityRole="radiogroup">
            <Button
              label={`All (${elections.length})`}
              variant={filter === "all" ? "primary" : "outline"}
              onPress={() => setFilter("all")}
              style={styles.filterButton}
              accessibilityLabel="Show all elections"
            />
            <Button
              label={`Open for Voting (${openCount})`}
              variant={filter === "open" ? "primary" : "outline"}
              onPress={() => setFilter("open")}
              style={styles.filterButton}
              accessibilityLabel="Show open elections only"
            />
          </View>
        )}
      </View>

      {/* Elections List or Empty State */}
      {filteredElections.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🗳</Text>
          <Text style={styles.emptyTitle}>
            {filter === "open"
              ? "No Elections Open for Voting"
              : "No Elections Available"}
          </Text>
          <Text style={styles.emptyBody}>
            {filter === "open"
              ? "There are currently no elections in an open voting state. Check back during official voting hours."
              : "No election registers were returned by the authority server. Tap below to check for updates."}
          </Text>
          <Button
            label="Refresh Elections"
            variant="outline"
            onPress={onRefresh}
            loading={busy}
            style={styles.refreshButton}
          />
        </Card>
      ) : (
        <View style={styles.electionsList}>
          {filteredElections.map((election) => {
            const isOpen = election.availability === "open";
            return (
              <Card
                key={election.election_id}
                onPress={() => onSelect(election)}
                accessibilityRole="button"
                accessibilityLabel={`${election.name}, status: ${
                  isOpen ? "Open for voting" : `Not accepting votes, ${election.status}`
                }`}
                accessibilityHint={
                  isOpen
                    ? "Tap to select this election and begin authentication"
                    : "Viewing details for closed election"
                }
                style={[styles.electionCard, isOpen && styles.electionCardOpen]}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.cardHeaderCol}>
                    <Text style={styles.electionName}>{election.name}</Text>
                    <Text style={styles.electionId} numberOfLines={1} ellipsizeMode="middle">
                      ID: {election.election_id}
                    </Text>
                  </View>
                  <Badge
                    label={isOpen ? "Open for Voting" : `Closed · ${election.status}`}
                    variant={isOpen ? "open" : "closed"}
                  />
                </View>

                <View style={styles.cardBottomRow}>
                  <Text style={styles.actionHint}>
                    {isOpen ? "Select to vote →" : "View details"}
                  </Text>
                </View>
              </Card>
            );
          })}
        </View>
      )}

      {/* Manual Refresh Action */}
      {elections.length > 0 && (
        <Button
          label="Refresh Elections"
          variant="ghost"
          onPress={onRefresh}
          loading={busy}
          icon="↻"
          style={styles.refreshAction}
        />
      )}

      {/* Public Tools & Monitoring Section */}
      <View style={styles.toolsSection}>
        <Text accessibilityRole="header" style={styles.toolsTitle}>
          Public Auditing & Security
        </Text>
        <Text style={styles.toolsSubtitle}>
          Independent verification tools open to all citizens without signing in.
        </Text>

        <View style={styles.toolsRow}>
          <Button
            label="Watchdog Stats"
            variant="outline"
            onPress={() => onPublic("watchdog")}
            style={styles.toolButton}
            accessibilityHint="View public turnout and key ceremony progress"
          />
          <Button
            label="Election Results"
            variant="outline"
            onPress={() => onPublic("results")}
            style={styles.toolButton}
            accessibilityHint="View officially published election tallies"
          />
          <Button
            label="Device Settings"
            variant="outline"
            onPress={() => onPublic("settings")}
            style={styles.toolButton}
            accessibilityHint="Manage device security sessions and audit storage"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.base,
  },
  trustBanner: {
    flexDirection: "row",
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    alignItems: "center",
  },
  trustIcon: {
    fontSize: 24,
  },
  trustTextCol: {
    flex: 1,
    gap: 2,
  },
  trustTitle: {
    ...typography.bodyBold,
    color: colors.primaryDark,
  },
  trustBody: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  sectionHeader: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    ...typography.title2,
    color: colors.textPrimary,
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
  },
  electionsList: {
    gap: spacing.sm,
  },
  electionCard: {
    gap: spacing.sm,
    padding: spacing.base,
  },
  electionCardOpen: {
    borderColor: colors.primaryLight,
    backgroundColor: colors.surface,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  cardHeaderCol: {
    flex: 1,
    gap: spacing.xxs,
  },
  electionName: {
    ...typography.title3,
    color: colors.textPrimary,
  },
  electionId: {
    ...typography.mono,
    color: colors.textMuted,
    fontSize: 12,
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionHint: {
    ...typography.captionBold,
    color: colors.primary,
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
    textAlign: "center",
  },
  emptyBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  refreshButton: {
    marginTop: spacing.sm,
  },
  refreshAction: {
    alignSelf: "center",
  },
  toolsSection: {
    marginTop: spacing.md,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  toolsTitle: {
    ...typography.title3,
    color: colors.textPrimary,
  },
  toolsSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  toolsRow: {
    flexDirection: "column",
    gap: spacing.sm,
  },
  toolButton: {
    width: "100%",
  },
});
