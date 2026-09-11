import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue"

export interface CatalogueProduct {
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

interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
}

const fetchAllProducts = async (): Promise<CatalogueProduct[]> => {
  const token = localStorage.getItem("snf_pos_access_token")
  const url = new URL("/api/products/manage", window.location.origin)
  url.searchParams.set("limit", "200")
  url.searchParams.set("page", "1")
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to fetch products")
  return res.json()
}

const fetchCategories = async (): Promise<Category[]> => {
  const res = await fetch("/api/categories")
  if (!res.ok) throw new Error("Failed to fetch categories")
  return res.json()
}

export const useProductsHub = () => {
  const [searchText, setSearchText] = useState("")
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null)
  const debouncedSearch = useDebouncedValue(searchText, 300)

  const productsQuery = useQuery({
    queryKey: ["products-hub"],
    queryFn: fetchAllProducts,
    staleTime: 30_000,
  })

  const categoriesQuery = useQuery({
    queryKey: ["products-hub-categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  })

  const allProducts = useMemo(() => productsQuery.data ?? [], [productsQuery.data])
  const topCategories = useMemo(
    () => (categoriesQuery.data ?? []).filter((c) => c.parent_id === null),
    [categoriesQuery.data],
  )

  const activeCategory = useMemo(
    () => topCategories.find((c) => c.slug === activeCategorySlug) ?? null,
    [topCategories, activeCategorySlug],
  )

  const filtered = useMemo(() => {
    let list = allProducts
    if (activeCategory) {
      list = list.filter((p) => p.category_names.includes(activeCategory.name))
    }
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku?.toLowerCase().includes(q) ?? false),
      )
    }
    return list
  }, [allProducts, activeCategory, debouncedSearch])

  const liveCount = useMemo(
    () => allProducts.filter((p) => p.status === "published").length,
    [allProducts],
  )
  const draftCount = useMemo(
    () => allProducts.filter((p) => p.status === "draft").length,
    [allProducts],
  )
  const archivedCount = useMemo(
    () => allProducts.filter((p) => p.status === "archived").length,
    [allProducts],
  )
  const onSaleCount = useMemo(
    () => allProducts.filter((p) => p.sale_price !== null).length,
    [allProducts],
  )

  const totalRetailValue = useMemo(
    () => allProducts.reduce((sum, p) => sum + (p.effective_price / 100) * p.stock_quantity, 0),
    [allProducts],
  )
  const totalUnits = useMemo(
    () => allProducts.reduce((sum, p) => sum + p.stock_quantity, 0),
    [allProducts],
  )
  const supplierCount = useMemo(
    () => new Set(allProducts.flatMap((p) => p.brand_names)).size,
    [allProducts],
  )

  return {
    searchText,
    setSearchText,
    activeCategorySlug,
    setActiveCategorySlug,
    products: filtered,
    totalProducts: allProducts.length,
    categories: topCategories,
    categoryCount: topCategories.length,
    supplierCount,
    liveCount,
    draftCount,
    archivedCount,
    onSaleCount,
    totalRetailValue,
    totalUnits,
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
  }
}
