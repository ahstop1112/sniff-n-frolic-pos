import { useEffect, useRef, useState, useCallback } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import CircularProgress from "@mui/material/CircularProgress"
import Chip from "@mui/material/Chip"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import SaleIcon from "@mui/icons-material/LocalOffer"
import type { Product } from "@/domains/product/types/product.types"

interface Brand {
  id: string
  name: string
  slug: string
}
import { useOrdersStore } from "@/domains/orders/store"
import { useProductPanel, type SortOption } from "../hooks/useProductPanel"
import { useProductPanelFlags, ProductPanelFlags } from "../hooks/useProductPanelFlags"
import { useBarcode } from "@/domains/product/hooks/useBarcode"
import { ProductDetailDrawer } from "./ProductDetailDrawer"
import ProductSearchBar from "./ProductSearchBar"
import CategoryTabs from "./CategoryTabs"
import ProductGrid from "./ProductGrid"

interface ProductPanelProps {
  currency?: string
  flags?: Partial<ProductPanelFlags>
}

const SORT_LABELS: Record<SortOption, string> = {
  newest:     "Newest",
  price_asc:  "Price: Low → High",
  price_desc: "Price: High → Low",
  name_asc:   "Name A → Z",
}

const ProductPanel = ({
  currency = "CAD",
  flags: flagOverrides,
}: ProductPanelProps) => {
  const flags = useProductPanelFlags(flagOverrides)

  const {
    searchText,
    setSearchText,
    handleBarcode,
    isBarcodeScan,
    activeCategorySlug,
    setCategory,
    categories,
    activeBrandSlug,
    setBrand,
    brands,
    onSale,
    setOnSale,
    sort,
    setSort,
    products,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useProductPanel()

  const activeOrderId = useOrdersStore((s) => s.activeOrderId)
  const addLineItem   = useOrdersStore((s) => s.addLineItem)

  const sentinelRef = useRef<HTMLDivElement>(null)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)

  // Wire barcode scanner — fires when a physical scanner sends keypress events
  useBarcode(handleBarcode)

  // Auto-open detail drawer on barcode scan with exactly one result (derived, no effect)
  const autoOpenSlug = isBarcodeScan.current && !isFetching && products.length === 1
    ? products[0].sku
    : null
  const drawerSlug = selectedSlug ?? autoOpenSlug

  // Infinite scroll sentinel
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetching) fetchNextPage()
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetching, fetchNextPage])

  const handleAdd = useCallback(
    (product: Product | { id: string; name: string; price: number }) => {
      if (!activeOrderId) return
      addLineItem({
        orderId: activeOrderId,
        product: {
          id: product.id,
          name: product.name,
          price: "unitPrice" in product
            ? (product.salePrice ?? product.unitPrice)
            : product.price,
        },
      })
    },
    [activeOrderId, addLineItem]
  )

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>

      {/* Search + sort row */}
      {flags.showSearch && (
        <Box sx={{ p: 1.5, pb: 0, display: "flex", gap: 1, alignItems: "center" }}>
          <Box sx={{ flex: 1 }}>
            <ProductSearchBar value={searchText} onChange={setSearchText} />
          </Box>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              displayEmpty
              sx={{ fontSize: 13 }}
            >
              {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                <MenuItem key={key} value={key} sx={{ fontSize: 13 }}>
                  {SORT_LABELS[key]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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

      {/* Brand filter chips + on-sale toggle */}
      {brands.length > 0 && (
        <Box sx={{ px: 1.5, py: 0.75, display: "flex", gap: 0.75, flexWrap: "wrap", alignItems: "center" }}>
          <Chip
            icon={<SaleIcon sx={{ fontSize: 14 }} />}
            label="On Sale"
            size="small"
            color={onSale ? "primary" : "default"}
            variant={onSale ? "filled" : "outlined"}
            onClick={() => setOnSale(!onSale)}
            sx={{ fontSize: 12 }}
          />
          {(brands as Brand[]).map((b) => (
            <Chip
              key={b.slug}
              label={b.name}
              size="small"
              color={activeBrandSlug === b.slug ? "primary" : "default"}
              variant={activeBrandSlug === b.slug ? "filled" : "outlined"}
              onClick={() => setBrand(b.slug)}
              sx={{ fontSize: 12 }}
            />
          ))}
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

        <ProductDetailDrawer
          slug={drawerSlug}
          onClose={() => setSelectedSlug(null)}
          onAdd={handleAdd}
        />

        {/* Scroll sentinel */}
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
