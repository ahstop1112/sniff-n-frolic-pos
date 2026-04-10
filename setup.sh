#!/bin/bash
# AI-POS Structure Setup
# Run from your project root: bash setup.sh

echo "🐾 Setting up Sniff & Frolic POS structure..."

# ── domains/checkout ──────────────────────────────
mkdir -p src/domains/checkout/components
mkdir -p src/domains/checkout/hooks
mkdir -p src/domains/checkout/store
mkdir -p src/domains/checkout/types

cat > src/domains/checkout/types/checkout.types.ts << 'EOF'
// Checkout domain types
// Migrated from screens/sales/CartPanel/types.ts

export type Currency = "CAD" | "HKD" | "USD"

export interface OrderLine {
  id: string
  productId: string
  name: string
  unitPrice: number
  qty: number
  taxRate: number        // e.g. 0.05 for 5%
  discountAmount: number
}

export interface Order {
  id: string
  label: string
  lines: OrderLine[]
  status: OrderStatus
  createdAt: string
  memberId?: string      // links to member domain
  staffId?: string       // links to staff domain
  note?: string
}

export type OrderStatus =
  | "open"
  | "pending_payment"
  | "completed"
  | "cancelled"
  | "refunded"

export interface Payment {
  id: string
  orderId: string
  method: PaymentMethod
  amount: number
  currency: Currency
  paidAt: string
  reference?: string
}

export type PaymentMethod =
  | "cash"
  | "credit"
  | "debit"
  | "gift_card"
  | "store_credit"

export interface OrderSummary {
  subtotal: number
  taxTotal: number
  discountTotal: number
  total: number
  balanceDue: number
  change: number
}
EOF

cat > src/domains/checkout/store/checkoutStore.ts << 'EOF'
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
EOF

cat > src/domains/checkout/hooks/useCheckout.ts << 'EOF'
// Main checkout hook — consumed by CheckoutPane, CartPanel
export { useCheckoutStore } from "../store/checkoutStore"
EOF

cat > src/domains/checkout/hooks/usePayment.ts << 'EOF'
// Payment flow hook
// TODO: integrate with payment gateway
export const usePayment = () => {
  return {}
}
EOF

cat > src/domains/checkout/hooks/useReceipt.ts << 'EOF'
// Receipt hook — email, print, SMS
// Replaces posEmailReceipt / posSMSReceipt actions
export const useReceipt = () => {
  return {}
}
EOF

cat > src/domains/checkout/components/OrderLineItems.tsx << 'EOF'
// Migrated from: screens/sales/CartPanel (lines section)
// TODO: move line item rendering here
export const OrderLineItems = () => null
EOF

cat > src/domains/checkout/components/OrderSummary.tsx << 'EOF'
// Migrated from: screens/sales/CartPanel (SummaryBar section)
// TODO: move subtotal/tax/total display here
export const OrderSummary = () => null
EOF

cat > src/domains/checkout/components/PaymentPanel.tsx << 'EOF'
// Payment method selection + amount entry
// TODO: cash / card / gift card
export const PaymentPanel = () => null
EOF

cat > src/domains/checkout/components/ReceiptActions.tsx << 'EOF'
// Print / Email / SMS receipt buttons
export const ReceiptActions = () => null
EOF

cat > src/domains/checkout/components/CheckoutErrorBanner.tsx << 'EOF'
// Replaces switch(data.error) with 32 cases
// Maps error codes to user-friendly messages
export const CheckoutErrorBanner = () => null
EOF

cat > src/domains/checkout/index.ts << 'EOF'
// Public API — only import checkout domain through this file
export { useCheckoutStore } from "./store/checkoutStore"
export { useCheckout } from "./hooks/useCheckout"
export type { Order, OrderLine, Payment, OrderStatus, PaymentMethod, Currency } from "./types/checkout.types"
EOF

# ── domains/product ───────────────────────────────
mkdir -p src/domains/product/components
mkdir -p src/domains/product/hooks
mkdir -p src/domains/product/store
mkdir -p src/domains/product/types

cat > src/domains/product/types/product.types.ts << 'EOF'
// Product domain types
// Reference: original codebase Barcode enum + product model

export interface Product {
  id: string
  name: string
  sku: string
  barcode?: string
  unitPrice: number
  taxRate: number
  quantity: number       // current stock
  category: string
  imageUrl?: string
  isActive: boolean
  packages?: Package[]
}

export interface Package {
  packageReference: string
  quantity: number
}

export interface Combo {
  id: string
  name: string
  products: ComboProduct[]
  dateFrom?: string
  dateTo?: string
  daysOfWeek: number[]
  startTime?: string
  endTime?: string
}

export interface ComboProduct {
  id: string
  quantity: number
  originalUnitPrice: number
}

export type BarcodeType =
  | "product"     // starts with Z
  | "combo"       // starts with C
  | "government"  // 25+ chars, specific format
  | "upc"         // standard UPC

export interface ProductSearchFilters {
  searchText?: string
  categoryId?: string
  page: number
  itemsPerPage: number
  onSale?: boolean
}
EOF

cat > src/domains/product/hooks/useInventoryStream.ts << 'EOF'
// SSE subscriber — replaces setInterval polling
// Server pushes inventory updates when order completes

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

export const useInventoryStream = (branchId: string) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const es = new EventSource(`/api/inventory-stream/${branchId}`)

    es.onmessage = (e) => {
      const { productId, newQty } = JSON.parse(e.data)
      // React Query cache update → ProductGrid re-renders automatically
      queryClient.setQueryData(
        ["product", productId],
        (old: any) => old ? { ...old, quantity: newQty } : old
      )
    }

    es.onerror = () => {
      // SSE auto-reconnects — no manual retry needed
      console.warn("Inventory stream disconnected, reconnecting...")
    }

    return () => es.close()
  }, [branchId, queryClient])
}
EOF

cat > src/domains/product/hooks/useBarcode.ts << 'EOF'
// Barcode scanner hook
// Migrated from: POSPage.barcodeListener + getBarcodeType
import { useEffect, useRef } from "react"

export type BarcodeType = "product" | "combo" | "government" | "upc"

export const getBarcodeType = (barcode: string): BarcodeType => {
  if (barcode[0] === "Z") return "product"
  if (barcode[0] === "C") return "combo"
  if (barcode.length >= 25 && barcode.substring(0, 2) === "01") return "government"
  return "upc"
}

export const useBarcode = (onScan: (barcode: string) => void) => {
  const bufferRef = useRef("")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return

      bufferRef.current += e.key === "Enter" ? "\n" : e.key

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        if (bufferRef.current.trim()) onScan(bufferRef.current.trim())
        bufferRef.current = ""
      }, 500)
    }

    window.addEventListener("keypress", handler)
    return () => window.removeEventListener("keypress", handler)
  }, [onScan])
}
EOF

cat > src/domains/product/hooks/useProductSearch.ts << 'EOF'
// Product search with React Query
import { useQuery } from "@tanstack/react-query"
import type { ProductSearchFilters } from "../types/product.types"

export const useProductSearch = (filters: ProductSearchFilters) => {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 30_000,
  })
}

// TODO: replace with real API call
const fetchProducts = async (filters: ProductSearchFilters) => {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  })
  return res.json()
}
EOF

cat > src/domains/product/components/ProductGrid.tsx << 'EOF'
export const ProductGrid = () => null
EOF
cat > src/domains/product/components/ProductSearch.tsx << 'EOF'
export const ProductSearch = () => null
EOF
cat > src/domains/product/components/BarcodeHandler.tsx << 'EOF'
export const BarcodeHandler = () => null
EOF
cat > src/domains/product/components/InventoryBadge.tsx << 'EOF'
export const InventoryBadge = () => null
EOF

cat > src/domains/product/index.ts << 'EOF'
export { useProductSearch } from "./hooks/useProductSearch"
export { useInventoryStream } from "./hooks/useInventoryStream"
export { useBarcode, getBarcodeType } from "./hooks/useBarcode"
export type { Product, Package, Combo, BarcodeType, ProductSearchFilters } from "./types/product.types"
EOF

# ── domains/member ────────────────────────────────
mkdir -p src/domains/member/components
mkdir -p src/domains/member/hooks
mkdir -p src/domains/member/store
mkdir -p src/domains/member/types

cat > src/domains/member/types/member.types.ts << 'EOF'
// Member domain types

export interface Member {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  photoUrl?: string
  rewardPoints: number
  visitCount: number
  orderCount: number
  isEmployee: boolean
  eliteMember?: EliteMembership
}

export interface EliteMembership {
  startDate: string
  endDate: string
  isActive: boolean
  isExpired: boolean
}

export interface RewardInfo {
  points: number
  pendingPoints: number
  provider: "internal" | "springbig" | "alpineiq"
}
EOF

cat > src/domains/member/store/memberStore.ts << 'EOF'
import { create } from "zustand"
import type { Member } from "../types/member.types"

interface MemberState {
  activeMember: Member | null
  setMember: (member: Member | null) => void
  clearMember: () => void
}

export const useMemberStore = create<MemberState>((set) => ({
  activeMember: null,
  setMember: (member) => set({ activeMember: member }),
  clearMember: () => set({ activeMember: null }),
}))
EOF

cat > src/domains/member/components/MemberCard.tsx << 'EOF'
export const MemberCard = () => null
EOF
cat > src/domains/member/components/MemberSearch.tsx << 'EOF'
export const MemberSearch = () => null
EOF
cat > src/domains/member/components/RewardsPanel.tsx << 'EOF'
export const RewardsPanel = () => null
EOF

cat > src/domains/member/index.ts << 'EOF'
export { useMemberStore } from "./store/memberStore"
export type { Member, EliteMembership, RewardInfo } from "./types/member.types"
EOF

# ── domains/staff ─────────────────────────────────
mkdir -p src/domains/staff/components
mkdir -p src/domains/staff/hooks
mkdir -p src/domains/staff/store
mkdir -p src/domains/staff/types

cat > src/domains/staff/types/staff.types.ts << 'EOF'
// Staff domain types

export interface Staff {
  id: string
  firstName: string
  lastName: string
  role: StaffRole
  permissions: Permission[]
}

export type StaffRole = "owner" | "manager" | "cashier"

export type Permission =
  | "can_open_cash_drawer"
  | "can_cancel_order"
  | "can_apply_discount"
  | "can_refund"
  | "can_close_register"
  | "can_view_reports"

export interface PinUser {
  staff: Staff
  authenticated: boolean
  authenticatedAt: string
}
EOF

cat > src/domains/staff/store/staffStore.ts << 'EOF'
import { create } from "zustand"
import type { PinUser, Permission } from "../types/staff.types"

interface StaffState {
  pinUser: PinUser | null
  isAuthenticated: boolean
  hasPermission: (p: Permission) => boolean
  setPin: (user: PinUser) => void
  clearPin: () => void
}

export const useStaffStore = create<StaffState>((set, get) => ({
  pinUser: null,
  isAuthenticated: false,

  hasPermission: (permission) => {
    const { pinUser } = get()
    if (!pinUser?.authenticated) return false
    return pinUser.staff.permissions.includes(permission)
  },

  setPin: (user) => set({ pinUser: user, isAuthenticated: user.authenticated }),
  clearPin: () => set({ pinUser: null, isAuthenticated: false }),
}))
EOF

cat > src/domains/staff/components/PinGate.tsx << 'EOF'
export const PinGate = () => null
EOF
cat > src/domains/staff/components/StaffBadge.tsx << 'EOF'
export const StaffBadge = () => null
EOF
cat > src/domains/staff/components/ManagerActions.tsx << 'EOF'
export const ManagerActions = () => null
EOF

cat > src/domains/staff/index.ts << 'EOF'
export { useStaffStore } from "./store/staffStore"
export type { Staff, StaffRole, Permission, PinUser } from "./types/staff.types"
EOF

# ── services ──────────────────────────────────────
mkdir -p src/services/hardware/transports
mkdir -p src/services/sync
mkdir -p src/services/ai/prompts
mkdir -p src/services/sse

cat > src/services/hardware/HardwareService.ts << 'EOF'
// Unified hardware abstraction
// Replaces inline ws.send() scattered across POSPage

export type HardwareCommand =
  | { Command: "PRINT INVOICE";    Data: unknown }
  | { Command: "OPEN DRAWER";      Data: null }
  | { Command: "PRINT CARDINVOICE"; Data: unknown }
  | { Command: "PRINT LABEL";      Data: unknown }
  | { Command: "GET PIC";          Data: unknown }

type Transport = "websocket" | "http" | "native"

export class HardwareService {
  private ws: WebSocket | null = null
  private transport: Transport = "websocket"

  init(transport: Transport, wsUrl?: string) {
    this.transport = transport
    if (transport === "websocket" && wsUrl) {
      this.ws = new WebSocket(wsUrl)
      window.posWebSocket = this.ws
    }
  }

  printReceipt(data: unknown) {
    return this.send({ Command: "PRINT INVOICE", Data: data })
  }

  openDrawer() {
    return this.send({ Command: "OPEN DRAWER", Data: null })
  }

  private send(cmd: HardwareCommand) {
    switch (this.transport) {
      case "websocket":
        this.ws?.send(JSON.stringify(cmd))
        break
      case "http":
        fetch("/hardware", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cmd),
        })
        break
      case "native":
        // @ts-ignore — iPad native bridge
        window.printing?.(JSON.stringify(cmd))
        break
    }
  }
}

export const hardwareService = new HardwareService()
EOF

cat > src/services/sync/SyncQueue.ts << 'EOF'
// Offline order sync queue
// Stores ops in IndexedDB when offline, flushes on reconnect

export interface SyncOp {
  id: string
  type: "create_order" | "update_order" | "void_item"
  payload: unknown
  clientTimestamp: number
  retries: number
}

export class SyncQueue {
  private dbName = "pos-sync-queue"

  async enqueue(op: Omit<SyncOp, "id" | "retries">) {
    // TODO: write to IndexedDB
    console.log("Queued op:", op)
  }

  async flush(onSync: (op: SyncOp) => Promise<void>) {
    // TODO: read from IndexedDB, call onSync for each
    // Handle conflicts: last-write-wins with clientTimestamp
  }
}

export const syncQueue = new SyncQueue()
EOF

cat > src/services/ai/POSAssistant.ts << 'EOF'
// AI layer — your differentiator
// Wraps Anthropic API for POS-specific features

export interface ProductSuggestion {
  productId: string
  reason: string
  confidence: number
}

export class POSAssistant {
  async suggestProducts(params: {
    memberId?: string
    currentItems: string[]
    branchId: string
  }): Promise<ProductSuggestion[]> {
    // TODO: call Anthropic API
    // Use member purchase history + current cart to suggest
    return []
  }

  async summariseOrder(orderId: string): Promise<string> {
    // TODO: generate human-readable order summary for staff
    return ""
  }
}

export const posAssistant = new POSAssistant()
EOF

cat > src/services/sse/InventorySSE.ts << 'EOF'
// SSE client — server pushes inventory updates
// Used by useInventoryStream hook

export const createInventoryStream = (
  branchId: string,
  onUpdate: (productId: string, newQty: number) => void
) => {
  const es = new EventSource(`/api/inventory-stream/${branchId}`)

  es.onmessage = (e) => {
    const { productId, newQty } = JSON.parse(e.data)
    onUpdate(productId, newQty)
  }

  return () => es.close()
}
EOF

# ── shared ────────────────────────────────────────
mkdir -p src/shared/components/ui
mkdir -p src/shared/components/layout
mkdir -p src/shared/hooks
mkdir -p src/shared/types

cat > src/shared/hooks/useModal.ts << 'EOF'
// Modal registry — replaces 50+ boolean flags
// Single source of truth for all dialogs

import { create } from "zustand"

type ModalId = string
type ModalData = Record<string, unknown>

interface ModalState {
  activeModal: ModalId | null
  modalData: ModalData
  open: (id: ModalId, data?: ModalData) => void
  close: () => void
  isOpen: (id: ModalId) => boolean
}

export const useModal = create<ModalState>((set, get) => ({
  activeModal: null,
  modalData: {},

  open: (id, data = {}) => set({ activeModal: id, modalData: data }),
  close: () => set({ activeModal: null, modalData: {} }),
  isOpen: (id) => get().activeModal === id,
}))
EOF

cat > src/shared/hooks/useIdleTimer.ts << 'EOF'
// Idle timer — triggers PIN lock after inactivity
// Migrated from: POSPage IdleTimer + handleOnIdle

import { useEffect, useRef } from "react"

export const useIdleTimer = (timeoutMs: number, onIdle: () => void) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(onIdle, timeoutMs)
  }

  useEffect(() => {
    const events = ["mousemove", "keypress", "click", "touchstart"]
    events.forEach((e) => window.addEventListener(e, reset))
    reset()
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [timeoutMs, onIdle])
}
EOF

cat > src/shared/components/layout/ModalRenderer.tsx << 'EOF'
// Renders the active modal — replaces 50 inline <DialogInput> components
// Add new modals here as you build them

import { useModal } from "../../hooks/useModal"

// TODO: import actual modal components as you build them
// import { PaymentModal } from "@/domains/checkout/components/PaymentPanel"
// import { CashInModal }   from "@/domains/staff/components/CashDrawerPanel"

export const ModalRenderer = () => {
  const { activeModal } = useModal()

  switch (activeModal) {
    // case "payment":   return <PaymentModal />
    // case "cash-in":   return <CashInModal />
    default:
      return null
  }
}
EOF

cat > src/shared/types/common.types.ts << 'EOF'
// Shared primitives — no domain knowledge here

export type Currency = "CAD" | "HKD" | "USD"
export type Locale = "en" | "zh-HK" | "zh-CN"

export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string }
EOF

# ── providers ─────────────────────────────────────
mkdir -p src/providers

cat > src/providers/HardwareProvider.tsx << 'EOF'
// Injects HardwareService via Context
// Any component can call useHardware() to print / open drawer

import { createContext, useContext, useEffect, type ReactNode } from "react"
import { hardwareService, type HardwareService } from "@/services/hardware/HardwareService"

const HardwareContext = createContext<HardwareService>(hardwareService)

export const useHardware = () => useContext(HardwareContext)

export const HardwareProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    // Detect transport: native iPad, HTTP, or WebSocket
    const isNative = typeof window !== "undefined" && "printing" in window
    const useHttp  = import.meta.env.VITE_HTTP_PRINTING === "true"

    hardwareService.init(
      isNative ? "native" : useHttp ? "http" : "websocket",
      "ws://127.0.0.1:5000/"
    )
  }, [])

  return (
    <HardwareContext.Provider value={hardwareService}>
      {children}
    </HardwareContext.Provider>
  )
}
EOF

cat > src/providers/AppProviders.tsx << 'EOF'
// Compose all providers here — keep app/main.tsx clean

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { HardwareProvider } from "./HardwareProvider"
import type { ReactNode } from "react"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 2 },
  },
})

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <HardwareProvider>
      {children}
    </HardwareProvider>
  </QueryClientProvider>
)
EOF

echo ""
echo "✅ Done! Structure created:"
echo ""
echo "  src/domains/checkout/   — Order, Payment, Receipt"
echo "  src/domains/product/    — Products, Inventory, Barcode, SSE"
echo "  src/domains/member/     — Member, Rewards"
echo "  src/domains/staff/      — PIN, Permissions"
echo "  src/services/hardware/  — Unified WS/HTTP/native"
echo "  src/services/sync/      — Offline queue"
echo "  src/services/ai/        — POSAssistant (your differentiator)"
echo "  src/services/sse/       — Inventory stream"
echo "  src/shared/             — UI primitives, useModal, useIdleTimer"
echo "  src/providers/          — HardwareProvider, AppProviders"
echo ""
echo "⚠️  Your existing files are untouched."
echo "   CartPanel, LoginScreen, routes.tsx — all still there."
echo ""
echo "🐾 Next: migrate CartPanel types → domains/checkout/types/"