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
import { createPantryItem, updatePantryItem } from "../api/pantry";
import { PantryItemOut } from "../api/types";
import { colors, spacing, type } from "../theme";

export default function PantryFormScreen({ navigation, route }: any) {
  const { token } = useAuth();
  const existing: PantryItemOut | undefined = route.params?.item;
  const isEditing = !!existing;

  const [name, setName] = useState(existing?.name ?? "");
  const [quantity, setQuantity] = useState(existing?.quantity != null ? String(existing.quantity) : "");
  const [unit, setUnit] = useState(existing?.unit ?? "");
  const [protein, setProtein] = useState(existing?.protein != null ? String(existing.protein) : "");
  const [carb, setCarb] = useState(existing?.carb != null ? String(existing.carb) : "");
  const [fat, setFat] = useState(existing?.fat != null ? String(existing.fat) : "");
  const [cal, setCal] = useState(existing?.cal != null ? String(existing.cal) : "");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optional numeric fields - undefined if left blank, so a blank field
  // doesn't overwrite existing data with 0 on an edit. NaN (invalid
  // input) is only rejected if the field wasn't left blank.
  function parseOptionalNumber(value: string): number | undefined {
    if (value.trim() === "") return undefined;
    return parseFloat(value);
  }

  async function handleSubmit() {
    if (!token) return;
    setError(null);

    if (!name.trim()) {
      setError("Give this item a name.");
      return;
    }

    const numericFields = {
      quantity: parseOptionalNumber(quantity),
      protein: parseOptionalNumber(protein),
      carb: parseOptionalNumber(carb),
      fat: parseOptionalNumber(fat),
      cal: parseOptionalNumber(cal),
    };

    const invalidField = Object.entries(numericFields).find(
      ([, value]) => value !== undefined && Number.isNaN(value)
    );
    if (invalidField) {
      setError(`"${invalidField[0]}" isn't a valid number.`);
      return;
    }

    setSubmitting(true);
    try {
      const input = {
        name: name.trim(),
        unit: unit.trim() || undefined,
        ...numericFields,
      };
      if (isEditing) {
        await updatePantryItem(token, existing!.id, input);
      } else {
        await createPantryItem(token, input);
      }
      navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save this item.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{isEditing ? "Edit item" : "Add pantry item"}</Text>
        <Text style={styles.subtitle}>
          Macro fields are optional - leave any blank if you don't know them yet.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Chicken breast"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.flexTwo]}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="300"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={[styles.field, styles.flexOne]}>
            <Text style={styles.label}>Unit</Text>
            <TextInput
              style={styles.input}
              value={unit}
              onChangeText={setUnit}
              placeholder="g"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Protein (g)</Text>
          <TextInput
            style={styles.input}
            value={protein}
            onChangeText={setProtein}
            keyboardType="numeric"
            placeholder="Optional"
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
            placeholder="Optional"
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
            placeholder="Optional"
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
            placeholder="Optional"
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
            <Text style={styles.buttonText}>{isEditing ? "Save changes" : "Add to pantry"}</Text>
          )}
        </Pressable>

        <Pressable onPress={() => navigation.goBack()} style={styles.linkWrap}>
          <Text style={styles.link}>Cancel</Text>
        </Pressable>
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
  row: { flexDirection: "row", gap: spacing.md },
  flexOne: { flex: 1 },
  flexTwo: { flex: 2 },
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
