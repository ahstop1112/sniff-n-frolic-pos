import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { useAppStore } from "@/app/store";
import { useOrdersStore } from "./store";

const OrdersProvider = ({ children }: PropsWithChildren) => {
  const staffId = useAppStore((s) => s.currentStaffId); 
  const shiftId = useAppStore((s) => s.currentShiftId);

  const orders = useOrdersStore((s) => s.orders);
  const createOrder = useOrdersStore((s) => s.createOrder);

  useEffect(() => {
    if (!staffId || !shiftId) return;
    if (orders.length > 0) return;
    createOrder({ staffId, shiftId });
  }, [staffId, shiftId, orders.length, createOrder]);

  return <>{children}</>;
};

export default OrdersProvider;