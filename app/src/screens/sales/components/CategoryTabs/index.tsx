import styles from "./CategoryTabs.module.scss";

type CategoryItem = {
  id: string;
  label: string;
};

type Props = {
  categories: CategoryItem[];
  activeCategory: string;
  onChange: (categoryId: string) => void;
};

const CategoryTabs = ({ categories, activeCategory, onChange }: Props) => {
  return (
    <div className={styles.tabs}>
      {categories.map((category) => {
        const isActive = activeCategory === category.id;

        return (
          <button
            key={category.id}
            type="button"
            className={`${styles.tab} ${isActive ? styles.active : ""}`}
            onClick={() => onChange(category.id)}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;