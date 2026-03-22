import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sendOrderConfirmationEmail } from "../emailService";
import "./payment.css";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [method, setMethod] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  // State for order items
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [orderType, setOrderType] = useState<"cart" | "buynow">("cart");

  // Load order data and customer details
  useEffect(() => {
    // Load customer details from address page
    const savedCustomerDetails = localStorage.getItem("customerDetails");
    if (savedCustomerDetails) {
      setCustomerDetails(JSON.parse(savedCustomerDetails));
    }

    // Check if this is a "Buy Now" order from navigation state
    if (location.state?.purchaseItem) {
      setOrderType("buynow");
      const item = location.state.purchaseItem;
      setOrderItems([item]);
      setTotal(item.totalPrice || item.product.price);
    } else {
      // Check if there's a purchaseItem in localStorage (fallback)
      const savedPurchaseItem = localStorage.getItem("purchaseItem");
      if (savedPurchaseItem) {
        const item = JSON.parse(savedPurchaseItem);
        setOrderType("buynow");
        setOrderItems([item]);
        setTotal(item.totalPrice || item.product.price);
      } else {
        // Cart flow - load from checkoutCart
        const savedCart = localStorage.getItem("checkoutCart");
        const savedTotal = localStorage.getItem("checkoutTotal");

        if (savedCart) {
          const cart = JSON.parse(savedCart);
          setOrderType("cart");
          setOrderItems(cart);
          if (savedTotal) {
            setTotal(parseFloat(savedTotal));
          } else {
            const cartTotal = cart.reduce((sum: number, item: any) => {
              return sum + item.price * (item.quantity || 1);
            }, 0);
            setTotal(cartTotal);
          }
        } else {
          // Fallback to regular cart
          const cart = JSON.parse(localStorage.getItem("cart") || "[]");
          setOrderType("cart");
          setOrderItems(cart);
          const cartTotal = cart.reduce((sum: number, item: any) => {
            return sum + item.price * (item.quantity || 1);
          }, 0);
          setTotal(cartTotal);
        }
      }
    }
  }, [location.state]);

  // Format order message for WhatsApp (SENT TO SHOP OWNER)
  const formatWhatsAppMessage = (order: any) => {
    const itemsList = order.items
      .map((item: any, index: number) => {
        const itemName =
          item.product?.title || item.name || item.title || "Product";
        const quantity = item.quantity || 1;
        const price = item.product?.price || item.price || 0;
        return `${index + 1}. ${itemName} x${quantity} - ₹${price * quantity}`;
      })
      .join("\n");

    return `*🛍️ NEW ORDER RECEIVED!* 🛍️

*Order #${order.id}*
*Customer:* ${order.customerName || "Guest"}
*Phone:* ${order.customerPhone || "Not provided"}
*Email:* ${order.customerEmail || "Not provided"}
*Address:* ${order.shippingAddress || "Not provided"}

*Items Ordered:*
${itemsList}

*Total:* ₹${order.total}
*Payment:* ${order.paymentMethod.toUpperCase()}
*Time:* ${order.date}

View order: ${window.location.origin}/orders`;
  };

  // Send WhatsApp notification to SHOP OWNER
  const sendWhatsAppToOwner = (order: any) => {
    const message = formatWhatsAppMessage(order);
    // YOUR WhatsApp number (shop owner)
    const ownerWhatsAppNumber = "916303320879"; // Remove the + sign
    const whatsappUrl = `https://wa.me/${ownerWhatsAppNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  // Send Order Confirmation Email to CUSTOMER
  const sendOrderEmailToCustomer = async (order: any) => {
    try {
      // Check if customer has email
      if (!order.customerEmail || order.customerEmail === "") {
        console.log("No customer email provided, skipping email");
        return;
      }

      // Prepare items for email
      const itemsForEmail = order.items.map((item: any) => ({
        name: item.product?.title || item.name || item.title || "Product",
        quantity: item.quantity || 1,
        price: item.product?.price || item.price || 0,
      }));

      const emailResult = await sendOrderConfirmationEmail({
        orderId: order.id.toString(),
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: itemsForEmail,
        total: order.total,
        paymentMethod: order.paymentMethod,
        date: order.date,
      });

      if (emailResult.success) {
        console.log(
          "✅ Order confirmation email sent to:",
          order.customerEmail
        );
      } else {
        console.error(
          "❌ Failed to send order confirmation:",
          emailResult.error
        );
      }
    } catch (emailError) {
      console.error("❌ Email sending error:", emailError);
    }
  };

  // Place Order Function
  const placeOrder = () => {
    if (!method) {
      alert("Please select a payment method");
      return;
    }

    if (method === "credit" || method === "debit") {
      if (!cardNumber || !expiry || !cvv || !cardName) {
        alert("Please enter complete card details");
        return;
      }
    }

    if (method === "upi") {
      if (!upiId) {
        alert("Please enter UPI ID");
        return;
      }
    }

    // Create new order with customer details
    const newOrder = {
      id: Date.now(),
      items: orderItems,
      total: total,
      paymentMethod: method,
      date: new Date().toLocaleString(),
      customerName: customerDetails.name || "Guest",
      customerPhone: customerDetails.phone || "",
      customerEmail: customerDetails.email || "",
      shippingAddress: customerDetails.address || "",
      status: "pending",
    };

    // Save to orders
    const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    existingOrders.unshift(newOrder);
    localStorage.setItem("orders", JSON.stringify(existingOrders));

    // ===== SEND NOTIFICATIONS =====
    // 1. Send WhatsApp notification to SHOP OWNER
    sendWhatsAppToOwner(newOrder);

    // 2. Send Order Confirmation Email to CUSTOMER
    sendOrderEmailToCustomer(newOrder);

    // Clear appropriate storage
    if (orderType === "cart") {
      localStorage.removeItem("cart");
      localStorage.removeItem("checkoutCart");
      localStorage.removeItem("checkoutTotal");
    } else {
      localStorage.removeItem("purchaseItem");
    }

    // Clear address data
    localStorage.removeItem("selectedAddress");
    localStorage.removeItem("customerDetails");

    // Save order for success page
    setPlacedOrder(newOrder);
    setOrderPlaced(true);
  };

  // Input handlers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(e.target.value);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiry(e.target.value);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvv(e.target.value);
  };

  const handleCardNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardName(e.target.value);
  };

  const handleUpiIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpiId(e.target.value);
  };

  // Success Page with Animation
  if (orderPlaced && placedOrder) {
    return (
      <div className="order-success-page">
        <div className="success-card">
          {/* Animated Checkmark */}
          <div className="checkmark-animation">
            <svg
              className="checkmark"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 52 52"
            >
              <circle
                className="checkmark-circle"
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path
                className="checkmark-check"
                fill="none"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
              />
            </svg>
          </div>

          <h1 className="success-title">Order Placed Successfully! 🎉</h1>
          <p className="success-message">
            Thank you for shopping with Skull Cart 💀
          </p>

          <div className="order-details-summary">
            <p>
              <strong>Order #:</strong> {placedOrder.id}
            </p>
            <p>
              <strong>Total Amount:</strong> ₹{placedOrder.total}
            </p>
            <p>
              <strong>Payment Method:</strong>{" "}
              {placedOrder.paymentMethod.toUpperCase()}
            </p>
            <p>
              <strong>Delivery Address:</strong> {placedOrder.shippingAddress}
            </p>
            <p>
              <strong>Confirmation Email:</strong>{" "}
              {placedOrder.customerEmail
                ? "Sent to your email"
                : "No email provided"}
            </p>
          </div>

          <div className="whatsapp-section">
            <p className="whatsapp-instruction">
              📱 Click below to send order details to the shop owner:
            </p>
            <p style={{ fontSize: "12px", color: "#ff6b6b" }}>
              ⚠️ Important: Share on WhatsApp to confirm your order
            </p>
            <button
              className="whatsapp-share-btn"
              onClick={() => sendWhatsAppToOwner(placedOrder)}
            >
              <span className="whatsapp-icon">💬</span>
              Share Order on WhatsApp
            </button>
          </div>

          <div className="success-actions">
            <button
              className="view-orders-btn"
              onClick={() => navigate("/orders")}
            >
              View My Orders
            </button>
            <button
              className="continue-shopping-btn"
              onClick={() => navigate("/")}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      {/* LEFT SIDE */}
      <div className="payment-methods">
        <h2>Customer Details</h2>

        {/* Display Customer Information */}
        <div
          className="customer-info"
          style={{
            background: "#f8f9fa",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "20px",
          }}
        >
          <p>
            <strong>Name:</strong> {customerDetails.name || "Not provided"}
          </p>
          <p>
            <strong>Phone:</strong> {customerDetails.phone || "Not provided"}
          </p>
          <p>
            <strong>Email:</strong> {customerDetails.email || "Not provided"}
          </p>
          <p>
            <strong>Address:</strong>{" "}
            {customerDetails.address || "Not provided"}
          </p>
        </div>

        <h2>Select Payment Method</h2>

        <label className="payment-option">
          <input
            type="radio"
            name="payment"
            value="credit"
            onChange={(e) => setMethod(e.target.value)}
          />
          Credit Card
        </label>

        <label className="payment-option">
          <input
            type="radio"
            name="payment"
            value="debit"
            onChange={(e) => setMethod(e.target.value)}
          />
          Debit Card
        </label>

        <label className="payment-option">
          <input
            type="radio"
            name="payment"
            value="upi"
            onChange={(e) => setMethod(e.target.value)}
          />
          UPI
        </label>

        <label className="payment-option">
          <input
            type="radio"
            name="payment"
            value="cod"
            onChange={(e) => setMethod(e.target.value)}
          />
          Cash on Delivery
        </label>

        {/* CARD FORM */}
        {(method === "credit" || method === "debit") && (
          <div className="card-form">
            <input
              type="text"
              placeholder="Card Number"
              value={cardNumber}
              onChange={handleCardNumberChange}
              maxLength={16}
            />

            <div className="card-row">
              <input
                type="text"
                placeholder="MM/YY"
                value={expiry}
                onChange={handleExpiryChange}
                maxLength={5}
              />
              <input
                type="text"
                placeholder="CVV"
                value={cvv}
                onChange={handleCvvChange}
                maxLength={3}
              />
            </div>

            <input
              type="text"
              placeholder="Card Holder Name"
              value={cardName}
              onChange={handleCardNameChange}
            />
          </div>
        )}

        {/* UPI FORM */}
        {method === "upi" && (
          <div className="upi-form">
            <input
              type="text"
              placeholder="Enter UPI ID (example@upi)"
              value={upiId}
              onChange={handleUpiIdChange}
            />
          </div>
        )}

        <button className="pay-btn" onClick={placeOrder}>
          Place Order
        </button>
      </div>

      {/* RIGHT SIDE - ORDER SUMMARY */}
      <div className="order-summary">
        <h2>Order Summary</h2>

        {orderType === "buynow" && (
          <div
            className="buy-now-badge"
            style={{
              backgroundColor: "#ff6b6b",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              display: "inline-block",
              marginBottom: "10px",
            }}
          >
            Buy Now
          </div>
        )}

        {orderItems.length > 0 ? (
          orderItems.map((item: any, index: number) => (
            <div
              key={index}
              className="order-item"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
                padding: "5px 0",
              }}
            >
              <p style={{ margin: 0 }}>
                {item.product?.title || item.name || item.title || "Product"}
              </p>
              <p style={{ margin: 0, fontWeight: "bold" }}>
                ₹{item.product?.price || item.price || item.totalPrice} ×{" "}
                {item.quantity || 1}
              </p>
            </div>
          ))
        ) : (
          <p>No items in order</p>
        )}

        <hr style={{ margin: "15px 0" }} />

        <h3
          style={{
            display: "flex",
            justifyContent: "space-between",
            margin: 0,
          }}
        >
          <span>Total:</span>
          <span>₹{total}</span>
        </h3>

        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            background: "#f8f9fa",
            borderRadius: "5px",
            fontSize: "12px",
            color: "#666",
          }}
        >
          <p>📱 WhatsApp notification will be sent to shop owner</p>
          <p>📧 Order confirmation email will be sent to your email address</p>
        </div>
      </div>
    </div>
  );
};

export default Payment;
