export type UserRole = 'staff' | 'manager' | 'admin';

export type Permissions =
  | 'sale:create'
  | 'sale:refund'
  | 'product:edit'
  | 'report:view'
  | 'staff:manage';