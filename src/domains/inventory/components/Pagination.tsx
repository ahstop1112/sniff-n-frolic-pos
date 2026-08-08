import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"

interface PaginationProps {
  total: number
  limit: number
  offset: number
  onChange: (offset: number) => void
}

const Pagination = ({ total, limit, offset, onChange }: PaginationProps) => {
  if (total === 0) return null

  const start = offset + 1
  const end = Math.min(offset + limit, total)
  const prevDisabled = offset === 0
  const nextDisabled = end >= total

  return (
    <Box sx={{
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 2, px: 3, py: 1.5, borderTop: 1, borderColor: "divider",
    }}>
      <Button
        size="small"
        variant="outlined"
        disabled={prevDisabled}
        onClick={() => onChange(Math.max(0, offset - limit))}
        sx={{ textTransform: "none" }}
      >
        Prev
      </Button>
      <Typography variant="body2" color="text.secondary">
        {start}–{end} of {total}
      </Typography>
      <Button
        size="small"
        variant="outlined"
        disabled={nextDisabled}
        onClick={() => onChange(offset + limit)}
        sx={{ textTransform: "none" }}
      >
        Next
      </Button>
    </Box>
  )
}

export default Pagination
