import { useMemo, useState } from "react"
import {
  Alert, Button, CircularProgress, InputAdornment, MenuItem,
  Radio, TextField, Typography,
} from "@mui/material"
import PetsIcon from "@mui/icons-material/Pets"
import CheckIcon from "@mui/icons-material/Check"
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/domains/auth/store"
import { useSessionStore, type Branch } from "@/domains/session/store"
import BrandShell from "@/screens/layout/BrandShell"
import styles from "./ShiftStart.module.scss"

// Wireframe placeholder — real register options should come from the API
// once branches expose their drawer/lane configuration.
const REGISTERS = [
  "Drawer #1 · Lane A",
  "Drawer #2 · Lane A",
  "Drawer #3 · Lane A",
  "Drawer #4 · Lane B",
]

const DEFAULT_OPENING_FLOAT = "200.00"

const formatOperatingTime = (d: Date) => {
  const hh = d.getHours().toString().padStart(2, "0")
  const mm = d.getMinutes().toString().padStart(2, "0")
  const weekday = d.toLocaleDateString(undefined, { weekday: "short" })
  const day = d.getDate()
  const month = d.toLocaleDateString(undefined, { month: "short" })
  return `${hh}:${mm}, ${weekday} ${day} ${month}`
}

interface BranchOptionRowProps {
  branch: Branch
  selected: boolean
  onSelect: () => void
}

const BranchOptionRow = ({ branch, selected, onSelect }: BranchOptionRowProps) => {
  const meta = (() => {
    if (branch.drawerStatus === "unclosed") {
      return <span className={`${styles.branchMeta} ${styles.warn}`}>
        <span className={styles.dot} />
        Drawer unclosed
      </span>
    }
    const staffLabel = branch.activeStaff != null ? ` · ${branch.activeStaff} staff` : ""
    return <span className={`${styles.branchMeta} ${styles.ok}`}>
      <span className={styles.dot} />
      Open{staffLabel}
    </span>
  })()

  return (
    <label
      className={`${styles.branchOption} ${selected ? styles.selected : ""} ${styles.radioReset}`}
      onClick={onSelect}
    >
      <Radio
        checked={selected}
        onChange={onSelect}
        value={branch.id}
        color="primary"
      />
      <div>
        <div className={styles.branchName}>{branch.label}</div>
        {branch.address && <div className={styles.branchAddress}>{branch.address}</div>}
      </div>
      {meta}
    </label>
  )
}

const ShiftStartScreen = () => {
  const navigate = useNavigate()

  const staffName = useAuthStore((s) => s.user?.name ?? "Staff")
  const staffRole = useAuthStore((s) => s.user?.role ?? "")

  const branches = useSessionStore((s) => s.branches)
  const branchId = useSessionStore((s) => s.branchId)
  const setBranchId = useSessionStore((s) => s.setBranchId)
  const setBranchUUID = useSessionStore((s) => s.setBranchUUID)
  const startShift = useSessionStore((s) => s.startShift)

  const [openingFloat, setOpeningFloat] = useState(DEFAULT_OPENING_FLOAT)
  const [register, setRegister] = useState(REGISTERS[2])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedBranch = useMemo(
    () => branches.find((b) => b.id === branchId),
    [branchId, branches],
  )

  const canStart = Boolean(branchId) && !loading

  const handleStart = async () => {
    if (!branchId) return
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("snf_pos_access_token")
      const res = await fetch("/api/orders/branches", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch branches")

      const data = await res.json()
      const branch = data.find((b: { code?: string; id: string }) => b.code === branchId)
      if (branch) setBranchUUID(branch.id)

      startShift()
      navigate("/pos/sales", { replace: true })
    } catch {
      setError("Failed to start shift. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const operatingLabel = selectedBranch?.label ?? "—"
  const operatingTime = useMemo(() => formatOperatingTime(new Date()), [])

  return (
    <BrandShell>
      <div className={styles.card}>
        <div className={styles.cardChip}>
          <PetsIcon fontSize="small" />
        </div>

        <div className={styles.cardHeader}>
          <Typography variant="h3" component="h2">Start shift</Typography>
          <Typography variant="body2" color="text.secondary">
            Hi <b>{staffName}</b>{staffRole ? ` (${staffRole})` : ""}, please choose your branch.
          </Typography>
        </div>

        <Typography variant="overline">Branch</Typography>
        <div className={styles.branchList}>
          {branches.map((b) => (
            <BranchOptionRow
              key={b.id}
              branch={b}
              selected={branchId === b.id}
              onSelect={() => setBranchId(b.id)}
            />
          ))}
        </div>

        <div className={styles.twoCol}>
          <div className={styles.fieldGroup}>
            <Typography variant="overline">Opening float</Typography>
            <TextField
              fullWidth
              value={openingFloat}
              onChange={(e) => setOpeningFloat(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </div>
          <div className={styles.fieldGroup}>
            <Typography variant="overline">Register</Typography>
            <TextField
              fullWidth
              select
              value={register}
              onChange={(e) => setRegister(e.target.value)}
            >
              {REGISTERS.map((r) => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </TextField>
          </div>
        </div>

        {error && (
          <Alert severity="error" className={styles.error}>{error}</Alert>
        )}

        <div className={styles.actions}>
          <Button
            variant="contained"
            size="large"
            disabled={!canStart}
            onClick={handleStart}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CheckIcon />}
          >
            {loading ? "Starting…" : "Start shift"}
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate("/login", { replace: true })}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>

        <div className={styles.contextStrip}>
          <LocalOfferOutlinedIcon />
          <span>
            You&apos;ll be operating under: <b>{operatingLabel}</b> · {operatingTime}
          </span>
        </div>
      </div>
    </BrandShell>
  )
}

export default ShiftStartScreen
