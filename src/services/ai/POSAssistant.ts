// AI layer — your differentiator
// Wraps Anthropic API for POS-specific features

export interface ProductSuggestion {
  productId: string
  reason: string
  confidence: number
}

export class POSAssistant {
  async suggestProducts(params: {
    memberId?: string
    currentItems: string[]
    branchId: string
  }): Promise<ProductSuggestion[]> {
    // TODO: call Anthropic API
    // Use member purchase history + current cart to suggest
    return []
  }

  async summariseOrder(orderId: string): Promise<string> {
    // TODO: generate human-readable order summary for staff
    return ""
  }
}

export const posAssistant = new POSAssistant()
