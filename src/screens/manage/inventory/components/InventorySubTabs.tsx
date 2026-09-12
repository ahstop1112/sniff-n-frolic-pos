import styles from "./InventorySubTabs.module.scss"

export interface SubTab {
  key: string
  label: string
  count?: number
  disabled?: boolean
  onClick?: () => void
}

interface InventorySubTabsProps {
  tabs: SubTab[]
  activeKey: string
}

const InventorySubTabs = ({ tabs, activeKey }: InventorySubTabsProps) => (
  <div className={styles.wrap} role="tablist" aria-label="Inventory sections">
    {tabs.map((t) => {
      const active = t.key === activeKey
      return (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={active}
          disabled={t.disabled}
          className={`${styles.tab} ${active ? styles.tabActive : ""}`}
          onClick={t.onClick}
        >
          {t.label}
          {typeof t.count === "number" && (
            <span className={styles.count}>{t.count.toLocaleString()}</span>
          )}
        </button>
      )
    })}
  </div>
)

export default InventorySubTabs
