import { useQuery } from "@tanstack/react-query"
import { useSessionStore } from "@/domains/session/store"
import type { DailySummary } from "../Summary/types"

const fetchDailySummary = async (branchId: string): Promise<DailySummary> => {
  const token = localStorage.getItem("snf_pos_access_token")
  const res = await fetch(`/api/orders/summary/today?branchId=${branchId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to fetch daily summary")
  return res.json()
}

export const useDailySummary = () => {
  const branchUUID = useSessionStore((s) => s.branchUUID)

  return useQuery({
    queryKey: ["daily-summary", branchUUID],
    queryFn: () => fetchDailySummary(branchUUID!),
    staleTime: 60_000,
    enabled: !!branchUUID,
  })
}