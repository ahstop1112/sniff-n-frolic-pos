export const PERMISSIONS = {
  MANAGE_INVENTORY_VIEW: 'manage:inventory:view',
  MANAGE_INVENTORY_EDIT: 'manage:inventory:edit',
  SALES_CHECKOUT_USE: 'sales:checkout:use',
  SALES_DISCOUNT_LOW: 'sales:discount:low',
  SALES_DISCOUNT_HIGH: 'sales:discount:high',
} as const;

export type Permission =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export type UserRole = 'staff' | 'manager' | 'admin';

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  staff: [
    PERMISSIONS.MANAGE_INVENTORY_VIEW,
    PERMISSIONS.SALES_CHECKOUT_USE,
  ],
  manager: [
    PERMISSIONS.MANAGE_INVENTORY_VIEW,
    PERMISSIONS.MANAGE_INVENTORY_EDIT,
    PERMISSIONS.SALES_CHECKOUT_USE,
    PERMISSIONS.SALES_DISCOUNT_LOW,
    PERMISSIONS.SALES_DISCOUNT_HIGH,
  ],
  admin: Object.values(PERMISSIONS),
} as const;