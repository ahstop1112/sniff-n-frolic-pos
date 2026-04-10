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
