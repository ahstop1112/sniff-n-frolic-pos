import { useEffect, useRef, useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import CircularProgress from "@mui/material/CircularProgress"
import type { Product } from "@/domains/product/types/product.types"
import { useOrdersStore } from "@/domains/orders/store"
import { useProductPanel } from "../hooks/useProductPanel"
import { useProductPanelFlags, ProductPanelFlags } from "../hooks/useProductPanelFlags"
import { ProductDetailDrawer } from "./ProductDetailDrawer"
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
    hasNextPage,
    fetchNextPage
  } = useProductPanel()

  // Orders store — add product to active order
  const activeOrderId = useOrdersStore((s) => s.activeOrderId)
  const addLineItem = useOrdersStore((s) => s.addLineItem)
  
  const sentinelRef = useRef<HTMLDivElement>(null)

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetching) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetching, fetchNextPage])

  const handleAdd = (product: Product | { id: string; name: string; price: number }) => {
    if (!activeOrderId) return
    addLineItem({
      orderId: activeOrderId,
      product: {
        id: product.id,
        name: product.name,
        price: "unitPrice" in product
          ? (product.salePrice ?? product.unitPrice)  // ← 用 salePrice 優先
          : product.price,
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
          onSelect={(product) => setSelectedSlug(product.sku)} 
          currency={currency}
        />

         {/* Drawer */}
        <ProductDetailDrawer
          slug={selectedSlug}
          onClose={() => setSelectedSlug(null)}
          onAdd={handleAdd}
        />
        {/* Scroll to load more */}
        <div ref={sentinelRef} style={{ height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {isFetching && !isLoading && (
          <>
            <CircularProgress size={20} />
            <Typography variant="caption" color="text.secondary">Loading more...</Typography>
          </>
        )}
        </div>
      </Box>

    </Box>
  )
}

export default ProductPanel