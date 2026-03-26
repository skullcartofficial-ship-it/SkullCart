// src/cart.ts
import { Product } from "./types";

export interface CartItem extends Product {
  quantity: number;
  originalPrice?: number;
  offerLabel?: string;
}

// Store current user email (set this when user logs in)
let currentUserEmail: string | null = null;

// Set current user when logging in/out
export const setCurrentUser = (email: string | null) => {
  console.log("👤 Setting current user:", email);
  currentUserEmail = email;
};

// Get storage key for current user
const getStorageKey = (): string => {
  if (currentUserEmail) {
    return `cart_${currentUserEmail}`;
  }
  return "cart"; // Fallback for guest users
};

// Save cart to appropriate storage
const saveCartToStorage = (cart: CartItem[]) => {
  const key = getStorageKey();
  localStorage.setItem(key, JSON.stringify(cart));
  console.log(`💾 Cart saved to ${key}:`, cart.length, "items");
};

// Get cart from appropriate storage
const getCartFromStorage = (): CartItem[] => {
  const key = getStorageKey();
  const cart = JSON.parse(localStorage.getItem(key) || "[]");
  console.log(`📦 getCart() from ${key}:`, cart.length, "items");
  return cart;
};

export function addToCart(product: any) {
  console.log("🛒 addToCart called with:", product);

  let cart = getCartFromStorage();

  // Ensure the product has all required fields
  const productToAdd = {
    ...product,
    title: product.title || product.name,
    name: product.name || product.title,
    images: product.images || [`/${product.id}.jpg`],
    description:
      product.description ||
      `${product.title || product.name} - High quality product`,
    category: product.category || "General",
    rating: product.rating || 4.0,
    sale: product.sale || false,
  };

  // Convert both IDs to string for comparison
  const existing = cart.find(
    (item: CartItem) => String(item.id) === String(productToAdd.id)
  );

  if (existing) {
    existing.quantity += 1;
    console.log("Increased quantity for existing item:", existing);
  } else {
    cart.push({ ...productToAdd, quantity: 1 });
    console.log("Added new item to cart:", productToAdd);
  }

  saveCartToStorage(cart);
  return getCart();
}

export function getCart(): CartItem[] {
  return getCartFromStorage();
}

export function removeFromCart(id: string | number) {
  console.log("🗑️ Removing item with ID:", id);
  let cart = getCartFromStorage();
  cart = cart.filter((item: CartItem) => String(item.id) !== String(id));
  saveCartToStorage(cart);
  return getCart();
}

export function updateQuantity(id: string | number, change: number) {
  console.log("🔄 Updating quantity for ID:", id, "change:", change);
  let cart = getCartFromStorage();

  cart = cart.map((item: CartItem) => {
    if (String(item.id) === String(id)) {
      const newQuantity = (item.quantity || 1) + change;
      item.quantity = Math.max(1, newQuantity);
      console.log("New quantity:", item.quantity);
    }
    return item;
  });

  saveCartToStorage(cart);
  return getCart();
}

export function clearCart() {
  console.log("🧹 Clearing cart for user:", currentUserEmail || "guest");
  const key = getStorageKey();
  localStorage.removeItem(key);
  return [];
}

export function getCartCount(): number {
  const cart = getCart();
  const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
  console.log("Cart count:", count);
  return count;
}

export function getCartTotal(): number {
  const cart = getCart();
  const total = cart.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0
  );
  console.log("Cart total:", total);
  return total;
}

// Function to migrate guest cart to user cart on login
export function migrateGuestCartToUser(email: string) {
  const guestCart = JSON.parse(localStorage.getItem("cart") || "[]");
  if (guestCart.length > 0) {
    console.log(
      "🔄 Migrating guest cart to user:",
      email,
      "items:",
      guestCart.length
    );

    // Check if user already has cart items
    const userCartKey = `cart_${email}`;
    const existingUserCart = JSON.parse(
      localStorage.getItem(userCartKey) || "[]"
    );

    if (existingUserCart.length > 0) {
      // Merge carts: combine and remove duplicates
      const mergedCart = [...existingUserCart];

      guestCart.forEach((guestItem: CartItem) => {
        const existingIndex = mergedCart.findIndex(
          (item) => String(item.id) === String(guestItem.id)
        );

        if (existingIndex !== -1) {
          // Update quantity if item exists
          mergedCart[existingIndex].quantity += guestItem.quantity;
        } else {
          // Add new item
          mergedCart.push(guestItem);
        }
      });

      localStorage.setItem(userCartKey, JSON.stringify(mergedCart));
      console.log("🔄 Merged carts:", mergedCart.length, "items");
    } else {
      // Save guest cart to user's storage
      localStorage.setItem(userCartKey, JSON.stringify(guestCart));
      console.log("🔄 Migrated guest cart to user storage");
    }

    // Optional: Clear guest cart after migration
    // localStorage.removeItem("cart");

    return guestCart;
  }
  return [];
}
