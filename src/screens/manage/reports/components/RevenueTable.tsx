import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { assignCategoryColors, REPORT_COLORS } from "../constants/reportColors"

interface RevenueData {
  category: string
  revenue: number
  order_count: number
}

interface Props {
  data: RevenueData[]
  categoryColors?: Array<{ category: string; rank: number; color: string }>
}

const RevenueTable = ({ data, categoryColors }: Props) => {
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)

  // If colors not provided, assign them here
  const colors = categoryColors || assignCategoryColors(data)

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
              const colorInfo = colors.find((c) => c.category === (row.category || "Uncategorized"))
              const revenuePercent = totalRevenue > 0 ? (row.revenue / totalRevenue) * 100 : 0

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
                        backgroundColor: colorInfo?.color || REPORT_COLORS.textMuted,
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
                          backgroundColor: colorInfo?.color || REPORT_COLORS.textMuted,
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
                    ${row.revenue.toFixed(0)}
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
