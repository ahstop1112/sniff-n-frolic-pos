import { useState } from "react"

const getToken = () => localStorage.getItem("snf_pos_access_token")

export const useGenerateSEO = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async ({
    name,
    shortDescription,
    description,
    brands,
  }: {
    name: string
    shortDescription: string
    description: string
    brands: string[]
  }): Promise<{ metaTitle: string; metaDescription: string } | null> => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/generate-seo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
            name,
            shortDescription,
            description,
            brands
        }),
      })

      if (!response.ok) throw new Error("Failed to generate SEO")

      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  return { generate, isGenerating, error }
}