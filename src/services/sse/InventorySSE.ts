// SSE client — server pushes inventory updates
// Used by useInventoryStream hook

export const createInventoryStream = (
  branchId: string,
  onUpdate: (productId: string, newQty: number) => void
) => {
  const es = new EventSource(`/api/inventory-stream/${branchId}`)

  es.onmessage = (e) => {
    const { productId, newQty } = JSON.parse(e.data)
    onUpdate(productId, newQty)
  }

  return () => es.close()
}
