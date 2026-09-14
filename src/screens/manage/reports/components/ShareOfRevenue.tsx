import { useMemo } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { AgCharts } from "ag-charts-react"

interface RevenueData {
  category: string
  revenue: number
}

interface Props {
  data: RevenueData[]
}

const COLORS = ["#667eea", "#764ba2", "#f57c00", "#43a047", "#1e88e5", "#fb8c00", "#e53935"]

const ShareOfRevenue = ({ data }: Props) => {
  const chartOptions = useMemo(
    () => ({
      title: {
        text: "Share of Revenue",
      },
      data: data.map((d, idx) => ({
        category: d.category || "Uncategorized",
        revenue: d.revenue / 100,
        color: COLORS[idx % COLORS.length],
      })),
      series: [
        {
          type: "donut",
          angleKey: "revenue",
          radiusKey: "revenue",
          labelKey: "category",
          fills: COLORS,
          label: {
            offset: 0,
            minimumRequiredAngle: 45,
          },
          innerRadiusOffset: -50,
        },
      ],
      legend: {
        enabled: true,
        position: "right",
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
        Share of Revenue
      </Typography>
      <div style={{ height: "300px", width: "100%" }}>
        <AgCharts options={chartOptions as any} />
      </div>
    </Box>
  )
}

export default ShareOfRevenue
