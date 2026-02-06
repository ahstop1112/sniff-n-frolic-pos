import React, { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { AuthContextValue } from "./types";

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
