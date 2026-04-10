import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardActionArea from "@mui/material/CardActionArea"
import CardContent from "@mui/material/CardContent"
import CardMedia from "@mui/material/CardMedia"
import Typography from "@mui/material/Typography"
import type { Product } from "@/domains/product/types/product.types"
import StockBadge from "./StockBadge"
import type { ProductPanelFlags } from "../hooks/useProductPanelFlags"

interface ProductCardProps {
  product: Product
  flags: ProductPanelFlags
  onAdd: (product: Product) => void
  currency?: string
}

const ProductCard = ({
  product,
  flags,
  onAdd,
  currency = "CAD",
}: ProductCardProps) => {
  const isOutOfStock = product.quantity === 0

  const price = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(product.unitPrice)

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        opacity: isOutOfStock ? 0.5 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <CardActionArea
        onClick={() => onAdd(product)}
        disabled={isOutOfStock}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        {/* Image */}
        {flags.showProductImage && (
          <CardMedia
            component="img"
            height={100}
            image={product.imageUrl ?? "/placeholder-product.png"}
            alt={product.name}
            sx={{ objectFit: "contain", p: 1, bgcolor: "grey.50" }}
          />
        )}

        <CardContent sx={{ flex: 1, pb: "12px !important" }}>
          {/* Name */}
          <Typography variant="subtitle2" noWrap title={product.name}>
            {product.name}
          </Typography>

          {/* SKU */}
          <Typography variant="caption" color="text.secondary" display="block">
            {product.sku}
          </Typography>

          {/* Price + stock */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 0.5,
              gap: 0.5,
            }}
          >
            <Typography variant="subtitle2" color="primary" noWrap>
              {price}
            </Typography>
            {flags.showStockBadge && (
              <StockBadge quantity={product.quantity} />
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default ProductCard;
