import Box from "@mui/material/Box"
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
    <Box
      role="button"
      tabIndex={0}
      onClick={() => !isOutOfStock && onAdd(product)}
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: 1.25,
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        opacity: isOutOfStock ? 0.5 : 1,
        cursor: isOutOfStock ? "not-allowed" : "pointer",
        transition: "border-color 0.12s, transform 0.12s",
        "&:hover": !isOutOfStock ? {
          borderColor: "primary.main",
        } : undefined,
      }}
    >
      {/* Info button — subtle top-right */}
      <IconButton
        size="small"
        onClick={(e) => { e.stopPropagation(); onSelect(product) }}
        sx={{
          position: "absolute", top: 4, right: 4, zIndex: 1,
          width: 24, height: 24,
          bgcolor: "transparent",
          border: "none",
          color: "text.disabled",
          "&:hover": { color: "text.secondary", bgcolor: "action.hover" },
        }}
      >
        <InfoOutlinedIcon sx={{ fontSize: 14 }} />
      </IconButton>

      {/* Image */}
      {flags.showProductImage && (
        <Box sx={{
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: 2,
          bgcolor: "grey.50",
          overflow: "hidden",
          display: "grid",
          placeItems: "center",
          mb: 1,
        }}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : null}
        </Box>
      )}

      {/* Name */}
      <Typography
        variant="body2"
        fontWeight={600}
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          lineHeight: 1.25,
          minHeight: "2.5em",
        }}
        title={product.name}
      >
        {product.name}
      </Typography>

      {/* Price + stock */}
      <Box sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mt: 0.75,
        gap: 0.5,
      }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={800} color="text.primary" noWrap>
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
        {flags.showStockBadge && <StockBadge quantity={product.quantity} />}
      </Box>
    </Box>
  )
}

export default ProductCard
