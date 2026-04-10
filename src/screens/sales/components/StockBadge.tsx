import Chip from "@mui/material/Chip"

interface StockBadgeProps {
  quantity: number
}

const StockBadge = ({ quantity }: StockBadgeProps) => {
  if (quantity > 10) return null // plenty in stock, no badge needed

  const color = quantity === 0 ? "error" : quantity <= 3 ? "warning" : "default"
  const label = quantity === 0 ? "Out of stock" : `${quantity} left`

  return <Chip label={label} color={color} size="small" />
}

export default StockBadge