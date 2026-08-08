import { Navigate, Route, Routes } from "react-router-dom"
import { RequireAuth } from "@/app/RequireAuth"
import { RequireShift } from "@/app/RequireShift"
import LoginScreen from "@/screens/auth/LoginScreen"
import ManageScreen from "@/screens/manage"
import SalesScreen from "@/screens/sales"
import HomeScreen from  "@/screens/start/Home"
import ShiftStartScreen from "@/screens/start/ShiftStart"
import ManageProductsScreen from "./screens/manage/products"
import ProductEditScreen from "./screens/manage/products/ProductEditScreen"
import StockOverviewScreen from "./screens/manage/inventory"
import AdjustStockScreen from "./screens/manage/inventory/AdjustStockScreen"
import MovementsScreen from "./screens/manage/inventory/MovementsScreen"

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
          <Route path="manage/" element={<ManageScreen />}>
            <Route path="products"      element={<ManageProductsScreen />} />
            <Route path="products/:slug" element={<ProductEditScreen />} />
            <Route path="inventory"            element={<StockOverviewScreen />} />
            <Route path="inventory/movements"  element={<MovementsScreen />} />
            <Route path="inventory/adjust"     element={<AdjustStockScreen />} />
          </Route>
        
          {/* ✅ Sales requires shift */}
          <Route element={<RequireShift />}>
            <Route path="sales/*" element={<SalesScreen />} />
          </Route>
        </Route>

        {/* Default */}
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
  )
}

export default AppRoutes
