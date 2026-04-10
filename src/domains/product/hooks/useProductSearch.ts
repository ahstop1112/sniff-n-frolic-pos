// Product search with React Query
import { useQuery } from "@tanstack/react-query"
import type { ProductSearchFilters } from "../types/product.types"

export const useProductSearch = (filters: ProductSearchFilters) => {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 30_000,
  })
}

// TODO: replace with real API call
const fetchProducts = async (filters: ProductSearchFilters) => {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  })
  return res.json()
}
