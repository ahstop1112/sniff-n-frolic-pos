/**
 * Shared category color palette for reports.
 * Assigned by rank (categories sorted by revenue descending).
 * Rank 0 = palette[0], Rank 1 = palette[1], etc.
 */
export const CATEGORY_PALETTE = [
  "#D4603C", // 1  orange-red (primary)
  "#1F4E5F", // 2  deep teal
  "#5B9BB0", // 3  mid blue
  "#E8A491", // 4  pale coral
  "#A8543A", // 5  deep ochre
  "#7FB3A3", // 6  sage
  "#E5C07B", // 7  warm sand
  "#3D6B7A", // 8  slate blue
] as const;

/**
 * Fallback color for 9th+ categories and uncategorised items.
 */
export const CATEGORY_FALLBACK = "#C4CDD1";

/**
 * Get the color for a category by rank (0-indexed).
 * Rank 0-7 = CATEGORY_PALETTE[rank]
 * Rank 8+ or uncategorised = CATEGORY_FALLBACK grey
 */
export const getCategoryColor = (rank: number): string => {
  if (rank < 0 || rank >= CATEGORY_PALETTE.length) {
    return CATEGORY_FALLBACK;
  }
  return CATEGORY_PALETTE[rank];
};

/**
 * Assign colours to categories based on revenue rank.
 * Returns array of { category, rank, color } in same order as input.
 */
export const assignCategoryColors = <T extends { category: string; revenue: number }>(
  data: T[],
): Array<T & { rank: number; color: string }> => {
  // Sort by revenue descending to assign ranks
  const ranked = [...data]
    .sort((a, b) => b.revenue - a.revenue)
    .map((item, idx) => ({ ...item, rank: idx, category: item.category || "Uncategorized" }));

  // Map back to original order with rank and color
  const rankMap = new Map(ranked.map((item, idx) => [item.category, idx]));

  return data.map((item) => {
    const rank = rankMap.get(item.category || "Uncategorized") ?? CATEGORY_PALETTE.length;
    return {
      ...item,
      category: item.category || "Uncategorized",
      rank,
      color: getCategoryColor(rank),
    };
  });
};

// Series colors for time-series charts (not category colors)
export const SERIES_COLORS = {
  current: "#D4603C", // current period line
  prior: "#9AA5AB", // prior period dashed line
} as const;

// UI element colors
export const REPORT_COLORS = {
  headerBackground: "#F7F8F9",
  headerText: "#6B7280",
  trackBackground: "#E8ECEE",
  rowBorder: "#F0F2F4",
  rowBackground: "#FFFFFF",
  textPrimary: "#1F2937",
  textMuted: "#6B7280",
} as const;
