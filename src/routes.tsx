import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "@/app/RequireAuth";
import { RequireShift } from "@/app/RequireShift";
import LoginScreen from "@/screens/auth/LoginScreen";
import ManageScreen from "@/screens/manage";
import SalesScreen from "@/screens/sales";
import HomeScreen from  "@/screens/start/Home";
import ShiftStartScreen from "@/screens/start/ShiftStart";

const AppRoutes = () => {
  return (
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginScreen />} />

        {/* Protected */}
        <Route path="/pos" element={<RequireAuth />}>
          {/* App start */}
          <Route index element={<Navigate to="start" replace />} />
          <Route path="start" element={<ShiftStartScreen />} />
          <Route path="home/*" element={<HomeScreen />} />

          {/* Other protected areas */}
          <Route path="manage/*" element={<ManageScreen />} />
        
          {/* ✅ Sales requires shift */}
          <Route element={<RequireShift />}>
            <Route path="sales/*" element={<SalesScreen />} />
          </Route>
        </Route>

        {/* Default */}
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
  );
};

export default AppRoutes;
