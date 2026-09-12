import { useMemo } from "react"
import { useQueries, useQuery } from "@tanstack/react-query"
import { useStock } from "@/domains/inventory/hooks/useStock"

// A minimal product shape used only by the Inventory hub cards.
export interface HubProduct {
  id: string
  name: string
  slug: string
  sku: string | null
  image_url: string | null
  effective_price: number | null
  regular_price: number | null
  sale_price: number | null
  stock_quantity: number
  stock_status: string
  is_low_stock: boolean
}

export interface HubCategory {
  id: string
  name: string
  slug: string
  parent_id: string | null
  count?: number
}

interface RawProductRow {
  id: string
  name: string
  slug: string
  sku?: string | null
  featured_image_url?: string | null
  image_url?: string | null
  images?: Array<{ url: string }>
  effective_price?: number | null
  regular_price?: number | null
  sale_price?: number | null
  stock_quantity?: number | null
  stock_status?: string | null
  is_low_stock?: boolean
}

const LOW_STOCK_THRESHOLD = 5

const normalizeProduct = (raw: RawProductRow): HubProduct => {
  const stockQuantity = raw.stock_quantity ?? 0
  const stockStatus = raw.stock_status ?? (stockQuantity > 0 ? "instock" : "outofstock")
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    sku: raw.sku ?? null,
    image_url: raw.featured_image_url ?? raw.image_url ?? raw.images?.[0]?.url ?? null,
    effective_price: raw.effective_price ?? null,
    regular_price: raw.regular_price ?? null,
    sale_price: raw.sale_price ?? null,
    stock_quantity: stockQuantity,
    stock_status: stockStatus,
    is_low_stock: raw.is_low_stock ?? (stockQuantity > 0 && stockQuantity <= LOW_STOCK_THRESHOLD),
  }
}

const fetchCategories = async (): Promise<HubCategory[]> => {
  const res = await fetch("/api/categories")
  if (!res.ok) throw new Error("Failed to fetch categories")
  return res.json()
}

const fetchProductsByCategory = async (categorySlug: string, limit: number): Promise<HubProduct[]> => {
  const url = new URL("/api/products", window.location.origin)
  url.searchParams.set("category", categorySlug)
  url.searchParams.set("limit", String(limit))
  url.searchParams.set("page", "1")
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Failed to fetch products for ${categorySlug}`)
  const rows = (await res.json()) as RawProductRow[]
  // Exclude variable parent products — they aren't individually stockable;
  // their variation children are tracked separately in the stock endpoint.
  return rows.filter((r) => r.product_type !== "variable").map(normalizeProduct)
}

export interface CategoryGridSlice {
  category: HubCategory
  products: HubProduct[]
  isLoading: boolean
  isError: boolean
}

interface UseInventoryHubOptions {
  perCategoryLimit?: number
  activeCategorySlug?: string | null
  visibleCategoryCap?: number
}

export const useInventoryHub = ({
  perCategoryLimit = 8,
  activeCategorySlug = null,
  visibleCategoryCap = 6,
}: UseInventoryHubOptions = {}) => {
  const categoriesQuery = useQuery({
    queryKey: ["inventory-hub-categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  })

  const topLevelCategories = (categoriesQuery.data ?? []).filter((c) => c.parent_id === null)
  const visibleCategories = activeCategorySlug
    ? topLevelCategories.filter((c) => c.slug === activeCategorySlug)
    : topLevelCategories.slice(0, visibleCategoryCap)

  const perCategoryQueries = useQueries({
    queries: visibleCategories.map((category) => ({
      queryKey: ["inventory-hub-category-products", category.slug, perCategoryLimit],
      queryFn: () => fetchProductsByCategory(category.slug, perCategoryLimit),
      staleTime: 30_000,
      enabled: categoriesQuery.isSuccess,
    })),
  })

  // Stock endpoint is the source of truth for live quantities.
  // Use a generous limit so the map covers the full catalogue.
  const stockQuery = useStock({ limit: 1000 })

  const stockMap = useMemo(() => {
    const map = new Map<string, { stock_quantity: number; stock_status: string | null; is_low_stock: boolean }>()
    for (const item of stockQuery.data?.items ?? []) {
      map.set(item.id, {
        stock_quantity: item.stock_quantity,
        stock_status: item.stock_status,
        is_low_stock: item.is_low_stock,
      })
    }
    return map
  }, [stockQuery.data])

  // Overlay live stock data onto the catalog product rows.
  const applyStock = (p: HubProduct): HubProduct => {
    const live = stockMap.get(p.id)
    if (!live) return p
    const sq = live.stock_quantity
    return {
      ...p,
      stock_quantity: sq,
      stock_status: live.stock_status ?? (sq > 0 ? "instock" : "outofstock"),
      is_low_stock: live.is_low_stock,
    }
  }

  const slices: CategoryGridSlice[] = visibleCategories.map((category, i) => ({
    category,
    products: (perCategoryQueries[i]?.data ?? []).map(applyStock),
    isLoading: perCategoryQueries[i]?.isLoading ?? true,
    isError: perCategoryQueries[i]?.isError ?? false,
  }))

  const totalSkus = stockQuery.data?.total ?? 0
  const lowCount = (stockQuery.data?.items ?? []).filter((s) => s.is_low_stock).length
  const outCount = (stockQuery.data?.items ?? []).filter((s) => s.stock_quantity === 0).length
  const unitsOnHand = stockQuery.data
    ? (stockQuery.data.items ?? []).reduce((sum, s) => sum + s.stock_quantity, 0)
    : null

  return {
    totalSkus,
    lowCount,
    outCount,
    unitsOnHand,
    categories: topLevelCategories,
    slices,
    isCategoriesLoading: categoriesQuery.isLoading,
    isCategoriesError: categoriesQuery.isError,
    isStockError: stockQuery.isError,
    isStockLoading: stockQuery.isLoading,
  }
}
