// SSE subscriber — replaces setInterval polling
// Server pushes inventory updates when order completes

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

export const useInventoryStream = (branchId: string) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const es = new EventSource(`/api/inventory-stream/${branchId}`)

    es.onmessage = (e) => {
      const { productId, newQty } = JSON.parse(e.data)
      // React Query cache update → ProductGrid re-renders automatically
      queryClient.setQueryData(
        ["product", productId],
        (old: any) => old ? { ...old, quantity: newQty } : old
      )
    }

    es.onerror = () => {
      // SSE auto-reconnects — no manual retry needed
      console.warn("Inventory stream disconnected, reconnecting...")
    }

    return () => es.close()
  }, [branchId, queryClient])
}
