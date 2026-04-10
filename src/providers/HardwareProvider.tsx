// Injects HardwareService via Context
// Any component can call useHardware() to print / open drawer

import { createContext, useContext, useEffect, type ReactNode } from "react"
import { hardwareService, type HardwareService } from "@/services/hardware/HardwareService"

const HardwareContext = createContext<HardwareService>(hardwareService)

export const useHardware = () => useContext(HardwareContext)

export const HardwareProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    // Detect transport: native iPad, HTTP, or WebSocket
    const isNative = typeof window !== "undefined" && "printing" in window
    const useHttp  = import.meta.env.VITE_HTTP_PRINTING === "true"

    hardwareService.init(
      isNative ? "native" : useHttp ? "http" : "websocket",
      "ws://127.0.0.1:5000/"
    )
  }, [])

  return (
    <HardwareContext.Provider value={hardwareService}>
      {children}
    </HardwareContext.Provider>
  )
}
