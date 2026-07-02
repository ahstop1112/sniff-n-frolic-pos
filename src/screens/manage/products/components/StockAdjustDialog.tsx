import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup"
import ToggleButton from "@mui/material/ToggleButton"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"

interface StockAdjustDialogProps {
  open: boolean
  onClose: () => void
  productId: string
  productName: string
  currentQty: number
  currentStatus: "instock" | "outofstock" | string
}

const getToken = () => localStorage.getItem("snf_pos_access_token")

const updateStock = async (id: string, qty: number, status: string) => {
  const res = await fetch(`/api/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ stock_quantity: qty, stock_status: status }),
  })
  if (!res.ok) throw new Error("Failed to update stock")
  return res.json()
}

const StockAdjustDialog = ({
  open,
  onClose,
  productId,
  productName,
  currentQty,
  currentStatus,
}: StockAdjustDialogProps) => {
  const queryClient = useQueryClient()
  const [qty, setQty]       = useState(currentQty)
  const [status, setStatus] = useState<"instock" | "outofstock">(
    currentStatus === "instock" ? "instock" : "outofstock"
  )

  const mutation = useMutation({
    mutationFn: () => updateStock(productId, qty, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manage-products"] })
      onClose()
    },
  })

  const handleClose = () => {
    if (mutation.isPending) return
    setQty(currentQty)
    setStatus(currentStatus === "instock" ? "instock" : "outofstock")
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Adjust Stock</DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2 }}>
        <Typography variant="body2" color="text.secondary" noWrap>
          {productName}
        </Typography>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
            Quantity
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setQty((q) => Math.max(0, q - 1))}
              sx={{ minWidth: 36, px: 0 }}
            >
              –
            </Button>
            <TextField
              size="small"
              type="number"
              value={qty}
              onChange={(e) => setQty(Math.max(0, Number(e.target.value)))}
              inputProps={{ min: 0, style: { textAlign: "center", width: 64 } }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => setQty((q) => q + 1)}
              sx={{ minWidth: 36, px: 0 }}
            >
              +
            </Button>
          </Box>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
            Stock status
          </Typography>
          <ToggleButtonGroup
            exclusive
            value={status}
            onChange={(_, v) => { if (v) setStatus(v as "instock" | "outofstock") }}
            size="small"
          >
            <ToggleButton value="instock"    sx={{ px: 2, textTransform: "none" }}>In stock</ToggleButton>
            <ToggleButton value="outofstock" sx={{ px: 2, textTransform: "none" }}>Out of stock</ToggleButton>
          </ToggleButtonGroup>
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
          disabled={mutation.isPending}
          sx={{ textTransform: "none", minWidth: 80 }}
        >
          {mutation.isPending ? <CircularProgress size={18} color="inherit" /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default StockAdjustDialog
