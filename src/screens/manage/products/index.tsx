import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import TextField from "@mui/material/TextField"
import InputAdornment from "@mui/material/InputAdornment"
import SearchIcon from "@mui/icons-material/Search"
import AddIcon from "@mui/icons-material/Add"
import { useNavigate } from "react-router-dom"
import { useManageProducts } from "./hooks/useManageProducts"
import ProductTable from "./components/ProductTable"

const ManageProductsScreen = () => {
  const navigate = useNavigate()
  const {
    searchText,
    setSearchText,
    products,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useManageProducts()

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        px: 3, py: 2, borderBottom: 1, borderColor: "divider", flexShrink: 0,
      }}>
        <Typography variant="h6" fontWeight={700}>Products</Typography>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button variant="outlined" disabled sx={{ textTransform: "none" }}>
            Bulk Add
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/pos/manage/products/create")}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            New Product
          </Button>
        </Box>
      </Box>

      {/* Search */}
      <Box sx={{ px: 3, py: 1.5, borderBottom: 1, borderColor: "divider", flexShrink: 0 }}>
        <TextField
          size="small"
          placeholder="Search by name or SKU…"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ width: 320 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Table */}
      <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        <ProductTable
          products={products}
          isLoading={isLoading}
          isFetching={isFetching}
          hasNextPage={hasNextPage ?? false}
          fetchNextPage={fetchNextPage}
        />
      </Box>

    </Box>
  )
}

export default ManageProductsScreen