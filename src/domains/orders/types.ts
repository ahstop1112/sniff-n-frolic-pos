export type OrderStatus = "active" | "held" | "void";

export type OrderScope = {
  orgId: string;
  locationId: string;
  deviceId: string;
};

export type ProductLite = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
};

export type CartLine = {
  id: string;
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
  image?: string | null;
};

export type SalesOrder = OrderScope & {
  id: string;
  label: string;
  status: OrderStatus;

  createdAt: number;
  updatedAt: number;

  createdByStaffId: string;
  ownerStaffId: string;
  shiftId: string;

  heldAt?: number;
  heldByStaffId?: string;
  holdReason?: string;

  voidedAt?: number;
  voidedByStaffId?: string;
  voidReason?: string;

  lines: CartLine[];

  // pricing hooks (future)
  taxRate?: number;
  discount?: number;
};