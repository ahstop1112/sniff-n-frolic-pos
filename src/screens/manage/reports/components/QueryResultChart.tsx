import { useMemo } from "react"
import { AgCharts } from "ag-charts-react"
import type { ReportQueryResult, ReportParams } from "@/domains/orders/api/ordersApi"

interface Props {
  result: ReportQueryResult
  editedParams?: ReportParams
}

const QueryResultChart = ({ result, editedParams }: Props) => {
  const displayParams = editedParams || result.params

  const chartOptions = useMemo(() => {
    const { chartType, data } = result

    switch (chartType) {
      case "line": {
        // revenue_over_time: show revenue as line, optionally with order count
        return {
          title: { text: "Sales Over Time" },
          data,
          series: [
            {
              type: "line",
              xKey: "period",
              yKey: "revenue",
              yName: "Revenue (CAD)",
              stroke: "#1976d2",
              marker: { fill: "#1976d2", size: 4 },
            },
            data[0]?.order_count !== undefined
              ? {
                  type: "line",
                  xKey: "period",
                  yKey: "order_count",
                  yName: "Orders",
                  stroke: "#f57c00",
                  marker: { fill: "#f57c00", size: 4 },
                  yAxis: {
                    type: "number",
                    position: "right",
                    title: { text: "Order Count" },
                  },
                }
              : null,
          ].filter(Boolean),
          axes: [
            { type: "category", position: "bottom", title: { text: "Period" } },
            {
              type: "number",
              position: "left",
              title: { text: "Revenue (CAD)" },
            },
          ],
          legend: { enabled: true, position: "bottom" },
        } as unknown
      }

      case "bar": {
        // revenue_by_category or top_products
        const isByCategory = result.intent === "revenue_by_category"
        const xKey = isByCategory ? "category" : "product_name"
        const xLabel = isByCategory ? "Category" : "Product"
        const metric = displayParams.metric || "revenue"

        return {
          title: {
            text:
              result.intent === "revenue_by_category"
                ? "Revenue by Category"
                : `Top ${displayParams.top_n || 10} Products`,
          },
          data,
          series: [
            {
              type: "bar",
              xKey,
              yKey: metric === "units" ? "units_sold" : "revenue",
              yName: metric === "units" ? "Units Sold" : "Revenue (CAD)",
              fill: "#1976d2",
            },
          ],
          axes: [
            { type: "category", position: "bottom", title: { text: xLabel } },
            {
              type: "number",
              position: "left",
              title: {
                text: metric === "units" ? "Units Sold" : "Revenue (CAD)",
              },
            },
          ],
          legend: { enabled: false },
        } as unknown
      }

      case "comparison": {
        // period_comparison: show side-by-side bars
        return {
          title: { text: "Period Comparison" },
          data,
          series: [
            {
              type: "bar",
              xKey: "period",
              yKey: "revenue",
              yName: "Revenue (CAD)",
              fill: "#1976d2",
            },
          ],
          axes: [
            { type: "category", position: "bottom", title: { text: "Period" } },
            {
              type: "number",
              position: "left",
              title: { text: "Revenue (CAD)" },
            },
          ],
          legend: { enabled: false },
        } as unknown
      }

      case "table":
      default: {
        // slow_movers or unsupported: render as table
        return null
      }
    }
  }, [result, displayParams])

  if (result.chartType === "table") {
    // Render as simple table
    return (
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.875rem",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
              {result.data.length > 0 &&
                Object.keys(result.data[0]).map((key) => (
                  <th
                    key={key}
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  >
                    {key.replace(/_/g, " ")}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {result.data.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                {Object.entries(row).map(([key, value]) => {
                  let displayValue: string = ""
                  if (typeof value === "number" && key.includes("revenue")) {
                    displayValue = `$${(value / 100).toFixed(2)}`
                  } else if (typeof value === "number") {
                    displayValue = value.toFixed(2)
                  } else if (value !== null && value !== undefined) {
                    displayValue = String(value)
                  }

                  return (
                    <td
                      key={key}
                      style={{
                        padding: "12px",
                        textAlign: key.includes("count") ? "center" : "left",
                      }}
                    >
                      {displayValue}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (!chartOptions) {
    return <div>No chart data available</div>
  }

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <AgCharts options={chartOptions as any} />
    </div>
  )
}

export default QueryResultChart
