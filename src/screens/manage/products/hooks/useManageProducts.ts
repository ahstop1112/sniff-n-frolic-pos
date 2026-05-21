import { useState, useCallback } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue"

const LIMIT = 20

const fetchManageProducts = async ({
  page,
  search,
}: {
  page: number
  search?: string
}) => {
  const token = localStorage.getItem("snf_pos_access_token")
  const url = new URL("/api/products/manage", window.location.origin)
  url.searchParams.set("page", String(page))
  url.searchParams.set("limit", String(LIMIT))
  if (search) url.searchParams.set("search", search)

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to fetch products")
  return res.json()
}

export const useManageProducts = () => {
  const [searchText, setSearchText] = useState("")
  const debouncedSearch = useDebouncedValue(searchText, 300)

  const handleSearch = useCallback((value: string) => {
    setSearchText(value)
  }, [])

  const query = useInfiniteQuery({
    queryKey: ["manage-products", { search: debouncedSearch }],
    queryFn: ({ pageParam = 1 }) =>
      fetchManageProducts({ page: pageParam as number, search: debouncedSearch || undefined }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === LIMIT ? allPages.length + 1 : undefined,
    staleTime: 30_000,
  })

  const products = query.data?.pages.flat() ?? []

  return {
    searchText,
    setSearchText: handleSearch,
    products,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
  }
}