import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import { useParams } from "react-router-dom"
import { useProductEdit } from "./hooks/useProductEdit"
import ProductEditForm from "./components/ProductEditForm"

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
  } = useProductEdit(slug)

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
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
  )
}

export default ProductEditScreen