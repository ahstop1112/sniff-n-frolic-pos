import type {
  CreateMovementBody,
  CreateMovementResponse,
  GetMovementsParams,
  GetStockParams,
  Movement,
  MovementListResponse,
  StockItem,
  StockListResponse,
} from "../types/inventory.types"

const getToken = () => localStorage.getItem("snf_pos_access_token")

// The backend error messages are already specific (insufficient stock, etc.),
// so we surface them verbatim instead of wrapping in a generic string (see spec §Core Principles).
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
  const url = new URL(`/api/inventory${path}`, window.location.origin)
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

export const getStock = (params: GetStockParams = {}): Promise<StockListResponse> =>
  request(
    buildUrl("/stock", {
      search: params.search,
      low_stock_only: params.low_stock_only,
      low_stock_threshold: params.low_stock_threshold,
      branch_id: params.branch_id,
      limit:  params.limit && params.limit > 200 ? 200 : params.limit,
      offset: params.offset,
    }),
    { method: "GET" },
    "Failed to fetch stock",
  )

export const getStockByProduct = (productId: string): Promise<StockItem> =>
  request(buildUrl(`/stock/${productId}`), { method: "GET" }, "Failed to fetch stock item")

export const getMovements = (params: GetMovementsParams = {}): Promise<MovementListResponse> =>
  request(
    buildUrl("/movements", {
      product_id: params.product_id,
      branch_id: params.branch_id,
      reason: params.reason,
      date_from: params.date_from,
      date_to: params.date_to,
      limit: params.limit,
      offset: params.offset,
    }),
    { method: "GET" },
    "Failed to fetch movements",
  )

export const getMovement = (id: string): Promise<Movement> =>
  request(buildUrl(`/movements/${id}`), { method: "GET" }, "Failed to fetch movement")

export const createMovement = (body: CreateMovementBody): Promise<CreateMovementResponse> =>
  request(
    buildUrl("/movements"),
    { method: "POST", body: JSON.stringify(body) },
    "Failed to create movement",
  )
