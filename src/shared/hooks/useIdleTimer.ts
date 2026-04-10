// Idle timer — triggers PIN lock after inactivity
// Migrated from: POSPage IdleTimer + handleOnIdle

import { useEffect, useRef } from "react"

export const useIdleTimer = (timeoutMs: number, onIdle: () => void) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(onIdle, timeoutMs)
  }

  useEffect(() => {
    const events = ["mousemove", "keypress", "click", "touchstart"]
    events.forEach((e) => window.addEventListener(e, reset))
    reset()
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [timeoutMs, onIdle])
}
