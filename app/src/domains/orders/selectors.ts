import type { SalesOrder } from "./types";

export const selectActiveOrder = (orders: SalesOrder[], activeOrderId: string) =>
  orders.find((o) => o.id === activeOrderId);

export const selectHeldOrders = (orders: SalesOrder[]) =>
  orders.filter((o) => o.status === "held");

export const selectLiveOrders = (orders: SalesOrder[]) =>
  orders.filter((o) => o.status !== "void");