import { useNavigate } from "react-router-dom"
import PetsIcon from "@mui/icons-material/Pets"
import type { CatalogueProduct } from "../hooks/useProductsHub"
import styles from "./ProductCatalogueCard.module.scss"

const statusLabel = (status: string) => {
  if (status === "published") return "Active"
  if (status === "draft") return "Draft"
  if (status === "archived") return "Archived"
  return status
}

const statusCls = (status: string, s: typeof styles) => {
  if (status === "published") return s.statusPublished
  if (status === "draft") return s.statusDraft
  if (status === "archived") return s.statusArchived
  return ""
}

const formatPrice = (cents: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 2,
  }).format(cents / 100)

interface ProductCatalogueCardProps {
  product: CatalogueProduct
}

const ProductCatalogueCard = ({ product }: ProductCatalogueCardProps) => {
  const navigate = useNavigate()
  const category = product.category_names[0] ?? null
  const stockOut = product.stock_quantity <= 0
  const stockLow = !stockOut && product.stock_quantity <= 5

  return (
    <div
      role="button"
      tabIndex={0}
      className={styles.card}
      onClick={() => navigate(`/pos/manage/products/${product.slug}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ")
          navigate(`/pos/manage/products/${product.slug}`)
      }}
    >
      <div className={styles.topMeta}>
        <span className={`${styles.statusBadge} ${statusCls(product.status, styles)}`}>
          {statusLabel(product.status)}
        </span>
      </div>

      {category && <span className={styles.categoryTag}>{category}</span>}

      <div className={styles.imageWrap}>
        {product.featured_image_url ? (
          <img src={product.featured_image_url} alt={product.name} />
        ) : (
          <PetsIcon />
        )}
      </div>

      <div className={styles.name} title={product.name}>
        {product.name}
      </div>
      {product.sku && <div className={styles.sku}>SKU · {product.sku}</div>}

      <div className={styles.footerRow}>
        <span className={styles.price}>{formatPrice(product.effective_price)}</span>
        <span
          className={`${styles.stockCount} ${stockOut ? styles.stockOut : ""} ${stockLow ? styles.stockLow : ""}`}
        >
          {product.stock_quantity}
        </span>
      </div>
    </div>
  )
}

export default ProductCatalogueCard
