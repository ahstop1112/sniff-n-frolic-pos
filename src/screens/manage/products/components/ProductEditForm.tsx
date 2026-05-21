import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import Divider from "@mui/material/Divider"
import FormControl from "@mui/material/FormControl"
import IconButton from "@mui/material/IconButton"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import TextField from "@mui/material/TextField"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import Autocomplete from "@mui/material/Autocomplete"
import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import SaveIcon from "@mui/icons-material/Save"
import DeleteIcon from "@mui/icons-material/Delete"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import CircularProgress from "@mui/material/CircularProgress"
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh"
import { useGenerateSEO } from "../hooks/useGenerateSEO"
import { type Category, type Brand } from "../hooks/useProductEdit"
import { useCategoryManager } from "../hooks/useCategoryManager"
import { useBrandManager } from "../hooks/useBrandManager"
import ProductImagesEditor, { type ProductImage } from "./ProductImagesEditor"
import CategoryDialog from "./CategoryDialog"
import BrandDialog from "./BrandDialog"
import DeleteProductDialog from "./DeleteProductDialog"

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

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="caption" color="text.secondary"
      fontWeight={700} sx={{ letterSpacing: "0.08em", display: "block", mb: 1.5 }}>
      {title}
    </Typography>
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {children}
    </Box>
  </Box>
)

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const brandManager = useBrandManager((id) => {
    if (!form.brand_ids.includes(id)) {
      onChange("brand_ids", [...form.brand_ids, id])
    }
  })

  const selectedBrand = form.brand_ids.length > 0
  ? (brands.find((b) => b.id === form.brand_ids[form.brand_ids.length - 1]) ?? null)
  : null

  const categoryIds = form.category_ids ?? []

  const catManager = useCategoryManager((id) => {
    if (!categoryIds.includes(id)) {
      onChange("category_ids", [...categoryIds, id])
    }
  })

  // For edit: use the last selected category, or the first if only one
  const selectedCategory = categoryIds.length > 0
    ? (categories.find((c) => c.id === categoryIds[categoryIds.length - 1]) ?? null)
    : null

  const handleConfirmDelete = () => {
    setDeleteDialogOpen(false)
    onDelete?.()
  }

  // SEO generation
  const { generate, isGenerating, error } = useGenerateSEO()

  const handleGenerateSEO = async () => {
    const selectedBrandNames = brands
      .filter((b) => form.brand_ids.includes(b.id))
      .map((b) => b.name)
    
    const result = await generate({
      name: form.name,
      shortDescription: form.short_description,
      description: form.description,
      brands: selectedBrandNames
    })

    if (result) {
      onChange("meta_title", result.metaTitle)
      onChange("meta_description", result.metaDescription)
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/pos/manage/products")}
            variant="text"
            sx={{ textTransform: "none" }}
          >
            Products
          </Button>
          <Typography variant="h6" fontWeight={700}>
            {isCreate ? "New Product" : form.name}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {isSuccess && (
            <Chip label="Saved ✓" color="success" size="small" />
          )}
          {!isCreate && onDelete && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isDeleting}
              sx={{ textTransform: "none" }}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={onSave}
            disabled={isSaving}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Basic Info */}
      <Section title="BASIC INFO">
        <TextField
          label="Name"
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          fullWidth
        />
        <TextField
          label="Slug"
          value={form.slug}
          onChange={(e) => onChange("slug", e.target.value)}
          fullWidth
          disabled={!isCreate}
          helperText={!isCreate ? "Slug cannot be changed after creation" : "Auto-generated from name"}
        />
        {/* Categories */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Autocomplete
            multiple
            fullWidth
            options={categories}
            getOptionLabel={(option) => option.name}
            value={categories.filter((c) => categoryIds.includes(c.id))}
            onChange={(_, selected) =>
              onChange("category_ids", selected.map((c) => c.id))
            }
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.name}
                  size="small"
                  {...getTagProps({ index })}
                  key={option.id}
                />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Categories" placeholder="Add category…" />
            )}
          />
          <Tooltip title="Edit category">
            <span>
              <IconButton
                size="small"
                disabled={!selectedCategory}
                onClick={() => selectedCategory && catManager.openEdit(selectedCategory)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="New Category">
            <IconButton size="small" onClick={catManager.openCreate}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        {/* Brands */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Autocomplete
            fullWidth
            multiple
            options={brands}
            getOptionLabel={(option) => option.name}
            value={brands.filter((b) => form.brand_ids.includes(b.id))}
            onChange={(_, selected) =>
              onChange("brand_ids", selected.map((b) => b.id))
            }
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.name}
                  size="small"
                  {...getTagProps({ index })}
                  key={option.id}
                />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Brands" placeholder="Add brand…" />
            )}
          />
          <Tooltip title="Edit Brand">
            <span>
              <IconButton
                size="small"
                disabled={!selectedBrand}
                onClick={() => selectedBrand && brandManager.openEdit(selectedBrand)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="New Brand">
            <IconButton size="small" onClick={brandManager.openCreate}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <TextField
          label="Image URL"
          value={form.featured_image_url}
          onChange={(e) => onChange("featured_image_url", e.target.value)}
          fullWidth
          placeholder="https://res.cloudinary.com/..."
        />
        {form.featured_image_url && (
          <Box sx={{ width: 120, height: 120, borderRadius: 2, overflow: "hidden", border: 1, borderColor: "divider" }}>
            <img src={form.featured_image_url} alt="preview"
              style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </Box>
        )}
      </Section>

      <Section title="IMAGES">
        <ProductImagesEditor
          images={form.images}
          onChange={(imgs) => onChange("images", imgs)}
        />
      </Section>

      {/* Pricing */}
      <Section title="PRICING">
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="Regular Price (CAD)"
            type="number"
            value={form.regular_price}
            onChange={(e) => onChange("regular_price", Number(e.target.value))}
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            label="Sale Price (CAD)"
            type="number"
            value={form.sale_price ?? ""}
            onChange={(e) => onChange("sale_price", e.target.value ? Number(e.target.value) : null)}
            inputProps={{ min: 0, step: 0.01 }}
            placeholder="Leave empty if no sale"
          />
        </Box>
      </Section>

      {/* Inventory */}
      <Section title="INVENTORY">
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="Stock Quantity"
            type="number"
            value={form.stock_quantity}
            onChange={(e) => onChange("stock_quantity", Number(e.target.value))}
            inputProps={{ min: 0 }}
          />
          <FormControl fullWidth>
            <InputLabel>Stock Status</InputLabel>
            <Select
              value={form.stock_status}
              label="Stock Status"
              onChange={(e) => onChange("stock_status", e.target.value)}
            >
              <MenuItem value="instock">In Stock</MenuItem>
              <MenuItem value="outofstock">Out of Stock</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Section>

      {/* Status */}
      <Section title="STATUS">
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={form.status}
            label="Status"
            onChange={(e) => onChange("status", e.target.value)}
          >
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </Select>
        </FormControl>
      </Section>

      {/* Content */}
      <Section title="CONTENT">
        <TextField
          label="Short Description"
          value={form.short_description}
          onChange={(e) => onChange("short_description", e.target.value)}
          fullWidth
          multiline
          rows={3}
        />
        <TextField
          label="Description"
          value={form.description}
          onChange={(e) => onChange("description", e.target.value)}
          fullWidth
          multiline
          rows={10}
          inputProps={{ style: { fontFamily: "monospace", fontSize: 13 } }}
        />
      </Section>

      {/* SEO */}
      <Section title="SEO">
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={
              isGenerating
                ? <CircularProgress size={14} color="inherit" />
                : <AutoFixHighIcon fontSize="small" />
            }
            onClick={handleGenerateSEO}
            disabled={isGenerating || !form.name}
            sx={{ textTransform: "none" }}
          >
            {isGenerating ? "Generating…" : "Auto-generate"}
          </Button>
        </Box>

        {error && (
          <Typography variant="caption" color="error">{error}</Typography>
        )}
        <TextField
          label="Meta Title"
          value={form.meta_title}
          onChange={(e) => onChange("meta_title", e.target.value)}
          fullWidth
          helperText={`${form.meta_title.length} / 60 chars`}
        />
        <TextField
          label="Meta Description"
          value={form.meta_description}
          onChange={(e) => onChange("meta_description", e.target.value)}
          fullWidth
          multiline
          rows={3}
          helperText={`${form.meta_description.length} / 160 chars`}
        />
      </Section>

      <CategoryDialog manager={catManager} />
      <BrandDialog manager={brandManager} />
      <DeleteProductDialog
        open={deleteDialogOpen}
        productName={form.name}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  )
}

export default ProductEditForm