// Checkout Zustand store
// Replaces Redux posOrder + 50 boolean dialog flags

import { create } from "zustand"
import type { Order, Payment } from "../types/checkout.types"

type ModalId =
  | "payment"
  | "refund"
  | "cancel-order"
  | "receipt-email"
  | "receipt-sms"
  | "cash-in"
  | "cash-drop"
  | "gift-card"
  | null

interface CheckoutState {
  // Order
  activeOrderId: string | null
  orders: Order[]

  // UI state
  activeModal: ModalId
  errorCode: number | null

  // Actions
  setActiveOrder: (id: string) => void
  openModal: (id: ModalId) => void
  closeModal: () => void
  setError: (code: number | null) => void
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  activeOrderId: null,
  orders: [],
  activeModal: null,
  errorCode: null,

  setActiveOrder: (id) => set({ activeOrderId: id }),
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
  setError: (code) => set({ errorCode: code }),
}))
