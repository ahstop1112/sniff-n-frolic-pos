// Barcode scanner hook
// Migrated from: POSPage.barcodeListener + getBarcodeType
import { useEffect, useRef } from "react"

export type BarcodeType = "product" | "combo" | "government" | "upc"

export const getBarcodeType = (barcode: string): BarcodeType => {
  if (barcode[0] === "Z") return "product"
  if (barcode[0] === "C") return "combo"
  if (barcode.length >= 25 && barcode.substring(0, 2) === "01") return "government"
  return "upc"
}

export const useBarcode = (onScan: (barcode: string) => void) => {
  const bufferRef = useRef("")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return

      bufferRef.current += e.key === "Enter" ? "\n" : e.key

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        if (bufferRef.current.trim()) onScan(bufferRef.current.trim())
        bufferRef.current = ""
      }, 500)
    }

    window.addEventListener("keypress", handler)
    return () => window.removeEventListener("keypress", handler)
  }, [onScan])
}
