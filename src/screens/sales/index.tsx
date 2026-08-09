import OrdersProvider from "@/domains/orders/provider";
import SalesLayout from "./layout";
import ProductPanel from "./ProductPanel";
import CartPanel from "./CartPanel";
import AiTipBanner from "./AiTipBanner";

const SalesScreen = () => (
  <OrdersProvider>
    <SalesLayout
      slots={{
        product: <ProductPanel
          currency="CAD"
          flags={{ gridColumns: 5, showStockBadge: true }}
        />,
        cart: <CartPanel />,
        footer: <AiTipBanner />,
      }}
    />
  </OrdersProvider>
);

export default SalesScreen;
