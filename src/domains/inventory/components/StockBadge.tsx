import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import CloseIcon from "@mui/icons-material/Close"

interface StockBadgeProps {
  quantity: number
  manageStock: boolean
  isLowStock: boolean
}

const StockBadge = ({ quantity, manageStock, isLowStock }: StockBadgeProps) => {
  if (!manageStock) {
    return (
      <Typography variant="body2" color="text.disabled">
        —
      </Typography>
    )
  }

  const outOfStock = quantity === 0
  const color = outOfStock ? "error.main" : isLowStock ? "warning.main" : "text.primary"
  const fontWeight = outOfStock || isLowStock ? 700 : 500

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
      <Typography variant="body2" color={color} fontWeight={fontWeight}>
        {quantity}
      </Typography>
      {outOfStock && <CloseIcon sx={{ fontSize: 16, color: "error.main" }} />}
      {!outOfStock && isLowStock && <WarningAmberIcon sx={{ fontSize: 16, color: "warning.main" }} />}
    </Box>
  )
}

export default StockBadge
