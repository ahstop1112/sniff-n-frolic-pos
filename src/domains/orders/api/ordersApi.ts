const getToken = () => localStorage.getItem("snf_pos_access_token")

const readErrorMessage = async (res: Response, fallback: string) => {
  try {
    const body = await res.json()
    if (typeof body?.message === "string") return body.message
    if (Array.isArray(body?.message)) return body.message.join(", ")
  } catch {
    // no JSON body — fall through
  }
  return fallback
}

const buildUrl = (path: string, params?: Record<string, string | number | boolean | null | undefined>) => {
  const url = new URL(`http://localhost:4000/orders${path}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") continue
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

const request = async <T>(url: string, init: RequestInit, fallbackError: string): Promise<T> => {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  })
  if (!res.ok) throw new Error(await readErrorMessage(res, fallbackError))
  return res.json()
}

export interface Order {
  id: string
  order_number: string
  created_at: string
  source: "pos" | "online"
  status: string
  subtotal: number
  discount: number
  total: number
  customer_name: string | null
  member_id: string | null
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  sku: string | null
  quantity: number
  unit_price: number
  subtotal: number
  product_image_url?: string | null
  created_at: string
}

export interface OrderEvent {
  id: string
  order_id: string
  event_type: string
  actor: string
  detail: Record<string, unknown>
  created_at: string
}

export interface OrderDetail extends Order {
  items: OrderItem[]
  events?: OrderEvent[]
  shipping_address?: {
    line1: string
    line2?: string
    city: string
    province: string
    postal_code: string
    country: string
  } | null
  guest_email?: string | null
  notes?: string | null
}

export interface OrderListResponse {
  orders: Order[]
  total: number
  limit: number
  offset: number
}

export const getOrders = (params: {
  branch_id?: string
  status?: string
  date_from?: string
  date_to?: string
  source?: "pos" | "online"
  sort_by?: string
  sort_dir?: string
  search?: string
  limit?: number
  offset?: number
} = {}): Promise<OrderListResponse> =>
  request(
    buildUrl("", {
      branch_id: params.branch_id,
      status: params.status,
      date_from: params.date_from,
      date_to: params.date_to,
      source: params.source,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
      search: params.search,
      limit: params.limit,
      offset: params.offset,
    }),
    { method: "GET" },
    "Failed to fetch orders",
  )

export const getOrder = (id: string): Promise<OrderDetail> =>
  request(buildUrl(`/${id}`), { method: "GET" }, "Failed to fetch order")

export interface MonthlyReportData {
  month: string
  order_count: number
  revenue: number
  cancelled_count: number
  avg_order_value: number
}

export const getMonthlyReport = (params: {
  date_from?: string
  date_to?: string
  branch_id?: string
} = {}): Promise<MonthlyReportData[]> =>
  request(
    buildUrl("/report/monthly", {
      date_from: params.date_from,
      date_to: params.date_to,
      branch_id: params.branch_id,
    }),
    { method: "GET" },
    "Failed to fetch monthly report",
  )

export type ReportIntent =
  | "revenue_over_time"
  | "revenue_by_category"
  | "top_products"
  | "period_comparison"
  | "explain_change"
  | "slow_movers"
  | "unsupported"

export type ChartType = "line" | "bar" | "comparison" | "table"

export interface ReportParams {
  date_from?: string
  date_to?: string
  granularity?: "day" | "week" | "month"
  metric?: "revenue" | "units" | "orders"
  top_n?: number
  compare_from?: string
  compare_to?: string
}

export interface ReportQueryResult {
  intent: ReportIntent
  params: ReportParams
  interpretation: string
  chartType: ChartType
  data: Array<Record<string, unknown>>
}

export const queryReport = (
  question: string,
  context?: {
    date_from?: string
    date_to?: string
    granularity?: "day" | "week" | "month"
    current_intent?: string | null
  },
): Promise<ReportQueryResult> =>
  request(
    buildUrl("/report/query"),
    {
      method: "POST",
      body: JSON.stringify({ question, context }),
    },
    "Failed to process report query",
  )
