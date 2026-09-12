import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import type { Order } from "@/domains/orders/api/ordersApi"

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 2,
  }).format(cents / 100)

const statusColor = (status: string): "default" | "primary" | "success" | "warning" | "error" => {
  switch (status) {
    case "completed":
      return "success"
    case "processing":
      return "primary"
    case "pending":
      return "warning"
    case "cancelled":
      return "error"
    default:
      return "default"
  }
}

interface OrdersTableProps {
  orders: Order[]
  onOrderClick: (id: string) => void
}

const OrdersTable = ({ orders, onOrderClick }: OrdersTableProps) => {
  if (orders.length === 0) return null

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "120px 1fr 160px 120px 120px 120px",
          gap: 2,
          px: 2,
          py: 1.5,
          borderBottom: 2,
          borderColor: "divider",
          fontWeight: 600,
          fontSize: "0.875rem",
          color: "text.secondary",
        }}
      >
        <span>Date</span>
        <span>Customer</span>
        <span>Order #</span>
        <span>Total</span>
        <span>Source</span>
        <span>Status</span>
      </Box>

      {/* Rows */}
      {orders.map((order) => (
        <Box
          key={order.id}
          onClick={() => onOrderClick(order.id)}
          sx={{
            display: "grid",
            gridTemplateColumns: "120px 1fr 160px 120px 120px 120px",
            gap: 2,
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: "divider",
            alignItems: "center",
            cursor: "pointer",
            transition: "background-color 0.2s",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          <span style={{ fontSize: "0.875rem" }}>{formatDate(order.created_at)}</span>
          <span>{order.customer_name || "—"}</span>
          <code style={{ fontSize: "0.813rem", fontWeight: 500 }}>{order.order_number}</code>
          <span style={{ fontWeight: 500 }}>{formatCurrency(order.total)}</span>
          <span style={{ fontSize: "0.875rem", textTransform: "uppercase", color: "text.secondary" }}>
            {order.source}
          </span>
          <Chip
            label={order.status}
            size="small"
            color={statusColor(order.status)}
            variant="filled"
          />
        </Box>
      ))}
    </Box>
  )
}

export default OrdersTable
