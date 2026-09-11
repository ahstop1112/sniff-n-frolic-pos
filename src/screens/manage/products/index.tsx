import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import InputAdornment from "@mui/material/InputAdornment"
import Skeleton from "@mui/material/Skeleton"
import SearchIcon from "@mui/icons-material/Search"
import AddIcon from "@mui/icons-material/Add"
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined"
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined"
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded"
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded"
import SellOutlinedIcon from "@mui/icons-material/SellOutlined"
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined"
import { useProductsHub } from "./hooks/useProductsHub"
import ProductCatalogueCard from "./components/ProductCatalogueCard"
import ProductTable from "./components/ProductTable"
import styles from "./ProductsHub.module.scss"

type View = "grid" | "list"

const cur = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
})
const nf = new Intl.NumberFormat()

const ManageProductsScreen = () => {
  const navigate = useNavigate()
  const [view, setView] = useState<View>("grid")
  const hub = useProductsHub()

  return (
    <div className={styles.root}>
      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroTop}>
          {/* Left: brand block */}
          <div className={styles.heroBrand}>
            <div className={styles.heroIcon}>
              <LocalOfferOutlinedIcon />
            </div>
            <div className={styles.heroMeta}>
              <span className={styles.heroEyebrow}>Catalogue · What we sell</span>
              <div className={styles.heroTitle}>
                Products
                <span className={styles.heroTitleMuted}> · all branches</span>
              </div>
              <div className={styles.heroSubStats}>
                <span><strong>{hub.totalProducts}</strong> SKUs</span>
                <span className={styles.heroSubDot}>·</span>
                <span><strong>{hub.categoryCount}</strong> categories</span>
                <span className={styles.heroSubDot}>·</span>
                <span><strong>{hub.supplierCount}</strong> suppliers</span>
              </div>
            </div>
          </div>

          {/* Right: two-row actions */}
          <div className={styles.heroActions}>
            {/* Row 1: Grid/List + value indicators */}
            <div className={styles.heroActionsTop}>
              <div className={styles.viewToggle} role="group" aria-label="Layout">
                <button
                  type="button"
                  className={`${styles.viewBtn} ${view === "grid" ? styles.viewBtnActive : ""}`}
                  onClick={() => setView("grid")}
                  aria-pressed={view === "grid"}
                >
                  <GridViewRoundedIcon /> Grid
                </button>
                <button
                  type="button"
                  className={`${styles.viewBtn} ${view === "list" ? styles.viewBtnActive : ""}`}
                  onClick={() => setView("list")}
                  aria-pressed={view === "list"}
                >
                  <ViewListRoundedIcon /> List
                </button>
              </div>

              {hub.totalProducts > 0 && (
                <div className={styles.heroValueGroup}>
                  <span className={styles.heroValueItem}>
                    <SellOutlinedIcon />
                    {cur.format(hub.totalRetailValue)}
                  </span>
                  <div className={styles.heroValueSep} />
                  <span className={styles.heroValueItem}>
                    <Inventory2OutlinedIcon />
                    {nf.format(hub.totalUnits)}
                  </span>
                  <div className={styles.heroValueSep} />
                  <span className={styles.heroNotifBadge}>{hub.onSaleCount}</span>
                </div>
              )}
            </div>

            {/* Row 2: New product + Import + Labels */}
            <div className={styles.heroActionsBottom}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate("/pos/manage/products/create")}
              >
                New product
              </Button>
              <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} disabled>
                Import
              </Button>
              <Button variant="outlined" startIcon={<LocalOfferOutlinedIcon />} disabled>
                Labels
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={styles.body}>
        {/* Stats strip — 5 cards full width */}
        <div className={styles.statsStrip}>
          <div className={`${styles.statCard} ${styles.statLive}`}>
            <span className={styles.statLabel}>Live</span>
            <span className={styles.statValue}>{hub.liveCount}</span>
            <span className={styles.statDescription}>Sellable on the floor and online</span>
          </div>
          <div className={`${styles.statCard} ${styles.statDraft}`}>
            <span className={styles.statLabel}>Drafts</span>
            <span className={styles.statValue}>{hub.draftCount}</span>
            <span className={styles.statDescription}>Missing price, photo or category</span>
          </div>
          <div className={`${styles.statCard} ${styles.statArchived}`}>
            <span className={styles.statLabel}>Archived</span>
            <span className={styles.statValue}>{hub.archivedCount}</span>
            <span className={styles.statDescription}>Hidden from search and checkout</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Avg Margin</span>
            <span className={styles.statValue}>—</span>
            <span className={styles.statDescription}>Across all live products</span>
          </div>
          <div className={`${styles.statCard} ${styles.statSale}`}>
            <span className={styles.statLabel}>On sale</span>
            <span className={styles.statValue}>{hub.onSaleCount}</span>
            <span className={styles.statDescription}>Products with active discount</span>
          </div>
        </div>

        {/* Toolbar: search + category chips on one row */}
        <div className={styles.toolbar}>
          <TextField
            className={styles.searchField}
            size="small"
            placeholder="Search name or SKU…"
            value={hub.searchText}
            onChange={(e) => hub.setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <div className={styles.categoryChips}>
            <button
              type="button"
              className={`${styles.chip} ${hub.activeCategorySlug === null ? styles.chipActive : ""}`}
              onClick={() => hub.setActiveCategorySlug(null)}
            >
              All
            </button>
            {hub.categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                className={`${styles.chip} ${hub.activeCategorySlug === c.slug ? styles.chipActive : ""}`}
                onClick={() => hub.setActiveCategorySlug(c.slug)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grid view */}
        {view === "grid" && (
          <>
            {hub.isLoading && (
              <div className={styles.grid}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={260} />
                ))}
              </div>
            )}
            {!hub.isLoading && hub.products.length === 0 && (
              <div className={styles.emptyState}>No products found.</div>
            )}
            {!hub.isLoading && hub.products.length > 0 && (
              <div className={styles.grid}>
                {hub.products.map((p) => (
                  <ProductCatalogueCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </>
        )}

        {/* List view */}
        {view === "list" && (
          <div className={styles.listWrap}>
            <ProductTable
              products={hub.products}
              isLoading={hub.isLoading}
              isFetching={false}
              hasNextPage={false}
              fetchNextPage={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageProductsScreen
