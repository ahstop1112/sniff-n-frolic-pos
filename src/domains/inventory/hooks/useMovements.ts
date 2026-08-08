import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { getMovements } from "../api/inventoryApi"
import type { GetMovementsParams } from "../types/inventory.types"

export const useMovements = (params: GetMovementsParams) =>
  useQuery({
    queryKey: ["inventory-movements", params],
    queryFn: () => getMovements(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
