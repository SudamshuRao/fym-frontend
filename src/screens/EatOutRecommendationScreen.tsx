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
  FlatList,
} from "react-native";
import * as Location from "expo-location";
import { useAuth } from "../context/AuthContext";
import { getEatOutRecommendations, acceptEatOutRecommendation } from "../api/eatOut";
import { RecommendedItem } from "../api/types";
import { colors, spacing, type } from "../theme";

export default function EatOutRecommendationScreen() {
  const { token } = useAuth();

  const [protein, setProtein] = useState("");
  const [carb, setCarb] = useState("");
  const [fat, setFat] = useState("");
  const [cal, setCal] = useState("");
  const [radiusKm, setRadiusKm] = useState("5");

  const [useLocation, setUseLocation] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  const [results, setResults] = useState<RecommendedItem[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [acceptError, setAcceptError] = useState<string | null>(null);

  async function handleToggleLocation() {
    if (useLocation) {
      // Turning it off - just clear state, no need to touch permissions.
      setUseLocation(false);
      setCoords(null);
      setLocationStatus(null);
      return;
    }

    setLocationStatus("Requesting permission...");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationStatus("Location permission denied - searching all restaurants instead.");
        return;
      }
      setLocationStatus("Getting your location...");
      const position = await Location.getCurrentPositionAsync({});
      setCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
      setUseLocation(true);
      setLocationStatus(null);
    } catch (e) {
      setLocationStatus("Couldn't get your location - searching all restaurants instead.");
    }
  }

  async function handleSearch() {
    if (!token) return;
    setSearchError(null);
    setResults(null);
    setAcceptedIds(new Set());

    const parsed = {
      protein: parseFloat(protein),
      carb: parseFloat(carb),
      fat: parseFloat(fat),
      cal: parseFloat(cal),
    };
    if (Object.values(parsed).some((v) => Number.isNaN(v) || v < 0)) {
      setSearchError("Enter a valid non-negative number for each macro.");
      return;
    }

    const radiusParsed = parseFloat(radiusKm);
    if (useLocation && (Number.isNaN(radiusParsed) || radiusParsed <= 0)) {
      setSearchError("Enter a valid radius greater than 0.");
      return;
    }

    setSearching(true);
    try {
      const items = await getEatOutRecommendations(token, {
        ...parsed,
        limit: 10,
        ...(useLocation && coords
          ? { lat: coords.lat, lon: coords.lon, radius_km: radiusParsed }
          : {}),
      });
      setResults(items);
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : "Couldn't search for restaurants.");
    } finally {
      setSearching(false);
    }
  }

  async function handleAccept(item: RecommendedItem) {
    if (!token) return;
    setAcceptError(null);
    setAcceptingId(item.restaurant_nutrition_id);
    try {
      await acceptEatOutRecommendation(token, item.restaurant_nutrition_id);
      setAcceptedIds((prev) => new Set(prev).add(item.restaurant_nutrition_id));
    } catch (e) {
      setAcceptError(e instanceof Error ? e.message : "Couldn't log this item.");
    } finally {
      setAcceptingId(null);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={results ?? []}
        keyExtractor={(item) => item.restaurant_nutrition_id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Eat out</Text>
            <Text style={styles.subtitle}>Enter a macro budget to find restaurant options that fit.</Text>

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
                placeholder="70"
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
                placeholder="490"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <Pressable
              style={({ pressed }) => [styles.locationToggle, pressed && styles.buttonPressed]}
              onPress={handleToggleLocation}
            >
              <Text style={styles.locationToggleText}>
                {useLocation ? "📍 Using your location (tap to turn off)" : "📍 Use my location"}
              </Text>
            </Pressable>
            {locationStatus ? <Text style={styles.locationStatus}>{locationStatus}</Text> : null}

            {useLocation && (
              <View style={styles.field}>
                <Text style={styles.label}>Radius (km)</Text>
                <TextInput
                  style={styles.input}
                  value={radiusKm}
                  onChangeText={setRadiusKm}
                  keyboardType="numeric"
                  placeholder="5"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            )}

            {searchError ? <Text style={styles.error}>{searchError}</Text> : null}
            {acceptError ? <Text style={styles.error}>{acceptError}</Text> : null}

            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={handleSearch}
              disabled={searching}
            >
              {searching ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.buttonText}>Find restaurants</Text>
              )}
            </Pressable>

            {results && results.length === 0 && (
              <Text style={styles.empty}>
                No matching restaurants found{useLocation ? " nearby" : ""}. Try a different budget or a
                larger radius.
              </Text>
            )}

            {results && results.length > 0 && <View style={styles.divider} />}
          </View>
        }
        renderItem={({ item }) => {
          const isAccepted = acceptedIds.has(item.restaurant_nutrition_id);
          return (
            <View style={styles.resultCard}>
              <Text style={styles.resultRestaurant}>{item.restaurant_name}</Text>
              <Text style={styles.resultItem}>{item.menu_item}</Text>
              <Text style={styles.resultMacros}>
                {item.protein}P · {item.carb}C · {item.fat}F · {item.cal}cal
              </Text>
              {item.distance_km !== null && (
                <Text style={styles.resultDistance}>{item.distance_km} km away</Text>
              )}

              {isAccepted ? (
                <Text style={styles.acceptedLabel}>Logged</Text>
              ) : (
                <Pressable
                  style={({ pressed }) => [styles.acceptButton, pressed && styles.buttonPressed]}
                  onPress={() => handleAccept(item)}
                  disabled={acceptingId === item.restaurant_nutrition_id}
                >
                  {acceptingId === item.restaurant_nutrition_id ? (
                    <ActivityIndicator color={colors.primary} size="small" />
                  ) : (
                    <Text style={styles.acceptButtonText}>Log this</Text>
                  )}
                </Pressable>
              )}
            </View>
          );
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.lg },
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
  locationToggle: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
  },
  locationToggleText: { ...type.small, color: colors.text },
  locationStatus: { ...type.small, color: colors.textMuted, marginBottom: spacing.md, fontStyle: "italic" },
  error: { color: colors.error, ...type.small, marginBottom: spacing.md },
  empty: { ...type.body, color: colors.textMuted, fontStyle: "italic", textAlign: "center", marginTop: spacing.lg },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonPressed: { backgroundColor: colors.primaryPressed },
  buttonText: { color: colors.surface, ...type.label, fontSize: 16 },
  divider: { height: 1, backgroundColor: colors.border, marginTop: spacing.lg, marginBottom: spacing.md },
  resultCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  resultRestaurant: { ...type.label, fontSize: 16, color: colors.text },
  resultItem: { ...type.body, fontSize: 14, color: colors.text, marginBottom: 2 },
  resultMacros: { ...type.small, color: colors.textMuted, marginBottom: 2 },
  resultDistance: { ...type.small, color: colors.accent, marginBottom: spacing.sm },
  acceptButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingVertical: spacing.xs,
    alignItems: "center",
    marginTop: spacing.xs,
  },
  acceptButtonText: { color: colors.primary, ...type.small, fontWeight: "600" },
  acceptedLabel: { ...type.small, color: colors.primary, fontStyle: "italic", marginTop: spacing.xs },
});
