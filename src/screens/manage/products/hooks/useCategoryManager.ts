import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type Category } from "./useProductEdit"

const getToken = () => localStorage.getItem("snf_pos_access_token")

const createCategory = async (name: string): Promise<Category> => {
  const res = await fetch("/api/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error("Failed to create category")
  return res.json()
}

const updateCategory = async ({ id, name }: { id: string; name: string }): Promise<Category> => {
  const res = await fetch(`/api/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error("Failed to update category")
  return res.json()
}

type DialogMode = "create" | "edit" | null

export const useCategoryManager = (
  onCategorySelected: (id: string) => void
) => {
  const queryClient = useQueryClient()
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [nameInput, setNameInput] = useState("")

  const openCreate = () => {
    setNameInput("")
    setEditingCategory(null)
    setDialogMode("create")
  }

  const openEdit = (category: Category) => {
    setNameInput(category.name)
    setEditingCategory(category)
    setDialogMode("edit")
  }

  const closeDialog = () => {
    setDialogMode(null)
    setNameInput("")
    setEditingCategory(null)
  }

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (newCat) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      onCategorySelected(newCat.id)
      closeDialog()
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      closeDialog()
    },
  })

  const handleSave = () => {
    const trimmed = nameInput.trim()
    if (!trimmed) return
    if (dialogMode === "create") {
      createMutation.mutate(trimmed)
    } else if (dialogMode === "edit" && editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, name: trimmed })
    }
  }

  return {
    dialogMode,
    nameInput,
    setNameInput,
    editingCategory,
    openCreate,
    openEdit,
    closeDialog,
    handleSave,
    isSaving: createMutation.isPending || updateMutation.isPending,
    error: createMutation.error || updateMutation.error,
  }
}