/**
 * Shared color palette for reports — used by both Revenue Table and Share of Revenue donut.
 * Ordered by rank (1st through 5th+) for consistent ordering across all components.
 */
export const REPORT_PALETTE = [
  "#D4603C", // 1st: orange-red
  "#1F4E5F", // 2nd: deep teal
  "#5B9BB0", // 3rd: mid blue
  "#E8A491", // 4th: pale coral
  "#C4CDD1", // 5th+: grey (default for unranked)
] as const;

/**
 * Get the color for a category by rank (0-indexed).
 * Rank 0 = 1st = #D4603C, Rank 1 = 2nd = #1F4E5F, etc.
 * If rank >= 5, returns the 5th+ grey color.
 */
export const getCategoryColor = (rank: number): string => {
  if (rank < 0 || rank >= REPORT_PALETTE.length) {
    return REPORT_PALETTE[REPORT_PALETTE.length - 1];
  }
  return REPORT_PALETTE[rank];
};

// Color constants for UI elements
export const REPORT_COLORS = {
  headerBackground: "#F7F8F9",
  headerText: "#6B7280",
  trackBackground: "#E8ECEE",
  rowBorder: "#F0F2F4",
  rowBackground: "#FFFFFF",
  textPrimary: "#1F2937",
  textMuted: "#6B7280",
} as const;
