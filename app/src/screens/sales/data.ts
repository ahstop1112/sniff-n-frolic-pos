
import { CategoryItem, ProductItem } from "./types";

export const categoryList: CategoryItem[] = [
  { id: "signature", label: "Signature" },
  { id: "croissant", label: "Croissant" },
  { id: "waffle", label: "Waffle" },
  { id: "coffee", label: "Coffee" },
  { id: "ice-cream", label: "Ice Cream" },
];

export const productList: ProductItem[] = [
  {
    id: "1",
    name: "Almond Brown Sugar Croissant",
    description: "Sweet croissant with topping almonds and brown sugar",
    price: 12.98,
    qtyLabel: "3 pcs",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80",
    categoryId: "croissant",
  },
  {
    id: "2",
    name: "Smoke Tenderloin Slice Croissant",
    description: "Plain croissant with smoke tenderloin beef sliced and vegetable",
    price: 10.01,
    qtyLabel: "2 pcs",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    categoryId: "croissant",
  },
  {
    id: "3",
    name: "Berry Whipped Cream Croissant",
    description: "Sweet croissant with blueberries and strawberries inside",
    price: 8.92,
    qtyLabel: "3 pcs",
    image: "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?auto=format&fit=crop&w=800&q=80",
    categoryId: "croissant",
  },
  {
    id: "4",
    name: "Sweet Granulated Sugar Croissant",
    description: "Classic flaky croissant with sugar finish",
    price: 5.58,
    qtyLabel: "1 pc",
    image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=800&q=80",
    categoryId: "croissant",
  },
  {
    id: "5",
    name: "Sweet Chocolate Chocochips Croissant",
    description: "Chocolate croissant with rich chips filling",
    price: 22.02,
    qtyLabel: "2 pcs",
    image: "https://images.unsplash.com/photo-1612203985729-70726954388c?auto=format&fit=crop&w=800&q=80",
    categoryId: "croissant",
  },
  {
    id: "6",
    name: "Basic Croissant La Ta Dhore",
    description: "Simple butter croissant with crispy outside",
    price: 6.88,
    qtyLabel: "1 pc",
    image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=800&q=80",
    categoryId: "croissant",
  },
];

export const initialCart = [
  {
    id: "2",
    name: "Smoke Tenderloin Slice Croissant",
    price: 10.01,
    qty: 1,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "5",
    name: "Sweet Chocolate Chocochips Croissant",
    price: 22.02,
    qty: 2,
    image: "https://images.unsplash.com/photo-1612203985729-70726954388c?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "4",
    name: "Sweet Granulated Sugar Croissant",
    price: 5.58,
    qty: 1,
    image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=300&q=80",
  },
];