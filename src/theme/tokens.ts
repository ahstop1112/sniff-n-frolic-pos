// Design tokens extracted from the POS wireframe (2026-08).
// Palette is warm coral (primary action) on deep teal-navy (brand surface),
// against a cream neutral. Keep hex values here so the MUI theme and any raw
// SCSS/inline usage share a single source of truth.

export const brand = {
  // Deep teal-navy — used for the left sign-in panel and any dark surfaces
  navy: "#20404E",
  navyDark: "#152B36",
  navySoft: "#3A5966",

  // Warm coral — primary CTA and the brand-mark chip
  coral: "#D97757",
  coralDark: "#B85E40",
  coralSoft: "#EEB39C",

  // Neutrals
  cream: "#F5F1EB",     // warm off-white background
  paper: "#FFFFFF",
  ink: "#1A2332",       // near-black text
  inkMuted: "#6B7280",
  inkFaint: "#94A3B8",
  border: "#E5E7EB",
  borderSoft: "#EEF0F3",
} as const

export const radii = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
} as const

export const shadows = {
  card: "0 12px 40px -12px rgba(15, 34, 45, 0.18), 0 2px 6px -2px rgba(15, 34, 45, 0.08)",
  chip: "0 4px 12px -4px rgba(217, 119, 87, 0.35)",
} as const
