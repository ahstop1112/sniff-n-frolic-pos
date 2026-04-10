// Unified hardware abstraction
// Replaces inline ws.send() scattered across POSPage

export type HardwareCommand =
  | { Command: "PRINT INVOICE";    Data: unknown }
  | { Command: "OPEN DRAWER";      Data: null }
  | { Command: "PRINT CARDINVOICE"; Data: unknown }
  | { Command: "PRINT LABEL";      Data: unknown }
  | { Command: "GET PIC";          Data: unknown }

type Transport = "websocket" | "http" | "native"

export class HardwareService {
  private ws: WebSocket | null = null
  private transport: Transport = "websocket"

  init(transport: Transport, wsUrl?: string) {
    this.transport = transport
    if (transport === "websocket" && wsUrl) {
      this.ws = new WebSocket(wsUrl)
      window.posWebSocket = this.ws
    }
  }

  printReceipt(data: unknown) {
    return this.send({ Command: "PRINT INVOICE", Data: data })
  }

  openDrawer() {
    return this.send({ Command: "OPEN DRAWER", Data: null })
  }

  private send(cmd: HardwareCommand) {
    switch (this.transport) {
      case "websocket":
        this.ws?.send(JSON.stringify(cmd))
        break
      case "http":
        fetch("/hardware", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cmd),
        })
        break
      case "native":
        // @ts-ignore — iPad native bridge
        window.printing?.(JSON.stringify(cmd))
        break
    }
  }
}

export const hardwareService = new HardwareService()
