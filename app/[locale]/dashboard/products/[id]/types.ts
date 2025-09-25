export interface ProductTranslation {
  id: number;
  locale: string;
  title: string;
  description: string;
}

export interface Category {
  id: number;
  translations: {
    id: number;
    locale: string;
    title: string;
    description: string;
  }[];
}

export interface Media {
  id: number;
  url: string;
  type: "IMAGE" | "VIDEO";
  sortOrder: number;
}

export interface Supplier {
  id: number;
  name: string;
  price: number;
  currency: string;
  rating: number;
  deliveryTime: string;
}

export interface Marketplace {
  id: number;
  name: string;
  price: number;
  currency: string;
  url: string;
  rating: number;
}

export interface Product {
  id: number;
  sku?: string;
  suggestedPrice?: number;
  currency?: string;
  isActive: boolean;
  views?: number;
  likes?: number;
  translations: ProductTranslation[];
  media: Media[];
  category?: Category;
  suppliers: Supplier[];
  marketplaces: Marketplace[];
  createdAt: string;
  updatedAt: string;
}
