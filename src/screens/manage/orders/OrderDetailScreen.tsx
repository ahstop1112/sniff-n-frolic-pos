import { useParams, useNavigate } from "react-router-dom"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"
import Skeleton from "@mui/material/Skeleton"
import Alert from "@mui/material/Alert"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { useQuery } from "@tanstack/react-query"
import { getOrder } from "@/domains/orders/api/ordersApi"
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
      <div className={styles.root}>
        <div className={styles.header}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} />
          <div>
            <Skeleton width={200} height={32} />
          </div>
        </div>
        <div className={styles.content}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={40} style={{ marginBottom: 16 }} />
          ))}
        </div>
      </div>
    )
  }

  if (query.error) {
    return (
      <div className={styles.root}>
        <div className={styles.header}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} />
        </div>
        <div className={styles.content}>
          <Alert severity="error">{(query.error as Error).message}</Alert>
        </div>
      </div>
    )
  }

  if (!query.data) {
    return (
      <div className={styles.root}>
        <div className={styles.header}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} />
        </div>
        <div className={styles.content}>
          <Alert severity="warning">Order not found</Alert>
        </div>
      </div>
    )
  }

  const order = query.data

  return (
    <div className={styles.root}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      {/* ── Content ── */}
      <div className={styles.content}>
        {/* Order info card */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {order.order_number}
            </Typography>
            <div className={styles.infoGrid}>
              <div>
                <Typography variant="caption" display="block" color="textSecondary">
                  Date
                </Typography>
                <Typography variant="body2">{formatDate(order.created_at)}</Typography>
              </div>
              <div>
                <Typography variant="caption" display="block" color="textSecondary">
                  Customer
                </Typography>
                <Typography variant="body2">{order.customer_name || "Guest"}</Typography>
              </div>
              <div>
                <Typography variant="caption" display="block" color="textSecondary">
                  Source
                </Typography>
                <Typography variant="body2" sx={{ textTransform: "uppercase" }}>
                  {order.source}
                </Typography>
              </div>
              <div>
                <Typography variant="caption" display="block" color="textSecondary">
                  Status
                </Typography>
                <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                  {order.status}
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line items */}
        {order.items && order.items.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Items
              </Typography>
              <div className={styles.itemsTable}>
                <div className={styles.itemsHeader}>
                  <span>Product</span>
                  <span>SKU</span>
                  <span>Qty</span>
                  <span>Unit Price</span>
                  <span>Subtotal</span>
                </div>
                {order.items.map((item) => (
                  <div key={item.id} className={styles.itemRow}>
                    <span>{item.product_name}</span>
                    <span className={styles.muted}>{item.sku || "—"}</span>
                    <span>{item.quantity}</span>
                    <span>{formatCurrency(item.unit_price)}</span>
                    <span className={styles.bold}>{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Totals */}
        <Card>
          <CardContent>
            <div className={styles.totalsGrid}>
              <div className={styles.totalRow}>
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className={styles.totalRow}>
                  <span>Discount:</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className={`${styles.totalRow} ${styles.totalRowFinal}`}>
                <span>Total:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping info */}
        {order.shipping_address && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Shipping Address
              </Typography>
              <Typography variant="body2">
                {order.shipping_address.line1}
                {order.shipping_address.line2 && (
                  <>
                    <br />
                    {order.shipping_address.line2}
                  </>
                )}
                <br />
                {order.shipping_address.city}, {order.shipping_address.province}{" "}
                {order.shipping_address.postal_code}
                <br />
                {order.shipping_address.country}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {order.notes && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Notes
              </Typography>
              <Typography variant="body2">{order.notes}</Typography>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default OrderDetailScreen
