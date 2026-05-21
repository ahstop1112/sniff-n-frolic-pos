import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type Brand } from "./useProductEdit"

const getToken = () => localStorage.getItem("snf_pos_access_token")

const createBrand = async (name: string): Promise<Brand> => {
  const res = await fetch("/api/brands", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error("Failed to create brand")
  return res.json()
}

const updateBrand = async ({ id, name }: { id: string; name: string }): Promise<Brand> => {
  const res = await fetch(`/api/brands/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error("Failed to update brand")
  return res.json()
}

type DialogMode = "create" | "edit" | null

export const useBrandManager = (
  onBrandSelected: (id: string) => void
) => {
  const queryClient = useQueryClient()
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [nameInput, setNameInput] = useState("")

  const openCreate = () => {
    setNameInput("")
    setEditingBrand(null)
    setDialogMode("create")
  }

  const openEdit = (brand: Brand) => {
    setNameInput(brand.name)
    setEditingBrand(brand)
    setDialogMode("edit")
  }

  const closeDialog = () => {
    setDialogMode(null)
    setNameInput("")
    setEditingBrand(null)
  }

  const createMutation = useMutation({
    mutationFn: createBrand,
    onSuccess: (newBrand) => {
      queryClient.invalidateQueries({ queryKey: ["brands"] })
      onBrandSelected(newBrand.id)
      closeDialog()
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] })
      closeDialog()
    },
  })

  const handleSave = () => {
    const trimmed = nameInput.trim()
    if (!trimmed) return
    if (dialogMode === "create") {
      createMutation.mutate(trimmed)
    } else if (dialogMode === "edit" && editingBrand) {
      updateMutation.mutate({ id: editingBrand.id, name: trimmed })
    }
  }

  return {
    dialogMode,
    nameInput,
    setNameInput,
    editingBrand,
    openCreate,
    openEdit,
    closeDialog,
    handleSave,
    isSaving: createMutation.isPending || updateMutation.isPending,
    error: createMutation.error || updateMutation.error,
  }
}