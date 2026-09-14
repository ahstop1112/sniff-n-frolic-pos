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
            <tr style={{ backgroundColor: "#1f2937", borderBottom: "3px solid #667eea" }}>
              <th
                style={{
                  padding: "16px",
                  textAlign: "left",
                  fontWeight: 700,
                  color: "#ffffff",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: "0.5px",
                }}
              >
                Category
              </th>
              <th
                style={{
                  padding: "16px",
                  textAlign: "center",
                  fontWeight: 700,
                  color: "#ffffff",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: "0.5px",
                }}
              >
                Units
              </th>
              <th
                style={{
                  padding: "16px",
                  textAlign: "right",
                  fontWeight: 700,
                  color: "#ffffff",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: "0.5px",
                }}
              >
                Revenue
              </th>
              <th
                style={{
                  padding: "16px",
                  textAlign: "right",
                  fontWeight: 700,
                  color: "#ffffff",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: "0.5px",
                }}
              >
                Revenue %
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const revenuePercent = totalRevenue > 0 ? ((row.revenue / totalRevenue) * 100).toFixed(1) : "0"
              const isEven = idx % 2 === 0
              return (
                <tr key={idx} style={{ backgroundColor: isEven ? "#ffffff" : "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "left",
                      color: "#1a202c",
                      fontWeight: 500,
                    }}
                  >
                    {row.category || "Uncategorized"}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "center",
                      color: "#4b5563",
                      fontWeight: 500,
                    }}
                  >
                    {row.order_count}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "right",
                      color: "#10b981",
                      fontWeight: 600,
                    }}
                  >
                    ${(row.revenue / 100).toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "right",
                      color: "#667eea",
                      fontWeight: 600,
                    }}
                  >
                    {revenuePercent}%
                  </td>
                </tr>
              )
            })}
            <tr style={{ backgroundColor: "#f0f4ff", borderTop: "3px solid #667eea" }}>
              <td
                style={{
                  padding: "14px 16px",
                  textAlign: "left",
                  color: "#1f2937",
                  fontWeight: 700,
                }}
              >
                Total
              </td>
              <td
                style={{
                  padding: "14px 16px",
                  textAlign: "center",
                  color: "#1f2937",
                  fontWeight: 700,
                }}
              >
                {data.reduce((sum, item) => sum + item.order_count, 0)}
              </td>
              <td
                style={{
                  padding: "14px 16px",
                  textAlign: "right",
                  color: "#10b981",
                  fontWeight: 700,
                }}
              >
                ${(totalRevenue / 100).toFixed(2)}
              </td>
              <td
                style={{
                  padding: "14px 16px",
                  textAlign: "right",
                  color: "#667eea",
                  fontWeight: 700,
                }}
              >
                100%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Box>
  )
}

export default RevenueTable
