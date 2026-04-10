import type { PropsWithChildren } from "react"
import styles from "./PageContainer.module.scss"

const PageContainer = ({ children }: PropsWithChildren) => (
  <div className={styles.wrapper}>
    <div className={styles.body}>
      {children}
    </div>
  </div>
)

export default PageContainer;

// ── Named exports for direct use ──────────────────
// replaces: import { FullPageContainer } from '@/screens/layout/PageContainer/styles'
// usage:    <FullPageContainer> ... </FullPageContainer>

export const FullPageContainer = ({ children }: PropsWithChildren) => (
  <div className={styles.fullPage}>
    {children}
  </div>
);