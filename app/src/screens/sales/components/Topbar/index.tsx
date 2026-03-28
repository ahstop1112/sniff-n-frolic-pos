import styles from "./Topbar.module.scss";

type Props = {
  staffName: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
};

const SalesTopbar = ({ staffName, searchValue, onSearchChange }: Props) => {
  return (
    <div className={styles.topbar}>
      <div className={styles.left}>
        <h1 className={styles.title}>Welcome, {staffName}</h1>
        <p className={styles.subtitle}>Discover whatever you need easily</p>
      </div>

      <div className={styles.right}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search product..."
            className={styles.searchInput}
          />
        </div>

        <button className={styles.filterButton}>⎚</button>
      </div>
    </div>
  );
};

export default SalesTopbar;