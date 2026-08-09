import { useMemo, useState } from "react"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import Typography from "@mui/material/Typography"
import ToggleButton from "@mui/material/ToggleButton"
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup"
import SalesSummaryBar from "../Summary/SummaryBar"
import type { SalesLayoutProps } from "./types"
import styles from "./Layout.module.scss"

type MobileView = "products" | "cart"

const SalesLayout = ({ slots, className }: SalesLayoutProps) => {
  const theme = useTheme()
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"))

  const [mobileView, setMobileView] = useState<MobileView>("products")

  const productNode = useMemo(
    () => slots?.product ?? (
      <Typography variant="body2" color="text.secondary">
        Product browser slot
      </Typography>
    ),
    [slots?.product]
  )

  const cartNode = useMemo(
    () => slots?.cart ?? (
      <Typography variant="body2" color="text.secondary">
        Cart slot
      </Typography>
    ),
    [slots?.cart]
  )

  const handleMobileViewChange = (_: unknown, next: MobileView | null) => {
    if (!next) return
    setMobileView(next)
  }

  return (
    <div className={`${styles.root}${className ? ` ${className}` : ""}`}>
      {/* Header */}
      {slots?.header && (
        <div className={styles.headerArea}>
          {slots.header}
        </div>
      )}
      <SalesSummaryBar />
      <main className={styles.main}>

        {/* Mobile — toggle view */}
        {!isMdUp && (
          <div className={styles.panel}>
            <div className={styles.mobileSwitchBar}>
              <ToggleButtonGroup
                value={mobileView}
                exclusive
                onChange={handleMobileViewChange}
                size="small"
                fullWidth
              >
                <ToggleButton value="products">Products</ToggleButton>
                <ToggleButton value="cart">Cart</ToggleButton>
              </ToggleButtonGroup>
            </div>
            <div className={styles.panelBody}>
              {mobileView === "products" ? productNode : cartNode}
            </div>
          </div>
        )}

        {/* Desktop — side by side */}
        {isMdUp && (
          <>
            <div className={styles.panel}>
              <div className={styles.panelBody}>
                {productNode}
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelBody}>
                {cartNode}
              </div>
            </div>
          </>
        )}

      </main>
      {slots?.footer && (
        <div className={styles.footerArea}>
          {slots.footer}
        </div>
      )}
    </div>
  )
}

export default SalesLayout