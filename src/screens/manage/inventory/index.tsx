import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import TextField from "@mui/material/TextField"
import InputAdornment from "@mui/material/InputAdornment"
import FormControlLabel from "@mui/material/FormControlLabel"
import Switch from "@mui/material/Switch"
import Alert from "@mui/material/Alert"
import SearchIcon from "@mui/icons-material/Search"
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue"
import { useStock } from "@/domains/inventory/hooks/useStock"
import Pagination from "@/domains/inventory/components/Pagination"
import StockTable from "./components/StockTable"

const LIMIT = 50

const StockOverviewScreen = () => {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState("")
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [offset, setOffset] = useState(0)
  const debouncedSearch = useDebouncedValue(searchText, 300)

  // Any filter change resets pagination. Doing this in handlers (instead of an effect)
  // keeps the reset colocated with the user action.
  const handleSearchChange = (v: string) => { setSearchText(v); setOffset(0) }
  const handleLowStockToggle = (v: boolean) => { setLowStockOnly(v); setOffset(0) }

  const { data, isLoading, isFetching, error } = useStock({
    search: debouncedSearch || undefined,
    lowStockOnly: lowStockOnly || undefined,
    limit: LIMIT,
    offset,
  })

  const items = useMemo(() => data?.items ?? [], [data?.items])
  const total = data?.total ?? 0

  // When a search matches a variation, auto-expand its parent group.
  const autoExpandParentIds = useMemo(() => {
    if (!debouncedSearch) return undefined
    const ids = new Set<string>()
    for (const item of items) {
      if (item.parentId) ids.add(item.parentId)
    }
    return ids
  }, [items, debouncedSearch])

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        px: 3, py: 2, borderBottom: 1, borderColor: "divider", flexShrink: 0,
      }}>
        <Typography variant="h6" fontWeight={700}>Stock Overview</Typography>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => navigate("/pos/manage/inventory/movements")}
            sx={{ textTransform: "none" }}
          >
            Movements
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/pos/manage/inventory/adjust")}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Adjust Stock
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{
        display: "flex", alignItems: "center", gap: 3,
        px: 3, py: 1.5, borderBottom: 1, borderColor: "divider", flexShrink: 0,
      }}>
        <TextField
          size="small"
          placeholder="Search name or SKU…"
          value={searchText}
          onChange={(e) => handleSearchChange(e.target.value)}
          sx={{ width: 320 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={lowStockOnly}
              onChange={(e) => handleLowStockToggle(e.target.checked)}
            />
          }
          label={<Typography variant="body2">Low stock only</Typography>}
        />
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {(error as Error).message}
          </Alert>
        )}

        {!error && !isLoading && items.length === 0 && (
          <Box sx={{ p: 6, textAlign: "center" }}>
            {debouncedSearch ? (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  No products matching &quot;{debouncedSearch}&quot;
                </Typography>
                <Button size="small" onClick={() => handleSearchChange("")} sx={{ textTransform: "none" }}>
                  Clear search
                </Button>
              </>
            ) : lowStockOnly ? (
              <Typography variant="body2" color="success.main">
                No low-stock products ✓
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No products yet
              </Typography>
            )}
          </Box>
        )}

        {!error && (items.length > 0 || isLoading) && (
          <StockTable
            items={items}
            isLoading={isLoading && items.length === 0}
            autoExpandParentIds={autoExpandParentIds}
          />
        )}
      </Box>

      {/* Pagination */}
      {!error && total > 0 && (
        <Box sx={{ flexShrink: 0, position: "relative", opacity: isFetching ? 0.6 : 1 }}>
          <Pagination total={total} limit={LIMIT} offset={offset} onChange={setOffset} />
        </Box>
      )}
    </Box>
  )
}

export default StockOverviewScreen
