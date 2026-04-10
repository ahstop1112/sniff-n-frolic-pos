import { useMemo, useState } from "react"
import { MenuItem, Typography, Card, FormControl, Select, Button } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/domains/auth/store"
import { useSessionStore } from "@/domains/session/store"
import { FullPageContainer } from "@/screens/layout/PageContainer"
import styles from "./Start.module.scss"

const ShiftStartScreen = () => {
  const navigate = useNavigate()

  const staffName = useAuthStore((s) => s.user?.name ?? "Staff")
  const staffRole = useAuthStore((s) => s.user?.role ?? "")

  const branches    = useSessionStore((s) => s.branches)
  const branchId    = useSessionStore((s) => s.branchId)
  const setBranchId = useSessionStore((s) => s.setBranchId)
  const startShift  = useSessionStore((s) => s.startShift)

  const [touched, setTouched] = useState(false)

  const branchLabel = useMemo(
    () => branches.find((b) => b.id === branchId)?.label ?? "",
    [branchId, branches]
  )

  const canStart = Boolean(branchId)

  const handleStart = () => {
    setTouched(true)
    if (!canStart) return
    startShift()
    navigate("/pos/sales", { replace: true })
  }

  return (
    <FullPageContainer>
      <Card className={styles.shiftCard} elevation={6}>

        {/* Header */}
        <Typography variant="h5" className={styles.title}>
          Start shift
        </Typography>
        <Typography variant="body2" className={styles.sub}>
          Hi <b>{staffName}</b>{staffRole ? ` (${staffRole})` : ""}, please choose your branch.
        </Typography>

        {/* Branch select */}
        <div className={styles.fullRow}>
          <FormControl className={styles.branchControl} size="small">
            <Select
              value={branchId ?? ""}
              displayEmpty
              onChange={(e) => setBranchId(String(e.target.value))}
            >
              <MenuItem value="" disabled>Select branch…</MenuItem>
              {branches.map((b) => (
                <MenuItem key={b.id} value={b.id}>{b.label}</MenuItem>
              ))}
            </Select>
            {touched && !branchId && (
              <Typography variant="caption" color="error">
                Please select a branch.
              </Typography>
            )}
          </FormControl>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Button
            variant="contained"
            size="large"
            disabled={!canStart}
            onClick={handleStart}
            className={styles.primaryButton}
          >
            Start shift
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate("/login", { replace: true })}
            className={styles.secondaryButton}
          >
            Cancel
          </Button>
        </div>

        {branchLabel && (
          <Typography variant="caption" color="text.secondary" display="block" mt={2}>
            You'll be operating under: {branchLabel}
          </Typography>
        )}

      </Card>
    </FullPageContainer>
  )
}

export default ShiftStartScreen