import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { colors, spacing, type } from "../theme";

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>Logged in as</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Day starts at</Text>
        <Text style={styles.value}>{user?.day_start_time}</Text>

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
  label: { ...type.label, color: colors.textMuted, marginBottom: spacing.xs },
  value: { ...type.body, color: colors.text, marginBottom: spacing.xl },
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
