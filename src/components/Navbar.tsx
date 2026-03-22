import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getCart } from "../cart";
import EditProfile from "./EditProfile";
import "./Navbar.css";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userName, setUserName] = useState<string>("");
  const [userInitials, setUserInitials] = useState<string>("");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);

      if (u) {
        const storedName = localStorage.getItem("userName");
        let name = "";

        if (storedName && storedName !== "null" && storedName !== "undefined") {
          name = storedName;
        } else if (u.displayName) {
          name = u.displayName;
          localStorage.setItem("userName", u.displayName);
        } else if (u.email) {
          const emailName = u.email.split("@")[0];
          name = emailName.charAt(0).toUpperCase() + emailName.slice(1);
          localStorage.setItem("userName", name);
        } else {
          name = "User";
        }

        setUserName(name);

        // Generate initials from name
        const nameParts = name.trim().split(" ");
        let initials = "";

        if (nameParts.length === 1) {
          initials = nameParts[0].charAt(0).toUpperCase();
        } else {
          initials =
            nameParts[0].charAt(0).toUpperCase() +
            nameParts[nameParts.length - 1].charAt(0).toUpperCase();
        }

        setUserInitials(initials);
        localStorage.setItem("userEmail", u.email || "");
      } else {
        setUserName("");
        setUserInitials("");
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const cart = getCart();
    setCartCount(cart.length);
  }, []);

  const logout = async () => {
    await signOut(auth);
    localStorage.clear();
    setMenuOpen(false);
    navigate("/");
  };

  const handleNameUpdate = (newName: string) => {
    setUserName(newName);

    const nameParts = newName.trim().split(" ");
    let initials = "";

    if (nameParts.length === 1) {
      initials = nameParts[0].charAt(0).toUpperCase();
    } else {
      initials =
        nameParts[0].charAt(0).toUpperCase() +
        nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    }

    setUserInitials(initials);
  };

  const getUserEmail = () => {
    return localStorage.getItem("userEmail") || user?.email || "";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header className="navbar">
        <div
          className="logo"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          💀 <span>Skull Cart</span>
        </div>

        <nav className="menu">
          <a onClick={() => navigate("/shop")}>Shop</a>
          <a>Deals</a>
          <a>About Us</a>
          <a>Blog</a>
        </nav>

        <div className="actions">
          {/* Expanded Search Bar */}
          <div className={`search-container ${searchOpen ? "expanded" : ""}`}>
            {!searchOpen ? (
              <span
                className="search-icon"
                onClick={() => setSearchOpen(true)}
              ></span>
            ) : (
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="search-submit"></button>
                <button
                  type="button"
                  className="search-close"
                  onClick={() => setSearchOpen(false)}
                >
                  ✕
                </button>
              </form>
            )}
          </div>

          <div className="cart" onClick={() => navigate("/cart")}>
            🛒
            <span className="cart-count">{cartCount}</span>
          </div>

          {user ? (
            <div className="profile">
              <div
                className="avatar-initials"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {userInitials}
              </div>

              {menuOpen && (
                <div className="dropdown">
                  <div className="dropdown-user-info">
                    <div className="dropdown-avatar">{userInitials}</div>
                    <div className="dropdown-user-details">
                      <p className="dropdown-name">{userName}</p>
                      <p className="dropdown-email">{getUserEmail()}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button onClick={() => setShowEditProfile(true)}>
                    ✏️ Edit Profile
                  </button>
                  <button onClick={() => navigate("/orders")}>📦 Orders</button>
                  <button onClick={logout}>🚪 Logout</button>
                </div>
              )}
            </div>
          ) : (
            <button className="login" onClick={() => navigate("/login")}>
              Login
            </button>
          )}
        </div>
      </header>

      {showEditProfile && (
        <EditProfile
          onClose={() => setShowEditProfile(false)}
          onNameUpdated={handleNameUpdate}
        />
      )}
    </>
  );
}
