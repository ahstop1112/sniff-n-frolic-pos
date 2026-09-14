import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

interface RevenueData {
  category: string
  revenue: number
  order_count: number
}

interface Props {
  data: RevenueData[]
}

// Color palette matching the screenshot
const CATEGORY_COLORS: Record<string, string> = {
  treats: "#E07856",
  food: "#1F3A5F",
  walking: "#4A90A4",
  grooming: "#D9A399",
  uncategorized: "#9CA3AF",
}

const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category.toLowerCase()] || CATEGORY_COLORS.uncategorized
}

const RevenueTable = ({ data }: Props) => {
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)

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
        Product Breakdown
      </Typography>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.875rem",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6", borderBottom: "1px solid #e5e7eb" }}>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: 600,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  letterSpacing: "0.5px",
                }}
              >
                Category
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "center",
                  fontWeight: 600,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  letterSpacing: "0.5px",
                }}
              >
                Units
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "center",
                  fontWeight: 600,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  letterSpacing: "0.5px",
                }}
              >
                Share
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "right",
                  fontWeight: 600,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  letterSpacing: "0.5px",
                }}
              >
                Revenue
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "right",
                  fontWeight: 600,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  letterSpacing: "0.5px",
                }}
              >
                % Of Total
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const revenuePercent = totalRevenue > 0 ? ((row.revenue / totalRevenue) * 100).toFixed(0) : "0"
              const color = getCategoryColor(row.category)
              return (
                <tr key={idx} style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #f3f4f6" }}>
                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "left",
                      color: "#1f2937",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor: color,
                        borderRadius: "2px",
                        flexShrink: 0,
                      }}
                    />
                    {row.category || "Uncategorized"}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "center",
                      color: "#1f2937",
                      fontWeight: 500,
                    }}
                  >
                    {row.order_count}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "center",
                      color: "#1f2937",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "4px",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          height: "8px",
                          flex: `${revenuePercent} 1 0`,
                          backgroundColor: color,
                          borderRadius: "2px",
                        }}
                      />
                      <div
                        style={{
                          height: "8px",
                          flex: `${100 - parseInt(revenuePercent)} 1 0`,
                          backgroundColor: "#e5e7eb",
                          borderRadius: "2px",
                        }}
                      />
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "right",
                      color: "#1f2937",
                      fontWeight: 600,
                    }}
                  >
                    ${(row.revenue / 100).toFixed(0)}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "right",
                      color: "#1f2937",
                      fontWeight: 600,
                    }}
                  >
                    {revenuePercent}%
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Box>
  )
}

export default RevenueTable
