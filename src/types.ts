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
  sale?: boolean; // Regular sale badge
  limitedTimeOffer?: boolean; // ADD THIS - Limited Time Offer badge
  isLimitedOffer?: boolean; // Alternative name

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
