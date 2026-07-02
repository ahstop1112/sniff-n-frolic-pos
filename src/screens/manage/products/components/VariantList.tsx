import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import TextField from "@mui/material/TextField"
import MenuItem from "@mui/material/MenuItem"
import Chip from "@mui/material/Chip"
import CircularProgress from "@mui/material/CircularProgress"
import Skeleton from "@mui/material/Skeleton"
import EditIcon from "@mui/icons-material/Edit"
import CheckIcon from "@mui/icons-material/Check"
import CloseIcon from "@mui/icons-material/Close"
import AddIcon from "@mui/icons-material/Add"
import AddVariantDialog from "./AddVariantDialog"

interface Variant {
  id: string
  slug: string
  name: string
  regular_price: number
  sale_price: number | null
  effective_price: number
  stock_status: string
  stock_quantity: number
  featured_image_url: string | null
}

interface EditState {
  regular_price: string
  sale_price: string
  stock_quantity: string
  stock_status: "instock" | "outofstock"
  status: "published" | "draft" | "archived"
}

interface VariantListProps {
  parentSlug: string
  parentName: string
}

const formatMoney = (cents: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "CAD" }).format(cents / 100)

const getToken = () => localStorage.getItem("snf_pos_access_token")

const fetchParentWithVariants = async (slug: string) => {
  const res = await fetch(`/api/products/${slug}?manage=true`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error("Failed to fetch product variants")
  return res.json()
}

const updateVariant = async (id: string, dto: object) => {
  const res = await fetch(`/api/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(dto),
  })
  if (!res.ok) throw new Error("Failed to update variant")
  return res.json()
}

const VariantList = ({ parentSlug, parentName }: VariantListProps) => {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditState | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["product-variants", parentSlug],
    queryFn: () => fetchParentWithVariants(parentSlug),
    staleTime: 30_000,
  })

  const variants: Variant[] = data?.variations ?? []

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: object }) => updateVariant(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-variants", parentSlug] })
      setEditingId(null)
      setEditForm(null)
    },
  })

  const startEdit = (v: Variant) => {
    setEditingId(v.id)
    setEditForm({
      regular_price: String(v.regular_price / 100),
      sale_price: v.sale_price ? String(v.sale_price / 100) : "",
      stock_quantity: String(v.stock_quantity),
      stock_status: v.stock_status === "instock" ? "instock" : "outofstock",
      status: "published",
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
  }

  const saveEdit = (id: string) => {
    if (!editForm) return
    updateMutation.mutate({
      id,
      dto: {
        regular_price: Math.round(Number(editForm.regular_price) * 100),
        sale_price: editForm.sale_price ? Math.round(Number(editForm.sale_price) * 100) : null,
        stock_quantity: Number(editForm.stock_quantity),
        stock_status: editForm.stock_status,
        status: editForm.status,
      },
    })
  }

  const colWidths = "1fr 110px 110px 80px 80px 90px 80px"

  return (
    <Box sx={{ mt: 4, borderTop: 1, borderColor: "divider", pt: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>Variants</Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setAddOpen(true)}
          sx={{ textTransform: "none" }}
        >
          Add Variant
        </Button>
      </Box>

      {isLoading && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {[1, 2].map((i) => <Skeleton key={i} variant="rounded" height={48} />)}
        </Box>
      )}

      {!isLoading && variants.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No variants yet. Click "Add Variant" to create the first one.
        </Typography>
      )}

      {!isLoading && variants.length > 0 && (
        <Box>
          {/* Header */}
          <Box sx={{
            display: "grid", gridTemplateColumns: colWidths,
            gap: 1.5, px: 1.5, py: 0.75,
            borderBottom: 1, borderColor: "divider", bgcolor: "grey.50",
          }}>
            {["Name", "Regular price", "Sale price", "Stock qty", "Status", "Stock status", ""].map((h, i) => (
              <Typography key={i} variant="caption" color="text.secondary" fontWeight={700}
                sx={{ letterSpacing: "0.06em" }}>
                {h}
              </Typography>
            ))}
          </Box>

          {variants.map((v) => {
            const isEditing = editingId === v.id
            const isSaving = updateMutation.isPending && editingId === v.id

            return (
              <Box
                key={v.id}
                sx={{
                  display: "grid", gridTemplateColumns: colWidths,
                  gap: 1.5, px: 1.5, py: 1,
                  borderBottom: 1, borderColor: "divider",
                  alignItems: "center",
                  bgcolor: isEditing ? "action.selected" : "transparent",
                  transition: "background 0.1s",
                }}
              >
                {/* Name */}
                <Typography variant="body2" noWrap title={v.name}>{v.name}</Typography>

                {isEditing && editForm ? (
                  <>
                    <TextField
                      size="small" type="number" inputProps={{ min: 0, step: 0.01 }}
                      value={editForm.regular_price}
                      onChange={(e) => setEditForm((p) => p ? { ...p, regular_price: e.target.value } : p)}
                      sx={{ "& input": { py: 0.5, fontSize: 13 } }}
                    />
                    <TextField
                      size="small" type="number" inputProps={{ min: 0, step: 0.01 }}
                      value={editForm.sale_price}
                      placeholder="—"
                      onChange={(e) => setEditForm((p) => p ? { ...p, sale_price: e.target.value } : p)}
                      sx={{ "& input": { py: 0.5, fontSize: 13 } }}
                    />
                    <TextField
                      size="small" type="number" inputProps={{ min: 0 }}
                      value={editForm.stock_quantity}
                      onChange={(e) => setEditForm((p) => p ? { ...p, stock_quantity: e.target.value } : p)}
                      sx={{ "& input": { py: 0.5, fontSize: 13 } }}
                    />
                    <TextField
                      select size="small" value={editForm.status}
                      onChange={(e) => setEditForm((p) => p ? { ...p, status: e.target.value as EditState["status"] } : p)}
                      sx={{ "& .MuiSelect-select": { py: 0.5, fontSize: 13 } }}
                    >
                      <MenuItem value="published">Published</MenuItem>
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="archived">Archived</MenuItem>
                    </TextField>
                    <TextField
                      select size="small" value={editForm.stock_status}
                      onChange={(e) => setEditForm((p) => p ? { ...p, stock_status: e.target.value as "instock" | "outofstock" } : p)}
                      sx={{ "& .MuiSelect-select": { py: 0.5, fontSize: 13 } }}
                    >
                      <MenuItem value="instock">In stock</MenuItem>
                      <MenuItem value="outofstock">Out of stock</MenuItem>
                    </TextField>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <IconButton size="small" onClick={() => saveEdit(v.id)} disabled={isSaving}>
                        {isSaving ? <CircularProgress size={16} /> : <CheckIcon fontSize="small" color="success" />}
                      </IconButton>
                      <IconButton size="small" onClick={cancelEdit} disabled={isSaving}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography variant="body2">{formatMoney(v.regular_price)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {v.sale_price ? formatMoney(v.sale_price) : "—"}
                    </Typography>
                    <Typography variant="body2"
                      color={v.stock_quantity <= 3 ? "error.main" : "text.primary"}
                      fontWeight={v.stock_quantity <= 3 ? 700 : 400}
                    >
                      {v.stock_quantity}
                    </Typography>
                    <Box />
                    <Chip
                      label={v.stock_status === "instock" ? "In stock" : "Out of stock"}
                      size="small"
                      color={v.stock_status === "instock" ? "success" : "default"}
                    />
                    <IconButton size="small" onClick={() => startEdit(v)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Box>
            )
          })}
        </Box>
      )}

      <AddVariantDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        parentSlug={parentSlug}
        parentName={parentName}
      />
    </Box>
  )
}

export default VariantList
