import { useMutation } from "@tanstack/react-query"
import { queryReport } from "../api/ordersApi"

interface ReportQueryPayload {
  question: string
  context?: {
    date_from?: string
    date_to?: string
    granularity?: "day" | "week" | "month"
    current_intent?: string | null
  }
}

export const useReportQuery = () =>
  useMutation({
    mutationFn: (payload: ReportQueryPayload | string) => {
      if (typeof payload === "string") {
        return queryReport(payload)
      }
      return queryReport(payload.question, payload.context)
    },
  })
