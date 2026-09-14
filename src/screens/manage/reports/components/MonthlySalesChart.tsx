import { useMemo } from "react"
import { AgCharts } from "ag-charts-react"
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
      data: data.map((d) => ({
        month: d.month,
        revenue: d.revenue / 100,
        orderCount: d.order_count,
      })),
      series: [
        {
          type: "bar",
          xKey: "month",
          yKey: "revenue",
          yName: "Revenue (CAD)",
          fill: "#1976d2",
          label: {
            fontSize: 12,
          },
        },
        {
          type: "line",
          xKey: "month",
          yKey: "orderCount",
          yName: "Order Count",
          stroke: "#f57c00",
          marker: {
            fill: "#f57c00",
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
    <div style={{ height: "400px", width: "100%" }}>
      <AgCharts options={chartOptions as any} />
    </div>
  )
}

export default MonthlySalesChart
