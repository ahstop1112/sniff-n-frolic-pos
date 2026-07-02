import { useRef, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Chip from "@mui/material/Chip"
import Skeleton from "@mui/material/Skeleton"
import CircularProgress from "@mui/material/CircularProgress"
import EditIcon from "@mui/icons-material/Edit"
import InventoryIcon from "@mui/icons-material/Inventory"
import IconButton from "@mui/material/IconButton"
import StockAdjustDialog from "./StockAdjustDialog"

interface Product {
  id: string
  name: string
  slug: string
  sku: string | null
  product_type: string
  status: string
  regular_price: number
  sale_price: number | null
  effective_price: number
  stock_status: string
  stock_quantity: number
  featured_image_url: string | null
  brand_names: string[]
  category_names: string[]
}

interface ProductTableProps {
  products: Product[]
  isLoading: boolean
  isFetching: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
}

const formatMoney = (cents: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 2,
  }).format(cents / 100)

const statusColor = (status: string): "success" | "warning" | "default" => {
  if (status === "published") return "success"
  if (status === "draft")     return "warning"
  return "default"
}

interface StockTarget {
  id: string
  name: string
  stock_quantity: number
  stock_status: string
}

const ProductTable = ({
  products,
  isLoading,
  isFetching,
  hasNextPage,
  fetchNextPage,
}: ProductTableProps) => {
  const navigate = useNavigate()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [stockTarget, setStockTarget] = useState<StockTarget | null>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetching) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetching, fetchNextPage])

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, p: 2 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={56} />
        ))}
      </Box>
    )
  }

  if (products.length === 0) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          No products found.
        </Typography>
      </Box>
    )
  }

  const columnsWidth = "84px 1fr 100px 120px 120px 80px 100px 80px 40px 40px";

  return (
    <Box>
      {stockTarget && (
        <StockAdjustDialog
          open={!!stockTarget}
          onClose={() => setStockTarget(null)}
          productId={stockTarget.id}
          productName={stockTarget.name}
          currentQty={stockTarget.stock_quantity}
          currentStatus={stockTarget.stock_status}
        />
      )}

      {/* Table header */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: columnsWidth,
        gap: 2, px: 2, py: 1,
        borderBottom: 1, borderColor: "divider",
        bgcolor: "grey.50",
      }}>
        {["", "Name", "Category", "Price", "Stock", "Status", "Type", "", ""].map((h, i) => (
          <Typography key={`${h}-${i}`} variant="caption" color="text.secondary" fontWeight={700}
            sx={{ letterSpacing: "0.06em" }}>
            {h}
          </Typography>
        ))}
      </Box>

      {/* Rows */}
      {products.map((p) => (
        <Box
          key={p.id}
          onClick={() => navigate(`/pos/manage/products/${p.slug}`)}
          sx={{
            display: "grid",
            gridTemplateColumns: columnsWidth,
            gap: 2, px: 2, py: 1.5,
            borderBottom: 1, borderColor: "divider",
            alignItems: "center",
            cursor: "pointer",
            "&:hover": { bgcolor: "grey.50" },
            transition: "background 0.15s",
          }}
        >
          {/* Image */}
          <Box sx={{
            width: 80, height: 80, borderRadius: 1,
            overflow: "hidden", bgcolor: "grey.100", flexShrink: 0,
          }}>
            {p.featured_image_url ? (
              <img src={p.featured_image_url} alt={p.name}
                style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            ) : null}
          </Box>

          {/* Name + SKU */}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={500} noWrap>{p.name}</Typography>
            {p.sku && (
              <Typography variant="caption" color="text.secondary" noWrap>
                SKU: {p.sku}
              </Typography>
            )}
          </Box>
          {/* Brands */}
          <Typography variant="body2" color="text.secondary">
            {p.brand_names.length > 0 ? p.brand_names.map((name) => <div key={name}>{name}</div>) : "No Brand"}
          </Typography>
          
          {/* Category */}
          <Typography variant="body2" color="text.secondary">
            {p.category_names.length > 0 ? p.category_names.map((name) => <div key={name}>{name}</div>) : "Uncategorized"}
          </Typography>

          {/* Price */}
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {formatMoney(p.effective_price)}
            </Typography>
            {p.sale_price && (
              <Typography variant="caption" color="text.disabled"
                sx={{ textDecoration: "line-through" }}>
                {formatMoney(p.regular_price)}
              </Typography>
            )}
          </Box>

          {/* Stock */}
          <Typography
            variant="body2"
            color={p.stock_quantity <= 3 ? "error.main" : "text.primary"}
            fontWeight={p.stock_quantity <= 3 ? 700 : 400}
          >
            {p.stock_quantity}
          </Typography>

          {/* Status */}
          <Chip
            label={p.status}
            size="small"
            color={statusColor(p.status)}
          />

          {/* Type */}
          <Typography variant="caption" color="text.secondary">
            {p.product_type}
          </Typography>

          <IconButton
            size="small"
            title="Adjust stock"
            onClick={(e) => {
              e.stopPropagation()
              setStockTarget({ id: p.id, name: p.name, stock_quantity: p.stock_quantity, stock_status: p.stock_status })
            }}
          >
            <InventoryIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/pos/manage/products/${p.slug}`)
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}

      {/* Sentinel */}
      <div ref={sentinelRef} style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {isFetching && <CircularProgress size={20} />}
      </div>
    </Box>
  )
}

export default ProductTable;