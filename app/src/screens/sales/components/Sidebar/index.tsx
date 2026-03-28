import styles from "./Sidebar.module.scss";

const SalesSidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoWrap}>
        <div className={styles.logoMark}>
        </div>
      </div>

      <nav className={styles.nav}>
        <button className={styles.iconButton}>⌂</button>
        <button className={`${styles.iconButton} ${styles.active}`}>▦</button>
        <button className={styles.iconButton}>◔</button>
        <button className={styles.iconButton}>⌲</button>
        <button className={styles.iconButton}>◫</button>
      </nav>

      <div className={styles.bottom}>
        <button className={styles.iconButton}>⚙</button>
        <button className={styles.iconButton}>↪</button>
      </div>
    </aside>
  );
};

export default SalesSidebar;