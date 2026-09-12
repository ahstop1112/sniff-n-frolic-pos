import { useState } from "react"

const getToken = () => localStorage.getItem("snf_pos_access_token")

export interface GeneratedProduct {
  productName: string
  shortDescription: string
  feiFeiNote: string
  enrichment: string
  benefits: string[]
  treatSuggestions: string[]
  dimensions: string | null
  metaTitle: string
  metaDescription: string
  slugParts: { category: string; feature: string; brand: string }
  computedSlug: string
}

export interface ValidationFlag {
  field: string
  code: string
  detail: string
}

export interface GenerateProductResult {
  result: GeneratedProduct
  flags: ValidationFlag[]
  sourceQuality: "json-ld" | "og" | "body"
}

type GenerateState = "idle" | "loading" | "reviewing"

export const useAIProductGenerate = () => {
  const [state, setState] = useState<GenerateState>("idle")
  const [result, setResult] = useState<GeneratedProduct | null>(null)
  const [flags, setFlags] = useState<ValidationFlag[]>([])
  const [sourceQuality, setSourceQuality] = useState<"json-ld" | "og" | "body" | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generate = async (input: { url?: string; rawText?: string; categorySlug?: string }) => {
    if (!input.url && !input.rawText) {
      setError("Either URL or raw text is required")
      return
    }

    setState("loading")
    setError(null)

    try {
      const response = await fetch("/api/ai/generate-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message || "Failed to generate product")
      }

      const data: GenerateProductResult = await response.json()
      setResult(data.result)
      setFlags(data.flags)
      setSourceQuality(data.sourceQuality)
      setState("reviewing")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setState("idle")
    }
  }

  const reset = () => {
    setState("idle")
    setResult(null)
    setFlags([])
    setSourceQuality(null)
    setError(null)
  }

  return { state, result, flags, sourceQuality, error, generate, reset }
}
