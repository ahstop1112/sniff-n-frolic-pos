import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Skeleton from "@mui/material/Skeleton"
import Typography from "@mui/material/Typography"
import type { Product } from "@/domains/product/types/product.types"
import ProductCard from "./ProductCard"
import type { ProductPanelFlags } from "../hooks/useProductPanelFlags"

interface ProductGridProps {
  products: Product[]
  flags: ProductPanelFlags
  isLoading?: boolean
  onAdd: (product: Product) => void
  onSelect: (product: Product) => void
  currency?: string
}

const SKELETON_COUNT = 12

const ProductGrid = ({
  products,
  flags,
  isLoading,
  onAdd,
  onSelect,
  currency,
}: ProductGridProps) => {
  const safeProducts = Array.isArray(products) ? products : []

  // gridColumns flag → MUI v6 size prop
  const colSize = { 2: 6, 3: 4, 4: 3 }[flags.gridColumns] as 3 | 4 | 6

  if (isLoading) {
    return (
      <Grid container spacing={1.5} sx={{ p: 1.5 }}>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <Grid key={i} size={{ xs: 6, sm: 4, lg: 3 }}>
            <Skeleton variant="rounded" height={flags.showProductImage ? 180 : 90} />
          </Grid>
        ))}
      </Grid>
    )
  }

  if (safeProducts.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          No products found.
        </Typography>
      </Box>
    )
  }

  return (
    <Grid container spacing={1.5} sx={{ p: 1.5 }}>
      {safeProducts.map((p) => (
        <Grid size={{ xs: 6, sm: colSize }} key={p.id}>
          <ProductCard
            product={p}
            flags={flags}
            onAdd={onAdd}
            onSelect={onSelect}
            currency={currency}
          />
        </Grid>
      ))}
    </Grid>
  )
}

export default ProductGrid