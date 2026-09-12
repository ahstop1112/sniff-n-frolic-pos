import type { HubCategory, HubProduct } from "../hooks/useInventoryHub"
import InventoryProductCard from "./InventoryProductCard"
import styles from "./CategorySection.module.scss"

interface CategorySectionProps {
  category: HubCategory
  products: HubProduct[]
  isLoading: boolean
  isError: boolean
  onViewAll?: (category: HubCategory) => void
  onProductClick?: (product: HubProduct) => void
  skeletonCount?: number
}

const CategorySection = ({
  category,
  products,
  isLoading,
  isError,
  onViewAll,
  onProductClick,
  skeletonCount = 4,
}: CategorySectionProps) => {
  return (
    <section className={styles.section}>
      <header className={styles.head}>
        <div className={styles.titleWrap}>
          <span className={styles.title}>{category.name}</span>
          {!isLoading && !isError && (
            <span className={styles.count}>{products.length} items</span>
          )}
        </div>
        {onViewAll && (
          <button type="button" className={styles.viewAll} onClick={() => onViewAll(category)}>
            View all
          </button>
        )}
      </header>

      {isError && (
        <div className={styles.empty}>Couldn&apos;t load {category.name.toLowerCase()}.</div>
      )}

      {!isError && isLoading && (
        <div className={styles.grid}>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      )}

      {!isError && !isLoading && products.length === 0 && (
        <div className={styles.empty}>No items in {category.name} yet.</div>
      )}

      {!isError && !isLoading && products.length > 0 && (
        <div className={styles.grid}>
          {products.map((p) => (
            <InventoryProductCard key={p.id} product={p} onClick={onProductClick} />
          ))}
        </div>
      )}
    </section>
  )
}

export default CategorySection
