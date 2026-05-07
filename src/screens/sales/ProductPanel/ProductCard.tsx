import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardActionArea from "@mui/material/CardActionArea"
import CardContent from "@mui/material/CardContent"
import CardMedia from "@mui/material/CardMedia"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import type { Product } from "@/domains/product/types/product.types"
import StockBadge from "./StockBadge"
import type { ProductPanelFlags } from "../hooks/useProductPanelFlags"

interface ProductCardProps {
  product: Product
  flags: ProductPanelFlags
  onAdd: (product: Product) => void
  onSelect: (product: Product) => void
  currency?: string
}

const ProductCard = ({
  product,
  flags,
  onAdd,
  onSelect,
  currency = "CAD",
}: ProductCardProps) => {
  const isOutOfStock = product.quantity === 0

  const displayPrice = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(product.salePrice ?? product.unitPrice)

  const regularPrice = new Intl.NumberFormat(undefined, {
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
        position: "relative"
      }}
    >
      {/* Info button — right top corner */}
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation()
          onSelect(product)
        }}
        sx={{
          position: "absolute",
          top: 6,
          right: 6,
          zIndex: 1,
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          width: 28,
          height: 28,
          "&:hover": { bgcolor: "grey.100" },
        }}
      >
        <InfoOutlinedIcon sx={{ fontSize: 16 }} />
      </IconButton>
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
            sx={{ 
                width: "100%",
                aspectRatio: "1 / 1",
                objectFit: "contain",
                p: 1,
                bgcolor: "grey.50"
              }}
            image={product.imageUrl ?? "/placeholder-product.png"}
            alt={product.name}
          />
        )}

        <CardContent sx={{ flex: 1, pb: "12px !important" }}>
          {/* Name */}
          <Typography variant="subtitle2" noWrap title={product.name}>
            {product.name}
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography variant="subtitle2" color="primary" noWrap>
                {displayPrice}
              </Typography>
              {product.salePrice && (
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ textDecoration: "line-through" }}
                >
                  {regularPrice}
                </Typography>
              )}
            </Box>
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
