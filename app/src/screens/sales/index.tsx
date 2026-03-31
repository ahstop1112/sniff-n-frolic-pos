import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/domains/auth/store";
import OrdersProvider from "@/domains/orders/provider";
import SalesLayout from "./components/Layout";
// import ProductBrowser from "@/screens/sales/ProductBrowser";
// import CartPanel from "@/screens/sales/CartPanel";

const SalesScreen = () => {
  const { user, logout } = useAuthStore();
  const nav = useNavigate();

  return (
    <OrdersProvider>
      <SalesLayout
        slots={{
          // header: <SalesHeader />,
          // product: <ProductBrowser />,
          // cart: <CartPanel />,
        }}
      />
    </OrdersProvider>
  );
};

export default SalesScreen;
