import { useQuery } from "@tanstack/react-query"
import { queryReport } from "../api/ordersApi"

export const useRevenueBreakdown = (params: {
  date_from?: string
  date_to?: string
}) =>
  useQuery({
    queryKey: ["revenue-breakdown", params],
    queryFn: async () => {
      const question = `Show revenue by category for the period from ${params.date_from} to ${params.date_to}`
      const result = await queryReport(question)
      return result
    },
    staleTime: 60_000,
    enabled: !!(params.date_from && params.date_to),
  })
