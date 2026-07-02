import { useState, useCallback, useRef } from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue"
import { getBarcodeType } from "@/domains/product/hooks/useBarcode"

const LIMIT = 20

export type SortOption = "newest" | "price_asc" | "price_desc" | "name_asc"

interface RawProduct {
  id: string
  name: string
  slug: string
  effective_price?: number
  regular_price?: number
  min_variation_price?: number
  sale_price?: number | null
  description?: string | null
  stock_status: string
  category_name?: string | null
  image_url?: string | null
  images?: Array<{ url: string }>
}

interface RawCategory {
  id: string
  name: string
  slug: string
  parent_id: string | null
  [key: string]: unknown
}

interface FetchProductsParams {
  page: number
  limit: number
  category?: string
  search?: string
  brand?: string
  on_sale?: boolean
  sort?: SortOption
}

const fetchProducts = async (params: FetchProductsParams) => {
  const url = new URL("/api/products", window.location.origin)
  url.searchParams.set("page", String(params.page))
  url.searchParams.set("limit", String(params.limit))
  if (params.category) url.searchParams.set("category", params.category)
  if (params.search)   url.searchParams.set("search", params.search)
  if (params.brand)    url.searchParams.set("brand", params.brand)
  if (params.on_sale)  url.searchParams.set("on_sale", "true")
  if (params.sort)     url.searchParams.set("sort", params.sort)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error("Failed to fetch products")
  const data = (await res.json()) as RawProduct[]
  return data.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.slug,
    unitPrice: (p.effective_price || p.regular_price || p.min_variation_price || 0) / 100,
    salePrice: p.sale_price ? p.sale_price / 100 : null,
    description: p.description ?? null,
    taxRate: 0,
    quantity: p.stock_status === "instock" ? 99 : 0,
    category: p.category_name ?? "",
    imageUrl: p.image_url ?? p.images?.[0]?.url ?? undefined,
    isActive: true,
  }))
}

const fetchCategories = async () => {
  const res = await fetch("/api/categories")
  if (!res.ok) throw new Error("Failed to fetch categories")
  return res.json()
}

const fetchBrands = async () => {
  const res = await fetch("/api/brands")
  if (!res.ok) throw new Error("Failed to fetch brands")
  return res.json()
}

export const useProductPanel = () => {
  const [searchText, setSearchText]           = useState("")
  const [activeCategorySlug, setCategory]     = useState<string | null>(null)
  const [activeBrandSlug, setBrand]           = useState<string | null>(null)
  const [onSale, setOnSale]                   = useState(false)
  const [sort, setSort]                       = useState<SortOption>("newest")
  // Tracks whether the last search was triggered by a barcode scan
  const isBarcodeScanRef                      = useRef(false)

  const debouncedSearch = useDebouncedValue(searchText, 300)

  const handleSearch = useCallback((value: string) => {
    isBarcodeScanRef.current = false
    setSearchText(value)
  }, [])

  const handleCategory = useCallback((id: string | null) => {
    setCategory(id)
  }, [])

  const handleBrand = useCallback((slug: string | null) => {
    setBrand((prev) => (prev === slug ? null : slug))
  }, [])

  const handleBarcode = useCallback((barcode: string) => {
    const type = getBarcodeType(barcode)
    const searchValue = type === "product" ? barcode.slice(1) : barcode
    isBarcodeScanRef.current = true
    setSearchText(searchValue)
  }, [])

  const productsQuery = useInfiniteQuery({
    queryKey: ["products", {
      category: activeCategorySlug,
      search: debouncedSearch,
      brand: activeBrandSlug,
      on_sale: onSale,
      sort,
    }],
    queryFn: ({ pageParam = 1 }) =>
      fetchProducts({
        page: pageParam as number,
        limit: LIMIT,
        category: activeCategorySlug ?? undefined,
        search: debouncedSearch || undefined,
        brand: activeBrandSlug ?? undefined,
        on_sale: onSale || undefined,
        sort,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === LIMIT ? allPages.length + 1 : undefined,
    staleTime: 30_000,
  })

  const categoriesQuery = useQuery({
    queryKey: ["product-categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  })

  const brandsQuery = useQuery({
    queryKey: ["product-brands"],
    queryFn: fetchBrands,
    staleTime: 5 * 60_000,
  })

  const products = productsQuery.data?.pages.flatMap((p) => Array.isArray(p) ? p : [p]) ?? []

  return {
    // Search
    searchText,
    setSearchText: handleSearch,
    // Barcode
    handleBarcode,
    isBarcodeScan: isBarcodeScanRef,
    // Category
    activeCategorySlug,
    setCategory: handleCategory,
    categories: (categoriesQuery.data as RawCategory[] | undefined)?.filter((c) => c.parent_id === null) ?? [],
    // Brand
    activeBrandSlug,
    setBrand: handleBrand,
    brands: brandsQuery.data ?? [],
    // On-sale
    onSale,
    setOnSale,
    // Sort
    sort,
    setSort,
    // Products
    products,
    isLoading: productsQuery.isLoading,
    isFetching: productsQuery.isFetching,
    hasNextPage: productsQuery.hasNextPage,
    fetchNextPage: productsQuery.fetchNextPage,
  }
}
