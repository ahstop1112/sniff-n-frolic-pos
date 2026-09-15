import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

interface SummaryData {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  cancelledOrders: number
}

interface Props {
  summary: SummaryData
}

// Report endpoints return dollars — no conversion needed
const formatDollars = (dollars: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(dollars)

// Other endpoints return cents — convert to dollars
const formatCurrency = (cents: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(cents / 100)

const SummaryCard = ({
  label,
  value,
  isCurrency = false,
  isDollars = false,
}: {
  label: string
  value: number | string
  isCurrency?: boolean
  isDollars?: boolean
}) => (
  <Box
    sx={{
      background: "white",
      border: "1px solid #e8eef5",
      borderRadius: "12px",
      padding: "24px",
      transition: "all 0.2s ease",
      "&:hover": {
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        borderColor: "#d0d4dd",
      },
    }}
  >
    <Typography
      sx={{
        fontSize: "0.75rem",
        fontWeight: 600,
        color: "#8b92a4",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        marginBottom: "12px",
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: "2rem",
        fontWeight: 700,
        color: "#1a202c",
      }}
    >
      {isDollars ? formatDollars(value as number) : isCurrency ? formatCurrency(value as number) : value}
    </Typography>
  </Box>
)

const ReportSummary = ({ summary }: Props) => (
  <Box sx={{ mb: 2 }}>
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
        },
        gap: 3,
      }}
    >
      {/* Report endpoints return dollars, no conversion needed */}
      <SummaryCard label="Total Revenue" value={summary.totalRevenue} isDollars />
      <SummaryCard label="Total Orders" value={summary.totalOrders} />
      <SummaryCard label="Average Order Value" value={summary.averageOrderValue} isDollars />
      <SummaryCard label="Cancelled Orders" value={summary.cancelledOrders} />
    </Box>
  </Box>
)

export default ReportSummary
