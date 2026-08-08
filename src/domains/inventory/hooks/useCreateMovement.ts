import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createMovement } from "../api/inventoryApi"
import type { CreateMovementBody } from "../types/inventory.types"

export const useCreateMovement = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateMovementBody) => createMovement(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-stock"] })
      queryClient.invalidateQueries({ queryKey: ["inventory-movements"] })
      // Products list shows stock too — keep it in sync.
      queryClient.invalidateQueries({ queryKey: ["manage-products"] })
    },
  })
}
