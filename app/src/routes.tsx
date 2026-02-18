import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "@/providers/RequireAuth";
import LoginScreen from "@/screens/auth/LoginScreen";
import ManageScreen from "@/screens/manage";
import SalesScreen from "@/screens/sales";

const AppRoutes = () => {
  return (
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginScreen />} />

        {/* Protected */}
        <Route
          path="/manage/*"
          element={
            <RequireAuth>
              <ManageScreen />
            </RequireAuth>
          }
        />

        <Route
          path="/sales/*"
          element={
            <RequireAuth>
              <SalesScreen />
            </RequireAuth>
          }
        />

        {/* Default */}
        <Route path="/" element={<Navigate to="/sales" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
};

export default AppRoutes;
