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
      localStorage.setItem("checkoutCart", JSON.stringify(cartItems));
      localStorage.setItem("checkoutTotal", total.toString());
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
            <div className="cart-header-left">
              <h1 className="cart-title">Shopping Cart</h1>
              {cartItems.length > 0 && (
                <span className="item-count-badge">
                  {totalItems} item{totalItems !== 1 ? "s" : ""}
                </span>
              )}
            </div>
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
              {/* ── Items Card ── */}
              <div className="cart-items-card">
                {cartItems.map((item, index) => (
                  <div key={item.id} className="cart-item-wrapper">
                    <div className="cart-item">
                      {/* Thumbnail */}
                      <img
                        src={item.image || `/${item.id}.jpg`}
                        alt={item.title || "Product"}
                        className="cart-item-image"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/80x80?text=Product";
                        }}
                      />

                      {/* Right side info */}
                      <div className="cart-item-info">
                        {/* Name + line total */}
                        <div className="cart-item-row-top">
                          <span className="product-title">
                            {item.title || "Product Name"}
                          </span>
                          <span className="cart-item-line-total">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>

                        {/* Unit price */}
                        <p className="product-unit-price">
                          ₹{item.price?.toFixed(2) || "0.00"} each
                        </p>

                        {item.originalPrice &&
                          item.originalPrice > item.price && (
                            <span className="saved-badge">
                              Save ₹
                              {(item.originalPrice - item.price).toFixed(2)}
                            </span>
                          )}

                        {/* Qty stepper */}
                        <div className="qty-stepper">
                          <button
                            className="qty-btn"
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Full-width remove */}
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Remove
                    </button>

                    {index < cartItems.length - 1 && (
                      <div className="item-divider" />
                    )}
                  </div>
                ))}

                <div className="continue-row">
                  <Link to="/shop" className="continue-link">
                    ← Continue Shopping
                  </Link>
                </div>
              </div>

              {/* ── Order Summary Card ── */}
              <div className="order-summary-card">
                <h2 className="summary-title">Order Summary</h2>
                <div className="summary-divider" />

                <p className="summary-items-label">ITEMS ({totalItems})</p>

                {cartItems.map((item) => (
                  <div key={item.id} className="summary-line">
                    <span className="summary-line-name">
                      {item.title || "Product"} × {item.quantity}
                    </span>
                    <span className="summary-line-price">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}

                <div className="summary-divider" />

                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="free-label">Free</span>
                    ) : (
                      `₹${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                {freeShippingRemaining > 0 && subtotal > 0 && (
                  <div className="shipping-nudge">
                    <div className="shipping-track">
                      <div
                        className="shipping-fill"
                        style={{
                          width: `${Math.min((subtotal / 999) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="shipping-nudge-text">
                      Add ₹{freeShippingRemaining.toFixed(2)} more for free
                      shipping!
                    </p>
                  </div>
                )}

                <div className="summary-divider" />

                <div className="summary-row summary-total-row">
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

                <p className="secure-note">
                  🔒 Secure checkout — Your information is protected
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
