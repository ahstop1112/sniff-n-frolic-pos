import React, { PropsWithChildren } from "react";
import { useAuth } from "@/context/auth/useAuth";
import { LoginScreen } from "@/screens/auth/Login";

export const RequireAuth = ({ children }: PropsWithChildren) => {
  const { status } = useAuth();

  if (status === "checking") {
    return (
      <div style={{ padding: 16, fontFamily: "sans-serif" }}>
        Checking session…
      </div>
    );
  }

  if (status !== "authenticated") return <LoginScreen />;

  return <>{children}</>;
};
