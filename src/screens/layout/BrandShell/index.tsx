import type { PropsWithChildren } from "react"
import Typography from "@mui/material/Typography"
import PetsIcon from "@mui/icons-material/Pets"
import styles from "./BrandShell.module.scss"

// Shared split-screen chrome for pre-app pages (login, shift start).
// Dark brand panel is fixed content; children render inside the right stage
// (usually a floating white card).
const BrandShell = ({ children }: PropsWithChildren) => (
  <div className={styles.page}>
    <aside className={styles.brandPanel}>
      <div className={styles.brandMark}>
        <div className={styles.brandChip}>
          <PetsIcon fontSize="small" />
        </div>
        <div>
          <div className={styles.brandName}>Sniff &amp; Frolic</div>
          <div className={styles.brandSub}>POS · Yaletown YVR</div>
        </div>
      </div>

      <div className={styles.brandHero}>
        <Typography variant="h1" component="h1">
          Open the drawer,<br />start the day.
        </Typography>
        <p>
          Sales, inventory and the Frolic AI watch — all behind one sign-in.
        </p>
      </div>

      <div className={styles.brandFooter}>
        <span>v3.4.1</span>
        <span className={styles.footerDot}>Terminal LANE-A · registered</span>
        <span className={styles.footerDot}>Need help? 604 ⋯ 2210</span>
      </div>
    </aside>

    <main className={styles.stage}>
      {children}
    </main>
  </div>
)

export default BrandShell
