import { useMemo, useState } from "react"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import AddIcon from "@mui/icons-material/Add"
import CloseIcon from "@mui/icons-material/Close"
import RemoveIcon from "@mui/icons-material/Remove"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import PetsIcon from "@mui/icons-material/Pets"
import PersonOutlineIcon from "@mui/icons-material/PersonOutline"
import { useOrders } from "@/domains/orders/useOrders"
import { useQueryClient } from "@tanstack/react-query"
import { PaymentModal } from "../Payment"
import type { CartPanelProps } from "./types"
import styles from "./CartPanel.module.scss"

type PaymentMethod = "card" | "cash" | "points"

// Wireframe placeholder for the "attached member" flow. There's no member
// domain wired to the cart yet, so this is a static badge to preview the
// visual space. Replace when member-attach lands.
const PLACEHOLDER_MEMBER = { name: "Lily Tsai", initials: "LT" }

const formatMoney = (value: number, currency: "CAD" | "HKD" | "USD") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value)

const PAYMENT_OPTIONS: { id: PaymentMethod; name: string; sub: string }[] = [
  { id: "card",   name: "Card",   sub: "Tap or insert" },
  { id: "cash",   name: "Cash",   sub: "Count drawer" },
  { id: "points", name: "Points", sub: "Redeem member" },
]

export const CartPanel = ({ currency = "CAD" }: CartPanelProps) => {
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
  } = useOrders()

  const [paymentOpen, setPaymentOpen] = useState(false)
  const [method, setMethod] = useState<PaymentMethod>("card")
  const queryClient = useQueryClient()

  const taxRate = activeOrder?.taxRate ?? 0
  const tax = useMemo(() => activeSubtotal * taxRate, [activeSubtotal, taxRate])
  const total = activeSubtotal + tax
  const lineCount = activeOrder?.lines.reduce((n, l) => n + l.qty, 0) ?? 0
  const hasLines = (activeOrder?.lines.length ?? 0) > 0

  // Empty state — no active order at all
  if (!activeOrder) {
    return (
      <div className={styles.root}>
        <div className={styles.emptyState}>
          <Typography variant="body2">No active order.</Typography>
          <Button startIcon={<AddIcon />} variant="contained" onClick={createOrder}>
            Create Order
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.root}>

      {/* Multi-order tabs (compact) */}
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
              onClick={(e) => { e.stopPropagation(); closeOrderTab(o.id) }}
            >
              <CloseIcon sx={{ fontSize: 12 }} />
            </button>
          </div>
        ))}
        <button className={styles.addOrderBtn} aria-label="new order" onClick={createOrder}>
          <AddIcon sx={{ fontSize: 14 }} />
        </button>
      </div>

      {/* Member row */}
      <div className={styles.memberRow}>
        <div className={styles.memberBadge}>
          <div className={styles.memberAvatar}>{PLACEHOLDER_MEMBER.initials}</div>
          {PLACEHOLDER_MEMBER.name}
        </div>
        <div className={styles.memberActions}>
          <span className={styles.pointsPill}>
            <PetsIcon sx={{ fontSize: 12 }} />
            $1.40
          </span>
          <Button
            variant="text"
            size="small"
            onClick={() => clearOrder(activeOrder.id)}
            disabled={!hasLines}
            sx={{ textTransform: "none", color: "text.secondary" }}
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Order header */}
      <div className={styles.orderHeader}>
        <span className={styles.orderTitle}>Order · {lineCount} item{lineCount === 1 ? "" : "s"}</span>
        <span className={styles.orderTitle}>Totals</span>
      </div>

      {/* Line items */}
      <div className={styles.linesArea}>
        {!hasLines ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
            Cart is empty. Tap a product to add.
          </Typography>
        ) : (
          activeOrder.lines.map((l) => (
            <div key={l.id} className={styles.lineRow}>
              <div className={styles.lineImage}>
                {l.image
                  ? <img src={l.image} alt={l.name} />
                  : <PetsIcon sx={{ fontSize: 20, color: "text.disabled" }} />}
              </div>
              <div className={styles.lineText}>
                <div className={styles.lineName}>{l.name}</div>
                <div className={styles.lineNote}>
                  {formatMoney(l.unitPrice, currency)} each
                </div>
              </div>
              <div className={styles.lineQty}>
                <IconButton size="small" aria-label="decrease qty"
                  onClick={() => decLineQty({ orderId: activeOrder.id, lineId: l.id })}>
                  <RemoveIcon sx={{ fontSize: 14 }} />
                </IconButton>
                <span className={styles.qtyNum}>{l.qty}</span>
                <IconButton size="small" aria-label="increase qty"
                  onClick={() => incLineQty({ orderId: activeOrder.id, lineId: l.id })}>
                  <AddCircleOutlineIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </div>
              <div className={styles.linePrice}>
                {formatMoney(l.unitPrice * l.qty, currency)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      <div className={styles.totals}>
        <div className={styles.totalRow}>
          <span>Subtotal</span>
          <span>{formatMoney(activeSubtotal, currency)}</span>
        </div>
        <div className={styles.totalRow}>
          <span>Tax{taxRate > 0 ? ` (${(taxRate * 100).toFixed(0)}%)` : ""}</span>
          <span>{formatMoney(tax, currency)}</span>
        </div>
        <div className={`${styles.totalRow} ${styles.grand}`}>
          <span className="label">Total</span>
          <span className="value">{formatMoney(total, currency)}</span>
        </div>
      </div>

      {/* Payment method */}
      <div className={styles.paymentSection}>
        <div className={styles.paymentLabel}>Payment method</div>
        <div className={styles.paymentTabs}>
          {PAYMENT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className={`${styles.paymentTab} ${method === opt.id ? styles.active : ""}`}
              onClick={() => setMethod(opt.id)}
            >
              <span className="name">{opt.name}</span>
              <span className="sub">{opt.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Charge button */}
      <div className={styles.chargeArea}>
        <Button
          variant="contained"
          className={styles.chargeButton}
          disabled={!hasLines}
          onClick={() => setPaymentOpen(true)}
          startIcon={<PersonOutlineIcon />}
        >
          Charge {formatMoney(total, currency)}
        </Button>
      </div>

      <PaymentModal
        orderId={activeOrder.id}
        open={paymentOpen}
        total={total * 100}
        lines={activeOrder.lines}
        onClose={() => setPaymentOpen(false)}
        onComplete={() => {
          setPaymentOpen(false)
          clearOrder(activeOrder.id)
          queryClient.invalidateQueries({ queryKey: ["daily-summary"] })
        }}
      />
    </div>
  )
}

export default CartPanel
