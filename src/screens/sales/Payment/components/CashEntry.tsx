import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Divider from "@mui/material/Divider"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { CAD_DENOMINATIONS } from "../types"

interface CashEntryProps {
  total: number
  denominations: Record<string, number>
  received: number
  change: number
  canConfirm: boolean
  onUpdate: (value: number, count: number) => void
  onConfirm: () => void
  onBack: () => void
}

const formatMoney = (cents: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "CAD",
  }).format(cents / 100)

export const CashEntry = ({
  total,
  denominations,
  received,
  change,
  canConfirm,
  onUpdate,
  onConfirm,
  onBack,
}: CashEntryProps) => {
  const bills = CAD_DENOMINATIONS.filter((d) => d.type === "bill")
  const coins = CAD_DENOMINATIONS.filter((d) => d.type === "coin")

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <IconButton onClick={onBack} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={800}>Cash Payment</Typography>
      </Box>

      {/* Total */}
      <Box sx={{
        p: 2, mb: 3, borderRadius: 2,
        bgcolor: "grey.50", textAlign: "center"
      }}>
        <Typography variant="body2" color="text.secondary">Amount Due</Typography>
        <Typography variant="h4" fontWeight={900} color="primary">
          {formatMoney(total)}
        </Typography>
      </Box>

      {/* Bills */}
      <Typography variant="caption" color="text.secondary" fontWeight={700}
        sx={{ letterSpacing: "0.08em" }}>
        BILLS
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1, mt: 1, mb: 2 }}>
        {bills.map((d) => (
          <DenomControl
            key={d.value}
            label={d.label}
            count={denominations[d.value] ?? 0}
            onInc={() => onUpdate(d.value, (denominations[d.value] ?? 0) + 1)}
            onDec={() => onUpdate(d.value, (denominations[d.value] ?? 0) - 1)}
          />
        ))}
      </Box>

      {/* Coins */}
      <Typography variant="caption" color="text.secondary" fontWeight={700}
        sx={{ letterSpacing: "0.08em" }}>
        COINS
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1, mt: 1, mb: 3 }}>
        {coins.map((d) => (
          <DenomControl
            key={d.value}
            label={d.label}
            count={denominations[d.value] ?? 0}
            onInc={() => onUpdate(d.value, (denominations[d.value] ?? 0) + 1)}
            onDec={() => onUpdate(d.value, (denominations[d.value] ?? 0) - 1)}
          />
        ))}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Received + Change */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="body2" color="text.secondary">Received</Typography>
        <Typography variant="body2" fontWeight={700}>{formatMoney(received)}</Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={700}>Change</Typography>
        <Typography variant="subtitle1" fontWeight={900}
          color={canConfirm ? "success.main" : "text.disabled"}>
          {formatMoney(change)}
        </Typography>
      </Box>

      {/* Confirm */}
      <Button
        variant="contained"
        fullWidth
        size="large"
        disabled={!canConfirm}
        onClick={onConfirm}
        sx={{ borderRadius: 3, py: 1.5, fontWeight: 800, fontSize: 16, textTransform: "none" }}
      >
        Confirm Cash — {formatMoney(received)}
      </Button>
    </Box>
  )
}

// Sub-component
const DenomControl = ({
  label, count, onInc, onDec,
}: {
  label: string
  count: number
  onInc: () => void
  onDec: () => void
}) => (
  <Box sx={{
    border: 1, borderColor: count > 0 ? "primary.main" : "divider",
    borderRadius: 2, p: 1.5,    // ← p: 1 改做 p: 1.5
    textAlign: "center",
    bgcolor: count > 0 ? "primary.50" : "transparent",
    transition: "all 0.15s",
    cursor: "pointer",
  }}>
    <Typography variant="caption" fontWeight={700} display="block">{label}</Typography>
    <Typography variant="subtitle2" fontWeight={900} color="primary">{count}</Typography>
    <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5, mt: 0.5 }}>
      <IconButton size="small" onClick={onDec} disabled={count === 0}
        sx={{ width: 28, height: 28 }}>
        <RemoveIcon sx={{ fontSize: 12 }} />
      </IconButton>
      <IconButton size="small" onClick={onInc}
        sx={{ width: 28, height: 28 }}>
        <AddIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  </Box>
)