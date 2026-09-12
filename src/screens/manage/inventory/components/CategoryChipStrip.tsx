import type { HubCategory } from "../hooks/useInventoryHub"
import styles from "./CategoryChipStrip.module.scss"

interface CategoryChipStripProps {
  categories: HubCategory[]
  activeSlug: string | null
  onChange: (slug: string | null) => void
}

const CategoryChipStrip = ({ categories, activeSlug, onChange }: CategoryChipStripProps) => (
  <div className={styles.strip}>
    <button
      type="button"
      className={`${styles.chip} ${activeSlug === null ? styles.chipActive : ""}`}
      onClick={() => onChange(null)}
    >
      All
    </button>
    {categories.map((c) => {
      const active = activeSlug === c.slug
      return (
        <button
          key={c.slug}
          type="button"
          className={`${styles.chip} ${active ? styles.chipActive : ""}`}
          onClick={() => onChange(c.slug)}
        >
          {c.name}
        </button>
      )
    })}
  </div>
)

export default CategoryChipStrip
