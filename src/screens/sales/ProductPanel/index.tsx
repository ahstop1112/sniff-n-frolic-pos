import { useEffect, useRef, useState, useCallback } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import CircularProgress from "@mui/material/CircularProgress"
import Chip from "@mui/material/Chip"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import SaleIcon from "@mui/icons-material/LocalOffer"
import HistoryIcon from "@mui/icons-material/History"
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline"
import TuneIcon from "@mui/icons-material/Tune"
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
    (product: Product | { id: string; name: string; price: number; image?: string | null }) => {
      if (!activeOrderId) return
      // The domain Product uses `imageUrl`; some raw API rows expose
      // `featured_image_url`; the light shape uses `image`. Coalesce all three.
      const raw = product as unknown as {
        imageUrl?: string | null
        featured_image_url?: string | null
        image?: string | null
      }
      const image = raw.imageUrl ?? raw.featured_image_url ?? raw.image ?? null
      addLineItem({
        orderId: activeOrderId,
        product: {
          id: product.id,
          name: product.name,
          price: "unitPrice" in product
            ? (product.salePrice ?? product.unitPrice)
            : product.price,
          image,
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

      {/* Toolbar — title + secondary actions */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        px: 2.5, py: 2, borderBottom: 1, borderColor: "divider", gap: 2,
      }}>
        <Typography variant="h5" fontWeight={800}>New order</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" size="small" startIcon={<HistoryIcon />}
            sx={{ textTransform: "none", fontWeight: 600 }}>
            Recent orders
          </Button>
          <Button variant="outlined" size="small" startIcon={<PauseCircleOutlineIcon />}
            sx={{ textTransform: "none", fontWeight: 600 }}>
            Hold order
          </Button>
        </Box>
      </Box>

      {/* Search + sort row */}
      {flags.showSearch && (
        <Box sx={{ px: 2.5, pt: 2, pb: 0, display: "flex", gap: 1, alignItems: "center" }}>
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

      {/* Category pills + Filter action on the right */}
      {flags.showCategoryTabs && (
        <Box sx={{ px: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <CategoryTabs
              categories={categories}
              activeId={activeCategorySlug}
              onChange={setCategory}
            />
          </Box>
          <Button variant="outlined" size="small" startIcon={<TuneIcon />}
            sx={{ textTransform: "none", fontWeight: 600, mr: 1.5 }}>
            Filter
          </Button>
        </Box>
      )}

      {/* Brand filter chips + on-sale toggle */}
      {brands.length > 0 && (
        <Box sx={{ px: 2.5, py: 0.75, display: "flex", gap: 0.75, flexWrap: "wrap", alignItems: "center" }}>
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
