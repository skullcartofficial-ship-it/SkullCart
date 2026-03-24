import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  getCartTotal,
  CartItem,
} from "../cart";
import Navbar from "../components/Navbar";
import "./cart.css";

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const items = getCart();
    console.log("Cart items loaded:", JSON.stringify(items, null, 2)); // Debug log
    setCartItems(items);
  };

  const handleRemoveItem = (id: string | number) => {
    removeFromCart(id);
    loadCart();
  };

  const handleUpdateQuantity = (id: string | number, change: number) => {
    updateQuantity(id, change);
    loadCart();
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCart();
      loadCart();
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty. Add some items first!");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      navigate("/address");
      setLoading(false);
    }, 500);
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? (subtotal >= 999 ? 0 : 50) : 0;
  const total = subtotal + shipping;
  const freeShippingRemaining = subtotal >= 999 ? 0 : 999 - subtotal;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Navbar />
      <div className="cart-page">
        <div className="cart-container">
          {/* Header */}
          <div className="cart-header">
            <h1>Shopping Cart</h1>
            {cartItems.length > 0 && (
              <button className="clear-cart-btn" onClick={handleClearCart}>
                Clear Cart
              </button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added any items yet</p>
              <Link to="/shop" className="continue-shopping-btn">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="cart-content">
              {/* Cart Items Section */}
              <div className="cart-items-section">
                <div className="cart-items-list">
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-product">
                        <img
                          src={item.image || `/${item.id}.jpg`}
                          alt={item.title || "Product"}
                          className="cart-item-image"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/100x100?text=Product";
                          }}
                        />
                        <div className="cart-item-info">
                          {/* PRODUCT TITLE - MAKE SURE THIS DISPLAYS */}
                          <h3 className="product-title">
                            {item.title || "Product Name"}
                          </h3>
                          <p className="product-price">
                            ₹{item.price?.toFixed(2) || "0.00"} each
                          </p>
                          {item.originalPrice &&
                            item.originalPrice > item.price && (
                              <span className="saved-badge">
                                Save ₹
                                {(item.originalPrice - item.price).toFixed(2)}
                              </span>
                            )}
                        </div>
                      </div>

                      <div className="cart-item-quantity">
                        <button
                          className="quantity-btn"
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button
                          className="quantity-btn"
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-item-total">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>

                      <button
                        className="cart-item-remove"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-actions">
                  <Link to="/shop" className="continue-shopping-link">
                    ← Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Order Summary */}
              <div className="order-summary">
                <h2>Order Summary</h2>

                <div className="summary-items">
                  <div className="summary-label">Items ({totalItems})</div>
                  <div className="items-list">
                    {cartItems.map((item) => (
                      <div key={item.id} className="summary-item">
                        <span className="item-name">
                          {item.title || "Product"} × {item.quantity}
                        </span>
                        <span className="item-price">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="free-shipping">Free</span>
                    ) : (
                      `₹${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                {freeShippingRemaining > 0 && subtotal > 0 && (
                  <div className="shipping-note">
                    Add ₹{freeShippingRemaining.toFixed(2)} more for free
                    shipping!
                  </div>
                )}

                <div className="summary-divider"></div>

                <div className="summary-row total">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>

                <button
                  className="checkout-btn"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Proceed to Checkout"}
                </button>

                <div className="payment-icons">
                  <span>💳</span>
                  <span>📱</span>
                  <span>💵</span>
                  <span>🏦</span>
                </div>
                <p className="secure-checkout">
                  🔒 Secure checkout - Your information is protected
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
