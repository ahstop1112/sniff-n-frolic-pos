import styles from "./CartPanel.module.scss";

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
};

type Props = {
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  onIncreaseQty: (id: string) => void;
  onDecreaseQty: (id: string) => void;
};

const CartPanel = ({
  items,
  subtotal,
  discount,
  tax,
  total,
  onIncreaseQty,
  onDecreaseQty,
}: Props) => {
  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Current Order</h2>
        <button className={styles.settingButton}>⚙</button>
      </div>

      <div className={styles.items}>
        {items.map((item) => (
          <div key={item.id} className={styles.item}>
            <img src={item.image} alt={item.name} className={styles.thumb} />

            <div className={styles.itemInfo}>
              <div className={styles.itemName}>{item.name}</div>
              <div className={styles.itemPrice}>${item.price.toFixed(2)}</div>
            </div>

            <div className={styles.qtyControl}>
              <button
                type="button"
                className={styles.qtyButton}
                onClick={() => onIncreaseQty(item.id)}
              >
                +
              </button>
              <span className={styles.qtyValue}>{item.qty}</span>
              <button
                type="button"
                className={styles.qtyButton}
                onClick={() => onDecreaseQty(item.id)}
              >
                −
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Discount sales</span>
          <span>-${discount.toFixed(2)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Total sales tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>

        <div className={styles.divider} />

        <div className={styles.totalRow}>
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <button className={styles.payButton}>Continue to Payment</button>
    </aside>
  );
};

export default CartPanel;