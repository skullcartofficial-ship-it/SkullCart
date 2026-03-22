// src/cart.ts
import { Product } from "./types";

export interface CartItem extends Product {
  quantity: number;
  originalPrice?: number;
  offerLabel?: string;
}

export function addToCart(product: any) {
  console.log("🛒 addToCart called with:", product);

  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  console.log("Current cart before add:", cart);

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

  localStorage.setItem("cart", JSON.stringify(cart));
  console.log("Cart saved to localStorage:", cart);

  return getCart();
}

export function getCart(): CartItem[] {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  console.log("📦 getCart() returning:", cart.length, "items");
  return cart;
}

export function removeFromCart(id: string | number) {
  console.log("🗑️ Removing item with ID:", id);
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart = cart.filter((item: CartItem) => String(item.id) !== String(id));
  localStorage.setItem("cart", JSON.stringify(cart));
  console.log("Cart after removal:", cart);
  return getCart();
}

export function updateQuantity(id: string | number, change: number) {
  console.log("🔄 Updating quantity for ID:", id, "change:", change);
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");

  cart = cart.map((item: CartItem) => {
    if (String(item.id) === String(id)) {
      const newQuantity = (item.quantity || 1) + change;
      item.quantity = Math.max(1, newQuantity);
      console.log("New quantity:", item.quantity);
    }
    return item;
  });

  localStorage.setItem("cart", JSON.stringify(cart));
  return getCart();
}

export function clearCart() {
  console.log("🧹 Clearing cart");
  localStorage.removeItem("cart");
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
