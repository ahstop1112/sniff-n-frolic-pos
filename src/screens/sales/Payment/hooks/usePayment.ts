import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/domains/auth/store"
import { useSessionStore } from "@/domains/session/store"
import type { PaymentMethod, PaymentStep } from "../types"
import type { CartLine } from "@/domains/orders/types"

interface UsePaymentProps {
    total: number   // cents
    onComplete: () => void
    lines: CartLine[]
}

export const usePayment = ({ total, onComplete, lines }: UsePaymentProps) => {
    const [step, setStep] = useState<PaymentStep>({ step: "select" })
    // Cash denominations count
    const [denominations, setDenominations] = useState<Record<string, number>>({})
    const queryClient = useQueryClient()

    const received = Object.entries(denominations).reduce(
        (sum, [value, count]) => sum + Number(value) * count, 0
    )

    const change = Math.max(0, received - total)
    const canConfirmCash = received >= total
    const branchId = useSessionStore.getState().branchUUID
    
    const submitOrder = async (method: PaymentMethod, amountTendered: number) => {
        try {
            const token = localStorage.getItem("snf_pos_access_token")
            const staffId = useAuthStore.getState().user?.id ?? null
        
            await fetch("/api/orders/pos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                branch_id: branchId,
                staff_id: staffId,
                payment_method: method,
                amount_tendered: amountTendered,
                items: lines.map((l) => ({
                product_id: l.productId,
                product_name: l.name,
                quantity: l.qty,
                unit_price: Math.round(l.unitPrice * 100), // dollars → cents
                })),
            }),
            })
        
            queryClient.invalidateQueries({ queryKey: ["daily-summary"] })
        } catch (err) {
            console.error("Failed to submit order:", err)
            throw err
        }
    }

  const selectMethod = async (method: PaymentMethod) => {
    if (method === "cash") {
        setStep({ step: "cash", denominations: {} })
        return
    }

    setStep({ step: "processing" })
    try {
        await submitOrder(method, total)
        setStep({ step: "complete", received: total, change: 0 })
    } catch {
        setStep({ step: "select" })
    }
  }

  const updateDenomination = (value: number, count: number) => {
    setDenominations((prev) => ({
      ...prev,
      [value]: Math.max(0, count),
    }))
  }

  const confirmCash = async () => {
    if (!canConfirmCash) return
      
    setStep({ step: "processing" })
      
    try {
        await submitOrder("cash", received)
        setStep({ step: "complete", received, change })
      } catch {
        setStep({ step: "cash", denominations })
      }
  }

  const reset = () => {
    setStep({ step: "select" })
    setDenominations({})
  }

  const handleComplete = () => {
    reset()
    onComplete()
  }

  return {
    step,
    denominations,
    received,
    change,
    canConfirmCash,
    selectMethod,
    updateDenomination,
    confirmCash,
    handleComplete,
  }
}