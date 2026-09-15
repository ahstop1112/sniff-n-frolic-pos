import { useMemo } from "react"
import { AgCharts } from "ag-charts-react"
import type { ReportQueryResult, ReportParams } from "@/domains/orders/api/ordersApi"
import { SERIES_COLORS } from "../constants/reportColors"

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
              stroke: SERIES_COLORS.current,
              marker: { fill: SERIES_COLORS.current, size: 4 },
            },
            data[0]?.order_count !== undefined
              ? {
                  type: "line",
                  xKey: "period",
                  yKey: "order_count",
                  yName: "Orders",
                  stroke: SERIES_COLORS.prior,
                  marker: { fill: SERIES_COLORS.prior, size: 4 },
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
        // revenue_by_category (vertical) or top_products (horizontal to avoid label rotation)
        const isByCategory = result.intent === "revenue_by_category"
        const isTopProducts = result.intent === "top_products"
        const metric = displayParams.metric || "revenue"
        const isRevenue = metric === "revenue"
        const yKey = isRevenue ? "revenue" : "units_sold"
        const yName = isRevenue ? "Revenue (CAD)" : "Units Sold"

        // Top products: horizontal bar chart (swapped axes, direction="horizontal")
        if (isTopProducts) {
          return {
            title: { text: `Top ${displayParams.top_n || 10} Products` },
            data,
            series: [
              {
                type: "bar",
                xKey: yKey,
                yKey: "product_name",
                xName: yName,
                fill: SERIES_COLORS.current,
                formatter: isRevenue ? {
                  formatter: (params: { value: number }) => {
                    return `$${(params.value / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                  },
                } : undefined,
              },
            ],
            axes: [
              {
                type: "number",
                position: "bottom",
                title: { text: yName },
                label: isRevenue ? {
                  formatter: (params: { value: number }) => {
                    return `$${(params.value / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                  },
                } : undefined,
              },
              {
                type: "category",
                position: "left",
                title: { text: "Product" },
              },
            ],
            legend: { enabled: false },
            direction: "horizontal",
          } as unknown
        }

        // Revenue by category: vertical bar chart
        return {
          title: { text: "Revenue by Category" },
          data,
          series: [
            {
              type: "bar",
              xKey: "category",
              yKey: yKey,
              yName: yName,
              fill: SERIES_COLORS.current,
              formatter: isRevenue ? {
                formatter: (params: { value: number }) => {
                  return `$${(params.value / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                },
              } : undefined,
            },
          ],
          axes: [
            { type: "category", position: "bottom", title: { text: "Category" } },
            {
              type: "number",
              position: "left",
              title: { text: yName },
              label: isRevenue ? {
                formatter: (params: { value: number }) => {
                  return `$${(params.value / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                },
              } : undefined,
            },
          ],
          legend: { enabled: false },
        } as unknown
      }

      case "comparison": {
        // Check if this is a meaningful change
        const isMeaningful = data.length > 0 && (data[0] as Record<string, unknown>).is_meaningful_change === true;

        if (!isMeaningful) {
          // Show "no meaningful change" message instead of chart
          return null; // Will be handled separately in component
        }

        // period_comparison: show side-by-side bars with actual date ranges
        const enrichedData = data.map((d: Record<string, unknown>, idx: number) => {
          const isPeriodA = idx === 0;
          const dateFrom = isPeriodA ? displayParams.period_a_from : displayParams.period_b_from;
          const dateTo = isPeriodA ? displayParams.period_a_to : displayParams.period_b_to;

          const formatDateRange = (from?: string, to?: string) => {
            if (!from || !to) return d.period as string;
            const fromDate = new Date(from);
            const toDate = new Date(to);
            const fromStr = fromDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const toStr = toDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
            return `${fromStr} - ${toStr}`;
          };

          return {
            ...d,
            periodLabel: formatDateRange(dateFrom, dateTo),
          };
        });

        return {
          title: { text: "Period Comparison" },
          data: enrichedData,
          series: [
            {
              type: "bar",
              xKey: "periodLabel",
              yKey: "revenue",
              yName: "Revenue (CAD)",
              fill: SERIES_COLORS.current,
              formatter: (params: { value: number }) => {
                return `$${(params.value / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
              },
            },
          ],
          axes: [
            { type: "category", position: "bottom", title: { text: "Period" } },
            {
              type: "number",
              position: "left",
              title: { text: "Revenue (CAD)" },
              label: {
                formatter: (params: { value: number }) => {
                  return `$${(params.value / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
                },
              },
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
    if (result.chartType === "comparison") {
      const isMeaningful = result.data.length > 0 && (result.data[0] as Record<string, unknown>).is_meaningful_change === true;
      if (!isMeaningful) {
        return (
          <div style={{ padding: "24px", textAlign: "center", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
            <div style={{ fontSize: "1.125rem", fontWeight: 500, color: "#333" }}>No meaningful change</div>
            <div style={{ fontSize: "0.875rem", color: "#666", marginTop: "8px" }}>
              The difference between these periods is less than 5%, indicating no significant change in revenue.
            </div>
          </div>
        );
      }
    }
    return <div>No chart data available</div>
  }

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <AgCharts options={chartOptions as unknown} />
    </div>
  )
}

export default QueryResultChart
