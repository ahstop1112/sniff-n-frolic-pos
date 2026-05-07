import { useState } from "react"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import Divider from "@mui/material/Divider"
import Stack from "@mui/material/Stack"
import AddIcon from "@mui/icons-material/Add"
import CloseIcon from "@mui/icons-material/Close"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import RemoveIcon from "@mui/icons-material/Remove"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import { useOrders } from "@/domains/orders/useOrders"
import { useQueryClient } from "@tanstack/react-query"
import { PaymentModal } from "../Payment"
import type { CartPanelProps } from "./types"
import styles from "./CartPanel.module.scss"

const formatMoney = (value: number, currency: "CAD" | "HKD" | "USD") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value)

export const CartPanel = ({ currency = "CAD", onPay }: CartPanelProps) => {
  const {
    orders,
    activeOrderId,
    activeOrder,
    activeSubtotal,
    createOrder,
    clearOrder,
    setActiveOrder,
    closeOrderTab,
    incLineQty,
    decLineQty,
    removeLine,
  } = useOrders()

  const [paymentOpen, setPaymentOpen] = useState(false);

  const queryClient = useQueryClient()


  // Empty state
  if (!activeOrder) {
    return (
      <div className={styles.root}>
        <div className={styles.tabsRow}>
          <Typography variant="subtitle1">Cart</Typography>
        </div>
        <div className={styles.linesArea}>
          <Typography variant="body2" color="text.secondary">
            No active order.
          </Typography>
          <Button startIcon={<AddIcon />} variant="contained" onClick={createOrder}>
            Create Order
          </Button>
        </div>
      </div>
    )
  }

  const hasLines = activeOrder.lines.length > 0

  return (
    <div className={styles.root}>

      {/* Tabs */}
      <div className={styles.orderTabs}>
        {orders.map((o) => (
          <div
            key={o.id}
            className={`${styles.orderTab} ${o.id === activeOrderId ? styles.active : ""}`}
            onClick={() => setActiveOrder(o.id)}
          >
            <span>{o.label}</span>
            <button
              className={styles.orderTabClose}
              aria-label="close order"
              onClick={(e) => {
                e.stopPropagation()
                closeOrderTab(o.id)
              }}
            >
              <CloseIcon sx={{ fontSize: 14 }} />
            </button>
          </div>
        ))}

        {/* Add order */}
        <button
          className={styles.addOrderBtn}
          aria-label="new order"
          onClick={createOrder}
        >
          <AddIcon sx={{ fontSize: 16 }} />
        </button>
      </div>

      {/* Line items */}
      <div className={styles.linesArea}>
        {!hasLines ? (
          <Typography variant="body2" color="text.secondary">
            Cart is empty. Tap a product to add.
          </Typography>
        ) : (
          activeOrder.lines.map((l) => (
            <div key={l.id} className={styles.lineRow}>
              <div className={styles.lineLeft}>
                <Typography variant="subtitle2" noWrap>{l.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatMoney(l.unitPrice, currency)} × {l.qty}
                </Typography>
              </div>
              <div className={styles.lineRight}>
                <IconButton size="small" aria-label="decrease qty"
                  onClick={() => decLineQty({ orderId: activeOrder.id, lineId: l.id })}>
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Typography variant="subtitle2">{l.qty}</Typography>
                <IconButton size="small" aria-label="increase qty"
                  onClick={() => incLineQty({ orderId: activeOrder.id, lineId: l.id })}>
                  <AddCircleOutlineIcon fontSize="small" />
                </IconButton>
                <Divider orientation="vertical" flexItem />
                <IconButton size="small" aria-label="remove line"
                  onClick={() => removeLine({ orderId: activeOrder.id, lineId: l.id })}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className={styles.summaryBar}>
        <div className={styles.summaryRow}>
          <Typography variant="body2" color="text.secondary">Subtotal</Typography>
          <Typography variant="body2">{formatMoney(activeSubtotal, currency)}</Typography>
        </div>

        <Divider />

        <div className={styles.summaryRow}>
          <Typography variant="subtitle1">Total</Typography>
          <Typography variant="subtitle1">{formatMoney(activeSubtotal, currency)}</Typography>
        </div>

        <div className={styles.actionsRow}>
          <Button variant="contained" fullWidth
            onClick={() => setPaymentOpen(true)} disabled={!hasLines}>
            Pay
          </Button>
          <Button variant="outlined" fullWidth
            onClick={() => clearOrder(activeOrder.id)}
            disabled={!hasLines}>
            Clear
          </Button>
        </div>
        <PaymentModal
          orderId={activeOrder.id}
          open={paymentOpen}
          total={activeSubtotal * 100}  // convert to cents
          lines={activeOrder.lines}
          onClose={() => setPaymentOpen(false)}
          onComplete={() => {
            setPaymentOpen(false)
            clearOrder(activeOrder.id)
            queryClient.invalidateQueries({ queryKey: ["daily-summary"] })
          }}
        />
      </div>

    </div>
  )
}

export default CartPanel