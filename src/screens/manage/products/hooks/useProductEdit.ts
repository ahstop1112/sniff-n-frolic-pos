import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { type ProductImage } from "../components/ProductImagesEditor"

export interface Category {
  id: string
  name: string
  slug: string
} 

export interface Brand {
  id: string
  name: string
  slug: string
}

const getToken = () => localStorage.getItem("snf_pos_access_token")

const fetchProduct = async (slug: string) => {
  const res = await fetch(`/api/products/${slug}?manage=true`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error("Failed to fetch product")
  return res.json()
}

const fetchCategories = async (): Promise<Category[]> => {
  const res = await fetch(`/api/categories`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error("Failed to fetch categories")
  return res.json()
}

const createProduct = async (dto: object) => {
  const res = await fetch(`/api/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(dto),
  })
  if (!res.ok) throw new Error("Failed to create product")
  return res.json()
}

const updateProduct = async ({ id, dto }: { id: string; dto: object }) => {
  const res = await fetch(`/api/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(dto),
  })
  if (!res.ok) throw new Error("Failed to update product")
  return res.json()
}

const deleteProduct = async (id: string) => {
  const res = await fetch(`/api/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ status: "archived" }),
  })
  if (!res.ok) throw new Error("Failed to archive product")
}

export const useProductEdit = (slug: string | undefined) => {
  const isCreate = slug === "create"
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const productQuery = useQuery({
    queryKey: ["product-edit", slug],
    queryFn: () => fetchProduct(slug!),
    enabled: !isCreate && !!slug,
    staleTime: 60_000,
  })

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  })

  const fetchBrands = async (): Promise<Brand[]> => {
    const res = await fetch(`/api/brands`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    if (!res.ok) throw new Error("Failed to fetch brands")
    return res.json()
  }

  const brandsQuery = useQuery({
    queryKey: ["brands"],
    queryFn: fetchBrands,
    staleTime: 5 * 60_000,
  })

  const [form, setForm] = useState({
    name: "",
    slug: "",
    short_description: "",
    description: "",
    regular_price: 0,
    sale_price: null as number | null,
    stock_quantity: 0,
    stock_status: "instock" as "instock" | "outofstock",
    status: "draft" as "published" | "draft" | "archived",
    featured_image_url: "",
    meta_title: "",
    meta_description: "",
    brand_ids: [] as string[],
    category_ids: [] as string[],
    images: [] as ProductImage[],
  })

  useEffect(() => {
    if (productQuery.data) {
      const p = productQuery.data
      setForm({
        name: p.name ?? "",
        slug: p.slug ?? "",
        short_description: p.short_description ?? "",
        description: p.description ?? "",
        regular_price: (p.regular_price ?? 0) / 100,
        sale_price: p.sale_price ? p.sale_price / 100 : null,
        stock_quantity: p.stock_quantity ?? 0,
        stock_status: p.stock_status ?? "instock",
        status: p.status ?? "draft",
        featured_image_url: p.featured_image_url ?? "",
        meta_title: p.meta_title ?? "",
        meta_description: p.meta_description ?? "",
        brand_ids: (p.brands ?? []).map((b: Brand) => b.id),
        category_ids: (p.categories ?? []).map((c: Category) => c.id),
        images: (p.images ?? []).map((img: ProductImage) => ({
          url: img.url,
          alt_text: img.alt_text ?? null,
          sort_order: img.sort_order ?? 0,
          is_featured: img.is_featured ?? false,
        })),
      })
    }
  }, [productQuery.data])

  const updateMutation = useMutation({
    mutationFn: (dto: object) => updateProduct({ id: productQuery.data?.id as string, dto }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manage-products"] })
      queryClient.invalidateQueries({ queryKey: ["product-edit", slug] })
    },
  })

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (data: { slug: string }) => {
      queryClient.invalidateQueries({ queryKey: ["manage-products"] })
      navigate(`/pos/manage/products/${data.slug}`, { replace: true })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(productQuery.data?.id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manage-products"] })
      navigate("/pos/manage/products", { replace: true })
    },
  })

  const handleChange = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }))

    if (field === "name" && isCreate) {
      const autoSlug = (value as string)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
      setForm((prev) => ({ ...prev, name: value as string, slug: autoSlug }))
    }
  }

  const handleSave = async () => {
    const dto = {
      ...form,
      regular_price: Math.round(form.regular_price * 100),
      sale_price: form.sale_price ? Math.round(form.sale_price * 100) : null,
    }

    if (isCreate) {
      createMutation.mutate(dto)
    } else {
      await updateMutation.mutateAsync(dto)

      await fetch(`/api/products/${productQuery.data?.id as string}/images`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ images: form.images }),
      })

      queryClient.invalidateQueries({ queryKey: ["manage-products"] })
      queryClient.invalidateQueries({ queryKey: ["product-edit", slug] })
    }
  }

  const handleDelete = () => {
    deleteMutation.mutate()
  }

  return {
    isCreate,
    form,
    handleChange,
    handleSave,
    handleDelete,
    isLoading: productQuery.isLoading,
    isSaving: updateMutation.isPending || createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSuccess: updateMutation.isSuccess || createMutation.isSuccess,
    error: updateMutation.error || createMutation.error,
    product: productQuery.data ?? [],
    brands: brandsQuery.data ?? [],
    categories: categoriesQuery.data ?? [],
  }
}