import { useState, useEffect } from "react"
import Drawer from "@mui/material/Drawer"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import Skeleton from "@mui/material/Skeleton"
import Divider from "@mui/material/Divider"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart"
import { useProductDetails } from "../hooks/useProductDetails"
import type { ProductVariation } from "../hooks/useProductDetails"

interface ProductDetailDrawerProps {
  slug: string | null
  onClose: () => void
  onAdd: (product: { id: string; name: string; price: number }) => void
}

const formatMoney = (value: number, currency = "CAD") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value)

const stripHtml = (html: string) =>
  html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim()

export const ProductDetailDrawer = ({
  slug,
  onClose,
  onAdd,
}: ProductDetailDrawerProps) => {
  const { data, isLoading } = useProductDetails(slug)
  const [activeImg, setActiveImg] = useState(0)
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null)

  useEffect(() => {
    setActiveImg(0)
    setSelectedVariation(null)
  }, [slug])

  // Reset variation when drawer opens new product
  const handleSelectVariation = (v: ProductVariation) => {
    setSelectedVariation(v)
    // Update image if variation has one
    if (v.imageUrl && data?.images) {
      const idx = data.images.indexOf(v.imageUrl)
      if (idx !== -1) setActiveImg(idx)
    }
  }

  const effectiveProduct = selectedVariation ?? null
  const displayPrice = selectedVariation
    ? selectedVariation.salePrice ?? selectedVariation.regularPrice
    : data?.salePrice ?? data?.regularPrice ?? 0

  const canAdd = data?.isVariable
    ? selectedVariation !== null && selectedVariation.stockStatus === "instock"
    : data?.stockStatus === "instock"

  const handleAdd = () => {
    if (!data) return

    if (data.isVariable && selectedVariation) {
      onAdd({
        id: selectedVariation.id,
        name: `${data.name} — ${selectedVariation.name}`,
        price: selectedVariation.salePrice ?? selectedVariation.regularPrice,
      })
    } else {
      onAdd({
        id: data.id,
        name: data.name,
        price: data.salePrice ?? data.regularPrice,
      })
    }
    onClose()
  }

  return (
    <Drawer
      anchor="right"
      open={!!slug}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 480 }, p: 0, display: "flex", flexDirection: "column" } }}
    >
      {/* Header */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        p: 2, borderBottom: 1, borderColor: "divider", flexShrink: 0
      }}>
        <Typography variant="subtitle1" fontWeight={700}>Product Details</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Scrollable content */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
        {isLoading || !data ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 2 }}>
              <Skeleton variant="rounded" height={200} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Skeleton width="80%" height={24} />
                <Skeleton width="40%" height={20} />
                <Skeleton width="50%" height={32} />
                <Skeleton width="30%" height={20} />
              </Box>
            </Box>
            <Skeleton height={80} />
            <Skeleton height={120} />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

            {/* Top — image + key info */}
            <Box sx={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 2 }}>

              {/* Image */}
              <Box sx={{
                aspectRatio: "1 / 1", borderRadius: 2, overflow: "hidden",
                bgcolor: "grey.50", border: 1, borderColor: "divider",
              }}>
                <img
                  src={
                    selectedVariation?.imageUrl ??
                    data.images?.[activeImg] ??
                    data.featuredImageUrl ??
                    "/placeholder-product.png"
                  }
                  alt={data.name}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </Box>

              {/* Key info */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.3 }}>
                  {data.name}
                </Typography>

                {data.category && (
                  <Chip label={data.category} size="small" sx={{ alignSelf: "flex-start" }} />
                )}

                {/* Price */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Typography variant="h6" fontWeight={900} color="primary">
                    {data.isVariable && !selectedVariation
                      ? `From ${formatMoney(data.regularPrice, data.currency)}`
                      : formatMoney(displayPrice, data.currency)
                    }
                  </Typography>
                  {selectedVariation?.salePrice && (
                    <Typography variant="body2" color="text.disabled"
                      sx={{ textDecoration: "line-through" }}>
                      {formatMoney(selectedVariation.regularPrice, data.currency)}
                    </Typography>
                  )}
                  {!data.isVariable && data.salePrice && (
                    <>
                      <Typography variant="body2" color="text.disabled"
                        sx={{ textDecoration: "line-through" }}>
                        {formatMoney(data.regularPrice, data.currency)}
                      </Typography>
                      <Chip label="On Sale" color="error" size="small" />
                    </>
                  )}
                </Box>

                {/* SKU */}
                {(selectedVariation?.sku ?? data.sku) && (
                  <Typography variant="caption" color="text.secondary">
                    SKU: {selectedVariation?.sku ?? data.sku}
                  </Typography>
                )}

                {/* Stock */}
                {!data.isVariable && (
                  <Chip
                    label={
                      data.stockStatus === "instock"
                        ? `In Stock${data.stockQuantity > 0 ? ` (${data.stockQuantity})` : ""}`
                        : "Out of Stock"
                    }
                    color={data.stockStatus === "instock" ? "success" : "error"}
                    size="small"
                    sx={{ alignSelf: "flex-start" }}
                  />
                )}

                {selectedVariation && (
                  <Chip
                    label={
                      selectedVariation.stockStatus === "instock"
                        ? `In Stock${selectedVariation.stockQuantity > 0 ? ` (${selectedVariation.stockQuantity})` : ""}`
                        : "Out of Stock"
                    }
                    color={selectedVariation.stockStatus === "instock" ? "success" : "error"}
                    size="small"
                    sx={{ alignSelf: "flex-start" }}
                  />
                )}
              </Box>
            </Box>

            {/* Thumbnail strip — simple products */}
            {!data.isVariable && data.images?.length > 1 && (
              <Box sx={{ display: "flex", gap: 0.75, overflowX: "auto" }}>
                {data.images.map((url: string, i: number) => (
                  <Box
                    key={i}
                    onClick={() => setActiveImg(i)}
                    sx={{
                      width: 48, height: 48, flexShrink: 0,
                      borderRadius: 1, overflow: "hidden",
                      border: 2,
                      borderColor: i === activeImg ? "primary.main" : "divider",
                      cursor: "pointer", bgcolor: "grey.50",
                    }}
                  >
                    <img src={url} alt=""
                      style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </Box>
                ))}
              </Box>
            )}

            {/* Variation selector */}
            {data.isVariable && data.variations.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary"
                  fontWeight={700} sx={{ letterSpacing: "0.08em", mb: 1, display: "block" }}>
                  SELECT OPTION
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {data.variations.map((v) => {
                    const isSelected = selectedVariation?.id === v.id
                    const isOutOfStock = v.stockStatus !== "instock"
                    return (
                      <Chip
                        key={v.id}
                        label={`${v.name} — ${formatMoney(v.salePrice ?? v.regularPrice, data.currency)}`}
                        onClick={() => !isOutOfStock && handleSelectVariation(v)}
                        variant={isSelected ? "filled" : "outlined"}
                        color={isSelected ? "primary" : "default"}
                        disabled={isOutOfStock}
                        sx={{
                          cursor: isOutOfStock ? "not-allowed" : "pointer",
                          opacity: isOutOfStock ? 0.5 : 1,
                          textDecoration: isOutOfStock ? "line-through" : "none",
                        }}
                      />
                    )
                  })}
                </Box>
                {!selectedVariation && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                    Please select an option
                  </Typography>
                )}
              </Box>
            )}

            <Divider />

            {/* Short description */}
            {data.shortDescription && (
              <Box>
                <Typography variant="caption" color="text.secondary"
                  fontWeight={700} sx={{ letterSpacing: "0.08em" }}>
                  OVERVIEW
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.7 }}>
                  {stripHtml(data.shortDescription)}
                </Typography>
              </Box>
            )}

            {/* Full description */}
            {data.description && (
              <Box>
                <Typography variant="caption" color="text.secondary"
                  fontWeight={700} sx={{ letterSpacing: "0.08em" }}>
                  DETAILS
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.8, whiteSpace: "pre-line" }}>
                  {stripHtml(data.description)}
                </Typography>
              </Box>
            )}

          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider", flexShrink: 0 }}>
        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<AddShoppingCartIcon />}
          onClick={handleAdd}
          disabled={isLoading || !canAdd}
          sx={{ borderRadius: 2, fontWeight: 800, textTransform: "none", py: 1.5 }}
        >
          {!data
            ? "Add to Cart"
            : data.isVariable && !selectedVariation
              ? "Select an option"
              : `Add to Cart — ${formatMoney(displayPrice, data.currency)}`
          }
        </Button>
      </Box>
    </Drawer>
  )
}

export default ProductDetailDrawer