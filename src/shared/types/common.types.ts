// Shared primitives — no domain knowledge here

export type Currency = "CAD" | "HKD" | "USD"
export type Locale = "en" | "zh-HK" | "zh-CN"

export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string }
