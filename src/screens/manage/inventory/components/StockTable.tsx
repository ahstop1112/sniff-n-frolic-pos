import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import Skeleton from "@mui/material/Skeleton"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import StockBadge from "@/domains/inventory/components/StockBadge"
import type { StockItem } from "@/domains/inventory/types/inventory.types"

interface StockTableProps {
  items: StockItem[]
  isLoading: boolean
  autoExpandParentIds?: Set<string>
}

const columnsWidth = "40px 1fr 160px 120px 120px"
const headers = ["", "Product", "SKU", "Stock", "Action"]

interface Group {
  parent: {
    id: string
    name: string
    totalStock: number
  }
  children: StockItem[]
}

const groupItems = (items: StockItem[]): { simples: StockItem[]; groups: Group[] } => {
  const simples: StockItem[] = []
  const groupMap = new Map<string, Group>()

  for (const item of items) {
    if (!item.parent_id) {
      simples.push(item)
      continue
    }
    const existing = groupMap.get(item.parent_id)
    if (existing) {
      existing.children.push(item)
      existing.parent.totalStock += item.manage_stock ? item.stock_quantity : 0
    } else {
      groupMap.set(item.parent_id, {
        parent: {
          id: item.parent_id,
          name: item.parent_name ?? "Unnamed parent",
          totalStock: item.manage_stock ? item.stock_quantity : 0,
        },
        children: [item],
      })
    }
  }

  return { simples, groups: Array.from(groupMap.values()) }
}

const AdjustButton = ({ productId }: { productId: string }) => {
  const navigate = useNavigate()
  return (
    <Button
      size="small"
      variant="outlined"
      onClick={() => navigate(`/pos/manage/inventory/adjust?productId=${productId}`)}
      sx={{ textTransform: "none" }}
    >
      Adjust
    </Button>
  )
}

const StockRow = ({ item, indent = false }: { item: StockItem; indent?: boolean }) => (
  <Box sx={{
    display: "grid",
    gridTemplateColumns: columnsWidth,
    gap: 2, px: 2, py: 1.25,
    borderBottom: 1, borderColor: "divider",
    alignItems: "center",
    pl: indent ? 6 : 2,
    bgcolor: indent ? "grey.50" : "transparent",
  }}>
    <Box />
    <Typography variant="body2" fontWeight={indent ? 400 : 500}>
      {item.name}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {item.sku ?? "—"}
    </Typography>
    <StockBadge
      quantity={item.stock_quantity}
      manageStock={item.manage_stock}
      isLowStock={item.is_low_stock}
    />
    {item.manage_stock ? <AdjustButton productId={item.id} /> : <Box />}
  </Box>
)

const StockTable = ({ items, isLoading, autoExpandParentIds }: StockTableProps) => {
  const [manualExpanded, setManualExpanded] = useState<Set<string>>(new Set())
  const { simples, groups } = useMemo(() => groupItems(items), [items])

  const isExpanded = (parentId: string) =>
    manualExpanded.has(parentId) || (autoExpandParentIds?.has(parentId) ?? false)

  const toggle = (parentId: string) => {
    setManualExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(parentId)) next.delete(parentId)
      else next.add(parentId)
      return next
    })
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, p: 2 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={44} />
        ))}
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: columnsWidth,
        gap: 2, px: 2, py: 1,
        borderBottom: 1, borderColor: "divider",
        bgcolor: "grey.50",
      }}>
        {headers.map((h, i) => (
          <Typography key={`${h}-${i}`} variant="caption" color="text.secondary" fontWeight={700}
            sx={{ letterSpacing: "0.06em" }}>
            {h}
          </Typography>
        ))}
      </Box>

      {/* Groups first */}
      {groups.map((g) => {
        const expanded = isExpanded(g.parent.id)
        return (
          <Box key={`group-${g.parent.id}`}>
            <Box
              onClick={() => toggle(g.parent.id)}
              sx={{
                display: "grid",
                gridTemplateColumns: columnsWidth,
                gap: 2, px: 2, py: 1.25,
                borderBottom: 1, borderColor: "divider",
                alignItems: "center",
                cursor: "pointer",
                "&:hover": { bgcolor: "grey.50" },
              }}
            >
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggle(g.parent.id) }}>
                {expanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
              </IconButton>
              <Typography variant="body2" fontWeight={600}>{g.parent.name}</Typography>
              <Typography variant="caption" color="text.secondary">—</Typography>
              <Typography variant="body2" fontWeight={600}>{g.parent.totalStock}</Typography>
              <Box />
            </Box>
            {expanded && g.children.map((child) => (
              <StockRow key={child.id} item={child} indent />
            ))}
          </Box>
        )
      })}

      {/* Simples */}
      {simples.map((item) => (
        <StockRow key={item.id} item={item} />
      ))}
    </Box>
  )
}

export default StockTable
