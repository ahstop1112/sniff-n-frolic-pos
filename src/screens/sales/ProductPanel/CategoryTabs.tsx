import Skeleton from "@mui/material/Skeleton"
import styles from "./CategoryTabs.module.scss"

interface Category {
  slug: string
  name: string
}

interface CategoryTabsProps {
  categories: Category[]
  activeId: string | null
  onChange: (id: string | null) => void
  isLoading?: boolean
}

const CategoryTabs = ({
  categories,
  activeId,
  onChange,
  isLoading,
}: CategoryTabsProps) => {
  if (isLoading) {
    return (
      <div className={styles.skeletonRow}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={72} height={32} />
        ))}
      </div>
    )
  }

  if (categories.length === 0) return null

  return (
    <div className={styles.strip}>
      <button
        type="button"
        className={`${styles.chip} ${activeId === null ? styles.active : ""}`}
        onClick={() => onChange(null)}
      >
        All
      </button>
      {categories.map((c) => {
        const active = activeId === c.slug
        return (
          <button
            key={c.slug}
            type="button"
            className={`${styles.chip} ${active ? styles.active : ""}`}
            onClick={() => onChange(c.slug)}
          >
            {c.name}
          </button>
        )
      })}
    </div>
  )
}

export default CategoryTabs
