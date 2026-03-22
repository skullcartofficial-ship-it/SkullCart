// src/types.ts
export type Product = {
  id: string | number;
  title: string;
  description: string;
  price: number;
  image: string;
  images: string[];
  category?: string;
  stock?: number;
  rating?: number;
  sale?: boolean; // ← ADD THIS LINE (optional since not all products are on sale)

  // Custom product information
  features?: {
    subtitle?: string;
    items: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };

  specifications?: Array<{
    label: string;
    value: string;
  }>;

  whatsInBox?: string[];
  lightDescription?: string;
  productHighlights?: string[];
  originalPrice?: number;
  reviewCount?: number;
};
