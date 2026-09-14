import { useQuery } from "@tanstack/react-query"
import { getMonthlyReport } from "../api/ordersApi"

export const useMonthlyReport = (params: {
  date_from?: string
  date_to?: string
  branch_id?: string
}) =>
  useQuery({
    queryKey: ["orders-monthly-report", params],
    queryFn: () => getMonthlyReport(params),
    staleTime: 60_000,
  })
