import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { ApiError, createApiClient, type ApiClient, type Candidate, type Election, type PublicResults, type PublicStats, type VoterMe } from "@evoting/core-api";
import { createClientElGamal, type EncryptedBallot, type ElGamalPublicKey } from "@evoting/core-crypto";
import { expoCryptoPrimitives } from "./src/expoCrypto";
import { createSecureSessionStore, deleteAuditRecord, getOrCreateDeviceId, saveAuditRecord } from "./src/secureSessionStore";
import { colors, radius, spacing, typography } from "./src/theme";
import { Button, StatusBanner } from "./src/components";
import {
  HubScreen,
  AuthScreen,
  StatusScreen,
  BallotScreen,
  AuditScreen,
} from "./src/screens";

type Screen = "hub" | "auth" | "status" | "ballot" | "audit" | "confirm" | "receipt" | "verify" | "watchdog" | "results" | "settings";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? "https://api.example.invalid";
const cryptoClient = createClientElGamal(expoCryptoPrimitives);

export default function App() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const [screen, setScreen] = useState<Screen>("hub");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [nid, setNid] = useState("");
  const [me, setMe] = useState<VoterMe | null>(null);
  const [publicKey, setPublicKey] = useState<ElGamalPublicKey | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [auditBallot, setAuditBallot] = useState<EncryptedBallot | null>(null);
  const [voteId, setVoteId] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<string | null>(null);
  const [publicStats, setPublicStats] = useState<PublicStats | null>(null);
  const [publicResults, setPublicResults] = useState<PublicResults | null>(null);
  const sessionStore = useMemo(() => createSecureSessionStore(), []);
  const api = useMemo<ApiClient | null>(() => {
    if (!deviceId) return null;
    return createApiClient({
      baseUrl: API_BASE,
      deviceId,
      sessionStore,
      allowInsecureLocalhost: typeof __DEV__ !== "undefined" && __DEV__,
    });
  }, [deviceId, sessionStore]);

  useEffect(() => {
    getOrCreateDeviceId(async (length) => CryptoRandomBytes(length)).then(setDeviceId).catch((cause) => setError(messageFor(cause)));
    const unsubscribe = NetInfo.addEventListener((state) => setOnline(state.isConnected !== false && state.isInternetReachable !== false));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!api || !online) return;
    void refreshElections(api);
  }, [api, online]);

  async function refreshElections(client: ApiClient) {
    setBusy(true);
    setError(null);
    try { setElections((await client.listElections()).elections); }
    catch (cause) { setError(messageFor(cause)); }
    finally { setBusy(false); }
  }

  async function authenticate() {
    if (!api || !selectedElection || !online || !/^\d{11}$/.test(nid)) return;
    setBusy(true); setError(null);
    try {
      const response = await api.authenticate(nid, selectedElection.election_id);
      setMe({ election_id: response.election_id, ...response.voter });
      setScreen("status");
    } catch (cause) { setError(messageFor(cause)); }
    finally { setBusy(false); }
  }

  async function openBallot() {
    if (!api || !selectedElection || !online) return;
    setBusy(true); setError(null);
    try {
      const [key, list] = await Promise.all([
        api.getPublicKey(selectedElection.election_id),
        api.getCandidates(selectedElection.election_id),
      ]);
      setPublicKey(key); setCandidates(list.candidates); setScreen("ballot");
    } catch (cause) { setError(messageFor(cause)); }
    finally { setBusy(false); }
  }

  function beginAudit() {
    if (!selectedCandidate || !publicKey || !selectedElection) return;
    const audited = cryptoClient.encryptCandidateIdForAudit(selectedCandidate.id, publicKey);
    setAuditBallot(audited);
    setScreen("audit");
  }

  async function cast() {
    if (!api || !selectedElection || !selectedCandidate || !publicKey || !online) return;
    setBusy(true); setError(null);
    try {
      const proof = await cryptoClient.encryptCandidateIdWithProof(
        selectedCandidate.id,
        publicKey,
        candidates.map((candidate) => candidate.id)
      );
      const result = await api.castVote(selectedElection.election_id, proof.ciphertext, proof.zkpProof);
      setVoteId(result.vote_id); setScreen("receipt");
    } catch (cause) { setError(messageFor(cause)); }
    finally { setBusy(false); }
  }

  async function verify() {
    if (!api || !selectedElection || !voteId || !online) return;
    setBusy(true); setError(null); setVerifyResult(null);
    try {
      const dense = await api.verifyVote(selectedElection.election_id, voteId);
      let summary = dense.included_on_chain === false ? "The server detected a chain mismatch." : dense.included_locally ? "Vote is included in the anchored batch." : "Verification is pending.";
      try {
        const smt = await api.verifySmtVote(selectedElection.election_id, voteId);
        summary += smt.type === "membership" ? " The nullifier is included in the anchored sparse tree." : " The nullifier is not included in the anchored sparse tree.";
      } catch (cause) {
        if (!(cause instanceof ApiError && cause.status === 404)) throw cause;
      }
      setVerifyResult(summary);
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 404) setVerifyResult("Verification is pending anchoring.");
      else setError(messageFor(cause));
    } finally { setBusy(false); }
  }

  async function loadPublic(kind: "watchdog" | "results", election: Election) {
    if (!api || !online) return;
    setBusy(true); setError(null);
    try {
      if (kind === "watchdog") setPublicStats(await api.publicStats(election.election_id));
      else setPublicResults(await api.publicResults(election.election_id));
    } catch (cause) { setError(messageFor(cause)); }
    finally { setBusy(false); }
  }

  function openPublic(kind: "watchdog" | "results") {
    const election = selectedElection ?? elections[0];
    if (!election) { setError("Select an election before opening public data."); return; }
    setSelectedElection(election); setScreen(kind); void loadPublic(kind, election);
  }

  function saveCurrentAudit() {
    if (!auditBallot || !selectedCandidate || !selectedElection) return;
    void saveAuditRecord({
      electionId: selectedElection.election_id,
      candidateId: selectedCandidate.id,
      ciphertext: auditBallot.ciphertext,
      randomness: auditBallot.randomness,
      savedAt: new Date().toISOString(),
    });
  }

  async function signOut(all: boolean) {
    if (!api || !online) return;
    setBusy(true); setError(null);
    try { if (all) await api.revokeAllSessions(); else await api.revokeSession(); setMe(null); setScreen("hub"); }
    catch (cause) { setError(messageFor(cause)); }
    finally { setBusy(false); }
  }

  const selectElection = (election: Election) => {
    setSelectedElection(election); setError(null);
    if (election.availability === "open") setScreen("auth");
  };

  if (!deviceId) return <Centered><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.muted}>Preparing secure device storage…</Text></Centered>;

  const isNewScreen = screen === "hub" || screen === "auth" || screen === "status" || screen === "ballot" || screen === "audit";

  return (
    <SafeAreaView style={styles.safe}>
      {!online && (
        <View accessible accessibilityRole="alert" style={styles.offline}>
          <Text style={styles.offlineIcon}>⚠️</Text>
          <Text style={styles.offlineText}>
            You appear to be offline. Your vote is NOT recorded. Reconnect to continue.
          </Text>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {!isNewScreen && (
          <View style={styles.header}>
            <Text style={styles.eyebrow}>E-VOTING</Text>
            <Text style={styles.title}>A clear, verifiable ballot.</Text>
            <Text style={styles.muted}>Server truth first. No offline vote creation.</Text>
          </View>
        )}
        {error && (
          <StatusBanner
            variant="danger"
            title="Action Failed"
            message={error}
            onDismiss={() => setError(null)}
          />
        )}
        {busy && <ActivityIndicator color={colors.primary} style={styles.spinner} />}
        {screen === "hub" && (
          <HubScreen
            elections={elections}
            onSelect={selectElection}
            onRefresh={() => {
              if (api) void refreshElections(api);
            }}
            onPublic={(next) => (next === "settings" ? setScreen("settings") : openPublic(next))}
            busy={busy}
          />
        )}
        {screen === "auth" && selectedElection && (
          <AuthScreen
            election={selectedElection}
            nid={nid}
            setNid={setNid}
            onSubmit={authenticate}
            onBack={() => setScreen("hub")}
            busy={busy}
          />
        )}
        {screen === "status" && me && (
          <StatusScreen
            me={me}
            onContinue={openBallot}
            onBack={() => setScreen("hub")}
            busy={busy}
          />
        )}
        {screen === "ballot" && (
          <BallotScreen
            candidates={candidates}
            selected={selectedCandidate}
            onSelect={setSelectedCandidate}
            onAudit={beginAudit}
            onProceedToCast={() => setScreen("confirm")}
            onBack={() => setScreen("status")}
            busy={busy}
          />
        )}
        {screen === "audit" && auditBallot && selectedCandidate && (
          <AuditScreen
            ballot={auditBallot}
            candidate={selectedCandidate}
            onSave={saveCurrentAudit}
            onCastFresh={() => setScreen("confirm")}
            onBack={() => setScreen("ballot")}
            busy={busy}
          />
        )}
        {screen === "confirm" && selectedCandidate && (
          <Confirm candidate={selectedCandidate} onCast={cast} onBack={() => setScreen("ballot")} />
        )}
        {screen === "receipt" && (
          <Receipt
            voteId={voteId}
            onVerify={() => {
              setScreen("verify");
              void verify();
            }}
            onHome={() => setScreen("hub")}
          />
        )}
        {screen === "verify" && (
          <Verify
            voteId={voteId}
            result={verifyResult}
            onVerify={verify}
            onBack={() => setScreen("receipt")}
          />
        )}
        {screen === "watchdog" && (
          <Watchdog
            stats={publicStats}
            onRefresh={() => {
              if (selectedElection) void loadPublic("watchdog", selectedElection);
            }}
            onBack={() => setScreen("hub")}
          />
        )}
        {screen === "results" && (
          <Results
            results={publicResults}
            onRefresh={() => {
              if (selectedElection) void loadPublic("results", selectedElection);
            }}
            onBack={() => setScreen("hub")}
          />
        )}
        {screen === "settings" && (
          <Settings
            onSignOut={() => signOut(false)}
            onSignOutAll={() => signOut(true)}
            onDeleteAudit={deleteAuditRecord}
            onBack={() => setScreen("hub")}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

async function CryptoRandomBytes(length: number): Promise<Uint8Array> {
  const { getRandomBytesAsync } = await import("expo-crypto");
  return getRandomBytesAsync(length);
}

function messageFor(cause: unknown): string {
  if (cause instanceof ApiError) {
    if (cause.code === "ELECTION_NOT_OPEN") return "This election is not accepting votes.";
    if (cause.code === "VOTE_ALREADY_CAST") return "You have already voted in this election.";
    if (cause.code === "KEY_NOT_READY") return "The election key is not ready yet. Try again later.";
    if (cause.code === "DEVICE_MISMATCH") return "This session belongs to another device. Sign in again.";
    return cause.message;
  }
  return cause instanceof Error ? cause.message : "Something went wrong. Try again.";
}

function Centered({ children }: { children: ReactNode }) {
  return <View style={styles.centered}>{children}</View>;
}

function Confirm({ candidate, onCast, onBack }: { candidate: Candidate; onCast: () => void; onBack: () => void }) {
  return (
    <View style={styles.legacyCard}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>Confirm your vote</Text>
      <Text style={styles.copy}>You selected {candidate.name}. Nothing is recorded until the server confirms a real response.</Text>
      <Button label="Cast vote" onPress={onCast} />
      <Button label="Change selection" onPress={onBack} secondary />
    </View>
  );
}

function Receipt({ voteId, onVerify, onHome }: { voteId: string | null; onVerify: () => void; onHome: () => void }) {
  return (
    <View style={styles.legacyCard}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>Vote received</Text>
      <Text style={styles.copy}>The server recorded this ballot. It is awaiting anchoring until the receipt can be verified on-chain.</Text>
      <Text selectable accessibilityLabel={`Vote ID: ${voteId ?? "unavailable"}`} style={styles.mono}>Vote ID: {voteId ?? "unavailable"}</Text>
      <Button label="Verify receipt" onPress={onVerify} />
      <Button label="Return to elections" onPress={onHome} secondary />
    </View>
  );
}

function Verify({ voteId, result, onVerify, onBack }: { voteId: string | null; result: string | null; onVerify: () => void; onBack: () => void }) {
  return (
    <View style={styles.legacyCard}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>Verify</Text>
      <Text style={styles.mono}>Vote ID: {voteId ?? "unavailable"}</Text>
      {result && <Text style={styles.copy}>{result}</Text>}
      <Button label="Check anchored proof" onPress={onVerify} disabled={!voteId} />
      <Button label="Back to receipt" onPress={onBack} secondary />
    </View>
  );
}

function Watchdog({ stats, onRefresh, onBack }: { stats: PublicStats | null; onRefresh: () => void; onBack: () => void }) {
  return (
    <View style={styles.legacyCard}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>Watchdog</Text>
      {stats ? (
        <>
          <Text style={styles.copy}>{stats.total_votes_cast} votes recorded · {stats.turnout_pct}% turnout</Text>
          <Text style={styles.copy}>Key ceremony: {stats.key_ceremony.submitted_count}/{stats.key_ceremony.total} shares · {stats.key_ceremony.threshold_met ? "threshold met" : "threshold pending"}</Text>
          <Text style={styles.copy}>Anchored batches: {stats.anchoring.batches_anchored}</Text>
        </>
      ) : (
        <Text style={styles.muted}>Public data has not loaded yet.</Text>
      )}
      <Button label="Refresh watchdog" onPress={onRefresh} secondary />
      <Button label="Back to elections" onPress={onBack} secondary />
    </View>
  );
}

function Results({ results, onRefresh, onBack }: { results: PublicResults | null; onRefresh: () => void; onBack: () => void }) {
  return (
    <View style={styles.legacyCard}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>Results</Text>
      {!results || results.status === "not_tallied" ? (
        <Text style={styles.copy}>Results have not been tallied yet.</Text>
      ) : (
        <>
          <Text style={styles.copy}>Published {results.tallied_at ?? "results"} · {results.valid_votes ?? 0} valid votes</Text>
          <Text selectable style={styles.mono}>{JSON.stringify(results.results, null, 2)}</Text>
        </>
      )}
      <Button label="Refresh results" onPress={onRefresh} secondary />
      <Button label="Back to elections" onPress={onBack} secondary />
    </View>
  );
}

function Settings({ onSignOut, onSignOutAll, onDeleteAudit, onBack }: { onSignOut: () => void; onSignOutAll: () => void; onDeleteAudit: () => Promise<void>; onBack: () => void }) {
  return (
    <View style={styles.legacyCard}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>Security settings</Text>
      <Text style={styles.copy}>Session tokens and optional audit data are stored in OS secure storage. Signing out removes this device session.</Text>
      <Button label="Sign out this device" onPress={onSignOut} />
      <Button label="Sign out everywhere" onPress={onSignOutAll} />
      <Button label="Delete saved audit data" onPress={() => void onDeleteAudit()} secondary />
      <Button label="Back" onPress={onBack} secondary />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { gap: spacing.xs, marginBottom: spacing.sm },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: "800", letterSpacing: 2 },
  title: { color: colors.text, fontSize: 26, fontWeight: "800", lineHeight: 32 },
  sectionTitle: { color: colors.text, fontSize: 22, fontWeight: "800", marginBottom: spacing.xs },
  copy: { color: colors.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: spacing.sm },
  muted: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  legacyCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, borderWidth: 1, borderColor: colors.border },
  offline: {
    backgroundColor: colors.danger,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  offlineIcon: { color: colors.textInverse, fontSize: 16 },
  offlineText: { color: colors.textInverse, textAlign: "center", fontWeight: "700", fontSize: 13, flex: 1 },
  spinner: { marginVertical: spacing.sm },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, backgroundColor: colors.background },
  mono: {
    color: colors.textSecondary,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 13,
    lineHeight: 18,
  },
});
