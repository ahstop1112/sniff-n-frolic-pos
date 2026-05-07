// Product domain types
// Reference: original codebase Barcode enum + product model

export interface Product {
  id: string
  name: string
  sku: string
  barcode?: string
  unitPrice: number
  salePrice?: number | null
  description?: string | null
  taxRate: number
  quantity: number       // current stock
  category: string
  imageUrl?: string
  isActive: boolean
  packages?: Package[]
}

export interface Package {
  packageReference: string
  quantity: number
}

export interface Combo {
  id: string
  name: string
  products: ComboProduct[]
  dateFrom?: string
  dateTo?: string
  daysOfWeek: number[]
  startTime?: string
  endTime?: string
}

export interface ComboProduct {
  id: string
  quantity: number
  originalUnitPrice: number
}

export type BarcodeType =
  | "product"     // starts with Z
  | "combo"       // starts with C
  | "government"  // 25+ chars, specific format
  | "upc"         // standard UPC

export interface ProductSearchFilters {
  searchText?: string
  categoryId?: string
  page: number
  itemsPerPage: number
  onSale?: boolean
}
