import { useMemo } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { AgCharts } from "ag-charts-react"
import { assignCategoryColors } from "../constants/reportColors"

interface RevenueData {
  category: string
  revenue: number
}

interface Props {
  data: RevenueData[]
  categoryColors?: Array<{ category: string; rank: number; color: string }>
}

const ShareOfRevenue = ({ data, categoryColors }: Props) => {
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)

  // If colors not provided, assign them here
  const colors = categoryColors || assignCategoryColors(data)
  const colorArray = colors.map((c) => c.color)

  const chartOptions = useMemo(
    () => ({
      // API returns dollars, no need to divide by 100
      data: data.map((d) => ({
        category: d.category || "Uncategorized",
        revenue: d.revenue,
      })),
      series: [
        {
          type: "donut",
          angleKey: "revenue",
          labelKey: "category",
          fills: colorArray,
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
    [data, colorArray],
  )

  // Format total as compact currency (e.g., $28k)
  // API returns dollars, no need to divide by 100
  const formatCompact = (dollars: number): string => {
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
