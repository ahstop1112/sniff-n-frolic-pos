import { useMemo, useState } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import PetsIcon from "@mui/icons-material/Pets"
import PointOfSaleIcon from "@mui/icons-material/PointOfSale"
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined"
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined"
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined"
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined"
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined"
import { useAuthStore } from "@/domains/auth/store"
import { useSessionStore } from "@/domains/session/store"
import styles from "./AppShell.module.scss"

interface NavEntry {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  // When multiple routes share a section (e.g. /pos/manage/products and
  // /pos/manage/inventory both belong to Manage), pathMatch anchors the
  // active state to a prefix rather than the exact `to`.
  pathMatch?: (pathname: string) => boolean
}

const NAV: NavEntry[] = [
  { to: "/pos/sales",              label: "Sales",     icon: PointOfSaleIcon,
    pathMatch: (p) => p.startsWith("/pos/sales") },
  { to: "/pos/manage/orders",      label: "Orders",    icon: ReceiptLongIcon },
  { to: "/pos/manage/products",    label: "Products",  icon: CategoryOutlinedIcon,
    pathMatch: (p) => p.startsWith("/pos/manage/products") },
  { to: "/pos/manage/inventory",   label: "Inventory", icon: Inventory2OutlinedIcon,
    pathMatch: (p) => p.startsWith("/pos/manage/inventory") },
  { to: "/pos/manage/members",     label: "Members",   icon: PeopleAltOutlinedIcon },
  { to: "/pos/manage/dashboard",   label: "Dashboard", icon: DashboardOutlinedIcon },
  { to: "/pos/manage/reports",     label: "Reports",   icon: AssessmentOutlinedIcon },
]

const AppShell = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const staffName = useAuthStore((s) => s.user?.name ?? "Staff")
  const staffRole = useAuthStore((s) => s.user?.role ?? "")
  const logout = useAuthStore((s) => s.logout)
  const endShift = useSessionStore((s) => s.endShift)
  const branchId = useSessionStore((s) => s.branchId)
  const branches = useSessionStore((s) => s.branches)

  const branchLabel = useMemo(
    () => branches.find((b) => b.id === branchId)?.label ?? "No branch",
    [branchId, branches],
  )

  const initials = useMemo(() => {
    const parts = staffName.trim().split(/\s+/).filter(Boolean)
    const first = parts[0]?.[0] ?? "S"
    const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
    return (first + last).toUpperCase()
  }, [staffName])

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const handleLogout = () => {
    setAnchorEl(null)
    endShift()
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <div className={styles.shell}>
      <nav className={styles.rail} aria-label="Primary">
        <div className={styles.brandMark}>
          <div className={styles.brandChip}>
            <PetsIcon fontSize="small" />
          </div>
          <div className={styles.brandText}>
            <div className={styles.brandName}>Sniff &amp; Frolic</div>
            <div className={styles.brandSub}>{branchLabel}</div>
          </div>
        </div>

        <div className={styles.nav}>
          {NAV.map((entry) => {
            const Icon = entry.icon
            const active = entry.pathMatch
              ? entry.pathMatch(location.pathname)
              : location.pathname === entry.to
            return (
              <NavLink
                key={entry.to}
                to={entry.to}
                className={`${styles.navItem} ${active ? styles.active : ""}`}
              >
                <Icon />
                <span className={styles.navLabel}>{entry.label}</span>
              </NavLink>
            )
          })}
        </div>

        <div className={styles.userChip}
          role="button"
          tabIndex={0}
          onClick={(e) => setAnchorEl(e.currentTarget)}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userMeta}>
            <div className={styles.userName}>{staffName}</div>
            <div className={styles.userSub}>{staffRole || "Staff"}</div>
          </div>
        </div>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <MenuItem onClick={() => { setAnchorEl(null); endShift(); navigate("/pos/start", { replace: true }) }}>
            End shift
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ color: "error.main", fontWeight: 700 }}>
            Log out
          </MenuItem>
        </Menu>
      </nav>

      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  )
}

export default AppShell
