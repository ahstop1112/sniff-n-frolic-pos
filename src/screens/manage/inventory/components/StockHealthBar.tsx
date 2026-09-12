import styles from "./StockHealthBar.module.scss"

interface StockHealthBarProps {
  total: number
  lowCount: number
  outCount: number
}

const StockHealthBar = ({ total, lowCount, outCount }: StockHealthBarProps) => {
  const safeTotal = Math.max(total, 1)
  const healthyCount = Math.max(total - lowCount - outCount, 0)
  const healthyPct = (healthyCount / safeTotal) * 100
  const lowPct = (lowCount / safeTotal) * 100
  const outPct = (outCount / safeTotal) * 100
  const healthyRounded = Math.round(healthyPct)

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <span className={styles.title}>Stock health</span>
        <div className={styles.summary}>
          <strong>{healthyRounded}%</strong>
          <span>ready to sell</span>
        </div>
      </div>

      <div className={styles.bar} role="img" aria-label={`${healthyRounded}% of items ready to sell`}>
        {healthyPct > 0 && <div className={styles.segHealthy} style={{ width: `${healthyPct}%` }} />}
        {lowPct     > 0 && <div className={styles.segLow}     style={{ width: `${lowPct}%` }} />}
        {outPct     > 0 && <div className={styles.segOut}     style={{ width: `${outPct}%` }} />}
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.dot} style={{ backgroundColor: "#6EE7A7" }} />
          <strong>{healthyCount.toLocaleString()}</strong> healthy
        </span>
        <span className={styles.legendItem}>
          <span className={styles.dot} style={{ backgroundColor: "#F5C36A" }} />
          <strong>{lowCount.toLocaleString()}</strong> low
        </span>
        <span className={styles.legendItem}>
          <span className={styles.dot} style={{ backgroundColor: "#F07D6B" }} />
          <strong>{outCount.toLocaleString()}</strong> out
        </span>
      </div>
    </div>
  )
}

export default StockHealthBar
