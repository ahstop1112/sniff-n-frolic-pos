import { useMemo, useState } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import Skeleton from "@mui/material/Skeleton"
import Alert from "@mui/material/Alert"
import AnalyticsIcon from "@mui/icons-material/Analytics"
import { useMonthlyReport } from "@/domains/orders/hooks/useMonthlyReport"
import { useRevenueBreakdown } from "@/domains/orders/hooks/useRevenueBreakdown"
import MonthlySalesChart from "./components/MonthlySalesChart"
import ReportSummary from "./components/ReportSummary"
import QueryInterface from "./components/QueryInterface"
import RevenueBreakdown from "./components/RevenueBreakdown"
import ShareOfRevenue from "./components/ShareOfRevenue"
import type { ReportQueryResult } from "@/domains/orders/api/ordersApi"
import styles from "./ReportScreen.module.scss"

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(cents / 100)

type DateRange = "7-days" | "30-days" | "90-days" | "all-time"

const ReportScreen = () => {
  const [dateRange, setDateRange] = useState<DateRange>("30-days")
  const [queryResult, setQueryResult] = useState<ReportQueryResult | null>(null)

  const { dateFrom, dateTo } = useMemo(() => {
    const today = new Date()
    let from: Date

    if (dateRange === "7-days") {
      from = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (dateRange === "30-days") {
      from = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    } else if (dateRange === "90-days") {
      from = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
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

  const breakdownQuery = useRevenueBreakdown({
    date_from: dateFrom,
    date_to: dateTo,
  })

  const data = useMemo(() => query.data ?? [], [query.data])
  const breakdownData = useMemo(
    () => (breakdownQuery.data?.data ?? []) as Array<{ category: string; revenue: number; order_count: number }>,
    [breakdownQuery.data],
  )
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
          <div>
            <div className={styles.heroIcon}>
              <AnalyticsIcon />
            </div>
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
          <Button
            variant="contained"
            sx={{
              background: "#f15a24",
              color: "white",
              fontWeight: 600,
              fontSize: "0.85rem",
              padding: "8px 16px",
              textTransform: "none",
              "&:hover": {
                background: "#e04612",
              },
            }}
          >
            {data.length} Reports
          </Button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={styles.scrollBody}>
        {/* ── Summary Cards (Key Metrics at Top) ── */}
        {!queryResult && (
          <>
            {isLoading ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
                <Skeleton variant="rounded" height={80} />
                <Skeleton variant="rounded" height={80} />
              </Box>
            ) : (
              data.length > 0 && <ReportSummary summary={summary} />
            )}
          </>
        )}

        {/* ── Query Interface ── */}
        <QueryInterface onResultsChange={setQueryResult} />

        {/* ── Range Selector (for manual reports) ── */}
        {!queryResult && (
          <>
            <div className={styles.rangeSelector}>
              <Button
                variant={dateRange === "7-days" ? "contained" : "outlined"}
                size="small"
                onClick={() => setDateRange("7-days")}
              >
                Last 7 days
              </Button>
              <Button
                variant={dateRange === "30-days" ? "contained" : "outlined"}
                size="small"
                onClick={() => setDateRange("30-days")}
              >
                Last 30 days
              </Button>
              <Button
                variant={dateRange === "90-days" ? "contained" : "outlined"}
                size="small"
                onClick={() => setDateRange("90-days")}
              >
                Last 90 days
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

                {/* ── Revenue Breakdown & Share ── */}
                {breakdownData.length > 0 && (
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3, mt: 3 }}>
                    <div className={styles.chartContainer}>
                      <RevenueBreakdown data={breakdownData} />
                    </div>
                    <div className={styles.chartContainer}>
                      <ShareOfRevenue data={breakdownData} />
                    </div>
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ReportScreen
