import { useEffect, useMemo } from "react";
import { useOrdersStore } from "./store";
import { selectActiveOrder, selectHeldOrders, selectLiveOrders } from "./selectors";
import type { ProductLite } from "./types";

import { useAuthStore } from "@/domains/auth/store";
import { useDeviceStore } from "@/domains/device/store";

export const useOrders = () => {
  const orders = useOrdersStore((s) => s.orders);
  const activeOrderId = useOrdersStore((s) => s.activeOrderId);

  const createOrderRaw = useOrdersStore((s) => s.createOrder);
  const setActiveOrder = useOrdersStore((s) => s.setActiveOrder);

  const holdOrderRaw = useOrdersStore((s) => s.holdOrder);
  const resumeOrderRaw = useOrdersStore((s) => s.resumeOrder);
  const cancelOrderRaw = useOrdersStore((s) => s.cancelOrder);
  const closeOrderTab = useOrdersStore((s) => s.closeOrderTab);

  const addLineItemRaw = useOrdersStore((s) => s.addLineItem);
  const incLineQty = useOrdersStore((s) => s.incLineQty);
  const decLineQty = useOrdersStore((s) => s.decLineQty);
  const removeLine = useOrdersStore((s) => s.removeLine);

  const getSubtotal = useOrdersStore((s) => s.getSubtotal);

  const { staffId, shiftId } = useAuthStore();
  const { orgId, locationId, deviceId } = useDeviceStore();

  const scope = useMemo(() => ({ orgId, locationId, deviceId }), [orgId, locationId, deviceId]);

  const activeOrder = useMemo(
    () => selectActiveOrder(orders, activeOrderId),
    [orders, activeOrderId]
  );

  const heldOrders = useMemo(() => selectHeldOrders(orders), [orders]);
  const liveOrders = useMemo(() => selectLiveOrders(orders), [orders]);

  const createOrder = () => createOrderRaw({ scope, staffId, shiftId });

  const holdActiveOrder = (reason?: string) => {
    if (!activeOrder) return;
    holdOrderRaw({ orderId: activeOrder.id, staffId, reason });
  };

  const resumeOrder = (orderId: string) => {
    resumeOrderRaw({ orderId, staffId }); // auto-claim
  };

  const cancelOrder = (orderId: string, reason?: string) => {
    cancelOrderRaw({ orderId, staffId, reason });
  };

  const addLineItemToActive = (product: ProductLite, qty?: number) => {
    if (!activeOrder) return;
    addLineItemRaw({ orderId: activeOrder.id, product, qty });
  };

  const activeSubtotal = activeOrder ? getSubtotal(activeOrder.id) : 0;

  // ensure at least 1 order exists
  useEffect(() => {
    if (!staffId || !shiftId || !orgId || !locationId || !deviceId) return;
    if (length > 0) return;
    createOrder();
  }, [staffId, shiftId, orgId, locationId, deviceId, length]);

  return {
    // state
    orders,
    liveOrders,
    activeOrderId,
    activeOrder,
    heldOrders,

    // totals
    getSubtotal,
    activeSubtotal,

    // actions
    createOrder,
    setActiveOrder,
    closeOrderTab,

    addLineItemToActive,
    incLineQty,
    decLineQty,
    removeLine,

    holdActiveOrder,
    resumeOrder,
    cancelOrder,
  };
};
