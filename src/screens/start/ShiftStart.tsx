import { useMemo, useState } from "react"
import { MenuItem, Typography, Card, FormControl, Select, Button } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/domains/auth/store"
import { useSessionStore } from "@/domains/session/store"
import { FullPageContainer } from "@/screens/layout/PageContainer"
import styles from "./Start.module.scss"

const ShiftStartScreen = () => {
  const navigate = useNavigate()

  const staffName    = useAuthStore((s) => s.user?.name ?? "Staff")
  const staffRole    = useAuthStore((s) => s.user?.role ?? "")

  const branches     = useSessionStore((s) => s.branches)
  const branchId     = useSessionStore((s) => s.branchId)
  const setBranchId  = useSessionStore((s) => s.setBranchId)
  const setBranchUUID = useSessionStore((s) => s.setBranchUUID)  // ← store action
  const startShift   = useSessionStore((s) => s.startShift)

  const [touched, setTouched]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const branchLabel = useMemo(
    () => branches.find((b) => b.id === branchId)?.label ?? "",
    [branchId, branches]
  )

  const canStart = Boolean(branchId)

  const handleStart = async () => {
    setTouched(true)
    if (!canStart) return

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("snf_pos_access_token")
      const res = await fetch("/api/orders/branches", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) throw new Error("Failed to fetch branches")

      const data = await res.json()
      const branch = data.find((b: any) => b.code === branchId)

      if (branch) {
        setBranchUUID(branch.id)  // ← 存入 store
      }

      startShift()
      navigate("/pos/sales", { replace: true })
    } catch (err) {
      setError("Failed to start shift. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <FullPageContainer>
      <Card className={styles.shiftCard} elevation={6}>

        <Typography variant="h5" className={styles.title}>
          Start shift
        </Typography>
        <Typography variant="body2" className={styles.sub}>
          Hi <b>{staffName}</b>{staffRole ? ` (${staffRole})` : ""}, please choose your branch.
        </Typography>

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

        {error && (
          <Typography variant="caption" color="error" display="block" mt={1}>
            {error}
          </Typography>
        )}

        <div className={styles.actions}>
          <Button
            variant="contained"
            size="large"
            disabled={!canStart || loading}
            onClick={handleStart}
            className={styles.primaryButton}
          >
            {loading ? "Starting…" : "Start shift"}
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