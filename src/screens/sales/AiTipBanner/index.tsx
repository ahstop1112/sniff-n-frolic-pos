import { useState } from "react"
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"
import CloseIcon from "@mui/icons-material/Close"
import styles from "./AiTipBanner.module.scss"

// Placeholder for the Frolic AI copilot surface — the banner is static
// content today. Wire to a real prompt/model when the AI service lands.
const AiTipBanner = () => {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className={styles.banner} role="status">
      <div className={styles.icon}>
        <AutoAwesomeIcon fontSize="small" />
      </div>
      <div className={styles.text}>
        <b>Frolic tip:</b>{" "}
        Say &ldquo;2 chicken jerky for Odin&rdquo; — we&apos;ll add it and attach the member.
        <div className={styles.hint}>Press ⌘K to open the assistant.</div>
      </div>
      <button className={styles.close} aria-label="Dismiss tip" onClick={() => setDismissed(true)}>
        <CloseIcon fontSize="small" />
      </button>
    </div>
  )
}

export default AiTipBanner
