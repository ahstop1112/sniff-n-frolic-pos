// Checkout domain types
// Migrated from screens/sales/CartPanel/types.ts

export type Currency = "CAD" | "HKD" | "USD"

export interface OrderLine {
  id: string
  productId: string
  name: string
  unitPrice: number
  qty: number
  taxRate: number        // e.g. 0.05 for 5%
  discountAmount: number
}

export interface Order {
  id: string
  label: string
  lines: OrderLine[]
  status: OrderStatus
  createdAt: string
  memberId?: string      // links to member domain
  staffId?: string       // links to staff domain
  note?: string
}

export type OrderStatus =
  | "open"
  | "pending_payment"
  | "completed"
  | "cancelled"
  | "refunded"

export interface Payment {
  id: string
  orderId: string
  method: PaymentMethod
  amount: number
  currency: Currency
  paidAt: string
  reference?: string
}

export type PaymentMethod =
  | "cash"
  | "credit"
  | "debit"
  | "gift_card"
  | "store_credit"

export interface OrderSummary {
  subtotal: number
  taxTotal: number
  discountTotal: number
  total: number
  balanceDue: number
  change: number
}
