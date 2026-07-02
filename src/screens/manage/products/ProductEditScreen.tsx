import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import { useParams } from "react-router-dom"
import { useProductEdit } from "./hooks/useProductEdit"
import ProductEditForm from "./components/ProductEditForm"
import VariantList from "./components/VariantList"

const ProductEditScreen = () => {
  const { slug } = useParams<{ slug: string }>()
  const {
    isCreate,
    form,
    handleChange,
    handleSave,
    handleDelete,
    isLoading,
    isSaving,
    isDeleting,
    isSuccess,
    categories,
    brands,
    product,
  } = useProductEdit(slug)

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  // product_type = "variation" means this IS a variant (child), not a parent.
  // Show variant management only for parent products (simple / variable) when editing.
  const isVariationChild = !isCreate && product?.product_type === "variation"

  return (
    <Box>
      <ProductEditForm
        isCreate={isCreate}
        form={form}
        brands={brands}
        categories={categories}
        onChange={handleChange}
        onSave={handleSave}
        onDelete={isCreate ? undefined : handleDelete}
        isSaving={isSaving}
        isDeleting={isDeleting}
        isSuccess={isSuccess}
      />
      {!isCreate && !isVariationChild && product?.slug && (
        <Box sx={{ px: 3, pb: 4 }}>
          <VariantList
            parentSlug={product.slug as string}
            parentName={product.name as string ?? form.name}
          />
        </Box>
      )}
    </Box>
  )
}

export default ProductEditScreen