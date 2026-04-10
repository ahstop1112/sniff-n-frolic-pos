// Compose all providers here — keep app/main.tsx clean

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { HardwareProvider } from "./HardwareProvider"
import type { ReactNode } from "react"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 2 },
  },
})

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <HardwareProvider>
      {children}
    </HardwareProvider>
  </QueryClientProvider>
)
