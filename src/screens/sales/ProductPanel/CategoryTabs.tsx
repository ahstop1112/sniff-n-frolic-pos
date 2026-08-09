import Box from "@mui/material/Box"
import Skeleton from "@mui/material/Skeleton"

interface Category {
  slug: string
  name: string
}

interface CategoryTabsProps {
  categories: Category[]
  activeId: string | null
  onChange: (id: string | null) => void
  isLoading?: boolean
}

const chipSx = (active: boolean) => ({
  px: 1.5, py: 0.75,
  minHeight: 32,
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap" as const,
  border: 1,
  borderColor: active ? "primary.main" : "divider",
  bgcolor: active ? "primary.main" : "background.paper",
  color: active ? "primary.contrastText" : "text.primary",
  transition: "background-color 0.12s, border-color 0.12s, color 0.12s",
  "&:hover": {
    borderColor: active ? "primary.main" : "text.disabled",
  },
})

const CategoryTabs = ({
  categories,
  activeId,
  onChange,
  isLoading,
}: CategoryTabsProps) => {
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", gap: 1, px: 1.5, py: 1 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={72} height={32} />
        ))}
      </Box>
    )
  }

  if (categories.length === 0) return null

  return (
    <Box sx={{
      display: "flex", gap: 0.75,
      px: 1.5, py: 1,
      overflowX: "auto",
      "&::-webkit-scrollbar": { display: "none" },
      scrollbarWidth: "none",
    }}>
      <Box
        component="button"
        sx={chipSx(activeId === null)}
        onClick={() => onChange(null)}
      >
        All
      </Box>
      {categories.map((c) => {
        const active = activeId === c.slug
        return (
          <Box
            key={c.slug}
            component="button"
            sx={chipSx(active)}
            onClick={() => onChange(c.slug)}
          >
            {c.name}
          </Box>
        )
      })}
    </Box>
  )
}

export default CategoryTabs
