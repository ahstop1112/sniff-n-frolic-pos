import type { CartLine } from "@/domains/orders/types"

export type PaymentMethod = "cash" | "credit" | "debit"

export type CashDenomination = {
  label: string
  value: number    // cents
  type: "bill" | "coin"
}

export const CAD_DENOMINATIONS: CashDenomination[] = [
  { label: "$100", value: 10000, type: "bill" },
  { label: "$50",  value: 5000,  type: "bill" },
  { label: "$20",  value: 2000,  type: "bill" },
  { label: "$10",  value: 1000,  type: "bill" },
  { label: "$5",   value: 500,   type: "bill" },
  { label: "$2",   value: 200,   type: "coin" },
  { label: "$1",   value: 100,   type: "coin" },
  { label: "25¢",  value: 25,    type: "coin" },
  { label: "10¢",  value: 10,    type: "coin" },
  { label: "5¢",   value: 5,     type: "coin" },
]

export type PaymentStep =
  | { step: "select" }
  | { step: "cash";       denominations: Record<string, number> }
  | { step: "processing" }
  | { step: "complete";   received: number; change: number }

export type PaymentModalProps = {
  open: boolean
  orderId: string
    total: number      // cents
    lines: CartLine[]
  onClose: () => void
  onComplete: () => void
}