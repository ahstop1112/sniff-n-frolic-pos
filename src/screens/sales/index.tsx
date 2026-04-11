import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/domains/auth/store";
import OrdersProvider from "@/domains/orders/provider";
import SalesLayout from "./layout";
import SalesHeader from "../layout/Header";
import ProductPanel from "./ProductPanel";
import CartPanel from "./CartPanel";

const SalesScreen = () => {
  const { user, logout } = useAuthStore();
  const nav = useNavigate();

  return (
    <OrdersProvider>
      <SalesLayout
        slots={{
          header: <SalesHeader />,
          product: <ProductPanel 
            currency="CAD"
            flags={{ gridColumns: 4, showStockBadge: true }}
          />,
          cart: <CartPanel />,
        }}
      />
    </OrdersProvider>
  );
};

export default SalesScreen;
