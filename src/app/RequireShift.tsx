import { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSessionStore } from "@/domains/session/store";

export const RequireShift = ({ children }: PropsWithChildren) => {
  const shiftStatus = useSessionStore((s) => s.shiftStatus);
    const location = useLocation();
    
    console.log("RequireShift: shiftStatus =", shiftStatus);

  if (shiftStatus !== "active") {
    return <Navigate to="/home" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};