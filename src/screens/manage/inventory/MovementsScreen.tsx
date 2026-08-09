import { useCallback, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import MenuItem from "@mui/material/MenuItem"
import Skeleton from "@mui/material/Skeleton"
import Tooltip from "@mui/material/Tooltip"
import Alert from "@mui/material/Alert"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import { useMovements } from "@/domains/inventory/hooks/useMovements"
import Pagination from "@/domains/inventory/components/Pagination"
import ReasonLabel from "@/domains/inventory/components/ReasonLabel"
import ProductSearchSelect from "@/domains/inventory/components/ProductSearchSelect"
import { useStock } from "@/domains/inventory/hooks/useStock"
import { REASON_LABELS } from "@/domains/inventory/constants"
import type { Movement, MovementReason, StockItem } from "@/domains/inventory/types/inventory.types"

const LIMIT = 50
const REASONS = Object.keys(REASON_LABELS) as MovementReason[]
const columnsWidth = "160px 1fr 100px 130px 130px 1.5fr"
const headers = ["Time", "Product", "Change", "Reason", "By", "Note"]

// MM-DD HH:mm for the current calendar year, YYYY-MM-DD HH:mm otherwise.
const formatTime = (iso: string) => {
  const d = new Date(iso)
  const now = new Date()
  const pad = (n: number) => n.toString().padStart(2, "0")
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mi = pad(d.getMinutes())
  if (d.getFullYear() === now.getFullYear()) return `${mm}-${dd} ${hh}:${mi}`
  return `${d.getFullYear()}-${mm}-${dd} ${hh}:${mi}`
}

const MovementRow = ({ m }: { m: Movement }) => (
  <Box sx={{
    display: "grid",
    gridTemplateColumns: columnsWidth,
    gap: 2, px: 2, py: 1.25,
    borderBottom: 1, borderColor: "divider",
    alignItems: "center",
  }}>
    <Typography variant="body2" color="text.secondary">{formatTime(m.created_at)}</Typography>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="body2" fontWeight={500} noWrap>{m.product_name}</Typography>
      {m.product_sku && (
        <Typography variant="caption" color="text.secondary" noWrap>{m.product_sku}</Typography>
      )}
    </Box>
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
      {m.quantity_change >= 0 ? (
        <ArrowUpwardIcon sx={{ fontSize: 14, color: "success.main" }} />
      ) : (
        <ArrowDownwardIcon sx={{ fontSize: 14, color: "error.main" }} />
      )}
      <Typography
        variant="body2"
        fontWeight={700}
        color={m.quantity_change >= 0 ? "success.main" : "error.main"}
      >
        {m.quantity_change >= 0 ? `+${m.quantity_change}` : m.quantity_change}
      </Typography>
    </Box>
    <Typography variant="body2"><ReasonLabel reason={m.reason} /></Typography>
    <Typography variant="body2" color={m.created_by_name ? "text.primary" : "text.disabled"}>
      {m.created_by_name ?? "System"}
    </Typography>
    {m.note ? (
      <Tooltip title={m.note} enterDelay={300}>
        <Typography variant="body2" color="text.secondary" noWrap>{m.note}</Typography>
      </Tooltip>
    ) : (
      <Typography variant="body2" color="text.disabled">—</Typography>
    )}
  </Box>
)

const MovementsScreen = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const productId = searchParams.get("productId") ?? ""
  const reason = (searchParams.get("reason") ?? "") as MovementReason | ""
  const dateFrom = searchParams.get("dateFrom") ?? ""
  const dateTo = searchParams.get("dateTo") ?? ""
  const offset = Number(searchParams.get("offset") ?? "0") || 0

  const updateParams = useCallback((patch: Record<string, string | undefined>, resetOffset = true) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    if (resetOffset) next.delete("offset")
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  const setOffset = useCallback((v: number) => {
    const next = new URLSearchParams(searchParams)
    if (v > 0) next.set("offset", String(v))
    else next.delete("offset")
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  // Load the selected product for the ProductSearchSelect display.
  const productLookup = useStock({ limit: 200, offset: 0 })
  const selectedProduct = useMemo<StockItem | null>(() => {
    if (!productId) return null
    return productLookup.data?.items.find((i) => i.id === productId) ?? null
  }, [productId, productLookup.data])

  const invalidRange = !!(dateFrom && dateTo && dateTo < dateFrom)

  const { data, isLoading, error } = useMovements({
    product_id: productId || undefined,
    reason: reason || undefined,
    date_from: dateFrom || undefined,
    date_to: invalidRange ? undefined : dateTo || undefined,
    limit: LIMIT,
    offset,
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const hasFilters = !!(productId || reason || dateFrom || dateTo)

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        px: 3, py: 2, borderBottom: 1, borderColor: "divider", flexShrink: 0,
      }}>
        <Typography variant="h6" fontWeight={700}>Stock Movements</Typography>
        <Button
          variant="outlined"
          onClick={() => navigate("/pos/manage/inventory")}
          sx={{ textTransform: "none" }}
        >
          Back to Stock Overview
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{
        display: "flex", alignItems: "flex-start", flexWrap: "wrap", gap: 2,
        px: 3, py: 1.5, borderBottom: 1, borderColor: "divider", flexShrink: 0,
      }}>
        <Box sx={{ minWidth: 280 }}>
          <ProductSearchSelect
            value={selectedProduct}
            onChange={(p) => updateParams({ productId: p?.id })}
            placeholder="Filter by product…"
          />
        </Box>
        <TextField
          select
          size="small"
          label="Reason"
          value={reason}
          onChange={(e) => updateParams({ reason: e.target.value || undefined })}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All</MenuItem>
          {REASONS.map((r) => (
            <MenuItem key={r} value={r}>{REASON_LABELS[r]}</MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          type="date"
          label="From"
          value={dateFrom}
          onChange={(e) => updateParams({ dateFrom: e.target.value || undefined })}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          size="small"
          type="date"
          label="To"
          value={dateTo}
          onChange={(e) => updateParams({ dateTo: e.target.value || undefined })}
          InputLabelProps={{ shrink: true }}
          error={invalidRange}
          helperText={invalidRange ? "Must be ≥ From" : undefined}
          inputProps={{ min: dateFrom || undefined }}
        />
        {hasFilters && (
          <Button
            variant="text"
            onClick={() => setSearchParams({}, { replace: true })}
            sx={{ textTransform: "none", alignSelf: "center" }}
          >
            Clear
          </Button>
        )}
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {(error as Error).message}
          </Alert>
        )}

        {!error && (
          <>
            {/* Table header */}
            <Box sx={{
              display: "grid",
              gridTemplateColumns: columnsWidth,
              gap: 2, px: 2, py: 1,
              borderBottom: 1, borderColor: "divider",
              bgcolor: "grey.50",
              position: "sticky", top: 0, zIndex: 1,
            }}>
              {headers.map((h, i) => (
                <Typography key={`${h}-${i}`} variant="caption" color="text.secondary" fontWeight={700}
                  sx={{ letterSpacing: "0.06em" }}>
                  {h}
                </Typography>
              ))}
            </Box>

            {isLoading && items.length === 0 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, p: 2 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={44} />
                ))}
              </Box>
            )}

            {!isLoading && items.length === 0 && (
              <Box sx={{ p: 6, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  No movements match these filters
                </Typography>
              </Box>
            )}

            {items.map((m) => (
              <MovementRow key={m.id} m={m} />
            ))}
          </>
        )}
      </Box>

      {!error && total > 0 && (
        <Box sx={{ flexShrink: 0 }}>
          <Pagination total={total} limit={LIMIT} offset={offset} onChange={setOffset} />
        </Box>
      )}
    </Box>
  )
}

export default MovementsScreen
