import { useMemo } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { AgCharts } from "ag-charts-react"

interface RevenueData {
  category: string
  revenue: number
  order_count: number
}

interface Props {
  data: RevenueData[]
}

const RevenueBreakdown = ({ data }: Props) => {
  const chartOptions = useMemo(
    () => ({
      title: {
        text: "Product Performance",
      },
      data: data.map((d) => ({
        category: d.category || "Uncategorized",
        revenue: d.revenue / 100,
        orders: d.order_count,
      })),
      series: [
        {
          type: "bar",
          xKey: "category",
          yKey: "revenue",
          yName: "Revenue (CAD)",
          fill: "#667eea",
        },
      ],
      axes: [
        {
          type: "category",
          position: "bottom",
          title: { text: "Category" },
        },
        {
          type: "number",
          position: "left",
          title: { text: "Revenue (CAD)" },
        },
      ],
      legend: { enabled: false },
    }) as unknown,
    [data],
  )

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          fontSize: "1.1rem",
          fontWeight: 700,
          color: "#1a202c",
          marginBottom: "20px",
        }}
      >
        Product Performance
      </Typography>
      <div style={{ height: "300px", width: "100%" }}>
        <AgCharts options={chartOptions as any} />
      </div>
    </Box>
  )
}

export default RevenueBreakdown
