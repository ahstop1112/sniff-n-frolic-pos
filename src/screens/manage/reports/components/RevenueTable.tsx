import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { getCategoryColor, REPORT_COLORS, REPORT_PALETTE } from "../constants/reportColors"

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

  // Sort data by revenue descending to assign ranks
  const sortedData = [...data].sort((a, b) => b.revenue - a.revenue)
  const rankMap = new Map(sortedData.map((item, idx) => [item.category, idx]))

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
        Revenue breakdown
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
            <tr style={{ backgroundColor: REPORT_COLORS.headerBackground }}>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: 600,
                  color: REPORT_COLORS.headerText,
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  letterSpacing: "0.8px",
                }}
              >
                Category
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "center",
                  fontWeight: 600,
                  color: REPORT_COLORS.headerText,
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  letterSpacing: "0.8px",
                }}
              >
                Units
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "center",
                  fontWeight: 600,
                  color: REPORT_COLORS.headerText,
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  letterSpacing: "0.8px",
                }}
              >
                Share
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "right",
                  fontWeight: 600,
                  color: REPORT_COLORS.headerText,
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  letterSpacing: "0.8px",
                }}
              >
                Revenue
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "right",
                  fontWeight: 600,
                  color: REPORT_COLORS.headerText,
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  letterSpacing: "0.8px",
                }}
              >
                % of total
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const revenuePercent = totalRevenue > 0 ? (row.revenue / totalRevenue) * 100 : 0
              const rank = rankMap.get(row.category) ?? REPORT_PALETTE.length - 1
              const color = getCategoryColor(rank)

              return (
                <tr key={row.category} style={{ backgroundColor: REPORT_COLORS.rowBackground, borderBottom: `1px solid ${REPORT_COLORS.rowBorder}` }}>
                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "left",
                      color: REPORT_COLORS.textPrimary,
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        backgroundColor: color,
                        borderRadius: "50%",
                        flexShrink: 0,
                      }}
                    />
                    {row.category || "Uncategorized"}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "center",
                      color: REPORT_COLORS.textPrimary,
                      fontWeight: 500,
                    }}
                  >
                    {row.order_count}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "0",
                        alignItems: "center",
                        height: "6px",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          flex: `${revenuePercent} 1 0`,
                          backgroundColor: color,
                          borderRadius: "3px 0 0 3px",
                        }}
                      />
                      <div
                        style={{
                          height: "100%",
                          flex: `${100 - revenuePercent} 1 0`,
                          backgroundColor: REPORT_COLORS.trackBackground,
                          borderRadius: "0 3px 3px 0",
                        }}
                      />
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "right",
                      color: REPORT_COLORS.textPrimary,
                      fontWeight: 600,
                      fontFamily: "'Courier New', monospace",
                      letterSpacing: "0.02em",
                    }}
                  >
                    ${(row.revenue / 100).toFixed(0)}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "right",
                      color: REPORT_COLORS.textPrimary,
                      fontWeight: 600,
                    }}
                  >
                    {revenuePercent.toFixed(0)}%
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
