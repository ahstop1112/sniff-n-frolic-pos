import { useQuery } from "@tanstack/react-query"
import type { DailySummary } from "../Summary/types"

// Mock data — remove when real API is ready
const MOCK: DailySummary = {
  totalRevenue: 124000,
  orderCount: 4,
  itemCount: 11,
  topItems: [
    { name: "Dog Water Bottle", qty: 2, total: 11760 },
    { name: "Pet Toys",         qty: 5, total: 9400  },
    { name: "Pet Treats",       qty: 3, total: 5940  },
    { name: "Lick Mat",         qty: 1, total: 2880  },
  ],
}

const fetchDailySummary = async (): Promise<DailySummary> => {
  return MOCK

  const res = await fetch("/api/orders/summary/today")
  if (!res.ok) throw new Error("Failed to fetch daily summary")
  return res.json()
}

export const useDailySummary = () => {
  return useQuery({
    queryKey: ["daily-summary"],
    queryFn: fetchDailySummary,
    staleTime: 60_000,
  })
}