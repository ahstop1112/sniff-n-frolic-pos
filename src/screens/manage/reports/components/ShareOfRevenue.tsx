import { useMemo } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { AgCharts } from "ag-charts-react"
import { getCategoryColor, REPORT_PALETTE } from "../constants/reportColors"

interface RevenueData {
  category: string
  revenue: number
}

interface Props {
  data: RevenueData[]
}

const ShareOfRevenue = ({ data }: Props) => {
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)

  // Sort data by revenue descending to assign ranks
  const sortedData = [...data].sort((a, b) => b.revenue - a.revenue)
  const rankMap = new Map(sortedData.map((item, idx) => [item.category, idx]))

  // Build colors array maintaining rank order
  const colors = data.map((item) => {
    const rank = rankMap.get(item.category) ?? REPORT_PALETTE.length - 1
    return getCategoryColor(rank)
  })

  const chartOptions = useMemo(
    () => ({
      data: data.map((d) => ({
        category: d.category || "Uncategorized",
        revenue: d.revenue / 100,
      })),
      series: [
        {
          type: "donut",
          angleKey: "revenue",
          labelKey: "category",
          fills: colors,
          label: {
            enabled: false,
          },
          innerRadiusOffset: -80,
          strokeWidth: 0,
        },
      ],
      legend: {
        enabled: false,
      },
      tooltip: {
        enabled: true,
      },
    }) as unknown,
    [data, colors],
  )

  // Format total as compact currency (e.g., $28k)
  const formatCompact = (cents: number): string => {
    const dollars = cents / 100
    if (dollars >= 1000) {
      return `$${(dollars / 1000).toFixed(0)}k`
    }
    return `$${Math.round(dollars).toLocaleString()}`
  }

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
        Share of revenue
      </Typography>
      <div style={{ position: "relative", height: "320px", width: "100%" }}>
        <AgCharts options={chartOptions as unknown} />
        {/* Center label overlay */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#6B7280",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "4px",
            }}
          >
            NET
          </div>
          <div
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#1F2937",
            }}
          >
            {formatCompact(totalRevenue)}
          </div>
        </div>
      </div>
    </Box>
  )
}

export default ShareOfRevenue
