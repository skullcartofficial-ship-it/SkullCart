import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import "./address.css";

export default function Address() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    countryCode: "+91",
    phone: "",
    email: "",
    doorNo: "",
    street: "",
    city: "",
    pincode: "",
  });

  // Get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        loadAddressesForUser(user.email);
      } else {
        // If not logged in, redirect to login
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Load cart data and addresses
  useEffect(() => {
    console.log("=== ADDRESS PAGE LOADED ===");

    // Try to get cart from checkoutCart first
    let checkoutCart = localStorage.getItem("checkoutCart");
    let checkoutTotal = localStorage.getItem("checkoutTotal");

    console.log("checkoutCart from localStorage:", checkoutCart);
    console.log("checkoutTotal from localStorage:", checkoutTotal);

    if (checkoutCart && checkoutCart !== "[]") {
      const parsedCart = JSON.parse(checkoutCart);
      setCartItems(parsedCart);
      setTotal(parseFloat(checkoutTotal || "0"));
      console.log("✅ Loaded from checkoutCart:", parsedCart.length, "items");
    } else {
      const regularCart = JSON.parse(localStorage.getItem("cart") || "[]");
      console.log("Regular cart from localStorage:", regularCart);

      if (regularCart.length > 0) {
        setCartItems(regularCart);
        const calculatedTotal = regularCart.reduce(
          (sum: number, item: any) => sum + item.price * (item.quantity || 1),
          0
        );
        setTotal(calculatedTotal);
        console.log(
          "✅ Loaded from regular cart:",
          regularCart.length,
          "items"
        );
      } else {
        console.log("❌ No cart data found!");
      }
    }

    setLoading(false);
  }, []);

  // Load addresses for specific user email
  const loadAddressesForUser = (userEmail: string | null) => {
    if (!userEmail) return;

    // Get all addresses from localStorage
    const allAddresses = JSON.parse(localStorage.getItem("addresses") || "{}");

    // Get addresses for this specific user
    const userAddresses = allAddresses[userEmail] || [];
    setAddresses(userAddresses);

    console.log(`Loaded ${userAddresses.length} addresses for ${userEmail}`);
  };

  // Save addresses for current user
  const saveAddressesForUser = (userEmail: string, addressesToSave: any[]) => {
    if (!userEmail) return;

    // Get all addresses
    const allAddresses = JSON.parse(localStorage.getItem("addresses") || "{}");

    // Update addresses for this user
    allAddresses[userEmail] = addressesToSave;

    // Save back to localStorage
    localStorage.setItem("addresses", JSON.stringify(allAddresses));

    console.log(`Saved ${addressesToSave.length} addresses for ${userEmail}`);
  };

  const saveAddress = () => {
    if (!user?.email) {
      alert("Please login to save address");
      navigate("/login");
      return;
    }

    // Validation
    if (!form.name.trim()) {
      alert("Please enter your full name");
      return;
    }

    // Email validation
    if (!form.email.trim()) {
      alert("Please enter your email address");
      return;
    }
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      alert("Please enter a valid email address");
      return;
    }

    // Phone validation (10 digits)
    if (!/^[0-9]{10}$/.test(form.phone)) {
      alert("Enter a valid 10-digit phone number");
      return;
    }

    // Door No validation
    if (!form.doorNo.trim()) {
      alert("Please enter your door/flat number");
      return;
    }

    // Street validation
    if (!form.street.trim()) {
      alert("Please enter your street address");
      return;
    }

    // City validation
    if (!form.city.trim()) {
      alert("Please enter your city");
      return;
    }

    // Pincode validation (6 digits for India)
    if (!/^[0-9]{6}$/.test(form.pincode)) {
      alert("Enter a valid 6-digit pincode");
      return;
    }

    // Create new address object with timestamp
    const newAddress = {
      ...form,
      id: Date.now(), // Add unique ID
      createdAt: new Date().toISOString(),
    };

    const newAddresses = [...addresses, newAddress];
    setAddresses(newAddresses);

    // Save to localStorage with user email
    saveAddressesForUser(user.email, newAddresses);

    // Reset form
    setForm({
      name: "",
      countryCode: "+91",
      phone: "",
      email: "",
      doorNo: "",
      street: "",
      city: "",
      pincode: "",
    });

    // Auto-select the newly added address
    setSelected(newAddresses.length - 1);

    alert("Address saved successfully!");
  };

  const deleteAddress = (index: number) => {
    if (!user?.email) return;

    const updated = addresses.filter((_, i) => i !== index);
    setAddresses(updated);

    // Save updated addresses for this user
    saveAddressesForUser(user.email, updated);

    if (selected === index) {
      setSelected(null);
    } else if (selected !== null && selected > index) {
      setSelected(selected - 1);
    }
  };

  const continueCheckout = () => {
    if (addresses.length === 0) {
      alert("Please add a delivery address first");
      return;
    }

    if (selected === null) {
      alert("Please select a delivery address");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add items to cart first.");
      navigate("/cart");
      return;
    }

    const selectedAddress = addresses[selected];

    const customerDetails = {
      name: selectedAddress.name,
      phone: selectedAddress.phone,
      email: selectedAddress.email,
      address: `${selectedAddress.doorNo}, ${selectedAddress.street}, ${selectedAddress.city} - ${selectedAddress.pincode}`,
    };

    localStorage.setItem("customerDetails", JSON.stringify(customerDetails));
    localStorage.setItem("paymentCart", JSON.stringify(cartItems));
    localStorage.setItem("paymentTotal", total.toString());

    navigate("/payment");
  };

  const calculateTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <div className="loading">Redirecting to login...</div>;
  }

  return (
    <div className="address-page">
      <h1>Choose Delivery Address</h1>

      {/* User Info */}
      <div className="user-info-banner">
        <p>
          Logged in as: <strong>{user.email}</strong>
        </p>
      </div>

      {/* Show cart warning if empty */}
      {cartItems.length === 0 && (
        <div className="cart-warning">
          <p>⚠️ Your cart is empty. Please add items before proceeding.</p>
          <button onClick={() => navigate("/shop")} className="shop-now-btn">
            Shop Now
          </button>
        </div>
      )}

      <div className="address-list">
        {addresses.map((addr, index) => (
          <div
            key={addr.id || index}
            className={`address-card ${selected === index ? "active" : ""}`}
            onClick={() => setSelected(index)}
          >
            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                deleteAddress(index);
              }}
            >
              ✕
            </button>
            <h3>{addr.name}</h3>
            <p>
              {addr.doorNo}, {addr.street}
            </p>
            <p>{addr.city}</p>
            <p>{addr.pincode}</p>
            <p>
              {addr.countryCode} {addr.phone}
            </p>
            <p className="email-field">{addr.email}</p>
          </div>
        ))}
      </div>

      <h2>Add New Address</h2>

      <div className="address-form">
        <input
          placeholder="Full Name *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <div className="phone-field">
          <select
            value={form.countryCode}
            onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
          >
            <option value="+91">🇮🇳 +91 (India)</option>
            <option value="+1">🇺🇸 +1 (USA)</option>
            <option value="+44">🇬🇧 +44 (UK)</option>
            <option value="+61">🇦🇺 +61 (Australia)</option>
          </select>

          <input
            placeholder="Phone Number * (10 digits)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <input
          type="email"
          placeholder="Email Address *"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="Door No / Flat No *"
          value={form.doorNo}
          onChange={(e) => setForm({ ...form, doorNo: e.target.value })}
        />

        <input
          placeholder="Street Address *"
          value={form.street}
          onChange={(e) => setForm({ ...form, street: e.target.value })}
        />

        <input
          placeholder="City *"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />

        <input
          placeholder="Pincode * (6 digits)"
          value={form.pincode}
          onChange={(e) => setForm({ ...form, pincode: e.target.value })}
        />

        <button onClick={saveAddress}>Save Address</button>
      </div>

      <button className="continue-btn" onClick={continueCheckout}>
        Continue to Payment
      </button>

      {/* Order Summary */}
      {cartItems.length > 0 && (
        <div className="order-summary-mini">
          <h3>Order Summary</h3>
          <p>Total Items: {calculateTotalItems()}</p>
          {cartItems.slice(0, 3).map((item, idx) => (
            <div key={idx} className="summary-item">
              <span>{item.title || item.name}</span>
              <span>
                ₹{item.price} × {item.quantity || 1}
              </span>
            </div>
          ))}
          {cartItems.length > 3 && <p>+ {cartItems.length - 3} more items</p>}
          <p className="total-amount">Total Amount: ₹{total}</p>
        </div>
      )}
    </div>
  );
}
