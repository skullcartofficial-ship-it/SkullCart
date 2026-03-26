import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { setCurrentUser, CartItem } from "../cart";
import userDataService, {
  Address as SavedAddress,
} from "../services/userDataService";
import "./address.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddressFormState {
  name: string;
  countryCode: string;
  phone: string;
  email: string;
  doorNo: string;
  street: string;
  city: string;
  pincode: string;
}

const EMPTY_FORM: AddressFormState = {
  name: "",
  countryCode: "+91",
  phone: "",
  email: "",
  doorNo: "",
  street: "",
  city: "",
  pincode: "",
};

const EMAIL_REGEX = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;

// ─── Validation ───────────────────────────────────────────────────────────────

function validateForm(form: AddressFormState): string | null {
  if (!form.name.trim()) return "Please enter your full name";
  if (!form.email.trim()) return "Please enter your email address";
  if (!EMAIL_REGEX.test(form.email))
    return "Please enter a valid email address";
  if (!/^[0-9]{10}$/.test(form.phone))
    return "Enter a valid 10-digit phone number";
  if (!form.doorNo.trim()) return "Please enter your door/flat number";
  if (!form.street.trim()) return "Please enter your street address";
  if (!form.city.trim()) return "Please enter your city";
  if (!/^[0-9]{6}$/.test(form.pincode)) return "Enter a valid 6-digit pincode";
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Address() {
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<AddressFormState>(EMPTY_FORM);

  // ── Data loaders ─────────────────────────────────────────────────────────────

  const loadCartData = useCallback((email: string) => {
    try {
      const checkoutCart = localStorage.getItem("checkoutCart");
      const checkoutTotal = localStorage.getItem("checkoutTotal");

      if (checkoutCart && checkoutCart !== "[]") {
        const parsed: CartItem[] = JSON.parse(checkoutCart);
        setCartItems(parsed);
        setTotal(parseFloat(checkoutTotal ?? "0"));
        return;
      }

      const cart = userDataService.getUserCart(email);
      setCartItems(cart);
      setTotal(
        cart.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0)
      );
    } catch {
      setCartItems([]);
      setTotal(0);
    }
  }, []);

  const loadAddressesForUser = useCallback((email: string) => {
    try {
      const userAddresses = userDataService.getUserAddresses(email);
      setAddresses(userAddresses);

      const savedId = userDataService.getSelectedAddressId(email);
      if (savedId && userAddresses.length > 0) {
        const index = userAddresses.findIndex(
          (addr) => String(addr.id) === savedId
        );
        if (index !== -1) setSelectedIndex(index);
      }
    } catch {
      setAddresses([]);
    }
  }, []);

  // ── Auth ─────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser?.email) {
        navigate("/login");
        return;
      }

      setCurrentUser(firebaseUser.email);
      setUserEmail(firebaseUser.email);
      loadAddressesForUser(firebaseUser.email);
      loadCartData(firebaseUser.email);
      setLoading(false);
    });

    return unsubscribe;
  }, [navigate, loadAddressesForUser, loadCartData]);

  // ── Persist helpers ───────────────────────────────────────────────────────────

  const persistSelected = (email: string, address: SavedAddress | null) => {
    if (address) {
      userDataService.setSelectedAddressId(email, String(address.id));
    } else {
      userDataService.clearSelectedAddressId(email);
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const saveAddress = () => {
    if (!userEmail) {
      navigate("/login");
      return;
    }

    const error = validateForm(form);
    if (error) {
      alert(error);
      return;
    }

    const newAddress: SavedAddress = {
      ...form,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };

    const updated = [...addresses, newAddress];
    setAddresses(updated);

    const saved = userDataService.saveUserAddresses(userEmail, updated);
    if (!saved) {
      alert("Error saving address. Please try again.");
      return;
    }

    const newIndex = updated.length - 1;
    setSelectedIndex(newIndex);
    persistSelected(userEmail, newAddress);
    setForm(EMPTY_FORM);
    alert("Address saved successfully!");
  };

  const deleteAddress = (index: number) => {
    if (!userEmail) return;

    const updated = addresses.filter((_, i) => i !== index);
    setAddresses(updated);
    userDataService.saveUserAddresses(userEmail, updated);

    if (selectedIndex === index) {
      setSelectedIndex(null);
      persistSelected(userEmail, null);
    } else if (selectedIndex !== null && selectedIndex > index) {
      const newIndex = selectedIndex - 1;
      setSelectedIndex(newIndex);
      persistSelected(userEmail, updated[newIndex]);
    }

    alert("Address deleted successfully!");
  };

  const selectAddress = (index: number) => {
    if (!userEmail) return;
    setSelectedIndex(index);
    persistSelected(userEmail, addresses[index]);
  };

  const continueCheckout = () => {
    if (addresses.length === 0) {
      alert("Please add a delivery address first");
      return;
    }
    if (selectedIndex === null) {
      alert("Please select a delivery address");
      return;
    }
    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add items to cart first.");
      navigate("/shop");
      return;
    }

    const addr = addresses[selectedIndex];
    localStorage.setItem(
      "customerDetails",
      JSON.stringify({
        name: addr.name,
        phone: addr.phone,
        email: addr.email,
        address: `${addr.doorNo}, ${addr.street}, ${addr.city} - ${addr.pincode}`,
      })
    );
    localStorage.setItem("paymentCart", JSON.stringify(cartItems));
    localStorage.setItem("paymentTotal", total.toString());

    navigate("/payment");
  };

  const totalItems = cartItems.reduce(
    (sum, item) => sum + (item.quantity ?? 1),
    0
  );

  // ── Render ────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your address book...</p>
      </div>
    );
  }

  return (
    <div className="address-page">
      <h1>Choose Delivery Address</h1>

      <div className="user-info-banner">
        <p>
          Logged in as: <strong>{userEmail}</strong>
        </p>
      </div>

      {cartItems.length === 0 && (
        <div className="cart-warning">
          <p>⚠️ Your cart is empty. Please add items before proceeding.</p>
          <button onClick={() => navigate("/shop")} className="shop-now-btn">
            Shop Now
          </button>
        </div>
      )}

      {/* Address List */}
      <div className="address-list">
        {addresses.length === 0 ? (
          <div className="no-addresses">
            <p>No addresses saved yet. Add your first address below!</p>
          </div>
        ) : (
          addresses.map((addr, index) => (
            <div
              key={addr.id}
              className={`address-card ${
                selectedIndex === index ? "active" : ""
              }`}
              onClick={() => selectAddress(index)}
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
              <small className="address-date">
                Added: {new Date(addr.createdAt).toLocaleDateString()}
              </small>
            </div>
          ))
        )}
      </div>

      {/* Add New Address Form */}
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
          <p>Total Items: {totalItems}</p>
          {cartItems.slice(0, 3).map((item, idx) => (
            <div key={idx} className="summary-item">
              {/* FIX: item.name doesn't exist on CartItem — use title only */}
              <span>{item.title ?? "Unnamed Item"}</span>
              <span>
                ₹{item.price} × {item.quantity ?? 1}
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