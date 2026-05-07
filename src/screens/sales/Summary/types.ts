export interface SummaryLineItem {
  name: string
  qty: number
  total: number    // cents
}

export interface SummaryOrder {
  id: string
  label: string
  createdAt: string
  total: number    // cents
  itemCount: number
  items: SummaryLineItem[]
}

export interface DailySummary {
  totalRevenue: number   // cents
  orderCount: number
  itemCount: number
  orders: SummaryOrder[]
}