import { create } from "zustand"
import type { Member } from "../types/member.types"

interface MemberState {
  activeMember: Member | null
  setMember: (member: Member | null) => void
  clearMember: () => void
}

export const useMemberStore = create<MemberState>((set) => ({
  activeMember: null,
  setMember: (member) => set({ activeMember: member }),
  clearMember: () => set({ activeMember: null }),
}))
