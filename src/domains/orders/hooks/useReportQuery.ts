import { useMutation } from "@tanstack/react-query"
import { queryReport } from "../api/ordersApi"

export const useReportQuery = () =>
  useMutation({
    mutationFn: (question: string) => queryReport(question),
  })
