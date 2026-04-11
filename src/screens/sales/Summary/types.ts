export interface DailySummary {
  totalRevenue: number    // cents
  orderCount: number
  itemCount: number
  topItems: SummaryLineItem[]
}

export interface SummaryLineItem {
  name: string
  qty: number
  total: number           // cents
}