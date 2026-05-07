import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Divider from "@mui/material/Divider"
import Typography from "@mui/material/Typography"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import PrintIcon from "@mui/icons-material/Print"
import type { CartLine } from "@/domains/orders/types"

interface OrderCompleteProps {
  lines: CartLine[]
  total: number
  received: number
  change: number
  onPrint: () => void
  onDone: () => void
}

const formatMoney = (cents: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "CAD",
  }).format(cents / 100)

export const OrderComplete = ({
  lines,
  total,
  received,
  change,
  onPrint,
  onDone,
}: OrderCompleteProps) => (
  <Box sx={{ p: 3 }}>
    {/* Success */}
    <Box sx={{ textAlign: "center", mb: 3 }}>
      <CheckCircleIcon sx={{ fontSize: 64, color: "success.main", mb: 1 }} />
      <Typography variant="h5" fontWeight={900}>Payment Complete</Typography>
    </Box>

    {/* Items */}
    <Box sx={{ mb: 2 }}>
      {lines.map((l) => (
        <Box key={l.id} sx={{
          display: "flex", justifyContent: "space-between",
          py: 0.75, borderBottom: 1, borderColor: "divider"
        }}>
          <Box>
            <Typography variant="body2" fontWeight={500}>{l.name}</Typography>
            <Typography variant="caption" color="text.secondary">× {l.qty}</Typography>
          </Box>
          <Typography variant="body2" fontWeight={700}>
            {formatMoney(l.unitPrice * l.qty * 100)}
          </Typography>
        </Box>
      ))}
    </Box>

    {/* Summary */}
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">Total</Typography>
        <Typography variant="body2" fontWeight={700}>{formatMoney(total)}</Typography>
      </Box>
      {received > total && (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">Received</Typography>
            <Typography variant="body2">{formatMoney(received)}</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="subtitle1" fontWeight={700}>Change</Typography>
            <Typography variant="subtitle1" fontWeight={900} color="success.main">
              {formatMoney(change)}
            </Typography>
          </Box>
        </>
      )}
    </Box>

    {/* Actions */}
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Button
        variant="outlined"
        fullWidth
        size="large"
        startIcon={<PrintIcon />}
        onClick={onPrint}
        sx={{ borderRadius: 3, textTransform: "none", fontWeight: 700 }}
      >
        Print Receipt
      </Button>
      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={onDone}
        sx={{ borderRadius: 3, textTransform: "none", fontWeight: 800 }}
      >
        Done — New Order
      </Button>
    </Box>
  </Box>
)