/**
 * High-contrast, WCAG AA compliant color tokens for the mobile voting client.
 * All body and caption text combinations exceed the 4.5:1 minimum contrast requirement.
 */
export const colors = {
  // Brand & Primary
  primary: "#00624A", // Deep Pine Green (contrast > 7.5:1 on white)
  primaryDark: "#004B38",
  primaryLight: "#E6F4F0",
  primaryBorder: "#00624A",

  // Layout & Surfaces
  background: "#F8FAFC", // Slate 50 neutral backdrop
  surface: "#FFFFFF", // Card & element surface
  surfaceSubtle: "#F1F5F9", // Slate 100 subtle background
  surfaceElevated: "#FFFFFF",

  // Borders & Dividers
  border: "#E2E8F0", // Slate 200
  borderStrong: "#CBD5E1", // Slate 300
  borderFocus: "#00624A",

  // Typography
  text: "#0F172A", // Alias for textPrimary
  textPrimary: "#0F172A", // Slate 900 (contrast > 15:1 on white)
  textSecondary: "#334155", // Slate 700 (contrast > 8:1 on white)
  textMuted: "#475569", // Slate 600 (contrast > 5.5:1 on white, WCAG AA compliant)
  textInverse: "#FFFFFF",

  // Danger alias
  danger: "#DC2626", // Red 600
  surfaceDanger: "#FEF2F2", // Red 50
  borderDanger: "#FECACA", // Red 200

  // Status & Feedback Tokens (Color + Semantic Meaning)
  success: {
    text: "#065F46", // Emerald 800 (contrast > 6.5:1 on light bg)
    background: "#ECFDF5", // Emerald 50
    border: "#A7F3D0", // Emerald 200
    indicator: "#059669",
  },
  warning: {
    text: "#92400E", // Amber 800 (contrast > 5.2:1, fixes web 2.5:1 defect)
    background: "#FFFBEB", // Amber 50
    border: "#FDE68A", // Amber 200
    indicator: "#D97706",
  },
  error: {
    text: "#991B1B", // Red 800 (contrast > 7:1)
    background: "#FEF2F2", // Red 50
    border: "#FECACA", // Red 200
    indicator: "#DC2626",
  },
  info: {
    text: "#1E40AF", // Blue 800 (contrast > 7:1)
    background: "#EFF6FF", // Blue 50
    border: "#BFDBFE", // Blue 200
    indicator: "#2563EB",
  },
  neutral: {
    text: "#334155", // Slate 700
    background: "#F1F5F9", // Slate 100
    border: "#CBD5E1", // Slate 300
    indicator: "#64748B",
  },

  // Interactive States
  interactive: {
    active: "#00624A",
    hover: "#004B38",
    selectedBg: "#F0FDF4",
    selectedBorder: "#00624A",
    disabledBg: "#E2E8F0",
    disabledText: "#94A3B8",
  },
};
