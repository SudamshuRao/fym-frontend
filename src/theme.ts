/**
 * Design tokens for FYM. A personal, daily-use nutrition tracker calls
 * for something calm and functional rather than flashy - deep forest
 * green (health, produce) and a warm ochre accent (grain/protein),
 * rather than the neon greens typical of fitness apps or the
 * cream-and-terracotta combination that reads as generic AI-generated
 * design.
 */

export const colors = {
  background: "#FAF7F2",
  surface: "#FFFFFF",
  primary: "#2F5233", // deep forest green - primary actions
  primaryPressed: "#243F28",
  accent: "#C97B2E", // warm ochre - used sparingly, for emphasis only
  text: "#22201B",
  textMuted: "#6B665C",
  border: "#DED6C7",
  error: "#A63A3A",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
};

export const type = {
  title: { fontSize: 28, fontWeight: "700" as const, letterSpacing: -0.3 },
  body: { fontSize: 16, fontWeight: "400" as const },
  label: { fontSize: 14, fontWeight: "500" as const },
  small: { fontSize: 13, fontWeight: "400" as const },
};
