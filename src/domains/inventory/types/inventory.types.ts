// Types mirror the sniff-n-frolic-api inventory contract verbatim.
// Field names are snake_case to match the API's DB-row responses (matching /products).

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
  product_type: string
  stock_quantity: number
  manage_stock: boolean
  stock_status: string | null
  is_low_stock: boolean
  parent_id: string | null
  parent_name: string | null
}

export interface StockListResponse {
  items: StockItem[]
  total: number
  limit: number
  offset: number
}

export interface Movement {
  id: string
  product_id: string
  product_name: string
  product_sku: string | null
  branch_id: string | null
  branch_name: string | null
  quantity_change: number
  reason: MovementReason
  reference_id: string | null
  note: string | null
  created_by: string | null
  created_by_name: string | null
  created_at: string
}

export interface MovementListResponse {
  items: Movement[]
  total: number
  limit: number
  offset: number
}

// createMovement returns the persisted movement plus the resulting stock total,
// so the UI can render the new number without a follow-up fetch.
export interface CreateMovementResponse {
  movement: Movement
  stock_quantity: number
  stock_status: string | null
}

export interface GetStockParams {
  search?: string
  low_stock_only?: boolean
  low_stock_threshold?: number
  branch_id?: string | null
  limit?: number
  offset?: number
}

export interface GetMovementsParams {
  product_id?: string
  branch_id?: string | null
  reason?: MovementReason
  date_from?: string
  date_to?: string
  limit?: number
  offset?: number
}

export interface CreateMovementBody {
  product_id: string
  branch_id?: string | null
  quantity_change: number
  reason: MovementReason
  reference_id?: string
  note?: string
}
