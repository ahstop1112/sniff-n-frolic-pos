import { create } from "zustand";
import { persist } from "zustand/middleware"
import type { CartLine, OrderScope, ProductLite, SalesOrder } from "./types";

type OrdersState = {
  orders: SalesOrder[];
  activeOrderId: string;

  createOrder: (ctx: { scope: OrderScope; staffId: string; shiftId: string }) => string;
  setActiveOrder: (orderId: string) => void;

  holdOrder: (ctx: { orderId: string; staffId: string; reason?: string }) => void;
  resumeOrder: (ctx: { orderId: string; staffId: string }) => void;
  cancelOrder: (ctx: { orderId: string; staffId: string; reason?: string }) => void;

  closeOrderTab: (orderId: string) => void; // MVP: remove from list (void doesn't remove)

  addLineItem: (ctx: { orderId: string; product: ProductLite; qty?: number }) => void;
  incLineQty: (ctx: { orderId: string; lineId: string }) => void;
  decLineQty: (ctx: { orderId: string; lineId: string }) => void;
  removeLine: (ctx: { orderId: string; lineId: string }) => void;

  getSubtotal: (orderId: string) => number;
};

const createId = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

const createEmptyOrder = (p: {
  index: number;
  scope: OrderScope;
  staffId: string;
  shiftId: string;
}): SalesOrder => {
  const now = Date.now();

  return {
    ...p.scope,
    id: createId(),
    label: `Order ${p.index}`,
    status: "active",
    createdAt: now,
    updatedAt: now,
    createdByStaffId: p.staffId,
    ownerStaffId: p.staffId,
    shiftId: p.shiftId,
    lines: [],
    taxRate: 0,
  };
};

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
        orders: [],
        activeOrderId: "",
        createOrder: ({ scope, staffId, shiftId }) => {
            const next = createEmptyOrder({
            index: get().orders.length + 1,
            scope,
            staffId,
            shiftId,
            });

            set((s) => ({
            orders: s.orders.length ? [...s.orders, next] : [next],
            activeOrderId: next.id,
            }));

            return next.id;
        },
        setActiveOrder: (orderId) => set({ activeOrderId: orderId }),
        holdOrder: ({ orderId, staffId, reason }) => {
            set((s) => ({
            orders: s.orders.map((o) =>
                o.id === orderId && o.status !== "void"
                ? {
                    ...o,
                    status: "held",
                    updatedAt: Date.now(),
                    heldAt: Date.now(),
                    heldByStaffId: staffId,
                    holdReason: reason,
                    }
                : o
            ),
            }));
        },
        resumeOrder: ({ orderId, staffId }) => {
            // Shared pool: anyone can resume; resume auto-claims
            set((s) => ({
            orders: s.orders.map((o) =>
                o.id === orderId && o.status !== "void"
                ? { ...o, status: "active", updatedAt: Date.now(), ownerStaffId: staffId }
                : o
            ),
            activeOrderId: orderId,
            }));
        },
            cancelOrder: ({ orderId, staffId, reason }) => {
            set((s) => {
            const nextOrders = s.orders.map((o) =>
                o.id === orderId && o.status !== "void"
                ? {
                    ...o,
                    status: "void",
                    updatedAt: Date.now(),
                    voidedAt: Date.now(),
                    voidedByStaffId: staffId,
                    voidReason: reason,
                    }
                : o
            );

            const nextActive =
                s.activeOrderId === orderId
                ? nextOrders.find((o) => o.status === "active")?.id ?? ""
                : s.activeOrderId;

            return { orders: nextOrders, activeOrderId: nextActive };
            });
        },
        closeOrderTab: (orderId) => {
            set((s) => {
            const nextOrders = s.orders.filter((o) => o.id !== orderId);
            const nextActive =
                s.activeOrderId === orderId ? nextOrders.at(-1)?.id ?? "" : s.activeOrderId;
            return { orders: nextOrders, activeOrderId: nextActive };
            });
        },
        addLineItem: ({ orderId, product, qty = 1 }) => {
            set((s) => ({
            orders: s.orders.map((o) => {
                if (o.id !== orderId) return o;
                if (o.status === "void") return o;

                const existing = o.lines.find((l) => l.productId === product.id);
                const now = Date.now();

                if (existing) {
                return {
                    ...o,
                    updatedAt: now,
                    lines: o.lines.map((l) => (l.id === existing.id ? { ...l, qty: l.qty + qty } : l)),
                };
                }

                const newLine: CartLine = {
                id: createId(),
                productId: product.id,
                name: product.name,
                unitPrice: product.price,
                qty,
                };

                return { ...o, updatedAt: now, lines: [newLine, ...o.lines] };
            }),
            }));
        },
        incLineQty: ({ orderId, lineId }) => {
            set((s) => ({
            orders: s.orders.map((o) => {
                if (o.id !== orderId) return o;
                if (o.status === "void") return o;

                return {
                ...o,
                updatedAt: Date.now(),
                lines: o.lines.map((l) => (l.id === lineId ? { ...l, qty: l.qty + 1 } : l)),
                };
            }),
            }));
        },
        decLineQty: ({ orderId, lineId }) => {
            const order = get().orders.find((o) => o.id === orderId);
            const line = order?.lines.find((l) => l.id === lineId);
            if (!line) return;

            const nextQty = Math.max(0, line.qty - 1);

            set((s) => ({
            orders: s.orders.map((o) => {
                if (o.id !== orderId) return o;
                if (o.status === "void") return o;

                const nextLines =
                nextQty === 0
                    ? o.lines.filter((l) => l.id !== lineId)
                    : o.lines.map((l) => (l.id === lineId ? { ...l, qty: nextQty } : l));

                return { ...o, updatedAt: Date.now(), lines: nextLines };
            }),
            }));
        },
        removeLine: ({ orderId, lineId }) => {
            set((s) => ({
            orders: s.orders.map((o) => {
                if (o.id !== orderId) return o;
                if (o.status === "void") return o;

                return {
                ...o,
                updatedAt: Date.now(),
                lines: o.lines.filter((l) => l.id !== lineId),
                };
            }),
            }));
        },
        getSubtotal: (orderId) => {
            const order = get().orders.find((o) => o.id === orderId);
            if (!order) return 0;

            const raw = order.lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
            const discount = order.discount ?? 0;
            return Math.max(0, raw - discount);
        },
    }),
    {
      name: "pos-orders",
      partialize: (state) => ({
        orders: state.orders,
        activeOrderId: state.activeOrderId,
      }),
    }
  )
)