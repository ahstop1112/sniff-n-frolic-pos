import { useMemo, useState } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Skeleton from "@mui/material/Skeleton"
import Alert from "@mui/material/Alert"
import AnalyticsIcon from "@mui/icons-material/Analytics"
import { useMonthlyReport } from "@/domains/orders/hooks/useMonthlyReport"
import MonthlySalesChart from "./components/MonthlySalesChart"
import ReportSummary from "./components/ReportSummary"
import QueryInterface from "./components/QueryInterface"
import type { ReportQueryResult } from "@/domains/orders/api/ordersApi"
import styles from "./ReportScreen.module.scss"

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(cents / 100)

type DateRange = "6-months" | "12-months" | "all-time"

const ReportScreen = () => {
  const [dateRange, setDateRange] = useState<DateRange>("12-months")
  const [queryResult, setQueryResult] = useState<ReportQueryResult | null>(null)

  const { dateFrom, dateTo } = useMemo(() => {
    const today = new Date()
    let from: Date

    if (dateRange === "6-months") {
      from = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate())
    } else if (dateRange === "12-months") {
      from = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
    } else {
      from = new Date(2000, 0, 1)
    }

    return {
      dateFrom: from.toISOString().split("T")[0],
      dateTo: today.toISOString().split("T")[0],
    }
  }, [dateRange])

  const query = useMonthlyReport({
    date_from: dateFrom,
    date_to: dateTo,
  })

  const data = useMemo(() => query.data ?? [], [query.data])
  const isLoading = query.isLoading
  const error = query.error as Error | null

  const summary = useMemo(() => {
    if (!data.length) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        cancelledOrders: 0,
      }
    }

    const totalRevenue = data.reduce((sum, m) => sum + m.revenue, 0)
    const totalOrders = data.reduce((sum, m) => sum + m.order_count, 0)
    const cancelledOrders = data.reduce((sum, m) => sum + m.cancelled_count, 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      cancelledOrders,
    }
  }, [data])

  return (
    <div className={styles.root}>
      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroBrand}>
          <div className={styles.heroIcon}>
            <AnalyticsIcon />
          </div>
          <div className={styles.heroMeta}>
            <span className={styles.heroEyebrow}>Sales · Analytics</span>
            <div className={styles.heroTitle}>Reports</div>
            <div className={styles.heroSubStats}>
              <span>
                <strong>{summary.totalOrders}</strong> orders
              </span>
              <span className={styles.heroSubDot}>·</span>
              <span>{formatCurrency(summary.totalRevenue)} revenue</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={styles.scrollBody}>
        {/* ── Query Interface ── */}
        <QueryInterface onResultsChange={setQueryResult} />

        {/* ── Range Selector (for manual reports) ── */}
        {!queryResult && (
          <>
            <div className={styles.rangeSelector}>
              <Button
                variant={dateRange === "6-months" ? "contained" : "outlined"}
                size="small"
                onClick={() => setDateRange("6-months")}
              >
                Last 6 months
              </Button>
              <Button
                variant={dateRange === "12-months" ? "contained" : "outlined"}
                size="small"
                onClick={() => setDateRange("12-months")}
              >
                Last 12 months
              </Button>
              <Button
                variant={dateRange === "all-time" ? "contained" : "outlined"}
                size="small"
                onClick={() => setDateRange("all-time")}
              >
                All time
              </Button>
            </div>

            {error && <Alert severity="error">{error.message}</Alert>}

            {isLoading ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
                <Skeleton variant="rounded" height={400} />
                <Skeleton variant="rounded" height={100} />
              </Box>
            ) : (
              <>
                {/* ── Chart ── */}
                {data.length > 0 ? (
                  <div className={styles.chartContainer}>
                    <MonthlySalesChart data={data} />
                  </div>
                ) : (
                  <div className={styles.emptyState}>No data available for the selected period.</div>
                )}

                {/* ── Summary ── */}
                {data.length > 0 && <ReportSummary summary={summary} />}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ReportScreen
