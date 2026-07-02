import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import MenuItem from "@mui/material/MenuItem"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import CircularProgress from "@mui/material/CircularProgress"

interface AddVariantDialogProps {
  open: boolean
  onClose: () => void
  parentSlug: string
  parentName: string
}

const toKebab = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-")

const getToken = () => localStorage.getItem("snf_pos_access_token")

const createVariant = async (dto: object) => {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(dto),
  })
  if (!res.ok) throw new Error("Failed to create variant")
  return res.json()
}

const emptyForm = () => ({
  identifier: "",
  name: "",
  regular_price: "",
  sale_price: "",
  stock_quantity: "0",
  stock_status: "instock" as "instock" | "outofstock",
  status: "published" as "published" | "draft",
})

const AddVariantDialog = ({
  open,
  onClose,
  parentSlug,
  parentName,
}: AddVariantDialogProps) => {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(emptyForm)

  const variantSlug = form.identifier.trim()
    ? `${parentSlug}-${toKebab(form.identifier)}`
    : ""

  const handleIdentifierChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      identifier: value,
      name: prev.name === `${parentName} - ${prev.identifier}` || prev.name === ""
        ? `${parentName} - ${value}`
        : prev.name,
    }))
  }

  const mutation = useMutation({
    mutationFn: () =>
      createVariant({
        product_type: "variation",
        name: form.name.trim() || `${parentName} - ${form.identifier}`,
        slug: variantSlug,
        regular_price: Math.round(Number(form.regular_price) * 100),
        sale_price: form.sale_price ? Math.round(Number(form.sale_price) * 100) : null,
        stock_quantity: Number(form.stock_quantity),
        stock_status: form.stock_status,
        status: form.status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-variants", parentSlug] })
      setForm(emptyForm())
      onClose()
    },
  })

  const handleClose = () => {
    if (mutation.isPending) return
    setForm(emptyForm())
    onClose()
  }

  const isValid =
    form.identifier.trim().length > 0 &&
    Number(form.regular_price) > 0

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Add Variant</DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
        <Typography variant="body2" color="text.secondary">{parentName}</Typography>

        <TextField
          label="Variant identifier"
          placeholder="e.g. 100g, Small, Large"
          size="small"
          value={form.identifier}
          onChange={(e) => handleIdentifierChange(e.target.value)}
          helperText={variantSlug ? `Slug: ${variantSlug}` : ""}
          required
        />

        <TextField
          label="Full name"
          size="small"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        />

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Regular price (CAD)"
            size="small"
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            value={form.regular_price}
            onChange={(e) => setForm((p) => ({ ...p, regular_price: e.target.value }))}
            required
            sx={{ flex: 1 }}
          />
          <TextField
            label="Sale price (optional)"
            size="small"
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            value={form.sale_price}
            onChange={(e) => setForm((p) => ({ ...p, sale_price: e.target.value }))}
            sx={{ flex: 1 }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Stock quantity"
            size="small"
            type="number"
            inputProps={{ min: 0 }}
            value={form.stock_quantity}
            onChange={(e) => setForm((p) => ({ ...p, stock_quantity: e.target.value }))}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Stock status"
            select
            size="small"
            value={form.stock_status}
            onChange={(e) => setForm((p) => ({ ...p, stock_status: e.target.value as "instock" | "outofstock" }))}
            sx={{ flex: 1 }}
          >
            <MenuItem value="instock">In stock</MenuItem>
            <MenuItem value="outofstock">Out of stock</MenuItem>
          </TextField>
          <TextField
            label="Status"
            select
            size="small"
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as "published" | "draft" }))}
            sx={{ flex: 1 }}
          >
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
          </TextField>
        </Box>

        {mutation.isError && (
          <Typography variant="caption" color="error">
            Save failed — please try again.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={handleClose} disabled={mutation.isPending} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => mutation.mutate()}
          disabled={!isValid || mutation.isPending}
          sx={{ textTransform: "none", minWidth: 80 }}
        >
          {mutation.isPending ? <CircularProgress size={18} color="inherit" /> : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddVariantDialog
