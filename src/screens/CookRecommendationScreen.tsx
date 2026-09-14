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
import { getCookRecommendation, acceptCookRecommendation } from "../api/cook";
import { CookRecommendationOut } from "../api/types";
import { colors, spacing, type } from "../theme";

export default function CookRecommendationScreen({ navigation }: any) {
  const { token } = useAuth();

  const [protein, setProtein] = useState("");
  const [carb, setCarb] = useState("");
  const [fat, setFat] = useState("");
  const [cal, setCal] = useState("");

  const [recipe, setRecipe] = useState<CookRecommendationOut | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [acceptedMessage, setAcceptedMessage] = useState<string | null>(null);

  async function handleGenerate() {
    if (!token) return;
    setGenError(null);
    setRecipe(null);
    setAcceptedMessage(null);

    const parsed = {
      protein: parseFloat(protein),
      carb: parseFloat(carb),
      fat: parseFloat(fat),
      cal: parseFloat(cal),
    };
    if (Object.values(parsed).some((v) => Number.isNaN(v) || v < 0)) {
      setGenError("Enter a valid non-negative number for each macro.");
      return;
    }

    setGenerating(true);
    try {
      const result = await getCookRecommendation(token, parsed);
      setRecipe(result);
    } catch (e) {
      // The backend's own error messages are already specific and
      // actionable (e.g. "Your pantry is empty" or "Is Ollama running?")
      // - shown directly, no need to reword them.
      setGenError(e instanceof Error ? e.message : "Couldn't generate a recipe.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleAccept() {
    if (!token || !recipe) return;
    setAcceptError(null);
    setAccepting(true);
    try {
      await acceptCookRecommendation(
        token,
        recipe.recipe_name,
        recipe.ingredients_used.map((i) => ({
          pantry_item_id: i.pantry_item_id,
          quantity_used: i.quantity_used,
        }))
      );
      setAcceptedMessage("Logged, and the ingredients were deducted from your pantry.");
    } catch (e) {
      setAcceptError(e instanceof Error ? e.message : "Couldn't log this recipe.");
    } finally {
      setAccepting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>What should I cook?</Text>
        <Text style={styles.subtitle}>Enter a macro budget - a recipe will be built from your pantry.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Protein (g)</Text>
          <TextInput
            style={styles.input}
            value={protein}
            onChangeText={setProtein}
            keyboardType="numeric"
            placeholder="30"
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
            placeholder="40"
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
            placeholder="10"
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
            placeholder="350"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {genError ? <Text style={styles.error}>{genError}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.buttonText}>Generate recipe</Text>
          )}
        </Pressable>

        {generating && (
          <Text style={styles.generatingNote}>
            This calls a local AI model and can take up to 30 seconds - hang tight.
          </Text>
        )}

        {recipe && (
          <View style={styles.recipeSection}>
            <View style={styles.divider} />
            <Text style={styles.recipeName}>{recipe.recipe_name}</Text>

            <View style={styles.resultGrid}>
              <View style={styles.resultItem}>
                <Text style={styles.resultValue}>{recipe.protein}g</Text>
                <Text style={styles.resultLabel}>Protein</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultValue}>{recipe.carb}g</Text>
                <Text style={styles.resultLabel}>Carbs</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultValue}>{recipe.fat}g</Text>
                <Text style={styles.resultLabel}>Fat</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultValue}>{recipe.cal}</Text>
                <Text style={styles.resultLabel}>Calories</Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>Ingredients</Text>
            {recipe.ingredients_used.map((ingredient) => (
              <Text key={ingredient.pantry_item_id} style={styles.ingredientLine}>
                • {ingredient.quantity_used}
                {ingredient.unit} {ingredient.name}
              </Text>
            ))}

            <Text style={styles.sectionLabel}>Steps</Text>
            {recipe.steps.map((step, index) => (
              <Text key={index} style={styles.stepLine}>
                {index + 1}. {step}
              </Text>
            ))}

            {acceptError ? <Text style={styles.error}>{acceptError}</Text> : null}
            {acceptedMessage ? <Text style={styles.successMessage}>{acceptedMessage}</Text> : null}

            {!acceptedMessage && (
              <Pressable
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
                onPress={handleAccept}
                disabled={accepting}
              >
                {accepting ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text style={styles.secondaryButtonText}>Log this recipe</Text>
                )}
              </Pressable>
            )}
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
  generatingNote: { ...type.small, color: colors.textMuted, textAlign: "center", marginTop: spacing.sm, fontStyle: "italic" },
  recipeSection: { marginTop: spacing.lg },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: spacing.lg },
  recipeName: { ...type.title, fontSize: 22, color: colors.text, marginBottom: spacing.md },
  resultGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.lg, gap: spacing.lg },
  resultItem: { minWidth: 80 },
  resultValue: { ...type.title, fontSize: 20, color: colors.text },
  resultLabel: { ...type.small, color: colors.textMuted },
  sectionLabel: { ...type.label, color: colors.text, marginTop: spacing.md, marginBottom: spacing.xs },
  ingredientLine: { ...type.body, fontSize: 14, color: colors.text, marginBottom: 2 },
  stepLine: { ...type.body, fontSize: 14, color: colors.text, marginBottom: spacing.xs, lineHeight: 20 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.md,
  },
  secondaryButtonText: { color: colors.primary, ...type.label, fontSize: 16 },
});
