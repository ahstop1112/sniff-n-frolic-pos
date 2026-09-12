import PetsIcon from "@mui/icons-material/Pets"
import type { HubProduct } from "../hooks/useInventoryHub"
import styles from "./InventoryProductCard.module.scss"

interface InventoryProductCardProps {
  product: HubProduct
  currency?: string
  onClick?: (product: HubProduct) => void
}

const formatPrice = (cents: number | null, currency: string) => {
  if (cents === null || Number.isNaN(cents)) return "—"
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(cents / 100)
}

type StockKind = "healthy" | "low" | "out"

const stockKindFor = (p: HubProduct): StockKind => {
  if (p.stock_status === "outofstock") return "out"
  if (p.stock_quantity === 0 && p.stock_status !== "instock") return "out"
  if (p.is_low_stock) return "low"
  return "healthy"
}

const stripeClass = {
  healthy: "stripeHealthy",
  low: "stripeLow",
  out: "stripeOut",
} as const

const badgeClass = {
  healthy: "badgeHealthy",
  low: "badgeLow",
  out: "badgeOut",
} as const

const badgeLabel = {
  healthy: "In stock",
  low: "Low",
  out: "Out",
} as const

const InventoryProductCard = ({
  product,
  currency = "CAD",
  onClick,
}: InventoryProductCardProps) => {
  const kind = stockKindFor(product)
  const priceCents = product.effective_price ?? product.regular_price
  const priceLabel = formatPrice(priceCents, currency)

  return (
    <div
      role="button"
      tabIndex={0}
      className={styles.card}
      onClick={() => onClick?.(product)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.(product) }}
    >
      <div className={`${styles.statusStripe} ${styles[stripeClass[kind]]}`} />
      <span className={`${styles.badge} ${styles[badgeClass[kind]]}`}>{badgeLabel[kind]}</span>

      <div className={styles.imageWrap}>
        {product.image_url
          ? <img src={product.image_url} alt={product.name} />
          : <PetsIcon />
        }
      </div>

      <div className={styles.name} title={product.name}>{product.name}</div>
      {product.sku && <div className={styles.sku}>SKU · {product.sku}</div>}

      <div className={styles.footerRow}>
        <span className={styles.price}>{priceLabel}</span>
        <span className={`
          ${styles.stockCount}
          ${kind === "low" ? styles.stockCountLow : ""}
          ${kind === "out" ? styles.stockCountOut : ""}
        `}>
          {product.stock_quantity > 0
            ? `${product.stock_quantity} on hand`
            : kind === "out" ? "0 on hand" : "In stock"}
        </span>
      </div>
    </div>
  )
}

export default InventoryProductCard
