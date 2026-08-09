import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import type { Product } from "@/domains/product/types/product.types"
import StockBadge from "./StockBadge"
import type { ProductPanelFlags } from "../hooks/useProductPanelFlags"
import styles from "./ProductCard.module.scss"

interface ProductCardProps {
  product: Product
  flags: ProductPanelFlags
  onAdd: (product: Product) => void
  onSelect: (product: Product) => void
  currency?: string
}

const ProductCard = ({
  product,
  flags,
  onAdd,
  onSelect,
  currency = "CAD",
}: ProductCardProps) => {
  const isOutOfStock = product.quantity === 0

  const displayPrice = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(product.salePrice ?? product.unitPrice)

  const regularPrice = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(product.unitPrice)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !isOutOfStock && onAdd(product)}
      className={`${styles.card} ${isOutOfStock ? styles.disabled : ""}`}
    >
      <button
        type="button"
        className={styles.infoBtn}
        onClick={(e) => { e.stopPropagation(); onSelect(product) }}
        aria-label="Product details"
      >
        <InfoOutlinedIcon />
      </button>

      {flags.showProductImage && (
        <div className={styles.imageWrap}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} />
          ) : null}
        </div>
      )}

      <div className={styles.name} title={product.name}>
        {product.name}
      </div>

      <div className={styles.priceRow}>
        <div className={styles.priceBlock}>
          <span className={styles.priceCurrent}>{displayPrice}</span>
          {product.salePrice && (
            <span className={styles.priceStrike}>{regularPrice}</span>
          )}
        </div>
        {flags.showStockBadge && <StockBadge quantity={product.quantity} />}
      </div>
    </div>
  )
}

export default ProductCard
