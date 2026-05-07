import { useQuery } from "@tanstack/react-query"

export interface ProductVariation {
  id: string
  slug: string
  name: string
  sku: string | null
  regularPrice: number
  salePrice: number | null
  stockStatus: string
  stockQuantity: number
  imageUrl: string | null
}

export interface ProductDetail {
  id: string
  name: string
  slug: string
  sku: string | null
  description: string | null
  shortDescription: string | null
  regularPrice: number
  salePrice: number | null
  currency: string
  stockStatus: string
  stockQuantity: number
  images: string[]
  featuredImageUrl: string | null
  category: string
  isVariable: boolean
  variations: ProductVariation[]
}

const fetchProductDetail = async (slug: string) => {
    const res = await fetch(`/api/products/${slug}`)
    if (!res.ok) throw new Error("Failed to fetch product detail")
    const p = await res.json()
    
    const variations: ProductVariation[] = (p.variations ?? []).map((v: any) => ({
        id: v.id,
        slug: v.slug,
        name: v.name,
        sku: v.sku ?? null,
        regularPrice: (v.effective_price || v.regular_price || 0) / 100,
        salePrice: v.sale_price ? v.sale_price / 100 : null,
        stockStatus: v.stock_status ?? "outofstock",
        stockQuantity: v.stock_quantity ?? 0,
        imageUrl: v.featured_image_url ?? null,
    }))

    const isVariable = p.product_type === "variable"

    const regularPrice = isVariable && variations.length > 0
        ? Math.min(...variations.map((v) => v.regularPrice))
        : (p.effective_price || p.regular_price || 0) / 100

    const salePrice = isVariable
        ? null
        : p.sale_price ? p.sale_price / 100 : null

    return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        description: p.description ?? null,
        shortDescription: p.short_description ?? null,
        regularPrice,
        salePrice,
        currency: p.currency ?? "CAD",
        stockStatus: p.stock_status,
        stockQuantity: p.stock_quantity ?? 0,
        images: (p.images ?? []).map((img: any) => img.url),
        featuredImageUrl: p.featured_image_url,
        category: p.category_name ?? "",
        isVariable,
        variations,
    }
}

export const useProductDetails = (slug: string | null) => {
  return useQuery({
    queryKey: ["product-detail", slug],
    queryFn: () => fetchProductDetail(slug!),
    enabled: !!slug,
    staleTime: 5 * 60_000,
  })
}