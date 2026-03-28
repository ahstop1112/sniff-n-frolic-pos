import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSessionStore } from "@/domains/session/store";

const RequireShift = () => {
  const shiftStatus = useSessionStore((s) => s.shiftStatus);
  const shiftReady = useSessionStore((s) => s.shiftReady);
  const branchId = useSessionStore((s) => s.branchId);
  const deviceName = useSessionStore((s) => s.deviceName);
  const drawerId = useSessionStore((s) => s.drawerId);
  const hasHydrated = useSessionStore((s) => s.hasHydrated);
  const location = useLocation();

  // console.log("RequireShift", {
  //   hasHydrated,
  //   shiftStatus,
  //   shiftReady,
  //   branchId,
  //   deviceName,
  //   drawerId,
  //   pathname: location.pathname,
  // });

  if (!hasHydrated) {
    return null;
  }

  if (shiftStatus !== "active") {
    return <Navigate to="/pos/start" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default RequireShift;