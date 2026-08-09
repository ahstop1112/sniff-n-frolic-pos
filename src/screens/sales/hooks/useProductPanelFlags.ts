// Feature flags for ProductPanel
// Add new flags here as product evolves

export interface ProductPanelFlags {
  showSearch: boolean
  showCategoryTabs: boolean
  showStockBadge: boolean
  showProductImage: boolean
  gridColumns: 2 | 3 | 4 | 5
}

// Default flags — override via props or remote config later
export const DEFAULT_FLAGS: ProductPanelFlags = {
  showSearch: true,
  showCategoryTabs: true,
  showStockBadge: true,
  showProductImage: true,
  gridColumns: 5,
}

export const useProductPanelFlags = (
  overrides?: Partial<ProductPanelFlags>
): ProductPanelFlags => ({
  ...DEFAULT_FLAGS,
  ...overrides,
})
