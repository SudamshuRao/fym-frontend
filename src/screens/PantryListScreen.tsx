import React, { useCallback, useState } from "react";
import { View, Text, Pressable, StyleSheet, FlatList, ActivityIndicator, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { listPantryItems, deletePantryItem } from "../api/pantry";
import { PantryItemOut } from "../api/types";
import { colors, spacing, type } from "../theme";

export default function PantryListScreen({ navigation }: any) {
  const { token } = useAuth();
  const [items, setItems] = useState<PantryItemOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    if (!token) return;
    try {
      const result = await listPantryItems(token);
      setItems(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load your pantry.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadItems();
    }, [loadItems])
  );

  function confirmDelete(item: PantryItemOut) {
    Alert.alert("Remove item?", `Delete "${item.name}" from your pantry?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => handleDelete(item.id) },
    ]);
  }

  async function handleDelete(itemId: string) {
    if (!token) return;
    setDeletingId(itemId);
    try {
      await deletePantryItem(token, itemId);
      await loadItems();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't delete this item.");
    } finally {
      setDeletingId(null);
    }
  }

  function macroSummary(item: PantryItemOut): string {
    const parts = [];
    if (item.protein !== null) parts.push(`${item.protein}P`);
    if (item.carb !== null) parts.push(`${item.carb}C`);
    if (item.fat !== null) parts.push(`${item.fat}F`);
    if (item.cal !== null) parts.push(`${item.cal}cal`);
    return parts.length ? parts.join(" · ") : "No macro data";
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
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.empty}>Your pantry is empty.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.entry} onPress={() => navigation.navigate("PantryForm", { item })}>
            <View style={styles.entryMain}>
              <Text style={styles.entryName}>{item.name}</Text>
              {item.quantity !== null && (
                <Text style={styles.entryQuantity}>
                  {item.quantity}
                  {item.unit ?? ""} available
                </Text>
              )}
              <Text style={styles.entryMacros}>{macroSummary(item)}</Text>
            </View>

            <Pressable
              style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]}
              onPress={() => confirmDelete(item)}
              disabled={deletingId === item.id}
            >
              {deletingId === item.id ? (
                <ActivityIndicator color={colors.error} size="small" />
              ) : (
                <Text style={styles.deleteButtonText}>Delete</Text>
              )}
            </Pressable>
          </Pressable>
        )}
      />

      <Pressable
        style={({ pressed }) => [styles.addButton, pressed && styles.buttonPressed]}
        onPress={() => navigation.navigate("PantryForm", {})}
      >
        <Text style={styles.addButtonText}>Add item</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  listContent: { padding: spacing.lg, paddingBottom: spacing.xl + 60 },
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
  entryMain: { flex: 1, paddingRight: spacing.sm },
  entryName: { ...type.label, fontSize: 16, color: colors.text, marginBottom: 2 },
  entryQuantity: { ...type.small, color: colors.textMuted, marginBottom: 2 },
  entryMacros: { ...type.small, color: colors.textMuted },
  deleteButton: {
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  deleteButtonPressed: { backgroundColor: colors.background },
  deleteButtonText: { color: colors.error, ...type.small, fontWeight: "600" },
  addButton: {
    position: "absolute",
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  buttonPressed: { backgroundColor: colors.primaryPressed },
  addButtonText: { color: colors.surface, ...type.label, fontSize: 16 },
});
