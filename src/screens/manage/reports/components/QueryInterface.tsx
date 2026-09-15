import { useState } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import Alert from "@mui/material/Alert"
import CircularProgress from "@mui/material/CircularProgress"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import SendIcon from "@mui/icons-material/Send"
import { useReportQuery } from "@/domains/orders/hooks/useReportQuery"
import type { ReportQueryResult, ReportParams } from "@/domains/orders/api/ordersApi"
import QueryResultChart from "./QueryResultChart"
import styles from "./QueryInterface.module.scss"

type QueryStatus = "idle" | "loading" | "ready" | "editing"

const SUPPORTED_INTENTS = [
  { id: "revenue_over_time", label: "Revenue trends over time" },
  { id: "revenue_by_category", label: "Revenue by product category" },
  { id: "top_products", label: "Top-selling or highest-revenue products" },
  { id: "period_comparison", label: "Compare two time periods" },
  { id: "explain_change", label: "Explain what changed between periods" },
  { id: "slow_movers", label: "Products with low sales" },
]

interface QueryInterfaceProps {
  onResultsChange?: (result: ReportQueryResult | null) => void
  context?: {
    date_from?: string
    date_to?: string
    granularity?: "day" | "week" | "month"
    current_intent?: string | null
  }
}

const QueryInterface = ({ onResultsChange, context }: QueryInterfaceProps) => {
  const [question, setQuestion] = useState("")
  const [result, setResult] = useState<ReportQueryResult | null>(null)
  const [status, setStatus] = useState<QueryStatus>("idle")
  const [editParams, setEditParams] = useState<ReportParams>({})

  const mutation = useReportQuery()
  const isLoading = mutation.isPending
  const error = mutation.error as Error | null

  const handleSubmitQuestion = async () => {
    if (!question.trim()) return

    setStatus("loading")
    try {
      const res = await mutation.mutateAsync({
        question: question.trim(),
        context: context || {},
      })
      setResult(res)
      setEditParams(res.params || {})
      setStatus("ready")
      onResultsChange?.(res)
    } catch {
      setResult(null)
      setStatus("idle")
    }
  }

  const handleEditClick = () => {
    if (!result) return
    setEditParams(result.params || {})
    setStatus("editing")
  }

  const handleUpdateParams = (key: keyof ReportParams, value: unknown) => {
    setEditParams((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleApplyEdit = async () => {
    if (!result) return
    setStatus("loading")
    try {
      const res = await mutation.mutateAsync({
        question: question.trim(),
        context: {
          ...context,
          date_from: editParams.date_from,
          date_to: editParams.date_to,
        },
      })
      const updatedResult = {
        ...res,
        params: editParams,
      }
      setResult(updatedResult)
      setStatus("ready")
      onResultsChange?.(updatedResult)
    } catch {
      setStatus("ready")
    }
  }

  return (
    <div className={styles.root}>
      {/* ── Question Input ── */}
      <Box className={styles.questionSection}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
          <TextField
            fullWidth
            multiline
            placeholder="Ask about your sales data. e.g., 'Show me revenue for the last 3 months' or 'What are the top 10 products?'"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                handleSubmitQuestion()
              }
            }}
            disabled={isLoading}
            sx={{ height: 56, "& .MuiInputBase-input": { padding: 0 } }}
          />
          <Button
            variant="contained"
            onClick={handleSubmitQuestion}
            disabled={!question.trim() || isLoading}
            endIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
            sx={{ minWidth: 120, height: 56, padding: "16px 14px" }}
          >
            {isLoading ? "Analyzing..." : "Analyze"}
          </Button>
        </Box>
      </Box>

      {/* ── Error ── */}
      {error && <Alert severity="error">{error.message}</Alert>}

      {/* ── Results: Interpretation + Chart (shown when ready) ── */}
      {result && status === "ready" && result.intent !== "unsupported" && (
        <>
          <Box className={styles.interpretationSection}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, justifyContent: "space-between" }}>
              <div className={styles.interpretationText}>
                {result.interpretation}
                {result.params?.period_a_from && result.params?.period_b_to && (
                  <div style={{ fontSize: "0.875rem", color: "#666", marginTop: "8px" }}>
                    ({new Date(result.params.period_a_from).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(result.params.period_b_to).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
                  </div>
                )}
                {(result.intent === "top_products" || result.intent === "revenue_by_category") && (
                  <div style={{ fontSize: "0.875rem", color: "#666", marginTop: "8px" }}>
                    ({result.params?.metric || "revenue"} by {result.params?.date_from ? `${new Date(result.params.date_from).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(result.params.date_to || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : "all time"})
                  </div>
                )}
              </div>
              <Button
                size="small"
                variant="outlined"
                onClick={handleEditClick}
              >
                Adjust
              </Button>
            </Box>
          </Box>
          <Box className={styles.resultSection}>
            <QueryResultChart result={result} editedParams={editParams} />
          </Box>
        </>
      )}

      {/* ── Edit Dialog (shown when status is 'editing') ── */}
      <Dialog open={status === "editing"} onClose={() => setStatus("ready")} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Query Parameters</DialogTitle>
        <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Date Range */}
          <Box>
            <TextField
              fullWidth
              label="From Date"
              type="date"
              value={editParams.date_from?.split("T")[0] || ""}
              onChange={(e) => handleUpdateParams("date_from", e.target.value || undefined)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              label="To Date"
              type="date"
              value={editParams.date_to?.split("T")[0] || ""}
              onChange={(e) => handleUpdateParams("date_to", e.target.value || undefined)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Granularity */}
          {editParams.granularity && (
            <FormControl fullWidth>
              <InputLabel>Granularity</InputLabel>
              <Select
                label="Granularity"
                value={editParams.granularity || "month"}
                onChange={(e) => handleUpdateParams("granularity", e.target.value)}
              >
                <MenuItem value="day">Daily</MenuItem>
                <MenuItem value="week">Weekly</MenuItem>
                <MenuItem value="month">Monthly</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Metric */}
          {editParams.metric && (
            <FormControl fullWidth>
              <InputLabel>Metric</InputLabel>
              <Select
                label="Metric"
                value={editParams.metric || "revenue"}
                onChange={(e) => handleUpdateParams("metric", e.target.value)}
              >
                <MenuItem value="revenue">Revenue</MenuItem>
                <MenuItem value="units">Units Sold</MenuItem>
                <MenuItem value="orders">Order Count</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Top N */}
          {editParams.top_n && (
            <TextField
              fullWidth
              label="Top N Items"
              type="number"
              value={editParams.top_n}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10)
                handleUpdateParams("top_n", isNaN(val) ? undefined : val)
              }}
              inputProps={{ min: 1, max: 20 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatus("ready")}>Cancel</Button>
          <Button onClick={handleApplyEdit} variant="contained" disabled={isLoading}>
            {isLoading ? "Applying..." : "Apply"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Unsupported Message ── */}
      {result && result.intent === "unsupported" && (
        <Box className={styles.unsupportedSection}>
          <Alert severity="info" sx={{ mb: 2 }}>
            {result.interpretation}
          </Alert>
          <div className={styles.supportedTypesLabel}>Supported question types:</div>
          <ul className={styles.supportedTypesList}>
            {SUPPORTED_INTENTS.map((intent) => (
              <li key={intent.id}>{intent.label}</li>
            ))}
          </ul>
        </Box>
      )}
    </div>
  )
}

export default QueryInterface
