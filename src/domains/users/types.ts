import type { Permission, UserRole } from '@/domains/authorization/permissions';

export type AppUser = {
  id: string;
  email: string;
  status: 'active' | 'inactive';
  name: string;
  role: UserRole;
  permissions: Permission[];
};