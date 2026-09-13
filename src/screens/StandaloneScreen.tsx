import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { calculateStandaloneBudget, addStandaloneToDaily } from "../api/standalone";
import { SplitMode, StandaloneBudgetOut } from "../api/types";
import { colors, spacing, type } from "../theme";

const SPLIT_MODES: { value: SplitMode; label: string }[] = [
  { value: "full", label: "Full" },
  { value: "partial", label: "Partial %" },
  { value: "meals", label: "N meals" },
];

export default function StandaloneScreen() {
  const { token } = useAuth();

  const [protein, setProtein] = useState("");
  const [carb, setCarb] = useState("");
  const [fat, setFat] = useState("");
  const [cal, setCal] = useState("");
  const [splitMode, setSplitMode] = useState<SplitMode>("full");
  const [splitValue, setSplitValue] = useState("");

  const [result, setResult] = useState<StandaloneBudgetOut | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  const [entryName, setEntryName] = useState("");
  const [logging, setLogging] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const [logMessage, setLogMessage] = useState<string | null>(null);

  async function handleCalculate() {
    if (!token) return;
    setCalcError(null);
    setResult(null);
    setLogMessage(null);

    const parsed = {
      protein: parseFloat(protein),
      carb: parseFloat(carb),
      fat: parseFloat(fat),
      cal: parseFloat(cal),
    };
    if (Object.values(parsed).some((v) => Number.isNaN(v) || v < 0)) {
      setCalcError("Enter a valid non-negative number for each macro.");
      return;
    }

    let parsedSplitValue: number | undefined;
    if (splitMode !== "full") {
      parsedSplitValue = parseFloat(splitValue);
      if (Number.isNaN(parsedSplitValue) || parsedSplitValue <= 0) {
        setCalcError(splitMode === "partial" ? "Enter a percentage between 0 and 100." : "Enter a meal count greater than 0.");
        return;
      }
    }

    setCalculating(true);
    try {
      const output = await calculateStandaloneBudget(token, {
        ...parsed,
        split_mode: splitMode,
        split_value: parsedSplitValue,
      });
      setResult(output);
    } catch (e) {
      setCalcError(e instanceof Error ? e.message : "Couldn't calculate this budget.");
    } finally {
      setCalculating(false);
    }
  }

  async function handleAddToDaily() {
    if (!token || !result) return;
    setLogError(null);
    setLogMessage(null);

    if (!entryName.trim()) {
      setLogError("Give this entry a name first.");
      return;
    }

    setLogging(true);
    try {
      const output = await addStandaloneToDaily(token, { name: entryName.trim(), ...result });
      setLogMessage(output.message);
    } catch (e) {
      setLogError(e instanceof Error ? e.message : "Couldn't log this entry.");
    } finally {
      setLogging(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Quick calculator</Text>
        <Text style={styles.subtitle}>
          Type in a macro budget for a one-off meal - nothing is saved until you choose to log it.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Protein (g)</Text>
          <TextInput
            style={styles.input}
            value={protein}
            onChangeText={setProtein}
            keyboardType="numeric"
            placeholder="0"
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
            placeholder="0"
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
            placeholder="0"
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
            placeholder="0"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <Text style={styles.label}>Split</Text>
        <View style={styles.segmentRow}>
          {SPLIT_MODES.map((mode) => (
            <Pressable
              key={mode.value}
              style={[styles.segment, splitMode === mode.value && styles.segmentActive]}
              onPress={() => setSplitMode(mode.value)}
            >
              <Text style={[styles.segmentText, splitMode === mode.value && styles.segmentTextActive]}>
                {mode.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {splitMode !== "full" && (
          <View style={styles.field}>
            <Text style={styles.label}>{splitMode === "partial" ? "Percentage (0-100)" : "Number of meals"}</Text>
            <TextInput
              style={styles.input}
              value={splitValue}
              onChangeText={setSplitValue}
              keyboardType="numeric"
              placeholder={splitMode === "partial" ? "50" : "3"}
              placeholderTextColor={colors.textMuted}
            />
          </View>
        )}

        {calcError ? <Text style={styles.error}>{calcError}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handleCalculate}
          disabled={calculating}
        >
          {calculating ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.buttonText}>Calculate</Text>
          )}
        </Pressable>

        {result && (
          <View style={styles.resultSection}>
            <View style={styles.divider} />
            <Text style={styles.label}>Result</Text>
            <View style={styles.resultGrid}>
              <View style={styles.resultItem}>
                <Text style={styles.resultValue}>{result.protein}g</Text>
                <Text style={styles.resultLabel}>Protein</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultValue}>{result.carb}g</Text>
                <Text style={styles.resultLabel}>Carbs</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultValue}>{result.fat}g</Text>
                <Text style={styles.resultLabel}>Fat</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultValue}>{result.cal}</Text>
                <Text style={styles.resultLabel}>Calories</Text>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Name (to log this)</Text>
              <TextInput
                style={styles.input}
                value={entryName}
                onChangeText={setEntryName}
                placeholder="Protein bar"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            {logError ? <Text style={styles.error}>{logError}</Text> : null}
            {logMessage ? <Text style={styles.successMessage}>{logMessage}</Text> : null}

            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
              onPress={handleAddToDaily}
              disabled={logging}
            >
              {logging ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={styles.secondaryButtonText}>Add to daily log</Text>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
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
  segmentRow: { flexDirection: "row", marginBottom: spacing.md, gap: spacing.sm },
  segment: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  segmentActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  segmentText: { ...type.small, color: colors.text, fontWeight: "600" },
  segmentTextActive: { color: colors.surface },
  error: { color: colors.error, ...type.small, marginBottom: spacing.md },
  successMessage: { color: colors.primary, ...type.small, marginBottom: spacing.md },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  buttonPressed: { backgroundColor: colors.primaryPressed },
  buttonText: { color: colors.surface, ...type.label, fontSize: 16 },
  resultSection: { marginTop: spacing.lg },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: spacing.lg },
  resultGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.lg, gap: spacing.lg },
  resultItem: { minWidth: 80 },
  resultValue: { ...type.title, fontSize: 22, color: colors.text },
  resultLabel: { ...type.small, color: colors.textMuted },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  secondaryButtonText: { color: colors.primary, ...type.label, fontSize: 16 },
});
