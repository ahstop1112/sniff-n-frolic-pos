import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import InputAdornment from "@mui/material/InputAdornment"
import Skeleton from "@mui/material/Skeleton"
import SearchIcon from "@mui/icons-material/Search"
import AddIcon from "@mui/icons-material/Add"
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined"
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded"
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded"
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
          <div className={styles.heroBrand}>
            <div className={styles.heroIcon}>
              <CategoryOutlinedIcon />
            </div>
            <div className={styles.heroMeta}>
              <span className={styles.heroEyebrow}>Catalogue · What we sell</span>
              <span className={styles.heroTitle}>Products · all branches</span>
              <div className={styles.heroStats}>
                <span><strong>{hub.totalProducts}</strong> SKUs</span>
                <span className={styles.heroDivider}>·</span>
                <span><strong>{hub.categoryCount}</strong> categories</span>
              </div>
            </div>
          </div>

          <div className={styles.heroActions}>
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
              <span className={styles.heroValuePill}>
                {cur.format(hub.totalRetailValue)} · {nf.format(hub.totalUnits)}
              </span>
            )}

            <div className={styles.heroCta}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate("/pos/manage/products/create")}
              >
                New product
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={styles.body}>
        {/* Stats strip */}
        <div className={styles.statsStrip}>
          <div className={`${styles.statCard} ${styles.statLive}`}>
            <span className={styles.statLabel}>Live</span>
            <span className={styles.statValue}>{hub.liveCount}</span>
          </div>
          <div className={`${styles.statCard} ${styles.statDraft}`}>
            <span className={styles.statLabel}>Drafts</span>
            <span className={styles.statValue}>{hub.draftCount}</span>
          </div>
          <div className={`${styles.statCard} ${styles.statArchived}`}>
            <span className={styles.statLabel}>Archived</span>
            <span className={styles.statValue}>{hub.archivedCount}</span>
          </div>
          <div className={`${styles.statCard} ${styles.statSale}`}>
            <span className={styles.statLabel}>On sale</span>
            <span className={styles.statValue}>{hub.onSaleCount}</span>
          </div>
        </div>

        {/* Toolbar: search + category chips */}
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
