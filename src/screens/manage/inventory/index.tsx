import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import InputAdornment from "@mui/material/InputAdornment"
import FormControlLabel from "@mui/material/FormControlLabel"
import Switch from "@mui/material/Switch"
import Alert from "@mui/material/Alert"
import Box from "@mui/material/Box"
import SearchIcon from "@mui/icons-material/Search"
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue"
import { useStock } from "@/domains/inventory/hooks/useStock"
import Pagination from "@/domains/inventory/components/Pagination"
import InventoryHero, { type InventoryView } from "./components/InventoryHero"
import InventorySubTabs from "./components/InventorySubTabs"
import CategoryChipStrip from "./components/CategoryChipStrip"
import CategorySection from "./components/CategorySection"
import StockTable from "./components/StockTable"
import { useInventoryHub, type HubCategory, type HubProduct } from "./hooks/useInventoryHub"
import styles from "./InventoryHub.module.scss"

const LIST_LIMIT = 50
const PER_CATEGORY_LIMIT = 30

const StockOverviewScreen = () => {
  const navigate = useNavigate()
  const [view, setView] = useState<InventoryView>("grid")
  const [searchText, setSearchText] = useState("")
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [offset, setOffset] = useState(0)
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null)
  const debouncedSearch = useDebouncedValue(searchText, 300)

  const handleSearchChange = (v: string) => { setSearchText(v); setOffset(0) }
  const handleLowStockToggle = (v: boolean) => { setLowStockOnly(v); setOffset(0) }

  const hub = useInventoryHub({
    perCategoryLimit: PER_CATEGORY_LIMIT,
    activeCategorySlug,
  })

  const listQuery = useStock({
    search: debouncedSearch || undefined,
    low_stock_only: lowStockOnly || undefined,
    limit: LIST_LIMIT,
    offset,
  })

  const listItems = useMemo(() => listQuery.data?.items ?? [], [listQuery.data?.items])
  const listTotal = listQuery.data?.total ?? 0

  const autoExpandParentIds = useMemo(() => {
    if (!debouncedSearch) return undefined
    const ids = new Set<string>()
    for (const item of listItems) {
      if (item.parent_id) ids.add(item.parent_id)
    }
    return ids
  }, [listItems, debouncedSearch])

  const goToAdjust = (productId?: string) =>
    navigate(productId
      ? `/pos/manage/inventory/adjust?productId=${productId}`
      : "/pos/manage/inventory/adjust")

  const goToMovements = () => navigate("/pos/manage/inventory/movements")

  const handleProductClick = (product: HubProduct) => goToAdjust(product.id)

  const handleViewAll = (category: HubCategory) => {
    setActiveCategorySlug((prev) => (prev === category.slug ? null : category.slug))
  }

  const subTabs = [
    { key: "onhand",     label: "On hand",     count: hub.totalSkus },
    { key: "arrives",    label: "Arrives",     disabled: true },
    { key: "receiving",  label: "Receiving",   disabled: true },
    { key: "cycle",      label: "Cycle counts", disabled: true },
    { key: "transfers",  label: "Transfers",   disabled: true },
    { key: "variations", label: "Variations",  disabled: true },
  ]

  const showChips = view === "grid" && !debouncedSearch && !lowStockOnly && hub.categories.length > 0

  return (
    <div className={styles.root}>
      <InventoryHero
        totalSkus={hub.totalSkus}
        unitsOnHand={hub.unitsOnHand}
        lowCount={hub.lowCount}
        outCount={hub.outCount}
        view={view}
        onViewChange={setView}
        onRestockClick={() => goToAdjust()}
        onMovementsClick={goToMovements}
      />

      <div className={styles.scrollBody}>
        <InventorySubTabs tabs={subTabs} activeKey="onhand" />

        <div className={styles.toolbar}>
          <TextField
            className={styles.searchField}
            size="small"
            placeholder="Search name or SKU…"
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          {showChips && (
            <div className={styles.chipStrip}>
              <CategoryChipStrip
                categories={hub.categories}
                activeSlug={activeCategorySlug}
                onChange={setActiveCategorySlug}
              />
            </div>
          )}
          <FormControlLabel
            className={styles.lowStockToggle}
            control={
              <Switch
                size="small"
                checked={lowStockOnly}
                onChange={(e) => handleLowStockToggle(e.target.checked)}
              />
            }
            label="Low stock"
          />
        </div>

        {view === "grid" && !debouncedSearch && !lowStockOnly && (
          <>
            {hub.isCategoriesError && (
              <div className={styles.errorState}>Couldn&apos;t load categories.</div>
            )}

            {hub.isStockError && (
              <div className={styles.errorState}>Stock data unavailable — quantities may not reflect live inventory.</div>
            )}

            {!hub.isCategoriesError && hub.slices.length === 0 && !hub.isCategoriesLoading && (
              <div className={styles.emptyState}>No categories set up yet.</div>
            )}

            <div className={styles.gridStack}>
              {hub.slices.map((slice) => (
                <CategorySection
                  key={slice.category.id}
                  category={slice.category}
                  products={slice.products}
                  isLoading={slice.isLoading}
                  isError={slice.isError}
                  onViewAll={handleViewAll}
                  onProductClick={handleProductClick}
                />
              ))}
            </div>
          </>
        )}

        {(view === "list" || debouncedSearch || lowStockOnly) && (
          <>
            {listQuery.error && (
              <Alert severity="error">{(listQuery.error as Error).message}</Alert>
            )}

            {!listQuery.error && !listQuery.isLoading && listItems.length === 0 && (
              <div className={styles.emptyState}>
                {debouncedSearch
                  ? `No products matching "${debouncedSearch}"`
                  : lowStockOnly
                    ? "No low-stock products — you're all set."
                    : "No products yet."}
              </div>
            )}

            {!listQuery.error && (listItems.length > 0 || listQuery.isLoading) && (
              <div className={styles.listWrap}>
                <StockTable
                  items={listItems}
                  isLoading={listQuery.isLoading && listItems.length === 0}
                  autoExpandParentIds={autoExpandParentIds}
                />
              </div>
            )}

            {!listQuery.error && listTotal > 0 && (
              <Box sx={{ opacity: listQuery.isFetching ? 0.6 : 1 }}>
                <Pagination
                  total={listTotal}
                  limit={LIST_LIMIT}
                  offset={offset}
                  onChange={setOffset}
                />
              </Box>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default StockOverviewScreen
