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

  const isVariationChild = !isCreate && product?.product_type === "variation"

  return (
    <>
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
        <Box sx={{ px: 3, pb: 4, maxWidth: 1200, mx: "auto" }}>
          <VariantList
            parentSlug={product.slug as string}
            parentName={product.name as string ?? form.name}
          />
        </Box>
      )}
    </>
  )
}

export default ProductEditScreen
