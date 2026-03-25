// src/pages/checkout.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { getCart, clearCart, getCartTotal } from "../cart";
import { sendOrderConfirmationEmail } from "../emailService";
import "./checkout.css";

export default function Checkout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    paymentMethod: "COD",
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Get logged-in user
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Auto-fill name and email from logged-in user
        const userName =
          localStorage.getItem("userName") || currentUser.displayName || "";
        const userEmail = currentUser.email || "";

        setFormData((prev) => ({
          ...prev,
          name: userName,
          email: userEmail,
        }));

        console.log("✅ User loaded:", { userName, userEmail });
      } else {
        // If not logged in, redirect to login
        console.log("❌ No user logged in, redirecting to login");
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const cartItems = getCart();
  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? (subtotal >= 999 ? 0 : 50) : 0;
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    // Validate form
    if (
      !formData.name ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.pincode
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Make sure email is provided (from logged-in user)
    if (!formData.email && user?.email) {
      formData.email = user.email;
    }

    if (!formData.email) {
      alert("Email is required. Please make sure you're logged in.");
      return;
    }

    setLoading(true);

    try {
      const orderId = "ORD" + Date.now();
      const orderDate = new Date().toLocaleString();

      // Format items for email
      const itemsForEmail = cartItems.map((item) => ({
        name: item.title,
        quantity: item.quantity,
        price: item.price,
      }));

      const orderData = {
        orderId: orderId,
        customerName: formData.name,
        customerEmail: formData.email, // Email from logged-in user
        customerPhone: formData.phone,
        address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
        items: itemsForEmail,
        subtotal: subtotal,
        shipping: shipping,
        total: total,
        paymentMethod: formData.paymentMethod,
        orderDate: orderDate,
        status: "pending",
      };

      // Save order to localStorage
      const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      existingOrders.push(orderData);
      localStorage.setItem("orders", JSON.stringify(existingOrders));

      // Send order confirmation email using your existing function
      console.log(
        "📧 Sending order confirmation email to:",
        orderData.customerEmail
      );
      const emailResult = await sendOrderConfirmationEmail({
        orderId: orderData.orderId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        items: orderData.items,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod,
        date: orderData.orderDate,
      });

      if (emailResult.success) {
        console.log(
          "✅ Order confirmation email sent successfully to:",
          orderData.customerEmail
        );
      } else {
        console.warn("⚠️ Failed to send email:", emailResult.error);
        // Continue with order even if email fails
      }

      // Save order message for WhatsApp (optional)
      const orderMessage = `
NEW ORDER RECEIVED!

Order #${orderData.orderId}
Customer: ${orderData.customerName}
Email: ${orderData.customerEmail}
Phone: ${orderData.customerPhone}
Address: ${orderData.address}

Items Ordered:
${cartItems
  .map(
    (item) =>
      `${item.title} x${item.quantity} - ₹${(
        item.price * item.quantity
      ).toFixed(2)}`
  )
  .join("\n")}

Total: ₹${orderData.total}
Payment: ${orderData.paymentMethod}
Time: ${orderData.orderDate}

View order: ${window.location.origin}/orders
`;
      localStorage.setItem("lastOrder", orderMessage);

      // Clear cart
      clearCart();

      alert(
        `✅ Order placed successfully!\n\nOrder ID: ${orderId}\n📧 Confirmation email sent to: ${orderData.customerEmail}\n\nCheck your email for order details.`
      );
      navigate("/orders");
    } catch (error) {
      console.error("❌ Error placing order:", error);
      alert("There was an error placing your order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-checkout">
          <h2>Your cart is empty</h2>
          <p>Add some items to your cart before checking out</p>
          <button
            onClick={() => navigate("/shop")}
            className="continue-shopping-btn"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="checkout-container">
        <div className="loading-spinner">Loading user information...</div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>

      <div className="checkout-content">
        {/* Shipping Information */}
        <div className="shipping-info">
          <h2>Shipping Information</h2>

          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              readOnly
              className="readonly-field"
            />
            <small className="email-note">
              ✓ Email is automatically set from your account (
              {formData.email || "Not logged in"})
            </small>
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="form-group">
            <label>Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your full address"
              rows={3}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City"
                required
              />
            </div>
            <div className="form-group">
              <label>Pincode *</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                placeholder="Pincode"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
            >
              <option value="COD">Cash on Delivery</option>
              <option value="UPI">UPI</option>
              <option value="Card">Credit/Debit Card</option>
            </select>
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary-checkout">
          <h2>Order Summary</h2>

          <div className="order-items">
            {cartItems.map((item) => (
              <div key={item.id} className="order-item">
                <span>
                  {item.title} × {item.quantity}
                </span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="order-totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Shipping:</span>
              <span>{shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}</span>
            </div>
            <div className="total-row grand-total">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            className="place-order-btn"
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>

          <p className="secure-checkout">
            🔒 Secure checkout - Your information is protected
          </p>
        </div>
      </div>
    </div>
  );
}
