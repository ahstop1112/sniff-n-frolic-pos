import { useMemo, useState } from "react";
import SalesSidebar from "./components/Sidebar";
import SalesTopbar from "./components/Topbar";
import CategoryTabs from "./components/CategoryTabs";
import ProductGrid from "./components/ProductGrid";
import CartPanel from "./components/CartPanel";
import { ProductItem } from "./types";
import { initialCart, productList, categoryList } from "./data";
import FullPageContainerWithHeader from "@/screens/layout/FullPageContainerWithHeader";
import styles from "./Sales.module.scss";

const SalesScreen = () => {
  const [activeCategory, setActiveCategory] = useState("croissant");
  const [searchValue, setSearchValue] = useState("");
  const [cartItems, setCartItems] = useState(initialCart);

  const filteredProducts = useMemo(() => {
    return productList.filter((product) => {
      const matchCategory =
        activeCategory === "all" ? true : product.categoryId === activeCategory;

      const keyword = searchValue.trim().toLowerCase();
      const matchSearch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword);

      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchValue]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cartItems]);

  const discount = 5;
  const tax = 2.25;
  const total = subtotal - discount + tax;

  const handleIncreaseQty = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const handleDecreaseQty = (id: string) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: Math.max(0, item.qty - 1) } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const handleAddProduct = (product: ProductItem) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          image: product.image,
        },
      ];
    });
  };

  return (
    <FullPageContainerWithHeader>
      <div className={styles.page}>
        <div className={styles.shell}>
          <SalesSidebar />

          <div className={styles.content}>
            <div className={styles.main}>
              <SalesTopbar
                staffName="Gorry"
                searchValue={searchValue}
                onSearchChange={setSearchValue}
              />

              <CategoryTabs
                categories={categoryList}
                activeCategory={activeCategory}
                onChange={setActiveCategory}
              />

              <ProductGrid
                products={filteredProducts}
                onAddProduct={handleAddProduct}
              />
            </div>

            <CartPanel
              items={cartItems}
              subtotal={subtotal}
              discount={discount}
              tax={tax}
              total={total}
              onIncreaseQty={handleIncreaseQty}
              onDecreaseQty={handleDecreaseQty}
            />
          </div>
        </div>
      </div>
    </FullPageContainerWithHeader>
  );
};

export default SalesScreen;