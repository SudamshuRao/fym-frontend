import React, { useCallback, useState } from "react";
import { View, Text, Pressable, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getTodaysEntries, revertFoodLogEntry } from "../api/foodLog";
import { FoodLogOut } from "../api/types";
import { colors, spacing, type } from "../theme";

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function TodaysFoodLogScreen() {
  const { token } = useAuth();
  const [entries, setEntries] = useState<FoodLogOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [revertingId, setRevertingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    if (!token) return;
    try {
      const result = await getTodaysEntries(token);
      // Most recent first - matches how the backend already orders them,
      // but explicit here in case that ever changes.
      setEntries(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load today's log.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadEntries();
    }, [loadEntries])
  );

  async function handleRevert(entryId: string) {
    if (!token) return;
    setRevertingId(entryId);
    try {
      await revertFoodLogEntry(token, entryId);
      await loadEntries(); // refresh so the strikethrough state shows immediately
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't revert this entry.");
    } finally {
      setRevertingId(null);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={false} onRefresh={loadEntries} />}
        ListEmptyComponent={<Text style={styles.empty}>Nothing logged today yet.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.entry, item.reverted && styles.entryReverted]}>
            <View style={styles.entryMain}>
              <Text style={[styles.entryName, item.reverted && styles.textReverted]}>{item.name}</Text>
              <Text style={[styles.entryMacros, item.reverted && styles.textReverted]}>
                {item.protein}P · {item.carb}C · {item.fat}F · {item.cal}cal
              </Text>
              <Text style={styles.entryMeta}>
                {formatTime(item.timestamp)} · {item.source === "recommended" ? "Recommended" : "Logged"}
              </Text>
            </View>

            {item.reverted ? (
              <Text style={styles.revertedLabel}>Reverted</Text>
            ) : (
              <Pressable
                style={({ pressed }) => [styles.revertButton, pressed && styles.revertButtonPressed]}
                onPress={() => handleRevert(item.id)}
                disabled={revertingId === item.id}
              >
                {revertingId === item.id ? (
                  <ActivityIndicator color={colors.error} size="small" />
                ) : (
                  <Text style={styles.revertButtonText}>Revert</Text>
                )}
              </Pressable>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  listContent: { padding: spacing.lg },
  error: { color: colors.error, ...type.small, padding: spacing.md },
  empty: { ...type.body, color: colors.textMuted, fontStyle: "italic", textAlign: "center", marginTop: spacing.xl },
  entry: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  entryReverted: { backgroundColor: colors.background, opacity: 0.6 },
  entryMain: { flex: 1, paddingRight: spacing.sm },
  entryName: { ...type.label, fontSize: 16, color: colors.text, marginBottom: 2 },
  entryMacros: { ...type.small, color: colors.textMuted, marginBottom: 2 },
  entryMeta: { ...type.small, color: colors.textMuted, fontSize: 11 },
  textReverted: { textDecorationLine: "line-through" },
  revertButton: {
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  revertButtonPressed: { backgroundColor: colors.background },
  revertButtonText: { color: colors.error, ...type.small, fontWeight: "600" },
  revertedLabel: { ...type.small, color: colors.textMuted, fontStyle: "italic" },
});
