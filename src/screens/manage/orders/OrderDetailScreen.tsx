import { useParams, useNavigate } from "react-router-dom"
import Button from "@mui/material/Button"
import Skeleton from "@mui/material/Skeleton"
import Alert from "@mui/material/Alert"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined"
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined"
import MoneyOffOutlinedIcon from "@mui/icons-material/MoneyOffOutlined"
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined"
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined"
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined"
import { useQuery } from "@tanstack/react-query"
import { getOrder, type OrderEvent } from "@/domains/orders/api/ordersApi"
import styles from "./OrderDetailScreen.module.scss"

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
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

const getStatusPillColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "#F5C36A"
    case "processing":
      return "#8B9AC5"
    case "completed":
      return "#50C878"
    case "cancelled":
      return "#F07D6B"
    default:
      return "#999"
  }
}

const getStatusLabel = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const formatEventDescription = (event: OrderEvent): string => {
  const descriptions: Record<string, string> = {
    placed: `Order placed via ${event.detail.channel || 'unknown'}`,
    payment_captured: `Payment captured (${event.detail.method || 'unknown'})`,
    started_picking: `Started picking (${event.detail.item_count || 0} items)`,
    marked_ready: `Order marked as ready`,
    picked_up: `Order picked up from ${event.detail.location || 'store'}`,
    shipped: `Order shipped via ${event.detail.carrier || 'carrier'} (${event.detail.tracking || 'tracking TBA'})`,
    delivered: `Delivered${event.detail.signature_required ? ' (signature required)' : ''}`,
    cancelled: `Order cancelled (${event.detail.reason || 'no reason provided'})`,
  }

  return descriptions[event.event_type] || event.event_type
}

const StatusTimeline = ({ orderStatus }: { orderStatus: string }) => {
  const stages = [
    { id: "placed", label: "Placed" },
    { id: "paid", label: "Paid" },
    { id: "processing", label: "Processing" },
    { id: "ready", label: "Ready" },
    { id: "picked_up", label: "Picked up" },
  ]

  const getStageStatus = (stageId: string) => {
    const statusMap: Record<string, string[]> = {
      placed: ["pending", "processing", "completed", "cancelled"],
      paid: ["processing", "completed"],
      processing: ["processing", "completed"],
      ready: ["completed"],
      picked_up: ["completed"],
    }

    if (statusMap[stageId]?.includes(orderStatus.toLowerCase())) {
      return "completed"
    }
    if (stageId === orderStatus.toLowerCase()) {
      return "current"
    }
    return "future"
  }

  return (
    <div className={styles.timeline}>
      {stages.map((stage, idx) => {
        const stageStatus = getStageStatus(stage.id)
        return (
          <div key={stage.id} className={styles.timelineWrapper}>
            <div className={`${styles.timelineNode} ${styles[`node_${stageStatus}`]}`}>
              {stageStatus === "completed" ? (
                <CheckCircleOutlinedIcon sx={{ fontSize: "1.5rem" }} />
              ) : (
                <div className={styles.timelineCircle} />
              )}
            </div>
            <div className={styles.timelineLabel}>{stage.label}</div>
            {idx < stages.length - 1 && (
              <div className={`${styles.timelineConnector} ${styles[`connector_${stageStatus}`]}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

const OrderDetailScreen = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()

  const query = useQuery({
    queryKey: ["order-detail", orderId],
    queryFn: () => getOrder(orderId!),
    enabled: !!orderId,
  })

  if (query.isLoading) {
    return (
      <div className={styles.screen}>
        <div className={styles.topBar}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} />
          <div style={{ flex: 1 }}>
            <Skeleton width={200} height={32} />
          </div>
        </div>
        <div className={styles.body} style={{ display: "block" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height={60} style={{ marginBottom: 16 }} />
          ))}
        </div>
      </div>
    )
  }

  if (query.error) {
    return (
      <div className={styles.screen}>
        <div className={styles.topBar}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} />
        </div>
        <div className={styles.body}>
          <Alert severity="error">{(query.error as Error).message}</Alert>
        </div>
      </div>
    )
  }

  if (!query.data) {
    return (
      <div className={styles.screen}>
        <div className={styles.topBar}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} />
        </div>
        <div className={styles.body}>
          <Alert severity="warning">Order not found</Alert>
        </div>
      </div>
    )
  }

  const order = query.data

  return (
    <div className={styles.screen}>
      {/* ── Top bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <div className={styles.topBarLeft}>
            <button className={styles.backLink} onClick={() => navigate(-1)}>
              ← Orders
            </button>
            <div className={styles.orderHeaderRow}>
              <h1 className={styles.pageTitle}>{order.order_number}</h1>
              <div className={styles.actionButtonsRow}>
                <button className={styles.actionBtn} title="Packing slip">
                  <FileDownloadOutlinedIcon sx={{ fontSize: "1.25rem" }} />
                  <span>Packing slip</span>
                </button>
                <button className={styles.actionBtn} title="Duplicate">
                  <ContentCopyOutlinedIcon sx={{ fontSize: "1.25rem" }} />
                  <span>Duplicate</span>
                </button>
                <button className={styles.actionBtn} title="Refund">
                  <MoneyOffOutlinedIcon sx={{ fontSize: "1.25rem" }} />
                  <span>Refund</span>
                </button>
                <button className={styles.actionBtn} title="Notify customer">
                  <NotificationsOutlinedIcon sx={{ fontSize: "1.25rem" }} />
                  <span>Notify customer</span>
                </button>
              </div>
            </div>
            <span className={styles.pageSubtitle}>status & fulfillment</span>
          </div>
        </div>
      </div>

      {/* ── Product Header (Full Width) ── */}
      {order.items && order.items.length > 0 && (
        <div className={styles.productHeader}>
          <div className={styles.productThumbnailLarge}>
            <div className={styles.productThumbnailPlaceholder}>
              <ImageOutlinedIcon sx={{ fontSize: "2.5rem", opacity: 0.4 }} />
            </div>
          </div>
          <div className={styles.productInfo}>
            <h3 className={styles.productName}>{order.items[0].product_name}</h3>
            <p className={styles.productMeta}>
              {order.items.length} {order.items.length === 1 ? "item" : "items"} · SKU: {order.items[0].sku || "—"}
            </p>
            <div className={styles.statusBadgeGroup}>
              <span
                className={styles.statusBadge}
                style={{ background: getStatusPillColor(order.status) }}
              >
                {getStatusLabel(order.status)}
              </span>
              <span className={styles.dateText}>{formatDate(order.created_at)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Status Timeline (Full Width) ── */}
      <StatusTimeline orderStatus={order.status} />

      {/* ── Attention Banner (Full Width) ── */}
      {order.status.toLowerCase() !== "completed" && (
        <div className={styles.attentionBanner}>
          <div className={styles.attentionContent}>
            <strong>Order is ready for pickup!</strong> Customer hasn't been notified yet.
          </div>
          <button className={styles.attentionBtn}>Send Ready for pickup</button>
        </div>
      )}

      {/* ── Main + Sidebar ── */}
      <div className={styles.body}>
        {/* LEFT COLUMN */}
        <div className={styles.mainCol}>
          {/* Line items */}
          {order.items && order.items.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Line Items</h3>
                <span className={styles.itemCount}>
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                </span>
              </div>
              <div className={styles.itemsTable}>
                <div className={styles.itemsHeader}>
                  <span className={styles.colImage}>Image</span>
                  <span className={styles.colProduct}>Product</span>
                  <span className={styles.colSku}>SKU</span>
                  <span className={styles.colQty}>Qty</span>
                  <span className={styles.colPrice}>Unit Price</span>
                  <span className={styles.colTotal}>Line Total</span>
                </div>
                {order.items.map((item) => (
                  <div key={item.id} className={styles.itemRow}>
                    <div className={styles.colImage}>
                      <div className={styles.itemImagePlaceholder}>
                        <ImageOutlinedIcon sx={{ fontSize: "1.2rem", opacity: 0.5 }} />
                      </div>
                    </div>
                    <span className={styles.colProduct}>{item.product_name}</span>
                    <span className={`${styles.colSku} ${styles.muted}`}>{item.sku || "—"}</span>
                    <span className={styles.colQty}>{item.quantity}</span>
                    <span className={styles.colPrice}>{formatCurrency(item.unit_price)}</span>
                    <span className={`${styles.colTotal} ${styles.bold}`}>
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totals */}
          <div className={styles.card}>
            <div className={styles.totalsBlock}>
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className={styles.totalRow}>
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className={styles.totalRow}>
                <span>Tax</span>
                <span>—</span>
              </div>
              <div className={styles.totalRowFinal}>
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Activity log */}
          {order.events && order.events.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>Activity</div>
              <div className={styles.activityLog}>
                {[...order.events]
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((event) => (
                    <div key={event.id} className={styles.activityItem}>
                      <div className={styles.activityTime}>
                        {new Date(event.created_at).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className={styles.activityDot} />
                      <div className={styles.activityContent}>
                        <div className={styles.activityDescription}>
                          {formatEventDescription(event)}
                        </div>
                        <div className={styles.activityActor}>{event.actor}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.sideCol}>
          {/* Customer card */}
          <div className={`${styles.card} ${styles.customerCardWrapper}`}>
            <div className={styles.cardTitle}>Customer</div>
            <div className={styles.customerCard}>
              <div className={styles.customerInitials}>
                {order.customer_name
                  ? order.customer_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "G"}
              </div>
              <div className={styles.customerInfo}>
                <div className={styles.customerName}>{order.customer_name || "Guest"}</div>
              </div>
            </div>
            {order.member_id && (
              <div className={styles.memberBadge}>Member</div>
            )}
            {order.guest_email && (
              <div className={styles.contactRow}>
                <span className={styles.contactLabel}>Email</span>
                <span className={styles.contactValue}>{order.guest_email}</span>
              </div>
            )}
            <a href="#" className={styles.viewProfileLink}>
              View full profile
            </a>
          </div>

          {/* Fulfillment card */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Fulfillment</div>
            <div className={styles.fulfillmentContent}>
              <div className={styles.fulfillmentStatus}>
                <strong>{getStatusLabel(order.status)}</strong>
              </div>
            </div>
          </div>

          {/* Customer Notes */}
          {order.notes && (
            <div className={`${styles.card} ${styles.notesCard}`}>
              <div className={styles.cardTitle}>Customer Notes</div>
              <div className={styles.notesContent}>{order.notes}</div>
            </div>
          )}

          {/* Internal Notes (placeholder for future) */}
          <div className={`${styles.card} ${styles.internalNotesCard}`}>
            <div className={styles.cardTitle}>Internal Notes</div>
            <div className={styles.notesContent}>No internal notes</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailScreen
