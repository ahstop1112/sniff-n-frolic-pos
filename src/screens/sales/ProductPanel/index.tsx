import { useEffect, useRef, useState, useCallback } from "react"
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
import styles from "./ProductPanel.module.scss"

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
      <div className={styles.loadingWrap}>
        <CircularProgress />
      </div>
    )
  }

  return (
    <div className={styles.root}>

      {/* Toolbar — title + secondary actions */}
      <div className={styles.toolbar}>
        <span className={styles.toolbarTitle}>New order</span>
        <div className={styles.toolbarActions}>
          <Button variant="outlined" size="small" startIcon={<HistoryIcon />}>
            Recent orders
          </Button>
          <Button variant="outlined" size="small" startIcon={<PauseCircleOutlineIcon />}>
            Hold order
          </Button>
        </div>
      </div>

      {/* Search + sort row */}
      {flags.showSearch && (
        <div className={styles.searchRow}>
          <div className={styles.searchWrap}>
            <ProductSearchBar value={searchText} onChange={setSearchText} />
          </div>
          <FormControl size="small" className={styles.sortControl}>
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              displayEmpty
            >
              {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                <MenuItem key={key} value={key}>
                  {SORT_LABELS[key]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      )}

      {/* Category pills + Filter action on the right */}
      {flags.showCategoryTabs && (
        <div className={styles.categoryRow}>
          <div className={styles.categoryWrap}>
            <CategoryTabs
              categories={categories}
              activeId={activeCategorySlug}
              onChange={setCategory}
            />
          </div>
          <div className={styles.filterButton}>
            <Button variant="outlined" size="small" startIcon={<TuneIcon />}>
              Filter
            </Button>
          </div>
        </div>
      )}

      {/* Brand filter chips + on-sale toggle */}
      {brands.length > 0 && (
        <div className={styles.brandRow}>
          <Chip
            icon={<SaleIcon />}
            label="On Sale"
            size="small"
            color={onSale ? "primary" : "default"}
            variant={onSale ? "filled" : "outlined"}
            onClick={() => setOnSale(!onSale)}
          />
          {(brands as Brand[]).map((b) => (
            <Chip
              key={b.slug}
              label={b.name}
              size="small"
              color={activeBrandSlug === b.slug ? "primary" : "default"}
              variant={activeBrandSlug === b.slug ? "filled" : "outlined"}
              onClick={() => setBrand(b.slug)}
            />
          ))}
        </div>
      )}

      {/* Product grid — scrollable */}
      <div className={styles.gridArea}>
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
        <div ref={sentinelRef} className={styles.sentinel}>
          {isFetching && !isLoading && (
            <>
              <CircularProgress size={20} />
              <Typography variant="caption" color="text.secondary">Loading more...</Typography>
            </>
          )}
        </div>
      </div>

    </div>
  )
}

export default ProductPanel
