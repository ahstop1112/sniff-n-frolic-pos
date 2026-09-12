import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Autocomplete from "@mui/material/Autocomplete"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import IconButton from "@mui/material/IconButton"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import Switch from "@mui/material/Switch"
import TextField from "@mui/material/TextField"
import Tooltip from "@mui/material/Tooltip"
import CircularProgress from "@mui/material/CircularProgress"
import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import SaveIcon from "@mui/icons-material/Save"
import DeleteIcon from "@mui/icons-material/Delete"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh"
import { useGenerateSEO } from "../hooks/useGenerateSEO"
import { type Category, type Brand } from "../hooks/useProductEdit"
import { useCategoryManager } from "../hooks/useCategoryManager"
import { useBrandManager } from "../hooks/useBrandManager"
import ProductImagesEditor, { type ProductImage } from "./ProductImagesEditor"
import CategoryDialog from "./CategoryDialog"
import BrandDialog from "./BrandDialog"
import DeleteProductDialog from "./DeleteProductDialog"
import AIGenerateBlock from "./AIGenerateBlock"
import styles from "../ProductEditScreen.module.scss"

interface ProductEditFormProps {
  isCreate: boolean
  form: {
    name: string
    slug: string
    short_description: string
    description: string
    regular_price: number
    sale_price: number | null
    stock_quantity: number
    stock_status: "instock" | "outofstock"
    status: "published" | "draft" | "archived"
    featured_image_url: string
    meta_title: string
    meta_description: string
    category_ids: string[] | null
    brand_ids: string[]
    images: ProductImage[]
  }
  categories: Category[]
  brands: Brand[]
  onChange: (field: string, value: unknown) => void
  onSave: () => void
  onDelete?: () => void
  isSaving: boolean
  isDeleting: boolean
  isSuccess: boolean
}

// prices are stored in dollars in form state (hook converts from cents on load)
const fmtPrice = (dollars: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(dollars)

// ── SEO helpers ───────────────────────────────────────────────────────────────
const TITLE_MAX = 60
const DESC_MAX  = 160

function titleScore(len: number) {
  if (len === 0)            return "red"
  if (len > TITLE_MAX)      return "red"
  if (len >= 30)            return "green"
  return "yellow"
}

function descScore(len: number) {
  if (len === 0)            return "red"
  if (len > DESC_MAX)       return "red"
  if (len >= 100)           return "green"
  return "yellow"
}

const barClass = {
  green:  styles.charBarGreen,
  yellow: styles.charBarYellow,
  red:    styles.charBarRed,
} as const

const countClass = {
  green:  styles.charGreen,
  yellow: styles.charYellow,
  red:    styles.charRed,
} as const

interface SeoCardProps {
  slug: string
  metaTitle: string
  metaDescription: string
  isGenerating: boolean
  canGenerate: boolean
  error: string | null
  onGenerate: () => void
  onChangeTitle: (v: string) => void
  onChangeDescription: (v: string) => void
}

const SeoCard = ({
  slug, metaTitle, metaDescription,
  isGenerating, canGenerate, error,
  onGenerate, onChangeTitle, onChangeDescription,
}: SeoCardProps) => {
  const tLen   = metaTitle.length
  const dLen   = metaDescription.length
  const tScore = titleScore(tLen)
  const dScore = descScore(dLen)

  const domain = "sniffnfrolic.com"
  const path   = slug ? `› products › ${slug.slice(0, 28)}${slug.length > 28 ? "…" : ""}` : "› products › …"

  return (
    <div className={styles.seoCard}>
      <div className={styles.seoCardHeader}>
        <span className={styles.cardTitle} style={{ borderBottom: "none", paddingBottom: 0 }}>SEO</span>
        <Button size="small" variant="outlined"
          startIcon={isGenerating ? <CircularProgress size={13} color="inherit" /> : <AutoFixHighIcon fontSize="small" />}
          onClick={onGenerate} disabled={isGenerating || !canGenerate}
          sx={{ textTransform: "none", fontSize: 12 }}>
          {isGenerating ? "Generating…" : "Auto-generate"}
        </Button>
      </div>

      {error && (
        <span style={{ fontSize: 12, color: "var(--mui-palette-error-main)" }}>{error}</span>
      )}

      {/* Google snippet preview */}
      <div className={styles.snippet}>
        <div className={styles.snippetSite}>
          <span className={styles.snippetFavicon}>S</span>
          <span className={styles.snippetDomain}>{domain} <span style={{ color: "#5f6368" }}>{path}</span></span>
        </div>
        <div className={styles.snippetTitle}>{metaTitle}</div>
        <div className={styles.snippetDesc}>{metaDescription}</div>
      </div>

      {/* Meta title field */}
      <div className={styles.seoField}>
        <TextField
          label="Meta title" value={metaTitle} size="small" fullWidth
          onChange={(e) => onChangeTitle(e.target.value)}
          inputProps={{ maxLength: TITLE_MAX + 20 }}
        />
        <div className={styles.charRow}>
          <div className={styles.charBar}>
            <div
              className={`${styles.charBarFill} ${barClass[tScore]}`}
              style={{ width: `${Math.min((tLen / TITLE_MAX) * 100, 100)}%` }}
            />
          </div>
          <span className={`${styles.charCount} ${countClass[tScore]}`}>
            {tLen} / {TITLE_MAX}
          </span>
        </div>
      </div>

      {/* Meta description field */}
      <div className={styles.seoField}>
        <TextField
          label="Meta description" value={metaDescription} size="small" fullWidth
          multiline rows={3}
          onChange={(e) => onChangeDescription(e.target.value)}
          inputProps={{ maxLength: DESC_MAX + 20 }}
        />
        <div className={styles.charRow}>
          <div className={styles.charBar}>
            <div
              className={`${styles.charBarFill} ${barClass[dScore]}`}
              style={{ width: `${Math.min((dLen / DESC_MAX) * 100, 100)}%` }}
            />
          </div>
          <span className={`${styles.charCount} ${countClass[dScore]}`}>
            {dLen} / {DESC_MAX}
          </span>
        </div>
      </div>
    </div>
  )
}

const STATUS_DOT: Record<string, string> = {
  published: styles.statusDotPublished,
  draft:     styles.statusDotDraft,
  archived:  styles.statusDotArchived,
}

const ProductEditForm = ({
  isCreate,
  form,
  brands,
  categories,
  onChange,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
  isSuccess,
}: ProductEditFormProps) => {
  const navigate = useNavigate()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [trackInventory, setTrackInventory] = useState(true)

  const brandMgr = useBrandManager((id) => {
    if (!form.brand_ids.includes(id)) onChange("brand_ids", [...form.brand_ids, id])
  })
  const catMgr = useCategoryManager((id) => {
    const ids = form.category_ids ?? []
    if (!ids.includes(id)) onChange("category_ids", [...ids, id])
  })

  const categoryIds = form.category_ids ?? []
  const selectedCats = categories.filter((c) => categoryIds.includes(c.id))
  const selectedBrands = brands.filter((b) => form.brand_ids.includes(b.id))
  const lastCat = selectedCats[selectedCats.length - 1] ?? null
  const lastBrand = selectedBrands[selectedBrands.length - 1] ?? null

  const { generate, isGenerating, error: seoError } = useGenerateSEO()
  const handleGenerateSEO = async () => {
    const result = await generate({
      name: form.name,
      shortDescription: form.short_description,
      description: form.description,
      brands: selectedBrands.map((b) => b.name),
    })
    if (result) {
      onChange("meta_title", result.metaTitle)
      onChange("meta_description", result.metaDescription)
    }
  }

  const effectivePrice = form.sale_price ?? form.regular_price

  return (
    <div className={styles.screen}>

      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <span className={styles.topBarTitle}>
            {isCreate ? "New Product" : (form.name || "—")}
          </span>
          <div className={styles.breadcrumb}>
            <button type="button" className={styles.breadcrumbBack}
              onClick={() => navigate("/pos/manage/products")}>
              Products
            </button>
            <span className={styles.breadcrumbSep}>›</span>
            <span className={styles.breadcrumbCurrent}>
              {isCreate ? "New" : form.slug}
            </span>
          </div>
        </div>

        <div className={styles.topBarActions}>
          {isSuccess && <span className={styles.savedBadge}>Saved ✓</span>}
          {!isCreate && (
            <Button variant="outlined" size="small" startIcon={<OpenInNewIcon />}
              href={`https://sniffnfrolic.com/products/${form.slug}`}
              target="_blank" rel="noopener noreferrer">
              View on store
            </Button>
          )}
          <Button
            variant="contained" size="small"
            startIcon={isSaving ? <CircularProgress size={13} color="inherit" /> : <SaveIcon />}
            onClick={onSave} disabled={isSaving}
          >
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>

        {/* ── Left column ── */}
        <div className={styles.mainCol}>

          {/* AI Generator */}
          <AIGenerateBlock categorySlug={form.slug?.split('-')[0]} onChange={onChange} />

          {/* Basic Info */}
          <div className={styles.card}>
            <span className={styles.cardTitle}>Basic Info</span>

            <TextField label="Product name *" value={form.name} size="small" fullWidth
              onChange={(e) => onChange("name", e.target.value)} />

            {isCreate && (
              <TextField label="Slug" value={form.slug} size="small" fullWidth
                helperText="Auto-generated from name or confirmed from AI"
                onChange={(e) => onChange("slug", e.target.value)} />
            )}

            {/* Categories */}
            <div className={styles.fieldRow}>
              <div className={styles.fieldRowGrow}>
                <Autocomplete
                  multiple size="small" fullWidth
                  options={categories}
                  getOptionLabel={(o) => o.name}
                  value={selectedCats}
                  isOptionEqualToValue={(o, v) => o.id === v.id}
                  onChange={(_, selected) => onChange("category_ids", selected.map((c) => c.id))}
                  renderTags={(val, getTagProps) =>
                    val.map((opt, i) => (
                      <Chip label={opt.name} size="small" {...getTagProps({ index: i })} />
                    ))
                  }
                  renderInput={(params) => <TextField {...params} label="Categories" />}
                />
              </div>
              <div className={styles.fieldRowIcons}>
                <Tooltip title="New category">
                  <IconButton size="small" onClick={catMgr.openCreate}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {lastCat && (
                  <Tooltip title="Edit category">
                    <IconButton size="small" onClick={() => catMgr.openEdit(lastCat)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Brands */}
            <div className={styles.fieldRow}>
              <div className={styles.fieldRowGrow}>
                <Autocomplete
                  multiple size="small" fullWidth
                  options={brands}
                  getOptionLabel={(o) => o.name}
                  value={selectedBrands}
                  isOptionEqualToValue={(o, v) => o.id === v.id}
                  onChange={(_, selected) => onChange("brand_ids", selected.map((b) => b.id))}
                  renderTags={(val, getTagProps) =>
                    val.map((opt, i) => (
                      <Chip label={opt.name} size="small" {...getTagProps({ index: i })} />
                    ))
                  }
                  renderInput={(params) => <TextField {...params} label="Brands" />}
                />
              </div>
              <div className={styles.fieldRowIcons}>
                <Tooltip title="New brand">
                  <IconButton size="small" onClick={brandMgr.openCreate}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {lastBrand && (
                  <Tooltip title="Edit brand">
                    <IconButton size="small" onClick={() => brandMgr.openEdit(lastBrand)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className={styles.card}>
            <span className={styles.cardTitle}>Images</span>
            <ProductImagesEditor images={form.images} onChange={(imgs) => onChange("images", imgs)} />
          </div>

          {/* Content */}
          <div className={styles.card}>
            <span className={styles.cardTitle}>Content</span>
            <TextField
              label="Short description" value={form.short_description} size="small" fullWidth
              multiline rows={3}
              helperText={`${form.short_description.length} / 300`}
              onChange={(e) => onChange("short_description", e.target.value)}
            />
            <TextField
              label="Description" value={form.description} size="small" fullWidth
              multiline rows={10}
              inputProps={{ style: { fontFamily: "monospace", fontSize: 13 } }}
              onChange={(e) => onChange("description", e.target.value)}
            />
          </div>

          {/* SEO */}
          <SeoCard
            slug={form.slug}
            metaTitle={form.meta_title}
            metaDescription={form.meta_description}
            isGenerating={isGenerating}
            canGenerate={!!form.name}
            error={seoError}
            onGenerate={handleGenerateSEO}
            onChangeTitle={(v) => onChange("meta_title", v)}
            onChangeDescription={(v) => onChange("meta_description", v)}
          />
        </div>

        {/* ── Right sidebar ── */}
        <div className={styles.sideCol}>

          {/* Status */}
          <div className={styles.card}>
            <span className={styles.cardTitle}>Status</span>
            <div className={styles.statusIndicator}>
              <span className={`${styles.statusDot} ${STATUS_DOT[form.status] ?? ""}`} />
              <span className={styles.statusLabel}>
                {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
              </span>
            </div>
            <Select value={form.status} size="small" fullWidth
              onChange={(e) => onChange("status", e.target.value)}>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </div>

          {/* Pricing */}
          <div className={styles.card}>
            <span className={styles.cardTitle}>Pricing</span>
            <div className={styles.priceGrid}>
              <TextField label="Regular price *" type="number" size="small"
                value={form.regular_price} inputProps={{ min: 0, step: 0.01 }}
                onChange={(e) => onChange("regular_price", Number(e.target.value))} />
              <TextField label="Sale price" type="number" size="small"
                value={form.sale_price ?? ""} inputProps={{ min: 0, step: 0.01 }}
                placeholder="—"
                onChange={(e) => onChange("sale_price", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div className={styles.customerPays}>
              <span className={styles.customerPaysLabel}>Customer pays</span>
              <span className={styles.customerPaysAmount}>{fmtPrice(effectivePrice)}</span>
            </div>
          </div>

          {/* Inventory */}
          <div className={styles.card}>
            <span className={styles.cardTitle}>Inventory</span>
            <div className={styles.inventoryQtyRow}>
              <TextField label="Qty on hand" type="number" size="small"
                value={form.stock_quantity} inputProps={{ min: 0 }} sx={{ flex: 1 }}
                onChange={(e) => onChange("stock_quantity", Number(e.target.value))} />
              <span className={`${styles.stockPill} ${form.stock_status === "instock" ? styles.stockIn : styles.stockOut}`}>
                {form.stock_status === "instock" ? "In stock" : "Out of stock"}
              </span>
            </div>
            <Select value={form.stock_status} size="small" fullWidth
              onChange={(e) => onChange("stock_status", e.target.value)}>
              <MenuItem value="instock">In Stock</MenuItem>
              <MenuItem value="outofstock">Out of Stock</MenuItem>
            </Select>
            <div className={styles.inventoryMeta}>
              <TextField label="SKU" value={form.slug} size="small" disabled />
              <TextField label="Weighs (g)" type="number" size="small" inputProps={{ min: 0 }} />
            </div>
            <div className={styles.trackRow}>
              <div className={styles.trackInfo}>
                <span className={styles.trackLabel}>Track inventory</span>
                <span className={styles.trackSub}>Last counted 14 May</span>
              </div>
              <Switch size="small" checked={trackInventory}
                onChange={(e) => setTrackInventory(e.target.checked)} />
            </div>
          </div>

          {/* Danger Zone */}
          {!isCreate && onDelete && (
            <div className={styles.dangerCard}>
              <span className={styles.dangerTitle}>Danger Zone</span>
              <p className={styles.dangerText}>
                Deletes and removes this product from the catalogue. This cannot be undone.
              </p>
              <Button variant="outlined" color="error" size="small"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteOpen(true)} disabled={isDeleting}
                sx={{ textTransform: "none", fontWeight: 700, alignSelf: "flex-start" }}>
                {isDeleting ? "Deleting…" : "Delete product"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <CategoryDialog manager={catMgr} />
      <BrandDialog manager={brandMgr} />
      <DeleteProductDialog
        open={deleteOpen}
        productName={form.name}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => { setDeleteOpen(false); onDelete?.() }}
      />
    </div>
  )
}

export default ProductEditForm
