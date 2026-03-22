import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./orders.css";

interface OrderItem {
  id?: string;
  name?: string;
  title?: string;
  price?: number;
  image?: string;
  description?: string;
  quantity: number;
  product?: {
    id: string;
    title: string;
    price: number;
    image: string;
    description?: string;
  };
}

interface Order {
  id: number;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  date: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  status?:
    | "pending"
    | "confirmed"
    | "shipped"
    | "out-for-delivery"
    | "delivered";
  trackingSteps?: TrackingStep[];
}

interface TrackingStep {
  status: string;
  date: string;
  description: string;
  completed: boolean;
}

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showTracking, setShowTracking] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [sentSMSOrders, setSentSMSOrders] = useState<Set<number>>(new Set());

  // Load orders from localStorage
  const loadOrders = () => {
    const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");

    const ordersWithDefaults = storedOrders.map((order: Order) => ({
      ...order,
      status: order.status || getRandomStatus(),
      paymentMethod: order.paymentMethod || "card",
      date: order.date || new Date().toLocaleString(),
      customerName: order.customerName || "Customer",
      customerPhone: order.customerPhone || "Not provided",
    }));

    setOrders(ordersWithDefaults);
    return ordersWithDefaults.length;
  };

  // Initial load
  useEffect(() => {
    const count = loadOrders();
    setLastOrderCount(count);

    // Request notification permission
    if (
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission();
    }
  }, []);

  // Monitor for new orders (runs every 3 seconds)
  useEffect(() => {
    const checkForNewOrders = () => {
      const currentOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      const currentCount = currentOrders.length;

      if (currentCount > lastOrderCount) {
        const newOrdersCount = currentCount - lastOrderCount;
        const newOrders = currentOrders.slice(0, newOrdersCount);

        // Show notification for each new order
        newOrders.forEach((order: Order, index: number) => {
          setTimeout(() => {
            setNotificationMessage(
              `${newOrdersCount} new order${
                newOrdersCount > 1 ? "s" : ""
              } placed!`
            );
            setShowNotification(true);

            // Show browser notification
            if (index === 0) {
              showBrowserNotification(newOrdersCount, order);
            }

            // Play sound
            playNotificationSound();

            // Send SMS for new order
            if (!sentSMSOrders.has(order.id)) {
              sendSMSNotification(order);
              setSentSMSOrders((prev) => new Set(prev).add(order.id));
            }
          }, index * 1000);
        });

        // Hide notification after 3 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);

        // Reload orders
        loadOrders();
        setLastOrderCount(currentCount);
      }
    };

    const interval = setInterval(checkForNewOrders, 3000);
    return () => clearInterval(interval);
  }, [lastOrderCount, sentSMSOrders]);

  // Function to send SMS to Jio number
  const sendSMSNotification = async (order: Order) => {
    // Format order items
    const itemsList = order.items
      .slice(0, 3)
      .map((item) => {
        const itemName = getProductName(item);
        const quantity = item.quantity || 1;
        const price = getProductPrice(item);
        return `${itemName} x${quantity} (₹${price})`;
      })
      .join(", ");

    const moreItems =
      order.items.length > 3 ? ` +${order.items.length - 3} more` : "";

    // Create SMS message with all order details
    const smsMessage = `🛍️ NEW ORDER RECEIVED! 🛍️

Order #${order.id}
Customer: ${order.customerName || "Guest"}
${
  order.customerPhone && order.customerPhone !== "Not provided"
    ? `Phone: ${order.customerPhone}\n`
    : ""
}Items: ${itemsList}${moreItems}
Total: ₹${order.total}
Payment: ${order.paymentMethod.toUpperCase()}
Time: ${new Date().toLocaleString()}

View order: ${window.location.origin}/orders`;

    // Send to Jio number (replace with your carrier if different)
    const smsEmail = `6303320879@jio.com`;

    // Open email client with pre-filled SMS
    window.open(
      `mailto:${smsEmail}?subject=New Order #${
        order.id
      }&body=${encodeURIComponent(smsMessage)}`,
      "_blank"
    );
  };

  // Function to show browser notification
  const showBrowserNotification = (count: number, newOrder?: Order) => {
    if (Notification.permission === "granted") {
      if (count === 1 && newOrder) {
        const totalAmount =
          newOrder.total ||
          newOrder.items.reduce(
            (sum, item) =>
              sum +
              (item.price || item.product?.price || 0) * (item.quantity || 1),
            0
          );

        new Notification("🛍️ New Order Received!", {
          body: `Order #${newOrder.id}\nCustomer: ${
            newOrder.customerName || "Guest"
          }\nTotal: ₹${totalAmount}\nPayment: ${newOrder.paymentMethod.toUpperCase()}`,
          icon: "/skullcart.png",
          badge: "/skullcart.png",
          tag: "new-order",
          requireInteraction: true,
        });
      } else {
        new Notification("🛍️ New Orders!", {
          body: `${count} new order${
            count > 1 ? "s have" : " has"
          } been placed!`,
          icon: "/skullcart.png",
          badge: "/skullcart.png",
          tag: "new-order",
        });
      }
    }
  };

  // Function to play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio("/just-saying-593.ogg");
      audio.play().catch((e) => console.log("Audio play failed:", e));
    } catch (error) {
      console.log("Sound error:", error);
    }
  };

  // For demo purposes - random status
  const getRandomStatus = (): Order["status"] => {
    const statuses: Order["status"][] = [
      "pending",
      "confirmed",
      "shipped",
      "out-for-delivery",
      "delivered",
    ];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const getStatusText = (status: string | undefined) => {
    if (!status) return "Pending";
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusColor = (status: string | undefined) => {
    const colors = {
      pending: "#ffc107",
      confirmed: "#17a2b8",
      shipped: "#007bff",
      "out-for-delivery": "#fd7e14",
      delivered: "#28a745",
    };
    return colors[status as keyof typeof colors] || "#6c757d";
  };

  const generateTrackingSteps = (
    currentStatus: Order["status"] = "pending"
  ): TrackingStep[] => {
    const allSteps: TrackingStep[] = [
      {
        status: "pending",
        date: new Date().toLocaleDateString(),
        description: "Order placed and waiting for confirmation",
        completed: false,
      },
      {
        status: "confirmed",
        date: new Date(Date.now() + 86400000).toLocaleDateString(),
        description: "Order confirmed and being processed",
        completed: false,
      },
      {
        status: "shipped",
        date: new Date(Date.now() + 172800000).toLocaleDateString(),
        description: "Order has been shipped",
        completed: false,
      },
      {
        status: "out-for-delivery",
        date: new Date(Date.now() + 259200000).toLocaleDateString(),
        description: "Out for delivery",
        completed: false,
      },
      {
        status: "delivered",
        date: new Date(Date.now() + 345600000).toLocaleDateString(),
        description: "Order delivered successfully",
        completed: false,
      },
    ];

    const statusOrder = [
      "pending",
      "confirmed",
      "shipped",
      "out-for-delivery",
      "delivered",
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return allSteps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
    }));
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowTracking(false);
  };

  const handleTrackOrder = (order: Order) => {
    const orderWithTracking = {
      ...order,
      trackingSteps: generateTrackingSteps(order.status),
    };
    setSelectedOrder(orderWithTracking);
    setShowTracking(true);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setShowTracking(false);
  };

  const handleClosePage = () => {
    navigate("/");
  };

  const getProductName = (item: OrderItem): string => {
    return item.product?.title || item.title || item.name || "Product";
  };

  const getProductPrice = (item: OrderItem): number => {
    return item.product?.price || item.price || 0;
  };

  const getProductImage = (item: OrderItem): string => {
    return (
      item.product?.image || item.image || "https://via.placeholder.com/150"
    );
  };

  const getProductDescription = (item: OrderItem): string => {
    return (
      item.product?.description ||
      item.description ||
      "No description available"
    );
  };

  return (
    <>
      <Navbar />

      {/* Floating Notification */}
      {showNotification && (
        <div className="order-notification">
          <span className="notification-icon">🔔</span>
          <span className="notification-message">{notificationMessage}</span>
        </div>
      )}

      <div className="orders-container">
        <div className="orders-header">
          <h1 className="orders-title">Your Orders</h1>
          <button className="close-orders-btn" onClick={handleClosePage}>
            ✕
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="no-orders">
            <p>No orders yet.</p>
            <a href="/" className="shop-now-btn">
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order, index) => (
              <div key={order.id || index} className="order-card">
                {/* Order Header */}
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.id || index + 1}</h3>
                    <p className="order-date">Placed on: {order.date}</p>
                    {order.customerName && (
                      <p className="customer-name">
                        Customer: {order.customerName}
                      </p>
                    )}
                  </div>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>

                {/* Order Items Preview */}
                <div className="order-items-preview">
                  {order.items
                    .slice(0, 2)
                    .map((item: OrderItem, idx: number) => (
                      <div key={idx} className="preview-item">
                        <img
                          src={getProductImage(item)}
                          alt={getProductName(item)}
                          className="preview-item-image"
                        />
                        <div className="preview-item-info">
                          <h4>{getProductName(item)}</h4>
                          <p>
                            ₹{getProductPrice(item)} × {item.quantity || 1}
                          </p>
                        </div>
                      </div>
                    ))}
                  {order.items.length > 2 && (
                    <p className="more-items">
                      +{order.items.length - 2} more items
                    </p>
                  )}
                </div>

                {/* Order Footer */}
                <div className="order-footer">
                  <p className="order-total">Total: ₹{order.total}</p>
                  <p className="payment-method">
                    Payment: {order.paymentMethod.toUpperCase()}
                  </p>
                  <div className="order-actions">
                    <button
                      className="details-btn"
                      onClick={() => handleViewDetails(order)}
                    >
                      View Details
                    </button>
                    <button
                      className="track-btn"
                      onClick={() => handleTrackOrder(order)}
                    >
                      Track Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedOrder && !showTracking && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={handleCloseModal}>
              ×
            </button>

            <h2 className="modal-title">Order Details #{selectedOrder.id}</h2>

            {/* Order Information */}
            <div className="details-section">
              <h3 className="section-title">Order Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Order Date</span>
                  <span className="info-value">{selectedOrder.date}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Payment Method</span>
                  <span className="info-value">
                    {selectedOrder.paymentMethod
                      ? getStatusText(selectedOrder.paymentMethod)
                      : "Not specified"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Total Amount</span>
                  <span className="info-value">₹{selectedOrder.total}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Customer Name</span>
                  <span className="info-value">
                    {selectedOrder.customerName || "Guest"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status</span>
                  <span className="info-value">
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: getStatusColor(
                          selectedOrder.status || "pending"
                        ),
                      }}
                    >
                      {getStatusText(selectedOrder.status || "pending")}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Items Ordered */}
            <div className="details-section">
              <h3 className="section-title">Items Ordered</h3>
              <div className="items-list">
                {selectedOrder.items.map((item: OrderItem, idx: number) => (
                  <div key={idx} className="modal-item">
                    <img
                      src={getProductImage(item)}
                      alt={getProductName(item)}
                      className="modal-item-image"
                    />
                    <div className="modal-item-info">
                      <h4>{getProductName(item)}</h4>
                      <p className="modal-item-description">
                        {getProductDescription(item)}
                      </p>
                      <p className="modal-item-price">
                        ₹{getProductPrice(item)} × {item.quantity || 1} = ₹
                        {getProductPrice(item) * (item.quantity || 1)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {selectedOrder && showTracking && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={handleCloseModal}>
              ×
            </button>

            <h2 className="modal-title">Track Order #{selectedOrder.id}</h2>

            <div className="tracking-container">
              {/* Current Status */}
              <div className="current-status">
                <h3>
                  Current Status:
                  <span
                    className="status-highlight"
                    style={{
                      color: getStatusColor(selectedOrder.status || "pending"),
                      marginLeft: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    {getStatusText(selectedOrder.status || "pending")}
                  </span>
                </h3>
              </div>

              {/* Tracking Timeline */}
              <div className="tracking-timeline">
                {(
                  selectedOrder.trackingSteps ||
                  generateTrackingSteps(selectedOrder.status)
                ).map((step, index) => (
                  <div
                    key={index}
                    className={`timeline-step ${
                      step.completed ? "completed" : ""
                    }`}
                  >
                    <div className="step-indicator">
                      <div className="step-dot"></div>
                      {index < 4 && <div className="step-line"></div>}
                    </div>
                    <div className="step-content">
                      <h4>{getStatusText(step.status)}</h4>
                      <p className="step-date">{step.date}</p>
                      <p className="step-description">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Estimate */}
              <div className="delivery-estimate">
                <h4>Estimated Delivery</h4>
                {selectedOrder.status === "delivered" ? (
                  <p className="delivered-text">
                    ✓ Delivered on{" "}
                    {selectedOrder.trackingSteps?.find(
                      (s) => s.status === "delivered"
                    )?.date || new Date().toLocaleDateString()}
                  </p>
                ) : (
                  <p>
                    {selectedOrder.status === "pending" &&
                      "Order confirmation in progress"}
                    {selectedOrder.status === "confirmed" &&
                      "Preparing for shipment"}
                    {selectedOrder.status === "shipped" &&
                      "In transit - Expected in 2-3 days"}
                    {selectedOrder.status === "out-for-delivery" &&
                      "Out for delivery today!"}
                    {!selectedOrder.status && "Processing your order"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
