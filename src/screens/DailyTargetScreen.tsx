import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { getDailyTarget, setDailyTarget } from "../api/dailyTarget";
import { colors, spacing, type } from "../theme";

export default function DailyTargetScreen({ navigation }: any) {
  const { token } = useAuth();

  const [protein, setProtein] = useState("");
  const [carb, setCarb] = useState("");
  const [fat, setFat] = useState("");
  const [cal, setCal] = useState("");

  const [isEditing, setIsEditing] = useState(false); // true if a target already existed
  const [loading, setLoading] = useState(true); // initial fetch
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const existing = await getDailyTarget(token);
        if (existing) {
          setIsEditing(true);
          setProtein(String(existing.protein));
          setCarb(String(existing.carb));
          setFat(String(existing.fat));
          setCal(String(existing.cal));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't load your current target.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  async function handleSubmit() {
    if (!token) return;
    setError(null);

    const parsed = {
      protein: parseFloat(protein),
      carb: parseFloat(carb),
      fat: parseFloat(fat),
      cal: parseFloat(cal),
    };

    if (Object.values(parsed).some((v) => Number.isNaN(v) || v < 0)) {
      setError("Enter a valid non-negative number for each field.");
      return;
    }

    setSubmitting(true);
    try {
      await setDailyTarget(token, parsed);
      navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save your target.");
    } finally {
      setSubmitting(false);
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{isEditing ? "Update your target" : "Set your daily target"}</Text>
        <Text style={styles.subtitle}>
          This persists until you change it - you won't need to re-enter it daily.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Protein (g)</Text>
          <TextInput
            style={styles.input}
            value={protein}
            onChangeText={setProtein}
            keyboardType="numeric"
            placeholder="150"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Carbs (g)</Text>
          <TextInput
            style={styles.input}
            value={carb}
            onChangeText={setCarb}
            keyboardType="numeric"
            placeholder="200"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Fat (g)</Text>
          <TextInput
            style={styles.input}
            value={fat}
            onChangeText={setFat}
            keyboardType="numeric"
            placeholder="60"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Calories</Text>
          <TextInput
            style={styles.input}
            value={cal}
            onChangeText={setCal}
            keyboardType="numeric"
            placeholder="2000"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.buttonText}>{isEditing ? "Save changes" : "Set target"}</Text>
          )}
        </Pressable>

        <Pressable onPress={() => navigation.goBack()} style={styles.linkWrap}>
          <Text style={styles.link}>Cancel</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: spacing.lg },
  title: { ...type.title, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...type.body, color: colors.textMuted, marginBottom: spacing.xl, fontSize: 14 },
  field: { marginBottom: spacing.md },
  label: { ...type.label, color: colors.text, marginBottom: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  error: { color: colors.error, ...type.small, marginBottom: spacing.md },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonPressed: { backgroundColor: colors.primaryPressed },
  buttonText: { color: colors.surface, ...type.label, fontSize: 16 },
  linkWrap: { marginTop: spacing.lg, alignItems: "center" },
  link: { color: colors.primary, ...type.small },
});
