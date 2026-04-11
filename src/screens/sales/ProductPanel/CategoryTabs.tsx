import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import Skeleton from "@mui/material/Skeleton"
import Box from "@mui/material/Box"

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

const CategoryTabs = ({
  categories,
  activeId,
  onChange,
  isLoading,
}: CategoryTabsProps) => {
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", gap: 1, px: 1.5, py: 1 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={72} height={32} />
        ))}
      </Box>
    )
  }

  if (categories.length === 0) return null

  return (
    <Tabs
      value={activeId ?? "all"}
      onChange={(_, v) => onChange(v === "all" ? null : v)}
      variant="scrollable"
      scrollButtons="auto"
      sx={{ borderBottom: 1, borderColor: "divider", minHeight: 40 }}
    >
      <Tab label="All" value="all" sx={{ minHeight: 40 }} />
      {categories.map((c) => (
        <Tab key={c.slug} label={c.name} value={c.slug} sx={{ minHeight: 40 }} />
      ))}
    </Tabs>
  )
}

export default CategoryTabs
