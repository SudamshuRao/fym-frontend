import React, { useCallback, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getPreferenceSummary, refreshPreferenceSummary } from "../api/personalization";
import { PreferenceSummaryOut } from "../api/types";
import { colors, spacing, type } from "../theme";

export default function PersonalizationScreen() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<PreferenceSummaryOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [refreshNote, setRefreshNote] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    if (!token) return;
    try {
      const result = await getPreferenceSummary(token);
      setSummary(result);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Couldn't load your preferences.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadSummary();
    }, [loadSummary])
  );

  async function handleRefresh() {
    if (!token) return;
    setRefreshError(null);
    setRefreshNote(null);
    setRefreshing(true);
    try {
      const result = await refreshPreferenceSummary(token);
      setSummary(result.summary);
      setRefreshNote(
        result.events_processed > 0
          ? `Updated based on ${result.events_processed} recent recommendation${result.events_processed === 1 ? "" : "s"}.`
          : "No new activity to learn from yet - keep accepting or skipping recommendations."
      );
    } catch (e) {
      setRefreshError(e instanceof Error ? e.message : "Couldn't refresh your preferences.");
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const hasAnyPreferences = summary && (summary.prefers.length > 0 || summary.avoids.length > 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your preferences</Text>
      <Text style={styles.subtitle}>
        Learned from what you accept or skip in recommendations - never a hard filter, just a soft
        nudge toward what you tend to like.
      </Text>

      {loadError ? <Text style={styles.error}>{loadError}</Text> : null}

      {!hasAnyPreferences ? (
        <Text style={styles.empty}>
          Nothing learned yet. Accept or skip a few recommendations, then refresh below.
        </Text>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Prefers</Text>
            {summary!.prefers.length === 0 ? (
              <Text style={styles.emptySection}>Nothing yet</Text>
            ) : (
              summary!.prefers.map((item) => (
                <Text key={item} style={styles.tag}>
                  • {item}
                </Text>
              ))
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Avoids</Text>
            {summary!.avoids.length === 0 ? (
              <Text style={styles.emptySection}>Nothing yet</Text>
            ) : (
              summary!.avoids.map((item) => (
                <Text key={item} style={styles.tag}>
                  • {item}
                </Text>
              ))
            )}
          </View>
        </>
      )}

      {refreshError ? <Text style={styles.error}>{refreshError}</Text> : null}
      {refreshNote ? <Text style={styles.successMessage}>{refreshNote}</Text> : null}

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={handleRefresh}
        disabled={refreshing}
      >
        {refreshing ? (
          <ActivityIndicator color={colors.surface} />
        ) : (
          <Text style={styles.buttonText}>Refresh preferences</Text>
        )}
      </Pressable>

      {refreshing && (
        <Text style={styles.generatingNote}>
          This calls a local AI model and can take up to 30 seconds - hang tight.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...type.title, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...type.body, color: colors.textMuted, marginBottom: spacing.xl, fontSize: 14 },
  error: { color: colors.error, ...type.small, marginBottom: spacing.md },
  successMessage: { color: colors.primary, ...type.small, marginBottom: spacing.md },
  empty: { ...type.body, color: colors.textMuted, fontStyle: "italic", marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg },
  sectionLabel: { ...type.label, color: colors.text, marginBottom: spacing.xs },
  emptySection: { ...type.small, color: colors.textMuted, fontStyle: "italic" },
  tag: { ...type.body, fontSize: 15, color: colors.text, marginBottom: 2 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonPressed: { backgroundColor: colors.primaryPressed },
  buttonText: { color: colors.surface, ...type.label, fontSize: 16 },
  generatingNote: { ...type.small, color: colors.textMuted, textAlign: "center", marginTop: spacing.sm, fontStyle: "italic" },
});
