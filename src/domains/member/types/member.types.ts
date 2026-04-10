// Member domain types

export interface Member {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  photoUrl?: string
  rewardPoints: number
  visitCount: number
  orderCount: number
  isEmployee: boolean
  eliteMember?: EliteMembership
}

export interface EliteMembership {
  startDate: string
  endDate: string
  isActive: boolean
  isExpired: boolean
}

export interface RewardInfo {
  points: number
  pendingPoints: number
  provider: "internal" | "springbig" | "alpineiq"
}
