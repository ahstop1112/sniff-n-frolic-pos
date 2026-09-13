import { useMemo, useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Skeleton from "@mui/material/Skeleton"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import TextField from "@mui/material/TextField"
import Alert from "@mui/material/Alert"
import InputAdornment from "@mui/material/InputAdornment"
import SearchIcon from "@mui/icons-material/Search"
import ReceiptIcon from "@mui/icons-material/Receipt"
import { useOrdersList } from "@/domains/orders/hooks/useOrdersList"
import OrdersTable from "./components/OrdersTable"
import styles from "./OrdersHub.module.scss"

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(cents / 100)

const LIMIT = 50

const OrdersHubScreen = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Load from URL params
  const [statusFilter, setStatusFilter] = useState<string>(() => searchParams.get("status") || "")
  const [sortBy, setSortBy] = useState<string>(() => searchParams.get("sort_by") || "created_at")
  const [sortDir, setSortDir] = useState<string>(() => searchParams.get("sort_dir") || "desc")
  const [search, setSearch] = useState<string>(() => searchParams.get("search") || "")
  const [offset, setOffset] = useState<number>(() => parseInt(searchParams.get("offset") || "0", 10))
  const [searchInput, setSearchInput] = useState(search)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput)
        setOffset(0)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput, search])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (statusFilter) params.set("status", statusFilter)
    if (sortBy) params.set("sort_by", sortBy)
    if (sortDir) params.set("sort_dir", sortDir)
    if (search) params.set("search", search)
    if (offset > 0) params.set("offset", String(offset))
    setSearchParams(params)
  }, [statusFilter, sortBy, sortDir, search, offset, setSearchParams])

  const query = useOrdersList({
    status: statusFilter || undefined,
    sort_by: sortBy,
    sort_dir: sortDir,
    search: search || undefined,
    limit: LIMIT,
    offset,
  })

  const orders = useMemo(() => query.data?.orders ?? [], [query.data?.orders])
  const total = useMemo(() => query.data?.total ?? 0, [query.data?.total])
  const isLoading = query.isLoading
  const error = query.error as Error | null

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + order.total, 0),
    [orders]
  )

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus)
    setOffset(0)
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortDir("desc")
    }
    setOffset(0)
  }

  return (
    <div className={styles.root}>
      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroBrand}>
          <div className={styles.heroIcon}>
            <ReceiptIcon />
          </div>
          <div className={styles.heroMeta}>
            <span className={styles.heroEyebrow}>Sales · Revenue history</span>
            <div className={styles.heroTitle}>Orders</div>
            <div className={styles.heroSubStats}>
              <span>
                <strong>{total}</strong> total
              </span>
              <span className={styles.heroSubDot}>·</span>
              <span>{formatCurrency(totalRevenue)} revenue</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={styles.scrollBody}>
        <div className={styles.toolbar}>
          <TextField
            placeholder="Search order # or name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="small"
            sx={{ flex: 1, maxWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: "1.25rem" }} />
                </InputAdornment>
              ),
            }}
          />
          <label htmlFor="status-filter" style={{ marginLeft: 16, marginRight: 8, fontSize: "0.875rem" }}>
            Status
          </label>
          <Select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            size="small"
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </div>

        {error && <Alert severity="error">{error.message}</Alert>}

        {isLoading && (
          <div className={styles.skeletonStack}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={64} />
            ))}
          </div>
        )}

        {!isLoading && orders.length === 0 && (
          <div className={styles.emptyState}>No orders found.</div>
        )}

        {!isLoading && orders.length > 0 && (
          <OrdersTable
            orders={orders}
            onOrderClick={(id) => navigate(`/pos/manage/orders/${id}`)}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
          />
        )}

        {/* ── Pagination ── */}
        {!isLoading && total > LIMIT && (
          <Box sx={{ display: "flex", gap: 1, p: 2, justifyContent: "center" }}>
            <Button
              variant="outlined"
              size="small"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - LIMIT))}
            >
              Previous
            </Button>
            <span style={{ alignSelf: "center", fontSize: "0.875rem" }}>
              {Math.floor(offset / LIMIT) + 1} of {Math.ceil(total / LIMIT)}
            </span>
            <Button
              variant="outlined"
              size="small"
              disabled={offset + LIMIT >= total}
              onClick={() => setOffset(offset + LIMIT)}
            >
              Next
            </Button>
          </Box>
        )}
      </div>
    </div>
  )
}

export default OrdersHubScreen
