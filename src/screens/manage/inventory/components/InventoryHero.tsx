import Button from "@mui/material/Button"
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined"
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded"
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded"
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined"
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined"
import StockHealthBar from "./StockHealthBar"
import styles from "./InventoryHero.module.scss"

export type InventoryView = "grid" | "list"

interface InventoryHeroProps {
  totalSkus: number
  unitsOnHand: number | null
  lowCount: number
  outCount: number
  view: InventoryView
  onViewChange: (v: InventoryView) => void
  onRestockClick: () => void
  onMovementsClick?: () => void
  onExportClick?: () => void
}

const nf = new Intl.NumberFormat()

const InventoryHero = ({
  totalSkus,
  unitsOnHand,
  lowCount,
  outCount,
  view,
  onViewChange,
  onRestockClick,
  onMovementsClick,
  onExportClick,
}: InventoryHeroProps) => {
  return (
    <div className={styles.hero}>
      <div className={styles.topRow}>
        <div className={styles.brandBlock}>
          <div className={styles.iconChip}>
            <Inventory2OutlinedIcon />
          </div>
          <div className={styles.headings}>
            <span className={styles.eyebrow}>Inventory · Stock now</span>
            <span className={styles.title}>On the shelves</span>
            <div className={styles.statsRow}>
              <span className={styles.stat}>
                <strong>{nf.format(totalSkus)}</strong> SKUs
              </span>
              <span className={styles.statDivider}>·</span>
              <span className={styles.stat}>
                <strong>{unitsOnHand !== null ? nf.format(unitsOnHand) : "—"}</strong> units on hand
              </span>
              {(lowCount + outCount) > 0 && (
                <>
                  <span className={styles.statDivider}>·</span>
                  <span className={styles.stat}>
                    <strong>{nf.format(lowCount + outCount)}</strong> need attention
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles.actionsBlock}>
          <div className={styles.viewToggle} role="group" aria-label="Layout">
            <button
              type="button"
              className={`${styles.viewBtn} ${view === "grid" ? styles.viewBtnActive : ""}`}
              onClick={() => onViewChange("grid")}
              aria-pressed={view === "grid"}
            >
              <GridViewRoundedIcon /> Grid
            </button>
            <button
              type="button"
              className={`${styles.viewBtn} ${view === "list" ? styles.viewBtnActive : ""}`}
              onClick={() => onViewChange("list")}
              aria-pressed={view === "list"}
            >
              <ViewListRoundedIcon /> List
            </button>
          </div>

          {onMovementsClick && (
            <div className={styles.ghostBtn}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<HistoryOutlinedIcon />}
                onClick={onMovementsClick}
              >
                Movements
              </Button>
            </div>
          )}

          {onExportClick && (
            <div className={styles.ghostBtn}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FileDownloadOutlinedIcon />}
                onClick={onExportClick}
              >
                Export
              </Button>
            </div>
          )}

          <div className={styles.cta}>
            <Button variant="contained" color="primary" onClick={onRestockClick}>
              Stock adjustment
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.healthWrap}>
        <StockHealthBar total={totalSkus} lowCount={lowCount} outCount={outCount} />
      </div>
    </div>
  )
}

export default InventoryHero
