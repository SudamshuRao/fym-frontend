import React, { useCallback, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getDailyTarget } from "../api/dailyTarget";
import { DailyTargetOut } from "../api/types";
import { colors, spacing, type } from "../theme";

export default function HomeScreen({ navigation }: any) {
  const { user, token, logout } = useAuth();
  const [target, setTarget] = useState<DailyTargetOut | null>(null);
  const [loadingTarget, setLoadingTarget] = useState(true);

  // Re-fetch every time this screen comes into focus (not just on first
  // mount) - so returning from the Daily Target screen after saving
  // shows the updated values immediately, without a manual refresh.
  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      let cancelled = false;
      setLoadingTarget(true);
      getDailyTarget(token)
        .then((result) => {
          if (!cancelled) setTarget(result);
        })
        .finally(() => {
          if (!cancelled) setLoadingTarget(false);
        });
      return () => {
        cancelled = true;
      };
    }, [token])
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>Logged in as</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Daily target</Text>
        {loadingTarget ? (
          <ActivityIndicator color={colors.primary} style={{ marginBottom: spacing.lg }} />
        ) : target ? (
          <View style={styles.targetGrid}>
            <View style={styles.targetItem}>
              <Text style={styles.targetValue}>{target.protein}g</Text>
              <Text style={styles.targetLabel}>Protein</Text>
            </View>
            <View style={styles.targetItem}>
              <Text style={styles.targetValue}>{target.carb}g</Text>
              <Text style={styles.targetLabel}>Carbs</Text>
            </View>
            <View style={styles.targetItem}>
              <Text style={styles.targetValue}>{target.fat}g</Text>
              <Text style={styles.targetLabel}>Fat</Text>
            </View>
            <View style={styles.targetItem}>
              <Text style={styles.targetValue}>{target.cal}</Text>
              <Text style={styles.targetLabel}>Calories</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noTarget}>No daily target set yet.</Text>
        )}

        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          onPress={() => navigation.navigate("DailyTarget")}
        >
          <Text style={styles.secondaryButtonText}>
            {target ? "Edit daily target" : "Set daily target"}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={logout}
        >
          <Text style={styles.buttonText}>Log out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: spacing.lg },
  eyebrow: { ...type.small, color: colors.textMuted, marginBottom: spacing.xs },
  email: { ...type.title, color: colors.text, marginBottom: spacing.lg },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: spacing.lg },
  label: { ...type.label, color: colors.textMuted, marginBottom: spacing.sm },
  noTarget: { ...type.body, color: colors.textMuted, marginBottom: spacing.lg, fontStyle: "italic" },
  targetGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.lg, gap: spacing.md },
  targetItem: { minWidth: 80 },
  targetValue: { ...type.title, fontSize: 22, color: colors.text },
  targetLabel: { ...type.small, color: colors.textMuted },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  secondaryButtonText: { color: colors.primary, ...type.label, fontSize: 16 },
  button: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  buttonPressed: { backgroundColor: colors.surface },
  buttonText: { color: colors.text, ...type.label, fontSize: 16 },
});
