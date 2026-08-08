import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { getStock } from "../api/inventoryApi"
import type { GetStockParams } from "../types/inventory.types"

export const useStock = (params: GetStockParams) =>
  useQuery({
    queryKey: ["inventory-stock", params],
    queryFn: () => getStock(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
