import { Navigate, Outlet, useLocation } from "react-router-dom";
import { CircularProgress, Typography } from "@mui/material";
import { useAuthStore } from "@/domains/auth/store";
import { PageContainer } from "./styles";

export const RequireAuth = () => {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  if (status === "checking") {
    return (
      <PageContainer>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Checking session…
        </Typography>
      </PageContainer>
    );
  }

  if (status !== "authenticated"){
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  return <Outlet />;
};