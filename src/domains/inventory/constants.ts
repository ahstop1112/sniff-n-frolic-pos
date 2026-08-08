import type { MovementReason } from "./types/inventory.types"

export const REASON_LABELS: Record<MovementReason, string> = {
  sale: "Sale",
  restock: "Restock",
  adjustment: "Adjustment",
  return: "Return",
  damage: "Damage",
}

// Sale is deliberately excluded from manual entry — sales come from checkout.
export const MANUAL_REASONS: MovementReason[] = ["restock", "adjustment", "return", "damage"]

// Reasons whose quantityChange is always positive; the rest map to negative
// (except adjustment, which asks the user to pick a direction).
export const POSITIVE_REASONS: MovementReason[] = ["restock", "return"]
export const NEGATIVE_REASONS: MovementReason[] = ["damage", "sale"]
