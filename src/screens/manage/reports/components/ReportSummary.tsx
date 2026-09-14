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
}: {
  label: string
  value: number | string
  isCurrency?: boolean
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
      {isCurrency ? formatCurrency(value as number) : value}
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
      <SummaryCard label="Total Revenue" value={summary.totalRevenue} isCurrency />
      <SummaryCard label="Total Orders" value={summary.totalOrders} />
      <SummaryCard label="Average Order Value" value={summary.averageOrderValue} isCurrency />
      <SummaryCard label="Cancelled Orders" value={summary.cancelledOrders} />
    </Box>
  </Box>
)

export default ReportSummary
