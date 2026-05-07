import { useState, useCallback } from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue"

const LIMIT = 20

interface FetchProductsParams {
  page: number
  limit: number
  category?: string
  search?: string
}

const fetchProducts = async (params: FetchProductsParams) => {
  const url = new URL("/api/products", window.location.origin)
  url.searchParams.set("page", String(params.page))
  url.searchParams.set("limit", String(params.limit))
  if (params.category) url.searchParams.set("category", params.category)
  if (params.search)   url.searchParams.set("search", params.search)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error("Failed to fetch products")
  const data = await res.json()
  // console.log("products response:", data)
  return data.map((p: any) => ({
    id: p.id,
    name: p.name,
    sku: p.slug,
    unitPrice: (p.effective_price || p.regular_price || p.min_variation_price || 0) / 100,
    salePrice: p.sale_price ? p.sale_price / 100 : null,
    description: p.description ?? null,
    taxRate: 0,
    quantity: p.stock_status === "instock" ? 99 : 0,
    category: p.category_name ?? "",
    imageUrl: p.image_url ?? p.images?.[0]?.url,
    isActive: true,
  }))
}

const fetchCategories = async () => {
  const res = await fetch("/api/categories")
  if (!res.ok) throw new Error("Failed to fetch categories")
  const data = await res.json()
  // console.log("categories response:", data)
  return data
}

export const useProductPanel = () => {
  const [searchText, setSearchText]     = useState("")
  const [activeCategorySlug, setCategory] = useState<string | null>(null)

  // Debounce search — avoid hitting API on every keystroke
  const debouncedSearch = useDebouncedValue(searchText, 300)

  // Reset page when search or category changes
  const handleSearch = useCallback((value: string) => {
    setSearchText(value)
  }, [])

  const handleCategory = useCallback((id: string | null) => {
    setCategory(id)
  }, [])

  const productsQuery = useInfiniteQuery({
    queryKey: ["products", { category: activeCategorySlug, search: debouncedSearch }],
    queryFn: ({ pageParam = 1 }) =>
      fetchProducts({
        page: pageParam as number,
        limit: LIMIT,
        category: activeCategorySlug ?? undefined,
        search: debouncedSearch || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === LIMIT ? allPages.length + 1 : undefined,
    staleTime: 30_000,
  })

  const categoriesQuery = useQuery({
    queryKey: ["product-categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000, // 5 minutes
  })

  return {
    // Search
    searchText,
    setSearchText: handleSearch,
    // Category
    activeCategorySlug,
    setCategory: handleCategory,
    categories: categoriesQuery.data?.filter((c: any) => c.parent_id === null) ?? [],
    // Products
    products: productsQuery.data?.pages.flatMap((p) => Array.isArray(p) ? p : [p]) ?? [],
    total: productsQuery.data,
    isLoading: productsQuery.isLoading,
    isFetching: productsQuery.isFetching,
    hasNextPage: productsQuery.hasNextPage,
    fetchNextPage: productsQuery.fetchNextPage,
  }
}
