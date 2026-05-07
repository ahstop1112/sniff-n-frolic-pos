import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import Typography from "@mui/material/Typography"

export const ProcessingScreen = () => (
  <Box sx={{
    p: 6,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
  }}>
    <CircularProgress size={64} thickness={3} />
    <Typography variant="h6" fontWeight={700}>Processing Payment…</Typography>
    <Typography variant="body2" color="text.secondary">Please wait</Typography>
  </Box>
)