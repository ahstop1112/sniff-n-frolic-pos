import { useState, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue"

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
  console.log("products response:", data)
  return data.map((p: any) => ({
    id: p.id,
    name: p.name,
    sku: p.slug,
    unitPrice: p.regular_price / 100, // cents to dollars
    taxRate: 0,
    quantity: p.stock_status === "instock" ? 99 : 0,
    category: p.category ?? "",
    imageUrl: p.image_url ?? p.images?.[0]?.url,
    isActive: true,
  }))
}

const fetchCategories = async () => {
  const res = await fetch("/api/categories")
  if (!res.ok) throw new Error("Failed to fetch categories")
  const data = await res.json()
  console.log("categories response:", data)
  return data
}

export const useProductPanel = () => {
  const [searchText, setSearchText]     = useState("")
  const [activeCategorySlug, setCategory] = useState<string | null>(null)
  const [page, setPage]                 = useState(1)

  // Debounce search — avoid hitting API on every keystroke
  const debouncedSearch = useDebouncedValue(searchText, 300)

  // Reset page when search or category changes
  const handleSearch = useCallback((value: string) => {
    setSearchText(value)
    setPage(1)
  }, [])

  const handleCategory = useCallback((id: string | null) => {
    setCategory(id)
    setPage(1)
  }, [])

  const productsQuery = useQuery({
    queryKey: ["products", { page, category: activeCategorySlug, search: debouncedSearch }],
    queryFn: () => fetchProducts({
      page,
      limit: 20,
      category: activeCategorySlug ?? undefined,
      search: debouncedSearch || undefined,
    }),
    staleTime: 30_000,
    placeholderData: (prev) => prev, // keep previous data while fetching
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
    products: productsQuery.data ?? [],
    total: productsQuery.data?.length ?? 0,
    isLoading: productsQuery.isLoading,
    isFetching: productsQuery.isFetching,
    // Pagination
    page,
    setPage,
  }
}
