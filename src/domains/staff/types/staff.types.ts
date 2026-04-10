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
