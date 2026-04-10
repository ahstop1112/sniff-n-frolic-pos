import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/domains/auth/store";
import OrdersProvider from "@/domains/orders/provider";
import SalesLayout from "./components/Layout";
// import SalesHeadr from "./components/Header";
// import ProductBrowser from "./components/ProductBrowser";
import CartPanel from "./CartPanel";

const SalesScreen = () => {
  const { user, logout } = useAuthStore();
  const nav = useNavigate();

  return (
    <OrdersProvider>
      <SalesLayout
        slots={{
          // header: <SalesHeader />,
          // product: <ProductBrowser />,
          cart: <CartPanel />,
        }}
      />
    </OrdersProvider>
  );
};

export default SalesScreen;
