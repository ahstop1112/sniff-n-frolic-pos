import InputAdornment from "@mui/material/InputAdornment"
import TextField from "@mui/material/TextField"
import SearchIcon from "@mui/icons-material/Search"
import ClearIcon from "@mui/icons-material/Clear"
import IconButton from "@mui/material/IconButton"
import CircularProgress from "@mui/material/CircularProgress"

interface ProductSearchBarProps {
  value: string
  onChange: (value: string) => void
  isFetching?: boolean
  disabled?: boolean
}

const ProductSearchBar = ({
  value,
  onChange,
  isFetching,
  disabled,
}: ProductSearchBarProps) => (
  <TextField
    fullWidth
    size="small"
    placeholder="Search by name, SKU or barcode…"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          {isFetching
            ? <CircularProgress size={16} />
            : <SearchIcon fontSize="small" />
          }
        </InputAdornment>
      ),
      endAdornment: value ? (
        <InputAdornment position="end">
          <IconButton size="small" onClick={() => onChange("")} edge="end">
            <ClearIcon fontSize="small" />
          </IconButton>
        </InputAdornment>
      ) : null,
    }}
  />
)

export default ProductSearchBar