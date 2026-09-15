import { useMemo } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { AgCharts } from "ag-charts-react"
import { SERIES_COLORS } from "../constants/reportColors"
import type { MonthlyReportData } from "@/domains/orders/api/ordersApi"

interface Props {
  data: MonthlyReportData[]
}

const MonthlySalesChart = ({ data }: Props) => {
  const chartOptions = useMemo(
    () => ({
      title: {
        text: "Monthly Sales Trend",
      },
      // API returns dollars, no need to divide by 100
      data: data.map((d) => ({
        month: d.month,
        revenue: d.revenue,
        orderCount: d.order_count,
      })),
      series: [
        {
          type: "line",
          xKey: "month",
          yKey: "revenue",
          yName: "Revenue (CAD)",
          stroke: SERIES_COLORS.current,
          marker: {
            fill: SERIES_COLORS.current,
            size: 5,
          },
          label: {
            fontSize: 12,
          },
        },
        {
          type: "line",
          xKey: "month",
          yKey: "orderCount",
          yName: "Order Count",
          stroke: SERIES_COLORS.prior,
          marker: {
            fill: SERIES_COLORS.prior,
            size: 4,
          },
          yAxis: {
            type: "number",
            position: "right",
            title: {
              text: "Order Count",
            },
          },
        },
      ],
      axes: [
        {
          type: "category",
          position: "bottom",
          title: {
            text: "Month",
          },
        },
        {
          type: "number",
          position: "left",
          title: {
            text: "Revenue (CAD)",
          },
          label: {
            formatter: (params: { value: number }) => {
              return `$${params.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
            },
          },
        },
      ],
      legend: {
        enabled: true,
        position: "bottom",
      },
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
        Sales by Day
      </Typography>
      <div style={{ height: "400px", width: "100%" }}>
        <AgCharts options={chartOptions as unknown} />
      </div>
    </Box>
  )
}

export default MonthlySalesChart
