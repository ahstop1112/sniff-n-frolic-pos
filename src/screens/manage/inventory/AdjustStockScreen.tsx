import { useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Radio from "@mui/material/Radio"
import RadioGroup from "@mui/material/RadioGroup"
import FormControlLabel from "@mui/material/FormControlLabel"
import ToggleButton from "@mui/material/ToggleButton"
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import Alert from "@mui/material/Alert"
import Snackbar from "@mui/material/Snackbar"
import CircularProgress from "@mui/material/CircularProgress"
import Divider from "@mui/material/Divider"
import RemoveIcon from "@mui/icons-material/Remove"
import AddIcon from "@mui/icons-material/Add"
import { getStockByProduct } from "@/domains/inventory/api/inventoryApi"
import { useCreateMovement } from "@/domains/inventory/hooks/useCreateMovement"
import { MANUAL_REASONS, POSITIVE_REASONS, REASON_LABELS } from "@/domains/inventory/constants"
import ProductSearchSelect from "@/domains/inventory/components/ProductSearchSelect"
import type { MovementReason, StockItem } from "@/domains/inventory/types/inventory.types"

type Direction = "increase" | "decrease"

// Derive submission sign from reason (see spec §Quantity Direction). For Adjustment,
// the user picks direction explicitly; every other manual reason has a fixed sign.
const signedQuantity = (
  reason: MovementReason,
  quantity: number,
  direction: Direction,
): number => {
  if (reason === "adjustment") return direction === "increase" ? quantity : -quantity
  return POSITIVE_REASONS.includes(reason) ? quantity : -quantity
}

interface SuccessInfo {
  productName: string
  before: number
  after: number
}

const AdjustStockScreen = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectId = searchParams.get("productId")

  // Explicit user selection (via search or after a successful adjustment).
  // We derive the effective product from override ?? preloaded, so we don't
  // need an effect to copy the preloaded value into local state.
  const [override, setOverride] = useState<StockItem | null>(null)
  const [reason, setReason] = useState<MovementReason>("restock")
  const [direction, setDirection] = useState<Direction>("increase")
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState<SuccessInfo | null>(null)

  const mutation = useCreateMovement()

  // Preload the URL-provided product on mount.
  const { data: preselected, isLoading: preloading } = useQuery({
    queryKey: ["inventory-stock-by-product", preselectId],
    queryFn: () => getStockByProduct(preselectId!),
    enabled: !!preselectId,
    staleTime: 30_000,
  })

  const product = override ?? preselected ?? null

  const signed = useMemo(
    () => (product ? signedQuantity(reason, quantity, direction) : 0),
    [product, reason, quantity, direction],
  )
  const projected = product ? product.stock_quantity + signed : 0
  const wouldGoNegative = product ? projected < 0 : false

  const canSubmit =
    !!product &&
    quantity > 0 &&
    !wouldGoNegative &&
    !mutation.isPending

  const resetFormButKeepProduct = () => {
    setQuantity(1)
    setNote("")
    setReason("restock")
    setDirection("increase")
    setErrorMessage(null)
  }

  const handleSubmit = () => {
    if (!product || !canSubmit) return
    setErrorMessage(null)
    mutation.mutate(
      {
        product_id: product.id,
        quantity_change: signed,
        reason,
        note: note.trim() || undefined,
      },
      {
        onSuccess: (result) => {
          const before = product.stock_quantity
          const after = result.stock_quantity
          // Use the server-returned total (see spec §Core Principles).
          setOverride({ ...product, stock_quantity: after })
          setSuccess({ productName: product.name, before, after })
          resetFormButKeepProduct()
        },
        onError: (err: unknown) => {
          setErrorMessage(err instanceof Error ? err.message : "Failed to adjust stock")
        },
      },
    )
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        px: 3, py: 2, borderBottom: 1, borderColor: "divider", flexShrink: 0,
      }}>
        <Typography variant="h6" fontWeight={700}>Adjust Stock</Typography>
        <Button
          variant="text"
          onClick={() => navigate("/pos/manage/inventory")}
          sx={{ textTransform: "none" }}
        >
          Back to Stock Overview
        </Button>
      </Box>

      {/* Form */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 3 }}>
        <Box sx={{ maxWidth: 520, display: "flex", flexDirection: "column", gap: 3 }}>

          {/* Product */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              Product
            </Typography>
            {preloading ? (
              <CircularProgress size={20} />
            ) : (
              <ProductSearchSelect
                value={product}
                onChange={setOverride}
                disableUnmanaged
                placeholder="Search products…"
              />
            )}
            {product && (
              <Box sx={{ mt: 1.5, p: 1.5, border: 1, borderColor: "divider", borderRadius: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  {product.parent_name ? `${product.parent_name} — ${product.name}` : product.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {product.sku ? `${product.sku} · ` : ""}
                  {product.stock_quantity} in stock
                </Typography>
              </Box>
            )}
          </Box>

          <Divider />

          {/* Reason */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              Reason
            </Typography>
            <RadioGroup
              row
              value={reason}
              onChange={(e) => setReason(e.target.value as MovementReason)}
              sx={{ gap: 2 }}
            >
              {MANUAL_REASONS.map((r) => (
                <FormControlLabel
                  key={r}
                  value={r}
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">{REASON_LABELS[r]}</Typography>}
                />
              ))}
            </RadioGroup>

            {reason === "adjustment" && (
              <ToggleButtonGroup
                exclusive
                value={direction}
                onChange={(_, v) => { if (v) setDirection(v as Direction) }}
                size="small"
                sx={{ mt: 1 }}
              >
                <ToggleButton value="increase" sx={{ px: 2, textTransform: "none" }}>
                  Increase
                </ToggleButton>
                <ToggleButton value="decrease" sx={{ px: 2, textTransform: "none" }}>
                  Decrease
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          </Box>

          {/* Quantity */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              Quantity
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                size="small"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
              <TextField
                size="small"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                inputProps={{ min: 1, style: { textAlign: "center", width: 80 } }}
              />
              <IconButton size="small" onClick={() => setQuantity((q) => q + 1)}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Note */}
          <TextField
            label="Note (optional)"
            size="small"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            minRows={2}
          />

          {/* Live preview */}
          {product && (
            <Box sx={{
              p: 2,
              border: 1,
              borderColor: wouldGoNegative ? "error.main" : "divider",
              borderRadius: 1,
              bgcolor: wouldGoNegative ? "error.light" : "grey.50",
            }}>
              <Typography variant="body2" fontWeight={600}
                color={wouldGoNegative ? "error.main" : "text.primary"}>
                {product.stock_quantity} → {projected}
              </Typography>
              {wouldGoNegative && (
                <Typography variant="caption" color="error.main">
                  Insufficient stock — you can deduct at most {product.stock_quantity}
                </Typography>
              )}
            </Box>
          )}

          {/* Backend error */}
          {errorMessage && (
            <Alert severity="error" onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}

          {/* Actions */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button
              onClick={() => navigate("/pos/manage/inventory")}
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={!canSubmit}
              onClick={handleSubmit}
              sx={{ textTransform: "none", minWidth: 120 }}
            >
              {mutation.isPending ? <CircularProgress size={18} color="inherit" /> : "Confirm"}
            </Button>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ width: "100%" }}>
          {success && `${success.productName} stock updated: ${success.before} → ${success.after}`}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default AdjustStockScreen
