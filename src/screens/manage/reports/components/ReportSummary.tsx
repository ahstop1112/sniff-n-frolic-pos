import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
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
    maximumFractionDigits: 2,
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
  <Card>
    <CardContent>
      <Typography color="textSecondary" gutterBottom>
        {label}
      </Typography>
      <Typography variant="h6">
        {isCurrency ? formatCurrency(value as number) : value}
      </Typography>
    </CardContent>
  </Card>
)

const ReportSummary = ({ summary }: Props) => (
  <Box sx={{ p: 2 }}>
    <Typography variant="h6" sx={{ mb: 2 }}>
      Summary
    </Typography>
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
        },
        gap: 2,
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
