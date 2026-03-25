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

interface ReturnRequest {
  orderId: number;
  itemId: string;
  itemName: string;
  quantity: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "completed";
  requestedAt: string;
}

interface CancelledItem {
  orderId: number;
  itemId: string;
  itemName: string;
  quantity: number;
  reason: string;
  cancelledAt: string;
  refundAmount: number;
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
    | "delivered"
    | "cancelled";
  trackingSteps?: TrackingStep[];
  cancelledItems?: CancelledItem[];
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
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Return related state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedItemForReturn, setSelectedItemForReturn] = useState<{
    order: Order;
    item: OrderItem;
    index: number;
  } | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [showReturnStatusModal, setShowReturnStatusModal] = useState(false);
  const [selectedReturnRequest, setSelectedReturnRequest] =
    useState<ReturnRequest | null>(null);

  // Cancel order related state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] =
    useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelledOrders, setCancelledOrders] = useState<CancelledItem[]>([]);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load return requests and cancelled orders from localStorage
  useEffect(() => {
    const storedReturns = JSON.parse(
      localStorage.getItem("returnRequests") || "[]"
    );
    setReturnRequests(storedReturns);

    const storedCancelled = JSON.parse(
      localStorage.getItem("cancelledOrders") || "[]"
    );
    setCancelledOrders(storedCancelled);
  }, []);

  // Save return requests to localStorage
  const saveReturnRequests = (requests: ReturnRequest[]) => {
    localStorage.setItem("returnRequests", JSON.stringify(requests));
    setReturnRequests(requests);
  };

  // Save cancelled orders to localStorage
  const saveCancelledOrders = (cancelled: CancelledItem[]) => {
    localStorage.setItem("cancelledOrders", JSON.stringify(cancelled));
    setCancelledOrders(cancelled);
  };

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
      cancelledItems: order.cancelledItems || [],
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
    if (status === "cancelled") return "Cancelled";
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
      cancelled: "#dc3545",
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
    const currentIndex = statusOrder.indexOf(currentStatus as string);

    return allSteps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
    }));
  };

  const handleViewDetails = (order: Order) => {
    if (isMobile) {
      setExpandedOrder(expandedOrder === order.id ? null : order.id);
    } else {
      setSelectedOrder(order);
      setShowTracking(false);
    }
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
    setShowReturnModal(false);
    setSelectedItemForReturn(null);
    setReturnReason("");
    setShowReturnStatusModal(false);
    setSelectedReturnRequest(null);
    setShowCancelModal(false);
    setSelectedOrderForCancel(null);
    setCancelReason("");
  };

  const handleClosePage = () => {
    navigate("/");
  };

  // Check if order is eligible for cancellation (only pending orders)
  const isOrderEligibleForCancel = (order: Order): boolean => {
    return order.status === "pending";
  };

  // Check if item is eligible for return (only delivered orders)
  const isItemEligibleForReturn = (order: Order): boolean => {
    return order.status === "delivered";
  };

  // Get return status for an item
  const getItemReturnStatus = (
    orderId: number,
    itemId: string
  ): ReturnRequest | null => {
    return (
      returnRequests.find(
        (r) => r.orderId === orderId && r.itemId === itemId
      ) || null
    );
  };

  const openReturnModal = (order: Order, item: OrderItem, index: number) => {
    setSelectedItemForReturn({ order, item, index });
    setReturnReason("");
    setShowReturnModal(true);
  };

  const submitReturnRequest = () => {
    if (!selectedItemForReturn || !returnReason.trim()) {
      alert("Please provide a reason for return");
      return;
    }

    const { order, item } = selectedItemForReturn;
    const itemId =
      item.id || item.product?.id || item.name || `item-${Date.now()}`;

    const newReturnRequest: ReturnRequest = {
      orderId: order.id,
      itemId: itemId,
      itemName: getProductName(item),
      quantity: item.quantity || 1,
      reason: returnReason,
      status: "pending",
      requestedAt: new Date().toLocaleString(),
    };

    const updatedReturns = [...returnRequests, newReturnRequest];
    saveReturnRequests(updatedReturns);

    // Show success notification
    setNotificationMessage(
      `Return request submitted for ${getProductName(item)}`
    );
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);

    // Close modal
    setShowReturnModal(false);
    setSelectedItemForReturn(null);
    setReturnReason("");
  };

  const viewReturnStatus = (returnRequest: ReturnRequest) => {
    setSelectedReturnRequest(returnRequest);
    setShowReturnStatusModal(true);
  };

  const getReturnStatusColor = (status: string) => {
    const colors = {
      pending: "#ffc107",
      approved: "#17a2b8",
      rejected: "#dc3545",
      completed: "#28a745",
    };
    return colors[status as keyof typeof colors] || "#6c757d";
  };

  const getReturnStatusText = (status: string) => {
    const texts = {
      pending: "Pending Review",
      approved: "Approved - Please Ship",
      rejected: "Rejected",
      completed: "Refund/Replacement Completed",
    };
    return texts[status as keyof typeof texts] || status;
  };

  // Cancel order functions
  const openCancelModal = (order: Order) => {
    setSelectedOrderForCancel(order);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const submitCancelOrder = () => {
    if (!selectedOrderForCancel || !cancelReason.trim()) {
      alert("Please provide a reason for cancellation");
      return;
    }

    const order = selectedOrderForCancel;

    // Update order status to cancelled
    const updatedOrders = orders.map((o) => {
      if (o.id === order.id) {
        return { ...o, status: "cancelled" as Order["status"] };
      }
      return o;
    });

    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    setOrders(updatedOrders);

    // Save cancellation record
    const newCancelledItem: CancelledItem = {
      orderId: order.id,
      itemId: `order-${order.id}`,
      itemName: `${order.items.length} item(s) in order #${order.id}`,
      quantity: order.items.reduce(
        (sum, item) => sum + (item.quantity || 1),
        0
      ),
      reason: cancelReason,
      cancelledAt: new Date().toLocaleString(),
      refundAmount: order.total,
    };

    const updatedCancelled = [...cancelledOrders, newCancelledItem];
    saveCancelledOrders(updatedCancelled);

    // Show success notification
    setNotificationMessage(
      `Order #${order.id} has been cancelled successfully`
    );
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);

    // Close modal
    setShowCancelModal(false);
    setSelectedOrderForCancel(null);
    setCancelReason("");
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
                    <p className="order-date">{order.date}</p>
                    {order.customerName && (
                      <p className="customer-name">{order.customerName}</p>
                    )}
                  </div>
                  <div className="order-header-actions">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusText(order.status)}
                    </span>
                    {/* Cancel Order Button - Only for PENDING orders */}
                    {isOrderEligibleForCancel(order) && (
                      <button
                        className="cancel-order-btn"
                        onClick={() => openCancelModal(order)}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="order-items-preview">
                  {order.items
                    .slice(0, 2)
                    .map((item: OrderItem, idx: number) => {
                      const itemId = item.id || item.product?.id || item.name;
                      const returnStatus = itemId
                        ? getItemReturnStatus(order.id, itemId)
                        : null;

                      return (
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
                            {/* Return Button - Only for DELIVERED orders */}
                            {order.status === "delivered" && (
                              <div className="return-action">
                                {returnStatus ? (
                                  <button
                                    className="return-status-btn"
                                    onClick={() =>
                                      viewReturnStatus(returnStatus)
                                    }
                                    style={{
                                      borderColor: getReturnStatusColor(
                                        returnStatus.status
                                      ),
                                    }}
                                  >
                                    Return:{" "}
                                    {getReturnStatusText(returnStatus.status)}
                                  </button>
                                ) : (
                                  <button
                                    className="return-btn"
                                    onClick={() =>
                                      openReturnModal(order, item, idx)
                                    }
                                  >
                                    Return Item
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  {order.items.length > 2 && (
                    <p className="more-items">
                      +{order.items.length - 2} more items
                    </p>
                  )}
                </div>

                {/* Order Footer */}
                <div className="order-footer">
                  <div className="order-summary">
                    <p className="order-total">Total: ₹{order.total}</p>
                    <p className="payment-method">
                      {order.paymentMethod.toUpperCase()}
                    </p>
                  </div>
                  <div className="order-actions">
                    <button
                      className="details-btn"
                      onClick={() => handleViewDetails(order)}
                    >
                      {isMobile && expandedOrder === order.id
                        ? "Hide Details"
                        : "View Details"}
                    </button>
                    {order.status !== "cancelled" && (
                      <button
                        className="track-btn"
                        onClick={() => handleTrackOrder(order)}
                      >
                        Track Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Mobile View with Return Options */}
                {isMobile && expandedOrder === order.id && (
                  <div className="mobile-details-expanded">
                    <div className="details-section">
                      <h3>Order Information</h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Order Date</span>
                          <span className="info-value">{order.date}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Payment Method</span>
                          <span className="info-value">
                            {order.paymentMethod.toUpperCase()}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Total Amount</span>
                          <span className="info-value">₹{order.total}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Customer Name</span>
                          <span className="info-value">
                            {order.customerName || "Guest"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="details-section">
                      <h3>Items Ordered</h3>
                      <div className="items-list">
                        {order.items.map((item: OrderItem, idx: number) => {
                          const itemId =
                            item.id || item.product?.id || item.name;
                          const returnStatus = itemId
                            ? getItemReturnStatus(order.id, itemId)
                            : null;

                          return (
                            <div key={idx} className="mobile-item">
                              <img
                                src={getProductImage(item)}
                                alt={getProductName(item)}
                                className="mobile-item-image"
                              />
                              <div className="mobile-item-info">
                                <h4>{getProductName(item)}</h4>
                                <p className="mobile-item-price">
                                  ₹{getProductPrice(item)} ×{" "}
                                  {item.quantity || 1}
                                </p>
                                {/* Return Button in Mobile View - Only for DELIVERED orders */}
                                {order.status === "delivered" && (
                                  <div className="return-action">
                                    {returnStatus ? (
                                      <button
                                        className="return-status-btn"
                                        onClick={() =>
                                          viewReturnStatus(returnStatus)
                                        }
                                        style={{
                                          borderColor: getReturnStatusColor(
                                            returnStatus.status
                                          ),
                                        }}
                                      >
                                        Return:{" "}
                                        {getReturnStatusText(
                                          returnStatus.status
                                        )}
                                      </button>
                                    ) : (
                                      <button
                                        className="return-btn"
                                        onClick={() =>
                                          openReturnModal(order, item, idx)
                                        }
                                      >
                                        Request Return
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && selectedOrderForCancel && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={handleCloseModal}>
              ×
            </button>

            <h2 className="modal-title">
              Cancel Order #{selectedOrderForCancel.id}
            </h2>

            <div className="cancel-modal-content">
              <div className="cancel-warning">
                <span className="warning-icon">⚠️</span>
                <p>Are you sure you want to cancel this order?</p>
              </div>

              <div className="cancel-order-preview">
                <div className="cancel-order-info">
                  <p>
                    <strong>Order Total:</strong> ₹
                    {selectedOrderForCancel.total}
                  </p>
                  <p>
                    <strong>Items:</strong>{" "}
                    {selectedOrderForCancel.items.length} item(s)
                  </p>
                  <p>
                    <strong>Payment Method:</strong>{" "}
                    {selectedOrderForCancel.paymentMethod.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="cancel-form">
                <label htmlFor="cancelReason">Reason for Cancellation *</label>
                <select
                  id="cancelReason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="cancel-select"
                >
                  <option value="">Select a reason</option>
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Found better price elsewhere">
                    Found better price elsewhere
                  </option>
                  <option value="Shipping takes too long">
                    Shipping takes too long
                  </option>
                  <option value="Payment issue">Payment issue</option>
                  <option value="Other">Other</option>
                </select>

                {cancelReason === "Other" && (
                  <textarea
                    placeholder="Please specify your reason..."
                    className="cancel-textarea"
                    rows={3}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                )}

                <div className="cancel-info">
                  <p>📋 Cancellation Policy:</p>
                  <ul>
                    <li>
                      Orders can only be cancelled while status is "PENDING"
                    </li>
                    <li>
                      Full refund will be processed within 3-5 business days
                    </li>
                    <li>
                      Once cancelled, the order cannot be restored. Once The
                      Order Is Shipped You Cannot Cancel It
                    </li>
                  </ul>
                </div>

                <div className="cancel-actions">
                  <button className="keep-order-btn" onClick={handleCloseModal}>
                    Keep Order
                  </button>
                  <button
                    className="confirm-cancel-btn"
                    onClick={submitCancelOrder}
                  >
                    Yes, Cancel Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Request Modal */}
      {showReturnModal && selectedItemForReturn && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={handleCloseModal}>
              ×
            </button>

            <h2 className="modal-title">Request Return</h2>

            <div className="return-modal-content">
              <div className="return-item-preview">
                <img
                  src={getProductImage(selectedItemForReturn.item)}
                  alt={getProductName(selectedItemForReturn.item)}
                  className="return-item-image"
                />
                <div className="return-item-details">
                  <h4>{getProductName(selectedItemForReturn.item)}</h4>
                  <p>Quantity: {selectedItemForReturn.item.quantity || 1}</p>
                  <p>Price: ₹{getProductPrice(selectedItemForReturn.item)}</p>
                </div>
              </div>

              <div className="return-form">
                <label htmlFor="returnReason">Reason for Return *</label>
                <select
                  id="returnReason"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="return-select"
                >
                  <option value="">Select a reason</option>
                  <option value="Damaged product">Damaged product</option>
                  <option value="Wrong item received">
                    Wrong item received
                  </option>
                  <option value="Size/quality issue">Size/quality issue</option>
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Other">Other</option>
                </select>

                {returnReason === "Other" && (
                  <textarea
                    placeholder="Please specify your reason..."
                    className="return-textarea"
                    rows={3}
                    onChange={(e) => setReturnReason(e.target.value)}
                  />
                )}

                <div className="return-info">
                  <p>📦 Return Policy:</p>
                  <ul>
                    <li>Returns accepted within 7 days of delivery</li>
                    <li>Items must be unused and in original packaging</li>
                    <li>
                      Refund will be processed within 5-7 business days after
                      inspection
                    </li>
                  </ul>
                </div>

                <div className="return-actions">
                  <button
                    className="cancel-return-btn"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="submit-return-btn"
                    onClick={submitReturnRequest}
                  >
                    Submit Return Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Status Modal */}
      {showReturnStatusModal && selectedReturnRequest && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={handleCloseModal}>
              ×
            </button>

            <h2 className="modal-title">Return Status</h2>

            <div className="return-status-content">
              <div className="status-header">
                <span
                  className="return-status-badge"
                  style={{
                    backgroundColor: getReturnStatusColor(
                      selectedReturnRequest.status
                    ),
                  }}
                >
                  {getReturnStatusText(selectedReturnRequest.status)}
                </span>
              </div>

              <div className="return-details">
                <div className="return-detail-row">
                  <span className="return-label">Item:</span>
                  <span>{selectedReturnRequest.itemName}</span>
                </div>
                <div className="return-detail-row">
                  <span className="return-label">Quantity:</span>
                  <span>{selectedReturnRequest.quantity}</span>
                </div>
                <div className="return-detail-row">
                  <span className="return-label">Reason:</span>
                  <span>{selectedReturnRequest.reason}</span>
                </div>
                <div className="return-detail-row">
                  <span className="return-label">Requested On:</span>
                  <span>{selectedReturnRequest.requestedAt}</span>
                </div>
              </div>

              {selectedReturnRequest.status === "approved" && (
                <div className="return-instructions">
                  <h4>📦 Return Instructions</h4>
                  <p>Please ship the item to the following address:</p>
                  <div className="return-address">
                    <p>
                      <strong>Skull Cart Returns</strong>
                    </p>
                    <p>123 E-Commerce Street</p>
                    <p>Mumbai, Maharashtra 400001</p>
                    <p>India</p>
                  </div>
                  <p className="return-note">
                    Once we receive and inspect the item, we will process your
                    refund/replacement.
                  </p>
                </div>
              )}

              {selectedReturnRequest.status === "rejected" && (
                <div className="return-rejection">
                  <h4>❌ Return Request Rejected</h4>
                  <p>
                    Your return request was not approved. Please contact
                    customer support for more details.
                  </p>
                </div>
              )}

              {selectedReturnRequest.status === "completed" && (
                <div className="return-completed">
                  <h4>✅ Return Completed</h4>
                  <p>
                    Your return has been successfully processed. The refund has
                    been initiated to your original payment method.
                  </p>
                </div>
              )}

              <button className="close-status-btn" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal - Desktop only */}
      {selectedOrder && !showTracking && !isMobile && (
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
                {selectedOrder.items.map((item: OrderItem, idx: number) => {
                  const itemId = item.id || item.product?.id || item.name;
                  const returnStatus = itemId
                    ? getItemReturnStatus(selectedOrder.id, itemId)
                    : null;

                  return (
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
                        {/* Return Button in Desktop Modal - Only for DELIVERED orders */}
                        {selectedOrder.status === "delivered" && (
                          <div className="return-action-desktop">
                            {returnStatus ? (
                              <button
                                className="return-status-btn"
                                onClick={() => viewReturnStatus(returnStatus)}
                                style={{
                                  borderColor: getReturnStatusColor(
                                    returnStatus.status
                                  ),
                                }}
                              >
                                Return:{" "}
                                {getReturnStatusText(returnStatus.status)}
                              </button>
                            ) : (
                              <button
                                className="return-btn"
                                onClick={() =>
                                  openReturnModal(selectedOrder, item, idx)
                                }
                              >
                                Request Return
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal - Mobile Optimized */}
      {selectedOrder && showTracking && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className={`modal-content ${
              isMobile ? "mobile-tracking-modal" : ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
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

              {/* Tracking Timeline - Mobile Optimized */}
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
