export type CategoryItem = {
  id: string;
  label: string;
};

export type ProductItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  qtyLabel: string;
  image: string;
  categoryId: string;
};