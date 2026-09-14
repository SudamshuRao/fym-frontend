import React, { useCallback, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getRemaining } from "../api/foodLog";
import { RemainingOut } from "../api/types";
import { colors, spacing, type } from "../theme";

function MacroStat({
  remaining,
  target,
  label,
  unit,
}: {
  remaining: number;
  target: number;
  label: string;
  unit: string;
}) {
  const isOver = remaining < 0;
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, isOver && styles.statValueOver]}>
        {remaining}
        {unit}
      </Text>
      <Text style={styles.statTarget}>
        of {target}
        {unit}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen({ navigation }: any) {
  const { user, token, logout } = useAuth();
  const [remaining, setRemaining] = useState<RemainingOut | null>(null);
  const [loading, setLoading] = useState(true);

  // Re-fetch every time this screen comes into focus - so returning
  // from Log Food (or Daily Target) shows the updated numbers
  // immediately, without a manual refresh.
  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      let cancelled = false;
      setLoading(true);
      getRemaining(token)
        .then((result) => {
          if (!cancelled) setRemaining(result);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
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

        <Text style={styles.sectionLabel}>Remaining today</Text>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginBottom: spacing.lg }} />
        ) : remaining ? (
          <View style={styles.statsGrid}>
            <MacroStat remaining={remaining.protein} target={remaining.target_protein} label="Protein" unit="g" />
            <MacroStat remaining={remaining.carb} target={remaining.target_carb} label="Carbs" unit="g" />
            <MacroStat remaining={remaining.fat} target={remaining.target_fat} label="Fat" unit="g" />
            <MacroStat remaining={remaining.cal} target={remaining.target_cal} label="Calories" unit="" />
          </View>
        ) : (
          <Text style={styles.noTarget}>Set a daily target to see what's remaining.</Text>
        )}

        {remaining && (
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={() => navigation.navigate("LogFood")}
          >
            <Text style={styles.primaryButtonText}>Log food</Text>
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          onPress={() => navigation.navigate("TodaysFoodLog")}
        >
          <Text style={styles.secondaryButtonText}>Today's log</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          onPress={() => navigation.navigate("Standalone")}
        >
          <Text style={styles.secondaryButtonText}>Quick calculator</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          onPress={() => navigation.navigate("Pantry")}
        >
          <Text style={styles.secondaryButtonText}>Pantry</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          onPress={() => navigation.navigate("CookRecommendation")}
        >
          <Text style={styles.secondaryButtonText}>What should I cook?</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          onPress={() => navigation.navigate("DailyTarget")}
        >
          <Text style={styles.secondaryButtonText}>
            {remaining ? "Edit daily target" : "Set daily target"}
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
  sectionLabel: { ...type.label, color: colors.textMuted, marginBottom: spacing.sm },
  noTarget: { ...type.body, color: colors.textMuted, marginBottom: spacing.lg, fontStyle: "italic" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.lg, gap: spacing.lg },
  statItem: { minWidth: 90 },
  statValue: { ...type.title, fontSize: 24, color: colors.text },
  statValueOver: { color: colors.error },
  statTarget: { ...type.small, color: colors.textMuted },
  statLabel: { ...type.small, color: colors.textMuted, marginTop: 2 },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  primaryButtonText: { color: colors.surface, ...type.label, fontSize: 16 },
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
