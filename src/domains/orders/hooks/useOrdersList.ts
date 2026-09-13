import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { getOrders, type Order } from "../api/ordersApi"

export const useOrdersList = (params: {
  branch_id?: string
  status?: string
  sort_by?: string
  sort_dir?: string
  search?: string
  limit?: number
  offset?: number
}) =>
  useQuery({
    queryKey: ["orders-list", params],
    queryFn: () => getOrders(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
