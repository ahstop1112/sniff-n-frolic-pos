import { useMemo, useState } from "react"
import Autocomplete from "@mui/material/Autocomplete"
import TextField from "@mui/material/TextField"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import CircularProgress from "@mui/material/CircularProgress"
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue"
import { useStock } from "../hooks/useStock"
import type { StockItem } from "../types/inventory.types"

interface ProductSearchSelectProps {
  value: StockItem | null
  onChange: (item: StockItem | null) => void
  label?: string
  placeholder?: string
  disableUnmanaged?: boolean
  size?: "small" | "medium"
}

const displayName = (item: StockItem) =>
  item.parent_name ? `${item.parent_name} — ${item.name}` : item.name

const ProductSearchSelect = ({
  value,
  onChange,
  label,
  placeholder = "Search products…",
  disableUnmanaged = false,
  size = "small",
}: ProductSearchSelectProps) => {
  const [input, setInput] = useState("")
  const debounced = useDebouncedValue(input, 300)
  const { data, isFetching } = useStock({ search: debounced || undefined, limit: 50, offset: 0 })

  const options = useMemo(() => data?.items ?? [], [data])

  return (
    <Autocomplete<StockItem>
      value={value}
      onChange={(_, next) => onChange(next)}
      inputValue={input}
      onInputChange={(_, next) => setInput(next)}
      options={options}
      getOptionLabel={displayName}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      getOptionDisabled={(opt) => disableUnmanaged && !opt.manage_stock}
      filterOptions={(x) => x}
      size={size}
      loading={isFetching}
      noOptionsText={debounced ? `No products matching "${debounced}"` : "Type to search"}
      renderOption={(props, opt) => (
        <Box component="li" {...props} key={opt.id}>
          <Box sx={{ display: "flex", flexDirection: "column", py: 0.25 }}>
            <Typography variant="body2" fontWeight={500}>
              {displayName(opt)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {opt.sku ? `${opt.sku} · ` : ""}
              {opt.manage_stock ? `${opt.stock_quantity} in stock` : "Stock management not enabled"}
            </Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isFetching ? <CircularProgress size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  )
}

export default ProductSearchSelect
