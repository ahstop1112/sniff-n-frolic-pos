import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import type { Product } from "@/domains/product/types/product.types"
import { useOrdersStore } from "@/domains/orders/store"
import { useProductPanel } from "../hooks/useProductPanel"
import { useProductPanelFlags, ProductPanelFlags } from "../hooks/useProductPanelFlags"

import ProductSearchBar from "./ProductSearchBar"
import CategoryTabs from "./CategoryTabs"
import ProductGrid from "./ProductGrid"

interface ProductPanelProps {
  currency?: string
  // Feature flags — override defaults per deployment
  flags?: Partial<ProductPanelFlags>
}

const ProductPanel = ({
  currency = "CAD",
  flags: flagOverrides,
}: ProductPanelProps) => {
  const flags = useProductPanelFlags(flagOverrides)

   const {
    searchText,
    setSearchText,
    activeCategorySlug,
    setCategory,
    categories,
    products,
    isLoading,
    isFetching,
  } = useProductPanel()

  // Orders store — add product to active order
  const activeOrderId = useOrdersStore((s) => s.activeOrderId)
  const addLineItem   = useOrdersStore((s) => s.addLineItem)

  const handleAdd = (product: Product) => {
    if (!activeOrderId) return
    addLineItem({
      orderId: activeOrderId,
      product: {
        id: product.id,
        name: product.name,
        price: product.unitPrice,
      },
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>

      {/* Search */}
      {flags.showSearch && (
        <Box sx={{ p: 1.5, pb: 0 }}>
          <ProductSearchBar
            value={searchText}
            onChange={setSearchText}
          />
        </Box>
      )}

      {/* Category tabs */}
      {flags.showCategoryTabs && (
        <Box sx={{ px: 1.5 }}>
          <CategoryTabs
            categories={categories}
            activeId={activeCategorySlug}
            onChange={setCategory}
          />
        </Box>
      )}

      {/* Product grid — scrollable */}
      <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        <ProductGrid
          products={products}
          flags={flags}
          onAdd={handleAdd}
          currency={currency}
        />
      </Box>

    </Box>
  )
}

export default ProductPanel