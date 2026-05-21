import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import Tooltip from "@mui/material/Tooltip"
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import StarIcon from "@mui/icons-material/Star"
import StarBorderIcon from "@mui/icons-material/StarBorder"
import DragIndicatorIcon from "@mui/icons-material/DragIndicator"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

export interface ProductImage {
  url: string
  alt_text: string | null
  sort_order: number
  is_featured: boolean
}

interface SortableImageRowProps {
  id: string
  img: ProductImage
  idx: number
  onRemove: (idx: number) => void
  onChange: (idx: number, field: keyof ProductImage, value: any) => void
  onSetFeatured: (idx: number) => void
}

const SortableImageRow = ({
  id,
  img,
  idx,
  onRemove,
  onChange,
  onSetFeatured,
}: SortableImageRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : undefined,
  }

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        display: "grid",
        gridTemplateColumns: "24px 80px 1fr auto",
        gap: 1.5,
        alignItems: "center",
        p: 1.5,
        border: 1,
        borderColor: img.is_featured ? "primary.main" : "divider",
        borderRadius: 2,
        bgcolor: img.is_featured ? "primary.50" : "background.paper",
      }}
    >
      {/* Drag handle */}
      <Box
        {...attributes}
        {...listeners}
        sx={{ cursor: "grab", display: "flex", alignItems: "center", color: "text.disabled" }}
      >
        <DragIndicatorIcon sx={{ fontSize: 18 }} />
      </Box>

      {/* Preview */}
      <Box sx={{
        width: 80, height: 80, borderRadius: 1,
        overflow: "hidden", bgcolor: "grey.100",
        border: 1, borderColor: "divider", flexShrink: 0,
      }}>
        {img.url ? (
          <img
            src={img.url}
            alt={img.alt_text ?? ""}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <Box sx={{ width: "100%", height: "100%", display: "flex",
            alignItems: "center", justifyContent: "center" }}>
            <Typography variant="caption" color="text.disabled">No image</Typography>
          </Box>
        )}
      </Box>

      {/* URL + alt */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
        <TextField
          size="small"
          label="Image URL"
          value={img.url}
          onChange={(e) => onChange(idx, "url", e.target.value)}
          fullWidth
          placeholder="https://res.cloudinary.com/..."
        />
        <TextField
          size="small"
          label="Alt text"
          value={img.alt_text ?? ""}
          onChange={(e) => onChange(idx, "alt_text", e.target.value || null)}
          fullWidth
          placeholder="Describe the image…"
        />
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Tooltip title={img.is_featured ? "Featured image" : "Set as featured"}>
          <IconButton
            size="small"
            onClick={() => onSetFeatured(idx)}
            color={img.is_featured ? "primary" : "default"}
          >
            {img.is_featured ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Remove">
          <IconButton size="small" onClick={() => onRemove(idx)} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}

interface ProductImagesEditorProps {
  images: ProductImage[]
  onChange: (images: ProductImage[]) => void
}

export const ProductImagesEditor = ({ images, onChange }: ProductImagesEditorProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIdx = images.findIndex((_, i) => `img-${i}` === active.id)
    const newIdx = images.findIndex((_, i) => `img-${i}` === over.id)

    const reordered = arrayMove(images, oldIdx, newIdx).map((img, i) => ({
      ...img,
      sort_order: i,
    }))

    onChange(reordered)
  }

  const handleAdd = () => {
    onChange([
      ...images,
      {
        url: "",
        alt_text: null,
        sort_order: images.length,
        is_featured: images.length === 0,
      },
    ])
  }

  const handleRemove = (idx: number) => {
    const next = images
      .filter((_, i) => i !== idx)
      .map((img, i) => ({ ...img, sort_order: i }))

    if (next.length > 0 && !next.some((img) => img.is_featured)) {
      next[0].is_featured = true
    }

    onChange(next)
  }

  const handleChange = (idx: number, field: keyof ProductImage, value: any) => {
    onChange(images.map((img, i) => i === idx ? { ...img, [field]: value } : img))
  }

  const handleSetFeatured = (idx: number) => {
    onChange(images.map((img, i) => ({ ...img, is_featured: i === idx })))
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={images.map((_, i) => `img-${i}`)}
          strategy={verticalListSortingStrategy}
        >
          {images.map((img, idx) => (
            <SortableImageRow
              key={`img-${idx}`}
              id={`img-${idx}`}
              img={img}
              idx={idx}
              onRemove={handleRemove}
              onChange={handleChange}
              onSetFeatured={handleSetFeatured}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={handleAdd}
        sx={{ textTransform: "none", alignSelf: "flex-start" }}
      >
        Add Image
      </Button>
    </Box>
  )
}

export default ProductImagesEditor