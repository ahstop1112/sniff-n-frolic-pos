import styles from "./ProductGrid.module.scss";

type ProductItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  qtyLabel: string;
  image: string;
  categoryId: string;
};

type Props = {
  products: ProductItem[];
  onAddProduct: (product: ProductItem) => void;
};

const ProductGrid = ({ products, onAddProduct }: Props) => {
  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <article key={product.id} className={styles.card}>
          <div className={styles.imageWrap}>
            <img src={product.image} alt={product.name} className={styles.image} />

            <button
              type="button"
              className={styles.addButton}
              onClick={() => onAddProduct(product)}
            >
              ⌲
            </button>
          </div>

          <div className={styles.body}>
            <h3 className={styles.name}>{product.name}</h3>
            <p className={styles.description}>{product.description}</p>

            <div className={styles.meta}>
              <span className={styles.price}>${product.price.toFixed(2)}</span>
              <span className={styles.qty}>/ {product.qtyLabel}</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default ProductGrid;