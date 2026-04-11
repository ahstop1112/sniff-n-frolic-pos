import { useMemo, useState } from "react"
import {
  Avatar, Badge, Box, IconButton, Menu, MenuItem,
  ToggleButton, ToggleButtonGroup, Typography,
} from "@mui/material"
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import PetsIcon from "@mui/icons-material/Pets"
import { useAuthStore } from "@/domains/auth/store"
import { useSessionStore } from "@/domains/session/store"
import { useNavigate } from "react-router-dom"
import type { HeaderProps } from "./types"
import styles from "./Header.module.scss"

const Header = ({
  branchName,
  networkStatus = "online",
  onlineOrderCount,
  mode,
  onModeChange,
  staff,
  onOpenOnlineOrders,
}: HeaderProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(anchorEl)
  const { logout } = useAuthStore()
  const endShift = useSessionStore((s) => s.endShift)
  const sessionBranch = useSessionStore((s) => s.branchId)
  const navigate = useNavigate()

  const displayBranch = branchName ?? sessionBranch ?? "Branch"

  const initials = useMemo(() => {
    const parts = (staff?.name ?? "Staff").trim().split(/\s+/).filter(Boolean)
    const first = parts[0]?.[0] ?? "U"
    const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
    return (first + last).toUpperCase()
  }, [staff?.name])

  const handleLogout = () => {
    setAnchorEl(null)
    endShift()
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <header className={styles.root}>
      {/* Left */}
      <div className={styles.left}>
        <PetsIcon sx={{ color: "primary.main", fontSize: 32 }} />
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1 }}>
          Zoomies
        </Typography>
        <div className={styles.branchRow}>
          <span className={styles.branchName}>{displayBranch}</span>
          <span
            className={`${styles.statusDot} ${styles[networkStatus]}`}
            title={networkStatus}
            aria-label={`Network: ${networkStatus}`}
          />
        </div>
      </div>

      {/* Right */}
      <div className={styles.right}>
        {/* Notifications */}
        <IconButton
          className={styles.iconButton}
          onClick={onOpenOnlineOrders}
          aria-label="Online orders"
        >
          <Badge badgeContent={onlineOrderCount ?? 0}>
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>

        {/* Mode switch */}
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, next) => next && onModeChange?.(next)}
          className={styles.modeSwitch}
          sx={{
            "& .MuiToggleButton-root": {
              fontWeight: 900,
              textTransform: "none",
              px: 2,
            },
            "& .MuiToggleButton-root.Mui-selected": {
              bgcolor: "grey.900",
              color: "common.white",
              "&:hover": { bgcolor: "grey.900" },
            },
          }}
        >
          <ToggleButton value="sales">Sales</ToggleButton>
          <ToggleButton value="manage">Manage</ToggleButton>
        </ToggleButtonGroup>

        {/* Staff menu */}
        <Box>
          <div
            className={styles.staffButton}
            role="button"
            tabIndex={0}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <Avatar sx={{ width: 28, height: 28, bgcolor: "action.hover", color: "text.primary" }}>
              <Typography sx={{ fontSize: 12, fontWeight: 900 }}>{initials}</Typography>
            </Avatar>
            <KeyboardArrowDownIcon fontSize="small" />
          </div>

          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Box sx={{ px: 2, py: 1.25 }}>
              <Typography sx={{ fontWeight: 900, fontSize: 13 }}>
                {staff?.name ?? "Staff"}
              </Typography>
            </Box>

            <MenuItem onClick={() => setAnchorEl(null)}>Cash In</MenuItem>
            <MenuItem onClick={() => setAnchorEl(null)}>Cash Out</MenuItem>

            <Box sx={{ my: 0.5, borderTop: 1, borderColor: "divider" }} />

            <MenuItem onClick={handleLogout} sx={{ color: "error.main", fontWeight: 800 }}>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </div>
    </header>
  )
}

export default Header