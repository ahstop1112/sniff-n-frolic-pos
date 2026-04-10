import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useSessionStore } from "@/domains/session/store"

export const RequireShift = () => {
  const shiftStatus = useSessionStore((s) => s.shiftStatus)
  const location = useLocation()

  console.log("RequireShift: shiftStatus =", shiftStatus)

  if (shiftStatus !== "active") {
    return <Navigate to="/pos/home" replace state={{ from: location }} />
  }

  return <Outlet />
}