// Types mirror the sniff-n-frolic-api inventory contract (see inventory-api-spec-en.md).
// Field names follow the API spec verbatim (camelCase). If the API ships with snake_case
// keys to match the existing products endpoints, adjust here.

export type MovementReason =
  | "sale"
  | "restock"
  | "adjustment"
  | "return"
  | "damage"

export interface StockItem {
  id: string
  name: string
  sku: string | null
  stockQuantity: number
  manageStock: boolean
  isLowStock: boolean
  parentId: string | null
  parentName: string | null
}

export interface StockListResponse {
  items: StockItem[]
  total: number
}

export interface Movement {
  id: string
  productId: string
  productName: string
  sku: string | null
  branchId: string | null
  quantityChange: number
  reason: MovementReason
  referenceId: string | null
  note: string | null
  createdById: string | null
  createdByName: string | null
  createdAt: string
}

export interface MovementListResponse {
  items: Movement[]
  total: number
}

// createMovement returns the persisted movement plus the resulting stock total,
// so the UI can render the new number without a follow-up fetch (see spec §Adjust Stock).
export interface CreateMovementResponse extends Movement {
  stockQuantity: number
}

export interface GetStockParams {
  search?: string
  lowStockOnly?: boolean
  lowStockThreshold?: number
  branchId?: string | null
  limit?: number
  offset?: number
}

export interface GetMovementsParams {
  productId?: string
  branchId?: string | null
  reason?: MovementReason
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}

export interface CreateMovementBody {
  productId: string
  branchId?: string | null
  quantityChange: number
  reason: MovementReason
  referenceId?: string
  note?: string
}
