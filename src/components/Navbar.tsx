import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getCart } from "../cart";
import EditProfile from "./EditProfile";
import "./Navbar.css";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userName, setUserName] = useState<string>("");
  const [userInitials, setUserInitials] = useState<string>("");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<"top" | "bottom">(
    "top"
  );
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
        const nameParts = name.trim().split(" ");
        const initials =
          nameParts.length === 1
            ? nameParts[0].charAt(0).toUpperCase()
            : nameParts[0].charAt(0).toUpperCase() +
              nameParts[nameParts.length - 1].charAt(0).toUpperCase();
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
    setCartCount(getCart().length);
  }, []);

  // Function to calculate dropdown position
  const calculateDropdownPosition = () => {
    if (window.innerWidth <= 768) {
      const avatarElement = document.querySelector(".avatar-initials");
      if (avatarElement) {
        const rect = avatarElement.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const dropdownHeight = 340; // Approximate dropdown height

        if (spaceBelow < dropdownHeight) {
          setDropdownPosition("bottom");
        } else {
          setDropdownPosition("top");
        }
      }
    }
  };

  // Handle avatar click
  const handleAvatarClick = () => {
    if (!dropdownOpen) {
      calculateDropdownPosition();
    }
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen) {
        const dropdown = document.querySelector(".dropdown");
        const avatar = document.querySelector(".avatar-initials");
        if (
          dropdown &&
          avatar &&
          !dropdown.contains(event.target as Node) &&
          !avatar.contains(event.target as Node)
        ) {
          setDropdownOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const logout = async () => {
    await signOut(auth);
    localStorage.clear();
    setDropdownOpen(false);
    setMobileNavOpen(false);
    navigate("/");
  };

  const handleNameUpdate = (newName: string) => {
    setUserName(newName);
    const nameParts = newName.trim().split(" ");
    const initials =
      nameParts.length === 1
        ? nameParts[0].charAt(0).toUpperCase()
        : nameParts[0].charAt(0).toUpperCase() +
          nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    setUserInitials(initials);
  };

  const getUserEmail = () =>
    localStorage.getItem("userEmail") || user?.email || "";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const goTo = (path: string) => {
    setMobileNavOpen(false);
    navigate(path);
  };

  return (
    <>
      <header className="navbar">
        {/* ── LOGO (top-left) with skull icon and text ── */}
        <div className="logo" onClick={() => navigate("/")}>
          <span className="skull-icon">💀</span>
          <span className="logo-text">Skull Cart</span>
        </div>

        {/* ── DESKTOP CENTER LINKS ── */}
        <nav className="desktop-menu">
          <a onClick={() => navigate("/shop")}>Shop</a>
          <a onClick={() => navigate("/deals")}>Deals</a>
          <a onClick={() => navigate("/")}>About Us</a>{" "}
          {/* Updated: navigates to homepage */}
          <a onClick={() => navigate("/blog")}>Blog</a>
        </nav>

        {/* ── TOP-RIGHT ACTIONS ── */}
        <div className="actions">
          {/* Search (desktop only) */}
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

          {/* Cart icon */}
          <div className="cart-icon" onClick={() => navigate("/cart")}>
            🛒
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </div>

          {/* Profile avatar / Login */}
          {user ? (
            <div className="profile">
              <div className="avatar-initials" onClick={handleAvatarClick}>
                {userInitials}
              </div>
              {dropdownOpen && (
                <div className={`dropdown dropdown-${dropdownPosition}`}>
                  <div className="dropdown-user-info">
                    <div className="dropdown-avatar">{userInitials}</div>
                    <div className="dropdown-user-details">
                      <p className="dropdown-name">{userName}</p>
                      <p className="dropdown-email">{getUserEmail()}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <button
                    onClick={() => {
                      setShowEditProfile(true);
                      setDropdownOpen(false);
                    }}
                  >
                    ✏️ Edit Profile
                  </button>
                  <button onClick={() => navigate("/orders")}>📦 Orders</button>
                  <button onClick={logout}>🚪 Logout</button>
                </div>
              )}
            </div>
          ) : (
            <button className="login-btn" onClick={() => navigate("/login")}>
              Login
            </button>
          )}

          {/* Hamburger — mobile only */}
          <button
            className="hamburger"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* ── MOBILE SLIDE-IN DRAWER ── */}
      {mobileNavOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <nav className={`mobile-drawer ${mobileNavOpen ? "open" : ""}`}>
        <button
          className="drawer-close"
          onClick={() => setMobileNavOpen(false)}
        >
          ✕
        </button>

        <a className="drawer-link" onClick={() => goTo("/shop")}>
          Shop
        </a>
        <a className="drawer-link" onClick={() => goTo("/deals")}>
          Deals
        </a>
        <a className="drawer-link" onClick={() => goTo("/")}>
          {" "}
          {/* Updated: navigates to homepage */}
          About Us
        </a>

        {user && (
          <button className="drawer-logout" onClick={logout}>
            🚪 Logout
          </button>
        )}

        {!user && (
          <a className="drawer-link" onClick={() => goTo("/login")}>
            🔑 Login
          </a>
        )}
      </nav>

      {showEditProfile && (
        <EditProfile
          onClose={() => setShowEditProfile(false)}
          onNameUpdated={handleNameUpdate}
        />
      )}
    </>
  );
}
